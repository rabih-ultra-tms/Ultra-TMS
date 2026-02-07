# New Entry

> Service: Cross-Border (Service 35) | Wave: Future | Priority: P2
> Route: TBD | Status: Not Started
> Primary Personas: TBD
> Roles with Access: Operations, Compliance, Admin

---

## Design Status

This screen will be designed as part of a future wave.

## Screen Type
Form

## Description
Form for creating a new customs entry with fields for entry type, port of entry, importer/exporter details, commodity descriptions, tariff classifications, value declarations, and document uploads.

## Key Design Considerations
- Auto-population of known data from the associated load record to minimize duplicate entry
- Inline tariff classification search and validation to ensure correct HTS codes are applied

## Dependencies
- TMS Core for load data auto-population
- Tariff Lookup (Service 35, Screen 7) for tariff classification
- Document Requirements (Service 35, Screen 6) for required document checklist
- Broker Management (Service 35, Screen 5) for broker assignment
