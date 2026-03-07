# QuoteFormV2

**File:** `apps/web/components/sales/quote-form-v2.tsx`
**LOC:** 729

## Props Interface

Renders within the sales quote pages. Accepts form configuration for create/edit modes.

## Behavior

Full quote create/edit form (v2 rewrite). Sections include:

1. **Customer Selection**: Customer picker with search
2. **Stops Builder** (`QuoteStopsBuilder`, 328 LOC): Multi-stop pickup/delivery with Google Places autocomplete and appointment scheduling
3. **Rate Section** (`QuoteRateSection`, 532 LOC): Line haul rate, accessorial charges, fuel surcharge, customer rate calculation, margin preview
4. **Equipment & Cargo**: Equipment type, commodity, weight, piece count
5. **Notes & References**: Internal notes, customer-visible notes

### Rate Calculation

The rate section handles complex pricing:
- Line haul (base rate)
- Accessorial charges (dynamic add/remove)
- Fuel surcharge (flat or percentage)
- Total customer rate = line haul + accessorials + fuel
- Margin preview when carrier rate is known

## Dependencies

- `@/components/ui/address-autocomplete`
- `@/lib/hooks/sales/` (useCreateQuote, useUpdateQuote)
- `@/lib/validations/quotes` (Zod schema)
- React Hook Form + Zod
- `QuoteStopsBuilder` and `QuoteRateSection` as sub-components

## Used By

- `/sales/quotes/new` - Create quote
- `/sales/quotes/[id]/edit` - Edit quote

## Known Issues

At 729 LOC (plus 860 LOC in sub-components), this is a large form. The v2 rewrite improved structure over v1 but could benefit from further decomposition.
