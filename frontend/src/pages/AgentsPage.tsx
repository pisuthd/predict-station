'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus } from 'lucide-react'
import { CYAN, NAVY, MUTED, monoFont, sansFont } from '../theme'
import { api } from '../lib/api'
import OrbCanvas from '../components/OrbCanvas'
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
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

type Tab = 'overview' | 'sessions'

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<string>('main')
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newAgentName, setNewAgentName] = useState('')
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatSession, setChatSession] = useState<string>('main')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [streamingThinking, setStreamingThinking] = useState('')
  
  // Ref to always have access to latest messages (avoids stale closure)
  const chatMessagesRef = useRef<ChatMessage[]>([])

  // Fetch agents on mount
  useEffect(() => {
    loadAgents()
  }, [])

  // Fetch sessions when agent changes
  useEffect(() => {
    if (selectedAgent) {
      loadSessions(selectedAgent)
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
      
      // Set default if current selection doesn't exist
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

  const handleCreateAgent = async () => {
    if (!newAgentName.trim()) return
    
    try {
      await api.agents.create(newAgentName.trim())
      setNewAgentName('')
      setIsCreateModalOpen(false)
      await loadAgents()
    } catch (error) {
      console.error('Failed to create agent:', error)
    }
  }

  const handleCreateSession = async () => {
    const name = prompt('Session name:')
    if (!name?.trim()) return
    
    try {
      await api.agents.createSession(selectedAgent, name.trim())
      await loadSessions(selectedAgent)
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }

  const handleDeleteSession = async (sessionSlug: string) => {
    if (sessionSlug === 'main') return
    if (!confirm('Delete this session?')) return
    
    try {
      await api.agents.deleteSession(selectedAgent, sessionSlug)
      await loadSessions(selectedAgent)
    } catch (error) {
      console.error('Failed to delete session:', error)
    }
  }

  const handleDeleteAgent = async (slug: string) => {
    if (slug === 'main') return
    if (!confirm('Delete this agent and all its sessions?')) return
    
    try {
      await api.agents.delete(slug)
      await loadAgents()
    } catch (error) {
      console.error('Failed to delete agent:', error)
    }
  }

  const openChat = async (sessionSlug: string) => {
    setChatSession(sessionSlug)
    setIsChatOpen(true)
    
    // Load messages for this session
    try {
      const sessionData = await api.sessions.get(selectedAgent, sessionSlug)
      const messages = (sessionData.messages || []).map((msg: any, index: number) => ({
        id: msg.id || `msg-${index}`,
        role: msg.role,
        content: msg.content,
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
    
    // Create placeholder for assistant response
    const assistantMessageId = (Date.now() + 1).toString()
    setChatMessages(prev => [
      ...prev,
      {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      },
    ])
    
    try {
      setStreamingThinking('')
      // Get conversation history from ref (has all messages including new ones)
      const conversationHistory = chatMessagesRef.current.map((m: ChatMessage) => ({ role: m.role, content: m.content }))
      
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
          setStreamingThinking(prev => prev + thinking)
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
      
      // Save messages to backend - use ref to get all messages
      try {
        const messagesToSave = chatMessagesRef.current.map((m: ChatMessage) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: m.timestamp.toISOString(),
        }))
        await api.sessions.saveMessages(selectedAgent, chatSession, messagesToSave)
      } catch (error) {
        console.error('Failed to save messages:', error)
      }
    }
  }

  const getAgentName = (slug: string) => {
    return agents.find(a => a.slug === slug)?.name || slug
  }

  const agentOptions = agents.map(agent => ({
    value: agent.slug,
    label: agent.slug === 'main' ? `${agent.name} (default)` : agent.name,
  }))

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'sessions' as const, label: 'Sessions' },
  ]

  return (
    <div
      style={{
        minHeight: '100vh',
        background: NAVY,
        fontFamily: sansFont,
        position: 'relative',
      }}
    >
      <OrbCanvas />
      <div style={{ padding: '40px', paddingLeft: '220px', position: 'relative', zIndex: 10 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 300, color: '#fff', marginBottom: 24 }}>
          <strong style={{ fontWeight: 500 }}>Agents</strong>
        </h1>
        
        {/* Agent Selector & Create */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select
            value={selectedAgent}
            onChange={e => setSelectedAgent(e.target.value)}
            style={{
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(180,200,255,0.2)',
              borderRadius: 8,
              fontFamily: monoFont,
              fontSize: 12,
              color: '#fff',
              cursor: 'pointer',
              minWidth: 180,
            }}
          >
            {agentOptions.map(opt => (
              <option key={opt.value} value={opt.value} style={{ background: NAVY }}>
                {opt.label}
              </option>
            ))}
          </select>
          
          <button
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 16px',
              background: CYAN,
              border: 'none',
              borderRadius: 8,
              fontFamily: monoFont,
              fontSize: 11,
              fontWeight: 600,
              color: NAVY,
              cursor: 'pointer',
              letterSpacing: '0.05em',
            }}
          >
            <Plus size={14} /> Create Agent
          </button>
          
          {selectedAgent !== 'main' && (
            <button
              onClick={() => handleDeleteAgent(selectedAgent)}
              style={{
                padding: '10px 16px',
                background: 'rgba(255,100,100,0.1)',
                border: '1px solid rgba(255,100,100,0.3)',
                borderRadius: 8,
                fontFamily: monoFont,
                fontSize: 11,
                color: 'rgba(255,100,100,0.9)',
                cursor: 'pointer',
              }}
            >
              Delete Agent
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid rgba(180,200,255,0.1)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? `2px solid ${CYAN}` : '2px solid transparent',
              fontFamily: monoFont,
              fontSize: 11,
              fontWeight: activeTab === tab.id ? 600 : 400,
              color: activeTab === tab.id ? CYAN : MUTED,
              cursor: 'pointer',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(180,200,255,0.12)',
          borderRadius: 12,
          padding: 24,
        }}>
          <h2 style={{ fontFamily: monoFont, fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 16 }}>
            {getAgentName(selectedAgent)}
          </h2>
          <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.6 }}>
            Agent: {selectedAgent}<br />
            Sessions: {sessions.length}
          </p>
          <button
            onClick={() => openChat('main')}
            style={{
              marginTop: 16,
              padding: '10px 20px',
              background: CYAN,
              border: 'none',
              borderRadius: 6,
              fontFamily: monoFont,
              fontSize: 12,
              fontWeight: 600,
              color: NAVY,
              cursor: 'pointer',
            }}
          >
            Chat
          </button>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Create Session Button */}
          <button
            onClick={handleCreateSession}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px dashed rgba(180,200,255,0.2)',
              borderRadius: 8,
              fontFamily: monoFont,
              fontSize: 11,
              color: MUTED,
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
            }}
          >
            <Plus size={14} /> Create Session
          </button>

          {/* Sessions List */}
          {sessions.map(session => (
            <div
              key={session.slug}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(180,200,255,0.12)',
                borderRadius: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontFamily: monoFont, fontSize: 12, color: '#fff' }}>
                  {session.name}
                  {session.slug === 'main' && (
                    <span style={{ color: CYAN, marginLeft: 8, fontSize: 10 }}>(default)</span>
                  )}
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => openChat(session.slug)}
                  style={{
                    padding: '8px 16px',
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
                  Chat
                </button>
                
                {session.slug !== 'main' && (
                  <button
                    onClick={() => handleDeleteSession(session.slug)}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(255,100,100,0.1)',
                      border: '1px solid rgba(255,100,100,0.2)',
                      borderRadius: 6,
                      fontFamily: monoFont,
                      fontSize: 11,
                      color: 'rgba(255,100,100,0.9)',
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Agent Modal */}
      {isCreateModalOpen && (
        <div
          onClick={() => setIsCreateModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(3,6,58,0.8)',
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
            <h2 style={{ fontFamily: monoFont, fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 16 }}>
              Create Agent
            </h2>
            
            <input
              type="text"
              value={newAgentName}
              onChange={e => setNewAgentName(e.target.value)}
              placeholder="Agent name"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleCreateAgent()}
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
                onClick={() => setIsCreateModalOpen(false)}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  border: '1px solid rgba(180,200,255,0.2)',
                  borderRadius: 6,
                  fontFamily: monoFont,
                  fontSize: 11,
                  color: MUTED,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAgent}
                disabled={!newAgentName.trim()}
                style={{
                  padding: '10px 20px',
                  background: CYAN,
                  border: 'none',
                  borderRadius: 6,
                  fontFamily: monoFont,
                  fontSize: 11,
                  fontWeight: 600,
                  color: NAVY,
                  cursor: newAgentName.trim() ? 'pointer' : 'not-allowed',
                  opacity: newAgentName.trim() ? 1 : 0.5,
                }}
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
          agentName={getAgentName(selectedAgent)}
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
    </div>
  )
}
