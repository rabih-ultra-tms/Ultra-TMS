# Quotes List

> Service: Sales (03) | Wave: 1 | Priority: P0
> Route: /sales/quotes | Status: In Progress
> Primary Personas: James Wilson (Sales Agent), Sales Manager
> Roles with Access: super_admin, admin, sales_manager, sales_agent (scoped to own quotes)

---

## 1. Purpose & Business Context

**What this screen does:**
The Quotes List is the primary workspace for managing all quotes in the system. It provides a filterable, sortable, and searchable table of every quote with status indicators, customer information, lane details, pricing, and quick actions. Sales agents use it to manage their personal quote pipeline; sales managers use it to oversee the entire team's quoting activity.

**Business problem it solves:**
Without a centralized quotes list, sales agents track quotes in spreadsheets, email folders, and sticky notes. This leads to lost quotes, missed follow-ups, duplicate quotes for the same customer/lane, and zero visibility for management. The Quotes List provides a single source of truth with real-time status tracking, so every quote is accounted for and actionable.

**Key business rules:**
- Sales agents see only their own quotes by default. The "My Quotes" / "All Quotes" toggle is controlled by the `team_view` permission.
- Quotes are sorted by creation date descending (newest first) by default.
- Status filtering defaults to active statuses (DRAFT, SENT, VIEWED, ACCEPTED) -- excluding REJECTED, EXPIRED, and CONVERTED.
- Bulk actions (send, delete, export) are available when multiple rows are selected.
- Inline status advancement is available for forward transitions only (e.g., ACCEPTED -> Convert to Order).
- Quote numbers are clickable links that navigate to the Quote Detail page.

**Success metric:**
Time to find a specific quote drops from 2-3 minutes (searching emails/spreadsheets) to under 5 seconds. Percentage of quotes with proper follow-up increases from 60% to 95%.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Sales Dashboard | Clicks KPI card (e.g., "42 Quotes Sent") | Pre-set filter: ?status=SENT |
| Sales Dashboard | Clicks "View All Quotes" link | None |
| Sidebar Navigation | Clicks "Quotes" under Sales section | None |
| Customer Detail (CRM) | Clicks "View Quotes" on customer profile | ?customerId=CUST-XXX |
| Global Search | Searches for quote number, clicks result | ?search=QT-20260205 |
| Direct URL | Bookmark / shared link | Filter params in URL |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Quote Detail | Clicks quote number link or row | quoteId |
| Quote Builder | Clicks "+ New Quote" button | None (blank form) |
| Quote Builder | Clicks "Clone" action on a quote row | ?cloneFrom=QT-XXXX |
| Quote Builder | Clicks "Edit" action on a DRAFT quote | quoteId (edit mode) |
| Customer Detail (CRM) | Clicks customer name link in table | customerId |

**Primary trigger:**
James opens the Quotes List from the sidebar to review his pipeline. He filters to "SENT" status to see which quotes are awaiting customer response. He clicks on a quote that was sent 3 days ago to follow up. Sales Manager opens with "All Quotes" view to check team pipeline and identify high-value quotes that need attention.

**Success criteria (user completes the screen when):**
- User has located the quote(s) they need to work on.
- User has reviewed quote statuses and identified items requiring action.
- User has navigated to the appropriate detail or builder screen for their next action.

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------------+
|  Top Bar: [Sales] > Quotes                                             |
|           [My Quotes | All Quotes]  (toggle)     [+ New Quote] (blue)  |
+------------------------------------------------------------------------+
|                                                                        |
|  +----------+  +----------+  +-----------+  +----------+              |
|  | Total    |  | Active   |  | Pipeline  |  | Won This |              |
|  | Quotes   |  | Pipeline |  | Value     |  | Month    |              |
|  |   186    |  |    42    |  |  $184K    |  |  $68K    |              |
|  +----------+  +----------+  +-----------+  +----------+              |
|                                                                        |
|  +------------------------------------------------------------------+  |
|  | Filters: [Status v] [Customer v] [Service Type v] [Date Range v] |  |
|  |          [Equipment v] [Agent v (mgr only)]  [Search...........] |  |
|  |          Saved: [My Active Pipeline] [Expiring Soon] [High Value]|  |
|  +------------------------------------------------------------------+  |
|                                                                        |
|  +------------------------------------------------------------------+  |
|  | [x] | Quote #      | Customer     | Lane          | Service | Eq |  |
|  |     |              |              |               | Type    | Typ|  |
|  |-----|--------------|--------------|---------------|---------|-----|  |
|  | [ ] | QT-0206-0042 | Acme Mfg     | CHI,IL->DAL,TX| FTL     | DV |  |
|  |     | v2 | VIEWED  | James W.     | 847 mi        | $2,450  |18% |  |
|  |-----|--------------|--------------|---------------|---------|-----|  |
|  | [ ] | QT-0205-0038 | Global Foods | LA,CA->PHX,AZ | FTL     | RF |  |
|  |     | v1 | SENT    | James W.     | 372 mi        | $1,875  |15% |  |
|  |-----|--------------|--------------|---------------|---------|-----|  |
|  | [ ] | QT-0205-0037 | Swift Elec   | ATL,GA->MIA,FL| LTL     | DV |  |
|  |     | v1 | ACCEPTED| Sarah M.     | 662 mi        | $1,200  |22% |  |
|  |-----|--------------|--------------|---------------|---------|-----|  |
|  | [ ] | QT-0204-0035 | Beta Dist    | SEA,WA->PDX,OR| FTL     | FB |  |
|  |     | v3 | DRAFT   | James W.     | 174 mi        | $950    |12% |  |
|  +------------------------------------------------------------------+  |
|  |  Selected: 0 | Showing 1-25 of 186     [< Prev] [1][2][3] [Next >] |  |
|  +------------------------------------------------------------------+  |
+------------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible, above the fold) | Quote number + status badge, customer name, lane (origin->dest), total amount | Agents scan these fields to identify and prioritize quotes |
| **Secondary** (visible but less prominent) | Service type, equipment type, margin %, version number, agent name, distance | Important context for evaluating quotes but not the first scan target |
| **Tertiary** (available on hover or expand) | Pickup date, expiry date, rate source, accessorials total, fuel surcharge | Needed for specific quote evaluation, not for list scanning |
| **Hidden** (behind a click -- detail page) | Full rate breakdown, quote history/timeline, notes, proposal, version comparison | Deep detail accessed on the Quote Detail page |

---

## 4. Data Fields & Display

### Visible Fields

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Select Checkbox | N/A (UI control) | Checkbox for bulk selection | Table column 1 (far left) |
| 2 | Quote Number | Quote.quoteNumber | `QT-YYYYMMDD-XXXX`, monospace font, blue clickable link | Table column 2 |
| 3 | Version | Quote.version | "v1", "v2", etc. in small gray badge next to quote number | Below quote number |
| 4 | Status | Quote.status | Colored badge (see Section 6) | Below quote number, right of version |
| 5 | Customer | Company.name | Text, truncated at 25 chars with tooltip for full name | Table column 3 |
| 6 | Agent | User.name (Quote.salesAgentId) | Text, "First L." format | Below customer name |
| 7 | Lane | Quote.originCity/State + destinationCity/State | "City, ST -> City, ST" with arrow icon | Table column 4 |
| 8 | Distance | Calculated | "XXX mi" in gray text below lane | Below lane |
| 9 | Service Type | Quote.serviceType | Badge: FTL, LTL, PARTIAL, DRAYAGE | Table column 5 |
| 10 | Equipment | Quote.equipmentType | Icon + abbreviated label (DV, RF, FB, SD) | Table column 6 |
| 11 | Total Amount | Quote.totalAmount | "$X,XXX.XX" right-aligned | Table column 7 |
| 12 | Margin | Quote.marginPercent | "XX%" color-coded (green >15%, yellow 5-15%, red <5%) | Below total amount |
| 13 | Created Date | Quote.createdAt | "MMM DD" format (e.g., "Feb 05") | Table column 8 |
| 14 | Actions | N/A (UI controls) | Three-dot menu with contextual actions | Table column 9 (far right) |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Distance | Google Maps Distance Matrix between origin and destination | "XXX mi" |
| 2 | Margin % | (totalAmount - estimatedCost) / totalAmount * 100 | Percentage with color coding |
| 3 | Days Since Created | now() - createdAt | "X days ago" shown on hover |
| 4 | Expiry Countdown | expiryDate - now() for SENT/VIEWED quotes | "Expires in Xd" or "Expired Xd ago" with color |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] Paginated data table with 25 rows per page (options: 10, 25, 50, 100)
- [ ] Column sorting on all columns (click header to toggle asc/desc)
- [ ] Status filter (multi-select, defaults to active statuses)
- [ ] Customer filter (searchable select)
- [ ] Date range filter (preset + custom)
- [ ] Text search across quote number, customer name, origin, destination
- [ ] Status badges with quote-specific color scheme
- [ ] Click-through to Quote Detail on quote number click
- [ ] Row actions menu: View, Edit (draft only), Clone, Send (draft only), Delete (draft only)
- [ ] "+ New Quote" primary button in page header
- [ ] "My Quotes" / "All Quotes" toggle for role-appropriate scoping
- [ ] 4 summary stat cards above the table (total, active pipeline, pipeline value, won this month)
- [ ] Bulk selection with checkbox column
- [ ] URL state sync (all filters reflected in URL for sharing/bookmarking)

### Advanced Features (Logistics Expert Recommendations)

- [ ] Bulk actions: send multiple draft quotes, export selected, delete selected drafts
- [ ] Saved filter presets with custom naming
- [ ] Column visibility toggle (show/hide columns)
- [ ] Inline status indicator with expiry countdown for SENT/VIEWED quotes
- [ ] Row hover preview (tooltip showing rate breakdown)
- [ ] Keyboard navigation: arrow keys to navigate rows, Enter to open detail
- [ ] Auto-refresh every 30 seconds with visual diff highlighting on changed rows
- [ ] Drag-to-reorder columns
- [ ] Right-click context menu matching the actions dropdown
- [ ] Quick clone: one-click clone with today's date
- [ ] Export to CSV/Excel with current filters applied
- [ ] Print view (optimized table layout for printing)

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| View all quotes (team) | sales_manager, admin | team_view | Toggle hidden; only "My Quotes" shown |
| View dollar amounts | sales_agent, sales_manager | finance_view | Amount and margin columns show "--" |
| Delete quotes | sales_agent (own), admin (any) | quote_delete | Delete action hidden in menu |
| Send quotes | sales_agent, sales_manager | quote_send | Send action hidden in menu |
| Bulk delete | admin | quote_delete + bulk_action | Bulk delete option not shown |
| Export data | sales_agent, sales_manager, admin | export_data | Export button disabled with tooltip |

---

## 6. Status & State Machine

### Status Transitions

```
[DRAFT] ---(Send)---> [SENT] ---(Customer opens)---> [VIEWED]
   |                     |              |                 |
   |                     |              |                 v
   |                     |              |           [ACCEPTED]--->[CONVERTED]
   |                     |              |
   |                     v              v
   |                 [EXPIRED]     [REJECTED]
   |                     ^              ^
   |                     |              |
   v                     └──────────────┘
 (delete)           (auto-expire or customer declines)
```

### Actions Available Per Status

| Status | Available Actions (Row Menu) | Restricted Actions |
|---|---|---|
| DRAFT | Edit, Clone, Send, Delete | Convert, Follow Up |
| SENT | View, Clone, Follow Up, Revise | Edit, Delete |
| VIEWED | View, Clone, Follow Up, Revise | Edit, Delete |
| ACCEPTED | View, Clone, Convert to Order | Edit, Delete, Send |
| CONVERTED | View, View Order | Edit, Delete, Send, Convert |
| REJECTED | View, Clone, Revise (new version) | Edit, Delete, Send |
| EXPIRED | View, Clone, Revise (new version) | Edit, Delete, Send |

### Status Badge Colors

| Status | Background | Text | Border | Tailwind Classes |
|---|---|---|---|---|
| DRAFT | gray-100 | gray-700 | gray-300 | `bg-gray-100 text-gray-700 border-gray-300` |
| SENT | blue-100 | blue-800 | blue-300 | `bg-blue-100 text-blue-800 border-blue-300` |
| VIEWED | purple-100 | purple-800 | purple-300 | `bg-purple-100 text-purple-800 border-purple-300` |
| ACCEPTED | green-100 | green-800 | green-300 | `bg-green-100 text-green-800 border-green-300` |
| CONVERTED | emerald-100 | emerald-800 | emerald-300 | `bg-emerald-100 text-emerald-800 border-emerald-300` |
| REJECTED | red-100 | red-800 | red-300 | `bg-red-100 text-red-800 border-red-300` |
| EXPIRED | amber-100 | amber-800 | amber-300 | `bg-amber-100 text-amber-800 border-amber-300` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Top-Right of Page)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| + New Quote | Plus | Primary / Blue | Navigates to `/sales/quotes/new` | No |
| Export | Download | Secondary / Outline | Downloads CSV of current filtered view | No |

### Secondary Actions (Row Dropdown / "More" Menu)

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| View | Eye | Navigate to Quote Detail (`/sales/quotes/:id`) | Any status |
| Edit | Pencil | Navigate to Quote Builder in edit mode | DRAFT status only |
| Clone | Copy | Creates a new quote pre-filled from this one (new number, DRAFT status) | Any status |
| Send | Send | Opens send confirmation modal (select contact, preview email) | DRAFT status only |
| Follow Up | Phone | Opens follow-up action modal (call/email options) | SENT or VIEWED status |
| Revise | RefreshCw | Creates new version of quote, opens in Quote Builder | REJECTED or EXPIRED status |
| Convert to Order | ArrowRight | Opens conversion confirmation dialog, creates TMS Core order | ACCEPTED status only |
| View Order | ExternalLink | Navigates to the linked TMS Core order | CONVERTED status only |
| Delete | Trash | Deletes quote with confirmation dialog | DRAFT status only |

### Bulk Actions (When Multiple Rows Selected)

| Action Label | Action | Confirmation |
|---|---|---|
| Send Selected | Sends all selected DRAFT quotes (skips non-drafts with warning) | Yes -- "Send X quotes to their contacts?" |
| Export Selected | Downloads CSV of selected rows | No |
| Delete Selected | Deletes selected DRAFT quotes (skips non-drafts with warning) | Yes -- "Delete X draft quotes? This cannot be undone." |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + Q | Open Quick Quote (new quote) |
| Ctrl/Cmd + K | Open global search |
| Ctrl/Cmd + E | Export current view |
| Arrow Up/Down | Navigate table rows |
| Enter | Open selected row detail |
| Space | Toggle row checkbox selection |
| Escape | Deselect all / close modal |
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
| quote.created | { quoteId, agentId, customer, amount, status } | Add new row to top of table (if matches current filters), update stat cards |
| quote.status.changed | { quoteId, oldStatus, newStatus } | Update status badge on affected row, flash highlight row, update stat cards |
| quote.viewed | { quoteId, viewedAt, viewedBy } | Update status badge to VIEWED, show subtle eye icon animation, update stat cards |
| quote.deleted | { quoteId } | Remove row from table with fade-out animation, update stat cards |

### Live Update Behavior

- **Update frequency:** WebSocket push for all quote events. Stat cards recalculate on each event.
- **Visual indicator:** Changed rows flash with a subtle blue highlight that fades over 2 seconds. New rows slide in from the top.
- **Conflict handling:** If user is viewing a quote that gets deleted by another user, show banner: "This quote was deleted by [user]."

### Polling Fallback

- **When:** WebSocket connection drops
- **Interval:** Every 30 seconds
- **Endpoint:** `GET /api/v1/quotes?updatedSince={lastPollTimestamp}&{currentFilters}`
- **Visual indicator:** Show "Live updates paused -- reconnecting..." banner

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Delete quote | Immediately fade out row | Restore row, show error toast |
| Send quote | Immediately update status badge to SENT | Revert badge to DRAFT, show error toast |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| DataTable | src/components/ui/data-table.tsx | columns, data, pagination, sorting, selection |
| PageHeader | src/components/layout/page-header.tsx | title, breadcrumbs, actions |
| FilterBar | src/components/ui/filter-bar.tsx | filters: FilterConfig[] |
| StatsCard | src/components/ui/stats-card.tsx | value, label, trend |
| StatusBadge | src/components/ui/status-badge.tsx | status, size |
| Button | src/components/ui/button.tsx | variants |
| SearchableSelect | src/components/ui/searchable-select.tsx | For customer filter |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| DataTable | Basic sort and pagination | Add bulk selection checkbox column, row actions dropdown, column visibility toggle, row hover preview |
| FilterBar | Basic filters | Add saved filter presets, "My Quotes/All Quotes" toggle, multi-select for status |
| StatsCard | Basic value display | Add click-to-filter behavior (clicking card applies filter to table) |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| QuoteRow | Custom table row with quote number + version + status badge compound display | Medium |
| LaneCell | Table cell showing "Origin -> Destination" with arrow icon and distance | Small |
| MarginCell | Table cell showing margin % with color coding | Small |
| QuoteSendModal | Modal for sending a quote: select contact, preview email, confirm | Medium |
| QuoteDeleteConfirm | Confirmation dialog for deleting draft quotes (single or bulk) | Small |
| BulkActionBar | Sticky bar that appears when rows are selected, showing available bulk actions | Medium |
| SavedFilterDropdown | Dropdown showing system and user-saved filter presets | Small |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Checkbox | checkbox | Row selection checkboxes |
| DropdownMenu | dropdown-menu | Row actions menu, bulk actions |
| AlertDialog | alert-dialog | Delete confirmation |
| Dialog | dialog | Send quote modal |
| Tooltip | tooltip | Truncated text, margin explanation |
| Badge | badge | Status badges, service type badges |
| Pagination | N/A (custom) | Table pagination controls |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/v1/quotes | Fetch paginated quotes with filters | useQuotes(filters, pagination, sort) |
| 2 | GET | /api/v1/quotes/stats | Fetch summary statistics for stat cards | useQuoteStats(filters) |
| 3 | POST | /api/v1/quotes/:id/send | Send quote to customer | useSendQuote() |
| 4 | DELETE | /api/v1/quotes/:id | Delete draft quote | useDeleteQuote() |
| 5 | POST | /api/v1/quotes/:id/clone | Clone a quote | useCloneQuote() |
| 6 | POST | /api/v1/quotes/:id/convert | Convert accepted quote to order | useConvertQuote() |
| 7 | POST | /api/v1/quotes/export | Export quotes to CSV | useExportQuotes() |
| 8 | GET | /api/v1/customers?search= | Customer search for filter | useCustomerSearch(query) |
| 9 | GET | /api/v1/users?role=sales_agent | Agent list for filter (manager) | useSalesAgents() |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| sales:{tenantId} | quote.created | useQuoteListUpdates() -- invalidates quotes query |
| sales:{tenantId} | quote.status.changed | useQuoteListUpdates() -- updates individual row |
| sales:{tenantId} | quote.viewed | useQuoteListUpdates() -- updates status badge |
| sales:{tenantId} | quote.deleted | useQuoteListUpdates() -- removes row |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 500 |
|---|---|---|---|---|---|
| GET /api/v1/quotes | Show filter error toast | Redirect to login | Show "Access Denied" page | N/A | Show error state with retry |
| POST /api/v1/quotes/:id/send | Show validation toast (missing contact) | Redirect to login | Show "Permission Denied" toast | Show "Quote not found" toast | Show error toast with retry |
| DELETE /api/v1/quotes/:id | Show "Cannot delete non-draft" toast | Redirect to login | Show "Permission Denied" toast | Show "Quote not found" toast | Show error toast with retry |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Show 4 skeleton stat cards, skeleton filter bar, and table with 8 skeleton rows (gray animated bars matching column widths).
- **Progressive loading:** Page header and filter bar render immediately. Stat cards and table show skeletons until data arrives.
- **Duration threshold:** If loading exceeds 5 seconds, show "This is taking longer than usual..." in the table area.

### Empty States

**First-time empty (no quotes ever created):**
- **Illustration:** Quote/document illustration
- **Headline:** "No quotes yet"
- **Description:** "Create your first quote to start building your sales pipeline."
- **CTA Button:** "Create First Quote" -- primary blue button

**Filtered empty (data exists but filters exclude all):**
- **Headline:** "No quotes match your filters"
- **Description:** "Try adjusting your filters or search terms."
- **CTA Button:** "Clear All Filters" -- secondary outline button

### Error States

**Full page error:**
- **Display:** Error icon + "Unable to load quotes" + "Please try again or contact support." + Retry button

**Per-section error (stats load but table fails):**
- **Display:** Stats cards show normally. Table shows inline error: "Could not load quote list" with Retry link.

**Action error (send/delete fails):**
- **Display:** Toast: red background, error icon, specific message, auto-dismiss 8 seconds.

### Permission Denied

- **Full page denied:** Show "You don't have permission to view quotes" with link to dashboard
- **Partial denied:** Financial columns show "--"; "All Quotes" toggle hidden for agents without team_view

### Offline / Degraded

- **Full offline:** Banner: "You're offline. Showing cached data from [timestamp]. Actions will sync when reconnected."
- **Degraded:** Show "Live updates paused" indicator. Table data loads on manual refresh.

---

## 12. Filters, Search & Sort

### Filters

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Status | Multi-select dropdown | DRAFT, SENT, VIEWED, ACCEPTED, CONVERTED, REJECTED, EXPIRED | DRAFT, SENT, VIEWED, ACCEPTED | ?status=DRAFT,SENT,VIEWED,ACCEPTED |
| 2 | Customer | Searchable select | From /api/v1/customers | All | ?customerId= |
| 3 | Service Type | Multi-select | FTL, LTL, PARTIAL, DRAYAGE | All | ?serviceType= |
| 4 | Equipment Type | Multi-select | DRY_VAN, REEFER, FLATBED, STEP_DECK, etc. | All | ?equipmentType= |
| 5 | Date Range | Date range picker | Preset: Today, This Week, This Month, This Quarter, Custom | This Month | ?dateFrom=&dateTo= |
| 6 | Agent | Searchable select (manager only) | From /api/v1/users?role=sales_agent | Current user (agent) / All (manager) | ?agentId= |
| 7 | Rate Source | Multi-select | MANUAL, CONTRACT, MARKET, CALCULATED | All | ?rateSource= |
| 8 | Margin Range | Range slider | 0% to 50%+ | All | ?marginMin=&marginMax= |

### Search Behavior

- **Search field:** Single search input in the filter bar
- **Searches across:** Quote number, customer name, origin city, destination city, PO number
- **Behavior:** Debounced 300ms, minimum 2 characters, highlights matching text in results
- **URL param:** ?search=

### Sort Options

| Column / Field | Default Direction | Sort Type |
|---|---|---|
| Created Date | Descending (newest first) | Date |
| Quote Number | Descending | Alphanumeric |
| Customer Name | Ascending (A-Z) | Alphabetic |
| Total Amount | Descending (highest first) | Numeric |
| Margin % | Descending (highest first) | Numeric |
| Status | Custom order (DRAFT, SENT, VIEWED, ACCEPTED, REJECTED, EXPIRED, CONVERTED) | Custom enum |
| Expiry Date | Ascending (soonest first) | Date |

**Default sort:** Created Date descending (newest first)

### Saved Filters / Presets

- **System presets:** "My Active Pipeline" (status=DRAFT,SENT,VIEWED,ACCEPTED & agent=me), "Expiring Soon" (expiry within 48h), "High Value (>$5K)" (totalAmount>5000), "Needs Follow-Up" (status=VIEWED, >2 days old)
- **User-created presets:** Users can save current filter combination with a custom name. Stored per-user.
- **URL sync:** All filter state reflected in URL query params for sharing via link.

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Stat cards: 2 per row (2 rows of 2) instead of 4 in a row
- Table columns: Hide margin, distance, agent; keep quote#, status, customer, lane, amount
- Filter bar: Collapse to "Filters" button that opens a slide-over panel
- Row actions: Keep three-dot menu
- Sidebar collapses to icon-only mode

### Mobile (< 768px)

- Stat cards: 2 per row, compact size
- Table switches to card-based list (one card per quote)
- Each card shows: quote number + status badge, customer name, lane arrow, amount
- Tap card to expand showing additional fields (margin, dates, agent)
- Filter: Full-screen filter modal triggered by filter icon
- "+ New Quote" in sticky bottom bar
- Swipe left on card for quick actions (view, clone, delete)
- Pull-to-refresh for data reload
- Bulk selection: long-press to enter selection mode

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full table with all columns, 4 stat cards in row |
| Desktop | 1024px - 1439px | Same layout, table may scroll horizontally for all columns |
| Tablet | 768px - 1023px | Reduced columns, filter slide-over |
| Mobile | < 768px | Card-based list, full-screen filters, sticky bottom action |

---

## 14. Stitch Prompt

```
Design a quotes list page for a modern freight/logistics TMS (Transportation Management System) called "Ultra TMS."

Layout: Full-width page with dark slate-900 sidebar on the left (240px). White content area on the right. Top of content area has a page header with breadcrumb "Sales > Quotes", the title "Quotes" in semibold 24px. On the right side of the header, a segmented toggle showing "My Quotes" (active, blue-600 background) and "All Quotes" (inactive, gray), and a blue-600 "+ New Quote" button with a plus icon.

Stats Row: Below header, 4 stat cards in a horizontal row. White rounded-lg cards with subtle border:
- Card 1: "Total Quotes" value "186" in bold text-xl
- Card 2: "Active Pipeline" value "42" with blue-500 accent
- Card 3: "Pipeline Value" value "$184,200" with green-600 trend "+12%"
- Card 4: "Won This Month" value "$68,450" with green-600 trend "+22%"

Filter Bar: Below stats, a white card containing a row of filter controls:
- Status multi-select dropdown showing "Active Statuses" as selected (with count badge "4")
- Customer searchable dropdown showing "All Customers"
- Service Type dropdown showing "All Types"
- Date Range picker showing "This Month"
- Search input with magnifying glass icon and placeholder "Search quotes..."
- Below filters, a row of saved preset pills: "My Active Pipeline" (blue-100 bg), "Expiring Soon" (amber-100), "High Value" (green-100)

Data Table: Below filters, a white card containing a data table with these columns:
- Checkbox column (unchecked)
- Quote # column: showing "QT-20260205-0042" in blue monospace link font, with "v2" gray badge and "VIEWED" purple badge below
- Customer column: "Acme Manufacturing" in dark text, "James W." in gray text-sm below
- Lane column: "Chicago, IL → Dallas, TX" with a right-arrow icon, "847 mi" in gray below
- Type column: "FTL" badge in blue-50
- Equip column: dry van icon with "DV" label
- Amount column: "$2,450.00" right-aligned in font-medium, "18%" in green-600 below
- Date column: "Feb 05" in gray text-sm
- Actions column: three-dot icon button

Show 6 rows of realistic freight data with different statuses:
Row 1: QT-20260205-0042 | Acme Mfg | Chicago→Dallas | FTL | DV | $2,450 | VIEWED (purple)
Row 2: QT-20260205-0038 | Global Foods | LA→Phoenix | FTL | RF | $1,875 | SENT (blue)
Row 3: QT-20260204-0037 | Swift Electronics | Atlanta→Miami | LTL | DV | $1,200 | ACCEPTED (green)
Row 4: QT-20260204-0035 | Beta Distribution | Seattle→Portland | FTL | FB | $950 | DRAFT (gray)
Row 5: QT-20260203-0033 | Omega Logistics | Houston→Memphis | FTL | DV | $3,100 | EXPIRED (amber)
Row 6: QT-20260203-0031 | Delta Pharma | Newark→Boston | LTL | RF | $2,800 | CONVERTED (emerald)

Table rows have subtle gray-50 hover state. Selected rows have blue-50 background.

Pagination bar at bottom: "Showing 1-25 of 186" on left, page number buttons on right.

Design Specifications:
- Font: Inter, 14px base, 13px for table body, 24px page title
- Sidebar: slate-900 with "Quotes" item active (blue-600 left border, blue-50 bg)
- Content background: slate-50 with white cards
- Primary: blue-600 for links, active toggle, primary buttons
- Status badges: colored backgrounds per status (gray, blue, purple, green, emerald, red, amber)
- Table: white bg, slate-200 border-b between rows, gray-50 hover, no outer border
- Amount column: right-aligned, font-medium, tabular-nums
- Quote numbers: font-mono, text-blue-600, cursor-pointer
- Margin colors: green-600 for >15%, amber-600 for 5-15%, red-600 for <5%
- Modern SaaS aesthetic similar to Linear.app or Salesforce Lightning
```

---

## 15. Enhancement Opportunities

### Current State (Wave 1)

**What's built and working:**
- [x] Basic table layout with pagination
- [x] Static column headers defined
- [ ] Filters not yet connected to API
- [ ] No real-time updates
- [ ] No bulk actions
- [ ] No stat cards

**What needs polish / bug fixes:**
- [ ] Table skeleton doesn't match actual column widths
- [ ] Status badges using wrong color palette (need quote-specific colors)
- [ ] Missing responsive design for tablet and mobile
- [ ] Filter state lost on browser back navigation

**What to add this wave:**
- [ ] Connect filters to API with URL state sync
- [ ] Implement all 7 status badge colors
- [ ] Add 4 stat cards above table with real data
- [ ] Add search functionality with debouncing
- [ ] Implement row actions dropdown with contextual actions per status
- [ ] Add bulk selection with checkbox column
- [ ] Implement "My Quotes" / "All Quotes" toggle
- [ ] Add saved filter presets
- [ ] Connect WebSocket for real-time status updates
- [ ] Implement responsive card view for mobile

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Filter-to-API connection with URL sync | High | Medium | P0 |
| Status badge colors and row actions | High | Low | P0 |
| Stat cards with real data | Medium | Low | P0 |
| Search with debouncing | High | Low | P0 |
| My/All toggle with role scoping | High | Medium | P1 |
| Bulk selection and actions | Medium | Medium | P1 |
| Saved filter presets | Medium | Medium | P1 |
| WebSocket real-time updates | Medium | Medium | P1 |
| Responsive card view (mobile) | Medium | High | P2 |
| Column visibility toggle | Low | Medium | P2 |
| Row hover preview | Low | Medium | P3 |

### Future Wave Preview

- **Wave 2:** AI-powered quote scoring (likelihood of acceptance based on historical data). Smart follow-up recommendations ("This customer typically responds within 2 days"). Batch quote generation for recurring lanes.
- **Wave 3:** Customer portal integration (show portal view status). Automated competitive analysis per quote. Quote template suggestions based on lane/customer patterns.

---

<!--
DESIGN NOTES:
1. The Quotes List is the most frequently accessed screen in the Sales service.
2. Performance is critical -- target under 1 second for data population with 50 rows.
3. Filter state persistence in URL is essential for sharing views between team members.
4. The "My Quotes" / "All Quotes" toggle is permission-gated, not role-gated (more flexible).
5. Stat cards should be clickable and apply their filter to the table below.
-->
