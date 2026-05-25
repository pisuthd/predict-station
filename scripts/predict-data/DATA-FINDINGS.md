# Predict Protocol - Data Findings

## Overview
- **Server**: `https://predict-server.testnet.mystenlabs.com`
- **Package**: `0xf5ea2b3749c65d6e56507cc35388719aadb28f9cab873696a2f8687f5c785138`
- **Predict Object**: `0xc8736204d12f0a7277c86388a68bf8a194b0a14c5538ad13f22cbd8e2a38028a`
- **Quote Asset**: DUSDC (e95040085976bfd54a1a07225cd46c8a2b4e8e2b6732f140a0fc49850ba73e1a::dusdc::DUSDC)

## Market Statistics
- **Total Oracles**: 2,740
- **Active**: 19
- **Settled**: Most (historical)

## Available Data Per Market

### 1. Oracle/Market Info
```typescript
{
  oracle_id: string,
  underlying_asset: "BTC",
  expiry: number, // timestamp ms
  min_strike: number, // 50000000000000 = $50,000
  tick_size: number, // 1000000000
  status: "active" | "pending" | "settled"
}
```

### 2. Live Price Data
```typescript
{
  spot: number, // divide by 1e8 for USD
  forward: number,
  onchain_timestamp: number,
}
// Example: 76732204637739 / 1e8 = $767,322.05
```

### 3. Volatility (SVI Parameters)
```typescript
{
  a: number,      // volatility amplitude
  b: number,      // smile curvature
  rho: number,    // skew
  m: number,      // shift
  sigma: number,  // ATM vol
}
// Use for implied odds calculation
```

### 4. Historical Prices
```typescript
// GET /oracles/:id/prices?limit=N
{
  spot: number,
  forward: number,
  onchain_timestamp: number
}
// Shows price movement over time for charts
```

### 5. Trade History (Minted Ranges)
```typescript
{
  lower_strike: number,  // e.g., 74000000000000 = $74,000
  higher_strike: number, // e.g., 75000000000000 = $75,000
  quantity: number,
  cost: number,          // DUSDC paid
  ask_price: number,     // implied odds (cost/quantity)
}
// Example: cost=743369, quantity=1000000 => $0.74 per unit
```

### 6. LP/Vault Data
```typescript
// GET /predicts/:id/vault/summary
// GET /lp/supplies
{
  amount: number,      // DUSDC supplied
  shares_minted: number,
  supplier: address
}
// Sum all supplies for total vault TVL
```

## What to Show on Market Cards

### Front of Card (Summary View)
```
┌──────────────────────────────────────┐
│  BTC                                  │
│  Ends in 1h 23m                      │
│                                       │
│  $76,705.32  ↑ $76,732.17            │
│  Spot        Forward                 │
│                                       │
│  ════════════════════════════════     │
│  Vol: 2.4%    TVL: $450K             │
│                                       │
│  [  ACTIVE  ]      [ Trade → ]      │
└──────────────────────────────────────┘
```

### Key Metrics:
| Metric | Source | Format |
|--------|--------|--------|
| Current Price | `latest_price.spot / 1e8` | $XX,XXX.XX |
| Forward Price | `latest_price.forward / 1e8` | $XX,XXX.XX |
| Time to Expiry | `oracle.expiry - now` | "2h 30m" |
| Volatility | SVI params | "2.4%" (sigma/1e6) |
| Vault TVL | Sum of LP supplies | "$450K" |
| Open Interest | Sum of minted quantities | units |

### Back of Card (Settled Markets)
```
┌──────────────────────────────────────┐
│  BTC                                  │
│  Settled May 22, 2026                 │
│                                       │
│  Settlement: $74,909.98               │
│  ─────────────────────────            │
│  You predicted: UP ✗                 │
│  Result: BTC < $76,000 = WIN          │
│                                       │
│  [  SETTLED  ]       [ View → ]      │
└──────────────────────────────────────┘
```

## Trade Modal Data

### Strike Selection
- Show strike grid from `min_strike` to `spot * 1.1`
- Filter strikes within range (74000-80000 for $74K-$80K)
- Calculate implied odds from ask_price

### Position Builder
```
Selected Range: $74,000 - $75,000

Quantity (units): [_______]

Cost: $743.37 DUSDC
Potential Payout: $1,000 DUSDC
Implied Odds: 74.3%
Profit if UP: +$256.63 (+34.5%)
```

### Data Needed for Trade:
```typescript
{
  oracle_id: string,
  lower_strike: number,
  higher_strike: number,
  quantity: number,
  // Ask price = cost / quantity
}
```

## API Endpoints Summary

| Endpoint | Purpose |
|----------|---------|
| `GET /predicts/:id/oracles` | All markets list |
| `GET /oracles/:id/state` | Prices + SVI + status |
| `GET /oracles/:id/prices` | Historical price chart |
| `GET /oracles/:id/svi` | Volatility history |
| `GET /predicts/:id/vault/summary` | Vault stats |
| `GET /ranges/minted` | Recent trades for OI |
| `GET /lp/supplies` | LP activity |

## Implementation Order

1. **Fetch oracles** → filter active → display cards
2. **Add price display** → format spot/forward
3. **Add countdown timer** → calculate expiry
4. **Add volatility indicator** → from SVI
5. **Add vault TVL** → sum LP supplies
6. **Add trade modal** → strike selection + cost
7. **Add portfolio** → user positions via manager