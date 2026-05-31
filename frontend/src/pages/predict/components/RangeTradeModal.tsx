'use client'

import { ModalWrapper } from '../../../components/ModalWrapper'

interface RangeTradeModalProps {
  isOpen: boolean
  onClose: () => void
  marketName: string
}

export function RangeTradeModal({ isOpen, onClose, marketName }: RangeTradeModalProps) {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <h2 style={{
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 700,
        margin: '0 0 16px',
        fontFamily: "'Space Mono', monospace",
      }}>
        Range Trading
      </h2>
      
      <p style={{
        color: 'rgba(180,200,255,0.6)',
        fontSize: 14,
        lineHeight: 1.6,
      }}>
        Range trading feature coming soon.
        <br />
        Stay tuned for updates.
      </p>

      <button
        onClick={onClose}
        style={{
          marginTop: 24,
          padding: '12px 32px',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'transparent',
          color: '#ffffff',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: "'Space Mono', monospace",
        }}
      >
        Close
      </button>
    </ModalWrapper>
  )
}