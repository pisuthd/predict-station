'use client'

import { useState, useEffect } from 'react'
import { useCurrentAccount } from '@mysten/dapp-kit-react'

const WHITE = '#ffffff'
const MUTED = 'rgba(180,200,255,0.6)'
const GREEN = '#22c55e'
const RED = '#ef4444'
const CYAN = '#3EC4C0'

const PRICE_SCALE = 1_000_000_000n
const DUSDC_SCALE = 1_000_000n

const SERVER = 'https://predict-server.testnet.mystenlabs.com'

interface ManagerData {
  manager_id: string
  owner: string
}

interface Position {
  oracle_id: string
  expiry: number
  strike: string
  is_up: boolean
  open_quantity: string
  average_entry_price: string
  mark_price: string | null
  unrealized_pnl: string
  underlying_asset: string
}

export function TradePositions() {
  const account = useCurrentAccount()
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!account) return

    const fetchPositions = async () => {
      setLoading(true)
      try {
        const mRes = await fetch(`${SERVER}/managers`)
        const managers = await mRes.json()
        const userManager = managers.find((m: ManagerData) => m.owner === account.address)

        if (!userManager) {
          setPositions([])
          setLoading(false)
          return
        }

        const res = await fetch(`${SERVER}/managers/${userManager.manager_id}/positions/summary`)
        const data = await res.json()
        setPositions(data.filter((p: Position) => Number(p.open_quantity) > 0))
      } catch (e) {
        console.error('Failed to fetch positions:', e)
      } finally {
        setLoading(false)
      }
    }

    fetchPositions()
    const interval = setInterval(fetchPositions, 30000)
    return () => clearInterval(interval)
  }, [account])

  const formatStrike = (raw: string) => {
    const n = Number(BigInt(raw)) / Number(PRICE_SCALE)
    return '$' + n.toLocaleString(undefined, { maximumFractionDigits: 0 })
  }

  const formatUsd = (raw: string, scale: bigint = DUSDC_SCALE) => {
    const n = Number(BigInt(raw || '0')) / Number(scale)
    return n.toLocaleString(undefined, { maximumFractionDigits: 2 })
  }

  const formatPrice = (raw: string | null) => {
    if (!raw || raw === '0') return '—'
    const n = Number(BigInt(raw)) / Number(PRICE_SCALE)
    return n.toFixed(4)
  }

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: MUTED }}>
        Loading positions...
      </div>
    )
  }

  if (positions.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: MUTED }}>
        No open positions
      </div>
    )
  }

  return (
    <div style={{ padding: 16, overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <th style={{ textAlign: 'left', padding: '8px 8px', color: MUTED, fontSize: 10, textTransform: 'uppercase' }}>SIDE</th>
            <th style={{ textAlign: 'left', padding: '8px 8px', color: MUTED, fontSize: 10, textTransform: 'uppercase' }}>STRIKE</th>
            <th style={{ textAlign: 'right', padding: '8px 8px', color: MUTED, fontSize: 10, textTransform: 'uppercase' }}>QTY</th>
            <th style={{ textAlign: 'right', padding: '8px 8px', color: MUTED, fontSize: 10, textTransform: 'uppercase' }}>ENTRY</th>
            <th style={{ textAlign: 'right', padding: '8px 8px', color: MUTED, fontSize: 10, textTransform: 'uppercase' }}>MARK</th>
            <th style={{ textAlign: 'right', padding: '8px 8px', color: MUTED, fontSize: 10, textTransform: 'uppercase' }}>uPnL</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((pos, idx) => {
            const isUp = pos.is_up
            return (
              <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 8px' }}>
                  <span style={{
                    color: isUp ? GREEN : RED,
                    fontWeight: 700,
                    fontSize: 11,
                    background: isUp ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                    padding: '2px 8px',
                    borderRadius: 4,
                  }}>
                    {isUp ? '▲ UP' : '▼ DOWN'}
                  </span>
                </td>
                <td style={{ padding: '12px 8px', fontFamily: "'Space Mono', monospace", color: CYAN }}>
                  {formatStrike(pos.strike)}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'right', fontFamily: "'Space Mono', monospace" }}>
                  ${formatUsd(pos.open_quantity)}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'right', fontFamily: "'Space Mono', monospace" }}>
                  {formatPrice(pos.average_entry_price)}¢
                </td>
                <td style={{ 
                  padding: '12px 8px', 
                  textAlign: 'right', 
                  fontFamily: "'Space Mono', monospace",
                  color: pos.mark_price ? (Number(pos.mark_price) > Number(pos.average_entry_price) ? GREEN : RED) : MUTED
                }}>
                  {formatPrice(pos.mark_price)}¢
                </td>
                <td style={{ 
                  padding: '12px 8px', 
                  textAlign: 'right', 
                  fontFamily: "'Space Mono', monospace",
                  fontWeight: 600,
                  color: Number(pos.unrealized_pnl || 0) >= 0 ? GREEN : RED,
                }}>
                  {Number(pos.unrealized_pnl || 0) >= 0 ? '+' : ''}{formatUsd(pos.unrealized_pnl)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}