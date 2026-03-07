# Commissions Dashboard

**Route:** `/commissions`
**File:** `apps/web/app/(dashboard)/commissions/page.tsx`
**LOC:** 180
**Status:** Complete

## Data Flow

- **Hooks:** `useCommissionDashboard` (`lib/hooks/commissions/use-commission-dashboard`)
- **API calls:** `GET /api/v1/commissions/dashboard`
- **Envelope:** `data` via hook -- verify hook unwraps internally

## UI Components

- **Pattern:** Custom (KPI stats + quick links grid + top reps table)
- **Key components:** CommissionDashboardStats (`components/commissions/commission-dashboard-stats`), Table/TableBody/TableRow (shadcn), Card, Skeleton
- **Interactive elements:** 5 quick-link cards (Sales Reps, Plans, Transactions, Payouts, Reports) -- all `router.push`, all wired. Top reps table rows clickable (navigate to `/commissions/reps/{id}`).

## State Management

- **URL params:** None
- **React Query keys:** Via `useCommissionDashboard`

## Quality Assessment

- **Score:** 6/10
- **Bugs:** None critical
- **Anti-patterns:**
  - Uses raw `<button onClick={router.push(...)}>` for quick links instead of `<Link>` -- no prefetch, no cmd-click
  - `hover:bg-blue-50/50` and `hover:border-blue-200` hardcoded -- won't work in dark mode
  - Inline `formatCurrency` helper -- duplicated across commission/accounting pages
  - `data.topReps.slice(0, 5)` -- client-side limiting instead of API param
- **Missing:** Loading state per-section (Skeleton for header, table rows). Empty state for top reps table (good). No error state shown. No date range filter for dashboard period. No page-level error boundary.
