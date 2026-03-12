# Sprint 03 — TMS Core Build

> **Duration:** 2 weeks
> **Goal:** Build TMS Core frontend (Orders, Loads, Dispatch Board) wired to existing backend
> **Depends on:** QS-001 (WebSocket Gateways), QS-008 (Runtime Verification)

---

## Sprint Capacity

| Agent        | Available Days | Focus Hours/Day | Total Hours |
| ------------ | -------------- | --------------- | ----------- |
| Claude Code  | 10             | 3h              | 30h         |
| Gemini/Codex | 10             | 1.5h            | 15h         |
| **Total**    |                |                 | **45h**     |

**Committed:** 40h

---

## Sprint Goal

> "Order lifecycle works end-to-end: create order, assign carrier (create load), dispatch, track check calls, mark delivered. Dispatch board shows real-time load status via WebSocket."

---

## Committed Tasks

| ID        | Title                                 | Effort   | Priority | Assigned    | Status |
| --------- | ------------------------------------- | -------- | -------- | ----------- | ------ |
| TMS-001   | Order List Screen                     | M (4h)   | P0       | Claude Code | done   |
| TMS-002   | Order Create/Edit Form                | L (8h)   | P0       | Claude Code | done   |
| TMS-003   | Order Detail View (with stops, items) | L (6h)   | P0       | Claude Code | done   |
| TMS-004   | Load List Screen                      | M (3h)   | P0       | Claude Code | done   |
| TMS-005   | Load Detail View                      | M (4h)   | P0       | Claude Code | done   |
| TMS-006   | Dispatch Board (real-time)            | XL (10h) | P0       | Claude Code | done   |
| TMS-007   | Check Call Form + History             | M (3h)   | P1       | Claude Code | done   |
| TMS-008   | Rate Confirmation Send                | S (2h)   | P1       | Claude Code | done   |
| **Total** |                                       | **40h**  |          |             |        |

---

## Acceptance Criteria

- [x] Order CRUD with stops (pickup/delivery), items, customer selection
- [x] Order-to-load assignment flow
- [x] Load status progression: PENDING → DISPATCHED → PICKED_UP → IN_TRANSIT → DELIVERED
- [x] Dispatch board: drag-drop, kanban/table views, status filters, polling updates (WebSocket fallback)
- [x] Check call creation with location, ETA, status, next-call reminder
- [x] Rate confirmation generation and send
- [x] Status history timeline on load detail

---

## Design Specs

- `dev_docs/12-Rabih-design-Process/05-tms-core/` — TMS Core screen specs
- Hub file: `dev_docs_v3/01-services/p0-mvp/tms-core.md`
- Backend: `apps/api/src/modules/loads/`, `apps/api/src/modules/orders/`

---

## Risk / Dependencies

| Risk                                  | Mitigation                                              |
| ------------------------------------- | ------------------------------------------------------- |
| WebSocket gateways not ready (QS-001) | Dispatch board degrades to polling if WS unavailable    |
| LoadsService is 19KB monolith         | Wire up existing methods, don't refactor in this sprint |
| OrdersService is 22KB monolith        | Same — wire up, refactor later                          |
