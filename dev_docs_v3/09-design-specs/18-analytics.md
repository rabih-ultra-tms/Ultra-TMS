# Analytics Design Spec Integration

**Source:** `dev_docs/12-Rabih-design-Process/18-analytics/` (11 files)
**MVP Tier:** P2
**Frontend routes:** None — not built yet
**Backend module:** `apps/api/src/modules/analytics/`

---

## Screen-to-Route Mapping

| # | Design Spec | Frontend Route | Page File | Status |
|---|------------|----------------|-----------|--------|
| 00 | `00-service-overview.md` | — | — | Reference only |
| 01 | `01-analytics-dashboard.md` | — | Not built | P2 |
| 02 | `02-operations-analytics.md` | — | Not built | P2 |
| 03 | `03-financial-analytics.md` | — | Not built | P2 |
| 04 | `04-carrier-analytics.md` | — | Not built | P2 |
| 05 | `05-customer-analytics.md` | — | Not built | P2 |
| 06 | `06-lane-analytics.md` | — | Not built | P2 |
| 07 | `07-sales-analytics.md` | — | Not built | P2 |
| 08 | `08-custom-reports.md` | — | Not built | P2 |
| 09 | `09-scheduled-reports.md` | — | Not built | P2 |
| 10 | `10-data-export.md` | — | Not built | P2 |

---

## Backend (extensive)

Four controllers in analytics module:
- **DashboardsController** (`analytics/dashboards`) — CRUD + widget management (add/update/remove)
- **KPIsController** (`analytics/kpis`) — CRUD + current values + by-category + calculate
- **AlertsController** (`analytics/alerts`) — alerts + saved views + data queries (3 controllers in one file)
- **ReportsController** (`analytics/reports`) — CRUD + schedule + execute + execution history

Uses `@CurrentUser('id')` property extraction pattern. Imports `KPICategory` from `@prisma/client`.

---

## Implementation Notes

- Analytics backend is well-built with 4 controllers — frontend not started
- Dashboard builder pattern: users create dashboards, add widgets to them
- KPI system: predefined KPI types with calculation engine
- Report scheduling: cron-based report generation and email delivery
- All 10 screens are P2 — not in MVP scope
