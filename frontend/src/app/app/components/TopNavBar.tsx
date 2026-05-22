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
        top: 24,
        right: 24,
        zIndex: 100,
      }}
    >
      {/* Glass floating card */}
      <div
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(180,200,255,0.12)',
          borderRadius: 12,
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        {/* Connect Wallet */}
        <button
          style={{
            padding: '10px 16px',
            background: 'rgba(62,196,192,0.15)',
            border: '1px solid rgba(62,196,192,0.3)',
            borderRadius: 8,
            fontFamily: monoFont,
            fontSize: 11,
            fontWeight: 700,
            color: CYAN,
            cursor: 'pointer',
            letterSpacing: '0.06em',
          }}
        >
          CONNECT WALLET
        </button>

        {/* Network Dropdown */}
        <div style={{ position: 'relative' }}>
          <select
            value={network}
            onChange={(e) => setNetwork(e.target.value as Network)}
            style={{
              appearance: 'none',
              padding: '10px 32px 10px 12px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(180,200,255,0.12)',
              borderRadius: 8,
              fontFamily: monoFont,
              fontSize: 11,
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
              right: 10,
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