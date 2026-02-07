# Appointment Scheduler

> Service: TMS Core (Service 04) | Wave: 2 | Priority: P1
> Route: /(dashboard)/operations/appointments | Also: /(dashboard)/loads/[id]/appointments | Status: Not Started
> Primary Personas: Maria Rodriguez (Dispatcher, 50+ loads/day), Sarah Chen (Operations Manager)
> Roles with Access: dispatcher, ops_manager, admin, support (read-only)
> Screen Type: Calendar

---

## 1. Purpose & Business Context

**What this screen does:**
The Appointment Scheduler provides a calendar-based visualization of all pickup and delivery appointments across all active loads. Each appointment is displayed as a block on the calendar showing the facility name, load number, appointment type (pickup or delivery), time window, and confirmation status. Dispatchers use this screen to schedule new appointments, detect time conflicts, track confirmation statuses, and reschedule appointments when delays occur. The calendar supports day, week, and month views, with the ability to filter by facility, load, date, and appointment type. For multi-stop loads, a bulk appointment creation feature allows dispatchers to set all stop appointments in a single workflow.

**Business problem it solves:**
Freight appointment scheduling is one of the most error-prone and time-consuming aspects of dispatch operations. Facilities have limited dock capacity, restricted operating hours, and specific appointment requirements. Without a centralized calendar view, dispatchers manage appointments via phone calls, emails, and spreadsheets -- leading to double-bookings (two loads scheduled at the same facility at the same time), missed windows (loads arriving outside appointment times, incurring detention charges), and forgotten confirmations (carrier never confirmed, load shows up unannounced). A single dispatcher managing 50+ loads may have 100+ appointments to track across 30+ facilities in a given week. When a load is delayed, the dispatcher must manually identify which downstream appointments need rescheduling -- a task that takes 5-10 minutes per load and is frequently forgotten during peak hours. This screen reduces appointment scheduling time from 5 minutes to 30 seconds, eliminates double-bookings through conflict detection, and ensures no appointment goes unconfirmed through status tracking.

**Key business rules:**
- Every pickup and delivery stop must have an appointment time window. The system prevents dispatching a load without appointments set.
- Facility operating hours are stored in the facility database. Appointments cannot be scheduled outside operating hours unless overridden by ops_manager+ with reason.
- Appointments have a confirmation workflow: REQUESTED -> CONFIRMED -> CHECKED_IN -> COMPLETED (or MISSED / RESCHEDULED / CANCELLED).
- Conflict detection: if two loads are scheduled at the same facility within overlapping time windows and the facility has limited dock capacity, the system warns of a potential conflict. True conflict determination depends on facility dock count (stored in facility profile).
- Rescheduling an appointment requires a reason. The original appointment time is preserved in history for audit purposes.
- Appointment time windows are typically 2-hour blocks (e.g., 8:00 AM - 10:00 AM) but can be exact times for strict-appointment facilities.
- When a load's ETA changes (from check calls or GPS), the system automatically flags appointments where ETA no longer falls within the appointment window.
- Bulk appointment creation for multi-stop loads: when a load has 3+ stops, the dispatcher can set all appointment times in a sequential wizard that validates transit times between stops.

**Success metric:**
Appointment double-booking rate drops from 8% to under 1%. Detention charges caused by missed appointments decrease by 65%. Average time to schedule appointments for a 3-stop load drops from 15 minutes (3 separate calls + manual tracking) to 3 minutes (bulk wizard + confirmation tracking). Percentage of appointments confirmed before load pickup increases from 60% to 95%.

---

## 2. User Journey Context

**Comes from (entry points):**

| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Sidebar Navigation | Click "Appointments" in TMS Core sidebar group | None (fleet calendar view) |
| Load Detail | Click "Appointments" tab or "Schedule Appointments" button | `loadId` (shows only this load's appointments) |
| Stop Management | Click "Schedule Appointment" or "Reschedule" on a stop | `loadId`, `stopId`, `facilityId` |
| Dispatch Board | Right-click load card > "View Appointments" | `loadId` |
| Operations Dashboard | Click "Appointments Today" widget or "Missed Appointment" alert | Optional date filter or `loadId` |
| Tracking Map | Side panel > Click appointment time > "Reschedule" | `loadId`, `stopId` |
| Notification Center | Click "Appointment needs rescheduling" notification | `loadId`, `stopId` |
| Direct URL | Bookmark / shared link | Route params, date, filters |

**Goes to (exit points):**

| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Load Detail | Click load number link on appointment block | `loadId` |
| Stop Management | Click "View Stops" on appointment detail | `loadId`, `stopId` |
| Tracking Map | Click "Track Load" on appointment that is in transit | `loadId` |
| Facility Detail | Click facility name link on appointment block | `facilityId` |
| Check Calls | Click "Add Check Call" from appointment context | `loadId` |

**Primary trigger:**
Maria opens the Appointment Scheduler when she needs to set appointments for a newly dispatched load, when she receives notice of a delay requiring rescheduling, or when preparing for the next day's operations. Sarah uses it during the morning review to verify all of today's appointments are confirmed and during the afternoon to prepare for tomorrow. The calendar is particularly critical on Monday mornings when the week's appointments are finalized.

**Success criteria (user completes the screen when):**
- All stops for a load have confirmed appointments within the expected transit schedule.
- No appointment conflicts exist for the selected date range.
- All delayed loads have had their downstream appointments rescheduled.
- Tomorrow's appointments have been reviewed and all show "confirmed" status.

---

## 3. Layout Blueprint

### Desktop Layout (1440px+) -- Week View

```
+-----------------------------------------------------------------------------------+
|  [Sidebar 240px]  |  APPOINTMENT SCHEDULER CONTENT AREA                           |
|                   +---------------------------------------------------------------+
|  TMS Core         |  PageHeader: "Appointment Scheduler"                          |
|  - Orders         |  Subtitle: "Pickup & delivery appointment calendar"           |
|  - Loads          |  Right: [+ New Appointment] [Bulk Schedule] [Export]          |
|  - Dispatch Board +---------------------------------------------------------------+
|  - Tracking       |  Toolbar                                                      |
|  - Check Calls    |  [< Prev] [Today] [Next >]  [Day | Week | Month]             |
|  - Appointments*  |  [Facility: All v] [Load#: ____] [Type: All v] [Status: All v]|
|                   +---------------------------------------------------------------+
|                   |  Summary Strip                                                 |
|                   |  [Today: 18] [Confirmed: 14] [Pending: 3] [At Risk: 1]       |
|                   +---------------------------------------------------------------+
|                   |                                                                |
|                   |  WEEK VIEW: Jan 13 - Jan 19, 2026                             |
|                   |                                                                |
|                   |  TIME  | MON 13   | TUE 14   | WED 15   | THU 16   | FRI 17  |
|                   |  ------+----------+----------+----------+----------+---------+
|                   |  6 AM  |          |          |          |          |         |
|                   |        |          |          |          |          |         |
|                   |  7 AM  |          | ┌──────┐ |          |          |         |
|                   |        |          | │PU    │ |          |          |         |
|                   |  8 AM  | ┌──────┐ | │LOAD- │ | ┌──────┐ |          |         |
|                   |        | │PU    │ | │0847  │ | │DEL   │ |          |         |
|                   |  9 AM  | │LOAD- │ | │Acme  │ | │LOAD- │ |          |         |
|                   |        | │0852  │ | │[CONF]│ | │0839  │ |          |         |
|                   | 10 AM  | │Beta  │ | └──────┘ | │Metro │ | ┌──────┐ |         |
|                   |        | │[PEND]│ |          | │[CONF]│ | │DEL   │ |         |
|                   | 11 AM  | └──────┘ |          | └──────┘ | │LOAD- │ |         |
|                   |        |          |          |          | │0847  │ |         |
|                   | 12 PM  |          | ┌──────┐ |          | │Beta  │ |         |
|                   |        |          | │DEL   │ |          | │[PEND]│ |         |
|                   |  1 PM  |          | │LOAD- │ |          | └──────┘ |         |
|                   |        |          | │0852  │ |          |          |         |
|                   |  2 PM  |          | │Atlas │ | ┌──────┐ |          | ┌──────┐|
|                   |        |          | │[CONF]│ | │PU    │ |          | │DEL   │|
|                   |  3 PM  |          | └──────┘ | │LOAD- │ |          | │LOAD- │|
|                   |        |          |          | │0861  │ |          | │0861  │|
|                   |  4 PM  |          |          | │Apex  │ |          | │Summit│|
|                   |        |          |          | │[REQ] │ |          | │[REQ] │|
|                   |  5 PM  |          |          | └──────┘ |          | └──────┘|
|                   |        |          |          |          |          |         |
|                   |  6 PM  |          |          |          |          |         |
|                   +---------------------------------------------------------------+
```

### Appointment Detail Popover (click appointment block)

```
+------------------------------------------+
|  PICKUP APPOINTMENT                       |
|  LOAD-20260206-0847                       |
|  ----------------------------------------|
|  Facility: Acme Warehouse                 |
|  Address: 1200 Industrial, Chicago, IL    |
|  Hours: Mon-Fri 6AM-6PM                   |
|  ----------------------------------------|
|  Window: Jan 15, 8:00 AM - 10:00 AM      |
|  Status: [CONFIRMED] green badge          |
|  Confirmed by: John (Acme) on Jan 13     |
|  ----------------------------------------|
|  Load ETA: Jan 15, 8:15 AM               |
|  ETA Status: On Time (-15m early) green   |
|  ----------------------------------------|
|  Carrier: Swift Transport                 |
|  Driver: Carlos M.                        |
|  ----------------------------------------|
|  [Reschedule] [Confirm] [View Load]      |
|  [Cancel Appointment]                     |
+------------------------------------------+
```

### Bulk Schedule Wizard (modal)

```
+------------------------------------------------------------------+
|  BULK SCHEDULE APPOINTMENTS                           [X Close]   |
|  Load: LOAD-20260206-0861 | 3 stops                              |
|  ----------------------------------------------------------------|
|                                                                    |
|  STOP 1: PICKUP - Apex Manufacturing, Houston, TX                 |
|  Facility Hours: Mon-Sat 7AM-5PM                                  |
|  Date: [Jan 15      v]  Time: [2:00 PM] - [4:00 PM]             |
|  Transit to next: 280 miles, ~5h drive                            |
|  ----------------------------------------------------------------|
|                                                                    |
|  STOP 2: DELIVERY - Summit Logistics, Dallas, TX                  |
|  Facility Hours: Mon-Fri 6AM-6PM                                  |
|  Date: [Jan 17      v]  Time: [2:00 PM] - [4:00 PM]             |
|  Suggested: Jan 16, 9:00 AM (based on transit from Stop 1)       |
|  [Use Suggestion]                                                  |
|  ----------------------------------------------------------------|
|                                                                    |
|  VALIDATION                                                        |
|  ✓ All appointments within facility hours                         |
|  ✓ Transit times between stops are feasible                       |
|  ✗ Stop 2 has a potential conflict: LOAD-0839 at Summit           |
|    at 2:00 PM - 4:00 PM (1 dock available)                       |
|  ----------------------------------------------------------------|
|                                                                    |
|  [Schedule All Appointments]  [Cancel]                            |
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible on calendar block) | Appointment type (PU/DEL), load number, facility name, confirmation status badge | Maria must instantly see what is scheduled, where, and whether it is confirmed -- scannable in under 2 seconds per block |
| **Secondary** (visible on click/hover popover) | Time window, facility address and hours, load ETA vs appointment, carrier/driver info | Detailed scheduling context needed when managing a specific appointment |
| **Tertiary** (visible in detail panel) | Confirmation history (who confirmed, when), reschedule history, conflict details, facility dock count | Investigation data for conflict resolution and audit |
| **Hidden** (behind navigation) | Full load detail, stop management, facility database, carrier details | Deep context accessed via links |

---

## 4. Data Fields & Display

### Calendar Appointment Block Fields

| # | Field | Source | Format / Display | Location on Block |
|---|---|---|---|---|
| 1 | Appointment Type | Stop.stopType | "PU" badge (blue-600) for pickup, "DEL" badge (green-600) for delivery | Block header, left |
| 2 | Load Number | Stop.loadNumber | `LOAD-0847` monospace, truncated, clickable link | Block header, after type |
| 3 | Facility Name | Stop.facilityName | Truncated at 14 chars with tooltip. Bold text. | Block body, line 1 |
| 4 | Time Window | Stop.appointmentTimeFrom + appointmentTimeTo | "8:00 AM - 10:00 AM" | Block position on calendar (vertical span) |
| 5 | Confirmation Status | Appointment.confirmationStatus | Small badge: REQUESTED (gray), CONFIRMED (green), CHECKED_IN (blue), COMPLETED (emerald), MISSED (red), RESCHEDULED (amber), CANCELLED (red strikethrough) | Block footer or corner badge |

### Appointment Detail Popover Fields

| # | Field | Source | Format | Section |
|---|---|---|---|---|
| 1 | Appointment Type | Stop.stopType | "Pickup Appointment" or "Delivery Appointment" header | Header |
| 2 | Load Number | Stop.loadNumber | `LOAD-20260206-0847` monospace, blue-600 link | Header |
| 3 | Facility Name | Stop.facilityName or Facility.name | Bold text, clickable link to Facility Detail | Facility section |
| 4 | Facility Address | Facility.address | Full address on one line | Facility section |
| 5 | Facility Hours | Facility.operatingHours | "Mon-Fri 6AM-6PM, Sat 8AM-12PM" | Facility section |
| 6 | Appointment Window | Stop.appointmentDate + times | "Jan 15, 2026 8:00 AM - 10:00 AM" | Time section |
| 7 | Confirmation Status | Appointment.confirmationStatus | StatusBadge with color per state | Status section |
| 8 | Confirmed By | Appointment.confirmedBy | "John Smith (Acme) on Jan 13" | Status section (if confirmed) |
| 9 | Load ETA | Load.eta or calculated | "Jan 15, 8:15 AM" | ETA section |
| 10 | ETA Status | Calculated | "On Time (-15m early)" green or "Late (+2h)" red | ETA section |
| 11 | Carrier Name | Load.carrier.name | Clickable link | Carrier section |
| 12 | Driver Name | Load.driver.name | Plain text | Carrier section |
| 13 | Conflict Warning | Calculated | "Potential conflict: LOAD-0839 at same facility" in amber or red | Conflict section (conditional) |

### Bulk Schedule Wizard Fields

| # | Field | Source | Type | Required | Default |
|---|---|---|---|---|---|
| 1 | Stop Facility | Stop.facilityName | Read-only display | -- | From stop data |
| 2 | Facility Hours | Facility.operatingHours | Read-only display | -- | From facility database |
| 3 | Appointment Date | Stop.appointmentDate | Date picker | Yes | Calculated from previous stop ETA |
| 4 | Start Time | Stop.appointmentTimeFrom | Time picker | Yes | Calculated suggestion |
| 5 | End Time | Stop.appointmentTimeTo | Time picker | Yes | Start + 2 hours (default window) |
| 6 | Transit to Next | Calculated | Read-only | -- | Distance and drive time from routing API |
| 7 | Suggested Time | Calculated | Read-only with "Use Suggestion" button | -- | Based on transit time from previous stop |

### Summary Strip Fields

| # | Field | Calculation | Format |
|---|---|---|---|
| 1 | Today's Appointments | Count of appointments with date = today | "18 today" |
| 2 | Confirmed | Count where status = CONFIRMED or CHECKED_IN | "14 confirmed" with green badge |
| 3 | Pending | Count where status = REQUESTED | "3 pending" with amber badge |
| 4 | At Risk | Count where ETA is past appointment window or status = MISSED | "1 at risk" with red badge |

### Calculated / Derived Fields

| # | Field | Calculation | Format |
|---|---|---|---|
| 1 | ETA vs Appointment | `load.eta vs stop.appointmentTimeTo` | Green "On Time" if ETA before window end, Yellow "Tight" within 1h, Red "Late" if past window |
| 2 | Facility Conflict | Two loads at same facility with overlapping windows and dock count exceeded | Amber warning or red conflict indicator |
| 3 | Transit Feasibility | Distance / avg speed between consecutive stops vs time gap between appointments | Green checkmark if feasible, red X if insufficient transit time |
| 4 | Time Until Appointment | `stop.appointmentTimeFrom - now()` | "In 3h 20m" or "Started 15m ago" or "Completed" |
| 5 | Reschedule Count | Number of times this appointment has been rescheduled | "(rescheduled 2x)" text if > 0 |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] Calendar views: Day, Week (default), Month with toggle in toolbar
- [ ] Appointment blocks on calendar showing type (PU/DEL), load number, facility name, and confirmation status
- [ ] Click appointment block to open detail popover with full information, ETA status, and action buttons
- [ ] Color-coded blocks: blue for pickup, green for delivery, amber border for pending confirmation, red border for at-risk (ETA late)
- [ ] Drag to reschedule: drag an appointment block to a different time slot (with reason prompt)
- [ ] Conflict detection: visual warning when two appointments overlap at the same facility
- [ ] Filter by facility, load number, appointment type (pickup/delivery), confirmation status
- [ ] Summary strip: today's count, confirmed, pending, at-risk
- [ ] New appointment form: select load, stop, facility, date, time window, notes
- [ ] Appointment confirmation tracking: REQUESTED -> CONFIRMED -> CHECKED_IN -> COMPLETED status flow
- [ ] Facility hours integration: show facility operating hours on the calendar; warn if appointment is outside hours
- [ ] ETA overlay: show load ETA on the calendar aligned with the appointment window to visualize on-time/late
- [ ] Bulk appointment creation wizard for multi-stop loads with transit time validation
- [ ] WebSocket: `stop:appointment:updated` updates calendar blocks in real-time
- [ ] Navigation controls: previous/next period, "Today" button, date range selector

### Advanced Features (Logistics Expert Recommendations)

- [ ] **Facility hours overlay** -- Gray-out hours outside facility operating hours on the calendar. If the facility database has dock count, show capacity (e.g., "2 of 3 docks available at 2 PM").
- [ ] **Appointment request workflow** -- Dispatcher creates a "requested" appointment. System sends email/portal request to facility contact. Facility confirms via link. Status auto-updates to CONFIRMED.
- [ ] **Auto-reschedule suggestions** -- When a load's ETA changes, the system automatically suggests a new appointment time based on the updated ETA and facility availability. Dispatcher can accept with one click.
- [ ] **Recurring appointments** -- For regular customers with weekly shipments, create recurring appointment templates that auto-populate each week.
- [ ] **Calendar sync** -- Export appointments to Google Calendar, Outlook, or iCal format. Dispatchers can see TMS appointments alongside personal calendar.
- [ ] **Facility availability API** -- For facilities that provide API access (e.g., Opendock, C2FO), show real-time dock availability directly on the calendar.
- [ ] **Text/email confirmation reminders** -- Automatically send appointment confirmation reminders to carriers 24 hours before pickup and 12 hours before delivery.
- [ ] **Appointment scoring** -- Score each appointment based on likelihood of on-time arrival (considering current GPS, weather, traffic). Show as a confidence percentage.
- [ ] **Dock scheduling optimization** -- When multiple loads are at the same facility, suggest optimal dock assignment to minimize wait times.
- [ ] **Multi-day appointment view** -- For loads spanning multiple days, show the entire load journey as a horizontal bar across the calendar with stops marked.
- [ ] **Print daily schedule** -- Generate a PDF of today's appointments with all details for drivers or facility coordinators.

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| Create/schedule appointments | dispatcher, ops_manager, admin | `appointment_create` | "New Appointment" button hidden. Calendar is read-only. |
| Drag to reschedule | dispatcher, ops_manager, admin | `appointment_edit` | Drag-and-drop disabled. Blocks are non-draggable. |
| Override facility hours | ops_manager, admin | `appointment_override` | Time picker enforces facility hours. Override option hidden. |
| Confirm appointments on behalf of facility | ops_manager, admin | `appointment_confirm` | "Confirm" button hidden. Only facility contacts can confirm. |
| Cancel appointments | dispatcher, ops_manager, admin | `appointment_cancel` | "Cancel" button hidden. |
| Bulk schedule wizard | dispatcher, ops_manager, admin | `appointment_create` | "Bulk Schedule" button hidden. |
| View all appointments | ops_manager, admin | `appointment_view_all` | Calendar shows only dispatcher's assigned loads' appointments. |
| Export calendar | dispatcher, ops_manager, admin | `export_data` | Export button hidden. |

---

## 6. Status & State Machine

### Appointment Confirmation Status Machine

```
                          ┌───────────────┐
                          │   REQUESTED   │ (Appointment created, not yet confirmed)
                          └───────┬───────┘
                                  │
                    Facility confirms (email/portal/phone)
                                  │
                                  v
                          ┌───────────────┐
                          │   CONFIRMED   │ (Facility accepted the appointment)
                          └───────┬───────┘
                                  │
                     Driver arrives at facility
                                  │
                                  v
                          ┌───────────────┐
                          │  CHECKED_IN   │ (Driver has arrived and checked in)
                          └───────┬───────┘
                                  │
                     Loading/unloading complete
                                  │
                                  v
                          ┌───────────────┐
                          │   COMPLETED   │ (Appointment fulfilled)
                          └───────────────┘

Alternative flows:

    REQUESTED ─── (No response / Facility declines) ──> CANCELLED
    REQUESTED ─── (Time change needed) ──> RESCHEDULED ──> REQUESTED (new time)
    CONFIRMED ─── (Time change needed) ──> RESCHEDULED ──> REQUESTED (new time)
    CONFIRMED ─── (Driver did not arrive) ──> MISSED
    CONFIRMED ─── (Load cancelled) ──> CANCELLED
```

### Appointment Status Badge Colors

| Status | Background | Text | Border | Icon | Calendar Block Style |
|---|---|---|---|---|---|
| REQUESTED | `gray-100` | `gray-700` | `gray-300` | `Clock` | Dashed border, gray-50 bg |
| CONFIRMED | `green-100` | `green-700` | `green-300` | `CheckCircle` | Solid border, white bg |
| CHECKED_IN | `blue-100` | `blue-700` | `blue-300` | `MapPin` | Solid border, blue-50 bg |
| COMPLETED | `emerald-100` | `emerald-700` | `emerald-300` | `CircleCheckBig` | Solid border, emerald-50 bg, muted opacity 0.7 |
| MISSED | `red-100` | `red-700` | `red-300` | `XCircle` | Red dashed border, red-50 bg |
| RESCHEDULED | `amber-100` | `amber-700` | `amber-300` | `RefreshCw` | Amber dashed border, strikethrough on original time |
| CANCELLED | `red-100` | `red-700` | `red-300` | `Ban` | Strikethrough text, 40% opacity |

### Calendar Block Color System

| Appointment Type | Status Modifier | Block Style |
|---|---|---|
| Pickup (PU) | REQUESTED | Blue-100 bg, dashed blue-300 border, gray "REQ" badge |
| Pickup (PU) | CONFIRMED | Blue-100 bg, solid blue-400 border, green "CONF" badge |
| Pickup (PU) | At-Risk (ETA late) | Blue-100 bg, solid red-400 border, red "LATE" badge |
| Delivery (DEL) | REQUESTED | Green-100 bg, dashed green-300 border, gray "REQ" badge |
| Delivery (DEL) | CONFIRMED | Green-100 bg, solid green-400 border, green "CONF" badge |
| Delivery (DEL) | At-Risk (ETA late) | Green-100 bg, solid red-400 border, red "LATE" badge |
| Any | COMPLETED | Original color at 60% opacity, emerald badge |
| Any | CANCELLED | Original color at 30% opacity, strikethrough text |
| Any | Conflict | Amber-300 border with alert triangle icon |

---

## 7. Actions & Interactions

### Primary Action Buttons (Page Header)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| + New Appointment | `Plus` | Primary / Blue-600 | Opens new appointment form in a side sheet | No |
| Bulk Schedule | `CalendarPlus` | Secondary / Outline | Opens bulk schedule wizard modal (select a load with multiple stops) | No |
| Export | `Download` | Secondary / Outline | Downloads current calendar view as PDF or iCal | No |

### Calendar Navigation

| Control | Action |
|---|---|
| `< Previous` button | Navigate to previous day/week/month |
| `Today` button | Snap to current date |
| `Next >` button | Navigate to next day/week/month |
| Day / Week / Month toggle | Switch calendar view |

### Calendar Block Interactions

| Interaction | Target | Action |
|---|---|---|
| Click | Appointment block | Opens detail popover with full appointment info and action buttons |
| Hover | Appointment block | Shows tooltip: load#, facility, time, status |
| Drag | Appointment block | Drag to new time slot. On drop: prompts for reason, then reschedules. Blue ghost preview during drag. |
| Double-click | Empty time slot | Opens new appointment form pre-filled with clicked date/time |
| Right-click | Appointment block | Context menu: Reschedule, Confirm, View Load, View Stops, Cancel |

### Popover Actions

| Button Label | Icon | Action | Condition |
|---|---|---|---|
| Reschedule | `Calendar` | Opens date/time picker to select new appointment window. Requires reason. | Status is REQUESTED or CONFIRMED |
| Confirm | `CheckCircle` | Moves status from REQUESTED to CONFIRMED. Prompts for "confirmed by" name. | Status is REQUESTED |
| Mark Checked In | `MapPin` | Moves status to CHECKED_IN. Records timestamp. | Status is CONFIRMED, driver has arrived |
| Mark Completed | `CircleCheckBig` | Moves status to COMPLETED. Records timestamp. | Status is CHECKED_IN |
| Mark Missed | `XCircle` | Moves status to MISSED. Requires reason. | Status is CONFIRMED, past appointment window |
| View Load | `ExternalLink` | Navigates to Load Detail | Always |
| View Stops | `ListOrdered` | Navigates to Stop Management | Always |
| Cancel | `Ban` | Cancels appointment. Requires reason. Confirmation dialog. | Status is REQUESTED or CONFIRMED |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `N` | Open new appointment form |
| `B` | Open bulk schedule wizard |
| `T` | Navigate to today |
| `Arrow Left` / `Right` | Previous / next period |
| `1` | Switch to Day view |
| `2` | Switch to Week view |
| `3` | Switch to Month view |
| `Escape` | Close popover / modal |
| `Ctrl/Cmd + K` | Global search / command palette |

### Drag & Drop

| Draggable Element | Drop Target | Action | Validation |
|---|---|---|---|
| Appointment block | Different time slot (same day or different day) | Reschedules appointment to new time. Prompts for reason. | New time must be within facility hours. Checks for conflicts at new time. Cannot drag COMPLETED or CANCELLED appointments. |
| Appointment block (week/day view) | Exact time position | Snaps to nearest 15-minute increment | Visual guide shows snap points |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Namespace | Payload | UI Update |
|---|---|---|---|
| `appointment:created` | `/dispatch` | `{ loadId, stopId, facilityId, appointmentDate, timeFrom, timeTo, status, createdBy }` | New appointment block appears on calendar with slide-in animation. Summary strip "Today" count increments if same-day. |
| `appointment:confirmed` | `/dispatch` | `{ loadId, stopId, confirmedBy, confirmedAt }` | Appointment block border changes from dashed (REQUESTED) to solid (CONFIRMED). Badge updates to green "CONF." Summary strip "Confirmed" increments, "Pending" decrements. |
| `appointment:rescheduled` | `/dispatch` | `{ loadId, stopId, oldDate, oldTime, newDate, newTime, reason, rescheduledBy }` | Appointment block animates from old position to new position on calendar. Original position shows a faint strikethrough ghost. Toast: "LOAD-0847 pickup rescheduled to Jan 16, 10:00 AM." |
| `appointment:cancelled` | `/dispatch` | `{ loadId, stopId, reason, cancelledBy }` | Appointment block fades to 30% opacity with strikethrough. Badge changes to "CANCELLED." |
| `appointment:completed` | `/dispatch` | `{ loadId, stopId, completedAt }` | Block opacity reduces to 60%. Badge changes to emerald "DONE." |
| `load:eta:updated` | `/tracking` | `{ loadId, stopId, newEta, previousEta }` | If ETA now falls outside appointment window, the appointment block border changes to red with "LATE" badge. If ETA improves, border returns to normal. |
| `stop:arrived` | `/tracking` | `{ loadId, stopId, arrivedAt }` | Appointment status updates to CHECKED_IN if arrival is within reasonable proximity of appointment. |

### Live Update Behavior

- **Update frequency:** WebSocket push for all appointment events. Calendar blocks update within 2 seconds.
- **Visual indicator:** Updated appointment blocks flash with a blue-50 highlight for 3 seconds. Rescheduled blocks animate smoothly to their new position. Summary strip counters animate on change.
- **Conflict handling:** If two users reschedule an appointment simultaneously, the server resolves based on last-write-wins. The losing user sees the block snap to the server state with a toast: "This appointment was updated by [user]. Your change was not applied."
- **Connection status:** Green "Live" dot in toolbar. Amber when reconnecting.

### Polling Fallback

- **When:** WebSocket `/dispatch` connection drops.
- **Interval:** Every 30 seconds.
- **Endpoint:** `GET /api/v1/appointments?since={lastTimestamp}&dateFrom={viewStart}&dateTo={viewEnd}`
- **Visual indicator:** Amber dot with "Updates may be delayed" in toolbar.

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Create appointment | Block appears immediately on calendar with "Saving..." indicator. | Block removed. Toast: "Failed to create appointment: [reason]." Form re-opens with data preserved. |
| Drag reschedule | Block animates to new time immediately. Old position shows ghost. | Block snaps back to original position. Ghost removed. Toast: "Reschedule failed: [reason]." |
| Confirm | Badge immediately changes to green "CONFIRMED." | Badge reverts to gray "REQUESTED." Toast: "Confirmation failed." |
| Cancel | Block immediately fades to 30% with strikethrough. | Block restored to previous appearance. Toast: "Cancellation failed." |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| `PageHeader` | `src/components/layout/page-header.tsx` | `title: "Appointment Scheduler"`, `actions` |
| `StatusBadge` | `src/components/ui/status-badge.tsx` | Appointment confirmation status badges |
| `Badge` | `src/components/ui/badge.tsx` | Type badges (PU/DEL), ETA status badges |
| `FilterBar` | `src/components/ui/filter-bar.tsx` | Facility, load, type, status filters |
| `Button` | `src/components/ui/button.tsx` | Action buttons in popover and header |
| `Card` | `src/components/ui/card.tsx` | Summary strip cards |
| `Tooltip` | `src/components/ui/tooltip.tsx` | Block hover tooltips, facility hours |
| `Calendar` | `src/components/ui/calendar.tsx` | Date picker in new appointment form |
| `Popover` | `src/components/ui/popover.tsx` | Appointment detail popover on block click |
| `Dialog` | `src/components/ui/dialog.tsx` | Bulk schedule wizard, reschedule reason prompt, cancel confirmation |
| `Sheet` | `src/components/ui/sheet.tsx` | New appointment side sheet form |
| `Select` | `src/components/ui/select.tsx` | Load selector, facility selector, status selector |
| `Skeleton` | `src/components/ui/skeleton.tsx` | Calendar loading state |
| `Avatar` | `src/components/ui/avatar.tsx` | Confirmed-by, rescheduled-by user display |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| `FilterBar` | Standard filter controls | Add "Type" toggle (Pickup/Delivery/All) as color-coded chips. Add "Status" multi-select with appointment confirmation status badges. |
| `Calendar` (shadcn) | Date picker calendar | This is NOT the appointment calendar component. The shadcn `calendar` is used for date selection in forms. The main calendar grid is a new component (see below). |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| `AppointmentCalendar` | Full calendar grid component supporting Day, Week, and Month views. Renders time axis (Y) and date columns (X). Supports drag-and-drop appointment blocks. Handles zoom, scroll, and navigation. | Very High -- calendar grid rendering, time positioning, drag-drop, multiple view modes, resize, responsive |
| `AppointmentBlock` | Individual appointment block rendered on the calendar. Shows type badge, load#, facility, status. Draggable. Click to open popover. Color-coded by type and status. | Medium -- conditional styling, drag handle, popover trigger, status-aware rendering |
| `AppointmentDetailPopover` | Popover that opens on appointment block click. Shows full details: facility info, time window, confirmation status, ETA, carrier, actions. | Medium -- multiple sections, action buttons, ETA calculation |
| `AppointmentForm` | Side sheet form for creating/editing appointments. Load selector, stop selector, facility auto-populate, date/time pickers, notes. | Medium -- form with dependent selectors, facility hours validation |
| `BulkScheduleWizard` | Multi-step modal for scheduling all appointments on a multi-stop load. Shows each stop with facility, suggested times, transit calculations, and validation. | High -- multi-step form, transit time calculations, conflict detection, validation |
| `ConflictWarning` | Visual indicator on calendar blocks when two appointments overlap at the same facility. Amber/red styling with tooltip explaining the conflict. | Small -- overlap detection, conditional styling |
| `FacilityHoursOverlay` | Gray overlay on calendar time slots that fall outside facility operating hours. Prevents scheduling during closed hours. | Medium -- facility hours mapping to calendar grid, multiple facilities |
| `CalendarViewToggle` | Toggle group for Day / Week / Month views. Updates the calendar grid layout. | Small -- toggle state, URL sync |
| `CalendarNavigator` | Navigation controls: Previous, Today, Next buttons with date range display ("Jan 13 - 19, 2026"). | Small -- date navigation logic |
| `AppointmentSummaryStrip` | Row of mini stat cards: Today's appointments, Confirmed, Pending, At-Risk. | Small -- stat aggregation, conditional red styling |
| `EtaOverlayLine` | Thin horizontal line or marker on the calendar showing a load's ETA relative to its appointment window. Green if within window, red if outside. | Small -- time position calculation, conditional color |
| `RescheduleReasonDialog` | Small dialog that prompts for a reason when rescheduling. Dropdown with predefined reasons + free-text option. | Small -- dropdown + textarea, required field |
| `TransitTimeBadge` | Badge showing transit time between consecutive stops on the same load. "280 mi, ~5h." Used in bulk wizard and calendar. | Small -- distance/time formatting |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Popover | `popover` | Appointment detail popover, time pickers |
| Dialog | `dialog` | Bulk schedule wizard, reschedule reason, cancel confirmation |
| Sheet | `sheet` | New appointment side sheet form |
| Calendar | `calendar` | Date picker in forms |
| Toggle Group | `toggle-group` | Day/Week/Month view toggle, PU/DEL type filter |
| Select | `select` | Load, stop, facility selectors |
| Tooltip | `tooltip` | Block hover, facility hours display |
| Context Menu | `context-menu` | Right-click on appointment blocks |
| Separator | `separator` | Section dividers in popover and forms |
| Alert | `alert` | Conflict warnings in bulk wizard |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook | Cache Time |
|---|---|---|---|---|---|
| 1 | GET | `/api/v1/appointments` | Fetch all appointments within a date range (fleet view calendar). Supports filters. | `useAppointments(dateRange, filters)` | 30s |
| 2 | GET | `/api/v1/loads/:loadId/appointments` | Fetch all appointments for a specific load | `useLoadAppointments(loadId)` | 30s |
| 3 | GET | `/api/v1/appointments/:id` | Fetch single appointment detail | `useAppointment(id)` | 60s |
| 4 | POST | `/api/v1/appointments` | Create a new appointment | `useCreateAppointment()` | -- |
| 5 | PUT | `/api/v1/appointments/:id` | Update appointment (reschedule, change time) | `useUpdateAppointment()` | -- |
| 6 | PATCH | `/api/v1/appointments/:id/status` | Update appointment confirmation status | `useUpdateAppointmentStatus()` | -- |
| 7 | DELETE | `/api/v1/appointments/:id` | Cancel/delete appointment (soft delete) | `useCancelAppointment()` | -- |
| 8 | POST | `/api/v1/appointments/bulk` | Create multiple appointments at once (bulk wizard) | `useBulkCreateAppointments()` | -- |
| 9 | GET | `/api/v1/appointments/conflicts` | Check for conflicts given a facility, date, and time range | `useAppointmentConflicts(facilityId, dateRange)` | 15s |
| 10 | GET | `/api/v1/facilities/:id` | Fetch facility details (hours, dock count, contacts) | `useFacility(facilityId)` | 300s |
| 11 | GET | `/api/v1/facilities` | Fetch active facilities for selector | `useFacilities()` | 300s |
| 12 | GET | `/api/v1/loads/:loadId/stops` | Fetch load stops for appointment scheduling context | `useLoadStops(loadId)` | 60s |

### Query Parameters

| Endpoint | Parameter | Type | Description |
|---|---|---|---|
| GET /appointments | `dateFrom` | ISO date | Start of calendar view range |
| GET /appointments | `dateTo` | ISO date | End of calendar view range |
| GET /appointments | `facilityId` | UUID | Filter by facility |
| GET /appointments | `loadId` | UUID | Filter by load |
| GET /appointments | `loadNumber` | string | Filter by load number (partial match) |
| GET /appointments | `type` | comma-separated | Filter by type: pickup, delivery |
| GET /appointments | `confirmationStatus` | comma-separated | Filter by status: requested, confirmed, checked_in, completed, missed, cancelled |
| GET /appointments/conflicts | `facilityId` | UUID | Facility to check |
| GET /appointments/conflicts | `date` | ISO date | Date to check |
| GET /appointments/conflicts | `timeFrom` | ISO time | Start of proposed window |
| GET /appointments/conflicts | `timeTo` | ISO time | End of proposed window |
| GET /appointments/conflicts | `excludeAppointmentId` | UUID | Exclude current appointment from conflict check (for reschedule) |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| `tenant:{tenantId}` on `/dispatch` | `appointment:created` | `useAppointmentLiveUpdates()` -- adds block to calendar |
| `tenant:{tenantId}` on `/dispatch` | `appointment:confirmed` | `useAppointmentLiveUpdates()` -- updates block status |
| `tenant:{tenantId}` on `/dispatch` | `appointment:rescheduled` | `useAppointmentLiveUpdates()` -- moves block to new time |
| `tenant:{tenantId}` on `/dispatch` | `appointment:cancelled` | `useAppointmentLiveUpdates()` -- fades block |
| `tenant:{tenantId}` on `/tracking` | `load:eta:updated` | `useAppointmentEtaUpdates()` -- recalculates block risk status |
| `tenant:{tenantId}` on `/tracking` | `stop:arrived` | `useAppointmentArrivalUpdates()` -- marks appointment as checked-in |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 409 | 500 |
|---|---|---|---|---|---|---|
| POST /appointments | Toast: "Validation error: [details]" | Redirect to login | Toast: "Permission denied" | Toast: "Load or facility not found" | Toast: "Conflict: Another appointment exists at this time" | Toast: "Failed to create appointment" |
| PUT /appointments/:id | Toast: "Invalid time: [reason]" | Redirect to login | Toast: "Permission denied" | Toast: "Appointment not found" | Toast: "Appointment was modified by another user" | Toast: "Reschedule failed" |
| PATCH /status | Toast: "Invalid status transition" | Redirect to login | Toast: "Permission denied" | Toast: "Not found" | Toast: "Status already updated" | Toast: "Update failed" |
| POST /bulk | Toast: "Validation errors: [stop-level details]" | Redirect to login | Toast: "Permission denied" | Toast: "Load not found" | Toast: "Conflict detected at [facility]" | Toast: "Bulk schedule failed" |

---

## 11. States & Edge Cases

### Loading State

- **Calendar skeleton:** Show calendar grid with header (day names for week view, or hours for day view). Render 3-5 skeleton blocks in random positions matching approximate appointment dimensions (gray animated rectangles, 120px wide, 60-120px tall). Navigation controls and view toggles render immediately (interactive).
- **Summary strip:** 4 skeleton mini-cards.
- **Duration threshold:** If loading exceeds 3 seconds, show "Loading appointments..." centered on calendar grid.

### Empty States

**No appointments in view range:**
- Calendar grid renders empty with time slots visible.
- Centered overlay message with calendar illustration.
- Headline: "No appointments scheduled"
- Description: "No pickup or delivery appointments are scheduled for this period. Create appointments from the Load Detail or use the Bulk Schedule wizard."
- CTA: "+ New Appointment" primary button and "Bulk Schedule" outline button.

**Load with no appointments (load-scoped):**
- "No appointments have been scheduled for this load."
- CTA: "Schedule Appointments" button that opens the bulk wizard for this load.

**Filtered empty:**
- "No appointments match your current filters."
- CTA: "Clear All Filters"

### Error States

**Full page error (API fails):**
- Error illustration + "Unable to load appointments" + Retry button. Calendar grid and navigation still visible but empty.

**Conflict during scheduling:**
- Inline amber alert in the form/wizard: "Potential conflict: LOAD-0839 is scheduled at Beta Corp on Jan 16, 2:00 PM - 4:00 PM. Facility has 2 docks available; both are occupied during this window."
- Buttons: "Schedule Anyway" (with reason required) or "Choose Different Time."

**Drag-drop failure:**
- Block snaps back to original position with reverse animation. Toast: "Reschedule failed: [reason]."

### Permission Denied

- **Full page denied:** "You don't have permission to view the appointment scheduler." Link to Operations Dashboard.
- **Create denied:** "+ New Appointment" and "Bulk Schedule" buttons hidden. Calendar is read-only. Popover shows "View Load" and "View Stops" only (no edit/confirm/cancel).
- **Dispatcher limited view:** Calendar only shows appointments for loads assigned to the current dispatcher.

### Offline / Degraded

- **Full offline:** Banner: "You're offline. Showing cached appointments." All create/edit actions disabled. Calendar displays last fetched data.
- **Degraded (WebSocket down):** Polling fallback. Appointments may be briefly outdated. Banner: "Updates may be delayed."

### Edge Cases

- **Overnight appointments:** Some facilities accept overnight deliveries (e.g., 11 PM - 2 AM). Calendar day view handles spanning midnight. Week view shows the block crossing the day boundary.
- **Very long appointment windows:** Some appointments span 6+ hours ("Any time Tuesday"). Block stretches to fill the time range but caps visual height in week/month view with a "6h window" label.
- **Same facility, multiple loads:** Two legitimate, non-conflicting appointments at the same facility (multi-dock facility). Blocks overlap visually but no conflict warning if dock capacity permits.
- **Timezone differences:** Appointment times are in the facility's local timezone. If a dispatcher is in a different timezone, the calendar shows facility-local time with a small timezone indicator.
- **Rescheduled multiple times:** Each reschedule creates a history entry. The popover shows "Rescheduled 3x" with expandable history showing original and all changed times.
- **Multi-stop loads with 5+ stops:** Bulk wizard handles up to 10 stops. Beyond 10 (rare), show "Too many stops for bulk wizard. Schedule individually."

---

## 12. Filters, Search & Sort

### Filters

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Facility | Searchable select | From `/api/v1/facilities?active=true` | All | `?facilityId=uuid` |
| 2 | Load Number | Search input | Text input with typeahead | Empty (all loads) | `?loadNumber=LOAD-0847` |
| 3 | Appointment Type | Toggle chips | All, Pickup, Delivery | All | `?type=pickup,delivery` |
| 4 | Confirmation Status | Multi-select | Requested, Confirmed, Checked In, Completed, Missed, Cancelled | Requested + Confirmed + Checked In (active) | `?status=requested,confirmed,checked_in` |
| 5 | Dispatcher | Select (ops_manager+) | All dispatchers | All (ops_manager), Self (dispatcher) | `?dispatcherId=uuid` |

### Search Behavior

- **Search field:** Load number search input with 300ms debounce. Selecting a result filters the calendar to show only that load's appointments and highlights them.
- **URL param:** `?loadNumber=LOAD-0847`

### Sort Options

Calendar appointments are positioned by time -- no traditional sort. However, when multiple appointments overlap in the same time slot, they are ordered by: load number ascending (left to right within the time slot).

### Saved Filters / Presets

- **System presets:** "All Active" (default), "Pending Confirmation" (status=requested), "At Risk" (ETA past appointment window), "Today's Appointments" (date=today), "My Loads" (dispatcher's loads only).
- **User-created presets:** Save current filter combination. Stored per-user.
- **URL sync:** Calendar date range, view mode, and all filters reflected in URL params.

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Sidebar collapses to icon-only mode.
- Calendar: Week view shows 5 days (Mon-Fri). Weekend columns hidden by default with toggle. Day view unaffected. Month view shows smaller cells.
- Appointment blocks: Narrower (100px). Load number truncated. Only type badge + facility name visible. Status badge as icon-only.
- Detail popover: Opens as a bottom sheet instead of floating popover.
- Filters: Collapse into "Filters" button with slide-over panel.
- Summary strip: Wraps to 2 rows.
- Drag-and-drop: Still functional but with touch-hold to initiate.

### Mobile (< 768px)

- Sidebar hidden (hamburger menu).
- Calendar: Defaults to Day view (single day, vertical timeline). Week/Month views available but heavily simplified (month shows just colored dots, week shows one column at a time with swipe navigation).
- Appointment blocks: Full-width in day view. Show type, load#, facility, status.
- Detail: Tap opens full-screen modal instead of popover.
- Drag-and-drop: Disabled. "Reschedule" button in modal opens time picker.
- Filters: Simplified to date and type. "More Filters" opens full-screen modal.
- New appointment: Full-screen form instead of side sheet.
- Bulk wizard: Full-screen stepped wizard (one stop per step).
- Summary strip: Horizontal scrollable row.
- Pull-to-refresh: Reloads calendar data.
- Sticky bottom bar: "+ New Appointment" button always visible.

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full week view with all columns. Wide blocks. Floating popovers. |
| Desktop | 1024px - 1439px | Same layout, narrower blocks. |
| Tablet | 768px - 1023px | 5-day week. Bottom sheet detail. Touch drag. |
| Mobile | < 768px | Day view default. Full-screen detail. No drag-drop. Sticky action bar. |

---

## 14. Stitch Prompt

```
Design an appointment scheduler calendar screen for a modern freight/logistics TMS (Transportation Management System) called "Ultra TMS." This screen shows all pickup and delivery appointments across loads on a calendar view.

Layout: Full-width page with a dark slate-900 sidebar on the left (240px). White content area. Page header: "Appointment Scheduler" title with subtitle "Pickup & delivery appointment calendar." Right side: blue-600 "+ New Appointment" button with Plus icon, "Bulk Schedule" outline button, and "Export" outline button.

Toolbar: Below the header, a row with: navigation arrows [< Previous] [Today button] [Next >], a date range display "Jan 13 - 19, 2026" in bold, a 3-button toggle group (Day | Week active/highlighted | Month), and filter chips: "Facility: All", "Type: All", "Status: Active."

Summary Strip: Below the toolbar, 4 mini stat cards in a row:
- "Today: 18" with calendar icon
- "Confirmed: 14" with green CheckCircle icon and green text
- "Pending: 3" with amber Clock icon and amber text
- "At Risk: 1" with red AlertTriangle icon and red text

Calendar Grid - Week View: A 7-column grid (Mon-Sun) with a time axis on the left (6 AM to 6 PM in 1-hour increments). Column headers show "Mon 13", "Tue 14", etc. in gray-700 bold text with the current day (Wed 15) highlighted with a blue-600 underline.

Appointment Blocks placed on the calendar:

Monday:
- 8:00 AM - 11:00 AM: Blue-100 block with solid blue-400 left border (3px). Content: "PU" blue badge, "LOAD-0852", "Beta Corp", gray "REQ" badge (dashed border style). Block has a subtle dashed outline indicating pending confirmation.

Tuesday:
- 7:00 AM - 10:00 AM: Blue-100 block with solid blue-400 border. "PU" blue badge, "LOAD-0847", "Acme Warehouse", green "CONF" badge with checkmark. Solid border style indicating confirmed.
- 12:00 PM - 3:00 PM: Green-100 block with solid green-400 border. "DEL" green badge, "LOAD-0852", "Atlas Dist.", green "CONF" badge.

Wednesday:
- 8:00 AM - 10:00 AM: Green-100 block with solid green-400 border. "DEL" green badge, "LOAD-0839", "Metro Hub", green "CONF" badge.
- 2:00 PM - 5:00 PM: Blue-100 block with dashed blue-300 border. "PU" blue badge, "LOAD-0861", "Apex Mfg", gray "REQ" badge.

Thursday:
- 10:00 AM - 12:00 PM: Green-100 block with solid red-400 border (at-risk). "DEL" green badge, "LOAD-0847", "Beta Corp", red "LATE" badge with exclamation icon. This block has a subtle red glow or thicker red border to draw attention.

Friday:
- 2:00 PM - 5:00 PM: Green-100 block with dashed green-300 border. "DEL" green badge, "LOAD-0861", "Summit Log.", gray "REQ" badge.

Show one appointment detail popover open (attached to the Tuesday 7-10 AM block):
White popover with rounded-lg corners, shadow-xl, arrow pointing to the block. Contains:
- Header: "Pickup Appointment" in bold 16px
- "LOAD-20260206-0847" in blue monospace
- Separator
- "Facility: Acme Warehouse" bold, "1200 Industrial Blvd, Chicago, IL 60601" gray text, "Hours: Mon-Fri 6AM-6PM" gray text
- Separator
- "Window: Jan 15, 8:00 AM - 10:00 AM"
- "Status:" green "CONFIRMED" badge with checkmark, "Confirmed by: John Smith (Acme) on Jan 13"
- Separator
- "Load ETA: Jan 15, 8:15 AM", green badge "On Time (-15m early)"
- Separator
- "Carrier: Swift Transport", "Driver: Carlos Martinez"
- Separator
- Row of buttons: "Reschedule" outline, "View Load" blue-600, "Cancel" outline red text

Also show a thin red horizontal line across Thursday at 11:30 AM labeled "ETA: LOAD-0847" indicating the load's expected arrival versus its scheduled 10 AM - 12 PM appointment window. The line is within the window, so it's green.

Design Specifications:
- Font: Inter or system sans-serif, 14px base, 12px for calendar block text
- Content background: white (#FFFFFF), calendar grid lines: gray-100
- Sidebar: slate-900, white text, blue-600 active on "Appointments"
- Primary color: blue-600 for buttons and links
- Pickup blocks: blue-100 background, blue-400 border (3px left or all sides)
- Delivery blocks: green-100 background, green-400 border
- Confirmed: solid border, white bg with colored left border
- Requested: dashed border, slightly transparent bg
- At-risk: red-400 border, subtle red glow
- Completed: 60% opacity, emerald badge
- Cancelled: 30% opacity, strikethrough
- Time axis: gray-300 horizontal lines at each hour, gray-500 time labels
- Current time: thin red horizontal line across all columns at the current time
- Popover: white bg, rounded-lg, shadow-xl, border border-gray-200
- Modern SaaS aesthetic similar to Google Calendar but with freight-specific data density
- Clean, professional feel with clear color coding for appointment types and statuses
```

---

## 15. Enhancement Opportunities

### Current State (Wave 2)

**What's built and working:**
- [ ] Nothing yet -- screen is Not Started.

**What needs to be built for MVP:**
- [ ] Calendar grid with Day, Week, and Month views
- [ ] Appointment blocks with type (PU/DEL), load#, facility, confirmation status
- [ ] Click to open detail popover with full info and actions
- [ ] Color-coded blocks by type and confirmation status
- [ ] Drag to reschedule with reason prompt
- [ ] Conflict detection and visual warning
- [ ] Appointment confirmation status workflow (Requested -> Confirmed -> Completed)
- [ ] Filter by facility, load, type, status
- [ ] Summary strip with today's counts
- [ ] New appointment form (side sheet)
- [ ] Bulk schedule wizard for multi-stop loads
- [ ] Facility hours integration (warn if outside hours)
- [ ] ETA overlay showing load ETA relative to appointment window
- [ ] WebSocket integration for real-time updates
- [ ] Calendar navigation (prev/today/next)

**What to add this wave (post-MVP polish):**
- [ ] Facility hours gray-out overlay on calendar
- [ ] Appointment request workflow (email/portal confirmation)
- [ ] Auto-reschedule suggestions based on ETA changes
- [ ] Print daily schedule PDF
- [ ] Calendar export (iCal, Google Calendar)

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Calendar grid with Day/Week/Month views | High | High | P0 |
| Appointment blocks with type/status | High | Medium | P0 |
| Confirmation status workflow | High | Medium | P0 |
| Drag to reschedule | High | Medium | P0 |
| Conflict detection | High | Medium | P0 |
| New appointment form | High | Medium | P0 |
| Bulk schedule wizard | High | High | P0 |
| Filter by facility/load/type/status | Medium | Medium | P0 |
| ETA overlay on calendar | High | Medium | P1 |
| Facility hours integration | Medium | Medium | P1 |
| WebSocket real-time updates | Medium | Medium | P1 |
| Summary strip | Medium | Low | P1 |
| Appointment request workflow (email) | High | High | P2 |
| Auto-reschedule suggestions | High | High | P2 |
| Facility availability API integration | Medium | High | P2 |
| Calendar sync (iCal/Google) | Low | Medium | P2 |
| Recurring appointments | Low | High | P2 |
| Dock scheduling optimization | Medium | High | P2 |
| Print daily schedule | Low | Low | P2 |

### Future Wave Preview

- **Wave 3:** Appointment request workflow with email/portal confirmation loop. Facility hours overlay on calendar. Auto-reschedule suggestions when load ETAs change. SMS/email confirmation reminders 24/12 hours before appointment. Calendar export to iCal/Google Calendar.
- **Wave 4:** Integration with facility scheduling APIs (Opendock, C2FO) for real-time dock availability. AI-powered appointment optimization ("Based on traffic patterns, scheduling your Dallas delivery for 3 PM instead of 2 PM reduces detention risk by 40%"). Recurring appointment templates for regular customers. Multi-tenant facility coordination (when multiple brokerages use Ultra TMS, prevent cross-tenant dock conflicts).

---

<!--
DESIGN NOTES:
- The appointment scheduler is conceptually similar to Google Calendar but purpose-built for freight logistics. The key differentiator is the integration of freight-specific data: load ETAs, facility hours, confirmation workflows, and conflict detection based on dock capacity.
- The calendar component is the most complex new UI element in this screen. Options: build custom with CSS Grid, use @fullcalendar/react (recommended -- mature, supports drag-drop, multiple views, resource scheduling), or use a lighter library like react-big-calendar.
- @fullcalendar/react is recommended because it provides: Day/Week/Month views out of the box, drag-and-drop rescheduling, external event dropping, resource view (could map facilities to resources for dock scheduling), and extensive customization via render hooks.
- Conflict detection is the highest-value feature. Even simple overlap detection (two appointments at the same facility at the same time) prevents real-world costly errors. True capacity-based conflict detection (dock count tracking) is Wave 3.
- The bulk schedule wizard is critical for multi-stop loads. Without it, scheduling 5 stops means 5 separate form submissions. The wizard validates transit time feasibility between stops and prevents physically impossible schedules.
-->
