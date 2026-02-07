# Lookup Tables

> Service: Config (Service 23) | Wave: Future | Priority: P2
> Route: TBD | Status: Not Started
> Primary Personas: TBD
> Roles with Access: Admin

---

## Design Status

This screen will be designed as part of a future wave. Key design requirements to be determined.

## Screen Type
List

## Description
System lookup values management for maintaining dropdown options, status codes, category lists, and other reference data used throughout the application.

## Key Design Considerations
- Must support bulk import/export of lookup values for easy migration
- Deactivating a lookup value should not break existing records that reference it

## Dependencies
- All entity services that use lookup values
- Config storage for lookup data persistence
