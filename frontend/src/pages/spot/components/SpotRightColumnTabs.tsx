'use client'

import { useState } from 'react'
import { List, LayoutDashboard } from 'lucide-react'
import { OrderBook } from './OrderBook'
import type { SpotPool, OrderBook as OrderBookType } from '../../../hooks'

const MUTED = 'rgba(180,200,255,0.6)'
const CYAN = '#3EC4C0'

type TabType = 'orderbook' | 'account'

interface SpotRightColumnTabsProps {
  pool: SpotPool
  orderBook: OrderBookType | null
  loading: boolean
}

export function SpotRightColumnTabs({ pool, orderBook, loading }: SpotRightColumnTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('orderbook')

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Icon-based Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: 8,
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
      }}>
        <button
          onClick={() => setActiveTab('orderbook')}
          title="Order Book"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: 8,
            border: 'none',
            background: activeTab === 'orderbook' ? CYAN : 'rgba(255,255,255,0.05)',
            color: activeTab === 'orderbook' ? '#0a0a1a' : MUTED,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <List size={18} />
        </button>

        <button
          onClick={() => setActiveTab('account')}
          title="Account Overview"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: 8,
            border: 'none',
            background: activeTab === 'account' ? CYAN : 'rgba(255,255,255,0.05)',
            color: activeTab === 'account' ? '#0a0a1a' : MUTED,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <LayoutDashboard size={18} />
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        {loading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 300,
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
              Loading...
            </span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : activeTab === 'orderbook' ? (
          <OrderBook
            orderBook={orderBook}
            loading={loading}
            baseAsset={pool.baseAsset}
            quoteAsset={pool.quoteAsset}
          />
        ) : activeTab === 'account' ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            flexDirection: 'column',
            gap: 16,
            padding: 24,
          }}>
            <LayoutDashboard size={48} style={{ color: MUTED }} />
            <span style={{ color: MUTED, fontSize: 14, fontFamily: "'Space Mono', monospace" }}>
              Account Overview
            </span>
            <span style={{ color: MUTED, fontSize: 12, opacity: 0.7 }}>
              Coming soon
            </span>
          </div>
        ) : null}
      </div>
    </div>
  )
}
