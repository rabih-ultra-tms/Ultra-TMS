# Service 25: Safety

## Service Overview
The Safety service manages all safety-related operations including incident tracking, inspections, driver safety scoring, CSA compliance, safety training, and comprehensive safety analytics. This is critical for FMCSA compliance and risk management.

## Screens

| # | Screen | Type | Priority | Status |
|---|--------|------|----------|--------|
| 1 | Safety Dashboard | dashboard | P1 | Not Started |
| 2 | Incidents List | list | P1 | Not Started |
| 3 | Incident Detail | detail | P1 | Not Started |
| 4 | Incident Report | form | P1 | Not Started |
| 5 | Safety Inspections | list | P1 | Not Started |
| 6 | Inspection Form | form | P1 | Not Started |
| 7 | Driver Safety Scores | list | P1 | Not Started |
| 8 | CSA Scores | dashboard | P1 | Not Started |
| 9 | Safety Training | list | P2 | Not Started |
| 10 | Safety Reports | report | P2 | Not Started |

## Wave Assignment
**Wave:** Future

## Dependencies
- Driver service for driver records and profiles
- Equipment service for vehicle information
- ELD service (Service 34) for HOS data
- Load service for trip-related incidents
- Document service for incident photos and reports
- Notification service for safety alerts

## Notes
- Must comply with FMCSA reporting requirements
- CSA BASIC scores integration with FMCSA data
- Real-time safety scoring based on multiple data sources
