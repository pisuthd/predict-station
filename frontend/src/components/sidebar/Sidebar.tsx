'use client'

import { useRouter } from 'next/navigation'
import { CYAN, NAVY, monoFont, sansFont } from '../../theme'
import { useApp } from '../../context/AppProvider'

type NavItem = 'dashboard' | 'agents' | 'markets' | 'analytics' | 'settings'

const navItems: { id: NavItem; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'agents', label: 'Agents' },
  { id: 'markets', label: 'Markets' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'settings', label: 'Settings' },
]

export default function Sidebar() {
  const router = useRouter()
  const { step, agents, activeNav, setActiveNav } = useApp()

  const handleNavClick = (id: NavItem) => {
    setActiveNav(id)
    router.push(`/app/${id}`)
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: 24,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(180,200,255,0.12)',
          borderRadius: 16,
          padding: '20px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          minWidth: 160,
        }}
      >
        {/* Wordmark */}
        <div 
          onClick={() => router.push('/')}
          style={{ 
            padding: '0 8px 16px', 
            borderBottom: '1px solid rgba(180,200,255,0.08)',
            marginBottom: 8,
            cursor: 'pointer',
          }}
        >
          <p style={{ fontFamily: monoFont, fontWeight: 700, fontSize: 12, letterSpacing: '0.06em', color: CYAN, margin: 0 }}>
            <span style={{ color: '#fff' }}>Predict</span>Up
          </p>
        </div>

        {/* Nav Items */}
        {navItems.map((item) => {
          const isDisabled = step !== 'connected' && item.id === 'agents'

          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && handleNavClick(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '10px 12px',
                background: activeNav === item.id ? 'rgba(62,196,192,0.15)' : 'transparent',
                border: activeNav === item.id ? '1px solid rgba(62,196,192,0.25)' : '1px solid transparent',
                borderRadius: 10,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                width: '100%',
                transition: 'all 0.2s ease',
                opacity: isDisabled ? 0.5 : 1,
              }}
            >
              <span style={{ 
                fontFamily: sansFont, 
                fontSize: 12, 
                fontWeight: activeNav === item.id ? 600 : 400,
                color: activeNav === item.id ? CYAN : 'rgba(180,200,255,0.6)',
                letterSpacing: '0.02em',
              }}>
                {item.label}
              </span>
              {item.id === 'agents' && step === 'connected' && agents.length > 0 && (
                <span
                  style={{
                    background: activeNav === item.id ? CYAN : 'rgba(62,196,192,0.25)',
                    color: activeNav === item.id ? NAVY : CYAN,
                    fontFamily: monoFont,
                    fontSize: 9,
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 8,
                  }}
                >
                  {agents.length}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}