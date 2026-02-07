# Load Builder -- Create/Build a New Load

> Service: TMS Core | Wave: 2 | Priority: P0
> Route: /loads/new | Status: Not Started
> Primary Personas: Maria (Dispatcher), Sarah (Ops Manager)
> Roles with Access: super_admin, admin, ops_manager, dispatcher

---

## 1. Purpose & Business Context

**What this screen does:**
The Load Builder is the wizard for creating a new load, optionally pre-filled from an existing order. It walks the dispatcher through five steps: 1) Order Link & Equipment, 2) Stops, 3) Carrier Selection, 4) Rate, and 5) Review. The most distinctive step is Step 3 -- Carrier Selection -- which provides a purpose-built carrier search and matching interface with scorecard previews, lane history, and rate comparison to help Maria choose the best carrier for this load in under 60 seconds.

**Business problem it solves:**
Building a load involves connecting an order to a carrier via a specific route with negotiated rates. In legacy systems, this is a fragmented process: the dispatcher copies data from an order screen, searches for carriers in a separate system, calls or emails carriers to negotiate rates, and manually enters the rate back into the TMS. The Load Builder unifies this into a single flow where order data auto-populates (eliminating re-keying errors), carrier selection is intelligent (showing historical performance and rates), and rate entry includes a live margin calculator (preventing below-target margins). This reduces load building from 15+ minutes to under 5 minutes per load.

**Key business rules:**
- A load must be linked to an order (1:1 or many:1 relationship -- multiple loads can serve one order for split shipments). The only exception is "ad-hoc" loads created without an order, which require admin or ops_manager role.
- A load must have at least one Pickup stop and one Delivery stop.
- Equipment type must match between the order and the load. If they differ, a warning is shown.
- Carrier selection is optional at creation time. A load can be saved without a carrier (status: PLANNING). Carrier assignment can happen later from the Load Detail or Loads List.
- If a carrier is selected, the carrier must be in ACTIVE status and have valid (non-expired) insurance.
- Carrier rate is required if a carrier is selected and the user wants to dispatch immediately.
- The margin calculator shows real-time margin as carrier rate is entered: margin = (customer rate - carrier rate) / customer rate * 100. A warning appears if margin drops below the company's minimum margin threshold (configurable, default 10%).
- If created from an order (`?fromOrder=`), Steps 1 and 2 are pre-filled and collapsed (expandable for review). The user starts effectively at Step 3.
- Auto-suggest: the system recommends the top 5 carriers for the load's lane based on: historical performance on this lane, scorecard rating, last used date, and contracted rate (if one exists).
- A load can be created in PLANNING (no carrier), PENDING (carrier selected, not yet tendered), or directly TENDERED (carrier selected + tender sent on creation).

**Success metric:**
Average time from "Build Load" click to "Load created with carrier" drops from 15 minutes to under 5 minutes. Percentage of loads dispatched with below-target margins (<10%) drops from 18% to under 5% thanks to the live margin calculator. Carrier selection accuracy (choosing a carrier that completes the load on-time) improves from 82% to 92% due to scorecard visibility.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Loads List | Clicks "+ New Load" button | None (blank form) |
| Loads List | Clicks "Build from Order" and selects an order | `?fromOrder=ORD-2025-XXXXX` (pre-fills Steps 1-2) |
| Order Detail | Clicks "Build Load" button | `?fromOrder=ORD-2025-XXXXX` |
| Order Entry (Step 5) | Clicks "Create & Build Load" | `?fromOrder=ORD-2025-XXXXX` (order just created) |
| Load Detail | Clicks "Clone Load" action | `?cloneFrom=LD-2025-XXXXX` (pre-fills all steps from source load) |
| Dispatch Board | Clicks "+ New Load" on board toolbar | None or `?fromOrder=ORD-XXX` |
| Direct URL | Bookmark or shared link | Query params |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Load Detail | Clicks "Create Load" or "Create & Dispatch" on Review step | `loadId` (navigates to `/loads/:id`) |
| Loads List | Clicks "Cancel" or breadcrumb "Loads" | None (preserves list filters) |
| Carrier Detail | Clicks carrier name in Step 3 to review full profile (opens in new tab) | `carrierId` |
| Load Builder (same screen) | Clicks "Save & Build Another" | None (form resets, success toast) |

**Primary trigger:**
Maria has an order that needs a carrier. She clicks "Build Load" from the Order Detail or selects the order from the "Build from Order" action on the Loads List. The wizard opens with order data pre-filled. She proceeds to Step 3 (Carrier Selection), selects a carrier, enters the rate, and submits.

**Success criteria (user completes the screen when):**
- User has created a load linked to the correct order with accurate stop information.
- User has selected a carrier (or intentionally left unassigned for later assignment).
- If a carrier was selected, the rate has been entered with an acceptable margin.
- The load appears in the Loads List and Load Detail with the correct status.

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------------+
|  Breadcrumb: Operations > Loads > New Load                             |
|  (If from order: "Operations > Loads > Build Load from ORD-2025-0412") |
+------------------------------------------------------------------------+
|                                                                        |
|  +------------------------------------------------------------------+  |
|  |  STEPPER BAR (horizontal, full-width)                            |  |
|  |  [1. Order & Equipment] --> [2. Stops] --> [3. Carrier]          |  |
|  |  --> [4. Rate] --> [5. Review]                                   |  |
|  |                                                                  |  |
|  |  If from order: Steps 1-2 show green checks (pre-filled).       |  |
|  |  Active step is Step 3 (Carrier Selection).                      |  |
|  +------------------------------------------------------------------+  |
|                                                                        |
|  +----------------------------------------------+  +--------------+   |
|  |  MAIN FORM AREA (70% width)                  |  | RIGHT PANEL  |   |
|  |                                               |  | (30% width)  |   |
|  |  Step 3 - Carrier Selection:                  |  |              |   |
|  |                                               |  | LOAD SUMMARY |   |
|  |  [Search carriers: name, MC#, lane...]        |  |              |   |
|  |  [Equipment: Dry Van v] [Lane: CHI>DAL]       |  | Order:       |   |
|  |  [Tier: All v] [Sort: Best Score v]           |  | ORD-0412     |   |
|  |                                               |  | Customer:    |   |
|  |  RECOMMENDED CARRIERS (top 5):                |  | Acme Mfg     |   |
|  |  +------------------------------------------+ |  |              |   |
|  |  | Swift Transport         ★ 4.8 / 5       | |  | Route:       |   |
|  |  | MC-123456 | Dry Van | GOLD tier          | |  | CHI > DAL    |   |
|  |  | On-time: 96% | Last used: Jan 5          | |  | 924 mi       |   |
|  |  | Preferred rate: $1,850 for this lane      | |  |              |   |
|  |  | [Select]                                  | |  | Equipment:   |   |
|  |  +------------------------------------------+ |  | Dry Van      |   |
|  |  +------------------------------------------+ |  |              |   |
|  |  | Werner Enterprises      ★ 4.5 / 5       | |  | Weight:      |   |
|  |  | MC-234567 | Dry Van | SILVER tier         | |  | 42,000 lbs   |   |
|  |  | On-time: 91% | Last used: Dec 28         | |  |              |   |
|  |  | Suggested rate: $1,920 for this lane      | |  | Cust Rate:   |   |
|  |  | [Select]                                  | |  | $2,250.00    |   |
|  |  +------------------------------------------+ |  |              |   |
|  |  (... more carrier cards ...)                 |  |              |   |
|  |                                               |  |              |   |
|  |  [Skip - Create Without Carrier]              |  |              |   |
|  |  [Post to Load Board] (spot market option)    |  |              |   |
|  +----------------------------------------------+  +--------------+   |
|                                                                        |
|  +------------------------------------------------------------------+  |
|  |  FOOTER BAR (sticky)                                             |  |
|  |  [Cancel]           [Save Draft]      [< Back]  [Next >]        |  |
|  +------------------------------------------------------------------+  |
+------------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible, above the fold) | Stepper bar, active step form content, carrier search/results (on Step 3), load summary in right panel | The user must know where they are and what to do next. Carrier cards must be scannable at a glance. |
| **Secondary** (visible but less prominent) | Carrier scorecard scores, on-time %, preferred rates, lane history, margin calculator | Critical decision-support data that Maria references when choosing between carriers |
| **Tertiary** (available on scroll or expand) | Full carrier contact info, insurance expiry, CSA scores, historical load details on this lane, stop-level details in pre-filled steps | Deep info for investigation when Maria is unsure about a carrier |
| **Hidden** (behind a click -- modal, drawer, new tab) | Full carrier profile (Carrier Detail), rate comparison with market data, spot market posting form, load board integration | Advanced features for power users and edge cases |

---

## 4. Data Fields & Display

### Visible Fields

**Step 1 -- Order Link & Equipment**

| # | Field Label | Source | Format / Display | Location | Required |
|---|---|---|---|---|---|
| 1 | Linked Order | Load.orderId | Searchable select of orders (status = BOOKED, no existing load). Shows order#, customer, origin>dest, date. If `?fromOrder=` provided, pre-selected and read-only. | Top of Step 1 | Yes (unless ad-hoc) |
| 2 | Customer | Order.customerId -> Customer.name | Auto-populated from order. Read-only display. | Below order select | Display only |
| 3 | Equipment Type | Load.equipmentType | Visual card selector (same as Order Entry). Auto-populated from order; user can override with warning if different. | Step 1, below customer | Yes |
| 4 | Commodity | Load.commodity | Text input with autocomplete. Auto-populated from order. | Step 1 | Yes |
| 5 | Weight (lbs) | Load.weight | Numeric input. Auto-populated from order. | 3-column row | Yes |
| 6 | Pieces | Load.pieces | Numeric input. Auto-populated from order. | 3-column row | No |
| 7 | Pallets | Load.pallets | Numeric input. Auto-populated from order. | 3-column row | No |
| 8 | Hazmat | Load.isHazmat | Toggle. Auto-populated from order. If yes, shows UN#, class, placard (auto-populated). | Step 1 | No |
| 9 | Temperature | Load.tempMin + tempMax | Numeric inputs (if Reefer). Auto-populated from order. | Conditional | Yes (if Reefer) |
| 10 | Special Handling | Load.specialHandling | Checkboxes. Auto-populated from order. | Step 1 | No |

**Step 2 -- Stops**

| # | Field Label | Source | Format / Display | Location | Required |
|---|---|---|---|---|---|
| 11-22 | Same as Order Entry Step 3 | Stop.* | All stop fields (type, facility, address, contact, appointment, cargo, instructions). Auto-populated from order stops if `?fromOrder=`. User can modify, add, or remove stops. | Stop cards | Yes (min 1P + 1D) |
| 23 | Route Map Preview | Stops coordinates | Embedded Google Map with route polyline and stop markers. Total miles displayed. | Below stop cards | Display only |

**Step 3 -- Carrier Selection (Unique to Load Builder)**

| # | Field Label | Source | Format / Display | Location | Required |
|---|---|---|---|---|---|
| 24 | Carrier Search | N/A (UI search) | Text input: "Search by carrier name, MC#, DOT#, or lane..." | Top of Step 3 | No |
| 25 | Equipment Filter | N/A (UI filter) | Pre-set from Step 1 equipment type. Dropdown to override. | Filter row | No |
| 26 | Lane Filter | N/A (UI filter) | Auto-set from stops: "CHI > DAL" (origin state > dest state). Modifiable. | Filter row | No |
| 27 | Tier Filter | N/A (UI filter) | Multi-select: PLATINUM, GOLD, SILVER, BRONZE, All | Filter row | No |
| 28 | Compliance Filter | N/A (UI filter) | Select: "All", "Compliant Only" (default), "Include Warnings" | Filter row | No |
| 29 | Sort | N/A (UI sort) | Dropdown: "Best Score" (default), "Best Rate", "Most Recent", "Preferred" | Filter row | No |

**Carrier Result Cards (in Step 3):**

| # | Field Label | Source | Format / Display | Location |
|---|---|---|---|---|
| 30 | Carrier Name | Carrier.name | Bold text, primary size | Card header, left |
| 31 | Scorecard Rating | Carrier.scorecardScore | Star rating (1-5) with numeric value. Color: gold stars. | Card header, right |
| 32 | MC Number | Carrier.mcNumber | "MC-XXXXXXX" monospace, text-xs | Card subheader |
| 33 | Equipment Types | Carrier.equipmentTypes | Badges showing matching equipment types. Matching type highlighted. | Card subheader |
| 34 | Tier Badge | Carrier.tier | PLATINUM (indigo), GOLD (amber), SILVER (slate), BRONZE (orange) badge | Card header, after name |
| 35 | On-Time % | Carrier.onTimePercentage | "On-time: XX%" -- green if >90%, amber if 80-90%, red if <80% | Card body, left |
| 36 | Claims Rate | Carrier.claimsRate | "Claims: X.X%" -- green if <1%, amber if 1-3%, red if >3% | Card body, center |
| 37 | Last Used Date | Carrier.lastUsedDate | "Last used: MMM DD" -- recent = familiar carrier | Card body, right |
| 38 | Preferred Rate | Carrier.laneRates[thisLane] | "$X,XXX for this lane" -- from contracted/historical rate. If no history: "No lane history" in gray. | Card body, prominent |
| 39 | Compliance Status | Carrier.complianceStatus | Green "Compliant" or amber "Warning: [detail]" | Card body |
| 40 | Insurance Expiry | Carrier.insuranceExpiry | "Ins expires: MMM DD" -- red if <30 days | Card body, text-xs |
| 41 | Loads Completed | Carrier.loadsCompleted | "XX loads completed" (total with this brokerage) | Card body |
| 42 | Contact Name | Carrier.contactName | Text | Card body (shown on hover/expand) |
| 43 | Contact Phone | Carrier.contactPhone | Clickable phone link | Card body (shown on hover/expand) |
| 44 | Select Button | N/A | "Select Carrier" primary button | Card footer |

**Step 4 -- Rate**

| # | Field Label | Source | Format / Display | Location | Required |
|---|---|---|---|---|---|
| 45 | Customer Rate | Order.customerRate (auto-populated) | Currency input, read-only if from order. "$X,XXX.XX" | Rate section, top | Display only (from order) |
| 46 | Carrier Rate | Load.carrierRate | Currency input. If carrier has a preferred rate for this lane, it's auto-filled but editable. | Rate section, prominent | Yes (if carrier selected) |
| 47 | Accessorial Charges (Carrier) | Load.carrierAccessorials[] | Repeatable row: type dropdown + amount. (Fuel advance, detention, etc.) | Below carrier rate | No |
| 48 | Total Carrier Cost | Calculated | carrierRate + SUM(carrierAccessorials) | Rate section, bold | Display only |
| 49 | Margin ($) | Calculated | customerRate - totalCarrierCost | Margin display, large font | Display only |
| 50 | Margin (%) | Calculated | (customerRate - totalCarrierCost) / customerRate * 100 | Margin display, large font, color-coded | Display only |
| 51 | Margin Warning | N/A | Red warning banner if margin < minimum threshold (default 10%): "Warning: Margin is below the XX% company minimum." | Below margin display, conditional | Display only |
| 52 | Rate Per Mile | Calculated | carrierRate / totalMiles | "Carrier: $X.XX/mi | Customer: $X.XX/mi" | Display only |
| 53 | Market Rate Comparison | External (DAT/Truckstop) | "Market range: $X,XXX - $X,XXX (avg: $X,XXX)" for this lane. Shows how the carrier rate compares to market. | Below rate per mile | Display only |
| 54 | Payment Terms (Carrier) | Load.carrierPaymentTerms | Select: Quick Pay, Net 15, Net 30. Default from carrier profile. | Below rate | Yes |

**Step 5 -- Review**

| # | Field Label | Source | Format / Display | Location | Required |
|---|---|---|---|---|---|
| 55 | Full Load Summary | All fields | Read-only cards mirroring Steps 1-4. Each section collapsible. "Edit" link returns to that step. | Full-width | Display only |
| 56 | Validation Summary | Validation engine | Green checks / red X list. Zero errors required for submission. | Top of review | Display only |
| 57 | Route Map Preview | Stops coordinates | Map with route polyline, all stops, total miles | Review step | Display only |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Total Carrier Cost | carrierRate + SUM(carrierAccessorials[].amount) | Currency ($X,XXX.XX) |
| 2 | Margin ($) | customerRate - totalCarrierCost | Currency, color-coded: green >15%, yellow 5-15%, red <5% |
| 3 | Margin (%) | margin$ / customerRate * 100 | Percentage with 1 decimal, color-coded |
| 4 | Rate Per Mile (Carrier) | carrierRate / totalMiles | "$X.XX/mi" |
| 5 | Rate Per Mile (Customer) | customerRate / totalMiles | "$X.XX/mi" |
| 6 | Total Route Miles | Google Directions API | "X,XXX mi" |
| 7 | Carrier Recommendation Score | Weighted algorithm: 40% scorecard + 25% on-time% + 20% rate competitiveness + 15% recency | 1-100 internal score, sorted by default |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] Five-step wizard with horizontal stepper navigation
- [ ] Pre-fill from order: when `?fromOrder=` is provided, Steps 1-2 auto-populate from order data
- [ ] Clone from load: when `?cloneFrom=` is provided, all steps auto-populate from source load
- [ ] Step 1: order selection with searchable dropdown, equipment type selector
- [ ] Step 2: dynamic stop builder (same as Order Entry Step 3, but pre-filled)
- [ ] Step 3: carrier search with text search, equipment filter, lane filter, tier filter
- [ ] Step 3: carrier result cards with name, MC#, scorecard score, on-time%, tier badge
- [ ] Step 3: "Select Carrier" action on each card, auto-fills carrier info for Step 4
- [ ] Step 3: "Skip -- Create Without Carrier" option for unassigned loads
- [ ] Step 4: carrier rate entry with live margin calculator
- [ ] Step 4: customer rate display (from order, read-only)
- [ ] Step 4: margin display with color coding and company minimum warning
- [ ] Step 5: review with full summary and validation
- [ ] Create load as PLANNING (no carrier), PENDING (carrier selected), or TENDERED (carrier + dispatch)
- [ ] Save draft at any step
- [ ] Right panel: live load summary showing data entered so far

### Advanced Features (Logistics Expert Recommendations)

- [ ] Auto-suggest top 5 carriers for this lane: system recommends carriers based on weighted scoring of scorecard, on-time%, rate competitiveness, and recency of use
- [ ] "Book it" one-click for preferred carrier at contracted rate: if a PLATINUM/GOLD carrier has a contracted rate for this lane, show a prominent "Book at $X,XXX" button that bypasses the full carrier search
- [ ] Market rate comparison: show DAT/Truckstop market rates alongside the carrier's rate in Step 4 (low/avg/high for this lane)
- [ ] Margin calculator updates live as carrier rate is typed (real-time, no submit needed)
- [ ] Clone stops from a previous load on same lane: "Use stops from LD-2025-XXXX" option in Step 2
- [ ] Carrier contact preview: expand carrier card to see contact name, phone, email without leaving the page
- [ ] Post to load board: "Spot Market" option in Step 3 that posts the load to external load boards (DAT, Truckstop) instead of selecting a specific carrier
- [ ] Carrier scorecard detail link: click carrier name in card to open Carrier Detail in a new tab for full profile review
- [ ] Rate negotiation notes: text field for notes about the rate discussion (e.g., "Agreed at $1,850 per Maria's call 1/15")
- [ ] Save carrier + rate as a "lane rate" for future loads on the same origin-destination
- [ ] Batch load creation: "Create Multiple Loads" option for orders that need to be split across multiple carriers
- [ ] Auto-calculate fuel surcharge based on carrier's FSC schedule or company default
- [ ] Compliance check: when carrier is selected, auto-validate that insurance is current and authority is active. Block selection if not compliant (with explanation).

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| Create load from scratch (no order link) | admin, ops_manager | load_create_adhoc | "No linked order" option disabled; must select an order |
| View customer rate | admin, ops_manager, dispatcher | finance_view (customer_rate) | Customer rate shows "--" in summary; margin calculator hidden |
| View carrier rate history | admin, ops_manager, dispatcher | finance_view (carrier_rate) | "Preferred rate" hidden on carrier cards |
| View margin calculator | admin, ops_manager | finance_view (margin) | Margin section hidden in Step 4 |
| Post to load board | admin, ops_manager, dispatcher | load_board_post | "Post to Load Board" option hidden |
| Select non-compliant carrier | admin | carrier_override_compliance | Non-compliant carriers are filtered out for other roles |
| Override minimum margin warning | admin, ops_manager | finance_override | Warning shown but submission not blocked for admin/ops_mgr; blocked for dispatcher |

---

## 6. Status & State Machine

### Status Transitions

The Load Builder creates loads in one of three initial statuses:

```
[Load Builder] ---(Create without carrier)-------> [PLANNING]
               |
               |---(Create with carrier, no tender)---> [PENDING]
               |
               |---(Create & Dispatch)---> [TENDERED] (sends tender notification)
```

All subsequent status transitions happen on the Load Detail screen.

### Actions Available Per Status

| Status | Available Actions on this Screen | Notes |
|---|---|---|
| New Form (unsaved) | Save Draft, Next/Back, Cancel | No server record until Save Draft or Submit |
| Draft (saved but incomplete) | Resume (re-opens wizard at last completed step), Delete | Navigates back to Load Builder with saved state |

### Status Badge Colors

| Status Created | Background | Text | Icon | Description |
|---|---|---|---|---|
| PLANNING | #F1F5F9 | #334155 | PenLine | No carrier -- load needs assignment |
| PENDING | #F3F4F6 | #374151 | Clock | Carrier selected but not yet tendered |
| TENDERED | #EDE9FE | #5B21B6 | SendHorizonal | Carrier selected + tender sent |

---

## 7. Actions & Interactions

### Primary Action Buttons (Sticky Footer)

| Button Label | Icon | Variant | Action | Condition | Confirmation? |
|---|---|---|---|---|---|
| Cancel | X | Ghost / text | Return to previous screen. If unsaved changes, "Discard?" confirm. | Always | Yes (if changes) |
| Save Draft | Save | Secondary / outline | Save current state as PLANNING draft. Show toast. | Any step | No |
| Back | ChevronLeft | Secondary / outline | Navigate to previous step. No data lost. | Steps 2-5 | No |
| Next | ChevronRight | Primary / blue | Validate current step and advance. | Steps 1-4 | No |
| Skip Carrier | SkipForward | Ghost / text link | Skip Step 3, leave carrier unassigned. Advance to Step 4 (rate can also be skipped). | Step 3 only | No |
| Create Load | CheckCircle | Primary / blue | Create load as PLANNING (no carrier) or PENDING (carrier, no tender) | Step 5 | No |
| Create & Dispatch | Send | Primary / blue variant | Create load as TENDERED and send tender notification to carrier | Step 5, carrier selected | Yes -- "Send tender to [carrier]?" |
| Save & Build Another | Plus | Ghost / text link | Create load, reset form, show success toast | Step 5 | No |

### Step 3 Carrier Card Actions

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| Select Carrier | UserCheck | Selects this carrier for the load. Auto-fills carrier info. Advances to Step 4 with carrier's preferred rate pre-filled (if available). | Carrier is ACTIVE and COMPLIANT |
| View Profile | ExternalLink | Opens Carrier Detail in a new tab for full profile review | Always |
| Call Carrier | Phone | Opens tel: link to carrier's primary phone number | Phone available |
| Not Available | N/A | Carrier card is grayed out with explanation tooltip | Carrier is INACTIVE, SUSPENDED, or non-compliant |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + Right Arrow | Advance to next step |
| Ctrl/Cmd + Left Arrow | Go back to previous step |
| Ctrl/Cmd + S | Save draft |
| Ctrl/Cmd + Enter | Submit (same as primary button on Step 5) |
| / | Focus carrier search input (Step 3) |
| Escape | Close modal, deselect carrier |
| Tab | Move between form fields / carrier cards |
| Enter | Select focused carrier card (Step 3) |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| Stop card (Step 2) | Other position in stops list | Reorder stops. Route recalculates. |

---

## 8. Real-Time Features

### WebSocket Events

This screen is classified as **Static** in the real-time feature map. Form state is local until submission.

| Event Name | Payload | UI Update |
|---|---|---|
| N/A | N/A | N/A |

However, carrier availability data could become stale during a long session:

### Live Update Behavior

- **Carrier data freshness:** Carrier cards in Step 3 show cached data from the initial search. If the user spends more than 5 minutes on Step 3, a subtle "Carrier data may be outdated. Refresh?" link appears above the carrier list.
- **Order data stale check:** If the linked order is modified by another user while the Load Builder is open, the system detects this on submission and shows: "The linked order (ORD-2025-XXXX) was updated since you started. Review changes?"
- **No auto-save to WebSocket:** Form is local until explicit save or submit.

### Polling Fallback

N/A -- static form. No background polling.

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Create Load | Success toast immediately, navigate to Load Detail | Error toast with specific validation errors. Return to Review step. Form state preserved. |
| Create & Dispatch | Success toast, navigate to Load Detail showing TENDERED status | Error toast. If load created but tender failed: navigate to Load Detail with PENDING status and error message. |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| PageHeader | src/components/ui/PageHeader.tsx | title: "New Load" or "Build Load from ORD-XXXX", breadcrumbs |
| SearchableSelect | src/components/ui/searchable-select.tsx | Order search, carrier search, contacts |
| AddressAutocomplete | src/components/ui/address-autocomplete.tsx | Stop address entry |
| Button | src/components/ui/button.tsx | All actions |
| Card | src/components/ui/card.tsx | Step cards, carrier cards, summary cards |
| Input | src/components/ui/input.tsx | All text/numeric inputs |
| Select | src/components/ui/select.tsx | Dropdowns (equipment, tier, sort, payment terms) |
| Badge | src/components/ui/badge.tsx | Carrier tier badges, compliance badges, status badges |
| Dialog | src/components/ui/dialog.tsx | Confirmation dialogs |
| Toast / Sonner | src/components/ui/sonner.tsx | Success/error notifications |
| Tooltip | src/components/ui/tooltip.tsx | Field help, carrier card details |
| Form | src/components/ui/form.tsx | React-hook-form wrapper |
| Calendar | src/components/ui/calendar.tsx + popover.tsx | Date pickers |
| Checkbox | src/components/ui/checkbox.tsx | Special handling, compliance filter |
| Switch | src/components/ui/switch.tsx | Hazmat toggle |
| Skeleton | src/components/ui/skeleton.tsx | Loading states |
| ConfirmDialog | src/components/shared/confirm-dialog.tsx | Discard changes, dispatch confirmation |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| SearchableSelect | Basic search | Add "recent items" section, order preview on hover, carrier card preview on hover |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| Stepper | Reuse from Order Entry (04-order-entry). Same horizontal stepper with step labels, active/complete/future states. | Already designed |
| CarrierSearchBar | Composite search + filter bar for Step 3: text search input + equipment dropdown + lane display + tier filter + compliance filter + sort dropdown | Medium |
| CarrierResultCard | Card displaying a single carrier result: name, MC#, tier badge, scorecard stars, on-time%, claims rate, last used, preferred rate, compliance status, insurance expiry. "Select" button. Expandable for contact details. | Complex |
| CarrierRecommendationSection | Section above search results showing "Recommended for this lane" with top 5 carriers ranked by recommendation score. Different visual treatment (highlight border). | Medium |
| CarrierSelector | Container component managing the full Step 3 experience: search, filters, recommendations, results list, selection state | Complex |
| MarginCalculator | Live-updating margin display: customer rate, carrier rate input, margin $ and %, rate per mile, color coding, minimum margin warning. Updates on every keystroke. | Medium |
| MarketRateComparison | Display component showing market rate range for the lane: low/avg/high bar chart with the current carrier rate positioned as a marker. | Medium |
| AccessorialRow | Reuse from Order Entry (04-order-entry). Repeatable row for carrier accessorial charges. | Already designed |
| CurrencyInput | Reuse from Order Entry (04-order-entry). Masked currency input. | Already designed |
| EquipmentSelector | Reuse from Order Entry (04-order-entry). Visual card grid. | Already designed |
| StopBuilder | Reuse from Order Entry (04-order-entry). Dynamic stop list with add/remove/reorder. | Already designed |
| RouteMapPreview | Reuse from Order Entry (04-order-entry). Embedded Google Map with route. | Already designed |
| OrderSummaryPanel | Right-side panel showing live load summary. Similar to Order Entry's summary but with carrier info added. | Medium |
| LoadBuilderFooter | Reuse from Order Entry. Sticky footer with conditional buttons. | Already designed |
| BookItButton | Prominent one-click booking button for preferred carriers at contracted rates. "Book at $1,850 with Swift Transport" -- green, large, attention-grabbing. | Small |
| SpotMarketOption | Option card/button for posting to external load boards instead of selecting a specific carrier. Shows "Post to DAT / Truckstop" with logos. | Small |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Radio Group | radio-group | Step 1 order type selection (from order vs ad-hoc) |
| Accordion | accordion | Collapsible carrier card details, review step sections |
| Breadcrumb | breadcrumb | Page breadcrumb |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/orders?status=BOOKED&hasLoad=false&search= | Fetch orders available to build loads from | useAvailableOrders(search) |
| 2 | GET | /api/orders/:id | Fetch order detail for pre-fill | useOrder(orderId) |
| 3 | GET | /api/loads/:id | Fetch source load for cloning | useLoad(loadId) |
| 4 | GET | /api/carriers?search=&equipment=&originState=&destState=&tier=&compliance=COMPLIANT&sort=score&page=&limit= | Search carriers with filters | useCarrierSearch(filters) |
| 5 | GET | /api/carriers/recommend?originState=&destState=&equipment=&limit=5 | Get top 5 recommended carriers for this lane | useCarrierRecommendations(lane) |
| 6 | GET | /api/carriers/:id | Fetch carrier detail (for expanded card view) | useCarrier(carrierId) |
| 7 | GET | /api/carriers/:id/lane-rates?origin=&destination= | Get carrier's historical/contracted rate for this lane | useCarrierLaneRate(carrierId, lane) |
| 8 | GET | /api/rates/market?origin=&destination=&equipment= | Fetch market rate data (DAT/Truckstop) for lane | useMarketRate(lane) |
| 9 | GET | /api/facilities?search= | Facility search for stop addresses | useFacilitySearch(query) |
| 10 | POST | /api/loads | Create new load | useCreateLoad() |
| 11 | POST | /api/loads/:id/dispatch | Dispatch (tender) the load to carrier | useDispatchLoad() |
| 12 | GET | /api/google/directions | Calculate route miles | useRouteCalculation(stops) |
| 13 | GET | /api/loads/lane-history?origin=&destination=&limit=5 | Previous loads on this lane (for stop cloning and rate reference) | useLaneHistory(lane) |

### Real-Time Event Subscriptions

N/A -- static form screen.

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 409 | 422 | 500 |
|---|---|---|---|---|---|---|---|
| POST /api/loads | Validation toast (missing fields) | Redirect to login | "Permission Denied" toast | N/A | "Order already has a load" modal with link to existing load | Field-level validation errors mapped to form | Error toast with retry |
| GET /api/carriers | Empty results message "No carriers match your criteria" | Redirect to login | Access denied page | N/A | N/A | N/A | Error toast, retry |
| GET /api/carriers/recommend | Show "Recommendations unavailable" with manual search fallback | Redirect to login | Access denied | N/A | N/A | N/A | Show search only, no recommendations |
| GET /api/rates/market | Show "Market rates unavailable" message | N/A | N/A | N/A | N/A | N/A | Graceful degradation -- hide market rate section |

---

## 11. States & Edge Cases

### Loading State

- **Initial load (from order):** Show stepper with Steps 1-2 marked as "loading." Skeleton form content while order data is fetched. On load, Steps 1-2 auto-fill and show green checks. Active step jumps to Step 3.
- **Carrier search loading:** Show skeleton carrier cards (3 skeletons matching card layout) while search executes. Search is debounced 300ms.
- **Carrier recommendations loading:** Show skeleton for "Recommended Carriers" section. If it takes >3s, show "Finding best carriers for this lane..." message.
- **Market rate loading:** Show small spinner next to "Market Rate" section in Step 4.
- **Route calculation loading:** Spinner next to miles display.

### Empty States

**No available orders:**
- Order searchable select shows: "No orders available for load building. All orders either have loads or are not in Booked status."

**No carrier results:**
- Step 3 carrier list: "No carriers match your search criteria. Try broadening your filters or search term."
- Secondary action: "Post to Load Board" option highlighted as alternative.

**No carrier recommendations:**
- Recommendation section: "No historical data for this lane yet. Search for carriers manually below."

**No market rate data:**
- Market rate section in Step 4: "Market rate data not available for this lane." Hidden rather than showing empty.

### Error States

**Order pre-fill fails (linked order not found):**
- Show error banner: "Could not load order ORD-2025-XXXX. It may have been deleted or is no longer available." + "Continue without order link" button + "Back to Loads List" link.

**Carrier already assigned to another load at this time:**
- When selecting carrier: warning modal: "Swift Transport has another load (LD-2025-XXXX) with overlapping dates. Proceed anyway?" + "Select Anyway" + "Choose Different Carrier."

**Carrier becomes non-compliant during form session:**
- If the carrier selected in Step 3 has their compliance status change before submission, the Review step shows a red warning: "Carrier compliance has changed since selection. Review before submitting."

**Server validation failure on submit:**
- Map errors to form fields. Return user to the earliest step with an error. Show summary of all errors.

### Permission Denied

- **Full page denied:** Redirect to Loads List with toast: "You don't have permission to create loads."
- **Ad-hoc load denied (no order):** Order select is mandatory. "Create without order" option is disabled with tooltip: "Only admins and ops managers can create loads without an order."
- **Financial fields hidden:** Customer rate, carrier rate history, market rates, and margin calculator all hidden for roles without `finance_view`.

### Offline / Degraded

- **Full offline:** Banner: "You're offline. Load creation requires a network connection." Save Draft button attempts to save locally. Submit buttons disabled.
- **Carrier search offline:** "Cannot search carriers while offline. Please check your connection."
- **Google Maps offline:** Manual address entry fallback (no autocomplete). Route miles shows "Unable to calculate" with manual miles input.

---

## 12. Filters, Search & Sort

### Filters

Filters are within Step 3 (Carrier Selection), not page-level filters.

| # | Filter Label | Type | Options / Values | Default | Scope |
|---|---|---|---|---|---|
| 1 | Carrier Search | Text input | Free-text: name, MC#, DOT# | Empty | Step 3 |
| 2 | Equipment Type | Select dropdown | All equipment types from design system | Pre-set from Step 1 | Step 3 |
| 3 | Lane | Display / override | "Origin State > Dest State" from stops | Auto-set from Step 2 | Step 3 |
| 4 | Carrier Tier | Multi-select chips | PLATINUM, GOLD, SILVER, BRONZE, All | All | Step 3 |
| 5 | Compliance | Select | "Compliant Only" (default), "Include Warnings", "All" | Compliant Only | Step 3 |
| 6 | Availability | Toggle | "Available for these dates" | On | Step 3 |

### Search Behavior

- **Carrier search (Step 3):** Debounced 300ms, min 2 chars. Searches across carrier name, MC number, DOT number. Results update as user types.
- **Order search (Step 1):** Debounced 300ms, min 2 chars. Searches across order number, customer name, origin city, destination city.
- **Facility search (Step 2):** Same as Order Entry.

### Sort Options

**Step 3 Carrier Results:**

| Sort Option | Logic | Default |
|---|---|---|
| Best Score | Recommendation algorithm score (composite of scorecard + on-time + rate + recency) | Yes (default) |
| Best Rate | Lowest preferred/contracted rate for this lane. No rate = sorted last. | No |
| Highest Score | Carrier scorecard score (4.9 > 4.8 > ...) | No |
| Most Recent | Most recently used carrier (last load date) | No |
| Preferred | PLATINUM first, then GOLD, SILVER, BRONZE | No |

### Saved Filters / Presets

N/A -- form screen. No saved filter presets. However, carrier search history is remembered per session.

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Right-side load summary panel collapses to a "Show Summary" toggle at the top of the form.
- Stepper bar: abbreviated step labels (e.g., "1. Order", "2. Stops", "3. Carrier", "4. Rate", "5. Review").
- Step 3 carrier cards: full-width, stacked vertically. Each card shows all info without expanding.
- Step 4 rate section: stacked vertically (customer rate above, carrier rate below, margin below that).
- Footer: sticky at bottom, same button layout.

### Mobile (< 768px)

- Stepper: condensed to current step number + label + dots for position. Swipe or tap arrows.
- All form fields: single column, full-width.
- Step 3 carrier cards: full-width cards, slightly condensed. Show: name + tier badge, scorecard + on-time%, preferred rate, "Select" button. Tap card to expand full details.
- Carrier recommendations: horizontal scroll of top 5 carrier mini-cards at the top of Step 3. Each mini-card: name + score + rate. Tap to scroll to full card below.
- Step 4 margin calculator: simplified layout. Customer rate, carrier rate input, margin display stacked vertically. Market rate hidden.
- Footer: only Back/Next buttons visible. Save Draft in overflow menu.
- Address autocomplete: full-screen modal for mobile UX.
- Route map: hidden behind "Show Map" toggle.

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full layout: form (70%) + summary panel (30%) |
| Desktop | 1024px - 1439px | Same layout, narrower summary panel |
| Tablet | 768px - 1023px | Summary collapses; carrier cards full-width |
| Mobile | < 768px | Single column; condensed stepper; carrier mini-cards scroll |

---

## 14. Stitch Prompt

```
Design a load builder wizard, specifically Step 3 "Carrier Selection" for a modern freight/logistics TMS called "Ultra TMS."

Layout: Full-width content area with dark sidebar (collapsed). Top: breadcrumb "Operations > Loads > Build Load from ORD-2025-0412". Below: horizontal stepper bar with 5 steps. Steps 1 ("Order & Equipment") and 2 ("Stops") show green checkmarks (completed, pre-filled from order). Step 3 ("Carrier Selection") is active (blue-600 fill, white text). Steps 4 and 5 are gray (future).

The page is split: left side 70% width form area, right side 30% width summary panel.

LEFT SIDE - Step 3 Content:
Top of the form: a search/filter bar in a white card:
- Search input: "Search carriers by name, MC#, or DOT#..." with magnifying glass icon
- Equipment filter: "Dry Van" (pre-set, showing container icon)
- Lane display: "IL > TX" pill badge (auto-detected from stops)
- Tier filter: chip buttons "All" (active/blue), "Platinum", "Gold", "Silver", "Bronze"
- Sort dropdown: "Best Score" selected

Below the filter bar, a highlighted section with amber-50 background and amber border:
"Recommended for Chicago, IL to Dallas, TX" heading with sparkle icon

Show 2 recommended carrier cards, then "All Results" section below with 3 more cards. Each carrier card is a white card with border, hover shadow:

Card 1 (RECOMMENDED, top pick):
- Header: "Swift Transport" (bold, text-lg) + gold star rating "4.8" + "GOLD" amber tier badge
- Subheader: "MC-123456" monospace text-xs + "Dry Van, Reefer" equipment badges
- Body row 1: "On-time: 96%" (green text) | "Claims: 0.8%" (green text) | "Last used: Jan 5"
- Body row 2: "$1,850 for this lane" in bold green text (preferred rate) | "38 loads completed"
- Body row 3: "Compliant" green badge | "Insurance expires: Jun 15, 2025"
- Footer: "Select Carrier" primary blue button on the right, "View Profile" ghost link on the left
- Card has a subtle gold/amber left border (recommended indicator)

Card 2 (RECOMMENDED):
- "Werner Enterprises" | 4.5 stars | "SILVER" slate badge
- MC-234567 | Dry Van
- On-time: 91% (amber) | Claims: 1.2% (amber) | Last used: Dec 28
- "$1,920 for this lane" | "22 loads completed"
- "Compliant" green | "Insurance: Apr 30, 2025"
- "Select Carrier" button | "View Profile" link

"ALL RESULTS" section header with "15 carriers found" subtitle:

Card 3:
- "JB Hunt Transport" | 4.6 stars | "PLATINUM" indigo badge
- MC-345678 | Dry Van, Flatbed
- On-time: 94% | Claims: 0.5% | Last used: Jan 10
- "$2,050 for this lane" | "51 loads completed"
- "Select Carrier" | "View Profile"

Card 4:
- "Schneider National" | 4.3 stars | "GOLD" amber badge
- MC-456789 | Dry Van, Reefer
- On-time: 89% (amber) | Claims: 1.8% (amber) | Last used: Dec 15
- "No rate history for this lane" (gray italic text)
- "Select Carrier" | "View Profile"

Card 5 (NOT AVAILABLE):
- "Regional Express LLC" | 3.2 stars | "BRONZE" orange badge
- MC-567890 | Dry Van
- GRAYED OUT with overlay text: "Insurance expired Jan 1, 2025" in red
- "Select Carrier" button DISABLED (gray, not clickable)

At the bottom of the carrier list:
- "Skip - Create Without Carrier" ghost text link (left)
- "Post to Load Board" outline button with external-link icon (left)
- Pagination: "Showing 5 of 15 carriers" + "Load More" button

RIGHT SIDE - Load Summary Panel:
White card, subtle border, sticky position.
- "Load Summary" header
- "Order: ORD-2025-0412" (blue link)
- "Customer: Acme Manufacturing Co." (blue link)
- Separator
- Route: "Chicago, IL" (blue dot) arrow "Dallas, TX" (green dot)
- "924 mi | Dry Van" with icons
- "Weight: 42,000 lbs | 12 pallets"
- Separator
- "Pickup: Jan 15, 8:00 AM"
- "Delivery: Jan 17, 2:00 PM"
- Separator
- "Customer Rate: $2,250.00" (bold)
- "Carrier: Not yet selected" (gray italic)
- "Margin: --" (gray)

FOOTER: sticky bottom bar, white bg, top border
- Left: "Cancel" ghost button
- Center: "Save Draft" outline button
- Right: "< Back" outline + "Next >" primary blue (disabled until carrier selected or "Skip" clicked)

Design Specifications:
- Font: Inter, 14px base
- Carrier cards: white bg, rounded-lg, border slate-200, p-4, hover:shadow-md, transition
- Recommended cards: left border 3px amber-400, bg-amber-50/30 subtle tint
- Star ratings: amber-400 filled stars, gray-300 empty stars
- Tier badges: pill shape, per carrier-tier color system (Platinum=indigo, Gold=amber, Silver=slate, Bronze=orange)
- Compliance badge: pill, green-100 bg, green-800 text, "Compliant" / red-100 bg for "Expired"
- Preferred rate: font-semibold, text-emerald-600
- Disabled card: opacity-60, red-50 overlay, cursor-not-allowed
- Filter chips: rounded-full, active=bg-blue-600 text-white, inactive=bg-gray-100
- Summary panel: bg-slate-50, rounded-lg, p-4
- Modern SaaS aesthetic similar to Linear.app or Vercel
```

---

## 15. Enhancement Opportunities

### Current State (Wave 2)

**What's built and working:**
- [ ] Nothing -- 0 screens built. All API endpoints exist.

**What needs polish / bug fixes:**
- [ ] N/A (not yet built)

**What to add this wave:**
- [ ] 5-step wizard with pre-fill from order
- [ ] Step 1: order selection + equipment type
- [ ] Step 2: stop builder (reuse from Order Entry)
- [ ] Step 3: carrier search with filters and result cards
- [ ] Step 3: carrier recommendations (top 5) based on lane history
- [ ] Step 3: carrier cards with scorecard, on-time%, tier, preferred rate
- [ ] Step 3: "Skip" option for unassigned loads
- [ ] Step 4: rate entry with live margin calculator
- [ ] Step 4: customer rate display from order
- [ ] Step 5: review with validation summary
- [ ] Create as PLANNING / PENDING / TENDERED
- [ ] Save draft at any step

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| 5-step wizard with order pre-fill | High | Medium | P0 |
| Carrier search with filters | High | Medium | P0 |
| Carrier result cards (name, MC#, score, on-time, rate) | High | Medium | P0 |
| Carrier recommendations (top 5 for lane) | High | Medium | P0 |
| Live margin calculator | High | Medium | P0 |
| Step 2 stop builder (reuse) | High | Low (reuse) | P0 |
| Equipment type selector (reuse) | High | Low (reuse) | P0 |
| Save draft at any step | Medium | Low | P0 |
| Tier filter for carriers | Medium | Low | P1 |
| Compliance validation on carrier select | Medium | Medium | P1 |
| Market rate comparison (DAT/Truckstop) | Medium | High | P1 |
| "Book it" one-click for preferred carrier | Medium | Medium | P1 |
| Post to load board option | Medium | High | P2 |
| Clone stops from previous load on same lane | Low | Medium | P2 |
| Rate negotiation notes | Low | Low | P2 |
| Save lane rate for future reference | Low | Medium | P2 |
| Batch load creation (split orders) | Low | High | P3 |
| Auto fuel surcharge calculation | Low | Medium | P3 |

### Future Wave Preview

- **Wave 3:** AI-powered carrier matching: machine learning model trained on historical load outcomes (on-time, claims, rate acceptance) to rank carriers with predicted success probability. Integration with carrier TMS for real-time truck availability. Rate negotiation chatbot that automatically counter-offers carriers within margin guidelines.
- **Wave 4:** Automated load building rules engine: when an order is confirmed, automatically build a load and assign the highest-ranked available carrier at the best rate. "Auto-dispatch" for recurring lanes with preferred carriers. Customer-specific carrier exclusion lists.

---

<!--
TEMPLATE USAGE NOTES:
1. This screen is the Load Builder wizard, the second major form in TMS Core after Order Entry.
2. Step 3 (Carrier Selection) is unique to this screen and represents the most complex UX challenge: helping Maria choose the best carrier in under 60 seconds.
3. Many components are reused from Order Entry (04-order-entry.md): Stepper, EquipmentSelector, StopBuilder, CurrencyInput, RouteMapPreview.
4. Carrier tier colors reference status-color-system.md Section 8 (Carrier Tier).
5. Carrier compliance colors reference status-color-system.md Section 7 (Carrier Compliance).
6. The recommendation algorithm (Section 4, field #7) is a weighted scoring model defined here for the first time.
7. The Stitch prompt focuses on Step 3 (Carrier Selection) as the most visually distinctive and important step.
8. Role-based access follows 06-role-based-views.md for load creation and carrier assignment permissions.
9. The margin calculator is a critical business feature that prevents below-target margins, the #1 cause of unprofitable loads.
-->
