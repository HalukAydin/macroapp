[README.md](https://github.com/user-attachments/files/26335333/README.md)
# MacroApp

A full-stack macro nutrition tracking app inspired by MacroFactor and MyFitnessPal.

**Live demo → [macroapp-nine.vercel.app](https://macroapp-nine.vercel.app)**

---

## What it does

- Create a profile and get personalized BMR, TDEE, and macro targets
- Log daily food intake and track macro progress
- Log body weight and visualize trends over time using an EMA (exponential moving average) algorithm
- Full Turkish and English language support

---

## Architecture

This is a pnpm monorepo with a deliberate separation between domain logic and platform code.

```
macroapp/
├── apps/
│   ├── web/          # React + TypeScript + Vite
│   └── api/          # Express + TypeScript + PostgreSQL
└── packages/
    └── core/         # Platform-agnostic domain logic
```

### packages/core

The core package contains all business logic with zero UI or platform dependencies:

- BMR calculation (Mifflin-St Jeor equation)
- TDEE calculation based on activity level
- Macro target calculation based on goal
- EMA-based weight trend algorithm
- Food parsing engine with Turkish and English food catalog

This package is consumed by both `apps/web` and `apps/api`. When a mobile app is added (React Native / Expo), it will use the same core package without any changes.

### apps/api

REST API built with Express and TypeScript:

- JWT authentication (register / login)
- Profile management — stores and returns calculated BMR/TDEE/macros
- Food entry CRUD with date filtering
- Weight entry logging
- PostgreSQL via Drizzle ORM

### apps/web

React frontend:

- Zustand for state management
- Zod for form validation
- Recharts for weight trend visualization
- i18n support (Turkish / English)
- Syncs with API when authenticated, falls back to localStorage

---

## Tech stack

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

---

## Running locally

```bash
# Install dependencies
pnpm install

# Start both web and api
pnpm dev

# Run core tests
pnpm --filter @macro/core test
```

Set up `apps/api/.env`:

```
DATABASE_URL=your_postgres_url
JWT_SECRET=your_secret
```

---

## Why this architecture

Most nutrition apps are monolithic. This project treats domain logic as a first-class package so it can be shared across platforms without duplication. The same calculation that runs in the browser runs in the API and will run in a future mobile app — tested once, used everywhere.
