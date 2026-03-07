# CarrierForm

**File:** `apps/web/components/carriers/carrier-form.tsx`
**LOC:** 640

## Props Interface

```typescript
interface CarrierFormProps {
  initialData?: Partial<CarrierFormValues>;
  carrierId?: string;
  onSubmit: (data: CarrierFormValues) => Promise<void>;
  isLoading?: boolean;
  isSubmitting?: boolean;
  extraSections?: (isCompany: boolean) => React.ReactNode;
}
```

## Behavior

Full carrier create/edit form using the `FormPage` pattern. Organized into sections:

1. **Carrier Type**: Company vs Owner Operator toggle (controls which fields appear)
2. **FMCSA Lookup**: `FmcsaLookup` component for auto-filling carrier data from MC/DOT number
3. **Basic Information**: Company name, MC#, DOT#, SCAC, status, tier
4. **Contact Information**: Primary email, phone, secondary phone
5. **Address**: Google Places autocomplete via `AddressAutocomplete`
6. **Equipment Types**: Multi-select checkboxes for supported equipment
7. **Payment**: Payment method, payment terms
8. **Notes**: Internal notes textarea

### Data Sanitization

Strips null values from API response so string defaults ("") are preserved:
```typescript
const sanitizedData = initialData
  ? Object.fromEntries(Object.entries(initialData).filter(([, v]) => v !== null))
  : {};
```

### Extra Sections

The `extraSections` render prop allows the parent to inject additional content (e.g., insurance, documents) that renders outside the main form element but within the page layout.

## Dependencies

- `@/components/patterns/form-page` (FormPage layout pattern)
- `@/lib/validations/carriers` (carrierSchema Zod validation)
- `@/components/carriers/fmcsa-lookup` (FMCSA auto-fill)
- `@/components/ui/address-autocomplete` (Google Places)
- `@/types/carriers` (EQUIPMENT_TYPES, CARRIER_EQUIPMENT_TYPE_LABELS)
- React Hook Form + Zod

## Used By

- `/carriers/new` - Create carrier
- `/carriers/[id]/edit` - Edit carrier

## Known Issues

None. Well-structured form using the FormPage pattern.
