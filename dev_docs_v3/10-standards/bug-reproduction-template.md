# Bug Reproduction Template

> Standard format for documenting known issues in hub file Section 11
> **Created:** 2026-03-09 | **Sources:** Per-service tribunal findings, cross-cutting addendum

## Template

```markdown
### [BUG-ID] Title
- **Severity:** P0 Critical | P1 High | P2 Medium | P3 Low
- **Type:** SEC (security) | BUG (functional) | PERF (performance) | UX (usability)
- **Service:** [service name and hub number]
- **Status:** Open | In Progress | Fixed (date) | Won't Fix (reason)

**Steps to Reproduce:**
1. [Login as user with role X in tenant Y]
2. [Navigate to /path/to/page]
3. [Perform action Z]
4. [Observe result]

**Expected:** [What should happen]
**Actual:** [What actually happens]
**File(s):** `apps/api/src/modules/[service]/[file].ts` line [N]
**Workaround:** [If any]
**Fix Effort:** S (< 1h) | M (1-4h) | L (4-8h) | XL (> 8h)
```

## Severity Definitions

| Severity | Definition | SLA | Examples |
| --- | --- | --- | --- |
| P0 Critical | Data loss, security breach, complete feature failure | Fix before any other work | Cross-tenant data leak, authentication bypass, financial calculation error |
| P1 High | Feature partially broken, security weakness, data integrity risk | Fix within current sprint | RolesGuard missing on financial endpoint, soft-delete not filtered, status transition skipped |
| P2 Medium | UX degradation, non-critical bug, cosmetic security issue | Fix within next 2 sprints | Hardcoded colors, missing loading state, pagination not working |
| P3 Low | Minor cosmetic, documentation error, nice-to-have | Fix when convenient | Typo in label, column width not ideal, tooltip missing |

## Type Definitions

| Type | Prefix | Description |
| --- | --- | --- |
| SEC | Security | Authentication, authorization, data isolation, credential handling |
| BUG | Functional | Feature doesn't work as specified, logic error, missing validation |
| PERF | Performance | Slow response, memory leak, unnecessary re-renders, missing optimization |
| UX | Usability | Missing state handling, confusing UI, accessibility gap, broken responsive layout |

---

## Top 10 P0 Bugs (from Tribunal Findings)

### SEC-001: Elasticsearch Cross-Tenant Search

- **Severity:** P0 Critical
- **Type:** SEC (security)
- **Service:** Search (22)
- **Status:** Open

**Steps to Reproduce:**
1. Login as user in Tenant A
2. Execute search query via `/api/v1/search/*` endpoints
3. Observe search results include records from Tenant B

**Expected:** Search results filtered to current tenant only
**Actual:** All Elasticsearch queries skip `tenantId` filter. Any authenticated user's search returns results across all tenants.
**File(s):** `apps/api/src/modules/search/` -- all ES query builders (PST-22)
**Workaround:** None -- search returns cross-tenant data
**Fix Effort:** M (2-4h) -- add tenantId filter to all ES query builders

---

### SEC-002: Cache Cross-Tenant Operations

- **Severity:** P0 Critical
- **Type:** SEC (security)
- **Service:** Cache (32)
- **Status:** Open

**Steps to Reproduce:**
1. Login as any authenticated user in Tenant A
2. Call cache delete/invalidate/lock endpoints for keys belonging to Tenant B
3. Observe operations succeed without tenant verification

**Expected:** Cache operations restricted to current tenant's keys only
**Actual:** 8 of 20 Cache endpoints accept operations without tenantId verification. Any authenticated user can delete caches, release locks, manipulate rate limits for other tenants.
**File(s):** `apps/api/src/modules/cache/` -- 8 endpoints without tenantId check (PST-32, cross-cutting #36)
**Workaround:** None
**Fix Effort:** M (2-4h) -- add tenantId to cache key prefix and validate on all operations

---

### SEC-003: JWT Secret Inconsistency

- **Severity:** P0 Critical
- **Type:** SEC (security)
- **Service:** Auth & Admin (01)
- **Status:** Open

**Steps to Reproduce:**
1. Check JWT configuration across main app, customer portal, carrier portal
2. Compare JWT_SECRET values and signing configurations

**Expected:** Consistent JWT configuration with separate secrets per portal (per ADR-016)
**Actual:** JWT secret configuration is inconsistent across portal authentication paths.
**File(s):** Auth module JWT configuration (PST-13)
**Workaround:** Ensure all environments use the same JWT_SECRET for the main app
**Fix Effort:** S (1h) -- standardize JWT configuration, verify all portal secrets are separate

---

### SEC-004: Tenant Isolation in Update/Delete Mutations

- **Severity:** P0 Critical
- **Type:** SEC (security)
- **Service:** Auth (01), CRM (03), Sales (04), Accounting (07) -- confirmed. Likely ALL services with CRUD.
- **Status:** Open -- needs QS-014 (Prisma Client Extension)

**Steps to Reproduce:**
1. Login as user in Tenant A
2. Obtain UUID of a record belonging to Tenant B (e.g., via cross-tenant search bug SEC-001)
3. Send PUT/PATCH/DELETE request to that record's endpoint with the UUID
4. Observe the mutation succeeds without tenantId verification

**Expected:** Mutation rejected because record belongs to different tenant
**Actual:** Update and delete operations use `where: { id }` without including `tenantId` in the WHERE clause. If an attacker knows the UUID, they can modify or delete records from any tenant.
**File(s):** Service files in Auth, CRM, Sales, Accounting modules (cross-cutting #4, confirmed in 4 services)
**Workaround:** UUIDs are hard to guess, but this does NOT constitute security
**Fix Effort:** L (4-8h) -- implement Prisma Client Extension to auto-inject tenantId on all operations (QS-014)

---

### SEC-005: Accounting Cross-Tenant Payment Bugs

- **Severity:** P0 Critical
- **Type:** SEC (security)
- **Service:** Accounting (07)
- **Status:** Open

**Steps to Reproduce:**
1. Login as user in Tenant A
2. Trigger payment-received flow that executes transaction block
3. Transaction internally performs 4 invoice operations that skip tenantId check
4. Operations may affect invoices from Tenant B if UUID is known

**Expected:** All invoice operations within transaction block filtered by tenantId
**Actual:** 4 invoice operations inside `payments-received` transaction skip tenantId verification (PST-07, cross-cutting #21)
**File(s):** `apps/api/src/modules/accounting/services/payments-received.service.ts` (PST-07)
**Workaround:** None
**Fix Effort:** M (2-4h) -- add tenantId to all queries within transaction blocks

---

### SEC-006: Carrier Portal Login Tenant Bypass

- **Severity:** P0 Critical
- **Type:** SEC (security)
- **Service:** Carrier Portal (14)
- **Status:** Open

**Steps to Reproduce:**
1. Access carrier portal login endpoint
2. Authenticate as a carrier user
3. Observe tenant scoping behavior during portal authentication

**Expected:** Carrier portal authentication strictly scoped to carrier's tenant
**Actual:** Portal authentication tenant bypass possibility identified during PST-14 tribunal
**File(s):** `apps/api/src/modules/carrier-portal/` auth flow (PST-14)
**Workaround:** Portal not yet deployed to production
**Fix Effort:** M (2-4h) -- verify tenant scoping in portal JWT issuance, write integration tests per TRIBUNAL-06

---

### SEC-007: Factoring apiKey Plaintext Storage

- **Severity:** P1 High (P0 if factoring is in use)
- **Type:** SEC (security)
- **Service:** Factoring Internal (18)
- **Status:** Open

**Steps to Reproduce:**
1. Query factoring company records via API
2. Observe apiKey field returned in plaintext in GET response

**Expected:** apiKey encrypted at rest, excluded from GET responses
**Actual:** apiKey stored as plaintext String in database, returned in API responses without `@Exclude()`
**File(s):** `apps/api/src/modules/factoring/` -- FactoringCompany model/DTO (PST-18)
**Workaround:** Don't store real API keys until encryption is implemented
**Fix Effort:** S (1h) -- add `@Exclude()` to response DTO, encrypt at rest using node:crypto

---

### BUG-008: Document Upload Architecture Mismatch

- **Severity:** P1 High
- **Type:** BUG (functional)
- **Service:** Documents (11)
- **Status:** Open

**Steps to Reproduce:**
1. Navigate to any document upload interface (Load Detail docs tab, Carrier docs)
2. Select a file and attempt upload
3. Frontend sends FormData
4. Backend expects @Body() DTO

**Expected:** File uploads successfully, document record created
**Actual:** Architecture mismatch between frontend (FormData multipart) and backend (@Body() JSON DTO). Upload may fail or produce unexpected results.
**File(s):** Frontend upload components vs `apps/api/src/modules/documents/` controller (PST-11)
**Workaround:** Some upload paths may work if backend also supports multipart -- needs runtime verification (QS-008)
**Fix Effort:** M (2-4h) -- align frontend and backend on multipart upload pattern, add @UseInterceptors(FileInterceptor) to backend

---

### BUG-009: Operations LoadHistory Tenant Leak

- **Severity:** P0 Critical
- **Type:** SEC (security)
- **Service:** Operations (38)
- **Status:** Open

**Steps to Reproduce:**
1. Login as user in Tenant A
2. Call `getByCarrier()` or `getSimilarLoads()` endpoints
3. Observe results include load history from other tenants

**Expected:** Load history filtered to current tenant
**Actual:** `getByCarrier()` and `getSimilarLoads()` queries skip tenantId filter (PST-38, cross-cutting #34)
**File(s):** `apps/api/src/modules/operations/` -- LoadHistory service methods (PST-38)
**Workaround:** None
**Fix Effort:** S (1h) -- add tenantId WHERE clause to both methods

---

### BUG-010: Commission Auto-Calc Not Wired

- **Severity:** P1 High
- **Type:** BUG (functional)
- **Service:** Commission (08)
- **Status:** Open

**Steps to Reproduce:**
1. Complete full load lifecycle: Order -> Load -> Dispatch -> Deliver
2. Create and send invoice for the order
3. Record payment on invoice (status -> PAID)
4. Check commission records for the sales rep

**Expected:** Commission automatically calculated when invoice is marked PAID (per data-flow.md Section 3, item 11)
**Actual:** No event listener exists for invoice PAID event. Commission calculation must be triggered manually. The data-flow.md documents this as automatic, but the implementation is missing.
**File(s):** `apps/api/src/modules/commission/` -- missing EventEmitter listener for `invoice.paid` event (PST-08)
**Workaround:** Manually trigger commission calculation via Commission module endpoints
**Fix Effort:** M (2-4h) -- create `@OnEvent('invoice.paid')` handler in CommissionService that auto-calculates based on CommissionPlan

---

## How to Use This Template in Hub Files

When adding a new known issue to a hub file's Section 11, use the short format:

```markdown
| [BUG-ID] Title | Severity | File | Status |
```

For P0 and P1 issues, also create a full reproduction entry in this file with the detailed template above. Reference the entry in the hub file:

```markdown
| SEC-004 Cross-tenant mutations | P0 SEC | Multiple services | Open — see bug-reproduction-template.md |
```

## Related Documents

- Quality gates: `dev_docs_v3/00-foundations/quality-gates.md`
- Screen quality rubric: `dev_docs_v3/10-standards/screen-quality-rubric.md`
- Security findings: `dev_docs_v3/05-audit/security-findings.md`
- Cross-cutting addendum: `dev_docs_v3/05-audit/tribunal/per-service/_CROSS-CUTTING-ADDENDUM.md`
