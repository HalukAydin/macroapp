# Macro MVP

A clean, architecture-focused MVP of a macro-based nutrition tracking application.

Inspired by MacroFactor and MyFitnessPal, but intentionally minimal and engineering-focused.

---

## Why This Project Exists

This project demonstrates:

- Clean architecture in a monorepo
- Shared business logic across platforms
- Type-safe domain modeling
- Test-driven calculation engine
- Separation of UI and domain logic

---

## Architecture

Monorepo (pnpm workspace):

apps/
  web/      → React + Vite frontend
  mobile/   → (planned) Expo React Native

packages/
  core/     → Shared business logic

Key principle:
All nutrition calculations live inside `packages/core`.

UI layers consume pure functions only.

---

## Features (Phase 1)

- Profile setup
- BMR (Mifflin-St Jeor)
- TDEE calculation
- Macro distribution
- Weight logging
- EMA trend smoothing
- Local persistence
- Routing
- Unit tested domain logic

---

## Tech Stack

- React
- TypeScript (strict)
- Vite
- Zustand
- Zod
- Vitest
- pnpm
- Turborepo

---

## How to Run

pnpm install  
pnpm --filter @macro/core build  
pnpm --filter web dev  

---

## Roadmap

Phase 2:
- Natural language food input
- Macro estimation engine

Phase 3:
- Expo mobile app (reusing core)

Phase 4:
- Backend API
- Auth
- Cloud persistence

---

## Engineering Principles

- Business logic isolated
- Platform-agnostic core
- Small, safe commits
- Tests for domain logic
- No unnecessary complexity

---

## License

MIT