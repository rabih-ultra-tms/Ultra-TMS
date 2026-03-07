# LoadCard (Dispatch)

**File:** `apps/web/components/tms/dispatch/load-card.tsx`
**LOC:** 407

## Props Interface

```typescript
interface LoadCardProps {
  load: DispatchLoad;
  isDragging?: boolean;
  isSelected?: boolean;
  onSelectionChange?: (loadId: number, selected: boolean) => void;
  selectionMode?: boolean;
}
```

## Behavior

Compact card for Kanban board view. Displays essential load information and supports drag-and-drop for status changes via `@dnd-kit/sortable`.

### Displayed Information

- Load number (bold, monospace)
- Route: origin city -> destination city (with arrow)
- Carrier name (if assigned)
- Pickup/delivery dates
- Equipment type icon (Reefer=Snowflake, Flatbed=Rectangle, DryVan=Container)
- Margin calculation (customer rate - carrier rate, shown as $ and %)
- Priority indicators (hazmat=Flame, urgent=AlertTriangle, time-sensitive=Clock)
- Selection checkbox (in selection mode)

### Drag-and-Drop

Uses `useSortable` from `@dnd-kit/sortable`:
- Generates `transform` and `transition` styles via `CSS.Transform.toString()`
- Shows `GripVertical` handle icon
- `isDragging` prop applies visual elevation/opacity changes

### Margin Calculation

```typescript
function calculateMargin(customerRate?: number, carrierRate?: number) {
  if (!customerRate || !carrierRate) return { amount: 0, percent: 0 };
  // Returns { amount, percent }
}
```

## Used By

- `apps/web/components/tms/dispatch/kanban-lane.tsx` (rendered in Kanban lanes)
- `apps/web/components/tms/dispatch/kanban-board.tsx` (DragOverlay)

## Accessibility

- Checkbox: uses shadcn Checkbox component
- Drag handle: `GripVertical` icon (visual cue for draggability)

## Known Issues

None identified. Well-structured component matching dispatch v5 design.
