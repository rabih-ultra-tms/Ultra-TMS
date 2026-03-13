# JWT Secret Rotation Runbook

> Last updated: 2026-03-13
> Validated against: auth.module.ts, auth.service.ts, portal auth services, ws-jwt.guard.ts
> See also: deployment-runbook.md, env-var-matrix.md

## Overview

Ultra TMS uses **three independent JWT secrets** across three authentication realms. Each must be rotated separately. There is currently **no dual-key support** -- rotating a secret invalidates all tokens signed with the old value.

## Secret Inventory

| Secret          | Env Var                      | Algorithm | Used By                                           | Fallback                   |
| --------------- | ---------------------------- | --------- | ------------------------------------------------- | -------------------------- |
| Main app        | `JWT_SECRET`                 | HS256     | Staff/admin login, WebSocket auth, refresh tokens | None (fatal if missing)    |
| Customer portal | `CUSTOMER_PORTAL_JWT_SECRET` | HS256     | Customer portal login + refresh                   | Falls back to `JWT_SECRET` |
| Carrier portal  | `CARRIER_PORTAL_JWT_SECRET`  | HS256     | Carrier portal login + refresh                    | Falls back to `JWT_SECRET` |

## Token Lifetimes

| Realm           | Access Token                         | Refresh Token                      | Cookie                                  |
| --------------- | ------------------------------------ | ---------------------------------- | --------------------------------------- |
| Main app        | 15 min (`JWT_ACCESS_EXPIRATION`)     | 30 days (`JWT_REFRESH_EXPIRATION`) | HttpOnly `accessToken` + `refreshToken` |
| Customer portal | 2h (hardcoded)                       | 7d (hardcoded)                     | JSON response body (no cookies)         |
| Carrier portal  | 2h (`CARRIER_PORTAL_JWT_EXPIRES_IN`) | 7d (hardcoded)                     | JSON response body (no cookies)         |

## Impact of Rotation

Rotating `JWT_SECRET` will:

1. Invalidate **all** main app access tokens (users re-login within 15 min)
2. Invalidate **all** main app refresh tokens (users must re-login, up to 30 days of sessions lost)
3. Invalidate **portal tokens** if portal-specific secrets are not set (they fall back to `JWT_SECRET`)
4. Disconnect **all WebSocket connections** (ws-jwt.guard.ts and notifications.gateway.ts verify with `JWT_SECRET`)
5. Break **EncryptionService key derivation** in dev/test if `ENCRYPTION_KEY` is not set (production should always have `ENCRYPTION_KEY`)

Rotating a portal secret will only affect that portal's users.

## When to Rotate

- **Immediately:** Secret exposed in logs, commits, or unauthorized access
- **Scheduled:** Every 90 days as a security best practice
- **On personnel change:** When a team member with secret access leaves

## Rotation Procedure

### Pre-Rotation

- [ ] Confirm `ENCRYPTION_KEY` is set independently (not derived from `JWT_SECRET`)
- [ ] Confirm portal-specific secrets are set (not falling back to `JWT_SECRET`)
- [ ] Choose a maintenance window (low-traffic period preferred)
- [ ] Generate new secret: `openssl rand -hex 64`
- [ ] Notify team of planned rotation and expected user impact

### Step 1: Generate New Secret

```bash
# Generate a cryptographically secure 64-character hex string (256 bits)
NEW_SECRET=$(openssl rand -hex 64)
echo "New secret: $NEW_SECRET"
```

### Step 2: Update Secret in Environment

```bash
# For GitHub Actions secrets:
gh secret set JWT_SECRET --body "$NEW_SECRET"

# For .env file (staging/local):
# Replace the JWT_SECRET value in your .env file

# For vault-managed secrets:
# Update via your vault provider's CLI/UI
```

### Step 3: Restart API Server

```bash
# Docker Compose
docker compose -f docker-compose.prod.yml restart api

# Or redeploy via CI/CD
gh workflow run deploy.yml -f environment=staging
```

### Step 4: Flush Redis Sessions

```bash
# Connect to Redis and flush session keys
redis-cli -u $REDIS_URL
> SCAN 0 MATCH session:* COUNT 100
> DEL session:*       # Only if you want to force all re-logins immediately
```

Note: Even without flushing Redis, old tokens will fail signature verification against the new secret. Flushing just cleans up stale session data.

### Step 5: Post-Rotation Verification

- [ ] API starts without errors (`curl /api/v1/health` returns 200)
- [ ] Login with test credentials succeeds (new tokens issued with new secret)
- [ ] Refresh token flow works (`POST /api/v1/auth/refresh`)
- [ ] WebSocket connection establishes (check browser DevTools)
- [ ] Customer portal login works (if that secret was rotated)
- [ ] Carrier portal login works (if that secret was rotated)

### Step 6: Monitor

- Watch error logs for 30 minutes for JWT verification failures
- Expect a brief spike in 401 errors as users with old tokens are forced to re-login
- Active refresh tokens will fail; users must perform a fresh login

## Portal Secret Rotation

Same procedure as above, but substitute the portal-specific env var:

```bash
# Customer portal
NEW_CPORTAL_SECRET=$(openssl rand -hex 64)
gh secret set CUSTOMER_PORTAL_JWT_SECRET --body "$NEW_CPORTAL_SECRET"

# Carrier portal
NEW_CARRIER_SECRET=$(openssl rand -hex 64)
gh secret set CARRIER_PORTAL_JWT_SECRET --body "$NEW_CARRIER_SECRET"
```

Portal sessions are stored in PostgreSQL (`PortalSession` / `CarrierPortalSession` tables), not Redis. Old session hash records will remain but be harmless -- new tokens won't match old hashes.

## Emergency Rotation (Secret Compromised)

If a secret is compromised, skip the maintenance window:

1. Generate and deploy new secret immediately (Steps 1-3 above)
2. Flush ALL Redis session data: `redis-cli -u $REDIS_URL FLUSHDB`
3. Truncate DB session tables (forces complete re-authentication):
   ```sql
   TRUNCATE TABLE "Session";
   TRUNCATE TABLE "PortalSession";
   TRUNCATE TABLE "CarrierPortalSession";
   ```
4. Monitor for unauthorized access using the compromised secret
5. File a SEV-1 security incident

## Future Improvement: Dual-Key Verification

Currently, the codebase does not support verifying tokens against both old and new secrets simultaneously. To enable zero-downtime rotation:

1. Add `JWT_SECRET_PREVIOUS` env var
2. Modify `jwt.strategy.ts` to try current secret first, fall back to previous
3. Set a TTL on the previous secret (e.g., keep for 2x access token lifetime = 30 min)
4. Same pattern for portal secrets

This is tracked as a backlog item for Phase 5 (Production Maturity).

## Files That Read JWT Secrets

| File                                                                      | Secret                       | Purpose                        |
| ------------------------------------------------------------------------- | ---------------------------- | ------------------------------ |
| `apps/api/src/main.ts`                                                    | `JWT_SECRET`                 | Required env var check         |
| `apps/api/src/modules/auth/auth.module.ts`                                | `JWT_SECRET`                 | JwtModule registration         |
| `apps/api/src/modules/auth/strategies/jwt.strategy.ts`                    | `JWT_SECRET`                 | Passport strategy verification |
| `apps/api/src/modules/auth/guards/ws-jwt.guard.ts`                        | `JWT_SECRET`                 | WebSocket auth                 |
| `apps/api/src/modules/tms/gateways/notifications.gateway.ts`              | `JWT_SECRET`                 | WS connection auth             |
| `apps/api/src/modules/integration-hub/services/encryption.service.ts`     | `JWT_SECRET`                 | Dev/test AES key derivation    |
| `apps/api/src/modules/customer-portal/customer-portal.module.ts`          | `CUSTOMER_PORTAL_JWT_SECRET` | Portal JwtModule               |
| `apps/api/src/modules/customer-portal/auth/portal-auth.service.ts`        | `CUSTOMER_PORTAL_JWT_SECRET` | Token signing/verification     |
| `apps/api/src/modules/customer-portal/guards/portal-auth.guard.ts`        | `CUSTOMER_PORTAL_JWT_SECRET` | Guard verification             |
| `apps/api/src/modules/carrier-portal/carrier-portal.module.ts`            | `CARRIER_PORTAL_JWT_SECRET`  | Portal JwtModule               |
| `apps/api/src/modules/carrier-portal/auth/carrier-portal-auth.service.ts` | `CARRIER_PORTAL_JWT_SECRET`  | Token signing/verification     |
| `apps/api/src/modules/carrier-portal/guards/carrier-portal-auth.guard.ts` | `CARRIER_PORTAL_JWT_SECRET`  | Guard verification             |
