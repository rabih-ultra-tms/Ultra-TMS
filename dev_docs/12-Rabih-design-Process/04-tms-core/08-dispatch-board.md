# Dispatch Board

> Service: TMS Core (Service 04) | Wave: 2 | Priority: P0
> Route: /(dashboard)/dispatch | Status: Not Started
> Primary Personas: Maria Rodriguez (Dispatcher, 50+ loads/day), Sarah Chen (Operations Manager)
> Roles with Access: dispatcher, ops_manager, admin

---

## 1. Purpose & Business Context

**What this screen does:**
The Dispatch Board is the operational nerve center of Ultra TMS. It provides a real-time, multi-view workspace where dispatchers manage the full lifecycle of every active load -- from unassigned orders waiting for carriers, through tendering and dispatch, to in-transit tracking and delivery confirmation. Maria spends 80% of her 10-hour shift on this single screen. It must be the fastest, densest, and most responsive screen in the entire application.

**Business problem it solves:**
Without a centralized dispatch board, dispatchers juggle between 4-7 browser tabs (load list, carrier list, tracking map, email, phone) to manage each load. This context-switching costs 15-20 minutes per load assignment, limits throughput to 30-35 loads/day per dispatcher, and causes double-booking when two dispatchers unknowingly tender the same load. A unified board with drag-and-drop status management, real-time updates, and inline carrier assignment eliminates the tab-switching overhead and raises throughput to 50-60+ loads/day per dispatcher.

**Key business rules:**
- Only loads in `PENDING` or `PLANNING` status can be moved to `TENDERED` (requires carrier assignment first).
- A load cannot be dragged backward in the status pipeline (e.g., `DELIVERED` back to `IN_TRANSIT`) without `admin` or `ops_manager` role permission. The system must prompt for a reason code on backward transitions.
- Loads that have been in `PENDING` status for more than 24 hours are flagged as "at-risk" with an orange border and sorted to the top of the lane.
- Revenue and margin data is only visible to users with the `finance_view` permission. Without it, the margin indicator on load cards is hidden entirely.
- When a load is tendered to a carrier, the carrier has a configurable acceptance window (default: 30 minutes). If no response, the load reverts to `PENDING` with a "Tender Expired" note.
- Dispatchers can only modify loads assigned to them unless they have `load_edit_all` permission.

**Success metric:**
Average time to assign a carrier to a new load drops from 15 minutes to under 3 minutes. Daily dispatcher throughput increases from 35 loads to 55+ loads. Stale load rate (loads in PENDING > 4 hours) decreases from 18% to under 5%.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Sidebar Navigation | Clicks "Dispatch Board" in TMS Core sidebar group | None (loads default view) |
| Operations Dashboard | Clicks "Unassigned Loads" KPI card or "View Dispatch Board" link | `?status=PENDING` filter pre-applied |
| Load Detail | Clicks "Back to Board" breadcrumb or "Open in Board" action | `?highlight=loadId` to flash the specific card |
| Order Detail | Clicks "View on Board" after load creation | `?highlight=loadId` |
| Notification Center | Clicks "New Load Assigned" or "Load Status Changed" notification | `?highlight=loadId&view=kanban` |
| Direct URL | Bookmark / shared link | Route params, query filters |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Load Detail | Double-click load card, or right-click > "View Detail" | `loadId` |
| Load Builder | Clicks "+ New Load" button in toolbar | None (blank form) |
| Carrier List | Right-click card > "Find Carrier" or clicks carrier search in assignment modal | `?lane=origin-dest&equipment=type` |
| Tracking Map | Clicks "Map View" toggle, or right-click > "Track on Map" | `?loadId=id` (centers map on load) |
| Stop Management | Right-click card > "View Stops" | `loadId` |
| Check Calls | Right-click card > "Add Check Call" | `loadId`, `stopId` (current stop) |
| Communication Hub | Right-click card > "Contact Driver" or "Contact Customer" | `loadId`, `contactType`, `phone/email` |

**Primary trigger:**
Maria opens the Dispatch Board first thing in her morning routine (6:00-7:00 AM) and keeps it open as her primary workspace throughout the entire shift. She returns to it between every other task. Sarah opens it during the 8:00 AM team huddle to distribute workload and periodically throughout the day to monitor exceptions.

**Success criteria (user completes the screen when):**
- All loads in the "Unassigned" lane have been either assigned to carriers or flagged for escalation by end of shift.
- Maria has processed her daily load volume (50+ loads) through the pipeline without needing to leave the board for routine status updates.
- No load has been in the same status lane for longer than the expected dwell time without a documented reason.

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+-----------------------------------------------------------------------------------+
|  [Sidebar 240px]  |  DISPATCH BOARD CONTENT AREA                                  |
|                   +---------------------------------------------------------------+
|  TMS Core         |  Toolbar Row                                                  |
|  - Orders         |  [Kanban|Timeline|Map] [Date: Today v] [Equip v] [Carrier v]  |
|  - Loads          |  [Lane v] [Search________________] [+ New Load]  [Bulk v]     |
|  - Dispatch Board*|  [Saved Filters: My Loads | Urgent | Unassigned | At Risk]    |
|  - Tracking       +---------------------------------------------------------------+
|  - Check Calls    |  KPI Strip (optional, collapsible)                             |
|  - Appointments   |  [Unassigned:12] [Tendered:8] [Dispatched:23] [In Transit:45] |
|                   |  [At Stop:7] [Delivered:15] [Total:110] [At Risk:3]            |
|                   +---------------------------------------------------------------+
|                   | KANBAN VIEW                                                    |
|                   | +----------+ +----------+ +----------+ +----------+ +----+     |
|                   | |UNASSIGNED| | TENDERED | |DISPATCHED| |IN TRANSIT| |DEL.|     |
|                   | |  (12)    | |   (8)    | |  (23)    | |  (45)    | |(15)|     |
|                   | |----------| |----------| |----------| |----------| |----|     |
|                   | | [Card 1] | | [Card 1] | | [Card 1] | | [Card 1] | |[C1]|    |
|                   | | [Card 2] | | [Card 2] | | [Card 2] | | [Card 2] | |[C2]|    |
|                   | | [Card 3] | | [Card 3] | | [Card 3] | | [Card 3] | |[C3]|    |
|                   | | [Card 4] | |          | | [Card 4] | | [Card 4] | |    |    |
|                   | | [Card 5] | |          | |          | | [Card 5] | |    |    |
|                   | |  ...     | |          | |          | |  ...     | |    |    |
|                   | +----------+ +----------+ +----------+ +----------+ +----+     |
|                   +---------------------------------------------------------------+
|                   | Mini-Map (bottom-right corner, 200x150px, toggleable)           |
|                   +---------------------------------------------------------------+
```

### Timeline View Layout (alt)

```
+-----------------------------------------------------------------------------------+
|  [Sidebar]  |  Toolbar (same as above, Timeline toggle active)                     |
|             +---------------------------------------------------------------------+
|             |  Y-Axis Labels    |  Timeline Grid (horizontal scroll)               |
|             |  Carrier A        |  |====LOAD-0847====|                             |
|             |  Carrier B        |      |==LOAD-0848==|     |====LOAD-0852====|     |
|             |  Carrier C        |  |========LOAD-0849========|                     |
|             |  Unassigned       |  |=L-0850=|  |=L-0851=|                          |
|             |                   |  Mon    Tue    Wed    Thu    Fri    Sat    Sun    |
|             +---------------------------------------------------------------------+
```

### Map View Layout (alt)

```
+-----------------------------------------------------------------------------------+
|  [Sidebar]  |  Toolbar (same as above, Map toggle active)                          |
|             +------------------+--------------------------------------------------+
|             |  Load List Panel |  Full Map (Google Maps / Mapbox)                  |
|             |  (320px, collaps)|  [Truck markers with status colors]               |
|             |  [Search_______] |  [Route polylines for selected loads]             |
|             |  [Filter chips]  |  [Geofence circles at stops]                     |
|             |  [Load Card 1]   |  [Cluster markers when zoomed out]               |
|             |  [Load Card 2]   |                                                  |
|             |  [Load Card 3]   |  [Map controls: zoom, layers, fullscreen]        |
|             |  ...             |                                                  |
|             +------------------+--------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible on card) | Load number, origin/destination route, current status, carrier name (or UNASSIGNED in red), pickup date, priority indicators | Maria must identify and triage loads at a glance without expanding or clicking. These 6 data points let her decide what to do next in under 2 seconds per card. |
| **Secondary** (visible on card, smaller font) | Equipment type icon, margin indicator ($ and %), delivery date, customer name, last check call timestamp | Important context for assignment and prioritization decisions, but not the first thing scanned. |
| **Tertiary** (visible on card expand / hover) | Driver name, driver phone, special instructions flag, commodity, weight, distance (miles), load age (time in current status), reference numbers | Needed when Maria is actively working a specific load -- calling a driver, checking commodity details, or reviewing special instructions. |
| **Hidden** (behind right-click or double-click) | Full load detail, complete stop list, rate breakdown, document list, audit trail, communication history | Deep detail for investigation. Maria opens this 10-15 times per day for complex loads. |

---

## 4. Data Fields & Display

### Visible Fields (Load Card -- Kanban View)

| # | Field Label | Source (Entity.field) | Format / Display | Location on Card |
|---|---|---|---|---|
| 1 | Load Number | Load.loadNumber | `FM-2025-XXXX`, monospace font `font-mono`, bold, clickable link (blue-600) | Card header, top-left |
| 2 | Status | Load.status | StatusBadge component using LOAD_STATUS color map. Small (sm) size. | Lane header (implicit), not repeated on card |
| 3 | Origin | Load.stops[0].city + Load.stops[0].state | `City, ST` format, truncated at 20 chars with tooltip | Card body, line 1 left |
| 4 | Destination | Load.stops[last].city + Load.stops[last].state | `City, ST` format, truncated at 20 chars with tooltip | Card body, line 1 right, after arrow icon |
| 5 | Carrier Name | Load.carrier.name | Full name, truncated at 18 chars. If null: "UNASSIGNED" in red-600 bold text | Card body, line 2 |
| 6 | Driver Name | Load.driver.firstName + Load.driver.lastName | First Last format. If null: "--" | Card body, line 2 (after carrier, smaller text) |
| 7 | Pickup Date | Load.stops[0].appointmentDate | `MMM DD` format (e.g., "Jan 15"). If today: "Today" in bold. If overdue: red text. | Card body, line 3 left |
| 8 | Delivery Date | Load.stops[last].appointmentDate | `MMM DD` format. If today: "Today" in bold. If overdue: red text. | Card body, line 3 right |
| 9 | Equipment Type | Load.equipmentType | Icon only (Container for Dry Van, Snowflake for Reefer, RectangleHorizontal for Flatbed). Tooltip shows full name. | Card header, top-right area |
| 10 | Margin | (Load.customerRate - Load.carrierRate) / Load.customerRate * 100 | `$450 (18%)` format. Green if >= 15%, yellow if 5-14%, red if < 5%. Hidden without `finance_view` permission. | Card body, line 4 |
| 11 | Priority Indicators | Load.priority, Load.exceptions[], Load.isHotLoad | Icon badges: flame icon for hot load (red), alert-triangle for exception (amber), clock for late (red). Stacked horizontally. | Card header, between load# and equipment icon |
| 12 | Customer Name | Load.customer.name | Truncated at 16 chars, gray-500 text, small font | Card footer, left |
| 13 | Last Update | Load.updatedAt or Load.lastCheckCall.timestamp | Relative time: "5m ago", "2h ago". Red text if > 4 hours. | Card footer, right |

### Visible Fields (Lane Header)

| # | Field Label | Source | Format / Display | Location |
|---|---|---|---|---|
| 1 | Lane Title | Static | Status label from LOAD_STATUS map (e.g., "Unassigned", "Tendered") | Lane header, left |
| 2 | Load Count | Computed count | Number in parentheses, e.g., "(12)" | Lane header, after title |
| 3 | Lane Color Bar | LOAD_STATUS[status].hex | 4px top border on the lane column matching the status color | Lane header, top border |

### Visible Fields (KPI Strip)

| # | Field Label | Source | Format / Display | Location |
|---|---|---|---|---|
| 1 | Unassigned | Count of loads where status = PENDING and carrier = null | Number, red background if > 10 | KPI strip, card 1 |
| 2 | Tendered | Count of loads where status = TENDERED | Number | KPI strip, card 2 |
| 3 | Dispatched | Count of loads where status = DISPATCHED | Number | KPI strip, card 3 |
| 4 | In Transit | Count of loads where status = IN_TRANSIT | Number | KPI strip, card 4 |
| 5 | At Stop | Count of loads where status in (AT_PICKUP, AT_DELIVERY) | Number | KPI strip, card 5 |
| 6 | Delivered Today | Count of loads where status = DELIVERED and date = today | Number | KPI strip, card 6 |
| 7 | Total Active | Sum of all non-COMPLETED, non-CANCELLED loads | Number | KPI strip, card 7 |
| 8 | At Risk | Count of loads with exceptions or stale status | Number, red text if > 0 | KPI strip, card 8 |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Profit Margin | `(Load.customerRate - Load.carrierRate) / Load.customerRate * 100` | Percentage with 0 decimal. Dollar amount and percentage shown. Color-coded: green >= 15%, yellow 5-14%, red < 5%. |
| 2 | Load Age | `now() - Load.statusChangedAt` | Relative time: "2h 15m", "1d 4h". Background color intensifies with age: transparent (< 2h), yellow-50 (2-4h), orange-50 (4-8h), red-50 (> 8h). |
| 3 | Time to Pickup | `Load.stops[0].appointmentDate - now()` | Relative: "In 3h 20m", "Tomorrow 08:00", or "Overdue by 2h" in red bold. Only shown for loads not yet picked up. |
| 4 | Check Call Freshness | `now() - Load.lastCheckCall.timestamp` | Used to determine stale indicator. If > 4 hours and load is IN_TRANSIT: orange-500 left border on card (3px solid). |
| 5 | Route Display | `stops[0].city, stops[0].state + " -> " + stops[last].city, stops[last].state` | Abbreviated with arrow icon between. Multi-stop loads show stop count: "Chicago, IL -> (2 stops) -> Dallas, TX" |
| 6 | Tender Timer | `Load.tenderedAt + tenderWindowMinutes - now()` | Countdown: "28m remaining". Shown only on TENDERED cards. Turns red under 5 minutes. |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] **Kanban view with 6 status lanes** -- Vertical columns for PENDING/Unassigned, TENDERED, DISPATCHED, IN_TRANSIT (combined with AT_PICKUP/AT_DELIVERY/PICKED_UP), DELIVERED, COMPLETED. Each lane scrolls independently.
- [ ] **Drag-and-drop status transitions** -- Drag load cards between lanes to change status. Valid transitions highlighted green, invalid red with shake animation.
- [ ] **Load cards with essential data** -- Each card displays load number, route, carrier, dates, equipment icon, and priority indicators as specified in Section 4.
- [ ] **Real-time WebSocket updates** -- Cards move between lanes automatically when status changes arrive via WebSocket. New loads appear in Unassigned lane. Carrier assignments update card text.
- [ ] **Toolbar filters** -- Date selector (Today/Tomorrow/This Week/Custom), equipment type multi-select, carrier search, lane (origin-dest) filter, status filter, search box (searches load#, carrier name, customer, city).
- [ ] **Right-click context menu on cards** -- Assign Carrier, Dispatch, Track on Map, Add Check Call, View Stops, Contact Driver, Contact Customer, View Detail.
- [ ] **Quick carrier assignment modal** -- Right-click > "Assign Carrier" opens a modal with carrier search filtered by the load's lane and equipment type. Shows carrier scorecard summary, last rate on this lane, and "Assign" button.
- [ ] **New Load button** -- Top-right primary button navigates to Load Builder.
- [ ] **Card click/double-click** -- Single click expands card inline showing tertiary fields. Double-click navigates to Load Detail page.
- [ ] **Saved filter presets** -- System presets: "My Loads", "Urgent (Today's Pickups)", "Unassigned", "At Risk (Stale > 4h)". User can save custom filter combinations.

### Advanced Features (Logistics Expert Recommendations)

- [ ] **Timeline view (Gantt)** -- Horizontal Gantt chart where X-axis is time (days/hours), Y-axis is grouped by carrier or lane. Load bars span from pickup to delivery date. Color by status. Click bar to open load detail. Drag bar ends to adjust dates.
- [ ] **Map view** -- Full-screen map showing all active loads as truck markers. Sidebar list of loads. Click marker for popup with load summary. Color markers by status. Route polylines for selected loads.
- [ ] **Swimlane grouping** -- Toggle to group cards within lanes by: carrier, customer, equipment type, or dispatcher. Shows sub-headers within each lane.
- [ ] **Bulk dispatch** -- Shift+click to select multiple cards. "Dispatch All" button appears in toolbar. Confirms and dispatches all selected loads simultaneously.
- [ ] **Auto-refresh / live mode** -- Real-time via WebSocket. Cards animate between lanes. Subtle pulse animation (blue ring) on cards that just received an update (fades after 3 seconds).
- [ ] **Mini-map overlay** -- Small 200x150px map in bottom-right corner showing all active load positions as dots. Click to expand to full Map View. Toggleable via toolbar icon.
- [ ] **Load aging color-code** -- Cards gradually change background tint based on time in current status: white (< 2h), yellow-50 (2-4h), orange-50 (4-8h), red-50 (> 8h). Helps Maria visually prioritize without reading timestamps.
- [ ] **Stale check call indicator** -- If a load in IN_TRANSIT has not had a check call in 4+ hours, the card gets a 3px orange-500 left border. If 8+ hours, the border turns red-500.
- [ ] **Click-to-call driver** -- Click the driver phone number on the expanded card to initiate a phone call (tel: protocol) or softphone integration.
- [ ] **Desktop notifications** -- Browser Notification API. Fires when a new load enters the "Unassigned" lane. Configurable in user notification preferences.
- [ ] **Sound notification** -- Optional audio chime when new unassigned load appears. Toggle in toolbar. Uses Web Audio API with a subtle notification tone.
- [ ] **Collapsed/density mode** -- Toggle to show cards as single-line rows: `FM-2025-0847 | CHI->DAL | Swift Transport | Jan 15`. Maximizes visible cards per lane. Toggle in toolbar.
- [ ] **Keyboard navigation** -- Arrow keys navigate between cards (up/down within lane, left/right between lanes). Enter opens selected card. `A` opens assign modal. `D` dispatches. `T` opens tracking. `Esc` closes expanded card/modal.
- [ ] **Urgency sorting within lanes** -- Within each lane, cards are sorted by: pickup date (default), margin (descending), or load age (descending). Toggle sort order via lane header dropdown.
- [ ] **Tender countdown timer** -- TENDERED cards show a live countdown of remaining acceptance window. Timer turns red when under 5 minutes. Expired tenders auto-revert to PENDING with visual flash.
- [ ] **Smart carrier suggestions** -- When assigning a carrier, the modal shows AI-ranked suggestions based on: lane history, scorecard rating, current truck location, rate history, and capacity. Top suggestion is highlighted.

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| View margin/revenue on cards | dispatcher, ops_manager, admin | `finance_view` | Margin indicator row hidden entirely from card |
| Drag cards backward (e.g., Delivered -> In Transit) | ops_manager, admin | `load_status_revert` | Drop rejected with toast: "Only managers can revert load status" |
| Bulk dispatch multiple loads | dispatcher, ops_manager, admin | `load_dispatch` | Bulk action button not rendered |
| Access Timeline and Map views | dispatcher, ops_manager, admin | `dispatch_board_view` | View toggle buttons hidden; Kanban is the only view |
| Delete/cancel a load from context menu | admin | `load_delete` | "Cancel Load" option not rendered in context menu |
| View all loads (not just assigned) | ops_manager, admin | `load_view_all` | Board only shows loads where `assignedDispatcherId = currentUser.id` |
| Export board data | any authenticated | `export_data` | Export button disabled with tooltip "Export permission required" |

---

## 6. Status & State Machine

### Load Status Transitions (as displayed on the board)

```
                                    +---(Tender Rejected)---+
                                    |                       |
                                    v                       |
[PLANNING] ---(Ready)--> [PENDING] ---(Tender)--> [TENDERED] ---(Accept)--> [ACCEPTED/DISPATCHED]
                            ^                                                        |
                            |                                                        v
                            +---(Tender Expired / Carrier Declined)            [AT_PICKUP]
                                                                                     |
                                                                                     v
                                                                              [PICKED_UP]
                                                                                     |
                                                                                     v
                                                                              [IN_TRANSIT]
                                                                                     |
                                                                                     v
                                                                              [AT_DELIVERY]
                                                                                     |
                                                                                     v
                                                                              [DELIVERED]
                                                                                     |
                                                                                     v
                                                                              [COMPLETED]

Any status ---(Cancel with reason)--> [CANCELLED] (requires confirmation modal)
```

### Board Lane Mapping (Simplified for Kanban)

The 12 load statuses are grouped into 6 Kanban lanes for visual simplicity:

| Kanban Lane | Load Statuses Included | Lane Color (top border) |
|---|---|---|
| Unassigned | `PLANNING`, `PENDING` | Gray `#6B7280` |
| Tendered | `TENDERED` | Purple `#8B5CF6` |
| Dispatched | `ACCEPTED`, `DISPATCHED` | Indigo `#6366F1` |
| In Transit | `AT_PICKUP`, `PICKED_UP`, `IN_TRANSIT`, `AT_DELIVERY` | Sky `#0EA5E9` |
| Delivered | `DELIVERED` | Lime `#84CC16` |
| Completed | `COMPLETED` | Green `#10B981` |

### Actions Available Per Status

| Status | Available Actions (Context Menu) | Restricted Actions |
|---|---|---|
| PLANNING | Edit, Assign Carrier, Delete | Dispatch, Track, Add Check Call |
| PENDING | Assign Carrier, Edit, Cancel, Find Carrier | Dispatch (need carrier first), Track |
| TENDERED | View Tender Status, Cancel Tender, Re-tender, Edit | Dispatch (carrier hasn't accepted) |
| ACCEPTED / DISPATCHED | Track, Add Check Call, Update ETA, Contact Driver, Contact Customer, Cancel (with confirmation) | Edit origin/dest (load is committed), Delete |
| AT_PICKUP / PICKED_UP | Track, Add Check Call, Update ETA, Mark Departed, Contact Driver | Edit, Cancel (requires ops_manager approval) |
| IN_TRANSIT | Track, Add Check Call, Update ETA, View Route, Contact Driver, Contact Customer | Edit, Cancel (requires admin) |
| AT_DELIVERY / DELIVERED | Track, Confirm Delivery, Upload POD, Add Note, Contact Driver | Edit, Cancel, Delete |
| COMPLETED | View Detail, Print BOL, View Invoice, Reopen (admin only) | Edit, Cancel, Delete, Track |

### Status Badge Colors (from global system)

| Status | Background | Text | Border | Tailwind Classes |
|---|---|---|---|---|
| PLANNING | `#F1F5F9` | `#334155` | slate-300 | `bg-slate-100 text-slate-700` |
| PENDING | `#F3F4F6` | `#374151` | gray-300 | `bg-gray-100 text-gray-700` |
| TENDERED | `#EDE9FE` | `#5B21B6` | violet-300 | `bg-violet-100 text-violet-800` |
| ACCEPTED | `#DBEAFE` | `#1E40AF` | blue-300 | `bg-blue-100 text-blue-800` |
| DISPATCHED | `#E0E7FF` | `#3730A3` | indigo-300 | `bg-indigo-100 text-indigo-800` |
| AT_PICKUP | `#FEF3C7` | `#92400E` | amber-300 | `bg-amber-100 text-amber-800` |
| PICKED_UP | `#CFFAFE` | `#155E75` | cyan-300 | `bg-cyan-100 text-cyan-800` |
| IN_TRANSIT | `#E0F2FE` | `#075985` | sky-300 | `bg-sky-100 text-sky-800` |
| AT_DELIVERY | `#CCFBF1` | `#115E59` | teal-300 | `bg-teal-100 text-teal-800` |
| DELIVERED | `#ECFCCB` | `#3F6212` | lime-300 | `bg-lime-100 text-lime-800` |
| COMPLETED | `#D1FAE5` | `#065F46` | emerald-300 | `bg-emerald-100 text-emerald-800` |
| CANCELLED | `#FEE2E2` | `#991B1B` | red-300 | `bg-red-100 text-red-800` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Toolbar)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| + New Load | Plus | Primary / Blue-600 | Navigates to `/loads/new` (Load Builder) | No |
| Bulk Actions | ChevronDown | Secondary / Outline | Dropdown: Dispatch All, Update Status, Assign Carrier, Export Selected | Per-action (see below) |
| Export | Download | Ghost / text only | Downloads CSV of currently filtered/visible loads | No |

### View Toggle Buttons (Toolbar, left)

| Button Label | Icon | State | Action |
|---|---|---|---|
| Kanban | LayoutGrid | Active (default) | Switches to Kanban lane view |
| Timeline | GanttChart | Inactive | Switches to Gantt timeline view |
| Map | Map | Inactive | Switches to full-screen map view with sidebar |

### Card Context Menu (Right-Click)

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| Assign Carrier | UserPlus | Opens carrier assignment modal pre-filtered for load's lane/equipment | Load status is PENDING or PLANNING |
| Dispatch | Send | Sends dispatch confirmation to carrier, updates status to DISPATCHED | Load has carrier assigned, status is ACCEPTED |
| Track on Map | MapPin | Switches to Map View centered on this load | Load has GPS data |
| Add Check Call | PhoneCall | Opens check call entry modal pre-filled with load info | Load is AT_PICKUP through IN_TRANSIT |
| View Stops | ListOrdered | Navigates to Stop Management for this load | Always available |
| Contact Driver | Phone | Initiates phone call to driver (tel: link) | Load has driver with phone number |
| Contact Customer | Mail | Opens communication compose with customer pre-filled | Always available |
| Update ETA | Clock | Opens ETA update mini-form (new ETA + reason) | Load is dispatched or in transit |
| View Detail | ExternalLink | Navigates to Load Detail page | Always available |
| Cancel Load | XCircle | Opens confirmation modal with reason code dropdown | Requires `load_cancel` permission |

### Bulk Actions (When Multiple Cards Selected)

| Action Label | Action | Confirmation |
|---|---|---|
| Dispatch All | Sends dispatch confirmation for all selected loads that have carriers assigned | Yes -- "Dispatch N loads?" with list of load numbers |
| Update Status | Opens status change modal. All selected loads move to chosen status. | Yes -- "Update N loads to [status]?" |
| Assign Carrier | Opens carrier assignment modal. Selected carrier assigned to all selected loads. | Yes -- "Assign [carrier] to N loads?" |
| Export Selected | Downloads CSV of selected loads only | No |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Arrow Up / Down` | Navigate cards within current lane |
| `Arrow Left / Right` | Move focus to adjacent lane |
| `Enter` | Open selected card (expand inline) |
| `Shift + Enter` | Open Load Detail page for selected card |
| `A` | Open Assign Carrier modal for selected card |
| `D` | Dispatch selected card (if eligible) |
| `T` | Track on Map for selected card |
| `C` | Add Check Call for selected card |
| `N` | Create New Load (same as toolbar button) |
| `Ctrl/Cmd + K` | Open global command palette |
| `1-6` | Jump focus to lane 1-6 |
| `Escape` | Close modal / deselect / collapse expanded card |
| `/` | Focus search box |
| `Space` | Toggle card selection (for bulk actions) |

### Drag & Drop

| Draggable Element | Drop Target | Action | Validation |
|---|---|---|---|
| Load card | Adjacent forward status lane | Changes load status to target lane's status | Only forward transitions allowed without admin permission. Invalid: red shake + toast "Cannot move backward." |
| Load card (PENDING) | TENDERED lane | Triggers carrier assignment modal first. If carrier assigned, moves card. | Cannot tender without carrier. Modal opens automatically. |
| Load card (TENDERED) | DISPATCHED lane | Triggers dispatch confirmation dialog. On confirm, sends dispatch to carrier. | Must have carrier acceptance. If tender still pending, toast "Carrier has not yet accepted." |
| Load card (backward) | Previous status lane | Prompts for reason code + confirmation. Only ops_manager/admin. | Role check. Reason code required. Logged in audit trail. |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Namespace | Payload | UI Update |
|---|---|---|---|
| `load:created` | `/dispatch` | `{ loadId, orderId, status, origin, destination, pickupDate, customerId, equipmentType }` | New card appears in Unassigned lane with entrance animation (slide down + fade in). KPI counter increments. Desktop notification fires if enabled. Optional sound chime. |
| `load:status:changed` | `/dispatch` | `{ loadId, previousStatus, newStatus, changedBy, timestamp }` | Card smoothly animates from source lane to destination lane (300ms CSS transition). Source lane count decrements, destination lane count increments. Brief blue pulse on card. Toast: "Load FM-2025-0847 moved to In Transit by John D." |
| `load:assigned` | `/dispatch` | `{ loadId, carrierId, carrierName, driverId, driverName }` | Carrier name appears on card (replacing "UNASSIGNED" red text with carrier name in normal text). Card subtly highlights (blue-50 background flash). |
| `load:dispatched` | `/dispatch` | `{ loadId, carrierId, carrierName, dispatchedBy, timestamp }` | Card moves to Dispatched lane. Status badge updates. Toast notification. |
| `load:location:updated` | `/tracking` | `{ loadId, lat, lng, heading, speed, timestamp }` | Mini-map dot position updates. "Last Update" timestamp on card refreshes. If Map View is active, marker moves smoothly. |
| `load:eta:updated` | `/tracking` | `{ loadId, stopId, previousEta, newEta, reason }` | ETA display on expanded card updates. If ETA slipped past delivery window, priority indicator changes to late icon. |
| `checkcall:received` | `/tracking` | `{ loadId, checkCallId, type, location, notes, timestamp }` | "Last Update" timestamp refreshes on card. Stale indicator clears if it was showing. Check call count on expanded card increments. |
| `load:updated` | `/dispatch` | `{ loadId, changedFields }` | Relevant card fields update in-place (e.g., if carrier rate changed, margin recalculates). |

### Live Update Behavior

- **Update frequency:** WebSocket push for all events. Sub-2-second latency target.
- **Visual indicator:** Cards that receive updates get a subtle blue ring pulse animation that fades over 3 seconds (`animate-ping` on an absolutely-positioned pseudo-element, 0.15 opacity).
- **Conflict handling:** If a user is dragging a card that gets a remote status update, the drag is cancelled, the card snaps to its new position, and a toast explains: "This load was just updated by [name]. It has been moved to [new status]."
- **Batching:** Multiple events arriving within 500ms are batched into a single re-render to prevent visual jitter.

### Polling Fallback

- **When:** WebSocket `/dispatch` or `/tracking` connection drops.
- **Interval:** Every 10 seconds (critical screen, aggressive polling).
- **Endpoint:** `GET /api/loads?status=active&updatedSince={lastPollTimestamp}`
- **Visual indicator:** Yellow dot with "Live updates paused -- reconnecting..." banner below the toolbar. Banner is dismissable but reappears every 60 seconds while disconnected.

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Drag card to new lane | Card immediately moves to target lane with animation. Source/target counts update. | Card snaps back to original lane with reverse animation. Toast: "Failed to update status: [server reason]. Please try again." |
| Assign carrier | Carrier name immediately appears on card. Card border briefly flashes green. | Carrier name reverts to "UNASSIGNED" in red. Toast: "Failed to assign carrier: [reason]." |
| Dispatch load | Card moves to Dispatched lane. Status badge updates. | Card returns to previous lane. Toast: "Dispatch failed: [reason]." |
| Add check call | "Last Update" timestamp refreshes to now. Stale indicator clears. | Timestamp reverts. Stale indicator returns if applicable. Toast: "Failed to log check call." |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| StatusBadge | `src/components/ui/status-badge.tsx` | `entity: LOAD_STATUS, status: string, size: 'sm'` |
| PageHeader | `src/components/layout/page-header.tsx` | `title: "Dispatch Board", breadcrumbs, actions` |
| FilterBar | `src/components/ui/filter-bar.tsx` | `filters: FilterConfig[]` (date, equipment, carrier, search) |
| CommandPalette | `src/components/ui/command-palette.tsx` | Global `Ctrl+K` handler |
| Badge | `src/components/ui/badge.tsx` | For KPI counters and equipment type labels |
| Avatar | `src/components/ui/avatar.tsx` | For carrier/driver initials on cards |
| Tooltip | `src/components/ui/tooltip.tsx` | For truncated text, equipment icons, priority indicators |
| ContextMenu | `src/components/ui/context-menu.tsx` | Right-click menu on load cards |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| FilterBar | Text and select filters only | Add saved filter presets with star/save functionality. Add filter chip display below bar showing active filters with X to remove each. |
| StatusBadge | Single status display | Add option for "lane header" variant with count badge appended. Add pulsing animation variant for live-update highlight. |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| `DispatchBoard` | Container component managing view state (kanban/timeline/map), filters, WebSocket subscriptions, and layout. | High -- orchestrates all sub-components, manages WebSocket lifecycle and drag-drop context |
| `KanbanBoard` | Renders 6 status lanes with drag-and-drop support. Uses @dnd-kit/core for accessible drag-drop. | High -- drag-drop, virtual scrolling, lane layout, card ordering |
| `KanbanLane` | Single status column: colored header with count, scrollable card container, drop zone. | Medium -- drop zone highlighting, scroll behavior, card ordering |
| `LoadCard` | Compact card for Kanban. Displays all primary/secondary fields. Expandable for tertiary. Right-click context menu. Drag handle. | Medium -- conditional fields, expand/collapse animation, context menu integration, drag handle |
| `LoadCardExpanded` | Expanded inline view of a load card showing tertiary fields: driver phone, special instructions, commodity, weight, distance. | Small -- layout for additional fields within card boundary |
| `CarrierAssignmentModal` | Modal for assigning a carrier. Search with lane/equipment pre-filter. Shows carrier scorecard summary, last rate, available trucks. "Assign" button. | Medium -- search, filtering, scorecard summary display, carrier selection |
| `DispatchConfirmationDialog` | Confirmation dialog for dispatching a load. Shows load summary, carrier details, rate confirmation preview. "Confirm Dispatch" button. | Small -- summary display, confirmation action |
| `TimelineView` | Gantt chart component. X-axis: date range. Y-axis: carrier or lane grouping. Load bars with status colors. Pan and zoom. | High -- timeline rendering, horizontal scroll, zoom levels, bar interaction |
| `MapView` | Full map with load markers, route polylines, geofences. Integrates Google Maps API. Sidebar load list. | High -- Google Maps integration, marker management, polyline rendering, sidebar sync |
| `MiniMap` | Small 200x150px map overlay in bottom-right corner. Shows all load positions as colored dots. Click to expand. | Medium -- Google Maps embed, simplified markers, expand interaction |
| `LoadCardContextMenu` | Context menu component with status-aware action items (some actions disabled/hidden based on load status and user role). | Small -- conditional rendering of menu items |
| `TenderCountdown` | Live countdown timer component for tendered loads. Shows remaining acceptance time. Color changes at thresholds. | Small -- timer logic, color thresholds |
| `SwimlaneToggle` | Toggle control in toolbar for grouping cards by carrier/customer/equipment within lanes. | Small -- grouping logic, sub-header rendering |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Context Menu | `context-menu` | Right-click on load cards |
| Dropdown Menu | `dropdown-menu` | Bulk actions, sort options, swimlane toggle |
| Dialog | `dialog` | Carrier assignment modal, dispatch confirmation |
| Popover | `popover` | Filter popovers, date picker |
| Calendar | `calendar` | Date selector in toolbar |
| Command | `command` | Carrier search within assignment modal |
| Toggle Group | `toggle-group` | View mode toggle (Kanban/Timeline/Map) |
| Tooltip | `tooltip` | Truncated text, icon labels |
| Sheet | `sheet` | Side panel for expanded load view on mobile |
| Scroll Area | `scroll-area` | Virtual scrolling within Kanban lanes |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | `/api/loads?status=active&date={range}&equipment={type}&carrier={id}&search={q}&sort={field}&page={n}&limit=200` | Fetch active loads for board display | `useDispatchBoardLoads(filters)` |
| 2 | GET | `/api/loads/:id` | Fetch single load detail (for expanded card) | `useLoad(id)` |
| 3 | PATCH | `/api/loads/:id/status` | Update load status (drag-drop transitions) | `useUpdateLoadStatus()` |
| 4 | POST | `/api/loads/:id/assign` | Assign carrier to a load | `useAssignCarrier()` |
| 5 | POST | `/api/loads/:id/dispatch` | Dispatch load (send to carrier) | `useDispatchLoad()` |
| 6 | POST | `/api/loads/:id/check-calls` | Log a check call for a load | `useCreateCheckCall()` |
| 7 | PATCH | `/api/loads/:id/eta` | Update load ETA | `useUpdateEta()` |
| 8 | GET | `/api/carriers?lane={origin-dest}&equipment={type}&available=true&sort=score` | Fetch carriers for assignment modal | `useAvailableCarriers(filters)` |
| 9 | GET | `/api/loads/stats?date={range}` | Fetch KPI strip counts | `useDispatchBoardStats(dateRange)` |
| 10 | POST | `/api/loads/bulk-dispatch` | Bulk dispatch multiple loads | `useBulkDispatch()` |
| 11 | POST | `/api/loads/bulk-status` | Bulk status update for multiple loads | `useBulkStatusUpdate()` |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| `tenant:{tenantId}` on `/dispatch` | `load:created` | `useDispatchBoardUpdates()` -- adds new card to Unassigned lane |
| `tenant:{tenantId}` on `/dispatch` | `load:status:changed` | `useDispatchBoardUpdates()` -- moves card between lanes |
| `tenant:{tenantId}` on `/dispatch` | `load:assigned` | `useDispatchBoardUpdates()` -- updates carrier name on card |
| `tenant:{tenantId}` on `/dispatch` | `load:dispatched` | `useDispatchBoardUpdates()` -- moves card to Dispatched lane |
| `tenant:{tenantId}` on `/dispatch` | `load:updated` | `useDispatchBoardUpdates()` -- updates changed fields on card |
| `tenant:{tenantId}` on `/tracking` | `load:location:updated` | `useLoadLocationUpdates()` -- updates mini-map and card timestamps |
| `tenant:{tenantId}` on `/tracking` | `checkcall:received` | `useCheckCallUpdates()` -- updates card timestamp, clears stale indicator |
| `tenant:{tenantId}` on `/tracking` | `load:eta:updated` | `useEtaUpdates()` -- updates ETA display on expanded cards |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 409 | 500 |
|---|---|---|---|---|---|---|
| GET /api/loads | Show filter error toast | Redirect to login | "Access Denied" page | N/A | N/A | Error state with retry button in content area |
| PATCH /api/loads/:id/status | Toast: "Invalid status transition: [details]" | Redirect to login | Toast: "You don't have permission to change this status" | Toast: "Load not found -- it may have been deleted" | Toast: "Load was modified by another user. Refreshing..." (then re-fetch) | Toast: "Server error. Status not updated. Try again." |
| POST /api/loads/:id/assign | Toast: "Invalid carrier assignment: [details]" | Redirect to login | Toast: "Permission denied" | Toast: "Load or carrier not found" | Toast: "Carrier was already assigned by another dispatcher" | Toast: "Server error. Assignment failed." |
| POST /api/loads/:id/dispatch | Toast: "Cannot dispatch: [reason]" | Redirect to login | Toast: "Permission denied" | Toast: "Load not found" | Toast: "Load was already dispatched" | Toast: "Server error. Dispatch failed." |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Show 6 lane columns with colored header skeletons. Each lane contains 3-5 card skeletons (gray animated rectangles matching card dimensions: 280px wide, 140px tall). KPI strip shows 8 skeleton boxes. Toolbar shows real filter controls immediately (interactive before data loads).
- **Progressive loading:** Toolbar and lane headers render first (< 100ms). KPI counts load next (< 500ms). Cards load per-lane with a staggered reveal (Unassigned first, then left to right). This creates a visual "loading waterfall" effect.
- **Duration threshold:** If loading exceeds 5s, show "Loading dispatch board... This is taking longer than usual." message centered below the lane headers. After 15s, show "Still loading. You may have a slow connection." with a Retry button.

### Empty States

**First-time empty (no loads ever created):**
- **Illustration:** Truck with dashed route illustration (Lucide `Truck` icon at 64px within a dashed circle)
- **Headline:** "Your dispatch board is empty"
- **Description:** "Create your first load or import orders to start dispatching. Loads will appear here organized by status."
- **CTA Button:** "Create First Load" -- primary blue-600 button navigating to `/loads/new`
- **Secondary CTA:** "Import Orders" -- outline button navigating to orders import

**Filtered empty (data exists but filters exclude all):**
- **Headline:** "No loads match your filters"
- **Description:** "Try adjusting your date range, status, or search terms to see loads."
- **CTA Button:** "Clear All Filters" -- secondary outline button that resets all filters to defaults

**Single lane empty (other lanes have cards):**
- **Display:** Lane shows "No loads" in gray-400 italic text, centered vertically. The lane still accepts drag-drop targets (highlighted on drag hover).

### Error States

**Full page error (API completely fails):**
- **Display:** Error icon (AlertTriangle, 48px, red-500) + "Unable to load the dispatch board" + "Please try again or contact support if the issue persists." + Retry button (primary). Rendered in the content area with lane headers still visible but grayed out.

**Partial failure (stats load but board fails, or vice versa):**
- **Display:** KPI strip or board shows inline error: "Could not load [section]" with Retry link. The other section functions normally.

**Action error (drag-drop fails, assignment fails):**
- **Display:** Toast notification: red background, AlertTriangle icon, error message from server, dismiss X button. Auto-dismiss after 8 seconds. Card rolls back to original position with reverse animation.

**WebSocket disconnection:**
- **Display:** Yellow banner below toolbar: "Live updates paused -- reconnecting..." with a pulsing yellow dot. Board remains functional but data may become stale. Automatic polling fallback activates at 10-second intervals.

### Permission Denied

- **Full page denied:** Show "You don't have permission to view the Dispatch Board" with a link back to the main dashboard. Rendered in the content area.
- **Partial denied:** Finance fields (margin) hidden if no `finance_view` permission. Backward drag rejected with toast. Cancel option hidden in context menu if no `load_cancel` permission. Board only shows user's assigned loads if no `load_view_all` permission.

### Concurrent Editing Conflicts

- **Scenario:** Maria drags a card to DISPATCHED while John assigns a different carrier to the same load.
- **Behavior:** Optimistic update shows Maria's change. Server returns 409 Conflict. Card reverts to its server-side state. Toast: "Load FM-2025-0847 was updated by John D. Your change was not applied. The board has been refreshed."
- **Visual:** Card briefly flashes orange to indicate a conflict, then settles into its correct state.

### Performance Edge Cases

- **200+ loads visible:** Virtual scrolling activates within each lane. Only cards in the viewport are rendered. Scroll handles are shown on lanes with more than 8 cards.
- **Rapid WebSocket events (50+ events/second during peak):** Events are batched in 500ms windows. A maximum of 20 card animations play simultaneously; additional moves are instant (no animation).
- **Slow drag (user holds card for 30+ seconds):** Drag preview remains responsive. If a WebSocket event changes the dragged card's status during the drag, the drag is cancelled with a toast: "This load was updated while you were dragging it."

---

## 12. Filters, Search & Sort

### Filters

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Date Range | Date range picker | Preset: Today, Tomorrow, This Week, Next Week, Custom | This Week | `?dateFrom=&dateTo=` |
| 2 | Status | Multi-select dropdown | All load statuses from Section 6 | All active statuses (excludes COMPLETED, CANCELLED) | `?status=PENDING,TENDERED,...` |
| 3 | Equipment Type | Multi-select dropdown | Dry Van, Reefer, Flatbed, Step Deck, Other (from EQUIPMENT_TYPE) | All | `?equipment=DRY_VAN,REEFER` |
| 4 | Carrier | Searchable select | From `/api/carriers?active=true` | All | `?carrierId=` |
| 5 | Customer | Searchable select | From `/api/customers?active=true` | All | `?customerId=` |
| 6 | Lane (Origin) | State/region multi-select | US states grouped by region | All | `?originState=IL,WI` |
| 7 | Lane (Destination) | State/region multi-select | US states grouped by region | All | `?destState=TX,OK` |
| 8 | Assigned Dispatcher | Select | From `/api/users?role=dispatcher` | All (ops_manager), My Loads (dispatcher) | `?dispatcherId=` |
| 9 | Priority | Multi-select | Urgent, High, Medium, Low, Hot Load | All | `?priority=URGENT,HIGH` |

### Search Behavior

- **Search field:** Single search input with magnifying glass icon, right side of toolbar.
- **Searches across:** Load number (exact or partial), customer name, carrier name, origin city, destination city, driver name, PO/reference numbers.
- **Behavior:** Debounced 300ms, minimum 2 characters. Matching cards are highlighted (other cards dim to 40% opacity). In Kanban view, lanes auto-scroll to show the first matching card. Results count shown: "3 loads found."
- **URL param:** `?search=FM-2025`

### Sort Options (Within Each Lane)

| Field | Default Direction | Sort Type |
|---|---|---|
| Pickup Date | Ascending (soonest first) -- **DEFAULT** | Date |
| Load Age (time in status) | Descending (oldest first) | Duration |
| Margin | Descending (highest first) | Numeric |
| Customer Rate | Descending (highest first) | Numeric |
| Customer Name | Ascending (A-Z) | Alphabetic |

**Default sort:** Pickup Date ascending within each lane. Loads picking up soonest appear at the top.

### Saved Filters / Presets

- **System presets:** "My Loads" (dispatcher's own loads), "Urgent (Picking Up Today)" (pickup date = today, ordered by appointment time), "Unassigned" (status = PENDING, carrier = null), "At Risk" (stale > 4 hours or exceptions flagged), "Hot Loads" (priority = URGENT or isHotLoad = true).
- **User-created presets:** Users can save current filter combination by clicking the star icon next to the search box. A dialog prompts for a preset name. Stored per-user in localStorage and synced to server (`/api/users/:id/preferences/dispatch-filters`).
- **URL sync:** All filter state is reflected in URL query params. Bookmarkable. Shareable via copy-paste.

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Sidebar collapses to icon-only mode (56px width).
- Kanban lanes reduce to 4 visible (Unassigned, Tendered/Dispatched combined, In Transit, Delivered). Completed lane hidden behind "More" overflow.
- Load cards maintain full content but width reduces to ~220px.
- KPI strip wraps to 2 rows (4 cards per row).
- Toolbar filter bar collapses to a "Filters" button that opens a slide-over panel from the right.
- Mini-map hidden by default (toggle available).
- Timeline view: horizontal scroll enabled, fewer Y-axis labels visible.

### Mobile (< 768px)

- Sidebar hidden entirely (hamburger menu).
- Kanban view switches to a single-lane vertical list with status tabs at the top (horizontal scrollable tab bar: Unassigned | Tendered | Dispatched | In Transit | Delivered).
- Each tab shows its lane's cards in a vertical scrolling list.
- Load cards expand to full-width (100% of viewport minus padding).
- Drag-and-drop is replaced with a "Change Status" button on each card that opens a bottom sheet with status options.
- KPI strip collapses to a horizontal scrollable row of small counters.
- Right-click context menu becomes a long-press action sheet.
- Swipe left on a card reveals quick actions: Assign, Dispatch, Track.
- Timeline view is not available on mobile (tab hidden).
- Map view works but sidebar becomes a bottom sheet with load list.
- Pull-to-refresh to reload board data.

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full layout as designed in Section 3. 6 lanes visible simultaneously. All features available. |
| Desktop | 1024px - 1439px | 6 lanes visible but narrower (cards ~240px). Sidebar slightly narrower. |
| Tablet | 768px - 1023px | 4 lanes visible. Filters collapse. KPI strip wraps. See tablet notes. |
| Mobile | < 768px | Single-lane tabbed view. No drag-drop. See mobile notes. |

---

## 14. Stitch Prompt

```
Design the Dispatch Board screen for a modern freight/logistics TMS (Transportation Management System) called "Ultra TMS." This is the most important screen in the entire application -- the nerve center where dispatchers spend 80% of their workday.

Layout: Full-width page with a dark slate-900 sidebar on the left (240px) with the "Ultra TMS" logo at top and navigation items including "Orders", "Loads", "Dispatch Board" (currently active, highlighted with blue-600 left border and blue-600/10 background), "Tracking", "Check Calls", and "Appointments." The content area fills the remaining width with a white (#FFFFFF) background.

Top Section:
- Page header area with breadcrumb "TMS Core > Dispatch Board" in gray-500 text, and a large "+ New Load" primary button (blue-600, white text, Plus icon) on the far right.
- Below the header, a toolbar row with: a 3-button toggle group (Kanban active/highlighted, Timeline, Map -- using icons LayoutGrid, GanttChart, Map), a date selector showing "This Week" with a calendar icon, 3 filter chips (Equipment: All, Carrier: All, Lane: All), a search input with magnifying glass placeholder "Search loads...", and a "Bulk Actions" dropdown button on the far right.
- Below the toolbar, a row of saved filter chips as pill buttons: "My Loads", "Urgent", "Unassigned", "At Risk" -- the "Unassigned" chip is currently selected with blue-600 background.
- Below the filters, a slim KPI strip with 8 mini stat cards in a row: "Unassigned: 12" (gray background, number in bold), "Tendered: 8" (purple-100), "Dispatched: 23" (indigo-100), "In Transit: 45" (sky-100), "At Stop: 7" (amber-100), "Delivered: 15" (lime-100), "Total: 110" (white, border), "At Risk: 3" (red-100, red text).

Main Content -- Kanban Board:
Show 6 vertical columns (lanes) side by side, each with a colored top border (4px) and header:
1. "Unassigned (12)" -- gray top border (#6B7280). Contains load cards.
2. "Tendered (8)" -- purple top border (#8B5CF6).
3. "Dispatched (23)" -- indigo top border (#6366F1).
4. "In Transit (45)" -- sky blue top border (#0EA5E9).
5. "Delivered (15)" -- lime top border (#84CC16).
6. "Completed (28)" -- green top border (#10B981).

Each lane has 3-5 load cards. Each card is a white rectangle with rounded-lg corners, subtle shadow-sm, and a thin left border (2px) matching the lane color. Card layout (top to bottom):
- Row 1: Load number in bold monospace "FM-2025-0847" (blue-600 link), then on the right side a small equipment icon (Container icon for dry van) and priority icons (a flame icon for hot loads in red, an alert triangle in amber for exceptions).
- Row 2: Route with arrow: "Chicago, IL -> Dallas, TX" in gray-700 text with a small ArrowRight icon between origin and destination.
- Row 3: Carrier name "Swift Transport" in gray-600 (or "UNASSIGNED" in red-600 bold for unassigned loads), and smaller "Driver: Mike R." text.
- Row 4: "Pickup: Jan 15" and "Delivery: Jan 17" separated by a vertical divider, in gray-500 text with small calendar icons.
- Row 5: Margin indicator "$450 (18%)" in green-600 text with a small TrendingUp icon.
- Row 6 (footer): Customer name "Acme Mfg" in gray-400 small text on the left, and "5m ago" relative timestamp on the right in gray-400.

Show one card in the "Unassigned" lane with an orange left border and slightly orange-tinted background (orange-50) to indicate it has been sitting too long (load aging). Show another card in "In Transit" with a 3px orange left border indicating a stale check call.

One card should appear mid-drag between the "Unassigned" lane and the "Tendered" lane, with a slight rotation (2deg), elevated shadow (shadow-lg), and the "Tendered" lane highlighted with a green-100 background to indicate a valid drop target.

In the bottom-right corner, show a small 200x150px mini-map overlay with a white border and shadow-md, showing a simplified US map with small colored dots representing load positions.

Design Specifications:
- Font: Inter or system sans-serif, 13px base size for cards, 14px for toolbar
- Sidebar: slate-900 background, white text, blue-600 active indicator
- Content background: white (#FFFFFF)
- Primary color: blue-600 for buttons, links, and active states
- Cards: white background, rounded-lg, shadow-sm, hover:shadow-md transition
- Lane backgrounds: gray-50 (#F9FAFB) with white card contrast
- Lane headers: gray-700 text, bold, with colored count badge
- Drag preview: slight rotation, elevated shadow, 0.9 opacity
- Valid drop zone: green-100 background on lane
- Status colors match the Global Status Color System (gray for pending, purple for tendered, indigo for dispatched, sky for in transit, lime for delivered, green for completed)
- Modern SaaS aesthetic similar to Linear.app, Vercel dashboard, or Monday.com board view
- Dense information display -- this is a power user tool, not a consumer app. Maximize data density while maintaining readability.

Include: The 6 Kanban lanes with realistic freight data, the dragging card animation, the toolbar with view toggles and filters, the KPI strip, the mini-map overlay, and at least 4 load cards per visible lane with varied data. Show the context menu open on one card with options: "Assign Carrier", "Track on Map", "Add Check Call", "View Detail".
```

---

## 15. Enhancement Opportunities

### Current State (Wave 2)

**What's built and working:**
- [ ] Nothing yet -- this screen is Not Started.

**What needs polish / bug fixes:**
- N/A (not yet built)

**What to add this wave (Wave 2 MVP):**
- [ ] Kanban view with 6 lanes and drag-drop status transitions
- [ ] Load cards with all primary/secondary fields
- [ ] Real-time WebSocket updates for load:status:changed and load:assigned
- [ ] Toolbar with date/equipment/carrier filters and search
- [ ] Right-click context menu with core actions
- [ ] Carrier assignment modal with basic search
- [ ] Saved filter presets (system presets only)
- [ ] KPI strip with live counts
- [ ] Keyboard navigation (arrow keys, Enter, Escape)
- [ ] Optimistic updates with rollback

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Kanban view with drag-drop | High | High | P0 |
| Real-time WebSocket updates | High | Medium | P0 |
| Carrier assignment modal | High | Medium | P0 |
| Load cards with all fields | High | Medium | P0 |
| Toolbar filters and search | High | Medium | P0 |
| KPI strip | Medium | Low | P0 |
| Right-click context menu | High | Low | P0 |
| Keyboard navigation | Medium | Medium | P1 |
| Optimistic updates | High | Medium | P1 |
| Load aging color-code | Medium | Low | P1 |
| Stale check call indicator | Medium | Low | P1 |
| Saved filter presets (user-created) | Medium | Medium | P1 |
| Collapsed/density mode | Medium | Low | P1 |
| Timeline (Gantt) view | Medium | High | P2 |
| Map view | Medium | High | P2 |
| Mini-map overlay | Low | Medium | P2 |
| Swimlane grouping | Medium | Medium | P2 |
| Bulk dispatch | Medium | Medium | P2 |
| Desktop/sound notifications | Low | Low | P2 |
| Smart carrier suggestions (AI) | High | High | P2 |
| Tender countdown timer | Medium | Low | P2 |

### Future Wave Preview

- **Wave 3:** Add Timeline (Gantt) view for capacity planning. Add Map view with live GPS markers. Add swimlane grouping by carrier/customer. Add bulk dispatch functionality. Add tender countdown timer.
- **Wave 4:** AI-powered smart carrier suggestions based on lane history, pricing, and carrier performance. Automated dispatching rules (auto-tender to preferred carrier if match found). Predictive ETA integration. Custom card layout builder for power users. Integration with external load boards for one-click posting of unassigned loads.

---

<!--
DESIGN NOTES:
- This is the #1 most critical screen in Ultra TMS. Performance budget: < 1s initial load, < 100ms drag response, < 2s WebSocket event to visual update.
- Maria keeps this screen open 8+ hours per day. Every pixel matters. Every interaction saves or costs seconds that multiply across 50+ loads.
- The Kanban metaphor was chosen because it maps directly to the mental model dispatchers already use: loads flow left-to-right through a pipeline. This is how they think about their work.
- Drag-and-drop is the primary interaction model because it eliminates the modal/form overhead of traditional status updates. One gesture replaces three clicks.
- The 6-lane simplification (from 12 statuses) was a deliberate UX decision. Dispatchers don't need to see PLANNING vs PENDING or AT_PICKUP vs IN_TRANSIT as separate lanes -- the granularity adds visual noise without aiding decision-making. Sub-statuses are shown as badges on the card itself.
-->
