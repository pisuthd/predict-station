'use client'

import { useState } from 'react'

const CYAN = '#3EC4C0'
const WHITE = '#ffffff'
const MUTED = 'rgba(180,200,255,0.6)'
const GREEN = '#22c55e'
const RED = '#ef4444'

interface LeverageSelectorProps {
  leverage: number
  onLeverageChange: (leverage: number) => void
  liquidationDistance: number
}

const PRESET_LEVERAGES = [2, 5, 10, 15, 20]

export function LeverageSelector({ leverage, onLeverageChange, liquidationDistance }: LeverageSelectorProps) {
  const [customLeverage, setCustomLeverage] = useState('')

  const handleCustomSubmit = () => {
    const value = parseInt(customLeverage)
    if (value >= 1 && value <= 100) {
      onLeverageChange(value)
    }
  }

  const formatLiqPercent = (lev: number) => {
    const liq = 100 / lev
    return liq.toFixed(1)
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      {/* Label */}
      <div style={{
        fontSize: 11,
        color: MUTED,
        fontFamily: "'Space Mono', monospace",
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        Leverage
      </div>

      {/* Preset buttons */}
      <div style={{
        display: 'flex',
        gap: 6,
      }}>
        {PRESET_LEVERAGES.map(lev => (
          <button
            key={lev}
            onClick={() => onLeverageChange(lev)}
            style={{
              flex: 1,
              padding: '8px 4px',
              background: leverage === lev ? 'rgba(62,196,192,0.15)' : 'rgba(255,255,255,0.03)',
              border: leverage === lev ? '1px solid rgba(62,196,192,0.25)' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (leverage !== lev) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
              }
            }}
            onMouseLeave={(e) => {
              if (leverage !== lev) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
              }
            }}
          >
            <span style={{
              fontSize: 12,
              fontWeight: 700,
              color: leverage === lev ? CYAN : MUTED,
              fontFamily: "'Space Mono', monospace",
            }}>
              {lev}x
            </span>
          </button>
        ))}
      </div>

      {/* Custom leverage input */}
      <div style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
      }}>
        <input
          type="number"
          value={customLeverage}
          onChange={(e) => setCustomLeverage(e.target.value)}
          placeholder="Custom"
          min={1}
          max={100}
          style={{
            flex: 1,
            padding: '8px 12px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8,
            color: WHITE,
            fontSize: 12,
            fontFamily: "'Space Mono', monospace",
            outline: 'none',
          }}
        />
        <button
          onClick={handleCustomSubmit}
          style={{
            padding: '8px 16px',
            background: 'rgba(62,196,192,0.15)',
            border: '1px solid rgba(62,196,192,0.25)',
            borderRadius: 8,
            color: CYAN,
            fontSize: 11,
            cursor: 'pointer',
            fontFamily: "'Space Mono', monospace",
          }}
        >
          Set
        </button>
      </div>

      {/* Current leverage info */}
      <div style={{
        padding: '12px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: 8,
        border: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}>
          <span style={{ fontSize: 11, color: MUTED }}>Current Leverage</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: CYAN }}>{leverage}x</span>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 11, color: MUTED }}>Liquidation Distance</span>
          <span style={{ 
            fontSize: 12, 
            fontWeight: 600,
            color: liquidationDistance < 10 ? RED : liquidationDistance < 20 ? '#f97316' : GREEN 
          }}>
            {formatLiqPercent(leverage)}%
          </span>
        </div>
      </div>
    </div>
  )
}