# CLAUDE.md - Simple Finance

## Project Overview

Simple Finance is a **portfolio tracking application** built with **Next.js 16 (App Router)**, **React 19**, **TypeScript 5**, **TailwindCSS 4**, and **Prisma 6** with Cloudflare D1 SQLite. It tracks financial products from Yahoo Finance and custom fixed-rate investments.

## Tech Stack

- **Framework:** Next.js 16 with App Router, Server Components, Server Actions
- **Language:** TypeScript 5 (strict mode)
- **Styling:** TailwindCSS 4 with existing HeroUI 3 components
- **Database:** Cloudflare D1 SQLite; Prisma WASM client for repositories and native D1 batches for atomic multi-row writes
- **Charts:** Recharts 2
- **Validation:** Zod 4
- **Testing:** Vitest (unit) + Playwright (E2E)
- **Auth:** Better Auth email/password sessions, permanent first-owner registration claim, MCP OAuth with PKCE

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

## Package Manager

This project uses **Bun** (>=1.3) as the package manager and script runner. Use `bun install` to install deps and `bun run <script>` to invoke scripts. `package-lock.json` is replaced by `bun.lock`.

## Commands

- `bun run dev` — Start development server with Turbopack + database
- `bun run build` — Production build
- `bun run lint-format` — **MUST run after any code change** (ESLint + Prettier)
- `bun run test:unit` — Run unit tests (Vitest)
- `bun run test:e2e` — Run E2E tests (Playwright, requires Docker)
- `bun run database` — Start PostgreSQL via Docker Compose
- `bun run preview` — Build and open the Worker with its local D1 explorer

## Code Standards (from AGENTS.md)

### Mandatory Rules

1. **SOLID principles** — Apply everywhere. Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion.
2. **File size limit** — No code file may exceed **200 lines** (test files are exempt).
3. **TSDoc documentation** — Document every function, class, and hook with purpose, params, returns, side effects.
4. **Testing** — Unit tests for all logic. E2E tests for user flows. High meaningful coverage.
5. **TailwindCSS 4** — All styling via Tailwind utility classes. Use shadcn/ui for foundational components.
6. **Post-coding** — Always run `bun run lint-format`, `bun run test:unit`, AND `bun run test:e2e` after any code change before considering it complete. Update any broken tests to match the new behavior.
7. **Design patterns** — Use appropriate patterns for maintainability, scalability, testability.
8. **Documentation first** — Consult official docs before implementing. Provide URLs when referencing.

### Code Style

- Single quotes, trailing commas, 2-space indentation (Prettier config)
- Currency formatting: `es-ES` locale, EUR
- Server Components by default, `'use client'` only when needed
- Server Actions for mutations with path revalidation

## Cloudflare migration decisions

Migration date: 2026-11-01. Production uses Workers/OpenNext, D1 `simple-finance` in Western Europe, and KV for market-data caching. Canonical origin: `https://finance.alejandrofernandezcamello.me`. See `docs/cloudflare-deployment.md` for commands, OAuth discovery, backup behavior and rollback.

- Import Prisma through `generated/cloudflare/client` in the Worker, generated with `runtime = "workerd"`. The separate Node client remains for fixtures and schema tools. The Node entry tries to read WASM from the filesystem, which fails in workerd. Never retain a request-bound D1 client across requests.
- Better Auth uses its native D1 adapter. The Prisma auth adapter's conditional mutations can invoke unsupported interactive transactions even with its transaction option disabled.
- D1 `batch()` supplies atomicity for financial backup replacement and multi-row product writes. Prisma D1 transaction calls do not provide that guarantee. Bounded JSON import chunks preserve the existing version 1 backup format.
- The database trigger permanently closes registration after the first owner and survives account deletion or empty financial imports. Do not seed a production test account.
- MCP uses signed, scoped, resource-bound OAuth tokens. No `PASSWORD`, SHA-256 session cookie or static MCP token remains. Better Auth's browser client performs OAuth response redirects itself; do not navigate twice.
- The snapshot cron is `0 5 * * *` (05:00 UTC), with UTC-midnight date keys. Disable the Vercel cron during cutover and retain old infrastructure for rollback.
- Local `.env`, `.dev.vars`, `.env.cloudflare.production` and `.env.pre-cloudflare` contain credentials or private configuration and must remain ignored. E2E fixtures only access Wrangler's local SQLite state.
- Generate binding types without Worker runtime globals to avoid overriding browser DOM types. `allowJs` stays false so TypeScript does not analyze the generated OpenNext bundle.

- Yahoo Finance clients are request-local too. Reusing a global client retains crumb/cookie fetch I/O and causes cross-request errors in workerd. `createYahooClient()` creates each network client's lifetime; only plain market-data results are cached in KV. Require yahoo-finance2 v4 or later: v3 also shared module-level queues and crumb promises even between separate instances, causing cross-request I/O and permanently hung requests. The isolation regression test suspends one transport while another client finishes. Smart Placement is enabled to optimize Worker locality; D1 reports WEUR.

## Optional authenticator protection

Better Auth's `twoFactor()` plugin is composed before the OAuth provider so a password-only pending sign-in cannot authorize MCP access. `/dashboard/security` offers optional TOTP enrollment, local QR rendering, recovery-code download/regeneration and password-confirmed disable. `/auth/two-factor` is a public challenge shell backed by Better Auth’s pending-login cookie. Preserve signed OAuth query parameters through that page. Do not enable 2FA for the owner automatically; require the owner's first valid authenticator code.

The account defaults to protection off after migration `0004_two_factor.sql`. Financial backups never contain or replace authenticator data. Session cookies remain 30 days; keep production secrets stable and upload exact JSON values with `wrangler secret bulk` rather than dotenv secret files whose values can be overridden by local environment variables. See `docs/account-security.md`.
