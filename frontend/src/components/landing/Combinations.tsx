import { CYAN } from '../../theme'

const combinations = [
  {
    title: 'Spot + Margin',
    subtitle: 'Leveraged Trading',
    description:
      'A perps-style exchange with real order-book depth and shared collateral, without building a matching engine.',
  },
  {
    title: 'Spot + Predict',
    subtitle: 'Prediction Markets',
    description:
      'A predictions platform where every market settles instantly against the deepest liquidity on Sui.',
  },
  {
    title: 'Margin + Predict',
    subtitle: 'Structured Products',
    description:
      'Leveraged binary positions, hedged yield strategies, or structured vaults, all from two primitives.',
  },
  {
    title: 'Spot + Margin + Predict',
    subtitle: 'Full-Stack Finance',
    description:
      'A complete trading platform with spot, leverage, and derivatives in a single composable transaction.',
  },
]

export default function Combinations() {
  return (
    <div
      style={{
        padding: '80px 56px',
        position: 'relative',
        zIndex: 10,
        background: 'rgba(0,0,0,0.15)',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h2
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '32px',
            fontWeight: 300,
            color: '#fff',
            marginBottom: '16px',
            lineHeight: 1.2,
          }}
        >
          This is where it gets{' '}
          <strong style={{ fontWeight: 500, color: CYAN }}>interesting.</strong>
        </h2>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '16px',
            color: 'rgba(180,200,255,0.6)',
            marginBottom: '48px',
            lineHeight: 1.6,
          }}
        >
          Combine primitives into financial products that don't exist anywhere else.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '24px',
          }}
        >
          {combinations.map((combo, index) => (
            <div
              key={index}
              style={{
                padding: '32px',
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(180,200,255,0.08)',
                borderRadius: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {combo.title.split(' + ').map((product, i) => (
                  <span key={i}>
                    <span
                      style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '14px',
                        fontWeight: 700,
                        color: CYAN,
                        background: 'rgba(62,196,192,0.1)',
                        padding: '4px 10px',
                        borderRadius: 6,
                      }}
                    >
                      {product}
                    </span>
                    {i < combo.title.split(' + ').length - 1 && (
                      <span
                        style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: '14px',
                          color: 'rgba(180,200,255,0.4)',
                          marginLeft: '12px',
                        }}
                      >
                        +
                      </span>
                    )}
                  </span>
                ))}
              </div>
              <h3
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#fff',
                }}
              >
                {combo.subtitle}
              </h3>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px',
                  color: 'rgba(180,200,255,0.6)',
                  lineHeight: 1.6,
                }}
              >
                {combo.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
