# Rate Table Editor -- Edit Rate Tables with Lane Entries

> Service: Sales (03) | Wave: 1 | Priority: P1
> Route: /sales/rate-tables/:id/edit (edit) | /sales/rate-tables/new (create) | Status: Not Started
> Primary Personas: Sales Manager, Admin
> Roles with Access: super_admin, admin, sales_manager

---

## 1. Purpose & Business Context

**What this screen does:**
The Rate Table Editor is the form screen for creating and editing rate tables -- the structured pricing data that powers the Quote Builder's automatic rate calculation. It presents a spreadsheet-like grid of lane entries where each row defines the pricing for a specific origin-destination-equipment combination. Users can manually add lanes, bulk import from CSV, bulk edit multiple lanes at once, compare their rates against market data, and manage version history with effective date ranges.

**Business problem it solves:**
Rate table maintenance is the most tedious and error-prone task in freight sales operations. A single rate table can contain 50-200 lane entries, each with origin zone, destination zone, per-mile rate, flat rate, minimum charge, and equipment specifications. Manually entering these in a spreadsheet, then manually cross-referencing with market rates, then manually checking for gaps or overlaps in coverage, consumes 2-4 hours per rate table update. The Rate Table Editor reduces this to 15-30 minutes through bulk import, inline editing, market rate comparison columns, validation, and conflict detection.

**Key business rules:**
- Rate table names must be unique within the tenant.
- Effective date ranges (valid_from, valid_to) are required for activation. Draft tables can exist without dates.
- Lane entries cannot have overlapping origin-destination-equipment combinations within the same rate table. The system validates on save.
- Per-mile rates must be positive numbers. Flat rates and minimum charges must be >= 0.
- The market rate comparison column is read-only and fetches data from DAT/Truckstop for each lane when the user clicks "Refresh Market Rates."
- CSV import supports a defined template format. Invalid rows are flagged with errors and can be corrected inline.
- Version history tracks every save with the user who saved, timestamp, and a summary of changes (lanes added, modified, removed).
- Rate tables can be scoped to: (a) a specific customer, (b) a specific equipment type, (c) both, or (d) global (all customers, all equipment). Scope determines priority in rate calculation.
- Saving a rate table that is currently ACTIVE immediately affects future quote calculations. A confirmation dialog warns the user.

**Success metric:**
Rate table creation time drops from 2-4 hours (spreadsheet) to under 30 minutes. CSV import handles 200+ lanes in under 10 seconds. Zero duplicate lane entries through real-time validation. Market rate comparison available for 95% of lane entries.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Rate Tables List | Clicks rate table name or "Edit" action | rateTableId |
| Rate Tables List | Clicks "+ New Rate Table" button | None (blank form) |
| Rate Tables List | Clicks "Clone" action | ?cloneFrom=RT-XXX (pre-fills all data) |
| Direct URL | Bookmark / shared link | rateTableId in route |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Rate Tables List | Clicks "Save" or "Cancel" / breadcrumb | None (returns to list) |
| Lane Pricing | Clicks "View Lane Pricing" for a specific lane entry | ?origin=&destination=&equipment= |
| Customer Detail (CRM) | Clicks customer name link | customerId |

**Primary trigger:**
The Sales Manager receives a notification that the "Acme Manufacturing 2026 Contract" rate table is expiring in 30 days. She opens the Rate Tables list, clones the expiring table, opens the new clone in the Rate Table Editor, adjusts the effective dates for the next year, bulk-selects all lanes, increases rates by 3.5% using the bulk edit tool, reviews the market rate comparison to ensure competitiveness, and saves. She then activates the new table, which auto-deactivates the expiring one.

**Success criteria (user completes the screen when):**
- User has defined the rate table metadata (name, scope, effective dates).
- User has entered or imported all lane entries with valid rates.
- User has reviewed the lane grid and resolved any validation errors.
- User has saved the rate table (as draft or active).

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------------+
|  Breadcrumb: Sales > Rate Tables > Acme Mfg 2026 Contract              |
|                                                                        |
|  Rate Table: Acme Mfg 2026 Contract  [ACTIVE] badge                   |
|                          [Cancel] [Save Draft] [Save & Activate] (blue)|
+------------------------------------------------------------------------+
|                                                                        |
|  === RATE TABLE METADATA ===                                           |
|  +------------------------------------------------------------------+  |
|  | Name *                    | Customer                              |  |
|  | [Acme Mfg 2026 Contract] | [Acme Manufacturing v]                |  |
|  | Equipment Type            | Service Type                          |  |
|  | [All Equipment v]         | [FTL v]                               |  |
|  | Valid From *     Valid To *       | Priority                       |  |
|  | [Jan 01, 2026]   [Dec 31, 2026]  | [Customer-Specific]           |  |
|  | Description                                                        |  |
|  | [Annual contract rates for Acme Manufacturing, all equipment...]   |  |
|  +------------------------------------------------------------------+  |
|                                                                        |
|  === LANE ENTRIES === (48 lanes)                                       |
|  +------------------------------------------------------------------+  |
|  | [Import CSV] [+ Add Lane] [Bulk Edit (3)] [Refresh Market Rates]  |  |
|  +------------------------------------------------------------------+  |
|  |  [x]| Origin     | Dest       | Equip | $/Mile | Flat   | Min   |  |
|  |     |            |            |       |        | Rate   | Charge|  |
|  |     |            |            |       |        |        |       |  |
|  |     | Mkt Rate   |            |       |        |        |       |  |
|  |-----|------------|------------|-------|--------|--------|-------|  |
|  | [ ] | Chicago IL | Dallas TX  | DV    | $2.48  |        | $500  |  |
|  |     | Mkt: $2.35 |            |       | +5.5%  |        |       |  |
|  |-----|------------|------------|-------|--------|--------|-------|  |
|  | [ ] | Chicago IL | Atlanta GA | DV    | $2.22  |        | $600  |  |
|  |     | Mkt: $2.18 |            |       | +1.8%  |        |       |  |
|  |-----|------------|------------|-------|--------|--------|-------|  |
|  | [ ] | LA CA      | Phoenix AZ | RF    |        | $1,875 | $800  |  |
|  |     | Mkt: $1,920|            |       | -2.3%  |        |       |  |
|  |-----|------------|------------|-------|--------|--------|-------|  |
|  | [x] | Dallas TX  | Memphis TN | DV    | $2.65  |        | $450  |  |
|  |     | Mkt: $2.50 |            |       | +6.0%  |        |       |  |
|  |-----|------------|------------|-------|--------|--------|-------|  |
|  |  ... 44 more rows ...                                             |  |
|  +------------------------------------------------------------------+  |
|  |  Selected: 1 | Showing 1-25 of 48    [< Prev] [1][2] [Next >]    |  |
|  +------------------------------------------------------------------+  |
|                                                                        |
|  === VERSION HISTORY ===  (collapsible)                                |
|  +------------------------------------------------------------------+  |
|  | v3 | Feb 05 2026 | Sarah M. | +2 lanes, modified 5 rates         |  |
|  | v2 | Jan 15 2026 | Sarah M. | Bulk import 48 lanes from CSV       |  |
|  | v1 | Jan 02 2026 | Admin    | Created, 0 lanes                    |  |
|  +------------------------------------------------------------------+  |
|                                                                        |
|  +------------------------------------------------------------------+  |
|  | [Cancel]          [Save Draft]  [Save & Activate] (primary blue) |  |
|  +------------------------------------------------------------------+  |
+------------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible, above the fold) | Rate table name, status, customer scope, effective dates, action buttons | Manager needs context and controls visible at all times |
| **Secondary** (main working area) | Lane entries grid with origin, destination, equipment, rates, and market comparison | The core editing workspace where most time is spent |
| **Tertiary** (below the fold or collapsible) | Version history, description, priority, bulk actions | Reference information and power tools accessed as needed |
| **Hidden** (behind modals or actions) | CSV import dialog, bulk edit dialog, market rate detail per lane, validation error detail | Complex interactions triggered on demand |

---

## 4. Data Fields & Display

### Visible Fields

**Rate Table Metadata Section**

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen | Required |
|---|---|---|---|---|---|
| 1 | Name | RateTable.name | Text input, max 100 chars | Metadata row 1, left | Yes |
| 2 | Customer | RateTable.companyId | Searchable select or "All Customers" | Metadata row 1, right | No (null = global) |
| 3 | Equipment Type | RateTable.equipmentType | Select: ALL, DRY_VAN, REEFER, FLATBED, STEP_DECK, POWER_ONLY | Metadata row 2, left | Yes |
| 4 | Service Type | RateTable.serviceType | Select: FTL, LTL, ALL | Metadata row 2, right | Yes |
| 5 | Valid From | RateTable.validFrom | Date picker | Metadata row 3, left | Yes (for activation) |
| 6 | Valid To | RateTable.validTo | Date picker | Metadata row 3, center | Yes (for activation) |
| 7 | Priority | Derived from scope | Read-only: "Global", "Equipment-Specific", "Customer-Specific", "Customer+Equipment" | Metadata row 3, right | Auto |
| 8 | Description | RateTable.description | Textarea, max 500 chars | Metadata row 4, full width | No |

**Lane Entries Grid**

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen | Required |
|---|---|---|---|---|---|
| 9 | Select Checkbox | N/A (UI control) | Checkbox for bulk operations | Grid column 1 | N/A |
| 10 | Origin | RateTableEntry.originCity + originState | City/state autocomplete, "City, ST" display | Grid column 2 | Yes |
| 11 | Destination | RateTableEntry.destCity + destState | City/state autocomplete, "City, ST" display | Grid column 3 | Yes |
| 12 | Equipment | RateTableEntry.equipmentType | Select or inherited from table | Grid column 4 | Conditional |
| 13 | Rate Per Mile | RateTableEntry.ratePerMile | Currency input "$X.XX", right-aligned | Grid column 5 | One of RPM or Flat |
| 14 | Flat Rate | RateTableEntry.flatRate | Currency input "$X,XXX", right-aligned | Grid column 6 | One of RPM or Flat |
| 15 | Minimum Charge | RateTableEntry.minimumCharge | Currency input "$XXX", right-aligned | Grid column 7 | No |
| 16 | Market Rate | External / cached | "$X.XX/mi" or "$X,XXX flat" in read-only gray | Below rate per mile | Display only |
| 17 | Market Variance | Calculated | "+X.X%" or "-X.X%" color-coded (green if above, red if below) | Next to market rate | Display only |
| 18 | Row Actions | N/A | Edit pencil, delete trash icons | Grid column 8 | N/A |

**Version History Section**

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 19 | Version Number | RateTableVersion.version | "v1", "v2", etc. | Version history row, left |
| 20 | Saved Date | RateTableVersion.createdAt | "MMM DD, YYYY" | Version history row |
| 21 | Saved By | User.name | "First L." format | Version history row |
| 22 | Change Summary | RateTableVersion.changeSummary | "+X lanes, modified Y rates, removed Z lanes" | Version history row, right |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Priority | If customerId AND equipmentType: "Customer+Equipment". If customerId: "Customer-Specific". If equipmentType: "Equipment-Specific". Else: "Global" | Tag badge |
| 2 | Market Variance | (ratePerMile - marketRateAvg) / marketRateAvg * 100 | Percentage, color-coded |
| 3 | Lane Count | COUNT(entries) | "XX lanes" |
| 4 | Coverage Gaps | Analysis of origin/destination pairs that have no entry | List of gap pairs in validation panel |
| 5 | Duplicate Lanes | Entries with same origin+destination+equipment within this table | Highlighted rows with warning |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] Rate table metadata form (name, customer, equipment, service type, dates, description)
- [ ] Editable lane entry grid with inline editing (click cell to edit)
- [ ] Add single lane entry via "+" button or empty bottom row
- [ ] Delete lane entry with confirmation (single or bulk)
- [ ] Origin and destination city/state autocomplete
- [ ] Rate per mile and/or flat rate entry (at least one required per lane)
- [ ] Minimum charge per lane
- [ ] Market rate comparison column (DAT/Truckstop data, fetched on demand)
- [ ] Market variance percentage display (color-coded above/below market)
- [ ] Bulk import from CSV with template download
- [ ] CSV import validation with error display and inline correction
- [ ] Bulk select lanes with checkbox column
- [ ] Bulk edit selected lanes (adjust rate by percentage or flat amount)
- [ ] Save as Draft / Save & Activate actions
- [ ] Validation: no duplicate lanes, no missing rates, positive numbers only
- [ ] Version history with change summaries
- [ ] Effective date range with date pickers
- [ ] Conflict warning when saving an active table

### Advanced Features (Logistics Expert Recommendations)

- [ ] Bulk rate adjustment: select lanes, apply "+X%" or "+$X.XX" across all selected
- [ ] CSV export of current lane entries
- [ ] Copy lanes from another rate table (lane cherry-picking)
- [ ] Lane coverage analysis: visual map or matrix showing covered origin/destination pairs
- [ ] Rate table diff: compare current version with a previous version
- [ ] Market rate auto-fill: one-click fill all empty rates with market average
- [ ] Rate table templates: start from a template (e.g., "National Dry Van Coverage")
- [ ] Keyboard-first editing: Tab between cells, Enter to confirm, Escape to cancel
- [ ] Undo/Redo for lane edits (client-side)
- [ ] Column resizing and reordering
- [ ] Freeze header row on scroll
- [ ] Conditional formatting: highlight lanes where rate is >20% above or below market
- [ ] Notes per lane entry (internal notes visible on hover)

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| Edit rate table | sales_manager, admin | rate_table_manage | Redirect to read-only view |
| Import CSV | sales_manager, admin | rate_table_manage | Import button hidden |
| Activate rate table | sales_manager, admin | rate_table_manage | "Save & Activate" button hidden |
| Delete lane entries | sales_manager, admin | rate_table_manage | Delete icons hidden |
| View market rates | sales_manager, admin | market_rates_view | Market rate column hidden |
| View version history | any authenticated | rate_table_view | Always visible |

---

## 6. Status & State Machine

### Status Transitions (from this screen)

```
[New Form] ---(Save Draft)----> [DRAFT]
    |                              |
    |---(Save & Activate)-------> [ACTIVE]
    |
[Edit Form] ---(Save)---------> [same status preserved]
    |
    |---(Save & Activate)-------> [ACTIVE] (if was DRAFT or INACTIVE)
```

The Rate Table Editor does not handle deactivation or expiration -- those are managed from the Rate Tables List screen. The editor focuses on content editing and activation.

### Actions Available Per Context

| Context | Available Actions | Restricted Actions |
|---|---|---|
| New Rate Table | Save Draft, Save & Activate, Cancel | N/A |
| Edit DRAFT | Save, Save & Activate, Cancel | N/A |
| Edit ACTIVE | Save (warning: affects live quotes), Cancel | Delete (must deactivate first) |
| Edit INACTIVE | Save, Save & Activate, Cancel | N/A |
| Edit EXPIRED | Save as Draft (resets to DRAFT), Cancel | Activate (must update dates first) |

### Status Badge Colors

Same as Rate Tables List (Section 6 of 05-rate-tables.md).

| Status | Tailwind Classes |
|---|---|
| DRAFT | `bg-gray-100 text-gray-700 border-gray-300` |
| ACTIVE | `bg-green-100 text-green-800 border-green-300` |
| INACTIVE | `bg-blue-100 text-blue-800 border-blue-300` |
| EXPIRED | `bg-amber-100 text-amber-800 border-amber-300` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Sticky Header + Footer)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| Cancel | X | Ghost / text | Navigate back to Rate Tables List. If unsaved changes: "Discard changes?" dialog. | Yes (if unsaved) |
| Save Draft | Save | Secondary / Outline | Save rate table with current status (DRAFT if new). Stay on page. | No |
| Save & Activate | ToggleRight | Primary / Blue | Save and set status to ACTIVE. Warns about conflicts and live quote impact. | Yes -- "This will activate the rate table and affect future quote calculations. Continue?" |

### Secondary Actions (Lane Grid Toolbar)

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| + Add Lane | Plus | Inserts new blank row at bottom of grid | Always |
| Import CSV | Upload | Opens CSV import dialog | No unsaved import pending |
| Download Template | Download | Downloads blank CSV template with correct column headers | Always |
| Bulk Edit | Pencil | Opens bulk edit dialog for selected lanes | 1+ lanes selected |
| Refresh Market Rates | RefreshCw | Fetches latest market rates for all lanes | At least 1 lane exists |
| Export Lanes | Download | Downloads current lanes as CSV | At least 1 lane exists |
| Delete Selected | Trash | Deletes selected lanes | 1+ lanes selected |

### Per-Row Actions

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| Edit | Pencil | Enters inline edit mode for this row | Always |
| Duplicate | Copy | Copies this row as a new entry (for creating similar lanes) | Always |
| Delete | Trash | Removes this lane entry (with undo option) | Always |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + S | Save (draft or current status) |
| Ctrl/Cmd + Enter | Save & Activate |
| Ctrl/Cmd + I | Open CSV import dialog |
| Tab | Move to next cell in grid |
| Shift + Tab | Move to previous cell in grid |
| Enter | Confirm current cell edit, move to next row |
| Escape | Cancel current cell edit or close modal |
| Ctrl/Cmd + Z | Undo last change (client-side) |
| Ctrl/Cmd + Shift + Z | Redo last undone change |
| Ctrl/Cmd + A | Select all lanes |
| Delete | Delete selected lanes (with confirmation) |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| CSV file | Lane grid area | Triggers CSV import process |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| N/A | N/A | Rate Table Editor is a static form. No real-time push updates. |

### Live Update Behavior

- **Update frequency:** Data loads once on page load. No auto-refresh during editing.
- **Market rate fetch:** On-demand only (user clicks "Refresh Market Rates"). Results cached for 1 hour.
- **Concurrent edit detection:** On save, API checks `updatedAt` timestamp. If another user modified the table since this user loaded it, show conflict dialog: "This rate table was modified by [user] at [time]. Overwrite their changes or reload?"
- **Auto-save:** No auto-save for rate table editor (too risky to auto-save pricing data). Explicit save only.

### Polling Fallback

- **When:** N/A -- static form
- **Interval:** N/A
- **Endpoint:** N/A

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Add lane | Immediately add blank row to grid | Remove row, show error toast |
| Delete lane | Immediately remove row with fade animation | Restore row, show error toast |
| Save | Show "Saving..." spinner on button, then "Saved" confirmation | Show error toast with specific validation errors |
| Import CSV | Show progress bar during processing | Show error dialog with row-level errors |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| PageHeader | src/components/layout/page-header.tsx | title: "Edit Rate Table" or "New Rate Table", breadcrumbs, actions |
| SearchableSelect | src/components/ui/searchable-select.tsx | Customer search, equipment type select |
| Button | src/components/ui/button.tsx | All action buttons |
| Card | src/components/ui/card.tsx | Metadata section, version history section |
| Input | src/components/ui/input.tsx | All text inputs |
| Select | src/components/ui/select.tsx | Equipment type, service type, rate source |
| Calendar | src/components/ui/calendar.tsx + popover.tsx | Effective date pickers |
| Textarea | src/components/ui/textarea.tsx | Description field |
| StatusBadge | src/components/ui/status-badge.tsx | Status display in header |
| Checkbox | src/components/ui/checkbox.tsx | Lane selection |
| Dialog | src/components/ui/dialog.tsx | Import, bulk edit, confirmation dialogs |
| AlertDialog | src/components/ui/alert-dialog.tsx | Discard changes, activation confirmation |
| Tooltip | src/components/ui/tooltip.tsx | Market rate details, validation errors |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| Input | Basic text input | Add currency formatting variant for rate inputs ($X.XX and $X,XXX formats) |
| DataTable | Read-only display | Add inline cell editing with click-to-edit, Tab navigation, Enter to confirm |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| RateTableGrid | Spreadsheet-like editable grid with inline editing, Tab navigation, and cell-level validation | High |
| CurrencyCell | Editable table cell with currency formatting, "$" prefix, decimal precision | Medium |
| CityStateCell | Editable table cell with city/state autocomplete dropdown | Medium |
| MarketRateCell | Read-only cell showing market rate value and variance percentage (color-coded) | Small |
| CSVImportDialog | Dialog with file upload, column mapping preview, validation results, and import confirmation | High |
| BulkEditDialog | Dialog for applying rate changes to selected lanes: type (percentage/flat), value, preview of affected lanes | Medium |
| VersionHistoryTimeline | Collapsible section showing version history with change summaries | Medium |
| LaneValidationBanner | Banner showing validation errors/warnings with links to affected rows | Medium |
| ConflictResolutionDialog | Dialog shown when concurrent edits detected: overwrite, reload, or merge options | Medium |
| RateTableMetadataForm | Form section for table-level metadata (name, scope, dates) with inline validation | Medium |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Tabs | tabs | Metadata / Lanes / History section toggle (optional) |
| Collapsible | collapsible | Version history section |
| AlertDialog | alert-dialog | Discard changes, activation confirmation |
| Dialog | dialog | CSV import, bulk edit |
| Progress | progress | CSV import progress bar |
| Separator | separator | Section dividers |
| ScrollArea | scroll-area | Lane grid horizontal scroll |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/v1/rate-tables/:id | Fetch rate table with all entries | useRateTable(rateTableId) |
| 2 | POST | /api/v1/rate-tables | Create new rate table | useCreateRateTable() |
| 3 | PUT | /api/v1/rate-tables/:id | Update rate table (metadata + entries) | useUpdateRateTable() |
| 4 | PATCH | /api/v1/rate-tables/:id/activate | Activate rate table | useActivateRateTable() |
| 5 | POST | /api/v1/rate-tables/:id/entries | Add entry to rate table | useAddRateTableEntry() |
| 6 | PUT | /api/v1/rate-tables/:id/entries/:entryId | Update single entry | useUpdateRateTableEntry() |
| 7 | DELETE | /api/v1/rate-tables/:id/entries/:entryId | Delete single entry | useDeleteRateTableEntry() |
| 8 | POST | /api/v1/rate-tables/:id/import | Import entries from CSV | useImportRateTableEntries() |
| 9 | GET | /api/v1/rate-tables/:id/export | Export entries as CSV | useExportRateTableEntries() |
| 10 | GET | /api/v1/rate-tables/:id/versions | Fetch version history | useRateTableVersions(rateTableId) |
| 11 | GET | /api/v1/quotes/market-rates?origin=&dest=&equipment= | Market rates for a lane | useMarketRates(origin, dest, equipment) |
| 12 | POST | /api/v1/rate-tables/:id/market-rates/bulk | Bulk fetch market rates for all lanes | useBulkMarketRates(rateTableId) |
| 13 | GET | /api/v1/customers?search= | Customer search | useCustomerSearch(query) |
| 14 | POST | /api/v1/rate-tables/:id/clone | Clone rate table | useCloneRateTable() |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| N/A | N/A | No real-time subscriptions -- static form |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 409 | 422 | 500 |
|---|---|---|---|---|---|---|---|
| PUT /api/v1/rate-tables/:id | Show validation toast | Redirect to login | Show "Permission Denied" toast | Show "Rate table not found" page | Show concurrent edit dialog | Show field-level validation errors mapped to grid rows | Show error toast with retry |
| POST /import | Show "Invalid CSV format" with details | Redirect to login | Show "Permission Denied" toast | N/A | N/A | Show row-level import errors in dialog | Show error toast |
| PATCH /activate | Show "Cannot activate" with reason | Redirect to login | Show "Permission Denied" toast | Show "Table not found" toast | Show conflict dialog (another active table) | Show validation errors (missing dates, empty entries) | Show error toast |

---

## 11. States & Edge Cases

### Loading State

- **Initial load (new table):** Metadata form renders immediately with empty fields. Lane grid shows "No lanes yet. Add your first lane or import from CSV."
- **Edit mode:** Show skeleton for metadata form and lane grid. Market rate column shows "---" until manually refreshed.
- **Market rate fetch:** Spinner in each market rate cell with "Loading..." text. Bulk fetch shows progress bar.
- **CSV import:** Progress bar showing "Importing X of Y lanes..." with row count.

### Empty States

**No lane entries:**
- **Illustration:** Spreadsheet/grid illustration
- **Headline:** "No lanes in this rate table"
- **Description:** "Add lanes manually or import from a CSV file to build your pricing table."
- **CTA Buttons:** "Add First Lane" (primary) and "Import CSV" (secondary outline)

**Market rates unavailable:**
- **Display:** Market rate cells show "N/A" in gray text with tooltip: "Market rate data unavailable for this lane."

### Error States

**Validation errors on save:**
- **Display:** Red banner at top: "X validation errors found. Please fix them before saving." Error rows highlighted with red left border. Error icon on specific cells with tooltip showing the error.

**CSV import errors:**
- **Display:** Dialog showing: "Imported X of Y lanes. Z lanes had errors." Table of error rows with line number, error message, and original CSV data. Options: "Import valid rows only" or "Cancel and fix CSV."

**Concurrent edit conflict:**
- **Display:** Dialog: "This rate table was modified by [user] at [time] since you started editing. What would you like to do?" Options: "Overwrite their changes" (destructive), "Reload and lose my changes" (safe), "Cancel" (stay on page).

**Save failure:**
- **Display:** Toast: "Could not save rate table. Please check your connection and try again." Form state preserved.

### Permission Denied

- **Full page denied:** Redirect to Rate Tables List with toast: "You don't have permission to edit rate tables."
- **Read-only view:** All form fields disabled. Lane grid is view-only. Action buttons show "View Mode" indicator.

### Offline / Degraded

- **Full offline:** Banner: "You're offline. Changes cannot be saved. Please reconnect before saving."
- **Market rate API down:** "Market rates unavailable. You can still enter and save rates manually."

---

## 12. Filters, Search & Sort

### Filters

N/A -- form screen. Filtering is done on the Rate Tables List.

### Search Behavior

**Within the lane grid:**
- **Search field:** Optional search bar above the grid to filter displayed lanes
- **Searches across:** Origin city/state, destination city/state
- **Behavior:** Instant filter (client-side, no API call), highlights matching text
- **Purpose:** Quickly find specific lanes in large rate tables (100+ entries)

### Sort Options

**Lane entries grid:**
| Column / Field | Default Direction | Sort Type |
|---|---|---|
| Origin | Ascending (A-Z) | Alphabetic by state, then city |
| Destination | Ascending (A-Z) | Alphabetic by state, then city |
| Equipment | Ascending | Alphabetic |
| Rate Per Mile | Descending (highest first) | Numeric |
| Flat Rate | Descending (highest first) | Numeric |
| Market Variance | Descending (most above market first) | Numeric |

**Default sort:** Origin ascending, then Destination ascending (lane pairs in alphabetical order).

### Saved Filters / Presets

N/A -- form screen.

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Metadata form: 2-column layout collapses to single column for some field pairs
- Lane grid: Horizontal scroll enabled. Freeze origin and destination columns.
- Toolbar buttons: collapse into "Actions" dropdown for less-used actions
- Version history: collapsible section, collapsed by default
- Action buttons: primary actions visible, secondary in overflow

### Mobile (< 768px)

- Metadata form: Single column, all fields full-width
- Lane grid: Switch to card-based view (one card per lane entry)
- Each card shows: Origin -> Destination, Equipment badge, Rate Per Mile, Flat Rate, Market Rate
- Tap card to edit (opens edit modal or inline expand)
- Add lane: floating action button
- CSV import: full-screen dialog
- Action buttons: primary action in sticky bottom bar, secondary in overflow menu
- Version history: hidden behind expandable section
- Market rate column: hidden on mobile, available in expanded card view

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full grid with all columns, metadata form 2-column |
| Desktop | 1024px - 1439px | Same layout, grid may scroll horizontally |
| Tablet | 768px - 1023px | Grid scrolls horizontally, metadata single-column |
| Mobile | < 768px | Card-based lane entries, full-screen modals |

---

## 14. Stitch Prompt

```
Design a rate table editor page for a modern freight/logistics TMS (Transportation Management System) called "Ultra TMS."

Layout: Full-width page with dark slate-900 sidebar (240px). Content area with a page header showing breadcrumb "Sales > Rate Tables > Acme Mfg 2026 Contract". Title "Acme Mfg 2026 Contract" in semibold 20px with a green "ACTIVE" badge next to it. Right side has "Cancel" ghost button, "Save Draft" outline button, and "Save & Activate" blue-600 primary button.

Metadata Section: Below header, a white card with subtle border containing the rate table settings in a 2-column grid:
- Row 1: "Name" field showing "Acme Mfg 2026 Contract" in a text input, "Customer" field showing "Acme Manufacturing" in a searchable select with a green dot
- Row 2: "Equipment Type" select showing "All Equipment", "Service Type" select showing "FTL"
- Row 3: "Valid From" date picker showing "Jan 01, 2026", "Valid To" date picker showing "Dec 31, 2026", and a read-only "Priority" badge showing "Customer-Specific" in blue-100 bg
- Row 4: "Description" textarea showing "Annual contract rates for Acme Manufacturing, all equipment types, FTL service only."

Lane Entries Section: Below metadata, a section header "Lane Entries" with "48 lanes" count badge in gray. Toolbar with 4 buttons: "Import CSV" outline button with upload icon, "+ Add Lane" outline button with plus icon, "Bulk Edit (0)" outline button (disabled, grayed), "Refresh Market Rates" ghost button with refresh icon.

Below toolbar, an editable data grid (spreadsheet-style) with these columns:
- Checkbox column
- Origin column: city/state text
- Destination column: city/state text
- Equipment column: abbreviated badge
- Rate/Mile column: right-aligned currency with editable cells
- Flat Rate column: right-aligned currency (some empty)
- Min Charge column: right-aligned currency
- Market Rate column: read-only gray text showing market average
- Variance column: percentage showing how contract rate compares to market

Show 5 rows of realistic data:
Row 1: Chicago, IL | Dallas, TX | DV | $2.48/mi | -- | $500 | Mkt: $2.35 | +5.5% (green)
Row 2: Chicago, IL | Atlanta, GA | DV | $2.22/mi | -- | $600 | Mkt: $2.18 | +1.8% (green)
Row 3: Los Angeles, CA | Phoenix, AZ | RF | -- | $1,875 | $800 | Mkt: $1,920 | -2.3% (red)
Row 4: Dallas, TX | Memphis, TN | DV | $2.65/mi | -- | $450 | Mkt: $2.50 | +6.0% (green)
Row 5: New York, NY | Boston, MA | DV | $3.10/mi | -- | $750 | Mkt: $3.25 | -4.6% (red)

Editable cells have a subtle blue-50 focus ring when selected. The grid has alternating row backgrounds (white and gray-50). Column headers are sticky on vertical scroll.

Version History: Below the grid, a collapsible section "Version History" with 3 entries showing version number, date, author, and change summary in a compact list.

Design Specifications:
- Font: Inter, 14px base, 13px for grid cells, 20px title
- Sidebar: slate-900, "Rate Tables" active with blue-600 indicator
- Content bg: slate-50, cards white with border-slate-200
- Primary: blue-600 for primary button, focus rings
- Grid: white bg, slate-100 alternate rows, slate-200 cell borders, 36px row height
- Editable cells: subtle blue-50 hover, blue-100 focus state, blue-500 focus ring
- Currency values: font-mono, right-aligned, tabular-nums
- Market rate: text-slate-400, font-mono
- Variance colors: green-600 for positive (above market), red-500 for negative (below market)
- Row actions: pencil and trash icons in slate-400, visible on hover
- Modern SaaS aesthetic similar to Airtable or Notion database views
```

---

## 15. Enhancement Opportunities

### Current State (Wave 1)

**What's built and working:**
- Nothing -- screen is Not Started.

**What needs polish / bug fixes:**
- N/A (not yet built)

**What to add this wave:**
- [ ] Metadata form with all fields and validation
- [ ] Editable lane entries grid with inline cell editing
- [ ] Add/delete lane entries
- [ ] City/state autocomplete for origin and destination
- [ ] Currency input formatting for rate fields
- [ ] Market rate comparison column with variance display
- [ ] CSV import with validation and error handling
- [ ] Bulk select with checkbox column
- [ ] Bulk edit dialog (rate adjustment by percentage or flat amount)
- [ ] Save Draft / Save & Activate flows
- [ ] Validation: no duplicate lanes, required fields, positive numbers
- [ ] Effective date picker integration
- [ ] Version history display
- [ ] Concurrent edit detection
- [ ] Activation conflict warning

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Editable lane grid with inline editing | High | High | P0 |
| Metadata form with date pickers | High | Medium | P0 |
| Add/delete lane entries | High | Medium | P0 |
| Save Draft / Save & Activate | High | Medium | P0 |
| Lane validation (duplicates, required fields) | High | Medium | P0 |
| CSV import with validation | High | High | P0 |
| City/state autocomplete | Medium | Medium | P1 |
| Market rate comparison column | High | Medium | P1 |
| Bulk edit dialog | Medium | Medium | P1 |
| Currency input formatting | Medium | Low | P1 |
| Version history display | Medium | Medium | P1 |
| Concurrent edit detection | Medium | Medium | P1 |
| CSV export | Low | Low | P2 |
| Undo/Redo | Low | Medium | P2 |
| Lane coverage analysis | Low | High | P2 |
| Rate table diff between versions | Low | High | P3 |

### Future Wave Preview

- **Wave 2:** AI-powered rate suggestion per lane ("Recommended: $2.42/mi based on 83% win rate for this lane"). Auto-detect lane gaps and suggest additions. Smart CSV column mapping (auto-detect column meanings from header names).
- **Wave 3:** Real-time market rate feed updating the comparison column automatically. Collaborative editing (multiple users editing the same rate table simultaneously). Rate table templates marketplace shared across the platform.

---

<!--
DESIGN NOTES:
1. The Rate Table Editor is the most spreadsheet-like screen in Ultra TMS. Performance is critical -- it must handle 200+ rows without lag.
2. Inline cell editing (click to edit, Tab to next cell, Enter to save) is essential for productivity. This mimics the spreadsheet workflow that users are accustomed to.
3. The market rate comparison column is a key differentiator. It lets managers see at a glance whether their contract rates are competitive without opening a separate tool.
4. CSV import is the primary method for initial rate table population. Most customers will already have rates in spreadsheet format.
5. The concurrent edit detection is important because rate tables are shared resources. Two managers editing the same table simultaneously would cause data loss without this protection.
6. Auto-save is intentionally NOT implemented for this screen. Pricing data changes have immediate financial impact, so all saves must be explicit.
-->
