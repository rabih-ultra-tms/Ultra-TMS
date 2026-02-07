# Scheduled Reports

> Service: Analytics (Service 18) | Wave: Future | Priority: P2
> Route: TBD | Status: Not Started
> Primary Personas: TBD
> Roles with Access: Admin

---

## Design Status

This screen will be designed as part of a future wave. Key design requirements to be determined.

## Screen Type
List

## Description
Auto-generated reports list showing all scheduled report configurations with report name, schedule (daily, weekly, monthly), recipients, format (PDF, Excel), last run date, next run date, and status.

## Key Design Considerations
- Schedule configuration must support complex recurrence patterns (e.g., first Monday of month)
- Delivery failure tracking and retry mechanism ensures reports reach recipients

## Dependencies
- Custom reports and standard reports within this service
- Service 11 - Communication (report delivery via email)
