# MacroTrack

A full-stack macro nutrition tracking app inspired by MacroFactor.

**Live demo → [macroapp-nine.vercel.app](https://macroapp-nine.vercel.app)**

## Features

- Personalized BMR, TDEE, and macro targets using the Mifflin-St Jeor equation
- Natural language food input — type `2 yumurta, 80g yulaf, 150g tavuk` and get instant macro breakdown
- Daily food logging with Turkish + English food catalog
- EMA-based weight trend tracking with visual chart
- JWT authentication with per-user data isolation
- Turkish and English UI support

## Architecture

pnpm monorepo with a clean separation between domain logic and platform code.

```
macrotrack/
├── apps/
│   ├── web/          # React + TypeScript + Vite
│   └── api/          # Express + TypeScript + PostgreSQL
└── packages/
    └── core/         # Platform-agnostic domain logic
```

### packages/core

All business logic lives here with zero UI or platform dependencies:

- BMR, TDEE, and macro target calculations
- EMA-based weight trend algorithm
- Food parsing engine with Turkish and English catalog

This package is consumed by both `apps/web` and `apps/api`. A future React Native app would use the same core without any changes.

### apps/api

REST API built with Express and TypeScript:

- JWT authentication (register / login)
- Profile management — returns calculated BMR/TDEE/macros
- Food and weight entry CRUD
- PostgreSQL via Drizzle ORM

### apps/web

React frontend:

- Zustand for state management
- Zod for form validation
- Recharts for weight trend visualization
- Syncs with API when authenticated, falls back to localStorage

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| State | Zustand |
| Validation | Zod |
| Backend | Express, TypeScript |
| Database | PostgreSQL, Drizzle ORM |
| Auth | JWT, bcrypt |
| Monorepo | pnpm workspaces, Turborepo |
| Testing | Vitest |
| Deploy | Vercel (web), Railway (api + db) |

## Running Locally

```bash
pnpm install
pnpm dev
```

Create `apps/api/.env`:

```
DATABASE_URL=your_postgres_url
JWT_SECRET=your_secret
```

Run core tests:

```bash
pnpm --filter @macro/core test
```

## Why This Architecture

Most nutrition apps are monolithic. This project treats domain logic as a first-class package so it can be shared across platforms without duplication. The same calculation that runs in the browser runs in the API — tested once, used everywhere.
