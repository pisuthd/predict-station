import { CYAN } from '../../theme'

const features = [
  {
    name: 'Local AI Agents',
    desc: 'Run unlimited Qwen-based agents directly on your computer. No usage fees.',
  },
  {
    name: 'DeepBook Integration',
    desc: 'Full support for Spot, Margin, and Predict markets in one interface.',
  },
  {
    name: 'Privacy First',
    desc: 'All analysis, decision-making, and data stays on your device.',
  },
  {
    name: 'Smart Execution',
    desc: 'Agents can monitor markets, generate strategies, and suggest or auto-execute trades (with your approval).',
  },
  {
    name: 'Unified Dashboard',
    desc: 'View your entire DeepBook portfolio — Spot balances, Margin positions, and Predict exposures together.',
  },
  {
    name: 'Cron & Scheduling',
    desc: 'Set agents to run 24/7 on scheduled tasks (e.g. pre-expiry analysis, daily reports).',
  },
]

export default function KeyFeatures() {
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
          Features
        </p>
        <h2
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '32px',
            fontWeight: 400,
            color: '#fff',
            lineHeight: 1.2,
            marginBottom: '48px',
          }}
        >
          Why Traders Choose <strong style={{ fontWeight: 600, color: CYAN }}>LocalBook</strong>
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
          }}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              style={{
                padding: '24px',
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(180,200,255,0.08)',
                borderRadius: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '14px',
                  fontWeight: 700,
                  color: CYAN,
                  letterSpacing: '0.02em',
                }}
              >
                {feature.name}
              </span>
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '13px',
                  color: 'rgba(180,200,255,0.6)',
                  lineHeight: 1.5,
                }}
              >
                {feature.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
