# Service 31: Load Board (External)

## Service Overview
The External Load Board service manages connections to third-party load boards such as DAT, Truckstop, and 123Loadboard. It enables posting available loads to external boards, searching for capacity, checking market rates, and managing responses from carriers who find loads through these platforms.

## Screens

| # | Screen | Type | Priority | Status |
|---|--------|------|----------|--------|
| 1 | External Board Dashboard | dashboard | P2 | Not Started |
| 2 | Board Connections | list | P2 | Not Started |
| 3 | Board Setup | form | P2 | Not Started |
| 4 | Posted Loads | list | P2 | Not Started |
| 5 | Board Search | search | P2 | Not Started |
| 6 | Rate Check | tool | P2 | Not Started |
| 7 | Board Responses | list | P2 | Not Started |
| 8 | Board Reports | report | P2 | Not Started |

## Wave Assignment
**Wave:** Future

## Dependencies
- TMS Core service for load data
- Carrier service for carrier matching
- Integration Hub for API connections to external boards
- Rate Intelligence for market rate comparisons
- Notification service for response alerts

## Notes
- Integration with major load boards (DAT, Truckstop, 123Loadboard)
- Automated load posting based on configurable rules
- Market rate intelligence from aggregated board data
