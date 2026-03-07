# QS-008: Runtime Verification

**Priority:** P0
**Effort:** L (4-8 hours)
**Status:** planned
**Assigned:** Claude Code

---

## Context Header (Read These First)

1. `dev_docs_v3/02-screens/_index.md` — All 98 routes with current status
2. `dev_docs_v3/02-screens/verification-checklist.md` — Click-through test plan
3. `dev_docs_v3/05-audit/sonnet-audit-tracker.md` — What was supposedly fixed

---

## Objective

Click every route in the application using Playwright. Document which routes render correctly, which are stubs, and which crash. Update `02-screens/_index.md` with verified status. This task determines what actually needs to be built vs. what just needs to be wired up.

---

## Pre-Verification Setup

```bash
# Start full stack
docker-compose up -d        # PostgreSQL, Redis, ES
pnpm dev                    # web:3000 + api:3001

# Seed database with test data (required for routes to show non-empty states)
pnpm --filter api prisma:seed

# Create test user if not seeded
# User: admin@test.com / Password: Test1234!
```

---

## Verification Protocol (Per Route)

For EACH of the 98 routes:

1. `browser_navigate` to the route
2. `browser_snapshot` — check accessibility tree for content
3. `browser_take_screenshot` — visual record
4. Evaluate: does it render? (not blank, not crash page, not 404)
5. Check: are interactive elements clickable? (buttons, forms, links)
6. Record result:
   - **PASS** — renders with real data, interactive elements work
   - **STUB** — renders but shows placeholder/hardcoded data
   - **BROKEN** — renders but has visible errors or non-working elements
   - **CRASH** — blank page or error boundary
   - **404** — page not found

---

## Route Groups to Verify (in priority order)

### Group 1: Auth (7 routes) — Expected: mostly PASS
```
/login, /register, /forgot-password, /reset-password, /verify-email, /mfa, /mfa/setup
```

### Group 2: Core Navigation (4 routes)
```
/dashboard, /profile, /settings, /notifications
```

### Group 3: CRM (8 routes) — Expected: mostly PASS (with some bugs)
```
/crm/companies, /crm/companies/create, /crm/companies/[id],
/crm/contacts, /crm/contacts/create, /crm/contacts/[id],
/crm/opportunities, /crm/activities
```

### Group 4: Admin (9 routes) — Expected: mostly PASS
```
/admin/users, /admin/users/create, /admin/users/[id],
/admin/roles, /admin/roles/create,
/admin/permissions, /admin/tenants, /admin/audit-logs, /admin/reports
```

### Group 5: Sales (5 routes) — Expected: mostly PASS (Load Planner PROTECTED)
```
/sales/quotes, /sales/quotes/create, /sales/quotes/[id],
/load-planner (overview), /load-planner/[id]/edit
```

### Group 6: Carriers (7 routes) — Expected: MIXED (known 404 bugs)
```
/carriers, /carriers/create, /carriers/[id],  ← [id] is 404
/carriers/[id]/edit, /carriers/[id]/load-history,
/carriers/[id]/load-history/[loadId],  ← 404
/truck-types
```

### Group 7: TMS Core (12 routes) — UNKNOWN (discovered page.tsx exists)
```
/operations/dashboard, /operations/orders, /operations/orders/create,
/operations/orders/[id], /operations/loads, /operations/loads/create,
/operations/loads/[id], /operations/dispatch, /operations/tracking,
/operations/check-calls, /operations/stops, /operations/rate-confirmations
```

### Group 8: Accounting (9 routes) — Expected: CRASH/404 (not built)
```
/accounting/dashboard, /accounting/invoices, /accounting/invoices/create,
/accounting/invoices/[id], /accounting/settlements, /accounting/settlements/[id],
/accounting/payments, /accounting/reports, /accounting/reports/aging
```

### Group 9: Commission (8 routes) — Expected: CRASH/404 (not built)
```
/commissions/dashboard, /commissions/plans, /commissions/plans/create,
/commissions/transactions, /commissions/payouts, /commissions/reps,
/commissions/reps/[id], /commissions/settings
```

### Group 10: Load Board (4 routes) — Expected: STUB
```
/load-board, /load-board/post, /load-board/offers, /load-board/settings
```

---

## File Plan

| File | Change |
|------|--------|
| `dev_docs_v3/02-screens/_index.md` | Update Status column with verified result (PASS/STUB/BROKEN/CRASH/404) |
| `dev_docs_v3/02-screens/verification-results.md` | New file — Playwright screenshots + notes per route |

---

## Acceptance Criteria

1. All 98 routes have been navigated in Playwright
2. Each route has a result: PASS, STUB, BROKEN, CRASH, or 404
3. `dev_docs_v3/02-screens/_index.md` Status column updated
4. At least 1 screenshot taken per CRASH or 404 route
5. Summary table shows: X/98 PASS, X/98 STUB, X/98 BROKEN, X/98 CRASH, X/98 404
6. All CRASH and 404 routes have a bug task created in backlog

---

## Dependencies

- **Blocks:** Accurate task planning for post-sprint (we need real status to plan correctly)
- **Blocked by:** pnpm dev must be running (depends on Docker infra)
- **Run this task** after QS-007 (CORS) to avoid API call failures

---

## Expected Summary

Based on current knowledge:
- Auth routes: ~6/7 PASS (register may be stub)
- CRM routes: ~6/8 PASS (missing delete/convert)
- Admin routes: ~8/9 PASS
- Sales routes: ~3/5 PASS (Load Planner PASS, quote list PASS)
- Carrier routes: ~5/7 PASS (detail + load-history/detail are 404)
- TMS Core routes: UNKNOWN — may be 0-12 PASS depending on stub status
- Accounting routes: ~0/9 PASS (not built)
- Commission routes: ~0/8 PASS (not built)
- Load Board routes: ~1/4 STUB

**Conservative estimate:** 30-40/98 routes are PASS. The 57 bug fixes may have improved this but were never runtime-verified.
