# Environment & Secrets Management

> Source: `dev_docs/10-features/88-environment-secrets-management.md`
> Last updated: 2026-03-07

---

## Overview

Ultra TMS uses **environment variables** for all configuration with **validation on startup** (fail fast). Secrets are never committed to git. Feature flags enable gradual rollouts.

---

## Environment Hierarchy

```
.env.example          → Checked into git (template, no values)
    ↓
.env.local            → Local development (gitignored)
    ↓
.env.development      → Development defaults
.env.staging          → Staging overrides
.env.production       → Production (from secret manager)
```

---

## Core Rules

1. **NEVER commit secrets** — Use .env files (gitignored) or secret managers
2. **NEVER hardcode URLs** — All URLs from environment variables
3. **Validate env vars on startup** — Fail fast if missing
4. **Separate configs per environment** — dev, staging, production
5. **Use feature flags** — For gradual rollouts and kill switches

---

## Required Environment Variables

### Application

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | `development` | Environment name |
| `PORT` | No | `3001` | API server port |
| `FRONTEND_URL` | Yes | `http://localhost:3000` | CORS origin |

### Database

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `DATABASE_POOL_SIZE` | No | `10` | Connection pool size |

### Authentication

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | Yes | — | JWT signing secret (min 32 chars) |
| `JWT_EXPIRATION` | No | `24h` | Token expiration |
| `CUSTOMER_PORTAL_JWT_SECRET` | Yes | — | Customer portal JWT |
| `CARRIER_PORTAL_JWT_SECRET` | Yes | — | Carrier portal JWT |

### Redis

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REDIS_URL` | Yes | — | Redis connection string |
| `REDIS_PASSWORD` | No | — | Redis password |

### External Services

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SENDGRID_API_KEY` | No | — | Email service |
| `TWILIO_ACCOUNT_SID` | No | — | SMS service |
| `AWS_ACCESS_KEY_ID` | No | — | S3 file storage |
| `AWS_SECRET_ACCESS_KEY` | No | — | S3 file storage |
| `GOOGLE_MAPS_API_KEY` | No | — | Maps & geocoding |

---

## Startup Validation

```typescript
// apps/api/src/config/validation.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
});

export function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Environment validation failed:', result.error.format());
    process.exit(1);
  }
  return result.data;
}
```

---

## Docker Compose Defaults

```yaml
# docker-compose.yml
services:
  postgres:
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ultra_tms
  redis:
    command: redis-server --requirepass redis_password
  elasticsearch:
    environment:
      discovery.type: single-node
```

---

## Next.js Environment Variables

```typescript
// apps/web/env.ts — Client-side env validation
// Only NEXT_PUBLIC_ vars are exposed to the browser
const clientEnv = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '/api/v1',
  NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
  NEXT_PUBLIC_GOOGLE_MAPS_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
};
```

---

## Feature Flags

```typescript
// Simple feature flag system
const FEATURE_FLAGS = {
  WEBSOCKETS_ENABLED: process.env.FEATURE_WEBSOCKETS === 'true',
  LOAD_BOARD_ENABLED: process.env.FEATURE_LOAD_BOARD === 'true',
  AI_CARGO_EXTRACTION: process.env.FEATURE_AI_CARGO === 'true',
  COMMISSION_MODULE: process.env.FEATURE_COMMISSION === 'true',
};

// Usage
if (FEATURE_FLAGS.WEBSOCKETS_ENABLED) {
  app.useWebSocketAdapter(new RedisIoAdapter(app));
}
```

---

## Security Rules

- `.env.local` and `.env.*.local` are in `.gitignore`
- Production secrets come from AWS Secrets Manager / Vault, not files
- Rotate JWT_SECRET every 90 days
- Never log secrets (mask in logs)
- Use separate secrets per environment (never share prod/dev)
