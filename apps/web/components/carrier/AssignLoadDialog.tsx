'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { EmptyState, LoadingState, ErrorState } from '@/components/shared';
import { useAssignLoadToDriver, Driver } from '@/lib/hooks/carrier/use-drivers';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface Load {
  id: string;
  orderId: string;
  orderNumber: string;
  status: string;
  origin: string;
  destination: string;
  weight?: number;
  commodity?: string;
  rate?: number;
}

interface AssignLoadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver: Driver | null;
}

export function AssignLoadDialog({
  open,
  onOpenChange,
  driver,
}: AssignLoadDialogProps) {
  const [selectedLoadId, setSelectedLoadId] = React.useState<string>('');

  const {
    data: loads = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['available-loads', driver?.carrierId],
    queryFn: async () => {
      if (!driver?.carrierId) return [];
      const response = await apiClient.get<Load[]>(
        `/carrier-portal/loads?carrierId=${driver.carrierId}&status=AVAILABLE`
      );
      return response;
    },
    enabled: open && !!driver?.carrierId,
    staleTime: 10_000,
  });

  const assignLoadMutation = useAssignLoadToDriver();

  async function handleAssign() {
    if (!driver || !selectedLoadId) return;

    try {
      await assignLoadMutation.mutateAsync({
        driverId: driver.id,
        loadId: selectedLoadId,
      });
      onOpenChange(false);
      setSelectedLoadId('');
    } catch {
      // Error handled by mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Load to Driver</DialogTitle>
          <DialogDescription>
            {driver
              ? `Select a load to assign to ${driver.firstName} ${driver.lastName}`
              : 'Select a driver and load'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <LoadingState message="Loading available loads..." />
        ) : error ? (
          <ErrorState
            title="Failed to load loads"
            message={error instanceof Error ? error.message : 'Unknown error'}
          />
        ) : loads.length === 0 ? (
          <EmptyState
            title="No available loads"
            description="There are no available loads to assign at this time."
          />
        ) : (
          <ScrollArea className="h-[400px] border rounded-md p-4">
            <div className="space-y-4">
              {loads.map((load) => (
                <div
                  key={load.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedLoadId === load.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-transparent hover:bg-slate-50'
                  }`}
                  onClick={() =>
                    setSelectedLoadId(selectedLoadId === load.id ? '' : load.id)
                  }
                >
                  <Checkbox
                    checked={selectedLoadId === load.id}
                    onCheckedChange={() =>
                      setSelectedLoadId(
                        selectedLoadId === load.id ? '' : load.id
                      )
                    }
                  />
                  <div className="flex-1">
                    <div className="font-medium">{load.orderNumber}</div>
                    <div className="text-sm text-slate-600">
                      {load.origin} → {load.destination}
                    </div>
                    {load.commodity && (
                      <div className="text-sm text-slate-500">
                        Commodity: {load.commodity}
                      </div>
                    )}
                    {load.weight && (
                      <div className="text-sm text-slate-500">
                        Weight: {load.weight} lbs
                      </div>
                    )}
                    {load.rate && (
                      <div className="text-sm font-medium text-slate-700">
                        Rate: ${load.rate.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={assignLoadMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedLoadId || assignLoadMutation.isPending}
          >
            {assignLoadMutation.isPending ? 'Assigning...' : 'Assign Load'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
