# Service Hub: Dashboard Shell (02)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-08 (PST-02 tribunal)
> **Original definition:** `dev_docs/02-services/` (part of auth-admin service)
> **Design specs:** `dev_docs/12-Rabih-design-Process/01-auth-admin/` (dashboard screen)
> **v2 hub (historical):** `dev_docs_v2/03-services/01.1-dashboard-shell.md`
> **Tribunal file:** `dev_docs_v3/05-audit/tribunal/per-service/batch-1-p0/PST-02-dashboard.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | A- (8.5/10) |
| **Confidence** | High — code-verified via PST-02 tribunal |
| **Last Verified** | 2026-03-08 |
| **Backend** | Production — 33+ endpoints across 6 controllers (operations, analytics, accounting, commission, carrier-portal, customer-portal) |
| **Frontend** | Substantial — 5 dashboard pages, 8+ components, 10+ hooks, all calling real APIs |
| **Tests** | None — 0% coverage on 4,225+ LOC |
| **Priority** | P1 — add soft-delete checks to 4 controllers, add unit tests for DashboardService |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Separate hub from Auth & Admin |
| Design Specs | Done | Dashboard + Operations Dashboard specs |
| Backend Controllers | Production | 6 controllers, 33+ endpoints, all auth-guarded |
| Prisma Models | N/A | Aggregates from 19 other models (read-only) |
| Frontend Pages | Production | 5 pages: `/dashboard`, `/operations`, `/accounting`, `/commissions`, `/load-board` |
| React Hooks | Production | 4 hook files, 10+ individual hooks, consistent `unwrap<T>()` pattern + WebSocket hook |
| Components | Production | 8+ components, all with loading/error/empty states |
| Tests | None | 0% coverage — P1 to add DashboardService tests |
| Security | Strong | All endpoints auth-guarded, tenant-isolated |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| Main Dashboard | `/dashboard` | Built | 7/10 | 170 LOC, 4 KPI cards via useLoadStats/useCarrierStats/useQuoteStats, 5 quick actions |
| Operations Dashboard | `/operations` | Built | 9/10 | 189 LOC, WebSocket, period controls, role-based scope, 5 child components |
| Accounting Dashboard | `/accounting` | Built | 7/10 | 98 LOC, AR/AP/DSO/revenue KPIs, recent invoices table |
| Commission Dashboard | `/commissions` | Built | 8/10 | 180 LOC, 4 KPIs, top reps table with earnings |
| Load Board Dashboard | `/load-board` | Built | 7/10 | 98 LOC, 4 KPIs (postings, bids, time to cover, coverage rate) |

---

## 4. API Endpoints

### Operations Dashboard (Primary)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/operations/dashboard` | DashboardController | Production | KPI data (role-aware, period + scope + comparison params) |
| GET | `/api/v1/operations/dashboard/charts` | DashboardController | Production | Loads by status + revenue trend |
| GET | `/api/v1/operations/dashboard/alerts` | DashboardController | Production | Active alerts (past-due ETA, no check-call, no carrier) |
| GET | `/api/v1/operations/dashboard/activity` | DashboardController | Production | Recent activity feed (last 50 StatusHistory entries) |
| GET | `/api/v1/operations/dashboard/needs-attention` | DashboardController | Production | Loads needing immediate attention |

### Analytics Dashboards (Custom/CRUD)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/analytics/dashboards` | DashboardsController | Production | List custom dashboards with widgets |
| GET | `/api/v1/analytics/dashboards/:id` | DashboardsController | Production | Get dashboard by ID |
| POST | `/api/v1/analytics/dashboards` | DashboardsController | Production | Create custom dashboard |
| PATCH | `/api/v1/analytics/dashboards/:id` | DashboardsController | Production | Update dashboard |
| DELETE | `/api/v1/analytics/dashboards/:id` | DashboardsController | Production | Soft-delete dashboard |
| POST | `/api/v1/analytics/dashboards/:id/widgets` | DashboardsController | Production | Add widget |
| PATCH | `/api/v1/analytics/dashboards/:dashboardId/widgets/:widgetId` | DashboardsController | Production | Update widget |
| DELETE | `/api/v1/analytics/dashboards/:dashboardId/widgets/:widgetId` | DashboardsController | Production | Remove widget (hard delete) |

### Accounting Dashboard
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/accounting/dashboard` | AccountingController | Production | AR, AP, overdue count, DSO, revenue MTD, cash collected |
| GET | `/api/v1/accounting/aging` | AccountingController | Production | Aging report (current, 31-60, 61-90, 91-120, 120+) |

### Commission Dashboard
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/commissions/dashboard` | CommissionsDashboardController | Production | Pending, paid MTD/YTD, avg rate, top reps |
| GET | `/api/v1/commissions/reports` | CommissionsDashboardController | Production | Earnings, plan usage, payout summary |

### Carrier Portal Dashboard
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/carrier-portal/dashboard` | CarrierPortalDashboardController | Production | Active loads, invoices, settlements, notifications |
| GET | `/api/v1/carrier-portal/dashboard/active-loads` | CarrierPortalDashboardController | Production | Top 10 non-terminal loads |
| GET | `/api/v1/carrier-portal/dashboard/payment-summary` | CarrierPortalDashboardController | Production | Total paid, balance, settlements |
| GET | `/api/v1/carrier-portal/dashboard/compliance` | CarrierPortalDashboardController | Production | Document status counts |
| GET | `/api/v1/carrier-portal/dashboard/alerts` | CarrierPortalDashboardController | Production | Expiring docs, unpaid settlements |

### Customer Portal Dashboard
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/portal/dashboard` | PortalDashboardController | Production | Shipments, quotes, balance, invoices, payments |
| GET | `/api/v1/portal/dashboard/active-shipments` | PortalDashboardController | Production | Top 10 non-terminal loads |
| GET | `/api/v1/portal/dashboard/recent-activity` | PortalDashboardController | Production | Last 20 portal activity logs |
| GET | `/api/v1/portal/dashboard/alerts` | PortalDashboardController | Production | Overdue invoices, delayed shipments |

---

## 5. Components

### Operations Dashboard Components
| Component | Path | LOC | Status | Notes |
|-----------|------|-----|--------|-------|
| OpsKPICards | `components/tms/dashboard/ops-kpi-cards.tsx` | 184 | Built | 6 KPIs (4 + 2 finance-gated), loading/error states |
| OpsCharts | `components/tms/dashboard/ops-charts.tsx` | 281 | Built | Loads by status + revenue trend, permission-gated |
| OpsAlertsPanel | `components/tms/dashboard/ops-alerts-panel.tsx` | 205 | Built | Alerts with action buttons, severity badges |
| OpsActivityFeed | `components/tms/dashboard/ops-activity-feed.tsx` | 132 | Built | Timeline with date-fns formatting |
| OpsNeedsAttention | `components/tms/dashboard/ops-needs-attention.tsx` | 224 | Built | 6-card grid of load issues |

### Other Dashboard Components
| Component | Path | LOC | Status | Notes |
|-----------|------|-----|--------|-------|
| AccDashboardStats | `components/accounting/acc-dashboard-stats.tsx` | 102 | Built | 5 KPIs with trend indicators |
| CommissionDashboardStats | `components/commissions/commission-dashboard-stats.tsx` | 88 | Built | 4 KPIs |
| LbDashboardStats | `components/load-board/lb-dashboard-stats.tsx` | 50 | Built | 4 KPIs using KpiCard |
| KPICard (shared) | `components/tms/stats/kpi-card.tsx` | - | Built | Shared across all dashboards |

---

## 6. Hooks

### Operations Dashboard Hooks (`lib/hooks/tms/use-ops-dashboard.ts`, 275 LOC)
| Hook | Endpoint | Cache | Envelope | Notes |
|------|----------|-------|----------|-------|
| `useDashboardKPIs()` | `/operations/dashboard` | 60s stale, 120s refetch | `unwrap<T>()` | Period + scope + comparison params |
| `useDashboardCharts()` | `/operations/dashboard/charts` | 120s stale, 300s refetch | `unwrap<T>()` | Period param |
| `useDashboardAlerts()` | `/operations/dashboard/alerts` | 30s stale, 60s refetch | `unwrap<T>()` | No params |
| `useDashboardActivity()` | `/operations/dashboard/activity` | 30s stale, 60s refetch | `unwrap<T>()` | Period param |
| `useNeedsAttention()` | `/operations/dashboard/needs-attention` | 30s stale, 60s refetch | `unwrap<T>()` | No params |
| `useDashboardLiveUpdates()` | WebSocket `/dispatch` | N/A | Query invalidation | Subscribes to 6 events (load, order, checkcall, notification) |

### Accounting Dashboard Hooks (`lib/hooks/accounting/use-accounting-dashboard.ts`, 106 LOC)
| Hook | Endpoint | Cache | Envelope | Notes |
|------|----------|-------|----------|-------|
| `useAccountingDashboard()` | `/accounting/dashboard` | 30s | `unwrap<T>()` | 10-field response |
| `useRecentInvoices()` | `/invoices` | 30s | `unwrap<T>()` | Includes shape mapping |

### Commission Dashboard Hook (`lib/hooks/commissions/use-commission-dashboard.ts`, 61 LOC)
| Hook | Endpoint | Cache | Envelope | Notes |
|------|----------|-------|----------|-------|
| `useCommissionDashboard()` | `/commissions/dashboard` | 30s | `unwrap<T>()` | Includes topReps array |

### Load Board Dashboard Hooks (`lib/hooks/load-board/use-loadboard-dashboard.ts`, 43 LOC)
| Hook | Endpoint | Cache | Envelope | Notes |
|------|----------|-------|----------|-------|
| `useLoadBoardDashboardStats()` | `/load-board/analytics/posts` | 60s | `unwrap<T>()` | 4-field stats |
| `useRecentPostings()` | `/load-postings` | 30s | `unwrap<T>()` | Limit + status filter |

### Main Dashboard Hooks (from other service hook files)
| Hook | File | Endpoint | Envelope | Notes |
|------|------|----------|----------|-------|
| `useLoadStats()` | `lib/hooks/tms/use-loads.ts` | `/loads/stats` | `unwrap<T>()` | Total, byStatus, revenue |
| `useCarrierStats()` | `lib/hooks/operations/use-carriers.ts` | `/operations/carriers` | Direct access | Reuses list endpoint — minor cardinality mismatch |
| `useQuoteStats()` | `lib/hooks/sales/use-quotes.ts` | `/quotes/stats` | **Manual `response.data`** | Inconsistent — should use unwrap() |

---

## 7. Business Rules

1. **Role-Aware KPIs:** Dashboard data is filtered by role. DISPATCHER sees load/dispatch metrics. SALES_REP sees quote/revenue metrics. ACCOUNTING sees invoice/payment metrics. ADMIN sees all.
2. **Real-Time Indicators:** Operations Dashboard subscribes to WebSocket `/dispatch` namespace. Invalidates query cache on load/order/checkcall/notification events. Falls back to HTTP polling (refetchInterval) if WebSocket unavailable.
3. **KPI Calculations:** Active Loads = loads WHERE status IN (DISPATCHED, AT_PICKUP, PICKED_UP, IN_TRANSIT, AT_DELIVERY). Revenue MTD = sum of invoices.total WHERE createdAt >= start of month AND status = PAID.
4. **Alert Priority:** P0 alerts (carrier insurance expired, load overdue) show as red banners. P1 alerts (check call overdue, credit hold) show as orange cards. P2 (upcoming renewal) show as yellow.
5. **Activity Feed:** Shows last 50 StatusHistory entries. Filters by role to relevant events only.
6. **Empty State:** First-time tenants see onboarding checklist instead of empty KPI cards: Add first carrier -> Create first quote -> Create first order.
7. **Finance Gating:** Operations Dashboard checks `user?.permissions?.includes('finance_view')` to conditionally show revenue and margin KPIs/charts.
8. **Comparison Periods:** KPIs include trend arrows comparing current period to comparison period (today vs yesterday, this week vs last week, this month vs last month).

---

## 8. Data Model

Dashboard aggregates from these models (read-only, no dashboard-specific models):

**Operations Dashboard:** Load, Order, StatusHistory, Stop
**Accounting Dashboard:** Invoice, PaymentMade, PaymentReceived
**Commission Dashboard:** CommissionEntry, CommissionPlan, UserCommissionAssignment, User, Load, Order, CommissionPayout
**Analytics Dashboard:** Dashboard, DashboardWidget (custom CRUD — these ARE dashboard-specific models)
**Carrier Portal:** Load, CarrierInvoiceSubmission, Settlement, CarrierPortalNotification, CarrierPortalDocument
**Customer Portal:** Load, QuoteRequest, Invoice, PortalPayment, PortalNotification, PortalActivityLog

**Total: 19 distinct models queried across all dashboard services.**

---

## 9. Validation Rules

Dashboard endpoints are mostly read-only GET requests. Validation:
- `tenantId` extracted from JWT (internal) or portal scope guard (portals) — no user input accepted
- `period` query param: enum `today | thisWeek | thisMonth` (operations dashboard)
- `scope` query param: enum `personal | team` (operations dashboard)
- `comparisonPeriod` query param: enum `yesterday | lastWeek | lastMonth` (operations dashboard)
- Analytics dashboards CRUD: standard DTO validation (name, description, layout, isPublic)

---

## 10. Status States

Dashboard has no entity state machine. It reflects aggregate states of other entities.

Exception: Analytics Dashboard model has `status: ACTIVE | INACTIVE` for custom dashboards.

---

## 11. Known Issues

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| Soft-delete gap: accounting dashboard queries don't check `deletedAt: null` | P1 BUG | **Open** | Deleted invoices inflate AR/AP/revenue KPIs |
| Soft-delete gap: commission dashboard queries don't check `deletedAt: null` | P1 BUG | **Open** | Deleted entries skew commission calculations |
| Soft-delete gap: carrier portal dashboard queries don't check `deletedAt: null` | P1 BUG | **Open** | All 5 model queries missing the check |
| Soft-delete gap: customer portal dashboard queries don't check `deletedAt: null` | P1 BUG | **Open** | All 6 model queries missing the check |
| DashboardWidget uses hard delete instead of soft delete | P2 | Open | Analytics widget removal is permanent |
| `useQuoteStats()` uses manual `response.data` instead of `unwrap()` | P2 | Open | Inconsistent with other dashboard hooks |
| WebSocket `/dispatch` namespace not yet deployed (QS-001) | P2 | Open | Operations dashboard degrades to HTTP polling |
| 0% test coverage on 4,225+ LOC | P1 | Open | DashboardService (594 LOC) has complex aggregation logic |

**Resolved Issues (closed during PST-02 tribunal):**
- ~~All KPI cards hardcoded to 0~~ — FIXED: All hooks call real APIs
- ~~useDashboard hook not calling real API~~ — FIXED: use-ops-dashboard.ts has 5 real query hooks
- ~~No loading state on dashboard cards~~ — FIXED: All ops components have Skeleton states
- ~~No error state if API fails~~ — FIXED: All ops components have red error cards with retry
- ~~Activity feed is static mock data~~ — FIXED: OpsActivityFeed calls useDashboardActivity()

---

## 12. Tasks

### Completed (verified by PST-02 tribunal)
| Task ID | Title | Status |
|---------|-------|--------|
| AUTH-104 | Wire dashboard KPIs to real API data | **Done** |
| DASH-101 | Add loading/error/empty states to all KPI cards | **Done** |
| DASH-102 | Wire activity feed to real events | **Done** |
| DASH-103 | Wire "Needs Attention" panel | **Done** |

### Open (from tribunal findings)
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| DASH-104 | Add role-aware KPI filtering | M (3h) | P2 |
| DASH-105 | Add real-time refresh (polling or WebSocket) | L (4h) | P2 (blocked by QS-001) |
| DASH-106 | Add deletedAt:null to accounting/commission/portal dashboard queries | M (3-4h) | P1 |
| DASH-107 | Add unit tests for operations DashboardService (594 LOC) | L (3-4h) | P1 |
| DASH-108 | Standardize envelope unwrapping in useQuoteStats | XS (15min) | P2 |

---

## 13. Design Links

| Screen | Spec | Path |
|--------|------|------|
| Dashboard | Full 15-section | `dev_docs/12-Rabih-design-Process/01-auth-admin/` (dashboard section) |
| Operations Dashboard | Full 15-section | `dev_docs/12-Rabih-design-Process/04-tms-core/01-operations-dashboard.md` |

---

## 14. Delta vs Original Plan

| Original Plan | Actual | Delta |
|--------------|--------|-------|
| Dashboard as part of Auth/Admin | Treated as separate service hub | Organizational split |
| 1 dashboard page with real-time KPIs | 5 dashboard pages, all with real API data | Exceeded plan |
| 5 endpoint calls (operations only) | 33+ endpoints across 6 controllers | Massively exceeded plan |
| Hub rated 5/10 | Verified 8.5/10 by PST-02 tribunal | Hub was catastrophically outdated |

---

## 15. Dependencies

**Depends on:**
- Auth & Admin (JWT for role-aware data, portal auth guards)
- TMS Core (load/order counts, alerts, needs-attention)
- Accounting (revenue KPIs, invoice stats, aging report)
- Carrier Management (compliance alerts, carrier count)
- CRM (customer count, credit holds)
- Commission (payout stats, top reps)
- Load Board (posting stats, recent postings)

**Depended on by:**
- Nothing — Dashboard is a consumer, not a provider
