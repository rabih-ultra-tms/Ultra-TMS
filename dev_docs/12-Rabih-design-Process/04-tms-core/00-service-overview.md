# TMS Core -- Service Overview

> **Service:** TMS Core (Operations) | **Wave:** 2 | **Priority:** P0 -- Critical Path
> **Total Screens:** 14 | **API Endpoints:** 65 | **Backend Status:** 100% Complete | **Frontend Status:** 0% (Not Started)
> **Primary Entities:** Orders (58 fields), Loads (58 fields), Stops, Check Calls
> **Primary Personas:** Maria (Dispatcher, 50+ loads/day), Sarah (Ops Manager, team of 12)
> **Last Updated:** 2026-02-06

---

## Table of Contents

1. [Service Description](#1-service-description)
2. [Screen Inventory](#2-screen-inventory)
3. [Status Machines](#3-status-machines)
4. [Key Dependencies](#4-key-dependencies)
5. [Critical Workflows](#5-critical-workflows)
6. [Real-Time Requirements Summary](#6-real-time-requirements-summary)
7. [Component Requirements Summary](#7-component-requirements-summary)
8. [Business Rules That Affect UI](#8-business-rules-that-affect-ui)
9. [Persona-Specific Behaviors](#9-persona-specific-behaviors)
10. [API Endpoint Summary](#10-api-endpoint-summary)
11. [Data Volume & Performance Considerations](#11-data-volume--performance-considerations)
12. [Build Sequence Recommendation](#12-build-sequence-recommendation)

---

## 1. Service Description

TMS Core is the operational heart of Ultra TMS. It encompasses everything that happens between the moment a customer order is created and the moment that shipment is delivered, confirmed, and ready for invoicing. This service is the primary workspace for dispatchers, operations managers, and anyone involved in the daily execution of freight movements.

Every other service in Ultra TMS either feeds into TMS Core (CRM provides customers, Sales provides quotes that become orders, Carrier provides compliant carriers) or consumes its outputs (Accounting invoices delivered orders, Analytics reports on operational metrics, Customer Portal shows tracking to shippers).

**Why this is Wave 2 and P0:** Without TMS Core, Ultra TMS is a CRM with no operational capability. This is the service that generates revenue. Every day of delay in building TMS Core is a day the platform cannot be used for its primary purpose. The 65 API endpoints are complete and tested. The frontend is the sole blocker.

**Business impact:** A freight brokerage processing 200 loads/day with an average revenue of $2,000/load generates $400,000/day in gross revenue. If TMS Core reduces dispatch time by even 30 seconds per load, that saves over 1.5 hours of dispatcher time daily. If the tracking features prevent one detention charge per week ($250 average), that is $13,000/year saved per brokerage.

---

## 2. Screen Inventory

All 14 screens in TMS Core, listed in recommended build order.

| # | Screen Name | File | Route | Type | Status | Primary Personas | Complexity |
|---|------------|------|-------|------|--------|-----------------|------------|
| 1 | Operations Dashboard | `01-operations-dashboard.md` | `/operations` | Dashboard | Not Started | Maria (Dispatcher), Sarah (Ops Manager) | High |
| 2 | Orders List | `02-orders-list.md` | `/operations/orders` | List | Not Started | Maria, Sarah | High |
| 3 | Order Detail | `03-order-detail.md` | `/operations/orders/:id` | Detail | Not Started | Maria, Sarah | Very High |
| 4 | New Order Form | `04-order-create.md` | `/operations/orders/new` | Form (Create) | Not Started | Maria, Sarah | Very High |
| 5 | Edit Order Form | `05-order-edit.md` | `/operations/orders/:id/edit` | Form (Edit) | Not Started | Maria, Sarah | Very High |
| 6 | Loads List | `06-loads-list.md` | `/operations/loads` | List | Not Started | Maria, Sarah | High |
| 7 | Load Detail | `07-load-detail.md` | `/operations/loads/:id` | Detail | Not Started | Maria, Sarah | Very High |
| 8 | New Load Form | `08-load-create.md` | `/operations/loads/new` | Form (Create) | Not Started | Maria, Sarah | Very High |
| 9 | Edit Load Form | `09-load-edit.md` | `/operations/loads/:id/edit` | Form (Edit) | Not Started | Maria, Sarah | Very High |
| 10 | Dispatch Board | `10-dispatch-board.md` | `/operations/dispatch` | Kanban / Board | Not Started | Maria | Very High |
| 11 | Tracking Map | `11-tracking-map.md` | `/operations/tracking` | Map / Visualization | Not Started | Maria, Sarah | Very High |
| 12 | Stop Management | `12-stop-management.md` | `/operations/loads/:id/stops` | List + Inline Edit | Not Started | Maria | High |
| 13 | Check Call Log | `13-check-call-log.md` | `/operations/loads/:id/checkcalls` | Timeline + Form | Not Started | Maria | Medium |
| 14 | Rate Confirmation | `14-rate-confirmation.md` | `/operations/loads/:id/rate-con` | Document / Preview | Not Started | Maria, Sarah | Medium |

### Screen Type Breakdown

| Type | Count | Screens |
|------|-------|---------|
| Dashboard | 1 | Operations Dashboard |
| List | 2 | Orders List, Loads List |
| Detail | 2 | Order Detail, Load Detail |
| Form (Create) | 2 | New Order, New Load |
| Form (Edit) | 2 | Edit Order, Edit Load |
| Board / Kanban | 1 | Dispatch Board |
| Map / Visualization | 1 | Tracking Map |
| List + Inline Edit | 1 | Stop Management |
| Timeline + Form | 1 | Check Call Log |
| Document / Preview | 1 | Rate Confirmation |

---

## 3. Status Machines

### Order Status Machine

```
                                 ┌──────────┐
                                 │ CANCELLED│
                                 └──────────┘
                                      ▲
                     can cancel from any pre-delivery status
                                      │
┌─────────┐    ┌────────┐    ┌────────┐    ┌────────────┐    ┌───────────┐
│ PENDING  │───>│ QUOTED │───>│ BOOKED │───>│ DISPATCHED │───>│ IN_TRANSIT│
└─────────┘    └────────┘    └────────┘    └────────────┘    └───────────┘
                                                                    │
                                                                    ▼
                              ┌───────────┐    ┌──────────┐    ┌───────────┐
                              │ COMPLETED │<───│ INVOICED │<───│ DELIVERED │
                              └───────────┘    └──────────┘    └───────────┘
```

**Auto-generated number format:** `ORD-YYYYMMDD-XXXX` (e.g., ORD-20260206-0042)

**Key transitions and rules:**
- PENDING -> QUOTED: Quote attached, customer rate set
- QUOTED -> BOOKED: Customer confirms, credit approved
- BOOKED -> DISPATCHED: At least one load created and dispatched
- DISPATCHED -> IN_TRANSIT: First pickup confirmed
- IN_TRANSIT -> DELIVERED: All deliveries confirmed
- DELIVERED -> INVOICED: Invoice generated
- INVOICED -> COMPLETED: Payment received or invoice period closed
- Any pre-delivery -> CANCELLED: Requires reason, manager approval if loads exist

### Load Status Machine

```
┌──────────┐    ┌─────────┐    ┌──────────┐    ┌──────────┐    ┌────────────┐
│ PLANNING │───>│ PENDING │───>│ TENDERED │───>│ ACCEPTED │───>│ DISPATCHED │
└──────────┘    └─────────┘    └──────────┘    └──────────┘    └────────────┘
                                    │                                │
                                    ▼                                ▼
                               ┌──────────┐                    ┌───────────┐
                               │ CANCELLED│                    │ AT_PICKUP │
                               └──────────┘                    └───────────┘
                                    ▲                                │
                                    │                                ▼
                               can cancel                      ┌───────────┐
                               pre-pickup                      │ PICKED_UP │
                                    │                          └───────────┘
                                    │                                │
┌───────────┐    ┌───────────┐    │                                ▼
│ COMPLETED │<───│ DELIVERED │<───┼─────────────────────────┌───────────┐
└───────────┘    └───────────┘    │                         │ IN_TRANSIT│
                      ▲           │                         └───────────┘
                      │           │                                │
                 ┌─────────────┐  │                                ▼
                 │ AT_DELIVERY │──┘                         ┌─────────────┐
                 └─────────────┘                            │ AT_DELIVERY │
                                                            └─────────────┘
```

**Auto-generated number format:** `LOAD-YYYYMMDD-XXXX` (e.g., LOAD-20260206-0018)

**Key transitions and rules:**
- PLANNING -> PENDING: All required fields populated (origin, destination, dates, equipment)
- PENDING -> TENDERED: Carrier selected and rate confirmation sent
- TENDERED -> ACCEPTED: Carrier confirms acceptance
- TENDERED -> CANCELLED: Carrier rejects or no response within timeout
- ACCEPTED -> DISPATCHED: Dispatch confirmed, rate confirmation signed
- DISPATCHED -> AT_PICKUP: Driver arrives at pickup (GPS geofence or manual)
- AT_PICKUP -> PICKED_UP: BOL signed, freight loaded
- PICKED_UP -> IN_TRANSIT: Departed pickup
- IN_TRANSIT -> AT_DELIVERY: Arrived at delivery (GPS geofence or manual)
- AT_DELIVERY -> DELIVERED: POD signed, freight unloaded
- DELIVERED -> COMPLETED: All documents received, ready for billing
- Cannot change carrier after PICKED_UP
- Check calls required every 4 hours minimum while IN_TRANSIT
- GPS updates expected every 30 minutes while in motion

---

## 4. Key Dependencies

### Upstream Dependencies (Services That Feed Into TMS Core)

| Service | Wave | What TMS Core Needs | Integration Point | Status |
|---------|------|--------------------|--------------------|--------|
| **Auth & Admin** | 1 | Authenticated user context, role/permissions, tenant ID | Every API call includes auth token; role determines UI visibility | Built |
| **CRM** | 1 | Customer data (name, address, contacts, credit status, payment terms) | Customer selector in order forms; customer info display on order/load detail | Built |
| **Sales** | 1 | Quotes that convert to orders; lane rate history; customer rate agreements | "Convert to Order" creates order pre-filled from quote; rate lookup for margin calc | Built |
| **Carrier** | 2 | Carrier directory (name, MC#, DOT#, compliance status, insurance, contacts, equipment, lanes, scorecard) | Carrier selector in load forms; compliance check before assignment; carrier info on load detail | In Progress |

### Downstream Dependencies (Services That Consume TMS Core Data)

| Service | Wave | What It Needs From TMS Core | Integration Point |
|---------|------|-----------------------------|-------------------|
| **Accounting** | 3 | Delivered orders/loads for invoicing; carrier rates for settlement | DELIVERED status triggers invoice creation workflow |
| **Analytics** | 3 | All order/load data for operational reporting | Read-only queries against orders/loads/stops/check_calls |
| **Customer Portal** | 3 | Order status, tracking, delivery confirmation, documents | Customer-scoped read access to orders and loads |
| **Carrier Portal** | 3 | Load assignments, stop details, check call submission | Carrier-scoped access to assigned loads |
| **Documents** | 2 | BOL, POD, rate confirmation generation and storage | Document generation triggered by load status changes |
| **Communication** | 2 | Email/SMS notifications on status changes | Event-driven notifications from order/load status transitions |
| **Load Board** | 3 | Available loads for posting to external load boards | Loads in PENDING status with "post to board" flag |

### Shared UI Dependencies

| Component / Pattern | Source | Usage in TMS Core |
|--------------------|---------|--------------------|
| StatusBadge | `src/components/ui/status-badge.tsx` | Order status badges (11 states), Load status badges (12 states), Stop status badges (7 states) |
| DataTable | `src/components/ui/data-table.tsx` | Orders list, Loads list, Stops table, Check calls table, Documents table |
| PageHeader | `src/components/layout/page-header.tsx` | All 14 screens |
| FilterBar | `src/components/ui/filter-bar.tsx` | Orders list, Loads list, Dispatch board |
| StatsCard | `src/components/ui/stats-card.tsx` | Operations dashboard (6 cards), Orders list (4 cards), Loads list (4 cards) |
| Timeline | `src/components/ui/timeline.tsx` | Order detail (activity log), Load detail (activity log), Check call log |
| MapComponent | `src/components/ui/map.tsx` | Tracking map, Order detail (route preview), Load detail (route preview) |

---

## 5. Critical Workflows

### Workflow 1: Order-to-Delivery (End-to-End)

This is the primary revenue-generating workflow. Every dollar of revenue flows through this path.

```
1. Order Created (PENDING)
   ├── Source: Manual entry, quote conversion, customer portal, EDI
   ├── UI: New Order Form -> Order Detail
   └── Data: Customer, origin, destination, dates, equipment, commodity, rate

2. Order Quoted & Booked (QUOTED -> BOOKED)
   ├── Sales confirms customer rate
   ├── Customer credit verified (auto-check against CRM credit status)
   ├── UI: Order Detail -> status badge click -> confirm dialog
   └── Gate: Customer must be ACTIVE with APPROVED credit status

3. Load Created from Order (PLANNING)
   ├── Dispatcher clicks "Create Load" on Order Detail
   ├── Load inherits: origin, destination, stops, dates, equipment, commodity
   ├── Multiple loads possible (split shipment)
   ├── UI: Order Detail -> "Create Load" button -> Load Create Form (pre-filled)
   └── Gate: Order must be in BOOKED status or later

4. Carrier Assigned & Dispatched (PENDING -> TENDERED -> ACCEPTED -> DISPATCHED)
   ├── Dispatcher finds carrier (Dispatch Board or manual search)
   ├── Rate negotiation (carrier rate vs customer rate = margin)
   ├── Tender sent to carrier (email/portal/phone)
   ├── Carrier accepts, rate confirmation generated and signed
   ├── UI: Dispatch Board drag-drop OR Load Detail -> "Assign Carrier"
   └── Gate: Carrier must be ACTIVE + COMPLIANT; rate confirmation required before pickup

5. Pickup (AT_PICKUP -> PICKED_UP)
   ├── Driver arrives at pickup location
   ├── Check call logged (auto via GPS geofence or manual)
   ├── BOL signed at facility
   ├── UI: Load Detail -> Stop Management -> "Arrived" / "Picked Up" buttons
   └── Gate: Rate confirmation must be signed

6. In Transit (IN_TRANSIT)
   ├── Check calls every 4 hours minimum
   ├── GPS updates every 30 minutes
   ├── ETA recalculated on each position update
   ├── Exceptions flagged (late, detention, breakdown, weather)
   ├── UI: Tracking Map (live), Load Detail (check call timeline)
   └── Gate: Must have at least one check call before delivery confirmation

7. Delivery (AT_DELIVERY -> DELIVERED)
   ├── Driver arrives at delivery location
   ├── Freight unloaded, POD signed
   ├── Check call logged (arrival + departure)
   ├── UI: Load Detail -> Stop Management -> "Delivered" button
   └── Gate: POD required for COMPLETED status

8. Completion & Handoff (COMPLETED)
   ├── All documents received (BOL, POD, rate confirmation)
   ├── Order status updated to DELIVERED (all loads delivered)
   ├── Handoff to Accounting for invoicing
   ├── UI: Order Detail shows "Ready for Invoice" indicator
   └── Triggers: Invoice creation workflow in Accounting service
```

### Workflow 2: Dispatch (Maria's Daily Workflow)

Maria starts her day at 6:00 AM. She has 50+ loads to manage today.

```
1. Review Dashboard (2 minutes)
   ├── Check KPIs: How many loads need attention today?
   ├── Check "Needs Attention" count (red badge)
   ├── Scan Alerts & Exceptions list for overnight issues
   └── Screen: Operations Dashboard

2. Open Dispatch Board (her primary workspace)
   ├── See all loads organized by status columns
   ├── Focus on "Unassigned" column first
   ├── Sort by pickup date (soonest first)
   └── Screen: Dispatch Board

3. For each unassigned load:
   a. Review load details (origin, destination, equipment, dates)
   b. Check carrier availability (search by lane, equipment, rate)
   c. Compare carrier rates vs customer rate (margin calculator)
   d. Select carrier, negotiate rate if needed
   e. Send tender (email/call/portal)
   f. Wait for acceptance (or move to next load while waiting)
   g. On acceptance: generate rate confirmation, send for signature
   h. On signature: mark as DISPATCHED
   └── Screens: Dispatch Board, Load Detail, Carrier Search (modal)

4. Monitor in-transit loads (ongoing throughout day)
   ├── Check tracking map for position updates
   ├── Review check call timeline (any loads missing check calls?)
   ├── Handle exceptions (late pickups, detention, breakdowns)
   ├── Update ETAs and notify customers if delayed
   └── Screens: Tracking Map, Load Detail, Check Call Log

5. Confirm deliveries (throughout day as they come in)
   ├── Receive POD from driver
   ├── Upload POD document
   ├── Mark load as DELIVERED
   ├── Update order status if all loads delivered
   └── Screens: Load Detail, Stop Management, Documents
```

### Workflow 3: Exception Handling

Exceptions are where money is lost or saved. The UI must surface exceptions prominently and provide quick resolution paths.

```
Exception Types:
├── LATE_PICKUP: Driver did not arrive within appointment window
│   ├── Alert: Load detail header turns amber
│   ├── Action: Contact carrier, update ETA, notify customer
│   └── Resolution: Update arrival time or reassign carrier
│
├── LATE_DELIVERY: Load will not meet delivery appointment
│   ├── Alert: Load detail header turns amber/red
│   ├── Action: Notify customer, negotiate new delivery window
│   └── Resolution: Update delivery appointment
│
├── MISSING_CHECK_CALL: No check call in 4+ hours
│   ├── Alert: Red badge on load in dispatch board + dashboard alert
│   ├── Action: Call carrier/driver for status update
│   └── Resolution: Log check call manually
│
├── DETENTION: Driver waiting at facility beyond free time
│   ├── Alert: Clock icon with elapsed time on stop card
│   ├── Action: Document detention time, prepare accessorial charge
│   └── Resolution: Log detention hours, add accessorial to load
│
├── BREAKDOWN: Vehicle mechanical failure
│   ├── Alert: Red alert on load detail, tracking map marker changes to warning
│   ├── Action: Arrange recovery or replacement vehicle
│   └── Resolution: Update ETA, possibly reassign load
│
├── CARGO_DAMAGE: Freight damaged during transit
│   ├── Alert: Red alert with claim initiation prompt
│   ├── Action: Document damage, photos, initiate claim
│   └── Resolution: File claim in Claims service
│
└── REFUSED_DELIVERY: Consignee refuses freight
    ├── Alert: Red alert requiring immediate dispatcher attention
    ├── Action: Contact customer, arrange return or alternate delivery
    └── Resolution: New delivery instructions or return to shipper
```

---

## 6. Real-Time Requirements Summary

TMS Core has the highest real-time requirements of any service in Ultra TMS. Stale data causes double-booking, missed check calls, and incorrect ETAs.

| Screen | Real-Time Level | WebSocket Namespaces | Key Events | Polling Fallback |
|--------|----------------|---------------------|------------|-----------------|
| Operations Dashboard | Enhanced Real-Time | `/dispatch`, `/tracking` | `load:status:changed`, `load:created`, `order:created`, `order:status:changed` | 30s |
| Orders List | Enhanced Real-Time | `/dispatch` | `order:created`, `order:status:changed` | 30s |
| Order Detail | Enhanced Real-Time | `/dispatch` | `order:status:changed`, `order:updated`, `load:status:changed`, `load:created` | 30s |
| Loads List | Enhanced Real-Time | `/dispatch` | `load:created`, `load:status:changed` | 30s |
| Load Detail | Enhanced Real-Time | `/dispatch`, `/tracking` | `load:status:changed`, `load:assigned`, `load:location:updated`, `load:eta:updated`, `checkcall:received`, `stop:arrived`, `stop:departed` | 30s |
| Dispatch Board | **Critical Real-Time** | `/dispatch` | `load:created`, `load:status:changed`, `load:dispatched`, `load:assigned`, `load:updated` | 10s |
| Tracking Map | **Critical Real-Time** | `/tracking` | `load:location:updated`, `load:eta:updated`, `checkcall:received`, `stop:arrived`, `stop:departed` | 15s |
| Check Call Log | Enhanced Real-Time | `/tracking` | `checkcall:received` | 30s |
| Stop Management | Enhanced Real-Time | `/tracking` | `stop:arrived`, `stop:departed`, `load:eta:updated` | 30s |
| New/Edit Order Forms | Static | None | None | None |
| New/Edit Load Forms | Static | None | None | None |
| Rate Confirmation | Static | None | None | None |

---

## 7. Component Requirements Summary

### New Components Needed for TMS Core

| Component | Used On | Complexity | Description |
|-----------|---------|------------|-------------|
| `OrderSummaryCard` | Order Detail (sidebar) | Medium | Displays customer info, dates, rate, margin, equipment in a compact card |
| `LoadCard` | Dispatch Board | High | Draggable card showing load summary (route, dates, status, carrier, rate). Must support drag-and-drop. |
| `StopTimeline` | Order Detail, Load Detail | Medium | Vertical timeline showing pickup/delivery stops with status badges, times, and connecting lines |
| `RouteDisplay` | Order Detail, Load Detail, Dispatch Board | Medium | "Origin -> Destination" with city/state formatting, distance, and optional mini-map |
| `MarginIndicator` | Load Detail, Dispatch Board, Order Detail | Small | Color-coded margin display (green >15%, yellow 5-15%, red <5%) with dollar and percentage values |
| `CheckCallEntry` | Check Call Log, Load Detail | Small | Single check call entry with timestamp, location, type badge, notes, and user avatar |
| `KPICard` | Operations Dashboard | Medium | Card with value, label, trend arrow (up/down), sparkline mini chart, and click-to-drill-down |
| `AlertItem` | Operations Dashboard | Small | Single alert/exception item with severity icon, message, timestamp, and action link |
| `DispatchColumn` | Dispatch Board | High | Kanban column with header count, drag-drop zone, and load card list |
| `CarrierSearchModal` | Load Detail, Dispatch Board | High | Modal for searching/filtering carriers by lane, equipment, rate, compliance, scorecard |
| `RateConfirmationPreview` | Rate Confirmation screen | High | Document preview with carrier/load details, terms, and signature area |
| `ExceptionBanner` | Load Detail, Order Detail | Small | Colored banner at top of detail pages showing active exceptions with action buttons |
| `ActivityFeed` | Operations Dashboard, Order Detail, Load Detail | Medium | Scrollable feed of recent activities with timestamp, user, action, and entity links |
| `MiniDispatchBoard` | Operations Dashboard | Medium | Compact version of dispatch board showing only "needs attention" loads |

### Existing Components to Enhance

| Component | Enhancement Needed | Affected Screens |
|-----------|-------------------|------------------|
| `DataTable` | Add bulk selection with select-all, row hover preview (tooltip), right-click context menu, column visibility toggle, saved filter presets, inline status update | Orders List, Loads List |
| `FilterBar` | Add date range picker, multi-select dropdowns, searchable customer/carrier select, "More Filters" expandable section, saved presets with naming | Orders List, Loads List, Dispatch Board |
| `StatusBadge` | Add click-to-advance behavior (shows available transitions in dropdown), add pulse animation for recently-changed statuses | All detail and list screens |
| `PageHeader` | Add support for secondary info line (subtitle/description), quick action buttons alongside title | All TMS Core screens |
| `Timeline` | Add support for different entry types (status change, note, document, check call) with distinct icons and layouts | Order Detail, Load Detail |

### shadcn/ui Components to Install (if not already present)

| Component | shadcn Name | Usage in TMS Core |
|-----------|-------------|-------------------|
| Date Range Picker | `calendar` + `popover` | Filter bars on Orders List, Loads List; date fields on all forms |
| Command Menu | `command` | Global search for orders/loads by number |
| Dropdown Menu | `dropdown-menu` | Row actions, bulk actions, status transition menus |
| Sheet (Side Panel) | `sheet` | Quick-edit panels, carrier search, load preview |
| Tabs | `tabs` | Order Detail tabs (Overview, Stops, Loads, Documents, Timeline, Notes) |
| Accordion | `accordion` | "More Filters" expandable section, form sections |
| Tooltip | `tooltip` | Row hover preview, field explanations, abbreviated text |
| Alert Dialog | `alert-dialog` | Confirmation modals for cancel, delete, status change |
| Separator | `separator` | Visual dividers in detail pages and forms |
| Skeleton | `skeleton` | Loading states for all data-driven screens |

---

## 8. Business Rules That Affect UI

These rules must be enforced in the UI layer (in addition to API-level enforcement) to provide immediate user feedback and prevent invalid actions.

### Order Rules

| # | Rule | UI Impact |
|---|------|-----------|
| 1 | Order number is auto-generated (`ORD-YYYYMMDD-XXXX`) | Number field is read-only on create form; display in monospace font |
| 2 | Minimum 1 pickup stop + 1 delivery stop required | "Create Order" button disabled until at least one pickup and one delivery stop are added; validation error shown if attempted |
| 3 | Cannot delete an order that has loads | Delete button hidden or disabled with tooltip "Cannot delete: order has X associated loads" |
| 4 | Cannot delete an order that has invoices | Delete button hidden or disabled with tooltip "Cannot delete: order has X associated invoices" |
| 5 | Hot loads (priority = URGENT) require manager approval | Show amber "Requires Approval" banner; route to Ops Manager for confirmation; dispatcher cannot self-approve |
| 6 | Customer credit must be APPROVED before BOOKED status | Block status transition with message "Customer credit is [status]. Cannot book order." |
| 7 | Cannot cancel an order in DELIVERED or later status | Cancel button removed from action menu for post-delivery statuses |
| 8 | Order total = sum of all line items + accessorials | Total field is calculated and read-only; updates live as line items change |
| 9 | Pickup date must be before delivery date | Date picker validation prevents selecting invalid date combinations |
| 10 | Reference numbers must be unique within tenant | Inline validation on reference number fields with duplicate check |

### Load Rules

| # | Rule | UI Impact |
|---|------|-----------|
| 1 | Load number is auto-generated (`LOAD-YYYYMMDD-XXXX`) | Number field is read-only on create form; display in monospace font |
| 2 | Carrier must have ACTIVE status and COMPLIANT compliance | Carrier selector filters out non-compliant carriers; if selected via search, show red warning "Carrier is not compliant" |
| 3 | Rate confirmation must be signed before pickup status | Block "Picked Up" status transition with message "Rate confirmation not yet signed" |
| 4 | Cannot change carrier after PICKED_UP status | Carrier field becomes read-only once load reaches PICKED_UP; "Change Carrier" button removed |
| 5 | Check calls required every 4 hours while IN_TRANSIT | Show amber/red warning on loads missing check calls; timer display on load card showing "Last check call: X hours ago" |
| 6 | GPS updates expected every 30 minutes while in motion | Show "GPS stale" indicator if no update in 30+ minutes; tracking map marker changes to gray/faded |
| 7 | Carrier rate cannot exceed customer rate (negative margin) | Margin indicator turns red; warning dialog "This rate results in a negative margin of -X%. Proceed?" with manager approval required |
| 8 | Cannot dispatch without at least one stop of each type | Same as order: minimum 1 pickup + 1 delivery stop |
| 9 | Load must be linked to an order | Order field required on load create form; cannot save without order association |
| 10 | Temperature range required for REEFER equipment | Show temperature min/max fields only when equipment type = REEFER; make them required |
| 11 | Hazmat loads require special documentation flag | Show hazmat indicator (warning icon), require hazmat details section when flagged |
| 12 | Weight must not exceed equipment capacity | Show warning when weight exceeds standard capacity for selected equipment type |

### Stop Rules

| # | Rule | UI Impact |
|---|------|-----------|
| 1 | First stop must be type PICKUP, last must be type DELIVERY | Enforce in stop reordering; prevent drag that would violate this rule |
| 2 | Appointment date/time required for all stops | Required fields on stop form; cannot save without appointment window |
| 3 | Stops must be in chronological order | Validate that appointment times are sequential; show warning if out of order |
| 4 | Arrival time cannot be before previous stop departure | Validation on arrival time entry |
| 5 | Departure time cannot be before arrival time | Validation on departure time entry |

---

## 9. Persona-Specific Behaviors

### Maria -- Dispatcher (Primary Power User)

**Profile:** 28 years old, 4 years dispatching experience, manages 50+ loads per day, keyboard-shortcut power user, has 3 monitors, works 6 AM - 4 PM.

**UI Priorities:**
- Speed above all else. Every click costs her 1 second x 50 loads = nearly a minute per day per unnecessary click.
- Dispatch Board is her home screen. She lives in it 70% of her day.
- Keyboard shortcuts are essential. She should be able to dispatch a load without touching the mouse.
- Bulk operations save her time. Select 5 loads, assign to same carrier, done.
- Alerts must be prominent but not blocking. She needs to know about exceptions without being interrupted mid-dispatch.

**Dashboard view:** Personal metrics (her loads dispatched today, her on-time %, her exceptions). Activity feed shows only her loads.

**What she does NOT need to see:** Financial reports, customer credit details, carrier onboarding status, invoice data.

**Frustration triggers:** Slow load times, too many confirmation dialogs, having to navigate through multiple screens to do a simple status update, losing filter state when navigating back.

### Sarah -- Operations Manager (Oversight + Escalation)

**Profile:** 38 years old, 12 years in freight, manages team of 12 dispatchers, works 7 AM - 5 PM, focuses on metrics, exceptions, and team performance.

**UI Priorities:**
- Team-wide metrics on dashboard (not just personal). She needs to see all 12 dispatchers' performance.
- Exception management is critical. She handles escalations the dispatchers cannot resolve.
- Hot load approval workflow. She must be able to approve urgent loads quickly.
- Reporting and export capabilities. She pulls data for weekly management meetings.
- Carrier rate approval for loads with thin margins or negative margin.

**Dashboard view:** Team metrics (total loads dispatched, team on-time %, team exceptions). Activity feed shows all team activity. "Needs Attention" shows loads across all dispatchers.

**What she ADDITIONALLY needs to see vs Maria:** Margin data, carrier performance trends, dispatcher utilization, financial summaries.

**Frustration triggers:** Not knowing about a problem until a customer calls, inability to see which dispatcher has capacity, having to ask for reports instead of pulling them herself.

---

## 10. API Endpoint Summary

All 65 API endpoints grouped by entity. Backend is 100% complete and tested.

### Orders API (18 endpoints)

| # | Method | Path | Purpose |
|---|--------|------|---------|
| 1 | GET | `/api/v1/orders` | List orders with pagination, filtering, sorting |
| 2 | GET | `/api/v1/orders/:id` | Get single order with all relationships |
| 3 | POST | `/api/v1/orders` | Create new order |
| 4 | PUT | `/api/v1/orders/:id` | Update order (full) |
| 5 | PATCH | `/api/v1/orders/:id` | Partial update order |
| 6 | DELETE | `/api/v1/orders/:id` | Delete order (soft delete) |
| 7 | PATCH | `/api/v1/orders/:id/status` | Update order status (state machine validated) |
| 8 | POST | `/api/v1/orders/:id/clone` | Clone order with date adjustment |
| 9 | GET | `/api/v1/orders/:id/loads` | Get all loads for an order |
| 10 | GET | `/api/v1/orders/:id/documents` | Get all documents for an order |
| 11 | GET | `/api/v1/orders/:id/timeline` | Get activity timeline for an order |
| 12 | POST | `/api/v1/orders/:id/notes` | Add note to order |
| 13 | GET | `/api/v1/orders/:id/notes` | Get all notes for an order |
| 14 | GET | `/api/v1/orders/stats` | Get order statistics (counts by status, totals) |
| 15 | POST | `/api/v1/orders/bulk-status` | Bulk update status for multiple orders |
| 16 | POST | `/api/v1/orders/export` | Export orders to CSV/Excel |
| 17 | GET | `/api/v1/orders/:id/audit` | Get audit trail for an order |
| 18 | POST | `/api/v1/orders/from-quote/:quoteId` | Create order from quote (pre-fill) |

### Loads API (22 endpoints)

| # | Method | Path | Purpose |
|---|--------|------|---------|
| 1 | GET | `/api/v1/loads` | List loads with pagination, filtering, sorting |
| 2 | GET | `/api/v1/loads/:id` | Get single load with all relationships |
| 3 | POST | `/api/v1/loads` | Create new load |
| 4 | PUT | `/api/v1/loads/:id` | Update load (full) |
| 5 | PATCH | `/api/v1/loads/:id` | Partial update load |
| 6 | DELETE | `/api/v1/loads/:id` | Delete load (soft delete) |
| 7 | PATCH | `/api/v1/loads/:id/status` | Update load status (state machine validated) |
| 8 | POST | `/api/v1/loads/:id/assign` | Assign carrier to load |
| 9 | POST | `/api/v1/loads/:id/tender` | Tender load to carrier |
| 10 | POST | `/api/v1/loads/:id/accept` | Accept carrier tender response |
| 11 | POST | `/api/v1/loads/:id/reject` | Reject carrier tender response |
| 12 | POST | `/api/v1/loads/:id/dispatch` | Mark load as dispatched |
| 13 | GET | `/api/v1/loads/:id/stops` | Get all stops for a load |
| 14 | GET | `/api/v1/loads/:id/checkcalls` | Get all check calls for a load |
| 15 | GET | `/api/v1/loads/:id/documents` | Get all documents for a load |
| 16 | GET | `/api/v1/loads/:id/timeline` | Get activity timeline for a load |
| 17 | POST | `/api/v1/loads/:id/notes` | Add note to load |
| 18 | GET | `/api/v1/loads/:id/notes` | Get all notes for a load |
| 19 | GET | `/api/v1/loads/stats` | Get load statistics (counts by status, totals) |
| 20 | GET | `/api/v1/loads/:id/rate-confirmation` | Get/generate rate confirmation document |
| 21 | POST | `/api/v1/loads/export` | Export loads to CSV/Excel |
| 22 | GET | `/api/v1/loads/:id/audit` | Get audit trail for a load |

### Stops API (10 endpoints)

| # | Method | Path | Purpose |
|---|--------|------|---------|
| 1 | GET | `/api/v1/stops` | List stops (usually filtered by loadId) |
| 2 | GET | `/api/v1/stops/:id` | Get single stop detail |
| 3 | POST | `/api/v1/stops` | Create new stop on a load |
| 4 | PUT | `/api/v1/stops/:id` | Update stop |
| 5 | DELETE | `/api/v1/stops/:id` | Delete stop from load |
| 6 | PATCH | `/api/v1/stops/:id/status` | Update stop status |
| 7 | PATCH | `/api/v1/stops/:id/arrive` | Mark stop as arrived (with timestamp) |
| 8 | PATCH | `/api/v1/stops/:id/depart` | Mark stop as departed (with timestamp) |
| 9 | POST | `/api/v1/stops/reorder` | Reorder stops within a load |
| 10 | GET | `/api/v1/stops/:id/detention` | Get detention time calculation for a stop |

### Check Calls API (8 endpoints)

| # | Method | Path | Purpose |
|---|--------|------|---------|
| 1 | GET | `/api/v1/checkcalls` | List check calls (filtered by loadId) |
| 2 | GET | `/api/v1/checkcalls/:id` | Get single check call detail |
| 3 | POST | `/api/v1/checkcalls` | Create new check call |
| 4 | PUT | `/api/v1/checkcalls/:id` | Update check call |
| 5 | DELETE | `/api/v1/checkcalls/:id` | Delete check call |
| 6 | GET | `/api/v1/checkcalls/overdue` | Get loads with overdue check calls (>4 hours) |
| 7 | POST | `/api/v1/checkcalls/bulk` | Create multiple check calls at once |
| 8 | GET | `/api/v1/checkcalls/stats` | Get check call statistics |

### Dashboard / Aggregate API (7 endpoints)

| # | Method | Path | Purpose |
|---|--------|------|---------|
| 1 | GET | `/api/v1/operations/dashboard` | Get dashboard KPI data (role-aware) |
| 2 | GET | `/api/v1/operations/dashboard/charts` | Get chart data (loads by status, revenue trend) |
| 3 | GET | `/api/v1/operations/dashboard/alerts` | Get active alerts and exceptions |
| 4 | GET | `/api/v1/operations/dashboard/activity` | Get recent activity feed |
| 5 | GET | `/api/v1/operations/dashboard/needs-attention` | Get loads needing immediate attention |
| 6 | GET | `/api/v1/operations/tracking/positions` | Get current GPS positions for all in-transit loads |
| 7 | GET | `/api/v1/operations/tracking/positions/:loadId` | Get GPS position history for a specific load |

---

## 11. Data Volume & Performance Considerations

### Expected Data Volumes (Mid-Size Brokerage)

| Entity | Records per Day | Records per Month | Records per Year | Total Active (at any time) |
|--------|----------------|-------------------|------------------|---------------------------|
| Orders | 50-200 | 1,500-6,000 | 18,000-72,000 | 200-500 (non-completed) |
| Loads | 50-250 | 1,500-7,500 | 18,000-90,000 | 300-600 (non-completed) |
| Stops | 150-750 | 4,500-22,500 | 54,000-270,000 | 600-1,800 (active loads x 3 avg stops) |
| Check Calls | 200-1,000 | 6,000-30,000 | 72,000-360,000 | Last 24 hours = 200-1,000 |

### Performance Targets

| Screen | Max Load Time (First Contentful Paint) | Max Load Time (Data Populated) | Max Interaction Response |
|--------|---------------------------------------|-------------------------------|-------------------------|
| Operations Dashboard | 500ms | 1.5s | 100ms |
| Orders List (50 rows) | 500ms | 1.0s | 100ms |
| Order Detail | 500ms | 1.0s | 100ms |
| Loads List (50 rows) | 500ms | 1.0s | 100ms |
| Load Detail | 500ms | 1.2s | 100ms |
| Dispatch Board | 500ms | 2.0s | 150ms (drag-drop) |
| Tracking Map | 500ms | 2.5s | 200ms (pan/zoom) |

### Pagination Strategy

All list screens default to **25 rows per page** with options for 10, 25, 50, 100. Cursor-based pagination is used on the API for consistent performance regardless of offset depth. The UI shows page numbers (1, 2, 3...) calculated from cursor positions.

### Caching Strategy

| Data | Cache Duration | Invalidation |
|------|---------------|--------------|
| Order list | 30 seconds | WebSocket event or manual refresh |
| Order detail | 60 seconds | WebSocket event or navigation |
| Load list | 30 seconds | WebSocket event or manual refresh |
| Load detail | 60 seconds | WebSocket event or navigation |
| Dashboard KPIs | 60 seconds | WebSocket event or auto-refresh |
| Carrier directory (for selectors) | 5 minutes | Manual refresh on carrier search |
| Customer directory (for selectors) | 5 minutes | Manual refresh on customer search |
| Enum values (equipment types, etc.) | 1 hour | App-level cache |

---

## 12. Build Sequence Recommendation

Based on dependency analysis, complexity, and the need to deliver value incrementally.

### Phase 1: Foundation (Week 1-2)

Build the screens that establish the data viewing layer. Users can see data but cannot yet create or modify it extensively.

| Priority | Screen | Rationale |
|----------|--------|-----------|
| 1 | Orders List | Establishes the list pattern, filter bar, data table. Foundation for all other lists. |
| 2 | Order Detail | Establishes the detail page pattern, tabs, sidebar. Foundation for load detail. |
| 3 | Loads List | Reuses list pattern from orders. Adds load-specific filters and columns. |
| 4 | Load Detail | Reuses detail pattern from orders. Adds carrier info, check calls, tracking. |

### Phase 2: Creation & Editing (Week 3-4)

Build the forms that allow users to create and modify data. This is where TMS Core becomes operational.

| Priority | Screen | Rationale |
|----------|--------|-----------|
| 5 | New Order Form | Users can create orders. Multi-step form with stop builder. |
| 6 | Edit Order Form | Users can modify existing orders. Reuses create form structure. |
| 7 | New Load Form | Users can create loads from orders. Pre-fill from order data. |
| 8 | Edit Load Form | Users can modify loads. Carrier assignment section. |

### Phase 3: Operations Power Tools (Week 5-6)

Build the screens that make dispatchers productive. These are complex, interactive, and real-time.

| Priority | Screen | Rationale |
|----------|--------|-----------|
| 9 | Dispatch Board | The heart of dispatch operations. Kanban, drag-drop, real-time. |
| 10 | Tracking Map | Live map visualization. Requires map integration. |
| 11 | Stop Management | Inline editing of stops on a load. |
| 12 | Check Call Log | Timeline view of check calls with add-new form. |

### Phase 4: Dashboard & Documents (Week 7)

Build the dashboard (now that there is data to display) and the rate confirmation document.

| Priority | Screen | Rationale |
|----------|--------|-----------|
| 13 | Operations Dashboard | Aggregates data from all other screens into KPIs and charts. |
| 14 | Rate Confirmation | Document generation/preview. Lower priority but needed for dispatch workflow. |

---

*End of TMS Core Service Overview. This document should be used as the master reference when building each of the 14 screen design documents.*
