# BUG-004: Security — JWT Tokens and Roles Logged to Console

> **Phase:** 0 | **Priority:** P0 | **Status:** NOT STARTED
> **Effort:** S (1h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/04-audit/auth-admin.md` — SEC-001, SEC-002

## Objective

Remove all console.log statements that expose JWT tokens, user roles, or other sensitive authentication data. These are security vulnerabilities — anyone opening browser DevTools can see tokens and roles.

## File Plan

| Action | Path | What |
|--------|------|------|
| MODIFY | `apps/web/app/(dashboard)/admin/layout.tsx` | Remove 10 console.log statements that log JWT tokens |
| MODIFY | `apps/web/components/layout/app-sidebar.tsx` | Remove console.log at line 28 that logs user roles |
| MODIFY | `apps/web/components/crm/leads/leads-pipeline.tsx` | Replace console.error at lines 44, 50 with toast.error |

## Acceptance Criteria

- [ ] No JWT tokens logged to browser console
- [ ] No user roles logged to browser console
- [ ] All user-facing errors use toast.error instead of console.error
- [ ] App still functions correctly after removal
- [ ] TypeScript compiles, lint passes

## Dependencies

- Blocked by: None
- Blocks: None

## Reference

- Audit: `dev_docs_v2/04-audit/auth-admin.md` → SEC-001, SEC-002
- Audit: `dev_docs_v2/04-audit/crm.md` → console.error issues
