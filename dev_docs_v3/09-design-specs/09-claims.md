# Claims Design Spec Integration

**Source:** `dev_docs/12-Rabih-design-Process/09-claims/` (11 files)
**MVP Tier:** P1
**Frontend routes:** None — not built yet
**Backend module:** `apps/api/src/modules/claims/`

---

## Screen-to-Route Mapping

| # | Design Spec | Frontend Route | Page File | Status |
|---|------------|----------------|-----------|--------|
| 00 | `00-service-overview.md` | — | — | Reference only |
| 01 | `01-claims-dashboard.md` | — | Not built | P1 |
| 02 | `02-claims-list.md` | — | Not built | P1 |
| 03 | `03-claim-detail.md` | — | Not built | P1 |
| 04 | `04-new-claim.md` | — | Not built | P1 |
| 05 | `05-claim-investigation.md` | — | Not built | P1 |
| 06 | `06-damage-photos.md` | — | Not built | P1 |
| 07 | `07-settlement-calculator.md` | — | Not built | P2 |
| 08 | `08-claim-resolution.md` | — | Not built | P1 |
| 09 | `09-claims-report.md` | — | Not built | P2 |
| 10 | `10-carrier-claims-history.md` | — | Not built | P2 |

---

## Backend Endpoints (exist)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/claims` | GET | List claims |
| `/claims` | POST | File a claim |
| `/claims/:id` | GET | Claim detail |
| `/claims/:id` | PATCH | Update claim |
| `/claims/:id/file` | POST | File claim action |
| `/claims/:id/assign` | POST | Assign investigator |
| `/claims/:id/status` | PATCH | Update claim status |

Controller uses `@HttpCode(HttpStatus.OK)` on POST actions. Nested at `claims/claims/claims.controller.ts`.

---

## Implementation Notes

- Backend exists with full CRUD + workflow actions — frontend pages not built
- Claims module has nested directory structure (`claims/claims/`)
- No frontend routes, hooks, or pages exist — full P1 build needed
- Damage photos (06) requires document/storage module integration
- Settlement calculator (07) is P2 — separate from accounting settlements
