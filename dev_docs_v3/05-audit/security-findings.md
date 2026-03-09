# Security Findings — Ultra TMS

> Last updated: 2026-03-09
> Source: Security audit conducted Mar 6 2026 + Claude Review v1 (Jan 2026) + Per-Service Tribunal (39 audits, Mar 2026)
>
> **CONSOLIDATED DASHBOARD:** For the complete security picture including all 73 findings from 38 services, see **[SECURITY-REMEDIATION.md](SECURITY-REMEDIATION.md)** — the single source of truth.
> **Related:** [ROLESGUARD-GAP-MATRIX.md](ROLESGUARD-GAP-MATRIX.md) | [REMEDIATION-ROADMAP.md](REMEDIATION-ROADMAP.md) | [PRODUCTION-READINESS-ASSESSMENT.md](PRODUCTION-READINESS-ASSESSMENT.md)

---

## Incident Severity Framework

> Applied to all security findings and production incidents. Classification determines response SLA.

| Level | Name | Ack Time | Engage Time | Mitigate Time | Examples |
|-------|------|----------|-------------|---------------|----------|
| SEV-1 | Critical | 5 min | 15 min | 1 hour | Data breach, complete outage, auth bypass, cross-tenant data leak, payment system compromise |
| SEV-2 | Major | 15 min | 30 min | 2 hours | Single service down, data corruption risk, financial calculation error, carrier API failure |
| SEV-3 | Minor | 1 hour | 4 hours | Next sprint | UI broken on one page, non-critical feature down, degraded search performance |
| SEV-4 | Low | 1 business day | Next sprint | Backlog | Cosmetic issues, minor UX bugs, tech debt items, documentation errors |

### Classification Rules

- **Any multi-tenant data leak = SEV-1** regardless of data volume (one leaked record is as bad as 10,000)
- **Any financial calculation error = SEV-2 minimum** (invoice, commission, settlement amounts)
- **Any auth/JWT vulnerability = SEV-1** (token exposure, session hijack, privilege escalation)
- **Production outage affecting all users = SEV-1**
- **Production outage affecting one tenant = SEV-2**
- **API returning incorrect data = SEV-2** (silent data corruption is worse than an error page)
- **API returning 500 errors = SEV-3** (visible but recoverable)

### Escalation Matrix

| Level | Who Gets Notified | Action |
|-------|-------------------|--------|
| SEV-1 | All team members + stakeholder | All hands on deck. Rollback first, debug second. |
| SEV-2 | On-call developer + team lead | Investigate immediately. Fix or workaround within SLA. |
| SEV-3 | Assigned developer | Fix in current sprint. |
| SEV-4 | Add to backlog | Prioritize in next planning session. |

### Current Findings Severity Classification

> Below findings are classified using this framework. Previously unclassified findings have been assigned levels.

---

## Summary

| Priority | Pre-Tribunal | Tribunal-Discovered | Total | Fixed | Open |
|----------|-------------|---------------------|-------|-------|------|
| P0 Critical / STOP-SHIP | 4 | 19 | 23 | 4 | 19 |
| P0 Critical (non-stop-ship) | 0 | 17 | 17 | 0 | 17 |
| P1 High | 2 | 20 | 22 | 0 | 22 |
| P2 Medium | 4 | 13 | 17 | 0 | 17 |
| P3 Low | 3 | 0 | 3 | 0 | 3 |
| **Total** | **13** | **69** | **82** | **4** | **78** |

> The Per-Service Tribunal (39 audits, March 2026) discovered 69 additional security findings not in this file.
> See [SECURITY-REMEDIATION.md](SECURITY-REMEDIATION.md) for the consolidated dashboard with all findings.

---

## P0 Critical — All Fixed (Mar 6 2026)

| # | Issue | File | Fix Applied |
|---|-------|------|-------------|
| SEC-P0-001 | Health endpoint was public (exposed DB + Redis status to unauthenticated users) | `apps/api/src/modules/health/health.controller.ts` | Added `@UseGuards(JwtAuthGuard)` |
| SEC-P0-002 | JWT token logged to browser console | `apps/web/app/(dashboard)/admin/layout.tsx` | Removed 10 console.log statements |
| SEC-P0-003 | Global JwtAuthGuard not applied — all endpoints were public | `apps/api/src/app.module.ts` | Added APP_GUARD provider with JwtAuthGuard |
| SEC-P0-004 | Missing `@Public()` decorator on auth routes causing auth bypass | `apps/api/src/modules/auth/auth.controller.ts` | Added `@Public()` to login, register, forgot-pw, reset-pw endpoints |

---

## P1 High — Open

### SEC-P1-001: localStorage Token Storage (XSS Vulnerability)

**Status:** OPEN
**File:** `apps/web/lib/api/client.ts` lines 59, 77
**Issue:** Access tokens stored in `localStorage`. Any XSS attack can steal user tokens. Contradicts the stated cookie-based auth policy.
**Expected behavior:** Auth tokens should be in `HttpOnly` cookies, inaccessible to JavaScript.
**Fix required:**
1. Remove all `localStorage.getItem('token')` / `localStorage.setItem('token')` calls
2. The backend already uses `HttpOnly` JWT cookies — the frontend should rely on cookies being sent automatically
3. Remove manual token injection from API client headers
**Risk:** HIGH — enables session hijacking via any XSS payload
**Task:** Included in QS-001 scope (auth infrastructure)

---

### SEC-P1-002: CORS Hardcoded to localhost

**Status:** OPEN — Task QS-007
**File:** `apps/api/src/main.ts`
**Issue:**
```typescript
origin: ['http://localhost:3000', 'http://localhost:3002']
```
This hardcoding means production deployment requires code changes to CORS config.
**Fix required:** Replace with environment variable:
```typescript
origin: process.env.CORS_ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:3000']
```
**Risk:** MEDIUM — deployment blocker; no security risk in dev, becomes problem at production
**Task:** QS-007 (30-minute fix)

---

## P2 Medium — Open

### SEC-P2-001: No Content Security Policy (CSP) Headers

**Status:** OPEN — backlog
**File:** `apps/web/next.config.js`
**Issue:** No CSP headers configured. Without CSP, browsers allow any inline scripts and any script source — weakens XSS defenses.
**Fix required:** Add `headers()` to next.config.js with CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy.
**Risk:** MEDIUM — significantly weakens XSS protection

---

### SEC-P2-002: No Rate Limiting

**Status:** OPEN — backlog
**File:** `apps/api/src/main.ts`
**Issue:** No rate limiting on any endpoint. Auth endpoints (login, forgot-password) are especially vulnerable to brute force.
**Fix required:** Add `@nestjs/throttler` with `ThrottlerModule.forRoot()`:
- Auth endpoints: 5 req/min per IP
- API endpoints: 100 req/min per user
**Risk:** MEDIUM — enables brute force attacks on auth + API abuse

---

### SEC-P2-003: CSRF Protection Not Verified

**Status:** OPEN — backlog (needs verification)
**Issue:** Application uses JWT in cookies but it's unclear if `SameSite=Strict` or `SameSite=Lax` is set on auth cookies. Without this, CSRF attacks are possible.
**Fix required:** Verify cookie configuration in auth service:
```typescript
res.cookie('access_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',  // ← Must verify this is set
});
```
**Risk:** MEDIUM — enables CSRF attacks if SameSite not enforced

---

### SEC-P2-004: No Secret Scanning

**Status:** OPEN — backlog
**Issue:** No automated scanning for accidentally committed secrets (API keys, passwords, JWT secrets).
**Fix required:** Add `gitleaks` as a pre-commit hook or CI check.
**Risk:** LOW in dev, HIGH if secrets accidentally committed to GitHub

---

## P3 Low — Open

### SEC-P3-001: JWT Secret Rotation Process Undefined

**Status:** OPEN — documentation gap
**Issue:** No documented process for JWT secret rotation if the secret is compromised.
**Fix required:** Document secret rotation procedure (invalidates all sessions) in runbooks.

---

### SEC-P3-002: No Account Lockout

**Status:** OPEN — backlog
**Issue:** No account lockout after N failed login attempts. Rate limiting (P2-002) would partially mitigate this.
**Fix required:** Track failed login attempts in Redis; lock account for 15min after 10 failures.

---

### SEC-P3-003: Audit Log Not Verified

**Status:** OPEN — needs verification
**Issue:** Audit log module exists (`apps/api/src/modules/audit/`) but it's unclear if all sensitive operations (user permission changes, tenant creation, data exports) are being logged.
**Fix required:** Verify AuditService is called on: user role changes, permission changes, tenant operations, data exports, bulk operations.

---

## Security Architecture — What's Correct

These security controls are properly implemented (do not modify):

| Control | Implementation | Location |
|---------|---------------|----------|
| JWT Authentication | `JwtAuthGuard` applied globally via `APP_GUARD` | `apps/api/src/app.module.ts` |
| Role-Based Access Control | `@Roles()` decorator + `RolesGuard` | All protected controllers |
| `@Public()` decorator | Bypasses JWT guard for auth routes | Auth controller |
| Multi-tenant isolation | `tenantId` on all queries | All service files |
| Soft delete | `deletedAt: null` filter everywhere | All list queries |
| Password hashing | `bcrypt` with salt rounds | Auth service |
| DTO validation | `ValidationPipe(whitelist: true, transform: true)` | `apps/api/src/main.ts` |
| `forbidNonWhitelisted: true` | Rejects unknown fields | ValidationPipe config |

---

## Fix Priority Order

1. ~~SEC-P0-001 through SEC-P0-004~~ — Fixed Mar 6 2026
2. **SEC-P1-001** — localStorage tokens (QS-001 scope)
3. **SEC-P1-002** — CORS env variable (QS-007 — 30 min)
4. **SEC-P2-001** — CSP headers (2-hour task)
5. **SEC-P2-002** — Rate limiting (2-hour task, add @nestjs/throttler)
6. **SEC-P2-003** — CSRF verification (30-min audit)
7. **SEC-P2-004** — Secret scanning (1-hour gitleaks setup)

---

## Tribunal-Discovered Findings (2026-03-09)

> Discovered during 39 Per-Service Tribunal audits (PST-01 through PST-38 + PST-39 Command Center).
> These findings were NOT in the original security audit above.
> Full details with remediation plan: [SECURITY-REMEDIATION.md](SECURITY-REMEDIATION.md)

### STOP-SHIP: Cross-Tenant Data Leakage

| ID | Service | Finding | Source |
|----|---------|---------|--------|
| TRIB-SEC-001 | Search (#22) | ES queries have ZERO tenantId filtering — `searchGlobal()`, `searchEntity()`, `suggest()` return data from ALL tenants | PST-22 |
| TRIB-SEC-002 | Cache (#32) | 8/20 endpoints missing tenantId — cross-tenant cache deletion, lock manipulation, rate limit reset | PST-32 |
| TRIB-SEC-003 | Operations (#38) | LoadHistory `getByCarrier()` + `getSimilarLoads()` missing tenantId — cross-tenant leakage | PST-38 |
| TRIB-SEC-004 | CRM (#03) | Update/delete mutations use `where: { id }` without tenantId — cross-tenant mutation (Companies, Contacts, Activities, Opportunities) | PST-03 |
| TRIB-SEC-005 | Auth (#01) | Update/delete mutations missing tenantId in WHERE clause | PST-01 |
| TRIB-SEC-006 | Sales (#04) | Update/delete use `where: { id }` without tenantId (Quotes, RateContracts, AccessorialRates) | PST-04 |
| TRIB-SEC-007 | Accounting (#07) | 4 cross-tenant bugs in PaymentReceived — `applyToInvoice()`, `markBounced()`, `processBatch()` lack tenantId in transaction | PST-07 |
| TRIB-SEC-008 | Contracts (#15) | FuelSurchargeTier missing tenantId field entirely — cross-tenant financial data leak | PST-15 |
| TRIB-SEC-009 | Agents (#16) | Rankings query fetches agent details with `findMany({ where: { id: { in: agentIds } } })` missing tenantId | PST-16 |
| TRIB-SEC-010 | Search (#22) | `deleteSynonym` cross-tenant bug — deletes by ID without tenantId check | PST-22 |

### STOP-SHIP: Authentication & Credential Exposure

| ID | Service | Finding | Source |
|----|---------|---------|--------|
| TRIB-SEC-011 | Carrier Portal (#14) | Login queries by email only — no tenantId filter — cross-tenant auth bypass | PST-14 |
| TRIB-SEC-012 | Customer Portal (#13) | JWT secret inconsistency: module signs with `PORTAL_JWT_SECRET`, guard verifies with `CUSTOMER_PORTAL_JWT_SECRET` | PST-13 |
| TRIB-SEC-013 | Factoring (#18) | `apiKey` returned in plaintext on GET — `findAll()` and `findOne()` expose all factoring company API keys | PST-18 |
| TRIB-SEC-014 | Rate Intelligence (#29) | apiKey, apiSecret, password stored in PLAINTEXT in RateProviderConfig | PST-29 |
| TRIB-SEC-015 | EDI (#26) | ftpPassword stored and returned in plaintext — no encryption, no @Exclude | PST-26 |
| TRIB-SEC-016 | Super Admin (#33) | Deleted super admin can authenticate — login missing `deletedAt: null` filter | PST-33 |

### STOP-SHIP: Missing Authorization (RolesGuard)

| ID | Service | Finding | Source |
|----|---------|---------|--------|
| TRIB-SEC-017 | Accounting (#07) | 6/10 controllers missing RolesGuard — any authenticated user can approve settlements, post journal entries | PST-07 |
| TRIB-SEC-018 | Load Board (#09) | 6/9 controllers missing RolesGuard — AccountsController + RulesController HIGH risk | PST-09 |
| TRIB-SEC-019 | Contracts (#15) | 6/8 controllers missing RolesGuard — financial contract terms writable by any user | PST-15 |

> See [ROLESGUARD-GAP-MATRIX.md](ROLESGUARD-GAP-MATRIX.md) for the full matrix of ~85 controllers missing RolesGuard across 23 services.

### P0: Non-STOP-SHIP Critical Findings

| ID | Service | Finding | Source |
|----|---------|---------|--------|
| TRIB-SEC-020 | Integration Hub (#21) | EncryptionService hardcoded fallback key — falls back to `'local-dev-secret'` if env var missing | PST-21 |
| TRIB-SEC-021 | Communication (#12) | SMS webhook non-functional — inherits JwtAuthGuard, Twilio cannot authenticate | PST-12 |
| TRIB-SEC-022 | CRM (#03) | HubSpot webhook behind JwtAuthGuard — external callers blocked | PST-03 |
| TRIB-SEC-023 | Config (#31) | 1/9 controllers have RolesGuard (worst ratio) — SystemConfig (SECURITY category) writable by any user | PST-31 |
| TRIB-SEC-024 | Credit (#17) | 0/5 controllers use RolesGuard — all credit operations open to any authenticated user | PST-17 |
| TRIB-SEC-025 | Factoring (#18) | 3/5 controllers missing RolesGuard; companyCode cross-tenant bug | PST-18 |
| TRIB-SEC-026 | Agents (#16) | 3/6 controllers missing RolesGuard — AgentAgreements, CustomerAssignments, AgentLeads | PST-16 |
| TRIB-SEC-027 | EDI (#26) | ISA ID uniqueness not tenant-scoped — cross-tenant collision possible | PST-26 |
| TRIB-SEC-028 | Commission (#08) | `createPayout`/`processPayout` not in `$transaction` — financial race conditions | PST-08 |

### P2: Infrastructure & Lower Priority

| ID | Service | Finding | Source |
|----|---------|---------|--------|
| TRIB-SEC-029 | Storage (#35) | Path traversal vulnerability — `path.join()` does not prevent `../` traversal | PST-35 |
| TRIB-SEC-030 | Storage (#35) | Signed URL security theater — no HMAC verification, no tenant isolation in paths | PST-35 |
| TRIB-SEC-031 | Redis (#36) | `KEYS` command blocks Redis at scale — O(N) in 4 methods | PST-36 |
| TRIB-SEC-032 | Redis (#36) | No tenant isolation in key names — flat namespace across tenants | PST-36 |
| TRIB-SEC-033 | Email (#34) | MFA verification code logged in plaintext to console | PST-34 |
| TRIB-SEC-034 | Integration Hub (#21) | `testConnection()` uses `Math.random() > 0.3` — fake connection test in production | PST-21 |

### Systemic Patterns (Cross-Cutting Addendum)

These affect multiple services and were confirmed through 3+ independent tribunal audits:

| Pattern | Services Confirmed | CC Finding # | Fix |
|---------|-------------------|-------------|-----|
| Update/delete mutations skip tenantId | Auth, CRM, Sales, Accounting (4+) | CC-#4 | QS-014 Prisma Client Extension |
| Soft-delete fields without query filters | Dashboard, Accounting, Commission, HR, Feedback, Audit, Config (7+) | CC-#22 | QS-014 Prisma Client Extension |
| Non-CRUD queries skip tenant isolation | Search, Operations, Cache (3) | CC-#34 | Manual fix per service |
| External webhooks behind internal auth | Communication (Twilio), CRM (HubSpot) (2) | CC-#30 | Add @Public() + signature validation |
| Decorative @Roles without RolesGuard | 18+ services, ~85 controllers | CC-#17 | Add RolesGuard to @UseGuards |

---

### Corrections to Security Architecture Table

The "Security Architecture -- What's Correct" table above (written Mar 6 2026) contains 3 claims that the tribunal found to be **partially false**:

| Claim | Reality | Source |
|-------|---------|--------|
| "Role-Based Access Control: `@Roles()` decorator + `RolesGuard` on all protected controllers" | **FALSE** — ~85 controllers across 23 services have `@Roles()` but NO `RolesGuard` in `@UseGuards()`. The decorator does nothing without the guard. | PST-07, PST-09, PST-15, PST-17, PST-23, PST-24, PST-27, PST-28, PST-30, PST-31, PST-32 + others |
| "Multi-tenant isolation: `tenantId` on all queries" | **PARTIALLY FALSE** — CRUD queries mostly include tenantId, but mutations (update/delete) in 4+ services use `where: { id }` only. Analytics, search, and cache queries systematically skip tenantId. | PST-01, PST-03, PST-04, PST-07, PST-22, PST-32, PST-38 |
| "Soft delete: `deletedAt: null` filter everywhere" | **FALSE** — 7+ services have models with `deletedAt` field but zero or partial query filtering. Commission: 60% miss. Feedback: 0/7. Audit: 0/5. Config: 1/9. | PST-02, PST-07, PST-08, PST-23, PST-28, PST-30, PST-31 |
