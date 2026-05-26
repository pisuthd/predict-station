import { CYAN } from '../../theme'

const capabilities = [
  'Market sentiment analysis using on-chain data + external sources',
  'Predict expiry forecasting with probability estimates',
  'Arbitrage & opportunity detection across Spot & Margin',
  'Risk monitoring and liquidation protection alerts',
  'Automated reporting and performance tracking',
]

export default function LocalBookDesktop() {
  return (
    <div
      style={{
        padding: '80px 56px',
        background: 'rgba(0,0,0,0.2)',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <p
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '11px',
            letterSpacing: '0.18em',
            color: CYAN,
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}
        >
          Desktop App
        </p>
        <h2
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '32px',
            fontWeight: 400,
            color: '#fff',
            lineHeight: 1.2,
            marginBottom: '16px',
          }}
        >
          <strong style={{ fontWeight: 600, color: CYAN }}>LocalBook</strong> Desktop
        </h2>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '16px',
            color: 'rgba(180,200,255,0.6)',
            marginBottom: '32px',
            lineHeight: 1.6,
          }}
        >
          Your Personal AI Trading Team
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {capabilities.map((capability, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px 20px',
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(180,200,255,0.08)',
                borderRadius: 12,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: CYAN,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px',
                  color: '#fff',
                }}
              >
                {capability}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
