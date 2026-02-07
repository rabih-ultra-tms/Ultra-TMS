# Purchase Requests

> Service: Factoring External (Service 30) | Wave: Future | Priority: P1
> Route: TBD | Status: Not Started
> Primary Personas: TBD
> Roles with Access: Accounting

---

## Design Status

This screen will be designed as part of a future wave.

## Screen Type
List

## Description
List of invoice purchase requests submitted to factoring companies, showing request status, invoice details, advance amounts, approval state, and funding timelines.

## Key Design Considerations
- Batch submission workflow for sending multiple invoices to a factor in a single request
- Status tracking pipeline showing each request stage from submission through funding

## Dependencies
- Billing/Invoice service for invoice data
- Factor Companies (Service 30, Screen 2)
- Remittance Tracking (Service 30, Screen 5) for funded request follow-up
