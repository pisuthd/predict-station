# System Patterns

## Architecture
```
predict-station/
├── package.json           # CLI Package (bin: src/cli.js)
├── src/
│   └── cli.js            # CLI entry point
├── frontend/            # Next.js Application
│   ├── src/
│   │   ├── app/         # App Router pages
│   │   │   ├── page.tsx # Home page
│   │   │   ├── layout.tsx # Root layout
│   │   │   └── globals.css
│   │   ├── components/  # Reusable components
│   │   └── lib/         # Utility functions
│   ├── public/          # Static assets
│   └── package.json
└── .clinerules/         # Memory Bank
```

## Key Technical Decisions
1. **CLI at root**: package.json at root with src/cli.js entry point
2. **Frontend separate**: Next.js app in frontend/ folder
3. **App Router**: Using Next.js 14 App Router for frontend
4. **TypeScript**: Strict mode enabled for type safety
5. **Tailwind**: Utility-first CSS for styling

## CLI Structure
- package.json: root level, bin points to src/cli.js
- src/cli.js: commander-based CLI with init/start commands

## Component Structure
- Pages: frontend/src/app/page.tsx (index), src/app/[slug]/page.tsx (dynamic)
- Components: frontend/src/components/Button.tsx, etc.
- Layouts: frontend/src/app/layout.tsx wraps all pages

## API Patterns
- Route handlers: frontend/src/app/api/route.ts
- RESTful endpoints under /api/