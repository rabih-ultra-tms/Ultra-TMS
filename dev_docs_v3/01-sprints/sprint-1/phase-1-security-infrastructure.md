# Sprint 1 — Phase 1: Security & Infrastructure (Weeks 1-2)
> 11 tasks | 35-45h estimated | BLOCKS everything else

---

## SEC-001: Fix CurrentTenant Decorator [P0 CRITICAL]
**Effort:** S (1-2h) | **Blocks:** SEC-002, all service quality passes

### Context
The `CurrentTenant` decorator falls back to `x-tenant-id` header then `'default-tenant'` string. This means any unauthenticated request or request without tenant context silently gets access to a phantom "default-tenant" scope — a critical multi-tenant isolation failure.

### File to Modify
`apps/api/src/common/decorators/current-tenant.decorator.ts` (16 lines)

### Current Code (VULNERABLE)
```typescript
export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    if (request.user?.tenantId) {
      return request.user.tenantId;
    }
    return request.headers['x-tenant-id'] || 'default-tenant'; // LINE 13 — REMOVE
  },
);
```

### Target Code
```typescript
import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const tenantId = request.user?.tenantId;
    if (!tenantId) {
      throw new UnauthorizedException('Tenant context required. Ensure JWT contains tenantId.');
    }
    return tenantId;
  },
);
```

### Sub-tasks
1. **SEC-001a:** Remove `x-tenant-id` header fallback and `'default-tenant'` string
2. **SEC-001b:** Import and throw `UnauthorizedException` when tenantId missing
3. **SEC-001c:** Grep entire codebase for `x-tenant-id` header usage — remove any client-side headers setting it
4. **SEC-001d:** Grep for `'default-tenant'` string anywhere else in the codebase
5. **SEC-001e:** Run all backend tests to verify nothing depends on the fallback

### Where to Search
```bash
grep -r "x-tenant-id" apps/api/src/ apps/web/
grep -r "default-tenant" apps/api/src/ apps/web/
```

### Acceptance Criteria
- [ ] No fallback to header or default string
- [ ] Unauthenticated requests to tenant-scoped endpoints return 401
- [ ] All existing backend tests pass
- [ ] No `x-tenant-id` or `default-tenant` references remain in codebase

---

## SEC-002: Multi-Tenant Schema Fixes [P0 CRITICAL]
**Effort:** L (6-8h) | **Blocks:** all service quality passes

### Context
18 Prisma models are missing `tenantId`, allowing potential cross-tenant data leakage. Some are child models that inherit tenant scope via parent FK, but without explicit tenantId the ORM can't enforce row-level isolation.

### File to Modify
`apps/api/prisma/schema.prisma` (~9,879 lines)

### Models Requiring tenantId (18 models)

#### Child Models of Tenant-Scoped Parents
| # | Model | Parent | Schema Line (approx) |
|---|-------|--------|---------------------|
| 1 | CommissionPlanTier | CommissionPlan | Find via `model CommissionPlanTier` |
| 2 | DocumentShare | Document | Find via `model DocumentShare` |
| 3 | FolderDocument | Folder | Find via `model FolderDocument` |
| 4 | FuelSurchargeTier | FuelSurchargeTable | Find via `model FuelSurchargeTier` |
| 5 | LoadPlannerAccessorial | LoadPlanner | Find via `model LoadPlannerAccessorial` |
| 6 | LoadPlannerCargoItem | LoadPlanner | Find via `model LoadPlannerCargoItem` |
| 7 | LoadPlannerPermit | LoadPlanner | Find via `model LoadPlannerPermit` |
| 8 | LoadPlannerServiceItem | LoadPlanner | Find via `model LoadPlannerServiceItem` |
| 9 | LoadPlannerTruck | LoadPlanner | Find via `model LoadPlannerTruck` |
| 10 | OperationsCarrierDriver | Carrier | Find via `model OperationsCarrierDriver` |
| 11 | OperationsCarrierTruck | Carrier | Find via `model OperationsCarrierTruck` |

#### Independent Models
| # | Model | Reason | Schema Line (approx) |
|---|-------|--------|---------------------|
| 12 | FeatureRequestComment | User content — must be tenant-scoped | |
| 13 | FeatureRequestVote | User content — must be tenant-scoped | |
| 14 | JobAlert | Scheduler — per-tenant jobs | |
| 15 | JobDependency | Scheduler — per-tenant jobs | |
| 16 | JobTemplate | Scheduler — per-tenant templates | |
| 17 | SmsMessage | Communication — per-tenant messages | Line ~7932 |
| 18 | SupportTeamMember | Support — per-tenant teams | |

#### SKIP (Intentionally Global)
| Model | Reason |
|-------|--------|
| SystemConfig | Global platform config — no tenantId needed |
| Tenant | Root entity — is the tenant itself |
| TruckType | Global reference data |

### Sub-tasks
1. **SEC-002a:** For each of the 18 models, add:
   ```prisma
   tenantId  String
   tenant    Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
   @@index([tenantId])
   ```
2. **SEC-002b:** Generate migration: `pnpm prisma:migrate --name add-tenant-isolation`
3. **SEC-002c:** Update seed data to include tenantId for new fields
4. **SEC-002d:** Update corresponding service files to include `tenantId` in WHERE clauses
5. **SEC-002e:** Write isolation test: create data in tenant A, verify tenant B cannot access it
6. **SEC-002f:** Run full test suite to verify no regressions

### Files Affected (services that use these models)
- `apps/api/src/modules/commission/` — CommissionPlanTier
- `apps/api/src/modules/documents/` — DocumentShare, FolderDocument
- `apps/api/src/modules/operations/` — LoadPlanner*, OperationsCarrier*
- `apps/api/src/modules/scheduler/` — Job*, JobTemplate
- `apps/api/src/modules/communication/` — SmsMessage
- `apps/api/src/modules/help-desk/` — SupportTeamMember
- `apps/api/src/modules/feedback/` — FeatureRequest*

### Acceptance Criteria
- [ ] 18 models have tenantId field with Tenant relation
- [ ] Migration runs clean on dev database
- [ ] Seed data includes tenantId for all new fields
- [ ] Cross-tenant isolation test passes (tenant A data invisible to tenant B)
- [ ] All backend tests pass

---

## SEC-003: Security Headers (Helmet) [P0]
**Effort:** S (2-3h)

### Context
No HTTP security headers are being set. The API serves without X-Content-Type-Options, X-Frame-Options, HSTS, CSP, or other protective headers.

### Sub-tasks

#### SEC-003a: Install and Configure Helmet (Backend)
**File:** `apps/api/src/main.ts`

```bash
cd apps/api && pnpm add helmet @nestjs/helmet
```

Add to `main.ts` after `NestFactory.create()`:
```typescript
import helmet from 'helmet';

// After app creation, before CORS
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.CORS_ORIGIN || 'http://localhost:3000'],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embedding for Swagger UI
}));
```

#### SEC-003b: Add Security Headers to Next.js
**File:** `apps/web/next.config.js`

Add `headers()` function:
```javascript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
      ],
    },
  ];
},
```

#### SEC-003c: Verify Headers
- Run API and check response headers with `curl -I http://localhost:3001/health`
- Check Next.js headers in browser DevTools

### Acceptance Criteria
- [ ] Helmet installed and configured in API
- [ ] Next.js returns security headers on all routes
- [ ] Swagger UI still accessible (not blocked by CSP)
- [ ] securityheaders.com score A or A+

---

## SEC-004: CORS from Environment Variables [P0]
**Effort:** S (30min)

### File to Modify
`apps/api/src/main.ts` (Line 43-46)

### Current Code
```typescript
app.enableCors({
  origin: ['http://localhost:3000', 'http://localhost:3002'],
  credentials: true,
});
```

### Target Code
```typescript
app.enableCors({
  origin: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:3002')
    .split(',')
    .map(s => s.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-correlation-id'],
});
```

### Sub-tasks
1. **SEC-004a:** Replace hardcoded origins with `process.env.CORS_ORIGINS`
2. **SEC-004b:** Add `CORS_ORIGINS` to `.env` and `.env.example`
3. **SEC-004c:** Add explicit methods and allowedHeaders
4. **SEC-004d:** Test CORS from different origins (should reject unknown)

### Acceptance Criteria
- [ ] CORS reads from `CORS_ORIGINS` env var
- [ ] Default fallback works for local dev
- [ ] Unknown origins are rejected

---

## SEC-005: JWT Cookie Security [P1]
**Effort:** S (1-2h)

### Context
Tokens are stored in browser cookies. The current implementation in `apps/web/lib/api/client.ts` handles cookie read/write. Need to verify HttpOnly, Secure, and SameSite flags.

### File to Audit
`apps/web/lib/api/client.ts` (Lines 39-45 — cookie management)

### Sub-tasks
1. **SEC-005a:** Audit cookie write code — check for HttpOnly, Secure, SameSite
2. **SEC-005b:** If cookies are set via JavaScript (not HttpOnly), document the risk
3. **SEC-005c:** If production needs HttpOnly, move cookie-setting to the backend (Set-Cookie header)
4. **SEC-005d:** Add SameSite=Strict to prevent CSRF via cookies
5. **SEC-005e:** Add Secure flag for production (HTTPS only)

### Acceptance Criteria
- [ ] Cookie flags documented or implemented
- [ ] If JavaScript-accessible, CSP mitigates XSS risk
- [ ] SameSite policy documented

---

## INFRA-001: CI/CD Pipeline (GitHub Actions) [P0]
**Effort:** M (4-6h) | **Blocks:** code quality enforcement

### Context
Zero CI/CD pipelines exist. No automated checks on PRs. Only a pre-commit hook (lint-staged) provides any gating.

### Files to Create

#### INFRA-001a: CI Pipeline
**Create:** `.github/workflows/ci.yml`

```yaml
name: CI
on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm check-types

  test-api:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: tms_test
        ports: ['5432:5432']
        options: --health-cmd pg_isready
      redis:
        image: redis:7-alpine
        ports: ['6379:6379']
        options: --health-cmd "redis-cli ping"
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: cd apps/api && pnpm prisma:generate && pnpm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/tms_test
          JWT_SECRET: ci-test-secret-min-32-characters-long
          REDIS_URL: redis://localhost:6379

  test-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: cd apps/web && pnpm test

  build:
    runs-on: ubuntu-latest
    needs: [lint, typecheck, test-api, test-web]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
```

#### INFRA-001b: Branch Protection Rules
- Require CI pass before merge
- Require 1 approval on PRs to main
- No force pushes to main

#### INFRA-001c: PR Template
**Create:** `.github/pull_request_template.md`

### Sub-tasks
1. Create `.github/workflows/ci.yml` with lint, typecheck, test, build jobs
2. Create `.github/pull_request_template.md`
3. Configure branch protection rules on GitHub
4. Verify CI runs on a test PR
5. Create placeholder `deploy-staging.yml` (stub for Sprint 2)

### Acceptance Criteria
- [ ] Every PR triggers CI (lint + typecheck + test + build)
- [ ] Failed CI blocks merge
- [ ] PR template exists with checklist

---

## INFRA-002: Global Error Boundaries [P0]
**Effort:** M (3-4h) | **Blocks:** user experience

### Context
101 pages, 0 error.tsx files, 0 loading.tsx files. Any React error shows a white screen. Any slow navigation shows no feedback.

### Files to Create

#### INFRA-002a: Global Error Boundary
**Create:** `apps/web/app/global-error.tsx`

```typescript
'use client';
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html><body>
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="mt-2 text-muted-foreground">{error.message}</p>
          <button onClick={reset} className="mt-4 btn btn-primary">Try again</button>
        </div>
      </div>
    </body></html>
  );
}
```

#### INFRA-002b: Dashboard Error Boundary
**Create:** `apps/web/app/(dashboard)/error.tsx`

#### INFRA-002c: Dashboard Loading State
**Create:** `apps/web/app/(dashboard)/loading.tsx`

#### INFRA-002d: Not Found Page
**Create:** `apps/web/app/not-found.tsx`

### Sub-tasks
1. Create `app/global-error.tsx` — catches all unhandled errors
2. Create `app/(dashboard)/error.tsx` — catches dashboard-level errors with retry
3. Create `app/(dashboard)/loading.tsx` — skeleton loader for dashboard navigation
4. Create `app/not-found.tsx` — custom 404 page
5. Create a reusable `components/shared/page-error.tsx` component
6. Create a reusable `components/shared/page-skeleton.tsx` component
7. Test by intentionally throwing an error in a page component

### Acceptance Criteria
- [ ] Any React crash shows error UI with retry button, not white screen
- [ ] Navigation between dashboard pages shows skeleton loading
- [ ] 404 routes show custom not-found page
- [ ] Error boundary reports to Sentry (after MON-001)

---

## INFRA-003: Health Endpoint Enhancement [P0]
**Effort:** S (1-2h)

### File to Modify
`apps/api/src/modules/health/health.controller.ts`

### Current State
- `/health` — always returns 'ok' (too simple)
- `/ready` — checks DB only, no Redis
- `/live` — returns 'alive'

### Target State
Add Redis health check to `/ready`:

```typescript
@Get('ready')
async ready(): Promise<HealthStatus> {
  const checks = { database: 'disconnected', redis: 'disconnected' };
  let status: HealthStatus['status'] = 'ok';

  try {
    await this.prisma.$queryRaw`SELECT 1`;
    checks.database = 'connected';
  } catch { status = 'unhealthy'; }

  try {
    await this.redis.ping();
    checks.redis = 'connected';
  } catch { status = 'unhealthy'; }

  const statusCode = status === 'ok' ? 200 : 503;
  return { status, timestamp: new Date().toISOString(), uptime: process.uptime(), version: process.env.npm_package_version || '1.0.0', checks };
}
```

### Sub-tasks
1. **INFRA-003a:** Inject Redis client into HealthController
2. **INFRA-003b:** Add Redis ping check to `/ready`
3. **INFRA-003c:** Return 503 status code when any check fails (not just JSON body)
4. **INFRA-003d:** Read version from package.json instead of hardcoded '1.0.0'
5. **INFRA-003e:** Write 3 tests: all healthy, DB down, Redis down

### Acceptance Criteria
- [ ] `/ready` returns 200 when all deps up, 503 when any dep down
- [ ] Redis connectivity tested alongside DB
- [ ] Version reads from package.json

---

## INFRA-004: Graceful Shutdown [P1]
**Effort:** S (1h)

### File to Modify
`apps/api/src/main.ts`

### Sub-tasks
1. **INFRA-004a:** Enable NestJS shutdown hooks:
   ```typescript
   app.enableShutdownHooks();
   ```
2. **INFRA-004b:** Add Prisma disconnect on shutdown in `prisma.service.ts`:
   ```typescript
   async onModuleDestroy() {
     await this.$disconnect();
   }
   ```
3. **INFRA-004c:** Add Redis disconnect on shutdown
4. **INFRA-004d:** Test with `kill -SIGTERM <pid>` — verify clean exit

### Acceptance Criteria
- [ ] SIGTERM cleanly closes DB and Redis connections
- [ ] No connection leak on restart
- [ ] Process exits with code 0 on clean shutdown

---

## INFRA-005: Fix Root Layout Metadata [P0]
**Effort:** S (30min)

### File to Modify
`apps/web/app/layout.tsx`

### Sub-tasks
1. **INFRA-005a:** Set proper metadata:
   ```typescript
   export const metadata: Metadata = {
     title: { default: 'Ultra TMS', template: '%s | Ultra TMS' },
     description: 'Transportation Management System',
   };
   ```
2. **INFRA-005b:** Verify browser tab shows "Ultra TMS" on all pages

### Acceptance Criteria
- [ ] Browser tab shows "Ultra TMS" (not "Next.js" or blank)
- [ ] Sub-pages show "Page Name | Ultra TMS"

---

## INFRA-006: Environment Variable Validation [P1]
**Effort:** S (1-2h)

### Context
Current validation in `main.ts` only checks existence of 3 vars. No type checking, no minimum lengths, no production safety checks.

### File to Modify
`apps/api/src/main.ts` (Lines 10-23)

### Sub-tasks

#### INFRA-006a: Create Validation Schema
**Create:** `apps/api/src/config/env.validation.ts`

```typescript
import { z } from 'zod';

export const envSchema = z.object({
  // Required
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  REDIS_URL: z.string(),

  // Optional with defaults
  JWT_ACCESS_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_EXPIRATION: z.string().default('30d'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  // Optional
  SENDGRID_API_KEY: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  CUSTOMER_PORTAL_JWT_SECRET: z.string().optional(),
  CARRIER_PORTAL_JWT_SECRET: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;
```

#### INFRA-006b: Integrate into Bootstrap
Replace manual checks in `main.ts` with:
```typescript
import { envSchema } from './config/env.validation';

const env = envSchema.safeParse(process.env);
if (!env.success) {
  logger.error('Invalid environment configuration:');
  env.error.issues.forEach(issue => logger.error(`  ${issue.path}: ${issue.message}`));
  process.exit(1);
}
```

#### INFRA-006c: Production Safety Check
Add to validation:
```typescript
if (process.env.NODE_ENV === 'production') {
  if (process.env.JWT_SECRET?.includes('change_in_production')) {
    throw new Error('FATAL: JWT_SECRET contains default value. Set a secure secret for production.');
  }
}
```

### Acceptance Criteria
- [ ] Missing required var → clear error message + exit code 1
- [ ] JWT_SECRET < 32 chars → rejection
- [ ] Production with default secret → rejection
- [ ] Invalid types → clear error (e.g., PORT=abc)

---

## Phase 1 Summary

| Task | Priority | Effort | Files | Sub-tasks |
|------|----------|--------|-------|-----------|
| SEC-001 | P0 CRITICAL | S (1-2h) | 1 | 5 |
| SEC-002 | P0 CRITICAL | L (6-8h) | schema + ~7 services | 6 |
| SEC-003 | P0 | S (2-3h) | 2 (main.ts + next.config.js) | 3 |
| SEC-004 | P0 | S (30min) | 1 (main.ts) | 4 |
| SEC-005 | P1 | S (1-2h) | 1 (client.ts) | 5 |
| INFRA-001 | P0 | M (4-6h) | 3 new files | 5 |
| INFRA-002 | P0 | M (3-4h) | 6 new files | 7 |
| INFRA-003 | P0 | S (1-2h) | 1 | 5 |
| INFRA-004 | P1 | S (1h) | 2 | 4 |
| INFRA-005 | P0 | S (30min) | 1 | 2 |
| INFRA-006 | P1 | S (1-2h) | 2 (1 new + 1 modified) | 3 |
| **TOTAL** | | **35-45h** | | **49 sub-tasks** |

### Execution Order (dependency-aware)
1. SEC-001 (tenant decorator) — no deps, unblocks everything
2. SEC-004 (CORS env) — quick win, same file as SEC-003
3. SEC-003 (Helmet) — same file, do together with SEC-004
4. INFRA-005 (metadata) — quick win, independent
5. INFRA-006 (env validation) — independent
6. INFRA-004 (graceful shutdown) — independent
7. INFRA-003 (health endpoint) — independent
8. SEC-005 (JWT cookies) — audit, may not need changes
9. INFRA-002 (error boundaries) — independent, frontend
10. INFRA-001 (CI/CD) — do last in phase (needs tests passing)
11. SEC-002 (schema tenantId) — largest task, do with focused attention
