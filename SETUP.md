# Ultra TMS — Local Setup Guide

## Prerequisites

Install these before starting:

| Tool       | Version  | Download                                      |
|------------|----------|-----------------------------------------------|
| Node.js    | >= 18    | https://nodejs.org                             |
| pnpm       | 9.x      | `npm install -g pnpm@9`                       |
| Docker     | Latest   | https://www.docker.com/products/docker-desktop |
| Git        | Latest   | https://git-scm.com                            |

## 1. Clone the repo

```bash
git clone https://github.com/rabih-ultra-tms/Ultra-TMS.git
cd Ultra-TMS
```

## 2. Start infrastructure (PostgreSQL, Redis, Elasticsearch)

Make sure Docker Desktop is running, then:

```bash
docker compose up -d
```

This starts:
- **PostgreSQL** on port `5432`
- **Redis** on port `6379`
- **Elasticsearch** on port `9200`

## 3. Set up environment variables

```bash
# Root-level env (shared)
cp .env.example .env

# API-specific env
cp apps/api/.env.example apps/api/.env
```

The defaults work out of the box for local development — no edits needed.

## 4. Install dependencies

```bash
pnpm install
```

## 5. Set up the database

```bash
cd apps/api
pnpm prisma:generate    # Generate Prisma client
pnpm prisma:migrate     # Run database migrations
pnpm prisma:seed        # Seed with sample data
cd ../..
```

## 6. Run the app

From the project root:

```bash
pnpm dev
```

This starts both apps simultaneously:

| App      | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:3000       |
| Backend  | http://localhost:3001       |
| API Docs | http://localhost:3001/api   |

## Troubleshooting

- **Port conflict?** Make sure nothing else is running on ports 3000, 3001, 5432, 6379, or 9200.
- **Docker issues?** Run `docker compose down` then `docker compose up -d` to reset.
- **Database errors?** Re-run `pnpm prisma:migrate` inside `apps/api`.
- **Node version?** Verify with `node -v` — must be 18 or higher.

## Stopping everything

```bash
# Stop the dev servers: Ctrl+C in the terminal

# Stop Docker containers:
docker compose down
```
