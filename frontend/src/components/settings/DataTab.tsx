'use client'

import { MUTED, monoFont, sansFont } from '../../theme'

export default function DataTab() {
  return (
    <div>
      <h3 style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 16 }}>
        Data Management
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button style={{
          padding: '12px 16px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(180,200,255,0.2)',
          borderRadius: 8,
          color: '#fff',
          fontFamily: monoFont,
          fontSize: 12,
          cursor: 'pointer',
          textAlign: 'left',
        }}>
          📤 Export Data
        </button>
        <button style={{
          padding: '12px 16px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(180,200,255,0.2)',
          borderRadius: 8,
          color: '#fff',
          fontFamily: monoFont,
          fontSize: 12,
          cursor: 'pointer',
          textAlign: 'left',
        }}>
          📥 Import Data
        </button>
        <button style={{
          padding: '12px 16px',
          background: 'rgba(255,100,100,0.1)',
          border: '1px solid rgba(255,100,100,0.3)',
          borderRadius: 8,
          color: 'rgba(255,100,100,0.9)',
          fontFamily: monoFont,
          fontSize: 12,
          cursor: 'pointer',
          textAlign: 'left',
        }}>
          🗑️ Clear All Data
        </button>
      </div>
    </div>
  )
}