# 18 - Analytics UI Implementation

> **Service:** Analytics (Reporting & Business Intelligence)  
> **Priority:** P2 - Medium  
> **Pages:** 8  
> **API Endpoints:** 24  
> **Dependencies:** Foundation ✅, Auth API ✅, Analytics API ✅  
> **Doc Reference:** [25-service-analytics.md](../../02-services/25-service-analytics.md)

---

## 📋 Overview

The Analytics UI provides comprehensive dashboards, reports, and visualizations for business intelligence. This includes operational KPIs, financial metrics, performance trends, and exportable reports.

### Key Screens
- Executive dashboard
- Operational metrics
- Financial reports
- Sales analytics
- Carrier performance
- Customer insights
- Custom reports builder
- Scheduled reports

---

## ✅ Pre-Implementation Checklist

Before starting, verify:

- [ ] Foundation prompt (00) is complete
- [ ] Auth prompt (01) is complete
- [ ] Analytics API is deployed

---

## 🗂️ Route Structure

```
app/(dashboard)/
├── analytics/
│   ├── page.tsx                    # Executive dashboard
│   ├── operations/
│   │   └── page.tsx                # Operational metrics
│   ├── financial/
│   │   └── page.tsx                # Financial reports
│   ├── sales/
│   │   └── page.tsx                # Sales analytics
│   ├── carriers/
│   │   └── page.tsx                # Carrier performance
│   ├── customers/
│   │   └── page.tsx                # Customer insights
│   ├── reports/
│   │   ├── page.tsx                # Report library
│   │   ├── builder/
│   │   │   └── page.tsx            # Custom report builder
│   │   └── scheduled/
│   │       └── page.tsx            # Scheduled reports
│   └── exports/
│       └── page.tsx                # Export history
```

---

## 🎨 Components to Create

```
components/analytics/
├── executive-dashboard.tsx         # Main dashboard
├── kpi-card.tsx                    # KPI metric card
├── kpi-trend.tsx                   # Mini trend chart
├── revenue-chart.tsx               # Revenue over time
├── volume-chart.tsx                # Load volume
├── margin-chart.tsx                # Margin analysis
├── top-customers-table.tsx         # Top performers
├── top-carriers-table.tsx          # Top carriers
├── top-lanes-table.tsx             # Top lanes
├── operations-metrics.tsx          # Op metrics grid
├── on-time-delivery-chart.tsx      # OTD trends
├── load-status-chart.tsx           # Status breakdown
├── financial-summary.tsx           # Financial overview
├── ar-aging-chart.tsx              # AR aging
├── sales-pipeline-chart.tsx        # Pipeline stages
├── sales-rep-leaderboard.tsx       # Rep performance
├── carrier-scorecard.tsx           # Carrier metrics
├── customer-lifetime-value.tsx     # CLV analysis
├── date-range-picker.tsx           # Date selection
├── report-filters.tsx              # Filter controls
├── report-builder.tsx              # Custom builder
├── report-template-card.tsx        # Template preview
├── scheduled-report-form.tsx       # Schedule setup
├── export-button.tsx               # Export action
└── comparison-selector.tsx         # Period comparison
```

---

## 📝 TypeScript Interfaces

### File: `lib/types/analytics.ts`

```typescript
export type ReportFormat = 'PDF' | 'EXCEL' | 'CSV';
export type ReportFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
export type ChartType = 'LINE' | 'BAR' | 'PIE' | 'DONUT' | 'AREA' | 'TABLE';
export type MetricPeriod = 'TODAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR' | 'CUSTOM';

export interface KPIMetric {
  id: string;
  name: string;
  value: number;
  previousValue?: number;
  change?: number;
  changePercent?: number;
  trend: 'UP' | 'DOWN' | 'FLAT';
  isPositive: boolean; // Is trend direction good?
  format: 'NUMBER' | 'CURRENCY' | 'PERCENT';
  period: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  previousValue?: number;
}

export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color?: string;
}

export interface DashboardData {
  // Summary KPIs
  kpis: KPIMetric[];
  
  // Revenue
  revenueChart: {
    series: ChartSeries[];
    total: number;
    change: number;
  };
  
  // Volume
  volumeChart: {
    series: ChartSeries[];
    total: number;
    change: number;
  };
  
  // Margin
  marginChart: {
    series: ChartSeries[];
    avgMargin: number;
    avgMarginPercent: number;
  };
  
  // Top Performers
  topCustomers: Array<{ id: string; name: string; revenue: number; loads: number }>;
  topCarriers: Array<{ id: string; name: string; loads: number; onTime: number }>;
  topLanes: Array<{ origin: string; destination: string; loads: number; revenue: number }>;
  
  // Status
  loadsByStatus: Array<{ status: string; count: number }>;
}

export interface OperationsMetrics {
  // Volume
  totalLoads: number;
  loadsInTransit: number;
  loadsDelivered: number;
  loadsPending: number;
  
  // Performance
  onTimePickupRate: number;
  onTimeDeliveryRate: number;
  avgTransitDays: number;
  
  // Issues
  claimsCount: number;
  claimsValue: number;
  carrierIssues: number;
  
  // Charts
  loadVolumeByDay: ChartSeries[];
  deliveryPerformance: ChartSeries[];
  issuesByType: ChartDataPoint[];
}

export interface FinancialMetrics {
  // Revenue
  totalRevenue: number;
  revenueByService: ChartDataPoint[];
  
  // Costs
  totalCosts: number;
  costBreakdown: ChartDataPoint[];
  
  // Margin
  grossMargin: number;
  grossMarginPercent: number;
  marginByCustomer: Array<{ name: string; margin: number; marginPercent: number }>;
  
  // AR/AP
  accountsReceivable: number;
  accountsPayable: number;
  arAging: ChartDataPoint[];
  apAging: ChartDataPoint[];
  
  // Collections
  daysToCollect: number;
  collectionRate: number;
}

export interface SalesMetrics {
  // Pipeline
  pipelineValue: number;
  pipelineByStage: ChartDataPoint[];
  
  // Conversion
  conversionRate: number;
  avgDealSize: number;
  avgCycleTime: number;
  
  // Rep Performance
  repPerformance: Array<{
    id: string;
    name: string;
    quotesCreated: number;
    quotesWon: number;
    revenue: number;
    winRate: number;
  }>;
  
  // Trends
  quoteTrends: ChartSeries[];
  winRateTrends: ChartSeries[];
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  type: ChartType;
  
  // Configuration
  metrics: string[];
  dimensions: string[];
  filters?: Record<string, unknown>;
  
  // Layout
  layout?: unknown;
  
  isDefault: boolean;
  isCustom: boolean;
  
  createdById?: string;
  createdAt: string;
}

export interface ScheduledReport {
  id: string;
  name: string;
  templateId: string;
  templateName: string;
  
  // Schedule
  frequency: ReportFrequency;
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  timezone: string;
  
  // Filters
  filters?: Record<string, unknown>;
  
  // Format
  format: ReportFormat;
  
  // Recipients
  recipients: string[];
  
  // Status
  isActive: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  
  createdById: string;
  createdAt: string;
}

export interface ExportJob {
  id: string;
  reportName: string;
  format: ReportFormat;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  
  // Result
  downloadUrl?: string;
  fileSize?: number;
  expiresAt?: string;
  
  // Error
  errorMessage?: string;
  
  requestedById: string;
  requestedAt: string;
  completedAt?: string;
}
```

---

## 🪝 React Query Hooks

### File: `lib/hooks/analytics/use-analytics.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, PaginatedResponse } from '@/lib/api';
import {
  DashboardData,
  OperationsMetrics,
  FinancialMetrics,
  SalesMetrics,
  ReportTemplate,
  ScheduledReport,
  ExportJob,
  MetricPeriod,
} from '@/lib/types/analytics';
import { toast } from 'sonner';

export const analyticsKeys = {
  all: ['analytics'] as const,
  
  dashboard: (period: MetricPeriod, params?: Record<string, unknown>) => 
    [...analyticsKeys.all, 'dashboard', period, params] as const,
  operations: (period: MetricPeriod, params?: Record<string, unknown>) => 
    [...analyticsKeys.all, 'operations', period, params] as const,
  financial: (period: MetricPeriod, params?: Record<string, unknown>) => 
    [...analyticsKeys.all, 'financial', period, params] as const,
  sales: (period: MetricPeriod, params?: Record<string, unknown>) => 
    [...analyticsKeys.all, 'sales', period, params] as const,
  carriers: (period: MetricPeriod, params?: Record<string, unknown>) => 
    [...analyticsKeys.all, 'carriers', period, params] as const,
  customers: (period: MetricPeriod, params?: Record<string, unknown>) => 
    [...analyticsKeys.all, 'customers', period, params] as const,
  
  templates: () => [...analyticsKeys.all, 'templates'] as const,
  templateDetail: (id: string) => [...analyticsKeys.templates(), id] as const,
  
  scheduled: () => [...analyticsKeys.all, 'scheduled'] as const,
  scheduledList: (params?: Record<string, unknown>) => [...analyticsKeys.scheduled(), 'list', params] as const,
  scheduledDetail: (id: string) => [...analyticsKeys.scheduled(), id] as const,
  
  exports: () => [...analyticsKeys.all, 'exports'] as const,
  exportsList: (params?: Record<string, unknown>) => [...analyticsKeys.exports(), 'list', params] as const,
};

// Dashboard
export function useDashboard(period: MetricPeriod = 'MONTH', params = {}) {
  return useQuery({
    queryKey: analyticsKeys.dashboard(period, params),
    queryFn: () => apiClient.get<{ data: DashboardData }>('/analytics/dashboard', { period, ...params }),
  });
}

// Operations
export function useOperationsMetrics(period: MetricPeriod = 'MONTH', params = {}) {
  return useQuery({
    queryKey: analyticsKeys.operations(period, params),
    queryFn: () => apiClient.get<{ data: OperationsMetrics }>('/analytics/operations', { period, ...params }),
  });
}

// Financial
export function useFinancialMetrics(period: MetricPeriod = 'MONTH', params = {}) {
  return useQuery({
    queryKey: analyticsKeys.financial(period, params),
    queryFn: () => apiClient.get<{ data: FinancialMetrics }>('/analytics/financial', { period, ...params }),
  });
}

// Sales
export function useSalesMetrics(period: MetricPeriod = 'MONTH', params = {}) {
  return useQuery({
    queryKey: analyticsKeys.sales(period, params),
    queryFn: () => apiClient.get<{ data: SalesMetrics }>('/analytics/sales', { period, ...params }),
  });
}

// Carriers Analytics
export function useCarriersAnalytics(period: MetricPeriod = 'MONTH', params = {}) {
  return useQuery({
    queryKey: analyticsKeys.carriers(period, params),
    queryFn: () => apiClient.get('/analytics/carriers', { period, ...params }),
  });
}

// Customers Analytics
export function useCustomersAnalytics(period: MetricPeriod = 'MONTH', params = {}) {
  return useQuery({
    queryKey: analyticsKeys.customers(period, params),
    queryFn: () => apiClient.get('/analytics/customers', { period, ...params }),
  });
}

// Report Templates
export function useReportTemplates() {
  return useQuery({
    queryKey: analyticsKeys.templates(),
    queryFn: () => apiClient.get<{ data: ReportTemplate[] }>('/analytics/templates'),
  });
}

export function useReportTemplate(id: string) {
  return useQuery({
    queryKey: analyticsKeys.templateDetail(id),
    queryFn: () => apiClient.get<{ data: ReportTemplate }>(`/analytics/templates/${id}`),
    enabled: !!id,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<ReportTemplate>) =>
      apiClient.post<{ data: ReportTemplate }>('/analytics/templates', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.templates() });
      toast.success('Report template created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create template');
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ReportTemplate> }) =>
      apiClient.patch<{ data: ReportTemplate }>(`/analytics/templates/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.templates() });
      toast.success('Template updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update template');
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/analytics/templates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.templates() });
      toast.success('Template deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete template');
    },
  });
}

// Scheduled Reports
export function useScheduledReports(params = {}) {
  return useQuery({
    queryKey: analyticsKeys.scheduledList(params),
    queryFn: () => apiClient.get<PaginatedResponse<ScheduledReport>>('/analytics/scheduled', params),
  });
}

export function useScheduledReport(id: string) {
  return useQuery({
    queryKey: analyticsKeys.scheduledDetail(id),
    queryFn: () => apiClient.get<{ data: ScheduledReport }>(`/analytics/scheduled/${id}`),
    enabled: !!id,
  });
}

export function useCreateScheduledReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<ScheduledReport>) =>
      apiClient.post<{ data: ScheduledReport }>('/analytics/scheduled', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.scheduled() });
      toast.success('Scheduled report created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to schedule report');
    },
  });
}

export function useUpdateScheduledReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ScheduledReport> }) =>
      apiClient.patch<{ data: ScheduledReport }>(`/analytics/scheduled/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.scheduled() });
      toast.success('Schedule updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update schedule');
    },
  });
}

export function useDeleteScheduledReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/analytics/scheduled/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.scheduled() });
      toast.success('Schedule deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete schedule');
    },
  });
}

// Exports
export function useExports(params = {}) {
  return useQuery({
    queryKey: analyticsKeys.exportsList(params),
    queryFn: () => apiClient.get<PaginatedResponse<ExportJob>>('/analytics/exports', params),
  });
}

export function useExportReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ templateId, format, filters }: { 
      templateId: string; 
      format: string; 
      filters?: Record<string, unknown>;
    }) =>
      apiClient.post<{ data: ExportJob }>('/analytics/exports', { templateId, format, filters }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.exports() });
      toast.success('Export started');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to export');
    },
  });
}
```

---

## 🗄️ Zustand Store

### File: `lib/stores/analytics-store.ts`

```typescript
import { createStore } from './create-store';
import { MetricPeriod } from '@/lib/types/analytics';

interface DateRange {
  from?: Date;
  to?: Date;
}

interface AnalyticsFilters {
  period: MetricPeriod;
  customDateRange: DateRange;
  compareWith: MetricPeriod | null;
  customerId: string;
  carrierId: string;
  salesRepId: string;
}

interface AnalyticsState {
  filters: AnalyticsFilters;
  selectedTemplateId: string | null;
  isExportDialogOpen: boolean;
  isScheduleDialogOpen: boolean;
  
  setFilter: <K extends keyof AnalyticsFilters>(key: K, value: AnalyticsFilters[K]) => void;
  resetFilters: () => void;
  setPeriod: (period: MetricPeriod) => void;
  setDateRange: (range: DateRange) => void;
  setSelectedTemplate: (id: string | null) => void;
  setExportDialogOpen: (open: boolean) => void;
  setScheduleDialogOpen: (open: boolean) => void;
}

const defaultFilters: AnalyticsFilters = {
  period: 'MONTH',
  customDateRange: {},
  compareWith: null,
  customerId: '',
  carrierId: '',
  salesRepId: '',
};

export const useAnalyticsStore = createStore<AnalyticsState>('analytics-store', (set, get) => ({
  filters: defaultFilters,
  selectedTemplateId: null,
  isExportDialogOpen: false,
  isScheduleDialogOpen: false,
  
  setFilter: (key, value) =>
    set({ filters: { ...get().filters, [key]: value } }),
  
  resetFilters: () => set({ filters: defaultFilters }),
  
  setPeriod: (period) =>
    set({ filters: { ...get().filters, period, customDateRange: {} } }),
  
  setDateRange: (range) =>
    set({ filters: { ...get().filters, period: 'CUSTOM', customDateRange: range } }),
  
  setSelectedTemplate: (id) => set({ selectedTemplateId: id }),
  
  setExportDialogOpen: (open) => set({ isExportDialogOpen: open }),
  
  setScheduleDialogOpen: (open) => set({ isScheduleDialogOpen: open }),
}));
```

---

## 📄 Zod Validation Schemas

### File: `lib/validations/analytics.ts`

```typescript
import { z } from 'zod';

export const templateFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  type: z.enum(['LINE', 'BAR', 'PIE', 'DONUT', 'AREA', 'TABLE']),
  metrics: z.array(z.string()).min(1, 'At least one metric is required'),
  dimensions: z.array(z.string()).min(1, 'At least one dimension is required'),
});

export const scheduledReportFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  templateId: z.string().min(1, 'Template is required'),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY']),
  dayOfWeek: z.number().min(0).max(6).optional(),
  dayOfMonth: z.number().min(1).max(31).optional(),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  timezone: z.string().min(1, 'Timezone is required'),
  format: z.enum(['PDF', 'EXCEL', 'CSV']),
  recipients: z.array(z.string().email()).min(1, 'At least one recipient is required'),
  isActive: z.boolean().default(true),
});

export const exportFormSchema = z.object({
  templateId: z.string().min(1, 'Template is required'),
  format: z.enum(['PDF', 'EXCEL', 'CSV']),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }).optional(),
});

export type TemplateFormData = z.infer<typeof templateFormSchema>;
export type ScheduledReportFormData = z.infer<typeof scheduledReportFormSchema>;
export type ExportFormData = z.infer<typeof exportFormSchema>;
```

---

## ✅ Completion Checklist

### Components
- [ ] `components/analytics/executive-dashboard.tsx`
- [ ] `components/analytics/kpi-card.tsx`
- [ ] `components/analytics/kpi-trend.tsx`
- [ ] `components/analytics/revenue-chart.tsx`
- [ ] `components/analytics/volume-chart.tsx`
- [ ] `components/analytics/margin-chart.tsx`
- [ ] `components/analytics/top-customers-table.tsx`
- [ ] `components/analytics/top-carriers-table.tsx`
- [ ] `components/analytics/top-lanes-table.tsx`
- [ ] `components/analytics/operations-metrics.tsx`
- [ ] `components/analytics/on-time-delivery-chart.tsx`
- [ ] `components/analytics/load-status-chart.tsx`
- [ ] `components/analytics/financial-summary.tsx`
- [ ] `components/analytics/ar-aging-chart.tsx`
- [ ] `components/analytics/sales-pipeline-chart.tsx`
- [ ] `components/analytics/sales-rep-leaderboard.tsx`
- [ ] `components/analytics/carrier-scorecard.tsx`
- [ ] `components/analytics/customer-lifetime-value.tsx`
- [ ] `components/analytics/date-range-picker.tsx`
- [ ] `components/analytics/report-filters.tsx`
- [ ] `components/analytics/report-builder.tsx`
- [ ] `components/analytics/report-template-card.tsx`
- [ ] `components/analytics/scheduled-report-form.tsx`
- [ ] `components/analytics/export-button.tsx`
- [ ] `components/analytics/comparison-selector.tsx`

### Pages
- [ ] `app/(dashboard)/analytics/page.tsx`
- [ ] `app/(dashboard)/analytics/operations/page.tsx`
- [ ] `app/(dashboard)/analytics/financial/page.tsx`
- [ ] `app/(dashboard)/analytics/sales/page.tsx`
- [ ] `app/(dashboard)/analytics/carriers/page.tsx`
- [ ] `app/(dashboard)/analytics/customers/page.tsx`
- [ ] `app/(dashboard)/analytics/reports/page.tsx`
- [ ] `app/(dashboard)/analytics/reports/builder/page.tsx`
- [ ] `app/(dashboard)/analytics/reports/scheduled/page.tsx`
- [ ] `app/(dashboard)/analytics/exports/page.tsx`

### Hooks & Stores
- [ ] `lib/types/analytics.ts`
- [ ] `lib/validations/analytics.ts`
- [ ] `lib/hooks/analytics/use-analytics.ts`
- [ ] `lib/stores/analytics-store.ts`

### Tests
- [ ] Component tests
- [ ] Hook tests
- [ ] MSW handlers
- [ ] All tests passing: `pnpm test`

---

## 🔗 Next Steps

After completing this prompt:
1. Proceed to [19-workflow-ui.md](./19-workflow-ui.md)
2. Update [00-index.md](./00-index.md) status

---

## 📚 Reference

- [Service Documentation](../../02-services/25-service-analytics.md)
- [API Review](../../api-review-docs/18-analytics-review.html)
