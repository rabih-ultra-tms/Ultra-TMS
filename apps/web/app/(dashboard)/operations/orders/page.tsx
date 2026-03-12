'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ListPage } from '@/components/patterns/list-page';
import { getOrderColumns } from '@/components/tms/orders/order-columns';
import { OrderFilters } from '@/components/tms/orders/order-filters';
import {
  useOrders,
  useDeleteOrder,
  useBulkUpdateOrderStatus,
} from '@/lib/hooks/tms/use-orders';
import { OrderStatus, Order } from '@/types/orders';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  Download,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { exportToCsv } from '@/lib/utils/csv-export';

function StatsCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${color}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deleteOrder = useDeleteOrder();
  const bulkUpdateStatus = useBulkUpdateOrderStatus();

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  // Bulk status update state
  const [bulkStatusDialogOpen, setBulkStatusDialogOpen] = useState(false);
  const [bulkTargetStatus, setBulkTargetStatus] = useState<string>('');

  // Parse URL params
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || undefined;
  const status = (searchParams.get('status') as OrderStatus) || undefined;
  const fromDate = searchParams.get('fromDate') || undefined;
  const toDate = searchParams.get('toDate') || undefined;
  const customerId = searchParams.get('customerId') || undefined;

  // Fetch data
  const { data, isLoading, error, refetch } = useOrders({
    page,
    limit,
    search,
    status,
    fromDate,
    toDate,
    customerId,
  });

  // Row selection state
  const [rowSelection, setRowSelection] = useState({});

  // Compute stats from current data
  const stats = useMemo(() => {
    const orders = data?.data || [];
    return {
      total: data?.pagination?.total || 0,
      pending: orders.filter((o) => o.status === OrderStatus.PENDING).length,
      inTransit: orders.filter((o) => o.status === OrderStatus.IN_TRANSIT)
        .length,
      delivered: orders.filter((o) => o.status === OrderStatus.DELIVERED)
        .length,
    };
  }, [data]);

  // Handlers
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handleRowClick = (row: Order) => {
    router.push(`/operations/orders/${row.id}`);
  };

  const handleDelete = useCallback((id: string) => {
    setOrderToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!orderToDelete) return;
    try {
      await deleteOrder.mutateAsync(orderToDelete);
    } catch {
      // Error toast is handled by the mutation hook
    } finally {
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    }
  }, [orderToDelete, deleteOrder]);

  const handleExportCsv = useCallback(() => {
    const orders = data?.data || [];
    if (orders.length === 0) {
      toast.info('No data to export');
      return;
    }
    const selectedIds = Object.keys(rowSelection);
    const rows =
      selectedIds.length > 0
        ? orders.filter((o) => selectedIds.includes(o.id))
        : orders;
    const dateStr = new Date().toISOString().slice(0, 10);
    const getFirstStop = (o: Order) =>
      o.stops?.find((s) => s.stopSequence === 1) ?? o.stops?.[0];
    const getLastStop = (o: Order) =>
      o.stops?.length > 1
        ? [...o.stops].sort((a, b) => b.stopSequence - a.stopSequence)[0]
        : null;
    exportToCsv(`orders-${dateStr}.csv`, rows, [
      { header: 'Order #', accessor: (o) => o.orderNumber },
      { header: 'Status', accessor: (o) => o.status },
      { header: 'Customer', accessor: (o) => o.customer?.name ?? '' },
      { header: 'Reference', accessor: (o) => o.customerReference ?? '' },
      { header: 'Equipment', accessor: (o) => o.equipmentType ?? '' },
      {
        header: 'Origin',
        accessor: (o) => {
          const s = getFirstStop(o);
          return s ? `${s.city}, ${s.state}` : '';
        },
      },
      {
        header: 'Destination',
        accessor: (o) => {
          const s = getLastStop(o);
          return s ? `${s.city}, ${s.state}` : '';
        },
      },
      {
        header: 'Pickup Date',
        accessor: (o) => {
          const s = getFirstStop(o);
          return s?.appointmentDate
            ? new Date(s.appointmentDate).toLocaleDateString()
            : '';
        },
      },
      {
        header: 'Delivery Date',
        accessor: (o) => {
          const s = getLastStop(o);
          return s?.appointmentDate
            ? new Date(s.appointmentDate).toLocaleDateString()
            : '';
        },
      },
      { header: 'Commodity', accessor: (o) => o.commodity ?? '' },
      { header: 'Weight (lbs)', accessor: (o) => o.weightLbs ?? '' },
      { header: 'Customer Rate', accessor: (o) => o.customerRate ?? '' },
      { header: 'Total Charges', accessor: (o) => o.totalCharges ?? '' },
      { header: 'Hazmat', accessor: (o) => (o.isHazmat ? 'Yes' : 'No') },
      {
        header: 'Stops',
        accessor: (o) => o._count?.stops ?? o.stops?.length ?? '',
      },
      {
        header: 'Loads',
        accessor: (o) => o._count?.loads ?? o.loads?.length ?? '',
      },
      {
        header: 'Created',
        accessor: (o) =>
          o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '',
      },
    ]);
    toast.success(`Exported ${rows.length} orders`);
  }, [data, rowSelection]);

  const handleBulkStatusUpdate = useCallback(async () => {
    if (!bulkTargetStatus) return;
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0) return;
    await bulkUpdateStatus.mutateAsync({
      orderIds: selectedIds,
      status: bulkTargetStatus,
    });
    setRowSelection({});
    setBulkStatusDialogOpen(false);
    setBulkTargetStatus('');
  }, [bulkTargetStatus, rowSelection, bulkUpdateStatus]);

  const handleStatusChange = async (id: string, newStatus: OrderStatus) => {
    try {
      await bulkUpdateStatus.mutateAsync({
        orderIds: [id],
        status: newStatus,
      });
    } catch {
      toast.error('Failed to update order status');
    }
  };

  return (
    <>
      <ListPage
        title="Orders"
        description="Manage customer orders and shipments."
        headerActions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button asChild>
              <Link href="/operations/orders/new">
                <Plus className="mr-2 h-4 w-4" />
                New Order
              </Link>
            </Button>
          </div>
        }
        stats={
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatsCard
              label="Total Orders"
              value={stats.total}
              icon={Package}
              color="bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
            />
            <StatsCard
              label="Pending"
              value={stats.pending}
              icon={Clock}
              color="bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
            />
            <StatsCard
              label="In Transit"
              value={stats.inTransit}
              icon={Truck}
              color="bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400"
            />
            <StatsCard
              label="Delivered"
              value={stats.delivered}
              icon={CheckCircle2}
              color="bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
            />
          </div>
        }
        filters={<OrderFilters />}
        data={data?.data || []}
        columns={getOrderColumns({
          onDelete: handleDelete,
          onStatusChange: handleStatusChange,
        })}
        total={data?.pagination?.total || 0}
        page={page}
        pageSize={limit}
        pageCount={data?.pagination?.pages || 1}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        error={error ? (error as Error) : null}
        onRetry={refetch}
        onRowClick={handleRowClick}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        entityLabel="orders"
        renderBulkActions={(selectedRows) => (
          <Card className="border-primary bg-primary/5">
            <CardContent className="py-3 flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedRows.length} order
                {selectedRows.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setBulkStatusDialogOpen(true)}
                >
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  Update Status
                </Button>
                <Button size="sm" variant="outline" onClick={handleExportCsv}>
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Export Selected
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setRowSelection({})}
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      />

      {/* Bulk Status Update Dialog */}
      <AlertDialog
        open={bulkStatusDialogOpen}
        onOpenChange={setBulkStatusDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Order Status</AlertDialogTitle>
            <AlertDialogDescription>
              Change status for {Object.keys(rowSelection).length} selected
              order{Object.keys(rowSelection).length !== 1 ? 's' : ''}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select
              value={bulkTargetStatus}
              onValueChange={setBulkTargetStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(OrderStatus).map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBulkTargetStatus('')}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkStatusUpdate}
              disabled={!bulkTargetStatus || bulkUpdateStatus.isPending}
            >
              {bulkUpdateStatus.isPending ? 'Updating...' : 'Update Status'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this order? This action cannot be
              undone. Orders with existing loads cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteOrder.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
