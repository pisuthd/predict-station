# Tech Context

## Technologies Used

### CLI (bot/)
- **Node.js**: 18.0.0+
- **Runtime**: ES Modules (ESM)
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
# Install frontend dependencies
cd frontend && npm install

# Run development server
cd frontend && npm run dev

# Build for production
cd frontend && npm run build

# CLI usage
npx predict-station init
npx predict-station start
```

## Dependencies Management
- Frontend packages in frontend/package.json
- CLI packages in bot/package.json
- Git tracks all source files