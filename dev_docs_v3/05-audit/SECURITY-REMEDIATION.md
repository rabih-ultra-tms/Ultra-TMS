# Security Remediation Dashboard

> **Last Updated:** 2026-03-09
> **Purpose:** Single source of truth for ALL security findings across 38 services + 6 infra modules
> **Source Data:** 39 Per-Service Tribunal verdicts (PST-01 through PST-38 + PST-39), 37 cross-cutting findings, 13 pre-tribunal security findings
> **Companion Files:** [security-findings.md](security-findings.md) | [ROLESGUARD-GAP-MATRIX.md](ROLESGUARD-GAP-MATRIX.md) | [REMEDIATION-ROADMAP.md](REMEDIATION-ROADMAP.md)
> **Overall Verdict:** 47 STOP-SHIP items must be resolved before any production deployment

---

## STOP-SHIP Items (Must Fix Before First Customer)

These items represent active data leakage, authentication bypass, or credential exposure risks. Any single item is grounds to block deployment.

| ID | Service | Finding | Severity | Source | Status |
|----|---------|---------|----------|--------|--------|
| SS-001 | Search (#22) | **ES queries have ZERO tenantId filtering** — `searchGlobal()`, `searchEntity()`, `suggest()` return results from ALL tenants | SEV-1 CRITICAL | PST-22, CC-#34 | Open |
| SS-002 | Cache (#32) | **8/20 endpoints missing tenantId** — any authenticated user can delete caches, release locks, manipulate rate limits for other tenants | SEV-1 CRITICAL | PST-32, CC-#36 | Open |
| SS-003 | Operations (#38) | **LoadHistory `getByCarrier()` + `getSimilarLoads()` missing tenantId** — cross-tenant load history leakage | SEV-1 CRITICAL | PST-38, CC-#34 | Open |
| SS-004 | CRM (#03) | **Update/delete mutations use `where: { id }` without tenantId** — cross-tenant mutation possible if UUID known (Companies, Contacts, Activities, Opportunities) | SEV-1 CRITICAL | PST-03, CC-#4 | Open |
| SS-005 | Auth (#01) | **Update/delete mutations missing tenantId in WHERE** — confirmed cross-tenant pattern | SEV-1 CRITICAL | PST-01, CC-#4 | Open |
| SS-006 | Sales (#04) | **Update/delete use `where: { id }` without tenantId** — Quotes, RateContracts, AccessorialRates | SEV-1 CRITICAL | PST-04, CC-#4 | Open |
| SS-007 | Accounting (#07) | **4 cross-tenant bugs in PaymentReceived** — `applyToInvoice()`, `markBounced()`, `processBatch()` lack tenantId in invoice operations inside transactions | SEV-1 CRITICAL | PST-07, CC-#21 | Open |
| SS-008 | Carrier Portal (#14) | **Login queries by email only — no tenantId filter** — cross-tenant auth bypass for shared emails | SEV-1 CRITICAL | PST-14 | Open |
| SS-009 | Customer Portal (#13) | **JWT secret inconsistency** — module signs with `PORTAL_JWT_SECRET`, guard verifies with `CUSTOMER_PORTAL_JWT_SECRET`. If env vars differ, auth fails silently or tokens from one portal work in another | SEV-1 CRITICAL | PST-13 | Open |
| SS-010 | Factoring (#18) | **`apiKey` returned in plaintext on GET** — `findAll()` and `findOne()` return full object including apiKey. No @Exclude(), no field selection. Any ACCOUNTING user can read all factoring company API keys | SEV-1 CRITICAL | PST-18 | Open |
| SS-011 | Rate Intelligence (#29) | **apiKey, apiSecret, password stored in PLAINTEXT** in RateProviderConfig — no EncryptionService used. Hub claimed `apiKeyEncrypted` but that was aspirational | SEV-1 CRITICAL | PST-29 | Open |
| SS-012 | EDI (#26) | **ftpPassword stored and returned in plaintext** — no @Exclude() on response, no encryption at rest | SEV-2 HIGH | PST-26 | Open |
| SS-013 | Contracts (#15) | **FuelSurchargeTier missing tenantId field entirely** — cross-tenant data leak in financial model | SEV-1 CRITICAL | PST-15 | Open |
| SS-014 | Agents (#16) | **Tenant leak in rankings** — `rankings()` fetches agent details with `findMany({ where: { id: { in: agentIds } } })` missing tenantId | SEV-1 CRITICAL | PST-16 | Open |
| SS-015 | Search (#22) | **deleteSynonym cross-tenant bug** — deletes by ID without tenantId check | SEV-1 CRITICAL | PST-22 | Open |
| SS-016 | Accounting (#07) | **6/10 controllers missing RolesGuard** — any authenticated user (dispatcher, driver) can approve settlements, post journal entries, process batch payments | SEV-1 CRITICAL | PST-07, CC-#17 | Open |
| SS-017 | Frontend | **localStorage token storage (XSS vulnerability)** — `apps/web/lib/api/client.ts` lines 59, 77. Any XSS payload can steal session tokens | SEV-1 CRITICAL | SEC-P1-001 | Open |
| SS-018 | Super Admin (#33) | **Deleted super admin can authenticate** — `findMany` in login missing `deletedAt: null` filter | SEV-1 CRITICAL | PST-33 | Open |
| SS-019 | EDI (#26) | **ISA ID uniqueness not tenant-scoped** — cross-tenant collision possible | SEV-2 HIGH | PST-26 | Open |

---

## P0 Critical Findings (Non-STOP-SHIP but Must Fix Before Production)

| ID | Service | Finding | Source | Status |
|----|---------|---------|--------|--------|
| P0-001 | Accounting (#07) | Soft-delete fields exist on 7 models but only Reports service filters `deletedAt: null` | PST-07, CC-#18 | Open |
| P0-002 | Carrier Portal (#14) | Soft-delete gap: 5/7 portal services missing `deletedAt: null` filter — portal users see deleted loads/invoices/documents | PST-14 | Open |
| P0-003 | Commission (#08) | 60% of methods don't filter `deletedAt` — CommissionEntry (7 methods), CommissionPayout (6), AgentCommission (3) | PST-08, CC-#22 | Open |
| P0-004 | Load Board (#09) | 6/9 controllers missing RolesGuard — AccountsController + RulesController are HIGH risk (admin-only operations) | PST-09 | Open |
| P0-005 | Contracts (#15) | 6/8 controllers missing RolesGuard — Amendments, RateLanes, SLAs, FuelSurcharge, Templates, VolumeCommitments | PST-15 | Open |
| P0-006 | Agents (#16) | 3/6 controllers missing RolesGuard — AgentAgreements, CustomerAssignments, AgentLeads have decorative @Roles | PST-16 | Open |
| P0-007 | Credit (#17) | 0/5 controllers use RolesGuard in @UseGuards — all credit operations open to any authenticated user | PST-17 | Open |
| P0-008 | Factoring (#18) | 3/5 controllers missing RolesGuard; companyCode cross-tenant bug | PST-18 | Open |
| P0-009 | Sales (#04) | `enforceMinimumMargin()` is dead code — never called, quotes can have 0% margin | PST-04 | Open |
| P0-010 | Sales (#04) | No quote expiry cron job — `validUntil` stored but never checked, expired quotes can be accepted | PST-04 | Open |
| P0-011 | Commission (#08) | `createPayout` and `processPayout` not wrapped in `$transaction` — race conditions leave inconsistent financial state | PST-08, CC-#23 | Open |
| P0-012 | Communication (#12) | SMS webhook inherits JwtAuthGuard from class — Twilio cannot authenticate, webhook non-functional | PST-12, CC-#30 | Open |
| P0-013 | CRM (#03) | HubSpot webhook endpoint behind JwtAuthGuard — external callers cannot reach it | PST-03, CC-#30 | Open |
| P0-014 | Documents (#11) | Upload architecture mismatch — frontend sends FormData, backend expects JSON DTO (no FileInterceptor/Multer) | PST-11 | Open |
| P0-015 | Integration Hub (#21) | EncryptionService hardcoded fallback key — falls back to `JWT_SECRET` -> `PORTAL_JWT_SECRET` -> `'local-dev-secret'`. Must fail-fast in production | PST-21 | Open |
| P0-016 | Config (#31) | 1/9 controllers have RolesGuard (worst ratio) — SystemConfig writable by any authenticated user | PST-31 | Open |
| P0-017 | Frontend | CORS hardcoded to localhost — production deployment requires code changes | SEC-P1-002 | Open |

---

## P1 High Findings

| ID | Service | Finding | Source | Status |
|----|---------|---------|--------|--------|
| P1-001 | HR (#23) | 0/6 controllers have RolesGuard — all @Roles decorators decorative | PST-23 | Open |
| P1-002 | Scheduler (#24) | 0/5 controllers have RolesGuard | PST-24 | Open |
| P1-003 | Safety (#25) | 5/9 controllers missing RolesGuard | PST-25 | Open |
| P1-004 | EDI (#26) | 4/8 controllers missing RolesGuard — @Roles decorative | PST-26 | Open |
| P1-005 | Help Desk (#27) | 0/5 controllers have RolesGuard | PST-27 | Open |
| P1-006 | Feedback (#28) | 0/5 controllers have RolesGuard — no @Roles decorators at all | PST-28 | Open |
| P1-007 | Audit (#30) | 0/8 controllers have RolesGuard — all @Roles decorative. Audit logs should be read-only for most users | PST-30 | Open |
| P1-008 | Cache (#32) | 0/4 controllers have RolesGuard — any authenticated user can flush caches | PST-32 | Open |
| P1-009 | Workflow (#20) | 3/5 controllers missing RolesGuard — @Roles decorative | PST-20 | Open |
| P1-010 | HR (#23) | 3 hard delete bugs — Department, Position, Location use `.delete()` instead of soft delete | PST-23 | Open |
| P1-011 | HR (#23) | 6/7 services skip `deletedAt: null` filter — worst compliance rate | PST-23 | Open |
| P1-012 | Feedback (#28) | 0/7 soft-delete filtering — worst compliance across all services. VotingService also hard-deletes + no tenantId | PST-28 | Open |
| P1-013 | Audit (#30) | 0/5 soft-delete filtering — AuditAlert, ComplianceCheckpoint, AuditRetentionPolicy, ChangeHistory all have `deletedAt` but zero queries filter it | PST-30 | Open |
| P1-014 | Config (#31) | 3 hard-delete violations; 1/9 soft-delete compliance (tied worst with Feedback) | PST-31 | Open |
| P1-015 | Super Admin (#33) | RolesService.delete() is hard delete; 3/7 soft-delete gaps | PST-33 | Open |
| P1-016 | Carrier Portal (#14) | Missing @Throttle on register, forgotPassword, resetPassword auth endpoints | PST-14 | Open |
| P1-017 | Communication (#12) | No Twilio request signature validation on SMS webhook | PST-12 | Open |
| P1-018 | Frontend | No Content Security Policy (CSP) headers configured | SEC-P2-001 | Open |
| P1-019 | Frontend | No rate limiting on any endpoint (auth especially vulnerable to brute force) | SEC-P2-002 | Open |
| P1-020 | Frontend | CSRF protection not verified (SameSite cookie attribute) | SEC-P2-003 | Open |

---

## P2 Medium Findings

| ID | Service | Finding | Source | Status |
|----|---------|---------|--------|--------|
| P2-001 | Storage (#35) | Path traversal vulnerability — `path.join()` does not prevent `../` traversal. `path.join('./uploads', '../../etc/passwd')` escapes storage dir | PST-35 | Open |
| P2-002 | Storage (#35) | Signed URL is security theater — no HMAC signature verification. No tenant isolation in file paths | PST-35 | Open |
| P2-003 | Redis (#36) | `KEYS` command blocks Redis at scale — O(N) in `deleteByPattern()`, `revokeAllUserSessions()`, `getUserSessions()`, `getUserSessionCount()`. Must replace with `SCAN` iterator | PST-36 | Open |
| P2-004 | Redis (#36) | No tenant isolation in key names — all tenants share flat key namespace | PST-36 | Open |
| P2-005 | Email (#34) | MFA verification code logged in plaintext to console | PST-34 | Open |
| P2-006 | Integration Hub (#21) | `testConnection()` uses `Math.random() > 0.3` — fake success/failure in production | PST-21 | Open |
| P2-007 | Operations (#38) | Equipment raw SQL with table fallback — SQL injection risk if inputs not sanitized | PST-38 | Open |
| P2-008 | Workflow (#20) | ApprovalRequest soft-delete gap | PST-20 | Open |
| P2-009 | TMS Core (#05) | Orders delete is a no-op (toast only, no API call) | PST-05 | Open |
| P2-010 | Frontend | No automated secret scanning (gitleaks or equivalent) | SEC-P2-004 | Open |
| P2-011 | Cache (#32) | InvalidationListener is a no-op stub | PST-32 | Open |
| P2-012 | Scheduler (#24) | LockService has TOCTOU race condition | PST-24 | Open |
| P2-013 | Help Desk (#27) | `manageMembers()` uses hard delete | PST-27 | Open |

---

## Previously Fixed Items (Verified)

| ID | Finding | Fixed Date | Verification |
|----|---------|-----------|-------------|
| SEC-P0-001 | Health endpoint public (exposed DB + Redis status) | 2026-03-06 | JwtAuthGuard added |
| SEC-P0-002 | JWT token logged to browser console | 2026-03-06 | 10 console.log removed |
| SEC-P0-003 | Global JwtAuthGuard not applied — all endpoints public | 2026-03-06 | APP_GUARD provider added |
| SEC-P0-004 | Missing @Public() on auth routes causing auth bypass | 2026-03-06 | Decorators added |

---

## Systemic Patterns (Cross-Cutting)

These are not individual bugs but architectural patterns that affect multiple services simultaneously.

### Pattern 1: Tenant Isolation in Mutations (CC-#4 — CONFIRMED SYSTEMIC)

**Confirmed in 4+ services:** Auth (PST-01), CRM (PST-03), Sales (PST-04), Accounting (PST-07)

All update/delete mutations use `where: { id }` without tenantId. Simple CRUD sometimes includes tenantId, but nested/transactional operations systematically skip it.

**Fix:** QS-014 (Prisma Client Extension) auto-injects tenantId into ALL queries, eliminating this class of bug permanently.

### Pattern 2: Decorative @Roles Without RolesGuard (CC-#17)

**Confirmed in 18+ services.** Controllers have `@Roles('ADMIN')` decorator but no `RolesGuard` in `@UseGuards()`. The decorator does nothing without the guard.

**Fix:** Add `RolesGuard` to `@UseGuards()` on every controller that has `@Roles()`. See [ROLESGUARD-GAP-MATRIX.md](ROLESGUARD-GAP-MATRIX.md).

### Pattern 3: Soft-Delete Fields Without Query Filters (CC-#22)

**Confirmed in 3+ services:** Dashboard (PST-02), Accounting (PST-07), Commission (PST-08), HR (PST-23), Feedback (PST-28), Audit (PST-30), Config (PST-31)

Models have `deletedAt` column but queries don't filter `deletedAt: null`. Deleted records appear in lists, inflate KPIs, and leak through portals.

**Fix:** QS-014 (Prisma Client Extension) auto-injects `deletedAt: null` into ALL read queries.

### Pattern 4: Non-CRUD Queries Skip Tenant Isolation (CC-#34)

**Confirmed in 3 services:** Search (PST-22), Operations (PST-38), Cache (PST-32)

Simple CRUD operations check tenantId, but analytics, search, history lookups, and infrastructure operations skip it. These paths are often higher-volume and more sensitive.

### Pattern 5: External Webhooks Behind Internal Auth (CC-#30)

**Confirmed in 2 services:** Communication (PST-12 — Twilio SMS), CRM (PST-03 — HubSpot)

Class-level `@UseGuards(JwtAuthGuard, RolesGuard)` blocks external webhook callers. Webhooks need `@Public()` + signature verification.

---

## Remediation Dependencies

```
QS-014 (Prisma Client Extension)
  |
  +---> Fixes SS-004 through SS-008 (tenant isolation in mutations)
  +---> Fixes SS-015 (deleteSynonym cross-tenant)
  +---> Fixes SS-018 (deleted admin auth)
  +---> Fixes P0-001 through P0-003 (soft-delete gaps)
  +---> Fixes Pattern 1 (tenant isolation) across ALL services
  +---> Fixes Pattern 3 (soft-delete filtering) across ALL services
  |
  UNBLOCKS: QS-016 (tenant isolation tests)

RolesGuard remediation (manual per-controller)
  |
  +---> Fixes SS-016 (accounting)
  +---> Fixes P0-004 through P0-008, P0-016 (financial controllers)
  +---> Fixes P1-001 through P1-009 (non-financial controllers)
  |
  NO DEPENDENCY — can start immediately

Credential encryption (per-service)
  |
  +---> Fixes SS-010 (factoring apiKey)
  +---> Fixes SS-011 (rate intelligence credentials)
  +---> Fixes SS-012 (EDI ftpPassword)
  +---> Fixes P0-015 (integration hub fallback key)
  |
  DEPENDS ON: Integration Hub EncryptionService being production-ready (P0-015 fix first)
```

---

## Cross-References

### Hub File Security Sections (Section 11)

| # | Service | Hub Path | Security Status |
|---|---------|----------|----------------|
| 01 | Auth & Admin | `01-services/p0-mvp/01-auth-admin.md` | Tenant mutation gap |
| 02 | Dashboard | `01-services/p0-mvp/02-dashboard.md` | Soft-delete gap |
| 03 | CRM | `01-services/p0-mvp/03-crm.md` | Tenant mutation gap, webhook auth |
| 04 | Sales | `01-services/p0-mvp/04-sales-quotes.md` | Tenant mutation gap, dead margin code |
| 05 | TMS Core | `01-services/p0-mvp/05-tms-core.md` | Orders delete no-op |
| 06 | Carriers | `01-services/p0-mvp/06-carriers.md` | Dual module confusion |
| 07 | Accounting | `01-services/p0-mvp/07-accounting.md` | 4 cross-tenant + 6 missing RolesGuard |
| 08 | Commission | `01-services/p0-mvp/08-commission.md` | Soft-delete 60%, no $transaction |
| 09 | Load Board | `01-services/p0-mvp/09-load-board.md` | 6/9 missing RolesGuard |
| 13 | Customer Portal | `01-services/p0-mvp/13-customer-portal.md` | JWT secret inconsistency |
| 11 | Documents | `01-services/p1-post-mvp/11-documents.md` | Upload mismatch |
| 12 | Communication | `01-services/p1-post-mvp/12-communication.md` | Webhook auth, no Twilio validation |
| 14 | Carrier Portal | `01-services/p1-post-mvp/14-carrier-portal.md` | Login tenant bypass, soft-delete 5/7 |
| 10 | Claims | `01-services/p2-extended/10-claims.md` | Reports controller missing RolesGuard |
| 15 | Contracts | `01-services/p2-extended/15-contracts.md` | FuelSurchargeTier no tenantId, 6/8 RolesGuard |
| 16 | Agents | `01-services/p2-extended/16-agents.md` | Rankings tenant leak, 3/6 RolesGuard |
| 17 | Credit | `01-services/p2-extended/17-credit.md` | 0/5 RolesGuard |
| 18 | Factoring | `01-services/p2-extended/18-factoring-internal.md` | apiKey plaintext, 3/5 RolesGuard |
| 19 | Analytics | `01-services/p2-extended/19-analytics.md` | Clean (100% guards) |
| 20 | Workflow | `01-services/p2-extended/20-workflow.md` | 3/5 RolesGuard, ApprovalRequest soft-delete |
| 21 | Integration Hub | `01-services/p2-extended/21-integration-hub.md` | Hardcoded fallback key |
| 22 | Search | `01-services/p2-extended/22-search.md` | ES zero tenantId, 2/4 RolesGuard |
| 23 | HR | `01-services/p3-future/23-hr.md` | 0/6 RolesGuard, 3 hard deletes |
| 24 | Scheduler | `01-services/p3-future/24-scheduler.md` | 0/5 RolesGuard, lock race |
| 25 | Safety | `01-services/p3-future/25-safety.md` | 5/9 RolesGuard |
| 26 | EDI | `01-services/p3-future/26-edi.md` | ftpPassword plaintext, ISA cross-tenant |
| 27 | Help Desk | `01-services/p3-future/27-help-desk.md` | 0/5 RolesGuard |
| 28 | Feedback | `01-services/p3-future/28-feedback.md` | 0/5 RolesGuard, 0/7 soft-delete |
| 29 | Rate Intelligence | `01-services/p3-future/29-rate-intelligence.md` | Credentials plaintext |
| 30 | Audit | `01-services/p3-future/30-audit.md` | 0/8 RolesGuard, 0/5 soft-delete |
| 31 | Config | `01-services/p3-future/31-config.md` | 1/9 RolesGuard (worst ratio) |
| 32 | Cache | `01-services/p3-future/32-cache.md` | 8/20 no tenantId, 0/4 RolesGuard |
| 33 | Super Admin | `01-services/p-infra/33-super-admin.md` | Deleted admin auth, hard delete |
| 34 | Email | `01-services/p-infra/34-email.md` | MFA code logged plaintext |
| 35 | Storage | `01-services/p-infra/35-storage.md` | Path traversal, fake signed URLs |
| 36 | Redis | `01-services/p-infra/36-redis.md` | KEYS blocking, no tenant key prefix |
| 37 | Health | `01-services/p-infra/37-health.md` | Clean (fixed P0-001) |
| 38 | Operations | `01-services/p-infra/38-operations.md` | 2 tenant bugs in LoadHistory |

### Other Security Documents

- **Cross-cutting addendum:** `05-audit/tribunal/per-service/_CROSS-CUTTING-ADDENDUM.md` (37 findings)
- **Consolidated verdicts:** `05-audit/tribunal/per-service/_CONSOLIDATED-VERDICTS.md` (99 action items)
- **Pre-tribunal findings:** `05-audit/security-findings.md` (13 items, 4 fixed, 9 open)
- **RolesGuard matrix:** `05-audit/ROLESGUARD-GAP-MATRIX.md`
- **Remediation roadmap:** `05-audit/REMEDIATION-ROADMAP.md`
- **Anti-patterns:** `05-audit/recurring-patterns.md` (includes anti-pattern #11: Missing tenantId)
- **QS-014 task:** `03-tasks/sprint-quality/QS-014-prisma-tenant-extension.md`

---

## Summary Statistics

| Category | Count |
|----------|-------|
| STOP-SHIP items | 19 |
| P0 Critical (non-stop-ship) | 17 |
| P1 High | 20 |
| P2 Medium | 13 |
| Previously fixed | 4 |
| **Total findings** | **73** |
| Services with zero security findings | 1 (Health) |
| Services with STOP-SHIP items | 14 |
| Systemic patterns (cross-cutting) | 5 |
| Findings fixable by QS-014 alone | ~25 (tenant + soft-delete across all services) |
