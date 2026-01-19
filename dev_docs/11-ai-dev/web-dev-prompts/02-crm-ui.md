# 02 - CRM UI Implementation

> **Service:** Customer Relationship Management  
> **Priority:** P0 - Critical  
> **Pages:** 8  
> **API Endpoints:** 35  
> **Dependencies:** Foundation ✅, Auth ✅, CRM API ✅  
> **API Review:** [02-crm-review.html](../../api-review-docs/02-crm-review.html)

---

## 📋 Overview

The CRM UI provides customer and lead management, contact tracking, activity logging, and account management for the sales team.

### Key Screens
- Customer list with search/filters
- Customer detail page with tabs
- Lead management and pipeline
- Contact management
- Activity/interaction logging
- Customer accounts overview

---

## ✅ Pre-Implementation Checklist

Before starting, verify:

- [ ] Foundation prompt (00) is complete
- [ ] Auth prompt (01) is complete
- [ ] CRM API is deployed and accessible

---

## 📦 Additional shadcn Components

```bash
cd apps/web
npx shadcn@latest add avatar timeline
```

---

## 🗂️ Route Structure

```
app/(dashboard)/
├── customers/
│   ├── page.tsx                    # Customer list
│   ├── new/
│   │   └── page.tsx                # Create customer
│   └── [id]/
│       ├── page.tsx                # Customer detail
│       ├── edit/
│       │   └── page.tsx            # Edit customer
│       ├── contacts/
│       │   └── page.tsx            # Customer contacts
│       └── activities/
│           └── page.tsx            # Activity history
├── leads/
│   ├── page.tsx                    # Leads list/pipeline
│   ├── new/
│   │   └── page.tsx                # Create lead
│   └── [id]/
│       └── page.tsx                # Lead detail
└── contacts/
    ├── page.tsx                    # Contacts list
    └── [id]/
        └── page.tsx                # Contact detail
```

---

## 🎨 Components to Create

```
components/crm/
├── customers/
│   ├── customer-table.tsx          # Customer list table
│   ├── customer-columns.tsx        # Column definitions
│   ├── customer-form.tsx           # Create/edit form
│   ├── customer-detail-card.tsx    # Customer overview card
│   ├── customer-status-badge.tsx   # Status indicator
│   ├── customer-filters.tsx        # Filter controls
│   └── customer-tabs.tsx           # Detail page tabs
├── leads/
│   ├── leads-table.tsx             # Leads list
│   ├── leads-pipeline.tsx          # Kanban pipeline view
│   ├── lead-form.tsx               # Create/edit lead
│   ├── lead-card.tsx               # Pipeline card
│   ├── lead-stage-badge.tsx        # Stage indicator
│   └── lead-convert-dialog.tsx     # Convert to customer
├── contacts/
│   ├── contacts-table.tsx          # Contacts list
│   ├── contact-form.tsx            # Create/edit contact
│   ├── contact-card.tsx            # Contact summary
│   └── contact-select.tsx          # Contact picker
├── activities/
│   ├── activity-timeline.tsx       # Activity history
│   ├── activity-form.tsx           # Log activity
│   ├── activity-item.tsx           # Timeline item
│   └── activity-type-icon.tsx      # Activity icons
└── shared/
    ├── address-form.tsx            # Address input
    └── phone-input.tsx             # Phone number input
```

---

## 📝 TypeScript Interfaces

### File: `lib/types/crm.ts`

```typescript
export type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'PROSPECT' | 'SUSPENDED';
export type LeadStage = 'NEW' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';
export type ActivityType = 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE' | 'TASK';

export interface Customer {
  id: string;
  code: string;
  name: string;
  legalName?: string;
  status: CustomerStatus;
  
  // Contact info
  email?: string;
  phone?: string;
  website?: string;
  
  // Address
  address?: Address;
  billingAddress?: Address;
  
  // Business info
  industry?: string;
  employeeCount?: number;
  annualRevenue?: number;
  
  // Relationships
  primaryContactId?: string;
  primaryContact?: Contact;
  accountManagerId?: string;
  accountManager?: { id: string; name: string };
  
  // Settings
  paymentTerms?: string;
  creditLimit?: number;
  
  // Metadata
  tags: string[];
  customFields?: Record<string, unknown>;
  
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  customerId: string;
  
  firstName: string;
  lastName: string;
  fullName: string;
  title?: string;
  department?: string;
  
  email?: string;
  phone?: string;
  mobile?: string;
  
  isPrimary: boolean;
  isActive: boolean;
  
  notes?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  title: string;
  description?: string;
  
  stage: LeadStage;
  probability: number;
  estimatedValue?: number;
  expectedCloseDate?: string;
  
  // Contact info
  companyName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  
  // Assignment
  ownerId?: string;
  owner?: { id: string; name: string };
  
  // Source
  source?: string;
  campaign?: string;
  
  // Conversion
  convertedCustomerId?: string;
  convertedAt?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  subject: string;
  description?: string;
  
  // Related entity
  customerId?: string;
  contactId?: string;
  leadId?: string;
  
  // Schedule
  scheduledAt?: string;
  completedAt?: string;
  durationMinutes?: number;
  
  // Assignment
  assignedToId?: string;
  assignedTo?: { id: string; name: string };
  
  createdById: string;
  createdBy: { id: string; name: string };
  
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// List params
export interface CustomerListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CustomerStatus;
  accountManagerId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface LeadListParams {
  page?: number;
  limit?: number;
  search?: string;
  stage?: LeadStage;
  ownerId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

---

## 🪝 React Query Hooks

### File: `lib/hooks/crm/use-customers.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, PaginatedResponse } from '@/lib/api';
import { Customer, CustomerListParams } from '@/lib/types/crm';
import { toast } from 'sonner';

export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (params: CustomerListParams) => [...customerKeys.lists(), params] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
};

export function useCustomers(params: CustomerListParams = {}) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => apiClient.get<PaginatedResponse<Customer>>('/crm/customers', params),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => apiClient.get<{ data: Customer }>(`/crm/customers/${id}`),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Customer>) =>
      apiClient.post<{ data: Customer }>('/crm/customers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      toast.success('Customer created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create customer');
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Customer> }) =>
      apiClient.patch<{ data: Customer }>(`/crm/customers/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      toast.success('Customer updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update customer');
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/crm/customers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      toast.success('Customer deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete customer');
    },
  });
}
```

### File: `lib/hooks/crm/use-leads.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, PaginatedResponse } from '@/lib/api';
import { Lead, LeadListParams } from '@/lib/types/crm';
import { toast } from 'sonner';

export const leadKeys = {
  all: ['leads'] as const,
  lists: () => [...leadKeys.all, 'list'] as const,
  list: (params: LeadListParams) => [...leadKeys.lists(), params] as const,
  details: () => [...leadKeys.all, 'detail'] as const,
  detail: (id: string) => [...leadKeys.details(), id] as const,
  pipeline: () => [...leadKeys.all, 'pipeline'] as const,
};

export function useLeads(params: LeadListParams = {}) {
  return useQuery({
    queryKey: leadKeys.list(params),
    queryFn: () => apiClient.get<PaginatedResponse<Lead>>('/crm/leads', params),
  });
}

export function useLeadsPipeline() {
  return useQuery({
    queryKey: leadKeys.pipeline(),
    queryFn: () => apiClient.get<{ data: Record<string, Lead[]> }>('/crm/leads/pipeline'),
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: leadKeys.detail(id),
    queryFn: () => apiClient.get<{ data: Lead }>(`/crm/leads/${id}`),
    enabled: !!id,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Lead>) =>
      apiClient.post<{ data: Lead }>('/crm/leads', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.pipeline() });
      toast.success('Lead created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create lead');
    },
  });
}

export function useUpdateLeadStage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) =>
      apiClient.patch(`/crm/leads/${id}/stage`, { stage }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: leadKeys.pipeline() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update stage');
    },
  });
}

export function useConvertLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { customerId?: string } }) =>
      apiClient.post(`/crm/leads/${id}/convert`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.pipeline() });
      toast.success('Lead converted to customer');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to convert lead');
    },
  });
}
```

---

## 🗄️ Zustand Store

### File: `lib/stores/crm-store.ts`

```typescript
import { createStore } from './create-store';
import { CustomerStatus, LeadStage } from '@/lib/types/crm';

interface CustomerFilters {
  search: string;
  status: CustomerStatus | '';
  accountManagerId: string;
}

interface LeadFilters {
  search: string;
  stage: LeadStage | '';
  ownerId: string;
}

interface CRMState {
  // Customer filters
  customerFilters: CustomerFilters;
  setCustomerFilter: <K extends keyof CustomerFilters>(key: K, value: CustomerFilters[K]) => void;
  resetCustomerFilters: () => void;
  
  // Lead filters
  leadFilters: LeadFilters;
  setLeadFilter: <K extends keyof LeadFilters>(key: K, value: LeadFilters[K]) => void;
  resetLeadFilters: () => void;
  
  // View preferences
  leadsViewMode: 'table' | 'pipeline';
  setLeadsViewMode: (mode: 'table' | 'pipeline') => void;
  
  // Selected items
  selectedCustomerId: string | null;
  setSelectedCustomer: (id: string | null) => void;
}

const defaultCustomerFilters: CustomerFilters = {
  search: '',
  status: '',
  accountManagerId: '',
};

const defaultLeadFilters: LeadFilters = {
  search: '',
  stage: '',
  ownerId: '',
};

export const useCRMStore = createStore<CRMState>('crm-store', (set, get) => ({
  customerFilters: defaultCustomerFilters,
  setCustomerFilter: (key, value) =>
    set({ customerFilters: { ...get().customerFilters, [key]: value } }),
  resetCustomerFilters: () => set({ customerFilters: defaultCustomerFilters }),
  
  leadFilters: defaultLeadFilters,
  setLeadFilter: (key, value) =>
    set({ leadFilters: { ...get().leadFilters, [key]: value } }),
  resetLeadFilters: () => set({ leadFilters: defaultLeadFilters }),
  
  leadsViewMode: 'table',
  setLeadsViewMode: (mode) => set({ leadsViewMode: mode }),
  
  selectedCustomerId: null,
  setSelectedCustomer: (id) => set({ selectedCustomerId: id }),
}));
```

---

## 📄 Zod Validation Schemas

### File: `lib/validations/crm.ts`

```typescript
import { z } from 'zod';

const addressSchema = z.object({
  street1: z.string().min(1, 'Street address is required'),
  street2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
});

export const customerFormSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  legalName: z.string().optional(),
  email: z.string().email('Valid email required').optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().url('Valid URL required').optional().or(z.literal('')),
  industry: z.string().optional(),
  paymentTerms: z.string().optional(),
  creditLimit: z.number().min(0).optional(),
  tags: z.array(z.string()).default([]),
  address: addressSchema.optional(),
});

export const contactFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  title: z.string().optional(),
  department: z.string().optional(),
  email: z.string().email('Valid email required').optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  isPrimary: z.boolean().default(false),
  notes: z.string().optional(),
});

export const leadFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  companyName: z.string().optional(),
  contactName: z.string().optional(),
  email: z.string().email('Valid email required').optional().or(z.literal('')),
  phone: z.string().optional(),
  stage: z.enum(['NEW', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']),
  probability: z.number().min(0).max(100),
  estimatedValue: z.number().min(0).optional(),
  expectedCloseDate: z.string().optional(),
  source: z.string().optional(),
  ownerId: z.string().optional(),
});

export const activityFormSchema = z.object({
  type: z.enum(['CALL', 'EMAIL', 'MEETING', 'NOTE', 'TASK']),
  subject: z.string().min(1, 'Subject is required'),
  description: z.string().optional(),
  scheduledAt: z.string().optional(),
  durationMinutes: z.number().min(0).optional(),
});

export type CustomerFormData = z.infer<typeof customerFormSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type LeadFormData = z.infer<typeof leadFormSchema>;
export type ActivityFormData = z.infer<typeof activityFormSchema>;
```

---

## 📄 Page Implementation

### File: `app/(dashboard)/customers/page.tsx`

```typescript
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, RefreshCw, Building2, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader, EmptyState, LoadingState, ErrorState } from '@/components/shared';
import { CustomerTable } from '@/components/crm/customers/customer-table';
import { CustomerFilters } from '@/components/crm/customers/customer-filters';
import { useCustomers } from '@/lib/hooks/crm/use-customers';
import { useCRMStore } from '@/lib/stores/crm-store';
import { useDebounce } from '@/lib/hooks';

export default function CustomersPage() {
  const router = useRouter();
  const { customerFilters } = useCRMStore();
  const debouncedSearch = useDebounce(customerFilters.search, 300);
  const [page, setPage] = React.useState(1);

  const { data, isLoading, error, refetch } = useCustomers({
    page,
    limit: 20,
    search: debouncedSearch,
    status: customerFilters.status || undefined,
    accountManagerId: customerFilters.accountManagerId || undefined,
  });

  const handleCreate = () => router.push('/customers/new');
  const handleView = (id: string) => router.push(`/customers/${id}`);

  const customers = data?.data || [];
  const activeCount = customers.filter(c => c.status === 'ACTIVE').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Manage customer accounts and relationships"
        actions={
          <>
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.pagination?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">+5</div>
          </CardContent>
        </Card>
      </div>

      <CustomerFilters />

      {isLoading && !data ? (
        <LoadingState message="Loading customers..." />
      ) : error ? (
        <ErrorState
          title="Failed to load customers"
          message={error.message}
          onRetry={() => refetch()}
        />
      ) : customers.length === 0 ? (
        <EmptyState
          title="No customers found"
          description="Add your first customer to get started."
          action={
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          }
        />
      ) : (
        <CustomerTable
          customers={customers}
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

## 🧪 Jest Tests

### File: `components/crm/customers/customer-table.test.tsx`

```typescript
import { render, screen } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { CustomerTable } from './customer-table';
import { Customer } from '@/lib/types/crm';

const mockCustomers: Customer[] = [
  {
    id: '1',
    code: 'CUST001',
    name: 'Acme Corp',
    status: 'ACTIVE',
    email: 'info@acme.com',
    phone: '555-1234',
    tags: [],
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  },
];

describe('CustomerTable', () => {
  const mockOnView = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('renders customer data correctly', () => {
    render(<CustomerTable customers={mockCustomers} onView={mockOnView} />);

    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('CUST001')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
  });

  it('calls onView when row is clicked', async () => {
    const user = userEvent.setup();
    render(<CustomerTable customers={mockCustomers} onView={mockOnView} />);

    await user.click(screen.getByRole('button', { name: /view/i }));
    expect(mockOnView).toHaveBeenCalledWith('1');
  });
});
```

---

## 📁 MSW Handlers

### File: `test/mocks/handlers/crm.ts`

```typescript
import { http, HttpResponse } from 'msw';

const mockCustomers = [
  { id: '1', code: 'CUST001', name: 'Acme Corp', status: 'ACTIVE', tags: [] },
  { id: '2', code: 'CUST002', name: 'Beta Inc', status: 'ACTIVE', tags: [] },
];

const mockLeads = [
  { id: '1', title: 'New opportunity', stage: 'NEW', probability: 20 },
];

export const crmHandlers = [
  http.get('/api/v1/crm/customers', () => {
    return HttpResponse.json({
      data: mockCustomers,
      pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
    });
  }),

  http.get('/api/v1/crm/customers/:id', ({ params }) => {
    const customer = mockCustomers.find(c => c.id === params.id);
    if (!customer) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json({ data: customer });
  }),

  http.post('/api/v1/crm/customers', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ data: { id: '3', ...body } }, { status: 201 });
  }),

  http.get('/api/v1/crm/leads', () => {
    return HttpResponse.json({
      data: mockLeads,
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
  }),

  http.get('/api/v1/crm/leads/pipeline', () => {
    return HttpResponse.json({
      data: { NEW: mockLeads, QUALIFIED: [], PROPOSAL: [], NEGOTIATION: [], WON: [], LOST: [] },
    });
  }),
];
```

---

## ✅ Completion Checklist

### Components
- [ ] `components/crm/customers/customer-table.tsx`
- [ ] `components/crm/customers/customer-form.tsx`
- [ ] `components/crm/customers/customer-detail-card.tsx`
- [ ] `components/crm/customers/customer-filters.tsx`
- [ ] `components/crm/leads/leads-table.tsx`
- [ ] `components/crm/leads/leads-pipeline.tsx`
- [ ] `components/crm/leads/lead-form.tsx`
- [ ] `components/crm/contacts/contacts-table.tsx`
- [ ] `components/crm/contacts/contact-form.tsx`
- [ ] `components/crm/activities/activity-timeline.tsx`
- [ ] `components/crm/activities/activity-form.tsx`

### Pages
- [ ] `app/(dashboard)/customers/page.tsx`
- [ ] `app/(dashboard)/customers/new/page.tsx`
- [ ] `app/(dashboard)/customers/[id]/page.tsx`
- [ ] `app/(dashboard)/customers/[id]/edit/page.tsx`
- [ ] `app/(dashboard)/leads/page.tsx`
- [ ] `app/(dashboard)/leads/new/page.tsx`
- [ ] `app/(dashboard)/leads/[id]/page.tsx`
- [ ] `app/(dashboard)/contacts/page.tsx`

### Hooks & Stores
- [ ] `lib/types/crm.ts`
- [ ] `lib/validations/crm.ts`
- [ ] `lib/hooks/crm/use-customers.ts`
- [ ] `lib/hooks/crm/use-leads.ts`
- [ ] `lib/hooks/crm/use-contacts.ts`
- [ ] `lib/hooks/crm/use-activities.ts`
- [ ] `lib/stores/crm-store.ts`

### Tests
- [ ] `components/crm/customers/customer-table.test.tsx`
- [ ] `components/crm/leads/leads-table.test.tsx`
- [ ] `test/mocks/handlers/crm.ts`
- [ ] All tests passing: `pnpm test`

### Verification
- [ ] TypeScript compiles: `pnpm check-types`
- [ ] Lint passes: `pnpm lint`
- [ ] Manual testing complete

---

## 🔗 Next Steps

After completing this prompt:
1. Proceed to [03-sales-ui.md](./03-sales-ui.md)
2. Update [00-index.md](./00-index.md) status
