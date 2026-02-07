# Order Entry -- Multi-Step Creation Wizard

> Service: TMS Core | Wave: 2 | Priority: P0
> Route: /orders/new | Status: Not Started
> Primary Personas: Maria (Dispatcher), Sarah (Ops Manager), James (Sales Agent)
> Roles with Access: super_admin, admin, ops_manager, dispatcher (all steps), sales_agent (via quote conversion only)

---

## 1. Purpose & Business Context

**What this screen does:**
The Order Entry wizard is the primary mechanism for creating new customer orders in Ultra TMS. It walks users through a structured five-step process -- Customer & Reference, Cargo Details, Stops (Pickup & Delivery), Rate & Billing, and Review & Submit -- ensuring that every mandatory field is captured before the order can be confirmed. This is the most complex form in the entire system, touching 58 order fields across five distinct data domains.

**Business problem it solves:**
Without a guided order entry flow, dispatchers and sales agents resort to free-form data entry that leads to incomplete orders -- missing customer references that delay invoicing, incorrect equipment types that cause truck rejections at shipper docks, and unvalidated stop sequences that create impossible routes. A structured wizard with per-step validation eliminates the #1 source of downstream operational errors: bad order data. The average brokerage loses 12-18 minutes per order to data correction; this wizard targets under 4 minutes per order with zero corrections needed.

**Key business rules:**
- An order must have at least one Pickup stop and one Delivery stop to be submitted.
- Customer must exist in the CRM before an order can be created for them. If the customer is on credit hold, a warning banner appears but the order can still be saved as Draft.
- Equipment type is mandatory. If Reefer is selected, temperature requirements become mandatory fields.
- Hazmat toggle flips three additional fields to mandatory (UN number, hazmat class, placard type).
- Customer rate is optional at Draft status but mandatory for Confirmed status.
- Orders created from a quote conversion auto-populate all fields from the quote; the user reviews rather than enters data.
- Sales agents can only create orders via quote conversion, not from scratch.
- Orders saved as Draft do not trigger any downstream workflows. Orders saved as Confirmed immediately appear in the dispatcher's queue.
- Duplicate detection: if an order with the same customer + PO number + pickup date exists, a warning modal appears before submission.

**Success metric:**
Average time from "New Order" click to "Order Confirmed" drops from 15 minutes to under 4 minutes. Order data correction rate drops from 22% to under 3%.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Orders List | Clicks "+ New Order" button | None (blank form) |
| Orders List | Clicks "Clone" action on existing order row | `?cloneFrom=ORD-2025-XXXXX` (pre-fills all fields from source order) |
| Quote Detail | Clicks "Convert to Order" button | `?fromQuote=QT-2025-XXXXX` (pre-fills customer, cargo, stops, rate from quote) |
| Order Detail | Clicks "Clone Order" in actions dropdown | `?cloneFrom=ORD-2025-XXXXX` |
| Customer Detail | Clicks "Create Order" quick action | `?customerId=CUST-XXX` (pre-fills Step 1 customer) |
| Sidebar Navigation | Clicks "New Order" in Operations section | None (blank form) |
| Direct URL | Bookmark / shared link | Route params / query params |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Orders List | Clicks "Cancel" at any step, or "Back to Orders" after save | None (return to list with current filters preserved) |
| Order Detail | Clicks "Create as Draft" or "Create & Confirm" on Review step | `orderId` (navigates to `/orders/:id`) |
| Load Builder | Clicks "Create & Build Load" on Review step | `orderId` (navigates to `/loads/new?fromOrder=ORD-XXX`) |
| Order Entry (same screen) | Clicks "Save & Create Another" | None (form resets; toast confirms previous save) |

**Primary trigger:**
Maria receives a phone call or email from a customer requesting a shipment. She opens the Order Entry wizard from the sidebar or the Orders List. Alternatively, James converts an accepted quote into an order, which brings him here with pre-filled data. Sarah uses this screen when handling VIP customer requests directly.

**Success criteria (user completes the screen when):**
- User has entered all required fields across all five steps without validation errors.
- User has confirmed the order by clicking either "Create as Draft" (for orders pending rate confirmation) or "Create & Confirm" (for orders ready for dispatch).
- The order appears in the Orders List with the correct status and all data intact.

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------------+
|  Breadcrumb: Operations > Orders > New Order                           |
+------------------------------------------------------------------------+
|                                                                        |
|  +------------------------------------------------------------------+  |
|  |  STEPPER BAR (horizontal, full-width)                            |  |
|  |  [1. Customer & Ref] --> [2. Cargo] --> [3. Stops] --> [4. Rate] |  |
|  |  --> [5. Review]                                                 |  |
|  |  Active step highlighted blue. Completed steps show green check. |  |
|  |  Future steps are gray. Click completed step to navigate back.   |  |
|  +------------------------------------------------------------------+  |
|                                                                        |
|  +----------------------------------------------+  +--------------+   |
|  |  MAIN FORM AREA (70% width)                  |  | RIGHT PANEL  |   |
|  |  Card-based form section for active step      |  | (30% width)  |   |
|  |                                               |  |              |   |
|  |  [Form fields organized in 2-column grid]     |  | Order Summary|   |
|  |  [Each field with label, input, helper text]  |  | (live update)|   |
|  |                                               |  |              |   |
|  |  Section sub-headers for field grouping       |  | Customer:    |   |
|  |  (e.g., "Hazmat Details" conditional section) |  | [name]       |   |
|  |                                               |  | Equipment:   |   |
|  |                                               |  | [type icon]  |   |
|  |                                               |  | Stops:       |   |
|  |                                               |  | [P] CHI->DAL|   |
|  |                                               |  | Rate:        |   |
|  |                                               |  | $2,450.00    |   |
|  |                                               |  |              |   |
|  +----------------------------------------------+  +--------------+   |
|                                                                        |
|  +------------------------------------------------------------------+  |
|  |  FOOTER BAR (sticky at bottom)                                   |  |
|  |  [Cancel]           [Save Draft]      [< Back]  [Next >]        |  |
|  |                                       (or [Submit] on last step) |  |
|  +------------------------------------------------------------------+  |
+------------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible, above the fold) | Stepper bar showing current step, active form fields for current step, Next/Back navigation buttons | User must always know where they are in the wizard and what to fill out next |
| **Secondary** (visible but less prominent) | Right-panel order summary (live preview of entered data), validation error indicators per step, step completion indicators | Provides confidence that entered data is correct without switching steps |
| **Tertiary** (available on scroll or expand) | Hazmat details (conditional), special handling requirements, special instructions per stop, billing notes, accessorial charge details | Not needed for every order; progressive disclosure keeps the form clean |
| **Hidden** (behind a click -- modal, drawer, or detail page) | Template selection modal, address book lookup modal, clone order selection modal, facility search modal, carrier rate history (for margin preview) | Deep functionality that supports power users without cluttering the primary flow |

---

## 4. Data Fields & Display

### Visible Fields

**Step 1 -- Customer & Reference**

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen | Required |
|---|---|---|---|---|---|
| 1 | Customer | Order.customerId | Searchable select dropdown (shows company name, city, state). Recent customers shown first. Links to Customer entity. | Top of Step 1, full-width | Yes |
| 2 | Customer Reference # | Order.customerReferenceNumber | Text input, max 50 chars | 2-column grid, left |  No |
| 3 | PO Number | Order.poNumber | Text input, max 50 chars | 2-column grid, right | No |
| 4 | BOL Number | Order.bolNumber | Text input, max 50 chars | 2-column grid, left | No |
| 5 | Sales Rep | Order.salesRepId | Auto-populated from customer's assigned sales rep. Searchable select for override. | 2-column grid, right | Yes (auto) |
| 6 | Order Template | N/A (UI-only) | Dropdown: "Book from template" -- shows saved templates for this customer. Selecting one pre-fills steps 2-4. | Below customer select | No |
| 7 | Priority | Order.priority | Select: Low, Medium, High, Urgent. Default: Medium. | 2-column grid, left | Yes |
| 8 | Internal Notes | Order.internalNotes | Textarea, max 500 chars. Not visible to customer. | Full-width, bottom of step | No |

**Step 2 -- Cargo Details**

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen | Required |
|---|---|---|---|---|---|
| 9 | Commodity | Order.commodity | Text input with autocomplete from historical commodities for this customer | Full-width | Yes |
| 10 | Weight (lbs) | Order.weight | Numeric input with comma formatting. Min 1, max 80,000. Unit label "lbs" | 3-column grid, col 1 | Yes |
| 11 | Pieces | Order.pieces | Numeric input. Min 1. | 3-column grid, col 2 | No |
| 12 | Pallets | Order.pallets | Numeric input. Min 0, max 30. | 3-column grid, col 3 | No |
| 13 | Equipment Type | Order.equipmentType | Visual card selector (icon + label): Dry Van, Reefer, Flatbed, Step Deck, Lowboy, Conestoga, Power Only, Sprinter, Hotshot, Tanker, Hopper, Container. Selected card has blue border. | Full-width grid of cards | Yes |
| 14 | Hazmat | Order.isHazmat | Toggle switch. Default: Off. | Left-aligned row | No |
| 15 | UN Number | Order.hazmatUnNumber | Text input (conditional: visible when Hazmat = On) | Hazmat section, col 1 | Yes (if hazmat) |
| 16 | Hazmat Class | Order.hazmatClass | Select dropdown: Class 1-9 (conditional) | Hazmat section, col 2 | Yes (if hazmat) |
| 17 | Placard Required | Order.hazmatPlacard | Select dropdown: placard types (conditional) | Hazmat section, col 3 | Yes (if hazmat) |
| 18 | Min Temperature | Order.tempMin | Numeric input with "F" unit (conditional: visible when Equipment = Reefer) | Temp section, col 1 | Yes (if reefer) |
| 19 | Max Temperature | Order.tempMax | Numeric input with "F" unit (conditional) | Temp section, col 2 | Yes (if reefer) |
| 20 | Special Handling | Order.specialHandling | Checkbox group: Liftgate Required, Inside Delivery, Appointment Required, Driver Assist, Oversized, Tarp Required | Full-width | No |
| 21 | Dimensions (L x W x H) | Order.dimensions | 3 numeric inputs in a row (inches). Optional. | Full-width row | No |

**Step 3 -- Stops (Pickup & Delivery)**

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen | Required |
|---|---|---|---|---|---|
| 22 | Stop Type | Stop.type | Toggle pills: Pickup / Delivery / Stop | Stop card header | Yes |
| 23 | Facility Name | Stop.facilityName | Autocomplete from facility database. If found, auto-fills address, contact. | Stop card, top | Yes |
| 24 | Address | Stop.address | Google Places autocomplete. Street, City, State, ZIP. Structured address fields. | Stop card, address section | Yes |
| 25 | Contact Name | Stop.contactName | Text input, max 100 chars | Stop card, 2-col, left | No |
| 26 | Contact Phone | Stop.contactPhone | Phone input with formatting | Stop card, 2-col, right | No |
| 27 | Appointment Date | Stop.appointmentDate | Date picker | Stop card, 2-col, left | Yes |
| 28 | Time Window (From) | Stop.appointmentTimeFrom | Time picker (15-min increments) | Stop card, 2-col, center | Yes |
| 29 | Time Window (To) | Stop.appointmentTimeTo | Time picker (15-min increments) | Stop card, 2-col, right | No |
| 30 | Stop Weight | Stop.weight | Numeric input | Stop card, 3-col | No |
| 31 | Stop Pieces | Stop.pieces | Numeric input | Stop card, 3-col | No |
| 32 | Stop Pallets | Stop.pallets | Numeric input | Stop card, 3-col | No |
| 33 | Stop Commodity | Stop.commodity | Text input (defaults from Step 2 commodity) | Stop card | No |
| 34 | Special Instructions | Stop.instructions | Textarea, max 500 chars. "Dock 14, call 30 min before arrival" | Stop card, full-width | No |
| 35 | Reference # at Stop | Stop.referenceNumber | Text input | Stop card | No |

**Step 4 -- Rate & Billing**

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen | Required |
|---|---|---|---|---|---|
| 36 | Customer Rate | Order.customerRate | Currency input ($X,XXX.XX). The "all-in" line haul rate. | Top of step, prominent | Yes (for Confirmed) |
| 37 | Accessorial Charges | Order.accessorials[] | Repeatable row: Type dropdown (Detention, Lumper, Fuel Surcharge, Liftgate, Layover, TONU, etc.) + Amount ($) + Notes. "Add Accessorial" button. | Below customer rate | No |
| 38 | Fuel Surcharge | Order.fuelSurcharge | Currency input. Auto-calculated from customer's FSC table if configured, or manual entry. Toggle: Auto / Manual. | 2-col, left | No |
| 39 | Total Customer Charges | Calculated | Auto-sum of rate + accessorials + fuel surcharge. Read-only, bold, large font. | Full-width, prominent | Display only |
| 40 | Estimated Carrier Rate | Order.estimatedCarrierRate | Currency input. Optional at order creation. Used for margin preview. | 2-col, left | No |
| 41 | Estimated Margin | Calculated | (Customer Rate - Estimated Carrier Rate) / Customer Rate * 100. Shows $ and %. Color-coded: green >15%, yellow 5-15%, red <5%. | 2-col, right | Display only |
| 42 | Payment Terms | Order.paymentTerms | Select dropdown (auto-populated from customer default): Quick Pay, Net 15, Net 30, COD, Prepaid | 2-col, left | Yes |
| 43 | Billing Contact | Order.billingContactId | Select from customer's contacts list | 2-col, right | No |
| 44 | Billing Notes | Order.billingNotes | Textarea. Special invoicing instructions. | Full-width | No |

**Step 5 -- Review & Submit**

| # | Field Label | Source | Format / Display | Location on Screen | Required |
|---|---|---|---|---|---|
| 45 | Full Order Summary | All fields | Read-only cards mirroring Steps 1-4. Each section is collapsible. "Edit" link on each section header returns to that step. | Full-width | Display only |
| 46 | Validation Summary | Validation engine | Green checkmark list of all passing validations. Red X list of any errors/warnings. Must have zero errors to submit. | Top of review, alert banner | Display only |
| 47 | Route Map Preview | Stops[].address | Embedded Google Map showing all stops with route polyline. Origin marker (blue), destination marker (green), intermediate stops (amber). Total miles displayed. | Right panel or below summary | Display only |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Total Customer Charges | customerRate + SUM(accessorials[].amount) + fuelSurcharge | Currency ($X,XXX.XX), bold, large font |
| 2 | Estimated Margin ($) | customerRate - estimatedCarrierRate | Currency, color-coded: green/yellow/red |
| 3 | Estimated Margin (%) | (customerRate - estimatedCarrierRate) / customerRate * 100 | Percentage (XX.X%), color-coded |
| 4 | Total Route Miles | Google Directions API distance between ordered stops | "X,XXX mi" |
| 5 | Estimated Transit Time | Google Directions API duration + dwell time estimates | "Xd Xh" |
| 6 | Rate Per Mile | customerRate / totalMiles | "$X.XX/mi" -- shown in review step |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] Five-step wizard with horizontal stepper navigation bar
- [ ] Customer searchable select with recent customers shown first (from CRM data)
- [ ] Equipment type visual card selector with icons matching the design system
- [ ] Dynamic stop builder: starts with 1 Pickup + 1 Delivery, add/remove stops
- [ ] Google Places autocomplete for all address fields
- [ ] Facility name autocomplete from the facility database (auto-fills address if matched)
- [ ] Per-step validation before advancing to the next step (client-side + API validation)
- [ ] Rate and accessorial charge entry with auto-sum total
- [ ] Review step with full order summary in read-only format
- [ ] "Create as Draft" vs "Create & Confirm" submission options
- [ ] Save Draft at any step (persists to server, recoverable on return)
- [ ] Conditional fields: Hazmat details appear when hazmat toggle is on
- [ ] Conditional fields: Temperature requirements appear when Reefer is selected
- [ ] Validation summary on Review step (all errors/warnings in one list)
- [ ] Breadcrumb navigation back to Orders List
- [ ] Keyboard navigation: Tab between fields, Enter to advance in single-field areas

### Advanced Features (Logistics Expert Recommendations)

- [ ] Book from template: dropdown on Step 1 to pre-fill from saved order templates per customer
- [ ] Clone from existing order: query param `?cloneFrom=` pre-fills all fields from source order
- [ ] Quote conversion: query param `?fromQuote=` pre-fills all fields from accepted quote
- [ ] Address book: save frequently used facility addresses to a global address book; lookup from any stop card
- [ ] Smart defaults: remember last used equipment type per customer; auto-suggest based on customer's historical orders
- [ ] Drag-to-reorder stops in Step 3 (changes route preview in real-time)
- [ ] Auto-calculate miles between stops using Google Directions API (updates on stop add/remove/reorder)
- [ ] Map preview on Step 3 showing all stops with route polyline and total miles
- [ ] Margin preview on Step 4 (if estimated carrier rate is entered, shows margin $ and % live)
- [ ] Duplicate detection: warn if order with same customer + PO# + pickup date already exists
- [ ] "Create & Build Load" button on Review step to immediately navigate to Load Builder with order data
- [ ] "Save & Create Another" button to reset the form and start a new order after saving
- [ ] Keyboard shortcuts: Ctrl+Right/Left to navigate between steps, Ctrl+S to save draft
- [ ] Auto-save draft every 60 seconds after first field is touched (with visual indicator)
- [ ] Customer credit check: show warning banner if customer is on credit hold or over credit limit
- [ ] Rate per mile calculation displayed in Step 4 and Review

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| Create order from scratch | admin, ops_manager, dispatcher | order_create | Screen not accessible (redirect to Orders List) |
| Create order from quote conversion | admin, ops_manager, sales_agent | order_create, quote_convert | "Convert to Order" button hidden on Quote Detail |
| View/edit customer rate | admin, ops_manager, dispatcher, sales_agent | finance_view | Rate fields hidden in Step 4; only sees "Rate to be determined" |
| View estimated margin | admin, ops_manager | finance_view | Margin preview hidden; rate fields still visible |
| Set priority to Urgent | admin, ops_manager | order_priority_urgent | Urgent option disabled in priority dropdown |
| Delete draft order | admin | order_delete | Delete button not rendered |
| Override sales rep assignment | admin, ops_manager | order_edit_all | Sales rep field is read-only for dispatcher |

---

## 6. Status & State Machine

### Status Transitions

```
[New Form] ---(Save Draft)-------> [PENDING]
    |                                  |
    |---(Create & Confirm)----> [BOOKED] ---------> (further lifecycle in Order Detail)
    |                                  |
    |                            [CONFIRMED] -----> (further lifecycle)
    |
[New Form] ---(Cancel)-----------> (no record created, return to Orders List)
```

Note: The Order Entry wizard only creates orders in two possible statuses:
- **PENDING** (saved as draft -- incomplete, not ready for dispatch)
- **BOOKED** (confirmed -- complete data, ready for load building and dispatch)

All subsequent status transitions (DISPATCHED, IN_TRANSIT, DELIVERED, etc.) happen on the Order Detail screen, not here.

### Actions Available Per Status

| Status | Available Actions (Buttons) | Restricted Actions |
|---|---|---|
| New Form (unsaved) | Save Draft, Cancel, Next/Back (wizard navigation) | Submit (until all required fields are complete) |
| PENDING (draft saved) | Edit (resume wizard), Delete, Submit (if all fields complete) | Dispatch, Invoice |
| BOOKED (confirmed) | N/A (user has left Order Entry; further actions on Order Detail) | N/A |

### Status Badge Colors

| Status | Background | Text | Border | Tailwind Classes |
|---|---|---|---|---|
| PENDING | #F3F4F6 | #374151 | #6B7280 | `bg-gray-100 text-gray-700 border-gray-500` |
| BOOKED | #DBEAFE | #1E40AF | #3B82F6 | `bg-blue-100 text-blue-800 border-blue-500` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Sticky Footer)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| Cancel | X | Ghost / text | Navigates back to Orders List. If unsaved changes exist, shows "Discard changes?" confirm dialog. | Yes (if unsaved changes) |
| Save Draft | Save | Secondary / outline | Saves current form state to server as PENDING order. Can be done at any step. Shows toast "Draft saved." | No |
| Back | ChevronLeft | Secondary / outline | Navigates to previous wizard step. No data lost. | No |
| Next | ChevronRight | Primary / blue | Validates current step. If valid, advances to next step. If invalid, shows inline errors on invalid fields and scrolls to first error. | No |
| Create as Draft | FileText | Secondary / outline (Step 5 only) | Creates order with PENDING status. Navigates to Order Detail. | No |
| Create & Confirm | CheckCircle | Primary / blue (Step 5 only) | Creates order with BOOKED status. Navigates to Order Detail. All required fields must pass validation. | No |
| Create & Build Load | Truck | Primary / blue variant (Step 5 only) | Creates order with BOOKED status and navigates to Load Builder pre-filled with this order's data. | No |
| Save & Create Another | Plus | Ghost / text link (Step 5 only) | Creates the order (Draft or Confirmed based on selected option), resets form, shows success toast. | No |

### Secondary Actions (Top-Right of Page Header)

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| Book from Template | FileStack | Opens template selection modal. Selecting a template pre-fills Steps 2-4 from saved template data. | Customer must be selected first (Step 1) |
| Import from File | Upload | Opens file import modal (CSV/Excel). Parses file and pre-fills form fields. | Any time |

### Bulk Actions

N/A -- this is a single-record creation form.

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + Right Arrow | Advance to next wizard step (same as clicking Next) |
| Ctrl/Cmd + Left Arrow | Go back to previous wizard step (same as clicking Back) |
| Ctrl/Cmd + S | Save draft at current step |
| Ctrl/Cmd + Enter | Submit form (same as clicking primary action on Step 5) |
| Escape | Close any open modal (template, address book, etc.) |
| Tab | Move focus to next form field |
| Shift + Tab | Move focus to previous form field |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| Stop card (Step 3) | Another position in the stops list | Reorders stops. Route map and mileage recalculate. Pickup must remain first; Delivery must remain last (or show warning). |

---

## 8. Real-Time Features

### WebSocket Events

This screen is classified as **Static** in the real-time feature map. Form state is local until submission. No WebSocket subscriptions are needed during form editing.

| Event Name | Payload | UI Update |
|---|---|---|
| N/A | N/A | N/A |

### Live Update Behavior

- **Update frequency:** None (static form).
- **Stale data check:** On submission, the API checks `updatedAt` for cloned/quote-converted orders. If the source entity changed since form load, a warning modal appears: "The source [quote/order] has been updated since you started. Review changes?"
- **Auto-save:** Client-side auto-save to server every 60 seconds after first field is touched. Visual indicator: small "Draft saved X seconds ago" text near the Save Draft button.

### Polling Fallback

N/A -- no real-time updates needed.

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Save Draft | Show success toast immediately; navigate to Order Detail | Show error toast "Failed to save draft. Your data is preserved. Try again." Form state is not lost. |
| Create & Confirm | Show success toast; navigate to Order Detail | Show error toast with specific validation errors from server. Return user to Review step. |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| PageHeader | src/components/ui/PageHeader.tsx | title: "New Order", breadcrumbs: [{label:"Operations"},{label:"Orders", href:"/orders"},{label:"New Order"}] |
| SearchableSelect | src/components/ui/searchable-select.tsx | For customer select, sales rep select, billing contact select |
| AddressAutocomplete | src/components/ui/address-autocomplete.tsx | Google Places autocomplete for stop addresses |
| Button | src/components/ui/button.tsx | All action buttons (variants: primary, secondary, ghost, destructive) |
| Card | src/components/ui/card.tsx | Step content cards, stop cards, summary cards |
| Input | src/components/ui/input.tsx | All text, numeric, currency inputs |
| Select | src/components/ui/select.tsx | Dropdown selects (hazmat class, payment terms, accessorial type) |
| Switch | src/components/ui/switch.tsx | Hazmat toggle, fuel surcharge auto/manual toggle |
| Textarea | src/components/ui/textarea.tsx | Notes, special instructions |
| Calendar | src/components/ui/calendar.tsx + popover.tsx | Date pickers for appointment dates |
| Checkbox | src/components/ui/checkbox.tsx | Special handling checkboxes |
| Badge | src/components/ui/badge.tsx | Step completion indicators, validation status badges |
| Dialog | src/components/ui/dialog.tsx | Confirmation modals, template selection modal |
| Toast / Sonner | src/components/ui/sonner.tsx | Save confirmation, error notifications |
| Tooltip | src/components/ui/tooltip.tsx | Field help text on hover |
| Form | src/components/ui/form.tsx | react-hook-form integration wrapper |
| PhoneInput | src/components/crm/shared/phone-input.tsx | Stop contact phone number |
| AddressForm | src/components/crm/shared/address-form.tsx | Structured address fields per stop |
| ConfirmDialog | src/components/shared/confirm-dialog.tsx | "Discard changes?" on cancel |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| SearchableSelect | Basic combobox with search | Add "recent items" section at top of dropdown, customer credit status indicator next to name, "Create New" option at bottom |
| AddressAutocomplete | Google Places basic | Add facility database search as primary source, fall back to Google Places for unknown addresses |
| Calendar (DatePicker) | Basic calendar popover | Need composite DateTimePicker that combines date + time selection for appointment windows |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| Stepper | Horizontal multi-step wizard navigation bar. Shows step number, label, status (active/complete/future). Click completed step to navigate back. | Medium |
| EquipmentSelector | Visual card grid for equipment type selection. Each card: icon (from design system), label, optional subtitle. Selected state: blue border + check. | Medium |
| StopCard | Collapsible card for a single stop in the stop builder. Contains: type toggle, facility search, address, contact, appointment, cargo fields, instructions. Drag handle. | Complex |
| StopBuilder | Container component for dynamic stop list. Manages add/remove/reorder. Enforces minimum 1 pickup + 1 delivery. Integrates with DnD. | Complex |
| RouteMapPreview | Embedded Google Map showing all stops as markers with route polyline. Auto-calculates and displays total miles. Updates on stop changes. | Medium |
| AccessorialRow | Repeatable row component for accessorial charges: type dropdown + amount input + notes + delete button. "Add Accessorial" button. | Small |
| CurrencyInput | Masked numeric input with currency formatting ($X,XXX.XX). Supports min/max, currency symbol prefix. | Medium |
| MarginIndicator | Visual display of margin $ and %. Color-coded bar/number: green >15%, yellow 5-15%, red <5%. | Small |
| WizardFooter | Sticky bottom bar with conditional button layout based on current step. Handles Back/Next/Save Draft/Submit logic. | Small |
| OrderSummaryPanel | Right-side sticky panel showing live preview of entered order data. Updates as user fills in fields. Collapses on tablet. | Medium |
| TemplateSelector | Modal for browsing and selecting order templates. Filtered by customer. Shows template name, last used, number of uses. | Medium |
| TimePicker | Time selection input with 15-minute increment dropdown (6:00 AM, 6:15 AM, ...). Used for appointment windows. | Medium |
| DuplicateWarningDialog | Modal that appears when duplicate order is detected. Shows existing order details, allows user to proceed or navigate to existing order. | Small |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Radio Group | radio-group | Stop type selection (Pickup/Delivery/Stop) as an alternative to toggle |
| Accordion | accordion | Collapsible sections in Review step |
| Breadcrumb | breadcrumb | Page breadcrumb navigation |
| Stepper | N/A (custom build) | Wizard step navigation (no shadcn stepper exists; build custom) |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/customers?search=&recent=true | Fetch customers for searchable select (recent first) | useCustomerSearch(query) |
| 2 | GET | /api/customers/:id | Fetch selected customer details (contacts, payment terms, credit status) | useCustomer(id) |
| 3 | GET | /api/customers/:id/contacts | Fetch customer contacts for billing contact select | useCustomerContacts(customerId) |
| 4 | GET | /api/users?role=sales_agent | Fetch sales reps for dropdown | useSalesReps() |
| 5 | GET | /api/facilities?search= | Facility name autocomplete | useFacilitySearch(query) |
| 6 | GET | /api/orders/templates?customerId= | Fetch order templates for a customer | useOrderTemplates(customerId) |
| 7 | GET | /api/orders/:id | Fetch source order for cloning | useOrder(orderId) |
| 8 | GET | /api/quotes/:id | Fetch source quote for conversion | useQuote(quoteId) |
| 9 | POST | /api/orders | Create new order (Draft or Confirmed) | useCreateOrder() |
| 10 | PATCH | /api/orders/:id | Update draft order (save progress) | useUpdateOrder() |
| 11 | GET | /api/orders?customerId=&poNumber=&pickupDate= | Duplicate detection check | useOrderDuplicateCheck(params) |
| 12 | POST | /api/orders/templates | Save current order as a template | useSaveOrderTemplate() |
| 13 | GET | /api/commodities?search= | Commodity autocomplete from history | useCommoditySearch(query) |
| 14 | GET | /api/google/directions | Calculate route miles between stops (proxied through backend) | useRouteCalculation(stops) |

### Real-Time Event Subscriptions

N/A -- static form screen. No WebSocket subscriptions.

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 409 | 422 | 500 |
|---|---|---|---|---|---|---|---|
| POST /api/orders | Show validation toast with field-level errors | Redirect to login | Show "Permission Denied" toast | N/A | Show duplicate warning modal | Show validation errors mapped to form fields | Show error toast with retry |
| GET /api/customers | Show empty dropdown with "Error loading customers" | Redirect to login | Show access denied | N/A | N/A | N/A | Show error in dropdown |
| PATCH /api/orders/:id | Show validation toast | Redirect to login | Show "Permission Denied" toast | Show "Order not found -- it may have been deleted" | Show stale data warning | Show validation errors on form | Show error toast with retry |

---

## 11. States & Edge Cases

### Loading State

- **Initial load:** Show page header and stepper immediately. Show skeleton for the form area (3-4 skeleton input rows per step). Right panel shows skeleton for summary.
- **Customer search loading:** Show spinner inside the searchable select dropdown while fetching results.
- **Facility search loading:** Show "Searching facilities..." in the autocomplete dropdown.
- **Route calculation loading:** Show small spinner next to miles display with "Calculating route..." text.
- **Template loading:** Show skeleton rows in the template selection modal while fetching.
- **Duration threshold:** If any API call exceeds 5 seconds, show subtle "This is taking longer than usual..." message below the loading indicator.

### Empty States

**First-time empty (no customers in CRM):**
- Customer select dropdown shows: "No customers found. Create a customer in the CRM first."
- Link button: "Go to CRM" navigates to Customer List.

**No templates available:**
- Template dropdown shows: "No templates for this customer."
- Helper text: "Complete this order and save it as a template for future use."

**No facilities found:**
- Facility autocomplete shows: "No matching facilities. Enter address manually below."

### Error States

**Per-field validation error:**
- Red border on input field.
- Red error message below field: "Customer is required" / "Weight must be between 1 and 80,000 lbs" / "Pickup date must be in the future."
- Step indicator shows red exclamation icon for steps with errors.

**Step validation failure (clicking Next with errors):**
- Scroll to first error field.
- Show all error messages inline.
- Toast: "Please fix X errors before continuing."

**Server-side validation failure (on submit):**
- Map server validation errors to form fields where possible.
- Show unmapped errors in a banner at the top of the Review step.
- Do not navigate away; keep user on form.

**Network failure during save:**
- Toast: "Could not save order. Please check your connection and try again."
- Form state is preserved. Retry button in the toast.
- Auto-saved draft data is preserved in local storage as a backup.

### Permission Denied

- **Full page denied:** If user's role cannot create orders, redirect to Orders List with toast: "You don't have permission to create orders."
- **Partial denied:** Financial fields (rate, margin) hidden for roles without `finance_view` permission. Step 4 shows simplified view: "Rate information will be added by the operations team."

### Offline / Degraded

- **Full offline:** Show banner: "You're offline. Changes will not be saved until your connection is restored." Disable Save Draft and Submit buttons. Form remains editable for data entry. Auto-save queues locally.
- **Degraded:** No impact since this is a static form. Google Places autocomplete may not work offline -- show manual address entry fallback.

---

## 12. Filters, Search & Sort

### Filters

N/A -- this is a form screen, not a list screen. No filters.

### Search Behavior

Search is used within form fields, not as a page-level feature:

| Field | Search Behavior |
|---|---|
| Customer select | Searches by company name, MC#, account number. Debounced 300ms, min 2 chars. Shows recent customers first, then search results. |
| Facility name | Searches facility database by name, city, state. Debounced 300ms, min 2 chars. If no match, user enters address manually. |
| Commodity | Searches historical commodity names for this customer. Debounced 300ms. Shows frequency count next to each suggestion. |
| Sales rep | Searches users with sales_agent role by name. |
| Address | Google Places autocomplete. Debounced 300ms, min 3 chars. Results scoped to US addresses. |

### Sort Options

N/A -- form screen.

### Saved Filters / Presets

N/A -- but Order Templates serve a similar purpose by saving form presets.

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Right-side Order Summary panel collapses to a collapsible drawer at the bottom of the form (toggle with "Show Summary" button).
- Form fields remain in 2-column grid layout.
- Stepper bar: show step numbers and abbreviated labels (e.g., "1. Customer", "2. Cargo").
- Stop cards: single column layout instead of 2-column field grid within each card.
- Equipment type selector: 3 cards per row instead of 6.
- Route map preview: full-width below stop list instead of side panel.
- Sticky footer remains at bottom.

### Mobile (< 768px)

- Stepper bar: show only current step number and label. Previous/next arrows to see other steps. Dots indicator for step position.
- All form fields: single column, full-width.
- Equipment type selector: 2 cards per row, scrollable.
- Stop cards: fully stacked, one field per row.
- Address autocomplete: full-screen modal for Google Places search (better mobile UX).
- Route map: hidden by default; "Show Route Map" button to expand.
- Sticky bottom bar: only Back and Next buttons. Save Draft available in overflow menu (three dots).
- Order Summary panel: hidden entirely; appears as final Review step content.
- Drag-to-reorder stops: replaced with up/down arrow buttons on each stop card.
- Pull-to-refresh: N/A (form screen).

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full layout as designed: form area (70%) + right summary panel (30%) |
| Desktop | 1024px - 1439px | Same layout, summary panel slightly narrower (25%) |
| Tablet | 768px - 1023px | Summary panel collapses to bottom drawer; form remains 2-column |
| Mobile | < 768px | Single column; stepper condensed; summary hidden until Review step |

---

## 14. Stitch Prompt

```
Design a multi-step order creation wizard for a modern freight/logistics TMS (Transportation Management System) called "Ultra TMS."

Layout: Full-width page (no sidebar visible -- the sidebar is collapsed during form entry to maximize space). At the top, a breadcrumb showing "Operations > Orders > New Order." Below that, a horizontal stepper bar spanning the full width with 5 labeled steps: "1. Customer & Reference", "2. Cargo Details", "3. Stops", "4. Rate & Billing", "5. Review & Submit." Step 2 is currently active (highlighted with blue-600 fill and white text). Step 1 shows a green checkmark (completed). Steps 3-5 are gray (future). The stepper has connecting lines between steps.

Main Content Area: Below the stepper, the page is split into two sections. Left side (70% width) is the active step form in a white card with subtle border. Right side (30% width) is a sticky "Order Summary" panel in a white card showing a live preview of entered data so far.

Step 2 (Cargo Details) is shown as the active step. The form card contains:
- "Commodity" text input with autocomplete dropdown showing suggestions: "Electronics - Consumer", "Food - Frozen", "Automotive Parts"
- Three numeric inputs in a row: "Weight (lbs)" showing "42,000", "Pieces" showing "24", "Pallets" showing "12"
- "Equipment Type" section showing a grid of 6 visual cards in 2 rows. Each card has an icon and label: "Dry Van" (container icon, blue), "Reefer" (snowflake icon, cyan -- this one is SELECTED with blue-600 border and subtle blue background), "Flatbed" (rectangle icon, amber), "Step Deck" (steps icon, orange), "Power Only" (zap icon, indigo), "Sprinter" (gauge icon, green). The Reefer card is selected.
- Because Reefer is selected, a "Temperature Requirements" section appears below with a subtle blue-50 background: "Min Temp (F)" input showing "34", "Max Temp (F)" input showing "38"
- "Hazmat" toggle switch (currently OFF)
- "Special Handling" section with checkboxes: "Liftgate Required" (unchecked), "Appointment Required" (checked), "Driver Assist" (unchecked)

Right Summary Panel shows:
- "Customer: Acme Manufacturing Co." with green "Active" badge
- "Ref: PO-2025-44812"
- "Equipment: Reefer" with snowflake icon
- "Cargo: Electronics, 42,000 lbs, 12 pallets"
- "Temp: 34F - 38F"
- "Stops: Not yet configured" in gray text
- "Rate: Not yet entered" in gray text

Sticky Footer Bar at the bottom of the page spanning full width:
- Left side: "Cancel" ghost button
- Center: "Save Draft" outline secondary button
- Right side: "< Back" outline button and "Next >" primary blue-600 button

Design Specifications:
- Font: Inter, 14px base size, 24px page title
- Stepper: connected circles with labels below, blue-600 active, emerald-500 completed check, gray-300 future
- Content background: white (#FFFFFF) with slate-200 borders
- Primary color: blue-600 (#2563EB) for active step, selected equipment card, primary buttons
- Cards: white background, rounded-lg (8px), subtle border, no shadow
- Equipment cards: rounded-lg, border, icon centered above label, 80px x 90px each
- Form field labels: text-sm, font-medium, slate-700
- Inputs: 36px height, rounded-md, slate-300 border, blue-500 focus ring
- Conditional sections (temperature): blue-50 background, rounded-md, slight left border accent in blue-500
- Summary panel: slightly off-white background (slate-50), compact text, labeled sections
- Footer: white background, top border slate-200, h-16, items centered vertically
- Modern SaaS aesthetic similar to Linear.app or Notion forms
- Show all form fields with realistic freight data
```

---

## 15. Enhancement Opportunities

### Current State (Wave 2)

**What's built and working:**
- [ ] Nothing -- 0 screens built. All API endpoints exist.

**What needs polish / bug fixes:**
- [ ] N/A (not yet built)

**What to add this wave:**
- [ ] Full 5-step wizard with stepper navigation
- [ ] Customer search with recent customers
- [ ] Equipment type card selector
- [ ] Dynamic stop builder with add/remove/reorder
- [ ] Google Places address autocomplete
- [ ] Per-step validation
- [ ] Rate entry with accessorials
- [ ] Review and submit with two submission modes (Draft / Confirmed)
- [ ] Save Draft at any step
- [ ] Quote conversion pre-fill (`?fromQuote=` param)
- [ ] Clone pre-fill (`?cloneFrom=` param)
- [ ] Route map preview on Stops step

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| 5-step wizard with validation | High | High | P0 |
| Customer search with recent items | High | Medium | P0 |
| Equipment type visual selector | High | Medium | P0 |
| Dynamic stop builder | High | High | P0 |
| Google Places autocomplete | High | Medium | P0 |
| Save Draft at any step | High | Medium | P0 |
| Quote conversion pre-fill | High | Medium | P0 |
| Route map preview | Medium | Medium | P1 |
| Order templates | Medium | Medium | P1 |
| Clone from existing order | Medium | Low | P1 |
| Auto-save every 60 seconds | Medium | Low | P1 |
| Duplicate detection | Medium | Medium | P1 |
| Drag-to-reorder stops | Low | Medium | P2 |
| Keyboard shortcuts (Ctrl+arrows) | Low | Low | P2 |
| Smart defaults per customer | Low | Medium | P2 |
| Address book (saved facilities) | Medium | Medium | P2 |
| Import from CSV/Excel | Low | High | P3 |

### Future Wave Preview

- **Wave 3:** AI-powered rate suggestion based on lane history + current market data. Automated carrier recommendation at order creation (skipping manual load builder for simple shipments). Multi-order batch import from EDI/Excel. Customer portal self-service order creation.
- **Wave 4:** Recurring order scheduler (auto-create orders on a schedule from templates). Order approval workflow for high-value shipments. Integration with customer ERP systems for automated order ingestion.

---

<!--
TEMPLATE USAGE NOTES:
1. This screen design covers the Order Entry wizard, the most complex form in Ultra TMS.
2. All 58 order fields are accounted for across the 5 wizard steps.
3. Stop fields reference the Stops entity (linked to orders and loads).
4. The Equipment Type selector references the design system's equipment type color system.
5. Status colors reference the global status-color-system.md for Order statuses.
6. Role-based visibility references 06-role-based-views.md for order permissions.
7. API endpoints reference the existing TMS Core API (all endpoints built, 0 screens built).
8. The Stitch prompt targets Step 2 (Cargo Details) as the most visually interesting step to prototype.
-->
