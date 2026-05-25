# Active Context

## Current Work Focus
Frontend routing migration - consolidated to single `/app` route with content switching.

## Frontend Routing (Option A - Hybrid)
```
/app/app/
├── layout.tsx         ← TopNavBar + Sidebar wrapper
├── page.tsx           ← Dashboard, Settings, Markets, Analytics (content switch)
└── agents/
    ├── page.tsx       ← AgentSelector (separate route)
    └── [slug]/page.tsx ← AgentDetail (dynamic route)
```

## Sidebar Navigation
- **Dashboard/Settings/Markets/Analytics** → `router.push('/app')` + `setActiveNav(id)`
- **Agents** → `router.push('/app/agents')` + `setActiveNav('agents')`
- **Pathname Sync**: useEffect syncs activeNav with pathname

## Key Patterns
- Glassmorphism styling: `backdropFilter: blur(20px)`, `rgba(255,255,255,0.04)`
- Cyan (#3EC4C0) accent color
- Mono font for labels, Sans font for body
- activeNav state from AppProvider for sidebar
- step state: 'loading-model' | 'connected' | 'disconnected'

## Recent Changes
- Migrated from separate routes (dashboard, settings, agents, etc.) to single `/app` route
- Sidebar now uses router.push for Dashboard/Settings/Markets/Analytics + useEffect for pathname sync
- Agents have separate routes: `/app/agents` (list) and `/app/agents/:slug` (detail)
- `/pages/` directory deleted (legacy page components)
- `/components/onboarding/` directory deleted

## Chat Modal Fixes
- **Double thinking box**: Fixed - only shows for last assistant message during generation
- **Thinking persists**: Fixed - clears when stream ends (`isGenerating` = false)
- **Messages persist**: Fixed - saves to backend via `api.sessions.saveMessages()` after response

## Connection Error Display
Both ConnectNodeModal and ServerModal show connection errors:
```jsx
{connectionError && (
  <div style={{ padding: 10, background: 'rgba(255,100,100,0.15)', ... }}>
    ⚠️ {connectionError}
  </div>
)}
```

## Settings Page Structure
```
Settings/
├── NodeConfigTab.tsx    # Node configuration inputs
├── WalletTab.tsx        # Wallet status + reveal seed
├── ModelTab.tsx         # AI model type + temperature
├── DataTab.tsx          # Export/Import/Clear buttons
├── NotificationsTab.tsx # Toggle switch
├── ServerModal.tsx      # Server selection modal
├── RevealModal.tsx      # Seed phrase reveal modal
└── Settings.tsx         # Main component (tabs + layout)
```

## API Endpoints for Chat
- `POST /api/chat` - SSE streaming (tokens, thinking, done)
- `GET /api/sessions/:agentSlug/:sessionSlug` - Load messages
- `POST /api/sessions/:agentSlug/:sessionSlug/messages` - Save messages