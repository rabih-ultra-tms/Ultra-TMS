# Quote New

**Route:** `/quotes/new`
**File:** `apps/web/app/(dashboard)/quotes/new/page.tsx`
**LOC:** 7
**Status:** Complete

## Data Flow

- **Hooks:** None in page.tsx -- delegated to QuoteFormV2
- **API calls:** Delegated to QuoteFormV2 component
- **Envelope:** Unknown from page.tsx

## UI Components

- **Pattern:** FormPage (direct render of QuoteFormV2)
- **Key components:** QuoteFormV2 (`components/sales/quotes/quote-form-v2`)
- **Interactive elements:** All inside QuoteFormV2 sub-component.

## State Management

- **URL params:** None in page.tsx
- **React Query keys:** None in page.tsx

## Quality Assessment

- **Score:** 6/10
- **Bugs:** None in page.tsx
- **Anti-patterns:** No Suspense boundary -- renders QuoteFormV2 directly with no loading fallback
- **Missing:** No page-level loading state. Quality depends entirely on QuoteFormV2 component. Minimal 7-line wrapper.
