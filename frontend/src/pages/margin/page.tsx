'use client'

import { useState } from 'react'
import { NAVY } from '../../theme'
import { useMarginMarkets, type MarginPosition } from '../../hooks'
import { LeverageSelector } from './components'
import Navbar from '../../components/layout/Navbar'
import AppWrapper from '../../components/layout/AppWrapper'

const WHITE = '#ffffff'
const MUTED = 'rgba(180,200,255,0.6)'
const CYAN = '#3EC4C0'

export default function MarginPage() {
  const { positions, loading, error, refetch } = useMarginMarkets(5_000)
  const [selectedPosition, setSelectedPosition] = useState<MarginPosition | null>(null)
  const [leverage, setLeverage] = useState(10)

  const handleSelectPosition = (position: MarginPosition) => {
    setSelectedPosition(position)
    if (position.leverage) {
      setLeverage(Math.round(position.leverage))
    }
  }

  const formatPrice = (price: number): string => {
    if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    if (price >= 1) return price.toFixed(4)
    return price.toFixed(6)
  }

  const formatVolume = (volume: number): string => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`
    return `$${(volume / 1e3).toFixed(0)}K`
  }

  // Group positions by asset
  const groupedPositions = positions.reduce((acc, pos) => {
    if (!acc[pos.baseAssetSymbol]) acc[pos.baseAssetSymbol] = []
    acc[pos.baseAssetSymbol].push(pos)
    return acc
  }, {} as Record<string, MarginPosition[]>)

  return (
    <AppWrapper>
      <Navbar />
      <div style={{
        height: '100vh',
        background: NAVY,
        color: WHITE,
        fontFamily: "'Space Mono', monospace",
        display: 'flex',
      }}>
        {/* Left Column - Margin Positions List */}
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
              Margin Positions
            </h2>
            {loading && (
              <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>
                Loading live data...
              </div>
            )}
          </div>

          {/* Positions List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {error ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: 200,
                gap: 12,
              }}>
                <div style={{ color: '#ef4444', fontSize: 13, textAlign: 'center' }}>
                  ⚠ {error}
                </div>
                <button
                  onClick={refetch}
                  style={{
                    padding: '8px 16px',
                    background: 'rgba(62,196,192,0.15)',
                    border: '1px solid rgba(62,196,192,0.25)',
                    borderRadius: 6,
                    color: CYAN,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Retry
                </button>
              </div>
            ) : positions.length === 0 ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 120,
                color: MUTED,
                fontSize: 13,
              }}>
                No positions found
              </div>
            ) : (
              Object.entries(groupedPositions).map(([asset, assetPositions]) => (
                <div key={asset}>
                  <div style={{
                    padding: '8px 8px 4px',
                    fontSize: 10,
                    fontWeight: 600,
                    color: MUTED,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    {asset}
                  </div>
                  {assetPositions.map((pos) => (
                    <div
                      key={pos.id}
                      onClick={() => handleSelectPosition(pos)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: 8,
                        marginBottom: 2,
                        background: selectedPosition?.id === pos.id ? 'rgba(62,196,192,0.1)' : 'transparent',
                        cursor: 'pointer',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                      }}
                      onMouseEnter={(e) => {
                        if (selectedPosition?.id !== pos.id) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedPosition?.id !== pos.id) {
                          e.currentTarget.style.background = 'transparent'
                        }
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: WHITE }}>
                            {pos.baseAssetSymbol}/{pos.quoteAssetSymbol}
                          </div>
                          <div style={{ fontSize: 10, color: MUTED }}>
                            {(pos.leverage || 0).toFixed(1)}x
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: WHITE }}>
                            {formatPrice(pos.currentPrice)}
                          </div>
                          <div style={{ 
                            fontSize: 10, 
                            color: pos.riskRatio >= 2 ? '#22c55e' : pos.riskRatio >= 1.2 ? '#f97316' : '#ef4444' 
                          }}>
                            Risk: {pos.riskRatio.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Center Column - Position Details */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            {selectedPosition ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div>
                  <h1 style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: WHITE,
                    margin: 0,
                  }}>
                    {selectedPosition.baseAssetSymbol}/{selectedPosition.quoteAssetSymbol}
                  </h1>
                  <span style={{
                    fontSize: 12,
                    color: CYAN,
                    fontWeight: 600,
                  }}>
                    {(selectedPosition.leverage || 0).toFixed(1)}x
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}>
                  <span style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: WHITE,
                    fontFamily: "'Space Mono', monospace",
                  }}>
                    {formatPrice(selectedPosition.currentPrice)}
                  </span>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>
                Select a position to view details
              </p>
            )}
          </div>

          {/* Position Stats */}
          {selectedPosition && (
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 16,
            }}>
              <div>
                <div style={{ fontSize: 10, color: MUTED, marginBottom: 4 }}>RISK RATIO</div>
                <div style={{ 
                  fontSize: 13, 
                  fontWeight: 600,
                  color: selectedPosition.riskRatio >= 2 ? '#22c55e' : selectedPosition.riskRatio >= 1.2 ? '#f97316' : '#ef4444' 
                }}>
                  {selectedPosition.riskRatio.toFixed(2)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: MUTED, marginBottom: 4 }}>BASE ASSET</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{selectedPosition.baseAsset}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: MUTED, marginBottom: 4 }}>BASE DEBT</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{selectedPosition.baseDebt}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: MUTED, marginBottom: 4 }}>LIQ DISTANCE</div>
                <div style={{ 
                  fontSize: 13, 
                  fontWeight: 600,
                  color: (selectedPosition.liquidationDistance || 0) >= 10 ? '#22c55e' : (selectedPosition.liquidationDistance || 0) >= 5 ? '#f97316' : '#ef4444'
                }}>
                  {(selectedPosition.liquidationDistance || 0).toFixed(1)}%
                </div>
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
            {selectedPosition ? 'Chart coming soon' : 'Select a position to view chart'}
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
          {/* Leverage Selector */}
          <LeverageSelector
            leverage={leverage}
            onLeverageChange={setLeverage}
            liquidationDistance={selectedPosition?.liquidationDistance ?? 10}
          />

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
              Margin Info
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: MUTED }}>Max Leverage</span>
                <span style={{ fontSize: 11, color: WHITE }}>20x</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: MUTED }}>Min Margin</span>
                <span style={{ fontSize: 11, color: WHITE }}>5%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: MUTED }}>Total Positions</span>
                <span style={{ fontSize: 11, color: WHITE }}>{positions.length}</span>
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
            <span style={{ fontSize: 13 }}>Order form coming soon</span>
          </div>
        </div>
      </div>
    </AppWrapper>
  )
}