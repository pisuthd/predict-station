import { useNavigate } from 'react-router-dom'
import { CYAN } from '../../theme'

export default function FooterCTA() {
  const navigate = useNavigate()

  return (
    <div
      style={{
        padding: '80px 56px',
        textAlign: 'center',
        borderTop: '1px solid rgba(180,200,255,0.08)',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <h2
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '32px',
          fontWeight: 400,
          color: '#fff',
          marginBottom: '32px',
        }}
      >
        Ready to Trade Smarter on <strong style={{ fontWeight: 500 }}>Sui Finance</strong>?
      </h2>

      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '16px' }}>
        <button
          style={{
            padding: '16px 32px',
            background: CYAN,
            border: 'none',
            borderRadius: 12,
            fontFamily: "'Space Mono', monospace",
            fontSize: 14,
            fontWeight: 700,
            color: '#000',
            cursor: 'pointer',
            letterSpacing: '0.05em',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(62,196,192,0.8)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = CYAN
          }}
        >
          Download Now
        </button>

        <button
          onClick={() => navigate('/app')}
          style={{
            padding: '16px 32px',
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(180,200,255,0.12)',
            borderRadius: 12,
            fontFamily: "'Space Mono', monospace",
            fontSize: 14,
            fontWeight: 700,
            color: '#fff',
            cursor: 'pointer',
            letterSpacing: '0.05em',
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
          Try the Interface →
        </button>
      </div>

      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '13px',
          color: 'rgba(180,200,255,0.5)',
          margin: 0,
        }}
      >
        No signup required for web interface • Desktop app is completely free
      </p>
    </div>
  )
}
