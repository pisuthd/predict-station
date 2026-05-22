'use client'

import { CYAN, monoFont } from '../../theme'

const steps = [
  {
    number: '01',
    title: 'Create AI Agent',
    description: 'Set up your personal AI agent with custom settings',
  },
  {
    number: '02',
    title: 'Configure Markets',
    description: 'Select prediction markets to monitor and trade',
  },
  {
    number: '03',
    title: 'Deploy & Monitor',
    description: 'Let your agent analyze and make predictions',
  },
]

export default function HowItWorks() {
  return (
    <div
      style={{
        padding: '80px 56px',
        background: 'rgba(0,0,0,0.2)',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <p
          style={{
            fontFamily: monoFont,
            fontSize: '11px',
            letterSpacing: '0.18em',
            color: CYAN,
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}
        >
          How It Works
        </p>

        <h2
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '32px',
            fontWeight: 300,
            color: '#fff',
            marginBottom: '48px',
            lineHeight: 1.2,
          }}
        >
          <strong style={{ fontWeight: 500 }}>Three</strong> simple steps
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '32px',
          }}
        >
          {steps.map((step, index) => (
            <div key={index}>
              <div
                style={{
                  fontFamily: monoFont,
                  fontSize: '48px',
                  fontWeight: 700,
                  color: CYAN,
                  marginBottom: '16px',
                }}
              >
                {step.number}
              </div>
              <h3
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#fff',
                  marginBottom: '8px',
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '14px',
                  color: 'rgba(180,200,255,0.6)',
                  lineHeight: 1.5,
                }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}