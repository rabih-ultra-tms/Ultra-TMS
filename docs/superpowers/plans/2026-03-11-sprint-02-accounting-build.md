# Sprint 02 — Accounting Build Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** QA all 7 existing accounting pages against design specs + acceptance criteria, fix gaps (window.prompt, missing routes, missing create actions), and build 2 new pages (Chart of Accounts, Journal Entry View).

**Architecture:** Existing pages use `ListPage`/`DetailPage`/`FormPage` patterns with React Query hooks. New pages follow the same patterns. All hooks already exist or will be created following the established pattern in `lib/hooks/accounting/`.

**Tech Stack:** Next.js 16, React 19, React Query, React Hook Form + Zod, shadcn/ui, Tailwind 4, Sonner toasts

---

## QA Findings Summary

| Issue                                  | Location                                 | Fix                                       |
| -------------------------------------- | ---------------------------------------- | ----------------------------------------- |
| `window.prompt()` x2                   | invoices list + detail void action       | Replace with `ConfirmDialog` + text input |
| No confirmation on destructive actions | settlement delete, payment delete        | Add `ConfirmDialog`                       |
| Missing `/invoices/[id]/edit` route    | invoice detail links to nonexistent page | Create edit page reusing `InvoiceForm`    |
| Missing `/payables/[id]` route         | payables list row click goes to 404      | Create payable detail page                |
| No "Create Settlement" button          | settlements list page                    | Add create settlement dialog/form         |
| Customer ID is raw text input          | invoice form + payment form              | Fine for MVP (customer search is P2)      |
| No Chart of Accounts page              | ACC-008                                  | Build new page                            |
| No Journal Entry View page             | ACC-009                                  | Build new page                            |

---

## Chunk 1: QA Fixes for Existing Pages

### Task 1: Replace `window.prompt()` with VoidInvoiceDialog

**Files:**

- Create: `apps/web/components/accounting/void-invoice-dialog.tsx`
- Modify: `apps/web/app/(dashboard)/accounting/invoices/page.tsx:65-76`
- Modify: `apps/web/app/(dashboard)/accounting/invoices/[id]/page.tsx:57-68`

- [ ] **Step 1: Create VoidInvoiceDialog component**

```tsx
// apps/web/components/accounting/void-invoice-dialog.tsx
'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface VoidInvoiceDialogProps {
  open: boolean;
  onConfirm: (reason: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function VoidInvoiceDialog({
  open,
  onConfirm,
  onCancel,
  isLoading = false,
}: VoidInvoiceDialogProps) {
  const [reason, setReason] = React.useState('');

  const handleConfirm = async () => {
    if (!reason.trim()) return;
    await onConfirm(reason.trim());
    setReason('');
  };

  const handleCancel = () => {
    setReason('');
    onCancel();
  };

  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && handleCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Void Invoice</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The invoice will be marked as void and
            no further payments can be applied.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-2">
          <Label htmlFor="void-reason">Reason for voiding</Label>
          <Textarea
            id="void-reason"
            placeholder="Enter reason..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1.5"
            rows={3}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isLoading || !reason.trim()}
            >
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Void Invoice
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

- [ ] **Step 2: Update invoices list page to use VoidInvoiceDialog**

In `apps/web/app/(dashboard)/accounting/invoices/page.tsx`:

Replace `handleVoid` (lines 65-76) with state-driven dialog:

```tsx
// Add state at top of component
const [voidTarget, setVoidTarget] = useState<string | null>(null);

// Replace handleVoid:
const handleVoid = async (reason: string) => {
  if (!voidTarget) return;
  try {
    await voidInvoice.mutateAsync({ id: voidTarget, reason });
    toast.success('Invoice voided');
    setVoidTarget(null);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to void invoice';
    toast.error(message);
  }
};

// Update columns to pass setVoidTarget instead of inline void:
const columns = getInvoiceColumns({
  onSend: handleSend,
  onVoid: (id: string) => setVoidTarget(id),
  onDownloadPdf: handleDownloadPdf,
});

// Add dialog before closing tag:
<VoidInvoiceDialog
  open={voidTarget !== null}
  onConfirm={handleVoid}
  onCancel={() => setVoidTarget(null)}
  isLoading={voidInvoice.isPending}
/>;
```

- [ ] **Step 3: Update invoice detail page to use VoidInvoiceDialog**

In `apps/web/app/(dashboard)/accounting/invoices/[id]/page.tsx`:

Same pattern — add `showVoidDialog` state, replace `handleVoid` to use dialog, add `<VoidInvoiceDialog>` to JSX.

- [ ] **Step 4: Verify both pages compile**

Run: `pnpm check-types`

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/accounting/void-invoice-dialog.tsx \
  apps/web/app/\(dashboard\)/accounting/invoices/page.tsx \
  apps/web/app/\(dashboard\)/accounting/invoices/\[id\]/page.tsx
git commit -m "fix: replace window.prompt with VoidInvoiceDialog in invoice pages"
```

---

### Task 2: Add ConfirmDialog for settlement delete and payment delete

**Files:**

- Modify: `apps/web/app/(dashboard)/accounting/settlements/[id]/page.tsx:87-97`
- Modify: `apps/web/app/(dashboard)/accounting/payments/[id]/page.tsx:113-123`

- [ ] **Step 1: Add ConfirmDialog to settlement detail delete**

In `apps/web/app/(dashboard)/accounting/settlements/[id]/page.tsx`:

Add state: `const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);`

Replace the `handleDelete` DropdownMenuItem onClick to `() => setShowDeleteConfirm(true)`.

Add `<ConfirmDialog>` before `</DetailPage>`:

```tsx
import { ConfirmDialog } from '@/components/shared/confirm-dialog';

// In JSX, after DetailPage closing or as sibling:
<ConfirmDialog
  open={showDeleteConfirm}
  title="Delete Settlement"
  description="Are you sure you want to delete this settlement? This action cannot be undone."
  confirmLabel="Delete"
  variant="destructive"
  onConfirm={async () => {
    await handleDelete();
    setShowDeleteConfirm(false);
  }}
  onCancel={() => setShowDeleteConfirm(false)}
  isLoading={deleteSettlement.isPending}
/>;
```

- [ ] **Step 2: Add ConfirmDialog to payment detail delete**

Same pattern in `apps/web/app/(dashboard)/accounting/payments/[id]/page.tsx`.

- [ ] **Step 3: Verify compilation**

Run: `pnpm check-types`

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/\(dashboard\)/accounting/settlements/\[id\]/page.tsx \
  apps/web/app/\(dashboard\)/accounting/payments/\[id\]/page.tsx
git commit -m "fix: add ConfirmDialog for settlement and payment delete actions"
```

---

### Task 3: Create Invoice Edit page

**Files:**

- Create: `apps/web/app/(dashboard)/accounting/invoices/[id]/edit/page.tsx`
- Modify: `apps/web/components/accounting/invoice-form.tsx` (add edit mode support)

- [ ] **Step 1: Add edit mode to InvoiceForm**

Modify `apps/web/components/accounting/invoice-form.tsx` to accept optional `invoiceId` and `initialData` props:

```tsx
interface InvoiceFormProps {
  invoiceId?: string;
  initialData?: InvoiceFormValues;
}

export function InvoiceForm({ invoiceId, initialData }: InvoiceFormProps) {
  const router = useRouter();
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const isEdit = Boolean(invoiceId);

  const handleSubmit = async (values: InvoiceFormValues) => {
    try {
      const payload = {
        ...values,
        lineItems: values.lineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          loadId: item.loadId || undefined,
        })),
      };
      if (isEdit && invoiceId) {
        await updateInvoice.mutateAsync({ id: invoiceId, data: payload });
        toast.success('Invoice updated successfully');
        router.push(`/accounting/invoices/${invoiceId}`);
      } else {
        const result = await createInvoice.mutateAsync(payload);
        toast.success('Invoice created successfully');
        router.push(`/accounting/invoices/${result.id}`);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : `Failed to ${isEdit ? 'update' : 'create'} invoice`;
      toast.error(message);
    }
  };

  return (
    <FormPage
      title={isEdit ? 'Edit Invoice' : 'New Invoice'}
      description={
        isEdit
          ? 'Update invoice details.'
          : 'Create a customer invoice for delivered loads.'
      }
      backPath={
        isEdit ? `/accounting/invoices/${invoiceId}` : '/accounting/invoices'
      }
      schema={invoiceFormSchema}
      defaultValues={initialData || DEFAULT_VALUES}
      onSubmit={handleSubmit}
      isSubmitting={isEdit ? updateInvoice.isPending : createInvoice.isPending}
      submitLabel={isEdit ? 'Save Changes' : 'Create Invoice'}
    >
      {(form) => (
        <>
          <InvoiceDetailsSection form={form} />
          <LineItemsSection form={form} />
          <NotesSection form={form} />
        </>
      )}
    </FormPage>
  );
}
```

- [ ] **Step 2: Create the edit page route**

```tsx
// apps/web/app/(dashboard)/accounting/invoices/[id]/edit/page.tsx
'use client';

import { Suspense } from 'react';
import { InvoiceForm } from '@/components/accounting/invoice-form';
import { FormPageSkeleton } from '@/components/shared/form-page-skeleton';
import { useInvoice } from '@/lib/hooks/accounting/use-invoices';
import { ErrorState } from '@/components/shared/error-state';

export default function EditInvoicePage({
  params,
}: {
  params: { id: string };
}) {
  const { data: invoice, isLoading, error, refetch } = useInvoice(params.id);

  if (isLoading) return <FormPageSkeleton />;
  if (error) return <ErrorState error={error as Error} onRetry={refetch} />;
  if (!invoice) return <ErrorState error={new Error('Invoice not found')} />;

  const initialData = {
    customerId: invoice.customerId,
    orderId: invoice.orderId || '',
    loadId: invoice.loadId || '',
    invoiceDate: invoice.invoiceDate?.slice(0, 10) || '',
    paymentTerms: invoice.paymentTerms || 'NET30',
    notes: invoice.notes || '',
    lineItems: invoice.lineItems?.length
      ? invoice.lineItems.map((li) => ({
          description: li.description,
          quantity: li.quantity,
          unitPrice: li.unitPrice,
          loadId: li.loadId || '',
        }))
      : [{ description: '', quantity: 1, unitPrice: 0, loadId: '' }],
  };

  return <InvoiceForm invoiceId={params.id} initialData={initialData} />;
}
```

- [ ] **Step 3: Verify `useUpdateInvoice` hook exists**

Check `apps/web/lib/hooks/accounting/use-invoices.ts` — it should already export `useUpdateInvoice`. If not, add it following the existing pattern.

- [ ] **Step 4: Verify compilation**

Run: `pnpm check-types`

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/\(dashboard\)/accounting/invoices/\[id\]/edit/page.tsx \
  apps/web/components/accounting/invoice-form.tsx
git commit -m "feat: add invoice edit page with form reuse"
```

---

### Task 4: Create Payable Detail page

**Files:**

- Create: `apps/web/app/(dashboard)/accounting/payables/[id]/page.tsx`

- [ ] **Step 1: Create payable detail page**

Follow the same pattern as settlement detail page. Use `DetailPage` with tabs for Overview and related settlement info.

```tsx
// apps/web/app/(dashboard)/accounting/payables/[id]/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { DetailPage, DetailTab } from '@/components/patterns/detail-page';
import { PayableStatusBadge } from '@/components/accounting/payable-status-badge';
import { usePayable } from '@/lib/hooks/accounting/use-payables';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { LayoutDashboard, Truck } from 'lucide-react';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function PayableDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { data: payable, isLoading, error, refetch } = usePayable(params.id);

  const tabs: DetailTab[] = [
    {
      value: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      content: payable ? <PayableOverviewTab payable={payable} /> : null,
    },
    {
      value: 'carrier',
      label: 'Carrier Info',
      icon: Truck,
      content: payable ? <CarrierInfoTab payable={payable} /> : null,
    },
  ];

  return (
    <DetailPage
      title={payable?.loadNumber || 'Payable Details'}
      subtitle={payable?.carrierName && `Carrier: ${payable.carrierName}`}
      tags={payable && <PayableStatusBadge status={payable.status} size="md" />}
      backLink="/accounting/payables"
      backLabel="Back to Payables"
      breadcrumb={
        <span>Accounting / Payables / {payable?.loadNumber || '...'}</span>
      }
      tabs={tabs}
      isLoading={isLoading}
      error={error as Error}
      onRetry={refetch}
    />
  );
}

function PayableOverviewTab({ payable }: { payable: any }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Payable Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow label="Load #" value={payable.loadNumber} />
          <InfoRow
            label="Status"
            value={<PayableStatusBadge status={payable.status} />}
          />
          <InfoRow
            label="Delivery Date"
            value={formatDate(payable.deliveryDate)}
          />
          <InfoRow
            label="Payment Due"
            value={formatDate(payable.paymentDueDate)}
          />
          <InfoRow label="Payment Terms" value={payable.paymentTerms} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Financial Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow
            label="Amount"
            value={
              <span className="text-base font-bold">
                {formatCurrency(payable.amount)}
              </span>
            }
          />
          {payable.quickPayEligible && (
            <>
              <Separator />
              <InfoRow label="Quick Pay Eligible" value="Yes" />
              <InfoRow
                label="Quick Pay Discount"
                value={`${payable.quickPayDiscount}%`}
              />
              <InfoRow
                label="Quick Pay Amount"
                value={
                  <span className="text-emerald-600">
                    {formatCurrency(payable.quickPayAmount)}
                  </span>
                }
              />
            </>
          )}
          {payable.settlementId && (
            <>
              <Separator />
              <InfoRow label="Settlement ID" value={payable.settlementId} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CarrierInfoTab({ payable }: { payable: any }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Carrier</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <InfoRow label="Carrier" value={payable.carrierName} />
        <InfoRow label="Carrier ID" value={payable.carrierId} />
        <InfoRow label="Load #" value={payable.loadNumber} />
        {payable.loadId && <InfoRow label="Load ID" value={payable.loadId} />}
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-sm font-medium text-text-primary">{value}</span>
    </div>
  );
}
```

- [ ] **Step 2: Verify `usePayable(id)` hook exists in use-payables.ts**

Check that the single-item query hook exists. If not, add it following the `useInvoice` pattern.

- [ ] **Step 3: Verify compilation**

Run: `pnpm check-types`

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/\(dashboard\)/accounting/payables/\[id\]/page.tsx
git commit -m "feat: add payable detail page"
```

---

### Task 5: Add "Create Settlement" button to settlements list

**Files:**

- Create: `apps/web/components/accounting/create-settlement-form.tsx`
- Modify: `apps/web/app/(dashboard)/accounting/settlements/page.tsx`

- [ ] **Step 1: Create settlement form dialog component**

```tsx
// apps/web/components/accounting/create-settlement-form.tsx
'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useCreateSettlement } from '@/lib/hooks/accounting/use-settlements';

const settlementFormSchema = z.object({
  carrierId: z.string().min(1, 'Carrier is required'),
  notes: z.string().optional(),
});

type SettlementFormValues = z.infer<typeof settlementFormSchema>;

interface CreateSettlementFormProps {
  onSuccess: (id: string) => void;
  onCancel: () => void;
}

export function CreateSettlementForm({
  onSuccess,
  onCancel,
}: CreateSettlementFormProps) {
  const createSettlement = useCreateSettlement();

  const form = useForm<SettlementFormValues>({
    resolver: zodResolver(settlementFormSchema as any),
    defaultValues: { carrierId: '', notes: '' },
  });

  const onSubmit = async (values: SettlementFormValues) => {
    try {
      const result = await createSettlement.mutateAsync(values);
      toast.success('Settlement created');
      onSuccess(result.id);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to create settlement';
      toast.error(message);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="carrierId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Carrier ID</FormLabel>
              <FormControl>
                <Input placeholder="Enter carrier ID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Optional notes..." rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={createSettlement.isPending}>
            {createSettlement.isPending ? 'Creating...' : 'Create Settlement'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

- [ ] **Step 2: Add create button + dialog to settlements list page**

In `apps/web/app/(dashboard)/accounting/settlements/page.tsx`, add:

```tsx
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateSettlementForm } from "@/components/accounting/create-settlement-form";

// Inside component, add state:
const [showCreateForm, setShowCreateForm] = useState(false);

// Add headerActions prop to ListPage:
headerActions={
  <Button onClick={() => setShowCreateForm(true)}>
    <Plus className="mr-2 size-4" />
    New Settlement
  </Button>
}

// Add Dialog after ListPage closing tag:
<Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
  <DialogContent className="max-w-lg">
    <DialogHeader>
      <DialogTitle>Create Settlement</DialogTitle>
    </DialogHeader>
    <CreateSettlementForm
      onSuccess={(id) => {
        setShowCreateForm(false);
        router.push(`/accounting/settlements/${id}`);
      }}
      onCancel={() => setShowCreateForm(false)}
    />
  </DialogContent>
</Dialog>
```

- [ ] **Step 3: Verify compilation**

Run: `pnpm check-types`

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/accounting/create-settlement-form.tsx \
  apps/web/app/\(dashboard\)/accounting/settlements/page.tsx
git commit -m "feat: add create settlement button and form dialog"
```

---

## Chunk 2: New Pages (ACC-008, ACC-009)

### Task 6: Build Chart of Accounts page (ACC-008)

**Files:**

- Create: `apps/web/lib/hooks/accounting/use-chart-of-accounts.ts`
- Create: `apps/web/app/(dashboard)/accounting/chart-of-accounts/page.tsx`
- Create: `apps/web/components/accounting/chart-of-accounts-table.tsx`
- Create: `apps/web/components/accounting/create-account-form.tsx`

Backend endpoints available:

- `GET /api/v1/chart-of-accounts` — list (filter by type, active)
- `POST /api/v1/chart-of-accounts` — create
- `GET /api/v1/chart-of-accounts/:id` — get single
- `PUT /api/v1/chart-of-accounts/:id` — update
- `DELETE /api/v1/chart-of-accounts/:id` — delete
- `GET /api/v1/chart-of-accounts/trial-balance` — trial balance report

- [ ] **Step 1: Create the React Query hook**

```tsx
// apps/web/lib/hooks/accounting/use-chart-of-accounts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// Types
export type AccountType =
  | 'ASSET'
  | 'LIABILITY'
  | 'EQUITY'
  | 'REVENUE'
  | 'EXPENSE';
export type NormalBalance = 'DEBIT' | 'CREDIT';

export interface ChartOfAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  accountType: AccountType;
  accountSubType: string | null;
  parentAccountId: string | null;
  description: string | null;
  normalBalance: NormalBalance;
  isActive: boolean;
  isSystemAccount: boolean;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

interface ChartOfAccountsParams {
  type?: AccountType;
  active?: boolean;
  page?: number;
  limit?: number;
}

interface ChartOfAccountsResponse {
  data: ChartOfAccount[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface CreateAccountPayload {
  accountNumber: string;
  accountName: string;
  accountType: AccountType;
  accountSubType?: string;
  parentAccountId?: string;
  description?: string;
  normalBalance: NormalBalance;
  isActive?: boolean;
}

// Queries
export function useChartOfAccounts(params: ChartOfAccountsParams = {}) {
  return useQuery<ChartOfAccountsResponse>({
    queryKey: ['chart-of-accounts', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.type) searchParams.set('type', params.type);
      if (params.active !== undefined)
        searchParams.set('active', String(params.active));
      if (params.page) searchParams.set('page', String(params.page));
      if (params.limit) searchParams.set('limit', String(params.limit));
      const query = searchParams.toString();
      return apiClient.get(`/chart-of-accounts${query ? `?${query}` : ''}`);
    },
  });
}

export function useAccount(id: string) {
  return useQuery<ChartOfAccount>({
    queryKey: ['chart-of-accounts', id],
    queryFn: async () => {
      const res = await apiClient.get(`/chart-of-accounts/${id}`);
      return (res as any).data ?? res;
    },
    enabled: Boolean(id),
  });
}

// Mutations
export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAccountPayload) =>
      apiClient.post('/chart-of-accounts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chart-of-accounts'] });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateAccountPayload & { isActive: boolean }>;
    }) => apiClient.put(`/chart-of-accounts/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chart-of-accounts'] });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/chart-of-accounts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chart-of-accounts'] });
    },
  });
}
```

- [ ] **Step 2: Create the table columns component**

```tsx
// apps/web/components/accounting/chart-of-accounts-table.tsx
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import type {
  ChartOfAccount,
  AccountType,
} from '@/lib/hooks/accounting/use-chart-of-accounts';

const TYPE_COLORS: Record<AccountType, string> = {
  ASSET: 'bg-blue-100 text-blue-800',
  LIABILITY: 'bg-red-100 text-red-800',
  EQUITY: 'bg-purple-100 text-purple-800',
  REVENUE: 'bg-emerald-100 text-emerald-800',
  EXPENSE: 'bg-amber-100 text-amber-800',
};

interface ChartOfAccountsColumnsOptions {
  onEdit?: (account: ChartOfAccount) => void;
  onDelete?: (id: string) => void;
}

export function getChartOfAccountsColumns(
  options: ChartOfAccountsColumnsOptions = {}
): ColumnDef<ChartOfAccount>[] {
  return [
    {
      accessorKey: 'accountNumber',
      header: 'Account #',
      cell: ({ row }) => (
        <span className="font-mono font-medium">
          {row.original.accountNumber}
        </span>
      ),
    },
    {
      accessorKey: 'accountName',
      header: 'Account Name',
      cell: ({ row }) => (
        <span className="font-medium text-text-primary">
          {row.original.accountName}
        </span>
      ),
    },
    {
      accessorKey: 'accountType',
      header: 'Type',
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={TYPE_COLORS[row.original.accountType]}
        >
          {row.original.accountType}
        </Badge>
      ),
    },
    {
      accessorKey: 'normalBalance',
      header: 'Normal Balance',
      cell: ({ row }) => row.original.normalBalance,
    },
    {
      accessorKey: 'balance',
      header: 'Balance',
      cell: ({ row }) => (
        <span className="text-right font-medium">
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(row.original.balance)}
        </span>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];
}
```

- [ ] **Step 3: Create the account form component**

```tsx
// apps/web/components/accounting/create-account-form.tsx
'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  useCreateAccount,
  useUpdateAccount,
  type ChartOfAccount,
} from '@/lib/hooks/accounting/use-chart-of-accounts';

const accountSchema = z.object({
  accountNumber: z.string().min(1, 'Account number is required'),
  accountName: z.string().min(1, 'Account name is required'),
  accountType: z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']),
  normalBalance: z.enum(['DEBIT', 'CREDIT']),
  description: z.string().optional(),
});

type AccountFormValues = z.infer<typeof accountSchema>;

interface CreateAccountFormProps {
  account?: ChartOfAccount;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateAccountForm({
  account,
  onSuccess,
  onCancel,
}: CreateAccountFormProps) {
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();
  const isEdit = Boolean(account);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema as any),
    defaultValues: account
      ? {
          accountNumber: account.accountNumber,
          accountName: account.accountName,
          accountType: account.accountType,
          normalBalance: account.normalBalance,
          description: account.description || '',
        }
      : {
          accountNumber: '',
          accountName: '',
          accountType: 'ASSET' as const,
          normalBalance: 'DEBIT' as const,
          description: '',
        },
  });

  const onSubmit = async (values: AccountFormValues) => {
    try {
      if (isEdit && account) {
        await updateAccount.mutateAsync({ id: account.id, data: values });
        toast.success('Account updated');
      } else {
        await createAccount.mutateAsync(values);
        toast.success('Account created');
      }
      onSuccess();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to save account';
      toast.error(message);
    }
  };

  const isPending = isEdit ? updateAccount.isPending : createAccount.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="accountNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Number</FormLabel>
                <FormControl>
                  <Input placeholder="1000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="accountName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Name</FormLabel>
                <FormControl>
                  <Input placeholder="Cash" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="accountType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ASSET">Asset</SelectItem>
                    <SelectItem value="LIABILITY">Liability</SelectItem>
                    <SelectItem value="EQUITY">Equity</SelectItem>
                    <SelectItem value="REVENUE">Revenue</SelectItem>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="normalBalance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Normal Balance</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="DEBIT">Debit</SelectItem>
                    <SelectItem value="CREDIT">Credit</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Account description..."
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? 'Saving...'
              : isEdit
                ? 'Save Changes'
                : 'Create Account'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

- [ ] **Step 4: Create the Chart of Accounts list page**

```tsx
// apps/web/app/(dashboard)/accounting/chart-of-accounts/page.tsx
'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ListPage } from '@/components/patterns/list-page';
import { getChartOfAccountsColumns } from '@/components/accounting/chart-of-accounts-table';
import {
  useChartOfAccounts,
  useDeleteAccount,
  type AccountType,
  type ChartOfAccount,
} from '@/lib/hooks/accounting/use-chart-of-accounts';
import { CreateAccountForm } from '@/components/accounting/create-account-form';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ChartOfAccountsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deleteAccount = useDeleteAccount();

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const type = (searchParams.get('type') as AccountType) || undefined;

  const { data, isLoading, error, refetch } = useChartOfAccounts({
    page,
    limit,
    type,
  });

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editAccount, setEditAccount] = useState<ChartOfAccount | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handleTypeFilter = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'ALL') {
      params.delete('type');
    } else {
      params.set('type', value);
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAccount.mutateAsync(deleteTarget);
      toast.success('Account deleted');
      setDeleteTarget(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete account';
      toast.error(message);
    }
  };

  const columns = getChartOfAccountsColumns({
    onEdit: (account) => setEditAccount(account),
    onDelete: (id) => setDeleteTarget(id),
  });

  const filters = (
    <div className="flex items-center gap-3">
      <Select value={type || 'ALL'} onValueChange={handleTypeFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Types</SelectItem>
          <SelectItem value="ASSET">Assets</SelectItem>
          <SelectItem value="LIABILITY">Liabilities</SelectItem>
          <SelectItem value="EQUITY">Equity</SelectItem>
          <SelectItem value="REVENUE">Revenue</SelectItem>
          <SelectItem value="EXPENSE">Expenses</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <>
      <ListPage
        title="Chart of Accounts"
        description="Manage your general ledger account structure."
        headerActions={
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 size-4" />
            New Account
          </Button>
        }
        filters={filters}
        data={data?.data || []}
        columns={columns}
        total={data?.pagination?.total || 0}
        page={page}
        pageSize={limit}
        pageCount={data?.pagination?.totalPages || 1}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        error={error ? (error as Error) : null}
        onRetry={refetch}
        entityLabel="accounts"
      />

      {/* Create / Edit Dialog */}
      <Dialog
        open={showCreateForm || editAccount !== null}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateForm(false);
            setEditAccount(null);
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editAccount ? 'Edit Account' : 'New Account'}
            </DialogTitle>
          </DialogHeader>
          <CreateAccountForm
            account={editAccount || undefined}
            onSuccess={() => {
              setShowCreateForm(false);
              setEditAccount(null);
              refetch();
            }}
            onCancel={() => {
              setShowCreateForm(false);
              setEditAccount(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Account"
        description="Are you sure? This account will be permanently removed. Historical data referencing this account will be preserved."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteAccount.isPending}
      />
    </>
  );
}
```

- [ ] **Step 5: Add navigation link**

Check `apps/web/lib/config/navigation.ts` and add chart-of-accounts route if missing.

- [ ] **Step 6: Verify compilation**

Run: `pnpm check-types`

- [ ] **Step 7: Commit**

```bash
git add apps/web/lib/hooks/accounting/use-chart-of-accounts.ts \
  apps/web/components/accounting/chart-of-accounts-table.tsx \
  apps/web/components/accounting/create-account-form.tsx \
  apps/web/app/\(dashboard\)/accounting/chart-of-accounts/page.tsx
git commit -m "feat: add Chart of Accounts page (ACC-008)"
```

---

### Task 7: Build Journal Entry View page (ACC-009)

**Files:**

- Create: `apps/web/lib/hooks/accounting/use-journal-entries.ts`
- Create: `apps/web/app/(dashboard)/accounting/journal-entries/page.tsx`
- Create: `apps/web/components/accounting/journal-entries-table.tsx`
- Create: `apps/web/components/accounting/journal-entry-status-badge.tsx`

Backend endpoints available:

- `GET /api/v1/journal-entries` — list (filter by status, referenceType)
- `GET /api/v1/journal-entries/:id` — get single
- `POST /api/v1/journal-entries` — create
- `PUT /api/v1/journal-entries/:id` — update
- `POST /api/v1/journal-entries/:id/post` — post to GL
- `POST /api/v1/journal-entries/:id/void` — void

- [ ] **Step 1: Create the React Query hook**

```tsx
// apps/web/lib/hooks/accounting/use-journal-entries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export type JournalEntryStatus = 'DRAFT' | 'POSTED' | 'VOID';
export type ReferenceType = 'INVOICE' | 'SETTLEMENT' | 'PAYMENT' | 'MANUAL';

export interface JournalEntryLine {
  id: string;
  lineNumber: number;
  accountId: string;
  accountName?: string;
  accountNumber?: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  entryDate: string;
  description: string;
  referenceType: ReferenceType;
  referenceId: string | null;
  status: JournalEntryStatus;
  totalDebit: number;
  totalCredit: number;
  lines: JournalEntryLine[];
  createdAt: string;
  updatedAt: string;
  postedAt: string | null;
  voidedAt: string | null;
}

interface JournalEntriesParams {
  page?: number;
  limit?: number;
  status?: JournalEntryStatus;
  referenceType?: ReferenceType;
}

interface JournalEntriesResponse {
  data: JournalEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useJournalEntries(params: JournalEntriesParams = {}) {
  return useQuery<JournalEntriesResponse>({
    queryKey: ['journal-entries', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.status) searchParams.set('status', params.status);
      if (params.referenceType)
        searchParams.set('referenceType', params.referenceType);
      if (params.page) searchParams.set('page', String(params.page));
      if (params.limit) searchParams.set('limit', String(params.limit));
      const query = searchParams.toString();
      return apiClient.get(`/journal-entries${query ? `?${query}` : ''}`);
    },
  });
}

export function useJournalEntry(id: string) {
  return useQuery<JournalEntry>({
    queryKey: ['journal-entries', id],
    queryFn: async () => {
      const res = await apiClient.get(`/journal-entries/${id}`);
      return (res as any).data ?? res;
    },
    enabled: Boolean(id),
  });
}

export function usePostJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/journal-entries/${id}/post`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
    },
  });
}

export function useVoidJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/journal-entries/${id}/void`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
    },
  });
}
```

- [ ] **Step 2: Create status badge component**

```tsx
// apps/web/components/accounting/journal-entry-status-badge.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import type { JournalEntryStatus } from '@/lib/hooks/accounting/use-journal-entries';

const STATUS_MAP: Record<
  JournalEntryStatus,
  { label: string; className: string }
> = {
  DRAFT: { label: 'Draft', className: 'bg-slate-100 text-slate-700' },
  POSTED: { label: 'Posted', className: 'bg-emerald-100 text-emerald-800' },
  VOID: { label: 'Void', className: 'bg-red-100 text-red-800' },
};

interface JournalEntryStatusBadgeProps {
  status: JournalEntryStatus;
  size?: 'sm' | 'md';
}

export function JournalEntryStatusBadge({
  status,
  size = 'sm',
}: JournalEntryStatusBadgeProps) {
  const config = STATUS_MAP[status] || { label: status, className: '' };
  return (
    <Badge
      variant="outline"
      className={`${config.className} ${size === 'md' ? 'px-3 py-1' : ''}`}
    >
      {config.label}
    </Badge>
  );
}
```

- [ ] **Step 3: Create table columns**

```tsx
// apps/web/components/accounting/journal-entries-table.tsx
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { JournalEntryStatusBadge } from './journal-entry-status-badge';
import type {
  JournalEntry,
  ReferenceType,
} from '@/lib/hooks/accounting/use-journal-entries';

const REF_TYPE_LABELS: Record<ReferenceType, string> = {
  INVOICE: 'Invoice',
  SETTLEMENT: 'Settlement',
  PAYMENT: 'Payment',
  MANUAL: 'Manual',
};

export function getJournalEntryColumns(): ColumnDef<JournalEntry>[] {
  return [
    {
      accessorKey: 'entryNumber',
      header: 'Entry #',
      cell: ({ row }) => (
        <span className="font-mono font-medium">
          {row.original.entryNumber}
        </span>
      ),
    },
    {
      accessorKey: 'entryDate',
      header: 'Date',
      cell: ({ row }) =>
        new Date(row.original.entryDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <span className="max-w-[300px] truncate">
          {row.original.description}
        </span>
      ),
    },
    {
      accessorKey: 'referenceType',
      header: 'Source',
      cell: ({ row }) =>
        REF_TYPE_LABELS[row.original.referenceType] ||
        row.original.referenceType,
    },
    {
      accessorKey: 'totalDebit',
      header: 'Debit',
      cell: ({ row }) => (
        <span className="text-right font-medium">
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(row.original.totalDebit)}
        </span>
      ),
    },
    {
      accessorKey: 'totalCredit',
      header: 'Credit',
      cell: ({ row }) => (
        <span className="text-right font-medium">
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(row.original.totalCredit)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <JournalEntryStatusBadge status={row.original.status} />
      ),
    },
  ];
}
```

- [ ] **Step 4: Create Journal Entries list page with detail drawer**

```tsx
// apps/web/app/(dashboard)/accounting/journal-entries/page.tsx
'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ListPage } from '@/components/patterns/list-page';
import { getJournalEntryColumns } from '@/components/accounting/journal-entries-table';
import {
  useJournalEntries,
  useJournalEntry,
  usePostJournalEntry,
  useVoidJournalEntry,
  type JournalEntry,
  type JournalEntryStatus,
  type ReferenceType,
} from '@/lib/hooks/accounting/use-journal-entries';
import { JournalEntryStatusBadge } from '@/components/accounting/journal-entry-status-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Ban, Loader2 } from 'lucide-react';

export default function JournalEntriesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postEntry = usePostJournalEntry();
  const voidEntry = useVoidJournalEntry();

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const status =
    (searchParams.get('status') as JournalEntryStatus) || undefined;
  const referenceType =
    (searchParams.get('referenceType') as ReferenceType) || undefined;

  const { data, isLoading, error, refetch } = useJournalEntries({
    page,
    limit,
    status,
    referenceType,
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [voidTarget, setVoidTarget] = useState<string | null>(null);

  const { data: selectedEntry, isLoading: entryLoading } = useJournalEntry(
    selectedId || ''
  );

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'ALL') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handlePost = async (id: string) => {
    try {
      await postEntry.mutateAsync(id);
      toast.success('Journal entry posted');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to post entry');
    }
  };

  const handleVoid = async () => {
    if (!voidTarget) return;
    try {
      await voidEntry.mutateAsync(voidTarget);
      toast.success('Journal entry voided');
      setVoidTarget(null);
      setSelectedId(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to void entry');
    }
  };

  const handleRowClick = (row: JournalEntry) => {
    setSelectedId(row.id);
  };

  const columns = getJournalEntryColumns();

  const filters = (
    <div className="flex items-center gap-3">
      <Select
        value={status || 'ALL'}
        onValueChange={(v) => handleFilter('status', v)}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Statuses</SelectItem>
          <SelectItem value="DRAFT">Draft</SelectItem>
          <SelectItem value="POSTED">Posted</SelectItem>
          <SelectItem value="VOID">Void</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={referenceType || 'ALL'}
        onValueChange={(v) => handleFilter('referenceType', v)}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="All Sources" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Sources</SelectItem>
          <SelectItem value="INVOICE">Invoice</SelectItem>
          <SelectItem value="SETTLEMENT">Settlement</SelectItem>
          <SelectItem value="PAYMENT">Payment</SelectItem>
          <SelectItem value="MANUAL">Manual</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <>
      <ListPage
        title="Journal Entries"
        description="General ledger transactions and journal entries."
        filters={filters}
        data={data?.data || []}
        columns={columns}
        total={data?.pagination?.total || 0}
        page={page}
        pageSize={limit}
        pageCount={data?.pagination?.totalPages || 1}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        error={error ? (error as Error) : null}
        onRetry={refetch}
        onRowClick={handleRowClick}
        entityLabel="journal entries"
      />

      {/* Detail Drawer */}
      <Sheet
        open={selectedId !== null}
        onOpenChange={(o) => !o && setSelectedId(null)}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-3">
              {selectedEntry?.entryNumber || '...'}
              {selectedEntry && (
                <JournalEntryStatusBadge status={selectedEntry.status} />
              )}
            </SheetTitle>
          </SheetHeader>

          {entryLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-text-muted" />
            </div>
          ) : selectedEntry ? (
            <div className="mt-6 space-y-6">
              {/* Actions */}
              <div className="flex gap-2">
                {selectedEntry.status === 'DRAFT' && (
                  <Button
                    size="sm"
                    onClick={() => handlePost(selectedEntry.id)}
                    disabled={postEntry.isPending}
                  >
                    <CheckCircle className="mr-2 size-4" />
                    {postEntry.isPending ? 'Posting...' : 'Post to GL'}
                  </Button>
                )}
                {selectedEntry.status !== 'VOID' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setVoidTarget(selectedEntry.id)}
                  >
                    <Ban className="mr-2 size-4" />
                    Void
                  </Button>
                )}
              </div>

              {/* Details */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">
                    Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Date</span>
                    <span>
                      {new Date(selectedEntry.entryDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Description</span>
                    <span>{selectedEntry.description}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Source</span>
                    <span>{selectedEntry.referenceType}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Lines */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">
                    Lines ({selectedEntry.lines?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="px-4 py-2 text-left font-medium text-text-muted">
                            Account
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-text-muted">
                            Description
                          </th>
                          <th className="px-4 py-2 text-right font-medium text-text-muted">
                            Debit
                          </th>
                          <th className="px-4 py-2 text-right font-medium text-text-muted">
                            Credit
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {(selectedEntry.lines || []).map((line) => (
                          <tr key={line.id}>
                            <td className="px-4 py-2 font-mono text-xs">
                              {line.accountNumber || line.accountId}
                              {line.accountName && (
                                <span className="ml-1 text-text-muted">
                                  {line.accountName}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2 text-text-muted">
                              {line.description}
                            </td>
                            <td className="px-4 py-2 text-right">
                              {line.debitAmount > 0
                                ? new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                  }).format(line.debitAmount)
                                : ''}
                            </td>
                            <td className="px-4 py-2 text-right">
                              {line.creditAmount > 0
                                ? new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                  }).format(line.creditAmount)
                                : ''}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-border bg-muted/30">
                          <td
                            colSpan={2}
                            className="px-4 py-2 text-right font-bold"
                          >
                            Totals
                          </td>
                          <td className="px-4 py-2 text-right font-bold">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                            }).format(selectedEntry.totalDebit)}
                          </td>
                          <td className="px-4 py-2 text-right font-bold">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                            }).format(selectedEntry.totalCredit)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Void Confirmation */}
      <ConfirmDialog
        open={voidTarget !== null}
        title="Void Journal Entry"
        description="This will reverse the entry's GL impact. This action cannot be undone."
        confirmLabel="Void Entry"
        variant="destructive"
        onConfirm={handleVoid}
        onCancel={() => setVoidTarget(null)}
        isLoading={voidEntry.isPending}
      />
    </>
  );
}
```

- [ ] **Step 5: Add navigation link**

Check `apps/web/lib/config/navigation.ts` and add journal-entries route if missing.

- [ ] **Step 6: Verify compilation**

Run: `pnpm check-types`

- [ ] **Step 7: Commit**

```bash
git add apps/web/lib/hooks/accounting/use-journal-entries.ts \
  apps/web/components/accounting/journal-entry-status-badge.tsx \
  apps/web/components/accounting/journal-entries-table.tsx \
  apps/web/app/\(dashboard\)/accounting/journal-entries/page.tsx
git commit -m "feat: add Journal Entries page (ACC-009)"
```

---

## Chunk 3: Navigation + Final QA

### Task 8: Update navigation config + dashboard quick links

**Files:**

- Modify: `apps/web/lib/config/navigation.ts`
- Modify: `apps/web/app/(dashboard)/accounting/page.tsx`

- [ ] **Step 1: Add Chart of Accounts and Journal Entries to sidebar navigation**

In `apps/web/lib/config/navigation.ts`, add under the Accounting section:

```tsx
{ label: "Chart of Accounts", href: "/accounting/chart-of-accounts", icon: BookOpen },
{ label: "Journal Entries", href: "/accounting/journal-entries", icon: BookText },
```

- [ ] **Step 2: Add quick links to accounting dashboard**

In `apps/web/app/(dashboard)/accounting/page.tsx`, add to `QUICK_LINKS` array:

```tsx
{
  label: 'Chart of Accounts',
  description: 'GL account structure',
  href: '/accounting/chart-of-accounts',
  icon: BookOpen,
},
{
  label: 'Journal Entries',
  description: 'GL transactions & entries',
  href: '/accounting/journal-entries',
  icon: BookText,
},
```

- [ ] **Step 3: Add Payables quick link if missing**

Verify payables link exists in dashboard quick links.

- [ ] **Step 4: Verify compilation**

Run: `pnpm check-types`

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/config/navigation.ts \
  apps/web/app/\(dashboard\)/accounting/page.tsx
git commit -m "feat: add Chart of Accounts and Journal Entries to navigation"
```

---

### Task 9: Full build verification

- [ ] **Step 1: Run type check**

Run: `pnpm check-types`
Expected: 0 errors

- [ ] **Step 2: Run lint**

Run: `pnpm lint`
Expected: No new errors in accounting files

- [ ] **Step 3: Run build**

Run: `pnpm build`
Expected: Successful build

- [ ] **Step 4: Run existing accounting tests**

Run: `pnpm --filter web test -- --testPathPattern=accounting`
Expected: All existing tests pass

- [ ] **Step 5: Update sprint doc status**

Mark all ACC tasks as "done" in `dev_docs_v3/08-sprints/sprint-02-accounting-build.md`.

- [ ] **Step 6: Final commit**

```bash
git add dev_docs_v3/08-sprints/sprint-02-accounting-build.md
git commit -m "chore: mark Sprint 02 accounting tasks complete"
```

---

## Summary

| Task                         | Type      | Sprint ID        | Effort   |
| ---------------------------- | --------- | ---------------- | -------- |
| 1. VoidInvoiceDialog         | QA fix    | ACC-002, ACC-003 | S (1h)   |
| 2. ConfirmDialog for deletes | QA fix    | ACC-006, ACC-004 | S (0.5h) |
| 3. Invoice Edit page         | Gap fill  | ACC-002          | M (2h)   |
| 4. Payable Detail page       | Gap fill  | ACC-005          | M (1.5h) |
| 5. Create Settlement form    | Gap fill  | ACC-006          | S (1h)   |
| 6. Chart of Accounts page    | New build | ACC-008          | M (3h)   |
| 7. Journal Entries page      | New build | ACC-009          | M (2h)   |
| 8. Navigation + dashboard    | Polish    | All              | S (0.5h) |
| 9. Build verification        | QA        | All              | S (0.5h) |
| **Total**                    |           |                  | **~12h** |

**Estimated vs sprint budget:** 12h actual vs 41h estimated — 70% savings from leveraging existing code.
