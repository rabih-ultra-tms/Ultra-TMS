# TMS Form Components

Components for data input, filtering, and form management.

---

## LoadForm

**File:** `apps/web/components/tms/loads/load-form.tsx`
**LOC:** 1,021

### Props

```typescript
// Form receives a UseFormReturn from parent (FormPage pattern)
// Schema: loadFormSchema (Zod)
```

### Schema (key fields)

```typescript
const loadFormSchema = z.object({
  orderId: z.string().optional(),
  equipmentType: z.string().min(1),
  commodity: z.string().optional(),
  weight: z.coerce.number().min(1).max(80000).optional(),
  pieces: z.coerce.number().min(0).optional(),
  pallets: z.coerce.number().min(0).optional(),
  isHazmat: z.boolean().default(false),
  hazmatClass: z.string().optional(),
  temperatureMin: z.coerce.number().optional(),
  temperatureMax: z.coerce.number().optional(),
  stops: z.array(z.object({
    stopType: z.enum(['PICKUP', 'DELIVERY']),
    facilityName: z.string().optional(),
    addressLine1: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(2),
    postalCode: z.string().min(5),
    appointmentRequired: z.boolean().default(false),
    // ... dates, contacts, instructions
  })).min(2),
  carrierId: z.string().optional(),
  carrierRate: z.coerce.number().min(0).optional(),
  accessorials: z.array(z.object({ type: z.string(), amount: z.coerce.number() })).optional(),
  // ... driver info, notes, references
});
```

### Sections

1. Equipment & Freight (equipment type, commodity, weight, pieces, hazmat toggle)
2. Stops (multi-stop builder with address autocomplete, appointments)
3. Carrier Assignment (CarrierSelector component, driver info)
4. Rate & Charges (carrier rate, accessorials, fuel surcharge)
5. Notes & References

### Dependencies

- `@/components/ui/address-autocomplete` (Google Places)
- `CarrierSelector` (432 LOC) - searchable carrier picker with scoring
- `LoadStatusBadge` - status display
- React Hook Form + Zod validation

---

## OrderForm

**File:** `apps/web/components/tms/orders/order-form.tsx`
**LOC:** 623

### Multi-Step Wizard

Step-by-step form with navigation (Previous/Next/Submit):

1. **Customer** (`OrderCustomerStep`, 320 LOC) - Customer selector + contact
2. **Cargo** (`OrderCargoStep`, 506 LOC) - Equipment, commodity, weight, hazmat
3. **Stops** (`OrderStopsBuilder`, 490 LOC) - Multi-stop builder with scheduling
4. **Rate** (`OrderRateStep`, 435 LOC) - Customer rate, carrier rate, margins
5. **Review** (`OrderReviewStep`, 345 LOC) - Summary before submission

### Schema

```typescript
// Defined in order-form-schema.ts (456 LOC)
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

### Behavior

- Supports quote-to-order conversion (pre-fills from quote data via `useOrderFromQuote`)
- Per-step validation using `STEP_FIELDS` mapping
- Progress indicator showing current step
- Dirty state confirmation before leaving

---

## FilterBar

**File:** `apps/web/components/tms/filters/filter-bar.tsx`
**LOC:** 236

### Props

```typescript
interface FilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;     // Debounced at 300ms
  filters?: FilterDefinition[];
  filterValues?: FilterValues;                    // { [name]: string }
  onFilterChange?: (name: string, value: string) => void;
  onClear?: () => void;
  hasActiveFilters?: boolean;
}

interface FilterDefinition {
  name: string;
  label: string;
  type: "select" | "date-range" | "text";
  options?: FilterOption[];                       // For select type
  placeholder?: string;
}
```

### Behavior

- Search input with 300ms debounce via `useDebounce` hook
- Dynamic filter rendering based on `FilterDefinition.type`
- Active filter count badge
- "Clear all" button when filters are active
- Horizontal scrolling with `overflow-x-auto no-scrollbar`
- Passes through `children` for custom filter chips

---

## FilterChip

**File:** `apps/web/components/tms/filters/filter-chip.tsx`
**LOC:** 55

### Props

```typescript
interface FilterChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  active?: boolean;
  count?: number;           // Count badge value
}
```

Pill button with active state (sapphire background + border). Count badge renders as sapphire pill with white text.

---

## StatusDropdown

**File:** `apps/web/components/tms/filters/status-dropdown.tsx`
**LOC:** 106

Dropdown for selecting load/order status in filter bars. Shows status dots with labels.

---

## CarrierSelector

**File:** `apps/web/components/tms/loads/carrier-selector.tsx`
**LOC:** 432

Searchable carrier picker for load assignment. Shows carrier name, MC#, tier badge, and scoring info. Supports async search with debounce.

---

## CheckCallForm

**File:** `apps/web/components/tms/checkcalls/check-call-form.tsx`
**LOC:** 224

### Props

```typescript
interface CheckCallFormProps {
  loadId: string;
  onSuccess?: () => void;
}
```

Form for logging check calls with: call type (Check Call, Arrival, Departure, Delay, Issue), location (city, state), notes, and ETA update. Uses `useCreateCheckCall` hook.

---

## UploadZone

**File:** `apps/web/components/tms/documents/upload-zone.tsx`
**LOC:** 106

### Props

```typescript
interface UploadZoneProps {
  variant?: "full" | "inline";    // Large zone vs compact per-item
  text?: string;
  onClick?: () => void;
  onDrop?: (files: FileList) => void;
  className?: string;
}
```

Dashed-border drop zone with drag-over highlighting. Full variant: 36px icon, large padding. Inline variant: 24px icon, compact.
