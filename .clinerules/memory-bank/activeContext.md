# Active Context

## Current Work Focus
Backend API server for AI model loading with SSE progress tracking. QVAC integration planned but not yet implemented.

## Landing Page Structure
```
/ → Landing page
  - Nav with wordmark + ENTER APP button
  - Hero section with headline + 2 CTA buttons (GET STARTED, LEARN MORE)
  - Supported Models ticker (animated, sliding left)
  - How It Works steps section (01, 02, 03)
  - CLI Commands section: "Run Agent With" + copyable textbox + ENTER APP button
  - Footer CTA + Footer
  - Animated orbs (right side, fade on scroll)
  - Cyan left edge accent bar (moves with scroll)

/app → App Flow
  - ServerSelector (enter server URL)
  - ModelSelector (choose + load model with progress bar)
  - LoadingScreen (shows progress via SSE)
  - MainScreen (dashboard with stats, agents, sidebar nav)
  - SettingsModal (glassmorphism modal, opened from sidebar)
```

## /app Layout
```
┌──────────────────────────────────────────────────┐
│                                 [CONNECT WALLET] │  ← TopNavBar (top-right, floating)
└──────────────────────────────────────────────────┘
┌──────────┐
│Predict   │  ┌───────────────────────────────────┐
│Station   │  │                                   │
│──────────│  │ Dashboard / Agents / Markets /    │
│Dashboard │  │ Settings (modal)                  │
│Agents    │  │                                   │
│Markets   │  └───────────────────────────────────┘
│Settings  │
└──────────┘
        ↑
   Floating sidebar (left, glassmorphism)
```

## Design Elements
- Orbs fixed position on right side, fade on scroll
- Cyan left edge accent bar moves on scroll
- Floating UI elements (sidebar, TopNavBar)
- Glassmorphism buttons: `rgba(255,255,255,0.04)`, `backdropFilter: blur(20px)`, `border: rgba(180,200,255,0.12)`
- Same color scheme: CYAN (#3EC4C0), NAVY (#03063a), BLUE (#1A1AE8)
- Space Mono for headings, DM Sans for body
- borderRadius: 16 for glassmorphism elements

## Routes
- `/` - Landing page (src/app/page.tsx)
- `/app` - App flow with ServerSelector → ModelSelector → MainScreen

## State Management
- `serverUrl` - API server URL (localStorage + state)
- `selectedModel` - Currently selected model type
- `showServerSelector` / `showModelSelector` - View state
- `showSettings` - Settings modal visibility
- `activeNav` - Current nav item (dashboard/agents/markets/leaderboard)
- `agents` - List of agents

## Backend API (port 3001)
- GET/POST /api/models - Model list/load
- GET /api/models/status - Model status
- GET /api/models/load/progress - SSE progress stream
- POST /api/chat - Streaming chat completion
- CRUD /api/agents, /api/sessions, /api/tools

## Important Patterns
- Use 'use client' for interactive components
- Keep components in src/components/
- Pages in src/app/
- Theme constants in src/theme.ts
- lucide-react for icons
- Inline styles with CSS-like properties
- SSE for real-time progress updates

## Recent Changes
- Added AgentsPage with dropdown selector + tabs (Overview/Sessions)
- Added ChatModal with glassmorphism design
- Streaming thinking display inside chat panel (above assistant message)
- Fixed stale closure bug - messages now save correctly using useRef