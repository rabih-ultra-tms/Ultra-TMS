# Service Hub: Dashboard Shell (02)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-07
> **Original definition:** `dev_docs/02-services/` (part of auth-admin service)
> **Design specs:** `dev_docs/12-Rabih-design-Process/01-auth-admin/` (dashboard screen)
> **v2 hub (historical):** `dev_docs_v2/03-services/01.1-dashboard-shell.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | C (5/10) |
| **Confidence** | High — code confirmed |
| **Last Verified** | 2026-03-07 |
| **Backend** | Production (dashboard endpoints exist in operations module) |
| **Frontend** | Partial — shell exists, KPIs hardcoded to zeros |
| **Tests** | None |
| **Priority** | P1 within P0 sprint — wire real data |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Part of Auth & Admin service |
| Design Specs | Done | Dashboard screen spec in auth-admin folder |
| Backend Controller | Production | Operations dashboard endpoints built |
| Prisma Models | N/A | Aggregates from other services' models |
| Frontend Pages | Partial | Shell works, all KPIs show 0 |
| React Hooks | Partial | `useDashboard` — exists but returns hardcoded |
| Components | Partial | KPI cards, charts — connected to stub data |
| Tests | None | No tests for dashboard |
| Security | Good | Protected by JwtAuthGuard |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| Main Dashboard | `/dashboard` | Partial | 5/10 | Shell built, KPIs hardcoded to zeros |
| Operations Dashboard | `/operations` | Not Built | 0/10 | Separate from main; see TMS Core hub |

---

## 4. API Endpoints

| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/operations/dashboard` | OperationsController | Production | KPI data (role-aware: loads, orders, revenue) |
| GET | `/api/v1/operations/dashboard/charts` | OperationsController | Production | Chart data (loads by status, revenue trend) |
| GET | `/api/v1/operations/dashboard/alerts` | OperationsController | Production | Active alerts/exceptions |
| GET | `/api/v1/operations/dashboard/activity` | OperationsController | Production | Recent activity feed |
| GET | `/api/v1/operations/dashboard/needs-attention` | OperationsController | Production | Loads needing immediate attention |

**Note:** Dashboard uses data from multiple services. All 5 endpoints are production-ready. Frontend just needs to call them.

---

## 5. Components

| Component | Path | Status | Shared? |
|-----------|------|--------|---------|
| OpsKPICards | `components/tms/dashboard/ops-kpi-cards.tsx` | Built | No |
| OpsCharts | `components/tms/dashboard/ops-charts.tsx` | Built | No |
| OpsAlertsPanel | `components/tms/dashboard/ops-alerts-panel.tsx` | Built | No |
| OpsActivityFeed | `components/tms/dashboard/ops-activity-feed.tsx` | Built | No |
| OpsNeedsAttention | `components/tms/dashboard/ops-needs-attention.tsx` | Built | No |
| KPICard (shared) | `components/tms/stats/kpi-card.tsx` | Built | Yes |

---

## 6. Hooks

| Hook | Endpoints Used | Envelope Unwrapped? | Notes |
|------|---------------|---------------------|-------|
| `useDashboard` | `/operations/dashboard` | No — BUG | Returns hardcoded 0s; needs API wire-up |
| `useDashboardCharts` | `/operations/dashboard/charts` | Not connected | Hook may not exist yet |
| `useDashboardAlerts` | `/operations/dashboard/alerts` | Not connected | Hook may not exist yet |

---

## 7. Business Rules

1. **Role-Aware KPIs:** Dashboard data is filtered by role. DISPATCHER sees load/dispatch metrics. SALES_REP sees quote/revenue metrics. ACCOUNTING sees invoice/payment metrics. ADMIN sees all.
2. **Real-Time Indicators:** "Needs Attention" section auto-refreshes every 30 seconds. Overdue check calls, expired insurance, credit-held customers must surface without page reload.
3. **KPI Calculations:** Active Loads = loads WHERE status IN (DISPATCHED, AT_PICKUP, PICKED_UP, IN_TRANSIT, AT_DELIVERY). Revenue MTD = sum of invoices.total WHERE createdAt >= start of month AND status = PAID.
4. **Alert Priority:** P0 alerts (carrier insurance expired, load overdue) show as red banners. P1 alerts (check call overdue, credit hold) show as orange cards. P2 (upcoming renewal) show as yellow.
5. **Activity Feed:** Shows last 20 system events across all user actions: load created, carrier assigned, invoice paid, etc. Filters by role to relevant events only.
6. **Empty State:** First-time tenants see onboarding checklist instead of empty KPI cards: Add first carrier → Create first quote → Create first order.

---

## 8. Data Model

Dashboard aggregates from these models (read-only, no dashboard-specific models):
- `Load` (count by status, revenue)
- `Order` (count by status)
- `Invoice` (MTD revenue, outstanding)
- `Carrier` (count, compliance issues)
- `Customer` (count, credit holds)
- `CheckCall` (overdue alerts)

---

## 9. Validation Rules

Dashboard endpoints are read-only GET requests. Only validation:
- `tenantId` extracted from JWT — no user input accepted
- `dateRange` query params: valid ISO dates, max 90-day range
- `role` filter: derived from JWT claims, never from request body

---

## 10. Status States

Dashboard has no entity state machine. It reflects aggregate states of other entities.

---

## 11. Known Issues

| Issue | Severity | File | Status |
|-------|----------|------|--------|
| All KPI cards hardcoded to 0 | P0 UX | `(dashboard)/dashboard/page.tsx` | Open |
| `useDashboard` hook not calling real API | P0 | `lib/hooks/useDashboard.ts` (or missing) | Open |
| No loading state on dashboard cards | P1 UX | `components/dashboard/kpi-card.tsx` | Open |
| No error state if API fails | P1 UX | Dashboard page | Open |
| Activity feed is static mock data | P1 UX | `components/dashboard/activity-feed.tsx` | Open |

---

## 12. Tasks

### Quality Sprint (Active)
| Task ID | Title | Effort | Status |
|---------|-------|--------|--------|
| AUTH-104 | Wire dashboard KPIs to real API data | M (2-3h) | Open |

### Backlog
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| DASH-101 | Add loading/error/empty states to all KPI cards | S (1-2h) | P1 |
| DASH-102 | Wire activity feed to real events | M (2h) | P1 |
| DASH-103 | Wire "Needs Attention" panel | M (2h) | P1 |
| DASH-104 | Add role-aware KPI filtering | M (3h) | P2 |
| DASH-105 | Add real-time refresh (polling or WebSocket) | L (4h) | P2 |

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
| Real-time KPIs from day 1 | Hardcoded zeros shipped | Implementation debt |
| 5 endpoint calls | Endpoints exist, frontend not calling them | Wire-up gap |

---

## 15. Dependencies

**Depends on:**
- Auth & Admin (JWT for role-aware data)
- TMS Core (load/order counts, alerts)
- Accounting (revenue KPIs, invoice stats)
- Carrier Management (compliance alerts, carrier count)
- CRM (customer count, credit holds)

**Depended on by:**
- Nothing — Dashboard is a consumer, not a provider
