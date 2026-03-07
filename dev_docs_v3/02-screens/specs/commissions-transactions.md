# Commission Transactions List

**Route:** `/commissions/transactions`
**File:** `apps/web/app/(dashboard)/commissions/transactions/page.tsx`
**LOC:** 191
**Status:** Complete

## Data Flow

- **Hooks:** `useTransactions` + `useApproveTransaction` + `useVoidTransaction` (`lib/hooks/commissions/use-transactions`)
- **API calls:** `GET /api/v1/commissions/transactions?page&limit&search&status&startDate&endDate`, `PATCH /api/v1/commissions/transactions/{id}/approve`, `PATCH /api/v1/commissions/transactions/{id}/void`
- **Envelope:** `data?.data` and `data?.pagination` -- correct

## UI Components

- **Pattern:** ListPage (uses `ListPage` pattern + VoidTransactionDialog)
- **Key components:** ListPage (`components/patterns/list-page`), getTransactionColumns + VoidTransactionDialog (`components/commissions/transactions-table`), Input (search + dates), Select (status filter)
- **Interactive elements:** Search input (Enter to submit), status filter dropdown (5 options), start/end date filters (instant URL update), per-row approve action, per-row void action (opens VoidTransactionDialog with reason input). All wired.

## State Management

- **URL params:** page, limit, search, status, startDate, endDate from `useSearchParams`. All filter changes update URL via shared `updateParams` helper.
- **React Query keys:** Via `useTransactions` with URL-derived params
- **Local state:** `searchInput` (local copy), `voidTargetId` (string|null for dialog), `approvingId` (string|null for loading state)

## Quality Assessment

- **Score:** 8/10
- **Bugs:** None
- **Anti-patterns:**
  - `useSearchParams` not in Suspense boundary
  - Search requires Enter key -- no debounce
  - Date inputs use raw `<Input type="date">` instead of shadcn DatePicker
- **Missing:** Loading/error/empty states via ListPage. Void uses proper Dialog with reason input (good -- unlike accounting's `window.prompt`). Approve has per-row loading state (good). Date filters update URL instantly (good). Well-implemented list page overall.
