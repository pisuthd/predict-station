import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CYAN, monoFont, sansFont, MUTED } from '../../theme'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/app' },
  { id: 'spot', label: 'Spot', path: '/app/spot' },
  { id: 'margin', label: 'Margin', path: '/app/margin' },
  { id: 'predict', label: 'Predict', path: '/app' },
]

const moreItems = [
  { label: 'GitHub', href: 'https://github.com/pisuthd/predict-station', external: true },
]

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showMore, setShowMore] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMore(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isActive = (path: string) => {
    if (path === '/app') {
      return location.pathname === '/app' || location.pathname === '/app/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <nav
      style={{
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        minWidth: '800px',
        maxWidth: '100%',
      }}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(180,200,255,0.12)',
          borderRadius: 16,
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        {/* Wordmark */}
        <div
          onClick={() => navigate('/')}
          style={{
            padding: '4px 8px',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <p
            style={{
              fontFamily: monoFont,
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: '0.06em',
              color: CYAN,
              margin: 0,
            }}
          >
            <span style={{ color: '#fff' }}>Local</span>Book
          </p>
        </div>

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 20,
            background: 'rgba(180,200,255,0.12)',
            flexShrink: 0,
          }}
        />

        {/* Nav Items - auto grow to fill space */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
            gap: 4,
          }}
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              style={{
                padding: '8px 14px',
                background: isActive(item.path) ? 'rgba(62,196,192,0.15)' : 'transparent',
                border: isActive(item.path) ? '1px solid rgba(62,196,192,0.25)' : '1px solid transparent',
                borderRadius: 10,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <span
                style={{
                  fontFamily: sansFont,
                  fontSize: 12,
                  fontWeight: isActive(item.path) ? 600 : 400,
                  color: isActive(item.path) ? CYAN : 'rgba(180,200,255,0.6)',
                  letterSpacing: '0.02em',
                }}
              >
                {item.label}
              </span>
            </button>
          ))}

          {/* More Dropdown */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              onClick={() => setShowMore(!showMore)}
              style={{
                padding: '8px 14px',
                background: showMore ? 'rgba(255,255,255,0.08)' : 'transparent',
                border: '1px solid transparent',
                borderRadius: 10,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                transition: 'all 0.2s ease',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                if (!showMore) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                }
              }}
              onMouseLeave={(e) => {
                if (!showMore) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <span
                style={{
                  fontFamily: sansFont,
                  fontSize: 12,
                  fontWeight: 400,
                  color: MUTED,
                  letterSpacing: '0.02em',
                }}
              >
                More
              </span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                style={{
                  transform: showMore ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                }}
              >
                <path
                  d="M3 4.5L6 7.5L9 4.5"
                  stroke={MUTED}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showMore && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 8,
                  background: 'rgba(3,6,58,0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(180,200,255,0.12)',
                  borderRadius: 12,
                  padding: 8,
                  minWidth: 160,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                }}
              >
                {moreItems.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowMore(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 14px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(62,196,192,0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                        fill={MUTED}
                      />
                    </svg>
                    <span
                      style={{
                        fontFamily: sansFont,
                        fontSize: 12,
                        color: 'rgba(180,200,255,0.8)',
                      }}
                    >
                      {item.label}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 20,
            background: 'rgba(180,200,255,0.12)',
            flexShrink: 0,
          }}
        />

        {/* Connect Wallet - muted default, cyan on hover */}
        <span
          style={{
            fontFamily: sansFont,
            fontSize: 12,
            fontWeight: 400,
            color: 'rgba(180,200,255,0.6)',
            letterSpacing: '0.02em',
            cursor: 'pointer',
            transition: 'color 0.2s ease',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = CYAN
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(180,200,255,0.6)'
          }}
        >
          Connect Wallet
        </span>
      </div>
    </nav>
  )
}