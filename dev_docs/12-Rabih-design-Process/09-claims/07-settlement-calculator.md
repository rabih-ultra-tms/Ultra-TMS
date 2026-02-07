# Settlement Calculator

> Service: Claims (Service 09) | Wave: Future | Priority: P2
> Route: TBD | Status: Not Started
> Primary Personas: TBD
> Roles with Access: Operations

---

## Design Status

This screen will be designed as part of a future wave. Key design requirements to be determined.

## Screen Type
Tool

## Description
Settlement calculation tool for determining claim settlement amounts based on cargo value, depreciation, insurance coverage, liability limits, and carrier responsibility percentage.

## Key Design Considerations
- Must factor in Carmack Amendment liability limits and carrier insurance coverage amounts
- Calculation transparency (showing formula and inputs) is critical for settlement negotiations

## Dependencies
- Claim record within this service
- Service 05 - Carrier (carrier insurance coverage amounts)
- Service 04 - TMS Core (cargo declared value from load)
