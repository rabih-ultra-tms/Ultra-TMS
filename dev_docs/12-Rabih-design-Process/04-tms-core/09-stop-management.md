# Stop Management

> Service: TMS Core (Service 04) | Wave: 2 | Priority: P0
> Route: /(dashboard)/loads/[id]/stops | Status: Not Started
> Primary Personas: Maria Rodriguez (Dispatcher), Sarah Chen (Operations Manager)
> Roles with Access: dispatcher, ops_manager, admin, support (read-only)
> Screen Type: List + Inline Edit

---

## 1. Purpose & Business Context

**What this screen does:**
The Stop Management screen displays and manages all pickup and delivery stops for a single load. It renders stops as an ordered, vertical sequence with inline editing capabilities -- allowing dispatchers to add, remove, reorder, and update stop details, appointment times, and status without navigating away from the load context. Each stop card shows facility information, appointment windows, arrival/departure times, contact details, and real-time status tracking.

**Business problem it solves:**
Freight loads frequently involve multiple stops (multi-stop loads with 3-8 stops are common for LTL consolidation and milk runs). Managing these stops across separate forms and screens creates confusion about stop sequence, missed appointment windows, and unrecorded arrival/departure times. When a driver calls to report an arrival, Maria needs to update the stop status in under 10 seconds -- not navigate through 3 screens. This screen provides a single, ordered view of all stops with one-click status transitions (Arrived, Loading, Departed) that automatically update the load's overall status and trigger downstream notifications.

**Key business rules:**
- Every load must have at least one PICKUP stop and one DELIVERY stop. The system prevents removing the last pickup or last delivery.
- Stops must maintain chronological order: each stop's appointment time must be after the previous stop's appointment time.
- The first stop must be type PICKUP. The last stop must be type DELIVERY. Intermediate stops can be any type.
- Stop status transitions follow a strict sequence: PENDING -> EN_ROUTE -> ARRIVED -> LOADING/UNLOADING -> LOADED/UNLOADED -> DEPARTED.
- Arrival and departure times are recorded with timestamps and cannot be backdated by more than 4 hours without ops_manager approval.
- When a stop status changes to ARRIVED, the load's status auto-updates (e.g., first pickup arrival changes load to AT_PICKUP).
- Detention time is automatically calculated when a driver has been at a facility beyond the free time window (typically 2 hours).
- Stop reordering recalculates estimated miles and transit times between stops.

**Success metric:**
Stop status update time drops from 45 seconds (navigating to stop, opening form, saving) to 5 seconds (one-click inline). Detention tracking accuracy improves from 60% manual recording to 95% automatic calculation. Missed appointment alerts decrease by 70%.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Load Detail | Click "Stops" tab or "Manage Stops" button | `loadId` via route param |
| Dispatch Board | Right-click load card > "View Stops" | `loadId` via route param |
| Loads List | Click row action > "View Stops" | `loadId` via route param |
| Tracking Map | Click load marker > "View Stops" in popover | `loadId` via route param |
| Check Calls | Click stop reference in a check call entry | `loadId`, `stopId` (scrolls to specific stop) |
| Load Timeline | Click stop event card | `loadId`, `stopId` |
| Direct URL | Bookmark / shared link | `loadId` via route param |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Load Detail | Click "Back to Load" breadcrumb or load# link | `loadId` |
| Tracking Map | Click "Track on Map" for a specific stop | `loadId`, `stopId` (centers map on stop) |
| Check Calls | Click "Add Check Call" button on a stop | `loadId`, `stopId` pre-filled |
| Appointment Scheduler | Click "Schedule Appointment" on a stop | `stopId`, `facilityId` |
| Facility Detail | Click facility name link (if in facility database) | `facilityId` |

**Primary trigger:**
Maria opens Stop Management when a driver calls in to report arrival at a facility, when she needs to update appointment times, or when building a multi-stop load. She accesses it from the Load Detail page's Stops tab most frequently. Sarah uses it during escalations to review stop timing for SLA analysis.

**Success criteria (user completes the screen when):**
- All stop statuses are current (arrivals and departures recorded as they happen).
- Stop sequence is correct and appointment times are properly set.
- Any new stops have been added with complete facility and appointment information.
- Detention time has been acknowledged and documented where applicable.

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------+
|  Breadcrumb: Loads > LOAD-20260115-0847 > Stops                   |
+------------------------------------------------------------------+
|  Load Header Bar (compact)                                         |
|  LOAD-0847 | IN_TRANSIT | Swift Transport | Chicago,IL > Dallas,TX|
|  Actions: [Add Stop] [Reorder Mode] [Print Route Sheet]           |
+------------------------------------------------------------------+
|  Route Summary Bar                                                 |
|  3 stops | 920 total miles | Est. transit: 14h 20m                |
|  [==============================-------] 67% complete              |
+------------------------------------------------------------------+
|                                                                    |
|  +--------------------------------------------------------------+ |
|  |  STOP 1 - PICKUP                            [DEPARTED]       | |
|  |  ┌────────────────────────────────────────────────────────┐  | |
|  |  │ ● Acme Warehouse                                       │  | |
|  |  │   1200 Industrial Blvd, Chicago, IL 60601              │  | |
|  |  │   Contact: John Smith (312) 555-0100                   │  | |
|  |  │                                                         │  | |
|  |  │   Appointment: Jan 15, 8:00 AM - 10:00 AM             │  | |
|  |  │   Arrived: 8:22 AM (+22m late)  Departed: 10:15 AM    │  | |
|  |  │   Dwell: 1h 53m | Detention: None (within free time)  │  | |
|  |  │                                                         │  | |
|  |  │   Cargo: 42,000 lbs | 24 pcs | 12 pallets             │  | |
|  |  │   Ref: PU-REF-001 | BOL: BOL-2025-4421                │  | |
|  |  │   Instructions: "Dock 14, call 30 min before"          │  | |
|  |  │                                                         │  | |
|  |  │   [Edit] [Check Call] [Documents]                       │  | |
|  |  └────────────────────────────────────────────────────────┘  | |
|  |       |                                                       | |
|  |       | 485 miles | ~7h 10m                                   | |
|  |       |                                                       | |
|  |  STOP 2 - STOP (Fuel/Rest)                   [EN_ROUTE]     | |
|  |  ┌────────────────────────────────────────────────────────┐  | |
|  |  │ ○ Springfield Truck Stop                                │  | |
|  |  │   ...                                                   │  | |
|  |  │   [Mark Arrived] [Skip Stop] [Edit]                    │  | |
|  |  └────────────────────────────────────────────────────────┘  | |
|  |       |                                                       | |
|  |       | 435 miles | ~6h 30m                                   | |
|  |       |                                                       | |
|  |  STOP 3 - DELIVERY                           [PENDING]      | |
|  |  ┌────────────────────────────────────────────────────────┐  | |
|  |  │ ○ Beta Corp Distribution Center                         │  | |
|  |  │   4500 Commerce Drive, Dallas, TX 75201                │  | |
|  |  │   Contact: Sarah Johnson (214) 555-0200                │  | |
|  |  │                                                         │  | |
|  |  │   Appointment: Jan 16, 2:00 PM - 4:00 PM              │  | |
|  |  │   ETA: Jan 16, 1:45 PM (15m early)                    │  | |
|  |  │                                                         │  | |
|  |  │   Instructions: "Check in at guard shack, Gate B"      │  | |
|  |  │                                                         │  | |
|  |  │   [Edit] [Reschedule] [Check Call]                     │  | |
|  |  └────────────────────────────────────────────────────────┘  | |
|  +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** | Stop sequence with type badges (PICKUP/DELIVERY), facility name, status badge, appointment window | Dispatcher must instantly see the ordered route and current progress |
| **Secondary** | Address, contact info, arrival/departure timestamps, dwell time, cargo details | Operational details needed when communicating with drivers and facilities |
| **Tertiary** | Reference numbers, special instructions, distance/time between stops, detention calculations | Supporting details for specific tasks |
| **Hidden** | Edit forms, document uploads, check call history, facility detail | Accessed via button clicks; inline edit keeps the flow compact |

---

## 4. Data Fields & Display

### Stop Card Fields

| # | Field Label | Source | Format / Display | Location |
|---|---|---|---|---|
| 1 | Stop Sequence | Stop.sequenceNumber | Number with filled/hollow circle indicator. Filled (green) = completed. Hollow (gray) = pending. | Card header, left |
| 2 | Stop Type | Stop.stopType | Badge: PICKUP (blue-600), DELIVERY (green-600), STOP (gray-500) | Card header, after sequence |
| 3 | Stop Status | Stop.status | StatusBadge: PENDING, EN_ROUTE, ARRIVED, LOADING, LOADED, UNLOADING, UNLOADED, DEPARTED | Card header, right |
| 4 | Facility Name | Stop.facilityName | Bold 16px text. Blue-600 link if facility is in database. | Card body, first line |
| 5 | Address | Stop.address (full) | "Street, City, ST ZIP" single line, gray-600 | Card body, second line |
| 6 | Contact | Stop.contactName + Stop.contactPhone | "Name (XXX) XXX-XXXX" with phone icon. Phone is clickable (tel: link). | Card body, third line |
| 7 | Appointment Window | Stop.appointmentDate + appointmentTimeFrom + appointmentTimeTo | "Jan 15, 8:00 AM - 10:00 AM" | Card body, appointment section |
| 8 | Arrival Time | Stop.arrivedAt | "8:22 AM" with variance badge: "+22m late" (orange) or "-15m early" (green) or "On time" (green) | Card body, timing section |
| 9 | Departure Time | Stop.departedAt | "10:15 AM" | Card body, timing section |
| 10 | Dwell Time | Calculated | "1h 53m" (departedAt - arrivedAt) | Card body, timing section |
| 11 | Detention | Calculated | "None" or "2h 15m ($125.00)" with red badge if detention applies | Card body, timing section |
| 12 | Cargo | Stop.weight, Stop.pieces, Stop.pallets | "42,000 lbs | 24 pcs | 12 pallets" | Card body, cargo section |
| 13 | Reference # | Stop.referenceNumber | Monospace text | Card body, reference section |
| 14 | BOL # | Stop.bolNumber | Monospace text (pickup stops only) | Card body, reference section |
| 15 | Special Instructions | Stop.instructions | Italic text in yellow-50 background card | Card body, bottom |
| 16 | ETA | Calculated from GPS | "Jan 16, 1:45 PM (15m early)" for future stops | Card body, pending stops only |

### Route Segment Fields (Between Stops)

| # | Field | Source | Format |
|---|---|---|---|
| 1 | Distance | Calculated via directions API | "485 miles" |
| 2 | Estimated Drive Time | Calculated | "~7h 10m" |
| 3 | Connecting Line | Visual | Vertical dashed line connecting stop cards |

### Route Summary Bar

| # | Field | Calculation | Format |
|---|---|---|---|
| 1 | Total Stops | stops.length | "3 stops" |
| 2 | Total Miles | Sum of inter-stop distances | "920 total miles" |
| 3 | Total Transit | Sum of drive times + estimated dwell | "14h 20m" |
| 4 | Completion % | (departed stops / total stops) * 100 | Progress bar with percentage |

### Calculated / Derived Fields

| # | Field | Calculation | Format |
|---|---|---|---|
| 1 | Arrival Variance | arrivedAt - appointmentTimeFrom | "+22m late" (orange/red) or "-15m early" or "On time" (green) |
| 2 | Dwell Time | departedAt - arrivedAt | "1h 53m" |
| 3 | Detention Time | MAX(0, dwellTime - freeTimeMinutes) | "2h 15m" with dollar estimate if detention rate is configured |
| 4 | ETA to Next Stop | GPS-based calculation | "ETA: 2:30 PM (1h 45m)" |
| 5 | Stop Progress | stops with DEPARTED status / total stops | Percentage for progress bar |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] Vertical stop sequence display with numbered stops, type badges, and status badges
- [ ] Connecting lines between stops showing distance and estimated drive time
- [ ] Route summary bar with total stops, miles, transit time, and completion progress
- [ ] Stop detail cards with facility, address, contact, appointment, timing, cargo, instructions
- [ ] One-click status transitions: "Mark Arrived", "Start Loading", "Mark Departed" buttons per stop
- [ ] Arrival and departure time recording with automatic timestamp
- [ ] Appointment variance calculation (early/on-time/late) displayed on each stop
- [ ] Dwell time automatic calculation (arrival to departure)
- [ ] Detention time automatic calculation (dwell exceeding free time)
- [ ] Inline edit for stop details (click "Edit" to expand editable form within the card)
- [ ] Add new stop (button opens form for new stop insertion at specified position)
- [ ] Remove stop (with confirmation; cannot remove last pickup or last delivery)
- [ ] Drag-to-reorder stops (with chronological validation)
- [ ] Compact load header with load#, status, carrier, route summary
- [ ] Special instructions display with highlighted background

### Advanced Features (Logistics Expert Recommendations)

- [ ] **Reorder mode** -- Toggle that enables drag handles on all stops. Dragging reorders and recalculates distances.
- [ ] **ETA calculation** -- For pending stops, show GPS-based ETA from current driver position.
- [ ] **Geofence arrival detection** -- Auto-mark stop as ARRIVED when GPS shows driver within geofence radius of facility.
- [ ] **Detention tracking dashboard** -- Running clock on the stop card when driver has been at facility beyond free time.
- [ ] **Facility auto-fill** -- When typing facility name, autocomplete from facility database and auto-populate address/contact/hours.
- [ ] **Print route sheet** -- Generate a driver-friendly PDF with all stops, directions, contacts, and instructions.
- [ ] **Historical facility data** -- Show average dwell time at this facility from past loads.
- [ ] **Skip stop** -- Mark an intermediate stop as skipped (with reason) without breaking the sequence.
- [ ] **Split stop** -- Split a stop into two (e.g., partial pickup at one dock, remainder at another).
- [ ] **Stop-level documents** -- Upload/view documents specific to each stop (signed BOL, photos, POD).

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| Edit stop details | dispatcher, ops_manager, admin | `stop_edit` | Edit button hidden; stop cards are read-only |
| Add/remove stops | dispatcher, ops_manager, admin | `stop_edit` | Add/Remove buttons hidden |
| Reorder stops | dispatcher, ops_manager, admin | `stop_edit` | Drag handles hidden |
| Record arrival/departure | dispatcher, ops_manager, admin | `stop_status` | Status buttons hidden |
| Backdate arrival time | ops_manager, admin | `stop_backdate` | Time input locked to current timestamp |
| Override detention | ops_manager, admin | `detention_override` | Detention values are auto-calculated only |
| Delete stop | admin | `stop_delete` | Remove option not available |

---

## 6. Status & State Machine

### Stop Status Transitions

```
[PENDING] ---(Driver en route)---> [EN_ROUTE]
                                        |
                            (GPS geofence or manual)
                                        |
                                        v
                                   [ARRIVED]
                                        |
                          (Pickup)       |       (Delivery)
                             |           |           |
                             v           |           v
                         [LOADING]       |     [UNLOADING]
                             |           |           |
                             v           |           v
                         [LOADED]        |     [UNLOADED]
                             |           |           |
                             v           v           v
                                   [DEPARTED]

Special: [PENDING] ---(Skip)---> [SKIPPED] (intermediate stops only)
```

### Status Badge Colors

| Status | Background | Text | Icon | Tailwind |
|---|---|---|---|---|
| PENDING | `gray-100` | `gray-700` | `Circle` | `bg-gray-100 text-gray-700` |
| EN_ROUTE | `blue-100` | `blue-800` | `Navigation` | `bg-blue-100 text-blue-800` |
| ARRIVED | `amber-100` | `amber-800` | `MapPin` | `bg-amber-100 text-amber-800` |
| LOADING | `indigo-100` | `indigo-800` | `ArrowUpFromLine` | `bg-indigo-100 text-indigo-800` |
| LOADED | `cyan-100` | `cyan-800` | `PackageCheck` | `bg-cyan-100 text-cyan-800` |
| UNLOADING | `indigo-100` | `indigo-800` | `ArrowDownToLine` | `bg-indigo-100 text-indigo-800` |
| UNLOADED | `cyan-100` | `cyan-800` | `PackageCheck` | `bg-cyan-100 text-cyan-800` |
| DEPARTED | `emerald-100` | `emerald-800` | `CheckCircle` | `bg-emerald-100 text-emerald-800` |
| SKIPPED | `slate-100` | `slate-500` | `SkipForward` | `bg-slate-100 text-slate-500` |

### Quick Status Buttons Per Stop Status

| Current Status | Available Quick Actions |
|---|---|
| PENDING | "Mark En Route" |
| EN_ROUTE | "Mark Arrived" |
| ARRIVED (Pickup) | "Start Loading" |
| ARRIVED (Delivery) | "Start Unloading" |
| LOADING | "Loading Complete" |
| UNLOADING | "Unloading Complete" |
| LOADED / UNLOADED | "Mark Departed" |
| DEPARTED | -- (no actions, completed) |

---

## 7. Actions & Interactions

### Primary Action Buttons (Header)

| Button | Icon | Variant | Action | Confirmation |
|---|---|---|---|---|
| Add Stop | `Plus` | Primary / Blue | Opens inline form to add a new stop at a specified position | No |
| Reorder Mode | `GripVertical` | Secondary / Outline | Toggles drag handles on all stops for reordering | No |
| Print Route Sheet | `Printer` | Secondary / Outline | Generates PDF with all stops and driving directions | No |

### Stop Card Actions

| Action | Icon | Condition | Behavior |
|---|---|---|---|
| Edit | `Edit` | Stop is editable (pre-DEPARTED or admin) | Expands inline edit form within the card |
| Mark Arrived | `MapPin` | Stop is EN_ROUTE or PENDING | Records arrival timestamp; updates stop and load status |
| Start Loading/Unloading | `ArrowUpFromLine` / `ArrowDownToLine` | Stop is ARRIVED | Updates stop status |
| Mark Departed | `CheckCircle` | Stop is LOADED/UNLOADED | Records departure timestamp; calculates dwell |
| Add Check Call | `PhoneCall` | Stop is in-progress | Opens check call form pre-filled with stop info |
| Documents | `FileText` | Always | Shows documents associated with this stop |
| Remove Stop | `Trash` | Stop is PENDING, not the last of its type | Removes stop with confirmation |
| Skip Stop | `SkipForward` | Intermediate stop only, not yet arrived | Marks stop as SKIPPED |
| Reschedule | `Calendar` | Stop is future | Opens appointment time editor |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `1-9` | Focus stop card by sequence number |
| `A` | Mark focused stop as Arrived |
| `D` | Mark focused stop as Departed |
| `E` | Edit focused stop |
| `N` | Add new stop |
| `R` | Toggle reorder mode |
| `Escape` | Cancel edit / close form |

### Drag & Drop

| Draggable | Drop Target | Action | Validation |
|---|---|---|---|
| Stop card (reorder mode) | Between other stop cards | Reorders stop sequence | First must be PICKUP, last must be DELIVERY. Appointments must remain chronological. |
| Document file | Stop card | Uploads document linked to that stop | File type validation |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Namespace | Payload | UI Update |
|---|---|---|---|
| `stop:status:changed` | `/tracking` | `{ loadId, stopId, oldStatus, newStatus, timestamp }` | Update stop status badge with animation. Update route progress bar. |
| `stop:arrived` | `/tracking` | `{ loadId, stopId, arrivedAt, method }` | Record arrival time on stop card. Show variance badge. Start dwell timer if applicable. |
| `stop:departed` | `/tracking` | `{ loadId, stopId, departedAt }` | Record departure time. Calculate and display dwell. Update progress bar. |
| `load:eta:updated` | `/tracking` | `{ loadId, stopId, newEta }` | Update ETA display on pending stops. |
| `load:location:updated` | `/tracking` | `{ loadId, lat, lng }` | Update ETA calculations for pending stops. |

### Live Update Behavior

- **Update frequency:** WebSocket push for all stop events. ETA recalculates every 60 seconds.
- **Visual indicator:** Stop cards that receive updates flash with a blue-50 border pulse for 2 seconds.
- **Detention timer:** If a driver has been at a stop for longer than the free time, a live-counting timer appears on the stop card in red.

### Polling Fallback

- **When:** WebSocket disconnects.
- **Interval:** Every 30 seconds.
- **Endpoint:** `GET /api/v1/loads/:loadId/stops?updatedSince={lastTimestamp}`

### Optimistic Updates

| Action | Optimistic | Rollback |
|---|---|---|
| Mark Arrived | Status badge updates immediately; arrival time shows "Just now" | Reverts to previous status; toast error |
| Mark Departed | Status updates; dwell time calculates | Reverts; toast error |
| Add stop | Stop card appears in sequence with "Saving..." indicator | Card removed; toast error |
| Remove stop | Card fades out immediately | Card fades back in; toast error |
| Reorder | Cards reposition immediately | Cards snap back to original order; toast error |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props |
|---|---|---|
| `StatusBadge` | `src/components/ui/status-badge.tsx` | Stop status colors |
| `Badge` | `src/components/ui/badge.tsx` | Stop type badges (PICKUP/DELIVERY/STOP) |
| `Card` | `src/components/ui/card.tsx` | Stop card containers |
| `Button` | `src/components/ui/button.tsx` | Action buttons |
| `Tooltip` | `src/components/ui/tooltip.tsx` | Time variance explanations |
| `Dialog` | `src/components/ui/dialog.tsx` | Remove stop confirmation |
| `Calendar` | `src/components/ui/calendar.tsx` | Appointment date picker |

### New Components to Create

| Component | Description | Complexity |
|---|---|---|
| `StopCard` | Full stop card with all fields, status badge, action buttons, inline edit mode, detention timer. Supports collapsed/expanded views. | High |
| `StopSequence` | Container for ordered stop cards with connecting lines, distance/time segments, drag-and-drop reordering. | High |
| `RouteProgressBar` | Horizontal progress bar showing completion percentage with stop markers. | Small |
| `RouteSummaryBar` | Summary of total stops, miles, transit time, and progress. | Small |
| `StopStatusButton` | Context-aware button that shows the next valid status action for a stop. | Small |
| `DwellTimer` | Live-counting timer displayed when a driver is at a stop. Red when exceeding free time. | Small |
| `ArrivalVarianceBadge` | Badge showing early/on-time/late with color coding and minutes. | Small |
| `StopInlineEditForm` | Expandable form within a stop card for editing facility, address, contact, appointment, instructions. | Medium |
| `AddStopForm` | Form for adding a new stop at a specified position in the sequence. | Medium |
| `RouteSegment` | Connecting element between two stop cards showing distance, drive time, and dashed line. | Small |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Collapsible | `collapsible` | Stop card expand/collapse |
| Separator | `separator` | Between stop sections |
| Alert Dialog | `alert-dialog` | Remove stop confirmation |
| Popover | `popover` | Time picker for appointment |
| Progress | `progress` | Route completion progress bar |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook | Cache |
|---|---|---|---|---|---|
| 1 | GET | `/api/v1/loads/:loadId/stops` | Fetch all stops for load (ordered by sequence) | `useLoadStops(loadId)` | 30s |
| 2 | GET | `/api/v1/stops/:id` | Fetch single stop detail | `useStop(stopId)` | 60s |
| 3 | POST | `/api/v1/stops` | Create new stop on load | `useCreateStop()` | -- |
| 4 | PUT | `/api/v1/stops/:id` | Update stop details | `useUpdateStop()` | -- |
| 5 | DELETE | `/api/v1/stops/:id` | Remove stop from load | `useDeleteStop()` | -- |
| 6 | PATCH | `/api/v1/stops/:id/status` | Update stop status | `useUpdateStopStatus()` | -- |
| 7 | PATCH | `/api/v1/stops/:id/arrive` | Mark stop as arrived with timestamp | `useMarkArrived()` | -- |
| 8 | PATCH | `/api/v1/stops/:id/depart` | Mark stop as departed with timestamp | `useMarkDeparted()` | -- |
| 9 | POST | `/api/v1/stops/reorder` | Reorder stops within a load | `useReorderStops()` | -- |
| 10 | GET | `/api/v1/stops/:id/detention` | Get detention time calculation | `useStopDetention(stopId)` | 30s |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 409 | 500 |
|---|---|---|---|---|---|---|
| PATCH /arrive | "Invalid: stop not in correct status" | Redirect | "Permission denied" | "Stop not found" | "Stop already marked as arrived" | "Server error" toast |
| POST /stops | "Validation error: [fields]" | Redirect | "Permission denied" | "Load not found" | N/A | "Server error" toast |
| POST /reorder | "Invalid order: [reason]" | Redirect | "Permission denied" | N/A | N/A | "Server error" toast |

---

## 11. States & Edge Cases

### Loading State

- Show compact load header immediately. Show 3 skeleton stop cards with animated gray bars matching card layout.

### Empty States

**Load with no stops (error state):**
- "This load has no stops configured. Every load needs at least one pickup and one delivery stop."
- CTA: "Add Pickup Stop" and "Add Delivery Stop" buttons.

### Error States

- **Full page error:** "Unable to load stop data" with retry.
- **Action error:** Toast: "Failed to update stop status: [reason]."
- **Validation error:** Inline red borders on invalid fields within edit form.

### Permission Denied

- **Full page:** "You don't have permission to view this load's stops."
- **Partial:** Edit/status buttons hidden for read-only roles. Stops display in read-only mode.

### Edge Cases

- **Simultaneous updates:** Two dispatchers updating the same stop. Server returns 409 conflict. Show "This stop was updated by [name]. Refreshing..." and re-fetch.
- **Driver arrives before previous stop departed:** Warning toast but allow (real-world GPS edge case).
- **Detention threshold:** Configurable per customer/facility. Default 2 hours free time.
- **Multi-stop reorder:** Validate that appointment chronology is maintained. Show warning if reorder breaks chronology.
- **Offline:** Stop cards display cached data. Status buttons disabled with "Offline" tooltip.

---

## 12. Filters, Search & Sort

### Filters

| # | Filter | Type | Options | Default |
|---|---|---|---|---|
| 1 | Stop Status | Toggle pills | All, Pending, In Progress, Completed | All |
| 2 | Stop Type | Toggle pills | All, Pickup, Delivery, Stop | All |

### Search Behavior

No search on this screen -- stops are scoped to a single load with typically 2-6 stops.

### Sort Options

Default: Sequence number ascending (route order). No alternative sort -- stops must always display in route order.

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Stop cards: Full-width, same layout as desktop but narrower.
- Route segments: Still visible between cards.
- Action buttons: Collapse into dropdown on smaller cards.
- Reorder: Drag handles remain functional.

### Mobile (< 768px)

- Stop cards: Full-width, single column.
- Contact phone: Click-to-call button prominently displayed.
- Action buttons: Sticky bottom bar with current stop's primary action (e.g., "Mark Arrived").
- Route segments: Simplified to just distance ("485 mi") without map preview.
- Reorder: Up/down arrows replace drag-and-drop.
- Edit form: Full-screen modal instead of inline expansion.

### Breakpoint Reference

| Breakpoint | Width | Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full layout with all fields visible |
| Desktop | 1024-1439px | Same layout, narrower cards |
| Tablet | 768-1023px | Full-width cards, action dropdown |
| Mobile | <768px | Single column, sticky actions, no drag-drop |

---

## 14. Stitch Prompt

```
Design a stop management screen for a freight/logistics TMS called "Ultra TMS." This screen shows all pickup and delivery stops for a single load in a vertical sequence.

Layout: Full-width content area with dark slate-900 sidebar (240px). Breadcrumb: "Loads > LOAD-20260115-0847 > Stops."

Load Header: Compact bar with "LOAD-20260115-0847" in monospace, "In Transit" sky-blue status badge, "Swift Transport" carrier name, "Chicago, IL -> Dallas, TX" route. Right side: "Add Stop" primary blue button, "Reorder" outline button, "Print Route" outline button.

Route Summary: Gray-50 bar showing "3 stops | 920 total miles | Est. transit: 14h 20m" with a progress bar at 67% (green fill).

Stop Sequence: Vertical layout with 3 stop cards connected by dashed vertical lines. Between each card, show distance and drive time on the connecting line.

Stop 1 (PICKUP - DEPARTED): White card with green left border (3px). Header: filled green circle "1", blue "PICKUP" badge, "DEPARTED" emerald status badge on right. Body: "Acme Warehouse" in bold 16px, address "1200 Industrial Blvd, Chicago, IL 60601" in gray, contact "John Smith (312) 555-0100" with phone icon. Appointment: "Jan 15, 8:00 AM - 10:00 AM". Timing: "Arrived: 8:22 AM" with orange "+22m late" badge, "Departed: 10:15 AM", "Dwell: 1h 53m". Cargo: "42,000 lbs | 24 pcs | 12 pallets". Instructions: yellow-50 box "Dock 14, call 30 min before arrival." Footer: "Edit", "Check Call", "Documents" text buttons.

Connecting segment: Dashed gray line, "485 miles | ~7h 10m" text.

Stop 2 (STOP - EN_ROUTE): White card with gray left border. Header: hollow gray circle "2", gray "STOP" badge, blue "EN ROUTE" badge. Body: "Springfield Truck Stop", address, no contact. Buttons: "Mark Arrived" primary blue button, "Skip Stop" outline, "Edit" text.

Connecting segment: "435 miles | ~6h 30m".

Stop 3 (DELIVERY - PENDING): White card with gray left border. Header: hollow gray circle "3", green "DELIVERY" badge, gray "PENDING" badge. Body: "Beta Corp Distribution Center", address "4500 Commerce Drive, Dallas, TX 75201", contact "Sarah Johnson (214) 555-0200". Appointment: "Jan 16, 2:00 PM - 4:00 PM". ETA: "Jan 16, 1:45 PM" with green "-15m early" badge. Instructions: "Check in at guard shack, Gate B." Buttons: "Edit", "Reschedule", "Check Call".

Design Specifications:
- Font: Inter, 14px base, 16px facility names
- Content background: white, cards: white with subtle border and left color border (3px)
- Completed stops: green left border, filled green circle marker
- Active stops: blue left border, pulsing blue circle marker
- Pending stops: gray left border, hollow gray circle marker
- Connecting lines: dashed gray-300, 2px
- Status badges per TMS color system
- Modern SaaS aesthetic similar to Linear.app or Shopify order fulfillment view
```

---

## 15. Enhancement Opportunities

### Current State (Wave 2)

**What's built and working:**
- [ ] Nothing -- screen is Not Started.

**What needs to be built for MVP:**
- [ ] Vertical stop sequence display with type/status badges
- [ ] Stop detail cards with all fields
- [ ] One-click status transitions (Arrived, Loading, Departed)
- [ ] Arrival/departure timestamp recording
- [ ] Dwell time and detention calculation
- [ ] Inline edit for stop details
- [ ] Add/remove stops
- [ ] Route summary bar with progress
- [ ] Connecting segments with distance/time

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Stop sequence with status transitions | High | High | P0 |
| Arrival/departure recording | High | Medium | P0 |
| Dwell and detention calculation | High | Medium | P0 |
| Inline edit | Medium | Medium | P0 |
| Add/remove stops | Medium | Medium | P0 |
| Route summary with progress | Medium | Low | P1 |
| Drag-to-reorder | Medium | Medium | P1 |
| ETA calculation from GPS | High | High | P1 |
| Print route sheet | Medium | Medium | P1 |
| Geofence auto-arrival | High | High | P2 |
| Historical facility data | Low | Medium | P2 |
| Stop-level documents | Medium | Medium | P2 |

### Future Wave Preview

- **Wave 3:** Geofence-based automatic arrival/departure detection. Facility hours integration (warn if appointment is outside operating hours). Average dwell time predictions per facility.
- **Wave 4:** AI-optimized stop sequencing (suggest optimal route order). Integration with facility scheduling APIs. Automated detention billing when threshold exceeded.

---

*End of Stop Management screen design. Reference `00-service-overview.md` for service-level context.*
