# Technical Debt Registry — Ultra TMS

> Last updated: 2026-03-07
> Consolidated from: codebase scans, Sonnet audit, Claude review v1, Mar 6 security audit

---

## Debt Summary

| Category | Count | Effort to Resolve | Priority |
|----------|-------|------------------|----------|
| TODO/FIXME comments | 339 | L (triage) + XL (implement) | P2 |
| `.bak` directories | 5 | S (30 min delete) | P3 |
| Stub pages (0/10 quality) | ~12 routes | XL (build screens) | P0 |
| Missing backend endpoints | 4 real gaps | M-L (build endpoints) | P0-P1 |
| WebSocket infrastructure | Missing entirely | XL (QS-001) | P0 |
| Missing soft delete | 5 entities | S-M (QS-002) | P1 |
| Hardcoded values | ~20 instances | S | P2 |
| Missing tests | ~90% of code | XL (ongoing) | P1 |
| Dead code | Various | M | P3 |

---

## Category 1: TODO/FIXME Comments (339 total)

**Task:** QS-010 — Triage all TODOs
**Status:** OPEN

Distribution (estimated from audit scan):

| Module / Area | Estimated TODOs | Common Patterns |
|---------------|----------------|-----------------|
| Backend modules (`apps/api/src/modules/`) | ~150 | Unimplemented business logic, stub returns, missing validation |
| Frontend hooks (`apps/web/lib/hooks/`) | ~60 | API calls not wired, mock data returns, no error handling |
| Frontend pages (`apps/web/app/`) | ~80 | Incomplete form handlers, missing state management |
| Backend services | ~30 | CSA scores, WebSocket events, notification triggers |
| Test files | ~19 | Skipped test cases, TODO: add more tests |

**Common TODO categories:**
- `// TODO: implement WebSocket events` — appears in loads, orders, dispatch
- `// TODO: add soft delete` — in orders, quotes, invoices
- `// TODO: connect to real API` — in dashboard, profile, analytics hooks
- `// TODO: add pagination` — in various list endpoints
- `// TODO: add validation` — in some DTOs that have empty bodies
- `// FIXME: CSA scores stub` — in carrier performance endpoint

**Triage process for QS-010:**
1. Grep all TODOs: `grep -r "TODO\|FIXME" apps/ --include="*.ts" --include="*.tsx"`
2. Categorize into: (a) implement now, (b) add to backlog, (c) delete (obsolete)
3. For each "implement now": create a bug task in backlog
4. For each "add to backlog": add to `dev_docs_v3/03-tasks/backlog/_index.md`
5. Delete all obsolete/stale TODOs

---

## Category 2: .bak Directories (5 directories)

**Task:** QS-009
**Status:** OPEN — delete after confirming no unique code

| Directory | Location | Contents | Action |
|-----------|----------|----------|--------|
| `analytics.bak` | `apps/api/src/modules/analytics.bak/` | Old analytics module | Verify new `analytics/` supersedes, then delete |
| `workflow.bak` | `apps/api/src/modules/workflow.bak/` | Old workflow module | Verify new `workflow/` supersedes, then delete |
| `integration-hub.bak` | `apps/api/src/modules/integration-hub.bak/` | Old integration hub | Verify new `integration-hub/` supersedes, then delete |
| `documents.bak` | `apps/api/src/modules/documents.bak/` | Old documents module | Verify new `documents/` supersedes, then delete |
| `carrier.bak` | `apps/api/src/modules/carrier.bak/` | Old carrier module | Verify new `carriers/` supersedes, then delete |

**QS-009 Process:**
1. For each `.bak` dir: `diff -r {module}.bak/ {module}/` to find unique code
2. If unique code exists: extract to the active module
3. Delete the `.bak` directory
4. Update backend-module-map.md

---

## Category 3: Stub Pages (Missing Frontend Screens)

Pages that exist as files but have no real content:

| Route | File | Stub Quality | Gap |
|-------|------|--------------|-----|
| `/profile` | `app/(dashboard)/profile/page.tsx` | 0/10 | No data, no form, no API calls |
| `/accounting/dashboard` | Not built | N/A | Entire directory may not exist |
| `/accounting/invoices` | Not built or stub | 0-2/10 | Backend APIs exist |
| `/accounting/settlements` | Not built or stub | 0-2/10 | Backend APIs exist |
| `/accounting/payments` | Not built or stub | 0-2/10 | Backend APIs exist |
| `/commission/dashboard` | Not built or stub | 0-2/10 | Backend APIs partial |
| `/load-board` | Not built | N/A | Backend stubs |
| `/operations/dashboard` | Needs verification | ?/10 | May be stub |
| `/operations/orders` | Needs verification | ?/10 | May be stub |
| `/operations/loads` | Needs verification | ?/10 | May be stub |
| `/operations/dispatch` | Needs verification | ?/10 | Needs WebSocket |
| `/operations/tracking` | Needs verification | ?/10 | Needs WebSocket |

**Resolution:** QS-008 (Runtime Verification) determines actual status. Build task created per screen.

---

## Category 4: Missing Backend Endpoints

| Endpoint | Service | Priority | Task |
|----------|---------|----------|------|
| `GET /accounting/dashboard` | Accounting | P0 | QS-003 |
| `GET /accounting/reports/aging` | Accounting | P1 | Backlog |
| `GET /carriers/csa/:carrierId` (real) | Carriers | P1 | QS-004 |
| `WS /dispatch` namespace | TMS Core | P0 | QS-001 |
| `WS /tracking` namespace | TMS Core | P1 | QS-001 |
| `WS /notifications` namespace | All | P1 | QS-001 |

---

## Category 5: Missing Soft Delete

5 entities lack soft delete (deletedAt field) — can be permanently deleted:

| Entity | Prisma Model | Impact | Task |
|--------|-------------|--------|------|
| Order | `Order` | Orders permanently deleted — audit trail broken | QS-002 |
| Quote | `Quote` | Quotes permanently deleted | QS-002 |
| Invoice | `Invoice` | Invoices permanently deleted — legal/compliance risk | QS-002 |
| Settlement | `Settlement` | Settlements permanently deleted | QS-002 |
| Payment | `Payment` | Payments permanently deleted — financial audit risk | QS-002 |

**Fix:** Prisma migration + service updates for each entity.

---

## Category 6: Hardcoded Values (Not Using Design Tokens)

| Location | Issue | Token to Use |
|----------|-------|-------------|
| Various component files | Hex colors (`#1e293b`, `#3b82f6`) | `var(--color-primary)`, CSS tokens |
| Some page files | Hardcoded font sizes | Tailwind classes from design system |
| Carrier status badges | Custom color strings | StatusBadge component from tms/ |
| Some form elements | Direct Tailwind classes | Use form component from tms/shared |

**Resolution:** Ongoing — enforce in code review. Use ESLint rule to ban hex colors.

---

## Category 7: Missing Tests

**Current state:** 72 tests, 13 suites, ~8.7% coverage

| Area | Tests Exist | Coverage | Gap |
|------|-------------|----------|-----|
| Carrier module | 45 tests | ~70% | Integration tests missing |
| Auth module | ~10 tests | ~30% | JWT flow, MFA not tested |
| CRM module | ~10 tests | ~20% | CRUD tests only |
| TMS Core | ~7 tests | ~5% | Almost nothing |
| Accounting | 0 tests | 0% | Entire module untested |
| Commission | 0 tests | 0% | Entire module untested |
| Frontend components | 0 tests | 0% | No component tests |
| E2E tests | 0 tests | 0% | Playwright configured but empty |

**Target:** B- grade requires ≥40% coverage on P0 modules, ≥1 E2E test per critical flow.

---

## Category 8: Dead Code

| Item | Location | Action |
|------|----------|--------|
| Old debug console.logs | Various (post-cleanup still has some) | Remove in each PR |
| Commented-out code blocks | Various | Delete — it's in git history |
| Unused imports | Various | ESLint catches most |
| `any` type usage | Various | Replace with proper types |
| Barrel files with dead exports | `lib/hooks/index.ts` | Prune unused exports |

---

## Debt Paydown Plan

| Phase | Debt Items | Effort | Sprint |
|-------|-----------|--------|--------|
| Quality Sprint | WebSocket (QS-001), Soft Delete (QS-002), Accounting Endpoint (QS-003), CSA Endpoint (QS-004), Profile (QS-005), CORS (QS-007), BAK dirs (QS-009), TODO triage (QS-010) | ~50h | Current |
| Post-Quality Sprint | Accounting screens, Commission screens, TMS Core verification | ~80h | Next |
| Ongoing | Test coverage, hardcoded values, dead code cleanup | Continuous | Every PR |
| Pre-launch | Rate limiting, CSP headers, CI/CD, observability | ~30h | Pre-launch |
