'use client'

const CYAN = '#3EC4C0'
const MUTED = 'rgba(180,200,255,0.6)'
const WHITE = '#ffffff'

export function MyPositions() {
  return (
    <div style={{
      padding: 16,
    }}>
      {/* Header */}
      <div style={{
        fontSize: 12,
        fontWeight: 600,
        color: WHITE,
        marginBottom: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <span style={{ color: CYAN }}>◆</span>
        MY POSITIONS
      </div>

      {/* Placeholder Content */}
      <div style={{
        padding: 20,
        textAlign: 'center',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: 8,
      }}>
        <div style={{
          width: 40,
          height: 40,
          margin: '0 auto 12px',
          borderRadius: '50%',
          background: 'rgba(62,196,192,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 5L5 19M5 5l14 14"
              stroke={MUTED}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div style={{ fontSize: 13, color: MUTED, marginBottom: 4 }}>
          No positions in this market
        </div>
        <div style={{ fontSize: 11, color: 'rgba(180,200,255,0.4)' }}>
          Connect wallet to view positions
        </div>
      </div>

      {/* Decorative chart placeholder */}
      <div style={{
        marginTop: 16,
        height: 60,
        background: 'linear-gradient(90deg, rgba(62,196,192,0.05) 0%, rgba(62,196,192,0.15) 50%, rgba(62,196,192,0.05) 100%)',
        borderRadius: 6,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        padding: '0 8px 8px',
        gap: 4,
      }}>
        {[30, 45, 35, 55, 40, 50, 35, 45, 55, 40].map((h, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${h}%`,
              background: 'rgba(62,196,192,0.3)',
              borderRadius: 2,
            }}
          />
        ))}
      </div>
    </div>
  )
}
