# Service 24: EDI

## Service Overview
The EDI (Electronic Data Interchange) service manages electronic document exchange with trading partners using industry-standard formats (EDI 204, 210, 214, etc.). It includes partner management, transaction processing, field mapping, error handling, and analytics.

## Screens

| # | Screen | Type | Priority | Status |
|---|--------|------|----------|--------|
| 1 | EDI Dashboard | dashboard | P1 | Not Started |
| 2 | Trading Partners | list | P1 | Not Started |
| 3 | Partner Setup | form | P1 | Not Started |
| 4 | Transaction Sets | list | P1 | Not Started |
| 5 | Transaction Viewer | detail | P1 | Not Started |
| 6 | Map Editor | form | P2 | Not Started |
| 7 | EDI Errors | list | P1 | Not Started |
| 8 | EDI Reports | report | P2 | Not Started |

## Wave Assignment
**Wave:** Future

## Dependencies
- Customer service for shipper EDI connections
- Carrier service for carrier EDI connections
- Load service for load tender/status exchange
- Billing service for invoice EDI exchange
- File storage for EDI document archival

## Notes
- Must support common TMS EDI transaction sets (204, 210, 214, 990, 997)
- AS2, SFTP, and API-based transmission methods
- Real-time processing with error alerting
