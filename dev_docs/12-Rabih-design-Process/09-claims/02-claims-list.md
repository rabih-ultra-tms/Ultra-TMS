# Claims List

> Service: Claims (Service 09) | Wave: Future | Priority: P2
> Route: TBD | Status: Not Started
> Primary Personas: TBD
> Roles with Access: Operations

---

## Design Status

This screen will be designed as part of a future wave. Key design requirements to be determined.

## Screen Type
List

## Description
All claims list with filtering by status, claim type (damage, loss, delay, overcharge), carrier, customer, date range, and claim amount. Supports sorting by priority and aging.

## Key Design Considerations
- Status-based color coding and aging indicators help prioritize the claims queue
- Quick-action buttons for common operations (assign investigator, update status) reduce clicks

## Dependencies
- Service 04 - TMS Core (load reference data)
- Service 05 - Carrier (carrier names for filtering)
- Service 02 - CRM (customer names for filtering)
