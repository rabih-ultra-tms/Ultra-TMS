# 18 - Analytics Service

| Field            | Value                               |
| ---------------- | ----------------------------------- |
| **Service ID**   | 18                                  |
| **Service Name** | Analytics                           |
| **Category**     | Platform                            |
| **Module Path**  | `@modules/analytics`                |
| **Phase**        | A (MVP)                             |
| **Weeks**        | 35-38                               |
| **Priority**     | P1                                  |
| **Dependencies** | Auth, TMS, Carrier, Accounting, CRM |

---

## Purpose

Comprehensive business intelligence service providing KPIs, dashboards, reports, and data analytics. Aggregates data from all services to deliver actionable insights for operational efficiency, financial performance, and strategic decision-making.

---

## Features

- **KPI Engine** - Real-time calculation and tracking of key performance indicators
- **Dashboard Builder** - Customizable dashboards with drag-and-drop widgets
- **Report Generator** - Scheduled and on-demand report generation
- **Data Aggregation** - ETL from all services for unified analytics
- **Trend Analysis** - Historical data comparison and forecasting
- **Alert Thresholds** - Automated notifications when KPIs breach limits
- **Export Capabilities** - Excel, PDF, CSV export options
- **Custom Metrics** - User-defined calculations and formulas
- **Benchmarking** - Compare performance across time periods
- **Role-Based Dashboards** - Pre-configured views by user role

---

## Database Schema

```sql
-- KPI Definitions
CREATE TABLE kpi_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    code VARCHAR(50) NOT NULL,              -- REVENUE_PER_LOAD, ON_TIME_DELIVERY, etc.
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,          -- FINANCIAL, OPERATIONAL, CARRIER, CUSTOMER, SALES

    -- Calculation
    formula TEXT,                           -- SQL or expression for calculation
    data_source VARCHAR(100) NOT NULL,      -- orders, invoices, carriers, etc.
    aggregation_type VARCHAR(20) NOT NULL,  -- SUM, AVG, COUNT, MIN, MAX, RATIO

    -- Display
    unit VARCHAR(20),                       -- currency, percentage, count, days
    format_pattern VARCHAR(50),             -- $#,##0.00, #.##%, etc.
    decimal_places INTEGER DEFAULT 2,

    -- Thresholds
    target_value DECIMAL(15,4),
    warning_threshold DECIMAL(15,4),
    critical_threshold DECIMAL(15,4),
    threshold_direction VARCHAR(10),        -- ABOVE, BELOW (above target is good vs below)

    -- Settings
    is_system BOOLEAN DEFAULT false,        -- System KPI vs custom
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,

    -- Migration
    external_id VARCHAR(100),
    source_system VARCHAR(50),
    custom_fields JSONB DEFAULT '{}',

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),

    UNIQUE(tenant_id, code)
);

CREATE INDEX idx_kpi_definitions_tenant ON kpi_definitions(tenant_id);
CREATE INDEX idx_kpi_definitions_category ON kpi_definitions(tenant_id, category);

-- KPI Snapshots (Time-series data)
CREATE TABLE kpi_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    kpi_definition_id UUID NOT NULL REFERENCES kpi_definitions(id),

    period_type VARCHAR(20) NOT NULL,       -- HOUR, DAY, WEEK, MONTH, QUARTER, YEAR
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    -- Values
    current_value DECIMAL(15,4) NOT NULL,
    previous_value DECIMAL(15,4),           -- Same period prior (for comparison)
    target_value DECIMAL(15,4),

    -- Calculated metrics
    change_amount DECIMAL(15,4),
    change_percentage DECIMAL(10,4),
    vs_target_percentage DECIMAL(10,4),

    -- Breakdown (optional)
    breakdown JSONB DEFAULT '{}',           -- By rep, region, mode, etc.

    -- Status
    status VARCHAR(20) DEFAULT 'NORMAL',    -- NORMAL, WARNING, CRITICAL

    -- Audit
    calculated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, kpi_definition_id, period_type, period_start)
);

CREATE INDEX idx_kpi_snapshots_tenant_period ON kpi_snapshots(tenant_id, period_type, period_start);
CREATE INDEX idx_kpi_snapshots_kpi ON kpi_snapshots(kpi_definition_id, period_start);

-- Dashboards
CREATE TABLE dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    name VARCHAR(200) NOT NULL,
    description TEXT,
    slug VARCHAR(100) NOT NULL,

    -- Ownership
    owner_type VARCHAR(20) NOT NULL,        -- SYSTEM, ROLE, USER
    owner_id UUID,                          -- role_id or user_id

    -- Settings
    layout JSONB NOT NULL DEFAULT '[]',     -- Widget positions and sizes
    theme VARCHAR(20) DEFAULT 'LIGHT',
    refresh_interval INTEGER DEFAULT 300,   -- Seconds

    -- Access
    is_public BOOLEAN DEFAULT false,        -- Shared with all users
    is_default BOOLEAN DEFAULT false,       -- Default for role

    -- Migration
    external_id VARCHAR(100),
    source_system VARCHAR(50),
    custom_fields JSONB DEFAULT '{}',

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMPTZ,

    UNIQUE(tenant_id, slug)
);

CREATE INDEX idx_dashboards_tenant ON dashboards(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_dashboards_owner ON dashboards(tenant_id, owner_type, owner_id);

-- Dashboard Widgets
CREATE TABLE dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,

    widget_type VARCHAR(50) NOT NULL,       -- KPI_CARD, LINE_CHART, BAR_CHART, PIE_CHART, TABLE, MAP, etc.
    title VARCHAR(200),

    -- Position (grid-based)
    position_x INTEGER NOT NULL DEFAULT 0,
    position_y INTEGER NOT NULL DEFAULT 0,
    width INTEGER NOT NULL DEFAULT 4,       -- Grid units (out of 12)
    height INTEGER NOT NULL DEFAULT 2,

    -- Data Configuration
    data_config JSONB NOT NULL DEFAULT '{}',  -- KPI ID, query, filters, etc.

    -- Display Configuration
    display_config JSONB NOT NULL DEFAULT '{}',  -- Colors, labels, legends, etc.

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dashboard_widgets_dashboard ON dashboard_widgets(dashboard_id);

-- Reports
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    report_number VARCHAR(30) NOT NULL,     -- RPT-{YYYYMM}-{sequence}
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,          -- OPERATIONAL, FINANCIAL, CARRIER, CUSTOMER, SALES, COMPLIANCE

    -- Report Definition
    report_type VARCHAR(50) NOT NULL,       -- STANDARD, CUSTOM, AD_HOC
    template_id UUID REFERENCES report_templates(id),

    -- Query/Data
    data_source VARCHAR(100),
    query_definition JSONB,                 -- SQL or structured query
    filters JSONB DEFAULT '{}',
    parameters JSONB DEFAULT '{}',

    -- Output
    output_format VARCHAR(20) DEFAULT 'PDF', -- PDF, EXCEL, CSV

    -- Schedule
    is_scheduled BOOLEAN DEFAULT false,
    schedule_cron VARCHAR(100),             -- Cron expression
    next_run_at TIMESTAMPTZ,
    last_run_at TIMESTAMPTZ,

    -- Distribution
    recipients JSONB DEFAULT '[]',          -- Email addresses

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Migration
    external_id VARCHAR(100),
    source_system VARCHAR(50),
    custom_fields JSONB DEFAULT '{}',

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMPTZ,

    UNIQUE(tenant_id, report_number)
);

CREATE INDEX idx_reports_tenant ON reports(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_reports_scheduled ON reports(is_scheduled, next_run_at) WHERE is_active = true;

-- Report Templates
CREATE TABLE report_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),  -- NULL for system templates

    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,

    -- Template Definition
    template_type VARCHAR(20) NOT NULL,     -- HTML, JASPER, EXCEL
    template_content TEXT,                  -- HTML template or path

    -- Parameters Schema
    parameters_schema JSONB DEFAULT '{}',

    -- Default Settings
    default_filters JSONB DEFAULT '{}',
    default_output_format VARCHAR(20) DEFAULT 'PDF',

    -- Status
    is_system BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_report_templates_tenant ON report_templates(tenant_id);
CREATE INDEX idx_report_templates_category ON report_templates(category);

-- Report Executions
CREATE TABLE report_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    report_id UUID NOT NULL REFERENCES reports(id),

    -- Execution Details
    execution_type VARCHAR(20) NOT NULL,    -- SCHEDULED, MANUAL, API
    triggered_by UUID REFERENCES users(id),

    -- Parameters Used
    parameters_used JSONB DEFAULT '{}',
    filters_used JSONB DEFAULT '{}',
    date_range_start DATE,
    date_range_end DATE,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',  -- PENDING, RUNNING, COMPLETED, FAILED
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,

    -- Output
    output_format VARCHAR(20),
    output_file_path VARCHAR(500),
    output_file_size INTEGER,
    row_count INTEGER,

    -- Distribution
    distributed_to JSONB DEFAULT '[]',
    distribution_status VARCHAR(20),

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_report_executions_tenant ON report_executions(tenant_id, created_at DESC);
CREATE INDEX idx_report_executions_report ON report_executions(report_id, created_at DESC);
CREATE INDEX idx_report_executions_status ON report_executions(status) WHERE status IN ('PENDING', 'RUNNING');

-- Saved Filters / Views
CREATE TABLE saved_analytics_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES users(id),

    name VARCHAR(200) NOT NULL,
    view_type VARCHAR(50) NOT NULL,         -- DASHBOARD, REPORT, KPI_LIST

    -- Configuration
    filters JSONB DEFAULT '{}',
    columns JSONB DEFAULT '[]',
    sort_config JSONB DEFAULT '{}',

    -- Settings
    is_default BOOLEAN DEFAULT false,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_saved_analytics_views_user ON saved_analytics_views(user_id, view_type);

-- KPI Alerts
CREATE TABLE kpi_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    kpi_definition_id UUID NOT NULL REFERENCES kpi_definitions(id),

    alert_type VARCHAR(20) NOT NULL,        -- WARNING, CRITICAL

    -- Trigger Details
    triggered_value DECIMAL(15,4) NOT NULL,
    threshold_value DECIMAL(15,4) NOT NULL,
    period_type VARCHAR(20) NOT NULL,
    period_start DATE NOT NULL,

    -- Notification
    notification_sent BOOLEAN DEFAULT false,
    notification_sent_at TIMESTAMPTZ,
    notified_users JSONB DEFAULT '[]',

    -- Resolution
    is_acknowledged BOOLEAN DEFAULT false,
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMPTZ,
    resolution_notes TEXT,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kpi_alerts_tenant ON kpi_alerts(tenant_id, created_at DESC);
CREATE INDEX idx_kpi_alerts_unacknowledged ON kpi_alerts(tenant_id, is_acknowledged)
    WHERE is_acknowledged = false;

-- Analytics Data Cache (for performance)
CREATE TABLE analytics_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    cache_key VARCHAR(200) NOT NULL,
    cache_type VARCHAR(50) NOT NULL,        -- KPI, DASHBOARD, REPORT_DATA

    data JSONB NOT NULL,

    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, cache_key)
);

CREATE INDEX idx_analytics_cache_expiry ON analytics_cache(expires_at);
```

---

## System KPIs

### Financial KPIs

| KPI Code               | Name              | Formula                                   | Unit       |
| ---------------------- | ----------------- | ----------------------------------------- | ---------- |
| TOTAL_REVENUE          | Total Revenue     | SUM(invoices.total_amount)                | Currency   |
| GROSS_MARGIN           | Gross Margin      | (Revenue - Carrier Cost) / Revenue \* 100 | Percentage |
| REVENUE_PER_LOAD       | Revenue per Load  | Total Revenue / Load Count                | Currency   |
| MARGIN_PER_LOAD        | Margin per Load   | Total Margin / Load Count                 | Currency   |
| AR_AGING_30            | AR Aging 30+ Days | SUM(past_due > 30) / Total AR \* 100      | Percentage |
| AR_AGING_60            | AR Aging 60+ Days | SUM(past_due > 60) / Total AR \* 100      | Percentage |
| DAYS_SALES_OUTSTANDING | DSO               | (AR Balance / Revenue) \* Days            | Days       |
| COLLECTION_RATE        | Collection Rate   | Collected / Invoiced \* 100               | Percentage |

### Operational KPIs

| KPI Code          | Name                | Formula                                      | Unit       |
| ----------------- | ------------------- | -------------------------------------------- | ---------- |
| TOTAL_LOADS       | Total Loads         | COUNT(loads)                                 | Count      |
| ON_TIME_PICKUP    | On-Time Pickup %    | On-time pickups / Total pickups \* 100       | Percentage |
| ON_TIME_DELIVERY  | On-Time Delivery %  | On-time deliveries / Total deliveries \* 100 | Percentage |
| TENDER_ACCEPTANCE | Tender Acceptance % | Accepted tenders / Total tenders \* 100      | Percentage |
| LOAD_FILL_RATE    | Load Fill Rate      | Covered loads / Total loads \* 100           | Percentage |
| AVG_TRANSIT_TIME  | Avg Transit Time    | AVG(delivery_time - pickup_time)             | Hours      |
| CLAIMS_RATIO      | Claims Ratio        | Loads with claims / Total loads \* 100       | Percentage |
| ACCESSORIAL_RATIO | Accessorial Ratio   | Accessorial revenue / Total revenue \* 100   | Percentage |

### Sales KPIs

| KPI Code           | Name               | Formula                                     | Unit       |
| ------------------ | ------------------ | ------------------------------------------- | ---------- |
| QUOTE_COUNT        | Quote Count        | COUNT(quotes)                               | Count      |
| QUOTE_WIN_RATE     | Quote Win Rate     | Won quotes / Total quotes \* 100            | Percentage |
| NEW_CUSTOMERS      | New Customers      | COUNT(new customers)                        | Count      |
| CUSTOMER_RETENTION | Customer Retention | Retained / Previous period customers \* 100 | Percentage |
| REPEAT_ORDER_RATE  | Repeat Order Rate  | Repeat orders / Total orders \* 100         | Percentage |
| AVG_DEAL_SIZE      | Avg Deal Size      | Total revenue / Order count                 | Currency   |
| SALES_PIPELINE     | Sales Pipeline     | SUM(opportunity values)                     | Currency   |

### Carrier KPIs

| KPI Code              | Name                | Formula                                    | Unit       |
| --------------------- | ------------------- | ------------------------------------------ | ---------- |
| ACTIVE_CARRIERS       | Active Carriers     | COUNT(carriers with loads in period)       | Count      |
| CARRIER_SCORECARD_AVG | Avg Carrier Score   | AVG(carrier_scorecard)                     | Score      |
| POD_COMPLIANCE        | POD Compliance      | PODs submitted on time / Total PODs \* 100 | Percentage |
| TRACKING_COMPLIANCE   | Tracking Compliance | Updates on time / Expected updates \* 100  | Percentage |
| CARRIER_CHURN         | Carrier Churn       | Inactive carriers / Previous active \* 100 | Percentage |
| AVG_CARRIER_PAY       | Avg Carrier Pay     | Total carrier pay / Load count             | Currency   |
| CARRIER_COST_RATIO    | Carrier Cost Ratio  | Carrier cost / Revenue \* 100              | Percentage |

---

## API Endpoints

### KPI Endpoints

| Method | Endpoint                                    | Description                  |
| ------ | ------------------------------------------- | ---------------------------- |
| GET    | `/api/v1/analytics/kpis`                    | List KPI definitions         |
| GET    | `/api/v1/analytics/kpis/:id`                | Get KPI definition           |
| POST   | `/api/v1/analytics/kpis`                    | Create custom KPI            |
| PUT    | `/api/v1/analytics/kpis/:id`                | Update KPI                   |
| DELETE | `/api/v1/analytics/kpis/:id`                | Delete custom KPI            |
| GET    | `/api/v1/analytics/kpis/:id/values`         | Get KPI values (time series) |
| GET    | `/api/v1/analytics/kpis/current`            | Get all current KPI values   |
| GET    | `/api/v1/analytics/kpis/category/:category` | Get KPIs by category         |
| POST   | `/api/v1/analytics/kpis/:id/calculate`      | Force recalculation          |
| GET    | `/api/v1/analytics/kpis/:id/breakdown`      | Get KPI breakdown            |

### Dashboard Endpoints

| Method | Endpoint                                             | Description                |
| ------ | ---------------------------------------------------- | -------------------------- |
| GET    | `/api/v1/analytics/dashboards`                       | List dashboards            |
| GET    | `/api/v1/analytics/dashboards/:id`                   | Get dashboard with widgets |
| POST   | `/api/v1/analytics/dashboards`                       | Create dashboard           |
| PUT    | `/api/v1/analytics/dashboards/:id`                   | Update dashboard           |
| DELETE | `/api/v1/analytics/dashboards/:id`                   | Delete dashboard           |
| POST   | `/api/v1/analytics/dashboards/:id/clone`             | Clone dashboard            |
| POST   | `/api/v1/analytics/dashboards/:id/share`             | Share dashboard            |
| GET    | `/api/v1/analytics/dashboards/:id/data`              | Get all widget data        |
| POST   | `/api/v1/analytics/dashboards/:id/widgets`           | Add widget                 |
| PUT    | `/api/v1/analytics/dashboards/:id/widgets/:widgetId` | Update widget              |
| DELETE | `/api/v1/analytics/dashboards/:id/widgets/:widgetId` | Remove widget              |
| PUT    | `/api/v1/analytics/dashboards/:id/layout`            | Update layout              |

### Report Endpoints

| Method | Endpoint                                                    | Description        |
| ------ | ----------------------------------------------------------- | ------------------ |
| GET    | `/api/v1/analytics/reports`                                 | List reports       |
| GET    | `/api/v1/analytics/reports/:id`                             | Get report details |
| POST   | `/api/v1/analytics/reports`                                 | Create report      |
| PUT    | `/api/v1/analytics/reports/:id`                             | Update report      |
| DELETE | `/api/v1/analytics/reports/:id`                             | Delete report      |
| POST   | `/api/v1/analytics/reports/:id/execute`                     | Run report         |
| GET    | `/api/v1/analytics/reports/:id/executions`                  | List executions    |
| GET    | `/api/v1/analytics/reports/:id/executions/:execId`          | Get execution      |
| GET    | `/api/v1/analytics/reports/:id/executions/:execId/download` | Download output    |
| PUT    | `/api/v1/analytics/reports/:id/schedule`                    | Update schedule    |

### Report Template Endpoints

| Method | Endpoint                                         | Description      |
| ------ | ------------------------------------------------ | ---------------- |
| GET    | `/api/v1/analytics/report-templates`             | List templates   |
| GET    | `/api/v1/analytics/report-templates/:id`         | Get template     |
| POST   | `/api/v1/analytics/report-templates`             | Create template  |
| PUT    | `/api/v1/analytics/report-templates/:id`         | Update template  |
| DELETE | `/api/v1/analytics/report-templates/:id`         | Delete template  |
| POST   | `/api/v1/analytics/report-templates/:id/preview` | Preview template |

### Alert Endpoints

| Method | Endpoint                                   | Description         |
| ------ | ------------------------------------------ | ------------------- |
| GET    | `/api/v1/analytics/alerts`                 | List KPI alerts     |
| GET    | `/api/v1/analytics/alerts/active`          | List unacknowledged |
| POST   | `/api/v1/analytics/alerts/:id/acknowledge` | Acknowledge alert   |
| POST   | `/api/v1/analytics/alerts/:id/resolve`     | Resolve with notes  |

### Data Query Endpoints

| Method | Endpoint                            | Description               |
| ------ | ----------------------------------- | ------------------------- |
| POST   | `/api/v1/analytics/query`           | Execute ad-hoc query      |
| GET    | `/api/v1/analytics/dimensions`      | List available dimensions |
| GET    | `/api/v1/analytics/measures`        | List available measures   |
| POST   | `/api/v1/analytics/export`          | Export data               |
| GET    | `/api/v1/analytics/trends/:kpiCode` | Get trend data            |
| POST   | `/api/v1/analytics/compare`         | Compare periods           |

---

## Events

### Published Events

| Event                     | Payload                           | Description            |
| ------------------------- | --------------------------------- | ---------------------- |
| `kpi.calculated`          | `{kpiId, value, period}`          | KPI value calculated   |
| `kpi.threshold_breached`  | `{kpiId, value, threshold, type}` | KPI breached threshold |
| `kpi.threshold_recovered` | `{kpiId, value, threshold}`       | KPI returned to normal |
| `dashboard.created`       | `{dashboardId, userId}`           | Dashboard created      |
| `dashboard.shared`        | `{dashboardId, sharedWith}`       | Dashboard shared       |
| `report.executed`         | `{reportId, executionId, status}` | Report run completed   |
| `report.scheduled`        | `{reportId, schedule}`            | Report schedule set    |
| `alert.created`           | `{alertId, kpiId, type}`          | KPI alert triggered    |
| `alert.acknowledged`      | `{alertId, userId}`               | Alert acknowledged     |

### Subscribed Events

| Event                       | Source     | Handler                 |
| --------------------------- | ---------- | ----------------------- |
| `order.created`             | TMS        | Update order counts     |
| `order.delivered`           | TMS        | Update delivery metrics |
| `order.status_changed`      | TMS        | Update operational KPIs |
| `invoice.created`           | Accounting | Update financial KPIs   |
| `payment.received`          | Accounting | Update AR metrics       |
| `carrier.scorecard_updated` | Carrier    | Update carrier KPIs     |
| `quote.created`             | Sales      | Update sales KPIs       |
| `quote.won`                 | Sales      | Update win rate         |
| `claim.created`             | Claims     | Update claims ratio     |
| `user.logged_in`            | Auth       | Track system usage      |

---

## Business Rules

### KPI Calculation

1. **Calculation Schedule**
   - Hourly KPIs: Every hour at :05
   - Daily KPIs: At 00:15 UTC
   - Weekly KPIs: Monday at 00:30 UTC
   - Monthly KPIs: 1st at 01:00 UTC

2. **Period Handling**
   - All periods use tenant timezone
   - Incomplete periods marked as preliminary
   - Previous period comparison uses same day count

3. **Threshold Processing**
   - Warning threshold triggers email only
   - Critical threshold triggers email + in-app alert
   - Alerts auto-clear when recovered

### Dashboard Rules

1. **Access Control**
   - System dashboards: view-only for non-admin
   - Role dashboards: editable by admins
   - Personal dashboards: full control by owner
   - Shared dashboards: view-only for recipients

2. **Widget Limits**
   - Maximum 20 widgets per dashboard
   - Maximum 4 data series per chart
   - Refresh minimum 60 seconds

### Report Rules

1. **Execution Limits**
   - Maximum date range: 2 years
   - Maximum rows: 100,000 (paginated beyond)
   - Concurrent executions per tenant: 5
   - Scheduled report retention: 90 days

2. **Distribution**
   - Maximum 20 recipients per report
   - Attachments limited to 10MB
   - Failed distribution retried 3x

---

## Standard Reports

### Operational Reports

| Report                     | Description             | Default Schedule |
| -------------------------- | ----------------------- | ---------------- |
| Daily Operations Summary   | Loads, revenue, issues  | Daily 6:00 AM    |
| Load Status Report         | All active loads status | On-demand        |
| Carrier Performance Report | Scorecard details       | Weekly Monday    |
| Exception Report           | Late, claims, issues    | Daily 7:00 AM    |
| Transit Time Analysis      | Lane performance        | Monthly          |

### Financial Reports

| Report            | Description              | Default Schedule |
| ----------------- | ------------------------ | ---------------- |
| Revenue Summary   | Revenue by customer/lane | Weekly           |
| Margin Analysis   | Margin by customer/rep   | Monthly          |
| AR Aging Report   | Aging buckets, contacts  | Weekly           |
| Commission Report | Rep commission details   | Semi-monthly     |
| P&L by Customer   | Customer profitability   | Monthly          |

### Sales Reports

| Report               | Description             | Default Schedule |
| -------------------- | ----------------------- | ---------------- |
| Sales Pipeline       | Opportunities by stage  | Weekly           |
| Quote Activity       | Quote conversion funnel | Weekly           |
| Customer Acquisition | New customer details    | Monthly          |
| Lost Business Report | Lost quotes analysis    | Monthly          |

---

## Screens

| Screen              | Path                                        | Description           |
| ------------------- | ------------------------------------------- | --------------------- |
| Analytics Dashboard | `/analytics`                                | Main analytics home   |
| KPI Overview        | `/analytics/kpis`                           | All KPIs grid         |
| KPI Detail          | `/analytics/kpis/:id`                       | Single KPI drill-down |
| Dashboard Builder   | `/analytics/dashboards/builder`             | Create/edit dashboard |
| Dashboard View      | `/analytics/dashboards/:id`                 | View dashboard        |
| Reports Library     | `/analytics/reports`                        | All reports list      |
| Report Builder      | `/analytics/reports/builder`                | Create custom report  |
| Report Viewer       | `/analytics/reports/:id`                    | View/run report       |
| Report Execution    | `/analytics/reports/:id/executions/:execId` | View execution        |
| Alerts              | `/analytics/alerts`                         | Active alerts         |
| Data Explorer       | `/analytics/explorer`                       | Ad-hoc querying       |

---

## Configuration

### Environment Variables

```bash
# Analytics Settings
ANALYTICS_CALCULATION_BATCH_SIZE=1000
ANALYTICS_CACHE_TTL_MINUTES=5
ANALYTICS_REPORT_MAX_ROWS=100000
ANALYTICS_CONCURRENT_REPORTS=5
ANALYTICS_RETENTION_DAYS=730

# Export Settings
ANALYTICS_EXPORT_PATH=/tmp/analytics/exports
ANALYTICS_MAX_EXPORT_SIZE_MB=50
```

### Default Settings

```json
{
  "defaultDashboardRefresh": 300,
  "kpiAlertCooldownMinutes": 60,
  "reportRetentionDays": 90,
  "enableEmailDistribution": true,
  "enableSlackIntegration": false,
  "timezone": "America/Chicago"
}
```

---

## Testing Checklist

### Unit Tests

- [ ] KPI formula evaluation
- [ ] Period boundary calculations
- [ ] Threshold comparison logic
- [ ] Aggregation functions
- [ ] Export formatting
- [ ] Chart data transformation

### Integration Tests

- [ ] Multi-service data aggregation
- [ ] Scheduled calculation jobs
- [ ] Report generation pipeline
- [ ] Alert notification delivery
- [ ] Dashboard widget data loading
- [ ] Export file creation

### E2E Tests

- [ ] Dashboard creation and editing
- [ ] Widget drag and drop
- [ ] Report execution workflow
- [ ] Alert acknowledgment flow
- [ ] Data explorer queries
- [ ] Export download

---

## Navigation

- **Previous:** [17 - HR](../17-hr/README.md)
- **Next:** [19 - Workflow](../19-workflow/README.md)
- **Index:** [All Services](../README.md)
