# Tech Context

## Technologies Used

### CLI (root level)
- **Node.js**: 18.0.0+
- **Runtime**: ES Modules (ESM)
- **Files**:
  - package.json (at root)
  - src/cli.js (entry point)
- **Dependencies**:
  - commander@12.0.0 (CLI framework)
  - chalk@5.3.0 (terminal styling)
  - express@4.18.2 (HTTP server)
  - cors@2.8.5 (CORS middleware)
  - zod@3.22.4 (validation)

### Frontend
- **Framework**: Next.js 14.2.0
- **Language**: TypeScript 5.4
- **UI Library**: React 18.3.0
- **Animation**: framer-motion 12.x
- **Styling**: Tailwind CSS 3.4 + PostCSS + Autoprefixer

## Development Setup
```bash
# Install all dependencies (pnpm workspaces)
pnpm install

# Run frontend development server
pnpm dev

# Run backend API server
pnpm dev:server

# Build frontend for production
pnpm build

# Run CLI
npm run start
```

## Dependencies Management
- CLI packages in root package.json
- Frontend packages in frontend/package.json
- Git tracks all source files
- pnpm manages workspaces