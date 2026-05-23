'use client'

import { ReactNode } from 'react'
import { useApp } from '../context/AppProvider'
import { NAVY, CYAN, MUTED, monoFont, sansFont } from '../theme'

interface PageWrapperProps {
  children: ReactNode
  title?: string
}

export default function PageWrapper({ children, title }: PageWrapperProps) {
  const { isConnected } = useApp()

  if (!isConnected) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: NAVY,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingLeft: 200,
        }}
      >
        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(180,200,255,0.12)',
            borderRadius: 2,
            width: '100%',
            maxWidth: 400,
            overflow: 'hidden',
          }}
        >
          <div style={{ height: 3, background: CYAN, borderRadius: '2px 2px 0 0' }} />
          <div style={{ padding: 32 }}>
            <p
              style={{
                fontFamily: monoFont,
                fontSize: 11,
                letterSpacing: '0.14em',
                color: MUTED,
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              Agent Node Required
            </p>
            <h1
              style={{
                fontFamily: sansFont,
                fontSize: 20,
                fontWeight: 300,
                color: '#fff',
                marginBottom: 12,
                lineHeight: 1.3,
              }}
            >
              <strong style={{ fontWeight: 500 }}>Connect</strong> to a node
            </h1>
            <p style={{ fontFamily: monoFont, fontSize: 11, color: MUTED }}>
              Please connect to an agent node to access this page.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: NAVY, padding: '32px 48px 32px 280px' }}>
      {title && (
        <div style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontFamily: sansFont,
              fontSize: 28,
              fontWeight: 300,
              color: '#fff',
              margin: 0,
            }}
          >
            <strong style={{ fontWeight: 500 }}>{title}</strong>
          </h1>
        </div>
      )}
      {children}
    </div>
  )
}