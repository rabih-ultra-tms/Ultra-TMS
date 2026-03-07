# Customer Portal Module API Spec

**Module:** `apps/api/src/modules/customer-portal/`
**Base path:** `/api/v1/`
**Controllers:** PortalAuthController, PortalDashboardController, PortalInvoicesController, PortalPaymentsController, PortalQuotesController, PortalShipmentsController, PortalUsersController
**Auth:** Separate JWT system — uses `CUSTOMER_PORTAL_JWT_SECRET` env var
**Guard:** `PortalAuthGuard` (not main `JwtAuthGuard`)
**IMPORTANT:** These are PUBLIC-FACING endpoints for customers. Separate from internal staff APIs.

---

## Authentication

**Route prefix:** `portal/auth`
**No auth guard on login/register/forgot-password (public endpoints)**

| Method | Path | Rate Limit | Description |
|--------|------|-----------|-------------|
| POST | `/portal/auth/login` | 5/min | Customer portal login |
| POST | `/portal/auth/refresh` | — | Refresh portal JWT |
| POST | `/portal/auth/logout` | PortalAuthGuard | Logout |
| POST | `/portal/auth/forgot-password` | — | Request password reset |
| POST | `/portal/auth/reset-password` | — | Reset password |
| POST | `/portal/auth/register` | — | Self-registration |
| GET | `/portal/auth/me` | PortalAuthGuard | Get current portal user |
| GET | `/portal/auth/verify/:token` | — | Verify email |

### Token difference from main app
- Portal tokens are signed with `CUSTOMER_PORTAL_JWT_SECRET`
- Portal user entity is `CustomerPortalUser` (not main `User`)
- Portal tokens should NOT work on main `/api/v1/` endpoints

---

## Dashboard

**Route prefix:** `portal/dashboard`
**Guard:** PortalAuthGuard

| Method | Path | Description |
|--------|------|-------------|
| GET | `/portal/dashboard` | Portal dashboard (shipments summary, outstanding invoices) |
| GET | `/portal/dashboard/stats` | Key stats |

---

## Invoices

**Route prefix:** `portal/invoices`
**Guard:** PortalAuthGuard

| Method | Path | Description |
|--------|------|-------------|
| GET | `/portal/invoices` | List customer's invoices |
| GET | `/portal/invoices/:id` | Get invoice |
| GET | `/portal/invoices/:id/pdf` | Download PDF |
| POST | `/portal/invoices/:id/dispute` | Dispute invoice |

---

## Payments

**Route prefix:** `portal/payments`
**Guard:** PortalAuthGuard

| Method | Path | Description |
|--------|------|-------------|
| POST | `/portal/payments` | Make payment |
| GET | `/portal/payments` | List payment history |
| GET | `/portal/payments/:id` | Get payment |

---

## Quotes

**Route prefix:** `portal/quotes`
**Guard:** PortalAuthGuard

| Method | Path | Description |
|--------|------|-------------|
| GET | `/portal/quotes` | List customer's quotes |
| POST | `/portal/quotes` | Request new quote |
| GET | `/portal/quotes/:id` | Get quote |
| POST | `/portal/quotes/:id/accept` | Accept quote |
| POST | `/portal/quotes/:id/reject` | Reject quote |

---

## Shipments

**Route prefix:** `portal/shipments`
**Guard:** PortalAuthGuard

| Method | Path | Description |
|--------|------|-------------|
| GET | `/portal/shipments` | List customer's shipments |
| GET | `/portal/shipments/:id` | Get shipment detail |
| GET | `/portal/shipments/:id/tracking` | Live tracking |
| GET | `/portal/shipments/:id/documents` | Shipment documents |

---

## Portal Users

**Route prefix:** `portal/users`
**Guard:** PortalAuthGuard

| Method | Path | Description |
|--------|------|-------------|
| GET | `/portal/users/me` | Get profile |
| PUT | `/portal/users/me` | Update profile |
| PUT | `/portal/users/me/password` | Change password |

---

## Context Note

The customer portal is a **P2 feature**. It runs as part of the same NestJS API but under the `/portal/` prefix with a different JWT secret. The portal is not linked from the main `apps/web/` Next.js app — it would be a separate frontend (or subdomain).
