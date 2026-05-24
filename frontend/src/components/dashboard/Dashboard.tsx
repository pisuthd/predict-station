'use client'
 
import { useState, useEffect } from 'react'
import { CYAN, NAVY, MUTED, monoFont, sansFont } from '../../theme' 
import { useApp } from '../../context/AppProvider'
import { api } from '../../lib/api'

export default function Dashboard() { 
  const { step } = useApp()
  const [modelStatus, setModelStatus] = useState<{ isReady: boolean; modelType?: string } | null>(null)
  const [isLoadingModel, setIsLoadingModel] = useState(false)

  useEffect(() => {
    // Check model status when connected
    if (step !== 'disconnected') {
      checkModelStatus()
    }
  }, [step])

  const checkModelStatus = async () => {
    try {
      const status = await api.models.status()
      setModelStatus(status)
    } catch (err) {
      console.error('Failed to check model status:', err)
    }
  }

  const handleLoadModel = async () => {
    setIsLoadingModel(true)
    try {
      await api.models.load('1.7B')
      // The AppProvider will handle updating step to 'connected'
      await checkModelStatus()
    } catch (err) {
      console.error('Failed to load model:', err)
    } finally {
      setIsLoadingModel(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: NAVY,
      padding: '32px 48px 32px 224px' 
    }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontFamily: sansFont,
          fontSize: 28,
          fontWeight: 300,
          color: '#fff',
          margin: 0,
        }}>
          <strong style={{ fontWeight: 500 }}>Dashboard</strong>
        </h1>
      </div>

      {/* Model Status Card */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(180,200,255,0.12)',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: modelStatus?.isReady ? '#4ade80' : CYAN,
            boxShadow: modelStatus?.isReady ? '0 0 8px #4ade80' : '0 0 8px rgba(62,196,192,0.5)',
          }} />
          <div>
            <p style={{ fontFamily: monoFont, fontSize: 12, fontWeight: 600, color: '#fff', margin: 0 }}>
              {modelStatus?.isReady ? 'Model Ready' : step === 'loading-model' ? 'Loading Model...' : 'Model Not Loaded'}
            </p>
            <p style={{ fontFamily: monoFont, fontSize: 10, color: MUTED, margin: '4px 0 0' }}>
              {modelStatus?.modelType ? `Qwen3-${modelStatus.modelType}` : 'No model loaded'}
            </p>
          </div>
        </div>
        
        {!modelStatus?.isReady && step !== 'loading-model' && (
          <button
            onClick={handleLoadModel}
            disabled={isLoadingModel}
            style={{
              padding: '8px 16px',
              background: CYAN,
              border: 'none',
              borderRadius: 6,
              fontFamily: monoFont,
              fontSize: 10,
              fontWeight: 600,
              color: NAVY,
              cursor: isLoadingModel ? 'not-allowed' : 'pointer',
              opacity: isLoadingModel ? 0.7 : 1,
            }}
          >
            {isLoadingModel ? 'Loading...' : 'Load Model'}
          </button>
        )}
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { label: 'Agents', value: '0' },
          { label: 'Sessions', value: '0' },
          { label: 'Messages', value: '0' },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(180,200,255,0.12)',
              borderRadius: 12,
              padding: 20,
              textAlign: 'center',
            }}
          >
            <p style={{ fontFamily: monoFont, fontSize: 28, fontWeight: 700, color: CYAN, margin: 0 }}>
              {stat.value}
            </p>
            <p style={{ fontFamily: monoFont, fontSize: 10, color: MUTED, marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Placeholder Content */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(180,200,255,0.08)',
        borderRadius: 12,
        padding: 48,
        textAlign: 'center',
        marginTop: 20,
      }}>
        <p style={{ fontFamily: monoFont, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Coming Soon
        </p>
        <h2 style={{ fontFamily: monoFont, fontSize: 20, color: '#fff', marginTop: 8 }}>
          Dashboard Analytics
        </h2>
        <p style={{ color: MUTED, fontSize: 13, marginTop: 12 }}>
          Connect to an agent node to see detailed analytics and stats.
        </p>
      </div>
    </div>
  )
}
