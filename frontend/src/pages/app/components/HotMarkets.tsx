'use client'

import { type Market, formatUSD } from '../utils'

const GREEN = '#22c55e'
const RED = '#ef4444'
const WHITE = '#ffffff'
const MUTED = 'rgba(180,200,255,0.6)'
const CYAN = '#3EC4C0'

interface HotMarketsProps {
  markets: Market[]
  selectedIndex: number
  onSelect: (index: number) => void
  vaultValue: number | null
}

/**
 * Format expiry time into detailed countdown
 * Shows largest unit + next smaller unit (no seconds)
 * e.g., "4d 2h", "1h 15m", "12m"
 */
function formatDetailedExpiry(expiryMs: number): string {
  const diff = expiryMs - Date.now()
  if (diff <= 0) return 'soon'
  
  const m = Math.floor(diff / 60000)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  
  if (d > 0) {
    const remainingH = h % 24
    return remainingH > 0 ? `${d}d ${remainingH}h` : `${d}d`
  }
  if (h > 0) {
    const remainingM = m % 60
    return remainingM > 0 ? `${h}h ${remainingM}m` : `${h}h`
  }
  return `${m}m`
}

export function HotMarkets({ markets, selectedIndex, onSelect, vaultValue }: HotMarketsProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Header with BTC icon */}
      <div style={{
        padding: '32px 0 16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img 
            src="https://assets.coingecko.com/coins/images/1/standard/bitcoin.png?1696501400" 
            alt="BTC" 
            width={18} 
            height={18}
            style={{ borderRadius: '50%' }}
          />
          <span style={{ fontSize: 14, fontWeight: 600, color: WHITE }}>ACTIVE MARKETS</span>
        </div>
        <span style={{ fontSize: 10, color: CYAN }}>
          {vaultValue ? formatCompact(vaultValue) + ' TVL' : '—'}
        </span>
      </div>

      {/* Markets list - scrollable */}
      <div style={{ 
        flex: 1,
        overflowY: 'auto',
        minHeight: 0,
      }}>
        {markets.map((m, i) => {
          const odds = m.odds
          const spot = m.spot / 1e9
          const strike = odds?.strikeK ?? 0
          const upProb = (odds?.upProb ?? 0.5) * 100

          return (
            <div
              key={m.oracle_id}
              onClick={() => onSelect(i)}
              style={{
                display: 'grid',
                gridTemplateColumns: '24px 1fr 50px',
                alignItems: 'center',
                padding: '14px 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                background: i === selectedIndex ? 'rgba(62,196,192,0.1)' : 'transparent',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 11, color: MUTED }}>#{i + 1}</span>
              <div>
                <div style={{ fontSize: 12, color: WHITE, marginBottom: 2 }}>
                  BTC {strike > spot ? '>' : '<'} {formatUSD(strike)}
                </div>
                <div style={{ fontSize: 10, color: MUTED }}>
                  {formatDetailedExpiry(m.expiryMs)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: upProb > 50 ? GREEN : RED
                }}>
                  {upProb.toFixed(0)}%
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{
        padding: '16px 0',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        fontSize: 11,
        color: MUTED,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Active Markets</span>
          <span style={{ color: WHITE }}>{markets.length}</span>
        </div>
      </div>
    </div>
  )
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toFixed(0)
}