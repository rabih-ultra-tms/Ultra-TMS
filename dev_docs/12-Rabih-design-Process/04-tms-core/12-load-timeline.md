# Load Timeline

> Service: TMS Core (Service 04) | Wave: 2 | Priority: P1
> Route: /(dashboard)/loads/[id]/timeline | Status: Not Started
> Primary Personas: Maria (Dispatcher), Sarah (Ops Manager)
> Roles with Access: dispatcher, ops_manager, admin, finance (read-only)

---

## 1. Purpose & Business Context

**What this screen does:**
Renders a comprehensive, chronological visual timeline of every event that has occurred on a load from the moment it was created through final completion and invoicing. Each event appears as a card on a vertical timeline, giving dispatchers and operations managers an instant, scrollable audit trail of the load's entire lifecycle -- who did what, when, where, and why.

**Business problem it solves:**
In freight brokerage, loads touch 5-15 different people across their lifecycle. When a customer calls asking "what happened to my shipment?", dispatchers currently have to piece together information from check call logs, status history tables, document upload records, and email threads. This screen consolidates every touchpoint into a single, chronological narrative. Sarah (Ops Manager) uses it during customer escalations to reconstruct exactly what happened, minute by minute, so she can give accurate answers. Maria (Dispatcher) uses it to quickly orient herself when picking up a load mid-shift or during a handoff from the night team. Without this screen, reconstructing a load's history takes 10-15 minutes of clicking through 4-5 different tabs. With it, the answer is visible in 3 seconds of scrolling.

**Key business rules:**
- Every status transition, check call, document upload, stop event, carrier assignment, and exception must appear on the timeline -- nothing is excluded from the audit trail.
- Timeline events are immutable once created -- users cannot delete or edit past events (audit compliance). Only notes can be appended to existing events.
- Events sourced from automated systems (GPS auto-check-calls, ELD data, system status transitions) must be visually distinguished from manual human entries.
- Rate and revenue information on the timeline is only visible to users with the `finance_view` permission. Dispatchers see operational events but not dollar amounts.
- The timeline must show the full chain of custody: which user performed each action, including system-triggered automations attributed to "System."

**Success metric:**
Average time to answer a customer "what happened?" inquiry drops from 12 minutes to under 30 seconds. Sarah reports eliminating 90% of her time spent reconstructing load histories during escalation calls.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Load Detail | Click "Timeline" tab or "View Full Timeline" link | `loadId` via route param |
| Loads List | Click load row, then navigate to Timeline tab | `loadId` via route param |
| Dispatch Board | Click load card > "View Timeline" in context menu | `loadId` via route param |
| Tracking Map | Click load marker > "Timeline" link in popover | `loadId` via route param |
| Check Calls | Click "View Full Timeline" link on a check call entry | `loadId` via route param, `scrollTo=checkCallId` |
| Notification Center | Click "Load status changed" notification | `loadId` via route param, `scrollTo=eventId` |
| Direct URL | Bookmark / shared link | `loadId` via route param, optional `scrollTo` query param |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Load Detail | Click "Back to Load" breadcrumb or load# header link | `loadId` |
| Check Calls | Click "Log Check Call" button in timeline header | `loadId` |
| Carrier Detail | Click carrier name link on carrier assignment event | `carrierId` |
| Document Viewer | Click document thumbnail/link on upload event | `documentId` |
| Tracking Map | Click "View on Map" link on a location event | `loadId`, `timestamp` for historical playback |
| Stop Management | Click a stop event card to view/edit stop details | `loadId`, `stopId` |
| Status Updates | Click "Update Status" button in timeline header | `loadId` |
| Communication Hub | Click "Contact" links (driver phone, customer email) on events | Pre-filled contact context |
| Print Preview | Click "Print Timeline" button | Full timeline data rendered for print |

**Primary trigger:**
Maria clicks the "Timeline" tab on the Load Detail page when she needs to understand the full history of a load -- typically during a customer inquiry, shift handoff, or when investigating a service failure. Sarah navigates here during escalations when she needs a minute-by-minute reconstruction of what happened.

**Success criteria (user completes the screen when):**
- User has identified the specific event or sequence of events they were looking for (e.g., "When did the driver arrive at the shipper?" or "Who changed the status to Delivered?").
- User has shared the timeline (via print or screenshot) with a customer or internal stakeholder to explain the load's history.
- User has confirmed that planned vs. actual timing is within SLA thresholds.

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------+
|  Breadcrumb: Loads > FM-2025-0847 > Timeline                     |
+------------------------------------------------------------------+
|  Load Header Bar                                                  |
|  [Load# FM-2025-0847] [Status Badge: IN_TRANSIT] [Carrier: Swift] |
|  [Route: Chicago, IL --> Dallas, TX] [Equipment: Dry Van]         |
|  [Customer: Acme Mfg] [PU: Jan 15 8:00 AM] [DEL: Jan 16 2:00 PM]|
|  Actions: [Log Check Call] [Update Status] [Print Timeline] [..] |
+------------------------------------------------------------------+
|  Planned vs Actual Summary Bar (collapsible)                      |
|  PU Planned: Jan 15 8:00 AM | PU Actual: Jan 15 8:22 AM | +22m  |
|  DEL Planned: Jan 16 2:00 PM | DEL ETA: Jan 16 1:45 PM | -15m   |
|  [SLA: ON TIME badge green] [Total Transit: 29h 23m]             |
+------------------------------------------------------------------+
|  Filter/Controls Bar                                              |
|  [Filter: All Events v] [Jump To: select event v] [Collapse All] |
+------------------------------------------------------------------+
|                                                                    |
|  +---------- Vertical Timeline (center spine) ----------------+  |
|  |                                                              |  |
|  |  Jan 14, 2025 3:22 PM                                       |  |
|  |  O---- [CARD: Load Created]                                  |  |
|  |  |     Created by Maria R. | From Order #ORD-2025-1234      |  |
|  |  |     Customer: Acme Manufacturing                          |  |
|  |  |                                                           |  |
|  |  |  Jan 14, 2025 3:25 PM                                    |  |
|  |  |  ----O [CARD: Order Linked]                               |  |
|  |  |       Order #ORD-2025-1234 linked | PO# AC-99102          |  |
|  |  |                                                           |  |
|  |  |  Jan 14, 2025 4:10 PM                                    |  |
|  |  O---- [CARD: Carrier Assigned]                              |  |
|  |  |     Swift Transport (MC# 123456)                          |  |
|  |  |     Rate: $2,450.00 | Assigned by Maria R.               |  |
|  |  |                                                           |  |
|  |  |  Jan 14, 2025 4:12 PM                                    |  |
|  |  |  ----O [CARD: Rate Confirmation Sent]                     |  |
|  |  |       Sent to dispatch@swift.com | DocID: RC-2025-0847    |  |
|  |  |                                                           |  |
|  |  |  Jan 14, 2025 5:45 PM                                    |  |
|  |  O---- [CARD: Rate Confirmation Signed]                      |  |
|  |  |     Signed by John Smith (Swift) | [View Document]        |  |
|  |  |                                                           |  |
|  |  |  Jan 15, 2025 6:30 AM                                    |  |
|  |  |  ----O [CARD: Dispatched]                                 |  |
|  |  |       Driver: Carlos M. | Phone: (555) 123-4567          |  |
|  |  |       Truck# 4521 | Trailer# T-8890                      |  |
|  |  |                                                           |  |
|  |  |  Jan 15, 2025 7:45 AM              +--Mini Map--+         |  |
|  |  O---- [CARD: Check Call]             | [pin icon] |         |  |
|  |  |     Location: Joliet, IL           | on I-55     |         |  |
|  |  |     ETA: Jan 15 8:15 AM            +------------+         |  |
|  |  |     "Driver 15 min out, no issues"                        |  |
|  |  |     Logged by Maria R. | [+2h 15m since last event]      |  |
|  |  |                                                           |  |
|  |  |  Jan 15, 2025 8:22 AM                                    |  |
|  |  |  ----O [CARD: Arrived at Pickup - Stop 1]                 |  |
|  |  |       Acme Warehouse, Chicago, IL                         |  |
|  |  |       Appointment: 8:00 AM | Arrived: 8:22 AM             |  |
|  |  |       [LATE: +22 minutes] [orange badge]                  |  |
|  |  |                                                           |  |
|  |  |  ... (more events) ...                                    |  |
|  |  |                                                           |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible, above the fold) | Load header (load#, status badge, carrier, route, customer), SLA compliance bar (planned vs actual with on-time/late indicators) | Dispatchers need instant context about which load they are viewing and whether it is on track before scrolling into the event history |
| **Secondary** (visible, prominent on each card) | Event timestamp (relative + absolute), event type with color-coded icon, event title, actor who performed the action | Each timeline card must be scannable in under 2 seconds -- the eye should hit the icon color, then the title, then the timestamp |
| **Tertiary** (available on expand/hover) | Event details (check call notes, document preview thumbnails, mini-map pin for location events, duration between events), rate/financial information (permission-gated) | These details are needed for investigation but not for quick scanning -- expandable keeps the timeline compact |
| **Hidden** (behind a click -- modal, drawer, or navigation) | Full document viewer (PDFs, images), carrier detail page, complete check call form, historical map playback of driver route | Deep detail that requires a dedicated view -- clicking a link on a timeline card navigates to the full resource |

---

## 4. Data Fields & Display

### Visible Fields

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Load Number | Load.loadNumber | FM-2025-XXXX, monospace font, clickable link to Load Detail | Load header bar, top-left |
| 2 | Load Status | Load.status | StatusBadge component using LOAD_STATUS colors | Load header bar, next to load number |
| 3 | Carrier Name | Load.carrier.name | Plain text, clickable link to Carrier Detail | Load header bar |
| 4 | Route | Load.stops[0].city + stops[last].city | "Chicago, IL -> Dallas, TX" with arrow icon | Load header bar |
| 5 | Customer Name | Load.order.customer.name | Plain text, clickable link to Company Detail | Load header bar |
| 6 | Equipment Type | Load.equipmentType | Badge using EQUIPMENT_TYPE colors | Load header bar |
| 7 | Pickup Appointment | Load.stops[0].appointmentDate | "Jan 15, 8:00 AM" | Load header bar / SLA bar |
| 8 | Delivery Appointment | Load.stops[last].appointmentDate | "Jan 16, 2:00 PM" | Load header bar / SLA bar |
| 9 | Event Timestamp | TimelineEvent.createdAt | Relative ("2h 15m ago") with absolute on hover ("Jan 15, 2025 7:45:22 AM CST") | Timeline card, left of card |
| 10 | Event Type Icon | TimelineEvent.eventType | Color-coded Lucide icon (see Event Type table below) | Timeline card, on the timeline spine dot |
| 11 | Event Title | TimelineEvent.title | Bold text, 14px, e.g., "Carrier Assigned" or "Check Call - Delay" | Timeline card header |
| 12 | Event Details | TimelineEvent.details | Expandable text area. Check calls show location, ETA, notes. Status changes show old -> new. Document uploads show filename + thumbnail | Timeline card body |
| 13 | Actor | TimelineEvent.createdBy.name | "Maria R." or "System (Auto)" with avatar | Timeline card footer |
| 14 | Duration Since Previous | Calculated | "2h 15m since last event" in muted text | Timeline card footer |
| 15 | Location | TimelineEvent.location (city, state, lat, lng) | "Joliet, IL" with mini-map thumbnail for GPS events | Timeline card, right side (location events only) |
| 16 | SLA Indicator | Calculated from appointment vs actual | Green checkmark "On Time" or red clock "Late by Xm" badge | Stop event cards and SLA summary bar |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Pickup Variance | stops[0].actualArrival - stops[0].appointmentDate | "+22m late" in orange/red or "-15m early" in green. Zero = "On time" in green |
| 2 | Delivery Variance | stops[last].actualArrival - stops[last].appointmentDate | Same format as pickup variance |
| 3 | Total Transit Time | stops[last].departedAt - stops[0].departedAt | "29h 23m" or "1d 5h 23m" for multi-day |
| 4 | Dwell Time at Stop | stop.departedAt - stop.arrivedAt | "2h 15m at pickup facility" -- shown on stop departure events |
| 5 | Time Between Events | event[n].createdAt - event[n-1].createdAt | "2h 15m since last event" in muted gray. Red if > 4 hours (indicates check call gap) |
| 6 | SLA Compliance | Both pickup and delivery on time? | Green "SLA MET" or Red "SLA MISSED" badge in summary bar |
| 7 | Check Call Gap Alert | Max time between consecutive check calls for this load | If any gap > 4 hours during in-transit, show orange warning in summary |
| 8 | Relative Timestamp | event.createdAt vs now() | "2 hours ago", "Yesterday at 3:22 PM", "Jan 14 at 3:22 PM" |

### Event Type Mapping

| Event Type | Icon (Lucide) | Color | Badge Variant |
|---|---|---|---|
| load_created | `FilePlus` | Slate #64748B | secondary |
| order_linked | `Link` | Blue #3B82F6 | info |
| carrier_assigned | `Truck` | Indigo #6366F1 | default |
| rate_con_sent | `Send` | Blue #3B82F6 | info |
| rate_con_signed | `FileCheck` | Green #10B981 | success |
| dispatched | `Navigation` | Indigo #6366F1 | default |
| check_call | `PhoneCall` | Blue #3B82F6 | info |
| check_call_delay | `Timer` | Amber #F59E0B | warning |
| check_call_issue | `AlertTriangle` | Red #EF4444 | destructive |
| stop_en_route | `Navigation` | Blue #3B82F6 | info |
| stop_arrived | `MapPin` | Amber #F59E0B | warning |
| stop_loading | `ArrowUpFromLine` | Indigo #6366F1 | default |
| stop_unloading | `ArrowDownToLine` | Cyan #06B6D4 | info |
| stop_departed | `MoveRight` | Indigo #6366F1 | default |
| status_changed | `RefreshCw` | Purple #8B5CF6 | outline |
| document_uploaded | `FileUp` | Teal #14B8A6 | info |
| exception_created | `AlertOctagon` | Red #EF4444 | destructive |
| exception_resolved | `CheckCircle` | Green #10B981 | success |
| load_completed | `CircleCheckBig` | Green #10B981 | success |
| note_added | `StickyNote` | Amber #F59E0B | warning |
| gps_auto_update | `Satellite` | Cyan #06B6D4 | info |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] Render vertical timeline with chronologically ordered event cards for all events on a load
- [ ] Display event type icons with color coding per the Event Type Mapping table
- [ ] Show relative timestamps ("2h ago") with absolute timestamps on hover tooltip
- [ ] Expandable/collapsible detail sections on each timeline card (default: collapsed for check calls and GPS events, expanded for status changes and stop events)
- [ ] Load header bar with load#, status badge, carrier, route, customer, equipment type
- [ ] SLA compliance summary bar showing planned vs actual pickup/delivery times with variance
- [ ] Duration between events displayed on each card ("2h 15m since last event")
- [ ] Actor attribution on every event (user name + avatar, or "System" for automated events)
- [ ] Click-through navigation from timeline events to related screens (carrier detail, document viewer, etc.)
- [ ] Mini-map thumbnail on location events (check calls with GPS, stop arrivals) showing pin on a static map tile
- [ ] Infinite scroll or paginated loading for loads with 50+ events

### Advanced Features (Logistics Expert Recommendations)

- [ ] Filter timeline by event type: "All Events", "Status Changes Only", "Check Calls Only", "Stop Events Only", "Documents Only", "Exceptions Only"
- [ ] "Jump To" dropdown with key milestones: "Load Created", "Dispatched", "Pickup", "Delivery", "Completed" -- scrolls to that event
- [ ] Collapse/expand all toggle: collapse all cards to show just icons + titles (compact view) or expand all to show full details
- [ ] Print timeline as a formatted PDF report (includes load header, all events, SLA summary) -- used by Sarah for customer escalation documentation
- [ ] Planned vs Actual schedule comparison overlay: shows a faint "expected" timeline alongside actual events, highlighting deviations
- [ ] Dwell time calculation at each facility (arrived to departed duration) displayed as a badge on stop departure events
- [ ] Check call gap detection: if more than 4 hours pass between check calls during in-transit status, show a warning indicator on the timeline between those events
- [ ] GPS auto-update events shown as smaller, more compact "breadcrumb" dots that can be expanded, preventing GPS noise from overwhelming manual events
- [ ] Historical map playback: click "View Route" to see an animated playback of the driver's GPS trail on the Tracking Map
- [ ] Timeline sharing: generate a shareable read-only link (expiring in 24h) that external users (customers) can view without logging in
- [ ] Side-by-side comparison: compare two loads' timelines (useful for recurring lane analysis)
- [ ] Export timeline as JSON/CSV for integration with external systems

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| View rate/revenue on carrier assignment events | admin, finance | finance_view | Rate line hidden from card, all other event details visible |
| View margin information | admin, finance | finance_view | Margin calculation hidden |
| Print timeline report | dispatcher, ops_manager, admin | timeline_print | Print button hidden |
| Share timeline externally | ops_manager, admin | timeline_share | Share button hidden |
| View all events (including other users' notes) | dispatcher, ops_manager, admin | timeline_view | Private notes from other dispatchers hidden, only own notes visible |
| Add notes to timeline events | dispatcher, ops_manager, admin | timeline_annotate | "Add Note" action not rendered on event cards |

---

## 6. Status & State Machine

The Load Timeline screen itself does not drive status transitions -- it is a read-only audit trail. However, it displays the full status history of the load. The status machine it visualizes is the Load Status flow:

### Status Transitions (Displayed on Timeline)

```
[PLANNING] ---(Submit)--> [PENDING]
    |                         |
    v                         v
[CANCELLED]             [TENDERED] ---(Carrier Accepts)--> [ACCEPTED]
                                                               |
                                                               v
                                                         [DISPATCHED]
                                                               |
                                                               v
                                                         [AT_PICKUP]
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
```

Each transition appears as a "status_changed" event on the timeline showing: old status -> new status, timestamp, and which user or system trigger caused the transition.

### Actions Available Per Status (on Timeline Screen)

| Status | Available Actions (Buttons in Header) | Restricted Actions |
|---|---|---|
| PLANNING | Log Check Call (disabled), Print Timeline | Update Status, Share |
| PENDING through DISPATCHED | Log Check Call, Update Status, Print Timeline | Share (ops_manager+ only) |
| AT_PICKUP through IN_TRANSIT | Log Check Call, Update Status, Print Timeline, View on Map | -- |
| AT_DELIVERY through DELIVERED | Log Check Call, Update Status, Print Timeline, View on Map | -- |
| COMPLETED | Print Timeline, Share, Export | Log Check Call (disabled), Update Status (disabled) |
| CANCELLED | Print Timeline, Export | All mutation actions disabled |

### Status Badge Colors

Uses `LOAD_STATUS` from the global status color system (`src/lib/status-colors.ts`). Each status change event on the timeline renders the old status as a small faded badge and the new status as a prominent badge with an arrow between them.

---

## 7. Actions & Interactions

### Primary Action Buttons (Top-Right of Load Header Bar)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| Log Check Call | `PhoneCall` | Primary / Blue | Navigates to Check Calls screen with this load pre-selected | No |
| Update Status | `RefreshCw` | Secondary / Outline | Opens status transition modal (only shows valid next statuses) | Yes -- "Change status from [current] to [new]?" |
| Print Timeline | `Printer` | Secondary / Outline | Generates print-formatted PDF of the full timeline | No |

### Secondary Actions (Dropdown / "More" Menu)

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| Share Timeline | `Share2` | Generates a shareable read-only link with 24h expiry | ops_manager+ only, load must not be in PLANNING/CANCELLED |
| Export as PDF | `Download` | Downloads the timeline as a formatted PDF document | Any authenticated user with timeline_view permission |
| Export as CSV | `FileSpreadsheet` | Downloads timeline events as CSV rows | Any authenticated user with export_data permission |
| View on Map | `Map` | Opens Tracking Map centered on this load's route with GPS trail | Load must have GPS data (at least one location event) |
| Compare Timelines | `GitCompare` | Opens side-by-side timeline comparison with another load | ops_manager+ only |

### Inline Card Actions

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| Expand / Collapse | `ChevronDown` / `ChevronUp` | Toggles the detail section of a timeline card | All cards with expandable content |
| View Document | `Eye` | Opens document in the Document Viewer | Document upload events only |
| View on Map | `MapPin` | Opens a map popover showing the exact GPS location of this event | Location events only (check calls with GPS, stop arrivals) |
| Add Note | `MessageSquarePlus` | Appends a note to this timeline event (opens inline text input) | dispatcher+ with timeline_annotate permission |
| Copy Event Link | `Link` | Copies a deep link URL that scrolls directly to this event | All events |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `J` / `ArrowDown` | Scroll to next timeline event |
| `K` / `ArrowUp` | Scroll to previous timeline event |
| `E` | Expand/collapse currently focused event card |
| `F` | Open filter dropdown |
| `P` | Print timeline |
| `Ctrl/Cmd + G` | Open "Jump To" milestone dropdown |
| `Escape` | Close any open popover/dropdown |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| N/A | -- | No drag-and-drop on this screen -- timeline is read-only |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| load.status.changed | { loadId, oldStatus, newStatus, updatedBy, timestamp } | Append new "status_changed" event card at the bottom of the timeline with a slide-in animation. Update the load header status badge. Flash the SLA bar if delivery ETA changed. |
| load.checkCall.created | { loadId, checkCallId, type, location, eta, notes, createdBy } | Append new check call card at the bottom. If the timeline is scrolled up, show a "New event" toast at the bottom with a "Scroll to latest" button. |
| load.document.uploaded | { loadId, documentId, documentType, fileName, uploadedBy } | Append new document upload card. Show thumbnail preview if image/PDF. |
| load.stop.statusChanged | { loadId, stopId, oldStatus, newStatus, timestamp } | Append new stop event card. Update SLA bar if it was a pickup arrival or delivery arrival (recalculate variance). |
| load.exception.created | { loadId, exceptionId, type, description, createdBy } | Append new exception card with red styling. Show a prominent toast: "Exception reported on Load FM-2025-0847." |
| load.carrier.assigned | { loadId, carrierId, carrierName, rate, assignedBy } | Append new carrier assignment card. Update load header carrier name. |
| load.eta.updated | { loadId, newEta, previousEta, reason, updatedBy } | Append new ETA update card. Recalculate delivery variance in SLA bar. If ETA is now past appointment, flash SLA bar red. |

### Live Update Behavior

- **Update frequency:** WebSocket push for all load-specific events. This screen subscribes to the channel `loads:{loadId}` on mount and unsubscribes on unmount.
- **Visual indicator:** New events slide in from the bottom with a subtle blue glow animation that fades over 3 seconds. If the user is scrolled up (not viewing the bottom), a floating pill appears at the bottom: "2 new events -- Click to scroll down."
- **Conflict handling:** Since the timeline is append-only and read-only, there are no editing conflicts. New events are simply appended regardless of scroll position.

### Polling Fallback

- **When:** WebSocket connection drops.
- **Interval:** Every 15 seconds.
- **Endpoint:** GET /api/loads/{loadId}/timeline?since={lastEventTimestamp}
- **Visual indicator:** Show subtle "Live updates paused -- reconnecting..." text below the filter bar in muted gray. Hide when WebSocket reconnects.

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Add note to event | Immediately show the note appended to the event card with a "Saving..." indicator | Remove the note, show error toast "Failed to save note. Please try again." |
| N/A (read-only screen) | Most actions navigate away from this screen | -- |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| StatusBadge | src/components/ui/status-badge.tsx | status: string, entity: StatusConfig map, size: 'sm' / 'md' |
| PageHeader | src/components/layout/page-header.tsx | title, breadcrumbs, actions |
| Avatar | src/components/ui/avatar.tsx | src, fallback, size: 'sm' / 'md' |
| Badge | src/components/ui/badge.tsx | variant: BadgeVariant, children |
| Tooltip | src/components/ui/tooltip.tsx | content, children |
| DropdownMenu | src/components/ui/dropdown-menu.tsx | trigger, items |
| ScrollArea | src/components/ui/scroll-area.tsx | className, children |
| Collapsible | src/components/ui/collapsible.tsx | open, onOpenChange, children |
| Skeleton | src/components/ui/skeleton.tsx | className (for loading state) |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| StatusBadge | Renders single status | Add "transition" variant: renders `[Old Status] -> [New Status]` with arrow icon between two badges |
| Tooltip | Basic text tooltip | Add support for rich content (formatted timestamps with timezone) |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| TimelineSpine | Vertical line with colored dots at each event. Alternates cards left/right on desktop. Supports compact mode (dots only) and expanded mode (full cards). | High -- CSS positioning, responsive alternating layout, scroll-based animations |
| TimelineEventCard | Individual event card with icon, title, details, actor, timestamp. Expandable/collapsible. Supports different layouts per event type (check call with map vs. document upload with thumbnail). | High -- polymorphic rendering based on event type, expandable state, inline actions |
| MiniMapThumbnail | Small static map image (120x80px) showing a pin at a GPS coordinate. Uses Mapbox Static Images API or similar. | Medium -- API integration, lazy loading, fallback for missing coordinates |
| SLAComplianceBar | Horizontal bar showing planned vs actual for pickup and delivery. Color-coded variance badges. Collapsible. | Medium -- comparison logic, conditional coloring, responsive layout |
| TimelineFilter | Filter bar specific to timeline event types. Chip-based multi-select. Includes "Jump To" dropdown and collapse/expand all toggle. | Small -- filter state, chip rendering, scroll-to behavior |
| EventDurationBadge | Small muted badge showing "2h 15m since last event" or "Dwell: 3h 10m at facility." Red text if exceeds threshold. | Small -- time calculation, conditional styling |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Collapsible | collapsible | Expand/collapse individual timeline cards and the SLA summary bar |
| Popover | popover | Mini-map popover on location events, rich timestamp tooltip |
| Select | select | "Jump To" milestone dropdown, event type filter |
| Separator | separator | Visual dividers between date groups on the timeline |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/loads/{loadId} | Fetch load header data (load#, status, carrier, route, stops, customer) | useLoad(loadId) |
| 2 | GET | /api/loads/{loadId}/timeline | Fetch paginated timeline events, supports cursor-based pagination and event type filter | useLoadTimeline(loadId, { filter, cursor, limit }) |
| 3 | GET | /api/loads/{loadId}/timeline/summary | Fetch SLA compliance summary (planned vs actual times, variances) | useLoadTimelineSummary(loadId) |
| 4 | POST | /api/loads/{loadId}/timeline/{eventId}/notes | Append a note to a timeline event | useAddTimelineNote() |
| 5 | GET | /api/loads/{loadId}/timeline/export | Export timeline as PDF or CSV (accepts `format` query param) | useExportTimeline(loadId, format) |
| 6 | POST | /api/loads/{loadId}/timeline/share | Generate shareable read-only link with expiry | useShareTimeline(loadId) |
| 7 | GET | /api/maps/static | Fetch static map tile image for GPS coordinates | useStaticMapTile(lat, lng, zoom) |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| loads:{loadId} | load.timeline.eventCreated | useLoadTimelineStream(loadId) -- appends new event to the local timeline array without refetching |
| loads:{loadId} | load.status.changed | useLoadStatusStream(loadId) -- updates load header badge and appends status change event |
| loads:{loadId} | load.eta.updated | useLoadEtaStream(loadId) -- updates SLA bar and appends ETA event |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 500 |
|---|---|---|---|---|---|
| GET /api/loads/{loadId}/timeline | Show "Invalid filter" toast | Redirect to login | Show "Access Denied" page | Show "Load not found" with link back to Loads List | Show error state with retry button |
| POST /api/loads/{loadId}/timeline/{eventId}/notes | Show validation toast "Note cannot be empty" | Redirect to login | Show "Permission Denied" toast | Show "Event not found" toast | Show error toast with retry |
| GET /api/loads/{loadId}/timeline/export | Show "Invalid format" toast | Redirect to login | Show "Permission Denied" toast | Show "Load not found" toast | Show error toast with retry |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Show load header bar with skeleton bars for load#, status, carrier, route. Show the SLA bar as a skeleton rectangle. Show 6 skeleton timeline cards alternating left/right with animated gray pulse bars matching card dimensions (icon circle, title bar, two detail lines, actor line).
- **Progressive loading:** Load header and SLA summary load first (smaller payload). Timeline events load second with cursor-based pagination (first 25 events). Show "Loading more events..." spinner when scrolling to load additional pages.
- **Duration threshold:** If initial load exceeds 5 seconds, show "Loading timeline events... This load has a long history." message.

### Empty States

**First-time empty (load just created, no events yet):**
- **Illustration:** Timeline illustration with a single dot
- **Headline:** "Timeline is empty"
- **Description:** "Events will appear here as the load progresses through its lifecycle."
- **CTA Button:** None -- this state resolves automatically as events are created

**Filtered empty (events exist but filter excludes all):**
- **Headline:** "No matching events"
- **Description:** "No [event type] events found for this load. Try selecting a different filter."
- **CTA Button:** "Clear Filter" -- outline button that resets to "All Events"

### Error States

**Full page error (timeline API fails):**
- **Display:** Load header still shows (from cached load data). Timeline area shows error icon + "Unable to load timeline events" + "Please try again or contact support." + Retry button.

**Per-section error (SLA summary fails but timeline loads):**
- **Display:** SLA bar shows "Could not calculate SLA compliance" with retry link. Timeline events render normally.

**Action error (adding a note fails):**
- **Display:** Toast notification: red background, error icon, "Failed to save note. Please try again." Auto-dismiss after 8 seconds.

### Permission Denied

- **Full page denied:** Show "You don't have permission to view this load's timeline" with link back to Loads List. This occurs if the user does not have `timeline_view` permission.
- **Partial denied (finance fields hidden):** Rate and revenue information on carrier assignment events is simply omitted from the card. No indication that hidden content exists -- the card renders without the rate line.

### Offline / Degraded

- **Full offline:** Show banner: "You're offline. Showing cached timeline from [timestamp]. New events will not appear until reconnected."
- **Degraded (WebSocket down, REST works):** Show subtle "Live updates paused" indicator below the filter bar. Timeline data is still accurate as of last page load/refresh, but new events will not stream in until WebSocket reconnects.

### Edge Cases

- **Loads with 500+ events:** Use cursor-based pagination. Load 25 events at a time. Show "Load more" button or infinite scroll trigger. GPS auto-updates are collapsed into a single "X GPS updates" summary node that can be expanded.
- **Concurrent viewers:** Multiple dispatchers viewing the same load timeline simultaneously. WebSocket ensures all viewers see new events in real-time. No conflict since timeline is append-only.
- **Timezone handling:** All timestamps stored in UTC. Displayed in the user's local timezone (from profile settings). Hover tooltip shows both local time and UTC.
- **Load with no GPS data:** Mini-map thumbnails are not rendered. Location events show city/state text only with a muted "No GPS data" indicator.
- **Deleted carrier:** If a carrier was assigned and later deleted from the system, the timeline event still shows the carrier name (snapshot at time of event) but the link to Carrier Detail shows "Carrier no longer available."

---

## 12. Filters, Search & Sort

### Filters

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Event Type | Multi-select dropdown chips | All Events, Status Changes, Check Calls, Stop Events, Documents, Exceptions, GPS Updates, Notes | All Events | ?eventType=status,checkcall |
| 2 | Actor | Searchable select | All users who have events on this load + "System" | All | ?actor=userId |
| 3 | Date Range | Date range picker | Custom date range within the load's lifecycle | Full lifecycle (load created to now) | ?from=&to= |

### Search Behavior

- **Search field:** Not applicable on this screen. The timeline is scoped to a single load. If users need to find a specific event, they use the "Jump To" dropdown or event type filter.
- **Ctrl+F browser search:** Works naturally since timeline cards render as DOM text.

### Sort Options

| Column / Field | Default Direction | Sort Type |
|---|---|---|
| Event Timestamp | Ascending (oldest first -- chronological) | Date |
| Event Timestamp (reversed) | Descending (newest first) | Date -- toggled via "Newest First" / "Oldest First" toggle in filter bar |

**Default sort:** Chronological -- oldest events at the top, newest at the bottom. This matches the natural reading direction of a timeline (story unfolds top to bottom). "Newest First" option available for users who want to see the latest events immediately.

### Saved Filters / Presets

- **System presets:** "All Events" (default), "Status Changes Only", "Check Calls Only", "Exceptions Only"
- **User-created presets:** Not applicable for this screen -- the filter surface is small enough that presets add unnecessary complexity.
- **URL sync:** Event type filter and date range are reflected in URL query params so a filtered timeline view can be shared via link.

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Timeline cards stop alternating left/right -- all cards render on the right side of the spine (left-aligned timeline)
- Load header bar: stacks into two rows (load# + status on row 1, carrier + route on row 2)
- SLA compliance bar: pickup and delivery variance stack vertically instead of side-by-side
- Mini-map thumbnails: hidden by default, shown on tap/expand of the event card
- Action buttons: primary "Log Check Call" visible, others collapse into "More" dropdown
- Filter bar: collapses into a single "Filter" button that opens a slide-over panel

### Mobile (< 768px)

- Timeline spine moves to the far left edge (8px from screen edge). All cards extend to the right, full-width.
- Load header bar: compact single-line with load# and status badge only. Tap to expand full header.
- SLA compliance bar: collapses to a single line: "PU: +22m late | DEL: On track" with tap to expand details.
- Timeline cards: simplified layout. Icon + title + relative timestamp on the main line. Tap to expand full details, actor, and absolute timestamp.
- Mini-map thumbnails: hidden entirely on mobile. Location shown as text only.
- Action buttons: sticky bottom bar with "Log Check Call" as primary action. "More" menu accessible via icon button.
- Pull-to-refresh: pulls the latest timeline events.
- "Jump To" dropdown: becomes a full-screen modal with large tap targets for each milestone.
- Print Timeline: hidden on mobile (not a mobile use case).

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full alternating left/right timeline layout as designed in Section 3. Mini-maps visible inline. |
| Desktop | 1024px - 1439px | Same alternating layout, but cards are narrower. Mini-maps may be slightly smaller. |
| Tablet | 768px - 1023px | Single-column left-aligned timeline. Stacked header. Collapsed mini-maps. |
| Mobile | < 768px | Far-left spine, full-width cards, tap-to-expand, sticky bottom action bar. |

---

## 14. Stitch Prompt

```
Design a vertical timeline detail screen for a modern freight/logistics TMS (Transportation Management System) called "Ultra TMS." This screen shows the complete lifecycle of a single freight load from creation to delivery.

Layout: Full-width page with a dark slate-900 sidebar on the left (240px, collapsed to icon-only is fine for this mockup). The main content area has a white background. At the very top, show a breadcrumb: "Loads > FM-2025-0847 > Timeline."

Load Header Bar: Below the breadcrumb, render a full-width card (white background, subtle border-b, py-4 px-6) containing: the load number "FM-2025-0847" in bold 18px monospace font, a sky-blue status badge reading "In Transit" with a Truck icon, the carrier name "Swift Transport" as a clickable blue link, the route "Chicago, IL -> Dallas, TX" with a small arrow icon, equipment badge "Dry Van" in blue-100, and the customer "Acme Manufacturing." On the right side of this header, show three buttons: a primary blue "Log Check Call" button with a phone icon, a secondary outline "Print Timeline" button with a printer icon, and a secondary outline "Update Status" button with a refresh icon.

SLA Compliance Bar: Directly below the load header, show a light gray-50 bar with two sections side by side. Left section: "Pickup -- Planned: Jan 15, 8:00 AM | Actual: 8:22 AM | +22m late" with the "+22m late" text in orange-600. Right section: "Delivery -- Planned: Jan 16, 2:00 PM | ETA: 1:45 PM | -15m early" with the "-15m early" text in green-600. Far right of this bar: a green badge reading "SLA: ON TRACK."

Filter Controls: Below the SLA bar, a thin toolbar with: a dropdown labeled "Filter: All Events" with a chevron-down icon, a dropdown labeled "Jump To..." for milestone navigation, and a "Collapse All" text button.

Vertical Timeline: The main content area renders a vertical timeline down the center of the page. A thin gray-300 vertical line (2px wide) runs down the center. Timeline event cards alternate left and right of this center line. Each card connects to the line via a small horizontal connector and a colored circle (12px) on the center line itself. Show at least 8 event cards with realistic freight data:

Card 1 (Left): Jan 14, 3:22 PM. Slate-colored circle with FilePlus icon. Card title: "Load Created." Body: "Created by Maria Rodriguez from Order #ORD-2025-1234. Customer: Acme Manufacturing." Small avatar "MR" in the footer.

Card 2 (Right): Jan 14, 4:10 PM. Indigo circle with Truck icon. Card title: "Carrier Assigned." Body: "Swift Transport (MC# 123456) assigned. Rate: $2,450.00." "Assigned by Maria Rodriguez." Show "48m since last event" in muted text.

Card 3 (Left): Jan 14, 4:12 PM. Blue circle with Send icon. Card title: "Rate Confirmation Sent." Body: "Sent to dispatch@swift.com."

Card 4 (Right): Jan 14, 5:45 PM. Green circle with FileCheck icon. Card title: "Rate Confirmation Signed." Body: "Signed by John Smith (Swift Transport). View Document link in blue."

Card 5 (Left): Jan 15, 6:30 AM. Indigo circle with Navigation icon. Card title: "Dispatched." Body: "Driver: Carlos Martinez | Phone: (555) 123-4567 | Truck #4521 | Trailer #T-8890."

Card 6 (Right): Jan 15, 7:45 AM. Blue circle with PhoneCall icon. Card title: "Check Call." Body: "Location: Joliet, IL | ETA: Jan 15 8:15 AM | Miles remaining: 42. Notes: Driver 15 min out, no issues. Logged by Maria R." Include a tiny static map thumbnail (120x80px) in the top-right corner of this card showing a map pin near Joliet, IL. Show "1h 15m since last event" in muted text.

Card 7 (Left): Jan 15, 8:22 AM. Amber circle with MapPin icon. Card title: "Arrived at Pickup -- Stop 1." Body: "Acme Warehouse, 1200 Industrial Blvd, Chicago, IL 60601. Appointment: 8:00 AM | Arrived: 8:22 AM." Show an orange badge: "+22 min late."

Card 8 (Right): Jan 15, 10:15 AM. Indigo circle with ArrowUpFromLine icon. Card title: "Loading Complete." Body: "BOL #AC-99102 signed. 42,000 lbs loaded. Dwell time: 1h 53m." Show a muted badge: "1h 53m at facility."

Each card should be a white rounded-lg container with a subtle shadow-sm and border. The event type icon should appear inside the colored circle on the timeline spine. Timestamps should appear above each card in muted gray-500 text (12px). The actor name and avatar should appear at the bottom of each card in smaller muted text.

Design Specifications:
- Font: Inter or system sans-serif, 14px base size for card body, 12px for timestamps and metadata
- Sidebar: slate-900 background, white text, blue-600 active indicator
- Content background: white (#FFFFFF)
- Timeline spine: gray-300 line (2px), colored event dots (12px circles with white 2px border)
- Primary color: blue-600 for buttons and links
- Cards: white background, rounded-lg, border border-gray-200, shadow-sm, padding 16px
- Status badges use the TMS color system: green for success/on-time, amber/orange for warnings/late, blue for info, red for errors
- Modern SaaS aesthetic similar to Linear.app timeline or GitHub activity feed
- Each card has a subtle left-border (3px) matching the event type color for quick visual scanning

Include: Breadcrumb navigation at top, the full load header bar, SLA compliance summary bar, filter controls toolbar, and at least 8 alternating timeline cards with varied event types. Show realistic freight brokerage data with proper load numbers, carrier names, driver info, and timestamps.
```

---

## 15. Enhancement Opportunities

### Current State (Wave 2)

**What's built and working:**
- [ ] Nothing built yet -- screen is in design phase

**What needs polish / bug fixes:**
- [ ] N/A -- not yet built

**What to add this wave:**
- [ ] Core vertical timeline with chronological event cards (MVP)
- [ ] Load header bar with status badge and navigation actions
- [ ] SLA compliance summary bar (planned vs actual)
- [ ] Event type filtering (status, check calls, stops, documents, exceptions)
- [ ] Expandable/collapsible card details
- [ ] Actor attribution on every event
- [ ] Duration between events calculation
- [ ] Relative + absolute timestamp display
- [ ] Mini-map thumbnails on location events
- [ ] Print timeline as PDF report

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Core timeline rendering with event cards | High | High | P0 |
| SLA compliance bar (planned vs actual) | High | Medium | P0 |
| Event type filtering | High | Low | P0 |
| Mini-map thumbnails on GPS events | Medium | Medium | P1 |
| Print timeline as PDF | Medium | Medium | P1 |
| "Jump To" milestone navigation | Medium | Low | P1 |
| Check call gap detection warnings | High | Low | P1 |
| GPS auto-update event collapsing | Medium | Medium | P1 |
| Historical map playback | Medium | High | P2 |
| Timeline sharing (read-only link) | Low | Medium | P2 |
| Side-by-side load comparison | Low | High | P2 |
| Export as CSV/JSON | Low | Low | P2 |

### Future Wave Preview

- **Wave 3:** Integrate carrier scorecard data into carrier assignment events (show carrier on-time % at time of assignment). Add predictive SLA indicators ("Based on current GPS speed, delivery will be 45 minutes late").
- **Wave 4:** AI-powered timeline summaries ("This load had 2 delays totaling 3 hours, primarily due to detention at the Chicago pickup facility. Despite this, delivery was on time."). Customer portal timeline view (read-only, filtered to exclude internal notes and financial data).

---
