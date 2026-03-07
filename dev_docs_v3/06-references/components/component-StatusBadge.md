# StatusBadge (Unified)

Two StatusBadge implementations exist, serving different purposes.

---

## TMS Primitives StatusBadge

**File:** `apps/web/components/tms/primitives/status-badge.tsx`
**LOC:** 97

Low-level badge using CVA variants and the 3-layer design token system.

```typescript
interface StatusBadgeProps {
  status?: StatusColorToken;  // "transit" | "unassigned" | "tendered" | "dispatched" | "delivered" | "atrisk"
  intent?: Intent;            // "success" | "warning" | "danger" | "info"
  size?: "sm" | "md" | "lg";
  withDot?: boolean;
  children: React.ReactNode;
}
```

Use this when you know the exact status token or intent to apply.

---

## Unified StatusBadge

**File:** `apps/web/components/shared/status-badge.tsx`
**LOC:** 209

Entity-aware wrapper that maps `entity + status` to the correct color automatically.

```typescript
interface UnifiedStatusBadgeProps {
  entity: StatusEntity;  // "user" | "customer" | "lead" | "order" | "load" | "carrier" | ...
  status: string;        // Entity-specific status string
  size?: "sm" | "md" | "lg";
  withDot?: boolean;
}
```

### Supported Entities (14)

user, customer, lead, order, load, carrier, document, insurance, quote, invoice, payment, payable, settlement, priority

### How It Works

1. Receives `entity` + `status` string
2. Looks up color mapping from centralized design token tables (e.g., `CARRIER_STATUSES`, `LOAD_STATUSES`, `QUOTE_STATUSES`)
3. Resolves to either a `StatusColorToken` or `Intent`
4. Passes resolved color to the primitives `StatusBadge`

### Usage

```tsx
// Instead of manually mapping status to colors:
<UnifiedStatusBadge entity="carrier" status="active" />
<UnifiedStatusBadge entity="order" status="pending" size="lg" />
<UnifiedStatusBadge entity="load" status="IN_TRANSIT" withDot />
```

## Used By

Both are widely used:
- Primitives `StatusBadge`: TMS design system components, dispatch board
- Unified `StatusBadge`: List pages, detail pages, anywhere entity status is displayed

## Dependencies

- `@/lib/design-tokens` (centralized status color mappings)
- `class-variance-authority` (CVA for primitives version)
