# Analytics Module API Spec

**Module:** `apps/api/src/modules/analytics/`
**Base path:** `/api/v1/`
**Controllers:** AlertsController, SavedViewsController, DataQueryController (all in alerts.controller.ts), DashboardsController, KpisController, ReportsController

## Auth

All controllers use `@UseGuards(JwtAuthGuard)` with `@CurrentTenant()` and `@CurrentUser('id')`. No RolesGuard on any controller.

---

## AlertsController

**Path prefix:** `analytics/alerts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/analytics/alerts` | JWT only | List analytics alerts |
| POST | `/analytics/alerts` | JWT only | Create analytics alert |
| GET | `/analytics/alerts/:id` | JWT only | Get alert by ID |
| PUT | `/analytics/alerts/:id` | JWT only | Update alert |
| DELETE | `/analytics/alerts/:id` | JWT only | Delete alert |

---

## SavedViewsController

**Path prefix:** `analytics/saved-views`
**Note:** Defined in same file as AlertsController (alerts.controller.ts)

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/analytics/saved-views` | JWT only | List saved views |
| POST | `/analytics/saved-views` | JWT only | Create saved view |
| GET | `/analytics/saved-views/:id` | JWT only | Get saved view by ID |
| PUT | `/analytics/saved-views/:id` | JWT only | Update saved view |
| DELETE | `/analytics/saved-views/:id` | JWT only | Delete saved view |

---

## DataQueryController

**Path prefix:** `analytics/query`
**Note:** Defined in same file as AlertsController (alerts.controller.ts)

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | `/analytics/query` | JWT only | Execute data query |
| GET | `/analytics/query/saved` | JWT only | List saved queries |

---

## DashboardsController

**Path prefix:** `analytics/dashboards`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/analytics/dashboards` | JWT only | List dashboards |
| POST | `/analytics/dashboards` | JWT only | Create dashboard |
| GET | `/analytics/dashboards/:id` | JWT only | Get dashboard by ID |
| PUT | `/analytics/dashboards/:id` | JWT only | Update dashboard |
| DELETE | `/analytics/dashboards/:id` | JWT only | Delete dashboard |
| GET | `/analytics/dashboards/:id/widgets` | JWT only | List dashboard widgets |
| POST | `/analytics/dashboards/:id/widgets` | JWT only | Add widget to dashboard |
| PUT | `/analytics/dashboards/:id/widgets/:widgetId` | JWT only | Update widget |
| DELETE | `/analytics/dashboards/:id/widgets/:widgetId` | JWT only | Remove widget |

---

## KpisController

**Path prefix:** `analytics/kpis`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/analytics/kpis` | JWT only | List KPIs |
| POST | `/analytics/kpis` | JWT only | Create KPI |
| GET | `/analytics/kpis/category/:category` | JWT only | List KPIs by category (KPICategory Prisma enum) |
| GET | `/analytics/kpis/:id` | JWT only | Get KPI by ID |
| PUT | `/analytics/kpis/:id` | JWT only | Update KPI |
| DELETE | `/analytics/kpis/:id` | JWT only | Delete KPI |
| GET | `/analytics/kpis/:id/values` | JWT only | Get KPI values |
| POST | `/analytics/kpis/:id/calculate` | JWT only | Calculate KPI value |

---

## ReportsController

**Path prefix:** `analytics/reports`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/analytics/reports` | JWT only | List reports |
| POST | `/analytics/reports` | JWT only | Create report |
| GET | `/analytics/reports/:id` | JWT only | Get report by ID |
| PUT | `/analytics/reports/:id` | JWT only | Update report |
| DELETE | `/analytics/reports/:id` | JWT only | Delete report |
| POST | `/analytics/reports/:id/schedule` | JWT only | Schedule report |
| POST | `/analytics/reports/:id/execute` | JWT only | Execute report |
| GET | `/analytics/reports/:id/executions` | JWT only | List report executions |

---

## Known Issues

- Three controller classes in a single file (alerts.controller.ts) -- violates one-class-per-file convention
- No RolesGuard on any controller -- all endpoints accessible to any authenticated user
