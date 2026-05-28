'use client'

import { useState } from 'react'
import { type Market } from '../../../hooks'
// import { formatUSD } from '../utils'

const CYAN = '#3EC4C0'
const GREEN = '#22c55e'
const RED = '#ef4444'
const WHITE = '#ffffff'
const MUTED = 'rgba(180,200,255,0.6)'

type TicketMode = 'binary' | 'range'

interface TradeTicketProps {
  market: Market
}

export function TradeTicket({ market }: TradeTicketProps) {
  const [mode, setMode] = useState<TicketMode>('binary')
  const [quantity, setQuantity] = useState<string>('1')
  const [direction, setDirection] = useState<'up' | 'down'>('up')
  
  const odds = market.odds
  const strike = odds?.strikeK ?? 0
  const spotUSD = market.spot / 1e9
  const forwardUSD = market.forward / 1e9
  const upProb = odds?.upProb ?? 0.5
  const downProb = odds?.downProb ?? 0.5
  const upPayout = odds?.upPayout ?? 2
  const downPayout = odds?.downPayout ?? 2
  
  const qty = parseFloat(quantity) || 0
  const premium = mode === 'binary' 
    ? direction === 'up' ? qty / upPayout : qty / downPayout
    : qty * 2 // placeholder for range

  return (
    <div style={{
      padding: 16,
    }}>
      {/* Tab Buttons */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 16,
        padding: 4,
        background: 'rgba(0,0,0,0.2)',
        borderRadius: 8,
      }}>
        <TabButton active={mode === 'binary'} onClick={() => setMode('binary')}>
          Binary
        </TabButton>
        <TabButton active={mode === 'range'} onClick={() => setMode('range')}>
          Range
        </TabButton>
      </div>

      {mode === 'binary' ? (
        <BinaryTicket
          strike={strike}
          spotUSD={spotUSD}
          upProb={upProb}
          downProb={downProb}
          upPayout={upPayout}
          downPayout={downPayout}
          direction={direction}
          onDirectionChange={setDirection}
          quantity={quantity}
          onQuantityChange={setQuantity}
          premium={premium}
        />
      ) : (
        <RangeTicket
          spotUSD={spotUSD}
          quantity={quantity}
          onQuantityChange={setQuantity}
          premium={premium}
          forwardUSD={forwardUSD}
        />
      )}

      {/* Mint Button */}
      <button
        style={{
          width: '100%',
          padding: '14px 20px',
          marginTop: 16,
          background: CYAN,
          border: 'none',
          borderRadius: 10,
          fontFamily: "'Space Mono', monospace",
          fontSize: 13,
          fontWeight: 700,
          color: '#000',
          cursor: 'pointer',
          letterSpacing: '0.05em',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(62,196,192,0.85)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = CYAN
        }}
      >
        MINT
      </button>
    </div>
  )
}

interface TabButtonProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '10px 16px',
        fontSize: 13,
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 600,
        background: active ? CYAN : 'transparent',
        color: active ? '#000' : MUTED,
        border: 'none',
        borderRadius: 6,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      {children}
    </button>
  )
}

interface BinaryTicketProps {
  strike: number
  spotUSD: number
  upProb: number
  downProb: number
  upPayout: number
  downPayout: number
  direction: 'up' | 'down'
  onDirectionChange: (dir: 'up' | 'down') => void
  quantity: string
  onQuantityChange: (v: string) => void
  premium: number
}

function BinaryTicket({
  strike,
  spotUSD,
  upProb,
  downProb,
  upPayout,
  downPayout,
  direction,
  onDirectionChange,
  quantity,
  onQuantityChange,
  premium,
}: BinaryTicketProps) {
  const ATM = upProb > 0.5 ? 'ABOVE' : 'BELOW'
  const prob = direction === 'up' ? upProb : downProb
  const payout = direction === 'up' ? upPayout : downPayout

  return (
    <div>
      {/* ATM Indicator */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        padding: '10px 14px',
        background: 'rgba(62,196,192,0.08)',
        borderRadius: 8,
        border: '1px solid rgba(62,196,192,0.15)',
      }}>
        <span style={{ fontSize: 11, color: CYAN, fontWeight: 600, letterSpacing: '0.1em' }}>
          ATM MARKET
        </span>
        <span style={{ fontSize: 18, fontWeight: 700, color: WHITE }}>
          ${Math.round(strike).toLocaleString()}
        </span>
      </div>

      {/* Strike Info */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>STRIKE</div>
        <div style={{ fontSize: 14, color: WHITE }}>
          Current ATM strike based on spot
        </div>
      </div>

      {/* Direction */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: MUTED, marginBottom: 8 }}>DIRECTION</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <DirectionButton
            active={direction === 'up'}
            onClick={() => onDirectionChange('up')}
            label="UP"
            prob={upProb}
            payout={upPayout}
            color={GREEN}
          />
          <DirectionButton
            active={direction === 'down'}
            onClick={() => onDirectionChange('down')}
            label="DOWN"
            prob={downProb}
            payout={downPayout}
            color={RED}
          />
        </div>
      </div>

      {/* Quantity */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: MUTED, marginBottom: 8 }}>QUANTITY</div>
        <input
          type="number"
          min="0"
          step="1"
          value={quantity}
          onChange={(e) => onQuantityChange(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 14px',
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            color: WHITE,
            fontSize: 14,
            fontFamily: "'Space Mono', monospace",
            outline: 'none',
          }}
        />
      </div>

      {/* Preview */}
      <div style={{
        padding: 14,
        background: 'rgba(0,0,0,0.2)',
        borderRadius: 8,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: MUTED }}>Premium Cost</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: WHITE }}>
            ${premium.toFixed(2)} USDC
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: MUTED }}>Potential Payout</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: WHITE }}>
            ${(parseFloat(quantity) * payout).toFixed(2)} USDC
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: MUTED }}>Implied Probability</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: direction === 'up' ? GREEN : RED }}>
            {(prob * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  )
}

interface DirectionButtonProps {
  active: boolean
  onClick: () => void
  label: string
  prob: number
  payout: number
  color: string
}

function DirectionButton({ active, onClick, label, prob, payout, color }: DirectionButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '12px',
        background: active ? `${color}20` : 'transparent',
        border: `2px solid ${active ? color : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 8,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 700, color: active ? color : MUTED, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 11, color: MUTED }}>
        {(prob * 100).toFixed(0)}% · {payout.toFixed(2)}x
      </div>
    </button>
  )
}

interface RangeTicketProps {
  spotUSD: number
  quantity: string
  onQuantityChange: (v: string) => void
  premium: number
  forwardUSD: number
}

function RangeTicket({ spotUSD, quantity, onQuantityChange, premium, forwardUSD }: RangeTicketProps) {
  // Calculate some reasonable range bounds
  const lowerStrike = Math.round(forwardUSD * 0.95)
  const upperStrike = Math.round(forwardUSD * 1.05)

  return (
    <div>
      {/* Range Info */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 16,
        padding: '10px 14px',
        background: 'rgba(62,196,192,0.08)',
        borderRadius: 8,
        border: '1px solid rgba(62,196,192,0.15)',
      }}>
        <div>
          <div style={{ fontSize: 10, color: MUTED }}>LOWER STRIKE</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: WHITE }}>
            ${lowerStrike.toLocaleString()}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 60, height: 2, background: CYAN, borderRadius: 1 }} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: MUTED }}>UPPER STRIKE</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: WHITE }}>
            ${upperStrike.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Note */}
      <div style={{
        fontSize: 12,
        color: MUTED,
        textAlign: 'center',
        marginBottom: 16,
      }}>
        Range positions win if price stays between strikes at expiry
      </div>

      {/* Quantity */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: MUTED, marginBottom: 8 }}>QUANTITY</div>
        <input
          type="number"
          min="0"
          step="1"
          value={quantity}
          onChange={(e) => onQuantityChange(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 14px',
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            color: WHITE,
            fontSize: 14,
            fontFamily: "'Space Mono', monospace",
            outline: 'none',
          }}
        />
      </div>

      {/* Preview */}
      <div style={{
        padding: 14,
        background: 'rgba(0,0,0,0.2)',
        borderRadius: 8,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: MUTED }}>Est. Premium</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: WHITE }}>
            ${premium.toFixed(2)} USDC
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: MUTED }}>Range Width</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: WHITE }}>
            ${(upperStrike - lowerStrike).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}
