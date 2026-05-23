'use client'

import { useRef, useEffect } from 'react'
import { CYAN, NAVY, MUTED, monoFont, sansFont } from '../../theme'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  thinking?: string
  timestamp: Date
}

interface ChatPanelProps {
  messages: ChatMessage[]
  streamingThinking: string
}

export default function ChatPanel({ messages, streamingThinking }: ChatPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.scrollTop = panelRef.current.scrollHeight
    }
  }, [messages, streamingThinking])

  return (
    <div
      ref={panelRef}
      style={{
        flex: 1,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(180,200,255,0.12)',
        borderRadius: 12,
        padding: 20,
        overflowY: 'auto',
        marginBottom: 16,
      }}
    >
      {messages.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <p style={{ fontFamily: monoFont, fontSize: 11, color: MUTED, letterSpacing: '0.06em' }}>
            Select an agent and session to start chatting
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map((msg) => (
            <div key={msg.id}>
              {/* Thinking bubble */}
              {msg.thinking && msg.role === 'assistant' && (
                <div
                  style={{
                    padding: '10px 14px',
                    background: 'rgba(139,92,246,0.15)',
                    border: '1px solid rgba(139,92,246,0.3)',
                    borderRadius: '12px 12px 12px 4px',
                    marginBottom: 8,
                    maxWidth: '80%',
                  }}
                >
                  <p style={{ fontFamily: monoFont, fontSize: 9, color: 'rgba(139,92,246,0.8)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                    Thinking
                  </p>
                  <p style={{ fontFamily: sansFont, fontSize: 12, color: 'rgba(180,200,255,0.8)', margin: 0, lineHeight: 1.5 }}>
                    {msg.thinking}
                  </p>
                </div>
              )}

              {/* Message bubble */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '75%',
                    padding: '12px 16px',
                    background: msg.role === 'user' ? CYAN : 'rgba(255,255,255,0.06)',
                    border: msg.role === 'user' ? 'none' : '1px solid rgba(180,200,255,0.15)',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  }}
                >
                  <p style={{ 
                    fontFamily: sansFont, 
                    fontSize: 13, 
                    color: msg.role === 'user' ? NAVY : '#fff', 
                    margin: 0,
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}>
                    {msg.content}
                    {msg.role === 'assistant' && !msg.content && streamingThinking && (
                      <span style={{ opacity: 0.5 }}>|</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}