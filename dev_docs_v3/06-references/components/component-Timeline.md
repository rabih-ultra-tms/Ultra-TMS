# Timeline

**File:** `apps/web/components/tms/timeline/timeline.tsx`
**LOC:** 114

## Props Interface

```typescript
type TimelineEventState = "completed" | "current" | "pending";

interface TimelineEvent {
  key: string;
  state: TimelineEventState;
  time: string;                    // e.g. "Feb 5, 2:30 PM" or "Awaiting"
  description: string;
  label?: string;                  // e.g. "In Progress"
  labelIntent?: "primary" | "success" | "warning" | "danger";
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}
```

## Behavior

Vertical timeline with a continuous line and state-dependent dot markers:

- **completed**: Green (`bg-success`), solid fill
- **current**: Sapphire (`bg-primary`), solid fill + `animate-pulse-dot` animation
- **pending**: Gray (`bg-border-soft`), dashed border

### Event Layout

- Left margin: 20px for the timeline track
- Vertical line: absolute, 2px wide, `bg-border`
- Dot: 12px, positioned at left edge, 2px border matching surface
- Time: 10px, `text-text-muted`
- Description: 12px, `font-medium`, `text-text-primary` (pending events: `text-text-muted italic`)
- Label pill: 9px uppercase, colored by intent (primary/success/warning/danger)

### Label Intent Colors

```typescript
primary: "bg-primary-light text-primary"
success: "bg-success-bg text-success"
warning: "bg-warning-bg text-warning"
danger:  "bg-danger-bg text-danger"
```

## Used By

- Load detail timeline tab (`load-timeline-tab.tsx`)
- Check call timeline (`check-call-timeline.tsx`)
- Order timeline tab (`order-timeline-tab.tsx`)
- Tracking status timeline

## Accessibility

Events are rendered as plain divs. No interactive elements. The pulse animation on "current" events provides visual indication of the active step.

## Known Issues

None. Clean component matching v5 spec.
