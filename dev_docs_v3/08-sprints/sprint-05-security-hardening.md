# Sprint 05 — Security Hardening

> **Duration:** 2 weeks
> **Goal:** Fix all security vulnerabilities, harden auth, add audit logging
> **Depends on:** Sprint 01-04 (all CRUD must exist before hardening)

---

## Sprint Capacity

| Agent        | Available Days | Focus Hours/Day | Total Hours |
| ------------ | -------------- | --------------- | ----------- |
| Claude Code  | 10             | 3h              | 30h         |
| Gemini/Codex | 10             | 1.5h            | 15h         |
| **Total**    |                |                 | **45h**     |

**Committed:** 36h

---

## Sprint Goal

> "No tokens in localStorage. No JWT in console logs. CSRF protection enabled. Rate limiting on auth endpoints. Audit log captures all data mutations. RBAC enforced on every endpoint."

---

## Committed Tasks

| ID        | Title                                    | Effort  | Priority | Assigned    | Status |
| --------- | ---------------------------------------- | ------- | -------- | ----------- | ------ |
| SEC-001   | Migrate localStorage to HttpOnly Cookies | L (6h)  | P0       | Claude Code | done   |
| SEC-002   | Remove Console JWT Logs                  | S (1h)  | P0       | Codex       | done   |
| SEC-003   | CSRF Token Implementation                | M (4h)  | P0       | Claude Code | done   |
| SEC-004   | Rate Limiting on Auth Endpoints          | M (3h)  | P0       | Claude Code | done   |
| SEC-005   | RBAC Audit (verify all endpoints)        | L (6h)  | P0       | Claude Code | done   |
| SEC-006   | Audit Log Integration                    | L (6h)  | P1       | Claude Code | done   |
| SEC-007   | Input Sanitization Review                | M (3h)  | P1       | Codex       | done   |
| SEC-008   | Password Policy Enforcement              | S (2h)  | P1       | Codex       | done   |
| SEC-009   | Session Management Hardening             | M (3h)  | P1       | Claude Code | done   |
| SEC-010   | Security Headers (Helmet config)         | S (2h)  | P2       | Codex       | done   |
| **Total** |                                          | **36h** |          |             |        |

---

## Acceptance Criteria

- [x] Tokens stored in HttpOnly, Secure, SameSite=Lax cookies (backend Set-Cookie)
- [x] Zero JWT tokens logged to console
- [x] CSRF token on all state-changing requests (double-submit cookie pattern)
- [x] Auth endpoints rate-limited (5 failed attempts = 15 min lockout)
- [x] Every API endpoint has `@UseGuards(JwtAuthGuard, RolesGuard)` (except /health)
- [x] AuditLog entries created for CREATE, UPDATE, DELETE operations
- [x] All user inputs sanitized (XSS prevention) — Global SanitizeInputInterceptor strips HTML tags + trims whitespace
- [x] Password: min 8 chars, uppercase, number, special char
- [x] Refresh token rotation on use
- [x] Security headers: HSTS, X-Frame-Options, CSP, Permissions-Policy (Next.js + Helmet)

---

## Known Issues to Fix

| Bug                                           | File                                        | Status                                                                 |
| --------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------- |
| localStorage tokens                           | `apps/web/lib/api/client.ts`                | Fixed — HttpOnly cookies via backend Set-Cookie                        |
| JWT console.log x10                           | `apps/web/app/(dashboard)/admin/layout.tsx` | Fixed (no console.log found)                                           |
| Missing auth guards                           | Various endpoints                           | Fixed — global APP_GUARD covers all 187 controllers                    |
| Cross-tenant mutations (no tenantId in WHERE) | Auth, Accounting, Contracts, Operations     | Fixed — 26 mutations now use `updateMany({ where: { id, tenantId } })` |
| TOCTOU in carrier/driver lookup               | `operations/carriers/carriers.service.ts`   | Fixed — `findUnique` → `findFirst` with tenantId                       |

---

## Risk

| Risk                                       | Mitigation                                                           |
| ------------------------------------------ | -------------------------------------------------------------------- |
| Cookie migration breaks existing auth flow | Feature flag for cookie mode, keep localStorage fallback temporarily |
| CSRF breaks SPA pattern                    | Use double-submit cookie pattern                                     |
