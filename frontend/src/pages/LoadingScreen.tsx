'use client'

import { useState, useEffect, useRef } from 'react'
import { CYAN, NAVY, monoFont, sansFont } from '../theme'
import OrbCanvas from '../components/OrbCanvas'

interface LoadingScreenProps {
  progress?: number  // External progress (0-100), if not provided uses internal simulation
  statusText?: string  // External status text
  onComplete: () => void
}

export default function LoadingScreen({ progress: externalProgress, statusText: externalStatus, onComplete }: LoadingScreenProps) {
  const [internalProgress, setInternalProgress] = useState(0)
  const [internalStatus, setInternalStatus] = useState('Initializing...')
  const [errorMessage, setErrorMessage] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const hasCompleted = useRef(false)

  // Use external progress if provided, otherwise use internal simulation
  const progress = externalProgress ?? internalProgress
  const statusText = externalStatus ?? internalStatus

  useEffect(() => {
    if (isComplete || hasCompleted.current) return

    // If using external progress, don't run internal simulation
    if (externalProgress !== undefined) {
      if (externalProgress >= 100 && !hasCompleted.current) {
        hasCompleted.current = true
        setIsComplete(true)
        setTimeout(() => onComplete(), 300)
      }
      return
    }

    // Internal simulation - starts at 20% to show progress
    let currentProgress = 20
    setInternalProgress(20)
    const statuses = [
      'Loading core systems...',
      'Initializing agent framework...',
      'Connecting to local AI...',
      'Almost ready...',
    ]

    const interval = setInterval(() => {
      currentProgress += Math.random() * 6 + 3

      if (currentProgress >= 100) {
        currentProgress = 100
        setInternalProgress(100)
        setInternalStatus('Ready')
        setIsComplete(true)
        hasCompleted.current = true
        setTimeout(() => onComplete(), 300)
        return
      }

      setInternalProgress(currentProgress)
      setInternalStatus(statuses[Math.floor(currentProgress / 25)] ?? statuses[3])
    }, 200)

    return () => clearInterval(interval)
  }, [onComplete, isComplete, externalProgress])

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

      {/* Main content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '240px',
          paddingBottom: '52px',
          maxWidth: '600px',
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
            Loading Model
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