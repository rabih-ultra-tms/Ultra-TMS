# Operations New Order

**Route:** `/operations/orders/new`
**File:** `apps/web/app/(dashboard)/operations/orders/new/page.tsx`
**LOC:** 13
**Status:** Complete

## Data Flow

- **Hooks:** None in page.tsx -- all inside OrderForm
- **API calls:** Delegated to OrderForm
- **Envelope:** Unknown from page.tsx

## UI Components

- **Pattern:** FormPage (thin wrapper with Suspense)
- **Key components:** OrderForm (`components/tms/orders/order-form`), FormPageSkeleton (`components/shared/form-page-skeleton`), Suspense
- **Interactive elements:** All inside OrderForm.

## State Management

- **URL params:** None
- **React Query keys:** None in page.tsx

## Quality Assessment

- **Score:** 6/10
- **Bugs:** None in page.tsx
- **Anti-patterns:** 13-line shell -- entire form logic in OrderForm component. Cannot assess quality from page alone.
- **Missing:** Suspense fallback provides skeleton loading. All other states inside OrderForm.
