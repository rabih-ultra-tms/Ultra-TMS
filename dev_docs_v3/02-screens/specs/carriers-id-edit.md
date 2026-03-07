# Carrier Edit

**Route:** `/carriers/[id]/edit`
**File:** `apps/web/app/(dashboard)/carriers/[id]/edit/page.tsx`
**LOC:** 73
**Status:** Complete

## Data Flow

- **Hooks:** `useCarrier` + `useUpdateCarrier` (`lib/hooks/operations`)
- **API calls:** `GET /api/v1/operations/carriers/{id}`, `PATCH /api/v1/operations/carriers/{id}`
- **Envelope:** `data?.data` via hooks -- correct

## UI Components

- **Pattern:** FormPage (loads carrier data, passes to CarrierForm with extra sections)
- **Key components:** CarrierForm (`components/carriers/carrier-form`), CarrierDriversManager, CarrierTrucksManager, CarrierDocumentsManager (all from `components/carriers/`), FormPageSkeleton, ErrorState, Button, Link
- **Interactive elements:** CarrierForm handles all form interactions. Extra sections render drivers manager (COMPANY only), trucks manager, documents manager below the form. All wired.

## State Management

- **URL params:** `id` from route params (React 19 `use(params)` with `Promise<{ id: string }>`)
- **React Query keys:** Via `useCarrier(id)`

## Quality Assessment

- **Score:** 8/10
- **Bugs:**
  - `console.error(e)` in catch block (line 33) -- should use toast or error state instead
  - `router.refresh()` called after `router.push()` (line 30) -- redundant, push already triggers navigation
- **Anti-patterns:**
  - `console.error` for mutation errors instead of user-facing feedback
- **Missing:** Loading state via FormPageSkeleton (good). Error state via ErrorState with retry and back button (good). `extraSections` render prop pattern on CarrierForm for drivers/trucks/docs below form (good composition pattern). Clean edit page with proper React 19 params handling.
