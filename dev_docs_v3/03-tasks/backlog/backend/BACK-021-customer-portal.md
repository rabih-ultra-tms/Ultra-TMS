# BACK-021: Customer Portal Endpoints

**Priority:** P2
**Module:** `apps/api/src/modules/customer-portal/`
**Endpoint(s):** Portal-specific CRUD endpoints with customer-scoped auth

## Current State
Customer-portal module directory exists at `apps/api/src/modules/customer-portal/`. Separate JWT secret configured via `CUSTOMER_PORTAL_JWT_SECRET` env var. Need to verify implementation status.

## Requirements
- Customer self-service portal with separate auth flow
- View orders and shipment status
- Track loads in real-time
- View and download invoices
- Submit new order requests
- View payment history
- Contact support
- Document upload (POD requests)
- Customer-scoped data access (can only see own data)

## Acceptance Criteria
- [ ] Endpoint returns correct data shape
- [ ] Auth guards applied (CustomerPortalJwtGuard)
- [ ] Customer-scoped data access (not tenant-wide)
- [ ] DTO validation
- [ ] Tests pass
- [ ] Portal users cannot access admin data

## Dependencies
- Prisma model: Customer, Order, Load, Invoice
- Related modules: auth, tms, accounting, crm

## Estimated Effort
XL
