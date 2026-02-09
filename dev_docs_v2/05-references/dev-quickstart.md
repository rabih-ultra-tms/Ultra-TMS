# Dev Environment Quickstart

> Zero-to-running in one file. Everything you need to start developing.

---

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | 18+ | `node -v` |
| pnpm | 9+ | `pnpm -v` |
| Docker | Latest | `docker -v` |
| Git | Latest | `git -v` |

---

## Setup Steps

```bash
# 1. Clone the repo
git clone https://github.com/rabih-ultra-tms/Ultra-TMS.git
cd Ultra-TMS

# 2. Start infrastructure (PostgreSQL 15 + Redis 7)
docker-compose up -d

# 3. Copy environment files
cp .env.example .env

# 4. Install dependencies
pnpm install

# 5. Generate Prisma client
pnpm --filter api prisma:generate

# 6. Run database migrations
pnpm --filter api prisma:migrate

# 7. Seed database (optional — adds sample data)
pnpm --filter api prisma:seed

# 8. Start development servers
pnpm dev
```

---

## Ports

| Service | Port | URL |
|---------|------|-----|
| Web (Next.js) | 3000 | `http://localhost:3000` |
| API (NestJS) | 3001 | `http://localhost:3001` |
| Swagger Docs | 3001 | `http://localhost:3001/api-docs` |
| PostgreSQL | 5432 | `postgresql://localhost:5432/ultra_tms` |
| Redis | 6379 | `redis://localhost:6379` |
| Prisma Studio | 5555 | `http://localhost:5555` (run `pnpm --filter api prisma:studio`) |

---

## Key Commands

| Command | What It Does |
|---------|-------------|
| `pnpm dev` | Start both web + api in dev mode (Turborepo) |
| `pnpm build` | Build all packages |
| `pnpm lint` | Lint all packages |
| `pnpm check-types` | TypeScript type checking |
| `pnpm test` | Run tests |
| `pnpm --filter web dev` | Start only the frontend |
| `pnpm --filter api dev` | Start only the backend |
| `pnpm --filter api prisma:studio` | Open Prisma Studio (DB GUI) |
| `pnpm --filter api prisma:generate` | Regenerate Prisma client after schema changes |
| `pnpm --filter api prisma:migrate` | Apply pending migrations |

---

## Environment Variables

### Required

| Variable | Example | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/ultra_tms` | PostgreSQL connection string |
| `JWT_SECRET` | `your-secret-key-here` | JWT signing secret (min 32 chars) |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection string |

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `GOOGLE_MAPS_API_KEY` | — | Google Maps (for Load Planner) |
| `OPENAI_API_KEY` | — | OpenAI (for AI cargo extraction) |
| `API_URL` | `http://localhost:3001` | Backend API URL |
| `NODE_ENV` | `development` | Environment |

---

## Project Structure

```
Ultra-TMS/
├── apps/
│   ├── web/                    # Next.js 16 frontend
│   │   ├── app/                # App Router pages
│   │   ├── components/         # React components
│   │   ├── lib/                # Utilities, API client, hooks
│   │   ├── types/              # TypeScript interfaces
│   │   └── public/             # Static assets
│   └── api/                    # NestJS backend
│       ├── src/
│       │   ├── modules/        # 43 feature modules
│       │   ├── common/         # Shared guards, decorators, pipes
│       │   └── prisma/         # Prisma service + schema
│       └── prisma/
│           ├── schema.prisma   # Database schema
│           └── migrations/     # SQL migrations
├── packages/                   # Shared packages (if any)
├── dev_docs/                   # Design specs, API prompts, data dictionary
├── dev_docs_v2/                # Execution layer — task files, hub files, references
├── docker-compose.yml          # PostgreSQL + Redis
├── turbo.json                  # Turborepo config
├── pnpm-workspace.yaml         # Workspace config
└── .env.example                # Environment template
```

---

## Tech Stack Reference

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | Next.js | 16.1.4 |
| UI Library | React | 19.2.3 |
| Styling | Tailwind CSS | 4.1.18 |
| UI Components | shadcn/ui | Latest |
| Data Fetching | TanStack React Query | 5.90.20 |
| State Management | Zustand | 5.0.10 |
| Form Validation | Zod | 4.3.6 |
| Backend Framework | NestJS | 11.x |
| ORM | Prisma | 6.x |
| Database | PostgreSQL | 15 |
| Cache | Redis | 7 |
| Package Manager | pnpm | 9.x |
| Monorepo Tool | Turborepo | Latest |

---

## Troubleshooting

### Port already in use

```bash
# Find what's using port 3000
netstat -ano | findstr :3000
# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### Prisma client not generated

```bash
# Error: @prisma/client did not initialize yet
pnpm --filter api prisma:generate
```

### Docker not running

```bash
# Check Docker status
docker ps
# If containers are down
docker-compose up -d
```

### Database connection refused

```bash
# Verify PostgreSQL is running
docker-compose ps
# Check connection string in .env matches docker-compose.yml
```

### Type errors after pulling new code

```bash
# Regenerate Prisma client + reinstall deps
pnpm install && pnpm --filter api prisma:generate
```

### Module not found errors

```bash
# Clear caches and reinstall
rm -rf node_modules apps/web/node_modules apps/api/node_modules
rm -rf apps/web/.next
pnpm install
```
