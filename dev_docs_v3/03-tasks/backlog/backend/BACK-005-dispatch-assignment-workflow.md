# BACK-005: Implement Dispatch Assignment Workflow

**Priority:** P0
**Module:** `apps/api/src/modules/tms/`
**Endpoint(s):** `POST /loads/:id/assign`, `PATCH /loads/:id/status`

## Current State
`AssignCarrierDto` exists in TMS DTOs. LoadsController has assign endpoint. LoadsService has `assignCarrier` method. The dispatch board frontend component (`DispatchBoard`) needs these endpoints for carrier assignment and status transitions.

## Requirements
- Verify assign-carrier flow: select carrier, assign driver, set truck/trailer
- Status transitions: PENDING -> TENDERED -> ACCEPTED -> DISPATCHED -> AT_PICKUP -> PICKED_UP -> IN_TRANSIT -> AT_DELIVERY -> DELIVERED
- Send notifications on assignment (to carrier, to dispatcher)
- Update load tracking on status change
- Validate carrier is active and has required equipment/insurance

## Acceptance Criteria
- [ ] Endpoint returns correct data shape
- [ ] Auth guards applied
- [ ] Multi-tenant filtered (tenantId + deletedAt)
- [ ] DTO validation
- [ ] Tests pass
- [ ] Status transitions enforce valid state machine
- [ ] Carrier validation (active, insured, equipment match)

## Dependencies
- Prisma model: Load, Carrier, Driver
- Related modules: carrier, communication (notifications)

## Estimated Effort
L
