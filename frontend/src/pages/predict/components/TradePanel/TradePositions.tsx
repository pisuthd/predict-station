'use client'

import { usePredict, PRICE_SCALE, DUSDC_SCALE } from '../../../../hooks'

const WHITE = '#ffffff'
const MUTED = 'rgba(180,200,255,0.6)'
const GREEN = '#22c55e'
const RED = '#ef4444'
const CYAN = '#3EC4C0'

export function TradePositions() {
  const { positions, loading } = usePredict()

  const formatStrike = (raw: string) => {
    const n = Number(BigInt(raw)) / Number(PRICE_SCALE)
    return '$' + n.toLocaleString(undefined, { maximumFractionDigits: 0 })
  }

  const formatUsd = (raw: string) => {
    const n = Number(BigInt(raw || '0')) / Number(DUSDC_SCALE)
    return n.toLocaleString(undefined, { maximumFractionDigits: 2 })
  }

  const formatPrice = (raw: string | null) => {
    if (!raw || raw === '0') return '—'
    const n = Number(BigInt(raw)) / Number(PRICE_SCALE)
    return n.toFixed(4)
  }

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: MUTED }}>
        Loading positions...
      </div>
    )
  }

  if (positions.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: MUTED }}>
        No open positions
      </div>
    )
  }

  return (
    <div style={{ padding: 16, overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <th style={{ textAlign: 'left', padding: '8px 8px', color: MUTED, fontSize: 10, textTransform: 'uppercase' }}>SIDE</th>
            <th style={{ textAlign: 'left', padding: '8px 8px', color: MUTED, fontSize: 10, textTransform: 'uppercase' }}>STRIKE</th>
            <th style={{ textAlign: 'right', padding: '8px 8px', color: MUTED, fontSize: 10, textTransform: 'uppercase' }}>QTY</th>
            <th style={{ textAlign: 'right', padding: '8px 8px', color: MUTED, fontSize: 10, textTransform: 'uppercase' }}>ENTRY</th>
            <th style={{ textAlign: 'right', padding: '8px 8px', color: MUTED, fontSize: 10, textTransform: 'uppercase' }}>MARK</th>
            <th style={{ textAlign: 'right', padding: '8px 8px', color: MUTED, fontSize: 10, textTransform: 'uppercase' }}>uPnL</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((pos, idx) => {
            const isUp = pos.is_up
            return (
              <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 8px' }}>
                  <span style={{
                    color: isUp ? GREEN : RED,
                    fontWeight: 700,
                    fontSize: 11,
                    background: isUp ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                    padding: '2px 8px',
                    borderRadius: 4,
                  }}>
                    {isUp ? '▲ UP' : '▼ DOWN'}
                  </span>
                </td>
                <td style={{ padding: '12px 8px', fontFamily: "'Space Mono', monospace", color: CYAN }}>
                  {formatStrike(pos.strike)}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'right', fontFamily: "'Space Mono', monospace" }}>
                  ${formatUsd(pos.open_quantity)}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'right', fontFamily: "'Space Mono', monospace" }}>
                  {formatPrice(pos.average_entry_price)}¢
                </td>
                <td style={{ 
                  padding: '12px 8px', 
                  textAlign: 'right', 
                  fontFamily: "'Space Mono', monospace",
                  color: pos.mark_price ? (Number(pos.mark_price) > Number(pos.average_entry_price) ? GREEN : RED) : MUTED
                }}>
                  {formatPrice(pos.mark_price)}¢
                </td>
                <td style={{ 
                  padding: '12px 8px', 
                  textAlign: 'right', 
                  fontFamily: "'Space Mono', monospace",
                  fontWeight: 600,
                  color: Number(pos.unrealized_pnl || 0) >= 0 ? GREEN : RED,
                }}>
                  {Number(pos.unrealized_pnl || 0) >= 0 ? '+' : ''}{formatUsd(pos.unrealized_pnl)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}