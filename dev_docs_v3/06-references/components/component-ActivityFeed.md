# OpsActivityFeed

**File:** `apps/web/components/tms/dashboard/ops-activity-feed.tsx`
**LOC:** 132

## Props Interface

```typescript
interface OpsActivityFeedProps {
  period?: Period;          // "today" | "thisWeek" | "thisMonth"
  maxVisible?: number;      // Default: 10
  onViewAll?: () => void;   // Callback for "View full activity log" link
}
```

## Behavior

Live activity feed for the operations dashboard. Displays recent actions (load created, status changed, order updated) with timestamps and clickable entity links.

### Data Fetching

Uses `useDashboardActivity(period)` hook (React Query) to fetch activities. Returns `{ data, isLoading, error, refetch }`.

### Activity Item Display

Each activity shows:
- **Timestamp**: Formatted contextually (today: "2:30 PM", yesterday: "Yesterday 2:30 PM", older: "Mar 5, 2:30 PM")
- **User name**: Bold, primary color
- **Action**: Description text (e.g., "updated status of")
- **Entity link**: Monospace, blue, clickable -- navigates to load or order detail

### Entity Navigation

```typescript
if (activity.entityType === 'load') router.push(`/operations/loads/${activity.entityId}`);
if (activity.entityType === 'order') router.push(`/operations/orders/${activity.entityId}`);
```

### States

- **Loading**: 5 skeleton rows
- **Error**: Red error card with retry button
- **Empty**: Centered message "No activity yet. Create your first order to get started."
- **Overflow**: "View full activity log" link when `activities.length > maxVisible`

## Used By

- Operations dashboard page (`/operations`)

## Dependencies

- `@/lib/hooks/tms/use-ops-dashboard` (useDashboardActivity, Period, ActivityItem types)
- `@/components/ui/skeleton`
- `date-fns` (format, isToday, isYesterday, parseISO)
- `next/navigation` (useRouter)

## Known Issues

None identified.
