'use client'

import { useState, useEffect } from 'react'
import { CYAN, NAVY, MUTED, monoFont, sansFont } from '../../theme'
import { useApp } from '../../context/AppProvider'
import { api } from '../../lib/api'

export default function AgentsPage() {
  const { step, agents, selectedAgent, setSelectedAgent, refreshAgents, sessions, refreshSessions } = useApp()
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions'>('overview')
  const [showCreateAgent, setShowCreateAgent] = useState(false)
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
      await api.agents.create(newAgentName.trim())
      setNewAgentName('')
      setShowCreateAgent(false)
      refreshAgents()
    } catch (err) {
      console.error('Failed to create agent:', err)
    } finally {
      setIsCreating(false)
    }
  }

  const handleCreateSession = async () => {
    if (!selectedAgent) return
    try {
      await api.agents.createSession(selectedAgent, 'main')
      refreshSessions(selectedAgent)
    } catch (err) {
      console.error('Failed to create session:', err)
    }
  }

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
          <strong style={{ fontWeight: 500 }}>Agents</strong>
        </h1>
      </div>

      {/* Agent Selector + Create */}
      <div style={{ 
        display: 'flex', 
        gap: 12, 
        marginBottom: 20 
      }}>
        <select
          value={selectedAgent}
          onChange={e => setSelectedAgent(e.target.value)}
          style={{
            flex: 1,
            maxWidth: 300,
            padding: '10px 12px',
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(180,200,255,0.2)',
            borderRadius: 6,
            fontFamily: monoFont,
            fontSize: 12,
            color: '#fff',
            outline: 'none',
          }}
        >
          {agents.map(agent => (
            <option key={agent.slug} value={agent.slug}>
              {agent.name} {agent.slug === 'main' ? '(default)' : ''}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowCreateAgent(true)}
          disabled={step !== 'connected'}
          style={{
            padding: '10px 16px',
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(180,200,255,0.2)',
            borderRadius: 6,
            fontFamily: monoFont,
            fontSize: 10,
            fontWeight: 600,
            color: '#fff',
            cursor: step !== 'connected' ? 'not-allowed' : 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            opacity: step !== 'connected' ? 0.5 : 1,
          }}
        >
          + New Agent
        </button>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: 0, 
        borderBottom: '1px solid rgba(180,200,255,0.12)',
        marginBottom: 20 
      }}>
        {(['overview', 'sessions'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? `2px solid ${CYAN}` : '2px solid transparent',
              fontFamily: monoFont,
              fontSize: 11,
              color: activeTab === tab ? CYAN : MUTED,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' ? (
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(180,200,255,0.08)',
          borderRadius: 12,
          padding: 48,
          textAlign: 'center',
        }}>
          <p style={{ fontFamily: monoFont, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Agent Overview
          </p>
          <p style={{ color: MUTED, fontSize: 13, marginTop: 8 }}>
            Agent details and configuration coming soon.
          </p>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button
              onClick={handleCreateSession}
              disabled={step !== 'connected'}
              style={{
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(180,200,255,0.2)',
                borderRadius: 6,
                fontFamily: monoFont,
                fontSize: 10,
                color: '#fff',
                cursor: step !== 'connected' ? 'not-allowed' : 'pointer',
                textTransform: 'uppercase',
                opacity: step !== 'connected' ? 0.5 : 1,
              }}
            >
              + New Session
            </button>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(180,200,255,0.08)',
            borderRadius: 12,
            padding: 24,
          }}>
            <p style={{ fontFamily: monoFont, fontSize: 11, color: MUTED, textTransform: 'uppercase' }}>
              Sessions ({sessions.length})
            </p>
            {sessions.map(session => (
              <div
                key={session.slug}
                style={{
                  padding: '12px 0',
                  borderBottom: '1px solid rgba(180,200,255,0.08)',
                }}
              >
                <span style={{ fontFamily: monoFont, fontSize: 12, color: '#fff' }}>
                  {session.name}
                </span>
                {session.slug === 'main' && (
                  <span style={{ 
                    marginLeft: 8, 
                    fontFamily: monoFont, 
                    fontSize: 9, 
                    color: CYAN,
                    padding: '2px 6px',
                    background: 'rgba(62,196,192,0.15)',
                    borderRadius: 4,
                  }}>
                    default
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Agent Modal */}
      {showCreateAgent && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowCreateAgent(false)}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(180,200,255,0.12)',
              borderRadius: 16,
              padding: 32,
              width: 400,
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontFamily: monoFont, fontSize: 14, color: '#fff', marginBottom: 20 }}>
              Create New Agent
            </h3>
            <input
              type="text"
              value={newAgentName}
              onChange={e => setNewAgentName(e.target.value)}
              placeholder="Agent name"
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(180,200,255,0.2)',
                borderRadius: 6,
                fontFamily: sansFont,
                fontSize: 14,
                color: '#fff',
                outline: 'none',
                marginBottom: 16,
              }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowCreateAgent(false)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(180,200,255,0.2)',
                  borderRadius: 6,
                  fontFamily: monoFont,
                  fontSize: 11,
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAgent}
                disabled={isCreating || !newAgentName.trim()}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  background: CYAN,
                  border: 'none',
                  borderRadius: 6,
                  fontFamily: monoFont,
                  fontSize: 11,
                  fontWeight: 700,
                  color: NAVY,
                  cursor: isCreating || !newAgentName.trim() ? 'not-allowed' : 'pointer',
                  opacity: isCreating || !newAgentName.trim() ? 0.5 : 1,
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