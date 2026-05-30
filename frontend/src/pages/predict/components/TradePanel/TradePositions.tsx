'use client'

import { useState } from 'react'
import { usePredict, PRICE_SCALE, DUSDC_SCALE } from '../../../../hooks'
import { useCurrentAccount } from '@mysten/dapp-kit-react'

const MUTED = 'rgba(180,200,255,0.6)'
const GREEN = '#22c55e'
const RED = '#ef4444'
const CYAN = '#3EC4C0'
const YELLOW = '#eab308'
const WHITE = '#ffffff'

type StatusFilter = 'all' | 'active' | 'redeemable' | 'lost'
type MarketFilter = 'all' | 'selected'

interface TradePositionsProps {
  selectedMarketOracleId?: string
  selectedMarketExpiry?: number
}

export function TradePositions({ selectedMarketOracleId, selectedMarketExpiry }: TradePositionsProps) {
  const account = useCurrentAccount()
  const { positions, loading } = usePredict()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [marketFilter, setMarketFilter] = useState<MarketFilter>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Not connected state
  if (!account) {
    return (
      <div style={{
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 12,
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ fontSize: 18 }}>👛</span>
        </div>
        <span style={{ color: MUTED, fontSize: 12 }}>Connect wallet to view positions</span>
      </div>
    )
  }

  // Format helpers - matching portfolio.html format
  const formatMarket = (underlying: string, expiry: number) => {
    const date = new Date(expiry)
    return `${underlying} ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  }

  const formatExpiry = (expiry: number) => {
    const date = new Date(expiry)
    return date.toISOString().replace('T', ' ').slice(0, 16) + 'Z'
  }

  const formatStrike = (raw: string) => {
    if (!raw) return '—'
    const n = Number(BigInt(raw)) / Number(PRICE_SCALE)
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const formatQty = (raw: string) => {
    if (!raw) return '—'
    const n = Number(BigInt(raw)) / Number(DUSDC_SCALE)
    return n.toLocaleString('en-US', { maximumFractionDigits: 4 })
  }

  const formatPrice = (raw: string | null) => {
    // Entry/Mark prices are scaled by 1e9 (PRICE_SCALE), show 4 decimals
    if (!raw || raw === '0') return '—'
    const n = Number(BigInt(raw)) / Number(PRICE_SCALE)
    return n.toFixed(4)
  }

  const formatUsd = (raw: string | number) => { 
    // Always divide by DUSDC_SCALE since unrealized_pnl is in DUSDC units (1e6)
    const n = typeof raw === 'string' ? Number(raw) : raw
    const scaled = Number(n) / Number(DUSDC_SCALE)
    const sign = scaled >= 0 ? '+' : ''
    return `${sign}$${scaled.toFixed(2)}`
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getStatusBadge = (status?: string) => {
    const styles: Record<string, { bg: string; color: string; text: string }> = {
      active: { bg: 'rgba(34,197,94,0.15)', color: GREEN, text: 'ACTIVE' },
      redeemable: { bg: 'rgba(234,179,8,0.15)', color: YELLOW, text: 'REDEEM' },
      lost: { bg: 'rgba(239,68,68,0.15)', color: RED, text: 'LOST' },
    }
    const s = styles[status || 'active'] || styles.active
    return (
      <span style={{
        fontSize: 9,
        fontWeight: 600,
        padding: '2px 6px',
        borderRadius: 3,
        background: s.bg,
        color: s.color,
        letterSpacing: '0.5px',
      }}>
        {s.text}
      </span>
    )
  }

  // Filter positions
  const filtered = positions.filter(pos => {
    if (statusFilter !== 'all' && pos.status !== statusFilter) return false
    if (marketFilter === 'selected' && selectedMarketOracleId && pos.oracle_id !== selectedMarketOracleId) return false
    return true
  })

  // Sort by creation time (newest first)
  const sorted = [...filtered].sort((a, b) =>
    (b.first_minted_at || 0) - (a.first_minted_at || 0)
  )

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>Positions</span>
          {positions.length > 0 && (
            <span style={{
              fontSize: 10,
              color: MUTED,
              background: 'rgba(255,255,255,0.05)',
              padding: '2px 6px',
              borderRadius: 4,
            }}>
              {positions.length}
            </span>
          )}
        </div>
        
        {/* Filter button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            background: showFilters ? 'rgba(62,196,192,0.2)' : 'transparent',
            border: 'none',
            color: showFilters ? CYAN : MUTED,
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: 4,
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span style={{ fontSize: 10 }}>⚙</span>
          <span style={{ fontSize: 10 }}>Filter</span>
        </button>
      </div>

      {/* Filter overlay */}
      {showFilters && (
        <div style={{
          padding: '8px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          gap: 16,
          fontSize: 10,
          background: 'rgba(0,0,0,0.2)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: MUTED }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 4,
                color: WHITE,
                padding: '2px 8px',
                fontSize: 10,
                cursor: 'pointer',
              }}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="redeemable">Redeemable</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          {selectedMarketOracleId && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: MUTED }}>Market:</span>
              <select
                value={marketFilter}
                onChange={(e) => setMarketFilter(e.target.value as MarketFilter)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 4,
                  color: WHITE,
                  padding: '2px 8px',
                  fontSize: 10,
                  cursor: 'pointer',
                }}
              >
                <option value="all">All</option>
                <option value="selected">Current</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: MUTED, fontSize: 12 }}>
            Loading...
          </div>
        ) : sorted.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: MUTED, fontSize: 12 }}>
            No positions
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ textAlign: 'left', padding: '6px 8px', color: MUTED, fontSize: 9, textTransform: 'uppercase' }}>MARKET</th>
                <th style={{ textAlign: 'left', padding: '6px 8px', color: MUTED, fontSize: 9, textTransform: 'uppercase' }}>SIDE</th>
                <th style={{ textAlign: 'left', padding: '6px 8px', color: MUTED, fontSize: 9, textTransform: 'uppercase' }}>STRIKE</th>
                <th style={{ textAlign: 'left', padding: '6px 8px', color: MUTED, fontSize: 9, textTransform: 'uppercase' }}>EXPIRY</th>
                <th style={{ textAlign: 'right', padding: '6px 8px', color: MUTED, fontSize: 9, textTransform: 'uppercase' }}>QTY</th>
                <th style={{ textAlign: 'right', padding: '6px 8px', color: MUTED, fontSize: 9, textTransform: 'uppercase' }}>ENTRY</th>
                <th style={{ textAlign: 'right', padding: '6px 8px', color: MUTED, fontSize: 9, textTransform: 'uppercase' }}>MARK</th>
                <th style={{ textAlign: 'right', padding: '6px 8px', color: MUTED, fontSize: 9, textTransform: 'uppercase' }}>uPnL</th>
                <th style={{ textAlign: 'center', padding: '6px 8px', color: MUTED, fontSize: 9, textTransform: 'uppercase' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((pos, idx) => {
                const isUp = pos.is_up
                const pnl = Number(pos.unrealized_pnl || 0)
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '6px 8px', fontWeight: 600, color: WHITE, fontSize: 9 }}>
                      {formatMarket(pos.underlying_asset, pos.expiry)}
                    </td>
                    <td style={{ padding: '6px 8px' }}>
                      <span style={{
                        color: isUp ? GREEN : RED,
                        fontWeight: 700,
                        fontSize: 9,
                      }}>
                        {isUp ? '▲ UP' : '▼ DOWN'}
                      </span>
                    </td>
                    <td style={{ padding: '6px 8px', fontFamily: "'Space Mono', monospace", color: CYAN }}>
                      {formatStrike(pos.strike)}
                    </td>
                    <td style={{ padding: '6px 8px', fontFamily: "'Space Mono', monospace", color: MUTED, fontSize: 9 }}>
                      {formatExpiry(pos.expiry)}
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: "'Space Mono', monospace" }}>
                      {formatQty(pos.open_quantity)}
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: "'Space Mono', monospace" }}>
                      {formatPrice(pos.average_entry_price)}
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: "'Space Mono', monospace" }}>
                      {formatPrice(pos.mark_price)}
                    </td>
                    <td style={{
                      padding: '6px 8px',
                      fontFamily: "'Space Mono', monospace",
                      color: pnl >= 0 ? GREEN : RED,
                      fontWeight: 600,
                      textAlign: 'right',
                    }}>
                      {formatUsd(pnl)}
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                      {getStatusBadge(pos.status)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}