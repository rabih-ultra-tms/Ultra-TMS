# BACK-011: Load Board Posting Workflow

**Priority:** P0
**Module:** `apps/api/src/modules/load-board/`
**Endpoint(s):** `POST /load-board/postings`, `GET /load-board/postings`, `GET /load-board/postings/search`, `PATCH /load-board/postings/:id`

## Current State
Load board module has extensive structure: posting, services (load-postings, load-bids, load-tenders, geocoding), controllers, accounts, analytics, capacity, leads, rules subdirectories. Frontend has dashboard, post, and search pages. Need to verify end-to-end posting workflow.

## Requirements
- Create posting from existing load or standalone
- Posting fields: origin, destination, equipment, rate range, dates, contact info
- Search/filter postings by lane, equipment, date, rate
- Bid management (carrier bids on postings)
- Tender flow (broker tenders load to carrier)
- Posting expiry and auto-removal
- Geocoding for origin/destination

## Acceptance Criteria
- [ ] Endpoint returns correct data shape
- [ ] Auth guards applied
- [ ] Multi-tenant filtered (tenantId + deletedAt)
- [ ] DTO validation
- [ ] Tests pass
- [ ] Posting workflow end-to-end functional
- [ ] Search returns relevant results

## Dependencies
- Prisma model: LoadPosting, LoadBid, LoadTender
- Related modules: tms/loads, carrier, load-board/geocoding

## Estimated Effort
L
