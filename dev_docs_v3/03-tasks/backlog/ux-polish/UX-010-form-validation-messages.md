# UX-010: Form Field Validation Messages (Inline, Not Alert)

**Priority:** P1
**Service:** Frontend UX
**Scope:** Replace alert-style validation with inline field-level error messages

## Current State
Some forms use inline validation (e.g., load-history new load form shows red border + text below field). Others may use alert() or toast for validation errors. The pattern is inconsistent.

## Requirements
- All form fields show validation errors inline below the field
- Error styling: red border on field + red text message below
- Errors clear when user starts typing in the field
- Required fields marked with asterisk
- Validation runs on blur and on submit

## Acceptance Criteria
- [ ] All forms use inline validation messages
- [ ] No alert() or window.alert() for validation
- [ ] Error messages are specific (not just "Required")
- [ ] Fields highlight red on error
- [ ] Errors clear on user input
- [ ] Required fields have asterisk indicator

## Dependencies
- React Hook Form + Zod already in use

## Estimated Effort
M
