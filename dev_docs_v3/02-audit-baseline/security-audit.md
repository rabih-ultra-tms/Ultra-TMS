# Security & Infrastructure Audit — Sprint 1 Baseline
> Explored 2026-02-22 | Agent: Claude Opus 4.6

---

## 1. Tenant Security

### CurrentTenant Decorator — CRITICAL VULNERABILITY
**File:** `apps/api/src/common/decorators/current-tenant.decorator.ts` (16 lines)

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();

    // Try to get tenant from user object first
    if (request.user?.tenantId) {
      return request.user.tenantId;
    }

    // Fall back to header
    return request.headers['x-tenant-id'] || 'default-tenant';  // LINE 13 — CRITICAL
  },
);
```

**Findings:**
- Fallback to `'default-tenant'` is a **CRITICAL SECURITY RISK** for multi-tenant isolation
- No validation that the header-provided tenantId matches the user's tenantId
- Should enforce hard rejection instead of fallback to default

### Models Missing tenantId (20 Models — CRITICAL)
**File:** `apps/api/prisma/schema.prisma`

| # | Model | Notes |
|---|-------|-------|
| 1 | CommissionPlanTier | Child of CommissionPlan — needs tenantId |
| 2 | DocumentShare | Child of Document — needs tenantId |
| 3 | FeatureRequestComment | Child of FeatureRequest — needs tenantId |
| 4 | FeatureRequestVote | Child of FeatureRequest — needs tenantId |
| 5 | FolderDocument | Join table — needs tenantId |
| 6 | FuelSurchargeTier | Lookup — needs tenantId |
| 7 | JobAlert | Scheduler — needs tenantId |
| 8 | JobDependency | Scheduler — needs tenantId |
| 9 | JobTemplate | Scheduler — needs tenantId |
| 10 | LoadPlannerAccessorial | Child of LoadPlanner — needs tenantId |
| 11 | LoadPlannerCargoItem | Child of LoadPlanner — needs tenantId |
| 12 | LoadPlannerPermit | Child of LoadPlanner — needs tenantId |
| 13 | LoadPlannerServiceItem | Child of LoadPlanner — needs tenantId |
| 14 | LoadPlannerTruck | Child of LoadPlanner — needs tenantId |
| 15 | OperationsCarrierDriver | Child of Carrier — needs tenantId |
| 16 | OperationsCarrierTruck | Child of Carrier — needs tenantId |
| 17 | SmsMessage | Communication — needs tenantId |
| 18 | SupportTeamMember | (Line 7932) — needs tenantId |
| 19 | SystemConfig | (Line 8095) — GLOBAL, may be intentional |
| 20 | Tenant | Root entity — intentionally no tenantId |

**Action:** Add tenantId to models 1-18. Skip 19 (SystemConfig is global) and 20 (Tenant is root).

### Tenant Context Flow — WORKING
**Example:** `apps/api/src/modules/sales/accessorial-rates.controller.ts` (Lines 16, 40, 47, 62, 72)

```typescript
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@Post()
async create(
  @CurrentTenant() tenantId: string,
  @CurrentUser() userId: string,
  @Body() dto: CreateAccessorialRateDto,
) {
  return this.accessorialRatesService.create(tenantId, userId, dto);
}
```

- CurrentTenant decorator is properly used throughout all modules
- Service layer enforces tenantId in WHERE clauses
- Pattern: `where: { id, tenantId }` ensures scoped queries

---

## 2. Security Headers & CORS

### CORS Configuration — HARDCODED TO LOCALHOST
**File:** `apps/api/src/main.ts` (Lines 43-46)

```typescript
app.enableCors({
  origin: ['http://localhost:3000', 'http://localhost:3002'],
  credentials: true,
});
```

**Risk:** Will break in production. No environment-based origin switching.

### Helmet — NOT INSTALLED
- Searched entire `apps/api/src` for `@nestjs/helmet` or `helmet` imports — **ZERO RESULTS**
- **Risk:** No HTTP security headers (X-Content-Type-Options, X-Frame-Options, HSTS, etc.)

### CSRF Protection — NOT IMPLEMENTED
- No `csurf` or `@nestjs/csrf` packages found
- **Risk:** POST/PUT/DELETE endpoints vulnerable to CSRF

### Next.js Security Headers — NONE
**File:** `apps/web/next.config.js`

```javascript
const nextConfig = {
  async rewrites() {
    return [
      { source: '/api/v1/:path*', destination: 'http://localhost:3001/api/v1/:path*' },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '3001', pathname: '/uploads/**' },
    ],
  },
};
```

- No `headers()` function for CSP/security headers
- No Content Security Policy defined

---

## 3. JWT & Auth

### JWT Strategy — GOOD
**File:** `apps/api/src/modules/auth/strategies/jwt.strategy.ts`

- Bearer token extraction from Authorization header (correct)
- `ignoreExpiration: false` enforces token expiration
- Database lookup on every request validates active users
- **No console logging of JWT tokens** (contrary to original audit claim)
- Soft-delete users checked via `deletedAt`
- Normalized role names to uppercase

### Auth Service Login Flow — GOOD
**File:** `apps/api/src/modules/auth/auth.service.ts` (Lines 54-133)

- Rate limiting via Redis (max 5 attempts)
- Account lockout duration: 15m
- Password hashed with bcrypt (10 rounds)
- Reset login attempts on success
- Token pair generated (access 15m + refresh 30d)
- Refresh token rotation (invalidates old refresh token)
- Refresh token hash stored in Redis and database
- No console logging of tokens

### Auth Controller Endpoints
**File:** `apps/api/src/modules/auth/auth.controller.ts`

| Method | Endpoint | Notes |
|--------|----------|-------|
| POST | `/api/v1/auth/login` | Throttled (5/60s) |
| POST | `/api/v1/auth/refresh` | Token rotation |
| POST | `/api/v1/auth/logout` | Revokes session |
| POST | `/api/v1/auth/logout-all` | Revokes all sessions |
| POST | `/api/v1/auth/forgot-password` | Safe error messages |
| POST | `/api/v1/auth/reset-password` | Token-based reset |
| POST | `/api/v1/auth/verify-email` | Email verification |
| GET | `/api/v1/auth/me` | Current user profile |

- No cookies used (tokens in Authorization header only)
- Refresh tokens stored as hashes (not plain text)

---

## 4. Environment Variables

### API .env — HARDCODED WEAK SECRETS
**File:** `apps/api/.env`

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tms_dev
JWT_SECRET=ultra_tms_jwt_secret_change_in_production   # WEAK
REDIS_PASSWORD=redis_password                            # WEAK
SENDGRID_API_KEY=your_sendgrid_api_key_here
MFA_ENABLED=false
STORAGE_DRIVER=local
PASSWORD_MIN_LENGTH=8
MAX_LOGIN_ATTEMPTS=5
ACCOUNT_LOCKOUT_DURATION=15m
MAX_SESSIONS_PER_USER=5
```

### API .env.example — EXISTS
**File:** `apps/api/.env.example`
- Documents required vs optional vars
- Portal-specific secrets for customer/carrier portals
- Elasticsearch, throttling, Twilio config

### Web .env.local — API KEYS EXPOSED
**File:** `apps/web/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:3001
NEXT_PUBLIC_DEFAULT_TENANT_ID=cmkskmvj50000tyl89iq02id3
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAciOKXBa29UX2cSdxQTagHohHtOQQBRd8
ANTHROPIC_API_KEY=sk-ant-api03-zRph82K7CZ5ovQDy55oJQ8fw7gi-...
```

**Critical:** Anthropic API key and Google Maps key in .env.local

### Env Validation — MANUAL ONLY
**File:** `apps/api/src/main.ts` (Lines 10-23)

```typescript
const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL', 'REDIS_URL'];
const missing = requiredEnvVars.filter((v) => !process.env[v]);
if (missing.length > 0) {
  logger.error(`FATAL: Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}
```

- Manual validation only, no type coercion or range checking
- No validation of JWT_SECRET minimum length
- No check for production-safe values

---

## 5. Error Handling

### Frontend Error Components — MINIMAL
**File:** `apps/web/components/shared/error-state.tsx`
- Only ONE error component found (generic error display)
- **No `error.tsx` boundary** (App Router pattern) — 0 files
- **No `global-error.tsx`** (global error boundary) — 0 files
- **No `loading.tsx`** skeleton screens — 0 files

### Backend Error Handling
- Auth Service: 4 try/catch blocks, proper exception handling
- Standard NestJS exceptions used (UnauthorizedException, BadRequestException, NotFoundException)
- **No custom exception filter** (@Catch) found — relies on NestJS defaults
- **No request/response logging to file** — only console via middleware

### Request Logging Middleware — CONSOLE ONLY
**File:** `apps/api/src/common/middleware/request-logging.middleware.ts`

- Logs all HTTP requests with correlation ID
- Tracks response time in milliseconds
- Status-based log level (error/warn/log)
- **NOT writing to file** — only console output

---

## 6. Health Checks & Bootstrap

### Health Controller — EXISTS, INCOMPLETE
**File:** `apps/api/src/modules/health/health.controller.ts`

| Endpoint | Purpose | Status |
|----------|---------|--------|
| GET `/health` | Simple liveness | Always returns 'ok' |
| GET `/ready` | Readiness check | Tests DB connectivity |
| GET `/live` | Kubernetes probe | Returns 'alive' |

- `/ready` tests database connection (good)
- **Missing Redis health check** in ready endpoint
- Version hardcoded to '1.0.0'
- No tests (0 spec files)

### App Bootstrap Sequence
**File:** `apps/api/src/main.ts` (70 lines)

1. Environment validation (required + optional)
2. NestFactory.create() initializes app
3. Static assets for /uploads (dev only)
4. CORS enabled (hardcoded localhost)
5. Global prefix `api/v1`
6. ValidationPipe (whitelist, transform, forbidNonWhitelisted)
7. ClassSerializerInterceptor (excludeExtraneousValues)
8. Swagger docs generated
9. Server listening on port 3001

**Missing:** No Helmet, no global exception filter

### App Module Global Providers
**File:** `apps/api/src/app.module.ts`

| Type | Provider | Purpose |
|------|----------|---------|
| Guard | JwtAuthGuard | Validates JWT on all routes (except @Public) |
| Guard | RolesGuard | Enforces role-based access |
| Guard | CustomThrottlerGuard | Rate limiting (skips health) |
| Interceptor | ResponseTransformInterceptor | Standardizes responses |
| Interceptor | AuditInterceptor | Logs all mutations |
| Middleware | CorrelationIdMiddleware | Adds x-correlation-id |
| Middleware | RequestLoggingMiddleware | HTTP request logs |

---

## Security Posture Summary

| Area | Status | Risk | Action |
|------|--------|------|--------|
| Tenant Isolation | PARTIAL | CRITICAL | Fix decorator + add tenantId to 18 models |
| CORS | SAFE (dev) | HIGH (prod) | Externalize to env var |
| Helmet Headers | MISSING | HIGH | Install @nestjs/helmet |
| CSRF Protection | MISSING | HIGH | Add csurf or SameSite policy |
| JWT Handling | GOOD | LOW | No changes needed |
| Rate Limiting | IMPLEMENTED | LOW | Working via Throttler |
| Password Security | GOOD | LOW | bcrypt 10 rounds, min 8 chars |
| Session Management | GOOD | LOW | Token rotation, hash storage |
| Env Variables | RISKY | HIGH | Rotate secrets, add validation |
| Error Handling | PARTIAL | MEDIUM | Add global exception filter |
| Health Checks | GOOD | LOW | Add Redis check |
| Request Logging | CONSOLE | MEDIUM | Add file/JSON logging |
