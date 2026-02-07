# Load Detail

> Service: TMS Core | Wave: 2 | Priority: P0
> Route: /loads/:id | Status: Not Started
> Primary Personas: Maria (Dispatcher), Sarah (Ops Manager)
> Roles with Access: super_admin, admin, ops_manager, dispatcher, accounting (limited), support (view), read_only (view)

---

## 1. Purpose & Business Context

**What this screen does:**
The Load Detail is the most information-dense screen in the entire Ultra TMS system. It shows everything about a single load: route and stops, carrier and driver information, rate breakdown and margin, documents (rate confirmation, BOL, POD), the complete event timeline, check call history, and real-time tracking with GPS location on a map. This is the "war room" for a single load -- when Maria needs to understand exactly what is happening with load LD-2025-0847, this is where she goes.

**Business problem it solves:**
In legacy brokerage operations, getting a complete picture of a load's status requires checking 3-5 different systems: TMS for status, a tracking platform for GPS, email for rate confirmations, a file server for POD documents, and a spreadsheet for rate details. This screen consolidates everything into a single view with context-appropriate actions based on the load's current status, eliminating the #1 time waste for dispatchers: context switching between systems.

**Key business rules:**
- The load status dictates which actions are available. A PLANNING load can be edited freely; a DISPATCHED load can only have check calls added and certain limited edits. A COMPLETED load is view-only.
- Carrier rate and margin are only visible to users with `finance_view` permission (admin, ops_manager). Dispatchers can see carrier rate but not margin.
- The tracking map only shows GPS data when the load is in an active transit status (DISPATCHED through AT_DELIVERY) and tracking data exists.
- Check calls can be added by any user with `load_edit` permission during active transit statuses.
- Documents tab shows rate confirmation sent/signed status. A rate confirmation must be signed before a load can be dispatched.
- The timeline is an immutable audit log. Nothing can be deleted from the timeline.
- Detention time tracking auto-starts when a stop's status changes to ARRIVED and auto-calculates dwell time. An alert triggers at the free-time threshold (default: 2 hours).
- ETA is recalculated whenever a new GPS position is received. The countdown timer shows time remaining to the next stop's appointment.

**Success metric:**
Average time for a dispatcher to assess a load's complete status and take appropriate action drops from 5 minutes (multi-system lookup) to under 30 seconds (single screen). Customer-facing status inquiries ("where's my freight?") resolved in under 60 seconds.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Loads List | Clicks load# link in table row | `loadId` in URL: `/loads/:id` |
| Dispatch Board | Clicks load card | `loadId` |
| Tracking Map | Clicks load marker popup "View Details" | `loadId` |
| Orders List / Order Detail | Clicks linked load# | `loadId` |
| Notification Center | Clicks load-related notification (status change, check call, exception) | `loadId`, optionally `?tab=timeline` or `?tab=check-calls` to deep-link to specific tab |
| Search / Command Palette | Searches for load# and clicks result | `loadId` |
| Direct URL | Bookmark or shared link | `loadId` from route params |
| Load Builder | After creating a load, "View Load" confirmation | `loadId` |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Loads List | Clicks breadcrumb "Loads" or browser back | Preserves list filters from session |
| Order Detail | Clicks linked order# | `orderId` |
| Carrier Detail | Clicks carrier name link | `carrierId` |
| Tracking Map | Clicks "View on Map" action or map snippet expand | `loadId` as focused load |
| Load Builder | Clicks "Clone Load" action | `?cloneFrom=LD-2025-XXXXX` |
| Document Viewer | Clicks document thumbnail/link in Documents tab | Document ID, opens in modal or new tab |
| Communication Hub | Clicks "Contact Driver" or "Notify Customer" | Pre-filled with load context |

**Primary trigger:**
Maria clicks a load# from the Loads List, Dispatch Board, or a notification to investigate, update, or act on a specific load. She spends 30-120 seconds on this screen per visit, performing one or two actions (checking status, adding a check call, confirming a delivery) before returning to her list or board.

**Success criteria (user completes the screen when):**
- User has assessed the load's current status, location, and any issues requiring attention.
- User has performed the necessary action for the load's current state (e.g., dispatched the load, added a check call, confirmed delivery, uploaded POD).
- User has reviewed any recently added documents, check calls, or timeline events.

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------------+
|  Breadcrumb: Operations > Loads > LD-2025-0847                         |
+------------------------------------------------------------------------+
|  HEADER BAR                                                            |
|  LD-2025-0847  [IN TRANSIT badge]  Swift Transport  [Actions v] [Edit] |
+------------------------------------------------------------------------+
|                                                                        |
| +----------------+ +----------------------------------+ +------------+ |
| | LEFT PANEL     | | CENTER PANEL                     | | RIGHT      | |
| | (25% width)    | | (50% width)                      | | PANEL      | |
| |                | |                                  | | (25% width)| |
| | LOAD SUMMARY   | | TABBED CONTENT                   | |            | |
| | CARD           | |                                  | | TRACKING   | |
| |                | | [Route] [Carrier] [Docs] [Time]  | | CARD       | |
| | Origin:        | | [Check Calls]                    | |            | |
| | Chicago, IL    | |                                  | | [Map snip] | |
| | ->             | | Active Tab Content               | | Last:      | |
| | Destination:   | | (scrollable, main content area)  | | Memphis,TN | |
| | Dallas, TX     | |                                  | | 2h ago     | |
| |                | |                                  | |            | |
| | Pickup:        | |                                  | | ETA:       | |
| | Jan 15 8:00 AM | |                                  | | Jan 17     | |
| | Delivery:      | |                                  | | 2:30 PM    | |
| | Jan 17 2:00 PM | |                                  | | (14h 22m)  | |
| |                | |                                  | |            | |
| | Equipment:     | |                                  | | Next Stop: | |
| | Dry Van [icon] | |                                  | | Dallas, TX | |
| |                | |                                  | |            | |
| | Miles: 924     | |                                  | | QUICK      | |
| | Weight: 42,000 | |                                  | | ACTIONS    | |
| |                | |                                  | |            | |
| | Order:         | |                                  | | [Add Check | |
| | ORD-2025-0412  | |                                  | |  Call]     | |
| | (link)         | |                                  | | [Contact   | |
| |                | |                                  | |  Driver]   | |
| | Customer:      | |                                  | | [Share     | |
| | Acme Mfg Co    | |                                  | |  Tracking] | |
| | (link)         | |                                  | | [Update    | |
| |                | |                                  | |  ETA]      | |
| +----------------+ +----------------------------------+ +------------+ |
|                                                                        |
+------------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible, above the fold) | Load #, status badge, carrier name, origin-destination, pickup/delivery dates, tracking map snippet with last location and ETA countdown | Maria needs instant situational awareness: "What is this load, where is it, and when does it arrive?" |
| **Secondary** (visible but less prominent) | Equipment type, miles, weight, order link, customer link, quick action buttons, active tab content header | Context for decision-making that's always one glance away |
| **Tertiary** (available on scroll, tab, or expand) | Full stop details with arrival/departure times, carrier info and driver contact, rate breakdown with margin, document list, timeline events, check call history | Deep operational and financial details available via tab navigation |
| **Hidden** (behind a click -- modal, drawer, or detail page) | Document viewer (inline PDF/image), check call entry form, ETA update form, status change confirmation, carrier reassignment form, detention calculator details | Action forms and deep document review |

---

## 4. Data Fields & Display

### Visible Fields

**Header Bar**

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Load Number | Load.loadNumber | Monospace, large (text-xl), bold: `LD-2025-0847` | Header, left |
| 2 | Status | Load.status | Badge with icon, per status-color-system. E.g., sky badge "In Transit" with truck icon. | Header, next to load# |
| 3 | Carrier Name | Load.carrierId -> Carrier.name | Link to Carrier Detail. If unassigned: red "Unassigned" text. | Header, after status |

**Left Panel -- Load Summary Card**

| # | Field Label | Source | Format / Display | Location |
|---|---|---|---|---|
| 4 | Origin | Load.stops[0].city + state | "City, ST" with blue pickup icon | Summary card |
| 5 | Destination | Load.stops[last].city + state | "City, ST" with green delivery icon | Summary card |
| 6 | Route Arrow | N/A | Vertical arrow or route line connecting origin to destination | Between origin/dest |
| 7 | Pickup Date/Time | Load.stops[0].appointmentDate + time | "MMM DD, YYYY h:mm A" -- bold if today, red if past due | Summary card |
| 8 | Delivery Date/Time | Load.stops[last].appointmentDate + time | "MMM DD, YYYY h:mm A" -- bold if today, red if past due | Summary card |
| 9 | Equipment Type | Load.equipmentType | Icon + label from equipment type system (e.g., container icon + "Dry Van") | Summary card |
| 10 | Total Miles | Load.totalMiles | "XXX mi" | Summary card |
| 11 | Weight | Load.weight | "XX,XXX lbs" | Summary card |
| 12 | Commodity | Load.commodity | Text, truncated with tooltip if long | Summary card |
| 13 | Linked Order | Load.orderId -> Order.orderNumber | Monospace link: "ORD-2025-0412" clicking navigates to Order Detail | Summary card |
| 14 | Customer | Load.customerId -> Customer.name | Link to Customer Detail | Summary card |
| 15 | Priority | Load.priority | Badge: Low (blue), Medium (amber), High (orange), Urgent (red) | Summary card |

**Right Panel -- Tracking Card**

| # | Field Label | Source | Format / Display | Location |
|---|---|---|---|---|
| 16 | Map Snippet | Load.lastLocation lat/lng | Small embedded Google Map (200x200px) with single marker showing current position. Blue route line. Click to expand to full Tracking Map. | Tracking card, top |
| 17 | Last Location | Load.lastLocation.city + state | "City, ST" with map-pin icon | Tracking card |
| 18 | Location Freshness | now() - Load.lastLocation.timestamp | "Xh Xm ago". Green if <1h, amber if 1-4h, red if >4h. | Tracking card |
| 19 | Current ETA | Load.currentEta | "MMM DD h:mm A" -- the predicted arrival at next stop | Tracking card |
| 20 | ETA Countdown | Load.currentEta - now() | "Xd Xh Xm" countdown timer. Updates every minute. Red if past due. | Tracking card |
| 21 | Next Stop | Load.stops[nextPending].facilityName + city | "Facility - City, ST" | Tracking card |
| 22 | Speed | Load.lastLocation.speed | "XX mph" (if available from GPS) | Tracking card |

**Center Panel -- Route & Stops Tab**

| # | Field Label | Source | Format / Display | Location |
|---|---|---|---|---|
| 23 | Stop Sequence | Stop[].sequence | Visual vertical timeline: numbered circles connected by lines. Pickup = blue circle, delivery = green circle, intermediate = amber. | Route tab, full height |
| 24 | Stop Type | Stop.type | Badge: Pickup (blue), Delivery (green), Stop (amber) | Per stop card |
| 25 | Facility Name | Stop.facilityName | Bold text | Per stop card |
| 26 | Address | Stop.address | Full address, text-sm, secondary color | Per stop card |
| 27 | Appointment | Stop.appointmentDate + timeFrom + timeTo | "MMM DD, h:mm - h:mm A" | Per stop card |
| 28 | Stop Status | Stop.status | Badge: Pending, En Route, Arrived, Loading, Unloading, Completed, Cancelled | Per stop card |
| 29 | Arrival Time | Stop.arrivedAt | "h:mm A" (actual arrival). If before appointment: green. If after: red with "Late by Xm". | Per stop card, conditional |
| 30 | Departure Time | Stop.departedAt | "h:mm A" (actual departure). | Per stop card, conditional |
| 31 | Dwell Time | Stop.departedAt - Stop.arrivedAt | "Xh Xm". Amber if > 2h (detention alert). Red if > 4h. | Per stop card, conditional |
| 32 | Contact | Stop.contactName + phone | Name + clickable phone link | Per stop card |
| 33 | Instructions | Stop.instructions | Text, italic, text-sm | Per stop card |
| 34 | Route Map | All stops coordinates | Full map with route polyline, stop markers (numbered), current position marker if in transit. | Route tab, below stop list or side-by-side |

**Center Panel -- Carrier & Rate Tab**

| # | Field Label | Source | Format / Display | Location |
|---|---|---|---|---|
| 35 | Carrier Name | Carrier.name | Large text, link to Carrier Detail | Carrier card |
| 36 | MC Number | Carrier.mcNumber | "MC-XXXXXXX" monospace | Carrier card |
| 37 | DOT Number | Carrier.dotNumber | "DOT-XXXXXXX" monospace | Carrier card |
| 38 | Carrier Contact | Carrier.contactName | Name | Carrier card |
| 39 | Carrier Phone | Carrier.contactPhone | Clickable phone link | Carrier card |
| 40 | Carrier Email | Carrier.contactEmail | Clickable email link | Carrier card |
| 41 | Driver Name | Load.driverName | Name | Driver sub-card |
| 42 | Driver Phone | Load.driverPhone | Clickable phone link. "Call Driver" button. | Driver sub-card |
| 43 | Truck Number | Load.truckNumber | Text | Driver sub-card |
| 44 | Trailer Number | Load.trailerNumber | Text | Driver sub-card |
| 45 | Customer Rate | Load.customerRate | "$X,XXX.XX" -- large, bold. Visible to admin, ops_manager, sales. | Rate breakdown |
| 46 | Carrier Rate | Load.carrierRate | "$X,XXX.XX". Visible to admin, ops_manager, dispatcher. | Rate breakdown |
| 47 | Accessorials | Load.accessorials[] | Table: Type | Amount rows. Sum at bottom. | Rate breakdown |
| 48 | Fuel Surcharge | Load.fuelSurcharge | "$XXX.XX" | Rate breakdown |
| 49 | Total Customer | Calculated | Sum of customer rate + accessorials | Rate breakdown |
| 50 | Total Carrier | Calculated | Sum of carrier rate + carrier accessorials | Rate breakdown |
| 51 | Margin ($) | Calculated | Customer total - Carrier total | Rate breakdown, color-coded |
| 52 | Margin (%) | Calculated | (Customer total - Carrier total) / Customer total * 100 | Rate breakdown, color-coded |

**Center Panel -- Documents Tab**

| # | Field Label | Source | Format / Display | Location |
|---|---|---|---|---|
| 53 | Rate Confirmation | Load.documents[] | Card: "Rate Confirmation" + status badge (Draft, Sent, Signed). View/download buttons. | Documents tab |
| 54 | Bill of Lading (BOL) | Load.documents[] | Card with thumbnail preview, upload date, uploaded by. | Documents tab |
| 55 | Proof of Delivery (POD) | Load.documents[] | Card with thumbnail preview. Critical for invoicing -- highlighted if missing after delivery. | Documents tab |
| 56 | Other Documents | Load.documents[] | List of uploaded docs: lumper receipts, photos, etc. Each with thumbnail, name, date. | Documents tab |

**Center Panel -- Timeline Tab**

| # | Field Label | Source | Format / Display | Location |
|---|---|---|---|---|
| 57 | Timeline Events | Load.timeline[] | Vertical timeline. Each event: icon + timestamp + description + user. Color-coded by event type. Most recent at top. | Timeline tab |

**Center Panel -- Check Calls Tab**

| # | Field Label | Source | Format / Display | Location |
|---|---|---|---|---|
| 58 | Check Call List | Load.checkCalls[] | Cards, most recent first. Each: type badge (CHECK_CALL, ARRIVAL, DEPARTURE, DELAY, ISSUE), timestamp, location (city, state), notes, reported by (user or "Automated GPS"). | Check Calls tab |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Margin ($) | customerRate + customerAccessorials - carrierRate - carrierAccessorials | Currency, color-coded: green >15%, yellow 5-15%, red <5% |
| 2 | Margin (%) | margin$ / (customerRate + customerAccessorials) * 100 | Percentage with 1 decimal |
| 3 | ETA Countdown | currentEta - now() | Live countdown "Xd Xh Xm", updates every minute |
| 4 | Dwell Time | stop.departedAt - stop.arrivedAt (or now() - stop.arrivedAt if still at stop) | "Xh Xm". Live if still at stop. |
| 5 | Location Freshness | now() - lastLocation.timestamp | Relative time: "Xm ago". Color: green <1h, amber 1-4h, red >4h |
| 6 | Rate Per Mile | customerRate / totalMiles | "$X.XX/mi" |
| 7 | On-Time Status | Compares actual arrival/departure times to appointment windows | "On Time" (green), "Late by Xh" (red), "Early by Xh" (blue) |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] Three-column layout: summary (left), tabbed content (center), tracking + actions (right)
- [ ] Header bar with load#, status badge, carrier name, and primary action buttons
- [ ] Load summary card with origin/dest, dates, equipment, miles, weight, linked order/customer
- [ ] Tracking card with map snippet, last location, ETA countdown, next stop
- [ ] Route & Stops tab: visual stop timeline with status per stop, route map with polyline
- [ ] Carrier & Rate tab: carrier info card, driver info, rate breakdown with margin calculation
- [ ] Documents tab: rate confirmation with sent/signed status, BOL, POD, other uploads with inline preview
- [ ] Timeline tab: complete chronological event history (immutable audit log)
- [ ] Check Calls tab: list of all check calls with type, location, notes, timestamp
- [ ] "Add Check Call" quick action button
- [ ] Status-dependent action buttons (see Section 6 for full status-action matrix)
- [ ] Breadcrumb navigation back to Loads List
- [ ] Clickable links to related entities: order, carrier, customer
- [ ] Document upload (drag-and-drop or click to browse)

### Advanced Features (Logistics Expert Recommendations)

- [ ] Real-time tracking map with GPS marker position updates via WebSocket (marker animates between positions)
- [ ] ETA countdown timer updating every minute with visual urgency (amber when <2h, red when overdue)
- [ ] Detention time auto-calculator: starts counting when stop status = ARRIVED, shows running dwell time, alerts at free time threshold (configurable, default 2h)
- [ ] One-click "Contact Driver" button: opens SMS pre-filled with load context, or initiates call
- [ ] "Share Tracking Link" button: generates a public tracking URL that can be sent to the customer (shows simplified map + ETA without internal data)
- [ ] Print rate confirmation / BOL as PDF (browser print dialog, formatted for standard paper)
- [ ] Carrier scorecard mini-view in the Carrier & Rate tab (on-time %, claims rate, loads completed)
- [ ] Previous loads on this lane: show last 5 loads on the same origin-destination lane with carrier and rate info (for rate benchmarking)
- [ ] Google Maps directions link for driver (opens external Google Maps with route from current location to next stop)
- [ ] Inline document preview (PDF viewer for rate confirmations, image viewer for POD photos) without downloading
- [ ] Weather at pickup/delivery locations (from weather API, shown as icon + temp in stop cards)
- [ ] Status change history in Timeline with visual diff ("Status changed from DISPATCHED to AT_PICKUP by Maria R.")
- [ ] Copy load# / tracking link to clipboard buttons
- [ ] Keyboard shortcut Ctrl+Shift+C to add a check call from anywhere on the page

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| View customer rate | admin, ops_manager, sales_agent | finance_view (customer_rate) | Rate field shows "--" or "Restricted" |
| View carrier rate | admin, ops_manager, dispatcher | finance_view (carrier_rate) | Rate field shows "--" or "Restricted" |
| View margin | admin, ops_manager | finance_view (margin) | Margin section hidden entirely |
| Edit load | admin, ops_manager, dispatcher | load_edit | Edit button hidden; all fields read-only |
| Assign/reassign carrier | admin, ops_manager, dispatcher | load_assign | Assign carrier button hidden |
| Dispatch load | admin, ops_manager, dispatcher | load_dispatch | Dispatch button hidden |
| Add check call | admin, ops_manager, dispatcher | load_edit | "Add Check Call" button hidden |
| Upload documents | admin, ops_manager, dispatcher, accounting | document_upload | Upload area hidden |
| Delete load | admin | load_delete | Delete option not in actions menu |
| View driver contact info | admin, ops_manager, dispatcher, carrier_relations | driver_view | Driver phone hidden, "Contact Driver" hidden |

---

## 6. Status & State Machine

### Status Transitions (Full 12-State Load Lifecycle)

```
[PLANNING] ---> [PENDING] ---> [TENDERED] ---> [ACCEPTED] ---> [DISPATCHED]
     |              |              |                                  |
     v              v              v                            [AT_PICKUP]
[CANCELLED]   [CANCELLED]   [PENDING]                               |
                             (rejected)                        [PICKED_UP]
                                                                     |
                                                              [IN_TRANSIT]
                                                                     |
                                                              [AT_DELIVERY]
                                                                     |
                                                              [DELIVERED]
                                                                     |
                                                              [COMPLETED]
```

### Actions Available Per Status

| Status | Primary Actions (Header Buttons) | Secondary Actions (Dropdown) | Restricted Actions |
|---|---|---|---|
| PLANNING | Edit Load, Assign Carrier | Delete, Clone | Dispatch, Track, Add Check Call |
| PENDING | Edit Load, Assign Carrier | Delete, Clone | Dispatch, Track, Add Check Call |
| TENDERED | Cancel Tender | Edit (limited), Change Carrier, Clone | Delete, Dispatch |
| ACCEPTED | Send Rate Confirmation, Dispatch | Edit (limited), Change Carrier, Change Driver, Clone | Delete |
| DISPATCHED | Add Check Call, Track on Map | Report Exception, Change Driver, Update ETA, Clone | Edit, Delete, Change Carrier |
| AT_PICKUP | Confirm Pickup, Add Check Call | Track on Map, Report Exception, Update ETA, Clone | Edit, Delete, Change Carrier |
| PICKED_UP | Add Check Call, Track on Map | Update ETA, Report Exception, Clone | Edit, Delete |
| IN_TRANSIT | Add Check Call, Update ETA | Track on Map, Report Exception, Clone | Edit, Delete |
| AT_DELIVERY | Confirm Delivery, Add Check Call | Track on Map, Report Exception, Clone | Edit, Delete |
| DELIVERED | Upload POD, Complete Load | Add Note, Clone | Edit, Delete, Track |
| COMPLETED | Clone | View Only, Print Summary | Everything else |
| CANCELLED | Clone | View Only | Everything else |

### Status Badge Colors

(Same as Loads List -- reference status-color-system.md Section 3: Load Statuses)

| Status | Background | Text | Icon |
|---|---|---|---|
| PLANNING | #F1F5F9 | #334155 | PenLine |
| PENDING | #F3F4F6 | #374151 | Clock |
| TENDERED | #EDE9FE | #5B21B6 | SendHorizonal |
| ACCEPTED | #DBEAFE | #1E40AF | ThumbsUp |
| DISPATCHED | #E0E7FF | #3730A3 | Send |
| AT_PICKUP | #FEF3C7 | #92400E | MapPin |
| PICKED_UP | #CFFAFE | #155E75 | PackageOpen |
| IN_TRANSIT | #E0F2FE | #075985 | Truck |
| AT_DELIVERY | #CCFBF1 | #115E59 | MapPinCheck |
| DELIVERED | #ECFCCB | #3F6212 | PackageCheck |
| COMPLETED | #D1FAE5 | #065F46 | CircleCheckBig |
| CANCELLED | #FEE2E2 | #991B1B | XCircle |

---

## 7. Actions & Interactions

### Primary Action Buttons (Header Bar, Right Side)

| Button Label | Icon | Variant | Action | Condition | Confirmation? |
|---|---|---|---|---|---|
| Edit | Pencil | Secondary / outline | Navigate to `/loads/:id/edit` | Status is PLANNING, PENDING, or limited fields for TENDERED/ACCEPTED | No |
| Actions | ChevronDown | Secondary / outline dropdown | Opens dropdown menu with status-dependent actions (see Section 6) | Always visible | No |
| Assign Carrier | UserPlus | Primary / blue | Opens carrier assignment modal | Status PLANNING or PENDING, no carrier | No |
| Dispatch | Send | Primary / blue | Changes status to DISPATCHED; sends notifications | Status ACCEPTED, rate con signed | Yes -- "Dispatch to [carrier]?" |
| Confirm Pickup | PackageOpen | Primary / blue | Confirms pickup, advances load status | Status AT_PICKUP | Yes -- "Confirm pickup at [facility]?" |
| Confirm Delivery | PackageCheck | Primary / blue | Confirms delivery, advances load status | Status AT_DELIVERY | Yes -- "Confirm delivery at [facility]?" |
| Upload POD | Upload | Primary / blue | Opens POD upload modal | Status DELIVERED, POD not yet uploaded | No |
| Complete | CircleCheckBig | Primary / green | Marks load as COMPLETED | Status DELIVERED, POD uploaded | Yes -- "Mark as completed?" |

### Quick Actions (Right Panel)

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| Add Check Call | PhoneCall | Opens check call entry modal: type dropdown, location, notes, ETA update | Status DISPATCHED through AT_DELIVERY |
| Contact Driver | Phone | Opens driver contact options: Call (tel: link), SMS (sms: link with pre-filled text), In-App Message | Carrier assigned, driver phone available |
| Share Tracking | Share | Generates shareable tracking URL, copies to clipboard, option to email to customer | Any active status |
| Update ETA | Clock | Opens ETA update modal: new ETA datetime + reason dropdown | Status IN_TRANSIT |
| View on Map | Map | Opens full Tracking Map filtered to this load | Status DISPATCHED through AT_DELIVERY |
| Print | Printer | Opens print dialog with formatted load summary | Always |
| Report Exception | AlertTriangle | Opens exception report modal: type, description, severity | Status DISPATCHED through AT_DELIVERY |

### Bulk Actions

N/A -- single record detail screen.

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + Shift + C | Open "Add Check Call" modal |
| Ctrl/Cmd + Shift + D | Open driver contact options |
| Ctrl/Cmd + P | Print load summary |
| 1 / 2 / 3 / 4 / 5 | Switch to tab 1 (Route) / 2 (Carrier) / 3 (Docs) / 4 (Timeline) / 5 (Check Calls) |
| Escape | Close any open modal |
| Ctrl/Cmd + Left Arrow | Navigate to previous load (based on list order) |
| Ctrl/Cmd + Right Arrow | Navigate to next load (based on list order) |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| Document file (from desktop) | Documents tab upload area | Uploads document and attaches to load |
| N/A (no intra-page DnD) | N/A | N/A |

---

## 8. Real-Time Features

### WebSocket Events

This screen is classified as **Enhanced Real-Time** in the real-time feature map. Subscribes to events for this specific load.

| Event Name | Payload | UI Update |
|---|---|---|
| load:status:changed | { loadId, previousStatus, newStatus, changedBy, timestamp } | Status badge in header updates. Timeline tab appends new event. If status involves a stop (AT_PICKUP, AT_DELIVERY), stop card status updates. Action buttons recalculate based on new status. Flash highlight on status badge. |
| load:assigned | { loadId, carrierId, carrierName, driverId, driverName } | Carrier name in header updates. Carrier & Rate tab refreshes carrier info card and driver info. Timeline appends event. |
| load:location:updated | { loadId, lat, lng, city, state, speed, heading, timestamp } | Tracking card: map marker moves to new position (animated). "Last Location" text updates. "Location Freshness" timer resets. If ETA recalculates, ETA countdown updates. |
| load:eta:updated | { loadId, stopId, previousEta, newEta, reason } | ETA in tracking card updates. Countdown timer resets. If overdue, turns red. Timeline appends event if significant change (>30min). |
| checkcall:received | { loadId, checkCallId, type, location, notes, timestamp, source } | Check Calls tab: new check call prepends to list with subtle slide-in animation. Timeline tab appends event. If check call contains location, tracking card updates. |
| stop:arrived | { loadId, stopId, arrivedAt, geofenceTriggered } | Route & Stops tab: stop card status changes to ARRIVED. Dwell time timer starts (visible live counter). Timeline appends event. |
| stop:departed | { loadId, stopId, departedAt } | Route & Stops tab: stop card status changes to COMPLETED. Dwell time finalizes. Timeline appends event. |

### Live Update Behavior

- **Update frequency:** All events for this specific load are delivered instantly via WebSocket (the client joins room `load:{loadId}` on mount and leaves on unmount).
- **Location updates:** Throttled to max 1 per 15 seconds on detail view. Map marker animates smoothly between positions.
- **Visual indicator:** Changed sections flash with subtle blue highlight. New timeline/check-call entries slide in from top.
- **Conflict handling:** If user has a modal open (check call entry, ETA update, etc.) and the load's status changes remotely, show a non-blocking banner above the modal: "Load status was updated to [new status] by [user]. Your action may need to be revised."
- **Tab badge counts:** If a new check call arrives while the user is on a different tab, the "Check Calls" tab shows a small blue dot notification badge.

### Polling Fallback

- **When:** WebSocket connection to `/dispatch` or `/tracking` namespace drops.
- **Interval:** Every 30 seconds for load data, every 15 seconds for location data.
- **Endpoint:** GET /api/loads/:id?include=timeline,checkCalls,location
- **Visual indicator:** "Live tracking paused -- updating every 30s" text in the tracking card.

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Add check call | Check call immediately appears in Check Calls tab with "Sending..." indicator | Remove check call entry; show error toast |
| Change status (dispatch, confirm pickup, etc.) | Status badge updates immediately; action buttons recalculate | Revert badge; restore previous buttons; show error toast with reason |
| Upload document | Document appears in Documents tab with upload progress bar | Remove document entry; show error toast |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| PageHeader | src/components/ui/PageHeader.tsx | breadcrumbs, title (load#), status badge, action buttons |
| Badge | src/components/ui/badge.tsx | Status badges (load status, stop status, stop type, check call type, document status) |
| Card | src/components/ui/card.tsx | Summary card, tracking card, carrier card, stop cards, document cards |
| Tabs | src/components/ui/tabs.tsx | 5 tabs: Route, Carrier, Documents, Timeline, Check Calls |
| Button | src/components/ui/button.tsx | All action buttons |
| DropdownMenu | src/components/ui/dropdown-menu.tsx | Actions dropdown, more menus |
| Dialog | src/components/ui/dialog.tsx | Check call modal, ETA update modal, confirmation modals |
| Tooltip | src/components/ui/tooltip.tsx | Equipment icon labels, field explanations |
| ScrollArea | src/components/ui/scroll-area.tsx | Scrollable tab content, timeline |
| Separator | src/components/ui/separator.tsx | Section dividers |
| Skeleton | src/components/ui/skeleton.tsx | Loading skeletons for each panel |
| ActivityTimeline | src/components/crm/activities/activity-timeline.tsx | Pattern for timeline display (adapt for load events) |
| RouteMap | src/components/load-planner/route-map.tsx | Map component for route display |
| UniversalDropzone | src/components/load-planner/UniversalDropzone.tsx | Document upload drag-and-drop |
| ConfirmDialog | src/components/shared/confirm-dialog.tsx | Status change confirmations |
| PhoneInput | src/components/crm/shared/phone-input.tsx | Driver phone display |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| RouteMap | Basic route visualization | Add animated GPS marker, marker clustering, stop markers with status indicators, click-to-expand to full Tracking Map |
| ActivityTimeline | CRM activity timeline | Adapt for load events: different event types (status change, check call, document, assignment), filter by event type |
| Badge | Generic badge | Need LoadStatusBadge, StopStatusBadge, CheckCallTypeBadge wrappers that auto-apply correct colors and icons |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| LoadSummaryCard | Left panel summary card: origin/dest with route line, dates, equipment icon, miles/weight, linked order/customer | Medium |
| TrackingCard | Right panel: embedded map snippet, last location, ETA countdown (live timer), next stop, speed, quick actions | Complex |
| StopTimeline | Vertical visual timeline of stops: numbered circles with connecting lines, stop cards inline, status badges, arrival/departure times, dwell time | Complex |
| StopCard | Individual stop display: type badge, facility, address, appointment, actual times, dwell time, contact, instructions | Medium |
| RateBreakdown | Two-column rate display: customer side vs carrier side, with accessorial rows, totals, and margin calculation | Medium |
| CarrierInfoCard | Carrier display: name, MC#, DOT#, contact info, scorecard mini-summary | Medium |
| DriverInfoCard | Driver display: name, phone (click to call/SMS), truck#, trailer# | Small |
| DocumentCard | Document card with thumbnail, name, status badge (draft/sent/signed/uploaded), view/download actions | Medium |
| InlineDocViewer | Modal-based document viewer: PDF rendering (pdf.js), image zoom/pan, multi-page navigation | Complex |
| LoadTimeline | Chronological event list: icon + timestamp + description + actor. Filterable by event type. Color-coded. | Medium |
| CheckCallCard | Check call display: type badge, timestamp, location, notes, reporter. | Small |
| CheckCallEntryModal | Modal form: type dropdown (CHECK_CALL, ARRIVAL, DEPARTURE, DELAY, ISSUE), location, notes textarea, optional ETA update | Medium |
| ETAUpdateModal | Modal: new ETA datetime picker + reason dropdown (traffic, weather, mechanical, shipper delay, other) | Small |
| DetentionTimer | Live counter that starts when stop arrives and shows running dwell time. Alert badge at free-time threshold. | Small |
| ETACountdown | Live countdown component: "Xd Xh Xm" with color urgency. Updates every minute. | Small |
| ShareTrackingModal | Modal: generates tracking URL, shows preview, copy-to-clipboard button, email-to-customer option | Small |
| StatusActionBar | Dynamic action button bar that shows only valid actions for current load status | Medium |
| CarrierScorecardMini | Compact scorecard: on-time %, loads completed, claims rate as 3 inline metrics | Small |
| LaneHistoryPanel | Shows last 5 loads on same lane: carrier, rate, on-time status. For rate benchmarking. | Medium |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Resizable | resizable | Three-column layout with resizable panels |
| Hover Card | hover-card | Carrier preview on hover, stop detail preview |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/loads/:id | Fetch complete load detail (includes stops, carrier, driver, basic rate) | useLoad(id) |
| 2 | GET | /api/loads/:id/timeline | Fetch load timeline events (paginated, newest first) | useLoadTimeline(id) |
| 3 | GET | /api/loads/:id/check-calls | Fetch check calls for this load | useLoadCheckCalls(id) |
| 4 | GET | /api/loads/:id/documents | Fetch documents attached to this load | useLoadDocuments(id) |
| 5 | GET | /api/loads/:id/location | Fetch latest GPS location for this load | useLoadLocation(id) |
| 6 | PATCH | /api/loads/:id/status | Update load status (dispatch, confirm pickup/delivery, complete) | useUpdateLoadStatus() |
| 7 | PATCH | /api/loads/:id/carrier | Assign or reassign carrier | useAssignCarrier() |
| 8 | PATCH | /api/loads/:id/driver | Update driver info (name, phone, truck#, trailer#) | useUpdateDriver() |
| 9 | PATCH | /api/loads/:id/eta | Update ETA with reason | useUpdateETA() |
| 10 | POST | /api/loads/:id/check-calls | Create a new check call | useCreateCheckCall() |
| 11 | POST | /api/loads/:id/documents | Upload a document | useUploadDocument() |
| 12 | DELETE | /api/loads/:id/documents/:docId | Delete a document | useDeleteDocument() |
| 13 | POST | /api/loads/:id/rate-confirmation/send | Send rate confirmation to carrier email | useSendRateConfirmation() |
| 14 | POST | /api/loads/:id/dispatch | Dispatch the load (sends dispatch notification + rate con) | useDispatchLoad() |
| 15 | POST | /api/loads/:id/tracking-link | Generate shareable tracking link | useGenerateTrackingLink() |
| 16 | GET | /api/loads/:id/lane-history | Fetch previous loads on same origin-dest lane | useLaneHistory(id) |
| 17 | GET | /api/carriers/:id/scorecard/summary | Fetch carrier scorecard summary for mini-view | useCarrierScorecardSummary(carrierId) |
| 18 | DELETE | /api/loads/:id | Delete load (PLANNING/PENDING only) | useDeleteLoad() |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| load:{loadId} | load:status:changed | useLoadDetailUpdates(loadId) -- updates status badge, refreshes actions, appends to timeline |
| load:{loadId} | load:assigned | useLoadDetailUpdates(loadId) -- updates carrier info card and driver info |
| load:{loadId} | load:location:updated | useLoadLocationStream(loadId) -- animates map marker, updates tracking card |
| load:{loadId} | load:eta:updated | useLoadDetailUpdates(loadId) -- updates ETA countdown |
| load:{loadId} | checkcall:received | useLoadDetailUpdates(loadId) -- prepends to check call list, appends to timeline |
| load:{loadId} | stop:arrived | useLoadDetailUpdates(loadId) -- updates stop card status, starts dwell timer |
| load:{loadId} | stop:departed | useLoadDetailUpdates(loadId) -- updates stop card status, finalizes dwell time |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 409 | 500 |
|---|---|---|---|---|---|---|
| GET /api/loads/:id | N/A | Redirect to login | Show "Access Denied" page with link to Loads List | Show "Load not found" page with link to Loads List | N/A | Show error state with retry |
| PATCH /api/loads/:id/status | Toast: "Invalid status transition: [reason]" | Redirect to login | Toast: "Permission denied" | Toast: "Load not found" | Toast: "Load was updated by another user. Refresh to see latest." | Toast: "Server error. Try again." |
| POST /api/loads/:id/check-calls | Toast: field validation errors | Redirect to login | Toast: "Permission denied" | Toast: "Load not found" | N/A | Toast: "Server error. Try again." |
| POST /api/loads/:id/documents | Toast: "File too large" or "Invalid file type" | Redirect to login | Toast: "Permission denied" | Toast: "Load not found" | N/A | Toast: "Upload failed. Try again." |

---

## 11. States & Edge Cases

### Loading State

- **Initial load:** Show page header with skeleton (gray bar for load#, skeleton badge). Left panel: skeleton card (6 skeleton lines). Center panel: tab bar visible but content area shows skeleton (4 skeleton blocks for stop cards). Right panel: skeleton map placeholder (gray rectangle) + 3 skeleton lines.
- **Tab switching:** When switching tabs, show tab-specific skeleton for 200ms while content loads. If content is already cached, show immediately.
- **Map loading:** Show gray placeholder with spinning indicator "Loading map..." while Google Maps JavaScript API initializes.
- **Document thumbnails:** Show skeleton rectangles matching document card dimensions while thumbnails load.
- **Duration threshold:** If load data takes >3 seconds, show "Loading load details..." message.

### Empty States

**No check calls:**
- Check Calls tab: icon + "No check calls yet" + "Add the first check call to start tracking this load." + "Add Check Call" button.

**No documents:**
- Documents tab: icon + "No documents attached" + "Upload rate confirmation, BOL, POD, or other documents." + Upload dropzone area.

**No timeline events:**
- Timeline tab: "No events recorded yet. Events will appear here as the load progresses."

**No tracking data:**
- Tracking card: gray map placeholder + "No tracking data available" + "Tracking begins when the load is dispatched and GPS data is received."

**No carrier assigned:**
- Header: "Unassigned" in red instead of carrier name.
- Carrier & Rate tab: "No carrier assigned yet" + "Assign Carrier" primary button.
- Driver sub-card: hidden entirely.

### Error States

**Full page error (load fetch fails):**
- Error icon + "Unable to load LD-2025-0847" + "This load may have been deleted, or there may be a server issue." + "Retry" button + "Back to Loads List" link.

**Partial error (tab content fails):**
- Other panels load normally. Failed tab shows inline error: "Could not load [section name]" + "Retry" link.

**Map error (Google Maps fails):**
- Tracking card map area: "Map unavailable" with retry link. Show text-only location info.

**Action error:**
- Toast: red background, error icon, specific message. Auto-dismiss 8 seconds.

### Permission Denied

- **Full page denied:** "You don't have permission to view load details" + link to Loads List.
- **Partial denied:** Financial fields show "--" for users without `finance_view`. Driver contact hidden for users without `driver_view`. Action buttons hidden per role (see Section 5). No disabled buttons -- hidden entirely if the user cannot act.

### Offline / Degraded

- **Full offline:** Banner: "You're offline. Showing cached data from [timestamp]." Read-only mode -- all action buttons disabled. Map shows last cached position.
- **WebSocket down:** "Live tracking paused" indicator. Data refreshes via polling at 30s intervals. Actions still work (REST API).
- **GPS data stale (>8 hours):** Tracking card shows red freshness indicator: "Last update 8h ago -- tracking may be offline." Map marker has red pulse animation.

---

## 12. Filters, Search & Sort

### Filters

N/A -- this is a single-record detail screen. No list filters.

### Search Behavior

N/A -- no search on detail screen. Global search (Ctrl+K) can find this load from anywhere.

### Sort Options

**Timeline tab:** Events sorted newest-first by default. Toggle to oldest-first for chronological review.

**Check Calls tab:** Check calls sorted newest-first by default. No other sort options.

**Documents tab:** Documents sorted by upload date (newest first). Can group by type (Rate Con, BOL, POD, Other).

### Saved Filters / Presets

N/A -- detail screen.

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Three-column layout collapses to two columns: summary + tracking combined as top section (full-width), tabbed content below (full-width).
- Load summary and tracking card sit side-by-side in the top section (50/50 split).
- Quick action buttons from the right panel move to a horizontal bar below the tracking card.
- Tabs remain full-width. Tab content scrolls vertically.
- Route map in Stops tab: full-width below stop cards.
- Document upload: full-width dropzone.

### Mobile (< 768px)

- Single-column layout. Everything stacks vertically.
- Header: load# + status badge on first line. Carrier name on second line. Actions in hamburger dropdown (three dots).
- Summary card: condensed. Origin > Dest on one line. Pickup/Delivery dates on one line. Equipment + miles on one line.
- Tracking card: full-width. Map snippet at 100% width, ~150px height. ETA and location below map.
- Tabs: horizontal scrollable tab bar (swipe to see all 5 tabs). Active tab content below.
- Stop cards: full-width, stacked vertically. Simplified: facility + date + status badge only. Tap to expand details.
- Rate breakdown: stacked vertically (customer rate above, carrier rate below, margin at bottom).
- Documents: list view with small thumbnails. Tap to open in full-screen viewer.
- Quick actions: sticky bottom bar with primary action button (context-dependent) + "More" overflow menu.
- "Contact Driver" opens native phone dialer or SMS app.
- Pull-to-refresh to reload load data.

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full 3-column layout (25/50/25) |
| Desktop | 1024px - 1439px | 3-column with narrower side panels (20/55/25) |
| Tablet | 768px - 1023px | 2 sections: summary+tracking top, tabs bottom |
| Mobile | < 768px | Single column, stacked, condensed cards |

---

## 14. Stitch Prompt

```
Design a load detail page for a modern freight/logistics TMS (Transportation Management System) called "Ultra TMS." This is the most information-dense screen in the system.

Layout: Full-width content area. At top, breadcrumb "Operations > Loads > LD-2025-0847". Below, a header bar with: load number "LD-2025-0847" in large bold monospace, a sky-blue status badge "In Transit" with truck icon, carrier name "Swift Transport" as a blue link, and on the right: "Edit" outline button and "Actions" dropdown button.

Below header, a 3-column layout:

LEFT COLUMN (25%): "Load Summary" card with white background, subtle border.
- Route display: "Chicago, IL" with blue circle marker, vertical dashed line, "Dallas, TX" with green circle marker
- "Pickup: Jan 15, 2025 8:00 AM" (normal text)
- "Delivery: Jan 17, 2025 2:00 PM" (bold, as upcoming)
- Separator line
- "Equipment: Dry Van" with container icon
- "Miles: 924 mi"
- "Weight: 42,000 lbs"
- "Commodity: Electronics - Consumer"
- Separator line
- "Order: ORD-2025-0412" as blue link
- "Customer: Acme Manufacturing Co." as blue link
- Priority badge: "Medium" in amber

RIGHT COLUMN (25%): "Tracking" card.
- Embedded map showing a route from Chicago to Dallas with a blue truck marker currently near Memphis, TN (about 60% along the route)
- Below map: "Last Location" section: map-pin icon + "Memphis, TN" + green dot + "2h ago"
- "Current Speed: 62 mph"
- "ETA" section: "Jan 17, 2:30 PM" in text-lg + countdown "14h 22m remaining" in blue-600 text
- "Next Stop: Dallas Distribution Center - Dallas, TX"
- Separator
- "Quick Actions" section with 4 compact buttons stacked vertically:
  - "Add Check Call" with phone icon (primary outline)
  - "Contact Driver" with phone icon (secondary)
  - "Share Tracking" with share icon (secondary)
  - "Update ETA" with clock icon (secondary)

CENTER COLUMN (50%): Tabbed content area.
Show 5 tabs: "Route & Stops" (ACTIVE), "Carrier & Rate", "Documents", "Timeline", "Check Calls"

Active tab "Route & Stops" content:
- A vertical stop timeline with 2 stops:
  Stop 1 (completed): Blue filled circle with "1" + "PICKUP" blue badge
    "Acme Manufacturing - Chicago, IL"
    "123 Industrial Blvd, Chicago, IL 60601"
    "Jan 15, 8:00 - 10:00 AM"
    Status: "Completed" green badge
    "Arrived: 7:45 AM" (green text, early)
    "Departed: 9:30 AM"
    "Dwell: 1h 45m" (normal, under threshold)
  Connecting dashed line between stops
  Stop 2 (pending): Green outlined circle with "2" + "DELIVERY" green badge
    "Southwest Logistics Hub - Dallas, TX"
    "456 Commerce St, Dallas, TX 75201"
    "Jan 17, 2:00 - 4:00 PM"
    Status: "En Route" blue badge
    ETA: "Jan 17, 2:30 PM"
- Below stops: embedded route map (full width of center column) showing the complete route with stop markers and current truck position

Design Specifications:
- Font: Inter, 14px base, 20px load number, 12px secondary text
- Cards: white bg, rounded-lg, border slate-200, p-4
- Map: rounded-lg, border, 100% width in center column, ~200px height in tracking card
- Status badges: pill-shaped, per load status color system (sky-blue for In Transit)
- Stop timeline: vertical line connecting circles, completed stops = filled circles, pending = outlined
- Tab bar: underline style, blue-600 active, gray-500 inactive
- Quick action buttons: full-width, left-aligned icon, compact (h-9), rounded-md
- ETA countdown: text-lg, font-semibold, blue-600 color
- Links: text-blue-600, hover underline
- Separator: slate-200 horizontal line
- Modern SaaS aesthetic similar to Linear.app or Notion
- Real-time feel: the truck marker on both maps should feel like it represents a live, moving vehicle
```

---

## 15. Enhancement Opportunities

### Current State (Wave 2)

**What's built and working:**
- [ ] Nothing -- 0 screens built. All API endpoints exist.

**What needs polish / bug fixes:**
- [ ] N/A (not yet built)

**What to add this wave:**
- [ ] 3-column layout with summary, tabs, tracking panels
- [ ] Header with load#, status badge, carrier, dynamic action buttons
- [ ] Load summary card with all key fields
- [ ] Tracking card with map snippet, last location, ETA countdown
- [ ] Route & Stops tab with visual stop timeline and route map
- [ ] Carrier & Rate tab with carrier info, driver info, rate breakdown
- [ ] Documents tab with upload, preview, status badges
- [ ] Timeline tab with chronological event log
- [ ] Check Calls tab with entry modal
- [ ] Status-dependent action buttons (12-state matrix)
- [ ] WebSocket real-time updates for status, location, check calls
- [ ] Document upload (drag-and-drop)

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| 3-column layout with all panels | High | High | P0 |
| Status-dependent action buttons | High | Medium | P0 |
| Route & Stops tab with visual timeline | High | High | P0 |
| Tracking card with map and ETA countdown | High | High | P0 |
| Carrier & Rate tab with margin display | High | Medium | P0 |
| WebSocket real-time updates | High | Medium | P0 |
| Documents tab with upload | High | Medium | P0 |
| Timeline tab | Medium | Medium | P0 |
| Check Calls tab with entry modal | High | Medium | P0 |
| Inline document preview (PDF/image) | Medium | High | P1 |
| Detention time auto-calculator | Medium | Medium | P1 |
| Share tracking link | Medium | Low | P1 |
| Contact Driver (call/SMS) | Medium | Low | P1 |
| Lane history panel | Low | Medium | P2 |
| Carrier scorecard mini-view | Low | Medium | P2 |
| Weather at stops | Low | Medium | P3 |
| Google Maps directions link for driver | Low | Low | P2 |
| Print formatted load summary | Low | Low | P2 |

### Future Wave Preview

- **Wave 3:** Integration with ELD providers for automatic GPS data ingestion. Geofence auto-detection for stop arrivals/departures. AI-generated exception summaries ("Load is 2h behind schedule due to weather in Memphis. Recommend notifying customer and adjusting ETA."). Carrier portal view of this load (carrier sees their version with limited data).
- **Wave 4:** Customer portal tracking view (simplified, no internal data). Automated detention billing integration. Photo documentation at each stop (driver uploads via app, viewable here). Multi-load consolidation view (see all loads on same truck).

---

<!--
TEMPLATE USAGE NOTES:
1. This is the most information-dense screen in Ultra TMS, designed for maximum dispatcher efficiency.
2. The 12-state load status machine is fully mapped with per-status actions in Section 6.
3. Real-time features are comprehensive: WebSocket for status, location, check calls, and stop events.
4. The 3-column layout is optimized for 1440px+ desktop. Responsive breakdowns are detailed.
5. All references to status colors match status-color-system.md Section 3 (Load Statuses).
6. Role-based visibility follows 06-role-based-views.md for financial data and action permissions.
7. The Stitch prompt focuses on the Route & Stops tab as the most visually complex tab.
8. This screen references the Load entity (58 fields), Stop entity, Check Call entity, and Document entity.
-->
