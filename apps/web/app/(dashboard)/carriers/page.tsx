'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useCarriers,
  useCreateCarrier,
  useDeleteCarrier,
  useUpdateCarrier,
  useCarrierStats,
} from '@/lib/hooks/operations';
import { OperationsCarrierListItem } from '@/types/carriers';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Plus,
  Search,
  Truck,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  X,
  Building2,
  User,
  Users,
  Phone,
  MapPin,
  Shield,
  AlertTriangle,
  CheckSquare,
  Star,
  Ban,
  Pause,
  Mail,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';

type CarrierType = 'COMPANY' | 'OWNER_OPERATOR';
type CarrierStatus = 'ACTIVE' | 'INACTIVE' | 'PREFERRED' | 'ON_HOLD' | 'BLACKLISTED';

const STATUS_COLORS: Record<CarrierStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
  PREFERRED: 'bg-blue-100 text-blue-800',
  ON_HOLD: 'bg-yellow-100 text-yellow-800',
  BLACKLISTED: 'bg-red-100 text-red-800',
};

const TYPE_COLORS: Record<CarrierType, string> = {
  COMPANY: 'bg-purple-100 text-purple-800',
  OWNER_OPERATOR: 'bg-orange-100 text-orange-800',
};

const STATUS_LABELS: Record<CarrierStatus, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  PREFERRED: 'Preferred',
  ON_HOLD: 'On Hold',
  BLACKLISTED: 'Blacklisted',
};

const TYPE_LABELS: Record<CarrierType, string> = {
  COMPANY: 'Company',
  OWNER_OPERATOR: 'Owner-Operator',
};

export default function CarriersPage() {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState<CarrierType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<CarrierStatus | 'all'>('all');
  const [stateFilter, setStateFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showNewCarrierDialog, setShowNewCarrierDialog] = useState(false);
  const [newCarrierType, setNewCarrierType] = useState<CarrierType>('COMPANY');
  const [newCarrierName, setNewCarrierName] = useState('');
  const pageSize = 25;
  const [showBatchDeleteDialog, setShowBatchDeleteDialog] = useState(false);

  // Fetch carriers
  const { data, isLoading, error } = useCarriers({
    page,
    limit: pageSize,
    search: searchQuery || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    carrierType: typeFilter === 'all' ? undefined : typeFilter,
    state: stateFilter || undefined,
  });

  // Fetch stats
  const { data: stats } = useCarrierStats();

  const createMutation = useCreateCarrier();
  const deleteMutation = useDeleteCarrier();
  const updateMutation = useUpdateCarrier();

  const carriers = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 0;

  // Selection helpers
  const allSelected = carriers.length > 0 && carriers.every((c) => selectedIds.has(c.id));
  const someSelected = selectedIds.size > 0 && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(carriers.map((c) => c.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    setShowBatchDeleteDialog(true);
  };

  const confirmBatchDelete = async () => {
    const ids = Array.from(selectedIds);
    try {
      await Promise.all(ids.map((id) => deleteMutation.mutateAsync(id)));
      setSelectedIds(new Set());
    } catch {
      // Errors handled by React Query
    }
    setShowBatchDeleteDialog(false);
  };

  const clearFilters = () => {
    setTypeFilter('all');
    setStatusFilter('all');
    setStateFilter('');
    setSearchQuery('');
    setPage(1);
  };

  const hasActiveFilters =
    typeFilter !== 'all' || statusFilter !== 'all' || stateFilter || searchQuery;

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
          setNewCarrierName('');
          if (data?.id) {
            router.push(`/carriers/${data.id}`);
          }
        },
      }
    );
  };

  const isInsuranceExpiring = (carrier: OperationsCarrierListItem) => {
    if (!carrier.insuranceExpiryDate) return false;
    const now = new Date();
    const expiry = new Date(carrier.insuranceExpiryDate);
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30;
  };

  const isInsuranceExpired = (carrier: OperationsCarrierListItem) => {
    if (!carrier.insuranceExpiryDate) return false;
    const now = new Date();
    const expiry = new Date(carrier.insuranceExpiryDate);
    return expiry < now;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Carriers</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage trucking companies and owner-operators
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowNewCarrierDialog(true)}
            className="flex-1 sm:flex-initial"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Carrier
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-purple-600">{stats.byType?.COMPANY || 0}</div>
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
              <div className="text-2xl font-bold text-green-600">{stats.byStatus?.ACTIVE || 0}</div>
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
      )}

      {/* Batch Actions Bar */}
      {selectedIds.size > 0 && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="py-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <CheckSquare className="h-5 w-5 text-primary" />
                <span className="font-medium">{selectedIds.size} selected</span>
                <Button variant="ghost" size="sm" onClick={clearSelection}>
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
      )}

      {/* Main Card */}
      <Card>
        <CardHeader>
          <CardTitle>All Carriers</CardTitle>
          <CardDescription>{total} carriers total</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col gap-3 mb-6">
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
                className="pl-10"
              />
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap gap-3">
              <Select
                value={typeFilter}
                onValueChange={(value) => {
                  setTypeFilter(value as CarrierType | 'all');
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[160px]">
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
                  setStatusFilter(value as CarrierStatus | 'all');
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[150px]">
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
                className="w-full sm:w-[100px]"
                maxLength={2}
              />

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Table/Cards */}
          {isLoading ? (
            <div className="text-center py-10 text-muted-foreground">Loading carriers...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">
              Error loading carriers: {error.message}
            </div>
          ) : carriers.length === 0 ? (
            <div className="text-center py-10">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No carriers found</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowNewCarrierDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add your first carrier
              </Button>
            </div>
          ) : (
            <>
              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden space-y-3">
                {carriers.map((carrier) => (
                  <div
                    key={carrier.id}
                    className={`rounded-lg border p-4 ${selectedIds.has(carrier.id) ? 'bg-primary/5 border-primary' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Checkbox
                          checked={selectedIds.has(carrier.id)}
                          onCheckedChange={() => toggleSelect(carrier.id)}
                          aria-label={`Select ${carrier.companyName}`}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              href={`/carriers/${carrier.id}`}
                              className="font-medium hover:underline"
                            >
                              {carrier.companyName || 'Unnamed Carrier'}
                            </Link>
                            <Badge className={TYPE_COLORS[carrier.carrierType]}>
                              {TYPE_LABELS[carrier.carrierType]}
                            </Badge>
                            <Badge className={STATUS_COLORS[carrier.status]}>
                              {STATUS_LABELS[carrier.status]}
                            </Badge>
                          </div>
                          {(carrier.mcNumber || carrier.dotNumber) && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {carrier.mcNumber && `MC# ${carrier.mcNumber}`}
                              {carrier.mcNumber && carrier.dotNumber && ' | '}
                              {carrier.dotNumber && `DOT# ${carrier.dotNumber}`}
                            </p>
                          )}
                          {carrier.city && carrier.state && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {carrier.city}, {carrier.state}
                            </p>
                          )}
                        </div>
                      </div>
                      <CarrierActionsMenu
                        carrier={carrier}
                        onDelete={() => deleteMutation.mutate(carrier.id)}
                        onStatusChange={(status) =>
                          updateMutation.mutate({ id: carrier.id, status })
                        }
                        isDeleting={deleteMutation.isPending}
                      />
                    </div>

                    <div className="mt-3 ml-8 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Phone:</span>
                        <p className="font-medium">{carrier.phone || '-'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span>
                        <p className="font-medium">{carrier.email || '-'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Drivers:</span>
                        <p className="font-medium flex items-center gap-1">
                          <Users className="h-3 w-3" /> {carrier._count?.drivers || 0}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Trucks:</span>
                        <p className="font-medium flex items-center gap-1">
                          <Truck className="h-3 w-3" /> {carrier._count?.trucks || 0}
                        </p>
                      </div>
                      {carrier.insuranceExpiryDate && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Insurance Expires:</span>
                          <p
                            className={`font-medium flex items-center gap-1 ${
                              isInsuranceExpired(carrier)
                                ? 'text-red-600'
                                : isInsuranceExpiring(carrier)
                                  ? 'text-yellow-600'
                                  : ''
                            }`}
                          >
                            {isInsuranceExpired(carrier) && <AlertTriangle className="h-3 w-3" />}
                            {isInsuranceExpiring(carrier) && !isInsuranceExpired(carrier) && (
                              <AlertTriangle className="h-3 w-3" />
                            )}
                            <Shield className="h-3 w-3" /> {formatDate(carrier.insuranceExpiryDate)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={toggleSelectAll}
                          aria-label="Select all"
                          className={someSelected ? 'data-[state=checked]:bg-primary/50' : ''}
                        />
                      </TableHead>
                      <TableHead>Carrier</TableHead>
                      <TableHead>MC# / DOT#</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead className="text-center">Drivers</TableHead>
                      <TableHead className="text-center">Trucks</TableHead>
                      <TableHead>Insurance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {carriers.map((carrier) => (
                      <TableRow
                        key={carrier.id}
                        className={selectedIds.has(carrier.id) ? 'bg-primary/5' : ''}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(carrier.id)}
                            onCheckedChange={() => toggleSelect(carrier.id)}
                            aria-label={`Select ${carrier.companyName}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <Link
                              href={`/carriers/${carrier.id}`}
                              className="font-medium hover:underline"
                            >
                              {carrier.companyName || 'Unnamed Carrier'}
                            </Link>
                            <div className="text-sm mt-1">
                              <Badge
                                variant="outline"
                                className={`text-xs ${TYPE_COLORS[carrier.carrierType]}`}
                              >
                                {TYPE_LABELS[carrier.carrierType]}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {carrier.mcNumber && <div>MC# {carrier.mcNumber}</div>}
                            {carrier.dotNumber && (
                              <div className="text-muted-foreground">DOT# {carrier.dotNumber}</div>
                            )}
                            {!carrier.mcNumber && !carrier.dotNumber && '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {carrier.city && carrier.state ? (
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              {carrier.city}, {carrier.state}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {carrier.phone && (
                              <p className="text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {carrier.phone}
                              </p>
                            )}
                            {carrier.email && (
                              <p className="text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {carrier.email}
                              </p>
                            )}
                            {!carrier.phone && !carrier.email && '-'}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {carrier._count?.drivers || 0}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            {carrier._count?.trucks || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          {carrier.insuranceExpiryDate ? (
                            <div
                              className={`flex items-center gap-1 text-sm ${
                                isInsuranceExpired(carrier)
                                  ? 'text-red-600'
                                  : isInsuranceExpiring(carrier)
                                    ? 'text-yellow-600'
                                    : ''
                              }`}
                            >
                              {(isInsuranceExpired(carrier) || isInsuranceExpiring(carrier)) && (
                                <AlertTriangle className="h-4 w-4" />
                              )}
                              <Shield className="h-4 w-4 text-muted-foreground" />
                              {formatDate(carrier.insuranceExpiryDate)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={STATUS_COLORS[carrier.status]}>
                            {STATUS_LABELS[carrier.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <CarrierActionsMenu
                            carrier={carrier}
                            onDelete={() => deleteMutation.mutate(carrier.id)}
                            onStatusChange={(status) =>
                              updateMutation.mutate({ id: carrier.id, status })
                            }
                            isDeleting={deleteMutation.isPending}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-4">
                  <p className="text-sm text-muted-foreground text-center sm:text-left">
                    Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of{' '}
                    {total} carriers
                  </p>
                  <div className="flex gap-2 justify-center sm:justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </Button>
                    <div className="flex items-center gap-1 text-sm">
                      <span>
                        Page {page} of {totalPages}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

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
              <Label>{newCarrierType === 'COMPANY' ? 'Company Name' : 'Name'}</Label>
              <Input
                placeholder={newCarrierType === 'COMPANY' ? 'ABC Trucking Inc.' : 'John Doe'}
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
              {createMutation.isPending ? 'Creating...' : 'Create Carrier'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showBatchDeleteDialog}
        title="Delete Carriers"
        description={`Are you sure you want to delete ${selectedIds.size} carriers? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        isLoading={deleteMutation.isPending}
        onConfirm={confirmBatchDelete}
        onCancel={() => setShowBatchDeleteDialog(false)}
      />
    </div>
  );
}

interface CarrierActionsMenuProps {
  carrier: OperationsCarrierListItem;
  onDelete: () => void;
  onStatusChange: (status: CarrierStatus) => void;
  isDeleting: boolean;
}

function CarrierActionsMenu({
  carrier,
  onDelete,
  onStatusChange,
  isDeleting,
}: CarrierActionsMenuProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <>
      <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/carriers/${carrier.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/carriers/${carrier.id}?edit=true`}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit Carrier
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Change Status</DropdownMenuLabel>
        {carrier.status !== 'ACTIVE' && (
          <DropdownMenuItem onClick={() => onStatusChange('ACTIVE')} className="text-green-600">
            <CheckSquare className="h-4 w-4 mr-2" />
            Mark Active
          </DropdownMenuItem>
        )}
        {carrier.status !== 'PREFERRED' && (
          <DropdownMenuItem onClick={() => onStatusChange('PREFERRED')} className="text-blue-600">
            <Star className="h-4 w-4 mr-2" />
            Mark Preferred
          </DropdownMenuItem>
        )}
        {carrier.status !== 'ON_HOLD' && (
          <DropdownMenuItem onClick={() => onStatusChange('ON_HOLD')} className="text-yellow-600">
            <Pause className="h-4 w-4 mr-2" />
            Put On Hold
          </DropdownMenuItem>
        )}
        {carrier.status !== 'BLACKLISTED' && (
          <DropdownMenuItem
            onClick={() => onStatusChange('BLACKLISTED')}
            className="text-red-600"
          >
            <Ban className="h-4 w-4 mr-2" />
            Blacklist
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setShowDeleteConfirm(true)}
          className="text-red-600"
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Carrier
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <ConfirmDialog
      open={showDeleteConfirm}
      title="Delete Carrier"
      description="Are you sure you want to delete this carrier? This cannot be undone."
      confirmLabel="Delete"
      destructive
      onConfirm={() => {
        onDelete();
        setShowDeleteConfirm(false);
      }}
      onCancel={() => setShowDeleteConfirm(false)}
    />
    </>
  );
}
