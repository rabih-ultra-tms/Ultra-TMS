# Service Hub: EDI (26)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-09 (PST-26 tribunal)
> **Original definition:** `apps/api/src/modules/edi/` (44 source files)
> **Design specs:** `dev_docs/12-Rabih-design-Process/24-edi/` (9 files)
> **Priority:** P3 Future — EDI 210/214/990 transaction sets for enterprise customers
> **Tribunal file:** `dev_docs_v3/05-audit/tribunal/per-service/PST-26-edi.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | B- (7.5/10) |
| **Confidence** | High — code-verified via PST-26 tribunal |
| **Last Verified** | 2026-03-09 |
| **Backend** | Partial — 8 controllers, 38 endpoints (CRUD layer production-quality, EDI-specific logic stubbed) |
| **Frontend** | Not Started — no pages, no components, no hooks |
| **Tests** | 7 spec files, 42 test cases, 759 LOC |
| **Priority** | P3 Future — enterprise-tier feature |
| **Active Sprint** | None — not in Quality Sprint scope |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Partial | No standalone service doc; logic lives in code |
| Design Specs | Done | 9 files in `dev_docs/12-Rabih-design-Process/24-edi/` |
| Backend Controllers | Partial | 8 controllers, 38 endpoints. CRUD layer production-quality; parser/generator/transport stubs |
| Prisma Models | Done | 9 models, 5 enums — fully defined with relations, indices, unique constraints |
| Frontend Pages | Not Started | No routes exist |
| React Hooks | Not Started | No hooks exist |
| Components | Not Started | No components exist |
| Tests | Substantial | 7 spec files, 42 tests, 759 LOC (trading-partners: 13, mappings: 8, queue: 7, documents: 5, generation: 4, parser: 3, control-number: 2) |
| Documentation | Partial | Design specs exist, no API docs |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| EDI Dashboard | — | Not Started | 0/10 | No route defined |
| Trading Partners List | — | Not Started | 0/10 | No route defined |
| Trading Partner Detail | — | Not Started | 0/10 | No route defined |
| Document Browser | — | Not Started | 0/10 | No route defined |
| Document Detail/Viewer | — | Not Started | 0/10 | No route defined |
| Mapping Configuration | — | Not Started | 0/10 | No route defined |
| Queue Monitor | — | Not Started | 0/10 | No route defined |
| EDI Generation | — | Not Started | 0/10 | No route defined |
| EDI Settings | — | Not Started | 0/10 | No route defined |

> All screens are defined in design specs (`dev_docs/12-Rabih-design-Process/24-edi/`) but none have been built.

---

## 4. API Endpoints

### Trading Partners (TradingPartnersController)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/edi/trading-partners` | TradingPartnersController | Production | List trading partners |
| GET | `/api/v1/edi/trading-partners/:id` | TradingPartnersController | Production | Trading partner detail |
| POST | `/api/v1/edi/trading-partners` | TradingPartnersController | Production | Create trading partner |
| PUT | `/api/v1/edi/trading-partners/:id` | TradingPartnersController | Production | Update trading partner |
| DELETE | `/api/v1/edi/trading-partners/:id` | TradingPartnersController | Production | Delete trading partner |
| POST | `/api/v1/edi/trading-partners/:id/test` | TradingPartnersController | Production | Test connection |
| PATCH | `/api/v1/edi/trading-partners/:id/toggle` | TradingPartnersController | Production | Toggle active status |
| GET | `/api/v1/edi/trading-partners/:id/activity` | TradingPartnersController | Production | Activity log |

### Documents (EdiDocumentsController)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/edi/documents` | EdiDocumentsController | Production | List EDI documents |
| GET | `/api/v1/edi/documents/:id` | EdiDocumentsController | Production | Single document detail |
| POST | `/api/v1/edi/documents` | EdiDocumentsController | Production | Import/create EDI document |
| PUT | `/api/v1/edi/documents/:id` | EdiDocumentsController | Production | Update document status |
| DELETE | `/api/v1/edi/documents/:id` | EdiDocumentsController | Production | Archive/delete document |
| POST | `/api/v1/edi/documents/:id/reprocess` | EdiDocumentsController | Production | Reprocess failed document |
| POST | `/api/v1/edi/documents/:id/acknowledge` | EdiDocumentsController | Production | Acknowledge document |
| GET | `/api/v1/edi/documents/errors` | EdiDocumentsController | Production | List error documents |

### Order/Load Documents (thin wrappers)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/orders/:orderId/edi-documents` | EdiOrderDocumentsController | Production | List EDI docs for an order |
| GET | `/api/v1/loads/:loadId/edi-documents` | EdiLoadDocumentsController | Production | List EDI docs for a load |

### Generation (EdiGenerationController)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/edi/generate` | EdiGenerationController | Stub | List generated documents |
| POST | `/api/v1/edi/generate/204` | EdiGenerationController | Stub | Generate 204 Load Tender |
| POST | `/api/v1/edi/generate/210` | EdiGenerationController | Stub | Generate 210 Invoice |
| POST | `/api/v1/edi/generate/214` | EdiGenerationController | Stub | Generate 214 Shipment Status |
| POST | `/api/v1/edi/generate/990` | EdiGenerationController | Stub | Generate 990 Tender Response |
| POST | `/api/v1/edi/generate/997` | EdiGenerationController | Stub | Generate 997 Functional Acknowledgment |

### Send (EdiSendController)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| POST | `/api/v1/edi/send/:documentId` | EdiSendController | Stub | Send outbound EDI document |

### Mappings (EdiMappingsController)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/edi/mappings` | EdiMappingsController | Production | List field mappings |
| GET | `/api/v1/edi/mappings/:id` | EdiMappingsController | Production | Mapping detail |
| POST | `/api/v1/edi/mappings` | EdiMappingsController | Production | Create field mapping |
| PUT | `/api/v1/edi/mappings/:id` | EdiMappingsController | Production | Update field mapping |
| DELETE | `/api/v1/edi/mappings/:id` | EdiMappingsController | Production | Soft-delete field mapping |

### Queue (EdiQueueController)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/edi/queue` | EdiQueueController | Production | List queued EDI messages |
| GET | `/api/v1/edi/queue/:id` | EdiQueueController | Production | Queue item detail |
| POST | `/api/v1/edi/queue/:id/retry` | EdiQueueController | Production | Retry failed queue item |
| DELETE | `/api/v1/edi/queue/:id` | EdiQueueController | Production | Remove from queue |
| GET | `/api/v1/edi/queue/stats` | EdiQueueController | Production | Queue statistics |
| POST | `/api/v1/edi/queue/:id/cancel` | EdiQueueController | Production | Cancel queue item |
| POST | `/api/v1/edi/queue/process` | EdiQueueController | Stub | Process pending queue (naive — marks as SENT without transport) |

> **Total: 38 endpoints across 8 controllers.** CRUD/lifecycle layer is production-quality. Generation, send, and transport are stubs (return JSON, no real X12 or network calls).

---

## 5. Components

| Component | Path | Status | Shared? |
|-----------|------|--------|---------|
| — | — | Not Started | — |

> No frontend components exist. All UI must be built from scratch when this service is prioritized.

---

## 6. Hooks

| Hook | Endpoints Used | Envelope Unwrapped? | Notes |
|------|---------------|---------------------|-------|
| — | — | — | — |

> No hooks exist. When building the frontend, hooks must follow the `response.data.data` envelope pattern documented in `dev_docs_v3/05-audit/recurring-patterns.md`.

---

## 7. Business Rules

1. **EDI Transaction Types:** The system supports eight ANSI X12 transaction types (via EdiTransactionType enum): **204** (Load Tender), **210** (Invoice), **214** (Shipment Status), **211**, **990** (Tender Response), **997** (Functional Acknowledgment), **315**, **322**. Five have generator stubs (204, 210, 214, 990, 997). Three are enum-only (211, 315, 322 — future).

2. **Trading Partner Management:** Every EDI exchange is scoped to a registered trading partner. A trading partner record stores the partner's ISA/GS identifiers (qualifier + ID), communication protocol (FTP, SFTP, FTPS, AS2, HTTPS, VAN), document format preferences, and active transaction set subscriptions. Partners must be validated and activated before any documents can be exchanged. Connection testing and status toggling are supported.

3. **Control Number Sequencing:** EDI documents require unique, sequential control numbers at three levels: ISA (interchange), GS (functional group), and ST (transaction set). The `control-number.service` manages atomic counter increments via Prisma upsert with compound unique constraint per trading partner per control number type. Control numbers must never be reused — gaps are acceptable but duplicates are protocol violations.

4. **Message Parsing (STUB):** The parser currently only handles JSON and key=value pairs. It does NOT parse actual X12/ANSI EDI segments (ISA/GS/ST/SE/GE/IEA). Real X12 parsing is not yet implemented. Parsing errors create a failed document record with the raw payload preserved for manual inspection and reprocessing.

5. **Message Generation (STUB):** All 5 generators (204, 210, 214, 990, 997) return JSON.stringify() output, NOT actual X12 segment format. Real ISA/GS/ST segment generation is not yet implemented.

6. **Transport Layer (STUB):** All 3 transport handlers (FTP, SFTP, AS2) return `{ success: true }` without any actual network calls. No SSH/FTP/HTTP client libraries are used. The `sendDocument` method marks status as SENT and creates a communication log but doesn't invoke any transport handler.

7. **Queue-Based Processing:** All EDI messages (inbound and outbound) flow through the `queue/` sub-module. Queue processing is naive — `process()` marks all pending messages as SENT without actually sending them. No transport dispatch, no error handling, no dead-letter queue, no @Cron/@Interval for automated processing.

8. **Field Mapping Configuration:** The `mappings/` sub-module allows per-trading-partner field mapping between X12 elements and TMS data fields via EdiTransactionMapping model. Mappings store `fieldMappings`, `defaultValues`, `transformRules`, and `validationRules`.

9. **Event System:** The module integrates with EventEmitter, emitting 8+ distinct events for cross-service communication. Module exports 4 services (EdiDocumentsService, EdiGenerationService, EdiMappingsService, EdiQueueService) for external consumption.

10. **Tenant Isolation:** All EDI records (documents, trading partners, mappings, queue items, control numbers) are scoped to `tenantId`. 100% tenant-scoped queries confirmed. **Exception:** ISA ID uniqueness check is NOT tenant-scoped (P2 bug — two tenants cannot use the same ISA ID).

---

## 8. Data Model

### EdiTradingPartner
```
EdiTradingPartner {
  id                String (UUID)
  tenantId          String (FK -> Tenant)
  name              String
  isaQualifier      String (2 chars)
  isaId             String (15 chars)
  gsId              String
  protocol          EdiCommunicationProtocol (FTP, SFTP, FTPS, AS2, HTTPS, VAN)
  ftpHost           String
  ftpPort           Int
  ftpUsername        String
  ftpPassword       String (PLAINTEXT — P2 security issue)
  ftpPath           String
  as2Config         Json?
  dunsNumber        String?
  scacCode          String?
  testMode          Boolean
  functionalAckRequired  Boolean
  transactionSets   String[]
  status            String (ACTIVE, INACTIVE, TESTING)
  deletedAt         DateTime?
  createdAt         DateTime
  updatedAt         DateTime
  // 30+ fields total — only key fields shown
}
```

### EdiMessage (hub previously called "EdiDocument")
```
EdiMessage {
  id                String (UUID)
  tenantId          String (FK -> Tenant)
  tradingPartnerId  String (FK -> EdiTradingPartner)
  direction         EdiDirection (INBOUND, OUTBOUND)
  transactionType   EdiTransactionType
  isaControlNumber  String
  gsControlNumber   String
  stControlNumber   String
  status            EdiMessageStatus (PENDING, QUEUED, SENT, DELIVERED, ACKNOWLEDGED, ERROR, REJECTED)
  validationStatus  EdiValidationStatus (VALID, WARNING, ERROR)
  rawPayload        Text
  parsedData        Json?
  errorMessage      String?
  retryCount        Int
  maxRetries        Int
  functionalAckId   String?
  relatedEntityType String?
  relatedEntityId   String?
  processedAt       DateTime?
  deletedAt         DateTime?
  createdAt         DateTime
  updatedAt         DateTime
}
```

### EdiControlNumber
```
EdiControlNumber {
  id                String (UUID)
  tenantId          String (FK -> Tenant)
  tradingPartnerId  String (FK -> EdiTradingPartner)
  controlType       String (ISA, GS, ST) — hub wrongly said "numberType"
  currentNumber     Int — hub wrongly said "currentValue"
  prefix            String?
  suffix            String?
  minValue          Int
  maxValue          Int
  transactionType   String?
  createdAt         DateTime
  updatedAt         DateTime
  // 12 fields total
}
```

### EdiTransactionMapping (hub previously called "EdiMapping")
```
EdiTransactionMapping {
  id                String (UUID)
  tenantId          String (FK -> Tenant)
  tradingPartnerId  String (FK -> EdiTradingPartner)
  transactionType   String
  fieldMappings     Json — hub wrongly said "mappingRules"
  defaultValues     Json
  transformRules    Json
  validationRules   Json
  isActive          Boolean
  deletedAt         DateTime?
  createdAt         DateTime
  updatedAt         DateTime
}
```

### EdiAcknowledgment (missing from hub)
```
EdiAcknowledgment {
  // Functional acknowledgment tracking
  // 16 fields, linked to EdiMessage
}
```

### EdiBatch (missing from hub)
```
EdiBatch {
  // Batch processing tracking
  // 15 fields — message counts, processed counts, error counts
}
```

### EdiBatchMessage (missing from hub)
```
EdiBatchMessage {
  // Batch-to-message join table
  // 11 fields
}
```

### EdiCodeList (missing from hub)
```
EdiCodeList {
  // EDI code translation (ediCode <-> internalCode)
  // 16 fields, per-trading-partner overrides
}
```

### EdiCommunicationLog (missing from hub)
```
EdiCommunicationLog {
  // Transport audit log
  // 18 fields — direction, protocol, duration, file details
}
```

### EdiEventTrigger (missing from hub — 6th missing model)
```
EdiEventTrigger {
  // Event-driven EDI generation triggers
  // 14 fields — conditions, target partners, message templates
}
```

> **Summary:** 9 Prisma models total. Hub previously documented 4 (all with wrong names or incomplete fields). 5 models were missing. Model name accuracy: 2/4 correct (EdiTradingPartner, EdiControlNumber). Field accuracy across documented models: ~40%.

---

## 9. Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| `tradingPartnerId` | IsUUID, must exist in tenant | "Invalid trading partner" |
| `isaQualifier` | Exactly 2 characters, alphanumeric | "ISA qualifier must be 2 characters" |
| `isaId` | Max 15 characters | "ISA ID must not exceed 15 characters" |
| `transactionType` | IsIn(EDI_204, EDI_210, EDI_214, EDI_211, EDI_990, EDI_997, EDI_315, EDI_322) | "Unsupported transaction type" |
| `direction` | IsEnum(INBOUND, OUTBOUND) | "Invalid direction" |
| `controlNumber` | Numeric string, unique per partner/type | "Control number already used" |
| `rawPayload` | Non-empty string | "Invalid EDI payload format" |
| `fieldMappings` | Valid JSON | "Invalid mapping structure" |
| `protocol` | IsEnum(FTP, SFTP, FTPS, AS2, HTTPS, VAN) | "Unsupported transport protocol" |
| `status` | IsEnum per entity type | "Invalid status value" |

---

## 10. Status States

### EDI Message Lifecycle (EdiMessageStatus)
```
PENDING -> QUEUED (accepted for processing)
QUEUED -> SENT (processed — currently stub, just marks as SENT)
SENT -> DELIVERED (transport confirmed)
DELIVERED -> ACKNOWLEDGED (997 received)
QUEUED -> ERROR (parse/validation failure)
ERROR -> QUEUED (retry)
PENDING -> REJECTED (validation rejection)
```

### EDI Validation Status (EdiValidationStatus)
```
VALID — passed all validation rules
WARNING — passed with warnings
ERROR — failed validation
```

### Trading Partner Status
```
TESTING -> ACTIVE (partner validated, ready for production)
ACTIVE -> INACTIVE (disabled by admin via toggle endpoint)
INACTIVE -> ACTIVE (re-enabled by admin via toggle endpoint)
TESTING -> INACTIVE (abandoned setup)
```

### Communication Protocol (EdiCommunicationProtocol)
```
FTP, SFTP, FTPS, AS2, HTTPS, VAN
```
> Hub previously listed only AS2, SFTP, VAN — missing FTP, FTPS, HTTPS.

### Transaction Types (EdiTransactionType)
```
EDI_204 (Load Tender)
EDI_210 (Invoice)
EDI_214 (Shipment Status)
EDI_211
EDI_990 (Tender Response)
EDI_997 (Functional Acknowledgment)
EDI_315
EDI_322
```
> Hub previously listed only 210, 214, 990 — missing 204, 211, 997, 315, 322.

---

## 11. Known Issues

| Issue | Severity | File | Status |
|-------|----------|------|--------|
| No frontend exists — entire UI must be built | P3 | — | Deferred |
| CRUD layer production-quality, but parser/generator/transport are stubs | P3 | `apps/api/src/modules/edi/` | Open |
| ~~Only 1 test file — no integration or E2E tests~~ | ~~P3~~ | — | **Closed — FALSE. 7 spec files, 42 tests, 759 LOC verified by PST-26** |
| ~~Prisma models not verified — data model may be incomplete~~ | ~~P3~~ | — | **Closed — FALSE. 9 fully defined models with relations, indices, unique constraints verified by PST-26** |
| Transport sub-module — AS2/SFTP/FTP handlers are stubs (return `{ success: true }`) | P3 | `edi/transport/` | Open |
| No error alerting for failed EDI transmissions | P3 | — | Open |
| Queue processing — no dead-letter queue, no max retry limit, no retry backoff | P3 | `edi/queue/` | Open |
| 4/8 controllers missing RolesGuard (@Roles is decorative without it) | P1 | EdiGeneration, EdiSend, EdiMappings, EdiQueue controllers | **Open — PST-26 finding** |
| ISA ID uniqueness check not tenant-scoped (cross-tenant bug) | P2 | `TradingPartnersService.create()` line 24, `update()` line 98 | **Open — PST-26 finding** |
| ftpPassword stored in plaintext, returned in GET responses (no @Exclude) | P2 | `EdiTradingPartner` model / `TradingPartnerResponseDto` | **Open — PST-26 finding** |
| Soft-delete gap: `activity()` on CommunicationLog skips `deletedAt` filter | P2 | `TradingPartnersService.activity()` | **Open — PST-26 finding** |
| Soft-delete gap: `stats()` groupBy skips `deletedAt` filter | P2 | `EdiQueueService.stats()` | **Open — PST-26 finding** |
| sendDocument marks SENT but doesn't invoke transport handler | P3 | `EdiGenerationService.sendDocument()` | **Open — PST-26 finding** |
| No @Cron/@Interval for automated queue processing or inbound polling | P3 | — | **Open — PST-26 finding** |

---

## 12. Tasks

### Quality Sprint (Active)
| Task ID | Title | Effort | Status |
|---------|-------|--------|--------|
| — | No EDI tasks in current sprint | — | — |

### Backlog — From PST-26 Tribunal (Priority)
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| EDI-013 | Add RolesGuard to EdiGeneration, EdiSend, EdiMappings, EdiQueue controllers | S (30min) | P1 |
| EDI-014 | Fix ISA ID uniqueness to be tenant-scoped in create() and update() | XS (15min) | P1 |
| EDI-015 | Add @Exclude to ftpPassword in TradingPartnerResponseDto (or encrypt at rest) | S (30min) | P1 |
| EDI-016 | Add deletedAt filter to TradingPartnersService.activity() and EdiQueueService.stats() | XS (15min) | P2 |

### Backlog (P3 Future)
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| EDI-001 | Verify and document all 38 endpoint behaviors | L (8h) | P3 |
| EDI-002 | Build Trading Partners CRUD pages | L (8-12h) | P3 |
| EDI-003 | Build Document Browser + Detail viewer | L (8-12h) | P3 |
| EDI-004 | Build Mapping Configuration UI | XL (12-16h) | P3 |
| EDI-005 | Build Queue Monitor dashboard | M (4-6h) | P3 |
| EDI-006 | Build EDI Generation UI (204/210/214/990/997) | L (8-12h) | P3 |
| EDI-007 | Implement real X12 parser (ISA/GS/ST segment handling) | XL (16-24h) | P3 |
| EDI-008 | Implement real X12 generators (replace JSON stubs) | XL (16-24h) | P3 |
| EDI-009 | Implement AS2 transport handler | XL (16-24h) | P3 |
| EDI-010 | Implement SFTP/FTP transport handler | L (8-12h) | P3 |
| EDI-011 | Add dead-letter queue + alerting + retry backoff | M (4-6h) | P3 |
| ~~EDI-012~~ | ~~Verify/create Prisma models for all EDI entities~~ | — | **Closed — PST-26 verified 9 models exist** |

---

## 13. Design Links

| Screen | Spec | Path |
|--------|------|------|
| EDI Design Spec 1 | Full spec | `dev_docs/12-Rabih-design-Process/24-edi/` (file 1 of 9) |
| EDI Design Spec 2 | Full spec | `dev_docs/12-Rabih-design-Process/24-edi/` (file 2 of 9) |
| EDI Design Spec 3 | Full spec | `dev_docs/12-Rabih-design-Process/24-edi/` (file 3 of 9) |
| EDI Design Spec 4 | Full spec | `dev_docs/12-Rabih-design-Process/24-edi/` (file 4 of 9) |
| EDI Design Spec 5 | Full spec | `dev_docs/12-Rabih-design-Process/24-edi/` (file 5 of 9) |
| EDI Design Spec 6 | Full spec | `dev_docs/12-Rabih-design-Process/24-edi/` (file 6 of 9) |
| EDI Design Spec 7 | Full spec | `dev_docs/12-Rabih-design-Process/24-edi/` (file 7 of 9) |
| EDI Design Spec 8 | Full spec | `dev_docs/12-Rabih-design-Process/24-edi/` (file 8 of 9) |
| EDI Design Spec 9 | Full spec | `dev_docs/12-Rabih-design-Process/24-edi/` (file 9 of 9) |

> Exact filenames in the design specs directory should be enumerated when this service is prioritized for development.

---

## 14. Delta vs Original Plan

| Original Plan | Actual | Delta |
|--------------|--------|-------|
| Enterprise-tier EDI integration | Backend CRUD production-quality, EDI-specific logic stubbed, no frontend | Partially behind plan |
| 210/214/990 transaction sets | 5 generator stubs (adds 204, 997), 8 types in enum (adds 211, 315, 322) | Exceeded plan (enum scope) |
| Trading partner management | Controller + sub-module with 8 endpoints, full CRUD + test/toggle/activity | Production-quality |
| Queue-based processing | Queue sub-module with 7 endpoints, but process() is a stub | Architecture in place, execution stubbed |
| Field mapping configurator | Mappings controller + sub-module, full CRUD, duplicate detection | Production-quality CRUD |
| Full test coverage | 7 spec files, 42 tests, 759 LOC | Good coverage of CRUD paths |
| Frontend screens from design specs | 0 of 9 screens built | Not started |
| Hub rated 2/10 | Verified 7.5/10 by PST-26 tribunal (+5.5 delta) | Hub was significantly outdated |

---

## 15. Dependencies

**Depends on:**
- Auth & Admin (01) — JWT authentication, tenant isolation, role-based access (4/8 controllers have full RolesGuard, 4/8 have JwtAuth only)
- TMS Core (05) — Load and order entities for EDI document mapping
- Accounting (08) — Invoice data for 210 generation
- PostgreSQL — 9 Prisma models for EDI document storage, trading partner records, control numbers, acknowledgments, batches, code lists, communication logs, event triggers
- EventEmitter — 8+ events for cross-service communication

**Depended on by:**
- No services currently depend on EDI — it is a standalone enterprise feature
- Future: Carrier service may consume 214 status updates
- Future: Load Planner may receive 990 tender responses

**Breaking change risk:** LOW — EDI is an isolated module with no downstream consumers yet. Changes are contained within `apps/api/src/modules/edi/`.
