# Custom Fields

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
Custom field management allowing administrators to extend entities (loads, customers, carriers, etc.) with additional fields without code changes. Supports text, number, date, dropdown, and other field types.

## Key Design Considerations
- Field type selection and validation rules need intuitive configuration UI
- Must show which entities use each custom field and handle field deprecation gracefully

## Dependencies
- Entity services for field attachment
- Form rendering engine for dynamic field display
- Search service for custom field indexing
