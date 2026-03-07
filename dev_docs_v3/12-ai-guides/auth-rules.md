# Auth Domain Rules

> AI Dev Guide | Source: `dev_docs_v3/01-services/p0-mvp/01-auth-admin.md`

---

## JWT & Session Management

1. **Token Lifecycle:** Access token expires in 15 minutes. Refresh token lasts 7 days. Auto-refresh on 401 via interceptor in `lib/api/client.ts`.
2. **Cookie-Only Transport:** Tokens MUST be stored in HTTP-only cookies. Never expose access tokens to JavaScript. The codebase has a known P1 bug where `lib/api/client.ts` (lines 59, 77) stores tokens in localStorage -- this is a security violation that must be fixed.
3. **Session Revocation:** Logout invalidates the refresh token server-side (stored in Redis). All other sessions remain valid until their expiry. Admins can revoke individual sessions via `DELETE /auth/sessions/:id`.

## Role Hierarchy (RBAC)

```
SUPER_ADMIN > ADMIN > DISPATCHER > SALES_REP > ACCOUNTING > VIEWER
```

- Roles are **additive** -- a user can have multiple roles.
- Permissions are checked **endpoint-by-endpoint**, not just by role name.
- Only ADMIN can assign roles. Only SUPER_ADMIN can grant ADMIN role.
- Role changes are logged to AuditLog with before/after values.

## Multi-Tenant Isolation

- Every database query MUST include `tenantId` filter.
- A user from Tenant A can NEVER see data from Tenant B.
- Cross-tenant access is Super Admin only, verified by separate claim in JWT.

## Password Policy

| Rule | Detail |
|------|--------|
| Minimum length | 8 characters |
| Complexity | 1 uppercase, 1 number, 1 special character |
| Enforcement | DTO-level (`IsStrongPassword`) |
| Lockout | 5 failed attempts -> 15-minute lockout with exponential backoff |

## MFA (TOTP)

- Once enabled, MFA is required on every login. No bypass path.
- TOTP secret stored encrypted in database.
- Recovery codes must be generated at setup.

## User Status Machine

```
PENDING_VERIFICATION -> ACTIVE (on email verify)
ACTIVE -> INACTIVE (admin deactivate)
ACTIVE -> SUSPENDED (5 failed logins or admin action)
INACTIVE -> ACTIVE (admin reactivate)
SUSPENDED -> ACTIVE (admin unsuspend + reason)
Any -> deleted (soft delete, Admin only)
```

## Audit Log Rules

- All user/permission/tenant changes are written to `AuditLog` immediately.
- Audit logs **cannot** be deleted (no soft delete on AuditLog).
- Retained for 7 years per compliance.
- Audit log records: userId, tenantId, action, entityType, entityId, before/after JSON, ipAddress, userAgent.

## API Endpoints (22 total, all Production)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/v1/auth/login` | Email + password -> JWT cookies |
| POST | `/api/v1/auth/register` | User creation + email verification |
| POST | `/api/v1/auth/logout` | Clears HTTP-only cookies |
| POST | `/api/v1/auth/forgot-password` | Sends reset email via SendGrid |
| POST | `/api/v1/auth/reset-password` | Token + new password |
| GET | `/api/v1/auth/me` | Current user + tenant |
| POST | `/api/v1/auth/mfa/enable` | TOTP secret + QR code |
| POST | `/api/v1/auth/mfa/verify` | Validates 6-digit code |
| POST | `/api/v1/auth/mfa/disable` | Disables MFA |
| POST | `/api/v1/auth/change-password` | Requires current password |
| GET | `/api/v1/auth/sessions` | Active session list |
| DELETE | `/api/v1/auth/sessions/:id` | Revoke session |
| GET/POST | `/api/v1/admin/users` | List (paginated) + Create |
| GET/PUT/PATCH | `/api/v1/admin/users/:id` | Detail + Update |
| PATCH | `/api/v1/admin/users/:id/status` | Status change |
| PUT | `/api/v1/admin/users/:id/roles` | Role assignment |
| GET/POST | `/api/v1/admin/roles` | List + Create |
| GET/PUT/DELETE | `/api/v1/admin/roles/:id` | Detail + Update + Delete |
| GET | `/api/v1/admin/permissions` | All permissions by module |
| GET/POST | `/api/v1/admin/tenants` | List + Create |
| GET/PUT | `/api/v1/admin/tenants/:id` | Detail + Update |
| GET | `/api/v1/admin/audit-logs` | Paginated audit log |

## Hooks

| Hook | Endpoint | Notes |
|------|----------|-------|
| `useAuth` | `/auth/login`, `/auth/logout`, `/auth/me` | Central auth state |
| `useCurrentUser` | `/auth/me` | Cached, auto-refresh |
| `useUsers` | `/admin/users` | Paginated list |
| `useUser` | `/admin/users/:id` | Single user |
| `useCreateUser` | POST `/admin/users` | Mutation |
| `useUpdateUser` | PATCH `/admin/users/:id` | Mutation |
| `useRoles` | `/admin/roles` | List |
| `usePermissions` | `/admin/permissions` | Full permission matrix |
| `useTenants` | `/admin/tenants` | List |
| `useAuditLogs` | `/admin/audit-logs` | Paginated |

## Dependencies

- **Depends on:** PostgreSQL, Redis (sessions, lockout counters), SendGrid (emails)
- **Depended on by:** ALL other services -- every protected endpoint uses `JwtAuthGuard` + `RolesGuard`
- **Breaking change risk:** HIGH
