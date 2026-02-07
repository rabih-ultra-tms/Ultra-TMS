# Load Board

> Service: Load Board (Service 07) | Wave: Future | Priority: P1
> Route: TBD | Status: Not Started
> Primary Personas: TBD
> Roles with Access: Dispatch

---

## Design Status

This screen will be designed as part of a future wave. Key design requirements to be determined.

## Screen Type
Board

## Description
Available loads board displaying all unassigned loads in a visual board format with filtering by lane, equipment type, date, and weight. Supports drag-and-drop carrier assignment and quick-action dispatching.

## Key Design Considerations
- Board view must handle hundreds of loads without performance degradation; virtual scrolling likely needed
- Real-time updates are critical as loads are claimed/assigned by multiple dispatchers simultaneously

## Dependencies
- Service 04 - TMS Core (load data)
- Service 05 - Carrier (carrier availability for matching)
