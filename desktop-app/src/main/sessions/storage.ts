import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

const SESSIONS_DIR = 'sessions';

export function getSessionsBasePath(): string {
  return path.join(app.getPath('userData'), SESSIONS_DIR);
}

export function getSessionPath(sessionSlug: string): string {
  return path.join(getSessionsBasePath(), sessionSlug);
}

export function createSessionFolder(sessionSlug: string): { path: string; messagesPath: string } {
  const basePath = getSessionPath(sessionSlug);
  const messagesPath = path.join(basePath, 'messages.json');

  fs.mkdirSync(basePath, { recursive: true });

  // Initialize empty messages file
  fs.writeFileSync(messagesPath, JSON.stringify([]));

  return { path: basePath, messagesPath };
}

export function deleteSessionFolder(sessionSlug: string): boolean {
  const basePath = getSessionPath(sessionSlug);
  
  if (fs.existsSync(basePath)) {
    fs.rmSync(basePath, { recursive: true, force: true });
    return true;
  }
  
  return false;
}

export function getSessionsList(): string[] {
  const sessionsPath = getSessionsBasePath();
  
  if (!fs.existsSync(sessionsPath)) {
    return [];
  }
  
  const entries = fs.readdirSync(sessionsPath, { withFileTypes: true });
  return entries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);
}

export function sessionExists(sessionSlug: string): boolean {
  const sessionPath = getSessionPath(sessionSlug);
  return fs.existsSync(sessionPath);
}

export function ensureMainSession(): void {
  const mainSessionSlug = 'main';
  
  if (!sessionExists(mainSessionSlug)) {
    createSessionFolder(mainSessionSlug);
  }
}

export function saveMessages(sessionSlug: string, messages: unknown[]): void {
  const messagesPath = path.join(getSessionPath(sessionSlug), 'messages.json');
  fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2));
}

export function loadMessages(sessionSlug: string): unknown[] {
  const messagesPath = path.join(getSessionPath(sessionSlug), 'messages.json');
  
  if (!fs.existsSync(messagesPath)) {
    return [];
  }
  
  try {
    const content = fs.readFileSync(messagesPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

export function getSessionMetadata(sessionSlug: string): { created: Date; lastActive: Date } | null {
  const sessionPath = getSessionPath(sessionSlug);
  
  if (!fs.existsSync(sessionPath)) {
    return null;
  }
  
  try {
    const stats = fs.statSync(sessionPath);
    const messagesPath = path.join(sessionPath, 'messages.json');
    
    let lastActive = stats.ctime;
    if (fs.existsSync(messagesPath)) {
      const msgStats = fs.statSync(messagesPath);
      lastActive = msgStats.mtime;
    }
    
    return {
      created: stats.birthtime,
      lastActive: lastActive,
    };
  } catch {
    return null;
  }
}