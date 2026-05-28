/**
 * useSpotPools - Fetch and manage DeepBookV3 Spot pools
 * 
 * Fetches real-time data from DeepBookV3 Indexer on testnet.
 */

import { useState, useEffect, useCallback } from 'react'

// ─── Config ──────────────────────────────────────────────────────────────────

const INDEXER_URL = 'https://deepbook-indexer.testnet.mystenlabs.com'

// Asset decimals for conversion
const ASSET_SCALARS: Record<string, number> = {
  'SUI': 9,
  'USDC': 6,
  'DEEP': 6,
  'WUSDC': 6,
  'WUSDT': 6,
  'xBTC': 8,
  'BETH': 8,
  'NS': 6,
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SpotPool {
  poolId: string
  poolName: string
  baseAsset: string
  baseAssetId: string
  baseAssetDecimals: number
  quoteAsset: string
  quoteAssetId: string
  quoteAssetDecimals: number
  minSize: number
  lotSize: number
  tickSize: number
  // Ticker data
  lastPrice?: number
  baseVolume?: number
  quoteVolume?: number
  change24h?: number
  isFrozen?: boolean
}

export interface OrderBookLevel {
  price: number
  quantity: number
  total: number
}

export interface OrderBook {
  timestamp: string
  bids: OrderBookLevel[]
  asks: OrderBookLevel[]
  spread: number
  spreadPercent: number
  midPrice: number
}

// ─── API Functions ────────────────────────────────────────────────────────────

interface PoolResponse {
  pool_id: string
  pool_name: string
  base_asset_id: string
  base_asset_decimals: number
  base_asset_symbol: string
  base_asset_name: string
  quote_asset_id: string
  quote_asset_decimals: number
  quote_asset_symbol: string
  quote_asset_name: string
  min_size: number
  lot_size: number
  tick_size: number
}

interface TickerResponse {
  [pair: string]: {
    last_price: number
    base_volume: number
    quote_volume: number
    isFrozen: number
  }
}

interface OrderBookResponse {
  timestamp: string
  bids: [string, string][]
  asks: [string, string][]
}

// Fetch pools from indexer
async function fetchPools(): Promise<PoolResponse[]> {
  const response = await fetch(`${INDEXER_URL}/get_pools`)
  if (!response.ok) throw new Error('Failed to fetch pools')
  return response.json()
}

// Fetch ticker data from indexer
async function fetchTicker(): Promise<TickerResponse> {
  const response = await fetch(`${INDEXER_URL}/ticker`)
  if (!response.ok) throw new Error('Failed to fetch ticker')
  return response.json()
}

// Fetch order book from indexer
async function fetchOrderBook(poolName: string, depth = 20): Promise<OrderBookResponse> {
  const response = await fetch(`${INDEXER_URL}/orderbook/${poolName}?level=2&depth=${depth}`)
  if (!response.ok) throw new Error('Failed to fetch order book')
  return response.json()
}

// ─── Conversion Helpers ───────────────────────────────────────────────────────

function convertVolume(rawVolume: number, asset: string): number {
  const scalar = ASSET_SCALARS[asset] || 6
  return rawVolume / Math.pow(10, scalar)
}

function convertPrice(rawPrice: number, quoteDecimals: number, baseDecimals: number): number {
  // Price is already in human-readable format from indexer
  return rawPrice
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useSpotPools(refreshInterval = 5_000) {
  const [pools, setPools] = useState<SpotPool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      // Fetch pools and ticker data in parallel
      const [poolsData, tickerData] = await Promise.all([
        fetchPools(),
        fetchTicker()
      ])

      console.log("poolsData:", poolsData)
      console.log("tickerData:", tickerData)

      // Map pools with ticker data
      const mappedPools: SpotPool[] = poolsData.map(pool => {
        const ticker = tickerData[pool.pool_name]
        return {
          poolId: pool.pool_id,
          poolName: pool.pool_name,
          baseAsset: pool.base_asset_symbol,
          baseAssetId: pool.base_asset_id,
          baseAssetDecimals: pool.base_asset_decimals,
          quoteAsset: pool.quote_asset_symbol,
          quoteAssetId: pool.quote_asset_id,
          quoteAssetDecimals: pool.quote_asset_decimals,
          minSize: pool.min_size,
          lotSize: pool.lot_size,
          tickSize: pool.tick_size,
          lastPrice: ticker?.last_price ?? 0,
          baseVolume: ticker?.base_volume ?? 0,
          quoteVolume: ticker?.quote_volume ?? 0,
          isFrozen: ticker?.isFrozen === 1,
        }
      })

      setPools(mappedPools)
      setError(null)
    } catch (err) {
      console.error('Error fetching pools:', err)
      setError(err instanceof Error ? err.message : 'Failed to load pools')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, refreshInterval)
    return () => clearInterval(interval)
  }, [load, refreshInterval])

  // Get order book for a specific pool
  const getOrderBook = useCallback(async (poolName: string): Promise<OrderBook | null> => {
    try {
      const data = await fetchOrderBook(poolName, 20)
      
      // Parse bids and asks
      let bidTotal = 0
      let askTotal = 0
      
      const bids: OrderBookLevel[] = data.bids.map(([price, qty]) => {
        const priceNum = parseFloat(price)
        const qtyNum = parseFloat(qty)
        bidTotal += qtyNum
        return { price: priceNum, quantity: qtyNum, total: bidTotal }
      })
      
      const asks: OrderBookLevel[] = data.asks.map(([price, qty]) => {
        const priceNum = parseFloat(price)
        const qtyNum = parseFloat(qty)
        askTotal += qtyNum
        return { price: priceNum, quantity: qtyNum, total: askTotal }
      })

      // Calculate spread
      const bestBid = bids[0]?.price ?? 0
      const bestAsk = asks[0]?.price ?? 0
      const spread = bestAsk - bestBid
      const spreadPercent = bestBid > 0 ? (spread / bestBid) * 100 : 0
      const midPrice = (bestBid + bestAsk) / 2

      return {
        timestamp: data.timestamp,
        bids,
        asks,
        spread,
        spreadPercent,
        midPrice,
      }
    } catch (err) {
      console.error('Error fetching order book:', err)
      return null
    }
  }, [])

  // Get pool by name
  const getPoolByName = useCallback((poolName: string) => {
    return pools.find(p => p.poolName === poolName)
  }, [pools])

  // Get pool by asset pair
  const getPoolByAssets = useCallback((baseAsset: string, quoteAsset: string) => {
    return pools.find(p => p.baseAsset === baseAsset && p.quoteAsset === quoteAsset)
  }, [pools])

  return { 
    pools, 
    loading, 
    error, 
    refetch: load, 
    getOrderBook,
    getPoolByName,
    getPoolByAssets,
    INDEXER_URL 
  }
}