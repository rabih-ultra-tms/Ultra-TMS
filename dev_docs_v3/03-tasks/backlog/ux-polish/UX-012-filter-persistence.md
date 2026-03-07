# UX-012: Table Filter Persistence (URL Params)

**Priority:** P1
**Service:** Frontend UX
**Scope:** Persist filter state in URL search params across page navigation

## Current State
All filter states (status, type, search, etc.) are in React `useState` and reset on navigation. The carriers page has 8 filter fields, load-history has 4, quote-history has 4. Users lose their filter context when viewing a detail and coming back.

## Requirements
- Store all filter values in URL search params
- Read filter values from URL on page load
- Update URL when filters change (without full page reload)
- Clear button resets URL params too
- Support shareable filtered URLs

## Acceptance Criteria
- [ ] All filter values synced to URL params
- [ ] Filters restored from URL on page load
- [ ] Back button restores previous filter state
- [ ] Clear filters also clears URL params
- [ ] Filtered URLs are shareable
- [ ] Applied to carriers, load-history, quote-history, loads, orders, invoices

## Dependencies
- Next.js `useSearchParams` and `useRouter` for URL management

## Estimated Effort
M
