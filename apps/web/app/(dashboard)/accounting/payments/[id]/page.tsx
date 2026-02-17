"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DetailPage, DetailTab } from "@/components/patterns/detail-page";
import { PaymentStatusBadge } from "@/components/accounting/payment-status-badge";
import {
  PaymentAllocation,
  AllocationEntry,
} from "@/components/accounting/payment-allocation";
import {
  usePayment,
  useAllocatePayment,
  useDeletePayment,
} from "@/lib/hooks/accounting/use-payments";
import { useInvoices } from "@/lib/hooks/accounting/use-invoices";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  CreditCard,
  ListChecks,
  MoreHorizontal,
  Trash2,
  Save,
} from "lucide-react";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const METHOD_LABELS: Record<string, string> = {
  CHECK: "Check",
  ACH: "ACH",
  WIRE: "Wire",
  CREDIT_CARD: "Credit Card",
};

export default function PaymentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { data: payment, isLoading, error, refetch } = usePayment(params.id);
  const deletePayment = useDeletePayment();
  const allocatePayment = useAllocatePayment();

  const [allocations, setAllocations] = React.useState<AllocationEntry[]>([]);
  const [hasChanges, setHasChanges] = React.useState(false);

  // Load customer's open invoices for allocation
  const { data: invoiceData, isLoading: invoicesLoading } = useInvoices({
    customerId: payment?.customerId,
    limit: 100,
    status: undefined,
  });

  // Sync existing allocations on load
  React.useEffect(() => {
    if (payment?.allocations) {
      setAllocations(
        payment.allocations.map((a) => ({
          invoiceId: a.invoiceId,
          amount: a.amount,
        }))
      );
      setHasChanges(false);
    }
  }, [payment?.allocations]);

  const handleAllocationsChange = (newAllocations: AllocationEntry[]) => {
    setAllocations(newAllocations);
    setHasChanges(true);
  };

  const handleSaveAllocations = async () => {
    try {
      await allocatePayment.mutateAsync({
        id: params.id,
        allocations: allocations.filter((a) => a.amount > 0),
      });
      toast.success("Payment allocation saved");
      setHasChanges(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save allocation";
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePayment.mutateAsync(params.id);
      toast.success("Payment deleted");
      router.push("/accounting/payments");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete payment";
      toast.error(message);
    }
  };

  const canDelete =
    payment?.status !== "VOIDED" && payment?.status !== "APPLIED";
  const canAllocate =
    payment?.status !== "VOIDED";

  const actions = (
    <>
      {canAllocate && hasChanges && (
        <Button
          size="sm"
          onClick={handleSaveAllocations}
          disabled={allocatePayment.isPending}
        >
          <Save className="mr-2 size-4" />
          {allocatePayment.isPending ? "Saving..." : "Save Allocation"}
        </Button>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={handleDelete}
                disabled={deletePayment.isPending}
              >
                <Trash2 className="mr-2 size-4" />
                Delete Payment
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  const tabs: DetailTab[] = [
    {
      value: "overview",
      label: "Overview",
      icon: LayoutDashboard,
      content: payment ? <PaymentOverviewTab payment={payment} /> : null,
    },
    {
      value: "allocations",
      label: `Allocations (${payment?.allocations?.length || 0})`,
      icon: ListChecks,
      content: payment ? (
        <PaymentAllocationsTab payment={payment} />
      ) : null,
    },
    {
      value: "allocate",
      label: "Allocate Payment",
      icon: CreditCard,
      content:
        payment && canAllocate ? (
          <PaymentAllocation
            invoices={invoiceData?.data || []}
            totalPayment={payment.amount}
            allocations={allocations}
            onAllocationsChange={handleAllocationsChange}
            isLoading={invoicesLoading}
          />
        ) : (
          <div className="py-12 text-center text-sm text-text-muted">
            This payment cannot be allocated.
          </div>
        ),
    },
  ];

  return (
    <DetailPage
      title={payment?.paymentNumber || "Payment Details"}
      subtitle={
        payment?.customerName && `Customer: ${payment.customerName}`
      }
      tags={
        payment && <PaymentStatusBadge status={payment.status} size="md" />
      }
      actions={actions}
      backLink="/accounting/payments"
      backLabel="Back to Payments"
      breadcrumb={
        <span>
          Accounting / Payments / {payment?.paymentNumber || "..."}
        </span>
      }
      tabs={tabs}
      isLoading={isLoading}
      error={error as Error}
      onRetry={refetch}
    />
  );
}

// ===========================
// Overview Tab
// ===========================

function PaymentOverviewTab({
  payment,
}: {
  payment: NonNullable<ReturnType<typeof usePayment>["data"]>;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow label="Payment #" value={payment.paymentNumber} />
          <InfoRow
            label="Status"
            value={<PaymentStatusBadge status={payment.status} />}
          />
          <InfoRow
            label="Method"
            value={METHOD_LABELS[payment.method] || payment.method}
          />
          <InfoRow label="Date" value={formatDate(payment.paymentDate)} />
          {payment.referenceNumber && (
            <InfoRow label="Reference #" value={payment.referenceNumber} />
          )}
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
            label="Total Amount"
            value={
              <span className="text-base font-bold">
                {formatCurrency(payment.amount)}
              </span>
            }
          />
          <InfoRow
            label="Applied"
            value={
              <span className="text-emerald-600">
                {formatCurrency(payment.appliedAmount)}
              </span>
            }
          />
          <Separator />
          <InfoRow
            label="Unapplied"
            value={
              <span
                className={`text-base font-bold ${
                  payment.unappliedAmount > 0
                    ? "text-amber-600"
                    : "text-emerald-600"
                }`}
              >
                {formatCurrency(payment.unappliedAmount)}
              </span>
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Customer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow label="Customer" value={payment.customerName} />
          <InfoRow label="Customer ID" value={payment.customerId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow label="Created" value={formatDate(payment.createdAt)} />
          <InfoRow label="Updated" value={formatDate(payment.updatedAt)} />
        </CardContent>
      </Card>

      {payment.notes && (
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-text-muted">
              {payment.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ===========================
// Allocations Tab (read-only view)
// ===========================

function PaymentAllocationsTab({
  payment,
}: {
  payment: NonNullable<ReturnType<typeof usePayment>["data"]>;
}) {
  const allocs = payment.allocations || [];

  if (allocs.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-text-muted">
        No allocations recorded. Use the &ldquo;Allocate Payment&rdquo; tab to
        apply this payment to invoices.
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-text-muted">
                  Invoice #
                </th>
                <th className="px-4 py-3 text-right font-medium text-text-muted">
                  Invoice Total
                </th>
                <th className="px-4 py-3 text-right font-medium text-text-muted">
                  Invoice Balance
                </th>
                <th className="px-4 py-3 text-right font-medium text-text-muted">
                  Applied Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allocs.map((alloc) => (
                <tr key={alloc.id}>
                  <td className="px-4 py-3 font-medium text-text-primary">
                    {alloc.invoiceNumber}
                  </td>
                  <td className="px-4 py-3 text-right text-text-primary">
                    {formatCurrency(alloc.invoiceTotal)}
                  </td>
                  <td className="px-4 py-3 text-right text-text-muted">
                    {formatCurrency(alloc.invoiceBalance)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-emerald-600">
                    {formatCurrency(alloc.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border bg-muted/30">
                <td
                  colSpan={3}
                  className="px-4 py-3 text-right font-medium text-text-primary"
                >
                  Total Applied
                </td>
                <td className="px-4 py-3 text-right font-medium text-emerald-600">
                  {formatCurrency(payment.appliedAmount)}
                </td>
              </tr>
              <tr className="bg-muted/50">
                <td
                  colSpan={3}
                  className="px-4 py-3 text-right font-bold text-text-primary"
                >
                  Unapplied Balance
                </td>
                <td
                  className={`px-4 py-3 text-right font-bold ${
                    payment.unappliedAmount > 0
                      ? "text-amber-600"
                      : "text-emerald-600"
                  }`}
                >
                  {formatCurrency(payment.unappliedAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ===========================
// Shared helpers
// ===========================

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-sm font-medium text-text-primary">{value}</span>
    </div>
  );
}
