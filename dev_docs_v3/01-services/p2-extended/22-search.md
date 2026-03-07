# Service Hub: Search (22)

> **Priority:** P2 Extended | **Status:** Backend Built, Frontend Not Built
> **Source of Truth** -- dev_docs_v3 era | Last verified: 2026-03-07
> **Original definition:** `dev_docs/02-services/` (Search service definition)
> **Design specs:** `dev_docs/12-Rabih-design-Process/21-search/` (5 files)
> **v2 hub (historical):** N/A

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | D (2/10) |
| **Confidence** | High -- controllers and spec files verified 2026-03-07 |
| **Last Verified** | 2026-03-07 |
| **Backend** | Built -- 4 controllers, 27 endpoints in `apps/api/src/modules/search/` |
| **Frontend** | Not Built -- no pages, no components, no hooks |
| **Tests** | Partial -- 8 spec files exist (admin, elasticsearch, entity-search, global-search, index-manager, indexing, queue-processor, saved-searches) |
| **Infrastructure** | Elasticsearch 8.13 configured in docker-compose.yml. Kibana at localhost:5601 |
| **Active Blockers** | Entire frontend layer missing; Elasticsearch indices may not be fully populated |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Search service definition in dev_docs |
| Design Specs | Done | 5 files in `dev_docs/12-Rabih-design-Process/21-search/` |
| Backend -- Global Search | Built | `global/global-search.controller.ts` -- 3 endpoints |
| Backend -- Entity Search | Built | `entities/entity-search.controller.ts` -- 7 entity-specific endpoints |
| Backend -- Admin/Indexing | Built | `admin/admin.controller.ts` -- 10 endpoints (health, indexes, synonyms, analytics, queue) |
| Backend -- Saved Searches | Built | `saved/saved-searches.controller.ts` -- 7 endpoints (CRUD + execute + share) |
| Backend -- Elasticsearch | Built | `elasticsearch/elasticsearch.service.ts` -- query/index abstraction |
| Backend -- Indexing Pipeline | Built | `indexing/indexing.service.ts`, `index-manager.service.ts`, `queue-processor.service.ts` |
| Prisma Models | Done | `SavedSearch` model with SearchEntityType enum |
| Frontend Pages | Not Built | No routes exist |
| Frontend Components | Not Built | No global search bar, no results page |
| React Hooks | Not Built | No hooks in `lib/hooks/` |
| Tests | Partial | 8 backend spec files; 0 frontend tests |
| Security | Good | All endpoints: JwtAuthGuard + RolesGuard + tenantId filtering |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| Global Search (command palette) | Triggered by Cmd+K / Ctrl+K | Not Built | -- | Cross-entity search overlay |
| Search Results | `/search?q=...` | Not Built | -- | Full results page with facets |
| Advanced Search | `/search/advanced` | Not Built | -- | Filtered search per entity type |
| Saved Searches | `/search/saved` | Not Built | -- | List/manage saved search criteria |
| Search Settings (Admin) | `/settings/search` | Not Built | -- | Index management, synonyms, analytics |

---

## 4. API Endpoints

### GlobalSearchController -- `@Controller('search')`

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/search` | Built | Global search across entities (q, entityTypes[], limit, offset) |
| GET | `/api/v1/search/suggestions` | Built | Autocomplete suggestions (q required) |
| GET | `/api/v1/search/recent` | Built | Recent searches for current user |

### EntitySearchController -- `@Controller('search')`

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/search/orders` | Built | Search orders (q, filters, sort, facets) |
| GET | `/api/v1/search/loads` | Built | Search loads |
| GET | `/api/v1/search/companies` | Built | Search companies |
| GET | `/api/v1/search/carriers` | Built | Search carriers |
| GET | `/api/v1/search/contacts` | Built | Search contacts |
| GET | `/api/v1/search/invoices` | Built | Search invoices |
| GET | `/api/v1/search/documents` | Built | Search documents |

### AdminController -- `@Controller('search')`

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/search/health` | Built | Elasticsearch cluster health check |
| GET | `/api/v1/search/indexes` | Built | List all search indexes for tenant |
| POST | `/api/v1/search/indexes/:name/reindex` | Built | Trigger full reindex of named index |
| GET | `/api/v1/search/indexes/:name/status` | Built | Get index document count, size, mapping |
| POST | `/api/v1/search/indexes/:name/init` | Built | Initialize/ensure index exists with mapping |
| GET | `/api/v1/search/synonyms` | Built | List search synonyms |
| POST | `/api/v1/search/synonyms` | Built | Create synonym (terms[], bidirectional, primaryTerm) |
| DELETE | `/api/v1/search/synonyms/:id` | Built | Delete synonym |
| GET | `/api/v1/search/analytics` | Built | Search usage analytics (top queries, top entities) |
| GET | `/api/v1/search/queue` | Built | Indexing queue status (pending/failed items) |

### SavedSearchesController -- `@Controller('searches/saved')`

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/searches/saved` | Built | List user's saved searches (own + public) |
| GET | `/api/v1/searches/saved/:id` | Built | Get saved search detail |
| POST | `/api/v1/searches/saved` | Built | Create saved search (name, entityType, filters, isPublic) |
| PUT | `/api/v1/searches/saved/:id` | Built | Update saved search |
| DELETE | `/api/v1/searches/saved/:id` | Built | Delete saved search (MANAGER/ADMIN only) |
| POST | `/api/v1/searches/saved/:id/execute` | Built | Execute saved search (runs stored query) |
| POST | `/api/v1/searches/saved/:id/share` | Built | Toggle public/private visibility |

**Total: 27 endpoints across 4 controllers.**

---

## 5. Components

| Component | Path | Status | Shared? |
|-----------|------|--------|---------|
| GlobalSearchBar (CommandPalette) | -- | Not Built | Yes (layout-level) |
| SearchResultCard | -- | Not Built | No |
| SearchFacetPanel | -- | Not Built | No |
| SavedSearchList | -- | Not Built | No |
| SearchHighlight | -- | Not Built | No |
| EntityTypeIcon | -- | Not Built | Yes |

No frontend components exist. All are planned based on design specs.

---

## 6. Hooks

| Hook | Endpoints Used | Envelope Unwrapped? | Notes |
|------|---------------|---------------------|-------|
| `useGlobalSearch` | GET `/search` | -- | Not Built |
| `useSearchSuggestions` | GET `/search/suggestions` | -- | Not Built |
| `useRecentSearches` | GET `/search/recent` | -- | Not Built |
| `useEntitySearch` | GET `/search/:entityType` | -- | Not Built |
| `useSavedSearches` | GET `/searches/saved` | -- | Not Built |
| `useCreateSavedSearch` | POST `/searches/saved` | -- | Not Built |
| `useExecuteSavedSearch` | POST `/searches/saved/:id/execute` | -- | Not Built |

No hooks exist. All listed above are planned.

---

## 7. Business Rules

1. **Global Search:** Searches across loads, orders, carriers, companies, contacts, invoices, and documents simultaneously. Results are aggregated, scored by relevance, and grouped by entity type. The `entityTypes[]` query parameter allows filtering to specific entity types.
2. **Entity Search:** Filtered search within a specific entity type. Supports advanced filters via `filters` object, sort field/direction, pagination (limit/offset), and faceted aggregations via `facets[]` parameter.
3. **Elasticsearch Indexing:** Entities are indexed into Elasticsearch on create/update/delete events via the indexing pipeline (`indexing.service.ts`, `queue-processor.service.ts`). The `index-manager.service.ts` handles index creation, mapping management, and bulk reindexing.
4. **Saved Searches:** Users can save search criteria (name, entityType, query, filters) for reuse. Saved searches have a public/private toggle -- public searches are visible to all tenant users. Users can execute a saved search directly via `POST /searches/saved/:id/execute`.
5. **Search Results:** Returned with relevance scoring from Elasticsearch, text highlights on matched fields, and faceted counts for filter refinement. Results respect `limit`/`offset` pagination.
6. **Multi-Tenant Isolation:** All Elasticsearch documents include `tenantId`. Every query appends a mandatory `tenantId` filter term. No cross-tenant results are ever returned. Admin operations (reindex, index stats) are also scoped to the current tenant.
7. **Admin Operations:** ADMIN-only endpoints for: reindex (rebuild index from database), index health/stats, initialize new indexes, manage search synonyms (bidirectional or directional), view search analytics (top queries, top entities, unique users), and monitor the indexing queue for failed/pending items.
8. **Synonyms:** Admins can define synonym mappings (e.g., "truck" = "trailer" = "equipment") that expand queries at search time. Synonyms can be bidirectional or have a primary term. They can be scoped to specific entity types.
9. **Suggestions/Autocomplete:** The `/search/suggestions` endpoint returns type-ahead suggestions based on partial query input, enabling instant feedback in the CommandPalette UI.
10. **Recent Searches:** The `/search/recent` endpoint returns the current user's recent search terms for quick re-execution.

---

## 8. Data Model

### SavedSearch
```
SavedSearch {
  id              String (UUID, @id @default(uuid()))
  tenantId        String (FK -> Tenant)
  userId          String (FK -> User)
  name            String
  description     String?
  entityType      SearchEntityType (enum)
  query           Json
  filters         Json (default: "{}")
  isPublic        Boolean (default: false)
  externalId      String?
  sourceSystem    String?
  customFields    Json?
  createdAt       DateTime
  updatedAt       DateTime
  deletedAt       DateTime? (soft delete)
}
```

### SearchEntityType (enum)
```
SearchEntityType {
  LOAD
  ORDER
  CARRIER
  COMPANY
  CONTACT
  INVOICE
  DOCUMENT
}
```

### Elasticsearch Index Structure (not Prisma -- runtime only)
```
Each entity index contains:
  - tenantId (keyword, mandatory filter)
  - entityId (keyword, links back to Prisma record)
  - entityType (keyword)
  - searchableText (text, analyzed for full-text search)
  - entity-specific fields (varies by index)
  - updatedAt (date, for recency scoring)
```

---

## 9. Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| GlobalSearchDto `q` | `@IsString()`, `@MinLength(2)` | "Query must be at least 2 characters" |
| GlobalSearchDto `limit` | `@IsInt()`, `@Min(1)`, `@Max(100)` | "Limit must be between 1 and 100" |
| GlobalSearchDto `offset` | `@IsInt()`, `@Min(0)` | "Offset must be non-negative" |
| EntitySearchDto `filters` | `@IsObject()` (optional) | "Filters must be a valid object" |
| EntitySearchDto `sortDirection` | `@IsIn(['ASC', 'DESC'])` | "Sort direction must be ASC or DESC" |
| CreateSavedSearchDto `name` | `@IsString()` (required) | "Name is required" |
| CreateSavedSearchDto `entityType` | `@IsEnum(SearchEntityType)` | "Invalid entity type" |
| CreateSynonymDto `terms` | `@IsArray()`, `@ArrayMinSize(2)`, `@IsString({ each: true })` | "At least 2 synonym terms required" |
| ShareSavedSearchDto `isPublic` | `@IsBoolean()` (required) | "isPublic flag is required" |

---

## 10. Status States

### Indexing Pipeline States
```
PENDING   -> Entity change detected, queued for indexing
PROCESSING -> Queue processor picked up the item
INDEXED   -> Successfully written to Elasticsearch
FAILED    -> Indexing failed (retryable via admin reindex)
```

### Saved Search Visibility
```
PRIVATE (isPublic: false) -> Only visible to the creator
PUBLIC  (isPublic: true)  -> Visible to all tenant users
```

No complex state machine -- search is stateless query infrastructure. The indexing pipeline manages the data flow from Prisma to Elasticsearch.

---

## 11. Known Issues

| Issue | Severity | File | Status |
|-------|----------|------|--------|
| No frontend exists -- entire UI layer missing | P1 | -- | Open |
| Elasticsearch indices may not be populated (no verification of indexing pipeline at runtime) | P1 | `indexing/` | Needs verification |
| No global search bar in app layout (Cmd+K not wired) | P1 | -- | Open |
| No hooks -- frontend has zero integration with 27 backend endpoints | P1 | -- | Open |
| Admin index operations not verified at runtime | P2 | `admin/admin.controller.ts` | Needs verification |
| Synonym management not tested end-to-end | P2 | `admin/admin.service.ts` | Open |
| Queue processor error handling/retry logic unverified | P2 | `indexing/queue-processor.service.ts` | Needs verification |
| Search analytics data collection mechanism unclear | P3 | `admin/admin.service.ts` | Open |

---

## 12. Tasks

### Immediate (Build Frontend)
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| SRCH-101 | Build GlobalSearchBar (CommandPalette) component with Cmd+K trigger | M (5h) | P2 |
| SRCH-102 | Build Search Results page (`/search?q=...`) with facets and highlights | M (4h) | P2 |
| SRCH-103 | Build Advanced Search page (`/search/advanced`) with entity-type filters | M (4h) | P2 |
| SRCH-104 | Build Saved Searches page (`/search/saved`) with CRUD | M (4h) | P2 |
| SRCH-105 | Build search hooks (useGlobalSearch, useEntitySearch, useSavedSearches, etc.) | M (3h) | P2 |
| SRCH-106 | Wire GlobalSearchBar into app layout (all dashboard pages) | S (1h) | P2 |

### Infrastructure Verification
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| SRCH-201 | Verify Elasticsearch indices are created and populated at runtime | S (2h) | P1 |
| SRCH-202 | Verify indexing pipeline triggers on entity CRUD events | M (3h) | P1 |
| SRCH-203 | Verify queue processor retry/error handling | S (2h) | P2 |

### Testing
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| SRCH-301 | Run existing 8 spec files, verify all pass | S (1h) | P1 |
| SRCH-302 | Write integration tests for search with live Elasticsearch | M (4h) | P2 |
| SRCH-303 | Write frontend search hook tests | M (3h) | P2 |

### Admin UI
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| SRCH-401 | Build Search Settings admin page (index management, synonyms, analytics) | L (6h) | P3 |

---

## 13. Design Links

| Screen | Spec | Path |
|--------|------|------|
| Service Overview | Full spec | `dev_docs/12-Rabih-design-Process/21-search/00-service-overview.md` |
| Global Search | Full 15-section | `dev_docs/12-Rabih-design-Process/21-search/01-global-search.md` |
| Advanced Search | Full 15-section | `dev_docs/12-Rabih-design-Process/21-search/02-advanced-search.md` |
| Saved Searches | Full 15-section | `dev_docs/12-Rabih-design-Process/21-search/03-saved-searches.md` |
| Search Settings | Full 15-section | `dev_docs/12-Rabih-design-Process/21-search/04-search-settings.md` |

---

## 14. Delta vs Original Plan

| Original Plan | Actual | Delta |
|--------------|--------|-------|
| Basic global search (4 endpoints) | 27 endpoints across 4 controllers | Far exceeds plan |
| Single controller | 4 controllers (global, entity, admin, saved) | Better modularity |
| No saved searches | Full saved search CRUD + execute + share | Ahead of plan |
| No admin tools | Admin controller with reindex, synonyms, analytics, queue | Ahead of plan |
| Elasticsearch basic | Full indexing pipeline with queue processor and index manager | Exceeds plan |
| Frontend expected alongside backend | Zero frontend built | Behind plan |
| Tests expected | 8 spec files exist but pass status unverified | Partial |
| 3 design screens planned | 5 design spec files delivered | Ahead |

**Summary:** Backend is significantly more mature than originally scoped, with sophisticated admin tools, synonym management, and a queue-based indexing pipeline. However, the D (2/10) health score reflects that zero frontend exists -- the 27 backend endpoints have no consumer.

---

## 15. Dependencies

**Depends on:**
- Elasticsearch 8.13 (infrastructure -- docker-compose.yml)
- Auth & Admin (JWT, roles, tenantId -- JwtAuthGuard + RolesGuard on all endpoints)
- All searchable entities (Loads, Orders, Carriers, Companies, Contacts, Invoices, Documents -- indexed into Elasticsearch)
- Prisma (SavedSearch model for persisting saved search criteria)

**Depended on by:**
- App Layout (global search bar / CommandPalette -- Cmd+K trigger)
- Any screen with search functionality (carriers list, loads list, etc. could delegate to search service)
- Dispatch Board (quick carrier/load lookup)
- Load Planner (carrier search for assignment)

**Sub-module structure:**
```
apps/api/src/modules/search/
  admin/           -- AdminController + AdminService (health, indexes, synonyms, analytics, queue)
  dto/             -- All DTOs (GlobalSearchDto, EntitySearchDto, CreateSavedSearchDto, etc.)
  elasticsearch/   -- ElasticsearchModule + ElasticsearchService (low-level ES client wrapper)
  entities/        -- EntitySearchController + EntitySearchService (per-entity search)
  global/          -- GlobalSearchController + GlobalSearchService (cross-entity search)
  indexing/        -- IndexingService, IndexManagerService, QueueProcessorService (data pipeline)
  saved/           -- SavedSearchesController + SavedSearchesService (saved search CRUD)
  search.module.ts -- Root module registering all sub-modules
```
