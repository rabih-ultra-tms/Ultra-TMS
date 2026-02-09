# Service 01: Auth & Admin

> **Grade:** C+ (6.5/10) | **Priority:** Fix bugs | **Phase:** 0
> **Web Prompt:** `dev_docs/11-ai-dev/web-dev-prompts/01-auth-admin-ui.md`
> **Design Specs:** `dev_docs/12-Rabih-design-Process/01-auth-admin/` (13 files)

---

## Status Summary

17 of 23 pages are production-ready with working authentication, user management, role-based access control, and tenant administration. Three critical security vulnerabilities exist (JWT tokens logged to console, localStorage fallback tokens, user roles exposed in sidebar). Six pages are non-functional stubs (register, forgot-password, reset-password, settings forms). Dashboard hardcoded to zeros.

---

## Screens

| Screen | Route | Status | Quality | Task ID | Notes |
|--------|-------|--------|---------|---------|-------|
| Login | `(auth)/login` | Built | 8/10 | — | Working, calls real API |
| Register | `(auth)/register` | Stub | 2/10 | — | Placeholder, no submit handler |
| Forgot Password | `(auth)/forgot-password` | Stub | 2/10 | — | Placeholder, no API call |
| Reset Password | `(auth)/reset-password` | Stub | 2/10 | — | Placeholder, no token handling |
| MFA Setup | `(auth)/mfa` | Built | 7/10 | — | QR code + 6-digit input works |
| Users List | `admin/users` | Built | 8/10 | — | Pagination, filters, status badges |
| User Detail | `admin/users/[id]` | Built | 7/10 | — | Detail card, roles section |
| User Create | `admin/users/new` | Built | 8/10 | — | Form validation, role assignment |
| User Edit | `admin/users/[id]/edit` | Built | 8/10 | — | Pre-populated form |
| Roles List | `admin/roles` | Built | 7/10 | — | Table with permission counts |
| Role Detail | `admin/roles/[id]` | Built | 7/10 | — | Permissions editor matrix |
| Role Create | `admin/roles/new` | Built | 7/10 | — | Form + permission selection |
| Permissions Matrix | `admin/permissions` | Built | 7/10 | — | Grid grouped by module |
| Tenants List | `admin/tenants` | Built | 7/10 | — | Multi-tenant table |
| Tenant Create | `admin/tenants/new` | Built | 6/10 | — | Basic form |
| Audit Logs | `admin/audit-logs` | Built | 6/10 | — | Table works, filters stub |
| Profile | `profile` | Built | 5/10 | — | Display works, edit stub |
| General Settings | `admin/settings/general` | Stub | 2/10 | — | No form handler |
| Security Settings | `admin/settings/security` | Stub | 2/10 | — | No form handler |
| Notification Settings | `admin/settings/notifications` | Stub | 2/10 | — | No form handler |

---

## Backend API

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/auth/login` | POST | Production | Email + password, returns tokens |
| `/auth/register` | POST | Production | User creation + verification |
| `/auth/logout` | POST | Production | Clears HTTP-only cookies |
| `/auth/forgot-password` | POST | Production | Sends reset email |
| `/auth/reset-password` | POST | Production | Accepts token + new password |
| `/auth/me` | GET | Production | Current user data |
| `/auth/mfa/enable` | POST | Production | TOTP secret + QR code |
| `/auth/mfa/verify` | POST | Production | Validates 6-digit code |
| `/auth/mfa/disable` | POST | Production | Disables MFA |
| `/auth/change-password` | POST | Production | With current password verification |
| `/auth/sessions` | GET | Production | Lists active sessions |
| `/auth/sessions/:id` | DELETE | Production | Revokes session |
| `/admin/users` | GET/POST | Production | List (paginated) + Create |
| `/admin/users/:id` | GET/PUT/PATCH | Production | Detail + Update |
| `/admin/users/:id/status` | PATCH | Production | Status change |
| `/admin/users/:id/roles` | PUT | Production | Role assignment |
| `/admin/roles` | GET/POST | Production | List + Create |
| `/admin/roles/:id` | GET/PUT/DELETE | Production | Detail + Update + Delete |
| `/admin/permissions` | GET | Production | All permissions grouped by module |
| `/admin/tenants` | GET/POST | Production | List + Create |
| `/admin/tenants/:id` | GET/PUT | Production | Detail + Update |
| `/admin/audit-logs` | GET | Production | Paginated list |

---

## Frontend Components

| Component | Path | Quality | Notes |
|-----------|------|---------|-------|
| LoginForm | `components/auth/login-form.tsx` | Good | Working |
| RegisterForm | `components/auth/register-form.tsx` | Stub | Placeholder |
| ForgotPasswordForm | `components/auth/forgot-password-form.tsx` | Stub | Placeholder |
| ResetPasswordForm | `components/auth/reset-password-form.tsx` | Stub | Placeholder |
| MFAInput | `components/auth/mfa-input.tsx` | Good | 6-digit numeric |
| MFASetupDialog | `components/auth/mfa-setup-dialog.tsx` | Good | QR + instructions |
| SocialLoginButtons | `components/auth/social-login-buttons.tsx` | Stub | Text only |
| AdminGuard | `components/auth/admin-guard.tsx` | Good | Role-based |
| UsersTable | `components/admin/users/users-table.tsx` | Good | Pagination + actions |
| UserForm | `components/admin/users/user-form.tsx` | Good | Zod validation |
| UserDetailCard | `components/admin/users/user-detail-card.tsx` | Good | Info display |
| UserStatusBadge | `components/admin/users/user-status-badge.tsx` | Good | Status colors |
| RolesTable | `components/admin/roles/roles-table.tsx` | Good | Permission counts |
| RoleForm | `components/admin/roles/role-form.tsx` | Good | Permission matrix |
| RolePermissionsEditor | `components/admin/roles/role-permissions-editor.tsx` | Good | Checkbox grid |
| PermissionsMatrix | `components/admin/permissions/permissions-matrix.tsx` | Good | Module groups |
| TenantsTable | `components/admin/tenants/tenants-table.tsx` | Good | Multi-tenant |
| AuditLogTable | `components/admin/audit/audit-log-table.tsx` | Good | Entry list |
| ProfileForm | `components/profile/profile-form.tsx` | Stub | Not wired |
| PasswordChangeForm | `components/profile/password-change-form.tsx` | Stub | Placeholder |

---

## Design Specs

| Screen | Spec File | Content Level |
|--------|-----------|---------------|
| Service Overview | `00-service-overview.md` | Overview |
| Login | `01-login.md` | Full 15-section |
| Register | `02-register.md` | Full 15-section |
| Forgot Password | `03-forgot-password.md` | Full 15-section |
| Reset Password | `04-reset-password.md` | Full 15-section |
| MFA Setup | `05-mfa-setup.md` | Full 15-section |
| Profile Settings | `06-profile-settings.md` | Full 15-section |
| User Management | `07-user-management.md` | Full 15-section |
| User Detail | `08-user-detail.md` | Full 15-section |
| Role Management | `09-role-management.md` | Full 15-section |
| Role Editor | `10-role-editor.md` | Full 15-section |
| Tenant Settings | `11-tenant-settings.md` | Full 15-section |
| Security Log | `12-security-log.md` | Full 15-section |

---

## Open Bugs

| Bug ID | Title | Severity | File |
|--------|-------|----------|------|
| BUG-004 | JWT tokens logged to console (10 locations) | P0 Security | `admin/layout.tsx` |
| BUG-004 | User roles logged to console | P1 Security | `app-sidebar.tsx:28` |
| BUG-005 | localStorage token storage (XSS) | P1 Security | `lib/api/client.ts:59,77,117,126,139` |
| BUG-008 | Dashboard hardcoded to zeros | P1 UX | Dashboard page |

---

## Tasks

| Task ID | Title | Phase | Status | Effort |
|---------|-------|-------|--------|--------|
| BUG-004 | Remove JWT/roles console logs | 0 | NOT STARTED | S (1h) |
| BUG-005 | Remove localStorage token storage | 0 | NOT STARTED | M (2-3h) |
| BUG-008 | Wire dashboard to real API data | 0 | NOT STARTED | M (2-3h) |

---

## Key Business Rules

### Role & Permission Matrix
| Role | Description | Key Permissions |
|------|-------------|-----------------|
| SUPER_ADMIN | System owner | Full access, tenant management |
| ADMIN | Tenant admin | User management, settings, all modules |
| DISPATCHER | Operations lead | Orders, loads, dispatch, tracking |
| SALES_REP | Sales team | Quotes, customers, rate tables |
| ACCOUNTING | Finance team | Invoices, payments, settlements |
| VIEWER | Read-only | View all, edit nothing |

### Authentication Rules
| Rule | Detail |
|------|--------|
| **Token Lifecycle** | Access token: 15 min. Refresh token: 7 days. |
| **Cookie Storage** | HTTP-only cookies only. NO localStorage. |
| **Session Revocation** | Logout invalidates refresh token server-side |
| **Multi-Tenant Isolation** | Every query filtered by `tenantId`. No cross-tenant data leaks. |
| **Password Policy** | Min 8 chars, 1 uppercase, 1 number, 1 special |
| **Failed Login Lockout** | 5 attempts → 15 min lockout |

## Key References

| Document | Path | What It Contains |
|----------|------|------------------|
| Auth API | `dev_docs/11-ai-dev/api-dev-prompts/03-auth-api.md` | JWT, RBAC, session management |
| Security Audit | `dev_docs_v2/04-audit/auth-admin.md` | 3 security issues found |

---

## Dependencies

- **Depends on:** PostgreSQL, Prisma, JWT, shadcn/ui
- **Depended on by:** All other services (auth guards, role checks, user context)

---

## What to Build Next (Ordered)

1. **Fix 3 security vulnerabilities** (BUG-004, BUG-005) — Remove console logs and localStorage tokens. 3h total.
2. **Wire dashboard KPIs to real data** (BUG-008) — Connect to order/load/carrier count endpoints. 2-3h.
3. **Implement register + forgot/reset password flows** — 3 stub pages need full implementation. 7h total.
4. **Complete profile edit forms** — Profile, password change, MFA settings, active sessions. 7h total.
5. **Build settings forms** — General, security, notification settings. 6h total.
