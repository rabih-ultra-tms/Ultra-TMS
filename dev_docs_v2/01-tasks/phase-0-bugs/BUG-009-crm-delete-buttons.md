# BUG-009: CRM Delete Buttons Missing

> **Phase:** 0 | **Priority:** P0 | **Status:** NOT STARTED
> **Effort:** M (2-3h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/04-audit/crm.md` — CRM-001 details

## Objective

Add delete buttons to Contacts and Leads modules. The backend DELETE endpoints exist and the `useDeleteContact()` hook is already defined but never used. Users currently cannot delete contacts or leads from the UI.

## File Plan

| Action | Path | What |
|--------|------|------|
| MODIFY | `apps/web/components/crm/contacts/contacts-table.tsx` | Add delete button with ConfirmDialog |
| MODIFY | `apps/web/components/crm/contacts/contact-card.tsx` | Add delete button in detail view |
| MODIFY | `apps/web/components/crm/leads/leads-table.tsx` | Add delete button with ConfirmDialog |
| MODIFY | `apps/web/app/(dashboard)/leads/[id]/page.tsx` | Add delete button in detail header |
| MODIFY | `apps/web/lib/hooks/use-leads.ts` | Add `useDeleteLead()` hook if not exists |

## Acceptance Criteria

- [ ] Delete button visible in contacts table (each row)
- [ ] Delete button visible in contact detail page
- [ ] Delete button visible in leads table (each row)
- [ ] Delete button visible in lead detail page
- [ ] All deletes show ConfirmDialog with destructive variant before executing
- [ ] Success toast after delete
- [ ] List refreshes after delete (React Query invalidation)
- [ ] TypeScript compiles, lint passes

## Dependencies

- Blocked by: None
- Blocks: None

## Reference

- Audit: `dev_docs_v2/04-audit/crm.md` → CRM-001
- Existing hook: `use-contacts.ts:62-75` (useDeleteContact — defined but unused)
- Backend: `DELETE /crm/contacts/:id`, `DELETE /crm/opportunities/:id`
