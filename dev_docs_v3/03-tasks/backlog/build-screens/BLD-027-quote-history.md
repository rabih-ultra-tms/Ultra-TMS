# BLD-027: Quote History Page

**Priority:** P0
**Service:** Sales
**Route:** `/quote-history`
**Page file:** `apps/web/app/(dashboard)/quote-history/page.tsx`

## Current State

Page exists with basic list view. Has known UX issues: no search debounce, uses `window.confirm()`.

## Requirements

- Rebuild from design spec with proper DataTable
- Add search debounce (UX-004)
- Replace window.confirm() with ConfirmDialog (UX-001)
- Status filter, date range filter
- Click-through to quote detail

## Acceptance Criteria

- [ ] Search debounced (300ms minimum)
- [ ] ConfirmDialog for destructive actions
- [ ] Pagination with URL params
- [ ] Loading, error, and empty states handled

## Dependencies

- Backend: `GET /quotes`
- Hook: `lib/hooks/sales/use-quotes.ts`
- Components: DataTable, QuoteStatusBadge, ConfirmDialog

## Estimated Effort

M
