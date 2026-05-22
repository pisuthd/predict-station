# Active Context

## Current Work Focus
Next.js routing with landing page at / and app pages at /app

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

/app → Main App Screen
  - Loading screen first (progress bar animation)
  - Floating sidebar (left, glassmorphism) - visible during loading
  - TopNavBar floating button (top-right) - CONNECT WALLET
  - MainScreen (dashboard with stats cards, agent list)
  - Placeholder pages for Agents/Markets/Settings
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
│Dashboard │  │ Settings (placeholder)           │
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

## Key UI Components
- TopNavBar: CONNECT WALLET button (ENTER APP style, no card wrapper)
- Sidebar: Floating glassmorphism card with Predict Station branding + nav
- LoadingScreen: Progress animation with sidebar visible
- MainScreen: Stats cards, agent list, network selector
- PlaceholderPage: Generic placeholder for Agents/Markets/Settings

## Routes
- `/` - Landing page (src/app/page.tsx)
- `/app` - Main app with loading → sidebar + navbar + content switching

## State Management
- `isLoading` state in AppPage controls loading/dashboard view
- `activeNav` state controls which page content to show
- Agents stored in state, passed to MainScreen

## Important Patterns
- Use 'use client' for interactive components
- Keep components in src/components/landing/
- Pages in src/app/
- Theme constants in src/theme.ts
- lucide-react for icons
- Inline styles with CSS-like properties