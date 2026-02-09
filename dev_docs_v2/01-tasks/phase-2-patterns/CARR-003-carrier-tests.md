# CARR-003: Carrier Module Tests

> **Phase:** 2 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** M (3-4h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/04-audit/sales-carrier.md` — Carrier issues
3. Carrier page files (built in BUG-001, refactored in CARR-001/002)

## Objective

Write tests for the carrier module: list page, detail page, create/edit forms. Target 80%+ coverage for carrier components. Currently carrier has 0% test coverage.

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/__tests__/carriers/carriers-list.test.tsx` | List page: renders, pagination, search, row click |
| CREATE | `apps/web/__tests__/carriers/carrier-detail.test.tsx` | Detail page: renders tabs, loading/error states |
| CREATE | `apps/web/__tests__/carriers/carrier-form.test.tsx` | Form: validation, submit, error handling |

## Acceptance Criteria

- [ ] List page test: renders table, pagination works, search filters, row click navigates
- [ ] Detail page test: renders all tabs, shows loading state, shows error state, back button works
- [ ] Form test: validates required fields, submits to API, shows errors, dirty state warning
- [ ] All tests pass with `pnpm test`
- [ ] 80%+ coverage for carrier components

## Dependencies

- Blocked by: CARR-001 (carrier list refactor), CARR-002 (carrier detail upgrade)
- Blocks: None

## Reference

- Existing test example: `apps/web/__tests__/crm/leads-table.test.tsx`
