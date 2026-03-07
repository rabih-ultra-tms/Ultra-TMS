# Auth & Admin Design Spec Integration

**Source:** `dev_docs/12-Rabih-design-Process/01-auth-admin/` (13 files)
**MVP Tier:** P0
**Frontend routes:** `(auth)/*` + `(dashboard)/admin/*`
**Backend module:** `apps/api/src/modules/auth/`, `apps/api/src/modules/operations/admin/`

---

## Screen-to-Route Mapping

| # | Design Spec | Frontend Route | Page File | Status |
|---|------------|----------------|-----------|--------|
| 00 | `00-service-overview.md` | — | — | Reference only |
| 01 | `01-login.md` | `/login` | `(auth)/login/page.tsx` | PROTECTED (8/10) |
| 02 | `02-register.md` | `/register` | `(auth)/register/page.tsx` | Exists |
| 03 | `03-forgot-password.md` | `/forgot-password` | `(auth)/forgot-password/page.tsx` | Exists |
| 04 | `04-reset-password.md` | `/reset-password` | `(auth)/reset-password/page.tsx` | Exists |
| 05 | `05-mfa-setup.md` | `/mfa` | `(auth)/mfa/page.tsx` | Exists |
| 06 | `06-profile-settings.md` | `/profile` | `(dashboard)/profile/page.tsx` | Exists |
| 07 | `07-user-management.md` | `/admin/users` | `(dashboard)/admin/users/page.tsx` | Exists |
| 08 | `08-user-detail.md` | `/admin/users/[id]` | `(dashboard)/admin/users/[id]/page.tsx` | Exists |
| 09 | `09-role-management.md` | `/admin/roles` | `(dashboard)/admin/roles/page.tsx` | Exists |
| 10 | `10-role-editor.md` | `/admin/roles/[id]` | `(dashboard)/admin/roles/[id]/page.tsx` | Exists |
| 11 | `11-tenant-settings.md` | `/admin/settings` | `(dashboard)/admin/settings/page.tsx` | Exists |
| 12 | `12-security-log.md` | `/admin/audit-logs` | `(dashboard)/admin/audit-logs/page.tsx` | Exists |

---

## Backend Endpoints

| Screen | Endpoint(s) | Controller |
|--------|-------------|------------|
| Login | `POST /auth/login` | AuthController |
| Register | `POST /auth/register` | AuthController |
| Forgot Password | `POST /auth/forgot-password` | AuthController |
| Reset Password | `POST /auth/reset-password` | AuthController |
| MFA Setup | `POST /auth/mfa/enable`, `POST /auth/mfa/verify` | AuthController |
| Profile | `GET /auth/profile`, `PATCH /auth/profile` | AuthController |
| User Management | `GET /admin/users`, `POST /admin/users` | AdminController |
| User Detail | `GET /admin/users/:id`, `PATCH /admin/users/:id` | AdminController |
| Role Management | `GET /admin/roles`, `POST /admin/roles` | RolesController |
| Role Editor | `GET /admin/roles/:id`, `PATCH /admin/roles/:id` | RolesController |
| Tenant Settings | `GET /admin/tenants/:id`, `PATCH /admin/tenants/:id` | AdminController |
| Security Log | `GET /audit` | AuditController |

---

## Implementation Notes

- Login page is PROTECTED — do not rebuild
- All auth pages use `(auth)` route group (no sidebar/dashboard shell)
- Admin pages use `(dashboard)` route group with sidebar
- JWT token currently stored in localStorage (P0 security bug SEC-001)
- Console.log JWT statements in admin layout (P0 security bug SEC-002)
