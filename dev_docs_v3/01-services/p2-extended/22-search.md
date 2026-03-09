# Service Hub: Search (22)

> **Priority:** P2 Extended | **Status:** Backend Built, Frontend Not Built
> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-09 (PST-22 tribunal)
> **Original definition:** `dev_docs/02-services/` (Search service definition)
> **Design specs:** `dev_docs/12-Rabih-design-Process/21-search/` (5 files)
> **v2 hub (historical):** N/A
> **Tribunal file:** `dev_docs_v3/05-audit/tribunal/per-service/PST-22-search.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | B- (7.5/10) |
| **Confidence** | High — code-verified via PST-22 tribunal |
| **Last Verified** | 2026-03-09 |
| **Backend** | Built — 4 controllers, 27 endpoints in `apps/api/src/modules/search/` (16 active files, 1,547 LOC) |
| **Frontend** | Not Built — no pages, no components, no hooks |
| **Tests** | 37 tests / 8 spec files / 617 LOC — good unit test coverage |
| **Infrastructure** | Elasticsearch 8.13 configured in docker-compose.yml. Kibana at localhost:5601 |
| **Priority** | P0: Fix ES tenantId gap; P1: Add RolesGuard to 2 controllers, fix deleteSynonym cross-tenant bug |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Search service definition in dev_docs |
| Design Specs | Done | 5 files in `dev_docs/12-Rabih-design-Process/21-search/` |
| Backend — Global Search | Built | `global/global-search.controller.ts` — 3 endpoints |
| Backend — Entity Search | Built | `entities/entity-search.controller.ts` — 7 entity-specific endpoints |
| Backend — Admin/Indexing | Built | `admin/admin.controller.ts` — 10 endpoints (health, indexes, synonyms, analytics, queue) |
| Backend — Saved Searches | Built | `saved/saved-searches.controller.ts` — 7 endpoints (CRUD + execute + share) |
| Backend — Elasticsearch | Built | `elasticsearch/elasticsearch.service.ts` — query/index abstraction |
| Backend — Indexing Pipeline | Built | `indexing/indexing.service.ts`, `index-manager.service.ts`, `queue-processor.service.ts` |
| Prisma Models | Done | 6 models (SavedSearch, SearchHistory, SearchIndex, SearchIndexQueue, SearchSuggestion, SearchSynonym) + 3 enums |
| Frontend Pages | Not Built | No routes exist |
| Frontend Components | Not Built | No global search bar, no results page |
| React Hooks | Not Built | No hooks in `lib/hooks/` |
| Tests | Good | 37 tests across 8 spec files (617 LOC) |
| Security | **CRITICAL GAPS** | P0: ES queries have zero tenantId filtering; 2/4 controllers missing RolesGuard; deleteSynonym cross-tenant bug |

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

### GlobalSearchController — `@Controller('search')`

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/search` | Built | Global search across entities (q, entityTypes[], limit, offset) |
| GET | `/api/v1/search/suggestions` | Built | Autocomplete suggestions (q required) |
| GET | `/api/v1/search/recent` | Built | Recent searches for current user |

### EntitySearchController — `@Controller('search')`

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/search/orders` | Built | Search orders (q, filters, sort, facets) |
| GET | `/api/v1/search/loads` | Built | Search loads |
| GET | `/api/v1/search/companies` | Built | Search companies |
| GET | `/api/v1/search/carriers` | Built | Search carriers |
| GET | `/api/v1/search/contacts` | Built | Search contacts |
| GET | `/api/v1/search/invoices` | Built | Search invoices |
| GET | `/api/v1/search/documents` | Built | Search documents |

### AdminController — `@Controller('search')`

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

### SavedSearchesController — `@Controller('searches/saved')`

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/searches/saved` | Built | List user's saved searches (own + public) |
| GET | `/api/v1/searches/saved/:id` | Built | Get saved search detail |
| POST | `/api/v1/searches/saved` | Built | Create saved search (name, entityType, filters, isPublic) |
| PUT | `/api/v1/searches/saved/:id` | Built | Update saved search |
| DELETE | `/api/v1/searches/saved/:id` | Built | Delete saved search (MANAGER/ADMIN only) |
| POST | `/api/v1/searches/saved/:id/execute` | Built | Execute saved search (runs stored query) |
| POST | `/api/v1/searches/saved/:id/share` | Built | Toggle public/private visibility |

**Total: 27 endpoints across 4 controllers (verified 100% match — PST-22 tribunal).**

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
3. **Elasticsearch Indexing:** Entities are indexed into Elasticsearch via the indexing pipeline (`indexing.service.ts`, `queue-processor.service.ts`). The `index-manager.service.ts` handles index creation, mapping management, and bulk reindexing. **NOTE:** No auto-indexing exists — no `@OnEvent` listeners, no `@Cron`/`@Interval` on the queue processor. Indexing is admin-triggered only (reindex button). See Known Issues.
4. **Saved Searches:** Users can save search criteria (name, entityType, query, filters) for reuse. Saved searches have a public/private toggle — public searches are visible to all tenant users. Users can execute a saved search directly via `POST /searches/saved/:id/execute`.
5. **Search Results:** Returned with relevance scoring from Elasticsearch, text highlights on matched fields, and faceted counts for filter refinement. Results respect `limit`/`offset` pagination.
6. **Multi-Tenant Isolation:** ~~All Elasticsearch documents include `tenantId`. Every query appends a mandatory `tenantId` filter term. No cross-tenant results are ever returned.~~ **FALSE (PST-22 P0):** ElasticsearchService has ZERO tenantId filtering in `searchGlobal()`, `searchEntity()`, and `suggest()`. Prisma-backed services (saved searches, history, synonyms, indexes) DO filter by tenantId correctly. See Known Issues #1.
7. **Admin Operations:** ADMIN-only endpoints for: reindex (rebuild index from database), index health/stats, initialize new indexes, manage search synonyms (bidirectional or directional), view search analytics (top queries, top entities, unique users), and monitor the indexing queue for failed/pending items.
8. **Synonyms:** Admins can define synonym mappings (e.g., "truck" = "trailer" = "equipment") that expand queries at search time. Synonyms can be bidirectional or have a primary term. They can be scoped to specific entity types.
9. **Suggestions/Autocomplete:** The `/search/suggestions` endpoint returns type-ahead suggestions based on partial query input, enabling instant feedback in the CommandPalette UI.
10. **Recent Searches:** The `/search/recent` endpoint returns the current user's recent search terms for quick re-execution.
11. **Entity Indexing Coverage:** QueueProcessor only handles 5/7 entity types: customers (Company where companyType='CUSTOMER'), orders, loads, carriers, documents. Contacts and invoices are NOT in the indexing pipeline — searching them returns empty results. The entity-specific field mappings are rich (e.g., carriers: legalName, dbaName, mcNumber, dotNumber, equipmentTypes, serviceStates).

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

### SearchHistory

```
SearchHistory {
  id              String (UUID, @id @default(uuid()))
  tenantId        String (FK -> Tenant)
  userId          String (FK -> User)
  query           String
  entityTypes     String[] (searched entity types)
  resultCount     Int
  executionTimeMs Int
  filters         Json?
  selectedResult  Json? (what user clicked)
  externalId      String?
  sourceSystem    String?
  customFields    Json?
  createdAt       DateTime
  deletedAt       DateTime? (soft delete)
}
```

### SearchIndex

```
SearchIndex {
  id              String (UUID, @id @default(uuid()))
  tenantId        String (FK -> Tenant)
  name            String (index name)
  entityType      SearchEntityType
  status          IndexStatus (enum)
  documentCount   Int (default: 0)
  lastReindexAt   DateTime?
  settings        Json? (index configuration)
  externalId      String?
  sourceSystem    String?
  customFields    Json?
  createdAt       DateTime
  updatedAt       DateTime
  deletedAt       DateTime? (soft delete)
}
```

### SearchIndexQueue

```
SearchIndexQueue {
  id              String (UUID, @id @default(uuid()))
  tenantId        String (FK -> Tenant)
  entityType      SearchEntityType
  entityId        String
  operation       IndexOperation (enum)
  status          String (PENDING, PROCESSING, INDEXED, FAILED)
  attempts        Int (default: 0)
  error           String?
  processedAt     DateTime?
  externalId      String?
  sourceSystem    String?
  customFields    Json?
  createdAt       DateTime
  deletedAt       DateTime? (soft delete)
}
```

### SearchSuggestion

```
SearchSuggestion {
  id              String (UUID, @id @default(uuid()))
  tenantId        String (FK -> Tenant)
  text            String (suggestion text)
  entityType      SearchEntityType?
  frequency       Int (default: 0)
  lastUsedAt      DateTime?
  externalId      String?
  sourceSystem    String?
  customFields    Json?
  createdAt       DateTime
  updatedAt       DateTime
  deletedAt       DateTime? (soft delete)
}
```

### SearchSynonym

```
SearchSynonym {
  id              String (UUID, @id @default(uuid()))
  tenantId        String (FK -> Tenant)
  terms           String[] (synonym terms)
  primaryTerm     String?
  bidirectional   Boolean (default: true)
  entityType      SearchEntityType?
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

### IndexOperation (enum)

```
IndexOperation {
  CREATE
  UPDATE
  DELETE
  REINDEX
}
```

### IndexStatus (enum)

```
IndexStatus {
  ACTIVE
  REBUILDING
  ERROR
}
```

### Elasticsearch Index Structure (not Prisma — runtime only)

```
Each entity index contains entity-specific fields:
  - customers: name, city, state, phone, status, companyType, tags, content
  - orders: orderNumber, customerId, status, commodity, equipmentType, dates
  - loads: loadNumber, orderId, carrierId, status, currentCity/State
  - carriers: legalName, dbaName, mcNumber, dotNumber, equipmentTypes, serviceStates
  - documents: name, documentType, fileName, fileExtension, mimeType
  - All include: tenantId (keyword), entityId (keyword), entityType (keyword), updatedAt (date)
  NOTE: tenantId is stored in the index but NOT used as a query filter (P0 bug)
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

9 DTOs + response DTOs in a single file (252 LOC). Well-structured with proper class-validator decorators. Minor gaps: QueueQueryDto (status, limit) and SearchAnalyticsDto not documented here.

---

## 10. Status States

### Indexing Pipeline States
```
PENDING    -> Entity change detected, queued for indexing
PROCESSING -> Queue processor picked up the item
INDEXED    -> Successfully written to Elasticsearch
FAILED     -> Indexing failed (retryable via admin reindex)
```

### Index Status
```
ACTIVE     -> Index is operational and receiving queries
REBUILDING -> Full reindex in progress
ERROR      -> Index in error state (mapping failure, ES unreachable)
```

### Saved Search Visibility
```
PRIVATE (isPublic: false) -> Only visible to the creator
PUBLIC  (isPublic: true)  -> Visible to all tenant users
```

No complex state machine — search is stateless query infrastructure. The indexing pipeline manages the data flow from Prisma to Elasticsearch.

---

## 11. Known Issues

| Issue | Severity | File | Status | Notes |
|-------|----------|------|--------|-------|
| **ES queries have ZERO tenantId filtering — cross-tenant data leakage** | **P0 CRITICAL** | `elasticsearch/elasticsearch.service.ts` | **Open** | `searchGlobal()`, `searchEntity()`, `suggest()` all omit tenantId filter. Hub previously claimed "mandatory tenantId filter" — FALSE. Any search returns results from ALL tenants. |
| EntitySearchController missing RolesGuard — @Roles decorators are decorative | P1 BUG | `entities/entity-search.controller.ts` | **Open** | Has JwtAuthGuard but no RolesGuard to enforce @Roles |
| SavedSearchesController missing RolesGuard — @Roles decorators are decorative | P1 BUG | `saved/saved-searches.controller.ts` | **Open** | Has JwtAuthGuard but no RolesGuard to enforce @Roles |
| deleteSynonym cross-tenant bug — no tenantId check on delete | P1 BUG | `admin/admin.service.ts:78` | **Open** | `prisma.searchSynonym.update({ where: { id } })` — admin can delete any tenant's synonym by ID |
| SearchHistory analytics no deletedAt filter | P2 BUG | `admin/admin.service.ts:84-104` | **Open** | `analytics()` counts don't filter `deletedAt: null`, including soft-deleted records |
| No auto-indexing — no @OnEvent listeners, no @Cron on queue processor | P2 | `indexing/` | **Open** | Indexing pipeline is admin-triggered only (reindex button). processNext() is never called automatically. |
| SearchModule exports nothing — other modules can't trigger indexing | P2 | `search.module.ts` | **Open** | No `exports` array, so IndexingService/ElasticsearchService unavailable to other modules |
| Only 5/7 entity types in indexing pipeline (contacts, invoices missing) | P2 | `indexing/queue-processor.service.ts` | **Open** | EntitySearchController exposes 7 endpoints but only 5 can be indexed |
| No frontend exists — entire UI layer missing | P1 | -- | Open | 27 backend endpoints have no consumer |
| No global search bar in app layout (Cmd+K not wired) | P1 | -- | Open | |
| No hooks — frontend has zero integration with 27 backend endpoints | P1 | -- | Open | |

**Resolved Issues (closed during PST-22 tribunal):**
- ~~Hub said "8 spec files exist, pass status unverified"~~ — VERIFIED: 37 tests, 8 specs, 617 LOC, all green
- ~~Hub data model listed 1 model~~ — CORRECTED: 6 Prisma models + 3 enums now documented
- ~~Hub claimed "All endpoints: JwtAuthGuard + RolesGuard + tenantId filtering"~~ — CORRECTED: 2/4 controllers missing RolesGuard, ES has zero tenantId filtering

---

## 12. Tasks

### P0 — Security (from PST-22 tribunal)
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| SRCH-001 | Add tenantId filter to all ElasticsearchService search queries (searchGlobal, searchEntity, suggest) | M (3h) | **P0** |
| SRCH-002 | Add RolesGuard to EntitySearchController @UseGuards | XS (15min) | P1 |
| SRCH-003 | Add RolesGuard to SavedSearchesController @UseGuards | XS (15min) | P1 |
| SRCH-004 | Add tenantId check to deleteSynonym | XS (15min) | P1 |
| SRCH-005 | Add deletedAt filter to SearchHistory analytics queries | XS (15min) | P2 |

### Infrastructure (from PST-22 tribunal)
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| SRCH-006 | Add @OnEvent listeners for entity CRUD to trigger automatic indexing | M (4h) | P2 |
| SRCH-007 | Add @Cron or @Interval to QueueProcessorService for automatic queue processing | S (1h) | P2 |
| SRCH-008 | Add contacts + invoices to QueueProcessor fetchEntity/fetchAllEntities | S (2h) | P2 |
| SRCH-009 | Export IndexingService + ElasticsearchService from SearchModule | XS (15min) | P2 |

### Frontend (Build)
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| SRCH-101 | Build GlobalSearchBar (CommandPalette) component with Cmd+K trigger | M (5h) | P2 |
| SRCH-102 | Build Search Results page (`/search?q=...`) with facets and highlights | M (4h) | P2 |
| SRCH-103 | Build Advanced Search page (`/search/advanced`) with entity-type filters | M (4h) | P2 |
| SRCH-104 | Build Saved Searches page (`/search/saved`) with CRUD | M (4h) | P2 |
| SRCH-105 | Build search hooks (useGlobalSearch, useEntitySearch, useSavedSearches, etc.) | M (3h) | P2 |
| SRCH-106 | Wire GlobalSearchBar into app layout (all dashboard pages) | S (1h) | P2 |

### Testing
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| SRCH-301 | Write integration tests for search with live Elasticsearch | M (4h) | P2 |
| SRCH-302 | Write frontend search hook tests | M (3h) | P2 |

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
| 1 data model expected | 6 Prisma models + 3 enums | Far exceeds plan |
| Frontend expected alongside backend | Zero frontend built | Behind plan |
| Tests expected | 37 tests across 8 spec files (617 LOC) | Good coverage |
| 3 design screens planned | 5 design spec files delivered | Ahead |
| Hub rated D (2/10) | Tribunal verified B- (7.5/10) | Hub was catastrophically underscored |

**Summary:** Backend is significantly more mature than originally scoped, with sophisticated admin tools, synonym management, and a queue-based indexing pipeline. The 7.5/10 score reflects strong backend infrastructure offset by zero frontend, a P0 ES tenant isolation gap, and missing auto-indexing. The previous D (2/10) score failed to account for the 27-endpoint, 6-model, 37-test backend.

---

## 15. Dependencies

**Depends on:**
- Elasticsearch 8.13 (infrastructure — docker-compose.yml)
- Auth & Admin (JWT, roles, tenantId — JwtAuthGuard on all endpoints; RolesGuard on AdminController + GlobalSearchController only)
- All searchable entities (Loads, Orders, Carriers, Companies, Contacts, Invoices, Documents — indexed into Elasticsearch)
- Prisma (6 models: SavedSearch, SearchHistory, SearchIndex, SearchIndexQueue, SearchSuggestion, SearchSynonym)

**Depended on by:**
- App Layout (global search bar / CommandPalette — Cmd+K trigger)
- Any screen with search functionality (carriers list, loads list, etc. could delegate to search service)
- Dispatch Board (quick carrier/load lookup)
- Load Planner (carrier search for assignment)

**Sub-module structure:**
```
apps/api/src/modules/search/
  admin/           -- AdminController + AdminService (health, indexes, synonyms, analytics, queue)
  dto/             -- All DTOs (GlobalSearchDto, EntitySearchDto, CreateSavedSearchDto, etc.) — 9 DTOs, 252 LOC
  elasticsearch/   -- ElasticsearchModule + ElasticsearchService (low-level ES client wrapper)
  entities/        -- EntitySearchController + EntitySearchService (per-entity search)
  global/          -- GlobalSearchController + GlobalSearchService (cross-entity search)
  indexing/        -- IndexingService, IndexManagerService, QueueProcessorService (data pipeline)
  saved/           -- SavedSearchesController + SavedSearchesService (saved search CRUD)
  search.module.ts -- Root module registering all sub-modules (exports nothing — P2 gap)
```
