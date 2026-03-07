# TEST-005: Unit Tests for Accounting Hooks

**Priority:** P0
**Service:** Accounting
**Scope:** Unit test coverage for use-invoices, use-settlements, and use-payments hooks

## Current State
Three accounting hook files exist:
- `apps/web/lib/hooks/accounting/use-invoices.ts` -- 299 LOC, full invoice CRUD + send/void/status update
- `apps/web/lib/hooks/accounting/use-settlements.ts` -- settlement CRUD hooks
- `apps/web/lib/hooks/accounting/use-payments.ts` -- payment recording hooks

The invoices hook is well-structured with typed query keys (`invoiceKeys`), a custom `unwrap` helper, and 8 exported hooks.

## Requirements
- Test all invoice hooks (useInvoices, useInvoice, useCreateInvoice, useUpdateInvoice, useDeleteInvoice, useSendInvoice, useVoidInvoice, useUpdateInvoiceStatus)
- Test invoice `unwrap` helper that handles both envelope and pagination responses
- Test settlement hooks
- Test payment hooks
- Verify query key factory pattern works correctly

## Acceptance Criteria
- [ ] All invoice hooks tested with success/error paths
- [ ] `unwrap` helper tested with pagination response and single-item response
- [ ] `useSendInvoice` and `useVoidInvoice` test their specific payloads
- [ ] `useUpdateInvoiceStatus` tests status transitions
- [ ] Settlement and payment hooks tested
- [ ] Tests pass in CI

## Dependencies
- None beyond existing test infrastructure

## Estimated Effort
M
