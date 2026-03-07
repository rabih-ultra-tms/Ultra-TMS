# CheckCallForm

**File:** `apps/web/components/tms/checkcalls/check-call-form.tsx`
**LOC:** 224

## Props Interface

```typescript
interface CheckCallFormProps {
  loadId: string;
  onSuccess?: () => void;
}
```

## Behavior

Form for logging check calls on active loads. Used inline in the dispatch detail drawer and load detail pages.

### Fields

- **Call Type** (select): Check Call, Arrival, Departure, Delay, Issue
- **Location**: City + State (US state select with 50 states)
- **Notes**: Free-text textarea
- **ETA Update** (optional): Updated ETA date/time

### Submission

Uses `useCreateCheckCall` hook which sends:
```typescript
interface CreateCheckCallData {
  loadId: string;
  type: string;
  city?: string;
  state?: string;
  notes?: string;
  estimatedArrival?: string;
}
```

### States

- Loading: spinner on submit button
- Error: Alert banner with error message
- Success: calls `onSuccess` callback (typically closes form or refreshes timeline)

## Used By

- Dispatch detail drawer (tracking view)
- Load detail page (check calls tab)

## Dependencies

- `@/lib/hooks/tms/use-checkcalls` (useCreateCheckCall)
- `@/components/ui/` (Button, Card, Input, Label, Select, Textarea, Alert)
- Lucide icons (Loader2, AlertCircle)

## Known Issues

None. Straightforward form component.
