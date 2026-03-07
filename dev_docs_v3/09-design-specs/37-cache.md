# Cache Design Spec Integration

**Source:** `dev_docs/12-Rabih-design-Process/37-cache/` (5 files)
**MVP Tier:** P2
**Frontend routes:** None — not built yet
**Backend module:** `apps/api/src/modules/cache/`

---

## Screen-to-Route Mapping

| # | Design Spec | Frontend Route | Status |
|---|------------|----------------|--------|
| 00 | `00-service-overview.md` | — | Reference only |
| 01 | `01-cache-dashboard.md` | — | Not built — P2 |
| 02 | `02-cache-management.md` | — | Not built — P2 |
| 03 | `03-cache-settings.md` | — | Not built — P2 |
| 04 | `04-cache-reports.md` | — | Not built — P2 |

---

## Backend

- `CacheManagementController` at `cache/management/cache-management.controller.ts`
- Endpoints: health, stats, keys, invalidate, warm
- **SECURITY ISSUE:** No `RolesGuard` — any authenticated user can delete cache keys (SEC-003)

---

## Implementation Notes

- Admin-facing cache management UI
- Backend exists but lacks proper role guards (security task SEC-003)
- Redis infrastructure via Docker (see redis module spec)
- Cache dashboard would show hit/miss rates, memory usage, key counts
- All screens P2 — operational tooling, not end-user features
