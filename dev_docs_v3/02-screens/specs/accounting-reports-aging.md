# Accounting Reports - Aging

**Route:** `/accounting/reports/aging`
**File:** `apps/web/app/(dashboard)/accounting/reports/aging/page.tsx`
**LOC:** 154
**Status:** Complete

## Data Flow

- **Hooks:** `useAgingReport` (`lib/hooks/accounting/use-aging`), `useCustomers` (`lib/hooks/crm/use-customers`)
- **API calls:** `GET /api/v1/accounting/reports/aging?customerId&asOfDate`, `GET /api/v1/crm/customers?limit=200`
- **Envelope:** `data?.data` via hooks -- correct

## UI Components

- **Pattern:** Custom (filter bar + report component)
- **Key components:** AgingReport (`components/accounting/aging-report`), Select (customer filter), Input type=date (as-of date), Button (Apply/Clear), Link (back to accounting)
- **Interactive elements:** Customer select dropdown (loads 200 customers), as-of date input, "Apply" button, "Clear" button (conditional on active filters), back arrow link. All wired.

## State Management

- **URL params:** `customerId`, `asOfDate` read from `useSearchParams`. Filter changes update URL via `router.push`.
- **React Query keys:** Via `useAgingReport({ customerId, asOfDate })`
- **Local state:** `selectedCustomer` (string), `selectedDate` (string) -- mirror URL params with local copy for "Apply" pattern

## Quality Assessment

- **Score:** 6/10
- **Bugs:**
  - `useCustomers({ limit: 200 })` -- hardcoded limit, tenants with 200+ customers will have missing options in dropdown
  - Filter state uses local-then-URL pattern (edit locally, apply to URL) -- good UX but adds complexity
- **Anti-patterns:**
  - Error state uses raw `<button>` with inline classes for retry instead of shadcn Button
  - Hardcoded error styling (`border-red-200 bg-red-50 text-red-700`) -- won't adapt to dark mode
  - `useSearchParams` not in Suspense boundary
  - No shadcn DatePicker used -- plain `<Input type="date">` instead
- **Missing:** Loading state delegated to AgingReport component. Error state present with retry (good). No export/print option. No group-by toggle (customer vs carrier). Back button uses Link properly (good).
