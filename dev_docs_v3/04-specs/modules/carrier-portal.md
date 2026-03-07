# Carrier Portal Module API Spec

**Module:** `apps/api/src/modules/carrier-portal/`
**Base path:** `/api/v1/`
**Controllers:** CarrierPortalAuthController, CarrierPortalComplianceController, CarrierPortalDashboardController, CarrierPortalDocumentsController, CarrierPortalInvoicesController, CarrierPortalLoadsController, CarrierPortalUsersController

## Auth

Auth controller is public (no guards). All other controllers use `@UseGuards(CarrierPortalAuthGuard, CarrierScopeGuard)` with `@CarrierScope()` decorator for carrier-scoped multi-tenancy.

---

## CarrierPortalAuthController

**Path prefix:** `carrier-portal/auth`
**Auth:** None (public endpoints)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/carrier-portal/auth/login` | @Throttle(5/60s) | Carrier portal login |
| POST | `/carrier-portal/auth/refresh` | None | Refresh token |
| POST | `/carrier-portal/auth/logout` | None | Logout (uses req.carrierPortalUser) |
| POST | `/carrier-portal/auth/forgot-password` | None | Request password reset |
| POST | `/carrier-portal/auth/reset-password` | None | Reset password |
| POST | `/carrier-portal/auth/register` | None | Register carrier portal account |
| GET | `/carrier-portal/auth/verify-email/:token` | None | Verify email |

**Note:** Register uses `x-tenant-id` header or `dto.carrierId` or defaults to `'default-tenant'`.

---

## CarrierPortalComplianceController

**Path prefix:** `carrier-portal/compliance`
**Auth:** CarrierPortalAuthGuard + CarrierScopeGuard

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/carrier-portal/compliance/status` | Portal auth | Get compliance status |
| GET | `/carrier-portal/compliance/required-documents` | Portal auth | List required documents |
| POST | `/carrier-portal/compliance/upload` | Portal auth | Upload compliance document |
| GET | `/carrier-portal/compliance/documents/:id/status` | Portal auth | Get document status |
| GET | `/carrier-portal/compliance/expiring` | Portal auth | List expiring documents |

---

## CarrierPortalDashboardController

**Path prefix:** `carrier-portal/dashboard`
**Auth:** CarrierPortalAuthGuard + CarrierScopeGuard

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/carrier-portal/dashboard` | Portal auth | Get dashboard overview |
| GET | `/carrier-portal/dashboard/active-loads` | Portal auth | Get active loads |
| GET | `/carrier-portal/dashboard/payment-summary` | Portal auth | Get payment summary |
| GET | `/carrier-portal/dashboard/compliance` | Portal auth | Get compliance summary |
| GET | `/carrier-portal/dashboard/alerts` | Portal auth | Get alerts |

---

## CarrierPortalDocumentsController

**Path prefix:** `carrier-portal/documents`
**Auth:** CarrierPortalAuthGuard + CarrierScopeGuard

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/carrier-portal/documents` | Portal auth | List documents |
| POST | `/carrier-portal/documents` | Portal auth | Upload document |
| GET | `/carrier-portal/documents/:id` | Portal auth | Get document by ID |
| DELETE | `/carrier-portal/documents/:id` | Portal auth | Delete document |
| POST | `/carrier-portal/documents/pod/:loadId` | Portal auth | Upload POD for load |
| POST | `/carrier-portal/documents/load/:loadId` | Portal auth | Upload document for load |

---

## CarrierPortalInvoicesController

**Path prefix:** `carrier-portal/invoices`
**Auth:** CarrierPortalAuthGuard + CarrierScopeGuard

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | `/carrier-portal/invoices` | Portal auth | Submit invoice |
| GET | `/carrier-portal/invoices` | Portal auth | List invoices |
| GET | `/carrier-portal/invoices/:id` | Portal auth | Get invoice detail |
| GET | `/carrier-portal/invoices/settlements` | Portal auth | List settlements |
| POST | `/carrier-portal/invoices/:id/quick-pay` | Portal auth | Request quick pay |
| GET | `/carrier-portal/invoices/payment-history` | Portal auth | Get payment history |

---

## CarrierPortalLoadsController

**Path prefix:** `carrier-portal/loads`
**Auth:** CarrierPortalAuthGuard + CarrierScopeGuard

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/carrier-portal/loads/available` | Portal auth | List available loads |
| POST | `/carrier-portal/loads/save/:loadId` | Portal auth | Save load |
| POST | `/carrier-portal/loads/bid/:loadId` | Portal auth | Bid on load |
| GET | `/carrier-portal/loads/matching` | Portal auth | Get matching loads |
| GET | `/carrier-portal/loads/my` | Portal auth | List my loads |
| POST | `/carrier-portal/loads/:loadId/accept` | Portal auth | Accept load |
| POST | `/carrier-portal/loads/:loadId/decline` | Portal auth | Decline load |
| PATCH | `/carrier-portal/loads/:loadId/status` | Portal auth | Update load status |
| PATCH | `/carrier-portal/loads/:loadId/location` | Portal auth | Update location |
| PATCH | `/carrier-portal/loads/:loadId/eta` | Portal auth | Update ETA |
| POST | `/carrier-portal/loads/:loadId/message` | Portal auth | Send message about load |

---

## CarrierPortalUsersController

**Path prefix:** `carrier-portal/users`
**Auth:** CarrierPortalAuthGuard + CarrierScopeGuard

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/carrier-portal/users/profile` | Portal auth | Get user profile |
| PUT | `/carrier-portal/users/profile` | Portal auth | Update user profile |
| GET | `/carrier-portal/users/carrier` | Portal auth | Get carrier details |
| PUT | `/carrier-portal/users/carrier` | Portal auth | Update carrier details |
| GET | `/carrier-portal/users` | Portal auth | List portal users |
| POST | `/carrier-portal/users/invite` | Portal auth | Invite portal user |
| PUT | `/carrier-portal/users/:id` | Portal auth | Update portal user |
| POST | `/carrier-portal/users/:id/deactivate` | Portal auth | Deactivate portal user |

---

## Known Issues

- Auth controller logout endpoint accesses `req.carrierPortalUser?.id` without guard -- may be undefined
- Register endpoint tenant resolution is fragile (header > dto.carrierId > 'default-tenant')
