'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AgentSelector from '../../../pages/AgentSelector'

interface Agent {
  id: string
  name: string
  status: 'idle' | 'active' | 'error'
  createdAt: string
}

export default function AgentPage() {
  const router = useRouter()
  const [agents, setAgents] = useState<Agent[]>([])

  const handleAgentSelect = (agent: Agent) => {
    // Store selected agent in sessionStorage for main page
    sessionStorage.setItem('selectedAgent', JSON.stringify(agent))
    sessionStorage.setItem('agents', JSON.stringify(agents))
    router.push('/app/main')
  }

  const handleAgentCreate = (agentData: { name: string }) => {
    const newAgent: Agent = {
      id: Date.now().toString(),
      name: agentData.name,
      status: 'idle',
      createdAt: new Date().toISOString(),
    }
    setAgents(prev => [...prev, newAgent])
  }

  const handleContinue = () => {
    sessionStorage.setItem('agents', JSON.stringify(agents))
    router.push('/app/main')
  }

  return (
    <AgentSelector 
      agents={agents}
      onSelect={handleAgentSelect}
      onCreateAgent={handleAgentCreate}
      onContinue={handleContinue}
    />
  )
}