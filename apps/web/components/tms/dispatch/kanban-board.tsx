'use client';

/**
 * Kanban Board Layout
 *
 * Renders 6 vertical lanes for load status columns with drag-and-drop.
 * Each lane contains load cards grouped by status.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanLane } from './kanban-lane';
import { LoadCard } from './load-card';
import { DispatchBulkToolbar } from './dispatch-bulk-toolbar';
import type {
  DispatchBoardData,
  DispatchLoad,
  KanbanLane as LaneType,
  LoadStatus,
  SortConfig,
} from '@/lib/types/dispatch';
import { LANE_CONFIG, STATUS_TO_LANE, isValidTransition } from '@/lib/types/dispatch';
import { useUpdateLoadStatus, useBulkStatusUpdate } from '@/lib/hooks/tms/use-dispatch';
import { useAutoEmail, dispatchLoadToEmailData } from '@/lib/hooks/communication/use-auto-email';
import { toast } from 'sonner';

interface KanbanBoardProps {
  boardData: DispatchBoardData;
  sortConfig: SortConfig;
  onSortChange: (config: SortConfig) => void;
}

// Define lane order for display
const LANE_ORDER: LaneType[] = [
  'UNASSIGNED',
  'TENDERED',
  'DISPATCHED',
  'IN_TRANSIT',
  'DELIVERED',
  'COMPLETED',
];

/**
 * Get the first valid status for a target lane
 */
function getTargetStatus(currentStatus: LoadStatus, targetLane: LaneType): LoadStatus | null {
  const laneStatuses = LANE_CONFIG[targetLane].statuses;

  // Try to find a valid forward transition to any status in the target lane
  for (const targetStatus of laneStatuses) {
    const transition = isValidTransition(currentStatus, targetStatus);
    if (transition.valid && !transition.requiresPermission) {
      return targetStatus;
    }
  }

  return null;
}

export function KanbanBoard({ boardData, sortConfig, onSortChange }: KanbanBoardProps) {
  const [activeLoad, setActiveLoad] = useState<DispatchLoad | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [selectedLoadIds, setSelectedLoadIds] = useState<Set<number>>(new Set());
  const updateLoadStatus = useUpdateLoadStatus();
  const bulkStatusUpdate = useBulkStatusUpdate();
  const { triggerEmail } = useAutoEmail();

  // Selection mode is active when any loads are selected
  const selectionMode = selectedLoadIds.size > 0;

  /**
   * Handle selection change for a single load
   */
  const handleSelectionChange = useCallback((loadId: number, selected: boolean) => {
    setSelectedLoadIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(loadId);
      } else {
        next.delete(loadId);
      }
      return next;
    });
  }, []);

  /**
   * Clear all selections
   */
  const handleClearSelection = useCallback(() => {
    setSelectedLoadIds(new Set());
  }, []);

  /**
   * Select all loads in a specific lane
   */
  const handleSelectAllInLane = useCallback((laneKey: LaneType) => {
    const loadsInLane = boardData.loadsByLane[laneKey] || [];
    setSelectedLoadIds((prev) => {
      const next = new Set(prev);
      loadsInLane.forEach((load) => next.add(load.id));
      return next;
    });
  }, [boardData.loadsByLane]);

  /**
   * Handle bulk status change
   */
  const handleBulkStatusChange = useCallback(
    async (newStatus: LoadStatus) => {
      const loadIds = Array.from(selectedLoadIds);

      return bulkStatusUpdate.mutateAsync(
        { loadIds, newStatus },
        {
          onSuccess: (result) => {
            if (result && result.failed > 0) {
              toast.warning('Partial update', {
                description: `Updated ${result.updated} load(s), ${result.failed} failed`,
              });
            } else {
              toast.success('Bulk update successful', {
                description: `Updated ${result?.updated ?? loadIds.length} load(s) to ${newStatus}`,
              });
            }
            handleClearSelection();
          },
          onError: (error) => {
            toast.error('Bulk update failed', {
              description: error instanceof Error ? error.message : 'Some loads could not be updated',
            });
          },
        }
      );
    },
    [selectedLoadIds, bulkStatusUpdate, handleClearSelection]
  );

  /**
   * Handle bulk carrier assignment (placeholder)
   */
  const handleBulkCarrierAssign = useCallback(() => {
    toast.info('Carrier assignment', {
      description: 'Bulk carrier assignment coming soon',
    });
  }, []);

  /**
   * Keyboard shortcuts — use refs to avoid re-registering on every selection change
   */
  const selectedLoadIdsRef = useRef(selectedLoadIds);
  useEffect(() => { selectedLoadIdsRef.current = selectedLoadIds; }, [selectedLoadIds]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedLoadIdsRef.current.size > 0) {
        handleClearSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClearSelection]);

  // Configure sensors for drag-and-drop (disabled during selection mode)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /**
   * Handle drag start - store the dragged load (disabled during selection mode)
   */
  function handleDragStart(event: DragStartEvent) {
    if (selectionMode) return;

    const { active } = event;
    const load = boardData.loads.find((l) => l.id.toString() === active.id);
    if (load) {
      setActiveLoad(load);
    }
  }

  /**
   * Handle drag over - track which lane we're hovering over
   */
  function handleDragOver(event: DragOverEvent) {
    const { over } = event;
    setOverId(over?.id?.toString() || null);
  }

  /**
   * Handle drag end - perform status update
   */
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    setActiveLoad(null);
    setOverId(null);

    if (!over) return;

    // Validate that the drop target is a lane, not another load card
    const targetId = over.id.toString();
    if (!(targetId in LANE_CONFIG)) return;

    const loadId = parseInt(active.id.toString());
    const targetLane = targetId as LaneType;
    const load = boardData.loads.find((l) => l.id === loadId);

    if (!load) return;

    const currentLane = STATUS_TO_LANE[load.status];

    // Same lane - no action needed
    if (currentLane === targetLane) return;

    // Determine target status
    const targetStatus = getTargetStatus(load.status, targetLane);

    if (!targetStatus) {
      toast.error('Invalid status transition', {
        description: `Cannot move load from ${currentLane} to ${targetLane}`,
      });
      return;
    }

    // Check transition validity
    const transition = isValidTransition(load.status, targetStatus);

    if (!transition.valid) {
      toast.error('Invalid status transition', {
        description: `Cannot move load from ${load.status} to ${targetStatus}`,
      });
      return;
    }

    if (transition.requiresPermission) {
      toast.error('Permission required', {
        description: `Only managers can revert load status. Permission required: ${transition.requiresPermission}`,
      });
      return;
    }

    // Perform optimistic status update
    updateLoadStatus.mutate(
      { loadId: load.id, newStatus: targetStatus },
      {
        onSuccess: () => {
          toast.success('Load status updated', {
            description: `${load.loadNumber} moved to ${LANE_CONFIG[targetLane].label}`,
          });

          // Auto-trigger emails on status transitions
          const emailData = dispatchLoadToEmailData(load);
          if (targetStatus === 'DISPATCHED') {
            triggerEmail('rate_confirmation', emailData, {
              attachments: [
                { name: `Rate-Con-${load.loadNumber}.pdf`, url: `/loads/${load.id}/rate-confirmation`, mimeType: 'application/pdf' },
              ],
            });
          } else if (targetStatus === 'TENDERED') {
            triggerEmail('load_tendered', emailData);
          }
        },
        onError: (error) => {
          toast.error('Failed to update load status', {
            description: error instanceof Error ? error.message : 'Please try again',
          });
        },
      }
    );
  }

  /**
   * Check if lane is a valid drop target for active load
   */
  function isValidDropTarget(laneKey: LaneType): boolean {
    if (!activeLoad) return false;

    const currentLane = STATUS_TO_LANE[activeLoad.status];
    if (currentLane === laneKey) return false;

    const targetStatus = getTargetStatus(activeLoad.status, laneKey);
    if (!targetStatus) return false;

    const transition = isValidTransition(activeLoad.status, targetStatus);
    return transition.valid && !transition.requiresPermission;
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-full gap-4 overflow-x-auto p-6 bg-muted/10">
          {LANE_ORDER.map((laneKey) => {
            const laneConfig = LANE_CONFIG[laneKey];
            const loads = boardData.loadsByLane[laneKey] || [];
            const isOver = overId === laneKey;
            const isValidTarget = isValidDropTarget(laneKey);

            return (
              <KanbanLane
                key={laneKey}
                lane={laneKey}
                label={laneConfig.label}
                color={laneConfig.color}
                loads={loads}
                sortConfig={sortConfig}
                onSortChange={onSortChange}
                isOver={isOver}
                isValidTarget={isValidTarget}
                selectedLoadIds={selectedLoadIds}
                onSelectionChange={handleSelectionChange}
                selectionMode={selectionMode}
              />
            );
          })}
        </div>

        {/* Drag overlay - shows the card being dragged */}
        <DragOverlay>
          {activeLoad ? (
            <div className="rotate-2 opacity-90">
              <LoadCard load={activeLoad} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Bulk toolbar - appears when loads are selected */}
      {selectionMode && (
        <DispatchBulkToolbar
          selectedCount={selectedLoadIds.size}
          onClearSelection={handleClearSelection}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkCarrierAssign={handleBulkCarrierAssign}
        />
      )}
    </>
  );
}
