# Operations New Load

**Route:** `/operations/loads/new`
**File:** `apps/web/app/(dashboard)/operations/loads/new/page.tsx`
**LOC:** 120
**Status:** Complete

## Data Flow

- **Hooks:** `useCreateLoad` + `useOrder(orderId)` (`lib/hooks/tms/use-loads`)
- **API calls:** `POST /api/v1/tms/loads` (create), optionally `GET /api/v1/tms/orders/{orderId}` (pre-fill from order)
- **Envelope:** Order data accessed directly (hook unwraps). Create mutation sends form values.

## UI Components

- **Pattern:** FormPage (uses `FormPage` pattern component with LoadFormSections)
- **Key components:** FormPage (`components/patterns/form-page`), LoadFormSections (`components/tms/loads/load-form`), loadFormSchema (zod)
- **Interactive elements:** All form sections (equipment, stops, cargo, carrier assignment, accessorials), submit button ("Create Load"), cancel button. All wired.

## State Management

- **URL params:** `?orderId` read via `useSearchParams` -- pre-fills form from order data
- **React Query keys:** Via `useOrder(orderId)` and `useCreateLoad`

## Quality Assessment

- **Score:** 8/10
- **Bugs:** None
- **Anti-patterns:** None significant
- **Missing:** Loading state via FormPage (shows skeleton while order loads). Error state via FormPage. Default values computed via `useMemo` with proper blank/pre-fill logic. Stops default to PICKUP + DELIVERY pair.
