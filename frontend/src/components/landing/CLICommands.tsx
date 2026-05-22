'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Check } from 'lucide-react'
import { CYAN, monoFont } from '../../theme'

export default function CLICommands() {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText('npx predict-station init')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy')
    }
  }

  return (
    <div
      style={{
        padding: '80px 56px',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <span
          style={{
            fontFamily: monoFont,
            fontSize: '12px',
            color: CYAN,
            letterSpacing: '0.04em',
            marginBottom: '16px',
            display: 'block',
          }}
        >
          Run Agent With
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            onClick={handleCopy}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              padding: '16px 20px',
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(180,200,255,0.12)',
              borderRadius: 12,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              flex: 1,
              maxWidth: '360px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.borderColor = 'rgba(62,196,192,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              e.currentTarget.style.borderColor = 'rgba(180,200,255,0.12)'
            }}
          >
            <code
              style={{
                fontFamily: monoFont,
                fontSize: '14px',
                color: '#fff',
                letterSpacing: '0.02em',
              }}
            >
              npx predict-station init
            </code>
            {copied ? (
              <Check size={18} color={CYAN} />
            ) : (
              <Copy size={18} color="rgba(180,200,255,0.5)" />
            )}
          </div>

          {/* CTA Button */}
          <button
            onClick={() => router.push('/app')}
            style={{
              padding: '16px 24px',
              background: CYAN,
              border: 'none',
              borderRadius: 12,
              fontFamily: monoFont,
              fontSize: 12,
              fontWeight: 700,
              color: '#000',
              cursor: 'pointer',
              letterSpacing: '0.08em',
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(62,196,192,0.8)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = CYAN
            }}
          >
            ENTER APP →
          </button>
        </div>
      </div>
    </div>
  )
}