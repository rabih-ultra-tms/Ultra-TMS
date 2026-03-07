# Sprint 05 — Security Hardening

> **Duration:** 2 weeks
> **Goal:** Fix all security vulnerabilities, harden auth, add audit logging
> **Depends on:** Sprint 01-04 (all CRUD must exist before hardening)

---

## Sprint Capacity

| Agent | Available Days | Focus Hours/Day | Total Hours |
|-------|---------------|----------------|-------------|
| Claude Code | 10 | 3h | 30h |
| Gemini/Codex | 10 | 1.5h | 15h |
| **Total** | | | **45h** |

**Committed:** 36h

---

## Sprint Goal

> "No tokens in localStorage. No JWT in console logs. CSRF protection enabled. Rate limiting on auth endpoints. Audit log captures all data mutations. RBAC enforced on every endpoint."

---

## Committed Tasks

| ID | Title | Effort | Priority | Assigned | Status |
|----|-------|--------|----------|----------|--------|
| SEC-001 | Migrate localStorage to HttpOnly Cookies | L (6h) | P0 | Claude Code | planned |
| SEC-002 | Remove Console JWT Logs | S (1h) | P0 | Codex | planned |
| SEC-003 | CSRF Token Implementation | M (4h) | P0 | Claude Code | planned |
| SEC-004 | Rate Limiting on Auth Endpoints | M (3h) | P0 | Claude Code | planned |
| SEC-005 | RBAC Audit (verify all endpoints) | L (6h) | P0 | Claude Code | planned |
| SEC-006 | Audit Log Integration | L (6h) | P1 | Claude Code | planned |
| SEC-007 | Input Sanitization Review | M (3h) | P1 | Codex | planned |
| SEC-008 | Password Policy Enforcement | S (2h) | P1 | Codex | planned |
| SEC-009 | Session Management Hardening | M (3h) | P1 | Claude Code | planned |
| SEC-010 | Security Headers (Helmet config) | S (2h) | P2 | Codex | planned |
| **Total** | | **36h** | | | |

---

## Acceptance Criteria

- [ ] Tokens stored in HttpOnly, Secure, SameSite=Strict cookies
- [ ] Zero JWT tokens logged to console
- [ ] CSRF token on all state-changing requests
- [ ] Auth endpoints rate-limited (5 failed attempts = 15 min lockout)
- [ ] Every API endpoint has `@UseGuards(JwtAuthGuard, RolesGuard)` (except /health)
- [ ] AuditLog entries created for CREATE, UPDATE, DELETE operations
- [ ] All user inputs sanitized (XSS prevention)
- [ ] Password: min 8 chars, uppercase, number, special char
- [ ] Refresh token rotation on use
- [ ] Security headers: HSTS, X-Frame-Options, CSP

---

## Known Issues to Fix

| Bug | File | Status |
|-----|------|--------|
| localStorage tokens | `apps/web/lib/api/client.ts:59,77` | P0-001 (open) |
| JWT console.log x10 | `apps/web/app/(dashboard)/admin/layout.tsx` | Open |
| Missing auth guards | Various endpoints | Audit needed |

---

## Risk

| Risk | Mitigation |
|------|-----------|
| Cookie migration breaks existing auth flow | Feature flag for cookie mode, keep localStorage fallback temporarily |
| CSRF breaks SPA pattern | Use double-submit cookie pattern |
