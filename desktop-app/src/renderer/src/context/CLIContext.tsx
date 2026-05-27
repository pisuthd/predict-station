import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CLIVersions } from '../types/api';

interface CLIState {
  versions: CLIVersions | null;
  isLoading: boolean;
  error: string | null;
}

interface CLIContextType extends CLIState {
  refetch: () => Promise<void>;
}

const defaultState: CLIState = {
  versions: null,
  isLoading: true,
  error: null,
};

const CLIContext = createContext<CLIContextType | undefined>(undefined);

export function CLIProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CLIState>(defaultState);

  const fetchVersions = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const versions = await window.api.cli.getAllVersions();
      setState({ versions, isLoading: false, error: null });
    } catch (error) {
      console.error('Failed to fetch CLI versions:', error);
      setState({
        versions: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch CLI versions',
      });
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const value: CLIContextType = {
    ...state,
    refetch: fetchVersions,
  };

  return (
    <CLIContext.Provider value={value}>
      {children}
    </CLIContext.Provider>
  );
}

export function useCLI() {
  const context = useContext(CLIContext);
  if (!context) {
    throw new Error('useCLI must be used within a CLIProvider');
  }
  return context;
}

// ============================================
// Wallet Environment Validation Hook
// ============================================

export interface WalletStatus {
  cliInstalled: boolean;
  versions: CLIVersions | null;
  network: string | null;
  address: string | null;
  suiBalance: number | null;
  walBalance: number | null;
  errors: string[];
  isLoading: boolean;
  error: string | null;
}

interface WalletValidationContextType {
  status: WalletStatus;
  refetch: () => Promise<void>;
  isReady: boolean;
}

const defaultWalletStatus: WalletStatus = {
  cliInstalled: false,
  versions: null,
  network: null,
  address: null,
  suiBalance: null,
  walBalance: null,
  errors: [],
  isLoading: true,
  error: null,
};

const WalletValidationContext = createContext<WalletValidationContextType | undefined>(undefined);

export function WalletValidationProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<WalletStatus>(defaultWalletStatus);

  const fetchWalletStatus = useCallback(async () => {
    setStatus(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Fetch both wallet status and CLI versions in parallel
      const [walletResult, cliVersions] = await Promise.all([
        window.api.cli.checkWallet(),
        window.api.cli.getAllVersions(),
      ]);
      
      setStatus({
        cliInstalled: walletResult.cliInstalled,
        versions: cliVersions,
        network: walletResult.network,
        address: walletResult.address,
        suiBalance: walletResult.suiBalance,
        walBalance: walletResult.walBalance,
        errors: walletResult.errors,
        isLoading: false,
        error: walletResult.errors.length > 0 ? walletResult.errors[0] : null,
      });
    } catch (error) {
      console.error('Failed to fetch wallet status:', error);
      setStatus({
        cliInstalled: false,
        versions: null,
        network: null,
        address: null,
        suiBalance: null,
        walBalance: null,
        errors: [],
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch wallet status',
      });
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchWalletStatus();
  }, [fetchWalletStatus]);

  // Check if environment is ready (all CLIs installed + wallet configured)
  const isReady = 
    status.versions?.sui.found === true &&
    status.versions?.walrus.found === true &&
    status.network !== null &&
    status.address !== null &&
    status.errors.length === 0;

  const value: WalletValidationContextType = {
    status,
    refetch: fetchWalletStatus,
    isReady: isReady ?? false,
  };

  return (
    <WalletValidationContext.Provider value={value}>
      {children}
    </WalletValidationContext.Provider>
  );
}

export function useWalletValidation() {
  const context = useContext(WalletValidationContext);
  if (!context) {
    throw new Error('useWalletValidation must be used within a WalletValidationProvider');
  }
  return context;
}