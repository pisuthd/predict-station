'use client'

import { useState, useEffect, useRef } from 'react'
import { NAVY } from '../../theme'
import { useMarkets, type Market } from '../../hooks'
import { MarketList } from './components/MarketList'
import { PriceChart2, type Direction } from './components/PriceChart2'
import type { MarketMode } from './components/PriceChart2'
import { StrikeGrid } from './components/StrikeGrid'
import { TradePositions } from './components/TradePanel/TradePositions'
import AppNavbar from '../../components/layout/AppNavbar'
import AppWrapper from '../../components/layout/AppWrapper'

const CYAN = '#3EC4C0'
const WHITE = '#ffffff'
const MUTED = 'rgba(180,200,255,0.6)'
const PRICE_SCALE = 1_000_000_000n

export default function PredictPage() {
  const { markets, loading, error, refetch } = useMarkets(30_000)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [chartMode, setChartMode] = useState<MarketMode>('binary')

  // Strike states moved from PriceChart2 to parent
  const [strike1, setStrike1] = useState(0)
  const [strike2, setStrike2] = useState<number | null>(null)
  const [direction, setDirection] = useState<Direction>('up')

  const activeMarkets = markets.filter((m: Market) => m.status === 'active')
  const selected = activeMarkets[selectedIdx] || null

  // Initialize strikes when market changes (only when selecting a new market)
  // Use a ref to track the current oracle_id to avoid resetting on market updates
  const prevOracleIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!selected) return
    const currentOracleId = selected.oracle_id

    // Only reset if market actually changed (not just updated)
    if (prevOracleIdRef.current !== currentOracleId) {
      prevOracleIdRef.current = currentOracleId
      const spotPrice = Number(selected.spot) / Number(PRICE_SCALE)
      setStrike1(spotPrice)
      setStrike2(null)
    }
  }, [selected])

  // Handle strike changes from PriceChart2
  const handleStrikeChange = (s1: number, s2: number | null, dir: 'up' | 'down') => {
    setStrike1(s1)
    setStrike2(s2)
    setDirection(dir)
  }

  // Handle direction changes from PriceChart2
  const handleDirectionChange = (dir: 'up' | 'down') => {
    setDirection(dir)
  }

  return (
    <AppWrapper>
      <div style={{
        height: '100vh',
        background: NAVY,
        color: WHITE,
        fontFamily: "'Space Mono', monospace",
        display: 'flex',
      }}>
        {/* Left Column - Market List */}
        <div style={{
          width: 320,
          height: "100vh",
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}>

          {/* Header */}
          <div style={{
            padding: '16px 16px 12px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            <h2 style={{
              fontSize: 14,
              fontWeight: 600,
              color: WHITE,
              margin: 0,
              fontFamily: "'DM Sans', sans-serif",
            }}>
              Predict Markets
            </h2>
          </div>

          <MarketList
            markets={markets}
            selectedMarket={selected}
            onSelectMarket={(market) => {
              const idx = activeMarkets.findIndex(m => m.oracle_id === market.oracle_id)
              if (idx >= 0) setSelectedIdx(idx)
            }}
            loading={loading}
            error={error}
            onRetry={refetch}
          />
        </div>

        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
        }}>

          <AppNavbar />

          {!selected && (
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}>
              <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>
                Select a market to view details
              </p>
            </div>
          )}

          {error && (
            <div style={{ color: '#ef4444', padding: 16, background: 'rgba(239,68,68,0.1)', borderRadius: 8 }}>
              ⚠ {error}
            </div>
          )}

          {loading ? (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: MUTED,
              gap: 16,
            }}>
              <div style={{
                width: 24,
                height: 24,
                border: `2px solid rgba(62,196,192,0.2)`,
                borderTopColor: CYAN,
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
              <span style={{ fontSize: 12 }}>Loading market</span>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : selected ? (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ flex: 1 }}>
                <PriceChart2
                  market={selected}
                  mode={chartMode}
                  onModeChange={setChartMode}
                  initialStrike1={strike1}
                  initialStrike2={strike2}
                  initialDirection={direction}
                  onStrikeChange={handleStrikeChange}
                  onDirectionChange={handleDirectionChange}
                />
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED }}>
              No active markets
            </div>
          )}

          {/* Positions Table */}
          <div style={{
            flex: 1, 
            borderTop: '1px solid rgba(255,255,255,0.08)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {selected && (
              <TradePositions
                selectedMarketOracleId={selected.oracle_id}
                selectedMarketExpiry={selected.expiryMs}
              />
            )}
          </div>

        </div>

        {/* Right Column - Strike Grid */}
        <div style={{
          width: 360,
          flexShrink: 0,
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}>
          {selected ? (
            <StrikeGrid
              market={selected}
              mode={chartMode}
              direction={direction}
              onStrikeChange={handleStrikeChange}
            />
          ) : loading ? (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: MUTED,
              gap: 16,
            }}>
              <div style={{
                width: 24,
                height: 24,
                border: `2px solid rgba(62,196,192,0.2)`,
                borderTopColor: CYAN,
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
              <span style={{ fontSize: 12 }}>Loading market</span>
            </div>
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: MUTED,
              fontSize: 13,
            }}>
              Select a market
            </div>
          )}
        </div>
      </div>
    </AppWrapper>
  )
}