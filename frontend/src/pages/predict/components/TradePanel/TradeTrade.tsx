'use client'

import { useState, useEffect } from 'react'
import { useDAppKit, useCurrentAccount } from '@mysten/dapp-kit-react'
import { Transaction } from '@mysten/sui/transactions'
import type { Market } from '../../../../hooks'

const WHITE = '#ffffff'
const MUTED = 'rgba(180,200,255,0.6)'
const GREEN = '#22c55e'
const RED = '#ef4444'
const CYAN = '#3EC4C0'

const PREDICT_PACKAGE = '0xf5ea2b3749c65d6e56507cc35388719aadb28f9cab873696a2f8687f5c785138'
const PREDICT_OBJECT = '0xc8736204d12f0a7277c86388a68bf8a194b0a14c5538ad13f22cbd8e2a38028a'
const DUSDC_TYPE = '0xe95040085976bfd54a1a07225cd46c8a2b4e8e2b6732f140a0fc49850ba73e1a::dusdc::DUSDC'
const CLOCK = '0x6'
const PRICE_SCALE = 1_000_000_000n
const DUSDC_SCALE = 1_000_000n

const SERVER = 'https://predict-server.testnet.mystenlabs.com'

interface ManagerData {
  manager_id: string
  owner: string
}

interface AskBounds {
  lower: string
  upper: string
  ask: string
  bid: string
}

interface TradeTradeProps {
  market: Market
  selectedStrike: number
}

export function TradeTrade({ market, selectedStrike }: TradeTradeProps) {
  const dAppKit = useDAppKit()
  const account = useCurrentAccount()
  const [managerId, setManagerId] = useState<string | null>(null)
  const [direction, setDirection] = useState<'up' | 'down'>('up')
  const [quantity, setQuantity] = useState('10')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mintPrice, setMintPrice] = useState<{ up: number; down: number } | null>(null)

  // Find manager
  useEffect(() => {
    if (!account) return

    const findManager = async () => {
      try {
        const res = await fetch(`${SERVER}/managers`)
        const data = await res.json()
        const userManager = data.find((m: ManagerData) => m.owner === account.address)
        if (userManager) {
          setManagerId(userManager.manager_id)
        }
      } catch (e) {
        console.error('Failed to find manager:', e)
      }
    }
    findManager()
  }, [account])

  // Fetch mint price from ask-bounds
  useEffect(() => {
    const fetchMintPrice = async () => {
      try {
        const res = await fetch(`${SERVER}/oracles/${market.oracle_id}/ask-bounds?strike=${selectedStrike}`)
        const data: AskBounds = await res.json()
        
        // UP price from ask (convert from 1e9 to percentage)
        const upPrice = Number(BigInt(data.ask) / BigInt(1e7)) / 100 // 1e9 -> 1e2 for percentage
        const downPrice = 100 - upPrice
        
        setMintPrice({ up: upPrice, down: downPrice })
      } catch (e) {
        console.error('Failed to fetch mint price:', e)
        setMintPrice({ up: 50, down: 50 }) // Fallback
      }
    }
    
    if (market.oracle_id && selectedStrike > 0) {
      fetchMintPrice()
    }
  }, [market.oracle_id, selectedStrike])

  // Round quantity to 2 decimals, min 0.01
  const getRoundedQuantity = (val: string): number => {
    const num = parseFloat(val || '0')
    if (isNaN(num) || num <= 0) return 0
    return Math.max(0.01, Math.round(num * 100) / 100)
  }

  const handleMint = async () => {
    if (!account || !managerId) return

    const roundedQty = getRoundedQuantity(quantity)
    if (roundedQty < 0.01) {
      setError('Minimum quantity is 0.01')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const tx = new Transaction()
      const strikeScaled = BigInt(Math.round(selectedStrike)) * PRICE_SCALE
      // Round to integer for BigInt (0.5 -> 1, 0.99 -> 1, etc.)
      const qty = BigInt(Math.round(roundedQty)) * DUSDC_SCALE

      const keyFn = direction === 'up' ? 'up' : 'down'
      const key = tx.moveCall({
        target: `${PREDICT_PACKAGE}::market_key::${keyFn}`,
        arguments: [
          tx.pure.id(market.oracle_id),
          tx.pure.u64(market.expiryMs),
          tx.pure.u64(strikeScaled),
        ],
      })

      tx.moveCall({
        target: `${PREDICT_PACKAGE}::predict::mint`,
        typeArguments: [DUSDC_TYPE],
        arguments: [
          tx.object(PREDICT_OBJECT),
          tx.object(managerId),
          tx.object(market.oracle_id),
          key,
          tx.pure.u64(qty),
          tx.object(CLOCK),
        ],
      })

      const result = await dAppKit.signAndExecuteTransaction({ transaction: tx })

      if (result.FailedTransaction) {
        throw new Error(result.FailedTransaction.status.error?.message || 'Transaction failed')
      }

      setQuantity('10')
    } catch (e: any) {
      setError(e.message || 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  const roundedQty = getRoundedQuantity(quantity)
  const displayPrice = direction === 'up' ? (mintPrice?.up || 50) : (mintPrice?.down || 50)

  return (
    <div style={{ padding: 20 }}>
      {/* Strike Display */}
      <div style={{
        padding: 16,
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 12,
        marginBottom: 20,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 11, color: MUTED, textTransform: 'uppercase', marginBottom: 4 }}>
          Strike Price
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, color: CYAN, fontFamily: "'Space Mono', monospace" }}>
          ${selectedStrike.toLocaleString()}
        </div>
      </div>

      {/* Direction */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <button
          onClick={() => setDirection('up')}
          style={{
            flex: 1,
            padding: '16px 20px',
            background: direction === 'up' ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.04)',
            border: `2px solid ${direction === 'up' ? GREEN : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 12,
            color: direction === 'up' ? GREEN : MUTED,
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          ▲ UP {mintPrice ? `(${mintPrice.up.toFixed(2)}%)` : ''}
        </button>
        <button
          onClick={() => setDirection('down')}
          style={{
            flex: 1,
            padding: '16px 20px',
            background: direction === 'down' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.04)',
            border: `2px solid ${direction === 'down' ? RED : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 12,
            color: direction === 'down' ? RED : MUTED,
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          ▼ DOWN {mintPrice ? `(${mintPrice.down.toFixed(2)}%)` : ''}
        </button>
      </div>

      {/* Quantity */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 11, color: MUTED, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
          Quantity (DUSDC)
        </label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="10"
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
        <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>
          Min: 0.01, rounds to {roundedQty.toFixed(2)}
        </div>
      </div>

      {/* Cost */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <span style={{ color: MUTED }}>Est. Cost</span>
        <span style={{ fontSize: 18, fontWeight: 700, color: WHITE }}>${roundedQty.toFixed(2)} DUSDC</span>
      </div>

      {/* Mint Button */}
      {!managerId ? (
        <div style={{ textAlign: 'center', color: MUTED }}>
          Create a manager first in Overview tab
        </div>
      ) : (
        <button
          onClick={handleMint}
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px 20px',
            background: direction === 'up' ? GREEN : RED,
            border: 'none',
            borderRadius: 12,
            color: '#0a0a1a',
            fontSize: 16,
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Processing...' : `Mint Position at ${displayPrice.toFixed(2)}%`}
        </button>
      )}

      {error && (
        <div style={{ marginTop: 16, padding: 12, background: 'rgba(239,68,68,0.1)', borderRadius: 8, color: RED, fontSize: 13 }}>
          {error}
        </div>
      )}
    </div>
  )
}