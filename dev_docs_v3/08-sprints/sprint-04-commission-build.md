# Sprint 04 — Commission & Agent Build

> **Duration:** 2 weeks
> **Status:** COMPLETE (2026-03-12)
> **Goal:** Fix commission backend bugs + build agent management frontend
> **Depends on:** Sprint 02 (Accounting), Sprint 03 (TMS Core — loads must exist)

---

## Sprint Capacity

| Agent        | Available Days | Focus Hours/Day | Total Hours |
| ------------ | -------------- | --------------- | ----------- |
| Claude Code  | 10             | 3h              | 30h         |
| Gemini/Codex | 10             | 1.5h            | 15h         |
| **Total**    |                |                 | **45h**     |

**Committed:** 38h

---

## Sprint Goal

> "Commission backend bugs fixed (auto-calc trigger, soft-delete, transactions). Agent management frontend built (4 pages, 23 hooks, 10 components)."

---

## Committed Tasks

| ID      | Title                                                | Effort | Priority | Assigned    | Status                                     |
| ------- | ---------------------------------------------------- | ------ | -------- | ----------- | ------------------------------------------ |
| COM-001 | Commission Plan CRUD                                 | M (4h) | P0       | Claude Code | **DONE** (prior sprint — 11 pages built)   |
| COM-002 | Commission Plan Tiers UI                             | M (3h) | P0       | Codex       | **DONE** (prior sprint)                    |
| COM-003 | User Commission Assignment                           | M (3h) | P0       | Codex       | **DONE** (prior sprint)                    |
| COM-004 | Commission Entry List + Detail                       | M (4h) | P0       | Claude Code | **DONE** (prior sprint)                    |
| COM-005 | Commission Payout Workflow                           | L (6h) | P0       | Claude Code | **DONE** (prior sprint)                    |
| COM-006 | Commission Dashboard                                 | M (4h) | P1       | Claude Code | **DONE** (prior sprint)                    |
| COM-BF1 | COMM-107: Invoice PAID event + commission listener   | M (2h) | P0       | Claude Code | **DONE** (2026-03-12)                      |
| COM-BF2 | COMM-110/111: Soft-delete filters (~11 methods)      | M (2h) | P0       | Claude Code | **DONE** (2026-03-12)                      |
| COM-BF3 | COMM-113: Transaction wrapping (create/process/void) | S (1h) | P1       | Claude Code | **DONE** (2026-03-12)                      |
| COM-FE1 | Agent hooks (4 files, 23 hooks)                      | M (2h) | P0       | Claude Code | **DONE** (2026-03-12)                      |
| COM-FE2 | Agent List page + table component                    | M (3h) | P0       | Claude Code | **DONE** (2026-03-12)                      |
| COM-FE3 | Agent Create/Edit form                               | M (3h) | P0       | Claude Code | **DONE** (2026-03-12)                      |
| COM-FE4 | Agent Detail (tabbed) + Overview tab                 | M (3h) | P0       | Claude Code | **DONE** (2026-03-12)                      |
| COM-FE5 | Agreement tab + dialog                               | M (2h) | P1       | Claude Code | **DONE** (2026-03-12) — dialog placeholder |
| COM-FE6 | Customers tab + assignment dialog                    | M (2h) | P1       | Claude Code | **DONE** (2026-03-12) — dialog placeholder |
| COM-FE7 | Commissions tab (read-only)                          | S (1h) | P2       | Claude Code | **DONE** (2026-03-12)                      |

---

## Acceptance Criteria

- [x] Commission plans: FLAT, PERCENTAGE, TIERED types configurable (prior sprint)
- [x] Tier configuration with threshold ranges (prior sprint)
- [x] User-to-plan assignment with effective dates (prior sprint)
- [x] Auto-calculation trigger on load delivery + invoice PAID (COMM-107)
- [x] Commission entry list: filter by period, user, status (prior sprint)
- [x] Payout workflow: calculate → approve → pay (prior sprint + COMM-113 atomicity)
- [x] Agent CRUD with agreement management (COM-FE1–FE5)
- [x] Agent customer assignments with protection periods (COM-FE6)
- [x] Soft-delete filters on all commission queries (COMM-110/111)

---

## Design Specs

- `dev_docs/12-Rabih-design-Process/08-commission/` — Commission screen specs
- `dev_docs/12-Rabih-design-Process/16-agents/` — Agent screen specs
- Hub: `dev_docs_v3/01-services/p0-mvp/commission.md`
