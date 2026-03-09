# PST-26: EDI — Per-Service Tribunal Audit

> **Service:** EDI (26) | **Priority:** P3 Future | **Batch:** 5
> **Auditor:** Claude Code (Opus 4.6) | **Date:** 2026-03-09
> **Hub file:** `dev_docs_v3/01-services/p3-future/26-edi.md`
> **Backend:** `apps/api/src/modules/edi/` (44 source files)

---

## Phase 1: Endpoint Inventory

### Hub Claims vs Reality

| Metric | Hub Claims | Actual | Match? |
|--------|-----------|--------|--------|
| Controllers | 8 | 8 | YES (names differ) |
| Endpoints | 35 | 38 | NO (hub misses 3) |
| Prisma Models | 4 (projected) | 9 | NO (hub misses 5) |
| Enums | 0 documented | 5 | NO |
| Spec Files | 1 | 7 | NO (hub claims 1, reality 7) |
| Test Cases | ~2 implied | 42 | NO |
| Active LOC | Not stated | 2,098 | — |
| Test LOC | Not stated | 759 | — |
| Total LOC | Not stated | 2,857 | — |

### Actual Endpoint Count by Controller

| Controller | Route Prefix | Endpoints | Hub Count | Delta |
|-----------|-------------|-----------|-----------|-------|
| TradingPartnersController | `edi/trading-partners` | 8 | 5 | +3 (test, toggle, activity) |
| EdiDocumentsController | `edi/documents` | 8 | 7 | +1 (errors) |
| EdiOrderDocumentsController | `orders` | 1 | 1* | 0 (hub wrongly calls it EdiOrdersController) |
| EdiLoadDocumentsController | `loads` | 1 | 1* | 0 (hub wrongly calls it EdiLoadsController) |
| EdiGenerationController | `edi/generate` | 5 | 4 | +1 (997) |
| EdiSendController | `edi` | 1 | 0 | +1 (send/:documentId) |
| EdiMappingsController | `edi/mappings` | 5 | 6 | -1 (no test endpoint) |
| EdiQueueController | `edi/queue` | 6 | 4 | +2 (stats, cancel, process) |
| **TOTAL** | | **35** (+3 cross-controller) = **38** | **35** | **+3** |

*Hub documents EdiOrdersController and EdiLoadsController as standalone controllers with CRUD endpoints — actually they are thin wrappers on EdiDocumentsService with only 1 endpoint each.

### Missing from Hub (3 endpoints)

1. `POST /edi/generate/997` — 997 Functional Acknowledgment generation
2. `POST /edi/send/:documentId` — Send outbound EDI document (EdiSendController)
3. `GET /edi/documents/errors` — List error documents

### Hub Phantom Endpoints (2)

1. `POST /edi/generate/batch` — batch generation endpoint does NOT exist
2. `POST /edi/mappings/:id/test` — mapping test endpoint does NOT exist

### Hub Controller Name Errors (3)

1. Hub says "EdiOrdersController" (4 CRUD endpoints) → actual: `EdiOrderDocumentsController` (1 endpoint: `GET /orders/:orderId/edi-documents`)
2. Hub says "EdiLoadsController" (4 CRUD endpoints) → actual: `EdiLoadDocumentsController` (1 endpoint: `GET /loads/:loadId/edi-documents`)
3. Hub says "EdiController" (main overview) → this controller does NOT exist; EdiSendController handles `edi/` prefix instead

### Hub Path Accuracy: ~75%

Hub has ~26/35 paths roughly correct. 9 are wrong: 2 phantom, 3 wrong controller names, 4 wrong route patterns (Orders/Loads controllers are completely different from hub description).

---

## Phase 2: Data Model Verification

### Prisma Models — Hub vs Actual

| Hub Model | Actual Prisma Model | Match? | Notes |
|-----------|-------------------|--------|-------|
| EdiTradingPartner | EdiTradingPartner | PARTIAL | Hub has ~40% field accuracy. Real model has 30+ fields (FTP/SFTP/AS2 connection details, DUNS, SCAC, functional ack flags, testMode). Hub projected 12 fields. |
| EdiDocument | EdiMessage | NAME WRONG | Hub uses "EdiDocument" — actual is `EdiMessage`. ~50% field match. Real model has control numbers (ISA/GS/ST), validation status, retry tracking, functionalAckId. Hub misses all. |
| EdiControlNumber | EdiControlNumber | PARTIAL | Hub has 5 fields, real has 12 (adds prefix, suffix, minValue, maxValue, transactionType, migration fields). Hub field name wrong: `currentValue` → actual `currentNumber`, `numberType` → actual `controlType`. |
| EdiMapping | EdiTransactionMapping | NAME WRONG | Hub uses "EdiMapping" — actual is `EdiTransactionMapping`. Hub has `name`, `mappingRules` fields — actual has `fieldMappings`, `defaultValues`, `transformRules`, `validationRules`. Different schema entirely. |
| — | EdiAcknowledgment | MISSING | Functional acknowledgment tracking. 16 fields. Linked to EdiMessage. |
| — | EdiBatch | MISSING | Batch processing. 15 fields. Tracks message counts, processed counts, error counts. |
| — | EdiBatchMessage | MISSING | Batch-to-message join table. 11 fields. |
| — | EdiCodeList | MISSING | EDI code translation (ediCode ↔ internalCode). 16 fields. Per-trading-partner overrides. |
| — | EdiCommunicationLog | MISSING | Transport audit log. 18 fields. Tracks direction, protocol, duration, file details. |
| — | EdiEventTrigger | MISSING | Event-driven EDI generation triggers. 14 fields. Conditions + target partners + message templates. |

### Model Summary

- **Hub documents:** 4 models (all with wrong names or incomplete fields)
- **Actual models:** 9 models
- **Missing from hub:** 5 models (56% undocumented)
- **Model name accuracy:** 2/4 correct names (EdiTradingPartner, EdiControlNumber)
- **Field accuracy across documented models:** ~40%

### Prisma Enums

| Enum | Values | Hub Documented? |
|------|--------|----------------|
| EdiCommunicationProtocol | FTP, SFTP, FTPS, AS2, HTTPS, VAN | Partial (hub has AS2, SFTP, VAN only — misses FTP, FTPS, HTTPS) |
| EdiDirection | INBOUND, OUTBOUND | YES |
| EdiMessageStatus | PENDING, QUEUED, SENT, DELIVERED, ACKNOWLEDGED, ERROR, REJECTED | Partial (hub has QUEUED, PROCESSING, COMPLETED, FAILED, ARCHIVED — 4/5 wrong names) |
| EdiTransactionType | EDI_204, EDI_214, EDI_210, EDI_211, EDI_990, EDI_997, EDI_315, EDI_322 | Partial (hub has 210, 214, 990 only — misses 204, 211, 997, 315, 322) |
| EdiValidationStatus | VALID, WARNING, ERROR | NO |

---

## Phase 3: Security Audit

### Auth Guard Coverage

| Controller | JwtAuthGuard | RolesGuard | @Roles | Verdict |
|-----------|-------------|-----------|--------|---------|
| TradingPartnersController | YES | **YES** | ADMIN, EDI_MANAGER, OPERATIONS_MANAGER | **FULL** |
| EdiDocumentsController | YES | **YES** | ADMIN, EDI_MANAGER, OPERATIONS_MANAGER | **FULL** |
| EdiOrderDocumentsController | YES | **YES** | ADMIN, EDI_MANAGER, OPERATIONS_MANAGER | **FULL** |
| EdiLoadDocumentsController | YES | **YES** | ADMIN, EDI_MANAGER, OPERATIONS_MANAGER | **FULL** |
| EdiGenerationController | YES | **NO** | @Roles decorative | **GAP** |
| EdiSendController | YES | **NO** | @Roles decorative | **GAP** |
| EdiMappingsController | YES | **NO** | @Roles decorative | **GAP** |
| EdiQueueController | YES | **NO** | @Roles decorative | **GAP** |

**Result: 4/8 controllers have RolesGuard. 4/8 missing — @Roles is decorative without RolesGuard in @UseGuards.**

### Tenant Isolation

| Service | tenantId in WHERE? | Verdict |
|---------|-------------------|---------|
| TradingPartnersService | YES — all queries use tenantId | PASS |
| EdiDocumentsService | YES — all queries use tenantId | PASS |
| EdiGenerationService | YES — createOutboundMessage uses tenantId | PASS |
| EdiMappingsService | YES — all queries use tenantId | PASS |
| EdiQueueService | YES — all queries use tenantId | PASS |
| EdiControlNumberService | YES — upsert uses tenantId in compound key | PASS |

**Result: 100% tenant isolation. All services correctly scope by tenantId.**

### Cross-Tenant Bugs

1. **P2: ISA ID uniqueness is NOT tenant-scoped.** `TradingPartnersService.create()` line 24: `findFirst({ where: { isaId: dto.isaId, deletedAt: null } })` — missing `tenantId`. Two tenants cannot use the same ISA ID. Same bug in `update()` line 98.

### Soft-Delete Compliance

| Service | Method | Filters deletedAt? | Verdict |
|---------|--------|-------------------|---------|
| TradingPartnersService.findAll | YES | PASS |
| TradingPartnersService.requirePartner | YES | PASS |
| TradingPartnersService.remove | Soft deletes | PASS |
| TradingPartnersService.activity | NO — `ediCommunicationLog.findMany` skips deletedAt | **FAIL** |
| EdiDocumentsService.list | YES | PASS |
| EdiDocumentsService.requireMessage | YES | PASS |
| EdiDocumentsService.listByOrder | YES | PASS |
| EdiDocumentsService.listByLoad | YES | PASS |
| EdiDocumentsService.listErrors | YES | PASS |
| EdiMappingsService.list | YES | PASS |
| EdiMappingsService.requireMapping | YES | PASS |
| EdiMappingsService.remove | Soft deletes | PASS |
| EdiQueueService.list | YES | PASS |
| EdiQueueService.requireMessage | YES | PASS |
| EdiQueueService.stats | **NO** — groupBy skips deletedAt | **FAIL** |
| EdiGenerationService.sendDocument | YES (findFirst) | PASS |

**Result: 14/16 methods compliant. 2 gaps: activity() on CommunicationLog, stats() on messages.**

### Audit Decorators

Trading partners controller has `@Audit` on CREATE, UPDATE, and toggleStatus operations. No other controllers have audit decorators.

### Credential Handling

**P2: ftpPassword stored in plaintext in EdiTradingPartner.** No encryption on FTP/SFTP credentials. The `ftpPassword` field is `@db.VarChar(500)` with no encryption wrapper. Returned in plaintext on GET responses via TradingPartnerResponseDto (no @Exclude).

---

## Phase 4: Test Verification

### Hub Claims vs Reality

| Hub Claim | Reality |
|-----------|---------|
| "1 spec file (control-number.service.spec.ts)" | **7 spec files, 42 test cases, 759 LOC** |

### Test Inventory

| Spec File | Test Cases | LOC | Quality |
|-----------|-----------|-----|---------|
| control-number.service.spec.ts | 2 | 40 | Good — tests next() and nextTriple() |
| edi-documents.service.spec.ts | 5 | 89 | Good — import, parse errors, acknowledge, list, not-found |
| edi-generation.service.spec.ts | 4 | 148 | Good — 204/997 generation, send, not-found |
| edi-mappings.service.spec.ts | 8 | 136 | Thorough — CRUD, duplicate detection, null optionals, soft delete |
| edi-parser.service.spec.ts | 3 | 22 | Basic — JSON, key=value, error |
| edi-queue.service.spec.ts | 7 | 96 | Good — list, retry, cancel, process empty/non-empty, stats, not-found |
| trading-partners.service.spec.ts | 13 | 228 | Most thorough — CRUD, ISA conflict, pagination, filters, toggle, all 3 transports, activity, remove |

**Hub claim "1 spec file" is FALSE — 17th false test undercount.** Real: 7 spec files, 42 tests, 759 LOC.

---

## Phase 5: Architecture Assessment

### Code Quality

**Strengths:**
- Well-organized sub-module architecture (documents, generation, mappings, queue, parsing, trading-partners, transport)
- 5 dedicated X12 generator classes (204, 210, 214, 990, 997) — clean separation
- 3 transport handlers (FTP, SFTP, AS2) — protocol-agnostic design
- EventEmitter integration (8+ distinct events) for cross-service communication
- Atomic control number management via Prisma upsert with compound unique constraint
- Proper error handling in import pipeline (parse errors create ERROR status with preserved payload)
- Module exports 4 services (EdiDocumentsService, EdiGenerationService, EdiMappingsService, EdiQueueService)

**Weaknesses:**
1. **Parser is a STUB** — only handles JSON and key=value pairs. Does NOT parse actual X12/ANSI EDI segments (ISA/GS/ST/SE/GE/IEA). The core promise of this module — parsing EDI — is not implemented.
2. **Generators are STUBS** — all 5 generators return JSON.stringify(), not actual X12 segment output. Example: Edi210Generator returns `{"type":"210","controlNumbers":...}` instead of real `ISA*00*...` segments.
3. **Transport handlers are STUBS** — all 3 (FTP, SFTP, AS2) return `{ success: true }` without any actual network calls. No SSH/FTP/HTTP client libraries used.
4. **Queue processing is naive** — `EdiQueueService.process()` marks all pending messages as SENT without actually sending them. No transport dispatch, no error handling, no dead-letter queue.
5. **sendDocument doesn't actually send** — `EdiGenerationService.sendDocument()` marks status as SENT and creates a communication log, but doesn't invoke any transport handler.
6. **No @Cron/@Interval** — no automated queue processing, no polling for inbound files.
7. **Hub says "Scaffolded"** — this is MORE ACCURATE than most hubs, but still undersells. The CRUD/lifecycle layer is production-quality. The EDI-specific layer (parsing, generation, transport) is correctly identified as stubs.

### Hub Known Issues Assessment

| Hub Issue | Verdict | Notes |
|-----------|---------|-------|
| "No frontend exists" | TRUE | Confirmed — 0 pages, 0 hooks, 0 components |
| "Backend endpoints are scaffolded but runtime behavior unverified" | PARTIALLY TRUE | CRUD + lifecycle is production-quality. Parsing/generation/transport are stubs. Better description: "CRUD layer works, EDI-specific logic is stubbed." |
| "Only 1 test file" | **FALSE** | 7 spec files, 42 tests, 759 LOC (17th false test claim) |
| "Prisma models not verified" | **FALSE** | 9 fully defined Prisma models with relations, indices, unique constraints |
| "Transport sub-module — AS2/SFTP handlers not confirmed working" | TRUE | All 3 transports are mock stubs |
| "No error alerting for failed EDI transmissions" | PARTIALLY TRUE | EventEmitter emits error events but no alerting/notification system listens |
| "Queue processing — no dead-letter queue handling confirmed" | TRUE | No dead-letter, no max retry limit, no retry backoff |

**Known issues accuracy: 4/7 accurate, 2/7 partially true, 1/7 false. Better than most hubs (57% vs typical 30-40%).**

### Transaction Type Coverage

| Type | Hub Documents? | Generator? | Parser Support? |
|------|---------------|-----------|----------------|
| 204 (Load Tender) | NO | YES (stub) | NO |
| 210 (Invoice) | YES | YES (stub) | NO |
| 214 (Shipment Status) | YES | YES (stub) | NO |
| 990 (Tender Response) | YES | YES (stub) | NO |
| 997 (Functional Ack) | NO | YES (stub) | NO |
| 211, 315, 322 | NO | NO | NO |

Hub documents 3 transaction types. Code supports 5 generators (adds 204, 997). Prisma enum has 8 types (adds 211, 315, 322 — future).

---

## Tribunal Verdict

### Score: 7.5/10 (was 2.0/10) — Delta: +5.5

| Category | Score | Notes |
|----------|-------|-------|
| CRUD Layer | 9/10 | Production-quality trading partners, documents, mappings, queue management |
| Security | 7/10 | 100% JwtAuth, but 4/8 missing RolesGuard. ISA ID cross-tenant. ftpPassword plaintext. |
| Tenant Isolation | 9/10 | 100% tenant-scoped queries. 1 ISA uniqueness bug. |
| Soft-Delete | 8/10 | 14/16 compliant. 2 minor gaps (activity, stats). |
| Testing | 8/10 | 42 tests across 7 files. Hub's "1 file" is FALSE. Good coverage of CRUD paths. |
| EDI-Specific Logic | 3/10 | Parser, generators, transports all stubs. No real X12 handling. |
| Data Model | 9/10 | 9 well-designed models, 5 enums, proper relations/indices. Hub only documents 4. |
| Event System | 8/10 | 8+ EventEmitter events. Good cross-service integration hooks. |
| Architecture | 8/10 | Clean sub-module separation. Good foundation for real EDI when needed. |

### Verdict: **MODIFY**

Hub significantly undervalues the CRUD/lifecycle layer while being roughly correct about EDI-specific stubs. The module is a well-architected framework waiting for real X12 parsing/generation/transport implementations.

---

## Action Items

| # | Action | Priority | Effort |
|---|--------|----------|--------|
| 1 | Fix hub Section 8 — add 5 missing models (EdiAcknowledgment, EdiBatch, EdiBatchMessage, EdiCodeList, EdiCommunicationLog, EdiEventTrigger), rename EdiDocument→EdiMessage, EdiMapping→EdiTransactionMapping | P0 | 2h |
| 2 | Fix hub Section 4 — actual endpoint count is 38 not 35, remove 2 phantom endpoints (batch, mapping test), add 3 missing (997, send, errors), fix controller names | P0 | 1h |
| 3 | Update hub test count — 7 spec files / 42 tests / 759 LOC (not "1 spec file") | P0 | 10min |
| 4 | Update hub models marked "Unknown" — confirmed 9 models, 5 enums | P0 | 10min |
| 5 | Add RolesGuard to EdiGenerationController, EdiSendController, EdiMappingsController, EdiQueueController | P1 | 30min |
| 6 | Fix ISA ID uniqueness to be tenant-scoped — add tenantId to findFirst in create() and update() | P1 | 15min |
| 7 | Add @Exclude to ftpPassword in TradingPartnerResponseDto (or encrypt at rest) | P1 | 30min |
| 8 | Add deletedAt filter to TradingPartnersService.activity() and EdiQueueService.stats() | P2 | 15min |
| 9 | Add hub documentation for EDI_204, EDI_997 transaction types and their generators | P2 | 30min |
| 10 | Document EdiCommunicationProtocol enum values (6 values, hub lists only 3) | P2 | 10min |
| 11 | Document EdiMessageStatus enum (7 values, hub has 5 wrong names) | P2 | 10min |
| 12 | Add hub documentation for 8+ EventEmitter events | P2 | 30min |

---

## Cross-Cutting Findings

1. **17th false test undercount** — continues the systemic pattern of hubs claiming minimal/no tests when substantial test suites exist
2. **ISA ID cross-tenant uniqueness** is a new bug pattern not seen in other services — EDI-specific business rule leaking across tenants
3. **ftpPassword plaintext** — same pattern as Factoring's apiKey (PST-18). Credential storage needs encryption service
4. **Hub known issues more accurate than most** — 57% fully accurate vs typical 30-40%. This hub benefits from being honest about "scaffolded" status rather than claiming non-existent features
5. **Generator/parser stub pattern** matches Safety's FMCSA stub (PST-25) and Workflow's execution engine stub (PST-20) — P3 services have working CRUD but stubbed domain logic
