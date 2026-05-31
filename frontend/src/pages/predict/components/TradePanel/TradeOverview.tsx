'use client'

import { useState, useEffect } from 'react'
import { useDAppKit, useCurrentAccount } from '@mysten/dapp-kit-react'
import { DUSDC_SCALE, type ManagerData, type ManagerSummary } from '../../../../hooks'
import { getCoinIcon } from '../../../../lib/coinIcons'

const WHITE = '#ffffff'
const MUTED = 'rgba(180,200,255,0.6)'
const GREEN = '#22c55e'
const CYAN = '#3EC4C0'
const RED = '#ef4444'

const DUSDC_TYPE = '0xe95040085976bfd54a1a07225cd46c8a2b4e8e2b6732f140a0fc49850ba73e1a::dusdc::DUSDC'
const TESTNET_RPC = 'https://fullnode.testnet.sui.io'
const DBUSDC_ICON = getCoinIcon('DBUSDC')

interface TradeOverviewProps {
  manager: ManagerData | null
  summary: ManagerSummary | null
  createManager: (signAndExecute: any) => Promise<void>
  deposit: (signAndExecute: any, amount: string) => Promise<void>
  withdraw: (signAndExecute: any, amount: string) => Promise<void>
  error: string | null
}

type ActionTab = 'deposit' | 'withdraw'

export function TradeOverview({ manager, summary, createManager, deposit, withdraw, error }: TradeOverviewProps) {
  const dAppKit = useDAppKit()
  const account = useCurrentAccount()
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<ActionTab>('deposit')
  const [walletBalance, setWalletBalance] = useState<number>(0)

  // Fetch wallet DUSDC balance
  useEffect(() => {
    if (!account) return

    const fetchBalance = async () => {
      try {
        const response = await fetch(TESTNET_RPC, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'suix_getCoins',
            params: [account.address, DUSDC_TYPE],
          }),
        })
        const data = await response.json()
        const total = data.result?.data?.reduce((sum: number, coin: { balance: string }) => sum + Number(coin.balance), 0) || 0
        setWalletBalance(total / Number(DUSDC_SCALE))
      } catch (e) {
        console.error('Failed to fetch wallet balance:', e)
        setWalletBalance(0)
      }
    }

    fetchBalance()
    const interval = setInterval(fetchBalance, 10000)
    return () => clearInterval(interval)
  }, [account])

  const handleCreateManager = async () => {
    setCreating(true)
    setLocalError(null)
    try {
      await createManager(dAppKit.signAndExecuteTransaction)
    } catch (e: any) {
      setLocalError(e.message)
    } finally {
      setCreating(false)
    }
  }

  const handleAction = async () => {
    if (!amount) return

    setLoading(true)
    setLocalError(null)

    try {
      if (activeTab === 'deposit') {
        await deposit(dAppKit.signAndExecuteTransaction, amount)
      } else {
        await withdraw(dAppKit.signAndExecuteTransaction, amount)
      }
      setAmount('')
    } catch (e: any) {
      setLocalError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const displayError = localError || error

  // Parse summary values (divide by DUSDC_SCALE to get human-readable values)
  const tradingBalance = (summary?.trading_balance ?? 0) / Number(DUSDC_SCALE)
  const redeemableValue = (summary?.redeemable_value ?? 0) / Number(DUSDC_SCALE)
  const openExposure = (summary?.open_exposure ?? 0) / Number(DUSDC_SCALE)
  const unrealizedPnl = (summary?.unrealized_pnl ?? 0) / Number(DUSDC_SCALE)
  const realizedPnl = (summary?.realized_pnl ?? 0) / Number(DUSDC_SCALE)
  const accountValue = (summary?.account_value ?? 0) / Number(DUSDC_SCALE)
  const openPositions = summary?.open_positions ?? 0
  const awaitingSettlement = summary?.awaiting_settlement_positions ?? 0

  // Derived calculations
  const exposureRatio = tradingBalance > 0 ? openExposure / tradingBalance : 0
  const upnlPercent = openExposure > 0 ? (unrealizedPnl / openExposure) * 100 : 0

  // Format helpers
  const fmt = (value: number, decimals = 2) => {
    const sign = value >= 0 ? '' : '-'
    return `${sign}$${Math.abs(value).toFixed(decimals)}`
  }

  const fmtCompact = (value: number) => value.toLocaleString('en-US', { maximumFractionDigits: 2 })

  const fmtInt = (value: number) => Math.round(value).toString()

  const BalanceDisplay = ({ value, label }: { value: number; label: string }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    }}>
      <img 
        src={DBUSDC_ICON} 
        alt="DBUSDC" 
        style={{ width: 16, height: 16, borderRadius: '50%' }} 
      />
      <span style={{ fontSize: 11, color: MUTED }}>{label}:</span>
      <span style={{ 
        fontSize: 11, 
        color: WHITE, 
        fontFamily: "'Space Mono', monospace",
        fontWeight: 600 
      }}>
        {fmtCompact(value)}
      </span>
    </div>
  )

  const StatCard = ({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) => (
    <div style={{
      flex: 1,
      padding: '10px 12px',
      background: 'rgba(255,255,255,0.04)',
      borderRadius: 8,
    }}>
      <div style={{ fontSize: 9, color: MUTED, textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.5px' }}>
        {label}
      </div>
      <div style={{ 
        fontSize: 13, 
        color: valueColor || WHITE, 
        fontFamily: "'Space Mono', monospace",
        fontWeight: 700 
      }}>
        {value}
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {!manager ? (
        <div style={{ padding: 24, textAlign: 'center' }}>
          <p style={{ color: MUTED, marginBottom: 20, fontSize: 12 }}>No Predict Manager found</p>
          <button
            onClick={handleCreateManager}
            disabled={creating}
            style={{
              padding: '12px 20px',
              background: CYAN,
              border: 'none',
              borderRadius: 8,
              color: '#0a0a1a',
              fontSize: 13,
              fontWeight: 700,
              cursor: creating ? 'not-allowed' : 'pointer',
            }}
          >
            {creating ? 'Creating...' : 'Create Predict Manager'}
          </button>
        </div>
      ) : (
        <>
          {/* Main Stats - Large Display */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: MUTED, textTransform: 'uppercase', marginBottom: 2 }}>
                Account Value
              </div>
              <div style={{ 
                fontSize: 22, 
                color: WHITE, 
                fontFamily: "'Space Mono', monospace",
                fontWeight: 700 
              }}>
                ${fmtCompact(accountValue)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: MUTED, textTransform: 'uppercase', marginBottom: 2 }}>
                Trading Balance
              </div>
              <div style={{ 
                fontSize: 18, 
                color: CYAN, 
                fontFamily: "'Space Mono', monospace",
                fontWeight: 700 
              }}>
                ${fmtCompact(tradingBalance)}
              </div>
            </div> 
          </div>

          {/* Secondary Stats - 2x3 Card Grid */}
          <div style={{ padding: '12px 16px', flex: 1 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <StatCard label="Open Exposure" value={fmt(openExposure)} />
              <StatCard label="Redeemable" value={fmt(redeemableValue)} valueColor={GREEN} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <StatCard label="uPnL" value={fmt(unrealizedPnl)} valueColor={unrealizedPnl >= 0 ? GREEN : RED} />
              <StatCard label="Realized P&L" value={fmt(realizedPnl)} valueColor={realizedPnl >= 0 ? GREEN : RED} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <StatCard label="Exposure Ratio" value={`${exposureRatio.toFixed(1)}x`} />
              <StatCard label="uPnL %" value={`${upnlPercent.toFixed(1)}%`} valueColor={unrealizedPnl >= 0 ? GREEN : RED} />
            </div> 
          </div>

          {/* Action Tabs */}
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            padding: '12px 16px 16px',
          }}>
            {/* Tab Buttons */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <button
                onClick={() => setActiveTab('deposit')}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  background: activeTab === 'deposit' ? CYAN : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${activeTab === 'deposit' ? CYAN : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 6,
                  color: activeTab === 'deposit' ? '#0a0a1a' : WHITE,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Deposit
              </button>
              <button
                onClick={() => setActiveTab('withdraw')}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  background: activeTab === 'withdraw' ? CYAN : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${activeTab === 'withdraw' ? CYAN : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 6,
                  color: activeTab === 'withdraw' ? '#0a0a1a' : WHITE,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Withdraw
              </button>
            </div>

            {/* Input + Action */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6,
                  color: WHITE,
                  fontSize: 14,
                  fontFamily: "'Space Mono', monospace",
                }}
              />
              <button
                onClick={handleAction}
                disabled={loading || !amount}
                style={{
                  padding: '10px 16px',
                  background: CYAN,
                  border: 'none',
                  borderRadius: 6,
                  color: '#0a0a1a',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: loading || !amount ? 'not-allowed' : 'pointer',
                  opacity: loading || !amount ? 0.5 : 1,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {loading ? '...' : activeTab === 'deposit' ? 'Deposit' : 'Withdraw'}
              </button>
            </div>

            {/* Available Balance */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              color: MUTED,
              fontFamily: "'DM Sans', sans-serif",
            }}>
              <span>Available:</span>
              <span style={{
                color: WHITE,
                fontFamily: "'Space Mono', monospace",
                fontWeight: 600
              }}>
                {fmtCompact(activeTab === 'deposit' ? walletBalance : tradingBalance)}
              </span>
              <img 
                src={DBUSDC_ICON} 
                alt="DBUSDC" 
                style={{ width: 14, height: 14, borderRadius: '50%' }} 
              />
              <span>DBUSDC</span>
            </div>
          </div>
        </>
      )}

      {displayError && (
        <div style={{ 
          margin: '0 16px 16px', 
          padding: 8, 
          background: 'rgba(239,68,68,0.1)', 
          borderRadius: 6, 
          color: RED, 
          fontSize: 10 
        }}>
          {displayError}
        </div>
      )}
    </div>
  )
}
