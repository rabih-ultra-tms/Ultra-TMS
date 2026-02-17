'use client';

import { Button } from '@/components/ui/button';
import {
  useMarkArrived,
  useMarkDeparted,
  useUpdateStopStatus,
  Stop,
  StopStatus,
} from '@/lib/hooks/tms/use-stops';
import {
  CheckCircle,
  MapPin,
  ArrowUpFromLine,
  ArrowDownToLine,
  PackageCheck,
  Navigation,
} from 'lucide-react';

interface StopActionsProps {
  stop: Stop;
}

interface ActionButton {
  label: string;
  icon: React.ElementType;
  action: () => void;
  variant?: 'default' | 'outline' | 'secondary';
}

export function StopActions({ stop }: StopActionsProps) {
  const markArrived = useMarkArrived();
  const markDeparted = useMarkDeparted();
  const updateStatus = useUpdateStopStatus();

  const { status, stopType, id, orderId } = stop;

  // Derive the action button from stop state — no useMemo needed (trivial switch)
  let actionButton: ActionButton | null = null;

  switch (status) {
    case 'PENDING':
      actionButton = {
        label: 'Mark En Route',
        icon: Navigation,
        action: () =>
          updateStatus.mutate({
            stopId: id,
            orderId,
            status: 'EN_ROUTE' as StopStatus,
          }),
        variant: 'outline',
      };
      break;

    case 'EN_ROUTE':
      actionButton = {
        label: 'Mark Arrived',
        icon: MapPin,
        action: () => markArrived.mutate({ stopId: id, orderId }),
        variant: 'default',
      };
      break;

    case 'ARRIVED':
      if (stopType === 'PICKUP') {
        actionButton = {
          label: 'Start Loading',
          icon: ArrowUpFromLine,
          action: () =>
            updateStatus.mutate({
              stopId: id,
              orderId,
              status: 'LOADING' as StopStatus,
            }),
          variant: 'default',
        };
      } else {
        actionButton = {
          label: 'Start Unloading',
          icon: ArrowDownToLine,
          action: () =>
            updateStatus.mutate({
              stopId: id,
              orderId,
              status: 'UNLOADING' as StopStatus,
            }),
          variant: 'default',
        };
      }
      break;

    case 'LOADING':
      actionButton = {
        label: 'Loading Complete',
        icon: PackageCheck,
        action: () =>
          updateStatus.mutate({
            stopId: id,
            orderId,
            status: 'LOADED' as StopStatus,
          }),
        variant: 'default',
      };
      break;

    case 'UNLOADING':
      actionButton = {
        label: 'Unloading Complete',
        icon: PackageCheck,
        action: () =>
          updateStatus.mutate({
            stopId: id,
            orderId,
            status: 'UNLOADED' as StopStatus,
          }),
        variant: 'default',
      };
      break;

    case 'LOADED':
    case 'UNLOADED':
      actionButton = {
        label: 'Mark Departed',
        icon: CheckCircle,
        action: () => markDeparted.mutate({ stopId: id, orderId }),
        variant: 'default',
      };
      break;

    case 'DEPARTED':
    case 'SKIPPED':
    default:
      actionButton = null;
  }

  if (!actionButton) {
    return null;
  }

  const Icon = actionButton.icon;
  const isLoading =
    markArrived.isPending || markDeparted.isPending || updateStatus.isPending;

  return (
    <Button
      variant={actionButton.variant}
      onClick={actionButton.action}
      disabled={isLoading}
      className="w-full sm:w-auto"
    >
      <Icon className="mr-2 h-4 w-4" />
      {isLoading ? 'Processing...' : actionButton.label}
    </Button>
  );
}
