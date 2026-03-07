# Auth & Admin Domain Models

> Auto-generated from `apps/api/prisma/schema.prisma` — 2026-03-07

## Models in this Domain

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| User | Core user account with RBAC | Session, Role, LoginAudit, Employee |
| Session | Active user sessions with refresh tokens | User |
| Role | RBAC roles with permission arrays | User (many-to-many via UserRole) |
| LoginAudit | Login attempt tracking | User |
| PasswordResetToken | Password reset flow | User |

## User

Primary user model for authentication and authorization.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | String | @id @default(uuid()) | Primary key |
| tenantId | String | @index | Multi-tenant isolation |
| email | String | @unique, VarChar(255) | Login identifier |
| password | String | VarChar(255) | Bcrypt hash |
| firstName | String | VarChar(100) | |
| lastName | String | VarChar(100) | |
| phone | String? | VarChar(50) | |
| status | String | @default("ACTIVE"), VarChar(50) | ACTIVE, INACTIVE, SUSPENDED |
| emailVerified | Boolean | @default(false) | |
| lastLoginAt | DateTime? | | |
| profileImageUrl | String? | VarChar(500) | |
| timezone | String? | VarChar(50) | |
| language | String | @default("en"), VarChar(10) | |
| externalId | String? | VarChar(255) | Migration-first |
| sourceSystem | String? | VarChar(100) | Migration-first |
| customFields | Json | @default("{}") | Migration-first |
| createdAt | DateTime | @default(now()) | |
| updatedAt | DateTime | @updatedAt | |
| deletedAt | DateTime? | | Soft delete |

**Relations:** Session[], Role[] (via UserRole), LoginAudit[], Employee?, CommissionEntry[], CommissionPayout[], InAppNotification[], Document[], AgentPortalUser[], FeatureFlagOverride[], etc.

**Indexes:** `[tenantId]`, `[email]`, `[status]`, `[tenantId, email]`, `[tenantId, deletedAt]`

## Session

Active authentication sessions.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | String | @id @default(uuid()) | |
| tenantId | String | @index | |
| userId | String | @index | FK to User |
| refreshTokenHash | String | VarChar(255) | Hashed refresh token |
| userAgent | String? | | Browser/client info |
| ipAddress | String? | VarChar(45) | IPv4/IPv6 |
| expiresAt | DateTime | @index | Token expiry |
| revokedAt | DateTime? | | Logout timestamp |
| createdAt | DateTime | @default(now()) | |

**Relations:** User

## Role

RBAC role definitions with JSON permissions.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | String | @id @default(uuid()) | |
| tenantId | String | @index | |
| name | String | VarChar(100) | Role name |
| description | String? | | |
| permissions | Json | @default("[]") | Array of permission strings |
| isSystem | Boolean | @default(false) | Cannot be deleted |
| isActive | Boolean | @default(true) | |
| createdAt | DateTime | @default(now()) | |
| updatedAt | DateTime | @updatedAt | |
| deletedAt | DateTime? | | Soft delete |

**Unique:** `[tenantId, name]`

## LoginAudit

Login attempt tracking for security monitoring.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | String | @id @default(uuid()) | |
| tenantId | String? | @index | |
| userId | String? | @index | Null if login failed |
| email | String | VarChar(255) | Attempted email |
| success | Boolean | | |
| failureReason | String? | VarChar(100) | |
| ipAddress | String? | VarChar(45) | |
| userAgent | String? | | |
| mfaUsed | Boolean | @default(false) | |
| createdAt | DateTime | @default(now()) | |

**Indexes:** `[email]`, `[createdAt]`, `[tenantId]`, `[userId]`

## PasswordResetToken

Password reset workflow tokens.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | String | @id @default(uuid()) | |
| tenantId | String | @index | |
| userId | String | FK to User | |
| token | String | @unique, VarChar(255) | Reset token |
| expiresAt | DateTime | | Token expiry |
| usedAt | DateTime? | | When token was consumed |
| createdAt | DateTime | @default(now()) | |

## Common Patterns

- **All models** use UUID primary keys
- **Multi-tenant**: `tenantId` with `@index` on every model
- **Soft delete**: `deletedAt: DateTime?` — always filter `deletedAt: null`
- **Migration-first**: `externalId`, `sourceSystem`, `customFields` on entity models
- **Audit fields**: `createdAt`, `updatedAt`, `createdById`, `updatedById`
