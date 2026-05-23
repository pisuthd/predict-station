# System Patterns

## Architecture
```
predict-station/
├── package.json           # CLI Package (bin: src/cli.js)
├── pnpm-workspace.yaml    # pnpm workspaces config
├── src/
│   ├── package.json      # Server workspace (@predict-station/server)
│   ├── cli.js            # CLI entry point
│   ├── server.js         # Express HTTP API server (port 3001)
│   └── services/
│       ├── ai.js         # Model management (placeholder, QVAC to come)
│       ├── agents.js     # Agent CRUD & storage
│       ├── sessions.js   # Session CRUD & messages
│       └── tools.js      # Tool registry & enable/disable
├── frontend/            # Next.js Application
│   └── src/
│       ├── lib/
│       │   └── api.js    # Frontend API client
│       └── app/          # App Router pages
└── .clinerules/         # Memory Bank
```

## Backend API (port 3001)

### Models API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/models` | List supported models (Qwen3-1.7B, Qwen3-4B) |
| GET | `/api/models/status` | Check if model is loaded |
| POST | `/api/models/load` | Load model by type |
| POST | `/api/models/unload` | Unload current model |
| GET | `/api/models/load/progress` | SSE stream for loading progress |

### Chat API (Streaming SSE)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send message, stream response via SSE |

### Agents API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/agents` | List all agents |
| POST | `/api/agents` | Create new agent |
| GET | `/api/agents/:slug` | Get agent details |
| DELETE | `/api/agents/:slug` | Delete agent |

### Sessions API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sessions` | List all sessions |
| POST | `/api/sessions` | Create new session |
| GET | `/api/sessions/:agentSlug/:sessionSlug` | Get session with messages |
| POST | `/api/sessions/:agentSlug/:sessionSlug/messages` | Save messages |

### Tools API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tools` | List all tools with enabled status |
| GET | `/api/tools/info` | Get tool info for UI |
| POST | `/api/tools/:name/toggle` | Enable/disable tool |

## CLI Commands
```bash
pnpm dev              # Start frontend dev server
pnpm dev:server       # Start backend API server
pnpm build            # Build frontend
npm run start         # Show CLI help
npx predict-station init   # Initialize project
npx predict-station dev    # Start server
```

## Frontend Integration
- Frontend calls `http://localhost:3001/api/...`
- API client at `frontend/src/lib/api.js`
- Streaming via Server-Sent Events (SSE)

## Key Technical Decisions
1. **CLI at root**: package.json at root with src/cli.js entry point
2. **HTTP API in /src**: Express server with services, no TypeScript
3. **App Router**: Using Next.js 14 App Router for frontend
4. **SSE Streaming**: Chat responses and model loading progress via Server-Sent Events
5. **File-based storage**: Agents and sessions stored in data/ directory
6. **pnpm workspaces**: Separate workspaces for frontend and server