# Service Hub: Auth & Admin (01)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-09 (PST-01 tribunal)
> **Original definition:** `dev_docs/02-services/09-service-auth.md`
> **Design specs:** `dev_docs/12-Rabih-design-Process/01-auth-admin/` (13 files)
> **v2 hub (historical):** `dev_docs_v2/03-services/01-auth-admin.md`
> **Tribunal file:** `dev_docs_v3/05-audit/tribunal/per-service/batch-1-p0/PST-01-auth-admin.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | B+ (7.5/10) |
| **Confidence** | High — code-verified via PST-01 tribunal |
| **Last Verified** | 2026-03-09 |
| **Backend** | Production (34 endpoints across 6 controllers: auth, users, profile, roles, tenant, sessions) |
| **Frontend** | Substantial — 22/26 screens built, 1 stub (audit logs), 3 settings stubs |
| **Tests** | Partial — 7 backend suites (59 cases, 801 LOC) + 2 frontend test files |
| **Security** | Backend 9/10. P0 fixed (Mar 6) — P1 localStorage token open |
| **Active Sprint** | QS-017: rewrite hub to match codebase; QS-018: auth integration tests |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | `dev_docs/02-services/09-service-auth.md` |
| Design Specs | Done | 13 files, all 15-section |
| Backend Controllers | Production | `apps/api/src/modules/auth/` — 6 controllers (auth, users, profile, roles, tenant, sessions). No separate `admin/` module |
| Prisma Models | Production | User, Role, Tenant, Session, AuditLog (no Permission, UserRole, or RolePermission models) |
| Frontend Pages | Substantial | 22 built (including register, forgot-pw, reset-pw as real implementations), 1 stub (audit logs), 3 settings stubs |
| React Hooks | Production | 30+ hooks across use-auth.ts, admin/use-users.ts, admin/use-roles.ts, admin/use-tenant.ts |
| Components | Production | 35+ components; 2 stubs (social-login, settings forms) |
| Tests | Partial | 7 backend suites (59 cases, 801 LOC) + 2 frontend test files (login-form.test, users-table.test). Shallow — 80% mocks |
| Security | Strong | All endpoints auth-guarded, tenant-isolated (115 tenantId refs). P1 localStorage token open |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| Login | `(auth)/login` | Built | 8/10 | PROTECTED — working auth flow (113 LOC) |
| Register | `(auth)/register` | Built | 6/10 | Real implementation (170+ LOC, form validation, submit handler) |
| Forgot Password | `(auth)/forgot-password` | Built | 6/10 | Real implementation (95+ LOC, email flow) |
| Reset Password | `(auth)/reset-password` | Built | 6/10 | Real implementation (full token handling) |
| Super Admin Login | `(auth)/superadmin/login` | Built | — | Separate login flow for super admins |
| Verify Email | `(auth)/verify-email` | Built | — | Email verification page |
| MFA Setup | `(auth)/mfa` | Built | 7/10 | QR code + 6-digit input works |
| Users List | `admin/users` | Built | 8/10 | Pagination, filters, status badges |
| User Detail | `admin/users/[id]` | Built | 7/10 | Detail card, roles section |
| User Create | `admin/users/new` | Built | 8/10 | Form validation, role assignment |
| User Edit | `admin/users/[id]/edit` | Built | 8/10 | Pre-populated form |
| Roles List | `admin/roles` | Built | 7/10 | Table with permission counts |
| Role Detail | `admin/roles/[id]` | Built | 7/10 | Permissions editor matrix |
| Role Create | `admin/roles/new` | Built | 7/10 | Form + permission selection |
| Permissions Matrix | `admin/permissions` | Built | 8/10 | Grid grouped by module (2,608 LOC component) |
| Tenants List | `admin/tenants` | Built | 7/10 | Multi-tenant table (1,246 LOC) |
| Tenant Detail | `admin/tenants/[id]` | Built | 7/10 | Form + settings + users section |
| Audit Logs | `admin/audit-logs` | Stub | 2/10 | EmptyState only — no real data |
| Profile | `profile` | Built | 6/10 | Profile form + avatar upload, functional |
| Profile Security | `profile/security` | Built | — | Password change + MFA + active sessions |
| General Settings | `admin/settings/general` | Stub | 2/10 | Form skeleton, no API |
| Security Settings | `admin/settings/security` | Stub | 2/10 | Form skeleton, no API |
| Notification Settings | `admin/settings/notifications` | Stub | 2/10 | Form skeleton, no API |

**Note:** Hub previously listed Tenant Create at `admin/tenants/new` — route does not exist. Tenant creation is handled via the Tenant Detail form at `/admin/tenants/[id]`.

---

## 4. API Endpoints

34 endpoints across 6 controllers. Paths are actual controller routes (not `/admin/` prefixed as previously claimed).

### Auth Controller (8 endpoints)
| Method | Path | Guard | Status | Notes |
|--------|------|-------|--------|-------|
| POST | `/api/v1/auth/login` | @Public | Production | Email + password → JWT cookies |
| POST | `/api/v1/auth/register` | @Public | Production | User creation + email verification |
| POST | `/api/v1/auth/logout` | JwtAuthGuard | Production | Clears HTTP-only cookies |
| POST | `/api/v1/auth/forgot-password` | @Public | Production | Sends reset email via SendGrid |
| POST | `/api/v1/auth/reset-password` | @Public | Production | Token + new password |
| GET | `/api/v1/auth/me` | JwtAuthGuard | Production | Current user + tenant |
| POST | `/api/v1/auth/refresh` | @Public | Production | Token refresh |
| POST | `/api/v1/auth/verify-email` | @Public | Production | Email verification |

### MFA Endpoints (within Auth Controller)
| Method | Path | Guard | Status | Notes |
|--------|------|-------|--------|-------|
| POST | `/api/v1/auth/mfa/enable` | JwtAuthGuard | Production | TOTP secret + QR code |
| POST | `/api/v1/auth/mfa/verify` | JwtAuthGuard | Production | Validates 6-digit code |
| POST | `/api/v1/auth/mfa/disable` | JwtAuthGuard | Production | Disables MFA |

### Session Endpoints (within Auth Controller)
| Method | Path | Guard | Status | Notes |
|--------|------|-------|--------|-------|
| POST | `/api/v1/auth/change-password` | JwtAuthGuard | Production | Requires current password |
| GET | `/api/v1/auth/sessions` | JwtAuthGuard | Production | Active session list |
| DELETE | `/api/v1/auth/sessions/:id` | JwtAuthGuard | Production | Revoke session |
| POST | `/api/v1/auth/logout-all` | JwtAuthGuard | Production | Revoke all sessions |

### Users Controller (10 endpoints)
| Method | Path | Guard | Status | Notes |
|--------|------|-------|--------|-------|
| GET | `/api/v1/users` | JwtAuthGuard + RolesGuard | Production | Paginated list |
| GET | `/api/v1/users/:id` | JwtAuthGuard + RolesGuard | Production | User detail |
| POST | `/api/v1/users` | JwtAuthGuard + RolesGuard | Production | Create user |
| PUT | `/api/v1/users/:id` | JwtAuthGuard + RolesGuard | Production | Update user |
| DELETE | `/api/v1/users/:id` | JwtAuthGuard + RolesGuard | Production | Soft delete |
| POST | `/api/v1/users/:id/invite` | JwtAuthGuard + RolesGuard | Production | Send invitation |
| POST | `/api/v1/users/:id/activate` | JwtAuthGuard + RolesGuard | Production | Activate user |
| POST | `/api/v1/users/:id/deactivate` | JwtAuthGuard + RolesGuard | Production | Deactivate user |
| PATCH | `/api/v1/users/:id/roles` | JwtAuthGuard + RolesGuard | Production | Role assignment |
| POST | `/api/v1/users/:id/reset-password` | JwtAuthGuard + RolesGuard | Production | Admin-initiated password reset |

### Profile Controller (4 endpoints)
| Method | Path | Guard | Status | Notes |
|--------|------|-------|--------|-------|
| GET | `/api/v1/profile` | JwtAuthGuard | Production | Get current user profile |
| PUT | `/api/v1/profile` | JwtAuthGuard | Production | Update profile |
| PUT | `/api/v1/profile/password` | JwtAuthGuard | Production | Change password |
| POST | `/api/v1/profile/avatar` | JwtAuthGuard | Production | Upload avatar |

### Roles Controller (6 endpoints)
| Method | Path | Guard | Status | Notes |
|--------|------|-------|--------|-------|
| GET | `/api/v1/roles` | JwtAuthGuard + RolesGuard | Production | List roles |
| GET | `/api/v1/roles/:id` | JwtAuthGuard + RolesGuard | Production | Role detail |
| POST | `/api/v1/roles` | JwtAuthGuard + RolesGuard | Production | Create role |
| PUT | `/api/v1/roles/:id` | JwtAuthGuard + RolesGuard | Production | Update role |
| DELETE | `/api/v1/roles/:id` | JwtAuthGuard + RolesGuard | Production | Delete role |
| GET | `/api/v1/roles/permissions` | JwtAuthGuard + RolesGuard | Production | All permissions by module |

### Tenant Controller (4 endpoints)
| Method | Path | Guard | Status | Notes |
|--------|------|-------|--------|-------|
| GET | `/api/v1/tenant` | JwtAuthGuard + RolesGuard | Production | Get tenant |
| PUT | `/api/v1/tenant` | JwtAuthGuard + RolesGuard | Production | Update tenant |
| GET | `/api/v1/tenant/settings` | JwtAuthGuard + RolesGuard | Production | Get tenant settings |
| PUT | `/api/v1/tenant/settings` | JwtAuthGuard + RolesGuard | Production | Update tenant settings |

---

## 5. Components

### Auth Components
| Component | Path | Status | Shared? |
|-----------|------|--------|---------|
| LoginForm | `components/auth/login-form.tsx` | Good | No |
| RegisterForm | `components/auth/register-form.tsx` | Good | No |
| ForgotPasswordForm | `components/auth/forgot-password-form.tsx` | Good | No |
| ResetPasswordForm | `components/auth/reset-password-form.tsx` | Good | No |
| MFAInput | `components/auth/mfa-input.tsx` | Good | No |
| MFASetupDialog | `components/auth/mfa-setup-dialog.tsx` | Good | No |
| SocialLoginButtons | `components/auth/social-login-buttons.tsx` | Stub | No |
| AdminGuard | `components/auth/admin-guard.tsx` | Good | Yes |
| AuthLayout | `components/auth/auth-layout.tsx` | Good | Yes |
| MFASettings | `components/auth/mfa-settings.tsx` | Good | No |
| ActiveSessions | `components/auth/active-sessions.tsx` | Good | No |

### Admin / Users Components
| Component | Path | Status | Shared? |
|-----------|------|--------|---------|
| UsersTable | `components/admin/users/users-table.tsx` | Good | No |
| UserForm | `components/admin/users/user-form.tsx` | Good | No |
| UserDetailCard | `components/admin/users/user-detail-card.tsx` | Good | No |
| UserStatusBadge | `components/admin/users/user-status-badge.tsx` | Good | Yes |
| UserFilters | `components/admin/users/user-filters.tsx` | Good | No |

### Admin / Roles Components
| Component | Path | Status | Shared? |
|-----------|------|--------|---------|
| RolesTable | `components/admin/roles/roles-table.tsx` | Good | No |
| RoleForm | `components/admin/roles/role-form.tsx` | Good | No |
| RolePermissionsEditor | `components/admin/roles/role-permissions-editor.tsx` | Good | No |
| RoleUsersSection | `components/admin/roles/role-users-section.tsx` | Good | No |
| PermissionGroupCard | `components/admin/permissions/permission-group-card.tsx` | Good | No |

### Admin / Permissions & Tenants Components
| Component | Path | Status | Shared? |
|-----------|------|--------|---------|
| PermissionsMatrix | `components/admin/permissions/permissions-matrix.tsx` | Good | No |
| TenantsTable | `components/admin/tenants/tenants-table.tsx` | Good | No |
| TenantForm | `components/admin/tenants/tenant-form.tsx` | Good | No |
| TenantSettingsForm | `components/admin/tenants/tenant-settings-form.tsx` | Good | No |
| TenantUsersSection | `components/admin/tenants/tenant-users-section.tsx` | Good | No |

### Admin / Audit Components
| Component | Path | Status | Shared? |
|-----------|------|--------|---------|
| AuditLogTable | `components/admin/audit/audit-log-table.tsx` | Stub | No |
| AuditLogDetail | `components/admin/audit/audit-log-detail.tsx` | Good | No |
| AuditLogFilters | `components/admin/audit/audit-log-filters.tsx` | Good | No |

### Profile Components
| Component | Path | Status | Shared? |
|-----------|------|--------|---------|
| ProfileForm | `components/profile/profile-form.tsx` | Good | No |
| PasswordChangeForm | `components/profile/password-change-form.tsx` | Good | No |
| AvatarUpload | `components/profile/avatar-upload.tsx` | Good | No |

---

## 6. Hooks

30+ hooks across 4 hook files. **Note:** None of the hooks use `unwrap()` / `unwrapPaginated()` — they call `apiClient.get/post` directly and handle the `{ data: T }` envelope at the query function or component level.

### Auth Hooks (`lib/hooks/use-auth.ts`)
| Hook | Endpoints Used | Notes |
|------|---------------|-------|
| `useAuth` | `/auth/login`, `/auth/logout`, `/auth/me` | Central auth state |
| `useCurrentUser` | `/auth/me` | Cached, auto-refresh |
| `useLogin` | POST `/auth/login` | Mutation |
| `useRegister` | POST `/auth/register` | Mutation |
| `useLogout` | POST `/auth/logout` | Mutation |
| `useForgotPassword` | POST `/auth/forgot-password` | Mutation |
| `useResetPassword` | POST `/auth/reset-password` | Mutation |
| `useChangePassword` | POST `/auth/change-password` | Mutation |
| `useVerifyMFA` | POST `/auth/mfa/verify` | Mutation |
| `useEnableMFA` | POST `/auth/mfa/enable` | Mutation |
| `useConfirmMFA` | POST `/auth/mfa/verify` | Mutation |
| `useDisableMFA` | POST `/auth/mfa/disable` | Mutation |
| `useSessions` | GET `/auth/sessions` | List |
| `useRevokeSession` | DELETE `/auth/sessions/:id` | Mutation |
| `useRevokeAllSessions` | POST `/auth/logout-all` | Mutation |
| `useHasPermission` | Client-side check | Uses current user context |
| `useHasRole` | Client-side check | Uses current user context |

### Admin User Hooks (`lib/hooks/admin/use-users.ts`)
| Hook | Endpoints Used | Notes |
|------|---------------|-------|
| `useUsers` | GET `/users` | Paginated list |
| `useUser` | GET `/users/:id` | Single user |
| `useCreateUser` | POST `/users` | Mutation |
| `useUpdateUser` | PUT `/users/:id` | Mutation |
| `useUpdateUserStatus` | POST `/users/:id/activate` or `/deactivate` | Mutation |
| `useAssignRoles` | PATCH `/users/:id/roles` | Mutation |
| `useResetUserPassword` | POST `/users/:id/reset-password` | Mutation |
| `useUnlockUser` | POST `/users/:id/activate` | Mutation |

### Admin Role Hooks (`lib/hooks/admin/use-roles.ts`)
| Hook | Endpoints Used | Notes |
|------|---------------|-------|
| `useRoles` | GET `/roles` | List |
| `useRole` | GET `/roles/:id` | Single role |
| `useCreateRole` | POST `/roles` | Mutation |
| `useUpdateRole` | PUT `/roles/:id` | Mutation |
| `useDeleteRole` | DELETE `/roles/:id` | Mutation |
| `usePermissions` | GET `/roles/permissions` | Full permission matrix |

### Admin Tenant Hooks (`lib/hooks/admin/use-tenant.ts`)
| Hook | Endpoints Used | Notes |
|------|---------------|-------|
| `useTenant` | GET `/tenant` | Current tenant |
| `useUpdateTenant` | PUT `/tenant` | Mutation |
| `useTenantSettings` | GET `/tenant/settings` | Settings |
| `useUpdateTenantSettings` | PUT `/tenant/settings` | Mutation |

**Phantom hook (removed):** ~~`useAuditLogs`~~ — previously listed but does not exist. Audit logs page is a stub.

---

## 7. Business Rules

1. **Token Lifecycle:** Access token expires in 15 minutes. Refresh token lasts 7 days. Auto-refresh on 401 via interceptor in `lib/api/client.ts`. HTTP-only cookies intended, but **P1: localStorage token storage still exists** in `lib/api/client.ts`.
2. **Multi-Tenant Isolation:** Every database query MUST include `tenantId` filter (115 occurrences verified). A user from Tenant A can NEVER see data from Tenant B. Cross-tenant access is Super Admin only, verified by separate claim in JWT.
3. **RBAC — Single Role per User:** User has a single `roleId` FK (not many-to-many). Role contains a `permissions Json` field storing permissions as a string array. Hierarchy: SUPER_ADMIN > ADMIN > DISPATCHER > SALES_REP > ACCOUNTING > VIEWER. Permissions are checked endpoint-by-endpoint via `@Roles()` decorator.
4. **Password Policy:** Minimum 8 characters. Enforced at DTO level with `@MinLength(8)` (not `@IsStrongPassword` — weaker than ideal). Failed attempts: 5 attempts → 15-minute lockout with Redis + DB dual storage.
5. **Session Revocation:** Logout invalidates the refresh token server-side (stored in Redis + PostgreSQL). Admins can revoke individual sessions via `DELETE /auth/sessions/:id` or all sessions via `POST /auth/logout-all`.
6. **MFA TOTP:** Once enabled, MFA is required on every login. No bypass path for ADMIN/DISPATCHER roles. TOTP secret stored encrypted in database. Recovery code generation at setup — not verified in code.
7. **Audit Log:** All user/permission/tenant changes are written to `AuditLog` table. **Note:** AuditLog schema has `updatedAt` and `deletedAt` fields — immutability is NOT enforced at the schema level. The `before`/`after` snapshot fields do NOT exist in the schema; audit entries record `category`, `severity`, `description`, and `metadata` instead.
8. **Role Assignment Restriction:** Only ADMIN can assign roles. Only SUPER_ADMIN can grant ADMIN role. Role changes are logged to AuditLog. Uses `@Roles('ADMIN', 'SUPER_ADMIN')` guard.
9. **Account Lockout:** 5 failed login attempts triggers 15-minute lockout. Tracked via `failedLoginAttempts` and `lockedUntil` fields on User model. Dual storage in Redis and PostgreSQL.
10. **User Status Transitions:** PENDING → ACTIVE (email verify), ACTIVE → INACTIVE (admin deactivate), ACTIVE → SUSPENDED (lockout or admin), INACTIVE/SUSPENDED → ACTIVE (admin reactivate). Status stored as String (no enum). No state machine guard prevents invalid transitions.

---

## 8. Data Model

### User
```
User {
  id                  String (UUID)
  email               String (unique per tenant)
  passwordHash        String
  firstName           String
  lastName            String
  phone               String?
  status              String (ACTIVE, INACTIVE, SUSPENDED, PENDING_VERIFICATION — stored as String, not enum)
  mfaEnabled          Boolean (default: false)
  mfaSecret           String? (encrypted)
  tenantId            String (FK → Tenant)
  roleId              String (FK → Role — single role, not many-to-many)
  sessions            Session[]
  emailVerifiedAt     DateTime?
  avatarUrl           String?
  timezone            String?
  locale              String?
  failedLoginAttempts Int (default: 0)
  lockedUntil         DateTime?
  sourceSystem        String?
  customFields        Json?
  createdById         String?
  updatedById         String?
  createdAt           DateTime
  updatedAt           DateTime
  deletedAt           DateTime? (soft delete)
  lastLoginAt         DateTime?
  external_id         String? (migration field)
}
```

### Role
```
Role {
  id          String (UUID)
  name        String (unique per tenant)
  description String?
  tenantId    String (FK → Tenant, null = system role)
  permissions Json (string array — stored as JSON, not junction table)
  isSystem    Boolean
  createdById String?
  createdAt   DateTime
  updatedAt   DateTime
  deletedAt   DateTime?
}
```

**Note:** No `UserRole` junction table, no `RolePermission` junction table, no standalone `Permission` model. User has a single `roleId` FK. Permissions are strings stored in a JSON array on Role.

### Tenant
```
Tenant {
  id                 String (UUID)
  name               String
  slug               String (unique)
  subscriptionPlan   String? (STARTER, PROFESSIONAL, ENTERPRISE — stored as String, not enum)
  status             String (default: "ACTIVE" — stored as String, not enum)
  settings           Json (custom_fields)
  domain             String?
  features           Json?
  branding           Json?
  trialEndsAt        DateTime?
  subscriptionStatus String?
  createdAt          DateTime
  updatedAt          DateTime
  deletedAt          DateTime?
}
```

### AuditLog
```
AuditLog {
  id          String (UUID)
  userId      String (who did it)
  tenantId    String
  action      String (CREATE, UPDATE, DELETE, LOGIN, etc.)
  entityType  String (User, Role, Load, etc.)
  entityId    String
  category    AuditActionCategory (enum)
  severity    AuditSeverity (enum)
  description String?
  metadata    Json?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime
  updatedAt   DateTime
  deletedAt   DateTime?
}
```

**Note:** AuditLog does NOT have `before`/`after` Json snapshot fields. It has `category`, `severity`, `description`, and `metadata` instead. Has `updatedAt` and `deletedAt` — immutability is NOT enforced at schema level.

---

## 9. Validation Rules

| Field | Rule | DTO Decorator | Error Message |
|-------|------|---------------|--------------|
| `email` | IsEmail, unique per tenant | `@IsEmail()` | "Invalid email format" / "Email already registered" |
| `password` | Min 8 chars | `@MinLength(8)` (not @IsStrongPassword) | "Password must be at least 8 characters" |
| `roleId` | IsUUID, must exist in tenant | `@IsUUID()` | "Invalid role" |
| `tenantId` | Must match JWT claim | `@CurrentTenant()` decorator | "Access denied" (silent, security) |
| `mfaCode` | String (no length/digit validation in DTO) | `@IsString()` | "Invalid or expired code" |
| `firstName`/`lastName` | IsString (no MaxLength) | `@IsString()` | "Name is required" |
| `status` | String (no enum validation) | Service-level check | "Invalid status value" |
| Login attempts | Max 5 in 15 min | Service-level (Redis + DB) | "Account temporarily locked" |

---

## 10. Status States

### User Status Machine
```
PENDING_VERIFICATION → ACTIVE (on email verify)
ACTIVE → INACTIVE (admin deactivate)
ACTIVE → SUSPENDED (5 failed logins or admin action)
INACTIVE → ACTIVE (admin reactivate)
SUSPENDED → ACTIVE (admin unsuspend)
Any → deleted (soft delete, Admin only)
```

**Note:** Status stored as String, not enum. Transitions enforced in service layer but no state machine guard prevents invalid transitions (e.g., SUSPENDED → INACTIVE directly).

### Session Lifecycle
```
Created (on login) → Active (valid JWT) → Expired (15min access / 7day refresh)
Active → Revoked (logout or admin revoke)
```

---

## 11. Known Issues

| Issue | Severity | File | Status |
|-------|----------|------|--------|
| localStorage token storage (XSS vector) | P1 Security | `lib/api/client.ts:59,77,117,126,139` | Open |
| AuditLog immutability not enforced (has updatedAt/deletedAt) | P1 Compliance | `prisma/schema.prisma` (AuditLog model) | Open |
| auth.service.ts is 559-LOC monolith (8+ responsibilities) | P2 Code Health | `modules/auth/auth.service.ts` | Open |
| No hooks use `unwrap()` / `unwrapPaginated()` pattern | P2 Pattern | `lib/hooks/use-auth.ts`, `admin/*.ts` | Open |
| MFA DTO lacks `@Length(6,6)` and `@IsNumberString()` | P2 Validation | `auth.dto.ts` | Open |
| Password DTO uses `@MinLength(8)` not `@IsStrongPassword()` | P2 Validation | `login.dto.ts` | Open |
| 19 `any` types in auth module | P3 Types | Various settings/config contexts | Open |
| Settings forms (general/security/notifications) — stubs | P2 UX | `admin/settings/*/page.tsx` | Open |
| Audit Logs page — EmptyState stub | P1 Functional | `admin/audit-logs/page.tsx` | Open |
| SocialLoginButtons — text only, no OAuth | P3 | `components/auth/social-login-buttons.tsx` | Deferred |
| No state machine guard for user status transitions | P2 | `users.service.ts` | Open |
| Test coverage shallow — 80% mocks, missing tenant isolation + edge case tests | P1 Quality | Backend test suites | Open |

**Resolved Issues (closed during PST-01 tribunal):**
- ~~Register form — no submit handler, no API call~~ — FIXED: Real implementation (170+ LOC, form validation, submit handler)
- ~~Forgot-password form — placeholder only~~ — FIXED: Real implementation (95+ LOC, email flow)
- ~~Reset-password — no token handling~~ — FIXED: Real implementation (full token handling)
- ~~Profile edit form — not wired to API~~ — FIXED: Real implementation (32 LOC, functional form + avatar upload)
- ~~Dashboard hardcoded to zeros~~ — Moved to Dashboard Shell (02) hub; fixed there

---

## 12. Tasks

### Completed (verified by PST-01 tribunal)
| Task ID | Title | Status |
|---------|-------|--------|
| AUTH-101 | Implement Register flow (form + API + email verify) | **Done** — real implementation exists |
| AUTH-102 | Implement Forgot/Reset password flow | **Done** — real implementation exists |
| QS-005 | Build Profile page (edit form, password change, MFA, sessions) | **Done** — profile form + avatar + security page exist |

### Open (from tribunal findings)
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| BUG-005 | Remove localStorage token storage (`lib/api/client.ts`) | S (1-2h) | P1 |
| QS-017 | Rewrite Auth hub file to match codebase | M (3-4h) | P0 |
| QS-018 | Auth integration tests (tenant isolation + password reset) | L (5-7h) | P0 |
| AUTH-103 | Build Settings forms (general + security + notifications) | M (4h) | P2 |
| AUTH-105 | MFA recovery codes UI | S (2h) | P2 |
| AUTH-106 | Wire audit-logs page to real data + create useAuditLogs hook | M (3-4h) | P1 |
| AUTH-107 | Add `@IsStrongPassword()` to login DTO | XS (30min) | P1 |
| AUTH-108 | Add `@Length(6,6)` + `@IsNumberString()` to MFA code DTO | XS (30min) | P1 |
| AUTH-109 | Split auth.service.ts into auth, password-reset, session services | M (3-4h) | P2 |
| AUTH-110 | Fix AuditLog immutability (remove deletedAt or add before/after fields) | S (2h) | P1 |
| AUTH-111 | Adopt `unwrap()` / `unwrapPaginated()` in auth hooks or document direct pattern | S (2h) | P2 |

---

## 13. Design Links

| Screen | Spec | Path |
|--------|------|------|
| Login | Full 15-section | `dev_docs/12-Rabih-design-Process/01-auth-admin/01-login.md` |
| Register | Full 15-section | `dev_docs/12-Rabih-design-Process/01-auth-admin/02-register.md` |
| Forgot Password | Full 15-section | `dev_docs/12-Rabih-design-Process/01-auth-admin/03-forgot-password.md` |
| Reset Password | Full 15-section | `dev_docs/12-Rabih-design-Process/01-auth-admin/04-reset-password.md` |
| MFA Setup | Full 15-section | `dev_docs/12-Rabih-design-Process/01-auth-admin/05-mfa-setup.md` |
| Profile Settings | Full 15-section | `dev_docs/12-Rabih-design-Process/01-auth-admin/06-profile-settings.md` |
| User Management | Full 15-section | `dev_docs/12-Rabih-design-Process/01-auth-admin/07-user-management.md` |
| User Detail | Full 15-section | `dev_docs/12-Rabih-design-Process/01-auth-admin/08-user-detail.md` |
| Role Management | Full 15-section | `dev_docs/12-Rabih-design-Process/01-auth-admin/09-role-management.md` |
| Role Editor | Full 15-section | `dev_docs/12-Rabih-design-Process/01-auth-admin/10-role-editor.md` |
| Tenant Settings | Full 15-section | `dev_docs/12-Rabih-design-Process/01-auth-admin/11-tenant-settings.md` |
| Security Log | Full 15-section | `dev_docs/12-Rabih-design-Process/01-auth-admin/12-security-log.md` |

---

## 14. Delta vs Original Plan

| Original Plan | Actual | Delta |
|--------------|--------|-------|
| Auth service only | Auth + Admin merged into single module | Scope expanded |
| Basic email/password | MFA (TOTP) added | Enhancement |
| Simple roles (multi-role) | Single roleId FK + JSON permissions | Simpler than planned |
| UserRole/RolePermission junction tables | Not created — JSON approach used | Architecture simplification |
| 12 screens planned | 22+ screens built | +10 screens |
| 3 screens listed as stubs | Register, forgot-pw, reset-pw are real implementations | Better than documented |
| Audit logs "built" | Actually an EmptyState stub | Worse than documented |
| Tests required | 59 test cases (shallow, 80% mocked) | Partial coverage |
| No localStorage tokens | localStorage tokens found | Security debt |

---

## 15. Dependencies

**Depends on:**
- PostgreSQL (User, Role, Tenant, Session, AuditLog tables)
- Redis (session storage, refresh token blacklist, lockout counters)
- SendGrid (forgot-password emails, email verification)

**Depended on by:**
- ALL other services — every protected endpoint uses `JwtAuthGuard` + `RolesGuard` from this service
- ALL frontend pages — `useCurrentUser`, `useHasRole`, `useHasPermission` hooks
- TMS Core, CRM, Carrier, Accounting — all check `tenantId` from auth context
- Super Admin service — uses cross-tenant JWT claim

**Breaking change risk:** CRITICAL — auth module exports are imported by every other module. A bug in token validation, tenant extraction, or role checking breaks ALL 34+ other services.
