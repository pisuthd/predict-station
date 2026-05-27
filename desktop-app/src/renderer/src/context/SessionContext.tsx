import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

// Types are declared in ../types/api.ts which is imported for side effects
import '../types/api';

export interface SessionInfo {
  key: string;
  session: string;
  created: string;
  lastActive: string;
  messagesCount: number;
}

interface SessionContextType {
  currentSession: string;
  setCurrentSession: (session: string) => void;
  createSession: (name: string) => Promise<string>;
  deleteSession: (session: string) => Promise<void>;
  getAllSessions: () => Promise<SessionInfo[]>;
  isReady: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [currentSession, setCurrentSessionState] = useState<string>('main');
  const [isReady, setIsReady] = useState(false);

  // Initialize on mount - ensure 'main' session exists
  useEffect(() => {
    async function initSession() {
      try {
        // Check if main exists
        const exists = await window.api.sessions.get('main');
        if (!exists.exists) {
          // Create main session
          await window.api.sessions.create('main');
        }
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize session:', error);
        // Still set ready to allow app to load
        setIsReady(true);
      }
    }
    initSession();
  }, []);

  const createSession = useCallback(async (name: string): Promise<string> => {
    const result = await window.api.sessions.create(name);
    return result.slug;
  }, []);

  const deleteSession = useCallback(async (session: string): Promise<void> => {
    await window.api.sessions.delete(session);
  }, []);

  const getAllSessions = useCallback(async (): Promise<SessionInfo[]> => {
    return await window.api.sessions.getAllSessions();
  }, []);

  const setCurrentSession = useCallback((session: string) => {
    setCurrentSessionState(session);
  }, []);

  return (
    <SessionContext.Provider value={{
      currentSession,
      setCurrentSession,
      createSession,
      deleteSession,
      getAllSessions,
      isReady,
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}