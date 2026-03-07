# Documents Design Spec Integration

**Source:** `dev_docs/12-Rabih-design-Process/10-documents/` (9 files)
**MVP Tier:** P1
**Frontend routes:** None — not built yet
**Backend module:** `apps/api/src/modules/documents/`

---

## Screen-to-Route Mapping

| # | Design Spec | Frontend Route | Page File | Status |
|---|------------|----------------|-----------|--------|
| 00 | `00-service-overview.md` | — | — | Reference only |
| 01 | `01-document-library.md` | — | Not built | P1 |
| 02 | `02-document-viewer.md` | — | Not built | P1 |
| 03 | `03-document-upload.md` | — | Not built | P1 |
| 04 | `04-template-manager.md` | — | Not built | P2 |
| 05 | `05-template-editor.md` | — | Not built | P2 |
| 06 | `06-e-signature.md` | — | Not built | P3 |
| 07 | `07-document-scanner.md` | — | Not built | P3 |
| 08 | `08-document-reports.md` | — | Not built | P2 |

---

## Backend & Hooks

- Backend module exists at `apps/api/src/modules/documents/`
- Hook exists: `lib/hooks/documents/use-documents.ts`
- Storage module (`apps/api/src/modules/storage/`) handles file upload infrastructure

---

## Implementation Notes

- Document library, viewer, and upload are P1 — core document management
- Template manager/editor are P2 — document template system
- E-signature and scanner are P3 — advanced features
- Documents are cross-cutting — used by carriers (insurance docs), loads (BOLs, PODs), claims (damage photos)
- Storage module is infrastructure-only (no HTTP controllers) — documents module provides the API layer
