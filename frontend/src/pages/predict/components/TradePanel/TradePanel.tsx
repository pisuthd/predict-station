'use client'

import { useState } from 'react'
import { useCurrentAccount } from '@mysten/dapp-kit-react'
import { ConnectButton } from '@mysten/dapp-kit-react/ui'
import type { Market } from '../../../../hooks'
import { TradeOverview } from './TradeOverview'
import { TradeTrade } from './TradeTrade'
import { TradePositions } from './TradePositions'

const WHITE = '#ffffff'
const MUTED = 'rgba(180,200,255,0.6)'
const CYAN = '#3EC4C0'

export const PRICE_SCALE = 1_000_000_000n
export const DUSDC_SCALE = 1_000_000n

interface TradePanelProps {
  market: Market
  selectedStrike: number
  onStrikeChange: (strike: number) => void
}

type TabType = 'overview' | 'trade' | 'positions'

export function TradePanel({ market, selectedStrike, onStrikeChange }: TradePanelProps) {
  const account = useCurrentAccount()
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '50vh',
      overflow: 'hidden',
    }}>
      {/* Tab Headers */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
      }}>
        {(['overview', 'trade', 'positions'] as TabType[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? `2px solid ${CYAN}` : '2px solid transparent',
              color: activeTab === tab ? WHITE : MUTED,
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "'Space Mono', monospace",
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {tab === 'overview' ? 'Overview' : tab === 'trade' ? 'Trade' : 'My Positions'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {!account ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <ConnectButton />
          </div>
        ) : activeTab === 'overview' ? (
          <TradeOverview />
        ) : activeTab === 'trade' ? (
          <TradeTrade market={market} selectedStrike={selectedStrike} />
        ) : (
          <TradePositions />
        )}
      </div>
    </div>
  )
}