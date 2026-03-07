# Load Board Components

**Path:** `apps/web/components/load-board/`

## Files

| Component | File | LOC | Description |
|-----------|------|-----|-------------|
| BidCounterDialog | `bid-counter-dialog.tsx` | 100 | Dialog for counter-offering a carrier's bid |
| BidsList | `bids-list.tsx` | 264 | List of bids on a posting with accept/reject/counter actions |
| CarrierMatchCard | `carrier-match-card.tsx` | 109 | Card showing a matched carrier with score and availability |
| CarrierMatchesPanel | `carrier-matches-panel.tsx` | 87 | Panel listing AI-matched carriers for a posting |
| LbDashboardStats | `lb-dashboard-stats.tsx` | 49 | Dashboard stats for load board (active postings, bids, matches) |
| LbRecentPostings | `lb-recent-postings.tsx` | 132 | Recent postings widget for dashboard |
| LoadSearchFilters | `load-search-filters.tsx` | 230 | Advanced search filters (origin, destination, equipment, dates, radius) |
| LoadSearchResults | `load-search-results.tsx` | 157 | Search results list with load cards |
| PostingDetailCard | `posting-detail-card.tsx` | 185 | Full posting detail with route, requirements, bids |
| PostingForm | `posting-form.tsx` | 431 | Create/edit load board posting form |

**Total:** 10 files, ~1,744 LOC

## Usage Patterns

Used in `(dashboard)/load-board/` route group:
- `/load-board` - Dashboard with `LbDashboardStats` + `LbRecentPostings`
- `/load-board/search` - `LoadSearchFilters` + `LoadSearchResults`
- `/load-board/postings/new` - `PostingForm`
- `/load-board/postings/[id]` - `PostingDetailCard` + `BidsList` + `CarrierMatchesPanel`

## Dependencies

- `@/components/ui/` (shadcn primitives)
- `@/lib/hooks/load-board/` (usePostings, useBids, useCarrierMatches)
- `LoadSearchFilters` uses `@/components/ui/address-autocomplete` for origin/destination
- `PostingForm` uses React Hook Form + Zod
- `CarrierMatchCard` displays carrier scoring data
