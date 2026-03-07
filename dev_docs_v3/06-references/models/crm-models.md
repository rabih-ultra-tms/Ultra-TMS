# CRM Domain Models

> Auto-generated from `apps/api/prisma/schema.prisma` — 2026-03-07

## Models in this Domain

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| Company | Customer/shipper accounts | Contact, Order, Quote, Invoice, Contract |
| Contact | Individual contacts at companies | Company, Activity, Opportunity, Quote |
| Activity | CRM activities (calls, meetings, tasks) | Company, Contact, Opportunity, User |
| Opportunity | Sales pipeline deals | Company, Contact, Activity |

## Company

Core customer/shipper entity. Central to CRM, Sales, TMS, and Accounting.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | String | @id @default(uuid()) | |
| tenantId | String | @index | |
| name | String | VarChar(255) | Company name |
| legalName | String? | VarChar(255) | |
| dbaName | String? | VarChar(255) | |
| companyType | String | VarChar(50) | SHIPPER, CONSIGNEE, BOTH |
| status | String | @default("ACTIVE"), VarChar(50) | |
| industry | String? | VarChar(100) | |
| segment | String? | VarChar(50) | |
| tier | String? | VarChar(20) | |
| website | String? | VarChar(255) | |
| phone | String? | VarChar(50) | |
| email | String? | VarChar(255) | |
| addressLine1 | String? | VarChar(255) | |
| addressLine2 | String? | VarChar(255) | |
| city | String? | VarChar(100) | |
| state | String? | VarChar(50) | |
| postalCode | String? | VarChar(20) | |
| country | String | @default("USA"), VarChar(3) | |
| creditLimit | Decimal? | Decimal(12,2) | |
| paymentTerms | String? | VarChar(50) | NET30, NET60, etc. |
| taxId | String? | VarChar(50) | |
| dunsNumber | String? | VarChar(20) | |
| defaultPickupInstructions | String? | | |
| defaultDeliveryInstructions | String? | | |
| requiresAppointment | Boolean | @default(false) | |
| requiresLumper | Boolean | @default(false) | |
| parentCompanyId | String? | | Self-referential FK |
| assignedUserId | String? | | Sales rep assignment |
| hubspotId | String? | VarChar(50) | CRM integration |
| logoUrl | String? | VarChar(500) | |
| tags | String[] | VarChar(100) | |
| externalId | String? | VarChar(255) | Migration-first |
| sourceSystem | String? | VarChar(100) | |
| customFields | Json | @default("{}") | |
| createdAt/updatedAt/deletedAt | DateTime | | Standard fields |

**Relations:** Contact[], Order[], Quote[], Invoice[], Contract[], CreditApplication[], CreditLimit[], CreditHold[], Activity[], Opportunity[], AgentCommission[], AgentCustomerAssignment[], CollectionActivity[], Document[], PaymentReceived[], PortalUser[]

**Unique:** `[tenantId, name]`
**Indexes:** `[companyType]`, `[status]`, `[assignedUserId]`, `[hubspotId]`, `[externalId, sourceSystem]`, `[tenantId, companyType]`, `[tenantId, status]`, `[tenantId, deletedAt]`

## Contact

Individual contacts linked to companies.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | String | @id @default(uuid()) | |
| tenantId | String | @index | |
| companyId | String? | @index | FK to Company |
| firstName | String | VarChar(100) | |
| lastName | String | VarChar(100) | |
| title | String? | VarChar(100) | Job title |
| department | String? | VarChar(100) | |
| roleType | String? | VarChar(50) | |
| email | String? | VarChar(255) | |
| phone | String? | VarChar(50) | |
| mobile | String? | VarChar(50) | |
| fax | String? | VarChar(50) | |
| preferredContactMethod | String? | VarChar(20) | |
| language | String | @default("en"), VarChar(10) | |
| timezone | String? | VarChar(50) | |
| status | String | @default("ACTIVE"), VarChar(50) | |
| isPrimary | Boolean | @default(false) | Primary contact flag |
| receivesInvoices | Boolean | @default(false) | |
| receivesTracking | Boolean | @default(false) | |
| hubspotId | String? | VarChar(50) | |
| tags | String[] | VarChar(100) | |

**Relations:** Company, Activity[], Opportunity[], Quote[], Order[]

## Activity

CRM activities: calls, meetings, emails, tasks.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | String | @id @default(uuid()) | |
| tenantId | String | @index | |
| entityType | String | VarChar(50) | Polymorphic: COMPANY, CONTACT, etc. |
| entityId | String | | |
| activityType | String | VarChar(50) | CALL, MEETING, EMAIL, TASK |
| subject | String? | VarChar(255) | |
| description | String? | | |
| activityDate | DateTime | @default(now()) | |
| durationMinutes | Int? | | |
| dueDate | DateTime? | | For tasks |
| completedAt | DateTime? | | |
| priority | String? | VarChar(20) | |
| status | String | @default("PENDING"), VarChar(50) | |
| ownerId | String? | | FK to User |
| companyId | String? | | FK to Company |
| contactId | String? | | FK to Contact |
| opportunityId | String? | | FK to Opportunity |
| hubspotEngagementId | String? | VarChar(50) | |

**Indexes:** `[entityType, entityId]`, `[activityType]`, `[activityDate]`, `[status]`, `[ownerId]`, `[companyId]`, `[contactId]`, `[dueDate]`

## Opportunity

Sales pipeline opportunity tracking.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | String | @id @default(uuid()) | |
| tenantId | String | @index | |
| companyId | String | FK to Company | |
| contactId | String? | FK to Contact | |
| name | String | VarChar(255) | Deal name |
| description | String? | | |
| stage | String | VarChar(50) | Pipeline stage |
| probability | Int? | | Win probability % |
| expectedRevenue | Decimal? | Decimal(12,2) | |
| expectedCloseDate | DateTime? | | |
| actualCloseDate | DateTime? | | |
| lostReason | String? | VarChar(255) | |
| assignedUserId | String? | | |
| status | String | @default("OPEN"), VarChar(50) | |

**Relations:** Company, Contact, Activity[]
