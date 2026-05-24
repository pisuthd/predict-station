'use client'

import { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react'
import { api } from '../lib/api'

// Types
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

type Step = 'select-model' | 'loading-model' | 'connected' | 'disconnected'

interface State {
  step: Step
  serverUrl: string
  agents: Agent[]
  selectedAgent: string
  sessions: Session[]
  selectedSession: string
  selectedModel: string
  activeNav: string
  connectionError: string | null
  isConnecting: boolean
}

type Action =
  | { type: 'SET_STEP'; payload: Step }
  | { type: 'CONNECT'; payload: string }
  | { type: 'CONNECT_SUCCESS' }
  | { type: 'CONNECT_ERROR'; payload: string }
  | { type: 'DISCONNECT' }
  | { type: 'SET_AGENTS'; payload: Agent[] }
  | { type: 'SET_SELECTED_AGENT'; payload: string }
  | { type: 'SET_SESSIONS'; payload: Session[] }
  | { type: 'SET_SELECTED_SESSION'; payload: string }
  | { type: 'SET_SELECTED_MODEL'; payload: string }
  | { type: 'SET_ACTIVE_NAV'; payload: string }
  | { type: 'MODEL_LOADED' }

// Initial State
const initialState: State = {
  step: 'disconnected',
  serverUrl: 'http://localhost:3001',
  agents: [],
  selectedAgent: 'main',
  sessions: [],
  selectedSession: 'main',
  selectedModel: '',
  activeNav: 'dashboard',
  connectionError: null,
  isConnecting: false,
}

// Reducer
function appReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload }
    case 'CONNECT':
      return { ...state, serverUrl: action.payload, isConnecting: true, connectionError: null }
    case 'CONNECT_SUCCESS':
      return { ...state, step: 'select-model', isConnecting: false }
    case 'CONNECT_ERROR':
      return { ...state, step: 'disconnected', isConnecting: false, connectionError: action.payload }
    case 'DISCONNECT':
      return { ...state, step: 'disconnected', selectedModel: '', connectionError: null }
    case 'SET_AGENTS':
      return { ...state, agents: action.payload }
    case 'SET_SELECTED_AGENT':
      return { ...state, selectedAgent: action.payload }
    case 'SET_SESSIONS':
      return { ...state, sessions: action.payload }
    case 'SET_SELECTED_SESSION':
      return { ...state, selectedSession: action.payload }
    case 'SET_SELECTED_MODEL':
      return { ...state, selectedModel: action.payload }
    case 'SET_ACTIVE_NAV':
      return { ...state, activeNav: action.payload }
    case 'MODEL_LOADED':
      return { ...state, step: 'connected' }
    default:
      return state
  }
}

// Context
interface AppState extends State {
  connect: (url: string) => void
  disconnect: () => void
  refreshAgents: () => Promise<void>
  refreshSessions: (agentSlug: string) => Promise<void>
  setSelectedAgent: (slug: string) => void
  setSelectedSession: (slug: string) => void
  setSelectedModel: (model: string) => void
  setStep: (step: Step) => void
  setModelLoaded: (loaded: boolean) => void
  setActiveNav: (nav: string) => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  const connect = useCallback(async (url: string) => {
    dispatch({ type: 'CONNECT', payload: url })
    
    // Verify connection with health check
    try {
      // Small delay to let state update
      await new Promise(resolve => setTimeout(resolve, 100))
      const response = await api.health()
      if (response.status === 'ok') {
        dispatch({ type: 'CONNECT_SUCCESS' })
      } else {
        dispatch({ type: 'CONNECT_ERROR', payload: 'Server returned invalid response' })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to server'
      dispatch({ type: 'CONNECT_ERROR', payload: errorMessage })
    }
  }, [])

  const disconnect = useCallback(() => {
    dispatch({ type: 'DISCONNECT' })
  }, [])

  const refreshAgents = useCallback(async () => {
    try {
      const data = await api.agents.list()
      dispatch({ type: 'SET_AGENTS', payload: data })
      if (data.length > 0 && !data.find((a: Agent) => a.slug === state.selectedAgent)) {
        dispatch({ type: 'SET_SELECTED_AGENT', payload: data[0].slug })
      }
    } catch (err) {
      console.error('Failed to fetch agents:', err)
    }
  }, [state.selectedAgent])

  const refreshSessions = useCallback(async (agentSlug: string) => {
    try {
      const data = await api.agents.listSessions(agentSlug)
      dispatch({ type: 'SET_SESSIONS', payload: data })
      if (data.length > 0 && !data.find((s: Session) => s.slug === state.selectedSession)) {
        dispatch({ type: 'SET_SELECTED_SESSION', payload: data[0].slug })
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err)
    }
  }, [state.selectedSession])

  const setSelectedAgent = useCallback((slug: string) => {
    dispatch({ type: 'SET_SELECTED_AGENT', payload: slug })
  }, [])

  const setSelectedSession = useCallback((slug: string) => {
    dispatch({ type: 'SET_SELECTED_SESSION', payload: slug })
  }, [])

  const setSelectedModel = useCallback((model: string) => {
    dispatch({ type: 'SET_SELECTED_MODEL', payload: model })
  }, [])

  const setStep = useCallback((step: Step) => {
    dispatch({ type: 'SET_STEP', payload: step })
  }, [])

  const setModelLoaded = useCallback((loaded: boolean) => {
    if (loaded) {
      dispatch({ type: 'MODEL_LOADED' })
      refreshAgents()
    }
  }, [refreshAgents])

  const setActiveNav = useCallback((nav: string) => {
    dispatch({ type: 'SET_ACTIVE_NAV', payload: nav })
  }, [])

  // Refresh agents when connected
  useEffect(() => {
    if (state.step === 'connected') {
      refreshAgents()
    }
  }, [state.step, refreshAgents])

  const value: AppState = {
    ...state,
    connect,
    disconnect,
    refreshAgents,
    refreshSessions,
    setSelectedAgent,
    setSelectedSession,
    setSelectedModel,
    setStep,
    setModelLoaded,
    setActiveNav,
  }

  return (
    <AppContext.Provider value={value}>
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