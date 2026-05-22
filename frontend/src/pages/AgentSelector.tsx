'use client'

import { useState } from 'react'
import { CYAN, NAVY, MUTED, monoFont, sansFont } from '../theme'
import OrbCanvas from '../components/OrbCanvas'
import Wordmark from '../components/Wordmark'
import StatusDot from '../components/StatusDot'

interface Agent {
  id: string
  name: string
  status: 'idle' | 'active' | 'error'
  createdAt: string
}

interface AgentSelectorProps {
  agents: Agent[]
  onSelect: (agent: Agent) => void
  onCreateAgent: (agentData: { name: string }) => void
  onContinue: () => void
}

function CreateAgentForm({
  onComplete,
  onBack,
}: {
  onComplete: (agentData: { name: string }) => void
  onBack: () => void
}) {
  const [name, setName] = useState('')

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <button
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          fontFamily: monoFont,
          fontSize: 12,
          color: MUTED,
          letterSpacing: '0.06em',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        ← back
      </button>

      <p style={{ fontFamily: monoFont, fontSize: 11, letterSpacing: '0.14em', color: MUTED, textTransform: 'uppercase', marginBottom: 8 }}>
        New Agent
      </p>

      <h2 style={{ fontFamily: sansFont, fontSize: 20, fontWeight: 300, color: '#fff', marginBottom: 28, lineHeight: 1.3 }}>
        Create a new<br /><strong style={{ fontWeight: 500 }}>AI Agent</strong>
      </h2>

      <div style={{ marginBottom: 24 }}>
        <label style={{
          display: 'block',
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.12em',
          textTransform: 'uppercase' as const,
          color: MUTED,
          marginBottom: 8,
          fontFamily: monoFont,
        }}>
          Agent Name
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && name.trim() && onComplete({ name: name.trim() })}
          placeholder="Enter agent name"
          autoFocus
          style={{
            width: '100%',
            padding: '11px 14px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(180,200,255,0.2)',
            borderRadius: 6,
            fontFamily: sansFont,
            fontSize: 14,
            color: '#fff',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <button
        onClick={() => name.trim() && onComplete({ name: name.trim() })}
        disabled={!name.trim()}
        style={{
          width: '100%',
          padding: '13px 0',
          background: CYAN,
          border: 'none',
          borderRadius: 6,
          color: NAVY,
          fontFamily: monoFont,
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: '0.1em',
          cursor: name.trim() ? 'pointer' : 'not-allowed',
          opacity: name.trim() ? 1 : 0.35,
          transition: 'opacity 0.2s',
        }}
      >
        CREATE AGENT
      </button>
    </div>
  )
}

export default function AgentSelector({ agents, onSelect, onCreateAgent, onContinue }: AgentSelectorProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)

  const handleCreateComplete = (agentData: { name: string }) => {
    onCreateAgent(agentData)
    setShowCreateForm(false)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: NAVY,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 56,
        paddingBottom: 52,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: sansFont,
      }}
    > 

      

      {/* Card */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(180,200,255,0.12)',
          borderRadius: 2,
          width: '100%',
          maxWidth: 420,
          overflow: 'hidden',
        }}
      >
        {/* Cyan top bar */}
        <div style={{ height: 3, background: CYAN, borderRadius: '2px 2px 0 0' }} />

        <div style={{ padding: '28px 32px 32px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
            <Wordmark />
            <span style={{ fontFamily: monoFont, fontSize: 10, letterSpacing: '0.14em', color: MUTED, textTransform: 'uppercase' }}>
              Private & On-Device AI
            </span>
          </div>

          {!showCreateForm ? (
            <>
              <p style={{ fontFamily: monoFont, fontSize: 11, letterSpacing: '0.14em', color: MUTED, textTransform: 'uppercase', marginBottom: 8 }}>
                Agents
              </p>

              <h1 style={{ fontFamily: sansFont, fontSize: 24, fontWeight: 300, color: '#fff', marginBottom: 8, lineHeight: 1.2 }}>
                <strong style={{ fontWeight: 500 }}>Select</strong> an agent<br />to continue
              </h1>

              <p style={{ fontFamily: monoFont, fontSize: 11, color: CYAN, marginBottom: 24 }}>
                {agents.length} agent{agents.length !== 1 ? 's' : ''} in system
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {agents.length === 0 && (
                  <p style={{ fontSize: 13, color: MUTED, marginBottom: 8, fontFamily: sansFont }}>
                    No agents yet — create one to get started.
                  </p>
                )}

                {agents.map((agent, index) => (
                  <button
                    key={agent.id}
                    onClick={() => onSelect(agent)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '12px 14px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(180,200,255,0.12)',
                      borderRadius: 6,
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      transition: 'transform 0.2s',
                    }}
                  >
                    <div style={{
                      width: 34, height: 34,
                      background: 'rgba(26,26,232,0.6)',
                      border: '1px solid rgba(62,196,192,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: monoFont, fontWeight: 700, fontSize: 12, color: CYAN,
                      flexShrink: 0,
                    }}>
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ display: 'block', fontFamily: sansFont, fontSize: 14, fontWeight: 500, color: '#fff' }}>
                        {agent.name}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                        <StatusDot status={agent.status} />
                        <span style={{ fontFamily: monoFont, fontSize: 10, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          {agent.status}
                        </span>
                      </div>
                    </div>
                    <span style={{ color: CYAN, fontSize: 18, opacity: 0.7 }}>›</span>
                  </button>
                ))}

                {/* Create new */}
                <button
                  onClick={() => setShowCreateForm(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '12px 14px',
                    background: 'transparent',
                    border: `1px dashed rgba(62,196,192,0.4)`,
                    borderRadius: 6,
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    marginTop: 4,
                  }}
                >
                  <div style={{
                    width: 34, height: 34,
                    background: 'rgba(62,196,192,0.15)',
                    border: '1px solid rgba(62,196,192,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: monoFont, fontWeight: 700, fontSize: 18, color: CYAN,
                    flexShrink: 0,
                  }}>
                    +
                  </div>
                  <span style={{ fontFamily: monoFont, fontSize: 12, letterSpacing: '0.1em', color: CYAN, textTransform: 'uppercase' }}>
                    Create new agent
                  </span>
                </button>
              </div>

              {/* Continue */}
              <button
                onClick={onContinue}
                style={{
                  width: '100%',
                  padding: '13px 0',
                  background: CYAN,
                  border: 'none',
                  borderRadius: 6,
                  color: NAVY,
                  fontFamily: monoFont,
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                }}
              >
                CONTINUE
              </button>
            </>
          ) : (
            <CreateAgentForm
              onComplete={handleCreateComplete}
              onBack={() => setShowCreateForm(false)}
            />
          )}
        </div>
      </div>
    </div>
  )
}