# Carriers List

> Service: 05 - Carrier Management | Wave: 3 | Priority: P0
> Route: /(dashboard)/carriers | Status: Built (Partially -- needs enhancements)
> Primary Personas: Omar (Dispatcher), Maria (Dispatcher for carrier search), Sarah (Ops Manager)
> Roles with Access: dispatcher, ops_manager, carrier_admin, admin

---

## 1. Purpose & Business Context

**What this screen does:**
The Carriers List is the master carrier directory for Ultra TMS, providing a comprehensive, filterable, and sortable table of all carriers in the system. It serves as the primary interface for dispatchers to search for carriers when assigning loads, for ops managers to monitor the carrier fleet, and for the compliance team to quickly identify carriers with issues. The list supports both a traditional data table view and an optional card view toggle.

**Business problem it solves:**
Dispatchers like Maria need to find the right carrier for a load in under 60 seconds -- filtering by equipment type, service area, compliance status, and performance score. Without this screen, dispatchers would rely on personal relationships, sticky notes, and phone calls to find carriers, resulting in 15-30 minutes per carrier search and frequently missing the best-fit carrier. For Sarah as ops manager, the list provides fleet-wide visibility into carrier health, enabling proactive management rather than reactive firefighting.

**Key business rules:**
- Only ACTIVE carriers can be assigned to loads from this screen. PENDING, INACTIVE, SUSPENDED, and BLACKLISTED carriers are visible but cannot be selected for dispatch.
- Carriers with expired insurance are visually highlighted with red row background and cannot be dispatched.
- Carriers with insurance expiring within 30 days are highlighted with yellow row background as a warning.
- The FMCSA "Verify" button per row triggers a real-time lookup against the FMCSA SAFER database and updates the carrier's compliance status.
- Preferred carriers (isPreferred=true) can be filtered to the top with a dedicated toggle.
- Tier badges are color-coded per the global status color system: PLATINUM=indigo, GOLD=amber, SILVER=slate, BRONZE=orange, UNQUALIFIED=gray.
- MC# is displayed in monospace font for readability and copy accuracy.

**Success metric:**
Average time for a dispatcher to find and select a carrier for load assignment drops from 15 minutes to under 60 seconds. Carrier search-to-assignment completion rate exceeds 90%.

---

## 2. User Journey Context

**Comes from (entry points):**

| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Sidebar Navigation | Clicks "Carriers" in sidebar | None |
| Carrier Dashboard | Clicks KPI card (Active, Pending, Compliance, etc.) | `?status=ACTIVE`, `?compliance=issues`, etc. |
| Dispatch Board | Clicks "Find Carrier" for a load | `?equipment=DRY_VAN&state=TX` (from load requirements) |
| Load Detail | Clicks "Assign Carrier" action | `?equipment={loadEquipment}&origin={originState}` |
| Compliance Center | Clicks carrier name in compliance issues table | `?compliance=issues` |
| Global Search | Searches for carrier name/MC#/DOT# | `?search={query}` |
| Direct URL | Bookmark / shared link | Route params + query params |

**Goes to (exit points):**

| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Carrier Detail | Clicks carrier name or row | `carrierId` |
| Carrier Onboarding | Clicks "Add Carrier" button | None (or MC# if entered in quick-add field) |
| Compliance Center | Clicks "View Compliance" link in header or filter area | None |
| Load Detail | Selects carrier for assignment (from dispatch context) | `carrierId`, returns to load |

**Primary trigger:**
Maria (dispatcher) opens the Carriers List when she needs to find a carrier for an open load. She filters by equipment type and service area to narrow candidates, then sorts by score to pick the best available carrier.

**Success criteria (user completes the screen when):**
- Dispatcher has found a qualified, compliant carrier matching the load requirements.
- Ops manager has reviewed the carrier fleet status and identified any carriers needing attention.
- User has completed any needed bulk actions (status updates, notifications, exports).

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------+
|  Breadcrumb: Carriers                                             |
|  Page Title: Carriers           [+ Add Carrier]  [Export v]       |
+------------------------------------------------------------------+
|  Filter Bar:                                                      |
|  [Search name/MC#/DOT#...] [Status v] [Tier v] [Compliance v]   |
|  [Equipment v] [State v] [Min Score ___]                         |
|  [Preferred Only toggle]  [Clear Filters]  [Table|Card view]    |
+------------------------------------------------------------------+
|  Bulk Actions Bar (shown when rows selected):                     |
|  [X selected] [Update Status v] [Send Notification] [Export]     |
+------------------------------------------------------------------+
|  +------------------------------------------------------------+  |
|  | [x] | Carrier Name    | MC#      | DOT#     | Status  |    |  |
|  |     |                 |          |          |         |    |  |
|  |     | Tier   | Equipment | Compliance | Insurance | Trucks|  |  |
|  |     | Loads  | On-Time%  | Rating    | Actions        |    |  |
|  +------------------------------------------------------------+  |
|  |  [ ] | Swift Logistics | MC-12345 | 1234567 | ACTIVE  |    |  |
|  |      | GOLD   | DV,RF    | COMPLIANT | 2026-08-15 | 45 |  |  |
|  |      | 234    | 96.2%    | 4.8 stars | [Verify][...] |  |  |
|  +------------------------------------------------------------+  |
|  |  [ ] | ABC Trucking    | MC-67890 | 7654321 | ACTIVE  |    |  |
|  |      | SILVER | DV       | WARNING   | 2026-03-01 | 12 |  |  |
|  |      | 89     | 91.5%    | 4.2 stars | [Verify][...] |  |  |
|  +------------------------------------------------------------+  |
|  Showing 1-25 of 342 carriers     [< 1 2 3 ... 14 >]            |
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible) | Carrier name, MC#, status badge, tier badge, compliance status, insurance expiry date | Dispatchers need these at a glance to make assignment decisions |
| **Secondary** (visible but less prominent) | Equipment types, truck count, total loads, on-time %, avg rating | Important context for carrier comparison but not the first thing scanned |
| **Tertiary** (visible on wider screens, hidden on smaller) | DOT#, state/region, min score filter, card view | Additional detail for power users and detailed analysis |
| **Hidden** (behind a click) | Full carrier profile, compliance details, insurance documents, load history | Deep detail accessed by clicking through to Carrier Detail |

---

## 4. Data Fields & Display

### Visible Fields

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Checkbox | N/A (selection state) | Checkbox for bulk selection | Table column 1 |
| 2 | Carrier Name | Carrier.legalName + Carrier.dbaName | Legal name in bold, DBA in gray-500 below if different. Clickable blue link. | Table column 2 |
| 3 | MC# | Carrier.mcNumber | Monospace font `font-mono`, prefixed "MC-" (e.g., MC-123456). Copyable on click. | Table column 3 |
| 4 | DOT# | Carrier.dotNumber | Monospace font, plain number (e.g., 1234567). Copyable on click. | Table column 4 |
| 5 | Status | Carrier.status | StatusBadge component: PENDING=gray, ACTIVE=green, INACTIVE=slate, SUSPENDED=amber, BLACKLISTED=red | Table column 5 |
| 6 | Tier | Carrier.tier | TierBadge component: PLATINUM=indigo+Crown icon, GOLD=amber+Award, SILVER=slate+Medal, BRONZE=orange+Shield, UNQUALIFIED=gray+CircleOff | Table column 6 |
| 7 | Equipment Types | Carrier.equipmentTypes | Icon row: DRY_VAN=Container, REEFER=Snowflake, FLATBED=RectangleHorizontal, etc. Max 4 icons, "+N" overflow. Tooltip on hover shows full list. | Table column 7 |
| 8 | Compliance Status | Carrier.complianceStatus (derived) | ComplianceBadge: COMPLIANT=green ShieldCheck, WARNING=amber AlertTriangle, EXPIRING_SOON=orange CalendarClock, EXPIRED=red CalendarX, SUSPENDED=rose ShieldAlert | Table column 8 |
| 9 | Insurance Expiry | MIN(InsuranceCertificates.expiryDate) for required types | Date format MM/DD/YYYY. Color-coded: green text if > 30 days, yellow/amber if 7-30 days, red if expired or < 7 days. | Table column 9 |
| 10 | Truck Count | Carrier.truckCount | Integer (e.g., "45") | Table column 10 |
| 11 | Total Loads | Carrier.totalLoads | Integer (e.g., "234") | Table column 11 |
| 12 | On-Time % | Carrier.onTimeDeliveryPct | Percentage with 1 decimal (e.g., "96.2%"). Color: green >= 95%, yellow 85-94%, red < 85% | Table column 12 |
| 13 | Avg Rating | Carrier.avgRating | Star display (1-5 stars with partial fill). Numeric value tooltip. | Table column 13 |
| 14 | Actions | N/A | Row actions: "Verify" (FMCSA check), "..." menu (View, Edit, Change Status, Assign to Load) | Table column 14 |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Insurance Expiry (earliest) | MIN(expiryDate) FROM InsuranceCertificates WHERE carrierId = :id AND insuranceType IN ('AUTO_LIABILITY', 'CARGO') AND status = 'ACTIVE' | Date with days-remaining tooltip |
| 2 | Compliance Status (aggregate) | Worst status across all compliance items: if any EXPIRED -> EXPIRED, if any EXPIRING_SOON -> EXPIRING_SOON, if any WARNING -> WARNING, else COMPLIANT | Badge per compliance color system |
| 3 | Row Background Color | Based on compliance: COMPLIANT -> default white, WARNING/EXPIRING_SOON -> yellow-50/amber-50 subtle, EXPIRED/SUSPENDED -> red-50 subtle | Row CSS class |
| 4 | Equipment Icons | Map equipmentTypes array to Lucide icons per EQUIPMENT_TYPE color system | Icon array with tooltips |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] Paginated carrier list with configurable page size (25, 50, 100)
- [ ] Status badge display per the global color system (PENDING/ACTIVE/INACTIVE/SUSPENDED/BLACKLISTED)
- [ ] Tier badge display with color coding (PLATINUM/GOLD/SILVER/BRONZE/UNQUALIFIED)
- [ ] Column sorting on all columns (click header to sort ASC/DESC)
- [ ] Search by carrier name, MC#, or DOT# with debounced input (300ms)
- [ ] Filter by status (multi-select)
- [ ] Filter by tier (multi-select)
- [ ] Filter by compliance status (multi-select)
- [ ] Filter by equipment type (multi-select)
- [ ] Filter by state/region (multi-select)
- [ ] Filter by minimum score (number input)
- [ ] Click carrier name to navigate to Carrier Detail
- [ ] "Add Carrier" button navigating to Carrier Onboarding
- [ ] Compliance status badge per carrier showing aggregate compliance health
- [ ] Insurance expiry date with color-coded urgency indicator

### Advanced Features (Logistics Expert Recommendations)

- [ ] Color-coded row backgrounds: green tint for fully compliant, yellow tint for expiring warnings, red tint for expired/suspended
- [ ] Inline FMCSA "Verify" button per row -- triggers real-time FMCSA SAFER lookup and updates compliance status
- [ ] Quick onboard: "Add Carrier" with MC# lookup auto-fill -- enter MC# in the add dialog, auto-populate from FMCSA
- [ ] Bulk actions bar: when rows are selected, show bulk action bar with Update Status, Send Notification, Export Selected
- [ ] "Preferred Carriers" toggle filter -- one-click to show only carriers where isPreferred=true
- [ ] Card view toggle -- switch between table view and card-based grid view showing carrier summary cards
- [ ] MC# and DOT# columns with copy-to-clipboard on click (small copy icon appears on hover)
- [ ] Equipment type icons with color coding per equipment type color system and hover tooltips
- [ ] Star rating display with partial stars (e.g., 4.3 shows 4 filled + 0.3 partial star)
- [ ] URL state sync -- all filters, search, sort, and page are reflected in URL params for shareability
- [ ] Saved filter presets: "My Preferred Carriers", "Compliance Issues", "Available for Flatbed", etc.
- [ ] Export: CSV and Excel with all visible columns
- [ ] Keyboard navigation: arrow keys to move between rows, Enter to open detail

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| View carriers list | dispatcher, ops_manager, admin | carrier_view | Full page access denied |
| "Add Carrier" button | ops_manager, carrier_admin, admin | carrier_create | Button hidden |
| Change carrier status (bulk) | carrier_admin, admin | carrier_status_update | Action hidden from bulk menu |
| Inline FMCSA Verify | ops_manager, carrier_admin, admin | compliance_manage | "Verify" button hidden |
| Export carrier data | dispatcher, ops_manager, admin | export_data | Export button hidden |
| Delete carrier (from row menu) | admin | carrier_delete | Action hidden from row menu |
| View financial data (payment terms) | admin, finance | finance_view | Column hidden |

---

## 6. Status & State Machine

### Status Transitions (Available from List Screen)

```
From Carriers List, users can change status via bulk actions or individual row menu:

[PENDING] ---(Approve)---> [ACTIVE]
[PENDING] ---(Reject)----> [INACTIVE]

[ACTIVE] ---(Deactivate)--> [INACTIVE]
[ACTIVE] ---(Suspend)-----> [SUSPENDED]  (requires reason)
[ACTIVE] ---(Blacklist)----> [BLACKLISTED] (requires reason + confirmation)

[INACTIVE] ---(Reactivate)--> [ACTIVE]  (if compliance is valid)

[SUSPENDED] ---(Reinstate)--> [ACTIVE]  (requires compliance check pass)
[SUSPENDED] ---(Blacklist)---> [BLACKLISTED] (requires reason + confirmation)

[BLACKLISTED] ---(Admin Override)--> [ACTIVE]  (admin only, requires documented reason)
```

### Actions Available Per Status (Row Actions Menu)

| Status | Available Actions | Restricted Actions |
|---|---|---|
| PENDING | View, Edit, Approve, Reject | Assign to Load, Suspend, Blacklist |
| ACTIVE | View, Edit, Verify FMCSA, Assign to Load, Deactivate, Suspend, Blacklist | Approve (already active) |
| INACTIVE | View, Edit, Reactivate | Assign to Load, Verify FMCSA |
| SUSPENDED | View, Edit, Reinstate, Blacklist | Assign to Load, Deactivate |
| BLACKLISTED | View, Admin Override Reactivate | All other actions |

### Status Badge Colors

| Status | Background | Text | Tailwind Classes | Icon |
|---|---|---|---|---|
| PENDING | gray-100 (#F3F4F6) | gray-700 (#374151) | `bg-gray-100 text-gray-700` | Clock |
| ACTIVE | emerald-100 (#D1FAE5) | emerald-800 (#065F46) | `bg-emerald-100 text-emerald-800` | CircleCheckBig |
| INACTIVE | slate-100 (#F1F5F9) | slate-700 (#334155) | `bg-slate-100 text-slate-700` | CircleOff |
| SUSPENDED | amber-100 (#FEF3C7) | amber-800 (#92400E) | `bg-amber-100 text-amber-800` | ShieldAlert |
| BLACKLISTED | red-100 (#FEE2E2) | red-800 (#991B1B) | `bg-red-100 text-red-800` | ShieldX |

---

## 7. Actions & Interactions

### Primary Action Buttons (Top-Right of Page)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| Add Carrier | Plus | Primary / Blue | Navigates to `/carriers/onboard` (or opens MC# quick-lookup dialog) | No |
| Export | Download (ChevronDown) | Secondary / Outline | Opens dropdown: Export CSV, Export Excel | No |

### Secondary Actions (Row "..." Menu)

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| View Profile | Eye | Navigate to Carrier Detail | Always available |
| Edit | Pencil | Navigate to Carrier Detail in edit mode | carrier_edit permission |
| Verify FMCSA | ShieldCheck | Trigger real-time FMCSA lookup for this carrier | ACTIVE or PENDING status, compliance_manage permission |
| Assign to Load | Truck | Open load assignment modal | ACTIVE status only |
| Change Status | ArrowRightLeft | Open status change modal with reason field | carrier_status_update permission |
| Send Notification | Mail | Open compose notification modal (email/SMS) | carrier_communicate permission |
| Mark as Preferred | Star | Toggle isPreferred flag | carrier_edit permission |
| Delete | Trash2 | Soft delete (confirm dialog) | admin + carrier_delete permission, only if no associated loads |

### Bulk Actions (When Multiple Rows Selected)

| Action Label | Action | Confirmation |
|---|---|---|
| Update Status | Opens status change modal for all selected carriers | Yes -- "Update N carriers to [status]?" |
| Send Notification | Opens bulk notification modal (email template selection) | Yes -- "Send [template] to N carriers?" |
| Export Selected | Downloads CSV/Excel of selected rows only | No |
| Mark as Preferred | Toggle preferred flag for all selected | Yes -- "Mark N carriers as preferred?" |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + K | Open global search / command palette |
| Ctrl/Cmd + N | Add new carrier (navigate to onboarding) |
| / | Focus search input |
| Escape | Close modal / deselect all / clear search |
| Arrow Up/Down | Navigate table rows (when table is focused) |
| Enter | Open selected row's carrier detail |
| Space | Toggle row selection checkbox (when row is focused) |

### Drag & Drop

N/A -- No drag-and-drop functionality on the carriers list.

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| carrier.statusChanged | { carrierId, oldStatus, newStatus, updatedBy } | Update status badge on affected row, flash row highlight. If status change causes row to no longer match current filters, fade out and remove row. |
| carrier.complianceChanged | { carrierId, oldCompliance, newCompliance } | Update compliance badge on affected row, update row background color |
| carrier.created | { carrierId, carrierName, status } | If matches current filters, insert new row at appropriate sort position with slide-in animation |
| carrier.tierChanged | { carrierId, oldTier, newTier } | Update tier badge on affected row |
| insurance.expired | { carrierId, insuranceType } | Update insurance expiry column to red, update compliance badge, change row background to red tint |
| insurance.renewed | { carrierId, insuranceType, newExpiryDate } | Update insurance expiry column with new date and green color, update compliance badge |
| carrier.fmcsaVerified | { carrierId, result } | Update compliance badge, show toast with result summary |

### Live Update Behavior

- **Update frequency:** WebSocket push for carrier status, compliance, and insurance changes. No polling needed for the list itself.
- **Visual indicator:** Changed rows flash with a subtle blue highlight that fades over 2 seconds. New rows slide in with a green left-border flash.
- **Conflict handling:** If user has a row action modal open and the carrier's data changes remotely, show inline banner in the modal: "This carrier was updated by [name]. Close and refresh to see changes."

### Polling Fallback

- **When:** WebSocket connection drops
- **Interval:** Every 30 seconds
- **Endpoint:** `GET /api/carriers?updatedSince={lastPollTimestamp}&{currentFilters}`
- **Visual indicator:** Show "Live updates paused -- reconnecting..." banner at top of table

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Change status | Immediately update status badge on row | Revert badge, show error toast "Failed to update carrier status" |
| Toggle preferred | Immediately show/hide star icon | Revert, show error toast |
| FMCSA Verify | Show loading spinner on Verify button | Remove spinner, show error toast "FMCSA verification failed" |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| DataTable | `src/components/ui/data-table.tsx` | columns, data, pagination, sorting, selection |
| PageHeader | `src/components/layout/page-header.tsx` | title: "Carriers", breadcrumbs, actions |
| StatusBadge | `src/components/ui/status-badge.tsx` | status, entity: CARRIER_STATUS |
| FilterBar | `src/components/ui/filter-bar.tsx` | filters: FilterConfig[] |
| Button | `src/components/ui/button.tsx` | Primary and secondary buttons |
| DropdownMenu | `src/components/ui/dropdown-menu.tsx` | Row actions and export menu |
| Badge | `src/components/ui/badge.tsx` | Tier badges, compliance badges |
| Input | `src/components/ui/input.tsx` | Search input, min score input |
| Select | `src/components/ui/select.tsx` | Filter dropdowns |
| Checkbox | `src/components/ui/checkbox.tsx` | Row selection checkboxes |
| Dialog | `src/components/ui/dialog.tsx` | Status change confirmation, quick-add MC# dialog |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| DataTable | Basic sort and pagination | Add bulk selection, row actions dropdown, column visibility toggle, row background color support, card view toggle |
| FilterBar | Text and select filters only | Add multi-select with search, toggle switches (preferred), numeric range input (min score), saved filter presets |
| StatusBadge | Supports basic status display | Add support for carrier compliance status variants and tier badges |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| CarrierTierBadge | Tier badge with icon and color: PLATINUM=indigo Crown, GOLD=amber Award, SILVER=slate Medal, BRONZE=orange Shield, UNQUALIFIED=gray CircleOff | Small |
| EquipmentIconRow | Row of equipment type icons with overflow "+N" and tooltip. Each icon colored per equipment type system. | Small |
| InsuranceExpiryCell | Date cell with color-coded text: green > 30d, amber 7-30d, red < 7d or expired | Small |
| StarRating | 1-5 star display with partial star support (e.g., 4.3 stars) | Small |
| CarrierCard | Card view component for card view toggle: carrier name, MC#, status, tier, equipment icons, compliance, score, actions | Medium |
| BulkActionsBar | Floating bar appearing when rows selected: count display, action buttons, deselect all | Medium |
| MCLookupDialog | Quick-add dialog: enter MC#, auto-fills from FMCSA, "Start Onboarding" button | Medium |
| CopyableText | Text with hover copy icon and click-to-copy. Used for MC# and DOT#. | Small |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Command | command | Saved filter presets selector |
| Switch | switch | Preferred carriers toggle |
| Popover | popover | Multi-select filter popovers |
| Sheet | sheet | Quick-view carrier side panel (optional) |
| Tooltip | tooltip | Equipment type tooltips, star rating value |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/carriers | Fetch paginated carrier list with filters | useCarriers(filters, pagination, sort) |
| 2 | PATCH | /api/carriers/:id/status | Change carrier status | useUpdateCarrierStatus() |
| 3 | PATCH | /api/carriers/:id/preferred | Toggle preferred carrier flag | useTogglePreferred() |
| 4 | POST | /api/carriers/fmcsa/lookup | FMCSA real-time verification for single carrier | useFmcsaVerify() |
| 5 | POST | /api/carriers/bulk/status | Bulk update carrier statuses | useBulkUpdateStatus() |
| 6 | POST | /api/carriers/bulk/notify | Send bulk notification to selected carriers | useBulkNotify() |
| 7 | GET | /api/carriers/export | Export carriers as CSV/Excel | useExportCarriers() |
| 8 | GET | /api/carriers/filters/options | Get filter option values (equipment types, states, tiers) | useCarrierFilterOptions() |

### Request/Response Examples

**GET /api/carriers:**
```
Query params: ?search=swift&status=ACTIVE&tier=GOLD,PLATINUM&equipment=DRY_VAN&state=TX&minScore=80&preferred=true&page=1&pageSize=25&sortBy=onTimeDeliveryPct&sortDir=desc
```

**Response:**
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 342,
    "totalPages": 14
  }
}
```

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| carriers:{tenantId} | carrier.statusChanged | useCarrierListUpdates() -- updates affected row in cache |
| carriers:{tenantId} | carrier.complianceChanged | useCarrierListUpdates() -- updates compliance column |
| carriers:{tenantId} | carrier.created | useCarrierListUpdates() -- invalidates list query to include new carrier |
| insurance:{tenantId} | insurance.expired | useCarrierListUpdates() -- updates insurance column and compliance |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 500 |
|---|---|---|---|---|---|
| GET /api/carriers | Show filter validation error | Redirect to login | Show "Access Denied" page | N/A | Show error state with retry button |
| PATCH /api/carriers/:id/status | Show validation toast ("Invalid status transition") | Redirect to login | Show "Permission Denied" toast | Show "Carrier not found" toast | Show error toast with retry |
| POST /api/carriers/fmcsa/lookup | Show "Invalid MC/DOT#" toast | Redirect to login | Show "Permission Denied" toast | Show "Carrier not found in FMCSA" toast | Show "FMCSA service unavailable" toast |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Show page header and filter bar immediately. Table area shows 10 skeleton rows: gray animated bars matching column widths. If card view is active, show 8 skeleton cards in a 4x2 grid.
- **Progressive loading:** Filter options load from cache (fast). Table data loads from API (may take 1-2s for large datasets).
- **Duration threshold:** If loading exceeds 5s, show "This is taking longer than usual..." message below the filter bar.

### Empty States

**First-time empty (no carriers in system):**
- **Illustration:** Truck fleet illustration with empty road
- **Headline:** "No carriers yet"
- **Description:** "Start building your carrier network by onboarding your first motor carrier."
- **CTA Button:** "Onboard First Carrier" -- primary blue button, navigates to onboarding wizard

**Filtered empty (data exists but filters exclude all):**
- **Headline:** "No carriers match your filters"
- **Description:** "Try adjusting your search or filter criteria."
- **CTA Button:** "Clear All Filters" -- secondary outline button
- **Additional:** Show active filter count and list applied filters

**Search empty (search query returns no results):**
- **Headline:** "No carriers found for '[search term]'"
- **Description:** "Check the MC#, DOT#, or carrier name and try again."
- **CTA Button:** "Clear Search" -- text button

### Error States

**Full page error (carrier list API fails):**
- **Display:** Error icon + "Unable to load carriers" + "Please try again or contact support." + Retry button

**Partial error (list loads but filter options fail):**
- **Display:** Show carrier list with text-only filter inputs (fallback). Show warning: "Filter options unavailable. You can still search by name, MC#, or DOT#."

**FMCSA Verify error:**
- **Display:** Toast: "Could not verify [carrier name] with FMCSA. Service may be temporarily unavailable." with retry link.

**Bulk action error (partial success):**
- **Display:** Toast: "Updated 8 of 10 carriers. 2 carriers could not be updated: [carrier names]. [View Details]"

### Permission Denied

- **Full page denied:** Show "You don't have permission to view carriers" with link back to dashboard
- **Partial denied:** Add Carrier button hidden. Bulk actions hidden. Row action menu shows only View Profile.

### Offline / Degraded

- **Full offline:** Show banner: "You're offline. Showing cached carrier data from [timestamp]. Changes will sync when reconnected."
- **Degraded (WebSocket down, REST works):** Show subtle indicator: "Live updates paused" in the page header. Data still loads on refresh/navigation.

---

## 12. Filters, Search & Sort

### Filters

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Search | Text input (debounced 300ms) | Free text -- searches name, MC#, DOT# | Empty | `?search=` |
| 2 | Status | Multi-select dropdown | PENDING, ACTIVE, INACTIVE, SUSPENDED, BLACKLISTED | All except BLACKLISTED | `?status=ACTIVE,PENDING` |
| 3 | Tier | Multi-select dropdown | PLATINUM, GOLD, SILVER, BRONZE, UNQUALIFIED | All | `?tier=GOLD,PLATINUM` |
| 4 | Compliance Status | Multi-select dropdown | COMPLIANT, WARNING, EXPIRING_SOON, EXPIRED, MISSING, PENDING_REVIEW, SUSPENDED | All | `?compliance=WARNING,EXPIRED` |
| 5 | Equipment Type | Multi-select dropdown with icons | All equipment types from EQUIPMENT_TYPE system | All | `?equipment=DRY_VAN,REEFER` |
| 6 | State/Region | Multi-select with search | All US states + regions (Northeast, Southeast, Midwest, Southwest, West) | All | `?state=TX,CA` |
| 7 | Min Score | Number input (0-100) | 0 to 100 | 0 (no minimum) | `?minScore=80` |
| 8 | Preferred Only | Toggle switch | On/Off | Off | `?preferred=true` |

### Search Behavior

- **Search field:** Single search input at the start of the filter bar with magnifying glass icon
- **Searches across:** Carrier legal name, DBA name, MC number, DOT number
- **Behavior:** Debounced 300ms, minimum 2 characters, case-insensitive. MC# search strips "MC-" prefix if entered. DOT# search matches exact numbers.
- **URL param:** `?search=swift`
- **Highlight:** Matching text is highlighted in yellow within search results

### Sort Options

| Column / Field | Default Direction | Sort Type |
|---|---|---|
| Carrier Name | Ascending (A-Z) | Alphabetic |
| MC# | Ascending | Numeric |
| DOT# | Ascending | Numeric |
| Status | Custom (ACTIVE first, then PENDING, SUSPENDED, INACTIVE, BLACKLISTED) | Custom enum |
| Tier | Custom (PLATINUM first, descending quality) | Custom enum |
| Compliance Status | Custom (EXPIRED first -- worst first) | Custom enum |
| Insurance Expiry | Ascending (soonest first) | Date |
| Truck Count | Descending (most first) | Numeric |
| Total Loads | Descending (most first) | Numeric |
| On-Time % | Descending (highest first) | Numeric |
| Avg Rating | Descending (highest first) | Numeric |

**Default sort:** Carrier Name ascending (A-Z)

### Saved Filters / Presets

- **System presets:**
  - "Active Carriers" -- status=ACTIVE
  - "Compliance Issues" -- compliance=WARNING,EXPIRING_SOON,EXPIRED,SUSPENDED
  - "Expiring Insurance" -- compliance=EXPIRING_SOON (next 30 days)
  - "Preferred Carriers" -- preferred=true
  - "Available Dry Vans" -- status=ACTIVE, equipment=DRY_VAN, compliance=COMPLIANT
  - "Top Performers" -- tier=PLATINUM,GOLD, minScore=85
- **User-created presets:** Users can save current filter combination with a custom name. Stored per-user in localStorage and synced to server.
- **URL sync:** All filter state is reflected in URL query params so views can be shared via link.

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Table columns: Show carrier name, MC#, status, tier, compliance, insurance expiry, actions. Hide DOT#, truck count, equipment icons, total loads, rating.
- Filter bar: Collapse to "Filters" button that opens a slide-over panel with all filters
- Search remains visible above table
- Bulk actions bar: Stack vertically if needed
- Card view: 2 cards per row instead of 4

### Mobile (< 768px)

- Table switches to card-based list view automatically
- Each card shows: carrier name (bold), MC#, status badge, tier badge, compliance badge, insurance expiry, and tap-to-expand for equipment types and performance metrics
- Filters: Full-screen filter modal triggered by filter icon button
- Search: Sticky at top of screen
- "Add Carrier" moves to sticky bottom action bar
- Swipe left on card for quick actions (View, Verify FMCSA)
- Pull-to-refresh for data reload
- Bulk selection: Long press card to enter selection mode

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full table with all 14 columns visible |
| Desktop | 1024px - 1439px | Table with 10 columns, some hidden via column visibility |
| Tablet | 768px - 1023px | Table with 7 priority columns, collapsible filter panel |
| Mobile | < 768px | Card view only, full-screen filters, sticky bottom actions |

---

## 14. Stitch Prompt

```
Design a carrier management list page for a modern freight/logistics TMS (Transportation Management System) called "Ultra TMS."

Layout: Full-width page with a dark slate-900 sidebar on the left (240px wide, collapsed to icons), white content area on the right. Top of content area has a page header with breadcrumb "Carriers" on the left, page title "Carriers" in bold, and two buttons on the right: a blue primary button "+ Add Carrier" and a secondary outline button "Export" with a download icon.

Filter Bar: Below the header, a horizontal filter bar with:
- Search input with magnifying glass icon placeholder "Search by name, MC#, or DOT#..."
- "Status" multi-select dropdown showing options: Active (green badge), Pending (gray), Inactive (slate), Suspended (amber), Blacklisted (red)
- "Tier" multi-select dropdown with colored options: Platinum (indigo), Gold (amber), Silver (gray), Bronze (orange), Unqualified (light gray)
- "Compliance" dropdown: Compliant (green), Warning (amber), Expiring Soon (orange), Expired (red)
- "Equipment" dropdown with icons: Dry Van, Reefer, Flatbed, Step Deck, etc.
- "State" searchable multi-select dropdown
- "Min Score" small number input
- Toggle switch labeled "Preferred Only" with star icon
- "Clear Filters" text link at the end
- Small segmented control on far right: table icon and grid icon for view toggle

Data Table: Below filters, a clean data table with:
- Checkbox column for bulk selection
- Column headers: Carrier Name, MC#, DOT#, Status, Tier, Equipment, Compliance, Insurance Expiry, Trucks, Loads, On-Time %, Rating, Actions

Show 8 rows of realistic data:
Row 1: [x] Swift Logistics (DBA: Swift) | MC-123456 (monospace) | 1234567 | Green "Active" badge | Amber "Gold" badge with Award icon | Icons: blue container + cyan snowflake | Green "Compliant" shield-check badge | 08/15/2026 (green text) | 45 | 234 | 96.2% (green) | 4.8 stars | [Verify][...]
Row 2: [ ] ABC Trucking | MC-789012 (monospace) | 7890123 | Green "Active" badge | Slate "Silver" badge with Medal icon | Icon: blue container | Amber "Warning" alert-triangle badge | 03/01/2026 (amber text) | 12 | 89 | 91.5% (yellow) | 4.2 stars | [Verify][...] -- this row has subtle yellow background tint
Row 3: [ ] FastFreight Inc | MC-345678 (monospace) | 3456789 | Amber "Suspended" badge with shield icon | Orange "Bronze" badge | Icons: container + flatbed | Red "Expired" calendar-x badge | 01/15/2026 (red text, past date) | 8 | 156 | 87.3% (yellow) | 3.9 stars | [...] -- this row has subtle red background tint
Row 4: [ ] Mountain Express | MC-901234 (monospace) | 9012345 | Green "Active" badge | Indigo "Platinum" badge with Crown icon | Icons: container + snowflake + flatbed | Green "Compliant" badge | 11/30/2026 (green text) | 67 | 412 | 98.1% (green) | 4.9 stars | [Verify][...]
Row 5-8: More realistic carrier data with varying statuses, tiers, and compliance states.

Pagination: Below table, "Showing 1-25 of 342 carriers" on left, page navigation buttons on right: < 1 2 3 ... 14 >

Design Specifications:
- Font: Inter or system sans-serif, 14px base size for table, 13px for table cells
- Sidebar: slate-900 background, white text, blue-600 active indicator
- Content background: white (#FFFFFF) for page, gray-50 for filter bar background
- Primary color: blue-600 for buttons, links, and clickable carrier names
- MC# and DOT# in monospace font (font-family: monospace)
- Status badges: rounded-full pills with icon + text per the color system
- Tier badges: rounded-full pills with tier icon (Crown for Platinum, Award for Gold, Medal for Silver, Shield for Bronze, CircleOff for Unqualified)
- Row hover: gray-50 background
- Yellow-tinted rows for compliance warnings, red-tinted rows for expired/suspended
- Table headers: gray-500 uppercase text, sortable with up/down arrows
- Equipment icons: small colored icons matching the equipment type color system
- Star ratings: filled amber stars with gray outlines for unfilled
- Modern SaaS aesthetic similar to Linear.app or Vercel dashboard

Include: checkbox column for bulk selection, a bulk actions bar at the top of the table that appears when any rows are selected showing "3 selected | Update Status | Send Notification | Export Selected", a small "Verify" button in each row's actions column, and a "..." overflow menu button for additional row actions.
```

---

## 15. Enhancement Opportunities

### Current State (Wave 3)

**What's built and working:**
- [x] Basic carrier list table with name, MC#, status columns
- [x] Basic search by carrier name
- [x] Basic pagination
- [x] Click to navigate to carrier detail (page exists but detail is not built)

**What needs polish / bug fixes:**
- [ ] Missing compliance status column -- carriers with expired insurance are not visually identified
- [ ] Missing tier badges -- no performance tier indicators in the list
- [ ] No color-coded rows for compliance status
- [ ] Filter state is lost on browser back navigation
- [ ] MC# not displayed in monospace font
- [ ] No card view toggle option
- [ ] Search does not search by MC# or DOT# -- only name
- [ ] Missing equipment type icons column

**What to add this wave:**
- [ ] Tier badge column with full color system
- [ ] Compliance status column with aggregate status badges
- [ ] Insurance expiry column with color-coded urgency
- [ ] Equipment type icons column
- [ ] Star rating column
- [ ] Color-coded row backgrounds for compliance urgency
- [ ] Multi-select filters for status, tier, compliance, equipment, state
- [ ] Preferred carriers toggle filter
- [ ] Bulk actions bar (select rows, update status, send notification, export)
- [ ] Inline FMCSA Verify button per row
- [ ] Card view toggle
- [ ] Copy-to-clipboard for MC# and DOT#
- [ ] URL state sync for all filters
- [ ] Saved filter presets
- [ ] Export CSV/Excel

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Compliance status column + row coloring | High | Medium | P0 |
| Tier badge column | High | Low | P0 |
| Insurance expiry column with urgency colors | High | Low | P0 |
| Multi-select filters (status, tier, compliance) | High | Medium | P0 |
| Bulk actions bar | High | Medium | P0 |
| Equipment type icons | Medium | Low | P1 |
| Star rating column | Medium | Low | P1 |
| Inline FMCSA Verify | Medium | Medium | P1 |
| Card view toggle | Medium | High | P1 |
| Preferred carriers toggle | Medium | Low | P1 |
| URL state sync | Medium | Medium | P1 |
| Saved filter presets | Low | Medium | P2 |
| Export CSV/Excel | Low | Low | P2 |
| Copy-to-clipboard MC#/DOT# | Low | Low | P2 |

### Future Wave Preview

- **Wave 4:** Add carrier capacity indicators (available trucks today), real-time truck location overlay, integration with load board for automatic carrier matching suggestions.
- **Wave 5:** AI-powered carrier recommendations based on historical lane performance, predictive scoring, carrier sentiment analysis from communication history.

---

_Last Updated: 2026-02-06_
