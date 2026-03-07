# BACK-001: Wire LoadsService to Frontend

**Priority:** P0
**Module:** `apps/api/src/modules/tms/`
**Endpoint(s):** `GET /loads`, `GET /loads/:id`, `POST /loads`, `PATCH /loads/:id`, `DELETE /loads/:id`, `GET /loads/stats`, `PATCH /loads/:id/status`, `POST /loads/:id/assign`

## Current State
LoadsController and LoadsService exist with full CRUD, assign-carrier, check calls, rate confirmation, and tracking endpoints. Controller uses JwtAuthGuard. DTOs exist for CreateLoad, UpdateLoad, AssignCarrier, UpdateLoadLocation, LoadQuery, CreateCheckCall, RateConfirmationOptions. Service file is ~19KB with substantial business logic.

## Requirements
- Verify frontend hooks call the correct endpoints with correct request/response shapes
- Ensure `GET /loads` pagination response matches frontend `{ data: T[], pagination: {...} }` envelope
- Verify `GET /loads/stats` endpoint exists and returns KPI data for the loads list page
- Test assign-carrier workflow end-to-end with frontend dispatch board

## Acceptance Criteria
- [ ] Endpoint returns correct data shape
- [ ] Auth guards applied
- [ ] Multi-tenant filtered (tenantId + deletedAt)
- [ ] DTO validation
- [ ] Tests pass
- [ ] Frontend hooks receive data in expected format

## Dependencies
- Prisma model: Load, LoadStop, LoadAccessorial
- Related modules: carrier, orders, tracking

## Estimated Effort
M
