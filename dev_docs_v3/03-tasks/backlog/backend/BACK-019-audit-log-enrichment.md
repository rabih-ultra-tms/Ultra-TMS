# BACK-019: Audit Log Enrichment

**Priority:** P1
**Module:** `apps/api/src/modules/audit/`
**Endpoint(s):** `GET /audit-logs`, `GET /audit-logs/:entityType/:entityId`

## Current State
Audit module exists at `apps/api/src/modules/audit/`. Need to verify current implementation scope. Frontend timeline tabs on order and load detail pages consume audit/timeline data.

## Requirements
- Record all CRUD operations with: who, what, when, before/after values
- Entity-specific audit trails (load, order, invoice, carrier, customer)
- Diff computation showing changed fields
- User-friendly change descriptions (not raw field names)
- Query audit logs by entity, user, date range, action type
- Retention policy for audit data
- Performance: async logging (don't block main request)

## Acceptance Criteria
- [ ] Endpoint returns correct data shape
- [ ] Auth guards applied
- [ ] Multi-tenant filtered (tenantId + deletedAt)
- [ ] DTO validation
- [ ] Tests pass
- [ ] Audit logs capture all state changes
- [ ] Timeline tabs render enriched audit data

## Dependencies
- Prisma model: AuditLog
- Related modules: all modules (interceptor-based)

## Estimated Effort
L
