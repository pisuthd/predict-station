# Progress

## What Works ✅
- Monorepo structure with pnpm workspaces (root + frontend)
- CLI with commands (`npm run start`)
- HTTP API Server (Express on port 3001):
  - Models API (list, load, unload, status)
  - Chat API with SSE streaming
  - Agents API (CRUD + sessions)
  - Sessions API (CRUD, messages)
  - Tools API (list, toggle)
  - SSE progress endpoint for model loading
- Frontend API Client (`frontend/src/lib/api.js`)
- Next.js routing:
  - `/` - Landing page
  - `/app` - App flow (ServerSelector → ModelSelector → Dashboard)
- Landing page with all sections
- App flow with floating sidebar + TopNavBar
- ModelSelector with progress tracking via SSE
- LoadingScreen with real progress updates
- Git repository with commits

## App Layout ✅
```
/app (Loading) → /app (Main)
  - Sidebar always visible (floating left, glassmorphism)
  - TopNavBar floating at top-right (CONNECT WALLET button)
  - Dashboard / Agents / Markets / Settings via sidebar navigation
```

## Agents Page ✅
- Agent dropdown selector (shows "main (default)" suffix)
- Tabs: Overview | Sessions
- Create agent button with glass modal
- Sessions tab with create/delete sessions
- Chat modal with streaming response + thinking display

## Chat Modal ✅
- Glassmorphism design (blur backdrop)
- Message bubbles (user = cyan, assistant = white)
- **Streaming thinking** display inside chat panel (above assistant message)
- Purple/blue thinking bubble with "Thinking:" label
- Auto-scroll when content updates
- Enter to send, input disabled during generation

## Data Storage ✅
- Cross-platform: `~/.predict-station/agents/{agent}/sessions/{session}/`
- Auto-creates "main" agent with "main" session
- Messages persist per session

## What's Left to Build 🚧
- [ ] QVAC SDK integration (backend only, via @qvac/sdk)
- [ ] Prediction market integration
- [ ] Wallet connection functionality
- [ ] Markets page implementation
- [ ] Leaderboard page implementation
- [ ] Sui-specific tools implementation

## Project Structure
```
predict-station/
├── package.json          # Root CLI package
├── pnpm-workspace.yaml   # pnpm workspaces config
├── src/                  # CLI + HTTP Server
│   ├── package.json      # Server workspace
│   ├── cli.js           # CLI entry
│   ├── server.js        # Express HTTP API
│   └── services/        # Backend services
│       ├── ai.js        # AI/Model service
│       ├── agents.js    # Agent CRUD
│       ├── sessions.js  # Session CRUD
│       └── tools.js     # Tools registry
└── frontend/            # Next.js app
    ├── src/
    │   ├── app/         # App Router pages
    │   ├── components/  # React components
    │   ├── lib/         # API client
    │   ├── pages/       # Page components
    │   └── theme.ts     # Design tokens
    └── package.json
```

## Migration Status
✅ Landing page completed with all sections
✅ App layout with floating sidebar + TopNavBar
✅ ModelSelector with SSE progress tracking
✅ LoadingScreen with real progress updates
✅ HTTP API backend with Express (port 3001)
✅ pnpm workspace configuration
✅ Agents page with dropdown + tabs + chat modal
✅ Streaming thinking display (inside chat)
✅ Cross-platform data storage (~/predict-station)

## Known Issues
- Next.js 14.2.0 has a security vulnerability - consider upgrading
- QVAC SDK to be integrated separately (backend only)