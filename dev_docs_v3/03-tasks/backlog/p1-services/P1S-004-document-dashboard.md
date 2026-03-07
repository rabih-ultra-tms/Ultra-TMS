# P1S-004: Document Management Dashboard

**Priority:** P1
**Service:** Documents
**Scope:** Central dashboard for managing all documents across the TMS

## Current State
Documents exist as sub-resources on carriers (carrier documents). No central document management dashboard.

## Requirements
- Dashboard showing recent documents, expiring documents, missing required documents
- Document search across all entities (carriers, loads, orders, claims)
- Filter by document type, entity type, status, date range
- Expiry tracking with warning badges
- Bulk download capability

## Acceptance Criteria
- [ ] Dashboard shows document stats (total, expiring, expired)
- [ ] Recent documents list
- [ ] Search across all document types
- [ ] Filter by type, entity, status
- [ ] Expiry warnings displayed
- [ ] Click navigates to document detail/preview

## Dependencies
- Document storage backend

## Estimated Effort
L
