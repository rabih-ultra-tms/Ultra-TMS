# BLD-016: Invoice Detail

**Priority:** P0
**Service:** Accounting
**Route:** `/accounting/invoices/[id]`
**Page file:** `apps/web/app/(dashboard)/accounting/invoices/[id]/page.tsx`

## Current State
Fully built (184 LOC). Uses `DetailPage` pattern with tabs: Overview, Line Items, Payments. Actions: Send (conditional on DRAFT/PENDING status), Download PDF, Edit (conditional, disabled when VOID/PAID), Void (conditional with `window.prompt` for reason). Status badge via `InvoiceStatusBadge`. Breadcrumb navigation.

## Requirements
- Replace `window.prompt` for void reason with proper dialog
- Fix PDF download blob handling (`response as unknown as Blob` may not work correctly)
- Verify params typing (uses old `{ params: { id: string } }` pattern -- may need `Promise<>` wrapper for Next.js 16)
- Edit route `/accounting/invoices/[id]/edit` may not exist

## Acceptance Criteria
- [ ] All interactive elements work (buttons, forms, links)
- [ ] API calls succeed with proper error handling
- [ ] Loading, error, and empty states handled
- [ ] Responsive layout
- [ ] TypeScript strict -- no `any` types
- [ ] All tabs render with real invoice data
- [ ] Status-dependent actions work correctly

## Dependencies
- Backend: `GET /invoices/:id`, `POST /invoices/:id/send`, `POST /invoices/:id/void`, `GET /invoices/:id/pdf`
- Hook: `apps/web/lib/hooks/accounting/use-invoices.ts`
- Components: `DetailPage`, `InvoiceOverviewTab`, `InvoiceLineItemsTab`, `InvoicePaymentsTab`, `InvoiceStatusBadge`

## Estimated Effort
M
