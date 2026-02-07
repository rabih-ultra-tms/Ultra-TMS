# [Screen Name]

> Service: [Service Name] | Wave: [1/2/3] | Priority: [P0/P1/P2]
> Route: /path/to/page | Status: Built / In Progress / Not Started
> Primary Personas: [names]
> Roles with Access: [roles]

---

## 1. Purpose & Business Context

<!-- Why does this screen exist? What business problem does it solve? -->

**What this screen does:**
[Describe the primary function of this screen in 1-2 sentences. E.g., "Allows dispatchers to view all active loads, filter by status, and quickly assign carriers."]

**Business problem it solves:**
[Explain the pain point or workflow need. E.g., "Without this screen, dispatchers would need to call each carrier individually to check availability, wasting 2-3 hours per day."]

**Key business rules:**
- [Rule 1 — e.g., "Only loads in 'Ready to Dispatch' status can be assigned to carriers."]
- [Rule 2 — e.g., "Loads older than 48 hours without a carrier are flagged as at-risk."]
- [Rule 3 — e.g., "Revenue amounts are only visible to users with the 'finance_view' permission."]

**Success metric:**
[How do we know this screen is working well? E.g., "Average time to dispatch a load drops from 15 minutes to under 3 minutes."]

---

## 2. User Journey Context

<!-- Where does this screen fit in the overall workflow? -->

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| [Screen Name] | [Click action / navigation] | [Query params, IDs, filters] |
| [Screen Name] | [Click action / navigation] | [Query params, IDs, filters] |
| Direct URL | Bookmark / shared link | [Route params] |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| [Screen Name] | [Click action / button] | [IDs, context] |
| [Screen Name] | [Click action / button] | [IDs, context] |

**Primary trigger:**
[What event or user action typically brings someone to this screen? E.g., "Dispatcher clicks 'View Loads' from the sidebar navigation at the start of their shift."]

**Success criteria (user completes the screen when):**
- [Criteria 1 — e.g., "User has reviewed all pending loads and assigned carriers to priority shipments."]
- [Criteria 2 — e.g., "User has filtered and exported the day's delivery schedule."]

---

## 3. Layout Blueprint

<!-- Visual structure of the page — desktop first, then responsive notes in Section 13 -->

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------+
|  Top Bar: Breadcrumb / Page Title / Action Buttons (right)       |
+------------------------------------------------------------------+
|  [Stats Bar / KPI Cards — optional]                              |
+------------------------------------------------------------------+
|  Filters Bar: [Filter 1] [Filter 2] [Search] [Date Range]       |
+------------------------------------------------------------------+
|  +------------------------------------------------------------+  |
|  |  Main Content Area                                          |  |
|  |                                                             |  |
|  |  [Table / Cards / Form / Map — primary content here]       |  |
|  |                                                             |  |
|  |                                                             |  |
|  |                                                             |  |
|  +------------------------------------------------------------+  |
|  Pagination / Load More                                          |
+------------------------------------------------------------------+
```

<!-- Replace the ASCII wireframe above with the actual layout for this screen. -->
<!-- Be specific: show sidebar panels, split views, tab sections, etc. -->

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible, above the fold) | [E.g., Load number, status badge, origin/destination, pickup date] | [Users need this at a glance to make decisions] |
| **Secondary** (visible but less prominent) | [E.g., Carrier name, equipment type, rate, distance] | [Important context but not the first thing scanned] |
| **Tertiary** (available on hover, expand, or scroll) | [E.g., Special instructions, accessorial charges, audit log] | [Needed occasionally, not for every interaction] |
| **Hidden** (behind a click — modal, drawer, or detail page) | [E.g., Full document list, rate breakdown, communication history] | [Deep detail only needed for investigation or editing] |

---

## 4. Data Fields & Display

<!-- What data appears on screen, where does it come from, how is it formatted? -->

### Visible Fields

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | [Load Number] | [Load.loadNumber] | [FM-2025-XXXX, monospace font, clickable link] | [Table column 1 / Card header] |
| 2 | [Status] | [Load.status] | [Badge with color — see Section 6] | [Table column 2 / Card top-right] |
| 3 | [Origin] | [Load.stops[0].city + state] | [City, ST format] | [Table column 3] |
| 4 | [Destination] | [Load.stops[last].city + state] | [City, ST format] | [Table column 4] |
| 5 | [Field Name] | [Entity.fieldName] | [Format description] | [Location] |

<!-- Add all visible fields. Reference the entity data dictionary from 03-data-dictionary.md -->

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | [Profit Margin] | [(customerRate - carrierRate) / customerRate * 100] | [Percentage with 1 decimal, color-coded: green >15%, yellow 5-15%, red <5%] |
| 2 | [Time to Pickup] | [stops[0].appointmentDate - now()] | [Relative time: "2h 30m", "Tomorrow 8:00 AM", or "Overdue by 3h" in red] |
| 3 | [Derived Field] | [Calculation description] | [Format description] |

---

## 5. Features

<!-- What functionality does this screen provide? -->

### Core Features (Must-Have for MVP)

- [ ] [Feature 1 — e.g., "View paginated list of loads with status badges"]
- [ ] [Feature 2 — e.g., "Filter loads by status, date range, and origin/destination"]
- [ ] [Feature 3 — e.g., "Click a load row to navigate to Load Detail page"]
- [ ] [Feature 4 — e.g., "Sort by any column header"]
- [ ] [Feature 5 — e.g., "Bulk select loads for batch status updates"]

### Advanced Features (Logistics Expert Recommendations)

- [ ] [Feature 1 — e.g., "Auto-refresh load list every 30 seconds with visual diff highlighting"]
- [ ] [Feature 2 — e.g., "Predictive ETA based on real-time traffic and historical lane data"]
- [ ] [Feature 3 — e.g., "Smart carrier matching suggestions based on lane history and rating"]
- [ ] [Feature 4 — e.g., "Inline rate negotiation with margin calculator"]

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| [View revenue columns] | [admin, finance] | [finance_view] | [Columns hidden entirely] |
| [Edit load details] | [dispatcher, admin] | [load_edit] | [Fields shown as read-only] |
| [Delete load] | [admin] | [load_delete] | [Button not rendered] |
| [Export to CSV] | [any authenticated] | [export_data] | [Button disabled with tooltip] |

---

## 6. Status & State Machine

<!-- How does the primary entity's status flow on this screen? -->

### Status Transitions

```
[Created] ---(Submit)--> [Pending Review]
    |                         |
    v                         v
[Draft] <--(Reject)--- [Pending Review] ---(Approve)--> [Ready to Dispatch]
                                                              |
                                                              v
                                                    [Dispatched] ---> [In Transit]
                                                                          |
                                                                          v
                                                                    [Delivered] ---> [Completed]
```

<!-- Replace the diagram above with the actual status flow for the entity on this screen. -->

### Actions Available Per Status

| Status | Available Actions (Buttons) | Restricted Actions |
|---|---|---|
| [Draft] | [Edit, Submit, Delete] | [Dispatch, Invoice] |
| [Pending Review] | [Approve, Reject, Edit] | [Delete, Dispatch] |
| [Ready to Dispatch] | [Assign Carrier, Edit, Cancel] | [Delete] |
| [Dispatched] | [Track, Update ETA, Cancel] | [Edit origin/dest, Delete] |
| [In Transit] | [Update Status, Add Note, Report Issue] | [Edit, Cancel] |
| [Delivered] | [Confirm POD, Invoice, Add Note] | [Edit, Cancel, Delete] |

### Status Badge Colors

| Status | Background | Text | Border | Tailwind Classes |
|---|---|---|---|---|
| [Draft] | [gray-100] | [gray-700] | [gray-300] | `bg-gray-100 text-gray-700 border-gray-300` |
| [Pending] | [yellow-100] | [yellow-800] | [yellow-300] | `bg-yellow-100 text-yellow-800 border-yellow-300` |
| [Active] | [blue-100] | [blue-800] | [blue-300] | `bg-blue-100 text-blue-800 border-blue-300` |
| [Completed] | [green-100] | [green-800] | [green-300] | `bg-green-100 text-green-800 border-green-300` |
| [Cancelled] | [red-100] | [red-800] | [red-300] | `bg-red-100 text-red-800 border-red-300` |

---

## 7. Actions & Interactions

<!-- Every clickable, tappable, draggable thing on the screen -->

### Primary Action Buttons (Top-Right of Page)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| [Create New Load] | [Plus] | [Primary / Blue] | [Opens create form / navigates to /loads/new] | [No] |
| [Export] | [Download] | [Secondary / Outline] | [Downloads CSV of current filtered view] | [No] |

### Secondary Actions (Dropdown / "More" Menu)

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| [Duplicate Load] | [Copy] | [Creates a copy with 'Draft' status] | [Single load selected] |
| [Archive] | [Archive] | [Moves to archived state] | [Status is 'Completed' or 'Cancelled'] |
| [Print BOL] | [Printer] | [Opens print dialog with BOL document] | [Load has BOL generated] |

### Bulk Actions (When Multiple Rows Selected)

| Action Label | Action | Confirmation |
|---|---|---|
| [Update Status] | [Opens status change modal for all selected] | [Yes — "Update N loads to [status]?"] |
| [Assign Carrier] | [Opens carrier assignment modal] | [Yes — "Assign [carrier] to N loads?"] |
| [Export Selected] | [Downloads CSV of selected rows only] | [No] |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| [Ctrl/Cmd + K] | [Open global search / command palette] |
| [Ctrl/Cmd + N] | [Create new entity] |
| [Escape] | [Close modal / deselect all] |
| [Arrow Up/Down] | [Navigate table rows] |
| [Enter] | [Open selected row detail] |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| [Load card] | [Status lane / Kanban column] | [Changes load status to target lane] |
| [Stop row] | [Other position in stop list] | [Reorders stops] |
| [N/A if no drag-drop] | — | — |

---

## 8. Real-Time Features

<!-- What updates live without page refresh? -->

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| [load.status.changed] | [{ loadId, oldStatus, newStatus, updatedBy }] | [Update status badge, show toast "Load FM-2025-0847 moved to In Transit by John D."] |
| [load.eta.updated] | [{ loadId, newEta, reason }] | [Update ETA column, flash highlight on changed row] |
| [load.assigned] | [{ loadId, carrierId, carrierName }] | [Update carrier column, show toast notification] |

### Live Update Behavior

- **Update frequency:** [WebSocket push for critical changes, polling every 30s for non-critical]
- **Visual indicator:** [Briefly flash the changed row with a subtle blue highlight that fades over 2 seconds]
- **Conflict handling:** [If user is editing a record that changes remotely, show banner: "This record was updated by [name]. Refresh to see changes."]

### Polling Fallback

- **When:** [WebSocket connection drops]
- **Interval:** [Every 30 seconds]
- **Endpoint:** [GET /api/loads?updatedSince={lastPollTimestamp}]
- **Visual indicator:** [Show "Live updates paused — reconnecting..." banner at top of content area]

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| [Change status] | [Immediately update badge and move card] | [Revert badge, show error toast "Failed to update status. Please try again."] |
| [Assign carrier] | [Show carrier name immediately in the row] | [Revert to "Unassigned", show error toast] |

---

## 9. Component Inventory

<!-- What UI components does this screen need? -->

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| [StatusBadge] | [src/components/ui/status-badge.tsx] | [status: string, size: 'sm' | 'md'] |
| [DataTable] | [src/components/ui/data-table.tsx] | [columns, data, pagination, sorting] |
| [PageHeader] | [src/components/layout/page-header.tsx] | [title, breadcrumbs, actions] |
| [FilterBar] | [src/components/ui/filter-bar.tsx] | [filters: FilterConfig[]] |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| [DataTable] | [Basic sort and pagination] | [Add bulk selection, row actions dropdown, column visibility toggle] |
| [FilterBar] | [Text and select filters only] | [Add date range picker, multi-select, saved filter presets] |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| [LoadCard] | [Compact card showing load summary for Kanban view] | [Medium — status badge, route display, carrier info, drag handle] |
| [StopTimeline] | [Vertical timeline showing pickup/delivery stops with status] | [Medium — timeline dots, connector lines, time display] |
| [MarginIndicator] | [Visual indicator of profit margin with color coding] | [Small — colored bar/number] |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| [Date Range Picker] | [calendar + popover] | [Filter by pickup/delivery date range] |
| [Command Menu] | [command] | [Global search / command palette] |
| [Dropdown Menu] | [dropdown-menu] | [Row actions, bulk actions, more menu] |
| [Sheet] | [sheet] | [Side panel for quick-edit without navigation] |

---

## 10. API Integration

<!-- What API endpoints and hooks does this screen consume? -->

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | [GET] | [/api/loads] | [Fetch paginated load list with filters] | [useLoads(filters)] |
| 2 | [GET] | [/api/loads/:id] | [Fetch single load detail] | [useLoad(id)] |
| 3 | [POST] | [/api/loads] | [Create a new load] | [useCreateLoad()] |
| 4 | [PATCH] | [/api/loads/:id/status] | [Update load status] | [useUpdateLoadStatus()] |
| 5 | [GET] | [/api/carriers?available=true] | [Fetch available carriers for assignment] | [useAvailableCarriers()] |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| [loads:{tenantId}] | [load.updated] | [useLoadUpdates() — invalidates load list query] |
| [loads:{loadId}] | [load.status.changed] | [useLoadStatusStream(loadId) — updates local state] |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 500 |
|---|---|---|---|---|---|
| [GET /api/loads] | [Show filter error] | [Redirect to login] | [Show "Access Denied" page] | [N/A] | [Show error state with retry] |
| [PATCH /api/loads/:id/status] | [Show validation toast] | [Redirect to login] | [Show "Permission Denied" toast] | [Show "Load not found" toast] | [Show error toast with retry] |

---

## 11. States & Edge Cases

<!-- Every possible state this screen can be in -->

### Loading State

- **Skeleton layout:** [Show table with 8 skeleton rows: gray animated bars matching column widths. Show skeleton cards for KPI stats. Show skeleton for filter bar.]
- **Progressive loading:** [Show page header and filters immediately; skeleton only for data area.]
- **Duration threshold:** [If loading exceeds 5s, show "This is taking longer than usual..." message.]

### Empty States

**First-time empty (no data ever created):**
- **Illustration:** [Truck/freight illustration or icon]
- **Headline:** ["No loads yet"]
- **Description:** ["Create your first load to start tracking shipments."]
- **CTA Button:** ["Create First Load" — primary blue button]

**Filtered empty (data exists but filters exclude all):**
- **Headline:** ["No loads match your filters"]
- **Description:** ["Try adjusting your filters or search terms."]
- **CTA Button:** ["Clear All Filters" — secondary outline button]

### Error States

**Full page error (API completely fails):**
- **Display:** [Error icon + "Unable to load [entity name]" + "Please try again or contact support if the issue persists." + Retry button]

**Per-section error (partial failure, e.g., stats load but table fails):**
- **Display:** [Show successful sections normally. Failed section shows inline error: "Could not load [section name]" with Retry link.]

**Action error (user action fails):**
- **Display:** [Toast notification: red background, error icon, message, dismiss button. Auto-dismiss after 8 seconds.]

### Permission Denied

- **Full page denied:** [Show "You don't have permission to view this page" with link back to dashboard]
- **Partial denied (some features hidden):** [Hide restricted elements entirely — do not show disabled versions unless there's educational value in knowing the feature exists]

### Offline / Degraded

- **Full offline:** [Show banner: "You're offline. Showing cached data from [timestamp]. Changes will sync when reconnected."]
- **Degraded (WebSocket down, REST works):** [Show subtle indicator: "Live updates paused" in the page header area. Data still loads on refresh/navigation.]

---

## 12. Filters, Search & Sort

<!-- How users narrow down and find data -->

### Filters

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | [Status] | [Multi-select dropdown] | [All statuses from Section 6] | [All except Cancelled] | [?status=active,dispatched] |
| 2 | [Date Range] | [Date range picker] | [Preset: Today, This Week, This Month, Custom] | [This Week] | [?dateFrom=&dateTo=] |
| 3 | [Customer] | [Searchable select] | [From /api/customers] | [All] | [?customerId=] |
| 4 | [Origin Region] | [Multi-select] | [States / regions] | [All] | [?originState=] |
| 5 | [Equipment Type] | [Select dropdown] | [Dry Van, Reefer, Flatbed, Step Deck, Other] | [All] | [?equipment=] |

### Search Behavior

- **Search field:** [Single search input at top of filter bar]
- **Searches across:** [Load number, customer name, origin city, destination city, carrier name, PO number]
- **Behavior:** [Debounced 300ms, minimum 2 characters, highlights matching text in results]
- **URL param:** [?search=]

### Sort Options

| Column / Field | Default Direction | Sort Type |
|---|---|---|
| [Created Date] | [Descending (newest first)] | [Date] |
| [Pickup Date] | [Ascending (soonest first)] | [Date] |
| [Load Number] | [Descending] | [Alphanumeric] |
| [Customer Rate] | [Descending (highest first)] | [Numeric] |
| [Status] | [Custom order: active statuses first] | [Custom enum order] |

**Default sort:** [Pickup Date ascending — soonest pickups first]

### Saved Filters / Presets

- **System presets:** ["My Loads", "Urgent (Today's Pickups)", "Unassigned", "At Risk (No Carrier 24h+)"]
- **User-created presets:** [Users can save current filter combination with a custom name. Stored per-user in localStorage and optionally synced to server.]
- **URL sync:** [All filter state is reflected in URL query params so views can be shared via link.]

---

## 13. Responsive Design Notes

<!-- How does this screen adapt to smaller viewports? -->

### Tablet (768px - 1023px)

- [Sidebar collapses to icon-only mode]
- [Data table columns: hide lower-priority columns (keep first 4-5 columns, hide the rest behind a "more" expand)]
- [Filter bar: collapse to a "Filters" button that opens a slide-over panel]
- [KPI cards: stack 2 per row instead of 4]
- [Action buttons: keep primary visible, move secondary to overflow menu]

### Mobile (< 768px)

- [Sidebar hidden entirely — accessible via hamburger menu]
- [Data table switches to card-based list view (one card per row)]
- [Each card shows: primary field (load number), status badge, key info (route, date), and tap-to-expand for more]
- [Filters: full-screen filter modal triggered by filter icon]
- [Sticky bottom bar with primary action button (e.g., "Create Load")]
- [Swipe gestures: swipe left on card for quick actions (edit, call carrier)]
- [Pull-to-refresh for data reload]

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full layout as designed in Section 3 |
| Desktop | 1024px - 1439px | Sidebar slightly narrower, table may scroll horizontally |
| Tablet | 768px - 1023px | See tablet notes above |
| Mobile | < 768px | See mobile notes above |

---

## 14. Stitch Prompt

<!-- Ready-to-paste prompt for stitch.withgoogle.com to generate a UI mockup of this screen -->

```
Design a [screen type] for a modern freight/logistics TMS (Transportation Management System) called "Ultra TMS."

Layout: [Describe the overall layout — e.g., "Full-width page with dark slate-900 sidebar on the left (240px), white content area on the right. Top of content area has a page header with breadcrumb, title, and action buttons."]

Content Area:
- [Describe the main content — e.g., "Below the header, show a row of 4 KPI stat cards (Total Loads: 847, In Transit: 234, Delivered Today: 56, Revenue: $1.2M)."]
- [Describe the filter bar — e.g., "Below stats, a filter bar with Status dropdown, Date Range picker, Customer search, and a search input."]
- [Describe the primary content — e.g., "Below filters, a data table with columns: Load #, Status (colored badge), Customer, Origin, Destination, Pickup Date, Carrier, Rate. Show 8 rows of realistic data."]

Data Examples:
- Load FM-2025-0847 | In Transit | Acme Manufacturing | Chicago, IL → Dallas, TX | Jan 15 | Swift Transport | $2,450.00
- Load FM-2025-0848 | Ready to Dispatch | Global Foods Inc | Los Angeles, CA → Phoenix, AZ | Jan 16 | Unassigned | $1,875.50
- [Add more example rows as needed]

Design Specifications:
- Font: Inter or system sans-serif, 14px base size
- Sidebar: slate-900 background, white text, blue-600 active indicator
- Content background: white (#FFFFFF)
- Primary color: blue-600 for buttons and links
- Status badges: green for active/delivered, yellow for pending, blue for in transit, red for cancelled, gray for draft
- Table rows: subtle hover state with gray-50 background
- Cards: white background, rounded-lg border, subtle shadow-sm
- Modern SaaS aesthetic similar to Linear.app or Vercel dashboard

Include: [Any specific elements — e.g., "pagination at bottom of table, a '+ Create Load' primary button in the top-right header area, checkbox column for bulk selection"]
```

<!-- Replace the placeholder prompt above with a specific, detailed prompt for this screen. -->
<!-- Aim for 200-400 words. The more specific you are, the better the Stitch output. -->

---

## 15. Enhancement Opportunities

<!-- What's the roadmap for this screen beyond MVP? Focused on current wave. -->

### Current State (Wave [1/2/3])

**What's built and working:**
- [ ] [Feature/element 1 — e.g., "Basic load list with pagination and sorting"]
- [ ] [Feature/element 2 — e.g., "Status filter dropdown"]
- [ ] [Feature/element 3 — e.g., "Click-through to load detail page"]

**What needs polish / bug fixes:**
- [ ] [Issue 1 — e.g., "Loading skeleton doesn't match actual table column widths"]
- [ ] [Issue 2 — e.g., "Filter state is lost on browser back navigation"]
- [ ] [Issue 3 — e.g., "Mobile card view is missing carrier information"]

**What to add this wave:**
- [ ] [Enhancement 1 — e.g., "Add bulk selection and batch status update"]
- [ ] [Enhancement 2 — e.g., "Add saved filter presets"]
- [ ] [Enhancement 3 — e.g., "Add column visibility toggle for power users"]

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| [Enhancement name] | [High/Med/Low] | [High/Med/Low] | [P0/P1/P2] |
| [Enhancement name] | [High/Med/Low] | [High/Med/Low] | [P0/P1/P2] |
| [Enhancement name] | [High/Med/Low] | [High/Med/Low] | [P0/P1/P2] |

### Future Wave Preview

- **Wave [Next]:** [Brief note on what changes — e.g., "Add real-time tracking integration, predictive ETA column, carrier performance scores"]
- **Wave [Later]:** [Brief note — e.g., "AI-powered carrier recommendations, automated dispatching rules, customer self-service portal view"]

---

<!--
TEMPLATE USAGE NOTES:
1. Copy this entire file as a starting point for each new screen design.
2. Rename the file to match the screen (e.g., "05-load-list.md", "06-load-detail.md").
3. Fill in every section — even if a section is "N/A", note why it doesn't apply.
4. Reference the data dictionary (03-data-dictionary.md) for entity fields in Section 4.
5. Reference the component library for existing components in Section 9.
6. After completing the design, generate the Stitch prompt in Section 14 and test it.
7. Update Section 15 as development progresses.
-->
