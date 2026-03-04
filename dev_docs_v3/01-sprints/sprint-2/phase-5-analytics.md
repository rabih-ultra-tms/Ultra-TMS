# Sprint 2 — Phase 5: Analytics Service (Weeks 21-22)
> 3 tasks | 19-28h estimated | Prereq: Sprint 1 services providing data

---

## SVC-ANLYT-001: Analytics Backend Completion [P0]
**Effort:** L (8-12h)

### Current State
- **Built:** 6 controllers (43 endpoints), services, 9 Prisma models
- **Dashboards:** CRUD, widget management — working
- **KPIs:** CRUD, definitions, snapshots — working, **but calculateKPI is a STUB**
- **Reports:** CRUD, scheduling — working, **but executeReport is a STUB**
- **Alerts:** List, acknowledge, resolve — working
- **Data:** Query, export, trends, compare — partially working
- **Missing:** KPI calculation engine, report execution engine, seed data, export libraries

### Sub-tasks

#### ANLYT-001a: Build KPI calculation engine (3-4h)
**Create:** `apps/api/src/modules/analytics/services/kpi-calculator.service.ts`

```typescript
@Injectable()
export class KpiCalculatorService {
  constructor(private readonly prisma: PrismaService) {}

  async calculateKPI(kpiCode: string, tenantId: string, periodStart: Date, periodEnd: Date): Promise<number> {
    switch (kpiCode) {
      // === FINANCIAL KPIs ===
      case 'TOTAL_REVENUE':
        return this.sumInvoices(tenantId, periodStart, periodEnd, ['PAID', 'SENT']);

      case 'GROSS_MARGIN':
        const revenue = await this.sumInvoices(tenantId, periodStart, periodEnd, ['PAID']);
        const costs = await this.sumSettlements(tenantId, periodStart, periodEnd, ['PAID']);
        return revenue > 0 ? ((revenue - costs) / revenue) * 100 : 0;

      case 'AVERAGE_REVENUE_PER_LOAD':
        const totalRev = await this.sumInvoices(tenantId, periodStart, periodEnd, ['PAID']);
        const loadCount = await this.countLoads(tenantId, periodStart, periodEnd, ['DELIVERED']);
        return loadCount > 0 ? totalRev / loadCount : 0;

      case 'ACCOUNTS_RECEIVABLE':
        return this.sumInvoices(tenantId, periodStart, periodEnd, ['SENT', 'OVERDUE']);

      case 'ACCOUNTS_PAYABLE':
        return this.sumSettlements(tenantId, periodStart, periodEnd, ['PENDING', 'APPROVED']);

      case 'DSO': // Days Sales Outstanding
        const ar = await this.sumInvoices(tenantId, periodStart, periodEnd, ['SENT', 'OVERDUE']);
        const avgDailyRev = await this.avgDailyRevenue(tenantId, periodStart, periodEnd);
        return avgDailyRev > 0 ? ar / avgDailyRev : 0;

      // === OPERATIONAL KPIs ===
      case 'TOTAL_LOADS':
        return this.countLoads(tenantId, periodStart, periodEnd);

      case 'LOADS_IN_TRANSIT':
        return this.prisma.load.count({
          where: { tenantId, status: 'IN_TRANSIT' },
        });

      case 'ON_TIME_DELIVERY':
        const totalDelivered = await this.countLoads(tenantId, periodStart, periodEnd, ['DELIVERED']);
        const onTime = await this.prisma.load.count({
          where: {
            tenantId,
            status: 'DELIVERED',
            deliveredAt: { gte: periodStart, lte: periodEnd },
            // deliveredAt <= estimatedDeliveryDate
          },
        });
        return totalDelivered > 0 ? (onTime / totalDelivered) * 100 : 0;

      case 'AVERAGE_TRANSIT_TIME':
        // Average hours from pickup to delivery
        const loads = await this.prisma.load.findMany({
          where: {
            tenantId,
            status: 'DELIVERED',
            deliveredAt: { gte: periodStart, lte: periodEnd },
            pickedUpAt: { not: null },
          },
          select: { pickedUpAt: true, deliveredAt: true },
        });
        if (loads.length === 0) return 0;
        const totalHours = loads.reduce((sum, l) => {
          return sum + (l.deliveredAt!.getTime() - l.pickedUpAt!.getTime()) / (1000 * 60 * 60);
        }, 0);
        return totalHours / loads.length;

      // === SALES KPIs ===
      case 'QUOTES_SENT':
        return this.prisma.quote.count({
          where: { tenantId, createdAt: { gte: periodStart, lte: periodEnd } },
        });

      case 'QUOTE_CONVERSION_RATE':
        const totalQuotes = await this.prisma.quote.count({
          where: { tenantId, createdAt: { gte: periodStart, lte: periodEnd } },
        });
        const wonQuotes = await this.prisma.quote.count({
          where: { tenantId, status: 'WON', createdAt: { gte: periodStart, lte: periodEnd } },
        });
        return totalQuotes > 0 ? (wonQuotes / totalQuotes) * 100 : 0;

      // === CARRIER KPIs ===
      case 'ACTIVE_CARRIERS':
        return this.prisma.carrier.count({
          where: { tenantId, status: 'ACTIVE' },
        });

      case 'CARRIER_ON_TIME_RATE':
        // Similar to ON_TIME_DELIVERY but grouped by carrier
        return 0; // TODO: implement with carrier grouping

      case 'AVERAGE_CARRIER_RATE':
        const settlements = await this.prisma.settlement.aggregate({
          where: { tenantId, createdAt: { gte: periodStart, lte: periodEnd } },
          _avg: { amount: true },
        });
        return settlements._avg.amount || 0;

      // === CRM KPIs ===
      case 'NEW_CUSTOMERS':
        return this.prisma.company.count({
          where: { tenantId, createdAt: { gte: periodStart, lte: periodEnd } },
        });

      case 'ACTIVE_LEADS':
        return this.prisma.lead.count({
          where: { tenantId, status: { notIn: ['WON', 'LOST'] } },
        });

      case 'LEAD_CONVERSION_RATE':
        const totalLeads = await this.prisma.lead.count({
          where: { tenantId, createdAt: { gte: periodStart, lte: periodEnd } },
        });
        const wonLeads = await this.prisma.lead.count({
          where: { tenantId, status: 'WON', createdAt: { gte: periodStart, lte: periodEnd } },
        });
        return totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;

      default:
        throw new BadRequestException(`Unknown KPI code: ${kpiCode}`);
    }
  }

  // Helper methods
  private async sumInvoices(tenantId: string, from: Date, to: Date, statuses?: string[]): Promise<number> {
    const result = await this.prisma.invoice.aggregate({
      where: { tenantId, createdAt: { gte: from, lte: to }, ...(statuses ? { status: { in: statuses } } : {}) },
      _sum: { total: true },
    });
    return result._sum.total || 0;
  }

  private async sumSettlements(tenantId: string, from: Date, to: Date, statuses?: string[]): Promise<number> {
    const result = await this.prisma.settlement.aggregate({
      where: { tenantId, createdAt: { gte: from, lte: to }, ...(statuses ? { status: { in: statuses } } : {}) },
      _sum: { amount: true },
    });
    return result._sum.amount || 0;
  }

  private async countLoads(tenantId: string, from: Date, to: Date, statuses?: string[]): Promise<number> {
    return this.prisma.load.count({
      where: { tenantId, createdAt: { gte: from, lte: to }, ...(statuses ? { status: { in: statuses } } : {}) },
    });
  }
}
```

**Wire scheduled calculations:**
```typescript
@Cron('5 * * * *') // Every hour at :05
async calculateHourlyKPIs() {
  const tenants = await this.prisma.tenant.findMany({ select: { id: true } });
  for (const tenant of tenants) {
    const kpis = await this.prisma.kpiDefinition.findMany({
      where: { tenantId: tenant.id, isActive: true, refreshInterval: 'HOURLY' },
    });
    for (const kpi of kpis) {
      const value = await this.calculate(kpi.code, tenant.id, this.getHourRange());
      await this.prisma.kpiSnapshot.create({
        data: { kpiId: kpi.id, tenantId: tenant.id, value, period: 'HOURLY' },
      });
    }
  }
}

@Cron('15 0 * * *') // Daily at 00:15
async calculateDailyKPIs() { /* similar, period: 'DAILY' */ }
```

#### ANLYT-001b: Build report execution engine (2-3h)
**File:** `apps/api/src/modules/analytics/services/reports.service.ts`

```typescript
async executeReport(reportId: string, tenantId: string, params?: Record<string, any>) {
  const report = await this.prisma.report.findFirst({ where: { id: reportId, tenantId } });
  if (!report) throw new NotFoundException();

  // Create execution record
  const execution = await this.prisma.reportExecution.create({
    data: { reportId, tenantId, status: 'RUNNING', parameters: params },
  });

  try {
    // Run the query
    const results = await this.prisma.$queryRawUnsafe(report.sourceQuery, tenantId, ...Object.values(params || {}));

    // Generate output file
    let fileBuffer: Buffer;
    let contentType: string;
    let extension: string;

    switch (report.outputFormat) {
      case 'CSV':
        fileBuffer = this.generateCSV(results, report.columns);
        contentType = 'text/csv';
        extension = 'csv';
        break;
      case 'EXCEL':
        fileBuffer = this.generateExcel(results, report.columns, report.name);
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        extension = 'xlsx';
        break;
      case 'PDF':
        fileBuffer = await this.generatePDF(results, report.columns, report.name);
        contentType = 'application/pdf';
        extension = 'pdf';
        break;
      default:
        throw new BadRequestException(`Unsupported format: ${report.outputFormat}`);
    }

    // Upload to storage
    const fileName = `reports/${tenantId}/${reportId}/${execution.id}.${extension}`;
    const url = await this.storage.upload(fileBuffer, fileName, contentType);

    // Update execution record
    await this.prisma.reportExecution.update({
      where: { id: execution.id },
      data: {
        status: 'COMPLETED',
        outputFileUrl: url,
        rowCount: Array.isArray(results) ? results.length : 0,
        completedAt: new Date(),
      },
    });

    return { executionId: execution.id, url, rowCount: results.length };
  } catch (error) {
    await this.prisma.reportExecution.update({
      where: { id: execution.id },
      data: { status: 'FAILED', error: error.message },
    });
    throw error;
  }
}

private generateCSV(data: any[], columns: ReportColumn[]): Buffer {
  const header = columns.map(c => c.label).join(',');
  const rows = data.map(row => columns.map(c => `"${row[c.key] ?? ''}"`).join(','));
  return Buffer.from([header, ...rows].join('\n'), 'utf-8');
}

private generateExcel(data: any[], columns: ReportColumn[], sheetName: string): Buffer {
  const XLSX = require('xlsx');
  const ws = XLSX.utils.json_to_sheet(data.map(row => {
    const obj: Record<string, any> = {};
    columns.forEach(c => { obj[c.label] = row[c.key]; });
    return obj;
  }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

private async generatePDF(data: any[], columns: ReportColumn[], title: string): Promise<Buffer> {
  const PDFDocument = require('pdfkit');
  // ... render table to PDF ...
}
```

**Install dependencies:**
```bash
cd apps/api && pnpm add xlsx pdfkit csv-writer
```

#### ANLYT-001c: Seed system KPIs and default dashboards (1-2h)
**Create:** `apps/api/prisma/seeds/analytics-seed.ts`

```typescript
const systemKPIs = [
  // Financial (6)
  { code: 'TOTAL_REVENUE', name: 'Total Revenue', category: 'FINANCIAL', unit: 'USD', aggregation: 'SUM', refreshInterval: 'HOURLY' },
  { code: 'GROSS_MARGIN', name: 'Gross Margin %', category: 'FINANCIAL', unit: 'PERCENT', aggregation: 'AVG', refreshInterval: 'DAILY' },
  { code: 'AVERAGE_REVENUE_PER_LOAD', name: 'Avg Revenue/Load', category: 'FINANCIAL', unit: 'USD', aggregation: 'AVG', refreshInterval: 'DAILY' },
  { code: 'ACCOUNTS_RECEIVABLE', name: 'Accounts Receivable', category: 'FINANCIAL', unit: 'USD', aggregation: 'SUM', refreshInterval: 'HOURLY' },
  { code: 'ACCOUNTS_PAYABLE', name: 'Accounts Payable', category: 'FINANCIAL', unit: 'USD', aggregation: 'SUM', refreshInterval: 'HOURLY' },
  { code: 'DSO', name: 'Days Sales Outstanding', category: 'FINANCIAL', unit: 'DAYS', aggregation: 'AVG', refreshInterval: 'DAILY' },

  // Operational (5)
  { code: 'TOTAL_LOADS', name: 'Total Loads', category: 'OPERATIONAL', unit: 'COUNT', aggregation: 'SUM', refreshInterval: 'HOURLY' },
  { code: 'LOADS_IN_TRANSIT', name: 'Loads In Transit', category: 'OPERATIONAL', unit: 'COUNT', aggregation: 'SUM', refreshInterval: 'REALTIME' },
  { code: 'ON_TIME_DELIVERY', name: 'On-Time Delivery %', category: 'OPERATIONAL', unit: 'PERCENT', aggregation: 'AVG', refreshInterval: 'DAILY' },
  { code: 'AVERAGE_TRANSIT_TIME', name: 'Avg Transit Time', category: 'OPERATIONAL', unit: 'HOURS', aggregation: 'AVG', refreshInterval: 'DAILY' },
  { code: 'LOAD_UTILIZATION', name: 'Load Utilization %', category: 'OPERATIONAL', unit: 'PERCENT', aggregation: 'AVG', refreshInterval: 'DAILY' },

  // Sales (4)
  { code: 'QUOTES_SENT', name: 'Quotes Sent', category: 'SALES', unit: 'COUNT', aggregation: 'SUM', refreshInterval: 'HOURLY' },
  { code: 'QUOTE_CONVERSION_RATE', name: 'Quote Conversion %', category: 'SALES', unit: 'PERCENT', aggregation: 'AVG', refreshInterval: 'DAILY' },
  { code: 'NEW_CUSTOMERS', name: 'New Customers', category: 'CRM', unit: 'COUNT', aggregation: 'SUM', refreshInterval: 'DAILY' },
  { code: 'ACTIVE_LEADS', name: 'Active Leads', category: 'CRM', unit: 'COUNT', aggregation: 'SUM', refreshInterval: 'HOURLY' },

  // Carrier (4)
  { code: 'ACTIVE_CARRIERS', name: 'Active Carriers', category: 'CARRIER', unit: 'COUNT', aggregation: 'SUM', refreshInterval: 'DAILY' },
  { code: 'CARRIER_ON_TIME_RATE', name: 'Carrier On-Time %', category: 'CARRIER', unit: 'PERCENT', aggregation: 'AVG', refreshInterval: 'DAILY' },
  { code: 'AVERAGE_CARRIER_RATE', name: 'Avg Carrier Rate', category: 'CARRIER', unit: 'USD', aggregation: 'AVG', refreshInterval: 'DAILY' },
  { code: 'LEAD_CONVERSION_RATE', name: 'Lead Conversion %', category: 'CRM', unit: 'PERCENT', aggregation: 'AVG', refreshInterval: 'DAILY' },
];

const defaultDashboards = [
  {
    name: 'Executive Dashboard',
    description: 'High-level business overview for leadership',
    isDefault: true,
    widgets: [
      { type: 'KPI_CARD', kpiCode: 'TOTAL_REVENUE', position: { x: 0, y: 0, w: 3, h: 1 } },
      { type: 'KPI_CARD', kpiCode: 'GROSS_MARGIN', position: { x: 3, y: 0, w: 3, h: 1 } },
      { type: 'KPI_CARD', kpiCode: 'TOTAL_LOADS', position: { x: 6, y: 0, w: 3, h: 1 } },
      { type: 'KPI_CARD', kpiCode: 'ON_TIME_DELIVERY', position: { x: 9, y: 0, w: 3, h: 1 } },
      { type: 'LINE_CHART', kpiCode: 'TOTAL_REVENUE', position: { x: 0, y: 1, w: 6, h: 3 }, period: 'MONTHLY' },
      { type: 'BAR_CHART', kpiCode: 'TOTAL_LOADS', position: { x: 6, y: 1, w: 6, h: 3 }, period: 'WEEKLY' },
    ],
  },
  {
    name: 'Operations Dashboard',
    description: 'Daily operations tracking',
    widgets: [
      { type: 'KPI_CARD', kpiCode: 'LOADS_IN_TRANSIT', position: { x: 0, y: 0, w: 3, h: 1 } },
      { type: 'KPI_CARD', kpiCode: 'ON_TIME_DELIVERY', position: { x: 3, y: 0, w: 3, h: 1 } },
      { type: 'KPI_CARD', kpiCode: 'ACTIVE_CARRIERS', position: { x: 6, y: 0, w: 3, h: 1 } },
      { type: 'KPI_CARD', kpiCode: 'AVERAGE_TRANSIT_TIME', position: { x: 9, y: 0, w: 3, h: 1 } },
    ],
  },
  {
    name: 'Sales Dashboard',
    description: 'Sales pipeline and conversion tracking',
    widgets: [
      { type: 'KPI_CARD', kpiCode: 'QUOTES_SENT', position: { x: 0, y: 0, w: 3, h: 1 } },
      { type: 'KPI_CARD', kpiCode: 'QUOTE_CONVERSION_RATE', position: { x: 3, y: 0, w: 3, h: 1 } },
      { type: 'KPI_CARD', kpiCode: 'NEW_CUSTOMERS', position: { x: 6, y: 0, w: 3, h: 1 } },
      { type: 'KPI_CARD', kpiCode: 'ACTIVE_LEADS', position: { x: 9, y: 0, w: 3, h: 1 } },
    ],
  },
];
```

#### ANLYT-001d: Wire events for real-time KPI updates (1h)
```typescript
@OnEvent('order.created')
@OnEvent('order.delivered')
async handleOrderEvent(payload: { tenantId: string }) {
  // Invalidate operational KPI cache
  await this.recalculateKPI('TOTAL_LOADS', payload.tenantId);
  await this.recalculateKPI('LOADS_IN_TRANSIT', payload.tenantId);
}

@OnEvent('invoice.created')
@OnEvent('payment.received')
async handleFinancialEvent(payload: { tenantId: string }) {
  await this.recalculateKPI('TOTAL_REVENUE', payload.tenantId);
  await this.recalculateKPI('ACCOUNTS_RECEIVABLE', payload.tenantId);
}

@OnEvent('quote.created')
@OnEvent('quote.won')
async handleSalesEvent(payload: { tenantId: string }) {
  await this.recalculateKPI('QUOTES_SENT', payload.tenantId);
  await this.recalculateKPI('QUOTE_CONVERSION_RATE', payload.tenantId);
}
```

#### ANLYT-001e: Add CSV/Excel/PDF export to data endpoint (1-2h)
Add format parameter to existing data export endpoint:
```typescript
@Get('data/export')
async exportData(
  @Query('format') format: 'csv' | 'excel' | 'pdf',
  @Query('kpiCodes') kpiCodes: string[],
  @Query('period') period: string,
  @CurrentTenant() tenantId: string,
  @Res() res: Response,
) {
  const data = await this.dataService.query(kpiCodes, period, tenantId);
  const buffer = await this.exportService.export(data, format);

  res.set({
    'Content-Type': format === 'csv' ? 'text/csv' : format === 'excel'
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'application/pdf',
    'Content-Disposition': `attachment; filename="analytics-export.${format === 'excel' ? 'xlsx' : format}"`,
  });
  res.send(buffer);
}
```

#### ANLYT-001f: Write tests (1-2h)
- KPI calculation: TOTAL_REVENUE with 3 invoices → correct sum
- KPI calculation: GROSS_MARGIN with known revenue and costs → correct %
- KPI calculation: ON_TIME_DELIVERY with 8/10 on-time → 80%
- Report execution: generates valid CSV with correct columns
- Report execution: generates valid XLSX file
- Scheduled calculation: runs for all active tenants
- Export: CSV download returns correct content type

### Acceptance Criteria
- [ ] KPI calculation engine produces correct values from real data
- [ ] 18+ system KPIs seeded and calculating
- [ ] Report execution generates CSV/Excel/PDF files
- [ ] 3 default dashboards seeded (Executive, Operations, Sales)
- [ ] Events trigger KPI recalculation
- [ ] Export endpoint returns correct file formats
- [ ] 15+ tests passing

---

## SVC-ANLYT-002: Analytics UI Pages [P1]
**Effort:** L (8-12h) | 11 pages

### Current State: ZERO frontend exists

### Sub-tasks

#### ANLYT-002a: Create Analytics hooks (2h)

**Create:** `apps/web/lib/hooks/analytics/use-dashboards.ts`
```typescript
export function useDashboards() { ... }
export function useDashboard(id: string) { ... }
export function useCreateDashboard() { return useMutation(...); }
export function useUpdateDashboard() { return useMutation(...); }
export function useDeleteDashboard() { return useMutation(...); }
```

**Create:** `apps/web/lib/hooks/analytics/use-kpis.ts`
```typescript
export function useKpis(category?: string) { ... }
export function useKpiSnapshots(kpiId: string, period: string) { ... }
export function useKpiCurrent(kpiCode: string) { ... }
```

**Create:** `apps/web/lib/hooks/analytics/use-reports.ts`
```typescript
export function useReports() { ... }
export function useReport(id: string) { ... }
export function useExecuteReport() { return useMutation(...); }
export function useReportExecutions(reportId: string) { ... }
export function useCreateReport() { return useMutation(...); }
```

**Create:** `apps/web/lib/hooks/analytics/use-alerts.ts`
```typescript
export function useAlerts(status?: string) { ... }
export function useAcknowledgeAlert() { return useMutation(...); }
export function useResolveAlert() { return useMutation(...); }
```

**Create:** `apps/web/lib/hooks/analytics/use-data-query.ts`
```typescript
export function useDataQuery(query: DataQueryParams) { ... }
export function useDataExport() { return useMutation(...); }
export function useTrends(kpiCode: string, period: string) { ... }
```

#### ANLYT-002b: Analytics Dashboard Page (2-3h)
**Create:** `apps/web/app/(dashboard)/analytics/page.tsx`

```
┌────────────────────────────────────────────────────┐
│ Analytics    [Executive ▼]  [Period: This Month ▼]  │
├──────────┬──────────┬──────────┬──────────────────┤
│ Revenue  │ Margin   │ Loads    │ On-Time          │
│ $125K ↑5%│ 22% ↓2% │ 342 ↑12%│ 94% ↑1%          │
├──────────┴──────────┼──────────┴──────────────────┤
│                     │                              │
│  Revenue Trend      │  Load Volume                 │
│  [Line Chart]       │  [Bar Chart]                 │
│                     │                              │
├─────────────────────┴──────────────────────────────┤
│ Top Carriers by Volume    │ Revenue by Customer     │
│ [Table]                   │ [Pie Chart]             │
└───────────────────────────┴────────────────────────┘
```

Features:
- Dashboard selector dropdown (Executive, Operations, Sales, or custom)
- Period selector (Today, This Week, This Month, This Quarter, Custom)
- KPI cards with trend arrows (↑↓) and % change vs previous period
- Widget grid with responsive layout
- Auto-refresh toggle (30s interval)
- Full-screen mode for presentations

**Install chart library:**
```bash
cd apps/web && pnpm add recharts
```

#### ANLYT-002c: KPI Overview + Detail Pages (2h)
**Create:** `apps/web/app/(dashboard)/analytics/kpis/page.tsx`

Grid of KPI cards:
- Each card: name, current value, trend sparkline, category badge
- Filter by category tabs: All | Financial | Operational | Sales | Carrier | CRM
- Click any card → drill-down detail

**Create:** `apps/web/app/(dashboard)/analytics/kpis/[id]/page.tsx`

Detail page:
- Large line chart: KPI value over time (daily/weekly/monthly)
- Period comparison: this period vs last period (side-by-side or overlay)
- Threshold indicators: red zone (bad), yellow (warning), green (good)
- Related KPIs panel (e.g., Revenue → Margin, DSO, AR)
- Data table below chart with exact values

#### ANLYT-002d: Dashboard Builder Page (2-3h)
**Create:** `apps/web/app/(dashboard)/analytics/dashboards/builder/page.tsx`

**Install:**
```bash
cd apps/web && pnpm add react-grid-layout @types/react-grid-layout
```

Features:
- Drag-and-drop grid layout (react-grid-layout)
- Widget palette sidebar:
  - KPI Card (single metric with trend)
  - Line Chart (time series)
  - Bar Chart (comparison)
  - Pie Chart (distribution)
  - Data Table (tabular data)
  - Gauge (percentage metric)
- Widget configuration panel:
  - Select data source (KPI code)
  - Colors / thresholds
  - Period / refresh interval
  - Title override
- Save button → persist layout + widget configs
- Share dashboard link
- Delete dashboard

#### ANLYT-002e: Reports Library + Execution Page (2h)
**Create:** `apps/web/app/(dashboard)/analytics/reports/page.tsx`

Report list:
- Name, Category, Last Run, Schedule, Format, Actions
- Run Now button → executes report, shows progress
- Schedule button → cron configuration dialog
- Download last execution

**Create:** `apps/web/app/(dashboard)/analytics/reports/[id]/page.tsx`

Report detail:
- Report metadata (name, description, query, columns)
- Execution history table (date, status, rows, download link)
- Run with parameters form
- Preview results in table (first 100 rows)
- Download buttons: CSV, Excel, PDF

#### ANLYT-002f: Alerts Page (1h)
**Create:** `apps/web/app/(dashboard)/analytics/alerts/page.tsx`

Table: KPI, Condition, Value, Threshold, Status (Active/Acknowledged/Resolved), Time, Actions
- Status filter tabs: Active | Acknowledged | Resolved
- Acknowledge button (stops re-alerting, keeps tracking)
- Resolve button (closes alert, logs resolution)
- Alert rule configuration: KPI + condition (above/below/equals) + threshold + notification channel

#### ANLYT-002g: Data Explorer Page (1h)
**Create:** `apps/web/app/(dashboard)/analytics/explorer/page.tsx`

Ad-hoc query builder:
- Dimension selector (time period, entity type, status)
- Measure selector (KPI codes to include)
- Group by option
- Results table with sortable columns
- Export results to CSV/Excel
- Save as custom report

#### ANLYT-002h: Trends Page (1h)
**Create:** `apps/web/app/(dashboard)/analytics/trends/page.tsx`

Multi-KPI trend comparison:
- Select 2-4 KPIs to compare on same chart
- Period selector (30 days, 90 days, 1 year)
- Overlay or side-by-side view
- Anomaly detection (highlight unusual values)

#### ANLYT-002i: Add navigation, loading, error states (30min)
- Add "Analytics" section to sidebar navigation
- **Create:** `apps/web/app/(dashboard)/analytics/loading.tsx`
- **Create:** `apps/web/app/(dashboard)/analytics/error.tsx`

### Acceptance Criteria
- [ ] Analytics dashboard shows real KPI data with charts
- [ ] KPI drill-down shows trends over time with period comparison
- [ ] Dashboard builder with drag-and-drop widgets works
- [ ] Reports generate and download in CSV/Excel/PDF
- [ ] Alerts center shows active/acknowledged/resolved alerts
- [ ] Data explorer runs ad-hoc queries with export
- [ ] Trend comparison page renders multi-KPI charts
- [ ] All 11 pages show 4 states

---

## SVC-ANLYT-003: Analytics Tests [P1]
**Effort:** M (3-4h) | AC: 15+ tests

### Sub-tasks

#### ANLYT-003a: Backend — KPI calculation accuracy
- TOTAL_REVENUE: 3 paid invoices ($100, $200, $300) → $600
- GROSS_MARGIN: revenue $1000, costs $700 → 30%
- ON_TIME_DELIVERY: 8/10 loads on time → 80%
- DSO: $50K AR, $5K daily revenue → 10 days
- QUOTE_CONVERSION_RATE: 20 quotes, 5 won → 25%

#### ANLYT-003b: Backend — report execution
- Execute CSV report → valid CSV buffer with correct headers
- Execute Excel report → valid XLSX buffer
- Failed query → execution record status = 'FAILED'

#### ANLYT-003c: Backend — dashboard widget CRUD
- Create dashboard → add widgets → retrieve → widgets included
- Update widget position → persisted correctly
- Delete widget → removed from dashboard

#### ANLYT-003d: Backend — alert trigger
- KPI value crosses threshold → alert created
- KPI value returns to normal → no duplicate alert
- Acknowledge → status updated, no re-alert

#### ANLYT-003e: Frontend — dashboard renders
- KPI cards render with values
- Chart components render without crash
- Empty state: no data → "No data available for this period"

#### ANLYT-003f: E2E — analytics workflow
- View dashboard → see KPI cards with values
- Click KPI → drill-down page with chart
- Run report → download CSV → verify contents
- Create custom dashboard → add widget → save → reload → persisted

### Acceptance Criteria
- [ ] 15+ tests passing
- [ ] KPI calculations verified with known data (5 specific KPIs tested)
- [ ] Export formats validated (CSV parseable, XLSX openable)
- [ ] Dashboard persistence tested

---

## Phase 5 Summary

| Task | Priority | Effort | Scope |
|------|----------|--------|-------|
| SVC-ANLYT-001 | P0 | L (8-12h) | Analytics backend completion |
| SVC-ANLYT-002 | P1 | L (8-12h) | 11 analytics pages |
| SVC-ANLYT-003 | P1 | M (3-4h) | 15+ tests |
| **TOTAL** | | **19-28h** | |

### Execution Order
1. ANLYT-001a (KPI engine — core business logic, everything depends on this)
2. ANLYT-001b (report engine) + ANLYT-001c (seed data) — parallel
3. ANLYT-001d-e (events + export)
4. ANLYT-001f (backend tests)
5. ANLYT-002a (hooks) → ANLYT-002b-i (pages)
6. ANLYT-003 (full test suite)
