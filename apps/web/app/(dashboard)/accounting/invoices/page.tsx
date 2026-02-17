"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ListPage } from "@/components/patterns/list-page";
import { getInvoiceColumns } from "@/components/accounting/invoices-table";
import { InvoiceFilters } from "@/components/accounting/invoice-filters";
import {
  useInvoices,
  useSendInvoice,
  useVoidInvoice,
} from "@/lib/hooks/accounting/use-invoices";
import type { Invoice, InvoiceStatus } from "@/lib/hooks/accounting/use-invoices";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { apiClient } from "@/lib/api-client";

export default function InvoicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sendInvoice = useSendInvoice();
  const voidInvoice = useVoidInvoice();

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || undefined;
  const status = (searchParams.get("status") as InvoiceStatus) || undefined;
  const fromDate = searchParams.get("fromDate") || undefined;
  const toDate = searchParams.get("toDate") || undefined;

  const { data, isLoading, error, refetch } = useInvoices({
    page,
    limit,
    search,
    status,
    fromDate,
    toDate,
  });

  const [rowSelection, setRowSelection] = useState({});

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handleRowClick = (row: Invoice) => {
    router.push(`/accounting/invoices/${row.id}`);
  };

  const handleSend = async (id: string) => {
    try {
      await sendInvoice.mutateAsync(id);
      toast.success("Invoice sent successfully");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to send invoice";
      toast.error(message);
    }
  };

  const handleVoid = async (id: string) => {
    const reason = window.prompt("Enter void reason:");
    if (!reason) return;
    try {
      await voidInvoice.mutateAsync({ id, reason });
      toast.success("Invoice voided");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to void invoice";
      toast.error(message);
    }
  };

  const handleDownloadPdf = async (id: string) => {
    try {
      const response = await apiClient.get(`/invoices/${id}/pdf`);
      const blob = response as unknown as Blob;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download PDF");
    }
  };

  const columns = getInvoiceColumns({
    onSend: handleSend,
    onVoid: handleVoid,
    onDownloadPdf: handleDownloadPdf,
  });

  return (
    <ListPage
      title="Invoices"
      description="Manage customer invoices and track payments."
      headerActions={
        <Button asChild>
          <Link href="/accounting/invoices/new">
            <Plus className="mr-2 size-4" />
            New Invoice
          </Link>
        </Button>
      }
      filters={<InvoiceFilters />}
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
      rowSelection={rowSelection}
      onRowSelectionChange={setRowSelection}
      entityLabel="invoices"
    />
  );
}
