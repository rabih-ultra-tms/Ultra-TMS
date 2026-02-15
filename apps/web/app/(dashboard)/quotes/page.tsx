"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ListPage } from "@/components/patterns/list-page";
import { useQuotes, useQuoteStats, useDeleteQuote, useCloneQuote, useSendQuote, useConvertQuote } from "@/lib/hooks/sales/use-quotes";
import { useDebounce } from "@/lib/hooks";
import { getColumns } from "./columns";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, X, Trash2, Send, CheckSquare } from "lucide-react";
import type { Quote } from "@/types/quotes";

const ACTIVE_STATUSES = "DRAFT,SENT,VIEWED,ACCEPTED";

function StatsCards({ stats }: { stats: { totalQuotes: number; activePipeline: number; pipelineValue: number; wonThisMonth: number } | undefined }) {
  if (!stats) return null;
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold">{stats.totalQuotes}</div>
          <p className="text-xs text-muted-foreground">Total Quotes</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold text-blue-600">{stats.activePipeline}</div>
          <p className="text-xs text-muted-foreground">Active Pipeline</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold text-green-600">
            ${stats.pipelineValue?.toLocaleString() ?? 0}
          </div>
          <p className="text-xs text-muted-foreground">Pipeline Value</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold text-green-600">
            ${stats.wonThisMonth?.toLocaleString() ?? 0}
          </div>
          <p className="text-xs text-muted-foreground">Won This Month</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function QuotesPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>(ACTIVE_STATUSES);
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [rowSelection, setRowSelection] = useState({});
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const pageSize = 25;

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data, isLoading, error, refetch } = useQuotes({
    page,
    limit: pageSize,
    search: debouncedSearch || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    serviceType: serviceTypeFilter === "all" ? undefined : serviceTypeFilter,
  });

  const { data: stats } = useQuoteStats();

  const deleteMutation = useDeleteQuote();
  const cloneMutation = useCloneQuote();
  const sendMutation = useSendQuote();
  const convertMutation = useConvertQuote();

  const quotes = data?.data ?? [];
  const total = data?.total ?? 0;

  const selectedCount = Object.keys(rowSelection).length;

  const columns = useMemo(
    () =>
      getColumns({
        onClone: (id) => cloneMutation.mutate(id),
        onSend: (id) => sendMutation.mutate(id),
        onDelete: (id) => setDeleteTarget(id),
        onConvert: (id) => convertMutation.mutate(id),
      }),
    [cloneMutation, sendMutation, convertMutation]
  );

  const clearFilters = () => {
    setStatusFilter(ACTIVE_STATUSES);
    setServiceTypeFilter("all");
    setSearchQuery("");
    setPage(1);
  };

  const hasActiveFilters =
    statusFilter !== ACTIVE_STATUSES ||
    serviceTypeFilter !== "all" ||
    searchQuery;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget);
    } finally {
      setDeleteTarget(null);
    }
  };

  const renderBulkActions = () => (
    <Card className="border-primary bg-primary/5">
      <CardContent className="py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <CheckSquare className="h-5 w-5 text-primary" />
            <span className="font-medium">{selectedCount} selected</span>
            <Button variant="ghost" size="sm" onClick={() => setRowSelection({})}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Send className="h-4 w-4 mr-2" />
              Send Selected
            </Button>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const filters = (
    <div className="flex flex-col gap-3 p-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search quotes, customers, lanes..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          className="pl-10 h-10"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[170px] h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ACTIVE_STATUSES}>Active Statuses</SelectItem>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="SENT">Sent</SelectItem>
            <SelectItem value="VIEWED">Viewed</SelectItem>
            <SelectItem value="ACCEPTED">Accepted</SelectItem>
            <SelectItem value="CONVERTED">Converted</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="EXPIRED">Expired</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={serviceTypeFilter}
          onValueChange={(value) => {
            setServiceTypeFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[140px] h-9">
            <SelectValue placeholder="Service Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="FTL">FTL</SelectItem>
            <SelectItem value="LTL">LTL</SelectItem>
            <SelectItem value="PARTIAL">Partial</SelectItem>
            <SelectItem value="DRAYAGE">Drayage</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <ListPage<Quote>
        title="Quotes"
        headerActions={
          <Button onClick={() => router.push("/quotes/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Quote
          </Button>
        }
        topContent={<StatsCards stats={stats} />}
        filters={filters}
        data={quotes}
        columns={columns}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        onRowClick={(row) => router.push(`/quotes/${row.id}`)}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        renderBulkActions={renderBulkActions}
        entityLabel="quotes"
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Quote"
        description="Are you sure you want to delete this draft quote? This cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
