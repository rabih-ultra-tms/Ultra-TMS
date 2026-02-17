'use client';

/**
 * Load Card
 *
 * Compact card displaying essential load information in Kanban view.
 * Supports drag-and-drop for status changes.
 * Shows load#, route, carrier, dates, equipment, margin, and priority indicators.
 */

import { useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { DispatchLoad, DispatchStop } from '@/lib/types/dispatch';
import { cn } from '@/lib/utils';
import {
  Container,
  Snowflake,
  RectangleHorizontal,
  Flame,
  AlertTriangle,
  Clock,
  ArrowRight,
  Calendar,
  TrendingUp,
  GripVertical,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';

interface LoadCardProps {
  load: DispatchLoad;
  isDragging?: boolean;
  isSelected?: boolean;
  onSelectionChange?: (loadId: number, selected: boolean) => void;
  selectionMode?: boolean;
}

/**
 * Get equipment icon based on type
 */
function getEquipmentIcon(type: string) {
  switch (type) {
    case 'REEFER':
      return <Snowflake className="h-4 w-4" />;
    case 'FLATBED':
    case 'STEP_DECK':
      return <RectangleHorizontal className="h-4 w-4" />;
    case 'DRY_VAN':
    default:
      return <Container className="h-4 w-4" />;
  }
}

/**
 * Calculate margin
 */
function calculateMargin(customerRate?: number, carrierRate?: number) {
  if (!customerRate || !carrierRate) return { amount: 0, percent: 0 };

  const amount = customerRate - carrierRate;
  const percent = (amount / customerRate) * 100;

  return { amount, percent };
}

/**
 * Get margin color class
 */
function getMarginColor(percent: number) {
  if (percent >= 15) return 'text-emerald-600';
  if (percent >= 5) return 'text-amber-600';
  return 'text-red-600';
}

/**
 * Format date for display
 */
function formatDate(dateString: string) {
  const date = new Date(dateString);
  const today = new Date().toDateString();
  const dateOnly = date.toDateString();

  if (dateOnly === today) {
    return { text: 'Today', isToday: true, isPast: false };
  }

  const isPast = date < new Date();

  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();

  return { text: `${month} ${day}`, isToday: false, isPast };
}

/**
 * Check if load is stale (no check call in 4+ hours for in-transit loads)
 */
function isStale(load: DispatchLoad): boolean {
  if (!['IN_TRANSIT', 'AT_PICKUP', 'PICKED_UP', 'AT_DELIVERY'].includes(load.status)) {
    return false;
  }

  if (!load.lastCheckCallAt) return true;

  const staleThreshold = 4 * 60 * 60 * 1000; // 4 hours
  const age = Date.now() - new Date(load.lastCheckCallAt).getTime();

  return age > staleThreshold;
}

/**
 * Check if load is aged (sitting in current status too long)
 */
function getLoadAge(load: DispatchLoad): { hours: number; variant: 'normal' | 'warning' | 'danger' } {
  const age = Date.now() - new Date(load.statusChangedAt).getTime();
  const hours = age / (60 * 60 * 1000);

  if (hours > 8) return { hours, variant: 'danger' };
  if (hours > 4) return { hours, variant: 'warning' };
  return { hours, variant: 'normal' };
}

/**
 * Render card content (reusable for both normal and dragging states)
 */
function renderCardContent({
  load,
  origin,
  destination,
  margin,
  pickupDate,
  deliveryDate,
  stale,
  lastUpdate,
  loadAge,
  showDragHandle = true,
  isSelected = false,
  onSelectionChange,
  selectionMode = false,
}: {
  load: DispatchLoad;
  origin: DispatchStop | undefined;
  destination: DispatchStop | undefined;
  margin: { amount: number; percent: number };
  pickupDate: { text: string; isToday: boolean; isPast: boolean } | null;
  deliveryDate: { text: string; isToday: boolean; isPast: boolean } | null;
  stale: boolean;
  lastUpdate: string;
  loadAge: { hours: number; variant: string };
  showDragHandle?: boolean;
  isSelected?: boolean;
  onSelectionChange?: (loadId: number, selected: boolean) => void;
  selectionMode?: boolean;
}) {
  return (
    <>
      {/* Row 1: Load Number + Equipment + Priority Indicators */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {/* Checkbox for selection mode */}
          {selectionMode && onSelectionChange && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => {
                onSelectionChange(load.id, checked === true);
              }}
              onClick={(e) => e.stopPropagation()}
              className="flex-shrink-0"
            />
          )}
          {showDragHandle && !selectionMode && (
            <GripVertical className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors flex-shrink-0" />
          )}
          <a
            href={`/operations/loads/${load.id}`}
            className="font-mono text-sm font-semibold text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {load.loadNumber}
          </a>
        </div>

        <div className="flex items-center gap-1">
          {/* Priority indicators */}
          {load.isHotLoad && (
            <span title="Hot Load">
              <Flame className="h-3.5 w-3.5 text-red-500" />
            </span>
          )}
          {load.hasExceptions && (
            <span title="Has Exceptions">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            </span>
          )}
          {stale && (
            <span title="Stale Check Call">
              <Clock className="h-3.5 w-3.5 text-orange-500" />
            </span>
          )}

          {/* Equipment icon */}
          <div className="text-muted-foreground" title={load.equipmentType}>
            {getEquipmentIcon(load.equipmentType)}
          </div>
        </div>
      </div>

      {/* Row 2: Route */}
      <div className="flex items-center gap-1.5 text-sm text-foreground">
        <span className="truncate max-w-[110px]" title={`${origin?.city}, ${origin?.state}`}>
          {origin?.city}, {origin?.state}
        </span>
        <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
        <span className="truncate max-w-[110px]" title={`${destination?.city}, ${destination?.state}`}>
          {destination?.city}, {destination?.state}
        </span>
      </div>

      {/* Row 3: Carrier + Driver */}
      <div className="flex items-center gap-1.5 text-sm">
        {load.carrier ? (
          <>
            <span className="truncate text-muted-foreground max-w-[140px]" title={load.carrier.name}>
              {load.carrier.name}
            </span>
            {load.driver && (
              <span className="text-xs text-muted-foreground/70">
                • {load.driver.firstName} {load.driver.lastName[0]}.
              </span>
            )}
          </>
        ) : (
          <span className="font-semibold text-red-600">UNASSIGNED</span>
        )}
      </div>

      {/* Row 4: Dates */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span className={cn(pickupDate?.isPast && 'text-red-600 font-semibold')}>
            Pickup: {pickupDate?.text || 'TBD'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span className={cn(deliveryDate?.isPast && 'text-red-600 font-semibold')}>
            Del: {deliveryDate?.text || 'TBD'}
          </span>
        </div>
      </div>

      {/* Row 5: Margin (if financial data available) */}
      {load.customerRate && load.carrierRate && (
        <div className="flex items-center gap-1.5 text-sm">
          <TrendingUp className="h-3.5 w-3.5" />
          <span className={cn('font-medium', getMarginColor(margin.percent))}>
            ${margin.amount.toLocaleString()} ({margin.percent.toFixed(0)}%)
          </span>
        </div>
      )}

      {/* Row 6: Footer - Customer + Last Update */}
      <div className="flex items-center justify-between text-xs text-muted-foreground/70 pt-1 border-t">
        <span className="truncate max-w-[140px]" title={load.customer.name}>
          {load.customer.name}
        </span>
        <span className={cn(loadAge.hours > 4 && 'text-orange-600 font-medium')}>
          {lastUpdate}
        </span>
      </div>
    </>
  );
}

export function LoadCard({
  load,
  isDragging = false,
  isSelected = false,
  onSelectionChange,
  selectionMode = false,
}: LoadCardProps) {
  // Sortable hook for drag-and-drop (disabled during selection mode)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: load.id.toString(),
    disabled: selectionMode, // Disable drag when in selection mode
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Get origin and destination
  const origin = load.stops.find((s) => s.type === 'PICKUP');
  const destination = load.stops.find((s) => s.type === 'DELIVERY');

  // Calculate margin
  const margin = useMemo(
    () => calculateMargin(load.customerRate, load.carrierRate),
    [load.customerRate, load.carrierRate]
  );

  // Format dates
  const pickupDate = origin ? formatDate(origin.appointmentDate) : null;
  const deliveryDate = destination ? formatDate(destination.appointmentDate) : null;

  // Check stale and aging
  const stale = isStale(load);
  const loadAge = getLoadAge(load);

  // Calculate time since last update
  const lastUpdate = formatDistanceToNow(new Date(load.updatedAt), { addSuffix: true });

  // Determine card background based on age
  const ageBackground =
    loadAge.variant === 'danger'
      ? 'bg-red-50'
      : loadAge.variant === 'warning'
        ? 'bg-orange-50'
        : 'bg-background';

  // For drag overlay, render without drag handlers
  if (isDragging) {
    return (
      <div
        className={cn(
          'relative rounded-lg border shadow-lg',
          ageBackground,
          stale && 'border-l-4 border-l-orange-500'
        )}
      >
        <div className="space-y-2 p-3">
          {/* Same card content as below but without drag handle */}
          {renderCardContent({
            load,
            origin,
            destination,
            margin,
            pickupDate,
            deliveryDate,
            stale,
            lastUpdate,
            loadAge,
            showDragHandle: false,
            isSelected,
            onSelectionChange,
            selectionMode,
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-lg border shadow-sm transition-all hover:shadow-md',
        selectionMode
          ? 'cursor-pointer'
          : 'cursor-grab active:cursor-grabbing',
        ageBackground,
        stale && 'border-l-4 border-l-orange-500',
        isSortableDragging && 'opacity-50',
        isSelected && 'ring-2 ring-primary ring-offset-2'
      )}
      {...attributes}
      onClick={(e) => {
        // In selection mode, clicking the card toggles selection
        if (selectionMode && onSelectionChange) {
          e.preventDefault();
          onSelectionChange(load.id, !isSelected);
        }
      }}
    >
      <div className="space-y-2 p-3" {...(!selectionMode ? listeners : {})}>
        {renderCardContent({
          load,
          origin,
          destination,
          margin,
          pickupDate,
          deliveryDate,
          stale,
          lastUpdate,
          loadAge,
          showDragHandle: true,
          isSelected,
          onSelectionChange,
          selectionMode,
        })}
      </div>
    </div>
  );
}
