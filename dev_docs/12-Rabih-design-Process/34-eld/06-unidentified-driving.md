# Unidentified Driving

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
List of unidentified driving events recorded by ELD devices where no driver was logged in, showing event details, vehicle, duration, distance, and assignment workflow for resolution.

## Key Design Considerations
- Driver assignment workflow allowing managers to assign unidentified events to the responsible driver
- Aging indicators highlighting events approaching FMCSA's required resolution timeframe

## Dependencies
- ELD device data for unidentified driving events
- Driver/Carrier service for driver assignment
- Driver Logs (Service 34, Screen 2) for log integration after assignment
