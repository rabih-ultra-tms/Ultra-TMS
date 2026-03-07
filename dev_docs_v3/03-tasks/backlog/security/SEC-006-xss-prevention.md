# SEC-006: Sanitize User Inputs (XSS Prevention)

**Priority:** P1
**Files:** Backend DTOs, frontend form components

## Current State
Backend uses `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true` (in `main.ts` lines 53-62), which strips unknown fields. However, there is no explicit HTML/script sanitization on string inputs. User-provided text (notes, names, addresses, custom fields) could contain malicious HTML/JavaScript that gets stored and later rendered.

Frontend uses React which auto-escapes JSX expressions, providing baseline XSS protection. However, any use of `dangerouslySetInnerHTML` or direct DOM manipulation could be vulnerable.

## Requirements
- Add input sanitization middleware or pipe for all string DTO fields
- Strip HTML tags from user inputs (or use allowlist for rich text fields)
- Validate and sanitize custom fields (JSON) stored in `customFields` columns
- Audit frontend for `dangerouslySetInnerHTML` usage
- Sanitize URL parameters used in queries
- Consider Content Security Policy headers (see SEC-008)

## Acceptance Criteria
- [ ] All string inputs sanitized before database storage
- [ ] No stored XSS possible via any user input field
- [ ] Rich text fields (if any) use sanitized HTML allowlist
- [ ] Frontend has no unescaped user content rendering
- [ ] Custom fields JSON validated and sanitized

## Dependencies
- Sanitization library (e.g., `sanitize-html`, `DOMPurify`)
- DTO decorator or global pipe

## Estimated Effort
M
