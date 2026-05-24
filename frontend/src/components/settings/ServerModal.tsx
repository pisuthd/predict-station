'use client'

import { CYAN, NAVY, MUTED, monoFont, sansFont } from '../../theme'
import { useApp } from '../../context/AppProvider'

interface ServerModalProps {
  showServerModal: boolean
  setShowServerModal: (show: boolean) => void
}

export default function ServerModal({ showServerModal, setShowServerModal }: ServerModalProps) {
  const { connect, isConnecting, connectionError } = useApp()

  if (!showServerModal) return null

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
      onClick={() => setShowServerModal(false)}
    >
      <div
        style={{
          background: NAVY,
          border: '1px solid rgba(180,200,255,0.15)',
          borderRadius: 16,
          padding: 32,
          width: '100%',
          maxWidth: 450,
        }}
        onClick={e => e.stopPropagation()}
      >
        <h3 style={{ fontFamily: sansFont, fontSize: 20, fontWeight: 500, color: '#fff', marginBottom: 8 }}>
          Select Server
        </h3>
        <p style={{ fontFamily: sansFont, fontSize: 13, color: MUTED, marginBottom: 24 }}>
          Choose how to connect to the agent node
        </p>

        {/* Connection Error */}
        {connectionError && (
          <div style={{ 
            padding: '10px 12px', 
            background: 'rgba(255,100,100,0.15)', 
            borderRadius: 6, 
            marginBottom: 16,
            border: '1px solid rgba(255,100,100,0.3)',
            fontFamily: monoFont,
            fontSize: 11,
            color: 'rgba(255,100,100,0.9)',
          }}>
            ⚠️ {connectionError}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          <button
            onClick={() => connect('http://localhost:3001')}
            disabled={isConnecting}
            style={{
              padding: '16px',
              background: 'rgba(62,196,192,0.1)',
              border: '1px solid rgba(62,196,192,0.3)',
              borderRadius: 8,
              cursor: isConnecting ? 'not-allowed' : 'pointer',
              textAlign: 'left',
              opacity: isConnecting ? 0.5 : 1,
            }}
          >
            <div style={{ fontFamily: monoFont, fontSize: 13, color: '#fff', marginBottom: 4 }}>
              {isConnecting ? 'Connecting...' : 'Localhost'}
            </div>
            <div style={{ fontFamily: monoFont, fontSize: 11, color: MUTED }}>
              http://localhost:3001
            </div>
          </button>

          <button
            onClick={() => {
              setShowServerModal(false)
              const custom = prompt('Enter custom server URL:')
              if (custom) {
                connect(custom)
              }
            }}
            disabled={isConnecting}
            style={{
              padding: '16px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(180,200,255,0.15)',
              borderRadius: 8,
              cursor: isConnecting ? 'not-allowed' : 'pointer',
              textAlign: 'left',
              opacity: isConnecting ? 0.5 : 1,
            }}
          >
            <div style={{ fontFamily: monoFont, fontSize: 13, color: '#fff', marginBottom: 4 }}>
              Custom Server
            </div>
            <div style={{ fontFamily: monoFont, fontSize: 11, color: MUTED }}>
              Enter a custom URL
            </div>
          </button>
        </div>

        <button
          onClick={() => setShowServerModal(false)}
          style={{
            width: '100%',
            padding: '12px 0',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(180,200,255,0.15)',
            borderRadius: 8,
            fontFamily: monoFont,
            fontSize: 11,
            color: MUTED,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}