# Rate Tables -- Pricing Tables List

> Service: Sales (03) | Wave: 1 | Priority: P1
> Route: /sales/rate-tables | Status: Not Started
> Primary Personas: Sales Manager, Admin
> Roles with Access: super_admin, admin, sales_manager, sales_agent (read-only)

---

## 1. Purpose & Business Context

**What this screen does:**
The Rate Tables list is the central management hub for all pricing tables used in the quote calculation engine. It displays every rate table in the system -- customer-specific contract rates, equipment-specific tables, regional pricing tables, and the global default rate table -- in a filterable, sortable list. Sales managers and admins create, clone, activate, deactivate, and export rate tables from this screen.

**Business problem it solves:**
Freight brokerages maintain pricing across hundreds of lanes, dozens of customers, and multiple equipment types. Without a centralized rate table management screen, pricing data lives in spreadsheets, email threads, and the heads of senior sales staff. When a key employee leaves, their pricing knowledge leaves with them. When a customer contract expires, nobody notices until a sales agent quotes the old rate and the brokerage loses money on the load. The Rate Tables list provides visibility into all pricing configurations, their effective date ranges, and their current activation status -- eliminating pricing blind spots and contract expiry surprises.

**Key business rules:**
- Only one rate table per scope (customer + equipment + service type combination) can be ACTIVE at a time. Activating a new table auto-deactivates the conflicting one.
- Rate tables have effective date ranges (valid_from, valid_to). Tables auto-expire when valid_to passes.
- Sales agents have read-only access to rate tables. They can view which tables exist and their lane counts but cannot create, edit, or activate/deactivate.
- Rate table changes require `rate_table_manage` permission (typically sales_manager or admin).
- Cloning a rate table creates a new DRAFT table with all entries copied, new effective dates, and a reference to the source table.
- Deleting a rate table is a soft delete. Active tables cannot be deleted -- they must be deactivated first.
- Rate tables feed the Quote Builder's rate calculation engine. When a sales agent creates a quote, the engine checks for a matching rate table entry (customer > equipment > global priority).

**Success metric:**
Time to identify which rate table applies to a given customer/lane drops from 5-10 minutes (searching spreadsheets) to under 10 seconds. Rate table contract expirations are flagged 30 days in advance, preventing zero expired-rate quotes from being sent.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Sidebar Navigation | Clicks "Rate Tables" under Sales section | None |
| Sales Dashboard | Clicks rate-related metric or link | None |
| Quote Builder | Clicks "View Rate Table" link when contract rate is applied | ?rateTableId=RT-XXX (highlights row) |
| Quote Detail | Clicks rate source "CONTRACT" link | ?rateTableId=RT-XXX |
| Service Overview | Navigates from documentation link | None |
| Direct URL | Bookmark / shared link | Filter params in URL |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Rate Table Editor | Clicks rate table name or "Edit" action | rateTableId |
| Rate Table Editor | Clicks "+ New Rate Table" button | None (blank editor) |
| Rate Table Editor | Clicks "Clone" action on a table | ?cloneFrom=RT-XXX |
| Customer Detail (CRM) | Clicks customer name link in table | customerId |
| Lane Pricing | Clicks "View Lane Pricing" link in navigation | None |

**Primary trigger:**
The Sales Manager opens the Rate Tables list to review which rate tables are approaching expiration. She filters to "Expiring in 30 days" and sees 3 tables that need renewal. She clones each one, updates the effective dates and rates in the editor, and activates the new versions. She also checks that the new customer contract rate table she created last week is active and being used in quotes.

**Success criteria (user completes the screen when):**
- User has reviewed the list of rate tables and their statuses.
- User has identified tables requiring attention (expiring, draft, inactive).
- User has navigated to the editor for the table they need to work on, or performed quick actions (activate, deactivate, clone, export).

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------------+
|  Top Bar: [Sales] > Rate Tables                                         |
|                                         [+ New Rate Table] (primary)    |
+------------------------------------------------------------------------+
|                                                                        |
|  +----------+  +----------+  +-----------+  +----------+              |
|  | Total    |  | Active   |  | Expiring  |  | Draft    |              |
|  | Tables   |  | Tables   |  | in 30d    |  | Tables   |              |
|  |   24     |  |    12    |  |     3     |  |     5    |              |
|  +----------+  +----------+  +-----------+  +----------+              |
|                                                                        |
|  +------------------------------------------------------------------+  |
|  | Filters: [Status v] [Customer v] [Equipment v] [Effective Date v] |  |
|  |          [Search rate table name.......................]           |  |
|  +------------------------------------------------------------------+  |
|                                                                        |
|  +------------------------------------------------------------------+  |
|  | [x] | Name             | Customer       | Equipment | Effective   |  |
|  |     |                  |                |           | Date Range  |  |
|  |-----|------------------|----------------|-----------|-------------|  |
|  | [ ] | Acme Mfg 2026    | Acme Mfg       | All       | Jan 1 -     |  |
|  |     | Contract         |                |           | Dec 31 2026 |  |
|  |     | [ACTIVE] 48 lanes|                |           |  [...]      |  |
|  |-----|------------------|----------------|-----------|-------------|  |
|  | [ ] | Global Dry Van   | All Customers  | Dry Van   | Feb 1 -     |  |
|  |     | Q1 2026          |                |           | Apr 30 2026 |  |
|  |     | [ACTIVE] 120 lns |                |           |  [...]      |  |
|  |-----|------------------|----------------|-----------|-------------|  |
|  | [ ] | Beta Dist Reefer | Beta Dist.     | Reefer    | Jan 15 -    |  |
|  |     | Winter 2026      |                |           | Mar 31 2026 |  |
|  |     | [EXPIRING] 32 ln |                |           |  [...]      |  |
|  |-----|------------------|----------------|-----------|-------------|  |
|  | [ ] | National Flatbed | All Customers  | Flatbed   | -- DRAFT -- |  |
|  |     | Spring 2026      |                |           | Not set     |  |
|  |     | [DRAFT] 85 lanes |                |           |  [...]      |  |
|  +------------------------------------------------------------------+  |
|  |  Selected: 0 | Showing 1-25 of 24     [< Prev] [1] [Next >]      |  |
|  +------------------------------------------------------------------+  |
+------------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible, above the fold) | Rate table name + status badge, customer scope, lane count | Manager needs to identify tables and their status at a glance |
| **Secondary** (visible but less prominent) | Equipment type, effective date range, last modified date | Important context for evaluating table relevance and currency |
| **Tertiary** (available on hover or expand) | Created by, clone source, usage count (how many quotes reference this table) | Operational detail for deeper analysis |
| **Hidden** (behind a click -- editor page) | Individual lane entries, rate values, version history, import/export | Deep detail accessed on the Rate Table Editor page |

---

## 4. Data Fields & Display

### Visible Fields

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Select Checkbox | N/A (UI control) | Checkbox for bulk selection | Table column 1 (far left) |
| 2 | Name | RateTable.name | Text, clickable link to editor, max 40 chars with tooltip | Table column 2 |
| 3 | Status | RateTable.status | Colored badge (see Section 6) | Below name, left |
| 4 | Lane Count | RateTable.laneCount | "XX lanes" in gray text | Below name, right of status |
| 5 | Customer | Company.name or "All Customers" | Text, "All Customers" in italic for global tables | Table column 3 |
| 6 | Equipment Type | RateTable.equipmentType or "All" | Badge: DV, RF, FB, ALL | Table column 4 |
| 7 | Effective Date | RateTable.validFrom | "MMM DD, YYYY" format | Table column 5, line 1 |
| 8 | Expiry Date | RateTable.validTo | "MMM DD, YYYY" format, red if expired or expiring within 30d | Table column 5, line 2 |
| 9 | Last Modified | RateTable.updatedAt | "MMM DD" or "X days ago" | Table column 6 |
| 10 | Modified By | User.name | "First L." format | Below last modified |
| 11 | Actions | N/A (UI controls) | Three-dot menu with contextual actions | Table column 7 (far right) |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Days Until Expiry | validTo - now() | "Expires in X days" or "Expired X days ago" with color coding |
| 2 | Is Expiring Soon | validTo - now() <= 30 days AND status = ACTIVE | Boolean -- shows amber "EXPIRING" badge |
| 3 | Usage Count | COUNT(quotes WHERE rateTableId = this.id) | "Used in X quotes" shown on hover |
| 4 | Has Conflicts | Check for overlapping active tables in same scope | Warning icon if conflicting table exists |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] Paginated data table with 25 rows per page (options: 10, 25, 50, 100)
- [ ] Column sorting on all columns (click header to toggle asc/desc)
- [ ] Status filter (multi-select: ACTIVE, DRAFT, INACTIVE, EXPIRED)
- [ ] Customer filter (searchable select with "All Customers" option for global tables)
- [ ] Equipment type filter (multi-select: ALL, DRY_VAN, REEFER, FLATBED, STEP_DECK, POWER_ONLY)
- [ ] Effective date range filter
- [ ] Text search across rate table name, customer name
- [ ] Status badges with color scheme (Active=green, Draft=gray, Inactive=blue, Expired=amber, Expiring=amber-pulse)
- [ ] Click-through to Rate Table Editor on name click
- [ ] Row actions menu: Edit, Clone, Activate, Deactivate, Export CSV, Delete
- [ ] "+ New Rate Table" primary button in page header
- [ ] 4 summary stat cards (total tables, active, expiring in 30d, draft)
- [ ] Bulk selection with checkbox column
- [ ] URL state sync for all filters

### Advanced Features (Logistics Expert Recommendations)

- [ ] Bulk actions: activate multiple, deactivate multiple, export selected, delete selected drafts
- [ ] "Expiring Soon" quick filter preset (tables expiring within 30 days)
- [ ] Column visibility toggle
- [ ] Inline activation/deactivation toggle per row (switch component)
- [ ] Rate table comparison: select two tables and view side-by-side lane diff
- [ ] Clone with date offset: clone a table and auto-shift all dates by a configurable period
- [ ] Usage analytics: show which rate table is being used most in recent quotes
- [ ] Conflict detection: highlight tables with overlapping scopes and date ranges
- [ ] Calendar view toggle: show rate tables on a timeline/Gantt chart by effective date
- [ ] Auto-renewal reminders: configurable alerts before table expiration

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| View rate tables | any authenticated | rate_table_view | Screen not accessible |
| Create rate table | sales_manager, admin | rate_table_manage | "+ New" button hidden |
| Edit rate table | sales_manager, admin | rate_table_manage | Edit action hidden, view-only |
| Activate/Deactivate | sales_manager, admin | rate_table_manage | Toggle/action hidden |
| Clone rate table | sales_manager, admin | rate_table_manage | Clone action hidden |
| Delete rate table | admin | rate_table_delete | Delete action hidden |
| Export rate table | sales_agent, sales_manager, admin | export_data | Export action hidden |
| Bulk actions | sales_manager, admin | rate_table_manage + bulk_action | Bulk action bar hidden |

---

## 6. Status & State Machine

### Status Transitions

```
[NEW] ---(Save as Draft)----> [DRAFT]
                                |
                          (Activate)
                                |
                                v
                             [ACTIVE] <-----(Reactivate)-------- [INACTIVE]
                                |                                    ^
                                |---(Deactivate)-------------------->|
                                |
                          (Date passes validTo)
                                |
                                v
                            [EXPIRED]
```

### Actions Available Per Status

| Status | Available Actions (Row Menu) | Restricted Actions |
|---|---|---|
| DRAFT | Edit, Clone, Activate, Delete | Deactivate |
| ACTIVE | Edit, Clone, Deactivate, Export | Delete, Activate |
| INACTIVE | Edit, Clone, Activate, Export, Delete | Deactivate |
| EXPIRED | Clone, Export, Delete | Edit, Activate, Deactivate |

### Status Badge Colors

| Status | Background | Text | Border | Tailwind Classes |
|---|---|---|---|---|
| DRAFT | gray-100 | gray-700 | gray-300 | `bg-gray-100 text-gray-700 border-gray-300` |
| ACTIVE | green-100 | green-800 | green-300 | `bg-green-100 text-green-800 border-green-300` |
| INACTIVE | blue-100 | blue-800 | blue-300 | `bg-blue-100 text-blue-800 border-blue-300` |
| EXPIRED | amber-100 | amber-800 | amber-300 | `bg-amber-100 text-amber-800 border-amber-300` |
| EXPIRING | amber-100 | amber-800 | amber-300 | `bg-amber-100 text-amber-800 border-amber-300 animate-pulse` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Top-Right of Page)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| + New Rate Table | Plus | Primary / Blue | Navigate to Rate Table Editor (`/sales/rate-tables/new`) | No |
| Export All | Download | Secondary / Outline | Downloads CSV of all rate tables (metadata, not entries) | No |

### Secondary Actions (Row Dropdown / "More" Menu)

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| Edit | Pencil | Navigate to Rate Table Editor | DRAFT, ACTIVE, or INACTIVE status |
| Clone | Copy | Creates new DRAFT rate table with all entries copied | Any status |
| Activate | ToggleRight | Sets status to ACTIVE. Deactivates conflicting tables. | DRAFT or INACTIVE status |
| Deactivate | ToggleLeft | Sets status to INACTIVE | ACTIVE status |
| Export CSV | Download | Downloads CSV of all lane entries in this rate table | Any status |
| Delete | Trash | Soft-deletes rate table with confirmation | DRAFT, INACTIVE, or EXPIRED status only |

### Bulk Actions (When Multiple Rows Selected)

| Action Label | Action | Confirmation |
|---|---|---|
| Activate Selected | Activates all selected DRAFT/INACTIVE tables (warns about conflicts) | Yes -- "Activate X rate tables? This may deactivate conflicting tables." |
| Deactivate Selected | Deactivates all selected ACTIVE tables | Yes -- "Deactivate X rate tables? Quotes will no longer use these rates." |
| Export Selected | Downloads CSV of selected tables' entries | No |
| Delete Selected | Soft-deletes selected DRAFT/INACTIVE/EXPIRED tables | Yes -- "Delete X rate tables? This cannot be undone." |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + N | Create new rate table |
| Ctrl/Cmd + K | Open global search |
| Ctrl/Cmd + E | Export current view |
| Arrow Up/Down | Navigate table rows |
| Enter | Open selected row in editor |
| Space | Toggle row checkbox selection |
| / | Focus search input |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| N/A | N/A | No drag-drop on this screen |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| N/A | N/A | Rate Tables list is a static screen. No real-time push updates needed. |

### Live Update Behavior

- **Update frequency:** Data loads on page navigation and manual refresh only. Rate tables change infrequently (daily at most).
- **Visual indicator:** None needed for real-time. Standard loading indicators on data fetch.
- **Conflict handling:** If user attempts to activate a table that was already activated by another user since page load, show toast: "This rate table was already activated by [user]."

### Polling Fallback

- **When:** N/A -- static screen
- **Interval:** N/A
- **Endpoint:** N/A

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Activate table | Immediately update status badge to ACTIVE | Revert badge, show error toast |
| Deactivate table | Immediately update status badge to INACTIVE | Revert badge, show error toast |
| Delete table | Fade out row immediately | Restore row, show error toast |
| Clone table | Show "Cloning..." toast, then navigate to editor | Show error toast |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| DataTable | src/components/ui/data-table.tsx | columns, data, pagination, sorting, selection |
| PageHeader | src/components/layout/page-header.tsx | title: "Rate Tables", breadcrumbs, actions |
| FilterBar | src/components/ui/filter-bar.tsx | filters: FilterConfig[] |
| StatsCard | src/components/ui/stats-card.tsx | value, label, icon |
| StatusBadge | src/components/ui/status-badge.tsx | status, size |
| Button | src/components/ui/button.tsx | variants |
| SearchableSelect | src/components/ui/searchable-select.tsx | For customer filter |
| Skeleton | src/components/ui/skeleton.tsx | Loading states |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| DataTable | Basic sort and pagination | Add inline toggle switch for activate/deactivate, expiry countdown display |
| StatusBadge | Generic badges | Add rate-table-specific statuses (ACTIVE, DRAFT, INACTIVE, EXPIRED, EXPIRING) with pulse animation for EXPIRING |
| StatsCard | Basic value display | Add click-to-filter behavior (clicking "Expiring in 30d" filters table) |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| RateTableRow | Custom row showing name + status + lane count compound display | Medium |
| DateRangeDisplay | Shows effective date range with visual bar and expiry countdown | Small |
| ActivationToggle | Inline switch to toggle table active/inactive with confirmation | Small |
| RateTableCloneDialog | Dialog for cloning: new name, new date range, optional date offset | Medium |
| ConflictWarningBadge | Warning icon with tooltip showing conflicting rate tables | Small |
| BulkActionBar | Sticky bar when rows selected showing available bulk actions | Medium |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Checkbox | checkbox | Row selection |
| DropdownMenu | dropdown-menu | Row actions menu |
| AlertDialog | alert-dialog | Delete, activate confirmation |
| Switch | switch | Inline activation toggle |
| Tooltip | tooltip | Expiry countdown, conflict warnings |
| Badge | badge | Status badges, equipment type badges |
| Calendar | calendar + popover | Date range filter |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/v1/rate-tables | List rate tables with pagination and filters | useRateTables(filters, pagination, sort) |
| 2 | POST | /api/v1/rate-tables | Create new rate table | useCreateRateTable() |
| 3 | PATCH | /api/v1/rate-tables/:id/activate | Activate rate table | useActivateRateTable() |
| 4 | PATCH | /api/v1/rate-tables/:id/deactivate | Deactivate rate table | useDeactivateRateTable() |
| 5 | POST | /api/v1/rate-tables/:id/clone | Clone rate table | useCloneRateTable() |
| 6 | DELETE | /api/v1/rate-tables/:id | Soft-delete rate table | useDeleteRateTable() |
| 7 | GET | /api/v1/rate-tables/:id/export | Export rate table entries as CSV | useExportRateTable() |
| 8 | GET | /api/v1/customers?search= | Customer search for filter | useCustomerSearch(query) |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| N/A | N/A | No real-time subscriptions -- static screen |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 409 | 500 |
|---|---|---|---|---|---|---|
| GET /api/v1/rate-tables | Show filter error toast | Redirect to login | Show "Access Denied" page | N/A | N/A | Show error state with retry |
| PATCH /activate | Show validation toast | Redirect to login | Show "Permission Denied" toast | Show "Table not found" toast | Show "Conflicting active table" dialog with resolution options | Show error toast |
| DELETE | Show "Cannot delete active table" toast | Redirect to login | Show "Permission Denied" toast | Show "Table not found" toast | N/A | Show error toast |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Show 4 skeleton stat cards, skeleton filter bar, and table with 6 skeleton rows.
- **Progressive loading:** Page header and filter bar render immediately. Stat cards and table show skeletons until data arrives.
- **Duration threshold:** If loading exceeds 5 seconds, show "This is taking longer than usual..." in the table area.

### Empty States

**First-time empty (no rate tables ever created):**
- **Illustration:** Pricing/table illustration
- **Headline:** "No rate tables yet"
- **Description:** "Create your first rate table to set up contract pricing for your customers. Rate tables feed the quote calculator and ensure consistent pricing across your sales team."
- **CTA Button:** "Create First Rate Table" -- primary blue button

**Filtered empty (data exists but filters exclude all):**
- **Headline:** "No rate tables match your filters"
- **Description:** "Try adjusting your filters or search terms."
- **CTA Button:** "Clear All Filters" -- secondary outline button

### Error States

**Full page error:**
- **Display:** Error icon + "Unable to load rate tables" + Retry button

**Action error (activate fails due to conflict):**
- **Display:** Dialog: "Cannot activate this rate table. Another active table covers the same scope: [table name]. Deactivate it first?" with "Deactivate & Activate" and "Cancel" buttons.

**Action error (delete fails):**
- **Display:** Toast: "Cannot delete an active rate table. Deactivate it first."

### Permission Denied

- **Full page denied:** Show "You don't have permission to view rate tables" with link to Sales Dashboard
- **Partial denied (read-only for agents):** Table displays normally but all action buttons and the "+ New" button are hidden. "View" is the only row action.

### Offline / Degraded

- **Full offline:** Banner: "You're offline. Showing cached data from [timestamp]."
- **Degraded:** All data loads on manual refresh. No special degradation handling needed for static screens.

---

## 12. Filters, Search & Sort

### Filters

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Status | Multi-select dropdown | ACTIVE, DRAFT, INACTIVE, EXPIRED | All | ?status=ACTIVE,DRAFT,INACTIVE,EXPIRED |
| 2 | Customer | Searchable select | From /api/v1/customers + "All Customers (Global)" | All | ?customerId= |
| 3 | Equipment Type | Multi-select | ALL, DRY_VAN, REEFER, FLATBED, STEP_DECK, POWER_ONLY | All | ?equipmentType= |
| 4 | Effective Date | Date range picker | Custom range or presets (Current, Upcoming, Expired) | All | ?dateFrom=&dateTo= |
| 5 | Expiring Within | Select | 7 days, 14 days, 30 days, 60 days, 90 days | None | ?expiringWithin= |

### Search Behavior

- **Search field:** Single search input in the filter bar
- **Searches across:** Rate table name, customer name
- **Behavior:** Debounced 300ms, minimum 2 characters
- **URL param:** ?search=

### Sort Options

| Column / Field | Default Direction | Sort Type |
|---|---|---|
| Name | Ascending (A-Z) | Alphabetic |
| Customer | Ascending (A-Z) | Alphabetic |
| Status | Custom order (ACTIVE, EXPIRING, DRAFT, INACTIVE, EXPIRED) | Custom enum |
| Effective Date | Descending (newest first) | Date |
| Expiry Date | Ascending (soonest first) | Date |
| Lane Count | Descending (most first) | Numeric |
| Last Modified | Descending (newest first) | Date |

**Default sort:** Status (ACTIVE first, then EXPIRING, DRAFT, INACTIVE, EXPIRED), then Expiry Date ascending.

### Saved Filters / Presets

- **System presets:** "Active Tables" (status=ACTIVE), "Expiring Soon" (expiringWithin=30), "Drafts" (status=DRAFT), "Customer Contracts" (customerId is not "all")
- **User-created presets:** Users can save current filter combination with a custom name.
- **URL sync:** All filter state reflected in URL query params.

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Stat cards: 2 per row (2 rows of 2)
- Table columns: Hide last modified, modified by; keep name, status, customer, equipment, date range
- Filter bar: Collapse to "Filters" button that opens a slide-over panel
- Row actions: Keep three-dot menu
- Sidebar collapses to icon-only mode

### Mobile (< 768px)

- Stat cards: 2 per row, compact size
- Table switches to card-based list (one card per rate table)
- Each card shows: name + status badge, customer, equipment badge, date range, lane count
- Tap card to expand showing additional fields
- Filter: Full-screen filter modal
- "+ New Rate Table" in sticky bottom bar
- Swipe left on card for quick actions (edit, clone, delete)
- Pull-to-refresh

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full table with all columns, 4 stat cards in row |
| Desktop | 1024px - 1439px | Same layout, table may scroll horizontally |
| Tablet | 768px - 1023px | Reduced columns, filter slide-over |
| Mobile | < 768px | Card-based list, full-screen filters, sticky bottom action |

---

## 14. Stitch Prompt

```
Design a rate tables list page for a modern freight/logistics TMS (Transportation Management System) called "Ultra TMS."

Layout: Full-width page with dark slate-900 sidebar on the left (240px). White content area on the right. Top of content area has a page header with breadcrumb "Sales > Rate Tables", the title "Rate Tables" in semibold 24px. On the right side of the header, a blue-600 "+ New Rate Table" button with a plus icon.

Stats Row: Below header, 4 stat cards in a horizontal row. White rounded-lg cards with subtle border:
- Card 1: "Total Tables" value "24" with a table icon in slate-400
- Card 2: "Active" value "12" with a green-500 dot indicator
- Card 3: "Expiring in 30d" value "3" with an amber-500 warning icon, the entire card has a subtle amber-50 background to draw attention
- Card 4: "Draft" value "5" with a gray-400 pencil icon

Filter Bar: Below stats, a white card containing filter controls in a single row:
- Status multi-select showing "All Statuses" with count badge
- Customer searchable dropdown showing "All Customers"
- Equipment Type dropdown showing "All Equipment"
- Date range picker showing "All Dates"
- Search input with magnifying glass icon and placeholder "Search rate tables..."

Data Table: Below filters, a white card containing a data table with these columns:
- Checkbox column (unchecked)
- Name column: showing "Acme Mfg 2026 Contract" in font-medium text-blue-600 link, with a green "ACTIVE" badge and "48 lanes" in gray text-sm on a second line
- Customer column: "Acme Manufacturing" in dark text
- Equipment column: "All" badge in gray-100
- Effective Date column: "Jan 01, 2026" on first line, "Dec 31, 2026" on second line with a right-arrow between them, "329 days left" in green-600 text-xs
- Last Modified column: "Feb 03" in gray text, "Sarah M." in gray text-sm below
- Actions column: three-dot icon button

Show 5 rows of realistic data:
Row 1: Acme Mfg 2026 Contract | Acme Manufacturing | All | Jan 01 - Dec 31 2026 | ACTIVE (green) | 48 lanes
Row 2: Global Dry Van Q1 2026 | All Customers | Dry Van | Feb 01 - Apr 30 2026 | ACTIVE (green) | 120 lanes
Row 3: Beta Distribution Reefer | Beta Distribution | Reefer | Jan 15 - Mar 31 2026 | EXPIRING (amber, subtle pulse) | 32 lanes
Row 4: National Flatbed Spring | All Customers | Flatbed | -- Draft -- | DRAFT (gray) | 85 lanes
Row 5: Omega Logistics 2025 | Omega Logistics | All | Jan 01 - Dec 31 2025 | EXPIRED (amber) | 56 lanes

Table rows have subtle gray-50 hover state. The "Expiring" row has a very faint amber-50 background to draw attention.

Pagination bar at bottom: "Showing 1-24 of 24" on left, page number buttons on right.

Design Specifications:
- Font: Inter, 14px base, 13px for table body, 24px page title
- Sidebar: slate-900 with "Rate Tables" item active (blue-600 left border, blue-50 bg)
- Content background: slate-50 with white cards
- Primary: blue-600 for links, primary buttons
- Status badges: green-100/green-800 (Active), gray-100/gray-700 (Draft), blue-100/blue-800 (Inactive), amber-100/amber-800 (Expired/Expiring)
- Table: white bg, slate-200 border-b between rows, gray-50 hover
- Name column: text-blue-600, font-medium, cursor-pointer
- Date range: two lines with small right-arrow icon between, remaining days in colored text below
- Expiring row: subtle amber-50 row background
- Modern SaaS aesthetic similar to Linear.app or Stripe Dashboard
```

---

## 15. Enhancement Opportunities

### Current State (Wave 1)

**What's built and working:**
- Nothing -- screen is Not Started.

**What needs polish / bug fixes:**
- N/A (not yet built)

**What to add this wave:**
- [ ] Data table with all columns and pagination
- [ ] Status badges with rate-table-specific colors
- [ ] Filter bar with status, customer, equipment, and date filters
- [ ] Search by name and customer
- [ ] 4 summary stat cards with click-to-filter
- [ ] Row actions: Edit, Clone, Activate, Deactivate, Export, Delete
- [ ] "+ New Rate Table" button navigation
- [ ] Click-through to Rate Table Editor
- [ ] Expiry countdown display with color coding
- [ ] Conflict detection warning on activation
- [ ] Bulk selection with checkbox column
- [ ] URL state sync for filters

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Data table with status and core columns | High | Medium | P0 |
| Filter bar with status and customer filters | High | Medium | P0 |
| Row actions (Edit, Clone, Activate/Deactivate) | High | Medium | P0 |
| Stat cards with click-to-filter | Medium | Low | P0 |
| Expiry countdown and visual warnings | High | Low | P1 |
| Conflict detection on activation | High | Medium | P1 |
| Bulk actions (activate, deactivate, delete) | Medium | Medium | P1 |
| Search with debouncing | Medium | Low | P1 |
| Export CSV per table | Medium | Low | P1 |
| Calendar/timeline view toggle | Low | High | P2 |
| Rate table comparison tool | Low | High | P2 |
| Auto-renewal reminders | Low | Medium | P3 |

### Future Wave Preview

- **Wave 2:** AI-powered rate recommendation ("Suggest rates for this table based on market trends and historical acceptance"). Automated rate table renewal workflow. Version control with diff view between table versions.
- **Wave 3:** Market-rate-aware auto-adjustment (rate tables automatically adjust within configurable bounds when market rates shift). Integration with carrier cost data for margin-aware rate setting. Multi-tenant rate table sharing for 3PL operations.

---

<!--
DESIGN NOTES:
1. Rate Tables is a medium-complexity list screen used primarily by managers and admins.
2. The most important UX feature is the expiry countdown -- managers must be able to spot expiring tables instantly.
3. Activation conflicts are a critical edge case. The UI must clearly communicate what will happen when activating a table that conflicts with an existing active table.
4. Sales agents see this screen in read-only mode. This is intentional -- they need to know which rate tables exist but should not modify pricing without manager oversight.
5. The export feature is important for auditing and for sharing rate data with customers in spreadsheet format.
-->
