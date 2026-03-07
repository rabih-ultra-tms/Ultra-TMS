# P1S-003: Claims Filing Workflow

**Priority:** P1
**Service:** Claims
**Scope:** Multi-step form for filing a new claim

## Current State
No claims filing workflow exists.

## Requirements
- Step 1: Select claim type and related load/order
- Step 2: Enter claim details (amount, description, incident date)
- Step 3: Upload supporting documents (photos, BOL, POD)
- Step 4: Review and submit
- Auto-populate data from related load
- Draft save capability

## Acceptance Criteria
- [ ] Multi-step form with progress indicator
- [ ] Auto-populates from related load
- [ ] Document upload works
- [ ] Draft can be saved and resumed
- [ ] Validation on each step
- [ ] Submit creates claim and redirects to detail page

## Dependencies
- P1S-001, P1S-002 (Claims pages)
- Document upload infrastructure (P1S-005)

## Estimated Effort
L
