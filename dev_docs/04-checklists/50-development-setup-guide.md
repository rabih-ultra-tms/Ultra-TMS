# Development Setup

Complete guide to setting up the local development environment.

---

## Prerequisites

### Required Software

| Software | Version  | Installation                       |
| -------- | -------- | ---------------------------------- |
| Node.js  | 20.x LTS | [nodejs.org](https://nodejs.org)   |
| pnpm     | 9.x      | `npm install -g pnpm`              |
| Docker   | 24.x     | [docker.com](https://docker.com)   |
| Git      | 2.40+    | [git-scm.com](https://git-scm.com) |

### Recommended Tools

| Tool              | Purpose                     |
| ----------------- | --------------------------- |
| VS Code           | IDE with TypeScript support |
| Postman           | API testing                 |
| TablePlus/pgAdmin | Database management         |
| Redis Insight     | Redis management            |

### VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-azuretools.vscode-docker",
    "humao.rest-client",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

---

## Quick Start

```bash
# 1. Clone repository
git clone https://github.com/your-org/3pl-platform.git
cd 3pl-platform

# 2. Install dependencies
pnpm install

# 3. Copy environment files
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 4. Start infrastructure (PostgreSQL, Redis)
docker-compose up -d

# 5. Run database migrations
pnpm db:migrate

# 6. Seed database
pnpm db:seed

# 7. Start development servers
pnpm dev
```

After setup:

- API: http://localhost:3001
- Web: http://localhost:3000
- API Docs: http://localhost:3001/api/docs

Default login: `admin@example.com` / `password123`

---

## Detailed Setup

### Step 1: Repository Setup

```bash
# Clone with SSH (preferred)
git clone git@github.com:your-org/3pl-platform.git

# OR Clone with HTTPS
git clone https://github.com/your-org/3pl-platform.git

# Navigate to project
cd 3pl-platform

# Check Node version (should be 20.x)
node --version

# Install pnpm if not installed
npm install -g pnpm

# Install dependencies
pnpm install
```

### Step 2: Environment Configuration

Create `.env` file in project root:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tms_dev?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-development-secret-key-change-in-production
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# App
APP_PORT=3001
APP_ENV=development
APP_URL=http://localhost:3001

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email (development - use mailhog)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@localhost

# File Storage (local MinIO)
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=tms-dev

# External APIs (optional for dev)
HUBSPOT_API_KEY=
DAT_API_KEY=
FMCSA_WEB_KEY=
MAPBOX_TOKEN=

# Feature Flags
FEATURE_EDI=false
FEATURE_RATE_INTEL=false
```

### Step 3: Docker Services

Start required services:

```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f postgres
docker-compose logs -f redis
```

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: tms_postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: tms_dev
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: tms_redis
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 5s
      timeout: 5s
      retries: 5

  mailhog:
    image: mailhog/mailhog
    container_name: tms_mailhog
    ports:
      - '1025:1025' # SMTP
      - '8025:8025' # Web UI

  minio:
    image: minio/minio
    container_name: tms_minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - '9000:9000'
      - '9001:9001'
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### Step 4: Database Setup

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed with sample data
pnpm db:seed

# View database in Prisma Studio
pnpm db:studio
```

**Seed Data Includes:**

- Default tenant
- Admin user (admin@example.com)
- Sample roles
- Sample customers
- Sample carriers
- Sample orders

### Step 5: Start Development Servers

```bash
# Start all apps in development mode
pnpm dev

# OR start individually
pnpm dev:api   # Backend only
pnpm dev:web   # Frontend only
```

---

## Project Structure

```
3pl-platform/
â”œâ”€â”€ apps/
â”‚   â”œâ”€â”€ api/                 # NestJS backend
â”‚   â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”‚   â”œâ”€â”€ modules/     # Feature modules
â”‚   â”‚   â”‚   â”œâ”€â”€ common/      # Shared utilities
â”‚   â”‚   â”‚   â”œâ”€â”€ config/      # Configuration
â”‚   â”‚   â”‚   â””â”€â”€ main.ts      # Entry point
â”‚   â”‚   â”œâ”€â”€ prisma/
â”‚   â”‚   â”‚   â”œâ”€â”€ schema.prisma
â”‚   â”‚   â”‚   â”œâ”€â”€ migrations/
â”‚   â”‚   â”‚   â””â”€â”€ seed.ts
â”‚   â”‚   â””â”€â”€ test/            # Tests
â”‚   â”‚
â”‚   â””â”€â”€ web/                 # Next.js frontend
â”‚       â”œâ”€â”€ src/
â”‚       â”‚   â”œâ”€â”€ app/         # App router pages
â”‚       â”‚   â”œâ”€â”€ components/  # React components
â”‚       â”‚   â”œâ”€â”€ hooks/       # Custom hooks
â”‚       â”‚   â”œâ”€â”€ lib/         # Utilities
â”‚       â”‚   â””â”€â”€ stores/      # Zustand stores
â”‚       â””â”€â”€ public/          # Static assets
â”‚
â”œâ”€â”€ packages/
â”‚   â”œâ”€â”€ shared-types/        # TypeScript types
â”‚   â”œâ”€â”€ config/              # Shared config
â”‚   â””â”€â”€ ui/                  # Shared components
â”‚
â”œâ”€â”€ docs/                    # Documentation
â”œâ”€â”€ docker/                  # Docker configs
â”œâ”€â”€ scripts/                 # Build scripts
â”œâ”€â”€ .github/                 # GitHub workflows
â”‚
â”œâ”€â”€ package.json
â”œâ”€â”€ pnpm-workspace.yaml
â”œâ”€â”€ turbo.json
â””â”€â”€ docker-compose.yml
```

---

## Common Commands

### Development

```bash
# Start development
pnpm dev

# Start specific app
pnpm dev:api
pnpm dev:web

# Type checking
pnpm type-check

# Linting
pnpm lint
pnpm lint:fix

# Format code
pnpm format
```

### Database

```bash
# Generate Prisma client after schema changes
pnpm db:generate

# Create migration
pnpm db:migrate:dev --name migration_name

# Apply migrations (production)
pnpm db:migrate:deploy

# Reset database
pnpm db:reset

# Seed database
pnpm db:seed

# Open Prisma Studio
pnpm db:studio
```

### Testing

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:cov

# Run E2E tests
pnpm test:e2e

# Run specific test file
pnpm test -- orders.service.spec.ts

# Watch mode
pnpm test:watch
```

### Building

```bash
# Build all packages
pnpm build

# Build specific app
pnpm build:api
pnpm build:web

# Clean build artifacts
pnpm clean
```

---

## Environment-Specific Setup

### MacOS

```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node via nvm
brew install nvm
nvm install 20
nvm use 20

# Install Docker Desktop
brew install --cask docker

# Install PostgreSQL client (optional)
brew install postgresql
```

### Windows (WSL2)

```bash
# Install WSL2
wsl --install

# Inside WSL2:
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# Install Docker Desktop for Windows with WSL2 backend
```

### Linux (Ubuntu/Debian)

```bash
# Install Node via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Install Docker
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo usermod -aG docker $USER
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps

# Check connection
docker exec -it tms_postgres psql -U postgres -d tms_dev

# Reset database
docker-compose down -v
docker-compose up -d
pnpm db:migrate
pnpm db:seed
```

### Port Conflicts

```bash
# Check what's using a port
lsof -i :3001
lsof -i :5432

# Kill process on port
kill -9 $(lsof -t -i:3001)
```

### Node/pnpm Issues

```bash
# Clear pnpm cache
pnpm store prune

# Remove node_modules and reinstall
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
pnpm install
```

### Prisma Issues

```bash
# Regenerate client
rm -rf node_modules/.prisma
pnpm db:generate

# Reset database and migrations
pnpm db:reset
```

### Docker Issues

```bash
# Full cleanup
docker-compose down -v
docker system prune -a

# Rebuild containers
docker-compose build --no-cache
docker-compose up -d
```

---

## IDE Setup

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ],
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  }
}
```

### Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug API",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["dev:api:debug"],
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["test:debug", "${relativeFile}"],
      "console": "integratedTerminal"
    }
  ]
}
```

---

## Next Steps

1. [Coding Standards](./CODING-STANDARDS.md)
2. [Testing Guide](./TESTING.md)
3. [API Development](./API-DEVELOPMENT.md)
4. [Database Guide](./DATABASE-GUIDE.md)

---

## Getting Help

- Check [Troubleshooting](#troubleshooting) section
- Search existing issues on GitHub
- Ask in team Slack channel
- Review [Architecture docs](../01-architecture/README.md)
