# Lane Preferences

> Service: Carrier Management | Wave: 3 | Priority: P1
> Route: /(dashboard)/carriers/[id]/lanes | Status: Not Started
> Primary Personas: Omar (Dispatcher/Operations), Sarah (Ops Manager)
> Roles with Access: dispatcher, operations_manager, admin

---

## 1. Purpose & Business Context

**What this screen does:**
Enables dispatchers and operations managers to configure, view, and analyze a carrier's preferred lanes (origin-destination pairs), historical lane performance, and rate competitiveness. The screen combines an interactive US map visualization with a detailed lane table, giving users both geographic intuition and granular data.

**Business problem it solves:**
When a load needs to be covered, dispatchers often call carriers at random or rely on memory ("I think Swift does Chicago to Dallas"). This wastes 10-20 minutes per load and misses optimal carrier-lane matches. Carrier lane preferences solve this by creating a structured database of which carriers prefer which lanes, at what rates, and with what performance track record. A carrier that runs Chicago-Dallas 15 times a month with 97% on-time will always beat a carrier doing it for the first time -- but without lane data, the dispatcher has no way to know. Additionally, this screen helps rate negotiation: if a carrier's preferred rate for a lane is $2.15/mile but the market rate is $2.05/mile, the operations manager has leverage to negotiate. Brokerages that manage carrier lane preferences report 25% faster load coverage and 10-15% savings on carrier spend by matching the right carrier to the right lane.

**Key business rules:**
- A lane is defined as a unique origin-destination pair (state or city level) combined with an equipment type.
- Preferred rates are carrier-quoted rates per mile, not guaranteed -- actual rates are negotiated per load.
- Lane status can be: PREFERRED (carrier actively wants this lane), AVAILABLE (carrier will accept if offered), or INACTIVE (carrier no longer runs this lane).
- Lane history auto-populates from completed loads -- any completed load creates or updates a lane record.
- Market rate comparison requires integration with Rate Intelligence service (Service 35); if not available, show "N/A."
- Only carriers with ACTIVE status can have lane preferences edited.
- Lanes with no activity in 180+ days auto-flag as "Stale" for review.

**Success metric:**
Load coverage time decreases by 30% for lanes with carrier preferences defined. Carrier lane utilization (loads assigned to carriers on their preferred lanes) increases from <20% to >60%.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Carrier Detail | Click "Lanes" tab or "Lane Preferences" section | carrierId, carrier name |
| Carrier Scorecard | Click a lane in "Most Frequent Lanes" table | carrierId, originState, destinationState |
| Dispatch Board | Click "Find Carrier for Lane" action | originCity/state, destCity/state, equipmentType |
| Load Detail | Click "View Carrier Lanes" from assigned carrier info | carrierId, load origin, load destination |
| Direct URL | Bookmark / shared link | Route params, optional lane filter |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Carrier Detail | Click breadcrumb or "Back to Carrier" | carrierId |
| Carrier Scorecard | Click "View Performance" for a specific lane | carrierId, lane filter |
| Load Detail | Click a load number in lane history | loadId |
| Dispatch Board | Click "Assign Load on This Lane" action | carrierId, origin, destination, equipmentType |
| Rate Intelligence (Lane Analysis) | Click "View Market Rate" for a lane | origin, destination, equipmentType |

**Primary trigger:**
Omar the dispatcher has a reefer load from Chicago, IL to Dallas, TX and needs the best carrier. He opens Lane Preferences for his top 3 preferred carriers to compare who has the strongest track record on this exact lane, then assigns the load to the carrier with the best on-time rate and most competitive rate.

**Success criteria (user completes the screen when):**
- User has identified which lanes a carrier prefers and performs well on.
- User has added or updated preferred lanes with current rate per mile.
- User has compared the carrier's rate to market rate for negotiation leverage.
- User has used lane data to make a carrier assignment decision.

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------+
|  Breadcrumb: Carriers > TransWest Logistics > Lane Preferences    |
+------------------------------------------------------------------+
|  Header: "Lane Preferences - TransWest Logistics"                  |
|  [GOLD badge]  67 total lanes | 42 active                        |
|                          [Add Lane] [Map/Table Toggle] [Export]    |
+------------------------------------------------------------------+
|  Map View (top half, ~400px height)                                |
|  +--------------------------------------------------------------+|
|  |                                                               ||
|  |       US Map with lane lines                                  ||
|  |       (Thick blue lines for high-volume lanes,                ||
|  |        thin gray lines for low-volume,                        ||
|  |        green for high on-time, red for low on-time)           ||
|  |       Click a line to see lane details in tooltip             ||
|  |       Click origin dot → click destination dot → add lane     ||
|  |                                                               ||
|  +--------------------------------------------------------------+|
+------------------------------------------------------------------+
|  Filters Bar:                                                      |
|  [Search origin/dest...] [Equipment Type v] [Status v]             |
|  [Activity Period v: Active last 30/60/90 days] [Region v]         |
+------------------------------------------------------------------+
|  Lane Table (bottom half)                                          |
|  +--------------------------------------------------------------+|
|  | Origin       | Destination  | Equip  | Rate/Mi | Loads | OT% ||
|  | Status | Last Load | Market Rate | Delta | Actions            ||
|  |--------------------------------------------------------------||
|  | Chicago, IL  | Dallas, TX   | Reefer | $2.15   |  15   | 97% ||
|  | Preferred    | 01/10/2026  | $2.05   | +$0.10  | [...]        ||
|  |--------------------------------------------------------------||
|  | Atlanta, GA  | Memphis, TN  | DryVan | $1.98   |   8   | 88% ||
|  | Preferred    | 01/05/2026  | $2.10   | -$0.12  | [...]        ||
|  |--------------------------------------------------------------||
|  | LA, CA       | Phoenix, AZ  | Flatbed| $2.45   |   6   | 100%||
|  | Available    | 12/28/2025  | $2.50   | -$0.05  | [...]        ||
|  |--------------------------------------------------------------||
|  | (more rows...)                                                ||
|  +--------------------------------------------------------------+|
|  Pagination: Showing 1-25 of 67 lanes                             |
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible, above fold) | Map visualization showing lane corridors, origin-destination pair, equipment type, on-time percentage | Dispatchers need a visual sense of the carrier's coverage area and strongest lanes |
| **Secondary** (visible in table) | Preferred rate per mile, load count on lane, lane status, market rate delta | Important for rate comparison and assignment decisions |
| **Tertiary** (on scroll/expand) | Last load date, full lane history, individual load details on lane | Needed for deep analysis but not for quick decisions |
| **Hidden** (behind click) | Lane history modal (all loads on this lane), rate trend for lane, edit lane form | Investigation and management actions |

---

## 4. Data Fields & Display

### Visible Fields

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Origin | CarrierLane.originCity + CarrierLane.originState | "City, ST" format (e.g., "Chicago, IL"); state-only view also available | Table column 1, Map dot |
| 2 | Destination | CarrierLane.destinationCity + CarrierLane.destinationState | "City, ST" format | Table column 2, Map dot |
| 3 | Equipment Type | CarrierLane.equipmentType | Icon + label (per equipment type colors in status-color-system.md) | Table column 3 |
| 4 | Preferred Rate/Mile | CarrierLane.preferredRatePerMile | "$X.XX" format, editable inline | Table column 4 |
| 5 | Loads Completed | Calculated (count of loads on this lane) | Integer | Table column 5 |
| 6 | On-Time % | Calculated (on-time deliveries / total deliveries on lane * 100) | "XX%" with color coding (green >=95%, amber 85-94%, red <85%) | Table column 6 |
| 7 | Lane Status | CarrierLane.status | Badge: PREFERRED (green), AVAILABLE (blue), INACTIVE (gray) | Table column 7 |
| 8 | Last Load Date | CarrierLane.lastLoadDate | "MM/DD/YYYY" format; amber text if >90 days ago, red if >180 days | Table column 8 |
| 9 | Market Rate | From Rate Intelligence API | "$X.XX" format; "N/A" if unavailable | Table column 9 |
| 10 | Rate Delta | Calculated | "+$X.XX" (red, carrier costs more) or "-$X.XX" (green, carrier costs less) vs market | Table column 10 |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | On-Time % Per Lane | COUNT(loads WHERE delivered_on_time=true AND lane=thisLane) / COUNT(loads WHERE lane=thisLane) * 100 | Percentage, color-coded |
| 2 | Rate Delta | CarrierLane.preferredRatePerMile - marketRatePerMile | Dollar amount, green if negative (carrier cheaper), red if positive |
| 3 | Lane Volume Rank | Rank lanes by load count descending | Used for map line thickness |
| 4 | Stale Flag | lastLoadDate < now() - 180 days | Boolean -- shows amber "Stale" badge next to lane status |
| 5 | Auto-Suggested Lanes | Lanes from completed loads not yet in preferences | Shown in "Suggested Lanes" callout |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] Interactive US map showing carrier's lanes as lines connecting origin and destination dots
- [ ] Lane table with all columns: origin, destination, equipment type, rate, loads, on-time %, status, last load, market rate, delta
- [ ] Add new preferred lane via form (select origin, destination, equipment type, enter rate)
- [ ] Edit preferred rate per mile (inline edit or edit modal)
- [ ] Change lane status (PREFERRED, AVAILABLE, INACTIVE)
- [ ] Filter by equipment type, lane status, activity period
- [ ] Sort table by any column
- [ ] Map lines color-coded by volume (thick blue = high volume, thin gray = low volume)
- [ ] Click a lane row to see load history on that lane

### Advanced Features (Logistics Expert Recommendations)

- [ ] Map-click lane creation: click an origin point on the map, then click a destination point, and a lane creation form appears pre-filled with the selected cities
- [ ] Auto-suggest lanes: based on the carrier's load history, suggest lanes they frequently run but haven't officially added to preferences
- [ ] Market rate comparison column: show DAT/Greenscreens market rate for each lane with delta to carrier's preferred rate
- [ ] Lane history trend: click a lane to see a mini-chart of loads over time (monthly bar chart)
- [ ] Rate trend per lane: how the carrier's rate on this lane has changed over the past 12 months
- [ ] Export lane data to CSV for rate negotiation meetings
- [ ] "Assign Load" quick action: from any lane row, click to open load selector filtered to matching origin/destination
- [ ] Heatmap mode on map: instead of lines, show origin/destination dots sized by volume
- [ ] Multi-carrier lane comparison: compare this carrier's lanes with another carrier (side by side)
- [ ] Stale lane cleanup: bulk-action to deactivate all lanes with no activity in 180+ days

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| Edit lane preferences | dispatcher, admin | carrier_manage | Lane table is read-only, no edit/add buttons |
| View market rate | any authenticated | rate_intelligence_view | Market Rate and Delta columns show "N/A" |
| View rate per mile | dispatcher, operations_manager, admin | finance_view | Rate/Mile column hidden |
| Delete lane | admin | carrier_manage | Delete action hidden in row menu |
| Export CSV | any authenticated | export_data | Export button disabled |

---

## 6. Status & State Machine

### Status Transitions (Lane Status)

```
[No Lane Record] ---(Add Lane manually)---> [PREFERRED]
                  ---(Add Lane manually)---> [AVAILABLE]
                  ---(Auto-created from load history)---> [AVAILABLE]

[PREFERRED] ---(Carrier no longer wants lane)---> [INACTIVE]
[PREFERRED] ---(Downgrade preference)---> [AVAILABLE]

[AVAILABLE] ---(Carrier requests this lane)---> [PREFERRED]
[AVAILABLE] ---(No activity 180+ days)---> [INACTIVE] (auto, with notification)

[INACTIVE] ---(Reactivate)---> [AVAILABLE]
[INACTIVE] ---(Reactivate as preferred)---> [PREFERRED]
```

### Actions Available Per Status

| Status | Available Actions | Restricted Actions |
|---|---|---|
| PREFERRED | Edit Rate, Change to Available, Deactivate, View History, Assign Load | N/A |
| AVAILABLE | Edit Rate, Change to Preferred, Deactivate, View History, Assign Load | N/A |
| INACTIVE | Reactivate (to Available or Preferred), View History, Delete | Edit Rate, Assign Load |

### Status Badge Colors

| Status | Background | Text | Tailwind Classes |
|---|---|---|---|
| PREFERRED | green-100 (#D1FAE5) | green-800 (#065F46) | `bg-emerald-100 text-emerald-800` |
| AVAILABLE | blue-100 (#DBEAFE) | blue-800 (#1E40AF) | `bg-blue-100 text-blue-800` |
| INACTIVE | gray-100 (#F3F4F6) | gray-700 (#374151) | `bg-gray-100 text-gray-700` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Top-Right of Page)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| Add Lane | Plus | Primary / Blue | Opens add lane form (origin, destination, equipment type, rate, status) | No |
| Map/Table Toggle | Map / List | Ghost / Outline | Toggle between map+table view and full-table view | No |
| Export CSV | Download | Secondary / Outline | Downloads CSV of all lanes with metrics | No |

### Secondary Actions (Row-Level "More" Menu)

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| Edit Lane | Pencil | Opens edit modal with current lane details pre-filled | Status is PREFERRED or AVAILABLE |
| View Lane History | History | Opens drawer showing all loads completed on this lane (table with dates, ratings, rates) | Always available |
| Assign Load | Truck | Opens load selector modal filtered to this lane's origin, destination, and equipment type | Status is PREFERRED or AVAILABLE |
| Change Status | ArrowUpDown | Dropdown to change between PREFERRED, AVAILABLE, INACTIVE | Always available |
| View Market Rate | DollarSign | Opens Rate Intelligence lane analysis for this O-D pair in new tab | Rate Intelligence service available |
| Deactivate Lane | XCircle | Changes status to INACTIVE | Status is PREFERRED or AVAILABLE |
| Delete Lane | Trash | Permanently removes lane record | Admin only, status is INACTIVE |

### Map Interactions

| Interaction | Target | Action |
|---|---|---|
| Click lane line | Any line on map | Highlight the line, show tooltip with origin, destination, load count, on-time %, rate. Scroll lane table to matching row. |
| Click origin dot | City/state marker | Start lane creation mode -- "Now click a destination" |
| Click destination dot (after origin) | Second city/state marker | Open lane creation form pre-filled with selected origin and destination |
| Hover lane line | Any line | Show abbreviated tooltip: "Chicago, IL > Dallas, TX: 15 loads, 97% on-time" |
| Zoom/Pan | Map | Standard map zoom and pan controls |
| Toggle heatmap | Map control | Switch between line view and heatmap dot view |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + N | Add new lane |
| Ctrl/Cmd + M | Toggle map/table view |
| Ctrl/Cmd + E | Export CSV |
| Escape | Close modal / cancel lane creation |
| Arrow Up/Down | Navigate table rows |
| Enter | Open selected lane detail/history |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| N/A | -- | No drag-drop on this screen |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| load.completed | { loadId, carrierId, origin, destination, equipmentType, onTime } | If this carrier, update lane's load count and on-time %, flash updated row, add/thicken map line |
| carrier.lane.updated | { carrierId, laneId, field, newValue } | Update lane table row, flash highlight |
| rate.market.updated | { origin, destination, equipmentType, newRate } | Update market rate and delta columns for matching lanes |

### Live Update Behavior

- **Update frequency:** WebSocket push for load completions and lane edits. Market rate updates poll every 24 hours (not real-time).
- **Visual indicator:** Updated lane row flashes with blue-100 background for 2 seconds. Map lines pulse briefly when their data changes.
- **Conflict handling:** If user is editing a lane that updates remotely, show banner: "Lane data has been updated. Save your changes or refresh."

### Polling Fallback

- **When:** WebSocket connection drops
- **Interval:** Every 60 seconds
- **Endpoint:** GET /api/carriers/:id/lanes?updatedSince={lastPollTimestamp}
- **Visual indicator:** "Live updates paused" subtitle in page header

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Edit rate per mile | Immediately update rate in table cell | Revert to old value, show error toast |
| Change lane status | Immediately update badge color | Revert badge, show error toast |
| Add new lane | Immediately add row to table with loading spinner | Remove row, show error toast |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| PageHeader | src/components/layout/page-header.tsx | title, breadcrumbs, actions |
| DataTable | src/components/ui/data-table.tsx | columns, data, pagination, sorting |
| FilterBar | src/components/ui/filter-bar.tsx | filters: FilterConfig[] |
| StatusBadge | src/components/ui/status-badge.tsx | status, size |
| TierBadge | src/components/carrier/tier-badge.tsx | tier |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| DataTable | Basic sort and pagination | Add inline editable cells (for rate/mile), color-coded percentage columns, clickable row expand |
| FilterBar | Text and select filters | Add activity period selector (Last 30/60/90 days), region multi-select |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| LaneMap | Interactive US map (Mapbox or Leaflet) showing lane lines between origin/destination dots. Lines vary in thickness by load count and color by on-time rate. Supports click-to-create-lane workflow. | High |
| LaneCreationForm | Modal or slide-out form: origin (city/state picker or map click), destination (city/state picker or map click), equipment type dropdown, rate per mile input, status radio. | Medium |
| LaneHistoryDrawer | Right slide-out drawer showing all loads on a specific lane: table with load#, dates, rate, on-time status, rating. Mini bar chart of monthly loads. | Medium |
| RateDeltaCell | Inline table cell showing rate delta with color coding: green if carrier is cheaper than market, red if more expensive, gray if N/A. | Small |
| MapTableToggle | Toggle button group to switch between map+table view and full-table-only view. Animates transition. | Small |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Sheet | sheet | Lane history drawer |
| Dialog | dialog | Add/edit lane modal |
| Toggle Group | toggle-group | Map/Table view toggle |
| Tooltip | tooltip | Map lane hover tooltips |
| Input | input | Rate per mile inline edit |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/carriers/:id/lanes | Fetch all lanes for a carrier with metrics | useCarrierLanes(carrierId, filters) |
| 2 | POST | /api/carriers/:id/lanes | Create a new lane preference | useCreateLane() |
| 3 | PATCH | /api/carriers/:id/lanes/:laneId | Update lane (rate, status) | useUpdateLane() |
| 4 | DELETE | /api/carriers/:id/lanes/:laneId | Delete lane record | useDeleteLane() |
| 5 | GET | /api/carriers/:id/lanes/:laneId/history | Fetch load history for a specific lane | useLaneHistory(carrierId, laneId) |
| 6 | GET | /api/carriers/:id/lanes/map | Fetch lane data optimized for map rendering (coordinates, metrics) | useLaneMapData(carrierId) |
| 7 | GET | /api/carriers/:id/lanes/suggestions | Fetch auto-suggested lanes based on load history | useLaneSuggestions(carrierId) |
| 8 | GET | /api/rates/market?origin=X&dest=Y&type=Z | Fetch market rate for a lane (from Rate Intelligence service) | useMarketRate(origin, dest, type) |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| carrier:{carrierId} | carrier.lane.updated | useCarrierLaneUpdates(carrierId) -- invalidates lanes query |
| loads:{tenantId} | load.completed (filter by carrierId) | useLaneLoadStream(carrierId) -- updates lane metrics |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 500 |
|---|---|---|---|---|---|
| GET /api/carriers/:id/lanes | Show filter error toast | Redirect to login | Show "Access Denied" page | Show "Carrier not found" | Error state with retry |
| POST /api/carriers/:id/lanes | Show validation errors (duplicate lane, missing fields) | Redirect to login | "Permission Denied" toast | "Carrier not found" | Error toast with retry |
| GET /api/rates/market | Silently fail -- show "N/A" in market rate column | Redirect to login | Show "N/A" | Show "N/A" | Show "N/A" with tooltip "Market rate unavailable" |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Map area shows a placeholder US map outline (static SVG) with pulse animation. Table shows 8 skeleton rows with column-width-matched gray bars. Filter bar renders immediately.
- **Progressive loading:** Map loads independently from table. Table data may arrive first (show table, map loading). If map library fails to load, show full-table view automatically.
- **Duration threshold:** If map exceeds 5s, show "Loading map..." message. If table exceeds 5s, show "Loading lane data..." message.

### Empty States

**First-time empty (no lanes defined, no load history):**
- **Illustration:** Map with dotted line and a plus icon
- **Headline:** "No lane preferences yet"
- **Description:** "Add preferred lanes for [Carrier Name] to streamline dispatching and rate negotiation. Lanes will also auto-populate as loads are completed."
- **CTA Button:** "Add First Lane" -- primary blue button

**Filtered empty (lanes exist but filters exclude all):**
- **Headline:** "No lanes match your filters"
- **Description:** "Try adjusting your filters or search terms."
- **CTA Button:** "Clear All Filters" -- secondary outline button

**Auto-suggested lanes available:**
- **Callout (info banner):** "Based on load history, [Carrier Name] frequently runs [X] lanes not yet in their preferences. [Review Suggestions]"

### Error States

**Full page error:**
- Error icon + "Unable to load lane preferences" + Retry button

**Map error (map loads but data fails):**
- Show empty map with message: "Lane data unavailable. Showing table view." + auto-switch to table-only mode.

**Market rate unavailable:**
- Market Rate column shows "N/A" with tooltip: "Market rate data is currently unavailable. Check back later."

### Permission Denied

- **Full page denied:** "You don't have permission to view carrier lane preferences" with link to Carriers list.
- **Partial denied:** Rate columns hidden for users without finance_view. Edit/Add buttons hidden for users without carrier_manage.

### Offline / Degraded

- **Full offline:** Show banner: "You're offline. Showing cached lane data from [timestamp]."
- **Map offline:** Map tiles may not load. Show static US outline with lane lines drawn from cached data.

---

## 12. Filters, Search & Sort

### Filters

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Equipment Type | Multi-select dropdown | All 12 equipment types | All | ?type=REEFER,DRY_VAN |
| 2 | Lane Status | Multi-select dropdown | PREFERRED, AVAILABLE, INACTIVE | PREFERRED + AVAILABLE | ?status=PREFERRED,AVAILABLE |
| 3 | Activity Period | Select dropdown | Active last 30 days, 60 days, 90 days, 6 months, 1 year, All time | All time | ?activeSince=30d |
| 4 | Region | Multi-select | Origin or destination state, grouped by region | All | ?region=TX,IL |

### Search Behavior

- **Search field:** Single search input at left of filter bar
- **Searches across:** Origin city/state, destination city/state
- **Behavior:** Debounced 300ms, minimum 2 characters
- **URL param:** ?search=

### Sort Options

| Column / Field | Default Direction | Sort Type |
|---|---|---|
| Origin | Ascending (A-Z) | Alphabetic |
| Destination | Ascending (A-Z) | Alphabetic |
| Loads Completed | Descending (most first) | Numeric |
| On-Time % | Descending (best first) | Numeric |
| Rate/Mile | Ascending (cheapest first) | Numeric |
| Last Load Date | Descending (most recent first) | Date |
| Status | Custom (PREFERRED first, then AVAILABLE, then INACTIVE) | Custom enum |

**Default sort:** Loads Completed descending (show most-used lanes first)

### Saved Filters / Presets

- **System presets:** "Active Preferred Lanes", "Stale Lanes (180+ days)", "Reefer Lanes Only", "Best Performing (95%+ OT)"
- **User-created presets:** Users can save filter combinations
- **URL sync:** All filters reflected in URL params

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Map section: reduced to 300px height, still interactive
- Table columns: hide Market Rate, Delta, Last Load Date; show on row expand
- Filters collapse to "Filters" button
- Map and table stack vertically (map on top, table below)

### Mobile (< 768px)

- Map section: reduced to 250px height, simplified (no click-to-create lane)
- Data table switches to card-based list: each card shows origin > destination (with arrow), equipment icon, load count, on-time %, status badge
- Tap card to expand: rate, market rate, delta, last load date
- Add Lane button moves to sticky bottom bar
- Filters: full-screen modal
- Map/Table toggle: default to table on mobile
- Swipe left on card for quick actions (edit, view history)

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full layout with map (400px) + table |
| Desktop | 1024px - 1439px | Map (350px) + table, slightly narrower |
| Tablet | 768px - 1023px | See tablet notes |
| Mobile | < 768px | See mobile notes |

---

## 14. Stitch Prompt

```
Design a carrier lane preferences page for a modern freight/logistics TMS called "Ultra TMS." This screen shows a carrier's preferred shipping lanes on a map and in a data table.

Layout: Full-width page with dark slate-900 sidebar (240px) on left, white content area on right. Breadcrumb: "Carriers > TransWest Logistics > Lane Preferences". Page title: "Lane Preferences - TransWest Logistics" with a gold tier badge. Subtitle: "67 total lanes | 42 active". Top-right buttons: primary blue "Add Lane" with plus icon, ghost "Map/Table" toggle with map icon (map mode active), secondary outlined "Export CSV" with download icon.

Map Section (top half, ~400px height): Show a clean US map (light gray states with subtle borders) with lane lines connecting origin and destination points. Show approximately 8-10 lane lines of varying thickness and color:
- Thick blue line: Chicago, IL to Dallas, TX (high volume, 15 loads)
- Medium blue line: Atlanta, GA to Memphis, TN (8 loads)
- Medium green line: Los Angeles, CA to Phoenix, AZ (6 loads, 100% on-time)
- Thin blue line: Houston, TX to Jacksonville, FL (5 loads)
- Thin gray line: Denver, CO to Salt Lake City, UT (2 loads)
Origin and destination dots should be small circles (blue for active lanes). On hover over a line, show a tooltip card: "Chicago, IL > Dallas, TX | Reefer | 15 loads | 97% OT | $2.15/mi". Map should have zoom controls in bottom-right corner.

Filter Bar (below map): Search input with magnifying glass (placeholder: "Search origin or destination..."), "Equipment Type" multi-select dropdown, "Status" multi-select (Preferred, Available, Inactive), "Activity" dropdown (Last 30 days, 60 days, 90 days, All), "Clear Filters" text link.

Lane Table (below filters): Data table with columns: Origin (city, state), Destination (city, state), Equipment Type (colored icon + text), Preferred Rate/Mi ($X.XX), Loads (integer), On-Time % (color-coded), Status (badge), Last Load (date), Market Rate ($X.XX), Delta (+/- colored). Show 8 rows of realistic data:

1. Chicago, IL | Dallas, TX | [snowflake] Reefer | $2.15 | 15 | 97% (green) | Preferred (green badge) | 01/10/2026 | $2.05 | +$0.10 (red text)
2. Atlanta, GA | Memphis, TN | [container] Dry Van | $1.98 | 8 | 88% (amber) | Preferred (green badge) | 01/05/2026 | $2.10 | -$0.12 (green text)
3. Los Angeles, CA | Phoenix, AZ | [flatbed] Flatbed | $2.45 | 6 | 100% (green) | Available (blue badge) | 12/28/2025 | $2.50 | -$0.05 (green text)
4. Houston, TX | Jacksonville, FL | [container] Dry Van | $1.87 | 5 | 80% (red) | Preferred (green badge) | 12/15/2025 | $1.95 | -$0.08 (green text)
5. Denver, CO | Salt Lake City, UT | [snowflake] Reefer | $2.30 | 3 | 100% (green) | Available (blue badge) | 11/20/2025 | $2.25 | +$0.05 (red text)
6. Miami, FL | Orlando, FL | [container] Dry Van | $1.65 | 2 | 100% (green) | Available (blue badge) | 10/30/2025 | $1.70 | -$0.05 (green text)
7. Seattle, WA | Portland, OR | [snowflake] Reefer | $1.90 | 2 | 50% (red) | Inactive (gray badge) | 08/14/2025 | $1.85 | +$0.05 (red text)
8. New York, NY | Boston, MA | [container] Dry Van | $2.00 | 1 | 100% (green) | Inactive (gray badge) | 07/01/2025 | $2.15 | -$0.15 (green text)

Each row has a "..." actions menu on the far right.

Pagination at bottom: "Showing 1-25 of 67" with page buttons.

Also show a subtle info callout banner above the table: light blue background with info icon: "3 suggested lanes based on load history. [Review Suggestions]"

Design Specifications:
- Font: Inter, 14px base
- Map: clean, minimal US map with light gray fill and white borders between states
- Lane lines: SVG paths with rounded caps, varying thickness (2px to 6px based on volume)
- Content background: white
- Primary color: blue-600 for buttons, links, interactive elements
- Status badges: green "Preferred", blue "Available", gray "Inactive"
- On-time percentages: green >=95%, amber 85-94%, red <85%
- Rate delta: green text for carrier-cheaper, red text for carrier-pricier
- Table rows: 44px height, hover gray-50 background
- Modern SaaS aesthetic similar to Linear.app
```

---

## 15. Enhancement Opportunities

### Current State (Wave 3)

**What's built and working:**
- [ ] Nothing built yet -- screen is in design phase

**What needs polish / bug fixes:**
- N/A (not yet built)

**What to add this wave:**
- [ ] Lane table with all columns and sorting
- [ ] Add/edit/deactivate lane actions
- [ ] Basic US map with lane lines
- [ ] Equipment type and status filters
- [ ] Lane status badges (Preferred, Available, Inactive)
- [ ] Click-to-view lane history in drawer

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Lane table with full columns | High | Medium | P0 |
| Add/edit lane forms | High | Medium | P0 |
| Basic US map with lane lines | High | High | P0 |
| Market rate comparison column | High | Medium | P1 |
| Map click-to-create lane | Medium | High | P1 |
| Auto-suggested lanes from history | Medium | Medium | P1 |
| Lane history drawer | Medium | Medium | P1 |
| Rate trend per lane | Medium | Medium | P2 |
| Multi-carrier lane comparison | Medium | High | P2 |
| Stale lane cleanup tool | Low | Low | P2 |

### Future Wave Preview

- **Wave 4:** Full market rate integration (DAT/Greenscreens), rate trend charts per lane, multi-carrier lane comparison tool, and automated "best carrier for lane" suggestions.
- **Wave 5:** AI-powered lane optimization recommending new lanes carriers should consider based on deadhead patterns, seasonal demand shifts, and capacity forecasting. Integration with external load boards to show available loads on a carrier's preferred lanes.

---
