# Deployment Runbook -- Ultra TMS

> Status: Pre-Production (verified locally, not yet tested in staging)
> Last updated: 2026-03-09
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

### 0. Database Backup (ALWAYS before migration)

```bash
# Create a named backup before ANY migration or deployment
pg_dump -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} -F c \
  -f backup_pre_deploy_$(date +%Y%m%d_%H%M%S).dump

# Verify backup is valid
pg_restore --list backup_pre_deploy_*.dump | head -5

# For production (RDS): create a manual snapshot
aws rds create-db-snapshot \
  --db-instance-identifier ultra-tms-prod \
  --db-snapshot-identifier pre-deploy-$(date +%Y%m%d-%H%M%S)
```

**Do NOT proceed to step 1 until backup is confirmed successful.** If migration fails, you will need this backup to restore.

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

## Blue/Green Deployment (Alternative)

For zero-downtime deployments, use blue/green strategy instead of in-place updates.

### How It Works

1. **Blue** = current production environment (serving traffic)
2. **Green** = new version deployed to identical environment (not serving traffic)
3. Switch load balancer target from Blue to Green after verification
4. Keep Blue running for 30 minutes as instant rollback

### Steps

```bash
# 1. Deploy Green environment (identical infra, new code)
#    - Same database (shared) — migration must be backward-compatible
#    - Separate API instances on different ports/targets

# 2. Run smoke tests against Green (not yet public)
curl https://green.internal/api/v1/health
curl https://green.internal/api/v1/ready

# 3. Switch load balancer target group
aws elbv2 modify-listener --listener-arn $LISTENER_ARN \
  --default-actions Type=forward,TargetGroupArn=$GREEN_TG_ARN

# 4. Monitor error rate for 15 minutes

# 5. If errors: switch back to Blue immediately
aws elbv2 modify-listener --listener-arn $LISTENER_ARN \
  --default-actions Type=forward,TargetGroupArn=$BLUE_TG_ARN

# 6. If stable: decommission Blue after 30 minutes
```

### Database Migration Constraint

Blue/Green requires **expand-contract migrations** (already documented in Step 1). Both Blue and Green must be able to read/write the same database simultaneously during the switchover window. Never deploy a migration that drops columns or tables while Blue is still running.

---

## Post-Deploy Smoke Test Script

Run these 10 checks immediately after every deployment. All must return 200 OK (or expected status).

```bash
#!/bin/bash
# smoke-test.sh — Run after every deployment
# Usage: ./smoke-test.sh https://api.yourdomain.com

BASE_URL="${1:-http://localhost:3001}"
PASS=0
FAIL=0

check() {
  local name=$1
  local url=$2
  local expected=${3:-200}
  local status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  if [ "$status" = "$expected" ]; then
    echo "  PASS: $name ($status)"
    PASS=$((PASS + 1))
  else
    echo "  FAIL: $name (expected $expected, got $status)"
    FAIL=$((FAIL + 1))
  fi
}

echo "Smoke Test: $BASE_URL"
echo "================================"

# 1. Health checks (no auth required)
check "Health"        "$BASE_URL/api/v1/health"
check "Readiness"     "$BASE_URL/api/v1/ready"
check "Liveness"      "$BASE_URL/api/v1/live"

# 2. Auth (should return 401 without token — confirms guard is active)
check "Auth guard"    "$BASE_URL/api/v1/carriers" 401

# 3. Swagger docs (should load in non-production)
check "Swagger"       "$BASE_URL/api-docs" 200

# 4. Login endpoint exists (should return 400 for empty body, not 404)
check "Login route"   "$BASE_URL/api/v1/auth/login" 400

# 5. Public tracking page (no auth)
check "Public track"  "$BASE_URL/api/v1/tracking/public/TEST-000" 404

# 6. Throttle headers present (confirms rate limiting is active)
HEADERS=$(curl -s -I "$BASE_URL/api/v1/health")
if echo "$HEADERS" | grep -qi "x-ratelimit\|retry-after"; then
  echo "  PASS: Rate limiting headers present"
  PASS=$((PASS + 1))
else
  echo "  WARN: Rate limiting headers not found (may be expected)"
  PASS=$((PASS + 1))
fi

# 7-10. If you have a test token, verify authenticated endpoints
# Uncomment and set TOKEN for full verification:
# TOKEN="your-jwt-token"
# check "Carriers list"  "$BASE_URL/api/v1/carriers" 200 -H "Authorization: Bearer $TOKEN"
# check "Loads list"     "$BASE_URL/api/v1/tms/loads" 200 -H "Authorization: Bearer $TOKEN"
# check "Dashboard"      "$BASE_URL/api/v1/accounting/dashboard" 200 -H "Authorization: Bearer $TOKEN"

echo "================================"
echo "Results: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] && echo "ALL CHECKS PASSED" || echo "DEPLOYMENT FAILED SMOKE TEST"
exit $FAIL
```

---

## Environment Promotion Workflow

### Pipeline: dev -> staging -> production

```
   dev (local)          staging              production
   +-----------+        +-----------+        +-----------+
   | pnpm dev  | -----> | Docker    | -----> | Docker /  |
   | localhost |  push  | Same infra|  gate  | Managed   |
   |           |        | Test data |        | Real data |
   +-----------+        +-----------+        +-----------+
       |                     |                     |
   Unit tests           Integration tests     Smoke tests
   Type checks          E2E (Playwright)      Health checks
   Lint                 Load test (optional)   Error rate
```

### Promotion Gates

| Gate | dev -> staging | staging -> production |
|------|---------------|----------------------|
| Type check | `pnpm check-types` passes | Same |
| Lint | `pnpm lint` passes | Same |
| Unit tests | `pnpm test` all green | Same |
| Build | `pnpm build` succeeds | Same |
| Migration | `prisma migrate diff` reviewed | Applied + verified |
| E2E tests | Not required | All Playwright suites pass |
| Smoke test | Not required | `smoke-test.sh` all pass |
| Approval | Automatic | Manual approval from tech lead |
| Rollback plan | Not required | Documented with backup confirmed |

### Environment-Specific Configuration

| Config | dev | staging | production |
|--------|-----|---------|------------|
| `NODE_ENV` | `development` | `staging` | `production` |
| Database | Local Docker | Separate RDS instance | Production RDS (Multi-AZ) |
| Redis | Local Docker | Separate ElastiCache | Production ElastiCache |
| CORS | `localhost:3000` | staging domain | production domain |
| SendGrid | Disabled | Sandbox mode | Live |
| Swagger | Enabled | Enabled | Disabled |
| Debug logs | Enabled | Enabled | Disabled |
| Seed data | Dev seed | Anonymized copy | Real data |
| SSL | None | ACM cert | ACM cert |

### Staging Data Strategy

- **Never copy production data to staging without anonymization**
- Use `prisma db seed` with test fixtures for staging
- Or create an anonymization script that replaces PII (names, emails, phone numbers) while preserving data relationships and volume

---

## See Also

- INFRA-001: CI/CD Pipeline backlog task
- INFRA-002: Docker Production Configuration backlog task
- quality-gates.md: /verify sequence (run before every deploy)
- security-findings.md: Severity framework (for post-deploy incidents)
- env-var-matrix.md: Complete environment variable inventory
- production-architecture.md: Infrastructure topology and failure modes
- observability-strategy.md: Monitoring and alerting post-deploy
