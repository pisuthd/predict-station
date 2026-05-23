# Active Context

## Current Work Focus
App flow with server connection, model loading, and navigation.

## App Flow
```
/ → Connect to server
  - ConnectNodeModal (localhost/custom server)
  - → /app/dashboard (disconnected state)

/app → App Layout with Sidebar + TopNavBar
  - Sidebar: Dashboard, Agents, Markets, Settings
  - TopNavBar: CONNECT WALLET (placeholder)
  - Modals: ModelSelectorModal, LoadingScreenModal

/app/dashboard → Dashboard page (always accessible)
  - Connection status card
  - Quick stats (Agents, Sessions, Messages)
  - "Connect Now" button when disconnected

/app/agents → Agents page (requires connection)
  - Agent selector + "New Agent" button
  - Tabs: Overview, Sessions

/app/markets → Markets page (always accessible)
  - Coming Soon placeholder

/app/settings → Settings page (always accessible)
  - Server Connection status
  - Agent Configuration (Model, Temperature)
  - Preferences (checkboxes)

## Key Patterns
- Glassmorphism styling: `backdropFilter: blur(20px)`, `rgba(255,255,255,0.04)`
- Cyan (#3EC4C0) accent color
- Mono font for labels, Sans font for body
- activeNav state from AppProvider for sidebar
- step state: 'select-model' | 'loading-model' | 'connected' | 'disconnected'
- Only Agents page requires connection to be fully functional

## Recent Changes
- Sidebar: uses activeNav/setActiveNav instead of usePathname
- AppProvider: added activeNav and setActiveNav
- ModelSelectorModal: fire-and-forget API call (no await)
- LoadingScreenModal: SSE progress tracking
- All pages updated with glassmorphism styling