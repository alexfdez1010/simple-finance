# Simple Finance

A production-ready portfolio tracker built with Next.js 16, React 19, TypeScript, HeroUI, and Prisma. It supports live Yahoo Finance positions and custom fixed-return investments in multiple display currencies.

Built following **SOLID principles** and enterprise-level best practices with comprehensive test coverage.

[![Next.js](https://img.shields.io/badge/Next.js-16.2.12-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38bdf8)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.7.0-2D3748)](https://www.prisma.io/)
[![HeroUI](https://img.shields.io/badge/HeroUI-3.2.4-111111)](https://heroui.com/)

## Workspace navigation

The home dashboard at `/dashboard` summarizes portfolio value, returns, recent evolution, allocation, and the largest holdings. `/` and default sign-in redirect there. Holdings (`/dashboard/portfolio`), analytics (`/dashboard/analytics`), and agent setup (`/dashboard/skill`) each load their own data and client components. Analytics has independent allocation, cash-flow, and risk routes. See [portfolio experience and module usage](docs/portfolio-experience.md) for route responsibilities, public component/loader invocation examples, accounting definitions, and verification guidance.

Runway & FIRE (`/dashboard/runway`) projects how long the current portfolio covers monthly living costs with inflation and estimated returns. Saved assumptions also populate the home dashboard. It uses three inputs: monthly living cost, inflation and monthly FIRE investment. Runway and FIRE have separate sections and charts; time to FIRE is calculated from the investment amount and estimated portfolio returns. See [simulation accounting, usage and deployment](docs/runway-simulation.md).

## 🎯 Features

### 📊 Dual Product Types

**Yahoo Finance Products**

- Track real stocks, ETFs, and cryptocurrencies using live Yahoo Finance API
- Automatic USD to EUR conversion with real-time exchange rates
- Purchase price and date tracking for accurate ROI calculations
- Auto-fill current market price when adding products

**Custom Products**

- Track investments with fixed annual return rates
- Daily compound interest calculation: `A = P(1 + r/365)^days`
- Direct EUR input for initial investment
- Perfect for savings accounts, bonds, or fixed-return investments

### 💼 Portfolio Management

- **Real-time Tracking** - Server-side rendering with 60-second cache revalidation
- **EUR Currency** - All values displayed in euros (€)
- **Portfolio Statistics** - Total value, total return, return percentage
- **Sorted Display** - Products ordered by total current value
- **Flexible Quantities** - Support for fractional shares (e.g., 2.5 shares)
- **Responsive UI** - Accessible, minimalist interface built with HeroUI and TailwindCSS 4

### 📈 Portfolio Tracking Charts

- **Daily Snapshots** - Automated portfolio value snapshots via cron job
- **Evolution Chart** - Area chart showing last 30 days of portfolio value
- **Daily Changes Chart** - Bar chart displaying day-to-day value changes
- **Color-Coded Visualization** - Green bars for gains, red bars for losses
- **Automated Data Collection** - Cron job creates daily snapshots at 05:00 UTC
- **Interactive Tooltips** - Hover to see detailed values and dates

### Account access and MCP

Better Auth provides email/password sign-in, revocable sessions and OAuth for MCP. Only the first account can register; the database permanently closes registration afterward. Connect assistants through OAuth at `/api/mcp/mcp` and approve their portfolio access in the browser. Optional authenticator 2FA and recovery codes are available in [Account security](docs/account-security.md).

### 🏗️ Technical Excellence

- **SOLID Principles** - Applied rigorously across all code (SRP, OCP, LSP, ISP, DIP)
- **Type Safety** - Full TypeScript strict mode with Prisma-generated types
- **Clean Architecture** - Domain, infrastructure, and presentation layers
- **Server Actions** - Next.js 16 data mutations with automatic revalidation
- **Comprehensive Testing** - Deterministic unit and end-to-end coverage
- **TSDoc Documentation** - All functions documented with purpose, params, and returns
- **Code Quality** - ESLint + Prettier with pre-commit hooks
- **File Size Limit** - Max 200 lines per file (enforced)

## 🛠️ Tech Stack

### Frontend

- **[Next.js 16.2.12](https://nextjs.org/docs)** - React framework with App Router and Server Components
- **[React 19.1.0](https://react.dev/)** - Latest React with concurrent features
- **[TypeScript 5.x](https://www.typescriptlang.org/)** - Strict type safety throughout
- **[TailwindCSS 4.x](https://tailwindcss.com/)** - Utility-first styling and design tokens
- **[HeroUI 3](https://heroui.com/docs/guide/introduction)** - Accessible compound UI components
- **[Phosphor Icons](https://phosphoricons.com/)** - Consistent interface iconography
- **[Recharts](https://recharts.org/)** - Beautiful, customizable charts

### Design system APIs

The presentation layer depends on small, focused adapters instead of styling vendor internals throughout the product:

- `@/components/ui/button` exposes the application button variants and sizes. Import `Button` and compose it with a label or icon; use `variant="destructive"` only for destructive actions.
- `@/components/ui/card` exposes the compound `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, and `CardFooter` surface API. Compose only the regions a feature needs.
- `@/components/ui/chart` exposes `ChartContainer`, tooltip, and legend primitives. Provide a `ChartConfig` and an accessible label for every visualization.
- `@/components/products/product-select` owns the HeroUI selection contract used by product forms. Pass a focused label, current value, options, and change handler.

Global color, spacing, typography, surface, and chart tokens live in `src/app/styles/theme.css`; shared structural behavior lives in `base.css` and `components.css`.

### Backend & Data

- **[Prisma 6](https://www.prisma.io/)** - Type-safe financial repositories with the D1 adapter
- **[Cloudflare D1](https://developers.cloudflare.com/d1/)** - SQLite financial and account storage
- **[Yahoo Finance2](https://www.npmjs.com/package/yahoo-finance2)** - Real-time financial data
- **[Zod 4.x](https://zod.dev/)** - Runtime schema validation
- **[date-fns](https://date-fns.org/)** - Modern date manipulation

### Testing

- **[Playwright](https://playwright.dev/)** - E2E testing with automatic database cleanup
- **[Vitest](https://vitest.dev/)** - Fast unit testing with JSDOM
- **[Testing Library](https://testing-library.com/)** - React component testing utilities
- **Docker Compose** - Isolated test database environment

### DevOps & Tools

- **[Wrangler](https://developers.cloudflare.com/workers/wrangler/)** - Local D1 development and Worker deployment
- **[ESLint](https://eslint.org/)** - Code linting with Next.js config
- **[Prettier](https://prettier.io/)** - Automatic code formatting
- **[Turbopack](https://turbo.build/pack)** - Fast development builds

## Local setup and authentication

Use Bun and Node.js 22 or later. Run `bun install`, copy `.env.example` into `.env` and `.dev.vars`, set random secrets, run `bun run database`, then `bun run dev`. SQLite development data lives in Wrangler's local D1 state; Docker and PostgreSQL are no longer required.

Open [the local app](http://localhost:3000). The first visitor creates the only account with name, email and a password of at least 12 characters. Later visits show email/password sign-in. Use **Sign out** to revoke the browser session.

See [Cloudflare deployment and account access](docs/cloudflare-deployment.md) for configuration, OAuth discovery, cron, migration, validation and rollback commands.

## Usage

### Adding a Yahoo Finance Product

1. Click **"Add Yahoo Finance Product"** on the dashboard
2. Enter a stock symbol (e.g., `AAPL`, `MSFT`, `GOOGL`)
3. The system validates the symbol and auto-fills the current price
4. Enter quantity and adjust purchase price/date if needed
5. Click **"Add Product"** - values are automatically converted to EUR

### Adding a Custom Product

1. Click **"Add Custom Product"** on the dashboard
2. Enter product name (e.g., "Savings Account")
3. Select the product currency and enter the first movement in that currency
4. Enter annual return rate as percentage (e.g., `5.5` for 5.5%)
5. Select investment date
6. Click **"Add Product"** - compound interest is calculated daily

Every custom-product movement stores both its native amount and its EUR value
at the movement date. Return is current EUR value minus the sum of those signed
EUR movements. Extra deposits therefore increase invested capital instead of
profit; withdrawals reduce it, and the displayed gain/loss contains only
accrued interest plus currency performance after each movement. Legacy rows are
filled once on read and retain that historical EUR value afterwards. Daily
snapshots remain valuation history and are never used as cost basis.

### Viewing Portfolio Statistics

The dashboard displays:

- **Total Portfolio Value** - Sum of all products in EUR
- **Total Return** - Absolute gain/loss in EUR
- **Return %** - Percentage return on total investment
- **Individual Products** - Sorted by total current value (highest first)

Each product card shows:

- Current value per unit
- Total value (current value × quantity)
- Return amount and percentage
- Purchase/investment date

### Portfolio charts and daily capture

Cloudflare captures daily snapshots at 05:00 UTC. Dates are stored at UTC midnight, and repeated captures update that day's record. The endpoint requires the independent `CRON_SECRET`; browser sessions and MCP tokens do not authorize cron calls.

## Available commands

- `bun run dev` starts Next.js with local Cloudflare bindings
- `bun run database` applies SQLite migrations locally
- `bun run database:deploy` applies D1 migrations remotely
- `bun run build:cloudflare` builds the Worker with OpenNext
- `bun run preview` starts the built Worker locally
- `bun run deploy` builds and deploys to Cloudflare
- `bun run lint-format` runs ESLint, Prisma formatting and Prettier
- `bun run test:unit` runs isolated unit tests
- `bun run test:e2e` starts the local app and runs Playwright

## 🏗️ Project Structure

```
simple-finance/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── auth/                 # Authentication page
│   │   ├── dashboard/            # Dashboard page (Server Component)
│   │   ├── products/
│   │   │   ├── add/              # Add Yahoo Finance product
│   │   │   └── add-custom/       # Add custom product
│   │   ├── api/
│   │   │   └── cron/
│   │   │       └── snapshot/     # Daily snapshot API endpoint with AuthGuard
│   │   ├── page.tsx              # Home page (redirects to dashboard)
│   │   └── globals.css           # Global styles
│   │
│   ├── components/               # React components
│   │   ├── auth/
│   │   │   └── auth-guard.tsx          # Route protection component
│   │   ├── dashboard/
│   │   │   ├── dashboard-client.tsx    # Client component for interactivity
│   │   │   ├── portfolio-stats.tsx     # Portfolio statistics display
│   │   │   ├── portfolio-evolution-chart.tsx   # Evolution chart component
│   │   │   └── daily-changes-chart.tsx # Daily changes chart component
│   │   └── products/
│   │       └── product-card.tsx        # Individual product card
│   │
│   └── lib/                      # Business logic and utilities
│       ├── actions/              # Next.js Server Actions
│       │   ├── auth-actions.ts         # Authentication actions
│       │   └── product-actions.ts      # CRUD operations
│       │
│       ├── auth/                 # Authentication utilities
│       │   └── auth-utils.ts           # Token generation, validation
│       │
│       ├── domain/               # Domain layer (business logic)
│       │   ├── models/
│       │   │   └── product.types.ts    # TypeScript interfaces
│       │   └── services/
│       │       ├── custom-product-calculator.ts  # Compound interest
│       │       ├── currency-converter.ts         # USD to EUR conversion
│       │       └── portfolio-statistics.ts       # Portfolio calculations
│       │
│       ├── infrastructure/       # Infrastructure layer
│       │   ├── database/
│       │   │   ├── product-repository.ts   # Prisma database access
│       │   │   └── portfolio-snapshot-repository.ts   # Portfolio snapshots
│       │   ├── yahoo-finance/
│       │   │   └── server-client.ts        # Yahoo Finance API client
│       │   └── currency/
│       │       └── exchange-rate-client.ts # Exchange rate API
│       │
│       └── hooks/                # React hooks
│           └── useYahooFinance.ts        # Client-side Yahoo Finance hook
│
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Database migrations
│
├── tests/
│   ├── e2e/                      # Playwright E2E tests
│   │   ├── auth.spec.ts                 # Auth tests (10 tests)
│   │   ├── auth-helper.ts               # Authentication helper
│   │   ├── add-yahoo-product.spec.ts    # Yahoo product tests (7 tests)
│   │   ├── add-custom-product.spec.ts   # Custom product tests (10 tests)
│   │   └── global-setup.ts              # Test database cleanup
│   ├── unit/                     # Vitest unit tests
│   │   ├── currency-converter.test.ts
│   │   ├── custom-product-calculator-eur.test.ts
│   │   └── useYahooFinance.test.ts
│   └── setup.ts                  # Test configuration
│
├── generated/                    # Generated Prisma client
│   └── prisma/
│
├── .env.example                  # Environment variables template
├── compose.yml                   # Docker Compose for PostgreSQL
├── compose-test.yml              # Docker Compose for test database
├── middleware.ts                 # Next.js middleware for auth
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── eslint.config.mjs             # ESLint configuration
├── vitest.config.ts              # Vitest configuration
├── playwright.config.ts          # Playwright configuration
└── AGENTS.md                     # Development guidelines (SOLID principles)
```

## 🧪 Testing

This project has **comprehensive test coverage** with 38+ tests across unit and E2E testing.

### Unit Tests (21 tests)

Located in `tests/unit/`, these test business logic in isolation:

- **`currency-converter.test.ts`** (10 tests) - USD to EUR conversion, exchange rates, fallbacks
- **`custom-product-calculator-eur.test.ts`** (11 tests) - Compound interest calculations, edge cases
- **`useYahooFinance.test.ts`** - React hook for Yahoo Finance API

```bash
bun run test:unit
```

**Technologies:** Vitest, JSDOM, Testing Library

### End-to-End Tests (37 tests)

Located in `tests/e2e/`, these test complete user workflows:

**Authentication Tests** (`auth.spec.ts` - 10 tests)

- ✅ Redirect unauthenticated users to auth page
- ✅ Invalid password error handling
- ✅ Empty password validation
- ✅ Successful authentication and redirect
- ✅ Default redirect behavior
- ✅ Auth persistence across navigation
- ✅ Auth persistence after page reload
- ✅ Route protection verification
- ✅ Auth page accessibility
- ✅ Cookie attributes validation

**Yahoo Finance Product Tests** (`add-yahoo-product.spec.ts` - 7 tests)

- ✅ Main flow: Create product with AAPL symbol
- ✅ Symbol validation and error handling
- ✅ Form validation (required fields)
- ✅ Navigation (cancel, back link)
- ✅ Lowercase symbol handling
- ✅ Auto-fill functionality

**Custom Product Tests** (`add-custom-product.spec.ts` - 10 tests)

- ✅ Main flow: Create custom product with 5.5% return
- ✅ High return rate test (15.75%)
- ✅ Fractional quantity support (2.5)
- ✅ Form validation
- ✅ Navigation tests
- ✅ Info box and helper text verification
- ✅ Minimum value validation

**Portfolio Snapshot Tests** (`portfolio-snapshots.spec.ts` - 10 tests)

- ✅ API endpoint with valid bearer token
- ✅ API endpoint with missing authorization
- ✅ API endpoint with invalid token
- ✅ Dashboard empty state when no snapshots exist
- ✅ Portfolio statistics display correctly
- ✅ Currency formatting in charts
- ⚠️ Create product and snapshot integration (skipped - Playwright auth limitations)
- ⚠️ Multiple snapshots in evolution chart (skipped - Playwright auth limitations)
- ⚠️ Daily changes with correct colors (skipped - Playwright auth limitations)
- ⚠️ API error handling (skipped - Playwright auth limitations)

```bash
bun run test:e2e
```

**Technologies:** Playwright, Chromium

### Test database

E2E fixtures use only Wrangler's local SQLite database. Run `bun run database` before the suite. Tests provision a local owner through Better Auth and replace financial fixtures; they never connect to production D1. See [validation and host requirements](docs/cloudflare-deployment.md).

## 🗄️ Database Schema

### Models

The database uses a **polymorphic design** with Prisma and SQLite:

**FinancialProduct** (Base table)

- `id` - Unique identifier (CUID)
- `type` - Product type enum (`YAHOO_FINANCE` | `CUSTOM`)
- `name` - Product name
- `quantity` - Float (supports fractional shares)
- `createdAt`, `updatedAt` - Timestamps

**YahooFinanceData** (1:1 with FinancialProduct)

- `symbol` - Stock symbol (e.g., "AAPL")
- `purchasePrice` - Purchase price per share in EUR
- `purchaseDate` - Date of purchase

**CustomProductData** (1:1 with FinancialProduct)

- `annualReturnRate` - Annual return rate as decimal (e.g., 0.055 for 5.5%)
- `currency` - Immutable native currency for all movements

**CustomProductContribution** (1:N with CustomProductData)

- `amount` - Signed deposit/withdrawal in the product currency
- `amountEur` - Signed EUR cost basis frozen at the movement date
- `date` - Effective date used for both interest and historical conversion
- Application writers (`createCustomProductWithEurBasis`,
  `addContributionWithEurBasis`, `updateContributionWithEurBasis`) must be used
  by UI or API entry points so `amountEur` is always persisted.

**ProductSnapshot** (1:N with FinancialProduct)

- `date` - Snapshot date
- `value` - Value at that date
- `quantity` - Quantity at that date
- Used for historical tracking (future feature)

**PortfolioSnapshot** (Daily portfolio tracking)

- `date` - Unique snapshot date (db.Date)
- `value` - Total portfolio value in EUR
- `createdAt` - Timestamp of snapshot creation
- Used for portfolio evolution charts and daily change tracking

### Compound Interest Formula

Custom products calculate daily compound interest:

```
A = P × (1 + r/365)^days

Where:
- A = Current value (EUR)
- P = Initial investment (EUR)
- r = Annual return rate (decimal, e.g., 0.055 for 5.5%)
- days = Days since investment date
```

**Example:** €1,000 invested at 5.5% annual rate for 365 days:

```
A = 1000 × (1 + 0.055/365)^365 = €1,056.54
```

### Database migrations

D1 SQLite migrations live in `migrations/` and are applied with Wrangler. Prisma schema files describe the same financial and authentication tables. The original PostgreSQL history remains in `prisma/migrations/` only for rollback to the previous deployment.

## 🏛️ Architecture

This project follows **Clean Architecture** principles with clear separation of concerns:

### Layers

**Presentation Layer** (`src/app/`, `src/components/`)

- Next.js App Router pages (Server Components)
- React client components for interactivity
- Server Actions for data mutations

**Domain Layer** (`src/lib/domain/`)

- Business logic (compound interest, portfolio statistics)
- Type definitions and interfaces
- Pure functions, no external dependencies

**Infrastructure Layer** (`src/lib/infrastructure/`)

- Database access (Prisma repositories)
- External APIs (Yahoo Finance, exchange rates)
- Caching and data fetching

### Key Design Patterns

- **Repository Pattern** - Database access abstraction
- **Service Layer** - Business logic encapsulation
- **Dependency Inversion** - Domain doesn't depend on infrastructure
- **Server Actions** - Modern Next.js data mutations
- **Server Components** - Server-side rendering with data fetching

## Deployment

Production uses Cloudflare Workers, OpenNext, D1 SQLite and KV. The domain is [Simple Finance](https://finance.alejandrofernandezcamello.me). Follow [deployment and rollback](docs/cloudflare-deployment.md) for secrets, migrations, OAuth and the 05:00 UTC cron. Import financial data afterward from Holdings.

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### Development Standards

1. **Read [AGENTS.md](./AGENTS.md)** - Complete development guidelines
2. **SOLID Principles** - Apply SRP, OCP, LSP, ISP, DIP
3. **File Size Limit** - Max 200 lines per file
4. **Documentation** - TSDoc comments on all functions
5. **Testing** - Add tests for new features
6. **Code Quality** - Run `bun run lint-format` before committing

### Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`bun test`)
5. Run linting (`bun run lint-format`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📚 Resources

- **[Next.js Documentation](https://nextjs.org/docs)** - Framework documentation
- **[React Documentation](https://react.dev/)** - React 19 features
- **[Prisma Documentation](https://www.prisma.io/docs)** - Database ORM
- **[TailwindCSS Documentation](https://tailwindcss.com/docs)** - Styling
- **[Playwright Documentation](https://playwright.dev/)** - E2E testing
- **[Vitest Documentation](https://vitest.dev/)** - Unit testing

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Alejandro Fernández**

- GitHub: [@alexfdez1010](https://github.com/alexfdez1010)

## 🙏 Acknowledgments

- Built following enterprise best practices
- Inspired by modern financial tracking applications
- Uses best-in-class open source technologies

**⭐ If you find this project useful, please consider giving it a star on GitHub!**

## Glass dashboard and portfolio insights

See [Portfolio experience](docs/portfolio-experience.md) for analytics views, searchable holdings, statistic definitions, module usage, and verification instructions.

## Complete data backups

Use **Export backup** and **Import backup** in Holdings to save and restore all products, movements, historical snapshots, simulation settings and display currency. Import previews the copy and asks before replacing existing data. See [data backups](docs/data-backups.md) for the format, API and verification workflow.
