# useDocuments (documents)

**File:** `apps/web/lib/hooks/documents/use-documents.ts`
**LOC:** 141

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useDocuments` | `(entityType: EntityType, entityId: string) => UseQueryResult<Document[]>` |
| `useUploadDocument` | `() => UseMutationResult<Document, Error, UploadDocumentParams>` |
| `useDeleteDocument` | `() => UseMutationResult<void, Error, { documentId: string; entityType: EntityType; entityId: string }>` |
| `useDocumentDownloadUrl` | `(documentId: string) => UseQueryResult<{ id: string; name: string; downloadUrl: string; expiresAt: string }>` |

## Exported Types

| Type | Description |
|------|-------------|
| `DocumentType` | Union: BOL, POD, RATE_CONFIRM, INVOICE, INSURANCE, CONTRACT, W9, CARRIER_AGREEMENT, OTHER |
| `EntityType` | Union: LOAD, ORDER, CARRIER, COMPANY, USER |
| `Document` | Full document record with metadata, file info, entity references, tags |
| `UploadDocumentParams` | `{ file: File; name: string; documentType: DocumentType; entityType: EntityType; entityId: string; description?: string }` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useDocuments | GET | /documents/entity/:entityType/:entityId | Document[] |
| useUploadDocument | POST | /documents (FormData) | Document |
| useDeleteDocument | DELETE | /documents/:documentId | void |
| useDocumentDownloadUrl | GET | /documents/:documentId/download | `{ id, name, downloadUrl, expiresAt }` |

## Envelope Handling

**ANTI-PATTERN:** The `useDocuments` query returns `response` directly without unwrapping -- if the API returns `{ data: Document[] }`, the hook would return the envelope instead of the array. The `useUploadDocument` and `useDocumentDownloadUrl` also return raw responses without `response.data` unwrap. This is inconsistent with the project's `{ data: T }` envelope standard.

## Queries (React Query)

| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["documents", entityType, entityId]` | default | `!!entityId` |
| `["document-download", documentId]` | default | `false` (manual refetch only) |

## Mutations

| Function | Endpoint | Invalidates | Toast |
|----------|----------|-------------|-------|
| useUploadDocument | POST /documents | `["documents", entityType, entityId]` | Yes |
| useDeleteDocument | DELETE /documents/:id | `["documents", entityType, entityId]` | Yes |

## Quality Assessment

- **Score:** 6/10
- **Anti-patterns:**
  - **ANTI-PATTERN:** No envelope unwrap on any query -- returns raw `response` instead of `response.data`
  - Types defined inline (DocumentType, EntityType, Document, UploadDocumentParams) -- should be in `@/types/documents`
  - `useUploadDocument` builds FormData manually -- no file size or type validation before upload
  - `useDocumentDownloadUrl` uses `enabled: false` for on-demand fetch -- correct pattern but could use a mutation instead
  - No query key factory pattern -- uses inline array keys
  - `useDeleteDocument` requires caller to pass `entityType` and `entityId` for cache invalidation -- fragile coupling
- **Dependencies:** `apiClient`, `sonner`
