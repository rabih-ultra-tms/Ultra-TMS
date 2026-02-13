"use client";

import { useState } from "react";
import * as React from "react";
import { useRouter } from "next/navigation";
import {
  useCarriers,
  useCreateCarrier,
  useDeleteCarrier,
  useCarrierStats,
} from "@/lib/hooks/operations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Search,
  X,
  Trash2,
  CheckSquare,
  Building2,
  User,
} from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useDebounce } from "@/lib/hooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ListPage } from "@/components/patterns/list-page";
import { columns } from "./columns";
import { OperationsCarrierListItem } from "@/types/carriers";

// --- Constants ---

type CarrierType = "COMPANY" | "OWNER_OPERATOR";
type CarrierStatus = "ACTIVE" | "INACTIVE" | "PREFERRED" | "ON_HOLD" | "BLACKLISTED";

// --- Components ---

function StatsCards({ stats }: { stats: any }) {
  if (!stats) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      <Card>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">Total</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold text-purple-600">
            {stats.byType?.COMPANY || 0}
          </div>
          <p className="text-xs text-muted-foreground">Companies</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold text-orange-600">
            {stats.byType?.OWNER_OPERATOR || 0}
          </div>
          <p className="text-xs text-muted-foreground">Owner-Ops</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold text-green-600">
            {stats.byStatus?.ACTIVE || 0}
          </div>
          <p className="text-xs text-muted-foreground">Active</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold text-blue-600">
            {stats.byStatus?.PREFERRED || 0}
          </div>
          <p className="text-xs text-muted-foreground">Preferred</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold text-yellow-600">
            {stats.byStatus?.ON_HOLD || 0}
          </div>
          <p className="text-xs text-muted-foreground">On Hold</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CarriersPage() {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState<CarrierType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<CarrierStatus | "all">("all");
  const [stateFilter, setStateFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [showNewCarrierDialog, setShowNewCarrierDialog] = useState(false);
  const [newCarrierType, setNewCarrierType] = useState<CarrierType>("COMPANY");
  const [newCarrierName, setNewCarrierName] = useState("");
  const pageSize = 25;
  const [rowSelection, setRowSelection] = useState({});
  const [showBatchDeleteDialog, setShowBatchDeleteDialog] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch carriers
  const { data, isLoading, error, refetch } = useCarriers({
    page,
    limit: pageSize,
    search: debouncedSearch || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    carrierType: typeFilter === "all" ? undefined : typeFilter,
    state: stateFilter || undefined,
  });

  // Fetch stats
  const { data: stats } = useCarrierStats();

  const createMutation = useCreateCarrier();
  const deleteMutation = useDeleteCarrier();

  const carriers = data?.data || [];
  const total = data?.total || 0;

  // Selection helpers
  const selectedCount = Object.keys(rowSelection).length;

  React.useEffect(() => {
    // Reset selection when data changes (e.g. filter/page change)
    // Actually, TanStack table handles this via row id, but good to be safe if we want to clear.
    // For now, let's keep selection if ids match.
  }, [data]);

  const handleBatchDelete = () => {
    if (selectedCount === 0) return;
    setShowBatchDeleteDialog(true);
  };

  const confirmBatchDelete = async () => {
    const selectedIds = Object.keys(rowSelection);
    try {
      await Promise.all(selectedIds.map((id) => deleteMutation.mutateAsync(id)));
      setRowSelection({});
    } catch {
      // Errors handled by React Query
    }
    setShowBatchDeleteDialog(false);
  };

  const clearFilters = () => {
    setTypeFilter("all");
    setStatusFilter("all");
    setStateFilter("");
    setSearchQuery("");
    setPage(1);
  };

  const hasActiveFilters =
    typeFilter !== "all" || statusFilter !== "all" || stateFilter || searchQuery;

  const handleCreateCarrier = () => {
    if (!newCarrierName) return;

    createMutation.mutate(
      {
        carrierType: newCarrierType,
        companyName: newCarrierName,
      },
      {
        onSuccess: (data) => {
          setShowNewCarrierDialog(false);
          setNewCarrierName("");
          if (data?.id) {
            router.push(`/carriers/${data.id}`);
          }
        },
      }
    );
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
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBatchDelete}
              disabled={deleteMutation.isPending}
              className="flex-1 sm:flex-initial"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Delete Selected</span>
              <span className="sm:hidden">Delete</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const filters = (
    <div className="flex flex-col gap-3 p-4">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, MC#, DOT#, contact..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          className="pl-10 h-10"
        />
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap gap-3">
        <Select
          value={typeFilter}
          onValueChange={(value) => {
            setTypeFilter(value as CarrierType | "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[160px] h-9">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="COMPANY">Company</SelectItem>
            <SelectItem value="OWNER_OPERATOR">Owner-Operator</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value as CarrierStatus | "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[150px] h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
            <SelectItem value="PREFERRED">Preferred</SelectItem>
            <SelectItem value="ON_HOLD">On Hold</SelectItem>
            <SelectItem value="BLACKLISTED">Blacklisted</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="State"
          value={stateFilter}
          onChange={(e) => {
            setStateFilter(e.target.value.toUpperCase().slice(0, 2));
            setPage(1);
          }}
          className="w-full sm:w-[80px] h-9"
          maxLength={2}
        />

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
      <ListPage<OperationsCarrierListItem>
        title="Carriers"
        description="Manage trucking companies and owner-operators"
        headerActions={
          <Button onClick={() => setShowNewCarrierDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Carrier
          </Button>
        }
        topContent={<StatsCards stats={stats} />}
        filters={filters}
        data={carriers}
        columns={columns}
        total={total}
        page={page}
        onPageChange={setPage}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        onRowClick={(row) => router.push(`/carriers/${row.id}`)}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        renderBulkActions={renderBulkActions}
        entityLabel="carriers"
      />

      {/* New Carrier Dialog */}
      <Dialog open={showNewCarrierDialog} onOpenChange={setShowNewCarrierDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Carrier</DialogTitle>
            <DialogDescription>
              Create a new trucking company or owner-operator record.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Carrier Type</Label>
              <Select
                value={newCarrierType}
                onValueChange={(value) => setNewCarrierType(value as CarrierType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPANY">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Company
                    </div>
                  </SelectItem>
                  <SelectItem value="OWNER_OPERATOR">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Owner-Operator
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{newCarrierType === "COMPANY" ? "Company Name" : "Name"}</Label>
              <Input
                placeholder={newCarrierType === "COMPANY" ? "ABC Trucking Inc." : "John Doe"}
                value={newCarrierName}
                onChange={(e) => setNewCarrierName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewCarrierDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateCarrier}
              disabled={createMutation.isPending || !newCarrierName}
            >
              {createMutation.isPending ? "Creating..." : "Create Carrier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showBatchDeleteDialog}
        title="Delete Carriers"
        description={`Are you sure you want to delete ${selectedCount} carriers? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={confirmBatchDelete}
        onCancel={() => setShowBatchDeleteDialog(false)}
      />
    </>
  );
}
