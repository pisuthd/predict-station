# LocalBook - Project Brief

## Overview
LocalBook is a platform to deploy local AI agents to trade on DeepBook (Sui blockchain). The project pivoted from Predict Station to support all DeepBook products: Spot, Margin, and Predict.

## Brand
- **LocalBook** - Private Local AI for DeepBook on Sui
- Slogan: "Mission Control for DeepBook"
- Website: Landing page with web interface + desktop app

## Project Structure
```
predict-station/
├── frontend/           # Vite + React landing page (LocalBook)
│   └── src/
│       ├── pages/Landing.tsx
│       └── components/landing/
│           ├── HeroSection.tsx
│           ├── SupportedModels.tsx
│           ├── KeyFeatures.tsx
│           ├── HowItWorks.tsx
│           ├── LocalBookDesktop.tsx
│           ├── FooterCTA.tsx
│           └── index.ts
└── src/                # CLI server + app (Express + React)
    ├── server.js       # Express HTTP API server (port 3001)
    ├── cli.js          # CLI entry point
    └── app/            # App pages (Chat, Dashboard, Sessions, etc.)
```

## Landing Page Sections
1. Hero - "Mission Control for DeepBook"
2. Supported Models - Animated Qwen model banner
3. Key Features - "Why Traders Choose LocalBook" (6 features)
4. How It Works - 3 Simple Steps
5. LocalBook Desktop - "Your Personal AI Trading Team"
6. Footer CTA - "Ready to Trade Smarter on Sui Finance?"

## DeepBook Products
- **Spot** - Sui's canonical onchain order book
- **Margin** - Leveraged positions with real-time risk monitoring
- **Predict** - Binary & Range markets with implied probabilities

## Key Decisions
- Landing page in frontend/ (Vite + React)
- CLI app in src/ (Express + React)
- LocalBook brand for all user-facing content
- DeepBook protocol for blockchain integration

## Tech Stack
- Frontend: Vite, React, TypeScript, Framer Motion
- CLI App: Express, React 18
- Fonts: Space Mono, DM Sans
- Colors: Cyan (#3EC4C0), Navy (#0a0a1a)