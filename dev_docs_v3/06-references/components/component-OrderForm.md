# OrderForm

**File:** `apps/web/components/tms/orders/order-form.tsx`
**LOC:** 623

## Props Interface

Multi-step wizard form. Accepts optional quote ID for quote-to-order conversion.

## Behavior

5-step wizard with navigation (Previous/Next/Submit):

| Step | Component | LOC | Description |
|------|-----------|-----|-------------|
| 1 | OrderCustomerStep | 320 | Customer selector + contact info |
| 2 | OrderCargoStep | 506 | Equipment, commodity, weight, hazmat, temperature |
| 3 | OrderStopsBuilder | 490 | Multi-stop builder with scheduling |
| 4 | OrderRateStep | 435 | Customer rate, carrier rate, margins |
| 5 | OrderReviewStep | 345 | Summary review before submission |

### Schema

Defined in `order-form-schema.ts` (456 LOC):
```typescript
const orderFormSchema = z.object({
  customerId: z.string().min(1),
  equipmentType: z.enum([...]),
  commodity: z.string().optional(),
  weightLbs: z.coerce.number().optional(),
  stops: z.array(stopSchema).min(2),
  customerRate: z.coerce.number().optional(),
  // ... extensive field set
});
```

### Quote-to-Order Conversion

When created from a quote, `useOrderFromQuote` pre-fills:
- Customer ID and name
- Commodity, weight, piece count, pallet count
- Equipment type
- Customer rate and fuel surcharge
- Stops (mapped from quote stops to order stop format)

### Step Validation

Each step validates only its own fields using `STEP_FIELDS` mapping. The user can only advance when the current step's fields pass validation.

## Dependencies

- Sub-step components (5 files, ~2,096 LOC total)
- `order-form-schema.ts` (456 LOC)
- `@/lib/hooks/tms/use-orders` (useCreateOrder, useUpdateOrder, useOrderFromQuote)
- React Hook Form + Zod

## Used By

- `/operations/orders/new` - Create order
- `/operations/orders/new?quoteId=xxx` - Create order from quote
- `/operations/orders/[id]/edit` - Edit order

## Known Issues

None. Well-structured multi-step form with clean separation of concerns.
