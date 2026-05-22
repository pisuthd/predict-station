'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '../../../components/MainLayout'
import MainScreen from '../../../pages/MainScreen'

interface Agent {
  id: string
  name: string
  status: 'idle' | 'active' | 'error'
  createdAt: string
}

export default function MainPage() {
  const router = useRouter()
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)

  useEffect(() => {
    // Load agents and selected agent from sessionStorage
    const storedAgents = sessionStorage.getItem('agents')
    const storedSelectedAgent = sessionStorage.getItem('selectedAgent')
    
    if (storedAgents) {
      setAgents(JSON.parse(storedAgents))
    }
    if (storedSelectedAgent) {
      setSelectedAgent(JSON.parse(storedSelectedAgent))
    }
  }, [])

  // If no agents, redirect to agent selection
  useEffect(() => {
    const storedAgents = sessionStorage.getItem('agents')
    if (!storedAgents || JSON.parse(storedAgents).length === 0) {
      // Allow user to be on this page but they'll see empty state
    }
  }, [])

  return (
    <MainLayout agentCount={agents.length}>
      <MainScreen agents={agents} selectedAgent={selectedAgent} />
    </MainLayout>
  )
}