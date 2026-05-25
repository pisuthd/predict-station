import { NAVY, MUTED, monoFont, sansFont } from '../theme'

interface PlaceholderPageProps {
  title: string
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div
      style={{
        background: NAVY,
        fontFamily: sansFont,
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      {/* Main Title */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ 
          fontFamily: monoFont, 
          fontSize: 11, 
          letterSpacing: '0.14em', 
          color: MUTED, 
          textTransform: 'uppercase', 
          marginBottom: 8 
        }}>
          {title}
        </p>
        <h1 style={{ 
          fontFamily: sansFont, 
          fontSize: 28, 
          fontWeight: 300, 
          color: '#fff', 
          margin: 0, 
          lineHeight: 1.2 
        }}>
          <strong style={{ fontWeight: 500 }}>{title}</strong>
        </h1>
      </div>

      {/* Placeholder Content */}
      <div
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(180,200,255,0.12)',
          borderRadius: 12,
          padding: 48,
          textAlign: 'center',
        }}
      >
        <p style={{ fontFamily: monoFont, fontSize: 12, color: MUTED, letterSpacing: '0.08em' }}>
          {title} page coming soon...
        </p>
      </div>
    </div>
  )
}