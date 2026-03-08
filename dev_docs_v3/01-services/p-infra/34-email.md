# Service Hub: Email Infrastructure (34)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-07
> **Priority:** P3 Future (infrastructure — used by Communication service)

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | C (5/10) — infrastructure service, works internally |
| **Last Verified** | 2026-03-07 |
| **Backend** | Built — `apps/api/src/modules/email/` (1 service, 0 controllers) |
| **Frontend** | N/A — no UI, infrastructure only |
| **Tests** | Has `email.service.spec.ts` |
| **Note** | This is a low-level SendGrid wrapper. The Communication service (12) provides the user-facing API. |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Module | Built | `email.module.ts` — NestJS module |
| Service | Built | `email.service.ts` — SendGrid integration |
| Tests | Partial | `email.service.spec.ts` exists |
| Controllers | None | No REST endpoints — used internally by Communication service |

---

## 3. Files

| File | Purpose |
|------|---------|
| `apps/api/src/modules/email/email.module.ts` | Module definition |
| `apps/api/src/modules/email/email.service.ts` | SendGrid email sending |
| `apps/api/src/modules/email/email.service.spec.ts` | Unit tests |

---

## 4. Business Rules

1. **SendGrid Integration:** All outbound email routes through SendGrid API. API key configured via `SENDGRID_API_KEY` env var.
2. **Template Rendering:** Email service renders templates with variable substitution before sending via SendGrid.
3. **Error Handling:** Failed sends are logged and can be retried via the Communication service's resend endpoint.
4. **No Direct Access:** This module is injected into the Communication module — it has no REST API of its own.

---

## 5. Dependencies

**Depends on:** SendGrid API (external)

**Depended on by:** Communication service (12) — all email operations route through this module
