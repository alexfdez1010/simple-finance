# Next.js Production-Ready Template

A **production-grade Next.js template** engineered with enterprise-level best practices, comprehensive testing infrastructure, and strict code quality standards. Built for teams that demand excellence in maintainability, scalability, and developer experience. This template is based in the practices used in [ZeroChats](https://github.com/zerochats).

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38bdf8)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.7.0-2D3748)](https://www.prisma.io/)

## 🎯 Philosophy

This template embodies **professional software engineering principles** with a focus on:

- **SOLID Principles** - Applied rigorously across all code
- **Design Pattern Driven** - Appropriate patterns for maintainability and scalability
- **Documentation First** - Comprehensive TSDoc/JSDoc for all functions, classes, and hooks
- **Testing as Priority** - Unit, integration, and E2E tests with meaningful coverage
- **Code Quality** - Strict linting, formatting, and file size limits (200 lines max)
- **Type Safety** - Full TypeScript strict mode enforcement

See [AGENTS.md](./AGENTS.md) for complete development guidelines and principles that are used to guide AI Agents.

## ✨ Features

### Core Stack

- **[Next.js 15.5.4](https://nextjs.org/docs)** - React framework with App Router
- **[React 19.1.0](https://react.dev/)** - Latest React with Server Components
- **[TypeScript 5.x](https://www.typescriptlang.org/)** - Strict type safety
- **[TailwindCSS 4.x](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Prisma 6.7.0](https://www.prisma.io/)** - Type-safe database ORM

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
git clone https://github.com/alexfdez1010/next-template.git my-project
cd my-project

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
next-template/
├── src/
│   └── app/              # Next.js App Router pages
│       ├── layout.tsx    # Root layout
│       ├── page.tsx      # Home page
│       └── globals.css   # Global styles
├── prisma/
│   └── schema.prisma     # Database schema
├── tests/
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   ├── e2e/              # End-to-end tests
│   └── setup.ts          # Test configuration
├── public/               # Static assets
├── generated/            # Generated Prisma client
├── .vscode/              # VS Code settings
├── compose.yml           # Development database
├── compose-test.yml      # Test database (ephemeral)
├── eslint.config.mjs     # ESLint configuration
├── playwright.config.ts  # Playwright configuration
├── vitest.config.ts      # Vitest configuration
├── tsconfig.json         # TypeScript configuration
├── tailwind.config.ts    # TailwindCSS configuration
├── .prettierrc           # Prettier configuration
├── .env.example          # Environment template
└── AGENTS.md             # AI Agents Development guidelines
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

## 📄 Template Usage

This is a template repository. To use it:

1. Click "Use this template" on GitHub
2. Clone your new repository
3. Remove or modify this README as needed
4. Start building your application