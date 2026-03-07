# Accounting Dashboard

**Route:** `/accounting`
**File:** `apps/web/app/(dashboard)/accounting/page.tsx`
**LOC:** 97
**Status:** Complete

## Data Flow

- **Hooks:** `useAccountingDashboard` + `useRecentInvoices` (`lib/hooks/accounting/use-accounting-dashboard`)
- **API calls:** `GET /api/v1/accounting/dashboard`, `GET /api/v1/accounting/invoices?limit=5` (recent)
- **Envelope:** `data?.data` via hooks -- correct

## UI Components

- **Pattern:** Custom (KPI stats + quick links grid + recent invoices table)
- **Key components:** AccDashboardStats (`components/accounting/acc-dashboard-stats`), AccRecentInvoices (`components/accounting/acc-recent-invoices`), custom quick-link buttons
- **Interactive elements:** 4 quick-link cards (Invoices, Payments, Settlements, Aging Reports) -- all `router.push`, all wired. Recent invoices component likely has row click.

## State Management

- **URL params:** None
- **React Query keys:** Via `useAccountingDashboard` + `useRecentInvoices`

## Quality Assessment

- **Score:** 6/10
- **Bugs:**
  - Dashboard endpoint may not exist yet (QS-003 task lists `GET /accounting/dashboard` as missing)
- **Anti-patterns:**
  - Uses raw `<button onClick={router.push(...)}>` for quick links instead of `<Link>` -- no prefetch, no cmd-click support, no accessibility
  - `hover:bg-blue-50/50` and `hover:border-blue-200` hardcoded -- won't work in dark mode
  - `as const` on QUICK_LINKS is good but icon rendering via `const Icon = link.icon` pattern is fine
- **Missing:** Loading/error states delegated to sub-components. No page-level error boundary. No date range selector. No refresh button.
