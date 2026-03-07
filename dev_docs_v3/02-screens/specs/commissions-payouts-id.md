# Commission Payout Detail

**Route:** `/commissions/payouts/[id]`
**File:** `apps/web/app/(dashboard)/commissions/payouts/[id]/page.tsx`
**LOC:** 121
**Status:** Complete

## Data Flow

- **Hooks:** `usePayout` + `useProcessPayout` (`lib/hooks/commissions/use-payouts`)
- **API calls:** `GET /api/v1/commissions/payouts/{id}`, `PATCH /api/v1/commissions/payouts/{id}/process`
- **Envelope:** `data?.data` via hook -- correct

## UI Components

- **Pattern:** Custom (header with process action + summary stats + transactions table)
- **Key components:** PayoutSummary + PayoutTransactions (`components/commissions/payout-detail-card`), Select (payment method), Button, Badge, Skeleton, Loader2 (spinner), Link
- **Interactive elements:** Payment method dropdown (ACH/CHECK/WIRE) + "Process Payout" button (conditional on PENDING status), back arrow link. All wired with proper status guards.

## State Management

- **URL params:** `id` from `useParams()` (cast `as string`)
- **React Query keys:** Via `usePayout(payoutId)`
- **Local state:** `method` (PaymentMethod | '' for dropdown)

## Quality Assessment

- **Score:** 8/10
- **Bugs:** None
- **Anti-patterns:**
  - `statusVariant` record uses string keys without exhaustive typing -- adding new status won't cause compile error
  - `as PaymentMethod` cast on select onChange
- **Missing:** Loading state via Skeleton (good). Status badge with variant mapping (good). Process action with method selection and loading spinner (good). Summary and transactions delegated to components (good). No error state shown. No delete/void action. Clean detail page.
