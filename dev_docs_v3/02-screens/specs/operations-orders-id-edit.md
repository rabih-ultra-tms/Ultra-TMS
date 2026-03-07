# Operations Order Edit

**Route:** `/operations/orders/[id]/edit`
**File:** `apps/web/app/(dashboard)/operations/orders/[id]/edit/page.tsx`
**LOC:** 180
**Status:** Complete

## Data Flow

- **Hooks:** `useOrder(id)` (`lib/hooks/tms/use-orders`)
- **API calls:** `GET /api/v1/tms/orders/{id}` (pre-populate via `mapOrderToFormValues`)
- **Envelope:** Hook returns order directly. Complex field mapping function `mapOrderToFormValues` converts API response to form schema.

## UI Components

- **Pattern:** FormPage (loads order data into OrderForm edit mode)
- **Key components:** OrderForm (`components/tms/orders/order-form`), Alert (for error/not-found states), Loader2, Button
- **Interactive elements:** OrderForm with all fields pre-populated, "Back to Orders" button on error. All wired.

## State Management

- **URL params:** `[id]` from route params (uses `use(params)`)
- **React Query keys:** Via `useOrder(id)`

## Quality Assessment

- **Score:** 7/10
- **Bugs:** None critical
- **Anti-patterns:**
  - `toNum()` helper function handles Prisma Decimal serialization edge cases -- fragile type coercion
  - `customFields` (JSON blob) used as source for several form fields -- not type-safe
  - `crypto.randomUUID()` called during form mapping for accessorial IDs -- non-deterministic
- **Missing:** Loading state present (full-page spinner). Error state present (Alert with retry). Not-found state present (Alert). Complex Prisma-to-form mapping handles edge cases.
