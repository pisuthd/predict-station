'use client'

import { useState, useEffect } from 'react'
import { useDAppKit } from '@mysten/dapp-kit-react'
import { usePredict } from '../../../../hooks'
import type { Market } from '../../../../hooks'

const WHITE = '#ffffff'
const MUTED = 'rgba(180,200,255,0.6)'
const GREEN = '#22c55e'
const RED = '#ef4444'
const CYAN = '#3EC4C0'

interface TradeTradeProps {
  market: Market
  selectedStrike: number
}

export function TradeTrade({ market, selectedStrike }: TradeTradeProps) {
  const dAppKit = useDAppKit()
  const { manager, mintPrice, fetchMintPrice, mint, error } = usePredict()
  const [direction, setDirection] = useState<'up' | 'down'>('up')
  const [quantity, setQuantity] = useState('10')
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  // Fetch mint price when strike changes
  useEffect(() => {
    if (market.oracle_id && selectedStrike > 0) {
      fetchMintPrice(market.oracle_id, selectedStrike)
    }
  }, [market.oracle_id, selectedStrike, fetchMintPrice])

  // Round quantity to 2 decimals, min 0.01
  const getRoundedQuantity = (val: string): number => {
    const num = parseFloat(val || '0')
    if (isNaN(num) || num <= 0) return 0
    return Math.max(0.01, Math.round(num * 100) / 100)
  }

  const handleMint = async () => {
    if (!manager) return

    const roundedQty = getRoundedQuantity(quantity)
    if (roundedQty < 0.01) {
      setLocalError('Minimum quantity is 0.01')
      return
    }

    setLoading(true)
    setLocalError(null)

    try {
      await mint(
        dAppKit.signAndExecuteTransaction,
        market.oracle_id,
        market.expiryMs,
        selectedStrike,
        direction,
        roundedQty
      )
      setQuantity('10')
    } catch (e: any) {
      setLocalError(e.message || 'Transaction failed')
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
      {!manager ? (
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

      {(localError || error) && (
        <div style={{ marginTop: 16, padding: 12, background: 'rgba(239,68,68,0.1)', borderRadius: 8, color: RED, fontSize: 13 }}>
          {localError || error}
        </div>
      )}
    </div>
  )
}