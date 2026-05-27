import { ipcMain } from 'electron';
import * as storage from './storage';

// Convert name to slug format
function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Register sessions IPC handlers
export function registerSessionsIpcHandlers(): void {
  // List all sessions
  ipcMain.handle('sessions:list', async () => {
    try {
      const sessions = storage.getSessionsList();
      return sessions;
    } catch (error) {
      console.error('Failed to list sessions:', error);
      throw error;
    }
  });

  // Create new session
  ipcMain.handle('sessions:create', async (_event, name: string) => {
    try {
      const slug = nameToSlug(name);
      
      if (storage.sessionExists(slug)) {
        throw new Error('Session with this name already exists');
      }
      
      const result = storage.createSessionFolder(slug);
      return { slug, ...result };
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  });

  // Delete session
  ipcMain.handle('sessions:delete', async (_event, sessionSlug: string) => {
    try {
      const deleted = storage.deleteSessionFolder(sessionSlug);
      
      if (!deleted) {
        throw new Error('Session not found');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to delete session:', error);
      throw error;
    }
  });

  // Get session info
  ipcMain.handle('sessions:get', async (_event, sessionSlug: string) => {
    try {
      const exists = storage.sessionExists(sessionSlug);
      return { slug: sessionSlug, exists };
    } catch (error) {
      console.error('Failed to get session:', error);
      return { slug: sessionSlug, exists: false };
    }
  });

  // Ensure main session exists
  ipcMain.handle('sessions:ensureMain', async () => {
    try {
      storage.ensureMainSession();
      return { success: true };
    } catch (error) {
      console.error('Failed to ensure main session:', error);
      throw error;
    }
  });

  // Save messages
  ipcMain.handle('sessions:saveMessages', async (_event, sessionSlug: string, messages: unknown[]) => {
    try {
      storage.saveMessages(sessionSlug, messages);
      return { success: true };
    } catch (error) {
      console.error('Failed to save messages:', error);
      throw error;
    }
  });

  // Load messages
  ipcMain.handle('sessions:loadMessages', async (_event, sessionSlug: string) => {
    try {
      return storage.loadMessages(sessionSlug);
    } catch (error) {
      console.error('Failed to load messages:', error);
      throw error;
    }
  });

  // Get all sessions with metadata (for SessionsPage)
  ipcMain.handle('sessions:getAllSessions', async () => {
    try {
      const sessions = storage.getSessionsList();
      const allSessions: {
        key: string;
        session: string;
        created: string;
        lastActive: string;
        messagesCount: number;
      }[] = [];

      for (const sessionSlug of sessions) {
        const metadata = storage.getSessionMetadata(sessionSlug);
        const messages = storage.loadMessages(sessionSlug);
        
        // Count messages
        const messagesCount = messages.length;

        allSessions.push({
          key: sessionSlug, // e.g., "main", "project-ideas" (no agent prefix)
          session: sessionSlug,
          created: metadata?.created ? metadata.created.toISOString() : new Date().toISOString(),
          lastActive: metadata?.lastActive ? metadata.lastActive.toISOString() : new Date().toISOString(),
          messagesCount,
        });
      }

      // Sort by lastActive (most recent first)
      allSessions.sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());

      return allSessions;
    } catch (error) {
      console.error('Failed to get all sessions:', error);
      throw error;
    }
  });

  console.log('Sessions IPC handlers registered');
}

// Initialize main session
export function initSessions(): void {
  storage.ensureMainSession();
}