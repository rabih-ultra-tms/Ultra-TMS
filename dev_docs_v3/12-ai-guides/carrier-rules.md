# Carrier Domain Rules

> AI Dev Guide | Source: `dev_docs_v3/01-services/p0-mvp/06-carriers.md`

---

## Carrier Status Machine

```
PENDING -> ACTIVE (all onboarding requirements met)
ACTIVE -> INACTIVE (voluntary, admin action)
ACTIVE -> SUSPENDED (auto: insurance expired; or manual with reason)
ACTIVE -> BLACKLISTED (admin only, requires reason)
INACTIVE -> ACTIVE (admin reactivate)
SUSPENDED -> ACTIVE (insurance renewed + admin confirmation)
BLACKLISTED -> ACTIVE (ADMIN only, with documented reason)
```

- BLACKLISTED is permanent in spirit -- can only be unset by ADMIN with written reason.
- BLACKLISTED carriers cannot be assigned loads under any circumstances.

## Carrier Onboarding Requirements

A carrier cannot be set to ACTIVE until ALL conditions are met:
1. Valid MC# or DOT# is provided
2. FMCSA authority is AUTHORIZED
3. Auto liability insurance >= $750,000 is on file
4. Cargo insurance >= $100,000 is on file

## Insurance Status Machine

```
ACTIVE -> EXPIRING_SOON (30 days before expiry, auto)
EXPIRING_SOON -> EXPIRED (on expiry date, auto)
EXPIRED -> ACTIVE (new certificate uploaded + verified)
```

- 30-day warning: system flags insurance and emails carrier contact.
- On expiry date: carrier status auto-changes to SUSPENDED.
- Loads cannot be assigned to SUSPENDED carriers.

## FMCSA Integration

- Auto-verifies MC#/DOT# on carrier creation via `POST /carriers/fmcsa/lookup`.
- If FMCSA returns invalid or INACTIVE authority, carrier cannot progress past PENDING.
- FMCSA data cached for 24 hours.
- CSA scores fetched for compliance. Violations in last 12 months trigger compliance warning.

## Performance Scoring

```
Score = (On-time delivery * 40%) + (Claims ratio inverse * 30%) +
        (Check call compliance * 20%) + (Service quality * 10%)
```

| Tier | Score Range |
|------|-------------|
| PREFERRED | >= 85 |
| APPROVED | >= 70 |
| CONDITIONAL | >= 50 |
| SUSPENDED | < 50 |

## Preferred Carrier Program

- PREFERRED carriers appear at top of carrier selection lists in Load Planner and Dispatch Board.
- Requires: manual admin toggle AND performance score >= 85.

## Soft Delete

- All carrier records use soft delete.
- Deleted carriers still appear in load history (audit purposes).
- Excluded from active lists and cannot be assigned to new loads.

## Validation Rules

| Field | Rule |
|-------|------|
| `mcNumber` | Optional, 1-10 digits, unique per tenant |
| `dotNumber` | Optional, 1-8 digits, unique per tenant |
| MC or DOT | At least one must be provided |
| Insurance `coverageAmount` | Min $750,000 auto liability, $100,000 cargo |
| Insurance `expiresAt` | Must be future date |

## API Endpoints (40 total, all Production)

- Carriers CRUD: 9 endpoints (list, create, detail, update, delete, status, search, preferred)
- Contacts: 5 endpoints (CRUD per carrier)
- Documents: 5 endpoints (upload, approve, reject)
- Drivers: 5 endpoints (CRUD per carrier)
- Insurance: 4 endpoints (CRUD per carrier)
- Performance: 1 endpoint (scorecard data)
- Load History: 1 endpoint (per carrier)
- Compliance: 2 endpoints (issues, expiring insurance)
- FMCSA: 1 endpoint (lookup)

## PROTECTED: Truck Types

**DO NOT MODIFY** `apps/web/app/(dashboard)/truck-types/page.tsx` -- 8/10 quality, gold standard CRUD.
