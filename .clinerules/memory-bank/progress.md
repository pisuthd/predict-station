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
- Landing page with all sections
- App flow with floating sidebar + TopNavBar
- Git repository with commits

## Frontend Routing ✅ (Updated)
- **Hybrid routing** (Option A):
  - `/app/page.tsx` → Dashboard, Settings, Markets, Analytics (content switch via activeNav)
  - `/app/agents/page.tsx` → AgentSelector (separate route)
  - `/app/agents/[slug]/page.tsx` → AgentDetail (dynamic route)
- Sidebar syncs with pathname via useEffect
- No separate routes for Dashboard/Settings/Markets/Analytics

## App Layout ✅
```
/app (Main Content via activeNav)
├── Dashboard (default)
├── Settings
├── Markets
├── Analytics
└── /app/agents (separate route)
    ├── AgentSelector (list)
    └── AgentDetail (/:slug)
```

## AppProvider State ✅
- `activeNav` - current sidebar navigation
- `agents` - list of agents
- `selectedAgent` - current agent slug
- `sessions` - sessions for current agent
- `step` - 'connected' | 'disconnected'

## Chat Modal ✅
- Glassmorphism design (blur backdrop)
- Message bubbles (user = cyan, assistant = white)
- **Streaming thinking** display inside chat panel (above assistant message)
- Purple/blue thinking bubble with "Thinking:" label
- Auto-scroll when content updates
- Enter to send, input disabled during generation

## Settings Page ✅
Refactored into 8 separate components:
- NodeConfigTab - Node configuration + status + connect button
- WalletTab - Wallet status + reveal seed phrase
- ModelTab - AI model type + temperature
- DataTab - Export/Import/Clear buttons
- NotificationsTab - Toggle switch
- ServerModal - Server selection with connection error display
- RevealModal - Seed phrase reveal with CONFIRM validation
- Settings.tsx - Main component (tabs + layout)

## Data Storage ✅
- Cross-platform: `~/.predict-station/agents/{agent}/sessions/{session}/`
- Auto-creates "main" agent with "main" session
- Messages persist per session

## What's Left to Build 🚧
- [ ] QVAC SDK integration (backend only, via @qvac/sdk)
- [ ] Prediction market integration
- [ ] Wallet connection functionality
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
    └── src/
        ├── app/         # App Router pages
        │   └── app/    # App section routes
        │       ├── layout.tsx
        │       ├── page.tsx       # Single route with content switch
        │       └── agents/
        │           ├── page.tsx   # Agent list
        │           └── [slug]/page.tsx # Agent detail
        ├── components/  # React components
        ├── context/     # AppProvider
        ├── lib/         # API client
        └── theme.ts     # Design tokens
```

## Known Issues
- Next.js 14.2.0 has a security vulnerability - consider upgrading
- QVAC SDK to be integrated separately (backend only)