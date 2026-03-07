# TMS Layout Components

Components for page structure, grids, cards, and content organization.

---

## DashboardShell

**File:** `apps/web/components/layout/dashboard-shell.tsx`
**LOC:** 33

Root layout wrapper for all `(dashboard)/` routes.

### Structure

```
DashboardShell
  +-- SocketProvider       (WebSocket context for real-time features)
  +-- div.relative.isolate.min-h-screen.bg-background
       +-- AppSidebar      (fixed left, collapsible)
       +-- div.flex.flex-col (content column)
            +-- AppHeader  (sticky top bar)
            +-- main.flex-1.p-4.sm:p-6 (page content)
```

Content area padding-left transitions: `pl-16` (collapsed) or `pl-64` (expanded), reading from `useUIStore` Zustand store.

---

## PageHeader (v5)

**File:** `apps/web/components/tms/layout/page-header.tsx`
**LOC:** 69

48px horizontal bar with 3 slots: title (left), center content (centered, max-w-xs), actions (right). Surface background with bottom border. Auto-pushes actions right when no center content.

---

## StatsBar

**File:** `apps/web/components/tms/stats/stats-bar.tsx`
**LOC:** 28

40px horizontal bar for displaying inline stats. Renders StatItem children with border separators. Used between PageHeader and table content.

---

## InfoGrid

**File:** `apps/web/components/tms/cards/info-grid.tsx`
**LOC:** 70

Responsive grid of data cells. Each cell: rounded card with 9px uppercase label + 13px value + optional subtext. Supports 1/2/3 column layouts.

### Usage

```tsx
<InfoGrid
  columns={2}
  cells={[
    { key: "weight", label: "Weight", value: "42,000 lbs" },
    { key: "pieces", label: "Pieces", value: "24" },
    { key: "equipment", label: "Equipment", value: "53' Dry Van", subText: "Standard" },
    { key: "commodity", label: "Commodity", value: "Electronics" },
  ]}
/>
```

---

## FieldList

**File:** `apps/web/components/tms/cards/field-list.tsx`
**LOC:** 51

Vertical label/value list with border separators. Label left-aligned (11px muted), value right-aligned (11px medium).

### Usage

```tsx
<FieldList
  fields={[
    { key: "mc", label: "MC Number", value: "MC-123456" },
    { key: "dot", label: "DOT Number", value: "1234567" },
    { key: "status", label: "Status", value: <StatusBadge intent="success">Active</StatusBadge> },
  ]}
/>
```

---

## RouteCard

**File:** `apps/web/components/tms/cards/route-card.tsx`
**LOC:** 103

Origin-to-destination route visualization. Shows origin dot (sapphire), vertical connector line, destination dot (success), and summary text. Late dates highlighted in danger color.

---

## SlidePanel

**File:** `apps/web/components/tms/panels/slide-panel.tsx`
**LOC:** 179

Full-height right-side drawer with resizable width (380-560px, default 420px). Backdrop + slide animation + Escape key close. Contains header (title + badge + actions + close) and scrollable content area.

---

## FinancialSummaryCard

**File:** `apps/web/components/tms/shared/financial-summary-card.tsx`
**LOC:** 66

### Props

```typescript
interface FinancialSummaryCardProps {
  revenue: number;
  cost: number;
  margin: number;
  currency?: string;    // Default: "USD"
}
```

Card showing revenue, cost, and margin with auto-calculated margin percentage. Positive margins: green with TrendingUp. Negative margins: red with TrendingDown. Uses `Intl.NumberFormat` for currency formatting.

---

## MetadataCard

**File:** `apps/web/components/tms/shared/metadata-card.tsx`
**LOC:** 74

### Props

```typescript
interface MetadataCardProps {
  createdAt: string;
  updatedAt: string;
  createdByName?: string;
  externalId?: string;
  sourceSystem?: string;
}
```

Card showing entity metadata: creation date, last update, creator name, external ID, and source system. Uses `date-fns` `format(date, 'PPp')` for date display.

---

## Timeline

**File:** `apps/web/components/tms/timeline/timeline.tsx`
**LOC:** 114

### Props

```typescript
interface TimelineProps {
  events: TimelineEvent[];   // { key, state, time, description, label?, labelIntent? }
  className?: string;
}

type TimelineEventState = "completed" | "current" | "pending";
```

Vertical timeline with three dot states:
- **completed**: success green, solid fill
- **current**: sapphire blue, solid fill + pulse animation
- **pending**: border-soft gray, dashed border

Events show time (10px muted), description (12px, pending=italic+muted), and optional label pill with intent coloring.

---

## TimelineFeed

**File:** `apps/web/components/tms/shared/timeline-feed.tsx`
**LOC:** 56

### Props

```typescript
interface TimelineFeedProps {
  events: TimelineEvent[];     // { id, eventType, description, timestamp, userName? }
  emptyMessage?: string;
}
```

Card-based timeline for order/load events. Each event shows type, description, relative time (via `formatDistanceToNow`), and optional user attribution. Empty state shows Clock icon with message.

---

## Dispatch Detail Drawer

**File:** `apps/web/components/tms/dispatch/dispatch-detail-drawer.tsx`
**LOC:** 1,535

The largest single component. Full-featured slide-out panel for load management within the dispatch board. Contains:
- **Tabs view**: Overview, Carrier, Timeline, Finance, Documents
- **Edit view**: Inline quick-edit form
- **Tracking view**: Inline tracking + check calls

Key features: status progression (state machine), next-status button, copy load number, contact actions (call, email, message), link to full load detail page.
