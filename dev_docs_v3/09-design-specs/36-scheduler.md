# Scheduler Design Spec Integration

**Source:** `dev_docs/12-Rabih-design-Process/36-scheduler/` (7 files)
**MVP Tier:** P2
**Frontend routes:** None — not built yet
**Backend module:** `apps/api/src/modules/scheduler/`

---

## Screen-to-Route Mapping

| # | Design Spec | Frontend Route | Status |
|---|------------|----------------|--------|
| 00 | `00-service-overview.md` | — | Reference only |
| 01 | `01-scheduler-dashboard.md` | — | Not built — P2 |
| 02 | `02-resource-calendar.md` | — | Not built — P2 |
| 03 | `03-appointment-manager.md` | — | Not built — P2 |
| 04 | `04-capacity-planning.md` | — | Not built — P2 |
| 05 | `05-auto-scheduler.md` | — | Not built — P2 |
| 06 | `06-scheduler-reports.md` | — | Not built — P2 |

---

## Implementation Notes

- Resource scheduling: drivers, trucks, dock appointments
- Auto-scheduler (05) uses algorithm to optimize assignments — complex
- Backend scheduler module handles cron jobs and job deduplication (via Redis)
- Frontend screens are P2 — not in MVP scope
