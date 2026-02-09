# BUG-005: Security — localStorage Token Storage

> **Phase:** 0 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** M (2-3h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/04-audit/auth-admin.md` — SEC-003
3. `apps/web/lib/api/client.ts` — lines 59, 77, 117, 126, 139

## Objective

Remove the localStorage fallback for storing JWT tokens. The app already uses httpOnly cookies (which are secure). The localStorage fallback at lines 59, 77, 117, 126, 139 in `client.ts` is vulnerable to XSS attacks. Ensure the cookie-based auth flow works without localStorage.

## File Plan

| Action | Path | What |
|--------|------|------|
| MODIFY | `apps/web/lib/api/client.ts` | Remove localStorage.getItem/setItem for tokens at 5 locations |
| MODIFY | `apps/web/lib/hooks/use-auth.ts` | Ensure logout clears cookies, not just localStorage |

## Acceptance Criteria

- [ ] No JWT tokens stored in localStorage
- [ ] Auth flow works with httpOnly cookies only
- [ ] Login, logout, token refresh all still work
- [ ] 401 responses trigger proper re-authentication
- [ ] TypeScript compiles, lint passes

## Dependencies

- Blocked by: None
- Blocks: None

## Reference

- Audit: `dev_docs_v2/04-audit/auth-admin.md` → SEC-003
