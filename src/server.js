import express from 'express';
import cors from 'cors';
import { z } from 'zod';

// Import services
import { aiService, MODEL_INFO, setLoadProgressCallback } from './services/ai.js';
import { agentsService } from './services/agents.js';
import { sessionsService } from './services/sessions.js';
import { toolsService, getToolInfo } from './services/tools.js';

const app = express();

// Model loading progress tracking
let modelLoadProgress = { percentage: 0, status: 'idle' };

// Register progress callback with AI service
setLoadProgressCallback((progress) => {
  modelLoadProgress = progress;
});

const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// Models API
// ============================================

app.get('/api/models', (_req, res) => {
  res.json(MODEL_INFO);
});

app.get('/api/models/status', (_req, res) => {
  const status = aiService.getStatus();
  res.json(status);
});

app.post('/api/models/load', async (req, res) => {
  try {
    const schema = z.object({
      modelType: z.enum(['4B', '1.7B']).optional().default('1.7B'),
    });
    const { modelType } = schema.parse(req.body);
    const result = await aiService.loadModel(modelType);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load model';
    res.status(400).json({ success: false, error: message });
  }
});

app.post('/api/models/unload', async (_req, res) => {
  try {
    const result = await aiService.unloadModel();
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to unload model';
    res.status(400).json({ success: false, error: message });
  }
});

// SSE endpoint for model loading progress
app.get('/api/models/load/progress', (req, res) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send current progress
  res.write(`data: ${JSON.stringify(modelLoadProgress)}\n\n`);

  // Poll for updates (since SSE doesn't work with callbacks in Express)
  const interval = setInterval(() => {
    res.write(`data: ${JSON.stringify(modelLoadProgress)}\n\n`);
    
    // Close connection when loading is complete
    if (modelLoadProgress.percentage >= 100 || modelLoadProgress.status === 'idle') {
      clearInterval(interval);
      res.end();
    }
  }, 100);

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(interval);
  });
});

// ============================================
// Chat API (Streaming)
// ============================================

app.post('/api/chat', async (req, res) => {
  try {
    const schema = z.object({
      message: z.string(),
      history: z.array(z.object({ role: z.string(), content: z.string() })).optional().default([]),
      agentSlug: z.string().optional(),
    });
    const { message, history, agentSlug } = schema.parse(req.body);

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Send completion as SSE
    await aiService.complete({
      message,
      history,
      agentSlug,
      onToken: (token) => {
        res.write(`data: ${JSON.stringify({ type: 'token', content: token })}\n\n`);
      },
      onThinking: (thinking) => {
        res.write(`data: ${JSON.stringify({ type: 'thinking', content: thinking })}\n\n`);
      },
      onToolCall: (toolCall) => {
        res.write(`data: ${JSON.stringify({ type: 'toolCall', content: toolCall })}\n\n`);
      },
    });

    // Send completion signal
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process chat';
    res.status(400).json({ success: false, error: message });
  }
});

// ============================================
// Agents API
// ============================================

app.get('/api/agents', async (_req, res) => {
  try {
    const agents = await agentsService.list();
    res.json(agents);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to list agents';
    res.status(500).json({ error: message });
  }
});

app.post('/api/agents', async (req, res) => {
  try {
    const schema = z.object({
      name: z.string().min(1),
    });
    const { name } = schema.parse(req.body);
    const agent = await agentsService.create(name);
    res.json(agent);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create agent';
    res.status(400).json({ error: message });
  }
});

app.get('/api/agents/:slug', async (req, res) => {
  try {
    const agent = await agentsService.get(req.params.slug);
    res.json(agent);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Agent not found';
    res.status(404).json({ error: message });
  }
});

app.delete('/api/agents/:slug', async (req, res) => {
  try {
    await agentsService.delete(req.params.slug);
    res.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete agent';
    res.status(400).json({ error: message });
  }
});

// Sessions for specific agent
app.get('/api/agents/:agentSlug/sessions', async (req, res) => {
  try {
    const sessions = await sessionsService.list(req.params.agentSlug);
    res.json(sessions);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to list sessions';
    res.status(500).json({ error: message });
  }
});

app.post('/api/agents/:agentSlug/sessions', async (req, res) => {
  try {
    const schema = z.object({
      name: z.string().min(1),
    });
    const { name } = schema.parse(req.body);
    const session = await sessionsService.create(req.params.agentSlug, name);
    res.json(session);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create session';
    res.status(400).json({ error: message });
  }
});

app.delete('/api/agents/:agentSlug/sessions/:sessionSlug', async (req, res) => {
  try {
    await sessionsService.delete(req.params.agentSlug, req.params.sessionSlug);
    res.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete session';
    res.status(400).json({ error: message });
  }
});

// ============================================
// Sessions API
// ============================================

app.get('/api/sessions', async (_req, res) => {
  try {
    const sessions = await sessionsService.getAll();
    res.json(sessions);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to list sessions';
    res.status(500).json({ error: message });
  }
});

app.post('/api/sessions', async (req, res) => {
  try {
    const schema = z.object({
      agentSlug: z.string(),
      name: z.string().min(1),
    });
    const { agentSlug, name } = schema.parse(req.body);
    const session = await sessionsService.create(agentSlug, name);
    res.json(session);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create session';
    res.status(400).json({ error: message });
  }
});

app.get('/api/sessions/:agentSlug/:sessionSlug', async (req, res) => {
  try {
    const session = await sessionsService.get(req.params.agentSlug, req.params.sessionSlug);
    res.json(session);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Session not found';
    res.status(404).json({ error: message });
  }
});

app.post('/api/sessions/:agentSlug/:sessionSlug/messages', async (req, res) => {
  try {
    const schema = z.object({
      messages: z.array(z.any()),
    });
    const { messages } = schema.parse(req.body);
    await sessionsService.saveMessages(req.params.agentSlug, req.params.sessionSlug, messages);
    res.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save messages';
    res.status(400).json({ error: message });
  }
});

// ============================================
// Tools API
// ============================================

app.get('/api/tools', (_req, res) => {
  try {
    const tools = toolsService.getAll();
    res.json(tools);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to list tools';
    res.status(500).json({ error: message });
  }
});

app.get('/api/tools/info', (_req, res) => {
  try {
    const info = getToolInfo();
    res.json(info);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get tool info';
    res.status(500).json({ error: message });
  }
});

app.post('/api/tools/:name/toggle', (req, res) => {
  try {
    const schema = z.object({
      enabled: z.boolean(),
    });
    const { enabled } = schema.parse(req.body);
    toolsService.toggle(req.params.name, enabled);
    res.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to toggle tool';
    res.status(400).json({ error: message });
  }
});

// Error handling middleware
app.use((err, _req, res, _next) => {
  console.error('[Error]', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start server
export function startServer(port = PORT) {
  return new Promise((resolve) => {
    app.listen(port, () => {
      console.log(`[Agent Node] HTTP API server running on http://localhost:${port}`);
      resolve();
    });
  });
}

// Export for CLI integration
export { app };

// Start if run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  startServer();
}

// ============================================
// Graceful Shutdown - Unload Model on Exit
// ============================================

async function gracefulShutdown(signal) {
  console.log(`\n[Agent Node] Received ${signal}, shutting down gracefully...`);
  
  // Unload model if loaded
  try {
    const status = aiService.getStatus();
    if (status.isReady) {
      console.log('[Agent Node] Unloading model...');
      await aiService.unloadModel();
      console.log('[Agent Node] Model unloaded successfully');
    }
  } catch (error) {
    console.error('[Agent Node] Failed to unload model:', error);
  }
  
  console.log('[Agent Node] Goodbye!');
  process.exit(0);
}

// Handle SIGINT (Ctrl+C) and SIGTERM
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
