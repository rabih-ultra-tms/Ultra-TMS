# PATT-003: Form Page Pattern Template

> **Phase:** 2 | **Priority:** P0 | **Status:** NOT STARTED
> **Effort:** M (3-4h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/00-foundations/design-system.md`
3. `dev_docs/Claude-review-v1/04-screen-integration/02-page-patterns.md`

## Objective

Create a reference implementation of the Form Page pattern. Used for create/edit pages. Combines: PageHeader with back button, form sections with proper validation, submit/cancel buttons with dirty state tracking. Replace browser `window.confirm` for unsaved changes with proper dialog.

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/components/patterns/form-page.tsx` | FormPage wrapper (header + form + actions) |

## Acceptance Criteria

- [ ] FormPage accepts: title, backLink, schema (Zod), defaultValues, onSubmit, sections
- [ ] Renders: PageHeader with back arrow, form sections, sticky bottom bar with Cancel + Submit
- [ ] React Hook Form integration with Zod resolver
- [ ] Dirty state tracking — warns before navigating away with unsaved changes (uses ConfirmDialog, not window.confirm)
- [ ] Submit button disabled until form is dirty and valid
- [ ] Loading state on submit (button shows spinner)
- [ ] Error display (per-field and form-level)
- [ ] TypeScript compiles, lint passes

## Dependencies

- Blocked by: COMP-006 (ConfirmDialog upgrade)
- Blocks: Phase 3+ (all form pages follow this pattern)

## Reference

- Page patterns: `dev_docs/Claude-review-v1/04-screen-integration/02-page-patterns.md`
- Working example: `apps/web/components/crm/contacts/contact-form.tsx`
