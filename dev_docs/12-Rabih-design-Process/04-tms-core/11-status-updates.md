# Status Updates

> Service: TMS Core (Service 04) | Wave: 2 | Priority: P1
> Route: /(dashboard)/loads/[id]/status-history | Also: /(dashboard)/operations/status-updates | Status: Not Started
> Primary Personas: Maria Rodriguez (Dispatcher), Sarah Chen (Operations Manager)
> Roles with Access: dispatcher, ops_manager, admin, finance (read-only), support (read-only)
> Screen Type: List

---

## 1. Purpose & Business Context

**What this screen does:**
The Status Updates screen provides a comprehensive, chronological log of all status changes across loads (and optionally orders). Every time a load transitions from one status to another -- whether triggered manually by a dispatcher, automatically by a geofence event, or via WebSocket from an integrated tracking system -- that transition is recorded and displayed here. Each entry shows the precise timestamp, the old status, the new status, who or what made the change, the reason or notes attached, and the source of the change (manual, automatic, API, WebSocket). The screen operates in two modes: load-scoped (showing history for a single load, accessed from Load Detail) and fleet-scoped (showing status changes across all loads for operational oversight, accessed from the sidebar).

**Business problem it solves:**
In freight operations, status accuracy is the difference between a smooth delivery and a costly service failure. When disputes arise -- "When was my load picked up?", "Who marked this as delivered?", "Why was the status reverted?" -- dispatchers and managers need an irrefutable audit trail. Without this screen, they must query the database directly or ask IT to pull logs, a process that takes hours and requires technical expertise. This screen makes the full status change history instantly accessible, filterable, and exportable. Sarah uses the fleet-scoped view during weekly compliance reviews to verify that all loads followed proper status progression. Maria uses the load-scoped view when a customer questions timing. Auditors use the export feature to verify regulatory compliance for hazmat and temperature-controlled shipments.

**Key business rules:**
- Status change records are immutable -- they cannot be edited or deleted by any user, including admins. This ensures audit integrity.
- Every status change must have a `changed_by` field. System-triggered changes (geofence, API webhook, scheduled automation) are attributed to "System" with a `source` field indicating the trigger type.
- Backward status transitions (e.g., DELIVERED -> IN_TRANSIT) require a reason code. The reason is stored with the status change record and is mandatory.
- Status changes that violate the state machine (e.g., PENDING -> DELIVERED, skipping intermediate statuses) are rejected by the API and do not appear in the log. The log only shows valid, successful transitions.
- The fleet-scoped view supports filtering by date range, load, status type, user, and source. Minimum date range for export is 1 day; maximum is 90 days.
- Rate and financial information is never displayed on this screen -- it is purely operational status tracking.

**Success metric:**
Time to produce a status audit report for a specific load drops from 2 hours (manual database query) to 10 seconds (filter by load#, click export). Dispute resolution time with customers drops from 30 minutes to 2 minutes. Weekly compliance review time drops from 4 hours to 30 minutes.

---

## 2. User Journey Context

**Comes from (entry points):**

| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Load Detail | Click "Status History" tab or "View Status Log" link | `loadId` via route param |
| Load Timeline | Click a "status_changed" event card > "View Full History" | `loadId`, `scrollTo=eventId` |
| Sidebar Navigation | Click "Status Updates" in TMS Core sidebar group | None (fleet-scoped view) |
| Operations Dashboard | Click on an alert related to status issues | `?loadId=id` pre-filtered |
| Dispatch Board | Right-click load card > "View Status History" | `loadId` |
| Tracking Map | Side panel > Click status badge > "View History" | `loadId` |
| Notification Center | Click "Status changed" notification | `loadId`, `scrollTo=changeId` |
| Direct URL | Bookmark / shared link | Route params, query filters |

**Goes to (exit points):**

| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Load Detail | Click load number link in any status change row | `loadId` |
| Load Timeline | Click "View Full Timeline" link | `loadId` |
| Check Calls | Click "View Check Call" link on auto-generated status change entries | `loadId`, `checkCallId` |
| User Profile | Click user name link in "changed_by" column | `userId` |
| Tracking Map | Click "View on Map" for location-triggered status changes | `loadId` |
| Export (Download) | Click "Export" button to download CSV/PDF | Filtered data set |

**Primary trigger:**
Maria opens the load-scoped view when a customer disputes a delivery time or when she needs to verify the sequence of events on a problematic load. Sarah opens the fleet-scoped view during weekly compliance reviews and when investigating operational patterns (e.g., "Are loads consistently getting stuck in TENDERED status?"). Support users access it when troubleshooting status-related customer complaints.

**Success criteria (user completes the screen when):**
- User has found the specific status change they were looking for and verified the timestamp, actor, and reason.
- User has exported a compliance report for a date range covering the audit period.
- User has identified patterns in status changes that indicate operational issues (e.g., frequent backward transitions, status changes outside business hours).

---

## 3. Layout Blueprint

### Desktop Layout (1440px+) -- Fleet-Scoped View

```
+------------------------------------------------------------------+
|  PageHeader: "Status Updates"                                      |
|  Subtitle: "Load status change log and audit trail"               |
|  Right: [Export CSV] [Export PDF]                                  |
+------------------------------------------------------------------+
|  Filter Bar                                                        |
|  [Date Range: Today v] [Load#: ________] [Status: All v]          |
|  [Changed By: All v] [Source: All v] [Direction: All v]           |
|  [Apply Filters] [Clear All]  Saved: [My Filters v]              |
+------------------------------------------------------------------+
|  Summary Strip                                                     |
|  Total Changes: 342 | Forward: 298 | Backward: 12 | Auto: 189    |
|  | Manual: 153 | Avg transitions/load: 6.2                        |
+------------------------------------------------------------------+
|                                                                    |
|  +--------------------------------------------------------------+ |
|  | Status Change Log (DataTable)                                 | |
|  |--------------------------------------------------------------| |
|  | Timestamp      | Load #       | Old Status | → | New Status  | |
|  | Changed By     | Source       | Reason/Notes                 | |
|  |--------------------------------------------------------------| |
|  | Jan 15 8:22 AM | LOAD-0847   | DISPATCHED | → | AT_PICKUP   | |
|  | System         | Geofence     | Auto: entered pickup radius  | |
|  |--------------------------------------------------------------| |
|  | Jan 15 8:20 AM | LOAD-0852   | PENDING    | → | TENDERED    | |
|  | Maria R.       | Manual       | Tendered to Swift Transport   | |
|  |--------------------------------------------------------------| |
|  | Jan 15 8:15 AM | LOAD-0847   | ACCEPTED   | → | DISPATCHED  | |
|  | Maria R.       | Manual       | Rate con signed, dispatching  | |
|  |--------------------------------------------------------------| |
|  | Jan 15 8:10 AM | LOAD-0839   | IN_TRANSIT | → | AT_DELIVERY | |
|  | System         | Geofence     | Auto: entered delivery radius | |
|  |--------------------------------------------------------------| |
|  | Jan 15 8:05 AM | LOAD-0841   | DELIVERED  | → | IN_TRANSIT  | |
|  | Sarah C. [Mgr] | Manual       | Reason: Incorrect delivery    | |
|  |                |              | confirmation. Driver still    | |
|  |                |              | en route. Reverting.          | |
|  |--------------------------------------------------------------| |
|  | ... more rows ...                                             | |
|  |--------------------------------------------------------------| |
|  | Showing 1-25 of 342         [< 1 2 3 4 ... 14 >]  [25 v]    | |
|  +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

### Desktop Layout -- Load-Scoped View

```
+------------------------------------------------------------------+
|  Breadcrumb: Loads > LOAD-20260206-0847 > Status History          |
+------------------------------------------------------------------+
|  Load Header Bar (compact)                                         |
|  LOAD-0847 | IN_TRANSIT | Swift Transport | Chicago,IL > Dallas,TX|
+------------------------------------------------------------------+
|  Current Status: [IN_TRANSIT] sky-blue badge                       |
|  Total Transitions: 7 | Time in Current Status: 2h 15m            |
+------------------------------------------------------------------+
|  Status Progression Visualization                                  |
|  [PLANNING]--[PENDING]--[TENDERED]--[ACCEPTED]--[DISPATCHED]--    |
|  --[AT_PICKUP]--[PICKED_UP]-->[IN_TRANSIT]   ○ AT_DELIVERY        |
|  (filled dots for completed, current pulsing, hollow for future)   |
+------------------------------------------------------------------+
|                                                                    |
|  +--------------------------------------------------------------+ |
|  | Status Change History                                         | |
|  |--------------------------------------------------------------| |
|  | #7 | Jan 15 10:15 AM | PICKED_UP → IN_TRANSIT               | |
|  |    | System | Geofence | Auto: departed pickup geofence       | |
|  |--------------------------------------------------------------| |
|  | #6 | Jan 15 8:22 AM  | AT_PICKUP → PICKED_UP                 | |
|  |    | Maria R. | Manual | BOL signed, freight loaded            | |
|  |--------------------------------------------------------------| |
|  | #5 | Jan 15 8:22 AM  | DISPATCHED → AT_PICKUP                | |
|  |    | System | Geofence | Auto: entered pickup radius           | |
|  |--------------------------------------------------------------| |
|  | #4 | Jan 15 6:30 AM  | ACCEPTED → DISPATCHED                  | |
|  |    | Maria R. | Manual | Rate con signed, dispatching           | |
|  |--------------------------------------------------------------| |
|  | #3 | Jan 14 5:45 PM  | TENDERED → ACCEPTED                    | |
|  |    | System | API | Carrier accepted via portal                | |
|  |--------------------------------------------------------------| |
|  | #2 | Jan 14 4:10 PM  | PENDING → TENDERED                     | |
|  |    | Maria R. | Manual | Tendered to Swift Transport            | |
|  |--------------------------------------------------------------| |
|  | #1 | Jan 14 3:22 PM  | -- → PLANNING                          | |
|  |    | Maria R. | Manual | Load created from Order ORD-1234       | |
|  +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible per row) | Timestamp, load number, old status -> new status transition, changed_by | These four data points answer the core question: "What changed, when, and who did it?" -- scannable in under 2 seconds per row |
| **Secondary** (visible per row, supporting context) | Source type (Manual/Geofence/API/WebSocket), reason/notes text | Explains how and why the change happened -- critical for audit and dispute resolution |
| **Tertiary** (visible on row expand or load-scoped view) | Status progression visualization, time between transitions, time in each status, sequential number | Provides pattern analysis context -- useful for compliance reviews and operational optimization |
| **Hidden** (behind navigation) | Full load detail, complete timeline, carrier information, associated check calls | Deep context accessed by clicking through to other screens |

---

## 4. Data Fields & Display

### Status Change Record Fields

| # | Field Label | Source (Entity.field) | Format / Display | Location |
|---|---|---|---|---|
| 1 | Timestamp | StatusChange.createdAt | "Jan 15, 2026 8:22:14 AM CST" (full precision). Relative time on hover: "2h 15m ago". | Column 1, left-aligned |
| 2 | Load Number | StatusChange.loadNumber | `LOAD-20260206-0847` monospace, bold, blue-600 clickable link | Column 2 |
| 3 | Old Status | StatusChange.oldStatus | StatusBadge component, small size, muted opacity (0.6) | Column 3, left of arrow |
| 4 | Transition Arrow | Static | `→` arrow icon (ArrowRight, gray-400) | Column 3, between badges |
| 5 | New Status | StatusChange.newStatus | StatusBadge component, small size, full opacity | Column 3, right of arrow |
| 6 | Changed By | StatusChange.changedBy.name | User name with small avatar. "System" for automated changes with robot icon. | Column 4 |
| 7 | Source | StatusChange.source | Badge: "Manual" (gray-100), "Geofence" (green-100), "API" (blue-100), "WebSocket" (purple-100), "Scheduled" (amber-100) | Column 5 |
| 8 | Direction | Calculated | Badge: "Forward" (green-100, ArrowUp icon) or "Backward" (red-100, ArrowDown icon) | Column 6 |
| 9 | Reason / Notes | StatusChange.reason + StatusChange.notes | Text, truncated at 80 chars with tooltip for full text. Mandatory for backward transitions. | Column 7, or expandable row detail |
| 10 | Reason Code | StatusChange.reasonCode | If backward: tag from predefined list (e.g., "INCORRECT_STATUS", "DATA_CORRECTION", "CUSTOMER_REQUEST") | Column 7, above free-text notes |

### Summary Strip Fields (Fleet-Scoped View)

| # | Field | Calculation | Format |
|---|---|---|---|
| 1 | Total Changes | Count of status changes in filtered range | "342 changes" |
| 2 | Forward Transitions | Count where new_status is later in state machine than old_status | "298 forward" with green badge |
| 3 | Backward Transitions | Count where new_status is earlier in state machine than old_status | "12 backward" with red badge (red if > 0) |
| 4 | Automated | Count where source != 'manual' | "189 automated" with blue badge |
| 5 | Manual | Count where source == 'manual' | "153 manual" with gray badge |
| 6 | Avg Transitions/Load | Total changes / distinct load count | "6.2 avg transitions/load" |

### Status Progression Visualization Fields (Load-Scoped View)

| # | Field | Source | Format |
|---|---|---|---|
| 1 | Status Steps | Load status state machine | Horizontal sequence of status badges connected by lines |
| 2 | Completed Steps | StatusChanges where status was reached | Filled circles with color matching status |
| 3 | Current Step | Load.status | Pulsing circle with blue ring animation |
| 4 | Future Steps | Remaining states in machine | Hollow gray circles |
| 5 | Time In Current Status | `now() - lastStatusChange.createdAt` | "2h 15m" displayed below current step |
| 6 | Time Between Transitions | `statusChange[n].createdAt - statusChange[n-1].createdAt` | Displayed on connecting lines between steps |

### Calculated / Derived Fields

| # | Field | Calculation | Format |
|---|---|---|---|
| 1 | Transition Direction | Compare old_status and new_status positions in state machine | "Forward" (green) or "Backward" (red) |
| 2 | Time Since Last Change | `now() - statusChange.createdAt` | "2h 15m ago" in relative format |
| 3 | Dwell in Previous Status | `statusChange.createdAt - previousChange.createdAt` | "4h 12m in DISPATCHED" -- shown on row expand |
| 4 | Transition Sequence Number | Ordinal position in load's status history | "#7" for 7th transition (load-scoped view) |
| 5 | Business Hours Flag | Whether the change occurred during business hours (6 AM - 8 PM local) | No direct display; used for highlighting off-hours changes |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] Fleet-scoped view: DataTable showing all status changes across loads with filters, pagination, and sorting
- [ ] Load-scoped view: Chronological list of status changes for a single load with status progression visualization
- [ ] Each row displays: timestamp, load number, old status -> new status (with StatusBadge components), changed_by, source, reason/notes
- [ ] Filter by date range (Today, Yesterday, This Week, This Month, Custom), load number, status type, user, source
- [ ] Sort by timestamp (default: newest first), load number, status
- [ ] Pagination: 25 rows per page default, options for 10, 25, 50, 100
- [ ] Status progression horizontal visualization for load-scoped view showing completed, current, and future statuses
- [ ] Summary strip with aggregate counts (total, forward, backward, automated, manual)
- [ ] Backward transition highlighting: rows with backward transitions have a subtle red-50 background and red left border
- [ ] Export to CSV with all visible columns plus additional metadata (load route, carrier, customer)
- [ ] Export to PDF with formatted table and summary header
- [ ] Row expand for full reason/notes text when truncated
- [ ] Click load number to navigate to Load Detail
- [ ] Click user name to see all changes by that user (applies filter)

### Advanced Features (Logistics Expert Recommendations)

- [ ] **Batch view mode** -- Select multiple loads (checkboxes) and view their status histories side by side in a comparison table. Useful for investigating systemic issues across related loads.
- [ ] **Anomaly detection highlights** -- Automatically flag unusual patterns: rapid status cycling (status changed and reverted within 5 minutes), status changes outside business hours, unusually long dwell times in a single status.
- [ ] **Status flow Sankey diagram** -- Visual chart showing how loads flow between statuses. Width of flow lines proportional to count. Highlights where loads "get stuck" or frequently revert. Toggle between table and visualization.
- [ ] **Auto-generated entries from geofence triggers** -- When a geofence event triggers a status change, the entry includes GPS coordinates, geofence facility name, and distance from geofence boundary. Mini-map thumbnail in expanded row.
- [ ] **Auto-generated entries from check calls** -- When a check call results in a status update, the entry links to the check call record and includes the check call notes.
- [ ] **Compliance flags** -- For hazmat loads, flag any status change that violates regulatory timing requirements (e.g., pickup-to-delivery must be within 24 hours). For temperature-controlled loads, flag status gaps that could indicate monitoring lapses.
- [ ] **Email digest** -- Schedule a daily or weekly status change summary email to operations managers showing backward transitions, anomalies, and aggregate stats.
- [ ] **Diff view** -- For loads with backward transitions, show the "expected" status progression vs actual progression side by side.
- [ ] **Inline status update** -- In fleet-scoped view, ability to click a load row and update its current status directly from this screen (quick action without navigating to Load Detail).

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| View fleet-scoped status changes | ops_manager, admin | `status_view_all` | Redirected to load-scoped view; fleet route not accessible |
| View all users' changes | ops_manager, admin | `status_view_all` | "Changed By" filter limited to own name; only sees own changes in fleet view |
| Export CSV/PDF | dispatcher, ops_manager, admin | `export_data` | Export buttons hidden |
| View backward transition details | dispatcher, ops_manager, admin | `status_audit` | Backward rows visible but reason/notes collapsed |
| Inline status update | dispatcher, ops_manager, admin | `load_status_update` | Inline update action hidden |
| View compliance flags | ops_manager, admin | `compliance_view` | Compliance flag column hidden |

---

## 6. Status & State Machine

The Status Updates screen is a read-only audit trail of the load status machine. It displays every transition that has occurred. The status machine it tracks is the full Load Status flow:

### Load Status State Machine (Tracked Transitions)

```
[PLANNING] ─── forward ───> [PENDING] ─── forward ───> [TENDERED]
                                                            |
                                                     forward│
                                                            v
                                                       [ACCEPTED]
                                                            |
                                                     forward│
                                                            v
                                                      [DISPATCHED]
                                                            |
                                                     forward│
                                                            v
                                                      [AT_PICKUP]
                                                            |
                                                     forward│
                                                            v
                                                      [PICKED_UP]
                                                            |
                                                     forward│
                                                            v
                                                      [IN_TRANSIT]
                                                            |
                                                     forward│
                                                            v
                                                     [AT_DELIVERY]
                                                            |
                                                     forward│
                                                            v
                                                      [DELIVERED]
                                                            |
                                                     forward│
                                                            v
                                                      [COMPLETED]

Any status ─── backward (requires reason) ───> earlier status
Any pre-delivery ─── cancel ───> [CANCELLED]
```

### Transition Direction Classification

| Direction | Definition | Row Style | Badge |
|---|---|---|---|
| Forward | new_status is later in the state machine than old_status | Normal row, white background | Green badge with ArrowUp icon |
| Backward | new_status is earlier in the state machine than old_status | Red-50 background, red left border (3px) | Red badge with ArrowDown icon |
| Cancel | new_status is CANCELLED | Amber-50 background | Amber badge with XCircle icon |
| Initial | old_status is null (load creation) | Blue-50 background | Blue badge with Plus icon |

### Source Type Classification

| Source | Description | Badge Color | Icon |
|---|---|---|---|
| Manual | User clicked a status button or used drag-and-drop | Gray-100, text gray-700 | `User` |
| Geofence | GPS position triggered an automatic geofence entry/exit | Green-100, text green-700 | `MapPin` |
| API | External system (carrier portal, EDI, customer portal) triggered the change | Blue-100, text blue-700 | `Globe` |
| WebSocket | Real-time event from an integrated tracking provider | Purple-100, text purple-700 | `Wifi` |
| Scheduled | Automated rule (e.g., auto-complete loads 48 hours after delivery) | Amber-100, text amber-700 | `Clock` |

### Status Badge Colors (Consistent with Global System)

| Status | Background | Text | Tailwind |
|---|---|---|---|
| PLANNING | `slate-100` | `slate-700` | `bg-slate-100 text-slate-700` |
| PENDING | `gray-100` | `gray-700` | `bg-gray-100 text-gray-700` |
| TENDERED | `violet-100` | `violet-800` | `bg-violet-100 text-violet-800` |
| ACCEPTED | `blue-100` | `blue-800` | `bg-blue-100 text-blue-800` |
| DISPATCHED | `indigo-100` | `indigo-800` | `bg-indigo-100 text-indigo-800` |
| AT_PICKUP | `amber-100` | `amber-800` | `bg-amber-100 text-amber-800` |
| PICKED_UP | `cyan-100` | `cyan-800` | `bg-cyan-100 text-cyan-800` |
| IN_TRANSIT | `sky-100` | `sky-800` | `bg-sky-100 text-sky-800` |
| AT_DELIVERY | `teal-100` | `teal-800` | `bg-teal-100 text-teal-800` |
| DELIVERED | `lime-100` | `lime-800` | `bg-lime-100 text-lime-800` |
| COMPLETED | `emerald-100` | `emerald-800` | `bg-emerald-100 text-emerald-800` |
| CANCELLED | `red-100` | `red-800` | `bg-red-100 text-red-800` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Page Header Right)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| Export CSV | `Download` | Secondary / Outline | Downloads current filtered data as CSV file | No |
| Export PDF | `FileText` | Secondary / Outline | Downloads current filtered data as formatted PDF report | No |

### Row-Level Actions

| Action | Icon | Trigger | Behavior |
|---|---|---|---|
| View Load | `ExternalLink` | Click load number link | Navigates to Load Detail page |
| View User | `User` | Click user name link | Filters table to show only changes by this user |
| Expand Row | `ChevronDown` | Click row expand icon or row itself | Shows full reason/notes text, GPS coordinates for geofence changes, time in previous status |
| Copy Change ID | `Copy` | Click copy icon (visible on hover) | Copies the status change record ID to clipboard for reference |
| View on Timeline | `Clock` | Click "Timeline" icon (visible on hover) | Navigates to Load Timeline scrolled to this event |

### Bulk Actions (Fleet-Scoped View)

| Action | Behavior | Condition |
|---|---|---|
| Select All (current page) | Selects all rows on current page for bulk export | Always |
| Export Selected | Downloads only selected rows as CSV | At least 1 row selected |

### Filter Actions

| Action | Behavior |
|---|---|
| Apply Filters | Refreshes table with current filter selections. Updates URL params. |
| Clear All | Resets all filters to defaults (Today, All statuses, All users, All sources). |
| Save Filter Preset | Opens dialog to name and save current filter combination. |
| Load Saved Filter | Applies a previously saved filter preset. |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl/Cmd + E` | Export current view as CSV |
| `Ctrl/Cmd + Shift + E` | Export current view as PDF |
| `Ctrl/Cmd + K` | Open global search / command palette |
| `J` / `ArrowDown` | Move to next row |
| `K` / `ArrowUp` | Move to previous row |
| `Enter` | Expand/collapse current row |
| `O` | Open Load Detail for current row |
| `F` | Focus filter bar |
| `Escape` | Close expanded row / clear search |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| N/A | N/A | No drag-and-drop on this screen -- it is a read-only audit log. |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Namespace | Payload | UI Update |
|---|---|---|---|
| `load:status:changed` | `/dispatch` | `{ loadId, loadNumber, previousStatus, newStatus, changedBy, source, reason, reasonCode, timestamp }` | Prepend new row at top of table (if sorted newest-first) with slide-down animation. Increment "Total Changes" in summary strip. Increment appropriate direction counter (Forward/Backward). Flash new row with blue-50 background for 3 seconds. If load-scoped view and matching loadId, update status progression visualization. |
| `load:created` | `/dispatch` | `{ loadId, loadNumber, status, createdBy, timestamp }` | Prepend new row with "-- -> PLANNING" transition. |

### Live Update Behavior

- **Update frequency:** WebSocket push for every status change event. New rows appear within 2 seconds of the change occurring anywhere in the system.
- **Visual indicator:** New rows that arrive via WebSocket slide in from the top with a subtle animation and have a blue-50 background highlight that fades over 3 seconds. The summary strip counters animate (number ticks up).
- **Conflict handling:** This is a read-only screen. No editing conflicts possible. New events are simply prepended to the list.
- **Batching:** If multiple status changes arrive within 500ms (e.g., bulk status update), they are batched and inserted as a group with a single animation.

### Polling Fallback

- **When:** WebSocket `/dispatch` connection drops.
- **Interval:** Every 30 seconds.
- **Endpoint:** `GET /api/v1/loads/status-history?since={lastTimestamp}`
- **Visual indicator:** Amber dot with "Updates may be delayed" text in the page header area.

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| N/A | This is a read-only audit log. No user-initiated mutations occur on this screen. | N/A |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| `PageHeader` | `src/components/layout/page-header.tsx` | `title: "Status Updates"`, `subtitle`, `actions: [ExportCSV, ExportPDF]` |
| `DataTable` | `src/components/ui/data-table.tsx` | Columns, pagination, sorting, expandable rows |
| `StatusBadge` | `src/components/ui/status-badge.tsx` | `entity: LOAD_STATUS, status: string, size: 'sm'` |
| `FilterBar` | `src/components/ui/filter-bar.tsx` | Date range, multi-select, searchable select, chips |
| `Badge` | `src/components/ui/badge.tsx` | Source type badges, direction badges |
| `Avatar` | `src/components/ui/avatar.tsx` | User avatars in "Changed By" column |
| `Tooltip` | `src/components/ui/tooltip.tsx` | Full reason text on truncated notes, absolute timestamps |
| `Skeleton` | `src/components/ui/skeleton.tsx` | Loading state skeletons |
| `Card` | `src/components/ui/card.tsx` | Summary strip cards |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| `DataTable` | Standard table with sorting and pagination | Add expandable row detail support (click row to expand inline showing additional fields). Add row background color support (conditional row styling based on direction: red-50 for backward). Add real-time row prepend animation. |
| `StatusBadge` | Single status display | Add "transition" variant: renders `[Old Status] → [New Status]` with arrow between two badges. Already noted in Load Timeline -- same enhancement. |
| `FilterBar` | Standard filter controls | Add "source type" multi-select filter with badge-style options. Add "direction" toggle (All/Forward/Backward). |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| `StatusTransitionDisplay` | Renders old status badge -> arrow -> new status badge in a single inline component. Handles null old_status for load creation entries. | Small |
| `StatusProgressionBar` | Horizontal visualization showing all statuses in the load state machine as connected circles. Completed statuses are filled with their color, current status pulses, future statuses are hollow gray. Time between transitions shown on connecting lines. | Medium |
| `SourceBadge` | Badge component for status change source type: Manual, Geofence, API, WebSocket, Scheduled. Each with distinct color and icon. | Small |
| `DirectionBadge` | Badge showing transition direction: Forward (green, arrow up), Backward (red, arrow down), Cancel (amber, X), Initial (blue, plus). | Small |
| `StatusChangeSummaryStrip` | Row of mini stat cards showing aggregate metrics for the current filter: total changes, forward count, backward count, automated count, manual count, avg transitions/load. | Medium |
| `StatusChangeExpandedRow` | Expanded row content showing full reason text, GPS coordinates (for geofence changes), mini-map thumbnail, time in previous status, and links to related records. | Medium |
| `BackwardTransitionHighlight` | Row wrapper that applies red-50 background and red-500 left border to backward transition rows. | Small |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Table | `table` | Core DataTable rendering |
| Popover | `popover` | Date range picker, filter dropdowns |
| Calendar | `calendar` | Date range selection |
| Select | `select` | Status, user, source filter selects |
| Collapsible | `collapsible` | Expandable row details |
| Separator | `separator` | Between summary strip and table |
| Toggle Group | `toggle-group` | Direction filter (All/Forward/Backward) |
| Command | `command` | Load number search with typeahead |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook | Cache Time |
|---|---|---|---|---|---|
| 1 | GET | `/api/v1/loads/status-history` | Fetch paginated status change log across all loads (fleet-scoped). Supports filters for date, load, status, user, source, direction. | `useStatusHistory(filters, pagination)` | 30s |
| 2 | GET | `/api/v1/loads/:id/status-history` | Fetch all status changes for a single load (load-scoped, no pagination needed -- typically <20 entries) | `useLoadStatusHistory(loadId)` | 60s |
| 3 | GET | `/api/v1/loads/status-history/stats` | Fetch aggregate statistics for the current filter (totals, forward/backward counts, source breakdown) | `useStatusHistoryStats(filters)` | 60s |
| 4 | POST | `/api/v1/loads/status-history/export` | Export filtered status history as CSV or PDF. Returns download URL. | `useExportStatusHistory(filters, format)` | -- |
| 5 | GET | `/api/v1/loads/:id` | Fetch load header data (for load-scoped view header bar) | `useLoad(loadId)` | 60s |

### Query Parameters

| Endpoint | Parameter | Type | Description |
|---|---|---|---|
| Fleet status-history | `dateFrom` | ISO date | Start date filter |
| Fleet status-history | `dateTo` | ISO date | End date filter |
| Fleet status-history | `loadNumber` | string | Filter by load number (partial match) |
| Fleet status-history | `loadId` | UUID | Filter by specific load |
| Fleet status-history | `oldStatus` | comma-separated | Filter by previous status |
| Fleet status-history | `newStatus` | comma-separated | Filter by new status |
| Fleet status-history | `changedBy` | UUID | Filter by user who made the change |
| Fleet status-history | `source` | comma-separated | Filter by source: manual, geofence, api, websocket, scheduled |
| Fleet status-history | `direction` | string | Filter by direction: forward, backward, cancel, initial |
| Fleet status-history | `sort` | string | Sort field: createdAt (default), loadNumber |
| Fleet status-history | `order` | string | Sort direction: desc (default), asc |
| Fleet status-history | `page` | number | Page number (cursor-based internally) |
| Fleet status-history | `limit` | number | Results per page (default 25, max 100) |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| `tenant:{tenantId}` on `/dispatch` | `load:status:changed` | `useStatusHistoryLiveUpdates()` -- prepends new row to table, updates summary stats |
| `tenant:{tenantId}` on `/dispatch` | `load:created` | `useStatusHistoryLiveUpdates()` -- prepends creation entry |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 500 |
|---|---|---|---|---|---|
| GET /status-history | Toast: "Invalid filter parameters. Please adjust your filters." | Redirect to login | "Access Denied" page | N/A (returns empty array) | Error state in table: "Unable to load status history" with Retry button |
| GET /loads/:id/status-history | N/A | Redirect to login | Toast: "Permission denied" | "Load not found" with link to Loads List | Error state with retry |
| POST /status-history/export | Toast: "Export failed: date range exceeds 90 days" | Redirect to login | Toast: "Permission denied" | N/A | Toast: "Export failed. Please try again." |
| GET /status-history/stats | N/A | Redirect to login | Hide summary strip | N/A | Summary strip shows "Stats unavailable" with retry link |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Show page header immediately (static). Show filter bar immediately (interactive). Show 8 skeleton rows in the table area (gray animated rectangles matching row dimensions: timestamp bar, load# bar, status badge pair, name bar, source badge, notes bar). Show 6 skeleton mini-cards in the summary strip.
- **Progressive loading:** Summary stats load in parallel with table data. The faster one renders first. Table header row renders immediately.
- **Duration threshold:** If loading exceeds 5 seconds, show "Loading status history... This may take longer for large date ranges." centered below the table header.

### Empty States

**First-time empty (no loads, no status changes):**
- Table shows centered empty illustration (clipboard with checkmark icon).
- Headline: "No status changes yet"
- Description: "Status changes will appear here as loads progress through their lifecycle. Create and dispatch a load to get started."
- CTA: "Go to Dispatch Board" primary button.

**Filtered empty (data exists but filters exclude all):**
- Table shows: "No status changes match your current filters."
- Description: "Try adjusting the date range, status, or other filters."
- CTA: "Clear All Filters" outline button.

**Load-scoped empty (load has no status history -- should not happen):**
- "No status history found for this load. This may indicate a data issue. Please contact support."

### Error States

**Full page error (API fails completely):**
- Show error illustration + "Unable to load status history" + "Please try again. If the issue persists, contact support." + Retry button.
- Page header and filter bar remain functional.

**Partial error (stats fail but table loads):**
- Summary strip: "Statistics unavailable" with retry link. Table renders normally.

**Export error:**
- Toast: "Export failed: [reason]. Please try again." Red background, auto-dismiss 8 seconds.

### Permission Denied

- **Full page denied:** "You don't have permission to view status history." Link to Operations Dashboard.
- **Fleet view denied (dispatcher without load_view_all):** Redirected to their loads-only view. Fleet sidebar item hidden.
- **Export denied:** Export buttons hidden entirely. No indication they exist.

### Offline / Degraded

- **Full offline:** Banner: "You're offline. Showing cached data from [timestamp]." Table shows last cached data. Filters and export disabled.
- **WebSocket down, REST works:** Amber indicator. Table is accurate as of last REST fetch but new entries won't stream in. Polling fallback active.

### Edge Cases

- **Bulk status update:** When 50+ loads have their status changed simultaneously (bulk dispatch), all 50 entries appear at once. They are grouped visually with a "Bulk update: 50 loads" header row that expands to show individual entries.
- **Rapid status cycling:** If a load's status changes and reverts within 5 minutes (e.g., accidental status change + revert), both entries appear with an anomaly flag (amber triangle icon) indicating rapid cycling.
- **Clock skew:** Status change timestamps come from the server (not client). The UI displays in the user's timezone. Timezone indicator shown in column header.
- **Very long reason text:** Truncated at 80 characters in the table. Full text visible in expanded row view. Supports multiline text.
- **Load with 50+ status changes (unusual):** Rare but possible for loads with many backward transitions or complex routing. Table handles via standard pagination.

---

## 12. Filters, Search & Sort

### Filters

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Date Range | Preset toggle + custom picker | Today, Yesterday, This Week, This Month, Last 7 Days, Last 30 Days, Custom | Today | `?dateFrom=&dateTo=` |
| 2 | Load Number | Search input with typeahead | Text input, searches by load number (partial match) | Empty (all loads) | `?loadNumber=LOAD-0847` |
| 3 | Old Status | Multi-select dropdown | All 12 load statuses | All | `?oldStatus=IN_TRANSIT,DELIVERED` |
| 4 | New Status | Multi-select dropdown | All 12 load statuses | All | `?newStatus=IN_TRANSIT,DELIVERED` |
| 5 | Changed By | Searchable select | All users who have made status changes + "System" | All | `?changedBy=userId` |
| 6 | Source | Multi-select chips | Manual, Geofence, API, WebSocket, Scheduled | All | `?source=manual,geofence` |
| 7 | Direction | Toggle group | All, Forward Only, Backward Only | All | `?direction=backward` |

### Search Behavior

- **Search field:** The load number filter acts as a search input with debounced typeahead (300ms, minimum 3 characters).
- **Searches across:** Load number only. For broader search, users should use the global command palette (`Ctrl/Cmd + K`).
- **URL param:** `?loadNumber=LOAD-20260206`

### Sort Options

| Column | Default Direction | Sort Type |
|---|---|---|
| Timestamp | Descending (newest first) -- **DEFAULT** | Date |
| Load Number | Ascending (A-Z) | Alphanumeric |
| New Status | Custom order (follows state machine order) | Enum ordinal |

### Saved Filters / Presets

- **System presets:** "Today's Changes" (default), "Backward Transitions Only" (direction=backward), "Automated Changes" (source=geofence,api,websocket,scheduled), "My Changes" (changedBy=currentUser).
- **User-created presets:** Users can save current filter combination. Saved per-user, synced to server.
- **URL sync:** All filter state reflected in URL query params. Bookmarkable and shareable.

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Sidebar collapses to icon-only mode (56px).
- Filter bar: Collapses into a "Filters" button that opens a slide-over panel from the right.
- Table: Columns adapt -- "Reason/Notes" column hidden (accessible via row expand). "Direction" column becomes an icon-only badge. Source column becomes icon-only.
- Summary strip: Wraps to 2 rows (3 cards per row).
- Status progression bar (load-scoped): Full width, slightly more compact with shorter connecting lines.
- Export buttons: Collapse into a single "Export" dropdown with CSV and PDF options.

### Mobile (< 768px)

- Sidebar hidden (hamburger menu).
- Filter bar: Simplified to 2 visible filters (Date Range, Load Number). "More Filters" button opens full-screen filter modal.
- Table: Switches to card layout -- each status change rendered as a vertical card:
  - Top: Timestamp and direction badge
  - Middle: Load number (link), old status → new status
  - Bottom: Changed by, source badge, truncated notes
  - Tap card to expand full notes
- Summary strip: Horizontal scrollable row of compact stat badges.
- Status progression bar (load-scoped): Simplified to show current status and previous/next only (not full machine).
- Export: Single "Export" button in page header, opens bottom sheet with format options.
- Pull-to-refresh: Reloads table data.

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full table with all columns. Summary strip in single row. Full filter bar. |
| Desktop | 1024px - 1439px | Same layout, narrower columns. Notes column truncated earlier. |
| Tablet | 768px - 1023px | Collapsed filters. Reduced columns. See tablet notes. |
| Mobile | < 768px | Card layout instead of table. Simplified filters. See mobile notes. |

---

## 14. Stitch Prompt

```
Design a status updates/change log screen for a modern freight/logistics TMS (Transportation Management System) called "Ultra TMS." This screen shows a comprehensive audit trail of all load status changes.

Layout: Full-width page with a dark slate-900 sidebar on the left (240px). White content area on the right. Top of content area has a page header with title "Status Updates" and subtitle "Load status change log and audit trail" on the left, and two buttons on the right: "Export CSV" (outline, Download icon) and "Export PDF" (outline, FileText icon).

Filter Bar: Below the header, a full-width filter bar in a gray-50 background with rounded-lg border. Contains: a date range selector showing "Today" (toggle group: Today | Yesterday | This Week | Custom), a search input labeled "Load #" with magnifying glass, a "Status" multi-select dropdown showing "All", a "Changed By" searchable dropdown showing "All Users", a "Source" multi-select with chips (Manual, Geofence, API, WebSocket), and a "Direction" toggle group (All | Forward | Backward). "Apply" blue button and "Clear" text link on the right.

Summary Strip: Below the filter bar, a row of 6 mini stat cards in gray-50 backgrounds with subtle borders:
- "Total Changes: 342" in bold
- "Forward: 298" with a small green ArrowUp icon
- "Backward: 12" with a small red ArrowDown icon and red text
- "Automated: 189" with a blue robot icon
- "Manual: 153" with a gray user icon
- "Avg/Load: 6.2" with a gray activity icon

Data Table: Below the summary, a clean DataTable with the following columns and 8 sample rows:

Row 1: "Jan 15, 8:22:14 AM" | "LOAD-20260206-0847" (blue monospace link) | [DISPATCHED slate badge] → [AT_PICKUP amber badge] | "System" with robot icon | Green "Geofence" badge | Green "Forward" badge with up arrow | "Auto: entered pickup radius at Acme Warehouse"

Row 2: "Jan 15, 8:20:01 AM" | "LOAD-20260206-0852" (blue link) | [PENDING gray badge] → [TENDERED purple badge] | "Maria R." with small avatar circle | Gray "Manual" badge | Green "Forward" badge | "Tendered to Swift Transport, rate $2,450"

Row 3: "Jan 15, 8:15:33 AM" | "LOAD-20260206-0847" (blue link) | [ACCEPTED blue badge] → [DISPATCHED indigo badge] | "Maria R." with avatar | Gray "Manual" badge | Green "Forward" badge | "Rate confirmation signed, dispatching"

Row 4: "Jan 15, 8:10:45 AM" | "LOAD-20260206-0839" (blue link) | [IN_TRANSIT sky badge] → [AT_DELIVERY teal badge] | "System" robot icon | Green "Geofence" badge | Green "Forward" badge | "Auto: entered delivery radius at Beta Corp"

Row 5 (highlighted with red-50 background and 3px red left border): "Jan 15, 8:05:22 AM" | "LOAD-20260206-0841" (blue link) | [DELIVERED lime badge] → [IN_TRANSIT sky badge] | "Sarah C." with avatar and small "Mgr" tag | Gray "Manual" badge | Red "Backward" badge with down arrow | "Incorrect delivery confirmation. Driver still en route. Reverting."

Row 6: "Jan 15, 7:55:11 AM" | "LOAD-20260206-0861" (blue link) | [-- gray] → [PLANNING slate badge] | "Maria R." avatar | Gray "Manual" badge | Blue "Initial" badge with plus icon | "Load created from Order ORD-20260206-1234"

Row 7: "Jan 15, 7:50:08 AM" | "LOAD-20260206-0838" (blue link) | [PICKED_UP cyan badge] → [IN_TRANSIT sky badge] | "System" robot | Purple "WebSocket" badge | Green "Forward" badge | "Auto: carrier ELD reported departure"

Row 8: "Jan 15, 7:45:30 AM" | "LOAD-20260206-0847" (blue link) | [TENDERED purple badge] → [ACCEPTED blue badge] | "System" robot | Blue "API" badge | Green "Forward" badge | "Carrier accepted via portal"

Below the table: "Showing 1-25 of 342" text on the left. Pagination controls on the right: [< Previous] [1] [2] [3] ... [14] [Next >]. Per-page selector: [25 v].

Design Specifications:
- Font: Inter or system sans-serif, 14px base, 13px for table cells
- Content background: white (#FFFFFF), filter bar: gray-50 with border
- Primary color: blue-600 for links and primary actions
- Table: Clean rows with subtle bottom borders (gray-100). Row hover: gray-50 background.
- Status badges: Use the TMS color system. Old status badges at 60% opacity, new status badges at full opacity. Arrow icon (→) between them in gray-400.
- Backward transition rows: red-50 background (#FEF2F2) with 3px red-500 left border
- Source badges: Small pill badges with icon + text. Manual=gray-100, Geofence=green-100, API=blue-100, WebSocket=purple-100
- Direction badges: Forward=green-100 with ArrowUp, Backward=red-100 with ArrowDown, Initial=blue-100 with Plus
- Summary strip cards: gray-50 background, subtle border, compact (120px wide, 60px tall)
- Modern SaaS aesthetic similar to Linear.app or Datadog event log
- Emphasize scanability -- the eye should be able to quickly identify backward transitions (red rows) and automated changes (system badge) at a glance
```

---

## 15. Enhancement Opportunities

### Current State (Wave 2)

**What's built and working:**
- [ ] Nothing yet -- screen is Not Started.

**What needs to be built for MVP:**
- [ ] Fleet-scoped DataTable with all status changes across loads
- [ ] Load-scoped view with chronological history and progression visualization
- [ ] Filter by date, load number, status, user, source, direction
- [ ] Sort by timestamp, load number
- [ ] Pagination (25 per page default)
- [ ] StatusBadge transition display (old -> new)
- [ ] Source and direction badge classification
- [ ] Backward transition row highlighting (red-50 background)
- [ ] Summary strip with aggregate counts
- [ ] Export to CSV and PDF
- [ ] Row expand for full notes/reason text
- [ ] WebSocket live updates (new rows prepend)
- [ ] Loading skeletons
- [ ] Empty states

**What to add this wave (post-MVP polish):**
- [ ] Status progression bar visualization (load-scoped view)
- [ ] Anomaly detection highlighting (rapid status cycling)
- [ ] Saved filter presets (user-created)
- [ ] Auto-generated entry linking (geofence -> GPS coordinates, check call -> check call record)
- [ ] Inline load number typeahead search

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Fleet-scoped DataTable with filters | High | High | P0 |
| Load-scoped chronological view | High | Medium | P0 |
| StatusBadge transition display | High | Low | P0 |
| Source and direction badges | Medium | Low | P0 |
| Backward transition highlighting | High | Low | P0 |
| Summary strip | Medium | Medium | P0 |
| Export CSV/PDF | High | Medium | P0 |
| WebSocket live updates | Medium | Medium | P1 |
| Status progression bar (load-scoped) | Medium | Medium | P1 |
| Saved filter presets | Medium | Low | P1 |
| Anomaly detection highlighting | Medium | Medium | P1 |
| Batch view (multi-load comparison) | Medium | High | P2 |
| Status flow Sankey diagram | Low | High | P2 |
| Compliance flags | Medium | Medium | P2 |
| Email digest | Low | Medium | P2 |

### Future Wave Preview

- **Wave 3:** Add compliance flags for hazmat and temperature-controlled loads. Add anomaly detection with automated alerting for unusual status patterns. Add batch view for comparing status histories across multiple loads side by side.
- **Wave 4:** AI-powered status pattern analysis ("Loads from Carrier X consistently spend 30% longer in AT_PICKUP status than average -- investigate possible detention issue."). Status flow Sankey diagram for fleet-wide transition visualization. Integration with customer portal to show customer-facing status history (filtered, no internal details).

---

<!--
DESIGN NOTES:
- This screen serves two distinct audiences with two views: dispatchers need the load-scoped view for quick status verification during customer calls; ops managers need the fleet-scoped view for compliance reviews and pattern detection.
- The backward transition highlighting is the most important visual feature. In a healthy operation, 95%+ of transitions are forward. Any backward transition is an anomaly that warrants investigation. The red-50 background and red left border make these rows instantly scannable even in a list of hundreds.
- Immutability is a core design principle. Status change records are append-only. The UI does not provide any edit or delete functionality for past records.
- The source classification (Manual/Geofence/API/WebSocket/Scheduled) provides operational intelligence: a high ratio of automated changes indicates good system integration, while a high ratio of manual changes suggests dispatchers are doing work that should be automated.
-->
