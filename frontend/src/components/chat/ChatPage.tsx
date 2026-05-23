'use client'

import { useState, useEffect, useRef } from 'react'
import { CYAN, NAVY, MUTED, monoFont, sansFont } from '../../theme'
import { api } from '../../lib/api'
import { useApp } from '../../context/AppProvider'
import ChatPanel from './ChatPanel'
import ChatInput from './ChatInput'
import PageWrapper from '../PageWrapper'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  thinking?: string
  timestamp: Date
}

export default function ChatPage() {
  const { agents, selectedAgent, setSelectedAgent, sessions, selectedSession, setSelectedSession, refreshSessions } = useApp()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [streamingThinking, setStreamingThinking] = useState('')
  
  const messagesRef = useRef<ChatMessage[]>([])

  // Load messages when agent/session changes
  useEffect(() => {
    if (selectedAgent && selectedSession) {
      loadMessages()
    }
  }, [selectedAgent, selectedSession])

  // Keep ref in sync
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  const loadMessages = async () => {
    if (!selectedAgent || !selectedSession) return
    try {
      const sessionData = await api.sessions.get(selectedAgent, selectedSession)
      const loadedMessages = (sessionData.messages || []).map((msg: any, index: number) => ({
        id: msg.id || `msg-${index}`,
        role: msg.role,
        content: msg.content,
        thinking: msg.thinking || '',
        timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
      }))
      setMessages(loadedMessages)
      messagesRef.current = loadedMessages
    } catch (error) {
      console.error('Failed to load messages:', error)
      setMessages([])
      messagesRef.current = []
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isGenerating || !selectedAgent || !selectedSession) return
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsGenerating(true)
    
    const assistantMessageId = (Date.now() + 1).toString()
    let currentThinking = ''
    
    setMessages(prev => [
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
      const conversationHistory = messagesRef.current.map(m => ({ role: m.role, content: m.content }))
      
      await api.chat(
        userMessage.content,
        conversationHistory,
        selectedAgent,
        (token: string) => {
          setMessages(prev =>
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
          setMessages(prev =>
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
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId
            ? { ...msg, content: 'Error: Failed to get response' }
            : msg
        )
      )
    } finally {
      setIsGenerating(false)
      setStreamingThinking('')
      
      // Save messages
      try {
        const messagesToSave = messagesRef.current.map((m: ChatMessage) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          thinking: m.thinking || '',
          timestamp: m.timestamp.toISOString(),
        }))
        await api.sessions.saveMessages(selectedAgent, selectedSession, messagesToSave)
      } catch (error) {
        console.error('Failed to save messages:', error)
      }
    }
  }

  // Load sessions when agent changes
  useEffect(() => {
    if (selectedAgent) {
      refreshSessions(selectedAgent)
    }
  }, [selectedAgent])

  const selectedAgentData = agents.find(a => a.slug === selectedAgent)
  const selectedSessionData = sessions.find(s => s.slug === selectedSession)

  return (
    <PageWrapper>
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 128px)' }}>
        {/* Header with Agent/Session dropdowns */}
        <div style={{ 
          display: 'flex', 
          gap: 12, 
          marginBottom: 16,
          padding: '16px 20px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(180,200,255,0.12)',
          borderRadius: 12,
        }}>
          {/* Agent dropdown */}
          <div style={{ flex: 1 }}>
            <label style={{ fontFamily: monoFont, fontSize: 9, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
              Agent
            </label>
            <select
              value={selectedAgent || ''}
              onChange={e => setSelectedAgent(e.target.value)}
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
                cursor: 'pointer',
              }}
            >
              <option value="">Select agent...</option>
              {agents.map(agent => (
                <option key={agent.slug} value={agent.slug}>{agent.name}</option>
              ))}
            </select>
          </div>

          {/* Session dropdown */}
          <div style={{ flex: 1 }}>
            <label style={{ fontFamily: monoFont, fontSize: 9, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
              Session
            </label>
            <select
              value={selectedSession || ''}
              onChange={e => setSelectedSession(e.target.value)}
              disabled={!selectedAgent}
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
                cursor: selectedAgent ? 'pointer' : 'not-allowed',
                opacity: selectedAgent ? 1 : 0.5,
              }}
            >
              <option value="">Select session...</option>
              {sessions.map(session => (
                <option key={session.slug} value={session.slug}>{session.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Chat Panel */}
        <ChatPanel 
          messages={messages}
          streamingThinking={streamingThinking}
        />

        {/* Input */}
        <ChatInput
          input={input}
          onInputChange={setInput}
          onSend={handleSendMessage}
          isGenerating={isGenerating}
        />
      </div>
    </PageWrapper>
  )
}