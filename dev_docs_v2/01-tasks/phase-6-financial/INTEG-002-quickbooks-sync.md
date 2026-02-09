# INTEG-002: QuickBooks Sync Setup — REMOVED FROM MVP

> **Phase:** 6 | **Priority:** ~~P1~~ REMOVED | **Status:** REMOVED
> **Effort:** ~~L (6h)~~ REMOVED
> **Reason:** Own accounting module (ACC-001 through ACC-006) is the priority. QuickBooks/Xero integration deferred to post-MVP.
> **Revised:** v2 — Per user decision, Feb 8 2026. The 12-16h saved goes to the bug buffer.

## What Was Planned

QuickBooks Online OAuth 2.0 integration for entity sync (Customer, Carrier, Invoice, Payment).

## Why Removed

- Own accounting module is being built (ACC-001 through ACC-006)
- QuickBooks OAuth adds external dependency risk
- 12-16h freed up for bug buffer (now 42-66h total)
- Can be revisited post-MVP if needed

## Post-MVP Consideration

If re-added later:
- Requires OAuth 2.0 spike first (2h) to validate flow
- Full implementation: 12-16h
- Backend QB controller already exists
- Entity mapping: Customer, Carrier/Vendor, Invoice, Payment, Bill

---

*Original spec archived. See git history for full details.*
