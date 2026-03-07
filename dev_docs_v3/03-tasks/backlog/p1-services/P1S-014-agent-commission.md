# P1S-014: Agent Commission Tracking

**Priority:** P1
**Service:** Agents
**Scope:** Track and calculate agent commissions on loads

## Current State
No commission tracking system exists.

## Requirements
- Commission calculation based on configurable rules (% of revenue, flat fee, tiered)
- Commission ledger showing earned, pending, paid commissions
- Commission statements generation
- Approval workflow for commission payouts
- Integration with accounting (settlements)

## Acceptance Criteria
- [ ] Commission rules configurable per agent
- [ ] Automatic commission calculation on load completion
- [ ] Commission ledger with earned/pending/paid columns
- [ ] Commission statements exportable
- [ ] Approval workflow for payouts
- [ ] Integration with settlement system

## Dependencies
- P1S-013 (Agent user management)
- Accounting service (invoices/settlements)

## Estimated Effort
L
