# Commission Plan New

**Route:** `/commissions/plans/new`
**File:** `apps/web/app/(dashboard)/commissions/plans/new/page.tsx`
**LOC:** 7
**Status:** Complete

## Data Flow

- **Hooks:** None in page.tsx -- delegated to CommissionPlanForm
- **API calls:** Delegated to CommissionPlanForm component
- **Envelope:** Unknown from page.tsx

## UI Components

- **Pattern:** FormPage (direct render of CommissionPlanForm)
- **Key components:** CommissionPlanForm (`components/commissions/commission-plan-form`)
- **Interactive elements:** All inside CommissionPlanForm sub-component.

## State Management

- **URL params:** None
- **React Query keys:** None in page.tsx

## Quality Assessment

- **Score:** 6/10
- **Bugs:** None in page.tsx
- **Anti-patterns:** No Suspense boundary -- unlike `accounting/invoices/new` which wraps form in Suspense with FormPageSkeleton, this page renders CommissionPlanForm directly with no loading fallback
- **Missing:** No page-level loading state. Quality depends entirely on CommissionPlanForm component.
