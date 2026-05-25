'use client'

import { useState } from 'react'
import { NAVY } from '../../theme'
import { useMarkets, type Market } from '../../hooks'
import { PriceChart } from './components/PriceChart'
import { HotMarkets } from './components/HotMarkets'

const WHITE = '#ffffff'
const MUTED = 'rgba(180,200,255,0.6)'
const CYAN = '#3EC4C0'

export default function Dashboard() {
  const { markets, vault, loading, error } = useMarkets(30_000)
  const activeMarkets = markets.filter((m: Market) => m.status === 'active')

  // State for selected market - starts at 0 (first market)
  const [selectedIdx, setSelectedIdx] = useState(0)
  
  const selected = activeMarkets[selectedIdx]

  return (
    <div style={{
      minHeight: '100vh',
      background: NAVY,
      color: WHITE,
      fontFamily: "'Space Mono', monospace",
      padding: '0 24px',
    }}>
      <div style={{ display: 'flex', height: '100vh' }}>

        {/* Left Column - Fixed/Static */}
        <div style={{
          flex: 1,
          paddingRight: 24,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}>
          {/* Question Header - only show when data is loaded */}
          {!loading && selected && (
            <div style={{
              paddingTop: 32,
              paddingBottom: 16,
              flexShrink: 0,
            }}>
              <h1 style={{ 
                fontSize: 20, 
                fontWeight: 700, 
                color: WHITE, 
                margin: 0,
                fontFamily: "'Space Mono', monospace",
                lineHeight: 1.3,
              }}>
                Will {selected.asset} be above ${selected.odds?.strikeK?.toLocaleString()}?
              </h1>
              <div style={{ 
                fontSize: 12, 
                color: MUTED, 
                marginTop: 8,
                fontFamily: "'Space Mono', monospace",
              }}>
                {getExpiryText(selected)}
              </div>
            </div>
          )}

          {error && (
            <div style={{ color: '#ef4444', padding: 16 }}>⚠ {error}</div>
          )}

          {loading ? (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: MUTED,
              fontFamily: "'Space Mono', monospace",
            }}>
              <span style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                background: CYAN,
                borderRadius: '50%',
                marginRight: 12,
                animation: 'pulse 1s ease-in-out infinite',
              }} />
              Loading...
              <style>{`
                @keyframes pulse {
                  0%, 100% { opacity: 1; transform: scale(1); }
                  50% { opacity: 0.4; transform: scale(0.8); }
                }
              `}</style>
            </div>
          ) : selected ? (
            <PriceChart
              oracleId={selected.oracle_id}
              strike={selected.odds?.strikeK ?? 0}
            />
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: MUTED
            }}>
              No active markets
            </div>
          )}
        </div>

        {/* Right Column - Scrollable Active Markets */}
        <div style={{
          width: 360,
          paddingLeft: 24,
          overflow: 'hidden',
        }}>
          <HotMarkets
            markets={activeMarkets}
            selectedIndex={selectedIdx}
            onSelect={setSelectedIdx}
            vaultValue={vault?.vault_value ?? null}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Format expiry time into human-readable text
 * e.g., "in 5m" or "in 2h 30m"
 */
function getExpiryText(market: Market): string {
  const diff = market.expiryMs - Date.now()
  
  if (diff <= 0) {
    return 'in soon'
  }
  
  const s = Math.floor(diff / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  
  if (h > 0) {
    return `in ${h}h ${m}m`
  }
  return `in ${m}m`
}