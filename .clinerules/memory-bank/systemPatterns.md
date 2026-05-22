# System Patterns

## Architecture
```
predict-station/
├── bot/                    # CLI Package
│   ├── bin/cli.js          # CLI entry point
│   └── package.json
├── frontend/              # Next.js Application
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   │   ├── page.tsx   # Home page
│   │   │   ├── layout.tsx # Root layout
│   │   │   └── globals.css
│   │   ├── components/    # Reusable components
│   │   └── lib/           # Utility functions
│   ├── public/            # Static assets
│   └── package.json
└── .clinerules/           # Memory Bank
```

## Key Technical Decisions
1. **Monorepo**: Separate packages for CLI and frontend
2. **App Router**: Using Next.js 14 App Router for frontend
3. **TypeScript**: Strict mode enabled for type safety
4. **Tailwind**: Utility-first CSS for styling

## Component Structure
- Pages: src/app/page.tsx (index), src/app/[slug]/page.tsx (dynamic)
- Components: src/components/Button.tsx, etc.
- Layouts: src/app/layout.tsx wraps all pages

## API Patterns
- Route handlers: src/app/api/route.ts
- RESTful endpoints under /api/