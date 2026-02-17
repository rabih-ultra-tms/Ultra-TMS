'use client';

/**
 * Dispatch Bulk Toolbar
 *
 * Floating toolbar that appears when loads are selected.
 * Provides bulk actions: status change, carrier assignment, etc.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Loader2, CheckCircle2 } from 'lucide-react';
import type { LoadStatus } from '@/lib/types/dispatch';
import { LANE_CONFIG } from '@/lib/types/dispatch';

interface DispatchBulkToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkStatusChange: (status: LoadStatus) => Promise<unknown>;
  onBulkCarrierAssign: () => void;
}

// Available status options for bulk change
const BULK_STATUS_OPTIONS: { value: LoadStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'TENDERED', label: 'Tendered' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'DISPATCHED', label: 'Dispatched' },
  { value: 'AT_PICKUP', label: 'At Pickup' },
  { value: 'PICKED_UP', label: 'Picked Up' },
  { value: 'IN_TRANSIT', label: 'In Transit' },
  { value: 'AT_DELIVERY', label: 'At Delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'COMPLETED', label: 'Completed' },
];

export function DispatchBulkToolbar({
  selectedCount,
  onClearSelection,
  onBulkStatusChange,
  onBulkCarrierAssign,
}: DispatchBulkToolbarProps) {
  const [selectedStatus, setSelectedStatus] = useState<LoadStatus | ''>('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async () => {
    if (!selectedStatus) return;

    setIsUpdating(true);
    try {
      await onBulkStatusChange(selectedStatus);
      setSelectedStatus('');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-primary text-primary-foreground rounded-lg shadow-2xl border border-primary-foreground/20">
        <div className="flex items-center gap-4 px-6 py-3">
          {/* Selection count */}
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-semibold">
              {selectedCount} {selectedCount === 1 ? 'load' : 'loads'} selected
            </span>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-primary-foreground/20" />

          {/* Bulk actions */}
          <div className="flex items-center gap-2">
            {/* Status change */}
            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as LoadStatus)}>
              <SelectTrigger className="w-[180px] bg-primary-foreground text-primary border-none">
                <SelectValue placeholder="Change status..." />
              </SelectTrigger>
              <SelectContent>
                {BULK_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              size="sm"
              variant="secondary"
              onClick={handleStatusChange}
              disabled={!selectedStatus || isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Apply'
              )}
            </Button>

            {/* Carrier assignment */}
            <Button
              size="sm"
              variant="secondary"
              onClick={onBulkCarrierAssign}
              disabled={isUpdating}
            >
              Assign Carrier
            </Button>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-primary-foreground/20" />

          {/* Clear selection */}
          <Button
            size="sm"
            variant="ghost"
            className="hover:bg-primary-foreground/20"
            onClick={onClearSelection}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
