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

/app → Main App Screen
  - AppHeader (wordmark + agent count)
  - AppSidebar (Dashboard, Agents, Markets, Settings tabs)
  - MainScreen (from /src/pages/MainScreen.tsx)
```

## Design Elements
- Orbs fixed position on right side, fade on scroll
- Hero: 2 CTA buttons (GET STARTED = CYAN solid, LEARN MORE = glassmorphism)
- CLI Commands section has: "Run Agent With" label + copyable textbox + ENTER APP button
- Glassmorphism buttons: background rgba(255,255,255,0.04), backdropFilter blur(20px), border rgba(180,200,255,0.12)
- Same color scheme: CYAN (#3EC4C0), NAVY (#03063a), BLUE (#1A1AE8)
- Space Mono for headings, DM Sans for body

## Key UI Components
- Copyable command textbox: `npx predict-station init` with lucide-react Copy/Check icons
- Model ticker: Qwen3.2-1.6B, Qwen3.2-4B, 100% Local, Privacy First, On-Device AI
- Step numbers (01, 02, 03) in CYAN

## Page Sections
1. Nav (wordmark + ENTER APP)
2. Hero (headline + GET STARTED + LEARN MORE)
3. Supported Models (animated ticker)
4. How It Works (3 steps)
5. CLI Commands (Run Agent With + textbox + ENTER APP)
6. Footer CTA + Footer

## Routes
- `/` - Landing page (src/app/page.tsx)
- `/app` - Main app (AppHeader + AppSidebar + MainScreen)

## State Management
- Agents stored in state
- Passed to MainScreen component

## Important Patterns
- Use 'use client' for interactive components
- Keep components in src/components/landing/
- Pages in src/app/
- Theme constants in src/theme.ts
- lucide-react for icons