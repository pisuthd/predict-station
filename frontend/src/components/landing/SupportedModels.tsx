'use client'

import { useState, useEffect, useRef } from 'react'
import { CYAN, monoFont } from '../../theme'

const models = [
  { name: 'Qwen3.2-1.6B', desc: 'Lightweight & Fast' },
  { name: 'Qwen3.2-4B', desc: 'Enhanced Accuracy' },
  { name: '100% Local', desc: 'No Cloud Required' },
  { name: 'Privacy First', desc: 'Your Data Stays Local' },
  { name: 'On-Device AI', desc: 'Run Anywhere' },
]

export default function SupportedModels() {
  const [translateX, setTranslateX] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let animationId: number
    const speed = 0.3

    const animate = () => {
      setTranslateX(prev => {
        const totalWidth = models.length * 244
        if (prev <= -totalWidth) {
          return 0
        }
        return prev - speed
      })

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [])

  return (
    <div
      style={{
        padding: '80px 56px',
        position: 'relative',
        zIndex: 10,
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', marginBottom: '32px' }}>
        <p
          style={{
            fontFamily: monoFont,
            fontSize: '11px',
            letterSpacing: '0.18em',
            color: CYAN,
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}
        >
          Supported Models
        </p>
        <h2
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '24px',
            fontWeight: 400,
            color: '#fff',
            lineHeight: 1.2,
          }}
        >
          Powered by <strong style={{ fontWeight: 600, color: CYAN }}>Qwen3.2</strong> models
        </h2>
      </div>

      {/* Animated Model Cards */}
      <div
        ref={containerRef}
        style={{
          display: 'flex',
          gap: '24px',
          transform: `translateX(${translateX}px)`,
          width: 'fit-content',
        }}
      >
        {[...models, ...models].map((model, index) => (
          <div
            key={index}
            style={{
              padding: '24px 32px',
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(180,200,255,0.12)',
              borderRadius: 16,
              minWidth: '220px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <span
              style={{
                fontFamily: monoFont,
                fontSize: '16px',
                fontWeight: 700,
                color: CYAN,
                letterSpacing: '0.02em',
              }}
            >
              {model.name}
            </span>
            <span
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '13px',
                color: 'rgba(180,200,255,0.6)',
              }}
            >
              {model.desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}