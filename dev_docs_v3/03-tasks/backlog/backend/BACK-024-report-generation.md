# BACK-024: Report Generation Engine

**Priority:** P2
**Module:** `apps/api/src/modules/accounting/` and `apps/api/src/modules/analytics/`
**Endpoint(s):** `GET /reports/:type`, `GET /reports/:type/export`

## Current State
Accounting module has `reports.service.ts` with aging report and dashboard methods. Analytics module exists. Frontend has aging report page. Need comprehensive report generation across all services.

## Requirements
- Report types: aging, revenue, profitability, carrier performance, lane analysis, commission, settlement summary
- Date range filtering for all reports
- Export to CSV and PDF formats
- Scheduled report generation (daily/weekly/monthly)
- Email delivery of scheduled reports
- Report caching for expensive queries
- Drill-down support (summary -> detail)

## Acceptance Criteria
- [ ] Endpoint returns correct data shape
- [ ] Auth guards applied
- [ ] Multi-tenant filtered (tenantId + deletedAt)
- [ ] DTO validation
- [ ] Tests pass
- [ ] Reports generate accurate data
- [ ] CSV/PDF exports are well-formatted

## Dependencies
- Prisma model: Various (read-only aggregations)
- Related modules: accounting, tms, carrier, commission, analytics

## Estimated Effort
XL
