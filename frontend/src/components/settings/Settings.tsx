'use client'

import { useRouter } from 'next/navigation'
import { CYAN, NAVY, MUTED, monoFont, sansFont } from '../../theme'
import { useApp } from '../../context/AppProvider'

export default function Settings() {
  const router = useRouter()
  const { step, disconnect } = useApp()

  const handleDisconnect = () => {
    disconnect()
    router.push('/app/dashboard')
  }

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
          <strong style={{ fontWeight: 500 }}>Settings</strong>
        </h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 600 }}>
        {/* Server Connection */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(180,200,255,0.12)',
          borderRadius: 12,
          padding: 20,
        }}>
          <h3 style={{ fontFamily: monoFont, fontSize: 11, fontWeight: 600, color: CYAN, marginBottom: 16, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Server Connection
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: sansFont, fontSize: 13, color: MUTED }}>Status</span>
              <span style={{ 
                fontFamily: monoFont, 
                fontSize: 10, 
                color: step === 'connected' ? '#22c55e' : MUTED,
                padding: '4px 8px',
                background: step === 'connected' ? 'rgba(34,197,94,0.15)' : 'rgba(180,200,255,0.1)',
                borderRadius: 4,
                textTransform: 'uppercase',
              }}>
                {step === 'connected' ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            {step === 'connected' && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleDisconnect}
                  style={{
                    padding: '8px 16px',
                    background: 'rgba(255,100,100,0.1)',
                    border: '1px solid rgba(255,100,100,0.3)',
                    borderRadius: 6,
                    fontFamily: monoFont,
                    fontSize: 10,
                    color: 'rgba(255,100,100,0.9)',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                  }}
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Agent Configuration */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(180,200,255,0.12)',
          borderRadius: 12,
          padding: 20,
        }}>
          <h3 style={{ fontFamily: monoFont, fontSize: 11, fontWeight: 600, color: CYAN, marginBottom: 16, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Agent Configuration
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontFamily: monoFont, fontSize: 10, color: MUTED, display: 'block', marginBottom: 6, letterSpacing: '0.06em' }}>
                Model
              </label>
              <select
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(180,200,255,0.2)',
                  borderRadius: 6,
                  fontFamily: sansFont,
                  fontSize: 13,
                  color: '#fff',
                  outline: 'none',
                }}
              >
                <option>Qwen3-1.7B</option>
                <option>Qwen3-4B</option>
              </select>
            </div>
            <div>
              <label style={{ fontFamily: monoFont, fontSize: 10, color: MUTED, display: 'block', marginBottom: 6, letterSpacing: '0.06em' }}>
                Temperature
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                defaultValue="0.7"
                style={{ width: '100%' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontFamily: monoFont, fontSize: 9, color: MUTED }}>Precise</span>
                <span style={{ fontFamily: monoFont, fontSize: 9, color: '#fff' }}>0.7</span>
                <span style={{ fontFamily: monoFont, fontSize: 9, color: MUTED }}>Creative</span>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(180,200,255,0.12)',
          borderRadius: 12,
          padding: 20,
        }}>
          <h3 style={{ fontFamily: monoFont, fontSize: 11, fontWeight: 600, color: CYAN, marginBottom: 16, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Preferences
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Enable streaming responses', checked: true },
              { label: 'Show thinking process', checked: true },
              { label: 'Auto-save conversations', checked: true },
            ].map((pref, i) => (
              <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked={pref.checked} style={{ accentColor: CYAN, width: 16, height: 16 }} />
                <span style={{ fontFamily: sansFont, fontSize: 13, color: '#fff' }}>{pref.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}