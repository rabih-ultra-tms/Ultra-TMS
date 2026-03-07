# BACK-004: Wire RateConfirmation Service

**Priority:** P0
**Module:** `apps/api/src/modules/tms/`
**Endpoint(s):** `POST /loads/:id/rate-con`, `POST /loads/:id/rate-con/email`, `GET /loads/:id/rate-con/pdf`

## Current State
RateConfirmation endpoints exist in `loads.controller.ts`. DTOs include `RateConfirmationOptionsDto`. PDF generation service (`pdf.service.ts`) exists in the accounting module. The frontend `useRateConfirmation` hook provides generate, download, and emailToCarrier functions.

## Requirements
- Verify PDF generation produces valid rate confirmation document
- Verify email-to-carrier integrates with communication module (email service)
- PDF should include: load details, carrier info, rate breakdown, terms, stops/routing
- Ensure blob response works correctly with frontend download handler

## Acceptance Criteria
- [ ] Endpoint returns correct data shape (PDF blob for download, success for email)
- [ ] Auth guards applied
- [ ] Multi-tenant filtered (tenantId + deletedAt)
- [ ] DTO validation (RateConfirmationOptionsDto)
- [ ] Tests pass
- [ ] PDF renders correctly in frontend preview

## Dependencies
- Prisma model: Load, Carrier
- Related modules: accounting/pdf.service, communication/email

## Estimated Effort
M
