# PST-22: Search Service Tribunal Audit

> **Date:** 2026-03-09
> **Auditor:** Claude Opus 4.6
> **Hub file:** `dev_docs_v3/01-services/p2-extended/22-search.md`
> **Backend:** `apps/api/src/modules/search/` (16 active files, 1,547 LOC)
> **Tests:** 8 spec files, 37 test cases, 617 LOC

---

## Phase 1: Endpoint Verification

### AdminController — `@Controller('search')` — 10 endpoints

| # | Method | Path | Hub | Code | Match |
|---|--------|------|-----|------|-------|
| 1 | GET | /search/health | ✓ | ✓ | ✓ |
| 2 | GET | /search/indexes | ✓ | ✓ | ✓ |
| 3 | POST | /search/indexes/:name/reindex | ✓ | ✓ | ✓ |
| 4 | GET | /search/indexes/:name/status | ✓ | ✓ | ✓ |
| 5 | POST | /search/indexes/:name/init | ✓ | ✓ | ✓ |
| 6 | GET | /search/synonyms | ✓ | ✓ | ✓ |
| 7 | POST | /search/synonyms | ✓ | ✓ | ✓ |
| 8 | DELETE | /search/synonyms/:id | ✓ | ✓ | ✓ |
| 9 | GET | /search/analytics | ✓ | ✓ | ✓ |
| 10 | GET | /search/queue | ✓ | ✓ | ✓ |

### GlobalSearchController — `@Controller('search')` — 3 endpoints

| # | Method | Path | Hub | Code | Match |
|---|--------|------|-----|------|-------|
| 11 | GET | /search | ✓ | ✓ | ✓ |
| 12 | GET | /search/suggestions | ✓ | ✓ | ✓ |
| 13 | GET | /search/recent | ✓ | ✓ | ✓ |

### EntitySearchController — `@Controller('search')` — 7 endpoints

| # | Method | Path | Hub | Code | Match |
|---|--------|------|-----|------|-------|
| 14 | GET | /search/orders | ✓ | ✓ | ✓ |
| 15 | GET | /search/loads | ✓ | ✓ | ✓ |
| 16 | GET | /search/companies | ✓ | ✓ | ✓ |
| 17 | GET | /search/carriers | ✓ | ✓ | ✓ |
| 18 | GET | /search/contacts | ✓ | ✓ | ✓ |
| 19 | GET | /search/invoices | ✓ | ✓ | ✓ |
| 20 | GET | /search/documents | ✓ | ✓ | ✓ |

### SavedSearchesController — `@Controller('searches/saved')` — 7 endpoints

| # | Method | Path | Hub | Code | Match |
|---|--------|------|-----|------|-------|
| 21 | GET | /searches/saved | ✓ | ✓ | ✓ |
| 22 | GET | /searches/saved/:id | ✓ | ✓ | ✓ |
| 23 | POST | /searches/saved | ✓ | ✓ | ✓ |
| 24 | PUT | /searches/saved/:id | ✓ | ✓ | ✓ |
| 25 | DELETE | /searches/saved/:id | ✓ | ✓ | ✓ |
| 26 | POST | /searches/saved/:id/execute | ✓ | ✓ | ✓ |
| 27 | POST | /searches/saved/:id/share | ✓ | ✓ | ✓ |

**Endpoint count: 27 = 27 (10th PERFECT MATCH). Paths ~100% accurate. Methods 100% accurate.**

---

## Phase 2: Data Model Verification

### Hub claims: 1 Prisma model (SavedSearch) + 1 enum (SearchEntityType)

### Actual Prisma models: 6

| Model | Hub | Code | Fields | Notes |
|-------|-----|------|--------|-------|
| SavedSearch | ✓ | ✓ | 14 | Hub ~95% accurate |
| SearchHistory | ✗ | ✓ | 14 | **UNDOCUMENTED** — stores every search for analytics + recent |
| SearchIndex | ✗ | ✓ | 14 | **UNDOCUMENTED** — tracks ES index metadata per tenant |
| SearchIndexQueue | ✗ | ✓ | 14 | **UNDOCUMENTED** — queue items for async indexing pipeline |
| SearchSuggestion | ✗ | ✓ | 14 | **UNDOCUMENTED** — autocomplete suggestions with frequency |
| SearchSynonym | ✗ | ✓ | 13 | **UNDOCUMENTED** — synonym mappings (hub mentions synonyms in business rules but not in data model) |

**Hub documents 1 model. Reality: 6 models. 5 missing (83% undocumented).**

### Actual enums: 3

| Enum | Hub | Code | Values |
|------|-----|------|--------|
| SearchEntityType | ✓ | ✓ | 7: ORDERS, LOADS, COMPANIES, CARRIERS, CONTACTS, INVOICES, DOCUMENTS |
| IndexOperation | ✗ | ✓ | 4: CREATE, UPDATE, DELETE, REINDEX |
| IndexStatus | ✗ | ✓ | 3: ACTIVE, REBUILDING, ERROR |

**Hub documents 1 enum. Reality: 3 enums. 2 missing.**

### Hub data model for SavedSearch
- Fields: ~95% accurate. Hub lists `query: Json` but actual field stores `{ q: string }` structure
- Hub mentions `createdById`/`updatedById` not present — **they ARE in Prisma** ✓
- `customFields` present in Prisma but hub only lists it for migration fields

### Hub Section 10 (Elasticsearch Index Structure)
- Hub describes generic structure (tenantId, entityId, entityType, searchableText, updatedAt)
- **Reality:** QueueProcessorService.mapDocument() shows rich entity-specific mappings:
  - customers: name, city, state, phone, status, companyType, tags, content
  - orders: orderNumber, customerId, status, commodity, equipmentType, dates
  - loads: loadNumber, orderId, carrierId, status, currentCity/State
  - carriers: legalName, dbaName, mcNumber, dotNumber, equipmentTypes, serviceStates
  - documents: name, documentType, fileName, fileExtension, mimeType
- Hub's generic description is a simplification, not wrong per se

---

## Phase 3: Security Verification

### Guard coverage by controller

| Controller | JwtAuthGuard | RolesGuard | @Roles | Effective? |
|------------|-------------|------------|--------|------------|
| AdminController | ✓ (controller) | ✓ (controller) | ADMIN | ✓ FULL |
| GlobalSearchController | ✓ (controller) | ✓ (controller) | 7 roles | ✓ FULL |
| EntitySearchController | ✓ (controller) | **✗ MISSING** | VIEWER, USER, MANAGER, ADMIN | **✗ DECORATIVE** |
| SavedSearchesController | ✓ (controller) | **✗ MISSING** | VIEWER, USER, MANAGER, ADMIN | **✗ DECORATIVE** |

**Hub says "All endpoints: JwtAuthGuard + RolesGuard + tenantId filtering" — FALSE. 2/4 controllers missing RolesGuard. @Roles decorators on EntitySearchController and SavedSearchesController are decorative (no RolesGuard to enforce them).**

### P0 CRITICAL: Elasticsearch tenant isolation gap

The `ElasticsearchService` does **NOT** include `tenantId` as a filter in any search query:

- `searchGlobal()` — line 59-70: uses `multi_match` without tenantId filter
- `searchEntity()` — line 101-106: uses `bool.must` without tenantId filter
- `suggest()` — line 119-132: uses `completion` suggest without tenantId filter

**Hub says "Every query appends a mandatory tenantId filter term. No cross-tenant results are ever returned."** — This is **FALSE**. Zero tenantId filtering in Elasticsearch queries.

**Impact:** If Elasticsearch indices contain documents from multiple tenants (which they would in a multi-tenant system), **any user's search returns results from ALL tenants**. This is a critical data leakage vulnerability.

**Mitigating factor:** The `tenantId` IS passed to the controller/service methods but never forwarded to ElasticsearchService. The Prisma-backed services (saved searches, history, synonyms, indexes) DO filter by tenantId correctly.

### Additional security findings

1. **deleteSynonym cross-tenant bug** (admin.service.ts:78): `prisma.searchSynonym.update({ where: { id } })` — no tenantId check. An admin could delete any tenant's synonym by ID.

2. **SearchHistory no deletedAt filter** (admin.service.ts:84-104): `analytics()` counts don't filter `deletedAt: null`, including soft-deleted history records in analytics.

---

## Phase 4: Test Verification

| Spec File | Tests | LOC | Coverage |
|-----------|-------|-----|----------|
| admin.service.spec.ts | 4 | 70 | health, listIndexes, synonyms CRUD |
| elasticsearch.service.spec.ts | 5 | 79 | search, suggest, index, delete, health |
| entity-search.service.spec.ts | 2 | 39 | search valid entity, reject invalid |
| global-search.service.spec.ts | 4 | 63 | search, suggestions, recent, history |
| index-manager.service.spec.ts | 3 | 44 | list, getStatus, setStatus |
| indexing.service.spec.ts | 3 | 42 | enqueue, markCompleted, markFailed |
| queue-processor.service.spec.ts | 6 | 122 | processNext variations, reindex, mapDocument |
| saved-searches.service.spec.ts | 10 | 158 | CRUD, execute, share, delete, list |
| **TOTAL** | **37** | **617** | Good unit test coverage |

**Hub says "8 spec files exist" — CORRECT. Hub says "Partial" — ACCURATE, not false stubs claim this time.**

---

## Phase 5: Cross-Cutting Findings

### QueueProcessor entity coverage gap

`fetchAllEntities()` and `fetchEntity()` only handle 5 entity types:
- ✓ customers (mapped to Company where companyType='CUSTOMER')
- ✓ orders
- ✓ loads
- ✓ carriers
- ✓ documents

**Missing from indexing pipeline:**
- ✗ companies (separate from customers?)
- ✗ contacts
- ✗ invoices

The EntitySearchController exposes 7 entity type endpoints, but only 5 can actually be indexed. Searching contacts or invoices would return empty results unless they were manually indexed.

### Module architecture

- **No .bak directory** — clean (first service in Batch 4 without .bak)
- **Module exports nothing** — `SearchModule` has no `exports` array, so IndexingService/ElasticsearchService can't be used by other modules for event-driven indexing
- **No event listeners** — no `@OnEvent` decorators, no EventEmitter usage. The indexing pipeline is admin-triggered only (reindex button), not automatic on entity CRUD
- **No scheduled processor** — QueueProcessorService has `processNext()` but no `@Cron` or `@Interval` to actually run it

### DTO quality

9 DTOs + response DTOs in a single file (252 LOC). Well-structured with proper class-validator decorators. Hub Section 9 validation rules are ~90% accurate — minor differences:
- Hub says `q` on GlobalSearchDto is `@IsString()` — code has `@IsString() @MinLength(2)` ✓
- Hub doesn't document QueueQueryDto (status, limit) or SearchAnalyticsDto

### Frontend verification

- 0 search pages under `/search/` — confirmed "Not Built"
- 0 search hooks — confirmed "Not Built"
- 1 related page: `/load-board/search/page.tsx` (load board search, different module)
- Hub frontend claims: **100% accurate**

---

## Tribunal: 5 Adversarial Rounds

### Round 1: "Hub health score D (2/10) is indefensible"

**Prosecution:** The backend has 27 fully wired endpoints across 4 well-structured controllers, 6 Prisma models, a complete indexing pipeline with queue processing, synonym management, analytics tracking, and 37 passing tests. Scoring this a D/2 is absurd.

**Defense:** The hub's D score factors in zero frontend, and search is a full-stack feature. Without a UI, the 27 endpoints serve no user.

**Verdict:** Score should be **7.5/10**. The backend is production-quality infrastructure with sophisticated features (suggestions, analytics, queue pipeline, synonym management). Frontend absence doesn't make the backend a 2.

### Round 2: "Hub data model is catastrophically incomplete"

**Prosecution:** Hub documents 1 model (SavedSearch). Reality: 6 models. That's 83% undocumented — SearchHistory, SearchIndex, SearchIndexQueue, SearchSuggestion, SearchSynonym all missing from Section 8. This is the worst data model omission ratio since Accounting (3→11).

**Defense:** Hub Section 15 sub-module structure does mention these service files, implying their existence.

**Verdict:** **PROSECUTION WINS.** Section 8 must document all 6 models. The "implied by sub-module structure" defense doesn't hold — Section 8 is explicitly for data models.

### Round 3: "Hub security claim is FALSE and masks a P0 bug"

**Prosecution:** Hub says "All endpoints: JwtAuthGuard + RolesGuard + tenantId filtering" and "Every query appends a mandatory tenantId filter term." Both are false:
1. EntitySearchController and SavedSearchesController lack RolesGuard
2. ElasticsearchService has ZERO tenantId filtering in any search query

**Defense:** JWT auth still requires a valid token, and the @Roles decorators show intent.

**Verdict:** **PROSECUTION WINS EMPHATICALLY.** The Elasticsearch tenant isolation gap is a **P0 security vulnerability**. In a multi-tenant deployment, searches would leak data across tenants. The hub's claim of "mandatory tenantId filter" is dangerously misleading. Two controllers with decorative @Roles is the cross-cutting pattern seen in 12+ services.

### Round 4: "Indexing pipeline is architecturally incomplete"

**Prosecution:** The pipeline has critical gaps:
1. No event listeners — entities aren't auto-indexed on create/update/delete
2. No cron/interval to process the queue — processNext() is never called automatically
3. Only 5/7 entity types can be indexed (contacts, invoices missing)
4. Module exports nothing — other modules can't trigger indexing

**Defense:** The admin reindex endpoint provides manual control.

**Verdict:** **PROSECUTION WINS.** A search indexing pipeline that doesn't auto-index is not a pipeline — it's manual tooling. The missing event integration and scheduled processing make the queue system a well-designed skeleton that doesn't actually run. Hub should document these architectural gaps.

### Round 5: "Hub validation rules and DTO documentation are good"

**Prosecution:** Let's give credit: Section 9 validation rules are ~90% accurate. DTO field names, types, and validators mostly match. The hub gets the behavior right.

**Defense:** Agreed — this is the strongest hub section.

**Verdict:** **DEFENSE WINS.** Section 9 is genuinely useful. Minor gaps (missing QueueQueryDto, SearchAnalyticsDto) but core validation docs are reliable.

---

## Final Verdict

| Category | Hub Claim | Reality | Accuracy |
|----------|-----------|---------|----------|
| Endpoint count | 27 | 27 | **100% (10th perfect match)** |
| Endpoint paths | 27 paths listed | All match | **~100%** |
| HTTP methods | All match | All match | **100%** |
| Prisma models | 1 (SavedSearch) | 6 | **17%** |
| Enums | 1 (SearchEntityType) | 3 | **33%** |
| Security | "All guarded + tenantId" | 2/4 RolesGuard, 0 ES tenantId | **FALSE** |
| Tests | "8 spec files, partial" | 8 specs, 37 tests, 617 LOC | **✓ ACCURATE** |
| Frontend | "Not Built" | Not Built | **100% accurate** |

### Health Score: 2/10 → **7.5/10** (+5.5)

### Verdict: **MODIFY**

---

## Action Items

| # | Priority | Action | Target |
|---|----------|--------|--------|
| 1 | **P0** | Add tenantId filter to all ElasticsearchService search queries (searchGlobal, searchEntity, suggest) | elasticsearch.service.ts |
| 2 | **P1** | Add RolesGuard to EntitySearchController `@UseGuards` | entity-search.controller.ts:10 |
| 3 | **P1** | Add RolesGuard to SavedSearchesController `@UseGuards` | saved-searches.controller.ts:10 |
| 4 | **P1** | Add tenantId check to deleteSynonym | admin.service.ts:78 |
| 5 | **P1** | Add deletedAt filter to SearchHistory analytics queries | admin.service.ts:84 |
| 6 | **P2** | Add @OnEvent listeners for entity CRUD to trigger automatic indexing | indexing.service.ts |
| 7 | **P2** | Add @Cron or @Interval to QueueProcessorService for automatic queue processing | queue-processor.service.ts |
| 8 | **P2** | Add contacts + invoices to QueueProcessor fetchEntity/fetchAllEntities | queue-processor.service.ts |
| 9 | **P2** | Export IndexingService + ElasticsearchService from SearchModule | search.module.ts |
| 10 | **P2** | Update hub Section 8 with all 6 Prisma models + 3 enums | hub file |
| 11 | **P2** | Update hub Section 1 security claim — remove "All endpoints RolesGuard" | hub file |
| 12 | **P3** | Document indexing pipeline architecture gaps (no auto-index, no cron) in hub | hub file |
