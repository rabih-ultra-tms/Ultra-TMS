# Customer Portal Design Spec Integration

**Source:** `dev_docs/12-Rabih-design-Process/12-customer-portal/` (11 files)
**MVP Tier:** P2
**Frontend routes:** None — not built yet
**Backend module:** `apps/api/src/modules/customer-portal/`

---

## Screen-to-Route Mapping

| # | Design Spec | Frontend Route | Page File | Status |
|---|------------|----------------|-----------|--------|
| 00 | `00-service-overview.md` | — | — | Reference only |
| 01 | `01-portal-dashboard.md` | — | Not built | P2 |
| 02 | `02-my-shipments.md` | — | Not built | P2 |
| 03 | `03-shipment-detail.md` | — | Not built | P2 |
| 04 | `04-new-shipment-request.md` | — | Not built | P2 |
| 05 | `05-my-quotes.md` | — | Not built | P2 |
| 06 | `06-my-invoices.md` | — | Not built | P2 |
| 07 | `07-my-documents.md` | — | Not built | P2 |
| 08 | `08-track-shipment.md` | — | Not built | P2 |
| 09 | `09-portal-settings.md` | — | Not built | P2 |
| 10 | `10-support-chat.md` | — | Not built | P3 |

---

## Backend

- Separate JWT system: `CUSTOMER_PORTAL_JWT_SECRET`
- Auth controller at `portal/auth` with `PortalAuthGuard`
- Dashboard controller exists at `customer-portal/dashboard/`

---

## Implementation Notes

- Entirely separate auth system from main app (different JWT secret, different guard)
- Would be a separate Next.js route group or separate app
- Public tracking page exists at `/track/[trackingCode]` — may serve as P0 alternative to portal tracking
- All screens are P2 — not in 16-week MVP scope
