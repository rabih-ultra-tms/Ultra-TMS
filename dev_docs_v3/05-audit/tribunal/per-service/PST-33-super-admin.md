# PST-33: Super Admin — Per-Service Tribunal Audit

> **Date:** 2026-03-09
> **Auditor:** Claude Opus 4.6
> **Hub File:** `dev_docs_v3/01-services/p3-future/33-super-admin.md`
> **Hub Health Score:** 2/10 (D)

---

## Phase 1: Data Model Verification

### Hub Claims
- Not a standalone module — role-based access layer on top of Auth module
- SUPER_ADMIN role exists
- "Some endpoints skip tenantId filter for SUPER_ADMIN"
- No tests
- No dedicated frontend

### Reality

**SUPER_ADMIN is NOT a standalone module** — hub is CORRECT on this fundamental point. It's a cross-cutting role implemented across 3 layers:

1. **Role constant:** `SUPER_ADMIN` in `common/constants/roles.constant.ts` (line 3)
2. **RolesGuard bypass:** Lines 51-56 of `roles.guard.ts` — SUPER_ADMIN auto-returns `true` for ALL role checks
3. **Auth service login:** Lines 64-97 of `auth.service.ts` — SUPER_ADMIN can login WITHOUT tenantId

**Hub says "Some endpoints skip tenantId filter" — FALSE.** No endpoint code actually skips `tenantId` filtering. The SUPER_ADMIN bypass happens ONLY at the RolesGuard level (authorization, not data access). Every query still uses `@CurrentTenant() tenantId`. This means SUPER_ADMIN has universal role authorization but is still scoped to their own tenant's data — a design gap, not a feature.

**Prisma models involved (via Auth module):**
- User (20+ fields)
- Role (10 fields, @@unique([tenantId, name]))
- Tenant (20+ fields with settings/features/branding JSON)
- Session (ipAddress, userAgent, refreshTokenHash, expiresAt, revokedAt)
- PasswordResetToken (tokenHash, expiresAt, usedAt)

Hub mentions none of these specifically — acceptable since it correctly identifies this as "not a standalone module."

### Verdict: Hub ~60% accurate on architecture, but key cross-tenant claim is WRONG

---

## Phase 2: Endpoint Verification

The Auth module (which houses all super-admin-relevant endpoints) has **6 controllers / 34 endpoints**:

| Controller | Prefix | Endpoints | Guards |
|-----------|--------|-----------|--------|
| AuthController | `/auth` | 8 | Mixed (5 @Public, 3 JwtAuthGuard) |
| UsersController | `/users` | 10 | JwtAuthGuard + RolesGuard ✅ |
| RolesController | `/roles` | 6 | JwtAuthGuard + RolesGuard ✅ |
| TenantController | `/tenant` | 4 | JwtAuthGuard + RolesGuard ✅ |
| ProfileController | `/profile` | 4 | JwtAuthGuard only |
| SessionsController | `/sessions` | 2 | JwtAuthGuard only |

**Hub endpoint claims:** Hub doesn't claim specific endpoints for Super Admin service — it just says "limited cross-tenant functionality." This is directionally correct.

**SUPER_ADMIN referenced in @Roles across the ENTIRE codebase (26 files):**
- Auth module: users, roles, tenant controllers (ADMIN + SUPER_ADMIN)
- Accounting: invoices, dashboard controllers
- Commission: dashboard controller
- Integration Hub: integrations, webhooks, sync controllers (SUPER_ADMIN only on several)
- Audit: ALL 7 controllers (COMPLIANCE + ADMIN + SUPER_ADMIN)
- Config: tenant-services (SUPER_ADMIN only), system-config
- Documents: document-access guard (SUPER_ADMIN bypass)

**4 endpoints are SUPER_ADMIN exclusive** (not shared with ADMIN):
- `GET /tenant-services/by-tenant` — @Roles('SUPER_ADMIN')
- `POST /tenant-services/by-tenant` — @Roles('SUPER_ADMIN')
- Various Integration Hub endpoints — @Roles('SUPER_ADMIN') only

### Verdict: No endpoint count to compare, but hub correctly identifies the scope

---

## Phase 3: Security & Quality Audit

### Security Assessment

**RolesGuard SUPER_ADMIN Bypass (CRITICAL DESIGN DECISION):**
- Lines 51-56 of `roles.guard.ts`: `if SUPER_ADMIN → return true`
- This means SUPER_ADMIN can access ANY guarded endpoint in the ENTIRE system
- **Properly tested:** `roles.guard.spec.ts` line 61 explicitly tests this bypass
- **DESIGN GAP:** RolesGuard bypass grants authorization but NOT cross-tenant data access. Every service query still uses `tenantId` from JWT. A SUPER_ADMIN is effectively a tenant-scoped admin with universal role bypass — they can access all endpoints but only see their own tenant's data.

**Super Admin Login Flow (WELL-IMPLEMENTED):**
- Auth service lines 64-97: Allows login WITHOUT tenantId by searching for SUPER_ADMIN role
- Handles multiple super admin accounts (requires tenantId disambiguation)
- Properly validates 3 role name variants: SUPER_ADMIN, SUPERADMIN, SUPER-ADMIN
- **BUG: `findMany` for super admin login doesn't filter `deletedAt: null`** at line 76-86 — a deleted super admin could still authenticate (the status check at line 106 would catch INACTIVE but not soft-deleted users with ACTIVE status before deletion)

**Token Security:**
- JWT payload includes `roleName`, `roles[]`, `tenantId` — all normalized to uppercase
- Token pair: 15min access + 30d refresh with rotation
- Session stored in both Redis (fast lookup) + Prisma (durability)
- Password hash with bcrypt(10)
- Account lockout: 5 attempts → 15/30min lockout (Redis + DB)
- Rate limiting: @Throttle on login (5 per 60s)

**Frontend Security:**
- Server-side layout check: `superadmin/layout.tsx` decodes JWT from cookie, checks SUPER_ADMIN role
- Client-side guard: `AdminGuard` component re-validates via `useCurrentUser`
- Dual check (server + client) is defense-in-depth — GOOD

### Soft Delete Compliance

| Service | Soft Delete | Notes |
|---------|-------------|-------|
| UsersService.findAll | ✅ | `deletedAt: null` |
| UsersService.findOne | ✅ | `deletedAt: null` |
| UsersService.delete | ✅ | Sets `deletedAt: new Date()` |
| RolesService.findAll | ❌ | No deletedAt filter (Role has deletedAt field) |
| RolesService.findOne | ❌ | No deletedAt filter |
| RolesService.delete | ❌❌ | **HARD DELETE** — `prisma.role.delete()` |
| TenantService | N/A | Single tenant operations, no list/delete |
| ProfileService | N/A | Self-operations |
| SessionsController | ✅ | Filters `revokedAt: null` + expiry |
| AuthService.login super admin | ❌ | `findMany` missing `deletedAt: null` |

**3/7 applicable services miss soft-delete. 1 HARD DELETE (roles).**

### Test Coverage

| Spec File | Tests | LOC |
|-----------|-------|-----|
| auth.service.spec.ts | 22 | 347 |
| users.service.spec.ts | 13 | 159 |
| roles.service.spec.ts | 5 | 52 |
| tenant.service.spec.ts | 8 | 91 |
| profile.service.spec.ts | 6 | 72 |
| mfa.service.spec.ts | 4 | 55 |
| roles.guard.spec.ts | 7 | 99 |
| jwt-auth.guard.spec.ts | 1 | 25 |
| **Total** | **66** | **801** |

**Hub claims "None" — FALSE. This is the 22nd false "no tests" claim.** 66 tests across 8 spec files, 801 LOC. Auth service tests are comprehensive (login, refresh, password reset, email verify, account lockout).

### MFA Service
- **Full stub** — documented as "Phase A" disabled
- 7 methods all throw `Error('MFA not fully implemented yet')` when enabled
- Properly guarded behind `MFA_ENABLED` config flag
- Hub doesn't mention MFA at all

---

## Phase 4: Frontend Verification

### Hub Claims: "Not Built — no dedicated super admin UI"

### Reality: **3 FRONTEND PAGES EXIST** — hub is WRONG

| Route | Status | LOC | Quality |
|-------|--------|-----|---------|
| `/superadmin/login` | ✅ Built | 289 | Full login page with Zod validation, MFA redirect, remember me, password toggle |
| `/superadmin/tenant-services` | ✅ Built | 210 | Service toggle grid per tenant, real API hooks, loading/error/empty states |
| `/superadmin/layout.tsx` | ✅ Built | 72 | Server-side JWT decode + SUPER_ADMIN role check |

**Additionally, the admin section (`/admin/*`) has 13 pages** all gated behind ADMIN/SUPER_ADMIN roles:
- `/admin/users` — list, create, detail, edit (4 pages)
- `/admin/roles` — list, create, detail (3 pages)
- `/admin/tenants` — list, detail (2 pages)
- `/admin/settings` — settings page
- `/admin/permissions` — permissions page
- `/admin/audit-logs` — audit logs page
- `/admin/layout.tsx` — layout with AdminGuard

**Total super-admin-accessible frontend: 16 pages (3 superadmin + 13 admin)**. Hub claims 0. This is the most significant frontend undercount — hub says "Not Built" while 16 pages exist.

---

## Phase 5: Known Issues Verification

### Hub Known Issues (Section 4 Business Rules)

| # | Hub Claim | Accurate? | Reality |
|---|-----------|-----------|---------|
| 1 | SUPER_ADMIN is platform-level, not per-tenant | **PARTIALLY TRUE** | Role bypasses RolesGuard but data remains tenant-scoped |
| 2 | Cross-tenant queries bypass tenantId filter | **FALSE** | NO code bypasses tenantId. Guards bypass only. |
| 3 | Tenant provisioning requires seed + config + admin + feature flags | **UNVERIFIABLE** | No provisioning endpoint exists. TenantService only has get/update. |
| 4 | Enhanced audit trail for SUPER_ADMIN | **FALSE** | No SUPER_ADMIN-specific audit enhancement exists. Standard AuditInterceptor applies to all. |

**Hub accuracy: 0.5/4 (13%)** — worst known issues accuracy of all 33 services.

---

## Tribunal: 5-Round Adversarial Debate

### Round 1: Is this even auditable as a "service"?

**Prosecution:** Super Admin is NOT a service — it's a cross-cutting role. Auditing it as service #33 is category confusion. There's no `super-admin` module directory, no dedicated controller prefix, no Prisma models. It's just a string constant and a guard bypass.

**Defense:** The hub correctly identifies this as "not a standalone module." But the SUPER_ADMIN role has significant architectural implications: universal guard bypass, cross-tenant login flow, dedicated frontend pages. It deserves audit attention even if not a discrete module.

**Verdict:** PROCEED with audit as a "capability audit" not a "module audit." The unique findings (guard bypass, login flow, frontend pages) justify the review.

### Round 2: Cross-tenant data access — gap or feature?

**Prosecution:** The hub claims SUPER_ADMIN can access cross-tenant data. This is the entire selling point of the service. But in reality, EVERY query still filters by `tenantId` from the JWT. A SUPER_ADMIN user belongs to one tenant and can only see that tenant's data. The "cross-tenant" capability is fiction.

**Defense:** The RolesGuard bypass is the first step. Cross-tenant data access would require either: (a) a `?tenantId=xxx` query parameter override, or (b) a special middleware that replaces `@CurrentTenant()` for SUPER_ADMIN. Neither exists.

**Verdict:** **CRITICAL DESIGN GAP.** The SUPER_ADMIN role currently provides: universal authorization + single-tenant data access. It does NOT provide cross-tenant visibility. Hub claims cross-tenant access exists — this is dangerously misleading for implementers.

### Round 3: Frontend surprise — 16 pages hub says don't exist

**Prosecution:** Hub says "Frontend: Not Built." Reality: 3 dedicated superadmin pages + 13 admin pages. This is the worst frontend documentation error across all 33 services.

**Defense:** The admin pages (`/admin/*`) are ADMIN-level, not exclusively SUPER_ADMIN. The hub may be narrowly correct that no "super admin dashboard" (as described in Section 3) exists.

**Verdict:** Hub Section 3 lists 5 planned pages (dashboard, tenant management, tenant detail, global user management, system health). Of these, **tenant management and tenant detail ARE built** at `/admin/tenants` and `/admin/tenants/[id]`. Global user management IS built at `/admin/users`. System health and a super-admin dashboard are NOT built. Hub is **2/5 accurate on planned screens** but claims 0/5 — significant undercount.

### Round 4: Role hard-delete vulnerability

**Prosecution:** `RolesService.delete()` uses `prisma.role.delete()` — a hard delete. Role model HAS a `deletedAt` field. This means deleting a role permanently removes it, potentially orphaning users. The pre-check for users is good but insufficient — what about audit trails referencing the role?

**Defense:** The system role protection (`isSystem: true` can't be deleted) and user assignment check are proper safeguards. Hard delete of custom roles is defensible since they're tenant-scoped configuration.

**Verdict:** **P2 BUG.** Hard delete when model supports soft delete. At minimum should use `update({ deletedAt })` not `delete()`.

### Round 5: Test coverage quality

**Prosecution:** 66 tests sounds good, but these belong to the AUTH MODULE, not "Super Admin" specifically. Only 3 tests directly test SUPER_ADMIN behavior: 2 in auth.service.spec (super admin login flow) and 1 in roles.guard.spec (bypass).

**Defense:** The 3 SUPER_ADMIN-specific tests cover the two most critical behaviors: guard bypass and tenantId-less login. The remaining 63 auth tests indirectly protect SUPER_ADMIN since SUPER_ADMIN uses the same auth infrastructure.

**Verdict:** ACCEPTABLE. The 3 direct tests hit the right targets. Missing: test for soft-deleted SUPER_ADMIN login attempt.

---

## Health Score

| Category | Score | Notes |
|----------|-------|-------|
| Architecture | 8/10 | RolesGuard bypass is clean. JWT strategy solid. Login flow handles edge cases. |
| Security | 7/10 | Universal guard bypass works. Missing: cross-tenant data access, soft-delete on login query. |
| Data Integrity | 6/10 | Role hard-delete. 3/7 soft-delete gaps. No cross-tenant data access despite hub claims. |
| Test Coverage | 8/10 | 66 tests / 8 spec files. Comprehensive auth tests. 3 direct SUPER_ADMIN tests. |
| Documentation | 3/10 | Hub claims cross-tenant access (doesn't exist). Claims no frontend (16 pages exist). Claims no tests (66 exist). |
| Frontend | 7/10 | 16 pages, dual auth check, proper guards. TenantDetail is shell. |
| **Overall** | **7.0/10** | |

**Hub health 2/10 → Actual 7.0/10 (+5.0)**

---

## Verdict: MODIFY

The Super Admin capability is better implemented than documented. The auth module is production-quality with comprehensive login/logout/refresh/MFA-stub flows and good test coverage. The CRITICAL gap is that cross-tenant data access doesn't actually work — the hub's core value proposition for this service is fiction. Frontend is surprisingly built with 16 pages.

---

## Action Items

| # | Priority | Action | Effort |
|---|----------|--------|--------|
| 1 | P0 | Fix `findMany` in super admin login to add `deletedAt: null` filter | 5min |
| 2 | P1 | Implement cross-tenant data access for SUPER_ADMIN (query param override or middleware) | 4h |
| 3 | P1 | Convert `RolesService.delete()` from hard delete to soft delete | 15min |
| 4 | P1 | Add `deletedAt: null` filter to `RolesService.findAll()` and `findOne()` | 10min |
| 5 | P2 | Add test for soft-deleted SUPER_ADMIN login attempt | 15min |
| 6 | P2 | Build Super Admin Dashboard page (`/superadmin/dashboard`) | 4h |
| 7 | P2 | Build System Health page (`/superadmin/system`) | 2h |
| 8 | P3 | Implement SUPER_ADMIN-specific audit enhancement (log which tenant was accessed) | 2h |
| 9 | P3 | Implement MFA (Phase B) — currently full stub | 8h |
| 10 | DOC | Update hub: document 16 frontend pages, 66 tests, 34 endpoints, correct cross-tenant claims | 30min |
| 11 | DOC | Update hub: list actual Prisma models (User, Role, Tenant, Session, PasswordResetToken) | 15min |
| 12 | DOC | Update hub: document MFA stub status | 5min |

---

## Cross-Cutting Findings

1. **RolesGuard SUPER_ADMIN bypass is universal** — applies to ALL 40+ modules. Any module with `@UseGuards(JwtAuthGuard, RolesGuard)` grants SUPER_ADMIN access. This is intentional but means a compromised SUPER_ADMIN account has unlimited API access.
2. **Cross-tenant data access gap** — SUPER_ADMIN should be able to view/manage data across tenants. Currently cannot. This affects the entire "Super Admin" value proposition.
3. **Role hard-delete** — Previously seen in Config (3 hard-deletes), HR (3), Feedback (1), Cache (1), Help Desk (1). Auth's role hard-delete adds to this systemic pattern.
4. **66 tests in auth module** — This was already counted in PST-01 audit. Not double-counting.
