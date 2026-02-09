# Tech Debt Catalog

**Project:** Ultra TMS - 3PL Logistics Platform
**Review Date:** 2026-02-07
**Reviewer:** Claude Opus 4.6
**Scope:** Full codebase analysis -- architecture, patterns, dependencies, testing, configuration

---

## Table of Contents

1. [Summary Table](#summary-table)
2. [Architectural Debt](#architectural-debt)
3. [Pattern Debt](#pattern-debt)
4. [Dependency Debt](#dependency-debt)
5. [Testing Debt](#testing-debt)
6. [Configuration Debt](#configuration-debt)
7. [Dead Code and .bak Files](#dead-code-and-bak-files)
8. [Prioritized Cleanup Plan](#prioritized-cleanup-plan)

---

## 1. Summary Table

| Category | Items | Est. Hours | Priority |
|----------|-------|------------|----------|
| Architectural Debt | 6 items | 32-54 hrs | P0-P2 |
| Pattern Debt | 5 items | 12-20 hrs | P1-P2 |
| Dependency Debt | 4 items | 6-10 hrs | P1-P3 |
| Testing Debt | 3 items | 60-100 hrs | P0 |
| Configuration Debt | 4 items | 6-10 hrs | P1-P2 |
| Dead Code / .bak Files | 3 items | 3-6 hrs | P1 |
| **Total** | **25 items** | **119-200 hrs** | -- |

---

## 2. Architectural Debt

### DEBT-001: Monolithic Page Components
**Priority: P1** | **Effort: 8-12 hours** | **Impact: High**

**Evidence:** The carrier management page is 858 lines long. Pages of this size bundle multiple concerns (data fetching, state management, validation, rendering, event handling) into a single file.

**Impact:**
- Extremely difficult to unit test individual page sections
- Code reviews become unwieldy; reviewers miss bugs in large diffs
- Performance suffers as the entire page re-renders on any state change
- Multiple developers cannot work on different sections simultaneously

**Fix:** Decompose into sub-components following a consistent pattern:
- `CarrierListPage` (page shell, data fetching, layout)
- `CarrierTable` (table rendering, sorting, filtering)
- `CarrierFilters` (filter bar)
- `CarrierActions` (bulk actions, toolbar)
- `CarrierDetailPanel` (slide-over detail view)
- Custom hooks: `useCarriers()`, `useCarrierFilters()`, `useCarrierMutations()`

Target: No page component exceeds 200 lines.

---

### DEBT-002: Missing Shared Types Package
**Priority: P0** | **Effort: 8-16 hours** | **Impact: Critical**

**Evidence:** No `packages/types` or `@repo/types` package exists. The frontend defines its own API response types in `apps/web/lib/api/client.ts`:

```typescript
// Frontend definition
interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number; };
}
```

The backend defines equivalent types in `apps/api/src/common/interfaces/response.interface.ts` and `apps/api/src/common/dto/api-responses.dto.ts`. These are maintained independently.

**Impact:**
- Type drift: Frontend and backend response shapes can diverge without compile-time errors
- Entity types (Carrier, Load, User, etc.) are defined separately in each app
- Role enums and status constants are duplicated
- Changes to API contracts require manual synchronization across apps

**Fix:** Create `packages/types` with:
- `api-responses.ts` -- shared response envelope types
- `entities/` -- entity interface definitions
- `enums/` -- role, status, and other enum types
- `validation/` -- shared Zod schemas (used by both frontend forms and backend DTOs)

---

### DEBT-003: Underutilized @repo/ui Package
**Priority: P2** | **Effort: 4-8 hours** | **Impact: Medium**

**Evidence:** `@repo/ui` is declared as a workspace dependency in `apps/web/package.json` (`"@repo/ui": "workspace:*"`), but only 1 import reference was found across the entire web app. All shadcn/ui components (40+) reside in `apps/web/components/ui/`.

**Impact:**
- If a `docs` app or another frontend is added, UI components cannot be shared
- The package occupies workspace configuration space without providing value
- Developers may be confused about where to add new components

**Fix:** Either:
- (A) Migrate common shadcn/ui components to `@repo/ui` and import from there, or
- (B) Remove the package and simplify the workspace if a single frontend is the long-term plan

---

### DEBT-004: Hardcoded Soft-Delete Model Set
**Priority: P1** | **Effort: 3-4 hours** | **Impact: High**

**Evidence:** `apps/api/src/prisma.service.ts` contains a hardcoded `Set` of 30+ model names:

```typescript
const softDeleteModels = new Set([
  'Company', 'Contact', 'Location', 'Load', 'Carrier', 'Driver',
  'CarrierContact', 'InsuranceCertificate', 'CarrierDocument',
  'Document', 'DocumentTemplate', 'DocumentFolder', 'LoadPosting',
  'LoadBid', 'LoadTender', 'TenderRecipient', 'Integration',
  'WebhookEndpoint', 'WebhookSubscription', 'Contract',
  'ContractTemplate', 'ContractRateTable', 'ContractRateLane',
  'ContractSLA', 'VolumeCommitment', 'ContractAmendment',
  'FuelSurchargeTable', 'FuelSurchargeTier', 'RateContract',
  'CommissionPlan', 'CommissionEntry', 'CommissionPayout',
]);
```

**Impact:**
- New models that should be soft-deleted can be missed, causing permanent data loss on delete
- No automated verification that the set matches the schema
- The Prisma `$use` middleware API is deprecated in favor of `$extends` (Prisma 6)

**Fix:** Use Prisma Client Extensions (`$extends`) with a model-level extension. Alternatively, derive the soft-delete model list from the Prisma schema by checking for the presence of a `deletedAt` field:

```typescript
// Derive from schema introspection at startup
const softDeleteModels = Object.keys(Prisma.dmmf.datamodel.models)
  .filter(model => model.fields.some(f => f.name === 'deletedAt'));
```

---

### DEBT-005: BaseRepository `any` Casts
**Priority: P2** | **Effort: 4-6 hours** | **Impact: Medium**

**Evidence:** `apps/api/src/common/repositories/base.repository.ts` -- all 7 methods use `as any`:

```typescript
async findAll(where: Record<string, unknown> = {}): Promise<T[]> {
  return (this.prisma[this.modelName] as any).findMany({
    where: { ...where, deletedAt: null },
  });
}
```

Lines 10, 19, 28, 37, 44, 51, 57 all contain `as any` casts.

**Impact:**
- TypeScript cannot verify query arguments match the model schema
- Misspelled field names, wrong types, and invalid `where` clauses are not caught at compile time
- The generic `T` return type is asserted without verification

**Fix:** Use Prisma's generated delegate types via conditional types:

```typescript
type PrismaDelegate<K extends keyof PrismaClient> = PrismaClient[K] extends {
  findMany: (...args: any[]) => any;
} ? PrismaClient[K] : never;
```

---

### DEBT-006: Stale Commented-Out Code in app.module.ts
**Priority: P3** | **Effort: 15 minutes** | **Impact: Low**

**Evidence:** `apps/api/src/app.module.ts` lines 55-58:

```typescript
// Support services - commented out until schemas are added
// import { AnalyticsModule } from './modules/analytics/analytics.module';
// import { IntegrationHubModule } from './modules/integration-hub/integration-hub.module';
// import { WorkflowModule } from './modules/workflow/workflow.module';
```

These three modules are already imported and active (lines 42-44). The comments are stale.

**Impact:** Confuses developers about which modules are active.

**Fix:** Delete lines 55-58.

---

## 3. Pattern Debt

### DEBT-007: Duplicated Auth Endpoint Skip Lists
**Priority: P1** | **Effort: 1-2 hours** | **Impact: Medium**

**Evidence:** `apps/web/lib/api/client.ts` contains the same list of auth endpoints twice:

**Lines 295-302 (before request):**
```typescript
const skipActivityRefresh =
  endpoint.startsWith("/auth/login") ||
  endpoint.startsWith("/auth/refresh") ||
  endpoint.startsWith("/auth/register") ||
  endpoint.startsWith("/auth/forgot-password") ||
  endpoint.startsWith("/auth/reset-password") ||
  endpoint.startsWith("/auth/verify-email") ||
  endpoint.startsWith("/auth/mfa") ||
  endpoint.startsWith("/auth/logout");
```

**Lines 345-353 (after response):**
```typescript
const skipRefresh =
  endpoint.startsWith("/auth/login") ||
  endpoint.startsWith("/auth/refresh") ||
  // ... identical list
```

**Impact:** Adding a new auth endpoint requires updating both lists. If one is missed, token refresh behavior becomes inconsistent.

**Fix:** Extract to a constant:
```typescript
const AUTH_SKIP_ENDPOINTS = ["/auth/login", "/auth/refresh", "/auth/register", ...];
const isAuthEndpoint = (ep: string) => AUTH_SKIP_ENDPOINTS.some(p => ep.startsWith(p));
```

---

### DEBT-008: Dual Token Storage (Cookie + localStorage)
**Priority: P1** | **Effort: 2-4 hours** | **Impact: Medium**

**Evidence:** `apps/web/lib/api/client.ts` stores tokens in both cookies AND localStorage:

```typescript
// setAuthTokens (line 116-118)
writeCookie(AUTH_CONFIG.accessTokenCookie, tokens.accessToken, accessMaxAge);
try {
  localStorage.setItem("accessToken", tokens.accessToken);
} catch { /* ignore */ }
```

The comment at the top of the file states: `NO localStorage usage (XSS-safe)`, but the implementation contradicts this:

```typescript
// getClientAccessToken (line 58-62)
try {
  return localStorage.getItem("accessToken") || undefined;
} catch { return undefined; }
```

**Impact:**
- localStorage is accessible to any JavaScript on the page, making tokens vulnerable to XSS
- The cookie and localStorage values can become out of sync
- The comment misleads security reviewers into thinking localStorage is not used

**Fix:** Remove all `localStorage.setItem/getItem/removeItem` calls for tokens. Use cookie-only storage. If SSR token forwarding is needed, use Next.js `cookies()` API in Server Components.

---

### DEBT-009: Inconsistent Naming -- `page.tsx` vs Flat Modules
**Priority: P3** | **Effort: 2-4 hours** | **Impact: Low**

**Evidence:** The API modules follow two different organizational patterns:

Pattern A (flat): `modules/carrier/carriers.controller.ts`, `modules/carrier/carriers.service.ts`
Pattern B (nested): `modules/claims/claims/claims.controller.ts`, `modules/claims/notes/claim-notes.controller.ts`

**Impact:** Developers must remember which pattern each module follows. Adds cognitive load during navigation.

**Fix:** Standardize on one pattern. The nested pattern (Pattern B) is better for modules with multiple sub-domains (claims has claims, notes, documents, items, resolution, subrogation, reports).

---

### DEBT-010: JWT Decoding Duplicated Across Files
**Priority: P2** | **Effort: 2-3 hours** | **Impact: Medium**

**Evidence:** JWT payload decoding logic appears in at least two files:

1. `apps/web/middleware.ts` -- `decodeRoles()` function (lines 12-45)
2. `apps/web/lib/api/client.ts` -- `decodeJwtPayload()` function (lines 82-97)

Both implement base64 URL-safe decoding with `atob`/`Buffer` fallback.

**Impact:** Bug fixes or security improvements must be applied to both locations. Behavior could diverge.

**Fix:** Extract to `apps/web/lib/utils/jwt.ts` with a single `decodeJwtPayload()` function.

---

### DEBT-011: Console Logging in Middleware
**Priority: P2** | **Effort: 30 minutes** | **Impact: Low**

**Evidence:** `apps/web/middleware.ts` uses `console.log` for RBAC debugging:

```typescript
console.log('[RBAC Middleware]', { pathname, userRoles: roles, requiredRoles: required,
  tokenValue: authToken?.value?.substring(0, 50) + '...', });
console.log('[RBAC Middleware] Access denied - redirecting');
console.log('[RBAC Middleware] Access granted');
```

Lines 83-88, 97, 103.

**Impact:**
- Debug logging in production pollutes server logs
- Token values (even truncated) should not be logged in production
- No log level control

**Fix:** Remove or gate behind `process.env.NODE_ENV === 'development'`.

---

## 4. Dependency Debt

### DEBT-012: TypeScript Version Mismatch Across Apps
**Priority: P2** | **Effort: 1 hour** | **Impact: Medium**

**Evidence:**

| Location | TypeScript Version |
|----------|-------------------|
| Root `package.json` | `5.9.2` |
| `apps/web/package.json` | `5.9.3` |
| `apps/api/package.json` | `5.9.2` |

**Impact:** Minor version difference (5.9.2 vs 5.9.3) could cause subtle type-checking differences between apps. The shared TypeScript config (`@repo/typescript-config`) may behave differently.

**Fix:** Pin all apps to the same TypeScript version. Move TypeScript to the root `devDependencies` and remove per-app overrides, or align all to `5.9.3`.

---

### DEBT-013: Jest Version Mismatch
**Priority: P2** | **Effort: 1-2 hours** | **Impact: Medium**

**Evidence:**

| Location | Jest Version | Notes |
|----------|-------------|-------|
| `apps/web/package.json` | `^30.2.0` | Jest 30 |
| `apps/api/package.json` | `^29.7.0` | Jest 29 |
| `apps/web/package.json` | `@types/jest: ^30.0.0` | |
| `apps/api/package.json` | `@types/jest: ^29.5.12` | |

**Impact:** Different test runner versions mean different APIs, matchers, and behaviors. Test utilities written for one app may not work in the other. `ts-jest` version `29.3.4` in the API may not be fully compatible with the eventual Jest 30 migration.

**Fix:** Standardize both apps on Jest 30 (the web app's version) and update `ts-jest` accordingly.

---

### DEBT-014: @anthropic-ai/sdk in Web Dependencies
**Priority: P3** | **Effort: 30 minutes** | **Impact: Low**

**Evidence:** `apps/web/package.json` includes:

```json
"@anthropic-ai/sdk": "^0.72.1"
```

This is the Anthropic AI client SDK. Its presence in a TMS frontend is unexpected and may be a development artifact.

**Impact:** Adds unnecessary bundle size. May ship API keys if used client-side.

**Fix:** Verify if this is actively used. If it is for server-side AI features, consider moving it to the API. If unused, remove it.

---

### DEBT-015: Node.js Type Version Mismatch
**Priority: P3** | **Effort: 30 minutes** | **Impact: Low**

**Evidence:**

| Location | @types/node Version |
|----------|---------------------|
| `apps/web/package.json` | `^25.0.10` |
| `apps/api/package.json` | `^22.15.3` |

**Impact:** Different Node.js type definitions could cause type incompatibilities in shared utility code.

**Fix:** Align to the same version (the higher one, `^25.0.10`, if the runtime supports it).

---

## 5. Testing Debt

### DEBT-016: Critical Frontend Test Coverage Gap
**Priority: P0** | **Effort: 40-60 hours** | **Impact: Critical**

**Evidence:** The web app has **10 test files** for **115+ components**:

| Test File | Component Tested |
|-----------|-----------------|
| `components/auth/login-form.test.tsx` | Login form |
| `components/layout/sidebar-nav.test.tsx` | Sidebar navigation |
| `components/layout/user-nav.test.tsx` | User navigation dropdown |
| `components/layout/app-header.test.tsx` | App header |
| `components/shared/error-state.test.tsx` | Error state component |
| `components/ui/PageHeader.test.tsx` | Page header |
| `components/crm/customers/customer-table.test.tsx` | Customer table |
| `components/crm/leads/leads-table.test.tsx` | Leads table |
| `components/admin/users/users-table.test.tsx` | Users table |
| `lib/hooks/use-debounce.test.ts` | Debounce hook |

**Coverage: 10/115 = 8.7%**

No tests exist for:
- Any TMS-specific components (loads, dispatch, tracking)
- Any carrier management components (the 858-line carrier page)
- Any accounting/billing components
- Any form components (React Hook Form + Zod integration)
- API client (`lib/api/client.ts` -- 482 lines of complex token/refresh logic)
- Auth context/provider
- Any hooks except `useDebounce`

**Impact:** Frontend regressions are invisible until manual testing or production bugs. The API client's token refresh logic is particularly high-risk without tests.

**Fix:** Prioritized testing plan:
1. **Week 1:** API client (`client.ts`), auth hooks, auth context -- highest risk, most complex logic
2. **Week 2:** Form components (login, register, carrier form) -- user-facing, regression-prone
3. **Week 3:** Table components (generic data table, carrier table, load table) -- shared patterns
4. **Week 4:** Page-level integration tests for critical flows

---

### DEBT-017: Backend Tests May Not Be Running
**Priority: P1** | **Effort: 2-4 hours** | **Impact: High**

**Evidence:** Although 230 `.spec.ts` files exist in the API, there is no `test` task in `turbo.json`, meaning tests are not run as part of the build pipeline. The Jest config uses `--runInBand` (sequential execution), suggesting tests may have race conditions when run in parallel.

**Impact:** Tests may be silently skipped in CI/CD. Developers may not run them locally.

**Fix:**
1. Add `test` task to `turbo.json`
2. Add test step to CI/CD pipeline
3. Investigate whether `--runInBand` is necessary (database access patterns may require it)

---

### DEBT-018: No Integration or E2E Tests for Frontend
**Priority: P1** | **Effort: 16-30 hours** | **Impact: High**

**Evidence:** No Playwright, Cypress, or similar E2E test files were found. The `CLAUDE.md` mentions Playwright as a plugin for "Browser automation for E2E visual testing" but no test files exist.

**Impact:** Critical user flows (login -> navigate -> create carrier -> manage loads -> invoice) are never verified end-to-end. Interactions between components, routing, and API calls are untested.

**Fix:** Set up Playwright with test files for the 5 most critical user flows:
1. Login and session management
2. Carrier CRUD
3. Load creation and dispatch
4. Invoice generation
5. Search and filtering

---

## 6. Configuration Debt

### DEBT-019: No Explicit Body Parser Limits
**Priority: P1** | **Effort: 30 minutes** | **Impact: High**

**Evidence:** `apps/api/src/main.ts` does not configure body parser size limits. Express defaults to 100KB for JSON. For a TMS that handles document uploads and bulk operations, this may be insufficient (and should be explicit).

**Impact:**
- Large payloads silently fail with 413 errors
- No protection against intentionally large payloads (DoS vector)
- Developers may not realize the implicit limit exists

**Fix:** Add explicit limits:
```typescript
app.useBodyParser('json', { limit: '10mb' });
app.useBodyParser('urlencoded', { limit: '10mb', extended: true });
```

---

### DEBT-020: Missing Security Headers (No Helmet)
**Priority: P1** | **Effort: 1 hour** | **Impact: High**

**Evidence:** No `helmet` package is installed or configured. No security headers (`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`) are set anywhere in the codebase.

**Impact:**
- Clickjacking via iframe embedding
- MIME-type sniffing attacks
- No HSTS enforcement
- Missing Content-Security-Policy allows inline scripts

**Fix:** Install `helmet` and add to `main.ts`:
```typescript
import helmet from 'helmet';
app.use(helmet());
```

---

### DEBT-021: CORS Hardcoded to localhost
**Priority: P1** | **Effort: 1-2 hours** | **Impact: High**

**Evidence:** `apps/api/src/main.ts`:

```typescript
app.enableCors({
  origin: ['http://localhost:3000', 'http://localhost:3002'],
  credentials: true,
});
```

**Impact:**
- Production deployments require code changes to update CORS
- Staging environments cannot access the API without modifying source code
- No wildcard handling, no origin validation callback

**Fix:** Read from environment:
```typescript
const corsOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'];
app.enableCors({ origin: corsOrigins, credentials: true });
```

---

### DEBT-022: Root Package Named `"src"`
**Priority: P3** | **Effort: 5 minutes** | **Impact: Low**

**Evidence:** Root `package.json`:

```json
{ "name": "src" }
```

**Impact:** Misleading in pnpm workspace resolution, npm audit reports, and CI logs.

**Fix:** Rename to `"ultra-tms"` or `"@ultra-tms/root"`.

---

## 7. Dead Code and .bak Files

### DEBT-023: Five `.bak` Directories in API Modules
**Priority: P1** | **Effort: 1-2 hours** | **Impact: Medium**

**Evidence:** Five `.bak` directories exist in `apps/api/src/modules/`:

| Directory | Active Counterpart | Status |
|-----------|-------------------|--------|
| `analytics.bak/` | `analytics/` | Active module exists |
| `carrier.bak/` | `carrier/` | Active module exists |
| `documents.bak/` | `documents/` | Active module exists |
| `integration-hub.bak/` | `integration-hub/` | Active module exists |
| `workflow.bak/` | `workflow/` | Active module exists |

These directories are explicitly excluded from:
- TypeScript compilation: `tsconfig.json` excludes `"src/modules/*.bak"`
- ESLint: `eslint.config.mjs` ignores `'src/modules/*.bak/**'` and `'src/modules/**/*.bak/**'`

The `.bak` directories contain full module code (controllers, services, DTOs) that reference `tenantId`, `bcrypt`, and other active patterns.

**Impact:**
- Increases repository size and clone time
- Confuses developers about which code is active
- May contain security-sensitive code (e.g., `documents.bak/shares.service.ts` references `bcrypt`)
- Git grep/search results include dead code

**Fix:** Delete all `.bak` directories. Git history preserves the old code if needed.

---

### DEBT-024: Stale Comments in app.module.ts
**Priority: P3** | **Effort: 5 minutes** | **Impact: Low**

**Evidence:** Lines 55-58 of `app.module.ts`:

```typescript
// Support services - commented out until schemas are added
// import { AnalyticsModule } from './modules/analytics/analytics.module';
// import { IntegrationHubModule } from './modules/integration-hub/integration-hub.module';
// import { WorkflowModule } from './modules/workflow/workflow.module';
```

All three modules are actively imported and registered above (lines 42-44).

**Fix:** Delete the stale comment block.

---

### DEBT-025: test-output.txt in Web App
**Priority: P3** | **Effort: 5 minutes** | **Impact: Low**

**Evidence:** `apps/web/test-output.txt` was found via grep. This appears to be a test output artifact that was accidentally committed.

**Impact:** Pollutes the repository with transient test artifacts.

**Fix:** Delete the file and add `test-output.txt` to `.gitignore`.

---

## 8. Prioritized Cleanup Plan

### Phase 1: Critical (Week 1) -- 20-30 hours
| ID | Task | Hours | Priority |
|----|------|-------|----------|
| DEBT-016 | Begin frontend test coverage (API client, auth) | 10-15 | P0 |
| DEBT-002 | Create `@repo/types` shared package | 8-16 | P0 |
| DEBT-020 | Install and configure Helmet | 1 | P1 |
| DEBT-021 | Environment-based CORS configuration | 1-2 | P1 |

### Phase 2: High Priority (Week 2) -- 20-30 hours
| ID | Task | Hours | Priority |
|----|------|-------|----------|
| DEBT-016 | Continue frontend tests (forms, tables) | 15-20 | P0 |
| DEBT-023 | Remove all `.bak` directories | 1-2 | P1 |
| DEBT-017 | Verify backend tests run, add to pipeline | 2-4 | P1 |
| DEBT-008 | Remove localStorage token storage | 2-4 | P1 |
| DEBT-019 | Add explicit body parser limits | 0.5 | P1 |

### Phase 3: Medium Priority (Weeks 3-4) -- 30-40 hours
| ID | Task | Hours | Priority |
|----|------|-------|----------|
| DEBT-001 | Decompose carrier page (and other large pages) | 8-12 | P1 |
| DEBT-004 | Refactor soft-delete to Prisma extensions | 3-4 | P1 |
| DEBT-007 | Extract auth endpoint skip list | 1-2 | P1 |
| DEBT-018 | Set up Playwright E2E tests | 16-20 | P1 |
| DEBT-011 | Remove console.log from middleware | 0.5 | P2 |
| DEBT-010 | Extract shared JWT decode utility | 2-3 | P2 |

### Phase 4: Low Priority (Ongoing) -- 10-20 hours
| ID | Task | Hours | Priority |
|----|------|-------|----------|
| DEBT-012 | Align TypeScript versions | 1 | P2 |
| DEBT-013 | Align Jest versions | 1-2 | P2 |
| DEBT-003 | Decide on `@repo/ui` strategy | 4-8 | P2 |
| DEBT-005 | Replace BaseRepository `any` casts | 4-6 | P2 |
| DEBT-009 | Standardize module naming patterns | 2-4 | P3 |
| DEBT-006 | Clean stale comments | 0.25 | P3 |
| DEBT-014 | Audit `@anthropic-ai/sdk` usage | 0.5 | P3 |
| DEBT-015 | Align `@types/node` versions | 0.5 | P3 |
| DEBT-022 | Rename root package | 0.1 | P3 |
| DEBT-024 | Remove stale comments | 0.1 | P3 |
| DEBT-025 | Remove test-output.txt | 0.1 | P3 |

---

## Appendix: Evidence File References

| Debt ID | Primary File(s) |
|---------|----------------|
| DEBT-001 | `apps/web/app/(dashboard)/carrier/page.tsx` |
| DEBT-002 | `apps/web/lib/api/client.ts`, `apps/api/src/common/interfaces/response.interface.ts` |
| DEBT-003 | `apps/web/package.json` (`@repo/ui: workspace:*`) |
| DEBT-004 | `apps/api/src/prisma.service.ts` (lines 22-55) |
| DEBT-005 | `apps/api/src/common/repositories/base.repository.ts` (7 `as any` casts) |
| DEBT-006 | `apps/api/src/app.module.ts` (lines 55-58) |
| DEBT-007 | `apps/web/lib/api/client.ts` (lines 295-302, 345-353) |
| DEBT-008 | `apps/web/lib/api/client.ts` (lines 58-62, 116-118) |
| DEBT-009 | `apps/api/src/modules/carrier/` vs `apps/api/src/modules/claims/claims/` |
| DEBT-010 | `apps/web/middleware.ts` (lines 12-45), `apps/web/lib/api/client.ts` (lines 82-97) |
| DEBT-011 | `apps/web/middleware.ts` (lines 83-88, 97, 103) |
| DEBT-012 | Root `package.json`, `apps/web/package.json`, `apps/api/package.json` |
| DEBT-013 | `apps/web/package.json`, `apps/api/package.json` |
| DEBT-014 | `apps/web/package.json` (line 18) |
| DEBT-015 | `apps/web/package.json`, `apps/api/package.json` |
| DEBT-016 | `apps/web/` -- 10 `.test.tsx` files found |
| DEBT-017 | `turbo.json` (missing `test` task) |
| DEBT-018 | No Playwright test files found |
| DEBT-019 | `apps/api/src/main.ts` (no body parser config) |
| DEBT-020 | `apps/api/src/main.ts` (no helmet import) |
| DEBT-021 | `apps/api/src/main.ts` (lines 44-47) |
| DEBT-022 | Root `package.json` (line 2: `"name": "src"`) |
| DEBT-023 | `apps/api/src/modules/{analytics,carrier,documents,integration-hub,workflow}.bak/` |
| DEBT-024 | `apps/api/src/app.module.ts` (lines 55-58) |
| DEBT-025 | `apps/web/test-output.txt` |
