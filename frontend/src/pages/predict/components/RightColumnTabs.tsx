'use client'

import { useState } from 'react'
import { useCurrentAccount } from '@mysten/dapp-kit-react'
import { ConnectButton } from '@mysten/dapp-kit-react/ui'
import type { Market } from '../../../hooks'
import { StrikeGrid, type StrikeGridMode } from './StrikeGrid'
import { TradeOverview } from './TradePanel/TradeOverview'
import { TradeTrade } from './TradePanel/TradeTrade'

const WHITE = '#ffffff'
const MUTED = 'rgba(180,200,255,0.6)'
const CYAN = '#3EC4C0'

type TabType = 'heatmap' | 'overview'

interface RightColumnTabsProps {
  market: Market
  mode?: StrikeGridMode
  strike1: number
  strike2?: number | null
  direction?: 'up' | 'down'
  onStrikeChange?: (strike1: number, strike2: number | null, direction: 'up' | 'down') => void
}

export function RightColumnTabs({ market, mode = 'binary', strike1, strike2, direction = 'up', onStrikeChange }: RightColumnTabsProps) {
  const account = useCurrentAccount()
  const [activeTab, setActiveTab] = useState<TabType>('heatmap')

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Tab Headers - Fixed height */}
      <div style={{
        display: 'flex',
        height: 40,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
      }}>
        {(['heatmap', 'overview'] as TabType[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '10px 8px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? `2px solid ${CYAN}` : '2px solid transparent',
              color: activeTab === tab ? WHITE : MUTED,
              fontSize: 11,
              fontWeight: 600,
              fontFamily: "'Space Mono', monospace",
              cursor: 'pointer',
              letterSpacing: '0.5px',
              // textTransform:"uppercase",
              marginBottom: -1,
            }}
          >
            {tab === 'heatmap' ? 'Heatmap' : 'Overview'}
          </button>
        ))}
      </div>

      {/* Tab Content - Fixed height */}
      <div style={{ height: 336, overflow: 'auto', flexShrink: 0 }}>
        
        {(!account && activeTab !== 'heatmap') ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 16 }}>
            <ConnectButton />
            <span style={{ color: MUTED, fontSize: 11 }}>Connect wallet to view details</span>
          </div>
        ) : activeTab === 'heatmap' ? (
          <StrikeGrid
            market={market}
            mode={mode}
            direction={direction}
            onStrikeChange={onStrikeChange}
          />
        ) : (
          <TradeOverview />
        )}
      </div>

      {/* Trade Section - Flex grow */}
      <div style={{
        flex: 1,
        borderTop: '1px solid rgba(255,255,255,0.08)',
        overflow: 'auto',
        minHeight: 0,
      }}>
        {account ? (
          <TradeTrade market={market} selectedStrike={strike1} direction={direction} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <span style={{ color: MUTED, fontSize: 11 }}>Connect wallet to trade</span>
          </div>
        )}
      </div>
    </div>
  )
}
