# Security Findings — Ultra TMS

> Last updated: 2026-03-07
> Source: Security audit conducted Mar 6 2026 + Claude Review v1 (Jan 2026)

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

| Priority | Total | Fixed | Open |
|----------|-------|-------|------|
| P0 Critical | 4 | 4 | 0 |
| P1 High | 2 | 0 | 2 |
| P2 Medium | 4 | 0 | 4 |
| P3 Low | 3 | 0 | 3 |
| **Total** | **13** | **4** | **9** |

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
