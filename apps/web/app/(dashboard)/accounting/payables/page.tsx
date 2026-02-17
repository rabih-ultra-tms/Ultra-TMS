"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ListPage } from "@/components/patterns/list-page";
import { getPayableColumns } from "@/components/accounting/payables-table";
import { PayableFilters } from "@/components/accounting/payable-filters";
import {
  usePayables,
} from "@/lib/hooks/accounting/use-payables";
import type { Payable, PayableStatus } from "@/lib/hooks/accounting/use-payables";

export default function PayablesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || undefined;
  const status = (searchParams.get("status") as PayableStatus) || undefined;
  const fromDate = searchParams.get("fromDate") || undefined;
  const toDate = searchParams.get("toDate") || undefined;

  const { data, isLoading, error, refetch } = usePayables({
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

  const handleRowClick = (row: Payable) => {
    router.push(`/accounting/payables/${row.id}`);
  };

  const columns = getPayableColumns({
    onView: (id: string) => router.push(`/accounting/payables/${id}`),
  });

  return (
    <ListPage
      title="Carrier Payables"
      description="Amounts owed to carriers for delivered loads."
      filters={<PayableFilters />}
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
      entityLabel="payables"
    />
  );
}
