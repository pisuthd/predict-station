'use client'

import { useState, useEffect } from 'react'
import { MUTED, monoFont, sansFont } from '../../theme'
import { api } from '../../lib/api'

interface WalletInfo {
  exists: boolean
  address: string | null
}

interface WalletTabProps {
  onRevealSeed: () => void
}

export default function WalletTab({ onRevealSeed }: WalletTabProps) {
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({ exists: false, address: null })

  useEffect(() => {
    loadWalletInfo()
  }, [])

  const loadWalletInfo = async () => {
    try {
      const status = await api.wallet.status()
      setWalletInfo(status)
    } catch (err) {
      console.error('Failed to load wallet info:', err)
    }
  }

  return (
    <div>
      <h3 style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 16 }}>
        Wallet
      </h3>
      
      {!walletInfo.exists ? (
        <div style={{ 
          padding: 24, 
          background: 'rgba(0,0,0,0.2)', 
          borderRadius: 8,
          textAlign: 'center',
          border: '1px solid rgba(180,200,255,0.08)'
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
          <p style={{ fontFamily: sansFont, fontSize: 13, color: MUTED, marginBottom: 16 }}>
            Your agent node is not connected. Connect to a node to manage your wallet.
          </p>
        </div>
      ) : (
        <>
          {/* Wallet Address */}
          <div style={{ 
            padding: 16, 
            background: 'rgba(0,0,0,0.2)', 
            borderRadius: 8, 
            marginBottom: 16,
            border: '1px solid rgba(180,200,255,0.08)'
          }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: MUTED, marginBottom: 8, fontFamily: monoFont }}>
              Wallet Address
            </label>
            <div style={{ fontFamily: monoFont, fontSize: 12, color: '#fff', wordBreak: 'break-all' }}>
              {walletInfo.address || 'Not available'}
            </div>
          </div>

          {/* Reveal Seed Phrase Button */}
          <button
            onClick={onRevealSeed}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(180,200,255,0.2)',
              borderRadius: 8,
              color: '#fff',
              fontFamily: monoFont,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            🔑 Reveal Seed Phrase
          </button>
        </>
      )}
    </div>
  )
}