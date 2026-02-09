# LB-002: Post New Load Form

> **Phase:** 5 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** M (4h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/07-load-board.md` — Load Board hub
3. `apps/web/components/patterns/form-page.tsx` — FormPage pattern (PATT-003)

## Objective

Build the Post New Load form at `/load-board/post`. Creates a load board posting with origin/destination, equipment type, weight, commodity, pickup/delivery windows, and rate information. Posting starts as DRAFT then moves to ACTIVE.

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/app/(dashboard)/load-board/post/page.tsx` | Post load page |
| CREATE | `apps/web/components/load-board/posting-form.tsx` | Posting form with all fields |
| CREATE | `apps/web/lib/hooks/load-board/use-postings.ts` | React Query hooks: useCreatePosting() |

## Acceptance Criteria

- [ ] `/load-board/post` renders posting form
- [ ] Fields: origin (address), destination (address), equipment type, weight, commodity, pickup window, delivery window, rate (target/max), special instructions
- [ ] Zod validation
- [ ] Submit → POST `/api/v1/load-board/postings` → redirect to posting detail
- [ ] Posting created as DRAFT; "Publish" action sets ACTIVE
- [ ] TypeScript compiles, lint passes
- [ ] No console.log, no `any` types

## Dependencies

- Blocked by: PATT-003 (FormPage pattern)
- Blocks: LB-004 (Posting Detail)

## Reference

- Hub: `dev_docs_v2/03-services/07-load-board.md`
- Backend: `POST /api/v1/load-board/postings`
- Status: DRAFT → ACTIVE → PENDING_BIDS → BID_ACCEPTED → COVERED/EXPIRED
