'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { type SpotPool } from '../../../hooks'
import { getCoinIcon } from '../../../lib/coinIcons'

const CYAN = '#3EC4C0'
const WHITE = '#ffffff'
const MUTED = 'rgba(180,200,255,0.6)'
const GREEN = '#22c55e'
const RED = '#ef4444'

interface PairListProps {
  pools: SpotPool[]
  selectedPool: SpotPool | null
  onSelectPool: (pool: SpotPool) => void
  loading: boolean
  error: string | null
  onRetry: () => void
}

export function PairList({ pools, selectedPool, onSelectPool, loading, error, onRetry }: PairListProps) {
  const [search, setSearch] = useState('')

  // Filter active pairs: last_price > 0 and not frozen
  const activePools = pools.filter(p => 
    (p.lastPrice ?? 0) > 0 && !p.isFrozen
  )

  const filteredPools = activePools.filter(p => 
    p.poolName.toLowerCase().includes(search.toLowerCase()) ||
    p.baseAsset.toLowerCase().includes(search.toLowerCase()) ||
    p.quoteAsset.toLowerCase().includes(search.toLowerCase())
  )

  const formatPrice = (price: number | undefined): string => {
    if (!price) return '--'
    if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    if (price >= 1) return price.toFixed(4)
    return price.toFixed(6)
  }

  const formatVolume = (volume: number | undefined): string => {
    if (!volume) return '--'
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(0)}K`
    return `$${volume.toFixed(2)}`
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 8,
          padding: '8px 12px', 
        }}>
          <Search size={14} color={MUTED} style={{ marginRight: 8, flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search pairs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: WHITE,
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
              width: '100%',
            }}
          />
        </div>

        {/* Column Headers */}
        {/* <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 4px',
          fontSize: 10,
          color: MUTED,
          fontFamily: "'Space Mono', monospace",
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          <span>Market</span>
          <span>Price</span>
          <span>Volume</span>
        </div> */}
      </div>

      {/* Loading/Error/Empty States */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '4px 4px',
        minHeight: 0,
      }}>
        {loading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: 200,
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
            <span style={{ fontSize: 12, fontFamily: "'Space Mono', monospace" }}>
              Loading
            </span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : error ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: 200,
            gap: 12,
          }}>
            <div style={{ color: '#ef4444', fontSize: 13, textAlign: 'center' }}>
              ⚠ {error}
            </div>
            <button
              onClick={onRetry}
              style={{
                padding: '8px 16px',
                background: 'rgba(62,196,192,0.15)',
                border: '1px solid rgba(62,196,192,0.25)',
                borderRadius: 6,
                color: CYAN,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        ) : filteredPools.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 120,
            color: MUTED,
            fontSize: 13,
          }}>
            No active pairs found
          </div>
        ) : (
          filteredPools.map((pool) => (
            <PairCard
              key={pool.poolName}
              pool={pool}
              isSelected={selectedPool?.poolName === pool.poolName}
              onClick={() => onSelectPool(pool)}
              formatPrice={formatPrice}
              formatVolume={formatVolume}
            />
          ))
        )}
      </div>
    </div>
  )
}

interface PairCardProps {
  pool: SpotPool
  isSelected: boolean
  onClick: () => void
  formatPrice: (price: number | undefined) => string
  formatVolume: (volume: number | undefined) => string
}

function PairCard({ pool, isSelected, onClick, formatPrice, formatVolume }: PairCardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '12px 8px',
        borderRadius: 12,
        marginBottom: 4,
        background: isSelected ? 'rgba(62,196,192,0.1)' : 'transparent',
        cursor: 'pointer',
        transition: 'background 0.2s ease',
        border: isSelected ? '1px solid rgba(62,196,192,0.2)' : '1px solid transparent',
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
      {/* Market info with overlapping icons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
      }}>
        {/* Overlapping coin icons */}
        <div style={{ position: 'relative', width: 48, height: 24 }}>
          <img 
            src={getCoinIcon(pool.baseAsset)} 
            alt={pool.baseAsset}
            style={{ 
              width: 24, 
              height: 24, 
              borderRadius: '50%',
              border: '2px solid #0a0a1a',
              position: 'absolute',
              left: 0,
              zIndex: 2,
            }}
          />
          <img 
            src={getCoinIcon(pool.quoteAsset)} 
            alt={pool.quoteAsset}
            style={{ 
              width: 24, 
              height: 24, 
              borderRadius: '50%',
              border: '2px solid #0a0a1a',
              position: 'absolute',
              left: 12,
              zIndex: 1,
            }}
          />
        </div>
        
        {/* Pair name */}
        <span style={{
          fontSize: 14,
          fontWeight: 600,
          color: WHITE,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {pool.baseAsset}/{pool.quoteAsset}
        </span>
      </div>

      {/* Price and volume */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: 13,
            fontWeight: 600,
            color: WHITE,
            fontFamily: "'Space Mono', monospace",
          }}>
            {formatPrice(pool.lastPrice)}
          </span>
          {pool.change24h !== undefined && pool.change24h !== 0 && (
            <span style={{
              fontSize: 11,
              color: pool.change24h >= 0 ? GREEN : RED,
              fontFamily: "'Space Mono', monospace",
              fontWeight: 500,
            }}>
              {pool.change24h >= 0 ? '+' : ''}{pool.change24h.toFixed(2)}%
            </span>
          )}
        </div>
        <span style={{
          fontSize: 11,
          color: MUTED,
          fontFamily: "'Space Mono', monospace",
        }}>
          Vol. {formatVolume((pool.baseVolume ?? 0) + (pool.quoteVolume ?? 0))}
        </span>
      </div>
    </div>
  )
}