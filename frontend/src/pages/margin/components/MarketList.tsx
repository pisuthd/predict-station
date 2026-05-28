'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { type MarginMarket } from '../../../hooks/useMarginMarkets'
import { getCoinIcon } from '../../../lib/coinIcons'

const CYAN = '#3EC4C0'
const WHITE = '#ffffff'
const MUTED = 'rgba(180,200,255,0.6)'

interface MarketListProps {
  markets: MarginMarket[]
  selectedMarket: MarginMarket | null
  onSelectMarket: (market: MarginMarket) => void
}

export function MarketList({ markets, selectedMarket, onSelectMarket }: MarketListProps) {
  const [search, setSearch] = useState('')

  // Filter markets based on search
  const filteredMarkets = markets.filter(m => 
    m.market.toLowerCase().includes(search.toLowerCase()) ||
    m.baseAssetSymbol.toLowerCase().includes(search.toLowerCase()) ||
    m.quoteAssetSymbol.toLowerCase().includes(search.toLowerCase())
  )

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
          marginBottom: 12,
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
          <span>Market</span>
        </div>
      </div>

      {/* Markets List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '4px 4px',
        minHeight: 0,
      }}>
        {filteredMarkets.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 120,
            color: MUTED,
            fontSize: 13,
          }}>
            No markets found
          </div>
        ) : (
          filteredMarkets.map((market) => {
            const isSelected = selectedMarket?.market === market.market
            
            return (
              <div
                key={market.market}
                onClick={() => onSelectMarket(market)}
                style={{
                  padding: '12px 8px',
                  borderRadius: 10,
                  marginBottom: 2,
                  background: isSelected ? 'rgba(62,196,192,0.12)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {/* Left: Base asset icon + symbol */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img 
                      src={getCoinIcon(market.baseAssetSymbol)} 
                      alt={market.baseAssetSymbol}
                      style={{ 
                        width: 28, 
                        height: 28, 
                        borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.1)',
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                    <span style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: isSelected ? CYAN : WHITE,
                      fontFamily: "'DM Sans', sans-serif",
                    }}>
                      {market.baseAssetSymbol}
                    </span>
                  </div>
                  
                  {/* Right: Leverage */}
                  <span style={{
                    fontSize: 11,
                    color: CYAN,
                    fontFamily: "'Space Mono', monospace",
                    fontWeight: 600,
                  }}>
                    1-20x
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}