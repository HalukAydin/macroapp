Project Context (read me first)
What we’re building
Goal:

Build a clean, production-quality MVP of a nutrition tracking app (inspired by MacroFactor / MyFitnessPal) that demonstrates:

Strong TypeScript domain modeling

Shared business logic across platforms (web → mobile)

Testable calculation engine

Clean architecture separation

This project is primarily a portfolio case study to impress recruiters.

Target users:

Fitness-focused individuals

Users who want macro-based dieting (cut / maintain / bulk)

Users who value fast input and minimal UI

Non-goals (explicitly NOT doing):

No barcode scanning

No large food database

No subscriptions

No authentication backend (yet)

No complex AI systems

No backend until MVP web is stable

Current state
What already exists:

Monorepo (pnpm workspace)

apps/web (React + Vite + TypeScript)

packages/core (domain logic + tests)

Zustand state store

Profile form (validated via Zod)

BMR / TDEE (Mifflin-St Jeor)

Macro target calculation

Weight trend (EMA)

Local persistence (localStorage)

Basic routing (/profile, /dashboard)

Unit tests for core logic (Vitest)

What’s broken / missing:

No polished UI

No mobile app yet

No food parsing feature (Phase 2)

No onboarding UX polish

No test coverage for web layer

No backend

Decisions already made (from ChatGPT project chat)
Architecture:

Monorepo

pnpm workspaces

apps/web

apps/mobile (to be added)

packages/core (shared domain logic)

UI layer must NEVER contain business logic

Core logic must be platform-agnostic and reusable.

Data model:

StoredProfile:

sex

age

heightCm

weightKg

activity

goal

proteinGPerKg

fatMinGPerKg

Derived values (computed, not stored):

BMR

TDEE

targetCalories

proteinG

fatG

carbG

WeightEntry:

date (ISO string)

weightKg

API conventions:

There is currently no backend API.

Future rule:

Core package must not depend on network or platform.

Web/mobile must consume pure functions only.

UI/UX conventions:

Minimal

Data-first

Fast form input

Dark mode preferred

No unnecessary animations

Clear numerical presentation

Naming conventions:

Domain functions: calculateX

Derived logic: pure functions only

No side effects in core

Zustand store handles persistence

ProfileFormValues separate from StoredProfile if needed

Constraints
Tech stack:

pnpm

Turborepo (basic usage)

React + Vite

TypeScript strict mode

Zustand

Zod

Vitest

Future:

Expo React Native

AsyncStorage/MMKV

Must keep:

Core package completely reusable

Business logic isolated

Clean type definitions

Unit tests for domain logic

Small, controlled commits

Must avoid:

Mixing UI and domain logic

Duplicating calculation code in web/mobile

Overengineering

Premature backend

Complex state machines

How to work in this repo

Always modify core logic inside packages/core

Never compute macros directly inside components

Always write tests for new core logic

Keep commits small and meaningful

Avoid large refactors unless explicitly requested

Web layer only orchestrates state + renders UI

Core layer contains all calculation rules

Definition of done
Acceptance criteria:

Profile → Save → Dashboard recalculates correctly

Refresh preserves state

Changing goal adjusts calories

Changing protein/fat rules affects carb correctly

No circular JSON errors

All core tests passing

Test requirements:

BMR calculation test (male/female)

TDEE calculation test

Macro distribution test

Weight EMA trend test

Edge case tests (extreme values)

Performance/security notes:

No heavy libraries

No runtime AI calls in core

No blocking computations

Core must stay lightweight

No sensitive data storage