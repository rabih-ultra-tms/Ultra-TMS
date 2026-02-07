# Order Detail

> Service: TMS Core (Service 04) | Wave: 2 | Priority: P0
> Route: /(dashboard)/orders/[id] | Status: Not Started
> Primary Personas: Maria Rodriguez (Dispatcher), Sarah Chen (Operations Manager)
> Roles with Access: dispatcher, ops_manager, admin, finance (read-only), support (read-only)
> Screen Type: Detail (Tabbed)

---

## 1. Purpose & Business Context

**What this screen does:**
The Order Detail screen is the comprehensive view of a single customer order. It displays all order data organized across six tabs -- Overview, Stops, Loads, Documents, Timeline, and Notes -- providing dispatchers and managers with everything they need to manage an order from creation through completion. This screen is the hub from which users create loads, track fulfillment, review financials, and handle customer inquiries about a specific shipment.

**Business problem it solves:**
When a customer calls asking about their shipment, a dispatcher needs instant access to the complete order picture: what was ordered, where it is going, which loads are carrying it, what the current status is, and what documents are attached. Without a unified detail view, dispatchers piece together this information from 4-5 separate screens, wasting 3-5 minutes per inquiry. The Order Detail screen puts everything one click away, reducing customer inquiry response time from 5 minutes to 15 seconds. Sarah uses it during escalations when she needs the full story of an order, and finance users reference it when reconciling invoices.

**Key business rules:**
- The order status badge is clickable and shows valid forward transitions only. Backward transitions require `ops_manager` or higher role.
- The "Create Load" action is only available when the order is in CONFIRMED or PLANNING status.
- Financial data (customer rate, margin, billing details) is hidden from users without `finance_view` permission.
- The order cannot be edited once it reaches DELIVERED or later status (read-only mode with edit button disabled).
- Orders with associated loads that are IN_TRANSIT or later cannot be cancelled.
- All changes to the order are logged in the Timeline tab (audit trail).
- The Loads tab shows a summary of all loads associated with the order. If load count is 0 and order is CONFIRMED+, an amber banner prompts "No loads created yet."

**Success metric:**
Customer inquiry response time drops from 5 minutes to 15 seconds. Dispatcher time-to-create-load from order context drops from 3 minutes (navigating between screens) to 30 seconds (one click from Order Detail).

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Orders List | Click order row or order number link | `orderId` via route param |
| Order Entry | After "Create & Confirm" or "Create as Draft" | `orderId` via route param |
| Load Detail | Click linked order number | `orderId` via route param |
| Dispatch Board | Click load card > View Order link | `orderId` via route param |
| Operations Dashboard | Click order in activity feed | `orderId` via route param |
| Customer Detail | Click order in customer's orders tab | `orderId` via route param |
| Search / Command Palette | Search by order number | `orderId` via route param |
| Notification Center | Click order-related notification | `orderId`, optional `tab` param |
| Direct URL | Bookmark / shared link | `orderId`, optional `?tab=stops` |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Orders List | Click "Back to Orders" breadcrumb or browser back | Preserves list filter state |
| Order Entry (Edit) | Click "Edit Order" button | `orderId` |
| Load Builder | Click "Create Load" button | `orderId` pre-filled |
| Load Detail | Click a load row in the Loads tab | `loadId` |
| Customer Detail | Click customer name link | `customerId` |
| Tracking Map | Click "Track" on a load in the Loads tab | `loadId` |
| Document Viewer | Click document in Documents tab | `documentId` |
| Communication Hub | Click "Email Customer" or "Call Carrier" actions | Pre-filled contact context |

**Primary trigger:**
Maria clicks an order row in the Orders List, or navigates here after creating a new order. She uses this screen to review order details before creating a load, to check on order status during customer calls, and to verify that all loads for an order have been completed. Sarah navigates here during escalations to get the full picture.

**Success criteria (user completes the screen when):**
- Dispatcher has reviewed the order and created a load from it (or confirmed loads are in progress).
- Dispatcher has answered a customer inquiry using the information visible on this screen.
- Operations manager has verified order fulfillment status and identified any issues.
- Finance user has confirmed order details and rate information for invoicing.

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------+
|  Breadcrumb: Operations > Orders > ORD-20260115-0042              |
+------------------------------------------------------------------+
|  Order Header                                                      |
|  +--------------------------------------------------------------+ |
|  | ORD-20260115-0042      [Status: IN_TRANSIT ▼] [Priority: MED]| |
|  | Customer: Acme Manufacturing Co.  |  PO#: AC-99102           | |
|  | Sales Rep: Maria Rodriguez  |  Created: Jan 14, 2025 3:22 PM | |
|  |                                                                | |
|  | Actions: [Edit Order] [Create Load] [Clone] [Email] [...More]  | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  +-------------------------------+  +---------------------------+  |
|  |  TABS (70% width)             |  |  RIGHT SIDEBAR (30%)     |  |
|  |  [Overview|Stops|Loads|Docs|  |  |                           |  |
|  |   Timeline|Notes]             |  |  Order Summary Card       |  |
|  |                               |  |  ┌───────────────────┐   |  |
|  |  === OVERVIEW TAB ===         |  |  │ Route             │   |  |
|  |  Shipment Details Card        |  |  │ Chicago, IL       │   |  |
|  |  ┌─────────────────────────┐  |  |  │    ↓ 920 mi       │   |  |
|  |  │ Equipment: Dry Van      │  |  |  │ Dallas, TX        │   |  |
|  |  │ Commodity: Electronics  │  |  |  ├───────────────────┤   |  |
|  |  │ Weight: 42,000 lbs      │  |  |  │ Financial         │   |  |
|  |  │ Pieces: 24  Pallets: 12 │  |  |  │ Rate: $2,450.00   │   |  |
|  |  │ Hazmat: No              │  |  |  │ Carrier: $1,850   │   |  |
|  |  │ Temp: N/A               │  |  |  │ Margin: $600 (24%)│   |  |
|  |  └─────────────────────────┘  |  |  │ [green bar]       │   |  |
|  |                               |  |  ├───────────────────┤   |  |
|  |  Route Preview Card           |  |  │ Dates             │   |  |
|  |  ┌─────────────────────────┐  |  |  │ PU: Jan 15 8:00AM │   |  |
|  |  │ [MAP PREVIEW]           │  |  |  │ DEL: Jan 17 2:00PM│   |  |
|  |  │ Chicago,IL -> Dallas,TX │  |  |  ├───────────────────┤   |  |
|  |  │ 920 miles | ~14 hours   │  |  |  │ Loads: 1 of 1     │   |  |
|  |  └─────────────────────────┘  |  |  │ LOAD-0847 In Tran │   |  |
|  |                               |  |  │ [View Load]        │   |  |
|  |  References Card              |  |  └───────────────────┘   |  |
|  |  ┌─────────────────────────┐  |  |                           |  |
|  |  │ PO#: AC-99102           │  |  |  Activity Feed            |  |
|  |  │ BOL#: BOL-2025-4421    │  |  |  ┌───────────────────┐   |  |
|  |  │ Ref: CUST-REF-001      │  |  |  │ 9:42 AM Maria     │   |  |
|  |  └─────────────────────────┘  |  |  │  status → IN_TRAN │   |  |
|  |                               |  |  │ 8:22 AM System    │   |  |
|  |  Special Instructions Card    |  |  │  Pickup confirmed  │   |  |
|  |  ┌─────────────────────────┐  |  |  │ Jan 14 Maria      │   |  |
|  |  │ "Call 30 min before     │  |  |  │  Load created      │   |  |
|  |  │  arrival at pickup.     │  |  |  │ [View Full Log]    │   |  |
|  |  │  Dock #14 required."    │  |  |  └───────────────────┘   |  |
|  |  └─────────────────────────┘  |  |                           |  |
|  +-------------------------------+  +---------------------------+  |
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible, above the fold) | Order header (order#, status badge, customer, PO#, action buttons), tab navigation | User must instantly identify the order and have access to primary actions |
| **Secondary** (visible on Overview tab) | Shipment details (equipment, commodity, weight), route preview with map, reference numbers, special instructions | Core order data needed for load building and customer communication |
| **Tertiary** (in sidebar, always visible) | Order summary card (route visual, financial summary, dates, load status), recent activity feed | Quick-reference data that supports decision-making without switching tabs |
| **Hidden** (behind tab clicks) | Stops detail (tab 2), Loads list (tab 3), Documents (tab 4), Full Timeline (tab 5), Notes (tab 6) | Detailed data organized by domain; accessed when user needs specific information |

---

## 4. Data Fields & Display

### Order Header Fields

| # | Field Label | Source (Entity.field) | Format / Display | Location |
|---|---|---|---|---|
| 1 | Order Number | Order.orderNumber | `ORD-YYYYMMDD-XXXX`, monospace, 20px bold | Header, top-left |
| 2 | Status Badge | Order.status | StatusBadge, clickable with transition dropdown | Header, next to order # |
| 3 | Priority | Order.priority | Badge: URGENT (red flame), HIGH (amber arrow-up), MEDIUM (gray dash), LOW (slate arrow-down) | Header, after status |
| 4 | Customer Name | Order.customer.name | Blue-600 link to Customer Detail | Header, second row |
| 5 | PO Number | Order.poNumber | Monospace text, gray-600 | Header, second row |
| 6 | Sales Rep | Order.salesRep.name | Plain text | Header, third row |
| 7 | Created Date | Order.createdAt | "Jan 14, 2025 3:22 PM" | Header, third row |

### Overview Tab Fields

| # | Field Label | Source | Format / Display | Section |
|---|---|---|---|---|
| 8 | Equipment Type | Order.equipmentType | Badge with icon (Container for Dry Van, Snowflake for Reefer, etc.) | Shipment Details card |
| 9 | Commodity | Order.commodity | Plain text | Shipment Details card |
| 10 | Weight | Order.weight | "42,000 lbs" with comma formatting | Shipment Details card |
| 11 | Pieces | Order.pieces | Integer | Shipment Details card |
| 12 | Pallets | Order.pallets | Integer | Shipment Details card |
| 13 | Hazmat | Order.isHazmat | "Yes" (red warning badge) or "No" (gray) | Shipment Details card |
| 14 | Temperature | Order.tempMin / Order.tempMax | "34°F - 38°F" (only if Reefer) | Shipment Details card |
| 15 | Dimensions | Order.dimensions | "L x W x H (in)" or "N/A" | Shipment Details card |
| 16 | Special Handling | Order.specialHandling | Checkbox labels: Liftgate, Inside Delivery, etc. | Shipment Details card |
| 17 | Route Map | Stops[].address | Embedded Google Map with route polyline and stop markers | Route Preview card |
| 18 | Total Distance | Calculated | "920 miles" | Route Preview card |
| 19 | Estimated Transit | Calculated | "~14 hours" | Route Preview card |
| 20 | PO Number | Order.poNumber | Monospace text | References card |
| 21 | BOL Number | Order.bolNumber | Monospace text | References card |
| 22 | Customer Reference | Order.customerReferenceNumber | Monospace text | References card |
| 23 | Special Instructions | Order.specialInstructions | Multi-line text, yellow-50 background | Special Instructions card |

### Sidebar Summary Fields

| # | Field Label | Source | Format / Display | Section |
|---|---|---|---|---|
| 24 | Origin | Order.stops[0] | City, ST with marker icon | Route section |
| 25 | Destination | Order.stops[last] | City, ST with marker icon | Route section |
| 26 | Distance | Calculated | "920 mi" | Route section |
| 27 | Customer Rate | Order.customerRate | "$2,450.00" **Hidden without `finance_view`** | Financial section |
| 28 | Carrier Rate | Order.estimatedCarrierRate | "$1,850.00" **Hidden without `finance_view`** | Financial section |
| 29 | Margin | Calculated | "$600 (24%)" with color bar. Green >=15%, yellow 5-15%, red <5%. **Hidden without `finance_view`** | Financial section |
| 30 | Pickup Date | Order.pickupDate | "Jan 15, 8:00 AM" | Dates section |
| 31 | Delivery Date | Order.deliveryDate | "Jan 17, 2:00 PM" | Dates section |
| 32 | Load Count | Order.loads.length | "1 of 1" or "2 of 3" with progress indicator | Loads section |
| 33 | Load Summary | Order.loads[] | Load# with status badge, clickable | Loads section |

### Stops Tab Fields

| # | Field | Format |
|---|---|---|
| 34 | Stop Sequence | Visual numbered list with connecting line |
| 35 | Stop Type | PICKUP (blue) / DELIVERY (green) / STOP (gray) badge |
| 36 | Facility Name | Bold text, clickable if in facility database |
| 37 | Address | Full address, one line |
| 38 | Appointment | "Jan 15, 8:00 AM - 10:00 AM" |
| 39 | Contact | Name + phone (clickable) |
| 40 | Instructions | Special instructions per stop |
| 41 | Status | Stop status badge (PENDING, ARRIVED, DEPARTED, etc.) |

### Loads Tab Fields

| # | Field | Format |
|---|---|---|
| 42 | Load Number | Monospace, blue-600 link to Load Detail |
| 43 | Load Status | StatusBadge |
| 44 | Carrier | Carrier name or "Unassigned" in red |
| 45 | Driver | Driver name or "--" |
| 46 | Pickup Date | Date |
| 47 | Delivery Date | Date |
| 48 | Equipment | Badge |
| 49 | Carrier Rate | Currency **Hidden without `finance_view`** |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Margin ($) | customerRate - estimatedCarrierRate | "$600", color-coded |
| 2 | Margin (%) | (customerRate - estimatedCarrierRate) / customerRate * 100 | "24.5%", color-coded |
| 3 | Fulfillment Progress | loads where status = COMPLETED / total loads | "1 of 3 loads completed" with progress bar |
| 4 | Days Until Pickup | pickupDate - now() | "In 2 days" or "Today" or "1 day overdue" in red |
| 5 | Order Age | now() - createdAt | "3 days old" |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] Order header with order number, status badge, customer, PO#, and action buttons
- [ ] Clickable status badge with dropdown showing valid forward transitions
- [ ] Six tabs: Overview, Stops, Loads, Documents, Timeline, Notes
- [ ] Overview tab with shipment details, route map preview, references, and special instructions
- [ ] Stops tab with visual stop sequence (pickup -> delivery) with status badges per stop
- [ ] Loads tab with table of associated loads (load#, status, carrier, dates)
- [ ] Documents tab with grid of uploaded documents (BOL, POD, Rate Con, etc.)
- [ ] Timeline tab with chronological event feed (status changes, check calls, notes)
- [ ] Notes tab with add/view notes functionality (internal notes not visible to customer)
- [ ] Right sidebar with order summary card (route, financials, dates, load status)
- [ ] Right sidebar with recent activity feed (last 5 events)
- [ ] "Edit Order" button (conditional on status)
- [ ] "Create Load" button (conditional on status)
- [ ] "Clone Order" button
- [ ] Breadcrumb navigation
- [ ] Role-based visibility for financial fields

### Advanced Features (Logistics Expert Recommendations)

- [ ] **Exception banner** -- If order has active exceptions (late, detention, missing docs), show a colored banner below the header with description and quick-action buttons.
- [ ] **Route map with stop markers** -- Interactive Google Map showing all stops with colored markers and route polyline. Clickable markers show stop details.
- [ ] **Load creation shortcut** -- "Create Load" button pre-fills the Load Builder with order data (customer, stops, equipment, dates).
- [ ] **Split shipment support** -- Button to "Split into Multiple Loads" that opens a modal for dividing order cargo across multiple loads.
- [ ] **Customer communication log** -- Sidebar section showing recent emails/calls related to this order.
- [ ] **Print order summary** -- Generate a formatted PDF of the order for faxing or emailing.
- [ ] **Order comparison** -- "Compare" action to view this order side-by-side with a similar historical order.
- [ ] **Auto-status progression** -- Status automatically advances when underlying loads change (e.g., when first load picks up, order moves to IN_TRANSIT).
- [ ] **Quick-edit inline** -- Double-click fields in Overview tab to edit inline without navigating to the edit form (for fields editable in current status).
- [ ] **Tab badges** -- Show count badges on tabs: Loads (2), Documents (4), Notes (3).

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| Edit Order | dispatcher, ops_manager, admin | `order_edit` | "Edit Order" button hidden |
| Create Load from order | dispatcher, ops_manager, admin | `load_create` | "Create Load" button hidden |
| Cancel Order | ops_manager, admin | `order_cancel` | "Cancel" action hidden in More menu |
| View financial sidebar section | ops_manager, admin, finance | `finance_view` | Financial section hidden from sidebar |
| Add notes | dispatcher, ops_manager, admin | `order_notes` | Notes tab is read-only |
| Delete documents | admin | `document_delete` | Delete button hidden on documents |
| Change status backward | ops_manager, admin | `order_status_revert` | Only forward transitions shown in status dropdown |

---

## 6. Status & State Machine

### Order Status Transitions (Displayed in Header)

```
[PENDING] ---(Confirm)---> [CONFIRMED] ---(Load Created)---> [PLANNING]
                                                                  |
                                                    (First Pickup) |
                                                                  v
[COMPLETED] <---(All Docs)--- [DELIVERED] <---(All Delivered)--- [IN_TRANSIT]
      |                            |
      v                            v
  [BILLING]                   (Invoice Created)

Any active ---(Hold)---> [ON_HOLD] ---(Resume)---> Previous status
Any pre-delivery ---(Cancel)---> [CANCELLED] (requires reason)
```

### Actions Available Per Status

| Status | Primary Action | Available Actions | Restricted |
|---|---|---|---|
| PENDING | "Confirm Order" (blue) | Edit, Confirm, Cancel, Hold, Clone | Create Load |
| CONFIRMED | "Create Load" (blue) | Edit, Create Load, Cancel, Hold, Clone | -- |
| PLANNING | "View Loads" (blue) | Edit (limited), Create Load, Cancel, Hold, Clone | -- |
| IN_TRANSIT | "Track Shipment" (blue) | Clone, View Loads, View on Map | Edit (read-only), Cancel |
| DELIVERED | "Complete Order" (green) | Clone, Complete, View Documents | Edit, Cancel, Create Load |
| COMPLETED | -- | Clone, View Invoice | All mutations |
| ON_HOLD | "Resume Order" (amber) | Resume, Cancel, Clone | Edit, Create Load |
| CANCELLED | -- | Clone, View (read-only) | All mutations |
| BILLING | -- | Clone, View | All mutations |

### Status Badge Colors

| Status | Background | Text | Tailwind |
|---|---|---|---|
| PENDING | `gray-100` | `gray-700` | `bg-gray-100 text-gray-700` |
| CONFIRMED | `blue-100` | `blue-800` | `bg-blue-100 text-blue-800` |
| PLANNING | `indigo-100` | `indigo-800` | `bg-indigo-100 text-indigo-800` |
| IN_TRANSIT | `sky-100` | `sky-800` | `bg-sky-100 text-sky-800` |
| DELIVERED | `lime-100` | `lime-800` | `bg-lime-100 text-lime-800` |
| COMPLETED | `emerald-100` | `emerald-800` | `bg-emerald-100 text-emerald-800` |
| CANCELLED | `red-100` | `red-800` | `bg-red-100 text-red-800` |
| ON_HOLD | `amber-100` | `amber-800` | `bg-amber-100 text-amber-800` |
| BILLING | `purple-100` | `purple-800` | `bg-purple-100 text-purple-800` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Header)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| Edit Order | `Edit` | Secondary / Outline | Navigate to `/orders/:id/edit` | No |
| Create Load | `Truck` | Primary / Blue | Navigate to `/loads/new?fromOrder=:id` | No |
| Clone Order | `Copy` | Secondary / Outline | Navigate to `/orders/new?cloneFrom=:id` | No |
| Email Customer | `Mail` | Ghost / Icon only | Opens email compose with customer pre-filled | No |

### More Actions (Dropdown)

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| Print Order | `Printer` | Generates PDF and opens print dialog | Always |
| Put on Hold | `PauseCircle` | Opens hold reason modal; status -> ON_HOLD | Active status, `order_edit` |
| Resume | `Play` | Status -> previous status | ON_HOLD status, `order_edit` |
| Cancel Order | `XCircle` | Opens cancel confirmation with reason field | Pre-delivery, `order_cancel` |
| View Audit Trail | `History` | Opens timeline tab filtered to status changes | Always |
| Share Link | `Link` | Copies deep link to clipboard | Always |

### Tab Interactions

| Tab | Content | Actions Within Tab |
|---|---|---|
| Overview | Shipment details, route map, references, special instructions | Inline edit (double-click fields), map zoom/pan |
| Stops | Visual stop sequence with status per stop | Click stop to expand details, "Add Stop" button (if editable) |
| Loads | Table of associated loads | Click row -> Load Detail, "Create Load" button, "Track" button per load |
| Documents | Grid of documents with type badges | Upload document (drag & drop), download, delete, preview |
| Timeline | Chronological event feed | Filter by event type, "Jump To" milestone, print |
| Notes | List of internal notes | Add new note (text input + submit), pin note, delete note |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `E` | Edit order (if editable) |
| `L` | Create load (if available) |
| `1-6` | Switch to tab 1-6 |
| `Ctrl/Cmd + P` | Print order summary |
| `Ctrl/Cmd + K` | Global search |
| `Escape` | Close dropdown/modal |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| Document file (from desktop) | Documents tab drop zone | Uploads document and categorizes by file type |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Namespace | Payload | UI Update |
|---|---|---|---|
| `order:status:changed` | `/dispatch` | `{ orderId, previousStatus, newStatus, changedBy }` | Update header status badge with animation. Add entry to sidebar activity feed. If on Timeline tab, prepend event card. |
| `order:updated` | `/dispatch` | `{ orderId, changedFields }` | Update affected fields across all tabs. Brief highlight on changed values. |
| `load:status:changed` | `/dispatch` | `{ loadId, orderId, previousStatus, newStatus }` | Update load row in Loads tab. Update sidebar load summary. If all loads delivered, flash "Complete Order" prompt. |
| `load:created` | `/dispatch` | `{ loadId, orderId, status }` | Add new row to Loads tab. Update sidebar load count. Add to activity feed. |
| `document:uploaded` | `/documents` | `{ documentId, orderId, type, fileName }` | Add document card to Documents tab. Increment tab badge count. |
| `checkcall:received` | `/tracking` | `{ loadId, orderId }` | Add entry to sidebar activity feed. Update Loads tab row timestamp. |
| `note:added` | `/dispatch` | `{ noteId, orderId, content, author }` | Prepend note to Notes tab. Increment tab badge. |

### Live Update Behavior

- **Update frequency:** WebSocket push for all order-specific and related load events.
- **Visual indicator:** Changed fields briefly pulse with blue-50 background (2s fade). New sidebar activity entries slide in from top. Status badge change animates with a scale-up/scale-down effect.
- **Conflict handling:** If user is editing a field that gets updated remotely, show warning: "This order was updated by [name]. Your changes may conflict. Refresh to see latest data."

### Polling Fallback

- **When:** WebSocket disconnects.
- **Interval:** Every 30 seconds.
- **Endpoint:** `GET /api/v1/orders/:id?updatedSince={lastTimestamp}`
- **Visual indicator:** Amber dot with "Updates may be delayed" in header area.

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Status transition | Badge immediately updates. Activity feed shows "Updating..." entry. | Badge reverts. Toast: "Failed to update status: [reason]." |
| Add note | Note immediately appears at top of Notes tab with "Saving..." indicator. | Note removed. Toast: "Failed to save note." |
| Upload document | Document card appears with progress bar. | Card removed. Toast: "Upload failed." |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| `PageHeader` | `src/components/layout/page-header.tsx` | `title: orderNumber`, `breadcrumbs`, `actions` |
| `StatusBadge` | `src/components/ui/status-badge.tsx` | `entity: ORDER_STATUS`, `status`, `clickable: true` |
| `Tabs` | `src/components/ui/tabs.tsx` | 6 tabs with lazy-loaded content |
| `Badge` | `src/components/ui/badge.tsx` | Equipment, priority, stop type badges |
| `Card` | `src/components/ui/card.tsx` | All content cards on Overview tab and sidebar |
| `DataTable` | `src/components/ui/data-table.tsx` | Loads tab, Documents tab tables |
| `Timeline` | `src/components/ui/timeline.tsx` | Timeline tab event feed |
| `Tooltip` | `src/components/ui/tooltip.tsx` | Field descriptions, truncated text |
| `DropdownMenu` | `src/components/ui/dropdown-menu.tsx` | More actions menu, status transition dropdown |
| `Avatar` | `src/components/ui/avatar.tsx` | User avatars in activity feed and notes |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| `StatusBadge` | Display-only badge | Add clickable variant with dropdown showing valid transitions. Animate on change. |
| `Tabs` | Basic tab switching | Add badge counts on tab labels (e.g., "Documents (4)"). Add lazy loading for tab content. |
| `Timeline` | Basic vertical timeline | Add support for different event types with distinct icons and layouts. Add inline note addition. |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| `OrderHeader` | Full-width header with order number, status badge dropdown, customer, PO#, and action buttons. Responsive: stacks on mobile. | Medium |
| `OrderSummaryCard` | Sidebar card with route visualization (vertical dots + lines), financial section (rate/margin), dates section, and loads section. | Medium |
| `StopSequenceViewer` | Visual vertical sequence of stops with colored markers, connecting lines, status badges, appointment times, and expandable details per stop. | Medium |
| `RouteMapPreview` | Embedded Google Map showing order route with stop markers and polyline. Supports zoom and click-to-expand. | Medium |
| `DocumentGrid` | Grid layout of document cards. Each card shows: file type icon, name, type badge (BOL, POD, Rate Con), upload date, uploader, download/preview/delete actions. Supports drag-drop upload. | Medium |
| `ActivityFeedCompact` | Compact version of activity feed for sidebar. Shows last 5 events with timestamp, actor, and action. "View Full Log" link. | Small |
| `ExceptionBanner` | Colored banner below header showing active exceptions. Red for critical, amber for warnings. Contains description and action button. | Small |
| `MarginIndicator` | Color-coded margin display showing dollar amount and percentage with a visual progress bar. Green >=15%, yellow 5-15%, red <5%. | Small |
| `NoteEntry` | Note card with author avatar, timestamp, content, pin/delete actions. "Add Note" form with textarea and submit button. | Small |
| `InlineEditField` | Double-click-to-edit field component. Shows display value; on double-click, switches to input; Enter to save, Escape to cancel. | Medium |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Tabs | `tabs` | 6-tab content organization |
| Sheet | `sheet` | Mobile sidebar content |
| Alert | `alert` | Exception banner |
| Separator | `separator` | Dividers between sidebar sections |
| Collapsible | `collapsible` | Stop detail expansion |
| Avatar | `avatar` | User avatars in notes and activity |
| Textarea | `textarea` | Notes entry |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook | Cache Time |
|---|---|---|---|---|---|
| 1 | GET | `/api/v1/orders/:id` | Fetch full order with relationships (customer, stops, loads) | `useOrder(orderId)` | 60s |
| 2 | GET | `/api/v1/orders/:id/loads` | Fetch all loads for this order | `useOrderLoads(orderId)` | 30s |
| 3 | GET | `/api/v1/orders/:id/documents` | Fetch all documents for this order | `useOrderDocuments(orderId)` | 60s |
| 4 | GET | `/api/v1/orders/:id/timeline` | Fetch activity timeline | `useOrderTimeline(orderId)` | 30s |
| 5 | GET | `/api/v1/orders/:id/notes` | Fetch internal notes | `useOrderNotes(orderId)` | 30s |
| 6 | PATCH | `/api/v1/orders/:id/status` | Update order status | `useUpdateOrderStatus()` | -- |
| 7 | POST | `/api/v1/orders/:id/notes` | Add a note to the order | `useAddOrderNote()` | -- |
| 8 | PATCH | `/api/v1/orders/:id` | Inline edit fields | `useUpdateOrder()` | -- |
| 9 | GET | `/api/v1/orders/:id/audit` | Fetch audit trail | `useOrderAudit(orderId)` | 60s |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| `orders:{orderId}` | `order:updated` | `useOrderDetailStream(orderId)` -- updates local order cache |
| `orders:{orderId}` | `order:status:changed` | `useOrderDetailStream(orderId)` -- updates status badge |
| `orders:{orderId}` | `load:created` | `useOrderDetailStream(orderId)` -- updates loads tab |
| `orders:{orderId}` | `load:status:changed` | `useOrderDetailStream(orderId)` -- updates load row |
| `orders:{orderId}` | `document:uploaded` | `useOrderDetailStream(orderId)` -- adds to documents tab |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 500 |
|---|---|---|---|---|---|
| GET /api/v1/orders/:id | N/A | Redirect to login | "Access Denied" page | "Order not found" page with link to Orders List | Error state with retry |
| PATCH /api/v1/orders/:id/status | Toast: "Invalid status transition" | Redirect to login | Toast: "Permission denied" | Toast: "Order not found" | Toast: "Server error" |
| POST /api/v1/orders/:id/notes | Toast: "Note cannot be empty" | Redirect to login | Toast: "Permission denied" | Toast: "Order not found" | Toast: "Failed to save note" |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Show header skeleton (order# bar, status badge placeholder, customer text bar). Show tab bar with 6 tab labels. Show content area with 3 skeleton cards for Overview tab. Show sidebar with skeleton summary card.
- **Progressive loading:** Header and Overview tab load first. Other tabs load on demand (when clicked). Sidebar summary loads in parallel with Overview.
- **Tab lazy loading:** Each tab content loads only when the tab is activated. Subsequent visits are cached.

### Empty States

**New order (just created, minimal data):**
- Overview shows populated fields; empty fields show "Not set" in gray italic.
- Stops tab: "Add your first stop to define the pickup and delivery route."
- Loads tab: "No loads created yet. Create a load to start fulfillment." with "Create Load" CTA.
- Documents tab: "No documents uploaded yet. Drag & drop files here to upload."
- Timeline tab: Shows "Order Created" as the single event.
- Notes tab: "No notes yet. Add a note to communicate with your team."

### Error States

**Full page error (order API fails):**
- Show error illustration + "Unable to load order details" + Retry button.

**Tab content error (specific tab fails):**
- Show error within tab content area: "Unable to load [tab name]. Try again." with retry link. Other tabs remain functional.

### Permission Denied

- **Full page denied:** "You don't have permission to view this order" with back link.
- **Partial denied:** Financial sidebar section hidden. Edit/action buttons hidden per role matrix.

### Offline / Degraded

- **Full offline:** "You're offline. Showing cached data." All edit/action buttons disabled.
- **WebSocket down:** Amber indicator. Data may be stale. Manual refresh available.

---

## 12. Filters, Search & Sort

### Filters

The Order Detail screen does not have traditional filters. However, within specific tabs:

| Tab | Filter Options |
|---|---|
| Loads | Status filter (All, Active, Completed) |
| Documents | Type filter (All, BOL, POD, Rate Confirmation, Invoice, Other) |
| Timeline | Event type filter (All, Status Changes, Check Calls, Documents, Notes) |
| Notes | No filter (all notes shown) |

### Search Behavior

No search on this screen. Global search (`Ctrl/Cmd + K`) is available.

### Sort Options

| Tab | Sort Options |
|---|---|
| Loads | By load number, by status, by pickup date (default: pickup date ascending) |
| Documents | By upload date (default: newest first), by type |
| Timeline | Chronological (default: newest first), oldest first toggle |
| Notes | By date (default: newest first) |

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Right sidebar collapses below the tab content area (stacks vertically).
- Order header: Action buttons collapse into a single "Actions" dropdown.
- Tab names abbreviate: "Overvw", "Stops", "Loads", "Docs", "Time", "Notes".
- Route map preview: Full-width within content area.
- Documents grid: 2 columns instead of 3.

### Mobile (< 768px)

- Right sidebar becomes a collapsible drawer at the bottom ("Show Summary" toggle).
- Order header: Two rows. Row 1: Order# + Status. Row 2: Customer. Actions in hamburger menu.
- Tabs: Horizontal scrollable tab bar. Only 3 labels visible; swipe for more.
- All content: Single column, full-width.
- Route map: Hidden by default. "Show Map" expandable section.
- Documents: Single column list instead of grid.
- Sticky bottom bar: Primary action button based on status (e.g., "Create Load" for CONFIRMED).

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full layout: 70% tabs + 30% sidebar. All features visible. |
| Desktop | 1024px - 1439px | Same layout, sidebar slightly narrower. |
| Tablet | 768px - 1023px | Sidebar stacks below. Actions collapse. |
| Mobile | < 768px | Single column. Bottom drawer sidebar. Sticky action bar. |

---

## 14. Stitch Prompt

```
Design an order detail screen for a modern freight/logistics TMS (Transportation Management System) called "Ultra TMS." This screen shows the complete details of a single customer order with a tabbed interface.

Layout: Full-width page with a dark slate-900 sidebar on the left (240px, collapsed). Content area with white background. At the top, breadcrumb: "Operations > Orders > ORD-20260115-0042."

Order Header: Full-width card (white, border-b, py-4 px-6) containing:
- Left side: "ORD-20260115-0042" in bold 20px monospace font, followed by a sky-blue status badge "In Transit" with Truck icon (the badge has a small chevron-down indicating it's clickable), then a gray "Medium" priority badge.
- Second row: "Customer: Acme Manufacturing Co." as a blue-600 clickable link, separator dot, "PO# AC-99102" in gray monospace.
- Third row: "Sales Rep: Maria Rodriguez" in gray-500, separator dot, "Created Jan 14, 2025 3:22 PM" in gray-400.
- Right side: "Edit Order" outline button with Edit icon, "Create Load" primary blue-600 button with Truck icon, "Clone" outline button with Copy icon, and a three-dot "More" dropdown button.

Below the header, the content area splits into two columns (70%/30%):

Left Column - Tabs:
Show a horizontal tab bar with 6 tabs: "Overview" (active, blue-600 underline), "Stops", "Loads (1)", "Documents (3)", "Timeline", "Notes (2)" -- the counts are shown as small gray badges.

Overview Tab Content (currently active):
- "Shipment Details" card: A white rounded-lg card with fields in a 2-column grid: "Equipment Type: Dry Van" with container icon badge, "Commodity: Electronics - Consumer", "Weight: 42,000 lbs", "Pieces: 24", "Pallets: 12", "Hazmat: No", "Special Handling: Appointment Required (checked), Liftgate (unchecked)".
- "Route Preview" card: A white card showing an embedded map (show a placeholder rectangle with route line from Chicago to Dallas marked with colored pins), below the map: "Chicago, IL -> Dallas, TX | 920 miles | ~14 hours estimated transit".
- "References" card: "PO#: AC-99102", "BOL#: BOL-2025-4421", "Customer Ref: CUST-REF-001" in monospace font.
- "Special Instructions" card: Yellow-50 background with text "Call 30 minutes before arrival at pickup. Dock #14 required. No overnight parking at delivery facility."

Right Column - Sidebar:
- "Order Summary" card (sticky): White card with sections separated by gray-200 dividers:
  - Route section: Vertical line with blue circle at top "Chicago, IL" and green circle at bottom "Dallas, TX", with "920 mi" between them.
  - Financial section: "Customer Rate: $2,450.00", "Est. Carrier Rate: $1,850.00", "Margin: $600 (24.5%)" in green-600 with a small green progress bar.
  - Dates section: "Pickup: Jan 15, 8:00 AM", "Delivery: Jan 17, 2:00 PM".
  - Loads section: "1 of 1 loads" with a small progress bar, then "LOAD-20260115-0847 - In Transit" as a clickable blue link with sky status badge.

- "Recent Activity" card below: showing 4 compact activity entries:
  - "9:42 AM - Status changed to In Transit"
  - "8:22 AM - Pickup confirmed at Chicago warehouse"
  - "Jan 14, 4:10 PM - Carrier Swift Transport assigned"
  - "Jan 14, 3:22 PM - Order created by Maria R."
  - "View Full Timeline" link at bottom in blue.

Design Specifications:
- Font: Inter, 14px base, 20px order number
- Content background: gray-50 page, white cards
- Primary: blue-600 for links, active tab, primary buttons
- Cards: white, rounded-lg, border border-gray-200, shadow-sm
- Financial section: green for positive margin, red for negative
- Status badges use global TMS color system
- Tab active state: blue-600 underline (2px), blue-600 text
- Sidebar card: slightly off-white (gray-50) background
- Modern SaaS aesthetic similar to Linear.app detail pages or Notion database record views
```

---

## 15. Enhancement Opportunities

### Current State (Wave 2)

**What's built and working:**
- [ ] Nothing yet -- screen is Not Started.

**What needs to be built for MVP:**
- [ ] Order header with status badge, customer, actions
- [ ] Six-tab interface with lazy loading
- [ ] Overview tab (shipment details, route map, references, instructions)
- [ ] Stops tab (visual stop sequence)
- [ ] Loads tab (table of associated loads)
- [ ] Documents tab (document grid with upload)
- [ ] Timeline tab (event feed)
- [ ] Notes tab (add/view notes)
- [ ] Right sidebar summary card
- [ ] Role-based field visibility
- [ ] WebSocket real-time updates
- [ ] Clickable status badge with transitions

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Order header with status management | High | Medium | P0 |
| Overview tab with shipment details | High | Medium | P0 |
| Stops tab with visual sequence | High | Medium | P0 |
| Loads tab with associated loads | High | Low | P0 |
| Right sidebar summary | High | Medium | P0 |
| Documents tab with upload | Medium | Medium | P0 |
| Timeline tab | Medium | Medium | P1 |
| Notes tab | Medium | Low | P1 |
| Route map preview | Medium | Medium | P1 |
| Exception banner | High | Low | P1 |
| Inline edit fields | Medium | Medium | P2 |
| Tab badge counts | Low | Low | P2 |
| Print order summary | Low | Medium | P2 |
| Order comparison | Low | High | P2 |

### Future Wave Preview

- **Wave 3:** Customer portal integration -- customer can view a read-only version of this screen. AI-powered recommendations ("Based on this order's lane and equipment, suggested carriers are..."). Automated document validation (OCR on POD to confirm delivery).
- **Wave 4:** Integration with accounting for real-time invoice status on Order Detail. Automated SLA reporting per order. Customer satisfaction tracking linked to orders.

---

*End of Order Detail screen design. Reference `00-service-overview.md` for service-level context.*
