# Service Hub: Documents (11)

> **Priority:** P1 Post-MVP | **Status:** Backend Exists (20 endpoints), Frontend Partial (hooks + components, no pages)
> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-09 (PST-11 tribunal)
> **Design specs:** `dev_docs/12-Rabih-design-Process/10-documents/` (8 files)
> **Tribunal file:** `dev_docs_v3/05-audit/tribunal/per-service/PST-11-documents.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | B- (7.0/10) |
| **Confidence** | High — code-verified via PST-11 tribunal |
| **Last Verified** | 2026-03-09 |
| **Backend** | 3 controllers, 20 endpoints (first P1 service with exact endpoint match), `documents.bak` directory (2,243 LOC, QS-009) |
| **Frontend** | No dedicated pages. 5 components in `tms/documents/`, 1 shared upload component, document UI embedded in Load Detail and Carrier Detail |
| **Hooks** | 4 hooks in `lib/hooks/documents/use-documents.ts` (useDocuments, useUploadDocument, useDeleteDocument, useDocumentDownloadUrl) |
| **Tests** | Backend: 4 spec files, ~77 test blocks (services + guard coverage, no controller tests) |
| **Prisma Models** | 6 models: Document, DocumentFolder, FolderDocument, DocumentTemplate, DocumentShare, GeneratedDocument |
| **Security** | 100% guard coverage + custom DocumentAccessGuard (document-type-aware access control) |
| **Design Specs** | 8 files in `dev_docs/12-Rabih-design-Process/10-documents/` |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | 8 design spec files cover full vision |
| Backend Controllers | Done | 3 controllers: documents (7), folders (7), templates (6) = 20 endpoints |
| Backend Service | Done | DocumentsService, DocumentFoldersService, DocumentTemplatesService |
| Prisma Models | Partial | 6 models exist but hub previously documented only 4 (missing DocumentShare, GeneratedDocument) |
| Frontend Pages | Not Built | No `/documents` route, no dedicated screens |
| Hooks | Built | 4 hooks in `lib/hooks/documents/use-documents.ts`: useDocuments, useUploadDocument, useDeleteDocument, useDocumentDownloadUrl |
| Components | Partial | 5 components in `tms/documents/`, 1 shared upload component, 1 load-embedded tab |
| Tests | Partial | 4 spec files (~77 test blocks): 3 service specs + 1 guard spec. No controller tests |
| Storage | Partial | S3-compatible storage pattern referenced; `storageProvider` defaults to "S3" |
| OCR | Partial | Fields exist in Prisma (ocrProcessed, ocrText, ocrProcessedAt); `updateOcrText()` service method exists but no OCR processing pipeline |
| Versioning | Schema Only | Fields exist (version, parentDocumentId, isLatestVersion). `findOne()` includes child/parent relations but no service method to create version chains |
| Security | Done | JwtAuthGuard + RolesGuard on all 3 controllers, custom DocumentAccessGuard on 4 document endpoints |

---

## 3. Screens

| Screen | Route | Status | Design Spec | Notes |
|--------|-------|--------|-------------|-------|
| Document Library | `/documents` | Not Built | `01-document-library.md` | Searchable doc repository with folder navigation |
| Document Viewer | `/documents/[id]` | Not Built | `02-document-viewer.md` | PDF/image preview with metadata sidebar |
| Document Upload | `/documents/upload` | Not Built | `03-document-upload.md` | Standalone upload; currently only embedded in other screens |
| Template Manager | `/documents/templates` | Not Built | `04-template-manager.md` | Backend has 6 template endpoints ready |
| Template Editor | `/documents/templates/[id]/edit` | Not Built | `05-template-editor.md` | WYSIWYG template editing |
| E-Signature | `/documents/[id]/sign` | Not Built | `06-e-signature.md` | Digital signature workflow |
| Document Scanner | N/A (mobile) | Not Built | `07-document-scanner.md` | Mobile camera capture |
| Document Reports | `/documents/reports` | Not Built | `08-document-reports.md` | Analytics and compliance reports |
| Load Detail (embedded) | `/operations/loads/[id]` | Built | N/A | `load-documents-tab.tsx` (252 LOC, fully functional) |
| Carrier Detail (embedded) | `/carriers/[id]` | Partial | N/A | Document tab on carrier detail page |

---

## 4. API Endpoints

### DocumentsController -- `@Controller('documents')`

| Method | Path | Status | Guards | Notes |
|--------|------|--------|--------|-------|
| POST | `/api/v1/documents` | Built | JWT + Roles | Create document record (expects JSON DTO with filePath, NOT multipart -- see BUG-001) |
| GET | `/api/v1/documents` | Built | JWT + Roles | List documents with filters |
| GET | `/api/v1/documents/entity/:entityType/:entityId` | Built | JWT + Roles | Get documents by entity association |
| GET | `/api/v1/documents/:id` | Built | JWT + Roles + DocumentAccessGuard | Get document metadata by ID |
| GET | `/api/v1/documents/:id/download` | Built | JWT + Roles + DocumentAccessGuard | Download/stream file content |
| PATCH | `/api/v1/documents/:id` | Built | JWT + Roles + DocumentAccessGuard | Update document metadata |
| DELETE | `/api/v1/documents/:id` | Built | JWT + Roles + DocumentAccessGuard | Soft-delete document |

### DocumentFoldersController -- `@Controller('documents/folders')`

| Method | Path | Status | Guards | Notes |
|--------|------|--------|--------|-------|
| POST | `/api/v1/documents/folders` | Built | JWT + Roles | Create folder |
| GET | `/api/v1/documents/folders` | Built | JWT + Roles | List folders |
| GET | `/api/v1/documents/folders/:id` | Built | JWT + Roles | Get folder by ID |
| PATCH | `/api/v1/documents/folders/:id` | Built | JWT + Roles | Update folder |
| DELETE | `/api/v1/documents/folders/:id` | Built | JWT + Roles | Delete folder |
| POST | `/api/v1/documents/folders/:id/documents` | Built | JWT + Roles | Add document to folder |
| DELETE | `/api/v1/documents/folders/:id/documents/:documentId` | Built | JWT + Roles | Remove document from folder |

### DocumentTemplatesController -- `@Controller('documents/templates')`

| Method | Path | Status | Guards | Notes |
|--------|------|--------|--------|-------|
| POST | `/api/v1/documents/templates` | Built | JWT + Roles | Create template |
| GET | `/api/v1/documents/templates` | Built | JWT + Roles | List templates |
| GET | `/api/v1/documents/templates/default/:templateType` | Built | JWT + Roles | Get default template by type |
| GET | `/api/v1/documents/templates/:id` | Built | JWT + Roles | Get template by ID |
| PATCH | `/api/v1/documents/templates/:id` | Built | JWT + Roles | Update template |
| DELETE | `/api/v1/documents/templates/:id` | Built | JWT + Roles | Delete template |

**Total: 20 endpoints across 3 controllers (all built, all auth-guarded, first P1 service with exact endpoint match)**

### .bak Module (2,243 LOC -- NOT active, decision needed)

| .bak Controller | Endpoints | Features |
|----------------|-----------|----------|
| SharesController | 4 | Create share, list shares, revoke share, update share |
| PublicSharesController | 2 | Get shared document (by token), download shared document |
| GenerationController | 3 | Generate document, batch generate, get generation status |
| EntityGenerationController | 3 | Generate Rate Confirmation, BOL, Invoice |

---

## 5. Components

### Built Components

| Component | Path | Status | Notes |
|-----------|------|--------|-------|
| DocumentList | `components/tms/documents/document-list.tsx` | Built | Status icon checklist (complete/pending/missing), 135 LOC |
| DocumentActions | `components/tms/documents/document-actions.tsx` | Built | Document action buttons |
| UploadZone | `components/tms/documents/upload-zone.tsx` | Built | Drag-and-drop upload zone |
| PermitList | `components/tms/documents/permit-list.tsx` | Built | Permit-specific document list |
| RateConPreview | `components/tms/documents/rate-con-preview.tsx` | Built | Rate confirmation preview |
| DocumentUpload | `components/shared/document-upload.tsx` | Built | Full upload component with preview, validation, progress (307 LOC) |
| LoadDocumentsTab | `components/tms/loads/load-documents-tab.tsx` | Built | Integrated load document management (252 LOC) |

### Not Built

| Component | Path | Status | Notes |
|-----------|------|--------|-------|
| DocumentLibrary | `components/documents/document-library.tsx` | Not Built | Standalone library view with search/filter |
| FolderTree | `components/documents/folder-tree.tsx` | Not Built | Folder navigation sidebar |
| TemplateManager | `components/documents/template-manager.tsx` | Not Built | Template list/management |

### Stories

- 2 story files: `Documents.stories.tsx`, `ComponentCatalog.stories.tsx`

---

## 6. Hooks

| Hook | Path | Status | Notes |
|------|------|--------|-------|
| useDocuments | `lib/hooks/documents/use-documents.ts` | Built | List/search documents by entityType + entityId with React Query |
| useUploadDocument | `lib/hooks/documents/use-documents.ts` | Built | Upload document mutation (sends FormData) |
| useDeleteDocument | `lib/hooks/documents/use-documents.ts` | Built | Delete document mutation with cache invalidation |
| useDocumentDownloadUrl | `lib/hooks/documents/use-documents.ts` | Built | On-demand signed URL fetch |
| useEntityDocuments | `lib/hooks/documents/use-entity-documents.ts` | Not Built | Docs by entityType + entityId (may be covered by useDocuments filter) |
| useDocumentFolders | `lib/hooks/documents/use-document-folders.ts` | Not Built | Folder CRUD |
| useDocumentTemplates | `lib/hooks/documents/use-document-templates.ts` | Not Built | Template CRUD |

**Current state: 4 hooks built in a single file (`use-documents.ts`). All 4 confirmed working by tribunal. Folder and template hooks not yet built.**

---

## 7. Business Rules

1. **Document Types:** BOL (Bill of Lading), POD (Proof of Delivery), RATE_CON (Rate Confirmation), INSURANCE_CERT, DRIVER_LICENSE, INVOICE, SETTLEMENT, CLAIM_EVIDENCE, OTHER. Stored as `VarChar(50)` -- not an enum, allowing future extension.
2. **Storage:** Files stored in S3-compatible storage (configured via env vars). Database holds metadata only (fileName, filePath, bucketName, storageProvider). Never store file content in the database.
3. **Size Limits:** Max 25MB per file. Accepted formats: PDF, JPG, PNG, DOCX, XLSX. Other formats rejected at upload.
4. **Entity Association:** Documents SHOULD be associated with an entity via `entityType` + `entityId`. Additional convenience FKs exist: `loadId`, `orderId`, `carrierId`, `companyId`. **Note:** `entityType` is OPTIONAL in both Prisma schema (`String?`) and DTO (`@IsOptional()`), contradicting the strictness implied here -- see BUG-002.
5. **POD Workflow:** POD upload on a delivered load triggers `triggerEmail("delivery_confirmation", ...)`. **Note:** Auto-invoice creation is NOT implemented -- email notification works, but no invoice auto-creation logic exists (see FINDING-004).
6. **Retention:** Documents retained 7 years per FMCSA and accounting regulations. Soft delete via `deletedAt`. Hard delete requires SUPER_ADMIN and legal review flag. `retentionDate` field tracks per-document retention.
7. **OCR:** Prisma model supports OCR processing (`ocrProcessed`, `ocrText`, `ocrProcessedAt`). `updateOcrText()` service method exists for storing results, but no OCR processing pipeline is implemented.
8. **Versioning:** Documents support versioning via `version` (Int, default 1), `parentDocumentId` (FK to prior version), and `isLatestVersion` (Boolean). `findOne()` includes childDocuments/parentDocument relations. **Note:** No service method exists to create version chains (increment version, set parentDocumentId, update isLatestVersion on parent).
9. **Public Access:** Documents can be made publicly accessible via `isPublic` flag with time-limited `accessToken` and `accessExpiresAt`. **Note:** `isPublic` is set on create, but no token generation logic exists in active module. Full sharing system exists in .bak (DocumentShare model + SharesController).
10. **Folder Organization:** Documents can be organized into folders via `DocumentFolder` model. Many-to-many relationship through `FolderDocument` join table. A document can exist in multiple folders.
11. **Templates:** `DocumentTemplate` model supports reusable document templates (BOL templates, rate confirmation templates). `default/:templateType` endpoint returns the default template for a given type. Rich template formatting options (paperSize, orientation, margins, header/footer, logo) exist in schema but are not documented in older hub versions.
12. **Tags:** Documents support a `tags` field (`String[]`) for flexible categorization beyond `documentType`.
13. **documents.bak:** Abandoned refactor directory at `apps/api/src/modules/documents.bak/`. Contains 2,243 LOC with sharing (4 endpoints) + document generation (6 endpoints, including Rate Con, BOL, Invoice). Active module is `apps/api/src/modules/documents/`. Cleanup tracked in QS-009.
14. **Document Access Control:** Custom `DocumentAccessGuard` (85 LOC) enforces document-type-specific access: W9/TAX restricted to ACCOUNTING only, INSURANCE restricted to ACCOUNTING/OPERATIONS/COMPLIANCE/CARRIER_MANAGER, CARRIER/CUSTOMER users scoped to own entities. SUPER_ADMIN/ADMIN bypass all restrictions.

---

## 8. Data Model

### Document (Prisma -- verified, ~37 fields)

```
Document {
  id                  String    @id @default(uuid())
  tenantId            String
  externalId          String?
  sourceSystem        String?
  name                String
  description         String?
  documentType        String    @db.VarChar(50)
  fileName            String
  filePath            String
  fileSize            Int
  mimeType            String
  fileExtension       String?
  storageProvider     String    @default("S3")
  bucketName          String?
  entityType          String?   @db.VarChar(50)   // NULLABLE -- not required
  entityId            String?
  loadId              String?   (FK -> Load)
  orderId             String?   (FK -> Order)
  carrierId           String?   (FK -> Carrier)
  companyId           String?   (FK -> Company)
  status              String    @default("ACTIVE")
  ocrProcessed        Boolean   @default(false)
  ocrText             String?
  ocrProcessedAt      DateTime?
  metadata            Json?
  customFields        Json?
  tags                String[]
  version             Int       @default(1)
  parentDocumentId    String?   (FK -> Document, self-referential)
  isLatestVersion     Boolean   @default(true)
  isPublic            Boolean   @default(false)
  accessToken         String?
  accessExpiresAt     DateTime?
  retentionDate       DateTime?
  uploadedBy          String
  createdById         String?
  updatedById         String?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  deletedAt           DateTime?
  // Relations: ClaimDocument, ContractAmendment, AgentPayout, FactoringVerification
}
```

### DocumentFolder (Prisma -- verified, ~14 fields)

```
DocumentFolder {
  id            String    @id @default(uuid())
  tenantId      String
  externalId    String?
  sourceSystem  String?
  name          String
  description   String?
  path          String?           // folder path for nested hierarchy
  entityType    String?           // entity association
  entityId      String?           // entity association
  isSystem      Boolean?          // system-managed folder flag
  parentId      String?           (FK -> DocumentFolder, self-referential for nesting)
  createdById   String?
  updatedById   String?
  customFields  Json?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?
  @@unique([tenantId, name, parentId])
}
```

### FolderDocument (Join Table -- verified, ~10 fields)

```
FolderDocument {
  folderId      String    (FK -> DocumentFolder)
  documentId    String    (FK -> Document)
  addedBy       String?
  createdById   String?
  customFields  Json?
  externalId    String?
  sourceSystem  String?
  deletedAt     DateTime?
  addedAt       DateTime  @default(now())
  updatedAt     DateTime?
  updatedById   String?
  @@id([folderId, documentId])
}
```

### DocumentTemplate (Prisma -- verified, ~22 fields)

```
DocumentTemplate {
  id                String    @id @default(uuid())
  tenantId          String
  externalId        String?
  sourceSystem      String?
  name              String
  templateType      String
  templateFormat    String?         // HTML, PDF, DOCX, etc.
  templateFilePath  String?         // path to template file
  content           String?
  paperSize         String?         // A4, Letter, etc.
  orientation       String?         // portrait, landscape
  margins           Json?           // top, right, bottom, left
  includeLogo       Boolean?        // include company logo
  logoPosition      String?         // top-left, top-right, center
  headerContent     String?         // header HTML/text
  footerContent     String?         // footer HTML/text
  status            String?         // ACTIVE, DRAFT, ARCHIVED
  language          String?         // en, es, fr, etc.
  isDefault         Boolean   @default(false)
  createdById       String?
  customFields      Json?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  deletedAt         DateTime?
  @@unique([tenantId, name, templateType])
}
```

### DocumentShare (Prisma -- verified, 18 fields) -- PREVIOUSLY UNDOCUMENTED

```
DocumentShare {
  id              String    @id @default(uuid())
  tenantId        String
  documentId      String    (FK -> Document)
  shareToken      String    @unique          // public access token
  password        String?                    // optional password protection
  recipientEmail  String?
  recipientName   String?
  viewCount       Int       @default(0)      // track views
  downloadCount   Int       @default(0)      // track downloads
  maxDownloads    Int?                        // download limit
  maxViews        Int?                        // view limit
  expiresAt       DateTime?                  // expiration date
  isActive        Boolean   @default(true)
  revokedAt       DateTime?
  revokedBy       String?
  createdById     String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

### GeneratedDocument (Prisma -- verified, 15 fields) -- PREVIOUSLY UNDOCUMENTED

```
GeneratedDocument {
  id              String    @id @default(uuid())
  tenantId        String
  documentId      String?   (FK -> Document)
  templateId      String    (FK -> DocumentTemplate)
  entityType      String                    // Load, Order, Invoice, etc.
  entityId        String
  status          String    @default("PENDING")  // PENDING, GENERATING, COMPLETED, FAILED
  generatedAt     DateTime?
  dataSnapshot    Json?                     // snapshot of data used for generation
  errorMessage    String?
  createdById     String?
  customFields    Json?
  externalId      String?
  sourceSystem    String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

---

## 9. Validation Rules

| Field | Rule | Notes |
|-------|------|-------|
| name | Required, non-empty string | Document display name |
| fileName | Required, non-empty string | Original uploaded file name |
| filePath | Required | S3 key / storage path (backend expects this pre-populated) |
| fileSize | Required, max 25MB (26,214,400 bytes) | Validated at upload |
| mimeType | Required, must be in allowed list | PDF, JPG, PNG, DOCX, XLSX |
| entityType | Optional (`@IsOptional()`) | Contradicts business rule #4 -- see BUG-002 |
| entityId | Optional when entityType is optional | Must reference existing entity when provided |
| documentType | Required, max 50 chars | BOL, POD, RATE_CON, INSURANCE_CERT, etc. |
| tenantId | Required, injected from auth context | Multi-tenant isolation |
| version | Integer >= 1 | Auto-incremented on new version upload |
| accessToken | Auto-generated when isPublic = true | UUID or secure random string |
| accessExpiresAt | Required when isPublic = true | Must be future datetime |
| tags | Optional, array of strings | No duplicates within array |
| Folder name | Required, non-empty | For DocumentFolder creation |
| Template name | Required, non-empty | For DocumentTemplate creation |
| Template templateType | Required | Determines default lookup key |

---

## 10. Status States

### Document Status

```
ACTIVE (default) -> ARCHIVED -> (soft-deleted via deletedAt)
```

| Status | Description | Transitions To |
|--------|-------------|----------------|
| ACTIVE | Document is current and accessible | ARCHIVED |
| ARCHIVED | Document retained but not actively shown | ACTIVE (restore) |
| (deletedAt set) | Soft-deleted, retained per FMCSA 7-year rule | Hard delete (SUPER_ADMIN only) |

### GeneratedDocument Status

```
PENDING -> GENERATING -> COMPLETED
                      -> FAILED
```

| Status | Description |
|--------|-------------|
| PENDING | Generation request received |
| GENERATING | Template processing in progress |
| COMPLETED | Document generated successfully |
| FAILED | Generation failed (see errorMessage) |

### OCR Processing States

| State | ocrProcessed | ocrText | ocrProcessedAt |
|-------|-------------|---------|----------------|
| Not Processed | false | null | null |
| Processing | false | null | null |
| Completed | true | populated | timestamp |
| Failed | true | null | timestamp |

### Version States

| isLatestVersion | Meaning |
|----------------|---------|
| true | Current active version displayed by default |
| false | Superseded by a newer version |

---

## 11. Known Issues

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| BUG-001: Upload architecture mismatch -- frontend sends FormData, backend expects JSON DTO with pre-existing `filePath` (no FileInterceptor/Multer) | P0 BUG | **Open** | Document upload will NOT work as-is. Need FileInterceptor or S3-first upload flow |
| BUG-002: entityType optional in schema + DTO but business rule #4 says required | P1 BUG | **Open** | Documents can be created without entity association |
| `documents.bak` directory exists -- 2,243 LOC sharing + generation features | P1 | Open | QS-009 task. Decision needed: migrate or delete |
| No frontend pages -- 0 dedicated routes | P1 | Open | 8 design specs exist, none built |
| POD-to-invoice trigger incomplete | P1 | Open | Email notification works, invoice auto-creation does NOT |
| Orphaned DTOs in active module (CreateDocumentShareDto, GenerateDocumentDto) | P2 | Open | Dead code from .bak migration, exported but used by no controller |
| OCR: `updateOcrText()` exists but no processing pipeline | P2 | Open | Service can store results but can't process documents |
| Versioning: schema supports but service doesn't implement version chains | P2 | Open | `findOne()` includes relations, no create-version method |
| Public access: `isPublic` set on create but no token generation logic | P2 | Open | Full sharing system in .bak but not in active module |
| No controller-level tests | P2 | Open | 4 spec files test services + guard only |

**Resolved Issues (closed during PST-11 tribunal):**
- ~~No hooks or components~~ — FIXED: 4 hooks built, 5+ components in `tms/documents/`
- ~~Data model in previous hub was wrong~~ — FIXED: Hub now documents all 6 Prisma models with correct field counts

---

## 12. Tasks

### Completed (verified by PST-11 tribunal)
| Task ID | Title | Status |
|---------|-------|--------|
| DOC-004 | QA existing useDocuments hooks (4 built) | **Done** — all 4 hooks confirmed working |

### Open (from tribunal findings)
| Task ID | Title | Effort | Priority | Notes |
|---------|-------|--------|----------|-------|
| DOC-014 | Resolve upload architecture mismatch (BUG-001) | M (2-3h) | P0 | Add FileInterceptor to controller OR change frontend to S3-first upload |
| DOC-015 | Decision: migrate .bak sharing/generation to active module or delete | S (30min decision) | P1 | 2,243 LOC with Rate Con, BOL, Invoice generation |
| DOC-016 | Clean up orphaned DTOs (CreateDocumentShareDto, GenerateDocumentDto) | XS (10min) | P1 | Dead code in active module |
| DOC-017 | Make entityType required in DTO or update business rules | XS (15min) | P1 | BUG-002 fix |
| DOC-001 | Build Document Library page (`/documents`) | L (6-8h) | P1 | Design spec: `01-document-library.md` |
| DOC-002 | Build Document Viewer page (`/documents/[id]`) | M (4h) | P1 | Design spec: `02-document-viewer.md` |
| DOC-003 | Build Document Upload component (standalone) | M (3-4h) | P1 | Design spec: `03-document-upload.md`, drag-and-drop |
| DOC-005 | Add upload progress tracking to useUploadDocument | S (1h) | P1 | Hook exists but may lack progress callback |
| DOC-006 | Build useEntityDocuments hook (or verify useDocuments covers it) | S (1h) | P1 | For Load Detail / Carrier Detail embedded views |
| DOC-009 | Write controller tests (20 endpoints) | L (6h) | P1 | Zero controller coverage |
| DOC-010 | Implement POD-to-invoice trigger | S (1-2h) | P1 | Email works, invoice auto-creation missing |
| DOC-018 | Implement version chain management in service layer | M (2h) | P2 | Schema supports; service method needed |
| DOC-019 | Implement public access token generation | S (1h) | P2 | isPublic/accessToken fields exist |
| DOC-007 | Build Template Manager page | M (4h) | P2 | Design spec: `04-template-manager.md`, backend ready |
| DOC-008 | Resolve documents.bak -- merge or delete | S (1h) | P1 | QS-009 task |
| DOC-011 | Implement OCR processing pipeline | XL (10h+) | P2 | Fields ready in schema, need service |
| DOC-013 | Build Folder Tree navigation component | M (3h) | P2 | Backend folder endpoints ready |

---

## 13. Design Links

| File | Path | Content |
|------|------|---------|
| Document Library | `dev_docs/12-Rabih-design-Process/10-documents/01-document-library.md` | Searchable repository with folder navigation |
| Document Viewer | `dev_docs/12-Rabih-design-Process/10-documents/02-document-viewer.md` | PDF/image preview with metadata |
| Document Upload | `dev_docs/12-Rabib-design-Process/10-documents/03-document-upload.md` | Drag-and-drop upload flow |
| Template Manager | `dev_docs/12-Rabih-design-Process/10-documents/04-template-manager.md` | Template list and management |
| Template Editor | `dev_docs/12-Rabih-design-Process/10-documents/05-template-editor.md` | WYSIWYG template editing |
| E-Signature | `dev_docs/12-Rabih-design-Process/10-documents/06-e-signature.md` | Digital signature workflow |
| Document Scanner | `dev_docs/12-Rabih-design-Process/10-documents/07-document-scanner.md` | Mobile camera capture |
| Document Reports | `dev_docs/12-Rabih-design-Process/10-documents/08-document-reports.md` | Analytics and compliance |

---

## 14. Delta vs Original Plan

| Area | Original Plan (dev_docs_v2 / hub v1) | Actual State | Gap |
|------|---------------------------------------|--------------|-----|
| Endpoints | 7 (single controller assumed) | 20 across 3 controllers (documents, folders, templates) | Backend is richer than documented |
| Data Model | Simple 15-field Document model | 6 models with 37+ fields on Document, 22 on Template, 18 on Share | Schema far more complete than hub showed |
| Folders | Not mentioned | Full folder system with join table and 7 endpoints | Undocumented feature |
| Templates | Mentioned as future | 6 endpoints built, DocumentTemplate model (22 fields) exists | Built but not documented |
| Sharing | Not mentioned | DocumentShare model (18 fields) + .bak controllers (6 endpoints) | Built in .bak, model in active schema |
| Generation | Not mentioned | GeneratedDocument model (15 fields) + .bak controllers (6 endpoints) | Built in .bak, model in active schema |
| Approve/Reject endpoints | Listed in old hub | Not found in actual controllers | Old hub had phantom endpoints |
| Frontend | "Partial" | Zero dedicated pages, but 4 hooks + 7 components exist | Pages missing, but hooks/components partially built |
| Security | Not detailed | 100% guard coverage + custom DocumentAccessGuard (85 LOC) | Best security of any P1 service |
| Tests | "7 spec files" | 4 spec files, ~77 test blocks | Hub overcounted files |

---

## 15. Dependencies

### Depends On

| Service | Reason |
|---------|--------|
| Auth | Tenant isolation, `uploadedBy` / `createdById` user reference, access control |
| Storage (S3) | File storage backend, `storageProvider` defaults to "S3" |
| TMS Core / Loads | `loadId` FK, document upload embedded in Load Detail |
| Carriers | `carrierId` FK, document upload embedded in Carrier Detail |
| Orders | `orderId` FK for order-related documents |
| Companies | `companyId` FK for company-level documents |

### Depended On By

| Service | Reason |
|---------|--------|
| Accounting | Invoice documents, settlement documents |
| Claims | Claim evidence documents (`CLAIM_EVIDENCE` type), ClaimDocument relation |
| Carrier Portal | Carrier document upload and viewing |
| Invoicing | POD upload triggers email notification (invoice auto-creation NOT yet implemented) |
| Compliance | Insurance certificates, driver licenses, retention enforcement |
| Dispatch | BOL and rate confirmation document access |
| Contracts | ContractAmendment relation to Document |
| Agents | AgentPayout relation to Document |
| Factoring | FactoringVerification relation to Document |
