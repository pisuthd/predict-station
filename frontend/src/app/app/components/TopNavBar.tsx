'use client'

import { useState } from 'react'
import { CYAN, NAVY, monoFont } from '../../../theme'

type Network = 'testnet' | 'mainnet'

interface TopNavBarProps {
  onConnectWallet?: () => void
}

export default function TopNavBar({ onConnectWallet }: TopNavBarProps) {
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
          borderRadius: 16,
          padding: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {/* Connect Wallet - Same style as ENTER APP button */}
        <button
          onClick={onConnectWallet}
          style={{
            padding: '12px 28px',
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(180,200,255,0.12)',
            borderRadius: 16,
            fontFamily: monoFont,
            fontSize: 12,
            fontWeight: 700,
            color: CYAN,
            cursor: 'pointer',
            letterSpacing: '0.08em',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
            e.currentTarget.style.borderColor = 'rgba(62,196,192,0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
            e.currentTarget.style.borderColor = 'rgba(180,200,255,0.12)'
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
              padding: '12px 36px 12px 16px',
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(180,200,255,0.12)',
              borderRadius: 16,
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
              right: 14,
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