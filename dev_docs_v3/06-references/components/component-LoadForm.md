# LoadForm

**File:** `apps/web/components/tms/loads/load-form.tsx`
**LOC:** 1,021

## Props Interface

```typescript
// LoadForm is rendered inside a FormPage pattern.
// It receives the form instance from the parent and renders field sections.
```

## Schema (Zod)

```typescript
const loadFormSchema = z.object({
  // Order Link
  orderId: z.string().optional(),

  // Equipment & Freight
  equipmentType: z.string().min(1, "Equipment type is required"),
  commodity: z.string().optional(),
  weight: z.coerce.number().min(1).max(80000).optional(),
  pieces: z.coerce.number().min(0).optional(),
  pallets: z.coerce.number().min(0).optional(),
  isHazmat: z.boolean().default(false),
  hazmatClass: z.string().optional(),
  temperatureMin: z.coerce.number().optional(),
  temperatureMax: z.coerce.number().optional(),

  // Stops (min 2: at least 1 pickup + 1 delivery)
  stops: z.array(z.object({
    stopType: z.enum(['PICKUP', 'DELIVERY']),
    stopSequence: z.number(),
    facilityName: z.string().optional(),
    addressLine1: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(2),
    postalCode: z.string().min(5),
    country: z.string().default("US"),
    appointmentRequired: z.boolean().default(false),
    appointmentDate: z.string().optional(),
    appointmentTimeStart: z.string().optional(),
    appointmentTimeEnd: z.string().optional(),
    contactName: z.string().optional(),
    contactPhone: z.string().optional(),
    specialInstructions: z.string().optional(),
  })).min(2),

  // Carrier
  carrierId: z.string().optional(),
  driverName: z.string().optional(),
  driverPhone: z.string().optional(),
  truckNumber: z.string().optional(),
  trailerNumber: z.string().optional(),

  // Rate
  carrierRate: z.coerce.number().min(0).optional(),
  accessorials: z.array(z.object({
    type: z.string(),
    amount: z.coerce.number(),
  })).optional(),
  fuelSurcharge: z.coerce.number().min(0).optional(),
  carrierPaymentTerms: z.string().optional(),
});
```

## Behavior

Multi-section form organized into Card sections:

1. **Equipment & Freight**: Equipment type dropdown, commodity, weight/pieces/pallets, hazmat toggle with class selector, temperature range for reefer
2. **Stops**: Dynamic multi-stop builder. Each stop has address autocomplete (Google Places), facility name, contact info, appointment scheduling. Minimum 2 stops.
3. **Carrier Assignment**: `CarrierSelector` (432 LOC) with searchable carrier picker, driver name/phone, truck/trailer numbers
4. **Rate & Charges**: Carrier rate input, dynamic accessorials list (add/remove line items), fuel surcharge, payment terms
5. **Notes & References**: Internal notes, reference numbers, special instructions

## Dependencies

- `@/components/ui/address-autocomplete` (Google Places)
- `@/components/tms/loads/carrier-selector` (432 LOC carrier picker)
- `@/components/tms/loads/load-status-badge`
- React Hook Form + Zod
- Lucide icons (Calculator, Plus, Trash2, MapPin, FileText)

## Used By

- `/operations/loads/new` - Create load
- `/operations/loads/[id]/edit` - Edit load

## Known Issues

At 1,021 LOC this is a large component. Could benefit from splitting into sub-components per section (similar to how OrderForm was split into step components).
