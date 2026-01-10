# 14 - Analytics Service API Implementation

> **Service:** Analytics & Business Intelligence  
> **Priority:** P1 - High  
> **Endpoints:** 45  
> **Dependencies:** TMS Core ✅ (01), Carrier ✅ (02), Accounting ✅, CRM ✅  
> **Doc Reference:** [25-service-analytics.md](../../02-services/25-service-analytics.md)

---

## 📋 Overview

Comprehensive business intelligence service providing KPIs, customizable dashboards, scheduled reports, and data analytics. Aggregates data from all services to deliver actionable insights for operational efficiency and financial performance.

### Key Capabilities
- KPI engine with real-time calculations
- Customizable drag-and-drop dashboards
- Scheduled and on-demand report generation
- Alert thresholds with notifications
- Export to PDF, Excel, CSV
- Role-based dashboard templates

---

## ✅ Pre-Implementation Checklist

- [ ] TMS Core service is working (loads data)
- [ ] Carrier service is working (carrier data)
- [ ] Accounting service is working (financial data)
- [ ] CRM service is working (customer data)
- [ ] Database models exist in `schema.prisma`

---

## 🗄️ Database Models Reference

### KpiDefinition Model
```prisma
model KpiDefinition {
  id                String            @id @default(cuid())
  tenantId          String
  
  code              String
  name              String
  description       String?           @db.Text
  category          KpiCategory
  
  // Calculation
  formula           String?           @db.Text
  dataSource        String
  aggregationType   AggregationType
  
  // Display
  unit              String?           // currency, percentage, count, days
  formatPattern     String?
  decimalPlaces     Int               @default(2)
  
  // Thresholds
  targetValue       Decimal?          @db.Decimal(15,4)
  warningThreshold  Decimal?          @db.Decimal(15,4)
  criticalThreshold Decimal?          @db.Decimal(15,4)
  thresholdDirection String?          // ABOVE, BELOW
  
  isSystem          Boolean           @default(false)
  isActive          Boolean           @default(true)
  displayOrder      Int               @default(0)
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  createdBy         String?
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  snapshots         KpiSnapshot[]
  alerts            KpiAlert[]
  
  @@unique([tenantId, code])
  @@index([tenantId, category])
}

enum KpiCategory {
  FINANCIAL
  OPERATIONAL
  CARRIER
  CUSTOMER
  SALES
}

enum AggregationType {
  SUM
  AVG
  COUNT
  MIN
  MAX
  RATIO
}
```

### KpiSnapshot Model
```prisma
model KpiSnapshot {
  id                String            @id @default(cuid())
  tenantId          String
  kpiDefinitionId   String
  
  periodType        PeriodType
  periodStart       DateTime
  periodEnd         DateTime
  
  currentValue      Decimal           @db.Decimal(15,4)
  previousValue     Decimal?          @db.Decimal(15,4)
  targetValue       Decimal?          @db.Decimal(15,4)
  
  changeAmount      Decimal?          @db.Decimal(15,4)
  changePercentage  Decimal?          @db.Decimal(10,4)
  vsTargetPercentage Decimal?         @db.Decimal(10,4)
  
  breakdown         Json              @default("{}")
  
  status            KpiStatus         @default(NORMAL)
  
  calculatedAt      DateTime          @default(now())
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  kpiDefinition     KpiDefinition     @relation(fields: [kpiDefinitionId], references: [id])
  
  @@unique([tenantId, kpiDefinitionId, periodType, periodStart])
  @@index([kpiDefinitionId, periodStart])
}

enum PeriodType {
  HOUR
  DAY
  WEEK
  MONTH
  QUARTER
  YEAR
}

enum KpiStatus {
  NORMAL
  WARNING
  CRITICAL
}
```

### Dashboard Model
```prisma
model Dashboard {
  id                String            @id @default(cuid())
  tenantId          String
  
  name              String
  description       String?           @db.Text
  slug              String
  
  ownerType         DashboardOwnerType
  ownerId           String?
  
  layout            Json              @default("[]")
  theme             String            @default("LIGHT")
  refreshInterval   Int               @default(300)
  
  isPublic          Boolean           @default(false)
  isDefault         Boolean           @default(false)
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  createdBy         String?
  deletedAt         DateTime?
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  widgets           DashboardWidget[]
  
  @@unique([tenantId, slug])
  @@index([tenantId, ownerType, ownerId])
}

enum DashboardOwnerType {
  SYSTEM
  ROLE
  USER
}
```

### DashboardWidget Model
```prisma
model DashboardWidget {
  id                String            @id @default(cuid())
  dashboardId       String
  
  widgetType        WidgetType
  title             String?
  
  positionX         Int               @default(0)
  positionY         Int               @default(0)
  width             Int               @default(4)
  height            Int               @default(2)
  
  dataConfig        Json              @default("{}")
  displayConfig     Json              @default("{}")
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  dashboard         Dashboard         @relation(fields: [dashboardId], references: [id], onDelete: Cascade)
  
  @@index([dashboardId])
}

enum WidgetType {
  KPI_CARD
  LINE_CHART
  BAR_CHART
  PIE_CHART
  DONUT_CHART
  TABLE
  MAP
  GAUGE
  SPARKLINE
  TREND
}
```

### Report Model
```prisma
model Report {
  id                String            @id @default(cuid())
  tenantId          String
  
  reportNumber      String
  name              String
  description       String?           @db.Text
  category          ReportCategory
  
  reportType        ReportType
  templateId        String?
  
  dataSource        String?
  queryDefinition   Json?
  filters           Json              @default("{}")
  parameters        Json              @default("{}")
  
  outputFormat      OutputFormat      @default(PDF)
  
  isScheduled       Boolean           @default(false)
  scheduleCron      String?
  nextRunAt         DateTime?
  lastRunAt         DateTime?
  
  recipients        Json              @default("[]")
  
  isActive          Boolean           @default(true)
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  createdBy         String?
  deletedAt         DateTime?
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  template          ReportTemplate?   @relation(fields: [templateId], references: [id])
  executions        ReportExecution[]
  
  @@unique([tenantId, reportNumber])
  @@index([isScheduled, nextRunAt])
}

enum ReportCategory {
  OPERATIONAL
  FINANCIAL
  CARRIER
  CUSTOMER
  SALES
  COMPLIANCE
}

enum ReportType {
  STANDARD
  CUSTOM
  AD_HOC
}

enum OutputFormat {
  PDF
  EXCEL
  CSV
}
```

### ReportExecution Model
```prisma
model ReportExecution {
  id                String            @id @default(cuid())
  tenantId          String
  reportId          String
  
  executionType     ExecutionType
  triggeredBy       String?
  
  parametersUsed    Json              @default("{}")
  filtersUsed       Json              @default("{}")
  dateRangeStart    DateTime?
  dateRangeEnd      DateTime?
  
  status            ExecutionStatus   @default(PENDING)
  startedAt         DateTime?
  completedAt       DateTime?
  errorMessage      String?           @db.Text
  
  outputFormat      OutputFormat?
  outputFilePath    String?
  outputFileSize    Int?
  rowCount          Int?
  
  distributedTo     Json              @default("[]")
  distributionStatus String?
  
  createdAt         DateTime          @default(now())
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  report            Report            @relation(fields: [reportId], references: [id])
  
  @@index([reportId, createdAt])
  @@index([status])
}

enum ExecutionType {
  SCHEDULED
  MANUAL
  API
}

enum ExecutionStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
}
```

### KpiAlert Model
```prisma
model KpiAlert {
  id                String            @id @default(cuid())
  tenantId          String
  kpiDefinitionId   String
  
  alertType         AlertType
  
  triggeredValue    Decimal           @db.Decimal(15,4)
  thresholdValue    Decimal           @db.Decimal(15,4)
  periodType        PeriodType
  periodStart       DateTime
  
  notificationSent  Boolean           @default(false)
  notificationSentAt DateTime?
  notifiedUsers     Json              @default("[]")
  
  isAcknowledged    Boolean           @default(false)
  acknowledgedBy    String?
  acknowledgedAt    DateTime?
  resolutionNotes   String?           @db.Text
  
  createdAt         DateTime          @default(now())
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  kpiDefinition     KpiDefinition     @relation(fields: [kpiDefinitionId], references: [id])
  
  @@index([tenantId, createdAt])
  @@index([isAcknowledged])
}

enum AlertType {
  WARNING
  CRITICAL
}
```

---

## 🛠️ API Endpoints

### KPI Endpoints (10 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/analytics/kpis` | List KPI definitions |
| GET | `/api/v1/analytics/kpis/:id` | Get KPI definition |
| POST | `/api/v1/analytics/kpis` | Create custom KPI |
| PUT | `/api/v1/analytics/kpis/:id` | Update KPI |
| DELETE | `/api/v1/analytics/kpis/:id` | Delete custom KPI |
| GET | `/api/v1/analytics/kpis/:id/values` | Get KPI time series |
| GET | `/api/v1/analytics/kpis/current` | Get all current values |
| GET | `/api/v1/analytics/kpis/category/:cat` | Get KPIs by category |
| POST | `/api/v1/analytics/kpis/:id/calculate` | Force recalculation |
| GET | `/api/v1/analytics/kpis/:id/breakdown` | Get KPI breakdown |

### Dashboard Endpoints (12 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/analytics/dashboards` | List dashboards |
| GET | `/api/v1/analytics/dashboards/:id` | Get dashboard |
| POST | `/api/v1/analytics/dashboards` | Create dashboard |
| PUT | `/api/v1/analytics/dashboards/:id` | Update dashboard |
| DELETE | `/api/v1/analytics/dashboards/:id` | Delete dashboard |
| POST | `/api/v1/analytics/dashboards/:id/clone` | Clone dashboard |
| POST | `/api/v1/analytics/dashboards/:id/share` | Share dashboard |
| GET | `/api/v1/analytics/dashboards/:id/data` | Get widget data |
| POST | `/api/v1/analytics/dashboards/:id/widgets` | Add widget |
| PUT | `/api/v1/analytics/dashboards/:id/widgets/:wid` | Update widget |
| DELETE | `/api/v1/analytics/dashboards/:id/widgets/:wid` | Remove widget |
| PUT | `/api/v1/analytics/dashboards/:id/layout` | Update layout |

### Report Endpoints (10 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/analytics/reports` | List reports |
| GET | `/api/v1/analytics/reports/:id` | Get report |
| POST | `/api/v1/analytics/reports` | Create report |
| PUT | `/api/v1/analytics/reports/:id` | Update report |
| DELETE | `/api/v1/analytics/reports/:id` | Delete report |
| POST | `/api/v1/analytics/reports/:id/execute` | Run report |
| GET | `/api/v1/analytics/reports/:id/executions` | List executions |
| GET | `/api/v1/analytics/reports/:id/executions/:eid` | Get execution |
| GET | `/api/v1/analytics/reports/:id/executions/:eid/download` | Download |
| PUT | `/api/v1/analytics/reports/:id/schedule` | Update schedule |

### Alert Endpoints (4 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/analytics/alerts` | List KPI alerts |
| GET | `/api/v1/analytics/alerts/active` | List unacknowledged |
| POST | `/api/v1/analytics/alerts/:id/acknowledge` | Acknowledge |
| POST | `/api/v1/analytics/alerts/:id/resolve` | Resolve |

### Data Query Endpoints (6 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/analytics/query` | Ad-hoc query |
| GET | `/api/v1/analytics/dimensions` | List dimensions |
| GET | `/api/v1/analytics/measures` | List measures |
| POST | `/api/v1/analytics/export` | Export data |
| GET | `/api/v1/analytics/trends/:kpiCode` | Get trend data |
| POST | `/api/v1/analytics/compare` | Compare periods |

### Report Template Endpoints (3 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/analytics/report-templates` | List templates |
| GET | `/api/v1/analytics/report-templates/:id` | Get template |
| POST | `/api/v1/analytics/report-templates/:id/preview` | Preview |

---

## 📝 DTO Specifications

### CreateKpiDto
```typescript
export class CreateKpiDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(KpiCategory)
  category: KpiCategory;

  @IsOptional()
  @IsString()
  formula?: string;

  @IsString()
  dataSource: string;

  @IsEnum(AggregationType)
  aggregationType: AggregationType;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  targetValue?: number;

  @IsOptional()
  @IsNumber()
  warningThreshold?: number;

  @IsOptional()
  @IsNumber()
  criticalThreshold?: number;

  @IsOptional()
  @IsString()
  thresholdDirection?: string;
}
```

### CreateDashboardDto
```typescript
export class CreateDashboardDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  slug: string;

  @IsEnum(DashboardOwnerType)
  ownerType: DashboardOwnerType;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
```

### AddWidgetDto
```typescript
export class AddWidgetDto {
  @IsEnum(WidgetType)
  widgetType: WidgetType;

  @IsOptional()
  @IsString()
  title?: string;

  @IsInt()
  positionX: number;

  @IsInt()
  positionY: number;

  @IsInt()
  @Min(1)
  @Max(12)
  width: number;

  @IsInt()
  @Min(1)
  height: number;

  @IsObject()
  dataConfig: Record<string, any>;

  @IsOptional()
  @IsObject()
  displayConfig?: Record<string, any>;
}
```

### CreateReportDto
```typescript
export class CreateReportDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ReportCategory)
  category: ReportCategory;

  @IsEnum(ReportType)
  reportType: ReportType;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsString()
  dataSource?: string;

  @IsOptional()
  @IsObject()
  queryDefinition?: Record<string, any>;

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @IsEnum(OutputFormat)
  outputFormat: OutputFormat;

  @IsOptional()
  @IsBoolean()
  isScheduled?: boolean;

  @IsOptional()
  @IsString()
  scheduleCron?: string;

  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  recipients?: string[];
}
```

### ExecuteReportDto
```typescript
export class ExecuteReportDto {
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateRangeStart?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateRangeEnd?: Date;

  @IsOptional()
  @IsEnum(OutputFormat)
  outputFormat?: OutputFormat;
}
```

---

## 📋 Business Rules

### System KPIs
```typescript
const systemKpis = {
  FINANCIAL: [
    { code: 'TOTAL_REVENUE', name: 'Total Revenue' },
    { code: 'GROSS_MARGIN', name: 'Gross Margin %' },
    { code: 'REVENUE_PER_LOAD', name: 'Revenue per Load' },
    { code: 'DAYS_SALES_OUTSTANDING', name: 'DSO' }
  ],
  OPERATIONAL: [
    { code: 'TOTAL_LOADS', name: 'Total Loads' },
    { code: 'ON_TIME_DELIVERY', name: 'On-Time Delivery %' },
    { code: 'TENDER_ACCEPTANCE', name: 'Tender Acceptance %' },
    { code: 'CLAIMS_RATIO', name: 'Claims Ratio' }
  ],
  CARRIER: [
    { code: 'ACTIVE_CARRIERS', name: 'Active Carriers' },
    { code: 'CARRIER_SCORECARD_AVG', name: 'Avg Carrier Score' },
    { code: 'POD_COMPLIANCE', name: 'POD Compliance %' }
  ]
};
```

### KPI Calculation Schedule
```typescript
const calculationSchedule = {
  HOUR: '0 * * * *',      // Every hour
  DAY: '0 2 * * *',       // 2 AM daily
  WEEK: '0 3 * * 0',      // 3 AM Sunday
  MONTH: '0 4 1 * *',     // 4 AM first of month
  QUARTER: '0 5 1 1,4,7,10 *' // Quarterly
};
```

---

## 📡 Events to Publish

| Event | Trigger | Payload |
|-------|---------|---------|
| `kpi.calculated` | KPI calc | `{ kpiId, value, period }` |
| `kpi.threshold_breached` | Breach | `{ kpiId, value, threshold }` |
| `kpi.threshold_recovered` | Recovery | `{ kpiId, value }` |
| `dashboard.created` | Create | `{ dashboardId, userId }` |
| `dashboard.shared` | Share | `{ dashboardId, sharedWith }` |
| `report.executed` | Complete | `{ reportId, execId, status }` |
| `alert.created` | Trigger | `{ alertId, kpiId, type }` |
| `alert.acknowledged` | Ack | `{ alertId, userId }` |

---

## 🔔 Events to Subscribe

| Event | Source | Action |
|-------|--------|--------|
| `order.created` | TMS Core | Update order metrics |
| `load.delivered` | TMS Core | Update delivery metrics |
| `invoice.created` | Accounting | Update revenue KPIs |
| `payment.received` | Accounting | Update DSO/collection |
| `scheduler.hourly` | Scheduler | Calculate hourly KPIs |
| `scheduler.daily` | Scheduler | Calculate daily KPIs |

---

## 🧪 Integration Test Requirements

```typescript
describe('Analytics Service API', () => {
  describe('KPIs', () => {
    it('should list KPI definitions');
    it('should create custom KPI');
    it('should calculate KPI value');
    it('should detect threshold breach');
    it('should get KPI breakdown');
  });

  describe('Dashboards', () => {
    it('should create dashboard');
    it('should add widget');
    it('should update layout');
    it('should clone dashboard');
    it('should share dashboard');
  });

  describe('Reports', () => {
    it('should create report');
    it('should execute report');
    it('should schedule report');
    it('should download output');
    it('should distribute to recipients');
  });

  describe('Alerts', () => {
    it('should create alert on breach');
    it('should notify users');
    it('should acknowledge alert');
    it('should resolve with notes');
  });
});
```

---

## 📁 Module Structure

```
apps/api/src/modules/analytics/
├── analytics.module.ts
├── kpis/
│   ├── kpis.controller.ts
│   ├── kpis.service.ts
│   ├── kpi-calculator.service.ts
│   └── dto/
├── dashboards/
│   ├── dashboards.controller.ts
│   ├── dashboards.service.ts
│   ├── widgets.service.ts
│   └── dto/
├── reports/
│   ├── reports.controller.ts
│   ├── reports.service.ts
│   ├── report-executor.service.ts
│   ├── report-scheduler.service.ts
│   └── dto/
├── alerts/
│   ├── alerts.controller.ts
│   └── alerts.service.ts
├── queries/
│   ├── queries.controller.ts
│   └── query-builder.service.ts
├── export/
│   ├── pdf.exporter.ts
│   ├── excel.exporter.ts
│   └── csv.exporter.ts
└── templates/
    ├── templates.controller.ts
    └── templates.service.ts
```

---

## ✅ Completion Checklist

- [ ] All 45 endpoints implemented
- [ ] System KPIs seeded
- [ ] KPI calculation engine
- [ ] Dashboard CRUD with widgets
- [ ] Report generation (PDF, Excel, CSV)
- [ ] Report scheduling with cron
- [ ] Alert threshold detection
- [ ] Alert notifications
- [ ] Export functionality
- [ ] All integration tests passing
- [ ] Tenant isolation verified

---

## 📊 Progress Tracker Update

### Update Service Row
```html
<tr>
    <td>27</td>
    <td>Analytics</td>
    <td><span class="status"><span class="status-dot complete"></span> Complete</span></td>
    <td>45/45</td>
    <td>6/6</td>
    <td>100%</td>
    <td>KPIs, Dashboards, Reports, Alerts, Queries, Templates</td>
</tr>
```

---

## 🔜 Next Step

➡️ **[15-workflow-api.md](./15-workflow-api.md)** - Implement Workflow Service API
