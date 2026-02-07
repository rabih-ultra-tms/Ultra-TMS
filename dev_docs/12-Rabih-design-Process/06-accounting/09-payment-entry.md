# Payment Entry

> Service: Accounting (Service 06) | Wave: Future | Priority: P1
> Route: TBD | Status: Not Started
> Primary Personas: TBD
> Roles with Access: Accounting

---

## Design Status

This screen will be designed as part of a future wave. Key design requirements to be determined.

## Screen Type
Form

## Description
Form for processing payments -- both incoming customer payments and outgoing carrier payments. Supports payment application to specific invoices/bills with partial payment handling.

## Key Design Considerations
- Must handle partial payments and overpayments with clear balance tracking
- Payment method selection (ACH, check, wire, credit card) with method-specific fields

## Dependencies
- Service 02 - CRM (customer payment info)
- Service 05 - Carrier (carrier banking info)
- Invoice and bill records within this service
