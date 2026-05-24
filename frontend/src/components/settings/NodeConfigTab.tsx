'use client'

import { useState, useEffect } from 'react'
import { CYAN, NAVY, MUTED, monoFont, sansFont } from '../../theme'
import { useApp } from '../../context/AppProvider'
import { api } from '../../lib/api'

interface NodeStatus {
  isReady: boolean
  modelId: string | null
  modelType: string | null
}

interface NodeConfigTabProps {
  onConnect: () => void
}

export default function NodeConfigTab({ onConnect }: NodeConfigTabProps) {
  const { step, disconnect, connectionError } = useApp()
  const [suiRpc, setSuiRpc] = useState('https://fullnode.testnet.sui.io:443')
  const [predictServer, setPredictServer] = useState('https://predict-server.testnet.mystenlabs.com')
  const [nodeStatus, setNodeStatus] = useState<NodeStatus>({ isReady: false, modelId: null, modelType: null })

  // Load config on mount
  useEffect(() => {
    loadConfig()
  }, [])

  // Fetch node status periodically
  useEffect(() => {
    const checkStatus = async () => {
      if (step !== 'disconnected') {
        try {
          const status = await api.models.status()
          setNodeStatus(status)
        } catch (err) {
          setNodeStatus({ isReady: false, modelId: null, modelType: null })
        }
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 10000)
    return () => clearInterval(interval)
  }, [step])

  const loadConfig = async () => {
    try {
      const config = await api.config.get()
      setSuiRpc(config.suiRpc || 'https://fullnode.testnet.sui.io:443')
      setPredictServer(config.predictServer || 'https://predict-server.testnet.mystenlabs.com')
    } catch (err) {
      console.error('Failed to load config:', err)
    }
  }

  const saveConfig = async () => {
    try {
      await api.config.save({ suiRpc, predictServer })
    } catch (err) {
      console.error('Failed to save config:', err)
    }
  }

  const handleDisconnect = () => {
    if (confirm('Disconnect from the node?')) {
      disconnect()
    }
  }

  return (
    <div>
      <h3 style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 16 }}>
        Node Configuration
      </h3>

      {/* Predict Server URL */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: MUTED, marginBottom: 8, fontFamily: monoFont }}>
          Predict Server
        </label>
        <input
          type="text"
          value={predictServer}
          onChange={e => setPredictServer(e.target.value)}
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

      {/* SUI RPC URL */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: MUTED, marginBottom: 8, fontFamily: monoFont }}>
          SUI RPC
        </label>
        <input
          type="text"
          value={suiRpc}
          onChange={e => setSuiRpc(e.target.value)}
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
            Status: {nodeStatus.isReady ? 'Connected' : (step === 'disconnected' ? 'Disconnected' : 'Connecting...')}
          </span>
        </div>
        
        {nodeStatus.isReady && nodeStatus.modelType && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: monoFont, fontSize: 10, color: CYAN }}>
              Model: Qwen3-{nodeStatus.modelType}
            </span>
          </div>
        )}
      </div>

      {/* Connection Error */}
      {connectionError && (
        <div style={{ 
          padding: 12, 
          background: 'rgba(255,100,100,0.15)', 
          borderRadius: 8, 
          marginBottom: 16,
          border: '1px solid rgba(255,100,100,0.3)',
          fontFamily: monoFont,
          fontSize: 11,
          color: 'rgba(255,100,100,0.9)',
        }}>
          ⚠️ {connectionError}
        </div>
      )}

      {/* Connect/Disconnect Button */}
      {step === 'disconnected' ? (
        <button
          onClick={onConnect}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: CYAN,
            border: 'none',
            borderRadius: 8,
            color: NAVY,
            fontFamily: monoFont,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Connect
        </button>
      ) : (
        <button
          onClick={handleDisconnect}
          style={{
            width: '100%',
            padding: '12px 16px',
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
}