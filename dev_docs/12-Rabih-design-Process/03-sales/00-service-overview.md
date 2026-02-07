# Sales Service -- Service Overview

> **Service:** Sales (Service 03) | **Category:** Core Service | **Wave:** 1 | **Priority:** P0 -- Revenue Generation
> **Total Screens:** 10 | **API Endpoints:** 48 | **Backend Status:** 85% Complete | **Frontend Status:** ~15% (Partial)
> **Primary Entities:** Quotes (32 fields), Rate Tables (18 fields), Accessorials (12 fields), Proposal Templates (14 fields)
> **Primary Personas:** James Wilson (Sales Agent), Sales Managers
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

The Sales service is the revenue engine of Ultra TMS. It encompasses the entire sales lifecycle from initial quote creation through rate negotiation, proposal delivery, and quote-to-order conversion. Every dollar of revenue that enters the platform originates here -- either through a formal quote process or through rate tables that inform pricing across the organization.

Sales is the bridge between the CRM (which manages customer relationships and contact history) and TMS Core (which executes the actual freight movements). When a sales agent creates a quote and the customer accepts it, that quote converts into an order in TMS Core with a single click. This seamless handoff eliminates the re-entry of data that plagues manual brokerage operations and reduces order entry errors by ensuring the operations team receives clean, validated data.

**Why this is Wave 1 and P0:** Without the Sales service, the platform has no mechanism for pricing freight, generating quotes, or converting customer interest into actionable orders. Sales agents currently rely on spreadsheets, emails, and phone calls to quote freight -- a process that takes 15-20 minutes per quote and introduces pricing errors on 8-12% of quotes. The Sales service targets under 60 seconds for a standard quote ("Quick Quote") and under 3 minutes for complex multi-stop quotes, with zero pricing errors through automated rate calculation and minimum margin enforcement.

**Business impact:** A mid-size brokerage with 5 sales agents creating 30 quotes/day each (150 total) at an average conversion rate of 35% generates approximately 52 orders/day from quotes. If the Sales service reduces quote time from 15 minutes to 1 minute, that saves 35 hours of sales agent time per day across the team. If margin enforcement prevents even one under-priced load per week ($500 average margin loss), that is $26,000/year recovered per brokerage.

**Rate Calculation Engine:**
The rate calculation system is the most algorithmically complex component of the Sales service. It combines multiple data sources to produce accurate, competitive rates:

- **Distance-based pricing:** Calculates linehaul rate from origin to destination using mileage bands and per-mile rates from rate tables
- **Weight and commodity factors:** Adjusts pricing based on commodity class, weight tiers, and density
- **Accessorial charges:** Adds flat-rate, per-mile, per-hundredweight, or percentage-based surcharges for extra services (detention, liftgate, inside delivery, etc.)
- **Fuel surcharge:** Automatically calculates fuel surcharge based on DOE weekly diesel index or customer-specific FSC schedules
- **Market rate integration:** Pulls real-time market rates from DAT and Truckstop.com to provide competitive benchmarking (low, average, high rates for the lane)
- **Customer-specific rules:** Applies contract rates, volume discounts, and customer-level pricing agreements stored in the customer's CRM profile
- **Minimum margin enforcement:** Prevents quotes below configurable margin thresholds (global default, per-customer, per-lane), requiring manager override for exceptions

---

## 2. Screen Inventory

All 10 screens in the Sales service, listed in recommended build order.

| # | Screen Name | File | Route | Type | Status | Primary Personas | Complexity |
|---|------------|------|-------|------|--------|-----------------|------------|
| 1 | Sales Dashboard | `01-sales-dashboard.md` | `/sales` | Dashboard | In Progress | James (Sales Agent), Sales Manager | High |
| 2 | Quotes List | `02-quotes-list.md` | `/sales/quotes` | List | In Progress | James, Sales Manager | High |
| 3 | Quote Detail | `03-quote-detail.md` | `/sales/quotes/:id` | Detail | Not Started | James, Sales Manager | High |
| 4 | Quote Builder | `04-quote-builder.md` | `/sales/quotes/new` | Form (Create/Edit) | Not Started | James, Sales Manager | Very High |
| 5 | Rate Tables | `05-rate-tables.md` | `/sales/rate-tables` | List | Not Started | Sales Manager, Admin | Medium |
| 6 | Rate Table Editor | `06-rate-table-editor.md` | `/sales/rate-tables/:id/edit` | Form (Edit) | Not Started | Sales Manager, Admin | High |
| 7 | Lane Pricing | `07-lane-pricing.md` | `/sales/lane-pricing` | List | Not Started | James, Sales Manager | High |
| 8 | Accessorial Charges | `08-accessorial-charges.md` | `/sales/accessorials` | List | Not Started | Sales Manager, Admin | Medium |
| 9 | Proposal Templates | `09-proposal-templates.md` | `/sales/templates` | List | Not Started | James, Sales Manager | Medium |
| 10 | Sales Reports | `10-sales-reports.md` | `/sales/reports` | Report | Not Started | Sales Manager, Admin | High |

### Screen Type Breakdown

| Type | Count | Screens |
|------|-------|---------|
| Dashboard | 1 | Sales Dashboard |
| List | 5 | Quotes List, Rate Tables, Lane Pricing, Accessorial Charges, Proposal Templates |
| Detail | 1 | Quote Detail |
| Form (Create/Edit) | 2 | Quote Builder, Rate Table Editor |
| Report | 1 | Sales Reports |

---

## 3. Status Machines

### Quote Status Machine

```
                                  ┌───────────┐
                                  │  EXPIRED   │
                                  └───────────┘
                                       ▲
                              auto-expire after
                              validity period
                                       │
┌─────────┐    ┌────────┐    ┌────────┐    ┌────────┐    ┌───────────┐
│  DRAFT   │───>│  SENT   │───>│ VIEWED │───>│ACCEPTED│───>│ CONVERTED │
└─────────┘    └────────┘    └────────┘    └────────┘    └───────────┘
     │              │              │              │
     │              │              │              └──> (creates Order in TMS Core)
     │              │              │
     │              │              └───────> ┌──────────┐
     │              │                        │ REJECTED │
     │              └───────────────────────>└──────────┘
     │                                            ▲
     └──────────────────> can be deleted          │
                          (DRAFT only)       customer declines
```

**Auto-generated number format:** `QT-YYYYMMDD-XXXX` (e.g., QT-20260206-0042)

**Key transitions and rules:**
- DRAFT -> SENT: All required fields populated, rate validated, margin above minimum threshold (or override granted)
- SENT -> VIEWED: Customer opens quote email or views in portal (auto-tracked via pixel/link)
- VIEWED -> ACCEPTED: Customer accepts via portal, email link, or verbal confirmation logged by agent
- VIEWED -> REJECTED: Customer declines; reason captured
- SENT -> REJECTED: Customer rejects without viewing detail
- SENT -> EXPIRED: Validity period elapses (default 7 days, configurable per customer)
- VIEWED -> EXPIRED: Same auto-expire logic
- ACCEPTED -> CONVERTED: Agent clicks "Convert to Order"; creates TMS Core order pre-filled from quote
- DRAFT -> deleted: Only drafts can be hard-deleted; all other statuses are soft-delete only
- Any non-terminal status -> new version: Agent can create a revised version (parent_quote_id links versions)

### Quote Version Flow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ QT-001 v1    │───>│ QT-001 v2    │───>│ QT-001 v3    │
│ (EXPIRED)    │    │ (REJECTED)   │    │ (ACCEPTED)   │
└──────────────┘    └──────────────┘    └──────────────┘
                                              │
                                              v
                                        ┌───────────┐
                                        │ CONVERTED │
                                        └───────────┘
```

When a new version is created, the previous version's status is preserved but the quote becomes "superseded." Only the latest version can be actively worked.

---

## 4. Key Dependencies

### Upstream Dependencies (Services That Feed Into Sales)

| Service | Wave | What Sales Needs | Integration Point | Status |
|---------|------|------------------|--------------------|--------|
| **Auth & Admin (01)** | 1 | Authenticated user context, role/permissions, tenant ID | Every API call includes auth token; role determines rate visibility, approval authority | Built |
| **CRM (02)** | 1 | Customer data (name, address, contacts, credit status, payment terms, contract rates, lane history) | Customer selector in quote builder; customer-specific pricing rules; contact for quote delivery | Built |

### Downstream Dependencies (Services That Consume Sales Data)

| Service | Wave | What It Needs From Sales | Integration Point |
|---------|------|-----------------------------|-------------------|
| **TMS Core (04)** | 2 | Quote data for order conversion; rate history for margin calculation | ACCEPTED quotes convert to orders; rate tables inform carrier cost estimation |
| **Accounting (06)** | 3 | Quote-to-invoice lineage; rate breakdown for billing | Invoice references original quote number and rate structure |
| **Analytics (18)** | 3 | Quote data for win/loss analysis, conversion metrics, revenue forecasting | Read-only queries against quotes, rate tables |
| **Customer Portal (12)** | 3 | Quote viewing and acceptance by customers | Customer-scoped access to their quotes |
| **Commission (08)** | 2 | Quote acceptance triggers commission calculation | Commission calculated from quote margin and sales agent assignment |

### External Service Dependencies

| Service | Purpose | Integration Type |
|---------|---------|-----------------|
| **DAT RateView** | Market rate data (low, avg, high) for lane pricing | REST API, cached 1 hour |
| **Truckstop.com Rate Insight** | Alternative market rate source | REST API, cached 1 hour |
| **DOE Diesel Index** | Fuel surcharge calculation base | Weekly data feed, cached 7 days |
| **Google Maps Distance Matrix** | Mileage calculation for distance-based pricing | REST API, cached 24 hours per lane |
| **SendGrid / Email Provider** | Quote delivery via email | REST API, event webhooks for tracking |

### Shared UI Dependencies

| Component / Pattern | Source | Usage in Sales |
|--------------------|---------|--------------------|
| StatusBadge | `src/components/ui/status-badge.tsx` | Quote status badges (7 states) |
| DataTable | `src/components/ui/data-table.tsx` | Quotes list, Rate tables list, Lane pricing list, Accessorials list, Templates list |
| PageHeader | `src/components/layout/page-header.tsx` | All 10 screens |
| FilterBar | `src/components/ui/filter-bar.tsx` | Quotes list, Lane pricing list, Rate tables list |
| StatsCard | `src/components/ui/stats-card.tsx` | Sales dashboard (6 cards), Quotes list (4 cards) |
| SearchableSelect | `src/components/ui/searchable-select.tsx` | Customer selector in quote builder, contact selector |
| CurrencyInput | `src/components/ui/currency-input.tsx` | Rate entry fields throughout Sales |

---

## 5. Critical Workflows

### Workflow 1: Quick Quote (Under 60 Seconds)

This is the flagship workflow. A sales agent on the phone with a customer should be able to produce a competitive, margin-safe quote before the customer finishes describing their shipment.

```
1. Agent Opens Quick Quote (5 seconds)
   ├── Source: Sidebar "New Quote" button, Quotes List "+ New Quote", keyboard shortcut Ctrl+Q
   ├── UI: Quote Builder opens in "Quick Quote" mode (simplified single-page view)
   └── Pre-populated: Today's date, agent's name, default validity period

2. Select Customer (10 seconds)
   ├── Type first 2-3 letters of customer name
   ├── Searchable select shows recent customers first, then search results
   ├── Customer-specific pricing rules auto-load in background
   └── If new customer: "Create New" option opens minimal CRM entry modal

3. Enter Lane (15 seconds)
   ├── Origin: City/state autocomplete (e.g., "Chi" -> "Chicago, IL")
   ├── Destination: City/state autocomplete (e.g., "Dal" -> "Dallas, TX")
   ├── System auto-calculates: distance, transit time
   └── Market rates load in background (DAT/Truckstop)

4. Select Equipment & Enter Details (10 seconds)
   ├── Equipment type: Quick-select buttons (Dry Van is default)
   ├── Weight: numeric input (optional for quick quote)
   ├── Pickup date: date picker (defaults to tomorrow)
   └── Commodity: autocomplete from customer history

5. Review Rate (15 seconds)
   ├── System calculates: linehaul rate (from rate table or market avg)
   ├── Fuel surcharge auto-calculated from DOE index
   ├── Total rate displayed prominently with margin indicator
   ├── Market rate comparison bar: shows where quote falls vs low/avg/high
   ├── Agent can adjust rate manually; margin updates live
   └── If below minimum margin: amber warning, requires override

6. Send Quote (5 seconds)
   ├── "Send Quote" button
   ├── Select delivery method: Email, Portal, Both
   ├── Select contact (defaults to primary)
   ├── Preview email (optional)
   └── Quote status changes to SENT, confirmation toast
```

### Workflow 2: Complex Multi-Stop Quote

```
1. Agent Opens Quote Builder (full mode)
   ├── Selects "Full Quote" tab instead of "Quick Quote"
   ├── Multi-step process with more fields and options
   └── Used for multi-stop, LTL, special equipment, complex accessorials

2. Customer & Contact Selection
   ├── Same customer search as quick quote
   ├── Select specific contact for this quote
   ├── Apply customer contract rates if available
   └── Check customer credit status (warning if on hold)

3. Shipment Details (multi-stop)
   ├── Add multiple stops (pickup, delivery, intermediate)
   ├── Each stop: address, appointment window, contact, reference
   ├── Drag to reorder stops
   ├── Route map updates in real-time
   └── Distance and transit time recalculate on each change

4. Rate Calculation (detailed)
   ├── Linehaul rate from rate table (per-mile or flat)
   ├── Add accessorial charges from configured list
   ├── Fuel surcharge calculation
   ├── Apply customer-specific discounts
   ├── Show detailed rate breakdown
   ├── Market rate comparison for each leg
   └── Margin analysis with customer and lane minimums

5. Proposal Generation
   ├── Select proposal template
   ├── Add cover letter / notes
   ├── Attach supporting documents
   ├── Preview full proposal PDF
   └── Send or save as draft

6. Follow-up & Conversion
   ├── Track quote views (email open, portal access)
   ├── Set follow-up reminders
   ├── Create revised version if customer negotiates
   ├── On acceptance: one-click convert to TMS Core order
   └── Order pre-filled with all quote data (zero re-entry)
```

### Workflow 3: Rate Table Management

```
1. Admin/Manager opens Rate Tables list
   ├── View all rate tables with status (Active, Draft, Expired)
   ├── Filter by customer, lane, equipment type, date range
   └── See last-modified date and usage count

2. Create or Edit Rate Table
   ├── Define scope: customer-specific, equipment-specific, or global
   ├── Set effective dates (valid from / valid to)
   ├── Enter rate entries: origin zone, destination zone, per-mile rate, minimum charge
   ├── Import rates from CSV/Excel
   ├── Copy from existing rate table
   └── Validate: no overlapping rates, no gaps in coverage

3. Activate Rate Table
   ├── Review rate table summary
   ├── Check for conflicts with existing active tables
   ├── Activate (auto-deactivates conflicting tables)
   └── Rates immediately available for quote calculation
```

---

## 6. Real-Time Requirements Summary

Sales has moderate real-time requirements. Quote status changes and market rate updates are the primary real-time events.

| Screen | Real-Time Level | WebSocket Namespaces | Key Events | Polling Fallback |
|--------|----------------|---------------------|------------|-----------------|
| Sales Dashboard | Enhanced Real-Time | `/sales` | `quote:created`, `quote:status:changed`, `quote:accepted`, `quote:converted` | 30s |
| Quotes List | Enhanced Real-Time | `/sales` | `quote:created`, `quote:status:changed`, `quote:viewed` | 30s |
| Quote Detail | Enhanced Real-Time | `/sales` | `quote:status:changed`, `quote:viewed`, `quote:version:created` | 30s |
| Quote Builder | Moderate | `/sales`, `/rates` | `rate:market:updated` (for live market rate refresh) | 60s |
| Rate Tables | Static | None | None | None |
| Rate Table Editor | Static | None | None | None |
| Lane Pricing | Moderate | `/rates` | `rate:market:updated` | 60s |
| Accessorial Charges | Static | None | None | None |
| Proposal Templates | Static | None | None | None |
| Sales Reports | Static | None | None (reports generated on-demand) | None |

---

## 7. Component Requirements Summary

### New Components Needed for Sales

| Component | Used On | Complexity | Description |
|-----------|---------|------------|-------------|
| `QuoteCard` | Quotes List, Sales Dashboard | Medium | Compact card showing quote summary (customer, lane, rate, status, date). Used in card/grid view mode. |
| `RateCalculator` | Quote Builder | High | Real-time rate calculation panel showing linehaul, fuel, accessorials, total, margin. Updates live as inputs change. |
| `MarketRateBar` | Quote Builder, Lane Pricing, Quote Detail | Medium | Horizontal bar showing market rate range (low/avg/high) with a marker for the current quote rate position. |
| `MarginIndicator` | Quote Builder, Quotes List, Quote Detail, Sales Dashboard | Small | Color-coded margin display (green >15%, yellow 5-15%, red <5%) with dollar and percentage values. |
| `QuoteTimeline` | Quote Detail | Medium | Vertical timeline showing quote lifecycle: created, sent, viewed (with timestamp), accepted/rejected, converted. |
| `LaneDisplay` | Quote Builder, Quotes List, Quote Detail, Lane Pricing | Small | "Origin -> Destination" with city/state formatting, distance, and optional mini-map. |
| `AccessorialRow` | Quote Builder, Accessorial Charges | Small | Repeatable row: type dropdown + rate type (flat/per-mile/per-cwt/percentage) + amount + notes + delete. |
| `QuoteVersionSwitcher` | Quote Detail | Small | Dropdown or tab bar showing all versions of a quote with version number, date, and status. |
| `RateTableGrid` | Rate Table Editor | High | Editable spreadsheet-like grid for entering rate table entries (origin zone x destination zone matrix). |
| `ProposalPreview` | Quote Builder, Proposal Templates | High | Full PDF preview of the quote proposal with customer branding, rate breakdown, terms, and signature area. |
| `ConversionButton` | Quote Detail | Small | "Convert to Order" button with confirmation dialog showing what will be created in TMS Core. |
| `QuotePipelineKanban` | Sales Dashboard | High | Kanban board showing quotes grouped by status columns (Draft, Sent, Viewed, Accepted) with drag-drop. |
| `WinLossChart` | Sales Reports, Sales Dashboard | Medium | Chart showing win rate over time, with drill-down by agent, customer, lane, equipment type. |
| `RevenueChart` | Sales Reports, Sales Dashboard | Medium | Stacked area or bar chart showing quoted revenue, accepted revenue, converted revenue over time. |

### Existing Components to Enhance

| Component | Enhancement Needed | Affected Screens |
|-----------|-------------------|------------------|
| `DataTable` | Add inline status update for quotes (click badge to advance), expandable row preview showing rate breakdown | Quotes List, Rate Tables, Lane Pricing |
| `FilterBar` | Add "My Quotes" / "Team Quotes" toggle, saved filter presets for sales pipeline views | Quotes List |
| `StatusBadge` | Add quote-specific status colors and pulse animation for recently-viewed quotes | All list and detail screens |
| `SearchableSelect` | Add recent customers section, customer credit indicator, contract rate indicator | Quote Builder |
| `StatsCard` | Add trend sparkline, click-to-filter integration (click card to filter list) | Sales Dashboard |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage in Sales |
|-----------|-------------|-------------------|
| Date Range Picker | `calendar` + `popover` | Filter bars, quote validity dates |
| Command Menu | `command` | Global quote search by number/customer |
| Dropdown Menu | `dropdown-menu` | Row actions, bulk actions, quote actions |
| Sheet (Side Panel) | `sheet` | Quick quote preview, rate breakdown side panel |
| Tabs | `tabs` | Quote Builder (Quick Quote / Full Quote), Quote Detail tabs |
| Tooltip | `tooltip` | Rate calculation explanations, margin warnings |
| Alert Dialog | `alert-dialog` | Confirmation for send, convert, delete actions |
| Progress | `progress` | Quote pipeline progress bars |
| Separator | `separator` | Rate breakdown sections |
| Skeleton | `skeleton` | Loading states for all data-driven screens |

---

## 8. Business Rules That Affect UI

### Quote Rules

| # | Rule | UI Impact |
|---|------|-----------|
| 1 | Quote number is auto-generated (`QT-YYYYMMDD-XXXX`) | Number field is read-only on create; display in monospace font |
| 2 | Minimum margin enforcement: global default 12%, configurable per customer and per lane | Rate input shows amber warning when margin drops below threshold; red warning for negative margin; "Override" requires manager approval |
| 3 | Quote validity period default is 7 days, configurable per customer (1-30 days) | Expiry date auto-calculated from send date; countdown shown on sent quotes ("Expires in 3 days") |
| 4 | Only DRAFT quotes can be deleted | Delete button hidden for non-draft quotes; "Archive" available instead |
| 5 | Only the latest version of a quote can be sent or accepted | Previous versions show "Superseded" badge; send/accept buttons disabled |
| 6 | Customer must have ACTIVE status to receive quotes | Warning banner if customer is INACTIVE or ON_HOLD; can still save as draft |
| 7 | Rate source must be tracked (MANUAL, CONTRACT, MARKET, CALCULATED) | Tag shown next to rate indicating source; audit trail for rate changes |
| 8 | Fuel surcharge auto-calculated from DOE index unless manually overridden | Toggle: Auto/Manual; auto-calculated value shown as suggestion even when manual |
| 9 | Accessorial charges must use configured rates (admin-defined) | Accessorial type dropdown only shows configured types; amounts pre-filled from config |
| 10 | Quote-to-order conversion requires ACCEPTED status | "Convert to Order" button only visible on ACCEPTED quotes |
| 11 | Converted quotes cannot be modified | All edit actions disabled on CONVERTED quotes; banner: "This quote has been converted to Order ORD-XXXX" |
| 12 | Sales agents can only see their own quotes unless they have team_view permission | Filter defaults to "My Quotes"; team view requires explicit permission |

### Rate Table Rules

| # | Rule | UI Impact |
|---|------|-----------|
| 1 | Rate tables have effective date ranges; only one table per scope can be active at a time | Calendar visualization showing active periods; conflict warning on overlapping dates |
| 2 | Rate table changes require manager approval | Edit form shows "Submit for Approval" instead of "Save" for non-managers |
| 3 | Rates cannot be negative | Input validation prevents negative values |
| 4 | Minimum charge must be >= 0 | Validation on minimum charge field |
| 5 | Rate tables can be customer-specific, equipment-specific, or global | Scope selector on rate table editor; applied priority: customer > equipment > global |

---

## 9. Persona-Specific Behaviors

### James Wilson -- Sales Agent (Primary User)

**Profile:** 32 years old, 5 years in freight sales, manages 40-60 accounts, creates 20-30 quotes per day, works 7 AM - 5 PM, often on the phone while quoting.

**UI Priorities:**
- Speed is everything. The Quick Quote flow must be achievable in under 60 seconds while on the phone with a customer.
- Quote history per customer is critical. James needs to see what he quoted this customer last time for this lane.
- Market rate comparison gives him confidence. He needs to know if his quote is competitive without opening a separate tool.
- Pipeline visibility helps him prioritize follow-ups. He needs to see which quotes have been viewed (signal of interest) and which are expiring soon.
- One-click conversion from accepted quote to order eliminates context switching.

**Dashboard view:** Personal metrics (his quotes this month, his conversion rate, his pipeline value, his top expiring quotes). Activity feed shows his quotes only.

**What he does NOT need to see:** Rate table management (read-only access at most), system configuration, carrier data, financial reports beyond his own pipeline.

**Frustration triggers:** Slow rate calculation, having to re-enter data that exists elsewhere, losing a quote in progress, not knowing when a customer viewed the quote, complex approval workflows for routine quotes.

### Sales Manager (Oversight + Rate Management)

**Profile:** 42 years old, 15 years in freight, manages team of 6 sales agents, responsible for pricing strategy, rate table maintenance, and team quota achievement.

**UI Priorities:**
- Team-wide metrics on dashboard (all agents' performance, team conversion rate, total pipeline value).
- Rate table management is a primary responsibility. Needs to create, update, and approve rate tables efficiently.
- Margin oversight: must be able to see all quotes below minimum margin and approve or reject overrides.
- Win/loss analysis helps adjust pricing strategy. Needs to understand why quotes are being rejected.
- Pipeline management across the team: which agents have the most open quotes, which customers are most active.

**Dashboard view:** Team metrics (total quotes, team conversion rate, team pipeline, margin distribution). "Needs Attention" shows quotes requiring approval and expiring high-value quotes.

**What they ADDITIONALLY need to see vs James:** Rate table management, margin override requests, team performance comparison, pricing analytics, win/loss reports by lane/customer/equipment.

**Frustration triggers:** Not knowing about under-priced quotes until after they are sent, inability to see team pipeline at a glance, having to manually calculate market competitiveness.

---

## 10. API Endpoint Summary

All API endpoints grouped by entity. Backend is approximately 85% complete.

### Quotes API (22 endpoints)

| # | Method | Path | Purpose |
|---|--------|------|---------|
| 1 | GET | `/api/v1/quotes` | List quotes with pagination, filtering, sorting |
| 2 | GET | `/api/v1/quotes/:id` | Get single quote with all relationships |
| 3 | POST | `/api/v1/quotes` | Create new quote |
| 4 | PUT | `/api/v1/quotes/:id` | Update quote (full) |
| 5 | PATCH | `/api/v1/quotes/:id` | Partial update quote |
| 6 | DELETE | `/api/v1/quotes/:id` | Delete quote (draft only, soft delete otherwise) |
| 7 | PATCH | `/api/v1/quotes/:id/status` | Update quote status (state machine validated) |
| 8 | POST | `/api/v1/quotes/:id/send` | Send quote to customer (email/portal) |
| 9 | POST | `/api/v1/quotes/:id/accept` | Mark quote as accepted |
| 10 | POST | `/api/v1/quotes/:id/reject` | Mark quote as rejected (with reason) |
| 11 | POST | `/api/v1/quotes/:id/convert` | Convert accepted quote to TMS Core order |
| 12 | POST | `/api/v1/quotes/:id/clone` | Clone quote (create new version or independent copy) |
| 13 | POST | `/api/v1/quotes/:id/version` | Create new version of existing quote |
| 14 | GET | `/api/v1/quotes/:id/versions` | Get all versions of a quote |
| 15 | GET | `/api/v1/quotes/:id/timeline` | Get activity timeline for a quote |
| 16 | POST | `/api/v1/quotes/:id/notes` | Add note to quote |
| 17 | GET | `/api/v1/quotes/:id/notes` | Get all notes for a quote |
| 18 | GET | `/api/v1/quotes/stats` | Get quote statistics (counts by status, pipeline value) |
| 19 | POST | `/api/v1/quotes/calculate-rate` | Calculate rate for given lane/equipment/weight parameters |
| 20 | GET | `/api/v1/quotes/market-rates` | Get market rates for a lane from DAT/Truckstop |
| 21 | POST | `/api/v1/quotes/export` | Export quotes to CSV/Excel |
| 22 | GET | `/api/v1/quotes/:id/proposal` | Generate/get proposal PDF |

### Rate Tables API (12 endpoints)

| # | Method | Path | Purpose |
|---|--------|------|---------|
| 1 | GET | `/api/v1/rate-tables` | List rate tables with filters |
| 2 | GET | `/api/v1/rate-tables/:id` | Get single rate table with all entries |
| 3 | POST | `/api/v1/rate-tables` | Create new rate table |
| 4 | PUT | `/api/v1/rate-tables/:id` | Update rate table |
| 5 | DELETE | `/api/v1/rate-tables/:id` | Delete rate table (soft delete) |
| 6 | PATCH | `/api/v1/rate-tables/:id/activate` | Activate rate table |
| 7 | PATCH | `/api/v1/rate-tables/:id/deactivate` | Deactivate rate table |
| 8 | POST | `/api/v1/rate-tables/:id/clone` | Clone rate table |
| 9 | POST | `/api/v1/rate-tables/:id/entries` | Add entry to rate table |
| 10 | PUT | `/api/v1/rate-tables/:id/entries/:entryId` | Update rate table entry |
| 11 | DELETE | `/api/v1/rate-tables/:id/entries/:entryId` | Delete rate table entry |
| 12 | POST | `/api/v1/rate-tables/:id/import` | Import entries from CSV/Excel |

### Accessorials API (6 endpoints)

| # | Method | Path | Purpose |
|---|--------|------|---------|
| 1 | GET | `/api/v1/accessorials` | List all accessorial charge types |
| 2 | GET | `/api/v1/accessorials/:id` | Get single accessorial detail |
| 3 | POST | `/api/v1/accessorials` | Create new accessorial type |
| 4 | PUT | `/api/v1/accessorials/:id` | Update accessorial |
| 5 | DELETE | `/api/v1/accessorials/:id` | Delete accessorial (soft delete) |
| 6 | PATCH | `/api/v1/accessorials/:id/toggle` | Enable/disable accessorial |

### Sales Dashboard / Aggregate API (8 endpoints)

| # | Method | Path | Purpose |
|---|--------|------|---------|
| 1 | GET | `/api/v1/sales/dashboard` | Get dashboard KPI data (role-aware: personal or team) |
| 2 | GET | `/api/v1/sales/dashboard/charts` | Get chart data (quotes by status, revenue trend, conversion funnel) |
| 3 | GET | `/api/v1/sales/dashboard/pipeline` | Get pipeline data (quotes grouped by status with values) |
| 4 | GET | `/api/v1/sales/dashboard/activity` | Get recent sales activity feed |
| 5 | GET | `/api/v1/sales/dashboard/expiring` | Get quotes expiring within configurable timeframe |
| 6 | GET | `/api/v1/sales/reports/win-loss` | Win/loss analysis data |
| 7 | GET | `/api/v1/sales/reports/revenue` | Revenue reports data |
| 8 | GET | `/api/v1/sales/reports/agent-performance` | Agent performance comparison data |

---

## 11. Data Volume & Performance Considerations

### Expected Data Volumes (Mid-Size Brokerage)

| Entity | Records per Day | Records per Month | Records per Year | Total Active (at any time) |
|--------|----------------|-------------------|------------------|---------------------------|
| Quotes | 50-150 | 1,500-4,500 | 18,000-54,000 | 200-600 (non-terminal statuses) |
| Quote Versions | 10-30 | 300-900 | 3,600-10,800 | Linked to parent quotes |
| Rate Tables | 0-2 | 5-15 | 60-180 | 10-30 active at any time |
| Rate Table Entries | 0-50 | 100-500 | 1,200-6,000 | Linked to rate tables |
| Accessorial Types | 0-1 | 1-5 | 12-60 | 15-30 configured types |
| Proposal Templates | 0-1 | 1-3 | 12-36 | 5-15 active templates |

### Performance Targets

| Screen | Max Load Time (First Contentful Paint) | Max Load Time (Data Populated) | Max Interaction Response |
|--------|---------------------------------------|-------------------------------|-------------------------|
| Sales Dashboard | 500ms | 1.5s | 100ms |
| Quotes List (50 rows) | 500ms | 1.0s | 100ms |
| Quote Detail | 500ms | 1.0s | 100ms |
| Quote Builder (Quick Quote) | 300ms | 800ms | 50ms (rate calculation) |
| Quote Builder (Full) | 500ms | 1.2s | 100ms |
| Rate Tables List | 500ms | 800ms | 100ms |
| Rate Table Editor | 500ms | 1.5s | 100ms (grid cell edit) |
| Lane Pricing | 500ms | 1.5s (market rates) | 100ms |
| Accessorial Charges | 500ms | 600ms | 100ms |
| Sales Reports | 500ms | 2.5s (report generation) | 200ms |

### Pagination Strategy

All list screens default to **25 rows per page** with options for 10, 25, 50, 100. Cursor-based pagination for Quotes List (high volume). Offset pagination acceptable for Rate Tables, Accessorials, Templates (low volume).

### Caching Strategy

| Data | Cache Duration | Invalidation |
|------|---------------|--------------|
| Quote list | 30 seconds | WebSocket event or manual refresh |
| Quote detail | 60 seconds | WebSocket event or navigation |
| Rate tables list | 5 minutes | Manual refresh |
| Rate table entries | 5 minutes | On save or navigation |
| Market rates (DAT/Truckstop) | 1 hour | Manual refresh in quote builder |
| Fuel surcharge (DOE index) | 7 days | Weekly update |
| Accessorial types | 10 minutes | On save |
| Customer data (for selectors) | 5 minutes | Manual refresh |
| Dashboard KPIs | 60 seconds | WebSocket event or auto-refresh |

---

## 12. Build Sequence Recommendation

Based on dependency analysis, complexity, and the need to deliver revenue-generating capability first.

### Phase 1: Core Quote Flow (Week 1-2)

Build the screens that allow sales agents to create and manage quotes. This is the minimum viable sales workflow.

| Priority | Screen | Rationale |
|----------|--------|-----------|
| 1 | Quotes List | Establishes the list pattern for Sales; agents need to see their quotes. |
| 2 | Quote Builder | The core revenue-generating screen. Quick Quote mode first, then Full mode. |
| 3 | Quote Detail | View quote with status tracking, version history, and conversion action. |

### Phase 2: Pricing Foundation (Week 3)

Build the pricing infrastructure that powers accurate rate calculation.

| Priority | Screen | Rationale |
|----------|--------|-----------|
| 4 | Rate Tables | View and manage pricing tables that feed the rate calculator. |
| 5 | Rate Table Editor | Create and edit rate table entries. Required for non-market-based pricing. |
| 6 | Accessorial Charges | Configure accessorial charge types and default rates. |

### Phase 3: Intelligence & Templates (Week 4)

Build the screens that make sales agents more effective and competitive.

| Priority | Screen | Rationale |
|----------|--------|-----------|
| 7 | Lane Pricing | Market rate comparison and lane-level pricing intelligence. |
| 8 | Proposal Templates | Branded quote documents that improve conversion rates. |

### Phase 4: Dashboard & Reports (Week 5)

Build the analytics layer now that there is data to analyze.

| Priority | Screen | Rationale |
|----------|--------|-----------|
| 9 | Sales Dashboard | Aggregates quote metrics, pipeline, and activity into a daily command center. |
| 10 | Sales Reports | Win/loss analysis, revenue reports, agent performance. Management tool. |

---

*End of Sales Service Overview. This document should be used as the master reference when building each of the 10 screen design documents.*
