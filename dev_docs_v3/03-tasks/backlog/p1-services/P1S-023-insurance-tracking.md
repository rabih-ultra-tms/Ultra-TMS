# P1S-023: Insurance Tracking

**Priority:** P1
**Service:** Safety
**Scope:** Track carrier insurance policies, coverage, and expiration

## Current State
Insurance data exists on carriers (the carriers page highlights expired/expiring insurance with row colors). No dedicated insurance tracking view.

## Requirements
- Insurance policy list across all carriers
- Expiration tracking with alerts (30/60/90 day warnings)
- Coverage verification (minimum requirements met)
- Certificate of insurance (COI) document management
- Auto-notification to carriers for renewals

## Acceptance Criteria
- [ ] Insurance list with expiration dates
- [ ] Warning badges for expiring/expired policies
- [ ] Coverage amount vs minimum requirement check
- [ ] COI document upload and viewing
- [ ] Auto-notification for upcoming expirations
- [ ] Filter by status (active, expiring, expired)

## Dependencies
- Carrier insurance data model (already exists in Prisma)

## Estimated Effort
M
