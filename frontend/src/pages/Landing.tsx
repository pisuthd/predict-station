import { useState, useEffect } from 'react'
import { CYAN, NAVY } from '../theme'
import Navbar from '../components/layout/Navbar'
import OrbCanvas from '../components/OrbCanvas'
import { HeroSection, SupportedModels, KeyFeatures, HowItWorks, LocalBookDesktop, FooterCTA } from '../components/landing'

export default function Landing() {
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

      {/* Navbar */}
      <Navbar />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          paddingTop: 80,
        }}
      >
        {/* Sections */}
        <HeroSection />
        <SupportedModels />
        <KeyFeatures />
        <HowItWorks />
        <LocalBookDesktop />
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
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                color: 'rgba(180,200,255,0.5)',
                margin: 0,
              }}
            >
              <span style={{ color: '#fff', fontFamily: "'Space Mono', monospace" }}>Local</span>
              <span style={{ color: CYAN, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>Book</span>
              {' '}© 2026
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