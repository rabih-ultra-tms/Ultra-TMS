# Carrier Scorecard

**Route:** `/carriers/[id]/scorecard`
**File:** `apps/web/app/(dashboard)/carriers/[id]/scorecard/page.tsx`
**LOC:** 271
**Status:** Complete

## Data Flow

- **Hooks:** `useCarrierScorecard` (`lib/hooks/carriers/use-carrier-scorecard`)
- **API calls:** `GET /api/v1/carriers/{id}/scorecard`
- **Envelope:** `data` via hook -- verify hook unwraps internally

## UI Components

- **Pattern:** Custom (performance dashboard with gauge, metrics, charts, load history)
- **Key components:** ScoreGauge, PerformanceMetricCard, TierBadge, TierProgressionBar, ScorecardLoadHistory (all from `components/carriers/scorecard/`), BarChart + LineChart (Recharts), Card, Skeleton, Button
- **Interactive elements:** Back button (navigates to carrier detail). Read-only dashboard -- no interactive edits.

## State Management

- **URL params:** `id` from `useParams()` (cast `as string`)
- **React Query keys:** Via `useCarrierScorecard(carrierId)`

## Quality Assessment

- **Score:** 8/10
- **Bugs:**
  - Monthly chart data computed client-side from all load history -- expensive computation on every render, no memoization
  - `carrierRateCents / 100` conversion done inline -- should document that backend sends cents
- **Anti-patterns:**
  - 271 LOC page file includes inline chart data computation (lines 72-89) -- could extract to useMemo or utility
  - `MONTH_NAMES` array hardcoded in page -- should be shared util
  - Hardcoded Recharts colors (`#6366f1`, `#f59e0b`, `#f1f5f9`) -- not from design tokens
  - Error state is minimal (just "Failed to load scorecard" text + "Go Back" button)
- **Missing:** Loading state via full Skeleton layout (good). Score breakdown with weighted categories (good). Tier progression bar (good). 6 KPI metric cards with targets (good). Two charts (bar + line) for load trends (good). Load history table (good). Well-structured performance dashboard with rich visualization.
