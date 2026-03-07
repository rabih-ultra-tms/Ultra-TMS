# BACK-013: Insurance Expiry Monitoring

**Priority:** P1
**Module:** `apps/api/src/modules/carrier/`
**Endpoint(s):** `GET /carriers/insurance-expiring`, `POST /carriers/:id/insurance-alert`

## Current State
Carrier module exists. Insurance data is stored on carrier profiles. Need to verify if expiry monitoring and alerting is implemented.

## Requirements
- Daily job to check insurance expiry dates across all carriers
- Alert thresholds: 30 days, 14 days, 7 days, expired
- Notification to dispatchers when assigned carrier's insurance is expiring
- Block dispatching to carriers with expired insurance
- Dashboard widget showing carriers with expiring insurance
- Email alerts to carrier contacts requesting updated COI

## Acceptance Criteria
- [ ] Endpoint returns correct data shape
- [ ] Auth guards applied
- [ ] Multi-tenant filtered (tenantId + deletedAt)
- [ ] DTO validation
- [ ] Tests pass
- [ ] Expiring insurance detected at correct thresholds
- [ ] Dispatching blocked for expired carriers

## Dependencies
- Prisma model: Carrier, CarrierInsurance
- Related modules: carrier, scheduler, communication

## Estimated Effort
M
