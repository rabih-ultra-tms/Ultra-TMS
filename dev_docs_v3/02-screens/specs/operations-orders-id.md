# Operations Order Detail

**Route:** `/operations/orders/[id]`
**File:** `apps/web/app/(dashboard)/operations/orders/[id]/page.tsx`
**LOC:** 114
**Status:** Complete

## Data Flow

- **Hooks:** `useOrder(id)` (`lib/hooks/tms/use-orders`)
- **API calls:** `GET /api/v1/tms/orders/{id}`
- **Envelope:** Hook returns `order` directly (verify if hook unwraps internally)

## UI Components

- **Pattern:** DetailPage (uses `DetailPage` pattern component with tabbed interface)
- **Key components:** DetailPage (`components/patterns/detail-page`), OrderDetailOverview, OrderStopsTab, OrderLoadsTab, OrderItemsTab, OrderTimelineTab, StatusBadge, DropdownMenu
- **Interactive elements:** "Edit Order" button, "Duplicate Order" (disabled), "Cancel Order" (disabled), 6 tabs (Overview, Stops, Loads, Items, Documents, Timeline). Edit button wired; duplicate/cancel are stubs.

## State Management

- **URL params:** `[id]` from route params (uses `use(params)` -- React 19 pattern for async params)
- **React Query keys:** Via `useOrder(id)`

## Quality Assessment

- **Score:** 8/10
- **Bugs:** None
- **Anti-patterns:**
  - "Duplicate Order" and "Cancel Order" dropdown items are `disabled` -- stubs
  - Documents tab shows hardcoded "coming soon in Phase 3" text
- **Missing:** Loading state via DetailPage. Error state via DetailPage. 6 functional tabs (4 data-driven, 1 stub, 1 timeline). StatusBadge with proper intent mapping.
