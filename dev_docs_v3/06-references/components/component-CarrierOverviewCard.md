# CarrierOverviewCard

**File:** `apps/web/components/carriers/carrier-overview-card.tsx`
**LOC:** 169

## Props Interface

```typescript
interface CarrierOverviewCardProps {
  carrier: OperationsCarrier;
}
```

## Behavior

Two-column grid of info cards displaying carrier details:

### Company Information Card

- Company Name
- Carrier Type (Company / Owner Operator)
- MC Number
- DOT Number
- SCAC Code

### Contact Information Card

- Primary Email (with Mail icon)
- Phone (with Phone icon)
- Website (with Globe icon)
- Address (with MapPin icon)

### Payment Information

- Payment Method (Check, ACH Transfer, Wire Transfer, Quick Pay)
- Payment Terms

Uses shadcn `Card` components with `CardHeader` / `CardContent` layout. Each info row is a reusable `InfoRow` internal component.

## Used By

- `/carriers/[id]` - Overview tab of carrier detail page

## Dependencies

- `@/components/ui/` (Card, Badge)
- `@/types/carriers` (OperationsCarrier type)
- Lucide icons (MapPin, Phone, Mail, Globe, CreditCard, Building2)

## Accessibility

Standard card layout with text content. No interactive elements beyond links.

## Known Issues

None. Clean display component.
