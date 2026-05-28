import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import '../types/api';

// Re-export AIModel for convenience
export type AIModel = '1.7B' | '4B';

interface AIContextType {
  aiEnabled: boolean;
  aiModel: AIModel;
  isLoading: boolean;
  error: string | null;
  // Welcome modal state
  showWelcomeModal: boolean;
  setShowWelcomeModal: (show: boolean) => void;
  welcomeDismissed: boolean;
  // Actions
  enableAI: (model: AIModel) => Promise<boolean>;
  disableAI: () => Promise<boolean>;
  refreshStatus: () => Promise<void>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

const WELCOME_DISMISSED_KEY = 'localbook_welcome_dismissed';

export function AIProvider({ children }: { children: ReactNode }) {
  const [aiEnabled, setAiEnabled] = useState<boolean>(false);
  const [aiModel, setAiModel] = useState<AIModel>('1.7B');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Welcome modal state
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(false);
  const [welcomeDismissed, setWelcomeDismissed] = useState<boolean>(false);

  // Get AI status from backend
  const refreshStatus = useCallback(async () => {
    try {
      const status = await window.api.ai.getStatus();
      setAiEnabled(status.isReady);
      setAiModel(status.modelType || '1.7B');
      setIsLoading(false);
      setError(null);
      
      // Show welcome modal if AI is not enabled and not dismissed
      if (!status.isReady && !welcomeDismissed) {
        setShowWelcomeModal(true);
      }
    } catch (e) {
      console.error('Failed to get AI status:', e);
      setError(e instanceof Error ? e.message : 'Failed to get AI status');
      setIsLoading(false);
    }
  }, [welcomeDismissed]);

  // Initial load
  useEffect(() => {
    // Check if welcome was dismissed before
    const dismissed = localStorage.getItem(WELCOME_DISMISSED_KEY) === 'true';
    setWelcomeDismissed(dismissed);
    
    refreshStatus();
  }, [refreshStatus]);

  const handleSetShowWelcomeModal = useCallback((show: boolean) => {
    setShowWelcomeModal(show);
    
    // If dismissing, save to localStorage
    if (!show) {
      localStorage.setItem(WELCOME_DISMISSED_KEY, 'true');
      setWelcomeDismissed(true);
    }
  }, []);

  const enableAI = useCallback(async (model: AIModel): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await window.api.ai.selectModel(model);
      
      if (result.success) {
        setAiModel(model);
        setAiEnabled(true);
        setShowWelcomeModal(false);
        setIsLoading(false);
        return true;
      } else {
        setError(result.error || 'Failed to enable AI');
        setIsLoading(false);
        return false;
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to enable AI';
      setError(message);
      setIsLoading(false);
      return false;
    }
  }, []);

  const disableAI = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await window.api.ai.unloadModel();
      
      if (result.success) {
        setAiEnabled(false);
        setIsLoading(false);
        return true;
      } else {
        setError(result.error || 'Failed to disable AI');
        setIsLoading(false);
        return false;
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to disable AI';
      setError(message);
      setIsLoading(false);
      return false;
    }
  }, []);

  return (
    <AIContext.Provider value={{ 
      aiEnabled, 
      aiModel, 
      isLoading,
      error,
      showWelcomeModal,
      setShowWelcomeModal: handleSetShowWelcomeModal,
      welcomeDismissed,
      enableAI, 
      disableAI,
      refreshStatus 
    }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}