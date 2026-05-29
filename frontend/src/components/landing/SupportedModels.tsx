import { useState, useEffect, useRef } from 'react'
import { CYAN } from '../../theme'

const models = [
  { name: 'Hardware Specs', desc: 'Standard desktops ~2GB disk, 8GB+ RAM' },
  { name: 'DeepBook Expert', desc: 'Understands DeepBook spot, margin & predict' },
  { name: 'Trade Optimized', desc: 'Fine-tuned for trading with many useful tools' }, 
  { name: 'Built-in CoT', desc: 'Advanced reasoning on every decision' },
  { name: '100% Local', desc: 'No cloud, your data stays private' },
  { name: 'Seamless Agents', desc: 'With drag-and-drop agentic workflows' },
]

export default function SupportedModels() {
  const [translateX, setTranslateX] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let animationId: number
    const speed = 0.3

    const animate = () => {
      setTranslateX(prev => {
        const cardWidth = 244
        const totalWidth = models.length * cardWidth
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
            fontFamily: "'Space Mono', monospace",
            fontSize: '11px',
            letterSpacing: '0.18em',
            color: CYAN,
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}
        >
          Powered by LocalBook DeepTrader
        </p>
        <h2
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '24px',
            fontWeight: 400,
            color: '#fff',
            lineHeight: 1.2,
          }}
        >
          Purpose-built <strong style={{ fontWeight: 600, color: CYAN }}>1.7B AI model</strong> for trading
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
                fontFamily: "'Space Mono', monospace",
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
                fontFamily: "'DM Sans', sans-serif",
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