# DNB Integration

> Service: Credit (Service 16) | Wave: Future | Priority: P2
> Route: TBD | Status: Not Started
> Primary Personas: TBD
> Roles with Access: Accounting

---

## Design Status

This screen will be designed as part of a future wave. Key design requirements to be determined.

## Screen Type
Tool

## Description
Dun & Bradstreet credit check integration tool for pulling credit reports, PAYDEX scores, and financial stress scores for customers. Supports on-demand lookups and scheduled monitoring for existing customers.

## Key Design Considerations
- D&B report formatting must present complex credit data in a digestible format for non-credit-specialist users
- API cost management (per-lookup pricing) requires usage tracking and approval workflows for bulk checks

## Dependencies
- D&B API integration (external service)
- Service 02 - CRM (customer DUNS number for lookup)
- Service 20 - Integration Hub (API key management)
