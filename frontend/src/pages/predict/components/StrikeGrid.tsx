'use client'

import { useMemo } from 'react'
import { CYAN, MUTED } from '../../../theme'
import type { Market } from '../../../hooks'
import { useMarketPrices } from '../../../hooks'
import { getCoinIcon } from '../../../lib/coinIcons'

const WHITE = '#ffffff'
const GREEN = '#22c55e'
const RED = '#ef4444'

interface StrikeGridProps {
  market: Market
  onSelectStrike?: (strike: number, direction: 'up' | 'down') => void
  selectedStrike?: number
}

function normCDF(x: number): number {
  const sign = x < 0 ? -1 : 1
  x = Math.abs(x) / Math.SQRT2
  const t = 1 / (1 + 0.3275911 * x)
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return 0.5 * (1 + sign * y)
}

const SVI_SCALE = 1e8
const RHO_SCALE = 1e9
const PRICE_SCALE = 1e9

interface SVIParams {
  a: number; b: number; rho: number; m: number; sigma: number
}

function sviVol(K: number, F: number, T: number, svi: SVIParams): number {
  if (T <= 0) return svi.sigma / SVI_SCALE
  const a = svi.a / SVI_SCALE
  const b = svi.b / SVI_SCALE
  const rho = svi.rho / RHO_SCALE
  const m = svi.m / SVI_SCALE
  const sig = svi.sigma / SVI_SCALE
  const k = Math.log(K / F)
  const w = a + b * (rho * (k - m) + Math.sqrt((k - m) ** 2 + sig ** 2))
  return w > 0 ? Math.sqrt(w / T) : sig
}

function binaryUpProb(F: number, K: number, T: number, vol: number): number {
  if (T <= 0 || vol <= 0) return F > K ? 1 : 0
  const d2 = (Math.log(F / K) - 0.5 * vol ** 2 * T) / (vol * Math.sqrt(T))
  return normCDF(d2)
}

interface StrikeEntry {
  strike: number
  upProb: number
  downProb: number
}

export function StrikeGrid({ market, onSelectStrike, selectedStrike }: StrikeGridProps) {
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
        upProb: Math.round(upProb * 100),
        downProb: Math.round((1 - upProb) * 100)
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
        upProb: Math.round(upProb * 100),
        downProb: Math.round((1 - upProb) * 100)
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
        
        {/* Right: Expiry */}
        <span style={{
          fontSize: 10,
          color: MUTED,
          fontFamily: "'Space Mono', monospace",
        }}>
          Heatmap
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
          {aboveStrikes.map((entry) => {
            const isSelected = selectedStrike === entry.strike
            return (
              <div
                key={entry.strike}
                onClick={() => onSelectStrike?.(entry.strike, 'up')}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 8,
                  padding: '4px 16px',
                  fontSize: 11,
                  position: 'relative',
                  cursor: 'pointer',
                  background: isSelected ? 'rgba(62,196,192,0.15)' : 'transparent',
                  borderLeft: isSelected ? `2px solid ${GREEN}` : '2px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent'
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
                <span style={{ color: isSelected ? GREEN : GREEN, position: 'relative', zIndex: 1, fontWeight: 600 }}>
                  {fmtStrike(entry.strike)}
                </span>
                <span style={{ color: MUTED, textAlign: 'right', position: 'relative', zIndex: 1 }}>
                  —
                </span>
                <span style={{ color: MUTED, textAlign: 'right', position: 'relative', zIndex: 1 }}>
                  {entry.upProb}%
                </span>
              </div>
            )
          })}
        </div>

        {/* SPOT Divider */}
        <div style={{
          padding: '8px 16px',
          background: 'rgba(62,196,192,0.1)',
          borderTop: '1px solid rgba(62,196,192,0.2)',
          borderBottom: '1px solid rgba(62,196,192,0.2)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 12,
        }}> 
          <span style={{ fontSize: 16, fontWeight: 700, color: WHITE }}>
            ${spotPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Below spot section - DOWN bets (red) */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {belowStrikes.map((entry) => {
            const isSelected = selectedStrike === entry.strike
            return (
              <div
                key={entry.strike}
                onClick={() => onSelectStrike?.(entry.strike, 'down')}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 8,
                  padding: '4px 16px',
                  fontSize: 11,
                  position: 'relative',
                  cursor: 'pointer',
                  background: isSelected ? 'rgba(62,196,192,0.15)' : 'transparent',
                  borderLeft: isSelected ? `2px solid ${RED}` : '2px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent'
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
                <span style={{ color: isSelected ? RED : RED, position: 'relative', zIndex: 1, fontWeight: 600 }}>
                  {fmtStrike(entry.strike)}
                </span>
                <span style={{ color: MUTED, textAlign: 'right', position: 'relative', zIndex: 1 }}>
                  —
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