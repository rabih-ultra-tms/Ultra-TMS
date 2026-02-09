# BUG-001: Carrier Detail Page 404

> **Phase:** 0 | **Priority:** P0 | **Status:** NOT STARTED
> **Effort:** L (4-6h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/04-audit/sales-carrier.md` — SC-001 details
3. `dev_docs/11-ai-dev/web-dev-prompts/05-carrier-ui.md` — Full carrier UI spec
4. `dev_docs/12-Rabih-design-Process/05-carrier/02-carrier-detail.md` — Design spec

## Objective

Build the missing `/carriers/[id]/page.tsx` detail page. Currently clicking any carrier in the carriers list results in a 404 error. The backend `GET /api/v1/carriers/:id` returns full data including contacts, insurance, documents, and drivers.

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/app/(dashboard)/carriers/[id]/page.tsx` | Carrier detail page with tabs |
| CREATE | `apps/web/components/carriers/carrier-detail-tabs.tsx` | Tab navigation (Overview, Contacts, Insurance, Documents, Drivers) |
| CREATE | `apps/web/components/carriers/carrier-overview-card.tsx` | Summary card with MC#, DOT#, status, tier, contact info |
| CREATE | `apps/web/components/carriers/carrier-insurance-section.tsx` | Insurance policies with expiration tracking |
| CREATE | `apps/web/components/carriers/carrier-documents-section.tsx` | Document list with upload capability |
| CREATE | `apps/web/components/carriers/carrier-drivers-section.tsx` | Driver list with contact info |
| MODIFY | `apps/web/lib/hooks/use-carriers.ts` | Add `useCarrier(id)` hook if not exists |

## Acceptance Criteria

- [ ] `/carriers/[id]` renders carrier detail (no more 404)
- [ ] Overview tab shows: company name, MC#, DOT#, status, tier, address, primary contact
- [ ] Insurance tab shows policies with expiration dates
- [ ] Documents tab shows uploaded documents
- [ ] Drivers tab shows driver list
- [ ] Edit button navigates to `/carriers/[id]/edit`
- [ ] Back button navigates to `/carriers`
- [ ] Loading, error, and empty states for each tab
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: None
- Blocks: CARR-002 (carrier detail refactor in Phase 2)

## Reference

- Audit: `dev_docs_v2/04-audit/sales-carrier.md` → SC-001
- Design spec: `dev_docs/12-Rabih-design-Process/05-carrier/02-carrier-detail.md`
- Dev prompt: `dev_docs/11-ai-dev/web-dev-prompts/05-carrier-ui.md`
- Backend endpoint: `GET /api/v1/carriers/:id` (returns carrier + contacts + insurance + documents + drivers)
