# DispatchDetailDrawer

**File:** `apps/web/components/tms/dispatch/dispatch-detail-drawer.tsx`
**LOC:** 1,535

## Props Interface

```typescript
// Internal to the dispatch board. Receives a DispatchLoad object.
```

## Behavior

The largest single component in the codebase. A super-user inline experience panel that slides out from the right side of the dispatch board.

### Views

Three view modes (toggled by buttons in the header):

1. **Tabs** (default) -- 5 tabs:
   - **Overview**: Load summary, route, equipment, dates, contacts
   - **Carrier**: Carrier info, driver details, truck/trailer
   - **Timeline**: Status history + check call timeline
   - **Finance**: Customer rate, carrier rate, margin, accessorials
   - **Documents**: Document list, upload, rate con generation

2. **Edit** -- Inline quick-edit form:
   - Equipment type, weight, pieces
   - Carrier/driver assignment
   - Rate editing
   - Notes

3. **Tracking** -- Inline tracking view:
   - Current location
   - Check call form
   - Check call history

### Status State Machine

Implements forward-only status progression with validation:

```typescript
const NEXT_STATUS_LABEL: Partial<Record<LoadStatus, string>> = {
  PLANNING: 'Move to Pending',
  PENDING: 'Tender to Carrier',
  TENDERED: 'Mark Accepted',
  ACCEPTED: 'Dispatch',
  DISPATCHED: 'Arrived at Pickup',
  AT_PICKUP: 'Mark Picked Up',
  PICKED_UP: 'Mark In Transit',
  IN_TRANSIT: 'Arrived at Delivery',
  AT_DELIVERY: 'Mark Delivered',
  DELIVERED: 'Complete Load',
};
```

### Header Actions

- Status badge (colored by lane)
- Next status button (primary action)
- Edit toggle
- Tracking toggle
- Contact actions: Call, Email, Message
- Copy load number
- External link to full load detail page
- Close button

## Used By

- `apps/web/components/tms/dispatch/dispatch-board.tsx`
- Opened when clicking a load row in the dispatch data table or kanban card

## Dependencies

- `@/lib/types/dispatch` (DispatchLoad, KanbanLane, LoadStatus, STATUS_TO_LANE, VALID_FORWARD_TRANSITIONS)
- `@/lib/hooks/tms/use-dispatch` (useUpdateLoadStatus)
- `@/lib/hooks/tms/use-checkcalls` (useCheckCalls, useCreateCheckCall)
- `@/lib/api-client` (apiClient for direct API calls)
- `sonner` (toast notifications)
- Extensive use of shadcn UI components

## Known Issues

At 1,535 LOC, this is the largest component and a candidate for decomposition. The three view modes (tabs/edit/tracking) could each be extracted into separate components. Currently manageable but approaching complexity limits.
