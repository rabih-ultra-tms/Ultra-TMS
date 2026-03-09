# Service Hub: Email Infrastructure (34)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-09 (PST-34 tribunal)
> **Priority:** P-Infra (infrastructure — auth email sender)
> **Tribunal file:** `dev_docs_v3/05-audit/tribunal/per-service/PST-34-email.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | B (7.5/10) |
| **Confidence** | High — code-verified via PST-34 tribunal |
| **Last Verified** | 2026-03-09 |
| **Backend** | Built — `apps/api/src/modules/email/` (1 service, 0 controllers) |
| **Frontend** | N/A — no UI, infrastructure only |
| **Tests** | 8 tests / 112 LOC in `email.service.spec.ts` — B+ quality |
| **Priority** | P2 — fix MFA plaintext logging, add HTML escaping |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Module | Built | `email.module.ts` — **@Global()** NestJS module (available to all modules without explicit import) |
| Service | Built | `email.service.ts` — SendGrid integration, 5 public methods |
| Tests | Built | `email.service.spec.ts` — 8 tests, covers all methods + edge cases |
| Controllers | None | No REST endpoints — used internally by Auth module |

---

## 3. Files

| File | Purpose | LOC |
|------|---------|-----|
| `apps/api/src/modules/email/email.module.ts` | @Global() module definition | 9 |
| `apps/api/src/modules/email/email.service.ts` | SendGrid email sending (5 public + 1 private method) | 237 |
| `apps/api/src/modules/email/email.service.spec.ts` | Unit tests (8 tests) | 112 |

**Total:** 358 LOC (246 source + 112 test)

---

## 4. API Endpoints

None — this is an infrastructure module with no REST controllers.

---

## 5. Methods

| Method | Purpose | Lines |
|--------|---------|-------|
| `sendInvitation()` | User invitation with 72h expiry | 27-63 |
| `sendPasswordReset()` | Password reset with 1h expiry | 68-103 |
| `sendEmailVerification()` | Email verification link | 108-142 |
| `sendMfaCode()` | MFA code (gated by MFA_ENABLED config) | 147-179 |
| `sendWelcomeEmail()` | Post-registration welcome | 184-212 |
| `sendEmail()` | Private — SendGrid send with dev fallback | 217-236 |

---

## 6. Business Rules

1. **SendGrid Integration:** All outbound auth email routes through SendGrid API. API key configured via `SENDGRID_API_KEY` env var.
2. **Inline HTML Templates:** Email bodies are hardcoded HTML with `${variable}` interpolation — there is NO template engine or template rendering system.
3. **Dev Fallback:** When `SENDGRID_API_KEY` is missing or set to a placeholder value, emails are console-logged instead of sent. Allows local development without SendGrid credentials.
4. **Error Handling:** Failed sends throw an Error — no retry logic in this module. The caller (Auth module) must handle failures.
5. **MFA Gating:** `sendMfaCode()` checks `MFA_ENABLED` config before sending.
6. **No Direct Access:** This module is @Global() and injected where needed — it has no REST API of its own.

---

## 7. Dual EmailService Architecture

**IMPORTANT:** Two independent `EmailService` classes exist in the codebase sharing the same class name:

| | `modules/email/` (this service) | `modules/communication/email.service.ts` |
|---|---|---|
| **Consumer** | Auth module (AuthService, UsersService) | Communication module (EmailController) |
| **SendGrid** | Direct `@sendgrid/mail` import | Via `SendGridProvider` wrapper |
| **Templates** | Hardcoded inline HTML | `TemplatesService` with Prisma-backed templates |
| **Prisma** | None | Full `EmailLog` tracking |
| **Tenant-aware** | No (stateless) | Yes (tenantId on all operations) |
| **Scope** | Auth emails only (invite, reset, verify, MFA, welcome) | Business emails (any template, bulk, tracking) |

These are completely separate systems. Import path determines which EmailService is used.

---

## 8. Data Model

None — this module uses no Prisma models. It is stateless infrastructure.

---

## 9. Validation Rules

No input validation on email addresses or user data. All public methods accept raw strings and interpolate them directly into HTML.

---

## 10. Configuration

| Config Key | Purpose |
|------------|---------|
| `SENDGRID_API_KEY` | SendGrid API authentication |
| `SENDGRID_FROM_EMAIL` | Sender email address |
| `SENDGRID_FROM_NAME` | Sender display name |
| `APP_URL` | Base URL for links in email bodies |
| `MFA_ENABLED` | Gates MFA code sending |

Registered in `app.module.ts` line 103.

---

## 11. Known Issues

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| MFA code logged in plaintext | **P2** | Open | `email.service.ts:152` — log "MFA code sent" without the actual code |
| No HTML escaping on interpolated user data | **P2** | Open | firstName/inviterName injected raw — XSS risk in email clients |
| Duplicate `EmailService` class name | P3 | Open | Fragile import-path dependency with Communication module |
| No email format validation | P3 | Open | All public methods accept any string |
| No attachment support | P3 | Open | `sendEmail()` only sends HTML body |
| No i18n support | P3 | Open | Hardcoded English strings in all templates |
| API key checked twice | INFO | Open | Constructor (line 16) and sendEmail (line 220) — redundant but harmless |

---

## 12. Tasks

### Open (from PST-34 tribunal findings)

| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| EMAIL-001 | Remove MFA code from debug log (line 152) | XS (5min) | P2 |
| EMAIL-002 | Add HTML escaping for interpolated user data | S (1h) | P2 |
| EMAIL-003 | Consider renaming to `AuthEmailService` to disambiguate | S (30min) | P3 |
| EMAIL-004 | Add basic email format validation | S (30min) | P3 |

---

## 13. Tests

- **8 tests / 112 LOC** in `email.service.spec.ts`
- **Covers:** all 5 public methods, MFA skip when disabled, MFA send when enabled, SendGrid failure handling, placeholder key bypass (dev fallback)
- **Quality:** B+ — good edge cases, missing XSS/validation tests
- **Coverage gaps:** No tests for HTML injection, no tests for invalid email addresses

---

## 14. Delta vs Original Plan

| Original Plan | Actual | Delta |
|--------------|--------|-------|
| Hub said "Used by Communication service (12)" | Actually used by Auth module (AuthService, UsersService) | Dependency was wrong |
| Hub said "Template rendering with variable substitution" | Hardcoded inline HTML with `${var}` interpolation — no template engine | Feature overstated |
| Hub said "Failed sends retried via Communication resend" | Failed sends throw Error — no retry, caller must handle | Misleading claim |
| Hub said "NestJS module" | `@Global()` NestJS module — available everywhere without import | Missed @Global() decorator |
| Hub said "Has email.service.spec.ts" | 8 tests / 112 LOC, B+ quality coverage | Understated test quality |
| Hub rated 5/10 | Verified 7.5/10 by PST-34 tribunal | Hub was inaccurate |

---

## 15. Dependencies

**Depends on:**

- SendGrid API (external) — email delivery
- ConfigService (NestJS) — SENDGRID_API_KEY, SENDGRID_FROM_EMAIL, SENDGRID_FROM_NAME, APP_URL, MFA_ENABLED

**Depended on by:**

- Auth module (AuthService, UsersService) — user invitation, password reset, email verification, MFA codes, welcome emails

**NOT depended on by:**

- Communication service (12) — has its own separate `EmailService` with Prisma-backed templates
