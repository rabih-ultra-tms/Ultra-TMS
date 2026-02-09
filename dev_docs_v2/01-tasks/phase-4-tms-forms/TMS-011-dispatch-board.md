# TMS-011: Dispatch Board (Split into 5 Sub-Tasks)

> **Phase:** 4 | **Priority:** P0 | **Status:** NOT STARTED
> **Effort:** XL (40-60h total) ⬆️ was 12h
> **Assigned:** BOTH developers (split below)
> **Revised:** v2 — Logistics expert review ("12 hours is wildly optimistic. McLeod's dispatch board took 5 developers 6 months. Budget 40-60 hours minimum.")

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/04-tms-core.md` — TMS Core hub (dispatch, real-time)
3. `dev_docs/12-Rabih-design-Process/04-tms-core/08-dispatch-board.md` — Design spec
4. `apps/web/lib/socket/socket-provider.tsx` — WebSocket infrastructure (INFRA-001)

## Why This Is the Most Critical Screen

The dispatch board is THE most important screen in any TMS. Dispatchers spend 8-12 hours/day on this screen. It's the cockpit — without it, the plane doesn't fly. Every second counts here; a bad UI costs real money.

**Persona:** Maria (Dispatcher) — manages 50+ loads/day, needs speed + visibility + real-time.

## Sub-Task Breakdown

### TMS-011a: Data Layer (8-10h) — Codex/Gemini
**Scope:** React Query hooks, WebSocket subscriptions, state management

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/lib/hooks/tms/use-dispatch.ts` | React Query hooks: useDispatchLoads(filters), useUpdateLoadStatus() |
| CREATE | `apps/web/lib/hooks/tms/use-dispatch-ws.ts` | WebSocket hook: subscribe to load status changes, carrier assignments |
| CREATE | `apps/web/lib/types/dispatch.ts` | TypeScript types for dispatch board state |

**Acceptance criteria:**
- [ ] `useDispatchLoads()` fetches loads grouped by status from `GET /api/v1/loads/board`
- [ ] `useUpdateLoadStatus()` calls `PATCH /api/v1/loads/:id/status` with optimistic update
- [ ] WebSocket subscription receives real-time `load:status:changed` events
- [ ] State management handles concurrent updates from multiple dispatchers

---

### TMS-011b: Kanban UI (8-10h) — Claude Code
**Scope:** 6 status columns, card layout, filters, column badges

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/app/(dashboard)/operations/dispatch/page.tsx` | Dispatch board page |
| CREATE | `apps/web/components/tms/dispatch/dispatch-board.tsx` | Kanban container with 6 columns |
| CREATE | `apps/web/components/tms/dispatch/dispatch-lane.tsx` | Single status column with count badge |
| CREATE | `apps/web/components/tms/dispatch/dispatch-card.tsx` | Load card: load #, carrier, origin→dest, pickup time, equipment |
| CREATE | `apps/web/components/tms/dispatch/dispatch-filters.tsx` | Filters: date range, carrier, equipment, dispatcher |

**Acceptance criteria:**
- [ ] 6 columns: PENDING, TENDERED, ACCEPTED, DISPATCHED, IN_TRANSIT, DELIVERED
- [ ] Each card shows: load #, carrier name, origin → destination, pickup date/time, equipment type
- [ ] Column count badges (e.g., "IN_TRANSIT (12)")
- [ ] Color-coded urgency: red = late, yellow = at risk, green = on time
- [ ] Quick filters: date range, carrier, equipment type, assigned dispatcher
- [ ] Card click → navigates to `/operations/loads/:id` or opens side panel
- [ ] Loading skeleton for initial load
- [ ] Empty column state

---

### TMS-011c: Drag-Drop (12-16h) — Claude Code
**Scope:** dnd-kit integration, status validation, optimistic updates

| Action | Path | What |
|--------|------|------|
| MODIFY | `apps/web/components/tms/dispatch/dispatch-board.tsx` | Add DndContext, SortableContext |
| MODIFY | `apps/web/components/tms/dispatch/dispatch-lane.tsx` | Add droppable zone |
| MODIFY | `apps/web/components/tms/dispatch/dispatch-card.tsx` | Add useSortable/useDraggable |
| CREATE | `apps/web/lib/utils/dispatch-transitions.ts` | Valid status transition map + validation |

**Acceptance criteria:**
- [ ] Drag card from one lane to another → triggers status change API call
- [ ] Invalid transitions blocked (e.g., can't drag from PENDING to DELIVERED) with toast message
- [ ] Optimistic update: card moves immediately, reverts on API failure
- [ ] Drag animation smooth and performant
- [ ] Visual feedback: lane highlights on drag-over, card shows "moving" state
- [ ] Keyboard accessibility: can move cards with keyboard

---

### TMS-011d: Real-Time Sync (8-12h) — Codex/Gemini
**Scope:** WebSocket event handling, conflict resolution, multi-user updates

| Action | Path | What |
|--------|------|------|
| MODIFY | `apps/web/lib/hooks/tms/use-dispatch-ws.ts` | Handle incoming WS events, merge with local state |
| CREATE | `apps/web/lib/utils/dispatch-conflict-resolver.ts` | Handle concurrent edits (last-write-wins with notification) |

**Acceptance criteria:**
- [ ] When Dispatcher A moves a card, Dispatcher B sees it move instantly (< 1s)
- [ ] Conflict: if two dispatchers move the same card simultaneously, last write wins + both see toast notification
- [ ] Connection lost → reconnect with full state refresh
- [ ] Connection status indicator on dispatch board (green dot = connected, red = disconnected)
- [ ] Sound/visual alert for new loads entering PENDING column (optional, configurable)

---

### TMS-011e: Bulk Actions + Polish (4-6h) — Claude Code
**Scope:** Multi-select, bulk status change, performance optimization

| Action | Path | What |
|--------|------|------|
| MODIFY | `apps/web/components/tms/dispatch/dispatch-card.tsx` | Add checkbox for multi-select |
| CREATE | `apps/web/components/tms/dispatch/dispatch-bulk-toolbar.tsx` | Bulk action bar: change status, assign carrier |
| MODIFY | `apps/web/components/tms/dispatch/dispatch-board.tsx` | Virtualization for 100+ cards |

**Acceptance criteria:**
- [ ] Checkbox on cards → select multiple → bulk toolbar appears
- [ ] Bulk actions: change status, assign carrier (all selected loads)
- [ ] Performant with 100+ cards (virtualize if needed — measure first)
- [ ] Responsive: works on 1920px, 1440px, 1280px widths
- [ ] Keyboard shortcuts: Ctrl+A (select all in column), Escape (deselect)

## Dependencies

- Blocked by: INFRA-001 (WebSocket), TMS-003 (Loads list for data hooks)
- Blocks: TEST-001c (dispatch board testing)

## Reference

- Hub: `dev_docs_v2/03-services/04-tms-core.md` → Dispatch Board, Real-Time Requirements
- Design spec: `dev_docs/12-Rabih-design-Process/04-tms-core/08-dispatch-board.md`
- Backend: `GET /api/v1/loads/board`, `PATCH /api/v1/loads/:id/status`, `PATCH /api/v1/loads/:id/assign`
- WebSocket: `/dispatch` namespace, events: `load:status:changed`, `load:dispatched`
- Libraries: `@dnd-kit/core`, `@dnd-kit/sortable` for drag-drop
- Expert: Section 2.1 ("This alone kills the system"), Section 8 (#8, budget 40h not 12h)
