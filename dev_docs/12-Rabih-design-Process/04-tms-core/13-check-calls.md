# Check Calls

> Service: TMS Core (Service 04) | Wave: 2 | Priority: P0
> Route: /(dashboard)/loads/[id]/check-calls | Also: /(dashboard)/operations/check-calls | Status: Not Started
> Primary Personas: Maria Rodriguez (Dispatcher, 50+ loads/day), Sarah Chen (Operations Manager)
> Roles with Access: dispatcher, ops_manager, admin, support (read-only)
> Screen Type: List + Form

---

## 1. Purpose & Business Context

**What this screen does:**
The Check Calls screen serves two purposes: (1) it displays a chronological list of all driver check-in records for a single load or across all loads, and (2) it provides a quick-entry form for dispatchers to log new check calls when a driver phones in their position, ETA, and status. Each check call record includes the load number, the time of the call, the driver's reported or GPS-derived location, the updated ETA to the next stop, any notes from the conversation, and the load's status at the time of the call. The screen color-codes entries by ETA status: green (on-time), yellow (tight schedule), red (late -- ETA past appointment window). It also supports scheduling the next check call reminder so that dispatchers never forget to follow up.

**Business problem it solves:**
Check calls are the heartbeat of freight tracking. Every 2-4 hours, a dispatcher must contact the driver (or the driver calls in) to verify position, condition of freight, and updated ETA. Without a structured system, dispatchers track check calls via sticky notes, spreadsheets, or memory -- resulting in 15-25% of in-transit loads going 4+ hours without a check call. This creates blind spots where loads go off-track, detention accrues, and customers receive no updates. When a customer asks "Where is my load?", the dispatcher scrambles to find the last note they scribbled. This screen eliminates the scramble by providing a structured log with instant recall, overdue alerts, and scheduled reminders. It also integrates with GPS tracking so that when a driver has an ELD or tracking app, check calls can be auto-populated with GPS location, reducing the call from 2 minutes to 30 seconds.

**Key business rules:**
- Check calls are required every 4 hours minimum for loads in IN_TRANSIT status. The system generates overdue alerts for loads missing check calls beyond this threshold.
- Each check call must be associated with a specific load and optionally a specific stop.
- GPS auto-population: If the driver's tracking app provides real-time GPS, the location fields (lat, lng, city, state) are auto-filled. The dispatcher can override if needed (e.g., driver reports being at a different location than GPS shows).
- Check call notes are free-text but the system encourages structured information: location, ETA, issues, weather, fuel stop, etc.
- ETA entered on a check call automatically updates the load's ETA to the next stop and triggers `load:eta:updated` WebSocket event.
- Check calls logged after the load reaches DELIVERED status are allowed (for record-keeping) but flagged as "post-delivery" and do not update ETAs.
- The "next check call reminder" creates a scheduled notification that fires at the specified time, appearing in the dispatcher's notification center and dashboard alerts.
- Check call timestamps use the server timestamp for consistency, but dispatchers can adjust the time if logging a delayed entry (backdated up to 4 hours without manager approval).

**Success metric:**
Percentage of in-transit loads with check calls within the 4-hour window increases from 75% to 98%. Average time to log a check call drops from 2 minutes (manual notes) to 30 seconds (structured form with GPS auto-fill). Customer "where is my load?" calls decrease by 40% as proactive updates become the norm.

---

## 2. User Journey Context

**Comes from (entry points):**

| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Load Detail | Click "Check Calls" tab or "Log Check Call" button | `loadId` via route param |
| Dispatch Board | Right-click load card > "Add Check Call" | `loadId`, current stop context |
| Tracking Map | Side panel > "Add Check Call" button | `loadId`, GPS coordinates pre-filled |
| Operations Dashboard | Click "Missing Check Call" alert > "Log Check Call" quick action | `loadId` pre-filled |
| Sidebar Navigation | Click "Check Calls" in TMS Core sidebar group | None (fleet-scoped view) |
| Notification Center | Click "Check call overdue" notification | `loadId` pre-filled, form auto-opens |
| Stop Management | Click "Check Call" button on a specific stop | `loadId`, `stopId` pre-filled |
| Load Timeline | Click "Log Check Call" button in header | `loadId` |
| Direct URL | Bookmark / shared link | Route params, query filters |

**Goes to (exit points):**

| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Load Detail | Click load number link in check call row | `loadId` |
| Tracking Map | Click location link (city/state) on a check call | `loadId`, centers map on GPS coordinates |
| Stop Management | Click stop reference in a check call entry | `loadId`, `stopId` |
| Status Updates | Click "Status at time" badge if status changed | `loadId`, status change event |
| Load Timeline | Click "View Timeline" in header | `loadId` |

**Primary trigger:**
Maria receives a phone call from a driver. She pulls up the load (either from the dispatch board or by searching the load number), clicks "Log Check Call," fills in the location, ETA, and notes, and submits. The entire process should take 30 seconds or less. She also checks the fleet-scoped view periodically to identify loads that are overdue for check calls and proactively reaches out.

**Success criteria (user completes the screen when):**
- Check call has been logged with location, ETA, and notes.
- Next check call reminder has been scheduled.
- ETA has been automatically updated on the load.
- All overdue check call alerts have been addressed (calls made or reminders set).

---

## 3. Layout Blueprint

### Desktop Layout (1440px+) -- Load-Scoped View

```
+------------------------------------------------------------------+
|  Breadcrumb: Loads > LOAD-20260206-0847 > Check Calls             |
+------------------------------------------------------------------+
|  Load Header Bar (compact)                                         |
|  LOAD-0847 | IN_TRANSIT | Swift Transport | Chicago,IL > Dallas,TX|
|  Driver: Carlos M. | (555) 123-4567 [Call]                        |
|  Last Check Call: 2h 15m ago | Next Due: 1h 45m [Set Reminder]   |
+------------------------------------------------------------------+
|                                                                    |
|  +-- NEW CHECK CALL FORM (collapsible, default expanded) ------+ |
|  |                                                               | |
|  |  +--LEFT (location)--------+  +--RIGHT (eta & notes)------+  | |
|  |  | Location                 |  | ETA to Next Stop          |  | |
|  |  | City: [Springfield    ]  |  | Date: [Jan 16         ]   |  | |
|  |  | State: [IL            ]  |  | Time: [1:45 PM        ]   |  | |
|  |  | Description:             |  | Status: [On Time   v  ]   |  | |
|  |  | [I-55 south, mile 142]  |  |                            |  | |
|  |  |                          |  | Notes:                     |  | |
|  |  | GPS: Auto ● 39.78, -89.6|  | [Driver reports no issues. |  | |
|  |  | [Override manual]        |  |  Clear weather, light      |  | |
|  |  |                          |  |  traffic. Full fuel.]      |  | |
|  |  +--------------------------+  |                            |  | |
|  |                                | Next Check Call:            |  | |
|  |                                | [In 4 hours v] [Custom]    |  | |
|  |                                |                            |  | |
|  |                                +----------------------------+  | |
|  |                                                               | |
|  |  [Save Check Call]  [Save & Close Form]  [Cancel]            | |
|  +---------------------------------------------------------------+ |
|                                                                    |
|  +-- CHECK CALL HISTORY ----------------------------------------+ |
|  |                                                               | |
|  |  [Filter: All v] [Color: ● On Time  ● Tight  ● Late]        | |
|  |                                                               | |
|  |  +-- #5 -- Jan 15 7:45 AM -------- [ON TIME] green --------+ | |
|  |  | Location: Joliet, IL (GPS ●)                              | | |
|  |  | ETA: Jan 15 8:15 AM | 15 min to next stop                | | |
|  |  | "Driver 15 min out, no issues. Clear weather."            | | |
|  |  | Logged by: Maria R. | Source: Manual | Call duration: 45s | | |
|  |  +-----------------------------------------------------------+ | |
|  |       |  37 min gap                                           | |
|  |  +-- #4 -- Jan 15 7:08 AM -------- [ON TIME] green --------+ | |
|  |  | Location: Wilmington, IL (GPS ●)                          | | |
|  |  | ETA: Jan 15 8:20 AM | 1h 12m to next stop                | | |
|  |  | "Passed Wilmington, smooth sailing. Good weather."        | | |
|  |  | Logged by: Maria R. | Source: Manual                      | | |
|  |  +-----------------------------------------------------------+ | |
|  |       |  2h 38m gap                                           | |
|  |  +-- #3 -- Jan 15 4:30 AM -------- [TIGHT] yellow ---------+ | |
|  |  | Location: Bloomington, IL (GPS ●)                         | | |
|  |  | ETA: Jan 15 8:30 AM | 3h 45m to next stop                | | |
|  |  | "Fuel stop at Bloomington. ETA tight but on track."       | | |
|  |  | Logged by: Carlos M. (Driver App) | Source: Auto          | | |
|  |  +-----------------------------------------------------------+ | |
|  |       |  4h 10m gap  [!OVERDUE WARNING]                       | |
|  |  +-- #2 -- Jan 15 12:20 AM ------- [ON TIME] green --------+ | |
|  |  | Location: Springfield, IL (GPS ●)                         | | |
|  |  | ETA: Jan 15 8:00 AM | 7h 40m to next stop                | | |
|  |  | "Passing through Springfield. All good."                  | | |
|  |  | Logged by: Night Dispatch (Jake P.) | Source: Manual       | | |
|  |  +-----------------------------------------------------------+ | |
|  |       |  1h 50m gap                                           | |
|  |  +-- #1 -- Jan 14 10:30 PM ------- [ON TIME] green --------+ | |
|  |  | Location: Chicago, IL - Acme Warehouse                    | | |
|  |  | ETA: Jan 15 8:00 AM | 9h 30m to destination              | | |
|  |  | "Loaded and departing. BOL signed. All good."             | | |
|  |  | Logged by: Maria R. | Source: Manual                      | | |
|  |  +-----------------------------------------------------------+ | |
|  +---------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

### Desktop Layout -- Fleet-Scoped View

```
+------------------------------------------------------------------+
|  PageHeader: "Check Calls"                                         |
|  Subtitle: "Driver check-in log and overdue tracking"             |
|  Right: [Log Check Call] [Export]                                  |
+------------------------------------------------------------------+
|  KPI Strip                                                         |
|  [Total Today: 156] [Overdue: 7 !!] [On Time: 82%] [Auto: 34%]  |
+------------------------------------------------------------------+
|  Filter Bar                                                        |
|  [Date: Today v] [Load#: ________] [Status: All v]               |
|  [Logged By: All v] [Source: All v] [ETA: All v]                  |
+------------------------------------------------------------------+
|                                                                    |
|  +--------------------------------------------------------------+ |
|  | Check Call Log (DataTable)                                    | |
|  |--------------------------------------------------------------| |
|  | Time        | Load #      | Location      | ETA to Next      | |
|  | ETA Status  | Notes       | Logged By     | Source            | |
|  |--------------------------------------------------------------| |
|  | 7:45 AM     | LOAD-0847  | Joliet, IL    | Jan 15 8:15 AM   | |
|  | ● On Time   | Driver 15m..| Maria R.      | Manual            | |
|  |--------------------------------------------------------------| |
|  | 7:30 AM     | LOAD-0852  | Memphis, TN   | Jan 15 2:00 PM   | |
|  | ● Late      | Traffic on..| Maria R.      | Manual            | |
|  |--------------------------------------------------------------| |
|  | 7:08 AM     | LOAD-0847  | Wilmington,IL | Jan 15 8:20 AM   | |
|  | ● On Time   | Smooth sail.| Maria R.      | Manual            | |
|  |--------------------------------------------------------------| |
|  | ... more rows ...                                             | |
|  +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible per entry) | Timestamp, load number, location (city/state), ETA to next stop, ETA status color | These are the 5 data points a dispatcher needs to assess load status: when was the last contact, which load, where is the driver, when will they arrive, and is that on time |
| **Secondary** (visible per entry, supporting) | Notes text (truncated), logged by, source (manual/auto/GPS), GPS indicator | Context for the check call -- what did the driver say, who logged it, was it from a phone call or automated |
| **Tertiary** (visible on expand) | Full notes text, GPS coordinates, stop reference, call duration, next check call reminder, weather at location | Detailed data for investigation or follow-up |
| **Hidden** (behind navigation) | Full load detail, stop management, tracking map position, carrier details | Deep context accessed via link navigation |

---

## 4. Data Fields & Display

### Check Call Record Fields

| # | Field Label | Source (Entity.field) | Format / Display | Location |
|---|---|---|---|---|
| 1 | Check Call ID | CheckCall.id | Internal only (not displayed to user) | -- |
| 2 | Timestamp | CheckCall.calledAt | "Jan 15, 7:45 AM" (12-hour format). Relative time on hover: "2h 15m ago". Full precision in expanded view: "Jan 15, 2026 7:45:22 AM CST" | Entry header, left |
| 3 | Load Number | CheckCall.loadNumber | `LOAD-20260206-0847` monospace, bold, blue-600 link | Entry header or table column |
| 4 | Location Description | CheckCall.locationDescription | Free text: "I-55 south, mile marker 142" or "Joliet, IL" | Entry body |
| 5 | City | CheckCall.city | "Joliet" | Entry body (location section) |
| 6 | State | CheckCall.state | "IL" (2-letter abbreviation) | Entry body, after city |
| 7 | Latitude | CheckCall.lat | Decimal (39.7817) -- not displayed directly, used for map links | Hidden (used for GPS indicator and map) |
| 8 | Longitude | CheckCall.lng | Decimal (-89.6501) | Hidden |
| 9 | GPS Source | CheckCall.gpsSource | Badge: "GPS ●" (green, auto from device) or "Manual" (gray, typed by dispatcher) | Entry body, after location |
| 10 | ETA to Next Stop | CheckCall.etaToNextStop | "Jan 15, 8:15 AM" datetime | Entry body (ETA section) |
| 11 | ETA Variance | Calculated | "On Time (-15m early)" green, "Tight (+45m)" yellow, "Late (+2h 15m)" red | Entry header, right (color-coded badge) |
| 12 | Notes | CheckCall.notes | Free text, up to 500 characters. Truncated at 120 chars in list with "more..." link. | Entry body (notes section) |
| 13 | Logged By | CheckCall.calledBy.name | User name with avatar. "Driver App (Carlos M.)" for auto-entries. | Entry footer |
| 14 | Source | CheckCall.source | Badge: "Manual" (gray), "Auto" (green, from driver app or GPS), "WebSocket" (purple, from tracking integration) | Entry footer |
| 15 | Status at Time | CheckCall.statusAtTime | StatusBadge showing load status at the time of the check call | Entry footer |
| 16 | Stop Reference | CheckCall.stopId | If linked to a specific stop: "Stop 2: DEL - Beta Corp" clickable link | Entry body (optional) |
| 17 | Next Check Call | CheckCall.nextCheckCallAt | "Reminder: Jan 15, 11:45 AM (in 4h)" or null | Entry footer (if set) |

### New Check Call Form Fields

| # | Field Label | Field Name | Type | Required | Validation | Default Value |
|---|---|---|---|---|---|---|
| 1 | Load | load_id | Searchable select | Yes | Must be an active load | Pre-filled from URL param |
| 2 | Stop | stop_id | Select | No | Must be a stop on the selected load | Auto-selects "next stop" |
| 3 | City | city | Text input | Yes | 2-100 characters | Auto-populated from GPS if available |
| 4 | State | state | Select (US states) | Yes | Valid US state code | Auto-populated from GPS if available |
| 5 | Location Description | location_description | Text input | No | 0-200 characters | Auto-populated from GPS reverse geocode |
| 6 | Latitude | lat | Number (hidden) | No | Valid latitude (-90 to 90) | Auto-populated from GPS |
| 7 | Longitude | lng | Number (hidden) | No | Valid longitude (-180 to 180) | Auto-populated from GPS |
| 8 | ETA to Next Stop | eta_to_next_stop | DateTime picker | Yes | Must be in the future (or within 30 min past for backdating) | Auto-calculated from current GPS + routing API |
| 9 | Notes | notes | Textarea | No | 0-500 characters | Empty |
| 10 | Called At | called_at | DateTime picker | Yes | Within last 4 hours (or manager override) | Current timestamp |
| 11 | Next Check Call | next_check_call_at | Preset + custom | No | Must be in the future | "In 4 hours" (auto-calculated) |

### Calculated / Derived Fields

| # | Field | Calculation | Format |
|---|---|---|---|
| 1 | ETA Variance | `checkCall.etaToNextStop vs nextStop.appointmentTimeTo` | Green "On Time" if ETA before appointment end, Yellow "Tight" if within 1 hour, Red "Late" if past appointment |
| 2 | Time Since Last Check Call | `now() - lastCheckCall.calledAt` | "2h 15m" -- red if > 4 hours, amber if 3-4 hours, green if < 3 hours |
| 3 | Time Until Next Due | `lastCheckCall.calledAt + 4 hours - now()` | "1h 45m until due" -- negative values show "Overdue by X" in red |
| 4 | Check Call Gap | `checkCall[n].calledAt - checkCall[n-1].calledAt` | "37 min gap" between entries. Red "4h 10m gap [OVERDUE]" if > 4 hours |
| 5 | Distance to Next Stop | GPS distance calculation | "142 miles remaining" |
| 6 | Auto-ETA | GPS position + routing API | Suggested ETA based on current position and traffic |
| 7 | Call Duration | `checkCall.endedAt - checkCall.startedAt` (if tracked) | "45s" or "2m 15s" |

### KPI Strip Fields (Fleet-Scoped View)

| # | Field | Calculation | Format |
|---|---|---|---|
| 1 | Total Today | Count of check calls logged today | "156 today" |
| 2 | Overdue | Count of active loads missing check call > 4 hours | "7 overdue" with red badge. Red text if > 0. |
| 3 | On-Time % | Percentage of check calls where ETA was on-time or early | "82% on-time" with green text |
| 4 | Auto Rate | Percentage of check calls from automated sources | "34% automated" with blue text |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] Load-scoped view: chronological list of all check calls for a single load with ETA color coding
- [ ] Fleet-scoped view: DataTable of all check calls across loads with filters and pagination
- [ ] Quick entry form: structured form with load selector, city/state, location description, ETA, notes
- [ ] GPS auto-population: when driver app or tracking device provides GPS, auto-fill city, state, lat, lng, and location description via reverse geocoding
- [ ] ETA color coding per entry: green (on-time), yellow (tight), red (late) based on ETA vs appointment window
- [ ] Check call gap indicators: show time between consecutive check calls; flag gaps > 4 hours with overdue warning
- [ ] Next check call reminder scheduler: preset options (In 2 hours, In 4 hours, Custom) that create a notification
- [ ] Load header bar (load-scoped) with load#, status, carrier, driver, last check call time, next due time
- [ ] Filter by date, load number, ETA status, logged by, source
- [ ] Sort by timestamp (default: newest first)
- [ ] Pagination: 25 per page (fleet view)
- [ ] Click load number to navigate to Load Detail
- [ ] Click location to view on Tracking Map
- [ ] KPI strip (fleet view) with total, overdue, on-time %, auto rate
- [ ] WebSocket: new check call entries appear in real-time

### Advanced Features (Logistics Expert Recommendations)

- [ ] **GPS auto-populate from tracking device** -- When the load has an active GPS device, the form pre-fills location with current GPS coordinates and reverse-geocoded city/state. Green "GPS ●" indicator confirms live data. Dispatcher can override if driver reports being elsewhere.
- [ ] **One-click quick check call** -- For loads with GPS tracking, a "Quick Check Call" button in the load header auto-creates a check call with GPS location, auto-calculated ETA, and default notes "Automated GPS check-in." No form interaction needed.
- [ ] **Check call templates** -- Save frequently used note templates: "All good, on schedule", "Fuel stop, resuming shortly", "Traffic delay, updated ETA", "Weather delay", "Mechanical issue." Click template to auto-fill notes field.
- [ ] **Overdue check call dashboard widget** -- Red-badged count in sidebar navigation and dashboard showing loads overdue for check calls. Click navigates to fleet view filtered to overdue loads.
- [ ] **Driver app integration** -- When a driver submits a check call via the mobile app, it appears automatically with "Driver App" source badge and GPS coordinates. No dispatcher action needed.
- [ ] **Bulk check call creation** -- Select multiple loads, enter a common note (e.g., "Weather delay affecting all Chicago-area loads"), and create check calls for all selected loads simultaneously.
- [ ] **Check call recording** -- Optionally record phone calls for compliance. Audio attachment linked to check call record. (Wave 3+).
- [ ] **Smart ETA suggestion** -- When dispatcher enters location, system suggests ETA based on distance to next stop, current time, and historical transit speed on this lane. Suggestion shown below ETA field as "Suggested: 2:30 PM based on 485 miles at 58 mph avg."
- [ ] **Weather at location** -- Show current weather conditions at the driver's reported location. "72F, Clear" or "35F, Snow -- possible delays."
- [ ] **Proactive check call scheduling** -- System automatically schedules check calls at optimal intervals based on load urgency, distance, and historical patterns. Dispatchers see a pre-populated schedule.

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| Log new check call | dispatcher, ops_manager, admin | `checkcall_create` | Form hidden; view-only mode for history |
| View fleet-scoped check calls | dispatcher, ops_manager, admin | `checkcall_view_all` | Only sees check calls for own loads |
| Backdate check call > 4 hours | ops_manager, admin | `checkcall_backdate` | "Called At" field locked to max 4 hours in the past |
| Delete check call | admin | `checkcall_delete` | No delete action available |
| Bulk create check calls | ops_manager, admin | `checkcall_bulk` | Bulk create option hidden |
| Export check calls | dispatcher, ops_manager, admin | `export_data` | Export button hidden |
| View all users' check calls | ops_manager, admin | `checkcall_view_all` | "Logged By" filter limited to self |

---

## 6. Status & State Machine

Check calls do not have their own status machine. They are point-in-time records. However, they reference and are categorized by two related status systems:

### ETA Status Classification (Per Check Call)

```
[ETA Assessment] based on: checkCall.etaToNextStop vs nextStop.appointmentTimeTo

                                ETA before appointment end
                                          |
                                          v
                                  [ON_TIME] green
                                     badge: ● On Time
                                     color: green-600

                       ETA within 1 hour of appointment end
                                          |
                                          v
                                   [TIGHT] yellow
                                     badge: ● Tight
                                     color: amber-500

                           ETA past appointment window
                                          |
                                          v
                                   [LATE] red
                                     badge: ● Late
                                     color: red-600

                      No ETA provided or load already delivered
                                          |
                                          v
                                [UNKNOWN] gray
                                     badge: ● N/A
                                     color: gray-400
```

### Check Call Freshness Classification (Per Load)

```
[Freshness] based on: now() - load.lastCheckCall.calledAt

                                < 3 hours since last call
                                          |
                                          v
                                   [FRESH] green
                                     indicator: green dot

                             3-4 hours since last call
                                          |
                                          v
                                 [AGING] amber
                                     indicator: amber dot, "Due soon"

                              > 4 hours since last call
                                          |
                                          v
                                [OVERDUE] red
                                     indicator: red dot, "OVERDUE"
                                     triggers: dashboard alert, notification
```

### Load Status at Time of Check Call

Each check call captures `statusAtTime` -- the load's status when the check call was logged. This is displayed as a small StatusBadge on the check call entry using the standard LOAD_STATUS colors from the global system.

### ETA Status Badge Colors

| ETA Status | Background | Text | Border | Icon |
|---|---|---|---|---|
| ON_TIME | `green-100` | `green-700` | `green-300` | Filled circle (green-600) |
| TIGHT | `amber-100` | `amber-700` | `amber-300` | Filled circle (amber-500) |
| LATE | `red-100` | `red-700` | `red-300` | Filled circle (red-600) |
| UNKNOWN | `gray-100` | `gray-500` | `gray-300` | Hollow circle (gray-400) |

---

## 7. Actions & Interactions

### Primary Action Buttons (Page Header / Load Header)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| Log Check Call | `PhoneCall` | Primary / Blue-600 | Opens/focuses the check call entry form. If load-scoped, load is pre-filled. If fleet-scoped, load selector is empty. | No |
| Call Driver | `Phone` | Secondary / Outline | Initiates phone call to driver via tel: protocol (load-scoped view only) | No |
| Set Reminder | `Bell` | Secondary / Outline | Opens reminder scheduler for next check call on this load | No |
| Export | `Download` | Secondary / Outline | Exports check call history as CSV (fleet view) | No |

### Form Actions

| Button Label | Icon | Variant | Action | Validation |
|---|---|---|---|---|
| Save Check Call | `Check` | Primary / Blue-600 | Submits the check call form, creates the record, updates load ETA | All required fields must be populated. ETA must be valid. |
| Save & Close | `CheckCheck` | Secondary / Outline | Saves and collapses the form | Same as Save |
| Cancel | `X` | Ghost / text | Discards form input and collapses the form | No -- immediate discard |
| Use GPS Location | `MapPin` | Text link (green) | Refreshes GPS auto-population from tracking device | GPS device must be active |
| Override Manual | `Edit` | Text link (gray) | Switches from GPS-auto to manual location entry | No |

### Check Call Entry Actions

| Action | Icon | Trigger | Behavior |
|---|---|---|---|
| View Load | `ExternalLink` | Click load number link | Navigates to Load Detail |
| View on Map | `MapPin` | Click location link or map icon | Navigates to Tracking Map centered on GPS coordinates |
| Expand | `ChevronDown` | Click entry card | Expands to show full notes, GPS coordinates, stop reference, call metadata |
| Edit | `Edit` | Click edit icon (only on own recent entries, within 30 min) | Opens inline edit for notes field only |
| Delete | `Trash` | Click delete icon (admin only) | Confirmation dialog, then soft-delete |
| Copy Notes | `Copy` | Click copy icon on notes | Copies check call notes to clipboard |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `N` | Focus "Log Check Call" form / open form if collapsed |
| `Ctrl/Cmd + Enter` | Submit check call form (when form is focused) |
| `Escape` | Cancel/close form, collapse expanded entry |
| `J` / `ArrowDown` | Move to next check call entry |
| `K` / `ArrowUp` | Move to previous check call entry |
| `Enter` | Expand/collapse focused entry |
| `O` | Open Load Detail for focused entry |
| `Ctrl/Cmd + E` | Export (fleet view) |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| N/A | N/A | No drag-and-drop on this screen. |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Namespace | Payload | UI Update |
|---|---|---|---|
| `checkcall:received` | `/tracking` | `{ loadId, checkCallId, calledBy, location, city, state, etaToNextStop, notes, source, timestamp }` | Prepend new check call entry at top of list (load-scoped) or table (fleet-scoped) with slide-in animation. Update "Time Since Last Check Call" in load header. Clear overdue warning if this resolves it. Flash entry with blue-50 highlight for 3 seconds. Increment KPI strip "Total Today" counter. |
| `load:eta:updated` | `/tracking` | `{ loadId, stopId, previousEta, newEta, reason }` | If viewing this load's check calls, update the ETA status badges on relevant entries if the appointment window changed. Update the header's ETA display. |
| `load:status:changed` | `/dispatch` | `{ loadId, previousStatus, newStatus }` | Update load header status badge (load-scoped). If load moved to DELIVERED, show "Post-delivery" label on any new check call entries. |
| `checkcall:reminder:due` | `/notifications` | `{ loadId, loadNumber, scheduledAt }` | Show toast notification: "Check call due for LOAD-0847." If on check calls screen, highlight the load's entry with amber pulse. |

### Live Update Behavior

- **Update frequency:** WebSocket push for every new check call. Real-time appearance within 2 seconds.
- **Visual indicator:** New entries slide in from the top (list view) or appear at the top of the table (fleet view) with a blue-50 background that fades over 3 seconds. Entry count updates in KPI strip with a brief number tick-up animation.
- **Conflict handling:** Check calls are append-only -- no editing conflicts. If two dispatchers log a check call for the same load simultaneously, both entries appear.
- **Batching:** Bulk check call creation (multiple loads) events arrive within 500ms and are batched into a single visual update.

### Polling Fallback

- **When:** WebSocket `/tracking` connection drops.
- **Interval:** Every 30 seconds.
- **Endpoint:** `GET /api/v1/checkcalls?since={lastTimestamp}&loadId={loadId}` (load-scoped) or `GET /api/v1/checkcalls?since={lastTimestamp}` (fleet-scoped).
- **Visual indicator:** Amber dot with "Updates may be delayed" in header area.

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Save check call | New entry immediately appears at top of list with "Saving..." indicator. ETA badge calculated locally. "Time Since Last Check Call" resets to "Just now." Form collapses. | Entry removed from list. Form re-opens with previously entered data preserved. Toast: "Failed to save check call: [reason]. Your data has been preserved." |
| Edit notes | Notes text updates inline immediately. | Notes revert to original text. Toast: "Failed to update notes." |
| Delete check call | Entry fades out with animation. | Entry fades back in. Toast: "Failed to delete check call." |
| Set reminder | Reminder time appears in load header. | Reminder cleared. Toast: "Failed to set reminder." |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| `PageHeader` | `src/components/layout/page-header.tsx` | `title: "Check Calls"`, `actions: [LogCheckCall, Export]` |
| `DataTable` | `src/components/ui/data-table.tsx` | Fleet-scoped table with columns, pagination, sorting |
| `StatusBadge` | `src/components/ui/status-badge.tsx` | Load status at time of check call |
| `Badge` | `src/components/ui/badge.tsx` | Source badges, ETA status badges |
| `FilterBar` | `src/components/ui/filter-bar.tsx` | Date, load number, ETA status, source filters |
| `Card` | `src/components/ui/card.tsx` | Check call entry cards (load-scoped), KPI cards |
| `Button` | `src/components/ui/button.tsx` | Form submit, action buttons |
| `Input` | `src/components/ui/input.tsx` | City, location description text inputs |
| `Textarea` | `src/components/ui/textarea.tsx` | Notes field |
| `Select` | `src/components/ui/select.tsx` | State selector, load selector, stop selector |
| `Calendar` | `src/components/ui/calendar.tsx` | ETA date picker, called_at picker |
| `Tooltip` | `src/components/ui/tooltip.tsx` | Full timestamps, GPS coordinates |
| `Avatar` | `src/components/ui/avatar.tsx` | Logged-by user avatars |
| `Skeleton` | `src/components/ui/skeleton.tsx` | Loading states |
| `Collapsible` | `src/components/ui/collapsible.tsx` | Form expand/collapse, entry expand |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| `FilterBar` | Standard filters | Add "ETA Status" color-coded chip filter (green/yellow/red circles). Add "Source" badge-style filter. |
| `DataTable` | Standard table | Add left-border color-coding per row based on ETA status (green/yellow/red 3px left border). |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| `CheckCallEntryForm` | Structured form for logging a new check call. Two-column layout: location (left) and ETA/notes (right). GPS auto-populate toggle. Next reminder scheduler. Submit/cancel buttons. Collapsible. | High -- GPS integration, auto-populate, ETA calculation, reminder scheduling, validation |
| `CheckCallCard` | Individual check call entry card for the load-scoped list view. Shows timestamp, location, ETA with color badge, notes (truncated), logged-by, source badge. Expandable for full details. | Medium -- color-coded left border, expand/collapse, action buttons |
| `CheckCallGapIndicator` | Visual connector between consecutive check call cards showing the time gap. Normal text for < 4h gaps, red warning badge for > 4h gaps ("OVERDUE"). | Small -- time calculation, conditional styling |
| `EtaStatusBadge` | Color-coded circle + text badge showing ETA assessment: "On Time" (green), "Tight" (yellow), "Late" (red). Reusable across check calls and tracking map. | Small -- conditional color, time comparison |
| `GPSIndicator` | Small indicator showing GPS data source. Green dot "GPS ●" for auto-GPS. Gray dot "Manual" for dispatcher-entered. Tooltip shows coordinates. | Small -- conditional icon/color |
| `CheckCallReminderPicker` | Preset selector for next check call timing: "In 2 hours", "In 3 hours", "In 4 hours", "Custom" (opens time picker). Creates scheduled notification. | Small -- preset options, custom picker, API call |
| `CheckCallKPIStrip` | Row of mini stat cards for fleet-scoped view: Total Today, Overdue (red), On-Time %, Auto Rate. | Small -- stat card layout, conditional red styling for overdue |
| `OverdueWarningBanner` | Banner displayed in load header when check call is overdue (> 4 hours). Shows time overdue and "Log Check Call Now" CTA button. Red background with clock icon. | Small -- conditional display, timer |
| `CheckCallNoteTemplates` | Dropdown/popover with predefined note templates. Click template to auto-fill notes textarea. Customizable templates saved per user. | Small -- template list, click to fill |
| `LoadCheckCallHeader` | Compact load header for load-scoped view showing load#, status, carrier, driver (with click-to-call), last check call time, next due time with countdown. | Medium -- multiple data points, timer, click-to-call |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Collapsible | `collapsible` | Check call form expand/collapse, entry expand |
| Popover | `popover` | Reminder time picker, note templates dropdown |
| Command | `command` | Load search/select in form |
| Textarea | `textarea` | Notes field |
| Separator | `separator` | Between form and history list, between KPI strip and table |
| Alert | `alert` | Overdue warning banner |
| Toggle Group | `toggle-group` | ETA status filter chips (On Time / Tight / Late) |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook | Cache Time |
|---|---|---|---|---|---|
| 1 | GET | `/api/v1/checkcalls` | Fetch paginated check calls across all loads (fleet-scoped). Supports filters. | `useCheckCalls(filters, pagination)` | 30s |
| 2 | GET | `/api/v1/loads/:loadId/checkcalls` | Fetch all check calls for a specific load (load-scoped, ordered by calledAt desc) | `useLoadCheckCalls(loadId)` | 30s |
| 3 | GET | `/api/v1/checkcalls/:id` | Fetch single check call detail | `useCheckCall(id)` | 60s |
| 4 | POST | `/api/v1/checkcalls` | Create new check call | `useCreateCheckCall()` | -- |
| 5 | PUT | `/api/v1/checkcalls/:id` | Update check call (notes only, within 30 min) | `useUpdateCheckCall()` | -- |
| 6 | DELETE | `/api/v1/checkcalls/:id` | Delete check call (admin only, soft delete) | `useDeleteCheckCall()` | -- |
| 7 | GET | `/api/v1/checkcalls/overdue` | Fetch loads with overdue check calls (> 4 hours since last call, load in IN_TRANSIT) | `useOverdueCheckCalls()` | 30s |
| 8 | POST | `/api/v1/checkcalls/bulk` | Create multiple check calls at once (bulk entry) | `useBulkCreateCheckCalls()` | -- |
| 9 | GET | `/api/v1/checkcalls/stats` | Fetch check call statistics (total, overdue, on-time %, auto rate) | `useCheckCallStats(filters)` | 60s |
| 10 | GET | `/api/v1/loads/:loadId` | Fetch load header data (for load-scoped header bar) | `useLoad(loadId)` | 60s |
| 11 | GET | `/api/v1/loads/:loadId/stops` | Fetch stops for stop selector in form | `useLoadStops(loadId)` | 60s |

### Query Parameters

| Endpoint | Parameter | Type | Description |
|---|---|---|---|
| Fleet checkcalls | `dateFrom` | ISO date | Start date filter |
| Fleet checkcalls | `dateTo` | ISO date | End date filter |
| Fleet checkcalls | `loadId` | UUID | Filter by specific load |
| Fleet checkcalls | `loadNumber` | string | Filter by load number (partial match) |
| Fleet checkcalls | `calledBy` | UUID | Filter by user who logged the call |
| Fleet checkcalls | `source` | comma-separated | Filter by source: manual, auto, websocket |
| Fleet checkcalls | `etaStatus` | comma-separated | Filter by ETA assessment: on_time, tight, late |
| Fleet checkcalls | `sort` | string | Sort field: calledAt (default) |
| Fleet checkcalls | `order` | string | Sort direction: desc (default), asc |
| Fleet checkcalls | `page` | number | Page number |
| Fleet checkcalls | `limit` | number | Results per page (default 25) |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| `tenant:{tenantId}` on `/tracking` | `checkcall:received` | `useCheckCallLiveUpdates()` -- prepends new entry to list/table, updates KPI stats |
| `tenant:{tenantId}` on `/tracking` | `load:eta:updated` | `useCheckCallEtaUpdates()` -- recalculates ETA badges if appointment window changed |
| `user:{userId}` on `/notifications` | `checkcall:reminder:due` | `useCheckCallReminders()` -- shows toast notification, highlights relevant load |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 409 | 500 |
|---|---|---|---|---|---|---|
| POST /checkcalls | Toast: "Validation error: [field details]" -- form stays open with highlighted fields | Redirect to login | Toast: "Permission denied" | Toast: "Load not found" | Toast: "Duplicate check call detected" | Toast: "Failed to save check call. Please try again." |
| GET /checkcalls | Toast: "Invalid filter" | Redirect to login | "Access Denied" page | N/A | N/A | Error state with retry |
| PUT /checkcalls/:id | Toast: "Cannot edit: check call is older than 30 minutes" | Redirect to login | Toast: "Permission denied" | Toast: "Check call not found" | N/A | Toast: "Update failed" |
| DELETE /checkcalls/:id | N/A | Redirect to login | Toast: "Permission denied" | Toast: "Not found" | N/A | Toast: "Delete failed" |

---

## 11. States & Edge Cases

### Loading State

- **Form:** Renders immediately (interactive before data loads). If load is pre-filled, load header skeleton shows while data loads. GPS auto-populate has a 2-second timeout with a loading spinner on the location fields.
- **History list (load-scoped):** Load header shows immediately. 5 skeleton check call cards with animated gray bars. Cards appear with staggered fade-in as data arrives.
- **Table (fleet-scoped):** KPI strip shows 4 skeleton mini-cards. Table shows 8 skeleton rows. Filter bar is interactive immediately.
- **Duration threshold:** If loading exceeds 5 seconds, show "Loading check calls..." message.

### Empty States

**No check calls for this load (load-scoped):**
- Illustration: Phone with speech bubble icon.
- Headline: "No check calls logged yet"
- Description: "Check calls record driver status updates during transit. Log the first check call when the driver contacts you."
- CTA: "Log First Check Call" -- primary button that expands the form.

**No check calls matching filters (fleet-scoped):**
- "No check calls match your current filters."
- CTA: "Clear All Filters" outline button.

**First-time empty (no check calls in system):**
- "No check calls have been logged yet. Check calls will appear here as loads enter transit and dispatchers record driver updates."
- CTA: "Go to Dispatch Board" primary button.

### Error States

**Full page error (API fails):**
- Error illustration + "Unable to load check calls" + Retry button.

**Form submission error:**
- Toast: "Failed to save check call: [reason]." Form remains open with all data preserved. Invalid fields highlighted in red with inline error messages.

**GPS auto-populate failure:**
- GPS indicator changes to amber: "GPS unavailable. Enter location manually."
- Location fields switch to manual entry mode. No form blocking.

### Permission Denied

- **Full page denied:** "You don't have permission to view check calls." Link to Operations Dashboard.
- **Create denied:** Form hidden. History is read-only. "You don't have permission to log check calls" tooltip on disabled "Log Check Call" button.
- **Fleet view denied:** Redirected to load-scoped view if they navigate to a specific load.

### Offline / Degraded

- **Full offline:** Banner: "You're offline. Showing cached data." Form submission queued -- "Check call will be submitted when connection restores." Form still functional.
- **Degraded (WebSocket down):** Polling fallback active. New check calls from other users may be delayed.

### Edge Cases

- **Simultaneous check calls:** Two dispatchers log a check call for the same load at the same time. Both entries are accepted. The load's ETA updates to the most recent entry's ETA. No conflict.
- **GPS vs manual location disagreement:** Driver reports being in "Memphis, TN" but GPS shows "Little Rock, AR." Form shows GPS data with override option. If dispatcher overrides, the entry notes the discrepancy.
- **Backdated check call:** Dispatcher logs a check call 3 hours late. The system accepts it (within 4-hour window) but marks it as "Backdated" with a small clock icon. The "last check call" timer still calculates from the logged calledAt time.
- **Post-delivery check call:** Driver calls after delivery. Check call is accepted and logged but flagged as "Post-Delivery" with a gray badge. ETA field is disabled (no longer relevant).
- **Very frequent check calls:** 10+ check calls on a single load in one day (unusual but valid for problem loads). All displayed in the list. No aggregation -- each entry is important.
- **Load with no GPS:** Form shows no GPS auto-populate section. All location fields are manual entry. "No GPS available for this load" note in the form.

---

## 12. Filters, Search & Sort

### Filters

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Date Range | Preset toggle + custom | Today, Yesterday, This Week, This Month, Custom | Today | `?dateFrom=&dateTo=` |
| 2 | Load Number | Search input | Text input with typeahead, searches by load number | Empty (all loads) | `?loadNumber=LOAD-0847` |
| 3 | ETA Status | Color-coded chips | On Time (green), Tight (yellow), Late (red) | All selected | `?etaStatus=on_time,tight,late` |
| 4 | Logged By | Searchable select | All users who have logged check calls | All | `?calledBy=userId` |
| 5 | Source | Multi-select chips | Manual, Auto (Driver App/GPS), WebSocket | All | `?source=manual,auto` |

### Search Behavior

- **Search field:** Load number search input with 300ms debounce and typeahead. Minimum 3 characters.
- **Searches across:** Load number only (fleet view). For load-scoped view, no search needed (already scoped).
- **URL param:** `?loadNumber=LOAD-0847`

### Sort Options

| Column | Default Direction | Sort Type |
|---|---|---|
| Called At (Timestamp) | Descending (newest first) -- **DEFAULT** | Date |
| Load Number | Ascending | Alphanumeric |
| ETA Status | Custom (Late first, then Tight, then On Time) | Enum ordinal |

### Saved Filters / Presets

- **System presets:** "Today's Calls" (default), "Overdue Loads" (loads missing check call > 4h), "Late ETAs Only" (etaStatus=late), "My Check Calls" (calledBy=currentUser), "Automated Only" (source=auto,websocket).
- **User-created presets:** Save current filter combination. Stored per-user.
- **URL sync:** All filter state in URL query params.

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Sidebar collapses to icon-only mode.
- Check call form: Two columns collapse to single column (location fields above ETA/notes fields).
- History list (load-scoped): Full-width cards, same layout.
- Table (fleet-scoped): "Notes" column hidden (accessible via row expand). Other columns narrower.
- KPI strip: Wraps to 2 rows (2 cards per row).
- Load header: Stacks into two rows.

### Mobile (< 768px)

- Sidebar hidden (hamburger menu).
- Check call form: Full-width single column. Fields stack vertically. Form opens as a bottom sheet or full-screen modal. GPS auto-populate prominent as a single "Use GPS" button.
- History list (load-scoped): Full-width vertical cards. Click-to-call driver button prominently displayed in load header.
- Table (fleet-scoped): Switches to card layout (each check call as a vertical card).
- KPI strip: Horizontal scrollable row of compact badges.
- Filters: Simplified to date and load number. "More Filters" opens full-screen modal.
- Pull-to-refresh: Reloads check call data.
- Sticky bottom bar: "Log Check Call" primary button always visible.

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full layout. Two-column form. Full table columns. |
| Desktop | 1024px - 1439px | Same layout, slightly narrower. |
| Tablet | 768px - 1023px | Single-column form. Reduced table columns. |
| Mobile | < 768px | Bottom sheet form. Card layout for entries. Sticky action bar. |

---

## 14. Stitch Prompt

```
Design a check calls screen for a modern freight/logistics TMS (Transportation Management System) called "Ultra TMS." This screen shows driver check-in records and provides a form to log new check calls.

Layout: Full-width page with a dark slate-900 sidebar on the left (240px). White content area. Breadcrumb: "Loads > LOAD-20260206-0847 > Check Calls."

Load Header Bar: Compact white card (border-b, py-3 px-6) with: "LOAD-20260206-0847" in bold monospace blue-600, sky-blue "In Transit" status badge, "Swift Transport" carrier name, "Chicago, IL -> Dallas, TX" route. Second line: "Driver: Carlos Martinez | (555) 123-4567" with a blue phone icon (click-to-call), "Last Check Call: 2h 15m ago" with green dot, "Next Due: 1h 45m" with a "Set Reminder" link in blue. If overdue, "Last Check Call" would show in red with "OVERDUE" badge.

New Check Call Form: Below the header, a collapsible white card with gray-50 background, rounded-lg border, shadow-sm. Header: "Log Check Call" with ChevronDown toggle icon. Form is in two columns:

Left Column (Location):
- "City" text input with value "Springfield" filled in
- "State" select dropdown showing "IL"
- "Location Description" text input with value "I-55 south, mile marker 142"
- Small "GPS ●" green indicator with text "Auto-populated from GPS" and coordinates "(39.78, -89.65)" in gray-400 small text. Small "Override manual" link in gray-500.

Right Column (ETA & Notes):
- "ETA to Next Stop" with a date picker showing "Jan 16" and time picker showing "1:45 PM"
- "ETA Status" showing a green "On Time (-15m early)" badge
- "Notes" textarea (4 rows) with value: "Driver reports no issues. Clear weather, light traffic on I-55. Full fuel tank. Expects smooth run to Dallas."
- "Next Check Call" with a select showing "In 4 hours" with options visible: "In 2 hours", "In 3 hours", "In 4 hours", "Custom..."

Bottom of form: "Save Check Call" primary blue-600 button, "Save & Close" outline button, "Cancel" text button in gray.

Check Call History: Below the form, section header "Check Call History (5)" with a small filter: "All" dropdown and three color dots legend "● On Time ● Tight ● Late."

Show 5 check call entry cards in a vertical list, each connected by a time-gap indicator:

Card 1 (#5): White card with 3px green left border. Header: "#5 · Jan 15, 7:45 AM" on left, green "● On Time" badge on right. Body: "Location: Joliet, IL" with green "GPS ●" indicator. "ETA: Jan 15, 8:15 AM | 15 min to next stop." Notes in italic: "Driver 15 min out, no issues. Clear weather." Footer: "Logged by: Maria R." with small avatar, gray "Manual" source badge, "Call: 45s."

Gap indicator: "37 min gap" in gray-400 text on a thin connecting line.

Card 2 (#4): White card with 3px green left border. "Jan 15, 7:08 AM" | "● On Time". "Wilmington, IL (GPS ●)" | "ETA: 8:20 AM | 1h 12m." Notes: "Passed Wilmington, smooth sailing."

Gap indicator: "2h 38m gap" in gray-400.

Card 3 (#3): White card with 3px yellow left border (tight ETA). "Jan 15, 4:30 AM" | "● Tight" yellow badge. "Bloomington, IL (GPS ●)" | "ETA: 8:30 AM | 3h 45m." Notes: "Fuel stop at Bloomington. ETA tight but on track." Footer: "Carlos M. (Driver App)" with green "Auto" source badge.

Gap indicator: "4h 10m gap" in red-600 text with a small AlertTriangle icon and "OVERDUE" red badge.

Card 4 (#2): White card with 3px green left border. "Jan 15, 12:20 AM" | "● On Time". "Springfield, IL (GPS ●)" | "ETA: 8:00 AM | 7h 40m." Notes: "Passing through Springfield. All good." Footer: "Jake P. (Night Dispatch)" with "Manual" badge.

Gap indicator: "1h 50m gap."

Card 5 (#1): White card with 3px green left border. "Jan 14, 10:30 PM" | "● On Time". "Chicago, IL - Acme Warehouse" | "ETA: 8:00 AM | 9h 30m." Notes: "Loaded and departing. BOL signed." Footer: "Maria R." with "Manual" badge.

Design Specifications:
- Font: Inter or system sans-serif, 14px base
- Content background: white (#FFFFFF), form background: gray-50
- Primary color: blue-600 for buttons and links
- Card left borders: green-500 (on-time), amber-500 (tight), red-500 (late) -- 3px solid
- ETA badges: green-100/green-700 (on time), amber-100/amber-700 (tight), red-100/red-700 (late) -- small pill badges with colored circle icon
- GPS indicator: small green circle (8px) with "GPS" text in green-600 for auto-populated, gray circle with "Manual" in gray-500 for hand-entered
- Source badges: gray-100 "Manual", green-100 "Auto", purple-100 "WebSocket"
- Gap indicators: gray-300 dashed vertical line connecting cards. Time text in gray-400. Red text + alert icon for gaps > 4 hours.
- Form: white card with gray-50 bg, subtle shadow-sm, collapsible with smooth animation
- Modern SaaS aesthetic similar to Linear.app or Intercom conversation log
- Emphasis on speed -- the form should feel like a quick-entry tool, not a complex form
```

---

## 15. Enhancement Opportunities

### Current State (Wave 2)

**What's built and working:**
- [ ] Nothing yet -- screen is Not Started.

**What needs to be built for MVP:**
- [ ] Load-scoped check call history list with color-coded entries
- [ ] Fleet-scoped check call DataTable with filters and pagination
- [ ] Quick entry form with load selector, city/state, location description, ETA, notes
- [ ] GPS auto-populate from tracking device (if available)
- [ ] ETA color coding: green (on-time), yellow (tight), red (late)
- [ ] Check call gap indicators with overdue warnings (> 4 hours)
- [ ] Next check call reminder scheduler
- [ ] Load header with driver info, click-to-call, last check call time, next due countdown
- [ ] KPI strip (fleet view) with total, overdue, on-time %, auto rate
- [ ] Filter by date, load number, ETA status, logged by, source
- [ ] WebSocket integration for real-time new entries
- [ ] Export to CSV
- [ ] Loading skeletons and empty states

**What to add this wave (post-MVP polish):**
- [ ] One-click quick check call (GPS auto-fill, no form)
- [ ] Note templates for common check call patterns
- [ ] Smart ETA suggestion based on GPS + routing API
- [ ] Overdue check call dashboard widget integration

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Quick entry form with GPS auto-populate | High | High | P0 |
| Check call history list (load-scoped) | High | Medium | P0 |
| ETA color coding | High | Low | P0 |
| Check call gap / overdue warnings | High | Low | P0 |
| Next check call reminder | High | Medium | P0 |
| Fleet-scoped DataTable with filters | Medium | Medium | P0 |
| KPI strip | Medium | Low | P0 |
| WebSocket live updates | Medium | Medium | P1 |
| One-click quick check call | High | Medium | P1 |
| Note templates | Medium | Low | P1 |
| Smart ETA suggestion | Medium | High | P1 |
| Bulk check call creation | Medium | Medium | P2 |
| Driver app auto-check-calls | High | High | P2 |
| Weather at location | Low | Medium | P2 |
| Call recording | Low | High | P2 |
| Proactive scheduling | Medium | High | P2 |

### Future Wave Preview

- **Wave 3:** Driver app integration for self-service check calls (driver submits location, ETA, notes from mobile app). Smart ETA suggestions using routing APIs and traffic data. Weather integration showing conditions at driver location. Proactive check call scheduling based on load priority and transit distance.
- **Wave 4:** AI-powered check call analysis ("Driver Carlos consistently underestimates ETA by 45 minutes on this lane -- adjusting ETAs automatically"). Voice-to-text check call logging (dispatcher speaks notes, transcribed to text). Integration with carrier ELD systems for automatic position-based check calls without manual logging.

---

<!--
DESIGN NOTES:
- Check calls are the core operational heartbeat of freight tracking. This screen must prioritize speed of data entry above all else. Maria should be able to log a check call in 30 seconds while on the phone with a driver.
- The form is deliberately simple -- location, ETA, notes. Three core data points. GPS auto-population eliminates the most time-consuming field (location) when tracking devices are available.
- The color-coding system (green/yellow/red) provides instant visual triage in the history list. Maria can glance at the list and immediately see if ETAs are trending toward late.
- The gap indicator between entries is a critical feature. A visible "4h 10m gap [OVERDUE]" warning between entries communicates urgency more effectively than any dashboard metric.
- The next-check-call reminder feature closes the loop on the 4-hour requirement. Without it, dispatchers rely on memory or manual timers.
-->
