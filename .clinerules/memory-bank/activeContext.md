# Active Context

## Current Work Focus
Next.js routing with landing page at / and app pages at /app

## App Routes (Refactored)
```
/ → Landing page
/app → redirects to /app/loading
/app/loading → LoadingScreen component
/app/agent → AgentSelector component (state via sessionStorage)
/app/main → MainLayout + MainScreen (reads state from sessionStorage)
```

## App Flow
```
/ (Landing) → /app (redirect) → /app/loading (Loading) → /app/agent (Select Agent) → /app/main (Dashboard)
```

## Design Elements
- Orbs fixed position on right side, fade on scroll
- Hero content transparent (no glass), CTA buttons use glassmorphism
- Glassmorphism buttons: background rgba(255,255,255,0.04), backdropFilter blur(20px), border rgba(180,200,255,0.12)
- Same color scheme: CYAN (#3EC4C0), NAVY (#03063a), BLUE (#1A1AE8)
- Space Mono for headings, DM Sans for body
- Wordmark: "Predict Station" (CYAN + white)

## Routes
- `/` - Landing page (src/app/page.tsx)
- `/app` - redirects to /app/loading
- `/app/loading` - Loading screen (src/app/app/loading/page.tsx)
- `/app/agent` - Agent selection (src/app/app/agent/page.tsx)
- `/app/main` - Main dashboard (src/app/app/main/page.tsx)

## State Management
- Agents and selectedAgent stored in sessionStorage
- Passed between /app/agent and /app/main pages

## Current State
- Landing page with full design implemented
- App flow with 3 distinct pages
- Components: Sidebar, OrbCanvas, Wordmark, StatusDot, MainLayout

## Important Patterns
- Use 'use client' for interactive components
- Keep components in src/components/
- Pages in src/app/
- Theme constants in src/theme.ts
- State shared via sessionStorage between app routes