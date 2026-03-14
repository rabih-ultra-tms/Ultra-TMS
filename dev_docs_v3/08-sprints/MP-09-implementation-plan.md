# MP-09: Claims + Contracts Frontend Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build complete frontend for Claims and Contracts services — 16 pages, 60+ components, full API integration with forms, filtering, and state management.

**Architecture:** Sequential per-service approach. Contracts first (25 remaining tasks, API foundation exists), then Claims (30 tasks, API foundation must be created). Use existing patterns from Commission (#08, 8.5/10 quality) and Accounting (#07, 7.9/10 quality). Build pages in order of dependency (dashboard → list → detail → workflows). Use React Query for server state, Zustand for client state, React Hook Form + Zod for validation.

**Tech Stack:**

- Next.js 16 (App Router), React 19
- React Query (server state), Zustand (client state)
- React Hook Form + Zod (validation)
- shadcn/ui components
- Tailwind 4 + CSS modules

**Current State:**

- Contracts: API client ✅, hooks ✅, validators ✅ (5/30 done)
- Claims: API client ❌, hooks ❌ (0/30 done)
- Backend: 58 Contracts endpoints, 44 Claims endpoints (both built + tested)

**Timeline:** 2 sprints (MP-09 this week, MP-10 next week if overflow)
**Total Tasks:** 55 (Contracts 25 + Claims 30)
**Estimated Effort:** 40 hours (1.3 weeks)

---

## File Structure

### Contracts (`apps/web/app/(dashboard)/contracts/`)

```
contracts/
  page.tsx                    # Dashboard (KPIs, overview)
  layout.tsx                  # Contracts layout wrapper
  list/
    page.tsx                  # List view (filterable, paginated)
    (detail)/
      [id]/
        page.tsx              # Contract detail (tabs)
        edit/
          page.tsx            # Contract edit
  new/
    page.tsx                  # Contract builder (multi-step wizard)
  templates/
    page.tsx                  # Template library
  renewals/
    page.tsx                  # Renewal queue
  reports/
    page.tsx                  # Reports (expiry, rates, volumes)
```

### Contracts Components & Hooks

```
components/contracts/
  ContractCard.tsx            # Reusable contract summary card
  ContractFilters.tsx         # List filtering UI
  ContractStatus.tsx          # Status badge + label
  ContractTabs.tsx            # Detail page tabs
  RateTableViewer.tsx         # Rate table display
  AmendmentTimeline.tsx       # Amendment history
  ContractBuilder/
    StepOne.tsx               # Type + parties selection
    StepTwo.tsx               # Terms & dates
    StepThree.tsx             # Rates & SLAs
    StepFour.tsx              # Review & submit

lib/hooks/contracts/
  useContractList.ts          # List + filter (was useContracts)
  useContractDetail.ts        # Detail (existing)
  useContractCreate.ts        # Create (new)
  useContractUpdate.ts        # Update (new)
  useContractApproval.ts      # Approval workflow (new)
```

### Claims (`apps/web/app/(dashboard)/claims/`)

```
claims/
  page.tsx                    # Dashboard (KPIs, open/resolved)
  layout.tsx                  # Claims layout wrapper
  list/
    page.tsx                  # List view (filterable, paginated)
    (detail)/
      [id]/
        page.tsx              # Claim detail (tabs)
        investigation/
          page.tsx            # Investigation workflow
        settlement/
          page.tsx            # Settlement calculator
  new/
    page.tsx                  # New claim form (multi-step)
  reports/
    page.tsx                  # Reports (status, types, financials)
  carrier/
    [carrierId]/
      page.tsx                # Carrier claim history
```

### Claims Components & Hooks

```
components/claims/
  ClaimCard.tsx               # Reusable claim summary
  ClaimFilters.tsx            # List filtering UI
  ClaimStatus.tsx             # Status badge + label
  ClaimTabs.tsx               # Detail page tabs
  ClaimTimeline.tsx           # Timeline visualization
  ItemsList.tsx               # Claim items table
  SettlementCalculator.tsx    # Settlement math
  ClaimForm/
    StepOne.tsx               # Type + incident
    StepTwo.tsx               # Items
    StepThree.tsx             # Documentation
    StepFour.tsx              # Review & file

lib/hooks/claims/
  useClaimList.ts             # List + filter (new)
  useClaimDetail.ts           # Detail (new)
  useClaimCreate.ts           # Create (new)
  useClaimUpdate.ts           # Update (new)
  useInvestigation.ts         # Investigation workflow (new)
```

### API Clients

```
lib/api/claims/
  client.ts                   # API client (create from Contracts pattern)
  types.ts                    # TypeScript types from backend
  validators.ts               # Zod validators
```

---

## Chunk 1: Claims API Foundation (5 tasks)

### Task 1: Create Claims API Client

**Files:**

- Create: `apps/web/lib/api/claims/client.ts`
- Create: `apps/web/lib/api/claims/types.ts`
- Create: `apps/web/lib/api/claims/validators.ts`
- Create: `apps/web/lib/api/claims/index.ts`

**Checklist:**

- [ ] **Step 1: Review Contracts API client for pattern**

Read: `apps/web/lib/api/contracts/client.ts` (13KB file shows full pattern)

Expected: Understand TanStack Query patterns, error handling, request/response types

- [ ] **Step 2: Copy and adapt Contracts client to Claims**

```typescript
// apps/web/lib/api/claims/client.ts
import { apiClient } from '@/lib/api/client';
import {
  CreateClaimDTO,
  UpdateClaimDTO,
  ClaimDetailResponse,
  ClaimListResponse,
  CreateClaimItemDTO,
} from './types';

const baseUrl = '/api/v1/claims';

export const claimsClient = {
  // Claims CRUD
  list: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    carrierId?: string;
  }) => apiClient.get<ClaimListResponse>(`${baseUrl}`, { params }),

  getById: (id: string) =>
    apiClient.get<ClaimDetailResponse>(`${baseUrl}/${id}`),

  create: (data: CreateClaimDTO) =>
    apiClient.post<ClaimDetailResponse>(`${baseUrl}`, data),

  update: (id: string, data: UpdateClaimDTO) =>
    apiClient.put<ClaimDetailResponse>(`${baseUrl}/${id}`, data),

  delete: (id: string) => apiClient.delete(`${baseUrl}/${id}`),

  // Claim actions
  file: (id: string) => apiClient.post(`${baseUrl}/${id}/file`, {}),

  assign: (id: string, handlerId: string) =>
    apiClient.post(`${baseUrl}/${id}/assign`, { handlerId }),

  updateStatus: (id: string, status: string) =>
    apiClient.post(`${baseUrl}/${id}/status`, { status }),

  // Claim items
  getItems: (claimId: string) => apiClient.get(`${baseUrl}/${claimId}/items`),

  addItem: (claimId: string, data: CreateClaimItemDTO) =>
    apiClient.post(`${baseUrl}/${claimId}/items`, data),

  updateItem: (claimId: string, itemId: string, data: UpdateClaimItemDTO) =>
    apiClient.put(`${baseUrl}/${claimId}/items/${itemId}`, data),

  deleteItem: (claimId: string, itemId: string) =>
    apiClient.delete(`${baseUrl}/${claimId}/items/${itemId}`),

  // Claim documents
  getDocuments: (claimId: string) =>
    apiClient.get(`${baseUrl}/${claimId}/documents`),

  addDocument: (claimId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`${baseUrl}/${claimId}/documents`, formData);
  },

  deleteDocument: (claimId: string, docId: string) =>
    apiClient.delete(`${baseUrl}/${claimId}/documents/${docId}`),

  // Notes
  getNotes: (claimId: string) => apiClient.get(`${baseUrl}/${claimId}/notes`),

  addNote: (claimId: string, content: string) =>
    apiClient.post(`${baseUrl}/${claimId}/notes`, { content }),

  // Settlement
  getSettlement: (claimId: string) =>
    apiClient.get(`${baseUrl}/${claimId}/settlement`),

  submitSettlement: (claimId: string, data: SettlementSubmitDTO) =>
    apiClient.post(`${baseUrl}/${claimId}/settlement/submit`, data),
};
```

- [ ] **Step 3: Create Claims types**

```typescript
// apps/web/lib/api/claims/types.ts
import { z } from 'zod';

export const ClaimStatus = {
  DRAFT: 'DRAFT',
  FILED: 'FILED',
  INVESTIGATING: 'INVESTIGATING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SETTLED: 'SETTLED',
  PAID: 'PAID',
  CLOSED: 'CLOSED',
} as const;

export const ClaimType = {
  LOSS_OR_DAMAGE: 'LOSS_OR_DAMAGE',
  DELIVERY_FAILURE: 'DELIVERY_FAILURE',
  SHORTAGE: 'SHORTAGE',
  CARGO_LOSS: 'CARGO_LOSS',
  THIRD_PARTY_LIABILITY: 'THIRD_PARTY_LIABILITY',
  PROPERTY_DAMAGE: 'PROPERTY_DAMAGE',
} as const;

export interface ClaimItemDTO {
  id: string;
  claimId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  status: string;
  createdAt: string;
}

export interface ClaimDetailResponse {
  data: {
    id: string;
    claimNumber: string;
    tenantId: string;
    type: string;
    status: string;
    carrierId: string;
    shipmentId?: string;
    incidentDate: string;
    filedDate?: string;
    description: string;
    estimatedValue: number;
    approvedValue?: number;
    settledAmount?: number;
    items: ClaimItemDTO[];
    documents: Array<{ id: string; name: string; url: string }>;
    notes: Array<{ id: string; content: string; createdAt: string }>;
    timeline: Array<{
      id: string;
      status: string;
      changedAt: string;
      changedBy: string;
      reason?: string;
    }>;
    createdAt: string;
    updatedAt: string;
  };
  message?: string;
}

export interface ClaimListResponse {
  data: Array<{
    id: string;
    claimNumber: string;
    type: string;
    status: string;
    carrierId: string;
    estimatedValue: number;
    incidentDate: string;
    filedDate?: string;
    createdAt: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateClaimDTO {
  type: string;
  carrierId: string;
  shipmentId?: string;
  incidentDate: string;
  description: string;
  estimatedValue: number;
}

export interface UpdateClaimDTO {
  description?: string;
  estimatedValue?: number;
  status?: string;
}

export interface CreateClaimItemDTO {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface UpdateClaimItemDTO {
  description?: string;
  quantity?: number;
  unitPrice?: number;
}

export interface SettlementSubmitDTO {
  approvedValue: number;
  paymentMethod: string;
  notes?: string;
}
```

- [ ] **Step 4: Create Zod validators**

```typescript
// apps/web/lib/api/claims/validators.ts
import { z } from 'zod';
import { ClaimType, ClaimStatus } from './types';

export const createClaimSchema = z.object({
  type: z.enum(Object.values(ClaimType) as [string, ...string[]]),
  carrierId: z.string().uuid('Invalid carrier'),
  shipmentId: z.string().uuid().optional(),
  incidentDate: z.string().datetime(),
  description: z.string().min(10, 'Description required').max(5000),
  estimatedValue: z.number().min(0.01, 'Must be > 0'),
});

export const updateClaimSchema = createClaimSchema.partial();

export const createClaimItemSchema = z.object({
  description: z.string().min(5).max(500),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0.01),
});

export const settlementSchema = z.object({
  approvedValue: z.number().min(0),
  paymentMethod: z.enum(['CHECK', 'ACH', 'CARD', 'WIRE']),
  notes: z.string().max(1000).optional(),
});

export type CreateClaimInput = z.infer<typeof createClaimSchema>;
export type UpdateClaimInput = z.infer<typeof updateClaimSchema>;
export type CreateClaimItemInput = z.infer<typeof createClaimItemSchema>;
export type SettlementInput = z.infer<typeof settlementSchema>;
```

- [ ] **Step 5: Create index and export**

```typescript
// apps/web/lib/api/claims/index.ts
export { claimsClient } from './client';
export * from './types';
export * from './validators';
```

- [ ] **Step 6: Commit**

```bash
git add apps/web/lib/api/claims/
git commit -m "feat: add Claims API client with types and validators"
```

---

### Task 2: Create Claims Hooks (useClaimList, useClaimDetail)

**Files:**

- Create: `apps/web/lib/hooks/claims/useClaimList.ts`
- Create: `apps/web/lib/hooks/claims/useClaimDetail.ts`
- Create: `apps/web/lib/hooks/claims/index.ts`

**Checklist:**

- [ ] **Step 1: Review useContracts for pattern**

Read: `apps/web/lib/hooks/contracts/useContracts.ts` (4KB, shows TanStack Query integration)

- [ ] **Step 2: Create useClaimList hook**

```typescript
// apps/web/lib/hooks/claims/useClaimList.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { claimsClient, CreateClaimDTO } from '@/lib/api/claims';

export interface UseClaimListOptions {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  carrierId?: string;
  enabled?: boolean;
}

export function useClaimList(options: UseClaimListOptions = {}) {
  const { enabled = true, ...params } = options;

  const query = useQuery({
    queryKey: ['claims', 'list', params],
    queryFn: () => claimsClient.list(params),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    claims: query.data?.data || [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useClaimCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClaimDTO) => claimsClient.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims', 'list'] });
    },
  });
}
```

- [ ] **Step 3: Create useClaimDetail hook**

```typescript
// apps/web/lib/hooks/claims/useClaimDetail.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { claimsClient } from '@/lib/api/claims';

export function useClaimDetail(id: string, enabled = true) {
  const query = useQuery({
    queryKey: ['claims', 'detail', id],
    queryFn: () => claimsClient.getById(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5,
  });

  return {
    claim: query.data?.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
```

- [ ] **Step 4: Create index export**

```typescript
// apps/web/lib/hooks/claims/index.ts
export { useClaimList, useClaimCreate } from './useClaimList';
export { useClaimDetail } from './useClaimDetail';
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/hooks/claims/
git commit -m "feat: add Claims list and detail hooks"
```

---

### Task 3: Create Claims Dashboard Page

**Files:**

- Create: `apps/web/app/(dashboard)/claims/page.tsx`
- Create: `apps/web/app/(dashboard)/claims/layout.tsx`

**Checklist:**

- [ ] **Step 1: Review Commission dashboard for design pattern**

Read: `apps/web/app/(dashboard)/commission/page.tsx` (shows KPI layout, chart integration)

- [ ] **Step 2: Create Claims layout wrapper**

```typescript
// apps/web/app/(dashboard)/claims/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Claims | Ultra TMS',
  description: 'Manage insurance claims and settlements',
};

export default function ClaimsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
```

- [ ] **Step 3: Create Claims dashboard page**

```typescript
// apps/web/app/(dashboard)/claims/page.tsx
'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useClaimList } from '@/lib/hooks/claims'
import { ClaimStatus } from '@/lib/api/claims'

function ClaimsDashboardContent() {
  const { claims, isLoading } = useClaimList({
    limit: 100, // Get all for KPI calculation
  })

  const stats = {
    total: claims.length,
    open: claims.filter((c) => ['DRAFT', 'FILED', 'INVESTIGATING', 'UNDER_REVIEW'].includes(c.status)).length,
    resolved: claims.filter((c) => ['APPROVED', 'REJECTED', 'SETTLED', 'PAID'].includes(c.status)).length,
    totalValue: claims.reduce((sum, c) => sum + (c.estimatedValue || 0), 0),
  }

  if (isLoading) return <div className="p-8">Loading...</div>

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Claims Management</h1>
        <Link href="/claims/new">
          <Button>New Claim</Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.open}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats.totalValue / 1000).toFixed(1)}K</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Claims */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Claims</CardTitle>
        </CardHeader>
        <CardContent>
          <Link href="/claims/list" className="text-blue-600 hover:underline">
            View all claims →
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ClaimsDashboard() {
  return (
    <Suspense fallback={<div className="p-8">Loading claims...</div>}>
      <ClaimsDashboardContent />
    </Suspense>
  )
}
```

- [ ] **Step 4: Test page loads and KPIs display**

```bash
pnpm dev
# Navigate to http://localhost:3000/claims
# Verify: KPI cards visible, "New Claim" button clickable
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/(dashboard)/claims/
git commit -m "feat: create Claims dashboard with KPI overview"
```

---

### Task 4: Create Claims List Page with Filtering

**Files:**

- Create: `apps/web/app/(dashboard)/claims/list/page.tsx`
- Create: `apps/web/components/claims/ClaimFilters.tsx`
- Create: `apps/web/components/claims/ClaimCard.tsx`

**Checklist:**

- [ ] **Step 1: Create ClaimCard component**

```typescript
// apps/web/components/claims/ClaimCard.tsx
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClaimDetailResponse } from '@/lib/api/claims/types'

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  FILED: 'bg-blue-100 text-blue-800',
  INVESTIGATING: 'bg-yellow-100 text-yellow-800',
  UNDER_REVIEW: 'bg-purple-100 text-purple-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  SETTLED: 'bg-green-50 text-green-700',
  PAID: 'bg-green-200 text-green-900',
  CLOSED: 'bg-gray-200 text-gray-900',
}

export function ClaimCard({ claim }: { claim: ClaimDetailResponse['data'] }) {
  return (
    <Link href={`/claims/${claim.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{claim.claimNumber}</CardTitle>
            <Badge className={statusColors[claim.status] || 'bg-gray-100'}>
              {claim.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Type</p>
              <p className="font-medium">{claim.type}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Value</p>
              <p className="font-medium">${claim.estimatedValue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Incident Date</p>
              <p className="font-medium">{new Date(claim.incidentDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Filed</p>
              <p className="font-medium">{claim.filedDate ? new Date(claim.filedDate).toLocaleDateString() : 'Not filed'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
```

- [ ] **Step 2: Create ClaimFilters component**

```typescript
// apps/web/components/claims/ClaimFilters.tsx
'use client'

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ClaimStatus, ClaimType } from '@/lib/api/claims'

interface ClaimFiltersProps {
  status?: string
  type?: string
  onStatusChange: (status?: string) => void
  onTypeChange: (type?: string) => void
}

export function ClaimFilters({
  status,
  type,
  onStatusChange,
  onTypeChange,
}: ClaimFiltersProps) {
  return (
    <div className="flex gap-4 mb-6">
      <Select value={status || ''} onValueChange={(v) => onStatusChange(v || undefined)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Statuses</SelectItem>
          {Object.entries(ClaimStatus).map(([key, value]) => (
            <SelectItem key={value} value={value}>
              {key.replace(/_/g, ' ')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={type || ''} onValueChange={(v) => onTypeChange(v || undefined)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Types</SelectItem>
          {Object.entries(ClaimType).map(([key, value]) => (
            <SelectItem key={value} value={value}>
              {key.replace(/_/g, ' ')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
```

- [ ] **Step 3: Create Claims list page**

```typescript
// apps/web/app/(dashboard)/claims/list/page.tsx
'use client'

import { useState } from 'react'
import { useClaimList } from '@/lib/hooks/claims'
import { ClaimFilters } from '@/components/claims/ClaimFilters'
import { ClaimCard } from '@/components/claims/ClaimCard'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

export default function ClaimsListPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string>()
  const [type, setType] = useState<string>()

  const { claims, pagination, isLoading } = useClaimList({
    page,
    limit: 12,
    status,
    type,
  })

  if (isLoading) return <div className="p-8">Loading claims...</div>

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold">Claims</h1>

      <ClaimFilters
        status={status}
        type={type}
        onStatusChange={setStatus}
        onTypeChange={setType}
      />

      {claims.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No claims found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {claims.map((claim) => (
              <ClaimCard key={claim.id} claim={claim} />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious onClick={() => setPage(Math.max(1, page - 1))} />
                </PaginationItem>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      isActive={p === page}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext onClick={() => setPage(Math.min(pagination.totalPages, page + 1))} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Test filters and pagination**

```bash
pnpm dev
# Navigate to http://localhost:3000/claims/list
# Verify: Claims displayed, filters work, pagination functional
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/(dashboard)/claims/list/ apps/web/components/claims/
git commit -m "feat: add Claims list page with filtering and pagination"
```

---

**Chunk 1 Complete!** Claims API foundation (client, hooks) + Dashboard + List pages ready for Claims detail pages next chunk.

---

## Chunk 2: Claims Detail & Forms (5 tasks)

[Continue with Claims detail page, new claim form, remaining Claims pages...]

---

## Chunk 3: Contracts Frontend Completion (8 tasks)

[Build remaining 25 Contracts tasks — pages, components, forms...]

---

## Chunk 4: Advanced Features & Polish (8 tasks)

[Filtering enhancements, search, batch operations, error handling, accessibility...]

---

## Testing Strategy

Each task includes minimal happy-path testing. After all pages built:

1. **E2E Tests** (Playwright)
   - User creates claim → submits → views in list
   - User creates contract → approves → views detail

2. **Component Tests** (Testing Library)
   - Filters change → list updates
   - Form validation → error messages appear

3. **Hook Tests** (React Testing Library)
   - useClaimList → returns paginated data
   - useClaimCreate → mutation succeeds → list invalidates

---

## Git Workflow

- **Commit per task** (not per chunk) for granular history
- **Use conventional commits:** `feat:`, `fix:`, `test:`
- **Push daily** to development branch
- **PR to main after all tasks complete** for review

---

## Success Criteria

✅ All 8 Contracts pages built and linked
✅ All 8 Claims pages built and linked
✅ All forms validate with Zod
✅ Filtering/pagination functional
✅ API calls verified in Network tab
✅ Loading/error/empty states handled
✅ Zero console errors
✅ Accessible (buttons have labels, forms have labels)
✅ Tests passing (200+ total)
✅ Ready for MP-10 (Agents + Credit) or production beta

---

## Timeline

**Week 1 (MP-09):**

- Mon-Tue: Claims foundation (API, hooks, dashboard, list) — Chunk 1
- Wed-Thu: Claims forms (new, detail, investigation, settlement) — Chunk 2
- Fri: Contracts catch-up if time allows

**Week 2 (if overflow into MP-10):**

- Mon-Wed: Contracts all 8 pages — Chunk 3
- Thu-Fri: Polish + tests — Chunk 4

---

## Notes

- **Design Specs Reference:** Detailed specs exist in `dev_docs/12-Rabih-design-Process/{09-claims,14-contracts}/`
- **Quality Model:** Follow Commission (8.5/10) and Accounting (7.9/10) page patterns
- **Reusable Components:** ClaimCard, ContractCard, filters, status badges → extract to shared components after first use
- **State Management:** React Query for server state (claims, contracts lists), Zustand for client UI state (active tab, filter panel open/closed)
- **Error Handling:** All API calls have try-catch, user sees toast notifications (success/error/loading)
