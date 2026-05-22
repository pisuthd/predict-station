'use client'

import { useRouter } from 'next/navigation'
import { CYAN, monoFont } from '../../theme'

export default function HeroSection() {
  const router = useRouter()

  return (
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
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '16px',
            color: 'rgba(180,200,255,0.6)',
            lineHeight: 1.6,
            marginBottom: '40px',
          }}
        >
          Deploy AI agents to monitor and trade on decentralized prediction markets. 
          All processing happens locally on your device.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => router.push('/app')}
            style={{
              padding: '12px 28px',
              background: CYAN,
              border: 'none',
              borderRadius: 12,
              fontFamily: monoFont,
              fontSize: 12,
              fontWeight: 700,
              color: '#000',
              cursor: 'pointer',
              letterSpacing: '0.1em',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(62,196,192,0.8)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = CYAN
            }}
          >
            GET STARTED
          </button>

          <button
            style={{
              padding: '12px 28px',
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(180,200,255,0.12)',
              borderRadius: 12,
              fontFamily: monoFont,
              fontSize: 12,
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
  )
}