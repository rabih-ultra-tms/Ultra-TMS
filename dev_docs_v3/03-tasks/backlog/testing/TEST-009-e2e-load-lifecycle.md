# TEST-009: E2E Test for Load Lifecycle

**Priority:** P1
**Service:** TMS Core
**Scope:** End-to-end test for the full load lifecycle: create order -> dispatch -> deliver -> invoice

## Current State
The load lifecycle spans multiple services (Orders, Loads, Dispatch, Accounting). Backend services exist but the full flow has never been tested end-to-end. Frontend pages exist for loads and invoices.

## Requirements
- Test full lifecycle: Create Order -> Create Load from Order -> Assign Carrier -> Dispatch -> Check Calls -> Deliver -> Create Invoice
- Use Playwright for browser automation
- Test status transitions at each step
- Verify data flows between services correctly

## Acceptance Criteria
- [ ] Order creation tested
- [ ] Load created from order with pre-filled data
- [ ] Carrier assignment tested
- [ ] Status progression (PENDING -> DISPATCHED -> IN_TRANSIT -> DELIVERED) tested
- [ ] Invoice generation from delivered load tested
- [ ] Full cycle completes without errors
- [ ] Test runs in CI with Playwright

## Dependencies
- Backend endpoints must all be functional
- Playwright browser infrastructure (INFRA-001)

## Estimated Effort
XL
