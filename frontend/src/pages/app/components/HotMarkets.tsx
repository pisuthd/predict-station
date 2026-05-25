'use client'

import { type Market, formatUSD, formatCountdownFull, formatCompact } from '../utils'

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

export function HotMarkets({ markets, selectedIndex, onSelect, vaultValue }: HotMarketsProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '32px 0 16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: WHITE }}>ACTIVE MARKETS</span>
        <span style={{ fontSize: 10, color: CYAN }}>
          {vaultValue ? formatCompact(vaultValue) + ' TVL' : '—'}
        </span>
      </div>

      {/* Markets list - scrollable */}
      <div style={{ 
        flex: 1,
        overflowY: 'auto',
        minHeight: 0, // Important for flex overflow
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
                  {formatCountdownFull(m.expiryMs)}
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