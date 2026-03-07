# Quote Edit

**Route:** `/quotes/[id]/edit`
**File:** `apps/web/app/(dashboard)/quotes/[id]/edit/page.tsx`
**LOC:** 44
**Status:** Complete

## Data Flow

- **Hooks:** `useQuote` (`lib/hooks/sales/use-quotes`)
- **API calls:** `GET /api/v1/sales/quotes/{id}` (loads existing quote for form)
- **Envelope:** `data?.data` via hook -- correct

## UI Components

- **Pattern:** FormPage (loads quote data, passes to QuoteFormV2 in edit mode)
- **Key components:** QuoteFormV2 (`components/sales/quotes/quote-form-v2`), FormPageSkeleton, ErrorState, Button, Link
- **Interactive elements:** All inside QuoteFormV2 sub-component (receives `initialData` and `quoteId` props for edit mode).

## State Management

- **URL params:** `id` from route params (React 19 `use(params)` with `Promise<{ id: string }>`)
- **React Query keys:** Via `useQuote(id)`

## Quality Assessment

- **Score:** 8/10
- **Bugs:** None
- **Anti-patterns:** None
- **Missing:** Loading state via FormPageSkeleton (good). Error state via ErrorState with back button (good). React 19 `use(params)` (good). Clean edit page pattern matching carrier edit. No retry button on error state (unlike carrier edit).
