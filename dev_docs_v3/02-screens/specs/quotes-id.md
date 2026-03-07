# Quote Detail

**Route:** `/quotes/[id]`
**File:** `apps/web/app/(dashboard)/quotes/[id]/page.tsx`
**LOC:** 109
**Status:** Complete

## Data Flow

- **Hooks:** `useQuote` (`lib/hooks/sales/use-quotes`)
- **API calls:** `GET /api/v1/sales/quotes/{id}`
- **Envelope:** `data?.data` via hook -- correct

## UI Components

- **Pattern:** DetailPage (uses `DetailPage` pattern with 4 tabs, header actions)
- **Key components:** DetailPage (`components/patterns/detail-page`), QuoteStatusBadge, QuoteDetailOverview, QuoteVersionsSection, QuoteTimelineSection, QuoteNotesSection, QuoteActionsBar (all from `components/sales/quotes/`), Badge
- **Interactive elements:** QuoteActionsBar (renders context-dependent actions: edit, send, clone, convert, delete based on status), tab switching (Overview, Versions, Timeline, Notes). All wired via QuoteActionsBar.

## State Management

- **URL params:** `id` from route params (React 19 `use(params)` with `Promise<{ id: string }>`)
- **React Query keys:** Via `useQuote(id)`

## Quality Assessment

- **Score:** 9/10
- **Bugs:** None
- **Anti-patterns:** None significant
- **Missing:** Loading/error states via DetailPage (good). React 19 `use(params)` (good). All tab content properly extracted to external components (good). Actions bar externalized (good). Version badge in title (good). Lane info in subtitle (good). Breadcrumb with link (good). One of the cleanest detail pages in the codebase.
