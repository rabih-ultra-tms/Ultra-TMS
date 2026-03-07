# BACK-006: Check Call CRUD Completion

**Priority:** P0
**Module:** `apps/api/src/modules/tms/`
**Endpoint(s):** `POST /loads/:id/check-calls`, `GET /loads/:id/check-calls`, `PATCH /loads/:id/check-calls/:callId`

## Current State
`CreateCheckCallDto` exists in TMS DTOs. LoadsController likely has check call endpoints (referenced in imports). LoadsService has check call methods. Frontend `LoadCheckCallsTab` component exists for displaying and creating check calls on the load detail page.

## Requirements
- Verify CRUD operations for check calls (create, list, update)
- Check call fields: timestamp, location (lat/lng), status update, notes, contact method
- Auto-update load position on check call with location data
- Support scheduled check calls (reminder system)
- Link check calls to load timeline

## Acceptance Criteria
- [ ] Endpoint returns correct data shape
- [ ] Auth guards applied
- [ ] Multi-tenant filtered (tenantId + deletedAt)
- [ ] DTO validation
- [ ] Tests pass
- [ ] Check calls appear in load timeline

## Dependencies
- Prisma model: CheckCall (or embedded in Load)
- Related modules: tms/tracking, communication

## Estimated Effort
M
