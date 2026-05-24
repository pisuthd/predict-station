'use client'

import { useState } from 'react'
import { NAVY, CYAN, MUTED, sansFont } from '../../theme'
import ServerModal from './ServerModal'
import RevealModal from './RevealModal'
import NodeConfigTab from './NodeConfigTab'
import WalletTab from './WalletTab'
import ModelTab from './ModelTab'
import DataTab from './DataTab'
import NotificationsTab from './NotificationsTab'

type SettingsTab = 'node' | 'wallet' | 'model' | 'data' | 'notifications'

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('node')
  const [showServerModal, setShowServerModal] = useState(false)
  const [showRevealModal, setShowRevealModal] = useState(false)

  const tabs = [
    { id: 'node' as const, label: 'Node Config' },
    { id: 'wallet' as const, label: 'Wallet' },
    { id: 'model' as const, label: 'AI Model Settings' },
    { id: 'data' as const, label: 'Data Export / Import' },
    { id: 'notifications' as const, label: 'Notifications' },
  ]

  const handleConnect = () => {
    setShowServerModal(true)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'node':
        return <NodeConfigTab onConnect={handleConnect} />
      case 'wallet':
        return <WalletTab onRevealSeed={() => setShowRevealModal(true)} />
      case 'model':
        return <ModelTab />
      case 'data':
        return <DataTab />
      case 'notifications':
        return <NotificationsTab />
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

      {/* Server Selection Modal */}
      <ServerModal 
        showServerModal={showServerModal} 
        setShowServerModal={setShowServerModal} 
      />

      {/* Reveal Seed Phrase Modal */}
      <RevealModal
        showRevealModal={showRevealModal}
        onClose={() => setShowRevealModal(false)}
      />
    </div>
  )
}