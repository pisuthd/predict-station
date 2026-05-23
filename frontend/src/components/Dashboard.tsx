'use client'

import { CYAN, monoFont, sansFont } from '../theme'

interface Agent {
  id: string
  name: string
  status: 'idle' | 'active' | 'error'
  createdAt: string
}

interface DashboardProps {
  agents: Agent[]
  selectedAgent?: Agent | null
}

const stats = [
  { label: 'Active Agents', value: '0', color: CYAN },
  { label: 'Markets', value: '3', color: '#fff' },
  { label: 'Predictions', value: '12', color: '#fff' },
  { label: 'Win Rate', value: '68%', color: '#22c55e' },
]

export default function Dashboard({ agents, selectedAgent }: DashboardProps) {
  return (
    <div style={{ padding: '24px', flex: 1 }}>
      <h1
        style={{
          fontFamily: sansFont,
          fontSize: '24px',
          fontWeight: 600,
          color: '#fff',
          marginBottom: '8px',
        }}
      >
        Dashboard
      </h1>
      <p
        style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '14px',
          color: 'rgba(180,200,255,0.5)',
          marginBottom: '32px',
        }}
      >
        Welcome to Predict Station. Create your first agent to get started.
      </p>

      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        {stats.map((stat, index) => (
          <div
            key={index}
            style={{
              padding: '20px',
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(180,200,255,0.12)',
              borderRadius: 12,
            }}
          >
            <p
              style={{
                fontFamily: monoFont,
                fontSize: '11px',
                color: 'rgba(180,200,255,0.5)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              {stat.label}
            </p>
            <p
              style={{
                fontFamily: monoFont,
                fontSize: '28px',
                fontWeight: 700,
                color: stat.color,
              }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div
        style={{
          padding: '24px',
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(180,200,255,0.12)',
          borderRadius: 12,
        }}
      >
        <h2
          style={{
            fontFamily: sansFont,
            fontSize: '16px',
            fontWeight: 600,
            color: '#fff',
            marginBottom: '16px',
          }}
        >
          Quick Actions
        </h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            style={{
              padding: '12px 20px',
              background: CYAN,
              border: 'none',
              borderRadius: 8,
              fontFamily: monoFont,
              fontSize: 11,
              fontWeight: 700,
              color: '#000',
              cursor: 'pointer',
            }}
          >
            + Create Agent
          </button>
          <button
            style={{
              padding: '12px 20px',
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(180,200,255,0.12)',
              borderRadius: 8,
              fontFamily: monoFont,
              fontSize: 11,
              fontWeight: 700,
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Connect Market
          </button>
        </div>
      </div>
    </div>
  )
}