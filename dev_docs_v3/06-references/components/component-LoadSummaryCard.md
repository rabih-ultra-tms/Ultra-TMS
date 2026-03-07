# LoadSummaryCard

**File:** `apps/web/components/tms/loads/load-summary-card.tsx`
**LOC:** 116

## Props Interface

```typescript
interface LoadSummaryCardProps {
  load: Load;
}
```

## Behavior

Sidebar card displaying a load's essential information:

### Route Visual

Vertical route display with:
- Origin: Blue circle (border-4 border-blue-500) + city/state + "Origin" label
- Dashed connector line (border-l-2 border-dashed)
- Destination: Green circle (border-4 border-green-500) + city/state + "Destination" label

### Dates Section

- Pickup date/time (formatted via `toLocaleString()`)
- Delivery date/time
- Calendar icon for each

### Details Section

- Equipment type (default: "Dry Van")
- Miles
- Weight (formatted with `toLocaleString()`)
- Commodity (default: "General Freight", truncated at 120px)

### Order & Customer Links

- Order number: monospace, blue link to `/operations/orders/{id}`
- Customer name: blue link to `/crm/customers/{id}`

## Used By

- Load detail pages (sidebar summary)

## Dependencies

- `@/components/ui/` (Card, Separator)
- `@/types/loads` (Load type)
- Lucide icons (Calendar, Truck, Scale, Box, Info)
- `next/link` (navigation links)

## Known Issues

Uses `toLocaleString()` for date formatting instead of `date-fns`. This creates inconsistent date formatting across the app (other components use `date-fns`).
