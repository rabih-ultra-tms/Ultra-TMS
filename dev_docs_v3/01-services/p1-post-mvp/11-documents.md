# Service Hub: Documents (11)

> **Priority:** P1 Post-MVP | **Status:** Backend Exists (20 endpoints), Frontend Partial (hooks + components, no pages)
> **Source of Truth** -- dev_docs_v3 | Last verified: 2026-03-07

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | C (4.5/10) |
| **Last Verified** | 2026-03-07 |
| **Backend** | 3 controllers, 20 endpoints, `documents.bak` directory (abandoned refactor, QS-009) |
| **Frontend** | No dedicated pages. 4+ components in `tms/documents/`, document UI embedded in Load Detail and Carrier Detail |
| **Components** | 9+ document-related components across `tms/documents/`, carrier detail, load detail |
| **Hooks** | 4 hooks in `lib/hooks/documents/use-documents.ts` (useDocuments, useUploadDocument, useDeleteDocument, useDocumentDownloadUrl) |
| **Tests** | Backend: 7 spec files |
| **Prisma Models** | Document, DocumentFolder, DocumentTemplate (all exist with full field sets) |
| **Design Specs** | 8 files in `dev_docs/12-Rabih-design-Process/10-documents/` |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | 8 design spec files cover full vision |
| Backend Controllers | Done | 3 controllers: documents (7), folders (7), templates (6) = 20 endpoints |
| Backend Service | Done | DocumentsService, DocumentFoldersService, DocumentTemplatesService |
| Prisma Models | Done | Document, DocumentFolder, DocumentFolderDocument (join), DocumentTemplate |
| Frontend Pages | Not Built | No `/documents` route, no dedicated screens |
| Hooks | Built | 4 hooks in `lib/hooks/documents/use-documents.ts`: useDocuments, useUploadDocument, useDeleteDocument, useDocumentDownloadUrl |
| Components | Partial | 9+ document-related components across `tms/documents/`, carrier detail docs tab, load detail docs tab |
| Tests | Partial | Backend: 7 spec files across controllers and services |
| Storage | Partial | S3-compatible storage pattern referenced; `storageProvider` defaults to "S3" |
| OCR | Schema Only | Fields exist in Prisma (ocrProcessed, ocrText, ocrProcessedAt) but no OCR service |
| Versioning | Schema Only | Fields exist (version, parentDocumentId, isLatestVersion) but unverified logic |

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
| Load Detail (embedded) | `/operations/loads/[id]` | Partial | N/A | Document upload tab exists on load detail |
| Carrier Detail (embedded) | `/carriers/[id]` | Partial | N/A | Document tab on carrier detail page |

---

## 4. API Endpoints

### DocumentsController -- `@Controller('documents')`

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| POST | `/api/v1/documents` | Built | Upload document (multipart) |
| GET | `/api/v1/documents` | Built | List documents with filters |
| GET | `/api/v1/documents/entity/:entityType/:entityId` | Built | Get documents by entity association |
| GET | `/api/v1/documents/:id` | Built | Get document metadata by ID |
| GET | `/api/v1/documents/:id/download` | Built | Download/stream file content |
| PATCH | `/api/v1/documents/:id` | Built | Update document metadata |
| DELETE | `/api/v1/documents/:id` | Built | Soft-delete document |

### DocumentFoldersController -- `@Controller('documents/folders')`

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| POST | `/api/v1/documents/folders` | Built | Create folder |
| GET | `/api/v1/documents/folders` | Built | List folders |
| GET | `/api/v1/documents/folders/:id` | Built | Get folder by ID |
| PATCH | `/api/v1/documents/folders/:id` | Built | Update folder |
| DELETE | `/api/v1/documents/folders/:id` | Built | Delete folder |
| POST | `/api/v1/documents/folders/:id/documents` | Built | Add document to folder |
| DELETE | `/api/v1/documents/folders/:id/documents/:documentId` | Built | Remove document from folder |

### DocumentTemplatesController -- `@Controller('documents/templates')`

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| POST | `/api/v1/documents/templates` | Built | Create template |
| GET | `/api/v1/documents/templates` | Built | List templates |
| GET | `/api/v1/documents/templates/default/:templateType` | Built | Get default template by type |
| GET | `/api/v1/documents/templates/:id` | Built | Get template by ID |
| PATCH | `/api/v1/documents/templates/:id` | Built | Update template |
| DELETE | `/api/v1/documents/templates/:id` | Built | Delete template |

**Total: 20 endpoints across 3 controllers (all built, frontend consumption unknown)**

---

## 5. Components

| Component | Path | Status | Notes |
|-----------|------|--------|-------|
| DocumentUploadDialog | `components/tms/documents/document-upload-dialog.tsx` | Built | Upload dialog with drag-and-drop |
| DocumentList | `components/tms/documents/document-list.tsx` | Built | Document list with actions |
| DocumentCard | `components/tms/documents/document-card.tsx` | Built | Document info card |
| DocumentViewer | `components/tms/documents/document-viewer.tsx` | Built | Document preview |
| Carrier Docs Tab | embedded in `carriers/[id]/` | Built | Document tab on carrier detail |
| Load Docs Tab | embedded in `operations/loads/[id]/` | Built | Document tab on load detail |
| DocumentLibrary | `components/documents/document-library.tsx` | Not Built | Standalone library view with search/filter |
| FolderTree | `components/documents/folder-tree.tsx` | Not Built | Folder navigation sidebar |
| TemplateManager | `components/documents/template-manager.tsx` | Not Built | Template list/management |

**Current state: 4+ dedicated document components exist in `tms/documents/`. Upload UI also embedded in Load Detail and Carrier Detail. Standalone library, folder tree, and template manager not yet built.**

---

## 6. Hooks

| Hook | Path | Status | Notes |
|------|------|--------|-------|
| useDocuments | `lib/hooks/documents/use-documents.ts` | Built | List/search documents with React Query |
| useUploadDocument | `lib/hooks/documents/use-documents.ts` | Built | Upload document mutation |
| useDeleteDocument | `lib/hooks/documents/use-documents.ts` | Built | Delete document mutation |
| useDocumentDownloadUrl | `lib/hooks/documents/use-documents.ts` | Built | Get download URL |
| useEntityDocuments | `lib/hooks/documents/use-entity-documents.ts` | Not Built | Docs by entityType + entityId (may be covered by useDocuments filter) |
| useDocumentFolders | `lib/hooks/documents/use-document-folders.ts` | Not Built | Folder CRUD |
| useDocumentTemplates | `lib/hooks/documents/use-document-templates.ts` | Not Built | Template CRUD |

**Current state: 4 hooks built in a single file (`use-documents.ts`). Folder and template hooks not yet built.**

---

## 7. Business Rules

1. **Document Types:** BOL (Bill of Lading), POD (Proof of Delivery), RATE_CON (Rate Confirmation), INSURANCE_CERT, DRIVER_LICENSE, INVOICE, SETTLEMENT, CLAIM_EVIDENCE, OTHER. Stored as `VarChar(50)` -- not an enum, allowing future extension.
2. **Storage:** Files stored in S3-compatible storage (configured via env vars). Database holds metadata only (fileName, filePath, bucketName, storageProvider). Never store file content in the database.
3. **Size Limits:** Max 25MB per file. Accepted formats: PDF, JPG, PNG, DOCX, XLSX. Other formats rejected at upload.
4. **Entity Association:** Every document must be associated with an entity via `entityType` + `entityId`. Additional convenience FKs exist: `loadId`, `orderId`, `carrierId`, `companyId`. Orphaned documents are invalid.
5. **POD Workflow:** Proof of Delivery upload on a load triggers the invoicing cycle -- auto-creates draft invoice. This is a critical business event that unlocks the invoice creation flow.
6. **Retention:** Documents retained 7 years per FMCSA and accounting regulations. Soft delete via `deletedAt`. Hard delete requires SUPER_ADMIN and legal review flag. `retentionDate` field tracks per-document retention.
7. **OCR:** Prisma model supports OCR processing (`ocrProcessed`, `ocrText`, `ocrProcessedAt`). No OCR service is implemented yet -- schema-only preparation.
8. **Versioning:** Documents support versioning via `version` (Int, default 1), `parentDocumentId` (FK to prior version), and `isLatestVersion` (Boolean). Upload a new version by linking to parent.
9. **Public Access:** Documents can be made publicly accessible via `isPublic` flag with time-limited `accessToken` and `accessExpiresAt`. Used for carrier portal document sharing.
10. **Folder Organization:** Documents can be organized into folders via `DocumentFolder` model. Many-to-many relationship through `DocumentFolderDocument` join table. A document can exist in multiple folders.
11. **Templates:** `DocumentTemplate` model supports reusable document templates (BOL templates, rate confirmation templates). `default/:templateType` endpoint returns the default template for a given type.
12. **Tags:** Documents support a `tags` field (`String[]`) for flexible categorization beyond `documentType`.
13. **documents.bak:** Abandoned refactor directory at `apps/api/src/modules/documents.bak/`. Active module is `apps/api/src/modules/documents/`. Cleanup tracked in QS-009.

---

## 8. Data Model

### Document (Prisma -- verified)

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
  entityType          String
  entityId            String
  loadId              String?   (FK -> Load)
  orderId             String?   (FK -> Order)
  carrierId           String?   (FK -> Carrier)
  companyId           String?   (FK -> Company)
  status              String    @default("ACTIVE")
  ocrProcessed        Boolean   @default(false)
  ocrText             String?
  ocrProcessedAt      DateTime?
  metadata            Json?
  tags                String[]
  version             Int       @default(1)
  parentDocumentId    String?   (FK -> Document, self-referential)
  isLatestVersion     Boolean   @default(true)
  isPublic            Boolean   @default(false)
  accessToken         String?
  accessExpiresAt     DateTime?
  retentionDate       DateTime?
  uploadedBy          String
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  deletedAt           DateTime?
}
```

### DocumentFolder (Prisma -- verified)

```
DocumentFolder {
  id          String    @id @default(uuid())
  tenantId    String
  name        String
  description String?
  parentId    String?   (FK -> DocumentFolder, self-referential for nesting)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?
}
```

### DocumentFolderDocument (Join Table)

```
DocumentFolderDocument {
  folderId    String    (FK -> DocumentFolder)
  documentId  String    (FK -> Document)
  addedAt     DateTime  @default(now())
  @@id([folderId, documentId])
}
```

### DocumentTemplate (Prisma -- verified)

```
DocumentTemplate {
  id            String    @id @default(uuid())
  tenantId      String
  name          String
  templateType  String
  content       String?
  isDefault     Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?
}
```

---

## 9. Validation Rules

| Field | Rule | Notes |
|-------|------|-------|
| name | Required, non-empty string | Document display name |
| fileName | Required, non-empty string | Original uploaded file name |
| filePath | Required | S3 key / storage path |
| fileSize | Required, max 25MB (26,214,400 bytes) | Validated at upload |
| mimeType | Required, must be in allowed list | PDF, JPG, PNG, DOCX, XLSX |
| entityType | Required, non-empty string | Load, Carrier, Invoice, Claim, etc. |
| entityId | Required, valid UUID | Must reference existing entity |
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
| `documents.bak` directory exists -- abandoned refactor | P1 | Open | QS-009 task to clean up |
| No frontend pages -- 0 dedicated routes | P1 | Open | 8 design specs exist, none built |
| No hooks or components | P1 | **FIXED** | 4 hooks built, 4+ components in `tms/documents/` |
| No tests for any of the 3 controllers | P1 | **Partial** | 7 BE spec files exist, coverage incomplete |
| POD-to-invoice trigger needs verification | P1 | Open | Critical business workflow |
| OCR fields exist but no OCR service implemented | P2 | Open | Schema-only; no processing pipeline |
| Versioning logic unverified | P2 | Open | Fields exist, unclear if service handles version chains |
| Public access token generation unverified | P2 | Open | isPublic/accessToken fields exist in schema |
| Data model in previous hub was wrong | Fixed | Resolved | Hub now reflects actual Prisma schema |

---

## 12. Tasks

| Task ID | Title | Effort | Priority | Notes |
|---------|-------|--------|----------|-------|
| DOC-001 | Build Document Library page (`/documents`) | L (6-8h) | P1 | Design spec: `01-document-library.md` |
| DOC-002 | Build Document Viewer page (`/documents/[id]`) | M (4h) | P1 | Design spec: `02-document-viewer.md` |
| DOC-003 | Build Document Upload component (standalone) | M (3-4h) | P1 | Design spec: `03-document-upload.md`, drag-and-drop |
| DOC-004 | QA existing useDocuments hooks (4 built) | S (1h) | P1 | Verify `response.data.data` envelope, check error handling |
| DOC-005 | Add upload progress tracking to useUploadDocument | S (1h) | P1 | Hook exists but may lack progress callback |
| DOC-006 | Build useEntityDocuments hook (or verify useDocuments covers it) | S (1h) | P1 | For Load Detail / Carrier Detail embedded views |
| DOC-007 | Build Template Manager page | M (4h) | P2 | Design spec: `04-template-manager.md`, backend ready |
| DOC-008 | Resolve documents.bak -- merge or delete | S (1h) | P1 | QS-009 task |
| DOC-009 | Write controller tests (20 endpoints) | L (6h) | P1 | Zero coverage currently |
| DOC-010 | Verify POD-to-invoice trigger | S (1-2h) | P1 | Critical billing workflow |
| DOC-011 | Implement OCR processing pipeline | XL (10h+) | P2 | Fields ready in schema, need service |
| DOC-012 | Verify versioning logic in service layer | S (1h) | P2 | Ensure parentDocumentId chain works |
| DOC-013 | Build Folder Tree navigation component | M (3h) | P2 | Backend folder endpoints ready |

---

## 13. Design Links

| File | Path | Content |
|------|------|---------|
| Document Library | `dev_docs/12-Rabih-design-Process/10-documents/01-document-library.md` | Searchable repository with folder navigation |
| Document Viewer | `dev_docs/12-Rabih-design-Process/10-documents/02-document-viewer.md` | PDF/image preview with metadata |
| Document Upload | `dev_docs/12-Rabih-design-Process/10-documents/03-document-upload.md` | Drag-and-drop upload flow |
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
| Data Model | Simple 15-field Document model | 30+ field Document model with OCR, versioning, public access, tags | Schema far more complete than hub showed |
| Folders | Not mentioned | Full folder system with join table and 7 endpoints | Undocumented feature |
| Templates | Mentioned as future | 6 endpoints built, DocumentTemplate model exists | Built but not documented |
| Approve/Reject endpoints | Listed in old hub | Not found in actual controllers | Old hub had phantom endpoints |
| Frontend | "Partial" | Zero dedicated pages, but 4 hooks + 4+ components exist | Pages missing, but hooks/components partially built |
| OCR | Not mentioned | Schema fields exist (ocrProcessed, ocrText, ocrProcessedAt) | Schema-only, no service |
| Versioning | Not mentioned | Schema fields exist (version, parentDocumentId, isLatestVersion) | Schema-only, unverified logic |
| Status field | PENDING/APPROVED/REJECTED enum assumed | `@default("ACTIVE")` string field, no approval workflow | Different status model than assumed |

**Key finding:** The backend is significantly more capable than the previous hub documented. Three controllers with 20 endpoints, folder management, template system, and a rich data model with OCR/versioning/public-access support. However, the frontend is completely absent -- no pages, no components, no hooks. The gap is entirely on the frontend side.

---

## 15. Dependencies

### Depends On

| Service | Reason |
|---------|--------|
| Auth | Tenant isolation, `uploadedBy` user reference, access control |
| Storage (S3) | File storage backend, `storageProvider` defaults to "S3" |
| TMS Core / Loads | `loadId` FK, document upload embedded in Load Detail |
| Carriers | `carrierId` FK, document upload embedded in Carrier Detail |
| Orders | `orderId` FK for order-related documents |
| Companies | `companyId` FK for company-level documents |

### Depended On By

| Service | Reason |
|---------|--------|
| Accounting | Invoice documents, settlement documents |
| Claims | Claim evidence documents (`CLAIM_EVIDENCE` type) |
| Carrier Portal | Carrier document upload and viewing |
| Invoicing | POD upload triggers invoice creation workflow |
| Compliance | Insurance certificates, driver licenses, retention enforcement |
| Dispatch | BOL and rate confirmation document access |
