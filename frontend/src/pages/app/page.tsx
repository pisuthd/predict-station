'use client'

import { useState, useEffect, useCallback } from 'react'
import { NAVY, CYAN } from '../../theme'
import { type Market, type VaultSummary, fetchMarkets, formatUSD, formatCountdown } from './utils'
import { PriceChart } from './components/PriceChart'
import { MarketSelector } from './components/MarketSelector'
import { HotMarkets } from './components/HotMarkets'

const WHITE = '#ffffff'
const MUTED = '#666666'

export default function Dashboard() {
  const [markets, setMarkets] = useState<Market[]>([])
  const [vault, setVault] = useState<VaultSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const load = useCallback(async () => {
    try {
      const { markets: data, vault: vaultData } = await fetchMarkets()
      setMarkets(data)
      setVault(vaultData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [load])

  const activeMarkets = markets.filter(m => m.status !== 'settled')
  const selected = activeMarkets[selectedIndex]

  return (
    <div style={{
      minHeight: '100vh',
      background: NAVY,
      color: WHITE,
      fontFamily: "'Space Mono', monospace",
      padding: '0 24px',
    }}>
      <div style={{ display: 'flex', height: '100vh' }}>

        {/* Left Column - Chart */}
        <div style={{
          flex: 1,
          paddingRight: 24,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(255,255,255,0.08)',
        }}>
          {error && (
            <div style={{ color: '#ef4444', padding: 16 }}>⚠ {error}</div>
          )}

          {loading ? (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: MUTED
            }}>
              Loading...
            </div>
          ) : selected ? (
            <>
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                paddingTop: 32,
                paddingBottom: 16,
              }}>
                {/* Question */}
                <div>
                  <h1 style={{ fontSize: 20, fontWeight: 700, color: WHITE, margin: 0 }}>
                    Will BTC be above {formatUSD(selected.odds?.strikeK ?? 0)}?
                  </h1>
                  <div style={{ fontSize: 12, color: MUTED, marginTop: 8 }}>
                    {new Date(selected.expiryMs).toLocaleString('en-US', {
                      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                      timeZone: 'UTC', timeZoneName: 'short'
                    })}
                    {' · '}
                    {formatCountdown(selected.expiryMs)}
                  </div>
                </div>

                {/* Market Selector */}
                <MarketSelector
                  markets={activeMarkets}
                  selectedIndex={selectedIndex}
                  onSelect={setSelectedIndex}
                />
              </div>

              {/* Chart */}
              <PriceChart
                currentPrice={selected.forward / 1e9}
                strike={selected.odds?.strikeK ?? 0}
              />
            </>
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: MUTED
            }}>
              No active markets
            </div>
          )}
        </div>

        {/* Right Column - Hot Markets */}
        <div style={{
          width: 360,
          paddingLeft: 24,
        }}>
          <HotMarkets
            markets={activeMarkets}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
            vaultValue={vault?.vault_value ?? null}
          />
        </div>
      </div>
    </div>
  )
}