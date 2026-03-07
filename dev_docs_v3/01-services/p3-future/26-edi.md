# Service Hub: EDI (26)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-07
> **Original definition:** `apps/api/src/modules/edi/`
> **Design specs:** `dev_docs/12-Rabih-design-Process/24-edi/` (9 files)
> **Priority:** P3 Future — EDI 210/214/990 transaction sets for enterprise customers

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | D (2/10) |
| **Confidence** | Medium — backend scanned, no frontend exists |
| **Last Verified** | 2026-03-07 |
| **Backend** | Partial — 8 controllers, 35 endpoints scaffolded |
| **Frontend** | Not Started — no pages, no components, no hooks |
| **Tests** | Minimal — 1 spec file (`control-number.service.spec.ts`) |
| **Priority** | P3 Future — enterprise-tier feature |
| **Active Sprint** | None — not in Quality Sprint scope |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Partial | No standalone service doc; logic lives in code |
| Design Specs | Done | 9 files in `dev_docs/12-Rabih-design-Process/24-edi/` |
| Backend Controllers | Scaffolded | 8 controllers, 35 endpoints in `apps/api/src/modules/edi/` |
| Prisma Models | Unknown | EDI-specific models not yet verified |
| Frontend Pages | Not Started | No routes exist |
| React Hooks | Not Started | No hooks exist |
| Components | Not Started | No components exist |
| Tests | Minimal | 1 spec file for control-number service |
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

| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/edi` | EdiController | Scaffolded | Main EDI overview/status |
| GET | `/api/v1/edi/stats` | EdiController | Scaffolded | EDI processing statistics |
| GET | `/api/v1/edi/documents` | EdiDocumentsController | Scaffolded | List EDI documents |
| GET | `/api/v1/edi/documents/:id` | EdiDocumentsController | Scaffolded | Single document detail |
| POST | `/api/v1/edi/documents` | EdiDocumentsController | Scaffolded | Receive/create EDI document |
| PUT | `/api/v1/edi/documents/:id` | EdiDocumentsController | Scaffolded | Update document status |
| DELETE | `/api/v1/edi/documents/:id` | EdiDocumentsController | Scaffolded | Archive/delete document |
| POST | `/api/v1/edi/documents/:id/reprocess` | EdiDocumentsController | Scaffolded | Reprocess failed document |
| GET | `/api/v1/edi/orders` | EdiOrdersController | Scaffolded | List EDI order integrations |
| POST | `/api/v1/edi/orders` | EdiOrdersController | Scaffolded | Create order from EDI |
| GET | `/api/v1/edi/orders/:id` | EdiOrdersController | Scaffolded | EDI order detail |
| PUT | `/api/v1/edi/orders/:id` | EdiOrdersController | Scaffolded | Update EDI order mapping |
| GET | `/api/v1/edi/loads` | EdiLoadsController | Scaffolded | List EDI load integrations |
| POST | `/api/v1/edi/loads` | EdiLoadsController | Scaffolded | Create load from EDI |
| GET | `/api/v1/edi/loads/:id` | EdiLoadsController | Scaffolded | EDI load detail |
| PUT | `/api/v1/edi/loads/:id` | EdiLoadsController | Scaffolded | Update EDI load mapping |
| GET | `/api/v1/edi/generate` | EdiGenerateController | Scaffolded | List generated documents |
| POST | `/api/v1/edi/generate/210` | EdiGenerateController | Scaffolded | Generate 210 invoice |
| POST | `/api/v1/edi/generate/214` | EdiGenerateController | Scaffolded | Generate 214 shipment status |
| POST | `/api/v1/edi/generate/990` | EdiGenerateController | Scaffolded | Generate 990 load tender response |
| POST | `/api/v1/edi/generate/batch` | EdiGenerateController | Scaffolded | Batch generate multiple documents |
| GET | `/api/v1/edi/mappings` | EdiMappingsController | Scaffolded | List field mappings |
| GET | `/api/v1/edi/mappings/:id` | EdiMappingsController | Scaffolded | Mapping detail |
| POST | `/api/v1/edi/mappings` | EdiMappingsController | Scaffolded | Create field mapping |
| PUT | `/api/v1/edi/mappings/:id` | EdiMappingsController | Scaffolded | Update field mapping |
| DELETE | `/api/v1/edi/mappings/:id` | EdiMappingsController | Scaffolded | Delete field mapping |
| POST | `/api/v1/edi/mappings/:id/test` | EdiMappingsController | Scaffolded | Test mapping with sample data |
| GET | `/api/v1/edi/queue` | EdiQueueController | Scaffolded | List queued EDI messages |
| GET | `/api/v1/edi/queue/:id` | EdiQueueController | Scaffolded | Queue item detail |
| POST | `/api/v1/edi/queue/:id/retry` | EdiQueueController | Scaffolded | Retry failed queue item |
| DELETE | `/api/v1/edi/queue/:id` | EdiQueueController | Scaffolded | Remove from queue |
| GET | `/api/v1/edi/trading-partners` | EdiTradingPartnersController | Scaffolded | List trading partners |
| GET | `/api/v1/edi/trading-partners/:id` | EdiTradingPartnersController | Scaffolded | Trading partner detail |
| POST | `/api/v1/edi/trading-partners` | EdiTradingPartnersController | Scaffolded | Create trading partner |
| PUT | `/api/v1/edi/trading-partners/:id` | EdiTradingPartnersController | Scaffolded | Update trading partner |
| DELETE | `/api/v1/edi/trading-partners/:id` | EdiTradingPartnersController | Scaffolded | Delete trading partner |

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

1. **EDI Transaction Types:** The system supports three ANSI X12 transaction sets: **210** (Motor Carrier Freight Details and Invoice) for billing carriers, **214** (Transportation Carrier Shipment Status Message) for shipment tracking updates, and **990** (Response to a Load Tender) for accepting or declining load tenders. Each transaction type has its own parsing and generation logic in dedicated sub-modules.

2. **Trading Partner Management:** Every EDI exchange is scoped to a registered trading partner. A trading partner record stores the partner's ISA/GS identifiers (qualifier + ID), communication protocol (AS2, SFTP, VAN), document format preferences, and active transaction set subscriptions. Partners must be validated and activated before any documents can be exchanged.

3. **Control Number Sequencing:** EDI documents require unique, sequential control numbers at three levels: ISA (interchange), GS (functional group), and ST (transaction set). The `control-number.service` manages atomic counter increments per trading partner per control number type. Control numbers must never be reused — gaps are acceptable but duplicates are protocol violations. This is the only sub-module with a spec file.

4. **Message Parsing:** Inbound EDI documents are parsed from raw X12 segment format (element/segment delimiters) into structured JSON. The `parsing/` sub-module handles segment identification, loop detection, and element extraction. Parsing errors create a failed document record with the raw payload preserved for manual inspection and reprocessing.

5. **Message Generation:** Outbound EDI documents are generated from TMS data (loads, invoices, status updates) using the `generation/` sub-module. Generation applies trading-partner-specific field mappings, inserts correct control numbers, and formats the output as valid X12 segments. Generated documents are placed in the outbound queue for transmission.

6. **Queue-Based Processing:** All EDI messages (inbound and outbound) flow through the `queue/` sub-module. Inbound messages are queued for parsing, validation, and mapping to TMS entities. Outbound messages are queued for generation, validation, and transmission. Failed items remain in the queue with error details and can be retried manually or automatically (configurable per trading partner).

7. **Field Mapping Configuration:** The `mappings/` sub-module allows per-trading-partner field mapping between X12 elements and TMS data fields. This handles partner-specific variations (e.g., different reference number qualifiers, custom fields, alternate date formats). Mappings can be tested against sample data before activation.

8. **Transport Layer:** The `transport/` sub-module handles the physical transmission of EDI documents via configured protocols (AS2, SFTP, VAN connectivity). Transport is decoupled from document processing — the queue dispatches to the appropriate transport handler based on trading partner configuration.

9. **Order and Load Integration:** EDI documents map to core TMS entities. Inbound 990 responses update load tender status. Inbound 214 messages create or update shipment tracking milestones. Outbound 210 invoices are generated from completed loads with accounting data. The `orders/` and `loads/` controllers manage these cross-service integrations.

10. **Tenant Isolation:** All EDI records (documents, trading partners, mappings, queue items, control numbers) are scoped to `tenantId`. A trading partner in Tenant A is completely separate from the same physical company registered in Tenant B.

---

## 8. Data Model

### EdiTradingPartner (projected)
```
EdiTradingPartner {
  id                String (UUID)
  tenantId          String (FK -> Tenant)
  name              String
  isaQualifier      String (2 chars, e.g., "ZZ", "01")
  isaId             String (15 chars, right-padded)
  gsId              String
  protocol          EdiProtocol (AS2, SFTP, VAN)
  protocolConfig    Json (host, port, credentials reference)
  transactionSets   String[] (e.g., ["210", "214", "990"])
  status            EdiPartnerStatus (ACTIVE, INACTIVE, TESTING)
  createdAt         DateTime
  updatedAt         DateTime
}
```

### EdiDocument (projected)
```
EdiDocument {
  id                String (UUID)
  tenantId          String (FK -> Tenant)
  tradingPartnerId  String (FK -> EdiTradingPartner)
  direction         EdiDirection (INBOUND, OUTBOUND)
  transactionSet    String (e.g., "210", "214", "990")
  controlNumber     String
  status            EdiDocStatus (QUEUED, PROCESSING, COMPLETED, FAILED, ARCHIVED)
  rawPayload        Text (original X12 content)
  parsedData        Json? (structured JSON after parsing)
  errorMessage      String?
  relatedEntityType String? (Load, Order, Invoice)
  relatedEntityId   String?
  processedAt       DateTime?
  createdAt         DateTime
  updatedAt         DateTime
}
```

### EdiControlNumber (projected)
```
EdiControlNumber {
  id                String (UUID)
  tenantId          String (FK -> Tenant)
  tradingPartnerId  String (FK -> EdiTradingPartner)
  numberType        EdiControlNumberType (ISA, GS, ST)
  currentValue      Int (auto-increment)
  updatedAt         DateTime
}
```

### EdiMapping (projected)
```
EdiMapping {
  id                String (UUID)
  tenantId          String (FK -> Tenant)
  tradingPartnerId  String (FK -> EdiTradingPartner)
  transactionSet    String
  name              String
  mappingRules      Json (array of { x12Segment, x12Element, tmsField, transform? })
  isActive          Boolean
  createdAt         DateTime
  updatedAt         DateTime
}
```

> **Note:** Data models are projected based on backend code structure. Prisma models have not been independently verified for this service.

---

## 9. Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| `tradingPartnerId` | IsUUID, must exist in tenant | "Invalid trading partner" |
| `isaQualifier` | Exactly 2 characters, alphanumeric | "ISA qualifier must be 2 characters" |
| `isaId` | Max 15 characters | "ISA ID must not exceed 15 characters" |
| `transactionSet` | IsIn(["210", "214", "990"]) | "Unsupported transaction set" |
| `direction` | IsEnum(INBOUND, OUTBOUND) | "Invalid direction" |
| `controlNumber` | Numeric string, unique per partner/type | "Control number already used" |
| `rawPayload` | Non-empty string, valid segment delimiters | "Invalid EDI payload format" |
| `mappingRules` | Valid JSON array, each rule has segment + element + tmsField | "Invalid mapping rule structure" |
| `protocol` | IsEnum(AS2, SFTP, VAN) | "Unsupported transport protocol" |
| `status` | IsEnum per entity type | "Invalid status value" |

---

## 10. Status States

### EDI Document Lifecycle
```
QUEUED -> PROCESSING (picked up by queue worker)
PROCESSING -> COMPLETED (parsed/generated successfully)
PROCESSING -> FAILED (parse error, validation error, transport error)
FAILED -> QUEUED (manual retry or auto-retry)
COMPLETED -> ARCHIVED (retention policy)
```

### Trading Partner Status
```
TESTING -> ACTIVE (partner validated, ready for production)
ACTIVE -> INACTIVE (disabled by admin)
INACTIVE -> ACTIVE (re-enabled by admin)
TESTING -> INACTIVE (abandoned setup)
```

### Queue Item Lifecycle
```
PENDING -> IN_PROGRESS (worker picks up)
IN_PROGRESS -> COMPLETED (success)
IN_PROGRESS -> FAILED (error — retryable)
IN_PROGRESS -> DEAD_LETTER (max retries exceeded)
FAILED -> PENDING (retry triggered)
```

---

## 11. Known Issues

| Issue | Severity | File | Status |
|-------|----------|------|--------|
| No frontend exists — entire UI must be built | P3 | — | Deferred |
| Backend endpoints are scaffolded but runtime behavior unverified | P3 | `apps/api/src/modules/edi/` | Open |
| Only 1 test file — no integration or E2E tests | P3 | `control-number.service.spec.ts` | Open |
| Prisma models not verified — data model may be incomplete | P3 | — | Open |
| Transport sub-module — AS2/SFTP handlers not confirmed working | P3 | `edi/transport/` | Open |
| No error alerting for failed EDI transmissions | P3 | — | Open |
| Queue processing — no dead-letter queue handling confirmed | P3 | `edi/queue/` | Open |

---

## 12. Tasks

### Quality Sprint (Active)
| Task ID | Title | Effort | Status |
|---------|-------|--------|--------|
| — | No EDI tasks in current sprint | — | — |

### Backlog (P3 Future)
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| EDI-001 | Verify and document all 35 endpoint behaviors | L (8h) | P3 |
| EDI-002 | Build Trading Partners CRUD pages | L (8-12h) | P3 |
| EDI-003 | Build Document Browser + Detail viewer | L (8-12h) | P3 |
| EDI-004 | Build Mapping Configuration UI | XL (12-16h) | P3 |
| EDI-005 | Build Queue Monitor dashboard | M (4-6h) | P3 |
| EDI-006 | Build EDI Generation UI (210/214/990) | L (8-12h) | P3 |
| EDI-007 | Write integration tests for parsing sub-module | M (4-6h) | P3 |
| EDI-008 | Write integration tests for generation sub-module | M (4-6h) | P3 |
| EDI-009 | Implement AS2 transport handler | XL (16-24h) | P3 |
| EDI-010 | Implement SFTP transport handler | L (8-12h) | P3 |
| EDI-011 | Add dead-letter queue + alerting | M (4-6h) | P3 |
| EDI-012 | Verify/create Prisma models for all EDI entities | M (4-6h) | P3 |

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
| Enterprise-tier EDI integration | Backend scaffolded, no frontend | Significantly behind plan |
| 210/214/990 transaction sets | All three sets have generation endpoints | On track (backend only) |
| Trading partner management | Controller + sub-module exist | Scaffolded, not production-tested |
| Queue-based processing | Queue sub-module exists | Architecture in place, runtime unverified |
| Field mapping configurator | Mappings controller + sub-module exist | Scaffolded, no UI |
| Full test coverage | 1 spec file only | Major gap |
| Frontend screens from design specs | 0 of 9 screens built | Not started |

---

## 15. Dependencies

**Depends on:**
- Auth & Admin (01) — JWT authentication, tenant isolation, role-based access
- TMS Core (05) — Load and order entities for EDI document mapping
- Accounting (08) — Invoice data for 210 generation
- PostgreSQL — EDI document storage, trading partner records, control numbers
- Queue infrastructure (Bull/Redis) — message processing pipeline

**Depended on by:**
- No services currently depend on EDI — it is a standalone enterprise feature
- Future: Carrier service may consume 214 status updates
- Future: Load Planner may receive 990 tender responses

**Breaking change risk:** LOW — EDI is an isolated module with no downstream consumers yet. Changes are contained within `apps/api/src/modules/edi/`.
