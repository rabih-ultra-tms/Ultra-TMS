# LoadStatusBadge

**File:** `apps/web/components/tms/loads/load-status-badge.tsx`
**LOC:** 143

## Props Interface

```typescript
interface LoadStatusBadgeProps {
  status: LoadStatus;
  className?: string;
  variant?: "default" | "dot-label";
}
```

## Behavior

Maps all 12 `LoadStatus` enum values to visual configurations (label, icon, colors):

| Status | Label | Icon | Background | Text |
|--------|-------|------|------------|------|
| PLANNING | Planning | PenLine | slate-100 | slate-700 |
| PENDING | Pending | Clock | gray-100 | gray-700 |
| TENDERED | Tendered | SendHorizonal | violet-100 | violet-700 |
| ACCEPTED | Accepted | ThumbsUp | blue-100 | blue-700 |
| DISPATCHED | Dispatched | Send | indigo-100 | indigo-700 |
| AT_PICKUP | At Pickup | MapPin | amber-100 | amber-800 |
| PICKED_UP | Picked Up | PackageOpen | cyan-100 | cyan-800 |
| IN_TRANSIT | In Transit | Truck | sky-100 | sky-800 |
| AT_DELIVERY | At Delivery | MapPinCheck | teal-100 | teal-800 |
| DELIVERED | Delivered | PackageCheck | lime-100 | lime-800 |
| COMPLETED | Completed | CircleCheckBig | emerald-100 | emerald-800 |
| CANCELLED | Cancelled | XCircle | red-100 | red-800 |

### Variants

- `default` -- Badge with icon + label, colored background, no border
- `dot-label` -- Small colored dot + plain text label (for list views)

## Used By

- Load detail pages
- Dispatch board (data table and kanban cards)
- Load list pages
- Order detail (load tabs)

## Accessibility

Uses shadcn `Badge` component with `variant="outline"` as base.

## Known Issues

Uses hardcoded Tailwind color classes (e.g., `bg-slate-100`) instead of the design token system (`bg-status-*-bg`). This is inconsistent with the TMS primitives `StatusBadge` which uses semantic tokens. Consider migrating to token-based colors for consistency.
