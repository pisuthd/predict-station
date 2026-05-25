#!/usr/bin/env node
/**
 * Fetch single oracle state, SVI parameters, and calculate odds
 * 
 * Forward price and odds are CALCULATED from the state data, not fetched separately.
 * 
 * Usage: node fetch-single-oracle.js <oracle_id>
 * Example: node fetch-single-oracle.js 0x3abbbba8f04138240008276e789d7e075b72f6f2a6d66421d637611b8025d7e2
 */

const PREDICT_SERVER = 'https://predict-server.testnet.mystenlabs.com'
const PRICE_SCALE = 1e9
const SVI_SCALE = 1e8
const RHO_SCALE = 1e9
const BET_SIZE = 1

const oracleId = process.argv[2]

if (!oracleId) {
  console.error('\n❌ Usage: node fetch-single-oracle.js <oracle_id>\n')
  console.error('Example:')
  console.error('  node fetch-single-oracle.js 0x3abbbba8f04138240008276e789d7e075b72f6f2a6d66421d637611b8025d7e2\n')
  process.exit(1)
}

async function fetchJSON(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}

// ─── Range Odds Calculation ─────────────────────────────────────────────────

function calcRangeOdds(forward, spot, svi, expiry, minStrike, tickSize, lowerStrikeUSD, upperStrikeUSD) {
  if (!svi || !forward || forward <= 0) return null
  if (lowerStrikeUSD >= upperStrikeUSD) return null

  const F = forward / PRICE_SCALE
  const T = Math.max(0, (expiry - Date.now()) / (365.25 * 24 * 3600 * 1000))

  const lowerK = Math.max(lowerStrikeUSD, minStrike)   // enforce bounds
  const upperK = upperStrikeUSD

  // Use strike-specific volatility (SVI smile)
  const volLower = sviVol(lowerK, F, T, svi)
  const volUpper = sviVol(upperK, F, T, svi)

  const probAboveLower = binaryUpProb(F, lowerK, T, volLower)   // P(S > lower)
  const probAboveUpper = binaryUpProb(F, upperK, T, volUpper)   // P(S > upper)

  const probInRange = Math.max(0, probAboveLower - probAboveUpper)
  const probOutOfRange = 1 - probInRange

  return {
    lowerStrike: lowerK,
    upperStrike: upperK,
    rangeWidth: (upperK - lowerK).toFixed(0),
    inRangeProb: probInRange.toFixed(4),
    outRangeProb: probOutOfRange.toFixed(4),
    inRangePayout: probInRange > 0.01 ? (BET_SIZE / probInRange).toFixed(2) : 0,
    outRangePayout: probOutOfRange > 0.01 ? (BET_SIZE / probOutOfRange).toFixed(2) : 0,
  }
}

// ─── Black-76 + SVI Formulas ─────────────────────────────────────────────────

function normCDF(x) {
  const sign = x < 0 ? -1 : 1
  x = Math.abs(x) / Math.SQRT2
  const t = 1 / (1 + 0.3275911 * x)
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return 0.5 * (1 + sign * y)
}

function sviVol(K, F, T, svi) {
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

function binaryUpProb(F, K, T, vol) {
  if (T <= 0 || vol <= 0) return F > K ? 1 : 0
  const d2 = (Math.log(F / K) - 0.5 * vol ** 2 * T) / (vol * Math.sqrt(T))
  return normCDF(d2)
}

function calcOdds(forward, spot, svi, expiry, minStrike, tickSize) {
  if (!svi || !forward || forward <= 0) return null

  const F = forward / PRICE_SCALE
  const spotUSD = spot / PRICE_SCALE
  const T = Math.max(0, (expiry - Date.now()) / (365.25 * 24 * 3600 * 1000))
  const K = Math.ceil((spotUSD - minStrike) / tickSize) * tickSize + minStrike

  const volAtm = sviVol(K, F, T, svi)
  const upProb = binaryUpProb(F, K, T, volAtm)
  const downProb = 1 - upProb

  return {
    strikeK: K,
    upProb: upProb.toFixed(4),
    downProb: downProb.toFixed(4),
    upPayout: upProb > 0.01 ? (BET_SIZE / upProb).toFixed(2) : 0,
    downPayout: downProb > 0.01 ? (BET_SIZE / downProb).toFixed(2) : 0,
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🔮 Predict Protocol - Single Oracle\n')
  console.log('═'.repeat(60))
  console.log(`Oracle ID: ${oracleId}\n`)

  // 1. Oracle State (includes spot, forward, SVI)
  console.log('📊 Oracle State (includes spot & forward)')
  console.log('─'.repeat(40))
  try {
    const state = await fetchJSON(`${PREDICT_SERVER}/oracles/${oracleId}/state`)
    console.log(JSON.stringify(state, null, 2))
    
    // Extract key values
    const spot = state.latest_price?.spot
    const forward = state.latest_price?.forward
    const svi = state.latest_svi
    
    console.log('\n  📈 Extracted Values:')
    if (spot) console.log(`    Spot Price: $${(spot / PRICE_SCALE).toLocaleString()}`)
    if (forward) console.log(`    Forward Price: $${(forward / PRICE_SCALE).toLocaleString()}`)
    if (svi) {
      console.log(`    SVI Parameters:`)
      console.log(`      a: ${(svi.a / SVI_SCALE).toFixed(6)}`)
      console.log(`      b: ${(svi.b / SVI_SCALE).toFixed(6)}`)
      console.log(`      rho: ${(svi.rho / RHO_SCALE).toFixed(6)}`)
      console.log(`      m: ${(svi.m / SVI_SCALE).toFixed(6)}`)
      console.log(`      sigma: ${(svi.sigma / SVI_SCALE).toFixed(6)}`)
    }
  } catch (e) {
    console.log(`  ⚠️  ${e.message}`)
  }

  // 2. Get oracle metadata (for strike info)
  console.log('\n📋 Oracle Metadata (for odds calculation)')
  console.log('─'.repeat(40))
  try {
    const oracles = await fetchJSON(`${PREDICT_SERVER}/predicts/0xc8736204d12f0a7277c86388a68bf8a194b0a14c5538ad13f22cbd8e2a38028a/oracles`)
    const oracle = oracles.find(o => o.oracle_id === oracleId)
    
    if (oracle) {
      console.log(`  Expiry: ${new Date(oracle.expiry).toISOString()}`)
      console.log(`  Min Strike: $${(oracle.min_strike / PRICE_SCALE).toLocaleString()}`)
      console.log(`  Tick Size: $${(oracle.tick_size / PRICE_SCALE)}`)
      console.log(`  Status: ${oracle.status}`)
      
      // Calculate odds if we have state
      try {
        const state = await fetchJSON(`${PREDICT_SERVER}/oracles/${oracleId}/state`)
        const odds = calcOdds(
          state.latest_price?.forward,
          state.latest_price?.spot,
          state.latest_svi,
          oracle.expiry,
          oracle.min_strike / PRICE_SCALE,  // Convert to USD
          oracle.tick_size / PRICE_SCALE     // Convert to USD
        )
        
        if (odds) {
          console.log('\n  🎯 Calculated Odds:')
          console.log(`    Strike: $${odds.strikeK.toLocaleString()}`)
          console.log(`    UP Probability: ${odds.upProb} (${(parseFloat(odds.upProb) * 100).toFixed(2)}%)`)
          console.log(`    DOWN Probability: ${odds.downProb} (${(parseFloat(odds.downProb) * 100).toFixed(2)}%)`)
          console.log(`    UP Payout: ${odds.upPayout}x`)
          console.log(`    DOWN Payout: ${odds.downPayout}x`)

          // === RANGE ODDS EXAMPLE ===
          console.log('\n  📏 Sample Range Bets:')
          
          const examples = [
            { name: "±$100",  lower: odds.strikeK - 100, upper: odds.strikeK + 100 },
            { name: "±$200",  lower: odds.strikeK - 200, upper: odds.strikeK + 200 },
            { name: "±$500",  lower: odds.strikeK - 500, upper: odds.strikeK + 500 },
            { name: "Wide ±$1000", lower: odds.strikeK - 1000, upper: odds.strikeK + 1000 },
          ]

          for (const ex of examples) {
            const rangeOdds = calcRangeOdds(
              state.latest_price?.forward,
              state.latest_price?.spot,
              state.latest_svi,
              oracle.expiry,
              oracle.min_strike / PRICE_SCALE,
              oracle.tick_size / PRICE_SCALE,
              ex.lower,
              ex.upper
            )

            if (rangeOdds) {
              console.log(`    ${ex.name.padEnd(12)} [${rangeOdds.lowerStrike} — ${rangeOdds.upperStrike}]`)
              console.log(`      In-Range Prob: ${rangeOdds.inRangeProb} (${(parseFloat(rangeOdds.inRangeProb)*100).toFixed(2)}%)`)
              console.log(`      In-Range Payout: ${rangeOdds.inRangePayout}x`)
              console.log(`      Out-Range Payout: ${rangeOdds.outRangePayout}x`)
            }
          }
        }
      } catch (e) {
        console.log(`  ⚠️  Could not calculate odds: ${e.message}`)
      }
    } else {
      console.log(`  ⚠️  Oracle not found in list`)
    }
  } catch (e) {
    console.log(`  ⚠️  ${e.message}`)
  }

  // 3. Prices History
  console.log('\n📈 Prices History (latest 5)')
  console.log('─'.repeat(40))
  try {
    const history = await fetchJSON(`${PREDICT_SERVER}/oracles/${oracleId}/prices?limit=5`)
    if (Array.isArray(history)) {
      for (const p of history) {
        console.log(`  ${new Date(p.onchain_timestamp).toISOString()}:`)
        console.log(`    Spot: $${(p.spot / PRICE_SCALE).toLocaleString()}`)
        console.log(`    Forward: $${(p.forward / PRICE_SCALE).toLocaleString()}`)
      }
    } else {
      console.log(JSON.stringify(history, null, 2))
    }
  } catch (e) {
    console.log(`  ⚠️  ${e.message}`)
  }

  // 4. SVI History
  console.log('\n📉 SVI History (latest)')
  console.log('─'.repeat(40))
  try {
    const svi = await fetchJSON(`${PREDICT_SERVER}/oracles/${oracleId}/svi/latest`)
    console.log(JSON.stringify(svi, null, 2))
  } catch (e) {
    console.log(`  ⚠️  ${e.message}`)
  }

  console.log('\n' + '═'.repeat(60))
  console.log('✅ Single oracle fetch complete!\n')
  console.log('Note: Forward price and odds are calculated from state data,')
  console.log('      not fetched from separate endpoints.\n')
}

main().catch(e => {
  console.error('\n❌ Error:', e.message)
  process.exit(1)
})