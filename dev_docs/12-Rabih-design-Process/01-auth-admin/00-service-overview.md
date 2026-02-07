# Auth & Admin Service Overview

> Service: Auth & Admin | Wave: 1 (Enhancement Focus) | Priority: P0
> Total Screens: 12 | Status: ALL BUILT | Focus: Enhancement & Polish
> Tech Stack: JWT auth with refresh token rotation, RBAC (7 default roles), MFA (TOTP, SMS, EMAIL), Tenant management

---

## Service Summary

The Auth & Admin service is the foundational authentication and authorization layer of Ultra TMS. All 12 screens are LIVE and functional. This Wave 1 design pass focuses exclusively on **enhancement opportunities** — improving the visual polish, user experience, security posture, and conversion funnel of every screen. No new screens need to be built; the goal is to elevate what already exists from "functional" to "exceptional."

**Core Capabilities:**
- JWT authentication with automatic refresh token rotation
- Role-Based Access Control (RBAC) with 7 default roles (Super Admin, Tenant Admin, Dispatcher, Broker, Carrier Manager, Finance, Read-Only)
- Multi-Factor Authentication supporting TOTP (authenticator apps), SMS, and EMAIL
- Multi-tenant architecture with tenant-level branding and configuration
- User lifecycle management (invite, activate, deactivate, delete)
- Session management with device tracking
- Password policy enforcement and reset flows

---

## Screen Inventory

| # | Screen Name | Route | Type | Status | Enhancement Priority | Design File |
|---|---|---|---|---|---|---|
| 1 | Login | `/login` | Auth / Form | Built | **P0** — First impression, conversion critical | `01-login.md` |
| 2 | Register | `/register` | Auth / Form | Built | **P0** — Conversion funnel entry point | `02-register.md` |
| 3 | Forgot Password | `/forgot-password` | Auth / Form | Built | **P1** — Support reduction opportunity | `03-forgot-password.md` |
| 4 | Reset Password | `/reset-password` | Auth / Form | Built | **P1** — Security & completion rate | `04-reset-password.md` |
| 5 | MFA Setup | `/mfa` | Auth / Form | Built (partial) | **P0** — Security critical, incomplete features | `05-mfa-setup.md` |
| 6 | Profile Settings | `/profile` | Form | Built | **P0** — Daily user touchpoint | `06-profile-settings.md` |
| 7 | Users List | `/admin/users` | List / Table | Built | P1 | `07-users-list.md` |
| 8 | User Detail / Edit | `/admin/users/:id` | Form / Detail | Built | P1 | `08-user-detail.md` |
| 9 | Roles List | `/admin/roles` | List / Table | Built | P2 | `09-roles-list.md` |
| 10 | Role Detail / Edit | `/admin/roles/:id` | Form / Detail | Built | P2 | `10-role-detail.md` |
| 11 | Tenant Settings | `/admin/settings` | Form / Settings | Built | P1 | `11-tenant-settings.md` |
| 12 | Audit Log | `/admin/audit` | List / Table | Built | P2 | `12-audit-log.md` |

---

## Existing Components

These components are already built and available in the codebase:

| Component | Location | Current State |
|---|---|---|
| `login-form` | `src/components/auth/login-form.tsx` | Functional, needs visual polish |
| `register-form` | `src/components/auth/register-form.tsx` | Functional, single-step |
| `forgot-password-form` | `src/components/auth/forgot-password-form.tsx` | Functional, minimal |
| `reset-password-form` | `src/components/auth/reset-password-form.tsx` | Functional, basic validation |
| `mfa-input` | `src/components/auth/mfa-input.tsx` | Functional, 6-digit code input |
| `mfa-setup-dialog` | `src/components/auth/mfa-setup-dialog.tsx` | Partial, TOTP only |
| `users-table` | `src/components/admin/users-table.tsx` | Functional with pagination |
| `user-form` | `src/components/admin/user-form.tsx` | Functional CRUD form |
| `roles-table` | `src/components/admin/roles-table.tsx` | Functional with pagination |
| `role-form` | `src/components/admin/role-form.tsx` | Functional with permission matrix |
| `tenant-settings-form` | `src/components/admin/tenant-settings-form.tsx` | Functional |
| `audit-log-table` | `src/components/admin/audit-log-table.tsx` | Functional with filters |

---

## Wave 1 Enhancement Themes

### Theme 1: Brand & First Impression (Login, Register)
- Tenant-branded login pages with company logos
- Logistics-themed illustrations and imagery
- Social login and SSO integration placeholders
- Conversion-optimized registration flow

### Theme 2: Security Hardening (MFA, Password Flows)
- Complete MFA setup wizard (TOTP + SMS + Email)
- Backup code generation and management
- Device trust / "Remember this device"
- Password strength visualization
- Security audit and session management

### Theme 3: User Self-Service (Profile, Settings)
- Granular notification preferences
- Connected accounts management
- Activity log and session overview
- GDPR compliance features (data export, account deletion)
- Personalization (theme, language, date format)

### Theme 4: Admin Efficiency (Users, Roles, Audit)
- Bulk user operations
- Role cloning and templates
- Advanced audit log filtering and export
- User activity dashboards

---

## Design Files in This Folder

This folder contains 7 design files covering the 6 highest-priority screens plus this overview:

| File | Screen | Priority |
|---|---|---|
| `00-service-overview.md` | Service overview (this file) | — |
| `01-login.md` | Login page | P0 |
| `02-register.md` | Registration page | P0 |
| `03-forgot-password.md` | Forgot password page | P1 |
| `04-reset-password.md` | Reset password page | P1 |
| `05-mfa-setup.md` | MFA setup page | P0 |
| `06-profile-settings.md` | Profile settings page | P0 |

Screens 7-12 (Users List, User Detail, Roles List, Role Detail, Tenant Settings, Audit Log) will be documented in a subsequent batch.

---

## Authentication Flow Diagram

```
                    +------------------+
                    |   Landing Page   |
                    +--------+---------+
                             |
              +--------------+--------------+
              |                             |
     +--------v--------+         +---------v--------+
     |     /login       |         |    /register      |
     |  Email/Password  |         |  Multi-step Form  |
     +--------+---------+         +---------+---------+
              |                             |
              |  credentials valid          |  account created
              |                             |
     +--------v---------+                   |
     |  MFA Required?    |<-----------------+
     +--------+---------+
              |
     +--------v---------+
     |     /mfa          |
     |  Enter TOTP/SMS   |
     |  code             |
     +--------+---------+
              |
              |  MFA verified
              |
     +--------v---------+
     |  JWT Issued        |
     |  Refresh Token Set |
     |  Redirect to       |
     |  Dashboard         |
     +--------------------+

     +------------------+        +-------------------+
     | /forgot-password  |------->| /reset-password    |
     | Enter email       |  link  | New password       |
     +------------------+  sent  | Confirm password   |
                                 +--------+----------+
                                          |
                                 Redirect to /login
                                 with success message
```

---

## Role Definitions (7 Default Roles)

| Role | Description | Key Permissions |
|---|---|---|
| **Super Admin** | Platform-level administrator | All permissions, tenant management, system config |
| **Tenant Admin** | Organization administrator | User management, role management, org settings |
| **Dispatcher** | Operations team member | Load management, carrier assignment, tracking |
| **Broker** | Freight broker | Order management, rate negotiation, customer relations |
| **Carrier Manager** | Carrier operations | Carrier profiles, compliance, capacity management |
| **Finance** | Accounting team | Invoicing, payments, financial reports, rate visibility |
| **Read-Only** | View-only access | Read access to assigned modules, no create/edit/delete |

---

## Cross-Cutting Concerns

### Token Management
- Access tokens: 15-minute expiry, stored in memory
- Refresh tokens: 7-day expiry, stored in httpOnly cookie
- Automatic silent refresh before access token expires
- Refresh token rotation on every use (old token invalidated)

### Security Headers
- CSRF protection via double-submit cookie pattern
- Rate limiting on auth endpoints (5 attempts per minute for login)
- Account lockout after 10 failed attempts (30-minute cooldown)
- Secure password requirements (min 8 chars, mixed case, number, special char)

### Tenant Isolation
- All API requests include tenant context via JWT claims
- Row-level security enforced at database level
- Tenant-specific branding (logo, colors) loaded at login
- Subdomain or path-based tenant routing

---

*This document was created as part of the Wave 1 Enhancement Focus design process for Ultra TMS Auth & Admin service.*
