# Active Context

## Current Work Focus
Dashboard redesign - simplified header with 2-column layout showing product info + market question.

## Dashboard Header Layout
```
Left Column (Fixed):              Right Column:
[Tagline: Expiry-based...]       [Question: Will BTC be above $76,546? [BTC]]
                                [in 4d 2h]
```

### Header Components
- **Left column**: Tagline only ("Expiry-based prediction markets on Sui")
- **Right column**: 
  - Line 1: Question with BTC icon at end
  - Line 2: Expiry countdown ("in 4d 2h")
- No network dropdown
- No UP/DOWN odds in header

### PriceChart Component
- **LIVE indicator**: Pulsing cyan dot + "LIVE 2m" badge (top-left)
- **Right side labels** (compact, color-coded):
  - `$76,468 FORWARD` (white text) + InfoTooltip
  - `$76,290 STRIKE` (cyan text) + InfoTooltip
  - `+$178 +0.23% DISTANCE` (green/red based on positive/negative)
- **InfoTooltip component**: Hover info icon (?) showing explanations
- **Strike line**: Cyan dashed reference line on chart

### Time Format (detailed, no seconds)
- Uses detailed format: `4d 2h`, `1h 15m`, `12m`
- Shows largest unit + next smaller unit (no seconds)
- Same format in both left header and HotMarkets list

## HotMarkets (Right Column)
- BTC icon next to "ACTIVE MARKETS" header
- Scrollable list of active markets
- Selected market highlighted
- Detailed time format (4d 2h, 1h 15m, 12m)

## Recent Changes
- Added LIVE indicator to PriceChart (pulsing cyan dot + "LIVE 2m")
- Added InfoTooltip component for forward/strike explanations
- Changed labels: SPOT → FORWARD, FORWARD → STRIKE
- Added distance display (+$178, +0.23%)
- Updated header to 2-column layout with tagline + market summary
- Added BTC icon to question line and HotMarkets header
- Enhanced time format to show more detail (no seconds)

## Key Patterns
- Glassmorphism styling: `backdropFilter: blur(20px)`, `rgba(255,255,255,0.04)`
- Cyan (#3EC4C0) accent color
- Mono font (`Space Mono`) for labels
- BTC icon: `https://assets.coingecko.com/coins/images/1/standard/bitcoin.png?1696501400`

## API Integration
- Connects to `https://predict-server.testnet.mystenlabs.com`
- Fetches oracles, prices, and SVI parameters
- Real-time price history with 1s updates