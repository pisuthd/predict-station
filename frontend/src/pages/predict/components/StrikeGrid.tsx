'use client'

import { useMemo } from 'react'
import { CYAN, MUTED } from '../../../theme'
import type { Market } from '../../../hooks'
import { useMarketPrices, sviVol, binaryUpProb, type SVIParams } from '../../../hooks'
import { getCoinIcon } from '../../../lib/coinIcons'

const WHITE = '#ffffff'
const GREEN = '#22c55e'
const RED = '#ef4444'
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

export function StrikeGrid({ market, mode = 'binary', direction = 'up', onStrikeChange }: StrikeGridProps) {
  useMarketPrices(market.oracle_id, 300, 2000)
  
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

  // Handle selection based on mode
  const handleSelectStrike = (strike: number) => {
    if (mode === 'range') {
      // Range: use strike as lower, add 1000 for upper
      onStrikeChange?.(strike, strike + 1000, direction)
    } else {
      // Binary: use strike only, pass current direction
      onStrikeChange?.(strike, null, direction)
    }
  }

  // Handle spot click
  const handleSelectSpot = () => {
    if (mode === 'range') {
      onStrikeChange?.(spotPrice, spotPrice + 1000, direction)
    } else {
      onStrikeChange?.(spotPrice, null, direction)
    }
  }

  // Generate 10 strikes: 5 above + 5 below, tick = $1000
  const strikes = useMemo(() => {
    const entries: StrikeEntry[] = []
    const tickSize = 1000
    const numAbove = 5
    const numBelow = 5
    
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

  // Above section (UP bets - green)
  const aboveStrikes = strikes.filter(s => s.strike > forwardPrice)
  // Below section (DOWN bets - red), sorted high to low within section
  const belowStrikes = strikes.filter(s => s.strike <= forwardPrice).sort((a, b) => b.strike - a.strike)

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      fontFamily: "'Space Mono', monospace",
    }}>
      {/* Header with icons and title */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Left: Icons + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative', width: 40, height: 20 }}>
            <img 
              src={getCoinIcon('BTC')} 
              alt="BTC"
              style={{ 
                width: 20, height: 20, borderRadius: '50%',
                border: '2px solid #0a0a1a', position: 'absolute', left: 0, zIndex: 2,
              }}
            />
            <img 
              src={getCoinIcon('USDC')} 
              alt="DUSDC"
              style={{ 
                width: 20, height: 20, borderRadius: '50%',
                border: '2px solid #0a0a1a', position: 'absolute', left: 10, zIndex: 1,
              }}
            />
          </div>
          <span style={{
            fontSize: 13,
            fontWeight: 600,
            color: WHITE,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            BTC/DBUSDC
          </span>
        </div>
        
        {/* Right: Mode indicator */}
        <span style={{
          fontSize: 10,
          color: CYAN,
          fontFamily: "'Space Mono', monospace",
        }}>
          {mode === 'binary' ? 'BINARY' : 'RANGE'}
        </span>
      </div>

      {/* Column Headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 8,
        padding: '8px 16px',
        fontSize: 10,
        color: MUTED,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <span>Strike</span>
        <span style={{ textAlign: 'right' }}>Mint (¢)</span>
        <span style={{ textAlign: 'right' }}>%</span>
      </div>

      {/* Strikes List */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {/* Above spot section - UP bets (green) */}
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          {aboveStrikes.map((entry) => (
            <div
              key={entry.strike}
              onClick={() => handleSelectStrike(entry.strike)}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 8,
                padding: '4px 16px',
                fontSize: 11,
                position: 'relative',
                cursor: 'pointer',
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
              <span style={{ color: MUTED, textAlign: 'right', position: 'relative', zIndex: 1 }}>
                —
              </span>
              <span style={{ color: MUTED, textAlign: 'right', position: 'relative', zIndex: 1 }}>
                {entry.upProb}%
              </span>
            </div>
          ))}
        </div>

        {/* SPOT Divider - Clickable */}
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

        {/* Below spot section - DOWN bets (red) */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {belowStrikes.map((entry) => (
            <div
              key={entry.strike}
              onClick={() => handleSelectStrike(entry.strike)}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 8,
                padding: '4px 16px',
                fontSize: 11,
                position: 'relative',
                cursor: 'pointer',
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
              <span style={{ color: MUTED, textAlign: 'right', position: 'relative', zIndex: 1 }}>
                —
              </span>
              <span style={{ color: MUTED, textAlign: 'right', position: 'relative', zIndex: 1 }}>
                {entry.downProb}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}