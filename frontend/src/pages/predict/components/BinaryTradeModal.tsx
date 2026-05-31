'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useDAppKit, useCurrentAccount } from '@mysten/dapp-kit-react'
import { ConnectButton } from '@mysten/dapp-kit-react/ui'
import { ModalWrapper } from '../../../components/ModalWrapper'
import type { ManagerData, TradeQuote } from '../../../hooks'
import type { Market } from '../../../hooks'
import { useInterval } from 'usehooks-ts'

const WHITE = '#ffffff'
const MUTED = 'rgba(180,200,255,0.5)'
const CYAN = '#3EC4C0'
const GREEN = '#22c55e'
const RED = '#ef4444'
const NAVY = '#0a0a1a'

const PRESETS = [1, 5, 10, 25]

interface BinaryTradeModalProps {
  isOpen: boolean
  onClose: () => void
  market: Market
  strike: number
  manager: ManagerData | null
  mint?: (
    signAndExecute: any,
    oracleId: string,
    expiryMs: number,
    strike: number,
    direction: 'up' | 'down',
    amount: number
  ) => Promise<void>
  getTradeQuote?: (
    oracleId: string,
    expiryMs: number,
    strike: number,
    direction: 'up' | 'down',
    quantity: number
  ) => Promise<TradeQuote | null>
  error?: string | null
}

function formatTimeRemaining(expiryMs: number): string {
  const now = Date.now()
  const diff = expiryMs - now
  if (diff <= 0) return 'Expired'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m`
  return '< 1m'
}

export function BinaryTradeModal({
  isOpen,
  onClose,
  market,
  strike,
  manager,
  mint,
  getTradeQuote,
  error,
}: BinaryTradeModalProps) {
  const dAppKit = useDAppKit()
  const account = useCurrentAccount()
  const [direction, setDirection] = useState<'up' | 'down'>('up')
  const [amount, setAmount] = useState('1')
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [upQuote, setUpQuote] = useState<TradeQuote | null>(null)
  const [downQuote, setDownQuote] = useState<TradeQuote | null>(null)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const roundedAmount = parseFloat(amount) || 0
  const activeQuote = direction === 'up' ? upQuote : downQuote

  const costPer = activeQuote?.cost ?? 0.5
  const premiumPer = activeQuote?.premium ?? 0

  // Calculate totals 
  const payoutIfWin = (1 + (1 - costPer - premiumPer)) * roundedAmount

  const profitIfWin = payoutIfWin - roundedAmount

  // Reset on modal open
  useEffect(() => {
    if (isOpen) {
      setAmount('1')
      setUpQuote(null)
      setDownQuote(null)
      setLocalError(null)
      setDirection('up')
      // setRefreshing(false)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isOpen])

  useInterval(
    () => {

      if (!isOpen || !getTradeQuote || !market.oracle_id || !market.expiryMs || strike <= 0) {

      } else {
        const fetchQuotes = async () => {
          const qty = roundedAmount > 0 ? roundedAmount : 1
          try {

            const [up, down] = await Promise.all([
              getTradeQuote(market.oracle_id, market.expiryMs, strike, 'up', qty),
              getTradeQuote(market.oracle_id, market.expiryMs, strike, 'down', qty),
            ])
            setUpQuote(up)
            setDownQuote(down)
          } catch (e) {
            console.error('Quote fetch failed:', e)
          }
        }

        fetchQuotes()
      }
    },
    upQuote === null ? 1000 : 3000,
  )

  // Format expiry
  const expiryLabel = useMemo(() => {
    if (!market.expiryMs) return ''
    return `Expires in ${formatTimeRemaining(market.expiryMs)}`
  }, [market.expiryMs])

  // Question title
  const questionTitle = `${market.name} at expiry — above or below $${Math.round(strike).toLocaleString()}?`

  const handleTrade = async () => {
    if (!manager || !mint || roundedAmount < 0.01) return
    setLoading(true)
    setLocalError(null)
    try {
      await mint(
        dAppKit.signAndExecuteTransaction,
        market.oracle_id,
        market.expiryMs,
        strike,
        direction,
        roundedAmount
      )
      onClose()
    } catch (e: any) {
      setLocalError(e.message || 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  const hasQuote = activeQuote !== null

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>

      {/* Header - Question as title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <h2 style={{ color: WHITE, fontSize: 16, fontWeight: 600, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
            {questionTitle}
          </h2>

        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: 'none',
            borderRadius: 6,
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: MUTED,
            fontSize: 14,
          }}
        >
          ×
        </button>
      </div>

      <>
        {/* Direction Buttons */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          {(['up', 'down'] as const).map((d) => {
            const isActive = direction === d
            const quote = d === 'up' ? upQuote : downQuote

            const pricePer = quote?.cost ?? null
            const color = d === 'up' ? GREEN : RED

            return (
              <button
                key={d}
                onClick={() => setDirection(d)}
                style={{
                  flex: 1,
                  padding: '8px 6px',
                  borderRadius: 6,
                  border: `1.5px solid ${isActive ? color : 'rgba(255,255,255,0.08)'}`,
                  background: isActive
                    ? d === 'up' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)'
                    : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ color: isActive ? color : MUTED, fontSize: 11, fontWeight: 600 }}>
                  {d === 'up' ? '▲ UP' : '▼ DOWN'}
                </div>
                <div style={{ color: isActive ? color : MUTED, fontSize: 13, fontWeight: 600, fontFamily: "'Space Mono', monospace", marginTop: 2 }}>
                  {pricePer !== null ? `$${pricePer.toFixed(2)}` : '—'}
                </div>
              </button>
            )
          })}
        </div>

        <p style={{ color: MUTED, fontSize: 10, textAlign: "center", margin: '2px 0 0', paddingBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>
          {expiryLabel}
        </p>

        {/* Amount Input */}
        <div style={{ marginBottom: 10 }}>
          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden',
            marginBottom: 6,
          }}>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="10"
              step="1"
              min="1"
              style={{
                flex: 1,
                padding: '8px 10px',
                background: 'transparent',
                border: 'none',
                color: WHITE,
                fontSize: 13,
                fontFamily: "'Space Mono', monospace",
                outline: 'none',
              }}
            />
            <span style={{ padding: '8px 10px', color: MUTED, fontSize: 11 }}>
              DBUSDC
            </span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setAmount(String(p))}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  background: roundedAmount === p ? 'rgba(62,196,192,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${roundedAmount === p ? 'rgba(62,196,192,0.4)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 4,
                  color: roundedAmount === p ? CYAN : MUTED,
                  fontSize: 11,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: "'Space Mono', monospace",
                }}
              >
                ${p}
              </button>
            ))}
          </div>
        </div>

        {/* Payout Details */}
        {roundedAmount > 0 && hasQuote && (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            borderRadius: 6,
            padding: '10px 12px',
            marginBottom: 10,
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <div>
                <div style={{ fontSize: 10, color: MUTED }}>Payout If Win</div>
                <div style={{ fontSize: 12, color: CYAN, fontFamily: "'Space Mono', monospace" }}>
                  {`$${payoutIfWin.toFixed(2)}`}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: MUTED }}>Profit If Win</div>
                <div style={{ fontSize: 12, color: profitIfWin >= 0 ? GREEN : RED, fontFamily: "'Space Mono', monospace" }}>
                  {`${profitIfWin >= 0 ? '+' : ''}$${profitIfWin.toFixed(2)}`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {(localError || error) && (
          <div style={{ marginBottom: 8, padding: 8, background: 'rgba(239,68,68,0.1)', borderRadius: 4, color: RED, fontSize: 10 }}>
            {localError || error}
          </div>
        )}

        {!account ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <ConnectButton />
            <p style={{ color: MUTED, fontSize: 11, marginTop: 8 }}>Connect wallet to trade</p>
          </div>
        ) : !manager ? (
          <div style={{ textAlign: 'center', padding: '16px 0', color: MUTED, fontSize: 11 }}>
            Create a manager first
          </div>
        ) : (
          <button
            onClick={handleTrade}
            disabled={loading || !mint || !hasQuote}
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: 6,
              border: 'none',
              background: hasQuote ? CYAN : 'rgba(255,255,255,0.08)',
              color: hasQuote ? NAVY : MUTED,
              fontSize: 12,
              fontWeight: 600,
              cursor: loading || !hasQuote ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Processing...' : !hasQuote ? 'Loading...' : `Mint ${direction === 'up' ? '▲ UP' : '▼ DOWN'}`}
          </button>
        )}



      </>
    </ModalWrapper>
  )
}
