'use client'

import { useMemo } from 'react'
import { MUTED } from '../../../theme'
import type { Market } from '../../../hooks'
import { useMarketPrices, sviVol, binaryUpProb, type SVIParams } from '../../../hooks' 

const WHITE = '#ffffff' 
const PRICE_SCALE = 1e9

export type StrikeGridMode = 'binary' | 'range'

interface StrikeGridProps {
  market: Market
  mode?: StrikeGridMode
  direction?: 'up' | 'down'
  onStrikeChange?: (strike1: number, strike2: number | null, direction: 'up' | 'down') => void
}

interface StrikeEntry {
  strike: number
  upProb: number
  downProb: number
}

interface Signal {
  indicator: string
  color: string
}

export function StrikeGrid({ market, mode = 'binary', direction = 'up', onStrikeChange }: StrikeGridProps) {

  
  const forwardPrice = market.forward / PRICE_SCALE
  const spotPrice = market.spot / PRICE_SCALE
  const T = Math.max(0, (market.expiryMs - Date.now()) / (365.25 * 24 * 3600 * 1000))
  
  const sviParams: SVIParams = market.svi ? {
    a: market.svi.a,
    b: market.svi.b,
    rho: market.svi.rho,
    m: market.svi.m,
    sigma: market.svi.sigma
  } : {
    a: 80887, b: 9328786, rho: 102029829, m: 7561599, sigma: 9522806
  }

  // Handle spot click
  const handleSelectSpot = () => {
    if (mode === 'range') {
      onStrikeChange?.(spotPrice, spotPrice + 10, direction)
    } else {
      onStrikeChange?.(spotPrice, null, direction)
    }
  }

  // Generate 20 strikes: 10 above + 10 below, tick = $1000
  const strikes = useMemo(() => {
    const entries: StrikeEntry[] = []
    const tickSize = 1000
    const numAbove = 10
    const numBelow = 10
    
    const baseStrike = Math.round(forwardPrice / tickSize) * tickSize
    
    // Above (strikes > forward)
    for (let i = 1; i <= numAbove; i++) {
      const strike = baseStrike + (i * tickSize)
      const vol = sviVol(strike, forwardPrice, T, sviParams)
      const upProb = binaryUpProb(forwardPrice, strike, T, vol)
      entries.push({
        strike,
        upProb: Math.round(upProb),
        downProb: Math.round(100 - upProb)
      })
    }
    
    // Below (strikes <= forward)
    for (let i = 0; i <= numBelow; i++) {
      const strike = baseStrike - (i * tickSize)
      if (strike <= 0) continue
      const vol = sviVol(strike, forwardPrice, T, sviParams)
      const upProb = binaryUpProb(forwardPrice, strike, T, vol)
      entries.push({
        strike,
        upProb: Math.round(upProb),
        downProb: Math.round(100 - upProb)
      })
    }
    
    entries.sort((a, b) => b.strike - a.strike)
    return entries
  }, [forwardPrice, T, sviParams])

  const fmtStrike = (v: number) => `$${(v).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

  // Above section (strikes > forward), sorted high to low
  const aboveStrikes = strikes.filter(s => s.strike > forwardPrice)
  // Below section (strikes <= forward), sorted high to low
  const belowStrikes = strikes.filter(s => s.strike <= forwardPrice).sort((a, b) => b.strike - a.strike)

  // Get signal for above section (relative to next row)
  const getAboveSignal = (entry: StrikeEntry, index: number): Signal => {
    // Compare to the next row (lower strike) - upProb should decrease as we go higher
    const nextProb = index < aboveStrikes.length - 1 ? aboveStrikes[index + 1].upProb : entry.upProb
    const diff = entry.upProb - nextProb
    
    // Determine indicator based on probability level
    if (entry.upProb >= 60) {
      // Very likely - 2 arrows, high opacity
      const arrows = diff >= 0 ? '▲▲' : '▼▼'
      return { indicator: arrows, color: `rgba(34,197,94,0.9)` }
    } else if (entry.upProb >= 40) {
      // Likely - 1 arrow, medium opacity
      const arrows = diff >= 0 ? '▲' : '▼'
      return { indicator: arrows, color: `rgba(34,197,94,0.7)` }
    } else {
      // Unlikely - circle
      return { indicator: '●', color: MUTED }
    }
  }

  // Get signal for below section (relative to next row)
  const getBelowSignal = (entry: StrikeEntry, index: number): Signal => {
    // Compare to the next row (lower strike) - downProb should increase as we go lower
    const nextProb = index < belowStrikes.length - 1 ? belowStrikes[index + 1].downProb : entry.downProb
    const diff = entry.downProb - nextProb
    
    // Determine indicator based on probability level
    if (entry.downProb >= 60) {
      // Very likely - 2 arrows, high opacity
      const arrows = diff >= 0 ? '▼▼' : '▲▲'
      return { indicator: arrows, color: `rgba(239,68,68,0.9)` }
    } else if (entry.downProb >= 40) {
      // Likely - 1 arrow, medium opacity
      const arrows = diff >= 0 ? '▼' : '▲'
      return { indicator: arrows, color: `rgba(239,68,68,0.7)` }
    } else {
      // Unlikely - circle
      return { indicator: '●', color: MUTED }
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      fontFamily: "'Space Mono', monospace",
    }}> 

      {/* Column Headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr 1fr',
        gap: 8,
        padding: '8px 16px',
        fontSize: 10,
        color: MUTED,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <span>Strike</span>
        <span style={{ textAlign: 'center' }}>Signal</span>
        <span style={{ textAlign: 'right' }}>%</span>
      </div>

      {/* Strikes List */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {/* Above spot section - UP bets (green bars) */}
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          {aboveStrikes.map((entry, index) => {
            const signal = getAboveSignal(entry, index)
            return (
              <div
                key={entry.strike}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 2fr 1fr',
                  gap: 8,
                  padding: '4px 16px',
                  fontSize: 11,
                  position: 'relative',
                  background: 'transparent',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent'
                }}
              >
                {/* Depth bar background */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  right: 0,
                  width: `${entry.upProb}%`,
                  background: 'rgba(34,197,94,0.12)',
                  pointerEvents: 'none',
                }} />
                <span style={{ color: WHITE, position: 'relative', zIndex: 1, fontWeight: 600 }}>
                  {fmtStrike(entry.strike)}
                </span>
                <span style={{ color: signal.color, textAlign: 'center', position: 'relative', zIndex: 1, fontSize: 12 }}>
                  {signal.indicator}
                </span>
                <span style={{ color: MUTED, textAlign: 'right', position: 'relative', zIndex: 1 }}>
                  {entry.upProb}%
                </span>
              </div>
            )
          })}
        </div>

        {/* SPOT/Forward Divider - Clickable */}
        <div 
          onClick={handleSelectSpot}
          style={{
            padding: '8px 16px',
            background: 'rgba(62,196,192,0.1)',
            borderTop: '1px solid rgba(62,196,192,0.2)',
            borderBottom: '1px solid rgba(62,196,192,0.2)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 12,
            cursor: 'pointer',
            transition: 'background 0.2s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(62,196,192,0.2)'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(62,196,192,0.1)'
          }}
        > 
          <span style={{ fontSize: 16, fontWeight: 700, color: WHITE }}>
            ${spotPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span> 
        </div>

        {/* Below spot section - DOWN bets (red bars) */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {belowStrikes.map((entry, index) => {
            const signal = getBelowSignal(entry, index)
            return (
              <div
                key={entry.strike}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 2fr 1fr',
                  gap: 8,
                  padding: '4px 16px',
                  fontSize: 11,
                  position: 'relative',
                  background: 'transparent',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent'
                }}
              >
                {/* Depth bar background */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  right: 0,
                  width: `${entry.downProb}%`,
                  background: 'rgba(239,68,68,0.12)',
                  pointerEvents: 'none',
                }} />
                <span style={{ color: WHITE, position: 'relative', zIndex: 1, fontWeight: 600 }}>
                  {fmtStrike(entry.strike)}
                </span>
                <span style={{ color: signal.color, textAlign: 'center', position: 'relative', zIndex: 1, fontSize: 12 }}>
                  {signal.indicator}
                </span>
                <span style={{ color: MUTED, textAlign: 'right', position: 'relative', zIndex: 1 }}>
                  {entry.downProb}%
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}