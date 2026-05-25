'use client'

import { useState, useEffect, useRef } from 'react'
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  ReferenceLine,
  YAxis,
  XAxis,
} from 'recharts'
import { CYAN } from '../../../theme'

const WHITE = '#ffffff'

interface PriceChartProps {
  currentPrice: number
  strike: number
}

export function PriceChart({
  currentPrice,
  strike,
}: PriceChartProps) {
  const [data, setData] = useState<
    { price: number; time: number }[]
  >([])

  const targetPrice = useRef(currentPrice)

  const windowMs = 5 * 60 * 1000
  const numPoints = 60

  // Initial data
  useEffect(() => {
    const now = Date.now()

    const initial = Array.from({ length: numPoints }, (_, i) => {
      const progress = i / numPoints

      return {
        time: now - (1 - progress) * windowMs,
        price:
          currentPrice +
          Math.sin(progress * 8) * 80 +
          (Math.random() - 0.5) * 20,
      }
    })

    setData(initial)
  }, [currentPrice])

  // Smooth movement
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (!prev.length) return prev

        const last = prev[prev.length - 1]

        // Occasionally move target
        if (Math.random() < 0.15) {
          targetPrice.current +=
            (Math.random() - 0.5) * 120
        }

        // Smooth interpolation
        const nextPrice =
          last.price +
          (targetPrice.current - last.price) * 0.08

        const next = {
          time: Date.now(),
          price: nextPrice,
        }

        return [...prev.slice(1), next]
      })
    }, 100)

    return () => clearInterval(interval)
  }, [])

  if (!data.length) {
    return <div style={{ height: 280 }} />
  }

  const latestPrice =
    data[data.length - 1]?.price || currentPrice

  const prices = data.map(d => d.price)

  const minPrice = Math.min(...prices) - 100
  const maxPrice = Math.max(...prices) + 100

  return (
    <div style={{ height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 80,
            left: 0,
            bottom: 0,
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
                stopOpacity={0.25}
              />
              <stop
                offset="100%"
                stopColor={WHITE}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <XAxis dataKey="time" hide />

          <YAxis
            domain={[minPrice, maxPrice]}
            hide
          />

          <ReferenceLine
            y={strike}
            stroke={CYAN}
            strokeDasharray="6 4"
            strokeWidth={1.5}
          />

          <Area
            type="monotoneX"
            dataKey="price"
            stroke={WHITE}
            strokeWidth={2.5}
            fill="url(#colorPrice)"
            isAnimationActive={false}
            dot={false}
            activeDot={false}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div
        style={{
          position: 'absolute',
          right: 10,
          top: 10,
          color: WHITE,
          fontSize: 14,
          fontWeight: 'bold',
          fontFamily: "'Space Mono', monospace",
          background: 'rgba(0,0,0,0.6)',
          padding: '4px 8px',
          borderRadius: 4,
        }}
      >
        ${Math.round(latestPrice).toLocaleString()}
      </div>
    </div>
  )
}