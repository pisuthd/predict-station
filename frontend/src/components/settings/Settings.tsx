'use client'

import { useState, useEffect } from 'react'
import { CYAN, NAVY, MUTED, monoFont, sansFont } from '../../theme'
import { useApp } from '../../context/AppProvider'
import { api } from '../../lib/api'

type SettingsTab = 'agent' | 'model' | 'data' | 'notifications'

interface NodeStatus {
  isReady: boolean
  modelId: string | null
  modelType: string | null
}

export default function Settings() {
  const { step, disconnect } = useApp()
  const [activeTab, setActiveTab] = useState<SettingsTab>('agent')
  const [serverUrl, setServerUrl] = useState('http://localhost:3001')
  const [modelType, setModelType] = useState('1.7B')
  const [temperature, setTemperature] = useState('0.7')
  const [notifications, setNotifications] = useState(true)
  const [nodeStatus, setNodeStatus] = useState<NodeStatus>({ isReady: false, modelId: null, modelType: null })
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)

  // Fetch node status periodically
  useEffect(() => {
    const checkStatus = async () => {
      if (step !== 'disconnected') {
        setIsCheckingStatus(true)
        try {
          const status = await api.models.status()
          setNodeStatus(status)
        } catch (err) {
          setNodeStatus({ isReady: false, modelId: null, modelType: null })
        } finally {
          setIsCheckingStatus(false)
        }
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 10000) // Check every 10 seconds
    return () => clearInterval(interval)
  }, [step])

  const handleDisconnect = () => {
    if (confirm('Disconnect from the node?')) {
      disconnect()
    }
  }

  const tabs = [
    { id: 'agent' as const, label: 'Local Agent Node' },
    { id: 'model' as const, label: 'AI Model Settings' },
    { id: 'data' as const, label: 'Data Export / Import' },
    { id: 'notifications' as const, label: 'Notifications' },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'agent':
        return (
          <div>
            <h3 style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 16 }}>
              Agent Node Configuration
            </h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: MUTED, marginBottom: 8, fontFamily: monoFont }}>
                Server URL
              </label>
              <input
                type="text"
                value={serverUrl}
                onChange={e => setServerUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(180,200,255,0.2)',
                  borderRadius: 6,
                  fontFamily: sansFont,
                  fontSize: 13,
                  color: '#fff',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            
            {/* Node Status */}
            <div style={{ 
              padding: 16, 
              background: 'rgba(0,0,0,0.2)', 
              borderRadius: 8, 
              marginBottom: 16,
              border: '1px solid rgba(180,200,255,0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  background: nodeStatus.isReady ? '#22c55e' : (step === 'disconnected' ? '#ef4444' : '#eab308')
                }} />
                <span style={{ fontFamily: monoFont, fontSize: 11, color: MUTED }}>
                  Node Status: {nodeStatus.isReady ? 'Connected' : (step === 'disconnected' ? 'Disconnected' : 'Connecting...')}
                </span>
              </div>
              
              {nodeStatus.isReady && nodeStatus.modelType && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: monoFont, fontSize: 10, color: CYAN }}>
                    Model: Qwen3-{nodeStatus.modelType}
                  </span>
                </div>
              )}
              
              {isCheckingStatus && (
                <div style={{ marginTop: 8 }}>
                  <span style={{ fontFamily: monoFont, fontSize: 10, color: MUTED }}>
                    Checking status...
                  </span>
                </div>
              )}
            </div>

            {/* Disconnect Button */}
            {step !== 'disconnected' && (
              <button
                onClick={handleDisconnect}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  background: 'rgba(255,100,100,0.15)',
                  border: '1px solid rgba(255,100,100,0.3)',
                  borderRadius: 8,
                  color: 'rgba(255,100,100,0.9)',
                  fontFamily: monoFont,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Disconnect
              </button>
            )}
          </div>
        )
      case 'model':
        return (
          <div>
            <h3 style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 16 }}>
              AI Model Configuration
            </h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: MUTED, marginBottom: 8, fontFamily: monoFont }}>
                Model Type
              </label>
              <select
                value={modelType}
                onChange={e => setModelType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(180,200,255,0.2)',
                  borderRadius: 6,
                  fontFamily: sansFont,
                  fontSize: 13,
                  color: '#fff',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              >
                <option value="1.7B">Qwen3-1.7B (Fast)</option>
                <option value="4B">Qwen3-4B (High Quality)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: MUTED, marginBottom: 8, fontFamily: monoFont }}>
                Temperature: {temperature}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={e => setTemperature(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        )
      case 'data':
        return (
          <div>
            <h3 style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 16 }}>
              Data Management
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button style={{
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(180,200,255,0.2)',
                borderRadius: 8,
                color: '#fff',
                fontFamily: monoFont,
                fontSize: 12,
                cursor: 'pointer',
                textAlign: 'left',
              }}>
                📤 Export Data
              </button>
              <button style={{
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(180,200,255,0.2)',
                borderRadius: 8,
                color: '#fff',
                fontFamily: monoFont,
                fontSize: 12,
                cursor: 'pointer',
                textAlign: 'left',
              }}>
                📥 Import Data
              </button>
              <button style={{
                padding: '12px 16px',
                background: 'rgba(255,100,100,0.1)',
                border: '1px solid rgba(255,100,100,0.3)',
                borderRadius: 8,
                color: 'rgba(255,100,100,0.9)',
                fontFamily: monoFont,
                fontSize: 12,
                cursor: 'pointer',
                textAlign: 'left',
              }}>
                🗑️ Clear All Data
              </button>
            </div>
          </div>
        )
      case 'notifications':
        return (
          <div>
            <h3 style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 16 }}>
              Notification Preferences
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(180,200,255,0.1)' }}>
              <span style={{ fontFamily: sansFont, fontSize: 13, color: '#fff' }}>
                Enable Notifications
              </span>
              <button
                onClick={() => setNotifications(!notifications)}
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  background: notifications ? CYAN : 'rgba(180,200,255,0.2)',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#fff',
                  position: 'absolute',
                  top: 3,
                  left: notifications ? 23 : 3,
                  transition: 'left 0.2s',
                }} />
              </button>
            </div>
          </div>
        )
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
          <strong style={{ fontWeight: 500 }}>Settings</strong>
        </h1>
      </div>

      {/* Settings Page with Sidebar */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(180,200,255,0.12)',
        borderRadius: 16,
        overflow: 'hidden',
        display: 'flex',
        maxWidth: 800,
      }}>
        {/* Sidebar Tabs */}
        <div style={{ width: 200, borderRight: '1px solid rgba(180,200,255,0.08)', padding: '16px 0' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'block',
                width: '100%',
                padding: '12px 16px',
                background: activeTab === tab.id ? 'rgba(62,196,192,0.15)' : 'transparent',
                border: 'none',
                borderLeft: `3px solid ${activeTab === tab.id ? CYAN : 'transparent'}`,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{
                fontFamily: sansFont,
                fontSize: 12,
                fontWeight: activeTab === tab.id ? 600 : 400,
                color: activeTab === tab.id ? CYAN : MUTED,
              }}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: 24 }}>
          {renderContent()}
        </div>
      </div>
    </div>
  )
}