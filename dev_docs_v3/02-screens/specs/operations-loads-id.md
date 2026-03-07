# Operations Load Detail

**Route:** `/operations/loads/[id]`
**File:** `apps/web/app/(dashboard)/operations/loads/[id]/page.tsx`
**LOC:** 6
**Status:** Complete

## Data Flow

- **Hooks:** None in page.tsx -- delegates to `LoadDetailClient` in `client-page.tsx`
- **API calls:** Delegated to client component
- **Envelope:** Unknown from page.tsx

## UI Components

- **Pattern:** DetailPage (async server component wrapper -> client component)
- **Key components:** LoadDetailClient (`./client-page` -- must read for full spec)
- **Interactive elements:** All inside LoadDetailClient.

## State Management

- **URL params:** `[id]` from async params (awaited in server component)
- **React Query keys:** None in page.tsx

## Quality Assessment

- **Score:** N/A (6-line wrapper)
- **Bugs:** None
- **Anti-patterns:** Page is just a server-to-client bridge -- all logic in `client-page.tsx`
- **Missing:** Must read `apps/web/app/(dashboard)/operations/loads/[id]/client-page.tsx` for full assessment.
