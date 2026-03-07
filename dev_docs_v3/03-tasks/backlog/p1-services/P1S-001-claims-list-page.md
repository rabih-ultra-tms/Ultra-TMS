# P1S-001: Claims List Page

**Priority:** P1
**Service:** Claims
**Scope:** Build the claims list page with filtering, pagination, and status tracking

## Current State
No claims module exists in the frontend. Backend module may exist in `apps/api/src/modules/`.

## Requirements
- List page showing all claims with status, amount, dates
- Filter by status (Open, In Progress, Resolved, Denied)
- Filter by claim type (Cargo Damage, Loss, Delay, Overcharge)
- Search by claim number, customer, carrier
- Pagination with 25 items per page

## Acceptance Criteria
- [ ] Claims list renders with columns: Claim #, Type, Status, Amount, Filed Date, Customer, Carrier
- [ ] Filters work correctly
- [ ] Pagination works
- [ ] Loading/error/empty states handled
- [ ] Row click navigates to detail page

## Dependencies
- Claims backend module

## Estimated Effort
M
