'use client'

import { useState } from 'react'
import { CYAN, monoFont } from '../../../theme'

type Network = 'testnet' | 'mainnet'

export default function TopNavBar() {
  const [network, setNetwork] = useState<Network>('testnet')

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99,
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(0,0,0,0.3)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(180,200,255,0.08)',
      }}
    >
      {/* Left: Connect Wallet - Glassmorphism */}
      <button
        style={{
          padding: '10px 20px',
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(180,200,255,0.12)',
          borderRadius: 10,
          fontFamily: monoFont,
          fontSize: 12,
          fontWeight: 700,
          color: CYAN,
          cursor: 'pointer',
          letterSpacing: '0.08em',
        }}
      >
        CONNECT WALLET
      </button>

      {/* Right: Network Dropdown - Glassmorphism */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: monoFont, fontSize: 11, color: 'rgba(180,200,255,0.5)', letterSpacing: '0.08em' }}>
          NETWORK
        </span>
        <div style={{ position: 'relative' }}>
          <select
            value={network}
            onChange={(e) => setNetwork(e.target.value as Network)}
            style={{
              appearance: 'none',
              padding: '10px 40px 10px 16px',
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(180,200,255,0.12)',
              borderRadius: 10,
              fontFamily: monoFont,
              fontSize: 12,
              fontWeight: 700,
              color: network === 'testnet' ? CYAN : 'rgba(180,200,255,0.5)',
              cursor: network === 'testnet' ? 'pointer' : 'not-allowed',
            }}
          >
            <option value="testnet">TESTNET</option>
            <option value="mainnet" disabled>MAINNET</option>
          </select>
          <span
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: network === 'testnet' ? CYAN : 'rgba(180,200,255,0.5)',
              fontSize: 10,
            }}
          >
            ▾
          </span>
        </div>
      </div>
    </div>
  )
}