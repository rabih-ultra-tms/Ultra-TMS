# TMS Finance Components

**Location:** `apps/web/components/tms/finance/`
**Component count:** 2 (1 component + 1 barrel)

## Components

### FinanceBreakdown
- **File:** `finance-breakdown.tsx`
- **Props:** Revenue, cost, margin data; line items
- **Used by:** Load detail pages, order detail pages
- **Description:** Financial summary component showing revenue, carrier cost, and margin breakdown. Displays line items (linehaul, fuel surcharge, accessorials, etc.) with amounts. Calculates and shows margin percentage with color coding (green for healthy, amber for thin, red for negative).

### index.ts
- **File:** `index.ts`
- **Description:** Barrel exports
