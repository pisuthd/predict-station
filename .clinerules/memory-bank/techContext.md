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

### Frontend
- **Framework**: Next.js 14.2.0
- **Language**: TypeScript 5.4
- **UI Library**: React 18.3.0
- **Styling**: Tailwind CSS 3.4
- **Build Tool**: PostCSS + Autoprefixer

## Development Setup
```bash
# Install CLI dependencies (root)
npm install

# Install frontend dependencies
cd frontend && npm install

# Run CLI
npm run start
npx predict-station init
npx predict-station start

# Run frontend development server
cd frontend && npm run dev

# Build frontend for production
cd frontend && npm run build
```

## Dependencies Management
- CLI packages in root package.json
- Frontend packages in frontend/package.json
- Git tracks all source files