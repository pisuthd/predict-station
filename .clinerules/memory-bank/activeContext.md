# Active Context

## Current Work Focus
Setting up Next.js routing with landing page at / and app pages at /app

## Recent Changes
- Landing page at / (src/app/page.tsx)
- App flow at /app (src/app/app/page.tsx)
- All buttons use glassmorphism styling with backdrop-filter: blur(20px)
- Using Next.js useRouter for navigation
- Features section with 3 cards (AI Agents, Real-time Data, Private & Local)
- "How It Works" section with 3 steps

## App Flow
```
/ (Landing Page) → /app (Loading → Agent Selector → Main Screen)
```

## Design Elements
- Split layout: Text on left (45%), orbs on right (55%)
- Glassmorphism buttons: background with rgba, backdropFilter blur, subtle border
- Same color scheme: CYAN (#3EC4C0), NAVY (#03063a), BLUE (#1A1AE8)
- Space Mono for headings, DM Sans for body

## Routes
- `/` - Landing page (src/app/page.tsx)
- `/app` - App flow (src/app/app/page.tsx)
- Future: `/app/agents`, `/app/markets`, `/app/settings`

## Current State
- Landing page with full design implemented
- App page handles loading → agent selection → main screen
- Ready for adding sub-routes under /app

## Important Patterns
- Use 'use client' for interactive components
- Keep components in src/components/
- Pages in src/app/
- Theme constants in src/theme.ts