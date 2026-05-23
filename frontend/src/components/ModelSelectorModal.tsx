'use client'

import { useState } from 'react'
import { CYAN, NAVY, MUTED, monoFont, sansFont } from '../theme'
import { useApp } from '../context/AppProvider'
import { api } from '../lib/api'

const MODELS = [
  { id: '1.7B', name: 'Qwen3-1.7B', desc: 'Fast, lightweight model for quick tasks' },
  { id: '4B', name: 'Qwen3-4B', desc: 'Balanced performance and capability' },
]

export default function ModelSelectorModal() {
  const { serverUrl, setSelectedModel, setStep } = useApp()
  const [selectedModel, setLocalSelectedModel] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLoadModel = () => {
    if (!selectedModel || isLoading) return
    setIsLoading(true)
    setError('')
    
    // Fire and forget - don't await the API call
    // The backend will start loading and SSE will handle progress
    api.models.load(selectedModel).catch((err) => {
      setError('Failed to load model')
      setIsLoading(false)
    })
    
    // Immediately transition to loading screen
    setSelectedModel(selectedModel)
    setStep('loading-model')
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: NAVY,
          border: '1px solid rgba(180,200,255,0.12)',
          borderRadius: 16,
          width: '100%',
          maxWidth: 480,
          overflow: 'hidden',
        }}
      >
        {/* Cyan accent bar */}
        <div style={{ height: 3, background: CYAN, borderRadius: '2px 2px 0 0' }} />

        <div style={{ padding: '28px 32px 32px' }}>
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontFamily: monoFont, fontSize: 11, letterSpacing: '0.14em', color: MUTED, textTransform: 'uppercase', marginBottom: 8 }}>
              Connected to {serverUrl.replace('http://', '').replace('https://', '').split('/')[0]}
            </p>
            <h2 style={{ fontFamily: sansFont, fontSize: 20, fontWeight: 300, color: '#fff', marginBottom: 8, lineHeight: 1.2 }}>
              <strong style={{ fontWeight: 500 }}>Select</strong> a model<br />to load
            </h2>
            <p style={{ fontFamily: monoFont, fontSize: 11, color: CYAN, marginBottom: 0 }}>
              Choose the AI model for this session
            </p>
          </div>

          {/* Model options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => setLocalSelectedModel(model.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 16px',
                  background: selectedModel === model.id ? 'rgba(62,196,192,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${selectedModel === model.id ? 'rgba(62,196,192,0.4)' : 'rgba(180,200,255,0.12)'}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  border: `2px solid ${selectedModel === model.id ? CYAN : MUTED}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {selectedModel === model.id && (
                    <div style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: CYAN,
                    }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontFamily: sansFont, fontSize: 14, fontWeight: 500, color: '#fff' }}>
                    {model.name}
                  </span>
                  <span style={{ fontFamily: monoFont, fontSize: 11, color: MUTED }}>
                    {model.desc}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <p style={{ fontFamily: monoFont, fontSize: 11, color: 'rgba(255,100,100,0.8)', marginBottom: 16 }}>
              {error}
            </p>
          )}

          {/* Load button */}
          <button
            onClick={handleLoadModel}
            disabled={!selectedModel || isLoading}
            style={{
              width: '100%',
              padding: '13px 0',
              background: CYAN,
              border: 'none',
              borderRadius: 6,
              color: NAVY,
              fontFamily: monoFont,
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: '0.1em',
              cursor: !selectedModel ? 'not-allowed' : 'pointer',
              opacity: !selectedModel || isLoading ? 0.5 : 1,
            }}
          >
            {isLoading ? 'Loading...' : 'LOAD MODEL'}
          </button>
        </div>
      </div>
    </div>
  )
}