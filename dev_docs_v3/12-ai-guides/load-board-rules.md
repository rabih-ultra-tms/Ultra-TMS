# Load Board Domain Rules

> AI Dev Guide | Source: `dev_docs_v3/01-services/p0-mvp/09-load-board.md`

---

## Posting Eligibility

- Only loads in PENDING or TENDERED status can be posted to external boards.
- Loads already ACCEPTED or beyond cannot be posted.
- Once a carrier accepts via Load Board, load moves to TENDERED status in TMS Core.

## External Board Priority

1. **DAT TMS** -- primary integration
2. **Truckstop.com** -- secondary
3. **Internal** -- always active regardless of external API status

## Posting Expiry

- External postings auto-expire after 72 hours if no carrier accepts.
- Dispatcher notified via dashboard alert.
- Expired postings can be re-posted with updated rate.

## Rate Visibility

- Rate shown on external boards is the **carrier rate** (cost side).
- Customer rate (revenue side) is NEVER exposed to carriers.
- Markup/margin is never visible externally.

## Carrier Offer Acceptance Flow

1. Carrier submits offer via external board.
2. Offer appears in `offers` queue.
3. Dispatcher reviews and accepts or rejects.
4. On acceptance:
   - Creates carrier assignment in TMS Core
   - Moves load to TENDERED status
   - Removes posting from boards

## Duplicate Prevention

- A load can only be posted once per board at a time.
- Re-posting requires removing existing posting first.
- Enforced at API level.

## Compliance Check on Offer Acceptance

- Same compliance validation as direct assignment:
  - Insurance valid
  - Authority active
  - Not blacklisted

## Data Sync

- External board status (DAT/Truckstop) synced every 15 minutes.
- If external API unavailable, internal posting remains active.
- External status shows "SYNC ERROR" with last known status.

## Posting Status Machine

```
ACTIVE -> EXPIRED (auto at expiresAt)
ACTIVE -> ACCEPTED (carrier offer accepted)
ACTIVE -> CANCELLED (manual removal)
EXPIRED -> ACTIVE (re-post with updated rate)
```

## Offer Status Machine

```
PENDING -> ACCEPTED (dispatcher accepts -> triggers TMS Core assignment)
PENDING -> REJECTED (dispatcher rejects)
PENDING -> WITHDRAWN (carrier withdraws)
```

## Validation Rules

| Field | Rule |
|-------|------|
| `loadId` | Load must be in PENDING or TENDERED status |
| `postedRate` | Must be positive Decimal, less than customer rate |
| `expiresAt` | Max 72 hours from posting time |
| Duplicate posting | Load cannot have active posting on same board |
| Carrier offer | Carrier must pass compliance check on acceptance |

## API Endpoints (all stubs)

| Method | Path | Status |
|--------|------|--------|
| GET | `/api/v1/load-board` | Stub |
| POST | `/api/v1/load-board/post` | Stub |
| GET | `/api/v1/load-board/postings` | Stub |
| DELETE | `/api/v1/load-board/postings/:id` | Stub |
| GET | `/api/v1/load-board/offers` | Stub |
| POST | `/api/v1/load-board/offers/:id/accept` | Stub |
| POST | `/api/v1/load-board/offers/:id/reject` | Stub |

## Critical Status

- Backend: stubs only -- no real logic implemented
- Frontend: 0% built
- External APIs (DAT, Truckstop.com) not integrated -- need API credentials
- Build ONLY after core TMS screens are done
