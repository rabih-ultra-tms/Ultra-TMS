# PST-34 Email Infrastructure — Per-Service Tribunal Audit

> **Date:** 2026-03-09 | **Auditor:** Claude Opus 4.6 | **Verdict:** MODIFY | **Score:** 7.5/10 (was 5.0)

---

## Hub Accuracy

| Claim | Reality | Accurate? |
|-------|---------|-----------|
| 3 files (module, service, spec) | 3 files | YES |
| 0 controllers | 0 controllers | YES |
| 1 service (SendGrid wrapper) | 1 service, 5 email methods + dev fallback | YES |
| "Used by Communication service (12)" | **Used by Auth module** (AuthService + UsersService). Communication has its OWN EmailService. | **NO** |
| "Template rendering with variable substitution" | Hardcoded inline HTML with `${var}` interpolation — no template engine | **NO** |
| "Failed sends retried via Communication resend" | Failed sends throw Error — no retry in this module, caller must handle | **MISLEADING** |
| NestJS module | `@Global()` module (hub misses @Global decorator) | PARTIAL |
| Has email.service.spec.ts | 8 tests / 112 LOC | YES (understates) |

**Hub accuracy: ~60%** — file structure correct, dependency/template claims wrong.

---

## Architecture

### Dual EmailService Discovery

| | `modules/email/` (this service) | `modules/communication/email.service.ts` |
|---|---|---|
| **Consumer** | Auth module (AuthService, UsersService) | Communication module (EmailController) |
| **SendGrid** | Direct `@sendgrid/mail` import | Via `SendGridProvider` wrapper |
| **Templates** | Hardcoded HTML | `TemplatesService` with Prisma-backed templates |
| **Prisma** | None | Full `EmailLog` tracking |
| **Tenant-aware** | No (stateless) | Yes (tenantId on all operations) |
| **Scope** | Auth emails only (invite, reset, verify, MFA, welcome) | Business emails (any template, bulk, tracking) |

Two independent email systems sharing a class name. Hub's dependency claim is fiction.

### Module Details

- **@Global() decorator** — available to all modules without explicit import
- **Registered:** `app.module.ts` line 103
- **Exports:** EmailService
- **ConfigService deps:** SENDGRID_API_KEY, SENDGRID_FROM_EMAIL, SENDGRID_FROM_NAME, APP_URL, MFA_ENABLED
- **Dev fallback:** Console-logs emails when API key is missing/placeholder

### Methods

| Method | Purpose | Lines |
|--------|---------|-------|
| `sendInvitation()` | User invitation with 72h expiry | 27-63 |
| `sendPasswordReset()` | Password reset with 1h expiry | 68-103 |
| `sendEmailVerification()` | Email verification link | 108-142 |
| `sendMfaCode()` | MFA code (gated by MFA_ENABLED) | 147-179 |
| `sendWelcomeEmail()` | Post-registration welcome | 184-212 |
| `sendEmail()` | Private — SendGrid send with dev fallback | 217-236 |

---

## Issues Found

| # | Severity | Issue | Location |
|---|----------|-------|----------|
| 1 | **P2** | MFA code logged in plaintext | email.service.ts:152 |
| 2 | **P2** | No HTML escaping on firstName/inviterName (XSS in emails) | All template methods |
| 3 | **P3** | Duplicate `EmailService` class name with Communication module | Fragile import-path dependency |
| 4 | **P3** | No email format validation | All public methods |
| 5 | **P3** | No attachment support | sendEmail() |
| 6 | **P3** | No i18n support | Hardcoded English strings |
| 7 | **INFO** | API key checked twice (constructor + sendEmail) | Lines 16, 220 |

---

## Tests

- **8 tests / 112 LOC** in `email.service.spec.ts`
- Covers: all 5 methods, MFA skip, MFA send, SendGrid failure, placeholder key bypass
- Quality: **B+** — good edge cases, missing XSS/validation tests
- Hub: "Has spec file" — accurate but understates

---

## Metrics

| Metric | Value |
|--------|-------|
| Source LOC | 246 (service 237 + module 9) |
| Test LOC | 112 |
| Total LOC | 358 |
| Controllers | 0 |
| Services | 1 |
| Prisma models | 0 |
| Endpoints | 0 |
| Tests | 8 |
| .bak | None |

---

## Action Items

1. **P2:** Remove MFA code from debug log (line 152) — log "MFA code sent" without the actual code
2. **P2:** Add HTML escaping for interpolated user data in email templates
3. **P3:** Consider renaming to `AuthEmailService` to disambiguate from Communication's EmailService
4. **P3:** Add basic email format validation
5. **DOC:** Fix hub — consumer is Auth module, not Communication
6. **DOC:** Fix hub — no template rendering system, it's inline HTML interpolation
7. **DOC:** Add @Global() to hub documentation
8. **DOC:** Document the dual EmailService architecture

---

## Verdict: MODIFY (7.5/10)

Smallest module in the entire codebase. Clean, focused, well-tested auth email sender. Hub dependency claim is wrong (says Communication, actually Auth). Two independent EmailService classes across modules is a naming hazard. MFA code plaintext logging is the only real security concern. No Prisma, no controllers, no tenant isolation needed — appropriate for stateless infrastructure.
