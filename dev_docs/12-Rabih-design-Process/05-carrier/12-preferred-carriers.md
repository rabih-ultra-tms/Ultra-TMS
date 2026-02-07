# Preferred Carriers

> Service: Carrier Management | Wave: 3 | Priority: P1
> Route: /(dashboard)/carriers/preferred | Status: Built
> Primary Personas: Omar (Dispatcher/Operations), Maria (Dispatcher for carrier search), Sarah (Ops Manager)
> Roles with Access: dispatcher, operations_manager, admin

---

## 1. Purpose & Business Context

**What this screen does:**
Provides a curated, organized list of preferred and favorite carriers that dispatchers use as their first source when covering loads. This is the dispatcher's daily workhorse -- before going to the full carrier list or load boards, they check their preferred carriers list. The screen supports organizing carriers by customer-specific preferences, lane-specific strengths, and equipment-type specialization, with quick-dispatch capabilities directly from the list.

**Business problem it solves:**
A brokerage with 500+ carriers in their database cannot treat them all equally. In practice, 20% of carriers handle 80% of loads, and dispatchers have mental favorites based on reliability, communication quality, and rate competitiveness. Without a formalized preferred carriers list, this tribal knowledge is locked in individual dispatchers' heads. When a dispatcher is out sick, the backup dispatcher does not know which carriers are reliable on the Chicago-Dallas lane or which reefer carrier always answers the phone. Preferred carrier lists formalize this institutional knowledge, ensure consistent carrier selection across the team, and reduce the "cold calling random carriers" problem. Additionally, customer-specific preferred carriers (e.g., "For Acme Manufacturing, always try these 3 carriers first") improve customer satisfaction by ensuring consistent service quality on their lanes. Brokerages that maintain preferred carrier lists report 35% faster load coverage and 20% fewer service failures.

**Key business rules:**
- Any active carrier can be added to the preferred list; carrier must have status ACTIVE.
- Preferred carriers can be organized by: global (company-wide), customer-specific, lane-specific, or equipment-specific.
- Each preferred carrier entry can have a private note explaining why they are preferred.
- Preferred carrier list changes are audited (who added/removed, when, why).
- Removing a carrier from the preferred list does not change their carrier status -- it only removes the "preferred" tag.
- A carrier's compliance status is monitored: if a preferred carrier's insurance expires or authority is revoked, an alert is shown on their card.
- Preferred carrier ranking within a category is manual (drag to reorder) and determines the order in which carriers are suggested for loads.
- Maximum preferred carriers per category: no hard limit, but system warns at 25+ per category ("Consider narrowing your list for faster decisions").

**Success metric:**
Percentage of loads covered by preferred carriers increases from <30% to >65%. Average load coverage time when using preferred carriers is under 5 minutes versus 20+ minutes when searching the full carrier database.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Carrier Dashboard | Click "Preferred Carriers" KPI card or sidebar nav | None |
| Carriers List | Click "Add to Preferred" action on a carrier row | carrierId to add |
| Dispatch Board | Click "Find Preferred Carrier" for a specific load | loadId, equipmentType, origin, destination |
| Carrier Detail | Click "Add to Preferred" button | carrierId |
| Load Detail | Click "Find Preferred Carrier" in carrier assignment section | loadId, lane info, equipment type |
| Direct URL | Bookmark / shared link | Route params, optional filters |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Carrier Detail | Click carrier name or "View Profile" | carrierId |
| Carrier Scorecard | Click score/rating on carrier card | carrierId |
| Dispatch Board | Click "Assign to Load" from carrier card | carrierId, equipmentType |
| Load Detail | Click "Assign" after selecting load in load selector | carrierId, loadId |
| Lane Preferences | Click lane count on carrier card | carrierId |
| Carrier Contacts | Click "Call Dispatch" on carrier card | carrierId |

**Primary trigger:**
Maria the dispatcher has a new load to cover: a dry van from Atlanta, GA to Memphis, TN. She opens Preferred Carriers, filters by equipment type "Dry Van" and sees her ranked list of preferred dry van carriers. She checks who is available, compares scores, and assigns the load to her top choice in under 3 minutes.

**Success criteria (user completes the screen when):**
- User has quickly identified the best available preferred carrier for their load.
- User has assigned a load to a preferred carrier via "Assign to Load" action.
- User has managed the preferred list (added, removed, reordered, or annotated carriers).

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------+
|  Top Bar: Breadcrumb (Carriers > Preferred) / Page Title          |
|  "Preferred Carriers"                                              |
|  24 preferred carriers              [+ Add to Preferred] [Card/Table] |
+------------------------------------------------------------------+
|  Organization Tabs (horizontal tabs)                               |
|  [All (24)] [By Customer (8)] [By Lane (12)] [By Equipment (18)]  |
+------------------------------------------------------------------+
|  Filters Bar:                                                      |
|  [Search carrier...] [Equipment Type v] [Tier v] [Availability v]  |
|  [Sort: Score desc v]                                              |
+------------------------------------------------------------------+
|  Auto-Suggest Banner (conditional)                                 |
|  [i] For Load FM-2026-0984 (Dry Van, Atlanta > Memphis):          |
|      Recommended: 1. Alpine Carriers (98% OT) 2. Swift (95% OT)  |
|      [Assign Alpine] [Compare All]                                 |
+------------------------------------------------------------------+
|  Carrier Cards Grid (3 columns)                                    |
|  +------------------+ +------------------+ +------------------+   |
|  | [GOLD badge]     | | [PLATINUM badge] | | [SILVER badge]   |  |
|  | Swift Transport   | | Alpine Carriers  | | Midwest Haulers  |  |
|  | [DryVan][Reefer]  | | [Reefer][Flatbed]| | [Flatbed][StepDk]|  |
|  | Score: 82/100     | | Score: 95/100    | | Score: 68/100    |  |
|  | OT: 92% | Claims:1%| OT: 98% | Claims:0.5%| OT: 85%| Claims:2.1%|
|  | 15 pref lanes     | | 8 pref lanes     | | 12 pref lanes    |  |
|  | Last used: 01/14  | | Last used: 01/12 | | Last used: 01/10 |  |
|  | [Avail] badge     | | [Avail] badge    | | [Committed]      |  |
|  | Note: "Best for   | | Note: "Top reefer| | Note: "Good OD   |  |
|  |  TX-OK-KS lanes"  | |  in Midwest"     | |  rates"          |  |
|  |                    | |                  | |                  |  |
|  | [Assign] [Compare]| | [Assign] [Comp]  | | [Assign] [Comp]  |  |
|  | [Call] [Score] [x]| | [Call] [Score] [x]| | [Call] [Scr] [x] |  |
|  +------------------+ +------------------+ +------------------+   |
|  (more cards...)                                                   |
+------------------------------------------------------------------+
|  Comparison Panel (appears when 2-3 carriers selected)             |
|  +--------------------------------------------------------------+|
|  | COMPARING 2 CARRIERS        [Clear Comparison] [Assign Best] ||
|  | Metric      | Swift Transport | Alpine Carriers | Winner     ||
|  | Score       | 82              | 95              | Alpine     ||
|  | OT Delivery | 92%             | 98%             | Alpine     ||
|  | Claims Rate | 1.0%            | 0.5%            | Alpine     ||
|  | Avg Rate/Mi | $2.15           | $2.25           | Swift      ||
|  | Rating      | 4.2/5           | 4.8/5           | Alpine     ||
|  +--------------------------------------------------------------+|
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible on card) | Carrier name, tier badge, equipment type icons, overall score, on-time %, availability status | Dispatchers need to instantly scan: who is it, what tier, what equipment, are they available? |
| **Secondary** (visible on card) | Claims rate, preferred lanes count, last used date, dispatcher note | Context for quick comparison without clicking through |
| **Tertiary** (available on hover/expand) | Full scorecard summary, contact info, lane list, rate per mile | Details needed only when choosing between finalists |
| **Hidden** (behind click -- detail page) | Full carrier profile, complete load history, insurance details, FMCSA data | Deep investigation when carrier selection matters more |

---

## 4. Data Fields & Display

### Visible Fields

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Carrier Name | Carrier.companyName | Text, 16px medium weight, clickable link | Card header |
| 2 | Tier Badge | Carrier.tier | Colored badge with icon (Crown/Award/Medal/Shield) per status-color-system.md Section 8 | Card top-right |
| 3 | Equipment Types | Carrier equipment (aggregated) | Small colored icons for each equipment type the carrier operates (max 4, "+X more" overflow) | Below carrier name |
| 4 | Overall Score | CarrierMetrics.overallScore | "XX/100" with small gauge or colored number | Card body |
| 5 | On-Time % | CarrierMetrics.onTimeDeliveryRate | "OT: XX%" color-coded (green >=95%, amber 85-94%, red <85%) | Card body |
| 6 | Claims Rate | CarrierMetrics.claimsRate | "Claims: X.X%" color-coded (green <2%, amber 2-3%, red >3%) | Card body |
| 7 | Preferred Lanes Count | COUNT(CarrierLanes WHERE status=PREFERRED) | "X pref lanes" | Card body |
| 8 | Last Used Date | PreferredCarrier.lastUsedDate | "Last used: MM/DD" relative format | Card body |
| 9 | Availability | Equipment availability status | Badge: AVAILABLE (green), COMMITTED (blue, all trucks busy), PARTIAL (amber, some available) | Card badge, prominent |
| 10 | Note | PreferredCarrier.note | Italic text, truncated to 2 lines with "..." | Card bottom |
| 11 | Compliance Alert | Calculated | Red dot indicator if insurance expired or authority issue | Card top-left, overlaying avatar/logo |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Availability Status | Based on equipment: if any equipment AVAILABLE => "AVAILABLE", if all COMMITTED => "COMMITTED", if some available => "PARTIAL" | Badge color |
| 2 | Compliance Alert | If any insurance expired, or authority not AUTHORIZED, or safety UNSATISFACTORY | Red dot + tooltip describing the issue |
| 3 | Auto-Suggest Score | For load context: weighted score based on lane match, equipment match, carrier score, proximity, and rate | Rank number (1, 2, 3) in auto-suggest banner |
| 4 | Days Since Last Used | now() - lastUsedDate | Used for sorting; stale carriers (>90 days) show amber text |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] Card grid displaying all preferred carriers with key metrics (name, tier, equipment types, score, on-time, claims rate)
- [ ] Add carrier to preferred list (from this screen or from carrier list/detail)
- [ ] Remove carrier from preferred list with confirmation
- [ ] Filter by equipment type, tier, and availability
- [ ] Search by carrier name
- [ ] Organization tabs: All, By Customer, By Lane, By Equipment
- [ ] Card/Table view toggle (cards default, table for dense data)
- [ ] "Assign to Load" quick action from each carrier card (opens load selector)
- [ ] Carrier comparison: select 2-3 carriers and view side-by-side metrics
- [ ] Preferred carrier notes (why they are preferred)
- [ ] Compliance alert indicator on cards when carrier has issues

### Advanced Features (Logistics Expert Recommendations)

- [ ] Auto-suggest mode: when opened from Dispatch Board or Load Detail with load context, automatically rank preferred carriers by lane match + equipment match + score and show top 3 recommendations in a banner
- [ ] Quick dispatch: "Assign to Load" from card opens a streamlined modal (select load, confirm rate, send rate con) without leaving the page
- [ ] Drag-to-reorder: manually rank preferred carriers within a category by dragging cards
- [ ] Customer-specific grouping: organize preferred carriers by customer (e.g., "For Acme Manufacturing: Alpine, Swift, Midwest")
- [ ] Lane-specific grouping: tag carriers as preferred for specific lanes (e.g., "Chicago-Dallas preferred: Alpine, Swift")
- [ ] Alert when preferred carrier's compliance changes: push notification + red dot on card if insurance expires or authority changes
- [ ] "One-click call dispatch" button on each card that calls the carrier's dispatch contact
- [ ] Rate comparison on cards: show average rate per mile with market rate delta (finance_view only)
- [ ] Preferred carrier analytics: how often each preferred carrier is used, acceptance rate for tendered loads, trend over time
- [ ] Bulk manage: select multiple carriers to add/remove from preferred list or assign to a customer category

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| Add to preferred | dispatcher, admin | carrier_manage | "Add to Preferred" button hidden |
| Remove from preferred | dispatcher, admin | carrier_manage | "Remove" (x) button hidden |
| Assign to Load | dispatcher, admin | load_assign | "Assign" button hidden |
| View rate data | admin, finance | finance_view | Rate per mile data hidden from cards |
| Manage customer groupings | operations_manager, admin | carrier_manage | "By Customer" tab visible but read-only |
| Drag to reorder | dispatcher, admin | carrier_manage | Cards not draggable; fixed order by score |

---

## 6. Status & State Machine

### Status Transitions (Preferred Status)

```
[Not Preferred] ---(Add to Preferred)---> [PREFERRED]
                                              |
                                    (Remove from Preferred)
                                              |
                                              v
                                       [Not Preferred]
```

Note: "Preferred" is a tag/flag on the carrier, not a carrier status. The carrier's actual status (ACTIVE, INACTIVE, etc.) is separate. A preferred carrier that becomes INACTIVE or SUSPENDED should show a warning but remain in the preferred list until manually removed.

### Actions Available Per Card State

| Card State | Available Actions | Visual Indicators |
|---|---|---|
| Preferred + Active + Available | Assign to Load, Compare, Call, View Scorecard, Edit Note, Remove | Green "Available" badge |
| Preferred + Active + Committed | Compare, Call, View Scorecard, Edit Note, Remove | Blue "Committed" badge, "Assign" button disabled |
| Preferred + Active + Partial | Assign to Load, Compare, Call, View Scorecard, Edit Note, Remove | Amber "Partial" badge |
| Preferred + Compliance Issue | Flag visible, Compare, Call, View Scorecard, Edit Note, Remove | Red dot indicator, "Assign" shows warning before proceeding |
| Preferred + Inactive/Suspended | View Scorecard, Edit Note, Remove | Grayed-out card, red "Inactive" or "Suspended" banner overlay |

### Availability Badge Colors

| Status | Background | Text | Tailwind |
|---|---|---|---|
| AVAILABLE | green-100 (#D1FAE5) | green-800 (#065F46) | `bg-emerald-100 text-emerald-800` |
| COMMITTED | blue-100 (#DBEAFE) | blue-800 (#1E40AF) | `bg-blue-100 text-blue-800` |
| PARTIAL | amber-100 (#FEF3C7) | amber-800 (#92400E) | `bg-amber-100 text-amber-800` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Top-Right of Page)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| + Add to Preferred | Plus | Primary / Blue | Opens carrier search modal to find and add a carrier to preferred list | No |
| Card/Table Toggle | LayoutGrid / List | Ghost / Outline | Toggle between card grid and table view | No |

### Card-Level Action Buttons

| Button Label | Icon | Action | Condition |
|---|---|---|---|
| Assign to Load | Truck | Opens load selector modal filtered by carrier's equipment types and preferred lanes | Carrier is AVAILABLE or PARTIAL |
| Compare | BarChart | Adds carrier to comparison panel (max 3); opens comparison panel when 2+ selected | Always available |
| Call Dispatch | Phone | Initiates tel: link to carrier's dispatch contact phone | Dispatch contact exists |
| View Scorecard | LineChart | Navigates to Carrier Scorecard page | Always available |
| Edit Note | Pencil | Opens inline edit for the preferred carrier note | User has carrier_manage |
| Remove | X (small, top-right) | Removes carrier from preferred list | User has carrier_manage |

### Comparison Panel Actions

| Button Label | Icon | Action | Condition |
|---|---|---|---|
| Clear Comparison | X | Deselects all carriers and hides comparison panel | Panel is visible |
| Assign Best | Trophy | Opens load assignment for the "winner" carrier | Comparison shows a clear winner |

### Tab Interactions

| Tab | Content | Behavior |
|---|---|---|
| All | All preferred carriers in a flat list, sorted by score | Default tab |
| By Customer | Grouped sections, one per customer with their preferred carriers | Click customer name to expand/collapse |
| By Lane | Grouped by lane (origin > destination) with carrier cards under each | Click lane to expand/collapse |
| By Equipment | Grouped by equipment type with carrier cards under each | Click equipment type to expand/collapse |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + K | Focus search / command palette |
| Ctrl/Cmd + N | Add carrier to preferred list |
| Escape | Close modal / deselect comparison |
| 1-3 number keys | Select carrier 1, 2, or 3 for comparison (when focused) |
| Enter | Assign focused carrier to load (if in load context) |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| Carrier card | Other position in card grid | Reorder preferred carrier ranking (within current tab/group) |
| Carrier card | Customer group header | Add carrier to that customer's preferred list |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| carrier.compliance.changed | { carrierId, issue: 'insurance_expired' / 'authority_revoked' } | Show red dot on affected carrier card, show toast "Alert: [Carrier] insurance has expired" |
| carrier.status.changed | { carrierId, oldStatus, newStatus } | Update card: if SUSPENDED/INACTIVE, dim card and show status overlay |
| equipment.status.changed | { carrierId, availableCount, committedCount } | Update availability badge on carrier card |
| preferred.carrier.added | { carrierId, addedBy } | Add new card to grid with slide-in animation (if added by another user) |
| preferred.carrier.removed | { carrierId, removedBy } | Fade out and remove card (if removed by another user) |

### Live Update Behavior

- **Update frequency:** WebSocket push for compliance/status changes. Equipment availability updates every 60 seconds via polling.
- **Visual indicator:** Cards that update flash with blue border for 2 seconds. Compliance alerts show a persistent red dot until resolved.
- **Conflict handling:** If user is comparing carriers and one changes, update the comparison panel with a "Data updated" note.

### Polling Fallback

- **When:** WebSocket connection drops
- **Interval:** Every 60 seconds for availability updates
- **Endpoint:** GET /api/carriers/preferred?updatedSince={lastPollTimestamp}
- **Visual indicator:** "Live updates paused" in page header

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Add to preferred | Immediately add card to grid | Remove card, show error toast |
| Remove from preferred | Immediately fade out card | Fade card back in, show error toast |
| Reorder (drag) | Immediately move card to new position | Revert to original position, show error toast |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| PageHeader | src/components/layout/page-header.tsx | title, breadcrumbs, actions |
| TierBadge | src/components/carrier/tier-badge.tsx | tier, size: 'sm' |
| StatusBadge | src/components/ui/status-badge.tsx | For availability badges |
| FilterBar | src/components/ui/filter-bar.tsx | filters: FilterConfig[] |
| DataTable | src/components/ui/data-table.tsx | For table view alternative |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| TierBadge | Basic badge | Add "large card" variant that shows tier icon prominently at top of card |
| FilterBar | Text and select | Add availability toggle, tier multi-select |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| PreferredCarrierCard | Rich card component: tier badge (top-right), carrier name (clickable), equipment type icons row, score gauge (compact), on-time %, claims rate, preferred lanes count, last used date, availability badge, note (truncated), action buttons row (assign, compare, call, scorecard, remove). Draggable. Supports selection state (blue border) for comparison. | High |
| ComparisonPanel | Sticky bottom panel (or slide-up drawer) that appears when 2-3 carriers are selected for comparison. Shows a table: metrics as rows, selected carriers as columns, with "winner" highlight per metric. Actions: "Clear" and "Assign Best". | Medium |
| AutoSuggestBanner | Contextual banner shown when page is opened with load context (from Dispatch Board). Shows load details (equipment type, lane) and top 3 recommended preferred carriers ranked by auto-suggest algorithm. Quick-assign buttons per carrier. | Medium |
| CarrierSearchModal | Modal for adding carriers to preferred list: search by name/MC/DOT, show matching carriers with current tier and score, "Add" button per result. Already-preferred carriers shown as "Already in list". | Medium |
| PreferredNoteEditor | Inline edit component for the preferred carrier note. Click pencil icon to toggle from read-only text to a textarea input. Save on blur or Enter. Cancel on Escape. Max 200 characters. | Small |
| GroupedCardGrid | Card grid that supports grouping by customer, lane, or equipment type. Shows collapsible group headers with carrier count and expand/collapse toggle. Cards within each group are independently orderable. | Medium |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Tabs | tabs | Organization tabs (All, By Customer, By Lane, By Equipment) |
| Dialog | dialog | Carrier search modal for adding to preferred list |
| Sheet | sheet | Comparison panel (slide-up) |
| Toggle Group | toggle-group | Card/Table view toggle |
| Textarea | textarea | Note editor |
| Tooltip | tooltip | Equipment type icons, score explanations, compliance alerts |
| Collapsible | collapsible | Grouped card sections (by customer, lane, equipment) |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/carriers/preferred | Fetch all preferred carriers with metrics and notes | usePreferredCarriers(filters) |
| 2 | POST | /api/carriers/preferred | Add a carrier to preferred list (with note, groupings) | useAddPreferred() |
| 3 | DELETE | /api/carriers/preferred/:carrierId | Remove a carrier from preferred list | useRemovePreferred() |
| 4 | PATCH | /api/carriers/preferred/:carrierId | Update preferred entry (note, rank, customer/lane grouping) | useUpdatePreferred() |
| 5 | PATCH | /api/carriers/preferred/reorder | Batch update rank order for multiple carriers | useReorderPreferred() |
| 6 | GET | /api/carriers/preferred/suggest?loadId=X | Get auto-suggested ranked carriers for a specific load | usePreferredSuggestions(loadId) |
| 7 | GET | /api/carriers/preferred/by-customer | Get preferred carriers grouped by customer | usePreferredByCustomer() |
| 8 | GET | /api/carriers/preferred/by-lane | Get preferred carriers grouped by lane | usePreferredByLane() |
| 9 | GET | /api/carriers/preferred/by-equipment | Get preferred carriers grouped by equipment type | usePreferredByEquipment() |
| 10 | GET | /api/carriers/search?q=term | Search carriers to add to preferred (from modal) | useCarrierSearch(term) |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| carriers:{tenantId} | carrier.compliance.changed | useCarrierComplianceAlerts() -- shows red dot on affected card |
| carriers:{tenantId} | carrier.status.changed | useCarrierStatusStream() -- updates card state |
| equipment:{tenantId} | equipment.availability.changed | useEquipmentAvailability() -- updates availability badges |
| preferred:{tenantId} | preferred.carrier.added/removed | usePreferredListUpdates() -- invalidates preferred list query |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 500 |
|---|---|---|---|---|---|
| GET /api/carriers/preferred | Show filter error | Redirect to login | "Access Denied" page | N/A | Error state with retry |
| POST /api/carriers/preferred | "Carrier already in preferred list" or "Carrier not active" toast | Redirect to login | "Permission Denied" toast | "Carrier not found" toast | Error toast with retry |
| DELETE /api/carriers/preferred/:id | N/A | Redirect to login | "Permission Denied" toast | "Not in preferred list" toast | Error toast with retry |
| GET /api/carriers/preferred/suggest | "Load not found" toast | Redirect to login | "Access Denied" | "Load not found" | Show "Suggestions unavailable" in banner |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Show tab bar immediately (with disabled state). Show 6 skeleton cards in 3x2 grid (each with avatar rectangle, text bars for name/metrics, badge rectangles). Filter bar renders immediately.
- **Progressive loading:** Tabs render first. Cards load per-group. Auto-suggest banner loads independently if load context exists.
- **Duration threshold:** If loading exceeds 3 seconds, show "Loading preferred carriers..." message.

### Empty States

**First-time empty (no preferred carriers):**
- **Illustration:** Star icon with a plus symbol
- **Headline:** "No preferred carriers yet"
- **Description:** "Build your go-to carrier list by adding your most reliable and frequently used carriers. Preferred carriers appear first during load assignment."
- **CTA Button:** "Add Your First Preferred Carrier" -- primary blue button

**Filtered empty (carriers exist but filters exclude all):**
- **Headline:** "No preferred carriers match your filters"
- **Description:** "Try adjusting your filters or switching tabs."
- **CTA Button:** "Clear All Filters" -- secondary outline button

**Tab-specific empty (e.g., "By Customer" but no customer groupings set):**
- **Headline:** "No customer-specific carrier preferences"
- **Description:** "Assign preferred carriers to specific customers for tailored carrier selection. Go to a customer's profile to set their preferred carriers."
- **CTA:** "Learn How" -- documentation link

### Error States

**Full page error:**
- Error icon + "Unable to load preferred carriers" + Retry button

**Auto-suggest failure:**
- Auto-suggest banner shows: "Unable to generate recommendations. View all preferred carriers below."

**Comparison error:**
- If scorecard data fails for one carrier in comparison: show "Data unavailable" for that carrier's metrics with retry link.

### Permission Denied

- **Full page denied:** "You don't have permission to view preferred carriers" with link to Carriers list.
- **Partial denied:** Cards visible but "Add", "Remove", and "Assign" buttons hidden for read-only users.

### Offline / Degraded

- **Full offline:** Show banner: "You're offline. Showing cached preferred carriers from [timestamp]. Availability data may be outdated."
- **Degraded:** Cards render from cache. Availability badges show "Unknown" (gray) if real-time data unavailable.

---

## 12. Filters, Search & Sort

### Filters

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Equipment Type | Multi-select dropdown | All 12 equipment types | All | ?type=DRY_VAN,REEFER |
| 2 | Tier | Multi-select dropdown | PLATINUM, GOLD, SILVER, BRONZE, UNQUALIFIED | All | ?tier=PLATINUM,GOLD |
| 3 | Availability | Select dropdown | All, Available Now, Committed, Partial | All | ?availability=available |

### Search Behavior

- **Search field:** Single search input at left of filter bar
- **Searches across:** Carrier name, MC number, note text
- **Behavior:** Debounced 300ms, minimum 2 characters, filters cards in real-time
- **URL param:** ?search=

### Sort Options

| Sort Option | Default Direction | Sort Type |
|---|---|---|
| Score | Descending (highest first) | Numeric |
| On-Time % | Descending (best first) | Numeric |
| Last Used | Descending (most recent first) | Date |
| Carrier Name | Ascending (A-Z) | Alphabetic |
| Manual Rank | As set by drag-reorder | Custom order |

**Default sort:** Manual Rank (if set), otherwise Score descending

### Saved Filters / Presets

- **System presets:** "Available Now", "Top Tier (Platinum + Gold)", "Reefer Carriers", "Flatbed Carriers"
- **User-created presets:** Users can save filter combinations
- **URL sync:** All filters reflected in URL params for sharing

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Card grid: 2 columns instead of 3
- Comparison panel: bottom drawer, full width
- Tab bar: horizontal scroll if all tabs do not fit
- Filters: collapse to "Filters" button
- Auto-suggest banner: full width, stacks recommendation text

### Mobile (< 768px)

- Card grid: single column, full-width cards
- Cards: slightly more compact layout (score and on-time side by side instead of stacked)
- Comparison panel: full-screen modal instead of bottom panel
- Tab bar: horizontal scroll with active indicator
- Filters: full-screen modal on filter icon tap
- "Add to Preferred" button: sticky bottom bar
- Drag-to-reorder: long-press to initiate drag on mobile
- Swipe left on card for quick actions (remove, assign)
- Auto-suggest banner: collapsible, tap to expand recommendations
- Pull-to-refresh for data reload

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | 3-column card grid, comparison as bottom panel |
| Desktop | 1024px - 1439px | 3-column grid (narrower cards) |
| Tablet | 768px - 1023px | 2-column grid |
| Mobile | < 768px | Single column |

---

## 14. Stitch Prompt

```
Design a preferred carriers page for a modern freight/logistics TMS called "Ultra TMS." This is the dispatcher's go-to screen for finding reliable carriers to cover loads.

Layout: Full-width page with dark slate-900 sidebar (240px) on left, white content area on right. Breadcrumb: "Carriers > Preferred Carriers". Page title: "Preferred Carriers" with subtitle "24 preferred carriers". Top-right: primary blue "+ Add to Preferred" button with plus icon, and a ghost toggle between grid and list view icons (grid active).

Tabs Bar: Below header, horizontal tab bar with 4 tabs: "All (24)" (active, blue underline), "By Customer (8)", "By Lane (12)", "By Equipment (18)". Tabs use underline style with semibold active text.

Filter Bar: Below tabs. Search input (placeholder "Search carrier name..."), "Equipment Type" multi-select, "Tier" multi-select, "Availability" select, and sort dropdown ("Sort: Score desc").

Auto-Suggest Banner (contextual): A light blue banner card with info icon: "For Load FM-2026-0984 (Dry Van, Atlanta, GA > Memphis, TN): Recommended: 1. Alpine Carriers (98% OT, $2.05/mi) 2. Swift Transport (92% OT, $2.15/mi) 3. Midwest Haulers (85% OT, $1.95/mi)" with small blue "Assign" buttons next to each recommendation.

Carrier Cards Grid (3 columns): Show 6 cards in 2 rows of 3.

Card 1 - Alpine Carriers:
- Top-right: indigo PLATINUM badge with Crown icon
- Carrier name: "Alpine Carriers" (16px, semibold, blue link)
- Equipment icons row: cyan snowflake (Reefer) + amber flatbed icon
- Score: "95/100" in large text with a small green progress arc
- Two metric chips side by side: "OT: 98%" (green) and "Claims: 0.5%" (green)
- "8 preferred lanes" in small gray text
- "Last used: Jan 12, 2026" in gray text
- Green "Available" availability badge
- Italic note: "Top reefer carrier in Midwest region"
- Bottom action row: blue "Assign to Load" button, gray "Compare" checkbox, phone icon, chart icon, small "x" remove button

Card 2 - Swift Transport:
- Top-right: amber GOLD badge with Award icon
- "Swift Transport"
- Icons: blue container (Dry Van) + cyan snowflake (Reefer)
- Score: 82/100
- Metrics: "OT: 92%" (amber) + "Claims: 1.0%" (green)
- "15 preferred lanes"
- "Last used: Jan 14, 2026"
- Green "Available" badge
- Note: "Best for TX-OK-KS lanes, very responsive dispatch"
- Same action buttons

Card 3 - Midwest Haulers:
- Top-right: slate SILVER badge with Medal icon
- "Midwest Haulers"
- Icons: amber flatbed + orange step deck
- Score: 68/100
- Metrics: "OT: 85%" (amber) + "Claims: 2.1%" (amber)
- "12 preferred lanes"
- "Last used: Jan 10, 2026"
- Blue "Committed" badge (all trucks busy)
- Note: "Good OD rates, improving on-time"
- "Assign" button disabled/grayed

Card 4 - Pacific Logistics:
- GOLD badge, Score 78, OT: 90%, Claims: 1.5%, DryVan+Reefer, Available, "Reliable for CA-AZ lanes"

Card 5 - Lone Star Freight:
- SILVER badge, Score 71, OT: 88%, Claims: 1.8%, DryVan, Partial availability (amber badge), "Good rates Houston area"

Card 6 - Northeast Express:
- BRONZE badge, Score 55, OT: 82%, Claims: 2.5%, Reefer, Available, red compliance alert dot, Note: "Insurance expiring Feb 2026 - verify before assigning"

Comparison Panel (bottom of page, shown as if 2 carriers selected): A white card with blue top border. Header: "Comparing 2 Carriers" with "Clear" and "Assign Best" buttons. Table inside: Metric column, Alpine Carriers column, Swift Transport column, Winner column. Rows:
- Score: 95 vs 82, Alpine (bold green)
- On-Time Delivery: 98% vs 92%, Alpine
- Claims Rate: 0.5% vs 1.0%, Alpine
- Avg Rate/Mi: $2.25 vs $2.15, Swift (bold green)
- Dispatcher Rating: 4.8 vs 4.2, Alpine

Design Specifications:
- Font: Inter, 14px base
- Cards: white background, rounded-lg border, subtle shadow-sm on hover, 16px padding
- Tier badges: pill-shaped, colored per design system (indigo PLATINUM, amber GOLD, slate SILVER, orange BRONZE)
- Equipment type icons: small (16px), colored per design system
- Score numbers: 20px semibold, color matches tier
- Metric chips: small pill badges with colored text (green/amber/red)
- Availability badges: green "Available", blue "Committed", amber "Partial"
- Compliance alert: small red dot (8px) with subtle pulse animation
- Notes: italic text, gray-500, truncated 2 lines
- Selected-for-comparison cards: blue border (2px blue-500)
- Comparison panel: subtle top border, fixed to bottom of viewport
- Modern SaaS aesthetic similar to Linear.app
```

---

## 15. Enhancement Opportunities

### Current State (Wave 3)

**What's built and working:**
- [ ] Basic preferred carriers page exists (marked as "Built" in catalog)

**What needs polish / bug fixes:**
- [ ] Verify card layout matches design specifications
- [ ] Ensure compliance alerts are surfacing correctly
- [ ] Test availability badge accuracy with real equipment data

**What to add this wave:**
- [ ] Enhanced card design with all metric fields
- [ ] Organization tabs (By Customer, By Lane, By Equipment)
- [ ] Carrier comparison panel (2-3 carriers side by side)
- [ ] Auto-suggest mode when opened from Dispatch Board
- [ ] Preferred carrier notes (add/edit)
- [ ] Drag-to-reorder ranking
- [ ] Compliance alert indicators on cards

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Enhanced card design with full metrics | High | Medium | P0 |
| Carrier comparison panel | High | Medium | P0 |
| Compliance alert indicators | High | Low | P0 |
| Organization tabs (customer/lane/equipment) | High | High | P1 |
| Auto-suggest mode for load context | High | High | P1 |
| Quick dispatch (assign from card) | High | Medium | P1 |
| Drag-to-reorder ranking | Medium | Medium | P1 |
| Preferred carrier notes | Medium | Low | P1 |
| Customer-specific grouping management | Medium | High | P2 |
| Preferred carrier usage analytics | Medium | Medium | P2 |

### Future Wave Preview

- **Wave 4:** Full auto-suggest algorithm (lane matching + equipment matching + score weighting + rate optimization), customer-specific preferred carrier management from customer detail page, and preferred carrier usage analytics dashboard (which carriers are selected most, acceptance rates from preferred list).
- **Wave 5:** AI-powered carrier recommendation engine that learns from historical load outcomes to suggest the optimal carrier for each load. Dynamic preferred list that auto-promotes high-performing carriers and auto-demotes underperformers. Integration with carrier portal to notify preferred carriers of upcoming loads on their preferred lanes ("heads up: you have 3 loads coming on your Chicago-Dallas lane this week").

---
