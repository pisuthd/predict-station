'use client'

import { useState, useEffect } from 'react'
import { useDAppKit, useCurrentAccount } from '@mysten/dapp-kit-react'
import { Transaction } from '@mysten/sui/transactions'

const WHITE = '#ffffff'
const MUTED = 'rgba(180,200,255,0.6)'
const GREEN = '#22c55e'
const CYAN = '#3EC4C0'
const RED = '#ef4444'

const PREDICT_PACKAGE = '0xf5ea2b3749c65d6e56507cc35388719aadb28f9cab873696a2f8687f5c785138'
const DUSDC_TYPE = '0xe95040085976bfd54a1a07225cd46c8a2b4e8e2b6732f140a0fc49850ba73e1a::dusdc::DUSDC'

export const PRICE_SCALE = 1_000_000_000n
export const DUSDC_SCALE = 1_000_000n

const SERVER = 'https://predict-server.testnet.mystenlabs.com'
const TESTNET_RPC = 'https://fullnode.testnet.sui.io'

interface CoinData {
  coinObjectId: string
  coinType: string
  balance: string
}

interface ManagerData {
  manager_id: string
  owner: string
  balance?: string
}

interface ManagerSummary {
  owner: string
  balances: { balance: string; coin_type: string }[]
  open_positions: number
  awaiting_settlement_positions: number
  open_exposure: string
  account_value: string
  realized_pnl: string
  unrealized_pnl: string
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

export function TradeOverview() {
  const dAppKit = useDAppKit()
  const account = useCurrentAccount()
  const [manager, setManager] = useState<ManagerData | null>(null)
  const [summary, setSummary] = useState<ManagerSummary | null>(null)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Find manager and fetch summary
  useEffect(() => {
    if (!account) return

    const findManager = async () => {
      try {
        const res = await fetch(`${SERVER}/managers`)
        const data = await res.json()

        const userManager = data.find((m: ManagerData) => m.owner === account.address)

        if (userManager) {
          setManager(userManager)
          
          // Fetch summary for balance
          try {
            const summaryRes = await fetch(`${SERVER}/managers/${userManager.manager_id}/summary`)
            const summaryData = await summaryRes.json()
            setSummary(summaryData)
          } catch (e) {
            console.error('Failed to fetch summary:', e)
          }
        } else {
          setManager(null)
          setSummary(null)
        }
      } catch (e) {
        console.error('Failed to find manager:', e)
      }
    }

    findManager()
    const interval = setInterval(findManager, 5000)
    return () => clearInterval(interval)
  }, [account])

  // Get DUSDC balance
  const getDusdcBalance = (): string => {
    if (!summary?.balances) return '0'
    const dusdcBal = summary.balances.find(b => b.coin_type === DUSDC_TYPE)
    return dusdcBal?.balance || '0'
  }

  const handleCreateManager = async () => {
    setCreating(true)
    setError(null)

    try {
      const tx = new Transaction()
      tx.moveCall({
        target: `${PREDICT_PACKAGE}::predict::create_manager`,
        arguments: [],
      })

      const result = await dAppKit.signAndExecuteTransaction({ transaction: tx })
      if (result.FailedTransaction) {
        throw new Error(result.FailedTransaction.status.error?.message || 'Failed')
      }

      setCreating(false)
    } catch (e: any) {
      setError(e.message)
      setCreating(false)
    }
  }

  const handleDeposit = async () => {
    if (!account || !manager || !amount) return

    setLoading(true)
    setError(null)

    try {
      const coinsResult = await suiRpcCall('suix_getCoins', [account.address, DUSDC_TYPE])
      
      if (!coinsResult.result?.data?.length) {
        throw new Error('No DUSDC found')
      }

      const coins: CoinData[] = coinsResult.result.data
      const depositAmount = BigInt(Math.round(parseFloat(amount) * 100) / 100 * Number(DUSDC_SCALE))

      const tx = new Transaction()

      const primaryCoin = tx.object(coins[0].coinObjectId)
      if (coins.length > 1) {
        tx.mergeCoins(primaryCoin, coins.slice(1).map((c: CoinData) => tx.object(c.coinObjectId)))
      }

      const [splitCoin] = tx.splitCoins(primaryCoin, [tx.pure.u64(depositAmount)])
      tx.moveCall({
        target: `${PREDICT_PACKAGE}::predict_manager::deposit`,
        typeArguments: [DUSDC_TYPE],
        arguments: [tx.object(manager.manager_id), splitCoin],
      })

      const result = await dAppKit.signAndExecuteTransaction({ transaction: tx })
      if (result.FailedTransaction) {
        throw new Error(result.FailedTransaction.status.error?.message || 'Failed')
      }

      setAmount('')
      // Refresh summary
      try {
        const summaryRes = await fetch(`${SERVER}/managers/${manager.manager_id}/summary`)
        const summaryData = await summaryRes.json()
        setSummary(summaryData)
      } catch (e) {
        console.error('Failed to refresh summary:', e)
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async () => {
    if (!account || !manager || !amount) return

    setLoading(true)
    setError(null)

    try {
      const withdrawAmount = BigInt(Math.round(parseFloat(amount) * 100) / 100 * Number(DUSDC_SCALE))

      const tx = new Transaction()
      tx.moveCall({
        target: `${PREDICT_PACKAGE}::predict_manager::withdraw`,
        typeArguments: [DUSDC_TYPE],
        arguments: [tx.object(manager.manager_id), tx.pure.u64(withdrawAmount)],
      })

      const result = await dAppKit.signAndExecuteTransaction({ transaction: tx })
      if (result.FailedTransaction) {
        throw new Error(result.FailedTransaction.status.error?.message || 'Failed')
      }

      setAmount('')
      // Refresh summary
      try {
        const summaryRes = await fetch(`${SERVER}/managers/${manager.manager_id}/summary`)
        const summaryData = await summaryRes.json()
        setSummary(summaryData)
      } catch (e) {
        console.error('Failed to refresh summary:', e)
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const balance = getDusdcBalance()

  return (
    <div style={{ padding: 20 }}>
      {!manager ? (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: MUTED, marginBottom: 20 }}>No Predict Manager found</p>
          <button
            onClick={handleCreateManager}
            disabled={creating}
            style={{
              padding: '14px 24px',
              background: CYAN,
              border: 'none',
              borderRadius: 10,
              color: '#0a0a1a',
              fontSize: 14,
              fontWeight: 700,
              cursor: creating ? 'not-allowed' : 'pointer',
            }}
          >
            {creating ? 'Creating...' : 'Create Predict Manager'}
          </button>
          <p style={{ color: MUTED, fontSize: 11, marginTop: 12 }}>
            Auto-detects manager after creation
          </p>
        </div>
      ) : (
        <div>
          {/* Summary Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
            marginBottom: 20,
          }}>
            <div style={{
              padding: 16,
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 12,
            }}>
              <div style={{ fontSize: 10, color: MUTED, textTransform: 'uppercase', marginBottom: 4 }}>
                DUSDC Balance
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: WHITE, fontFamily: "'Space Mono', monospace" }}>
                ${(Number(balance) / Number(DUSDC_SCALE)).toLocaleString()}
              </div>
            </div>
            <div style={{
              padding: 16,
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 12,
            }}>
              <div style={{ fontSize: 10, color: MUTED, textTransform: 'uppercase', marginBottom: 4 }}>
                Open Positions
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: WHITE, fontFamily: "'Space Mono', monospace" }}>
                {summary?.open_positions ?? 0}
              </div>
            </div>
            <div style={{
              padding: 16,
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 12,
            }}>
              <div style={{ fontSize: 10, color: MUTED, textTransform: 'uppercase', marginBottom: 4 }}>
                uPnL
              </div>
              <div style={{ 
                fontSize: 20, 
                fontWeight: 700, 
                color: Number(summary?.unrealized_pnl || 0) >= 0 ? GREEN : RED, 
                fontFamily: "'Space Mono', monospace" 
              }}>
                {Number(summary?.unrealized_pnl || 0) >= 0 ? '+' : ''}
                ${(Number(summary?.unrealized_pnl || 0) / Number(DUSDC_SCALE)).toFixed(2)}
              </div>
            </div>
            <div style={{
              padding: 16,
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 12,
            }}>
              <div style={{ fontSize: 10, color: MUTED, textTransform: 'uppercase', marginBottom: 4 }}>
                Account Value
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: WHITE, fontFamily: "'Space Mono', monospace" }}>
                ${(Number(summary?.account_value || 0) / Number(DUSDC_SCALE)).toLocaleString()}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: MUTED, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              Amount (DUSDC)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              step="0.01"
              min="0.01"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                color: WHITE,
                fontSize: 16,
                fontFamily: "'Space Mono', monospace",
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={handleDeposit}
              disabled={loading || !amount}
              style={{
                flex: 1,
                padding: '14px 20px',
                background: GREEN,
                border: 'none',
                borderRadius: 10,
                color: '#0a0a1a',
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              Deposit
            </button>
            <button
              onClick={handleWithdraw}
              disabled={loading || !amount}
              style={{
                flex: 1,
                padding: '14px 20px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                color: WHITE,
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              Withdraw
            </button>
          </div>
        </div>
      )}

      {error && (
        <div style={{ marginTop: 16, padding: 12, background: 'rgba(239,68,68,0.1)', borderRadius: 8, color: RED, fontSize: 13 }}>
          {error}
        </div>
      )}
    </div>
  )
}