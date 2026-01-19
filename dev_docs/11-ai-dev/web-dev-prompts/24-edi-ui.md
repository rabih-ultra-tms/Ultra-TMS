# 24 - EDI UI Implementation

> **Service:** EDI (Electronic Data Interchange)  
> **Priority:** P2 - Medium  
> **Pages:** 5  
> **API Endpoints:** 18  
> **Dependencies:** Foundation ✅, Auth API ✅, EDI API ✅  
> **Doc Reference:** [35-service-edi.md](../../02-services/35-service-edi.md)

---

## 📋 Overview

The EDI UI provides interfaces for managing Electronic Data Interchange transactions with trading partners. This includes EDI document viewing, partner configuration, transaction monitoring, and error handling.

### Key Screens
- EDI dashboard
- Trading partners
- Transaction log
- Document viewer
- EDI mapping configuration
- Error queue

---

## ✅ Pre-Implementation Checklist

Before starting, verify:

- [ ] Foundation prompt (00) is complete
- [ ] Auth prompt (01) is complete
- [ ] EDI API is deployed

---

## 🗂️ Route Structure

```
app/(dashboard)/
├── edi/
│   ├── page.tsx                    # EDI dashboard
│   ├── partners/
│   │   ├── page.tsx                # Trading partners
│   │   └── [id]/
│   │       └── page.tsx            # Partner detail
│   ├── transactions/
│   │   ├── page.tsx                # Transaction log
│   │   └── [id]/
│   │       └── page.tsx            # Transaction detail
│   ├── errors/
│   │   └── page.tsx                # Error queue
│   └── mappings/
│       └── page.tsx                # EDI mappings
```

---

## 🎨 Components to Create

```
components/edi/
├── edi-dashboard-stats.tsx         # Dashboard metrics
├── transaction-volume-chart.tsx    # Volume trends
├── trading-partners-table.tsx      # Partners list
├── trading-partner-card.tsx        # Partner summary
├── trading-partner-form.tsx        # Partner config
├── partner-connection-status.tsx   # Connection health
├── transactions-table.tsx          # Transaction log
├── transaction-detail.tsx          # Full transaction
├── document-viewer.tsx             # EDI document
├── document-segment-viewer.tsx     # Segment breakdown
├── edi-document-parser.tsx         # Parse/format
├── error-queue-table.tsx           # Errors list
├── error-detail.tsx                # Error view
├── error-resolution-form.tsx       # Fix errors
├── mapping-config.tsx              # Field mapping
├── segment-mapping.tsx             # Segment config
├── edi-filters.tsx                 # Filter controls
├── test-connection-button.tsx      # Test partner
└── resend-document-button.tsx      # Resend action
```

---

## 📝 TypeScript Interfaces

### File: `lib/types/edi.ts`

```typescript
export type EdiDocumentType = 
  | '204' // Motor Carrier Load Tender
  | '210' // Motor Carrier Freight Details and Invoice
  | '211' // Motor Carrier Bill of Lading
  | '214' // Transportation Carrier Shipment Status
  | '990' // Response to Load Tender
  | '997'; // Functional Acknowledgment

export type EdiDirection = 'INBOUND' | 'OUTBOUND';

export type EdiTransactionStatus = 
  | 'PENDING'
  | 'PROCESSING'
  | 'SENT'
  | 'RECEIVED'
  | 'ACKNOWLEDGED'
  | 'ERROR'
  | 'REJECTED';

export type EdiConnectionType = 'FTP' | 'SFTP' | 'AS2' | 'API' | 'VAN';

export interface TradingPartner {
  id: string;
  
  // Basic Info
  name: string;
  partnerId: string; // ISA ID
  partnerQualifier: string; // ISA qualifier
  
  // Our Info
  senderId: string;
  senderQualifier: string;
  
  // Connection
  connectionType: EdiConnectionType;
  connectionConfig: Record<string, unknown>;
  
  // Status
  isActive: boolean;
  lastActivityAt?: string;
  connectionStatus: 'CONNECTED' | 'ERROR' | 'UNKNOWN';
  
  // Supported Documents
  supportedDocuments: EdiDocumentType[];
  
  // Mappings
  customMappings?: Record<string, unknown>;
  
  createdAt: string;
  updatedAt: string;
}

export interface EdiTransaction {
  id: string;
  
  // Reference
  transactionSetId: string;
  controlNumber: string;
  
  // Type
  documentType: EdiDocumentType;
  direction: EdiDirection;
  
  // Partner
  tradingPartnerId: string;
  tradingPartnerName: string;
  
  // Status
  status: EdiTransactionStatus;
  
  // Entity Reference
  entityType?: string;
  entityId?: string;
  entityReference?: string; // Load number, invoice number, etc.
  
  // Raw Data
  rawDocument?: string;
  parsedData?: Record<string, unknown>;
  
  // Acknowledgment
  acknowledgmentStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  acknowledgmentAt?: string;
  acknowledgmentErrors?: string[];
  
  // Errors
  errors?: EdiError[];
  
  // Timestamps
  receivedAt?: string;
  sentAt?: string;
  processedAt?: string;
  createdAt: string;
}

export interface EdiError {
  id: string;
  transactionId: string;
  
  // Error Info
  errorCode: string;
  errorMessage: string;
  segment?: string;
  elementPosition?: number;
  
  // Severity
  severity: 'WARNING' | 'ERROR' | 'FATAL';
  
  // Resolution
  isResolved: boolean;
  resolvedAt?: string;
  resolvedById?: string;
  resolutionNotes?: string;
  
  createdAt: string;
}

export interface EdiMapping {
  id: string;
  
  // Document
  documentType: EdiDocumentType;
  direction: EdiDirection;
  
  // Partner (optional for default)
  tradingPartnerId?: string;
  
  // Mapping
  name: string;
  description?: string;
  
  // Segments
  segmentMappings: SegmentMapping[];
  
  // Transforms
  preTransforms?: Transform[];
  postTransforms?: Transform[];
  
  isDefault: boolean;
  
  createdAt: string;
  updatedAt: string;
}

export interface SegmentMapping {
  segmentId: string;
  entityField: string;
  transform?: string;
  required: boolean;
  defaultValue?: string;
}

export interface Transform {
  type: 'FORMAT' | 'LOOKUP' | 'CALCULATE' | 'VALIDATE';
  config: Record<string, unknown>;
}

export interface EdiDashboardData {
  // Volume
  transactionsToday: number;
  transactionsThisWeek: number;
  
  // By Direction
  inboundToday: number;
  outboundToday: number;
  
  // Status
  pendingTransactions: number;
  errorCount: number;
  
  // Partners
  activePartners: number;
  partnerHealth: Array<{ id: string; name: string; status: string }>;
  
  // Charts
  volumeByDay: Array<{ date: string; inbound: number; outbound: number }>;
  volumeByType: Array<{ type: EdiDocumentType; count: number }>;
  
  // Recent Errors
  recentErrors: EdiError[];
}
```

---

## 🪝 React Query Hooks

### File: `lib/hooks/edi/use-edi.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, PaginatedResponse } from '@/lib/api';
import {
  TradingPartner,
  EdiTransaction,
  EdiError,
  EdiMapping,
  EdiDashboardData,
} from '@/lib/types/edi';
import { toast } from 'sonner';

export const ediKeys = {
  all: ['edi'] as const,
  dashboard: () => [...ediKeys.all, 'dashboard'] as const,
  
  partners: () => [...ediKeys.all, 'partners'] as const,
  partnersList: (params?: Record<string, unknown>) => [...ediKeys.partners(), 'list', params] as const,
  partnerDetail: (id: string) => [...ediKeys.partners(), id] as const,
  
  transactions: () => [...ediKeys.all, 'transactions'] as const,
  transactionsList: (params?: Record<string, unknown>) => [...ediKeys.transactions(), 'list', params] as const,
  transactionDetail: (id: string) => [...ediKeys.transactions(), id] as const,
  
  errors: () => [...ediKeys.all, 'errors'] as const,
  errorsList: (params?: Record<string, unknown>) => [...ediKeys.errors(), 'list', params] as const,
  
  mappings: () => [...ediKeys.all, 'mappings'] as const,
  mappingsList: (params?: Record<string, unknown>) => [...ediKeys.mappings(), 'list', params] as const,
};

// Dashboard
export function useEdiDashboard() {
  return useQuery({
    queryKey: ediKeys.dashboard(),
    queryFn: () => apiClient.get<{ data: EdiDashboardData }>('/edi/dashboard'),
  });
}

// Trading Partners
export function useTradingPartners(params = {}) {
  return useQuery({
    queryKey: ediKeys.partnersList(params),
    queryFn: () => apiClient.get<PaginatedResponse<TradingPartner>>('/edi/partners', params),
  });
}

export function useTradingPartner(id: string) {
  return useQuery({
    queryKey: ediKeys.partnerDetail(id),
    queryFn: () => apiClient.get<{ data: TradingPartner }>(`/edi/partners/${id}`),
    enabled: !!id,
  });
}

export function useCreateTradingPartner() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<TradingPartner>) =>
      apiClient.post<{ data: TradingPartner }>('/edi/partners', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ediKeys.partners() });
      toast.success('Trading partner created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create partner');
    },
  });
}

export function useUpdateTradingPartner() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TradingPartner> }) =>
      apiClient.patch<{ data: TradingPartner }>(`/edi/partners/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ediKeys.partnerDetail(id) });
      queryClient.invalidateQueries({ queryKey: ediKeys.partners() });
      toast.success('Partner updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update partner');
    },
  });
}

export function useTestPartnerConnection() {
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post<{ success: boolean; message: string }>(`/edi/partners/${id}/test`),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Connection successful');
      } else {
        toast.error(data.message);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Connection test failed');
    },
  });
}

// Transactions
export function useEdiTransactions(params = {}) {
  return useQuery({
    queryKey: ediKeys.transactionsList(params),
    queryFn: () => apiClient.get<PaginatedResponse<EdiTransaction>>('/edi/transactions', params),
  });
}

export function useEdiTransaction(id: string) {
  return useQuery({
    queryKey: ediKeys.transactionDetail(id),
    queryFn: () => apiClient.get<{ data: EdiTransaction }>(`/edi/transactions/${id}`),
    enabled: !!id,
  });
}

export function useResendTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/edi/transactions/${id}/resend`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ediKeys.transactions() });
      toast.success('Document resent');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to resend');
    },
  });
}

export function useReprocessTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/edi/transactions/${id}/reprocess`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ediKeys.transactions() });
      toast.success('Reprocessing started');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reprocess');
    },
  });
}

// Errors
export function useEdiErrors(params = {}) {
  return useQuery({
    queryKey: ediKeys.errorsList(params),
    queryFn: () => apiClient.get<PaginatedResponse<EdiError>>('/edi/errors', params),
  });
}

export function useResolveEdiError() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      apiClient.post(`/edi/errors/${id}/resolve`, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ediKeys.errors() });
      queryClient.invalidateQueries({ queryKey: ediKeys.transactions() });
      toast.success('Error resolved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to resolve error');
    },
  });
}

// Mappings
export function useEdiMappings(params = {}) {
  return useQuery({
    queryKey: ediKeys.mappingsList(params),
    queryFn: () => apiClient.get<{ data: EdiMapping[] }>('/edi/mappings', params),
  });
}

export function useUpdateEdiMapping() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EdiMapping> }) =>
      apiClient.patch<{ data: EdiMapping }>(`/edi/mappings/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ediKeys.mappings() });
      toast.success('Mapping updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update mapping');
    },
  });
}
```

---

## 🗄️ Zustand Store

### File: `lib/stores/edi-store.ts`

```typescript
import { createStore } from './create-store';
import { EdiDocumentType, EdiDirection, EdiTransactionStatus } from '@/lib/types/edi';

interface EdiFilters {
  search: string;
  documentType: EdiDocumentType | '';
  direction: EdiDirection | '';
  status: EdiTransactionStatus | '';
  partnerId: string;
  dateRange: { from?: Date; to?: Date };
  hasErrors: boolean | null;
}

interface EdiState {
  filters: EdiFilters;
  selectedTransactionId: string | null;
  selectedPartnerId: string | null;
  isPartnerDialogOpen: boolean;
  isDocumentViewerOpen: boolean;
  
  setFilter: <K extends keyof EdiFilters>(key: K, value: EdiFilters[K]) => void;
  resetFilters: () => void;
  setSelectedTransaction: (id: string | null) => void;
  setSelectedPartner: (id: string | null) => void;
  setPartnerDialogOpen: (open: boolean) => void;
  setDocumentViewerOpen: (open: boolean) => void;
}

const defaultFilters: EdiFilters = {
  search: '',
  documentType: '',
  direction: '',
  status: '',
  partnerId: '',
  dateRange: {},
  hasErrors: null,
};

export const useEdiStore = createStore<EdiState>('edi-store', (set, get) => ({
  filters: defaultFilters,
  selectedTransactionId: null,
  selectedPartnerId: null,
  isPartnerDialogOpen: false,
  isDocumentViewerOpen: false,
  
  setFilter: (key, value) =>
    set({ filters: { ...get().filters, [key]: value } }),
  
  resetFilters: () => set({ filters: defaultFilters }),
  
  setSelectedTransaction: (id) => set({ selectedTransactionId: id }),
  
  setSelectedPartner: (id) => set({ selectedPartnerId: id }),
  
  setPartnerDialogOpen: (open) => set({ isPartnerDialogOpen: open }),
  
  setDocumentViewerOpen: (open) => set({ isDocumentViewerOpen: open }),
}));
```

---

## 📄 Zod Validation Schemas

### File: `lib/validations/edi.ts`

```typescript
import { z } from 'zod';

export const tradingPartnerFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  partnerId: z.string().min(1, 'Partner ID is required'),
  partnerQualifier: z.string().min(2, 'Qualifier is required'),
  senderId: z.string().min(1, 'Sender ID is required'),
  senderQualifier: z.string().min(2, 'Qualifier is required'),
  connectionType: z.enum(['FTP', 'SFTP', 'AS2', 'API', 'VAN']),
  supportedDocuments: z.array(z.enum(['204', '210', '211', '214', '990', '997'])).min(1),
  isActive: z.boolean().default(true),
});

const ftpConfigSchema = z.object({
  host: z.string().min(1, 'Host is required'),
  port: z.number().int().positive(),
  username: z.string().min(1),
  password: z.string().optional(),
  path: z.string().default('/'),
});

const as2ConfigSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  as2Id: z.string().min(1),
  certificate: z.string().optional(),
});

export const connectionConfigSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('FTP'), config: ftpConfigSchema }),
  z.object({ type: z.literal('SFTP'), config: ftpConfigSchema }),
  z.object({ type: z.literal('AS2'), config: as2ConfigSchema }),
  z.object({ type: z.literal('API'), config: z.object({ apiKey: z.string() }) }),
  z.object({ type: z.literal('VAN'), config: z.object({ vanProvider: z.string() }) }),
]);

export const resolveErrorSchema = z.object({
  notes: z.string().optional(),
});

export type TradingPartnerFormData = z.infer<typeof tradingPartnerFormSchema>;
export type ResolveErrorData = z.infer<typeof resolveErrorSchema>;
```

---

## ✅ Completion Checklist

### Components
- [ ] `components/edi/edi-dashboard-stats.tsx`
- [ ] `components/edi/transaction-volume-chart.tsx`
- [ ] `components/edi/trading-partners-table.tsx`
- [ ] `components/edi/trading-partner-card.tsx`
- [ ] `components/edi/trading-partner-form.tsx`
- [ ] `components/edi/partner-connection-status.tsx`
- [ ] `components/edi/transactions-table.tsx`
- [ ] `components/edi/transaction-detail.tsx`
- [ ] `components/edi/document-viewer.tsx`
- [ ] `components/edi/document-segment-viewer.tsx`
- [ ] `components/edi/edi-document-parser.tsx`
- [ ] `components/edi/error-queue-table.tsx`
- [ ] `components/edi/error-detail.tsx`
- [ ] `components/edi/error-resolution-form.tsx`
- [ ] `components/edi/mapping-config.tsx`
- [ ] `components/edi/segment-mapping.tsx`
- [ ] `components/edi/edi-filters.tsx`
- [ ] `components/edi/test-connection-button.tsx`
- [ ] `components/edi/resend-document-button.tsx`

### Pages
- [ ] `app/(dashboard)/edi/page.tsx`
- [ ] `app/(dashboard)/edi/partners/page.tsx`
- [ ] `app/(dashboard)/edi/partners/[id]/page.tsx`
- [ ] `app/(dashboard)/edi/transactions/page.tsx`
- [ ] `app/(dashboard)/edi/transactions/[id]/page.tsx`
- [ ] `app/(dashboard)/edi/errors/page.tsx`
- [ ] `app/(dashboard)/edi/mappings/page.tsx`

### Hooks & Stores
- [ ] `lib/types/edi.ts`
- [ ] `lib/validations/edi.ts`
- [ ] `lib/hooks/edi/use-edi.ts`
- [ ] `lib/stores/edi-store.ts`

### Tests
- [ ] Component tests
- [ ] Hook tests
- [ ] MSW handlers
- [ ] All tests passing: `pnpm test`

---

## 🔗 Next Steps

After completing this prompt:
1. Proceed to [25-safety-ui.md](./25-safety-ui.md)
2. Update [00-index.md](./00-index.md) status

---

## 📚 Reference

- [Service Documentation](../../02-services/35-service-edi.md)
- [API Review](../../api-review-docs/24-edi-review.html)
