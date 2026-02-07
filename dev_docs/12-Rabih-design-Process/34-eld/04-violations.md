# Violations

> Service: ELD (Service 34) | Wave: Future | Priority: P2
> Route: TBD | Status: Not Started
> Primary Personas: TBD
> Roles with Access: Safety, Admin

---

## Design Status

This screen will be designed as part of a future wave.

## Screen Type
List

## Description
List of HOS violations detected across the fleet, showing violation type (11-hour, 14-hour, 30-minute break, 60/70-hour), driver, date, severity, and resolution status.

## Key Design Considerations
- Violation categorization by FMCSA rule type with severity scoring for prioritized review
- Resolution tracking workflow with corrective action documentation and driver acknowledgment

## Dependencies
- Driver Logs (Service 34, Screen 2) for violation source data
- Safety service for violation scoring and compliance tracking
- Notification service for violation alerts to drivers and managers
