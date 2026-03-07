# Dashboard

**Route:** `/dashboard`
**File:** `apps/web/app/(dashboard)/dashboard/page.tsx`
**LOC:** 170
**Status:** Complete

## Data Flow

- **Hooks:** `useCarrierStats` (`lib/hooks/operations`), `useLoadStats` (`lib/hooks/tms/use-loads`), `useQuoteStats` (`lib/hooks/sales/use-quotes`)
- **API calls:** `GET /api/v1/carriers/stats`, `GET /api/v1/tms/loads/stats`, `GET /api/v1/sales/quotes/stats`
- **Envelope:** Stats hooks return data directly (not `data.data` pattern -- `carrierStats.data?.total`, `loadStats.data?.total`, etc.). Verify if hooks unwrap internally.

## UI Components

- **Pattern:** Custom (KPI cards + quick action grid)
- **Key components:** Custom KPICard (inline component), Card, Link (for quick actions)
- **Interactive elements:** 5 quick action cards (Dispatch Board, New Load, Carriers, Companies, Quotes) -- all Link-based, all wired.

## State Management

- **URL params:** None
- **React Query keys:** Via 3 stats hooks

## Quality Assessment

- **Score:** 7/10
- **Bugs:**
  - `formatCurrency` divides by 100 (cents to dollars) -- verify backend sends cents not dollars
  - `accentClass.replace("bg-", "bg-") + "/10"` -- no-op replace, functionally broken for generating opacity classes
- **Anti-patterns:** Custom KPICard component defined inline (170-line file) instead of extracted to components/
- **Missing:** Loading state present (per-card spinners). Error state present (per-card error icons). No empty state needed. No refresh button. No page-level loading.
