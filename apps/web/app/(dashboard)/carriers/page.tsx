"use client";

import { useState } from "react";
import * as React from "react";
import { useRouter } from "next/navigation";
import {
  useCarriers,
  useCreateCarrier,
  useDeleteCarrier,
  useCarrierStats,
  useUpdateCarrier,
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
  Truck,
  CheckCircle2,
  Star,
  PauseCircle,
  Download,
} from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { toast } from "sonner";
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
import { columns, isInsuranceExpired, isInsuranceExpiring } from "./columns";
import { OperationsCarrierListItem, EQUIPMENT_TYPES, CARRIER_EQUIPMENT_TYPE_LABELS } from "@/types/carriers";
import type { Row } from "@tanstack/react-table";

// --- US States ---
const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
] as const;

// --- Constants ---

type CarrierType = "COMPANY" | "OWNER_OPERATOR";
type CarrierStatus = "PENDING" | "APPROVED" | "ACTIVE" | "INACTIVE" | "SUSPENDED" | "BLACKLISTED";

// --- Components ---

// Color configuration — all class names are complete static strings for Tailwind scanner
const CARD_COLORS = {
  blue600:   { accent: "border-l-blue-600",   iconBg: "bg-blue-50",   iconText: "text-blue-600"   },
  purple600: { accent: "border-l-purple-600", iconBg: "bg-purple-50", iconText: "text-purple-600" },
  orange500: { accent: "border-l-orange-500", iconBg: "bg-orange-50", iconText: "text-orange-500" },
  green600:  { accent: "border-l-green-600",  iconBg: "bg-green-50",  iconText: "text-green-600"  },
  blue500:   { accent: "border-l-blue-500",   iconBg: "bg-blue-50",   iconText: "text-blue-500"   },
  amber500:  { accent: "border-l-amber-500",  iconBg: "bg-amber-50",  iconText: "text-amber-500"  },
} as const;

type ColorKey = keyof typeof CARD_COLORS;

interface StatCard {
  label: string;
  value: number;
  icon: React.ElementType;
  colorKey: ColorKey;
}

function StatsCards({ stats }: { stats: { total: number; byType: Record<string, number>; byStatus: Record<string, number> } | undefined }) {
  if (!stats) return null;

  const cards: StatCard[] = [
    { label: "Total Carriers", value: stats.total ?? 0,                      icon: Truck,        colorKey: "blue600"   },
    { label: "Companies",      value: stats.byType?.COMPANY ?? 0,           icon: Building2,    colorKey: "purple600" },
    { label: "Owner-Ops",      value: stats.byType?.OWNER_OPERATOR ?? 0,    icon: User,         colorKey: "orange500" },
    { label: "Active",         value: stats.byStatus?.ACTIVE ?? 0,          icon: CheckCircle2, colorKey: "green600"  },
    { label: "Approved",       value: stats.byStatus?.APPROVED ?? 0,        icon: Star,         colorKey: "blue500"   },
    { label: "Suspended",      value: stats.byStatus?.SUSPENDED ?? 0,       icon: PauseCircle,  colorKey: "amber500"  },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        const colors = CARD_COLORS[card.colorKey];
        return (
          <Card
            key={card.label}
            className={`border-l-4 ${colors.accent} transition-shadow hover:shadow-md cursor-default`}
          >
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium truncate">{card.label}</p>
                  <div className="text-2xl font-bold mt-0.5">{card.value}</div>
                </div>
                <div className={`shrink-0 rounded-full p-2 ${colors.iconBg}`}>
                  <Icon className={`h-4 w-4 ${colors.iconText}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default function CarriersPage() {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState<CarrierType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<CarrierStatus | "all">("all");
  const [stateFilter, setStateFilter] = useState<string>("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [equipmentFilter, setEquipmentFilter] = useState<string>("all");
  const [complianceFilter, setComplianceFilter] = useState<string>("all");
  const [minScore, setMinScore] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [showNewCarrierDialog, setShowNewCarrierDialog] = useState(false);
  const [newCarrierType, setNewCarrierType] = useState<CarrierType>("COMPANY");
  const [newCarrierName, setNewCarrierName] = useState("");
  const pageSize = 25;
  const [rowSelection, setRowSelection] = useState({});
  const [showBatchDeleteDialog, setShowBatchDeleteDialog] = useState(false);
  const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<CarrierStatus>("ACTIVE");
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch carriers
  const { data, isLoading, error, refetch } = useCarriers({
    page,
    limit: pageSize,
    search: debouncedSearch || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    carrierType: typeFilter === "all" ? undefined : typeFilter,
    state: stateFilter || undefined,
    tier: tierFilter === "all" ? undefined : tierFilter,
    equipmentTypes: equipmentFilter === "all" ? undefined : [equipmentFilter],
    compliance: complianceFilter === "all" ? undefined : complianceFilter,
    minScore: minScore ? Number(minScore) : undefined,
  });

  // Fetch stats
  const { data: stats } = useCarrierStats();

  const createMutation = useCreateCarrier();
  const deleteMutation = useDeleteCarrier();
  const updateMutation = useUpdateCarrier();

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

  const handleBulkStatusUpdate = async () => {
    const selectedIds = Object.keys(rowSelection);
    const results = await Promise.allSettled(
      selectedIds.map((id) => updateMutation.mutateAsync({ id, status: bulkStatus }))
    );
    const failed = results.filter((r) => r.status === "rejected").length;
    const succeeded = results.length - failed;

    if (failed === 0) {
      toast.success(`Updated ${succeeded} carrier${succeeded !== 1 ? "s" : ""} to ${bulkStatus}`);
    } else {
      toast.warning(`Updated ${succeeded} of ${results.length} carriers. ${failed} failed.`);
    }
    setRowSelection({});
    setShowBulkStatusDialog(false);
  };

  const handleExport = (ids?: string[]) => {
    const params = new URLSearchParams();
    if (ids?.length) {
      ids.forEach((id) => params.append("ids", id));
    } else {
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (tierFilter !== "all") params.set("tier", tierFilter);
      if (equipmentFilter !== "all") params.set("equipmentTypes", equipmentFilter);
      if (stateFilter) params.set("state", stateFilter);
    }
    const url = `/api/v1/operations/carriers/export?${params.toString()}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = "carriers.csv";
    a.click();
  };

  const clearFilters = () => {
    setTypeFilter("all");
    setStatusFilter("all");
    setStateFilter("");
    setTierFilter("all");
    setEquipmentFilter("all");
    setComplianceFilter("all");
    setMinScore("");
    setSearchQuery("");
    setPage(1);
  };

  const hasActiveFilters =
    typeFilter !== "all" || statusFilter !== "all" || stateFilter || searchQuery
    || tierFilter !== "all" || equipmentFilter !== "all" || complianceFilter !== "all" || minScore;

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

  const renderBulkActions = (selectedRows: OperationsCarrierListItem[]) => (
    <Card className="border-primary bg-primary/5">
      <CardContent className="py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <CheckSquare className="h-5 w-5 text-primary" />
            <span className="font-medium">{selectedRows.length} selected</span>
            <Button variant="ghost" size="sm" onClick={() => setRowSelection({})}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkStatusDialog(true)}
            >
              Update Status
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport(selectedRows.map((r) => r.id))}
            >
              Export Selected
            </Button>
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
      <div className="flex flex-wrap gap-2">
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
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
            <SelectItem value="BLACKLISTED">Blacklisted</SelectItem>
          </SelectContent>
        </Select>

        <Select value={stateFilter || "all"} onValueChange={(v) => { setStateFilter(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-[110px] h-9">
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {US_STATES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={tierFilter} onValueChange={(v) => { setTierFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[130px] h-9">
            <SelectValue placeholder="Tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="PLATINUM">Platinum</SelectItem>
            <SelectItem value="GOLD">Gold</SelectItem>
            <SelectItem value="SILVER">Silver</SelectItem>
            <SelectItem value="BRONZE">Bronze</SelectItem>
            <SelectItem value="UNRATED">Unrated</SelectItem>
          </SelectContent>
        </Select>

        <Select value={equipmentFilter} onValueChange={(v) => { setEquipmentFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Equipment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Equipment</SelectItem>
            {EQUIPMENT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {CARRIER_EQUIPMENT_TYPE_LABELS[type] ?? type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={complianceFilter} onValueChange={(v) => { setComplianceFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Compliance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Compliance</SelectItem>
            <SelectItem value="COMPLIANT">Compliant</SelectItem>
            <SelectItem value="WARNING">Expiring Soon</SelectItem>
            <SelectItem value="EXPIRED">Expired</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="number"
          placeholder="Min Score"
          value={minScore}
          onChange={(e) => { setMinScore(e.target.value); setPage(1); }}
          className="w-[110px] h-9"
          min={0}
          max={100}
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
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport()}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setShowNewCarrierDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Carrier
            </Button>
          </div>
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
        getRowClassName={(row: Row<OperationsCarrierListItem>) => {
          const carrier = row.original;
          if (isInsuranceExpired(carrier)) return "bg-red-50";
          if (isInsuranceExpiring(carrier)) return "bg-amber-50";
          return undefined;
        }}
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

      {/* Bulk Status Update Dialog */}
      <Dialog open={showBulkStatusDialog} onOpenChange={setShowBulkStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Status</DialogTitle>
            <DialogDescription>
              Change the status of {Object.keys(rowSelection).length} selected carrier{Object.keys(rowSelection).length !== 1 ? "s" : ""}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select
                value={bulkStatus}
                onValueChange={(v) => setBulkStatus(v as CarrierStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  <SelectItem value="BLACKLISTED">Blacklisted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkStatusDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkStatusUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : `Update ${Object.keys(rowSelection).length} Carrier${Object.keys(rowSelection).length !== 1 ? "s" : ""}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
