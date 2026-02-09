# Screen Priority Matrix

> Every screen in Ultra TMS prioritized into P0/P1/P2/P3 with scoring criteria, recommended build order, sprint allocation, and dependency chains.

---

## Prioritization Criteria

Each screen is scored on five dimensions (1-5 scale each, max 25 points):

| Criterion | Weight | 1 (Low) | 3 (Medium) | 5 (High) |
|-----------|--------|---------|------------|----------|
| **Daily Broker Usage** | 5x | Used monthly or less | Used weekly | Used hourly by dispatchers |
| **Revenue Dependency** | 4x | No direct revenue impact | Supports revenue workflow | Blocks revenue generation |
| **Data Dependency** | 3x | Standalone, no data chain | Consumes data from other screens | Creates data other screens need |
| **Build Complexity** | 2x (inverse) | 60+ hours (Board/Map) | 20-40 hours (List/Detail) | Under 20 hours (Config/Settings) |
| **Foundation Dependency** | 1x | Needs Wave 4+ components | Needs Wave 2-3 components | Uses only existing components |

**Priority Tiers:**

| Priority | Score Range | Definition | Expected Sprint |
|----------|-----------|-----------|----------------|
| **P0 - Critical** | 85-125 | Must build first. Without these, the TMS cannot function. Dispatchers cannot do daily work. | Sprint 1-3 |
| **P1 - Important** | 60-84 | Must build soon. Required for complete operational workflows. Operations blocked without them. | Sprint 4-6 |
| **P2 - Valuable** | 40-59 | Should build. Enables secondary workflows, reporting, or management features. | Sprint 7-10 |
| **P3 - Nice-to-Have** | Under 40 | Build when resources allow. Advanced features, portals, or admin-only tools. | Sprint 11+ |

---

## P0 -- Critical Path Screens (Build First)

These screens form the minimum viable TMS. Without them, a broker cannot take an order, assign a carrier, track a load, or invoice a customer.

| Rank | Screen | Service | Type | Score | Daily Usage | Revenue | Data | Complexity | Foundation | Status |
|------|--------|---------|------|-------|------------|---------|------|-----------|-----------|--------|
| 1 | **Operations Dashboard** | 04-TMS Core | Dashboard | 115 | 5 (hourly) | 4 (supports) | 5 (creates context) | 3 (25-40h) | 5 (mostly exists) | Not Started |
| 2 | **Dispatch Board** | 04-TMS Core | Board | 113 | 5 (hourly, 80% of shift) | 5 (blocks dispatch) | 5 (creates assignments) | 1 (60-90h) | 2 (many new components) | Not Started |
| 3 | **Order Entry** | 04-TMS Core | Form | 110 | 5 (hourly) | 5 (creates orders) | 5 (feeds all TMS) | 2 (30-50h) | 3 (needs wizard) | Not Started |
| 4 | **Orders List** | 04-TMS Core | List | 108 | 5 (hourly) | 4 (supports) | 4 (consumes/displays) | 4 (20-30h) | 4 (DataGrid needed) | Not Started |
| 5 | **Loads List** | 04-TMS Core | List | 106 | 5 (hourly) | 4 (supports) | 4 (consumes/displays) | 4 (20-30h) | 4 (DataGrid needed) | Not Started |
| 6 | **Load Detail** | 04-TMS Core | Detail | 105 | 5 (hourly) | 4 (supports actions) | 5 (creates events) | 2 (30-50h) | 3 (many new comps) | Not Started |
| 7 | **Quote Builder** | 03-Sales | Form | 100 | 4 (multiple/day) | 5 (generates revenue) | 5 (creates quotes/orders) | 2 (30-50h) | 3 (needs rate calc) | Not Started |
| 8 | **Tracking Map** | 04-TMS Core | Map | 98 | 5 (10-15x/day) | 3 (supports) | 3 (consumes GPS) | 1 (40-60h) | 2 (needs map system) | Not Started |
| 9 | **Check Calls** | 04-TMS Core | List+Form | 95 | 5 (every 2-4 hours) | 3 (compliance) | 4 (creates history) | 3 (20-30h) | 4 (simpler form) | Not Started |
| 10 | **Load Builder** | 04-TMS Core | Form | 93 | 4 (multiple/day) | 4 (creates loads) | 5 (feeds dispatch) | 3 (30-40h) | 3 (needs selectors) | Not Started |

**P0 Total: 10 screens, ~350-550 hours estimated**

---

## P1 -- Important Screens (Build Next)

These complete the operational workflows started by P0 screens. Operations can function without them but with significant manual workarounds.

| Rank | Screen | Service | Type | Score | Daily Usage | Revenue | Data | Complexity | Foundation | Status |
|------|--------|---------|------|-------|------------|---------|------|-----------|-----------|--------|
| 11 | **Order Detail** | 04-TMS Core | Detail | 82 | 4 (multiple/day) | 3 (review) | 4 (links to loads) | 3 (30-40h) | 4 (uses existing) | Not Started |
| 12 | **Quotes List** | 03-Sales | List | 80 | 4 (daily) | 4 (tracks pipeline) | 3 (consumes) | 4 (20-30h) | 4 (DataGrid) | Not Started |
| 13 | **Quote Detail** | 03-Sales | Detail | 78 | 4 (daily) | 4 (review/send) | 3 (consumes) | 4 (20-30h) | 4 (Panel, Desc) | Not Started |
| 14 | **Stop Management** | 04-TMS Core | List | 76 | 4 (multiple/day) | 3 (ops) | 4 (links stops) | 3 (20-30h) | 4 (StopList exists) | Not Started |
| 15 | **Status Updates** | 04-TMS Core | List | 74 | 4 (multiple/day) | 3 (compliance) | 4 (creates events) | 4 (15-25h) | 5 (simpler) | Not Started |
| 16 | **Load Timeline** | 04-TMS Core | Detail | 72 | 3 (daily) | 2 (audit) | 3 (read-only) | 4 (15-25h) | 5 (LoadTimeline comp) | Not Started |
| 17 | **Appointment Scheduler** | 04-TMS Core | Calendar | 70 | 3 (daily) | 3 (prevents issues) | 4 (creates appts) | 3 (25-35h) | 3 (Calendar, DatePicker) | Not Started |
| 18 | **Sales Dashboard** | 03-Sales | Dashboard | 68 | 3 (daily) | 4 (tracks revenue) | 3 (consumes) | 3 (25-35h) | 4 (KPICard, Chart) | Not Started |
| 19 | **Carrier Detail** | 05-Carrier | Detail | 66 | 3 (daily) | 3 (supports) | 4 (reference data) | 3 (30-40h) | 3 (Panel, Desc) | Not Started |
| 20 | **CRM Dashboard** | 02-CRM | Dashboard | 65 | 3 (daily) | 3 (supports) | 3 (aggregates) | 3 (25-35h) | 4 (KPICard, Chart) | Not Started |
| 21 | **Carrier Dashboard** | 05-Carrier | Dashboard | 64 | 3 (daily) | 3 (carrier mgmt) | 3 (aggregates) | 3 (25-35h) | 4 (KPICard, Chart) | Not Started |
| 22 | **Carrier Onboarding** | 05-Carrier | Wizard | 62 | 2 (weekly) | 4 (enables carriers) | 5 (creates carrier) | 2 (30-40h) | 3 (Stepper needed) | Not Started |
| 23 | **Rate Tables** | 03-Sales | List | 61 | 2 (weekly) | 5 (pricing base) | 5 (feeds Quote Builder) | 3 (20-30h) | 4 (DataGrid) | Not Started |
| 24 | **Rate Table Editor** | 03-Sales | Form | 60 | 2 (weekly) | 5 (pricing base) | 5 (creates rates) | 3 (25-35h) | 3 (CurrencyInput) | Not Started |

**P1 Total: 14 screens, ~340-480 hours estimated**

---

## P2 -- Valuable Screens (Build in Middle Waves)

These enable reporting, compliance, team management, and secondary workflows. The TMS operates without them but lacks completeness.

| Rank | Screen | Service | Type | Score | Status |
|------|--------|---------|------|-------|--------|
| 25 | Sidebar Navigation (enhanced) | 01.1-Shell | Portal | 58 | Not Started |
| 26 | Header Bar (enhanced) | 01.1-Shell | Portal | 57 | Not Started |
| 27 | Opportunities List | 02-CRM | List | 55 | Not Started |
| 28 | Opportunity Detail | 02-CRM | Detail | 54 | Not Started |
| 29 | Lane Pricing | 03-Sales | List | 53 | Not Started |
| 30 | Accessorial Charges | 03-Sales | List | 52 | Not Started |
| 31 | Compliance Center | 05-Carrier | Dashboard | 51 | Not Started |
| 32 | Insurance Tracking | 05-Carrier | List | 50 | Not Started |
| 33 | Equipment List | 05-Carrier | List | 49 | Not Started |
| 34 | Carrier Scorecard | 05-Carrier | Report | 48 | Not Started |
| 35 | Lane Preferences | 05-Carrier | List | 47 | Not Started |
| 36 | Carrier Contacts | 05-Carrier | List | 46 | Not Started |
| 37 | FMCSA Lookup | 05-Carrier | Board | 45 | Not Started |
| 38 | Activities Calendar | 02-CRM | Calendar | 44 | Not Started |
| 39 | Territory Management | 02-CRM | Config | 43 | Not Started |
| 40 | Lead Import Wizard | 02-CRM | Wizard | 42 | Not Started |
| 41 | Notification Center | 01.1-Shell | List | 41 | Not Started |
| 42 | Command Palette | 01.1-Shell | Search | 40 | Not Started |
| 43 | Sales Reports | 03-Sales | Report | 40 | Not Started |
| 44 | Proposal Templates | 03-Sales | List | 40 | Not Started |
| 45 | Accounting Dashboard | 06-Accounting | Dashboard | 40 | Not Started |

**P2 Total: 21 screens**

---

## P3 -- Nice-to-Have Screens (Build When Resources Allow)

All remaining screens across Services 06-38 fall into P3. They are listed by service with aggregate counts.

| Service | Screen Count | Types | Priority Notes |
|---------|-------------|-------|---------------|
| 06 - Accounting | 14 (minus dashboard) | List, Form, Report, Board | P3-high: Invoices, Payables needed for revenue cycle |
| 07 - Load Board Internal | 4 | Board, Form, Config | P3-high: Extends dispatch capability |
| 08 - Commission | 6 | Dashboard, List, Form | P3-mid: Revenue tracking |
| 09 - Claims | 10 | Dashboard, List, Detail, Form, Report | P3-mid: Exception handling |
| 10 - Documents | 8 | List, Detail, Form, Board, Report | P3-mid: Document management |
| 11 - Communication | 10 | Dashboard, List, Form | P3-mid: Messaging |
| 12 - Customer Portal | 10 | Dashboard, List, Detail, Form, Map | P3-high: Customer self-service |
| 13 - Carrier Portal | 12 | Dashboard, List, Detail, Form | P3-high: Carrier self-service |
| 14 - Contracts | 8 | Dashboard, List, Detail, Form, Report | P3-mid |
| 15 - Agent | 8 | Dashboard, List, Detail, Wizard, Report | P3-low |
| 16 - Credit | 10 | Dashboard, List, Form, Report | P3-mid |
| 17 - Factoring Internal | 6 | Dashboard, List, Detail, Form, Config, Report | P3-low |
| 18 - HR | 10 | Dashboard, List, Detail, Wizard, Calendar, Report, Board | P3-low |
| 19 - Analytics | 10 | Dashboard, List, Report, Board | P3-mid |
| 20 - Workflow | 8 | Dashboard, List, Board, Form | P3-low |
| 21 - Integration Hub | 10 | Dashboard, List, Wizard, Detail, Form | P3-low |
| 22 - Search | 4 | Search, List, Config | P3-mid (global search is valuable) |
| 23 - Audit | 6 | Dashboard, List, Report, Board | P3-low |
| 24 - Config | 8 | Dashboard, Form, List | P3-low |
| 25 - Scheduler | 6 | Dashboard, List, Form, Config | P3-low |
| 26 - Cache | 4 | Dashboard, List, Report, Board | P3-low (super admin) |
| 27 - Help Desk | 6 | Dashboard, List, Detail, Form, Search | P3-low |
| 28 - Feedback | 6 | Dashboard, List, Form, Report | P3-low |
| 29 - EDI | 8 | Dashboard, List, Detail, Wizard, Form | P3-low |
| 30 - Safety | 10 | Dashboard, List, Detail, Report | P3-mid |
| 31 - Fuel Cards | 8 | Dashboard, List, Form, Config, Report | P3-low |
| 32 - Factoring External | 8 | Dashboard, List, Detail, Config, Report | P3-low |
| 33 - Load Board External | 8 | Dashboard, List, Form, Board, Config | P3-mid |
| 34 - Mobile App | 8 | Dashboard, List, Map, Config, Form | P3-low |
| 35 - Rate Intelligence | 8 | Dashboard, Board, Report, List, Form, Config | P3-mid |
| 36 - ELD | 8 | Dashboard, List, Detail, Map, Config | P3-mid |
| 37 - Cross-Border | 10 | Dashboard, List, Detail, Form, Board | P3-low |
| 38 - Super Admin | 28 | Dashboard, List, Detail, Wizard, Form, Report, Board, Config | P3-low (platform) |

**P3 Total: ~280 screens**

---

## Recommended Build Order (Sprint Allocation)

### Sprint 1-2: Component Foundation (Weeks 1-4)
**Focus:** Build all Phase 0 + Phase 1 + Phase 2 components from the Component Build Order document.
**Screens delivered:** 0 (component building only)
**Why:** Every P0 screen needs these components. Building screens before components exist creates throwaway scaffolding code.

### Sprint 3: First P0 Screens (Weeks 5-6)
**Build these screens:**
1. **Orders List** (04-02) -- 20-30h -- First end-to-end List page, validates DataGrid component
2. **Loads List** (04-05) -- 20-30h -- Second List page, reuses DataGrid, validates LoadStatusBadge
3. **Operations Dashboard** (04-01) -- 25-40h -- First Dashboard page, validates KPICard and Chart components

**Why this order:** List pages are simplest and validate the most-reused component (DataGrid). The dashboard validates KPICard and Chart. Building these first catches component bugs before they propagate to more complex screens.

### Sprint 4: Core Forms (Weeks 7-8)
**Build these screens:**
4. **Order Entry** (04-04) -- 30-50h -- Most complex form, validates Stepper, CustomerSelector, StopList
5. **Load Builder** (04-07) -- 30-40h -- Second form, reuses selectors from Order Entry
6. **Check Calls** (04-13) -- 20-30h -- Simpler List+Form, validates CheckCallLog component

**Why this order:** Order Entry is the most complex form but its components are needed by Load Builder. Check Calls is simpler and provides a quick win between the two complex forms.

### Sprint 5: Detail Pages (Weeks 9-10)
**Build these screens:**
7. **Load Detail** (04-06) -- 30-50h -- Most information-dense page, validates Panel, DescriptionList, tabs
8. **Order Detail** (04-03) -- 30-40h -- Second detail page, reuses patterns from Load Detail
9. **Stop Management** (04-09) -- 20-30h -- StopList already built, simpler assembly

**Why this order:** Load Detail is the most complex detail page but establishes the 3-column pattern reused by all other detail pages.

### Sprint 6: Complex Screens (Weeks 11-13)
**Build these screens:**
10. **Dispatch Board** (04-08) -- 60-90h -- Most complex screen overall, validates KanbanBoard
11. **Tracking Map** (04-10) -- 40-60h -- Second most complex, validates TrackingMapContainer

**Why this order:** These are the two most complex screens and should be built last within P0 because they depend on the most components and benefit from all the patterns established in Sprints 3-5.

### Sprint 7: Sales & Remaining TMS (Weeks 14-15)
**Build these screens:**
12. **Quote Builder** (03-04) -- 30-50h -- Validates RateCalculator, biggest Sales screen
13. **Quotes List** (03-02) -- 20-30h -- DataGrid reuse, simple after previous lists
14. **Quote Detail** (03-03) -- 20-30h -- Panel/DescriptionList reuse
15. **Status Updates** (04-11) -- 15-25h -- Simple list with LoadStatusBadge
16. **Load Timeline** (04-12) -- 15-25h -- LoadTimeline component already built
17. **Appointment Scheduler** (04-14) -- 25-35h -- Calendar + DatePicker

### Sprint 8: P1 Carrier & CRM (Weeks 16-18)
**Build these screens:**
18. **Sales Dashboard** (03-01) -- 25-35h -- KPICard + Chart reuse
19. **Carrier Detail** (05-03) -- 30-40h -- Panel/DescriptionList pattern
20. **Carrier Dashboard** (05-01) -- 25-35h -- Dashboard pattern reuse
21. **Carrier Onboarding** (05-04) -- 30-40h -- Stepper + form pattern
22. **CRM Dashboard** (02-01) -- 25-35h -- Dashboard pattern reuse
23. **Rate Tables + Editor** (03-05, 03-06) -- 40-60h -- DataGrid + CurrencyInput

### Sprint 9-10: P2 Screens (Weeks 19-24)
**Build remaining P2 screens** in the order listed in the P2 table above.

### Sprint 11+: P3 Screens (Weeks 25+)
**Build P3 screens** by sub-priority (P3-high before P3-mid before P3-low), starting with:
1. Accounting screens (revenue cycle completion)
2. Customer Portal (customer self-service)
3. Carrier Portal (carrier self-service)
4. Load Board Internal (dispatch enhancement)

---

## Dependency Chains

### Chain 1: Order-to-Load Flow (Most Critical)
```
Order Entry (P0 #3) --> Order Detail (P1 #11) --> Load Builder (P0 #10) --> Loads List (P0 #5) --> Load Detail (P0 #6)
```
All screens in this chain must be built before the core TMS workflow functions. Order Entry creates the data that flows through the entire chain.

### Chain 2: Dispatch Flow
```
Operations Dashboard (P0 #1) --> Dispatch Board (P0 #2) --> Tracking Map (P0 #8) --> Check Calls (P0 #9)
```
The dispatch flow is the daily operational loop. Operations Dashboard surfaces issues, Dispatch Board enables action, Tracking Map monitors progress, Check Calls maintain visibility.

### Chain 3: Sales Flow
```
Quote Builder (P0 #7) --> Quotes List (P1 #12) --> Quote Detail (P1 #13) --> Order Entry (P0 #3)
```
The sales flow generates revenue. Quote Builder creates quotes, which are tracked in Quotes List, reviewed in Quote Detail, and converted to orders in Order Entry.

### Chain 4: Carrier Management Flow
```
Carrier Dashboard (P1 #21) --> Carriers List (Built) --> Carrier Detail (P1 #19) --> Carrier Onboarding (P1 #22)
```
This chain manages the carrier pool. Carriers List already exists (built). The other screens add dashboard, detail, and onboarding capabilities.

### Chain 5: Financial Flow (P3-high)
```
Customer Invoice --> Invoices List --> Payments Received --> Carrier Settlement --> Payments Made
```
This chain completes the revenue cycle from billing customers to paying carriers. Currently all P3 but should be elevated once P0/P1 screens are complete.

---

## Screen Count Summary

| Priority | Unbuilt Screens | Built Screens | Total | % of Total |
|----------|----------------|---------------|-------|-----------|
| **P0** | 10 | 0 | 10 | 3% |
| **P1** | 14 | 0 | 14 | 4% |
| **P2** | 21 | 0 | 21 | 6% |
| **P3** | ~280 | 0 | ~280 | 77% |
| **Already Built** | -- | 48 | 48 | 13% |
| **Total** | ~325 | 48 | ~362+ | 100% |

**Key insight:** Building just the 10 P0 screens (3% of total) gives the platform a functional TMS. Building P0 + P1 (24 screens, 7% of total) gives a complete operational and sales platform. The remaining 93% of screens add depth, reporting, portals, and advanced features.

---

## Velocity Assumptions

| Team Size | P0 Completion | P0+P1 Completion | Full Platform |
|-----------|--------------|------------------|--------------|
| 1 developer | 16-20 weeks | 28-36 weeks | 3-4 years |
| 2 developers | 10-13 weeks | 18-24 weeks | 18-24 months |
| 3 developers | 7-9 weeks | 13-17 weeks | 12-18 months |
| 5 developers | 5-6 weeks | 9-12 weeks | 8-12 months |

These estimates include component building time (Sprints 1-2) and assume 70% development efficiency (30% for code review, testing, bug fixes, meetings).
