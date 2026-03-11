# Sprint 02 — Accounting Build

> **Duration:** 2 weeks (after Quality Sprint)
> **Goal:** Complete Accounting module frontend screens, wire up to existing backend endpoints
> **Depends on:** QS-003 (Accounting Dashboard Endpoint)

---

## Sprint Capacity

| Agent        | Available Days | Focus Hours/Day | Total Hours |
| ------------ | -------------- | --------------- | ----------- |
| Claude Code  | 10             | 3h              | 30h         |
| Gemini/Codex | 10             | 1.5h            | 15h         |
| **Total**    |                |                 | **45h**     |

**Committed:** 40h (90% rule)

---

## Sprint Goal

> "Every accounting screen renders, connects to real endpoints, and handles loading/error/empty states. Invoice CRUD, settlement workflow, and basic reporting work end-to-end."

---

## Committed Tasks

| ID        | Title                           | Effort          | Priority | Assigned    | Status                                    |
| --------- | ------------------------------- | --------------- | -------- | ----------- | ----------------------------------------- |
| ACC-001   | Accounting Dashboard Screen     | L (6h)          | P0       | Claude Code | done (pre-existing)                       |
| ACC-002   | Invoice List + Create/Edit      | L (8h)          | P0       | Claude Code | done (QA + VoidInvoiceDialog + edit page) |
| ACC-003   | Invoice Detail View             | M (4h)          | P0       | Claude Code | done (QA + VoidInvoiceDialog)             |
| ACC-004   | Payment Received CRUD           | M (4h)          | P0       | Claude Code | done (QA + ConfirmDialog)                 |
| ACC-005   | Payment Made CRUD               | M (4h)          | P1       | Claude Code | done (QA + payable detail page)           |
| ACC-006   | Settlement List + Detail        | L (6h)          | P0       | Claude Code | done (QA + ConfirmDialog + create form)   |
| ACC-007   | Settlement Line Item Management | M (4h)          | P1       | Claude Code | done (QA + ConfirmDialog)                 |
| ACC-008   | Chart of Accounts View          | M (3h)          | P1       | Claude Code | done (new build)                          |
| ACC-009   | Journal Entry View              | S (2h)          | P2       | Claude Code | done (new build)                          |
| **Total** |                                 | **~12h actual** |          |             | **9/9 done**                              |

---

## Acceptance Criteria

- [x] Dashboard shows AR/AP summary, aging buckets, revenue chart
- [x] Invoice list: search, filter by status/date, pagination
- [x] Invoice create: customer select, line items, auto-calculation
- [x] Payment recording with invoice application
- [x] Settlement creation from loads
- [x] All screens: loading spinners, error boundaries, empty states
- [x] No `window.confirm()` — use ConfirmDialog
- [x] TypeScript strict mode passes (web accounting files — pre-existing errors in carrier/TMS unrelated)

---

## Design Specs

- `dev_docs/12-Rabih-design-Process/07-accounting/` — All accounting screen specs
- Hub file: `dev_docs_v3/01-services/p0-mvp/accounting.md`

---

## Risk / Dependencies

| Risk                        | Mitigation                                               |
| --------------------------- | -------------------------------------------------------- |
| QS-003 not done             | ACC-001 blocked — schedule QS-003 completion first       |
| Settlement workflow complex | Start with simple list/detail, add workflow in Sprint 04 |
| QuickBooks integration      | Not in scope — manual entry only for MVP                 |
