'use client'

import { useState } from 'react'
import { CYAN, NAVY, MUTED, monoFont, sansFont } from '../../theme'
import { api } from '../../lib/api'

interface RevealModalProps {
  showRevealModal: boolean
  onClose: () => void
}

export default function RevealModal({ showRevealModal, onClose }: RevealModalProps) {
  const [confirmText, setConfirmText] = useState('')
  const [mnemonic, setMnemonic] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  if (!showRevealModal) return null

  const handleRevealSeed = async () => {
    if (confirmText !== 'CONFIRM') return
    setIsLoading(true)
    try {
      const result = await api.wallet.mnemonic()
      setMnemonic(result.mnemonic)
    } catch (err) {
      console.error('Failed to reveal seed:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setConfirmText('')
    setMnemonic(null)
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(3,6,58,0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 24,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: NAVY,
          border: '1px solid rgba(180,200,255,0.15)',
          borderRadius: 16,
          padding: 32,
          width: '100%',
          maxWidth: 500,
        }}
        onClick={e => e.stopPropagation()}
      >
        {!mnemonic ? (
          <>
            <h3 style={{ fontFamily: sansFont, fontSize: 18, fontWeight: 500, color: '#fff', marginBottom: 8 }}>
              Reveal Seed Phrase
            </h3>
            <p style={{ fontFamily: monoFont, fontSize: 11, color: 'rgba(255,100,100,0.8)', marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              ⚠️ Warning: Never share your seed phrase
            </p>

            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.12em',
                textTransform: 'uppercase' as const,
                color: MUTED,
                marginBottom: 8,
                fontFamily: monoFont,
              }}>
                Type CONFIRM to reveal
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder="CONFIRM"
                autoFocus
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(180,200,255,0.2)',
                  borderRadius: 8,
                  fontFamily: monoFont,
                  fontSize: 14,
                  color: '#fff',
                  outline: 'none',
                  boxSizing: 'border-box',
                  textAlign: 'center',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handleClose}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(180,200,255,0.2)',
                  borderRadius: 8,
                  fontFamily: monoFont,
                  fontSize: 11,
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRevealSeed}
                disabled={confirmText !== 'CONFIRM' || isLoading}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  background: 'rgba(255,100,100,0.15)',
                  border: '1px solid rgba(255,100,100,0.3)',
                  borderRadius: 8,
                  color: 'rgba(255,100,100,0.9)',
                  fontFamily: monoFont,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: confirmText === 'CONFIRM' && !isLoading ? 'pointer' : 'not-allowed',
                  opacity: confirmText === 'CONFIRM' && !isLoading ? 1 : 0.5,
                }}
              >
                {isLoading ? 'Loading...' : 'Reveal'}
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 style={{ fontFamily: sansFont, fontSize: 18, fontWeight: 500, color: '#fff', marginBottom: 8 }}>
              Your Seed Phrase
            </h3>
            <p style={{ fontFamily: monoFont, fontSize: 10, color: 'rgba(255,100,100,0.8)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              ⚠️ Write this down and keep it safe
            </p>

            <div style={{ 
              padding: 16, 
              background: 'rgba(0,0,0,0.3)', 
              borderRadius: 8, 
              marginBottom: 24,
              fontFamily: monoFont,
              fontSize: 12,
              color: '#fff',
              lineHeight: 1.8,
              wordBreak: 'break-word',
            }}>
              {mnemonic}
            </div>

            <button
              onClick={handleClose}
              style={{
                width: '100%',
                padding: '12px 0',
                background: CYAN,
                border: 'none',
                borderRadius: 8,
                color: NAVY,
                fontFamily: monoFont,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Done
            </button>
          </>
        )}
      </div>
    </div>
  )
}