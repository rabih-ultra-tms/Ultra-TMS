# Ultra TMS — Task Status Dashboard

> **Last Updated:** February 8, 2026
> **Current Phase:** Phase 0 — Emergency Fixes (Week 1)
> **Overall Health:** C+ (6.4/10) → targeting B+ (8/10) by Week 16
> **Revision:** v2 — Updated with logistics expert review adjustments (+12 new tasks, 14 estimate changes)

---

## Sprint Calendar

| Phase | Weeks | Focus | Tasks | Est. Hours |
|-------|-------|-------|-------|------------|
| **0** | **1** | Emergency Fixes | BUG-001→010 | 28-36h |
| **1** | **2** | Design Foundation | COMP-001→008 | 24-32h |
| **2** | **3-4** | Patterns + Carrier | PATT-001→003, CARR-001→003, COMP-009→010 | 28-38h |
| **3** | **5-7** | TMS Viewing + Sales | TMS-001→004, SALES-001→003, TMS-015, DOC-001 | 46-52h |
| **4** | **8-10** | TMS Forms + Operations | TMS-005→010, TMS-011a→e, TMS-012, INFRA-001 | 98-118h |
| **5** | **11-13** | Load Board + Testing + Emails | TMS-013→014, LB-001→005, COMM-001, TEST-001a→d, DOC-002 | 75-87h |
| **6** | **14-16** | Financial + Go-Live | ACC-001→006, COM-001→006, INTEG-001, DOC-003, RELEASE-001, BUG-BUFFER | 98-134h |

**Total: ~420-490 hours over 16 weeks (2 developers × 15h/week = 480h capacity)**

---

## Task Claiming Protocol (2 Developers)

> Both developers work independently with different AI tools. Coordinate via git.

1. **`git pull`** before claiming any task
2. Find a task with Assigned = "—" in the current phase below
3. Write your name in the "Assigned" column, change status to `IN PROGRESS`
4. **Commit and push immediately:** `git add dev_docs_v2/STATUS.md && git commit -m "task: claim TASK-ID" && git push`
5. If a task is already assigned — pick a different one
6. If blocked — change status to `BLOCKED`, add a note in the task file
7. When done — mark `DONE`, add today's date in "Updated" column

**Tip:** Work on different phases simultaneously to avoid file conflicts (e.g., one dev on Phase 0 bugs, the other on Phase 1 components).

---

## Milestone Checkpoints

| Week | Milestone | Validation |
|------|-----------|------------|
| 1 | All 404s fixed, security patched | Every sidebar link works, no console.log tokens |
| 2 | Design system live | Design tokens applied, StatusBadge + KPICard + FilterBar working |
| 4 | Patterns + Carrier refactored | ListPage/DetailPage/FormPage patterns extracted, carrier list decomposed |
| 7 | TMS viewing complete | Orders + Loads list & detail pages render real data from API |
| 7 | Quotes rebuilt + tracking page live | Quotes match design specs, public tracking works without auth |
| 10 | TMS forms + dispatch working | Can create order → create load → dispatch → track on board |
| 13 | Load board + tracking + emails live | Can post load, receive bids, track GPS, automated emails fire |
| 13 | Testing complete | 40-60h of structured testing across all phases |
| 16 | Financial + go-live ready | Invoices, payments, settlements, commission all functional. Lighthouse >80. |

---

## Phase 0 — Emergency Fixes (Week 1)

| Task | Title | Status | Assigned | Effort | Updated |
|------|-------|--------|----------|--------|---------|
| BUG-001 | Carrier detail page 404 | DONE | Claude Code | L (4-6h) | Feb 8 |
| BUG-002 | Load history detail page 404 | DONE | Claude Code | M (3-4h) | Feb 8 |
| BUG-003 | Sidebar has 404 links | DONE | Claude Code | S (1-2h) | Feb 8 |
| BUG-004 | Security: JWT & roles in console | DONE | Claude Code | S (1h) | Feb 8 |
| BUG-005 | Security: localStorage tokens | DONE | Claude Code | M (3h) | Feb 8 |
| BUG-006 | Replace window.confirm × 7 | DONE | Claude Code | S (1-2h) | Feb 8 |
| BUG-007 | Add search debounce × 3 | DONE | Claude Code | S (1h) | Feb 8 |
| BUG-008 | Dashboard hardcoded to zeros | DONE | Claude Code | M (4h) ⬆️ | Feb 8 |
| BUG-009 | CRM delete buttons missing | NOT STARTED | — | M (2-3h) | — |
| BUG-010 | CRM missing features (3 items) | NOT STARTED | — | M (3-4h) | — |

**Phase 0 Total:** ~28-36 hours

> ⬆️ = estimate increased per logistics expert review

---

## Phase 1 — Design Foundation (Week 2)

| Task | Title | Status | Assigned | Effort | Updated |
|------|-------|--------|----------|--------|---------|
| COMP-001 | Design tokens foundation | NOT STARTED | — | L (8h) ⬆️ | — |
| COMP-002 | Unified StatusBadge | NOT STARTED | — | M (2-3h) | — |
| COMP-003 | KPICard component | NOT STARTED | — | M (2-3h) | — |
| COMP-004 | FilterBar component | NOT STARTED | — | M (3-4h) | — |
| COMP-005 | DataGrid (TanStack Table) | NOT STARTED | — | L (4-6h) | — |
| COMP-006 | ConfirmDialog upgrade | NOT STARTED | — | S (1h) | — |
| COMP-007 | Page-level loading skeletons | NOT STARTED | — | M (2-3h) | — |
| COMP-008 | Install missing shadcn components | NOT STARTED | — | S (1h) | — |

**Phase 1 Total:** ~24-32 hours

> **CRITICAL GATE:** COMP-001 must pass 2-person review before any Phase 2 work begins.

---

## Phase 2 — Patterns & Carrier Refactor (Weeks 3-4)

| Task | Title | Status | Assigned | Effort | Updated |
|------|-------|--------|----------|--------|---------|
| PATT-001 | List page pattern | NOT STARTED | — | L (4-6h) | — |
| PATT-002 | Detail page pattern | NOT STARTED | — | M (3-4h) | — |
| PATT-003 | Form page pattern | NOT STARTED | — | M (3-4h) | — |
| CARR-001 | Refactor carrier list | NOT STARTED | — | M (4h) ⬆️ | — |
| CARR-002 | Upgrade carrier detail | NOT STARTED | — | M (5h) ⬆️ | — |
| CARR-003 | Carrier module tests | NOT STARTED | — | M (3-4h) | — |
| COMP-009 | DateRangePicker | NOT STARTED | — | M (2-3h) | — |
| COMP-010 | StopList component | NOT STARTED | — | M (2-3h) | — |

**Phase 2 Total:** ~28-38 hours

---

## Phase 3 — TMS Viewing + Sales Rebuild (Weeks 5-7)

| Task | Title | Status | Assigned | Effort | Updated |
|------|-------|--------|----------|--------|---------|
| TMS-001 | Orders List page | NOT STARTED | — | L (7h) ⬆️ | — |
| TMS-002 | Order Detail page (tabs) | NOT STARTED | — | L (8h) ⬆️ | — |
| TMS-003 | Loads List page | NOT STARTED | — | M (5h) ⬆️ | — |
| TMS-004 | Load Detail page (tabs) | NOT STARTED | — | L (8h) ⬆️ | — |
| SALES-001 | Quotes List rebuild | NOT STARTED | — | M (5h) ⬆️ | — |
| SALES-002 | Quote Detail rebuild | NOT STARTED | — | L (7h) ⬆️ | — |
| SALES-003 | Quote Create/Edit rebuild | NOT STARTED | — | L (8h) ⬆️ | — |
| **TMS-015** | **Public Tracking Page** | NOT STARTED | — | L (8-12h) | — |
| **DOC-001** | **Document Upload on Load Detail** | NOT STARTED | — | M (4-6h) | — |

**Phase 3 Total:** ~46-52 hours

> **NEW:** TMS-015 (public tracking page) and DOC-001 (POD upload) added per logistics expert review.

---

## Phase 4 — TMS Forms + Operations (Weeks 8-10)

| Task | Title | Status | Assigned | Effort | Updated |
|------|-------|--------|----------|--------|---------|
| TMS-005 | New Order Form (multi-step, 4 sessions) | NOT STARTED | — | XL (12h) ⬆️ | — |
| TMS-006 | Edit Order Form | NOT STARTED | — | M (5h) ⬆️ | — |
| TMS-007 | New Load Form (3 sessions) | NOT STARTED | — | L (9h) ⬆️ | — |
| TMS-008 | Edit Load Form | NOT STARTED | — | M (5h) ⬆️ | — |
| TMS-009 | Stop Management | NOT STARTED | — | L (6h) ⬆️ | — |
| TMS-010 | Check Call Log | NOT STARTED | — | L (6h) ⬆️ | — |
| INFRA-001 | WebSocket Infrastructure | NOT STARTED | — | L (8h) ⬆️ | — |
| **TMS-011a** | **Dispatch: Data layer** (React Query + WS hooks) | NOT STARTED | — | L (8-10h) | — |
| **TMS-011b** | **Dispatch: Kanban UI** (6 columns, cards, filters) | NOT STARTED | — | L (8-10h) | — |
| **TMS-011c** | **Dispatch: Drag-drop** (dnd-kit, validation) | NOT STARTED | — | XL (12-16h) | — |
| **TMS-011d** | **Dispatch: Real-time sync** (WebSocket events) | NOT STARTED | — | L (8-12h) | — |
| **TMS-011e** | **Dispatch: Bulk actions + polish** | NOT STARTED | — | M (4-6h) | — |
| TMS-012 | Operations Dashboard | NOT STARTED | — | L (9h) ⬆️ | — |

**Phase 4 Total:** ~98-118 hours (heaviest phase — both developers fully engaged for 3 weeks)

> **CRITICAL:** Dispatch Board split from 1 task (12h) into 5 sub-tasks (40-60h) per logistics expert review.
> INFRA-001 must start Week 8 Day 1 — all dispatch tasks depend on it.

---

## Phase 5 — Load Board + Testing + Emails (Weeks 11-13)

| Task | Title | Status | Assigned | Effort | Updated |
|------|-------|--------|----------|--------|---------|
| TMS-013 | Tracking Map (live GPS) | NOT STARTED | — | L (12h) ⬆️ | — |
| TMS-014 | Rate Confirmation (PDF) | NOT STARTED | — | L (6h) ⬆️ | — |
| LB-001 | Load Board Dashboard | NOT STARTED | — | M (4h) ⬆️ | — |
| LB-002 | Post New Load form | NOT STARTED | — | M (5h) ⬆️ | — |
| LB-003 | Available Loads search | NOT STARTED | — | M (5h) ⬆️ | — |
| LB-004 | Posting Detail + Bids | NOT STARTED | — | L (7h) ⬆️ | — |
| LB-005 | Carrier Matches panel | NOT STARTED | — | M (4h) ⬆️ | — |
| **COMM-001** | **5 Automated Emails** (rate con, tender, pickup, delivery, invoice) | NOT STARTED | — | L (8-12h) | — |
| **DOC-002** | **Business Rules Reference Doc** | NOT STARTED | — | M (4-6h) | — |
| **TEST-001a** | **Testing: Phase 0-2** (bug fixes, design, carrier) | NOT STARTED | — | L (8-10h) | — |
| **TEST-001b** | **Testing: Phase 3** (orders, loads, quotes, tracking) | NOT STARTED | — | XL (12-16h) | — |
| **TEST-001c** | **Testing: Phase 4** (forms, dispatch board, ops dashboard) | NOT STARTED | — | XL (16-24h) | — |
| **TEST-001d** | **Testing: Phase 5** (load board, tracking map, emails) | NOT STARTED | — | L (8-12h) | — |

**Phase 5 Total:** ~75-87 hours

> **NEW:** COMM-001 (automated emails), DOC-002 (business rules), TEST-001a-d (structured testing) added per logistics expert review.
> Testing expanded from 4h to 40-60h across 4 sub-tasks.

---

## Phase 6 — Financial + Go-Live (Weeks 14-16)

| Task | Title | Status | Assigned | Effort | Updated |
|------|-------|--------|----------|--------|---------|
| ACC-001 | Accounting Dashboard | NOT STARTED | — | M (5h) ⬆️ | — |
| ACC-002 | Invoices (list, detail, create) | NOT STARTED | — | L (8h) ⬆️ | — |
| ACC-003 | Payments Received | NOT STARTED | — | M (5h) ⬆️ | — |
| ACC-004 | Carrier Payables | NOT STARTED | — | M (3h) ⬆️ | — |
| ACC-005 | Settlements | NOT STARTED | — | M (5h) ⬆️ | — |
| ACC-006 | Aging Reports | NOT STARTED | — | M (4h) ⬆️ | — |
| COM-001 | Commission Dashboard | NOT STARTED | — | M (4h) ⬆️ | — |
| COM-002 | Sales Reps list + detail | NOT STARTED | — | M (5h) ⬆️ | — |
| COM-003 | Commission Plans (CRUD + tier editor) | NOT STARTED | — | L (8h) ⬆️ | — |
| COM-004 | Commission Transactions | NOT STARTED | — | M (4h) ⬆️ | — |
| COM-005 | Payout Processing | NOT STARTED | — | M (5h) ⬆️ | — |
| COM-006 | Commission Reports | NOT STARTED | — | M (3h) ⬆️ | — |
| INTEG-001 | FMCSA Integration | NOT STARTED | — | M (6h) ⬆️ | — |
| **DOC-003** | **Screen-to-API Contract Registry** | NOT STARTED | — | L (6-8h) | — |
| RELEASE-001 | Pre-Release + Go-Live checklist | NOT STARTED | — | L (8h) ⬆️ | — |
| **BUG-BUFFER** | **Bug Fix / Iteration Buffer** (distributed) | RESERVED | — | XL (42-66h) | — |

**Phase 6 Total:** ~98-134 hours (includes 42-66h bug buffer)

> **REMOVED:** INTEG-002 (QuickBooks Sync) — own accounting module is the priority. QuickBooks/Xero deferred to post-MVP.
> **NEW:** DOC-003 (API contract registry), BUG-BUFFER (iteration capacity).
> Bug buffer includes 12-16h freed from QuickBooks removal.

---

## Revision Log

| Date | Change | Reason |
|------|--------|--------|
| Feb 8, 2026 | v1 — Initial 65 tasks, 250-280h | Created from audit results |
| Feb 8, 2026 | v2 — 77 tasks, 420-490h | Logistics expert review adjustments: +12 new tasks, 14 estimate increases, QuickBooks removed, dispatch board split 5 ways, testing split 4 ways |

---

## How to Use This File

1. **Before starting work:** Find an unassigned task, write your name in "Assigned", change status to "IN PROGRESS"
2. **After completing work:** Change status to "DONE", update the "Updated" column with today's date
3. **If blocked:** Change status to "BLOCKED", add a note about what's blocking you
4. **Dependencies:** Check the task file — some tasks are blocked by others

**Status values:** `NOT STARTED` | `IN PROGRESS` | `DONE` | `BLOCKED` | `RESERVED`
