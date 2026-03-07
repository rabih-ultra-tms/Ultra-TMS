# Service Hub: Analytics (19)

> **Priority:** P2 Extended | **Status:** Backend Partial, Frontend Not Built
> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-07
> **Original definition:** `dev_docs/02-services/` (Analytics service definition)
> **Design specs:** `dev_docs/12-Rabih-design-Process/18-analytics/` (11 files)
> **v2 hub (historical):** N/A

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | D (2/10) |
| **Confidence** | High — re-audited 2026-03-07, controllers + Prisma models verified |
| **Last Verified** | 2026-03-07 |
| **Backend** | Partial — 6 controllers, 40 endpoints in `apps/api/src/modules/analytics/`. Also `analytics.bak/` exists. |
| **Frontend** | Not Built — no pages, no components, no hooks |
| **Tests** | Partial — 4 spec files (alerts, dashboards, kpis, reports) |
| **Infrastructure** | Elasticsearch 8.13 running (docker-compose), Kibana at localhost:5601 |
| **Note** | `.bak` directory must be resolved (QS-009) before analytics development begins |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Analytics definition in dev_docs |
| Design Specs | Done | 11 files in `dev_docs/12-Rabih-design-Process/18-analytics/` |
| Backend — Alerts | Partial | `AlertsController` — 3 endpoints (list, acknowledge, resolve) |
| Backend — Views | Partial | `AnalyticsViewsController` — 5 endpoints (CRUD for saved views) |
| Backend — Data | Partial | `AnalyticsDataController` — 6 endpoints (dimensions, measures, query, export, trends, compare) |
| Backend — Dashboards | Partial | `DashboardsController` — 8 endpoints (CRUD + widget management) |
| Backend — KPIs | Partial | `KPIsController` — 9 endpoints (CRUD + current values, by category, calculate, values history) |
| Backend — Reports | Partial | `ReportsController` — 9 endpoints (CRUD + schedule, execute, list executions, get execution) |
| Prisma Models | Production | 9 models: Dashboard, DashboardWidget, KPIDefinition, KPISnapshot, KPIAlert, Report, ReportExecution, ReportTemplate, SavedAnalyticsView, AnalyticsCache |
| Frontend Pages | Not Built | 0 pages |
| React Hooks | Not Built | 0 hooks |
| Components | Not Built | 0 components |
| Tests | Partial | 4 backend spec files: `alerts.service.spec.ts`, `dashboards.service.spec.ts`, `kpis.service.spec.ts`, `reports.service.spec.ts` |
| Security | Unknown | Guards likely present but not runtime-verified |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| Analytics Dashboard | `/analytics` | Not Built | — | Executive overview with KPI cards, charts, period selector |
| Operations Analytics | `/analytics/operations` | Not Built | — | On-time %, detention, stop performance, load count trends |
| Financial Analytics | `/analytics/financial` | Not Built | — | Revenue, profit margin, AR/AP aging, cost breakdowns |
| Carrier Analytics | `/analytics/carriers` | Not Built | — | Carrier performance benchmarks, utilization, on-time rates |
| Customer Analytics | `/analytics/customers` | Not Built | — | Revenue by customer, retention, growth trends |
| Lane Analytics | `/analytics/lanes` | Not Built | — | Lane profitability, volume, rate trends |
| Sales Analytics | `/analytics/sales` | Not Built | — | Pipeline, conversion rates, rep performance |
| Custom Reports | `/analytics/reports` | Not Built | — | Ad-hoc report builder with saved templates |
| Scheduled Reports | `/analytics/reports/scheduled` | Not Built | — | Cron-based report delivery management |
| Data Export | — | Not Built | — | CSV, Excel, PDF export (modal/action, not standalone page) |

---

## 4. API Endpoints

### AlertsController (`@Controller('analytics/alerts')`)

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/analytics/alerts` | Partial | List alerts (filtered by status, severity) |
| POST | `/api/v1/analytics/alerts/:id/acknowledge` | Partial | Acknowledge a triggered alert |
| POST | `/api/v1/analytics/alerts/:id/resolve` | Partial | Resolve a triggered alert |

### AnalyticsViewsController (`@Controller('analytics/views')`)

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/analytics/views` | Partial | List saved views for current user |
| GET | `/api/v1/analytics/views/:id` | Partial | Get a saved view by ID |
| POST | `/api/v1/analytics/views` | Partial | Create a saved view (filters, columns, sort) |
| PATCH | `/api/v1/analytics/views/:id` | Partial | Update a saved view |
| DELETE | `/api/v1/analytics/views/:id` | Partial | Delete a saved view |

### AnalyticsDataController (`@Controller('analytics/data')`)

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/analytics/data/dimensions` | Partial | List available dimensions for queries |
| GET | `/api/v1/analytics/data/measures` | Partial | List available measures for queries |
| POST | `/api/v1/analytics/data/query` | Partial | Execute an ad-hoc analytics query |
| POST | `/api/v1/analytics/data/export` | Partial | Export query results (CSV, Excel, PDF) |
| GET | `/api/v1/analytics/data/trends/:kpiCode` | Partial | Get trend data for a specific KPI over time |
| POST | `/api/v1/analytics/data/compare` | Partial | Compare metrics across periods or entities |

### DashboardsController (`@Controller('analytics/dashboards')`)

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/analytics/dashboards` | Partial | List dashboards (own + public) |
| GET | `/api/v1/analytics/dashboards/:id` | Partial | Get dashboard with widgets |
| POST | `/api/v1/analytics/dashboards` | Partial | Create dashboard |
| PATCH | `/api/v1/analytics/dashboards/:id` | Partial | Update dashboard (name, layout, visibility) |
| DELETE | `/api/v1/analytics/dashboards/:id` | Partial | Soft delete dashboard |
| POST | `/api/v1/analytics/dashboards/:id/widgets` | Partial | Add widget to dashboard |
| PATCH | `/api/v1/analytics/dashboards/:dashboardId/widgets/:widgetId` | Partial | Update widget (position, size, config) |
| DELETE | `/api/v1/analytics/dashboards/:dashboardId/widgets/:widgetId` | Partial | Remove widget from dashboard |

### KPIsController (`@Controller('analytics/kpis')`)

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/analytics/kpis` | Partial | List KPI definitions (filterable by category) |
| GET | `/api/v1/analytics/kpis/current` | Partial | Get current values for all KPIs |
| GET | `/api/v1/analytics/kpis/category/:category` | Partial | Get KPIs by category (FINANCIAL, OPERATIONAL, etc.) |
| GET | `/api/v1/analytics/kpis/:id` | Partial | Get single KPI definition |
| GET | `/api/v1/analytics/kpis/:id/values` | Partial | Get historical KPI snapshots (date range) |
| POST | `/api/v1/analytics/kpis` | Partial | Create KPI definition |
| POST | `/api/v1/analytics/kpis/:id/calculate` | Partial | Trigger on-demand KPI calculation |
| PATCH | `/api/v1/analytics/kpis/:id` | Partial | Update KPI definition (target, warning, critical thresholds) |
| DELETE | `/api/v1/analytics/kpis/:id` | Partial | Soft delete KPI definition |

### ReportsController (`@Controller('analytics/reports')`)

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/analytics/reports` | Partial | List report definitions |
| GET | `/api/v1/analytics/reports/:id` | Partial | Get report definition |
| POST | `/api/v1/analytics/reports` | Partial | Create report definition |
| PATCH | `/api/v1/analytics/reports/:id` | Partial | Update report definition |
| PATCH | `/api/v1/analytics/reports/:id/schedule` | Partial | Set or update cron schedule + recipients |
| POST | `/api/v1/analytics/reports/:id/execute` | Partial | Execute report on-demand |
| GET | `/api/v1/analytics/reports/:id/executions` | Partial | List past executions for a report |
| GET | `/api/v1/analytics/reports/:id/executions/:executionId` | Partial | Get a specific execution result |
| DELETE | `/api/v1/analytics/reports/:id` | Partial | Soft delete report definition |

**Total: 40 endpoints across 6 controllers.**

---

## 5. Components

| Component | Path | Status | Shared? |
|-----------|------|--------|---------|
| — | — | Not Built | — |

No frontend components exist. Planned components for Phase 2 build:

| Planned Component | Purpose |
|-------------------|---------|
| KpiCard | Single KPI with value, trend arrow, sparkline |
| KpiGrid | Grid layout of KpiCards for dashboard |
| AnalyticsChart | Recharts/Nivo wrapper for line, bar, pie charts |
| DateRangePicker | Period selector with MTD/QTD/YTD/Custom presets |
| PeriodComparisonToggle | Compare current vs prior period |
| DashboardBuilder | Drag-and-drop widget layout editor |
| WidgetConfigDialog | Widget type, data source, display options |
| ReportBuilder | Ad-hoc report: select dimensions, measures, filters |
| ReportScheduleForm | Cron expression + recipients configuration |
| ExportButton | CSV/Excel/PDF export trigger |
| AlertThresholdForm | Configure KPI alert thresholds |
| TrendIndicator | Up/Down/Flat arrow with color coding |

---

## 6. Hooks

| Hook | Endpoints Used | Envelope Unwrapped? | Notes |
|------|---------------|---------------------|-------|
| — | — | — | Not Built |

Planned hooks for Phase 2 build:

| Planned Hook | Endpoint(s) | Purpose |
|--------------|-------------|---------|
| `useKpis` | GET `/analytics/kpis` | List KPI definitions |
| `useKpiCurrent` | GET `/analytics/kpis/current` | Current KPI values for dashboard |
| `useKpiValues` | GET `/analytics/kpis/:id/values` | Historical snapshots for charts |
| `useKpisByCategory` | GET `/analytics/kpis/category/:category` | Category-filtered KPIs |
| `useDashboards` | GET `/analytics/dashboards` | List user dashboards |
| `useDashboard` | GET `/analytics/dashboards/:id` | Single dashboard with widgets |
| `useCreateDashboard` | POST `/analytics/dashboards` | Mutation |
| `useUpdateDashboard` | PATCH `/analytics/dashboards/:id` | Mutation |
| `useReports` | GET `/analytics/reports` | List reports |
| `useExecuteReport` | POST `/analytics/reports/:id/execute` | Trigger report execution |
| `useReportExecutions` | GET `/analytics/reports/:id/executions` | Execution history |
| `useAlerts` | GET `/analytics/alerts` | List active alerts |
| `useAnalyticsQuery` | POST `/analytics/data/query` | Ad-hoc data queries |
| `useDataExport` | POST `/analytics/data/export` | Export mutation |
| `useSavedViews` | GET `/analytics/views` | List saved views |

---

## 7. Business Rules

1. **KPI Types:** The system tracks 7 core KPI families: revenue, profit margin, load count, on-time delivery %, carrier utilization, average revenue per load, and customer retention. Each KPI has a `targetValue`, `warningValue`, and `criticalValue` threshold defined in `KPIDefinition`.

2. **KPI Categories:** KPIs are classified into 5 categories via the `KPICategory` enum: `FINANCIAL`, `OPERATIONAL`, `CARRIER`, `CUSTOMER`, `SALES`. Each category maps to a dedicated analytics screen.

3. **KPI Aggregation:** KPIs support 6 aggregation types via `AggregationType`: `SUM`, `AVG`, `COUNT`, `MIN`, `MAX`, `RATIO`. The `sourceQuery` field in `KPIDefinition` defines how data is aggregated from source tables.

4. **Dashboard Views:** Dashboards are customizable per user and per role. Each dashboard has a `layout` (JSON grid configuration) and contains `DashboardWidget` records. Widgets reference a `KPIDefinition` and have configurable position, width, height, and refresh interval. Public dashboards (`isPublic = true`) are visible to all users in the tenant.

5. **Reports:** 6 report types are available: operations, financial, carrier, customer, lane, and sales. Reports are defined via `Report` model with `ReportType` (STANDARD, CUSTOM, AD_HOC), `sourceQuery`, `parameters` (JSON array of filter definitions), and `outputFormat` (PDF, EXCEL, CSV, JSON).

6. **Scheduled Reports:** Reports can be scheduled via `isScheduled` flag and `scheduleExpression` (cron syntax). Scheduled reports execute automatically and deliver results to configured recipients via email. Each execution is tracked in `ReportExecution` with status (PENDING, RUNNING, COMPLETED, FAILED, CANCELLED), execution time, row count, and output file URL.

7. **Report Templates:** `ReportTemplate` provides reusable templates with `queryTemplate` and `parameterDefinitions`. Templates allow users to create new reports from proven patterns without writing queries from scratch.

8. **Alerts:** Threshold-based alerts via `KPIAlert` model. Alert conditions (`AlertCondition` enum): `RATE_INCREASE`, `RATE_DECREASE`, `RATE_THRESHOLD`. When a KPI value crosses a threshold, an alert is triggered and sent to configured `notifyUsers`. Alerts support acknowledge and resolve workflows.

9. **Data Export:** Any report or dashboard data can be exported in 4 formats: CSV, Excel, PDF, JSON (via `OutputFormat` enum). Export is triggered via `POST /analytics/data/export`.

10. **Date Ranges:** All analytics queries support date range filtering with presets: MTD (month-to-date), QTD (quarter-to-date), YTD (year-to-date), and custom range. Comparison to prior period is supported via the `POST /analytics/data/compare` endpoint and `KPISnapshot.comparisonValue` field.

11. **Trend Direction:** KPI snapshots track `TrendDirection` (`UP`, `DOWN`, `FLAT`) comparing current value to prior period. This drives visual trend indicators on dashboard cards.

12. **Analytics Cache:** High-cost queries are cached via `AnalyticsCache` model with `cacheKey`, `queryHash`, `expiresAt`, and `hitCount`. Cache invalidation occurs on expiry or when source data changes.

13. **Saved Views:** Users can save custom analytics views (`SavedAnalyticsView`) with filters, columns, and sort order. Views can be public (`isPublic = true`) or private. Views are entity-type scoped via `entityType` field.

14. **Role-Based Access:** ADMIN and ACCOUNTING see all metrics. DISPATCHER sees operational metrics only. SALES_REP sees revenue and customer metrics only. No cross-tenant data exposure.

15. **Data Sources:** Analytics aggregates read-only data from: Orders, Loads, Invoices, Settlements, CheckCalls, StopEvents. The analytics module does NOT modify source data.

---

## 8. Data Model

### KPIDefinition
```
KPIDefinition {
  id              String (UUID)
  tenantId        String
  code            String (unique, e.g. "REVENUE_MTD", "OTD_RATE")
  name            String
  description     String?
  category        KPICategory (FINANCIAL, OPERATIONAL, CARRIER, CUSTOMER, SALES)
  aggregationType AggregationType (SUM, AVG, COUNT, MIN, MAX, RATIO)
  sourceQuery     String (SQL or query definition)
  unit            String? (e.g. "$", "%", "loads")
  format          String? (e.g. "currency", "percentage")
  targetValue     Decimal? (green threshold)
  warningValue    Decimal? (yellow threshold)
  criticalValue   Decimal? (red threshold)
  status          String (ACTIVE default)
  alerts          KPIAlert[]
  snapshots       KPISnapshot[]
  widgets         DashboardWidget[]
  createdAt       DateTime
  updatedAt       DateTime
  deletedAt       DateTime?
}
```

### KPISnapshot
```
KPISnapshot {
  id              String (UUID)
  tenantId        String
  kpiDefinitionId String (FK -> KPIDefinition)
  snapshotDate    DateTime (date)
  value           Decimal
  comparisonValue Decimal? (prior period value)
  trendDirection  TrendDirection? (UP, DOWN, FLAT)
  metadata        Json
  createdAt       DateTime
  updatedAt       DateTime
  deletedAt       DateTime?
}
```

### KPIAlert
```
KPIAlert {
  id              String (UUID)
  tenantId        String
  kpiDefinitionId String (FK -> KPIDefinition)
  alertName       String
  alertCondition  AlertCondition (RATE_INCREASE, RATE_DECREASE, RATE_THRESHOLD)
  thresholdValue  Decimal
  notifyUsers     Json (array of user IDs)
  isActive        Boolean (default: true)
  lastTriggeredAt DateTime?
  createdAt       DateTime
  updatedAt       DateTime
  deletedAt       DateTime?
}
```

### Dashboard
```
Dashboard {
  id          String (UUID)
  tenantId    String
  name        String
  description String?
  isPublic    Boolean (default: false)
  ownerId     String?
  layout      Json (grid configuration)
  status      String (ACTIVE default)
  widgets     DashboardWidget[]
  createdAt   DateTime
  updatedAt   DateTime
  deletedAt   DateTime?
}
```

### DashboardWidget
```
DashboardWidget {
  id              String (UUID)
  tenantId        String
  dashboardId     String (FK -> Dashboard)
  kpiDefinitionId String? (FK -> KPIDefinition)
  widgetType      String (e.g. "KPI_CARD", "LINE_CHART", "BAR_CHART", "TABLE")
  title           String?
  position        Int (display order)
  width           Int (grid columns, default: 12)
  height          Int (grid rows, default: 4)
  configuration   Json (chart config, filters, etc.)
  refreshInterval Int? (seconds)
  createdAt       DateTime
  updatedAt       DateTime
}
```

### Report
```
Report {
  id                 String (UUID)
  tenantId           String
  name               String
  description        String?
  reportType         ReportType (STANDARD, CUSTOM, AD_HOC)
  sourceQuery        String
  parameters         Json (array of parameter definitions)
  outputFormat       OutputFormat (PDF, EXCEL, CSV, JSON)
  isScheduled        Boolean (default: false)
  scheduleExpression String? (cron syntax)
  isPublic           Boolean (default: false)
  ownerId            String?
  status             String (ACTIVE default)
  executions         ReportExecution[]
  createdAt          DateTime
  updatedAt          DateTime
  deletedAt          DateTime?
}
```

### ReportExecution
```
ReportExecution {
  id              String (UUID)
  tenantId        String
  reportId        String? (FK -> Report)
  templateId      String? (FK -> ReportTemplate)
  executedAt      DateTime
  parametersUsed  Json
  status          ExecutionStatus (PENDING, RUNNING, COMPLETED, FAILED, CANCELLED)
  outputFileUrl   String?
  executionTimeMs Int?
  rowCount        Int?
  errorMessage    String?
  createdAt       DateTime
  updatedAt       DateTime
}
```

### ReportTemplate
```
ReportTemplate {
  id                   String (UUID)
  tenantId             String
  templateName         String
  reportType           String
  description          String?
  queryTemplate        String
  parameterDefinitions Json (array of param specs)
  scheduleConfig       Json?
  isActive             Boolean (default: true)
  executions           ReportExecution[]
  createdAt            DateTime
  updatedAt            DateTime
  deletedAt            DateTime?
}
```

### SavedAnalyticsView
```
SavedAnalyticsView {
  id         String (UUID)
  tenantId   String
  userId     String (FK -> User)
  viewName   String
  entityType String (e.g. "loads", "carriers", "invoices")
  filters    Json (array of filter objects)
  columns    Json (array of column configs)
  sortOrder  Json (array of sort specs)
  isPublic   Boolean (default: false)
  createdAt  DateTime
  updatedAt  DateTime
  deletedAt  DateTime?
}
```

### AnalyticsCache
```
AnalyticsCache {
  id         String (UUID)
  tenantId   String
  cacheKey   String (unique)
  queryHash  String
  resultData Json
  expiresAt  DateTime
  hitCount   Int (default: 0)
  createdAt  DateTime
  updatedAt  DateTime
}
```

---

## 9. Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| KPI `code` | Required, unique, max 100 chars, alphanumeric + underscores | "KPI code already exists" |
| KPI `category` | IsEnum(KPICategory) | "Invalid KPI category" |
| KPI `aggregationType` | IsEnum(AggregationType) | "Invalid aggregation type" |
| KPI `targetValue` | Decimal, max 14 digits | "Invalid target value" |
| Dashboard `name` | Required, max 255 chars | "Dashboard name is required" |
| Widget `widgetType` | Required, max 50 chars | "Widget type is required" |
| Widget `width` | 1-12 (grid columns) | "Width must be between 1 and 12" |
| Widget `height` | 1-12 (grid rows) | "Height must be between 1 and 12" |
| Report `name` | Required, max 255 chars | "Report name is required" |
| Report `reportType` | IsEnum(ReportType) | "Invalid report type" |
| Report `outputFormat` | IsEnum(OutputFormat) | "Invalid output format" |
| Report `scheduleExpression` | Valid cron syntax when `isScheduled = true` | "Invalid cron expression" |
| Alert `alertCondition` | IsEnum(AlertCondition) | "Invalid alert condition" |
| Alert `thresholdValue` | Decimal, required | "Threshold value is required" |
| View `viewName` | Required, max 255 chars | "View name is required" |
| View `entityType` | Required, max 100 chars | "Entity type is required" |
| Date range | `startDate` must be before `endDate` | "Start date must be before end date" |

---

## 10. Status States

### Report Execution Status Machine
```
PENDING -> RUNNING (execution starts)
RUNNING -> COMPLETED (execution finishes successfully)
RUNNING -> FAILED (execution encounters error)
PENDING -> CANCELLED (user cancels before start)
RUNNING -> CANCELLED (user cancels during execution)
```

### KPI Alert Lifecycle
```
Alert Created (isActive = true) -> Triggered (lastTriggeredAt set)
Triggered -> Acknowledged (POST /acknowledge)
Acknowledged -> Resolved (POST /resolve)
Resolved -> Re-triggered (new threshold breach)
Any state -> Disabled (isActive = false via PATCH)
```

### Dashboard Status
```
ACTIVE (default) -> visible and accessible
ACTIVE -> soft deleted (deletedAt set, hidden from lists)
```

### Report Status
```
ACTIVE (default) -> available for execution
ACTIVE -> soft deleted (deletedAt set)
```

### KPI Trend Direction
```
UP — current value > prior period value
DOWN — current value < prior period value
FLAT — current value = prior period value (within tolerance)
```

---

## 11. Known Issues

| Issue | Severity | File | Status |
|-------|----------|------|--------|
| `analytics.bak/` directory exists alongside active module | P1 | `apps/api/src/modules/analytics.bak/` | Open — QS-009 to resolve |
| All 6 controllers in 2 files (Views + Data controllers crammed into `alerts.controller.ts`) | P1 Code Quality | `alerts.controller.ts` | Open |
| No frontend pages, components, or hooks | P2 | — | Deferred to Phase 2 build |
| Backend endpoints not runtime-verified | P1 | All controllers | Open |
| Alert conditions limited to rate-based (`RATE_INCREASE`, `RATE_DECREASE`, `RATE_THRESHOLD`) — need KPI threshold conditions | P2 | Prisma enum `AlertCondition` | Open |
| No cron job runner for scheduled reports — `scheduleExpression` field exists but execution scheduler not verified | P1 | Reports module | Open |
| Cache invalidation strategy unknown — `AnalyticsCache` has `expiresAt` but no eviction service verified | P2 | `analytics/` | Open |

---

## 12. Tasks

### Quality Sprint (Active)
| Task ID | Title | Effort | Status |
|---------|-------|--------|--------|
| ANA-001 | Resolve `analytics.bak/` directory (merge or delete) | S (1h) | Open — QS-009 |
| ANA-002 | Split `alerts.controller.ts` — extract Views and Data controllers into own files | S (2h) | Open |
| ANA-003 | Runtime-verify all 40 endpoints (start server, hit each) | M (3h) | Open |

### Backlog
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| ANA-101 | Build Analytics Dashboard page (`/analytics`) — KPI cards, charts, period selector | L (8h) | P2 |
| ANA-102 | Build Operations Analytics page | L (8h) | P2 |
| ANA-103 | Build Financial Analytics page | L (8h) | P2 |
| ANA-104 | Build Carrier Analytics page | L (6h) | P2 |
| ANA-105 | Build Customer Analytics page | L (6h) | P2 |
| ANA-106 | Build Lane Analytics page | L (6h) | P2 |
| ANA-107 | Build Sales Analytics page | L (6h) | P2 |
| ANA-108 | Build Custom Reports page (report builder + templates) | XL (12h) | P2 |
| ANA-109 | Build Scheduled Reports management page | M (5h) | P2 |
| ANA-110 | Implement data export (CSV, Excel, PDF) with download | M (4h) | P2 |
| ANA-111 | Build Dashboard Builder (drag-and-drop widgets) | XL (12h) | P2 |
| ANA-112 | Implement cron-based scheduled report execution service | M (5h) | P2 |
| ANA-113 | Implement analytics cache invalidation strategy | M (4h) | P2 |
| ANA-114 | Elasticsearch indexing setup for high-volume event data | M (4h) | P2 |
| ANA-115 | Write frontend hooks (15 planned) | M (4h) | P2 |
| ANA-116 | Write frontend tests for analytics pages | L (8h) | P2 |
| ANA-117 | Extend `AlertCondition` enum for KPI threshold alerts (ABOVE, BELOW, EQUALS) | S (1h) | P2 |

---

## 13. Design Links

| Screen | Spec | Path |
|--------|------|------|
| Service Overview | Full overview | `dev_docs/12-Rabih-design-Process/18-analytics/00-service-overview.md` |
| Analytics Dashboard | Full 15-section | `dev_docs/12-Rabih-design-Process/18-analytics/01-analytics-dashboard.md` |
| Operations Analytics | Full 15-section | `dev_docs/12-Rabih-design-Process/18-analytics/02-operations-analytics.md` |
| Financial Analytics | Full 15-section | `dev_docs/12-Rabih-design-Process/18-analytics/03-financial-analytics.md` |
| Carrier Analytics | Full 15-section | `dev_docs/12-Rabih-design-Process/18-analytics/04-carrier-analytics.md` |
| Customer Analytics | Full 15-section | `dev_docs/12-Rabih-design-Process/18-analytics/05-customer-analytics.md` |
| Lane Analytics | Full 15-section | `dev_docs/12-Rabih-design-Process/18-analytics/06-lane-analytics.md` |
| Sales Analytics | Full 15-section | `dev_docs/12-Rabih-design-Process/18-analytics/07-sales-analytics.md` |
| Custom Reports | Full 15-section | `dev_docs/12-Rabih-design-Process/18-analytics/08-custom-reports.md` |
| Scheduled Reports | Full 15-section | `dev_docs/12-Rabih-design-Process/18-analytics/09-scheduled-reports.md` |
| Data Export | Full 15-section | `dev_docs/12-Rabih-design-Process/18-analytics/10-data-export.md` |

---

## 14. Delta vs Original Plan

| Original Plan | Actual | Delta |
|--------------|--------|-------|
| 4 controllers assumed | 6 controllers (Alerts, Views, Data, Dashboards, KPIs, Reports) — but Views + Data crammed into `alerts.controller.ts` | More endpoints than expected, code org issues |
| Basic overview endpoint | 40 full endpoints across 6 controller groups | Significantly more backend than expected |
| Analytics events + aggregated metrics | 10 Prisma models (KPIDefinition, KPISnapshot, KPIAlert, Dashboard, DashboardWidget, Report, ReportExecution, ReportTemplate, SavedAnalyticsView, AnalyticsCache) | Rich data model |
| No tests assumed | 4 spec files exist (alerts, dashboards, kpis, reports) | Ahead of expectations |
| Frontend expected missing | Confirmed: 0 pages, 0 components, 0 hooks | As expected |
| Elasticsearch for event data | Elasticsearch 8.13 running in docker-compose | Infrastructure ready |
| 5 design specs assumed | 11 design spec files (including service overview) | More comprehensive design coverage |
| Simple date filtering | Full date range presets (MTD/QTD/YTD/custom) + period comparison built into data model | More sophisticated |

---

## 15. Dependencies

**Depends on:**
- Auth & Admin (JWT, roles, tenantId — role-based analytics access)
- TMS Core (Orders, Loads — primary data source for operational and financial KPIs)
- Accounting (Invoices, Settlements — revenue, profit margin, AR/AP data)
- Carriers (Carrier performance, utilization, on-time delivery data)
- CRM (Customer data — retention, revenue by customer)
- Sales & Quotes (Pipeline, conversion rates, rep performance)
- Communication (email delivery for scheduled reports and alert notifications)
- Elasticsearch (high-volume event data: check calls, position updates, activity logs)
- Storage (report output file storage — PDF, Excel exports)

**Depended on by:**
- Dashboard (executive KPI cards may pull from analytics endpoints)
- Nothing else — analytics is primarily a consumer/read-only service

**`.bak` directory:**
- `apps/api/src/modules/analytics.bak/` — must be resolved via QS-009 before Phase 2 development begins. Either merge missing functionality or delete if fully superseded by current module.
