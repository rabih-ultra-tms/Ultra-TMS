# Portal Domain Models

> Auto-generated from `apps/api/prisma/schema.prisma` — 2026-03-07

## Models in this Domain

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| PortalUser | Customer portal users | Company |
| CarrierPortalUser | Carrier portal users | Carrier |
| AgentPortalUser | Agent portal users | Agent, AgentContact |
| PortalBranding | Customer portal branding/theming | Company |
| PortalActivityLog | Portal user activity tracking | Company |
| PortalPayment | Portal-initiated payments | Company |
| CarrierPortalSession | Carrier portal auth sessions | CarrierPortalUser |
| CarrierPortalNotification | Carrier portal notifications | CarrierPortalUser |
| CarrierPortalDocument | Documents uploaded via carrier portal | CarrierPortalUser, Carrier |
| CarrierPortalActivityLog | Carrier portal activity tracking | CarrierPortalUser |
| CarrierInvoiceSubmission | Carrier invoice submissions | CarrierPortalUser, Carrier, Load |
| CarrierQuickPayRequest | Quick pay requests from carriers | CarrierPortalUser, Carrier, Load |
| CarrierSavedLoad | Carrier's saved/bookmarked loads | CarrierPortalUser |

## PortalUser (Customer)

| Field | Type | Notes |
|-------|------|-------|
| companyId | String | FK to Company |
| email | String | VarChar(255) |
| password | String | VarChar(255) — bcrypt |
| firstName/lastName | String | |
| role | PortalUserRole enum | ADMIN, STANDARD, VIEW_ONLY |
| status | PortalUserStatus | PENDING, ACTIVE, SUSPENDED |
| emailVerified | Boolean | @default(false) |
| permissions | Json | @default("{}") — granular portal permissions |
| lastLoginAt | DateTime? | |

**Unique:** `[tenantId, email]`

## CarrierPortalUser

| Field | Type | Notes |
|-------|------|-------|
| carrierId | String | FK to Carrier |
| email/password | String | |
| firstName/lastName | String | |
| role | CarrierPortalUserRole | ADMIN, DISPATCHER, DRIVER, ACCOUNTING |
| status | PortalUserStatus | PENDING, ACTIVE, SUSPENDED |
| emailVerified | Boolean | |
| verificationToken | String? | @unique |
| language | String | @default("en") |

**Unique:** `[tenantId, email]`
**Relations:** CarrierPortalSession[], CarrierPortalDocument[], CarrierPortalNotification[], CarrierInvoiceSubmission[], CarrierQuickPayRequest[], CarrierSavedLoad[]

## PortalBranding

White-label branding for customer portals.

| Field | Type | Notes |
|-------|------|-------|
| companyId | String | @unique — one per company |
| logoUrl | String? | |
| primaryColor/secondaryColor | String? | Hex colors |
| customCss | String? | |
| welcomeMessage | String? | |
| footerText | String? | |
| customDomain | String? | |

## CarrierQuickPayRequest

Carriers request early payment with fee deduction.

| Field | Type | Notes |
|-------|------|-------|
| carrierId | String | FK to Carrier |
| loadId | String | FK to Load |
| requestedAmount | Decimal | Decimal(12,2) |
| feePercent | Decimal | Decimal(5,2) |
| feeAmount | Decimal | Decimal(12,2) |
| netAmount | Decimal | Decimal(12,2) |
| status | QuickPayStatus | REQUESTED, APPROVED, REJECTED, PROCESSED |
