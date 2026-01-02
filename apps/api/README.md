# Ultra TMS API

NestJS REST API for the Ultra TMS application with Prisma ORM.

## Setup

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate
```

## Development

```bash
# Start development server
pnpm dev

# Open Prisma Studio
pnpm prisma:studio
```

## Build

```bash
pnpm build
pnpm start
```

## Database

This API uses PostgreSQL with Prisma ORM. Database schema is defined in `prisma/schema.prisma`.
