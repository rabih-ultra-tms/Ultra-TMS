# Load Matching

> Service: Load Board (Service 07) | Wave: Future | Priority: P1
> Route: TBD | Status: Not Started
> Primary Personas: TBD
> Roles with Access: Dispatch

---

## Design Status

This screen will be designed as part of a future wave. Key design requirements to be determined.

## Screen Type
Tool

## Description
Load-to-carrier matching tool that uses equipment type, lane preferences, carrier performance scores, availability, and proximity to suggest optimal carrier matches for posted loads.

## Key Design Considerations
- Matching algorithm must balance multiple factors (cost, performance, proximity, availability) with configurable weights
- Results ranking should be transparent so dispatchers understand why certain carriers are recommended

## Dependencies
- Service 04 - TMS Core (load details and requirements)
- Service 05 - Carrier (carrier profiles, lanes, equipment, scores)
- Service 26 - Rate Intelligence (rate benchmarks)
