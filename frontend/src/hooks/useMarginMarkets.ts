/**
 * useMarginMarkets - Fetch and manage DeepBook Margin markets
 * 
 * Fetches real-time margin data from DeepBookV3 Indexer on testnet.
 */

import { useState, useEffect, useCallback } from 'react'

// ─── Config ──────────────────────────────────────────────────────────────────

const INDEXER_URL = 'https://deepbook-indexer.testnet.mystenlabs.com'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MarginPool {
  marginPoolId: string
  assetType: string
  assetSymbol: string
  supplyCap: number
  maxUtilizationRate: number
  baseRate: number
  baseSlope: number
  optimalUtilization: number
  excessSlope: number
  totalSupply: number
}

export interface MarginManager {
  marginManagerId: string
  deepbookPoolId: string
  baseAssetId: string
  baseAssetSymbol: string
  quoteAssetId: string
  quoteAssetSymbol: string
  baseMarginPoolId: string
  quoteMarginPoolId: string
}

export interface MarginPosition {
  id: number
  marginManagerId: string
  deepbookPoolId: string
  baseMarginPoolId: string
  quoteMarginPoolId: string
  baseAssetId: string
  baseAssetSymbol: string
  quoteAssetId: string
  quoteAssetSymbol: string
  riskRatio: number
  baseAsset: string      // Human-readable amount
  quoteAsset: string     // Human-readable amount
  baseDebt: string       // Human-readable amount
  quoteDebt: string      // Human-readable amount
  basePythPrice: number
  basePythDecimals: number
  quotePythPrice: number
  quotePythDecimals: number
  currentPrice: number
  // Computed values
  leverage?: number
  liquidationDistance?: number
}

// ─── API Functions ────────────────────────────────────────────────────────────

interface MarginSupplyResponse {
  [assetType: string]: string
}

interface MarginManagerInfo {
  margin_manager_id: string
  deepbook_pool_id: string
  base_asset_id: string
  base_asset_symbol: string
  quote_asset_id: string
  quote_asset_symbol: string
  base_margin_pool_id: string
  quote_margin_pool_id: string
}

interface MarginManagerState {
  id: number
  margin_manager_id: string
  deepbook_pool_id: string
  base_margin_pool_id: string
  quote_margin_pool_id: string
  base_asset_id: string
  base_asset_symbol: string
  quote_asset_id: string
  quote_asset_symbol: string
  risk_ratio: string
  base_asset: string
  quote_asset: string
  base_debt: string
  quote_debt: string
  base_pyth_price: number
  base_pyth_decimals: number
  quote_pyth_price: number
  quote_pyth_decimals: number
  created_at: string
  updated_at: string
  current_price: string
  lowest_trigger_above_price: string | null
  highest_trigger_below_price: string | null
}

// Fetch margin pool supplies
async function fetchMarginSupply(): Promise<Record<string, number>> {
  const response = await fetch(`${INDEXER_URL}/margin_supply`)
  if (!response.ok) throw new Error('Failed to fetch margin supply')
  const data: MarginSupplyResponse = await response.json()
  
  // Convert string amounts to numbers
  const result: Record<string, number> = {}
  for (const [asset, amount] of Object.entries(data)) {
    result[asset] = parseInt(amount)
  }
  return result
}

// Fetch all margin managers info
async function fetchMarginManagersInfo(): Promise<MarginManager[]> {
  const response = await fetch(`${INDEXER_URL}/margin_managers_info`)
  if (!response.ok) throw new Error('Failed to fetch margin managers info')
  const data: MarginManagerInfo[] = await response.json()
  
  return data.map(m => ({
    marginManagerId: m.margin_manager_id,
    deepbookPoolId: m.deepbook_pool_id,
    baseAssetId: m.base_asset_id,
    baseAssetSymbol: m.base_asset_symbol,
    quoteAssetId: m.quote_asset_id,
    quoteAssetSymbol: m.quote_asset_symbol,
    baseMarginPoolId: m.base_margin_pool_id,
    quoteMarginPoolId: m.quote_margin_pool_id,
  }))
}

// Fetch margin manager states (positions)
async function fetchMarginManagerStates(maxRiskRatio?: number): Promise<MarginPosition[]> {
  let url = `${INDEXER_URL}/margin_manager_states`
  if (maxRiskRatio) {
    url += `?max_risk_ratio=${maxRiskRatio}`
  }
  
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to fetch margin manager states')
  const data: MarginManagerState[] = await response.json()
  
  return data.map(s => {
    const baseAssetNum = parseFloat(s.base_asset) / 1e9  // Assume 9 decimals
    const quoteAssetNum = parseFloat(s.quote_asset) / 1e6  // Assume 6 decimals
    const baseDebtNum = parseFloat(s.base_debt) / 1e9
    const quoteDebtNum = parseFloat(s.quote_debt) / 1e6
    const currentPrice = parseFloat(s.current_price)
    
    // Calculate leverage
    const positionValue = baseAssetNum * currentPrice
    const equity = positionValue - (baseDebtNum * currentPrice)
    const leverage = equity > 0 ? positionValue / equity : 0
    
    // Calculate liquidation distance
    const liquidationDistance = leverage > 0 ? (100 / leverage) : 0
    
    return {
      id: s.id,
      marginManagerId: s.margin_manager_id,
      deepbookPoolId: s.deepbook_pool_id,
      baseMarginPoolId: s.base_margin_pool_id,
      quoteMarginPoolId: s.quote_margin_pool_id,
      baseAssetId: s.base_asset_id,
      baseAssetSymbol: s.base_asset_symbol,
      quoteAssetId: s.quote_asset_id,
      quoteAssetSymbol: s.quote_asset_symbol,
      riskRatio: parseFloat(s.risk_ratio),
      baseAsset: baseAssetNum.toFixed(4),
      quoteAsset: quoteAssetNum.toFixed(2),
      baseDebt: baseDebtNum.toFixed(4),
      quoteDebt: quoteDebtNum.toFixed(2),
      basePythPrice: s.base_pyth_price,
      basePythDecimals: s.base_pyth_decimals,
      quotePythPrice: s.quote_pyth_price,
      quotePythDecimals: s.quote_pyth_decimals,
      currentPrice,
      leverage,
      liquidationDistance,
    }
  })
}

// ─── Conversion Helpers ───────────────────────────────────────────────────────

function parseAssetAmount(amount: string, decimals: number): number {
  return parseFloat(amount) / Math.pow(10, decimals)
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useMarginMarkets(refreshInterval = 5_000) {
  const [marginPools, setMarginPools] = useState<MarginPool[]>([])
  const [positions, setPositions] = useState<MarginPosition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      // Fetch margin pools and positions in parallel
      const [supply, positionsData] = await Promise.all([
        fetchMarginSupply(),
        fetchMarginManagerStates()
      ])

      setMarginPools([]) // No structured pool data from supply endpoint
      setPositions(positionsData)
      setError(null)
    } catch (err) {
      console.error('Error fetching margin data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load margin data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, refreshInterval)
    return () => clearInterval(interval)
  }, [load, refreshInterval])

  // Get positions at risk (risk_ratio < threshold)
  const getPositionsAtRisk = useCallback((threshold = 1.5) => {
    return positions.filter(p => p.riskRatio < threshold)
  }, [positions])

  // Get positions by asset
  const getPositionsByAsset = useCallback((asset: string) => {
    return positions.filter(p => p.baseAssetSymbol === asset || p.quoteAssetSymbol === asset)
  }, [positions])

  // Get total supply by asset
  const getTotalSupply = useCallback(() => {
    return marginPools.reduce((acc, pool) => {
      acc[pool.assetSymbol] = (acc[pool.assetSymbol] || 0) + pool.totalSupply
      return acc
    }, {} as Record<string, number>)
  }, [marginPools])

  return { 
    marginPools,
    positions,
    loading, 
    error, 
    refetch: load,
    getPositionsAtRisk,
    getPositionsByAsset,
    getTotalSupply,
    INDEXER_URL 
  }
}