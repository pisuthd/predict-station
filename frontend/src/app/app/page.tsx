'use client'

import { useState } from 'react'
import { NAVY, CYAN, MUTED, monoFont, sansFont } from '../../theme'
import MainScreen from '../../pages/MainScreen'

type NavItem = 'dashboard' | 'agents' | 'markets' | 'settings'

interface Agent {
  id: string
  name: string
  status: 'idle' | 'active' | 'error'
  createdAt: string
}

export default function AppPage() {
  const [agents] = useState<Agent[]>([])
  const [activeNav, setActiveNav] = useState<NavItem>('dashboard')

  const navItems: { id: NavItem; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'agents', label: 'Agents' },
    { id: 'markets', label: 'Markets' },
    { id: 'settings', label: 'Settings' },
  ]

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: NAVY }}>
      {/* Floating Sidebar */}
      <div
        style={{
          position: 'fixed',
          left: 24,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 100,
        }}
      >
        {/* Floating Modal */}
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
          {/* Logo/Brand */}
          <div style={{ 
            padding: '0 8px 16px', 
            borderBottom: '1px solid rgba(180,200,255,0.08)',
            marginBottom: 8
          }}>
            <p style={{ 
              fontFamily: monoFont, 
              fontWeight: 700, 
              fontSize: 12, 
              letterSpacing: '0.08em', 
              color: CYAN, 
              margin: 0 
            }}>
              PREDICT
            </p>
            <p style={{ 
              fontFamily: monoFont, 
              fontSize: 9, 
              letterSpacing: '0.1em', 
              color: 'rgba(180,200,255,0.4)', 
              margin: 0 
            }}>
              STATION
            </p>
          </div>

          {/* Navigation */}
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '10px 12px',
                background: activeNav === item.id ? 'rgba(62,196,192,0.15)' : 'transparent',
                border: activeNav === item.id ? '1px solid rgba(62,196,192,0.25)' : '1px solid transparent',
                borderRadius: 10,
                cursor: 'pointer',
                width: '100%',
                transition: 'all 0.2s ease',
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
              {item.id === 'agents' && agents.length > 0 && (
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
          ))}

          {/* Footer Status */}
          <div style={{ 
            padding: '16px 8px 4px', 
            borderTop: '1px solid rgba(180,200,255,0.08)',
            marginTop: 8
          }}>
            <div style={{
              padding: '10px 12px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(180,200,255,0.06)',
              borderRadius: 10,
            }}>
              <p style={{ 
                fontFamily: monoFont, 
                fontSize: 9, 
                letterSpacing: '0.1em', 
                color: 'rgba(180,200,255,0.4)', 
                textTransform: 'uppercase', 
                marginBottom: 4 
              }}>
                Local AI
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: CYAN,
                  boxShadow: `0 0 6px ${CYAN}`,
                }} />
                <p style={{ 
                  fontFamily: sansFont, 
                  fontSize: 11, 
                  fontWeight: 500, 
                  color: CYAN, 
                  margin: 0 
                }}>
                  Connected
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main style={{ minHeight: '100vh' }}>
        <MainScreen agents={agents} selectedAgent={null} />
      </main>
    </div>
  )
}