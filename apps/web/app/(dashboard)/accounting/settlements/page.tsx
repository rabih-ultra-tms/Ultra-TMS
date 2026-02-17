"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ListPage } from "@/components/patterns/list-page";
import { getSettlementColumns } from "@/components/accounting/settlement-table";
import { SettlementFilters } from "@/components/accounting/settlement-filters";
import { useSettlements } from "@/lib/hooks/accounting/use-settlements";
import type {
  Settlement,
  SettlementStatus,
} from "@/lib/hooks/accounting/use-settlements";

export default function SettlementsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || undefined;
  const status = (searchParams.get("status") as SettlementStatus) || undefined;
  const fromDate = searchParams.get("fromDate") || undefined;
  const toDate = searchParams.get("toDate") || undefined;

  const { data, isLoading, error, refetch } = useSettlements({
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

  const handleRowClick = (row: Settlement) => {
    router.push(`/accounting/settlements/${row.id}`);
  };

  const columns = getSettlementColumns({
    onView: (id: string) => router.push(`/accounting/settlements/${id}`),
  });

  return (
    <ListPage
      title="Settlements"
      description="Group carrier payables into settlement payouts."
      filters={<SettlementFilters />}
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
      entityLabel="settlements"
    />
  );
}
