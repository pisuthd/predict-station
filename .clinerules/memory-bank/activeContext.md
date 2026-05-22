# Active Context

## Current Work Focus
Migrating Electron app to Next.js.

## Recent Changes
- Migrated all Electron renderer code to Next.js frontend
- Created pages: LoadingScreen, AgentSelector, MainScreen
- Created components: OrbCanvas, Sidebar, Wordmark, StatusDot, MainLayout
- Set up theming with CYAN (#3EC4C0), NAVY (#03063a), BLUE (#1A1AE8)

## Next Steps
1. Test the application runs correctly
2. Add any missing features from Electron app
3. Set up API routes for backend integration

## Current State
- All UI components migrated from Electron
- Using Next.js App Router
- State management with React useState
- CSS-in-JS pattern (inline styles)

## Important Patterns
- Use 'use client' for interactive components
- Keep components in src/components/
- Pages in src/pages/
- Theme constants in src/theme.ts