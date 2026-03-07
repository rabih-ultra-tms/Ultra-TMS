# TEST-011: Component Tests for Forms (LoadForm, CarrierForm)

**Priority:** P1
**Service:** Shared Components
**Scope:** Component tests for major form components

## Current State
Complex forms exist for loads (multi-stop, carrier assignment, cargo details) and carriers (company info, contacts, equipment). These forms use React Hook Form + Zod validation but have no component tests.

## Requirements
- Test form renders with correct fields
- Test validation (required fields, format validation)
- Test form submission with valid data
- Test form submission with invalid data (error messages displayed)
- Test pre-populated form (edit mode)
- Test dynamic fields (add/remove stops in load form)

## Acceptance Criteria
- [ ] LoadForm renders and validates required fields
- [ ] LoadForm tests multi-stop add/remove
- [ ] CarrierForm renders and validates
- [ ] Edit mode pre-populates form correctly
- [ ] Validation error messages appear inline
- [ ] Form submission calls correct mutation
- [ ] Tests pass in CI

## Dependencies
- None

## Estimated Effort
M
