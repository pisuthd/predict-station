'use client'

import { useState } from 'react'
import { HelpCircle } from 'lucide-react'

const MUTED = 'rgba(180,200,255,0.6)'
const CYAN = '#3EC4C0'

interface InfoTooltipProps {
  content: string
}

export function InfoTooltip({ content }: InfoTooltipProps) {
  const [show, setShow] = useState(false)

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginLeft: 4 }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <HelpCircle size={12} color={MUTED} style={{ cursor: 'help' }} />
      
      {show && (
        <div style={{
          position: 'absolute',
          bottom: 20,
          right: 0,
          background: 'rgba(10,10,30,0.98)',
          border: '1px solid rgba(62,196,192,0.4)',
          borderRadius: 6,
          padding: '8px 12px',
          fontSize: 10,
          color: MUTED,
          width: 200,
          zIndex: 9999,
          boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
          lineHeight: 1.4,
          whiteSpace: 'normal',
        }}>
          {content}
        </div>
      )}
    </span>
  )
}