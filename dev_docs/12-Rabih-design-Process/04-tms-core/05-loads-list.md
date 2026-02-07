# Loads List

> Service: TMS Core | Wave: 2 | Priority: P0
> Route: /loads | Status: Not Started
> Primary Personas: Maria (Dispatcher), Sarah (Ops Manager)
> Roles with Access: super_admin, admin, ops_manager, dispatcher, support (view), read_only (view)

---

## 1. Purpose & Business Context

**What this screen does:**
The Loads List is the primary workspace for dispatchers to manage all loads in the system. It displays every load across all statuses, with powerful filtering, sorting, and inline actions that allow Maria to assign carriers, track progress, identify problems, and manage her daily dispatch workload without leaving the page. This is the second most visited screen in the system after the Dispatch Board, averaging 10+ views per day per dispatcher.

**Business problem it solves:**
Dispatchers juggling 50-60 loads per day need a single, filterable, sortable view that answers critical questions instantly: "Which loads have no carrier assigned?", "What's picking up today?", "Which loads haven't had a check call in 4+ hours?", "What's my margin looking like today?" Without this screen, dispatchers would need to open individual load records one at a time, losing the big-picture situational awareness that prevents costly mistakes like double-booking carriers or missing pickup windows.

**Key business rules:**
- Dispatchers see all loads assigned to them plus all unassigned loads. Ops Managers and Admins see all loads across all dispatchers.
- Loads in PLANNING or PENDING status without a carrier assigned that are past their pickup date are flagged as critical (red row highlight).
- Loads in DISPATCHED through IN_TRANSIT status that have not received a check call in 4+ hours are flagged as "Needs Attention" (orange indicator).
- Margin columns ($ and %) are only visible to users with `finance_view` permission (admin, ops_manager).
- Carrier rate is visible to admin, ops_manager, and dispatcher but hidden from sales and accounting roles.
- Loads cannot be deleted once they reach DISPATCHED status or beyond. Only PLANNING and PENDING loads can be deleted, and only by admin.
- The "Unassigned" carrier indicator in red is one of the most important visual signals on this page -- Maria's eye should immediately find unassigned loads.

**Success metric:**
Average time for a dispatcher to find and act on a specific load drops from 45 seconds to under 10 seconds. "Stale load" incidents (loads without check calls for 6+ hours) decrease by 80% due to the "Needs Attention" visual filter.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Sidebar Navigation | Clicks "Loads" in Operations section | None (default view: this week's loads, sorted by pickup date) |
| Operations Dashboard | Clicks "In Transit" KPI card or "Active Loads" count | `?status=IN_TRANSIT` or `?status=DISPATCHED,AT_PICKUP,PICKED_UP,IN_TRANSIT,AT_DELIVERY` |
| Operations Dashboard | Clicks "Unassigned" KPI stat | `?carrier=unassigned` |
| Orders List | Clicks order# link and sees linked loads section | `?orderId=ORD-2025-XXXXX` |
| Order Detail | Clicks "View Loads" link in order's loads section | `?orderId=ORD-2025-XXXXX` |
| Dispatch Board | Clicks "List View" toggle | Preserves current filters |
| Notification Center | Clicks a load-related notification | `?loadId=LD-2025-XXXXX` (highlights specific row) |
| Direct URL | Bookmark / shared link with filters | URL query params for all filters |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Load Detail | Clicks load# link in table row | `loadId` (navigates to `/loads/:id`) |
| Load Builder | Clicks "+ New Load" or "Build from Order" button | None or `?fromOrder=ORD-XXX` |
| Order Detail | Clicks order# link in table row | `orderId` (navigates to `/orders/:id`) |
| Carrier Detail | Clicks carrier name link in table row | `carrierId` (navigates to `/carriers/:id`) |
| Dispatch Board | Clicks "Board View" toggle | Preserves current filters |
| Tracking Map | Clicks "Map View" toggle or selects loads and clicks "View on Map" | Selected load IDs |

**Primary trigger:**
Maria starts her morning by navigating to the Loads List from the sidebar. She filters by "Picking Up Today" to review her day's workload. Throughout the day she returns to this screen after handling individual loads, using different filter combinations to find what needs attention next.

**Success criteria (user completes the screen when):**
- User has identified all loads requiring action (unassigned, stale, at-risk) and either acted on them directly via inline actions or navigated to the appropriate detail screen.
- User has assigned carriers to unassigned loads via the inline carrier assignment modal.
- User has reviewed the day's load status distribution and feels confident nothing is falling through the cracks.

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------------+
|  PageHeader: "Loads"                    [Build from Order v] [+ New Load]|
+------------------------------------------------------------------------+
|                                                                         |
|  +----------+  +----------+  +----------+  +----------+  +----------+  |
|  | Total    |  | Unassigned|  | In Transit|  | Delivered |  | Avg      |  |
|  | Loads    |  | (red txt) |  |          |  | Today     |  | Margin % |  |
|  | 847      |  | 23        |  | 234       |  | 56        |  | 18.4%    |  |
|  | +3 today |  | 5 urgent  |  | 12 at risk|  | +8 vs yest|  | +1.2 pts |  |
|  +----------+  +----------+  +----------+  +----------+  +----------+  |
|                                                                         |
+------------------------------------------------------------------------+
|  Filter Bar:                                                            |
|  [Status v] [Pickup Date Range] [Carrier v] [Equipment v] [Search...] |
|  [Saved: My Loads | Urgent | Unassigned | Needs Attention]  [More v]   |
+------------------------------------------------------------------------+
|  View Toggle: [Table] [Cards] [Map]           [Columns v] [Export v]   |
+------------------------------------------------------------------------+
|  +------------------------------------------------------------------+  |
|  | Chk | Load #    | Order # | Carrier          | Origin > Dest    |  |
|  |-----|-----------|---------|------------------|------------------|  |
|  | [ ] | LD-0847   | ORD-412 | Swift Transport  | Chicago > Dallas |  |
|  | [ ] | LD-0848   | ORD-413 | ** Unassigned ** | LA > Phoenix     |  |
|  | [ ] | LD-0849   | ORD-414 | Werner           | ATL > MIA        |  |
|  |     | ...       |         |                  |                  |  |
|  +------------------------------------------------------------------+  |
|  | Continued: | Pickup   | Delivery | Equip | Status     | Carrier |  |
|  |            | Date     | Date     | Icon  | Badge      | Rate    |  |
|  |            |----------|----------|-------|------------|---------|  |
|  |            | Jan 15   | Jan 17   | [V]   | In Transit | $1,850  |  |
|  |            | Jan 16   | Jan 18   | [R]   | Pending    | --      |  |
|  |            | Jan 15   | Jan 16   | [V]   | Delivered  | $2,100  |  |
|  +------------------------------------------------------------------+  |
|  | Continued: | Margin % | Last Location     | Actions              |  |
|  |            |----------|-------------------|----------------------|  |
|  |            | 18.2%    | Memphis, TN (2h)  | [eye] [truck] [...]  |  |
|  |            | --       | --                | [assign] [...]       |  |
|  |            | 22.1%    | Jacksonville, FL  | [eye] [...]          |  |
|  +------------------------------------------------------------------+  |
|                                                                         |
|  Pagination: < 1 2 3 ... 42 >     Showing 1-25 of 1,047 loads         |
+------------------------------------------------------------------------+
|  BULK ACTION BAR (appears when rows selected):                          |
|  "12 loads selected"  [Assign Carrier] [Update Status] [Export]  [x]   |
+------------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible, above the fold) | Load #, carrier name (or "Unassigned" in red), status badge, origin-destination, pickup date | Maria scans these columns instantly to assess her workload. The "Unassigned" red text is the most important signal. |
| **Secondary** (visible but less prominent) | Delivery date, equipment type icon, carrier rate, margin %, last location, actions column | Important context for decision-making but not the first thing scanned |
| **Tertiary** (available on hover, expand, or scroll) | Order #, customer name, driver name, special instructions, miles, weight | Needed for specific investigations but not for the general scan |
| **Hidden** (behind a click -- modal, drawer, or detail page) | Full load timeline, check call history, documents, rate breakdown, carrier scorecard | Deep detail accessed by clicking through to Load Detail |

---

## 4. Data Fields & Display

### Visible Fields

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Checkbox | N/A (UI selection) | Checkbox for bulk selection | Table column 1, 32px width |
| 2 | Load # | Load.loadNumber | Monospace font `LD-2025-XXXXX`, clickable blue link to Load Detail | Table column 2 |
| 3 | Order # | Load.orderId -> Order.orderNumber | Monospace font `ORD-2025-XXXXX`, clickable link to Order Detail. If no linked order, show "--" | Table column 3 |
| 4 | Carrier | Load.carrierId -> Carrier.name | Carrier company name. If unassigned: bold red text "Unassigned" with clickable behavior (opens carrier assignment modal). If assigned: carrier name as link to Carrier Detail. | Table column 4 |
| 5 | Origin > Destination | Load.stops[0].city + stops[last].city | "City, ST > City, ST" format. Arrow icon between. Truncated if too long. | Table column 5 |
| 6 | Pickup Date | Load.stops[0].appointmentDate | "MMM DD" format (e.g., "Jan 15"). If today: bold. If past and not picked up: red text. | Table column 6 |
| 7 | Delivery Date | Load.stops[last].appointmentDate | "MMM DD" format. If past due: red text. | Table column 7 |
| 8 | Equipment | Load.equipmentType | Icon only (from equipment type design system). Tooltip shows full name. E.g., container icon for Dry Van, snowflake for Reefer. | Table column 8, 40px width |
| 9 | Status | Load.status | Colored badge with icon per status-color-system.md. E.g., "In Transit" sky badge with truck icon. | Table column 9 |
| 10 | Carrier Rate | Load.carrierRate | "$X,XXX.XX" format. If no rate: "--". Hidden for roles without `finance_view`. | Table column 10 |
| 11 | Margin % | Calculated | "XX.X%" format. Color-coded: green >15%, yellow 5-15%, red <5%. Hidden for roles without `finance_view`. | Table column 11 |
| 12 | Last Location | Load.lastLocation | "City, ST (Xh ago)" -- city/state from last GPS update + relative time since update. If no GPS: "No tracking" in gray italic. If >4h stale: orange text. | Table column 12 |
| 13 | Actions | N/A | Icon buttons: View (eye icon), Quick Dispatch (truck icon, only for loads with carrier assigned but not yet dispatched), More menu (...). | Table column 13 |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Margin % | (Load.customerRate - Load.carrierRate) / Load.customerRate * 100 | Percentage with 1 decimal. Color-coded: green >15%, yellow 5-15%, red <5%. "--" if either rate is missing. |
| 2 | Margin $ | Load.customerRate - Load.carrierRate | Currency ($X,XXX.XX). Not shown in table (available in Load Detail). Used for stat card average. |
| 3 | Time Since Last Check Call | now() - Load.lastCheckCallAt | Relative time: "2h 15m ago". If >4h: orange warning indicator. If >8h: red warning indicator. Used in "Needs Attention" filter. |
| 4 | Urgency Level (row color) | Based on carrier assignment + pickup date proximity | Red row: unassigned + past pickup date. Orange row: unassigned + pickup today. Yellow row: unassigned + pickup this week. Normal: all other loads. |
| 5 | Stat: Total Loads | COUNT(loads matching current filters) | Integer with delta vs previous period |
| 6 | Stat: Unassigned | COUNT(loads WHERE carrierId IS NULL AND status IN [PLANNING, PENDING]) | Integer. Red text. Sub-stat: count where pickup < today (urgent). |
| 7 | Stat: In Transit | COUNT(loads WHERE status IN [DISPATCHED, AT_PICKUP, PICKED_UP, IN_TRANSIT, AT_DELIVERY]) | Integer. Sub-stat: count where lastCheckCall > 4h (at risk). |
| 8 | Stat: Delivered Today | COUNT(loads WHERE status = DELIVERED AND deliveredDate = today) | Integer. Delta vs yesterday. |
| 9 | Stat: Avg Margin % | AVG(margin%) for loads matching current filters | Percentage with 1 decimal. Delta vs previous period in points. |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] Paginated data table with 25/50/100 rows per page options
- [ ] Status badge column with colors per load status color system (12 statuses)
- [ ] Column sorting on all sortable columns (click column header to toggle asc/desc)
- [ ] Multi-select checkboxes for bulk actions
- [ ] 5 KPI stat cards above the table (Total, Unassigned, In Transit, Delivered Today, Avg Margin)
- [ ] Filter bar: status multi-select, pickup date range, carrier select, equipment type, free-text search
- [ ] Search across: load number, order number, carrier name, origin city, destination city, customer name
- [ ] Click load# to navigate to Load Detail
- [ ] Click order# to navigate to Order Detail
- [ ] Click carrier name to navigate to Carrier Detail
- [ ] "Unassigned" text in red that opens carrier assignment modal on click
- [ ] Row actions: View (navigate to detail), More menu with status-appropriate actions
- [ ] "+ New Load" primary button navigates to Load Builder
- [ ] "Build from Order" button opens order selection modal, then navigates to Load Builder with order pre-fill
- [ ] URL-synced filters (all filter state in query params for shareable views)
- [ ] Persistent column visibility preferences (stored per-user in localStorage)

### Advanced Features (Logistics Expert Recommendations)

- [ ] Color-coded row urgency: red = unassigned past pickup, orange = unassigned today, yellow = unassigned this week
- [ ] Inline carrier assignment: click "Unassigned" red text to open carrier search/assignment modal without leaving the list
- [ ] Quick Dispatch: one-click "Dispatch" icon button for loads that have a carrier assigned and rate confirmation signed but are not yet dispatched
- [ ] "Needs Attention" smart filter: loads in active transit statuses without a check call in 4+ hours
- [ ] View toggle: Table (default) / Cards (mobile-friendly) / Map (show selected or filtered loads on a map)
- [ ] Split view option: table on left (60%), map on right (40%) showing routes for currently visible/selected loads
- [ ] Bulk carrier assignment: select multiple loads on the same lane, assign one carrier to all
- [ ] Export rate confirmations: bulk PDF download of rate confirmations for selected loads
- [ ] Auto-refresh every 30 seconds with visual diff highlighting (changed rows flash blue briefly)
- [ ] Saved filter presets: system presets (My Loads, Urgent, Unassigned, Needs Attention) + user-created presets
- [ ] Column reordering: drag column headers to rearrange
- [ ] Inline status update: click status badge to open quick status change dropdown (only valid next statuses shown)
- [ ] Right-click context menu on any row for quick actions
- [ ] Keyboard navigation: arrow keys to move between rows, Enter to open detail, Space to select

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| View carrier rate column | admin, ops_manager, dispatcher | finance_view (carrier_rate) | Column hidden entirely |
| View margin % column | admin, ops_manager | finance_view (margin) | Column hidden entirely |
| View Avg Margin stat card | admin, ops_manager | finance_view | Stat card replaced with "On-Time %" stat |
| Assign carrier (inline) | admin, ops_manager, dispatcher | load_assign | "Unassigned" text is not clickable; shown as plain red text |
| Create new load | admin, ops_manager, dispatcher | load_create | "+ New Load" button hidden |
| Delete load | admin | load_delete | Delete option not in row actions menu |
| Bulk status update | admin, ops_manager, dispatcher | load_edit | Bulk action bar: "Update Status" button hidden |
| Export to CSV | any authenticated | export_data | Export button disabled with tooltip "Export not available for your role" |
| Quick Dispatch | admin, ops_manager, dispatcher | load_dispatch | Quick dispatch icon button hidden |

---

## 6. Status & State Machine

### Status Transitions

```
[PLANNING] ---(Add details)---> [PENDING]
     |                              |
     v                              v
[CANCELLED]                   [TENDERED] ---(Carrier accepts)---> [ACCEPTED]
                                   |                                  |
                                   |---(Carrier rejects)---> [PENDING] (back)
                                                                      |
                                                              [DISPATCHED]
                                                                      |
                                                              [AT_PICKUP]
                                                                      |
                                                              [PICKED_UP]
                                                                      |
                                                              [IN_TRANSIT]
                                                                      |
                                                              [AT_DELIVERY]
                                                                      |
                                                              [DELIVERED]
                                                                      |
                                                              [COMPLETED]
```

### Actions Available Per Status (from this list screen)

| Status | Available Actions (Row Menu) | Bulk Actions |
|---|---|---|
| PLANNING | Edit, Assign Carrier, Delete | Bulk Assign Carrier, Bulk Delete |
| PENDING | Edit, Assign Carrier, Delete | Bulk Assign Carrier, Bulk Delete |
| TENDERED | View, Cancel Tender, Change Carrier | N/A |
| ACCEPTED | View, Send Rate Confirmation, Dispatch, Change Carrier | Bulk Dispatch |
| DISPATCHED | View, Add Check Call, Track on Map | Bulk Add Check Call |
| AT_PICKUP | View, Confirm Pickup, Add Check Call | N/A |
| PICKED_UP | View, Add Check Call | N/A |
| IN_TRANSIT | View, Add Check Call, Update ETA | Bulk Add Check Call |
| AT_DELIVERY | View, Confirm Delivery, Add Check Call | N/A |
| DELIVERED | View, Upload POD, Complete | Bulk Complete |
| COMPLETED | View, Clone | N/A |
| CANCELLED | View, Clone | N/A |

### Status Badge Colors

| Status | Background | Text | Tailwind Token | Icon |
|---|---|---|---|---|
| PLANNING | #F1F5F9 | #334155 | slate-100/slate-700 | PenLine |
| PENDING | #F3F4F6 | #374151 | gray-100/gray-700 | Clock |
| TENDERED | #EDE9FE | #5B21B6 | violet-100/violet-800 | SendHorizonal |
| ACCEPTED | #DBEAFE | #1E40AF | blue-100/blue-800 | ThumbsUp |
| DISPATCHED | #E0E7FF | #3730A3 | indigo-100/indigo-800 | Send |
| AT_PICKUP | #FEF3C7 | #92400E | amber-100/amber-800 | MapPin |
| PICKED_UP | #CFFAFE | #155E75 | cyan-100/cyan-800 | PackageOpen |
| IN_TRANSIT | #E0F2FE | #075985 | sky-100/sky-800 | Truck |
| AT_DELIVERY | #CCFBF1 | #115E59 | teal-100/teal-800 | MapPinCheck |
| DELIVERED | #ECFCCB | #3F6212 | lime-100/lime-800 | PackageCheck |
| COMPLETED | #D1FAE5 | #065F46 | emerald-100/emerald-800 | CircleCheckBig |
| CANCELLED | #FEE2E2 | #991B1B | red-100/red-800 | XCircle |

---

## 7. Actions & Interactions

### Primary Action Buttons (Top-Right of Page Header)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| + New Load | Plus | Primary / Blue | Navigates to `/loads/new` (Load Builder) | No |
| Build from Order | FileStack | Secondary / Outline dropdown | Opens order selection modal. User searches/selects an unbuilt order. On select, navigates to `/loads/new?fromOrder=ORD-XXX`. | No |

### Row Actions (Per-Row "More" Menu)

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| View Load | Eye | Navigate to `/loads/:id` | Always available |
| Edit Load | Pencil | Navigate to `/loads/:id/edit` | Status is PLANNING or PENDING |
| Assign Carrier | UserPlus | Opens inline carrier assignment modal | Status is PLANNING or PENDING, no carrier assigned |
| Change Carrier | UserCog | Opens carrier reassignment modal with reason field | Status is TENDERED or ACCEPTED |
| Send Rate Confirmation | FileText | Generates and sends rate confirmation PDF to carrier | Status is ACCEPTED, carrier assigned |
| Dispatch | Send | Changes status to DISPATCHED, sends dispatch notification | Status is ACCEPTED, rate confirmation signed |
| Add Check Call | PhoneCall | Opens check call entry modal | Status is DISPATCHED through AT_DELIVERY |
| Track on Map | Map | Opens Tracking Map filtered to this load | Status is DISPATCHED through AT_DELIVERY |
| Update ETA | Clock | Opens ETA update modal | Status is IN_TRANSIT |
| Confirm Pickup | PackageOpen | Updates stop status to LOADING/COMPLETED, advances load status | Status is AT_PICKUP |
| Confirm Delivery | PackageCheck | Updates stop status to COMPLETED, advances load to DELIVERED | Status is AT_DELIVERY |
| Upload POD | Upload | Opens POD upload modal | Status is DELIVERED |
| Complete | CircleCheckBig | Marks load as COMPLETED | Status is DELIVERED, POD uploaded |
| Clone Load | Copy | Navigates to Load Builder pre-filled with this load's data | Always available |
| Delete Load | Trash | Deletes the load after confirmation | Status is PLANNING or PENDING, admin only |
| Cancel Load | XCircle | Cancels the load with reason | Status is PLANNING through ACCEPTED |

### Bulk Actions (When Multiple Rows Selected)

| Action Label | Action | Confirmation |
|---|---|---|
| Assign Carrier | Opens carrier assignment modal, assigns to all selected unassigned loads | Yes -- "Assign [carrier name] to N loads?" |
| Update Status | Opens status change dropdown (only valid shared statuses for all selected) | Yes -- "Update N loads to [status]?" |
| Dispatch | Dispatches all selected loads that are in ACCEPTED status | Yes -- "Dispatch N loads?" |
| Export Selected | Downloads CSV of selected rows | No |
| Export Rate Confirmations | Downloads ZIP of rate confirmation PDFs for selected loads | No |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + K | Open global search / command palette |
| Ctrl/Cmd + N | Navigate to New Load (Load Builder) |
| / | Focus the search input |
| Escape | Close modal / deselect all rows / clear search |
| Arrow Up/Down | Navigate between table rows (with row focus indicator) |
| Enter | Open selected row's Load Detail |
| Space | Toggle checkbox selection on focused row |
| Ctrl/Cmd + A | Select all visible rows |
| Ctrl/Cmd + Shift + E | Export current view as CSV |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| N/A | N/A | No drag-and-drop on the list view. Drag-and-drop is available on the Board/Kanban view (Dispatch Board screen). |

---

## 8. Real-Time Features

### WebSocket Events

This screen is classified as **Enhanced Real-Time** in the real-time feature map. WebSocket provides live updates; polling fallback at 30-second intervals.

| Event Name | Payload | UI Update |
|---|---|---|
| load:created | { loadId, orderId, status, origin, destination, pickupDate, equipmentType } | If new load matches current filters, append row to top of table with subtle blue flash highlight. Increment "Total Loads" stat card. If unassigned, increment "Unassigned" stat. |
| load:status:changed | { loadId, previousStatus, newStatus, changedBy, timestamp } | Update status badge in the row. If status moves to DELIVERED, increment "Delivered Today" stat. If status leaves unassigned states, decrement "Unassigned" stat. Row flashes blue for 2 seconds. |
| load:assigned | { loadId, carrierId, carrierName, driverId, driverName } | Update carrier column from "Unassigned" (red) to carrier name (link). Decrement "Unassigned" stat card. Row flashes blue. |
| load:location:updated | { loadId, lat, lng, city, state, timestamp } | Update "Last Location" column for the affected row. No flash (too frequent). |
| load:eta:updated | { loadId, newEta, previousEta, reason } | If displayed (in expanded row or tooltip), update ETA. |

### Live Update Behavior

- **Update frequency:** WebSocket push for status changes, carrier assignments, and new loads. Location updates throttled to max 1 per load per 30 seconds on this screen.
- **Visual indicator:** Changed rows flash with a subtle blue highlight (`bg-blue-50`) that fades over 2 seconds using CSS transition.
- **Batch rendering:** Multiple events arriving within 3 seconds are batched into a single re-render to prevent list flickering.
- **Conflict handling:** If user has a modal open (carrier assignment, status change), incoming events that affect the same load show a subtle banner: "This load was just updated. Close and refresh to see changes."
- **Stat card updates:** KPI cards update independently via their own data stream, not requiring a full table refresh.

### Polling Fallback

- **When:** WebSocket connection to `/dispatch` namespace drops.
- **Interval:** Every 30 seconds.
- **Endpoint:** GET /api/loads?updatedSince={lastPollTimestamp}&{currentFilters}
- **Visual indicator:** Show "Live updates paused -- refreshing every 30s" subtle text in the page header area. Small orange dot next to "Loads" title.

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Assign carrier | Carrier name appears immediately in the row; "Unassigned" count decrements | Revert to "Unassigned"; increment count; error toast "Failed to assign carrier." |
| Change status | Status badge updates immediately; row may change urgency color | Revert badge to previous status; error toast "Status update failed." |
| Delete load | Row fades out and is removed from table; total count decrements | Row fades back in; error toast "Failed to delete load." |
| Dispatch | Status changes to DISPATCHED; quick dispatch icon disappears | Revert to ACCEPTED status; error toast |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| PageHeader | src/components/ui/PageHeader.tsx | title: "Loads", actions: [New Load, Build from Order] |
| Table | src/components/ui/table.tsx | Base table primitives (thead, tbody, tr, td) |
| Badge | src/components/ui/badge.tsx | Status badges with variant from status-color-system |
| Button | src/components/ui/button.tsx | All action buttons |
| Checkbox | src/components/ui/checkbox.tsx | Row selection checkboxes |
| DropdownMenu | src/components/ui/dropdown-menu.tsx | Row actions "More" menu, bulk actions |
| SearchableSelect | src/components/ui/searchable-select.tsx | Carrier filter, customer filter |
| Select | src/components/ui/select.tsx | Status filter, equipment filter |
| Pagination | src/components/ui/pagination.tsx | Table pagination controls |
| Skeleton | src/components/ui/skeleton.tsx | Loading state skeleton rows |
| Dialog | src/components/ui/dialog.tsx | Carrier assignment modal, confirmation modals |
| Sheet | src/components/ui/sheet.tsx | Mobile filter panel |
| Tooltip | src/components/ui/tooltip.tsx | Equipment type icon tooltip, column header tooltips |
| Calendar | src/components/ui/calendar.tsx + popover.tsx | Date range filter |
| DataTableSkeleton | src/components/shared/data-table-skeleton.tsx | Loading skeleton for table |
| EmptyState | src/components/shared/empty-state.tsx | No results / first-time empty |
| ErrorState | src/components/shared/error-state.tsx | API error display |
| ConfirmDialog | src/components/shared/confirm-dialog.tsx | Delete/cancel confirmation |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| Table | Basic HTML table primitives | Need DataTable wrapper with: sortable column headers, bulk selection, row actions, column visibility toggle, sticky header, virtual scrolling for large datasets |
| Badge | Standard badge with variant prop | Need LoadStatusBadge variant that includes the Lucide icon automatically based on status |
| SearchableSelect | Single-item search select | Need multi-select variant for status filter (select multiple statuses) |
| Pagination | Basic prev/next | Need page size selector (25/50/100), total count display, "Showing X-Y of Z" text |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| LoadsDataTable | Full-featured data table for loads: sortable columns, bulk selection, row actions, column visibility, sticky header, virtual scroll, responsive column hiding | Complex |
| KPIStatCard | Compact stat card with: label, large number, delta indicator (+X or -X with arrow), trend color (green up, red down). Click to apply filter. | Medium |
| LoadStatusBadge | Domain-specific badge for load status. Takes `status` prop, renders correct color, icon, and label from status-color-system. | Small |
| CarrierAssignmentModal | Modal for searching and selecting a carrier to assign to a load. Shows carrier search, carrier cards with scorecard preview, and confirm button. | Complex |
| QuickStatusDropdown | Dropdown that shows only valid next statuses for a given current status. Clicking a status triggers the transition. | Medium |
| InlineCarrierLink | Table cell component: if carrier assigned, shows name as link; if unassigned, shows red "Unassigned" clickable text that opens CarrierAssignmentModal. | Small |
| UrgencyRowHighlight | Table row wrapper that applies background color based on urgency calculation (red/orange/yellow/none). | Small |
| FilterPresetBar | Horizontal bar of clickable preset filter buttons (My Loads, Urgent, Unassigned, Needs Attention) + "Save Current" option. | Medium |
| ViewToggle | Toggle group for switching between Table / Cards / Map views. Preserves filter state across views. | Small |
| LoadCardView | Card-based alternative to table view. Each load as a card with: load#, status, route, carrier, dates. Suitable for mobile. | Medium |
| SplitViewLayout | Resizable split pane: table on left, map on right. | Medium |
| CheckCallEntryModal | Quick modal for adding a check call: type dropdown, location, notes, ETA update. | Medium |
| BulkActionBar | Floating bar that appears at bottom when rows are selected. Shows count + action buttons. Dismissible. | Small |
| ColumnVisibilityToggle | Dropdown with checkboxes for each column. Toggle visibility. Preferences persisted in localStorage. | Small |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Toggle Group | toggle-group | View toggle (Table/Cards/Map) |
| Resizable | resizable | Split view (table + map) |
| Context Menu | context-menu | Right-click row actions (future) |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/loads?status=&dateFrom=&dateTo=&carrierId=&equipment=&search=&page=&limit=&sort=&order= | Fetch paginated load list with filters and sorting | useLoads(filters) |
| 2 | GET | /api/loads/stats?dateFrom=&dateTo= | Fetch KPI stat card data (counts, averages) | useLoadStats(filters) |
| 3 | GET | /api/loads/:id | Fetch single load (for modal previews) | useLoad(id) |
| 4 | PATCH | /api/loads/:id/status | Update load status | useUpdateLoadStatus() |
| 5 | PATCH | /api/loads/:id/carrier | Assign or reassign carrier to load | useAssignCarrier() |
| 6 | POST | /api/loads/:id/check-calls | Add a check call to a load | useCreateCheckCall() |
| 7 | DELETE | /api/loads/:id | Delete a load (PLANNING/PENDING only) | useDeleteLoad() |
| 8 | GET | /api/carriers?search=&equipment=&lane= | Search carriers for assignment modal | useCarrierSearch(query) |
| 9 | GET | /api/orders?status=BOOKED&hasLoad=false | Fetch orders without loads for "Build from Order" | useUnbuiltOrders() |
| 10 | POST | /api/loads/:id/dispatch | Dispatch a load (sends notification to carrier) | useDispatchLoad() |
| 11 | GET | /api/loads/export?format=csv&{filters} | Export filtered loads as CSV | useExportLoads() |
| 12 | GET | /api/loads/export/rate-confirmations?loadIds= | Export rate confirmation PDFs as ZIP | useExportRateConfirmations() |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| dispatch:{tenantId} | load:created | useLoadListUpdates() -- if matching filters, prepend to list and update stats |
| dispatch:{tenantId} | load:status:changed | useLoadListUpdates() -- update row status badge, recalculate stats |
| dispatch:{tenantId} | load:assigned | useLoadListUpdates() -- update carrier column, recalculate unassigned count |
| tracking:{tenantId} | load:location:updated | useLoadLocationUpdates() -- update last location column (throttled) |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 409 | 500 |
|---|---|---|---|---|---|---|
| GET /api/loads | Show filter error toast | Redirect to login | Show "Access Denied" full page | N/A | N/A | Show error state with retry button |
| PATCH /api/loads/:id/status | Show validation toast (invalid transition) | Redirect to login | Show "Permission Denied" toast | Show "Load not found" toast | Show "Load was modified by another user" with refresh option | Show error toast with retry |
| PATCH /api/loads/:id/carrier | Show validation toast | Redirect to login | Show "Permission Denied" toast | Show "Load not found" toast | Show conflict toast | Show error toast with retry |
| DELETE /api/loads/:id | Show "Cannot delete" toast with reason | Redirect to login | Show "Permission Denied" toast | Show "Load not found" toast | N/A | Show error toast with retry |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Show page header immediately. Show 5 skeleton stat cards (gray animated bars, same dimensions as real cards). Show skeleton filter bar (3 gray bars). Show table with 10 skeleton rows: gray animated bars matching actual column widths (narrow for checkbox, medium for load#, wide for carrier, etc.). Skeleton rows alternate slightly in opacity for visual rhythm.
- **Progressive loading:** Stat cards may load before table data. Show stat cards as soon as their API returns; table skeleton continues independently.
- **Subsequent loads:** When changing filters, show a subtle loading bar at the top of the table (like YouTube's red loading bar) rather than replacing table with skeletons. Previous data remains visible but slightly dimmed.
- **Duration threshold:** If loading exceeds 5 seconds, show "This is taking longer than usual..." message below the table area.

### Empty States

**First-time empty (no loads ever created):**
- Illustration: Truck/shipping illustration
- Headline: "No loads yet"
- Description: "Create your first load to start managing shipments. You can build a load from an existing order or start from scratch."
- CTA Buttons: "Build from Order" (secondary) and "Create First Load" (primary)

**Filtered empty (loads exist but filters exclude all):**
- Headline: "No loads match your filters"
- Description: "Try adjusting your filters or search terms to find what you're looking for."
- CTA Button: "Clear All Filters" (secondary outline)

**Searched empty:**
- Headline: "No results for '[search term]'"
- Description: "Try a different search term. You can search by load number, order number, carrier name, or city."
- CTA Button: "Clear Search" (secondary outline)

### Error States

**Full page error (API completely fails):**
- Error icon + "Unable to load loads" + "Please try again or contact support if the issue persists." + Retry button.
- Stat cards also show error state (dashed border, "..." instead of numbers).

**Stat cards error (stats API fails but list works):**
- Stat cards show "Error" state with retry link. Table loads normally.

**Action error (inline action fails):**
- Toast notification: red background, error icon, specific message (e.g., "Could not assign Swift Transport to LD-2025-0848. Carrier may already be at capacity."). Auto-dismiss after 8 seconds. Dismiss button.

### Permission Denied

- **Full page denied:** If user role has no access to loads (e.g., sales_agent), show "You don't have permission to view loads" with link to dashboard.
- **Partial denied:** Financial columns (carrier rate, margin %) hidden entirely for roles without `finance_view`. No indication they exist. Stat card for "Avg Margin" replaced with "On-Time %" for non-finance roles. Action buttons hidden per role (see Section 5).

### Offline / Degraded

- **Full offline:** Banner: "You're offline. Showing cached data from [timestamp]. Changes will sync when reconnected." Table shows last cached data. Action buttons disabled.
- **WebSocket down, REST works:** Subtle indicator: orange dot + "Live updates paused" in page header. Data still refreshes on filter change, pagination, or manual refresh button. 30-second polling active.
- **Slow network:** If API response exceeds 3 seconds, show loading bar. If it exceeds 10 seconds, show "Slow connection detected" message.

---

## 12. Filters, Search & Sort

### Filters

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Status | Multi-select dropdown | PLANNING, PENDING, TENDERED, ACCEPTED, DISPATCHED, AT_PICKUP, PICKED_UP, IN_TRANSIT, AT_DELIVERY, DELIVERED, COMPLETED, CANCELLED | All except COMPLETED and CANCELLED | ?status=PLANNING,PENDING,... |
| 2 | Pickup Date | Date range picker | Presets: Today, Tomorrow, This Week, Next Week, This Month, Custom | This Week | ?pickupFrom=&pickupTo= |
| 3 | Delivery Date | Date range picker | Same presets as Pickup Date | All | ?deliveryFrom=&deliveryTo= |
| 4 | Carrier | Searchable select | From /api/carriers (active carriers) + "Unassigned" option | All | ?carrierId= or ?carrier=unassigned |
| 5 | Equipment Type | Multi-select dropdown | Dry Van, Reefer, Flatbed, Step Deck, Lowboy, Conestoga, Power Only, Sprinter, Hotshot, Tanker, Hopper, Container | All | ?equipment=DRY_VAN,REEFER |
| 6 | Customer | Searchable select | From /api/customers | All | ?customerId= |
| 7 | Assigned Dispatcher | Select dropdown | From /api/users?role=dispatcher (visible to ops_manager and admin only) | All (or "My Loads" for dispatchers) | ?dispatcherId= |
| 8 | Origin State | Multi-select | US states | All | ?originState=IL,CA |
| 9 | Destination State | Multi-select | US states | All | ?destState=TX,FL |
| 10 | Has Check Call | Select | "Any", "Last 2h", "Last 4h", "Over 4h ago", "Over 8h ago", "None" | Any | ?checkCallAge= |

### Search Behavior

- **Search field:** Single search input in the filter bar, right side.
- **Searches across:** Load number, order number, carrier name, customer name, origin city, destination city, PO number, driver name.
- **Behavior:** Debounced 300ms, minimum 2 characters. Highlights matching text in results (yellow highlight on matched substring). Server-side search.
- **URL param:** ?search=
- **Clear:** X button inside search input to clear. Clearing refreshes the list.

### Sort Options

| Column / Field | Default Direction | Sort Type |
|---|---|---|
| Pickup Date | Ascending (soonest first) | Date |
| Delivery Date | Ascending (soonest first) | Date |
| Load Number | Descending (newest first) | Alphanumeric |
| Status | Custom order (active statuses first, completed/cancelled last) | Custom enum |
| Carrier Name | Ascending (A-Z) | Alpha |
| Carrier Rate | Descending (highest first) | Numeric |
| Margin % | Descending (highest first) | Numeric |
| Origin | Ascending (A-Z) | Alpha |
| Destination | Ascending (A-Z) | Alpha |

**Default sort:** Pickup Date ascending -- soonest pickups first. This matches Maria's workflow of prioritizing today's and tomorrow's pickups.

### Saved Filters / Presets

- **System presets:**
  - "My Loads" -- loads assigned to current dispatcher (auto-set dispatcherId filter)
  - "Urgent" -- unassigned loads with pickup date today or past
  - "Unassigned" -- loads with no carrier assigned in PLANNING/PENDING status
  - "Needs Attention" -- active loads (DISPATCHED through AT_DELIVERY) without check call in 4+ hours
  - "Picking Up Today" -- loads with pickup appointment date = today
  - "Delivering Today" -- loads with delivery appointment date = today
  - "In Transit" -- status filter for DISPATCHED, AT_PICKUP, PICKED_UP, IN_TRANSIT, AT_DELIVERY
- **User-created presets:** Users can save current filter combination with a custom name. Stored per-user in localStorage and synced to server. Shown in the preset bar after system presets.
- **URL sync:** All filter state is reflected in URL query params. Sharing a URL shares the exact filter state. Bookmarking preserves the view.

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Sidebar collapses to icon-only mode (per global layout).
- KPI stat cards: stack 2 per row instead of 5 (top row: Total + Unassigned, bottom row: In Transit + Delivered Today; Avg Margin hidden or shown in a third row).
- Filter bar: collapse all filters behind a "Filters (X active)" button that opens a slide-over panel from the right. Search input remains visible.
- Data table: hide lower-priority columns (margin %, last location, delivery date). Remaining columns: checkbox, load#, carrier, origin>dest, pickup date, equipment icon, status, actions.
- Column visibility toggle still accessible for users who want to customize.
- View toggle: Table and Cards views available. Map view opens full-screen overlay.
- Bulk action bar: appears above table instead of floating at bottom (more thumb-friendly on tablets).

### Mobile (< 768px)

- Sidebar hidden entirely (hamburger menu).
- KPI stat cards: horizontal scroll (swipe left/right). Show all 5 in a scrollable row at 160px width each.
- Filter bar: hidden behind a "filter" icon button in the page header. Tapping opens full-screen filter modal with all filter options stacked vertically. "Apply Filters" button at bottom.
- Search: appears as a search icon in the header; tapping opens a full-width search bar that pushes content down.
- Data table switches to card-based list view. Each load is a card showing:
  - Top row: Load # (monospace) + Status badge (right-aligned)
  - Second row: Carrier name (or "Unassigned" in red)
  - Third row: Origin city > Destination city
  - Fourth row: Pickup date + Equipment icon
  - Tap card to navigate to Load Detail.
  - Swipe left on card to reveal quick actions: Assign Carrier, Track, More.
- Pagination: "Load More" button at bottom instead of page numbers.
- Pull-to-refresh for data reload.
- Sticky bottom bar with "+ New Load" FAB (floating action button).
- Bulk selection: long-press on a card to enter selection mode. Top bar shows count + action buttons.

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full layout: all columns visible, 5 stat cards in row, all filters visible |
| Desktop | 1024px - 1439px | Minor: stat cards may wrap to 2 rows of 3+2; all table columns still visible |
| Tablet | 768px - 1023px | Stat cards 2/row; filters collapsed; table shows 7 columns |
| Mobile | < 768px | Card list view; stat cards scroll; filters in modal; FAB for new load |

---

## 14. Stitch Prompt

```
Design a loads list page for a modern freight/logistics TMS (Transportation Management System) called "Ultra TMS."

Layout: Full-width content area (dark slate-900 sidebar on the left, 240px, is visible but mostly collapsed). White content area on the right. Top of content area has a PageHeader with breadcrumb "Operations > Loads", title "Loads" on the left, and two buttons on the right: "Build from Order" (secondary outline) and "+ New Load" (primary blue-600).

Below the header, show a row of 5 KPI stat cards with equal spacing:
1. "Total Loads" showing "847" in large bold text, subtitle "+3 today" in green with up arrow
2. "Unassigned" showing "23" in large bold RED text (this is urgent), subtitle "5 past pickup" in red
3. "In Transit" showing "234" in large bold text, subtitle "12 need attention" in amber/orange
4. "Delivered Today" showing "56" in large bold text, subtitle "+8 vs yesterday" in green
5. "Avg Margin" showing "18.4%" in large bold text, subtitle "+1.2 pts" in green

Below stats, a filter bar with:
- Status multi-select dropdown (showing "All Active" as selected label)
- Date range picker showing "This Week: Jan 13 - Jan 19"
- Carrier searchable select showing "All Carriers"
- Equipment type select showing "All Equipment"
- Search input with magnifying glass icon and placeholder "Search loads..."
On a second row within the filter bar: preset filter chips: "My Loads" (selected/active with blue background), "Urgent", "Unassigned", "Needs Attention", "Picking Up Today"
Far right of filter bar: "Table" / "Cards" / "Map" view toggle (Table is active), column visibility icon, export dropdown icon.

Below filters, a data table with these columns: Checkbox, Load #, Order #, Carrier, Origin > Dest, Pickup, Delivery, Equip, Status, Rate, Margin %, Last Location, Actions.

Show 8 rows of realistic data:
- [ ] LD-2025-0847 | ORD-0412 | Swift Transport | Chicago, IL > Dallas, TX | Jan 15 | Jan 17 | [Van icon] | "In Transit" (sky blue badge with truck icon) | $1,850 | 18.2% (green) | Memphis, TN (2h ago) | [eye][...] -- this row has normal white background
- [ ] LD-2025-0848 | ORD-0413 | **Unassigned** (bold red text) | Los Angeles, CA > Phoenix, AZ | Jan 16 | Jan 18 | [Snowflake icon] | "Pending" (gray badge) | -- | -- | -- | [assign][...] -- this row has LIGHT ORANGE background (unassigned, pickup tomorrow)
- [ ] LD-2025-0849 | ORD-0414 | Werner Enterprises | Atlanta, GA > Miami, FL | Jan 15 | Jan 16 | [Van icon] | "Delivered" (lime badge with package-check icon) | $2,100 | 22.1% (green) | Miami, FL | [eye][...] -- normal background
- [ ] LD-2025-0850 | ORD-0415 | **Unassigned** (bold red text) | Houston, TX > Memphis, TN | **Jan 14** (red text, past due!) | Jan 15 | [Flatbed icon] | "Pending" (gray badge) | -- | -- | -- | [assign][...] -- this row has LIGHT RED background (unassigned, past pickup!)
- [x] LD-2025-0851 | ORD-0416 | JB Hunt | Denver, CO > Salt Lake City, UT | Jan 15 | Jan 16 | [Van icon] | "At Pickup" (amber badge with map-pin icon) | $1,650 | 15.8% (green) | Denver, CO (30m ago) | [eye][...] -- this row is SELECTED (checkbox filled, subtle blue highlight)
- [ ] LD-2025-0852 | ORD-0417 | Schneider | Seattle, WA > Portland, OR | Jan 16 | Jan 16 | [Reefer icon] | "Accepted" (blue badge with thumbs-up) | $980 | 12.4% (yellow) | -- | [dispatch][...] -- quick dispatch truck icon shown
- [ ] LD-2025-0853 | ORD-0418 | Old Dominion | New York, NY > Boston, MA | Jan 15 | Jan 15 | [Van icon] | "In Transit" (sky blue badge) | $1,200 | 8.5% (yellow) | Hartford, CT (5h ago, orange text!) | [eye][...] -- "5h ago" in orange = needs attention
- [ ] LD-2025-0854 | ORD-0419 | **Unassigned** (bold red text) | Phoenix, AZ > Las Vegas, NV | Jan 17 | Jan 17 | [Flatbed icon] | "Planning" (slate badge) | -- | -- | -- | [assign][...] -- light yellow background (unassigned this week)

At the bottom: pagination "< 1 2 3 ... 42 >" with "Showing 1-25 of 1,047 loads" text. Page size selector "25 v".

Because one row is selected (checkbox checked), show a floating bulk action bar at the very bottom: dark slate-800 background, white text "1 load selected", buttons: "Assign Carrier", "Update Status", "Export", and an X to dismiss.

Design Specifications:
- Font: Inter, 14px base size for table body, 12px for stat card subtitles
- Table rows: 44px height, hover state gray-50, selected state blue-50
- Urgency row backgrounds: red-50 for past-due unassigned, orange-50 for today unassigned, yellow-50 for this week unassigned
- "Unassigned" text: font-bold, text-red-600
- Status badges: pill-shaped (rounded-full), text-xs, with Lucide icon 12px before label
- Equipment icons: 16px, color matches equipment type color system
- Stat cards: white bg, rounded-lg, border slate-200, p-4, 160px min-width
- Filter preset chips: rounded-full, px-3, py-1, active = bg-blue-600 text-white, inactive = bg-gray-100 text-gray-600
- Pagination: text-sm, active page = blue-600 background
- Bulk action bar: fixed bottom, w-full, bg-slate-800, text-white, p-3, rounded-t-lg shadow-lg
- Modern SaaS aesthetic similar to Linear.app
```

---

## 15. Enhancement Opportunities

### Current State (Wave 2)

**What's built and working:**
- [ ] Nothing -- 0 screens built. All API endpoints exist.

**What needs polish / bug fixes:**
- [ ] N/A (not yet built)

**What to add this wave:**
- [ ] Full paginated data table with all columns
- [ ] 5 KPI stat cards with live counts
- [ ] Filter bar with status, date range, carrier, equipment, search
- [ ] System filter presets (My Loads, Urgent, Unassigned, Needs Attention)
- [ ] URL-synced filter state
- [ ] Status badges per load status color system
- [ ] Urgency row highlighting (red/orange/yellow)
- [ ] Inline "Unassigned" click to open carrier assignment modal
- [ ] Row actions menu with status-appropriate actions
- [ ] Bulk selection with bulk action bar
- [ ] WebSocket real-time updates for status changes and new loads
- [ ] Export to CSV

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Data table with sorting and pagination | High | Medium | P0 |
| Status badges with color system | High | Low | P0 |
| Filter bar (status, date, carrier, equipment, search) | High | Medium | P0 |
| KPI stat cards | High | Medium | P0 |
| Urgency row highlighting | High | Low | P0 |
| Inline carrier assignment modal | High | Medium | P0 |
| WebSocket real-time updates | High | Medium | P0 |
| URL-synced filters | Medium | Low | P0 |
| System filter presets | Medium | Low | P1 |
| Bulk selection and bulk actions | Medium | Medium | P1 |
| Quick Dispatch button | Medium | Low | P1 |
| "Needs Attention" check-call filter | Medium | Low | P1 |
| Export to CSV | Medium | Low | P1 |
| View toggle (Table/Cards/Map) | Medium | High | P2 |
| Split view (table + map) | Medium | High | P2 |
| Column reordering | Low | Medium | P2 |
| Inline status change dropdown | Low | Medium | P2 |
| Right-click context menu | Low | Medium | P3 |
| User-created saved filter presets | Low | Medium | P2 |
| Export rate confirmations (bulk PDF) | Low | Medium | P3 |

### Future Wave Preview

- **Wave 3:** Carrier scorecard mini-preview on hover over carrier name. AI-powered "recommended carrier" suggestion for unassigned loads. Predictive ETA column using ML model trained on lane/carrier/weather data. Integration with external load boards (DAT, Truckstop) for posting unassigned loads.
- **Wave 4:** Customer portal view of their loads (simplified columns, no financial data). Automated dispatch rules engine (auto-assign preferred carrier at contracted rate). Load consolidation suggestions (combine LTL shipments on same lane).

---

<!--
TEMPLATE USAGE NOTES:
1. This screen design covers the Loads List, the primary dispatcher workspace for load management.
2. All 12 load statuses from status-color-system.md are mapped with correct colors and icons.
3. Role-based column visibility follows 06-role-based-views.md (financial data hidden per role).
4. Real-time features follow 07-real-time-feature-map.md (Enhanced Real-Time level with WebSocket + 30s polling fallback).
5. User journey references Maria's daily workflow from 05-user-journeys.md.
6. The urgency row highlighting system is unique to this screen and critical for dispatcher workflow.
7. The Stitch prompt shows the most information-dense version of the screen (all columns, mixed statuses, urgency highlighting).
-->
