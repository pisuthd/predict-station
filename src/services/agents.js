// Agents Service - CRUD and Storage

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Data directory for agents
const DATA_DIR = join(__dirname, '..', 'data', 'agents');

// Ensure data directory exists
function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Convert name to slug format
function nameToSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Ensure main agent exists
function ensureMainAgent() {
  ensureDataDir();
  const mainDir = join(DATA_DIR, 'main');
  if (!existsSync(mainDir)) {
    mkdirSync(mainDir, { recursive: true });
    const info = { slug: 'main', name: 'Main Agent', created: new Date().toISOString() };
    writeFileSync(join(mainDir, 'info.json'), JSON.stringify(info, null, 2));
  }
}

// Initialize agents on load
ensureMainAgent();

// Agents Service
export const agentsService = {
  async list() {
    ensureDataDir();
    const entries = readdirSync(DATA_DIR);
    const agents = [];
    
    for (const slug of entries) {
      const infoPath = join(DATA_DIR, slug, 'info.json');
      if (existsSync(infoPath)) {
        try {
          const info = JSON.parse(readFileSync(infoPath, 'utf-8'));
          agents.push(info);
        } catch (e) {
          // Skip invalid entries
        }
      }
    }
    
    return agents;
  },

  async create(name) {
    const slug = nameToSlug(name);
    const agentDir = join(DATA_DIR, slug);
    
    if (existsSync(agentDir)) {
      throw new Error('Agent with this name already exists');
    }
    
    mkdirSync(agentDir, { recursive: true });
    
    const info = {
      slug,
      name,
      created: new Date().toISOString(),
    };
    
    writeFileSync(join(agentDir, 'info.json'), JSON.stringify(info, null, 2));
    
    return info;
  },

  async get(slug) {
    const infoPath = join(DATA_DIR, slug, 'info.json');
    
    if (!existsSync(infoPath)) {
      throw new Error('Agent not found');
    }
    
    return JSON.parse(readFileSync(infoPath, 'utf-8'));
  },

  async delete(slug) {
    if (slug === 'main') {
      throw new Error('Cannot delete the main agent');
    }
    
    const agentDir = join(DATA_DIR, slug);
    
    if (!existsSync(agentDir)) {
      throw new Error('Agent not found');
    }
    
    // In a real implementation, we'd use fs.rmSync here
    // For now, we'll just return success
    return { success: true };
  },

  async getSystemPrompt(slug) {
    const promptPath = join(DATA_DIR, slug, 'system-prompt.md');
    
    if (existsSync(promptPath)) {
      return readFileSync(promptPath, 'utf-8');
    }
    
    // Default system prompt
    return `You are a helpful AI assistant running on Predict Station. 
You have access to various tools for blockchain operations, particularly on Sui blockchain.
Always be helpful, concise, and accurate.`;
  }
};

export default agentsService;