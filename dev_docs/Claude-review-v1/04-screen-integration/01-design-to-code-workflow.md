# Design-to-Code Workflow

> How to turn a 15-section design spec into a production-ready screen in Ultra TMS.

---

## Overview

Every screen in Ultra TMS follows the same 15-section design spec format (defined in `dev_docs/12-Rabih-design-Process/00-global/04-screen-template.md`). This document provides a repeatable, step-by-step process for translating any design spec into working code. The process has been battle-tested on the 48 screens already built in the codebase and calibrated to the Ultra TMS stack: Next.js 16, React 19, Tailwind 4, shadcn/ui, React Query, Zustand, and React Hook Form + Zod.

---

## The 9-Step Workflow

### Step 1: Read All 15 Sections and Create Component Inventory (30-60 min)

**What to do:**
1. Open the design spec file (e.g., `04-tms-core/08-dispatch-board.md`).
2. Read every section end-to-end. Do not skip sections -- information in Section 11 (States & Edge Cases) will change how you architect Section 3 (Layout).
3. While reading, build a **Component Inventory Spreadsheet** with four columns:

| Component Name | Source Section | Exists in Codebase? | Notes |
|---|---|---|---|
| KanbanBoard | Section 3, 9 | No | @dnd-kit/core, virtual scroll |
| StatusBadge | Section 6, 9 | Yes - `components/ui/badge.tsx` | Need LOAD_STATUS variant |
| FilterBar | Section 12, 9 | Yes - `components/ui/filter-bar.tsx` | Need saved presets |
| LoadCard | Section 4, 9 | No | 13 fields, expandable |

4. Cross-reference Section 9 (Component Inventory) -- the spec author has already categorized components into "Existing to Reuse," "Needing Enhancement," and "New to Create."
5. Note every API endpoint from Section 10 and confirm they exist in the backend (`apps/api/src/modules/`).

**Deliverable:** A complete list of every component needed, tagged as `exists`, `enhance`, or `build`.

**Common mistake:** Skipping Section 11 (States & Edge Cases). This section specifies loading skeletons, empty states, error states, and permission-denied states. If you skip it, you will need to retrofit these later -- which always takes longer than building them in from the start.

---

### Step 2: Identify Existing vs New Components (15-30 min)

**What to do:**
1. For each component in your inventory, search the codebase:
   - `apps/web/components/ui/` -- shadcn primitives (34 installed)
   - `apps/web/components/shared/` -- shared components (confirm-dialog, empty-state, error-state, loading-state, data-table-skeleton)
   - `apps/web/components/{module}/` -- module-specific components (admin/, auth/, crm/, layout/, profile/, load-planner/, quotes/)
2. Reference `dev_docs/12-Rabih-design-Process/00-global/01-design-system-audit.md` for the full gap analysis of 121 design system components.
3. Categorize each component:

| Category | Action | Example |
|---|---|---|
| **Exists, use as-is** | Import and configure via props | `Badge`, `Card`, `Tabs`, `Dialog` |
| **Exists, needs enhancement** | Modify existing component to add new variant/feature | `FilterBar` needs saved presets, `Badge` needs load status colors |
| **Exists as pattern** | Copy the pattern and adapt for the new domain | `activity-timeline.tsx` pattern for LoadTimeline |
| **Missing, install from shadcn** | Run `npx shadcn@latest add <name>` | `context-menu`, `toggle-group`, `accordion` |
| **Missing, build from scratch** | Create new component file | `KanbanBoard`, `LoadCard`, `TrackingCard` |

**Deliverable:** Updated inventory with exact file paths for existing components and a build plan for new ones.

---

### Step 3: Build Missing Components in Isolation (1-5 days per component)

**What to do:**
1. Create each new component in the appropriate directory:
   - Shared/reusable: `apps/web/components/ui/` or `apps/web/components/shared/`
   - Module-specific: `apps/web/components/{module}/` (e.g., `components/tms/`)
2. Build each component with **no page-level dependencies**. Components should accept all data via props.
3. Follow the component contract pattern:

```typescript
// components/tms/load-card.tsx
interface LoadCardProps {
  load: LoadSummary;
  onStatusChange?: (loadId: string, newStatus: LoadStatus) => void;
  onAssignCarrier?: (loadId: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: (loadId: string) => void;
  showMargin?: boolean; // controlled by finance_view permission
}

export function LoadCard({
  load,
  onStatusChange,
  onAssignCarrier,
  isExpanded = false,
  onToggleExpand,
  showMargin = false,
}: LoadCardProps) {
  // Component implementation
}
```

4. Write a test for each component:
   - Renders without crashing
   - Displays all required fields from the spec's Section 4
   - Handles the empty/null cases from Section 11
   - Respects permission props (e.g., `showMargin` hides margin when false)

5. Build components in dependency order (see File 02: Component Build Order for the full sequence).

**Deliverable:** Each component renders correctly in isolation with all states (default, loading, empty, error, permission-denied).

**Time estimate:** Simple components (badges, indicators): 2-4 hours. Medium components (cards, forms, modals): 4-16 hours. Complex components (kanban boards, maps, timeline views): 16-40 hours.

---

### Step 4: Compose Components into Page Layout Following the Spec Wireframe (4-8 hours)

**What to do:**
1. Create the page file at the correct App Router path:
   - Route from spec header: e.g., `/(dashboard)/dispatch` maps to `apps/web/app/(dashboard)/dispatch/page.tsx`
2. Replicate the ASCII wireframe from Section 3 of the spec using Tailwind grid/flex:
   - Desktop layout first (1440px+), responsive adjustments come in Step 7.
   - Use the Information Hierarchy table to verify visual priority matches the spec.
3. Import all components from Step 3 and compose them into the layout.
4. Follow the existing carriers page (`apps/web/app/(dashboard)/carriers/page.tsx`) as the quality reference for structure:
   - `'use client'` directive at top
   - State management with `useState` for local UI state
   - React Query hooks for data fetching
   - Conditional rendering for loading/error/empty states
   - Mobile card view + desktop table view pattern

```typescript
// apps/web/app/(dashboard)/dispatch/page.tsx
'use client';

import { useState } from 'react';
import { KanbanBoard } from '@/components/tms/kanban-board';
import { LoadCard } from '@/components/tms/load-card';
import { FilterBar } from '@/components/ui/filter-bar';
import { KPIStrip } from '@/components/tms/kpi-strip';
import { useDispatchBoardLoads } from '@/lib/hooks/tms';

export default function DispatchBoardPage() {
  const [filters, setFilters] = useState<DispatchFilters>(DEFAULT_FILTERS);
  const { data, isLoading, error } = useDispatchBoardLoads(filters);

  if (error) return <DispatchBoardError onRetry={() => {}} />;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {/* KPI Strip */}
      {/* Main Content - Kanban/Timeline/Map */}
    </div>
  );
}
```

**Deliverable:** Page renders the correct layout with all components composed but not yet wired to real data.

---

### Step 5: Wire Up API Hooks and State Management (4-8 hours)

**What to do:**
1. Create React Query hooks for every endpoint listed in Section 10:

```typescript
// lib/hooks/tms/use-dispatch-board.ts
export function useDispatchBoardLoads(filters: DispatchFilters) {
  return useQuery({
    queryKey: ['dispatch-board', filters],
    queryFn: () => apiClient.get<LoadListResponse>('/api/v1/loads', { params: filters }),
    refetchInterval: 30_000, // polling fallback per Section 8
  });
}

export function useUpdateLoadStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ loadId, status }: { loadId: string; status: LoadStatus }) =>
      apiClient.patch(`/api/v1/loads/${loadId}/status`, { status }),
    onMutate: async ({ loadId, status }) => {
      // Optimistic update per Section 8
    },
    onError: (err, variables, context) => {
      // Rollback per Section 8
      toast.error('Failed to update status. Please try again.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['dispatch-board'] });
    },
  });
}
```

2. Wire hooks into the page component. Use the Section 10 error handling table to implement proper error responses for each status code (400, 401, 403, 404, 409, 500).
3. Implement WebSocket subscriptions from Section 8 if the screen is classified as "Enhanced Real-Time" or "Critical Real-Time":

```typescript
useEffect(() => {
  const socket = io('/dispatch', { auth: { token } });
  socket.on('load:status:changed', (payload) => {
    queryClient.setQueryData(['dispatch-board', filters], (old) => {
      // Move card between lanes
    });
  });
  return () => { socket.disconnect(); };
}, []);
```

4. Implement optimistic updates for every action listed in the Section 8 Optimistic Updates table.
5. Set up Zustand stores if the screen needs cross-component client state (e.g., selected card, active view mode, expanded card state).

**Deliverable:** Page loads real data from API, mutations work with optimistic updates, WebSocket events update the UI in real-time.

---

### Step 6: Add Loading, Error, and Empty States (2-4 hours)

**What to do:**
1. **Loading state:** Implement the exact skeleton layout described in Section 11. Use `Skeleton` from `components/ui/skeleton.tsx`. Match skeleton dimensions to actual content dimensions.

```typescript
if (isLoading) {
  return (
    <div className="space-y-4">
      {/* KPI strip skeleton: 8 skeleton boxes */}
      <div className="flex gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-16 flex-1 rounded-lg" />
        ))}
      </div>
      {/* Lane skeletons: 6 columns with 3-5 card skeletons each */}
      <div className="flex gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex-1 space-y-3">
            <Skeleton className="h-8 w-full" />
            {Array.from({ length: 3 + Math.floor(Math.random() * 3) }).map((_, j) => (
              <Skeleton key={j} className="h-36 w-full rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
```

2. **Empty states:** Implement both "first-time empty" and "filtered empty" from Section 11. Use the existing `EmptyState` component from `components/shared/empty-state.tsx`.
3. **Error states:** Implement full-page error and per-section error from Section 11. Use the existing `ErrorState` component from `components/shared/error-state.tsx`.
4. **Permission denied:** Implement the full-page denied and partial-denied behaviors from Section 11.
5. **Progressive loading:** Render toolbar and layout shell immediately; show skeletons only for data areas.

**Deliverable:** Every state from Section 11 is implemented and manually testable.

---

### Step 7: Implement Responsive Behavior (2-4 hours)

**What to do:**
1. Reference Section 13 (Responsive Design Notes) for exact breakpoint behaviors.
2. Implement each breakpoint using Tailwind responsive prefixes:

| Breakpoint | Tailwind Prefix | Width |
|---|---|---|
| Mobile | Default (no prefix) | < 768px |
| Tablet | `md:` | 768px - 1023px |
| Desktop | `lg:` | 1024px - 1439px |
| Desktop XL | `xl:` | 1440px+ |

3. Common responsive patterns in Ultra TMS (from carriers page reference):
   - **Table to cards:** `<div className="lg:hidden">` for mobile cards, `<div className="hidden lg:block">` for desktop table
   - **Sidebar collapse:** Handled by layout shell, not individual pages
   - **Filter collapse:** Filters visible on desktop, behind a "Filters" button on mobile
   - **KPI wrap:** `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6`
   - **Action buttons:** Full-width on mobile (`flex-1 sm:flex-initial`)

4. For Kanban/Board pages: implement the mobile-specific interaction replacements from Section 13 (e.g., drag-and-drop becomes "Change Status" button, right-click becomes long-press action sheet).

**Deliverable:** Screen works correctly at all four breakpoints with no overflow, truncation, or interaction issues.

---

### Step 8: Add Keyboard Shortcuts (1-2 hours)

**What to do:**
1. Reference Section 7 (Keyboard Shortcuts table) in the design spec.
2. Implement using a `useEffect` with `keydown` event listener:

```typescript
useEffect(() => {
  function handleKeyDown(e: KeyboardEvent) {
    // Ignore when typing in input/textarea
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;

    switch (e.key) {
      case 'n':
        if (!e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          router.push('/loads/new');
        }
        break;
      case '/':
        e.preventDefault();
        searchInputRef.current?.focus();
        break;
      case 'Escape':
        setSelectedCard(null);
        setExpandedCard(null);
        break;
    }
  }
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

3. Always check that shortcuts do not fire when the user is typing in a form field.
4. For `Ctrl/Cmd + K` (command palette), this is handled globally by the layout shell -- verify it works on your page.

**Deliverable:** All keyboard shortcuts from the spec work correctly and do not conflict with browser defaults.

---

### Step 9: Run Quality Gate Checklist (1-2 hours)

**What to do:** Before marking the screen as complete, verify every item:

#### Functional Quality

- [ ] Every button has an `onClick` handler that does something (no empty handlers, no TODO placeholders)
- [ ] Every link has a valid `href` (no `#` placeholders)
- [ ] Every API call has loading, success, and error handling
- [ ] Every form has validation with Zod schema matching the spec's required fields
- [ ] Optimistic updates work and roll back correctly on failure
- [ ] WebSocket events update the UI without full page refresh (if applicable)
- [ ] All filter state syncs to URL params (bookmarkable, shareable)
- [ ] Pagination works correctly (page size, total count, navigation)

#### Visual Quality

- [ ] Layout matches the ASCII wireframe in Section 3
- [ ] Status badge colors match the global status color system (`03-status-color-system.md`)
- [ ] Information hierarchy matches Section 3 priority table
- [ ] Loading skeletons match the exact dimensions described in Section 11
- [ ] Empty states match Section 11 (first-time empty, filtered empty)
- [ ] Error states match Section 11 (full-page error, per-section error, action error toasts)

#### Responsive Quality

- [ ] Desktop XL (1440px+): full layout as designed
- [ ] Desktop (1024-1439px): sidebar narrower, content adjusts
- [ ] Tablet (768-1023px): Section 13 tablet notes implemented
- [ ] Mobile (<768px): Section 13 mobile notes implemented

#### Permission Quality

- [ ] Role-based features from Section 5 (Conditional/Role-Based Features table) are implemented
- [ ] Financial data hidden for roles without `finance_view`
- [ ] Edit/delete actions hidden for unauthorized roles
- [ ] Full-page permission denied renders correctly

#### Code Quality

- [ ] No TypeScript `any` types
- [ ] No console.log statements
- [ ] All queries filtered by `tenantId` (multi-tenant safety)
- [ ] All queries check `deletedAt: null` (soft delete safety)
- [ ] Component files are under 500 lines (split if larger)

**Deliverable:** All checklist items pass. Screen is production-ready.

---

## Worked Example: Dispatch Board

Here is the workflow applied to the Dispatch Board spec (`04-tms-core/08-dispatch-board.md`), the most complex screen in Ultra TMS.

### Step 1 Result: Component Inventory

| Component | Source | Status | Complexity |
|---|---|---|---|
| `DispatchBoard` (container) | S3, S9 | Build | High |
| `KanbanBoard` | S3, S9 | Build | High |
| `KanbanLane` | S3, S9 | Build | Medium |
| `LoadCard` | S4, S9 | Build | Medium |
| `LoadCardExpanded` | S4, S9 | Build | Small |
| `LoadCardContextMenu` | S7, S9 | Build | Small |
| `CarrierAssignmentModal` | S7, S9 | Build | Medium |
| `DispatchConfirmationDialog` | S7, S9 | Build | Small |
| `TenderCountdown` | S4, S9 | Build | Small |
| `MiniMap` | S3, S9 | Build | Medium |
| `StatusBadge` | S6, S9 | Enhance | Small |
| `FilterBar` | S12, S9 | Enhance | Small |
| `PageHeader` | S3, S9 | Reuse | -- |
| `Badge` | S4, S9 | Reuse | -- |
| `Avatar` | S4, S9 | Reuse | -- |
| `Tooltip` | S4, S9 | Reuse | -- |
| `ContextMenu` (shadcn) | S7, S9 | Install | -- |
| `ToggleGroup` (shadcn) | S7, S9 | Install | -- |
| `ScrollArea` (shadcn) | S9 | Reuse | -- |

### Step 2 Result: Build Plan

1. Install shadcn: `npx shadcn@latest add context-menu toggle-group`
2. Install dnd-kit: `pnpm --filter web add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
3. Build order: TenderCountdown -> LoadCardExpanded -> LoadCard -> LoadCardContextMenu -> KanbanLane -> KanbanBoard -> CarrierAssignmentModal -> DispatchConfirmationDialog -> MiniMap -> DispatchBoard

### Step 4 Result: Page Layout

```
apps/web/app/(dashboard)/dispatch/page.tsx
  -> <DispatchToolbar />        (view toggle, filters, search, actions)
  -> <KPIStrip />               (8 stat cards, collapsible)
  -> <KanbanBoard />            (6 lanes, drag-drop)
     -> <KanbanLane /> x 6      (lane header + scrollable cards)
        -> <LoadCard /> x N     (individual load cards)
  -> <MiniMap />                (bottom-right overlay, toggleable)
```

### Step 5 Result: Hooks Created

| Hook | Endpoint | Purpose |
|---|---|---|
| `useDispatchBoardLoads(filters)` | GET /api/loads | Board data |
| `useDispatchBoardStats(dateRange)` | GET /api/loads/stats | KPI counts |
| `useUpdateLoadStatus()` | PATCH /api/loads/:id/status | Drag-drop transitions |
| `useAssignCarrier()` | POST /api/loads/:id/assign | Carrier assignment |
| `useDispatchLoad()` | POST /api/loads/:id/dispatch | Dispatch action |
| `useAvailableCarriers(filters)` | GET /api/carriers | Assignment modal |
| `useDispatchBoardUpdates()` | WebSocket /dispatch | Real-time events |

### Time Estimate for Dispatch Board

| Step | Estimated Time |
|---|---|
| 1. Read spec + inventory | 1 hour |
| 2. Identify existing vs new | 30 min |
| 3. Build 10 new components | 40-60 hours |
| 4. Compose page layout | 6 hours |
| 5. Wire API + WebSocket | 8 hours |
| 6. Loading/error/empty states | 3 hours |
| 7. Responsive behavior | 4 hours |
| 8. Keyboard shortcuts | 2 hours |
| 9. Quality gate | 2 hours |
| **Total** | **67-87 hours** (8-11 dev days) |

---

## Time Estimates by Screen Type

| Screen Type | Examples | Avg Hours | Range |
|---|---|---|---|
| **List Page** | Carriers, Loads List, Orders List | 20-30h | 16-40h |
| **Detail Page** | Load Detail, Carrier Detail | 30-50h | 24-60h |
| **Form Page** | Order Entry, Quote Builder | 30-50h | 24-64h |
| **Dashboard Page** | Operations Dashboard | 25-40h | 20-48h |
| **Board Page** | Dispatch Board | 60-90h | 48-100h |
| **Map Page** | Tracking Map | 40-60h | 32-72h |
| **Settings Page** | Admin Settings | 15-25h | 12-32h |

---

## Common Mistakes to Avoid

1. **Building the page before the components.** Always build and test components in isolation first. Debugging a broken component inside a complex page layout wastes hours.

2. **Ignoring Section 11.** Every screen has 5-8 distinct visual states. If you only build the "happy path" (data loads successfully), you will need a full rework when QA finds the empty state, error state, or permission-denied state.

3. **Hardcoding data instead of using hooks.** It is tempting to hardcode sample data to see the layout quickly. Use React Query hooks from the start -- even if the API returns errors. The error state is a deliverable.

4. **Forgetting optimistic updates.** Section 8 specifies which actions use optimistic updates. Implementing them later requires restructuring mutation hooks and adding rollback logic. Build them in from the start.

5. **Skipping URL sync for filters.** Section 12 specifies that filter state syncs to URL query params. This is not optional -- it enables bookmarking, sharing, and browser back/forward navigation. Use `useSearchParams` from Next.js.

6. **Not checking tenantId.** Every query must filter by `tenantId`. Forgetting this leaks data across tenants. The backend enforces this, but the frontend should also pass it in query keys to prevent cache collisions.

7. **Building mobile last.** While the design spec describes desktop first, responsive behavior should be implemented alongside the desktop layout, not as a separate phase. The carriers page pattern (`lg:hidden` / `hidden lg:block`) makes this straightforward.

8. **Not referencing the status color system.** Status badge colors are defined globally in `00-global/03-status-color-system.md`. Do not invent your own colors -- use the exact hex values and Tailwind classes from that file.
