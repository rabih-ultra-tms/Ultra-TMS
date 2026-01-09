# 64 - Frontend Architecture Standards

**React patterns and page templates for the 3PL Platform**

---

## âš ï¸ CLAUDE CODE: Before Building ANY Screen

1. Check the Screen-API Contract Registry (doc 72) for this screen
2. Verify ALL required API endpoints exist and work
3. Use the page template provided below
4. Handle ALL states: loading, error, empty, success
5. Ensure EVERY button/link/dropdown has an action

---

## Folder Structure

```
apps/web/
â”œâ”€â”€ app/
â”‚   â”œâ”€â”€ (auth)/                    # Public auth pages
â”‚   â”‚   â”œâ”€â”€ login/
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ register/
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ forgot-password/
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â””â”€â”€ layout.tsx             # Auth layout (no sidebar)
â”‚   â”‚
â”‚   â”œâ”€â”€ (dashboard)/               # Protected pages
â”‚   â”‚   â”œâ”€â”€ admin/                 # Admin portal
â”‚   â”‚   â”‚   â”œâ”€â”€ dashboard/
â”‚   â”‚   â”‚   â”œâ”€â”€ users/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ page.tsx       # User list
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ [id]/
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx   # User detail
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ new/
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ page.tsx   # Create user
â”‚   â”‚   â”‚   â””â”€â”€ layout.tsx         # Admin layout
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ dispatch/              # Dispatcher portal
â”‚   â”‚   â”‚   â”œâ”€â”€ dashboard/
â”‚   â”‚   â”‚   â”œâ”€â”€ loads/
â”‚   â”‚   â”‚   â”œâ”€â”€ carriers/
â”‚   â”‚   â”‚   â””â”€â”€ layout.tsx
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ operations/            # Operations portal
â”‚   â”‚   â”œâ”€â”€ sales/                 # Sales portal
â”‚   â”‚   â”œâ”€â”€ accounting/            # Accounting portal
â”‚   â”‚   â””â”€â”€ layout.tsx             # Shared dashboard layout
â”‚   â”‚
â”‚   â””â”€â”€ layout.tsx                 # Root layout
â”‚
â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ ui/                        # shadcn/ui components
â”‚   â”‚   â”œâ”€â”€ button.tsx
â”‚   â”‚   â”œâ”€â”€ card.tsx
â”‚   â”‚   â”œâ”€â”€ dialog.tsx
â”‚   â”‚   â””â”€â”€ ...
â”‚   â”‚
â”‚   â”œâ”€â”€ shared/                    # Shared across portals
â”‚   â”‚   â”œâ”€â”€ data-table/
â”‚   â”‚   â”œâ”€â”€ page-header.tsx
â”‚   â”‚   â”œâ”€â”€ loading-spinner.tsx
â”‚   â”‚   â”œâ”€â”€ error-state.tsx
â”‚   â”‚   â””â”€â”€ empty-state.tsx
â”‚   â”‚
â”‚   â”œâ”€â”€ forms/                     # Reusable form components
â”‚   â”‚   â”œâ”€â”€ carrier-form.tsx
â”‚   â”‚   â”œâ”€â”€ load-form.tsx
â”‚   â”‚   â””â”€â”€ ...
â”‚   â”‚
â”‚   â””â”€â”€ layouts/                   # Layout components
â”‚       â”œâ”€â”€ sidebar.tsx
â”‚       â”œâ”€â”€ header.tsx
â”‚       â””â”€â”€ nav-item.tsx
â”‚
â”œâ”€â”€ hooks/                         # Custom hooks
â”‚   â”œâ”€â”€ use-carriers.ts
â”‚   â”œâ”€â”€ use-loads.ts
â”‚   â”œâ”€â”€ use-debounce.ts
â”‚   â””â”€â”€ use-pagination.ts
â”‚
â”œâ”€â”€ lib/                           # Utilities
â”‚   â”œâ”€â”€ api-client.ts
â”‚   â”œâ”€â”€ utils.ts
â”‚   â””â”€â”€ constants.ts
â”‚
â””â”€â”€ types/                         # TypeScript types
    â”œâ”€â”€ api.ts
    â”œâ”€â”€ carrier.ts
    â””â”€â”€ load.ts
```

---

## Page Templates

### List Page Template (REQUIRED)

Use this template for ALL list pages (carriers, loads, users, etc.):

```typescript
// app/(dashboard)/admin/carriers/page.tsx

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { carrierColumns } from './columns';

interface Carrier {
  id: string;
  name: string;
  mcNumber: string;
  dotNumber: string;
  status: string;
  // ... all fields from API
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function CarriersPage() {
  const router = useRouter();

  // State
  const [carriers, setCarriers] = React.useState<Carrier[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [pagination, setPagination] = React.useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState<string>('');

  // CRITICAL: Extract fetch function with useCallback for reuse
  const fetchCarriers = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(status && { status }),
      });

      const response = await fetch(`/api/v1/carriers?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch carriers');
      }

      const result = await response.json();

      // Handle standard response format
      setCarriers(result.data || []);
      if (result.pagination) {
        setPagination(result.pagination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, status]);

  // Fetch on mount and when dependencies change
  React.useEffect(() => {
    fetchCarriers();
  }, [fetchCarriers]);

  // Handlers - ALL must be implemented
  const handleCreate = () => {
    router.push('/admin/carriers/new');
  };

  const handleView = (carrier: Carrier) => {
    router.push(`/admin/carriers/${carrier.id}`);
  };

  const handleEdit = (carrier: Carrier) => {
    router.push(`/admin/carriers/${carrier.id}/edit`);
  };

  const handleDelete = async (carrier: Carrier) => {
    if (!confirm(`Delete carrier "${carrier.name}"?`)) return;

    try {
      const response = await fetch(`/api/v1/carriers/${carrier.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      // Refresh list after delete
      fetchCarriers();
    } catch (err) {
      alert('Failed to delete carrier');
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  // REQUIRED: Loading state
  if (loading && carriers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // REQUIRED: Error state
  if (error) {
    return (
      <ErrorState
        title="Failed to load carriers"
        message={error}
        onRetry={fetchCarriers}
      />
    );
  }

  // REQUIRED: Empty state
  if (!loading && carriers.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Carriers"
          description="Manage your carrier relationships"
        />
        <EmptyState
          title="No carriers found"
          description="Get started by adding your first carrier."
          action={
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Carrier
            </Button>
          }
        />
      </div>
    );
  }

  // Success state with data
  return (
    <div className="space-y-6">
      <PageHeader
        title="Carriers"
        description="Manage your carrier relationships"
        actions={
          <>
            <Button variant="outline" onClick={fetchCarriers} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Carrier
            </Button>
          </>
        }
      />

      <DataTable
        columns={carrierColumns({
          onView: handleView,
          onEdit: handleEdit,
          onDelete: handleDelete,
        })}
        data={carriers}
        pagination={pagination}
        onPageChange={handlePageChange}
        searchValue={search}
        onSearchChange={setSearch}
        isLoading={loading}
      />
    </div>
  );
}
```

### Detail Page Template

```typescript
// app/(dashboard)/admin/carriers/[id]/page.tsx

'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { ErrorState } from '@/components/shared/error-state';

interface Carrier {
  id: string;
  name: string;
  mcNumber: string;
  dotNumber: string;
  status: string;
  email: string;
  phone: string;
  address: {
    street1: string;
    city: string;
    state: string;
    zipCode: string;
  } | null;
  // ... all fields
}

export default function CarrierDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [carrier, setCarrier] = React.useState<Carrier | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchCarrier = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/carriers/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Carrier not found');
        }
        throw new Error('Failed to fetch carrier');
      }

      const result = await response.json();
      setCarrier(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    fetchCarrier();
  }, [fetchCarrier]);

  const handleEdit = () => {
    router.push(`/admin/carriers/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this carrier?')) return;

    try {
      const response = await fetch(`/api/v1/carriers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      router.push('/admin/carriers');
    } catch (err) {
      alert('Failed to delete carrier');
    }
  };

  const handleBack = () => {
    router.push('/admin/carriers');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !carrier) {
    return (
      <ErrorState
        title="Failed to load carrier"
        message={error || 'Carrier not found'}
        onRetry={fetchCarrier}
        backButton={
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Carriers
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={carrier.name}
        description={`MC# ${carrier.mcNumber} â€¢ DOT# ${carrier.dotNumber}`}
        backButton={
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
        actions={
          <>
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Email</span>
              <p>{carrier.email || 'Not provided'}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Phone</span>
              <p>{carrier.phone || 'Not provided'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent>
            {carrier.address ? (
              <div>
                <p>{carrier.address.street1}</p>
                <p>{carrier.address.city}, {carrier.address.state} {carrier.address.zipCode}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">No address on file</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

### Form Page Template

```typescript
// app/(dashboard)/admin/carriers/new/page.tsx

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Zod schema for validation
const carrierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  mcNumber: z.string().min(1, 'MC Number is required'),
  dotNumber: z.string().min(1, 'DOT Number is required'),
  type: z.enum(['TRUCKLOAD', 'LTL', 'INTERMODAL', 'DRAYAGE']),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
});

type CarrierFormData = z.infer<typeof carrierSchema>;

export default function NewCarrierPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<CarrierFormData>({
    resolver: zodResolver(carrierSchema),
    defaultValues: {
      name: '',
      mcNumber: '',
      dotNumber: '',
      type: 'TRUCKLOAD',
      email: '',
      phone: '',
    },
  });

  const onSubmit = async (data: CarrierFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/v1/carriers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create carrier');
      }

      const result = await response.json();
      router.push(`/admin/carriers/${result.data.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create carrier');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push('/admin/carriers');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Carrier"
        description="Create a new carrier record"
        backButton={
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Carrier Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC Trucking" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="TRUCKLOAD">Truckload</SelectItem>
                          <SelectItem value="LTL">LTL</SelectItem>
                          <SelectItem value="INTERMODAL">Intermodal</SelectItem>
                          <SelectItem value="DRAYAGE">Drayage</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mcNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>MC Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="MC123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dotNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DOT Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="1234567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="dispatch@carrier.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={handleBack}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Carrier
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Shared Components

### PageHeader

```typescript
// components/shared/page-header.tsx

interface PageHeaderProps {
  title: string;
  description?: string;
  backButton?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, backButton, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      {backButton}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
```

### ErrorState

```typescript
// components/shared/error-state.tsx

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  backButton?: React.ReactNode;
}

export function ErrorState({ title, message, onRetry, backButton }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h2 className="text-xl font-semibold mb-2">{title || 'Something went wrong'}</h2>
      <p className="text-muted-foreground mb-6 max-w-md">{message}</p>
      <div className="flex gap-4">
        {backButton}
        {onRetry && (
          <Button onClick={onRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
```

### EmptyState

```typescript
// components/shared/empty-state.tsx

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      {icon || <Inbox className="h-12 w-12 text-muted-foreground mb-4" />}
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      {description && (
        <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      )}
      {action}
    </div>
  );
}
```

---

## Data Fetching Patterns

### Custom Hook Pattern

```typescript
// hooks/use-carriers.ts

import { useState, useCallback, useEffect } from 'react';

interface UseCarriersOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export function useCarriers(options: UseCarriersOptions = {}) {
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchCarriers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: (options.page || 1).toString(),
        limit: (options.limit || 20).toString(),
        ...(options.search && { search: options.search }),
        ...(options.status && { status: options.status }),
      });

      const response = await fetch(`/api/v1/carriers?${params}`);
      if (!response.ok) throw new Error('Failed to fetch');

      const result = await response.json();
      setCarriers(result.data || []);
      setPagination(result.pagination || pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, [options.page, options.limit, options.search, options.status]);

  useEffect(() => {
    fetchCarriers();
  }, [fetchCarriers]);

  return {
    carriers,
    loading,
    error,
    pagination,
    refetch: fetchCarriers,
  };
}
```

---

## Frontend Checklist

### Before Creating ANY Page

- [ ] Page file in correct portal folder
- [ ] API endpoints verified to exist and work
- [ ] TypeScript interfaces match API response

### Required in EVERY Page

- [ ] `'use client'` directive if using hooks
- [ ] Loading state with spinner
- [ ] Error state with retry button
- [ ] Empty state with helpful message
- [ ] `fetchData` extracted with `useCallback`
- [ ] Data refreshes after mutations
- [ ] ALL buttons have onClick handlers
- [ ] ALL dropdown items have actions
- [ ] ALL links point to existing pages

### Required in EVERY Form

- [ ] Zod schema for validation
- [ ] React Hook Form with zodResolver
- [ ] Loading state during submission
- [ ] Error display for validation failures
- [ ] Success redirect or message
- [ ] Cancel button that navigates back

---

## Navigation

- **Previous:** [Database Design Standards](./63-database-design-standards.md)
- **Next:** [UI Component Standards](./65-ui-component-standards.md)
