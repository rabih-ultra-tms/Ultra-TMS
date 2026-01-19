# 06 - Accounting UI Implementation

> **Service:** Accounting (Invoicing, Payments, AR/AP)  
> **Priority:** P1 - High  
> **Pages:** 12  
> **API Endpoints:** 45  
> **Dependencies:** Foundation ✅, Auth API ✅, TMS Core API ✅, Accounting API ✅  
> **Doc Reference:** [13-service-accounting.md](../../02-services/13-service-accounting.md)

---

## 📋 Overview

The Accounting UI provides interfaces for managing invoicing, payments, accounts receivable, accounts payable, and financial reporting. This includes customer invoicing, carrier payments, payment processing, and financial dashboards.

### Key Screens
- Accounting dashboard with AR/AP metrics
- Customer invoices list and detail
- Create/edit invoice
- Carrier settlements/payables
- Payment processing
- Aging reports
- GL integration settings

---

## ✅ Pre-Implementation Checklist

Before starting, verify:

- [ ] Foundation prompt (00) is complete
- [ ] Auth prompt (01) is complete
- [ ] Accounting API is deployed and accessible
- [ ] TMS Core API is accessible (for load data)

---

## 📦 Additional shadcn Components

```bash
cd apps/web
npx shadcn@latest add textarea
npx shadcn@latest add separator
```

---

## 🗂️ Route Structure

```
app/(dashboard)/
├── accounting/
│   ├── page.tsx                    # Accounting dashboard
│   ├── invoices/
│   │   ├── page.tsx                # Invoices list
│   │   ├── new/
│   │   │   └── page.tsx            # Create invoice
│   │   └── [id]/
│   │       ├── page.tsx            # Invoice detail
│   │       └── edit/
│   │           └── page.tsx        # Edit invoice
│   ├── payments/
│   │   ├── page.tsx                # Payments list
│   │   └── [id]/
│   │       └── page.tsx            # Payment detail
│   ├── payables/
│   │   ├── page.tsx                # Carrier payables
│   │   └── [id]/
│   │       └── page.tsx            # Payable detail
│   ├── settlements/
│   │   ├── page.tsx                # Carrier settlements
│   │   └── [id]/
│   │       └── page.tsx            # Settlement detail
│   ├── aging/
│   │   └── page.tsx                # Aging reports
│   └── settings/
│       └── page.tsx                # GL settings
```

---

## 🎨 Components to Create

```
components/accounting/
├── accounting-dashboard-stats.tsx  # Dashboard metrics
├── ar-summary-card.tsx             # AR overview
├── ap-summary-card.tsx             # AP overview
├── invoices-table.tsx              # Invoices list
├── invoices-columns.tsx            # Column definitions
├── invoice-form.tsx                # Create/edit invoice
├── invoice-detail-card.tsx         # Invoice overview
├── invoice-line-items.tsx          # Line items editor
├── invoice-status-badge.tsx        # Status indicator
├── invoice-actions.tsx             # Send, void, etc.
├── payments-table.tsx              # Payments list
├── payment-form.tsx                # Record payment
├── payment-allocation.tsx          # Allocate to invoices
├── payables-table.tsx              # Carrier payables
├── settlement-table.tsx            # Settlements list
├── settlement-detail-card.tsx      # Settlement breakdown
├── aging-report.tsx                # Aging visualization
├── aging-bucket-card.tsx           # Aging bucket
└── accounting-filters.tsx          # Filter controls
```

---

## 📝 TypeScript Interfaces

### File: `lib/types/accounting.ts`

```typescript
export type InvoiceStatus = 
  | 'DRAFT'
  | 'PENDING'
  | 'SENT'
  | 'VIEWED'
  | 'PARTIAL'
  | 'PAID'
  | 'OVERDUE'
  | 'VOID'
  | 'DISPUTED';

export type PaymentMethod = 
  | 'ACH'
  | 'WIRE'
  | 'CHECK'
  | 'CREDIT_CARD'
  | 'CASH';

export type PaymentStatus = 
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  
  // Customer
  customerId: string;
  customerName: string;
  billingAddress: Address;
  
  // Reference
  orderId?: string;
  orderNumber?: string;
  loadId?: string;
  loadNumber?: string;
  
  // Dates
  issueDate: string;
  dueDate: string;
  paidAt?: string;
  
  // Amounts
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  
  // Line items
  lineItems: InvoiceLineItem[];
  
  // Payment terms
  paymentTerms: string;
  
  // Notes
  notes?: string;
  internalNotes?: string;
  
  // Document
  documentUrl?: string;
  
  createdAt: string;
  updatedAt: string;
  createdById: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxable: boolean;
}

export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  status: PaymentStatus;
  
  // Customer
  customerId: string;
  customerName: string;
  
  // Amount
  amount: number;
  
  // Method
  method: PaymentMethod;
  reference?: string;
  
  // Allocations
  allocations: PaymentAllocation[];
  
  // Dates
  paymentDate: string;
  processedAt?: string;
  
  // Notes
  notes?: string;
  
  createdAt: string;
  createdById: string;
}

export interface PaymentAllocation {
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
}

export interface CarrierPayable {
  id: string;
  carrierId: string;
  carrierName: string;
  
  loadId: string;
  loadNumber: string;
  
  // Amounts
  lineHaul: number;
  fuelSurcharge: number;
  accessorials: number;
  deductions: number;
  totalAmount: number;
  
  status: 'PENDING' | 'APPROVED' | 'SCHEDULED' | 'PAID';
  
  scheduledPayDate?: string;
  paidAt?: string;
  
  createdAt: string;
}

export interface CarrierSettlement {
  id: string;
  settlementNumber: string;
  
  carrierId: string;
  carrierName: string;
  
  // Period
  periodStart: string;
  periodEnd: string;
  
  // Amounts
  grossAmount: number;
  deductions: number;
  netAmount: number;
  
  // Payables included
  payableCount: number;
  payables: CarrierPayable[];
  
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'PAID';
  
  paymentMethod?: PaymentMethod;
  paidAt?: string;
  
  createdAt: string;
}

export interface AgingBucket {
  label: string;
  range: string;
  count: number;
  amount: number;
}

export interface AccountingDashboardData {
  // AR
  totalAR: number;
  arCurrent: number;
  arOverdue: number;
  overdueCount: number;
  
  // AP
  totalAP: number;
  apDueThisWeek: number;
  
  // Activity
  invoicedToday: number;
  paymentsToday: number;
  
  // Aging
  arAging: AgingBucket[];
}

export interface InvoiceListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: InvoiceStatus;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  overdue?: boolean;
}
```

---

## 🪝 React Query Hooks

### File: `lib/hooks/accounting/use-accounting.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, PaginatedResponse } from '@/lib/api';
import {
  Invoice,
  Payment,
  CarrierPayable,
  CarrierSettlement,
  AccountingDashboardData,
  InvoiceListParams,
} from '@/lib/types/accounting';
import { toast } from 'sonner';

export const accountingKeys = {
  all: ['accounting'] as const,
  dashboard: () => [...accountingKeys.all, 'dashboard'] as const,
  
  invoices: () => [...accountingKeys.all, 'invoices'] as const,
  invoicesList: (params: InvoiceListParams) => [...accountingKeys.invoices(), 'list', params] as const,
  invoiceDetail: (id: string) => [...accountingKeys.invoices(), 'detail', id] as const,
  
  payments: () => [...accountingKeys.all, 'payments'] as const,
  paymentsList: (params?: Record<string, unknown>) => [...accountingKeys.payments(), 'list', params] as const,
  paymentDetail: (id: string) => [...accountingKeys.payments(), 'detail', id] as const,
  
  payables: () => [...accountingKeys.all, 'payables'] as const,
  payablesList: (params?: Record<string, unknown>) => [...accountingKeys.payables(), 'list', params] as const,
  
  settlements: () => [...accountingKeys.all, 'settlements'] as const,
  settlementsList: (params?: Record<string, unknown>) => [...accountingKeys.settlements(), 'list', params] as const,
  settlementDetail: (id: string) => [...accountingKeys.settlements(), 'detail', id] as const,
  
  aging: () => [...accountingKeys.all, 'aging'] as const,
};

// Dashboard
export function useAccountingDashboard() {
  return useQuery({
    queryKey: accountingKeys.dashboard(),
    queryFn: () => apiClient.get<{ data: AccountingDashboardData }>('/accounting/dashboard'),
  });
}

// Invoices
export function useInvoices(params: InvoiceListParams = {}) {
  return useQuery({
    queryKey: accountingKeys.invoicesList(params),
    queryFn: () => apiClient.get<PaginatedResponse<Invoice>>('/accounting/invoices', params),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: accountingKeys.invoiceDetail(id),
    queryFn: () => apiClient.get<{ data: Invoice }>(`/accounting/invoices/${id}`),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Invoice>) =>
      apiClient.post<{ data: Invoice }>('/accounting/invoices', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.invoices() });
      queryClient.invalidateQueries({ queryKey: accountingKeys.dashboard() });
      toast.success('Invoice created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create invoice');
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Invoice> }) =>
      apiClient.patch<{ data: Invoice }>(`/accounting/invoices/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.invoiceDetail(id) });
      queryClient.invalidateQueries({ queryKey: accountingKeys.invoices() });
      toast.success('Invoice updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update invoice');
    },
  });
}

export function useSendInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, emails }: { id: string; emails?: string[] }) =>
      apiClient.post(`/accounting/invoices/${id}/send`, { emails }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.invoiceDetail(id) });
      queryClient.invalidateQueries({ queryKey: accountingKeys.invoices() });
      toast.success('Invoice sent');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send invoice');
    },
  });
}

export function useVoidInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiClient.post(`/accounting/invoices/${id}/void`, { reason }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.invoiceDetail(id) });
      queryClient.invalidateQueries({ queryKey: accountingKeys.invoices() });
      toast.success('Invoice voided');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to void invoice');
    },
  });
}

// Payments
export function usePayments(params = {}) {
  return useQuery({
    queryKey: accountingKeys.paymentsList(params),
    queryFn: () => apiClient.get<PaginatedResponse<Payment>>('/accounting/payments', params),
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: accountingKeys.paymentDetail(id),
    queryFn: () => apiClient.get<{ data: Payment }>(`/accounting/payments/${id}`),
    enabled: !!id,
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Payment>) =>
      apiClient.post<{ data: Payment }>('/accounting/payments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.payments() });
      queryClient.invalidateQueries({ queryKey: accountingKeys.invoices() });
      queryClient.invalidateQueries({ queryKey: accountingKeys.dashboard() });
      toast.success('Payment recorded');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to record payment');
    },
  });
}

// Payables
export function useCarrierPayables(params = {}) {
  return useQuery({
    queryKey: accountingKeys.payablesList(params),
    queryFn: () => apiClient.get<PaginatedResponse<CarrierPayable>>('/accounting/payables', params),
  });
}

export function useApprovePayable() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/accounting/payables/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.payables() });
      toast.success('Payable approved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve payable');
    },
  });
}

// Settlements
export function useCarrierSettlements(params = {}) {
  return useQuery({
    queryKey: accountingKeys.settlementsList(params),
    queryFn: () => apiClient.get<PaginatedResponse<CarrierSettlement>>('/accounting/settlements', params),
  });
}

export function useCarrierSettlement(id: string) {
  return useQuery({
    queryKey: accountingKeys.settlementDetail(id),
    queryFn: () => apiClient.get<{ data: CarrierSettlement }>(`/accounting/settlements/${id}`),
    enabled: !!id,
  });
}

export function useCreateSettlement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { carrierId: string; payableIds: string[] }) =>
      apiClient.post<{ data: CarrierSettlement }>('/accounting/settlements', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.settlements() });
      queryClient.invalidateQueries({ queryKey: accountingKeys.payables() });
      toast.success('Settlement created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create settlement');
    },
  });
}

export function useProcessSettlement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, paymentMethod }: { id: string; paymentMethod: string }) =>
      apiClient.post(`/accounting/settlements/${id}/process`, { paymentMethod }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.settlementDetail(id) });
      queryClient.invalidateQueries({ queryKey: accountingKeys.settlements() });
      toast.success('Settlement processed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to process settlement');
    },
  });
}

// Aging
export function useAgingReport(params = {}) {
  return useQuery({
    queryKey: accountingKeys.aging(),
    queryFn: () => apiClient.get<{ data: { buckets: AgingBucket[]; invoices: Invoice[] } }>('/accounting/aging', params),
  });
}
```

---

## 🗄️ Zustand Store

### File: `lib/stores/accounting-store.ts`

```typescript
import { createStore } from './create-store';
import { InvoiceStatus } from '@/lib/types/accounting';

interface AccountingFilters {
  invoiceSearch: string;
  invoiceStatus: InvoiceStatus | '';
  customerId: string;
  carrierId: string;
  dateRange: { from?: Date; to?: Date };
  overdueOnly: boolean;
}

interface AccountingState {
  filters: AccountingFilters;
  selectedInvoiceId: string | null;
  isPaymentDialogOpen: boolean;
  isSendDialogOpen: boolean;
  
  setFilter: <K extends keyof AccountingFilters>(key: K, value: AccountingFilters[K]) => void;
  resetFilters: () => void;
  setSelectedInvoice: (id: string | null) => void;
  setPaymentDialogOpen: (open: boolean) => void;
  setSendDialogOpen: (open: boolean) => void;
}

const defaultFilters: AccountingFilters = {
  invoiceSearch: '',
  invoiceStatus: '',
  customerId: '',
  carrierId: '',
  dateRange: {},
  overdueOnly: false,
};

export const useAccountingStore = createStore<AccountingState>('accounting-store', (set, get) => ({
  filters: defaultFilters,
  selectedInvoiceId: null,
  isPaymentDialogOpen: false,
  isSendDialogOpen: false,
  
  setFilter: (key, value) =>
    set({ filters: { ...get().filters, [key]: value } }),
  
  resetFilters: () => set({ filters: defaultFilters }),
  
  setSelectedInvoice: (id) => set({ selectedInvoiceId: id }),
  
  setPaymentDialogOpen: (open) => set({ isPaymentDialogOpen: open }),
  
  setSendDialogOpen: (open) => set({ isSendDialogOpen: open }),
}));
```

---

## 📄 Zod Validation Schemas

### File: `lib/validations/accounting.ts`

```typescript
import { z } from 'zod';

const addressSchema = z.object({
  street1: z.string().min(1, 'Street address is required'),
  street2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'ZIP code is required'),
  country: z.string().default('USA'),
});

const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
  taxable: z.boolean().default(false),
});

export const invoiceFormSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  billingAddress: addressSchema,
  issueDate: z.string().min(1, 'Issue date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  paymentTerms: z.string().min(1, 'Payment terms are required'),
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required'),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  orderId: z.string().optional(),
  loadId: z.string().optional(),
});

export const paymentFormSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  amount: z.number().positive('Amount must be positive'),
  method: z.enum(['ACH', 'WIRE', 'CHECK', 'CREDIT_CARD', 'CASH']),
  reference: z.string().optional(),
  paymentDate: z.string().min(1, 'Payment date is required'),
  allocations: z.array(z.object({
    invoiceId: z.string(),
    amount: z.number().positive(),
  })).optional(),
  notes: z.string().optional(),
});

export const settlementFormSchema = z.object({
  carrierId: z.string().min(1, 'Carrier is required'),
  payableIds: z.array(z.string()).min(1, 'Select at least one payable'),
});

export type InvoiceFormData = z.infer<typeof invoiceFormSchema>;
export type PaymentFormData = z.infer<typeof paymentFormSchema>;
export type SettlementFormData = z.infer<typeof settlementFormSchema>;
```

---

## ✅ Completion Checklist

### Components
- [ ] `components/accounting/accounting-dashboard-stats.tsx`
- [ ] `components/accounting/ar-summary-card.tsx`
- [ ] `components/accounting/ap-summary-card.tsx`
- [ ] `components/accounting/invoices-table.tsx`
- [ ] `components/accounting/invoices-columns.tsx`
- [ ] `components/accounting/invoice-form.tsx`
- [ ] `components/accounting/invoice-detail-card.tsx`
- [ ] `components/accounting/invoice-line-items.tsx`
- [ ] `components/accounting/invoice-status-badge.tsx`
- [ ] `components/accounting/invoice-actions.tsx`
- [ ] `components/accounting/payments-table.tsx`
- [ ] `components/accounting/payment-form.tsx`
- [ ] `components/accounting/payment-allocation.tsx`
- [ ] `components/accounting/payables-table.tsx`
- [ ] `components/accounting/settlement-table.tsx`
- [ ] `components/accounting/settlement-detail-card.tsx`
- [ ] `components/accounting/aging-report.tsx`
- [ ] `components/accounting/aging-bucket-card.tsx`
- [ ] `components/accounting/accounting-filters.tsx`

### Pages
- [ ] `app/(dashboard)/accounting/page.tsx`
- [ ] `app/(dashboard)/accounting/invoices/page.tsx`
- [ ] `app/(dashboard)/accounting/invoices/new/page.tsx`
- [ ] `app/(dashboard)/accounting/invoices/[id]/page.tsx`
- [ ] `app/(dashboard)/accounting/invoices/[id]/edit/page.tsx`
- [ ] `app/(dashboard)/accounting/payments/page.tsx`
- [ ] `app/(dashboard)/accounting/payments/[id]/page.tsx`
- [ ] `app/(dashboard)/accounting/payables/page.tsx`
- [ ] `app/(dashboard)/accounting/payables/[id]/page.tsx`
- [ ] `app/(dashboard)/accounting/settlements/page.tsx`
- [ ] `app/(dashboard)/accounting/settlements/[id]/page.tsx`
- [ ] `app/(dashboard)/accounting/aging/page.tsx`
- [ ] `app/(dashboard)/accounting/settings/page.tsx`

### Hooks & Stores
- [ ] `lib/types/accounting.ts`
- [ ] `lib/validations/accounting.ts`
- [ ] `lib/hooks/accounting/use-accounting.ts`
- [ ] `lib/stores/accounting-store.ts`

### Tests
- [ ] Component tests
- [ ] Hook tests
- [ ] MSW handlers: `test/mocks/handlers/accounting.ts`
- [ ] All tests passing: `pnpm test`

---

## 🔗 Next Steps

After completing this prompt:
1. Proceed to [07-load-board-ui.md](./07-load-board-ui.md)
2. Update [00-index.md](./00-index.md) status

---

## 📚 Reference

- [Service Documentation](../../02-services/13-service-accounting.md)
- [API Review](../../api-review-docs/06-accounting-review.html)
