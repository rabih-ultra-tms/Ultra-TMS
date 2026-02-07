# Security Log (Audit Logs)

> Service: Auth & Admin | Wave: 1 (Enhancement Focus) | Priority: P0
> Route: /(dashboard)/admin/audit-logs | Status: Built
> Primary Personas: Admin
> Roles with Access: Super Admin, Admin

---

## 1. Purpose & Business Context

**What this screen does:**
Displays a comprehensive, searchable, and filterable audit trail of all significant actions taken within the tenant -- logins, data changes, permission modifications, exports, and system events. Serves as the primary security monitoring and compliance tool for administrators.

**Business problem it solves:**
Freight brokerages handle sensitive financial data, customer information, and regulated transportation documents. When security incidents occur (unauthorized access, data changes, suspicious activity), admins need a complete, tamper-proof record of who did what, when, from where. This screen provides that record for investigation, compliance audits (SOC2, ISO 27001), and internal accountability.

**Key business rules:**
- Audit logs are immutable -- they cannot be edited or deleted by any user including Super Admin
- All authentication events (login, logout, failed login, MFA challenge) are logged automatically
- All CRUD operations on sensitive entities (users, roles, financial records) are logged with before/after values
- Logs include IP address, user agent, and session ID for forensic analysis
- Log retention follows tenant's configured retention policy (default: 2 years)
- Export of audit logs requires admin permission and is itself logged as an audit event
- Real-time log streaming is available for active monitoring (WebSocket)

**Success metric:**
Admin can investigate a security incident (find all actions by a specific user in a time window) within 60 seconds. Compliance auditors can generate a full audit report in under 5 minutes.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Admin sidebar navigation | Click "Audit Logs" menu item | None |
| User Detail page | Click "View Activity" or "View Full Audit Log" | ?userId= filter |
| Dashboard security alert | Click alert notification about suspicious activity | ?userId= or ?action= filter |
| Role Editor | Click changelog entry for more detail | ?roleId= filter |
| Direct URL | Bookmark / shared link with filters | Query params for all filters |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| User Detail | Click user name in log entry | userId |
| Entity Detail | Click entity link in log entry (e.g., load, order) | entityId, entityType |
| Export Download | Click "Export" button | Filtered log data as CSV/PDF |
| Compliance Report | Click "Generate Report" button | Date range, format |

**Primary trigger:**
Admin navigates to Audit Logs to investigate specific activity, monitor security events, or generate compliance reports.

**Success criteria (user completes the screen when):**
- Admin has found the specific log entries they were investigating
- Admin has confirmed or ruled out suspicious activity
- Admin has exported logs or generated a compliance report

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------+
|  Breadcrumb: Admin > Audit Logs                                    |
|  [Export CSV] [Export PDF] [Generate Report] [Live Stream: OFF/ON] |
+------------------------------------------------------------------+
|  Stats: [Events Today: 847] [Logins: 234] [Failures: 3]          |
|         [Data Changes: 456] [Security Events: 12]                 |
+------------------------------------------------------------------+
|  View: [Table ● ] [Timeline ○]                                    |
+------------------------------------------------------------------+
|  Filters: [Search...] [User ▼] [Action ▼] [Entity ▼]            |
|           [Date Range ▼] [IP Address] [Severity ▼]  [Clear All]  |
+------------------------------------------------------------------+
|  +------------------------------------------------------------+  |
|  |  Timestamp       | User        | Action    | Entity         |  |
|  |------------------|-------------|-----------|----------------|  |
|  | Feb 6, 10:32 AM  | John Doe    | Login     | Session        |  |
|  |   192.168.1.45   | Admin       | Success   | Chrome/Win     |  |
|  |------------------|-------------|-----------|----------------|  |
|  | Feb 6, 10:28 AM  | Omar Ali    | Updated   | Load           |  |
|  |   10.0.0.22      | Dispatcher  | Status    | LOAD-0206-0018 |  |
|  |                  |             | [Diff: Dispatched->Transit] |  |
|  |------------------|-------------|-----------|----------------|  |
|  | Feb 6, 10:15 AM  | Unknown     | Failed    | Login          |  |
|  |   203.45.67.89   | N/A         | Login     | 3rd attempt    |  |
|  |   [!] SUSPICIOUS                                            |  |
|  +------------------------------------------------------------+  |
|  Showing 1-25 of 847 events       < 1  2  3 >                   |
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible) | Timestamp, user name, action type, entity reference | Core information for any audit investigation |
| **Secondary** (visible in row) | IP address, user role, action detail, device/browser | Context for understanding the event |
| **Tertiary** (expandable/hover) | Before/after values (change diff), session ID, user agent, geolocation | Forensic detail for deep investigation |
| **Hidden** (behind export/report) | Full historical data, aggregated reports, compliance formats | Bulk analysis and external consumption |

---

## 4. Data Fields & Display

### Visible Fields

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Timestamp | AuditLog.createdAt | "Feb 6, 2026, 10:32:15 AM" (full precision with seconds) | Table column 1 |
| 2 | User | AuditLog.userId -> User.name | User name (clickable link), role badge below | Table column 2 |
| 3 | Action | AuditLog.action | Action badge: Login (blue), Create (green), Update (amber), Delete (red), Export (purple), View (gray) | Table column 3 |
| 4 | Entity Type | AuditLog.entityType | Entity type badge: User, Role, Load, Order, Customer, Invoice, Settings | Table column 4 |
| 5 | Entity Reference | AuditLog.entityId | Clickable link to entity (e.g., "LOAD-20260206-0018") | Table column 4 (subtext) |
| 6 | IP Address | AuditLog.ipAddress | IP address in monospace font | Table column 5 |
| 7 | Status | AuditLog.status | Success (green dot), Failure (red dot), Warning (amber dot) | Table column 6 |
| 8 | Severity | AuditLog.severity | Info (gray), Warning (amber), Critical (red) | Row left-border color |
| 9 | Change Detail | AuditLog.changes | Brief summary: "Status: Dispatched -> In Transit" | Expandable row detail |
| 10 | Device/Browser | AuditLog.userAgent (parsed) | "Chrome 120 / Windows 11" or "Safari / iPhone 15" | Expandable row detail |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Suspicious Flag | Multiple failed logins from same IP, unusual login hours, IP geolocation mismatch | Red "Suspicious" badge with exclamation icon |
| 2 | Events Today (stat) | COUNT(logs) WHERE date = today | Integer in stat card |
| 3 | Failed Logins Today | COUNT(logs) WHERE action = 'login' AND status = 'failure' AND date = today | Integer in stat card, red if > 5 |
| 4 | Time Since Event | now() - log.createdAt | "2 min ago", "1 hr ago" (relative time alongside absolute) |
| 5 | Geolocation | GeoIP lookup of AuditLog.ipAddress | "Chicago, IL, US" in expandable detail |

---

## 5. Features

### Core Features (Built -- Currently Live)

- [x] Audit log table with timestamp, user, action, entity columns
- [x] Filter by user (dropdown)
- [x] Filter by action type (dropdown)
- [x] Filter by date range
- [x] Pagination with page size selector
- [x] Sort by timestamp (ascending/descending)
- [x] Click-through to entity detail from log entry

### Enhancement Features (Wave 1 Additions)

- [ ] **Visual timeline view** -- Alternative to table: vertical chronological timeline with color-coded event nodes, user avatars, action descriptions, and expandable details; toggle between table and timeline views
- [ ] **Suspicious activity alerts** -- Automatic flagging of: 3+ failed logins from same IP, login from new geographic location, login outside business hours, rapid succession of sensitive data exports; red "Suspicious" badge on flagged entries; optional email alert to admin
- [ ] **IP geolocation** -- Show city/state/country for each IP address; world map visualization showing login locations as clustered pins with frequency heat overlay; click pin to filter log by that location
- [ ] **Session detail link** -- Each login event links to a full session detail: all pages visited, all actions taken during that session, session duration, logout event or timeout
- [ ] **Export logs** -- Export current filtered view to CSV or PDF; include all visible columns plus expanded detail fields; export action logged in audit trail
- [ ] **Compliance report generation** -- Pre-formatted reports in SOC2 and ISO 27001 formats; date range selector; includes user access summary, data change summary, security event summary, policy compliance check results
- [ ] **Log retention period indicator** -- Visual indicator showing how far back logs go and when the oldest entries will be purged; countdown for entries approaching retention expiry
- [ ] **Advanced filters** -- Filter by: IP address (exact or subnet), entity type (User, Role, Load, Order, etc.), severity level (Info, Warning, Critical), specific field changed, user role at time of action
- [ ] **Real-time log stream** -- Toggle to enable live streaming of new log entries via WebSocket; new entries animate in at the top of the table with highlight; auto-scroll or manual pause
- [ ] **Change diff viewer** -- For Update/Edit actions, expandable detail showing side-by-side or inline diff of before/after values with green (added) and red (removed) highlighting

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| View audit logs | admin, super_admin | audit_view | Redirect to dashboard |
| Export logs | admin, super_admin | audit_export | Export buttons hidden |
| Generate compliance report | admin, super_admin | audit_export + compliance_view | Report button hidden |
| View IP addresses | super_admin | security_view | IP column shows "***" masked |
| View geolocation map | super_admin | security_view | Map view not available |
| Live stream mode | admin, super_admin | audit_view | Stream toggle hidden |

---

## 6. Status & State Machine

### Log Event Severities

```
[Info] -- Normal operations (login, view, routine updates)
[Warning] -- Unusual but not critical (failed login, permission denied, unusual hours)
[Critical] -- Security concern (multiple failed logins, admin action, data deletion, role change)
```

### Event Status Types

| Status | Visual | Examples |
|---|---|---|
| Success | Green dot | Successful login, data update saved, export completed |
| Failure | Red dot | Failed login, permission denied, validation error |
| Warning | Amber dot | Deprecated API used, approaching rate limit, unusual pattern |

### Action Type Colors

| Action Type | Badge Color | Background | Text | Tailwind |
|---|---|---|---|---|
| Login/Auth | blue-100 | blue-100 | blue-800 | `bg-blue-100 text-blue-800` |
| Create | green-100 | green-100 | green-800 | `bg-green-100 text-green-800` |
| Update | amber-100 | amber-100 | amber-800 | `bg-amber-100 text-amber-800` |
| Delete | red-100 | red-100 | red-800 | `bg-red-100 text-red-800` |
| Export | purple-100 | purple-100 | purple-800 | `bg-purple-100 text-purple-800` |
| View | gray-100 | gray-100 | gray-600 | `bg-gray-100 text-gray-600` |
| Permission Change | orange-100 | orange-100 | orange-800 | `bg-orange-100 text-orange-800` |
| System | slate-100 | slate-100 | slate-800 | `bg-slate-100 text-slate-800` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Top-Right of Page)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| Export CSV | Download | Secondary / Outline | Downloads current filtered view as CSV | No |
| Export PDF | FileText | Secondary / Outline | Downloads current filtered view as formatted PDF | No |
| Generate Report | ClipboardList | Secondary / Outline | Opens report configuration dialog (date range, format, sections) | No |
| Live Stream | Radio | Toggle / Blue when active | Enables/disables real-time log streaming via WebSocket | No |

### Row Interactions

| Interaction | Action |
|---|---|
| Click row (expand) | Expands row to show full detail: change diff, device info, session ID, geolocation |
| Click user name | Navigate to User Detail page |
| Click entity reference | Navigate to entity detail page (load, order, customer, etc.) |
| Click IP address | Copy to clipboard; option to filter by this IP |
| Hover suspicious badge | Tooltip explaining why the entry was flagged |

### View Toggle

| View | Description | Best For |
|---|---|---|
| Table (default) | Standard data table with sortable columns and pagination | Investigation, filtering, bulk analysis |
| Timeline | Vertical chronological feed with event cards, avatars, and connecting lines | Monitoring, pattern recognition, presentation |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + F | Focus filter search |
| Ctrl/Cmd + E | Export CSV |
| Ctrl/Cmd + L | Toggle live stream |
| Escape | Collapse expanded row / close dialog |
| Arrow Up/Down | Navigate log entries |
| Enter | Expand/collapse selected entry |
| V | Switch between Table and Timeline views |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| N/A | -- | No drag-and-drop on this screen |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| audit.log.created | { logEntry: full log object } | If live stream is ON: prepend new entry at top of table with blue highlight animation; increment stat counters |
| audit.alert.suspicious | { logEntry, reason } | Show toast notification: "Suspicious activity detected: [reason]"; add red-flagged entry to table |

### Live Update Behavior

- **Update frequency:** When live stream toggle is ON, every new audit event pushes immediately via WebSocket
- **Visual indicator:** Blue pulsing "LIVE" badge next to "Live Stream" toggle; new entries slide in from top with blue flash
- **Buffer:** If entries arrive faster than 1 per second, batch and insert every second to prevent UI jitter
- **Pause/resume:** Clicking any entry or scrolling down pauses auto-scroll; "Resume live stream" button appears at top

### Polling Fallback

- **When:** WebSocket connection drops or live stream is OFF
- **Interval:** Every 60 seconds for stat card refresh
- **Endpoint:** GET /api/v1/audit-logs/stats
- **Visual indicator:** "Live stream disconnected -- reconnecting..." banner

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| N/A | Audit logs are read-only; no user mutations to optimize | N/A |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| audit-log-table | src/components/admin/audit-log-table.tsx | logs, columns, pagination, sorting |
| audit-log-filters | src/components/admin/audit-log-filters.tsx | users[], actionTypes[], entityTypes[], dateRange, onFilterChange |
| DataTable | src/components/ui/data-table.tsx | columns, data, pagination, sorting, expandableRows |
| PageHeader | src/components/layout/page-header.tsx | title, breadcrumbs, actions |
| FilterBar | src/components/ui/filter-bar.tsx | filters: FilterConfig[] |
| Badge | shadcn badge | variant, children |
| StatusBadge | src/components/ui/status-badge.tsx | status, size |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| audit-log-table | Basic columns: timestamp, user, action, entity | Add expandable rows with change diff, IP column, severity indicator (left border color), device info, suspicious flag badge |
| audit-log-filters | User dropdown and action type dropdown | Add IP address input, entity type multi-select, severity filter, date range with presets, advanced filter panel |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| AuditTimelineView | Vertical timeline alternative to table; event cards with avatar, timestamp, action description, entity link, expandable detail; color-coded by action type | High -- complex layout with multiple entry types |
| ChangeDiffViewer | Side-by-side or inline diff display for before/after values on Update events; green highlighting for additions, red for removals; supports nested object diffs | High -- diff algorithm + rendering |
| SuspiciousActivityBadge | Red warning badge with exclamation icon; hover tooltip explaining the suspicious pattern detected; click to see related events | Small -- badge with tooltip |
| IPGeolocationDisplay | Shows IP address with city/state/country text; small flag icon; link to map view filtered by this IP | Small -- text display with icon |
| LoginLocationMap | World map (or US map) showing login locations as pins/dots with frequency clustering; clickable pins filter the log table; heat overlay option | High -- map integration |
| ComplianceReportDialog | Dialog for configuring compliance report: date range picker, format selector (SOC2, ISO 27001, Custom), section checkboxes (access events, data changes, security events), generate button | Medium -- form dialog |
| LogRetentionIndicator | Progress bar or timeline showing log coverage period, oldest entry date, retention policy end date, approaching-expiry warning | Small -- indicator |
| LiveStreamToggle | Toggle button with "LIVE" pulsing indicator when active, event counter, pause/resume controls | Small -- toggle with animation |
| SessionDetailDrawer | Side drawer showing complete session: all events in that session, duration, pages visited, actions taken, login/logout timestamps | Medium -- timeline in drawer |
| AuditStatCards | Row of stat cards specific to audit: events today, logins, failures, data changes, security events; clickable to filter table | Small -- stat card row |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Collapsible | collapsible | Expandable row detail in table |
| Dialog | dialog | Compliance report configuration |
| Popover | popover | IP address detail popover |
| Tooltip | tooltip | Suspicious badge explanation, field detail |
| Toggle | toggle | Table/Timeline view switch |
| Date Range Picker | calendar + popover | Date range filter |
| Sheet | sheet | Session detail side drawer |
| Badge | badge | Action type badges, severity badges |
| Separator | separator | Between log detail sections |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/v1/audit-logs | Fetch paginated audit logs with filters | useAuditLogs(filters) |
| 2 | GET | /api/v1/audit-logs/:id | Fetch single log entry with full detail | useAuditLogEntry(id) |
| 3 | GET | /api/v1/audit-logs/:id/diff | Fetch change diff for update events | useAuditLogDiff(id) |
| 4 | GET | /api/v1/audit-logs/stats | Fetch aggregate statistics (today's counts) | useAuditLogStats() |
| 5 | GET | /api/v1/audit-logs/suspicious | Fetch flagged suspicious activity entries | useSuspiciousActivity() |
| 6 | POST | /api/v1/audit-logs/export | Export filtered logs to CSV/PDF | useExportAuditLogs() |
| 7 | POST | /api/v1/audit-logs/compliance-report | Generate compliance report | useGenerateComplianceReport() |
| 8 | GET | /api/v1/audit-logs/sessions/:sessionId | Fetch all events in a specific session | useSessionDetail(sessionId) |
| 9 | GET | /api/v1/audit-logs/geolocations | Fetch geolocation data for login events | useLoginGeolocations() |
| 10 | GET | /api/v1/audit-logs/retention | Fetch retention policy info and oldest entry date | useLogRetention() |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| audit:{tenantId} | audit.log.created | useLiveAuditStream() -- prepends entry when stream is active |
| audit:{tenantId} | audit.alert.suspicious | useSuspiciousAlerts() -- shows toast notification |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 500 |
|---|---|---|---|---|---|
| GET /api/v1/audit-logs | Show filter error toast | Redirect to login | "Access Denied" page | N/A | Error state with retry |
| POST /api/v1/audit-logs/export | "Invalid export parameters" toast | Redirect to login | "Permission Denied" toast | N/A | "Export failed" toast with retry |
| POST /api/v1/audit-logs/compliance-report | "Invalid report configuration" toast | Redirect to login | "Permission Denied" toast | N/A | "Report generation failed" toast with retry |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Stat cards show skeleton numbers. Table shows 10 skeleton rows with text bars matching column widths. Timeline view shows 6 skeleton event cards.
- **Progressive loading:** Header, view toggle, and filters render immediately; skeleton for data area and stats.
- **Duration threshold:** If loading exceeds 5s, show "Loading audit logs..." message.

### Empty States

**No logs at all (new tenant with no activity):**
- **Headline:** "No activity recorded yet"
- **Description:** "Audit logs will appear here as users start using the system."
- **Note:** This state should be very rare since the admin's login that brought them here would be logged.

**Filtered empty (logs exist but filters exclude all):**
- **Headline:** "No events match your filters"
- **Description:** "Try adjusting your date range, user selection, or action type filter."
- **CTA:** "Clear All Filters" button

**Live stream with no new events:**
- **Indicator:** "Live stream active -- waiting for new events..." with subtle pulsing dot

### Error States

**Full page error:**
- Error icon + "Unable to load audit logs" + Retry button

**Export error:**
- Toast: "Export failed. The log set may be too large. Try narrowing your date range."

**Live stream connection error:**
- Banner: "Live stream disconnected. Attempting to reconnect..." with spinning indicator

### Permission Denied

- **Full page denied:** "You don't have permission to view audit logs" with dashboard link
- **Partial denied:** IP addresses masked as "***.***.***" for non-Super Admin; geolocation features hidden

### Offline / Degraded

- **Full offline:** "You're offline. Audit logs require an active connection." No cached data shown (logs are too sensitive and large to cache).
- **Degraded:** Table loads but live stream unavailable; banner indicates "Real-time updates unavailable"

---

## 12. Filters, Search & Sort

### Filters

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Search | Text input | Searches across user name, entity reference, action description, IP address | None | ?search= |
| 2 | User | Searchable multi-select | All tenant users (from /api/v1/users) | All | ?userId= |
| 3 | Action Type | Multi-select dropdown | Login, Logout, Create, Update, Delete, Export, View, Permission Change, System | All | ?action= |
| 4 | Entity Type | Multi-select dropdown | User, Role, Load, Order, Customer, Contact, Invoice, Settings, Session | All | ?entityType= |
| 5 | Date Range | Date range picker | Presets: Last Hour, Today, Yesterday, Last 7 Days, Last 30 Days, Custom | Today | ?from=&to= |
| 6 | IP Address | Text input | Exact IP or CIDR subnet (e.g., 192.168.1.0/24) | None | ?ip= |
| 7 | Severity | Multi-select | Info, Warning, Critical | All | ?severity= |
| 8 | Status | Multi-select | Success, Failure, Warning | All | ?status= |

### Search Behavior

- **Search field:** Single search input at left of filter bar
- **Searches across:** User name, entity reference (load number, order number), action description, IP address
- **Behavior:** Debounced 300ms, minimum 2 characters
- **URL param:** ?search=

### Sort Options

| Column / Field | Default Direction | Sort Type |
|---|---|---|
| Timestamp | Descending (newest first) | Date |
| User | Ascending (A-Z) | Alphabetical |
| Action | Ascending (A-Z) | Alphabetical |
| Severity | Descending (Critical first) | Custom enum order |

**Default sort:** Timestamp descending (newest events first)

### Saved Filters / Presets

- **System presets:** "All Events Today", "Failed Logins", "Data Deletions", "Permission Changes", "Suspicious Activity", "Security Events (Critical)"
- **User-created presets:** Admins can save current filter combination with custom name
- **URL sync:** All filter state reflected in URL query params for bookmarking and sharing

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Stat cards: horizontal scroll or 3+2 arrangement
- Table hides "IP Address" column (available in expanded row detail)
- Filter bar collapses to "Filters" button with slide-over panel
- Export buttons move to overflow dropdown
- Timeline view: cards slightly narrower but same vertical layout

### Mobile (< 768px)

- Stat cards: horizontal scroll (single row)
- Table switches to card-based list: each event is a card with timestamp, user avatar + name, action badge, entity reference
- Tap card to expand full detail (diff, IP, device, session)
- Filters: full-screen modal with all filter options stacked vertically
- Export and report buttons in page header overflow menu
- Timeline view works well on mobile with full-width cards
- Live stream toggle in header area

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full layout as designed |
| Desktop | 1024px - 1439px | Table slightly compressed |
| Tablet | 768px - 1023px | See tablet notes |
| Mobile | < 768px | See mobile notes |

---

## 14. Stitch Prompt

```
Design a Security / Audit Log screen for a modern SaaS TMS (Transportation Management System) called "Ultra TMS."

Layout: Full-width page with a dark slate-900 sidebar (240px) on the left, white content area on the right. Top has a breadcrumb "Admin > Audit Logs", the title "Audit Logs", and action buttons on the right: "Export CSV" (outline with download icon), "Export PDF" (outline with file icon), "Generate Report" (outline with clipboard icon), and a "Live Stream" toggle button (currently OFF, gray; when ON it would be blue with a pulsing dot).

Stats Bar: Below header, show 5 compact stat cards: "Events Today: 847" (with activity icon), "Logins: 234" (with login icon, blue text), "Failures: 3" (with warning icon, red text), "Data Changes: 456" (with edit icon, amber text), "Security Events: 12" (with shield icon, purple text). White cards with rounded-lg borders.

View Toggle: Below stats, a segmented control toggle: "Table" (active, filled) and "Timeline" (inactive, outline).

Filter Bar: Below view toggle, show filters: a search input ("Search events..."), a "User" searchable dropdown, an "Action" multi-select (Login, Create, Update, Delete, Export, View), an "Entity" multi-select, a "Date Range" picker showing "Today", an "IP Address" text input, a "Severity" dropdown (All, Info, Warning, Critical), and a "Clear All" text button.

Data Table: Show an audit log table with expandable rows. Columns: Timestamp, User, Action, Entity, IP Address, Status. Some rows have a colored left border (4px) indicating severity: gray for info, amber for warning, red for critical.

Show 8 rows with realistic data:

Row 1 (info, gray border):
- "Feb 6, 2026, 10:32:15 AM" | "John Doe" (with small blue "Admin" badge below) | "Login" (blue badge) | "Session" with "Chrome / Windows" subtext | "192.168.1.45" monospace | Green dot "Success"

Row 2 (info, gray border):
- "Feb 6, 2026, 10:28:43 AM" | "Omar Ali" (with green "Dispatcher" badge) | "Update" (amber badge) | "Load LOAD-20260206-0018" (clickable blue link) with subtext "Status: Dispatched -> In Transit" | "10.0.0.22" | Green dot "Success"

Row 3 (critical, red border, expanded):
- "Feb 6, 2026, 10:15:22 AM" | "Unknown" (with gray "N/A" badge) | "Login" (blue badge) with red "Failed" subtext | "Session" with "3rd failed attempt" subtext | "203.45.67.89" monospace | Red dot "Failure"
- Expanded detail showing: a red "Suspicious Activity" badge, "Reason: Multiple failed login attempts from unknown IP", "Location: Bucharest, Romania" with a small flag icon, "User Agent: Mozilla/5.0..."
- The expanded section has a light red-50 background

Row 4 (info, gray border):
- "Feb 6, 2026, 10:12:08 AM" | "Sarah Mitchell" (with teal "Sales" badge) | "Create" (green badge) | "Customer ACC-2026-0089" (clickable link) | "192.168.1.52" | Green dot "Success"

Row 5 (warning, amber border):
- "Feb 6, 2026, 10:05:30 AM" | "Fatima Khan" (with purple "Accounting" badge) | "Export" (purple badge) | "Invoice Report (245 records)" | "192.168.1.48" | Green dot "Success" with amber "Large Export" warning badge

Row 6 (info, gray border):
- "Feb 6, 2026, 09:58:12 AM" | "John Doe" (Admin) | "Update" (amber badge) | "Role: Dispatcher" with subtext "Added: Check Calls Edit" | "192.168.1.45" | Green dot "Success"

Row 7 (info, gray border):
- "Feb 6, 2026, 09:45:00 AM" | "System" (gray "System" badge) | "System" (slate badge) | "Scheduled Backup Completed" | "internal" | Green dot "Success"

Row 8 (info, gray border):
- "Feb 6, 2026, 09:30:22 AM" | "Omar Ali" (Dispatcher) | "Create" (green badge) | "Load LOAD-20260206-0017" (clickable link) | "10.0.0.22" | Green dot "Success"

Bottom: "Showing 1-25 of 847 events" with pagination and "25 per page" dropdown.

Design Specifications:
- Font: Inter or system sans-serif, 14px base
- IP addresses: monospace font (font-mono), gray-600 text
- Timestamps: 13px, gray-500, include seconds for precision
- Left border severity: 4px solid -- gray-200 for info, amber-400 for warning, red-400 for critical
- Action badges: small rounded-full pills with color per action type
- Expanded row: slightly indented with light background (red-50 for suspicious, gray-50 for normal)
- Suspicious badge: red-100 background, red-800 text, exclamation-triangle icon
- Status dots: 8px circles -- green-500 for success, red-500 for failure, amber-500 for warning
- View toggle: segmented control with rounded-lg, gray-100 background, white active segment
- Stats cards: white, rounded-lg, border, subtle shadow-sm
- Table rows: white background, hover gray-50, expandable on click with smooth animation
- Modern SaaS aesthetic similar to Datadog audit logs or Cloudflare security events dashboard
```

---

## 15. Enhancement Opportunities

### Current State (Wave 1 -- Enhancement Focus)

**What's built and working:**
- [x] Audit log table with timestamp, user, action, entity columns
- [x] Filter by user (dropdown)
- [x] Filter by action type (dropdown)
- [x] Filter by date range
- [x] Pagination with page size selector
- [x] Sort by timestamp
- [x] Clickable entity references linking to detail pages

**What needs polish / bug fixes:**
- [ ] Date range filter resets when navigating back from entity detail
- [ ] Large date ranges (90+ days) cause slow loading without progress indicator
- [ ] No expandable row detail for viewing change diffs
- [ ] IP addresses are shown but not formatted in monospace or linked to geolocation
- [ ] No visual severity indicators (all rows look the same regardless of criticality)

**What to add this wave:**
- [ ] Visual timeline view: alternative chronological feed with color-coded event cards, user avatars, and connecting lines; toggle between table and timeline
- [ ] Suspicious activity alerts: automatic flagging of multiple failed logins, unusual geographic locations, off-hours activity, rapid exports; red badge with tooltip explanation
- [ ] IP geolocation: city/state/country display per IP; world map showing login location pins with frequency clustering and heat overlay
- [ ] Session detail link: click login event to see full session (all pages visited, all actions, duration, logout/timeout)
- [ ] Export logs: CSV and PDF export of current filtered view with all detail fields; export event itself logged
- [ ] Compliance report generation: pre-formatted SOC2 and ISO 27001 reports with configurable date range and sections
- [ ] Log retention period indicator: visual showing coverage period, oldest entry, approaching-expiry warning
- [ ] Advanced filters: IP address/subnet, entity type, severity level, specific field changed, user role at time of action
- [ ] Real-time log stream: WebSocket-powered live feed of new entries with animation; pause/resume controls; event counter
- [ ] Change diff viewer: for Update events, expandable before/after comparison with green/red diff highlighting

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Expandable rows with change diff | High | Medium | P0 |
| Severity indicators (left border color) | High | Low | P0 |
| Advanced filters (IP, entity type, severity) | High | Low | P0 |
| Export to CSV/PDF | High | Medium | P0 |
| Suspicious activity auto-flagging | High | Medium | P1 |
| Real-time log stream (WebSocket) | Medium | Medium | P1 |
| Visual timeline view | Medium | High | P1 |
| Compliance report generation | High | High | P1 |
| IP geolocation display | Medium | Medium | P1 |
| Session detail link | Medium | Medium | P2 |
| Login location map | Medium | High | P2 |
| Log retention indicator | Low | Low | P2 |

### Future Wave Preview

- **Wave 2:** AI-powered anomaly detection (baseline normal behavior, flag deviations), automated incident response (auto-suspend user after X failed logins), audit log comparison across time periods ("compare this week vs last week")
- **Wave 3:** SIEM integration (forward logs to Splunk, Datadog, or ELK), automated compliance monitoring with continuous checks, cross-tenant audit view for Super Admin with aggregated security dashboard

---
