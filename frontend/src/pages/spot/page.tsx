'use client'

import { useState } from 'react'
import { NAVY } from '../../theme'
import { useSpotPools, type SpotPool, type OrderBook as OrderBookType } from '../../hooks'
import { PairList } from './components/PairList'
import { OrderBook } from './components/OrderBook'
import AppNavbar from '../../components/layout/AppNavbar'
import AppWrapper from '../../components/layout/AppWrapper'
import { getCoinIcon } from '../../lib/coinIcons'

const WHITE = '#ffffff'
const MUTED = 'rgba(180,200,255,0.6)'
const GREEN = '#22c55e'
const RED = '#ef4444'

export default function SpotPage() {
  const { pools, loading, error, refetch, getOrderBook } = useSpotPools(5_000)

  const [selectedPool, setSelectedPool] = useState<SpotPool | null>(null)
  const [orderBook, setOrderBook] = useState<OrderBookType | null>(null)
  const [orderBookLoading, setOrderBookLoading] = useState(false)

  const handleSelectPool = async (pool: SpotPool) => {
    setSelectedPool(pool)
    setOrderBookLoading(true)
    const ob = await getOrderBook(pool.poolName)
    setOrderBook(ob)
    setOrderBookLoading(false)
  }

  const formatPrice = (price: number | undefined): string => {
    if (!price) return '--'
    if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    if (price >= 1) return price.toFixed(4)
    return price.toFixed(6)
  }

  const formatVolume = (volume: number | undefined): string => {
    if (!volume) return '--'
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`
    return `$${(volume / 1e3).toFixed(0)}K`
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
        {/* Left Column - Pair List */}
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
              Spot Markets
            </h2>
          </div>

          <PairList
            pools={pools}
            selectedPool={selectedPool}
            onSelectPool={handleSelectPool}
            loading={loading}
            error={error}
            onRetry={refetch}
          />
        </div>

        {/* Center Column - Order Book */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflow: 'hidden',
        }}>
          {/* AppNavbar */}
          <AppNavbar />

          {/* Header with pair info */}
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            {selectedPool ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* Overlapping coin icons */}
                <div style={{ position: 'relative', width: 64, height: 32 }}>
                  <img 
                    src={getCoinIcon(selectedPool.baseAsset)} 
                    alt={selectedPool.baseAsset}
                    style={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: '50%',
                      border: '2px solid #0a0a1a',
                      position: 'absolute',
                      left: 0,
                      zIndex: 2,
                    }}
                  />
                  <img 
                    src={getCoinIcon(selectedPool.quoteAsset)} 
                    alt={selectedPool.quoteAsset}
                    style={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: '50%',
                      border: '2px solid #0a0a1a',
                      position: 'absolute',
                      left: 16,
                      zIndex: 1,
                    }}
                  />
                </div>
                <div>
                  <h1 style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: WHITE,
                    margin: 0,
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                    {selectedPool.baseAsset}/{selectedPool.quoteAsset}
                  </h1>
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
                    {formatPrice(selectedPool.lastPrice)}
                  </span>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>
                Select a trading pair to view the order book
              </p>
            )}
          </div>

          {/* Order Book */}
          <div style={{
            flex: 1,
            overflow: 'hidden',
          }}>
            <OrderBook
              orderBook={orderBook}
              loading={orderBookLoading}
            />
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
        }}>
          {/* Pool Info */}
          {selectedPool && (
            <div style={{
              padding: '12px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.05)',
              marginBottom: 16,
            }}>
              <div style={{
                fontSize: 11,
                color: MUTED,
                fontFamily: "'Space Mono', monospace",
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: 12,
              }}>
                Pool Info
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: MUTED }}>Last Price</span>
                  <span style={{ fontSize: 11, color: WHITE }}>{formatPrice(selectedPool.lastPrice)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: MUTED }}>24h Volume</span>
                  <span style={{ fontSize: 11, color: WHITE }}>{formatVolume(selectedPool.quoteVolume)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: MUTED }}>Tick Size</span>
                  <span style={{ fontSize: 11, color: WHITE }}>{(selectedPool.tickSize / Math.pow(10, selectedPool.quoteAssetDecimals)).toFixed(selectedPool.quoteAssetDecimals > 6 ? 6 : selectedPool.quoteAssetDecimals)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: MUTED }}>Min Size</span>
                  <span style={{ fontSize: 11, color: WHITE }}>{(selectedPool.minSize / Math.pow(10, selectedPool.baseAssetDecimals)).toFixed(4)}</span>
                </div>
              </div>
            </div>
          )}

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