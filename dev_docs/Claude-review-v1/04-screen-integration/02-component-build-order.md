# Component Build Order

> Dependency-ordered list of every component needed for the next 20 screens, grouped into buildable sprints.

---

## Overview

This document provides the exact build order for components needed to implement the next 20 priority screens (all 14 TMS Core screens + 6 highest-priority unbuilt screens from Waves 1 and 3). Components are ordered by dependency -- you cannot build a KanbanBoard until LoadCard exists, and you cannot build LoadCard until LoadStatusBadge exists. Building out of order creates rework.

**Source data:**
- Component gap analysis: `dev_docs/12-Rabih-design-Process/00-global/01-design-system-audit.md`
- Screen catalog: `dev_docs/12-Rabih-design-Process/00-global/00-master-screen-catalog.md`
- Individual screen specs: `dev_docs/12-Rabih-design-Process/04-tms-core/*.md`

**Current state:** 38 components complete, 17 partial, 56 missing, 10 not needed yet (121 total in design system).

---

## Phase 0: shadcn Installs (30 minutes)

These are existing shadcn registry components that need to be installed before any custom work begins. They are dependencies for multiple custom components.

```bash
cd apps/web && npx shadcn@latest add radio-group accordion breadcrumb resizable toggle toggle-group chart drawer input-otp
```

| # | Component | shadcn Name | Dependent Custom Components |
|---|-----------|-------------|---------------------------|
| 1 | RadioGroup | `radio-group` | Order Entry (equipment type, mode selection) |
| 2 | Accordion | `accordion` | Load Detail (collapsible sections), Order Entry (conditional sections) |
| 3 | Breadcrumb | `breadcrumb` | Every TMS Core page (navigation trail) |
| 4 | Resizable | `resizable` | Load Detail (3-column layout), Dispatch Board (lane widths) |
| 5 | Toggle / ToggleGroup | `toggle`, `toggle-group` | Dispatch Board (view switcher), Tracking Map (layer toggles) |
| 6 | Chart | `chart` | Operations Dashboard (6 charts), Sales Dashboard |
| 7 | Drawer | `drawer` | Mobile views (filter drawers, detail drawers) |
| 8 | InputOTP | `input-otp` | MFA improvement (existing auth flow) |

**After this step:** 8 additional shadcn primitives available.

---

## Phase 1: Foundation Components (Build First)

These components have zero internal dependencies on other new components. They are used across 10+ screens and must be built first.

### Sprint F1: Core Primitives (3-4 days, 7 components)

| # | Component | Location | Est. Hours | Used By (Screens) | Dependencies |
|---|-----------|----------|-----------|-------------------|-------------|
| 1 | **LoadStatusBadge** | `components/tms/load-status-badge.tsx` | 3h | Orders List, Loads List, Load Detail, Dispatch Board, Check Calls, Stop Mgmt, Load Timeline, Status Updates, Tracking Map | `badge.tsx` (exists), status-color-system.md |
| 2 | **KPICard** | `components/shared/kpi-card.tsx` | 4h | Operations Dashboard, Sales Dashboard, CRM Dashboard, Carrier Dashboard | `card.tsx` (exists) |
| 3 | **Statistic** | `components/shared/statistic.tsx` | 3h | Operations Dashboard, Load Detail, Carrier Detail, every Dashboard screen | None |
| 4 | **IconButton** | `components/ui/icon-button.tsx` | 2h | Every screen (toolbar actions, card actions, close buttons) | `button.tsx` (exists) |
| 5 | **Tag** | `components/ui/tag.tsx` | 2h | Order Entry (commodity tags), Load Detail (tags), Carrier Detail (service tags) | `badge.tsx` (exists) |
| 6 | **SearchInput** | `components/ui/search-input.tsx` | 4h | Every List screen, Dispatch Board, Tracking Map, Carrier Selector | `input.tsx` (exists), `command.tsx` (exists) |
| 7 | **Link** | `components/ui/link.tsx` | 2h | Every screen (styled next/link wrapper) | Next.js `Link` |

**Sprint total: ~20 hours (3-4 dev days)**

### Sprint F2: Form Primitives (3-4 days, 6 components)

| # | Component | Location | Est. Hours | Used By (Screens) | Dependencies |
|---|-----------|----------|-----------|-------------------|-------------|
| 8 | **DatePicker** | `components/ui/date-picker.tsx` | 6h | Order Entry, Quote Builder, Loads List filters, every date field | `calendar.tsx` (exists), `popover.tsx` (exists), `input.tsx` (exists) |
| 9 | **DateRangePicker** | `components/ui/date-range-picker.tsx` | 8h | Operations Dashboard, dispatch filters, Reports, every date range filter | `calendar.tsx` (exists), `popover.tsx` (exists), DatePicker (#8) |
| 10 | **TimePicker** | `components/ui/time-picker.tsx` | 4h | Order Entry (appointment windows), Appointment Scheduler, Check Calls (backdate) | `select.tsx` (exists) |
| 11 | **CurrencyInput** | `components/ui/currency-input.tsx` | 4h | Order Entry (rate), Quote Builder (rate), Load Detail (rate fields), Invoice Entry | `input.tsx` (exists) |
| 12 | **MultiSelect** | `components/ui/multi-select.tsx` | 6h | Dispatch Board filters, Loads List filters, every multi-value filter field | `command.tsx` (exists), `popover.tsx` (exists), `badge.tsx` (exists) |
| 13 | **CheckboxGroup** | `components/ui/checkbox-group.tsx` | 3h | Order Entry (accessorials), Carrier Onboarding (services), Settings | `checkbox.tsx` (exists) |

**Sprint total: ~31 hours (4-5 dev days)**

### Sprint F3: Layout & Navigation Primitives (2-3 days, 5 components)

| # | Component | Location | Est. Hours | Used By (Screens) | Dependencies |
|---|-----------|----------|-----------|-------------------|-------------|
| 14 | **Stepper** | `components/ui/stepper.tsx` | 6h | Order Entry (5-step wizard), Carrier Onboarding (wizard), Lead Import Wizard | None (standalone navigation) |
| 15 | **Panel** | `components/ui/panel.tsx` | 4h | Load Detail (sections), Order Detail, Carrier Detail, every detail screen | `card.tsx` (exists), `collapsible.tsx` (exists) |
| 16 | **DescriptionList** | `components/ui/description-list.tsx` | 3h | Load Detail, Order Detail, Carrier Detail, every detail screen summary | None |
| 17 | **Grid** | `components/ui/grid.tsx` | 3h | Operations Dashboard (KPI grid), every dashboard, responsive layouts | None (CSS grid wrapper) |
| 18 | **Banner** | `components/ui/banner.tsx` | 3h | Credit hold warnings, system messages, trial expiration, every warning scenario | `alert.tsx` (exists) |

**Sprint total: ~19 hours (2-3 dev days)**

---

## Phase 2: TMS Core Components (Build Second)

These components depend on Phase 1 primitives and are specific to the TMS/logistics domain. They are used across TMS Core screens (Service 04) and some Carrier screens (Service 05).

### Sprint T1: Data Display Components (4-5 days, 5 components)

| # | Component | Location | Est. Hours | Used By (Screens) | Dependencies |
|---|-----------|----------|-----------|-------------------|-------------|
| 19 | **LoadCard** | `components/tms/load-card.tsx` | 8h | Dispatch Board, Loads List (mobile), Load Board, Orders with linked loads | LoadStatusBadge (#1), `badge.tsx`, `avatar.tsx`, `tooltip.tsx` |
| 20 | **StopTimeline** | `components/tms/stop-timeline.tsx` | 8h | Load Detail (Route tab), Order Detail, Order Entry (Step 3 preview) | `badge.tsx`, LoadStatusBadge (#1) |
| 21 | **LoadTimeline** | `components/tms/load-timeline.tsx` | 6h | Load Detail (Timeline tab), Load Timeline screen | `activity-timeline.tsx` pattern (exists), `avatar.tsx` |
| 22 | **CheckCallLog** | `components/tms/check-call-log.tsx` | 6h | Check Calls screen, Load Detail (Check Calls tab) | LoadStatusBadge (#1), `avatar.tsx`, `badge.tsx` |
| 23 | **DocumentChecklist** | `components/tms/document-checklist.tsx` | 6h | Load Detail (Docs tab), Carrier Onboarding, Order Entry (Step 5) | `checkbox.tsx`, `progress.tsx` (exists) |

**Sprint total: ~34 hours (4-5 dev days)**

### Sprint T2: Selector & Search Components (3-4 days, 5 components)

| # | Component | Location | Est. Hours | Used By (Screens) | Dependencies |
|---|-----------|----------|-----------|-------------------|-------------|
| 24 | **CustomerSelector** | `components/tms/customer-selector.tsx` | 6h | Order Entry (Step 1), Quote Builder, Invoice Entry | `contact-select.tsx` pattern (exists), SearchInput (#6) |
| 25 | **CarrierSelector** | `components/tms/carrier-selector.tsx` | 8h | Dispatch Board (assignment modal), Load Builder, Carrier search | SearchInput (#6), KPICard (#2), LoadStatusBadge (#1) |
| 26 | **EquipmentSelector** | `components/tms/equipment-selector.tsx` | 5h | Order Entry (Step 2), Quote Builder, Loads List filters | `select.tsx` (exists), icons for equipment types |
| 27 | **LaneSearch** | `components/tms/lane-search.tsx` | 6h | Quote Builder, Rate Tables, Dispatch Board filters, Lane Pricing | SearchInput (#6), `address-autocomplete.tsx` (exists) |
| 28 | **StopList** | `components/tms/stop-list.tsx` | 6h | Order Entry (Step 3), Load Builder, Stop Management | `@dnd-kit/sortable`, `address-autocomplete.tsx` (exists), DatePicker (#8), TimePicker (#10) |

**Sprint total: ~31 hours (4-5 dev days)**

### Sprint T3: Complex View Components (5-7 days, 4 components)

| # | Component | Location | Est. Hours | Used By (Screens) | Dependencies |
|---|-----------|----------|-----------|-------------------|-------------|
| 29 | **DataGrid** | `components/shared/data-grid.tsx` | 20h | Orders List, Loads List, every List-type screen (134 total List screens) | `table.tsx` (exists), `pagination.tsx` (exists), `checkbox.tsx` (exists), SearchInput (#6), MultiSelect (#12) |
| 30 | **Chart** (wrapper system) | `components/shared/chart-system.tsx` | 12h | Operations Dashboard, Sales Dashboard, every Dashboard screen (42 total) | `chart` (shadcn, installed in Phase 0) |
| 31 | **ProgressTracker** | `components/tms/progress-tracker.tsx` | 6h | Order Entry (step indicator), Carrier Onboarding, Load lifecycle | None (standalone horizontal stepper variant) |
| 32 | **CommandPalette** | `components/shared/command-palette.tsx` | 8h | Global feature (Cmd+K from any screen) | `command.tsx` (exists), `dialog.tsx` (exists), SearchInput (#6) |

**Sprint total: ~46 hours (6-7 dev days)**

### Sprint T4: Board & Map Components (6-8 days, 5 components)

| # | Component | Location | Est. Hours | Used By (Screens) | Dependencies |
|---|-----------|----------|-----------|-------------------|-------------|
| 33 | **KanbanLane** | `components/tms/kanban-lane.tsx` | 6h | Dispatch Board | LoadCard (#19), `scroll-area.tsx` (exists) |
| 34 | **KanbanBoard** | `components/tms/kanban-board.tsx` | 16h | Dispatch Board | KanbanLane (#33), `@dnd-kit/core`, LoadCard (#19) |
| 35 | **CarrierAssignmentModal** | `components/tms/carrier-assignment-modal.tsx` | 8h | Dispatch Board, Load Detail, Load Builder | CarrierSelector (#25), `dialog.tsx` (exists), KPICard (#2) |
| 36 | **TrackingMapContainer** | `components/tms/tracking-map-container.tsx` | 20h | Tracking Map screen, Load Detail (map snippet), Dispatch Board (mini-map) | `route-map.tsx` (exists), Google Maps/Mapbox API |
| 37 | **LoadBoard** | `components/tms/load-board.tsx` | 12h | Load Board Internal screen, Dispatch Board (alternate view) | DataGrid (#29), LoadCard (#19), MultiSelect (#12) |

**Sprint total: ~62 hours (8-10 dev days)**

### Sprint T5: Rate & Financial Components (3-4 days, 4 components)

| # | Component | Location | Est. Hours | Used By (Screens) | Dependencies |
|---|-----------|----------|-----------|-------------------|-------------|
| 38 | **RateCalculator** | `components/sales/rate-calculator.tsx` | 10h | Quote Builder, Order Entry (Step 4), Rate Tables | CurrencyInput (#11), Statistic (#3) |
| 39 | **QuoteBuilder** (form component) | `components/sales/quote-builder-form.tsx` | 12h | Quote Builder screen | RateCalculator (#38), CustomerSelector (#24), LaneSearch (#27), EquipmentSelector (#26) |
| 40 | **InvoicePreview** | `components/accounting/invoice-preview.tsx` | 8h | Customer Invoice screen, Invoice Detail, Accounting screens | CurrencyInput (#11), Statistic (#3), `table.tsx` (exists) |
| 41 | **SettlementView** | `components/accounting/settlement-view.tsx` | 8h | Carrier Settlement screen, Carrier Payables | CurrencyInput (#11), Statistic (#3), `table.tsx` (exists) |

**Sprint total: ~38 hours (5-6 dev days)**

---

## Phase 3: Enhancement Components (Upgrade Existing)

These are components that partially exist and need to be upgraded to support TMS Core requirements.

| # | Component | Current State | Enhancement Needed | Est. Hours | Used By |
|---|-----------|--------------|-------------------|-----------|---------|
| 42 | **FilterBar** | `customer-filters.tsx`, `user-filters.tsx` (per-module) | Abstract into shared component with saved presets, URL sync, clear all | 8h | Every List and Board screen |
| 43 | **Breadcrumb** | `PageHeader.tsx` (partial) | Integrate shadcn breadcrumb with dynamic route-based generation | 4h | Every page |
| 44 | **Icon** | `activity-type-icon.tsx` (partial) | Standardized icon wrapper with consistent sizing and color system | 3h | Every page |
| 45 | **Overlay/Backdrop** | `dialog.tsx` backdrop (partial) | Extract standalone overlay for custom use (map overlays, loading overlays) | 2h | Tracking Map, Document Viewer |
| 46 | **LoadMap** | `route-map.tsx` (partial) | Extend with multi-stop rendering, live GPS markers, geofence overlays | 12h | Tracking Map, Load Detail, Dispatch Board mini-map |
| 47 | **RouteDisplay** | `route-map.tsx` (partial) | Extend with planned vs actual route, traffic overlay, distance/time display | 8h | Load Detail, Tracking Map, Order Entry preview |

**Enhancement total: ~37 hours (5-6 dev days)**

---

## Component Reuse Matrix

This matrix shows how many screens each component appears on. Components with higher reuse counts should be built with extra care for flexibility and documentation.

| Component | Reuse Count | Screens Using It |
|-----------|------------|-----------------|
| **DataGrid** | 134+ | Every List-type screen across all 38 services |
| **KPICard** | 42+ | Every Dashboard-type screen |
| **LoadStatusBadge** | 14+ | All TMS Core screens, Load Board, Carrier screens |
| **SearchInput** | 30+ | Every screen with search or filter capability |
| **DatePicker** | 25+ | Every form with date fields, every list with date filters |
| **CurrencyInput** | 15+ | All rate/pricing forms, invoice screens, settlement screens |
| **Statistic** | 20+ | Every dashboard, every detail page summary panel |
| **MultiSelect** | 20+ | Every list filter bar, every multi-value selector |
| **Breadcrumb** | 50+ | Every page (via layout shell) |
| **Panel** | 30+ | Every detail page section, every config page section |
| **FilterBar** | 20+ | Every List and Board screen |
| **Chart** | 15+ | Every Dashboard, every Report screen |
| **LoadCard** | 5 | Dispatch Board, Load Board, Loads List mobile, Tracking Map panel |
| **StopTimeline** | 4 | Load Detail, Order Detail, Order Entry preview, Stop Management |
| **CarrierSelector** | 4 | Dispatch Board, Load Builder, Load Detail, Carrier assignment |
| **CustomerSelector** | 4 | Order Entry, Quote Builder, Invoice Entry, Reports filters |
| **EquipmentSelector** | 4 | Order Entry, Quote Builder, Load Builder, Dispatch filters |
| **KanbanBoard** | 2 | Dispatch Board, Leads Pipeline (CRM, already exists as pattern) |
| **TrackingMapContainer** | 3 | Tracking Map, Load Detail map snippet, Dispatch Board mini-map |
| **RateCalculator** | 2 | Quote Builder, Order Entry (Step 4) |

---

## Per-Screen Component Lists

### TMS Core Screens (Service 04, Wave 2) -- All 14 Screens

#### Screen 04-01: Operations Dashboard
**Components needed:** KPICard (#2), Statistic (#3), Chart (#30), Grid (#17), DataGrid (#29), LoadStatusBadge (#1), Banner (#18), DateRangePicker (#9)
**New components to build for this screen:** 0 (all from Foundation/Core sprints)
**Component readiness after Phase 2:** 100%

#### Screen 04-02: Orders List
**Components needed:** DataGrid (#29), LoadStatusBadge (#1), FilterBar (#42), SearchInput (#6), DateRangePicker (#9), MultiSelect (#12), Tag (#5)
**New components to build for this screen:** 0
**Component readiness after Phase 2:** 100%

#### Screen 04-03: Order Detail
**Components needed:** Panel (#15), DescriptionList (#16), StopTimeline (#20), LoadStatusBadge (#1), Tag (#5), LoadTimeline (#21), DocumentChecklist (#23), Statistic (#3)
**New components to build for this screen:** 0
**Component readiness after Phase 2:** 100%

#### Screen 04-04: Order Entry (5-Step Wizard)
**Components needed:** Stepper (#14), CustomerSelector (#24), EquipmentSelector (#26), StopList (#28), DatePicker (#8), TimePicker (#10), CurrencyInput (#11), CheckboxGroup (#13), RateCalculator (#38), MultiSelect (#12), Panel (#15)
**New components to build for this screen:** 0
**Component readiness after Phase 2:** 100%

#### Screen 04-05: Loads List
**Components needed:** DataGrid (#29), LoadStatusBadge (#1), FilterBar (#42), SearchInput (#6), DateRangePicker (#9), MultiSelect (#12), LoadCard (#19, mobile view)
**New components to build for this screen:** 0
**Component readiness after Phase 2:** 100%

#### Screen 04-06: Load Detail (Most Complex)
**Components needed:** Panel (#15), DescriptionList (#16), StopTimeline (#20), LoadTimeline (#21), CheckCallLog (#22), DocumentChecklist (#23), LoadStatusBadge (#1), Statistic (#3), TrackingMapContainer (#36), CarrierAssignmentModal (#35), CurrencyInput (#11), Tag (#5), Accordion (shadcn)
**New components to build for this screen:** 0
**Component readiness after Phase 2:** 100%

#### Screen 04-07: Load Builder
**Components needed:** StopList (#28), CustomerSelector (#24), CarrierSelector (#25), EquipmentSelector (#26), CurrencyInput (#11), DatePicker (#8), TimePicker (#10)
**New components to build for this screen:** 0
**Component readiness after Phase 2:** 100%

#### Screen 04-08: Dispatch Board (Most Complex)
**Components needed:** KanbanBoard (#34), KanbanLane (#33), LoadCard (#19), CarrierAssignmentModal (#35), TrackingMapContainer (#36, mini-map), LoadStatusBadge (#1), KPICard (#2), FilterBar (#42), SearchInput (#6), MultiSelect (#12), DateRangePicker (#9), ToggleGroup (shadcn)
**New components to build for this screen:** 0
**Component readiness after Phase 2:** 100%

#### Screen 04-09: Stop Management
**Components needed:** StopList (#28), StopTimeline (#20), LoadStatusBadge (#1), DatePicker (#8), TimePicker (#10), Panel (#15)
**New components to build for this screen:** 0
**Component readiness after Phase 2:** 100%

#### Screen 04-10: Tracking Map
**Components needed:** TrackingMapContainer (#36), LoadCard (#19, side panel), LoadStatusBadge (#1), FilterBar (#42), SearchInput (#6), MultiSelect (#12), StopTimeline (#20, side panel), ToggleGroup (shadcn)
**New components to build for this screen:** 0
**Component readiness after Phase 2:** 100%

#### Screen 04-11: Status Updates
**Components needed:** LoadStatusBadge (#1), LoadTimeline (#21), Panel (#15), DescriptionList (#16), DatePicker (#8)
**New components to build for this screen:** 0
**Component readiness after Phase 2:** 100%

#### Screen 04-12: Load Timeline
**Components needed:** LoadTimeline (#21), LoadStatusBadge (#1), FilterBar (#42), SearchInput (#6), DateRangePicker (#9)
**New components to build for this screen:** 0
**Component readiness after Phase 2:** 100%

#### Screen 04-13: Check Calls
**Components needed:** CheckCallLog (#22), LoadStatusBadge (#1), SearchInput (#6), DateRangePicker (#9), TimePicker (#10), Panel (#15)
**New components to build for this screen:** 0
**Component readiness after Phase 2:** 100%

#### Screen 04-14: Appointment Scheduler
**Components needed:** DatePicker (#8), TimePicker (#10), DataGrid (#29), StopTimeline (#20), Panel (#15), Calendar (shadcn, exists)
**New components to build for this screen:** 0
**Component readiness after Phase 2:** 100%

### Sales Screens (Service 03, Wave 1 -- Unbuilt)

#### Screen 03-04: Quote Builder
**Components needed:** RateCalculator (#38), QuoteBuilder form (#39), CustomerSelector (#24), LaneSearch (#27), EquipmentSelector (#26), CurrencyInput (#11), DatePicker (#8), Statistic (#3), MultiSelect (#12)
**Component readiness after Phase 2:** 100%

### Carrier Screens (Service 05, Wave 3 -- Highest Priority)

#### Screen 05-01: Carrier Dashboard
**Components needed:** KPICard (#2), Chart (#30), DataGrid (#29), Statistic (#3), Grid (#17), DateRangePicker (#9)
**Component readiness after Phase 2:** 100%

#### Screen 05-03: Carrier Detail
**Components needed:** Panel (#15), DescriptionList (#16), DocumentChecklist (#23), Statistic (#3), Chart (#30), DataGrid (#29), Tag (#5)
**Component readiness after Phase 2:** 100%

---

## Component Sprint Schedule

Assuming a single developer working full-time:

| Sprint | Duration | Components | Screens Unblocked |
|--------|---------|------------|-------------------|
| **Phase 0: shadcn Installs** | 0.5 day | 8 shadcn packages | -- |
| **Sprint F1: Core Primitives** | 3-4 days | LoadStatusBadge, KPICard, Statistic, IconButton, Tag, SearchInput, Link | -- |
| **Sprint F2: Form Primitives** | 4-5 days | DatePicker, DateRangePicker, TimePicker, CurrencyInput, MultiSelect, CheckboxGroup | -- |
| **Sprint F3: Layout Primitives** | 2-3 days | Stepper, Panel, DescriptionList, Grid, Banner | -- |
| **Sprint T1: Data Display** | 4-5 days | LoadCard, StopTimeline, LoadTimeline, CheckCallLog, DocumentChecklist | Check Calls, Load Timeline, Status Updates |
| **Sprint T2: Selectors** | 4-5 days | CustomerSelector, CarrierSelector, EquipmentSelector, LaneSearch, StopList | Order Entry (Step 1-3), Load Builder, Stop Management |
| **Sprint T3: Complex Views** | 6-7 days | DataGrid, Chart system, ProgressTracker, CommandPalette | Operations Dashboard, Orders List, Loads List, all List screens |
| **Sprint T4: Board & Map** | 8-10 days | KanbanLane, KanbanBoard, CarrierAssignmentModal, TrackingMapContainer, LoadBoard | Dispatch Board, Tracking Map, Load Board |
| **Sprint T5: Rate & Financial** | 5-6 days | RateCalculator, QuoteBuilder form, InvoicePreview, SettlementView | Quote Builder, Customer Invoice, Carrier Settlement |
| **Phase 3: Enhancements** | 5-6 days | FilterBar, Breadcrumb, Icon, Overlay, LoadMap, RouteDisplay | All screens (polish) |
| **Total** | **43-52 days** | **47 components** | **20 screens fully unblocked** |

---

## Parallel Development Strategy

With 2 developers, the schedule compresses significantly because Phases 1 and 2 have independent tracks:

| Developer A (UI/Forms) | Developer B (Domain/Complex) |
|----------------------|---------------------------|
| Sprint F1: Core Primitives (3-4d) | Sprint F2: Form Primitives (4-5d) |
| Sprint F3: Layout Primitives (2-3d) | Sprint T1: Data Display (4-5d) |
| Sprint T2: Selectors (4-5d) | Sprint T3: Complex Views (6-7d) |
| Sprint T5: Rate & Financial (5-6d) | Sprint T4: Board & Map (8-10d) |
| Phase 3: Enhancements (5-6d) | -- |

**Parallel total: ~23-28 days (5-6 weeks)**

With 3 developers, a third track handles all enhancement components (Phase 3) and DataGrid (#29) in parallel, reducing the total to ~18-22 days (4-5 weeks).

---

## Build Order Dependency Graph

```
Phase 0: shadcn installs
    |
    v
Phase 1 (Foundation) - No internal dependencies, build in any order within sprints
    |
    +-- LoadStatusBadge ----+
    |                       |
    +-- KPICard             +---> Phase 2 (TMS Core)
    |                       |
    +-- Statistic           +---> LoadCard ---> KanbanLane ---> KanbanBoard
    |                       |
    +-- SearchInput         +---> CarrierSelector ---> CarrierAssignmentModal
    |                       |
    +-- DatePicker          +---> StopTimeline, CheckCallLog, LoadTimeline
    |   |                   |
    |   +-- DateRangePicker |
    |                       |
    +-- TimePicker          +---> StopList ---> Order Entry page
    |                       |
    +-- CurrencyInput ------+---> RateCalculator ---> QuoteBuilder form
    |                       |
    +-- MultiSelect         +---> FilterBar (enhancement)
    |                       |
    +-- Stepper             +---> Order Entry page (direct)
    |                       |
    +-- Panel               +---> Load Detail page (direct)
    |                       |
    +-- DescriptionList     +---> Load Detail page (direct)
    |                       |
    +-- Grid ---------------+---> Operations Dashboard page (direct)
    |
    v
Phase 2 (TMS Core) - Dependencies shown above
    |
    v
Phase 3 (Enhancements) - Can run in parallel with Phase 2 sprints T3-T5
```

---

## Critical Path

The longest dependency chain determines the minimum calendar time:

1. **shadcn installs** (0.5 day)
2. **LoadStatusBadge** (0.5 day) -- needed by LoadCard
3. **LoadCard** (1 day) -- needed by KanbanLane
4. **KanbanLane** (1 day) -- needed by KanbanBoard
5. **KanbanBoard** (2 days) -- needed by Dispatch Board page
6. **Dispatch Board page assembly** (6+ days) -- most complex page

**Critical path: ~11 days minimum** even with unlimited developers, because these components chain sequentially.

The second-longest chain:
1. **CurrencyInput** (0.5 day)
2. **RateCalculator** (1.5 days)
3. **QuoteBuilder form** (2 days)
4. **Quote Builder page assembly** (4+ days)

**Second critical path: ~8 days minimum.**

Both chains can run in parallel, so the overall minimum is constrained by the Dispatch Board chain at ~11 days.
