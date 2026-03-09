# Environment Variable Matrix

> Auto-discovered from codebase scan (2026-03-09)
> Sources: `process.env.*` references, `configService.get()` calls, `main.ts`, `docker-compose.yml`, `.env.example`

---

## Required Variables (app will not start without these)

Enforced in `apps/api/src/main.ts` lines 11-25 — missing any of these causes `process.exit(1)`.

| Variable | Default | Used By | Description | Secret? |
|----------|---------|---------|-------------|---------|
| `DATABASE_URL` | None | Prisma | PostgreSQL connection string. Format: `postgresql://user:pass@host:5432/dbname` | Yes |
| `JWT_SECRET` | None | AuthModule, JwtStrategy | JWT signing key. Minimum 256-bit (32 chars). Used for all internal user tokens. | Yes |
| `REDIS_URL` | `redis://localhost:6379` | RedisService | Redis connection string. Fallback exists in code but `main.ts` requires it. | Yes |

**Location of enforcement:** `apps/api/src/main.ts` lines 11, 19-25

---

## Portal Authentication Variables

These are checked at runtime when portal modules handle requests. The app starts without them but portal auth will fail.

| Variable | Default | Used By | Description | Secret? |
|----------|---------|---------|-------------|---------|
| `CUSTOMER_PORTAL_JWT_SECRET` | Falls back to `JWT_SECRET` | CustomerPortalModule | Separate JWT secret for customer portal tokens. | Yes |
| `CARRIER_PORTAL_JWT_SECRET` | Falls back to `JWT_SECRET` | CarrierPortalModule | Separate JWT secret for carrier portal tokens. | Yes |
| `PORTAL_JWT_SECRET` | Falls back to `JWT_SECRET` | CustomerPortalModule (module registration) | Used in `customer-portal.module.ts` JwtModule.register(). | Yes |
| `PORTAL_JWT_EXPIRES_IN` | `1h` | CustomerPortalModule | Customer portal token expiration. | No |
| `CARRIER_PORTAL_JWT_EXPIRES_IN` | `2h` | CarrierPortalModule | Carrier portal token expiration. | No |

### BUG: Customer Portal JWT Secret Inconsistency

The Customer Portal has a naming inconsistency between the module and guard:

| File | Variable Used | Fallback |
|------|--------------|----------|
| `customer-portal.module.ts` line 25 | `PORTAL_JWT_SECRET` | `JWT_SECRET` |
| `auth/portal-auth.service.ts` lines 25, 32, 87 | `PORTAL_JWT_SECRET` | `JWT_SECRET` |
| `guards/portal-auth.guard.ts` line 24 | `CUSTOMER_PORTAL_JWT_SECRET` | None (throws 401) |

**Impact:** If you set `PORTAL_JWT_SECRET` but NOT `CUSTOMER_PORTAL_JWT_SECRET`, the module signs tokens with one secret but the guard validates with a different (or undefined) secret. All portal requests will get 401 Unauthorized.

**Fix:** Either rename all references to use one consistent variable name, or ensure both are set to the same value. The Carrier Portal does NOT have this bug (consistent `CARRIER_PORTAL_JWT_SECRET` everywhere).

---

## Auth & Security Variables

| Variable | Default | Used By | Description | Secret? |
|----------|---------|---------|-------------|---------|
| `JWT_ACCESS_EXPIRATION` | `15m` | AuthService, AuthModule | Access token lifetime. | No |
| `JWT_REFRESH_EXPIRATION` | `30d` | AuthService | Refresh token lifetime. | No |
| `MAX_LOGIN_ATTEMPTS` | `5` | AuthService | Failed login attempts before lockout. | No |
| `ACCOUNT_LOCKOUT_DURATION` | `15m` | AuthService | Duration of account lockout after max attempts. | No |
| `PASSWORD_RESET_EXPIRATION` | `1h` | AuthService | Password reset token lifetime. | No |
| `MFA_ENABLED` | `false` (implicit) | MfaService, EmailService | Enable multi-factor authentication. Set to `true` to activate. | No |
| `ALLOW_TEST_AUTH` | `false` (implicit) | JwtAuthGuard | Bypass auth in test environment. Only works when `NODE_ENV=test`. | No |

**Locations:**
- `apps/api/src/modules/auth/auth.service.ts` lines 45, 48, 469, 476, 554
- `apps/api/src/modules/auth/mfa.service.ts` line 21
- `apps/api/src/modules/auth/guards/jwt-auth.guard.ts` line 24

---

## Email (SendGrid) Variables

| Variable | Default | Used By | Description | Secret? |
|----------|---------|---------|-------------|---------|
| `SENDGRID_API_KEY` | None (emails silently skip) | EmailService, SendGridProvider | SendGrid API key for sending emails. | Yes |
| `SENDGRID_FROM_EMAIL` | `noreply@ultra-tms.local` | EmailService, SendGridProvider | Sender email address. | No |
| `SENDGRID_FROM_NAME` | `Ultra-TMS` | EmailService, SendGridProvider | Sender display name. | No |

**Locations:**
- `apps/api/src/modules/email/email.service.ts` lines 12-14, 218
- `apps/api/src/modules/communication/providers/sendgrid.provider.ts` lines 40, 42, 45

**Note:** Both `EmailModule` (global, infrastructure) and `CommunicationModule` (feature) have separate SendGrid integrations. The EmailModule handles system emails (password reset, invitations, MFA codes). The CommunicationModule handles user-triggered emails (templates, campaigns).

---

## SMS (Twilio) Variables

| Variable | Default | Used By | Description | Secret? |
|----------|---------|---------|-------------|---------|
| `TWILIO_ACCOUNT_SID` | None (SMS disabled) | TwilioProvider | Twilio account SID. | Yes |
| `TWILIO_AUTH_TOKEN` | None | TwilioProvider | Twilio auth token. | Yes |
| `TWILIO_PHONE_NUMBER` | None | TwilioProvider | Twilio sender phone number. | No |

**Location:** `apps/api/src/modules/communication/providers/twilio.provider.ts` lines 40-43

---

## Elasticsearch Variables

| Variable | Default | Used By | Description | Secret? |
|----------|---------|---------|-------------|---------|
| `ELASTIC_NODE` | `http://localhost:9200` | ElasticsearchService | Elasticsearch node URL. | No |
| `ELASTIC_NAME_PREFIX` | `ultra` | ElasticsearchService | Index name prefix (e.g., `ultra_loads`, `ultra_carriers`). | No |
| `ELASTIC_MAX_RETRIES` | `3` | ElasticsearchService | Max retries on failed ES requests. | No |
| `ELASTIC_REQUEST_TIMEOUT` | `10000` | ElasticsearchService | Request timeout in milliseconds. | No |
| `ELASTIC_USE_COMPAT_HEADERS` | `false` (implicit) | ElasticsearchService | Enable compatibility headers for older ES versions. | No |

**Location:** `apps/api/src/modules/search/elasticsearch/elasticsearch.service.ts` lines 13-18

---

## Storage Variables

| Variable | Default | Used By | Description | Secret? |
|----------|---------|---------|-------------|---------|
| `STORAGE_DRIVER` | `local` | StorageModule | Storage backend: `local` or `s3` (S3 not yet implemented). | No |
| `STORAGE_LOCAL_PATH` | `./uploads` | LocalStorageService | Local filesystem path for file storage. | No |
| `STORAGE_PUBLIC_URL` | `http://localhost:3001/uploads` | LocalStorageService | Public URL prefix for serving stored files. | No |
| `S3_BUCKET` | `ultra-tms-documents` | documents.bak (legacy) | S3 bucket name. Used in legacy Documents module only. | No |

**Locations:**
- `apps/api/src/modules/storage/storage.module.ts` line 15
- `apps/api/src/modules/storage/local-storage.service.ts` lines 14-15

---

## Integration & Encryption Variables

| Variable | Default | Used By | Description | Secret? |
|----------|---------|---------|-------------|---------|
| `ENCRYPTION_KEY` | None (derives from JWT_SECRET) | EncryptionService | AES-256 encryption key (hex). Used for encrypting integration credentials. | Yes |
| `APP_URL` | `http://localhost:3000` | EmailService, TemplatesService, documents.bak | Base URL for links in emails (password reset, invitations, verification). | No |

**Locations:**
- `apps/api/src/modules/integration-hub/services/encryption.service.ts` lines 53, 59-60
- `apps/api/src/modules/email/email.service.ts` lines 33, 73, 113, 199
- `apps/api/src/modules/communication/templates.service.ts` line 324

---

## Application Variables

| Variable | Default | Used By | Description | Secret? |
|----------|---------|---------|-------------|---------|
| `NODE_ENV` | None | Multiple | Environment: `development`, `production`, `test`. | No |
| `PORT` | `3001` | main.ts | API server port. | No |

**Locations:**
- `apps/api/src/main.ts` lines 37, 73
- `apps/api/src/app.module.ts` line 60
- `apps/api/src/modules/auth/auth.service.ts` line 141

---

## Docker Compose Defaults (Local Development)

These defaults are set in `docker-compose.yml` and can be overridden via environment variables or `.env` file.

| Variable | Docker Compose Default | Description |
|----------|----------------------|-------------|
| `DB_USER` | `postgres` | PostgreSQL username |
| `DB_PASSWORD` | `postgres` | PostgreSQL password |
| `DB_NAME` | `ultra_tms` | PostgreSQL database name |
| `REDIS_PASSWORD` | `redis_password` | Redis auth password |

**Note:** The `REDIS_URL` used by the app must include the password: `redis://:redis_password@localhost:6379`

---

## Production vs Development

| Variable | Development Value | Production Value | Notes |
|----------|------------------|-----------------|-------|
| `NODE_ENV` | `development` | `production` | Controls: static asset serving, Swagger visibility, debug logging |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/tms_dev` | Managed RDS connection string | Use connection pooling (PgBouncer) in production |
| `JWT_SECRET` | Any dev string (32+ chars) | Cryptographically random 64-char hex | Rotate quarterly |
| `REDIS_URL` | `redis://:redis_password@localhost:6379` | ElastiCache endpoint with TLS | Use `rediss://` (TLS) in production |
| `CORS origins` | `localhost:3000, localhost:3002` (hardcoded) | Production domain(s) | **Currently hardcoded in main.ts** — QS-007 will fix |
| `SENDGRID_API_KEY` | Empty (emails skip) | Real API key | Required for email notifications |
| `STORAGE_DRIVER` | `local` | `s3` (when implemented) | Local storage not suitable for production |
| `STORAGE_PUBLIC_URL` | `http://localhost:3001/uploads` | S3/CloudFront URL | Must be HTTPS in production |
| `APP_URL` | `http://localhost:3000` | `https://app.yourdomain.com` | Used in email links |
| `ELASTIC_NODE` | `http://localhost:9200` | ES endpoint (if used) | Can be omitted if deferring ES |

---

## Complete Variable Inventory (Alphabetical)

| # | Variable | Required | Secret | Source File(s) |
|---|----------|----------|--------|---------------|
| 1 | `ACCOUNT_LOCKOUT_DURATION` | No | No | auth.service.ts |
| 2 | `ALLOW_TEST_AUTH` | No | No | jwt-auth.guard.ts |
| 3 | `APP_URL` | No | No | email.service.ts, templates.service.ts |
| 4 | `CARRIER_PORTAL_JWT_EXPIRES_IN` | No | No | carrier-portal.module.ts |
| 5 | `CARRIER_PORTAL_JWT_SECRET` | Portal | Yes | carrier-portal.module.ts, auth service, guard |
| 6 | `CUSTOMER_PORTAL_JWT_SECRET` | Portal | Yes | portal-auth.guard.ts (BUG: inconsistent with PORTAL_JWT_SECRET) |
| 7 | `DATABASE_URL` | **Yes** | Yes | Prisma |
| 8 | `DB_NAME` | Docker | No | docker-compose.yml |
| 9 | `DB_PASSWORD` | Docker | Yes | docker-compose.yml |
| 10 | `DB_USER` | Docker | No | docker-compose.yml |
| 11 | `ELASTIC_MAX_RETRIES` | No | No | elasticsearch.service.ts |
| 12 | `ELASTIC_NAME_PREFIX` | No | No | elasticsearch.service.ts |
| 13 | `ELASTIC_NODE` | No | No | elasticsearch.service.ts |
| 14 | `ELASTIC_REQUEST_TIMEOUT` | No | No | elasticsearch.service.ts |
| 15 | `ELASTIC_USE_COMPAT_HEADERS` | No | No | elasticsearch.service.ts |
| 16 | `ENCRYPTION_KEY` | No | Yes | encryption.service.ts |
| 17 | `JWT_ACCESS_EXPIRATION` | No | No | auth.service.ts, auth.module.ts |
| 18 | `JWT_REFRESH_EXPIRATION` | No | No | auth.service.ts |
| 19 | `JWT_SECRET` | **Yes** | Yes | auth.module.ts, jwt.strategy.ts, main.ts |
| 20 | `MAX_LOGIN_ATTEMPTS` | No | No | auth.service.ts |
| 21 | `MFA_ENABLED` | No | No | mfa.service.ts, email.service.ts |
| 22 | `NODE_ENV` | No | No | main.ts, app.module.ts, auth files |
| 23 | `PASSWORD_RESET_EXPIRATION` | No | No | auth.service.ts |
| 24 | `PORT` | No | No | main.ts |
| 25 | `PORTAL_JWT_EXPIRES_IN` | No | No | customer-portal.module.ts |
| 26 | `PORTAL_JWT_SECRET` | Portal | Yes | customer-portal.module.ts, portal-auth.service.ts |
| 27 | `REDIS_PASSWORD` | Docker | Yes | docker-compose.yml |
| 28 | `REDIS_URL` | **Yes** | Yes | redis.service.ts, main.ts |
| 29 | `S3_BUCKET` | No | No | documents.bak (legacy) |
| 30 | `SENDGRID_API_KEY` | No | Yes | email.service.ts, sendgrid.provider.ts |
| 31 | `SENDGRID_FROM_EMAIL` | No | No | email.service.ts, sendgrid.provider.ts |
| 32 | `SENDGRID_FROM_NAME` | No | No | email.service.ts, sendgrid.provider.ts |
| 33 | `STORAGE_DRIVER` | No | No | storage.module.ts |
| 34 | `STORAGE_LOCAL_PATH` | No | No | local-storage.service.ts |
| 35 | `STORAGE_PUBLIC_URL` | No | No | local-storage.service.ts |
| 36 | `TWILIO_ACCOUNT_SID` | No | Yes | twilio.provider.ts, main.ts |
| 37 | `TWILIO_AUTH_TOKEN` | No | Yes | twilio.provider.ts |
| 38 | `TWILIO_PHONE_NUMBER` | No | No | twilio.provider.ts |

**Total: 38 environment variables** (3 required, 4 portal-required, 31 optional)

---

## See Also

- `.env.example` at `apps/api/.env.example` — Template with required variables
- `deployment-runbook.md` — Environment variables section
- `production-architecture.md` — Production vs development topology
- `security-findings.md` — Secret management recommendations
