# BACK-020: Rate Intelligence Integration

**Priority:** P2
**Module:** `apps/api/src/modules/rate-intelligence/`
**Endpoint(s):** `GET /rate-intelligence/lane-rates`, `GET /rate-intelligence/market-rates`

## Current State
Rate-intelligence module directory exists at `apps/api/src/modules/rate-intelligence/`. Need to verify implementation status.

## Requirements
- Lane rate analysis (historical rates for origin-destination pairs)
- Market rate benchmarking (compare against industry averages)
- Rate recommendations for new loads based on historical data
- Seasonal rate adjustments
- Equipment type rate differentials
- Integration with external rate APIs (DAT, Greenscreens) -- future
- Rate trends visualization data for frontend

## Acceptance Criteria
- [ ] Endpoint returns correct data shape
- [ ] Auth guards applied
- [ ] Multi-tenant filtered (tenantId + deletedAt)
- [ ] DTO validation
- [ ] Tests pass
- [ ] Lane rates calculated from historical load data
- [ ] Rate recommendations are reasonable

## Dependencies
- Prisma model: Load (historical data), Lane
- Related modules: tms/loads, analytics

## Estimated Effort
XL
