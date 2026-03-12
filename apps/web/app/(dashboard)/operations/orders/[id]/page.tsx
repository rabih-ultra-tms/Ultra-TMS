'use client';

import { use, useCallback } from 'react';
import { useOrder, useBulkUpdateOrderStatus } from '@/lib/hooks/tms/use-orders';
import { useQueryClient } from '@tanstack/react-query';
import { orderKeys } from '@/lib/hooks/tms/use-orders';
import { DetailPage, DetailTab } from '@/components/patterns/detail-page';
import { OrderDetailOverview } from '@/components/tms/orders/order-detail-overview';
import { OrderStopsTab } from '@/components/tms/orders/order-stops-tab';
import { OrderLoadsTab } from '@/components/tms/orders/order-loads-tab';
import { OrderItemsTab } from '@/components/tms/orders/order-items-tab';
import { OrderTimelineTab } from '@/components/tms/orders/order-timeline-tab';
import { OrderStatus } from '@/types/orders';
import {
  LayoutDashboard,
  MapPin,
  Truck,
  Package,
  History,
  FileText,
  MoreHorizontal,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from '@/components/tms/primitives/status-badge';
import {
  STATUS_INTENTS,
  STATUS_LABELS,
} from '@/components/tms/orders/order-columns';
import Link from 'next/link';

// Forward-only status transitions
const STATUS_TRANSITIONS: Partial<
  Record<
    OrderStatus,
    { next: OrderStatus; label: string; requiresLoads?: boolean }
  >
> = {
  [OrderStatus.PENDING]: { next: OrderStatus.BOOKED, label: 'Book Order' },
  [OrderStatus.BOOKED]: {
    next: OrderStatus.DISPATCHED,
    label: 'Mark Dispatched',
    requiresLoads: true,
  },
  [OrderStatus.DISPATCHED]: {
    next: OrderStatus.IN_TRANSIT,
    label: 'Mark In Transit',
  },
  [OrderStatus.IN_TRANSIT]: {
    next: OrderStatus.DELIVERED,
    label: 'Mark Delivered',
  },
  [OrderStatus.DELIVERED]: {
    next: OrderStatus.INVOICED,
    label: 'Mark Invoiced',
  },
  [OrderStatus.INVOICED]: {
    next: OrderStatus.COMPLETED,
    label: 'Mark Completed',
  },
};

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: order, isLoading, error, refetch } = useOrder(id);
  const queryClient = useQueryClient();
  const bulkUpdateStatus = useBulkUpdateOrderStatus();

  const handleStatusChange = useCallback(
    (nextStatus: OrderStatus) => {
      bulkUpdateStatus.mutate(
        { orderIds: [id], status: nextStatus },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) });
          },
        }
      );
    },
    [id, bulkUpdateStatus, queryClient]
  );

  const transition = order ? STATUS_TRANSITIONS[order.status] : undefined;
  const canTransition =
    transition &&
    !(transition.requiresLoads && order && order.loads.length === 0);

  // --- Actions Menu ---
  const actions = (
    <>
      {transition && (
        <Button
          size="sm"
          onClick={() => handleStatusChange(transition.next)}
          disabled={!canTransition || bulkUpdateStatus.isPending}
          title={
            transition.requiresLoads && order && order.loads.length === 0
              ? 'Create a load first'
              : undefined
          }
        >
          <ArrowRight className="h-4 w-4 mr-1" />
          {bulkUpdateStatus.isPending ? 'Updating...' : transition.label}
        </Button>
      )}
      <Button variant="outline" size="sm" asChild>
        <Link href={`/operations/orders/${id}/edit`}>Edit Order</Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled>Duplicate Order</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" disabled>
            Cancel Order
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  // --- Tabs Configuration ---
  const tabs: DetailTab[] = [
    {
      value: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      content: order ? <OrderDetailOverview order={order} /> : null,
    },
    {
      value: 'stops',
      label: `Stops (${order?.stops.length || 0})`,
      icon: MapPin,
      content: order ? <OrderStopsTab order={order} /> : null,
    },
    {
      value: 'loads',
      label: `Loads (${order?.loads.length || 0})`,
      icon: Truck,
      content: order ? <OrderLoadsTab order={order} /> : null,
    },
    {
      value: 'items',
      label: `Items (${order?.items.length || 0})`,
      icon: Package,
      content: order ? <OrderItemsTab order={order} /> : null,
    },
    {
      value: 'documents',
      label: 'Documents',
      icon: FileText,
      content: (
        <div className="p-8 text-center text-muted-foreground">
          Document management coming soon in Phase 3.
        </div>
      ),
    },
    {
      value: 'history',
      label: 'Timeline',
      icon: History,
      content: order ? <OrderTimelineTab orderId={order.id} /> : null,
    },
  ];

  return (
    <DetailPage
      title={order?.orderNumber || 'Order Details'}
      subtitle={order?.customerReference && `Ref: ${order.customerReference}`}
      tags={
        order && (
          <StatusBadge intent={STATUS_INTENTS[order.status]} withDot>
            {STATUS_LABELS[order.status]}
          </StatusBadge>
        )
      }
      actions={actions}
      backLink="/operations/orders"
      backLabel="Back to Orders"
      breadcrumb={
        <span>Operations / Orders / {order?.orderNumber || '...'}</span>
      }
      tabs={tabs}
      isLoading={isLoading}
      error={error as Error}
      onRetry={refetch}
    />
  );
}
