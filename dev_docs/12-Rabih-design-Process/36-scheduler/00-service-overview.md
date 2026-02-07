# Service 36: Scheduler

## Service Overview
The Scheduler service provides resource scheduling and appointment management capabilities for the TMS platform. It handles dock appointment scheduling, driver and equipment resource calendars, capacity planning, and automated scheduling optimization to maximize operational efficiency and minimize wait times.

## Screens

| # | Screen | Type | Priority | Status |
|---|--------|------|----------|--------|
| 1 | Scheduler Dashboard | dashboard | P2 | Not Started |
| 2 | Resource Calendar | calendar | P2 | Not Started |
| 3 | Appointment Manager | list | P2 | Not Started |
| 4 | Capacity Planning | dashboard | P2 | Not Started |
| 5 | Auto-Scheduler | tool | P2 | Not Started |
| 6 | Scheduler Reports | report | P2 | Not Started |

## Wave Assignment
**Wave:** Future

## Dependencies
- TMS Core service for load and shipment scheduling
- Carrier service for driver and equipment availability
- Customer Portal for customer appointment booking
- Notification service for appointment reminders and changes
- Workflow service for scheduling approval rules

## Notes
- Dock appointment scheduling with time slot management
- Conflict detection and resolution for overlapping schedules
- Automated optimization considering constraints and priorities
- Integration with warehouse management systems
