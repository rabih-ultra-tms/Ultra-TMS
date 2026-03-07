# UX-016: Drag-and-Drop for Dispatch Board

**Priority:** P1
**Service:** TMS Core / Dispatch
**Scope:** Drag-and-drop interface for the dispatch board

## Current State
The dispatch board page exists but may not have drag-and-drop functionality. Dispatchers should be able to drag loads between status columns (Kanban style) and assign carriers by dragging.

## Requirements
- Kanban-style board with columns per load status
- Drag loads between status columns to change status
- Drag carriers onto loads to assign
- Visual feedback during drag (ghost element, drop zone highlight)
- Undo action after drop
- Mobile touch support

## Acceptance Criteria
- [ ] Loads displayed in status columns (Kanban)
- [ ] Drag load between columns updates status via API
- [ ] Visual drop zone feedback
- [ ] Undo button after status change
- [ ] Touch support for tablets
- [ ] Performance with 50+ loads

## Dependencies
- Dispatch board page must be built
- WebSocket for real-time updates (QS-001)

## Estimated Effort
L
