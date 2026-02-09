# Pattern Library Plan

> Seven reusable page patterns that cover 100% of Ultra TMS screens, with wireframes, required components, API patterns, and a carrier page refactor example.

---

## Overview

Every screen in Ultra TMS falls into one of seven page patterns. By standardizing these patterns, a developer can build any new screen in the system by selecting the correct pattern and filling in domain-specific details. This eliminates architectural decisions on a per-screen basis and ensures visual consistency across 362+ screens.

**Pattern distribution (from master screen catalog):**

| Pattern | Screen Type(s) | Count | % of Total |
|---------|---------------|-------|-----------|
| List Page | List | 134 | 37% |
| Detail Page | Detail | 34 | 9% |
| Form Page | Form, Wizard | 72 | 20% |
| Dashboard Page | Dashboard | 42 | 12% |
| Board Page | Board | 24 | 7% |
| Map Page | Map | 8 | 2% |
| Settings Page | Config, Search, Report, Calendar, Portal | 48 | 13% |

---

## Pattern 1: List Page

**Used by:** 134 screens (37% of total)
**Examples:** Orders List, Loads List, Carriers List, Quotes List, Invoices List, Users List

### Wireframe

```
+---------------------------------------------------------------------+
| PageHeader: [Title] [Subtitle]          [+ New Item] [Bulk v] [...]  |
+---------------------------------------------------------------------+
| Stats Bar (optional, collapsible)                                    |
| [Total: 247] [Active: 198] [Inactive: 32] [Pending: 17]             |
+---------------------------------------------------------------------+
| Filter Bar                                                           |
| [Search_________] [Status v] [Type v] [Date Range] [More v] [Clear] |
| [Saved: All | My Items | Active Only | Custom...]                   |
+---------------------------------------------------------------------+
| Data Table (desktop) / Card Grid (mobile)                            |
| [x] | Name       | Status   | Type    | Date     | Actions          |
| [x] | Item 1     | Active   | Type A  | Jan 15   | [...] v          |
| [ ] | Item 2     | Pending  | Type B  | Jan 14   | [...] v          |
| [ ] | Item 3     | Active   | Type A  | Jan 13   | [...] v          |
+---------------------------------------------------------------------+
| Pagination: [< Prev] Page 1 of 12 [Next >]  Showing 1-25 of 289    |
+---------------------------------------------------------------------+
```

### Required Components

| Component | Source | Purpose |
|-----------|--------|---------|
| PageHeader | `components/ui/PageHeader.tsx` (exists) | Title, subtitle, action buttons |
| KPICard / Statistic | Build (Sprint F1) | Stats bar metrics |
| FilterBar | Enhance (Phase 3) | Search, filters, saved presets |
| SearchInput | Build (Sprint F1) | Debounced search within filter bar |
| MultiSelect | Build (Sprint F2) | Multi-value filter dropdowns |
| DateRangePicker | Build (Sprint F2) | Date range filter |
| DataGrid | Build (Sprint T3) | Sortable, selectable, virtual-scroll table |
| StatusBadge | Depends on domain | Status display per row |
| DropdownMenu | `components/ui/dropdown-menu.tsx` (exists) | Per-row action menu |
| Pagination | `components/ui/pagination.tsx` (exists) | Page navigation |
| EmptyState | `components/shared/empty-state.tsx` (exists) | No results |
| DataTableSkeleton | `components/shared/data-table-skeleton.tsx` (exists) | Loading state |

### API Pattern

```typescript
// Hook pattern for all List pages
function useEntityList(filters: EntityFilters) {
  return useQuery({
    queryKey: ['entity-name', filters],
    queryFn: () => apiClient.get<PaginatedResponse<Entity>>('/api/v1/entities', {
      params: {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        status: filters.status,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        ...filters.additionalParams,
      },
    }),
  });
}

// Response shape (mandatory API format)
{
  data: Entity[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number,
  }
}
```

### State Management Pattern

```typescript
// URL-synced filters (bookmarkable, shareable)
const searchParams = useSearchParams();
const [filters, setFilters] = useState<EntityFilters>({
  page: Number(searchParams.get('page')) || 1,
  limit: Number(searchParams.get('limit')) || 25,
  search: searchParams.get('search') || '',
  status: searchParams.get('status') || 'all',
  sortBy: searchParams.get('sortBy') || 'createdAt',
  sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
});

// Selection state (local only, no URL sync)
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
```

### Mobile Behavior

Desktop table collapses to a card grid on mobile (`< 768px`). Each card shows the 3-4 most important fields with a "more" action button. The filter bar collapses behind a "Filters" button that opens a Drawer.

---

## Pattern 2: Detail Page

**Used by:** 34 screens (9% of total)
**Examples:** Load Detail, Order Detail, Carrier Detail, Customer Detail, Claim Detail

### Wireframe

```
+---------------------------------------------------------------------+
| Breadcrumb: [Service] > [List] > [Entity ID]                        |
+---------------------------------------------------------------------+
| Header Bar                                                           |
| [Entity ID]  [Status Badge]  [Assigned To]    [Actions v] [Edit]    |
+---------------------------------------------------------------------+
|                                                                      |
| +--------------+ +-----------------------------+ +----------------+  |
| | LEFT PANEL   | | CENTER PANEL                | | RIGHT PANEL    |  |
| | (25% width)  | | (50% width)                 | | (25% width)    |  |
| |              | |                             | |                |  |
| | Summary Card | | Tabbed Content              | | Contextual     |  |
| |              | | [Tab1] [Tab2] [Tab3] [Tab4] | | Info Card      |  |
| | Key: Value   | |                             | |                |  |
| | Key: Value   | | Active tab content          | | Map snippet    |  |
| | Key: Value   | | (scrollable)                | | or timeline    |  |
| | Key: Value   | |                             | | or related     |  |
| |              | |                             | | items          |  |
| +--------------+ +-----------------------------+ +----------------+  |
|                                                                      |
+---------------------------------------------------------------------+
```

### Required Components

| Component | Source | Purpose |
|-----------|--------|---------|
| Breadcrumb | Enhance (Phase 3) | Navigation trail |
| Panel | Build (Sprint F3) | Collapsible sections in each column |
| DescriptionList | Build (Sprint F3) | Key-value pairs in summary card |
| Tabs | `components/ui/tabs.tsx` (exists) | Center panel tab navigation |
| StatusBadge | Domain-specific (exists or build) | Status display in header |
| Accordion | shadcn install (Phase 0) | Collapsible sections within tabs |
| Resizable | shadcn install (Phase 0) | Column width adjustment |
| DataGrid | Build (Sprint T3) | Tables within tabs (related items) |
| LoadTimeline or ActivityTimeline | Build (Sprint T1) or exists | Timeline in right panel or tab |
| DropdownMenu | Exists | Actions dropdown in header |

### API Pattern

```typescript
// Single entity fetch
function useEntity(id: string) {
  return useQuery({
    queryKey: ['entity-name', id],
    queryFn: () => apiClient.get<EntityResponse>(`/api/v1/entities/${id}`),
    enabled: !!id,
  });
}

// Related data (loaded per-tab, lazy)
function useEntityRelated(id: string, relation: string) {
  return useQuery({
    queryKey: ['entity-name', id, relation],
    queryFn: () => apiClient.get<RelatedResponse>(`/api/v1/entities/${id}/${relation}`),
    enabled: !!id, // Only fetch when tab is active
  });
}

// Response shape
{ data: Entity, message?: string }
```

### Layout Variants

| Variant | When to Use | Examples |
|---------|------------|---------|
| **3-column** | High-density screens with map/tracker | Load Detail, Order Detail |
| **2-column** (left + center) | Standard detail without contextual panel | Customer Detail, Contact Detail |
| **2-column** (center + right) | Detail with related items sidebar | Carrier Detail, Claim Detail |
| **Single column** | Mobile, or simple detail pages | All detail pages at < 1024px |

### Mobile Behavior

All columns stack vertically. Summary card becomes a collapsible header. Tabs remain horizontal but scrollable. Right panel moves to bottom or becomes a collapsible section.

---

## Pattern 3: Form Page

**Used by:** 72 screens (20% of total) -- includes both simple forms and multi-step wizards
**Examples:** Order Entry, Quote Builder, Carrier Onboarding, User Editor, Settings Forms

### Wireframe -- Simple Form

```
+---------------------------------------------------------------------+
| Breadcrumb: [Service] > [List] > [New / Edit Entity]                |
+---------------------------------------------------------------------+
|                                                                      |
| +-------------------------------------------+ +-------------------+ |
| | FORM AREA (70% width)                     | | PREVIEW PANEL     | |
| |                                           | | (30% width)       | |
| | Section Header: "Basic Information"       | |                   | |
| | [Label] [Input______________]             | | Live preview      | |
| | [Label] [Input______________]             | | of form data      | |
| | [Label] [Select___________ v]             | | as user types     | |
| |                                           | |                   | |
| | Section Header: "Details"                 | | Summary:          | |
| | [Label] [Textarea__________]             | | Key: Value        | |
| | [Label] [DatePicker________]             | | Key: Value        | |
| |                                           | |                   | |
| +-------------------------------------------+ +-------------------+ |
|                                                                      |
+---------------------------------------------------------------------+
| Footer: [Cancel]                     [Save as Draft] [Save & Submit] |
+---------------------------------------------------------------------+
```

### Wireframe -- Multi-Step Wizard

```
+---------------------------------------------------------------------+
| Breadcrumb: [Service] > [List] > [New Entity]                       |
+---------------------------------------------------------------------+
| Stepper: [1. Info] --> [2. Details] --> [3. Config] --> [4. Review]  |
+---------------------------------------------------------------------+
|                                                                      |
| +-------------------------------------------+ +-------------------+ |
| | STEP FORM AREA (70% width)               | | ORDER SUMMARY     | |
| |                                           | | (30% width)       | |
| | Step-specific form fields                 | | Accumulates data  | |
| | organized in 2-column grid               | | from completed    | |
| |                                           | | steps             | |
| +-------------------------------------------+ +-------------------+ |
|                                                                      |
+---------------------------------------------------------------------+
| Footer: [Cancel] [Back]            [Save Draft] [Next / Submit]      |
+---------------------------------------------------------------------+
```

### Required Components

| Component | Source | Purpose |
|-----------|--------|---------|
| Form / FormField | `components/ui/form.tsx` (exists) | React Hook Form integration |
| Stepper | Build (Sprint F3) | Wizard step navigation |
| DatePicker | Build (Sprint F2) | Date fields |
| TimePicker | Build (Sprint F2) | Time fields |
| CurrencyInput | Build (Sprint F2) | Money fields |
| MultiSelect | Build (Sprint F2) | Multi-value selectors |
| CustomerSelector | Build (Sprint T2) | Customer search-and-pick |
| EquipmentSelector | Build (Sprint T2) | Equipment type picker |
| AddressAutocomplete | `components/ui/address-autocomplete.tsx` (exists) | Location fields |
| Panel | Build (Sprint F3) | Form sections |

### API Pattern

```typescript
// Form submission (create)
function useCreateEntity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEntityDto) =>
      apiClient.post<EntityResponse>('/api/v1/entities', data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['entity-list'] });
      toast.success(`${result.data.name} created successfully`);
      router.push(`/entities/${result.data.id}`);
    },
    onError: (error: ApiError) => {
      if (error.code === 'DUPLICATE') {
        // Show duplicate warning modal
      } else {
        toast.error(error.message);
      }
    },
  });
}

// Form validation (Zod schema)
const createEntitySchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  status: z.enum(['DRAFT', 'CONFIRMED']),
  // ... all fields from spec Section 4
});

type CreateEntityFormValues = z.infer<typeof createEntitySchema>;
```

### Wizard State Pattern

```typescript
// Multi-step wizard: use React Hook Form with per-step validation
const form = useForm<OrderEntryFormValues>({
  resolver: zodResolver(orderEntrySchema),
  defaultValues: getDefaultValues(searchParams), // handles clone/convert
  mode: 'onChange', // validate on change for real-time preview
});

const [currentStep, setCurrentStep] = useState(0);

// Per-step field groups for validation
const STEP_FIELDS: Record<number, (keyof OrderEntryFormValues)[]> = {
  0: ['customerId', 'customerRef', 'poNumber'],
  1: ['commodityType', 'weight', 'equipmentType'],
  2: ['stops'],
  3: ['customerRate', 'accessorials'],
  4: [], // review step, no new fields
};

async function handleNext() {
  const fieldsToValidate = STEP_FIELDS[currentStep];
  const isValid = await form.trigger(fieldsToValidate);
  if (isValid) setCurrentStep((prev) => prev + 1);
}
```

### Mobile Behavior

Form area becomes full-width. Preview panel moves below the form or becomes a collapsible summary. Wizard stepper becomes a compact progress indicator. Footer buttons stack on very small screens.

---

## Pattern 4: Dashboard Page

**Used by:** 42 screens (12% of total)
**Examples:** Operations Dashboard, Sales Dashboard, CRM Dashboard, Carrier Dashboard, Accounting Dashboard

### Wireframe

```
+---------------------------------------------------------------------+
| PageHeader: [Dashboard Title]              [Date Range v] [Refresh]  |
+---------------------------------------------------------------------+
|                                                                      |
| KPI Row (6 cards, responsive grid)                                   |
| +--------+ +--------+ +--------+ +--------+ +--------+ +--------+   |
| | Metric | | Metric | | Metric | | Metric | | Metric | | Metric |   |
| | 247    | | 34     | | 94.2%  | | $1.2M  | | 18.3%  | | 7      |   |
| | +12 ^  | | +5 ^   | | -1.2 v | | +15% ^ | | +0.3 ^ | | -2 v   |   |
| | ~~~~~~ | | ~~~~~~ | | ~~~~~~ | | ~~~~~~ | | ~~~~~~ | | ~~~~~~ |   |
| +--------+ +--------+ +--------+ +--------+ +--------+ +--------+   |
|                                                                      |
| +-------------------------------+ +-------------------------------+  |
| | Chart 1 (50% width)          | | Chart 2 / Alert List (50%)    |  |
| | [Bar/Line/Area chart]        | | [List of items or chart]      |  |
| |                              | |                               |  |
| |                              | |                               |  |
| +-------------------------------+ +-------------------------------+  |
|                                                                      |
| +-------------------------------+ +-------------------------------+  |
| | Activity Feed / Mini Table   | | Needs Attention / Quick       |  |
| | (50% width)                  | | Actions (50% width)           |  |
| |                              | |                               |  |
| +-------------------------------+ +-------------------------------+  |
+---------------------------------------------------------------------+
```

### Required Components

| Component | Source | Purpose |
|-----------|--------|---------|
| KPICard | Build (Sprint F1) | Metric cards with trend indicator and sparkline |
| Chart | Build (Sprint T3) | Bar, line, area, pie charts |
| Grid | Build (Sprint F3) | Responsive grid layout for card arrangement |
| DataGrid | Build (Sprint T3) | Mini tables (activity feed, alerts list) |
| DateRangePicker | Build (Sprint F2) | Period selector |
| LoadStatusBadge | Build (Sprint F1) | Status in activity feed items |
| Banner | Build (Sprint F3) | Critical alerts banner |

### API Pattern

```typescript
// Dashboard data: multiple parallel queries
function useDashboardData(dateRange: DateRange) {
  const kpis = useQuery({
    queryKey: ['dashboard-kpis', dateRange],
    queryFn: () => apiClient.get('/api/v1/dashboard/kpis', { params: dateRange }),
    refetchInterval: 120_000, // 2 minutes for critical metrics
  });

  const charts = useQuery({
    queryKey: ['dashboard-charts', dateRange],
    queryFn: () => apiClient.get('/api/v1/dashboard/charts', { params: dateRange }),
    refetchInterval: 300_000, // 5 minutes for chart data
  });

  const alerts = useQuery({
    queryKey: ['dashboard-alerts'],
    queryFn: () => apiClient.get('/api/v1/dashboard/alerts'),
    refetchInterval: 60_000, // 1 minute for alerts
  });

  return { kpis, charts, alerts };
}
```

### Mobile Behavior

KPI row wraps to 2 columns on mobile (3 rows of 2). Charts stack vertically at full width. Activity feed and quick actions stack below charts.

---

## Pattern 5: Board Page

**Used by:** 24 screens (7% of total)
**Examples:** Dispatch Board, Load Board, Bank Reconciliation, Leads Pipeline, Org Chart

### Wireframe

```
+---------------------------------------------------------------------+
| Toolbar: [View Toggle] [Date v] [Filters...] [Search___] [+ New]    |
| [Saved: Preset1 | Preset2 | Preset3]                                |
+---------------------------------------------------------------------+
| KPI Strip (optional, collapsible)                                    |
| [Count1: 12] [Count2: 8] [Count3: 23] [Count4: 45] [Count5: 7]     |
+---------------------------------------------------------------------+
|                                                                      |
| Board Content (full viewport height, scrollable)                     |
| +----------+ +----------+ +----------+ +----------+ +----------+    |
| | LANE 1   | | LANE 2   | | LANE 3   | | LANE 4   | | LANE 5   |   |
| | (count)  | | (count)  | | (count)  | | (count)  | | (count)  |   |
| |----------| |----------| |----------| |----------| |----------|   |
| | [Card]   | | [Card]   | | [Card]   | | [Card]   | | [Card]   |   |
| | [Card]   | | [Card]   | | [Card]   | | [Card]   | | [Card]   |   |
| | [Card]   | |          | | [Card]   | | [Card]   | |          |   |
| | [Card]   | |          | |          | | [Card]   | |          |   |
| |  ...     | |          | |          | |  ...     | |          |   |
| +----------+ +----------+ +----------+ +----------+ +----------+    |
|                                                                      |
+---------------------------------------------------------------------+
```

### Required Components

| Component | Source | Purpose |
|-----------|--------|---------|
| KanbanBoard | Build (Sprint T4) | Drag-and-drop board container |
| KanbanLane | Build (Sprint T4) | Individual lane column |
| LoadCard (or domain card) | Build (Sprint T1) | Draggable card within lane |
| FilterBar | Enhance (Phase 3) | Filter controls |
| KPICard | Build (Sprint F1) | KPI strip metrics |
| ToggleGroup | shadcn install (Phase 0) | View mode toggle |
| ContextMenu | shadcn install (Phase 0) | Right-click card actions |
| @dnd-kit | npm install | Drag-and-drop library |

### API Pattern

```typescript
// Board data: grouped by lane
function useBoardData(filters: BoardFilters) {
  return useQuery({
    queryKey: ['board', filters],
    queryFn: () => apiClient.get<BoardResponse>('/api/v1/loads', {
      params: { ...filters, groupBy: 'status' },
    }),
    refetchInterval: 30_000, // frequent polling for real-time feel
  });
}

// Drag-drop mutation with optimistic update
function useMoveCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, targetLane }: MovePayload) =>
      apiClient.patch(`/api/v1/loads/${cardId}/status`, { status: targetLane }),
    onMutate: async ({ cardId, targetLane }) => {
      await queryClient.cancelQueries({ queryKey: ['board'] });
      const previous = queryClient.getQueryData(['board']);
      // Optimistically move card between lanes
      queryClient.setQueryData(['board'], (old: BoardData) => moveCard(old, cardId, targetLane));
      return { previous };
    },
    onError: (err, vars, context) => {
      queryClient.setQueryData(['board'], context?.previous);
      toast.error('Failed to update status');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['board'] });
    },
  });
}
```

### Mobile Behavior

Lanes stack vertically as collapsible sections (not side-by-side). Drag-and-drop is replaced by a "Change Status" button on each card that opens a select menu. Cards show condensed information (3-4 fields instead of 8-10).

---

## Pattern 6: Map Page

**Used by:** 8 screens (2% of total)
**Examples:** Tracking Map, Vehicle Locations, Location History, Track Shipment (portal)

### Wireframe

```
+---------------------------------------------------------------------+
| Toolbar (overlay, semi-transparent)                                  |
| [Search___] [Status v] [Equipment v] [Layers v] [Refresh] [Kiosk]  |
+---------------------------------------------------------------------+
|                                                                      |
|       +------------------------------------------------------+       |
|       |                                                      |       |
|       |           FULL-VIEWPORT MAP                          |       |
|       |                                                      |       |
|       |    [Marker]         [Marker]                         |       |
|       |                                     [Cluster(5)]     |       |
|       |        [Marker]                                      |       |
|       |                          [Marker]                    |       |
|       |                                                      |       |
|       +------------------------------------------------------+       |
|                                                                      |
| +--SIDE PANEL (slides in from right, 400px)---+                      |
| | Load Header: LD-2025-0847 [IN_TRANSIT]      |                      |
| | Carrier: Swift Transport                     |                      |
| | ETA: Jan 17, 2:30 PM (14h 22m remaining)    |                      |
| | Last Update: 5 min ago                       |                      |
| | [Stop Timeline mini view]                   |                      |
| | [Add Check Call] [View Detail] [Contact]    |                      |
| +---------------------------------------------+                      |
|                                                                      |
| Timeline Strip (bottom, collapsible)                                 |
| [--P1--]----[--D1--]----[--P2--]----[--D2--]  Today's stops         |
+---------------------------------------------------------------------+
```

### Required Components

| Component | Source | Purpose |
|-----------|--------|---------|
| TrackingMapContainer | Build (Sprint T4) | Map renderer (Google Maps or Mapbox) |
| LoadCard (condensed) | Build (Sprint T1) | Side panel load summary |
| StopTimeline (mini) | Build (Sprint T1) | Side panel stop progress |
| FilterBar | Enhance (Phase 3) | Map overlay filters |
| ToggleGroup | shadcn install (Phase 0) | Layer toggles |
| Sheet | `components/ui/sheet.tsx` (exists) | Slide-in side panel |
| LoadStatusBadge | Build (Sprint F1) | Marker color coding |

### API Pattern

```typescript
// Map data: all active loads with GPS positions
function useMapData(filters: MapFilters) {
  return useQuery({
    queryKey: ['map-data', filters],
    queryFn: () => apiClient.get<MapLoadResponse>('/api/v1/loads/map', {
      params: {
        status: ['DISPATCHED', 'IN_TRANSIT', 'AT_PICKUP', 'AT_DELIVERY'],
        ...filters,
      },
    }),
    refetchInterval: 60_000, // GPS update interval
  });
}

// WebSocket for real-time position updates
useEffect(() => {
  const socket = io('/tracking', { auth: { token } });
  socket.on('load:position:updated', (payload: { loadId: string; lat: number; lng: number }) => {
    queryClient.setQueryData(['map-data', filters], (old: MapData) =>
      updateMarkerPosition(old, payload)
    );
  });
  return () => { socket.disconnect(); };
}, []);
```

### Mobile Behavior

Full-screen map with compact floating toolbar. Side panel becomes a bottom sheet (half-height, draggable to full). Timeline strip hidden on mobile. Filter toggles accessible via a floating action button.

---

## Pattern 7: Settings Page

**Used by:** 48 screens (13% of total) -- covers Config, Report, Calendar, Search, and Portal types
**Examples:** Tenant Settings, Company Settings, Feature Flags, Custom Fields, Business Rules

### Wireframe

```
+---------------------------------------------------------------------+
| PageHeader: [Settings Section Title]                                 |
+---------------------------------------------------------------------+
|                                                                      |
| +--SIDEBAR NAV (20%)--+ +--CONTENT AREA (80%)-----------------------+
| |                      | |                                          |
| | [General]            | | Section: General Settings                 |
| | [Notifications]*     | |                                          |
| | [Security]           | | Card 1: Company Information              |
| | [Integrations]       | | [Label] [Input______________]            |
| | [Billing]            | | [Label] [Input______________]            |
| | [API Keys]           | | [Label] [Select___________ v]            |
| | [Custom Fields]      | |                         [Save Changes]   |
| | [Business Rules]     | |                                          |
| |                      | | Card 2: Localization                     |
| | (* = current)        | | [Label] [Select___________ v]            |
| |                      | | [Label] [Select___________ v]            |
| |                      | |                         [Save Changes]   |
| |                      | |                                          |
| +----------------------+ +------------------------------------------+
```

### Required Components

| Component | Source | Purpose |
|-----------|--------|---------|
| Sidebar Nav (vertical) | `components/layout/sidebar-nav.tsx` (exists) | Section navigation |
| Card | `components/ui/card.tsx` (exists) | Settings group container |
| Form / FormField | `components/ui/form.tsx` (exists) | Settings inputs |
| Switch | `components/ui/switch.tsx` (exists) | Toggle settings |
| Select | `components/ui/select.tsx` (exists) | Dropdown settings |
| Input | `components/ui/input.tsx` (exists) | Text settings |
| Panel | Build (Sprint F3) | Collapsible sections |
| Tabs | `components/ui/tabs.tsx` (exists) | Alternative to sidebar nav |

### API Pattern

```typescript
// Settings: fetch current values
function useSettings(section: string) {
  return useQuery({
    queryKey: ['settings', section],
    queryFn: () => apiClient.get<SettingsResponse>(`/api/v1/settings/${section}`),
  });
}

// Settings: save changes (per-card, not whole page)
function useUpdateSettings(section: string) {
  return useMutation({
    mutationFn: (data: Partial<Settings>) =>
      apiClient.patch(`/api/v1/settings/${section}`, data),
    onSuccess: () => {
      toast.success('Settings saved');
      queryClient.invalidateQueries({ queryKey: ['settings', section] });
    },
  });
}
```

### Mobile Behavior

Sidebar nav moves to top as horizontal scrollable tabs. Content becomes full-width. Cards stack vertically. Each card independently scrollable.

---

## Carrier Page Refactor Example

The current `apps/web/app/(dashboard)/carriers/page.tsx` (859 lines) is a good working screen but does not follow the List Page pattern cleanly. Here is how it would be refactored to match Pattern 1.

### Current Structure (Before)

```
carriers/page.tsx (859 lines, single file)
  - Inline STATUS_COLORS, TYPE_COLORS, STATUS_LABELS, TYPE_LABELS constants
  - 6+ useState hooks for filter state
  - Inline carrier stats display
  - Inline filter inputs
  - Inline table rendering (desktop)
  - Inline card rendering (mobile)
  - Inline pagination
  - Inline create dialog
  - Inline delete/update logic
```

**Problems:**
1. 859 lines in a single file -- far above the 500-line guideline
2. No URL sync for filters -- state resets on page refresh
3. Inline table rendering is not reusable -- cannot share table logic with other List pages
4. Status colors defined locally instead of referencing the global status color system
5. No FilterBar component -- filter UI is tightly coupled to the page
6. No DataGrid -- manual table construction duplicated across pages
7. Create dialog inline instead of extracted as a component

### Refactored Structure (After)

```
carriers/
  page.tsx (150-200 lines)
    - Imports and composes all sub-components
    - URL-synced filter state via useSearchParams
    - Renders: StatsBar -> FilterBar -> DataGrid -> Pagination

components/carriers/
  carrier-stats-bar.tsx (60 lines)
    - Uses KPICard component, receives stats via props
  carrier-filters.tsx (80 lines) -- ENHANCED version
    - Uses shared FilterBar pattern with carrier-specific filter fields
    - Saved filter presets
  carrier-columns.tsx (100 lines) -- ENHANCED version
    - Column definitions for DataGrid, includes render functions for status badges
  carrier-create-dialog.tsx (120 lines)
    - Extracted from page, standalone dialog component
  carrier-status-badge.tsx (30 lines)
    - References global status color system, not local constants

lib/hooks/carriers/
  use-carriers.ts (exists, no change)
  use-carrier-stats.ts (exists, no change)
```

### Key Changes

**1. Extract filter state to URL params:**

```typescript
// BEFORE (carriers/page.tsx)
const [typeFilter, setTypeFilter] = useState<CarrierType | 'all'>('all');
const [statusFilter, setStatusFilter] = useState<CarrierStatus | 'all'>('all');
const [searchQuery, setSearchQuery] = useState('');
const [page, setPage] = useState(1);

// AFTER (carriers/page.tsx)
const searchParams = useSearchParams();
const router = useRouter();

const filters = useMemo(() => ({
  type: (searchParams.get('type') as CarrierType) || 'all',
  status: (searchParams.get('status') as CarrierStatus) || 'all',
  search: searchParams.get('search') || '',
  page: Number(searchParams.get('page')) || 1,
  limit: 25,
}), [searchParams]);

function updateFilters(updates: Partial<typeof filters>) {
  const params = new URLSearchParams(searchParams);
  Object.entries(updates).forEach(([key, value]) => {
    if (value && value !== 'all') params.set(key, String(value));
    else params.delete(key);
  });
  router.push(`?${params.toString()}`);
}
```

**2. Replace inline table with DataGrid:**

```typescript
// BEFORE: 150+ lines of inline Table/TableBody/TableRow/TableCell
<Table>
  <TableHeader>
    <TableRow>
      <TableHead><Checkbox .../></TableHead>
      <TableHead>Name</TableHead>
      ...
    </TableRow>
  </TableHeader>
  <TableBody>
    {carriers.map((carrier) => (
      <TableRow key={carrier.id}>
        <TableCell><Checkbox .../></TableCell>
        <TableCell>{carrier.name}</TableCell>
        ...
      </TableRow>
    ))}
  </TableBody>
</Table>

// AFTER: 5 lines using DataGrid + column definitions
<DataGrid
  data={carriers}
  columns={carrierColumns}
  pagination={data?.pagination}
  selectedIds={selectedIds}
  onSelectionChange={setSelectedIds}
  onRowClick={(carrier) => router.push(`/carriers/${carrier.id}`)}
  isLoading={isLoading}
  emptyState={<EmptyState title="No carriers found" />}
/>
```

**3. Replace inline status colors with global system:**

```typescript
// BEFORE: local constants in page.tsx
const STATUS_COLORS: Record<CarrierStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
  ...
};

// AFTER: reference global status color system
import { getStatusColor } from '@/lib/status-colors';
// getStatusColor('carrier', 'ACTIVE') returns the correct Tailwind classes
// sourced from dev_docs/12-Rabih-design-Process/00-global/03-status-color-system.md
```

**Result:** Page drops from 859 lines to ~180 lines. All extracted components are reusable by other List pages. Filter state survives page refresh. Table logic is shared via DataGrid.

---

## Pattern Selection Guide

When starting a new screen, use this decision tree:

```
Is the primary purpose to display a list of items?
  YES --> Pattern 1: List Page

Is the primary purpose to show all details of one item?
  YES --> Pattern 2: Detail Page

Is the primary purpose to create or edit data?
  YES --> Is it multi-step?
    YES --> Pattern 3: Form Page (Wizard variant)
    NO  --> Pattern 3: Form Page (Simple variant)

Is the primary purpose to show KPIs and charts?
  YES --> Pattern 4: Dashboard Page

Is the primary purpose a visual workspace (kanban, pipeline, calculator)?
  YES --> Pattern 5: Board Page

Is the primary purpose geographic visualization?
  YES --> Pattern 6: Map Page

Is the primary purpose configuration or settings?
  YES --> Pattern 7: Settings Page
```

Every screen in the master catalog maps to exactly one pattern. If a screen seems to need two patterns (e.g., a list with a detail panel), use the primary pattern and embed the secondary as a sub-component (e.g., List Page with a slide-in Sheet for quick detail view).
