# Accounting Invoice New

**Route:** `/accounting/invoices/new`
**File:** `apps/web/app/(dashboard)/accounting/invoices/new/page.tsx`
**LOC:** 13
**Status:** Complete

## Data Flow

- **Hooks:** None in page.tsx -- delegated to InvoiceForm
- **API calls:** Delegated to InvoiceForm component
- **Envelope:** Unknown from page.tsx

## UI Components

- **Pattern:** FormPage (Suspense wrapper around InvoiceForm)
- **Key components:** Suspense, InvoiceForm (`components/accounting/invoice-form`), FormPageSkeleton (`components/shared/form-page-skeleton`)
- **Interactive elements:** All inside InvoiceForm sub-component.

## State Management

- **URL params:** None in page.tsx (InvoiceForm may read query params for pre-fill)
- **React Query keys:** None in page.tsx

## Quality Assessment

- **Score:** 7/10
- **Bugs:** None in page.tsx
- **Anti-patterns:** None -- proper Suspense boundary with FormPageSkeleton fallback
- **Missing:** Quality depends entirely on InvoiceForm component. Page wrapper is clean.
