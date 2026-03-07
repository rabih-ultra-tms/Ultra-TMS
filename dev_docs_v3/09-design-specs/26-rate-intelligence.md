# Rate Intelligence Design Spec Integration

**Source:** `dev_docs/12-Rabih-design-Process/26-rate-intelligence/` (9 files)
**MVP Tier:** P2
**Frontend routes:** None — not built yet
**Backend module:** `apps/api/src/modules/rate-intelligence/`

---

## Screen-to-Route Mapping

| # | Design Spec | Frontend Route | Page File | Status |
|---|------------|----------------|-----------|--------|
| 00 | `00-service-overview.md` | — | — | Reference only |
| 01 | `01-rate-intelligence-dashboard.md` | — | Not built | P2 |
| 02 | `02-market-rates.md` | — | Not built | P2 |
| 03 | `03-rate-trends.md` | — | Not built | P2 |
| 04 | `04-lane-rate-lookup.md` | — | Not built | P2 (backend used by Load Planner) |
| 05 | `05-rate-comparison.md` | — | Not built | P2 |
| 06 | `06-rate-alerts.md` | — | Not built | P2 |
| 07 | `07-rate-forecast.md` | — | Not built | P3 |
| 08 | `08-rate-reports.md` | — | Not built | P2 |

---

## Backend (5 controllers)

| Controller | Route | Key Endpoints |
|------------|-------|---------------|
| RateLookupController | `rate-intelligence/lookup` | rate lookup, quick estimate, batch |
| LaneAnalyticsController | `rate-intelligence/lanes` | list lanes, trends, seasonality, compare |
| RateHistoryController | `rate-intelligence/history` | history query, record actual rate |
| RateAlertsController | `rate-intelligence/alerts` | create, list, delete |

---

## CRITICAL: Load Planner Integration

The Load Planner (`/load-planner/[id]/edit` — PROTECTED) calls `POST /rate-intelligence/lookup` to suggest rates during quote creation. **DO NOT BREAK this integration.**

---

## Implementation Notes

- Rate lookup backend is actively used by Load Planner — working integration
- Frontend dashboard/screens not built — P2 standalone features
- Rate providers: internal historical, DAT, Truckstop.com, Transplace, manual rates
- Rate forecast (07) is P3 — predictive analytics feature
