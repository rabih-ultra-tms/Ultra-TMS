# 20 - Integration Hub UI Implementation

> **Service:** Integration Hub (External Integrations Management)  
> **Priority:** P2 - Medium  
> **Pages:** 6  
> **API Endpoints:** 20  
> **Dependencies:** Foundation ✅, Auth API ✅, Integration Hub API ✅  
> **Doc Reference:** [27-service-integration-hub.md](../../02-services/27-service-integration-hub.md)

---

## 📋 Overview

The Integration Hub UI provides interfaces for managing external integrations, API connections, webhooks, and data synchronization. This includes integration catalog, connection setup, monitoring, and logs.

### Key Screens
- Integration dashboard
- Integration catalog
- Active connections
- Connection configuration
- Webhooks management
- Integration logs

---

## ✅ Pre-Implementation Checklist

Before starting, verify:

- [ ] Foundation prompt (00) is complete
- [ ] Auth prompt (01) is complete
- [ ] Integration Hub API is deployed

---

## 🗂️ Route Structure

```
app/(dashboard)/
├── integrations/
│   ├── page.tsx                    # Dashboard
│   ├── catalog/
│   │   └── page.tsx                # Available integrations
│   ├── connections/
│   │   ├── page.tsx                # Active connections
│   │   └── [id]/
│   │       ├── page.tsx            # Connection detail
│   │       └── configure/
│   │           └── page.tsx        # Configure connection
│   ├── webhooks/
│   │   ├── page.tsx                # Webhooks list
│   │   └── [id]/
│   │       └── page.tsx            # Webhook detail
│   └── logs/
│       └── page.tsx                # Integration logs
```

---

## 🎨 Components to Create

```
components/integrations/
├── integration-dashboard.tsx       # Dashboard metrics
├── health-status-grid.tsx          # Connection health
├── catalog-grid.tsx                # Available integrations
├── integration-card.tsx            # Integration preview
├── connection-card.tsx             # Active connection
├── connections-table.tsx           # Connections list
├── connection-detail.tsx           # Full connection view
├── connection-form.tsx             # Setup/configure
├── credentials-form.tsx            # Credential input
├── field-mapping.tsx               # Data mapping
├── sync-settings.tsx               # Sync configuration
├── connection-test.tsx             # Test connection
├── webhooks-table.tsx              # Webhooks list
├── webhook-form.tsx                # Create/edit webhook
├── webhook-detail.tsx              # Webhook view
├── webhook-payload-viewer.tsx      # Payload inspector
├── integration-logs-table.tsx      # Logs list
├── log-detail-drawer.tsx           # Log details
├── integration-filters.tsx         # Filter controls
└── sync-status-badge.tsx           # Status indicator
```

---

## 📝 TypeScript Interfaces

### File: `lib/types/integrations.ts`

```typescript
export type IntegrationType = 
  | 'ERP'
  | 'ACCOUNTING'
  | 'CRM'
  | 'CARRIER'
  | 'CUSTOMER_PORTAL'
  | 'LOAD_BOARD'
  | 'TRACKING'
  | 'DOCUMENT'
  | 'COMMUNICATION'
  | 'PAYMENT'
  | 'OTHER';

export type ConnectionStatus = 
  | 'CONNECTED'
  | 'DISCONNECTED'
  | 'ERROR'
  | 'PENDING'
  | 'EXPIRED';

export type SyncDirection = 'INBOUND' | 'OUTBOUND' | 'BIDIRECTIONAL';

export interface IntegrationDefinition {
  id: string;
  name: string;
  description: string;
  type: IntegrationType;
  provider: string;
  
  // Branding
  logoUrl?: string;
  docsUrl?: string;
  
  // Auth
  authType: 'OAUTH2' | 'API_KEY' | 'BASIC' | 'CUSTOM';
  
  // Configuration
  requiredFields: IntegrationField[];
  optionalFields: IntegrationField[];
  
  // Features
  supportedEntities: string[];
  supportedOperations: string[];
  
  // Availability
  isAvailable: boolean;
  isPremium: boolean;
}

export interface IntegrationField {
  name: string;
  label: string;
  type: 'TEXT' | 'PASSWORD' | 'URL' | 'SELECT' | 'CHECKBOX';
  required: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  helpText?: string;
}

export interface IntegrationConnection {
  id: string;
  integrationId: string;
  integrationName: string;
  integrationType: IntegrationType;
  
  // Status
  status: ConnectionStatus;
  lastConnectedAt?: string;
  lastSyncAt?: string;
  nextSyncAt?: string;
  
  // Configuration
  config: Record<string, unknown>;
  credentials?: Record<string, unknown>; // Masked
  
  // Sync
  syncDirection: SyncDirection;
  syncFrequency: 'REALTIME' | 'HOURLY' | 'DAILY' | 'MANUAL';
  enabledEntities: string[];
  
  // Mapping
  fieldMappings: FieldMapping[];
  
  // Stats
  totalSynced: number;
  syncErrors: number;
  
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface FieldMapping {
  id: string;
  sourceField: string;
  targetField: string;
  transform?: string;
}

export interface IntegrationWebhook {
  id: string;
  connectionId?: string;
  
  name: string;
  description?: string;
  
  // Endpoint
  url: string;
  secret?: string;
  
  // Events
  events: string[];
  
  // Status
  isActive: boolean;
  
  // Stats
  totalDelivered: number;
  totalFailed: number;
  lastTriggeredAt?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  
  event: string;
  payload: Record<string, unknown>;
  
  // Request
  requestHeaders: Record<string, string>;
  requestBody: string;
  
  // Response
  responseStatus?: number;
  responseBody?: string;
  
  // Status
  status: 'PENDING' | 'DELIVERED' | 'FAILED' | 'RETRYING';
  attempts: number;
  
  createdAt: string;
  deliveredAt?: string;
}

export interface IntegrationLog {
  id: string;
  connectionId: string;
  connectionName: string;
  
  // Operation
  operation: 'SYNC' | 'API_CALL' | 'WEBHOOK' | 'AUTH' | 'ERROR';
  direction: 'INBOUND' | 'OUTBOUND';
  entity?: string;
  
  // Status
  status: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
  
  // Details
  message: string;
  details?: Record<string, unknown>;
  errorCode?: string;
  
  // Metrics
  recordsProcessed?: number;
  recordsFailed?: number;
  durationMs?: number;
  
  createdAt: string;
}

export interface IntegrationDashboardData {
  // Connections
  totalConnections: number;
  activeConnections: number;
  errorConnections: number;
  
  // Health
  connectionHealth: Array<{ id: string; name: string; status: ConnectionStatus }>;
  
  // Sync
  syncedToday: number;
  failedToday: number;
  pendingSync: number;
  
  // Webhooks
  activeWebhooks: number;
  webhookDeliveryRate: number;
  
  // Recent
  recentLogs: IntegrationLog[];
}
```

---

## 🪝 React Query Hooks

### File: `lib/hooks/integrations/use-integrations.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, PaginatedResponse } from '@/lib/api';
import {
  IntegrationDefinition,
  IntegrationConnection,
  IntegrationWebhook,
  WebhookDelivery,
  IntegrationLog,
  IntegrationDashboardData,
} from '@/lib/types/integrations';
import { toast } from 'sonner';

export const integrationKeys = {
  all: ['integrations'] as const,
  dashboard: () => [...integrationKeys.all, 'dashboard'] as const,
  
  catalog: () => [...integrationKeys.all, 'catalog'] as const,
  catalogDetail: (id: string) => [...integrationKeys.catalog(), id] as const,
  
  connections: () => [...integrationKeys.all, 'connections'] as const,
  connectionsList: (params?: Record<string, unknown>) => [...integrationKeys.connections(), 'list', params] as const,
  connectionDetail: (id: string) => [...integrationKeys.connections(), id] as const,
  
  webhooks: () => [...integrationKeys.all, 'webhooks'] as const,
  webhooksList: (params?: Record<string, unknown>) => [...integrationKeys.webhooks(), 'list', params] as const,
  webhookDetail: (id: string) => [...integrationKeys.webhooks(), id] as const,
  webhookDeliveries: (id: string) => [...integrationKeys.webhooks(), id, 'deliveries'] as const,
  
  logs: (params?: Record<string, unknown>) => [...integrationKeys.all, 'logs', params] as const,
};

// Dashboard
export function useIntegrationsDashboard() {
  return useQuery({
    queryKey: integrationKeys.dashboard(),
    queryFn: () => apiClient.get<{ data: IntegrationDashboardData }>('/integrations/dashboard'),
  });
}

// Catalog
export function useIntegrationCatalog() {
  return useQuery({
    queryKey: integrationKeys.catalog(),
    queryFn: () => apiClient.get<{ data: IntegrationDefinition[] }>('/integrations/catalog'),
  });
}

export function useIntegrationDefinition(id: string) {
  return useQuery({
    queryKey: integrationKeys.catalogDetail(id),
    queryFn: () => apiClient.get<{ data: IntegrationDefinition }>(`/integrations/catalog/${id}`),
    enabled: !!id,
  });
}

// Connections
export function useConnections(params = {}) {
  return useQuery({
    queryKey: integrationKeys.connectionsList(params),
    queryFn: () => apiClient.get<PaginatedResponse<IntegrationConnection>>('/integrations/connections', params),
  });
}

export function useConnection(id: string) {
  return useQuery({
    queryKey: integrationKeys.connectionDetail(id),
    queryFn: () => apiClient.get<{ data: IntegrationConnection }>(`/integrations/connections/${id}`),
    enabled: !!id,
  });
}

export function useCreateConnection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<IntegrationConnection>) =>
      apiClient.post<{ data: IntegrationConnection }>('/integrations/connections', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.connections() });
      queryClient.invalidateQueries({ queryKey: integrationKeys.dashboard() });
      toast.success('Connection created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create connection');
    },
  });
}

export function useUpdateConnection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IntegrationConnection> }) =>
      apiClient.patch<{ data: IntegrationConnection }>(`/integrations/connections/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.connectionDetail(id) });
      queryClient.invalidateQueries({ queryKey: integrationKeys.connections() });
      toast.success('Connection updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update connection');
    },
  });
}

export function useTestConnection() {
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post<{ success: boolean; message: string }>(`/integrations/connections/${id}/test`),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Connection test successful');
      } else {
        toast.error(data.message || 'Connection test failed');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Connection test failed');
    },
  });
}

export function useSyncConnection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, entities }: { id: string; entities?: string[] }) =>
      apiClient.post(`/integrations/connections/${id}/sync`, { entities }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.connections() });
      toast.success('Sync started');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to start sync');
    },
  });
}

export function useDisconnect() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/integrations/connections/${id}/disconnect`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.connections() });
      queryClient.invalidateQueries({ queryKey: integrationKeys.dashboard() });
      toast.success('Disconnected');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to disconnect');
    },
  });
}

// Webhooks
export function useWebhooks(params = {}) {
  return useQuery({
    queryKey: integrationKeys.webhooksList(params),
    queryFn: () => apiClient.get<PaginatedResponse<IntegrationWebhook>>('/integrations/webhooks', params),
  });
}

export function useWebhook(id: string) {
  return useQuery({
    queryKey: integrationKeys.webhookDetail(id),
    queryFn: () => apiClient.get<{ data: IntegrationWebhook }>(`/integrations/webhooks/${id}`),
    enabled: !!id,
  });
}

export function useWebhookDeliveries(webhookId: string, params = {}) {
  return useQuery({
    queryKey: integrationKeys.webhookDeliveries(webhookId),
    queryFn: () => apiClient.get<PaginatedResponse<WebhookDelivery>>(`/integrations/webhooks/${webhookId}/deliveries`, params),
    enabled: !!webhookId,
  });
}

export function useCreateWebhook() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<IntegrationWebhook>) =>
      apiClient.post<{ data: IntegrationWebhook }>('/integrations/webhooks', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.webhooks() });
      toast.success('Webhook created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create webhook');
    },
  });
}

export function useUpdateWebhook() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IntegrationWebhook> }) =>
      apiClient.patch<{ data: IntegrationWebhook }>(`/integrations/webhooks/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.webhookDetail(id) });
      queryClient.invalidateQueries({ queryKey: integrationKeys.webhooks() });
      toast.success('Webhook updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update webhook');
    },
  });
}

export function useDeleteWebhook() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/integrations/webhooks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.webhooks() });
      toast.success('Webhook deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete webhook');
    },
  });
}

export function useRetryDelivery() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ webhookId, deliveryId }: { webhookId: string; deliveryId: string }) =>
      apiClient.post(`/integrations/webhooks/${webhookId}/deliveries/${deliveryId}/retry`),
    onSuccess: (_, { webhookId }) => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.webhookDeliveries(webhookId) });
      toast.success('Retry scheduled');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to retry');
    },
  });
}

// Logs
export function useIntegrationLogs(params = {}) {
  return useQuery({
    queryKey: integrationKeys.logs(params),
    queryFn: () => apiClient.get<PaginatedResponse<IntegrationLog>>('/integrations/logs', params),
  });
}
```

---

## 🗄️ Zustand Store

### File: `lib/stores/integrations-store.ts`

```typescript
import { createStore } from './create-store';
import { IntegrationType, ConnectionStatus } from '@/lib/types/integrations';

interface IntegrationFilters {
  search: string;
  type: IntegrationType | '';
  status: ConnectionStatus | '';
  hasErrors: boolean | null;
}

interface IntegrationsState {
  filters: IntegrationFilters;
  selectedIntegrationId: string | null;
  selectedConnectionId: string | null;
  selectedWebhookId: string | null;
  isSetupDialogOpen: boolean;
  isConfigDialogOpen: boolean;
  isWebhookDialogOpen: boolean;
  
  setFilter: <K extends keyof IntegrationFilters>(key: K, value: IntegrationFilters[K]) => void;
  resetFilters: () => void;
  setSelectedIntegration: (id: string | null) => void;
  setSelectedConnection: (id: string | null) => void;
  setSelectedWebhook: (id: string | null) => void;
  setSetupDialogOpen: (open: boolean) => void;
  setConfigDialogOpen: (open: boolean) => void;
  setWebhookDialogOpen: (open: boolean) => void;
}

const defaultFilters: IntegrationFilters = {
  search: '',
  type: '',
  status: '',
  hasErrors: null,
};

export const useIntegrationsStore = createStore<IntegrationsState>('integrations-store', (set, get) => ({
  filters: defaultFilters,
  selectedIntegrationId: null,
  selectedConnectionId: null,
  selectedWebhookId: null,
  isSetupDialogOpen: false,
  isConfigDialogOpen: false,
  isWebhookDialogOpen: false,
  
  setFilter: (key, value) =>
    set({ filters: { ...get().filters, [key]: value } }),
  
  resetFilters: () => set({ filters: defaultFilters }),
  
  setSelectedIntegration: (id) => set({ selectedIntegrationId: id }),
  
  setSelectedConnection: (id) => set({ selectedConnectionId: id }),
  
  setSelectedWebhook: (id) => set({ selectedWebhookId: id }),
  
  setSetupDialogOpen: (open) => set({ isSetupDialogOpen: open }),
  
  setConfigDialogOpen: (open) => set({ isConfigDialogOpen: open }),
  
  setWebhookDialogOpen: (open) => set({ isWebhookDialogOpen: open }),
}));
```

---

## 📄 Zod Validation Schemas

### File: `lib/validations/integrations.ts`

```typescript
import { z } from 'zod';

const fieldMappingSchema = z.object({
  sourceField: z.string().min(1, 'Source field is required'),
  targetField: z.string().min(1, 'Target field is required'),
  transform: z.string().optional(),
});

export const connectionFormSchema = z.object({
  integrationId: z.string().min(1, 'Integration is required'),
  config: z.record(z.unknown()),
  syncDirection: z.enum(['INBOUND', 'OUTBOUND', 'BIDIRECTIONAL']),
  syncFrequency: z.enum(['REALTIME', 'HOURLY', 'DAILY', 'MANUAL']),
  enabledEntities: z.array(z.string()).min(1, 'At least one entity is required'),
  fieldMappings: z.array(fieldMappingSchema).optional(),
});

export const credentialsFormSchema = z.object({
  // Dynamic based on integration
}).passthrough();

export const webhookFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  url: z.string().url('Must be a valid URL'),
  secret: z.string().optional(),
  events: z.array(z.string()).min(1, 'At least one event is required'),
  isActive: z.boolean().default(true),
  connectionId: z.string().optional(),
});

export type ConnectionFormData = z.infer<typeof connectionFormSchema>;
export type WebhookFormData = z.infer<typeof webhookFormSchema>;
```

---

## ✅ Completion Checklist

### Components
- [ ] `components/integrations/integration-dashboard.tsx`
- [ ] `components/integrations/health-status-grid.tsx`
- [ ] `components/integrations/catalog-grid.tsx`
- [ ] `components/integrations/integration-card.tsx`
- [ ] `components/integrations/connection-card.tsx`
- [ ] `components/integrations/connections-table.tsx`
- [ ] `components/integrations/connection-detail.tsx`
- [ ] `components/integrations/connection-form.tsx`
- [ ] `components/integrations/credentials-form.tsx`
- [ ] `components/integrations/field-mapping.tsx`
- [ ] `components/integrations/sync-settings.tsx`
- [ ] `components/integrations/connection-test.tsx`
- [ ] `components/integrations/webhooks-table.tsx`
- [ ] `components/integrations/webhook-form.tsx`
- [ ] `components/integrations/webhook-detail.tsx`
- [ ] `components/integrations/webhook-payload-viewer.tsx`
- [ ] `components/integrations/integration-logs-table.tsx`
- [ ] `components/integrations/log-detail-drawer.tsx`
- [ ] `components/integrations/integration-filters.tsx`
- [ ] `components/integrations/sync-status-badge.tsx`

### Pages
- [ ] `app/(dashboard)/integrations/page.tsx`
- [ ] `app/(dashboard)/integrations/catalog/page.tsx`
- [ ] `app/(dashboard)/integrations/connections/page.tsx`
- [ ] `app/(dashboard)/integrations/connections/[id]/page.tsx`
- [ ] `app/(dashboard)/integrations/connections/[id]/configure/page.tsx`
- [ ] `app/(dashboard)/integrations/webhooks/page.tsx`
- [ ] `app/(dashboard)/integrations/webhooks/[id]/page.tsx`
- [ ] `app/(dashboard)/integrations/logs/page.tsx`

### Hooks & Stores
- [ ] `lib/types/integrations.ts`
- [ ] `lib/validations/integrations.ts`
- [ ] `lib/hooks/integrations/use-integrations.ts`
- [ ] `lib/stores/integrations-store.ts`

### Tests
- [ ] Component tests
- [ ] Hook tests
- [ ] MSW handlers
- [ ] All tests passing: `pnpm test`

---

## 🔗 Next Steps

After completing this prompt:
1. Proceed to [21-search-ui.md](./21-search-ui.md)
2. Update [00-index.md](./00-index.md) status

---

## 📚 Reference

- [Service Documentation](../../02-services/27-service-integration-hub.md)
- [API Review](../../api-review-docs/20-integration-hub-review.html)
