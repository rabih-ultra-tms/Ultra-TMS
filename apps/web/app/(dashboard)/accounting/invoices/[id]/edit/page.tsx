'use client';

import { InvoiceForm } from '@/components/accounting/invoice-form';
import { FormPageSkeleton } from '@/components/shared/form-page-skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { useInvoice } from '@/lib/hooks/accounting/use-invoices';

export default function EditInvoicePage({
  params,
}: {
  params: { id: string };
}) {
  const {
    data: invoice,
    isLoading,
    isError,
    error,
    refetch,
  } = useInvoice(params.id);

  if (isLoading) return <FormPageSkeleton />;
  if (isError)
    return (
      <ErrorState
        message={
          error instanceof Error ? error.message : 'Failed to load invoice'
        }
        retry={refetch}
      />
    );
  if (!invoice) return <ErrorState message="Invoice not found" />;

  const initialData = {
    customerId: invoice.customerId ?? '',
    orderId: invoice.orderId ?? '',
    loadId: invoice.loadId ?? '',
    invoiceDate: invoice.invoiceDate?.slice(0, 10) ?? '',
    paymentTerms: invoice.paymentTerms ?? 'NET30',
    notes: invoice.notes ?? '',
    lineItems:
      invoice.lineItems?.length > 0
        ? invoice.lineItems.map((li) => ({
            description: li.description ?? '',
            quantity: li.quantity ?? 1,
            unitPrice: li.unitPrice ?? 0,
            loadId: li.loadId ?? '',
          }))
        : [{ description: '', quantity: 1, unitPrice: 0, loadId: '' }],
  };

  return <InvoiceForm invoiceId={params.id} initialData={initialData} />;
}
