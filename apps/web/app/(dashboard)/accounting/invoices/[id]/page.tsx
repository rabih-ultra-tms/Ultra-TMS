"use client";

import { useRouter } from "next/navigation";
import { DetailPage, DetailTab } from "@/components/patterns/detail-page";
import {
  InvoiceOverviewTab,
  InvoiceLineItemsTab,
  InvoicePaymentsTab,
} from "@/components/accounting/invoice-detail-card";
import { InvoiceStatusBadge } from "@/components/accounting/invoice-status-badge";
import {
  useInvoice,
  useSendInvoice,
  useVoidInvoice,
} from "@/lib/hooks/accounting/use-invoices";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
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
  List,
  CreditCard,
  MoreHorizontal,
  Send,
  FileDown,
  Ban,
} from "lucide-react";

export default function InvoiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { data: invoice, isLoading, error, refetch } = useInvoice(params.id);
  const sendInvoice = useSendInvoice();
  const voidInvoice = useVoidInvoice();

  const handleSend = async () => {
    try {
      await sendInvoice.mutateAsync(params.id);
      toast.success("Invoice sent successfully");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to send invoice";
      toast.error(message);
    }
  };

  const handleVoid = async () => {
    const reason = window.prompt("Enter void reason:");
    if (!reason) return;
    try {
      await voidInvoice.mutateAsync({ id: params.id, reason });
      toast.success("Invoice voided");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to void invoice";
      toast.error(message);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const response = await apiClient.get(`/invoices/${params.id}/pdf`);
      const blob = response as unknown as Blob;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoice?.invoiceNumber || params.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download PDF");
    }
  };

  const canSend =
    invoice?.status === "DRAFT" || invoice?.status === "PENDING";
  const canVoid =
    invoice?.status !== "VOID" && invoice?.status !== "PAID";

  const actions = (
    <>
      {canSend && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleSend}
          disabled={sendInvoice.isPending}
        >
          <Send className="mr-2 size-4" />
          Send
        </Button>
      )}
      <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
        <FileDown className="mr-2 size-4" />
        PDF
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() =>
              router.push(`/accounting/invoices/${params.id}/edit`)
            }
            disabled={invoice?.status === "VOID" || invoice?.status === "PAID"}
          >
            Edit Invoice
          </DropdownMenuItem>
          {canVoid && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={handleVoid}
                disabled={voidInvoice.isPending}
              >
                <Ban className="mr-2 size-4" />
                Void Invoice
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
      content: invoice ? <InvoiceOverviewTab invoice={invoice} /> : null,
    },
    {
      value: "line-items",
      label: `Line Items (${invoice?.lineItems?.length || 0})`,
      icon: List,
      content: invoice ? <InvoiceLineItemsTab invoice={invoice} /> : null,
    },
    {
      value: "payments",
      label: `Payments (${invoice?.payments?.length || 0})`,
      icon: CreditCard,
      content: invoice ? <InvoicePaymentsTab invoice={invoice} /> : null,
    },
  ];

  return (
    <DetailPage
      title={invoice?.invoiceNumber || "Invoice Details"}
      subtitle={
        invoice?.customerName && `Customer: ${invoice.customerName}`
      }
      tags={
        invoice && <InvoiceStatusBadge status={invoice.status} size="md" />
      }
      actions={actions}
      backLink="/accounting/invoices"
      backLabel="Back to Invoices"
      breadcrumb={
        <span>
          Accounting / Invoices / {invoice?.invoiceNumber || "..."}
        </span>
      }
      tabs={tabs}
      isLoading={isLoading}
      error={error as Error}
      onRetry={refetch}
    />
  );
}
