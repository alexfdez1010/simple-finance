# Simple Finance - Portfolio Tracker

A **production-grade portfolio tracking application** built with Next.js, React, TypeScript, and Prisma. Track your financial products with real-time Yahoo Finance data or custom fixed-return investments. Monitor daily portfolio evolution and performance statistics.

Built following enterprise-level best practices from [ZeroChats](https://github.com/zerochats) and adhering to SOLID principles.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38bdf8)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.7.0-2D3748)](https://www.prisma.io/)

## 🎯 Features

### Dual Product Types

1. **Yahoo Finance Products** - Track real stocks, ETFs, and assets using live Yahoo Finance data
2. **Custom Products** - Track investments with fixed annual return rates using compound interest calculations

### Portfolio Management

- **Real-time Tracking** - Monitor current values and daily changes
- **Historical Data** - Daily snapshots for performance tracking
- **Statistics** - Total value, returns, daily changes, and percentages
- **Flexible Quantities** - Support for fractional shares (float values)

### Technical Excellence

- **SOLID Principles** - Applied rigorously across all code
- **Type Safety** - Full TypeScript strict mode with Prisma-generated types
- **Clean Architecture** - Domain, infrastructure, and presentation layers
- **Comprehensive Documentation** - TSDoc comments on all functions
- **Testing Ready** - Structure prepared for unit, integration, and E2E tests

See [AGENTS.md](./AGENTS.md) for complete development guidelines and [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for architecture details.

## 🛠️ Tech Stack

### Core Technologies

- **[Next.js 15.5.4](https://nextjs.org/docs)** - React framework with App Router
- **[React 19.1.0](https://react.dev/)** - Latest React with Server Components
- **[TypeScript 5.x](https://www.typescriptlang.org/)** - Strict type safety
- **[TailwindCSS 4.x](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Prisma 6.7.0](https://www.prisma.io/)** - Type-safe database ORM
- **[Yahoo Finance2](https://www.npmjs.com/package/yahoo-finance2)** - Financial data API
- **[date-fns](https://date-fns.org/)** - Date manipulation utilities
- **[Zod](https://zod.dev/)** - Runtime validation
- **[Recharts](https://recharts.org/)** - Charting library (ready for implementation)

### Testing Infrastructure

- **[Vitest](https://vitest.dev/)** - Fast unit and integration testing
- **[Playwright](https://playwright.dev/)** - Reliable E2E testing across browsers
- **Comprehensive test setup** - Separate unit, integration, and E2E test suites
- **Docker-based test database** - Isolated test environment

### Code Quality Tools

- **[ESLint](https://eslint.org/)** - Next.js and TypeScript linting rules
- **[Prettier](https://prettier.io/)** - Consistent code formatting
- **Pre-commit hooks** - Automated testing and formatting before commits
- **Strict TypeScript** - Maximum type safety configuration

### Database & Infrastructure

- **PostgreSQL** - Production-ready relational database
- **Docker Compose** - Containerized development and test databases
- **Prisma migrations** - Version-controlled database schema
- **Environment management** - Secure configuration with `.env` files

## 📋 Prerequisites

- **Node.js** 20.x or higher
- **npm** 10.x or higher
- **Docker** and **Docker Compose** (for database)
- **Git** for version control

## 🚀 Getting Started

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url> simple-finance
cd simple-finance

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/db"
```

### 3. Database Setup

```bash
# Start PostgreSQL container
npm run database

# Run migrations (in another terminal)
npm run database:dev

# Stop database when done
npm run database:down
```

### 4. Run Development Server

```bash
# Start development server with Turbopack
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## 📜 Available Scripts

### Development

- **`npm run dev`** - Start development server with database
- **`npm run build`** - Build production bundle
- **`npm run start`** - Start production server
- **`npm run launch`** - Build and start with database

### Code Quality

- **`npm run lint`** - Run ESLint and Prisma formatting
- **`npm run format`** - Format code with Prettier
- **`npm run lint-format`** - Lint and format (required before commits)
- **`npm run pre-commit`** - Run tests and code quality checks

### Testing

- **`npm test`** - Run all tests (unit, integration, E2E)
- **`npm run test:unit`** - Run unit tests only
- **`npm run test:integration`** - Run integration tests only
- **`npm run test:e2e`** - Run E2E tests with Playwright
- **`npm run playwright`** - Open Playwright UI for debugging

### Database

- **`npm run database`** - Start PostgreSQL container
- **`npm run database:down`** - Stop database container
- **`npm run database:dev`** - Run migrations in development
- **`npm run database:deploy`** - Deploy migrations to production
- **`npm run database:studio`** - Open Prisma Studio
- **`npm run database:test`** - Start test database

## 🏗️ Project Structure

```
simple-finance/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── products/         # Product CRUD endpoints
│   │   │   └── yahoo/            # Yahoo Finance proxy
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Dashboard
│   └── lib/
│       ├── domain/
│       │   ├── models/           # TypeScript types
│       │   └── services/         # Business logic
│       ├── infrastructure/
│       │   ├── database/         # Prisma repositories
│       │   └── yahoo-finance/    # Yahoo Finance client
│       └── validation/           # Zod schemas
├── prisma/
│   └── schema.prisma             # Database schema
├── tests/                        # Test suites
├── generated/                    # Generated Prisma client
├── IMPLEMENTATION_SUMMARY.md     # Architecture details
└── AGENTS.md                     # Development guidelines
```

## 🧪 Testing Strategy

### Unit Tests

Located in `tests/unit/`, these test individual functions and components in isolation.

```bash
npm run test:unit
```

### Integration Tests

Located in `tests/integration/`, these test module interactions and API endpoints.

```bash
npm run test:integration
```

### End-to-End Tests

Located in `tests/e2e/`, these test complete user flows across browsers.

```bash
npm run test:e2e
```

## 🗄️ Database Management

### Prisma Workflow

```bash
# Create a new migration
npm run database:dev

# Deploy migrations to production
npm run database:deploy

# Check migration status
npm run database:check

# Open Prisma Studio
npm run database:studio
```

### Schema Changes

1. Edit `prisma/schema.prisma`
2. Run `npm run database:dev` to create migration
3. Test with `npm run database:test`
4. Commit schema and migration files

## 🚢 Deployment

### Environment Variables

Ensure all required environment variables are set:

```bash
DATABASE_URL="postgresql://user:password@host:5432/database"
```

### Build and Deploy

```bash
# Build production bundle
npm run build

# Run production server
npm run start
```

## 🔧 Configuration Files

- **`tsconfig.json`** - TypeScript strict mode, path aliases
- **`eslint.config.mjs`** - Next.js and TypeScript rules
- **`.prettierrc`** - Single quotes, trailing commas, 2-space tabs
- **`vitest.config.ts`** - Node environment, 10s timeout
- **`playwright.config.ts`** - Multi-browser E2E testing

## 📚 Resources

### Official Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)

## 📊 Database Schema

### Models

- **Portfolio** - Container for financial products
- **FinancialProduct** - Base table (polymorphic design)
- **YahooFinanceData** - Yahoo Finance specific data (symbol)
- **CustomProductData** - Custom product data (annual return rate, initial investment)
- **ProductSnapshot** - Daily value snapshots

### Product Types

1. **YAHOO_FINANCE** - Real-time tracking with symbol
2. **CUSTOM** - Fixed annual return rate with compound interest

## 🔄 Daily Value Calculation

Custom products use compound interest formula:

```
A = P(1 + r/365)^days

Where:
- A = Current value
- P = Initial investment
- r = Annual return rate (as decimal)
- days = Days since investment
```

## 🚧 Next Steps

The backend infrastructure is complete. To finish the application:

1. **Frontend Components** - Product cards, forms, statistics display
2. **Dashboard** - Real-time portfolio overview with data fetching
3. **Add Product Forms** - Yahoo Finance symbol search and custom product form
4. **Charts** - Daily evolution visualization with Recharts
5. **Tests** - Unit, integration, and E2E test implementation
6. **Snapshot Job** - Daily cron job to capture product values

## 📝 API Endpoints

### Products

- `GET /api/products` - List all products
- `POST /api/products` - Create product (Yahoo or Custom)
- `GET /api/products/[id]` - Get product by ID
- `PUT /api/products/[id]` - Update product quantity
- `DELETE /api/products/[id]` - Delete product

### Yahoo Finance

- `GET /api/yahoo/quote?symbol=AAPL` - Fetch current quote

## 🤝 Contributing

Follow the guidelines in [AGENTS.md](./AGENTS.md) for development standards.
