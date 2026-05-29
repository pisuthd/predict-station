'use client'

import { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, LineSeries } from 'lightweight-charts'
import type { UTCTimestamp } from 'lightweight-charts'
import { useMarketPrices, type Market } from '../../../hooks'

const WHITE = '#ffffff'
const MUTED = 'rgba(180,200,255,0.6)'
const CYAN = '#3EC4C0'

interface PriceChart2Props {
  market: Market
  timeRange?: number // seconds: 120 (2m), 300 (5m), 900 (15m), 1800 (30m)
}

export function PriceChart2({ market, timeRange: initialTimeRange = 1800 }: PriceChart2Props) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null)
  const seriesRef = useRef<ReturnType<ReturnType<typeof createChart>['addSeries']> | null>(null)

  // State to allow clicking to change time range
  const [selectedRange, setSelectedRange] = useState(initialTimeRange)

  // Proportional refresh interval based on time range
  // 2m → 1.2s, 5m → 3s, 15m → 9s, 30m → 9s (same as 15m)
  const getRefreshInterval = (range: number) => {
    if (range === 120) return 1200 // 2m
    if (range === 300) return 3000 // 5m
    return 9000 // 15m, 30m, and 60m share the same refresh
  }
  const refreshInterval = getRefreshInterval(selectedRange)

  const { history, loading } = useMarketPrices(market.oracle_id, selectedRange, refreshInterval)

  const spotUSD = market.spot / 1e9
  const strike = market.odds?.strikeK ?? 0

  useEffect(() => {
    if (!chartContainerRef.current) return

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: MUTED,
        fontFamily: "'Space Mono', monospace",
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.05)' },
        horzLines: { color: 'rgba(255,255,255,0.05)' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: CYAN,
          labelBackgroundColor: CYAN,
        },
        horzLine: {
          color: CYAN,
          labelBackgroundColor: CYAN,
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(255,255,255,0.08)',
      },
      timeScale: {
        borderColor: 'rgba(255,255,255,0.08)',
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: 280,
    })

    // Add line series with disabled default price lines
    const lineSeries = chart.addSeries(LineSeries, {
      color: WHITE,
      lineWidth: 2,
      lastValueVisible: false,
      priceLineVisible: false,
    })

    chartRef.current = chart
    seriesRef.current = lineSeries

    // Fit content
    chart.timeScale().fitContent()

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [selectedRange])

  // Update data when history changes
  useEffect(() => {
    if (seriesRef.current && history?.prices?.length) {
      const chartData = history.prices.map(p => ({
        time: (p.time / 1000) as UTCTimestamp,
        value: Number(p.price),
      }))
      seriesRef.current.setData(chartData)

      // Fit content
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent()
      }
    }
  }, [history])

  // const getRangeLabel = (range: number) => {
  //   if (range === 120) return '2m'
  //   if (range === 300) return '5m'
  //   if (range === 900) return '15m'
  //   if (range === 1800) return '30m'
  //   return '60m'
  // }
  // const rangeLabel = getRangeLabel(selectedRange)

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      borderRadius: 12,
      overflow: 'hidden',
      backdropFilter: 'blur(12px)',
    }}>
      {/* Header */}
      {/* <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px 8px',
      }}>
         
         <div style={{
          display: 'flex',
          gap: 4,
          padding: '2px 4px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 6,
        }}>
          {[5, 15, 30].map(min => {
            const val = min * 60
            const label = `${min}m`
            return (
              <button
                key={val}
                onClick={() => setSelectedRange(val)}
                style={{
                  padding: '4px 10px',
                  background: selectedRange === val ? CYAN : 'transparent',
                  border: 'none',
                  borderRadius: 4,
                  color: selectedRange === val ? '#0a0a1a' : MUTED,
                  fontWeight: 600,
                  fontSize: 10,
                  fontFamily: "'Space Mono', monospace",
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            )
          })}
        </div> 

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 6,
            height: 6,
            background: CYAN,
            borderRadius: '50%',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
          <span style={{
            fontSize: 10,
            color: CYAN,
            fontFamily: "'Space Mono', monospace",
            letterSpacing: '0.1em',
          }}>
            LIVE
          </span>
        </div>
      </div> */}

      {/* Chart container */}
      <div style={{
        height: 280,
        position: 'relative',
      }}>
        {loading ? (
          <div style={{
            position: 'absolute',
            inset: 0,
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
            <span style={{ fontSize: 12 }}>Loading chart</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : !history?.prices?.length ? (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: MUTED,
            fontSize: 13,
          }}>
            No chart data available
          </div>
        ) : null}

        {/* Chart */}
        <div
          ref={chartContainerRef}
          style={{
            width: '100%',
            height: '100%',
            opacity: loading || !history?.prices?.length ? 0.3 : 1,
          }}
        />
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
      `}</style>
    </div>
  )
}