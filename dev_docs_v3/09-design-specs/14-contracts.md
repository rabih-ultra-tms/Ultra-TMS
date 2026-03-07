# Contracts Design Spec Integration

**Source:** `dev_docs/12-Rabih-design-Process/14-contracts/` (9 files)
**MVP Tier:** P1
**Frontend routes:** None — not built yet
**Backend module:** `apps/api/src/modules/contracts/`

---

## Screen-to-Route Mapping

| # | Design Spec | Frontend Route | Page File | Status |
|---|------------|----------------|-----------|--------|
| 00 | `00-service-overview.md` | — | — | Reference only |
| 01 | `01-contracts-dashboard.md` | — | Not built | P1 |
| 02 | `02-contracts-list.md` | — | Not built | P1 |
| 03 | `03-contract-detail.md` | — | Not built | P1 |
| 04 | `04-contract-builder.md` | — | Not built | P1 |
| 05 | `05-contract-templates.md` | — | Not built | P2 |
| 06 | `06-rate-agreements.md` | — | Not built | P2 |
| 07 | `07-contract-renewals.md` | — | Not built | P2 |
| 08 | `08-contract-reports.md` | — | Not built | P2 |

---

## Backend

- Controller at `contracts/contracts/contracts.controller.ts` (nested directory)
- Uses `@CurrentUser()` returning `CurrentUserData` with `user.tenantId`
- Full CRUD + status lifecycle

---

## Implementation Notes

- Contract management for carrier and customer agreements
- Contract builder (04) would be a complex form/wizard — P1
- Rate agreements (06) overlaps with rate-intelligence module
- Backend exists with CRUD — needs frontend pages built
