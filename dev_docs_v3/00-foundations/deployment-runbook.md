# Deployment Runbook -- Ultra TMS

> Status: Draft (no production deployment yet -- project is pre-launch)
> Last updated: 2026-03-07
> See also: INFRA-001 (CI/CD Pipeline), INFRA-002 (Docker Production Config)

## Pre-Deployment Checklist

Run every item. No exceptions.

- [ ] `pnpm check-types` passes (0 errors)
- [ ] `pnpm lint` passes (0 errors, 0 warnings)
- [ ] `pnpm --filter web test` passes (all tests green)
- [ ] `pnpm --filter api test` passes (all tests green)
- [ ] `pnpm build` succeeds (both web and api)
- [ ] Database migration reviewed (`prisma migrate diff` shows expected changes)
- [ ] Environment variables verified for target environment
- [ ] CORS origins configured for production domain (QS-007)
- [ ] No `console.log` in production code (SEC-002)
- [ ] No hardcoded `localhost` URLs
- [ ] No `.env` files committed to git
- [ ] Redis connection verified

## Deployment Steps

### 1. Database Migration (if schema changed)

```bash
# Preview changes
pnpm --filter api prisma migrate diff --from-migrations --to-schema-datamodel

# Apply migration
pnpm --filter api prisma migrate deploy

# Verify
pnpm --filter api prisma migrate status
```

**Expand-Contract pattern for breaking changes:**
1. Add new column (nullable) -- deploy code that writes both old and new
2. Backfill existing data
3. Deploy code that reads from new column
4. Drop old column in separate migration

### 2. Build Applications

```bash
# Generate Prisma client (must match deployed schema)
pnpm --filter api prisma:generate

# Build both apps
pnpm build
```

### 3. Deploy API

```bash
# Start API server
node apps/api/dist/main.js
# Or via Docker
docker-compose -f docker-compose.prod.yml up -d api
```

### 4. Deploy Web

```bash
# Start Next.js production server
pnpm --filter web start
# Or via Docker
docker-compose -f docker-compose.prod.yml up -d web
```

### 5. Post-Deploy Verification

| Check | Command / Action | Expected |
|-------|-----------------|----------|
| API health | `curl https://{domain}/api/v1/health` | 200 OK |
| API docs | Browse `https://{domain}/api-docs` | Swagger UI loads |
| Auth flow | Login with test credentials | JWT returned, dashboard loads |
| Dashboard | Navigate to `/` | KPI widgets render |
| Carriers list | Navigate to `/carriers` | Table loads with data |
| Load list | Navigate to `/operations/loads` | Table loads with data |
| WebSocket | Check browser DevTools network tab | WS connection established (if QS-001 done) |
| Console | Open DevTools Console | No errors, no warnings |

## Rollback Procedure

### Code Rollback

1. Revert to previous Docker image/build artifact
2. Restart services
3. Verify health endpoint

### Database Rollback (if migration caused issues)

```bash
# Mark migration as rolled back
pnpm --filter api prisma migrate resolve --rolled-back {migration_name}

# Manually reverse the SQL changes if needed
# IMPORTANT: Prisma does not auto-generate rollback SQL
```

### Emergency Rollback Checklist

- [ ] Stop new deployment
- [ ] Revert to last known good build
- [ ] If DB migration was applied: assess if rollback SQL is needed
- [ ] Verify health endpoint
- [ ] Verify auth flow
- [ ] Notify team with incident details
- [ ] Create SEV-2+ incident if customer-impacting

## Environment Variables

### Required (app will not start without these)

| Variable | Description | Example |
|----------|------------|---------|
| DATABASE_URL | PostgreSQL connection string | postgresql://user:pass@host:5432/ultra_tms |
| JWT_SECRET | JWT signing key (256-bit minimum) | Random 64-char hex string |
| REDIS_URL | Redis connection string | redis://:password@host:6379 |

### Portal Auth (required for customer/carrier portals)

| Variable | Description |
|----------|------------|
| CUSTOMER_PORTAL_JWT_SECRET | Separate secret for customer portal tokens |
| CARRIER_PORTAL_JWT_SECRET | Separate secret for carrier portal tokens |

### Optional (features degrade gracefully without these)

| Variable | Description | Feature Affected |
|----------|------------|-----------------|
| SENDGRID_API_KEY | Email service | Email notifications |
| TWILIO_ACCOUNT_SID | SMS service | SMS notifications |
| TWILIO_AUTH_TOKEN | SMS service | SMS notifications |
| ELASTICSEARCH_URL | Search service | Full-text search |
| GOOGLE_MAPS_API_KEY | Maps service | Load planner map |

## Infrastructure Dependencies

| Service | Required? | Default Port | Health Check |
|---------|-----------|-------------|-------------|
| PostgreSQL 15 | Yes | 5432 | `pg_isready` |
| Redis 7 | Yes | 6379 | `redis-cli ping` |
| Elasticsearch 8.13 | No (search only) | 9200 | `curl :9200/_health` |
| Kibana | No (dev only) | 5601 | N/A |

## See Also

- INFRA-001: CI/CD Pipeline backlog task
- INFRA-002: Docker Production Configuration backlog task
- quality-gates.md: /verify sequence (run before every deploy)
- security-findings.md: Severity framework (for post-deploy incidents)
