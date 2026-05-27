import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

// API types are declared globally in types/api.ts

type Network = 'mainnet' | 'testnet';

interface WalletState {
  hasWallet: boolean;
  isInitialized: boolean;
  address: string;
  isLoading: boolean;
  network: Network;
  isEncryptionAvailable: boolean;
}

interface WalletContextType extends WalletState {
  createWallet: (seedPhrase?: string) => Promise<string>;
  restoreWallet: (seedPhrase: string) => Promise<boolean>;
  deleteWallet: () => Promise<boolean>;
  generateMnemonic: () => Promise<string>;
  validateSeedPhrase: (seedPhrase: string) => Promise<boolean>;
  revealSeedPhrase: () => Promise<string>;
  refreshWallet: () => Promise<void>;
  setNetwork: (network: Network) => void;
}

const defaultState: WalletState = {
  hasWallet: false,
  isInitialized: false,
  address: '',
  isLoading: true,
  network: 'mainnet',
  isEncryptionAvailable: false,
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>(defaultState);

  const refreshWallet = useCallback(async () => {
    try {
      const status = await window.api.wallet.getStatus();
      let address = '';
      
      if (status.hasWallet) {
        try {
          address = await window.api.wallet.getAddress();
        } catch (e) {
          console.warn('Could not get address:', e);
        }
      }

      setState(prev => ({
        ...prev,
        hasWallet: status.hasWallet,
        isInitialized: status.isInitialized,
        address,
        isLoading: false,
        isEncryptionAvailable: status.isEncryptionAvailable ?? false,
      }));
    } catch (error) {
      console.error('Failed to refresh wallet:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      try {
        const status = await window.api.wallet.getStatus();
        if (status.hasWallet && !status.isInitialized) {
          await window.api.wallet.initializeFromStored();
        }
        await refreshWallet();
      } catch (error) {
        console.error('Failed to initialize wallet:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };
    init();
  }, [refreshWallet]);

  const setNetwork = useCallback((network: Network) => {
    setState(prev => ({ ...prev, network }));
  }, []);

  const generateMnemonic = useCallback(async () => {
    return window.api.wallet.generateMnemonic();
  }, []);

  const validateSeedPhrase = useCallback(async (seedPhrase: string) => {
    return window.api.wallet.validateSeedPhrase(seedPhrase);
  }, []);

  const createWallet = useCallback(async (seedPhrase?: string) => {
    const address = await window.api.wallet.createWallet(seedPhrase);
    await refreshWallet();
    return address;
  }, [refreshWallet]);

  const restoreWallet = useCallback(async (seedPhrase: string) => {
    await window.api.wallet.restoreWallet(seedPhrase);
    await refreshWallet();
    return true;
  }, [refreshWallet]);

  const deleteWallet = useCallback(async () => {
    await window.api.wallet.deleteWallet();
    setState({ ...defaultState, isLoading: false });
    return true;
  }, []);

  const revealSeedPhrase = useCallback(async () => {
    return window.api.wallet.revealSeedPhrase();
  }, []);

  const value: WalletContextType = {
    ...state,
    createWallet,
    restoreWallet,
    deleteWallet,
    generateMnemonic,
    validateSeedPhrase,
    revealSeedPhrase,
    refreshWallet,
    setNetwork,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}