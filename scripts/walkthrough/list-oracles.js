#!/usr/bin/env node
/**
 * List all markets/oracles with expiry, status, strikes, and underlying
 * 
 * Usage: node list-oracles.js [--status active|pending|settled|all]
 */

const PREDICT_SERVER = 'https://predict-server.testnet.mystenlabs.com'
const PREDICT_ID = '0xc8736204d12f0a7277c86388a68bf8a194b0a14c5538ad13f22cbd8e2a38028a'

const args = process.argv.slice(2)
const filter = args.includes('--status') 
  ? args[args.indexOf('--status') + 1] || 'all'
  : 'all'

async function fetchJSON(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}

function formatDate(ms) {
  return new Date(ms).toISOString()
}

function timeUntil(ms) {
  const diff = ms - Date.now()
  if (diff < 0) return 'EXPIRED'
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${mins}m`
}

async function main() {
  console.log('\n📋 Predict Protocol - Market List\n')
  console.log('═'.repeat(60))
  console.log(`Filter: ${filter.toUpperCase()}\n`)

  try {
    const oracles = await fetchJSON(`${PREDICT_SERVER}/predicts/${PREDICT_ID}/oracles`)
    
    // Filter by status
    let filtered = oracles
    if (filter !== 'all') {
      filtered = oracles.filter(o => o.status === filter)
    }

    // Group by status
    const byStatus = {
      active: oracles.filter(o => o.status === 'active'),
      pending: oracles.filter(o => o.status === 'pending'),
      settled: oracles.filter(o => o.status === 'settled')
    }

    // Summary
    console.log('📊 Summary')
    console.log('─'.repeat(40))
    console.log(`  Total Markets: ${oracles.length}`)
    console.log(`  Active: ${byStatus.active.length}`)
    console.log(`  Pending: ${byStatus.pending.length}`)
    console.log(`  Settled: ${byStatus.settled.length}`)
    
    if (filter === 'all') {
      // Show each group
      for (const [status, markets] of Object.entries(byStatus)) {
        if (markets.length === 0) continue
        
        console.log(`\n${'─'.repeat(40)}`)
        console.log(`\n🔹 ${status.toUpperCase()} (${markets.length})`)
        console.log('─'.repeat(40))
        
        for (const market of markets) {
          console.log(`\n  Oracle ID: ${market.oracle_id}`)
          console.log(`  Underlying: ${market.underlying_asset || 'N/A'}`)
          console.log(`  Expiry: ${formatDate(market.expiry)}`)
          console.log(`  Time Until Expiry: ${timeUntil(market.expiry)}`)
          console.log(`  Status: ${market.status}`)
          if (market.strike) {
            console.log(`  Strike: $${market.strike.toLocaleString()}`)
          }
          if (market.odds) {
            console.log(`  Odds: ${JSON.stringify(market.odds)}`)
          }
        }
      }
    } else {
      // Show filtered results
      console.log(`\n${'─'.repeat(40)}`)
      console.log(`\n🔹 ${filter.toUpperCase()} Markets (${filtered.length})\n`)
      console.log('─'.repeat(40))
      
      for (const market of filtered) {
        console.log(`\n  Oracle ID: ${market.oracle_id}`)
        console.log(`  Underlying: ${market.underlying_asset || 'N/A'}`)
        console.log(`  Expiry: ${formatDate(market.expiry)}`)
        console.log(`  Time Until Expiry: ${timeUntil(market.expiry)}`)
        console.log(`  Status: ${market.status}`)
        if (market.strike) {
          console.log(`  Strike: $${market.strike.toLocaleString()}`)
        }
        if (market.odds) {
          console.log(`  Odds: ${JSON.stringify(market.odds)}`)
        }
      }
    }

  } catch (e) {
    console.log(`\n  ⚠️  Error: ${e.message}`)
  }

  console.log('\n' + '═'.repeat(60))
  console.log('✅ Market list complete!\n')
  console.log('Usage examples:')
  console.log('  node list-oracles.js                    # Show all markets')
  console.log('  node list-oracles.js --status active    # Show only active')
  console.log('  node list-oracles.js --status pending   # Show only pending')
  console.log('  node list-oracles.js --status settled   # Show only settled\n')
}

main().catch(e => {
  console.error('\n❌ Error:', e.message)
  process.exit(1)
})