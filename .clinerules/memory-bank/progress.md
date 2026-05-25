# Progress

## What Works ✅
- Monorepo structure with pnpm workspaces (root + frontend)
- CLI with commands (`npm run start`)
- Git repository with commits

## Predict Station Dashboard ✅ (New)
New dashboard at `/app/page.tsx` showing real-time prediction markets from DeepBook Predict protocol.

### Dashboard Layout
```
Left Column (Fixed):              Right Column (Scrollable):
[Question: Will BTC be above...]   [ACTIVE MARKETS header]
[in 45m]                          [#1 BTC > $77,290 — 18d 0h 16m — 52%]
[PriceChart with Live Forward]    [#2 BTC > $76,800 — 19d 2h 10m — 51%]
                                  [... more markets ...]
                                  [Active Markets: 5]
```

### Components
- **page.tsx** - Main dashboard with question + chart
- **PriceChart.tsx** - Real-time price chart with forward/ATM target
- **HotMarkets.tsx** - Scrollable list of active markets (renamed from HotMarkets)
- **useMarkets.ts** - Hook for fetching markets from API
- **useMarketPrices.ts** - Hook for real-time price history
- **utils.ts** - Formatting helpers (formatUSD, formatCountdownFull, etc.)

### Key Features
- Live Forward price with pulse animation
- ATM Target (At-The-Money strike) displayed
- Time format: "18d 0h 16m" (days, hours, minutes)
- Muted color: `rgba(180,200,255,0.6)`
- Loading indicator with pulsing cyan dot
- Market selection persists on click

### API Integration
- Connects to `https://predict-server.testnet.mystenlabs.com`
- Fetches oracles, prices, and SVI parameters
- Real-time price history with 1s updates

## What's Left to Build 🚧
- [ ] QVAC SDK integration (backend only, via @qvac/sdk)
- [ ] Wallet connection functionality
- [ ] Leaderboard page implementation
- [ ] Sui-specific tools implementation

## Project Structure
```
predict-station/
├── package.json          # Root CLI package
├── pnpm-workspace.yaml   # pnpm workspaces config
├── .clinerules/          # Memory Bank
└── frontend/             # Vite + React app
    └── src/
        ├── pages/
        │   ├── Landing.tsx
        │   └── app/
        │       ├── page.tsx        # Dashboard
        │       ├── components/
        │       │   ├── PriceChart.tsx
        │       │   ├── HotMarkets.tsx
        │       │   └── ...
        │       └── utils.ts
        ├── hooks/
        │   ├── useMarkets.ts
        │   ├── useMarketPrices.ts
        │   └── ...
        └── theme.ts
```

## Known Issues
- Next.js 14.2.0 has a security vulnerability - consider upgrading
- QVAC SDK to be integrated separately (backend only)