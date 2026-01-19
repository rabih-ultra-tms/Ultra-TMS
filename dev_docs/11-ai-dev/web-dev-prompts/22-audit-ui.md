# 22 - Audit UI Implementation

> **Service:** Audit (Audit Logging & Compliance)  
> **Priority:** P2 - Medium  
> **Pages:** 4  
> **API Endpoints:** 14  
> **Dependencies:** Foundation ✅, Auth API ✅, Audit API ✅  
> **Doc Reference:** [29-service-audit.md](../../02-services/29-service-audit.md)

---

## 📋 Overview

The Audit UI provides interfaces for viewing audit logs, entity history, user activity tracking, and compliance reporting. This enables administrators to track all changes and actions across the TMS.

### Key Screens
- Audit dashboard
- Audit log viewer
- Entity history timeline
- User activity logs
- Compliance reports

---

## ✅ Pre-Implementation Checklist

Before starting, verify:

- [ ] Foundation prompt (00) is complete
- [ ] Auth prompt (01) is complete
- [ ] Audit API is deployed

---

## 🗂️ Route Structure

```
app/(dashboard)/
├── admin/
│   └── audit/
│       ├── page.tsx                # Audit dashboard
│       ├── logs/
│       │   └── page.tsx            # All audit logs
│       ├── entities/
│       │   └── [type]/
│       │       └── [id]/
│       │           └── page.tsx    # Entity history
│       ├── users/
│       │   └── [id]/
│       │       └── page.tsx        # User activity
│       └── reports/
│           └── page.tsx            # Compliance reports
```

---

## 🎨 Components to Create

```
components/audit/
├── audit-dashboard-stats.tsx       # Dashboard metrics
├── activity-chart.tsx              # Activity over time
├── audit-logs-table.tsx            # Main log viewer
├── audit-log-columns.tsx           # Column definitions
├── audit-log-detail.tsx            # Full log entry
├── log-diff-viewer.tsx             # Before/after diff
├── entity-history-timeline.tsx     # Entity changes
├── entity-history-entry.tsx        # Single change
├── user-activity-table.tsx         # User actions
├── user-activity-summary.tsx       # User stats
├── audit-filters.tsx               # Filter controls
├── entity-type-filter.tsx          # Entity type select
├── action-type-filter.tsx          # Action type select
├── date-range-filter.tsx           # Date filtering
├── user-filter.tsx                 # User select
├── export-logs-button.tsx          # Export to CSV/PDF
├── compliance-report.tsx           # Compliance view
└── audit-alert-card.tsx            # Suspicious activity
```

---

## 📝 TypeScript Interfaces

### File: `lib/types/audit.ts`

```typescript
export type AuditAction = 
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'VIEW'
  | 'LOGIN'
  | 'LOGOUT'
  | 'EXPORT'
  | 'IMPORT'
  | 'APPROVE'
  | 'REJECT'
  | 'STATUS_CHANGE'
  | 'PERMISSION_CHANGE';

export type AuditEntityType = 
  | 'USER'
  | 'ROLE'
  | 'CUSTOMER'
  | 'CARRIER'
  | 'LOAD'
  | 'ORDER'
  | 'INVOICE'
  | 'PAYMENT'
  | 'QUOTE'
  | 'CONTRACT'
  | 'DOCUMENT'
  | 'SETTING';

export type AuditSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface AuditLog {
  id: string;
  
  // Action
  action: AuditAction;
  description: string;
  
  // Entity
  entityType: AuditEntityType;
  entityId: string;
  entityName?: string;
  
  // User
  userId: string;
  userName: string;
  userEmail: string;
  
  // Context
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  
  // Changes
  previousValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  changedFields?: string[];
  
  // Metadata
  metadata?: Record<string, unknown>;
  
  // Severity
  severity: AuditSeverity;
  
  // Timestamp
  createdAt: string;
}

export interface AuditLogFilters {
  search?: string;
  action?: AuditAction;
  entityType?: AuditEntityType;
  entityId?: string;
  userId?: string;
  severity?: AuditSeverity;
  dateFrom?: string;
  dateTo?: string;
  ipAddress?: string;
}

export interface EntityHistory {
  entityType: AuditEntityType;
  entityId: string;
  entityName?: string;
  
  // Current state
  currentState?: Record<string, unknown>;
  
  // History
  changes: AuditLog[];
  
  // Stats
  totalChanges: number;
  lastModifiedAt?: string;
  lastModifiedBy?: string;
}

export interface UserActivity {
  userId: string;
  userName: string;
  userEmail: string;
  
  // Stats
  totalActions: number;
  actionsToday: number;
  lastActiveAt?: string;
  
  // Breakdown
  actionsByType: Array<{ action: AuditAction; count: number }>;
  actionsByEntity: Array<{ entityType: AuditEntityType; count: number }>;
  
  // Recent
  recentActivity: AuditLog[];
  
  // Sessions
  activeSessions: number;
  lastLoginAt?: string;
  lastLoginIp?: string;
}

export interface AuditDashboardData {
  // Summary
  totalLogs: number;
  logsToday: number;
  uniqueUsers: number;
  
  // By Action
  actionBreakdown: Array<{ action: AuditAction; count: number }>;
  
  // By Entity
  entityBreakdown: Array<{ entityType: AuditEntityType; count: number }>;
  
  // Trends
  activityByDay: Array<{ date: string; count: number }>;
  activityByHour: Array<{ hour: number; count: number }>;
  
  // Alerts
  criticalEvents: number;
  suspiciousActivity: AuditAlert[];
  
  // Top Users
  topUsers: Array<{ userId: string; name: string; actions: number }>;
}

export interface AuditAlert {
  id: string;
  type: 'MULTIPLE_FAILED_LOGINS' | 'UNUSUAL_ACTIVITY' | 'MASS_DELETE' | 'PERMISSION_ESCALATION';
  description: string;
  userId?: string;
  userName?: string;
  severity: AuditSeverity;
  createdAt: string;
  isResolved: boolean;
}

export interface ComplianceReport {
  id: string;
  name: string;
  type: 'ACCESS_REVIEW' | 'DATA_CHANGES' | 'LOGIN_HISTORY' | 'PERMISSION_CHANGES' | 'CUSTOM';
  
  // Period
  periodStart: string;
  periodEnd: string;
  
  // Status
  status: 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';
  
  // Result
  downloadUrl?: string;
  recordCount?: number;
  
  generatedAt?: string;
  generatedById?: string;
}
```

---

## 🪝 React Query Hooks

### File: `lib/hooks/audit/use-audit.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, PaginatedResponse } from '@/lib/api';
import {
  AuditLog,
  AuditLogFilters,
  EntityHistory,
  UserActivity,
  AuditDashboardData,
  AuditAlert,
  ComplianceReport,
} from '@/lib/types/audit';
import { toast } from 'sonner';

export const auditKeys = {
  all: ['audit'] as const,
  dashboard: () => [...auditKeys.all, 'dashboard'] as const,
  
  logs: () => [...auditKeys.all, 'logs'] as const,
  logsList: (params?: AuditLogFilters) => [...auditKeys.logs(), 'list', params] as const,
  logDetail: (id: string) => [...auditKeys.logs(), id] as const,
  
  entity: (type: string, id: string) => [...auditKeys.all, 'entity', type, id] as const,
  
  user: (id: string) => [...auditKeys.all, 'user', id] as const,
  
  alerts: () => [...auditKeys.all, 'alerts'] as const,
  
  reports: () => [...auditKeys.all, 'reports'] as const,
  reportsList: (params?: Record<string, unknown>) => [...auditKeys.reports(), 'list', params] as const,
};

// Dashboard
export function useAuditDashboard() {
  return useQuery({
    queryKey: auditKeys.dashboard(),
    queryFn: () => apiClient.get<{ data: AuditDashboardData }>('/audit/dashboard'),
  });
}

// Audit Logs
export function useAuditLogs(params: AuditLogFilters = {}) {
  return useQuery({
    queryKey: auditKeys.logsList(params),
    queryFn: () => apiClient.get<PaginatedResponse<AuditLog>>('/audit/logs', params),
  });
}

export function useAuditLog(id: string) {
  return useQuery({
    queryKey: auditKeys.logDetail(id),
    queryFn: () => apiClient.get<{ data: AuditLog }>(`/audit/logs/${id}`),
    enabled: !!id,
  });
}

// Entity History
export function useEntityHistory(entityType: string, entityId: string, params = {}) {
  return useQuery({
    queryKey: auditKeys.entity(entityType, entityId),
    queryFn: () => apiClient.get<{ data: EntityHistory }>(`/audit/entities/${entityType}/${entityId}`, params),
    enabled: !!entityType && !!entityId,
  });
}

// User Activity
export function useUserActivity(userId: string, params = {}) {
  return useQuery({
    queryKey: auditKeys.user(userId),
    queryFn: () => apiClient.get<{ data: UserActivity }>(`/audit/users/${userId}`, params),
    enabled: !!userId,
  });
}

// Alerts
export function useAuditAlerts() {
  return useQuery({
    queryKey: auditKeys.alerts(),
    queryFn: () => apiClient.get<{ data: AuditAlert[] }>('/audit/alerts'),
  });
}

export function useResolveAlert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      apiClient.post(`/audit/alerts/${id}/resolve`, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: auditKeys.alerts() });
      queryClient.invalidateQueries({ queryKey: auditKeys.dashboard() });
      toast.success('Alert resolved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to resolve alert');
    },
  });
}

// Export
export function useExportAuditLogs() {
  return useMutation({
    mutationFn: (params: AuditLogFilters & { format: 'CSV' | 'PDF' }) =>
      apiClient.post<{ downloadUrl: string }>('/audit/logs/export', params),
    onSuccess: (data) => {
      window.open(data.downloadUrl, '_blank');
      toast.success('Export ready');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Export failed');
    },
  });
}

// Compliance Reports
export function useComplianceReports(params = {}) {
  return useQuery({
    queryKey: auditKeys.reportsList(params),
    queryFn: () => apiClient.get<PaginatedResponse<ComplianceReport>>('/audit/reports', params),
  });
}

export function useGenerateComplianceReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { type: string; periodStart: string; periodEnd: string; name?: string }) =>
      apiClient.post<{ data: ComplianceReport }>('/audit/reports', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: auditKeys.reports() });
      toast.success('Report generation started');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate report');
    },
  });
}
```

---

## 🗄️ Zustand Store

### File: `lib/stores/audit-store.ts`

```typescript
import { createStore } from './create-store';
import { AuditAction, AuditEntityType, AuditSeverity, AuditLogFilters } from '@/lib/types/audit';

interface AuditState {
  filters: AuditLogFilters;
  selectedLogId: string | null;
  isDetailOpen: boolean;
  isExportDialogOpen: boolean;
  isReportDialogOpen: boolean;
  
  setFilter: <K extends keyof AuditLogFilters>(key: K, value: AuditLogFilters[K]) => void;
  setFilters: (filters: Partial<AuditLogFilters>) => void;
  resetFilters: () => void;
  setSelectedLog: (id: string | null) => void;
  setDetailOpen: (open: boolean) => void;
  setExportDialogOpen: (open: boolean) => void;
  setReportDialogOpen: (open: boolean) => void;
}

const defaultFilters: AuditLogFilters = {};

export const useAuditStore = createStore<AuditState>('audit-store', (set, get) => ({
  filters: defaultFilters,
  selectedLogId: null,
  isDetailOpen: false,
  isExportDialogOpen: false,
  isReportDialogOpen: false,
  
  setFilter: (key, value) =>
    set({ filters: { ...get().filters, [key]: value } }),
  
  setFilters: (filters) =>
    set({ filters: { ...get().filters, ...filters } }),
  
  resetFilters: () => set({ filters: defaultFilters }),
  
  setSelectedLog: (id) => set({ selectedLogId: id, isDetailOpen: !!id }),
  
  setDetailOpen: (open) => set({ isDetailOpen: open }),
  
  setExportDialogOpen: (open) => set({ isExportDialogOpen: open }),
  
  setReportDialogOpen: (open) => set({ isReportDialogOpen: open }),
}));
```

---

## 📄 Zod Validation Schemas

### File: `lib/validations/audit.ts`

```typescript
import { z } from 'zod';

export const auditFilterSchema = z.object({
  search: z.string().optional(),
  action: z.enum([
    'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'LOGOUT',
    'EXPORT', 'IMPORT', 'APPROVE', 'REJECT', 'STATUS_CHANGE', 'PERMISSION_CHANGE'
  ]).optional(),
  entityType: z.enum([
    'USER', 'ROLE', 'CUSTOMER', 'CARRIER', 'LOAD', 'ORDER',
    'INVOICE', 'PAYMENT', 'QUOTE', 'CONTRACT', 'DOCUMENT', 'SETTING'
  ]).optional(),
  entityId: z.string().optional(),
  userId: z.string().optional(),
  severity: z.enum(['INFO', 'WARNING', 'CRITICAL']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const exportAuditSchema = z.object({
  format: z.enum(['CSV', 'PDF']),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  entityType: z.string().optional(),
  action: z.string().optional(),
});

export const complianceReportSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['ACCESS_REVIEW', 'DATA_CHANGES', 'LOGIN_HISTORY', 'PERMISSION_CHANGES', 'CUSTOM']),
  periodStart: z.string().min(1, 'Start date is required'),
  periodEnd: z.string().min(1, 'End date is required'),
});

export type AuditFilterData = z.infer<typeof auditFilterSchema>;
export type ExportAuditData = z.infer<typeof exportAuditSchema>;
export type ComplianceReportData = z.infer<typeof complianceReportSchema>;
```

---

## ✅ Completion Checklist

### Components
- [ ] `components/audit/audit-dashboard-stats.tsx`
- [ ] `components/audit/activity-chart.tsx`
- [ ] `components/audit/audit-logs-table.tsx`
- [ ] `components/audit/audit-log-columns.tsx`
- [ ] `components/audit/audit-log-detail.tsx`
- [ ] `components/audit/log-diff-viewer.tsx`
- [ ] `components/audit/entity-history-timeline.tsx`
- [ ] `components/audit/entity-history-entry.tsx`
- [ ] `components/audit/user-activity-table.tsx`
- [ ] `components/audit/user-activity-summary.tsx`
- [ ] `components/audit/audit-filters.tsx`
- [ ] `components/audit/entity-type-filter.tsx`
- [ ] `components/audit/action-type-filter.tsx`
- [ ] `components/audit/date-range-filter.tsx`
- [ ] `components/audit/user-filter.tsx`
- [ ] `components/audit/export-logs-button.tsx`
- [ ] `components/audit/compliance-report.tsx`
- [ ] `components/audit/audit-alert-card.tsx`

### Pages
- [ ] `app/(dashboard)/admin/audit/page.tsx`
- [ ] `app/(dashboard)/admin/audit/logs/page.tsx`
- [ ] `app/(dashboard)/admin/audit/entities/[type]/[id]/page.tsx`
- [ ] `app/(dashboard)/admin/audit/users/[id]/page.tsx`
- [ ] `app/(dashboard)/admin/audit/reports/page.tsx`

### Hooks & Stores
- [ ] `lib/types/audit.ts`
- [ ] `lib/validations/audit.ts`
- [ ] `lib/hooks/audit/use-audit.ts`
- [ ] `lib/stores/audit-store.ts`

### Tests
- [ ] Component tests
- [ ] Hook tests
- [ ] MSW handlers
- [ ] All tests passing: `pnpm test`

---

## 🔗 Next Steps

After completing this prompt:
1. Proceed to [23-config-ui.md](./23-config-ui.md)
2. Update [00-index.md](./00-index.md) status

---

## 📚 Reference

- [Service Documentation](../../02-services/29-service-audit.md)
- [API Review](../../api-review-docs/22-audit-review.html)
