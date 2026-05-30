'use client'

import { useState, useEffect, useCallback } from 'react'
import { useCurrentAccount } from '@mysten/dapp-kit-react'

const SERVER = 'https://predict-server.testnet.mystenlabs.com'
const TESTNET_RPC = 'https://fullnode.testnet.sui.io'

export const PRICE_SCALE = 1_000_000_000n
export const DUSDC_SCALE = 1_000_000n

export interface ManagerData {
  manager_id: string
  owner: string
  balance?: string
}

export interface ManagerSummary {
  owner: string
  balances: { balance: string; coin_type: string }[]
  open_positions: number
  awaiting_settlement_positions: number
  open_exposure: string
  account_value: string
  realized_pnl: string
  unrealized_pnl: string
}

export interface Position {
  oracle_id: string
  expiry: number
  strike: string
  is_up: boolean
  open_quantity: string
  average_entry_price: string
  mark_price: string | null
  unrealized_pnl: string
  underlying_asset: string
}

export interface AskBounds {
  lower: string
  upper: string
  ask: string
  bid: string
}

// Helper to call Sui RPC
async function suiRpcCall(method: string, params: any): Promise<any> {
  const response = await fetch(TESTNET_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params,
    }),
  })
  return response.json()
}

interface UsePredictReturn {
  manager: ManagerData | null
  summary: ManagerSummary | null
  positions: Position[]
  mintPrice: { up: number; down: number } | null
  loading: boolean
  error: string | null
  createManager: (signAndExecute: any) => Promise<void>
  deposit: (signAndExecute: any, amount: string) => Promise<void>
  withdraw: (signAndExecute: any, amount: string) => Promise<void>
  mint: (signAndExecute: any, oracleId: string, expiryMs: number, strike: number, direction: 'up' | 'down', amount: number) => Promise<void>
  fetchMintPrice: (oracleId: string, strike: number) => void
  refreshData: () => Promise<void>
}

export function usePredict(): UsePredictReturn {
  const account = useCurrentAccount()
  const [manager, setManager] = useState<ManagerData | null>(null)
  const [summary, setSummary] = useState<ManagerSummary | null>(null)
  const [positions, setPositions] = useState<Position[]>([])
  const [mintPrice, setMintPrice] = useState<{ up: number; down: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const DUSDC_TYPE = '0xe95040085976bfd54a1a07225cd46c8a2b4e8e2b6732f140a0fc49850ba73e1a::dusdc::DUSDC'
  const PREDICT_PACKAGE = '0xf5ea2b3749c65d6e56507cc35388719aadb28f9cab873696a2f8687f5c785138'

  // Fetch manager and summary
  const refreshData = useCallback(async () => {
    if (!account) return

    try {
      const res = await fetch(`${SERVER}/managers`)
      const data = await res.json()
      const userManager = data.find((m: ManagerData) => m.owner === account.address)

      if (userManager) {
        setManager(userManager)

        // Fetch summary
        try {
          const summaryRes = await fetch(`${SERVER}/managers/${userManager.manager_id}/summary`)
          const summaryData = await summaryRes.json()
          setSummary(summaryData)
        } catch (e) {
          console.error('Failed to fetch summary:', e)
        }

        // Fetch positions
        try {
          const posRes = await fetch(`${SERVER}/managers/${userManager.manager_id}/positions/summary`)
          const posData = await posRes.json()
          setPositions(posData.filter((p: Position) => Number(p.open_quantity) > 0))
        } catch (e) {
          console.error('Failed to fetch positions:', e)
        }
      } else {
        setManager(null)
        setSummary(null)
        setPositions([])
      }
    } catch (e) {
      console.error('Failed to find manager:', e)
    }
  }, [account])

  // Initial fetch and polling
  useEffect(() => {
    refreshData()
    const interval = setInterval(refreshData, 5000)
    return () => clearInterval(interval)
  }, [account, refreshData])

  const createManager = async (signAndExecute: any) => {
    setError(null)
    try {
      const { Transaction } = await import('@mysten/sui/transactions')
      const tx = new Transaction()
      tx.moveCall({
        target: `${PREDICT_PACKAGE}::predict::create_manager`,
        arguments: [],
      })

      const result = await signAndExecute({ transaction: tx })
      if (result.FailedTransaction) {
        throw new Error(result.FailedTransaction.status.error?.message || 'Failed')
      }

      // Refresh after creation
      await refreshData()
    } catch (e: any) {
      setError(e.message)
      throw e
    }
  }

  const deposit = async (signAndExecute: any, amount: string) => {
    if (!account || !manager) return

    setError(null)
    try {
      const coinsResult = await suiRpcCall('suix_getCoins', [account.address, DUSDC_TYPE])

      if (!coinsResult.result?.data?.length) {
        throw new Error('No DUSDC found')
      }

      const { Transaction } = await import('@mysten/sui/transactions')
      const coins = coinsResult.result.data
      const depositAmount = BigInt(Math.round(parseFloat(amount) * 100) / 100 * Number(DUSDC_SCALE))

      const tx = new Transaction()
      const primaryCoin = tx.object(coins[0].coinObjectId)
      if (coins.length > 1) {
        tx.mergeCoins(primaryCoin, coins.slice(1).map((c: any) => tx.object(c.coinObjectId)))
      }

      const [splitCoin] = tx.splitCoins(primaryCoin, [tx.pure.u64(depositAmount)])
      tx.moveCall({
        target: `${PREDICT_PACKAGE}::predict_manager::deposit`,
        typeArguments: [DUSDC_TYPE],
        arguments: [tx.object(manager.manager_id), splitCoin],
      })

      const result = await signAndExecute({ transaction: tx })
      if (result.FailedTransaction) {
        throw new Error(result.FailedTransaction.status.error?.message || 'Failed')
      }

      await refreshData()
    } catch (e: any) {
      setError(e.message)
      throw e
    }
  }

  const withdraw = async (signAndExecute: any, amount: string) => {
    if (!account || !manager) return

    setError(null)
    try {
      const { Transaction } = await import('@mysten/sui/transactions')
      const withdrawAmount = BigInt(Math.round(parseFloat(amount) * 100) / 100 * Number(DUSDC_SCALE))

      const tx = new Transaction()
      tx.moveCall({
        target: `${PREDICT_PACKAGE}::predict_manager::withdraw`,
        typeArguments: [DUSDC_TYPE],
        arguments: [tx.object(manager.manager_id), tx.pure.u64(withdrawAmount)],
      })

      const result = await signAndExecute({ transaction: tx })
      if (result.FailedTransaction) {
        throw new Error(result.FailedTransaction.status.error?.message || 'Failed')
      }

      await refreshData()
    } catch (e: any) {
      setError(e.message)
      throw e
    }
  }

  const mint = async (
    signAndExecute: any,
    oracleId: string,
    expiryMs: number,
    strike: number,
    direction: 'up' | 'down',
    amount: number
  ) => {
    if (!account || !manager) return

    setError(null)
    try {
      const { Transaction } = await import('@mysten/sui/transactions')
      const PREDICT_OBJECT_ID = '0xc8736204d12f0a7277c86388a68bf8a194b0a14c5538ad13f22cbd8e2a38028a'
      const CLOCK = '0x6'

      const tx = new Transaction()
      const strikeScaled = BigInt(Math.round(strike)) * PRICE_SCALE
      const qty = BigInt(Math.round(amount)) * DUSDC_SCALE

      const keyFn = direction === 'up' ? 'up' : 'down'
      const key = tx.moveCall({
        target: `${PREDICT_PACKAGE}::market_key::${keyFn}`,
        arguments: [
          tx.pure.id(oracleId),
          tx.pure.u64(expiryMs),
          tx.pure.u64(strikeScaled),
        ],
      })

      tx.moveCall({
        target: `${PREDICT_PACKAGE}::predict::mint`,
        typeArguments: [DUSDC_TYPE],
        arguments: [
          tx.object(PREDICT_OBJECT_ID),
          tx.object(manager.manager_id),
          tx.object(oracleId),
          key,
          tx.pure.u64(qty),
          tx.object(CLOCK),
        ],
      })

      const result = await signAndExecute({ transaction: tx })
      if (result.FailedTransaction) {
        throw new Error(result.FailedTransaction.status.error?.message || 'Failed')
      }

      await refreshData()
    } catch (e: any) {
      setError(e.message)
      throw e
    }
  }

  const fetchMintPrice = (oracleId: string, strike: number) => {
    if (!oracleId || strike <= 0) return

    fetch(`${SERVER}/oracles/${oracleId}/ask-bounds?strike=${strike}`)
      .then(res => res.json())
      .then((data: AskBounds) => {
        const upPrice = Number(BigInt(data.ask) / BigInt(1e7)) / 100
        const downPrice = 100 - upPrice
        setMintPrice({ up: upPrice, down: downPrice })
      })
      .catch(e => {
        console.error('Failed to fetch mint price:', e)
        setMintPrice({ up: 50, down: 50 })
      })
  }

  return {
    manager,
    summary,
    positions,
    mintPrice,
    loading,
    error,
    createManager,
    deposit,
    withdraw,
    mint,
    fetchMintPrice,
    refreshData,
  }
}