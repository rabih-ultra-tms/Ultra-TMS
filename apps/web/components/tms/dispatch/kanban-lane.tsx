'use client';

/**
 * Kanban Lane
 *
 * Single status column with colored header and scrollable card container.
 * Acts as a droppable zone for drag-and-drop load status changes.
 */

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { LoadCard } from './load-card';
import type { DispatchLoad, SortConfig } from '@/lib/types/dispatch';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface KanbanLaneProps {
  lane: string;
  label: string;
  color: string;
  loads: DispatchLoad[];
  sortConfig?: SortConfig;
  onSortChange?: (config: SortConfig) => void;
  isOver?: boolean;
  isValidTarget?: boolean;
}

export function KanbanLane({
  lane,
  label,
  color,
  loads,
  isOver,
  isValidTarget,
}: KanbanLaneProps) {
  const { setNodeRef } = useDroppable({
    id: lane,
  });

  // Create array of load IDs for SortableContext
  const loadIds = loads.map((load) => load.id.toString());

  return (
    <div className="flex w-[320px] flex-shrink-0 flex-col rounded-lg bg-muted/30">
      {/* Lane Header */}
      <div
        className="flex items-center justify-between gap-2 rounded-t-lg border-b bg-background px-4 py-3"
        style={{ borderTopColor: color, borderTopWidth: '4px' }}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{label}</h3>
          <Badge variant="secondary" className="h-5 px-2 text-xs tabular-nums">
            {loads.length}
          </Badge>
        </div>
      </div>

      {/* Lane Body - Droppable zone with visual feedback */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 overflow-y-auto p-3 space-y-3 transition-colors',
          isOver && isValidTarget && 'bg-emerald-50 dark:bg-emerald-950/20',
          isOver && !isValidTarget && 'bg-red-50 dark:bg-red-950/20'
        )}
      >
        {loads.length === 0 ? (
          <div
            className={cn(
              'flex h-32 items-center justify-center rounded-lg border-2 border-dashed transition-colors',
              isOver && isValidTarget && 'border-emerald-400 bg-emerald-50/50',
              isOver && !isValidTarget && 'border-red-400 bg-red-50/50',
              !isOver && 'border-muted-foreground/20'
            )}
          >
            <p className="text-sm italic text-muted-foreground">
              {isOver
                ? isValidTarget
                  ? 'Drop here'
                  : 'Invalid drop'
                : 'No loads'}
            </p>
          </div>
        ) : (
          <SortableContext items={loadIds} strategy={verticalListSortingStrategy}>
            {loads.map((load) => (
              <LoadCard key={load.id} load={load} />
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  );
}
