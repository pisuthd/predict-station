// Global API type declarations

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface SessionInfo {
  key: string;
  session: string;
  created: string;
  lastActive: string;
  messagesCount: number;
}

export type AIModel = '1.7B' | '4B';

export interface CLIVersionResult {
  found: boolean;
  version: string | null;
  error: string | null;
}

export interface CLIVersions {
  sui: CLIVersionResult;
  walrus: CLIVersionResult;
  siteBuilder: CLIVersionResult;
}

export interface WalletCheckResult {
  cliInstalled: boolean;
  network: string | null;
  address: string | null;
  suiBalance: number | null;
  walBalance: number | null;
  errors: string[];
}

export interface DeployResult {
  success: boolean;
  slug: string;
  siteObjectId: string | null;
  portalUrl: string | null;
  output: string;
  error?: string;
}

export interface DeploymentInfo {
  slug: string;
  network: string;
  deployedAt: string;
  epochs: number;
  expiresAt: string;
  formName: string;
  formFields: unknown[];
  creatorAddress: string;
  siteObjectId: string | null;
  portalUrl: string | null;
}

export interface AIStatus {
  isReady: boolean;
  modelId: string | null;
  modelType: AIModel | null;
}

export interface SubmissionData {
  blobId: string;
  objectId: string;
  slug: string;
  formName: string;
  submittedAt: string;
  responses: Record<string, unknown>;
}

export interface SubmissionsResult {
  success: boolean;
  submissions: SubmissionData[];
  error?: string;
}

declare global {
  interface Window {
    api: {
      wallet: {
        generateMnemonic: () => Promise<string>;
        createWallet: (seedPhrase?: string) => Promise<string>;
        restoreWallet: (seedPhrase: string) => Promise<boolean>;
        getStatus: () => Promise<{ hasWallet: boolean; isInitialized: boolean; isEncryptionAvailable?: boolean }>;
        getAddress: () => Promise<string>;
        initializeFromStored: () => Promise<boolean>;
        deleteWallet: () => Promise<boolean>;
        validateSeedPhrase: (seedPhrase: string) => Promise<boolean>;
        isEncryptionAvailable: () => Promise<boolean>;
        revealSeedPhrase: () => Promise<string>;
        getWalletPath: () => Promise<string>;
      };
      ai: {
        getStatus: () => Promise<AIStatus>;
        getModels: () => Promise<Record<AIModel, { name: string; specs: string; label: string }>>;
        selectModel: (modelType: AIModel) => Promise<{ success: boolean; modelId?: string; modelType?: AIModel; error?: string }>;
        unloadModel: () => Promise<{ success: boolean; error?: string }>;
        // Send message to trigger streaming
        sendMessage: (history: { role: string; content: string }[], message: string) => void;
        // Send message with tools (for form assistant)
        sendMessageWithTools: (history: { role: string; content: string }[], message: string, tools: unknown[]) => void;
        // Streaming token listeners
        onStreamToken: (callback: (token: string) => void) => void;
        removeStreamTokenListener: (callback: (...args: any[]) => void) => void;
        // Streaming thinking listeners
        onStreamThinking: (callback: (token: string) => void) => void;
        removeStreamThinkingListener: (callback: (...args: any[]) => void) => void;
      };
      sessions: {
        list: () => Promise<string[]>;
        create: (name: string) => Promise<{ slug: string; path: string; messagesPath: string }>;
        delete: (sessionSlug: string) => Promise<{ success: boolean }>;
        get: (sessionSlug: string) => Promise<{ slug: string; exists: boolean }>;
        ensureMain: () => Promise<{ success: boolean }>;
        saveMessages: (sessionSlug: string, messages: unknown[]) => Promise<{ success: boolean }>;
        loadMessages: (sessionSlug: string) => Promise<Message[]>;
        getAllSessions: () => Promise<SessionInfo[]>;
      };
      cli: {
        checkVersion: (cliName: string) => Promise<CLIVersionResult>;
        getAllVersions: () => Promise<CLIVersions>;
        checkWallet: () => Promise<WalletCheckResult>;
        deploySite: (options: { 
          epochs: number; 
          network?: string;
          formName?: string;
          formFields?: unknown[];
          formDescription?: string;
          template?: 'sui-wallet' | 'zklogin';
        }) => Promise<DeployResult>;
      };
      deployments: {
        getAll: () => Promise<DeploymentInfo[]>;
        get: (deploymentSlug: string) => Promise<DeploymentInfo | null>;
        save: (data: {
          slug: string;
          network: string;
          epochs: number;
          formName: string;
          formFields: unknown[];
          creatorAddress: string;
          siteObjectId?: string | null;
          portalUrl?: string | null;
        }) => Promise<{ success: boolean; deploymentSlug: string; deployedAt: string; expiresAt: string }>;
        delete: (deploymentSlug: string) => Promise<{ success: boolean }>;
        update: (deploymentSlug: string, updates: { epochs?: number; expiresAt?: string }) => Promise<{ success: boolean }>;
        import: (data: {
          version: string;
          exportedAt: string;
          deployment: {
            slug: string;
            network: string;
            epochs: number;
            formName: string;
            creatorAddress: string;
            siteObjectId: string | null;
            portalUrl: string | null;
            formFields: unknown[];
          };
        }) => Promise<{ success: boolean; slug?: string; error?: string }>;
      };
      submissions: {
        getOwned: (options: { address: string; network?: 'testnet' | 'mainnet' }) => Promise<SubmissionsResult>;
        getBySlug: (options: { address: string; slug: string; network?: 'testnet' | 'mainnet' }) => Promise<SubmissionsResult>;
      };
      form: {
        getFields: () => Promise<unknown[]>;
        setFields: (fields: unknown[]) => Promise<{ success: boolean }>;
        addField: (field: unknown) => Promise<{ success: boolean }>;
        updateField: (id: string, updates: unknown) => Promise<{ success: boolean }>;
        removeField: (id: string) => Promise<{ success: boolean }>;
      };
      logs: {
        getRecent: (lines?: number) => Promise<{ logs: string[]; file: string }[]>;
        getPath: () => Promise<string>;
      };
    };
  }
}
