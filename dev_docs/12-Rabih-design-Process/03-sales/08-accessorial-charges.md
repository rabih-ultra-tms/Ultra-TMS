# Accessorial Charges -- Extra Service Pricing Configuration

> Service: Sales (03) | Wave: 1 | Priority: P1
> Route: /sales/accessorials | Status: Not Started
> Primary Personas: Sales Manager, Admin
> Roles with Access: super_admin, admin, sales_manager (full access), sales_agent (read-only)

---

## 1. Purpose & Business Context

**What this screen does:**
The Accessorial Charges screen is the configuration hub for all extra service pricing in the TMS. It displays a comprehensive list of accessorial charge types -- detention, lumper fees, truck order not used (TONU), layover, stop-off charges, hazmat surcharges, reefer fuel charges, liftgate, inside delivery, and more -- with their default rates, rate types (flat, per-mile, per-hundredweight, per-hour, percentage), and customer-specific overrides. Admins and sales managers configure these charges here; the Quote Builder then presents them as selectable add-ons during quote creation.

**Business problem it solves:**
Accessorial charges are one of the biggest sources of billing disputes and revenue leakage in freight brokerage. When accessorial rates are inconsistent (Agent A charges $75/hour detention, Agent B charges $50/hour), customers receive different pricing for the same service, eroding trust and brand consistency. When accessorial types are not standardized, agents make up charge descriptions, accounting cannot reconcile them, and carriers dispute charges that do not match industry norms. The Accessorial Charges screen centralizes all accessorial definitions, ensures consistent pricing across the sales team, allows customer-specific overrides for contracted rates, and feeds the Quote Builder with pre-populated charges so agents do not have to remember or look up rates.

**Key business rules:**
- Accessorial charges are tenant-wide configurations. Each charge type has a unique code (e.g., DET for Detention, LMP for Lumper).
- Rate types define how the charge is calculated: FLAT (fixed amount), PER_MILE (rate x miles), PER_CWT (rate x hundredweight), PER_HOUR (rate x hours), PERCENTAGE (rate x linehaul percentage).
- Each accessorial type has a default rate. Customer-specific overrides can be configured that take priority over the default when quoting for that customer.
- Accessorial types can be enabled or disabled. Disabled types are not available in the Quote Builder.
- Only admins and sales managers can create, edit, or delete accessorial types. Sales agents have read-only access for reference.
- Effective dates can be set on accessorial rates to handle rate changes (e.g., detention rate increases from $75/hour to $85/hour on March 1).
- Some accessorial types are marked as "standard" and cannot be deleted (they can be disabled). Standard types: Detention, Lumper, TONU, Layover, Stop-Off, Hazmat, Reefer Fuel Surcharge.
- Customer-specific overrides are managed inline from this screen via a nested table or side panel.

**Success metric:**
Accessorial charge inconsistency across quotes drops from 35% variance to <5%. Time to add accessorials during quote creation drops from 2 minutes (looking up rates) to 5 seconds (pre-populated from configuration). Billing disputes related to accessorials drop by 60%.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Sidebar Navigation | Clicks "Accessorial Charges" under Sales section | None |
| Quote Builder | Clicks "Configure Accessorials" link (when no types configured) | None |
| Service Overview | Navigates from documentation | None |
| Admin Settings | Navigates from pricing configuration section | None |
| Direct URL | Bookmark / shared link | Filter params in URL |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Quote Builder | Clicks "Use in Quote" or returns to quote with updated config | None (Quote Builder reads from API) |
| Customer Detail (CRM) | Clicks customer name in customer override section | customerId |
| Accessorial Charges (stays) | All CRUD operations happen on this screen via modals/inline editing | N/A |

**Primary trigger:**
The Admin receives a request from the operations team to increase the standard detention rate from $75/hour to $85/hour, effective March 1. She opens the Accessorial Charges screen, finds "Detention" in the list, clicks "Edit", updates the default rate to $85.00/hour, sets the effective date to March 1, 2026, and saves. She also checks customer-specific overrides -- Acme Manufacturing has a contracted detention rate of $65/hour that should remain unchanged. The new default will apply to all other customers starting March 1. Alternatively, the Sales Manager adds a new accessorial type "Residential Delivery Surcharge" at $125 flat rate for an expanding service offering.

**Success criteria (user completes the screen when):**
- User has reviewed all configured accessorial charge types and their rates.
- User has made any necessary changes (add, edit, enable/disable, set customer overrides).
- User is confident that the Quote Builder will present correct accessorial options and rates.

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------------+
|  Top Bar: [Sales] > Accessorial Charges                                 |
|                                        [+ New Accessorial] (primary)    |
+------------------------------------------------------------------------+
|                                                                        |
|  +----------+  +----------+  +-----------+  +----------+              |
|  | Total    |  | Active   |  | Inactive  |  | Customer |              |
|  | Types    |  | Types    |  | Types     |  | Overrides|              |
|  |   15     |  |    12    |  |     3     |  |    28    |              |
|  +----------+  +----------+  +-----------+  +----------+              |
|                                                                        |
|  +------------------------------------------------------------------+  |
|  | Filters: [Status: Active/Inactive/All] [Rate Type v]              |  |
|  |          [Search accessorial name or code...........]             |  |
|  +------------------------------------------------------------------+  |
|                                                                        |
|  +------------------------------------------------------------------+  |
|  | | Code | Name          | Rate Type | Default    | Effective | Cust|  |
|  | |      |               |           | Rate       | Date      | Ovr |  |
|  | |      |               |           |            |           |     |  |
|  | |------|---------------|-----------|------------|-----------|-----|  |
|  | | DET  | Detention     | PER_HOUR  | $85.00/hr  | Mar 01 26 |  4  |  |
|  | |      | [ACTIVE] [Standard]       | was $75/hr |           |     |  |
|  | |------|---------------|-----------|------------|-----------|-----|  |
|  | | LMP  | Lumper Fee    | FLAT      | $350.00    | Jan 01 26 |  2  |  |
|  | |      | [ACTIVE] [Standard]       |            |           |     |  |
|  | |------|---------------|-----------|------------|-----------|-----|  |
|  | | TONU | Truck Order   | FLAT      | $250.00    | Jan 01 26 |  1  |  |
|  | |      | Not Used      |           |            |           |     |  |
|  | |      | [ACTIVE] [Standard]       |            |           |     |  |
|  | |------|---------------|-----------|------------|-----------|-----|  |
|  | | LAY  | Layover       | PER_HOUR  | $65.00/hr  | Jan 01 26 |  0  |  |
|  | |      | [ACTIVE] [Standard]       |            |           |     |  |
|  | |------|---------------|-----------|------------|-----------|-----|  |
|  | | STOP | Stop-Off      | FLAT      | $150.00    | Jan 01 26 |  3  |  |
|  | |      | Charge        |           |            |           |     |  |
|  | |      | [ACTIVE] [Standard]       |            |           |     |  |
|  | |------|---------------|-----------|------------|-----------|-----|  |
|  | | HAZ  | Hazmat        | FLAT      | $450.00    | Jan 01 26 |  0  |  |
|  | |      | Surcharge     |           |            |           |     |  |
|  | |      | [ACTIVE] [Standard]       |            |           |     |  |
|  | |------|---------------|-----------|------------|-----------|-----|  |
|  | | RFS  | Reefer Fuel   | PER_MILE  | $0.12/mi   | Jan 01 26 |  5  |  |
|  | |      | Surcharge     |           |            |           |     |  |
|  | |      | [ACTIVE] [Standard]       |            |           |     |  |
|  | |------|---------------|-----------|------------|-----------|-----|  |
|  | | RES  | Residential   | FLAT      | $125.00    | Feb 01 26 |  0  |  |
|  | |      | Delivery      |           |            |           |     |  |
|  | |      | [ACTIVE]                  |            |           |     |  |
|  | +------------------------------------------------------------------+  |
|  |  Showing 1-15 of 15                                                |  |
|  +------------------------------------------------------------------+  |
|                                                                        |
|  === CUSTOMER OVERRIDES === (expandable per row or side panel)         |
|  +------------------------------------------------------------------+  |
|  | When row clicked/expanded:                                        |  |
|  | Customer Overrides for "Detention"                                 |  |
|  | +--------------------------------------------------------------+  |  |
|  | | Customer         | Rate     | Effective   | [+ Add Override]|  |  |
|  | |------------------|----------|-------------|-----------------|  |  |
|  | | Acme Mfg         | $65.00/hr| Jan 01 2026 | [Edit] [Delete]|  |  |
|  | | Global Foods     | $70.00/hr| Feb 01 2026 | [Edit] [Delete]|  |  |
|  | | Beta Dist.       | $80.00/hr| Jan 15 2026 | [Edit] [Delete]|  |  |
|  | | Swift Electronics| $75.00/hr| Jan 01 2026 | [Edit] [Delete]|  |  |
|  | +--------------------------------------------------------------+  |  |
|  +------------------------------------------------------------------+  |
+------------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible, above the fold) | Accessorial code, name, status badge, rate type, default rate | Admin needs to identify charge types and their current rates at a glance |
| **Secondary** (visible but less prominent) | Effective date, customer override count, standard/custom badge | Context for understanding rate applicability and scope |
| **Tertiary** (available on expand or click) | Customer-specific override details, rate history, description | Deeper detail for managing customer contracts |
| **Hidden** (behind a modal) | Add/edit accessorial form, add/edit customer override form | CRUD operations triggered on demand |

---

## 4. Data Fields & Display

### Visible Fields

**Main Accessorial List**

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Code | Accessorial.code | Uppercase 2-4 char code (e.g., "DET"), monospace | Table column 1 |
| 2 | Name | Accessorial.name | Text, max 40 chars | Table column 2 |
| 3 | Status | Accessorial.isActive | Toggle switch (active/inactive) or badge | Below name |
| 4 | Standard Flag | Accessorial.isStandard | "Standard" badge if true (cannot be deleted) | Below name, next to status |
| 5 | Rate Type | Accessorial.rateType | Badge: FLAT, PER_MILE, PER_CWT, PER_HOUR, PERCENTAGE | Table column 3 |
| 6 | Default Rate | Accessorial.defaultRate | Currency formatted per rate type: "$XX.XX/hr", "$XX.XX/mi", "$XXX.XX", "XX%" | Table column 4 |
| 7 | Previous Rate | Accessorial.previousRate | Small gray text: "was $75.00/hr" (shown if rate changed recently) | Below default rate |
| 8 | Effective Date | Accessorial.effectiveDate | "MMM DD, YYYY" format | Table column 5 |
| 9 | Customer Overrides | Count of overrides | "X overrides" with clickable link to expand | Table column 6 |
| 10 | Actions | N/A (UI controls) | Three-dot menu: Edit, Duplicate, Enable/Disable, Delete | Table column 7 |

**Customer Override Sub-Table (expanded)**

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 11 | Customer Name | Company.name | Text, linked to CRM | Override table column 1 |
| 12 | Override Rate | AccessorialOverride.rate | Currency formatted same as default rate | Override table column 2 |
| 13 | Effective Date | AccessorialOverride.effectiveDate | "MMM DD, YYYY" | Override table column 3 |
| 14 | Expiry Date | AccessorialOverride.expiryDate | "MMM DD, YYYY" or "No expiry" | Override table column 4 |
| 15 | Override Actions | N/A | Edit pencil, Delete trash icons | Override table column 5 |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Total Override Count | COUNT(overrides WHERE accessorialId = this.id) | Integer |
| 2 | Rate Change Indicator | If defaultRate changed in last 30 days | "was $X.XX" text and up/down arrow |
| 3 | Upcoming Rate Change | If effectiveDate is in the future | "Changes to $X.XX on [date]" amber indicator |
| 4 | Is Pending Change | effectiveDate > now() | Boolean -- shows "Pending" badge |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] List of all accessorial charge types with code, name, rate type, and default rate
- [ ] Status toggle (active/inactive) per accessorial type
- [ ] "Standard" badge for built-in types that cannot be deleted
- [ ] Add new accessorial type via modal form (code, name, rate type, default rate, effective date, description)
- [ ] Edit accessorial type via modal form
- [ ] Delete custom accessorial types (with confirmation; standard types cannot be deleted)
- [ ] Enable/Disable toggle (disabled types hidden from Quote Builder)
- [ ] Customer-specific override management (add, edit, delete overrides per accessorial per customer)
- [ ] Override display: expandable sub-table or side panel per accessorial
- [ ] Effective date management for default rates and customer overrides
- [ ] Rate type display with appropriate unit formatting ($X.XX/hr, $X.XX/mi, $XXX flat, X%)
- [ ] 4 summary stat cards (total types, active, inactive, customer overrides)
- [ ] Filter by status and rate type
- [ ] Search by name or code

### Advanced Features (Logistics Expert Recommendations)

- [ ] Bulk rate update: select multiple accessorial types and apply percentage increase/decrease
- [ ] Rate history per accessorial type (log of all rate changes with dates and who changed)
- [ ] Scheduled rate changes: set a future rate with effective date, auto-applies on that date
- [ ] Customer override import from CSV (for bulk contract setup)
- [ ] Industry benchmark comparison (show how rates compare to industry norms)
- [ ] Duplicate detection: warn if a new accessorial code matches an existing one
- [ ] Accessorial usage analytics: how often each type is used in quotes
- [ ] Default accessorials per customer: some customers always need certain accessorials
- [ ] Accessorial grouping/categories (e.g., "Wait Time" group: Detention, Layover)
- [ ] Export accessorial configuration to PDF/CSV for contract documentation

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| View accessorial types | any authenticated | accessorial_view | Screen not accessible |
| Create accessorial | admin, sales_manager | accessorial_manage | "+ New" button hidden |
| Edit accessorial | admin, sales_manager | accessorial_manage | Edit action hidden, view-only |
| Delete accessorial | admin | accessorial_delete | Delete action hidden |
| Enable/Disable toggle | admin, sales_manager | accessorial_manage | Toggle disabled (display only) |
| Manage customer overrides | admin, sales_manager | accessorial_manage | Override section read-only |
| Bulk rate update | admin | accessorial_manage + bulk_action | Bulk action hidden |

---

## 6. Status & State Machine

### Accessorial Status

Accessorial charges have a simple binary status (not a complex state machine):

```
[ACTIVE] <----(Enable/Disable)----> [INACTIVE]
```

### Status Indicators

| Status | Description | UI Behavior |
|---|---|---|
| ACTIVE | Available in Quote Builder | Green toggle (on), green "Active" badge |
| INACTIVE | Hidden from Quote Builder | Gray toggle (off), gray "Inactive" badge |

### Rate Effective Date States

| State | Description | UI Indicator |
|---|---|---|
| Current | effectiveDate <= now() | Normal display, no indicator |
| Pending | effectiveDate > now() | Amber "Pending" badge: "Effective [date]" |
| Expired Override | Customer override expiryDate < now() | Strikethrough rate, red "Expired" badge |

### Status Badge Colors

| Status | Background | Text | Tailwind Classes |
|---|---|---|---|
| ACTIVE | green-100 | green-800 | `bg-green-100 text-green-800` |
| INACTIVE | gray-100 | gray-700 | `bg-gray-100 text-gray-700` |
| Standard | blue-100 | blue-800 | `bg-blue-100 text-blue-800` |
| Pending Change | amber-100 | amber-800 | `bg-amber-100 text-amber-800` |

### Rate Type Badge Colors

| Rate Type | Background | Text | Tailwind Classes |
|---|---|---|---|
| FLAT | slate-100 | slate-700 | `bg-slate-100 text-slate-700` |
| PER_MILE | blue-100 | blue-700 | `bg-blue-100 text-blue-700` |
| PER_CWT | purple-100 | purple-700 | `bg-purple-100 text-purple-700` |
| PER_HOUR | amber-100 | amber-700 | `bg-amber-100 text-amber-700` |
| PERCENTAGE | green-100 | green-700 | `bg-green-100 text-green-700` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Top-Right of Page)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| + New Accessorial | Plus | Primary / Blue | Opens "Add Accessorial" modal form | No |

### Secondary Actions (Row Dropdown / "More" Menu)

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| Edit | Pencil | Opens "Edit Accessorial" modal with pre-filled data | Always |
| Duplicate | Copy | Creates a new accessorial pre-filled from this one (new code required) | Always |
| View Overrides | Users | Expands customer override sub-table or opens side panel | Always |
| Enable | ToggleRight | Sets accessorial to ACTIVE status | Currently INACTIVE |
| Disable | ToggleLeft | Sets accessorial to INACTIVE status | Currently ACTIVE |
| Delete | Trash | Deletes accessorial with confirmation | Not a "Standard" type; no active customer overrides |

### Customer Override Actions

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| + Add Override | Plus | Opens "Add Customer Override" modal | Override panel expanded |
| Edit Override | Pencil | Opens "Edit Override" modal with pre-filled data | Always |
| Delete Override | Trash | Deletes customer override with confirmation | Always |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + N | Create new accessorial |
| Ctrl/Cmd + K | Open global search |
| Arrow Up/Down | Navigate table rows |
| Enter | Open edit modal for selected row |
| E | Expand/collapse customer overrides for selected row |
| / | Focus search input |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| Accessorial row | Another position in list | Reorder accessorials (affects display order in Quote Builder dropdown). Not essential for MVP. |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| N/A | N/A | Accessorial Charges is a static configuration screen. No real-time push updates needed. |

### Live Update Behavior

- **Update frequency:** Data loads on page navigation. Changes are infrequent (weekly/monthly configuration updates).
- **Concurrent edit handling:** On save, API validates no conflicting changes. If another user modified the same accessorial since page load, show toast: "This accessorial was modified by [user]. Please refresh and try again."

### Polling Fallback

- **When:** N/A -- static screen
- **Interval:** N/A
- **Endpoint:** N/A

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Toggle active/inactive | Immediately update toggle state | Revert toggle, show error toast |
| Delete accessorial | Fade out row immediately | Restore row, show error toast |
| Add/Edit accessorial | Close modal, update list | Reopen modal with error, show validation errors |
| Add/Edit override | Close modal, update override list | Reopen modal with error |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| DataTable | src/components/ui/data-table.tsx | columns, data, expandable rows |
| PageHeader | src/components/layout/page-header.tsx | title: "Accessorial Charges", breadcrumbs, actions |
| StatsCard | src/components/ui/stats-card.tsx | value, label |
| StatusBadge | src/components/ui/status-badge.tsx | status |
| Badge | src/components/ui/badge.tsx | Rate type badges, standard badge |
| Button | src/components/ui/button.tsx | All action buttons |
| Dialog | src/components/ui/dialog.tsx | Add/Edit accessorial and override modals |
| Input | src/components/ui/input.tsx | All form inputs |
| Select | src/components/ui/select.tsx | Rate type select, customer select |
| Switch | src/components/ui/switch.tsx | Active/Inactive toggle |
| SearchableSelect | src/components/ui/searchable-select.tsx | Customer search in override form |
| Calendar | src/components/ui/calendar.tsx + popover.tsx | Effective date picker |
| Tooltip | src/components/ui/tooltip.tsx | Rate change indicators, standard type explanation |
| Skeleton | src/components/ui/skeleton.tsx | Loading states |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| DataTable | Basic rows | Add expandable row support for customer overrides sub-table |
| Input | Basic text input | Add currency formatting variant with dynamic unit suffix ($/hr, $/mi, %, etc.) |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| AccessorialFormModal | Modal form for adding/editing accessorial types: code, name, rate type, rate, effective date, description | Medium |
| OverrideFormModal | Modal form for adding/editing customer overrides: customer select, rate, effective date, expiry date | Medium |
| RateTypeSelector | Select component that shows rate type options with unit previews (e.g., "Per Hour ($X.XX/hr)") | Small |
| CurrencyRateInput | Currency input that dynamically changes unit suffix based on selected rate type | Medium |
| OverrideSubTable | Expandable sub-table showing customer-specific overrides for an accessorial | Medium |
| RateChangeIndicator | Small inline component showing previous rate, direction arrow, and effective date of change | Small |
| AccessorialCodeInput | Text input with uppercase enforcement, max 4 chars, duplicate validation | Small |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Dialog | dialog | Add/Edit accessorial modal, override modal |
| Switch | switch | Active/Inactive toggle per row |
| Collapsible | collapsible | Expandable customer override section per row |
| AlertDialog | alert-dialog | Delete confirmation |
| Tooltip | tooltip | Standard type info, rate change info |
| Separator | separator | Section dividers |
| Badge | badge | Status, rate type, standard badges |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/v1/accessorials | List all accessorial charge types with overrides count | useAccessorials(filters) |
| 2 | GET | /api/v1/accessorials/:id | Get single accessorial with all customer overrides | useAccessorial(accessorialId) |
| 3 | POST | /api/v1/accessorials | Create new accessorial type | useCreateAccessorial() |
| 4 | PUT | /api/v1/accessorials/:id | Update accessorial (rate, name, effective date, etc.) | useUpdateAccessorial() |
| 5 | DELETE | /api/v1/accessorials/:id | Delete accessorial (soft delete, non-standard only) | useDeleteAccessorial() |
| 6 | PATCH | /api/v1/accessorials/:id/toggle | Enable or disable accessorial | useToggleAccessorial() |
| 7 | GET | /api/v1/accessorials/:id/overrides | List customer overrides for an accessorial | useAccessorialOverrides(accessorialId) |
| 8 | POST | /api/v1/accessorials/:id/overrides | Add customer override | useCreateOverride() |
| 9 | PUT | /api/v1/accessorials/:id/overrides/:overrideId | Update customer override | useUpdateOverride() |
| 10 | DELETE | /api/v1/accessorials/:id/overrides/:overrideId | Delete customer override | useDeleteOverride() |
| 11 | GET | /api/v1/customers?search= | Customer search for override form | useCustomerSearch(query) |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| N/A | N/A | No real-time subscriptions -- static configuration screen |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 409 | 422 | 500 |
|---|---|---|---|---|---|---|---|
| POST /accessorials | Show code/name validation errors in modal | Redirect to login | Show "Permission Denied" toast | N/A | Show "Duplicate code" error in modal | Show field-level validation errors | Show error toast |
| PUT /accessorials/:id | Show validation errors in modal | Redirect to login | Show "Permission Denied" toast | Show "Not found" toast | Show "Modified by another user" toast | Show validation errors | Show error toast |
| DELETE /accessorials/:id | Show "Cannot delete standard type" toast | Redirect to login | Show "Permission Denied" toast | Show "Not found" toast | Show "Has active overrides, remove first" toast | N/A | Show error toast |
| PATCH /toggle | N/A | Redirect to login | Show "Permission Denied" toast | Show "Not found" toast | N/A | N/A | Show error toast, revert toggle |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Show 4 skeleton stat cards and table with 8 skeleton rows.
- **Progressive loading:** Table headers and stat card shells render immediately. Data fills in as API responds.
- **Duration threshold:** If loading exceeds 3 seconds, show "Loading accessorial configuration..."

### Empty States

**First-time empty (no accessorial types configured):**
- **Illustration:** Settings/configuration illustration
- **Headline:** "No accessorial charges configured"
- **Description:** "Set up your accessorial charge types to enable extra service pricing in your quotes. Standard industry types will be pre-populated."
- **CTA Buttons:** "Set Up Standard Types" (primary -- pre-creates 7 standard types), "Create Custom" (secondary)

**Filtered empty (filters exclude all):**
- **Headline:** "No accessorial charges match your filters"
- **CTA Button:** "Clear Filters" -- secondary outline button

**No customer overrides for an accessorial:**
- **Display in expanded section:** "No customer-specific overrides. All customers use the default rate." with "+ Add Override" button.

### Error States

**Full page error:**
- **Display:** Error icon + "Unable to load accessorial charges" + Retry button

**Modal save error:**
- **Display:** Validation errors shown inline in the modal form. Red border on invalid fields. Error summary at top of modal.

**Delete error (has dependencies):**
- **Display:** Toast: "Cannot delete [name]. It is referenced in X quotes. Disable it instead." with "Disable" action button in toast.

### Permission Denied

- **Full page denied:** Show "You don't have permission to view accessorial charges" with link to Sales Dashboard
- **Read-only for agents:** Table displays normally. All edit/toggle/add buttons hidden. View-only badge in header: "You have read-only access."

### Offline / Degraded

- **Full offline:** Banner: "You're offline. Showing cached data. Changes cannot be saved."
- **Degraded:** All data loads on manual refresh. No special handling needed.

---

## 12. Filters, Search & Sort

### Filters

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Status | Select | Active, Inactive, All | Active | ?status=active |
| 2 | Rate Type | Multi-select | FLAT, PER_MILE, PER_CWT, PER_HOUR, PERCENTAGE | All | ?rateType= |
| 3 | Type | Select | Standard, Custom, All | All | ?type= |

### Search Behavior

- **Search field:** Single search input in the filter bar
- **Searches across:** Accessorial name, accessorial code
- **Behavior:** Debounced 300ms, minimum 1 character (codes are short)
- **URL param:** ?search=

### Sort Options

| Column / Field | Default Direction | Sort Type |
|---|---|---|
| Code | Ascending (A-Z) | Alphabetic |
| Name | Ascending (A-Z) | Alphabetic |
| Rate Type | Grouped | Custom enum order: FLAT, PER_HOUR, PER_MILE, PER_CWT, PERCENTAGE |
| Default Rate | Descending (highest first) | Numeric |
| Effective Date | Descending (newest first) | Date |
| Customer Overrides | Descending (most overrides first) | Numeric |

**Default sort:** Standard types first (alphabetical), then custom types (alphabetical).

### Saved Filters / Presets

- **System presets:** "Active Only" (status=Active), "With Overrides" (overrideCount > 0), "Pending Changes" (effectiveDate > now())
- **URL sync:** All filter state reflected in URL.

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Stat cards: 2 per row (2 rows of 2)
- Table columns: Hide effective date, customer overrides count; keep code, name, rate type, default rate, actions
- Customer overrides: open in side drawer instead of expandable row
- Modal forms: slightly wider (80% of viewport)
- Sidebar collapses to icon-only mode

### Mobile (< 768px)

- Stat cards: 2 per row, compact size
- Table switches to card-based list (one card per accessorial)
- Each card shows: code badge, name, status toggle, rate type badge, default rate
- Tap card to see customer overrides
- "+ New Accessorial" in sticky bottom bar
- Modal forms: full-screen modal
- Customer overrides: full-screen sub-view accessed from card
- Pull-to-refresh

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full table with all columns, expandable override rows |
| Desktop | 1024px - 1439px | Same layout, table may scroll horizontally |
| Tablet | 768px - 1023px | Reduced columns, overrides in side drawer |
| Mobile | < 768px | Card-based list, full-screen modals |

---

## 14. Stitch Prompt

```
Design an accessorial charges configuration page for a modern freight/logistics TMS (Transportation Management System) called "Ultra TMS."

Layout: Full-width page with dark slate-900 sidebar on the left (240px). White content area. Page header with breadcrumb "Sales > Accessorial Charges", title "Accessorial Charges" in semibold 24px. Subtitle: "Configure extra service charges used in quote pricing" in gray-500 text-sm. Right side: blue-600 "+ New Accessorial" button with plus icon.

Stats Row: 4 stat cards in horizontal row:
- Card 1: "Total Types" value "15" with a list icon
- Card 2: "Active" value "12" with green-500 dot
- Card 3: "Inactive" value "3" with gray-400 dot
- Card 4: "Customer Overrides" value "28" with users icon

Filter Bar: White card with:
- Status toggle group: "Active" (selected, blue-600 bg white text), "Inactive" (gray), "All" (gray)
- Rate Type multi-select showing "All Rate Types"
- Search input with placeholder "Search by name or code..."

Data Table: White card with rows for each accessorial type. Columns:
- Code: 2-4 character uppercase code in monospace font, gray-100 bg rounded badge
- Name: Full name in font-medium, with status badge and optional "Standard" blue badge below
- Rate Type: Colored badge showing type (FLAT in slate, PER_HOUR in amber, PER_MILE in blue, etc.)
- Default Rate: Font-mono currency with unit suffix ($85.00/hr, $350.00, $0.12/mi)
- Effective Date: Date text
- Overrides: Number with user icon, clickable to expand
- Actions: Three-dot menu

Show 7 rows of standard accessorial data:
Row 1: DET | Detention | [ACTIVE] [Standard] | PER_HOUR (amber) | $85.00/hr | "was $75.00/hr" in gray text-xs | Mar 01 2026 | 4 overrides
Row 2: LMP | Lumper Fee | [ACTIVE] [Standard] | FLAT (slate) | $350.00 | Jan 01 2026 | 2 overrides
Row 3: TONU | Truck Order Not Used | [ACTIVE] [Standard] | FLAT (slate) | $250.00 | Jan 01 2026 | 1 override
Row 4: LAY | Layover | [ACTIVE] [Standard] | PER_HOUR (amber) | $65.00/hr | Jan 01 2026 | 0 overrides
Row 5: STOP | Stop-Off Charge | [ACTIVE] [Standard] | FLAT (slate) | $150.00 | Jan 01 2026 | 3 overrides
Row 6: HAZ | Hazmat Surcharge | [ACTIVE] [Standard] | FLAT (slate) | $450.00 | Jan 01 2026 | 0 overrides
Row 7: RFS | Reefer Fuel Surcharge | [ACTIVE] [Standard] | PER_MILE (blue) | $0.12/mi | Jan 01 2026 | 5 overrides

Row 1 (Detention) should be expanded showing a customer overrides sub-table with 4 rows:
- Acme Manufacturing | $65.00/hr | Jan 01, 2026 | No expiry | [Edit] [Delete]
- Global Foods | $70.00/hr | Feb 01, 2026 | Dec 31, 2026 | [Edit] [Delete]
- Beta Distribution | $80.00/hr | Jan 15, 2026 | No expiry | [Edit] [Delete]
- Swift Electronics | $75.00/hr | Jan 01, 2026 | Mar 31, 2026 | [Edit] [Delete]
The sub-table has a "+ Add Override" button in the top right.

Each row has an active/inactive toggle switch on the left side of the name. Standard types have a subtle blue "Standard" badge.

Design Specifications:
- Font: Inter, 14px base, 13px table body, 24px title
- Sidebar: slate-900, "Accessorial Charges" active with blue-600 indicator
- Content bg: slate-50, cards white with border-slate-200
- Primary: blue-600 for buttons, links
- Code badges: gray-100 bg, gray-700 text, font-mono, rounded-md, px-2 py-0.5
- Rate type badges: colored per type (see color mapping above)
- Standard badge: blue-100 bg, blue-800 text, text-xs
- Rates: font-mono, tabular-nums, right-aligned
- Rate change indicator: gray-400 text-xs showing previous rate
- Toggle switch: green-500 when active, gray-300 when inactive
- Expanded override sub-table: gray-50 bg, indented under parent row, subtle left blue-400 border
- Table rows: white bg, slate-200 border-b, gray-50 hover
- Modern SaaS aesthetic similar to Linear.app or Stripe settings pages
```

---

## 15. Enhancement Opportunities

### Current State (Wave 1)

**What's built and working:**
- Nothing -- screen is Not Started.

**What needs polish / bug fixes:**
- N/A (not yet built)

**What to add this wave:**
- [ ] List of all accessorial types with code, name, rate type, default rate
- [ ] Status badge and active/inactive toggle
- [ ] "Standard" badge for built-in types
- [ ] Add new accessorial via modal form
- [ ] Edit accessorial via modal form
- [ ] Delete custom accessorials (with confirmation)
- [ ] Enable/Disable toggle per accessorial
- [ ] Customer-specific override management (add, edit, delete)
- [ ] Expandable sub-table for customer overrides
- [ ] Effective date management
- [ ] Rate type selector with dynamic unit formatting
- [ ] 4 summary stat cards
- [ ] Filter by status and rate type
- [ ] Search by name or code

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Accessorial list with all fields | High | Medium | P0 |
| Add/Edit accessorial modal | High | Medium | P0 |
| Active/Inactive toggle | High | Low | P0 |
| Customer override management | High | High | P0 |
| Rate type selector with dynamic formatting | Medium | Medium | P0 |
| Effective date management | Medium | Low | P1 |
| Standard type protection (cannot delete) | Medium | Low | P1 |
| Stat cards | Low | Low | P1 |
| Filter and search | Medium | Low | P1 |
| Bulk rate update | Low | Medium | P2 |
| Rate history log | Low | Medium | P2 |
| Scheduled future rate changes | Low | Medium | P2 |
| Usage analytics | Low | Medium | P3 |
| CSV import for bulk overrides | Low | Medium | P3 |

### Future Wave Preview

- **Wave 2:** AI-powered accessorial suggestion ("Based on this lane's detention history, recommend adding $85/hr detention to this quote"). Automated accessorial rate benchmarking against industry averages. Carrier-side accessorial matching (link customer accessorial charges to carrier accessorial payments).
- **Wave 3:** Dynamic accessorial pricing based on supply/demand signals (e.g., detention rates auto-increase during peak seasons). Integration with driver app for real-time accessorial logging (driver reports 2 hours detention, system auto-adds charge). Multi-currency support for cross-border accessorials.

---

<!--
DESIGN NOTES:
1. Accessorial Charges is a medium-complexity admin screen. It is primarily accessed by managers and admins, not sales agents.
2. The expandable customer override sub-table is the most complex UI pattern. Consider a side drawer as an alternative if the sub-table causes layout issues.
3. The 7 standard types (DET, LMP, TONU, LAY, STOP, HAZ, RFS) should be seeded on tenant creation. They can be disabled but not deleted.
4. Rate type drives the unit suffix throughout the system. When rate type changes, all UI showing rates must adapt ($/hr, $/mi, flat $, %, $/cwt).
5. The Quote Builder's accessorial selection dropdown reads from this configuration. Changes here immediately affect the Quote Builder.
6. Performance is not a concern -- accessorial lists are small (15-30 types typically). No pagination needed in most cases.
-->
