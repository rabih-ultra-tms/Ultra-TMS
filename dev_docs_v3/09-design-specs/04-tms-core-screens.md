# TMS Core Screens Design Spec Integration

**Source:** `dev_docs/12-Rabih-design-Process/04-tms-core/` (files 00-09)
**MVP Tier:** P0
**Frontend routes:** `(dashboard)/operations/*`
**Backend module:** `apps/api/src/modules/tms/`, `apps/api/src/modules/operations/`

---

## Screen-to-Route Mapping

| # | Design Spec | Frontend Route | Page File | Status |
|---|------------|----------------|-----------|--------|
| 00 | `00-service-overview.md` | — | — | Reference only |
| 01 | `01-operations-dashboard.md` | `/operations` | `(dashboard)/operations/page.tsx` | Exists |
| 02 | `02-orders-list.md` | `/operations/orders` | `(dashboard)/operations/orders/page.tsx` | Exists |
| 03 | `03-order-detail.md` | `/operations/orders/[id]` | `(dashboard)/operations/orders/[id]/page.tsx` | Exists |
| 04 | `04-order-entry.md` | `/operations/orders/new` | `(dashboard)/operations/orders/new/page.tsx` | Exists |
| 05 | `05-loads-list.md` | `/operations/loads` | `(dashboard)/operations/loads/page.tsx` | Exists |
| 06 | `06-load-detail.md` | `/operations/loads/[id]` | `(dashboard)/operations/loads/[id]/page.tsx` | Exists |
| 07 | `07-load-builder.md` | `/operations/loads/new` | `(dashboard)/operations/loads/new/page.tsx` | Exists |
| 08 | `08-dispatch-board.md` | `/operations/dispatch` | `(dashboard)/operations/dispatch/page.tsx` | Exists |
| 09 | `09-stop-management.md` | Part of load detail | Inline within load detail page | Partial |

---

## Backend Endpoints

| Screen | Endpoint(s) | Hook |
|--------|-------------|------|
| Ops Dashboard | `GET /operations/dashboard/kpis`, `GET /operations/dashboard/charts` | `use-ops-dashboard.ts` |
| Orders List | `GET /tms/orders` | `use-orders.ts` |
| Order Detail | `GET /tms/orders/:id` | `use-orders.ts` |
| Order Create | `POST /tms/orders` | `use-orders.ts` |
| Loads List | `GET /tms/loads` | `use-loads.ts` |
| Load Detail | `GET /tms/loads/:id` | `use-loads.ts` |
| Load Create | `POST /tms/loads` | `use-loads.ts` |
| Dispatch Board | `GET /tms/dispatch/board`, `POST /tms/dispatch/assign` | `use-dispatch.ts` |
| Stops | `GET /tms/stops`, `POST /tms/stops` | `use-stops.ts` |

---

## Implementation Notes

- Backend services exist (LoadsService 19KB, OrdersService 22KB) but frontend pages need wiring
- Operations dashboard controller has 5 endpoints with period/scope/comparisonPeriod params
- Dashboard uses `@CurrentTenant()` and `@CurrentUser()` decorators
- Dispatch board requires WebSocket support (QS-001 task) for real-time updates
- Stop management is inline within load detail — no separate route
