# Service Hub: Super Admin (33)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-09 (PST-33 tribunal)
> **Priority:** P-Infra (cross-cutting role layer on top of Auth module)
> **Design specs:** `dev_docs/12-Rabih-design-Process/38-super-admin/`
> **Tribunal file:** `dev_docs_v3/05-audit/tribunal/per-service/PST-33-super-admin.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | B- (7.0/10) |
| **Confidence** | High — code-verified via PST-33 tribunal |
| **Last Verified** | 2026-03-09 |
| **Backend** | Production — SUPER_ADMIN role with universal RolesGuard bypass, cross-tenant login flow, referenced in 26 files across 7+ modules |
| **Frontend** | Substantial — 16 pages (3 superadmin + 13 admin), dual auth check (server + client) |
| **Tests** | 66 tests across 8 spec files (801 LOC) — shared with Auth module |
| **Priority** | P1 — fix soft-deleted super admin login bug, implement cross-tenant data access |
| **Note** | Not a standalone module. Super Admin is a role-based access layer on top of the Auth module. |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Role Constant | Built | `SUPER_ADMIN` in `common/constants/roles.constant.ts` (line 3) |
| RolesGuard Bypass | Built | Lines 51-56 of `roles.guard.ts` — auto-returns `true` for all role checks |
| Auth Login Flow | Built | Lines 64-97 of `auth.service.ts` — login WITHOUT tenantId, handles multiple accounts |
| Cross-Tenant Data Access | **Not Built** | Guard bypass grants authorization only — every query still uses `@CurrentTenant() tenantId` |
| Frontend — Superadmin Pages | Built | 3 pages: `/superadmin/login`, `/superadmin/tenant-services`, `superadmin/layout.tsx` |
| Frontend — Admin Pages | Built | 13 pages: users (4), roles (3), tenants (2), settings, permissions, audit-logs, layout |
| MFA Service | Stub | 7 methods throw `Error('MFA not fully implemented yet')` — guarded behind `MFA_ENABLED` flag |
| Tests | 66 tests | 8 spec files, 801 LOC — 3 tests directly target SUPER_ADMIN behavior |

---

## 3. Screens

### Superadmin Pages (dedicated)
| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| Super Admin Login | `/superadmin/login` | Built | 8/10 | 289 LOC, Zod validation, MFA redirect, remember me, password toggle |
| Tenant Services | `/superadmin/tenant-services` | Built | 7/10 | 210 LOC, service toggle grid per tenant, real API hooks, loading/error/empty states |
| Layout | `/superadmin/layout.tsx` | Built | 8/10 | 72 LOC, server-side JWT decode + SUPER_ADMIN role check |

### Admin Pages (ADMIN/SUPER_ADMIN gated)
| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| Users List | `/admin/users` | Built | — | User management |
| User Create | `/admin/users/new` | Built | — | Create user form |
| User Detail | `/admin/users/[id]` | Built | — | User details |
| User Edit | `/admin/users/[id]/edit` | Built | — | Edit user form |
| Roles List | `/admin/roles` | Built | — | Role management |
| Role Create | `/admin/roles/new` | Built | — | Create role form |
| Role Detail | `/admin/roles/[id]` | Built | — | Role details |
| Tenants List | `/admin/tenants` | Built | — | Tenant management |
| Tenant Detail | `/admin/tenants/[id]` | Built | — | Tenant config, users, stats |
| Settings | `/admin/settings` | Built | — | Admin settings |
| Permissions | `/admin/permissions` | Built | — | Permission management |
| Audit Logs | `/admin/audit-logs` | Built | — | Audit log viewer |
| Admin Layout | `/admin/layout.tsx` | Built | — | Layout with AdminGuard component |

### Planned (Not Yet Built)
| Screen | Route | Status | Notes |
|--------|-------|--------|-------|
| Super Admin Dashboard | `/superadmin/dashboard` | Not Built | Cross-tenant overview with KPIs |
| System Health | `/superadmin/system` | Not Built | Infrastructure monitoring |

---

## 4. API Endpoints

Super Admin is not a standalone module — it leverages the Auth module's 6 controllers with 34 endpoints:

### Auth Controller (`/auth`)
| Method | Path | Status | Notes |
|--------|------|--------|-------|
| POST | `/api/v1/auth/login` | Production | SUPER_ADMIN can login WITHOUT tenantId (lines 64-97) |
| POST | `/api/v1/auth/register` | Production | @Public |
| POST | `/api/v1/auth/refresh` | Production | Token rotation |
| POST | `/api/v1/auth/logout` | Production | Session revocation |
| POST | `/api/v1/auth/forgot-password` | Production | @Public |
| POST | `/api/v1/auth/reset-password` | Production | @Public |
| POST | `/api/v1/auth/verify-email` | Production | @Public |
| GET | `/api/v1/auth/me` | Production | Current user info |

### Users Controller (`/users`) — JwtAuthGuard + RolesGuard
| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/users` | Production | List users (10 endpoints total) |
| GET | `/api/v1/users/:id` | Production | Get user |
| POST | `/api/v1/users` | Production | Create user |
| PATCH | `/api/v1/users/:id` | Production | Update user |
| DELETE | `/api/v1/users/:id` | Production | Soft delete (sets deletedAt) |
| + 5 more | — | Production | Additional user management endpoints |

### Roles Controller (`/roles`) — JwtAuthGuard + RolesGuard
| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/roles` | Production | List roles (6 endpoints) |
| GET | `/api/v1/roles/:id` | Production | Get role |
| POST | `/api/v1/roles` | Production | Create role |
| PATCH | `/api/v1/roles/:id` | Production | Update role |
| DELETE | `/api/v1/roles/:id` | Production | **BUG: Hard delete** — uses `prisma.role.delete()` |
| GET | `/api/v1/roles/permissions` | Production | List permissions |

### Tenant Controller (`/tenant`) — JwtAuthGuard + RolesGuard
| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/tenant` | Production | Get current tenant (4 endpoints) |
| PATCH | `/api/v1/tenant` | Production | Update tenant |
| + 2 more | — | Production | Additional tenant endpoints |

### Profile Controller (`/profile`) — JwtAuthGuard only
| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/profile` | Production | Get profile (4 endpoints) |
| PATCH | `/api/v1/profile` | Production | Update profile |
| + 2 more | — | Production | Additional profile endpoints |

### Sessions Controller (`/sessions`) — JwtAuthGuard only
| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/sessions` | Production | List active sessions (2 endpoints) |
| DELETE | `/api/v1/sessions/:id` | Production | Revoke session |

### SUPER_ADMIN-Exclusive Endpoints (across other modules)
| Method | Path | Module | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/tenant-services/by-tenant` | Config | @Roles('SUPER_ADMIN') only |
| POST | `/api/v1/tenant-services/by-tenant` | Config | @Roles('SUPER_ADMIN') only |
| Various | Integration Hub endpoints | Integration Hub | @Roles('SUPER_ADMIN') only |

**Total: 34 endpoints in Auth module + 4+ SUPER_ADMIN-exclusive endpoints across other modules.**

**SUPER_ADMIN referenced in @Roles across 26 files:** Auth, Accounting, Commission, Integration Hub, Audit (all 7 controllers), Config, Documents (bypass in access guard).

---

## 5. Components

Super Admin does not have a dedicated component directory. Components are distributed across the superadmin and admin page files:

| Component | Location | Notes |
|-----------|----------|-------|
| SuperAdmin Login Form | `/superadmin/login/page.tsx` | Zod validation, MFA redirect |
| Tenant Service Grid | `/superadmin/tenant-services/page.tsx` | Service toggle per tenant |
| AdminGuard | Admin layout | Client-side re-validation via `useCurrentUser` |
| User CRUD pages | `/admin/users/*` | 4 pages (list, create, detail, edit) |
| Role CRUD pages | `/admin/roles/*` | 3 pages (list, create, detail) |
| Tenant pages | `/admin/tenants/*` | 2 pages (list, detail — detail is shell) |

---

## 6. Hooks

Super Admin pages use hooks from the Auth module and tenant-services:

| Hook | Endpoint | Notes |
|------|----------|-------|
| Tenant services hooks | `/tenant-services/by-tenant` | Used by `/superadmin/tenant-services` page |
| `useCurrentUser` | `/auth/me` | Used by AdminGuard for client-side auth check |

---

## 7. Business Rules

1. **RolesGuard Universal Bypass:** SUPER_ADMIN auto-returns `true` for ALL `@Roles()` checks in the entire system (lines 51-56 of `roles.guard.ts`). This means a SUPER_ADMIN can access ANY guarded endpoint across all 40+ modules.
2. **Tenant-Less Login:** SUPER_ADMIN can login WITHOUT providing a `tenantId`. The system searches for users with SUPER_ADMIN role across all tenants. If multiple matches, tenantId disambiguation is required. Handles 3 role name variants: `SUPER_ADMIN`, `SUPERADMIN`, `SUPER-ADMIN`.
3. **Token Security:** JWT payload includes `roleName`, `roles[]`, `tenantId` (all normalized to uppercase). 15min access token + 30d refresh with rotation. Session stored in Redis (fast lookup) + Prisma (durability).
4. **Account Lockout:** 5 failed attempts triggers 15/30min lockout via Redis + DB. Rate limiting: @Throttle on login (5 per 60s).
5. **Dual Frontend Auth:** Server-side layout checks JWT from cookie for SUPER_ADMIN role. Client-side AdminGuard re-validates via `useCurrentUser`. Defense-in-depth pattern.
6. **MFA Stub:** Full 7-method MFA service exists but all throw `Error('MFA not fully implemented yet')` when `MFA_ENABLED` config flag is true. Currently disabled.

**CRITICAL DESIGN GAP:** SUPER_ADMIN has universal role authorization but is still scoped to their own tenant's data. Every query uses `@CurrentTenant() tenantId` from JWT. There is NO cross-tenant data access — the guard bypass grants authorization, not data visibility. A SUPER_ADMIN is effectively a tenant-scoped admin with universal endpoint access.

---

## 8. Data Model

Super Admin operates via the Auth module's models (no dedicated models):

| Model | Key Fields | Notes |
|-------|-----------|-------|
| User | 20+ fields, deletedAt, status | Core user entity |
| Role | 10 fields, @@unique([tenantId, name]), isSystem | Role definitions |
| Tenant | 20+ fields, settings/features/branding JSON | Tenant configuration |
| Session | ipAddress, userAgent, refreshTokenHash, expiresAt, revokedAt | Active sessions |
| PasswordResetToken | tokenHash, expiresAt, usedAt | Password reset flow |

---

## 9. Validation Rules

- Login: email (required), password (required), tenantId (optional for SUPER_ADMIN)
- User CRUD: standard DTO validation via class-validator
- Role CRUD: name uniqueness per tenant (@@unique([tenantId, name]))
- Tenant update: settings/features/branding validated as JSON
- Password: bcrypt(10) hashing
- Super admin role name matching: case-insensitive, handles 3 variants

---

## 10. Status States

No dedicated state machine. SUPER_ADMIN status depends on:

| State | Source | Notes |
|-------|--------|-------|
| User.status | ACTIVE / INACTIVE | INACTIVE users blocked at login (line 106) |
| User.deletedAt | null / Date | **BUG: Not checked in super admin login query** |
| Session.revokedAt | null / Date | Revoked sessions filtered out |
| Session.expiresAt | Date | Expired sessions filtered out |
| Role.deletedAt | null / Date | **BUG: Not checked in findAll/findOne** |

---

## 11. Known Issues

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| `findMany` in super admin login missing `deletedAt: null` filter | P0 BUG | **Open** | Deleted super admin could authenticate (auth.service.ts line 76-86) |
| Cross-tenant data access not implemented | P1 GAP | **Open** | SUPER_ADMIN has universal auth but single-tenant data access — core value proposition missing |
| `RolesService.delete()` is hard delete | P2 BUG | **Open** | Uses `prisma.role.delete()` — Role model has deletedAt field, should soft-delete |
| `RolesService.findAll()` missing `deletedAt: null` filter | P1 BUG | **Open** | Deleted roles appear in listings |
| `RolesService.findOne()` missing `deletedAt: null` filter | P1 BUG | **Open** | Deleted roles accessible by ID |
| MFA not implemented (full stub) | P3 | **Open** | 7 methods throw error, guarded behind config flag |
| Tenant Detail page is a shell | P2 | **Open** | `/admin/tenants/[id]` needs fleshing out |

**Resolved Issues (closed during PST-33 tribunal):**
- ~~No dedicated super admin UI~~ — FALSE: 16 pages exist (3 superadmin + 13 admin)
- ~~No tests~~ — FALSE: 66 tests across 8 spec files (801 LOC)
- ~~Cross-tenant queries bypass tenantId filter~~ — FALSE: No code bypasses tenantId. Guards bypass only.
- ~~Enhanced audit trail for SUPER_ADMIN~~ — FALSE: No SUPER_ADMIN-specific audit enhancement exists
- ~~Tenant provisioning requires seed + config + admin + feature flags~~ — UNVERIFIABLE: No provisioning endpoint exists

---

## 12. Tasks

### Completed (verified by PST-33 tribunal)
| Task ID | Title | Status |
|---------|-------|--------|
| — | SUPER_ADMIN RolesGuard bypass | **Done** — properly tested |
| — | Tenant-less login flow | **Done** — handles edge cases |
| — | Superadmin login page | **Done** — 289 LOC with Zod |
| — | Tenant services page | **Done** — 210 LOC with API hooks |
| — | Server + client auth guards | **Done** — dual defense-in-depth |
| — | Admin CRUD pages (users, roles, tenants) | **Done** — 13 pages |

### Open (from tribunal findings)
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| SA-001 | Fix `findMany` in super admin login to add `deletedAt: null` filter | XS (5min) | P0 |
| SA-002 | Implement cross-tenant data access for SUPER_ADMIN (query param override or middleware) | L (4h) | P1 |
| SA-003 | Convert `RolesService.delete()` from hard delete to soft delete | XS (15min) | P1 |
| SA-004 | Add `deletedAt: null` filter to `RolesService.findAll()` and `findOne()` | XS (10min) | P1 |
| SA-005 | Add test for soft-deleted SUPER_ADMIN login attempt | S (15min) | P2 |
| SA-006 | Build Super Admin Dashboard page (`/superadmin/dashboard`) | L (4h) | P2 |
| SA-007 | Build System Health page (`/superadmin/system`) | M (2h) | P2 |
| SA-008 | Implement SUPER_ADMIN-specific audit enhancement | M (2h) | P3 |
| SA-009 | Implement MFA (Phase B) — currently full stub | XL (8h) | P3 |

---

## 13. Design Links

| Screen | Path |
|--------|------|
| Super Admin specs | `dev_docs/12-Rabih-design-Process/38-super-admin/` |

---

## 14. Delta vs Original Plan

| Original Plan | Actual | Delta |
|--------------|--------|-------|
| "Not a standalone module" | Cross-cutting role across 26 files, 7+ modules | Correct assessment |
| Cross-tenant data access | Authorization bypass only — no data access | **Gap: core value proposition missing** |
| Frontend: Not Built | 16 pages (3 superadmin + 13 admin) | **Hub was catastrophically wrong** |
| Tests: None | 66 tests, 8 spec files, 801 LOC | **Hub was catastrophically wrong** |
| Hub rated 2/10 | Verified 7.0/10 by PST-33 tribunal | +5.0 score improvement |

---

## 15. Dependencies

**Depends on:**
- Auth module (role system, JWT, login flow, guards — this IS the auth module's SUPER_ADMIN layer)
- Config module (tenant-services SUPER_ADMIN-exclusive endpoints)
- Integration Hub (SUPER_ADMIN-exclusive endpoints)
- Audit module (SUPER_ADMIN role referenced in all 7 controllers)
- Documents module (SUPER_ADMIN bypass in document-access guard)

**Depended on by:**
- All modules using `@Roles()` decorator (SUPER_ADMIN bypass affects every guarded endpoint)
- Config tenant-services (SUPER_ADMIN-exclusive access)

---

## 16. Test Coverage

| Spec File | Tests | LOC | Notes |
|-----------|-------|-----|-------|
| auth.service.spec.ts | 22 | 347 | Login, refresh, password reset, email verify, account lockout |
| users.service.spec.ts | 13 | 159 | User CRUD |
| roles.service.spec.ts | 5 | 52 | Role CRUD |
| tenant.service.spec.ts | 8 | 91 | Tenant operations |
| profile.service.spec.ts | 6 | 72 | Profile operations |
| mfa.service.spec.ts | 4 | 55 | MFA stub tests |
| roles.guard.spec.ts | 7 | 99 | **Line 61: explicitly tests SUPER_ADMIN bypass** |
| jwt-auth.guard.spec.ts | 1 | 25 | Guard instantiation |
| **Total** | **66** | **801** | 3 tests directly target SUPER_ADMIN behavior |

---

## 17. Soft Delete Compliance

| Service | Soft Delete | Notes |
|---------|-------------|-------|
| UsersService.findAll | Yes | `deletedAt: null` |
| UsersService.findOne | Yes | `deletedAt: null` |
| UsersService.delete | Yes | Sets `deletedAt: new Date()` |
| RolesService.findAll | **No** | Missing `deletedAt` filter |
| RolesService.findOne | **No** | Missing `deletedAt` filter |
| RolesService.delete | **Hard Delete** | `prisma.role.delete()` — Role has `deletedAt` field |
| TenantService | N/A | Single tenant operations, no list/delete |
| ProfileService | N/A | Self-operations |
| SessionsController | Yes | Filters `revokedAt: null` + expiry |
| AuthService.login (super admin) | **No** | `findMany` missing `deletedAt: null` |

**3/7 applicable services miss soft-delete. 1 hard delete (roles).**
