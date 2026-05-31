'use client'

import { useState } from 'react'
import { useCurrentAccount } from '@mysten/dapp-kit-react'
import { ConnectButton } from '@mysten/dapp-kit-react/ui'
import { Flame, CircleUser } from 'lucide-react'
import type { Market, ManagerData, ManagerSummary } from '../../../hooks'
import { StrikeGrid, type StrikeGridMode } from './StrikeGrid'
import { TradeOverview } from './TradePanel/TradeOverview'

// const WHITE = '#ffffff'
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
  manager?: ManagerData | null
  summary?: ManagerSummary | null
  createManager?: (signAndExecute: any) => Promise<void>
  deposit?: (signAndExecute: any, amount: string) => Promise<void>
  withdraw?: (signAndExecute: any, amount: string) => Promise<void>
  predictError?: string | null
}

export function RightColumnTabs({ 
  market, 
  mode = 'binary', 
  strike1, 
  strike2, 
  direction = 'up', 
  onStrikeChange,
  manager,
  summary,
  createManager,
  deposit,
  withdraw,
  predictError,
}: RightColumnTabsProps) {
  const account = useCurrentAccount()
  const [activeTab, setActiveTab] = useState<TabType>('heatmap')

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
          onClick={() => setActiveTab('heatmap')}
          title="Heatmap"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: 8,
            border: 'none',
            background: activeTab === 'heatmap' ? CYAN : 'rgba(255,255,255,0.05)',
            color: activeTab === 'heatmap' ? '#0a0a1a' : MUTED,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Flame size={18} />
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          title="Overview"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: 8,
            border: 'none',
            background: activeTab === 'overview' ? CYAN : 'rgba(255,255,255,0.05)',
            color: activeTab === 'overview' ? '#0a0a1a' : MUTED,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <CircleUser size={18} />
        </button>
      </div>

      {/* Tab Content - Flex grow */}
      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
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
          <TradeOverview 
            manager={manager ?? null}
            summary={summary ?? null}
            createManager={createManager!}
            deposit={deposit!}
            withdraw={withdraw!}
            error={predictError ?? null}
          />
        )}
      </div>
    </div>
  )
}
