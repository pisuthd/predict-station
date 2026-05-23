'use client'

import { CYAN, NAVY, MUTED, monoFont, sansFont } from '../../theme'

interface ChatInputProps {
  input: string
  onInputChange: (value: string) => void
  onSend: () => void
  isGenerating: boolean
}

export default function ChatInput({ input, onInputChange, onSend, isGenerating }: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        padding: 16,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(180,200,255,0.12)',
        borderRadius: 12,
      }}
    >
      <textarea
        value={input}
        onChange={e => onInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        disabled={isGenerating}
        style={{
          flex: 1,
          padding: '12px 16px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(180,200,255,0.2)',
          borderRadius: 8,
          fontFamily: sansFont,
          fontSize: 13,
          color: '#fff',
          outline: 'none',
          resize: 'none',
          minHeight: 48,
          maxHeight: 120,
          opacity: isGenerating ? 0.5 : 1,
          cursor: isGenerating ? 'not-allowed' : 'text',
        }}
      />
      <button
        onClick={onSend}
        disabled={isGenerating || !input.trim()}
        style={{
          padding: '12px 20px',
          background: CYAN,
          border: 'none',
          borderRadius: 8,
          fontFamily: monoFont,
          fontSize: 11,
          fontWeight: 600,
          color: NAVY,
          cursor: isGenerating || !input.trim() ? 'not-allowed' : 'pointer',
          opacity: isGenerating || !input.trim() ? 0.5 : 1,
          alignSelf: 'flex-end',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        Send
      </button>
    </div>
  )
}