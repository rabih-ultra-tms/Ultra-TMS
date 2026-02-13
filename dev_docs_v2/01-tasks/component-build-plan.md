# Ultra TMS — Complete Component Build Plan

> **Created:** February 9, 2026
> **Aligned with:** STATUS.md v2 (77 tasks, 7 phases, 16 weeks)
> **Scope:** ~138 new components across 8 MVP services, organized into 32 executable sessions

---

## Summary

| Metric | Count |
|--------|-------|
| **Total sessions** | 32 |
| **Total new/rebuilt components** | ~138 |
| **Total new files (incl. hooks, types, pages)** | ~195 |
| **Estimated hours** | 420–490h |
| **Developers** | 2 (Claude Code + Codex/Gemini) |
| **Timeline** | 16 weeks |

### Components per Service

| Service | New Components | Refactor/Fix | Sessions |
|---------|---------------|-------------|----------|
| Shared Patterns | 5 patterns + utilities | — | 4 |
| Auth & Admin | 3 stubs | — | 1 (in Phase 0) |
| Dashboard Shell | 2 | 1 fix | 1 (in Phase 0) |
| CRM | 6 new (Wave 2) | 5 fixes (Wave 1) | 2 |
| Sales | 8 new | 4 rebuild | 4 |
| TMS Core | 19 new | — | 10 |
| Carrier | 5 new | 4 refactor | 2 |
| Accounting | 11 new | — | 2 |
| Load Board | 10 new | — | 3 |
| Commission | 7 new + extras | — | 2 |
| **Total** | **~138** | **~14** | **32** |

### Sessions per Phase

| Phase | Weeks | Sessions | Parallelizable Pairs |
|-------|-------|----------|---------------------|
| Phase 0 | 1 | 2 | 1 pair |
| Phase 1 | 2 | 3 | 1 pair |
| Phase 2 | 3–4 | 4 | 2 pairs |
| Phase 3 | 5–7 | 7 | 3 pairs |
| Phase 4 | 8–10 | 8 | 3 pairs |
| Phase 5 | 11–13 | 4 | 2 pairs |
| Phase 6 | 14–16 | 4 | 2 pairs |
| **Total** | **16** | **32** | **14 pairs** |

---

## Conventions

- **File paths** are relative to `apps/web/`
- **Design specs** are in `dev_docs/12-Rabih-design-Process/{service}/`
- **API base:** `/api/v1/` (backend is NestJS at `apps/api/`)
- **New service components** go in `components/tms/{service}/` or `components/{service}/`
- **Hooks** go in `lib/hooks/{service}/`
- **Types** go in `lib/types/{service}.ts`
- **PROTECT LIST:** Load Planner, Truck Types, Login — never modify

---

## PHASE 0 — Emergency Fixes (Week 1)

> BUG-001 through BUG-008 already DONE. Only BUG-009 + BUG-010 remain.

### Session 1: CRM Bug Fixes
**Phase:** 0 (BUG-009, BUG-010) | **Category:** bug-fix | **Effort:** 5–7h

**Components to modify:**
| Action | File | Change |
|--------|------|--------|
| MODIFY | `components/crm/contacts/contacts-table.tsx` | Add delete action column + search input |
| MODIFY | `components/crm/leads/leads-table.tsx` | Add delete action column |
| MODIFY | `app/(dashboard)/leads/[id]/page.tsx` | Wire Convert-to-Customer button (LeadConvertDialog exists) |
| MODIFY | `app/(dashboard)/leads/page.tsx` | Replace owner text input with SearchableSelect dropdown |
| MODIFY | `components/crm/leads/leads-pipeline.tsx` | Add ConfirmDialog on stage drag-drop |

**Design specs:** `02-crm/06-contacts-list.md`, `02-crm/02-leads-list.md`

**API endpoints to wire:**
- `DELETE /crm/contacts/:id` (exists, no UI)
- `DELETE /crm/opportunities/:id` (exists, no UI)
- `POST /crm/opportunities/:id/convert` (exists, no UI button)

**Design system reuse:** ConfirmDialog, SearchableSelect
**New files:** 0 (all modifications)
**Parallelizable:** Yes — Dev B works Session 2 simultaneously

---

### Session 2: Dashboard Wiring
**Phase:** 0 (BUG-008 remainder) | **Category:** bug-fix | **Effort:** 4–5h

**Components to modify:**
| Action | File | Change |
|--------|------|--------|
| MODIFY | `app/(dashboard)/page.tsx` | Wire dashboard KPIs to real API (replace hardcoded zeros) |
| CREATE | `lib/hooks/use-dashboard.ts` | `useDashboardMetrics()` hook |

**Design specs:** `01.1-dashboard-shell/01-main-dashboard.md`

**API endpoints to wire:**
- `GET /dashboard/metrics` — Main dashboard KPIs

**Design system reuse:** KpiCard, StatsBar, StatItem
**New files:** 1
**Parallelizable:** Yes — Dev A works Session 1 simultaneously

---

## PHASE 1 — Design Foundation (Week 2)

### Session 3: Design Tokens + StatusBadge Adoption + shadcn Installs
**Phase:** 1 (COMP-001, COMP-002, COMP-008) | **Category:** shared-pattern | **Effort:** 9–11h

**Components to modify:**
| Action | File | Change |
|--------|------|--------|
| MODIFY | `app/globals.css` | Verify 3-layer token architecture (brand→semantic→Tailwind) |
| VERIFY | `lib/design-tokens/status.ts` | Ensure all 8 status color families mapped |
| VERIFY | `lib/design-tokens/typography.ts` | Ensure type scale constants |
| MODIFY | `components/admin/users/user-status-badge.tsx` | Switch to unified StatusBadge from `tms/primitives/` |
| MODIFY | `components/crm/customers/customer-status-badge.tsx` | Switch to unified StatusBadge |
| MODIFY | `components/crm/leads/lead-stage-badge.tsx` | Switch to unified StatusBadge |
| INSTALL | (shadcn CLI) | `radio-group`, `accordion`, `breadcrumb`, `resizable`, `toggle`, `toggle-group`, `chart`, `drawer`, `input-otp` |

**Design specs:** `00-global/03-status-color-system.md`, `dev_docs_v2/00-foundations/design-system.md`

**API endpoints:** None (infrastructure)
**Design system reuse:** StatusBadge (already built — this session ensures adoption)
**New files:** 2–3 (token config updates)
**Parallelizable:** No — COMP-001 is a gate. Both devs should pair-review. shadcn installs (COMP-008) can be done by Dev B while Dev A works on tokens.

> **CRITICAL GATE:** COMP-001 must pass 2-person review before Phase 2.

---

### Session 4: DataGrid + FilterBar Verification + ConfirmDialog Upgrade
**Phase:** 1 (COMP-004, COMP-005, COMP-006) | **Category:** shared-pattern | **Effort:** 6–8h

**Components to modify:**
| Action | File | Change |
|--------|------|--------|
| VERIFY | `components/tms/filters/filter-bar.tsx` | Ensure generic filter config props |
| VERIFY | `components/tms/tables/data-table.tsx` | Ensure TanStack v8 sorting, filtering, column visibility, density |
| MODIFY | `components/shared/confirm-dialog.tsx` | Add variants: destructive (red), info (blue), warning (amber). Add async loading state. |
| CREATE | `lib/types/filter-config.ts` | Generic filter config TypeScript interface |

**Design specs:** Referenced in existing page-pattern docs
**API endpoints:** None (infrastructure)
**Design system reuse:** DataTable, FilterBar, FilterChip, ColumnVisibility, TablePagination, DensityToggle
**New files:** 1
**Parallelizable:** Yes — Dev A on this, Dev B on Session 5

---

### Session 5: Loading Skeletons + KPICard Polish
**Phase:** 1 (COMP-003, COMP-007) | **Category:** shared-pattern | **Effort:** 4–6h

**Components to modify:**
| Action | File | Change |
|--------|------|--------|
| VERIFY | `components/tms/stats/kpi-card.tsx` | Ensure: trend indicators, loading skeleton variant, sparkline optional |
| CREATE | `components/patterns/page-skeleton.tsx` | Page-level skeleton composing list/detail/form variants |
| MODIFY | `components/shared/data-table-skeleton.tsx` | Add density-aware variants |

**Design specs:** `01.1-dashboard-shell/01-main-dashboard.md` (KPI card spec)
**API endpoints:** None (infrastructure)
**Design system reuse:** KpiCard, StatItem, StatsBar
**New files:** 1–2
**Parallelizable:** Yes — Dev B on this, Dev A on Session 4

---

## PHASE 2 — Patterns & Carrier Refactor (Weeks 3–4)

### Session 6: ListPage + DetailPage + FormPage Patterns
**Phase:** 2 (PATT-001, PATT-002, PATT-003) | **Category:** shared-pattern | **Effort:** 10–14h

**Components to create:**
| Action | File | Description |
|--------|------|-------------|
| CREATE | `components/patterns/list-page.tsx` | Composable shell: PageHeader + StatsBar + FilterBar + DataTable + Pagination. Generic props for columns, dataHook, filters, createLink. |
| CREATE | `components/patterns/detail-page.tsx` | Composable shell: PageHeader + Breadcrumb + Tabs + SlidePanel. Generic props for tabs config, sidebar. |
| CREATE | `components/patterns/form-page.tsx` | Composable shell: PageHeader + Breadcrumb + Form + validation. Multi-step wizard mode. |
| CREATE | `components/patterns/index.ts` | Barrel export |

**Design specs:** Referenced in page-pattern task files
**API endpoints:** None (patterns are endpoint-agnostic)
**Design system reuse:** PageHeader, FilterBar, DataTable, SlidePanel, PanelTabs, StatsBar, TablePagination
**New files:** 4
**Parallelizable:** Dev B works Session 7 simultaneously

---

### Session 7: DateRangePicker + StopList Component
**Phase:** 2 (COMP-009, COMP-010) | **Category:** shared-pattern | **Effort:** 5–6h

**Components to create:**
| Action | File | Description |
|--------|------|-------------|
| CREATE | `components/tms/filters/date-range-picker.tsx` | shadcn Calendar + Popover. Presets: today, this week, this month, last 30 days, custom. |
| CREATE | `components/tms/stops/stop-list.tsx` | Reusable stop list with inline status, drag-to-reorder. Used by Order Detail, Load Detail, Stop Management. |
| CREATE | `components/tms/stops/stop-card.tsx` | Individual stop card with address, times, status dot |
| CREATE | `components/tms/stops/index.ts` | Barrel export |

**Design specs:** `04-tms-core/09-stop-management.md`

**API endpoints:**
- `GET /stops` (filtered by loadId)
- `PATCH /stops/:id/status`
- `POST /stops/reorder`

**Design system reuse:** StatusBadge, StatusDot, InfoGrid
**New files:** 4
**Parallelizable:** Yes — Dev B on this, Dev A on Session 6

---

### Session 8: Carrier List Refactor + Carrier Detail Upgrade
**Phase:** 2 (CARR-001, CARR-002) | **Category:** refactor | **Effort:** 8–10h

**Components to modify/create:**
| Action | File | Description |
|--------|------|-------------|
| MODIFY | `app/(dashboard)/carriers/page.tsx` | Slim 858-line monolith → use ListPage pattern |
| CREATE | `components/carriers/carriers-table-columns.tsx` | Column definitions extracted |
| CREATE | `components/carriers/carrier-status-badge.tsx` | StatusBadge with design tokens (replace hardcoded colors) |
| CREATE | `components/carriers/carrier-filters.tsx` | Status, type, compliance filters |
| CREATE | `components/carriers/carrier-actions-menu.tsx` | Row action menu (view, edit, delete, toggle preferred) |
| MODIFY | `app/(dashboard)/carriers/[id]/page.tsx` | Use DetailPage pattern. Tabs: Overview, Contacts, Insurance, Documents, Drivers, Load History |

**Design specs:** `05-carrier/02-carriers-list.md`, `05-carrier/03-carrier-detail.md`

**API endpoints:**
- `GET /carriers` (with filter params)
- `GET /carriers/:id`
- `GET /carriers/:id/contacts`, `/insurance`, `/documents`, `/drivers`, `/loads`

**Design system reuse:** DataTable, FilterBar, StatusBadge, PageHeader, SlidePanel, PanelTabs, InfoGrid, FieldList, DocumentList, PermitList
**New files:** 4 new + 2 major modifications
**Parallelizable:** Yes — Dev A on this, Dev B on Session 9

---

### Session 9: Carrier Module Tests
**Phase:** 2 (CARR-003) | **Category:** testing | **Effort:** 3–4h

**Files to create:**
- `components/carriers/__tests__/carriers-table.test.tsx`
- `components/carriers/__tests__/carrier-detail.test.tsx`
- `components/carriers/__tests__/carrier-form.test.tsx`
- `lib/hooks/carriers/__tests__/use-carriers.test.ts`

**New files:** 4
**Parallelizable:** Yes — Dev B on this, Dev A on Session 8

---

## PHASE 3 — TMS Viewing + Sales Rebuild (Weeks 5–7)

### Session 10: Orders List Page
**Phase:** 3 (TMS-001) | **Category:** page-build | **Effort:** 7h

**Components to create:**
| Action | File | Description |
|--------|------|-------------|
| CREATE | `app/(dashboard)/operations/orders/page.tsx` | Uses ListPage pattern |
| CREATE | `components/tms/orders/orders-table.tsx` | Columns: order #, customer, status, dates, origin, dest, charges |
| CREATE | `components/tms/orders/order-status-badge.tsx` | StatusBadge for 8 order states (PENDING→COMPLETED + CANCELLED) |
| CREATE | `lib/hooks/tms/use-orders.ts` | `useOrders(filters)`, `useOrderStats()`, `useOrder(id)`, mutations |
| CREATE | `lib/types/orders.ts` | Order, OrderFilters, OrderStats types |

**Design specs:** `04-tms-core/02-orders-list.md`

**API endpoints:**
- `GET /orders` (paginated, filterable)
- `GET /orders/stats`

**Design system reuse:** DataTable, FilterBar, StatusBadge, PageHeader, StatsBar, KpiCard, SearchInput
**New files:** 5
**Parallelizable:** Yes — Dev A on this, Dev B on Session 14 (Quotes)

---

### Session 11: Order Detail Page
**Phase:** 3 (TMS-002) | **Category:** page-build | **Effort:** 8h

**Components to create:**
| Action | File | Description |
|--------|------|-------------|
| CREATE | `app/(dashboard)/operations/orders/[id]/page.tsx` | Uses DetailPage pattern |
| CREATE | `components/tms/orders/order-detail-card.tsx` | Overview tab: customer, rate, margin sidebar |
| CREATE | `components/tms/orders/order-timeline.tsx` | Activity timeline (uses Timeline component) |
| CREATE | `components/tms/orders/order-loads-section.tsx` | Loads tab: associated loads list |
| CREATE | `components/tms/orders/order-documents-section.tsx` | Documents tab |

**Design specs:** `04-tms-core/03-order-detail.md`

**API endpoints:**
- `GET /orders/:id`
- `GET /orders/:id/loads`
- `GET /orders/:id/documents`
- `GET /orders/:id/timeline`
- `GET /orders/:id/notes`
- `PATCH /orders/:id/status`

**Design system reuse:** SlidePanel, PanelTabs, InfoGrid, FieldList, Timeline, DocumentList, StatusBadge, PageHeader, QuickActions
**New files:** 5
**Parallelizable:** No — depends on Session 10 (shared hooks/types)

---

### Session 12: Loads List Page
**Phase:** 3 (TMS-003) | **Category:** page-build | **Effort:** 5h

**Components to create:**
| Action | File | Description |
|--------|------|-------------|
| CREATE | `app/(dashboard)/operations/loads/page.tsx` | Uses ListPage pattern |
| CREATE | `components/tms/loads/loads-table.tsx` | Columns: load #, order #, status, carrier, equipment, origin, dest |
| CREATE | `components/tms/loads/load-status-badge.tsx` | StatusBadge for 12 load states |
| CREATE | `lib/hooks/tms/use-loads.ts` | `useLoads(filters)`, `useLoadStats()`, `useLoad(id)`, mutations |
| CREATE | `lib/types/loads.ts` | Load, LoadFilters, LoadStats types |

**Design specs:** `04-tms-core/05-loads-list.md`

**API endpoints:**
- `GET /loads` (paginated, filterable by status/carrier/equipment)
- `GET /loads/stats`

**Design system reuse:** DataTable, FilterBar, StatusBadge, PageHeader, StatsBar, KpiCard
**New files:** 5
**Parallelizable:** Yes — Dev B on this, Dev A on Session 11

---

### Session 13: Load Detail Page
**Phase:** 3 (TMS-004) | **Category:** page-build | **Effort:** 8h

**Components to create:**
| Action | File | Description |
|--------|------|-------------|
| CREATE | `app/(dashboard)/operations/loads/[id]/page.tsx` | Uses DetailPage pattern |
| CREATE | `components/tms/loads/load-detail-card.tsx` | Overview tab: carrier info, rate/margin sidebar |
| CREATE | `components/tms/loads/load-stops-list.tsx` | Stops tab using StopList (COMP-010) |
| CREATE | `components/tms/loads/load-carrier-section.tsx` | Carrier info with assign/tender actions |
| CREATE | `components/tms/loads/load-tracking-section.tsx` | Tracking tab (placeholder for map, check call log) |

**Design specs:** `04-tms-core/06-load-detail.md`

**API endpoints:**
- `GET /loads/:id`
- `GET /loads/:id/stops`
- `GET /loads/:id/checkcalls`
- `GET /loads/:id/documents`
- `GET /loads/:id/timeline`
- `POST /loads/:id/assign`
- `POST /loads/:id/tender`
- `PATCH /loads/:id/status`

**Design system reuse:** SlidePanel, PanelTabs, InfoGrid, FieldList, Timeline, DocumentList, StatusBadge, UploadZone, StopList
**New files:** 5
**Parallelizable:** No — depends on Session 12 (shared hooks/types)

---

### Session 14: Quotes List Rebuild
**Phase:** 3 (SALES-001) | **Category:** page-build (rebuild) | **Effort:** 5h

**Components to modify/create:**
| Action | File | Description |
|--------|------|-------------|
| REBUILD | `app/(dashboard)/quotes/page.tsx` | Replace with ListPage pattern, design tokens |
| REBUILD | `components/sales/quotes/quotes-table.tsx` | New column defs with design tokens |
| REBUILD | `components/sales/quotes/quote-status-badge.tsx` | Use StatusBadge (replace hardcoded colors) |
| CREATE | `lib/hooks/sales/use-quotes.ts` | `useQuotes(filters)`, `useQuoteStats()`, mutations |
| CREATE | `lib/types/quotes.ts` | Quote types |

**Design specs:** `03-sales/02-quotes-list.md`

**API endpoints:**
- `GET /quotes` (paginated)
- `GET /quotes/stats`

**Design system reuse:** DataTable, FilterBar, StatusBadge, PageHeader, StatsBar, KpiCard
**New files:** 2 new + 3 rebuilds
**Parallelizable:** Yes — Dev B on this, Dev A on Session 10

---

### Session 15: Quote Detail + Quote Form Rebuild
**Phase:** 3 (SALES-002, SALES-003) | **Category:** page-build (rebuild) | **Effort:** 12–15h

**Components to modify/create:**
| Action | File | Description |
|--------|------|-------------|
| REBUILD | `app/(dashboard)/quotes/[id]/page.tsx` | DetailPage pattern. Tabs: Overview, Timeline, Versions, Documents |
| REBUILD | `components/sales/quotes/quote-detail-card.tsx` | Tabs, version switcher, timeline |
| CREATE | `components/sales/quotes/quote-versions-list.tsx` | Version history panel |
| REBUILD | `components/sales/quotes/quote-form.tsx` | Quick mode (1-screen) + full mode (multi-step) |
| CREATE | `components/sales/quotes/rate-calculator.tsx` | Inline rate calculation widget |

**Design specs:** `03-sales/03-quote-detail.md`, `03-sales/04-quote-builder.md`

**API endpoints:**
- `GET /quotes/:id`, `GET /quotes/:id/versions`, `GET /quotes/:id/timeline`
- `POST /quotes` (create), `PUT /quotes/:id` (update)
- `POST /quotes/:id/version`, `POST /quotes/calculate-rate`
- `POST /quotes/:id/send`, `/accept`, `/reject`

**Design system reuse:** SlidePanel, PanelTabs, InfoGrid, Timeline, StatusBadge, FinanceBreakdown, PageHeader
**New files:** 2 new + 3 rebuilds
**Parallelizable:** Yes — Dev B on this, Dev A on Session 13

---

### Session 16: Public Tracking Page + Document Upload
**Phase:** 3 (TMS-015, DOC-001) | **Category:** page-build | **Effort:** 12–14h

**Components to create/modify:**
| Action | File | Description |
|--------|------|-------------|
| CREATE | `app/track/[code]/page.tsx` | Public page (no auth layout). Load status + location + ETA. |
| CREATE | `components/tms/tracking/public-tracking-view.tsx` | Status timeline, map embed, last update |
| CREATE | `components/tms/tracking/tracking-status-timeline.tsx` | Visual step-by-step status progression |
| MODIFY | Load Detail docs tab | Add DocumentList + UploadZone for POD/BOL upload |
| CREATE | `lib/hooks/tms/use-tracking.ts` | `usePublicTracking(code)`, `useTrackingPositions(loadId)` |

**Design specs:** `04-tms-core/10-tracking-map.md`

**API endpoints:**
- `GET /operations/tracking/positions/:loadId`

**Design system reuse:** Timeline, StatusBadge, StatusDot, UploadZone, DocumentList, AlertBanner
**New files:** 4 new + 1 modification
**Parallelizable:** Yes — Dev A on this while Dev B finishes Session 15

---

## PHASE 4 — TMS Forms + Operations (Weeks 8–10)

### Session 17: New Order Form (Multi-Step)
**Phase:** 4 (TMS-005) | **Category:** page-build | **Effort:** 12h

**Components to create:**
| Action | File | Description |
|--------|------|-------------|
| CREATE | `app/(dashboard)/operations/orders/new/page.tsx` | Multi-step form using FormPage |
| CREATE | `components/tms/orders/order-form.tsx` | 4-step form orchestrator |
| CREATE | `components/tms/orders/order-customer-step.tsx` | Customer search + credit status check |
| CREATE | `components/tms/orders/order-stops-step.tsx` | Add/remove/reorder stops, address autocomplete |
| CREATE | `components/tms/orders/order-rate-step.tsx` | Rate entry, accessorials, margin calculator |
| CREATE | `components/tms/orders/order-review-step.tsx` | Summary review before submit |

**Design specs:** `04-tms-core/04-order-entry.md`

**API endpoints:**
- `POST /orders` (create with stops)
- `POST /orders/from-quote/:quoteId` (pre-fill from quote)
- `GET /crm/customers` (customer search)

**Design system reuse:** SearchInput, InfoGrid, FieldList, FinanceBreakdown, AlertBanner
**New files:** 6
**Parallelizable:** Yes — Dev A on this, Dev B on Session 18

---

### Session 18: Edit Order + Edit Load Forms
**Phase:** 4 (TMS-006, TMS-008) | **Category:** page-build | **Effort:** 8–10h

**Components to create:**
| Action | File | Description |
|--------|------|-------------|
| CREATE | `app/(dashboard)/operations/orders/[id]/edit/page.tsx` | Reuses OrderForm in edit mode |
| CREATE | `app/(dashboard)/operations/loads/[id]/edit/page.tsx` | Reuses LoadForm in edit mode |

**Design specs:** `04-tms-core/04-order-entry.md` (edit variant), `04-tms-core/07-load-builder.md` (edit variant)

**API endpoints:**
- `PUT /orders/:id`, `GET /orders/:id`
- `PUT /loads/:id`, `GET /loads/:id`

**New files:** 2 (page files; forms reuse create components)
**Parallelizable:** Yes — Dev B on this, Dev A on Session 17

---

### Session 19: New Load Form (Multi-Step)
**Phase:** 4 (TMS-007) | **Category:** page-build | **Effort:** 9h

**Components to create:**
| Action | File | Description |
|--------|------|-------------|
| CREATE | `app/(dashboard)/operations/loads/new/page.tsx` | Multi-step form using FormPage |
| CREATE | `components/tms/loads/load-form.tsx` | 3-step: Stops Inheritance → Carrier Assignment → Rate & Submit |
| CREATE | `components/tms/loads/load-carrier-assignment.tsx` | Carrier search, compliance check, rate negotiation |
| CREATE | `components/tms/loads/load-rate-section.tsx` | Carrier cost vs customer rate, margin display |

**Design specs:** `04-tms-core/07-load-builder.md`

**API endpoints:**
- `POST /loads` (create)
- `GET /orders/:id` (pre-fill from order)
- `GET /carriers/search` (carrier lookup)
- `GET /carriers/:id/performance` (scorecard)

**Design system reuse:** SearchInput, InfoGrid, FinanceBreakdown, AlertBanner, StatusBadge
**New files:** 4
**Parallelizable:** No — depends on Session 17 (shared form patterns)

---

### Session 20: Stop Management + Check Call Log
**Phase:** 4 (TMS-009, TMS-010) | **Category:** page-build | **Effort:** 12h

**Components to create:**
| Action | File | Description |
|--------|------|-------------|
| CREATE | `components/tms/stops/stop-management.tsx` | Inline-editable stop list with Arrive/Depart buttons, detention timer |
| CREATE | `components/tms/stops/stop-form.tsx` | Add/edit stop modal (address, appointment, contact) |
| CREATE | `components/tms/stops/detention-timer.tsx` | Visual countdown: detention time + charges |
| CREATE | `components/tms/checkcalls/check-call-log.tsx` | Timeline view with add-new form |
| CREATE | `components/tms/checkcalls/check-call-form.tsx` | Quick add: type, location, notes |
| CREATE | `lib/hooks/tms/use-stops.ts` | CRUD hooks for stops |
| CREATE | `lib/hooks/tms/use-checkcalls.ts` | CRUD hooks for check calls |

**Design specs:** `04-tms-core/09-stop-management.md`, `04-tms-core/13-check-calls.md`

**API endpoints:**
- `GET/PUT/DELETE /stops/:id`
- `PATCH /stops/:id/arrive`, `/stops/:id/depart`
- `POST /stops/reorder`, `GET /stops/:id/detention`
- `GET/POST /checkcalls`, `GET /checkcalls/overdue`

**Design system reuse:** Timeline, StatusBadge, StatusDot, InfoGrid, AlertBanner, StopList
**New files:** 7
**Parallelizable:** Yes — Dev A on this, Dev B on Session 21

---

### Session 21: WebSocket Infrastructure
**Phase:** 4 (INFRA-001) | **Category:** shared-pattern | **Effort:** 8h

**Components to create:**
| Action | File | Description |
|--------|------|-------------|
| CREATE | `lib/socket/socket-provider.tsx` | React context provider for Socket.io connection |
| CREATE | `lib/socket/socket-client.ts` | Socket.io client singleton, auto-reconnect, auth token |
| CREATE | `lib/socket/use-socket.ts` | Generic `useSocket(namespace, event)` hook |
| CREATE | `lib/socket/use-socket-event.ts` | Subscribe to specific events with callback |
| MODIFY | `app/(dashboard)/layout.tsx` | Wrap with SocketProvider |

**Design specs:** `dev_docs/10-features/79-real-time-websocket-standards.md`

**WebSocket namespaces:**
- `/dispatch` — load:status:changed, load:created, load:assigned
- `/tracking` — load:location:updated, load:eta:updated

**New files:** 4 + 1 modification
**Parallelizable:** Yes — Dev B on this, Dev A on Session 20. **Must complete before Sessions 23 + 25.**

---

### Session 22: Dispatch Board — Kanban UI
**Phase:** 4 (TMS-011a, TMS-011b) | **Category:** page-build | **Effort:** 16–20h

**Components to create:**
| Action | File | Description |
|--------|------|-------------|
| CREATE | `app/(dashboard)/operations/dispatch/page.tsx` | Dispatch board page |
| CREATE | `components/tms/dispatch/dispatch-board.tsx` | Kanban container with 6 status columns |
| CREATE | `components/tms/dispatch/dispatch-lane.tsx` | Single column with count badge, scrollable |
| CREATE | `components/tms/dispatch/dispatch-card.tsx` | Card: load #, carrier, origin→dest, pickup time, equipment |
| CREATE | `components/tms/dispatch/dispatch-filters.tsx` | Date range, carrier, equipment, dispatcher |
| CREATE | `lib/hooks/tms/use-dispatch.ts` | `useDispatchLoads(filters)`, `useUpdateLoadStatus()`, optimistic updates |
| CREATE | `lib/types/dispatch.ts` | Dispatch board types |

**Design specs:** `04-tms-core/08-dispatch-board.md`

**API endpoints:**
- `GET /loads` (grouped by status for board view)
- `GET /loads/stats`
- `PATCH /loads/:id/status`

**Design system reuse:** StatusBadge, StatusDot, FilterBar, DateRangePicker, SearchInput
**New files:** 7
**Parallelizable:** Both developers can split — data layer vs UI components

---

### Session 23: Dispatch Board — Drag-Drop + Real-Time + Polish
**Phase:** 4 (TMS-011c, TMS-011d, TMS-011e) | **Category:** page-build | **Effort:** 24–34h

> **HIGHEST RISK SESSION.** Both developers should pair on this.

**Components to modify/create:**
| Action | File | Description |
|--------|------|-------------|
| MODIFY | `components/tms/dispatch/dispatch-board.tsx` | Add DndContext, SortableContext from @dnd-kit |
| MODIFY | `components/tms/dispatch/dispatch-lane.tsx` | Add droppable zone |
| MODIFY | `components/tms/dispatch/dispatch-card.tsx` | Add useSortable/useDraggable |
| CREATE | `lib/utils/dispatch-transitions.ts` | Valid status transition map + validation logic |
| CREATE | `lib/hooks/tms/use-dispatch-ws.ts` | WebSocket subscription for real-time status changes |
| CREATE | `components/tms/dispatch/dispatch-bulk-actions.tsx` | Bulk status change, bulk carrier assign |

**Design specs:** `04-tms-core/08-dispatch-board.md`, WebSocket standards doc

**API endpoints:**
- `PATCH /loads/:id/status` (drag-drop triggers)
- `POST /loads/:id/dispatch`
- WebSocket `/dispatch` namespace events

**Design system reuse:** BulkActionBar, AlertBanner, ConfirmDialog
**New files:** 3 new + 3 modifications
**Parallelizable:** No — PAIR PROGRAMMING session. Depends on Sessions 21 + 22.

**Fallback:** If behind schedule, ship with button-based status changes (no drag-drop), upgrade later.

---

### Session 24: Operations Dashboard
**Phase:** 4 (TMS-012) | **Category:** page-build | **Effort:** 9h

**Components to create:**
| Action | File | Description |
|--------|------|-------------|
| CREATE | `app/(dashboard)/operations/page.tsx` | Operations dashboard page |
| CREATE | `components/tms/dashboard/operations-dashboard.tsx` | KPI row + charts + alerts + activity feed |
| CREATE | `components/tms/dashboard/ops-kpi-row.tsx` | Active loads, in-transit, late, needs attention |
| CREATE | `components/tms/dashboard/ops-charts.tsx` | Loads-by-status bar chart, revenue trend line |
| CREATE | `components/tms/dashboard/ops-alerts.tsx` | Active alerts/exceptions panel |
| CREATE | `components/tms/dashboard/ops-activity-feed.tsx` | Recent activity timeline |
| CREATE | `lib/hooks/tms/use-ops-dashboard.ts` | Dashboard data hooks |

**Design specs:** `04-tms-core/01-operations-dashboard.md`

**API endpoints:**
- `GET /operations/dashboard`
- `GET /operations/dashboard/charts`
- `GET /operations/dashboard/alerts`
- `GET /operations/dashboard/activity`
- `GET /operations/dashboard/needs-attention`

**Design system reuse:** KpiCard, StatsBar, StatItem, Timeline, AlertBanner, PageHeader
**New files:** 7
**Parallelizable:** Yes — Dev B on this while Dev A on Session 22/23

---

## PHASE 5 — Load Board + Tracking (Weeks 11–13)

### Session 25: Tracking Map (Live GPS)
**Phase:** 5 (TMS-013) | **Category:** page-build | **Effort:** 12h

**Components to create:**
| Action | File | Description |
|--------|------|-------------|
| CREATE | `app/(dashboard)/operations/tracking/page.tsx` | Tracking map page |
| CREATE | `components/tms/tracking/tracking-map.tsx` | Google Maps with live GPS pins, auto-refresh 30s |
| CREATE | `components/tms/tracking/tracking-sidebar.tsx` | In-transit loads list, click to center map |
| CREATE | `components/tms/tracking/tracking-pin.tsx` | Custom map marker with load info tooltip |
| CREATE | `components/tms/tracking/tracking-route-overlay.tsx` | Route path overlay |

**Design specs:** `04-tms-core/10-tracking-map.md`

**API endpoints:**
- `GET /operations/tracking/positions` (all in-transit)
- `GET /operations/tracking/positions/:loadId` (single load history)
- WebSocket `/tracking`: load:location:updated

**Design system reuse:** StatusBadge, SearchInput, FilterBar
**New files:** 5
**Parallelizable:** Yes — Dev A on this, Dev B on Session 26

---

### Session 26: Load Board Dashboard + Post Load + Search
**Phase:** 5 (LB-001, LB-002, LB-003) | **Category:** page-build | **Effort:** 12h

**Components to create:**
| Action | File | Description |
|--------|------|-------------|
| CREATE | `app/(dashboard)/load-board/page.tsx` | Dashboard with KPIs |
| CREATE | `components/load-board/load-board-dashboard.tsx` | Active postings, pending bids, covered today, avg time-to-cover |
| CREATE | `app/(dashboard)/load-board/post/page.tsx` | Post new load form |
| CREATE | `components/load-board/load-posting-form.tsx` | Origin/dest, equipment, weight, rate, windows |
| CREATE | `app/(dashboard)/load-board/search/page.tsx` | Available loads search |
| CREATE | `components/load-board/load-search-form.tsx` | Origin radius, dest, equipment, date range |
| CREATE | `components/load-board/load-board-grid.tsx` | Search results grid |
| CREATE | `components/load-board/load-posting-card.tsx` | Card: origin→dest, rate, equipment, bid count |
| CREATE | `components/load-board/posting-status-badge.tsx` | StatusBadge for posting states |
| CREATE | `lib/hooks/load-board/use-load-board.ts` | All load board hooks |
| CREATE | `lib/types/load-board.ts` | LoadPosting, Bid, CarrierMatch types |

**Design specs:** `07-load-board/01-load-board.md`, `07-load-board/02-post-load.md`

**API endpoints:**
- `GET /load-board/dashboard`
- `GET/POST /load-board/postings`
- `GET /load-board/available`
- `POST /load-board/capacity-search`

**Design system reuse:** KpiCard, StatsBar, FilterBar, SearchInput, DateRangePicker, PageHeader, RouteCard
**New files:** 11
**Parallelizable:** Yes — Dev B on this, Dev A on Session 25

---

### Session 27: Posting Detail + Bids + Carrier Matches
**Phase:** 5 (LB-004, LB-005) | **Category:** page-build | **Effort:** 10–11h

**Components to create:**
| Action | File | Description |
|--------|------|-------------|
| CREATE | `app/(dashboard)/load-board/postings/[id]/page.tsx` | Posting detail with bids |
| CREATE | `components/load-board/load-posting-detail.tsx` | Full posting data + inline bid list |
| CREATE | `components/load-board/carrier-bids-table.tsx` | Bids with accept/reject/counter actions |
| CREATE | `components/load-board/bid-card.tsx` | Carrier, rate, transit time, scorecard |
| CREATE | `components/load-board/carrier-match-card.tsx` | Suggested carrier + match score + tender button |
| CREATE | `components/load-board/counter-offer-dialog.tsx` | Counter-offer modal |
| CREATE | `lib/hooks/load-board/use-bids.ts` | Bid CRUD + accept/reject/counter hooks |

**Design specs:** `07-load-board/03-load-matching.md`

**API endpoints:**
- `GET /load-board/postings/:id`
- `GET /load-board/postings/:id/bids`
- `POST /load-board/postings/:id/bids/:bidId/accept`, `/reject`, `/counter`
- `GET /load-board/postings/:id/matches`
- `POST /load-board/postings/:id/tender`

**Design system reuse:** InfoGrid, FieldList, StatusBadge, SlidePanel, QuickActions, ConfirmDialog, PageHeader
**New files:** 7
**Parallelizable:** No — depends on Session 26 (shared hooks/types)

---

### Session 28: Rate Confirmation + Sales Rate Tables + Accessorials
**Phase:** 5 (TMS-014) + Sales add-ons | **Category:** page-build | **Effort:** 14–16h

**Components to create:**
| Action | File | Description |
|--------|------|-------------|
| CREATE | `components/tms/documents/rate-confirmation.tsx` | PDF preview (react-pdf or iframe) |
| CREATE | `components/tms/documents/rate-confirmation-actions.tsx` | Download, email-to-carrier, print |
| CREATE | `app/(dashboard)/sales/rate-tables/page.tsx` | Rate tables list (ListPage) |
| CREATE | `components/sales/rate-tables/rate-tables-table.tsx` | Name, type, status, entry count |
| CREATE | `app/(dashboard)/sales/rate-tables/[id]/edit/page.tsx` | Rate table editor |
| CREATE | `components/sales/rate-tables/rate-table-editor.tsx` | Inline-editable grid for rate entries |
| CREATE | `app/(dashboard)/sales/accessorials/page.tsx` | Accessorial charges list |
| CREATE | `components/sales/accessorials/accessorials-table.tsx` | List with toggle enable/disable |
| CREATE | `components/sales/accessorials/accessorial-form.tsx` | Create/edit modal |
| CREATE | `lib/hooks/sales/use-rate-tables.ts` | Rate table CRUD hooks |
| CREATE | `lib/hooks/sales/use-accessorials.ts` | Accessorial CRUD hooks |

**Design specs:** `03-sales/05-rate-tables.md`, `03-sales/06-rate-table-editor.md`, `03-sales/08-accessorial-charges.md`

**API endpoints:**
- `GET /loads/:id/rate-confirmation` (PDF)
- `GET/POST/PUT/DELETE /rate-tables`, `/rate-tables/:id`
- `POST /rate-tables/:id/entries`, `/rate-tables/:id/import`
- `GET/POST /accessorials`, `PATCH /accessorials/:id/toggle`

**Design system reuse:** DataTable, FilterBar, StatusBadge, PageHeader, UploadZone
**New files:** 11
**Parallelizable:** Yes — Dev A on rate confirmation, Dev B on rate tables + accessorials

---

## PHASE 6 — Financial + Go-Live (Weeks 14–16)

### Session 29: Accounting Dashboard + Invoices
**Phase:** 6 (ACC-001, ACC-002) | **Category:** page-build | **Effort:** 13h

**Components to create:**
| Action | File | Description |
|--------|------|-------------|
| CREATE | `app/(dashboard)/accounting/page.tsx` | Accounting dashboard |
| CREATE | `components/accounting/accounting-dashboard.tsx` | KPIs: AR/AP balance, overdue, DSO, cash collected |
| CREATE | `app/(dashboard)/accounting/invoices/page.tsx` | Invoices list (ListPage) |
| CREATE | `components/accounting/invoices-table.tsx` | Invoice #, customer, amount, status, due date, age |
| CREATE | `app/(dashboard)/accounting/invoices/[id]/page.tsx` | Invoice detail (DetailPage) |
| CREATE | `components/accounting/invoice-detail-card.tsx` | Line items, payment history, PDF preview |
| CREATE | `app/(dashboard)/accounting/invoices/new/page.tsx` | Invoice create form |
| CREATE | `components/accounting/invoice-form.tsx` | Customer + load selector, line items, totals |
| CREATE | `components/accounting/invoice-status-badge.tsx` | 8 invoice states |
| CREATE | `components/accounting/accounting-filters.tsx` | Status, date range, customer filters |
| CREATE | `lib/hooks/accounting/use-invoices.ts` | Invoice CRUD + send/void |
| CREATE | `lib/hooks/accounting/use-accounting-dashboard.ts` | Dashboard hooks |
| CREATE | `lib/types/accounting.ts` | Invoice, Payment, Settlement types |

**Design specs:** `06-accounting/01-accounting-dashboard.md`, `06-accounting/02-invoices-list.md`, `06-accounting/03-invoice-detail.md`, `06-accounting/04-invoice-entry.md`

**API endpoints:**
- `GET /accounting/dashboard`
- `GET/POST /invoices`, `GET/PUT/DELETE /invoices/:id`
- `PATCH /invoices/:id/status`, `POST /invoices/:id/send`, `/void`, `/pdf`

**Design system reuse:** KpiCard, StatsBar, DataTable, FilterBar, StatusBadge, PageHeader, SlidePanel, PanelTabs, InfoGrid, FinanceBreakdown, DateRangePicker
**New files:** 13
**Parallelizable:** Yes — Dev A on this, Dev B on Session 31

---

### Session 30: Payments + Settlements + Aging
**Phase:** 6 (ACC-003, ACC-004, ACC-005, ACC-006) | **Category:** page-build | **Effort:** 17h

**Components to create:**
| Action | File | Description |
|--------|------|-------------|
| CREATE | `app/(dashboard)/accounting/payments/page.tsx` | Payments received list |
| CREATE | `components/accounting/payments-table.tsx` | Amount, customer, date, method, allocated invoices |
| CREATE | `components/accounting/payment-allocation.tsx` | Grid to allocate payment across invoices |
| CREATE | `app/(dashboard)/accounting/payables/page.tsx` | Carrier payables list |
| CREATE | `components/accounting/payables-table.tsx` | Carrier, loads, amount owed, status |
| CREATE | `app/(dashboard)/accounting/settlements/page.tsx` | Settlements list |
| CREATE | `components/accounting/settlement-table.tsx` | Carrier, period, amount, status, payout method |
| CREATE | `app/(dashboard)/accounting/settlements/[id]/page.tsx` | Settlement detail |
| CREATE | `components/accounting/settlement-detail-card.tsx` | Grouped payables, approve/process |
| CREATE | `app/(dashboard)/accounting/aging/page.tsx` | Aging reports |
| CREATE | `components/accounting/aging-report.tsx` | Bucket visualization (0-30, 31-60, 61-90, 90+) |
| CREATE | `lib/hooks/accounting/use-payments.ts` | Payment CRUD + allocate |
| CREATE | `lib/hooks/accounting/use-settlements.ts` | Settlement CRUD + approve/process |

**Design specs:** `06-accounting/07-payments-received.md`, `06-accounting/05-carrier-payables.md`, `06-accounting/08-payments-made.md`, `06-accounting/14-ar-aging-report.md`

**API endpoints:**
- `GET/POST /payments-received`, `POST /payments-received/:id/allocate`
- `GET/POST /payments-made`, `POST /payments-made/:id/process`
- `GET/POST /settlements`, `POST /settlements/:id/approve`, `/process`
- `GET /accounting/aging`

**Design system reuse:** DataTable, FilterBar, StatusBadge, PageHeader, InfoGrid, FinanceBreakdown, KpiCard, ConfirmDialog
**New files:** 13
**Parallelizable:** No — depends on Session 29 (shared accounting types)

---

### Session 31: Commission Dashboard + Sales Reps + Plans
**Phase:** 6 (COM-001, COM-002, COM-003) | **Category:** page-build | **Effort:** 13h

**Components to create:**
| Action | File | Description |
|--------|------|-------------|
| CREATE | `app/(dashboard)/commissions/page.tsx` | Commission dashboard |
| CREATE | `components/commissions/commission-dashboard-stats.tsx` | Pending total, paid MTD/YTD, avg rate, top reps |
| CREATE | `app/(dashboard)/commissions/reps/page.tsx` | Sales reps list |
| CREATE | `components/commissions/rep-commissions-table.tsx` | Name, plan, pending, MTD, YTD |
| CREATE | `app/(dashboard)/commissions/reps/[id]/page.tsx` | Rep detail + transaction history |
| CREATE | `components/commissions/rep-commission-detail.tsx` | Summary + assign plan button |
| CREATE | `app/(dashboard)/commissions/plans/page.tsx` | Plans list |
| CREATE | `components/commissions/commission-plan-card.tsx` | Plan name, type, tiers, active status |
| CREATE | `app/(dashboard)/commissions/plans/new/page.tsx` | Plan create/edit form |
| CREATE | `components/commissions/commission-plan-form.tsx` | Plan type selector + tier editor |
| CREATE | `components/commissions/tier-editor.tsx` | Dynamic tier rows: min/max margin + rate |
| CREATE | `lib/hooks/commissions/use-commissions.ts` | Dashboard, reps, plans hooks |
| CREATE | `lib/types/commissions.ts` | Plan, Rep, Transaction, Payout types |

**Design specs:** `08-commission/01-commission-dashboard.md`, `08-commission/02-commission-plans.md`, `08-commission/03-plan-editor.md`

**API endpoints:**
- `GET /commissions/dashboard`
- `GET /commissions/reps`, `GET /commissions/reps/:id`, `POST /commissions/reps/:id/plan`
- `GET/POST /commissions/plans`, `GET/PUT/DELETE /commissions/plans/:id`, `POST /commissions/plans/:id/activate`

**Design system reuse:** KpiCard, StatsBar, DataTable, FilterBar, StatusBadge, PageHeader, InfoGrid, FieldList
**New files:** 13
**Parallelizable:** Yes — Dev B on this, Dev A on Session 29

---

### Session 32: Commission Transactions + Payouts + Sales Dashboard
**Phase:** 6 (COM-004, COM-005, COM-006 + Sales Dashboard) | **Category:** page-build | **Effort:** 14h

**Components to create:**
| Action | File | Description |
|--------|------|-------------|
| CREATE | `app/(dashboard)/commissions/transactions/page.tsx` | Transaction list |
| CREATE | `components/commissions/transactions-table.tsx` | Order ref, rep, amount, approve/void |
| CREATE | `app/(dashboard)/commissions/payouts/page.tsx` | Payout list |
| CREATE | `components/commissions/payout-table.tsx` | Rep, amount, period, status, method |
| CREATE | `components/commissions/payout-detail.tsx` | Transaction breakdown |
| CREATE | `components/commissions/earnings-chart.tsx` | Rep earnings by month |
| CREATE | `components/commissions/commission-reports.tsx` | Rep comparison, plan usage, payout summary |
| CREATE | `app/(dashboard)/sales/page.tsx` | Sales dashboard |
| CREATE | `components/sales/sales-dashboard.tsx` | KPIs, pipeline kanban, win/loss charts |
| CREATE | `lib/hooks/sales/use-sales-dashboard.ts` | Sales dashboard hooks |
| CREATE | `lib/hooks/commissions/use-payouts.ts` | Payout CRUD + process |

**Design specs:** `08-commission/05-commission-statements.md`, `08-commission/06-payout-history.md`, `03-sales/01-sales-dashboard.md`

**API endpoints:**
- `GET /commissions/transactions`, `POST /commissions/transactions/:id/approve`, `/void`
- `GET/POST /commissions/payouts`, `POST /commissions/payouts/:id/process`
- `GET /sales/dashboard`, `/dashboard/charts`, `/dashboard/pipeline`

**Design system reuse:** DataTable, StatusBadge, KpiCard, StatsBar, PageHeader, InfoGrid, FinanceBreakdown, ConfirmDialog
**New files:** 11
**Parallelizable:** Yes — Dev A (commission txns/payouts) + Dev B (sales dashboard)

---

## Parallel Execution Map

| Week | Dev A (Claude Code) | Dev B (Codex/Gemini) |
|------|--------------------|--------------------|
| 1 | Session 1 (CRM bugs) | Session 2 (Dashboard wiring) |
| 2 | Session 3 (Tokens — PAIR) | Session 3 (shadcn installs) |
| 2 | Session 4 (DataGrid/FilterBar) | Session 5 (Skeletons) |
| 3 | Session 6 (Page patterns) | Session 7 (DateRangePicker + StopList) |
| 4 | Session 8 (Carrier refactor) | Session 9 (Carrier tests) |
| 5 | Session 10 (Orders List) | Session 14 (Quotes List) |
| 5 | Session 11 (Order Detail) | Session 12 (Loads List) |
| 6 | Session 13 (Load Detail) | Session 15 (Quote Detail + Form) |
| 6 | Session 16 (Public Tracking) | — (Session 15 continued) |
| 7 | — (buffer/catch-up) | — (buffer/catch-up) |
| 8 | Session 17 (New Order Form) | Session 18 (Edit Order/Load) |
| 8 | Session 19 (New Load Form) | Session 21 (WebSocket infra) |
| 9 | Session 20 (Stops + Check Calls) | Session 24 (Ops Dashboard) |
| 9–10 | Session 22 (Dispatch Kanban) | Session 22 (Dispatch data — PAIR) |
| 10 | Session 23 (Dispatch DnD+RT — PAIR) | Session 23 (PAIR) |
| 11 | Session 25 (Tracking Map) | Session 26 (Load Board pages) |
| 12 | Session 28 (Rate Con + Rate Tables) | Session 27 (Posting Detail + Bids) |
| 13 | — (testing buffer) | — (testing buffer) |
| 14 | Session 29 (Accounting Dash + Invoices) | Session 31 (Commission Dash + Plans) |
| 15 | Session 30 (Payments + Settlements) | Session 32 (Commission Txns + Sales Dash) |
| 16 | Bug buffer + RELEASE-001 | Bug buffer + RELEASE-001 |

---

## Dependency Graph (Critical Path)

```
COMP-001 (tokens) ──> COMP-002 (StatusBadge) ──> All pages
COMP-004 (FilterBar) ──> PATT-001 (ListPage) ──> All list pages
COMP-005 (DataGrid)  ──> PATT-001 (ListPage) ──> All list pages
PATT-002 (DetailPage) ──> All detail pages
PATT-003 (FormPage)   ──> All form pages
COMP-010 (StopList)   ──> TMS-004 (Load Detail), TMS-009 (Stop Management)
INFRA-001 (WebSocket)  ──> TMS-011c/d (Dispatch real-time), TMS-013 (Tracking Map)

TMS-001 (Orders List) ──> TMS-002 (Order Detail) ──> TMS-005 (New Order Form)
TMS-003 (Loads List)  ──> TMS-004 (Load Detail) ──> TMS-007 (New Load Form)
TMS-005 + TMS-007 ──> TMS-011 (Dispatch Board)
TMS-011 (Dispatch) ──> TMS-012 (Ops Dashboard)
TMS-004 (Load Detail) ──> TMS-013 (Tracking Map)

LB-001+LB-002+LB-003 ──> LB-004+LB-005
ACC-001+ACC-002 ──> ACC-003+ACC-004+ACC-005+ACC-006
COM-001+COM-002+COM-003 ──> COM-004+COM-005+COM-006
```

---

## Auth Stub Implementation Note

Three auth stubs (RegisterForm, ForgotPasswordForm, ResetPasswordForm) are **not dedicated sessions** because they are straightforward form implementations. They fit naturally into Week 7 buffer time, adding ~5–7h. The profile stubs (ProfileForm, PasswordChangeForm, MFASettings, AvatarUpload, ActiveSessions) and settings stubs (GeneralSettingsForm, SecuritySettingsForm, NotificationSettings) are marked "Future (not MVP)" in the component audit and are **excluded** from this plan.

CRM Wave 2 (Opportunities, Activities Calendar, Territory Management, Lead Import) is also **excluded** — these are post-MVP features per the service hub file.

---

## Risk Mitigations

1. **Dispatch Board (Sessions 22–23):** Highest-risk at 40–60h. Both devs pair on Session 23. Fallback: ship with button-based status changes (no drag-drop), upgrade later.

2. **WebSocket Infrastructure (Session 21):** Must complete before dispatch/tracking real-time. Fallback: implement polling (10s interval) first, upgrade to WebSocket later.

3. **Phase 1 Gate (Session 3):** COMP-001 design tokens is a blocking gate. No Phase 2+ work begins until tokens pass 2-person review. Plan for review at end of Week 2.

4. **Week 7 + Week 13 Buffers:** Two full buffer weeks for catch-up, testing, and unexpected issues. Do not schedule new features into these unless ahead of schedule.

5. **Backend Assumptions:** All 265+ API endpoints are marked "production-ready" in hub files. If any endpoint is missing or broken during wiring, log as a bug and use mock data to unblock frontend.

---

## STATUS.md Task ID Coverage

Every STATUS.md task ID is covered by at least one session:

| Task ID | Session(s) | Phase |
|---------|-----------|-------|
| BUG-009, BUG-010 | 1 | 0 |
| BUG-008 (remainder) | 2 | 0 |
| COMP-001, COMP-002, COMP-008 | 3 | 1 |
| COMP-004, COMP-005, COMP-006 | 4 | 1 |
| COMP-003, COMP-007 | 5 | 1 |
| PATT-001, PATT-002, PATT-003 | 6 | 2 |
| COMP-009, COMP-010 | 7 | 2 |
| CARR-001, CARR-002 | 8 | 2 |
| CARR-003 | 9 | 2 |
| TMS-001 | 10 | 3 |
| TMS-002 | 11 | 3 |
| TMS-003 | 12 | 3 |
| TMS-004 | 13 | 3 |
| SALES-001 | 14 | 3 |
| SALES-002, SALES-003 | 15 | 3 |
| TMS-015, DOC-001 | 16 | 3 |
| TMS-005 | 17 | 4 |
| TMS-006, TMS-008 | 18 | 4 |
| TMS-007 | 19 | 4 |
| TMS-009, TMS-010 | 20 | 4 |
| INFRA-001 | 21 | 4 |
| TMS-011a, TMS-011b | 22 | 4 |
| TMS-011c, TMS-011d, TMS-011e | 23 | 4 |
| TMS-012 | 24 | 4 |
| TMS-013 | 25 | 5 |
| LB-001, LB-002, LB-003 | 26 | 5 |
| LB-004, LB-005 | 27 | 5 |
| TMS-014 | 28 | 5 |
| ACC-001, ACC-002 | 29 | 6 |
| ACC-003, ACC-004, ACC-005, ACC-006 | 30 | 6 |
| COM-001, COM-002, COM-003 | 31 | 6 |
| COM-004, COM-005, COM-006 | 32 | 6 |

**Non-session tasks** (testing, docs, emails, integrations, go-live):
- TEST-001a–d, COMM-001, DOC-001–003, INTEG-001, RELEASE-001, BUG-BUFFER — these are operational tasks, not component-build sessions. They run in parallel during buffer weeks.
