'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Check } from 'lucide-react'
import { CYAN, NAVY, MUTED, monoFont, sansFont } from '../theme'
import OrbCanvas from '../components/OrbCanvas'

const models = [
  { name: 'Qwen3.2-1.6B', desc: 'Lightweight & Fast' },
  { name: 'Qwen3.2-4B', desc: 'Enhanced Accuracy' },
  { name: '100% Local', desc: 'No Cloud Required' },
  { name: 'Privacy First', desc: 'Your Data Stays Local' },
  { name: 'On-Device AI', desc: 'Run Anywhere' },
]

const steps = [
  {
    number: '01',
    title: 'Create AI Agent',
    description: 'Set up your personal AI agent with custom settings',
  },
  {
    number: '02',
    title: 'Configure Markets',
    description: 'Select prediction markets to monitor and trade',
  },
  {
    number: '03',
    title: 'Deploy & Monitor',
    description: 'Let your agent analyze and make predictions',
  },
]

export default function LandingPage() {
  const router = useRouter()
  const [scrollY, setScrollY] = useState(0)
  const [translateX, setTranslateX] = useState(0)
  const [copied, setCopied] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Animate the ticker (slide left continuously)
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText('npx predict-station init')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy')
    }
  }

  const orbOpacity = Math.max(0, 1 - scrollY / 400)

  return (
    <div
      style={{
        minHeight: '100vh',
        background: NAVY,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Fixed Animated Orbs - Right Side, fades on scroll */}
      <div
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          width: '50%',
          height: '100vh',
          opacity: orbOpacity,
          transition: 'opacity 0.3s ease-out',
          pointerEvents: orbOpacity > 0.1 ? 'auto' : 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.5))',
          }}
        />
        <OrbCanvas />
      </div>

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Navigation */}
        <nav
          style={{
            padding: '24px 56px',
            position: 'relative',
            zIndex: 10,
          }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Wordmark */}
            <p
              style={{
                fontFamily: monoFont,
                fontWeight: 700,
                fontSize: 16,
                letterSpacing: '0.06em',
                color: CYAN,
                margin: 0,
              }}
            >
              <span style={{ color: '#fff' }}>Predict</span> Station
            </p>

            {/* Enter App Button */}
            <button
              onClick={() => router.push('/app')}
              style={{
                padding: '12px 28px',
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(180,200,255,0.12)',
                borderRadius: 16,
                fontFamily: monoFont,
                fontSize: 12,
                fontWeight: 700,
                color: CYAN,
                cursor: 'pointer',
                letterSpacing: '0.08em',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.borderColor = 'rgba(62,196,192,0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                e.currentTarget.style.borderColor = 'rgba(180,200,255,0.12)'
              }}
            >
              ENTER APP →
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <div
          style={{
            flex: 1,
            display: 'flex', 
            padding: '0 56px',
            alignItems: 'center',
          }}
        >
          <div style={{ maxWidth: '560px' }}>
            <p
              style={{
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.18em',
                color: CYAN,
                textTransform: 'uppercase',
                marginBottom: '16px',
              }}
            >
              Private & On-Device AI
            </p>

            <h1
              style={{
                fontSize: '48px',
                fontWeight: 300,
                color: '#fff',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                marginBottom: '24px',
              }}
            >
              <strong style={{ fontWeight: 500 }}>Mission Control</strong>
              <br />
              for Prediction Markets
            </h1>

            <p
              style={{
                fontFamily: sansFont,
                fontSize: '16px',
                color: 'rgba(180,200,255,0.6)',
                lineHeight: 1.6,
                marginBottom: '40px',
              }}
            >
              Deploy AI agents to monitor and trade on decentralized prediction markets. 
              All processing happens locally on your device.
            </p>

            {/* Copyable Command Textbox + CTA */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                onClick={handleCopy}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  padding: '16px 20px',
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(180,200,255,0.12)',
                  borderRadius: 12,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  flex: 1,
                  maxWidth: '360px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.borderColor = 'rgba(62,196,192,0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.borderColor = 'rgba(180,200,255,0.12)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontFamily: monoFont,
                      fontSize: '13px',
                      color: CYAN,
                      letterSpacing: '0.02em',
                    }}
                  >
                    Run with
                  </span>
                  <code
                    style={{
                      fontFamily: monoFont,
                      fontSize: '14px',
                      color: '#fff',
                      letterSpacing: '0.02em',
                    }}
                  >
                    npx predict-station init
                  </code>
                </div>
                {copied ? (
                  <Check size={18} color={CYAN} />
                ) : (
                  <Copy size={18} color="rgba(180,200,255,0.5)" />
                )}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => router.push('/app')}
                style={{
                  padding: '16px 24px',
                  background: CYAN,
                  border: 'none',
                  borderRadius: 12,
                  fontFamily: monoFont,
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#000',
                  cursor: 'pointer',
                  letterSpacing: '0.08em',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(62,196,192,0.8)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = CYAN
                }}
              >
                ENTER APP →
              </button>
            </div>
          </div>
        </div>

        {/* Supported Models - Same background as hero (transparent) */}
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
                fontFamily: sansFont,
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
            {models.map((model, index) => (
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
                    fontFamily: sansFont,
                    fontSize: '13px',
                    color: 'rgba(180,200,255,0.6)',
                  }}
                >
                  {model.desc}
                </span>
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {models.map((model, index) => (
              <div
                key={`dup-${index}`}
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
                    fontFamily: sansFont,
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

        {/* How It Works Section */}
        <div
          style={{
            padding: '80px 56px',
            background: 'rgba(0,0,0,0.2)',
            position: 'relative',
            zIndex: 10,
          }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <p
              style={{
                fontFamily: monoFont,
                fontSize: '11px',
                letterSpacing: '0.18em',
                color: CYAN,
                textTransform: 'uppercase',
                marginBottom: '16px',
              }}
            >
              How It Works
            </p>

            <h2
              style={{
                fontFamily: sansFont,
                fontSize: '32px',
                fontWeight: 300,
                color: '#fff',
                marginBottom: '48px',
                lineHeight: 1.2,
              }}
            >
              <strong style={{ fontWeight: 500 }}>Three</strong> simple steps
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '32px',
              }}
            >
              {steps.map((step, index) => (
                <div key={index}>
                  <div
                    style={{
                      fontFamily: monoFont,
                      fontSize: '48px',
                      fontWeight: 700,
                      color: CYAN,
                      marginBottom: '16px',
                    }}
                  >
                    {step.number}
                  </div>
                  <h3
                    style={{
                      fontFamily: sansFont,
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#fff',
                      marginBottom: '8px',
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: sansFont,
                      fontSize: '14px',
                      color: 'rgba(180,200,255,0.6)',
                      lineHeight: 1.5,
                    }}
                  >
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div
          style={{
            padding: '64px 56px',
            textAlign: 'center',
            borderTop: '1px solid rgba(180,200,255,0.08)',
            position: 'relative',
            zIndex: 10,
          }}
        >
          <h2
            style={{
              fontFamily: sansFont,
              fontSize: '28px',
              fontWeight: 300,
              color: '#fff',
              marginBottom: '24px',
            }}
          >
            Ready to start your <strong style={{ fontWeight: 500 }}>mission</strong>?
          </h2>

          <button
            onClick={() => router.push('/app')}
            style={{
              padding: '16px 48px',
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(180,200,255,0.12)',
              borderRadius: 16,
              fontFamily: monoFont,
              fontSize: 14,
              fontWeight: 700,
              color: CYAN,
              cursor: 'pointer',
              letterSpacing: '0.1em',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(62,196,192,0.15)'
              e.currentTarget.style.borderColor = 'rgba(62,196,192,0.25)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              e.currentTarget.style.borderColor = 'rgba(180,200,255,0.12)'
            }}
          >
            LAUNCH APP →
          </button>
        </div>

        {/* Footer */}
        <footer
          style={{
            padding: '24px 56px',
            borderTop: '1px solid rgba(180,200,255,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            zIndex: 10,
          }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p
              style={{
                fontFamily: monoFont,
                fontSize: 12,
                color: 'rgba(180,200,255,0.5)',
                margin: 0,
              }}
            >
              <span style={{ color: '#fff' }}>Predict</span> Station © 2026
            </p>
            <div style={{ display: 'flex', gap: '24px' }}>
              <span style={{ fontFamily: sansFont, fontSize: 12, color: 'rgba(180,200,255,0.5)', cursor: 'pointer' }}>Privacy</span>
              <span style={{ fontFamily: sansFont, fontSize: 12, color: 'rgba(180,200,255,0.5)', cursor: 'pointer' }}>Terms</span>
              <span style={{ fontFamily: sansFont, fontSize: 12, color: 'rgba(180,200,255,0.5)', cursor: 'pointer' }}>Contact</span>
            </div>
          </div>
        </footer>

        {/* Bottom Teal Accent Bar */}
        <div
          style={{
            height: 4,
            background: CYAN,
            position: 'relative',
            zIndex: 10,
          }}
        />

        {/* Cyan Left Edge Accent */}
        <div
          style={{
            position: 'fixed',
            left: 0,
            bottom: '52px',
            width: 4,
            height: 80,
            background: CYAN,
            zIndex: 15,
          }}
        />
      </div>
    </div>
  )
}