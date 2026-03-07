# BACK-023: Bulk Operations Support

**Priority:** P1
**Module:** Multiple modules
**Endpoint(s):** `POST /loads/bulk-status`, `POST /invoices/bulk-send`, `POST /settlements/bulk-approve`, `DELETE /*/bulk`

## Current State
No bulk operation endpoints verified. Frontend list pages have row selection (checkbox column) implemented but no bulk action handlers. Orders list, invoices list, payments list, and settlements list all support row selection.

## Requirements
- Bulk status change for loads (e.g., mark multiple as DISPATCHED)
- Bulk invoice send (send multiple invoices at once)
- Bulk settlement approval (approve multiple settlements)
- Bulk delete with soft-delete
- Transaction safety (all-or-nothing or report partial failures)
- Progress feedback for large batches
- Rate limiting to prevent abuse

## Acceptance Criteria
- [ ] Endpoint returns correct data shape (success count, failure details)
- [ ] Auth guards applied
- [ ] Multi-tenant filtered (tenantId + deletedAt)
- [ ] DTO validation (array of IDs)
- [ ] Tests pass
- [ ] Transaction rollback on failure
- [ ] Row selection on frontend triggers bulk actions

## Dependencies
- Prisma model: Various
- Related modules: tms, accounting

## Estimated Effort
M
