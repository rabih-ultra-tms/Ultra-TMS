# Auth & Admin Module Audit

**Grade:** C+ (6.5/10)
**Date:** February 8, 2026

---

## Summary

17 of 23 pages are production-ready. 3 critical security issues. 8 non-functional stubs (audit logs filters, settings forms, tenant detail). Dashboard is hardcoded to zeros.

---

## Page-by-Page Assessment

### Production-Ready (17 pages)

| Page | Path | Quality | Notes |
|------|------|---------|-------|
| Login | `(auth)/login` | 8/10 | Working, calls real API |
| MFA Setup | `(auth)/mfa` | 7/10 | QR code + 6-digit input works |
| Users List | `admin/users` | 8/10 | Pagination, filters, status badges |
| User Detail | `admin/users/[id]` | 7/10 | Detail card, roles section |
| User Create | `admin/users/new` | 8/10 | Form validation, role assignment |
| User Edit | `admin/users/[id]/edit` | 8/10 | Pre-populated form |
| Roles List | `admin/roles` | 7/10 | Table with permission counts |
| Role Detail | `admin/roles/[id]` | 7/10 | Permissions editor matrix |
| Role Create | `admin/roles/new` | 7/10 | Form + permission selection |
| Permissions | `admin/permissions` | 7/10 | Matrix grid, grouped by module |
| Tenants List | `admin/tenants` | 7/10 | Multi-tenant table |
| Tenant Create | `admin/tenants/new` | 6/10 | Basic form |
| Audit Logs | `admin/audit-logs` | 6/10 | Table shows entries, filters stub |
| Profile | `profile` | 5/10 | Display works, edit stub |
| Admin Layout | `admin/layout.tsx` | 5/10 | Works but has security issues |
| Dashboard Shell | `(dashboard)/layout.tsx` | 7/10 | Sidebar + header + content |
| Admin Guard | component | 7/10 | Role-based access works |

### Non-Functional Stubs (6 pages)

| Page | Path | Issue |
|------|------|-------|
| Register | `(auth)/register` | Placeholder form, no submit handler |
| Forgot Password | `(auth)/forgot-password` | Placeholder, no API call |
| Reset Password | `(auth)/reset-password` | Placeholder, no token handling |
| General Settings | `admin/settings/general` | No form handler, just inputs |
| Security Settings | `admin/settings/security` | No form handler |
| Notification Settings | `admin/settings/notifications` | No form handler |

---

## Critical Issues

### SEC-001: JWT Tokens Logged to Console
- **File:** `admin/layout.tsx`
- **Severity:** P0 Security
- **Detail:** Console.log statements log JWT tokens in 10 places
- **Fix:** Remove all console.log of tokens/auth data

### SEC-002: User Roles Exposed in Sidebar
- **File:** `layout/app-sidebar.tsx:28`
- **Severity:** P1 Security
- **Detail:** `console.log('[Sidebar] User roles:', normalized)` exposes roles
- **Fix:** Remove console.log

### SEC-003: localStorage Token Storage
- **File:** `lib/api/client.ts:59,77,117,126,139`
- **Severity:** P1 Security
- **Detail:** Fallback token storage in localStorage (XSS vulnerable)
- **Fix:** Use httpOnly cookies only, remove localStorage fallback

### UX-001: Dashboard Hardcoded to Zeros
- **File:** Dashboard page
- **Severity:** P1 UX
- **Detail:** KPI cards show 0 for everything, not connected to real data
- **Fix:** Wire to API endpoints for order/load/carrier counts

### UX-002: No Redirect After Password Reset
- **Severity:** P2 UX
- **Detail:** After successful password reset, user stays on page
- **Fix:** Redirect to login with success message

---

## Recommendations

1. **Week 1:** Fix SEC-001, SEC-002, SEC-003 (security issues)
2. **Week 1:** Wire dashboard to real API data
3. **Phase 1:** Implement register/forgot-password/reset-password flows
4. **Phase 2:** Build settings forms (general, security, notifications)
