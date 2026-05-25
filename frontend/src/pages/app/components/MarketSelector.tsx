'use client'

import { type Market, formatCountdown } from '../utils'
import { CYAN } from '../../../theme'

const WHITE = '#ffffff'
const MUTED = '#666666'

interface MarketSelectorProps {
  markets: Market[]
  selectedIndex: number
  onSelect: (index: number) => void
}

export function MarketSelector({ markets, selectedIndex, onSelect }: MarketSelectorProps) {
  const now = Date.now()
  const sixHours = 6 * 60 * 60 * 1000
  const twentyFourHours = 24 * 60 * 60 * 1000

  const in6h = markets.findIndex(m => m.expiryMs - now <= sixHours && m.expiryMs > now)
  const in24h = markets.findIndex(m => m.expiryMs - now > sixHours && m.expiryMs - now <= twentyFourHours)
  const farest = markets.length - 1

  const options = [
    in6h >= 0 ? { label: 'In 6h', index: in6h } : null,
    in24h >= 0 ? { label: 'In 24h', index: in24h } : null,
    farest >= 0 ? { label: 'Farest', index: farest } : null,
  ].filter(Boolean) as { label: string; index: number }[]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <select
        value={selectedIndex}
        onChange={e => onSelect(Number(e.target.value))}
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8,
          padding: '10px 16px',
          color: WHITE,
          fontFamily: "'Space Mono', monospace",
          fontSize: 12,
          cursor: 'pointer',
          minWidth: 140,
        }}
      >
        {markets.map((m, i) => (
          <option key={m.oracle_id} value={i}>
            {formatCountdown(m.expiryMs)} - ${m.odds?.strikeK?.toLocaleString() ?? '—'}
          </option>
        ))}
      </select>

      <div style={{ display: 'flex', gap: 8 }}>
        {options.map(opt => (
          <button
            key={opt.label}
            onClick={() => onSelect(opt.index)}
            style={{
              background: selectedIndex === opt.index ? 'rgba(62,196,192,0.2)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${selectedIndex === opt.index ? CYAN : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 6,
              padding: '8px 12px',
              color: selectedIndex === opt.index ? CYAN : MUTED,
              fontFamily: "'Space Mono', monospace",
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}