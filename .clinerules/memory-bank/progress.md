# Progress

## What Works ✅
- Monorepo structure with CLI and frontend
- CLI with init/start commands
- Next.js routing structure:
  - `/` - Landing page
  - `/app` - App flow (loading → main)
- Landing page with:
  - Nav with wordmark + ENTER APP button
  - Hero section with animated orbs
  - Supported Models ticker (animated, sliding left)
  - How It Works section (3 steps)
  - CLI Commands section with copyable textbox
  - Footer CTA + Footer
  - Cyan left edge accent bar (moves with scroll)
- App flow:
  - LoadingScreen with animated progress bar
  - Full sidebar visible during loading (disabled at low opacity)
  - TopNavBar with CONNECT WALLET button (ENTER APP style)
  - MainScreen with dashboard (stats cards, agent list)
  - Placeholder pages for Agents/Markets/Settings
  - Content switching based on sidebar navigation
- Components: Sidebar, TopNavBar, OrbCanvas, Wordmark, StatusDot, PlaceholderPage
- **HTTP API Server** (Express on port 3001):
  - Models API (list, load, unload, status)
  - Chat API with SSE streaming
  - Agents API (CRUD)
  - Sessions API (CRUD, messages)
  - Tools API (list, toggle)
  - Sui wallet placeholder tools (getAddress, getBalance, getObjects)
- **Frontend API Client** (`frontend/src/lib/api.js`)
- Git repository initialized

## App Layout ✅
```
/app (Loading) → /app (Main)
  - Sidebar always visible (floating left, glassmorphism)
  - TopNavBar floating at top-right (CONNECT WALLET button)
  - Dashboard / Agents / Markets / Settings via sidebar navigation
```

## What's Left to Build 🚧
- [ ] Backend/API routes (DONE - HTTP API now)
- [ ] Connect to local AI (ollama integration)
- [ ] Prediction market integration
- [ ] Wallet connection functionality
- [ ] Full Agents/Markets/Settings pages (not just placeholders)
- [ ] QVAC SDK integration for actual AI model loading
- [ ] Update frontend to use HTTP API (LoadingScreen, MainScreen)
- [ ] Sui-specific tools implementation (real wallet integration)

## Migration Status
Electron app successfully migrated to Next.js:
- Landing page completed with all sections
- App layout with floating sidebar + TopNavBar
- LoadingScreen with progress animation
- MainScreen with dashboard stats
- Placeholder pages for remaining sections
- Design tokens preserved (CYAN, NAVY, BLUE, MUTED)
- Glassmorphism styling on all interactive elements
- **NEW**: HTTP API backend with Express (port 3001)

## Known Issues
- Next.js 14.2.0 has a security vulnerability - consider upgrading
- Framer Motion removed (using CSS transitions instead)
- QVAC SDK not installed (placeholder AI service for now)
- Frontend not yet connected to HTTP API