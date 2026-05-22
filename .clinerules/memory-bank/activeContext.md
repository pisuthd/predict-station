# Active Context

## Current Work Focus
Setting up Next.js routing with landing page at / and app pages at /app

## Recent Changes
- Landing page at / (src/app/page.tsx)
- App flow at /app (src/app/app/page.tsx)
- Hero content is transparent (no glass), CTA buttons use glassmorphism
- Using Next.js useRouter for navigation
- Features section with 3 cards (AI Agents, Real-time Data, Private & Local)
- "How It Works" section with 3 steps

## App Flow
```
/ (Landing Page) → /app (Loading → Agent Selector → Main Screen)
```

## Design Elements
- Orbs centered in background (20% to 80% width)
- Hero text content is transparent/clear
- Glassmorphism buttons: background rgba(255,255,255,0.04), backdropFilter blur(20px), border rgba(180,200,255,0.12)
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