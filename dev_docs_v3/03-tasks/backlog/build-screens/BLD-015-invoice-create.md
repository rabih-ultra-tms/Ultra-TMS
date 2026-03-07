# BLD-015: Invoice Create

**Priority:** P0
**Service:** Accounting
**Route:** `/accounting/invoices/new`
**Page file:** `apps/web/app/(dashboard)/accounting/invoices/new/page.tsx`

## Current State
Minimal page wrapper (13 LOC). Renders `InvoiceForm` component inside `Suspense` with `FormPageSkeleton` fallback. All form logic lives in the `InvoiceForm` component.

## Requirements
- Verify `InvoiceForm` supports creating invoices from loads or standalone
- Line items management (add/remove/edit)
- Customer selection with search
- Tax and total calculations
- Auto-generation of invoice number
- Due date calculation based on payment terms

## Acceptance Criteria
- [ ] All interactive elements work (buttons, forms, links)
- [ ] API calls succeed with proper error handling
- [ ] Loading, error, and empty states handled
- [ ] Responsive layout
- [ ] TypeScript strict -- no `any` types
- [ ] Line items calculate totals correctly
- [ ] Submission creates invoice and navigates to detail

## Dependencies
- Backend: `POST /invoices`
- Hook: `apps/web/lib/hooks/accounting/use-invoices.ts` (useCreateInvoice)
- Components: `InvoiceForm`, `FormPageSkeleton`

## Estimated Effort
L
