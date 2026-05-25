// ─── Constants ────────────────────────────────────────────────────────────────

const SERVER = 'https://predict-server.testnet.mystenlabs.com'
const PREDICT_ID = '0xc8736204d12f0a7277c86388a68bf8a194b0a14c5538ad13f22cbd8e2a38028a'
const REFRESH_INTERVAL = 30_000
const BET_SIZE = 1

const PRICE_SCALE = 1e9
const SVI_SCALE = 1e8
const RHO_SCALE = 1e9

export { SERVER, PREDICT_ID, REFRESH_INTERVAL, BET_SIZE, PRICE_SCALE, SVI_SCALE, RHO_SCALE }

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SVIParams {
  a: number; b: number; rho: number; m: number; sigma: number
}

export interface OracleState {
  latest_price?: { spot: number; forward: number }
  latest_svi?: SVIParams
}

export interface VaultSummary {
  vault_value: number
  available_liquidity: number
}

export interface Oracle {
  oracle_id: string
  expiry: number
  min_strike: number
  tick_size: number
  status: 'active' | 'settled' | 'pending'
}

export interface Odds {
  upProb: number
  downProb: number
  strikeK?: number
  upPayout: number
  downPayout: number
}

export interface Market {
  oracle_id: string
  expiryMs: number
  spot: number
  forward: number
  svi: SVIParams | null
  odds: Odds | null
  status: 'active' | 'settled' | 'pending'
  minStrike: number
  tickSize: number
}

// ─── Black-76 + SVI ────────────────────────────────────────────────────────

function normCDF(x: number): number {
  const sign = x < 0 ? -1 : 1
  x = Math.abs(x) / Math.SQRT2
  const t = 1 / (1 + 0.3275911 * x)
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return 0.5 * (1 + sign * y)
}

export function sviVol(K: number, F: number, T: number, svi: SVIParams): number {
  if (T <= 0) return svi.sigma / SVI_SCALE
  const a = svi.a / SVI_SCALE
  const b = svi.b / SVI_SCALE
  const rho = svi.rho / RHO_SCALE
  const m = svi.m / SVI_SCALE
  const sig = svi.sigma / SVI_SCALE
  const k = Math.log(K / F)
  const w = a + b * (rho * (k - m) + Math.sqrt((k - m) ** 2 + sig ** 2))
  return w > 0 ? Math.sqrt(w / T) : sig
}

function binaryUpProb(F: number, K: number, T: number, vol: number): number {
  if (T <= 0 || vol <= 0) return F > K ? 1 : 0
  const d2 = (Math.log(F / K) - 0.5 * vol ** 2 * T) / (vol * Math.sqrt(T))
  return normCDF(d2)
}

export function calcOdds(market: Market): Odds | null {
  const { forward, spot, svi, expiryMs, minStrike, tickSize } = market
  if (!svi || !forward || forward <= 0) return null

  const F = forward / PRICE_SCALE
  const spotUSD = spot / PRICE_SCALE
  const T = Math.max(0, (expiryMs - Date.now()) / (365.25 * 24 * 3600 * 1000))
  const K = Math.ceil((spotUSD - minStrike) / tickSize) * tickSize + minStrike

  const volAtm = sviVol(K, F, T, svi)
  const upProb = binaryUpProb(F, K, T, volAtm)
  const downProb = 1 - upProb

  return {
    upProb,
    downProb,
    strikeK: K,
    upPayout: upProb > 0.01 ? parseFloat((BET_SIZE / upProb).toFixed(2)) : 0,
    downPayout: downProb > 0.01 ? parseFloat((BET_SIZE / downProb).toFixed(2)) : 0,
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const fetchJSON = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function fetchMarkets(): Promise<{ markets: Market[]; vault: VaultSummary | null }> {
  const [oracles, vaultData] = await Promise.all([
    fetchJSON<Oracle[]>(`${SERVER}/predicts/${PREDICT_ID}/oracles`),
    fetchJSON<VaultSummary>(`${SERVER}/predicts/${PREDICT_ID}/vault/summary`).catch(() => null),
  ])

  const active = oracles.filter(o => o.status === 'active')

  const marketList = await Promise.all(
    active.map(async (oracle) => {
      try {
        const state = await fetchJSON<OracleState>(`${SERVER}/oracles/${oracle.oracle_id}/state`)
        const market: Market = {
          oracle_id: oracle.oracle_id,
          expiryMs: oracle.expiry,
          spot: state.latest_price?.spot ?? 0,
          forward: state.latest_price?.forward ?? 0,
          svi: state.latest_svi ?? null,
          odds: null,
          status: oracle.status,
          minStrike: oracle.min_strike / PRICE_SCALE,
          tickSize: oracle.tick_size / PRICE_SCALE,
        }
        market.odds = calcOdds(market)
        return market
      } catch { return null }
    })
  )

  const valid = marketList.filter((m): m is Market => m !== null)
  const sorted = valid.sort((a, b) => a.expiryMs - b.expiryMs)

  return { markets: sorted, vault: vaultData }
}

export const formatUSD = (usd: number): string =>
  usd > 0 ? usd.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }) : '—'

export const formatCompact = (raw: number): string => {
  if (!raw || raw <= 0) return '—'
  const usd = raw / 1e6
  return usd >= 1000 ? `$${(usd / 1000).toFixed(1)}M` : `$${usd.toFixed(1)}K`
}

export const formatCountdown = (expiryMs: number): string => {
  const diff = expiryMs - Date.now()
  if (diff <= 0) return 'Ended'
  const s = Math.floor(diff / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m`
  return `${s}s`
}

// Format countdown with days: "18d 0h 16m"
export const formatCountdownFull = (expiryMs: number): string => {
  const diff = expiryMs - Date.now()
  if (diff <= 0) return 'Ended'
  const s = Math.floor(diff / 1000)
  const d = Math.floor(s / 86400)
  const remainingAfterDays = s % 86400
  const h = Math.floor(remainingAfterDays / 3600)
  const m = Math.floor((remainingAfterDays % 3600) / 60)
  
  if (d > 0) {
    return `${d}d ${h}h ${m}m`
  }
  if (h > 0) {
    return `${h}h ${m}m`
  }
  return `${m}m`
}
