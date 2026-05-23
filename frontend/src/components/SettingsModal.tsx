'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CYAN, NAVY, MUTED, monoFont, sansFont } from '../theme'

type SettingsTab = 'agent' | 'model' | 'data' | 'notifications'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('agent')
  const [serverUrl, setServerUrl] = useState('http://localhost:3001/api')
  const [modelType, setModelType] = useState('1.7B')
  const [temperature, setTemperature] = useState('0.7')
  const [notifications, setNotifications] = useState(true)

  if (!isOpen) return null

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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ fontFamily: monoFont, fontSize: 11, color: MUTED }}>
                Connection Status: Connected
              </span>
            </div>
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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(3,6,58,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(180,200,255,0.12)',
            borderRadius: 16,
            width: '100%',
            maxWidth: 560,
            maxHeight: '80vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(180,200,255,0.08)' }}>
            <h2 style={{ fontFamily: monoFont, fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: '#fff', margin: 0 }}>
              SETTINGS
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                fontFamily: monoFont,
                fontSize: 18,
                color: MUTED,
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Sidebar Tabs */}
            <div style={{ width: 180, borderRight: '1px solid rgba(180,200,255,0.08)', padding: '12px 0' }}>
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ x: 2 }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px 16px',
                    background: activeTab === tab.id ? 'rgba(62,196,192,0.15)' : 'transparent',
                    border: 'none',
                    borderLeft: `3px solid ${activeTab === tab.id ? CYAN : 'transparent'}`,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{
                    fontFamily: sansFont,
                    fontSize: 11,
                    fontWeight: activeTab === tab.id ? 600 : 400,
                    color: activeTab === tab.id ? CYAN : MUTED,
                  }}>
                    {tab.label}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Content */}
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              style={{ flex: 1, padding: 24, overflow: 'auto' }}
            >
              {renderContent()}
            </motion.div>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}