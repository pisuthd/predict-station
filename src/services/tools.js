// Tools Service - Registry and Enable/Disable

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONFIG_PATH = join(__dirname, '..', 'data', 'tools-config.json');

// Ensure config exists
function ensureConfigExists() {
  const dataDir = join(__dirname, '..', 'data');
  if (!existsSync(dataDir)) {
    import('fs').then(fs => fs.mkdirSync(dataDir, { recursive: true }));
  }
  
  if (!existsSync(CONFIG_PATH)) {
    // Default: all tools enabled
    const defaultConfig = {};
    for (const tool of toolDefinitions) {
      defaultConfig[tool.name] = true;
    }
    writeFileSync(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2));
  }
}

// Tool definitions
const toolDefinitions = [
  // Wallet tools
  {
    name: 'getAddress',
    description: 'Get the Sui wallet address for the connected account',
    metadata: {
      uiDescription: 'Get your Sui wallet address',
      tags: ['wallet', 'sui'],
      requiredTools: [],
      packages: [],
      parameters: {},
    },
    execute: async () => {
      // Placeholder: Return mock address for now
      return JSON.stringify({ address: '0x1234567890abcdef' });
    },
  },
  {
    name: 'getBalance',
    description: 'Get the SUI balance for the connected wallet',
    metadata: {
      uiDescription: 'Check your SUI wallet balance',
      tags: ['wallet', 'sui'],
      requiredTools: [],
      packages: [],
      parameters: {},
    },
    execute: async () => {
      // Placeholder: Return mock balance
      return JSON.stringify({ balance: '1000', symbol: 'SUI' });
    },
  },
  {
    name: 'getObjects',
    description: 'Get all owned objects for the connected wallet',
    metadata: {
      uiDescription: 'View your owned Sui objects and NFTs',
      tags: ['wallet', 'sui', 'objects'],
      requiredTools: [],
      packages: [],
      parameters: {},
    },
    execute: async () => {
      // Placeholder: Return mock objects
      return JSON.stringify({ objects: [], count: 0 });
    },
  },
];

// Get tools preferences
function getToolsPreferences() {
  ensureConfigExists();
  return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
}

// Save tools preferences
function saveToolsPreferences(prefs) {
  writeFileSync(CONFIG_PATH, JSON.stringify(prefs, null, 2));
}

// Check if tool is enabled
function isToolEnabled(toolName) {
  const prefs = getToolsPreferences();
  return prefs[toolName] ?? true;
}

// Tools Service
export const toolsService = {
  getAll() {
    return toolDefinitions.map(tool => ({
      name: tool.name,
      description: tool.description,
      enabled: isToolEnabled(tool.name),
    }));
  },

  getEnabled() {
    return toolDefinitions
      .filter(tool => isToolEnabled(tool.name))
      .map(tool => ({
        name: tool.name,
        description: tool.description,
      }));
  },

  toggle(toolName, enabled) {
    const prefs = getToolsPreferences();
    prefs[toolName] = enabled;
    saveToolsPreferences(prefs);
  },

  async execute(toolName, args) {
    const tool = toolDefinitions.find(t => t.name === toolName);
    if (!tool) {
      throw new Error(`Unknown tool: ${toolName}`);
    }
    if (!isToolEnabled(toolName)) {
      throw new Error(`Tool ${toolName} is not enabled`);
    }
    return tool.execute(args);
  },
};

// Get tool info for UI
export function getToolInfo() {
  return toolDefinitions.map(tool => ({
    name: tool.name,
    description: tool.description,
    uiDescription: tool.metadata?.uiDescription || '',
    tags: tool.metadata?.tags || [],
    requiredTools: tool.metadata?.requiredTools || [],
    packages: tool.metadata?.packages || [],
    parameters: tool.metadata?.parameters || {},
  }));
}

export default toolsService;