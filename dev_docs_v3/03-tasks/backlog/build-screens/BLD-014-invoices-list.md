# BLD-014: Invoices List

**Priority:** P0
**Service:** Accounting
**Route:** `/accounting/invoices`
**Page file:** `apps/web/app/(dashboard)/accounting/invoices/page.tsx`

## Current State
Fully built (128 LOC). Uses `ListPage` pattern with `useInvoices` hook. Features: invoice filters, send invoice action, void invoice action (uses `window.prompt` for reason input -- needs proper dialog), download PDF action. Row click navigates to invoice detail. URL-driven pagination and filtering (page, limit, search, status, fromDate, toDate).

## Requirements
- Replace `window.prompt` for void reason with a proper dialog component
- Verify PDF download works (current blob handling casts `response as unknown as Blob` which may not work correctly with the API client)
- Verify `useSendInvoice` and `useVoidInvoice` connect to backend endpoints

## Acceptance Criteria
- [ ] All interactive elements work (buttons, forms, links)
- [ ] API calls succeed with proper error handling
- [ ] Loading, error, and empty states handled
- [ ] Responsive layout
- [ ] TypeScript strict -- no `any` types
- [ ] Send, void, and download PDF actions work
- [ ] Void reason collected via proper dialog (not window.prompt)

## Dependencies
- Backend: `GET /invoices`, `POST /invoices/:id/send`, `POST /invoices/:id/void`, `GET /invoices/:id/pdf`
- Hook: `apps/web/lib/hooks/accounting/use-invoices.ts`
- Components: `ListPage`, `InvoiceFilters`, `getInvoiceColumns`

## Estimated Effort
S
