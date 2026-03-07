# Load Board Dashboard

**Route:** `/load-board`
**File:** `apps/web/app/(dashboard)/load-board/page.tsx`
**LOC:** 97
**Status:** Complete

## Data Flow

- **Hooks:** `useLoadBoardDashboardStats` + `useRecentPostings` (`lib/hooks/load-board`)
- **API calls:** `GET /api/v1/load-board/stats`, `GET /api/v1/load-board/postings?limit=10` (recent)
- **Envelope:** `data` via hooks -- verify hooks unwrap internally

## UI Components

- **Pattern:** Custom (KPI stats + quick links grid + recent postings table)
- **Key components:** LbDashboardStats (`components/load-board/lb-dashboard-stats`), LbRecentPostings (`components/load-board/lb-recent-postings`), Link, Button
- **Interactive elements:** "Search Available" Link button, "Post Load" Link button, 3 quick-link cards (Post Load, Search Available, My Postings) -- all Link-based (good, unlike accounting dashboard's `router.push`). All wired.

## State Management

- **URL params:** None
- **React Query keys:** Via `useLoadBoardDashboardStats` + `useRecentPostings(10)`

## Quality Assessment

- **Score:** 8/10
- **Bugs:**
  - "My Postings" quick link points to `/load-board` (same page) -- should link to a filtered postings list or be removed
- **Anti-patterns:** None significant -- uses proper `<Link>` components instead of `router.push` (improvement over accounting/commission dashboards)
- **Missing:** Loading/error states delegated to sub-components. No page-level error boundary. Clean dashboard with proper Link usage. No date range filter. No padding wrapper `p-6` (may inherit from layout).
