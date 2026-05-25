#!/usr/bin/env node
/**
 * Fetch vault data: PLP, vault summary, and performance
 * 
 * Usage: node fetch-vault.js [--range 7d|30d|90d|ALL]
 */

const PREDICT_SERVER = 'https://predict-server.testnet.mystenlabs.com'
const PREDICT_ID = '0xc8736204d12f0a7277c86388a68bf8a194b0a14c5538ad13f22cbd8e2a38028a'

const args = process.argv.slice(2)
const range = args.includes('--range') 
  ? args[args.indexOf('--range') + 1] || 'ALL'
  : 'ALL'

async function fetchJSON(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}

function formatUSD(amount) {
  if (amount === undefined || amount === null) return 'N/A'
  return `$${(amount / 1e9).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}B`
}

async function main() {
  console.log('\n🏦 Predict Protocol - Vault Data\n')
  console.log('═'.repeat(60))
  console.log(`Performance Range: ${range}\n`)

  // 1. Vault Summary
  console.log('📊 Vault Summary')
  console.log('─'.repeat(40))
  try {
    const summary = await fetchJSON(`${PREDICT_SERVER}/predicts/${PREDICT_ID}/vault/summary`)
    
    console.log(JSON.stringify(summary, null, 2))
    
    // Also print formatted values if available
    if (summary) {
      console.log('\n  📈 Formatted Values:')
      if (summary.vault_value !== undefined) {
        console.log(`    Vault Value: ${formatUSD(summary.vault_value)}`)
      }
      if (summary.plp !== undefined) {
        console.log(`    PLP (Protocol Liquidity Pool): ${formatUSD(summary.plp)}`)
      }
      if (summary.total_deposits !== undefined) {
        console.log(`    Total Deposits: ${formatUSD(summary.total_deposits)}`)
      }
      if (summary.total_withdrawals !== undefined) {
        console.log(`    Total Withdrawals: ${formatUSD(summary.total_withdrawals)}`)
      }
      if (summary.net_flow !== undefined) {
        console.log(`    Net Flow: ${formatUSD(summary.net_flow)}`)
      }
    }
  } catch (e) {
    console.log(`  ⚠️  ${e.message}`)
  }

  // 2. Vault Performance
  console.log('\n📈 Vault Performance')
  console.log('─'.repeat(40))
  try {
    const perf = await fetchJSON(`${PREDICT_SERVER}/predicts/${PREDICT_ID}/vault/performance?range=${range}`)
    
    console.log(JSON.stringify(perf, null, 2))
    
    // Also print key metrics
    if (perf) {
      console.log('\n  📊 Key Metrics:')
      if (perf.pnl !== undefined) {
        console.log(`    P&L: ${formatUSD(perf.pnl)}`)
      }
      if (perf.cumulative_return !== undefined) {
        console.log(`    Cumulative Return: ${(perf.cumulative_return * 100).toFixed(2)}%`)
      }
      if (perf.sharpe_ratio !== undefined) {
        console.log(`    Sharpe Ratio: ${perf.sharpe_ratio}`)
      }
      if (perf.max_drawdown !== undefined) {
        console.log(`    Max Drawdown: ${(perf.max_drawdown * 100).toFixed(2)}%`)
      }
      if (perf.volatility !== undefined) {
        console.log(`    Volatility: ${(perf.volatility * 100).toFixed(2)}%`)
      }
    }
  } catch (e) {
    console.log(`  ⚠️  ${e.message}`)
  }

  // 3. PLP Details
  console.log('\n💧 PLP (Protocol Liquidity Pool)')
  console.log('─'.repeat(40))
  try {
    const plp = await fetchJSON(`${PREDICT_SERVER}/predicts/${PREDICT_ID}/vault/plp`)
    
    console.log(JSON.stringify(plp, null, 2))
    
    if (plp) {
      console.log('\n  📊 PLP Metrics:')
      if (plp.total_liquidity !== undefined) {
        console.log(`    Total Liquidity: ${formatUSD(plp.total_liquidity)}`)
      }
      if (plp.available_liquidity !== undefined) {
        console.log(`    Available Liquidity: ${formatUSD(plp.available_liquidity)}`)
      }
      if (plp.utilization !== undefined) {
        console.log(`    Utilization: ${(plp.utilization * 100).toFixed(2)}%`)
      }
      if (plp.annual_return !== undefined) {
        console.log(`    Annual Return: ${(plp.annual_return * 100).toFixed(2)}%`)
      }
    }
  } catch (e) {
    console.log(`  ⚠️  PLP endpoint not available: ${e.message}`)
  }

  // 4. User Positions (if any)
  console.log('\n👤 User Summary')
  console.log('─'.repeat(40))
  try {
    const users = await fetchJSON(`${PREDICT_SERVER}/predicts/${PREDICT_ID}/vault/users`)
    console.log(JSON.stringify(users, null, 2))
  } catch (e) {
    console.log(`  ⚠️  ${e.message}`)
  }

  console.log('\n' + '═'.repeat(60))
  console.log('✅ Vault data fetch complete!\n')
  console.log('Usage examples:')
  console.log('  node fetch-vault.js                       # Default ALL range')
  console.log('  node fetch-vault.js --range 7d            # Last 7 days')
  console.log('  node fetch-vault.js --range 30d           # Last 30 days')
  console.log('  node fetch-vault.js --range 90d           # Last 90 days')
  console.log('  node fetch-vault.js --range ALL           # All time\n')
}

main().catch(e => {
  console.error('\n❌ Error:', e.message)
  process.exit(1)
})