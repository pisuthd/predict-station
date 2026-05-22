// Frontend API Client for Predict Station

const API_BASE = 'http://localhost:3001/api';

async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
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
  },
  
  // Chat (streaming)
  chat: async (message, history = [], agentSlug, onToken, onThinking, onToolCall) => {
    const response = await fetch(`${API_BASE}/chat`, {
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
                if (onToolCall) onToolCall(data.content);
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