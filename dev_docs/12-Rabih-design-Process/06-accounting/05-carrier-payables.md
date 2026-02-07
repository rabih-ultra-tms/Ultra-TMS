# Carrier Payables

> Service: Accounting (Service 06) | Wave: Future | Priority: P1
> Route: TBD | Status: Not Started
> Primary Personas: TBD
> Roles with Access: Accounting

---

## Design Status

This screen will be designed as part of a future wave. Key design requirements to be determined.

## Screen Type
List

## Description
List of carrier bills and payables showing amounts owed to carriers, payment due dates, and payment status. Supports filtering by carrier, status, and date range.

## Key Design Considerations
- Must clearly distinguish between standard payment terms and quick-pay obligations
- Factoring company payments need special handling and visibility

## Dependencies
- Service 05 - Carrier (carrier payment terms, banking info)
- Service 04 - TMS Core (load data for carrier charges)
- Service 17 - Factoring (factoring company payment routing)
