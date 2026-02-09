# COMM-001: 5 Automated Emails

> **Phase:** 5 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** L (8-12h)
> **Assigned:** Unassigned
> **Added:** v2 — Logistics expert review ("A TMS without automated communications is like email where you call people to check their inbox")

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/03-services/04-tms-core.md` — TMS Core hub
3. `apps/api/src/modules/communication/` — Email/SMS services, templates, notification controller

## Objective

Implement 5 critical automated emails that fire on workflow triggers. These are NOT a full Communication Hub — they are event-driven emails baked into the existing load lifecycle. Backend has `CommunicationLog`, `CommunicationTemplate`, and email/SMS services.

**The 5 emails:**
1. **Rate Confirmation** — sent to carrier when load is dispatched (with PDF attachment)
2. **Load Tendered** — sent to carrier when load is tendered (load details, accept/reject)
3. **Pickup Reminder** — sent to carrier 24h before pickup window
4. **Delivery Confirmation** — sent to customer when POD is uploaded
5. **Invoice Sent** — sent to customer when invoice is created (with PDF attachment)

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/components/tms/emails/email-preview-dialog.tsx` | Preview email before sending (optional manual trigger) |
| CREATE | `apps/web/lib/hooks/communication/use-send-email.ts` | Hook to trigger email via API |
| MODIFY | Load dispatch flow | After carrier assignment → trigger rate con email |
| MODIFY | Load tender flow | After tender created → trigger tender notification |
| MODIFY | Document upload flow | After POD uploaded → trigger delivery confirmation |
| MODIFY | Invoice creation flow | After invoice created → trigger invoice email |

**Note:** Most of the email sending logic lives in the backend. Frontend work is primarily:
- Adding "Send Rate Con" / "Send Invoice" buttons on relevant detail pages
- Email preview dialogs
- Notification toasts confirming email was sent
- Configuring the backend scheduler for the 24h pickup reminder (may be backend-only)

## Acceptance Criteria

- [ ] Rate Confirmation email fires when load status changes to DISPATCHED
- [ ] Rate Confirmation includes PDF attachment generated from load data
- [ ] Load Tendered email fires when load is tendered to carrier
- [ ] Pickup Reminder fires 24h before pickup window (backend scheduler task)
- [ ] Delivery Confirmation fires when POD document is uploaded on a delivered load
- [ ] Invoice email fires when invoice is created, includes invoice PDF
- [ ] Manual "Send Email" button on Load Detail and Invoice Detail as fallback
- [ ] Email preview dialog shows recipient, subject, body before manual send
- [ ] Success/failure toast after each email
- [ ] Email log visible on Load Detail timeline (from CommunicationLog)
- [ ] TypeScript compiles, lint passes

## Dependencies

- Blocked by: TMS-004 (Load Detail), TMS-014 (Rate Con PDF), DOC-001 (Document upload), ACC-002 (Invoices)
- Blocks: None
- Backend: Email sending service must be configured (SendGrid/SMTP)

## Reference

- Hub: `dev_docs_v2/03-services/04-tms-core.md` → Communications section
- Backend: `POST /api/v1/communication/send`, CommunicationTemplate model
- Expert recommendation: Section 3.5 (Automated Notifications), Section 11.3 item 3
