# Search Module API Spec

**Module:** `apps/api/src/modules/search/`
**Base path:** `/api/v1/`
**Controllers:** GlobalSearchController, EntitySearchController, AdminController, SavedSearchesController
**Auth:** `JwtAuthGuard` + `RolesGuard`
**Scope:** P1

---

## GlobalSearchController

**Route prefix:** `search`

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/search` | Global search across all entities | ADMIN, OPERATIONS_MANAGER, DISPATCHER, SALES_REP, ACCOUNTING, CARRIER_MANAGER, AGENT |
| GET | `/search/suggestions` | Get search suggestions (requires `q` param) | Same as above |
| GET | `/search/recent` | Get recent searches for current user | Same as above |

**DTOs:** GlobalSearchDto (query params: `q`, plus pagination/filter options)

**Notes:**
- Searches across orders, loads, carriers, contacts, invoices, documents simultaneously
- Returns grouped results by entity type
- Suggestions endpoint provides typeahead/autocomplete results
- Recent searches are per-user and per-tenant

---

## EntitySearchController

**Route prefix:** `search`

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/search/orders` | Search orders | VIEWER, USER, MANAGER, ADMIN |
| GET | `/search/loads` | Search loads | VIEWER, USER, MANAGER, ADMIN |
| GET | `/search/companies` | Search companies | VIEWER, USER, MANAGER, ADMIN |
| GET | `/search/carriers` | Search carriers | VIEWER, USER, MANAGER, ADMIN |
| GET | `/search/contacts` | Search contacts | VIEWER, USER, MANAGER, ADMIN |
| GET | `/search/invoices` | Search invoices | VIEWER, USER, MANAGER, ADMIN |
| GET | `/search/documents` | Search documents | VIEWER, USER, MANAGER, ADMIN |

**DTOs:** EntitySearchDto (query params: `q`, plus entity-specific filters)

**Notes:**
- All endpoints delegate to `EntitySearchService.search()` with entity type parameter
- 7 entity types supported for targeted search
- Broader role access (VIEWER included) compared to global search

---

## AdminController (Search Administration)

**Route prefix:** `search`

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/search/health` | Check search service health | ADMIN |
| GET | `/search/indexes` | List search indexes | ADMIN |
| POST | `/search/indexes/:name/reindex` | Trigger reindex for named index | ADMIN |
| GET | `/search/indexes/:name/status` | Get index status | ADMIN |
| POST | `/search/indexes/:name/init` | Initialize a search index | ADMIN |
| GET | `/search/synonyms` | List search synonyms | ADMIN |
| POST | `/search/synonyms` | Create a synonym mapping | ADMIN |
| DELETE | `/search/synonyms/:id` | Delete a synonym mapping | ADMIN |
| GET | `/search/analytics` | Get search analytics (top queries, no-results) | ADMIN |
| GET | `/search/queue` | Get search indexing queue status | ADMIN |

**DTOs:** CreateSynonymDto, QueueQueryDto

**Notes:**
- Admin-only endpoints for managing Elasticsearch indexes
- Supports index lifecycle: init, status check, reindex
- Synonym management for improving search quality
- Analytics endpoint tracks popular queries and zero-result queries
- Queue status shows pending indexing operations

---

## SavedSearchesController

**Route prefix:** `searches/saved`

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/searches/saved` | List saved searches for current user | VIEWER, USER, MANAGER, ADMIN |
| GET | `/searches/saved/:id` | Get saved search by ID | VIEWER, USER, MANAGER, ADMIN |
| POST | `/searches/saved` | Create saved search | USER, MANAGER, ADMIN |
| PUT | `/searches/saved/:id` | Update saved search | USER, MANAGER, ADMIN |
| DELETE | `/searches/saved/:id` | Delete saved search | MANAGER, ADMIN |
| POST | `/searches/saved/:id/execute` | Execute saved search | USER, MANAGER, ADMIN |
| POST | `/searches/saved/:id/share` | Share saved search with other users | USER, MANAGER, ADMIN |

**DTOs:** CreateSavedSearchDto, UpdateSavedSearchDto, ShareSavedSearchDto

**Notes:**
- Saved searches store query + filters for quick re-execution
- Sharing allows team collaboration on common search patterns
- Delete restricted to MANAGER+ (prevent accidental removal of shared searches)
- Execute re-runs the saved query with current data

---

## Architecture Notes

- **4 controllers** with 27 endpoints total
- Depends on Elasticsearch for full-text search (configured via `ELASTICSEARCH_URL` env)
- All controllers share the `search` route prefix but handle different aspects
- Potential route conflict: `GET /search/health` vs `GET /search` -- ordering matters
- Search module is a **@Global()** dependency -- other modules inject search services for indexing on entity changes
- Indexing queue processes document changes asynchronously via Bull/Redis
