# P1S-025: CSA Scores Viewer

**Priority:** P1
**Service:** Safety
**Scope:** Display FMCSA CSA (Compliance, Safety, Accountability) scores for carriers

## Current State
FMCSA compliance log model exists in Prisma. The carrier service has compliance-related queries. No UI exists for viewing CSA scores.

## Requirements
- CSA score display per carrier (7 BASIC categories)
- Score history chart (trend over time)
- Alert thresholds (intervention, investigation levels)
- Comparison across carriers
- Link to FMCSA SAFER system for verification
- Auto-refresh from FMCSA data source (if API available)

## Acceptance Criteria
- [ ] CSA scores displayed for each carrier
- [ ] 7 BASIC categories shown (Unsafe Driving, HOS, Vehicle Maintenance, etc.)
- [ ] Score trend chart
- [ ] Threshold alerts (red/yellow/green)
- [ ] Carrier comparison view
- [ ] Link to FMCSA SAFER system

## Dependencies
- FMCSA data integration
- Carrier detail page

## Estimated Effort
M
