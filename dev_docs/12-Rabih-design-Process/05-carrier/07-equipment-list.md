# Equipment List

> Service: Carrier Management | Wave: 3 | Priority: P1
> Route: /(dashboard)/carriers/[id]/equipment | Status: Not Started
> Primary Personas: Sarah (Ops Manager), Maria (Dispatcher), Omar (Dispatcher/Operations)
> Roles with Access: dispatcher, operations_manager, admin

---

## 1. Purpose & Business Context

**What this screen does:**
Provides a consolidated fleet equipment inventory across all carriers, enabling dispatchers and operations managers to view, filter, and analyze the trucks and trailers available in the carrier network. This screen is the single source of truth for equipment capacity across the brokerage.

**Business problem it solves:**
Without a centralized equipment view, dispatchers waste 15-30 minutes per load calling carriers to ask "Do you have a reefer available in Chicago?" This screen eliminates that friction by showing all known equipment, its type, current status, and last known location. During peak season or tight-capacity markets, knowing exactly how many flatbeds are idle in the Southeast versus committed in the Midwest is the difference between covering a load at market rate and paying a $500 premium. Freight brokerages that lack equipment visibility lose carrier utilization opportunities and overpay on spot market loads.

**Key business rules:**
- Equipment records are linked to a carrier entity; orphaned equipment (no carrier) cannot exist.
- Equipment status must be one of: AVAILABLE, COMMITTED, OUT_OF_SERVICE, or UNKNOWN.
- Only carriers with status ACTIVE or PENDING can have equipment listed.
- Equipment type must match one of the 12 system-defined types (DRY_VAN, REEFER, FLATBED, STEP_DECK, LOWBOY, CONESTOGA, POWER_ONLY, SPRINTER, HOTSHOT, TANKER, HOPPER, CONTAINER).
- GPS location data is optional and only populated for carriers with ELD/GPS integration enabled.
- Equipment marked OUT_OF_SERVICE cannot be assigned to loads.

**Success metric:**
Average time to identify an available truck for a specific equipment type and region drops from 12 minutes to under 45 seconds. Carrier utilization rate visibility increases dispatcher confidence in carrier selection.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Carrier Detail | Click "Equipment" tab or "View Fleet" link | carrierId, carrier name |
| Dispatch Board | Click "Find Equipment" action button | equipmentType filter, region filter |
| Carrier Dashboard | Click "Total Equipment" KPI card | None (shows all) |
| Preferred Carriers | Click equipment count badge on carrier card | carrierId |
| Direct URL | Bookmark / shared link | Route params, query filters |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Carrier Detail | Click carrier name in table row | carrierId |
| Load Detail | Click load number in "Current Load" column | loadId |
| Carrier Scorecard | Click "View Scorecard" from row actions | carrierId |
| Dispatch Board | Click "Assign to Load" action | equipmentId, carrierId, equipmentType |
| Tracking Map | Click GPS location pin icon | equipmentId, coordinates |

**Primary trigger:**
Maria the dispatcher needs to find an available reefer in the Dallas-Fort Worth area for a temperature-controlled load picking up tomorrow. She navigates to Equipment List from the sidebar or Dispatch Board and filters by equipment type "Reefer" and region "TX".

**Success criteria (user completes the screen when):**
- User has identified available equipment matching their load requirements (type, region, availability).
- User has drilled into a carrier to assign the equipment to a load.
- User has reviewed fleet utilization to identify underused carriers for relationship outreach.

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------+
|  Top Bar: Breadcrumb (Carriers > Equipment) / Page Title          |
|  "Fleet Equipment"                  [Export CSV] [+ Add Equipment] |
+------------------------------------------------------------------+
|  Stats Cards Row (5 cards, equal width)                           |
|  +----------+ +----------+ +----------+ +----------+ +----------+|
|  |Total Units| |Trucks    | |Trailers  | |Available | |Committed ||
|  |   847     | |   312    | |   535    | |  423     | |   389    ||
|  | +3.2% MoM | |          | |          | |49.9% rate| |46.0% rate||
|  +----------+ +----------+ +----------+ +----------+ +----------+|
+------------------------------------------------------------------+
|  Equipment Type Visual Cards (horizontal scroll, 12 types)        |
|  [DRY_VAN:234] [REEFER:189] [FLATBED:87] [STEP_DECK:45] ...     |
|  (Each card: icon + name + count, clickable to filter)            |
+------------------------------------------------------------------+
|  Filters Bar:                                                      |
|  [Search...] [Carrier v] [Equipment Type v] [Status v] [Region v] |
|  [Available Now toggle] [Last Inspection v] [Clear Filters]        |
+------------------------------------------------------------------+
|  +------------------------------------------------------------+  |
|  |  Data Table (main content)                                  |  |
|  |  [ ] | Carrier Name | Type (icon) | Unit # | Year/Make    |  |
|  |      | Status | Location | Current Load | Last Inspection  |  |
|  |      | Utilization | Actions                                |  |
|  |  --------------------------------------------------------  |  |
|  |  [ ] | Swift Transport | [van] Dry Van | T-4421 | 2022    |  |
|  |      | Freightliner Cascadia | Available | Dallas, TX      |  |
|  |      | -- | 01/15/2026 | 78% | [...]                       |  |
|  |  --------------------------------------------------------  |  |
|  |  [ ] | Alpine Carriers | [snowflake] Reefer | R-1187 |    |  |
|  |      | 2023 Utility 3000R | Committed | Chicago, IL        |  |
|  |      | FM-2026-0847 | 12/20/2025 | 92% | [...]             |  |
|  |  --------------------------------------------------------  |  |
|  |  (continues...)                                             |  |
|  +------------------------------------------------------------+  |
|  Pagination: Showing 1-25 of 847 | [< 1 2 3 ... 34 >]           |
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible, above fold) | Equipment type icon + label, carrier name, status badge, current location | Dispatchers scan for available trucks by type and location first |
| **Secondary** (visible but less prominent) | Unit number, year/make/model, current load assignment, utilization rate | Important for identification and capacity planning but not the first scan target |
| **Tertiary** (available on hover/expand/scroll) | Last inspection date, GPS coordinates, carrier tier, equipment notes | Needed for compliance checks and detailed planning |
| **Hidden** (behind click -- modal/drawer/detail) | Full equipment history, maintenance records, inspection documents, assignment log | Deep investigation data only needed occasionally |

---

## 4. Data Fields & Display

### Visible Fields

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Carrier Name | Carrier.companyName | Text, clickable link to Carrier Detail, truncate at 30 chars | Table column 1 |
| 2 | Tier Badge | Carrier.tier | Small colored badge (PLATINUM/GOLD/SILVER/BRONZE) next to carrier name | Inline with column 1 |
| 3 | Equipment Type | Equipment.equipmentType | Icon + text label (e.g., snowflake + "Reefer"), color per status-color-system.md Section 19 | Table column 2 |
| 4 | Unit Number | Equipment.unitNumber | Monospace font, e.g., "T-4421" | Table column 3 |
| 5 | Year/Make/Model | Equipment.year + Equipment.make + Equipment.model | Concatenated string, e.g., "2022 Freightliner Cascadia"; show "--" if not provided | Table column 4 |
| 6 | Status | Equipment.status | Badge: AVAILABLE (green), COMMITTED (blue), OUT_OF_SERVICE (red), UNKNOWN (gray) | Table column 5 |
| 7 | Current Location | Equipment.lastKnownCity + Equipment.lastKnownState | "City, ST" format; show GPS icon if live GPS data; "--" if no data | Table column 6 |
| 8 | Current Load | Equipment.currentLoadId | Load number as clickable link (e.g., "FM-2026-0847"); "--" if unassigned | Table column 7 |
| 9 | Last Inspection | Equipment.lastInspectionDate | Date format "MM/DD/YYYY"; red text if > 12 months ago; amber if > 6 months | Table column 8 |
| 10 | Utilization Rate | Calculated | Percentage with progress bar, color-coded | Table column 9 |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Utilization Rate | (Days equipment was on a load in last 30 days / 30) * 100 | Percentage with 1 decimal, color-coded: green >75%, amber 40-75%, red <40% |
| 2 | Days Since Inspection | now() - Equipment.lastInspectionDate | Integer; red badge if >365, amber if >180, hidden otherwise |
| 3 | Available Count | COUNT(Equipment WHERE status = 'AVAILABLE') per equipment type | Integer, shown in equipment type cards |
| 4 | Committed Count | COUNT(Equipment WHERE status = 'COMMITTED') per equipment type | Integer, shown in equipment type cards |
| 5 | Fleet Availability Rate | Available / (Available + Committed) * 100 | Percentage shown in stats card |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] View paginated list of all equipment across all carriers with sorting on every column
- [ ] Filter by carrier, equipment type, status, and region (state)
- [ ] Equipment type visual cards with icon and count (clickable to filter table)
- [ ] Stats cards showing total units, trucks vs trailers breakdown, available vs committed
- [ ] Click carrier name to navigate to Carrier Detail
- [ ] Click load number to navigate to Load Detail
- [ ] "Available Now" toggle to instantly filter to only available equipment
- [ ] Sort by any column header (default: carrier name ascending)
- [ ] Bulk select equipment rows for batch operations
- [ ] Export filtered view to CSV

### Advanced Features (Logistics Expert Recommendations)

- [ ] Equipment heatmap overlay: toggle a map view showing geographic concentration of equipment by colored dots (green = available, blue = committed, red = OOS)
- [ ] Capacity planning mode: split view showing available vs committed by equipment type as stacked bar chart, with date range selector to see projected availability based on current load delivery dates
- [ ] "Find nearest available" tool: enter a city/zip, equipment type, and radius; returns ranked list of available equipment sorted by proximity
- [ ] Auto-suggest for dispatching: when opening this screen from Dispatch Board with a load context, pre-filter to matching equipment type and highlight carriers within 150 miles of pickup
- [ ] Equipment utilization trend: sparkline in the utilization column showing 30-day trend
- [ ] Carrier fleet size comparison: select multiple carriers and compare fleet composition side by side
- [ ] Inspection alert system: highlight rows where inspection is overdue with a warning banner
- [ ] Real-time GPS refresh: for carriers with ELD integration, show live location with timestamp of last ping

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| Add equipment | dispatcher, admin | equipment_create | "+ Add Equipment" button not rendered |
| Edit equipment | dispatcher, admin | equipment_edit | Row actions show "View" only, no "Edit" |
| Delete equipment | admin | equipment_delete | "Delete" action hidden in row menu |
| Export to CSV | any authenticated | export_data | Button disabled with tooltip "Export not available" |
| View utilization rate | operations_manager, admin | analytics_view | Column hidden entirely |
| View GPS location | dispatcher, operations_manager, admin | tracking_view | Location column shows "--" |

---

## 6. Status & State Machine

### Status Transitions

```
[UNKNOWN] ---(Carrier Updates / GPS Sync)---> [AVAILABLE]
                                                    |
                                     (Assign to Load)
                                                    |
                                                    v
                                              [COMMITTED] ---(Load Delivered / Unassign)---> [AVAILABLE]
                                                    |
                                     (Breakdown / Maintenance)
                                                    |
                                                    v
                                            [OUT_OF_SERVICE] ---(Repair Complete)---> [AVAILABLE]
                                                    |
[AVAILABLE] ---(Breakdown)---> [OUT_OF_SERVICE]     |
                                                    v
                                              [UNKNOWN] (if carrier goes dark / no updates for 7+ days)
```

### Actions Available Per Status

| Status | Available Actions (Buttons) | Restricted Actions |
|---|---|---|
| AVAILABLE | Assign to Load, Edit, Mark OOS, View History | N/A |
| COMMITTED | View Load, Edit, Mark OOS, View History | Assign to Load (already assigned) |
| OUT_OF_SERVICE | Return to Service, Edit, View History | Assign to Load |
| UNKNOWN | Update Status, Edit, Contact Carrier, View History | Assign to Load |

### Status Badge Colors

| Status | Background | Text | Border | Tailwind Classes |
|---|---|---|---|---|
| AVAILABLE | green-100 (#D1FAE5) | green-800 (#065F46) | green-300 | `bg-emerald-100 text-emerald-800` |
| COMMITTED | blue-100 (#DBEAFE) | blue-800 (#1E40AF) | blue-300 | `bg-blue-100 text-blue-800` |
| OUT_OF_SERVICE | red-100 (#FEE2E2) | red-800 (#991B1B) | red-300 | `bg-red-100 text-red-800` |
| UNKNOWN | gray-100 (#F3F4F6) | gray-700 (#374151) | gray-300 | `bg-gray-100 text-gray-700` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Top-Right of Page)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| + Add Equipment | Plus | Primary / Blue | Opens slide-out drawer with equipment creation form (carrier select, type, unit#, year/make/model) | No |
| Export CSV | Download | Secondary / Outline | Downloads CSV of current filtered view including all visible columns | No |

### Secondary Actions (Row-Level "More" Menu)

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| View Details | Eye | Opens equipment detail drawer with full info + history | Always available |
| Edit Equipment | Pencil | Opens edit drawer with pre-filled form | User has equipment_edit permission |
| Assign to Load | Truck | Opens load selector modal to assign this equipment | Status is AVAILABLE |
| View Carrier | Building | Navigates to Carrier Detail page | Always available |
| Mark Out of Service | XCircle | Changes status to OUT_OF_SERVICE with reason prompt | Status is AVAILABLE or COMMITTED |
| Return to Service | CheckCircle | Changes status to AVAILABLE | Status is OUT_OF_SERVICE |
| View on Map | MapPin | Opens tracking map centered on equipment location | GPS data available |
| Delete Equipment | Trash | Soft-deletes equipment record | Admin only, not COMMITTED status |

### Bulk Actions (When Multiple Rows Selected)

| Action Label | Action | Confirmation |
|---|---|---|
| Update Status | Opens status change modal for all selected | Yes -- "Update N equipment to [status]?" |
| Export Selected | Downloads CSV of selected rows only | No |
| Assign to Carrier | Reassign equipment to a different carrier | Yes -- "Move N equipment to [carrier]?" |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + K | Open global search / command palette |
| Ctrl/Cmd + F | Focus search input on this page |
| Ctrl/Cmd + E | Export current view |
| Escape | Close modal / deselect all |
| Arrow Up/Down | Navigate table rows |
| Enter | Open selected row detail drawer |
| Space | Toggle row selection |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| N/A | -- | No drag-drop on this screen |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| equipment.status.changed | { equipmentId, carrierId, oldStatus, newStatus, loadId } | Update status badge in row, flash highlight 2s, update stats cards counts |
| equipment.location.updated | { equipmentId, lat, lng, city, state, timestamp } | Update location column, show subtle pulse on GPS icon |
| equipment.assigned | { equipmentId, loadId, carrierId } | Update "Current Load" column, change status to COMMITTED, update Available/Committed counts |
| equipment.unassigned | { equipmentId, loadId } | Clear "Current Load" column, change status to AVAILABLE, update counts |
| carrier.status.changed | { carrierId, newStatus } | If carrier suspended/blacklisted, dim all their equipment rows and show warning icon |

### Live Update Behavior

- **Update frequency:** WebSocket push for status/assignment changes (critical), polling every 60s for GPS location updates (non-critical)
- **Visual indicator:** Changed rows flash with a subtle blue-100 highlight that fades over 2 seconds
- **Conflict handling:** If user has equipment detail drawer open and equipment status changes remotely, show inline banner: "This equipment was updated. Refresh to see changes."
- **Stats cards:** Animate counter changes with a brief count-up/count-down animation (200ms)

### Polling Fallback

- **When:** WebSocket connection drops
- **Interval:** Every 30 seconds
- **Endpoint:** GET /api/equipment?updatedSince={lastPollTimestamp}
- **Visual indicator:** Show "Live updates paused -- reconnecting..." subtle banner below page title

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Mark Out of Service | Immediately update badge to OOS, decrement Available count | Revert badge and count, show error toast |
| Return to Service | Immediately update badge to Available, increment Available count | Revert badge and count, show error toast |
| Assign to Load | Show load number in Current Load column, change status to Committed | Revert to unassigned, show error toast |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| StatusBadge | src/components/ui/status-badge.tsx | status: string, size: 'sm' / 'md', entity: EQUIPMENT_STATUS or CARRIER_TIER |
| DataTable | src/components/ui/data-table.tsx | columns, data, pagination, sorting, selection |
| PageHeader | src/components/layout/page-header.tsx | title, breadcrumbs, actions |
| FilterBar | src/components/ui/filter-bar.tsx | filters: FilterConfig[] |
| StatsCard | src/components/ui/stats-card.tsx | label, value, trend, icon |
| TierBadge | src/components/carrier/tier-badge.tsx | tier: PLATINUM/GOLD/SILVER/BRONZE/UNQUALIFIED |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| DataTable | Basic sort and pagination | Add inline progress bar for utilization column, icon+text combo rendering for equipment type column |
| FilterBar | Text and select filters only | Add toggle switch for "Available Now" filter, region multi-select with state grouping |
| StatsCard | Shows value and label | Add percentage sub-label and month-over-month trend arrow |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| EquipmentTypeCard | Compact card with equipment type icon (colored per status-color-system.md), type name, total count, and available count. Clickable to filter table. Horizontal scrollable row of 12 cards. | Medium |
| EquipmentHeatmap | Map overlay component using Mapbox/Leaflet showing colored dots for equipment locations. Toggle between available/committed/all view. Cluster markers at zoom levels. | High |
| UtilizationBar | Inline horizontal progress bar with percentage label. Color transitions: green >75%, amber 40-75%, red <40%. Optional sparkline mode for trend. | Small |
| EquipmentDetailDrawer | Right slide-out drawer showing full equipment details, assignment history, inspection records, and quick-action buttons. | Medium |
| CapacityPlanningPanel | Split view panel showing stacked bar charts of available vs committed by equipment type, with date range selector for projected availability. | High |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Toggle | toggle | "Available Now" filter toggle |
| Sheet | sheet | Equipment detail side drawer |
| Progress | progress | Utilization bar in table rows |
| Tooltip | tooltip | Hover info on equipment type icons, GPS timestamps |
| Command Menu | command | Quick equipment search within the page |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/equipment | Fetch paginated equipment list with filters (carrier, type, status, region) | useEquipmentList(filters) |
| 2 | GET | /api/equipment/:id | Fetch single equipment detail | useEquipment(id) |
| 3 | POST | /api/equipment | Create new equipment record | useCreateEquipment() |
| 4 | PATCH | /api/equipment/:id | Update equipment details (unit#, year/make/model, status) | useUpdateEquipment() |
| 5 | DELETE | /api/equipment/:id | Soft-delete equipment record | useDeleteEquipment() |
| 6 | GET | /api/equipment/stats | Fetch aggregate stats (total, by type, available, committed) | useEquipmentStats() |
| 7 | GET | /api/equipment/heatmap | Fetch equipment locations for map overlay | useEquipmentHeatmap(filters) |
| 8 | PATCH | /api/equipment/:id/status | Update equipment status with reason | useUpdateEquipmentStatus() |
| 9 | POST | /api/equipment/:id/assign | Assign equipment to a load | useAssignEquipment() |
| 10 | GET | /api/carriers?status=ACTIVE | Fetch active carriers for carrier filter dropdown | useActiveCarriers() |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| equipment:{tenantId} | equipment.status.changed | useEquipmentUpdates() -- invalidates equipment list + stats queries |
| equipment:{tenantId} | equipment.location.updated | useEquipmentLocationStream() -- updates location column in-place |
| equipment:{tenantId} | equipment.assigned | useEquipmentAssignment() -- invalidates list + stats |
| carriers:{tenantId} | carrier.status.changed | useCarrierStatusStream() -- dims rows for suspended carriers |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 500 |
|---|---|---|---|---|---|
| GET /api/equipment | Show filter validation error toast | Redirect to login | Show "Access Denied" page | N/A | Show error state with retry button |
| POST /api/equipment | Show field validation errors inline | Redirect to login | Show "Permission Denied" toast | N/A | Show error toast with retry |
| PATCH /api/equipment/:id/status | Show "Invalid status transition" toast | Redirect to login | Show "Permission Denied" toast | Show "Equipment not found" toast | Show error toast with retry |
| POST /api/equipment/:id/assign | Show "Equipment unavailable" toast | Redirect to login | Show "Permission Denied" toast | Show "Equipment not found" toast | Show error toast with retry |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Show 5 skeleton stat cards (gray animated bars). Show 12 skeleton equipment type cards (small rectangles). Show table with 10 skeleton rows matching column widths. Filter bar renders immediately with disabled state.
- **Progressive loading:** Page header and filter bar render instantly. Stats cards load independently (may appear before table). Table skeleton shows until data arrives.
- **Duration threshold:** If loading exceeds 5 seconds, show "Loading fleet data... This is taking longer than usual." message below skeleton.

### Empty States

**First-time empty (no equipment ever added):**
- **Illustration:** Truck silhouette illustration with a plus icon
- **Headline:** "No equipment in your fleet yet"
- **Description:** "Add equipment to your carriers to track fleet capacity and streamline dispatching."
- **CTA Button:** "Add First Equipment" -- primary blue button

**Filtered empty (equipment exists but filters exclude all):**
- **Headline:** "No equipment matches your filters"
- **Description:** "Try adjusting your filters or clearing the search."
- **CTA Button:** "Clear All Filters" -- secondary outline button

**Carrier-specific empty (viewing equipment for a carrier that has none):**
- **Headline:** "[Carrier Name] has no equipment listed"
- **Description:** "Add equipment to this carrier's profile to track their fleet."
- **CTA Button:** "Add Equipment to [Carrier Name]" -- primary blue button

### Error States

**Full page error (API completely fails):**
- **Display:** Error icon + "Unable to load fleet equipment" + "Please try again or contact support if the issue persists." + Retry button

**Per-section error (stats load but table fails):**
- **Display:** Show stats cards normally. Table area shows inline error: "Could not load equipment list" with Retry link. Equipment type cards show cached counts or skeleton.

**Action error (assign to load fails):**
- **Display:** Toast notification: red background, error icon, "Failed to assign equipment. The truck may no longer be available." + dismiss button. Auto-dismiss after 8 seconds.

### Permission Denied

- **Full page denied:** Show "You don't have permission to view fleet equipment" with link back to Carriers dashboard.
- **Partial denied:** Hide GPS location column, utilization column, and action buttons the user cannot access. Do not show disabled versions.

### Offline / Degraded

- **Full offline:** Show banner: "You're offline. Showing cached fleet data from [timestamp]. Equipment availability may have changed."
- **Degraded (WebSocket down, REST works):** Show subtle indicator: "Live updates paused" in page header. GPS locations may be stale. Data still loads on manual refresh.

---

## 12. Filters, Search & Sort

### Filters

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Carrier | Searchable select | All active carriers from /api/carriers | All | ?carrierId= |
| 2 | Equipment Type | Multi-select dropdown | DRY_VAN, REEFER, FLATBED, STEP_DECK, LOWBOY, CONESTOGA, POWER_ONLY, SPRINTER, HOTSHOT, TANKER, HOPPER, CONTAINER | All | ?type=DRY_VAN,REEFER |
| 3 | Status | Multi-select dropdown | AVAILABLE, COMMITTED, OUT_OF_SERVICE, UNKNOWN | All except UNKNOWN | ?status=AVAILABLE,COMMITTED |
| 4 | Region | Multi-select (state grouping) | US states, grouped by region (Northeast, Southeast, Midwest, Southwest, West) | All | ?state=TX,CA,IL |
| 5 | Available Now | Toggle switch | On / Off | Off | ?availableNow=true |
| 6 | Last Inspection | Select dropdown | All, Overdue (>12 months), Expiring Soon (>6 months), Current (<6 months) | All | ?inspection=overdue |

### Search Behavior

- **Search field:** Single search input at left of filter bar
- **Searches across:** Carrier name, unit number, make, model
- **Behavior:** Debounced 300ms, minimum 2 characters, highlights matching text in results
- **URL param:** ?search=

### Sort Options

| Column / Field | Default Direction | Sort Type |
|---|---|---|
| Carrier Name | Ascending (A-Z) | Alphabetic |
| Equipment Type | Custom (DRY_VAN first) | Custom enum order |
| Unit Number | Ascending | Alphanumeric |
| Status | Custom (Available first) | Custom enum order: AVAILABLE, COMMITTED, OUT_OF_SERVICE, UNKNOWN |
| Location | Ascending (A-Z by state) | Alphabetic |
| Last Inspection | Ascending (oldest first -- show overdue first) | Date |
| Utilization Rate | Descending (highest first) | Numeric |

**Default sort:** Status custom order (Available first), then Carrier Name ascending

### Saved Filters / Presets

- **System presets:** "All Available", "Reefers Only", "Out of Service", "Overdue Inspections", "My Preferred Carriers' Equipment"
- **User-created presets:** Users can save current filter combination with a custom name. Stored per-user.
- **URL sync:** All filter state reflected in URL query params so views can be shared via link.

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Sidebar collapses to icon-only mode
- Stats cards: stack into 2 rows of 3 and 2 cards
- Equipment type cards: horizontal scroll with visible scroll indicators
- Table columns: hide Utilization, Last Inspection, Year/Make/Model; show behind "more" expand on row
- Filter bar: collapse to "Filters" button opening a slide-over panel
- Actions menu remains accessible via row-level "..." button

### Mobile (< 768px)

- Sidebar hidden entirely -- accessible via hamburger menu
- Stats cards: vertical stack, 1 per row, compact format
- Equipment type cards: horizontal swipe carousel, 2.5 visible at a time
- Data table switches to card-based list view (one card per equipment):
  - Card shows: equipment type icon + label, carrier name, status badge, location
  - Tap card to expand: unit number, current load, inspection date, utilization
  - Swipe left on card for quick actions (assign, view carrier)
- Filters: full-screen filter modal triggered by filter icon in sticky header
- Sticky bottom bar with "Available Now" toggle for quick filtering
- Pull-to-refresh for data reload

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full layout as designed in Section 3 |
| Desktop | 1024px - 1439px | Slightly narrower stats cards, table may need horizontal scroll for all columns |
| Tablet | 768px - 1023px | See tablet notes above |
| Mobile | < 768px | See mobile notes above |

---

## 14. Stitch Prompt

```
Design a fleet equipment management list page for a modern freight/logistics TMS (Transportation Management System) called "Ultra TMS."

Layout: Full-width page with a dark slate-900 sidebar on the left (240px, collapsed to 64px icon-only on smaller screens), white content area on the right. Top of content area has a page header with breadcrumb "Carriers > Equipment", title "Fleet Equipment", and two action buttons on the right: a secondary outlined "Export CSV" button with a download icon and a primary blue "Add Equipment" button with a plus icon.

Stats Row: Below the header, show a row of 5 equal-width KPI stat cards with white backgrounds, rounded-lg borders, subtle shadow-sm. Cards display: "Total Units: 847" (truck icon), "Trucks: 312" (truck icon), "Trailers: 535" (trailer icon), "Available: 423 (49.9%)" (green check icon), "Committed: 389 (46.0%)" (blue clock icon). Each card has a small trend indicator showing month-over-month change.

Equipment Type Cards: Below the stats, show a horizontally scrollable row of 12 compact cards, one per equipment type. Each card is about 120px wide with: a colored icon on the left (van icon for Dry Van in blue, snowflake for Reefer in cyan, flatbed silhouette for Flatbed in amber, etc.), the type name, and two numbers: total count and available count. The selected/active card has a blue-600 left border. Cards: Dry Van (234/112), Reefer (189/87), Flatbed (87/42), Step Deck (45/18), Lowboy (23/8), Conestoga (34/15), Power Only (67/33), Sprinter (56/28), Hotshot (29/14), Tanker (31/19), Hopper (22/11), Container (30/16).

Filter Bar: Below the type cards, a filter bar with: a search input with magnifying glass icon (placeholder: "Search carrier, unit #..."), a "Carrier" select dropdown, an "Equipment Type" multi-select, a "Status" multi-select, a "Region" multi-select, a toggle switch labeled "Available Now" in green when active, and a "Clear Filters" text link. All filter controls use rounded-md borders with slate-200 borders.

Data Table: Below filters, a data table with columns: checkbox for selection, Carrier Name (clickable blue link with small tier badge -- gold star, silver medal, etc.), Equipment Type (colored icon + text, e.g., blue container icon + "Dry Van"), Unit # (monospace text), Year/Make/Model, Status (colored pill badge -- green "Available", blue "Committed", red "Out of Service"), Location (city, state with small map pin icon), Current Load (monospace link or "--"), Last Inspection (date, red text if overdue), Utilization (small horizontal progress bar with percentage).

Show 8 rows of realistic freight data:
- Row 1: Swift Transport (Gold), Dry Van, T-4421, 2022 Freightliner Cascadia, Available, Dallas TX, --, 01/15/2026, 78%
- Row 2: Alpine Carriers (Platinum), Reefer, R-1187, 2023 Utility 3000R, Committed, Chicago IL, FM-2026-0847, 12/20/2025, 92%
- Row 3: Midwest Haulers (Silver), Flatbed, F-0034, 2021 Great Dane, Available, Memphis TN, --, 08/14/2025 (red - overdue), 65%
- Row 4: Pacific Logistics (Gold), Step Deck, SD-112, 2022 Fontaine, Committed, Los Angeles CA, FM-2026-0912, 11/30/2025, 88%
- Row 5: Northeast Express (Bronze), Reefer, R-2256, 2020 Wabash, Out of Service, Newark NJ, --, 03/01/2025 (red), 34%
- Row 6: Lone Star Freight (Silver), Dry Van, V-7789, 2023 Hyundai Translead, Available, Houston TX, --, 01/02/2026, 71%
- Row 7: Great Plains LLC (Gold), Hopper, H-0045, 2021 Travis, Available, Omaha NE, --, 09/15/2025, 55%
- Row 8: Summit Trucking (Platinum), Power Only, PO-331, --, Committed, Atlanta GA, FM-2026-0901, N/A, 95%

Pagination at bottom: "Showing 1-25 of 847" with page number buttons.

Design Specifications:
- Font: Inter, 14px base size
- Sidebar: slate-900 background, white text, blue-600 active indicator
- Content background: white (#FFFFFF)
- Primary color: blue-600 for buttons and links
- Status badges: green for Available, blue for Committed, red for Out of Service, gray for Unknown
- Equipment type icons use their assigned colors from the design system (blue for Dry Van, cyan for Reefer, amber for Flatbed, etc.)
- Table rows: subtle hover state with gray-50 background, 44px row height
- Cards: white background, rounded-lg border, subtle shadow-sm
- Modern SaaS aesthetic similar to Linear.app or Vercel dashboard
- Include checkbox column for bulk selection
- Utilization bars: green >75%, amber 40-75%, red <40%
```

---

## 15. Enhancement Opportunities

### Current State (Wave 3)

**What's built and working:**
- [ ] Nothing built yet -- screen is in design phase

**What needs polish / bug fixes:**
- N/A (not yet built)

**What to add this wave:**
- [ ] Basic equipment list with pagination, sorting, and filtering
- [ ] Stats cards with aggregate counts
- [ ] Equipment type visual cards as interactive filters
- [ ] "Available Now" toggle filter
- [ ] Row-level actions (view details, assign to load)
- [ ] Export to CSV

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Equipment list with type cards | High | Medium | P0 |
| Stats cards with availability metrics | High | Low | P0 |
| "Available Now" quick filter | High | Low | P0 |
| Assign to Load from row action | High | Medium | P0 |
| Equipment heatmap (geographic view) | High | High | P1 |
| Capacity planning mode (bar charts) | Medium | High | P1 |
| "Find nearest available" tool | High | High | P1 |
| Utilization sparkline trends | Medium | Medium | P2 |
| Real-time GPS location refresh | Medium | High | P2 |

### Future Wave Preview

- **Wave 4:** Add equipment heatmap with Mapbox integration, capacity planning split view with projected availability charts, "find nearest available" proximity search tool.
- **Wave 5:** AI-powered equipment recommendation engine that suggests optimal carrier/equipment for a load based on proximity, utilization history, carrier performance score, and rate competitiveness. ELD integration for live GPS tracking of all connected equipment.

---
