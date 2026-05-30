import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react'


 
interface State {
  activeNav: string
  connectionError: string | null
}

type Action =
  | { type: 'CONNECT_ERROR'; payload: string }
  | { type: 'SET_ACTIVE_NAV'; payload: string }

// Initial State
const initialState: State = {
  activeNav: 'dashboard',
  connectionError: null
}

// Reducer
function appReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'CONNECT_ERROR':
      return { ...state, connectionError: action.payload }
    case 'SET_ACTIVE_NAV':
      return { ...state, activeNav: action.payload }
    default:
      return state
  }
}

// Context
interface AppState extends State {
  setActiveNav: (nav: string) => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)


  const setActiveNav = useCallback((nav: string) => {
    dispatch({ type: 'SET_ACTIVE_NAV', payload: nav })
  }, [])


  const value: AppState = {
    ...state,
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