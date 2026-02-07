# Invoice Entry

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
Invoice creation form for generating customer invoices. Supports manual entry and auto-generation from completed loads with line item details, tax calculations, and terms.

## Key Design Considerations
- Auto-population from load data should minimize manual data entry
- Must handle multiple line items with different rate types (flat, per mile, accessorial)

## Dependencies
- Service 02 - CRM (customer billing info, payment terms)
- Service 04 - TMS Core (load data for auto-population)
