'use client'

import { CURRENCY_MAP } from '../utils'
import { type Market } from '../../../hooks'

const RED = '#ef4444'
const WHITE = '#ffffff'
const MUTED = 'rgba(180,200,255,0.6)'
const GREEN = '#22c55e'

interface MarketCardProps {
  market: Market
  isSelected: boolean
  onClick: () => void
}

function getCurrencyIcon(asset: string): string {
  return CURRENCY_MAP[asset.toUpperCase()] || CURRENCY_MAP['BTC']
}

function formatExpiryDate(expiryMs: number): string {
  const date = new Date(expiryMs)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDetailedExpiry(expiryMs: number): string {
  const diff = expiryMs - Date.now()
  if (diff <= 0) return 'soon'
  
  const m = Math.floor(diff / 60000)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  
  if (d > 0) {
    const remainingH = h % 24
    return remainingH > 0 ? `${d}d ${remainingH}h` : `${d}d`
  }
  if (h > 0) {
    const remainingM = m % 60
    return remainingM > 0 ? `${h}h ${remainingM}m` : `${h}h`
  }
  return `${m}m`
}

function isExpiringSoon(expiryMs: number): boolean {
  const diff = expiryMs - Date.now()
  return diff > 0 && diff < 6 * 60 * 60 * 1000
}

export function MarketCard({ market, isSelected, onClick }: MarketCardProps) {
  const odds = market.odds 
  const spotUSD = market.spot / 1e9
  const upProb = ((odds?.upProb ?? 0.5) * 100).toFixed(0)
  const downProb = ((1 - (odds?.upProb ?? 0.5)) * 100).toFixed(0)
  const icon = getCurrencyIcon(market.asset)
  const isSettled = market.status === 'settled'
  const expiringSoon = isExpiringSoon(market.expiryMs)

  if (isSettled) {
    return (
      <div
        onClick={onClick}
        style={{
          padding: '14px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: isSelected ? 'rgba(62,196,192,0.1)' : 'transparent',
          cursor: 'pointer',
          transition: 'background 0.2s ease',
          borderRadius: 10,
          marginBottom: 4,
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.background = 'transparent'
          }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img 
              src={icon}
              alt={market.asset}
              width={20}
              height={20}
              style={{ borderRadius: '50%' }}
            />
            <span style={{ fontSize: 13, fontWeight: 600, color: WHITE }}>
              {market.asset}
            </span>
          </div>
          <div style={{ fontSize: 12, color: MUTED }}>
            Settled
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: 10, color: MUTED, marginBottom: 2 }}>
              EXPIRY
            </div>
            <div style={{ fontSize: 12, color: WHITE }}>
              {formatExpiryDate(market.expiryMs)}
            </div>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: MUTED, marginBottom: 2 }}>
              SETTLEMENT PRICE
            </div>
            <div style={{ fontSize: 12, color: WHITE }}>
              ${Math.round((market.settlementPrice as any)).toLocaleString()}
            </div>
          </div>
        </div> 
      </div>
    )
  }

  return (
    <div
      onClick={onClick}
      style={{
        padding: '14px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: isSelected ? 'rgba(62,196,192,0.1)' : 'transparent',
        cursor: 'pointer',
        transition: 'background 0.2s ease',
        borderRadius: 10,
        marginBottom: 4,
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = 'transparent'
        }
      }}
    >
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img 
            src={icon}
            alt={market.asset}
            width={20}
            height={20}
            style={{ borderRadius: '50%' }}
          />
          <span style={{ fontSize: 13, fontWeight: 600, color: WHITE }}>
            {market.asset}
          </span>
        </div>
        <div style={{ 
          fontSize: 13, 
          fontWeight: 700, 
          color: WHITE,
          fontFamily: "'Space Mono', monospace",
        }}>
          ${Math.round(spotUSD).toLocaleString()}
        </div>
      </div>

      {/* Details Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
 
        <div style={{ 
          fontSize: 11, 
          color: expiringSoon ? RED : MUTED,
          fontFamily: "'Space Mono', monospace",
        }}>
          price in {formatDetailedExpiry(market.expiryMs)}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 9, color: GREEN, fontFamily: "'Space Mono', monospace" }}>▲</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: GREEN }}>
              {upProb}%
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 9, color: RED, fontFamily: "'Space Mono', monospace" }}>▼</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: RED }}>
              {downProb}%
            </span>
          </div>
        </div>
         
        
      </div>
    </div>
  )
}