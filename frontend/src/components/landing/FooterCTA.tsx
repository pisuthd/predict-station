import { useNavigate } from 'react-router-dom'
import { CYAN } from '../../theme'

export default function FooterCTA() {
  const navigate = useNavigate()

  return (
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
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '28px',
          fontWeight: 300,
          color: '#fff',
          marginBottom: '24px',
        }}
      >
        Ready to start your <strong style={{ fontWeight: 500 }}>mission</strong>?
      </h2>

      <button
        onClick={() => navigate('/app')}
        style={{
          padding: '16px 48px',
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(180,200,255,0.12)',
          borderRadius: 16,
          fontFamily: "'Space Mono', monospace",
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
  )
}