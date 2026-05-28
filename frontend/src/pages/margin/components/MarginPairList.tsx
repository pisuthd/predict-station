'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { type MarginPosition } from '../../../hooks'

const CYAN = '#3EC4C0'
const WHITE = '#ffffff'
const MUTED = 'rgba(180,200,255,0.6)'
const GREEN = '#22c55e'
const RED = '#ef4444'
const ORANGE = '#f97316'

interface MarginPairListProps {
  positions: MarginPosition[]
  selectedPosition: MarginPosition | null
  onSelectPosition: (position: MarginPosition) => void
  loading: boolean
  error: string | null
  onRetry: () => void
}

export function MarginPairList({ positions, selectedPosition, onSelectPosition, loading, error, onRetry }: MarginPairListProps) {
  const [search, setSearch] = useState('')

  const filteredPositions = positions.filter(p => 
    `${p.baseAssetSymbol}/${p.quoteAssetSymbol}`.toLowerCase().includes(search.toLowerCase()) ||
    p.baseAssetSymbol.toLowerCase().includes(search.toLowerCase())
  )

  // Group by base asset
  const grouped = filteredPositions.reduce((acc, p) => {
    if (!acc[p.baseAssetSymbol]) acc[p.baseAssetSymbol] = []
    acc[p.baseAssetSymbol].push(p)
    return acc
  }, {} as Record<string, MarginPosition[]>)

  const formatPrice = (price: number): string => {
    if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    if (price >= 1) return price.toFixed(4)
    return price.toFixed(6)
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
        padding: '16px 16px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 8,
          padding: '8px 12px',
          marginBottom: 12,
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
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 4px',
          fontSize: 10,
          color: MUTED,
          fontFamily: "'Space Mono', monospace",
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          <span>Pair</span>
          <span>Price</span>
          <span>Risk</span>
        </div>
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
        ) : Object.keys(grouped).length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 120,
            color: MUTED,
            fontSize: 13,
          }}>
            No positions found
          </div>
        ) : (
          Object.entries(grouped).map(([asset, assetPositions]) => (
            <div key={asset}>
              {/* Asset Group Header */}
              <div style={{
                padding: '8px 8px 4px',
                fontSize: 10,
                fontWeight: 600,
                color: MUTED,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {asset}
              </div>
              {assetPositions.map((position) => (
                <MarginPositionCard
                  key={position.id}
                  position={position}
                  isSelected={selectedPosition?.id === position.id}
                  onClick={() => onSelectPosition(position)}
                  formatPrice={formatPrice}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

interface MarginPositionCardProps {
  position: MarginPosition
  isSelected: boolean
  onClick: () => void
  formatPrice: (price: number) => string
}

function MarginPositionCard({ position, isSelected, onClick, formatPrice }: MarginPositionCardProps) {
  const riskColor = position.riskRatio >= 2 ? GREEN : position.riskRatio >= 1.2 ? ORANGE : RED
  const leverage = position.leverage || 0

  return (
    <div
      onClick={onClick}
      style={{
        padding: '10px 8px',
        borderRadius: 8,
        marginBottom: 2,
        background: isSelected ? 'rgba(62,196,192,0.1)' : 'transparent',
        cursor: 'pointer',
        transition: 'background 0.2s ease',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {/* Left: Pair */}
        <div style={{ minWidth: 80 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: WHITE }}>
            {position.quoteAssetSymbol}
          </div>
          <div style={{ fontSize: 10, color: CYAN }}>
            {leverage.toFixed(1)}x
          </div>
        </div>

        {/* Center: Price */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            color: WHITE,
            fontFamily: "'Space Mono', monospace",
          }}>
            {formatPrice(position.currentPrice)}
          </div>
        </div>

        {/* Right: Risk */}
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: 10,
            fontWeight: 600,
            color: riskColor,
            fontFamily: "'Space Mono', monospace",
          }}>
            {position.riskRatio.toFixed(2)}
          </div>
          <div style={{
            fontSize: 9,
            color: MUTED,
            fontFamily: "'Space Mono', monospace",
          }}>
            Liq: {(position.liquidationDistance || 0).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  )
}