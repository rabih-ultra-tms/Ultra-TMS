# ACC-007: Form Error Announcements for Screen Readers

**Priority:** P2
**Service:** Frontend Accessibility
**Scope:** Announce form validation errors to screen readers

## Current State
Some forms show inline validation errors (red text below fields). These visual errors are not announced to screen readers.

## Requirements
- Use `aria-invalid="true"` on fields with errors
- Use `aria-describedby` to link error messages to fields
- Announce error summary with `aria-live="assertive"` on form submit
- Error count announcement ("3 errors found")
- Focus moves to first error field on submit

## Acceptance Criteria
- [ ] `aria-invalid` set on error fields
- [ ] `aria-describedby` links error messages
- [ ] Error summary announced on submit
- [ ] Focus moves to first error
- [ ] Tested with screen reader

## Dependencies
- UX-010 (Inline validation messages) should be done first

## Estimated Effort
S
