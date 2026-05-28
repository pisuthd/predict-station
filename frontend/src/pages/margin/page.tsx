'use client'

import { useState } from 'react'
import { NAVY } from '../../theme'
import { useMarginMarkets, type MarginMarket } from '../../hooks/useMarginMarkets'
import { MarketList } from './components/MarketList'
import AppNavbar from '../../components/layout/AppNavbar'
import AppWrapper from '../../components/layout/AppWrapper'

const WHITE = '#ffffff'
const MUTED = 'rgba(180,200,255,0.6)'
const CYAN = '#3EC4C0'

export default function MarginPage() {
  const { markets, filteredMarkets } = useMarginMarkets()
  const [selectedMarket, setSelectedMarket] = useState<MarginMarket | null>(filteredMarkets[0] || null)

  return (
    <AppWrapper>
      <div style={{
        height: '100vh',
        background: NAVY,
        color: WHITE,
        fontFamily: "'Space Mono', monospace",
        display: 'flex',
      }}>
        {/* Left Column - Margin Markets List */}
        <div style={{
          width: 320,
          height: '100vh',
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
              Margin Markets
            </h2>
          </div>

          <MarketList
            markets={filteredMarkets}
            selectedMarket={selectedMarket}
            onSelectMarket={setSelectedMarket}
          />
        </div>

        {/* Center Column - Market Details */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflow: 'hidden',
        }}>
          {/* AppNavbar */}
          <AppNavbar />

          {/* Market Header */}
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            {selectedMarket ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* Overlapping coin icons */}
                <div style={{ position: 'relative', width: 64, height: 32 }}>
                  {/* Base asset icon */}
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    border: '2px solid #0a0a1a',
                    position: 'absolute',
                    left: 0,
                    zIndex: 2,
                    background: 'rgba(62,196,192,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 600,
                    color: CYAN,
                  }}>
                    {selectedMarket.baseAssetSymbol.slice(0, 2)}
                  </div>
                  {/* Quote asset icon */}
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    border: '2px solid #0a0a1a',
                    position: 'absolute',
                    left: 16,
                    zIndex: 1,
                    background: 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 600,
                    color: WHITE,
                  }}>
                    {selectedMarket.quoteAssetSymbol.slice(0, 2)}
                  </div>
                </div>
                <div>
                  <h1 style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: WHITE,
                    margin: 0,
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                    {selectedMarket.baseAssetSymbol}/{selectedMarket.quoteAssetSymbol}
                  </h1>
                  <span style={{
                    fontSize: 12,
                    color: CYAN,
                    fontWeight: 600,
                  }}>
                    Margin Market
                  </span>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>
                Select a market to view details
              </p>
            )}
          </div>

          {/* Market Info */}
          {selectedMarket && (
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 16,
            }}>
              <div>
                <div style={{ fontSize: 10, color: MUTED, marginBottom: 4 }}>BASE ASSET</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{selectedMarket.baseAssetSymbol}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: MUTED, marginBottom: 4 }}>QUOTE ASSET</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{selectedMarket.quoteAssetSymbol}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: MUTED, marginBottom: 4 }}>POOL ID</div>
                <div style={{ 
                  fontSize: 11, 
                  fontWeight: 400,
                  color: MUTED,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: 120,
                }} title={selectedMarket.deepbookPoolId}>
                  {selectedMarket.deepbookPoolId.slice(0, 10)}...
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: MUTED, marginBottom: 4 }}>MAX LEVERAGE</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: CYAN }}>20x</div>
              </div>
            </div>
          )}

          {/* Placeholder for chart */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: MUTED,
          }}>
            {selectedMarket ? 'Chart coming soon' : 'Select a market to view chart'}
          </div>
        </div>

        {/* Right Column - Trading Panel */}
        <div style={{
          width: 360,
          height: '100vh',
          flexShrink: 0,
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 20px',
          gap: 16,
          overflowY: 'auto',
        }}>
          {/* Margin Info */}
          <div style={{
            padding: '12px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            <div style={{
              fontSize: 11,
              color: MUTED,
              fontFamily: "'Space Mono', monospace",
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: 12,
            }}>
              Market Info
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: MUTED }}>Available Markets</span>
                <span style={{ fontSize: 11, color: WHITE }}>{markets.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: MUTED }}>Max Leverage</span>
                <span style={{ fontSize: 11, color: WHITE }}>20x</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: MUTED }}>Min Margin</span>
                <span style={{ fontSize: 11, color: WHITE }}>5%</span>
              </div>
            </div>
          </div>

          {/* Placeholder for Order Form */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: MUTED,
            gap: 12,
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke={MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke={MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke={MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontSize: 13 }}>Trade form coming soon</span>
          </div>
        </div>
      </div>
    </AppWrapper>
  )
}