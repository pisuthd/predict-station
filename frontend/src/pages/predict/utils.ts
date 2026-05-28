'use client'

import { type Market } from '../../hooks'

// Currency icon mapping
export const CURRENCY_MAP: Record<string, string> = {
  BTC: 'https://assets.coingecko.com/coins/images/1/standard/bitcoin.png?1696501400',
  ETH: 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png?1696503942',
}

const SERVER = 'https://predict-server.testnet.mystenlabs.com'
const PREDICT_ID = '0xc8736204d12f0a7277c86388a68bf8a194b0a14c5538ad13f22cbd8e2a38028a'
const PRICE_SCALE = 1e9

export { SERVER, PREDICT_ID, PRICE_SCALE }

/**
 * Format expiry time into detailed countdown (no seconds)
 * e.g., "4d 2h", "1h 15m", "12m"
 */
export function formatDetailedExpiry(expiryMs: number): string {
  const diff = expiryMs - Date.now()
  if (diff <= 0) return 'soon'
  
  const m = Math.floor(diff / 60000)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  
  if (d > 0) {
    const remainingH = h % 24
    return remainingH > 0 ? `${d}d ${remainingH}h` : `${d}d`
  }
  if (h > 0) {
    const remainingM = m % 60
    return remainingM > 0 ? `${h}h ${remainingM}m` : `${h}h`
  }
  return `${m}m`
}

/**
 * Check if expiry is within 6 hours
 */
export function isExpiringSoon(expiryMs: number): boolean {
  const diff = expiryMs - Date.now()
  return diff > 0 && diff < 6 * 60 * 60 * 1000
}

/**
 * Format USD price
 */
export function formatUSD(usd: number): string {
  if (!usd || usd <= 0) return '—'
  return usd.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })
}

/**
 * Format compact number
 */
export function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toFixed(0)
}

/**
 * Get market name display
 */
export function getMarketName(market: Market): string {
  const odds = market.odds
  const strike = odds?.strikeK ?? 0
  const spotUSD = market.spot / PRICE_SCALE
  const direction = strike > spotUSD ? 'Above' : 'Below'
  return `Will ${market.asset} be ${direction} $${Math.round(strike).toLocaleString()}?`
}
