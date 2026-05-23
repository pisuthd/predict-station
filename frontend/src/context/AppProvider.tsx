'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '../lib/api'

interface Agent {
  slug: string
  name: string
  createdAt: string
}

interface Session {
  slug: string
  name: string
  createdAt: string
}

interface AppState {
  step: 'select-model' | 'loading-model' | 'connected' | 'disconnected'
  serverUrl: string
  connect: (url: string) => void
  disconnect: () => void
  agents: Agent[]
  selectedAgent: string
  setSelectedAgent: (slug: string) => void
  refreshAgents: () => void
  sessions: Session[]
  selectedSession: string
  setSelectedSession: (slug: string) => void
  refreshSessions: (agentSlug: string) => void
  selectedModel: string
  setSelectedModel: (model: string) => void
  setStep: (step: 'select-model' | 'loading-model' | 'connected' | 'disconnected') => void
  setModelLoaded: (loaded: boolean) => void
  activeNav: string
  setActiveNav: (nav: string) => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<'select-model' | 'loading-model' | 'connected' | 'disconnected'>('disconnected')
  const [serverUrl, setServerUrl] = useState('http://localhost:3001')
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState('main')
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedSession, setSelectedSession] = useState('main')
  const [selectedModel, setSelectedModel] = useState('')
  const [activeNav, setActiveNav] = useState('dashboard')

  const connect = (url: string) => {
    setServerUrl(url)
    setStep('select-model')
  }

  const disconnect = () => {
    setStep('disconnected')
    setSelectedModel('')
  }

  const refreshAgents = async () => {
    try {
      const data = await api.agents.list()
      setAgents(data)
      if (data.length > 0 && !data.find((a: Agent) => a.slug === selectedAgent)) {
        setSelectedAgent(data[0].slug)
      }
    } catch (err) {
      console.error('Failed to fetch agents:', err)
    }
  }

  const refreshSessions = async (agentSlug: string) => {
    try {
      const data = await api.agents.listSessions(agentSlug)
      setSessions(data)
      if (data.length > 0 && !data.find((s: Session) => s.slug === selectedSession)) {
        setSelectedSession(data[0].slug)
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err)
    }
  }

  const setModelLoaded = (loaded: boolean) => {
    if (loaded) {
      setStep('connected')
      refreshAgents()
    }
  }

  return (
    <AppContext.Provider value={{
      step,
      serverUrl,
      connect,
      disconnect,
      agents,
      selectedAgent,
      setSelectedAgent,
      refreshAgents,
      sessions,
      selectedSession,
      setSelectedSession,
      refreshSessions,
      selectedModel,
      setSelectedModel,
      setStep,
      setModelLoaded,
      activeNav,
      setActiveNav,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}