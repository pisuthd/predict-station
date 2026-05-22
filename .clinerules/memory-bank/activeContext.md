# Active Context

## Current Work Focus
Next.js routing with landing page at / and app pages at /app

## Landing Page Structure
```
/ → Landing page
  - Nav with wordmark + ENTER APP button
  - Hero section with headline + copyable CLI command (textbox style)
  - Supported Models ticker (animated, sliding left)
  - How It Works steps section
  - Footer CTA + Footer
  - Animated orbs (right side, fade on scroll)

/app → redirects to /app/loading
/app/loading → LoadingScreen component
/app/agent → AgentSelector component (state via sessionStorage)
/app/main → MainLayout + MainScreen (reads state from sessionStorage)
```

## Design Elements
- Orbs fixed position on right side, fade on scroll
- Hero content transparent (no glass), CTA uses glassmorphism
- Copyable CLI command as textbox with Copy/Check icons from lucide-react
- Glassmorphism buttons: background rgba(255,255,255,0.04), backdropFilter blur(20px), border rgba(180,200,255,0.12)
- Same color scheme: CYAN (#3EC4C0), NAVY (#03063a), BLUE (#1A1AE8)
- Space Mono for headings, DM Sans for body

## Key UI Components
- Copyable command textbox: `npx predict-station init` with lucide-react icons
- Model ticker: Qwen3.2-1.6B, Qwen3.2-4B, 100% Local, Privacy First, On-Device AI
- Step numbers (01, 02, 03) in CYAN without opacity

## Routes
- `/` - Landing page (src/app/page.tsx)
- `/app` - redirects to /app/loading
- `/app/loading` - Loading screen
- `/app/agent` - Agent selection
- `/app/main` - Main dashboard

## State Management
- Agents and selectedAgent stored in sessionStorage
- Passed between /app/agent and /app/main pages

## Important Patterns
- Use 'use client' for interactive components
- Keep components in src/components/
- Pages in src/app/
- Theme constants in src/theme.ts
- lucide-react for icons