import { CYAN } from '../../theme'

const benefits = [
  {
    number: '01',
    title: 'Shared Revenue',
    description: 'Every trade through your integration generates revenue. From day one.',
  },
  {
    number: '02',
    title: 'Deep Liquidity',
    description: "Tap into Sui's deepest order book the moment you integrate. No bootstrapping.",
  },
  {
    number: '03',
    title: 'Native Composability',
    description: 'Combine primitives in a single transaction. One call, multiple capabilities.',
  },
  {
    number: '04',
    title: 'Lightning Settlement',
    description: '~390ms settlement finality. Transactions at Sui speed.',
  },
]

export default function WhyDeepBook() {
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
            marginBottom: '16px',
          }}
        >
          Why DeepBook
        </p>

        <h2
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '32px',
            fontWeight: 300,
            color: '#fff',
            marginBottom: '48px',
            lineHeight: 1.2,
          }}
        >
          Why builders choose <strong style={{ fontWeight: 500, color: CYAN }}>DeepBook</strong>
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '48px 64px',
          }}
        >
          {benefits.map((benefit, index) => (
            <div key={index}>
              <div
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '48px',
                  fontWeight: 700,
                  color: CYAN,
                  marginBottom: '16px',
                }}
              >
                {benefit.number}
              </div>
              <h3
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#fff',
                  marginBottom: '8px',
                }}
              >
                {benefit.title}
              </h3>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px',
                  color: 'rgba(180,200,255,0.6)',
                  lineHeight: 1.5,
                }}
              >
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
