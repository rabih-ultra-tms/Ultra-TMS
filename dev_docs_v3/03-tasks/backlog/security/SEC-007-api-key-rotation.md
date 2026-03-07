# SEC-007: Implement API Key Rotation

**Priority:** P2
**Files:** `apps/api/src/modules/auth/`, `apps/api/src/modules/integration-hub/`

## Current State
The system uses JWT tokens for authentication. For external integrations (customer portal, carrier portal, third-party systems), API keys may be needed. The integration-hub module exists but API key management/rotation is not verified. Environment variables store sensitive keys (JWT_SECRET, SENDGRID_API_KEY, etc.) without rotation mechanism.

## Requirements
- API key generation for external integrations
- Key rotation with overlap period (old key valid for grace period)
- Key revocation (immediate invalidation)
- Key usage tracking (last used, request count)
- Per-key rate limiting and scope restrictions
- Key expiry dates with renewal flow
- Audit trail for key creation/rotation/revocation
- Secure key display (show only on creation, hash for storage)

## Acceptance Criteria
- [ ] API keys can be generated, rotated, and revoked
- [ ] Old keys remain valid during rotation grace period
- [ ] Key usage tracked and auditable
- [ ] Per-key scope restrictions enforced
- [ ] Keys stored as hashes (not plaintext)
- [ ] Rotation workflow documented

## Dependencies
- Auth module
- Integration-hub module
- Database schema for API keys

## Estimated Effort
L
