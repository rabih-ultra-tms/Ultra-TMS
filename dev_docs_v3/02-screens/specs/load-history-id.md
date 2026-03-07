# Load History Detail

**Route:** `/load-history/[id]`
**File:** `apps/web/app/(dashboard)/load-history/[id]/page.tsx`
**LOC:** 192
**Status:** Complete

## Data Flow

- **Hooks:** `useLoad` (`lib/hooks/tms/use-loads`)
- **API calls:** `GET /api/v1/tms/loads/{id}`
- **Envelope:** `data?.data` via hook -- correct

## UI Components

- **Pattern:** Custom (header + tabs -- not DetailPage pattern component)
- **Key components:** Tabs/TabsList/TabsTrigger/TabsContent (shadcn), Badge, Button, Skeleton, Link, custom inline HeaderSkeleton
- **Interactive elements:** Back link to `/load-history`, 2 tabs (Overview, Financials), retry button on error state. All wired.

## State Management

- **URL params:** `id` from route params (React 19 `use(params)` with `Promise<{ id: string }>`)
- **React Query keys:** Via `useLoad(id)`
- **Local state:** None (tab state managed by Tabs component internally)

## Quality Assessment

- **Score:** 7/10
- **Bugs:** None
- **Anti-patterns:**
  - Inline `HeaderSkeleton` component defined in page file
  - Custom tab layout instead of reusing DetailPage pattern component
- **Missing:** Loading state via Skeleton (good). Not-found state with back link (good). Error state with retry button (good). React 19 `use(params)` (good). Clean detail page but could use DetailPage pattern. Tab content appears to be inline rather than extracted to separate components -- verify in Financials/Overview tab content. Status badge with dynamic styling (good).
