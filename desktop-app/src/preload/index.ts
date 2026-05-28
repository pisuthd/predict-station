import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  wallet: {
    generateMnemonic: () => ipcRenderer.invoke('wallet:generateMnemonic'),
    createWallet: (seedPhrase?: string) => ipcRenderer.invoke('wallet:createWallet', seedPhrase),
    restoreWallet: (seedPhrase: string) => ipcRenderer.invoke('wallet:restoreWallet', seedPhrase),
    getStatus: () => ipcRenderer.invoke('wallet:getStatus'),
    getAddress: () => ipcRenderer.invoke('wallet:getAddress'),
    initializeFromStored: () => ipcRenderer.invoke('wallet:initializeFromStored'),
    deleteWallet: () => ipcRenderer.invoke('wallet:deleteWallet'),
    validateSeedPhrase: (seedPhrase: string) => ipcRenderer.invoke('wallet:validateSeedPhrase', seedPhrase),
    isEncryptionAvailable: () => ipcRenderer.invoke('wallet:isEncryptionAvailable'),
    revealSeedPhrase: () => ipcRenderer.invoke('wallet:revealSeedPhrase'),
    getWalletPath: () => ipcRenderer.invoke('wallet:getWalletPath'),
  },
  ai: {
    getStatus: () => ipcRenderer.invoke('ai:getStatus'),
    getModels: () => ipcRenderer.invoke('ai:getModels'),
    selectModel: (modelType: '4B' | '1.7B') => ipcRenderer.invoke('ai:selectModel', modelType),
    unloadModel: () => ipcRenderer.invoke('ai:unloadModel'),
    // Send message to main process
    sendMessage: (history: { role: string; content: string }[], message: string) =>
      ipcRenderer.send('ai:sendMessage', history, message),
    // Send message with tools (for form assistant)
    sendMessageWithTools: (history: { role: string; content: string }[], message: string, tools: any[]) =>
      ipcRenderer.send('ai:sendMessageWithTools', history, message, tools),
    // Streaming token listeners
    onStreamToken: (callback: (token: string) => void) => {
      ipcRenderer.on('ai:streamToken', (_event, token) => callback(token));
    },
    removeStreamTokenListener: (callback: (...args: any[]) => void) => {
      ipcRenderer.removeListener('ai:streamToken', callback);
    },
    // Streaming thinking listeners
    onStreamThinking: (callback: (token: string) => void) => {
      ipcRenderer.on('ai:streamThinking', (_event, token) => callback(token));
    },
    removeStreamThinkingListener: (callback: (...args: any[]) => void) => {
      ipcRenderer.removeListener('ai:streamThinking', callback);
    },
  },
  sessions: {
    list: () => ipcRenderer.invoke('sessions:list'),
    create: (name: string) => ipcRenderer.invoke('sessions:create', name),
    delete: (sessionSlug: string) => ipcRenderer.invoke('sessions:delete', sessionSlug),
    get: (sessionSlug: string) => ipcRenderer.invoke('sessions:get', sessionSlug),
    ensureMain: () => ipcRenderer.invoke('sessions:ensureMain'),
    saveMessages: (sessionSlug: string, messages: unknown[]) =>
      ipcRenderer.invoke('sessions:saveMessages', sessionSlug, messages),
    loadMessages: (sessionSlug: string) => ipcRenderer.invoke('sessions:loadMessages', sessionSlug),
    getAllSessions: () => ipcRenderer.invoke('sessions:getAllSessions'),
  },
  cli: {
    checkVersion: (cliName: string) => ipcRenderer.invoke('cli:checkVersion', cliName),
    getAllVersions: () => ipcRenderer.invoke('cli:getAllVersions'),
    checkWallet: () => ipcRenderer.invoke('cli:checkWallet'),
    deploySite: (options: { 
      epochs: number; 
      network?: string;
      formName?: string;
      formFields?: unknown[];
      formDescription?: string;
      template?: 'sui-wallet' | 'zklogin';
    }) =>
      ipcRenderer.invoke('cli:deploySite', options),
  },
  deployments: {
    getAll: () => ipcRenderer.invoke('deployments:getAll'),
    get: (deploymentSlug: string) => ipcRenderer.invoke('deployments:get', deploymentSlug),
    save: (data: {
      slug: string;
      network: string;
      epochs: number;
      formName: string;
      formFields: unknown[];
      creatorAddress: string;
      siteObjectId?: string | null;
      portalUrl?: string | null;
    }) => ipcRenderer.invoke('deployments:save', data),
    delete: (deploymentSlug: string) => ipcRenderer.invoke('deployments:delete', deploymentSlug),
    update: (deploymentSlug: string, updates: { epochs?: number; expiresAt?: string }) => 
      ipcRenderer.invoke('deployments:update', deploymentSlug, updates),
    import: (data: {
      version: string;
      exportedAt: string;
      form: { name: string; fields: unknown[] };
    }) => ipcRenderer.invoke('deployments:import', data),
  },
  submissions: {
    getOwned: (options: { address: string; network?: 'testnet' | 'mainnet' }) =>
      ipcRenderer.invoke('submissions:getOwned', options),
    getBySlug: (options: { address: string; slug: string; network?: 'testnet' | 'mainnet' }) =>
      ipcRenderer.invoke('submissions:getBySlug', options),
  },
  form: {
    // Form fields store (for AI tools)
    getFields: () => ipcRenderer.invoke('form:getFields'),
    setFields: (fields: unknown[]) => ipcRenderer.invoke('form:setFields', fields),
    addField: (field: unknown) => ipcRenderer.invoke('form:addField', field),
    updateField: (id: string, updates: unknown) => ipcRenderer.invoke('form:updateField', id, updates),
    removeField: (id: string) => ipcRenderer.invoke('form:removeField', id),
  },
  logs: {
    getRecent: (lines: number = 50) => ipcRenderer.invoke('logs:getRecent', lines),
    getPath: () => ipcRenderer.invoke('logs:getPath'),
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}