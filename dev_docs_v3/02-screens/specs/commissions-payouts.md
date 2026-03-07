# Commission Payouts List

**Route:** `/commissions/payouts`
**File:** `apps/web/app/(dashboard)/commissions/payouts/page.tsx`
**LOC:** 186
**Status:** Complete

## Data Flow

- **Hooks:** `usePayouts` + `useGeneratePayout` (`lib/hooks/commissions/use-payouts`)
- **API calls:** `GET /api/v1/commissions/payouts?page&limit&status`, `POST /api/v1/commissions/payouts/generate`
- **Envelope:** `data?.data` and `data?.pagination` -- correct

## UI Components

- **Pattern:** ListPage (uses `ListPage` pattern + Dialog for generate payout)
- **Key components:** ListPage (`components/patterns/list-page`), getPayoutColumns (`components/commissions/payout-table`), Dialog (generate payout form), Select (status filter), Input (rep ID), Button, Label, Loader2 (spinner)
- **Interactive elements:** "Generate Payout" button (opens Dialog), status filter dropdown (5 options), row click (navigates to payout detail), Dialog with rep ID input + Generate/Cancel buttons. All wired.

## State Management

- **URL params:** page, limit, status from `useSearchParams`. Filter changes update URL via `updateParams`.
- **React Query keys:** Via `usePayouts` with URL-derived params
- **Local state:** `generateOpen` (Dialog state), `repIdInput` (string for rep ID input)

## Quality Assessment

- **Score:** 6/10
- **Bugs:**
  - Generate payout requires typing a raw rep ID -- no rep selector dropdown, user must know the UUID
- **Anti-patterns:**
  - `useSearchParams` not in Suspense boundary
  - Raw rep ID input instead of searchable rep dropdown -- terrible UX, should use Select with rep names
  - No search filter for payouts list
  - No date range filter
- **Missing:** Loading/error/empty states via ListPage. Generate dialog has loading spinner (good). Dialog-based create pattern is good but the rep ID UX is unusable for real users. Should use a rep search/select component.
