# Carrier Portal Design Spec Integration

**Source:** `dev_docs/12-Rabih-design-Process/13-carrier-portal/` (13 files)
**MVP Tier:** P2
**Frontend routes:** None — not built yet
**Backend module:** `apps/api/src/modules/carrier-portal/`

---

## Screen-to-Route Mapping

| # | Design Spec | Frontend Route | Page File | Status |
|---|------------|----------------|-----------|--------|
| 00 | `00-service-overview.md` | — | — | Reference only |
| 01 | `01-portal-dashboard.md` | — | Not built | P2 |
| 02 | `02-available-loads.md` | — | Not built | P2 |
| 03 | `03-my-loads.md` | — | Not built | P2 |
| 04 | `04-load-offer-detail.md` | — | Not built | P2 |
| 05 | `05-document-upload.md` | — | Not built | P2 |
| 06 | `06-payment-history.md` | — | Not built | P2 |
| 07 | `07-my-profile.md` | — | Not built | P2 |
| 08 | `08-insurance-upload.md` | — | Not built | P2 |
| 09 | `09-equipment-manager.md` | — | Not built | P2 |
| 10 | `10-rate-confirmation.md` | — | Not built | P2 |
| 11 | `11-check-call-entry.md` | — | Not built | P2 |
| 12 | `12-support-chat.md` | — | Not built | P3 |

---

## Backend

- Separate JWT system: `CARRIER_PORTAL_JWT_SECRET`
- Auth controller at `carrier-portal/auth` with separate guard
- 13 design specs — largest portal module

---

## Implementation Notes

- Entirely separate auth from main app and customer portal
- Carrier portal allows carriers to: accept loads, upload docs, submit check calls, view payments
- Rate confirmation acceptance (10) integrates with TMS rate-confirmation service
- Check call entry (11) is the carrier's side of the check call workflow
- All screens are P2 — not in 16-week MVP scope
