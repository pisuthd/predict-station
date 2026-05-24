'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, MessageSquare, Trash2 } from 'lucide-react'
import { CYAN, NAVY, MUTED, monoFont, sansFont } from '../../theme'
import { useApp } from '../../context/AppProvider'
import { api } from '../../lib/api'
import ChatModal from '../chat/ChatModal'

type MainTab = 'overview' | 'sessions' | 'tools' | 'workspace' | 'crons'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  thinking?: string
  timestamp: Date
}

interface AgentDetailProps {
  agentSlug: string
}

export default function AgentDetail({ agentSlug }: AgentDetailProps) {
  const router = useRouter()
  const { step, agents, refreshAgents, sessions, refreshSessions } = useApp()
  const [activeTab, setActiveTab] = useState<MainTab>('overview')
  const [tools, setTools] = useState<{ name: string; enabled: boolean }[]>([])
  const [workspace, setWorkspace] = useState({ identityMd: '', coreMd: '', contextMd: '' })
  const [isCreatingSession, setIsCreatingSession] = useState(false)

  // Chat modal state
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatSession, setChatSession] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [streamingThinking, setStreamingThinking] = useState('')

  // Ref to capture messages for saving
  const chatMessagesRef = useRef<ChatMessage[]>([])
  // Get current agent from the agents list
  const currentAgent = agents.find(a => a.slug === agentSlug)

  useEffect(() => {
    if (step === 'connected') {
      refreshAgents()
      loadTools()
    }
  }, [step, refreshAgents])

  useEffect(() => {
    if (agentSlug && step === 'connected') {
      refreshSessions(agentSlug)
      loadWorkspace(agentSlug)
    }
  }, [agentSlug, step, refreshSessions])

  const loadTools = async () => {
    try {
      const toolList = await api.tools.list()
      setTools(toolList)
    } catch (err) {
      console.error('Failed to load tools:', err)
    }
  }

  const loadWorkspace = async (slug: string) => {
    // Placeholder - in real implementation would load from API
    setWorkspace({ identityMd: '', coreMd: '', contextMd: '' })
  }

  const handleToggleTool = async (toolName: string, enabled: boolean) => {
    try {
      await api.tools.toggle(toolName, enabled)
      setTools(prev => prev.map(t => t.name === toolName ? { ...t, enabled } : t))
    } catch (err) {
      console.error('Failed to toggle tool:', err)
    }
  }

  const handleCreateSession = async () => {
    if (!agentSlug) return
    setIsCreatingSession(true)
    try {
      await api.agents.createSession(agentSlug, `session-${Date.now()}`)
      refreshSessions(agentSlug)
    } catch (err) {
      console.error('Failed to create session:', err)
    } finally {
      setIsCreatingSession(false)
    }
  }

  const handleDeleteSession = async (sessionSlug: string) => {
    if (!agentSlug || sessionSlug === 'main') return
    if (!confirm('Delete this session?')) return
    try {
      await api.agents.deleteSession(agentSlug, sessionSlug)
      refreshSessions(agentSlug)
    } catch (err) {
      console.error('Failed to delete session:', err)
    }
  }

  const openChat = async (sessionSlug: string) => {
    setChatSession(sessionSlug)
    setIsChatOpen(true)
    try {
      const sessionData = await api.sessions.get(agentSlug, sessionSlug)
      const messages = (sessionData.messages || []).map((msg: any, index: number) => ({
        id: msg.id || `msg-${index}`,
        role: msg.role,
        content: msg.content,
        thinking: msg.thinking || '',
        timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
      }))
      setChatMessages(messages)
    } catch (err) {
      console.error('Failed to load messages:', err)
      setChatMessages([])
    }
  }

  const closeChat = () => {
    setIsChatOpen(false)
    setChatSession('')
    setChatMessages([])
    setChatInput('')
  }

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isGenerating) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date(),
    }

    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setIsGenerating(true)

    const assistantMessageId = (Date.now() + 1).toString()
    let currentThinking = ''

    setChatMessages(prev => [
      ...prev,
      { id: assistantMessageId, role: 'assistant', content: '', thinking: '', timestamp: new Date() },
    ])

    try {
      setStreamingThinking('')
      // Build history including the new user message
      const conversationHistory = [...chatMessages.map(m => ({ role: m.role, content: m.content })), { role: 'user' as const, content: userMessage.content }]

      await api.chat(
        userMessage.content,
        conversationHistory,
        agentSlug,
        (token: string) => {
          setChatMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessageId
                ? { ...msg, content: (msg.content + token).replace(/^\s+/, '') }
                : msg
            )
          )
        },
        (thinking: string) => {
          currentThinking += thinking
          setStreamingThinking(currentThinking)
          setChatMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessageId
                ? { ...msg, thinking: currentThinking }
                : msg
            )
          )
        }
      )
    } catch (err) {
      console.error('Chat error:', err)
      setChatMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId
            ? { ...msg, content: 'Error: Failed to get response' }
            : msg
        )
      )
    } finally {
      setIsGenerating(false)
      setStreamingThinking('')

      // Get latest messages from state to save
      try {
        // Use a ref or get current state - we need to read from the latest state
        setChatMessages(currentMessages => {
          const messagesToSave = currentMessages.map(m => ({
            id: m.id,
            role: m.role,
            content: m.content,
            thinking: m.thinking || '',
            timestamp: m.timestamp.toISOString(),
          }))
          // Save after state update
          api.sessions.saveMessages(agentSlug, chatSession, messagesToSave).catch(err => {
            console.error('Failed to save messages:', err)
          })
          return currentMessages
        })
      } catch (err) {
        console.error('Failed to save messages:', err)
      }
    }
  }

  const tabs: { id: MainTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'sessions', label: 'Sessions' },
    { id: 'tools', label: 'Tools' },
    { id: 'workspace', label: 'Workspace' },
    { id: 'crons', label: 'Crons' },
  ]

  // Show back button if agent not found
  if (!currentAgent && agents.length > 0) {
    return (
      <div style={{
        minHeight: '100vh',
        background: NAVY,
        padding: '32px 48px 32px 224px'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(180,200,255,0.08)',
          borderRadius: 12,
          padding: 48,
          textAlign: 'center',
        }}>
          <p style={{ color: MUTED, fontSize: 13, marginBottom: 16 }}>
            Agent "{agentSlug}" not found
          </p>
          <button
            onClick={() => router.push('/app/agents')}
            style={{
              padding: '10px 20px',
              background: CYAN,
              border: 'none',
              borderRadius: 6,
              fontFamily: monoFont,
              fontSize: 11,
              fontWeight: 600,
              color: NAVY,
              cursor: 'pointer',
            }}
          >
            Back to Agents
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: NAVY,
      padding: '32px 48px 32px 224px'
    }}>
      {/* Header with back button */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={() => router.push('/app/agents')}
          style={{
            padding: '8px 12px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(180,200,255,0.12)',
            borderRadius: 6,
            fontFamily: monoFont,
            fontSize: 10,
            color: CYAN,
            cursor: 'pointer',
          }}
        >
          ← Agents
        </button>
        <div>
          <h1 style={{
            fontFamily: sansFont,
            fontSize: 28,
            fontWeight: 300,
            color: '#fff',
            margin: 0,
          }}>
            <strong style={{ fontWeight: 500 }}>{currentAgent?.name || agentSlug}</strong>
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 0,
        borderBottom: '1px solid rgba(180,200,255,0.12)',
        marginBottom: 20
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? `2px solid ${CYAN}` : '2px solid transparent',
              fontFamily: monoFont,
              fontSize: 11,
              color: activeTab === tab.id ? CYAN : MUTED,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
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
            {currentAgent ? `Managing agent: ${currentAgent.name}` : 'Select an agent to view details'}
          </p>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button
              onClick={handleCreateSession}
              disabled={step !== 'connected' || isCreatingSession}
              style={{
                padding: '8px 16px',
                background: CYAN,
                border: 'none',
                borderRadius: 6,
                fontFamily: monoFont,
                fontSize: 10,
                fontWeight: 600,
                color: NAVY,
                cursor: step !== 'connected' || isCreatingSession ? 'not-allowed' : 'pointer',
                textTransform: 'uppercase',
                opacity: step !== 'connected' || isCreatingSession ? 0.5 : 1,
              }}
            >
              {isCreatingSession ? 'Creating...' : '+ New Session'}
            </button>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(180,200,255,0.08)',
            borderRadius: 12,
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 120px 120px 100px',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.03)',
              borderBottom: '1px solid rgba(180,200,255,0.08)',
            }}>
              <span style={{ fontFamily: monoFont, fontSize: 10, color: MUTED, letterSpacing: '0.06em' }}>NAME</span>
              <span style={{ fontFamily: monoFont, fontSize: 10, color: MUTED, letterSpacing: '0.06em' }}>CREATED</span>
              <span style={{ fontFamily: monoFont, fontSize: 10, color: MUTED, letterSpacing: '0.06em' }}>LAST ACTIVE</span>
              <span style={{ fontFamily: monoFont, fontSize: 10, color: MUTED, letterSpacing: '0.06em', textAlign: 'right' }}>ACTIONS</span>
            </div>

            {sessions.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center' }}>
                <p style={{ color: MUTED, fontSize: 13 }}>No sessions yet. Create one to get started.</p>
              </div>
            ) : (
              sessions.map(session => (
                <div
                  key={session.slug}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 120px 120px 100px',
                    padding: '14px 16px',
                    borderBottom: '1px solid rgba(180,200,255,0.06)',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MessageSquare size={14} color={MUTED} />
                    <span style={{ fontFamily: monoFont, fontSize: 12, color: '#fff' }}>{session.name}</span>
                    {session.slug === 'main' && (
                      <span style={{ fontSize: 9, color: CYAN, background: 'rgba(62,196,192,0.15)', padding: '2px 6px', borderRadius: 4 }}>
                        default
                      </span>
                    )}
                  </div>
                  <span style={{ fontFamily: monoFont, fontSize: 11, color: MUTED }}>
                    {session.createdAt ? new Date(session.createdAt).toLocaleDateString() : '-'}
                  </span>
                  <span style={{ fontFamily: monoFont, fontSize: 11, color: MUTED }}>
                    -
                  </span>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button
                      onClick={() => openChat(session.slug)}
                      style={{
                        padding: '6px 12px',
                        background: CYAN,
                        border: 'none',
                        borderRadius: 6,
                        fontFamily: monoFont,
                        fontSize: 10,
                        fontWeight: 600,
                        color: NAVY,
                        cursor: 'pointer',
                      }}
                    >
                      Chat
                    </button>
                    <button
                      onClick={() => handleDeleteSession(session.slug)}
                      disabled={session.slug === 'main'}
                      style={{
                        padding: 6,
                        background: session.slug === 'main' ? 'transparent' : 'rgba(255,100,100,0.1)',
                        border: session.slug === 'main' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,100,100,0.3)',
                        borderRadius: 6,
                        cursor: session.slug === 'main' ? 'not-allowed' : 'pointer',
                        opacity: session.slug === 'main' ? 0.5 : 1,
                      }}
                    >
                      <Trash2 size={12} color={session.slug === 'main' ? MUTED : 'rgba(255,100,100,0.9)'} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'tools' && (
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(180,200,255,0.08)',
          borderRadius: 12,
          padding: 24,
        }}>
          <p style={{ fontFamily: monoFont, fontSize: 11, color: MUTED, textTransform: 'uppercase', marginBottom: 16 }}>
            Available Tools
          </p>
          {tools.length === 0 ? (
            <p style={{ color: MUTED, fontSize: 13 }}>No tools available</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tools.map(tool => (
                <label
                  key={tool.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 8,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={tool.enabled}
                    onChange={e => handleToggleTool(tool.name, e.target.checked)}
                    style={{ accentColor: CYAN, width: 16, height: 16 }}
                  />
                  <span style={{ fontFamily: sansFont, fontSize: 13, color: '#fff', textTransform: 'capitalize' }}>
                    {tool.name}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'workspace' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { key: 'identityMd', label: 'identity.md', desc: "Agent's identity and personality" },
            { key: 'coreMd', label: 'core.md', desc: 'Behavioral rules and guidelines' },
            { key: 'contextMd', label: 'context.md', desc: 'Agent knowledge base' },
          ].map(({ key, label, desc }) => (
            <div key={key} style={{
              background: 'rgba(255,255,255,0.02)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(180,200,255,0.08)',
              borderRadius: 12,
              padding: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontFamily: monoFont, fontSize: 11, fontWeight: 600, color: CYAN }}>{label}</span>
                <span style={{ fontFamily: monoFont, fontSize: 9, color: MUTED }}>{desc}</span>
              </div>
              <textarea
                value={workspace[key as keyof typeof workspace]}
                onChange={e => setWorkspace(prev => ({ ...prev, [key]: e.target.value }))}
                placeholder={`Define ${label}...`}
                style={{
                  width: '100%',
                  minHeight: 100,
                  padding: '10px 12px',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(180,200,255,0.15)',
                  borderRadius: 6,
                  fontFamily: monoFont,
                  fontSize: 11,
                  color: '#fff',
                  resize: 'vertical',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          ))}
        </div>
      )}

      {activeTab === 'crons' && (
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(180,200,255,0.08)',
          borderRadius: 12,
          padding: 48,
          textAlign: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
            <Settings size={16} color={MUTED} />
            <p style={{ fontFamily: monoFont, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Scheduled Tasks
            </p>
          </div>
          <p style={{ color: MUTED, fontSize: 13 }}>
            Coming soon...
          </p>
        </div>
      )}

      {/* Chat Modal */}
      {isChatOpen && (
        <ChatModal
          agentName={currentAgent?.name || agentSlug}
          sessionName={sessions.find(s => s.slug === chatSession)?.name || chatSession}
          messages={chatMessages}
          input={chatInput}
          isGenerating={isGenerating}
          streamingThinking={streamingThinking}
          onInputChange={setChatInput}
          onSend={handleSendMessage}
          onClose={closeChat}
        />
      )}
    </div>
  )
}