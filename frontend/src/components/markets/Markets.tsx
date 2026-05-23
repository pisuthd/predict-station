'use client'

import { useApp } from '../../context/AppProvider'
import { CYAN, NAVY, MUTED, monoFont, sansFont } from '../../theme'
import { useRouter } from 'next/navigation'

export default function Markets() {
  const { step, serverUrl } = useApp()
  const router = useRouter()

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: NAVY, 
      padding: '32px 48px 32px 224px' 
    }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontFamily: sansFont,
          fontSize: 28,
          fontWeight: 300,
          color: '#fff',
          margin: 0,
        }}>
          <strong style={{ fontWeight: 500 }}>Markets</strong>
        </h1>
      </div>

      {/* Connection Status Card */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(180,200,255,0.12)',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 12, height: 12,
              borderRadius: '50%',
              background: step === 'connected' ? '#22c55e' : 'rgba(255,100,100,0.8)',
            }} />
            <div>
              <p style={{ fontFamily: monoFont, fontSize: 11, color: '#fff', margin: 0, fontWeight: 600 }}>
                {step === 'connected' ? 'Connected to Agent Node' : 'Not Connected'}
              </p>
              {step === 'connected' && (
                <p style={{ fontFamily: monoFont, fontSize: 10, color: MUTED, marginTop: 2 }}>
                  {serverUrl}
                </p>
              )}
            </div>
          </div>
          {step !== 'connected' && (
            <button
              onClick={() => router.push('/')}
              style={{
                padding: '8px 16px',
                background: CYAN,
                border: 'none',
                borderRadius: 6,
                fontFamily: monoFont,
                fontSize: 10,
                fontWeight: 600,
                color: NAVY,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Connect Now
            </button>
          )}
        </div>
      </div>

      {/* Placeholder Content */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(180,200,255,0.08)',
        borderRadius: 12,
        padding: 48,
        textAlign: 'center',
      }}>
        <p style={{ fontFamily: monoFont, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Coming Soon
        </p>
        <h2 style={{ fontFamily: monoFont, fontSize: 20, color: '#fff', marginTop: 8 }}>
          Prediction Markets
        </h2>
        <p style={{ color: MUTED, fontSize: 13, marginTop: 12 }}>
          Create and trade prediction markets here.
        </p>
      </div>
    </div>
  )
}