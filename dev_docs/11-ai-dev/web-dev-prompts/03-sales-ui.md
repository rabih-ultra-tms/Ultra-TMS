# 03 - Sales UI Implementation

> **Service:** Sales & Quoting  
> **Priority:** P0 - Critical  
> **Pages:** 10  
> **API Endpoints:** 45  
> **Dependencies:** Foundation ✅, Auth ✅, CRM ✅, Sales API ✅  
> **API Review:** [03-sales-review.html](../../api-review-docs/03-sales-review.html)

---

## 📋 Overview

The Sales UI provides quote management, pricing tools, sales pipeline tracking, and revenue reporting for the sales team.

### Key Screens
- Quotes list with status filters
- Quote builder with line items
- Quote approval workflow
- Sales pipeline/dashboard
- Pricing calculator
- Sales reports

---

## ✅ Pre-Implementation Checklist

Before starting, verify:

- [ ] Foundation prompt (00) is complete
- [ ] Auth prompt (01) is complete
- [ ] CRM prompt (02) is complete (for customer selection)
- [ ] Sales API is deployed and accessible

---

## 📦 Additional shadcn Components

```bash
cd apps/web
npx shadcn@latest add stepper
```

---

## 🗂️ Route Structure

```
app/(dashboard)/
├── quotes/
│   ├── page.tsx                    # Quotes list
│   ├── new/
│   │   └── page.tsx                # Create quote
│   └── [id]/
│       ├── page.tsx                # Quote detail
│       ├── edit/
│       │   └── page.tsx            # Edit quote
│       └── preview/
│           └── page.tsx            # Quote preview (PDF)
├── sales/
│   ├── dashboard/
│   │   └── page.tsx                # Sales dashboard
│   ├── pipeline/
│   │   └── page.tsx                # Sales pipeline
│   ├── pricing/
│   │   └── page.tsx                # Pricing calculator
│   └── reports/
│       └── page.tsx                # Sales reports
```

---

## 🎨 Components to Create

```
components/sales/
├── quotes/
│   ├── quotes-table.tsx            # Quotes list table
│   ├── quotes-columns.tsx          # Column definitions
│   ├── quote-form.tsx              # Quote builder form
│   ├── quote-line-items.tsx        # Line items editor
│   ├── quote-line-item-row.tsx     # Single line item
│   ├── quote-summary.tsx           # Quote totals
│   ├── quote-status-badge.tsx      # Status indicator
│   ├── quote-detail-card.tsx       # Quote overview
│   ├── quote-actions.tsx           # Action buttons
│   ├── quote-approval-dialog.tsx   # Approval workflow
│   └── quote-filters.tsx           # Filter controls
├── pricing/
│   ├── pricing-calculator.tsx      # Rate calculator
│   ├── lane-rate-lookup.tsx        # Lane pricing
│   ├── accessorial-selector.tsx    # Accessorial charges
│   └── margin-calculator.tsx       # Margin analysis
├── pipeline/
│   ├── sales-pipeline.tsx          # Pipeline kanban
│   ├── pipeline-stage-card.tsx     # Stage card
│   └── pipeline-stats.tsx          # Pipeline metrics
└── dashboard/
    ├── sales-kpi-cards.tsx         # KPI widgets
    ├── sales-chart.tsx             # Revenue chart
    └── top-performers.tsx          # Leaderboard
```

---

## 📝 TypeScript Interfaces

### File: `lib/types/sales.ts`

```typescript
export type QuoteStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface Quote {
  id: string;
  quoteNumber: string;
  status: QuoteStatus;
  
  // Customer
  customerId: string;
  customerName: string;
  contactId?: string;
  contactName?: string;
  
  // Lane info
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  
  // Dates
  validFrom: string;
  validUntil: string;
  
  // Pricing
  lineItems: QuoteLineItem[];
  subtotal: number;
  discountAmount: number;
  discountPercent: number;
  totalAmount: number;
  
  // Margin
  estimatedCost: number;
  estimatedMargin: number;
  marginPercent: number;
  
  // Approval
  requiresApproval: boolean;
  approvedById?: string;
  approvedAt?: string;
  approvalNotes?: string;
  
  // Assignment
  salesRepId: string;
  salesRepName: string;
  
  // Metadata
  notes?: string;
  internalNotes?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface QuoteLineItem {
  id: string;
  quoteId: string;
  
  description: string;
  itemType: 'FREIGHT' | 'ACCESSORIAL' | 'FUEL_SURCHARGE' | 'OTHER';
  
  quantity: number;
  unitPrice: number;
  amount: number;
  
  // For freight
  weight?: number;
  distance?: number;
  equipmentType?: string;
  
  // For accessorials
  accessorialCode?: string;
  
  sortOrder: number;
}

export interface PricingRequest {
  originZip: string;
  destinationZip: string;
  weight: number;
  equipmentType: string;
  pickupDate: string;
  accessorials?: string[];
}

export interface PricingResult {
  baseRate: number;
  fuelSurcharge: number;
  accessorialCharges: AccessorialCharge[];
  totalAmount: number;
  estimatedCost: number;
  marginPercent: number;
  transitDays: number;
}

export interface AccessorialCharge {
  code: string;
  name: string;
  amount: number;
}

export interface SalesMetrics {
  quotesCreated: number;
  quotesAccepted: number;
  conversionRate: number;
  totalRevenue: number;
  averageQuoteValue: number;
  topCustomers: { customerId: string; customerName: string; revenue: number }[];
}

export interface QuoteListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: QuoteStatus;
  salesRepId?: string;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
}
```

---

## 🪝 React Query Hooks

### File: `lib/hooks/sales/use-quotes.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, PaginatedResponse } from '@/lib/api';
import { Quote, QuoteListParams } from '@/lib/types/sales';
import { toast } from 'sonner';

export const quoteKeys = {
  all: ['quotes'] as const,
  lists: () => [...quoteKeys.all, 'list'] as const,
  list: (params: QuoteListParams) => [...quoteKeys.lists(), params] as const,
  details: () => [...quoteKeys.all, 'detail'] as const,
  detail: (id: string) => [...quoteKeys.details(), id] as const,
};

export function useQuotes(params: QuoteListParams = {}) {
  return useQuery({
    queryKey: quoteKeys.list(params),
    queryFn: () => apiClient.get<PaginatedResponse<Quote>>('/sales/quotes', params),
  });
}

export function useQuote(id: string) {
  return useQuery({
    queryKey: quoteKeys.detail(id),
    queryFn: () => apiClient.get<{ data: Quote }>(`/sales/quotes/${id}`),
    enabled: !!id,
  });
}

export function useCreateQuote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Quote>) =>
      apiClient.post<{ data: Quote }>('/sales/quotes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
      toast.success('Quote created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create quote');
    },
  });
}

export function useUpdateQuote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Quote> }) =>
      apiClient.patch<{ data: Quote }>(`/sales/quotes/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
      toast.success('Quote updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update quote');
    },
  });
}

export function useSubmitForApproval() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/sales/quotes/${id}/submit-for-approval`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
      toast.success('Quote submitted for approval');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit');
    },
  });
}

export function useApproveQuote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      apiClient.post(`/sales/quotes/${id}/approve`, { notes }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
      toast.success('Quote approved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve');
    },
  });
}

export function useRejectQuote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiClient.post(`/sales/quotes/${id}/reject`, { reason }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
      toast.success('Quote rejected');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject');
    },
  });
}

export function useSendQuote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, email }: { id: string; email: string }) =>
      apiClient.post(`/sales/quotes/${id}/send`, { email }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.detail(id) });
      toast.success('Quote sent');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send');
    },
  });
}

export function useConvertToOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (quoteId: string) =>
      apiClient.post(`/sales/quotes/${quoteId}/convert-to-order`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
      toast.success('Quote converted to order');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to convert');
    },
  });
}
```

### File: `lib/hooks/sales/use-pricing.ts`

```typescript
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { PricingRequest, PricingResult } from '@/lib/types/sales';
import { toast } from 'sonner';

export function useCalculatePrice() {
  return useMutation({
    mutationFn: (data: PricingRequest) =>
      apiClient.post<{ data: PricingResult }>('/sales/pricing/calculate', data),
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to calculate price');
    },
  });
}

export function useLaneRates() {
  return useMutation({
    mutationFn: ({ originZip, destinationZip }: { originZip: string; destinationZip: string }) =>
      apiClient.get('/sales/pricing/lane-rates', { originZip, destinationZip }),
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to fetch rates');
    },
  });
}
```

---

## 🗄️ Zustand Store

### File: `lib/stores/sales-store.ts`

```typescript
import { createStore } from './create-store';
import { QuoteStatus, QuoteLineItem } from '@/lib/types/sales';

interface QuoteFilters {
  search: string;
  status: QuoteStatus | '';
  salesRepId: string;
  dateRange: [string | null, string | null];
}

interface SalesState {
  // Quote filters
  quoteFilters: QuoteFilters;
  setQuoteFilter: <K extends keyof QuoteFilters>(key: K, value: QuoteFilters[K]) => void;
  resetQuoteFilters: () => void;
  
  // Quote builder
  draftLineItems: Partial<QuoteLineItem>[];
  addLineItem: (item: Partial<QuoteLineItem>) => void;
  updateLineItem: (index: number, item: Partial<QuoteLineItem>) => void;
  removeLineItem: (index: number) => void;
  clearLineItems: () => void;
  
  // Selected quote
  selectedQuoteId: string | null;
  setSelectedQuote: (id: string | null) => void;
}

const defaultQuoteFilters: QuoteFilters = {
  search: '',
  status: '',
  salesRepId: '',
  dateRange: [null, null],
};

export const useSalesStore = createStore<SalesState>('sales-store', (set, get) => ({
  quoteFilters: defaultQuoteFilters,
  setQuoteFilter: (key, value) =>
    set({ quoteFilters: { ...get().quoteFilters, [key]: value } }),
  resetQuoteFilters: () => set({ quoteFilters: defaultQuoteFilters }),
  
  draftLineItems: [],
  addLineItem: (item) =>
    set({ draftLineItems: [...get().draftLineItems, item] }),
  updateLineItem: (index, item) => {
    const items = [...get().draftLineItems];
    items[index] = { ...items[index], ...item };
    set({ draftLineItems: items });
  },
  removeLineItem: (index) =>
    set({ draftLineItems: get().draftLineItems.filter((_, i) => i !== index) }),
  clearLineItems: () => set({ draftLineItems: [] }),
  
  selectedQuoteId: null,
  setSelectedQuote: (id) => set({ selectedQuoteId: id }),
}));
```

---

## 📄 Zod Validation Schemas

### File: `lib/validations/sales.ts`

```typescript
import { z } from 'zod';

export const quoteLineItemSchema = z.object({
  description: z.string().min(1, 'Description required'),
  itemType: z.enum(['FREIGHT', 'ACCESSORIAL', 'FUEL_SURCHARGE', 'OTHER']),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
  weight: z.number().optional(),
  distance: z.number().optional(),
  equipmentType: z.string().optional(),
  accessorialCode: z.string().optional(),
});

export const quoteFormSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  contactId: z.string().optional(),
  
  originCity: z.string().min(1, 'Origin city required'),
  originState: z.string().min(1, 'Origin state required'),
  destinationCity: z.string().min(1, 'Destination city required'),
  destinationState: z.string().min(1, 'Destination state required'),
  
  validFrom: z.string().min(1, 'Valid from date required'),
  validUntil: z.string().min(1, 'Valid until date required'),
  
  lineItems: z.array(quoteLineItemSchema).min(1, 'At least one line item required'),
  
  discountPercent: z.number().min(0).max(100).default(0),
  discountAmount: z.number().min(0).default(0),
  
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
});

export const pricingRequestSchema = z.object({
  originZip: z.string().min(5, 'Valid ZIP required'),
  destinationZip: z.string().min(5, 'Valid ZIP required'),
  weight: z.number().min(1, 'Weight required'),
  equipmentType: z.string().min(1, 'Equipment type required'),
  pickupDate: z.string().min(1, 'Pickup date required'),
  accessorials: z.array(z.string()).default([]),
});

export type QuoteLineItemFormData = z.infer<typeof quoteLineItemSchema>;
export type QuoteFormData = z.infer<typeof quoteFormSchema>;
export type PricingRequestFormData = z.infer<typeof pricingRequestSchema>;
```

---

## 📄 Page Implementation

### File: `app/(dashboard)/quotes/page.tsx`

```typescript
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, RefreshCw, FileText, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader, EmptyState, LoadingState, ErrorState } from '@/components/shared';
import { QuotesTable } from '@/components/sales/quotes/quotes-table';
import { QuoteFilters } from '@/components/sales/quotes/quote-filters';
import { useQuotes } from '@/lib/hooks/sales/use-quotes';
import { useSalesStore } from '@/lib/stores/sales-store';
import { useDebounce } from '@/lib/hooks';
import { formatCurrency } from '@/lib/utils';

export default function QuotesPage() {
  const router = useRouter();
  const { quoteFilters } = useSalesStore();
  const debouncedSearch = useDebounce(quoteFilters.search, 300);
  const [page, setPage] = React.useState(1);

  const { data, isLoading, error, refetch } = useQuotes({
    page,
    limit: 20,
    search: debouncedSearch,
    status: quoteFilters.status || undefined,
    salesRepId: quoteFilters.salesRepId || undefined,
  });

  const handleCreate = () => router.push('/quotes/new');
  const handleView = (id: string) => router.push(`/quotes/${id}`);

  const quotes = data?.data || [];
  const pendingCount = quotes.filter(q => q.status === 'PENDING_APPROVAL').length;
  const acceptedCount = quotes.filter(q => q.status === 'ACCEPTED').length;
  const totalValue = quotes.reduce((sum, q) => sum + q.totalAmount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quotes"
        description="Create and manage sales quotes"
        actions={
          <>
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New Quote
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Quotes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.pagination?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{acceptedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalValue)}</div>
          </CardContent>
        </Card>
      </div>

      <QuoteFilters />

      {isLoading && !data ? (
        <LoadingState message="Loading quotes..." />
      ) : error ? (
        <ErrorState
          title="Failed to load quotes"
          message={error.message}
          onRetry={() => refetch()}
        />
      ) : quotes.length === 0 ? (
        <EmptyState
          title="No quotes found"
          description="Create your first quote to get started."
          action={
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New Quote
            </Button>
          }
        />
      ) : (
        <QuotesTable
          quotes={quotes}
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
- [ ] `components/sales/quotes/quotes-table.tsx`
- [ ] `components/sales/quotes/quote-form.tsx`
- [ ] `components/sales/quotes/quote-line-items.tsx`
- [ ] `components/sales/quotes/quote-summary.tsx`
- [ ] `components/sales/quotes/quote-status-badge.tsx`
- [ ] `components/sales/quotes/quote-approval-dialog.tsx`
- [ ] `components/sales/pricing/pricing-calculator.tsx`
- [ ] `components/sales/pricing/accessorial-selector.tsx`
- [ ] `components/sales/dashboard/sales-kpi-cards.tsx`
- [ ] `components/sales/pipeline/sales-pipeline.tsx`

### Pages
- [ ] `app/(dashboard)/quotes/page.tsx`
- [ ] `app/(dashboard)/quotes/new/page.tsx`
- [ ] `app/(dashboard)/quotes/[id]/page.tsx`
- [ ] `app/(dashboard)/quotes/[id]/edit/page.tsx`
- [ ] `app/(dashboard)/sales/dashboard/page.tsx`
- [ ] `app/(dashboard)/sales/pipeline/page.tsx`
- [ ] `app/(dashboard)/sales/pricing/page.tsx`
- [ ] `app/(dashboard)/sales/reports/page.tsx`

### Hooks & Stores
- [ ] `lib/types/sales.ts`
- [ ] `lib/validations/sales.ts`
- [ ] `lib/hooks/sales/use-quotes.ts`
- [ ] `lib/hooks/sales/use-pricing.ts`
- [ ] `lib/stores/sales-store.ts`

### Tests
- [ ] `components/sales/quotes/quotes-table.test.tsx`
- [ ] `components/sales/quotes/quote-form.test.tsx`
- [ ] `test/mocks/handlers/sales.ts`
- [ ] All tests passing: `pnpm test`

### Verification
- [ ] TypeScript compiles: `pnpm check-types`
- [ ] Lint passes: `pnpm lint`
- [ ] Manual testing complete

---

## 🔗 Next Steps

After completing this prompt:
1. Proceed to [04-tms-core-ui.md](./04-tms-core-ui.md)
2. Update [00-index.md](./00-index.md) status
