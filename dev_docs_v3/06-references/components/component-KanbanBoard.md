# KanbanBoard

**File:** `apps/web/components/tms/dispatch/kanban-board.tsx`
**LOC:** 364

## Props Interface

```typescript
interface KanbanBoardProps {
  boardData: DispatchBoardData;
  sortConfig: SortConfig;
  onSortChange: (config: SortConfig) => void;
}
```

## Behavior

6-lane Kanban board for the dispatch view with full drag-and-drop support.

### Lanes

```typescript
const LANE_ORDER: KanbanLane[] = [
  'UNASSIGNED',
  'TENDERED',
  'DISPATCHED',
  'IN_TRANSIT',
  'DELIVERED',
  'COMPLETED',
];
```

Each lane renders a `KanbanLane` (106 LOC) containing `LoadCard` components (407 LOC each).

### Drag-and-Drop

Uses `@dnd-kit/core`:
- `DndContext` with `closestCorners` collision detection
- `PointerSensor` and `KeyboardSensor` for mouse/keyboard drag
- `DragOverlay` renders a floating `LoadCard` during drag
- Status transition validation via `isValidTransition()` -- prevents invalid status changes
- On successful drop: calls `useUpdateLoadStatus` mutation

### Bulk Actions

Integrates `DispatchBulkToolbar` (138 LOC) for multi-select operations when loads are selected via checkboxes.

### Auto-Email

On certain status transitions, automatically triggers email via `useAutoEmail`:
- Dispatched -> sends dispatch notification
- Rate confirmation emails

## Used By

- Dispatch board page (`/dispatch`) when in Kanban view mode

## Dependencies

- `@dnd-kit/core` (DndContext, DragOverlay, sensors)
- `@dnd-kit/sortable` (sortableKeyboardCoordinates)
- `@/lib/types/dispatch` (LANE_CONFIG, STATUS_TO_LANE, isValidTransition)
- `@/lib/hooks/tms/use-dispatch` (useUpdateLoadStatus, useBulkStatusUpdate)
- `@/lib/hooks/communication/use-auto-email` (useAutoEmail, dispatchLoadToEmailData)
- `sonner` (toast for success/error notifications)

## Accessibility

- `KeyboardSensor` with `sortableKeyboardCoordinates` for keyboard drag support
- Lane labels and load cards provide context

## Known Issues

None. Well-structured drag-and-drop implementation with proper validation.
