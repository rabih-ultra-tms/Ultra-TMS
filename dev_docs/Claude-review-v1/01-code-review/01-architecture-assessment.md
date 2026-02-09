# Architecture Assessment

**Project:** Ultra TMS - 3PL Logistics Platform
**Review Date:** 2026-02-07
**Reviewer:** Claude Opus 4.6
**Scope:** Full-stack architecture, monorepo structure, infrastructure

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Monorepo Structure](#monorepo-structure)
3. [Backend Architecture](#backend-architecture)
4. [Frontend Architecture](#frontend-architecture)
5. [Infrastructure](#infrastructure)
6. [Shared Packages](#shared-packages)
7. [Architecture Strengths](#architecture-strengths)
8. [Architecture Weaknesses](#architecture-weaknesses)
9. [Recommendations](#recommendations)

---

## 1. Executive Summary

Ultra TMS is a multi-tenant Transportation Management System built as a monorepo containing a Next.js 16 frontend (`apps/web`), a NestJS 10 backend (`apps/api`), and shared packages. The architecture follows a modular monolith pattern on the backend with 41 registered NestJS modules, a well-structured middleware pipeline, and comprehensive guard/interceptor layers. The frontend uses Next.js App Router with route groups separating public auth pages from protected dashboard views.

**Overall Rating: B+** -- The architecture is well-conceived with strong separation of concerns, comprehensive RBAC, proper API versioning, and a solid infrastructure stack. Key areas for improvement include eliminating dead code (`.bak` directories), strengthening the shared packages layer, adding a shared types package, and addressing the significant frontend testing gap (10 test files for 115+ components).

---

## 2. Monorepo Structure

### 2.1 Workspace Configuration

**File:** `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

The workspace is minimal and clean, scoping to two directories: `apps/` for deployable applications and `packages/` for shared libraries.

### 2.2 Turborepo Pipeline

**File:** `turbo.json`

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "lint": {
      "dependsOn": ["^lint"],
      "env": ["NODE_ENV", "CARRIER_PORTAL_JWT_SECRET", ...]
    },
    "check-types": {
      "dependsOn": ["^check-types"]
    },
    "dev": {
      "cache": false,
      "persistent": true,
      "env": ["DATABASE_URL", "PORT", "REDIS_PASSWORD", ...]
    }
  }
}
```

**Analysis:**

- **Build pipeline** correctly uses `^build` (topological dependency), meaning packages build before apps that depend on them.
- **Caching** is appropriately disabled for `dev` (persistent process) and configured with correct output artifacts for `build` (`.next/**`).
- **Environment variables** are explicitly declared for `lint` and `dev` tasks, ensuring cache correctness. The lint task lists 13 environment variables including JWT secrets and Elasticsearch configuration.
- **Missing: `test` task.** There is no `test` task defined in `turbo.json`, meaning `pnpm --filter api test` and `pnpm --filter web test` are not orchestrated through Turborepo. This misses caching benefits and cross-package dependency resolution for tests.
- **Build outputs** only specify `.next/**`, which means the NestJS `dist/` output is not tracked. This could cause cache misses when the API is rebuilt.

### 2.3 Root Package Configuration

**File:** `package.json` (root)

```json
{
  "name": "src",
  "packageManager": "pnpm@9.0.0",
  "engines": { "node": ">=18" },
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,md}\"",
    "check-types": "turbo run check-types"
  }
}
```

- **Package name `"src"` is misleading.** Should be `"ultra-tms"` or `"@ultra-tms/root"`.
- **`packageManager` pinned** to `pnpm@9.0.0` via corepack -- good practice.
- **Node engine** requires `>=18`, which is appropriate for the tech stack.
- **TypeScript 5.9.2** at root level with strict mode enabled including `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`.

---

## 3. Backend Architecture

### 3.1 Module Organization

**File:** `apps/api/src/app.module.ts`

The backend registers **41 modules** organized in logical tiers:

| Tier | Modules | Examples |
|------|---------|----------|
| **Infrastructure** | 3 | `RedisModule`, `EmailModule`, `StorageModule` |
| **Core Business** | 6 | `AuthModule`, `CrmModule`, `SalesModule`, `TmsModule`, `CarrierModule`, `AccountingModule` |
| **Extended Business** | 20+ | `LoadBoardModule`, `CommissionModule`, `DocumentsModule`, `ClaimsModule`, `EdiModule`, `SafetyModule`, etc. |
| **Platform Services** | 10+ | `SearchModule`, `AuditModule`, `ConfigModule`, `SchedulerModule`, `CacheModule`, `HealthModule`, etc. |
| **Portal Services** | 2 | `CustomerPortalModule`, `CarrierPortalModule` |

**Commented-out imports** on lines 56-58 show previously-commented modules (`AnalyticsModule`, `IntegrationHubModule`, `WorkflowModule`) that are now active, indicating iterative module activation. The stale comments should be cleaned up.

### 3.2 Middleware Pipeline

The request processing pipeline is well-layered:

```
Request -> CorrelationIdMiddleware -> RequestLoggingMiddleware -> Guards -> Interceptors -> Handler
```

1. **CorrelationIdMiddleware** (`correlation-id.middleware.ts`): Generates UUID per request, propagates via `x-correlation-id` header. Properly checks for incoming correlation IDs to support distributed tracing.

2. **RequestLoggingMiddleware** (`request-logging.middleware.ts`): Structured HTTP logging with correlation ID, method, URL, IP, user agent, status code, duration, and content length. Uses NestJS Logger with severity-based routing (error for 5xx, warn for 4xx, log for 2xx/3xx).

3. **Guards** (applied globally via `APP_GUARD`):
   - `JwtAuthGuard`: Passport JWT strategy with `@Public()` decorator escape hatch. In test mode, auto-populates `req.user` with configurable test headers.
   - `RolesGuard`: Role-based access with `@Roles()` decorator. Supports both single role and multi-role matching. `SUPER_ADMIN` bypasses all role checks. Also supports `@Permissions()` for fine-grained permission checks.
   - `CustomThrottlerGuard`: Three-tier rate limiting (short: 3/1s, medium: 20/10s, long: 100/60s). Tracks by IP+userId composite key. Skips health check endpoints.

4. **Interceptors** (applied globally via `APP_INTERCEPTOR`):
   - `ResponseTransformInterceptor`: Normalizes all responses to `{ success, data, message }` or `{ success, data, pagination }` format. Handles StreamableFile and Buffer pass-through.
   - `AuditInterceptor`: Captures events for audit trail.

### 3.3 API Versioning

**File:** `apps/api/src/main.ts`

```typescript
app.setGlobalPrefix('api/v1');
```

API versioning uses a simple global prefix (`/api/v1`). This is pragmatic for v1 but will need a strategy when v2 endpoints are introduced. NestJS supports URI, Header, and Media Type versioning natively -- the current approach does not leverage this.

### 3.4 Validation

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }),
);
```

**Strong configuration:**
- `whitelist: true` strips undeclared properties from DTOs
- `forbidNonWhitelisted: true` rejects requests with extra properties (returns 400)
- `transform: true` auto-transforms payloads to DTO class instances

This is the gold standard for NestJS validation configuration.

### 3.5 Swagger Documentation

**File:** `apps/api/src/swagger.ts`

Comprehensive Swagger/OpenAPI setup with:
- **53 tags** covering all API domains
- **Two auth schemes**: `JWT-auth` (internal users) and `Portal-JWT` (customer/carrier portal users)
- **Two server environments**: Development (`localhost:3001`) and Production (`api.ultra-tms.com`)
- JSON export endpoint at `/api/docs/json`
- Documented response format, error codes, and multi-tenancy
- Custom UI with hidden topbar and clean styling

### 3.6 Error Handling

Error handling follows NestJS conventions:
- Guards throw `UnauthorizedException` (401) and `ForbiddenException` (403)
- `CustomThrottlerGuard` throws `ThrottlerException` (429) with human-readable message
- Validation failures return 400 via `ValidationPipe`
- The `ResponseTransformInterceptor` wraps successful responses; error responses are handled by NestJS's built-in exception filter

**Missing:** No custom global exception filter is registered. NestJS's default filter handles errors, but a custom filter would allow consistent error response formatting (e.g., including `correlationId` in error responses).

### 3.7 Throttling

Three-tier rate limiting via `@nestjs/throttler`:

| Tier | TTL | Limit | Purpose |
|------|-----|-------|---------|
| `short` | 1 second | 3 | Burst protection |
| `medium` | 10 seconds | 20 | Sustained abuse |
| `long` | 60 seconds | 100 | Overall rate cap |

Test environment uses a very high limit (1,000,000) to avoid test interference. Health endpoints (`/health`, `/ready`, `/live`) are excluded from throttling.

---

## 4. Frontend Architecture

### 4.1 App Router Structure

**File:** `apps/web/next.config.js`

Next.js 16 with App Router. The route structure uses route groups:

```
apps/web/app/
  (auth)/         Public pages (login, register, verify-email)
  (dashboard)/    Protected pages (all TMS screens)
```

This cleanly separates authentication flows from the main application, allowing different layouts per group.

### 4.2 API Proxy

```javascript
async rewrites() {
  return [{
    source: '/api/v1/:path*',
    destination: 'http://localhost:3001/api/v1/:path*',
  }];
},
```

The frontend proxies all `/api/v1/*` requests to the backend. This avoids CORS issues in development and provides a clean separation between frontend and backend URLs.

**Limitation:** The proxy target is hardcoded to `http://localhost:3001`. In production, this needs environment-based configuration.

### 4.3 Middleware RBAC

**File:** `apps/web/middleware.ts`

The frontend middleware implements a two-layer auth system:

1. **Authentication check:** Redirects to `/login` if no `accessToken` cookie is present (with `returnUrl` query parameter for post-login redirect).

2. **RBAC check:** Only `/admin/*` routes are protected with role-based rules:
   ```typescript
   const rbacRules = [
     { pattern: /^\/admin(\/|$)/, roles: ["ADMIN", "SUPER_ADMIN"] },
   ];
   ```

3. **JWT decoding:** The middleware decodes the JWT payload client-side (base64 decode, not signature verification) to extract roles. This is intentional -- signature verification happens server-side; the middleware only needs to make routing decisions.

4. **`SUPER_ADMIN` bypass:** Explicitly bypasses all RBAC checks.

**Observation:** Only 1 RBAC rule exists (`/admin`). As the application grows to 362+ screens, more granular route-level RBAC rules should be added to prevent unauthorized page access before API calls are made.

### 4.4 API Client

**File:** `apps/web/lib/api/client.ts` (482 lines)

A comprehensive API client with:
- **Token management**: Cookie-first with localStorage fallback
- **Automatic token refresh**: Pre-emptive refresh when token expires within 60 seconds
- **Retry logic**: On 401, attempts token refresh then retries the original request
- **Concurrent refresh prevention**: Uses a `refreshPromise` singleton to avoid race conditions
- **FormData support**: Separate `upload()` method and auto-detection in `request()`
- **Type-safe methods**: `get<T>`, `post<T>`, `put<T>`, `patch<T>`, `delete<T>`
- **Auth endpoint exclusion**: Login/register/refresh endpoints skip the refresh-on-activity check
- **Error handling**: Custom `ApiError` class with status, body, validation errors, and error code

### 4.5 Client State Management

From `package.json`:
- **Server state:** `@tanstack/react-query` v5.90 (TanStack Query)
- **Client state:** `zustand` v5.0
- **Forms:** `react-hook-form` v7.71 + `zod` v4.3 (schema validation)

This is the recommended stack for React 19 applications.

### 4.6 Layout Hierarchy

The application uses Next.js App Router's nested layout pattern:
- Root layout (`app/layout.tsx`) wraps the entire app with providers
- `(auth)` group has its own layout (minimal, no sidebar)
- `(dashboard)` group has its own layout (sidebar + header + main content area)

---

## 5. Infrastructure

### 5.1 Docker Services

**File:** `docker-compose.yml` (Compose v3.8)

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| **PostgreSQL** | `postgres:15-alpine` | 5432 | Primary database |
| **Redis** | `redis:7-alpine` | 6379 | Sessions, caching, rate limiting, pub/sub |
| **Elasticsearch** | `elasticsearch:8.13.4` | 9200 | Full-text search, analytics |
| **Kibana** | `kibana:8.13.4` | 5601 | ES visualization and monitoring |

All services are on a shared bridge network (`ultra-tms-network`). PostgreSQL and Redis have healthchecks and persistent volumes. Elasticsearch has a 1GB JVM heap allocation.

**Notable configurations:**
- PostgreSQL uses an init script (`scripts/init-databases.sql`) for multi-database setup (likely separating test and dev databases)
- Redis requires password authentication (`--requirepass`)
- Elasticsearch runs in single-node mode with security disabled (`xpack.security.enabled=false`)
- Kibana has no healthcheck defined

### 5.2 Database Layer

- **ORM:** Prisma 6 (`@prisma/client` v6.3.1)
- **Soft deletes:** Implemented at the Prisma middleware level in `PrismaService`. A set of 30+ models are automatically soft-deleted (delete -> update with `deletedAt`) and queries automatically filter `deletedAt: null`.
- **Base repository:** Abstract `BaseRepository<T>` provides `findAll`, `findOne`, `findById`, `softDelete`, `restore`, `hardDelete`, and `findAllWithDeleted` methods with automatic soft-delete filtering.
- **Multi-tenant fields:** Every entity includes `tenant_id`, `external_id`, `source_system`, `custom_fields` (migration-first pattern).

### 5.3 PrismaService

**File:** `apps/api/src/prisma.service.ts`

```typescript
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    // Registers middleware for soft-delete interception
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

The soft-delete middleware intercepts `findMany`, `findFirst`, `delete`, and `deleteMany` for 30+ models. This ensures consistent behavior across the codebase but has a drawback: the model list is hardcoded and must be manually updated when new models are added.

---

## 6. Shared Packages

### 6.1 Current State

The `packages/` directory is defined in the workspace but appears to have minimal content:

| Package | Usage |
|---------|-------|
| `@repo/ui` | Declared as workspace dependency in `apps/web/package.json`, but only 1 import found in the web app |
| `@repo/eslint-config` | Shared ESLint config used by both apps |
| `@repo/typescript-config` | Shared TypeScript config used by both apps |

### 6.2 Value Assessment

The `@repo/ui` package provides low value currently -- shadcn/ui components live in `apps/web/components/ui/` rather than in the shared package. The ESLint and TypeScript config packages provide genuine value by ensuring consistent tooling across apps.

**Missing:** A `@repo/types` or `@repo/shared` package for shared TypeScript types between frontend and backend (API response types, entity types, enums, validation schemas). Currently, types are duplicated across apps.

---

## 7. Architecture Strengths

### S1. Comprehensive Guard Pipeline
The three-guard global pipeline (`JwtAuthGuard` -> `RolesGuard` -> `CustomThrottlerGuard`) provides defense-in-depth. Every endpoint is protected by default; developers must explicitly opt out with `@Public()`. Evidence: 5 `@Public()` uses across the codebase (only auth endpoints) vs 752 `@Roles()` annotations across 122 controllers.

### S2. Consistent Response Format
The `ResponseTransformInterceptor` automatically normalizes all responses. Controllers return raw data and the interceptor wraps it. This eliminates response format inconsistencies without requiring developer discipline.

### S3. Multi-Tenant Isolation by Default
The `CurrentTenant` decorator extracts `tenantId` from the JWT payload, and the `BaseRepository` automatically filters by `deletedAt: null`. The `tenantId` appears in 190+ occurrences across the backend, indicating consistent enforcement.

### S4. Observability Infrastructure
Correlation IDs are generated per-request and propagated through headers. Request logging captures method, URL, IP, user agent, status, duration, and content length with severity-based routing. Elasticsearch + Kibana provide search and visualization.

### S5. Well-Structured Middleware Pipeline
The pipeline order is correct: CorrelationId -> Logging -> Guards -> Interceptors -> Handler. This ensures every request gets a correlation ID before anything else processes it.

### S6. Robust Token Management
The API client implements pre-emptive token refresh (60-second window), concurrent refresh prevention (singleton promise), automatic retry on 401, and auth endpoint exclusion. The backend stores session data in both Redis (fast lookup) and the database (persistence), with refresh token hash verification and token rotation.

### S7. Validation-First Approach
Global `ValidationPipe` with `whitelist`, `transform`, and `forbidNonWhitelisted` strips unknown fields and rejects extra properties. This prevents mass assignment vulnerabilities and ensures type safety at the API boundary.

### S8. Comprehensive Swagger Documentation
53 tags, two auth schemes, documented response formats, error codes, and multi-tenancy. The JSON export endpoint enables client code generation.

### S9. Event-Driven Architecture
`EventEmitterModule` with wildcard support enables audit trail capture of `*.created`, `*.updated`, and `*.deleted` events without coupling modules to the audit system.

### S10. Modular Monolith
41 modules with clear boundaries. Each module owns its controllers, services, DTOs, and specs. This enables future extraction to microservices if needed.

---

## 8. Architecture Weaknesses

### W1. Dead Code -- `.bak` Directories
Five `.bak` directories exist in `apps/api/src/modules/`:
- `analytics.bak/`
- `carrier.bak/`
- `documents.bak/`
- `integration-hub.bak/`
- `workflow.bak/`

These are excluded from `tsconfig.json` and ESLint but still ship with the repo. They contain references to `tenantId`, `bcrypt`, and other live code patterns, indicating they are outdated copies of active modules.

### W2. Missing Shared Types Package
No `@repo/types` package exists. API response types, entity types, and enums are defined independently in both `apps/web` and `apps/api`. Changes to API contracts require manual synchronization.

### W3. Minimal `@repo/ui` Usage
The shared UI package `@repo/ui` has only 1 import in the web app. All shadcn/ui components live in `apps/web/components/ui/`. This defeats the purpose of a shared component library.

### W4. Frontend Testing Gap
Only 10 test files exist for the web app (against 115+ components). The backend has 230 test files covering services, guards, and interceptors. This asymmetry means frontend regressions go undetected.

### W5. BaseRepository Uses `any` Casts
**File:** `apps/api/src/common/repositories/base.repository.ts`

```typescript
return (this.prisma[this.modelName] as any).findMany({ ... });
```

All 7 methods in `BaseRepository` use `as any` casts to access Prisma model delegates dynamically. This bypasses TypeScript's type safety at the data access layer.

### W6. Hardcoded Soft-Delete Model List
The soft-delete middleware in `PrismaService` hardcodes 30+ model names in a `Set`. Adding a new model requires remembering to update this list. A missing entry means data could be permanently deleted instead of soft-deleted.

### W7. CORS Whitelist is Development-Only
```typescript
app.enableCors({
  origin: ['http://localhost:3000', 'http://localhost:3002'],
  credentials: true,
});
```

The CORS configuration only allows localhost origins. There is no environment-based CORS configuration for staging/production deployments.

### W8. No Global Exception Filter
NestJS's default exception filter handles errors, but a custom filter would:
- Include `correlationId` in error responses for debugging
- Ensure consistent error format across all exception types
- Log unhandled exceptions with full context

### W9. Single Frontend RBAC Rule
The middleware only protects `/admin/*` routes. The remaining 40+ dashboard pages rely solely on backend RBAC. This means unauthorized users can load page shells before receiving 403 errors from API calls.

### W10. Monolithic Page Components
The carrier management page is reportedly 858 lines. This pattern of large page components makes testing, maintenance, and code review significantly harder.

### W11. No Request Body Size Limits
The `main.ts` file does not configure Express body parser limits. The default is 100KB for JSON but this should be explicitly configured, especially for a TMS handling document uploads.

### W12. API Proxy Hardcoded to localhost
```javascript
destination: 'http://localhost:3001/api/v1/:path*',
```

The Next.js rewrite target is not environment-configurable, requiring code changes for different deployment environments.

---

## 9. Recommendations

### REC-01: Add a `test` task to Turborepo
**Priority: High** | **Effort: 1 hour**

Add a `test` task to `turbo.json` to enable cached test runs and proper dependency ordering:
```json
"test": {
  "dependsOn": ["^build"],
  "inputs": ["$TURBO_DEFAULT$", ".env*"],
  "outputs": ["coverage/**"]
}
```

### REC-02: Create a `@repo/types` shared package
**Priority: High** | **Effort: 4-8 hours**

Extract shared types (API response envelopes, entity interfaces, role enums, pagination types) into `packages/types`. Both apps import from this single source of truth. This eliminates type drift and enables compile-time contract verification.

### REC-03: Remove `.bak` directories
**Priority: Medium** | **Effort: 30 minutes**

Delete the 5 `.bak` directories. They are already excluded from compilation and linting, so they serve no purpose. If version history is needed, it exists in git.

### REC-04: Add a custom global exception filter
**Priority: Medium** | **Effort: 2-4 hours**

Create an `AllExceptionsFilter` that:
- Wraps all errors in the standard `{ success: false, error, code, correlationId }` format
- Logs unhandled exceptions with stack traces and correlation IDs
- Differentiates between operational errors and programmer errors

### REC-05: Expand frontend RBAC rules
**Priority: Medium** | **Effort: 4-6 hours**

Add RBAC rules for all protected route groups (CRM, Sales, TMS, Carrier, Accounting, etc.) in `middleware.ts`. Map each route group to its required roles. This provides faster unauthorized-access feedback without waiting for API calls.

### REC-06: Environment-based CORS and proxy configuration
**Priority: High** | **Effort: 2-3 hours**

Replace hardcoded localhost URLs with environment variables:
- `main.ts` CORS: Read allowed origins from `CORS_ORIGINS` env var
- `next.config.js` rewrite: Read API URL from `API_BASE_URL` env var (Next.js supports environment variables in rewrites)

### REC-07: Replace BaseRepository `any` casts with generics
**Priority: Low** | **Effort: 4-6 hours**

Refactor `BaseRepository` to use Prisma's generated delegate types. This requires a type mapping from model name string to Prisma delegate type, which Prisma 6 supports via `PrismaClient[ModelName]`.

### REC-08: Make soft-delete model list declarative
**Priority: Medium** | **Effort: 2-3 hours**

Move the hardcoded soft-delete model set to a configuration constant or derive it from Prisma schema annotations. Consider using a Prisma extension (`$extends`) instead of middleware, which is the recommended approach in Prisma 6.

### REC-09: Add NestJS build outputs to Turborepo
**Priority: Low** | **Effort: 30 minutes**

Update `turbo.json` build task to include `dist/**` in outputs alongside `.next/**`. This enables proper build caching for the API app.

### REC-10: Rename root package
**Priority: Low** | **Effort: 5 minutes**

Change the root `package.json` name from `"src"` to `"ultra-tms"` or `"@ultra-tms/root"` for clarity.

### REC-11: Establish frontend testing strategy
**Priority: Critical** | **Effort: 40-80 hours**

With only 10 test files for 115+ components (8.7% coverage), frontend testing is the single largest gap. Establish a testing strategy:
- Unit tests for all hooks and utility functions
- Component tests for all shared components
- Integration tests for critical user flows (login, carrier CRUD, load management)
- Target: 60%+ component coverage within 4 weeks

### REC-12: Configure request body size limits
**Priority: Medium** | **Effort: 30 minutes**

Add explicit body parser limits in `main.ts`:
```typescript
app.useBodyParser('json', { limit: '10mb' });
app.useBodyParser('urlencoded', { limit: '10mb', extended: true });
```

### REC-13: Add security headers via Helmet
**Priority: High** | **Effort: 1 hour**

Install and configure `helmet` in `main.ts` to add security headers (CSP, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, etc.). No security header middleware is currently configured.

---

## Appendix: File References

| File | Purpose |
|------|---------|
| `turbo.json` | Turborepo task pipeline configuration |
| `package.json` (root) | Monorepo root with workspace scripts |
| `pnpm-workspace.yaml` | pnpm workspace definition |
| `apps/api/src/app.module.ts` | NestJS root module (41 modules, 3 guards, 2 interceptors, 2 middleware) |
| `apps/api/src/main.ts` | API bootstrap (CORS, validation, Swagger, prefix) |
| `apps/api/src/swagger.ts` | Swagger/OpenAPI configuration (53 tags) |
| `apps/api/src/prisma.service.ts` | Prisma client with soft-delete middleware |
| `apps/api/src/common/guards/roles.guard.ts` | RBAC guard with role + permission checks |
| `apps/api/src/common/guards/custom-throttler.guard.ts` | Three-tier rate limiting |
| `apps/api/src/common/interceptors/response-transform.interceptor.ts` | Response normalization |
| `apps/api/src/common/middleware/correlation-id.middleware.ts` | Request correlation ID |
| `apps/api/src/common/middleware/request-logging.middleware.ts` | Structured HTTP logging |
| `apps/api/src/common/repositories/base.repository.ts` | Abstract repository with soft-delete |
| `apps/web/next.config.js` | Next.js config with API proxy rewrite |
| `apps/web/middleware.ts` | Frontend auth + RBAC middleware |
| `apps/web/lib/api/client.ts` | API client with token refresh |
| `apps/web/lib/config/auth.ts` | Auth configuration constants |
| `docker-compose.yml` | Infrastructure services |
| `CLAUDE.md` | Development guide and conventions |
