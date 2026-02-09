# COMP-008: Install Missing shadcn Components

> **Phase:** 1 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** S (1h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/04-audit/components.md` — Missing shadcn components list

## Objective

Install the shadcn components needed for Phase 2 and beyond. These are standard shadcn/ui components that will be used by the page patterns and TMS screens.

## Steps

```bash
cd apps/web
npx shadcn@latest add breadcrumb
npx shadcn@latest add date-picker
npx shadcn@latest add combobox
npx shadcn@latest add data-table
```

## Acceptance Criteria

- [ ] Breadcrumb component installed and working
- [ ] DatePicker component installed and working (with Calendar)
- [ ] Combobox component installed and working (searchable select with create)
- [ ] DataTable component installed (TanStack Table base — used by COMP-005)
- [ ] All imports resolve
- [ ] TypeScript compiles, lint passes

## Dependencies

- Blocked by: None
- Blocks: COMP-005 (DataGrid), COMP-009 (DateRangePicker)

## Reference

- shadcn/ui docs: https://ui.shadcn.com/docs/components
