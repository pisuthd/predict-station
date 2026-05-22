'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CYAN, NAVY, MUTED, monoFont, sansFont } from '../theme'
import OrbCanvas from '../components/OrbCanvas'

export default function LandingPage() {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)

  const features = [
    {
      icon: '🤖',
      title: 'AI Agents',
      description: 'Create and manage AI agents for market monitoring',
    },
    {
      icon: '📊',
      title: 'Real-time Data',
      description: 'Monitor prediction markets with live updates',
    },
    {
      icon: '🔒',
      title: 'Private & Local',
      description: 'All AI runs on your device - no data leaves your system',
    },
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

  return (
    <div
      style={{
        minHeight: '100vh',
        background: NAVY,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated Orbs - Right Side */}
      <div
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          width: '55%',
          height: '100vh',
          zIndex: 1,
        }}
      >
        <OrbCanvas />
      </div>

      {/* Content - Left Side */}
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
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontFamily: monoFont,
                fontSize: 12,
                fontWeight: 700,
                color: CYAN,
                letterSpacing: '0.08em',
              }}
            >
              PREDICT
            </span>
            <span
              style={{
                fontFamily: monoFont,
                fontSize: 9,
                letterSpacing: '0.1em',
                color: 'rgba(180,200,255,0.4)',
              }}
            >
              STATION
            </span>
          </div>

          {/* Enter App Button - Glassmorphism */}
          <button
            onClick={() => router.push('/app')}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
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
          >
            ENTER APP →
          </button>
        </nav>

        {/* Hero Section */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: '56px',
            paddingRight: '55%',
          }}
        >
          <div>
            {/* Label */}
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

            {/* Main Title */}
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

            {/* Description */}
            <p
              style={{
                fontFamily: sansFont,
                fontSize: '16px',
                color: 'rgba(180,200,255,0.6)',
                lineHeight: 1.6,
                marginBottom: '40px',
                maxWidth: '420px',
              }}
            >
              Deploy AI agents to monitor and trade on decentralized prediction markets. 
              All processing happens locally on your device.
            </p>

            {/* CTA Buttons - Glassmorphism */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                onClick={() => router.push('/app')}
                style={{
                  padding: '16px 32px',
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(180,200,255,0.12)',
                  borderRadius: 16,
                  fontFamily: monoFont,
                  fontSize: 13,
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
                GET STARTED
              </button>

              <button
                style={{
                  padding: '16px 32px',
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(180,200,255,0.12)',
                  borderRadius: 16,
                  fontFamily: monoFont,
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#fff',
                  cursor: 'pointer',
                  letterSpacing: '0.1em',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                }}
              >
                LEARN MORE
              </button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div
          style={{
            padding: '80px 56px',
            borderTop: '1px solid rgba(180,200,255,0.08)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '32px',
              maxWidth: '900px',
            }}
          >
            {features.map((feature, index) => (
              <div
                key={index}
                style={{
                  padding: '24px',
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(180,200,255,0.12)',
                  borderRadius: 16,
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                }}
              >
                <div
                  style={{
                    fontSize: '32px',
                    marginBottom: '16px',
                  }}
                >
                  {feature.icon}
                </div>
                <h3
                  style={{
                    fontFamily: sansFont,
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#fff',
                    marginBottom: '8px',
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    fontFamily: sansFont,
                    fontSize: '13px',
                    color: MUTED,
                    lineHeight: 1.5,
                  }}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works Section */}
        <div
          style={{
            padding: '80px 56px',
            background: 'rgba(0,0,0,0.2)',
          }}
        >
          <p
            style={{
              fontFamily: monoFont,
              fontSize: '11px',
              letterSpacing: '0.18em',
              color: MUTED,
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
              maxWidth: '900px',
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
                    opacity: 0.3,
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
                    color: MUTED,
                    lineHeight: 1.5,
                  }}
                >
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div
          style={{
            padding: '64px 56px',
            textAlign: 'center',
            borderTop: '1px solid rgba(180,200,255,0.08)',
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

          {/* Launch App - Glassmorphism */}
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

        {/* Bottom Teal Accent Bar */}
        <div
          style={{
            height: 4,
            background: CYAN,
          }}
        />
      </div>

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
  )
}