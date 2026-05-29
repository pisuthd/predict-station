'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { type Market } from '../../../hooks'
import { MarketCard } from './MarketCard' 

const CYAN = '#3EC4C0'
const WHITE = '#ffffff'
const MUTED = 'rgba(180,200,255,0.6)'

type StatusFilter = 'active' | 'pending' | 'settled'

interface MarketListProps {
  markets: Market[]
  selectedMarket: Market | null
  onSelectMarket: (market: Market) => void
  loading: boolean
  error: string | null
  onRetry: () => void
}

export function MarketList({ markets, selectedMarket, onSelectMarket, loading, error, onRetry }: MarketListProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active')

  const filteredMarkets = useMemo(() => {
    let filtered = markets

    // Filter by status - always filter since we only have active/settled
    filtered = filtered.filter(m => m.status === statusFilter)

    // Filter by search
    if (search.trim()) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(m => 
        m.asset?.toLowerCase().includes(searchLower) ||
        m.oracle_id?.toLowerCase().includes(searchLower)
      )
    }

    return filtered
  }, [markets, statusFilter, search])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
      
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 8,
          padding: '8px 12px'
        }}>
          <Search size={14} color={MUTED} style={{ marginRight: 8, flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search markets..."
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

        {/* Status Filter */}
        {/* <div style={{ display: 'flex', gap: 6 }}>
          {(['active', 'pending', 'settled'] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: '6px 10px',
                fontSize: 11,
                fontFamily: "'DM Sans', sans-serif",
                background: statusFilter === status ? 'rgba(62,196,192,0.15)' : 'transparent',
                border: statusFilter === status ? '1px solid rgba(62,196,192,0.25)' : '1px solid transparent',
                borderRadius: 6,
                color: statusFilter === status ? CYAN : MUTED,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s ease',
              }}
            >
              {status}
            </button>
          ))}
        </div> */}
      </div>

      {/* Loading/Error/Empty States */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '8px 8px',
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
            {/* Spinning circle */}
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
        ) : filteredMarkets.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 120,
            color: MUTED,
            fontSize: 13,
          }}>
            No {statusFilter} markets
          </div>
        ) : (
          filteredMarkets.map((market) => (
            <MarketCard
              key={market.oracle_id}
              market={market}
              isSelected={selectedMarket?.oracle_id === market.oracle_id}
              onClick={() => onSelectMarket(market)}
            />
          ))
        )}
      </div>
 
    </div>
  )
}
