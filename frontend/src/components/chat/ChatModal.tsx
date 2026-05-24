'use client'

import { useRef, useEffect } from 'react'
import { X, Send } from 'lucide-react'
import { CYAN, NAVY, MUTED, monoFont, sansFont } from '../../theme'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  thinking?: string
  timestamp: Date
}

interface ChatModalProps {
  agentName: string
  sessionName: string
  messages: Message[]
  input: string
  isGenerating: boolean
  streamingThinking: string
  onInputChange: (value: string) => void
  onSend: () => void
  onClose: () => void
}

export default function ChatModal({
  agentName,
  sessionName,
  messages,
  input,
  isGenerating,
  streamingThinking,
  onInputChange,
  onSend,
  onClose,
}: ChatModalProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when messages or thinking change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingThinking])

  // Focus input when modal opens
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  // Check if there's a streaming assistant message (last message is assistant with no content yet)
  const hasStreamingResponse = isGenerating && messages.length > 0 && messages[messages.length - 1].role === 'assistant'

  return (
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
    >
      {/* Glass Modal */}
      <div
        style={{
          width: '100%',
          maxWidth: 640,
          maxHeight: '85vh',
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(180,200,255,0.15)',
          borderRadius: 20,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(180,200,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: sansFont,
                fontSize: 15,
                fontWeight: 500,
                color: '#fff',
                marginBottom: 2,
              }}
            >
              Chat with {agentName}
            </h2>
            <p
              style={{
                fontFamily: monoFont,
                fontSize: 10,
                color: CYAN,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              Session: {sessionName}
            </p>
          </div>
          
          <button
            onClick={onClose}
            style={{
              padding: 8,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(180,200,255,0.12)',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} color={MUTED} />
          </button>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {messages.length === 0 && !hasStreamingResponse && (
            <div
              style={{
                textAlign: 'center',
                color: MUTED,
                fontFamily: monoFont,
                fontSize: 12,
                padding: '40px 0',
              }}
            >
              Start a conversation...
            </div>
          )}
          
          {messages.map((msg, index) => {
            const isLastAssistant = msg.role === 'assistant' && index === messages.length - 1
            // Show thinking: from streamingThinking (during generation) OR msg.thinking (persisted after)
            const thinkingContent = isLastAssistant && isGenerating ? streamingThinking : (msg.thinking || '')
            const showThinking = thinkingContent.length > 0
            
            return (
              <div key={msg.id}>
                {/* Thinking box - shows during streaming OR persists from completed message */}
                {showThinking && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '80%',
                        padding: '10px 14px',
                        background: 'rgba(26,26,232,0.15)',
                        border: '1px solid rgba(129,140,248,0.3)',
                        borderRadius: '16px 16px 16px 4px',
                        fontFamily: sansFont,
                        fontSize: 12,
                        color: 'rgba(180,200,255,0.7)',
                        fontStyle: 'italic',
                        lineHeight: 1.4,
                      }}
                    >
                      <span style={{ color: '#818cf8', fontStyle: 'normal', fontWeight: 600 }}>Thinking: </span>
                      {thinkingContent}
                    </div>
                  </div>
                )}
                
                <div
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '80%',
                      padding: '12px 16px',
                      background: msg.role === 'user'
                        ? 'rgba(62,196,192,0.2)'
                        : 'rgba(255,255,255,0.06)',
                      border: msg.role === 'user'
                        ? '1px solid rgba(62,196,192,0.3)'
                        : '1px solid rgba(180,200,255,0.12)',
                      borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      fontFamily: sansFont,
                      fontSize: 14,
                      color: '#fff',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            )
          })}
          
          {hasStreamingResponse && !streamingThinking && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div
                style={{
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(180,200,255,0.12)',
                  borderRadius: 16,
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    border: `2px solid ${MUTED}`,
                    borderTopColor: CYAN,
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid rgba(180,200,255,0.1)',
            display: 'flex',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={isGenerating}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(180,200,255,0.2)',
              borderRadius: 12,
              fontFamily: sansFont,
              fontSize: 14,
              color: '#fff',
              outline: 'none',
            }}
          />
          
          <button
            onClick={onSend}
            disabled={!input.trim() || isGenerating}
            style={{
              padding: 12,
              background: CYAN,
              border: 'none',
              borderRadius: 12,
              cursor: input.trim() && !isGenerating ? 'pointer' : 'not-allowed',
              opacity: input.trim() && !isGenerating ? 1 : 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isGenerating ? (
              <div
                style={{
                  width: 18,
                  height: 18,
                  border: `2px solid ${NAVY}`,
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
            ) : (
              <Send size={18} color={NAVY} />
            )}
          </button>
        </div>
      </div>

      {/* Spin animation */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}