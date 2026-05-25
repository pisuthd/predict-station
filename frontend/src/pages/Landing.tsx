import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CYAN, NAVY, monoFont } from '../theme'
import OrbCanvas from '../components/OrbCanvas'
import { HeroSection, SupportedModels, HowItWorks, FooterCTA } from '../components/landing'

export default function Landing() {
  const navigate = useNavigate()
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
      {/* Fixed Animated Orbs - Right Side */}
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
              <span style={{ color: '#fff' }}>Predict</span>Up
            </p>

            {/* Enter App Button */}
            <button
              onClick={() => navigate('/app')}
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
              ENTER APP
            </button>
          </div>
        </nav>

        {/* Sections */}
        <HeroSection />
        <SupportedModels />
        <HowItWorks />
        <FooterCTA />

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
              <span style={{ color: '#fff' }}>Predict</span>
              <span style={{ color: CYAN, fontWeight: 700, }}>Up</span>
              {` `}© 2026
            </p>
            <div style={{ display: 'flex', gap: '24px' }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(180,200,255,0.5)', cursor: 'pointer' }}>Privacy</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(180,200,255,0.5)', cursor: 'pointer' }}>Terms</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(180,200,255,0.5)', cursor: 'pointer' }}>Contact</span>
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
      </div>
    </div>
  )
}