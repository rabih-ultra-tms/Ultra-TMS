# CRM Module API Spec

**Module:** `apps/api/src/modules/crm/`
**Base path:** `/api/v1/`
**Controllers:** CompaniesController, ContactsController, ActivitiesController, OpportunitiesController, HubspotController

## Auth

All controllers use `@UseGuards(JwtAuthGuard, RolesGuard)` with `@CurrentTenant()` and `@CurrentUser('id')`.

**Roles:** ADMIN, SALES_MANAGER, SALES_REP, OPERATIONS, ACCOUNTING (varies per endpoint)

---

## CompaniesController

**Path prefix:** `companies`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/companies` | (class-level) | List companies |
| POST | `/companies` | (class-level) | Create company |
| GET | `/companies/:id` | (class-level) | Get company by ID |
| PUT | `/companies/:id` | (class-level) | Update company |
| DELETE | `/companies/:id` | (class-level) | Delete company |
| GET | `/companies/:id/contacts` | (class-level) | List company contacts |
| GET | `/companies/:id/opportunities` | (class-level) | List company opportunities |
| GET | `/companies/:id/activities` | (class-level) | List company activities |
| GET | `/companies/:id/orders` | (class-level) | List company orders |
| POST | `/companies/:id/sync-hubspot` | (class-level) | Sync company with HubSpot |
| PATCH | `/companies/:id/assign` | (class-level) | Assign company |
| PATCH | `/companies/:id/tier` | (class-level) | Update company tier |
| POST | `/companies/:id/upload-logo` | (class-level) | Upload company logo |

**Query params (GET list):** `page`, `limit`, `search`, `type`, `tier`, `status`

**Special:** Logo upload uses `@UseInterceptors(FileInterceptor('logo'))`.

---

## ContactsController

**Path prefix:** `contacts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/contacts` | (class-level) | List contacts |
| POST | `/contacts` | (class-level) | Create contact |
| GET | `/contacts/:id` | (class-level) | Get contact by ID |
| PUT | `/contacts/:id` | (class-level) | Update contact |
| DELETE | `/contacts/:id` | (class-level) | Delete contact |
| GET | `/contacts/:id/activities` | (class-level) | List contact activities |
| POST | `/contacts/:id/sync-hubspot` | (class-level) | Sync contact with HubSpot |
| POST | `/contacts/:id/set-primary` | (class-level) | Set as primary contact |

**Query params (GET list):** `page`, `limit`, `search`, `companyId`

---

## ActivitiesController

**Path prefix:** `activities`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/activities` | (class-level) | List activities |
| POST | `/activities` | (class-level) | Create activity |
| GET | `/activities/upcoming` | (class-level) | List upcoming activities |
| GET | `/activities/my-tasks` | (class-level) | List my tasks |
| GET | `/activities/overdue` | (class-level) | List overdue activities |
| GET | `/activities/:id` | (class-level) | Get activity by ID |
| PUT | `/activities/:id` | (class-level) | Update activity |
| DELETE | `/activities/:id` | (class-level) | Delete activity |
| POST | `/activities/:id/complete` | (class-level) | Complete activity |
| POST | `/activities/:id/reopen` | (class-level) | Reopen activity |
| POST | `/activities/:id/reschedule` | (class-level) | Reschedule activity |

---

## OpportunitiesController

**Path prefix:** `opportunities`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/opportunities` | (class-level) | List opportunities |
| POST | `/opportunities` | (class-level) | Create opportunity |
| GET | `/opportunities/pipeline` | (class-level) | Get pipeline view |
| GET | `/opportunities/:id` | (class-level) | Get opportunity by ID |
| PUT | `/opportunities/:id` | (class-level) | Update opportunity |
| DELETE | `/opportunities/:id` | (class-level) | Delete opportunity |
| PATCH | `/opportunities/:id/stage` | (class-level) | Update opportunity stage |
| POST | `/opportunities/:id/convert` | (class-level) | Convert to customer |
| GET | `/opportunities/:id/activities` | (class-level) | List opportunity activities |
| PATCH | `/opportunities/:id/owner` | (class-level) | Change opportunity owner |

---

## HubspotController

**Path prefix:** `hubspot`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | `/hubspot/webhook` | (class-level) | HubSpot webhook handler |
| POST | `/hubspot/sync/companies` | (class-level) | Sync companies from HubSpot |
| POST | `/hubspot/sync/contacts` | (class-level) | Sync contacts from HubSpot |
| POST | `/hubspot/sync/deals` | (class-level) | Sync deals from HubSpot |
| GET | `/hubspot/status` | (class-level) | Get sync status |
| GET | `/hubspot/field-mapping` | (class-level) | Get field mapping config |

---

## Known Issues

- HubSpot webhook endpoint should likely be @Public() instead of JWT-protected
