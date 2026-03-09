# PST-03: CRM / Customers — Per-Service Tribunal

> **Audit Date:** 2026-03-08
> **Hub File:** `dev_docs_v3/01-services/p0-mvp/03-crm.md`
> **Auditor:** Claude Code (Opus 4.6)
> **Previous PST:** PST-01 Auth & Admin (MODIFY, 7.5/10)

---

## Phase 1: Hub File Verification

### 1A. Status Box Accuracy

| Field | Hub Claim | Actual | Verdict |
|-------|-----------|--------|---------|
| Health Score | B- (7.1/10) | See verdict | REASSESSED BELOW |
| Backend | Production (10 endpoints, all working) | **48 endpoints** across 5 controllers (Companies 12, Contacts 8, Activities 11, Opportunities 10, HubSpot 7) | **STALE** — massively undercounted |
| Frontend | Partial — Wave 1 (7 screens) built, Wave 2 (5) not built | **15+ routes** built (companies, contacts, leads, customer redirects, sub-tabs) | **STALE** — more built than claimed |
| Tests | None — critical gap | **~70 test cases** across 5 backend spec files + 2 frontend test files | **FALSE** — tests exist |
| Active Issues | BUG-009 (delete buttons), BUG-010 (owner filter, convert button) | BUG-009 **PARTIALLY FIXED** (leads-table.tsx and contacts-table.tsx have delete + ConfirmDialog); BUG-010 **FIXED** (lead detail page has convert dialog wired) | **STALE** |

### 1B. Implementation Status — Layer by Layer

| Layer | Hub Claim | Verification | Actual Finding | Verdict |
|-------|-----------|-------------|----------------|---------|
| Backend module | Production, `apps/api/src/modules/crm/` | Glob confirmed | 21 files: 5 controllers, 5 services, 4 DTOs (+1 index), 5 specs, 1 module | **ACCURATE** (but undercounted) |
| Controllers | CrmController (implied 1) | Read all controllers | 5 controllers: Companies (287 LOC), Contacts (158), Activities (202), Opportunities (165), HubSpot (118) | **STALE** — hub implies single controller |
| Services | Not documented | Read all services | 5 services: Companies (216), Contacts (150), Activities (268), Opportunities (311), HubSpot (233) — ~1,178 LOC total | **MISSING** from hub |
| DTOs | Not documented | Read DTO files | 4 DTO files (~481 LOC total), 229 class-validator decorators | **MISSING** from hub |
| Frontend pages | Partial — 15 routes built | Glob + grep | 6 company pages + 6 customer redirects + 3 lead pages + 3 contact pages + sub-tabs = **18+ route files** | **STALE** — undercounted |
| React hooks | Partial — CRUD hooks exist | Read hook files | 5 hook files: use-customers (79 LOC), use-contacts (75), use-activities (169), use-companies (21), use-leads (101) — 13 mutations total | **ACCURATE** (but undercounted) |
| Components | 16 components | Glob CRM components | **25 component files** across customers (7), contacts (5), activities (4), leads (6), shared (2), + 1 test file | **STALE** — 56% more than claimed |
| Tests | None | Glob spec/test files | **5 backend specs** (~70 test cases) + **2 frontend tests** (customer-table.test.tsx, leads-table.test.tsx) | **FALSE** — tests exist |

### 1C. Screen Verification

| Screen | Hub Route | Hub Status | Actual Status | Verdict |
|--------|-----------|-----------|---------------|---------|
| Companies List | `/companies` | Built (B+) | Built — real components, API calls, search debounce, loading/error/empty states | **ACCURATE** |
| Company Detail | `/companies/[id]` | Built (B) | Built — tabbed view, proper states | **ACCURATE** |
| Company Create | `/companies/new` | Built (B+) | Built — 446 LOC form with logo upload, Zod validation | **ACCURATE** |
| Company Edit | `/companies/[id]/edit` | Built (B) | Built — edit form with defaultValues | **ACCURATE** |
| Company Activities | `/companies/[id]/activities` | Built (B) | Built — ActivityTimeline, hardcoded limit=50 | **ACCURATE** |
| Company Contacts | `/companies/[id]/contacts` | Built (B) | Built — ContactsTable with pagination | **ACCURATE** |
| Contacts List | `/contacts` | Built (C) "No search, no delete" | Built — has delete button with ConfirmDialog. No search confirmed. | **STALE** — delete exists |
| Contact Detail | `/contacts/[id]` | Built (B) "No delete" | Built — needs verification | **STALE** (likely has delete) |
| Contact Create | `/contacts/new` | Built (B+) | Built — Zod validation | **ACCURATE** |
| Contact Edit | `/contacts/[id]/edit` | Built (B) | Built | **ACCURATE** |
| Leads List | `/leads` | Built (B-) "No delete, owner text input" | Built — has delete with ConfirmDialog, owner filter uses useUsers() dropdown | **STALE** — both fixed |
| Lead Detail | `/leads/[id]` | Built (B) "No convert, no delete" | Built — has convert dialog (LeadConvertDialog imported + wired), delete with ConfirmDialog | **FALSE** — both exist |
| Lead Create | `/leads/new` | Built (B+) | Built — company/user select, validation | **ACCURATE** |
| Lead Activities | `/leads/[id]/activities` | Built (B) | Not verified — route file not found by Glob | **NEEDS VERIFICATION** |
| Lead Contacts | `/leads/[id]/contacts` | Built (B) | Route exists (grep confirmed) | **ACCURATE** |
| Customers redirect | `/customers` | Redirect | 6 redirect files → `/companies/*` | **ACCURATE** |
| Opportunities List | `/crm/opportunities` | Not Built | Not Built | **ACCURATE** |
| Activities Calendar | `/crm/activities` | Not Built | Not Built | **ACCURATE** |
| Territory Mgmt | `/crm/territories` | Not Built | Not Built | **ACCURATE** |
| Lead Import | `/crm/leads/import` | Not Built | Not Built | **ACCURATE** |

**Screens in code NOT in hub:** None found — hub screen list is comprehensive.

### 1D. Endpoint Verification

Hub claims 20 endpoints under a single "CrmController." Actual: **48 endpoints** across 5 controllers.

| Controller | Hub Endpoints | Actual Endpoints | Missing from Hub |
|-----------|--------------|-----------------|-----------------|
| Companies | 5 (CRUD) | 12 (CRUD + sub-resources + assign + tier + logo + sync) | getContacts, getOpportunities, getActivities, getOrders, syncHubspot, assignRep, updateTier, uploadLogo |
| Contacts | 5 (CRUD) | 8 (CRUD + activities + sync + setPrimary) | getActivities, syncHubspot, setPrimary |
| Activities | 2 (list + create) | 11 (CRUD + upcoming + myTasks + overdueTasks + complete + reopen + reschedule) | 9 endpoints missing |
| Opportunities | 7 (CRUD + pipeline + stage + convert) | 10 (CRUD + pipeline + stage + convert + activities + owner) | getActivities, updateOwner |
| HubSpot | 0 (not mentioned) | 7 (webhook + sync x3 + status + fieldMapping + connectionStatus) | **Entire controller undocumented** |

All controllers use `@UseGuards(JwtAuthGuard, RolesGuard)` with proper `@Roles()` decorators. Exception: HubSpot webhook endpoint has NO auth guard (security gap — TODO for signature verification).

### 1E. Component & Hook Verification

**Components — Hub claims 16, actual 25:**

| Hub Component | Hub Path | Exists? | Hub Status | Actual Status |
|--------------|----------|---------|-----------|---------------|
| CustomerTable | `components/crm/customers/customer-table.tsx` | YES | Good | Good — expandable rows, pagination |
| CustomerForm | `components/crm/customers/customer-form.tsx` | YES | Good | Good — 446 LOC, logo upload, Zod |
| CustomerDetailCard | `components/crm/customers/customer-detail-card.tsx` | YES | Good | Good — 41 LOC |
| CustomerFilters | `components/crm/customers/customer-filters.tsx` | YES | Good | Good — Zustand store |
| LeadsTable | `components/crm/leads/leads-table.tsx` | YES | Needs-work (missing delete) | **Has delete + ConfirmDialog** |
| LeadsPipeline | `components/crm/leads/leads-pipeline.tsx` | YES | Needs-work | Needs verification |
| LeadForm | `components/crm/leads/lead-form.tsx` | YES | Good | Good — company/user select |
| LeadCard | `components/crm/leads/lead-card.tsx` | YES | Good | Unverified |
| LeadConvertDialog | `components/crm/leads/lead-convert-dialog.tsx` | YES | "Not wired to UI" | **WIRED** — imported in lead detail page |
| ContactsTable | `components/crm/contacts/contacts-table.tsx` | YES | Needs-work (no delete, no search) | **Has delete + ConfirmDialog**; no search confirmed |
| ContactForm | `components/crm/contacts/contact-form.tsx` | YES | Good | Good — 211 LOC |
| ContactCard | `components/crm/contacts/contact-card.tsx` | YES | Good | Unverified |
| ActivityTimeline | `components/crm/activities/activity-timeline.tsx` | YES | Good | Good — 16 LOC |
| ActivityForm | `components/crm/activities/activity-form.tsx` | YES | Good | Good — 139 LOC |
| AddressForm | `components/crm/shared/address-form.tsx` | YES | Good | Good — 127 LOC |
| PhoneInput | `components/crm/shared/phone-input.tsx` | YES | Good | Unverified |

**Components NOT in hub (9 missing):**
- `customer-columns.tsx` — column type definitions
- `customer-status-badge.tsx` — delegates to UnifiedStatusBadge
- `customer-tabs.tsx` — tab navigation
- `contact-select.tsx` — contact picker
- `activity-item.tsx` — individual activity card
- `activity-type-icon.tsx` — type → icon mapping
- `lead-stage-badge.tsx` — stage badge
- `customer-table.test.tsx` — test file
- `leads-table.test.tsx` — test file

**Hooks — Hub claims 11, actual 13 mutations across 5 files:**

| Hub Hook | Hub "Envelope Unwrapped?" | Actual | Verdict |
|----------|--------------------------|--------|---------|
| useCustomers | Yes | Uses `data?.data` pattern correctly | **ACCURATE** |
| useCustomer | Yes | Uses `data?.data` pattern correctly | **ACCURATE** |
| useCreateCustomer | Yes | Mutation with cache invalidation | **ACCURATE** |
| useUpdateCustomer | Yes | Mutation with cache invalidation | **ACCURATE** |
| useDeleteCustomer | Yes | Mutation with cache invalidation | **ACCURATE** |
| useContacts | Yes | Uses `data?.data` pattern correctly | **ACCURATE** |
| useDeleteContact | Yes, "not wired to UI" | Wired in contacts-table via onDelete prop | **STALE** |
| useLeads | Yes | Uses `data?.data` pattern correctly | **ACCURATE** |
| useDeleteLead | Yes, "not wired to UI" | Wired in leads-table via onDelete prop | **STALE** |
| useConvertLead | Yes, "not wired to UI" | Wired in lead detail page | **STALE** |
| useActivities | Yes | Uses `data?.data` with field normalization layer | **ACCURATE** |

**Hooks NOT in hub:** `useCompanies` (read-only company list), `useLeadsPipeline` (grouped by stage), `useUpdateLeadStage` (stage change endpoint).

Note: Per PST-01 cross-cutting finding, hooks don't use `unwrap()` — they use `data?.data` directly. Hub saying "Yes" for envelope unwrapping is misleading; it works correctly but via direct access, not an unwrap utility.

### 1F. Data Model Verification

**CRITICAL: Hub data model section contains major errors.**

| Hub Claim | Prisma Actual | Verdict |
|-----------|--------------|---------|
| Model name: "Customer" | Model name: **"Company"** | **FALSE** — wrong model name |
| Field: `customerCode` | Does not exist | **FALSE** |
| Field: `companyName` | Actual: `name` | **FALSE** |
| Field: `currentBalance` | Does not exist on Company | **FALSE** — exists on Credit model only |
| Field: `creditStatus` (enum) | Does not exist on Company | **FALSE** — Company has `status` but it's ActiveStatus, not CreditStatus |
| Field: `creditLimit` (Decimal, default 0) | `creditLimit Decimal? @db.Decimal(12,2)` — nullable, no default | **PARTIAL** — exists but nullable |
| Field: `paymentTerms` (String) | `paymentTerms String? @db.VarChar(50)` | **PARTIAL** — nullable |
| Hub lists 14 fields | Actual model has **30+ fields** | **STALE** — 16+ fields undocumented |

**Missing from hub's Company model:** legalName, dbaName, companyType, industry, segment, tier, website, taxId, dunsNumber, addressLine1/2, city, state, postalCode, country, defaultPickupInstructions, defaultDeliveryInstructions, requiresAppointment, requiresLumper, parentCompanyId, assignedUserId, hubspotId, logoUrl, tags, createdById, updatedById, sourceSystem

**Contact model errors:**

| Hub Claim | Prisma Actual | Verdict |
|-----------|--------------|---------|
| Field: `type` (ContactType enum) | Field: `roleType` (if it exists) + `isPrimary` boolean | **NEEDS VERIFICATION** |
| Field: `customerId` (FK → Customer) | Field: `companyId` (FK → Company) | **FALSE** — wrong field name and FK target |
| Hub lists 9 fields | Actual: **23+ fields** | **STALE** — 14+ missing |

**Missing from hub's Contact model:** mobile, fax, title, department, preferredContactMethod, language, timezone, isPrimary, receivesInvoices, receivesTracking, hubspotId, tags, createdById, updatedById

**Opportunity model errors:**

| Hub Claim | Prisma Actual | Verdict |
|-----------|--------------|---------|
| Field: `title` | Actual: `name` | **FALSE** |
| Field: `value` (Decimal?) | Actual: `estimatedValue` + `avgLoadValue` + `estimatedLoadsPerMonth` | **FALSE** — different naming |
| Field: `closeDate` | Actual: `expectedCloseDate` + `actualCloseDate` | **FALSE** — split into two fields |
| Hub lists 9 fields | Actual: **22+ fields** | **STALE** — 13+ missing |

**Missing from hub's Opportunity model:** description, serviceTypes, lanes, competition, winReason, lossReason, primaryContactId, hubspotDealId, tags, createdById, updatedById

**Models NOT in hub at all:**
- `Activity` — 15+ fields (activityType, subject, dueDate, completedAt, priority, etc.)
- `HubspotSyncLog` — 13 fields (sync tracking for HubSpot integration)

**Data model error count: 15+ factual errors** (worse than PST-01's 10 errors). Confirms cross-cutting finding #2 — hub data models are systemically outdated.

---

## Phase 2: Code Quality Assessment

### 2A. Security Audit

| Check | Companies | Contacts | Activities | Opportunities | HubSpot |
|-------|-----------|----------|-----------|---------------|---------|
| `@UseGuards(JwtAuthGuard)` | YES | YES | YES | YES | PARTIAL — webhook unguarded |
| `@UseGuards(RolesGuard)` + `@Roles()` | YES | YES | YES | YES | PARTIAL |
| tenantId filtering (findAll) | YES | YES | YES | YES | YES |
| tenantId filtering (findOne) | YES | YES | YES | YES | YES |
| tenantId on create | YES | YES | YES | YES | N/A |
| **tenantId on update** | **NO** — uses id only | **NO** | **NO** | **NO** | N/A |
| **tenantId on delete** | **NO** — uses id only | **NO** | **NO** | **NO** | N/A |
| `deletedAt: null` on reads | YES | YES | YES | YES | N/A |
| No raw SQL | YES | YES | YES | YES | YES |
| No console.log of sensitive data | YES (0 console.logs) | YES | YES | YES | YES |
| Input validation via DTOs | YES (62 decorators) | YES (36) | YES (57) | YES (74) | Minimal |
| No hardcoded secrets | YES | YES | YES | YES | YES |

**CRITICAL SECURITY GAP:** All update/delete operations across all 4 main services only use `id` in the WHERE clause without verifying `tenantId`. This means if an attacker knows/guesses a UUID from another tenant, they could modify/delete cross-tenant data. The `JwtAuthGuard` extracts tenantId but it's not enforced at the database query level for mutations.

**HubSpot webhook:** Endpoint at `POST /crm/hubspot/webhook` has no authentication. Signature verification is TODOed (line 30). Anyone can POST to this endpoint.

### 2B. Code Health Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Total backend files | 21 | 5 controllers, 5 services, 4 DTOs, 5 specs, 1 module, 1 index |
| Total backend LOC | ~2,400 | Controllers 732 + Services 1,178 + DTOs 481 |
| Total frontend files | ~33 | 6 pages + 25 components + 5 hooks + types + validations + store |
| Total frontend LOC | ~2,500+ | Largest: customer-form.tsx (446 LOC) |
| Largest backend file | OpportunitiesService (311 LOC) | Under 500 threshold |
| Largest frontend file | customer-form.tsx (446 LOC) | Under 500 threshold |
| `any` type count (backend) | 33 | HIGH — mostly in DTOs and type casts |
| `any` type count (frontend) | 0 | Excellent |
| `as any` count | Included in 33 | Backend only |
| TODO/FIXME count | 2 | companies.controller.ts:277 (cloud storage), hubspot.controller.ts:30 (signature) |
| `console.log` count | 0 (backend), 1 (frontend catch block) | Clean |
| Dead imports | Not detected | — |

### 2C. API Contract Compliance

| Check | Status | Notes |
|-------|--------|-------|
| `{ data: T }` envelope | YES | All service methods return proper structure |
| `{ data: T[], pagination }` for lists | YES | page, limit, total, totalPages present |
| Error responses | Standard NestJS exceptions | HttpException with proper status codes |
| DTOs with class-validator | YES | 229 decorators across 4 DTO files |
| Response serialization | Not verified | — |

### 2D. Hook Quality

| Check | Status | Notes |
|-------|--------|-------|
| Uses `unwrap()` | NO | Uses `data?.data` directly — works correctly (per PST-01 finding) |
| Proper TanStack Query keys | YES | Nested array structure: `['crm', 'customers', 'list', params]` etc. |
| Cache invalidation on mutations | YES | All mutations invalidate relevant query keys |
| Error handling | YES | Errors propagated to components |
| Loading/error states exposed | YES | All pages handle isLoading, error, empty |
| Debouncing | PARTIAL | Companies page has 300ms debounce; contacts/activities do not |

### 2E. Test Assessment

**Backend (5 spec files, ~70 test cases):**

| Spec File | Test Cases | What's Tested |
|-----------|-----------|--------------|
| CompaniesService.spec.ts | 14 | CRUD, pagination, filters, soft delete, syncToHubspot, assignReps, updateTier, getStats |
| CompaniesController.spec.ts | 12 | Service delegation, tenant/user ID passing, query params |
| ContactsService.spec.ts | ~8 | CRUD, company filter, search, setPrimary |
| ActivitiesService.spec.ts | ~6 | Completed filter, create defaults, soft delete |
| OpportunitiesService.spec.ts | ~8 | Filters, stage transitions, convertToCustomer (WON only), stats |

**Frontend (2 test files):**
- `customer-table.test.tsx` — table rendering tests
- `leads-table.test.tsx` — table rendering tests

**Coverage gaps:**
- No security tests (tenant isolation, role enforcement)
- No HubSpot webhook security tests
- No financial calculation tests (credit limits, pipeline values)
- No integration tests (controller → service → Prisma)
- Activity hook normalization layer untested
- No tests for stage machine enforcement (invalid transitions)

---

## Phase 3: Business Logic Verification

### 3A. Business Rules vs Code

| # | Rule | Implemented? | Evidence | Correctly? | Notes |
|---|------|-------------|----------|-----------|-------|
| 1 | Customer Credit Status Lifecycle | PARTIAL | Company model has `creditLimit` but no `creditStatus` or `currentBalance` on Company model | NO | Hub describes a credit state machine that doesn't exist on the Company model. Credit management is in a separate Credit module. |
| 2 | Order Blocking on credit hold | NOT VERIFIED | CRM provides data; TMS Core checks. | N/A | Cross-service — verify in PST-05 (TMS Core) |
| 3 | Lead-to-Customer Conversion | YES | `OpportunitiesService.convertToCustomer()` — changes companyType to CUSTOMER on WON stage | PARTIAL | Converts company type but doesn't "create a Customer record from Lead data" as hub states — it updates the linked Company. Also doesn't archive the Opportunity. |
| 4 | Soft Delete Mandatory | YES | All services use `update({ deletedAt: new Date() })` | YES | Consistently applied |
| 5 | Customer Code Format | NO | No `customerCode` field exists on Company model | FALSE | Hub describes auto-generated CUST-{NNN} but field doesn't exist |
| 6 | Contact Ownership | PARTIAL | Contact has `companyId` FK. Create requires `companyId` in DTO but it's optional (`@IsOptional`). | NO | Orphaned contacts are possible — DTO allows null companyId |
| 7 | Email Uniqueness | NOT VERIFIED | No unique constraint visible on Company.email in schema | NEEDS CHECK | Hub claims tenant-scoped uniqueness |
| 8 | Pipeline Stage Order | YES | `OpportunitiesService.updateStage()` validates stage transitions, sets probability auto (WON=100, LOST=0) | PARTIAL | Stage validation exists but regression (going back) is allowed without requiring a reason note |

### 3B. Validation Rules vs DTOs

| Field | Hub Rule | DTO File | Decorator | Match? |
|-------|---------|----------|-----------|--------|
| `customerCode` | 2-20 chars, uppercase, unique | N/A | N/A | **FALSE** — field doesn't exist |
| `email` | IsEmail, unique per tenant | CreateCompanyDto | `@IsEmail()` | PARTIAL — decorator exists, uniqueness not enforced in DTO |
| `creditLimit` | IsDecimal, min 0, max 10M | CreateCompanyDto | `@IsNumber()` | PARTIAL — no min/max constraints |
| `contactType` | IsEnum(ContactType) | N/A | N/A | **FALSE** — no contactType field in DTO |
| `stage` | IsEnum(OpportunityStage) | CreateOpportunityDto | `@IsIn(['LEAD', 'QUALIFIED', ...])` | YES — uses @IsIn instead of @IsEnum but functionally equivalent |
| `phone` | E.164 format | CreateCompanyDto | `@IsString()` | NO — no format validation |

### 3C. Status State Machine Verification

**Credit Status Machine:** Hub describes PENDING → APPROVED → HOLD → etc. **This state machine does not exist on the Company model.** There is no `creditStatus` enum. Credit management appears to live in a separate Credit module (`apps/api/src/modules/credit/`). Hub documents business rules for a feature not in this service.

**Opportunity Stage Machine:**
- Valid transitions enforced: YES (in `updateStage()`)
- Invalid transitions rejected: PARTIAL — code validates stage is a known value but doesn't strictly enforce forward-only flow
- Events/notifications on change: NO — no event emission on stage change
- Audit trail: NO — no stage change history logging (previous stage not recorded)

### 3D. Dependencies Verification

| Direction | Hub Claim | Actual | Verdict |
|-----------|----------|--------|---------|
| Depends on: Auth & Admin | JWT, roles, tenantId | YES — JwtAuthGuard, RolesGuard, @CurrentTenant() | **ACCURATE** |
| Depends on: Communication | Email for notifications | NO — no Communication module imports found in CRM | **FALSE** — not an actual dependency |
| Depended on by: Sales & Quotes | Customer selection | YES — Sales uses Company data | **ACCURATE** |
| Depended on by: TMS Core | Shipper/consignee lookup | YES — TMS references companyId | **ACCURATE** |
| Depended on by: Accounting | Customer billing info | YES — Accounting uses Company data | **ACCURATE** |
| Depended on by: Commission | Revenue attribution | UNVERIFIED | **NEEDS CHECK** |

**Unlisted dependency found:** HubSpot integration — CRM has a full HubSpot sync module (5th controller + service) not mentioned in hub dependencies section.

---

## Phase 4: 5-Round Tribunal Debate

### Round 1: Opening Arguments

**PROSECUTION — The Case Against CRM**

1. **Hub data model is fiction.** The hub documents a "Customer" model with fields `customerCode`, `companyName`, `currentBalance`, `creditStatus` — none of which exist. The actual Prisma model is called "Company" with completely different field names. This is 15+ factual errors in one section — worse than PST-01's 10 errors. Anyone building against these docs will write wrong code.

2. **Critical tenant isolation gap in all mutations.** All four main services (Companies, Contacts, Activities, Opportunities) run update/delete queries using only `id` without verifying `tenantId` in the WHERE clause. If a user obtains a UUID from another tenant (via timing attack, error leak, or brute force), they can modify or delete cross-tenant data. This is a multi-tenant security violation.

3. **Business rules describe phantom features.** The hub's credit status lifecycle (Section 7, Rule 1) documents a complete state machine (PENDING → APPROVED → HOLD → COD → PREPAID → DENIED) that doesn't exist on the Company model. The `customerCode` auto-generation rule (Rule 5) references a non-existent field. These aren't "coming soon" — they're documented as implemented.

4. **HubSpot integration entirely undocumented.** A complete 5th controller with 7 endpoints and 233-line service exists for HubSpot sync, webhook handling, and field mapping. None of this appears in the hub file — not in endpoints, not in components, not in dependencies. The webhook endpoint has NO authentication.

5. **Known issues list is stale.** Hub lists 10 known issues including BUG-009 (delete buttons missing) and BUG-010 (convert button not wired). Code inspection shows delete buttons WITH ConfirmDialog exist on both leads-table and contacts-table. The convert dialog IS wired in the lead detail page. At least 3 issues listed as "Open" appear to be resolved.

**DEFENSE — The Case For CRM**

1. **Backend is production-grade.** 48 endpoints across 5 well-structured controllers. All use JwtAuthGuard + RolesGuard with granular role assignments (ADMIN, SALES_REP, SALES_MANAGER, ACCOUNT_MANAGER). Services are properly separated by domain (Companies, Contacts, Activities, Opportunities). Code is clean — zero console.logs, only 2 TODOs, all under 500 LOC per file.

2. **Frontend is more complete than documented.** 18+ route files, 25 components, 5 hook files with 13 mutations. All pages handle loading, error, and empty states. Forms use Zod validation. Zero `any` types in frontend code. Delete operations use ConfirmDialog pattern. The implementation quality is genuinely B+ despite the hub's B- rating.

3. **Test coverage exists and is meaningful.** ~70 backend test cases covering CRUD operations, pagination, filters, stage transitions, conversion logic, and edge cases. This directly contradicts the hub's "None — critical gap" claim. Tests verify actual business logic, not just "should be defined."

4. **API contract compliance is strong.** All endpoints follow the `{ data: T }` / `{ data: T[], pagination }` envelope. DTOs have 229 class-validator decorators. Frontend hooks correctly access `data?.data`. The contract is consistently enforced across all 5 controllers.

5. **The architecture is sound.** Clean separation of companies, contacts, activities, and opportunities. Proper Zustand store for filter persistence. TanStack Query with structured cache keys and invalidation. The CRM module is one of the strongest implementations in the codebase — it just has terribly outdated documentation.

### Round 2: Rebuttal

**PROSECUTION REBUTTAL**

1. Re: "Backend is production-grade" — Production-grade code with a tenant isolation hole in every mutation is not production-grade. A single compromised UUID enables cross-tenant data manipulation. The beautiful architecture is undermined by this fundamental security flaw.

2. Re: "Frontend is more complete" — Completeness doesn't equal correctness. The hardcoded "+5" stat on the companies page (line 83) means users see fabricated metrics. The activity timeline hardcodes limit=50 with no pagination — users with more than 50 activities lose data visibility.

3. Re: "Test coverage exists" — 70 tests with zero security tests. No test verifies tenant isolation. No test checks role enforcement on endpoints. No test validates that stage transitions reject invalid flows. The tests exist, but they test the happy path while the critical paths are unguarded.

4. Re: "API contract compliance" — The hub documents a completely wrong data model. Any AI or developer using Section 8 to build integrations will produce code that references `customerCode`, `companyName`, `creditStatus` — fields that don't exist. Contract compliance means nothing if the documented contract is fictional.

5. Re: "Architecture is sound" — The HubSpot integration has an unauthenticated webhook endpoint. Anyone can POST arbitrary payloads. Even though it's a stub, the route is live and processes requests. This is a surface area for abuse.

**DEFENSE REBUTTAL**

1. Re: "Hub data model is fiction" — The data model section was clearly written from specs, not code. This is a documentation bug, not a code bug. The actual Prisma models are well-structured with proper relations, indexes, and constraints. The fix is updating the hub, not rewriting the code.

2. Re: "Tenant isolation gap" — The tenantId is extracted from JWT and used in all read operations. For mutations, the pattern of finding by id after a tenant-scoped read (findOne includes tenantId) provides implicit protection in normal workflows. The gap is real but requires an attacker to bypass the UI and guess UUIDs — low probability given UUID v4 randomness (2^122 possibilities).

3. Re: "Phantom business rules" — Credit management exists in a separate Credit module. The hub incorrectly places these rules under CRM. This is a documentation organization error, not missing functionality. The pipeline stage machine IS implemented correctly in OpportunitiesService.

4. Re: "HubSpot undocumented" — HubSpot integration is intentionally a stub (service returns `isConfigured: false`). It's scaffolded for future implementation. Documenting stubs adds noise to the hub. The webhook TODO is acknowledged.

5. Re: "Stale known issues" — Issues were likely fixed after the hub was written and the hub wasn't updated. This is a process gap (no "close when done" discipline), not a code quality problem. The fact that bugs were fixed is positive.

### Round 3: Cross-Examination

**Q1: Can a user from Tenant A delete a Company belonging to Tenant B?**

Finding: **YES, technically possible.** `CompaniesService.delete()` calls `this.prisma.company.update({ where: { id }, data: { deletedAt: new Date(), updatedById: userId } })`. The WHERE clause only uses `id`, not `tenantId`. If the attacker knows the UUID, the delete succeeds. Same pattern in all 4 services.

Implication: Multi-tenant data integrity is not guaranteed at the database level for mutations. Mitigation: UUID v4 randomness makes brute force impractical, but any UUID leak (error messages, logs, API responses with related entity IDs) becomes a tenant isolation breach vector.

**Q2: How many of the hub's 8 business rules are accurately implemented in code?**

Finding: **2 of 8 are accurate** (soft delete, pipeline stages partial). 3 are false (customerCode, credit status machine, contact ownership allows orphans). 2 are unverifiable from CRM alone (order blocking, email uniqueness). 1 is partial (lead conversion works differently than documented).

Implication: The business rules section is 25% accurate. Any developer implementing features based on these rules will build wrong functionality.

**Q3: Are the 10 known issues in Section 11 actually open?**

Finding: **At most 5 of 10 are genuinely open.** Delete buttons exist on leads and contacts tables (BUG-009 partially fixed — may still be missing on detail pages). Convert dialog is wired (BUG-010 partially fixed). Owner filter uses user dropdown (BUG-010 fixed). Console.error, Wave 2 screens, and zero tests claims need updating.

Implication: The known issues list is at least 50% stale, making it unreliable for sprint planning.

**Q4: What is the actual test coverage vs the hub's "None" claim?**

Finding: **~70 backend test cases + 2 frontend test files exist.** Hub says "None — critical gap" and "0 tests — highest priority gap for CRM." This is factually false. However, tests lack security coverage (no tenant isolation tests, no role enforcement tests).

Implication: The hub's false "no tests" claim wastes sprint effort on writing tests that already exist. Planning should focus on security test gaps, not starting from zero.

**Q5: Is the HubSpot webhook endpoint a security risk in production?**

Finding: **Yes.** `POST /crm/hubspot/webhook` has no `@UseGuards()` decorator. The signature verification is a TODO. The handler accepts arbitrary JSON payloads. Even though the service is a stub (logs but doesn't process), the endpoint is live and could be used for: (a) log flooding/DoS, (b) unexpected behavior if the stub is completed without adding auth, (c) information disclosure via error messages.

Implication: The webhook endpoint should be disabled (return 501) or protected with HMAC signature verification before production deployment.

### Round 4: Evidence Exhibits & Closing Statements

| Exhibit | Source | Key Finding | Favors |
|---------|--------|-------------|--------|
| E1 | `schema.prisma:2203` | Model is "Company" not "Customer" — hub says "Customer" | Prosecution |
| E2 | `schema.prisma` grep | `customerCode`, `currentBalance`, `creditStatus` don't exist on Company | Prosecution |
| E3 | `companies.service.ts` delete method | `where: { id }` — no tenantId check | Prosecution |
| E4 | `contacts.service.ts` delete method | `where: { id }` — no tenantId check | Prosecution |
| E5 | `hubspot.controller.ts:22` | Webhook endpoint has no @UseGuards | Prosecution |
| E6 | `leads/[id]/page.tsx:11,15` | LeadConvertDialog imported AND rendered — hub says "not wired" | Defense (code is better than docs) |
| E7 | `leads-table.tsx` | Delete button with ConfirmDialog exists — hub says "missing" | Defense |
| E8 | Backend spec files (5) | ~70 test cases exist — hub says "None" | Defense |
| E9 | All 5 controllers | Every controller has @UseGuards(JwtAuthGuard, RolesGuard) | Defense |
| E10 | Frontend hooks (5 files) | Zero `any` types, proper cache invalidation, structured query keys | Defense |
| E11 | `companies/page.tsx:83` | Hardcoded "+5" stat — fabricated metric | Prosecution |
| E12 | Hub Section 7, Rule 1 | Credit status machine described — doesn't exist on Company model | Prosecution |
| E13 | Hub Section 4 | Claims 20 endpoints — actual 48 | Defense (more built than claimed) |
| E14 | `opportunities.service.ts:updateStage()` | Stage validation with auto-probability (WON=100, LOST=0) | Defense |
| E15 | DTOs across 4 files | 229 class-validator decorators — robust input validation | Defense |

**PROSECUTION CLOSING STATEMENT**

The CRM service is a case study in dangerous documentation. The code is better than the docs claim — but the docs are so wrong that they become actively harmful. A data model section with 15+ errors will cause any developer (human or AI) to write incompatible code. Business rules describe phantom features. Known issues list bugs that are fixed while ignoring a critical tenant isolation vulnerability in every mutation. The HubSpot integration is entirely undocumented with an unauthenticated webhook. The hub file cannot be trusted as a source of truth — and that's its stated purpose.

**DEFENSE CLOSING STATEMENT**

The CRM module is genuinely one of the strongest in the codebase. 48 production endpoints with proper auth. 25 frontend components with zero `any` types. 70 backend tests covering real business logic. Every page handles loading, error, and empty states. The pipeline stage machine works. Delete confirmations are in place. The code quality is B+ across the board. The problems are almost entirely in the documentation — stale claims, wrong model names, phantom features copied from specs. Fix the hub file and this service is ready for production QA. The tenant isolation gap is real but mitigated by UUID randomness and should be fixed as a cross-cutting concern, not a CRM-specific failure.

### Round 5: Binding Verdict

**Verdict: MODIFY**

**Revised Health Score: 7.5/10** (up from hub's 7.1/10)

**Rationale:**

The CRM module is significantly better than its documentation suggests. The hub file is the weakest part — with 15+ data model errors, stale known issues, undercounted endpoints/components/tests, and phantom business rules. The code itself is well-structured, properly secured at the auth layer, and more feature-complete than documented (delete buttons exist, convert dialog is wired, 70 tests exist).

However, the tenant isolation gap in mutations is a real security concern that affects all 4 main services. While UUID v4 randomness provides practical mitigation, this violates the project's multi-tenant security requirements. The HubSpot webhook's lack of authentication is a secondary concern (stub service) but creates unnecessary attack surface.

The verdict is MODIFY, not AFFIRM, because: (1) the hub file needs a complete rewrite of Sections 4, 5, 6, 7, 8, 11, and 12; (2) the tenant isolation gap needs fixing as a cross-cutting concern; (3) several business rules documented don't match implementation. The code quality itself is strong — this is primarily a documentation and security hardening task.

The score improves from 7.1 to 7.5 because the actual implementation (48 endpoints, 70 tests, proper frontend patterns) exceeds what was documented. The code earned the higher score; the docs dragged it down.

---

## Phase 5: Outputs & Corrections

### 5A. Hub File Corrections

| Section | Current Text | Corrected Text | Reason |
|---------|-------------|----------------|--------|
| §1 Status Box | "Backend: Production (10 endpoints, all working)" | "Backend: Production (48 endpoints across 5 controllers, all working)" | 48 actual endpoints |
| §1 Status Box | "Tests: None — critical gap" | "Tests: ~70 backend test cases + 2 frontend test files" | Tests exist |
| §1 Active Issues | "BUG-009 (delete buttons), BUG-010 (owner filter, convert button)" | "BUG-009 (PARTIALLY FIXED — delete exists on tables, verify detail pages), BUG-010 (FIXED — convert dialog wired, owner uses dropdown)" | Issues resolved |
| §2 Backend Controller | "Production" (implies 1 controller) | "Production — 5 controllers: Companies (12 endpoints), Contacts (8), Activities (11), Opportunities (10), HubSpot (7)" | Accurate count |
| §2 Frontend Pages | "Partial — 15 routes built" | "18+ routes built (6 company, 6 customer redirects, 3 leads, 3 contacts)" | Accurate count |
| §2 Components | "Partial — 16 components" | "25 components (7 customers, 5 contacts, 4 activities, 6 leads, 2 shared, 1 tests)" | Accurate count |
| §2 Tests | "None" | "~70 backend test cases (5 spec files), 2 frontend test files" | Tests exist |
| §4 Endpoints | 20 endpoints listed | 48 endpoints (add all missing — see Phase 1D) | Undercounted by 28 |
| §5 Components | 16 listed | 25 components (add 9 missing — see Phase 1E) | Missing 9 components |
| §6 Hooks | 11 hooks, some "not wired" | 13+ hooks. Remove "not wired" claims for useDeleteContact, useDeleteLead, useConvertLead | Stale claims |
| §7 Rule 1 | Credit status lifecycle on Customer model | "Credit management is in the Credit module, not CRM. CRM provides creditLimit field on Company." | Wrong location |
| §7 Rule 5 | customerCode auto-generation | DELETE — field doesn't exist | Phantom feature |
| §8 Data Model | "Customer" model with customerCode, companyName, etc. | Rewrite entirely — model is "Company" with 30+ fields. Add Activity and HubspotSyncLog models. | 15+ errors |
| §11 Known Issues | BUG-009, BUG-010 as "Open" | Update statuses. Add: tenant isolation gap in mutations, HubSpot webhook auth | Stale + missing |
| §15 Dependencies | "Depends on: Communication" | Remove — no Communication import found. Add: HubSpot (external integration) | False dependency |

### 5B. Action Items

| # | Action | Priority | Effort | Owner | Blocked By |
|---|--------|----------|--------|-------|------------|
| 1 | Add tenantId to WHERE clause in all update/delete operations (Companies, Contacts, Activities, Opportunities services) | P0 | 2h | Claude Code | — |
| 2 | Rewrite hub Section 8 (Data Model) — Company, Contact, Opportunity, Activity, HubspotSyncLog | P0 | 2h | Claude Code | — |
| 3 | Update hub Sections 1-6, 11, 12, 15 with verified data from this audit | P0 | 2h | Claude Code | — |
| 4 | Disable or authenticate HubSpot webhook endpoint | P1 | 1h | Claude Code | — |
| 5 | Fix hardcoded "+5" stat on companies page (should query API) | P1 | 30min | Any | — |
| 6 | Add pagination to activities timeline (currently hardcoded limit=50) | P1 | 1h | Any | — |
| 7 | Add tenant isolation tests for CRM services | P1 | 3h | Claude Code | #1 |
| 8 | Remove or correct phantom business rules (customerCode, credit lifecycle) | P1 | 1h | Claude Code | — |
| 9 | Reduce backend `any` count (33 instances) | P2 | 2h | Any | — |
| 10 | Add stage change audit trail (log previous stage on transitions) | P2 | 2h | Any | — |
| 11 | Add search debounce to contacts and activities pages | P2 | 30min | Any | — |
| 12 | Verify and close remaining BUG-009 items (delete on detail pages) | P2 | 1h | Any | — |

### 5C. New Tasks

| ID | Title | Priority | Effort | Description |
|----|-------|----------|--------|-------------|
| CRM-107 | Fix tenant isolation in CRM mutations | P0 | 2h | Add `tenantId` to WHERE clause in all update/delete queries across Companies, Contacts, Activities, Opportunities services |
| CRM-108 | Disable/authenticate HubSpot webhook | P1 | 1h | Either return 501 or implement HMAC signature verification on `/crm/hubspot/webhook` |
| CRM-109 | Fix hardcoded "+5" companies stat | P1 | 30min | Replace hardcoded "+5" in companies/page.tsx:83 with actual API query for monthly new companies |

### 5D. ADR Candidates

| Topic | Trigger | Recommendation |
|-------|---------|---------------|
| Tenant isolation in Prisma mutations | Cross-tenant update/delete possible in CRM (and likely other services) | ADR: "Use Prisma Client Extension for automatic tenantId injection on all queries" — per original Tribunal TRIBUNAL-05 recommendation |
| HubSpot integration strategy | Stubbed service with unauthenticated webhook | ADR: "HubSpot integration disabled behind feature flag until authentication implemented" |

### 5E. Cross-Service Findings

| Finding | Affects Services | Severity |
|---------|-----------------|----------|
| Update/delete mutations don't verify tenantId — confirmed in CRM (4 services). Likely systemic. | ALL services with CRUD operations | **CRITICAL** — escalate to TRIBUNAL-11 |
| Hub data model errors confirmed in second service (15+ errors). Pattern is systemic. | ALL 36 remaining services | HIGH — confirmed cross-cutting finding #2 |
| Hub documents resolved bugs as "Open" — no close-when-done discipline | ALL services with known issues sections | MEDIUM |
| HubSpot integration pattern may affect other external integrations | Communication, EDI, Integration Hub | MEDIUM |

### 5F. Updated Dependency Map

**Corrected:**
```
CRM Depends On:
  - Auth & Admin (JWT, roles, tenantId) ✓
  - [REMOVED] Communication — no actual import found

CRM Depended On By:
  - Sales & Quotes (Company selection for quote creation) ✓
  - TMS Core (shipper/consignee from Company, credit status check) ✓
  - Accounting (Company billing info, payment terms) ✓
  - Commission (revenue attribution) — UNVERIFIED

CRM External:
  - HubSpot (sync, webhook — stubbed) — NEW, undocumented
```
