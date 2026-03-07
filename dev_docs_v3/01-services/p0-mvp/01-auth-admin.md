# Service Hub: Auth & Admin (01)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-07
> **Original definition:** `dev_docs/02-services/09-service-auth.md`
> **Design specs:** `dev_docs/12-Rabih-design-Process/01-auth-admin/` (13 files)
> **v2 hub (historical):** `dev_docs_v2/03-services/01-auth-admin.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | C+ (6.5/10) |
| **Confidence** | High — code confirmed via scan |
| **Last Verified** | 2026-03-07 |
| **Backend** | Production (22 endpoints, all working) |
| **Frontend** | Partial — 17/20 screens built, 3 security stubs |
| **Tests** | Partial — auth flows tested, admin pages not |
| **Security** | P0 fixed (Mar 6) — P1 items open |
| **Active Sprint** | QS-tasks: fix remaining stubs, profile edit |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | `dev_docs/02-services/09-service-auth.md` |
| Design Specs | Done | 13 files, all 15-section |
| Backend Controller | Production | `apps/api/src/modules/auth/` + `admin/` |
| Prisma Models | Production | User, Role, Permission, Tenant, Session, AuditLog |
| Frontend Pages | Partial | 17 built, 3 stubs (register, forgot-pw, reset-pw) |
| React Hooks | Partial | useAuth, useUser, useRoles — hooks exist |
| Components | Partial | 20 components; 5 stubs (auth forms, profile edit) |
| Tests | Partial | Auth service tested; admin UI not |
| Security | Partial | P0 bug fixed (console.log); localStorage token P1 open |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| Login | `(auth)/login` | Built | 8/10 | PROTECTED — working auth flow |
| Register | `(auth)/register` | Stub | 2/10 | No submit handler, no API call |
| Forgot Password | `(auth)/forgot-password` | Stub | 2/10 | Placeholder UI only |
| Reset Password | `(auth)/reset-password` | Stub | 2/10 | No token handling |
| MFA Setup | `(auth)/mfa` | Built | 7/10 | QR code + 6-digit input works |
| Users List | `admin/users` | Built | 8/10 | Pagination, filters, status badges |
| User Detail | `admin/users/[id]` | Built | 7/10 | Detail card, roles section |
| User Create | `admin/users/new` | Built | 8/10 | Form validation, role assignment |
| User Edit | `admin/users/[id]/edit` | Built | 8/10 | Pre-populated form |
| Roles List | `admin/roles` | Built | 7/10 | Table with permission counts |
| Role Detail | `admin/roles/[id]` | Built | 7/10 | Permissions editor matrix |
| Role Create | `admin/roles/new` | Built | 7/10 | Form + permission selection |
| Permissions Matrix | `admin/permissions` | Built | 7/10 | Grid grouped by module |
| Tenants List | `admin/tenants` | Built | 7/10 | Multi-tenant table |
| Tenant Create | `admin/tenants/new` | Built | 6/10 | Basic form |
| Audit Logs | `admin/audit-logs` | Built | 6/10 | Table works, filters stub |
| Profile | `profile` | Built | 5/10 | Display works, edit stub |
| General Settings | `admin/settings/general` | Stub | 2/10 | No form handler |
| Security Settings | `admin/settings/security` | Stub | 2/10 | No form handler |
| Notification Settings | `admin/settings/notifications` | Stub | 2/10 | No form handler |

---

## 4. API Endpoints

| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| POST | `/api/v1/auth/login` | AuthController | Production | Email + password → JWT cookies |
| POST | `/api/v1/auth/register` | AuthController | Production | User creation + email verification |
| POST | `/api/v1/auth/logout` | AuthController | Production | Clears HTTP-only cookies |
| POST | `/api/v1/auth/forgot-password` | AuthController | Production | Sends reset email via SendGrid |
| POST | `/api/v1/auth/reset-password` | AuthController | Production | Token + new password |
| GET | `/api/v1/auth/me` | AuthController | Production | Current user + tenant |
| POST | `/api/v1/auth/mfa/enable` | AuthController | Production | TOTP secret + QR code |
| POST | `/api/v1/auth/mfa/verify` | AuthController | Production | Validates 6-digit code |
| POST | `/api/v1/auth/mfa/disable` | AuthController | Production | Disables MFA |
| POST | `/api/v1/auth/change-password` | AuthController | Production | Requires current password |
| GET | `/api/v1/auth/sessions` | AuthController | Production | Active session list |
| DELETE | `/api/v1/auth/sessions/:id` | AuthController | Production | Revoke session |
| GET/POST | `/api/v1/admin/users` | AdminUsersController | Production | List (paginated) + Create |
| GET/PUT/PATCH | `/api/v1/admin/users/:id` | AdminUsersController | Production | Detail + Update |
| PATCH | `/api/v1/admin/users/:id/status` | AdminUsersController | Production | Status change |
| PUT | `/api/v1/admin/users/:id/roles` | AdminUsersController | Production | Role assignment |
| GET/POST | `/api/v1/admin/roles` | AdminRolesController | Production | List + Create |
| GET/PUT/DELETE | `/api/v1/admin/roles/:id` | AdminRolesController | Production | Detail + Update + Delete |
| GET | `/api/v1/admin/permissions` | AdminController | Production | All permissions by module |
| GET/POST | `/api/v1/admin/tenants` | AdminTenantsController | Production | List + Create |
| GET/PUT | `/api/v1/admin/tenants/:id` | AdminTenantsController | Production | Detail + Update |
| GET | `/api/v1/admin/audit-logs` | AdminController | Production | Paginated audit log |

---

## 5. Components

| Component | Path | Status | Shared? |
|-----------|------|--------|---------|
| LoginForm | `components/auth/login-form.tsx` | Good | No |
| RegisterForm | `components/auth/register-form.tsx` | Stub | No |
| ForgotPasswordForm | `components/auth/forgot-password-form.tsx` | Stub | No |
| ResetPasswordForm | `components/auth/reset-password-form.tsx` | Stub | No |
| MFAInput | `components/auth/mfa-input.tsx` | Good | No |
| MFASetupDialog | `components/auth/mfa-setup-dialog.tsx` | Good | No |
| SocialLoginButtons | `components/auth/social-login-buttons.tsx` | Stub | No |
| AdminGuard | `components/auth/admin-guard.tsx` | Good | Yes |
| UsersTable | `components/admin/users/users-table.tsx` | Good | No |
| UserForm | `components/admin/users/user-form.tsx` | Good | No |
| UserDetailCard | `components/admin/users/user-detail-card.tsx` | Good | No |
| UserStatusBadge | `components/admin/users/user-status-badge.tsx` | Good | Yes |
| RolesTable | `components/admin/roles/roles-table.tsx` | Good | No |
| RoleForm | `components/admin/roles/role-form.tsx` | Good | No |
| RolePermissionsEditor | `components/admin/roles/role-permissions-editor.tsx` | Good | No |
| PermissionsMatrix | `components/admin/permissions/permissions-matrix.tsx` | Good | No |
| TenantsTable | `components/admin/tenants/tenants-table.tsx` | Good | No |
| AuditLogTable | `components/admin/audit/audit-log-table.tsx` | Good | No |
| ProfileForm | `components/profile/profile-form.tsx` | Stub | No |
| PasswordChangeForm | `components/profile/password-change-form.tsx` | Stub | No |

---

## 6. Hooks

| Hook | Endpoints Used | Envelope Unwrapped? | Notes |
|------|---------------|---------------------|-------|
| `useAuth` | `/auth/login`, `/auth/logout`, `/auth/me` | Yes | Central auth state |
| `useCurrentUser` | `/auth/me` | Yes | Cached, auto-refresh |
| `useUsers` | `/admin/users` | Yes | Paginated list |
| `useUser` | `/admin/users/:id` | Yes | Single user |
| `useCreateUser` | POST `/admin/users` | Yes | Mutation |
| `useUpdateUser` | PATCH `/admin/users/:id` | Yes | Mutation |
| `useRoles` | `/admin/roles` | Yes | List |
| `usePermissions` | `/admin/permissions` | Yes | Full permission matrix |
| `useTenants` | `/admin/tenants` | Yes | List |
| `useAuditLogs` | `/admin/audit-logs` | Yes | Paginated |

---

## 7. Business Rules

1. **Token Lifecycle:** Access token expires in 15 minutes. Refresh token lasts 7 days. Auto-refresh on 401 via interceptor in `lib/api/client.ts`. Never expose access token to JavaScript — HTTP-only cookies ONLY.
2. **Multi-Tenant Isolation:** Every database query MUST include `tenantId` filter. A user from Tenant A can NEVER see data from Tenant B. Cross-tenant access is Super Admin only, verified by separate claim in JWT.
3. **RBAC Hierarchy:** SUPER_ADMIN > ADMIN > DISPATCHER > SALES_REP > ACCOUNTING > VIEWER. Roles are additive (a user can have multiple). Permissions are checked endpoint-by-endpoint, not just role.
4. **Password Policy:** Minimum 8 characters, 1 uppercase, 1 number, 1 special character. Enforced at DTO level (`IsStrongPassword`). Failed attempts: 5 attempts → 15-minute lockout with exponential backoff.
5. **Session Revocation:** Logout invalidates the refresh token server-side (stored in Redis). All other sessions remain valid until their expiry. Admins can revoke individual sessions via `DELETE /auth/sessions/:id`.
6. **MFA TOTP:** Once enabled, MFA is required on every login. No bypass path for ADMIN/DISPATCHER roles. TOTP secret stored encrypted in database. Recovery codes must be generated at setup.
7. **Audit Log Immutability:** All user/permission/tenant changes are written to `AuditLog` table immediately. Audit logs cannot be deleted (no soft delete on AuditLog). Retained for 7 years per compliance.
8. **Role Assignment Restriction:** Only ADMIN can assign roles. Only SUPER_ADMIN can grant ADMIN role. Role changes are logged to AuditLog with before/after values.

---

## 8. Data Model

### User
```
User {
  id           String (UUID)
  email        String (unique per tenant)
  passwordHash String
  firstName    String
  lastName     String
  phone        String?
  status       UserStatus (ACTIVE, INACTIVE, SUSPENDED, PENDING_VERIFICATION)
  mfaEnabled   Boolean (default: false)
  mfaSecret    String? (encrypted)
  tenantId     String (FK → Tenant)
  roles        UserRole[] (many-to-many via UserRole)
  sessions     Session[]
  createdAt    DateTime
  updatedAt    DateTime
  deletedAt    DateTime? (soft delete)
  lastLoginAt  DateTime?
  external_id  String? (migration field)
}
```

### Role
```
Role {
  id          String (UUID)
  name        String (unique per tenant)
  description String?
  tenantId    String (FK → Tenant, null = system role)
  permissions RolePermission[]
  users       UserRole[]
}
```

### Tenant
```
Tenant {
  id           String (UUID)
  name         String
  slug         String (unique)
  plan         TenantPlan (STARTER, PROFESSIONAL, ENTERPRISE)
  status       TenantStatus (ACTIVE, SUSPENDED, TRIAL)
  settings     Json (custom_fields)
  createdAt    DateTime
}
```

### AuditLog
```
AuditLog {
  id         String (UUID)
  userId     String (who did it)
  tenantId   String
  action     String (CREATE, UPDATE, DELETE, LOGIN, etc.)
  entityType String (User, Role, Load, etc.)
  entityId   String
  before     Json? (previous state)
  after      Json? (new state)
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime (no updatedAt — immutable)
}
```

---

## 9. Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| `email` | IsEmail, unique per tenant | "Invalid email format" / "Email already registered" |
| `password` | Min 8 chars, IsStrongPassword | "Password must be at least 8 characters with uppercase, number, and special char" |
| `roleId` | IsUUID, must exist in tenant | "Invalid role" |
| `tenantId` | Must match JWT claim | "Access denied" (silent, security) |
| `mfaCode` | Exactly 6 digits, valid TOTP | "Invalid or expired code" |
| `firstName`/`lastName` | 1–100 chars, IsString | "Name is required" |
| `status` | IsEnum(UserStatus) | "Invalid status value" |
| Login attempts | Max 5 in 15 min | "Account temporarily locked" |

---

## 10. Status States

### User Status Machine
```
PENDING_VERIFICATION → ACTIVE (on email verify)
ACTIVE → INACTIVE (admin deactivate)
ACTIVE → SUSPENDED (5 failed logins or admin action)
INACTIVE → ACTIVE (admin reactivate)
SUSPENDED → ACTIVE (admin unsuspend + reason)
Any → deleted (soft delete, Admin only)
```

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
| Dashboard hardcoded to zeros (not real data) | P1 UX | `(dashboard)/dashboard/page.tsx` | Open |
| Register form — no submit handler, no API call | P1 Functional | `(auth)/register/page.tsx` | Open |
| Forgot-password form — placeholder only | P1 Functional | `(auth)/forgot-password/page.tsx` | Open |
| Reset-password — no token handling | P1 Functional | `(auth)/reset-password/page.tsx` | Open |
| Profile edit form — not wired to API | P1 UX | `components/profile/profile-form.tsx` | Open |
| Settings forms (general/security/notifications) — stubs | P2 UX | `admin/settings/*/page.tsx` | Open |
| SocialLoginButtons — text only, no OAuth | P3 | `components/auth/social-login-buttons.tsx` | Deferred |

---

## 12. Tasks

### Quality Sprint (Active)
| Task ID | Title | Effort | Status |
|---------|-------|--------|--------|
| BUG-005 | Remove localStorage token storage (`lib/api/client.ts`) | S (1-2h) | Open |
| QS-005 | Build Profile page (edit form, password change, MFA, sessions) | L (4-8h) | Open |

### Backlog
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| AUTH-101 | Implement Register flow (form + API + email verify) | M (4h) | P1 |
| AUTH-102 | Implement Forgot/Reset password flow | M (3h) | P1 |
| AUTH-103 | Build Settings forms (general + security + notifications) | M (4h) | P2 |
| AUTH-104 | Wire dashboard KPIs to real API data | M (2-3h) | P1 |
| AUTH-105 | MFA recovery codes UI | S (2h) | P2 |

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
| Auth service only | Auth + Admin merged | Scope expanded |
| Basic email/password | MFA (TOTP) added | Enhancement |
| Simple roles | Granular permissions matrix | Enhancement |
| 12 screens planned | 20 screens built/stubbed | +8 screens |
| Tests required | Minimal tests written | Gap |
| No localStorage tokens | localStorage tokens found | Security debt |

---

## 15. Dependencies

**Depends on:**
- PostgreSQL (User, Tenant, Role, Permission tables)
- Redis (session storage, refresh token blacklist, lockout counters)
- SendGrid (forgot-password emails, email verification)

**Depended on by:**
- ALL other services — every protected endpoint uses `JwtAuthGuard` + `RolesGuard` from this service
- Every frontend page uses `useAuth()` to determine access
- TMS Core, CRM, Carrier, Accounting — all check `tenantId` from auth context
- Super Admin service — uses cross-tenant JWT claim

**Breaking change risk:** HIGH — changes to auth flow affect every service.
