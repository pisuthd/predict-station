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

/**
 * Format date for settled markets
 */
// function formatSettledDate(timestamp: number): string {
//   const date = new Date(timestamp)
//   return date.toLocaleDateString('en-US', { 
//     month: 'short', 
//     day: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit',
//   })
// }

/**
 * Format expiry date for display
 */
function formatExpiryDate(expiryMs: number): string {
  const date = new Date(expiryMs)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format expiry time into detailed countdown (no seconds)
 */
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
  return diff > 0 && diff < 6 * 60 * 60 * 1000 // < 6 hours
}

export function MarketCard({ market, isSelected, onClick }: MarketCardProps) {
  const odds = market.odds 
  const spotUSD = market.spot / 1e9
  const strike = odds?.strikeK ?? 0
  const upProb = (odds?.upProb ?? 0.5) * 100
  const icon = getCurrencyIcon(market.asset)
  const isSettled = market.status === 'settled'
  const expiringSoon = isExpiringSoon(market.expiryMs)

  // For settled markets - show expiry, asset, settled_at, settlement_price
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
        {/* Header Row */}
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

        {/* Details Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            {/* Expiry */}
            <div style={{ fontSize: 10, color: MUTED, marginBottom: 2 }}>
              EXPIRY
            </div>
            <div style={{ fontSize: 12, color: WHITE }}>
              {formatExpiryDate(market.expiryMs)}
            </div>
          </div>
          
          {/* Settlement Price */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: MUTED, marginBottom: 2 }}>
              SETTLEMENT PRICE
            </div>
            <div style={{ fontSize: 12, color: WHITE }}>
              ${Math.round((market.settlementPrice as any)).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Settled At */}
        {/* {market.settledAt && (
          <div style={{ 
            fontSize: 10, 
            color: MUTED, 
            marginTop: 6,
            fontFamily: "'Space Mono', monospace",
          }}>
            Settled {formatSettledDate(market.settledAt)}
          </div>
        )} */}
      </div>
    )
  }

  // For active/pending markets - show odds and trade info
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
        <div style={{
          fontSize: 14,
          fontWeight: 700,
          color: upProb > 50 ? GREEN : RED
        }}>
          {upProb.toFixed(0)}%
        </div>
      </div>

      {/* Details Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          {/* Strike info */}
          <div style={{ fontSize: 10, color: MUTED, marginBottom: 2 }}>
            STRIKE
          </div>
          <div style={{ fontSize: 12, color: WHITE }}>
            {strike > spotUSD ? '>' : '<'} ${Math.round(strike).toLocaleString()}
          </div> 
        </div>
        <div>  
          <div style={{ 
            fontSize: 11, 
            color: expiringSoon ? RED : MUTED,
            fontFamily: "'Space Mono', monospace",
            marginTop: 4,
          }}>
            In {formatDetailedExpiry(market.expiryMs)}
          </div>
        </div>
        {/* Spot Price */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: MUTED, marginBottom: 2 }}>
            SPOT
          </div>
          <div style={{ fontSize: 12, color: WHITE }}>
            ${Math.round(spotUSD).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  )
}