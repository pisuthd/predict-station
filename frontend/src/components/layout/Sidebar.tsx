import { useNavigate, useLocation } from 'react-router-dom'
import { CYAN, monoFont, sansFont } from '../../theme'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/app' },
  { id: 'markets', label: 'Markets', path: '/app/markets' },
  { id: 'agents', label: 'Agents', path: '/app/agents' },
  { id: 'jobs', label: 'Jobs', path: '/app/jobs' }
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/app') {
      return location.pathname === '/app' || location.pathname === '/app/'
    }
    return location.pathname.startsWith(path)
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
          onClick={() => navigate('/')}
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
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              padding: '10px 12px',
              background: isActive(item.path) ? 'rgba(62,196,192,0.15)' : 'transparent',
              border: isActive(item.path) ? '1px solid rgba(62,196,192,0.25)' : '1px solid transparent',
              borderRadius: 10,
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.2s ease',
            }}
          >
            <span style={{ 
              fontFamily: sansFont, 
              fontSize: 12, 
              fontWeight: isActive(item.path) ? 600 : 400,
              color: isActive(item.path) ? CYAN : 'rgba(180,200,255,0.6)',
              letterSpacing: '0.02em',
            }}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}