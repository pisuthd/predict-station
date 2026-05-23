// Frontend API Client for Predict Station
// Supports custom server URL via localStorage

const DEFAULT_SERVER = 'http://localhost:3001/api';

function getServerUrl() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('predict-station-server') || DEFAULT_SERVER;
  }
  return DEFAULT_SERVER;
}

export function setServerUrl(url) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('predict-station-server', url);
  }
}

export function getServerUrlStored() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('predict-station-server') || null;
  }
  return null;
}

async function fetchAPI(endpoint, options = {}) {
  const serverUrl = getServerUrl();
  // Ensure we have /api in the path
  const baseUrl = serverUrl.endsWith('/api') ? serverUrl : `${serverUrl}/api`;
  const url = `${baseUrl}${endpoint}`;
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };
  
  const response = await fetch(url, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.message || 'Request failed');
  }
  
  return response.json();
}

// API Client
export const api = {
  // Health check
  health: () => fetchAPI('/health'),
  
  // Models
  models: {
    list: () => fetchAPI('/models'),
    status: () => fetchAPI('/models/status'),
    load: (modelType) => fetchAPI('/models/load', {
      method: 'POST',
      body: JSON.stringify({ modelType }),
    }),
    unload: () => fetchAPI('/models/unload', { method: 'POST' }),
    // Listen to model loading progress via SSE
    onLoadProgress: (callback) => {
      const serverUrl = getServerUrl();
      const baseUrl = serverUrl.endsWith('/api') ? serverUrl : `${serverUrl}/api`;
      const url = `${baseUrl}/models/load/progress`;
      
      const eventSource = new EventSource(url);
      let isComplete = false;
      
      eventSource.onmessage = (event) => {
        try {
          const progress = JSON.parse(event.data);
          
          // Track completion state
          if (progress.percentage >= 100) {
            isComplete = true;
          }
          
          // Handle error state - report it and close
          if (progress.status && progress.status.startsWith('Error:')) {
            callback({ ...progress, isError: true });
            setTimeout(() => eventSource.close(), 100);
            return;
          }
          
          callback(progress);
          
          // Auto-close when loading is complete or idle
          if (isComplete || progress.status === 'idle') {
            setTimeout(() => eventSource.close(), 1000);
          }
        } catch (e) {
          // Ignore parse errors
        }
      };
      
      eventSource.onerror = () => {
        // Don't close immediately on error - let server handle it
        // Only close if we're already complete or got an error
        if (isComplete || eventSource.readyState === EventSource.CLOSED) {
          eventSource.close();
        }
      };
      
      return {
        close: () => eventSource.close(),
        isComplete: () => isComplete,
      };
    },
  },
  
  // Chat (streaming)
  chat: async (message, history = [], agentSlug, onToken, onThinking, onToolCall) => {
    const serverUrl = getServerUrl();
    const baseUrl = serverUrl.endsWith('/api') ? serverUrl : `${serverUrl}/api`;
    const response = await fetch(`${baseUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, agentSlug }),
    });
    
    if (!response.ok) {
      throw new Error('Chat request failed');
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            
            switch (data.type) {
              case 'token':
                if (onToken) onToken(data.content);
                break;
              case 'thinking':
                if (onThinking) onThinking(data.content);
                break;
              case 'toolCall':
                if (onToolCall) onToken(data.content);
                break;
              case 'done':
                return;
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }
  },
  
  // Agents
  agents: {
    list: () => fetchAPI('/agents'),
    create: (name) => fetchAPI('/agents', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
    get: (slug) => fetchAPI(`/agents/${slug}`),
    delete: (slug) => fetchAPI(`/agents/${slug}`, { method: 'DELETE' }),
  },
  
  // Sessions
  sessions: {
    list: () => fetchAPI('/sessions'),
    create: (agentSlug, name) => fetchAPI('/sessions', {
      method: 'POST',
      body: JSON.stringify({ agentSlug, name }),
    }),
    get: (agentSlug, sessionSlug) => fetchAPI(`/sessions/${agentSlug}/${sessionSlug}`),
    saveMessages: (agentSlug, sessionSlug, messages) => fetchAPI(`/sessions/${agentSlug}/${sessionSlug}/messages`, {
      method: 'POST',
      body: JSON.stringify({ messages }),
    }),
  },
  
  // Tools
  tools: {
    list: () => fetchAPI('/tools'),
    info: () => fetchAPI('/tools/info'),
    toggle: (name, enabled) => fetchAPI(`/tools/${name}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ enabled }),
    }),
  },
};

export default api;