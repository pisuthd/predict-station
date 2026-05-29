'use client'

import { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts'
import type { UTCTimestamp } from 'lightweight-charts'

interface OHLCVCandle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface PriceChartProps {
  candles: OHLCVCandle[]
  loading: boolean
  currentInterval?: string
  onIntervalChange?: (interval: string) => void
}

const CYAN = '#3EC4C0'
const MUTED = 'rgba(180,200,255,0.6)'

const INTERVALS = [
  { label: '5m', value: '5m' },
  { label: '1h', value: '1h' },
  { label: '4h', value: '4h' },
  { label: '1d', value: '1d' },
]

export function PriceChart({ candles, loading, currentInterval = '4h', onIntervalChange }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null)
  const seriesRef = useRef<ReturnType<ReturnType<typeof createChart>['addSeries']> | null>(null)
  const [activeInterval, setActiveInterval] = useState(currentInterval)

  useEffect(() => {
    setActiveInterval(currentInterval)
  }, [currentInterval])

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
      height: 300,
    })

    // Add candlestick series using the correct v5 API
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    })

    chartRef.current = chart
    seriesRef.current = candlestickSeries

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
  }, [])

  // Update data when candles change
  useEffect(() => {
    if (seriesRef.current && candles.length > 0) {
      // Sort candles by time (ascending order required)
      const sortedCandles = [...candles].sort((a, b) => a.time - b.time)
      
      const chartData = sortedCandles.map(candle => {
        // API returns milliseconds, convert to seconds for UTCTimestamp
        return {
          time: (candle.time / 1000) as UTCTimestamp,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        }
      })
      seriesRef.current.setData(chartData)
      
      // Fit content
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent()
      }
    }
  }, [candles])

  const handleIntervalClick = (interval: string) => {
    setActiveInterval(interval)
    if (onIntervalChange) {
      onIntervalChange(interval)
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Chart container */}
      <div style={{
        flex: 1,
        position: 'relative',
        minHeight: 0,
      }}>
        {/* Interval selector overlay */}
        <div style={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 10,
          display: 'flex',
          gap: 4,
          padding: '4px 8px',
          background: 'transparent',
          backdropFilter: 'blur(8px)',
          borderRadius: 6, 
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          {INTERVALS.map(interval => (
            <button
              key={interval.value}
              onClick={() => handleIntervalClick(interval.value)}
              style={{
                padding: '4px 10px',
                background: activeInterval === interval.value ? CYAN : 'transparent',
                border: 'none',
                borderRadius: 4,
                color: activeInterval === interval.value ? '#0a0a1a' : MUTED,
                fontSize: 11,
                fontFamily: "'Space Mono', monospace",
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {interval.label}
            </button>
          ))}
        </div>

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
        ) : candles.length === 0 ? (
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
            opacity: loading || candles.length === 0 ? 0.3 : 1,
          }} 
        />
      </div>
    </div>
  )
}