# SERVICE TRIBUNAL: Dashboard Shell (02)

> **Filed:** 2026-03-08
> **Hub File:** `dev_docs_v3/01-services/p0-mvp/02-dashboard.md`
> **Tier:** P0-MVP
> **Audit Depth:** DEEP (full 5-phase + 5-round tribunal)

---

## Phase 1: Hub File Verification

### 1A. Status Box Accuracy

| Field | Hub Claim | Verified Finding | Verdict |
| ----- | --------- | ---------------- | ------- |
| Health Score | C (5/10) | **Should be A- (8.5/10)** — Operations dashboard is production-quality, main dashboard is solid, all hooks use real APIs | **FALSE (+3.5)** |
| Confidence | High — code confirmed | Accurate | ACCURATE |
| Last Verified | 2026-03-07 | Timestamp accurate, but claims not verified against code | ACCURATE |
| Backend | Production (dashboard endpoints exist in operations module) | **18+ endpoints** across 6 controllers (operations:5, analytics:8, accounting:2, commission:9, carrier-portal:5, customer-portal:4) | STALE |
| Frontend | Partial — shell exists, KPIs hardcoded to zeros | **Substantial** — 5 dashboard pages, 8+ components, 10+ hooks, all using real APIs. KPIs NOT hardcoded. | **FALSE** |
| Tests | None | Accurate — 0 test files for dashboard code | ACCURATE |
| Priority | P1 within P0 sprint — wire real data | Data is already wired. Priority should shift to testing and soft-delete fixes. | STALE |

**Delta:** Hub massively underrates this service. Actual health is **8.5/10**, not 5/10 (+3.5 delta — largest in audit so far). The hub was written from specs before the v2 sprint built out all dashboard functionality.

### 1B. Implementation Status — Layer by Layer

| Layer | Hub Claim | Verification Method | Actual Finding | Verdict |
| ----- | --------- | ------------------- | -------------- | ------- |
| Backend module | Operations dashboard endpoints | Glob controllers | **6 controllers** with 18+ endpoints: operations/dashboard (5), analytics/dashboards (8), accounting (2), commission (9), carrier-portal (5), customer-portal (4) | STALE |
| Frontend Pages | 1 partial page | Glob routes | **5 dashboard pages**: `/dashboard` (170 LOC), `/operations` (189 LOC), `/accounting` (98 LOC), `/commissions` (180 LOC), `/load-board` (98 LOC) | **FALSE** |
| React Hooks | useDashboard (hardcoded) | Glob hooks | **4 hook files, 10+ individual hooks**: use-ops-dashboard.ts (275 LOC, 5 queries + WebSocket), use-accounting-dashboard.ts (106 LOC, 2 queries), use-commission-dashboard.ts (61 LOC, 1 query), use-loadboard-dashboard.ts (43 LOC, 2 queries). Plus useLoadStats, useCarrierStats, useQuoteStats used by main dashboard. ALL call real APIs. | **FALSE** |
| Components | 6 listed (5 ops + 1 shared) | Glob components | **8+ components**: 5 ops (ops-kpi-cards, ops-charts, ops-alerts-panel, ops-activity-feed, ops-needs-attention) + acc-dashboard-stats + commission-dashboard-stats + lb-dashboard-stats | STALE |
| Tests | None | Glob spec files | Accurate — no test files | ACCURATE |

### 1C. Screen Verification

| Screen | Route | Hub Status | Route Exists? | Real or Stub? | Hub Quality | Verified Quality |
| ------ | ----- | ---------- | ------------- | ------------- | ----------- | ---------------- |
| Main Dashboard | `/dashboard` | Partial (5/10) | YES | **REAL** (170 LOC, 3 API hooks, 4 KPI cards, 5 quick actions) | 5/10 | **7/10 — FALSE** |
| Operations Dashboard | `/operations` | Not Built (0/10) | **YES** | **REAL** (189 LOC, WebSocket, period controls, role-based scope, 5 child components) | 0/10 | **9/10 — FALSE** |
| Accounting Dashboard | `/accounting` | Not mentioned | YES | REAL (98 LOC, 2 hooks, KPI cards, recent invoices) | N/A | 7/10 |
| Commission Dashboard | `/commissions` | Not mentioned | YES | REAL (180 LOC, 1 hook, 4 KPIs, top reps table) | N/A | 8/10 |
| Load Board Dashboard | `/load-board` | Not mentioned | YES | REAL (98 LOC, 2 hooks, 4 KPIs, recent postings) | N/A | 7/10 |

### 1D. API Endpoint Verification

Hub lists 5 endpoints. Actual: **33+ endpoints across 6 controllers.**

| Controller | Endpoint Count | Auth Guards | Tenant Isolation | Soft Delete Check | Envelope Compliant |
| ---------- | -------------- | ----------- | ---------------- | ----------------- | --------- |
| Operations/Dashboard | 5 | JwtAuthGuard + RolesGuard | Yes (CurrentTenant) | **Yes** | Yes `{ data: T }` |
| Analytics/Dashboards | 8 | JwtAuthGuard + RolesGuard | Yes | Yes | Yes `{ data: T }` |
| Accounting | 2 | JwtAuthGuard | Yes | **NO** — missing deletedAt check on invoices | Yes `{ data: T }` |
| Commission | 9 | JwtAuthGuard + RolesGuard | Yes | **NO** — missing on CommissionEntry | Yes `{ data: T }` |
| Carrier Portal | 5 | CarrierPortalAuthGuard + CarrierScopeGuard | Yes (carrierId + tenantId) | **NO** — missing on all models | Direct object |
| Customer Portal | 4 | PortalAuthGuard + CompanyScopeGuard | Yes (companyId + tenantId) | **NO** — missing on all models | Direct object |

### 1E. Hook Verification

| Hook | Hub Claim | Actual | Envelope Pattern | Verdict |
| ---- | --------- | ------ | ---------------- | ------- |
| useDashboard | "exists but returns hardcoded" | **Does not exist by that name**. Real hook file is `use-ops-dashboard.ts` with 5 query hooks + 1 WebSocket hook | `unwrap<T>()` helper | **FALSE** |
| useDashboardCharts | "Hook may not exist yet" | **EXISTS** as `useDashboardCharts()` in use-ops-dashboard.ts | `unwrap<T>()` | **FALSE** |
| useDashboardAlerts | "Hook may not exist yet" | **EXISTS** as `useDashboardAlerts()` in use-ops-dashboard.ts | `unwrap<T>()` | **FALSE** |
| useDashboardActivity | Not listed | EXISTS in use-ops-dashboard.ts | `unwrap<T>()` | MISSING |
| useNeedsAttention | Not listed | EXISTS in use-ops-dashboard.ts | `unwrap<T>()` | MISSING |
| useDashboardLiveUpdates | Not listed | EXISTS — WebSocket hook for 6 real-time events | Query invalidation | MISSING |
| useAccountingDashboard | Not listed | EXISTS in use-accounting-dashboard.ts | `unwrap<T>()` | MISSING |
| useRecentInvoices | Not listed | EXISTS in use-accounting-dashboard.ts | `unwrap<T>()` | MISSING |
| useCommissionDashboard | Not listed | EXISTS in use-commission-dashboard.ts | `unwrap<T>()` | MISSING |
| useLoadBoardDashboardStats | Not listed | EXISTS in use-loadboard-dashboard.ts | `unwrap<T>()` | MISSING |
| useLoadStats | Not listed | EXISTS in use-loads.ts — used by main dashboard | `unwrap<T>()` | MISSING |
| useQuoteStats | Not listed | EXISTS in use-quotes.ts — used by main dashboard | **Manual `response.data`** (inconsistent) | MISSING |

### 1F. Known Issues Verification

| Issue | Hub Status | Actual Status | Verdict |
| ----- | ---------- | ------------- | ------- |
| All KPI cards hardcoded to 0 | Open | **FIXED** — Main dashboard uses useLoadStats, useCarrierStats, useQuoteStats. Operations dashboard uses 5 real API hooks. | **STALE** |
| useDashboard hook not calling real API | Open | **FIXED** — use-ops-dashboard.ts calls 5 real endpoints | **STALE** |
| No loading state on dashboard cards | Open | **FIXED** — All ops components implement Skeleton loading states | **STALE** |
| No error state if API fails | Open | **FIXED** — All ops components have red error cards with retry buttons | **STALE** |
| Activity feed is static mock data | Open | **FIXED** — OpsActivityFeed calls useDashboardActivity() real API | **STALE** |

**All 5/5 known issues are stale — already resolved in code.**

---

## Phase 2: Backend Deep Dive

### 2A. Operations Dashboard Service (Primary)

**File:** `apps/api/src/modules/operations/dashboard/dashboard.service.ts` (594 LOC)

**Quality Assessment: 9/10**

Strengths:
- Proper tenant isolation with `tenantId` in all WHERE clauses
- Soft delete filtering (`deletedAt: null`) on all queries
- Role-aware scope filtering (personal vs team via `createdById`)
- Complex but well-structured aggregation logic (KPIs, charts, alerts, activity, needs-attention)
- Comparison period calculation for trend metrics
- Sparkline data generation for KPI visual trends

Issues:
- 594 LOC — approaching monolith territory but acceptable for aggregation service
- No pagination on activity feed (hardcoded `take: 50`)

### 2B. Accounting Reports Service (Dashboard)

**File:** `apps/api/src/modules/accounting/services/reports.service.ts` (281 LOC)

**Quality Assessment: 7/10**

Strengths:
- Proper tenant isolation
- DSO calculation is correct business logic
- Revenue MTD properly scoped to current month

Issues:
- **Missing `deletedAt: null`** on invoice queries — deleted invoices could inflate AR/AP figures
- No comparison period for trend metrics (unlike operations dashboard)

### 2C. Commission Dashboard Service

**File:** `apps/api/src/modules/commission/services/commissions-dashboard.service.ts` (677 LOC)

**Quality Assessment: 7.5/10**

Strengths:
- Comprehensive aggregation (pending, MTD, YTD, avg rate, top reps)
- Proper pagination on list endpoints
- Transaction approval/void workflow

Issues:
- **Missing `deletedAt: null`** on CommissionEntry queries
- 677 LOC — largest dashboard service, could benefit from method extraction
- No comparison periods

### 2D. Portal Dashboards

**Carrier Portal:** `carrier-portal/dashboard/` (114 LOC combined)
**Customer Portal:** `customer-portal/dashboard/` (109 LOC combined)

**Quality Assessment: 6.5/10** (both)

Strengths:
- Proper portal-specific auth guards (CarrierPortalAuthGuard, PortalAuthGuard)
- Scoped by carrierId/companyId + tenantId (double isolation)

Issues:
- **Missing `deletedAt: null`** on ALL queries in both portals
- DashboardWidget in analytics uses hard delete instead of soft delete
- No error handling in service methods (rely on controller-level catch)

### 2E. Auth & Tenant Isolation Summary

| Controller | Auth Guard | Roles | Tenant Source | Verdict |
| ---------- | ---------- | ----- | ------------- | ------- |
| Operations/Dashboard | JwtAuthGuard + RolesGuard | Multiple roles | @CurrentTenant() | STRONG |
| Analytics/Dashboards | JwtAuthGuard + RolesGuard | ADMIN, SALES_REP, DISPATCHER, ACCOUNTING, OPERATIONS | @CurrentTenant() | STRONG |
| Accounting | JwtAuthGuard | ADMIN, ACCOUNTING, ACCOUNTING_MANAGER, MANAGER, SUPER_ADMIN | @CurrentTenant() | STRONG |
| Commission | JwtAuthGuard + RolesGuard | ADMIN, ACCOUNTING, ACCOUNTING_MANAGER, SALES_MANAGER, SUPER_ADMIN | @CurrentTenant() | STRONG |
| Carrier Portal | CarrierPortalAuthGuard + CarrierScopeGuard | Portal user | @CurrentCarrier() | STRONG |
| Customer Portal | PortalAuthGuard + CompanyScopeGuard | Portal user | @CurrentCompany() | STRONG |

**All endpoints have proper auth. No unprotected dashboard routes.**

---

## Phase 3: Frontend Deep Dive

### 3A. Operations Dashboard — Flagship Quality

**Page:** `/operations` (189 LOC) — **9/10**

Features verified:
- SocketProvider wrapper for `/dispatch` WebSocket namespace
- Period selector (Today / This Week / This Month) with URL state
- Comparison period selector (Yesterday / Last Week / Last Month)
- Role-based scope toggle (Personal vs Team)
- 3 quick action buttons (New Order, Dispatch Board, Tracking Map)
- 5 child components with independent data fetching

**Components (all production-ready):**

| Component | LOC | API Hook | Loading | Error | Empty | Permission Check |
| --------- | --- | -------- | ------- | ----- | ----- | ---------------- |
| OpsKPICards | 184 | useDashboardKPIs | Skeleton (6) | Red card + retry | N/A (always shows) | finance_view gate |
| OpsCharts | 281 | useDashboardCharts | Skeleton | Red card + retry | Empty message | finance_view gate |
| OpsAlertsPanel | 205 | useDashboardAlerts | Skeleton | Red card + retry | "No active alerts" | None needed |
| OpsActivityFeed | 132 | useDashboardActivity | Skeleton | Red card + retry | "No recent activity" | None needed |
| OpsNeedsAttention | 224 | useNeedsAttention | Skeleton (6) | Red card + retry | "All loads on track" | None needed |

**Total ops dashboard LOC: 1,215** (page + 5 components + hooks)

### 3B. Main Dashboard — Landing Page

**Page:** `/dashboard` (170 LOC) — **7/10**

Features:
- 4 KPI cards (Total Loads, Active Carriers, Open Quotes, Revenue)
- 5 quick action links (Dispatch, New Load, Carriers, Companies, Quotes)
- Uses 3 existing hooks: useLoadStats, useCarrierStats, useQuoteStats

Issues:
- useCarrierStats may reuse a list endpoint (cardinality mismatch) — needs verification
- No period selector (always shows current state)
- No comparison/trend metrics
- Simpler than operations dashboard (intentionally — it's a landing page)

### 3C. Envelope Unwrapping Pattern

**Consistent `unwrap<T>()` helper used across 4 hook files:**
```typescript
function unwrap<T>(response: unknown): T {
  const body = response as Record<string, unknown>;
  return (body.data ?? response) as T;
}
```

**Exception:** `useQuoteStats()` in `use-quotes.ts` uses manual `response.data` access — inconsistent but functional.

**Cross-cutting finding #8 (envelope patterns) partially resolved:** Dashboard hooks use consistent unwrap pattern. The project-wide inconsistency remains but dashboard is internally consistent.

### 3D. WebSocket Integration

Operations dashboard subscribes to 6 events via `useDashboardLiveUpdates()`:
1. `load:status:changed` → invalidate KPIs, charts, activity, needs-attention
2. `load:created` → invalidate KPIs, charts, activity
3. `order:created` → invalidate activity
4. `order:status:changed` → invalidate activity
5. `checkcall:received` → invalidate alerts, activity, needs-attention
6. `notification:new` → selective alert invalidation by severity

**Note:** Depends on `/dispatch` WebSocket namespace (QS-001 task). If namespace unavailable, SocketProvider degrades gracefully — page loads via HTTP polling (refetchInterval) without real-time updates.

---

## Phase 4: Data Model Verification

Hub Section 8 states dashboard aggregates from Load, Order, Invoice, Carrier, Customer, CheckCall. This is **partially accurate**.

**Actual models queried across all dashboard services:**

| Model | Used By | Notes |
| ----- | ------- | ----- |
| Load | Operations, Carrier Portal, Customer Portal | Count, status grouping, revenue |
| Order | Operations, Commission | Count, status grouping |
| Invoice | Accounting | AR, AP, aging, revenue MTD |
| StatusHistory | Operations | Activity feed |
| Stop | Operations | Origin/destination for needs-attention |
| Settlement | Carrier Portal | Payment summary |
| CommissionEntry | Commission | Aggregation (pending, paid, avg rate) |
| CommissionPlan | Commission | Plan usage reports |
| UserCommissionAssignment | Commission | Rep-plan mapping |
| User | Commission | Rep details |
| Dashboard | Analytics | Custom dashboard CRUD |
| DashboardWidget | Analytics | Widget management |
| CarrierInvoiceSubmission | Carrier Portal | Invoice count |
| CarrierPortalNotification | Carrier Portal | Recent notifications |
| CarrierPortalDocument | Carrier Portal | Compliance status |
| QuoteRequest | Customer Portal | Quote count |
| PortalPayment | Customer Portal | Recent payments |
| PortalNotification | Customer Portal | Notifications |
| PortalActivityLog | Customer Portal | Activity feed |

Hub lists 6 models. Actual: **19 models** across all dashboard services. Hub only covers the operations dashboard's models, missing all portal and module-specific models.

---

## Phase 5: Adversarial Tribunal (5 Rounds)

### Round 1: Hub Accuracy

**Prosecution:** "The hub rates Dashboard 5/10 with 5 critical open issues. The first thing users see after login shows hardcoded zeros. This is a P0 UX failure."

**Defense:** "Every prosecution claim comes from the hub, not the code. Main dashboard calls 3 real API hooks. Operations dashboard has WebSocket integration, 5 production-quality components with loading/error/empty states, and role-based access. All 5 'open' issues are already resolved. The hub was never updated after the v2 sprint. The code quality is 8.5/10."

**Verdict:** **Defense wins.** Hub is severely outdated. All 5 claimed issues are resolved.

### Round 2: Soft-Delete Gaps

**Prosecution:** "4 of 6 dashboard controllers don't check `deletedAt: null`. Deleted invoices inflate accounting KPIs. Deleted commission entries skew payout calculations. Portal dashboards show deleted loads."

**Defense:** "Valid. The operations dashboard (primary) does check deletedAt on all queries. The accounting, commission, carrier-portal, and customer-portal dashboards don't. This is a real bug — soft-deleted records will appear in aggregation."

**Verdict:** **Prosecution wins.** Soft-delete gaps in 4 of 6 dashboard services. Medium severity — soft deletes are rare but when they happen, KPIs will be wrong.

### Round 3: Main Dashboard Quality

**Prosecution:** "Main `/dashboard` page uses `useCarrierStats` but there's a cardinality mismatch — it's reusing a list endpoint expecting a stats object. KPI counts could be wrong."

**Defense:** "The main `/dashboard` page is a simpler landing page — the real dashboard is `/operations`. The main page could benefit from dedicated stats endpoints, but this is P2 priority. The operations dashboard uses dedicated endpoints and is the primary user experience."

**Verdict:** **Draw.** Minor issue on secondary page. Operations dashboard is solid.

### Round 4: Test Coverage

**Prosecution:** "Zero tests on 4,225+ LOC (2,358 backend + 1,867 frontend). The DashboardService at 594 LOC does complex aggregation with date arithmetic, comparison periods, and multi-model joins. A single bug in KPI calculation could mislead business decisions."

**Defense:** "Dashboard is read-only aggregation — no data mutation risk. But the complex calculation logic does warrant unit tests, especially for comparison period math, on-time percentage, and revenue MTD calculations."

**Verdict:** **Prosecution wins.** 0% test coverage on complex aggregation logic is a genuine gap. Testing the service layer is high-value, low-effort.

### Round 5: WebSocket Dependency

**Prosecution:** "Operations dashboard wraps in SocketProvider for `/dispatch` namespace. QS-001 says this namespace doesn't exist. Real-time features silently fail."

**Defense:** "SocketProvider handles missing namespaces gracefully — no error, no crash. The page loads normally using HTTP polling via refetchInterval on all 5 hooks. Real-time is a degraded feature, not a broken one. It will activate automatically once QS-001 ships the `/dispatch` namespace."

**Verdict:** **Draw.** Graceful degradation is good engineering. Feature is waiting on QS-001, not broken.

---

## Final Verdict

### MODIFY — Score: 8.5/10 (was 5.0/10, delta **+3.5**)

**Largest score improvement in the audit series.** The hub was catastrophically outdated — every claim about "hardcoded zeros," "missing hooks," and "static mock data" was wrong. The dashboard is one of the better-implemented services in the project.

### Breakdown

| Area | Score | Notes |
| ---- | ----- | ----- |
| Backend Quality | 9/10 | 6 controllers, proper auth, tenant isolation, complex aggregation |
| Frontend Quality | 8.5/10 | 5 pages, 8+ components, all with loading/error/empty states |
| Hooks & Data Layer | 9/10 | 10+ hooks, consistent unwrap, WebSocket, proper caching |
| Documentation (Hub) | 2/10 | 20+ factual errors, 5/5 known issues stale, missing 4 pages |
| Test Coverage | 0/10 | Zero tests on 4,225+ LOC |
| Security | 9/10 | All endpoints auth-guarded, tenant-isolated |

### Action Items

| # | Action | Priority | Effort | Category |
| - | ------ | -------- | ------ | -------- |
| 1 | **Rewrite hub Section 1 (Status Box)** — change score from 5/10 to 8.5/10, update all status fields | P0 | 30min | Docs |
| 2 | **Rewrite hub Section 3 (Screens)** — add Operations Dashboard (9/10), update Main Dashboard to 7/10, add Accounting/Commission/Load Board dashboards | P0 | 30min | Docs |
| 3 | **Rewrite hub Section 4 (API Endpoints)** — expand from 5 to 33+ endpoints across 6 controllers | P0 | 1h | Docs |
| 4 | **Rewrite hub Section 5 (Components)** — add accounting, commission, load-board components | P0 | 30min | Docs |
| 5 | **Rewrite hub Section 6 (Hooks)** — replace 3 stale entries with 12+ actual hooks, note unwrap pattern | P0 | 30min | Docs |
| 6 | **Close all 5 known issues** in hub Section 11 — all are resolved in code | P0 | 15min | Docs |
| 7 | **Update hub Section 12 (Tasks)** — mark AUTH-104, DASH-101, DASH-102, DASH-103 as done | P0 | 15min | Docs |
| 8 | **Add `deletedAt: null` to accounting dashboard queries** — invoice aggregation may include deleted records | P1 | 1h | Bug |
| 9 | **Add `deletedAt: null` to commission dashboard queries** — CommissionEntry aggregation gap | P1 | 1h | Bug |
| 10 | **Add `deletedAt: null` to carrier portal dashboard queries** — all 5 model queries missing it | P1 | 1h | Bug |
| 11 | **Add `deletedAt: null` to customer portal dashboard queries** — all 6 model queries missing it | P1 | 1h | Bug |
| 12 | **Add unit tests for DashboardService** — KPI calculation, comparison periods, on-time %, revenue MTD | P1 | 3-4h | Testing |
| 13 | **Standardize useQuoteStats envelope pattern** — should use unwrap() like other dashboard hooks | P2 | 15min | Code |

### New Tasks Generated

| Task ID | Title | Effort | Priority |
| ------- | ----- | ------ | -------- |
| DASH-106 | Add deletedAt:null to accounting/commission/portal dashboard queries | M (3-4h) | P1 |
| DASH-107 | Add unit tests for operations DashboardService (594 LOC) | L (3-4h) | P1 |
| DASH-108 | Standardize envelope unwrapping in useQuoteStats | XS (15min) | P2 |

### Cross-Cutting Findings

1. **Soft-delete gap confirmed in 4 more controllers** (accounting, commission, carrier-portal, customer-portal) — strengthens cross-cutting finding for TRIBUNAL-12 candidate
2. **Hub quality scores off by +3.5 points** — reinforces finding #7 (scores can be wrong by 4-5 pts)
3. **Hub documents resolved bugs as "Open"** — all 5 issues resolved but hub shows Open — reinforces finding #5
4. **Hub documents phantom/missing features** — claims "hardcoded zeros" and "static mock data" that don't exist — reinforces finding #10
