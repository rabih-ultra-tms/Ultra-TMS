# Service Hub: Documents (11)

> **Priority:** P1 Post-MVP | **Status:** Backend Partial (.bak exists), Frontend Partial
> **Source of Truth** — dev_docs_v3 | Last verified: 2026-03-07

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | D+ (3/10) |
| **Last Verified** | 2026-03-07 |
| **Backend** | Partial — documents module exists + documents.bak directory (migration issues) |
| **Frontend** | Partial — document upload on Load Detail mentioned in specs; no dedicated screens |
| **Tests** | None |
| **Note** | `.bak` directory indicates a migration or refactor was abandoned |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Documents definition in dev_docs |
| Backend Controller | Partial | `apps/api/src/modules/documents/` + `.bak` version |
| Backend Service | Partial | Documents service exists |
| Prisma Models | Partial | Document model exists (used by carrier, load, claims) |
| Frontend Pages | Partial | Document upload UI embedded in Load Detail spec (DOC-001 task) |
| Hooks | Not Built | |
| Components | Not Built | Standalone document components |
| Tests | None | |
| Storage | Partial | S3-compatible storage pattern exists in storage module |

---

## 3. Screens

| Screen | Route | Status | Notes |
|--------|-------|--------|-------|
| Document Upload (Load Detail) | Embedded in `/operations/loads/[id]` | Not Built | DOC-001 task |
| Document Viewer | `/documents/[id]` | Not Built | PDF viewer |
| Documents Library | `/documents` | Not Built | Searchable document repository |
| Document Templates | `/documents/templates` | Not Built | BOL, POD, rate con templates |

---

## 4. API Endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/documents` | Partial | List documents (filtered by entity type/id) |
| POST | `/api/v1/documents` | Partial | Upload document (multipart) |
| GET | `/api/v1/documents/:id` | Partial | Document metadata |
| GET | `/api/v1/documents/:id/download` | Partial | Download/stream file |
| DELETE | `/api/v1/documents/:id` | Partial | Delete document |
| POST | `/api/v1/documents/:id/approve` | Partial | Approve document |
| POST | `/api/v1/documents/:id/reject` | Partial | Reject with reason |

---

## 5. Business Rules

1. **Document Types:** BOL (Bill of Lading), POD (Proof of Delivery), RATE_CON (Rate Confirmation), INSURANCE_CERT, DRIVER_LICENSE, INVOICE, SETTLEMENT, CLAIM_EVIDENCE, OTHER.
2. **Storage:** Files stored in S3-compatible storage (configured via env vars). Never stored in database — only metadata (filename, URL, type, size, entity reference).
3. **Size Limits:** Max 25MB per file. Accepted formats: PDF, JPG, PNG, DOCX, XLSX. Other formats rejected at upload.
4. **Entity Association:** Every document must be associated with an entity: `entityType` (Load, Carrier, Invoice, Claim) + `entityId`. Orphaned documents are invalid.
5. **POD Workflow:** Proof of Delivery upload on a load triggers the invoicing cycle — auto-creates draft invoice. This is a critical business event that unlocks the invoice creation flow.
6. **Retention:** Documents retained 7 years per FMCSA and accounting regulations. Soft delete is used. Hard delete requires SUPER_ADMIN and legal review flag.
7. **`.bak` Directory:** `documents.bak` indicates an incomplete refactor. The `.bak` directory should be reviewed and removed (QS-009). The active documents module is `apps/api/src/modules/documents/`.

---

## 6. Data Model

```
Document {
  id          String (UUID)
  filename    String
  originalName String
  mimeType    String
  size        Int (bytes)
  url         String (S3 presigned or CDN URL)
  type        DocumentType (BOL, POD, RATE_CON, INSURANCE_CERT, etc.)
  entityType  String (Load, Carrier, Invoice, Claim, etc.)
  entityId    String
  status      DocumentStatus (PENDING, APPROVED, REJECTED)
  approvedBy  String? (FK → User)
  approvedAt  DateTime?
  rejectionReason String?
  tenantId    String
  uploadedBy  String (FK → User)
  createdAt   DateTime
  updatedAt   DateTime
  deletedAt   DateTime? (7-year retention)
}
```

---

## 7. Known Issues

| Issue | Severity | Status |
|-------|----------|--------|
| `documents.bak` directory exists — abandoned refactor | P1 | QS-009 task |
| POD-to-invoice trigger needs verification | P1 | Needs check |
| No document upload UI on Load Detail | P1 | DOC-001 task |
| No tests | P0 | Open |

---

## 8. Tasks

| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| DOC-001 | Document Upload on Load Detail (POD/BOL) | M (4-6h) | P1 |
| DOC-002 | Build Document Viewer (PDF preview) | M (3h) | P1 |
| DOC-003 | Resolve documents.bak — merge or delete | S (1h) | P1 — QS-009 |
| DOC-004 | Write document service tests | M (3h) | P1 |

---

## 9. Dependencies

**Depends on:** Auth, Storage module (S3), TMS Core (load documents), Carrier (carrier docs)
**Depended on by:** Accounting (invoice documents), Claims (evidence documents), Carrier Portal (document upload)
