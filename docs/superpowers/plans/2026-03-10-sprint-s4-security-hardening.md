# Sprint S4: Security Hardening — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close all STOP-SHIP security items (19 items) and P0 critical findings so the application can move toward production deployment.

**Architecture:** Targeted fixes — add RolesGuard to ~60 controllers, patch tenant isolation gaps in carrier-portal/search/cache/operations, mask credentials in factoring, and harden the EncryptionService. No refactoring, no forTenant() migration (deferred to S4b).

**Tech Stack:** NestJS 10 (guards, decorators), Prisma 6, Elasticsearch 8.13, Redis 7

**Verified State (2026-03-10):**
- S4-01 (Prisma Extension): DONE (QS-014) — built but not yet adopted by services
- S4-05 (Customer Portal JWT): DONE (QS-011 CPORT-016 fix)
- S4-22 (CORS env): DONE (QS-007)
- All other S4 tasks: OPEN and verified against codebase

---

## Chunk 1: Quick Fixes (S4-06, S4-07, S4-09)

### Task 1: S4-06 — Fix Carrier Portal Login Tenant Isolation

**STOP-SHIP SS-008, SS-009: Cross-tenant auth bypass — 4 auth methods query by email without tenantId**

**Files:**
- Modify: `apps/api/src/modules/carrier-portal/auth/carrier-portal-auth.service.ts` (lines 49, 112, 120, 128)
- Modify: `apps/api/src/modules/carrier-portal/auth/carrier-portal-auth.controller.ts` (line 63)

- [ ] **Step 1: Fix login() — add tenantId to WHERE clause**

In `carrier-portal-auth.service.ts`, the `login()` method (line 49) queries by email only:
```typescript
// BEFORE (line 49):
const user = await this.prisma.carrierPortalUser.findFirst({
  where: { email: dto.email, deletedAt: null }
});

// AFTER:
const user = await this.prisma.carrierPortalUser.findFirst({
  where: { email: dto.email, tenantId, deletedAt: null }
});
```
The `login()` method signature needs a `tenantId` parameter. Check how the controller passes it.

- [ ] **Step 2: Fix controller tenantId extraction**

In `carrier-portal-auth.controller.ts` (line 63), the current extraction is unsafe:
```typescript
// BEFORE:
const tenantId = req.headers['x-tenant-id'] || dto.carrierId || 'default-tenant';

// AFTER — require x-tenant-id header for login:
const tenantId = req.headers['x-tenant-id'] as string;
if (!tenantId) {
  throw new BadRequestException('x-tenant-id header is required');
}
```
Apply this to the login endpoint. Register endpoint can keep the carrierId fallback.

- [ ] **Step 3: Fix forgotPassword() — add tenantId**

In `carrier-portal-auth.service.ts` (line 112):
```typescript
// BEFORE:
const user = await this.prisma.carrierPortalUser.findFirst({
  where: { email: dto.email }
});

// AFTER:
const user = await this.prisma.carrierPortalUser.findFirst({
  where: { email: dto.email, tenantId, deletedAt: null }
});
```
Add `tenantId: string` parameter to the method signature. Update the controller to pass it.

- [ ] **Step 4: Fix resetPassword() — add tenantId**

In `carrier-portal-auth.service.ts` (line 120):
```typescript
// BEFORE:
const user = await this.prisma.carrierPortalUser.findFirst({
  where: { verificationToken: dto.token }
});

// AFTER:
const user = await this.prisma.carrierPortalUser.findFirst({
  where: { verificationToken: dto.token, deletedAt: null }
});
```
Note: Token-based lookup is acceptable here since verificationToken has a `@unique` constraint. But add `deletedAt: null`.

- [ ] **Step 5: Fix verifyEmail() — add deletedAt filter**

In `carrier-portal-auth.service.ts` (line 128):
```typescript
// BEFORE:
const user = await this.prisma.carrierPortalUser.findFirst({
  where: { verificationToken: token }
});

// AFTER:
const user = await this.prisma.carrierPortalUser.findFirst({
  where: { verificationToken: token, deletedAt: null }
});
```

- [ ] **Step 6: Verify TypeScript compiles**

Run: `cd apps/api && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No new errors

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/modules/carrier-portal/auth/
git commit -m "fix(security): S4-06 carrier portal login tenant isolation

Add tenantId to login/forgotPassword WHERE clauses.
Add deletedAt filter to resetPassword/verifyEmail.
Require x-tenant-id header on login endpoint.

Closes SS-008."
```

---

### Task 2: S4-09 — Fix EncryptionService Hardcoded Fallback Key

**P0-015: Falls back to 'local-dev-secret' if ENCRYPTION_KEY not set**

**Files:**
- Modify: `apps/api/src/modules/integration-hub/services/encryption.service.ts` (lines 52-64)
- Modify: `apps/api/src/main.ts` (lines 12-33)

- [ ] **Step 1: Make resolveKey() fail-fast in production**

In `encryption.service.ts`, replace `resolveKey()` (lines 52-64):
```typescript
// BEFORE:
private resolveKey(): Buffer {
  const keyHex = this.configService.get<string>('ENCRYPTION_KEY');
  if (keyHex && keyHex.length >= 64) {
    return Buffer.from(keyHex.slice(0, 64), 'hex');
  }
  const fallback =
    this.configService.get<string>('JWT_SECRET') ||
    this.configService.get<string>('PORTAL_JWT_SECRET') ||
    'local-dev-secret';
  return crypto.createHash('sha256').update(fallback).digest();
}

// AFTER:
private resolveKey(): Buffer {
  const keyHex = this.configService.get<string>('ENCRYPTION_KEY');
  if (keyHex && keyHex.length >= 64) {
    return Buffer.from(keyHex.slice(0, 64), 'hex');
  }
  const nodeEnv = this.configService.get<string>('NODE_ENV');
  if (nodeEnv === 'production') {
    throw new Error(
      'ENCRYPTION_KEY environment variable is required in production. ' +
      'Must be a 64-character hex string (32 bytes).',
    );
  }
  // Dev/test fallback only — derive from JWT_SECRET
  const fallback = this.configService.get<string>('JWT_SECRET') || 'local-dev-secret';
  return crypto.createHash('sha256').update(fallback).digest();
}
```

- [ ] **Step 2: Add ENCRYPTION_KEY to .env.example**

Add to `apps/api/.env.example`:
```
# Encryption (required in production, optional in dev)
ENCRYPTION_KEY=                    # 64-char hex string (generate: openssl rand -hex 32)
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd apps/api && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No new errors

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/modules/integration-hub/services/encryption.service.ts apps/api/.env.example
git commit -m "fix(security): S4-09 EncryptionService fail-fast in production

Remove hardcoded 'local-dev-secret' fallback in production.
Throw descriptive error if ENCRYPTION_KEY not configured.
Keep dev/test fallback for local development.

Closes P0-015."
```

---

### Task 3: S4-07 — Fix Factoring apiKey Plaintext Exposure

**STOP-SHIP SS-010: findAll/findOne return apiKey in plaintext**

**Files:**
- Modify: `apps/api/src/modules/factoring/companies/factoring-companies.service.ts` (lines 54-89)

- [ ] **Step 1: Add select clause to exclude apiKey from findAll()**

In `factoring-companies.service.ts`, modify the `findAll()` Prisma query (around line 74) to exclude apiKey:
```typescript
// Add a helper at the top of the service class:
private readonly safeSelect = {
  id: true,
  tenantId: true,
  name: true,
  code: true,
  contactName: true,
  contactEmail: true,
  contactPhone: true,
  address: true,
  city: true,
  state: true,
  zip: true,
  country: true,
  status: true,
  website: true,
  notes: true,
  advanceRate: true,
  feePercentage: true,
  minimumFee: true,
  reservePercentage: true,
  paymentTermDays: true,
  externalId: true,
  sourceSystem: true,
  customFields: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  // apiKey deliberately excluded
} as const;
```

Then in `findAll()`:
```typescript
const [data, total] = await Promise.all([
  this.prisma.factoringCompany.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    select: this.safeSelect,  // ADD THIS
  }),
  this.prisma.factoringCompany.count({ where }),
]);
```

- [ ] **Step 2: Add select clause to findOne() / requireCompany()**

The `findOne()` method calls `requireCompany()`. Modify `requireCompany()` to also use the safe select:
```typescript
// In requireCompany() — add select:
const company = await this.prisma.factoringCompany.findFirst({
  where: { id, tenantId, deletedAt: null },
  select: this.safeSelect,  // ADD THIS
});
```

- [ ] **Step 3: Ensure create() and update() also exclude apiKey from response**

If `create()` returns the full object, add select there too. For `update()`, same pattern.

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd apps/api && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No new errors (select may change return type — fix any type issues)

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/modules/factoring/companies/
git commit -m "fix(security): S4-07 exclude factoring apiKey from GET responses

Add select clause to findAll/findOne/create/update to exclude apiKey.
API keys should never be returned in list/detail endpoints.

Closes SS-010."
```

---

## Chunk 2: RolesGuard Sweep (S4-02, S4-03, S4-04)

### Task 4: S4-02 — Fix RolesGuard on Financial Controllers (23 controllers)

**STOP-SHIP SS-016 + P0-004 through P0-008: Any authenticated user can approve settlements, post journal entries, manage credit**

**Pattern:** For each controller, change `@UseGuards(JwtAuthGuard)` to `@UseGuards(JwtAuthGuard, RolesGuard)` and ensure `@Roles(...)` is present. Import paths:
```typescript
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
```

**Files to modify (17 controllers missing RolesGuard):**

**Accounting (6 controllers — all line 20 except where noted):**
- `apps/api/src/modules/accounting/controllers/chart-of-accounts.controller.ts` → add RolesGuard + `@Roles('ADMIN', 'ACCOUNTING')`
- `apps/api/src/modules/accounting/controllers/settlements.controller.ts` → add RolesGuard + `@Roles('ADMIN', 'ACCOUNTING')`
- `apps/api/src/modules/accounting/controllers/payments-received.controller.ts` → add RolesGuard + `@Roles('ADMIN', 'ACCOUNTING')`
- `apps/api/src/modules/accounting/controllers/payments-made.controller.ts` → add RolesGuard + `@Roles('ADMIN', 'ACCOUNTING')`
- `apps/api/src/modules/accounting/controllers/journal-entries.controller.ts` → add RolesGuard + `@Roles('ADMIN', 'ACCOUNTING')`
- `apps/api/src/modules/accounting/controllers/payments.controller.ts` (line 10) → add RolesGuard + `@Roles('ADMIN', 'ACCOUNTING')`

Note: `accounting.controller.ts`, `invoices.controller.ts`, `reports.controller.ts` already have @Roles but need RolesGuard added to @UseGuards.

**Credit (5 controllers):**
- `apps/api/src/modules/credit/credit-applications.controller.ts` (line 27) → add RolesGuard (already has @Roles)
- `apps/api/src/modules/credit/collections.controller.ts` (line 13) → add RolesGuard (already has @Roles)
- `apps/api/src/modules/credit/credit-holds.controller.ts` (line 15) → add RolesGuard (already has @Roles)
- `apps/api/src/modules/credit/credit-limits.controller.ts` (line 27) → add RolesGuard (already has @Roles)
- `apps/api/src/modules/credit/payment-plans.controller.ts` (line 17) → add RolesGuard (already has @Roles)

**Contracts (6 controllers):**
- `apps/api/src/modules/contracts/amendments.controller.ts` (line 13) → add RolesGuard (already has @Roles)
- `apps/api/src/modules/contracts/rate-lanes.controller.ts` (line 13) → add RolesGuard (already has @Roles)
- `apps/api/src/modules/contracts/slas.controller.ts` (line 13) → add RolesGuard (already has @Roles)
- `apps/api/src/modules/contracts/fuel-surcharge.controller.ts` (line 16) → add RolesGuard (already has @Roles)
- `apps/api/src/modules/contracts/contract-templates.controller.ts` (line 13) → add RolesGuard (already has @Roles)
- `apps/api/src/modules/contracts/volume-commitments.controller.ts` (line 13) → add RolesGuard (already has @Roles)

**Factoring (3 controllers):**
- `apps/api/src/modules/factoring/carrier-factoring-status.controller.ts` (line 15) → add RolesGuard (already has @Roles)
- `apps/api/src/modules/factoring/noa-records.controller.ts` (line 16) → add RolesGuard (already has @Roles)
- `apps/api/src/modules/factoring/factored-payments.controller.ts` (line 13) → add RolesGuard (already has @Roles)

**Agents (3 controllers):**
- `apps/api/src/modules/agents/agreements/agent-agreements.controller.ts` (line 10) → add RolesGuard (already has @Roles)
- `apps/api/src/modules/agents/assignments/customer-assignments.controller.ts` (line 16) → add RolesGuard (already has @Roles)
- `apps/api/src/modules/agents/leads/agent-leads.controller.ts` (line 17) → add RolesGuard (already has @Roles)

- [ ] **Step 1: Fix Accounting controllers (9 total: 6 add RolesGuard+Roles, 3 add RolesGuard to existing @UseGuards)**

For each file: change `@UseGuards(JwtAuthGuard)` → `@UseGuards(JwtAuthGuard, RolesGuard)` and add import + @Roles if missing.

- [ ] **Step 2: Fix Credit controllers (5 — all already have @Roles, just add RolesGuard)**

- [ ] **Step 3: Fix Contracts controllers (6 — all already have @Roles)**

- [ ] **Step 4: Fix Factoring controllers (3 — all already have @Roles)**

- [ ] **Step 5: Fix Agents controllers (3 — all already have @Roles)**

- [ ] **Step 6: Verify TypeScript compiles**

Run: `cd apps/api && npx tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/modules/accounting/ apps/api/src/modules/credit/ apps/api/src/modules/contracts/ apps/api/src/modules/factoring/ apps/api/src/modules/agents/
git commit -m "fix(security): S4-02 add RolesGuard to all financial controllers

Add RolesGuard to 23 controllers across Accounting (9), Credit (5),
Contracts (6), Factoring (3), and Agents (3).

Previously any authenticated user could approve settlements, post
journal entries, manage credit holds, and modify contracts.

Closes SS-016, P0-004 through P0-008."
```

---

### Task 5: S4-03 — Fix RolesGuard on Data-Modifying Controllers (~47 controllers)

**Same pattern as Task 4. Change `@UseGuards(JwtAuthGuard)` to `@UseGuards(JwtAuthGuard, RolesGuard)` and add import + @Roles.**

**Config (8 controllers — use `@Roles('ADMIN')`, SystemConfig use `@Roles('SUPER_ADMIN')`):**
- `apps/api/src/modules/config/sequences/sequences.controller.ts` (line 10)
- `apps/api/src/modules/config/email-templates/email-templates.controller.ts` (line 10)
- `apps/api/src/modules/config/templates/templates.controller.ts` (line 10)
- `apps/api/src/modules/config/tenant/tenant-config.controller.ts` (line 10)
- `apps/api/src/modules/config/preferences/preferences.controller.ts` (line 10)
- `apps/api/src/modules/config/system/system-config.controller.ts` (line 10) → `@Roles('SUPER_ADMIN')`
- `apps/api/src/modules/config/features/features.controller.ts` (line 10)
- `apps/api/src/modules/config/business-hours/business-hours.controller.ts` (line 10)

Note: `tenant-services.controller.ts` already has method-level RolesGuard — SKIP.

**Audit (8 controllers — already have @Roles('COMPLIANCE', 'ADMIN', 'SUPER_ADMIN'), just add RolesGuard):**
- `apps/api/src/modules/audit/audit.controller.ts` (line 13)
- `apps/api/src/modules/audit/activity/user-activity.controller.ts` (line 12)
- `apps/api/src/modules/audit/alerts/alerts.controller.ts` (line 10)
- `apps/api/src/modules/audit/history/change-history.controller.ts` (line 10)
- `apps/api/src/modules/audit/api/api-audit.controller.ts` (line 10)
- `apps/api/src/modules/audit/compliance/compliance.controller.ts` (line 10)
- `apps/api/src/modules/audit/retention/retention.controller.ts` (line 10)
- `apps/api/src/modules/audit/logs/audit-logs.controller.ts` (line 10)

**Load Board (6 controllers missing — 3 already correct):**
- `apps/api/src/modules/load-board/rules/rules.controller.ts` (line 10) → `@Roles('ADMIN', 'DISPATCHER')`
- `apps/api/src/modules/load-board/analytics/analytics.controller.ts` (line 9) → `@Roles('ADMIN', 'DISPATCHER', 'OPERATIONS_MANAGER')`
- `apps/api/src/modules/load-board/posting/posting.controller.ts` (line 10) → `@Roles('ADMIN', 'DISPATCHER')`
- `apps/api/src/modules/load-board/leads/leads.controller.ts` (line 17) → `@Roles('ADMIN', 'DISPATCHER', 'SALES_REP')`
- `apps/api/src/modules/load-board/capacity/capacity.controller.ts` (line 10) → `@Roles('ADMIN', 'DISPATCHER', 'OPERATIONS_MANAGER')`
- `apps/api/src/modules/load-board/accounts/accounts.controller.ts` (line 10) → `@Roles('ADMIN')`

**HR (6 controllers — all have method-level @Roles, just add RolesGuard to class):**
- `apps/api/src/modules/hr/time-tracking/time-entries.controller.ts` (line 10)
- `apps/api/src/modules/hr/employees/employees.controller.ts` (line 10)
- `apps/api/src/modules/hr/positions/positions.controller.ts` (line 10)
- `apps/api/src/modules/hr/departments/departments.controller.ts` (line 10)
- `apps/api/src/modules/hr/locations/locations.controller.ts` (line 10)
- `apps/api/src/modules/hr/time-off/time-off.controller.ts` (line 15)

**Scheduler (5 controllers — add `@Roles('ADMIN', 'OPERATIONS_MANAGER')`):**
- `apps/api/src/modules/scheduler/reminders/reminders.controller.ts` (line 10)
- `apps/api/src/modules/scheduler/templates/templates.controller.ts` (line 10)
- `apps/api/src/modules/scheduler/tasks/tasks.controller.ts` (line 10)
- `apps/api/src/modules/scheduler/executions/executions.controller.ts` (line 9)
- `apps/api/src/modules/scheduler/jobs/jobs.controller.ts` (line 10)

**Safety (5 controllers missing — 4 already correct):**
- `apps/api/src/modules/safety/watchlist/watchlist.controller.ts` (line 14)
- `apps/api/src/modules/safety/insurance/insurance.controller.ts` (line 14)
- `apps/api/src/modules/safety/csa/csa.controller.ts` (line 10)
- `apps/api/src/modules/safety/fmcsa/fmcsa.controller.ts` (line 12)
- `apps/api/src/modules/safety/alerts/alerts.controller.ts` (line 13)

- [ ] **Step 1: Fix Config controllers (8)**
- [ ] **Step 2: Fix Audit controllers (8)**
- [ ] **Step 3: Fix Load Board controllers (6)**
- [ ] **Step 4: Fix HR controllers (6)**
- [ ] **Step 5: Fix Scheduler controllers (5)**
- [ ] **Step 6: Fix Safety controllers (5)**
- [ ] **Step 7: Verify TypeScript compiles**
- [ ] **Step 8: Commit**

```bash
git add apps/api/src/modules/config/ apps/api/src/modules/audit/ apps/api/src/modules/load-board/ apps/api/src/modules/hr/ apps/api/src/modules/scheduler/ apps/api/src/modules/safety/
git commit -m "fix(security): S4-03 add RolesGuard to data-modifying controllers

Add RolesGuard to 38 controllers across Config (8), Audit (8),
Load Board (6), HR (6), Scheduler (5), Safety (5).

Closes P0-016, P1-001 through P1-003."
```

---

### Task 6: S4-04 — Fix RolesGuard on Remaining Controllers (~24 controllers)

**Same pattern. Last batch of controllers.**

**EDI (3 controllers missing — documents + trading-partners already correct):**
- `apps/api/src/modules/edi/mappings/edi-mappings.controller.ts` (line 13)
- `apps/api/src/modules/edi/generation/edi-generation.controller.ts` (line 16 + line 85 second controller)
- `apps/api/src/modules/edi/queue/edi-queue.controller.ts` (line 10)
→ `@Roles('ADMIN', 'EDI_MANAGER', 'OPERATIONS_MANAGER')`

**Search (2 controllers missing — admin + global already correct):**
- `apps/api/src/modules/search/saved/saved-searches.controller.ts` (line 10)
- `apps/api/src/modules/search/entities/entity-search.controller.ts` (line 10)
→ `@Roles('ADMIN', 'OPERATIONS_MANAGER', 'DISPATCHER', 'SALES_REP', 'ACCOUNTING', 'CARRIER_MANAGER', 'AGENT')`

**Workflow (2 controllers missing — templates + workflows already correct):**
- `apps/api/src/modules/workflow/executions.controller.ts` (line 10 + line 88)
- `apps/api/src/modules/workflow/approvals.controller.ts` (line 15)

**Help Desk (5 controllers):**
- `apps/api/src/modules/help-desk/tickets/tickets.controller.ts` (line 16)
- `apps/api/src/modules/help-desk/canned-responses/canned-responses.controller.ts` (line 10)
- `apps/api/src/modules/help-desk/teams/teams.controller.ts` (line 10)
- `apps/api/src/modules/help-desk/knowledge-base/kb.controller.ts` (line 18)
- `apps/api/src/modules/help-desk/sla/sla-policies.controller.ts` (line 10)

**Feedback (5 controllers — add `@Roles('ADMIN')`):**
- `apps/api/src/modules/feedback/features/features.controller.ts` (line 10)
- `apps/api/src/modules/feedback/widgets/widgets.controller.ts` (line 10)
- `apps/api/src/modules/feedback/entries/feedback-entries.controller.ts` (line 10)
- `apps/api/src/modules/feedback/surveys/surveys.controller.ts` (line 10)
- `apps/api/src/modules/feedback/nps/nps.controller.ts` (line 11)

**Cache (4 controllers — add `@Roles('SUPER_ADMIN')`):**
- `apps/api/src/modules/cache/rate-limiting/rate-limit.controller.ts` (line 10)
- `apps/api/src/modules/cache/locking/locks.controller.ts` (line 9)
- `apps/api/src/modules/cache/config/cache-config.controller.ts` (line 11)
- `apps/api/src/modules/cache/management/cache-management.controller.ts` (line 10)

**Claims (1 controller):**
- `apps/api/src/modules/claims/reports/reports.controller.ts` (line 10) → already has @Roles, add RolesGuard

- [ ] **Step 1: Fix EDI controllers (3)**
- [ ] **Step 2: Fix Search controllers (2)**
- [ ] **Step 3: Fix Workflow controllers (2)**
- [ ] **Step 4: Fix Help Desk controllers (5)**
- [ ] **Step 5: Fix Feedback controllers (5)**
- [ ] **Step 6: Fix Cache controllers (4)**
- [ ] **Step 7: Fix Claims reports controller (1)**
- [ ] **Step 8: Verify TypeScript compiles**
- [ ] **Step 9: Commit**

```bash
git add apps/api/src/modules/edi/ apps/api/src/modules/search/ apps/api/src/modules/workflow/ apps/api/src/modules/help-desk/ apps/api/src/modules/feedback/ apps/api/src/modules/cache/ apps/api/src/modules/claims/
git commit -m "fix(security): S4-04 add RolesGuard to remaining controllers

Add RolesGuard to 22 controllers across EDI (3), Search (2),
Workflow (2), Help Desk (5), Feedback (5), Cache (4), Claims (1).

Cache controllers restricted to SUPER_ADMIN.

Closes P1-004 through P1-009."
```

---

## Chunk 3: Tenant Isolation Fixes (S4-11, S4-12, S4-13)

### Task 7: S4-11 — Fix Elasticsearch Queries Missing tenantId

**STOP-SHIP SS-001: searchGlobal(), searchEntity(), suggest() return results from ALL tenants**

**Files:**
- Modify: `apps/api/src/modules/search/elasticsearch/elasticsearch.service.ts` (lines 56-140)
- Modify: `apps/api/src/modules/search/global/global-search.service.ts` (line 17 — pass tenantId)
- Modify: `apps/api/src/modules/search/entities/entity-search.service.ts` (line 37 — pass tenantId)

- [ ] **Step 1: Add tenantId parameter to searchGlobal()**

```typescript
// BEFORE (line 56):
async searchGlobal(query: string, entityTypes?: string[], limit = 20, offset = 0)

// AFTER:
async searchGlobal(tenantId: string, query: string, entityTypes?: string[], limit = 20, offset = 0)
```

Change the query body to use bool/must with tenantId filter:
```typescript
query: {
  bool: {
    must: [
      {
        multi_match: {
          query,
          fields: ['title^2', 'name^2', 'description', 'content'],
          operator: 'and',
        },
      },
    ],
    filter: [
      { term: { tenantId } },
    ],
  },
},
```

- [ ] **Step 2: Add tenantId parameter to searchEntity()**

```typescript
// BEFORE (line 82):
async searchEntity(entityType: string, query: string | undefined, filters: Record<string, unknown> | undefined, limit = 20, offset = 0)

// AFTER:
async searchEntity(tenantId: string, entityType: string, query: string | undefined, filters: Record<string, unknown> | undefined, limit = 20, offset = 0)
```

Always include tenantId in the filter clause:
```typescript
const filter: any[] = [{ term: { tenantId } }];
// ... rest of query building
query: { bool: { must: must.length ? must : [{ match_all: {} }], filter } },
```

- [ ] **Step 3: Add tenantId parameter to suggest()**

```typescript
// BEFORE (line 118):
async suggest(query: string, limit = 10)

// AFTER:
async suggest(tenantId: string, query: string, limit = 10)
```

Add a query filter alongside the suggest:
```typescript
const res = await this.client.search({
  index: `${this.prefix}-*-v1`,
  size: 0,
  query: { term: { tenantId } },
  suggest: { /* ... existing suggest config ... */ },
});
```

- [ ] **Step 4: Update callers to pass tenantId**

In `global-search.service.ts` — pass tenantId from controller/request context.
In `entity-search.service.ts` — pass tenantId from controller/request context.

- [ ] **Step 5: Verify TypeScript compiles**
- [ ] **Step 6: Commit**

```bash
git add apps/api/src/modules/search/
git commit -m "fix(security): S4-11 add tenantId filtering to all ES queries

Add tenantId parameter and bool/filter clause to searchGlobal(),
searchEntity(), and suggest() methods. Update callers.

Previously ALL search results leaked across tenants.

Closes SS-001."
```

---

### Task 8: S4-12 — Fix Cache 8 Endpoints Missing tenantId

**STOP-SHIP SS-002: Any authenticated user can delete caches, release locks, view rate limits for other tenants**

**Files:**
- Modify: `apps/api/src/modules/cache/management/cache-management.controller.ts` (lines 37, 46)
- Modify: `apps/api/src/modules/cache/locking/locks.controller.ts` (lines 28, 37, 46)
- Modify: `apps/api/src/modules/cache/rate-limiting/rate-limit.controller.ts` (lines 29, 47, 56)
- Modify: corresponding service files to accept and use tenantId

- [ ] **Step 1: Fix cache-management.controller.ts — keys() and deletePattern()**

Add `@CurrentTenant() tenantId: string` parameter. Prefix pattern with tenant scope in service:
```typescript
// Controller:
@Get('keys/:pattern')
keys(@CurrentTenant() tenantId: string, @Param('pattern') pattern?: string) {
  return this.cacheService.listKeys(tenantId, pattern ?? '*');
}

@Delete('keys/:pattern')
deletePattern(@CurrentTenant() tenantId: string, @Param('pattern') pattern: string) {
  return this.cacheService.deleteByPattern(tenantId, pattern);
}
```

In the service, scope the Redis key pattern to the tenant:
```typescript
async listKeys(tenantId: string, pattern: string) {
  const scopedPattern = `tenant:${tenantId}:${pattern}`;
  // ... existing logic with scoped pattern
}
```

- [ ] **Step 2: Fix locks.controller.ts — history(), details(), forceRelease()**

Add `@CurrentTenant() tenantId: string` and pass to service. In service, add `tenantId` to Prisma WHERE:
```typescript
// distributed-lock.service.ts:
async history(tenantId: string, lockKey?: string) {
  return this.prisma.distributedLock.findMany({
    where: { ...(lockKey ? { lockKey } : {}), tenantId },
    orderBy: { acquiredAt: 'desc' },
  });
}
```

- [ ] **Step 3: Fix rate-limit.controller.ts — get(), usage(), reset()**

Add `@CurrentTenant() tenantId: string` and pass to service. In service, add tenantId to queries:
```typescript
async getByKey(tenantId: string, key: string) {
  return this.prisma.rateLimit.findFirst({
    where: { identifier: key, tenantId },
  });
}
```

- [ ] **Step 4: Verify TypeScript compiles**
- [ ] **Step 5: Commit**

```bash
git add apps/api/src/modules/cache/
git commit -m "fix(security): S4-12 add tenantId to 8 cache endpoints

Add @CurrentTenant() to keys, deletePattern, lock history/details/release,
rate-limit get/usage/reset. Scope Redis operations to tenant.

Closes SS-002."
```

---

### Task 9: S4-13 — Fix Operations LoadHistory Soft-Delete Gap

**STOP-SHIP SS-003: getByCarrier() and getSimilarLoads() missing deletedAt filter**

**Files:**
- Modify: `apps/api/src/modules/operations/load-history/load-history.service.ts` (lines 259-310)

- [ ] **Step 1: Add deletedAt: null to getByCarrier()**

```typescript
// Line 263 — add to where clause:
where: {
  tenantId,
  carrierId,
  isActive: true,
  deletedAt: null,  // ADD THIS
},
```

- [ ] **Step 2: Add deletedAt: null to getSimilarLoads()**

```typescript
// Around line 295 — add to where clause:
isActive: true,
deletedAt: null,  // ADD THIS
```

- [ ] **Step 3: Verify TypeScript compiles**
- [ ] **Step 4: Commit**

```bash
git add apps/api/src/modules/operations/load-history/
git commit -m "fix(security): S4-13 add deletedAt filter to LoadHistory queries

Add deletedAt: null to getByCarrier() and getSimilarLoads().
Deleted load history records were appearing in carrier queries.

Closes SS-003."
```

---

## Chunk 4: Credential Encryption (S4-08, S4-10)

### Task 10: S4-08 — Encrypt Rate Intelligence Credentials

**STOP-SHIP SS-011: apiKey, apiSecret, password stored in PLAINTEXT**

**Files:**
- Modify: Rate Intelligence service to use EncryptionService for credential fields
- Modify: Rate Intelligence module to import IntegrationHubModule (for EncryptionService)

- [ ] **Step 1: Identify the Rate Intelligence service and model**

Find the service that manages RateProviderConfig. Check `apps/api/src/modules/rate-intelligence/`.

- [ ] **Step 2: Import EncryptionService**

Add IntegrationHubModule (or just EncryptionService) to the Rate Intelligence module imports. Inject EncryptionService into the service.

- [ ] **Step 3: Encrypt credentials on create/update**

Before saving: `encrypted = this.encryptionService.encrypt(dto.apiKey)`.
On read: `decrypted = this.encryptionService.decrypt(stored.apiKey)` — but only when needed internally, never return to client.

- [ ] **Step 4: Exclude credentials from GET responses**

Use select clause (same pattern as S4-07) to exclude apiKey, apiSecret, password from findAll/findOne.

- [ ] **Step 5: Verify TypeScript compiles**
- [ ] **Step 6: Commit**

```bash
git add apps/api/src/modules/rate-intelligence/
git commit -m "fix(security): S4-08 encrypt Rate Intelligence credentials

Encrypt apiKey, apiSecret, password using EncryptionService.
Exclude credential fields from GET responses.

Closes SS-011."
```

---

### Task 11: S4-10 — Encrypt EDI ftpPassword

**SS-012: ftpPassword stored and returned in plaintext**

**Files:**
- Modify: EDI trading partner service to encrypt ftpPassword
- Modify: EDI module to use EncryptionService

- [ ] **Step 1: Identify the EDI service managing trading partners**

Check `apps/api/src/modules/edi/trading-partners/`.

- [ ] **Step 2: Encrypt ftpPassword on create/update**

Same pattern as Task 10.

- [ ] **Step 3: Exclude ftpPassword from GET responses**

Use select clause to exclude from findAll/findOne.

- [ ] **Step 4: Verify TypeScript compiles**
- [ ] **Step 5: Commit**

```bash
git add apps/api/src/modules/edi/
git commit -m "fix(security): S4-10 encrypt EDI ftpPassword

Encrypt ftpPassword using EncryptionService.
Exclude from GET responses.

Closes SS-012."
```

---

## Chunk 5: Remaining S4 Items (S4-14 to S4-20, S4-18)

### Task 12: S4-14 through S4-20 — Verify Tenant Isolation in Mutations

**These are WHERE clause fixes in update/delete operations. Since QS-014 Prisma Extension exists but isn't adopted yet, we fix manually.**

**S4-14: CRM (SS-004)** — Companies, Contacts, Activities, Opportunities use `where: { id }` without tenantId.
**S4-15: Accounting (SS-007)** — 4 cross-tenant bugs in PaymentReceived (applyToInvoice, markBounced, processBatch).
**S4-16: Sales (SS-006)** — Quotes, RateContracts, AccessorialRates use `where: { id }`.
**S4-17: Contracts (SS-013)** — FuelSurchargeTier missing tenantId field entirely.
**S4-18: Agents (SS-014)** — Rankings tenant leak.
**S4-19: Search (SS-015)** — deleteSynonym cross-tenant bug.
**S4-20: Super Admin (SS-018)** — Deleted admin can authenticate (missing deletedAt filter).

- [ ] **Step 1: Fix CRM update/delete mutations** — Add tenantId to WHERE in companies, contacts, activities, opportunities services
- [ ] **Step 2: Fix Accounting PaymentReceived** — Add tenantId to invoice lookups inside applyToInvoice(), markBounced(), processBatch()
- [ ] **Step 3: Fix Sales mutations** — Add tenantId to WHERE in quotes, rate-contracts, accessorial-rates services
- [ ] **Step 4: Fix Contracts FuelSurchargeTier** — This requires a DB migration to add tenantId column (handle carefully)
- [ ] **Step 5: Fix Agents rankings** — Add tenantId to findMany WHERE in rankings()
- [ ] **Step 6: Fix Search deleteSynonym** — Add tenantId to delete WHERE clause
- [ ] **Step 7: Fix Super Admin deleted admin auth** — Add `deletedAt: null` to login findMany
- [ ] **Step 8: Verify TypeScript compiles across all modules**
- [ ] **Step 9: Commit**

```bash
git add apps/api/src/modules/crm/ apps/api/src/modules/accounting/ apps/api/src/modules/sales/ apps/api/src/modules/contracts/ apps/api/src/modules/agents/ apps/api/src/modules/search/ apps/api/src/modules/auth/
git commit -m "fix(security): S4-14 to S4-20 tenant isolation in mutations

Add tenantId to WHERE clauses in CRM, Accounting, Sales, Agents, Search.
Add deletedAt filter to Super Admin login.
Fix FuelSurchargeTier tenantId (Contracts).

Closes SS-004 through SS-008, SS-014, SS-015, SS-018."
```

---

## Final Verification

### Task 13: Full Build Verification

- [ ] **Step 1: Run full TypeScript check**

```bash
pnpm check-types
```
Expected: 0 errors

- [ ] **Step 2: Run existing tests**

```bash
pnpm --filter api test:unit 2>&1 | tail -20
```
Expected: All existing tests pass

- [ ] **Step 3: Run lint**

```bash
pnpm lint 2>&1 | tail -20
```

- [ ] **Step 4: Update SECURITY-REMEDIATION.md** — Mark closed items

- [ ] **Step 5: Update STATUS.md** — Add S4 completion status

- [ ] **Step 6: Final commit**

```bash
git add dev_docs_v3/05-audit/SECURITY-REMEDIATION.md dev_docs_v3/STATUS.md
git commit -m "docs: update security remediation dashboard after S4 completion"
```
