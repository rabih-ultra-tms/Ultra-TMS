# Service 34: ELD (Electronic Logging Device)

## Service Overview
The ELD service manages electronic logging device data for Hours of Service (HOS) compliance, including driver log review, violation tracking, device management, unidentified driving event resolution, and DVIR (Driver Vehicle Inspection Report) management. It ensures FMCSA regulatory compliance for all driver operations.

## Screens

| # | Screen | Type | Priority | Status |
|---|--------|------|----------|--------|
| 1 | ELD Dashboard | dashboard | P2 | Not Started |
| 2 | Driver Logs | list | P2 | Not Started |
| 3 | Log Detail | detail | P2 | Not Started |
| 4 | Violations | list | P2 | Not Started |
| 5 | Device Management | list | P2 | Not Started |
| 6 | Unidentified Driving | list | P2 | Not Started |
| 7 | DVIR Reports | list | P2 | Not Started |
| 8 | ELD Reports | report | P2 | Not Started |

## Wave Assignment
**Wave:** Future

## Dependencies
- Driver/Carrier service for driver profiles
- Safety service for compliance scoring
- Integration Hub for ELD device provider APIs
- Document service for storing inspection reports
- Notification service for violation and compliance alerts

## Notes
- FMCSA ELD mandate compliance (49 CFR Part 395)
- Support for multiple ELD hardware providers
- Real-time HOS availability for dispatch planning
- Automated violation detection and alert system
