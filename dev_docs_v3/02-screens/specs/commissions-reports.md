# Commission Reports

**Route:** `/commissions/reports`
**File:** `apps/web/app/(dashboard)/commissions/reports/page.tsx`
**LOC:** 148
**Status:** Complete

## Data Flow

- **Hooks:** Inline `useCommissionReports(startDate, endDate)` (custom useQuery hook defined in page file)
- **API calls:** `GET /api/v1/commissions/reports?startDate&endDate`
- **Envelope:** Manual unwrap via inline `unwrap<T>` helper -- `body.data ?? response`

## UI Components

- **Pattern:** Custom (date range filter + 2-column report grid + payout summary)
- **Key components:** EarningsChart + PlanUsageCard + PayoutSummaryCard (`components/commissions/earnings-chart`), Input (date), Label
- **Interactive elements:** Start date and end date inputs (instant re-fetch on change). All wired.

## State Management

- **URL params:** None (dates in local state only -- lost on navigation)
- **React Query keys:** `['commissions', 'reports', { startDate, endDate }]`
- **Local state:** `startDate` (string, defaults to 6 months ago), `endDate` (string, defaults to end of current month)

## Quality Assessment

- **Score:** 6/10
- **Bugs:**
  - Date inputs trigger re-fetch on every character change -- typing a date fires multiple API calls (no debounce, no Apply button)
  - `toISOString().split('T')[0]` can shift dates by timezone offset (UTC vs local)
- **Anti-patterns:**
  - Inline `useCommissionReports` hook + `unwrap` helper + `getDefaultDateRange` + `ReportsData` interface all defined in page file -- should be extracted to `lib/hooks/commissions/use-commission-reports`
  - Date range stored in local state only, not URL params -- lost on navigation/refresh
  - Raw `<Input type="date">` instead of shadcn DatePicker
  - `body.data ?? response` unwrap pattern duplicated from reps-id page
- **Missing:** No loading indicators visible at page level (delegated to sub-components). No error state shown. No export option. Default date range of 6 months is reasonable. Report components properly extracted (good).
