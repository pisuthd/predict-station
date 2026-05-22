'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { NAVY, CYAN, monoFont, sansFont } from '../../theme'
import TopNavBar from './components/TopNavBar'
import MainScreen from '../../pages/MainScreen'
import PlaceholderPage from './components/PlaceholderPage'
import LoadingScreen from '../../pages/LoadingScreen'
import AgentSelector from '../../pages/AgentSelector'
import OrbCanvas from '../../components/OrbCanvas'
import ServerSelector from '../../pages/ServerSelector'
import ModelSelector from '../../pages/ModelSelector'
import { getServerUrlStored } from '../../lib/api'

type NavItem = 'dashboard' | 'agents' | 'markets' | 'settings'

interface Agent {
  id: string
  name: string
  status: 'idle' | 'active' | 'error'
  createdAt: string
}

type AppStep = 'server' | 'model' | 'agents' | 'main'

export default function AppPage() {
  const router = useRouter()
  const [step, setStep] = useState<AppStep>('server')
  const [serverUrl, setServerUrl] = useState<string>('')
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [activeNav, setActiveNav] = useState<NavItem>('dashboard')
  const [isAgentsLoading, setIsAgentsLoading] = useState(false)
  const [showAgentSelector, setShowAgentSelector] = useState(false)

  const navItems: { id: NavItem; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'agents', label: 'Agents' },
    { id: 'markets', label: 'Markets' },
    { id: 'settings', label: 'Settings' },
  ]

  // Check if we already have a server configured
  useEffect(() => {
    const storedUrl = getServerUrlStored()
    if (storedUrl) {
      setServerUrl(storedUrl)
      setStep('model')
    }
  }, [])

  // Handle server connection
  const handleServerConnect = (url: string) => {
    setServerUrl(url)
    setStep('model')
  }

  // Handle model selection
  const handleModelSelect = (modelType: string) => {
    setSelectedModel(modelType)
    setStep('main')
  }

  // Handle navigation with loading for agents page
  const handleNavClick = (navId: NavItem) => {
    if (navId === 'agents' && activeNav !== 'agents') {
      setActiveNav('agents') // Set active immediately
      setIsAgentsLoading(true)
      setTimeout(() => {
        setIsAgentsLoading(false)
        setShowAgentSelector(true)
      }, 2500) // Match LoadingScreen duration
    } else {
      setActiveNav(navId)
    }
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

  // Handle continue from agent selector
  const handleContinue = () => {
    setShowAgentSelector(false)
    setActiveNav('agents')
  }

  // Full sidebar component (reused)
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
      case 'settings':
        return <PlaceholderPage title="Settings" />
      default:
        return <MainScreen agents={agents} selectedAgent={selectedAgent} />
    }
  }

  // Server selector step
  if (step === 'server') {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', background: NAVY }}>
        <OrbCanvas />
        <ServerSelector onConnect={handleServerConnect} />
      </div>
    )
  }

  // Model selector step
  if (step === 'model') {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', background: NAVY }}>
        <OrbCanvas />
        <ModelSelector 
          serverUrl={serverUrl} 
          onSelect={handleModelSelect}
          onBack={() => setStep('server')}
        />
      </div>
    )
  }

  // Show loading screen for agents
  if (isAgentsLoading) {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', background: NAVY }}>
        <OrbCanvas />
        
        {/* Full sidebar visible during loading */}
        <Sidebar />

        <LoadingScreen onComplete={() => {}} />
      </div>
    )
  }

  // Show agent selector
  if (showAgentSelector) {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', background: NAVY }}>
        <OrbCanvas />
        
        {/* Full sidebar visible */}
        <Sidebar />

        <AgentSelector
          agents={agents}
          onSelect={handleSelectAgent}
          onCreateAgent={handleCreateAgent}
          onContinue={handleContinue}
        />
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
    </div>
  )
}