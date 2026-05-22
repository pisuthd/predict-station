# Active Context

## Current Work Focus
Adding landing page before loading screen.

## Recent Changes
- Added LandingPage component with hero section (split layout)
- Animated orbs on right side of hero
- Features section with 3 cards (AI Agents, Real-time Data, Private & Local)
- "How It Works" section with 3 steps
- Footer CTA section
- Updated app flow: Landing → Loading → Agent Selector → Main Screen

## App Flow
```
Landing Page → Loading Page → Agent Selector → Main Screen
```

## Design Elements
- Split layout: Text on left (45%), orbs on right (55%)
- Same color scheme: CYAN (#3EC4C0), NAVY (#03063a), BLUE (#1A1AE8)
- Space Mono for headings, DM Sans for body
- "ENTER APP" button in nav and CTA buttons in hero
- Features: 🤖 AI Agents, 📊 Real-time Data, 🔒 Private & Local
- Steps: Create AI Agent → Configure Markets → Deploy & Monitor

## Current State
- Landing page with full design implemented
- All pages connected in flow
- Next.js App Router with state management

## Important Patterns
- Use 'use client' for interactive components
- Keep components in src/components/
- Pages in src/pages/
- Theme constants in src/theme.ts