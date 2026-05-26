import { CYAN } from '../../theme'

const products = [
  {
    name: 'Spot',
    tagline: "Sui's canonical onchain order book",
    desc: 'Real order-book depth, not synthetic pricing.',
  },
  {
    name: 'Margin',
    tagline: 'Leveraged trading',
    desc: 'Trade with leverage using shared collateral.',
  },
  {
    name: 'Predict',
    tagline: 'Prediction markets',
    desc: 'Forecast outcomes with deep liquidity settlement.',
  },
]

export default function ProductsOverview() {
  return (
    <div
      style={{
        padding: '80px 56px',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', marginBottom: '48px' }}>
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
          Products
        </p>
        <h2
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '24px',
            fontWeight: 400,
            color: '#fff',
            lineHeight: 1.2,
          }}
        >
          Three primitives.
          <br />
          <strong style={{ fontWeight: 600, color: CYAN }}>Infinite combinations.</strong>
        </h2>
      </div>

      {/* Product Cards */}
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px',
        }}
      >
        {products.map((product) => (
          <div
            key={product.name}
            style={{
              padding: '32px',
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(180,200,255,0.12)',
              borderRadius: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '24px',
                fontWeight: 700,
                color: CYAN,
                letterSpacing: '0.02em',
              }}
            >
              {product.name}
            </span>
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px',
                fontWeight: 600,
                color: '#fff',
              }}
            >
              {product.tagline}
            </span>
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                color: 'rgba(180,200,255,0.6)',
                lineHeight: 1.5,
              }}
            >
              {product.desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
