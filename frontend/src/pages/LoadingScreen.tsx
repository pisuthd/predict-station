'use client'

import { useState, useEffect } from 'react'
import { CYAN, NAVY, monoFont, sansFont } from '../theme'
import OrbCanvas from '../components/OrbCanvas'

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('Initializing...')
  const [errorMessage, setErrorMessage] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (isComplete) return

    let currentProgress = 0
    const statuses = [
      'Loading core systems...',
      'Initializing agent framework...',
      'Connecting to local AI...',
      'Almost ready...',
    ]

    const interval = setInterval(() => {
      currentProgress += Math.random() * 8 + 4

      if (currentProgress >= 100) {
        currentProgress = 100
        setProgress(100)
        setStatusText('Ready')
        setIsComplete(true)
        setTimeout(() => onComplete(), 300)
        return
      }

      setProgress(currentProgress)
      setStatusText(statuses[Math.floor(currentProgress / 25)] ?? statuses[3])
    }, 200)

    return () => clearInterval(interval)
  }, [onComplete, isComplete])

  return (
    <div
      style={{
        minHeight: '100vh',
        background: NAVY,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: sansFont,
      }}
    >
      <OrbCanvas />

      {/* Teal left-edge accent */}
      <div
        style={{
          position: 'absolute',
          bottom: 52,
          left: 0,
          width: 4,
          height: 80,
          background: CYAN,
          zIndex: 5,
        }}
      />

      {/* Main content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '56px',
          paddingBottom: '52px',
        }}
      >
        <div>
          {/* Wordmark */}
          <p
            style={{
              fontFamily: monoFont,
              fontWeight: 700,
              fontSize: 20,
              letterSpacing: '0.06em',
              color: CYAN,
              marginBottom: '40px',
            }}
          >
            <span style={{ color: '#fff' }}>Predict</span> Station
          </p>

          {/* Label */}
          <p
            style={{
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.18em',
              color: 'rgba(180,200,255,0.55)',
              textTransform: 'uppercase',
              marginBottom: '10px',
            }}
          >
            Private & On-Device AI
          </p>

          {/* Title */}
          <h1
            style={{
              fontSize: '30px',
              fontWeight: 300,
              color: '#fff',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              marginBottom: '40px',
            }}
          >
            <strong style={{ fontWeight: 500 }}>Mission Control</strong>
            <br />
            for Prediction Markets
          </h1>

          {/* Progress / Error */}
          <div style={{ width: '260px' }}>
            {errorMessage ? (
              <div>
                <div
                  style={{
                    padding: '16px',
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
                    {errorMessage || 'Failed to initialize system'}
                  </p>
                </div>

                <button
                  onClick={() => window.location.reload()}
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
                  Reload System
                </button>
              </div>
            ) : (
              <>
                <div
                  style={{
                    width: '100%',
                    height: '2px',
                    background: 'rgba(255,255,255,0.12)',
                    position: 'relative',
                    marginBottom: '14px',
                    borderRadius: '2px',
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
                      borderRadius: '2px',
                      transition: 'width 0.3s ease-out',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: '12px',
                      color: 'rgba(180,200,255,0.5)',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {statusText}
                  </span>
                  <span
                    style={{
                      fontFamily: monoFont,
                      fontSize: '13px',
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
    </div>
  )
}