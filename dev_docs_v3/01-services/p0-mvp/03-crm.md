# Service Hub: CRM / Customers (03)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-09 (PST-03 tribunal)
> **Original definition:** `dev_docs/02-services/` (CRM service definition)
> **Design specs:** `dev_docs/12-Rabih-design-Process/02-crm/` (13 files)
> **v2 hub (historical):** `dev_docs_v2/03-services/02-crm.md`
> **Tribunal file:** `dev_docs_v3/05-audit/tribunal/per-service/batch-1-p0/PST-03-crm.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | B (7.5/10) |
| **Confidence** | High — code-verified via PST-03 tribunal |
| **Last Verified** | 2026-03-09 |
| **Backend** | Production — 49 endpoints across 5 controllers (Companies 12, Contacts 8, Activities 11, Opportunities 10, HubSpot 8) |
| **Frontend** | Substantial — 18+ routes built (6 company, 6 customer redirects, 3 leads, 3 contacts + sub-tabs); 4 Wave 2 screens not built |
| **Tests** | ~70 backend test cases (5 spec files) + 2 frontend test files |
| **Priority** | P0 — fix tenant isolation in mutations; P1 — authenticate HubSpot webhook |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | `dev_docs/02-services/` CRM definition |
| Design Specs | Done | 13 files, all 15-section |
| Backend Controllers | Production | 5 controllers: Companies (287 LOC), Contacts (158), Activities (202), Opportunities (165), HubSpot (118) |
| Backend Services | Production | 5 services: Companies (216), Contacts (150), Activities (268), Opportunities (311), HubSpot (233) — ~1,178 LOC total |
| DTOs | Production | 4 DTO files (~481 LOC), 229 class-validator decorators |
| Prisma Models | Production | Company, Contact, Opportunity, Activity, HubspotSyncLog |
| Frontend Pages | Substantial | 18+ routes built (incl. sub-tabs + customer redirects); 4 Wave 2 screens not built |
| React Hooks | Production | 5 hook files, 13+ mutations, proper cache invalidation |
| Components | Substantial | 25 components (7 customers, 5 contacts, 4 activities, 6 leads, 2 shared) + 1 test file |
| Tests | Partial | ~70 backend test cases (5 spec files), 2 frontend test files — security tests missing |
| Security | Needs-work | All endpoints auth-guarded (JwtAuthGuard + RolesGuard); **tenantId missing from update/delete WHERE clauses** |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| Companies List | `/companies` | Built | 8/10 | Search debounce, pagination, loading/error/empty states |
| Company Detail | `/companies/[id]` | Built | 7/10 | Tabbed view, proper states |
| Company Create | `/companies/new` | Built | 8/10 | 446 LOC form, logo upload, Zod validation |
| Company Edit | `/companies/[id]/edit` | Built | 7/10 | Edit form with defaultValues |
| Company Activities | `/companies/[id]/activities` | Built | 7/10 | ActivityTimeline, hardcoded limit=50 (no pagination) |
| Company Contacts | `/companies/[id]/contacts` | Built | 7/10 | ContactsTable with pagination |
| Contacts List | `/contacts` | Built | 6/10 | Has delete button + ConfirmDialog; no search |
| Contact Detail | `/contacts/[id]` | Built | 7/10 | Detail view |
| Contact Create | `/contacts/new` | Built | 8/10 | Zod validation |
| Contact Edit | `/contacts/[id]/edit` | Built | 7/10 | Edit form |
| Leads List | `/leads` | Built | 7/10 | Table + pipeline, delete with ConfirmDialog, owner filter uses useUsers() dropdown |
| Lead Detail | `/leads/[id]` | Built | 7/10 | Has convert dialog (LeadConvertDialog wired), delete with ConfirmDialog |
| Lead Create | `/leads/new` | Built | 8/10 | Company/user select, validation |
| Lead Activities | `/leads/[id]/activities` | Built | 7/10 | Sub-tab — needs verification |
| Lead Contacts | `/leads/[id]/contacts` | Built | 7/10 | Sub-tab confirmed |
| Customers List | `/customers` | Built | 7/10 | Full CRUD page (not just redirects) |
| Customer Detail | `/customers/[id]` | Built | 7/10 | Customer detail view |
| Customer Edit | `/customers/[id]/edit` | Built | 7/10 | Edit form with defaultValues |
| Customer Activities | `/customers/[id]/activities` | Built | 7/10 | Activity timeline sub-tab |
| Customer Contacts | `/customers/[id]/contacts` | Built | 7/10 | Contacts sub-tab |
| Customer Create | `/customers/new` | Built | 8/10 | Create form with Zod validation |
| Activities | `/activities` | Built | 6/10 | Standalone activities page |
| Opportunities List | `/crm/opportunities` | Not Built | — | Wave 2 |
| Activities Calendar | `/crm/activities` | Not Built | — | Wave 2 |
| Territory Mgmt | `/crm/territories` | Not Built | — | Wave 2 |
| Lead Import | `/crm/leads/import` | Not Built | — | Wave 2 — CSV/Excel wizard |

---

## 4. API Endpoints

### Companies Controller (12 endpoints)
| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/crm/companies` | Production | List paginated, filterable by status/manager |
| POST | `/api/v1/crm/companies` | Production | Create company |
| GET | `/api/v1/crm/companies/:id` | Production | Detail with contacts, orders summary |
| PATCH | `/api/v1/crm/companies/:id` | Production | Update |
| DELETE | `/api/v1/crm/companies/:id` | Production | Soft delete |
| GET | `/api/v1/crm/companies/:id/contacts` | Production | List company contacts |
| GET | `/api/v1/crm/companies/:id/opportunities` | Production | List company opportunities |
| GET | `/api/v1/crm/companies/:id/activities` | Production | List company activities |
| GET | `/api/v1/crm/companies/:id/orders` | Production | List company orders |
| POST | `/api/v1/crm/companies/:id/sync-hubspot` | Production | Sync company to HubSpot |
| PATCH | `/api/v1/crm/companies/:id/assign-rep` | Production | Assign sales rep |
| PATCH | `/api/v1/crm/companies/:id/tier` | Production | Update company tier |

### Contacts Controller (8 endpoints)
| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/crm/contacts` | Production | List with search, company, status filters |
| POST | `/api/v1/crm/contacts` | Production | Create contact |
| GET | `/api/v1/crm/contacts/:id` | Production | Detail |
| PATCH | `/api/v1/crm/contacts/:id` | Production | Update |
| DELETE | `/api/v1/crm/contacts/:id` | Production | Soft delete |
| GET | `/api/v1/crm/contacts/:id/activities` | Production | Contact activities |
| POST | `/api/v1/crm/contacts/:id/sync-hubspot` | Production | Sync contact to HubSpot |
| PATCH | `/api/v1/crm/contacts/:id/set-primary` | Production | Set as primary contact |

### Activities Controller (11 endpoints)
| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/crm/activities` | Production | Activity list |
| POST | `/api/v1/crm/activities` | Production | Log activity |
| GET | `/api/v1/crm/activities/:id` | Production | Detail |
| PATCH | `/api/v1/crm/activities/:id` | Production | Update |
| DELETE | `/api/v1/crm/activities/:id` | Production | Soft delete |
| GET | `/api/v1/crm/activities/upcoming` | Production | Upcoming activities |
| GET | `/api/v1/crm/activities/my-tasks` | Production | Current user's tasks |
| GET | `/api/v1/crm/activities/overdue` | Production | Overdue tasks |
| PATCH | `/api/v1/crm/activities/:id/complete` | Production | Mark complete |
| PATCH | `/api/v1/crm/activities/:id/reopen` | Production | Reopen completed activity |
| PATCH | `/api/v1/crm/activities/:id/reschedule` | Production | Reschedule activity |

### Opportunities Controller (10 endpoints)
| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/crm/opportunities` | Production | List by stage |
| POST | `/api/v1/crm/opportunities` | Production | Create lead/opportunity |
| GET | `/api/v1/crm/opportunities/:id` | Production | Detail |
| PATCH | `/api/v1/crm/opportunities/:id` | Production | Update |
| DELETE | `/api/v1/crm/opportunities/:id` | Production | Soft delete |
| GET | `/api/v1/crm/opportunities/pipeline` | Production | Grouped by stage for Kanban |
| PATCH | `/api/v1/crm/opportunities/:id/stage` | Production | Stage change with auto-probability (WON=100, LOST=0) |
| POST | `/api/v1/crm/opportunities/:id/convert` | Production | Convert to customer (WON stage only) |
| GET | `/api/v1/crm/opportunities/:id/activities` | Production | Opportunity activities |
| PATCH | `/api/v1/crm/opportunities/:id/owner` | Production | Update owner |

### HubSpot Controller (7 endpoints)
| Method | Path | Status | Notes |
|--------|------|--------|-------|
| POST | `/api/v1/crm/hubspot/webhook` | Production | **UNGUARDED — no auth, signature verification TODO** |
| POST | `/api/v1/crm/hubspot/sync/companies` | Production | Sync companies to HubSpot |
| POST | `/api/v1/crm/hubspot/sync/contacts` | Production | Sync contacts to HubSpot |
| POST | `/api/v1/crm/hubspot/sync/deals` | Production | Sync deals to HubSpot |
| GET | `/api/v1/crm/hubspot/status` | Production | Sync status (stub — returns `isConfigured: false`) |
| GET | `/api/v1/crm/hubspot/field-mapping` | Production | Field mapping config |
| GET | `/api/v1/crm/hubspot/connection-status` | Production | Connection status |

---

## 5. Components

### Customer Components (7)
| Component | Path | Status | Notes |
|-----------|------|--------|-------|
| CustomerTable | `components/crm/customers/customer-table.tsx` | Good | Expandable rows, pagination |
| CustomerForm | `components/crm/customers/customer-form.tsx` | Good | 446 LOC, logo upload, Zod validation |
| CustomerDetailCard | `components/crm/customers/customer-detail-card.tsx` | Good | 41 LOC |
| CustomerFilters | `components/crm/customers/customer-filters.tsx` | Good | Zustand store |
| CustomerColumns | `components/crm/customers/customer-columns.tsx` | Good | Column type definitions |
| CustomerStatusBadge | `components/crm/customers/customer-status-badge.tsx` | Good | Delegates to UnifiedStatusBadge |
| CustomerTabs | `components/crm/customers/customer-tabs.tsx` | Good | Tab navigation |

### Lead Components (6)
| Component | Path | Status | Notes |
|-----------|------|--------|-------|
| LeadsTable | `components/crm/leads/leads-table.tsx` | Good | Has delete + ConfirmDialog |
| LeadsPipeline | `components/crm/leads/leads-pipeline.tsx` | Needs-work | No confirm on drag, console.error on fail |
| LeadForm | `components/crm/leads/lead-form.tsx` | Good | Company/user select |
| LeadCard | `components/crm/leads/lead-card.tsx` | Good | Pipeline card |
| LeadConvertDialog | `components/crm/leads/lead-convert-dialog.tsx` | Good | Wired to lead detail page |
| LeadStageBadge | `components/crm/leads/lead-stage-badge.tsx` | Good | Stage badge |

### Contact Components (5)
| Component | Path | Status | Notes |
|-----------|------|--------|-------|
| ContactsTable | `components/crm/contacts/contacts-table.tsx` | Needs-work | Has delete + ConfirmDialog; no search |
| ContactForm | `components/crm/contacts/contact-form.tsx` | Good | 211 LOC |
| ContactCard | `components/crm/contacts/contact-card.tsx` | Good | Contact display card |
| ContactSelect | `components/crm/contacts/contact-select.tsx` | Good | Contact picker |

### Activity Components (4)
| Component | Path | Status | Notes |
|-----------|------|--------|-------|
| ActivityTimeline | `components/crm/activities/activity-timeline.tsx` | Good | 16 LOC |
| ActivityForm | `components/crm/activities/activity-form.tsx` | Good | 139 LOC |
| ActivityItem | `components/crm/activities/activity-item.tsx` | Good | Individual activity card |
| ActivityTypeIcon | `components/crm/activities/activity-type-icon.tsx` | Good | Type-to-icon mapping |

### Shared Components (2)
| Component | Path | Status | Notes |
|-----------|------|--------|-------|
| AddressForm | `components/crm/shared/address-form.tsx` | Good | 127 LOC, reusable |
| PhoneInput | `components/crm/shared/phone-input.tsx` | Good | Shared phone input |

### Test Files (2)
| File | Notes |
|------|-------|
| `customer-table.test.tsx` | Table rendering tests |
| `leads-table.test.tsx` | Table rendering tests |

---

## 6. Hooks

### use-customers.ts (79 LOC)
| Hook | Endpoint | Envelope | Notes |
|------|----------|----------|-------|
| `useCustomers` | `/crm/customers` | `data?.data` | Paginated list |
| `useCustomer` | `/crm/customers/:id` | `data?.data` | Single detail |
| `useCreateCustomer` | POST `/crm/customers` | Mutation | Cache invalidation |
| `useUpdateCustomer` | PATCH `/crm/customers/:id` | Mutation | Cache invalidation |
| `useDeleteCustomer` | DELETE `/crm/customers/:id` | Mutation | Cache invalidation |

### use-contacts.ts (75 LOC)
| Hook | Endpoint | Envelope | Notes |
|------|----------|----------|-------|
| `useContacts` | `/crm/contacts` | `data?.data` | Paginated list |
| `useDeleteContact` | DELETE `/crm/contacts/:id` | Mutation | Wired to ContactsTable via onDelete prop |

### use-leads.ts (101 LOC)
| Hook | Endpoint | Envelope | Notes |
|------|----------|----------|-------|
| `useLeads` | `/crm/opportunities` | `data?.data` | Pipeline data |
| `useDeleteLead` | DELETE `/crm/opportunities/:id` | Mutation | Wired to LeadsTable via onDelete prop |
| `useConvertLead` | POST `/crm/opportunities/:id/convert` | Mutation | Wired to LeadConvertDialog in lead detail page |
| `useLeadsPipeline` | `/crm/opportunities/pipeline` | `data?.data` | Grouped by stage |
| `useUpdateLeadStage` | PATCH `/crm/opportunities/:id/stage` | Mutation | Stage change endpoint |

### use-activities.ts (169 LOC)
| Hook | Endpoint | Envelope | Notes |
|------|----------|----------|-------|
| `useActivities` | `/crm/activities` | `data?.data` | Activity log with field normalization layer |

### use-companies.ts (21 LOC)
| Hook | Endpoint | Envelope | Notes |
|------|----------|----------|-------|
| `useCompanies` | `/crm/companies` | `data?.data` | Read-only company list |

**Note:** Hooks use `data?.data` direct access pattern (not an `unwrap()` utility). This is consistent and works correctly per PST-01 cross-cutting finding.

---

## 7. Business Rules

1. **Credit Management Delegation:** Credit management (status lifecycle, limits, holds) lives in the **Credit module** (`apps/api/src/modules/credit/`), not CRM. CRM provides `creditLimit` field on Company model but does NOT own credit status transitions, balance tracking, or hold enforcement.
2. **Order Blocking:** CRM provides company data that TMS Core checks for order blocking. CRM does not block orders directly. Verify implementation in PST-05 (TMS Core).
3. **Lead-to-Customer Conversion:** `OpportunitiesService.convertToCustomer()` changes the linked Company's `companyType` to CUSTOMER when Opportunity reaches WON stage. Does NOT create a new Customer record — it updates the existing Company. Opportunity is NOT archived/soft-deleted after conversion.
4. **Soft Delete Mandatory:** All services use `update({ deletedAt: new Date() })`. Hard deletes are forbidden. `deletedAt: null` checked on all read queries. 7-year retention before purge.
5. **Contact Ownership:** Contact has `companyId` FK, but `@IsOptional()` in CreateContactDto — orphaned contacts (no company) are possible. DTO should enforce required companyId to prevent orphans.
6. **Email Uniqueness:** Hub claims tenant-scoped uniqueness on Company email — no unique constraint visible in Prisma schema. Needs verification.
7. **Pipeline Stage Order:** Leads flow: NEW -> QUALIFIED -> PROPOSAL -> NEGOTIATION -> WON/LOST. `OpportunitiesService.updateStage()` validates known stages and auto-sets probability (WON=100, LOST=0). Stage regression is allowed without requiring a reason note. No stage change audit trail. No event emission on stage change.
8. **HubSpot Sync:** Full HubSpot integration scaffolded (5th controller + service). Currently stubbed (`isConfigured: false`). Sync available for companies, contacts, and deals. Webhook endpoint exists but has NO authentication — signature verification is TODO.

---

## 8. Data Model

### Company (Prisma model name: `Company`, NOT "Customer")
```
Company {
  id                          String    @id @default(uuid())
  name                        String    (hub incorrectly called this "companyName")
  legalName                   String?
  dbaName                     String?
  companyType                 CompanyType
  email                       String?
  phone                       String?
  industry                    String?
  segment                     String?
  tier                        String?
  website                     String?
  taxId                       String?
  dunsNumber                  String?
  addressLine1                String?
  addressLine2                String?
  city                        String?
  state                       String?
  postalCode                  String?
  country                     String?
  creditLimit                 Decimal?  @db.Decimal(12,2) (nullable, no default)
  paymentTerms                String?   @db.VarChar(50)
  status                      ActiveStatus (not CreditStatus — credit lives in Credit module)
  defaultPickupInstructions   String?
  defaultDeliveryInstructions String?
  requiresAppointment         Boolean?
  requiresLumper              Boolean?
  parentCompanyId             String?   (FK → Company, self-referential)
  assignedUserId              String?   (FK → User)
  hubspotId                   String?
  logoUrl                     String?
  tags                        String[]
  sourceSystem                String?
  externalId                  String?
  customFields                Json?
  createdById                 String?
  updatedById                 String?
  tenantId                    String    (FK → Tenant)
  createdAt                   DateTime
  updatedAt                   DateTime
  deletedAt                   DateTime? (soft delete)

  contacts                    Contact[]
  opportunities               Opportunity[]
}
```

### Contact
```
Contact {
  id                     String    @id @default(uuid())
  firstName              String
  lastName               String
  email                  String?
  phone                  String?
  mobile                 String?
  fax                    String?
  title                  String?
  department             String?
  preferredContactMethod String?
  language               String?
  timezone               String?
  isPrimary              Boolean   (not a ContactType enum)
  receivesInvoices       Boolean?
  receivesTracking       Boolean?
  hubspotId              String?
  tags                   String[]
  companyId              String?   (FK → Company, nullable — orphans possible)
  createdById            String?
  updatedById            String?
  tenantId               String
  createdAt              DateTime
  updatedAt              DateTime
  deletedAt              DateTime?
}
```

### Opportunity (Lead)
```
Opportunity {
  id                     String    @id @default(uuid())
  name                   String    (hub incorrectly called this "title")
  description            String?
  estimatedValue         Decimal?  (hub incorrectly called this "value")
  avgLoadValue           Decimal?
  estimatedLoadsPerMonth Int?
  stage                  OpportunityStage (NEW, QUALIFIED, PROPOSAL, NEGOTIATION, WON, LOST, CONVERTED)
  probability            Int?      (0-100, auto-set on WON/LOST)
  expectedCloseDate      DateTime? (hub incorrectly called this "closeDate")
  actualCloseDate        DateTime?
  serviceTypes           String[]
  lanes                  Json?
  competition            String?
  winReason              String?
  lossReason             String?
  primaryContactId       String?   (FK → Contact)
  hubspotDealId          String?
  tags                   String[]
  companyId              String?   (FK → Company)
  ownerId                String    (FK → User)
  createdById            String?
  updatedById            String?
  tenantId               String
  createdAt              DateTime
  updatedAt              DateTime
  deletedAt              DateTime?
}
```

### Activity (missing from previous hub)
```
Activity {
  id              String    @id @default(uuid())
  activityType    ActivityType
  subject         String
  description     String?
  dueDate         DateTime?
  completedAt     DateTime?
  priority        String?
  companyId       String?   (FK → Company)
  contactId       String?   (FK → Contact)
  opportunityId   String?   (FK → Opportunity)
  assignedUserId  String?   (FK → User)
  tenantId        String
  createdById     String?
  updatedById     String?
  createdAt       DateTime
  updatedAt       DateTime
  deletedAt       DateTime?
}
```

### HubspotSyncLog (missing from previous hub)
```
HubspotSyncLog {
  id             String    @id @default(uuid())
  entityType     String
  entityId       String
  hubspotId      String?
  direction      String    (PUSH, PULL)
  status         String    (SUCCESS, FAILED, PENDING)
  errorMessage   String?
  syncedAt       DateTime
  fieldMapping   Json?
  tenantId       String
  createdAt      DateTime
  updatedAt      DateTime
  deletedAt      DateTime?
}
```

---

## 9. Validation Rules

| Field | DTO | Decorator | Notes |
|-------|-----|-----------|-------|
| `email` | CreateCompanyDto | `@IsEmail()` | No tenant-scoped uniqueness enforced in DTO |
| `creditLimit` | CreateCompanyDto | `@IsNumber()` | No min/max constraints — should add 0-10M |
| `stage` | CreateOpportunityDto | `@IsIn(['LEAD','QUALIFIED',...])` | Uses @IsIn not @IsEnum — functionally equivalent |
| `phone` | CreateCompanyDto | `@IsString()` | No E.164 format validation |
| `companyId` | CreateContactDto | `@IsOptional()` | Allows orphaned contacts — should be required |
| All deletes | All services | Server-side | `update({ deletedAt: new Date() })` |

**Total:** 229 class-validator decorators across 4 DTO files.

**Phantom rules removed:** `customerCode` (field doesn't exist), `contactType` enum (field doesn't exist on Contact DTO).

---

## 10. Status States

### Opportunity Stage Machine
```
NEW → QUALIFIED → PROPOSAL → NEGOTIATION → WON → CONVERTED
NEW/QUALIFIED/PROPOSAL/NEGOTIATION → LOST (with reason)
LOST → NEW (reopen)
WON: auto-sets probability=100
LOST: auto-sets probability=0
```
Stage regression allowed. No reason note required for regression. No audit trail for stage changes. No event emission on transitions.

### Company Status
Company uses `ActiveStatus` enum (ACTIVE, INACTIVE, etc.) — NOT a credit status machine.

**Credit Status Machine:** Does NOT exist on Company model. Credit management (PENDING -> APPROVED -> HOLD -> COD -> PREPAID -> DENIED) lives in the **Credit module** (`apps/api/src/modules/credit/`).

---

## 11. Known Issues

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| **CRITICAL: tenantId missing from update/delete WHERE clauses** | P0 | **Open** | All 4 main services (Companies, Contacts, Activities, Opportunities) use `where: { id }` without `tenantId` — cross-tenant mutation possible if UUID known |
| **HubSpot webhook has no authentication** | P1 | **Open** | `POST /crm/hubspot/webhook` has no @UseGuards, signature verification is TODO |
| Hardcoded "+5" stat on companies page | P1 | **Open** | `companies/page.tsx:83` — fabricated metric, should query API |
| Activity timeline hardcoded limit=50 | P2 | Open | No pagination — users with 50+ activities lose visibility |
| No confirmation dialog on pipeline drag-drop stage change | P1 | Open | `leads-pipeline.tsx:36-47` |
| Contacts list has no search/filters (backend supports it) | P1 | Open | `contacts/page.tsx` |
| LeadsPipeline logs console.error on drag fail | P2 | Open | `leads-pipeline.tsx` |
| No Wave 2 screens built (Opportunities, Activities, Territories) | P2 | Deferred | Wave 2 scope |
| Backend `any` type count: 33 | P2 | Open | Mostly in DTOs and type casts |
| No stage change audit trail | P2 | Open | Previous stage not recorded on transitions |

**Resolved Issues (closed during PST-03 tribunal):**
- ~~Delete buttons missing on Contacts table (BUG-009)~~ — FIXED: ContactsTable has delete + ConfirmDialog
- ~~Delete buttons missing on Leads table (BUG-009)~~ — FIXED: LeadsTable has delete + ConfirmDialog
- ~~Owner filter is text input (BUG-010)~~ — FIXED: Uses useUsers() dropdown
- ~~Convert-to-customer dialog not wired to Lead Detail (BUG-010)~~ — FIXED: LeadConvertDialog imported and rendered in lead detail page
- ~~Zero tests written~~ — FALSE: ~70 backend test cases + 2 frontend test files exist
- ~~useDeleteContact not wired to UI~~ — FIXED: Wired via onDelete prop
- ~~useDeleteLead not wired to UI~~ — FIXED: Wired via onDelete prop
- ~~useConvertLead not wired to UI~~ — FIXED: Wired in lead detail page

---

## 12. Tasks

### Completed (verified by PST-03 tribunal)
| Task ID | Title | Status |
|---------|-------|--------|
| BUG-009 | Add delete buttons (Contacts + Leads tables) | **Done** — delete + ConfirmDialog exist on both tables |
| BUG-010 | Fix owner filter dropdown + convert button | **Done** — owner uses useUsers() dropdown, convert dialog wired |

### Open (from tribunal findings)
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| CRM-107 | Fix tenant isolation in CRM mutations (add tenantId to all update/delete WHERE clauses) | S (2h) | P0 |
| CRM-108 | Disable/authenticate HubSpot webhook (return 501 or add HMAC signature verification) | S (1h) | P1 |
| CRM-109 | Fix hardcoded "+5" companies stat (query API for monthly new companies) | XS (30min) | P1 |
| CRM-101 | Add search/filters to Contacts list | S (2h) | P1 |
| CRM-110 | Add tenant isolation tests for CRM services | M (3h) | P1 |
| CRM-111 | Add pagination to activity timeline (currently hardcoded limit=50) | S (1h) | P1 |

### Backlog
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| CRM-102 | Write CRM security tests (tenant isolation, role enforcement) | M (4h) | P1 |
| CRM-112 | Reduce backend `any` count (33 instances) | S (2h) | P2 |
| CRM-113 | Add stage change audit trail (log previous stage on transitions) | S (2h) | P2 |
| CRM-114 | Add search debounce to contacts and activities pages | XS (30min) | P2 |
| CRM-103 | Build Opportunities Kanban (Wave 2) | L (8-10h) | P2 |
| CRM-104 | Build Activities Calendar (Wave 2) | XL (10-12h) | P2 |
| CRM-105 | Build Territory Management (Wave 2) | L (8h) | P2 |
| CRM-106 | Build Lead Import Wizard (Wave 2) | L (8h) | P2 |

---

## 13. Design Links

| Screen | Spec | Path |
|--------|------|------|
| CRM Dashboard | Full 15-section | `dev_docs/12-Rabih-design-Process/02-crm/01-crm-dashboard.md` |
| Leads List | Full 15-section | `dev_docs/12-Rabih-design-Process/02-crm/02-leads-list.md` |
| Lead Detail | Full 15-section | `dev_docs/12-Rabih-design-Process/02-crm/03-lead-detail.md` |
| Companies List | Full 15-section | `dev_docs/12-Rabih-design-Process/02-crm/04-companies-list.md` |
| Company Detail | Full 15-section | `dev_docs/12-Rabih-design-Process/02-crm/05-company-detail.md` |
| Contacts List | Full 15-section | `dev_docs/12-Rabih-design-Process/02-crm/06-contacts-list.md` |
| Contact Detail | Full 15-section | `dev_docs/12-Rabih-design-Process/02-crm/07-contact-detail.md` |
| Opportunities List | Full 15-section | `dev_docs/12-Rabih-design-Process/02-crm/08-opportunities-list.md` |
| Opportunity Detail | Full 15-section | `dev_docs/12-Rabih-design-Process/02-crm/09-opportunity-detail.md` |
| Activities Calendar | Full 15-section | `dev_docs/12-Rabih-design-Process/02-crm/10-activities-calendar.md` |
| Territory Management | Full 15-section | `dev_docs/12-Rabih-design-Process/02-crm/11-territory-management.md` |
| Lead Import | Full 15-section | `dev_docs/12-Rabih-design-Process/02-crm/12-lead-import-wizard.md` |

---

## 14. Delta vs Original Plan

| Original Plan | Actual | Delta |
|--------------|--------|-------|
| 13 screens planned | 18+ routes built (incl. sub-tabs + redirects), 4 Wave 2 not built | Exceeds plan for Wave 1 |
| 10 endpoints (single controller) | 49 endpoints across 5 controllers | Massively exceeded plan |
| 16 components | 25 components | Exceeded plan |
| B+ grade target | B (7.5/10) after tribunal | Close to target |
| Tests required | ~70 backend + 2 frontend test files exist | Partial — security tests missing |
| No HubSpot integration planned | Full 5th controller + service scaffolded (stub) | Exceeded plan (but undocumented) |
| Hub rated B- (7.1/10) | Verified 7.5/10 by PST-03 tribunal | Hub was outdated — code better than docs |

---

## 15. Dependencies

**Depends on:**
- Auth & Admin (JWT, roles, tenantId via JwtAuthGuard + RolesGuard + @CurrentTenant())

**External Integrations:**
- HubSpot (sync companies/contacts/deals, webhook — currently stubbed, `isConfigured: false`)

**Depended on by:**
- Sales & Quotes (Company selection for quote creation)
- TMS Core (shipper/consignee lookup from Company records, credit status check)
- Accounting (Company billing info, payment terms)
- Commission (customer revenue attribution — UNVERIFIED)

**Note:** Previous hub listed Communication as a dependency — no Communication module import found in CRM code. Removed.
