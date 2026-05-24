'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CYAN, NAVY, MUTED, monoFont, sansFont } from '../../theme'
import { useApp } from '../../context/AppProvider'
import { api } from '../../lib/api'

export default function AgentSelector() {
  const router = useRouter()
  const { step, agents, refreshAgents, setSelectedAgent } = useApp()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newAgentName, setNewAgentName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (step === 'connected') {
      refreshAgents()
    }
  }, [step, refreshAgents])

  const handleCreateAgent = async () => {
    if (!newAgentName.trim()) return
    setIsCreating(true)
    try {
      const newAgent = await api.agents.create(newAgentName.trim())
      setNewAgentName('')
      setShowCreateModal(false)
      refreshAgents()
      // Navigate to the new agent page
      setSelectedAgent(newAgent.slug)
      router.push(`/app/agents/${newAgent.slug}`)
    } catch (err) {
      console.error('Failed to create agent:', err)
    } finally {
      setIsCreating(false)
    }
  }

  const handleSelectAgent = (agentSlug: string) => {
    setSelectedAgent(agentSlug)
    router.push(`/app/agents/${agentSlug}`)
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: NAVY, 
      padding: '32px 48px 32px 224px',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center'
    }}>
      <div style={{ width: '100%', maxWidth: 600 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontFamily: sansFont,
            fontSize: 28,
            fontWeight: 300,
            color: '#fff',
            margin: 0,
            marginBottom: 8,
          }}>
            <strong style={{ fontWeight: 500 }}>Agents</strong>
          </h1>
          <p style={{ fontFamily: monoFont, fontSize: 11, color: CYAN }}>
            {agents.length} agent{agents.length !== 1 ? 's' : ''} in system
          </p>
        </div>

        {/* Agent Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {agents.length === 0 && (
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 16, fontFamily: sansFont, textAlign: 'center' }}>
              No agents yet — create one to get started.
            </p>
          )}

          {agents.map((agent, index) => (
            <button
              key={agent.slug}
              onClick={() => handleSelectAgent(agent.slug)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '16px 20px',
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(180,200,255,0.12)',
                borderRadius: 12,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'transform 0.2s, border-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(62,196,192,0.4)'
                e.currentTarget.style.transform = 'translateX(4px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(180,200,255,0.12)'
                e.currentTarget.style.transform = 'translateX(0)'
              }}
            >
              <div style={{
                width: 40, height: 40,
                background: 'rgba(26,26,232,0.6)',
                border: '1px solid rgba(62,196,192,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: monoFont, fontWeight: 700, fontSize: 14, color: CYAN,
                flexShrink: 0,
                borderRadius: 8,
              }}>
                {String(index + 1).padStart(2, '0')}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ display: 'block', fontFamily: sansFont, fontSize: 15, fontWeight: 500, color: '#fff' }}>
                  {agent.name}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                  <span style={{ fontFamily: monoFont, fontSize: 10, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    idle
                  </span>
                  {agent.slug === 'main' && (
                    <span style={{ fontSize: 9, color: CYAN, background: 'rgba(62,196,192,0.15)', padding: '2px 6px', borderRadius: 4 }}>
                      default
                    </span>
                  )}
                </div>
              </div>
              <span style={{ color: CYAN, fontSize: 20, opacity: 0.7 }}>›</span>
            </button>
          ))}

          {/* Create new agent button */}
          {step === 'connected' && (
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '16px 20px',
                background: 'transparent',
                border: '1px dashed rgba(62,196,192,0.4)',
                borderRadius: 12,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                marginTop: 4,
              }}
            >
              <div style={{
                width: 40, height: 40,
                background: 'rgba(62,196,192,0.15)',
                border: '1px solid rgba(62,196,192,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: monoFont, fontWeight: 700, fontSize: 18, color: CYAN,
                flexShrink: 0,
                borderRadius: 8,
              }}>
                +
              </div>
              <span style={{ fontFamily: monoFont, fontSize: 12, letterSpacing: '0.1em', color: CYAN, textTransform: 'uppercase' }}>
                Create new agent
              </span>
            </button>
          )}
        </div>

        {/* Continue button */}
        {agents.length > 0 && (
          <button
            onClick={() => {
              const defaultAgent = agents.find(a => a.slug === 'main') || agents[0]
              handleSelectAgent(defaultAgent.slug)
            }}
            style={{
              width: '100%',
              padding: '14px 0',
              background: CYAN,
              border: 'none',
              borderRadius: 8,
              color: NAVY,
              fontFamily: monoFont,
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: '0.1em',
              cursor: 'pointer',
            }}
          >
            CONTINUE WITH {agents.find(a => a.slug === 'main')?.name.toUpperCase() || 'DEFAULT'}
          </button>
        )}
      </div>

      {/* Create Agent Modal */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(3,6,58,0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 24,
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              background: NAVY,
              border: '1px solid rgba(180,200,255,0.15)',
              borderRadius: 16,
              padding: 32,
              width: '100%',
              maxWidth: 400,
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontFamily: sansFont, fontSize: 18, fontWeight: 500, color: '#fff', marginBottom: 8 }}>
              Create New Agent
            </h3>
            <p style={{ fontFamily: monoFont, fontSize: 11, color: MUTED, marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              New Agent
            </p>

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
                value={newAgentName}
                onChange={e => setNewAgentName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && newAgentName.trim() && handleCreateAgent()}
                placeholder="Enter agent name"
                autoFocus
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(180,200,255,0.2)',
                  borderRadius: 8,
                  fontFamily: sansFont,
                  fontSize: 14,
                  color: '#fff',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setNewAgentName('')
                }}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(180,200,255,0.2)',
                  borderRadius: 8,
                  fontFamily: monoFont,
                  fontSize: 11,
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => newAgentName.trim() && handleCreateAgent()}
                disabled={!newAgentName.trim() || isCreating}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  background: CYAN,
                  border: 'none',
                  borderRadius: 8,
                  color: NAVY,
                  fontFamily: monoFont,
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: '0.06em',
                  cursor: newAgentName.trim() && !isCreating ? 'pointer' : 'not-allowed',
                  opacity: newAgentName.trim() && !isCreating ? 1 : 0.5,
                  transition: 'opacity 0.2s',
                }}
              >
                {isCreating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}