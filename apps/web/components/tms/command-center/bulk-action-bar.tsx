'use client';

/**
 * BulkActionBar — Floating action bar for bulk dispatch operations.
 *
 * Appears when loads are selected in the dispatch board. Offers:
 *   - Assign Carrier (opens carrier picker)
 *   - Dispatch Selected (sends all to DISPATCHED)
 *   - Update Status (dropdown)
 *   - Clear Selection
 *
 * MP-05-013: Bulk dispatch actions
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  useBulkDispatchCommand,
  type BulkDispatchAction,
  type BulkDispatchResponse,
} from '@/lib/hooks/command-center/use-command-center';
import {
  Truck,
  Send,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface CarrierOption {
  id: string;
  legalName: string;
  mcNumber: string | null;
  activeLoadCount: number;
}

interface BulkActionBarProps {
  selectedIds: Set<number>;
  onClearSelection: () => void;
  carriers?: CarrierOption[];
  carriersLoading?: boolean;
}

const LOAD_STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PLANNING', label: 'Planning' },
  { value: 'TENDERED', label: 'Tendered' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'DISPATCHED', label: 'Dispatched' },
  { value: 'AT_PICKUP', label: 'At Pickup' },
  { value: 'PICKED_UP', label: 'Picked Up' },
  { value: 'IN_TRANSIT', label: 'In Transit' },
  { value: 'AT_DELIVERY', label: 'At Delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'COMPLETED', label: 'Completed' },
] as const;

function showResultToast(response: BulkDispatchResponse) {
  if (response.failed === 0) {
    toast.success(`${response.succeeded} load(s) updated successfully`);
  } else if (response.succeeded === 0) {
    toast.error(`All ${response.failed} operations failed`, {
      description: response.results
        .filter((r) => !r.success)
        .map((r) => `${r.loadNumber}: ${r.error}`)
        .join('; '),
    });
  } else {
    toast.warning(
      `${response.succeeded} succeeded, ${response.failed} failed`,
      {
        description: response.results
          .filter((r) => !r.success)
          .map((r) => `${r.loadNumber}: ${r.error}`)
          .join('; '),
      }
    );
  }
}

export function BulkActionBar({
  selectedIds,
  onClearSelection,
  carriers = [],
  carriersLoading = false,
}: BulkActionBarProps) {
  const bulkDispatch = useBulkDispatchCommand();
  const [carrierPickerOpen, setCarrierPickerOpen] = useState(false);
  const [statusPickerOpen, setStatusPickerOpen] = useState(false);
  const [carrierSearch, setCarrierSearch] = useState('');

  const count = selectedIds.size;
  if (count === 0) return null;

  const loadIds = Array.from(selectedIds).map(String);

  const handleAction = async (
    action: BulkDispatchAction,
    extra?: { carrierId?: string; targetStatus?: string }
  ) => {
    try {
      const response = await bulkDispatch.mutateAsync({
        loadIds,
        action,
        ...extra,
      });
      showResultToast(response);
      if (response.succeeded > 0) {
        onClearSelection();
      }
    } catch {
      toast.error('Bulk operation failed');
    }
  };

  const filteredCarriers = carriers.filter(
    (c) =>
      c.legalName.toLowerCase().includes(carrierSearch.toLowerCase()) ||
      (c.mcNumber && c.mcNumber.includes(carrierSearch))
  );

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-xl border bg-background/95 px-4 py-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80">
        {/* Selection count */}
        <div className="flex items-center gap-2 border-r pr-3">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            {count} load{count !== 1 ? 's' : ''} selected
          </span>
        </div>

        {/* Assign Carrier */}
        <Popover open={carrierPickerOpen} onOpenChange={setCarrierPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={bulkDispatch.isPending}
            >
              <Truck className="mr-1.5 h-3.5 w-3.5" />
              Assign Carrier
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0" align="center" side="top">
            <div className="p-3 border-b">
              <input
                type="text"
                placeholder="Search carriers..."
                className="w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={carrierSearch}
                onChange={(e) => setCarrierSearch(e.target.value)}
              />
            </div>
            <div className="max-h-52 overflow-y-auto p-1">
              {carriersLoading ? (
                <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading carriers...
                </div>
              ) : filteredCarriers.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  No carriers found
                </div>
              ) : (
                filteredCarriers.map((carrier) => (
                  <button
                    key={carrier.id}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-accent"
                    onClick={() => {
                      setCarrierPickerOpen(false);
                      setCarrierSearch('');
                      handleAction('ASSIGN_CARRIER', {
                        carrierId: carrier.id,
                      });
                    }}
                  >
                    <div className="text-left">
                      <div className="font-medium">{carrier.legalName}</div>
                      {carrier.mcNumber && (
                        <div className="text-xs text-muted-foreground">
                          MC# {carrier.mcNumber}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {carrier.activeLoadCount} active
                    </span>
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Dispatch Selected */}
        <Button
          variant="default"
          size="sm"
          disabled={bulkDispatch.isPending}
          onClick={() => handleAction('DISPATCH')}
        >
          {bulkDispatch.isPending ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="mr-1.5 h-3.5 w-3.5" />
          )}
          Dispatch
        </Button>

        {/* Update Status */}
        <Popover open={statusPickerOpen} onOpenChange={setStatusPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={bulkDispatch.isPending}
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Status
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-1" align="center" side="top">
            {LOAD_STATUSES.map((status) => (
              <button
                key={status.value}
                className="flex w-full items-center rounded-md px-3 py-2 text-sm hover:bg-accent"
                onClick={() => {
                  setStatusPickerOpen(false);
                  handleAction('UPDATE_STATUS', {
                    targetStatus: status.value,
                  });
                }}
              >
                {status.label}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        {/* Error indicator */}
        {bulkDispatch.isError && (
          <AlertCircle className="h-4 w-4 text-destructive" />
        )}

        {/* Clear selection */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="ml-1"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
