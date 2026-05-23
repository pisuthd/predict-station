'use client'

import { useState } from 'react'
import { CYAN, NAVY, MUTED, monoFont, sansFont } from '../theme'
import { useApp } from '../context/AppProvider'

export default function ConnectNodeModal() {
  const { isConnected, serverUrl, connect, disconnect } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const [serverType, setServerType] = useState<'default' | 'custom'>('default')
  const [customUrl, setCustomUrl] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState('')

  const handleConnect = async () => {
    setError('')
    
    const url = serverType === 'default' 
      ? 'http://localhost:3001/api' 
      : customUrl.trim()
    
    if (serverType === 'custom' && !url) {
      setError('Please enter a server URL')
      return
    }
    
    if (serverType === 'custom' && !url.startsWith('http')) {
      setError('URL must start with http:// or https://')
      return
    }
    
    setIsConnecting(true)
    try {
      await connect(url)
      setIsOpen(false)
      setCustomUrl('')
      setServerType('default')
    } catch (err) {
      setError('Failed to connect to agent node')
    } finally {
      setIsConnecting(false)
    }
  }

  // When connected, this button is hidden via TopNavBar
  // Disconnect is handled in Settings

  return (
    <>
      {/* Glass Button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: '8px 16px',
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(180,200,255,0.2)',
          borderRadius: 8,
          fontFamily: monoFont,
          fontSize: 10,
          fontWeight: 600,
          color: '#fff',
          cursor: 'pointer',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        Connect Node
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            style={{
              background: NAVY,
              border: '1px solid rgba(180,200,255,0.12)',
              borderRadius: 16,
              width: '100%',
              maxWidth: 480,
              overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Cyan accent bar */}
            <div style={{ height: 3, background: CYAN, borderRadius: '2px 2px 0 0' }} />

            <div style={{ padding: '28px 32px 32px' }}>
              {/* Header */}
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontFamily: monoFont, fontSize: 11, letterSpacing: '0.14em', color: MUTED, textTransform: 'uppercase', marginBottom: 8 }}>
                  Private & On-Device AI
                </p>
                <h2 style={{ fontFamily: sansFont, fontSize: 20, fontWeight: 300, color: '#fff', marginBottom: 8, lineHeight: 1.2 }}>
                  <strong style={{ fontWeight: 500 }}>Select</strong> a server<br />to connect to
                </h2>
                <p style={{ fontFamily: monoFont, fontSize: 11, color: CYAN, marginBottom: 0 }}>
                  Choose your Agent Node endpoint
                </p>
              </div>

              {/* 2-column layout for options */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: serverType === 'custom' ? 8 : 24 }}>
                {/* Default server */}
                <button
                  onClick={() => setServerType('default')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '12px 12px',
                    background: serverType === 'default' ? 'rgba(62,196,192,0.15)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${serverType === 'default' ? 'rgba(62,196,192,0.4)' : 'rgba(180,200,255,0.12)'}`,
                    borderRadius: 6,
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    border: `2px solid ${serverType === 'default' ? CYAN : MUTED}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {serverType === 'default' && (
                      <div style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: CYAN,
                      }} />
                    )}
                  </div>
                  <div>
                    <span style={{ display: 'block', fontFamily: sansFont, fontSize: 12, fontWeight: 500, color: '#fff' }}>
                      localhost
                    </span>
                    <span style={{ fontFamily: monoFont, fontSize: 9, color: MUTED }}>
                      Default
                    </span>
                  </div>
                </button>

                {/* Custom server */}
                <button
                  onClick={() => setServerType('custom')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '12px 12px',
                    background: serverType === 'custom' ? 'rgba(62,196,192,0.15)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${serverType === 'custom' ? 'rgba(62,196,192,0.4)' : 'rgba(180,200,255,0.12)'}`,
                    borderRadius: 6,
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    border: `2px solid ${serverType === 'custom' ? CYAN : MUTED}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {serverType === 'custom' && (
                      <div style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: CYAN,
                      }} />
                    )}
                  </div>
                  <div>
                    <span style={{ display: 'block', fontFamily: sansFont, fontSize: 12, fontWeight: 500, color: '#fff' }}>
                      Custom
                    </span>
                    <span style={{ fontFamily: monoFont, fontSize: 9, color: MUTED }}>
                      Enter URL
                    </span>
                  </div>
                </button>
              </div>

              {/* Custom URL input */}
              {serverType === 'custom' && (
                <div style={{ marginBottom: 24 }}>
                  <input
                    type="text"
                    value={customUrl}
                    onChange={e => setCustomUrl(e.target.value)}
                    placeholder="http://localhost:3001/api"
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      background: 'rgba(255,255,255,0.06)',
                      border: `1px solid ${error ? 'rgba(255,100,100,0.6)' : 'rgba(180,200,255,0.2)'}`,
                      borderRadius: 6,
                      fontFamily: sansFont,
                      fontSize: 14,
                      color: '#fff',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  {error && (
                    <p style={{ fontFamily: monoFont, fontSize: 11, color: 'rgba(255,100,100,0.8)', marginTop: 6 }}>
                      {error}
                    </p>
                  )}
                </div>
              )}

              {/* Connect button */}
              <button
                onClick={handleConnect}
                disabled={isConnecting || (serverType === 'custom' && !customUrl.trim())}
                style={{
                  width: '100%',
                  padding: '13px 0',
                  background: CYAN,
                  border: 'none',
                  borderRadius: 6,
                  color: NAVY,
                  fontFamily: monoFont,
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: '0.1em',
                  cursor: isConnecting || (serverType === 'custom' && !customUrl.trim()) ? 'not-allowed' : 'pointer',
                  opacity: isConnecting ? 0.7 : 1,
                }}
              >
                {isConnecting ? 'Connecting...' : 'CONNECT'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}