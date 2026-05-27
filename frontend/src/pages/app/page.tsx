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
      <div style={{ display: 'flex', height: '100vh', paddingLeft: 24 }}>

        {/* Left Column */}
        <div style={{
          flex: 1,
          paddingRight: 24,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}>
          {/* Header Row - 2 columns */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            paddingTop: 32,
            paddingBottom: 20,
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            gap: 24,
          }}>
            {/* Left: Product Info */}
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, color: MUTED, margin: 0, lineHeight: 1.4 }}>
                Expiry-based prediction markets on Sui
              </p>
            </div>

            {/* Right: Market Summary */}
            {!loading && selected && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                  Will {selected.asset} be above ${selected.odds?.strikeK?.toLocaleString()}?
                  <img 
                    src="https://assets.coingecko.com/coins/images/1/standard/bitcoin.png?1696501400" 
                    alt="BTC" 
                    width={16} 
                    height={16}
                    style={{ borderRadius: '50%', flexShrink: 0 }}
                  />
                </div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 6 }}>
                  in {getExpiryText(selected)}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div style={{ color: '#ef4444', padding: 16 }}>⚠ {error}</div>
          )}

          {loading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED }}>
              <span style={{ width: 8, height: 8, background: CYAN, borderRadius: '50%', marginRight: 12, animation: 'pulse 1s ease-in-out infinite' }} />
              Loading...
              <style>{`@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.8); } }`}</style>
            </div>
          ) : selected ? (
            <PriceChart
              oracleId={selected.oracle_id}
              strike={selected.odds?.strikeK ?? 0}
            />
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED }}>
              No active markets
            </div>
          )}
        </div>

        {/* Right Column - Hot Markets */}
        <div style={{ width: 360, paddingLeft: 24, overflow: 'hidden' }}>
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
 * Format expiry time into detailed countdown
 * Shows largest unit + next smaller unit (no seconds)
 * e.g., "4d 2h", "1h 15m", "12m"
 */
function getExpiryText(market: Market): string {
  const diff = market.expiryMs - Date.now()
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