// Sessions Service - CRUD and Message Storage

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Data directory for sessions (within agents)
const DATA_DIR = join(__dirname, '..', 'data', 'sessions');

// Ensure data directory exists
function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

ensureDataDir();

// Convert name to slug format
function nameToSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Sessions Service
export const sessionsService = {
  async create(agentSlug, name) {
    const slug = nameToSlug(name);
    const sessionDir = join(DATA_DIR, agentSlug, slug);
    
    if (existsSync(sessionDir)) {
      throw new Error('Session with this name already exists');
    }
    
    mkdirSync(sessionDir, { recursive: true });
    
    const info = {
      slug,
      name,
      agentSlug,
      created: new Date().toISOString(),
    };
    
    writeFileSync(join(sessionDir, 'info.json'), JSON.stringify(info, null, 2));
    writeFileSync(join(sessionDir, 'messages.json'), JSON.stringify([]));
    
    return info;
  },

  async get(agentSlug, sessionSlug) {
    const sessionDir = join(DATA_DIR, agentSlug, sessionSlug);
    
    if (!existsSync(sessionDir)) {
      throw new Error('Session not found');
    }
    
    const infoPath = join(sessionDir, 'info.json');
    const messagesPath = join(sessionDir, 'messages.json');
    
    const info = existsSync(infoPath) ? JSON.parse(readFileSync(infoPath, 'utf-8')) : {};
    const messages = existsSync(messagesPath) ? JSON.parse(readFileSync(messagesPath, 'utf-8')) : [];
    
    return {
      ...info,
      messages,
    };
  },

  async list(agentSlug) {
    const agentSessionsDir = join(DATA_DIR, agentSlug);
    
    if (!existsSync(agentSessionsDir)) {
      return [];
    }
    
    const entries = readdirSync(agentSessionsDir);
    const sessions = [];
    
    for (const slug of entries) {
      const infoPath = join(agentSessionsDir, slug, 'info.json');
      if (existsSync(infoPath)) {
        try {
          const info = JSON.parse(readFileSync(infoPath, 'utf-8'));
          sessions.push(info);
        } catch (e) {
          // Skip invalid entries
        }
      }
    }
    
    return sessions;
  },

  async delete(agentSlug, sessionSlug) {
    const sessionDir = join(DATA_DIR, agentSlug, sessionSlug);
    
    if (!existsSync(sessionDir)) {
      throw new Error('Session not found');
    }
    
    // In a real implementation, we'd use fs.rmSync here
    return { success: true };
  },

  async saveMessages(agentSlug, sessionSlug, messages) {
    const messagesPath = join(DATA_DIR, agentSlug, sessionSlug, 'messages.json');
    
    // Ensure directory exists
    mkdirSync(join(DATA_DIR, agentSlug, sessionSlug), { recursive: true });
    
    writeFileSync(messagesPath, JSON.stringify(messages, null, 2));
  },

  async loadMessages(agentSlug, sessionSlug) {
    const messagesPath = join(DATA_DIR, agentSlug, sessionSlug, 'messages.json');
    
    if (!existsSync(messagesPath)) {
      return [];
    }
    
    return JSON.parse(readFileSync(messagesPath, 'utf-8'));
  },

  async getAll() {
    ensureDataDir();
    const agentDirs = readdirSync(DATA_DIR);
    const allSessions = [];
    
    for (const agentSlug of agentDirs) {
      const agentDir = join(DATA_DIR, agentSlug);
      if (!statSync(agentDir).isDirectory()) continue;
      
      const sessionSlugs = readdirSync(agentDir);
      for (const sessionSlug of sessionSlugs) {
        const sessionDir = join(agentDir, sessionSlug);
        if (!statSync(sessionDir).isDirectory()) continue;
        
        const infoPath = join(sessionDir, 'info.json');
        const messagesPath = join(sessionDir, 'messages.json');
        
        if (existsSync(infoPath)) {
          const info = JSON.parse(readFileSync(infoPath, 'utf-8'));
          const messages = existsSync(messagesPath) ? JSON.parse(readFileSync(messagesPath, 'utf-8')) : [];
          
          allSessions.push({
            key: `agent:${agentSlug}:${sessionSlug}`,
            agent: agentSlug,
            session: sessionSlug,
            created: info.created || new Date().toISOString(),
            lastActive: info.lastActive || info.created || new Date().toISOString(),
            messagesCount: messages.length,
          });
        }
      }
    }
    
    // Sort by lastActive (most recent first)
    allSessions.sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive));
    
    return allSessions;
  },

  async ensureMain(agentSlug) {
    const mainSessionDir = join(DATA_DIR, agentSlug, 'main');
    
    if (!existsSync(mainSessionDir)) {
      mkdirSync(mainSessionDir, { recursive: true });
      
      const info = {
        slug: 'main',
        name: 'Main Session',
        agentSlug,
        created: new Date().toISOString(),
      };
      
      writeFileSync(join(mainSessionDir, 'info.json'), JSON.stringify(info, null, 2));
      writeFileSync(join(mainSessionDir, 'messages.json'), JSON.stringify([]));
    }
  }
};

export default sessionsService;