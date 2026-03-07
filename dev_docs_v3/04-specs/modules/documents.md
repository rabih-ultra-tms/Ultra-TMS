# Documents Module API Spec

**Module:** `apps/api/src/modules/documents/`
**Base path:** `/api/v1/`
**Controllers:** DocumentsController, DocumentFoldersController, DocumentTemplatesController
**Auth:** `JwtAuthGuard` + guards in module's own `guards/` subdir
**Frontend hook:** `lib/hooks/documents/use-documents.ts`

---

## DocumentsController

**Route prefix:** `documents`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/documents` | Upload document (multipart/form-data) |
| GET | `/documents` | List documents |
| GET | `/documents/:id` | Get document metadata |
| GET | `/documents/:id/download` | Download file |
| DELETE | `/documents/:id` | Soft-delete document |
| PATCH | `/documents/:id` | Update metadata |
| GET | `/documents/:id/versions` | List document versions |
| POST | `/documents/:id/versions` | Upload new version |
| POST | `/documents/:id/sign` | Request e-signature |

### Document entity types
Documents are linked to other entities via `entityType` + `entityId`:
```
entityType: 'load' | 'carrier' | 'invoice' | 'quote' | 'contract' | 'settlement' | 'claim' | 'carrier_portal_submission'
```

### Document types
```
BOL (Bill of Lading)
POD (Proof of Delivery)
RATE_CONFIRMATION
INVOICE
SETTLEMENT
INSURANCE_CERTIFICATE
MC_AUTHORITY
W9
CONTRACT
OTHER
```

### Upload pattern
```typescript
// Multipart form upload
POST /documents
Content-Type: multipart/form-data

{
  file: File;
  entityType: string;
  entityId: string;
  documentType: string;
  description?: string;
  isPrivate?: boolean;
}
```

---

## DocumentFoldersController

**Route prefix:** `documents/folders`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/documents/folders` | List folders |
| POST | `/documents/folders` | Create folder |
| PATCH | `/documents/folders/:id` | Rename folder |
| DELETE | `/documents/folders/:id` | Delete folder |
| GET | `/documents/folders/:id/documents` | List folder contents |

---

## DocumentTemplatesController

**Route prefix:** `documents/templates`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/documents/templates` | List document templates |
| GET | `/documents/templates/:id` | Get template |
| POST | `/documents/templates/:id/generate` | Generate document from template |

---

## Storage Backend

Documents stored in S3-compatible storage (configured via `storage` module). Local filesystem fallback for development.

---

## Frontend Hook

`useDocuments` in `lib/hooks/documents/use-documents.ts`:
```typescript
// Usage
const { documents, upload, download, remove } = useDocuments({
  entityType: 'load',
  entityId: loadId,
})
```

---

## Known Issues

1. **`documents.bak/`** directory exists in modules — legacy backup, not active. Do NOT reference.
2. **Rate confirmation PDFs** are generated in `tms` module (`/api/v1/loads/:id/rate-confirmation/pdf`) — separate from this document storage system.
3. **POD upload** available via both this module (`POST /documents`) and carrier portal (`POST /carrier-portal/loads/:id/pod`) — data flows to same storage.
