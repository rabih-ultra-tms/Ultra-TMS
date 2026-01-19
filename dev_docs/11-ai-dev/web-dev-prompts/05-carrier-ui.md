# 05 - Carrier UI Implementation

> **Service:** Carrier Management  
> **Priority:** P0 - Critical  
> **Pages:** 8  
> **API Endpoints:** 45  
> **Dependencies:** Foundation ✅, Auth ✅, TMS Core ✅, Carrier API ✅  
> **API Review:** [05-carrier-review.html](../../api-review-docs/05-carrier-review.html)

---

## 📋 Overview

The Carrier UI provides carrier profile management, compliance tracking, document management, scorecards, and onboarding workflows.

### Key Screens
- Carrier list with filters
- Carrier detail with tabs
- Compliance dashboard
- Document management
- Carrier scorecard
- Onboarding workflow
- Carrier search/lookup

---

## ✅ Pre-Implementation Checklist

Before starting, verify:

- [ ] Foundation prompt (00) is complete
- [ ] Auth prompt (01) is complete
- [ ] TMS Core prompt (04) is complete
- [ ] Carrier API is deployed and accessible

---

## 🗂️ Route Structure

```
app/(dashboard)/
├── carriers/
│   ├── page.tsx                    # Carriers list
│   ├── new/
│   │   └── page.tsx                # Carrier onboarding
│   ├── search/
│   │   └── page.tsx                # Carrier search
│   └── [id]/
│       ├── page.tsx                # Carrier detail
│       ├── edit/
│       │   └── page.tsx            # Edit carrier
│       ├── compliance/
│       │   └── page.tsx            # Compliance detail
│       ├── documents/
│       │   └── page.tsx            # Document management
│       ├── scorecard/
│       │   └── page.tsx            # Performance scorecard
│       └── history/
│           └── page.tsx            # Load history
└── compliance/
    └── page.tsx                    # Compliance dashboard
```

---

## 🎨 Components to Create

```
components/carrier/
├── carriers/
│   ├── carriers-table.tsx          # Carriers list table
│   ├── carriers-columns.tsx        # Column definitions
│   ├── carrier-form.tsx            # Create/edit carrier
│   ├── carrier-detail-card.tsx     # Carrier overview
│   ├── carrier-status-badge.tsx    # Status indicator
│   ├── carrier-tabs.tsx            # Detail page tabs
│   ├── carrier-filters.tsx         # Filter controls
│   └── carrier-search.tsx          # Carrier lookup
├── compliance/
│   ├── compliance-dashboard.tsx    # Compliance overview
│   ├── compliance-item.tsx         # Single item
│   ├── compliance-status.tsx       # Status indicator
│   ├── compliance-expiry-alert.tsx # Expiring items
│   └── compliance-checklist.tsx    # Requirements checklist
├── documents/
│   ├── carrier-documents-list.tsx  # Documents list
│   ├── document-upload.tsx         # Upload form
│   ├── document-viewer.tsx         # Preview document
│   └── document-status-badge.tsx   # Approval status
├── scorecard/
│   ├── carrier-scorecard.tsx       # Full scorecard
│   ├── scorecard-metric.tsx        # Single metric
│   ├── scorecard-chart.tsx         # Performance chart
│   └── scorecard-comparison.tsx    # Benchmark comparison
├── onboarding/
│   ├── onboarding-wizard.tsx       # Multi-step wizard
│   ├── onboarding-step.tsx         # Wizard step
│   ├── onboarding-progress.tsx     # Progress indicator
│   └── onboarding-review.tsx       # Final review
└── shared/
    ├── carrier-select.tsx          # Carrier picker
    ├── mc-number-input.tsx         # MC# input
    └── dot-number-input.tsx        # DOT# input
```

---

## 📝 TypeScript Interfaces

### File: `lib/types/carrier.ts`

```typescript
export type CarrierStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED' | 'BLACKLISTED';
export type ComplianceStatus = 'COMPLIANT' | 'EXPIRING_SOON' | 'EXPIRED' | 'MISSING' | 'PENDING_REVIEW';
export type DocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export interface Carrier {
  id: string;
  code: string;
  name: string;
  legalName?: string;
  status: CarrierStatus;
  
  // Federal identifiers
  mcNumber?: string;
  dotNumber?: string;
  scacCode?: string;
  
  // Contact info
  email?: string;
  phone?: string;
  fax?: string;
  website?: string;
  
  // Address
  address?: {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  
  // Insurance
  insuranceProvider?: string;
  insuranceExpiryDate?: string;
  liabilityAmount?: number;
  cargoInsuranceAmount?: number;
  
  // Compliance
  complianceStatus: ComplianceStatus;
  complianceItems: ComplianceItem[];
  
  // Equipment
  equipmentTypes: string[];
  truckCount?: number;
  trailerCount?: number;
  
  // Performance
  scorecard?: CarrierScorecard;
  
  // Payment
  paymentTerms?: string;
  factoringCompanyId?: string;
  
  // Settings
  preferredLanes?: PreferredLane[];
  rateConfirmationEmail?: string;
  
  // Metadata
  tags: string[];
  notes?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceItem {
  id: string;
  carrierId: string;
  type: string;
  name: string;
  status: ComplianceStatus;
  expiryDate?: string;
  documentId?: string;
  verifiedAt?: string;
  verifiedById?: string;
  notes?: string;
}

export interface CarrierDocument {
  id: string;
  carrierId: string;
  type: string;
  name: string;
  status: DocumentStatus;
  
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  
  expiryDate?: string;
  
  uploadedById: string;
  uploadedByName: string;
  uploadedAt: string;
  
  reviewedById?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface CarrierScorecard {
  carrierId: string;
  
  overallScore: number;
  
  onTimePickupRate: number;
  onTimeDeliveryRate: number;
  acceptanceRate: number;
  damageRate: number;
  claimRate: number;
  
  totalLoads: number;
  loadsLast30Days: number;
  loadsLast90Days: number;
  
  averageRating?: number;
  totalRatings: number;
  
  lastLoadDate?: string;
  
  calculatedAt: string;
}

export interface PreferredLane {
  originState: string;
  originCity?: string;
  destinationState: string;
  destinationCity?: string;
  equipmentType?: string;
  ratePerMile?: number;
}

export interface CarrierListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CarrierStatus;
  complianceStatus?: ComplianceStatus;
  equipmentType?: string;
  state?: string;
}
```

---

## 🪝 React Query Hooks

### File: `lib/hooks/carrier/use-carriers.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, PaginatedResponse } from '@/lib/api';
import { Carrier, CarrierListParams, CarrierDocument, ComplianceItem } from '@/lib/types/carrier';
import { toast } from 'sonner';

export const carrierKeys = {
  all: ['carriers'] as const,
  lists: () => [...carrierKeys.all, 'list'] as const,
  list: (params: CarrierListParams) => [...carrierKeys.lists(), params] as const,
  details: () => [...carrierKeys.all, 'detail'] as const,
  detail: (id: string) => [...carrierKeys.details(), id] as const,
  documents: (id: string) => [...carrierKeys.detail(id), 'documents'] as const,
  compliance: (id: string) => [...carrierKeys.detail(id), 'compliance'] as const,
  scorecard: (id: string) => [...carrierKeys.detail(id), 'scorecard'] as const,
  search: (query: string) => [...carrierKeys.all, 'search', query] as const,
};

export function useCarriers(params: CarrierListParams = {}) {
  return useQuery({
    queryKey: carrierKeys.list(params),
    queryFn: () => apiClient.get<PaginatedResponse<Carrier>>('/carriers', params),
  });
}

export function useCarrier(id: string) {
  return useQuery({
    queryKey: carrierKeys.detail(id),
    queryFn: () => apiClient.get<{ data: Carrier }>(`/carriers/${id}`),
    enabled: !!id,
  });
}

export function useCarrierDocuments(carrierId: string) {
  return useQuery({
    queryKey: carrierKeys.documents(carrierId),
    queryFn: () => apiClient.get<{ data: CarrierDocument[] }>(`/carriers/${carrierId}/documents`),
    enabled: !!carrierId,
  });
}

export function useCarrierCompliance(carrierId: string) {
  return useQuery({
    queryKey: carrierKeys.compliance(carrierId),
    queryFn: () => apiClient.get<{ data: ComplianceItem[] }>(`/carriers/${carrierId}/compliance`),
    enabled: !!carrierId,
  });
}

export function useSearchCarriers(query: string) {
  return useQuery({
    queryKey: carrierKeys.search(query),
    queryFn: () => apiClient.get<{ data: Carrier[] }>('/carriers/search', { q: query }),
    enabled: query.length >= 2,
  });
}

export function useCreateCarrier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Carrier>) =>
      apiClient.post<{ data: Carrier }>('/carriers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: carrierKeys.lists() });
      toast.success('Carrier created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create carrier');
    },
  });
}

export function useUpdateCarrier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Carrier> }) =>
      apiClient.patch<{ data: Carrier }>(`/carriers/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: carrierKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: carrierKeys.lists() });
      toast.success('Carrier updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update carrier');
    },
  });
}

export function useUpdateCarrierStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: string; reason?: string }) =>
      apiClient.patch(`/carriers/${id}/status`, { status, reason }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: carrierKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: carrierKeys.lists() });
      toast.success('Status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update status');
    },
  });
}

export function useUploadCarrierDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ carrierId, formData }: { carrierId: string; formData: FormData }) =>
      apiClient.upload(`/carriers/${carrierId}/documents`, formData),
    onSuccess: (_, { carrierId }) => {
      queryClient.invalidateQueries({ queryKey: carrierKeys.documents(carrierId) });
      queryClient.invalidateQueries({ queryKey: carrierKeys.compliance(carrierId) });
      toast.success('Document uploaded');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload document');
    },
  });
}

export function useApproveDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ carrierId, documentId }: { carrierId: string; documentId: string }) =>
      apiClient.post(`/carriers/${carrierId}/documents/${documentId}/approve`),
    onSuccess: (_, { carrierId }) => {
      queryClient.invalidateQueries({ queryKey: carrierKeys.documents(carrierId) });
      queryClient.invalidateQueries({ queryKey: carrierKeys.compliance(carrierId) });
      toast.success('Document approved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve document');
    },
  });
}

export function useRejectDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ carrierId, documentId, reason }: { carrierId: string; documentId: string; reason: string }) =>
      apiClient.post(`/carriers/${carrierId}/documents/${documentId}/reject`, { reason }),
    onSuccess: (_, { carrierId }) => {
      queryClient.invalidateQueries({ queryKey: carrierKeys.documents(carrierId) });
      toast.success('Document rejected');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject document');
    },
  });
}
```

---

## 🗄️ Zustand Store

### File: `lib/stores/carrier-store.ts`

```typescript
import { createStore } from './create-store';
import { CarrierStatus, ComplianceStatus } from '@/lib/types/carrier';

interface CarrierFilters {
  search: string;
  status: CarrierStatus | '';
  complianceStatus: ComplianceStatus | '';
  equipmentType: string;
  state: string;
}

interface CarrierState {
  // Filters
  carrierFilters: CarrierFilters;
  setCarrierFilter: <K extends keyof CarrierFilters>(key: K, value: CarrierFilters[K]) => void;
  resetCarrierFilters: () => void;
  
  // Selected carrier
  selectedCarrierId: string | null;
  setSelectedCarrier: (id: string | null) => void;
  
  // Active tab on detail page
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Onboarding wizard
  onboardingStep: number;
  onboardingData: Partial<Record<string, unknown>>;
  setOnboardingStep: (step: number) => void;
  setOnboardingData: (data: Partial<Record<string, unknown>>) => void;
  resetOnboarding: () => void;
}

const defaultCarrierFilters: CarrierFilters = {
  search: '',
  status: '',
  complianceStatus: '',
  equipmentType: '',
  state: '',
};

export const useCarrierStore = createStore<CarrierState>('carrier-store', (set, get) => ({
  carrierFilters: defaultCarrierFilters,
  setCarrierFilter: (key, value) =>
    set({ carrierFilters: { ...get().carrierFilters, [key]: value } }),
  resetCarrierFilters: () => set({ carrierFilters: defaultCarrierFilters }),
  
  selectedCarrierId: null,
  setSelectedCarrier: (id) => set({ selectedCarrierId: id }),
  
  activeTab: 'overview',
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  onboardingStep: 0,
  onboardingData: {},
  setOnboardingStep: (step) => set({ onboardingStep: step }),
  setOnboardingData: (data) => set({ onboardingData: { ...get().onboardingData, ...data } }),
  resetOnboarding: () => set({ onboardingStep: 0, onboardingData: {} }),
}));
```

---

## 📄 Zod Validation Schemas

### File: `lib/validations/carrier.ts`

```typescript
import { z } from 'zod';

export const carrierFormSchema = z.object({
  name: z.string().min(1, 'Carrier name required'),
  legalName: z.string().optional(),
  mcNumber: z.string().optional(),
  dotNumber: z.string().optional(),
  scacCode: z.string().optional(),
  email: z.string().email('Valid email required').optional().or(z.literal('')),
  phone: z.string().optional(),
  fax: z.string().optional(),
  website: z.string().url('Valid URL required').optional().or(z.literal('')),
  address: z.object({
    street1: z.string().min(1, 'Street required'),
    street2: z.string().optional(),
    city: z.string().min(1, 'City required'),
    state: z.string().min(1, 'State required'),
    zipCode: z.string().min(5, 'Valid ZIP required'),
    country: z.string().default('US'),
  }).optional(),
  equipmentTypes: z.array(z.string()).min(1, 'At least one equipment type required'),
  truckCount: z.number().min(0).optional(),
  trailerCount: z.number().min(0).optional(),
  paymentTerms: z.string().optional(),
  rateConfirmationEmail: z.string().email().optional().or(z.literal('')),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export const documentUploadSchema = z.object({
  type: z.string().min(1, 'Document type required'),
  file: z.instanceof(File, { message: 'File is required' }),
  expiryDate: z.string().optional(),
});

export const preferredLaneSchema = z.object({
  originState: z.string().min(1, 'Origin state required'),
  originCity: z.string().optional(),
  destinationState: z.string().min(1, 'Destination state required'),
  destinationCity: z.string().optional(),
  equipmentType: z.string().optional(),
  ratePerMile: z.number().min(0).optional(),
});

export type CarrierFormData = z.infer<typeof carrierFormSchema>;
export type DocumentUploadFormData = z.infer<typeof documentUploadSchema>;
export type PreferredLaneFormData = z.infer<typeof preferredLaneSchema>;
```

---

## 📄 Page Implementation

### File: `app/(dashboard)/carriers/page.tsx`

```typescript
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, RefreshCw, Truck, ShieldCheck, ShieldAlert, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader, EmptyState, LoadingState, ErrorState } from '@/components/shared';
import { CarriersTable } from '@/components/carrier/carriers/carriers-table';
import { CarrierFilters } from '@/components/carrier/carriers/carrier-filters';
import { useCarriers } from '@/lib/hooks/carrier/use-carriers';
import { useCarrierStore } from '@/lib/stores/carrier-store';
import { useDebounce } from '@/lib/hooks';

export default function CarriersPage() {
  const router = useRouter();
  const { carrierFilters } = useCarrierStore();
  const debouncedSearch = useDebounce(carrierFilters.search, 300);
  const [page, setPage] = React.useState(1);

  const { data, isLoading, error, refetch } = useCarriers({
    page,
    limit: 20,
    search: debouncedSearch,
    status: carrierFilters.status || undefined,
    complianceStatus: carrierFilters.complianceStatus || undefined,
    equipmentType: carrierFilters.equipmentType || undefined,
  });

  const handleCreate = () => router.push('/carriers/new');
  const handleSearch = () => router.push('/carriers/search');
  const handleView = (id: string) => router.push(`/carriers/${id}`);

  const carriers = data?.data || [];
  const activeCount = carriers.filter(c => c.status === 'ACTIVE').length;
  const compliantCount = carriers.filter(c => c.complianceStatus === 'COMPLIANT').length;
  const expiringSoonCount = carriers.filter(c => c.complianceStatus === 'EXPIRING_SOON').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Carriers"
        description="Manage carrier relationships and compliance"
        actions={
          <>
            <Button variant="outline" onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              Search Carriers
            </Button>
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Carrier
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Carriers</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.pagination?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Truck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Compliant</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{compliantCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <ShieldAlert className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{expiringSoonCount}</div>
          </CardContent>
        </Card>
      </div>

      <CarrierFilters />

      {isLoading && !data ? (
        <LoadingState message="Loading carriers..." />
      ) : error ? (
        <ErrorState
          title="Failed to load carriers"
          message={error.message}
          onRetry={() => refetch()}
        />
      ) : carriers.length === 0 ? (
        <EmptyState
          title="No carriers found"
          description="Add your first carrier to get started."
          action={
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Carrier
            </Button>
          }
        />
      ) : (
        <CarriersTable
          carriers={carriers}
          pagination={data?.pagination}
          onPageChange={setPage}
          onView={handleView}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
```

---

## ✅ Completion Checklist

### Components
- [ ] `components/carrier/carriers/carriers-table.tsx`
- [ ] `components/carrier/carriers/carrier-form.tsx`
- [ ] `components/carrier/carriers/carrier-detail-card.tsx`
- [ ] `components/carrier/carriers/carrier-status-badge.tsx`
- [ ] `components/carrier/carriers/carrier-tabs.tsx`
- [ ] `components/carrier/carriers/carrier-filters.tsx`
- [ ] `components/carrier/carriers/carrier-search.tsx`
- [ ] `components/carrier/compliance/compliance-dashboard.tsx`
- [ ] `components/carrier/compliance/compliance-item.tsx`
- [ ] `components/carrier/compliance/compliance-checklist.tsx`
- [ ] `components/carrier/documents/carrier-documents-list.tsx`
- [ ] `components/carrier/documents/document-upload.tsx`
- [ ] `components/carrier/scorecard/carrier-scorecard.tsx`
- [ ] `components/carrier/onboarding/onboarding-wizard.tsx`
- [ ] `components/carrier/shared/carrier-select.tsx`

### Pages
- [ ] `app/(dashboard)/carriers/page.tsx`
- [ ] `app/(dashboard)/carriers/new/page.tsx`
- [ ] `app/(dashboard)/carriers/search/page.tsx`
- [ ] `app/(dashboard)/carriers/[id]/page.tsx`
- [ ] `app/(dashboard)/carriers/[id]/edit/page.tsx`
- [ ] `app/(dashboard)/carriers/[id]/compliance/page.tsx`
- [ ] `app/(dashboard)/carriers/[id]/documents/page.tsx`
- [ ] `app/(dashboard)/carriers/[id]/scorecard/page.tsx`
- [ ] `app/(dashboard)/compliance/page.tsx`

### Hooks & Stores
- [ ] `lib/types/carrier.ts`
- [ ] `lib/validations/carrier.ts`
- [ ] `lib/hooks/carrier/use-carriers.ts`
- [ ] `lib/stores/carrier-store.ts`

### Tests
- [ ] `components/carrier/carriers/carriers-table.test.tsx`
- [ ] `components/carrier/carriers/carrier-form.test.tsx`
- [ ] `test/mocks/handlers/carrier.ts`
- [ ] All tests passing: `pnpm test`

### Verification
- [ ] TypeScript compiles: `pnpm check-types`
- [ ] Lint passes: `pnpm lint`
- [ ] Manual testing complete

---

## 🔗 Next Steps

After completing this prompt:
1. Proceed to [06-accounting-ui.md](./06-accounting-ui.md)
2. Update [00-index.md](./00-index.md) status
