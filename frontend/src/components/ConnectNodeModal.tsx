'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CYAN, NAVY, MUTED, monoFont, sansFont } from '../theme'
import { useApp } from '../context/AppProvider'

export default function ConnectNodeModal() {
  const { connect, isConnecting, connectionError } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const [serverType, setServerType] = useState<'default' | 'custom'>('default')
  const [customUrl, setCustomUrl] = useState('')
  const [localError, setLocalError] = useState('')

  const handleConnect = () => {
    setLocalError('')
    
    const url = serverType === 'default' 
      ? 'http://localhost:3001' 
      : customUrl.trim()
    
    if (serverType === 'custom' && !url) {
      setLocalError('Please enter a server URL')
      return
    }
    
    if (serverType === 'custom' && !url.startsWith('http')) {
      setLocalError('URL must start with http:// or https://')
      return
    }
    
    connect(url)
    // Close modal only after successful connection (handled by AppProvider)
  }
  
  // Show error if connection fails
  const displayError = localError || connectionError

  return (
    <> 
      <motion.button
        onClick={() => setIsOpen(true)}
        style={{
          padding: '12px 28px',
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(180,200,255,0.12)',
          borderRadius: 16,
          fontFamily: 'Space Mono, monospace',
          fontSize: 12,
          fontWeight: 700,
          color: '#3EC4C0',
          cursor: 'pointer',
          letterSpacing: '0.08em',
        }}
        whileHover={{ 
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderColor: 'rgba(62,196,192,0.3)',
          scale: 1.02
        }}
        whileTap={{ scale: 0.98 }}
      >
        Connect Local Agent
      </motion.button>

      {/* Modal with AnimatePresence */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
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
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
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
                  <motion.button
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
                    }}
                    whileHover={{ backgroundColor: serverType === 'default' ? 'rgba(62,196,192,0.2)' : 'rgba(255,255,255,0.08)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        border: `2px solid ${serverType === 'default' ? CYAN : MUTED}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {serverType === 'default' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: CYAN,
                          }}
                        />
                      )}
                    </motion.div>
                    <div>
                      <span style={{ display: 'block', fontFamily: sansFont, fontSize: 12, fontWeight: 500, color: '#fff' }}>
                        localhost
                      </span>
                      <span style={{ fontFamily: monoFont, fontSize: 9, color: MUTED }}>
                        Default
                      </span>
                    </div>
                  </motion.button>

                  {/* Custom server */}
                  <motion.button
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
                    }}
                    whileHover={{ backgroundColor: serverType === 'custom' ? 'rgba(62,196,192,0.2)' : 'rgba(255,255,255,0.08)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        border: `2px solid ${serverType === 'custom' ? CYAN : MUTED}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {serverType === 'custom' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: CYAN,
                          }}
                        />
                      )}
                    </motion.div>
                    <div>
                      <span style={{ display: 'block', fontFamily: sansFont, fontSize: 12, fontWeight: 500, color: '#fff' }}>
                        Custom
                      </span>
                      <span style={{ fontFamily: monoFont, fontSize: 9, color: MUTED }}>
                        Enter URL
                      </span>
                    </div>
                  </motion.button>
                </div>

                {/* Custom URL input with animation */}
                <AnimatePresence>
                  {serverType === 'custom' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ marginBottom: 24, overflow: 'hidden' }}
                    >
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
                          border: `1px solid ${displayError ? 'rgba(255,100,100,0.6)' : 'rgba(180,200,255,0.2)'}`,
                          borderRadius: 6,
                          fontFamily: sansFont,
                          fontSize: 14,
                          color: '#fff',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error message (shown below input or above button) */}
                {displayError && (
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
                    ⚠️ {displayError}
                  </div>
                )}

                {/* Connect button */}
                <motion.button
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
                  whileHover={!isConnecting && (serverType !== 'custom' || customUrl.trim()) ? { scale: 1.02 } : {}}
                  whileTap={!isConnecting && (serverType !== 'custom' || customUrl.trim()) ? { scale: 0.98 } : {}}
                >
                  {isConnecting ? 'Connecting...' : 'CONNECT'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}