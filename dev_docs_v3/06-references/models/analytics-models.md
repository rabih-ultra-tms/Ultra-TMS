# Analytics Domain Models

> Auto-generated from `apps/api/prisma/schema.prisma` — 2026-03-07

## Models in this Domain

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| Dashboard | Custom analytics dashboards | DashboardWidget |
| DashboardWidget | Individual dashboard widgets | Dashboard, KPIDefinition |
| KPIDefinition | KPI metric definitions | KPISnapshot, KPIAlert, DashboardWidget |
| KPISnapshot | Point-in-time KPI values | KPIDefinition |
| KPIAlert | KPI threshold alerts | KPIDefinition |
| LaneAnalytics | Lane performance analytics | |
| SavedAnalyticsView | Saved report configurations | |
| AnalyticsCache | Query result caching | |

## Dashboard

Customizable analytics dashboards.

| Field | Type | Notes |
|-------|------|-------|
| name | String | VarChar(255) |
| description | String? | |
| isPublic | Boolean | @default(false) |
| ownerId | String? | FK to User |
| layout | Json | @default("{}") — grid layout config |
| status | String | @default("ACTIVE") |

## DashboardWidget

| Field | Type | Notes |
|-------|------|-------|
| dashboardId | String | FK to Dashboard |
| kpiDefinitionId | String? | FK to KPIDefinition |
| widgetType | String | VarChar(50) — CHART, TABLE, NUMBER, GAUGE |
| title | String? | |
| position | Int | @default(0) |
| width | Int | @default(12) — 12-column grid |
| height | Int | @default(4) |
| configuration | Json | Widget-specific config |
| refreshInterval | Int? | Seconds |

## KPIDefinition

Defines calculable KPI metrics.

| Field | Type | Notes |
|-------|------|-------|
| code | String | @unique, VarChar(100) — ON_TIME_DELIVERY, REVENUE_PER_LOAD, etc. |
| name | String | VarChar(255) |
| category | KPICategory enum | OPERATIONS, FINANCIAL, SALES, CARRIER, CUSTOMER |
| aggregationType | AggregationType | SUM, AVG, COUNT, MIN, MAX |
| sourceQuery | String | SQL or query reference |
| unit | String? | VarChar(50) — PERCENT, CURRENCY, COUNT |
| format | String? | Display format |
| targetValue | Decimal? | Target threshold |
| warningValue | Decimal? | Warning threshold |
| criticalValue | Decimal? | Critical threshold |

## KPISnapshot

Historical KPI data points.

| Field | Type | Notes |
|-------|------|-------|
| kpiDefinitionId | String | FK to KPIDefinition |
| snapshotDate | DateTime | Date |
| value | Decimal | Decimal(15,2) |
| comparisonValue | Decimal? | Previous period |
| trendDirection | TrendDirection? | UP, DOWN, FLAT |
| metadata | Json | Additional context |

## LaneAnalytics

Lane-level performance analytics (aggregated).

| Field | Type | Notes |
|-------|------|-------|
| originState | String | VarChar(2) |
| destState | String | VarChar(2) |
| equipmentType | String | VarChar(50) |
| totalLoads | Int | |
| avgRate | Decimal | Decimal(10,2) |
| avgMargin | Decimal | Decimal(5,2) |
| avgTransitDays | Decimal | |
| onTimePercent | Decimal | |
| datAvgRate | Decimal? | Market comparison |
| truckstopAvgRate | Decimal? | |
| vsMarketPercent | Decimal? | Rate vs market |
| periodType | String | DAILY, WEEKLY, MONTHLY |
| periodStart/periodEnd | DateTime | |

**Unique:** `[tenantId, originState, destState, equipmentType, periodType, periodStart]`
