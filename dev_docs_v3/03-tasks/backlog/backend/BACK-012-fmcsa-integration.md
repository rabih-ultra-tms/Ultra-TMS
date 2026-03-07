# BACK-012: FMCSA Data Integration

**Priority:** P1
**Module:** `apps/api/src/modules/carrier/`
**Endpoint(s):** `POST /carriers/:id/fmcsa-verify`, `GET /carriers/:id/fmcsa-data`

## Current State
Carrier module exists at `apps/api/src/modules/operations/carriers/`. Need to verify if FMCSA integration endpoints exist. The integration-hub module may have relevant connectors.

## Requirements
- Query FMCSA SAFER system for carrier data (MC#, DOT#)
- Auto-populate carrier profile from FMCSA data
- Verify carrier authority status (active, revoked, pending)
- Check insurance on file with FMCSA
- Schedule periodic re-verification
- Cache FMCSA responses to reduce API calls

## Acceptance Criteria
- [ ] Endpoint returns correct data shape
- [ ] Auth guards applied
- [ ] Multi-tenant filtered (tenantId + deletedAt)
- [ ] DTO validation
- [ ] Tests pass
- [ ] FMCSA data populates carrier profile
- [ ] Authority status verified correctly

## Dependencies
- Prisma model: Carrier, CarrierInsurance
- Related modules: integration-hub, carrier, cache

## Estimated Effort
L
