# QS-011: Customer Portal — Basic 4-Page MVP

**Priority:** P0
**Effort:** L (2-3 weeks)
**Status:** planned
**Assigned:** Claude Code
**Source:** Tribunal verdict TRIBUNAL-02, TRIBUNAL-04, TRIBUNAL-10

---

## Objective

Build 4 basic Customer Portal pages using the existing 40 backend endpoints: Login, Dashboard, Shipment Tracking, Document Access.

## Context

Customer Portal promoted to P0 as a table-stakes feature. Every competitor offers customer self-service. Without it, brokers must manually email tracking updates and documents — a dealbreaker for any brokerage with more than 5 customers.

## Screens

| Screen | Route | Backend Endpoints | Priority |
|--------|-------|------------------|----------|
| Customer Login | `/portal/login` | `POST /api/v1/customer-portal/auth/login` | P0 |
| Customer Dashboard | `/portal/dashboard` | `GET /api/v1/customer-portal/dashboard` | P0 |
| Shipment Tracking | `/portal/tracking` | `GET /api/v1/customer-portal/shipments`, `GET /api/v1/customer-portal/shipments/:id/tracking` | P0 |
| Document Access | `/portal/documents` | `GET /api/v1/customer-portal/documents` | P0 |

## Dependencies

- Auth module (Customer Portal JWT secret: `CUSTOMER_PORTAL_JWT_SECRET`)
- TMS Core (load/order data for tracking)
- Documents module (document listing and download)

## Acceptance Criteria

- [ ] Customer can log in with portal-specific JWT
- [ ] Dashboard shows customer's active shipments count and recent activity
- [ ] Tracking page shows list of customer's shipments with status
- [ ] Document page shows customer's invoices, rate cons, BOLs for download
- [ ] Customer cannot see other customers' data (company-scope isolation)
