# Operations Load Edit

**Route:** `/operations/loads/[id]/edit`
**File:** `apps/web/app/(dashboard)/operations/loads/[id]/edit/page.tsx`
**LOC:** 160
**Status:** Complete

## Data Flow

- **Hooks:** `useLoad(loadId)` + `useUpdateLoad(loadId)` (`lib/hooks/tms/use-loads`)
- **API calls:** `GET /api/v1/tms/loads/{id}` (pre-populate), `PATCH /api/v1/tms/loads/{id}` (update)
- **Envelope:** `loadData` returned directly from hook (verify internal unwrapping)

## UI Components

- **Pattern:** FormPage (uses `FormPage` pattern with LoadFormSections in edit mode)
- **Key components:** FormPage (`components/patterns/form-page`), LoadFormSections (`components/tms/loads/load-form` mode="edit")
- **Interactive elements:** All form fields pre-populated from load data, "Save Changes" submit, "Cancel" navigates to load detail. All wired.

## State Management

- **URL params:** `[id]` from route params
- **React Query keys:** Via `useLoad(loadId)` and `useUpdateLoad(loadId)`

## Quality Assessment

- **Score:** 7/10
- **Bugs:** None critical
- **Anti-patterns:**
  - Complex `toNum()` helper for Prisma Decimal conversion -- duplicated from order edit page
  - Stop mapping handles two different data shapes (load stops vs order stops) with `'addressLine1' in stop` type checks -- fragile
  - `key={isLoading ? 'loading' : 'loaded'}` forces FormPage remount on data load -- intentional but heavy
- **Missing:** Loading state via FormPage. Error state via FormPage. Carrier info and order info passed via `useMemo`. No not-found state (FormPage handles it).
