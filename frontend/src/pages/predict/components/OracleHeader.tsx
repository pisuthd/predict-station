'use client'

import { useState, useEffect } from 'react'
import { type Market } from '../../../hooks'
import { formatDetailedExpiry, isExpiringSoon } from '../utils'

const CYAN = '#3EC4C0'
const RED = '#ef4444'
const WHITE = '#ffffff'
const MUTED = 'rgba(180,200,255,0.6)'

interface OracleHeaderProps {
  market: Market
}

const CURRENCY_MAP: Record<string, string> = {
  BTC: 'https://assets.coingecko.com/coins/images/1/standard/bitcoin.png?1696501400',
  ETH: 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png?1696503942',
}

export function OracleHeader({ market }: OracleHeaderProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        borderRadius: 12,
        padding: 20,
        backdropFilter: 'blur(12px)',
      }}>
        Loading...
      </div>
    )
  }

  const expireSoon = isExpiringSoon(market.expiryMs)
  const icon = CURRENCY_MAP[market.asset] || CURRENCY_MAP['BTC']

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      borderRadius: 12,
      padding: 20,
      backdropFilter: 'blur(12px)',
      border: expireSoon ? `1px solid ${RED}40` : `1px solid ${CYAN}30`,
    }}>
      {/* Header Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
      }}>
        <img
          src={icon}
          alt={market.asset}
          width={24}
          height={24}
          style={{ borderRadius: '50%' }}
        />
        <div>
          <div style={{ fontSize: 11, color: MUTED, marginBottom: 2 }}>
            ORACLE QUESTION
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: WHITE }}>
            Will {market.asset} be above ${Math.round(market.odds?.strikeK ?? 0).toLocaleString()}?
          </div>
        </div>
      </div>

      {/* Big Countdown */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '16px 0',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 32,
            fontWeight: 700,
            fontFamily: "'Space Mono', monospace",
            color: expireSoon ? RED : WHITE,
            letterSpacing: '0.05em',
          }}>
            {formatDetailedExpiry(market.expiryMs)}
          </div>
          <div style={{ fontSize: 10, color: MUTED, marginTop: 4, letterSpacing: '0.1em' }}>
            TIME TO EXPIRY
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: 16,
      }}>
        <QuickStat
          label="EXPIRY DATE"
          value={new Date(market.expiryMs).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        />
        <QuickStat
          label="STATUS"
          value={market.status.toUpperCase()}
          valueColor={market.status === 'active' ? CYAN : MUTED}
        />
      </div>
    </div>
  )
}

function QuickStat({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div>
      <div style={{ fontSize: 9, color: MUTED, marginBottom: 4, letterSpacing: '0.1em' }}>
        {label}
      </div>
      <div style={{
        fontSize: 11,
        fontWeight: 600,
        color: valueColor || WHITE,
        fontFamily: "'Space Mono', monospace",
      }}>
        {value}
      </div>
    </div>
  )
}
