# Sprint 03 — TMS Core Build Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Order lifecycle works end-to-end: create order, assign carrier (create load), dispatch, track check calls, mark delivered. Dispatch board shows real-time load status via polling.

**Architecture:** Hybrid approach — upgrade 6 existing screens (Orders, Loads) that already have real API wiring + rebuild 2 screens (Check Calls, Dispatch Board page) that are stubs. All 42 backend endpoints exist. All React Query hooks exist. Focus is on fixing gaps, wiring missing features, and polishing UX.

**Tech Stack:** Next.js 16, React 19, React Query, React Hook Form + Zod, shadcn/ui, TanStack Table, @dnd-kit (dispatch), Tailwind 4

---

## File Structure

### Existing Files to Modify

| File                                                               | Responsibility             | Task        |
| ------------------------------------------------------------------ | -------------------------- | ----------- |
| `apps/web/app/(dashboard)/operations/orders/page.tsx`              | Order list page            | TMS-001     |
| `apps/web/components/tms/orders/order-columns.tsx`                 | Order table columns        | TMS-001     |
| `apps/web/components/tms/orders/order-filters.tsx`                 | Order filter bar           | TMS-001     |
| `apps/web/components/tms/orders/order-form.tsx`                    | Order create/edit form     | TMS-002     |
| `apps/web/components/tms/orders/order-customer-step.tsx`           | Customer selection step    | TMS-002     |
| `apps/web/components/tms/orders/order-stops-builder.tsx`           | Stop management step       | TMS-002     |
| `apps/web/components/tms/orders/order-cargo-step.tsx`              | Cargo details step         | TMS-002     |
| `apps/web/components/tms/orders/order-rate-step.tsx`               | Rate/pricing step          | TMS-002     |
| `apps/web/components/tms/orders/order-review-step.tsx`             | Review/confirm step        | TMS-002     |
| `apps/web/app/(dashboard)/operations/orders/[id]/page.tsx`         | Order detail page          | TMS-003     |
| `apps/web/components/tms/orders/order-detail-overview.tsx`         | Order overview tab         | TMS-003     |
| `apps/web/components/tms/orders/order-loads-tab.tsx`               | Order loads tab            | TMS-003     |
| `apps/web/components/tms/orders/order-timeline-tab.tsx`            | Order timeline tab         | TMS-003     |
| `apps/web/app/(dashboard)/operations/loads/page.tsx`               | Load list page             | TMS-004     |
| `apps/web/components/tms/loads/loads-filter-bar.tsx`               | Load filter bar            | TMS-004     |
| `apps/web/app/(dashboard)/operations/loads/[id]/client-page.tsx`   | Load detail client         | TMS-005     |
| `apps/web/components/tms/loads/load-detail-header.tsx`             | Load detail header         | TMS-005     |
| `apps/web/components/tms/loads/load-check-calls-tab.tsx`           | Check calls tab            | TMS-007     |
| `apps/web/components/tms/checkcalls/check-call-form.tsx`           | Check call entry form      | TMS-007     |
| `apps/web/components/tms/checkcalls/check-call-timeline.tsx`       | Check call history         | TMS-007     |
| `apps/web/app/(dashboard)/operations/dispatch/page.tsx`            | Dispatch board page        | TMS-006     |
| `apps/web/components/tms/dispatch/dispatch-board.tsx`              | Board orchestrator         | TMS-006     |
| `apps/web/components/tms/orders/order-form-schema.ts`              | Zod validation schema      | TMS-002     |
| `apps/web/components/tms/orders/order-items-tab.tsx`               | Order items tab            | TMS-003     |
| `apps/web/components/tms/orders/order-documents-tab.tsx`           | Order documents tab        | TMS-003     |
| `apps/web/components/tms/loads/load-documents-tab.tsx`             | Load documents tab         | TMS-005     |
| `apps/web/app/(dashboard)/operations/loads/new/page.tsx`           | New load (order→load flow) | TMS-003/005 |
| `apps/web/app/(dashboard)/operations/loads/[id]/rate-con/page.tsx` | Rate confirmation          | TMS-008     |

### Existing Hooks (already wired — no changes needed)

| File                                        | Hooks                                                                                                                                                                    |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/web/lib/hooks/tms/use-orders.ts`      | useOrders, useOrder, useCreateOrder, useUpdateOrder, useDeleteOrder, useBulkUpdateOrderStatus, useOrderLoads, useOrderTimeline, useOrderDocuments, useOrderFromQuote     |
| `apps/web/lib/hooks/tms/use-loads.ts`       | useLoads, useLoad, useLoadStats, useLoadTimeline, useCreateLoad, useUpdateLoad, useDeleteLoad, useBulkUpdateLoadStatus, useTenderLoad, useBulkAssignCarrier              |
| `apps/web/lib/hooks/tms/use-dispatch.ts`    | useDispatchLoads, useDispatchBoardStats, useDispatchLoad, useUpdateLoadStatus, useAssignCarrier, useSendDispatch, useBulkStatusUpdate, useBulkDispatch, useUpdateLoadEta |
| `apps/web/lib/hooks/tms/use-checkcalls.ts`  | useCheckCalls, useCreateCheckCall, useOverdueCheckCalls, useCheckCallStats                                                                                               |
| `apps/web/lib/hooks/tms/use-dispatch-ws.ts` | useDispatchBoardUpdates (WebSocket + polling fallback)                                                                                                                   |

### API Client Note

Two import paths exist for the API client: `@/lib/api/client` (used by dispatch hooks) and `@/lib/api-client` (used by order/load hooks). Both work. For consistency in new code, use whichever the surrounding file already imports.

### Types (already defined — no changes needed)

| File                             | Types                                                        |
| -------------------------------- | ------------------------------------------------------------ |
| `apps/web/types/orders.ts`       | Order, OrderStatus, OrderStop, OrderItem, OrderListParams    |
| `apps/web/types/loads.ts`        | Load, LoadStatus                                             |
| `apps/web/lib/types/dispatch.ts` | DispatchLoad, DispatchBoardData, DispatchFilters, KanbanLane |

---

## Chunk 1: Orders (TMS-001, TMS-002, TMS-003)

### Task 1: TMS-001 — Order List Screen (Upgrade)

**Goal:** Ensure the order list page matches the design spec — KPI cards, filters, bulk actions, export all work with real API data.

**Files:**

- Modify: `apps/web/app/(dashboard)/operations/orders/page.tsx`
- Modify: `apps/web/components/tms/orders/order-columns.tsx`
- Modify: `apps/web/components/tms/orders/order-filters.tsx`

**Context:** The page already has real API wiring via `useOrders()`, pagination, bulk status updates, CSV export, and a delete dialog. Quality is 7.5/10. Key gaps: status change mutation passes empty `formData: {}`, customer name display issue in overview, and filter presets not wired.

- [ ] **Step 1: Read and audit the orders list page**

Read `apps/web/app/(dashboard)/operations/orders/page.tsx` fully. Identify:

- Does the status change handler at ~line 206-218 pass proper data to `updateOrder.mutateAsync()`?
- Do KPI stat cards compute from real data or are they hardcoded?
- Does CSV export include all required columns?

- [ ] **Step 2: Fix the status change mutation**

In `apps/web/app/(dashboard)/operations/orders/page.tsx`, find the `handleStatusChange` function. It currently passes `formData: {} as any`. Fix it to pass the status properly:

```typescript
// Before (broken):
await updateOrder.mutateAsync({
  id: orderId,
  formData: {} as any,
  status: newStatus,
});

// After (fixed):
await updateOrder.mutateAsync({
  id: orderId,
  formData: values,
  status: newStatus,
});
```

If the mutation hook expects a different shape, adjust to match `useUpdateOrder()` in `use-orders.ts`. The key is that the status must reach the backend PATCH endpoint.

- [ ] **Step 3: Verify KPI stat cards show real data**

Check the `StatsCard` components at the top of the orders page. They should compute from the orders data:

- Total Active: orders not in CANCELLED/COMPLETED
- Pending: orders with status PENDING
- In Transit: orders with status IN_TRANSIT
- Delivered Today: orders delivered today

If they're using hardcoded values, wire them to derive from `orders.data` or add a dedicated stats endpoint call.

- [ ] **Step 4: Verify filter bar works end-to-end**

In `order-filters.tsx`, confirm:

- Status filter sends `?status=PENDING` to the API
- Search sends `?search=ORD-XXXX`
- Date range sends `?fromDate=...&toDate=...`
- Customer filter sends `?customerId=...`
- All filters sync to URL params for shareable links

Test by reading the component and tracing how filter changes propagate to `useOrders()`.

- [ ] **Step 5: Verify CSV export includes all spec columns**

The export should include: Order #, Status, Customer, Equipment, Origin, Destination, Pickup Date, Delivery Date, Customer Rate, Weight, Created Date. Check `exportToCsv()` call and ensure the accessor keys match the `Order` type fields.

- [ ] **Step 6: Run type check**

```bash
pnpm check-types 2>&1 | head -30
```

Expected: No new type errors in orders files.

- [ ] **Step 7: Commit**

```bash
git add apps/web/app/\(dashboard\)/operations/orders/page.tsx apps/web/components/tms/orders/
git commit -m "fix(orders): wire status change mutation + verify list page completeness (TMS-001)"
```

---

### Task 2: TMS-002 — Order Create/Edit Form (Upgrade)

**Goal:** Ensure the multi-step order form (Customer > Stops > Cargo > Rate > Review) creates and edits orders via real API, with proper validation.

**Files:**

- Modify: `apps/web/components/tms/orders/order-form.tsx`
- Modify: `apps/web/components/tms/orders/order-stops-builder.tsx`
- Modify: `apps/web/app/(dashboard)/operations/orders/[id]/edit/page.tsx`
- Modify: `apps/web/app/(dashboard)/operations/orders/new/page.tsx`

**Context:** The form is already 623 lines with 5 steps, Zod validation, and real API hooks. Quality 7/10. Key gaps: `@ts-ignore` on Zod resolver, quote prefill shape is fragile, no unsaved-changes warning on navigation.

- [ ] **Step 1: Read the order form fully**

Read `apps/web/components/tms/orders/order-form.tsx` end-to-end. Map:

- How does `handleSubmit` build the payload for `createOrder.mutateAsync()` / `updateOrder.mutateAsync()`?
- What fields does the Zod schema require vs. optional?
- Which steps validate which fields?

- [ ] **Step 2: Read the order form schema**

Read `apps/web/components/tms/orders/order-form-schema.ts`. Check:

- Does the schema match the backend `CreateOrderDto`?
- Are stop fields (stopType, addressLine1, city, state, postalCode) all validated?
- Are rate fields optional for PENDING (draft) status?

- [ ] **Step 3: Verify create flow end-to-end**

Trace the create flow:

1. User visits `/operations/orders/new`
2. `OrderForm` renders in create mode (no `initialData`)
3. User fills Customer step → Stops step → Cargo step → Rate step → Review
4. Clicks "Save as Draft" (PENDING) or "Confirm Order" (BOOKED)
5. `createOrder.mutateAsync()` sends POST to `/api/v1/orders`
6. On success, redirects to `/operations/orders/{newId}`

Verify this flow works by reading the code path. Fix any broken links in the chain.

- [ ] **Step 4: Verify edit flow end-to-end**

Trace the edit flow:

1. User visits `/operations/orders/[id]/edit`
2. `useOrder(id)` fetches order data
3. `mapOrderToFormValues()` transforms Prisma response → form schema
4. `OrderForm` renders with `initialData` populated
5. User edits fields
6. `updateOrder.mutateAsync()` sends PUT to `/api/v1/orders/{id}`
7. On success, redirects to `/operations/orders/{id}`

Verify the Prisma Decimal → number conversion in the edit page's `useMemo`. Fix any `toNum()` issues.

- [ ] **Step 5: Fix @ts-ignore if possible**

In `order-form.tsx` around line 290, there's a `@ts-ignore` for Zod + react-hook-form type mismatch. Try replacing with a proper type assertion:

```typescript
// Instead of @ts-ignore, use explicit typing:
const form = useForm<OrderFormValues>({
  resolver: zodResolver(orderFormSchema) as any, // Zod v4 + RHF type mismatch
  defaultValues: initialData ?? defaultValues,
});
```

If `as any` is already there, leave it — this is a known Zod v4 issue.

- [ ] **Step 6: Verify stops builder handles pickup + delivery**

Read `order-stops-builder.tsx`. Confirm:

- User can add multiple pickup stops
- User can add multiple delivery stops
- Each stop has: facility name, address, city, state, zip, appointment date/time
- Stop sequence is auto-numbered
- At least one pickup and one delivery are required

- [ ] **Step 7: Run type check**

```bash
pnpm check-types 2>&1 | head -30
```

- [ ] **Step 8: Commit**

```bash
git add apps/web/components/tms/orders/ apps/web/app/\(dashboard\)/operations/orders/
git commit -m "fix(orders): verify and fix create/edit form pipeline (TMS-002)"
```

---

### Task 3: TMS-003 — Order Detail View (Upgrade)

**Goal:** Order detail shows all order data in tabs (Overview, Stops, Loads, Items, Timeline) with working action buttons.

**Files:**

- Modify: `apps/web/app/(dashboard)/operations/orders/[id]/page.tsx`
- Modify: `apps/web/components/tms/orders/order-detail-overview.tsx`
- Modify: `apps/web/components/tms/orders/order-loads-tab.tsx`
- Modify: `apps/web/components/tms/orders/order-timeline-tab.tsx`

**Context:** The detail page is 114 lines with 6 tabs. Quality 8/10. Key gaps: customer name shows UUID prefix instead of name, Documents tab is placeholder, Duplicate/Cancel actions disabled.

- [ ] **Step 1: Fix customer name display in overview**

In `order-detail-overview.tsx`, find where customer is displayed. It likely shows:

```typescript
Customer {order.customerId.slice(0, 8)}
```

Fix to:

```typescript
{
  order.customer?.name || 'Unknown Customer';
}
```

The `Order` type already includes `customer?: OrderCustomer` with a `name` field.

- [ ] **Step 2: Verify overview tab shows all key fields**

Check `order-detail-overview.tsx` displays:

- Order number + status badge
- Customer name (linked to customer detail)
- Equipment type
- Origin → Destination route summary
- Pickup date + delivery date
- Customer rate + total charges
- Special instructions
- Commodity, weight, hazmat flags

Add any missing fields from the `Order` type.

- [ ] **Step 3: Wire the loads tab with "Create Load" action**

Read `order-loads-tab.tsx` (34 lines). It already has a working component that renders loads and an empty state. Check:

- Does the "Create Load" button have an `onClick` handler? If not, add one that navigates to `/operations/loads/new?orderId={orderId}`
- Does each load row link to `/operations/loads/{loadId}`?
- Check how the parent page passes props — preserve the existing interface (likely receives the full `order` object, not separate `orderId` + `loads`)

The key fix is likely just adding the navigation handler to the "Create Load" button.

- [ ] **Step 4: Verify timeline tab shows audit events**

Read `order-timeline-tab.tsx` (130 lines). Confirm:

- It calls `useOrderTimeline(orderId)` from `use-orders.ts`
- Renders chronological events with timestamps
- Shows: status changes, edits, load assignments, notes

- [ ] **Step 5: Enable status change actions on detail page**

In the order detail page, find the status change action. Add a dropdown or button that allows forward-only status transitions:

- PENDING → BOOKED
- BOOKED → DISPATCHED (only when loads exist)
- DISPATCHED → IN_TRANSIT
- IN_TRANSIT → DELIVERED
- DELIVERED → INVOICED → COMPLETED

Use `useUpdateOrder()` to send the status change.

- [ ] **Step 6: Run type check**

```bash
pnpm check-types 2>&1 | head -30
```

- [ ] **Step 7: Commit**

```bash
git add apps/web/app/\(dashboard\)/operations/orders/ apps/web/components/tms/orders/
git commit -m "feat(orders): complete order detail with loads tab + status actions (TMS-003)"
```

---

## Chunk 2: Loads (TMS-004, TMS-005)

### Task 4: TMS-004 — Load List Screen (Upgrade)

**Goal:** Load list page shows all loads with proper filtering, status badges, KPI cards, and row actions.

**Files:**

- Modify: `apps/web/app/(dashboard)/operations/loads/page.tsx`
- Modify: `apps/web/components/tms/loads/loads-filter-bar.tsx`

**Context:** Page is 201 lines with real API via `useLoads()`, KPI cards via `useLoadStats()`, CSV export, and settings drawer. Quality 7.5/10. Key gaps: filter presets not wired, date range filter not passed to API, settings drawer not persisting.

- [ ] **Step 1: Read the loads list page fully**

Read `apps/web/app/(dashboard)/operations/loads/page.tsx`. Map:

- How filters propagate to `useLoads()` params
- What KPI cards display (from `useLoadStats()`)
- Row actions available (View, Edit, Delete, etc.)

- [ ] **Step 2: Wire filter presets to query params**

In `loads-filter-bar.tsx`, there are saved filter presets (My Loads, Urgent, Unassigned, At Risk). Ensure clicking a preset applies the correct filters:

- My Loads: `?assignedTo=currentUserId`
- Urgent: `?isHot=true` or `?status=PENDING&age=4h`
- Unassigned: `?status=PENDING&carrierId=null`
- At Risk: loads pending > 24h

If the backend doesn't support all these filters, implement client-side filtering on the loaded data.

- [ ] **Step 3: Wire date range filter to API**

In the filter bar, ensure the date range picker sends `?fromDate=...&toDate=...` to the API query. Trace from the date input → filter state → `useLoads()` params.

- [ ] **Step 4: Verify row actions**

Each load row should have actions:

- **View**: Navigate to `/operations/loads/{id}`
- **Edit**: Navigate to `/operations/loads/{id}/edit`
- **Dispatch**: Call `useSendDispatch()` (only if status = PENDING + carrier assigned)
- **Clone**: Navigate to `/operations/loads/new?cloneFrom={id}` (stretch)
- **Delete**: Soft delete with confirmation dialog

Check `loads-data-table.tsx` for existing row action definitions.

- [ ] **Step 5: Run type check**

```bash
pnpm check-types 2>&1 | head -30
```

- [ ] **Step 6: Commit**

```bash
git add apps/web/app/\(dashboard\)/operations/loads/ apps/web/components/tms/loads/
git commit -m "fix(loads): wire filter presets + date range + verify list completeness (TMS-004)"
```

---

### Task 5: TMS-005 — Load Detail View (Upgrade)

**Goal:** Load detail shows complete load information across tabs: Route, Carrier, Documents, Timeline, Check Calls, with status-dependent action buttons.

**Files:**

- Modify: `apps/web/app/(dashboard)/operations/loads/[id]/client-page.tsx`
- Modify: `apps/web/components/tms/loads/load-detail-header.tsx`
- Modify: `apps/web/components/tms/loads/load-route-tab.tsx`
- Modify: `apps/web/components/tms/loads/load-carrier-tab.tsx`
- Modify: `apps/web/components/tms/loads/load-timeline-tab.tsx`

**Context:** The client page is 120 lines with 5 tabs, real API via `useLoad()`, tab persistence via URL hash. Quality 8.5/10. Key gap: Check Calls tab delegates to stub components (now fixed by TMS-007), timeline tab may need separate API call.

- [ ] **Step 1: Read the load detail client page fully**

Read `apps/web/app/(dashboard)/operations/loads/[id]/client-page.tsx`. Map:

- Tab structure and what each tab renders
- What data the `load` object contains
- How the 3-column layout works (summary | tabs | tracking)

- [ ] **Step 2: Verify load detail header has status-dependent actions**

Read `load-detail-header.tsx` (516 lines). Confirm it shows:

- Load number + status badge
- Carrier name (linked to carrier detail)
- Action buttons that change based on status:
  - PENDING: "Assign Carrier", "Edit"
  - TENDERED: "Cancel Tender", "Edit"
  - DISPATCHED: "Add Check Call", "View on Map"
  - IN_TRANSIT: "Add Check Call", "Mark Delivered"
  - DELIVERED: "Generate Invoice", "Upload POD"

If action buttons are missing or static, add status-conditional rendering.

- [ ] **Step 3: Verify route tab shows stops with map**

Read `load-route-tab.tsx` (28 lines). It already delegates to a `<StopsTable>` component from `@/components/tms/stops/stops-table`. Do NOT replace this — verify the StopsTable component renders correctly:

- Shows stops in sequence (pickup → delivery)
- Each stop: facility name, address, appointment time, status
- Verify the component receives the correct props from the load data

If StopsTable has issues, fix those in-place rather than reimplementing inline.

- [ ] **Step 4: Verify carrier tab shows assignment info**

Read `load-carrier-tab.tsx` (146 lines). Confirm:

- Shows carrier name, MC#, contact info
- Shows driver name, phone, truck/trailer numbers
- Has "Change Carrier" action (for PENDING/TENDERED loads)
- Uses carrier data from `load.carrier`

- [ ] **Step 5: Verify timeline tab fetches and renders events**

Read `load-timeline-tab.tsx` (144 lines). Confirm it:

- Calls a timeline API or derives from load data
- Shows chronological events: status changes, check calls, document uploads
- Each event has timestamp, actor, description

- [ ] **Step 6: Run type check**

```bash
pnpm check-types 2>&1 | head -30
```

- [ ] **Step 7: Commit**

```bash
git add apps/web/app/\(dashboard\)/operations/loads/ apps/web/components/tms/loads/
git commit -m "feat(loads): complete load detail with route/carrier/timeline tabs (TMS-005)"
```

---

## Chunk 3: Check Calls + Dispatch Board (TMS-007, TMS-006)

### Task 6: TMS-007 — Check Call Form + History (Upgrade)

**Goal:** Dispatchers can log check calls with location, ETA, status, and notes. History shows color-coded timeline. Works both as a tab in Load Detail and as inline in the dispatch drawer.

**Files:**

- Modify: `apps/web/components/tms/checkcalls/check-call-form.tsx`
- Modify: `apps/web/components/tms/checkcalls/check-call-timeline.tsx`
- Modify: `apps/web/components/tms/loads/load-check-calls-tab.tsx`

**Context:** Check call form (244 lines) already has complete Zod schema, all fields rendered, US state dropdown, form submission via `useCreateCheckCall()`, and error handling. Timeline (247 lines) has type config with color coding and overdue detection. The tab wrapper (17 lines) composes both. Hooks exist at `use-checkcalls.ts` with full API mapping including `etaToNextStop` and `nextCheckCallAt` fields in the `CheckCall` interface. Quality is higher than initially expected — focus on verifying completeness and adding any missing fields.

- [ ] **Step 1: Read check-call-form.tsx fully**

Read `apps/web/components/tms/checkcalls/check-call-form.tsx`. Check:

- Does the form submit via `useCreateCheckCall()`?
- Are all fields rendered: type, city, state, location description, notes?
- Missing from schema: `etaToNextStop`, `nextCheckCallAt` (reminder) — these should be added
- Does it reset after successful submission?

- [ ] **Step 2: Add ETA and next-check-call fields to the form (if not already present)**

The design spec requires:

- **ETA to next stop**: datetime picker showing when the driver expects to arrive
- **Next check call reminder**: datetime picker for when to schedule the next follow-up

The `CheckCall` interface in `use-checkcalls.ts` already defines `etaToNextStop` and `nextCheckCallAt`. The form may already have these fields — check first. If missing, update the Zod schema:

```typescript
const checkCallSchema = z.object({
  type: z.enum(['CHECK_CALL', 'ARRIVAL', 'DEPARTURE', 'DELAY', 'ISSUE']),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required').max(100),
  locationDescription: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
  etaToNextStop: z.string().optional(), // ISO datetime
  nextCheckCallAt: z.string().optional(), // ISO datetime for reminder
});
```

Add two form fields after the location fields:

```tsx
<FormField
  control={form.control}
  name="etaToNextStop"
  render={({ field }) => (
    <FormItem>
      <FormLabel>ETA to Next Stop</FormLabel>
      <FormControl>
        <Input type="datetime-local" {...field} value={field.value ?? ''} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

<FormField
  control={form.control}
  name="nextCheckCallAt"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Next Check Call Reminder</FormLabel>
      <FormControl>
        <Input type="datetime-local" {...field} value={field.value ?? ''} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

- [ ] **Step 3: Verify form submission and reset**

After the form submits successfully:

- `useCreateCheckCall()` sends POST to `/loads/{loadId}/check-calls`
- Toast shows "Check call logged successfully"
- Form resets to defaults
- Check call list refreshes (query invalidation in the hook)

Ensure `form.reset()` is called in the `onSuccess` callback.

- [ ] **Step 4: Read check-call-timeline.tsx fully**

Read `apps/web/components/tms/checkcalls/check-call-timeline.tsx`. Check:

- Does it call `useCheckCalls(loadId)`?
- Does it render a chronological list with type badges?
- Does it show ETA status coloring (green = on-time, yellow = tight, red = late)?

- [ ] **Step 5: Add ETA status coloring to timeline**

Per the design spec, each check call entry should be color-coded by ETA status:

- **Green border**: ETA is before appointment window
- **Yellow border**: ETA is within 2 hours of appointment
- **Red border**: ETA is past appointment window

Add a helper to compute ETA status and apply border colors to each timeline entry.

- [ ] **Step 6: Add overdue indicator to timeline header**

At the top of the timeline, show:

- Time since last check call
- "Overdue" badge if > 4 hours since last check call (already in `calculateTimeSinceLastCheckCall`)
- Make sure this function is called and the result is displayed

- [ ] **Step 7: Run type check**

```bash
pnpm check-types 2>&1 | head -30
```

- [ ] **Step 8: Commit**

```bash
git add apps/web/components/tms/checkcalls/ apps/web/components/tms/loads/load-check-calls-tab.tsx
git commit -m "feat(checkcalls): complete form with ETA + timeline with status coloring (TMS-007)"
```

---

### Task 7: TMS-006 — Dispatch Board (Wire + Polish)

**Goal:** The dispatch board page fully orchestrates the kanban/table views with real-time data, drag-drop status transitions, carrier assignment, and the detail drawer.

**Files:**

- Modify: `apps/web/app/(dashboard)/operations/dispatch/page.tsx`
- Modify: `apps/web/components/tms/dispatch/dispatch-board.tsx`

**Context:** The page is 29 lines (just a Suspense wrapper around `<DispatchBoard />`). The `DispatchBoard` component (240 lines) already orchestrates toolbar → board → drawer with real API via `useDispatchLoads()`, WebSocket via `useDispatchBoardUpdates()`, and 30s polling fallback. The kanban board (364 lines) has real drag-drop with `@dnd-kit`, status validation, and optimistic updates. The load card (407 lines) has staleness detection, margin coloring, and priority flags. Quality is 8-8.5/10 across components.

**The dispatch board is NOT a stub — it's actually well-built.** The 29-line page file is intentionally minimal because all logic lives in the component tree.

**LoadStatus → Kanban Lane mapping:** The full `LoadStatus` enum has 12 values (PLANNING, PENDING, TENDERED, ACCEPTED, DISPATCHED, AT_PICKUP, PICKED_UP, IN_TRANSIT, AT_DELIVERY, DELIVERED, COMPLETED, CANCELLED). The kanban board groups these into 6 lanes via `STATUS_TO_LANE` mapping in `lib/types/dispatch.ts`. Verify this mapping covers all statuses.

- [ ] **Step 1: Read dispatch-board.tsx fully**

Read `apps/web/components/tms/dispatch/dispatch-board.tsx` (240 lines). Map:

- How it initializes filters and sort state
- How it passes data to `KanbanBoard` vs `DispatchDataTable`
- How the detail drawer opens/closes
- Whether the view switcher (Kanban/Table) works

- [ ] **Step 2: Verify view switcher works**

The toolbar should have a view toggle (Kanban | Table). Confirm:

- Kanban view renders `<KanbanBoard />` with lanes
- Table view renders `<DispatchDataTable />` with flat rows
- The toggle is persisted (localStorage or URL param)

If the view switcher is missing, add it to the board component:

```typescript
const [view, setView] = useState<'kanban' | 'table'>('kanban');
```

- [ ] **Step 3: Verify drag-drop status transitions**

Read `kanban-board.tsx`. Confirm:

- Dragging a load card from one lane to another triggers `useUpdateLoadStatus()`
- `isValidTransition()` prevents invalid moves (e.g., DELIVERED → PENDING)
- Moving to TENDERED requires carrier assignment (validated before mutation)
- Toast feedback on success/failure
- Optimistic update moves the card immediately, reverts on error

- [ ] **Step 4: Verify detail drawer opens on card click**

In `dispatch-board.tsx`, confirm:

- Clicking a load card sets `selectedLoadId` and opens the drawer
- `dispatch-detail-drawer.tsx` receives the load data
- Drawer shows load details in tabs (overview, carrier, timeline, finance, documents)
- Status advance button in drawer works

- [ ] **Step 5: Verify KPI strip shows live counts**

The `dispatch-kpi-strip.tsx` should show:

- Unassigned count
- Tendered count
- Dispatched count
- In Transit count
- Delivered count
- At Risk count (PENDING > 24h)

Confirm these derive from the board data, not hardcoded.

- [ ] **Step 6: Verify polling fallback works**

When WebSocket is unavailable, the board should poll every 30 seconds. Check:

- `useDispatchBoardUpdates()` in `use-dispatch-ws.ts` handles connection failure
- Fallback polling uses `refetchInterval: 30000` on the React Query
- Connection status indicator shows "Offline" / "Reconnecting" in toolbar

- [ ] **Step 7: Test the at-risk flagging**

Load cards in PENDING for > 24 hours should have:

- Orange border (per spec)
- Sorted to top of the UNASSIGNED lane
- "At Risk" badge or visual indicator

Check `load-card.tsx` for age-based styling. The component already has staleness detection — verify the 24h threshold matches the spec.

- [ ] **Step 8: Run type check**

```bash
pnpm check-types 2>&1 | head -30
```

- [ ] **Step 9: Commit**

```bash
git add apps/web/app/\(dashboard\)/operations/dispatch/ apps/web/components/tms/dispatch/
git commit -m "feat(dispatch): verify and polish dispatch board end-to-end (TMS-006)"
```

---

## Chunk 4: Rate Confirmation (TMS-008)

### Task 8: TMS-008 — Rate Confirmation Send (Upgrade)

**Goal:** Generate rate confirmation PDF and send to carrier via email from the load detail page.

**Files:**

- Modify: `apps/web/app/(dashboard)/operations/loads/[id]/rate-con/page.tsx`

**Context:** The page is 232 lines with real API wiring: PDF generation via POST `/loads/:id/rate-confirmation`, email send via POST `/loads/:id/rate-confirmation/send`. It has blob URL handling, download button, and email form. Quality 8/10. Key gaps: no email validation, no confirmation that email was sent, no link from load detail.

- [ ] **Step 1: Read rate-con page fully**

Read `apps/web/app/(dashboard)/operations/loads/[id]/rate-con/page.tsx`. Map:

- How PDF is generated (blob URL)
- How email is sent (carrier email, custom message)
- What the preview shows
- Navigation flow (how user arrives here)

- [ ] **Step 2: Verify PDF generation works**

Confirm the "Generate PDF" button:

- Calls POST `/loads/:id/rate-confirmation` with options (include accessorials, include terms)
- Receives blob response
- Creates blob URL for preview
- Download button creates anchor element and triggers download
- Blob URL is cleaned up on unmount (`URL.revokeObjectURL`)

- [ ] **Step 3: Verify email send flow**

Confirm the "Send to Carrier" button:

- Gets carrier email from `load.carrier.dispatchEmail` or `load.carrier.contactEmail`
- Shows email preview with custom message field
- Calls POST `/loads/:id/rate-confirmation/send` with `{ email, message }`
- Shows success toast with carrier name
- Disables button while sending (prevents double-send)

- [ ] **Step 4: Add link from load detail to rate-con**

In the load detail header or documents tab, add a "Rate Confirmation" action button that links to `/operations/loads/{id}/rate-con`. This should only show when:

- Load has a carrier assigned
- Load status is TENDERED or later

Check `load-detail-header.tsx` for existing action buttons and add:

```typescript
{load.carrierId && ['TENDERED', 'DISPATCHED', 'IN_TRANSIT'].includes(load.status) && (
  <Button variant="outline" size="sm" asChild>
    <Link href={`/operations/loads/${load.id}/rate-con`}>
      <FileText className="mr-2 h-4 w-4" />
      Rate Confirmation
    </Link>
  </Button>
)}
```

- [ ] **Step 5: Run type check**

```bash
pnpm check-types 2>&1 | head -30
```

- [ ] **Step 6: Commit**

```bash
git add apps/web/app/\(dashboard\)/operations/loads/ apps/web/components/tms/loads/
git commit -m "feat(loads): verify rate confirmation send + link from detail (TMS-008)"
```

---

## Final Verification

### Task 9: End-to-End Smoke Test + Type Check

**Goal:** Verify the entire order lifecycle works and the build passes.

- [ ] **Step 1: Run full type check**

```bash
pnpm check-types
```

Expected: 0 errors in modified files.

- [ ] **Step 2: Run lint**

```bash
pnpm lint 2>&1 | tail -20
```

Fix any lint errors in modified files.

- [ ] **Step 3: Run frontend tests**

```bash
pnpm --filter web test 2>&1 | tail -30
```

Fix any test failures related to modified components.

- [ ] **Step 4: Verify build succeeds**

```bash
pnpm build 2>&1 | tail -20
```

Expected: Build completes without errors.

- [ ] **Step 5: Trace the full order lifecycle path**

Verify by reading the code that this flow is connected:

1. Create order (from `/operations/orders/new`)
2. View order in list (at `/operations/orders`)
3. Open order detail (at `/operations/orders/{id}`)
4. Create load from order detail (navigates to `/operations/loads/new?orderId={id}`)
5. View load in list (at `/operations/loads`)
6. Open load detail (at `/operations/loads/{id}`)
7. Assign carrier (from load detail or dispatch board)
8. Dispatch load (from dispatch board drag-drop or detail action)
9. Add check call (from load detail Check Calls tab)
10. Mark delivered (from dispatch board or load detail)
11. Generate rate confirmation (from `/operations/loads/{id}/rate-con`)

- [ ] **Step 6: Final commit**

Stage only modified TMS files (do NOT use `git add -A`):

```bash
git add apps/web/app/\(dashboard\)/operations/ apps/web/components/tms/ docs/superpowers/
git commit -m "feat(tms-core): complete Sprint 03 TMS Core Build — orders, loads, dispatch, check calls"
```

- [ ] **Step 7: Update sprint status**

Update `dev_docs_v3/08-sprints/sprint-03-tms-core-build.md` to mark tasks as complete.
