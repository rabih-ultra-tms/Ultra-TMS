# Tracking Map

> Service: TMS Core (Service 04) | Wave: 2 | Priority: P0
> Route: /(dashboard)/tracking | Status: Not Started
> Primary Personas: Maria Rodriguez (Dispatcher, 50+ loads/day), Sarah Chen (Operations Manager)
> Roles with Access: dispatcher, ops_manager, admin, support (read-only)
> Screen Type: Map / Visualization
> Complexity: Very High

---

## 1. Purpose & Business Context

**What this screen does:**
The Tracking Map is a full-screen, real-time geographic visualization of every in-transit load across the entire operation. It renders a Google Maps or Mapbox map with live GPS markers for all active loads, color-coded by delivery status (on-time, delayed, at-risk). Dispatchers and operations managers use this screen to monitor fleet movement at a glance, detect delays before they become customer-facing issues, and verify that drivers are following planned routes. Clicking any marker opens a side panel with load summary, ETA, driver info, last check call, and quick-action buttons. The map also displays geofence boundaries around pickup and delivery facilities, planned vs actual route polylines, traffic and weather overlays, and a bottom timeline strip showing today's stops with their ETAs.

**Business problem it solves:**
Without a centralized tracking map, dispatchers must open individual load detail pages one at a time to check driver positions -- a process that takes 2-3 minutes per load and is impossible to scale across 50+ active loads. Operations managers have zero visibility into fleet-wide patterns (clustering, regional delays, route deviations) without manually compiling GPS data into spreadsheets. When a customer calls asking "where is my shipment?", the dispatcher spends 90 seconds navigating to the load, finding the last check call, and interpreting a text-based location. With the tracking map, the answer is visible in 3 seconds: click the load marker, read the ETA in the side panel, and relay it to the customer. The map also enables proactive management: Sarah can spot a cluster of 5 loads all hitting the same weather system on I-40 and preemptively notify affected customers before they call.

**Key business rules:**
- GPS positions update every 60 seconds for loads with active ELD/GPS devices. Loads with no GPS update in 30+ minutes show a "stale" indicator (grayed-out marker with clock icon).
- Load markers are color-coded: green = on-time (ETA within appointment window), yellow = tight (ETA within 1 hour of appointment end), red = at-risk (ETA past appointment window or no GPS in 60+ minutes).
- Geofence radius is configurable per facility (default: 1 mile for pickup, 0.5 miles for delivery). Crossing a geofence boundary triggers an automatic `stop:arrived` or `stop:departed` event.
- Route polylines show planned route (blue dashed) vs actual path traveled (solid blue). Deviation > 20 miles from planned route triggers an alert.
- Traffic layer uses Google Maps Traffic or Mapbox Traffic API. Weather overlay uses OpenWeatherMap or similar.
- Clustering activates when zoom level shows > 50 markers in a viewport area. Cluster badges show count and aggregate status (worst status in cluster determines cluster color).
- The map respects role permissions: dispatchers see only their assigned loads unless they have `load_view_all` permission. Ops managers see all loads.
- Financial data (rates, margins) is never displayed on the map -- this is purely an operational visibility tool.

**Success metric:**
Average time to answer a customer "where is my shipment?" call drops from 90 seconds to 10 seconds. Proactive delay notifications increase from 15% of late loads to 85%. Route deviation detection catches 95% of unauthorized detours within 30 minutes. Operations manager situational awareness improves from "checking individual loads" to "fleet-wide scan in 5 seconds."

---

## 2. User Journey Context

**Comes from (entry points):**

| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Sidebar Navigation | Click "Tracking" in TMS Core sidebar group | None (loads default map view) |
| Operations Dashboard | Click "Tracking Map" quick action button or "View Map" link | None |
| Dispatch Board | Click "Map View" toggle in toolbar or right-click card > "Track on Map" | `?loadId=id` (centers map on specific load) |
| Load Detail | Click "Track on Map" button in header | `?loadId=id` (centers and highlights load) |
| Loads List | Click row action > "Track on Map" | `?loadId=id` |
| Notification Center | Click "Load delayed" or "Geofence alert" notification | `?loadId=id&alert=true` (centers on load, opens side panel) |
| Direct URL | Bookmark / shared link | Route params, query filters |

**Goes to (exit points):**

| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Load Detail | Click "View Full Detail" in side panel | `loadId` |
| Stop Management | Click stop in side panel timeline | `loadId`, `stopId` |
| Check Calls | Click "Add Check Call" in side panel | `loadId`, current GPS coordinates pre-filled |
| Dispatch Board | Click "Back to Board" breadcrumb | Retains filter state |
| Status Updates | Click status badge in side panel to update | `loadId` |
| Carrier Detail | Click carrier name link in side panel | `carrierId` |
| Appointment Scheduler | Click appointment time in side panel to reschedule | `loadId`, `stopId` |

**Primary trigger:**
Maria checks the tracking map 10-15 times per day between dispatch tasks. She opens it when a customer calls about a shipment, when she suspects a driver is delayed, or when she wants a quick fleet-wide scan. Sarah opens it during the morning huddle to show the team where all loads are, and periodically throughout the day to spot regional issues. The map is also displayed on a wall-mounted monitor in many dispatch offices, running in "kiosk mode" with auto-refresh.

**Success criteria (user completes the screen when):**
- Dispatcher has visually confirmed the position and ETA of a specific load (customer call answered).
- Dispatcher has identified all at-risk loads (red markers) and taken action on each (called carrier, updated ETA, notified customer).
- Operations manager has completed a fleet-wide visual scan and confirmed no regional clusters of delays.
- User has verified that route deviations are within acceptable tolerance.

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+-----------------------------------------------------------------------------------+
|  [Sidebar 240px]  |  TRACKING MAP CONTENT AREA                                    |
|                   +---------------------------------------------------------------+
|  TMS Core         |  Toolbar Row (overlays map, semi-transparent bg)               |
|  - Orders         |  [Filter: Status v] [Equipment v] [Carrier v] [Customer v]    |
|  - Loads          |  [Region v] [Search: load#/driver___]  [Layers v] [Fullscreen] |
|  - Dispatch Board |                                                                |
|  - Tracking*      +---------------------------------------------------------------+
|  - Check Calls    |                                                                |
|  - Appointments   |  +--FULL SCREEN MAP (Google Maps / Mapbox)------------------+  |
|                   |  |                                                           |  |
|                   |  |      [Cluster: 8]                                         |  |
|                   |  |          *                                                |  |
|                   |  |        *   *                                              |  |
|                   |  |                    [Green truck]--route--->[Destination]   |  |
|                   |  |                                                           |  |
|                   |  |         [Yellow truck]                                    |  |
|                   |  |              |                                             |  |
|                   |  |         [Red truck]    [Geofence circle]                  |  |
|                   |  |                        /    [Facility]   \                 |  |
|                   |  |                       (      pin          )               |  |
|                   |  |                        \                 /                 |  |
|                   |  |                                                           |  |
|                   |  |   Map Controls:  [+][-] [Layers] [Traffic] [Weather]      |  |
|                   |  +-----------------------------------------------------------+  |
|                   |                                                                |
|                   |  +--Bottom Timeline Strip (collapsible)--------------------+   |
|                   |  |  TODAY'S STOPS                                          |   |
|                   |  |  ●8AM    ●9:30AM    ○11AM      ○1PM    ○2:30PM   ○5PM   |   |
|                   |  |  PU:Done  PU:Done   DEL:EnRte  PU:Pend DEL:Pend  DEL    |   |
|                   |  |  LOAD-47  LOAD-52   LOAD-47    LOAD-61 LOAD-52   LOAD-61|   |
|                   |  +--------------------------------------------------------+   |
+-----------------------------------------------------------------------------------+
```

### Side Panel Layout (opens on marker click)

```
+-----------------------------------------------------------------------------------+
|  [Map content shifts left]           |  SIDE PANEL (400px, slides from right)      |
|                                      +---------------------------------------------+
|                                      |  [X Close]                                  |
|                                      |  LOAD-20260206-0847                         |
|                                      |  [IN_TRANSIT] sky-blue badge                |
|                                      |  Chicago, IL --> Dallas, TX                  |
|                                      |  ----------------------------------------   |
|                                      |  ETA: Jan 16, 1:45 PM                       |
|                                      |  Status: On Time (-15m early) [green]       |
|                                      |  ----------------------------------------   |
|                                      |  CARRIER                                    |
|                                      |  Swift Transport (MC# 123456)               |
|                                      |  Driver: Carlos M. | (555) 123-4567 [Call]  |
|                                      |  Truck #4521 | Trailer #T-8890             |
|                                      |  ----------------------------------------   |
|                                      |  LAST CHECK CALL                            |
|                                      |  Jan 15, 7:45 AM (2h 15m ago)              |
|                                      |  Joliet, IL | "15 min out, no issues"      |
|                                      |  ----------------------------------------   |
|                                      |  STOPS TIMELINE                              |
|                                      |  ● Stop 1: PU - Acme, Chicago [DEPARTED]   |
|                                      |  ○ Stop 2: DEL - Beta, Dallas [PENDING]    |
|                                      |     ETA: Jan 16, 1:45 PM                    |
|                                      |  ----------------------------------------   |
|                                      |  ROUTE INFO                                 |
|                                      |  920 miles total | 485 miles remaining      |
|                                      |  Planned: I-55 S -> I-44 W -> I-35 S       |
|                                      |  Deviation: None                             |
|                                      |  ----------------------------------------   |
|                                      |  [View Full Detail] [Add Check Call]        |
|                                      |  [Update Status] [Contact Driver]           |
|                                      +---------------------------------------------+
+-----------------------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible, map markers) | Load marker position, color-coded status (green/yellow/red), cluster counts when zoomed out | The map's primary value is instant visual triage -- green means fine, red means act now. Maria scans the map in 3 seconds to find the red markers. |
| **Secondary** (visible on marker hover tooltip) | Load number, carrier name, ETA, origin -> destination | Quick identification without opening the full side panel -- enough to decide if this load needs attention |
| **Tertiary** (visible in side panel on click) | Full load summary, driver info, phone number, last check call, stops timeline, route info, deviation status | Detailed operational data for when Maria needs to take action on a specific load |
| **Hidden** (behind navigation from side panel) | Complete load detail, full check call history, documents, rate information, carrier detail | Deep information that requires navigating to dedicated screens |

---

## 4. Data Fields & Display

### Map Marker Fields

| # | Field | Source | Format / Display | Location |
|---|---|---|---|---|
| 1 | Position | Load.currentPosition.lat, .lng | GPS coordinates plotted on map | Marker position |
| 2 | Status Color | Calculated from ETA vs appointment | Green (#10B981) = on-time, Yellow (#F59E0B) = tight, Red (#EF4444) = at-risk, Gray (#9CA3AF) = stale GPS | Marker fill color |
| 3 | Equipment Icon | Load.equipmentType | Truck icon variant: standard (Dry Van), snowflake overlay (Reefer), flatbed silhouette (Flatbed) | Inside marker |
| 4 | Heading | Load.currentPosition.heading | Marker rotation to show direction of travel | Marker rotation |
| 5 | Load Number | Load.loadNumber | Shown on hover tooltip | Tooltip |
| 6 | Speed | Load.currentPosition.speed | "62 mph" on hover tooltip. "0 mph (stopped)" if zero. | Tooltip |

### Hover Tooltip Fields

| # | Field | Source | Format |
|---|---|---|---|
| 1 | Load Number | Load.loadNumber | `LOAD-20260206-0847` monospace bold |
| 2 | Route | stops[0].city + stops[last].city | "Chicago, IL -> Dallas, TX" |
| 3 | Carrier | Load.carrier.name | "Swift Transport" |
| 4 | ETA | Load.eta | "ETA: Jan 16, 1:45 PM" with variance badge |
| 5 | Last Update | Load.currentPosition.timestamp | "Updated 2m ago" or "Stale: 45m ago" in red |
| 6 | Status | Load.status | StatusBadge component |

### Side Panel Fields

| # | Field | Source | Format | Section |
|---|---|---|---|---|
| 1 | Load Number | Load.loadNumber | Monospace bold 18px, clickable link to Load Detail | Header |
| 2 | Load Status | Load.status | StatusBadge component | Header |
| 3 | Route | stops[0] -> stops[last] | "Chicago, IL -> Dallas, TX" with arrow icon | Header |
| 4 | ETA to Next Stop | Calculated | "Jan 16, 1:45 PM" with green/yellow/red badge showing variance from appointment | ETA section |
| 5 | ETA Status | Calculated | "On Time (-15m early)" green or "Late (+2h 15m)" red | ETA section |
| 6 | Carrier Name | Load.carrier.name | Clickable link to Carrier Detail | Carrier section |
| 7 | Carrier MC# | Load.carrier.mcNumber | "MC# 123456" | Carrier section |
| 8 | Driver Name | Load.driver.firstName + lastName | "Carlos Martinez" | Carrier section |
| 9 | Driver Phone | Load.driver.phone | "(555) 123-4567" with click-to-call tel: link and phone icon | Carrier section |
| 10 | Truck Number | Load.truckNumber | "Truck #4521" | Carrier section |
| 11 | Trailer Number | Load.trailerNumber | "Trailer #T-8890" | Carrier section |
| 12 | Last Check Call Time | Load.lastCheckCall.timestamp | "Jan 15, 7:45 AM (2h 15m ago)" -- red text if > 4 hours | Check Call section |
| 13 | Last Check Call Location | Load.lastCheckCall.location | "Joliet, IL" | Check Call section |
| 14 | Last Check Call Notes | Load.lastCheckCall.notes | Quoted italic text | Check Call section |
| 15 | Stop List | Load.stops[] | Ordered list with filled/hollow circles, type badge, facility name, status badge, ETA for pending stops | Stops section |
| 16 | Total Distance | Calculated | "920 miles total" | Route section |
| 17 | Remaining Distance | Calculated from GPS | "485 miles remaining" | Route section |
| 18 | Planned Route | Load.plannedRoute | "I-55 S -> I-44 W -> I-35 S" | Route section |
| 19 | Route Deviation | Calculated | "None" in green or "12 miles off route near Springfield, IL" in red | Route section |

### Cluster Badge Fields

| # | Field | Calculation | Format |
|---|---|---|---|
| 1 | Count | Number of loads in cluster | Large bold number in center of cluster circle |
| 2 | Cluster Color | Worst status in cluster | Green if all on-time, yellow if any tight, red if any at-risk |
| 3 | Breakdown | Count per status | Shown on cluster hover: "5 on-time, 2 tight, 1 at-risk" |

### Bottom Timeline Strip Fields

| # | Field | Source | Format |
|---|---|---|---|
| 1 | Stop Time | Stop.appointmentTimeFrom | "8:00 AM" positioned on horizontal timeline |
| 2 | Stop Type | Stop.stopType | "PU" or "DEL" badge |
| 3 | Stop Status | Stop.status | Filled circle (completed), hollow circle (pending), pulsing circle (active) |
| 4 | Load Number | Load.loadNumber | Abbreviated "LOAD-47" below the stop marker |
| 5 | Facility | Stop.facilityName | Truncated, tooltip for full name |

### Calculated / Derived Fields

| # | Field | Calculation | Format |
|---|---|---|---|
| 1 | ETA Status | `load.eta vs load.stops[next].appointmentTimeTo` | Green "On Time" if ETA before appointment end, Yellow "Tight" if within 1 hour, Red "Late" if past appointment |
| 2 | GPS Freshness | `now() - load.currentPosition.timestamp` | "2m ago" normal, "30m+ ago" amber, "60m+ ago" red with stale indicator |
| 3 | Route Deviation Distance | Haversine distance from current position to nearest planned route point | Distance in miles. Alert if > 20 miles. |
| 4 | Miles Remaining | Distance from current position to next stop along planned route | "485 miles remaining" |
| 5 | Estimated Time Remaining | Miles remaining / average speed (or routing API estimate) | "~7h 10m remaining" |
| 6 | Geofence Status | GPS position relative to stop geofence radius | "Inside geofence" or distance to geofence boundary |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] Full-screen Google Maps or Mapbox map filling the content area (sidebar excluded)
- [ ] Live GPS markers for all in-transit loads, positioned from `GET /api/v1/operations/tracking/positions`
- [ ] Marker color-coding by ETA status: green (on-time), yellow (tight), red (at-risk), gray (stale GPS)
- [ ] Marker click opens a slide-in side panel (400px from right) with load summary, ETA, carrier/driver info, last check call, and stops timeline
- [ ] Hover tooltip on markers showing load number, route, carrier, ETA, last update time
- [ ] Geofence circles drawn around pickup and delivery facilities for in-progress loads
- [ ] Planned route polyline (dashed blue) and actual path polyline (solid blue) for selected load
- [ ] Cluster markers when zoomed out -- circular badges showing count and color-coded by aggregate status
- [ ] Click cluster to zoom into that area and expand individual markers
- [ ] Toolbar with filters: status, equipment type, carrier, customer, region (US state multi-select)
- [ ] Search by load number, driver name, carrier name -- centers map on matching load
- [ ] Map controls: zoom in/out, zoom to fit all loads, fullscreen toggle
- [ ] Traffic layer toggle (Google Traffic or Mapbox Traffic)
- [ ] WebSocket integration: `load:location:updated` every 60s updates marker positions smoothly
- [ ] WebSocket integration: `load:eta:updated` updates marker color and side panel ETA
- [ ] Bottom timeline strip showing today's stops with appointment times, status, and load numbers
- [ ] Connection status indicator ("Live" green dot when WebSocket connected)

### Advanced Features (Logistics Expert Recommendations)

- [ ] **Weather overlay toggle** -- Shows weather radar layer (precipitation, severe weather alerts) from OpenWeatherMap or similar. Helps dispatchers anticipate weather-related delays.
- [ ] **Route deviation alerts** -- When a load deviates > 20 miles from planned route, marker gets a warning overlay and a toast notification appears. Route deviation polyline shown in red.
- [ ] **Geofence auto-events** -- When GPS shows load entering pickup/delivery geofence, automatically fire `stop:arrived` event and update load status. Visual animation (ripple) on geofence circle.
- [ ] **Historical playback** -- Slider to replay load positions over a past time range. Useful for post-incident analysis. Playback speed: 1x, 5x, 10x, 30x.
- [ ] **Heat map mode** -- Toggle to show delivery density heat map instead of individual markers. Useful for capacity planning and lane analysis.
- [ ] **ETA recalculation** -- When traffic conditions change, recalculate ETAs using Google Directions API or Mapbox Directions and push updates.
- [ ] **Multi-load route comparison** -- Select 2-3 loads and show their routes simultaneously with different colors.
- [ ] **Driver breadcrumb trail** -- Show the last 24 hours of GPS positions as a fading trail behind the current position marker.
- [ ] **Facility pins** -- Show all facilities (warehouses, distribution centers) from the facility database as gray pins. Click to see facility hours, contacts, and loads arriving/departing today.
- [ ] **Speed alerts** -- Flag markers where driver speed exceeds 75 mph or falls below 10 mph for extended periods (indicates potential issue).
- [ ] **Kiosk mode** -- Auto-cycling fullscreen mode for wall-mounted monitors. Rotates between fleet overview, regional zoom, and at-risk load focus every 30 seconds.
- [ ] **Distance ruler tool** -- Click-to-measure distance between any two points on the map.
- [ ] **Export map screenshot** -- Capture current map view as PNG for reports or customer communications.
- [ ] **Night mode map** -- Dark map theme for dispatchers working evening/night shifts. Auto-switches based on time or manual toggle.

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| View all loads on map | ops_manager, admin | `load_view_all` | Map shows only loads assigned to current dispatcher |
| View carrier/driver details in side panel | dispatcher, ops_manager, admin | `carrier_view` | Carrier section shows name only, no MC#, phone, or links |
| Update load status from side panel | dispatcher, ops_manager, admin | `load_status_update` | "Update Status" button hidden |
| Add check call from side panel | dispatcher, ops_manager, admin | `checkcall_create` | "Add Check Call" button hidden |
| View geofence configurations | ops_manager, admin | `geofence_manage` | Geofences shown but not editable |
| Historical playback | ops_manager, admin | `tracking_history` | Playback slider hidden |
| Heat map mode | ops_manager, admin | `analytics_view` | Heat map toggle hidden |
| Export map screenshot | any authenticated | `export_data` | Export button hidden |

---

## 6. Status & State Machine

The Tracking Map does not directly manage load status transitions -- it visualizes current load positions and statuses. However, geofence triggers can automatically initiate status transitions, and the side panel provides quick-action buttons for manual status updates.

### Load Statuses Displayed on Map

Only loads in active transit statuses appear on the map by default:

| Status | Marker Display | Visibility |
|---|---|---|
| PLANNING | Not shown on map | Hidden by default |
| PENDING | Not shown on map | Hidden by default |
| TENDERED | Not shown on map | Hidden by default |
| ACCEPTED | Not shown on map | Hidden by default |
| DISPATCHED | Blue marker with truck icon, no route line yet | Shown (filter: "Dispatched") |
| AT_PICKUP | Amber marker at pickup facility, inside geofence | Shown |
| PICKED_UP | Cyan marker departing pickup, route line begins | Shown |
| IN_TRANSIT | Color-coded marker (green/yellow/red) with route line | Shown (primary map content) |
| AT_DELIVERY | Marker at delivery facility, inside geofence | Shown |
| DELIVERED | Green checkmark marker, shown briefly then fades | Shown for 30 min after delivery, then hidden |
| COMPLETED | Not shown on map | Hidden |
| CANCELLED | Not shown on map | Hidden |

### Marker Color State Machine

```
                    ETA within appointment window
                          |
                          v
[GPS Active] -----> [GREEN: On-Time]
     |                    |
     |         ETA within 1 hour of appointment end
     |                    |
     |                    v
     |             [YELLOW: Tight]
     |                    |
     |         ETA past appointment window
     |                    |
     |                    v
     |              [RED: At-Risk]
     |
     |  No GPS update in 30+ minutes
     |
     v
[GRAY: Stale GPS] ---(GPS resumes)---> recalculate to GREEN/YELLOW/RED
```

### Geofence Trigger State Machine

```
[OUTSIDE GEOFENCE] ---(GPS enters radius)---> [ENTERING GEOFENCE]
                                                     |
                                            (auto-fire stop:arrived)
                                                     |
                                                     v
                                              [INSIDE GEOFENCE]
                                                     |
                                            (GPS exits radius)
                                                     |
                                                     v
                                              [EXITING GEOFENCE]
                                                     |
                                            (auto-fire stop:departed)
                                                     |
                                                     v
                                              [OUTSIDE GEOFENCE]
```

### Status Badge Colors (Side Panel)

Uses `LOAD_STATUS` from global status color system:

| Status | Background | Text | Tailwind |
|---|---|---|---|
| DISPATCHED | `indigo-100` | `indigo-800` | `bg-indigo-100 text-indigo-800` |
| AT_PICKUP | `amber-100` | `amber-800` | `bg-amber-100 text-amber-800` |
| PICKED_UP | `cyan-100` | `cyan-800` | `bg-cyan-100 text-cyan-800` |
| IN_TRANSIT | `sky-100` | `sky-800` | `bg-sky-100 text-sky-800` |
| AT_DELIVERY | `teal-100` | `teal-800` | `bg-teal-100 text-teal-800` |
| DELIVERED | `lime-100` | `lime-800` | `bg-lime-100 text-lime-800` |

---

## 7. Actions & Interactions

### Toolbar Actions (Overlaying Map)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| Fullscreen | `Maximize2` | Ghost / icon-only | Toggles browser fullscreen mode for the map | No |
| Layers | `Layers` | Ghost / icon-only | Opens dropdown: Show Traffic, Show Weather, Show Geofences, Show Planned Routes, Show Facilities, Night Mode | No |
| Fit All | `Shrink` | Ghost / icon-only | Zooms map to fit all visible load markers within the viewport | No |
| Refresh | `RefreshCw` | Ghost / icon-only | Force-refreshes all GPS positions via REST fallback | No |

### Filter Controls (Toolbar)

| Filter | Type | Options | Default |
|---|---|---|---|
| Status | Multi-select chips | On-Time, Tight, At-Risk, Stale | All selected |
| Equipment | Multi-select dropdown | Dry Van, Reefer, Flatbed, Step Deck, Other | All |
| Carrier | Searchable select | From `/api/v1/carriers?active=true` | All |
| Customer | Searchable select | From `/api/v1/customers?active=true` | All |
| Region | Multi-select dropdown | US states grouped by region (Northeast, Southeast, Midwest, Southwest, West) | All |

### Map Interactions

| Interaction | Target | Action |
|---|---|---|
| Click marker | Load marker | Opens side panel with load details. Centers map on marker. |
| Hover marker | Load marker | Shows tooltip with load#, route, carrier, ETA, last update |
| Click cluster | Cluster badge | Zooms map into the cluster area, expanding individual markers |
| Hover cluster | Cluster badge | Shows breakdown tooltip: "8 loads: 5 on-time, 2 tight, 1 at-risk" |
| Click geofence | Geofence circle | Shows facility info tooltip with name, address, loads arriving/departing |
| Click route line | Route polyline | Highlights full route and shows total distance and remaining distance |
| Drag map | Map surface | Pans the map |
| Scroll wheel | Map surface | Zooms in/out |
| Double-click | Map surface | Zooms in one level centered on click point |

### Side Panel Actions

| Button Label | Icon | Action | Condition |
|---|---|---|---|
| View Full Detail | `ExternalLink` | Navigates to Load Detail page | Always |
| Add Check Call | `PhoneCall` | Opens check call form with load and GPS coordinates pre-filled | Load is dispatched or in transit |
| Update Status | `RefreshCw` | Opens status transition dropdown (valid next statuses only) | User has `load_status_update` permission |
| Contact Driver | `Phone` | Initiates phone call to driver via tel: protocol | Load has driver with phone number |
| Contact Carrier | `Mail` | Opens email compose to carrier dispatch email | Load has carrier |
| View Stops | `ListOrdered` | Navigates to Stop Management | Always |
| Close Panel | `X` | Closes side panel, map returns to full width | Always |

### Bottom Timeline Strip Actions

| Interaction | Action |
|---|---|
| Click stop marker | Centers map on that stop's facility and opens side panel for the associated load |
| Hover stop marker | Shows tooltip with facility name, appointment time, load number, status |
| Scroll strip | Horizontal scroll to see earlier/later stops if more than fit in viewport |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Escape` | Close side panel |
| `F` | Toggle fullscreen |
| `T` | Toggle traffic layer |
| `W` | Toggle weather layer |
| `G` | Toggle geofence visibility |
| `R` | Toggle planned route lines |
| `Ctrl/Cmd + F` | Focus search box |
| `+` / `-` | Zoom in / out |
| `0` | Fit all markers in view |
| `Arrow keys` | Pan map |
| `[` / `]` | Previous / next load marker (cycles through visible markers, opens side panel) |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| N/A | N/A | No drag-and-drop on the tracking map. Map panning uses drag gesture. |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Namespace | Payload | UI Update |
|---|---|---|---|
| `load:location:updated` | `/tracking` | `{ loadId, lat, lng, heading, speed, timestamp, source }` | Smoothly animate marker to new position (CSS transition 1s). Update heading rotation. Refresh "last updated" timestamp in tooltip and side panel. Recalculate miles remaining if side panel is open. |
| `load:eta:updated` | `/tracking` | `{ loadId, stopId, previousEta, newEta, reason }` | Recalculate marker color (on-time/tight/at-risk). Update ETA in side panel if open. Update cluster color if marker is in a cluster. Flash marker border for 2 seconds if ETA status changed. |
| `load:status:changed` | `/dispatch` | `{ loadId, previousStatus, newStatus, changedBy, timestamp }` | If new status is a map-visible status, add marker. If terminal status (COMPLETED/CANCELLED), remove marker with fade animation. Update side panel status badge if open. |
| `stop:arrived` | `/tracking` | `{ loadId, stopId, arrivedAt, method, facilityName }` | Geofence circle pulses green. Marker changes to "at facility" variant. Side panel stops timeline updates. Toast: "LOAD-0847 arrived at [facility]." |
| `stop:departed` | `/tracking` | `{ loadId, stopId, departedAt }` | Geofence circle returns to default. Marker resumes route animation. Update bottom timeline strip. |
| `checkcall:received` | `/tracking` | `{ loadId, checkCallId, location, eta, notes, timestamp }` | Update "Last Check Call" in side panel if open. Refresh GPS freshness calculation. If stale marker, upgrade color based on new data. |
| `geofence:entered` | `/tracking` | `{ loadId, stopId, facilityId, radius, timestamp }` | Animate geofence circle with ripple effect. Show toast: "LOAD-0847 entering [facility] geofence." |
| `geofence:exited` | `/tracking` | `{ loadId, stopId, facilityId, timestamp }` | Animate geofence circle (subtle flash). Show toast: "LOAD-0847 departed [facility] geofence." |

### Live Update Behavior

- **Update frequency:** GPS positions arrive via WebSocket every 60 seconds per load. With 100 active loads, that is approximately 100 events per minute. Markers animate smoothly between positions using CSS transform transitions (1 second duration) to avoid visual jumping.
- **Visual indicator:** Markers that just received a GPS update briefly pulse with a subtle blue ring (200ms fade-in, 1s hold, 500ms fade-out). This helps dispatchers see "which trucks are actively reporting."
- **Conflict handling:** Map is read-only for GPS positions -- no user-initiated mutations to conflict. If a status change conflicts with a pending drag (N/A for this screen), WebSocket data is authoritative.
- **Batching:** GPS events arriving within 500ms are batched into a single map re-render to prevent jitter when many loads update simultaneously.
- **Connection status:** Green dot "Live" in toolbar when WebSocket connected. Amber "Reconnecting..." when connection drops. Red "Updates paused" after 60 seconds of disconnection.

### Polling Fallback

- **When:** WebSocket `/tracking` connection drops.
- **Interval:** Every 15 seconds (critical screen for operational visibility).
- **Endpoint:** `GET /api/v1/operations/tracking/positions?updatedSince={lastPollTimestamp}`
- **Visual indicator:** Amber banner below toolbar: "Live tracking paused -- positions may be delayed. Reconnecting..."

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Update status from side panel | Status badge updates immediately in side panel. Marker color may change. | Revert status badge and marker color. Toast: "Failed to update status: [reason]." |
| Add check call from side panel | "Last Check Call" section updates to "Just now" with entered notes. | Revert to previous check call data. Toast: "Failed to log check call." |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| `StatusBadge` | `src/components/ui/status-badge.tsx` | `entity: LOAD_STATUS, status: string, size: 'sm'` |
| `Badge` | `src/components/ui/badge.tsx` | For stop type badges (PICKUP/DELIVERY), ETA status badges |
| `Button` | `src/components/ui/button.tsx` | Side panel action buttons |
| `Tooltip` | `src/components/ui/tooltip.tsx` | Marker hover tooltips, cluster breakdown |
| `Sheet` | `src/components/ui/sheet.tsx` | Side panel slide-in container |
| `ScrollArea` | `src/components/ui/scroll-area.tsx` | Side panel content scrolling |
| `DropdownMenu` | `src/components/ui/dropdown-menu.tsx` | Layers dropdown, status update dropdown |
| `Skeleton` | `src/components/ui/skeleton.tsx` | Map loading state, side panel loading state |
| `FilterBar` | `src/components/ui/filter-bar.tsx` | Map toolbar filters |
| `Avatar` | `src/components/ui/avatar.tsx` | Driver avatar in side panel |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| `FilterBar` | Designed for list pages (full-width bar) | Add "overlay" variant that renders semi-transparent over the map, compact single-line layout, floating style with `backdrop-blur` and `bg-white/80` |
| `StatusBadge` | Renders text-based badge | Add "dot" variant that renders just a colored circle (12px) for use in the bottom timeline strip |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| `TrackingMap` | Top-level container component. Manages map instance (Google Maps or Mapbox GL JS), marker layer, route layer, geofence layer, cluster layer, WebSocket subscriptions, filter state, and side panel state. | Very High -- map SDK integration, marker management, real-time position updates, clustering algorithm, route rendering, geofence drawing |
| `LoadMarker` | Custom map marker component. Renders truck icon colored by ETA status. Rotates based on heading. Supports hover tooltip and click handler. Smooth CSS transition for position updates. | High -- custom marker rendering, animation, tooltip integration |
| `MarkerCluster` | Cluster component for zoomed-out views. Circular badge with count and aggregate color. Click to zoom. Hover for breakdown. | Medium -- clustering algorithm (use Supercluster library), aggregate status calculation |
| `TrackingSidePanel` | Side panel (400px, slides from right) displaying full load tracking details. Sections: header, ETA, carrier/driver, last check call, stops timeline, route info, actions. | High -- multiple data sections, real-time updates, action buttons, responsive layout |
| `GeofenceCircle` | Map overlay component rendering a semi-transparent circle around facility coordinates. Configurable radius. Pulse animation on enter/exit events. | Medium -- map overlay rendering, animation |
| `RouteLine` | Map polyline component showing planned route (dashed blue) and actual path (solid blue). Supports highlighting on click. Shows deviation in red. | Medium -- polyline rendering, dash pattern, deviation calculation |
| `MapToolbar` | Floating toolbar overlaying the map with filters, search, layer toggles, and map controls. Semi-transparent background with blur. | Medium -- floating layout, backdrop-blur, responsive collapse |
| `MapLayerToggle` | Dropdown menu for toggling map layers: Traffic, Weather, Geofences, Routes, Facilities, Night Mode. Checkboxes for each layer. | Small -- dropdown with toggle items, state management |
| `BottomTimelineStrip` | Horizontal strip at the bottom of the map showing today's stops as markers on a time axis. Collapsible. Scrollable for many stops. | Medium -- time-axis positioning, stop markers, horizontal scroll, collapse animation |
| `MarkerTooltip` | Custom tooltip rendered on marker hover. Shows load#, route, carrier, ETA, last update. Styled to match app design system (not default map tooltip). | Small -- custom tooltip positioning, styled content |
| `LoadSearchOverlay` | Search input in the toolbar that searches loads by number, carrier, driver. Shows dropdown results. Selecting a result centers map on that load and opens side panel. | Medium -- debounced search, results dropdown, map centering |
| `StaleGPSIndicator` | Visual indicator on markers with stale GPS data. Gray color with clock icon overlay. Tooltip shows time since last update. | Small -- conditional styling, icon overlay |
| `EtaStatusBadge` | Color-coded badge showing ETA status: "On Time" (green), "Tight" (yellow), "Late" (red) with time variance. Used in side panel and tooltip. | Small -- conditional color, time calculation |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Sheet | `sheet` | Side panel slide-in for load details |
| Popover | `popover` | Map layer toggles, filter popovers |
| Toggle | `toggle` | Traffic/weather layer toggles |
| Scroll Area | `scroll-area` | Side panel content scrolling |
| Separator | `separator` | Section dividers in side panel |
| Command | `command` | Load search with keyboard navigation |
| Tooltip | `tooltip` | Marker and cluster tooltips |
| Collapsible | `collapsible` | Bottom timeline strip collapse |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook | Cache Time |
|---|---|---|---|---|---|
| 1 | GET | `/api/v1/operations/tracking/positions` | Fetch current GPS positions for all active loads (bulk). Returns array of `{ loadId, lat, lng, heading, speed, timestamp, status, eta, carrier, origin, destination }` | `useTrackingPositions(filters)` | 15s |
| 2 | GET | `/api/v1/operations/tracking/positions/:loadId` | Fetch GPS position history for a specific load (for route trail and playback) | `useLoadPositionHistory(loadId, dateRange)` | 60s |
| 3 | GET | `/api/v1/loads/:id` | Fetch full load detail for side panel (load#, stops, carrier, driver, check calls, route) | `useLoad(loadId)` | 60s |
| 4 | GET | `/api/v1/loads/:id/checkcalls?limit=1&sort=-createdAt` | Fetch latest check call for side panel | `useLatestCheckCall(loadId)` | 30s |
| 5 | GET | `/api/v1/loads/:id/stops` | Fetch stops for side panel stops timeline | `useLoadStops(loadId)` | 30s |
| 6 | PATCH | `/api/v1/loads/:id/status` | Update load status from side panel quick action | `useUpdateLoadStatus()` | -- |
| 7 | POST | `/api/v1/checkcalls` | Create check call from side panel quick action | `useCreateCheckCall()` | -- |
| 8 | GET | `/api/v1/loads/stats?status=active` | Fetch active load counts for bottom timeline | `useActiveLoadStats()` | 60s |
| 9 | GET | `/api/v1/stops?date=today&sort=appointmentDate` | Fetch today's stops for bottom timeline strip | `useTodaysStops()` | 60s |
| 10 | GET | `/api/v1/facilities?active=true` | Fetch facilities for geofence and facility pin display | `useFacilities()` | 300s |

### Query Parameters for Position Endpoint

| Parameter | Type | Description |
|---|---|---|
| `status` | comma-separated string | Filter by ETA status: `on-time`, `tight`, `at-risk`, `stale` |
| `equipmentType` | comma-separated string | Filter by equipment: `DRY_VAN`, `REEFER`, `FLATBED` |
| `carrierId` | UUID | Filter by carrier |
| `customerId` | UUID | Filter by customer |
| `region` | comma-separated state codes | Filter by origin/destination states |
| `bounds` | `swLat,swLng,neLat,neLng` | Only return loads within map viewport bounds (for large fleets) |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| `tenant:{tenantId}` on `/tracking` | `load:location:updated` | `useTrackingLivePositions()` -- updates marker position with smooth animation |
| `tenant:{tenantId}` on `/tracking` | `load:eta:updated` | `useTrackingLiveEtas()` -- recalculates marker color, updates side panel |
| `tenant:{tenantId}` on `/tracking` | `stop:arrived` | `useTrackingStopEvents()` -- triggers geofence animation, updates side panel |
| `tenant:{tenantId}` on `/tracking` | `stop:departed` | `useTrackingStopEvents()` -- triggers geofence animation, updates side panel |
| `tenant:{tenantId}` on `/tracking` | `checkcall:received` | `useTrackingCheckCalls()` -- updates side panel check call section |
| `tenant:{tenantId}` on `/dispatch` | `load:status:changed` | `useTrackingStatusChanges()` -- adds/removes markers based on new status |
| `tenant:{tenantId}` on `/tracking` | `geofence:entered` | `useGeofenceEvents()` -- geofence ripple animation |
| `tenant:{tenantId}` on `/tracking` | `geofence:exited` | `useGeofenceEvents()` -- geofence animation |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 500 |
|---|---|---|---|---|---|
| GET /tracking/positions | Toast: "Invalid filter parameters" | Redirect to login | "Access Denied" page | N/A (returns empty array) | Show error overlay on map: "Unable to load tracking data" with Retry button |
| GET /loads/:id (side panel) | N/A | Redirect to login | Toast: "Permission denied" | Toast: "Load not found" -- close side panel | Toast: "Unable to load details" with Retry in side panel |
| PATCH /loads/:id/status | Toast: "Invalid status transition: [details]" | Redirect to login | Toast: "Permission denied" | Toast: "Load not found" | Toast: "Status update failed. Try again." |
| POST /checkcalls | Toast: "Validation error: [details]" | Redirect to login | Toast: "Permission denied" | Toast: "Load not found" | Toast: "Failed to log check call." |

---

## 11. States & Edge Cases

### Loading State

- **Map loading:** Show map skeleton (gray rectangle filling the map area) with a centered spinner and "Loading map..." text. Map controls and toolbar render immediately (interactive before map loads).
- **Markers loading:** Map renders first, then markers load in a staggered burst (all appear within 500ms of data arrival, positioned at their GPS coordinates). This creates a visual "populating" effect.
- **Side panel loading:** When a marker is clicked, side panel slides in immediately with skeleton content: skeleton bars for load#, status, route, carrier, check call. Data fills in progressively (load header first, then stops, then check call).
- **Duration threshold:** If map or marker data takes > 5 seconds, show "Loading tracking data... This may take a moment with large fleets." centered on the map.

### Empty States

**No active loads (new tenant or quiet period):**
- Map renders with no markers.
- Centered overlay message: illustration of a truck on a road.
- Headline: "No active loads to track"
- Description: "Loads will appear on the map once they are dispatched and have GPS positions. Create and dispatch a load to get started."
- CTA: "Go to Dispatch Board" primary button.

**No loads matching filters:**
- Map renders with no markers.
- Centered overlay: "No loads match your current filters."
- CTA: "Clear All Filters" button.

**Bottom timeline strip empty (no stops today):**
- Strip shows: "No stops scheduled for today."

### Error States

**Map SDK fails to load (Google Maps/Mapbox error):**
- Show full-content-area fallback: "Map could not be loaded. Please check your internet connection and try again." with Retry button. Below, show a simplified list view of active loads with their positions as text ("LOAD-0847: near Joliet, IL -- ETA Jan 16 1:45 PM").

**GPS data API fails:**
- Map renders but is empty. Banner overlay: "Unable to load tracking data. Positions may be outdated." with Retry button. Any cached markers remain visible with a "Data from [timestamp]" indicator.

**WebSocket disconnection:**
- Amber banner: "Live tracking paused -- positions may be delayed. Reconnecting..."
- Markers remain at last known positions but stop animating.
- GPS freshness timers continue counting, so markers may gradually turn gray (stale).
- Polling fallback activates at 15-second intervals.

**Side panel load fails:**
- Side panel shows error state: "Unable to load details for this load" with Retry button.
- Map and other markers remain functional.

### Permission Denied

- **Full page denied:** "You don't have permission to view the Tracking Map." with link to Operations Dashboard.
- **Partial denied (dispatcher sees only their loads):** Map shows only the dispatcher's assigned loads. Empty state if none are in transit. Subtle info banner: "Showing your assigned loads only. Contact your manager for fleet-wide access."

### Offline / Degraded

- **Full offline:** Banner: "You're offline. Showing last known positions from [timestamp]. Tracking will resume when connection is restored." Markers remain at last cached positions. All action buttons disabled.
- **Degraded (WebSocket down, REST works):** Polling fallback active. Positions update every 15 seconds. Banner: "Live updates delayed. Positions refresh every 15 seconds."
- **GPS stale for a specific load:** Marker turns gray with clock overlay. Side panel shows "Last GPS update: 45 min ago" in red text. Alert in Alerts & Exceptions list.

### Performance Edge Cases

- **500+ active loads:** Use viewport-based loading -- only fetch positions for loads within the current map bounds (plus a 20% buffer). Markers outside the viewport are not rendered. Re-fetch when user pans or zooms.
- **Rapid GPS updates (100+ events/minute):** Batch marker updates in 500ms windows. Maximum 50 marker animations per batch; remaining updates are instant (no animation).
- **Map memory usage:** Limit route polylines to 5 simultaneously visible (the selected load + 4 most recent). Limit position history trail to last 200 points per load.
- **Mobile performance:** Disable smooth marker animations. Use simpler marker icons (circles instead of truck shapes). Reduce geofence rendering to selected load only.

---

## 12. Filters, Search & Sort

### Filters

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | ETA Status | Multi-select chips | On-Time, Tight, At-Risk, Stale | All selected | `?etaStatus=on-time,tight,at-risk,stale` |
| 2 | Load Status | Multi-select dropdown | Dispatched, At Pickup, Picked Up, In Transit, At Delivery, Delivered | AT_PICKUP through AT_DELIVERY (active transit) | `?status=AT_PICKUP,PICKED_UP,IN_TRANSIT,AT_DELIVERY` |
| 3 | Equipment Type | Multi-select dropdown | Dry Van, Reefer, Flatbed, Step Deck, Other | All | `?equipment=DRY_VAN,REEFER` |
| 4 | Carrier | Searchable select | From `/api/v1/carriers?active=true` | All | `?carrierId=uuid` |
| 5 | Customer | Searchable select | From `/api/v1/customers?active=true` | All | `?customerId=uuid` |
| 6 | Region | Multi-select dropdown | US states grouped by region | All | `?region=IL,WI,MN` |
| 7 | Dispatcher | Select (ops_manager+ only) | From `/api/v1/users?role=dispatcher` | All (ops_manager), My Loads (dispatcher) | `?dispatcherId=uuid` |

### Search Behavior

- **Search field:** Single search input with magnifying glass icon in the toolbar.
- **Searches across:** Load number (exact or partial), carrier name, driver name, origin city, destination city.
- **Behavior:** Debounced 300ms, minimum 2 characters. Shows dropdown results below search input (max 5 results). Selecting a result centers the map on that load's marker, zooms to level 10, and opens the side panel.
- **Keyboard:** Enter selects the first result. Escape closes the dropdown. Arrow keys navigate results.
- **URL param:** `?search=LOAD-0847`

### Sort Options

Map markers have no sort order (they are positioned geographically). The bottom timeline strip sorts by appointment time ascending (earliest first, left to right).

### Saved Filters / Presets

- **System presets:** "All Active" (default), "At-Risk Only" (etaStatus=at-risk), "Stale GPS" (etaStatus=stale), "Today's Deliveries" (stops with delivery today), "My Loads" (dispatcher's assigned loads).
- **User-created presets:** Users can save current filter combination by clicking a star icon. Dialog prompts for preset name. Stored per-user.
- **URL sync:** All filter state reflected in URL query params. Bookmarkable and shareable.

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Sidebar collapses to icon-only mode (56px).
- Map fills remaining width. Toolbar compresses: filters collapse into a "Filters" button that opens a slide-over panel. Search remains visible.
- Side panel: Opens as a bottom sheet (50% height) instead of right-side panel, to preserve map visibility.
- Bottom timeline strip: Remains visible but narrower. Horizontal scroll for overflow.
- Cluster thresholds lowered (cluster at 30 markers instead of 50).
- Layer toggles collapse into a single "Layers" button with dropdown.

### Mobile (< 768px)

- Sidebar hidden entirely (hamburger menu).
- Map fills 100% of the viewport.
- Toolbar: Minimal -- only search icon and filter icon visible. Tapping search opens full-width search bar. Tapping filter opens full-screen filter modal.
- Side panel: Opens as a bottom sheet (70% height) with drag handle. Swipe down to dismiss. Only essential info shown: load#, status, ETA, carrier, driver phone (click-to-call), two action buttons.
- Bottom timeline strip: Hidden on mobile (screen real estate too constrained). Accessible via a "Today's Stops" button that opens a full-screen list.
- Markers: Simplified to colored circles (no truck icons) for performance. Tap opens bottom sheet.
- Geofences: Hidden on mobile for performance. Only shown for the selected load.
- Layer toggles: Hidden in a hamburger-style menu overlay.
- Pull-to-refresh: Reloads all GPS positions.

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full layout. Side panel on right (400px). Bottom timeline strip. All map features. |
| Desktop | 1024px - 1439px | Same layout, side panel narrows to 360px. Toolbar slightly compressed. |
| Tablet | 768px - 1023px | Bottom sheet side panel. Collapsed filters. Simplified toolbar. |
| Mobile | < 768px | Full-screen map. Bottom sheet detail. Minimal toolbar. No timeline strip. |

---

## 14. Stitch Prompt

```
Design a full-screen real-time tracking map for a modern freight/logistics TMS (Transportation Management System) called "Ultra TMS." This is the fleet visibility screen where dispatchers and operations managers monitor all active loads on a live map.

Layout: Full-width page with a dark slate-900 sidebar on the left (240px, collapsed to icon-only for this mockup). The main content area is filled entirely by a map (Google Maps or Mapbox style, showing the continental United States). The map has a clean, modern rendering style with muted road colors and clear geographic labels.

Map Toolbar: Floating toolbar at the top of the map (not covering the sidebar) with a semi-transparent white background (bg-white/90 backdrop-blur-sm) and rounded-lg corners, shadow-md. Contains: 4 filter chips ("On-Time" with green-100 bg, "Tight" with yellow-100 bg, "At-Risk" with red-100 bg, "Stale" with gray-100 bg -- all selected by default), a carrier dropdown "Carrier: All", an equipment dropdown "Equipment: All", a search input with magnifying glass "Search loads...", a layers icon button, and a fullscreen icon button. On the far right of the toolbar, show a small green dot with "Live" text indicating active WebSocket connection.

Map Content: Show 15-20 truck markers spread across the US map with realistic positions:
- 10 markers in green (on-time loads), rendered as small truck icons inside green circles with subtle drop shadows. Show heading direction via icon rotation.
- 3 markers in yellow (tight -- ETA close to window), same truck style in yellow circles.
- 2 markers in red (at-risk -- ETA past window), same truck style in red circles with a subtle pulsing red ring animation.
- 1 marker in gray (stale GPS), same truck style in gray circle with a small clock icon overlay.
- 1 cluster marker in the northeast US: a larger circle with "8" in bold white text, blue-600 background, indicating 8 loads clustered together.

Route Lines: For one load (the one with the side panel open), show two route lines:
- Dashed blue-400 line showing the planned route from Chicago to Dallas along I-55 and I-44.
- Solid blue-600 line showing the actual path traveled (overlapping planned route from Chicago down to about Springfield, IL where the truck currently is).

Geofences: Show a subtle semi-transparent green circle (border-green-400, bg-green-100/20, radius representing ~1 mile) around the pickup facility in Chicago (marking the geofence boundary). Show another geofence circle (teal) around the delivery facility in Dallas.

Side Panel: A white panel slides in from the right (400px wide) with subtle shadow-xl on its left edge. Content from top to bottom:
- Close button (X icon) in the top-right corner.
- Load number "LOAD-20260206-0847" in bold 18px monospace, blue-600 color.
- Sky-blue status badge "In Transit" with truck icon.
- Route: "Chicago, IL -> Dallas, TX" with arrow icon.
- Horizontal separator.
- ETA Section: "ETA to Delivery" label in gray-500. "Jan 16, 1:45 PM" in bold 16px. Green badge: "On Time (-15m early)".
- Horizontal separator.
- Carrier Section: "Carrier" label. "Swift Transport" as blue link. "MC# 123456" in gray-500. "Driver: Carlos Martinez" with user icon. "(555) 123-4567" with blue phone icon (click-to-call). "Truck #4521 | Trailer #T-8890" in gray-500.
- Horizontal separator.
- Last Check Call Section: "Last Check Call" label. "Jan 15, 7:45 AM (2h 15m ago)" -- timestamp in gray-600. "Joliet, IL" location with map pin icon. Quoted text: "Driver 15 min out, no issues" in italic.
- Horizontal separator.
- Stops Timeline: Vertical mini-timeline with 2 stops.
  - Stop 1: Filled green circle, "PU - Acme Warehouse, Chicago" with "DEPARTED" emerald badge.
  - Stop 2: Hollow gray circle, "DEL - Beta Corp, Dallas" with "PENDING" gray badge. "ETA: Jan 16, 1:45 PM".
- Horizontal separator.
- Route Info: "920 miles total | 485 miles remaining". "Deviation: None" in green text.
- Horizontal separator.
- Action Buttons Row: "View Full Detail" blue-600 primary button, "Add Check Call" outline button with phone icon. Second row: "Update Status" outline button, "Contact Driver" outline button with phone icon.

Bottom Timeline Strip: A collapsible horizontal strip at the very bottom of the map (60px height, white background with top border, shadow-sm). Shows a horizontal time axis for today (6 AM to 6 PM). Along this axis, small circles represent today's stops:
- Filled green circles at 8:00 AM and 9:30 AM (completed stops) with labels "PU LOAD-47" and "PU LOAD-52".
- A pulsing blue circle at 11:00 AM (active stop) labeled "DEL LOAD-47".
- Hollow gray circles at 1:00 PM, 2:30 PM, and 5:00 PM (pending stops) labeled "PU LOAD-61", "DEL LOAD-52", "DEL LOAD-61".
- A thin gray line connecting all circles along the time axis.

Design Specifications:
- Font: Inter or system sans-serif, 14px base
- Map: Clean, modern cartography (light gray roads, subtle labels, no clutter). Similar to Mapbox Light or Google Maps Silver theme.
- Sidebar: slate-900, white text, blue-600 active indicator on "Tracking" item
- Toolbar: bg-white/90 backdrop-blur-sm, rounded-lg, shadow-md, floating over map with 16px margin from edges
- Side panel: white background, shadow-xl, smooth slide-in animation (300ms ease-out)
- Markers: 36px diameter circles with 24px truck icons inside. Drop shadow for depth. Green (#10B981), Yellow (#F59E0B), Red (#EF4444), Gray (#9CA3AF) for stale.
- Cluster: 48px circle, blue-600 background, white bold count text, shadow-lg
- Route lines: planned = dashed blue-400 (4px, dash: 12px gap: 8px), actual = solid blue-600 (4px)
- Geofences: 2px border, 10% fill opacity, green for pickup, teal for delivery
- Cards in side panel: white bg, rounded-lg, border-gray-200
- Action buttons: blue-600 primary, gray outline for secondary
- Modern SaaS aesthetic similar to Linear.app or Vercel dashboard
- The overall feel should be clean, data-dense but not cluttered, with the map as the dominant visual element and the side panel as a focused detail overlay
```

---

## 15. Enhancement Opportunities

### Current State (Wave 2)

**What's built and working:**
- [ ] Nothing yet -- screen is Not Started.

**What needs to be built for MVP:**
- [ ] Full-screen map integration (Google Maps or Mapbox GL JS)
- [ ] Live GPS markers for all active loads with color-coding by ETA status
- [ ] Marker click opens side panel with load summary
- [ ] Hover tooltips on markers
- [ ] Geofence circles around active pickup/delivery facilities
- [ ] Planned vs actual route polylines for selected load
- [ ] Cluster markers when zoomed out
- [ ] Toolbar with status/equipment/carrier/customer/region filters
- [ ] Load search (centers map on result)
- [ ] Traffic layer toggle
- [ ] WebSocket integration for real-time position updates
- [ ] Bottom timeline strip showing today's stops
- [ ] Connection status indicator

**What to add this wave (post-MVP polish):**
- [ ] Weather overlay toggle
- [ ] Route deviation detection and alerts
- [ ] Geofence auto-event triggers (auto-arrive/depart)
- [ ] Driver breadcrumb trail
- [ ] Night mode map theme
- [ ] Kiosk mode for wall-mounted monitors

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Full-screen map with live markers | High | High | P0 |
| Marker color-coding by ETA | High | Medium | P0 |
| Side panel with load details | High | Medium | P0 |
| WebSocket real-time position updates | High | Medium | P0 |
| Geofence circles | High | Medium | P0 |
| Route polylines (planned vs actual) | High | Medium | P0 |
| Cluster markers | Medium | Medium | P0 |
| Toolbar filters and search | High | Medium | P0 |
| Traffic layer toggle | Medium | Low | P1 |
| Bottom timeline strip | Medium | Medium | P1 |
| Weather overlay | Medium | Medium | P1 |
| Route deviation alerts | High | High | P1 |
| Geofence auto-events | High | High | P1 |
| Driver breadcrumb trail | Medium | Medium | P2 |
| Historical playback | Medium | High | P2 |
| Heat map mode | Low | High | P2 |
| Facility pins | Low | Medium | P2 |
| Speed alerts | Medium | Medium | P2 |
| Kiosk mode | Low | Medium | P2 |
| Night mode | Low | Low | P2 |
| Export map screenshot | Low | Low | P2 |

### Future Wave Preview

- **Wave 3:** Add geofence auto-event triggers. Add weather overlay with severe weather alerts affecting loads on a route. Add route deviation detection with automatic alerts. Add facility pins from the facility database. Add driver breadcrumb trail (last 24 hours of GPS positions).
- **Wave 4:** AI-powered predictive ETA based on historical traffic patterns, weather forecasts, and driver behavior. Automated delay notifications to customers when ETA changes. Historical playback for post-incident analysis. Heat map mode for capacity planning. Integration with external tracking providers (MacroPoint, project44, FourKites) for carriers without ELD.

---

<!--
DESIGN NOTES:
- The tracking map is one of the most technically complex screens in Ultra TMS. It requires integration with a mapping SDK (Google Maps JavaScript API or Mapbox GL JS), real-time WebSocket position streaming, custom marker rendering, route polyline management, geofence overlay drawing, and clustering algorithms.
- Performance is critical: with 200+ active loads, the map must maintain 60fps pan/zoom with markers animating smoothly. Viewport-based loading and marker virtualization are essential.
- The map is the second most frequently viewed screen after the Dispatch Board. Many dispatch offices display it on a wall-mounted monitor running continuously.
- Geofence auto-events are a high-value feature that eliminates manual "mark arrived" clicks. However, they require careful tuning of geofence radii to avoid false triggers (e.g., a highway passing within 1 mile of a facility).
- The bottom timeline strip provides temporal context that the geographic map cannot -- it answers "what's happening when?" while the map answers "what's happening where?"
-->
