'use client'

import { useState, useEffect } from 'react'
import { CYAN, NAVY, MUTED, monoFont, sansFont } from '../theme'
import Wordmark from '../components/Wordmark'
import { api } from '../lib/api'
import LoadingScreen from './LoadingScreen'

interface Model {
  name: string
  specs: string
  recommended: string
}

interface ModelSelectorProps {
  serverUrl: string
  onSelect: (modelType: string) => void
  onBack: () => void
}

export default function ModelSelector({ serverUrl, onSelect, onBack }: ModelSelectorProps) {
  const [models, setModels] = useState<Record<string, Model>>({})
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingModel, setLoadingModel] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('Initializing...')
  const [error, setError] = useState('')

  useEffect(() => {
    loadModels()
  }, [])

  const loadModels = async () => {
    setIsLoading(true)
    setError('')
    try {
      const modelsData = await api.models.list()
      setModels(modelsData)
    } catch (err) {
      setError('Failed to load models. Is the server running?')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadModel = async () => {
    if (!selectedModel) return
    
    setLoadingModel(true)
    setProgress(0)
    setStatusText('Enabling model at the agent node...')
    setError('')
    
    try {
      // Start loading model on backend
      const result = await api.models.load(selectedModel)
      
      if (!result.success) {
        setError(result.error || 'Failed to load model')
        setLoadingModel(false)
        return
      }
      
      // Listen to progress updates
      setStatusText('Downloading chosen model to local node...')
      const progressListener = api.models.onLoadProgress((progressData: { percentage: number; status: string }) => {
        setProgress(progressData.percentage)
        setStatusText(progressData.status || 'Loading...')
        
        // Complete when loading finishes
        if (progressData.percentage >= 100) {
          setTimeout(() => {
            setLoadingModel(false)
            if (selectedModel) {
              onSelect(selectedModel)
            }
          }, 500)
        }
      })
      
      // Cleanup on unmount or error
      return () => {
        progressListener.close()
      }
      
    } catch (err) {
      setError('Failed to load model. Check server logs.')
      console.error(err)
      setLoadingModel(false)
    }
  }

  // Show loading screen while model is loading
  if (loadingModel) {
    return (
      <LoadingScreen 
        progress={progress}
        statusText={statusText}
        onComplete={() => selectedModel && onSelect(selectedModel)}
      />
    )
  }

  const modelEntries = Object.entries(models)

  return (
    <div
      style={{
        minHeight: '100vh',
        background: NAVY,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 52,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: sansFont,
      }}
    >
      {/* Card */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(180,200,255,0.12)',
          borderRadius: 2,
          width: 480,
          overflow: 'hidden',
        }}
      >
        {/* Cyan top bar */}
        <div style={{ height: 3, background: CYAN, borderRadius: '2px 2px 0 0' }} />

        <div style={{ padding: '28px 32px 32px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
            <Wordmark />
            <button
              onClick={onBack}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                fontFamily: monoFont,
                fontSize: 10,
                color: MUTED,
                letterSpacing: '0.06em',
              }}
            >
              ← back
            </button>
          </div>

          <p style={{ fontFamily: monoFont, fontSize: 11, letterSpacing: '0.14em', color: MUTED, textTransform: 'uppercase', marginBottom: 8 }}>
            Models
          </p>

          <h1 style={{ fontFamily: sansFont, fontSize: 24, fontWeight: 300, color: '#fff', marginBottom: 8, lineHeight: 1.2 }}>
            <strong style={{ fontWeight: 500 }}>Select</strong> a model<br />to load
          </h1>

          <p style={{ fontFamily: monoFont, fontSize: 11, color: CYAN, marginBottom: 24 }}>
            Connected to {serverUrl}
          </p>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ 
                width: 24, height: 24, 
                border: `2px solid ${MUTED}`,
                borderTopColor: CYAN,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px',
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <p style={{ fontFamily: monoFont, fontSize: 12, color: MUTED }}>
                Loading models...
              </p>
            </div>
          ) : error && !modelEntries.length ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ fontFamily: monoFont, fontSize: 12, color: 'rgba(255,100,100,0.8)', marginBottom: 16 }}>
                {error}
              </p>
              <button
                onClick={loadModels}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(180,200,255,0.2)',
                  borderRadius: 6,
                  color: '#fff',
                  fontFamily: monoFont,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {modelEntries.map(([type, model]) => (
                  <button
                    key={type}
                    onClick={() => setSelectedModel(type)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '14px',
                      background: selectedModel === type ? 'rgba(62,196,192,0.15)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${selectedModel === type ? 'rgba(62,196,192,0.4)' : 'rgba(180,200,255,0.12)'}`,
                      borderRadius: 6,
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{
                      width: 44,
                      height: 44,
                      background: selectedModel === type ? 'rgba(62,196,192,0.2)' : 'rgba(26,26,232,0.3)',
                      border: `1px solid ${selectedModel === type ? 'rgba(62,196,192,0.5)' : 'rgba(180,200,255,0.2)'}`,
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: monoFont,
                      fontWeight: 700,
                      fontSize: 11,
                      color: selectedModel === type ? CYAN : '#fff',
                      flexShrink: 0,
                    }}>
                      {type}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ display: 'block', fontFamily: sansFont, fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 2 }}>
                        {model.name}
                      </span>
                      <span style={{ fontFamily: monoFont, fontSize: 10, color: MUTED }}>
                        {model.specs}
                      </span>
                    </div>
                    <div style={{
                      padding: '4px 8px',
                      background: model.recommended === 'High-spec' ? 'rgba(26,26,232,0.4)' : 'rgba(62,196,192,0.2)',
                      borderRadius: 4,
                      fontFamily: monoFont,
                      fontSize: 9,
                      fontWeight: 600,
                      color: model.recommended === 'High-spec' ? '#818cf8' : CYAN,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      {model.recommended}
                    </div>
                  </button>
                ))}
              </div>

              {error && selectedModel && (
                <p style={{ fontFamily: monoFont, fontSize: 11, color: 'rgba(255,100,100,0.8)', marginBottom: 16 }}>
                  {error}
                </p>
              )}

              {/* Load Model */}
              <button
                onClick={handleLoadModel}
                disabled={!selectedModel || loadingModel}
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
                  cursor: selectedModel && !loadingModel ? 'pointer' : 'not-allowed',
                  opacity: selectedModel && !loadingModel ? 1 : 0.5,
                  transition: 'opacity 0.2s',
                }}
              >
                {loadingModel ? 'LOADING...' : selectedModel ? `LOAD ${models[selectedModel]?.name || selectedModel}` : 'SELECT A MODEL'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}