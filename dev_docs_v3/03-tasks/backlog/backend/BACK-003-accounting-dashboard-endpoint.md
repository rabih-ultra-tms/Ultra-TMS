# BACK-003: Implement Accounting Dashboard Endpoint

**Priority:** P0 (QS-003 related)
**Module:** `apps/api/src/modules/accounting/`
**Endpoint(s):** `GET /accounting/dashboard`

## Current State
Endpoint exists in `accounting.controller.ts` at line 18-24. Controller delegates to `reportsService.getDashboard(tenantId)`. The `ReportsService` exists at `apps/api/src/modules/accounting/services/reports.service.ts`. Need to verify the service method actually implements the dashboard query and returns correct data shape.

## Requirements
- Verify `getDashboard()` in ReportsService queries real data (not stubbed)
- Response should include: total receivables, total payables, outstanding invoices count, overdue amount, recent payments total, cash flow metrics
- Frontend `useAccountingDashboard` hook expects specific data shape from this endpoint
- Ensure proper tenant isolation

## Acceptance Criteria
- [ ] Endpoint returns correct data shape matching frontend expectations
- [ ] Auth guards applied (JwtAuthGuard + role-based: ADMIN, ACCOUNTING, etc.)
- [ ] Multi-tenant filtered (tenantId + deletedAt)
- [ ] DTO validation
- [ ] Tests pass
- [ ] Dashboard loads real data on frontend

## Dependencies
- Prisma model: Invoice, Payment, Settlement
- Related modules: invoices, payments-received, payments-made, settlements

## Estimated Effort
S
