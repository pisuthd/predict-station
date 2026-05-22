'use client'

import { useState } from 'react'
import { CYAN, NAVY, MUTED, monoFont, sansFont } from '../theme'
import StatusDot from '../components/StatusDot'

interface Agent {
  id: string
  name: string
  status: 'idle' | 'active' | 'error'
  createdAt: string
}

interface MainScreenProps {
  agents: Agent[]
  selectedAgent: Agent | null
}

type Network = 'testnet' | 'mainnet'

export default function MainScreen({ agents, selectedAgent }: MainScreenProps) {
  const [network, setNetwork] = useState<Network>('testnet')

  return (
    <div
      style={{
        minHeight: '100vh',
        background: NAVY,
        fontFamily: sansFont,
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 12,
          marginBottom: 32,
        }}
      >
        {/* Left: Network Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: monoFont, fontSize: 11, color: MUTED, letterSpacing: '0.08em' }}>
            NETWORK
          </span>
          <div
            style={{
              position: 'relative',
            }}
          >
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value as Network)}
              style={{
                appearance: 'none',
                padding: '10px 40px 10px 16px',
                background: network === 'testnet' 
                  ? 'rgba(62,196,192,0.15)' 
                  : 'rgba(255,255,255,0.05)',
                border: `1px solid ${network === 'testnet' ? 'rgba(62,196,192,0.4)' : 'rgba(180,200,255,0.12)'}`,
                borderRadius: 8,
                fontFamily: monoFont,
                fontSize: 12,
                fontWeight: 700,
                color: network === 'testnet' ? CYAN : MUTED,
                cursor: network === 'testnet' ? 'pointer' : 'not-allowed',
                opacity: network === 'testnet' ? 1 : 0.5,
              }}
            >
              <option value="testnet">TESTNET</option>
              <option value="mainnet" disabled>MAINNET</option>
            </select>
            <span
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: network === 'testnet' ? CYAN : MUTED,
                fontSize: 10,
              }}
            >
              ▾
            </span>
          </div>
        </div>

        {/* Right: Connect Wallet */}
        <button
          style={{
            padding: '10px 20px',
            background: 'rgba(62,196,192,0.15)',
            border: '1px solid rgba(62,196,192,0.4)',
            borderRadius: 8,
            fontFamily: monoFont,
            fontSize: 12,
            fontWeight: 700,
            color: CYAN,
            cursor: 'pointer',
            letterSpacing: '0.08em',
          }}
        >
          CONNECT WALLET
        </button>
      </div>

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
          Dashboard
        </p>
        <h1 style={{ 
          fontFamily: sansFont, 
          fontSize: 28, 
          fontWeight: 300, 
          color: '#fff', 
          margin: 0, 
          lineHeight: 1.2 
        }}>
          <strong style={{ fontWeight: 500 }}>Mission</strong> Control
        </h1>
      </div>

      {/* Floating Cards Container */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 20,
        }}
      >
        {/* Active Agent Card */}
        {selectedAgent && (
          <div
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(180,200,255,0.12)',
              borderRadius: 12,
              padding: 24,
            }}
          >
            <p style={{ fontFamily: monoFont, fontSize: 10, letterSpacing: '0.14em', color: MUTED, textTransform: 'uppercase', marginBottom: 16 }}>
              Active Agent
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48, height: 48,
                background: 'rgba(26,26,232,0.4)',
                border: '1px solid rgba(62,196,192,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: monoFont, fontWeight: 700, fontSize: 14, color: CYAN,
                borderRadius: 8,
              }}>
                {selectedAgent.name.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ display: 'block', fontFamily: sansFont, fontSize: 16, fontWeight: 500, color: '#fff' }}>
                  {selectedAgent.name}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <StatusDot status={selectedAgent.status} />
                  <span style={{ fontFamily: monoFont, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {selectedAgent.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(180,200,255,0.12)',
            borderRadius: 12,
            padding: 24,
          }}
        >
          <p style={{ fontFamily: monoFont, fontSize: 10, letterSpacing: '0.14em', color: MUTED, textTransform: 'uppercase', marginBottom: 8 }}>
            Total Agents
          </p>
          <p style={{ fontFamily: monoFont, fontSize: 48, fontWeight: 700, color: CYAN, margin: 0 }}>
            {agents.length}
          </p>
        </div>

        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(180,200,255,0.12)',
            borderRadius: 12,
            padding: 24,
          }}
        >
          <p style={{ fontFamily: monoFont, fontSize: 10, letterSpacing: '0.14em', color: MUTED, textTransform: 'uppercase', marginBottom: 8 }}>
            Active
          </p>
          <p style={{ fontFamily: monoFont, fontSize: 48, fontWeight: 700, color: CYAN, margin: 0 }}>
            {agents.filter(a => a.status === 'active').length}
          </p>
        </div>

        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(180,200,255,0.12)',
            borderRadius: 12,
            padding: 24,
          }}
        >
          <p style={{ fontFamily: monoFont, fontSize: 10, letterSpacing: '0.14em', color: MUTED, textTransform: 'uppercase', marginBottom: 8 }}>
            Markets
          </p>
          <p style={{ fontFamily: monoFont, fontSize: 48, fontWeight: 700, color: MUTED, margin: 0 }}>
            0
          </p>
        </div>
      </div>

      {/* All Agents List */}
      <div style={{ marginTop: 32 }}>
        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(180,200,255,0.12)',
            borderRadius: 12,
            padding: 24,
          }}
        >
          <p style={{ fontFamily: monoFont, fontSize: 11, letterSpacing: '0.14em', color: MUTED, textTransform: 'uppercase', marginBottom: 20 }}>
            All Agents
          </p>
          
          {agents.length === 0 ? (
            <p style={{ fontFamily: sansFont, fontSize: 14, color: MUTED, textAlign: 'center', padding: '20px 0' }}>
              No agents yet — create one to get started.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {agents.map((agent) => (
                <div key={agent.id} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(180,200,255,0.08)',
                  borderRadius: 8,
                  padding: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}>
                  <div style={{
                    width: 40, height: 40,
                    background: 'rgba(26,26,232,0.4)',
                    border: '1px solid rgba(62,196,192,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: monoFont, fontWeight: 700, fontSize: 12, color: CYAN,
                    borderRadius: 6,
                  }}>
                    {agent.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 500, color: '#fff' }}>{agent.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StatusDot status={agent.status} />
                    <span style={{ fontFamily: monoFont, fontSize: 10, letterSpacing: '0.08em', color: MUTED, textTransform: 'uppercase' }}>
                      {agent.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}