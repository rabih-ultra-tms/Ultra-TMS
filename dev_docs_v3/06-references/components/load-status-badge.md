# LoadStatusBadge

**File:** `apps/web/components/tms/loads/load-status-badge.tsx`
**Lines:** 143
**Exports:** `LoadStatusBadge`

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| status | `LoadStatus` | Yes | - | Load status enum value |
| className | `string` | No | - | Additional CSS classes |
| variant | `"default" \| "dot-label"` | No | `"default"` | Display variant |

## Variants

### `default` -- Badge with icon
Renders a shadcn Badge with colored background, icon, and label text. Used in tables and detail headers.

### `dot-label` -- Minimal dot + text
Renders a small colored dot (8px circle) followed by label text. Used in list views for more compact display.

## Status Map (12 statuses)

| Status | Label | Icon | Background | Text Color | Dot Color |
|--------|-------|------|------------|------------|-----------|
| PLANNING | Planning | PenLine | slate-100 | slate-700 | slate-500 |
| PENDING | Pending | Clock | gray-100 | gray-700 | gray-500 |
| TENDERED | Tendered | SendHorizonal | violet-100 | violet-700 | violet-500 |
| ACCEPTED | Accepted | ThumbsUp | blue-100 | blue-700 | blue-500 |
| DISPATCHED | Dispatched | Send | indigo-100 | indigo-700 | indigo-500 |
| AT_PICKUP | At Pickup | MapPin | amber-100 | amber-800 | amber-600 |
| PICKED_UP | Picked Up | PackageOpen | cyan-100 | cyan-800 | cyan-600 |
| IN_TRANSIT | In Transit | Truck | sky-100 | sky-800 | sky-600 |
| AT_DELIVERY | At Delivery | MapPinCheck | teal-100 | teal-800 | teal-600 |
| DELIVERED | Delivered | PackageCheck | lime-100 | lime-800 | lime-600 |
| COMPLETED | Completed | CircleCheckBig | emerald-100 | emerald-800 | emerald-600 |
| CANCELLED | Cancelled | XCircle | red-100 | red-800 | red-600 |

## Usage Example

```tsx
import { LoadStatusBadge } from "@/components/tms/loads/load-status-badge";
import { LoadStatus } from "@/types/loads";

// Badge with icon (default)
<LoadStatusBadge status={LoadStatus.IN_TRANSIT} />

// Dot-label variant for lists
<LoadStatusBadge status={LoadStatus.DELIVERED} variant="dot-label" />
```

## Relationship to UnifiedStatusBadge

This component is **load-specific** and uses hardcoded Tailwind color classes. The `UnifiedStatusBadge` in `components/shared/status-badge.tsx` is the **entity-agnostic** alternative that uses the design token system.

- Use `LoadStatusBadge` when you need load-specific icons (Truck, MapPin, etc.)
- Use `UnifiedStatusBadge` when you need consistent cross-entity status display

## Dependencies

- `@/components/ui/badge` (Badge component)
- `@/lib/utils` (cn utility)
- `@/types/loads` (LoadStatus enum)
- `lucide-react` (12 icons)

## Quality Assessment

**Rating: 7/10**
- TypeScript: Uses LoadStatus enum for type safety
- Visual: Distinct colors for each status, proper icon mapping
- Fallback: Falls back to PLANNING config for unknown statuses
- Design tokens: Uses hardcoded Tailwind colors instead of design token variables
- Accessibility: Badge component has proper semantics, but icons lack `aria-hidden`
- Missing: No size variants, no animation for status transitions
