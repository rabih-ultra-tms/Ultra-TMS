# BACK-025: Search Indexing Pipeline

**Priority:** P2
**Module:** `apps/api/src/modules/search/`
**Endpoint(s):** `GET /search`, `POST /search/reindex`

## Current State
Search module exists with structure: admin, dto, elasticsearch, entities, global, indexing, saved subdirectories. Elasticsearch is configured in docker-compose (ES 8.13 + Kibana). Need to verify indexing pipeline is functional and connected to entity changes.

## Requirements
- Index entities on create/update/delete (loads, orders, carriers, customers, invoices)
- Full-text search across all indexed entities
- Faceted search (filter by entity type, status, date range)
- Search suggestions / autocomplete
- Saved searches per user
- Admin reindex endpoint for bulk re-indexing
- Elasticsearch mapping management
- Index lifecycle policies

## Acceptance Criteria
- [ ] Endpoint returns correct data shape
- [ ] Auth guards applied
- [ ] Multi-tenant filtered (tenantId in index)
- [ ] DTO validation
- [ ] Tests pass
- [ ] Search returns relevant results across entities
- [ ] Indexing happens asynchronously (no blocking)

## Dependencies
- Prisma model: Various (all searchable entities)
- Related modules: all entity modules, elasticsearch

## Estimated Effort
XL
