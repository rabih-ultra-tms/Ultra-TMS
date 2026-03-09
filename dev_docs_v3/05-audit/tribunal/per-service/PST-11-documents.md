# PST-11: Documents — Per-Service Tribunal Audit

> **Service:** Documents (#11) | **Priority:** P1 Post-MVP
> **Date:** 2026-03-08 | **Verdict:** MODIFY | **Health Score:** 7.0/10 (was 4.5/10, +2.5)

---

## Phase 1: Data Model Audit

### Hub Claims
- 3 models + 1 join table: Document, DocumentFolder, DocumentTemplate, DocumentFolderDocument

### Reality (Prisma Schema)
- **6 models**: Document, DocumentFolder, DocumentShare, DocumentTemplate, FolderDocument, GeneratedDocument

| Model | Hub Status | Actual Status | Accuracy |
|-------|-----------|---------------|----------|
| Document | Documented (~30 fields) | Exists (~37 fields) | ~80% — missing createdById, customFields, updatedById, ClaimDocument/ContractAmendment/AgentPayout/FactoringVerification relations |
| DocumentFolder | Documented (~7 fields) | Exists (~14 fields) | ~50% — missing path, entityType, entityId, isSystem, createdById, customFields, externalId, sourceSystem, updatedById, unique constraint |
| DocumentTemplate | Documented (~7 fields) | Exists (~22 fields) | ~30% — missing templateFormat, templateFilePath, paperSize, orientation, margins, includeLogo, logoPosition, headerContent, footerContent, status, language, createdById, customFields, externalId, sourceSystem, unique constraint |
| FolderDocument | Documented as "DocumentFolderDocument" (3 fields) | Exists as "FolderDocument" (10 fields) | ~30% — wrong name, missing addedBy, createdById, customFields, deletedAt, externalId, sourceSystem, updatedAt, updatedById |
| DocumentShare | **NOT DOCUMENTED** | Exists (18 fields) | 0% — full sharing system with tokens, passwords, view/download counts, expiration, recipient tracking |
| GeneratedDocument | **NOT DOCUMENTED** | Exists (15 fields) | 0% — template-based document generation with status tracking, data snapshots, entity association |

**Data Model Score: 3.5/10** — 2 models completely missing, 2 models <50% accurate, model name wrong on join table.

---

## Phase 2: Endpoint Audit

### Hub Claims
- 3 controllers, 20 endpoints (documents: 7, folders: 7, templates: 6)

### Reality (Active Module)
- 3 controllers, 20 endpoints — **MATCH** (first P1 service to match)

| Controller | Hub Count | Actual Count | Match |
|-----------|-----------|-------------|-------|
| DocumentsController | 7 | 7 | YES |
| DocumentFoldersController | 7 | 7 | YES |
| DocumentTemplatesController | 6 | 6 | YES |

### Hidden in .bak (2,243 LOC — NOT counted in active module)
The .bak module contains 5 controllers with ~12 additional endpoints that were built and abandoned:

| .bak Controller | Endpoints | Features |
|----------------|-----------|----------|
| SharesController | 4 | Create share, list shares, revoke share, update share |
| PublicSharesController | 2 | Get shared document (by token), download shared document |
| GenerationController | 3 | Generate document, batch generate, get generation status |
| EntityGenerationController | 3 | Generate Rate Confirmation, BOL, Invoice |

**Critical finding:** The active module has orphaned DTOs (`CreateDocumentShareDto`, `GenerateDocumentDto`) imported from .bak code but used by NO controller. These are dead code artifacts.

**Endpoint Score: 9/10** — Active counts match. .bak features undocumented.

---

## Phase 3: Frontend Audit

### Hub Component Claims

| Component | Hub Status | Reality |
|-----------|-----------|---------|
| DocumentUploadDialog (`tms/documents/`) | "Built" | **DOES NOT EXIST** — there is `DocumentUpload` in `components/shared/` |
| DocumentList (`tms/documents/`) | "Built" | YES — but it's a status-icon checklist, not a file list |
| DocumentCard (`tms/documents/`) | "Built" | **DOES NOT EXIST** |
| DocumentViewer (`tms/documents/`) | "Built" | **DOES NOT EXIST** |
| Carrier Docs Tab | "Built" | Unverified — carrier detail has document-related code |
| Load Docs Tab | "Built" | **YES** — `load-documents-tab.tsx` (252 LOC, fully functional) |

### Actual Frontend Components (not in hub)

| Component | Path | LOC | Description |
|-----------|------|-----|-------------|
| DocumentList | `tms/documents/document-list.tsx` | 135 | Status icon checklist (complete/pending/missing) |
| DocumentActions | `tms/documents/document-actions.tsx` | ? | Document action buttons |
| UploadZone | `tms/documents/upload-zone.tsx` | ? | Drag-and-drop upload zone |
| PermitList | `tms/documents/permit-list.tsx` | ? | Permit-specific document list |
| RateConPreview | `tms/documents/rate-con-preview.tsx` | ? | Rate confirmation preview |
| DocumentUpload | `shared/document-upload.tsx` | 307 | Full upload component with preview, validation, progress |
| LoadDocumentsTab | `tms/loads/load-documents-tab.tsx` | 252 | Integrated load document management |

### Hooks (Hub Claims vs Reality)

| Hook | Hub Status | Reality |
|------|-----------|---------|
| useDocuments | "Built" | YES — queries by entityType + entityId |
| useUploadDocument | "Built" | YES — sends FormData |
| useDeleteDocument | "Built" | YES — with cache invalidation |
| useDocumentDownloadUrl | "Built" | YES — on-demand signed URL fetch |

**4 hooks confirmed — hub is CORRECT on hooks.**

### Stories
- 2 story files exist: `Documents.stories.tsx`, `ComponentCatalog.stories.tsx`

**Frontend Score: 5/10** — Hub lists 3 phantom components. Actual components are different set. Hooks accurate. Integration components solid.

---

## Phase 4: Security Audit

| Controller | JwtAuthGuard | RolesGuard | Role Decorators | Custom Guards |
|-----------|-------------|------------|-----------------|---------------|
| DocumentsController | YES (class) | YES (class) | YES (every endpoint) | DocumentAccessGuard on findOne, download, update, delete |
| DocumentFoldersController | YES (class) | YES (class) | YES (every endpoint) | None |
| DocumentTemplatesController | YES (class) | YES (class) | YES (every endpoint) | None |

### DocumentAccessGuard Analysis
- **Sophisticated document-type-specific access control** (85 LOC)
- SUPER_ADMIN/ADMIN bypass
- W9/TAX documents restricted to ACCOUNTING only
- INSURANCE documents restricted to ACCOUNTING, OPERATIONS, COMPLIANCE, CARRIER_MANAGER
- CARRIER users scoped to their own carrier's documents
- CUSTOMER users scoped to their own company's documents
- Tenant context enforcement

**Security Score: 10/10** — 100% guard coverage + custom document-level access control. Best security implementation of any P1 service.

---

## Phase 5: Test Audit

### Hub Claims
- "7 spec files"

### Reality
- **4 spec files** (not 7):
  - `documents.service.spec.ts` (~28 test blocks)
  - `document-folders.service.spec.ts` (~20 test blocks)
  - `document-templates.service.spec.ts` (~12 test blocks)
  - `document-access.guard.spec.ts` (~17 test blocks)
- **~77 test blocks total** across 4 files
- Proper mocking patterns (PrismaService, StorageService)
- No controller-level tests (tests are at service/guard layer)

**Test Score: 7/10** — Hub overcounts files. Good service + guard coverage, missing controller integration tests.

---

## Phase 6: Critical Findings

### BUG-001: Upload Architecture Mismatch (HIGH)
- **Frontend** sends `FormData` (file + metadata) via `apiClient.post("/documents", formData)`
- **Backend** uses `@Body() createDto: CreateDocumentDto` — expects JSON, NOT multipart
- **No `@UseInterceptors(FileInterceptor)` or Multer** anywhere in active module
- **Backend expects `dto.filePath`** (a pre-existing storage path) — it doesn't handle file upload
- **Impact:** Document upload will NOT work as-is. Frontend and backend have incompatible expectations.
- **Resolution:** Either add FileInterceptor to controller, or change frontend to upload to S3 first then create record.

### BUG-002: entityType Optional in Schema, Required in Hub (MEDIUM)
- Prisma: `entityType String? @db.VarChar(50)` — nullable
- CreateDocumentDto: `@IsOptional() entityType?: EntityType` — optional
- Hub business rule #4: "Every document must be associated with an entity" — **contradicted by schema**
- **Impact:** Documents can be created without entity association, violating hub business rules

### FINDING-001: 2 Missing Prisma Models (HIGH — hub accuracy)
- **DocumentShare** — 18 fields, full sharing system (tokens, passwords, view counts, download limits, expiration)
- **GeneratedDocument** — 15 fields, template-based document generation with status tracking
- Both have Prisma models and .bak service implementations but zero documentation in hub

### FINDING-002: .bak Contains Production-Ready Features (MEDIUM)
- 2,243 LOC of sharing + generation features
- Shares: public document access via token, password protection, view/download limits
- Generation: Rate Confirmation, BOL, Invoice generation from templates
- Entity-specific generation endpoints (`loads/:id/rate-confirm`, `loads/:id/bol`, `orders/:id/invoice`)
- **Decision needed:** Migrate to active module or permanently discard?

### FINDING-003: Orphaned DTOs in Active Module (LOW)
- `CreateDocumentShareDto` and `GenerateDocumentDto` are exported from `dto/index.ts`
- No controller in the active module uses them
- Left over from .bak migration — dead code

### FINDING-004: POD-to-Invoice Trigger (MEDIUM)
- LoadDocumentsTab triggers `triggerEmail("delivery_confirmation", ...)` when POD uploaded on delivered load
- But NO invoice auto-creation logic found — hub says "POD upload triggers invoicing cycle"
- Email notification works; invoice creation does NOT

### FINDING-005: Versioning — Partial Implementation (LOW)
- `findOne()` includes `childDocuments` and `parentDocument` relations
- No service method to create a new version (increment version, set parentDocumentId, update isLatestVersion on parent)
- Schema supports it; service layer does not

---

## Phase 7: Known Issues Verification

| # | Hub Issue | Hub Status | Verified Status | Notes |
|---|-----------|-----------|----------------|-------|
| 1 | documents.bak directory exists | Open | **TRUE** | 2,243 LOC, 12 files, 5 controllers |
| 2 | No frontend pages | Open | **TRUE** | 0 dedicated routes |
| 3 | No hooks or components | FIXED | **CORRECT** | 4 hooks, 7+ components |
| 4 | No tests for controllers | Partial | **MOSTLY TRUE** | 4 spec files exist but test services/guards, not controllers |
| 5 | POD-to-invoice trigger | Open | **TRUE** — email works, invoice creation missing |
| 6 | OCR no service | Open | **PARTIALLY FALSE** — `updateOcrText()` method exists in service |
| 7 | Versioning unverified | Open | **TRUE** — schema supports, service does not implement version chains |
| 8 | Public access token unverified | Open | **TRUE** — isPublic set on create, no token generation logic |
| 9 | Data model was wrong | Fixed | **STILL WRONG** — 2 models missing, 2 models <50% accurate |

**Known Issues Score: 6/10** — Issue #9 "Fixed" is FALSE (still has major gaps). Issue #6 partially fixed. 1 false closure.

---

## Phase 8: Hub Corrections Required

### Section 2 (Implementation Status)
- Add DocumentShare model status
- Add GeneratedDocument model status
- Change "Prisma Models: Done" to note only 4/6 models documented

### Section 5 (Components)
- Remove: DocumentUploadDialog, DocumentCard, DocumentViewer (don't exist)
- Add: UploadZone, PermitList, RateConPreview, DocumentActions (in tms/documents/)
- Add: DocumentUpload (in shared/)
- Add: LoadDocumentsTab (in tms/loads/)

### Section 8 (Data Model)
- Add DocumentShare model (18 fields)
- Add GeneratedDocument model (15 fields)
- Fix DocumentFolder: add path, entityType, entityId, isSystem, createdById, customFields, externalId, sourceSystem, updatedById + unique constraint
- Fix DocumentTemplate: add templateFormat, templateFilePath, paperSize, orientation, margins, includeLogo, logoPosition, headerContent, footerContent, status, language, createdById, customFields, externalId, sourceSystem + unique constraint
- Rename DocumentFolderDocument → FolderDocument, add missing fields

### Section 11 (Known Issues)
- Add BUG: Upload architecture mismatch (frontend FormData vs backend @Body DTO)
- Add BUG: entityType optional vs required contradiction
- Fix issue #9: Data model STILL wrong (not "Fixed")
- Add: Orphaned DTOs in active module (dead code)
- Update issue #6: updateOcrText() service method exists

### Section 12 (Tasks)
- Add task: Resolve upload architecture mismatch
- Add task: Migrate or discard .bak sharing/generation features
- Add task: Clean up orphaned DTOs
- Add task: Implement version chain management in service layer

---

## Scoring Summary

| Dimension | Score | Notes |
|-----------|-------|-------|
| Backend Architecture | 8.5/10 | Clean controllers, services, guards, storage integration |
| Backend Security | 10/10 | 100% guard coverage + custom DocumentAccessGuard |
| Backend Tests | 7/10 | 77 test blocks, 4 spec files, service+guard coverage |
| Frontend | 5/10 | No pages, but solid embedded components + hooks |
| Hub Data Model Accuracy | 3.5/10 | 2 missing models, 2 <50% accurate, wrong join table name |
| Hub Frontend Accuracy | 3/10 | 3 phantom components, missing 4 real components |
| Hub Endpoint Accuracy | 9/10 | Count matches! First service to achieve this |
| Known Issues Accuracy | 6/10 | 1 false closure, 1 partial |

**Overall Health: 7.0/10** (was 4.5/10, delta +2.5)

---

## Verdict: MODIFY

The Documents service backend is significantly better than the hub suggests — clean architecture, excellent security with a custom document-type-aware access guard, solid test coverage, and proper storage integration. However, the hub has critical accuracy problems: 2 entirely missing Prisma models (DocumentShare, GeneratedDocument), 3 phantom frontend components, and a still-incorrect data model section marked as "Fixed."

The most critical bug is the upload architecture mismatch — the frontend sends multipart FormData but the backend expects a JSON DTO with a pre-existing `filePath`. This means document upload is currently broken unless there's an upload-to-S3 step we haven't found.

The .bak module contains 2,243 LOC of sharing and document generation features that need a go/no-go decision rather than lingering as abandoned code.

---

## Action Items

| # | Action | Priority | Effort |
|---|--------|----------|--------|
| 1 | Fix hub data model section: add DocumentShare + GeneratedDocument models, fix DocumentFolder (7+ missing fields), fix DocumentTemplate (15+ missing fields), rename join table | P0 | 30min |
| 2 | Fix hub component inventory: remove 3 phantom, add 4 real components | P0 | 15min |
| 3 | Fix BUG-001: Resolve upload architecture mismatch (FileInterceptor or S3-first flow) | P0 | 2-3h |
| 4 | Fix hub known issue #9: mark as STILL OPEN, not "Fixed" | P0 | 5min |
| 5 | Decision: migrate .bak sharing/generation to active module or delete | P1 | 30min decision |
| 6 | Fix BUG-002: Make entityType required in DTO or update hub business rules | P1 | 15min |
| 7 | Clean up orphaned DTOs (CreateDocumentShareDto, GenerateDocumentDto) | P1 | 10min |
| 8 | Implement POD-to-invoice trigger (not just email notification) | P1 | 2-3h |
| 9 | Implement version chain management in service layer | P2 | 2h |
| 10 | Add public access token generation logic | P2 | 1h |
| 11 | Update hub test count: 4 spec files (not 7), ~77 test blocks | P2 | 5min |
