# Safety Design Spec Integration

**Source:** `dev_docs/12-Rabih-design-Process/25-safety/` (11 files)
**MVP Tier:** P1
**Frontend routes:** None — not built yet
**Backend module:** `apps/api/src/modules/safety/`

---

## Screen-to-Route Mapping

| # | Design Spec | Frontend Route | Page File | Status |
|---|------------|----------------|-----------|--------|
| 00 | `00-service-overview.md` | — | — | Reference only |
| 01 | `01-safety-dashboard.md` | — | Not built | P1 |
| 02 | `02-incidents-list.md` | — | Not built | P1 |
| 03 | `03-incident-detail.md` | — | Not built | P1 |
| 04 | `04-incident-report.md` | — | Not built | P1 |
| 05 | `05-safety-inspections.md` | — | Not built | P2 |
| 06 | `06-inspection-form.md` | — | Not built | P2 |
| 07 | `07-driver-safety-scores.md` | — | Not built | P1 |
| 08 | `08-csa-scores.md` | — | Not built | P1 (QS-004 related) |
| 09 | `09-safety-training.md` | — | Not built | P2 |
| 10 | `10-safety-reports.md` | — | Not built | P2 |

---

## Backend (extensive — 7 controllers)

| Controller | Route | Key Endpoints |
|------------|-------|---------------|
| FmcsaController | `safety/fmcsa` | lookup, batch-lookup, watch-list |
| InsuranceController | `safety/insurance` | CRUD + expiring insurance |
| IncidentsController | `safety/incidents` | CRUD + close |
| CsaController | `safety/csa` | carrier scores, refresh, alerts |
| DqfController | `safety/dqf` | compliance status, document upload, expiring |
| SafetyScoresController | `safety/scores` | list, individual, recalculate |
| AlertsController | `safety/alerts` | list, acknowledge, resolve |
| SafetyReportsController | `safety/reports` | compliance, incidents, insurance-coverage |

---

## Implementation Notes

- Safety backend is one of the most complete modules — 7 controllers, no frontend
- CSA scores (08) integrates with carrier scorecard page
- FMCSA lookup here is for batch compliance checking (separate from carrier module's single lookup)
- Insurance tracking overlaps with carrier detail page insurance tab
- Driver safety scores (07) requires driver entity (currently part of carrier module)
