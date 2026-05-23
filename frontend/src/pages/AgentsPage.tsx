'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, MessageSquare, Settings } from 'lucide-react'
import { CYAN, NAVY, MUTED, monoFont, sansFont } from '../theme'
import { api } from '../lib/api'
import ChatModal from '../components/chat/ChatModal'

interface Agent {
  slug: string
  name: string
  created: string
  sessionsCount: number
}

interface Session {
  slug: string
  name: string
  agentSlug: string
  created: string
  lastActive?: string
  messagesCount?: number
}

interface Tool {
  name: string
  enabled: boolean
  description?: string
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  thinking?: string
  timestamp: Date
}

interface WorkspaceFile {
  contextMd: string
  coreMd: string
  identityMd: string
}

type MainTab = 'sessions' | 'configuration'

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<string>('main')
  const [sessions, setSessions] = useState<Session[]>([])
  const [tools, setTools] = useState<Tool[]>([])
  const [mainTab, setMainTab] = useState<MainTab>('sessions')
  const [isLoading, setIsLoading] = useState(true)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatSession, setChatSession] = useState<string>('main')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [streamingThinking, setStreamingThinking] = useState('')
  const [workspace, setWorkspace] = useState<WorkspaceFile>({
    contextMd: '',
    coreMd: '',
    identityMd: '',
  })
  const [isCreateSessionModalOpen, setIsCreateSessionModalOpen] = useState(false)
  const [newSessionName, setNewSessionName] = useState('')

  // Ref to always have access to latest messages (avoids stale closure)
  const chatMessagesRef = useRef<ChatMessage[]>([])

  // Fetch agents, sessions, tools on mount
  useEffect(() => {
    loadAgents()
    loadTools()
  }, [])

  // Fetch sessions when agent changes
  useEffect(() => {
    if (selectedAgent) {
      loadSessions(selectedAgent)
      loadWorkspace(selectedAgent)
    }
  }, [selectedAgent])

  // Keep ref in sync with state
  useEffect(() => {
    chatMessagesRef.current = chatMessages
  }, [chatMessages])

  const loadAgents = async () => {
    try {
      const agentList = await api.agents.list()
      setAgents(agentList)
      if (agentList.length > 0 && !agentList.find((a: Agent) => a.slug === selectedAgent)) {
        setSelectedAgent(agentList[0].slug)
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadSessions = async (agentSlug: string) => {
    try {
      const sessionList = await api.agents.listSessions(agentSlug)
      setSessions(sessionList)
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    }
  }

  const loadTools = async () => {
    try {
      const toolList = await api.tools.list()
      setTools(toolList)
    } catch (error) {
      console.error('Failed to fetch tools:', error)
    }
  }

  const loadWorkspace = async (agentSlug: string) => {
    setWorkspace({ contextMd: '', coreMd: '', identityMd: '' })
  }

  const handleToggleTool = async (toolName: string, enabled: boolean) => {
    try {
      await api.tools.toggle(toolName, enabled)
      setTools(prev => prev.map(t => t.name === toolName ? { ...t, enabled } : t))
    } catch (error) {
      console.error('Failed to toggle tool:', error)
    }
  }

  const handleCreateSession = async () => {
    if (!newSessionName.trim()) return
    try {
      await api.agents.createSession(selectedAgent, newSessionName.trim())
      setNewSessionName('')
      setIsCreateSessionModalOpen(false)
      await loadSessions(selectedAgent)
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }

  const openChat = async (sessionSlug: string) => {
    setChatSession(sessionSlug)
    setIsChatOpen(true)
    try {
      const sessionData = await api.sessions.get(selectedAgent, sessionSlug)
      const messages = (sessionData.messages || []).map((msg: any, index: number) => ({
        id: msg.id || `msg-${index}`,
        role: msg.role,
        content: msg.content,
        thinking: msg.thinking || '',
        timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
      }))
      setChatMessages(messages)
      chatMessagesRef.current = messages
    } catch (error) {
      console.error('Failed to load messages:', error)
      setChatMessages([])
      chatMessagesRef.current = []
    }
  }

  const closeChat = () => {
    setIsChatOpen(false)
    setChatSession('main')
    setChatMessages([])
    chatMessagesRef.current = []
  }

  const handleClearMessages = async (sessionSlug: string) => {
    if (!confirm('Clear all messages in this session?')) return
    try {
      await api.sessions.saveMessages(selectedAgent, sessionSlug, [])
      await loadSessions(selectedAgent)
    } catch (error) {
      console.error('Failed to clear messages:', error)
    }
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
      {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        thinking: '',
        timestamp: new Date(),
      },
    ])
    
    try {
      setStreamingThinking('')
      const conversationHistory = chatMessagesRef.current.map(m => ({ role: m.role, content: m.content }))
      
      await api.chat(
        userMessage.content,
        conversationHistory,
        selectedAgent,
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
    } catch (error) {
      console.error('Chat error:', error)
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
      
      try {
        const messagesToSave = chatMessagesRef.current.map((m: ChatMessage) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          thinking: m.thinking || '',
          timestamp: m.timestamp.toISOString(),
        }))
        await api.sessions.saveMessages(selectedAgent, chatSession, messagesToSave)
      } catch (error) {
        console.error('Failed to save messages:', error)
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: NAVY,
        fontFamily: sansFont,
        display: 'flex',
      }}
    >
      {/* Left Floating Sidebar */}
      <div
        style={{
          position: 'fixed',
          left: 24,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 240,
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(180,200,255,0.12)',
          borderRadius: 16,
          padding: '20px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          zIndex: 100,
        }}
      >
        {/* Agents List */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <h3 style={{ fontFamily: monoFont, fontSize: 9, fontWeight: 600, color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
              Agents
            </h3>
            <button
              onClick={() => {
                const name = prompt('Agent name:')
                if (name?.trim()) {
                  api.agents.create(name.trim()).then(loadAgents)
                }
              }}
              style={{
                padding: '3px 6px',
                background: 'rgba(62,196,192,0.15)',
                border: '1px solid rgba(62,196,192,0.3)',
                borderRadius: 4,
                fontSize: 9,
                color: CYAN,
                cursor: 'pointer',
              }}
            >
              <Plus size={8} /> Add
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {agents.map(agent => (
              <button
                key={agent.slug}
                onClick={() => setSelectedAgent(agent.slug)}
                style={{
                  padding: '8px 10px',
                  background: selectedAgent === agent.slug ? 'rgba(62,196,192,0.15)' : 'transparent',
                  border: selectedAgent === agent.slug ? '1px solid rgba(62,196,192,0.25)' : '1px solid transparent',
                  borderRadius: 8,
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <span style={{ fontFamily: sansFont, fontSize: 12, color: selectedAgent === agent.slug ? CYAN : '#fff' }}>
                  {agent.name}
                </span>
                {agent.slug === 'main' && (
                  <span style={{ fontSize: 8, color: MUTED, marginLeft: 4 }}>default</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tools */}
        <div>
          <h3 style={{ fontFamily: monoFont, fontSize: 9, fontWeight: 600, color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
            Tools
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {tools.map(tool => (
              <label
                key={tool.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 8px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={tool.enabled}
                  onChange={e => handleToggleTool(tool.name, e.target.checked)}
                  style={{ accentColor: CYAN, width: 12, height: 12 }}
                />
                <span style={{ fontSize: 11, color: '#fff', textTransform: 'capitalize' }}>
                  {tool.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '32px 40px 32px 300px', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 300, color: '#fff', marginBottom: 6 }}>
            <strong style={{ fontWeight: 500 }}>{agents.find(a => a.slug === selectedAgent)?.name || 'Agent'}</strong>
          </h1>
          <p style={{ color: MUTED, fontSize: 13 }}>Manage sessions for this agent</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid rgba(180,200,255,0.1)' }}>
          <button
            onClick={() => setMainTab('sessions')}
            style={{
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              borderBottom: mainTab === 'sessions' ? `2px solid ${CYAN}` : '2px solid transparent',
              fontFamily: monoFont,
              fontSize: 11,
              fontWeight: mainTab === 'sessions' ? 600 : 400,
              color: mainTab === 'sessions' ? CYAN : MUTED,
              cursor: 'pointer',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Sessions
          </button>
          <button
            onClick={() => setMainTab('configuration')}
            style={{
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              borderBottom: mainTab === 'configuration' ? `2px solid ${CYAN}` : '2px solid transparent',
              fontFamily: monoFont,
              fontSize: 11,
              fontWeight: mainTab === 'configuration' ? 600 : 400,
              color: mainTab === 'configuration' ? CYAN : MUTED,
              cursor: 'pointer',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Configuration
          </button>
        </div>

        {/* Sessions Tab - Important */}
        {mainTab === 'sessions' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontFamily: monoFont, fontSize: 12, fontWeight: 600, color: '#fff', margin: 0 }}>All Sessions</h2>
              <button
                onClick={() => setIsCreateSessionModalOpen(true)}
                style={{
                  padding: '8px 14px',
                  background: CYAN,
                  border: 'none',
                  borderRadius: 8,
                  fontFamily: monoFont,
                  fontSize: 11,
                  fontWeight: 600,
                  color: NAVY,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Plus size={12} /> New Session
              </button>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(180,200,255,0.12)',
              borderRadius: 12,
              overflow: 'hidden',
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 120px 120px 100px',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.03)',
                borderBottom: '1px solid rgba(180,200,255,0.08)',
              }}>
                <span style={{ fontFamily: monoFont, fontSize: 10, color: MUTED, letterSpacing: '0.06em' }}>NAME</span>
                <span style={{ fontFamily: monoFont, fontSize: 10, color: MUTED, letterSpacing: '0.06em' }}>LAST ACTIVE</span>
                <span style={{ fontFamily: monoFont, fontSize: 10, color: MUTED, letterSpacing: '0.06em' }}>CREATED</span>
                <span style={{ fontFamily: monoFont, fontSize: 10, color: MUTED, letterSpacing: '0.06em', textAlign: 'right' }}>ACTIONS</span>
              </div>

              {sessions.map(session => (
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
                    <span style={{ fontSize: 13, color: '#fff' }}>{session.name}</span>
                    {session.slug === 'main' && (
                      <span style={{ fontSize: 9, color: CYAN, background: 'rgba(62,196,192,0.15)', padding: '2px 6px', borderRadius: 4 }}>default</span>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: MUTED }}>{formatTimeAgo(session.created)}</span>
                  <span style={{ fontSize: 12, color: MUTED }}>{formatDate(session.created)}</span>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button
                      onClick={() => openChat(session.slug)}
                      style={{
                        padding: '6px 10px',
                        background: CYAN,
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 10,
                        fontWeight: 600,
                        color: NAVY,
                        cursor: 'pointer',
                      }}
                    >
                      Chat
                    </button>
                    <button
                      onClick={() => handleClearMessages(session.slug)}
                      title="Clear messages"
                      style={{
                        padding: 6,
                        background: 'rgba(255,100,100,0.1)',
                        border: '1px solid rgba(255,100,100,0.2)',
                        borderRadius: 6,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Trash2 size={12} color="rgba(255,100,100,0.9)" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Configuration Tab - Less Important */}
        {mainTab === 'configuration' && (
          <div>
            {/* Cronjobs placeholder */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Settings size={14} color={MUTED} />
                <h3 style={{ fontFamily: monoFont, fontSize: 12, fontWeight: 600, color: '#fff', margin: 0 }}>Cronjobs</h3>
              </div>
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(180,200,255,0.12)', borderRadius: 8, color: MUTED, fontSize: 12, fontStyle: 'italic' }}>
                Coming soon...
              </div>
            </div>

            {/* Workspace Files */}
            <h3 style={{ fontFamily: monoFont, fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Agent Configuration</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { key: 'identityMd', label: 'identity.md', desc: "Agent's identity and personality" },
                { key: 'coreMd', label: 'core.md', desc: 'Behavioral rules and guidelines' },
                { key: 'contextMd', label: 'context.md', desc: 'Agent knowledge base' },
              ].map(({ key, label, desc }) => (
                <div key={key} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(180,200,255,0.12)', borderRadius: 10, padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <label style={{ fontFamily: monoFont, fontSize: 10, fontWeight: 600, color: CYAN }}>{label}</label>
                    <span style={{ fontSize: 9, color: MUTED }}>{desc}</span>
                  </div>
                  <textarea
                    value={workspace[key as keyof WorkspaceFile]}
                    onChange={e => setWorkspace(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={`Define ${label}...`}
                    style={{
                      width: '100%',
                      minHeight: 80,
                      padding: '8px 10px',
                      background: 'rgba(0,0,0,0.2)',
                      border: '1px solid rgba(180,200,255,0.15)',
                      borderRadius: 6,
                      fontFamily: 'monospace',
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
          </div>
        )}
      </div>

      {/* Create Session Modal */}
      {isCreateSessionModalOpen && (
        <div
          onClick={() => setIsCreateSessionModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(3,6,58,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(180,200,255,0.12)',
              borderRadius: 16,
              padding: 24,
              width: 360,
            }}
          >
            <h2 style={{ fontFamily: monoFont, fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Create Session</h2>
            <input
              type="text"
              value={newSessionName}
              onChange={e => setNewSessionName(e.target.value)}
              placeholder="Session name"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleCreateSession()}
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
                marginBottom: 16,
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setIsCreateSessionModalOpen(false)}
                style={{ padding: '10px 20px', background: 'transparent', border: '1px solid rgba(180,200,255,0.2)', borderRadius: 6, fontFamily: monoFont, fontSize: 11, color: MUTED, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSession}
                disabled={!newSessionName.trim()}
                style={{ padding: '10px 20px', background: CYAN, border: 'none', borderRadius: 6, fontFamily: monoFont, fontSize: 11, fontWeight: 600, color: NAVY, cursor: newSessionName.trim() ? 'pointer' : 'not-allowed', opacity: newSessionName.trim() ? 1 : 0.5 }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {isChatOpen && (
        <ChatModal
          agentName={agents.find(a => a.slug === selectedAgent)?.name || selectedAgent}
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