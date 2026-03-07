# BACK-022: Carrier Portal Endpoints

**Priority:** P2
**Module:** `apps/api/src/modules/carrier-portal/`
**Endpoint(s):** Portal-specific CRUD endpoints with carrier-scoped auth

## Current State
Carrier-portal module directory exists at `apps/api/src/modules/carrier-portal/`. Separate JWT secret configured via `CARRIER_PORTAL_JWT_SECRET` env var. Need to verify implementation status.

## Requirements
- Carrier self-service portal with separate auth flow
- View assigned loads and accept/decline tenders
- Submit check calls and location updates
- Upload documents (BOL, POD, COI)
- View settlements and payment history
- Update company profile and insurance information
- View load board postings and submit bids
- Carrier-scoped data access (can only see own data)

## Acceptance Criteria
- [ ] Endpoint returns correct data shape
- [ ] Auth guards applied (CarrierPortalJwtGuard)
- [ ] Carrier-scoped data access (not tenant-wide)
- [ ] DTO validation
- [ ] Tests pass
- [ ] Portal users cannot access broker-side data

## Dependencies
- Prisma model: Carrier, Load, Settlement, Document
- Related modules: auth, tms, accounting, carrier, load-board

## Estimated Effort
XL
