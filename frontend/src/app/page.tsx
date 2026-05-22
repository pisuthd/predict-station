'use client'

import { useState, useCallback } from 'react'
import LoadingScreen from '../pages/LoadingScreen'
import AgentSelector from '../pages/AgentSelector'
import MainLayout from '../components/MainLayout'
import MainScreen from '../pages/MainScreen'

interface Agent {
  id: string
  name: string
  status: 'idle' | 'active' | 'error'
  createdAt: string
}

export default function Home() {
  const [appState, setAppState] = useState<'loading' | 'agent' | 'main'>('loading')
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)

  const handleLoadingComplete = useCallback(() => {
    setAppState('agent')
  }, [])

  const handleAgentSelect = useCallback((agent: Agent) => {
    setSelectedAgent(agent)
    setAppState('main')
  }, [])

  const handleAgentCreate = useCallback((agentData: { name: string }) => {
    const newAgent: Agent = {
      id: Date.now().toString(),
      name: agentData.name,
      status: 'idle',
      createdAt: new Date().toISOString(),
    }
    setAgents(prev => [...prev, newAgent])
  }, [])

  const handleContinue = useCallback(() => {
    setAppState('main')
  }, [])

  return (
    <>
      {appState === 'loading' && <LoadingScreen onComplete={handleLoadingComplete} />}
      
      {appState === 'agent' && (
        <AgentSelector 
          agents={agents}
          onSelect={handleAgentSelect}
          onCreateAgent={handleAgentCreate}
          onContinue={handleContinue}
        />
      )}
      
      {appState === 'main' && (
        <MainLayout agentCount={agents.length}>
          <MainScreen agents={agents} selectedAgent={selectedAgent} />
        </MainLayout>
      )}
    </>
  )
}