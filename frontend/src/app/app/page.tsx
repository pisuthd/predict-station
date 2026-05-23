'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { NAVY, CYAN, monoFont, sansFont } from '../../theme'
import TopNavBar from '../../components/TopNavBar'
import MainScreen from '../../pages/MainScreen'
import PlaceholderPage from '../../components/PlaceholderPage'
import OrbCanvas from '../../components/OrbCanvas'
import ServerSelector from '../../pages/ServerSelector'
import ModelSelector from '../../pages/ModelSelector'
import SettingsModal from '../../components/SettingsModal'
import { setServerUrl } from '../../lib/api'

type NavItem = 'dashboard' | 'agents' | 'markets' | 'leaderboard' | 'settings'

interface Agent {
  id: string
  name: string
  status: 'idle' | 'active' | 'error'
  createdAt: string
}

export default function AppPage() {
  const router = useRouter()
  const [serverUrl, setServerUrlState] = useState<string>('')
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [activeNav, setActiveNav] = useState<NavItem>('dashboard')
  const [showServerSelector, setShowServerSelector] = useState(false)
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const navItems: { id: NavItem; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'agents', label: 'Agents' },
    { id: 'markets', label: 'Markets' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'settings', label: 'Settings' },
  ]

  // Handle navigation - Agents shows server/model selector if not configured
  const handleNavClick = (navId: NavItem) => {
    if (navId === 'agents') {
      setActiveNav('agents')
      if (!serverUrl) {
        setShowServerSelector(true)
      } else if (!selectedModel) {
        setShowModelSelector(true)
      }
    } else if (navId === 'settings') {
      setShowSettings(true)
    } else {
      setActiveNav(navId)
      setShowServerSelector(false)
      setShowModelSelector(false)
    }
  }

  // Handle server connection
  const handleServerConnect = (url: string) => {
    setServerUrl(url)
    setServerUrlState(url)
    setShowServerSelector(false)
    setShowModelSelector(true)
  }

  // Handle model selection
  const handleModelSelect = (modelType: string) => {
    setSelectedModel(modelType)
    setShowModelSelector(false)
  }

  // Handle agent selection
  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgent(agent)
  }

  // Handle create new agent
  const handleCreateAgent = (agentData: { name: string }) => {
    const newAgent: Agent = {
      id: Date.now().toString(),
      name: agentData.name,
      status: 'idle',
      createdAt: new Date().toISOString(),
    }
    setAgents([...agents, newAgent])
    setSelectedAgent(newAgent)
  }

  // Full sidebar component
  const Sidebar = () => (
    <div
      style={{
        position: 'fixed',
        left: 24,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(180,200,255,0.12)',
          borderRadius: 16,
          padding: '20px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          minWidth: 160,
        }}
      >
        <div 
          onClick={() => router.push('/')}
          style={{ 
            padding: '0 8px 16px', 
            borderBottom: '1px solid rgba(180,200,255,0.08)',
            marginBottom: 8,
            cursor: 'pointer',
          }}
        >
          <p style={{ fontFamily: monoFont, fontWeight: 700, fontSize: 12, letterSpacing: '0.06em', color: CYAN, margin: 0 }}>
            <span style={{ color: '#fff' }}>Predict</span> Station
          </p>
        </div>

        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              padding: '10px 12px',
              background: activeNav === item.id ? 'rgba(62,196,192,0.15)' : 'transparent',
              border: activeNav === item.id ? '1px solid rgba(62,196,192,0.25)' : '1px solid transparent',
              borderRadius: 10,
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.2s ease',
            }}
          >
            <span style={{ 
              fontFamily: sansFont, 
              fontSize: 12, 
              fontWeight: activeNav === item.id ? 600 : 400,
              color: activeNav === item.id ? CYAN : 'rgba(180,200,255,0.6)',
              letterSpacing: '0.02em',
            }}>
              {item.label}
            </span>
            {item.id === 'agents' && agents.length > 0 && (
              <span
                style={{
                  background: activeNav === item.id ? CYAN : 'rgba(62,196,192,0.25)',
                  color: activeNav === item.id ? NAVY : CYAN,
                  fontFamily: monoFont,
                  fontSize: 9,
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: 8,
                }}
              >
                {agents.length}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )

  // Render content based on active nav
  const renderContent = () => {
    switch (activeNav) {
      case 'dashboard':
        return <MainScreen agents={agents} selectedAgent={selectedAgent} />
      case 'agents':
        return <PlaceholderPage title="Agents" />
      case 'markets':
        return <PlaceholderPage title="Markets" />
      case 'leaderboard':
        return <PlaceholderPage title="Leaderboard" />
      default:
        return <MainScreen agents={agents} selectedAgent={selectedAgent} />
    }
  }

  // Show server selector when clicking Agents
  if (showServerSelector) {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', background: NAVY }}>
        <OrbCanvas />
        <Sidebar />
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          paddingLeft: 200,
        }}>
          <ServerSelector onConnect={handleServerConnect} />
        </div>
      </div>
    )
  }

  // Show model selector after server selection
  if (showModelSelector) {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', background: NAVY }}>
        <OrbCanvas />
        <Sidebar />
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          paddingLeft: 200,
        }}>
          <ModelSelector 
            serverUrl={serverUrl} 
            onSelect={handleModelSelect}
            onBack={() => {
              setShowModelSelector(false)
              setShowServerSelector(true)
            }}
          />
        </div>
      </div>
    )
  }

  // Show dashboard with floating UI
  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: NAVY }}>
      {/* Floating Top Navbar - Top Right */}
      <TopNavBar />

      {/* Full Sidebar - Left */}
      <Sidebar />

      {/* Main Content */}
      <main style={{ minHeight: '100vh' }}>
        {renderContent()}
      </main>

      {/* Settings Modal */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  )
}