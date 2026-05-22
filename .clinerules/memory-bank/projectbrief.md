# Predict Station - Project Brief

## Overview
Predict Station is a prediction platform that migrated from an Electron app to a Next.js-based architecture.

## Project Structure
```
predict-station/
├── bot/           # NPM CLI package (published as predict-station)
└── frontend/      # Next.js web application
```

## Core Goals
1. Maintain a CLI tool at root level for easy NPM publishing (`npx predict-station`)
2. Migrate the existing Electron app into the Next.js frontend
3. Keep the CLI minimal - focus primarily on frontend development

## Key Decisions
- Monorepo structure with CLI (bot/) and frontend (frontend/) as separate packages
- CLI uses Node.js 18+ with commander and chalk for styling
- Frontend uses Next.js 14, React 18, TypeScript, and Tailwind CSS