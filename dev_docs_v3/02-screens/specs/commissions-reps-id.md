# Commission Rep Detail

**Route:** `/commissions/reps/[id]`
**File:** `apps/web/app/(dashboard)/commissions/reps/[id]/page.tsx`
**LOC:** 158
**Status:** Complete

## Data Flow

- **Hooks:** `useRep` + `useRepTransactions` + `useAssignPlan` (`lib/hooks/commissions/use-reps`), inline `usePlans` (custom useQuery hook)
- **API calls:** `GET /api/v1/commissions/reps/{id}`, `GET /api/v1/commissions/reps/{id}/transactions`, `GET /api/v1/commissions/plans` (for plan dropdown), `POST /api/v1/commissions/reps/{id}/assign-plan`
- **Envelope:** Mixed -- `useRep`/`useRepTransactions` via hooks, inline `usePlans` manually unwraps with `body.data ?? response`

## UI Components

- **Pattern:** Custom (header + KPI stats + plan assignment card + transaction history)
- **Key components:** RepSummary + TransactionHistory (`components/commissions/rep-detail-card`), Card, Select (plan dropdown), Button, Badge, Skeleton, Link
- **Interactive elements:** Plan assignment dropdown + "Assign" button, back arrow link. All wired.

## State Management

- **URL params:** `id` from `useParams()` (cast `as string`)
- **React Query keys:** Via `useRep(repId)`, `useRepTransactions(repId)`, inline `['commissions', 'plans', 'list']`
- **Local state:** `selectedPlanId` (string for dropdown)

## Quality Assessment

- **Score:** 7/10
- **Bugs:** None critical
- **Anti-patterns:**
  - Inline `usePlans` hook defined in page file (lines 34-45) with manual unwrap logic -- should use the shared `usePlans` from `lib/hooks/commissions/use-plans` or extract to shared hook
  - Inline `CommissionPlan` interface re-declared (lines 29-32) -- duplicates type from use-plans
  - `body.data ?? response` unwrap pattern is fragile
- **Missing:** Loading state via Skeleton (good). No error state shown. Plan assignment is well-designed with Select + Assign button pattern. Transaction history delegated to component (good).
