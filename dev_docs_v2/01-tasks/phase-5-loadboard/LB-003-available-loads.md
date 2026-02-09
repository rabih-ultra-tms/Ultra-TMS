# LB-003: Available Loads Search

> **Phase:** 5 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** M (4h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/07-load-board.md` — Load Board hub

## Objective

Build the Available Loads search page at `/load-board/search`. Carriers and dispatchers search for available loads by origin/destination radius, equipment type, and date range. Results displayed as list with optional map toggle.

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/app/(dashboard)/load-board/search/page.tsx` | Available loads search page |
| CREATE | `apps/web/components/load-board/load-search-filters.tsx` | Search filters: origin radius, destination, equipment, dates |
| CREATE | `apps/web/components/load-board/load-search-results.tsx` | Results list/map toggle |
| MODIFY | `apps/web/lib/hooks/load-board/use-postings.ts` | Add useSearchPostings(filters) |

## Acceptance Criteria

- [ ] `/load-board/search` renders search interface
- [ ] Filters: origin city + radius (miles), destination city + radius, equipment type, date range
- [ ] Results list: origin → destination, equipment, weight, rate, pickup date, posting age
- [ ] Click result → `/load-board/postings/:id`
- [ ] Map toggle: shows results as pins on Google Maps
- [ ] Loading, empty, error states
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: LB-001 (Load Board Dashboard for navigation)
- Blocks: None

## Reference

- Hub: `dev_docs_v2/03-services/07-load-board.md`
- Backend: `GET /api/v1/load-board/search` (filterable)
