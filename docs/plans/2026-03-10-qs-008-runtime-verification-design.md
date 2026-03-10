# QS-008: Runtime Verification Design

**Date:** 2026-03-10
**Priority:** P0
**Effort:** L (4-8 hours)

## Objective

Navigate all 103 frontend routes using Playwright to classify each as PASS/STUB/BROKEN/CRASH/404. This determines actual scope for post-sprint work.

## Approach: Hybrid (Automated + Manual)

### Phase 1: Automated Playwright Script

A single test file `e2e/qs-008-runtime-verification.spec.ts` that:

1. **Logs in** — POST to `/api/v1/auth/login` with seed credentials, stores auth cookie
2. **Visits all 103 routes** in sequence, grouped by section
3. **For each route**, checks:
   - HTTP status (no 500s)
   - No uncaught JS errors (`page.on('pageerror')`)
   - Page renders content (not blank white screen)
   - No Next.js error overlay present
4. **Classifies each route** as:
   - **PASS** — Renders without errors
   - **STUB** — Renders but has placeholder/empty content
   - **BROKEN** — Renders with JS errors or broken UI
   - **CRASH** — Next.js error overlay or React error boundary
   - **404** — Next.js 404 page shown
5. **Takes screenshot** of every CRASH/404/BROKEN route
6. **Outputs** JSON report + summary table

### Phase 2: MCP Manual Inspection

After script runs, manually inspect each CRASH/404/BROKEN route via Playwright MCP to diagnose root cause.

### Route Groups

| Group | Routes | Auth Required |
|-------|--------|---------------|
| Auth | 7 | No |
| Dashboard | 1 | Yes |
| Admin | 13 | Yes (ADMIN role) |
| Profile | 2 | Yes |
| CRM (Companies, Customers, Contacts, Leads) | 22 | Yes |
| Activities | 1 | Yes |
| Sales (Quotes, Load Planner) | 7 | Yes |
| TMS Core (Operations, Orders, Loads, Dispatch, Tracking) | 12 | Yes |
| Carriers (Carriers, Load History, Truck Types) | 7 | Yes |
| Accounting | 10 | Yes |
| Commission | 11 | Yes |
| Load Board | 4 | Yes |
| Super Admin | 1 | Yes (SUPER_ADMIN) |
| Portal | 5 | Separate auth |
| Public | 2 | No |

### Dynamic Routes

Routes with `[id]` parameters use a dummy UUID (`00000000-0000-0000-0000-000000000000`). Expected behavior is either a "not found" message (PASS) or a crash (BROKEN/CRASH).

## Outputs

- `e2e/qs-008-runtime-verification.spec.ts` — reusable Playwright script
- `e2e/reports/qs-008-results.json` — machine-readable results
- `e2e/reports/qs-008-screenshots/` — failure screenshots
- Updated `dev_docs_v3/02-screens/_index.md` status column
- Bug tasks created for CRASH/404 routes

## Out of Scope

- Portal routes (separate auth flow — can add later)
- Functional behavior (form submissions, CRUD operations)
- API correctness (just that pages render)
