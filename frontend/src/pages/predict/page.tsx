'use client'

import { useState } from 'react'
import { NAVY } from '../../theme'
import { useMarkets, type Market } from '../../hooks'
import { MarketList } from './components/MarketList'
import { PredictChart } from './components/PredictChart'
import { TradeTicket } from './components/TradeTicket'
import { MyPositions } from './components/MyPositions'
import { formatDetailedExpiry, getMarketName } from './utils'
import AppNavbar from '../../components/layout/AppNavbar'
import AppWrapper from '../../components/layout/AppWrapper'

const CYAN = '#3EC4C0'
const WHITE = '#ffffff'
const MUTED = 'rgba(180,200,255,0.6)'

const BTC_ICON = 'https://assets.coingecko.com/coins/images/1/standard/bitcoin.png?1696501400'

export default function PredictPage() {
  const { markets, vault, loading, error, refetch } = useMarkets(30_000)
  const [selectedIdx, setSelectedIdx] = useState(0)

  const activeMarkets = markets.filter((m: Market) => m.status === 'active')
  const selected = activeMarkets[selectedIdx] || null

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


          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            paddingBottom: 16,
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            gap: 24,
          }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, color: MUTED, margin: 0, lineHeight: 1.4 }}>
                Expiry-based prediction markets on Sui
              </p>
            </div>

            {!loading && selected && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                  {getMarketName(selected)}
                  <img
                    src={BTC_ICON}
                    alt="BTC"
                    width={16}
                    height={16}
                    style={{ borderRadius: '50%', flexShrink: 0 }}
                  />
                </div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 6 }}>
                  in {formatDetailedExpiry(selected.expiryMs)}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div style={{ color: '#ef4444', padding: 16, background: 'rgba(239,68,68,0.1)', borderRadius: 8 }}>
              ⚠ {error}
            </div>
          )}

          {loading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED }}>
              <span style={{
                width: 8,
                height: 8,
                background: CYAN,
                borderRadius: '50%',
                marginRight: 12,
                animation: 'pulse 1s ease-in-out infinite'
              }} />
              Loading markets...
              <style>{`@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.8); } }`}</style>
            </div>
          ) : selected ? (
            <>
              <PredictChart market={selected} />
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED }}>
              No active markets
            </div>
          )}
        </div>

        {/* Right Column - Trade Panel */}
        <div style={{
          width: 380,
          flexShrink: 0,
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          overflowY: 'auto',
        }}>
          {selected ? (
            <>
              <TradeTicket market={selected} />
              <MyPositions />
            </>
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: MUTED,
              fontSize: 13,
            }}>
              Select a market to trade
            </div>
          )}
        </div>
      </div>
    </AppWrapper>
  )
}
