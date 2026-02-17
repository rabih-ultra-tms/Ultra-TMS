"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ListPage } from "@/components/patterns/list-page";
import { getPaymentColumns } from "@/components/accounting/payments-table";
import { PaymentFilters } from "@/components/accounting/payment-filters";
import {
  usePayments,
  useDeletePayment,
} from "@/lib/hooks/accounting/use-payments";
import type { Payment, PaymentStatus } from "@/lib/hooks/accounting/use-payments";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RecordPaymentForm } from "./record-payment-form";

export default function PaymentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deletePayment = useDeletePayment();
  const [showRecordForm, setShowRecordForm] = useState(false);

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || undefined;
  const status = (searchParams.get("status") as PaymentStatus) || undefined;
  const method = searchParams.get("method") || undefined;
  const fromDate = searchParams.get("fromDate") || undefined;
  const toDate = searchParams.get("toDate") || undefined;

  const { data, isLoading, error, refetch } = usePayments({
    page,
    limit,
    search,
    status,
    method,
    fromDate,
    toDate,
  });

  const [rowSelection, setRowSelection] = useState({});

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handleRowClick = (row: Payment) => {
    router.push(`/accounting/payments/${row.id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePayment.mutateAsync(id);
      toast.success("Payment deleted");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete payment";
      toast.error(message);
    }
  };

  const columns = getPaymentColumns({
    onView: (id) => router.push(`/accounting/payments/${id}`),
    onDelete: handleDelete,
  });

  return (
    <>
      <ListPage
        title="Payments Received"
        description="Track customer payments and allocate to invoices."
        headerActions={
          <Button onClick={() => setShowRecordForm(true)}>
            <Plus className="mr-2 size-4" />
            Record Payment
          </Button>
        }
        filters={<PaymentFilters />}
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
        entityLabel="payments"
      />

      <Dialog open={showRecordForm} onOpenChange={setShowRecordForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <RecordPaymentForm
            onSuccess={() => {
              setShowRecordForm(false);
              refetch();
            }}
            onCancel={() => setShowRecordForm(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
