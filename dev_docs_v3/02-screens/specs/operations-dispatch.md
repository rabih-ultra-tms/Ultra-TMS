# Operations Dispatch Board

**Route:** `/operations/dispatch`
**File:** `apps/web/app/(dashboard)/operations/dispatch/page.tsx`
**LOC:** 29
**Status:** Complete

## Data Flow

- **Hooks:** None in page.tsx -- all inside DispatchBoard component
- **API calls:** Delegated to DispatchBoard
- **Envelope:** Unknown from page.tsx

## UI Components

- **Pattern:** Custom (thin wrapper with Suspense around DispatchBoard)
- **Key components:** DispatchBoard (`components/tms/dispatch/dispatch-board`), DispatchBoardSkeleton (`components/tms/dispatch/dispatch-board-skeleton`), Suspense
- **Interactive elements:** All inside DispatchBoard.

## State Management

- **URL params:** None
- **React Query keys:** None in page.tsx

## Quality Assessment

- **Score:** 7/10 (for wrapper quality)
- **Bugs:** None
- **Anti-patterns:** None -- clean wrapper with metadata export and Suspense skeleton
- **Missing:** Has Next.js `metadata` export for SEO. Suspense fallback with skeleton. Full assessment requires reading DispatchBoard component.
