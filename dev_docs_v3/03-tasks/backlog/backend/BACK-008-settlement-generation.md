# BACK-008: Settlement Generation from Loads

**Priority:** P0
**Module:** `apps/api/src/modules/accounting/`
**Endpoint(s):** `POST /settlements`, `POST /settlements/from-loads`

## Current State
SettlementsService and SettlementsController exist. Service includes create, approve, process, delete operations. Frontend settlement pages support the CREATED -> APPROVED -> PROCESSED workflow. Need to verify grouping payables into settlements.

## Requirements
- Group delivered loads by carrier into settlements
- Calculate gross amount from carrier rates + accessorials
- Support deductions (advances, chargebacks, fees)
- Net payout calculation (gross - deductions)
- Settlement number auto-generation
- Approval workflow with audit trail (who approved, when)
- Process payout (mark as paid, record payment date)

## Acceptance Criteria
- [ ] Endpoint returns correct data shape
- [ ] Auth guards applied
- [ ] Multi-tenant filtered (tenantId + deletedAt)
- [ ] DTO validation
- [ ] Tests pass
- [ ] Settlement groups correct loads per carrier
- [ ] Financial calculations accurate

## Dependencies
- Prisma model: Settlement, SettlementLineItem
- Related modules: tms/loads, carrier, accounting/payments-made

## Estimated Effort
L
