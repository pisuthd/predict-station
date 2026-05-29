'use client'

import { useState, useEffect, useCallback } from 'react'
import { NAVY } from '../../theme'
import { useSpotPools, type SpotPool, type OrderBook as OrderBookType } from '../../hooks'

interface OHLCVCandle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}
import { PairList } from './components/PairList'
import { OrderBook } from './components/OrderBook'
import { PriceChart } from './components/PriceChart'
import AppNavbar from '../../components/layout/AppNavbar'
import AppWrapper from '../../components/layout/AppWrapper'

const WHITE = '#ffffff'
const MUTED = 'rgba(180,200,255,0.6)'
const GREEN = '#22c55e'
const RED = '#ef4444'

export default function SpotPage() {
  const { pools, loading, error, refetch, getOrderBook, getOHLCV } = useSpotPools(5_000)

  const [selectedPool, setSelectedPool] = useState<SpotPool | null>(pools[0] || null)
  const [orderBook, setOrderBook] = useState<OrderBookType | null>(null)
  const [orderBookLoading, setOrderBookLoading] = useState(false)
  const [candles, setCandles] = useState<OHLCVCandle[]>([])
  const [chartLoading, setChartLoading] = useState(false)
  const [activeInterval, setActiveInterval] = useState('4h')

  // Auto-select first pool when pools are loaded
  useEffect(() => {
    if (pools.length > 0 && !selectedPool) {
      const firstPool = pools[0]
      setSelectedPool(firstPool)
      loadOrderBook(firstPool)
      loadOHLCV(firstPool.poolName, activeInterval)
    }
  }, [pools])

  const loadOrderBook = async (pool: SpotPool) => {
    setOrderBookLoading(true)
    const ob = await getOrderBook(pool.poolName)
    setOrderBook(ob)
    setOrderBookLoading(false)
  }

  const loadOHLCV = useCallback(async (poolName: string, interval: string) => {
    setChartLoading(true)
    const data = await getOHLCV(poolName, interval, 100)
    setCandles(data)
    setChartLoading(false)
  }, [getOHLCV])

  const handleSelectPool = async (pool: SpotPool) => {
    setSelectedPool(pool)
    setOrderBookLoading(true)
    const ob = await getOrderBook(pool.poolName)
    setOrderBook(ob)
    setOrderBookLoading(false)
    // Load OHLCV data
    loadOHLCV(pool.poolName, activeInterval)
  }

  const handleIntervalChange = (interval: string) => {
    setActiveInterval(interval)
    if (selectedPool) {
      loadOHLCV(selectedPool.poolName, interval)
    }
  }

  const formatPrice = (price: number | undefined): string => {
    if (!price && price !== 0) return '--'
    if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    if (price >= 1) return price.toFixed(4)
    return price.toFixed(6)
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

        {/* Center Column - Market Details + Chart */}
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
              /* Market data grid */
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 16,
              }}>
                <div>
                  <div style={{ fontSize: 10, color: MUTED, marginBottom: 4, textTransform: 'uppercase' }}>24h High</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{formatPrice(selectedPool.highestPrice24h)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: MUTED, marginBottom: 4, textTransform: 'uppercase' }}>24h Low</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{formatPrice(selectedPool.lowestPrice24h)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: MUTED, marginBottom: 4, textTransform: 'uppercase' }}>Best Bid</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: GREEN }}>{formatPrice(selectedPool.highestBid)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: MUTED, marginBottom: 4, textTransform: 'uppercase' }}>Best Ask</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: RED }}>{formatPrice(selectedPool.lowestAsk)}</div>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>
                Select a trading pair to view details
              </p>
            )}
          </div>

          {/* Price Chart */}
          {selectedPool && (
            <PriceChart
              candles={candles}
              loading={chartLoading}
              currentInterval={activeInterval}
              onIntervalChange={handleIntervalChange}
            />
          )}
        </div>

        {/* Right Column - Order Book */}
        <div style={{
          width: 360,
          height: '100vh',
          flexShrink: 0,
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Order Book */}
          {selectedPool && (
            <OrderBook
              orderBook={orderBook}
              loading={orderBookLoading}
              baseAsset={selectedPool.baseAsset}
              quoteAsset={selectedPool.quoteAsset}
            />
          )}
        </div>
      </div>
    </AppWrapper>
  )
}