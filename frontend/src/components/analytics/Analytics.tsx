'use client'

import { BarChart3 } from 'lucide-react'
import { CYAN, NAVY, MUTED, monoFont, sansFont } from '../../theme'

export default function Analytics() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: NAVY, 
      padding: '32px 48px 32px 224px' 
    }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontFamily: sansFont,
          fontSize: 28,
          fontWeight: 300,
          color: '#fff',
          margin: 0,
        }}>
          <strong style={{ fontWeight: 500 }}>Analytics</strong>
        </h1>
      </div>

      {/* Placeholder */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(180,200,255,0.08)',
        borderRadius: 12,
        padding: 48,
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
          <BarChart3 size={16} color={MUTED} />
          <p style={{ fontFamily: monoFont, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Analytics Dashboard
          </p>
        </div>
        <p style={{ color: MUTED, fontSize: 13 }}>
          Coming soon...
        </p>
      </div>
    </div>
  )
}