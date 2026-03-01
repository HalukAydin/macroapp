# DECISIONS.md

## Why Monorepo?

We want shared domain logic between Web and Mobile.

Duplicating macro calculation logic in both apps would:
- Increase bugs
- Break consistency
- Hurt architecture quality

Monorepo ensures:
- Single source of truth
- Shared types
- Shared tests

---

## Why packages/core?

Core:
- Contains pure business logic
- Is UI-independent
- Is platform-independent
- Can be reused in mobile/backend

This mirrors real-world scalable architecture.

---

## Why Vite instead of Next.js?

This is an MVP.
We do not need:
- SSR
- SEO
- Server components

Vite:
- Faster setup
- Simpler mental model
- Better for small MVP

---

## Why Zustand instead of Redux?

- Lightweight
- Minimal boilerplate
- Good enough for MVP
- Easy persistence integration

---

## Why No Backend Yet?

This project’s goal:
- Demonstrate domain modeling
- Demonstrate reusable architecture

Backend would:
- Slow iteration
- Distract from core logic

Backend will be Phase 4.

---

## Why Strict TypeScript?

Recruiter signal:
- Strong type modeling
- Safe domain rules
- Clean inference

---

## Why EMA for Weight Trend?

EMA:
- Simple
- Efficient
- Suitable for MVP
- Realistic enough for weight smoothing

Complex statistical modeling is unnecessary for MVP.