# BUG-010: CRM Missing Features (Owner Filter + Convert + Stage Toast)

> **Phase:** 0 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** M (3-4h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/04-audit/crm.md` — CRM-002, CRM-003, CRM-004

## Objective

Fix 3 CRM issues in one task:
1. Replace owner filter text input with dropdown (CRM-002)
2. Add confirmation + toast to pipeline drag-drop stage change (CRM-003)
3. Add "Convert to Customer" button in lead detail page (CRM-004)

## File Plan

| Action | Path | What |
|--------|------|------|
| MODIFY | `apps/web/app/(dashboard)/leads/page.tsx` | Replace owner text input (lines 93-98) with Select dropdown using useUsers() |
| MODIFY | `apps/web/components/crm/leads/leads-pipeline.tsx` | Add ConfirmDialog on drag-drop + toast on success/error (lines 36-47) |
| MODIFY | `apps/web/app/(dashboard)/leads/[id]/page.tsx` | Add "Convert to Customer" button using useConvertLead() hook |

## Acceptance Criteria

- [ ] Owner filter shows dropdown with user names (not UUID text input)
- [ ] Pipeline drag-drop shows confirmation before changing stage
- [ ] Stage change shows toast on success ("Lead moved to [stage]")
- [ ] Stage change shows toast.error on failure (not console.error)
- [ ] "Convert to Customer" button visible in lead detail header
- [ ] Convert triggers backend `POST /crm/opportunities/:id/convert`
- [ ] Success navigates to new customer page
- [ ] TypeScript compiles, lint passes

## Dependencies

- Blocked by: None
- Blocks: None

## Reference

- Audit: `dev_docs_v2/04-audit/crm.md` → CRM-002, CRM-003, CRM-004
- Backend: `POST /crm/opportunities/:id/convert` (already exists)
- Existing hook: `use-leads.ts:70-85` (useConvertLead)
