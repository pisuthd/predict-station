'use client'

import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  ReferenceLine,
  YAxis,
  XAxis,
} from 'recharts'
import { CYAN } from '../../../theme'
import { useMarketPrices } from '../../../hooks'

const WHITE = '#ffffff'

interface PriceChartProps {
  oracleId: string
  strike: number
  forwardPrice?: number
}

export function PriceChart({
  oracleId,
  strike,
  forwardPrice,
}: PriceChartProps) {
  const { history, loading } = useMarketPrices(
    oracleId,
    120, // more points = smoother
    1000 // faster updates
  )

  const chartData = useMemo(() => {
    if (!history?.prices?.length) return []

    const raw = history.prices.map(p => ({
      time: p.time,
      price: Number(p.price),
    }))

    // Smooth data using moving average
    return raw.map((point, index, arr) => {
      const window = arr.slice(
        Math.max(0, index - 3),
        Math.min(arr.length, index + 4)
      )

      const avg =
        window.reduce((sum, p) => sum + p.price, 0) /
        window.length

      return {
        time: point.time,
        price: avg,
      }
    })
  }, [history])

  if (loading || chartData.length === 0) {
    return (
      <div
        style={{
          height: 280,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: 12,
          color: '#666',
        }}
      >
        Loading price data...
      </div>
    )
  }

  const latestPrice =
    forwardPrice ||
    chartData[chartData.length - 1]?.price ||
    0

  const allPrices = chartData.map(d => d.price)

  const min = Math.min(...allPrices)
  const max = Math.max(...allPrices)

  // Better padding scaling
  const padding = (max - min) * 0.15 || 100

  const minPrice = min - padding
  const maxPrice = max + padding

  return (
    <div
      style={{
        height: 280,
        position: 'relative',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: 12,
        overflow: 'hidden',
        padding: '8px 0',
        backdropFilter: 'blur(12px)',
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{
            top: 15,
            right: 75,
            left: 15,
            bottom: 10,
          }}
        >
          <defs>
            <linearGradient
              id="colorPrice"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor={WHITE}
                stopOpacity={0.32}
              />
              <stop
                offset="100%"
                stopColor={WHITE}
                stopOpacity={0.01}
              />
            </linearGradient>

            {/* Glow */}
            <filter id="glow">
              <feGaussianBlur
                stdDeviation="3"
                result="coloredBlur"
              />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <XAxis hide dataKey="time" />

          <YAxis
            domain={[minPrice, maxPrice]}
            hide
          />

          {/* Strike Line */}
          <ReferenceLine
            y={strike}
            stroke={CYAN}
            strokeDasharray="5 4"
            strokeWidth={1.5}
            strokeOpacity={0.85}
          />

          {/* Price Area */}
          <Area
            type="monotoneX"
            dataKey="price"
            stroke={WHITE}
            strokeWidth={2.5}
            fill="url(#colorPrice)"
            filter="url(#glow)"
            isAnimationActive={true}
            animationDuration={350}
            animationEasing="linear"
            dot={false}
            activeDot={false}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Right Labels */}
      <div
        style={{
          position: 'absolute',
          right: 12,
          top: 12,
          bottom: 12,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          pointerEvents: 'none',
          fontFamily: "'Space Mono', monospace",
        }}
      >
        {/* Live Price */}
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: WHITE,
              lineHeight: 1.1,
              textShadow:
                '0 0 12px rgba(255,255,255,0.35)',
            }}
          >
            $
            {Math.round(latestPrice).toLocaleString()}
          </div>

          <div
            style={{
              fontSize: 10,
              color: 'rgba(180,200,255,0.6)',
              background:
                'rgba(180,200,255,0.06)',
              border:
                '1px solid rgba(180,200,255,0.12)',
              padding: '2px 8px',
              borderRadius: 4,
              display: 'inline-block',
              marginTop: 4,
              letterSpacing: 0.5,
            }}
          >
            SPOT
          </div>
        </div>

        {/* Strike */}
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: CYAN,
              lineHeight: 1.1,
            }}
          >
            ${Math.round(strike).toLocaleString()}
          </div>

          <div
            style={{
              fontSize: 10,
              color: CYAN,
              background:
                'rgba(62,196,192,0.08)',
              border:
                '1px solid rgba(62,196,192,0.18)',
              padding: '2px 8px',
              borderRadius: 4,
              display: 'inline-block',
              marginTop: 4,
              letterSpacing: 0.5,
            }}
          >
            FORWARD
          </div>
        </div>
      </div>
    </div>
  )
}