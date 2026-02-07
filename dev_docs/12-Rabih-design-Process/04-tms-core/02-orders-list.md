# Orders List

> Service: TMS Core (Service 04) | Wave: 2 | Priority: P0
> Route: /(dashboard)/orders | Status: Not Started
> Primary Personas: Maria Rodriguez (Dispatcher), Sarah Chen (Operations Manager)
> Roles with Access: dispatcher, ops_manager, admin, finance (read-only), support (read-only)
> Screen Type: List

---

## 1. Purpose & Business Context

**What this screen does:**
The Orders List is the primary index of all customer orders within Ultra TMS. It provides a filterable, sortable, searchable table showing every order in the system -- from newly created pending orders through completed and invoiced ones. Dispatchers use it to find orders that need loads built, operations managers use it for team oversight and reporting, and finance users scan it for orders ready for invoicing. The screen surfaces four summary KPI cards above the table, a robust filter bar, bulk actions, and an export capability.

**Business problem it solves:**
Without a centralized, high-performance orders list, dispatchers resort to spreadsheets or scrolling through unsorted records to find the orders they need. Operations managers have no way to quickly assess order volume, pipeline health, or identify bottlenecks (e.g., 20 orders stuck in PENDING for 48+ hours). The Orders List eliminates this friction by presenting a dense, filterable table with status badges that give instant visibility into the order pipeline. Sarah uses this screen to spot stalled orders in her 8:00 AM team huddle, and Maria uses it throughout the day to find and prioritize her workload.

**Key business rules:**
- Orders are displayed in descending order by creation date by default (newest first).
- Dispatchers see only orders assigned to them unless they have the `order_view_all` permission. Ops Managers and Admins see all orders for the tenant.
- Soft-deleted orders are hidden from the list but accessible via the "Include Archived" toggle (admin only).
- Revenue and margin columns are only visible to users with `finance_view` permission.
- Bulk status updates are limited to forward-only transitions (e.g., PENDING to CONFIRMED). Backward transitions require individual order processing.
- Orders with loads in transit cannot be bulk-cancelled.
- The list must handle tenants with 50,000+ historical orders without performance degradation. Cursor-based pagination and server-side filtering are mandatory.

**Success metric:**
Time for a dispatcher to locate a specific order drops from 2-3 minutes (scrolling/searching unstructured data) to under 10 seconds (using filter + search). Sarah can generate a daily order status report in under 60 seconds using the filter presets and export feature.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Sidebar Navigation | Click "Orders" in TMS Core sidebar group | None (loads default view) |
| Operations Dashboard | Click "Active Orders" KPI card | `?status=CONFIRMED,PLANNING,IN_TRANSIT` |
| Operations Dashboard | Click order in activity feed | `?search=ORD-XXXX` |
| Customer Detail | Click "View Orders" tab or link | `?customerId=CUST-XXX` |
| Load Detail | Click order number link | `?search=ORD-XXXX` (or direct to order detail) |
| Notification Center | Click "New Order Created" notification | `?search=ORD-XXXX` |
| Direct URL | Bookmark / shared link | Route params, query filters |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Order Detail | Click order row (single click) or order number link | `orderId` (navigates to `/orders/:id`) |
| Order Entry (New) | Click "+ New Order" button | None (blank form) |
| Order Entry (Edit) | Click "Edit" in row actions | `orderId` (navigates to `/orders/:id/edit`) |
| Load Builder | Click "Create Load" in row actions | `orderId` pre-filled |
| Orders List (filtered) | Click a KPI card or apply filter | Updated URL params |
| Export Download | Click "Export" button | Current filter state sent to export API |

**Primary trigger:**
Maria opens the Orders List multiple times per day to find orders that need loads built, check on order statuses, and respond to customer inquiries. Sarah opens it at the start of the day to review the order pipeline, during team meetings for status updates, and at end-of-week for reporting. Finance users open it to find DELIVERED orders ready for invoicing.

**Success criteria (user completes the screen when):**
- Dispatcher has located the order(s) they need and navigated to Order Detail or Load Builder.
- Ops Manager has reviewed the order pipeline and identified any orders that need escalation or attention.
- Finance user has identified orders ready for invoicing and exported the relevant list.

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------+
|  PageHeader: "Orders"                                             |
|  Subtitle: "Manage customer orders and track fulfillment"         |
|  Right: [Export v] [+ New Order]                                  |
+------------------------------------------------------------------+
|                                                                    |
|  +----------+ +----------+ +----------+ +----------+              |
|  | Total    | | Pending  | | In       | | Delivered|              |
|  | Active   | | Orders   | | Transit  | | Today    |              |
|  | 247      | | 34       | | 128      | | 18       |              |
|  | +12 ▲    | | -3 ▼     | | +8 ▲     | | +4 ▲     |              |
|  +----------+ +----------+ +----------+ +----------+              |
|                                                                    |
|  +--------------------------------------------------------------+ |
|  |  FilterBar                                                    | |
|  |  [Status v] [Customer v] [Date Range v] [Equipment v]        | |
|  |  [Sales Rep v] [Priority v] [Search________________] [More v]| |
|  |  Active: [Status: Active ×] [Date: This Week ×]    [Clear]   | |
|  +--------------------------------------------------------------+ |
|  |  Saved: [My Orders] [Pending Review] [Ready to Invoice] [...] | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  +--------------------------------------------------------------+ |
|  |  DataTable                                                    | |
|  |  [ ] | Order #    | Customer     | Origin      | Dest       | |
|  |      | Status     | Equipment    | PU Date     | DEL Date   | |
|  |      | Rate       | Loads        | Sales Rep   | Created    | |
|  |  ----|------------|--------------|-------------|------------| |
|  |  [ ] | ORD-0042   | Acme Mfg     | Chicago, IL | Dallas, TX | |
|  |      | IN_TRANSIT | Dry Van      | Jan 15      | Jan 17     | |
|  |      | $2,450     | 1 load       | Maria R.    | Jan 14     | |
|  |  ----|------------|--------------|-------------|------------| |
|  |  [ ] | ORD-0041   | Beta Corp    | LA, CA      | Phoenix,AZ | |
|  |      | PENDING    | Reefer       | Jan 16      | Jan 18     | |
|  |      | $3,100     | 0 loads      | Sarah C.    | Jan 14     | |
|  |  ----|------------|--------------|-------------|------------| |
|  |  ... more rows ...                                            | |
|  +--------------------------------------------------------------+ |
|  |  Showing 1-25 of 247  |  < 1 2 3 4 5 ... 10 >   | 25 per pg | |
|  +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible, above the fold) | 4 KPI summary cards (Total Active, Pending, In Transit, Delivered Today), filter bar with active filter chips, table header row | Gives instant pipeline visibility; filters are the primary interaction for narrowing down orders |
| **Secondary** (visible on each row) | Order number (monospace, linked), customer name, origin/destination, status badge, pickup/delivery dates, equipment type badge | These 7 fields let dispatchers identify and triage an order in under 3 seconds per row |
| **Tertiary** (visible but lower priority) | Customer rate, load count, sales rep, created date, priority indicator | Important for decision-making but not for initial row scanning |
| **Hidden** (behind click or hover) | Row action menu (Edit, Create Load, Clone, Cancel), bulk action bar, column visibility settings, full order details | Actions taken after an order is identified; accessed via click |

---

## 4. Data Fields & Display

### KPI Summary Cards

| # | KPI Label | Source | Format / Display | Comparison |
|---|---|---|---|---|
| 1 | Total Active Orders | `GET /api/v1/orders/stats` -> `activeCount` | Integer, large font (28px). Icon: `FileText` (blue-600). Clickable: filters list to all active statuses. | vs yesterday: "+12 ▲" in green or "-5 ▼" in red |
| 2 | Pending Orders | `GET /api/v1/orders/stats` -> `pendingCount` | Integer. Icon: `Clock` (amber-600). Clickable: filters to PENDING status. Red background if > 20 (bottleneck indicator). | vs yesterday |
| 3 | In Transit | `GET /api/v1/orders/stats` -> `inTransitCount` | Integer. Icon: `Truck` (sky-600). Clickable: filters to IN_TRANSIT. | vs yesterday |
| 4 | Delivered Today | `GET /api/v1/orders/stats` -> `deliveredTodayCount` | Integer. Icon: `PackageCheck` (green-600). Clickable: filters to DELIVERED with today's date. | vs yesterday |

### Visible Table Columns

| # | Column Header | Source (Entity.field) | Format / Display | Sortable | Default Width |
|---|---|---|---|---|---|
| 1 | Checkbox | N/A | Checkbox for row selection (bulk actions) | No | 40px |
| 2 | Order # | Order.orderNumber | `ORD-YYYYMMDD-XXXX`, monospace font, blue-600 link. Click navigates to Order Detail. | Yes | 160px |
| 3 | Status | Order.status | StatusBadge component. Colors per global status system. | Yes | 120px |
| 4 | Customer | Order.customer.name | Company name, truncated at 20 chars with tooltip for full name. | Yes | 180px |
| 5 | Origin | Order.originCity + Order.originState | "City, ST" format | Yes | 140px |
| 6 | Destination | Order.destinationCity + Order.destinationState | "City, ST" format | Yes | 140px |
| 7 | Equipment | Order.equipmentType | Badge with icon: Container (Dry Van), Snowflake (Reefer), etc. | Yes | 110px |
| 8 | Pickup Date | Order.pickupDate | "MMM DD" (e.g., "Jan 15"). Bold if today. Red if overdue. | Yes | 100px |
| 9 | Delivery Date | Order.deliveryDate | "MMM DD". Bold if today. Red if overdue. | Yes | 100px |
| 10 | Customer Rate | Order.customerRate | "$X,XXX.XX" format. **Hidden without `finance_view` permission.** | Yes | 100px |
| 11 | Loads | Count of Order.loads[] | "X loads" with link. "0 loads" in amber if status is CONFIRMED+ (should have loads). | Yes | 80px |
| 12 | Priority | Order.priority | Icon only: flame (URGENT, red), arrow-up (HIGH, amber), dash (MEDIUM, gray), arrow-down (LOW, slate). Tooltip shows text. | Yes | 60px |
| 13 | Sales Rep | Order.salesRep.name | First name + last initial: "Maria R." | Yes | 100px |
| 14 | Created | Order.createdAt | Relative time: "2h ago", "Jan 14". Full date on hover tooltip. | Yes | 100px |
| 15 | Actions | N/A | Three-dot menu icon opening dropdown | No | 48px |

### Row Actions Menu (Three-Dot Dropdown)

| Action | Icon | Condition | Confirmation |
|---|---|---|---|
| View Detail | `Eye` | Always | No |
| Edit Order | `Edit` | Status is PENDING or CONFIRMED | No |
| Create Load | `Truck` | Status is CONFIRMED or PLANNING, `load_create` permission | No |
| Clone Order | `Copy` | Always, `order_create` permission | No |
| Cancel Order | `XCircle` | Status before DELIVERED, `order_cancel` permission | Yes -- "Cancel order ORD-XXXX? This cannot be undone." |
| Put on Hold | `PauseCircle` | Status is active (not CANCELLED/COMPLETED/ON_HOLD) | Yes -- requires reason |
| Export to PDF | `Download` | Always | No |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Age | `now() - Order.createdAt` | "2h", "3d", "1w". Red text if > 48h in PENDING status (stale indicator) |
| 2 | Load Coverage | `Order.loads.count / expectedLoadCount` | Implicit: "0 loads" in amber vs "1 load" in normal text |
| 3 | On-Time Status | Delivery date vs current date vs order status | Green dot if on track, amber if at risk, red if late |
| 4 | Revenue | Order.customerRate (if finance_view) | Currency format, right-aligned |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] DataTable with all 15 columns, sortable headers, and row selection checkboxes
- [ ] 4 KPI summary cards above the table with clickable drill-down filtering
- [ ] FilterBar with status, customer, date range, equipment type, sales rep, and search filters
- [ ] Status badges on each row using global status color system
- [ ] Row click navigates to Order Detail page
- [ ] Row actions dropdown (View, Edit, Create Load, Clone, Cancel)
- [ ] Bulk selection with "Select All" checkbox and bulk action bar
- [ ] Pagination (25 rows default, options: 10, 25, 50, 100) with cursor-based pagination
- [ ] Column sorting (click header to toggle ASC/DESC)
- [ ] Search across order number, customer name, PO number, reference numbers
- [ ] "+ New Order" primary button navigating to Order Entry
- [ ] Export button (CSV/Excel) with current filters applied
- [ ] Loading skeletons matching table layout
- [ ] Empty state for new tenants and filtered-empty scenarios
- [ ] URL-synced filter state (bookmarkable, shareable)

### Advanced Features (Logistics Expert Recommendations)

- [ ] **Saved filter presets** -- System presets: "My Orders" (assigned to current user), "Pending Review" (PENDING > 24h), "Ready to Invoice" (DELIVERED, no invoice). Users can save custom filter combos.
- [ ] **Column visibility toggle** -- Users can show/hide columns via a settings popover. Preference saved per user.
- [ ] **Inline status update** -- Click a status badge to see available transitions in a dropdown. Select a new status to transition without navigating to Order Detail.
- [ ] **Quick preview on hover** -- Hovering over a row for 500ms shows a tooltip card with order summary (customer, route, stops count, special instructions preview).
- [ ] **Bulk status update** -- Select multiple orders and apply a status change to all at once.
- [ ] **Bulk assign sales rep** -- Select multiple orders and assign a sales rep.
- [ ] **Row color coding** -- Subtle background tint based on urgency: red-50 for URGENT priority, amber-50 for HIGH priority, white for others.
- [ ] **Stale order highlighting** -- Orders in PENDING for > 48 hours get a subtle amber left border (3px) to draw attention.
- [ ] **Keyboard table navigation** -- Arrow keys navigate rows. Enter opens Order Detail. Delete (with confirmation) cancels order.
- [ ] **Real-time row updates** -- WebSocket pushes order status changes; affected rows animate briefly (blue flash).
- [ ] **Infinite scroll option** -- User preference to use infinite scroll instead of pagination.

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| View all orders | ops_manager, admin | `order_view_all` | List filtered to user's assigned orders only |
| View customer rate column | ops_manager, admin, finance | `finance_view` | Column hidden entirely |
| Create new order | dispatcher, ops_manager, admin | `order_create` | "+ New Order" button hidden |
| Edit order | dispatcher, ops_manager, admin | `order_edit` | "Edit" action hidden in row menu |
| Cancel order | ops_manager, admin | `order_cancel` | "Cancel" action hidden in row menu |
| Bulk actions | ops_manager, admin | `order_bulk_edit` | Bulk action bar not rendered; checkboxes hidden |
| Export data | ops_manager, admin, finance | `export_data` | Export button hidden |

---

## 6. Status & State Machine

### Order Status Display

The Orders List displays all order statuses. Each status has a distinct badge color from the global status system:

| Status | Badge Background | Badge Text | Tailwind Classes | Description |
|---|---|---|---|---|
| PENDING | `#F3F4F6` | `#374151` | `bg-gray-100 text-gray-700` | Newly created, awaiting confirmation |
| CONFIRMED | `#DBEAFE` | `#1E40AF` | `bg-blue-100 text-blue-800` | Customer confirmed, ready for planning |
| PLANNING | `#E0E7FF` | `#3730A3` | `bg-indigo-100 text-indigo-800` | Load(s) being built |
| IN_TRANSIT | `#E0F2FE` | `#075985` | `bg-sky-100 text-sky-800` | At least one load picked up |
| DELIVERED | `#ECFCCB` | `#3F6212` | `bg-lime-100 text-lime-800` | All loads delivered |
| COMPLETED | `#D1FAE5` | `#065F46` | `bg-emerald-100 text-emerald-800` | All docs received, ready for billing |
| CANCELLED | `#FEE2E2` | `#991B1B` | `bg-red-100 text-red-800` | Order cancelled |
| ON_HOLD | `#FEF3C7` | `#92400E` | `bg-amber-100 text-amber-800` | Temporarily on hold |
| BILLING | `#F3E8FF` | `#6B21A8` | `bg-purple-100 text-purple-800` | In invoicing/billing process |

### Inline Status Transition (Click Badge)

```
PENDING -----> CONFIRMED (dispatcher+)
CONFIRMED ---> PLANNING (auto when load created)
PLANNING ----> IN_TRANSIT (auto when first pickup)
IN_TRANSIT --> DELIVERED (auto when all delivered)
DELIVERED ---> COMPLETED (ops_manager+, all docs received)

Any active --> ON_HOLD (ops_manager+, requires reason)
Any active --> CANCELLED (ops_manager+, requires reason + confirmation)
ON_HOLD -----> Previous status (resume, ops_manager+)
```

### Actions Available Per Status (Row Actions)

| Status | Available Actions | Restricted Actions |
|---|---|---|
| PENDING | View, Edit, Clone, Cancel, Put on Hold | Create Load (need CONFIRMED first) |
| CONFIRMED | View, Edit, Create Load, Clone, Cancel, Put on Hold | -- |
| PLANNING | View, Edit, Create Load, Clone, Cancel, Put on Hold | -- |
| IN_TRANSIT | View, Clone | Edit (limited), Cancel (requires admin), Put on Hold |
| DELIVERED | View, Clone, Complete | Edit, Cancel |
| COMPLETED | View, Clone | Edit, Cancel, Create Load |
| CANCELLED | View, Clone | Edit, Create Load, Cancel |
| ON_HOLD | View, Edit, Resume, Cancel | Create Load |

---

## 7. Actions & Interactions

### Primary Action Buttons (Page Header)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| + New Order | `Plus` | Primary / Blue-600 | Navigate to `/orders/new` (Order Entry wizard) | No |
| Export | `Download` | Secondary / Outline | Dropdown: Export as CSV, Export as Excel. Exports current filtered view. | No |

### Bulk Action Bar (Appears When Rows Selected)

| Action Label | Icon | Action | Confirmation |
|---|---|---|---|
| Update Status | `RefreshCw` | Opens status change modal for all selected orders | Yes -- "Update X orders to [status]?" |
| Assign Sales Rep | `UserPlus` | Opens sales rep selector for all selected orders | Yes -- "Assign [rep] to X orders?" |
| Put on Hold | `PauseCircle` | Puts all selected orders on hold | Yes -- requires reason |
| Cancel | `XCircle` | Cancels all selected orders | Yes -- "Cancel X orders? This cannot be undone." |
| Export Selected | `Download` | Exports only selected rows | No |

### KPI Card Interactions

| KPI Card | Click Action | Data Passed |
|---|---|---|
| Total Active | Filter to `?status=PENDING,CONFIRMED,PLANNING,IN_TRANSIT` | Status filter |
| Pending Orders | Filter to `?status=PENDING` | Status filter |
| In Transit | Filter to `?status=IN_TRANSIT` | Status filter |
| Delivered Today | Filter to `?status=DELIVERED&deliveryDate=today` | Status + date filter |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl/Cmd + K` | Open global search / command palette |
| `Ctrl/Cmd + N` | Create new order |
| `Arrow Up / Down` | Navigate table rows |
| `Enter` | Open selected row's Order Detail |
| `Space` | Toggle row selection (checkbox) |
| `Ctrl/Cmd + A` | Select all visible rows |
| `Ctrl/Cmd + E` | Export current view |
| `/` | Focus search input |
| `Escape` | Clear selection / close dropdown |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| N/A | -- | No drag-and-drop on the Orders List. Drag-drop is reserved for the Dispatch Board. |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Namespace | Payload | UI Update |
|---|---|---|---|
| `order:created` | `/dispatch` | `{ orderId, orderNumber, customerId, status, createdBy }` | If the new order matches current filters, prepend it to the table with a slide-down animation. Increment relevant KPI card count. If pagination is active and user is on page 1, row appears at top. |
| `order:status:changed` | `/dispatch` | `{ orderId, previousStatus, newStatus, changedBy, timestamp }` | Update the status badge on the affected row with a brief blue flash animation (300ms). Update KPI card counts (decrement old status, increment new status). If the new status is filtered out, the row smoothly fades out. |
| `order:updated` | `/dispatch` | `{ orderId, changedFields }` | Update the affected cells on the row. Brief highlight on changed cells. |
| `order:deleted` | `/dispatch` | `{ orderId }` | Row fades out and is removed from the table. KPI counts update. |

### Live Update Behavior

- **Update frequency:** WebSocket push for all order events. Table rows update in real-time.
- **Visual indicator:** Changed rows briefly flash with a blue-50 background that fades over 2 seconds.
- **Conflict handling:** If a user has a row action menu open for an order that gets updated remotely, the menu stays open but a subtle toast appears: "This order was just updated."
- **Connection status:** Uses the global connection indicator in the page header.

### Polling Fallback

- **When:** WebSocket `/dispatch` connection drops.
- **Interval:** Every 30 seconds.
- **Endpoint:** `GET /api/v1/orders?updatedSince={lastPollTimestamp}&{currentFilters}`
- **Visual indicator:** Amber connection indicator replaces green "Live" dot.

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Inline status change | Status badge immediately updates to new status with animation | Badge reverts to previous status. Toast: "Failed to update status: [reason]." |
| Cancel order | Row dims to 50% opacity immediately | Row returns to full opacity. Toast: "Failed to cancel order: [reason]." |
| Bulk status update | All selected rows update badges simultaneously | All rows revert. Toast: "Bulk update failed for X orders: [reason]." |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| `PageHeader` | `src/components/layout/page-header.tsx` | `title: "Orders"`, `subtitle: "Manage customer orders and track fulfillment"`, `actions: [Export, NewOrder]` |
| `DataTable` | `src/components/ui/data-table.tsx` | `columns: OrderColumn[]`, `data: Order[]`, `pagination`, `sorting`, `selection` |
| `StatusBadge` | `src/components/ui/status-badge.tsx` | `entity: ORDER_STATUS`, `status: string`, `size: 'sm'` |
| `FilterBar` | `src/components/ui/filter-bar.tsx` | `filters: FilterConfig[]` |
| `StatsCard` | `src/components/ui/stats-card.tsx` | `title`, `value`, `icon`, `trend`, `onClick` |
| `Badge` | `src/components/ui/badge.tsx` | Equipment type badges, priority badges |
| `Tooltip` | `src/components/ui/tooltip.tsx` | Truncated text, date tooltips, priority labels |
| `Skeleton` | `src/components/ui/skeleton.tsx` | Loading state for table, KPI cards |
| `DropdownMenu` | `src/components/ui/dropdown-menu.tsx` | Row actions menu, export dropdown |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| `DataTable` | Basic table with sorting and pagination | Add bulk selection with select-all, row hover quick preview, right-click context menu, column visibility toggle, saved filter presets, URL-synced state |
| `FilterBar` | Text and select filters | Add saved filter presets with star/save UI, filter chip display with remove (X) on each, "More Filters" expandable section |
| `StatsCard` | Basic card with label and value | Add clickable drill-down (onClick handler that updates filters), trend arrow comparison, conditional background color (red for alert thresholds) |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| `OrdersKPIRow` | Row of 4 KPI cards specific to orders: Total Active, Pending, In Transit, Delivered Today. Each card clickable to filter the table. | Small |
| `InlineStatusChanger` | Click-on-badge component that opens a small dropdown of available next statuses. Selecting one triggers a status transition. | Medium |
| `BulkActionBar` | Sticky bar that appears at the bottom of the table when rows are selected. Shows selected count, action buttons, and "Deselect All" link. | Medium |
| `ColumnVisibilityPopover` | Settings icon that opens a popover with toggles for each column. Saves preference to localStorage. | Small |
| `SavedFilterPresets` | Horizontal row of pill buttons for saved filters. System presets + user-created presets. Star icon to save current filters. | Medium |
| `OrderRowPreview` | Tooltip card that appears on hover (500ms delay). Shows order summary: customer, route, commodity, stops, special instructions, margin (if permitted). | Small |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Table | `table` | Core data table rendering |
| Checkbox | `checkbox` | Row selection, select-all |
| Dropdown Menu | `dropdown-menu` | Row actions, export options, bulk actions |
| Popover | `popover` | Column visibility settings, filter popovers |
| Calendar | `calendar` | Date range filter |
| Command | `command` | Customer/sales rep searchable selects in filters |
| Pagination | `pagination` | Table pagination controls |
| Tooltip | `tooltip` | Truncated cell text, date hover |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook | Cache Time |
|---|---|---|---|---|---|
| 1 | GET | `/api/v1/orders?page={n}&limit={n}&sort={field}&order={dir}&status={s}&customerId={id}&dateFrom={d}&dateTo={d}&equipment={e}&salesRepId={id}&priority={p}&search={q}` | Fetch paginated, filtered, sorted order list | `useOrders(filters, pagination, sort)` | 30s |
| 2 | GET | `/api/v1/orders/stats?dateFrom={d}&dateTo={d}` | Fetch KPI summary counts | `useOrderStats(dateRange)` | 60s |
| 3 | PATCH | `/api/v1/orders/:id/status` | Inline status update | `useUpdateOrderStatus()` | -- |
| 4 | POST | `/api/v1/orders/bulk-status` | Bulk status update | `useBulkOrderStatus()` | -- |
| 5 | DELETE | `/api/v1/orders/:id` | Soft delete (cancel) order | `useDeleteOrder()` | -- |
| 6 | POST | `/api/v1/orders/export` | Export filtered orders as CSV/Excel | `useExportOrders()` | -- |
| 7 | POST | `/api/v1/orders/:id/clone` | Clone an order | `useCloneOrder()` | -- |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| `tenant:{tenantId}` on `/dispatch` | `order:created` | `useOrderListUpdates()` -- prepends row to table |
| `tenant:{tenantId}` on `/dispatch` | `order:status:changed` | `useOrderListUpdates()` -- updates status badge on affected row |
| `tenant:{tenantId}` on `/dispatch` | `order:updated` | `useOrderListUpdates()` -- updates changed fields on row |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 500 |
|---|---|---|---|---|---|
| GET /api/v1/orders | Show "Invalid filter" toast, retain previous results | Redirect to login | "Access Denied" page | N/A | Error state with retry in table area |
| PATCH /api/v1/orders/:id/status | Toast: "Invalid status transition: [details]" | Redirect to login | Toast: "Permission denied" | Toast: "Order not found" | Toast: "Server error. Please try again." |
| POST /api/v1/orders/bulk-status | Toast: "Bulk update failed: [details]" with per-order error list | Redirect to login | Toast: "Permission denied" | N/A | Toast: "Server error. No orders were updated." |
| POST /api/v1/orders/export | Toast: "Export failed" | Redirect to login | Toast: "Permission denied" | N/A | Toast: "Export failed. Please try again." |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Show 4 skeleton KPI cards in a row. Show filter bar with real controls (interactive before data loads). Show table with header row and 10 skeleton rows (animated gray bars matching column widths).
- **Progressive loading:** KPI cards load first (fastest query). Table data loads second. Filters are interactive immediately.
- **Duration threshold:** If loading exceeds 5 seconds, show "Loading orders... This is taking longer than usual." with a subtle spinner below the table header.

### Empty States

**First-time empty (no orders ever created):**
- **Illustration:** Clipboard with dashed lines illustration (Lucide `ClipboardList` icon at 64px in dashed circle)
- **Headline:** "No orders yet"
- **Description:** "Create your first order to start managing your freight operations. Orders represent customer shipment requests."
- **CTA Button:** "Create First Order" -- primary blue-600 button navigating to `/orders/new`
- **Secondary CTA:** "Import Orders" -- outline button

**Filtered empty (data exists but filters exclude all):**
- **Headline:** "No orders match your filters"
- **Description:** "Try adjusting your date range, status, or search terms."
- **CTA Button:** "Clear All Filters" -- secondary outline button

### Error States

**Full page error (orders API fails):**
- **Display:** KPI cards show skeleton/error state. Table shows error icon + "Unable to load orders" + "Please try again or contact support." + Retry button.

**Partial failure (stats load but table fails):**
- **Display:** KPI cards render normally. Table area shows error with retry.

**Action error (inline status change fails):**
- **Display:** Toast notification with error message. Row reverts to previous state.

### Permission Denied

- **Full page denied:** "You don't have permission to view orders" with link to dashboard.
- **Partial denied:** Finance columns hidden for non-finance roles. Bulk actions hidden for non-authorized roles. "+ New Order" hidden without `order_create`.

### Offline / Degraded

- **Full offline:** Show banner: "You're offline. Showing cached data from [timestamp]."
- **WebSocket down:** Amber connection indicator. Data refreshes via polling every 30 seconds.

---

## 12. Filters, Search & Sort

### Filters

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Status | Multi-select dropdown | PENDING, CONFIRMED, PLANNING, IN_TRANSIT, DELIVERED, COMPLETED, CANCELLED, ON_HOLD, BILLING | All active (excludes COMPLETED, CANCELLED) | `?status=PENDING,CONFIRMED` |
| 2 | Customer | Searchable select | From `/api/v1/customers?active=true` | All | `?customerId=` |
| 3 | Date Range | Date range picker | Preset: Today, This Week, This Month, Last 30 Days, Custom | This Week | `?dateFrom=&dateTo=` |
| 4 | Equipment Type | Multi-select dropdown | Dry Van, Reefer, Flatbed, Step Deck, Power Only, Other | All | `?equipment=DRY_VAN,REEFER` |
| 5 | Sales Rep | Searchable select | From `/api/v1/users?role=sales_agent,dispatcher` | All (ops_manager), Self (dispatcher) | `?salesRepId=` |
| 6 | Priority | Multi-select dropdown | Urgent, High, Medium, Low | All | `?priority=URGENT,HIGH` |
| 7 | Has Loads | Toggle | Yes / No / All | All | `?hasLoads=true` |
| 8 | Origin State | Multi-select | US states grouped by region | All | `?originState=IL,WI` |
| 9 | Destination State | Multi-select | US states grouped by region | All | `?destState=TX,OK` |

### Search Behavior

- **Search field:** Single input with magnifying glass icon, placeholder "Search orders..."
- **Searches across:** Order number, customer name, PO number, BOL number, customer reference, origin city, destination city.
- **Behavior:** Debounced 300ms, minimum 2 characters. Results update the table in real-time as user types.
- **URL param:** `?search=ORD-2025`

### Sort Options

| Column | Default Direction | Sort Type |
|---|---|---|
| Created Date | Descending (newest first) -- **DEFAULT** | Date |
| Order # | Descending | Alphanumeric |
| Customer | Ascending (A-Z) | Alphabetic |
| Pickup Date | Ascending (soonest first) | Date |
| Delivery Date | Ascending (soonest first) | Date |
| Customer Rate | Descending (highest first) | Numeric |
| Status | Custom order (active first) | Enum |
| Priority | Custom order (urgent first) | Enum |

### Saved Filters / Presets

- **System presets:** "My Orders" (salesRepId = current user), "Pending Review" (status = PENDING, age > 24h), "Ready to Invoice" (status = DELIVERED), "Urgent" (priority = URGENT or HIGH), "This Week's Pickups" (pickupDate within current week).
- **User-created presets:** Click star icon next to search to save current filter combination. Dialog prompts for name. Stored in localStorage and synced to `/api/v1/users/:id/preferences/order-filters`.
- **URL sync:** All filter state reflected in URL query params. Bookmarkable and shareable.

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- KPI cards: 2 per row (2 rows of 2) instead of 4 in a row.
- Table columns: Hide Sales Rep, Created, and Load count columns. Show core 8 columns only.
- Filter bar: Collapses into a "Filters" button that opens a slide-over panel from the right.
- Row actions: Same dropdown menu but triggered by visible three-dot icon.
- Saved filter presets: Horizontal scroll with 3 visible, swipe for more.
- Pagination: Simplified (Previous / Next only, no page numbers).

### Mobile (< 768px)

- KPI cards: 2 per row (2 rows of 2). Cards are more compact (smaller font, no trend arrows).
- Table transforms to card list: Each order becomes a full-width card showing order#, status badge, customer, route (origin -> dest), dates.
- Filter bar: Full-screen filter modal triggered by a floating "Filter" button.
- Search: Sticky search bar at top of list.
- Row actions: Long-press on card opens action sheet (bottom slide-up).
- Bulk selection: Hidden on mobile (too cumbersome with touch).
- Pagination: Infinite scroll replaces pagination.
- Pull-to-refresh: Reloads order list.
- Swipe actions: Swipe left reveals "Edit" and "View" quick actions.

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full table with all 15 columns. 4 KPI cards in row. Full filter bar. |
| Desktop | 1024px - 1439px | Same layout, slightly narrower columns. |
| Tablet | 768px - 1023px | 2x2 KPI grid. Reduced columns. Filter slide-over. |
| Mobile | < 768px | Card list view. 2x2 KPIs. Full-screen filter. Infinite scroll. |

---

## 14. Stitch Prompt

```
Design an orders list screen for a modern freight/logistics TMS (Transportation Management System) called "Ultra TMS." This is the primary orders management screen where dispatchers and operations managers view, filter, and act on customer orders.

Layout: Full-width page with a dark slate-900 sidebar on the left (240px wide). The "Orders" item in the sidebar is active with a blue-600 left border and blue-600/10 background. The content area has a gray-50 background.

Page Header: At the top, "Orders" as a 24px bold title on the left with subtitle "Manage customer orders and track fulfillment" in gray-500. On the right, an outline "Export" button with download icon and a primary blue-600 "+ New Order" button with plus icon.

KPI Row: Below the header, show 4 stat cards in a single row with equal spacing. Each card is white with rounded-lg corners, subtle shadow-sm:
1. "Total Active" - Value: 247, blue FileText icon, "+12 ▲" trend in green
2. "Pending" - Value: 34, amber Clock icon, "-3 ▼" trend in red
3. "In Transit" - Value: 128, sky Truck icon, "+8 ▲" trend in green
4. "Delivered Today" - Value: 18, green PackageCheck icon, "+4 ▲" trend in green

Filter Bar: Below KPIs, a white card containing filter controls in a single row: "Status" multi-select dropdown showing "Active" selected, "Customer" searchable dropdown, "Date Range" showing "This Week", "Equipment" dropdown, a search input with magnifying glass icon placeholder "Search orders...", and a "More Filters" text button on the right. Below the dropdowns, show active filter chips as small pills: "Status: Active ×" and "Date: This Week ×" with a "Clear All" link.

Below the filter bar, a row of saved filter preset pill buttons: "My Orders", "Pending Review" (currently active with blue-600 background), "Ready to Invoice", "Urgent", "This Week's Pickups".

Data Table: Below the filters, a white card containing a data table with alternating row backgrounds (white and gray-50/slate-50). Table header row is bold gray-700 text with a subtle bottom border. Columns:
- Checkbox (for bulk select)
- Order # (monospace, blue-600 link text)
- Status (colored badge)
- Customer (company name)
- Origin (City, ST)
- Destination (City, ST)
- Equipment (icon + text badge)
- Pickup Date
- Delivery Date
- Rate ($X,XXX)
- Loads (count)
- Priority (icon)
- Actions (three-dot menu)

Show 8 rows with realistic freight data:
Row 1: ORD-20260115-0042, IN_TRANSIT (sky badge), "Acme Manufacturing", Chicago IL, Dallas TX, Dry Van icon, Jan 15, Jan 17, $2,450, 1 load, medium priority dash
Row 2: ORD-20260115-0041, PENDING (gray badge), "Beta Corp", Los Angeles CA, Phoenix AZ, Reefer snowflake, Jan 16, Jan 18, $3,100, 0 loads (amber text), high priority arrow-up amber
Row 3: ORD-20260114-0040, CONFIRMED (blue badge), "Global Shipping Inc", Atlanta GA, Miami FL, Flatbed, Jan 16, Jan 17, $1,875, 0 loads, urgent priority flame red
...continue with 5 more rows with varied statuses and data.

Show one row with a context menu open showing: "View Detail", "Edit Order", "Create Load", "Clone Order", separator, "Cancel Order" in red text.

At the bottom, pagination: "Showing 1-25 of 247 orders" on the left, page numbers "1 2 3 4 5 ... 10" in the center with Previous/Next buttons, and a "25 per page" dropdown on the right.

A slim bulk action bar is shown at the bottom (one row is checked): "1 selected" text, "Update Status" button, "Assign Rep" button, "Cancel" button in red, "Deselect" link.

Design Specifications:
- Font: Inter or system sans-serif, 13px for table body, 14px for headers
- Content background: gray-50 (#F9FAFB), cards white (#FFFFFF)
- Primary color: blue-600 for links, active states, primary buttons
- Table rows: alternating white / gray-50 with hover:bg-blue-50
- Status badges: colored per TMS status system (gray for pending, blue for confirmed, sky for in-transit, lime for delivered)
- Monospace font for order numbers
- Cards: white, rounded-lg, border border-gray-200, shadow-sm
- Modern SaaS aesthetic similar to Linear.app or Stripe dashboard
- Dense data display optimized for power users who scan 100+ rows daily
```

---

## 15. Enhancement Opportunities

### Current State (Wave 2)

**What's built and working:**
- [ ] Nothing yet -- screen is Not Started.

**What needs to be built for MVP:**
- [ ] DataTable with all core columns, sorting, and pagination
- [ ] 4 KPI summary cards with drill-down filtering
- [ ] FilterBar with status, customer, date range, equipment, search
- [ ] Status badges per row with global color system
- [ ] Row click navigation to Order Detail
- [ ] Row actions dropdown (View, Edit, Create Load, Clone, Cancel)
- [ ] "+ New Order" button
- [ ] Export functionality (CSV)
- [ ] Loading skeletons and empty states
- [ ] URL-synced filter state
- [ ] WebSocket real-time row updates

**What to add this wave (post-MVP polish):**
- [ ] Saved filter presets (system + user-created)
- [ ] Column visibility toggle
- [ ] Bulk selection and bulk actions
- [ ] Inline status change (click badge)
- [ ] Row hover quick preview
- [ ] Keyboard table navigation

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| DataTable with sorting and pagination | High | High | P0 |
| KPI cards with drill-down | High | Medium | P0 |
| Filter bar with core filters | High | Medium | P0 |
| Status badges | High | Low | P0 |
| Row actions menu | High | Low | P0 |
| Search across fields | High | Medium | P0 |
| URL-synced filters | High | Medium | P0 |
| WebSocket real-time updates | High | Medium | P0 |
| Export functionality | Medium | Low | P1 |
| Saved filter presets | Medium | Medium | P1 |
| Bulk selection and actions | Medium | Medium | P1 |
| Column visibility toggle | Low | Low | P1 |
| Inline status change | Medium | Medium | P1 |
| Row hover preview | Low | Low | P2 |
| Keyboard navigation | Low | Medium | P2 |
| Infinite scroll option | Low | Medium | P2 |
| Row color coding by priority | Low | Low | P2 |

### Future Wave Preview

- **Wave 3:** AI-powered order recommendations ("Customer Acme Mfg typically places orders on this lane every Tuesday -- expect 3 more orders this week"). Automated order-to-load matching suggestions. Customer portal integration showing real-time order status.
- **Wave 4:** Predictive analytics on order volume trends. Automated pricing suggestions based on market rates. EDI/API order ingestion with auto-validation and exception flagging.

---

*End of Orders List screen design. Reference `00-service-overview.md` for service-level context and the global status color system for all badge specifications.*
