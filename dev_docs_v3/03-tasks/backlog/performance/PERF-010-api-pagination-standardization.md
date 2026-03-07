# PERF-010: API Response Pagination Standardization

**Priority:** P1
**Service:** All
**Scope:** Standardize pagination across all list endpoints

## Current State
Pagination format varies across endpoints. The standard envelope is `{ data: T[], pagination: { page, limit, total, totalPages } }` but some endpoints return different shapes. Frontend hooks have workarounds to handle inconsistencies.

Example inconsistencies:
- Carrier hook manually maps `r.pagination?.total` with fallbacks
- Load hook maps to a custom `LoadListResponse` shape
- Some endpoints may not return pagination at all

## Requirements
- Audit all list endpoints for pagination consistency
- Standardize to `{ data: T[], pagination: { page, limit, total, totalPages } }`
- Default pagination (page=1, limit=25) when not specified
- Maximum page size limit (100)
- Frontend hooks simplified to use standard pagination

## Acceptance Criteria
- [ ] All list endpoints return standard pagination shape
- [ ] Default pagination applied when params missing
- [ ] Maximum page size enforced
- [ ] Frontend hooks use consistent pagination handling
- [ ] No custom workarounds needed per endpoint
- [ ] API docs updated with pagination standard

## Dependencies
- None

## Estimated Effort
M
