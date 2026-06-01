'use client'

import { getCoinIcon } from '../../../lib/coinIcons'
import type { SpotPool } from '../../../hooks'

const MUTED = 'rgba(180,200,255,0.6)'
const GREEN = '#22c55e'
const RED = '#ef4444'

interface SpotHeaderProps {
  pool: SpotPool
  priceChange?: { change: number; changePct: number }
}

export function SpotHeader({ pool, priceChange }: SpotHeaderProps) {
  const fmtPrice = (price: number | undefined): string => {
    if (!price && price !== 0) return '--'
    if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    if (price >= 1) return price.toFixed(4)
    return price.toFixed(6)
  }

  // Get icons for base and quote assets
  const baseIcon = getCoinIcon(pool.baseAsset.toUpperCase())
  const quoteIcon = getCoinIcon(pool.quoteAsset.toUpperCase())

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.02)',
        borderRadius: 12,
        overflow: 'hidden',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Single line header */}
      <div style={{
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 11,
        gap: 24,
      }}>
        {/* Spot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: MUTED, fontSize: 10 }}>SPOT</span>
          <span style={{ fontWeight: 600 }}>${fmtPrice(pool.lastPrice)}</span>
          {priceChange && (
            <span style={{
              fontSize: 10,
              fontFamily: "'Space Mono', monospace",
              color: priceChange.change >= 0 ? GREEN : RED
            }}>
              {priceChange.changePct >= 0 ? '▲' : '▼'} {Math.abs(priceChange.changePct).toFixed(2)}%
            </span>
          )}
        </div>

        {/* Divider */}
        <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>

        {/* Market */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: MUTED, fontSize: 10 }}>MARKET</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <img
              src={baseIcon}
              alt={pool.baseAsset}
              style={{ width: 16, height: 16, borderRadius: '50%' }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            <span style={{ fontWeight: 600 }}>{pool.baseAsset}</span>
          </div>
          <span style={{ color: MUTED }}>/</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <img
              src={quoteIcon}
              alt={pool.quoteAsset}
              style={{ width: 16, height: 16, borderRadius: '50%' }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            <span style={{ fontWeight: 600 }}>{pool.quoteAsset}</span>
          </div>
        </div>

        {/* Divider */}
        <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>

        {/* 24h High */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: MUTED, fontSize: 10 }}>24H HIGH</span>
          <span style={{ fontWeight: 600 }}>${fmtPrice(pool.highestPrice24h)}</span>
        </div>

        {/* Divider */}
        <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>

        {/* 24h Low */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: MUTED, fontSize: 10 }}>24H LOW</span>
          <span style={{ fontWeight: 600 }}>${fmtPrice(pool.lowestPrice24h)}</span>
        </div>

        {/* Divider */}
        <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>

        {/* Bid */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: MUTED, fontSize: 10 }}>BID</span>
          <span style={{ fontWeight: 600, color: GREEN }}>${fmtPrice(pool.highestBid)}</span>
        </div>

        {/* Divider */}
        <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>

        {/* Ask */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: MUTED, fontSize: 10 }}>ASK</span>
          <span style={{ fontWeight: 600, color: RED }}>${fmtPrice(pool.lowestAsk)}</span>
        </div>
      </div>
    </div>
  )
}
