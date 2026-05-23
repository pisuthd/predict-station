'use client'

import { useState, useEffect, useRef } from 'react'
import { CYAN, NAVY, MUTED, monoFont, sansFont } from '../theme'
import { useApp } from '../context/AppProvider'
import { api } from '../lib/api'

const STATUS_MESSAGES = [
  'Loading core systems...',
  'Initializing agent framework...',
  'Connecting to local AI...',
  'Almost ready...',
]

export default function LoadingScreenModal() {
  const { setStep, setModelLoaded } = useApp()
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('Initializing...')
  const [error, setError] = useState('')
  const hasCompleted = useRef(false)

  useEffect(() => {
    if (hasCompleted.current) return

    // Subscribe to SSE progress updates
    const sse = api.models.onLoadProgress((data) => {
      if (data.isError) {
        setError(data.status || 'Failed to load model')
        return
      }

      setProgress(data.percentage || 0)
      
      if (data.status) {
        setStatus(data.status)
      } else {
        // Show status based on progress
        const index = Math.floor((data.percentage || 0) / 25)
        setStatus(STATUS_MESSAGES[index] || STATUS_MESSAGES[3])
      }

      // Check for completion
      if ((data.percentage >= 100 || data.status === 'idle') && !hasCompleted.current) {
        hasCompleted.current = true
        setModelLoaded(true)
        setTimeout(() => setStep('connected'), 300)
      }
    })

    return () => {
      sse.close()
    }
  }, [setStep, setModelLoaded])

  const handleRetry = () => {
    setError('')
    setProgress(0)
    setStatus('Initializing...')
    hasCompleted.current = false
    setStep('select-model')
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: NAVY,
          border: '1px solid rgba(180,200,255,0.12)',
          borderRadius: 16,
          width: '100%',
          maxWidth: 480,
          padding: '40px 32px',
          overflow: 'hidden',
        }}
      >
        {/* Cyan accent bar */}
        <div style={{ height: 3, background: CYAN, borderRadius: '2px 2px 0 0', marginBottom: 32 }} />

        {/* Wordmark */}
        <p
          style={{
            fontFamily: monoFont,
            fontWeight: 700,
            fontSize: 18,
            letterSpacing: '0.06em',
            color: CYAN,
            marginBottom: 32,
          }}
        >
          <span style={{ color: '#fff' }}>Predict</span> Station
        </p>

        {/* Label */}
        <p
          style={{
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.18em',
            color: 'rgba(180,200,255,0.55)',
            textTransform: 'uppercase',
            marginBottom: 10,
          }}
        >
          Loading Model
        </p>

        {/* Title */}
        <h1
          style={{
            fontSize: 26,
            fontWeight: 300,
            color: '#fff',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            marginBottom: 40,
          }}
        >
          <strong style={{ fontWeight: 500 }}>Mission Control</strong>
          <br />
          for Prediction Markets
        </h1>

        {/* Progress / Error */}
        <div style={{ width: '260px' }}>
          {error ? (
            <div>
              <div
                style={{
                  padding: 16,
                  background: 'rgba(255,60,60,0.12)',
                  border: '1px solid rgba(255,80,80,0.3)',
                  borderRadius: 8,
                  marginBottom: 16,
                }}
              >
                <p
                  style={{
                    fontFamily: monoFont,
                    fontSize: 11,
                    color: '#ff6b6b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: 8,
                  }}
                >
                  Error
                </p>
                <p
                  style={{
                    fontFamily: sansFont,
                    fontSize: 13,
                    color: 'rgba(255,180,180,0.9)',
                    margin: 0,
                  }}
                >
                  {error || 'Failed to load model'}
                </p>
              </div>

              <button
                onClick={handleRetry}
                style={{
                  padding: '12px 24px',
                  background: CYAN,
                  color: NAVY,
                  border: 'none',
                  borderRadius: 8,
                  fontFamily: monoFont,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <div
                style={{
                  width: '100%',
                  height: 2,
                  background: 'rgba(255,255,255,0.12)',
                  position: 'relative',
                  marginBottom: 14,
                  borderRadius: 2,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: `${Math.min(progress, 100)}%`,
                    background: CYAN,
                    borderRadius: 2,
                    transition: 'width 0.3s ease-out',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: 12,
                    color: 'rgba(180,200,255,0.5)',
                    letterSpacing: '0.06em',
                  }}
                >
                  {status}
                </span>
                <span
                  style={{
                    fontFamily: monoFont,
                    fontSize: 13,
                    fontWeight: 700,
                    color: CYAN,
                  }}
                >
                  {Math.round(Math.min(progress, 100))}%
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}