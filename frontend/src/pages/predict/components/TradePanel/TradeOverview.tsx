'use client'

import { useState } from 'react'
import { useDAppKit } from '@mysten/dapp-kit-react'
import { usePredict, DUSDC_SCALE } from '../../../../hooks'

const WHITE = '#ffffff'
const MUTED = 'rgba(180,200,255,0.6)'
const GREEN = '#22c55e'
const CYAN = '#3EC4C0'
const RED = '#ef4444'

export function TradeOverview() {
  const dAppKit = useDAppKit()
  const { manager, summary, createManager, deposit, withdraw, error } = usePredict()
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleCreateManager = async () => {
    setCreating(true)
    setLocalError(null)

    try {
      await createManager(dAppKit.signAndExecuteTransaction)
    } catch (e: any) {
      setLocalError(e.message)
    } finally {
      setCreating(false)
    }
  }

  const handleDeposit = async () => {
    if (!amount) return

    setLoading(true)
    setLocalError(null)

    try {
      await deposit(dAppKit.signAndExecuteTransaction, amount)
      setAmount('')
    } catch (e: any) {
      setLocalError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async () => {
    if (!amount) return

    setLoading(true)
    setLocalError(null)

    try {
      await withdraw(dAppKit.signAndExecuteTransaction, amount)
      setAmount('')
    } catch (e: any) {
      setLocalError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const displayError = localError || error
  const balance = summary?.balances && Array.isArray(summary.balances) 
    ? summary.balances.find((b: { coin_type: string }) => b?.coin_type?.includes('dusdc'))?.balance || '0'
    : '0'

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

      {displayError && (
        <div style={{ marginTop: 16, padding: 12, background: 'rgba(239,68,68,0.1)', borderRadius: 8, color: RED, fontSize: 13 }}>
          {displayError}
        </div>
      )}
    </div>
  )
}