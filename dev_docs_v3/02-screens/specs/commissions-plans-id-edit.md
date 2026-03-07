# Commission Plan Edit

**Route:** `/commissions/plans/[id]/edit`
**File:** `apps/web/app/(dashboard)/commissions/plans/[id]/edit/page.tsx`
**LOC:** 37
**Status:** Complete

## Data Flow

- **Hooks:** `usePlan` (`lib/hooks/commissions/use-plans`)
- **API calls:** `GET /api/v1/commissions/plans/{id}` (loads existing plan for form)
- **Envelope:** `data?.data` via hook -- correct

## UI Components

- **Pattern:** FormPage (loads plan data, passes to CommissionPlanForm)
- **Key components:** CommissionPlanForm (`components/commissions/commission-plan-form`), Skeleton, ErrorState (`components/shared/error-state`)
- **Interactive elements:** All inside CommissionPlanForm sub-component (receives `plan` prop for edit mode).

## State Management

- **URL params:** `id` from `useParams()` (cast `as string`)
- **React Query keys:** Via `usePlan(planId)`

## Quality Assessment

- **Score:** 8/10
- **Bugs:** None
- **Anti-patterns:**
  - `error as Error` cast in ErrorState -- minor
  - Returns `null` when `!plan` after loading/error checks -- edge case could flash empty
- **Missing:** Loading state via Skeleton (good). Error state via ErrorState component (good). Clean edit page pattern -- loads data, handles states, delegates to form.
