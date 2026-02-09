# DOC-001: Document Upload on Load Detail

> **Phase:** 3 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** M (4-6h)
> **Assigned:** Unassigned
> **Added:** v2 — Logistics expert review ("POD upload triggers the entire invoicing cycle")

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/04-tms-core.md` — TMS Core hub
3. `apps/api/src/modules/documents/controllers/documents.controller.ts` — Documents API (8 endpoints)
4. `apps/web/components/load-planner/UniversalDropzone.tsx` — Existing drag-drop upload (291 LOC, reuse patterns)

## Objective

Add a Documents tab to the Load Detail page (TMS-004) with drag-and-drop file upload. In freight, **Proof of Delivery (POD)** drives everything: can't invoice without POD, can't pay carrier without POD, can't close claims without POD.

This is NOT a full Document Management service — it's a focused upload widget on Load Detail to unblock the accounting cycle.

**Reuse:** The existing `UniversalDropzone.tsx` in Load Planner handles multi-file upload with progress. Extract the upload logic pattern (do NOT modify Load Planner — it's on the PROTECT LIST).

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/components/tms/loads/load-documents-tab.tsx` | Documents tab for Load Detail page |
| CREATE | `apps/web/components/shared/document-upload.tsx` | Reusable drag-drop upload widget (inspired by UniversalDropzone) |
| CREATE | `apps/web/components/shared/document-list.tsx` | Document list with type, status, download, delete |
| CREATE | `apps/web/lib/hooks/documents/use-documents.ts` | React Query hooks: useDocuments(entityType, entityId), useUploadDocument() |
| MODIFY | `apps/web/components/tms/loads/load-detail-tabs.tsx` | Add Documents tab (if TMS-004 creates this file) |

## Acceptance Criteria

- [ ] Documents tab visible on Load Detail page
- [ ] Drag-and-drop upload zone (or click to browse)
- [ ] File types supported: PDF, JPG, PNG, TIFF (common for scanned PODs/BOLs)
- [ ] Document type selector: POD, BOL, Rate Confirmation, Lumper Receipt, Scale Ticket, Photo, Other
- [ ] Upload progress indicator
- [ ] Document list shows: name, type, status (Pending/Received/Verified), uploaded date, uploaded by
- [ ] Click document → preview (PDF/image viewer) or download
- [ ] Delete document with ConfirmDialog
- [ ] API: `POST /api/v1/documents` (upload), `GET /api/v1/documents/entity/load/:loadId` (list), `DELETE /api/v1/documents/:id`
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: TMS-004 (Load Detail page must exist to add tab)
- Blocks: ACC-002 (Invoicing — POD triggers invoice readiness)
- Related: UniversalDropzone.tsx (pattern reference only — do NOT modify)

## Reference

- Hub: `dev_docs_v2/03-services/04-tms-core.md` → Documents section
- Backend: `POST /api/v1/documents`, `GET /api/v1/documents/entity/:entityType/:entityId`, `GET /api/v1/documents/:id/download`
- Expert recommendation: Section 3.2 (POD is King), Section 11.3 item 2
