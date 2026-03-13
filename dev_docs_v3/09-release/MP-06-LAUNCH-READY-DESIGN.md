# MP-06: Launch Ready Sprint — 1-Week Blitz Design

**Version:** 1.0
**Date:** 2026-03-13
**Sprint:** MP-06 (Weeks 11-12, compressed to 1 week)
**Status:** Design Approved
**Goal:** Ship Core Functionality + Performance. Zero blockers, Launch Ready.

---

## Executive Summary

MP-06 is the final polish sprint before beta launch. Given a **significant gap** in current state and an **aggressive 1-week timeline**, we execute a **Fix-First Blitz**:

1. **Day 1 (2h):** Triage. Establish performance baseline, identify blocking bugs, list critical UI failures.
2. **Days 2-5 (16h):** Fix blockers. Core Web Vitals failures, data integrity bugs, broken user flows, console errors.
3. **Days 6-7 (4h):** Minimal polish. Error boundaries, loading spinners, ConfirmDialog replacements.
4. **Day 7 (close):** Launch Readiness Gate. Verify all P0 services load without errors, performance targets met, security verified.

**Success = Ship with confidence.** Cosmetic polish deferred to P1.

---

## Phase 1: Triage & Baseline (Day 1, 2 hours)

### Objectives

- Establish performance baseline: measure FCP/LCP on 3 representative P0 pages (dashboard, carriers list, load-history)
- Identify top 10 blocking bugs (cross-tenant, soft-delete, race conditions, auth failures)
- List 3-5 critical UI failures (buttons that don't work, missing error handling, 404s)
- Create a blockers-only work queue for Days 2-5

### Execution

1. **Performance audit (30m)**
   - Run Lighthouse on: `/dashboard`, `/carriers`, `/load-history`
   - Record: FCP, LCP, CLS, TTI for each
   - Target: FCP < 1.5s, LCP < 2.5s
   - If missed, identify top 3 performance drains (bundle size, N+1 queries, slow endpoint)

2. **Bug triage (45m)**
   - Read `dev_docs_v3/05-audit/REMEDIATION-ROADMAP.md` and PST files (per-service findings)
   - Cross-reference with MP-03 Playwright test results
   - List bugs by severity: STOP-SHIP (security, data) > CRITICAL (broken flow) > HIGH (degraded UX) > LOW (polish)
   - Rank top 10 by impact to launch readiness

3. **UI failure scan (45m)**
   - Manually click through all 11 P0 services (5 min each)
   - Document: 404s, console errors, unhandled exceptions, missing error states
   - Create a "critical path" checklist: login → create load → quote → dispatch → invoice

### Outputs

- **Performance Scorecard**: Current FCP/LCP vs. 1.5s/2.5s targets
- **Blocking Bugs List**: Top 10, ranked by severity, with file paths
- **Critical UI Failures**: 3-5 items to fix first
- **Work Queue for Days 2-5**: Prioritized list of fixes

---

## Phase 2: Fix Critical Blockers (Days 2-5, 16 hours)

### Priority Stack (execute in order)

#### Priority 1: Core Web Vitals Failures (if any)

**Impact:** Users experience slow pages, Google ranking penalty
**Examples:** Dashboard aggregation N+1 queries, large bundle chunks
**Effort:** 4-6 hours
**Exit criteria:** FCP < 1.5s, LCP < 2.5s on dashboard + 2 list pages

Tasks:

- MP-06-008: Fix N+1 queries in dashboard (DashboardService aggregations)
- MP-06-009: Add compound indexes (Prisma schema tuning)
- MP-06-007: Code-split large routes (lazy load non-critical pages)

#### Priority 2: Data Integrity Bugs

**Impact:** Data corruption, cross-tenant access, data loss
**Examples:** Missing `tenantId` in WHERE, soft-delete not filtered
**Effort:** 3-4 hours
**Exit criteria:** All mutations filter by `tenantId + deletedAt: null`, no cross-tenant leaks

Tasks:

- Scan all P0 service mutations (CRM, Sales, Accounting, Carriers, TMS)
- Add `tenantId` to any mutation WHERE clause missing it
- Verify soft-delete filters on all queries
- Write 2-3 smoke tests (tenant isolation, soft-delete queries)

#### Priority 3: Broken User Flows

**Impact:** Users can't complete critical actions (login, dispatch, quote)
**Examples:** Buttons don't call API, modals don't close, redirects fail
**Effort:** 4-6 hours
**Exit criteria:** All P0 "critical path" flows complete without error

Tasks:

- Fix any 404 routes discovered in Phase 1 triage
- Replace 7x `window.confirm()` with ConfirmDialog (MP-06-004)
- Add missing API error handling (show toast, log to Sentry)
- Fix any auth/token issues on protected pages

#### Priority 4: Console Errors & Unhandled Exceptions

**Impact:** Users see red X in console, browser dev tools show warnings, crash reports spike
**Examples:** Type mismatches (React 19 strict mode), unhandled promise rejections
**Effort:** 2-3 hours
**Exit criteria:** Console clean on critical path flows

Tasks:

- Run through critical path again, watch console
- Fix React render errors (useEffect cleanup, key props)
- Add try/catch to async operations
- Handle null/undefined gracefully (optional chaining, nullish coalescing)

---

## Phase 3: Minimal Polish (Days 6-7, 4 hours)

### Only add if time permits (priority order)

1. **Error Boundaries (1h)** — MP-06-003
   - Add on all P0 page roots
   - Show: "Something went wrong. Try refreshing."

2. **Loading Spinners (1.5h)**
   - Add on critical data fetches: dashboard KPIs, list page tables, detail modals
   - Don't over-polish; simple centered spinner is fine

3. **ConfirmDialog for Deletions (0.5h)** — MP-06-004
   - Replace 7x `window.confirm()` calls
   - Use shadcn ConfirmDialog component

4. **Toast Error Messages (1h)**
   - Show error.message on failed API calls
   - Don't show raw axios errors; sanitize first

---

## Launch Readiness Gate (End of Day 7)

### Go/No-Go Checklist

| Criteria                       | Target                                       | Status          |
| ------------------------------ | -------------------------------------------- | --------------- |
| **Performance: FCP**           | < 1.5s on dashboard                          | ☐ PASS / ☐ FAIL |
| **Performance: LCP**           | < 2.5s on dashboard                          | ☐ PASS / ☐ FAIL |
| **Functionality: P0 Services** | All 11 load without 5xx errors               | ☐ PASS / ☐ FAIL |
| **Security: STOP-SHIP**        | Zero critical bugs, tenantId verified        | ☐ PASS / ☐ FAIL |
| **Security: Soft-Delete**      | All queries filter `deletedAt: null`         | ☐ PASS / ☐ FAIL |
| **UI: Error Boundaries**       | On all P0 page roots                         | ☐ PASS / ☐ FAIL |
| **UX: Critical Path**          | Login → Create Load → Quote → Dispatch works | ☐ PASS / ☐ FAIL |
| **QA: Console**                | No unhandled errors on critical path         | ☐ PASS / ☐ FAIL |
| **Data: Demo Tenant**          | Can seed and create test load                | ☐ PASS / ☐ FAIL |

**Decision Rule:**

- ✅ All PASS = **Ship**
- ❌ Any FAIL = **Delay** (identify blocker, fix, re-test)

---

## Task Selection from MP-06

### We WILL do these (8 tasks, ~22 hours)

| MP-06 ID  | Task                          | Phase | Effort | Rationale                   |
| --------- | ----------------------------- | ----- | ------ | --------------------------- |
| MP-06-008 | N+1 query fixes (dashboard)   | 2     | 3h     | Core Web Vitals blocker     |
| MP-06-009 | Add compound indexes          | 2     | 2h     | Performance enabler         |
| MP-06-010 | Bug bash from Playwright      | 2     | 8h     | Fix known blockers          |
| MP-06-011 | Core Web Vitals verification  | 3     | 2h     | Launch gate criterion       |
| MP-06-003 | Error boundaries on P0 pages  | 3     | 2h     | Critical UX safety net      |
| MP-06-004 | Replace window.confirm()      | 3     | 2h     | UX polish, high-impact      |
| Triage    | Establish baseline + blockers | 1     | 2h     | Discovery, unblock Days 2-5 |
| Testing   | Smoke tests (critical path)   | 2-3   | 1h     | Verify ship-readiness       |

**Total: 22 hours (fits in 1 week with buffer)**

### We will DEFER these (5 tasks, ~15 hours)

| MP-06 ID  | Task                         | Reason                                         |
| --------- | ---------------------------- | ---------------------------------------------- |
| MP-06-001 | Loading states on all lists  | Scope creep; only critical paths need spinners |
| MP-06-002 | Empty states on all lists    | Polish; data displays correctly is enough      |
| MP-06-006 | Mobile responsiveness audit  | Ship desktop-first; mobile in P1               |
| MP-06-007 | Code splitting for P0 routes | Nice-to-have; may not be needed for targets    |
| MP-06-012 | Beta seed data               | Can parallelize post-launch                    |
| MP-06-013 | Go/no-go checklist           | Integrated into Phase 3 gate above             |

---

## Team & Timeline

**Team:** Solo (Claude Code)
**Duration:** 7 calendar days (1-2 hours/day cadence expected, user may want async updates)
**Dependencies:**

- MP-01 (Security) — DONE ✅
- MP-03 (Playwright route scan) — DONE ✅
- Performance tooling (Lighthouse, browser DevTools)

---

## Success Criteria

**This sprint is successful if:**

1. ✅ All 11 P0 services load without 5xx errors (verified via critical path)
2. ✅ FCP < 1.5s, LCP < 2.5s on dashboard (measured via Lighthouse)
3. ✅ Zero STOP-SHIP security bugs (cross-tenant, soft-delete confirmed)
4. ✅ Console clean on critical path (no unhandled errors)
5. ✅ Can create a test load end-to-end and generate a quote
6. ✅ Error boundaries on all P0 pages
7. ✅ Demo tenant seeds and is accessible

**If any of 1-6 fail, do NOT ship. Fix and re-verify.**

---

## Known Risks & Mitigations

| Risk                          | Impact                                   | Mitigation                                                       |
| ----------------------------- | ---------------------------------------- | ---------------------------------------------------------------- |
| **Performance unknown**       | May miss Core Web Vitals targets         | Phase 1 triage measures baselines; scope fixes accordingly       |
| **Too many blockers**         | Can't finish in 1 week                   | Prioritize strictly; skip cosmetic polish; defer to P1 if needed |
| **Regression from bug fixes** | Introduce new bugs while fixing old ones | Run Playwright suite + smoke tests after each fix                |
| **UI polish looks bad**       | Users unhappy, feedback spam             | Accept: functional > pretty. We're shipping core first.          |

---

## What Happens After Day 7?

**Best case (all gates pass):**

- Launch to beta users
- Begin MP-07 (Documents + Communication)

**If gates fail:**

- Identify blocker(s)
- Fix in emergency sprint (1-2 days)
- Re-gate and ship

**Polish deferred to P1:**

- Full loading/empty state coverage
- Mobile responsiveness
- Animation polish
- Advanced performance tuning (code splitting beyond critical path)

---

## References

- **Master Project Plan:** `dev_docs_v3/08-sprints/master-project-plan.md` (MP-06 task list)
- **Remediation Roadmap:** `dev_docs_v3/05-audit/REMEDIATION-ROADMAP.md` (known bugs by service)
- **PST Files:** `dev_docs_v3/05-audit/tribunal/per-service/` (per-service audit findings)
- **STATUS.md:** `dev_docs_v3/STATUS.md` (current build state)
- **Playwright Results:** `apps/web/test/route-verification.spec.ts` (route scan + failures)
