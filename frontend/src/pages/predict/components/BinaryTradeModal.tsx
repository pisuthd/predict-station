'use client'

import { useState, useEffect } from 'react'
import { useCurrentAccount } from '@mysten/dapp-kit-react'
import { ConnectButton } from '@mysten/dapp-kit-react/ui'
import { ModalWrapper } from '../../../components/ModalWrapper'
import { usePredict } from '../../../hooks'
import type { Direction } from './PriceChart2'
import type { Market } from '../../../hooks'

const WHITE = '#ffffff'
const MUTED = 'rgba(180,200,255,0.6)'
const CYAN = '#3EC4C0'
const GREEN = '#22c55e'
const RED = '#ef4444'
const NAVY = '#0a0a1a'

interface BinaryTradeModalProps {
  isOpen: boolean
  onClose: () => void
  market: Market
  strike: number
}

export function BinaryTradeModal({
  isOpen,
  onClose,
  market,
  strike,
}: BinaryTradeModalProps) {
  const account = useCurrentAccount()
  const { manager, mintPrice, fetchMintPrice, mint, error } = usePredict()
  const [direction, setDirection] = useState<Direction>('up')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  // Fetch mint price when strike changes
  useEffect(() => {
    if (market.oracle_id && strike > 0) {
      fetchMintPrice(market.oracle_id, strike)
    }
  }, [market.oracle_id, strike, fetchMintPrice])

  const upProb = mintPrice?.up ?? 50
  const downProb = mintPrice?.down ?? 50
  const selectedProb = direction === 'up' ? upProb : downProb
  const roundedAmount = parseFloat(amount) || 0
  const potentialPayout = roundedAmount > 0 ? (roundedAmount / selectedProb) * 100 : 0

  const handleTrade = async () => {
    if (!manager || roundedAmount < 0.01) return

    setLoading(true)
    setLocalError(null)

    try {
      await mint(
        (tx: any) => (window as any).signAndExecuteTransaction({ transaction: tx }),
        market.oracle_id,
        market.expiryMs,
        strike,
        direction,
        roundedAmount
      )
      setAmount('')
      onClose()
    } catch (e: any) {
      setLocalError(e.message || 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
      }}>
        <div>
          <h2 style={{
            color: WHITE,
            fontSize: 18,
            fontWeight: 700,
            margin: 0,
            fontFamily: "'Space Mono', monospace",
          }}>
            Predict {market.name}
          </h2>
          <p style={{
            color: MUTED,
            fontSize: 12,
            margin: '4px 0 0',
          }}>
            Strike: ${strike.toLocaleString()} • {selectedProb.toFixed(1)}% implied
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: 'none',
            borderRadius: 8,
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: MUTED,
            fontSize: 18,
          }}
        >
          ×
        </button>
      </div>

      {/* Wallet Check */}
      {!account ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <ConnectButton />
          <p style={{ color: MUTED, fontSize: 12, marginTop: 12 }}>
            Connect wallet to trade
          </p>
        </div>
      ) : !manager ? (
        <div style={{ textAlign: 'center', padding: '20px 0', color: MUTED }}>
          Create a manager first in Overview tab
        </div>
      ) : (
        <>
          {/* Direction Toggle */}
          <div style={{
            display: 'flex',
            gap: 8,
            marginBottom: 20,
          }}>
            <button
              onClick={() => setDirection('up')}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 8,
                border: `2px solid ${direction === 'up' ? GREEN : 'rgba(255,255,255,0.1)'}`,
                background: direction === 'up' ? 'rgba(34,197,94,0.15)' : 'transparent',
                color: direction === 'up' ? GREEN : MUTED,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'Space Mono', monospace",
                transition: 'all 0.2s ease',
              }}
            >
              ▲ UP ({upProb.toFixed(1)}%)
            </button>
            <button
              onClick={() => setDirection('down')}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 8,
                border: `2px solid ${direction === 'down' ? RED : 'rgba(255,255,255,0.1)'}`,
                background: direction === 'down' ? 'rgba(239,68,68,0.15)' : 'transparent',
                color: direction === 'down' ? RED : MUTED,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'Space Mono', monospace",
                transition: 'all 0.2s ease',
              }}
            >
              ▼ DOWN ({downProb.toFixed(1)}%)
            </button>
          </div>

          {/* Amount Input */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              color: MUTED,
              fontSize: 11,
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Amount (DUSDC)
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)',
              overflow: 'hidden',
            }}>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10"
                step="0.01"
                min="0.01"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  color: WHITE,
                  fontSize: 16,
                  fontFamily: "'Space Mono', monospace",
                  outline: 'none',
                }}
              />
              <span style={{
                padding: '12px 16px',
                color: MUTED,
                fontSize: 14,
                fontWeight: 600,
              }}>
                DUSDC
              </span>
            </div>
          </div>

          {/* Payout Display */}
          {roundedAmount > 0 && (
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 8,
              padding: 16,
              marginBottom: 20,
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}>
                <span style={{ color: MUTED, fontSize: 12 }}>Implied Probability</span>
                <span style={{ color: WHITE, fontSize: 12, fontWeight: 600 }}>{selectedProb.toFixed(1)}%</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}>
                <span style={{ color: MUTED, fontSize: 12 }}>Potential Payout</span>
                <span style={{ color: CYAN, fontSize: 12, fontWeight: 600 }}>
                  {potentialPayout.toFixed(2)} DUSDC
                </span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}>
                <span style={{ color: MUTED, fontSize: 12 }}>Profit if Win</span>
                <span style={{ color: GREEN, fontSize: 12, fontWeight: 600 }}>
                  +{(potentialPayout - roundedAmount).toFixed(2)} DUSDC
                </span>
              </div>
            </div>
          )}

          {/* Error Display */}
          {(localError || error) && (
            <div style={{ marginBottom: 16, padding: 12, background: 'rgba(239,68,68,0.1)', borderRadius: 8, color: RED, fontSize: 12 }}>
              {localError || error}
            </div>
          )}

          {/* Confirm Button */}
          <button
            onClick={handleTrade}
            disabled={loading || roundedAmount < 0.01}
            style={{
              width: '100%',
              padding: '14px 24px',
              borderRadius: 8,
              border: 'none',
              background: roundedAmount >= 0.01 ? (direction === 'up' ? GREEN : RED) : 'rgba(255,255,255,0.1)',
              color: roundedAmount >= 0.01 ? NAVY : MUTED,
              fontSize: 14,
              fontWeight: 700,
              cursor: loading || roundedAmount < 0.01 ? 'not-allowed' : 'pointer',
              fontFamily: "'Space Mono', monospace",
              transition: 'all 0.2s ease',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Processing...' : `Mint Position at ${selectedProb.toFixed(1)}%`}
          </button>
        </>
      )}
    </ModalWrapper>
  )
}