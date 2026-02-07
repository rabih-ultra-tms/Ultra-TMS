# Quote Builder -- Create/Edit Quotes with Rate Calculation

> Service: Sales (03) | Wave: 1 | Priority: P0
> Route: /sales/quotes/new (create) | /sales/quotes/:id/edit (edit) | Status: Not Started
> Primary Personas: James Wilson (Sales Agent), Sales Manager
> Roles with Access: super_admin, admin, sales_manager, sales_agent

---

## 1. Purpose & Business Context

**What this screen does:**
The Quote Builder is the most complex and most critical screen in the Sales service. It provides two modes: **Quick Quote** (simplified single-page form targeting under 60 seconds) and **Full Quote** (multi-section form for complex shipments). Both modes integrate with the rate calculation engine to automatically compute linehaul rates, fuel surcharges, accessorial charges, and total pricing with margin analysis. Market rate data from DAT and Truckstop.com is displayed alongside the calculated rate for competitive benchmarking.

**Business problem it solves:**
Freight brokerages lose deals because quoting takes too long. A customer calls requesting a rate, and if the sales agent cannot provide a competitive number within 1-2 minutes, the customer calls the next broker. Current manual quoting processes involve opening multiple tools (mileage calculator, rate spreadsheet, fuel surcharge table, market rate website), cross-referencing data, and manually computing margins. The Quote Builder consolidates all of these into a single interface where the agent enters the lane and the system handles everything else. This is the difference between quoting 20 shipments/day and quoting 60+.

**Key business rules:**
- Quick Quote requires only: customer, origin city/state, destination city/state, and equipment type. Everything else is optional or auto-calculated.
- Full Quote requires: customer, contact, origin/destination addresses with appointment windows, commodity, weight, equipment type, and rate.
- Rate calculation priority: (1) Customer contract rate, (2) Rate table match, (3) Market rate average, (4) Manual entry.
- Minimum margin enforcement: global default 12%, overridden by customer-specific or lane-specific minimums. Below-minimum quotes require manager approval.
- Fuel surcharge is auto-calculated from the current DOE weekly diesel index and the customer's FSC schedule. Can be manually overridden.
- Accessorial charges use pre-configured rates from the Accessorial Charges screen. Agents select types; amounts are pre-filled.
- Quote validity defaults to 7 days from creation, configurable per customer (1-30 days).
- Multi-stop quotes calculate total distance as the sum of all leg distances.
- When editing an existing DRAFT quote, all original data loads into the form. Non-draft quotes cannot be edited (use "Revise" to create new version).
- Quote versioning: creating a new version from an existing quote links them via parent_quote_id and increments the version number.
- Sales agents can only edit their own quotes. Sales managers can edit any quote.

**Success metric:**
Quick Quote completion time under 60 seconds (from form open to quote sent). Full Quote completion time under 3 minutes. Rate calculation accuracy within 5% of manual calculation. Zero under-margin quotes sent without manager approval.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Sales Dashboard | Clicks "+ New Quote" | None (blank form) |
| Quotes List | Clicks "+ New Quote" | None (blank form) |
| Quotes List | Clicks "Clone" on existing quote | ?cloneFrom=QT-XXXX (pre-fills all fields) |
| Quote Detail | Clicks "Edit" on draft quote | quoteId (loads existing data in edit mode) |
| Quote Detail | Clicks "Revise" on rejected/expired quote | ?reviseFrom=QT-XXXX (pre-fills, new version) |
| Customer Detail (CRM) | Clicks "Create Quote" quick action | ?customerId=CUST-XXX (pre-fills customer) |
| Sidebar Navigation | Clicks "New Quote" quick action | None (blank form) |
| Keyboard Shortcut | Ctrl/Cmd + Q from any Sales screen | None (blank form) |
| Direct URL | Bookmark / shared link | Route/query params |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Quote Detail | Clicks "Save as Draft" or "Save & Send" | quoteId (navigates to `/sales/quotes/:id`) |
| Quotes List | Clicks "Cancel" | None (preserves previous filters) |
| Quote Builder (reset) | Clicks "Save & Create Another" | None (form resets, toast confirms save) |

**Primary trigger:**
James receives a call from a customer: "I need a rate from Chicago to Dallas, dry van, picking up next Tuesday." James presses Ctrl+Q, types "Acme" in the customer search, types "Chi" and "Dal" for the lane, selects Dry Van, and the system calculates a rate of $2,450. James sees the market rate comparison showing his rate is 4% above average -- competitive but with good margin at 18.2%. He clicks "Save & Send" and the customer receives the quote via email before the phone call ends. Total time: 45 seconds.

**Success criteria (user completes the screen when):**
- User has entered all required fields for the selected mode (Quick or Full).
- Rate has been calculated (automatically or manually entered) and margin is visible.
- User has either saved as draft, sent to customer, or cancelled.

---

## 3. Layout Blueprint

### Desktop Layout (1440px+) -- Quick Quote Mode

```
+------------------------------------------------------------------------+
|  Breadcrumb: Sales > Quotes > New Quote                                |
|  [Quick Quote] [Full Quote]  (tab toggle)        [Cancel] [Save Draft] |
+------------------------------------------------------------------------+
|                                                                        |
|  +------------------------------------------+  +--------------------+ |
|  |  QUICK QUOTE FORM (65% width)            |  | RATE CALCULATOR    | |
|  |                                           |  | (35% width, sticky)| |
|  |  Customer *                               |  |                    | |
|  |  [Search customer............]            |  | Linehaul:  $2,100  | |
|  |                                           |  | Fuel:      $  250  | |
|  |  Origin *            Destination *        |  | Access:    $  100  | |
|  |  [Chicago, IL...]    [Dallas, TX...]      |  | ─────────────────  | |
|  |                                           |  | TOTAL:     $2,450  | |
|  |  Equipment Type *                         |  |                    | |
|  |  [DV] [RF] [FB] [SD] [PO] [Other v]     |  | Margin: $420 18.2% | |
|  |                                           |  | [=========---] grn | |
|  |  Pickup Date        Weight (optional)     |  |                    | |
|  |  [Feb 10, 2026]     [42,000 lbs]         |  | Rate Per Mile:     | |
|  |                                           |  | $2.89/mi           | |
|  |  Commodity (optional)                     |  |                    | |
|  |  [Electronics - Consumer]                 |  | ── Market Rates ── | |
|  |                                           |  | Low:  $2,100       | |
|  |  +--------------------------------------+ |  | Avg:  $2,350       | |
|  |  | ROUTE PREVIEW                         | |  | High: $2,800       | |
|  |  | [Map: CHI -> DAL, 847 mi, ~12h]      | |  | [==|=========]     | |
|  |  +--------------------------------------+ |  | Your: $2,450       | |
|  |                                           |  | +4% vs avg         | |
|  +------------------------------------------+  |                    | |
|                                                  | Rate Source:       | |
|  +------------------------------------------------------------------+  | | [MARKET] tag       | |
|  |  FOOTER: [Cancel]     [Save Draft]  [Save & Send] (primary)     |  | +--------------------+ |
|  +------------------------------------------------------------------+  |
+------------------------------------------------------------------------+
```

### Desktop Layout (1440px+) -- Full Quote Mode

```
+------------------------------------------------------------------------+
|  Breadcrumb: Sales > Quotes > New Quote                                |
|  [Quick Quote] [Full Quote]  (tab toggle)        [Cancel] [Save Draft] |
+------------------------------------------------------------------------+
|                                                                        |
|  +------------------------------------------+  +--------------------+ |
|  |  FULL QUOTE FORM (65% width)             |  | RATE CALCULATOR    | |
|  |                                           |  | (35% width, sticky)| |
|  |  === CUSTOMER & CONTACT ===               |  |                    | |
|  |  Customer *          Contact *            |  | (same as Quick     | |
|  |  [Search...]         [Select contact...]  |  |  Quote panel)      | |
|  |  Sales Rep           Validity Period      |  |                    | |
|  |  [Auto: James W.]   [7 days]             |  |                    | |
|  |                                           |  |                    | |
|  |  === SHIPMENT DETAILS ===                 |  |                    | |
|  |  Service Type *      Equipment Type *     |  |                    | |
|  |  [FTL v]             [DV] [RF] [FB] ...  |  |                    | |
|  |  Commodity *         Weight *             |  |                    | |
|  |  [Electronics...]    [42,000 lbs]         |  |                    | |
|  |  Pieces              Pallets              |  |                    | |
|  |  [24]                [12]                 |  |                    | |
|  |  Special Handling: [x] Appt Required      |  |                    | |
|  |                                           |  |                    | |
|  |  === STOPS ===                            |  |                    | |
|  |  +-- STOP 1: PICKUP ───────────────────+ |  |                    | |
|  |  | Facility: [Acme Warehouse Chicago]   | |  |                    | |
|  |  | Address: [123 Industrial Blvd...]    | |  |                    | |
|  |  | Date: [Feb 10]  Time: [8:00-12:00]  | |  |                    | |
|  |  | Contact: [Mike D.] Phone: [312-555]  | |  |                    | |
|  |  | Instructions: [Dock 7, call ahead]   | |  |                    | |
|  |  +--------------------------------------+ |  |                    | |
|  |  +-- STOP 2: DELIVERY ─────────────────+ |  |                    | |
|  |  | Facility: [Dallas Distribution Ctr]  | |  |                    | |
|  |  | Address: [456 Commerce Dr...]        | |  |                    | |
|  |  | Date: [Feb 11]  Time: [6:00-18:00]  | |  |                    | |
|  |  | Contact: [Lisa T.] Phone: [214-555]  | |  |                    | |
|  |  +--------------------------------------+ |  |                    | |
|  |  [+ Add Stop]                             |  |                    | |
|  |                                           |  |                    | |
|  |  === RATE & ACCESSORIALS ===              |  |                    | |
|  |  Linehaul Rate *    Rate Source           |  |                    | |
|  |  [$2,100.00]        [MARKET v]            |  |                    | |
|  |  Fuel Surcharge     [Auto/Manual toggle]  |  |                    | |
|  |  [$250.00]                                |  |                    | |
|  |  Accessorials:                            |  |                    | |
|  |  | Detention  | FLAT | $100.00 | [x]     |  |                    | |
|  |  [+ Add Accessorial]                      |  |                    | |
|  |                                           |  |                    | |
|  |  === NOTES ===                            |  |                    | |
|  |  Internal Notes (not visible to customer) |  |                    | |
|  |  [Customer requested specific driver...]  |  |                    | |
|  |                                           |  |                    | |
|  +------------------------------------------+  +--------------------+ |
|                                                                        |
|  +------------------------------------------------------------------+  |
|  | [Cancel]  [Save Draft]  [Save & Send] [Save & Create Another]   |  |
|  +------------------------------------------------------------------+  |
+------------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible, above the fold) | Customer, origin/destination, equipment type, rate calculator panel | These are the minimum inputs needed for any quote and the output the agent needs |
| **Secondary** (visible in Quick Quote, scroll in Full) | Pickup date, weight, commodity, route map preview, market rate comparison | Context that improves quote accuracy and competitiveness |
| **Tertiary** (Full Quote only) | Contact, stops with addresses/appointments, accessorial details, special handling, notes | Detailed information for formal quotes and complex shipments |
| **Hidden** (behind modals or expandable sections) | Facility database search, customer rate history, template selection, proposal preview | Power features accessible on demand without cluttering the form |

---

## 4. Data Fields & Display

### Visible Fields

**Quick Quote Mode (minimum fields)**

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen | Required |
|---|---|---|---|---|---|
| 1 | Customer | Quote.companyId | Searchable select (company name, city, state). Recent customers first. | Top of form, full-width | Yes |
| 2 | Origin | QuoteStop[0].city + state | City/state autocomplete ("Chi" -> "Chicago, IL") | 2-column, left | Yes |
| 3 | Destination | QuoteStop[last].city + state | City/state autocomplete | 2-column, right | Yes |
| 4 | Equipment Type | Quote.equipmentType | Quick-select button group: DV, RF, FB, SD, PO, Other | Full-width row | Yes |
| 5 | Pickup Date | QuoteStop[0].appointmentDate | Date picker, defaults to tomorrow | 2-column, left | No |
| 6 | Weight | Quote.weight | Numeric input with "lbs" suffix, comma formatting | 2-column, right | No |
| 7 | Commodity | Quote.commodity | Text input with autocomplete from customer history | Full-width | No |

**Full Quote Mode (additional fields)**

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen | Required |
|---|---|---|---|---|---|
| 8 | Contact | Quote.contactId | Select from customer's contacts | 2-column, right of customer | Yes (Full) |
| 9 | Sales Rep | Quote.salesAgentId | Auto-populated, searchable select for override | 2-column, left | Auto |
| 10 | Validity Period | Quote.validityDays | Select: 1, 3, 5, 7, 14, 30 days. Default: customer's default or 7 | 2-column, right | Yes |
| 11 | Service Type | Quote.serviceType | Select: FTL, LTL, PARTIAL, DRAYAGE | 2-column, left | Yes (Full) |
| 12 | Pieces | Quote.pieces | Numeric input | 2-column, left | No |
| 13 | Pallets | Quote.pallets | Numeric input | 2-column, right | No |
| 14 | Special Handling | Quote.specialHandling | Checkbox group: Liftgate, Inside Delivery, Appointment Required, etc. | Full-width | No |
| 15 | Stop Facility | QuoteStop.facilityName | Autocomplete from facility database | Stop card, top | No |
| 16 | Stop Address | QuoteStop.address | Google Places autocomplete | Stop card | Yes (Full) |
| 17 | Stop Date | QuoteStop.appointmentDate | Date picker | Stop card | Yes (Full) |
| 18 | Stop Time Window | QuoteStop.timeFrom / timeTo | Time pickers (15-min increments) | Stop card | No |
| 19 | Stop Contact | QuoteStop.contactName + phone | Text + phone inputs | Stop card | No |
| 20 | Stop Instructions | QuoteStop.instructions | Textarea, max 500 chars | Stop card | No |
| 21 | Linehaul Rate | Quote.linehaulRate | Currency input, auto-calculated or manual | Rate section | Yes |
| 22 | Rate Source | Quote.rateSource | Select: MANUAL, CONTRACT, MARKET, CALCULATED | Rate section | Auto |
| 23 | Fuel Surcharge | Quote.fuelSurcharge | Currency input, auto/manual toggle | Rate section | Auto |
| 24 | Accessorial Type | QuoteAccessorial.type | Select from configured accessorials | Accessorial row | N/A |
| 25 | Accessorial Rate Type | QuoteAccessorial.rateType | Select: FLAT, PER_MILE, PER_CWT, PERCENTAGE | Accessorial row | N/A |
| 26 | Accessorial Amount | QuoteAccessorial.rateAmount | Currency input, pre-filled from config | Accessorial row | N/A |
| 27 | Internal Notes | Quote.internalNotes | Textarea, max 1000 chars | Bottom section | No |
| 28 | Customer Notes | Quote.customerNotes | Textarea, max 1000 chars (included in proposal) | Bottom section | No |

**Rate Calculator Panel (auto-populated)**

| # | Field Label | Source | Format / Display | Location on Screen | Required |
|---|---|---|---|---|---|
| 29 | Linehaul | Calculated/entered | "$X,XXX.XX" | Rate panel, line 1 | Display |
| 30 | Fuel Surcharge | Calculated/entered | "$XXX.XX" | Rate panel, line 2 | Display |
| 31 | Accessorials Total | SUM(accessorials) | "$XXX.XX" | Rate panel, line 3 | Display |
| 32 | Total Amount | Sum of all | "$X,XXX.XX" bold | Rate panel, total line | Display |
| 33 | Margin Amount | Quote.marginAmount | "$XXX" color-coded | Rate panel, below total | Display |
| 34 | Margin Percent | Quote.marginPercent | "XX.X%" with visual bar | Rate panel, below margin | Display |
| 35 | Rate Per Mile | totalAmount / distance | "$X.XX/mi" | Rate panel | Display |
| 36 | Market Rate Low | External API | "$X,XXX" | Rate panel, market section | Display |
| 37 | Market Rate Avg | External API | "$X,XXX" | Rate panel, market section | Display |
| 38 | Market Rate High | External API | "$X,XXX" | Rate panel, market section | Display |
| 39 | Market Position | Calculated | Horizontal bar with marker | Rate panel, market section | Display |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Distance | Google Distance Matrix between all stops | "XXX mi" |
| 2 | Transit Time | Distance / avg speed + dwell time | "Xd Xh" |
| 3 | Total Amount | linehaulRate + fuelSurcharge + SUM(accessorials) | Currency |
| 4 | Margin Amount | totalAmount - estimatedCarrierCost | Currency, color-coded |
| 5 | Margin Percent | marginAmount / totalAmount * 100 | Percentage |
| 6 | Rate Per Mile | totalAmount / distance | "$X.XX/mi" |
| 7 | Fuel Surcharge (auto) | Based on DOE index and customer FSC schedule | Currency |
| 8 | Market Rate Position | (quoteRate - marketLow) / (marketHigh - marketLow) * 100 | Bar position |
| 9 | Expiry Date | createdAt + validityDays | Date |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] Dual-mode interface: Quick Quote (single page) and Full Quote (multi-section) with tab toggle
- [ ] Customer searchable select with recent customers, credit status indicator, and contract rate indicator
- [ ] City/state autocomplete for origin and destination with mileage auto-calculation
- [ ] Equipment type quick-select button group with icons
- [ ] Real-time rate calculation panel (updates as inputs change)
- [ ] Linehaul rate auto-calculation from rate tables or market rates
- [ ] Fuel surcharge auto-calculation from DOE index with manual override toggle
- [ ] Accessorial charges with pre-configured types and amounts
- [ ] Market rate comparison display (low/avg/high from DAT/Truckstop)
- [ ] Margin indicator with color coding (green >15%, yellow 5-15%, red <5%)
- [ ] Minimum margin enforcement with warning/blocking per configuration
- [ ] Multi-stop builder in Full Quote mode (add/remove stops, drag to reorder)
- [ ] Google Places address autocomplete for full addresses
- [ ] Per-field validation with inline error messages
- [ ] Save as Draft at any point
- [ ] Save & Send (saves and opens send modal)
- [ ] Save & Create Another (saves and resets form)
- [ ] Edit mode for existing draft quotes
- [ ] Clone mode (pre-fills from source quote)
- [ ] Revision mode (creates new version linked to parent)
- [ ] Route map preview showing stops and route polyline

### Advanced Features (Logistics Expert Recommendations)

- [ ] Customer rate history for this lane ("Last quoted $2,300 on Jan 15")
- [ ] Smart rate suggestion: if contract rate exists, show it as default; else market avg
- [ ] "Apply Contract Rate" one-click button when customer has a contract for this lane
- [ ] Facility database autocomplete for stop facility names (auto-fills address)
- [ ] Template library: save current quote as template, apply template to new quote
- [ ] Rate adjustment reasons: when manually overriding calculated rate, capture reason
- [ ] Competitor rate intelligence overlay (if available through market data)
- [ ] Auto-save every 30 seconds after first field is touched
- [ ] Keyboard-first workflow: Tab between all fields, Enter to advance sections
- [ ] "What-if" rate scenarios: adjust rate and see margin impact in real-time
- [ ] Currency formatting with live comma insertion as user types
- [ ] Reefer temperature fields appear when equipment is REEFER
- [ ] Hazmat fields appear when hazmat toggle is enabled
- [ ] Customer PO number field for reference tracking
- [ ] Duplicate detection: warn if similar quote exists for same customer/lane/date

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| Create quotes | sales_agent, sales_manager, admin | quote_create | Screen not accessible |
| Edit quotes | sales_agent (own), sales_manager (any) | quote_edit | Read-only view (redirect to detail) |
| View/enter rates | sales_agent, sales_manager | finance_view | Rate section hidden; quote saved without rate for manager to add |
| Override minimum margin | sales_manager, admin | margin_override | Warning shown but send blocked; "Request Approval" button instead |
| Set any sales rep | sales_manager, admin | team_edit | Sales rep field locked to current user |
| View market rates | sales_agent, sales_manager | market_rates_view | Market rate section hidden |
| Send quotes | sales_agent, sales_manager | quote_send | "Save & Send" button hidden; only "Save Draft" available |

---

## 6. Status & State Machine

### Status Transitions (from this screen)

```
[New Form] ---(Save Draft)------> [DRAFT]
    |                                 |
    |---(Save & Send)-----------> [SENT]
    |
[Edit Form] ---(Save)-----------> [DRAFT] (updated)
    |
    |---(Save & Send)-----------> [SENT]
```

The Quote Builder only produces quotes in two statuses: DRAFT (saved but not sent) and SENT (saved and sent to customer). All subsequent status transitions happen on the Quote Detail screen.

### Actions Available Per Status

| Context | Available Actions | Restricted Actions |
|---|---|---|
| New Quote | Save Draft, Save & Send, Save & Create Another, Cancel | N/A |
| Edit DRAFT | Save, Save & Send, Cancel | N/A |
| Revise (new version) | Save Draft, Save & Send, Cancel | Editing original |
| Clone | Save Draft, Save & Send, Cancel | Modifying original |

### Status Badge Colors

Same as Quote Detail (Section 6) -- only DRAFT and SENT are relevant here.

| Status | Tailwind Classes |
|---|---|
| DRAFT | `bg-gray-100 text-gray-700 border-gray-300` |
| SENT | `bg-blue-100 text-blue-800 border-blue-300` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Sticky Footer)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| Cancel | X | Ghost / text | Navigate back. If unsaved changes: "Discard changes?" dialog. | Yes (if unsaved) |
| Save Draft | Save | Secondary / Outline | Save quote with DRAFT status. Navigate to Quote Detail. | No |
| Save & Send | Send | Primary / Blue | Save quote, open send modal (select contact, preview). On confirm: status = SENT. | Yes (send modal) |
| Save & Create Another | Plus | Ghost / text link | Save quote (draft or send based on selection), reset form, show toast. | No |

### Secondary Actions (Top-Right of Header)

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| Apply Template | FileStack | Opens template selection modal | Customer selected |
| Import from Quote | Copy | Opens quote search to clone from | Any time |
| Customer Rate History | History | Opens side panel with lane rate history | Customer + origin + destination entered |

### Bulk Actions

N/A -- single record form.

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + S | Save Draft |
| Ctrl/Cmd + Enter | Save & Send |
| Ctrl/Cmd + Shift + N | Save & Create Another |
| Tab | Move to next field |
| Shift + Tab | Move to previous field |
| Escape | Close modal or cancel form (with confirmation if unsaved) |
| Ctrl/Cmd + 1 | Switch to Quick Quote mode |
| Ctrl/Cmd + 2 | Switch to Full Quote mode |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| Stop card (Full Quote) | Another position in stops list | Reorders stops. Distance and route recalculate. Pickup must remain first; Delivery must remain last. |

---

## 8. Real-Time Features

### WebSocket Events

This screen is primarily a **static form**. However, market rate data is fetched live and can be refreshed.

| Event Name | Payload | UI Update |
|---|---|---|
| rate.market.updated | { lane, equipmentType, newRates } | Refresh market rate display in rate calculator panel if it matches current lane |

### Live Update Behavior

- **Update frequency:** Market rates fetched on lane change (origin + destination entered). Cached for 1 hour.
- **Rate calculation:** Runs client-side on every relevant field change (origin, destination, equipment, weight, accessorials). Debounced 300ms.
- **Auto-save:** Save to server as draft every 30 seconds after first field is touched. Visual indicator: "Draft saved Xs ago" near Save Draft button.
- **Stale data check:** On save, API checks if source data (for clone/revise) has changed. Warning if so.

### Polling Fallback

- **When:** N/A for form data. Market rates are fetched on-demand.
- **Interval:** N/A
- **Endpoint:** N/A

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Save Draft | Navigate to Quote Detail immediately, show toast | Return to form with data preserved, show error toast |
| Save & Send | Navigate to Quote Detail, show "Quote sent" toast | Return to form, show error toast with specific reason |
| Auto-save | Show "Saved" indicator | Show "Save failed" indicator, retry in 30s |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| PageHeader | src/components/layout/page-header.tsx | title: "New Quote" / "Edit Quote", breadcrumbs, actions |
| SearchableSelect | src/components/ui/searchable-select.tsx | Customer search, contact search, sales rep search |
| AddressAutocomplete | src/components/ui/address-autocomplete.tsx | Google Places for stop addresses |
| Button | src/components/ui/button.tsx | All action buttons |
| Card | src/components/ui/card.tsx | Form sections, rate calculator panel, stop cards |
| Input | src/components/ui/input.tsx | All text, numeric inputs |
| Select | src/components/ui/select.tsx | Service type, rate source, accessorial type |
| Switch | src/components/ui/switch.tsx | Fuel surcharge auto/manual toggle |
| Textarea | src/components/ui/textarea.tsx | Notes, stop instructions |
| Calendar | src/components/ui/calendar.tsx + popover.tsx | Date pickers |
| Checkbox | src/components/ui/checkbox.tsx | Special handling options |
| Badge | src/components/ui/badge.tsx | Equipment type badges, rate source tags |
| Dialog | src/components/ui/dialog.tsx | Send modal, template modal, confirmation dialogs |
| Toast / Sonner | src/components/ui/sonner.tsx | Save confirmations, errors |
| Tooltip | src/components/ui/tooltip.tsx | Field help text, rate calculation explanations |
| Form | src/components/ui/form.tsx | react-hook-form integration |
| Tabs | src/components/ui/tabs.tsx | Quick Quote / Full Quote toggle |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| SearchableSelect | Basic combobox | Add recent items section, credit status indicator, contract rate indicator for customer select |
| AddressAutocomplete | Google Places only | Add facility database as primary source, fall back to Google Places |
| Input | Basic text input | Add currency formatting variant with live comma insertion and prefix |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| RateCalculatorPanel | Sticky right panel showing rate breakdown, margin, market comparison. Updates in real-time as form fields change. | High |
| MarketRateBar | Horizontal bar showing DAT/Truckstop low/avg/high with quote rate marker | Medium |
| MarginIndicator | Color-coded margin display with percentage bar (green/yellow/red) | Small |
| EquipmentSelector | Button group with icons for quick equipment type selection (DV, RF, FB, etc.) | Medium |
| CityStateAutocomplete | Lightweight city/state autocomplete for Quick Quote mode (not full address) | Medium |
| StopCard | Collapsible card for a single stop: type, facility, address, date/time, contact, instructions | High |
| StopBuilder | Container managing dynamic stop list: add/remove/reorder, min 1 pickup + 1 delivery | High |
| AccessorialRow | Repeatable row: type select + rate type select + amount input + delete | Small |
| AccessorialBuilder | Container for multiple AccessorialRows with "Add" button and total | Medium |
| CurrencyInput | Masked currency input with "$" prefix, comma formatting, decimal support | Medium |
| FuelSurchargeToggle | Auto/Manual toggle with auto-calculated value displayed alongside manual input | Small |
| RouteMapPreview | Embedded map with route polyline, stop markers, distance and time display | Medium |
| RateSourceSelector | Dropdown showing available rate sources with the selected source and its rate value | Small |
| MinimumMarginWarning | Warning/error banner when margin falls below threshold, with "Request Approval" option | Small |
| QuoteSendModal | Modal: select contact, delivery method (email/portal/both), email preview, send confirmation | Medium |
| CustomerRateHistoryPanel | Side panel showing previous quotes for this customer on this lane | Medium |
| TemplateSelector | Modal for browsing/applying quote templates | Medium |
| TimePicker | Time input with 15-minute increments for stop appointment windows | Medium |
| AutoSaveIndicator | Small text/icon showing auto-save status ("Saved 5s ago" / "Saving..." / "Save failed") | Small |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Tabs | tabs | Quick Quote / Full Quote toggle |
| ToggleGroup | toggle-group | Equipment type selector |
| Collapsible | collapsible | Expandable stop cards, accessorial details |
| AlertDialog | alert-dialog | Discard changes confirmation, minimum margin warning |
| Sheet | sheet | Customer rate history side panel |
| Separator | separator | Section dividers in Full Quote mode |
| Accordion | accordion | Optional expandable sections |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/v1/customers?search=&recent=true | Customer search for select | useCustomerSearch(query) |
| 2 | GET | /api/v1/customers/:id | Customer details (contacts, payment terms, contract rates) | useCustomer(id) |
| 3 | GET | /api/v1/customers/:id/contacts | Customer contacts for contact select | useCustomerContacts(customerId) |
| 4 | POST | /api/v1/quotes/calculate-rate | Calculate rate for given parameters | useCalculateRate() |
| 5 | GET | /api/v1/quotes/market-rates?origin=&dest=&equipment= | Fetch DAT/Truckstop market rates | useMarketRates(origin, dest, equipment) |
| 6 | POST | /api/v1/quotes | Create new quote | useCreateQuote() |
| 7 | PUT | /api/v1/quotes/:id | Update existing draft quote | useUpdateQuote() |
| 8 | POST | /api/v1/quotes/:id/send | Send quote to customer | useSendQuote() |
| 9 | POST | /api/v1/quotes/:id/version | Create new version | useCreateQuoteVersion() |
| 10 | GET | /api/v1/quotes/:id | Fetch quote for edit/clone/revise | useQuote(quoteId) |
| 11 | GET | /api/v1/accessorials | Fetch configured accessorial types | useAccessorials() |
| 12 | GET | /api/v1/rate-tables/match?origin=&dest=&equipment=&customerId= | Find matching rate table entry | useRateTableMatch(params) |
| 13 | GET | /api/v1/facilities?search= | Facility name autocomplete | useFacilitySearch(query) |
| 14 | GET | /api/v1/fuel-surcharge/current | Current DOE-based fuel surcharge rate | useFuelSurchargeRate() |
| 15 | GET | /api/v1/users?role=sales_agent | Sales rep list | useSalesAgents() |
| 16 | GET | /api/v1/quotes?customerId=&lane= | Customer rate history for this lane | useCustomerLaneHistory(customerId, lane) |
| 17 | GET | /api/v1/quotes/templates?customerId= | Quote templates for customer | useQuoteTemplates(customerId) |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| rates:{tenantId} | rate.market.updated | useMarketRateUpdates() -- refreshes market rate display if matching lane |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 422 | 500 |
|---|---|---|---|---|---|---|
| POST /api/v1/quotes | Show validation errors mapped to fields | Redirect to login | Show "Permission Denied" toast | N/A | Show field-level validation errors | Show error toast with retry |
| POST /api/v1/quotes/calculate-rate | Show "Unable to calculate rate" inline | Redirect to login | N/A | N/A | N/A | Show "Rate calculation failed" with manual entry fallback |
| GET /api/v1/quotes/market-rates | N/A | Redirect to login | N/A | Show "No market data for this lane" | N/A | Show "Market rates unavailable" |

---

## 11. States & Edge Cases

### Loading State

- **Initial load (new quote):** Form renders immediately with empty fields. Rate calculator shows "Enter lane details to calculate rate" placeholder.
- **Edit mode:** Show skeleton for form while loading existing quote data. Rate calculator shows skeleton until data loads.
- **Customer search:** Spinner inside dropdown while searching.
- **Rate calculation:** Spinner in rate calculator panel with "Calculating rate..." text. Should take <500ms.
- **Market rate fetch:** Spinner in market rate section with "Fetching market rates..." text. May take 1-3 seconds.
- **Duration threshold:** If rate calculation exceeds 3 seconds, show "Rate calculation is taking longer than usual..." with option to enter manually.

### Empty States

**No customers in CRM:**
- Customer select: "No customers found. Create a customer in CRM first." with "Go to CRM" link.

**No matching rate table:**
- Rate calculator shows: "No contract or rate table match. Using market average." Rate source shows MARKET.

**No market rate data:**
- Market rate section: "Market rates unavailable for this lane." Rate calculation falls back to manual entry.

**No configured accessorials:**
- "No accessorial types configured. Contact admin." Link to Accessorial Charges screen (admin only).

**No customer contacts:**
- Contact select: "No contacts for this customer. Add a contact in CRM." with link.

### Error States

**Per-field validation:**
- Red border on input, red error message below: "Customer is required", "Origin is required", "Rate cannot be negative."
- Minimum margin violation: amber border on rate input, warning banner: "This rate results in 8.5% margin, below the 12% minimum. Manager approval required to send."

**Rate calculation failure:**
- Rate calculator panel shows: "Unable to calculate rate. You can enter the rate manually." Manual rate input remains editable.

**Save failure:**
- Toast: "Could not save quote. Please check your connection and try again." Form state preserved.
- Auto-save failure: Small red indicator "Auto-save failed" near save button. Retry in 30s.

**Market rate timeout:**
- Market rate section: "Market rates timed out. Click to retry." Retry link. Rate calculation continues without market data.

### Permission Denied

- **Full page denied:** Redirect to Quotes List with toast: "You don't have permission to create quotes."
- **Partial denied:** Rate fields hidden: "Rate information will be added by your manager." Quote saves without rate.

### Offline / Degraded

- **Full offline:** Banner: "You're offline. Your quote will be saved locally and synced when reconnected." Form remains editable. Save stores to localStorage.
- **Degraded (Google API down):** Address autocomplete fails: show manual address entry. Distance calculation: show "Distance unavailable" with manual mileage input.

---

## 12. Filters, Search & Sort

### Filters

N/A -- form screen.

### Search Behavior

Search is used within form fields:

| Field | Search Behavior |
|---|---|
| Customer select | Searches by company name, MC#, account number. Debounced 300ms, min 2 chars. Recent customers shown first. |
| Origin/Destination (Quick) | City/state autocomplete from US city database. Debounced 300ms, min 2 chars. |
| Origin/Destination (Full) | Google Places autocomplete. Debounced 300ms, min 3 chars. US addresses. |
| Facility name | Searches facility database by name, city. Debounced 300ms, min 2 chars. |
| Commodity | Historical commodity names for this customer. Debounced 300ms. |
| Contact | Customer contacts by name. Instant filter. |

### Sort Options

N/A -- form screen.

### Saved Filters / Presets

N/A -- but Quote Templates serve a similar purpose for saving form configurations.

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Rate calculator panel: collapses to a collapsible "Rate Summary" section at the bottom of the form (above footer). Toggle with "Show Rate" button.
- Form remains mostly 2-column for field pairs.
- Equipment selector: 4 buttons per row instead of 6.
- Stop cards: single column field layout.
- Map preview: full-width, shorter height.
- Quick/Full toggle: remains at top.

### Mobile (< 768px)

- Rate calculator: hidden by default, accessible via floating "Rate" button that opens a bottom sheet.
- All form fields: single column, full-width.
- Equipment selector: 3 per row, scrollable.
- Stop cards: fully stacked, one field per row.
- Address autocomplete: full-screen modal for better mobile UX.
- Map preview: hidden, "Show Map" expandable button.
- Footer: simplified -- only "Cancel" and "Save" visible; "Send" and "Create Another" in overflow menu.
- Auto-save more critical on mobile (prevent data loss from navigation).

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Form (65%) + sticky rate panel (35%) |
| Desktop | 1024px - 1439px | Form (60%) + rate panel (40%) |
| Tablet | 768px - 1023px | Form full-width, rate panel collapsed to bottom |
| Mobile | < 768px | Single column, rate panel in bottom sheet |

---

## 14. Stitch Prompt

```
Design a quote builder form for a modern freight/logistics TMS (Transportation Management System) called "Ultra TMS." Show the Quick Quote mode.

Layout: Full-width page with dark slate-900 sidebar (240px). Content area with a page header showing breadcrumb "Sales > Quotes > New Quote", title "New Quote", and two tab buttons: "Quick Quote" (active, blue-600 underline and text) and "Full Quote" (inactive, gray). On the right: "Cancel" ghost button and "Save Draft" outline button.

Two-column split below header:
Left side (65%): The Quick Quote form in a white card with subtle border.

Form contents:
- "Customer" label in text-sm font-medium text-slate-700. Below it, a searchable select input showing "Acme Manufacturing" selected with a green dot (active status) and small text "Contract rates available" in blue-500 beneath the input.
- Row of two fields: "Origin" showing "Chicago, IL" with a location pin icon, and "Destination" showing "Dallas, TX" with a location pin icon. A small "847 mi" distance badge between them with a dashed arrow line connecting them.
- "Equipment Type" label with 6 toggle buttons in a row: "DV" (Dry Van, selected - blue-600 bg, white text, with small truck icon), "RF" (Reefer, gray outline), "FB" (Flatbed, gray outline), "SD" (Step Deck, gray outline), "PO" (Power Only, gray outline), "Other" (gray outline). Selected button has blue-600 background with white text and subtle shadow.
- Row of two fields: "Pickup Date" showing "Feb 10, 2026" with calendar icon, "Weight" showing "42,000" with "lbs" suffix label.
- "Commodity" showing "Electronics - Consumer" with autocomplete dropdown partially visible showing suggestions: "Electronics - Consumer", "Electronics - Industrial", "Electronics - Telecom"
- Route preview: A small embedded map showing Chicago and Dallas with a blue route line. Below the map: "847 miles | ~12 hours transit | 1 stop"

Right side (35%): A sticky "Rate Calculator" panel in a white card with a blue-50 top accent border:
- Header: "Rate Calculator" in font-semibold with a small refresh icon button
- Line items:
  - "Linehaul" with "$2,100.00" right-aligned
  - "Fuel Surcharge" with "$250.00" right-aligned, small "(Auto)" tag in gray
  - "Accessorials" with "$100.00" right-aligned, small "1 item" tag
  - Horizontal separator line
  - "Total" in font-bold text-lg with "$2,450.00" right-aligned in font-bold text-lg
- Below total: Margin section
  - "Margin" label with "$420.00" and "18.2%" side by side
  - A horizontal progress bar (8px height, rounded-full): green-500 fill at 72% (representing 18.2% of a 25% max scale)
  - "Min: 12%" in small gray text below the bar
- "Rate Per Mile: $2.89/mi" in gray text
- Separator
- "Market Rates (DAT)" header in text-sm font-medium
  - "Low: $2,100" in text-sm text-slate-500
  - "Avg: $2,350" in text-sm text-slate-600
  - "High: $2,800" in text-sm text-slate-500
  - A horizontal bar with gradient: red-200 to yellow-200 to green-200. A blue-600 diamond marker positioned at about 45% showing the quote rate position. Below: "Your rate is 4.3% above avg" in green-600 text-xs
- "Rate Source: MARKET" tag in blue-100 bg, blue-800 text, small badge

Sticky footer bar spanning full width:
- Left: "Cancel" ghost button
- Right: "Save Draft" outline button, "Save & Send" primary blue-600 button with send icon

Design Specifications:
- Font: Inter, 14px base, 20px title
- Sidebar: slate-900, "Quotes" active
- Content bg: slate-50, cards white with border-slate-200
- Primary: blue-600 for buttons, selected equipment, active tab
- Equipment buttons: 48px height, rounded-md, transition on hover
- Rate calculator: white card with 3px blue-500 top border, slightly elevated (shadow-sm)
- Currency amounts: font-mono, right-aligned, tabular-nums
- Margin bar: green-500 for >15%, amber-500 for 5-15%, red-500 for <5%
- Market rate bar: 6px height, rounded-full, gradient background
- Inputs: 40px height, rounded-md, slate-300 border, blue-500 focus ring
- Modern SaaS aesthetic like Linear.app or HubSpot
- Show realistic freight data
```

---

## 15. Enhancement Opportunities

### Current State (Wave 1)

**What's built and working:**
- Nothing -- screen is Not Started.

**What needs polish / bug fixes:**
- N/A (not yet built)

**What to add this wave:**
- [ ] Quick Quote mode with all core fields
- [ ] Full Quote mode with all sections
- [ ] Customer search with recent customers and contract rate indicator
- [ ] City/state autocomplete for Quick Quote origin/destination
- [ ] Equipment type quick-select buttons
- [ ] Real-time rate calculator panel
- [ ] Linehaul rate auto-calculation (rate table match or market rate)
- [ ] Fuel surcharge auto-calculation from DOE index
- [ ] Accessorial charge selection and amount entry
- [ ] Market rate comparison (DAT/Truckstop integration)
- [ ] Margin indicator with minimum margin enforcement
- [ ] Multi-stop builder in Full Quote mode
- [ ] Save Draft / Save & Send / Save & Create Another
- [ ] Route map preview with distance and transit time
- [ ] Edit mode for draft quotes
- [ ] Clone and revision modes
- [ ] Per-field validation with Zod schema
- [ ] Auto-save to server every 30 seconds

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Quick Quote mode (core fields + rate calc) | High | High | P0 |
| Customer search with contract rate indicator | High | Medium | P0 |
| Rate calculator panel with real-time updates | High | High | P0 |
| Market rate integration (DAT/Truckstop) | High | High | P0 |
| Margin indicator with minimum enforcement | High | Medium | P0 |
| Equipment quick-select buttons | Medium | Low | P0 |
| Full Quote mode (all sections) | High | High | P0 |
| Save Draft / Save & Send flows | High | Medium | P0 |
| Fuel surcharge auto-calculation | Medium | Medium | P1 |
| Multi-stop builder | Medium | High | P1 |
| Accessorial charge builder | Medium | Medium | P1 |
| Route map preview | Medium | Medium | P1 |
| Clone and revision modes | Medium | Medium | P1 |
| Auto-save every 30 seconds | Medium | Low | P1 |
| Customer rate history panel | Medium | Medium | P2 |
| Template library | Low | Medium | P2 |
| Duplicate detection | Low | Medium | P2 |
| Facility database autocomplete | Low | Medium | P2 |
| Keyboard-first workflow optimization | Low | Low | P3 |

### Future Wave Preview

- **Wave 2:** AI-powered rate suggestion ("Recommended rate for this lane: $2,380 based on 87% acceptance probability"). Auto-detect service type from weight/commodity. Smart accessorial suggestions based on lane/facility history.
- **Wave 3:** Voice-powered quoting ("Quote dry van Chicago to Dallas, 42,000 pounds, pick up Tuesday"). Batch quote generation from customer's standing lane agreements. Real-time negotiation mode with customer on portal.

---

<!--
DESIGN NOTES:
1. The Quote Builder is the highest-complexity screen in the Sales service.
2. Quick Quote mode is optimized for phone-call scenarios where speed is paramount.
3. Full Quote mode is for formal proposals where completeness matters.
4. The rate calculator panel MUST be sticky and always visible as the user fills in the form.
5. Rate calculation runs client-side from cached rate tables/market data for speed (<500ms).
6. The minimum margin enforcement is a critical business rule -- it prevents revenue leakage.
7. Form state management: react-hook-form with Zod validation. Each mode has its own schema.
8. Market rate integration depends on DAT/Truckstop API availability. Graceful degradation is essential.
-->
