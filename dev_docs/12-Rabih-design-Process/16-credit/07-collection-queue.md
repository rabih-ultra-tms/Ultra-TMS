# Collection Queue

> Service: Credit (Service 16) | Wave: Future | Priority: P2
> Route: TBD | Status: Not Started
> Primary Personas: TBD
> Roles with Access: Accounting

---

## Design Status

This screen will be designed as part of a future wave. Key design requirements to be determined.

## Screen Type
List

## Description
Overdue accounts collection queue listing all customers with past-due invoices. Shows customer name, total overdue amount, oldest invoice date, days overdue, last contact date, assigned collector, and collection status.

## Key Design Considerations
- Prioritization by amount and aging ensures collection effort focuses on highest-impact accounts
- Last contact date tracking prevents redundant collection calls and ensures consistent follow-up cadence

## Dependencies
- Service 06 - Accounting (AR aging data)
- Service 02 - CRM (customer contact info)
- Service 11 - Communication (collection call/email logging)
