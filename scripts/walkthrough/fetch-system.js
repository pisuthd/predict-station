#!/usr/bin/env node
/**
 * Fetch global protocol state, config, quote assets, and high-level info
 * 
 * Usage: node fetch-system.js
 */

const PREDICT_SERVER = 'https://predict-server.testnet.mystenlabs.com'
const PREDICT_ID = '0xc8736204d12f0a7277c86388a68bf8a194b0a14c5538ad13f22cbd8e2a38028a'

async function fetchJSON(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}

async function main() {
  console.log('\n🏛️  Predict Protocol - System State\n')
  console.log('═'.repeat(60))

  // 1. Server Status
  console.log('\n📡 Server Status')
  console.log('─'.repeat(40))
  try {
    const status = await fetchJSON(`${PREDICT_SERVER}/status`)
    console.log(JSON.stringify(status, null, 2))
  } catch (e) {
    console.log(`  ⚠️  ${e.message}`)
  }

  // 2. Protocol State
  console.log('\n⚙️  Protocol Configuration & State')
  console.log('─'.repeat(40))
  try {
    const state = await fetchJSON(`${PREDICT_SERVER}/predicts/${PREDICT_ID}/state`)
    console.log(JSON.stringify(state, null, 2))
  } catch (e) {
    console.log(`  ⚠️  ${e.message}`)
  }

  // 3. Quote Assets
  console.log('\n💰 Quote Assets')
  console.log('─'.repeat(40))
  try {
    const assets = await fetchJSON(`${PREDICT_SERVER}/predicts/${PREDICT_ID}/quote-assets`)
    console.log(JSON.stringify(assets, null, 2))
  } catch (e) {
    console.log(`  ⚠️  ${e.message}`)
  }

  // 4. High-level Summary
  console.log('\n📊 Quick Summary')
  console.log('─'.repeat(40))
  try {
    const [state, assets, oracles] = await Promise.all([
      fetchJSON(`${PREDICT_SERVER}/predicts/${PREDICT_ID}/state`),
      fetchJSON(`${PREDICT_SERVER}/predicts/${PREDICT_ID}/quote-assets`),
      fetchJSON(`${PREDICT_SERVER}/predicts/${PREDICT_ID}/oracles`)
    ])
    
    const active = oracles.filter(o => o.status === 'active').length
    const pending = oracles.filter(o => o.status === 'pending').length
    const settled = oracles.filter(o => o.status === 'settled').length
    
    console.log(`  Protocol ID: ${PREDICT_ID.slice(0, 20)}...`)
    console.log(`  Total Markets: ${oracles.length}`)
    console.log(`  Active: ${active}`)
    console.log(`  Pending: ${pending}`)
    console.log(`  Settled: ${settled}`)
    console.log(`  Quote Assets: ${assets?.length || 0}`)
  } catch (e) {
    console.log(`  ⚠️  ${e.message}`)
  }

  console.log('\n' + '═'.repeat(60))
  console.log('✅ System state fetch complete!\n')
}

main().catch(e => {
  console.error('\n❌ Error:', e.message)
  process.exit(1)
})