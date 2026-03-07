# BACK-007: Invoice Generation from Loads

**Priority:** P0
**Module:** `apps/api/src/modules/accounting/`
**Endpoint(s):** `POST /invoices`, `POST /invoices/from-load/:loadId`

## Current State
InvoicesService and InvoicesController exist in the accounting module. Service file includes create, update, void, send operations. Frontend `InvoiceForm` component supports creating invoices. Need to verify auto-generation from delivered loads.

## Requirements
- Generate invoice from delivered load with line items (base rate, fuel surcharge, accessorials)
- Auto-populate customer, load reference, amounts from load data
- Invoice number auto-generation (sequential per tenant)
- Due date calculation based on customer payment terms
- Support manual invoice creation (not from load)
- PDF generation for invoice

## Acceptance Criteria
- [ ] Endpoint returns correct data shape
- [ ] Auth guards applied
- [ ] Multi-tenant filtered (tenantId + deletedAt)
- [ ] DTO validation
- [ ] Tests pass
- [ ] Invoice line items match load charges
- [ ] Invoice number is unique per tenant

## Dependencies
- Prisma model: Invoice, InvoiceLineItem
- Related modules: tms/loads, crm (customer payment terms), accounting/pdf

## Estimated Effort
L
