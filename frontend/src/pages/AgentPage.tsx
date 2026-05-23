'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, MessageSquare, Settings, ArrowLeft } from 'lucide-react'
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

interface AgentPageProps {
  agent: Agent
  onBack: () => void
}

type MainTab = 'sessions' | 'workspace' | 'tools' | 'cronjobs'

export default function AgentPage({ agent, onBack }: AgentPageProps) {
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

  const chatMessagesRef = useRef<ChatMessage[]>([])

  useEffect(() => {
    loadSessions(agent.slug)
    loadTools()
  }, [agent.slug])

  useEffect(() => {
    chatMessagesRef.current = chatMessages
  }, [chatMessages])

  const loadSessions = async (agentSlug: string) => {
    try {
      const sessionList = await api.agents.listSessions(agentSlug)
      setSessions(sessionList)
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    } finally {
      setIsLoading(false)
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
      await api.agents.createSession(agent.slug, newSessionName.trim())
      setNewSessionName('')
      setIsCreateSessionModalOpen(false)
      await loadSessions(agent.slug)
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }

  const openChat = async (sessionSlug: string) => {
    setChatSession(sessionSlug)
    setIsChatOpen(true)
    try {
      const sessionData = await api.sessions.get(agent.slug, sessionSlug)
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
      await api.sessions.saveMessages(agent.slug, sessionSlug, [])
      await loadSessions(agent.slug)
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
        agent.slug,
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
        await api.sessions.saveMessages(agent.slug, chatSession, messagesToSave)
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

  const tabs = [
    { id: 'sessions' as const, label: 'Sessions' },
    { id: 'workspace' as const, label: 'Workspace' },
    { id: 'tools' as const, label: 'Tools' },
    { id: 'cronjobs' as const, label: 'Cronjobs' },
  ]

  const renderContent = () => {
    switch (mainTab) {
      case 'sessions':
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontFamily: monoFont, fontSize: 11, fontWeight: 600, color: MUTED, margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase' }}>All Sessions</h3>
              <button
                onClick={() => setIsCreateSessionModalOpen(true)}
                style={{
                  padding: '8px 14px',
                  background: CYAN,
                  border: 'none',
                  borderRadius: 6,
                  fontFamily: monoFont,
                  fontSize: 10,
                  fontWeight: 600,
                  color: NAVY,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Plus size={10} /> New
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sessions.map((session, index) => (
                <div
                  key={session.slug}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(180,200,255,0.08)',
                    borderRadius: 6,
                  }}
                >
                  <div style={{
                    width: 28, height: 28,
                    background: 'rgba(26,26,232,0.4)',
                    border: '1px solid rgba(62,196,192,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: monoFont, fontWeight: 700, fontSize: 10, color: CYAN,
                    flexShrink: 0,
                  }}>
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontFamily: sansFont, fontSize: 13, fontWeight: 500, color: '#fff' }}>{session.name}</span>
                    <span style={{ fontFamily: monoFont, fontSize: 9, color: MUTED, marginLeft: 8 }}>{formatTimeAgo(session.created)}</span>
                  </div>
                  <button
                    onClick={() => openChat(session.slug)}
                    style={{
                      padding: '6px 10px',
                      background: CYAN,
                      border: 'none',
                      borderRadius: 4,
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
                    style={{
                      padding: 6,
                      background: 'rgba(255,100,100,0.1)',
                      border: '1px solid rgba(255,100,100,0.2)',
                      borderRadius: 4,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Trash2 size={10} color="rgba(255,100,100,0.9)" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )

      case 'workspace':
        return (
          <div>
            <h3 style={{ fontFamily: monoFont, fontSize: 11, fontWeight: 600, color: MUTED, marginBottom: 16, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Agent Configuration</h3>
            
            {[
              { key: 'identityMd', label: 'identity.md', desc: "Identity and personality" },
              { key: 'coreMd', label: 'core.md', desc: 'Behavioral rules' },
              { key: 'contextMd', label: 'context.md', desc: 'Knowledge base' },
            ].map(({ key, label, desc }) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
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
        )

      case 'tools':
        return (
          <div>
            <h3 style={{ fontFamily: monoFont, fontSize: 11, fontWeight: 600, color: MUTED, marginBottom: 16, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Available Tools</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tools.map(tool => (
                <label
                  key={tool.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    background: tool.enabled ? 'rgba(62,196,192,0.08)' : 'rgba(255,255,255,0.03)',
                    border: tool.enabled ? '1px solid rgba(62,196,192,0.2)' : '1px solid rgba(180,200,255,0.08)',
                    borderRadius: 6,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={tool.enabled}
                    onChange={e => handleToggleTool(tool.name, e.target.checked)}
                    style={{ accentColor: CYAN }}
                  />
                  <span style={{ fontSize: 12, color: '#fff', textTransform: 'capitalize', fontFamily: sansFont }}>{tool.name}</span>
                </label>
              ))}
            </div>
          </div>
        )

      case 'cronjobs':
        return (
          <div>
            <h3 style={{ fontFamily: monoFont, fontSize: 11, fontWeight: 600, color: MUTED, marginBottom: 16, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Scheduled Tasks</h3>
            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(180,200,255,0.08)', borderRadius: 6, textAlign: 'center' }}>
              <p style={{ color: MUTED, fontSize: 12, fontStyle: 'italic' }}>Coming soon...</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: NAVY,
        fontFamily: sansFont,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
      }}
    >
      {/* Glass Card */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(180,200,255,0.12)',
          borderRadius: 2,
          width: '100%',
          maxWidth: 640,
          overflow: 'hidden',
        }}
      >
        {/* Cyan top bar */}
        <div style={{ height: 3, background: CYAN, borderRadius: '2px 2px 0 0' }} />

        <div style={{ display: 'flex' }}>
          {/* Sidebar Tabs */}
          <div style={{ width: 160, borderRight: '1px solid rgba(180,200,255,0.08)', padding: '20px 0' }}>
            {/* Back button */}
            <button
              onClick={onBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                marginBottom: 16,
              }}
            >
              <ArrowLeft size={12} color={MUTED} />
              <span style={{ fontFamily: monoFont, fontSize: 10, color: MUTED }}>Back</span>
            </button>

            {/* Agent name */}
            <div style={{ padding: '0 16px 16px', borderBottom: '1px solid rgba(180,200,255,0.08)', marginBottom: 12 }}>
              <p style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 600, color: '#fff', margin: 0 }}>{agent.name}</p>
              <p style={{ fontFamily: monoFont, fontSize: 9, color: CYAN, marginTop: 4 }}>Agent</p>
            </div>

            {/* Tabs */}
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMainTab(tab.id)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 16px',
                  background: mainTab === tab.id ? 'rgba(62,196,192,0.12)' : 'transparent',
                  border: 'none',
                  borderLeft: `3px solid ${mainTab === tab.id ? CYAN : 'transparent'}`,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{
                  fontFamily: sansFont,
                  fontSize: 11,
                  fontWeight: mainTab === tab.id ? 600 : 400,
                  color: mainTab === tab.id ? CYAN : MUTED,
                }}>
                  {tab.label}
                </span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, padding: 24, overflowY: 'auto', maxHeight: '70vh' }}>
            {renderContent()}
          </div>
        </div>
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
              borderRadius: 12,
              padding: 24,
              width: 320,
            }}
          >
            <h2 style={{ fontFamily: monoFont, fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 16 }}>New Session</h2>
            <input
              type="text"
              value={newSessionName}
              onChange={e => setNewSessionName(e.target.value)}
              placeholder="Session name"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleCreateSession()}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(180,200,255,0.2)',
                borderRadius: 6,
                fontFamily: sansFont,
                fontSize: 13,
                color: '#fff',
                outline: 'none',
                marginBottom: 16,
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setIsCreateSessionModalOpen(false)}
                style={{ padding: '8px 16px', background: 'transparent', border: '1px solid rgba(180,200,255,0.2)', borderRadius: 4, fontFamily: monoFont, fontSize: 10, color: MUTED, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSession}
                disabled={!newSessionName.trim()}
                style={{ padding: '8px 16px', background: CYAN, border: 'none', borderRadius: 4, fontFamily: monoFont, fontSize: 10, fontWeight: 600, color: NAVY, cursor: newSessionName.trim() ? 'pointer' : 'not-allowed', opacity: newSessionName.trim() ? 1 : 0.5 }}
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
          agentName={agent.name}
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