'use client'

import { useState } from 'react'
import { NAVY } from '../../theme'
import AppHeader from './components/AppHeader'
import AppSidebar from './components/AppSidebar'
import MainScreen from '../../pages/MainScreen'

interface Agent {
  id: string
  name: string
  status: 'idle' | 'active' | 'error'
  createdAt: string
}

export default function AppPage() {
  const [agents] = useState<Agent[]>([])
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div
      style={{
        minHeight: '100vh',
        background: NAVY,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AppHeader agentCount={agents.length} />
      
      <div style={{ display: 'flex', flex: 1 }}>
        <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main style={{ flex: 1, overflow: 'auto' }}>
          <MainScreen agents={agents} selectedAgent={null} />
        </main>
      </div>
    </div>
  )
}