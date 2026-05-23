# Progress

## What Works ✅
- Monorepo structure with pnpm workspaces (root + frontend)
- CLI with commands (`npm run start`)
- HTTP API Server (Express on port 3001):
  - Models API (list, load, unload, status)
  - Chat API with SSE streaming
  - Agents API (CRUD)
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

## What's Left to Build 🚧
- [ ] QVAC SDK integration (backend only, via @qvac/sdk)
- [ ] Prediction market integration
- [ ] Wallet connection functionality
- [ ] Full Agents/Markets/Settings pages (not just placeholders)
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
└── frontend/            # Next.js app
    ├── package.json     # Frontend workspace
    └── src/             # React components
```

## Migration Status
✅ Landing page completed with all sections
✅ App layout with floating sidebar + TopNavBar
✅ ModelSelector with SSE progress tracking
✅ LoadingScreen with real progress updates
✅ HTTP API backend with Express (port 3001)
✅ pnpm workspace configuration

## Known Issues
- Next.js 14.2.0 has a security vulnerability - consider upgrading
- QVAC SDK to be integrated separately (backend only)