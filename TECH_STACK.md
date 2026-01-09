# Ultra-TMS Tech Stack & Project Structure

## Overview
Ultra-TMS is a monorepo project built with **pnpm workspaces** and **Turbo** for managing multiple interconnected applications and shared packages.

---

## Core Technologies Every Developer Must Know

### Runtime & Language
- **Node.js** (v18+) - JavaScript runtime
- **TypeScript** (5.9.2) - Type-safe JavaScript

### Monorepo Management
- **pnpm** (9.0.0) - Fast package manager with workspaces
- **Turbo** (2.7.2) - Monorepo build system for parallel task execution

### Backend Framework
- **NestJS** (10.4.1) - Progressive Node.js framework for scalable server-side applications
- **Express** (via NestJS) - Web framework

### Frontend Framework
- **Next.js** (16.1.0) - React meta-framework for production
- **React** (19.2.0) - UI library
- **React DOM** (19.2.0) - React rendering for browsers

### Database & ORM
- **PostgreSQL** (15-alpine) - Relational database
- **Prisma** (6.3.1) - Type-safe ORM for database access
- **Prisma Migrate** - Database migrations

### Caching & Session Management
- **Redis** (7-alpine) - In-memory data store

### Code Quality & Formatting
- **ESLint** (9.39.1) - JavaScript/TypeScript linter
- **TypeScript ESLint** (8.51.0) - ESLint parser for TypeScript
- **Prettier** (3.7.4) - Code formatter
- **Husky** (9.1.7) - Git hooks
- **lint-staged** (16.2.7) - Run linters on staged files

### Development Tools
- **tsx** (4.16.2) - TypeScript executor for running TS scripts
- **@types/* packages** - TypeScript type definitions

### Infrastructure
- **Docker & Docker Compose** - Containerization

---

## Project Structure & Package Roles

### Root Level (`/`)
```
├── package.json          # Monorepo workspace config
├── pnpm-workspace.yaml   # pnpm workspaces definition
├── turbo.json            # Turbo pipeline configuration
├── tsconfig.json         # Root TypeScript config
├── docker-compose.yml    # Local development infrastructure
└── scripts/              # Shared scripts (e.g., init-databases.sql)
```

### `apps/` - Standalone Applications

#### **api/** - NestJS Backend API
- **Purpose**: REST/GraphQL API server
- **Key Files**:
  - `src/main.ts` - Application entry point
  - `src/app.module.ts` - Main NestJS module
  - `src/prisma.service.ts` - Database service
  - `prisma/schema.prisma` - Database schema definition
  - `prisma/migrations/` - Database migration history
  - `prisma/seed.ts` - Database seeding

#### **web/** - Next.js Web Application
- **Purpose**: Main user-facing web application
- **Dependencies**: Uses `@repo/ui` shared components
- **Port**: 3000
- **Key Files**:
  - `app/page.tsx` - Home page
  - `app/layout.tsx` - Root layout

#### **docs/** - Next.js Documentation Site
- **Purpose**: Documentation/knowledge base
- **Dependencies**: Uses `@repo/ui` shared components
- **Port**: 3001
- **Similar structure to web app**

### `packages/` - Shared Libraries

#### **ui/** - Shared React Components
- **Purpose**: Reusable UI components consumed by `web` and `docs`
- **Components**: Button, Card, Code blocks, etc.
- **Exports**: Individual components from `/src/*.tsx`
- **Key**: No runtime dependencies except React

#### **eslint-config/** - Shared ESLint Configuration
- **Purpose**: Centralized linting rules
- **Variants**: 
  - `base.js` - Core rules
  - `next.js` - Next.js specific rules
  - `react-internal.js` - React specific rules

#### **typescript-config/** - Shared TypeScript Configuration
- **Purpose**: Centralized compiler options
- **Variants**:
  - `base.json` - Core settings
  - `nextjs.json` - Next.js optimized
  - `react-library.json` - Library builds

---

## Database Schema (Key Models)

### Tenant
- Multi-tenancy support with tenant isolation
- Metadata: name, slug, settings, custom fields
- Relationships: Can have multiple users

### User
- Connected to Tenant for multi-tenant architecture

---

## Development Workflow

### Scripts (Root Level)
```bash
pnpm dev              # Start all apps in watch mode
pnpm build            # Build all apps
pnpm lint             # Lint entire monorepo
pnpm format           # Format with Prettier
pnpm check-types      # Type checking across monorepo
```

### Infrastructure
```bash
docker-compose up     # Start PostgreSQL & Redis
```

---

## Key Design Patterns

- **Monorepo Workspace Pattern**: Shared configs and components across multiple apps
- **Multi-Tenancy**: Tenant model for data isolation
- **Layered Architecture**: API (NestJS) → Database (Prisma) ← Web (Next.js)
- **Code Sharing**: ESLint/TypeScript configs via workspace packages

