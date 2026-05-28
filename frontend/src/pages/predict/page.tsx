'use client'

import { useState } from 'react'
import { NAVY } from '../../theme'
import { useMarkets, type Market } from '../../hooks'
import { MarketList } from './components/MarketList'
import { PredictChart } from './components/PredictChart'
import { TradeTicket } from './components/TradeTicket'
import { MyPositions } from './components/MyPositions'
import { formatDetailedExpiry, getMarketName } from './utils'
import Navbar from '../../components/layout/Navbar'
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
<Navbar /> 
      <div style={{
        height: '100vh',
        background: NAVY,
        color: WHITE,
        fontFamily: "'Space Mono', monospace",
        // padding: '0 24px',
      }}>
        {/* <Navbar /> */}
        <div style={{ display: 'flex' }}>

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

          {/* Center Column - Chart & Stats */}
          {/* <div style={{
          flex: 1,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          overflow: 'hidden',
          minWidth: 0,
        }}> 
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
        </div> */}

          {/* Right Column - Trade Panel */}
          {/* <div style={{
          width: 380,
          flexShrink: 0,
          paddingLeft: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}>
          {selected ? (
            <> 
              <TradeTicket market={selected} />
               
              <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '16px 0' }} />
               
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
        </div> */}
        </div>
      </div>
    </AppWrapper>
  )
}
