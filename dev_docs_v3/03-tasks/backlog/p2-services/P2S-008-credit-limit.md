# P2S-008: Credit Limit Management

**Priority:** P2
**Service:** Credit
**Scope:** Manage customer credit limits and track utilization

## Current State
No credit limit management exists.

## Requirements
- Set credit limit per customer
- Track current credit utilization (outstanding invoices)
- Warning when approaching credit limit (80%, 90%, 100%)
- Block new orders when credit limit exceeded
- Credit limit approval workflow
- Credit limit history

## Acceptance Criteria
- [ ] Credit limit configurable per customer
- [ ] Current utilization calculated from outstanding invoices
- [ ] Warning at configurable thresholds
- [ ] Order blocking when limit exceeded
- [ ] Approval workflow for limit changes
- [ ] History of limit changes

## Dependencies
- P2S-007 (Credit check)
- Invoice system for utilization calculation

## Estimated Effort
M
