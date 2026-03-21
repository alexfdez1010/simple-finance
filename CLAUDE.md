# CLAUDE.md - Simple Finance

## Project Overview

Simple Finance is a **portfolio tracking application** built with **Next.js 16 (App Router)**, **React 19**, **TypeScript 5**, **TailwindCSS 4**, and **Prisma 6** with PostgreSQL. It tracks financial products from Yahoo Finance and custom fixed-rate investments.

## Tech Stack

- **Framework:** Next.js 16 with App Router, Server Components, Server Actions
- **Language:** TypeScript 5 (strict mode)
- **Styling:** TailwindCSS 4 + shadcn/ui (new-york style)
- **Database:** PostgreSQL via Prisma 6 ORM
- **Charts:** Recharts 2
- **Validation:** Zod 4
- **Testing:** Vitest (unit) + Playwright (E2E)
- **Auth:** Single-password with HttpOnly cookie

## Architecture

The project follows a layered, domain-driven architecture:

- `src/app/` — Next.js App Router pages and API routes
- `src/components/` — React components (ui/, dashboard/, products/, auth/)
- `src/lib/domain/` — Pure business logic (models, services)
- `src/lib/infrastructure/` — External integrations (database, Yahoo Finance, currency)
- `src/lib/actions/` — Server Actions for mutations
- `src/lib/auth/` — Authentication utilities
- `src/lib/validation/` — Zod schemas

Path alias: `@/*` maps to `./src/*`

## Commands

- `npm run dev` — Start development server with Turbopack + database
- `npm run build` — Production build
- `npm run lint-format` — **MUST run after any code change** (ESLint + Prettier)
- `npm run test:unit` — Run unit tests (Vitest)
- `npm run test:e2e` — Run E2E tests (Playwright, requires Docker)
- `npm run database` — Start PostgreSQL via Docker Compose
- `npm run database:studio` — Open Prisma Studio

## Code Standards (from AGENTS.md)

### Mandatory Rules

1. **SOLID principles** — Apply everywhere. Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion.
2. **File size limit** — No code file may exceed **200 lines** (test files are exempt).
3. **TSDoc documentation** — Document every function, class, and hook with purpose, params, returns, side effects.
4. **Testing** — Unit tests for all logic. E2E tests for user flows. High meaningful coverage.
5. **TailwindCSS 4** — All styling via Tailwind utility classes. Use shadcn/ui for foundational components.
6. **Post-coding** — Always run `npm run lint-format` before considering code complete.
7. **Design patterns** — Use appropriate patterns for maintainability, scalability, testability.
8. **Documentation first** — Consult official docs before implementing. Provide URLs when referencing.

### Code Style

- Single quotes, trailing commas, 2-space indentation (Prettier config)
- Currency formatting: `es-ES` locale, EUR
- Server Components by default, `'use client'` only when needed
- Server Actions for mutations with path revalidation
