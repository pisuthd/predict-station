'use client'

import { useMemo, useState } from 'react'
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  ReferenceLine,
  YAxis,
} from 'recharts'
import { CYAN } from '../../../theme'
import { useMarketPrices, type Market } from '../../../hooks'
import { InfoTooltip } from './InfoTooltip'
import { formatDetailedExpiry, formatUSD } from '../utils'

const WHITE = '#ffffff'
const MUTED = 'rgba(180,200,255,0.6)'
const GREEN = '#22c55e'
const RED = '#ef4444'

interface PredictChartProps {
  market: Market
}



export function PredictChart({ market }: PredictChartProps) {

  const { history, loading } = useMarketPrices(market.oracle_id, 120, 1000)

  const chartData = useMemo(() => {
    if (!history?.prices?.length) return []

    const raw = history.prices.map(p => ({
      time: p.time,
      price: Number(p.price),
    }))

    return raw.map((point, index, arr) => {
      const window = arr.slice(
        Math.max(0, index - 3),
        Math.min(arr.length, index + 4)
      )
      const avg = window.reduce((sum, p) => sum + p.price, 0) / window.length
      return { time: point.time, price: avg }
    })
  }, [history])

  const spotUSD = market.spot / 1e9
  const forwardUSD = market.forward / 1e9
  const strike = market.odds?.strikeK ?? 0
  const distance = forwardUSD - strike
  const distancePct = strike > 0 ? (distance / strike) * 100 : 0
  const isPositive = distance >= 0

  if (loading || chartData.length === 0) {
    return (
      <div style={{
        height: 280,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: 12,
        color: '#666',
        fontSize: 13,
      }}>
        Loading price data...
      </div>
    )
  }

  const allPrices = chartData.map(d => d.price)
  const min = Math.min(...allPrices)
  const max = Math.max(...allPrices)
  const padding = (max - min) * 0.15 || 100
  const minPrice = min - padding
  const maxPrice = max + padding

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      borderRadius: 12,
      overflow: 'visible',
      backdropFilter: 'blur(12px)',
    }}>
      {/* Toggle Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px 8px',
      }}> 

        {/* LIVE Indicator */}
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
            LIVE 2m
          </span>
        </div>
      </div>

      {/* Chart Area */}
      <div style={{ height: 220, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 100, left: 15, bottom: 10 }}
          >
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={WHITE} stopOpacity={0.32} />
                <stop offset="100%" stopColor={WHITE} stopOpacity={0.01} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <YAxis domain={[minPrice, maxPrice]} hide />

            <ReferenceLine
              y={strike}
              stroke={CYAN}
              strokeDasharray="5 4"
              strokeWidth={1.5}
              strokeOpacity={0.85}
            />

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
        <div style={{
          position: 'absolute',
          right: 12,
          top: 20,
          bottom: 20,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          fontFamily: "'Space Mono', monospace",
          pointerEvents: 'none',
          gap: 16,
        }}>
          {/* Forward Price */}
          <div style={{ textAlign: 'right', pointerEvents: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <span style={{
                fontSize: 18,
                fontWeight: 700,
                color: WHITE,
                lineHeight: 1.1,
                textShadow: '0 0 12px rgba(255,255,255,0.35)',
              }}>
                ${Math.round(forwardUSD).toLocaleString()}
              </span>
              <div style={{ marginLeft: 6, pointerEvents: 'auto' }}>
                <InfoTooltip content="Forward price is the predicted price at expiry, derived from current spot + interest rate differential." />
              </div>
            </div>
            <div style={{ fontSize: 10, color: WHITE, opacity: 0.5, marginTop: 4, letterSpacing: 0.5 }}>
              FORWARD
            </div>
          </div>

          {/* Strike */}
          <div style={{ textAlign: 'right', pointerEvents: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: CYAN, lineHeight: 1.1 }}>
                ${Math.round(strike).toLocaleString()}
              </span>
              <div style={{ marginLeft: 6, pointerEvents: 'auto' }}>
                <InfoTooltip content="Strike is the target price level for the binary option. If BTC is above strike at expiry, UP wins." />
              </div>
            </div>
            <div style={{ fontSize: 10, color: CYAN, marginTop: 4, letterSpacing: 0.5 }}>
              STRIKE
            </div>
          </div>

          {/* Distance */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: isPositive ? GREEN : RED }}>
              {isPositive ? '+' : ''}{Math.round(distance).toLocaleString()}
              <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.8 }}>
                {isPositive ? '+' : ''}{distancePct.toFixed(2)}%
              </span>
            </div>
            <div style={{ fontSize: 10, color: MUTED, marginTop: 4, letterSpacing: 0.5 }}>
              DISTANCE
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 1,
        padding: '12px 16px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}>
        <QuickStat label="SPOT" value={formatUSD(spotUSD)} />
        <QuickStat label="FORWARD" value={formatUSD(forwardUSD)} />
        <QuickStat label="EXPIRY" value={formatDetailedExpiry(market.expiryMs)} />
        <QuickStat 
          label="STATUS" 
          value={market.status.toUpperCase()} 
          valueColor={market.status === 'active' ? CYAN : MUTED}
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

function QuickStat({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 9, color: MUTED, marginBottom: 4, letterSpacing: 0.5 }}>
        {label}
      </div>
      <div style={{ 
        fontSize: 12, 
        fontWeight: 600, 
        color: valueColor || WHITE,
        fontFamily: "'Space Mono', monospace",
      }}>
        {value}
      </div>
    </div>
  )
}
