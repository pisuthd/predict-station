# Active Context

## Current Work Focus
Landing page redesign - pivoted from Predict Station to LocalBook, supporting all DeepBook products (Spot, Margin, Predict).

## Brand: LocalBook
- Slogan: "Private Local AI for DeepBook on Sui"
- Platform to deploy local AI agents to trade on DeepBook

## Landing Page Structure
```
frontend/src/pages/
├── Landing.tsx
└── components/landing/
    ├── HeroSection.tsx      # "Mission Control for DeepBook" + CTA
    ├── SupportedModels.tsx  # Animated Qwen model banner
    ├── KeyFeatures.tsx      # "Why Traders Choose LocalBook" (6 features)
    ├── HowItWorks.tsx       # 3 Simple Steps
    ├── LocalBookDesktop.tsx  # "Your Personal AI Trading Team"
    ├── FooterCTA.tsx        # "Ready to Trade Smarter on Sui Finance?"
    └── index.ts
```

## Landing Page CTA
- Hero: TRY INTERFACE + DOWNLOAD APP
- Footer CTA: "Download LocalBook Desktop Now" + "Try the Web Interface →"
- Small text: "No signup required for web interface • Desktop app is completely free"

## Architecture
```
predict-station/
├── frontend/          # Landing page (Vite + React)
└── src/               # CLI with full app (express + react)
    ├── server.js      # Express server
    ├── cli.js         # CLI entry
    └── app/           # App pages (Chat, Dashboard, Sessions, etc.)
```

## Color Theme
- Primary: Cyan (#3EC4C0)
- Background: Navy (#0a0a1a)
- Accent: Blue/cyan gradients
- Sidebar: dark surface with cyan highlights

## Key Patterns
- Inline styles (no Tailwind in CLI app)
- Space Mono font for monospace text
- Glassmorphism effects: blur, semi-transparent backgrounds
- Cyan accent color for active states and highlights

## CLI Commands
- `npm run dev` - Start frontend dev server (landing page)
- `pnpm dev:server` - Start CLI server + app

## Flow
1. User opens `http://localhost:5173` → Landing page
2. Click "Try Interface" → Redirects to app at /app
3. Click "Download Desktop" → Download installer
4. CLI app shows main menu with sidebar navigation
