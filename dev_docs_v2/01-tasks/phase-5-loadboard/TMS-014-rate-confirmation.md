# TMS-014: Rate Confirmation

> **Phase:** 5 | **Priority:** P2 | **Status:** NOT STARTED
> **Effort:** L (5h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/04-tms-core.md` — TMS Core hub

## Objective

Build the Rate Confirmation view at `/operations/loads/:id/rate-con`. Displays a preview of the rate confirmation document and allows PDF download and email to carrier. Backend generates the PDF server-side.

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/app/(dashboard)/operations/loads/[id]/rate-con/page.tsx` | Rate confirmation page |
| CREATE | `apps/web/components/tms/documents/rate-con-preview.tsx` | PDF preview component |
| CREATE | `apps/web/components/tms/documents/document-actions.tsx` | Download + email buttons |
| CREATE | `apps/web/lib/hooks/tms/use-rate-confirmation.ts` | Hook for fetching rate con PDF |

## Acceptance Criteria

- [ ] `/operations/loads/:id/rate-con` renders rate confirmation preview
- [ ] PDF preview displays inline (or as embedded viewer)
- [ ] "Download PDF" button downloads the file
- [ ] "Email to Carrier" button triggers send
- [ ] Back button → load detail
- [ ] Loading state while PDF generates
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: TMS-004 (Load Detail)
- Blocks: None

## Reference

- Hub: `dev_docs_v2/03-services/04-tms-core.md`
- Backend: `GET /api/v1/loads/:id/rate-confirmation` (PDF generation)
