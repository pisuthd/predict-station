'use client'

import { CYAN, monoFont } from '../../../theme'

interface AppHeaderProps {
  agentCount?: number
}

export default function AppHeader({ agentCount = 0 }: AppHeaderProps) {
  return (
    <header
      style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgba(180,200,255,0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(0,0,0,0.3)',
      }}
    >
      <p
        style={{
          fontFamily: monoFont,
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: '0.06em',
          color: CYAN,
          margin: 0,
        }}
      >
        <span style={{ color: '#fff' }}>Predict</span> Station
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span
          style={{
            fontFamily: monoFont,
            fontSize: 11,
            color: 'rgba(180,200,255,0.5)',
          }}
        >
          {agentCount} Agent{agentCount !== 1 ? 's' : ''}
        </span>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: CYAN,
          }}
        />
      </div>
    </header>
  )
}