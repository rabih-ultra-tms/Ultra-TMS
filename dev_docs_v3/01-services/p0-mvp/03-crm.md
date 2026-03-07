# Service Hub: CRM (03)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-07
> **Original definition:** `dev_docs/02-services/` (CRM service definition)
> **Design specs:** `dev_docs/12-Rabih-design-Process/02-crm/` (13 files)
> **v2 hub (historical):** `dev_docs_v2/03-services/02-crm.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | B- (7.1/10) |
| **Confidence** | High — audited Feb 2026 |
| **Last Verified** | 2026-03-07 |
| **Backend** | Production (10 endpoints, all working) |
| **Frontend** | Partial — Wave 1 (7 screens) built, Wave 2 (5 screens) not built |
| **Tests** | None — critical gap |
| **Active Issues** | BUG-009 (delete buttons), BUG-010 (owner filter, convert button) |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | `dev_docs/02-services/` CRM definition |
| Design Specs | Done | 13 files, all 15-section |
| Backend Controller | Production | `apps/api/src/modules/crm/` |
| Prisma Models | Production | Customer, Contact, Lead (Opportunity), Activity |
| Frontend Pages | Partial | 8 routes built (some with quality issues); 5 not built |
| React Hooks | Partial | CRUD hooks exist; pipeline hooks minimal |
| Components | Partial | 16 components; ContactsTable missing search/delete |
| Tests | None | 0 tests — highest priority gap for CRM |
| Security | Good | All endpoints use JwtAuthGuard + tenantId |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| Companies List | `/companies` | Built | B+ | Good search/pagination |
| Company Detail | `/companies/[id]` | Built | B | Tabbed view works |
| Company Create | `/companies/new` | Built | B+ | Zod validation |
| Contacts List | `/contacts` | Built | C | No search, no delete button — BUG-009 |
| Contact Detail | `/contacts/[id]` | Built | B | No delete button — BUG-009 |
| Contact Create | `/contacts/new` | Built | B+ | Zod validation works |
| Leads List | `/leads` | Built | B- | Table + pipeline, no delete, owner filter text input — BUG-009, BUG-010 |
| Lead Detail | `/leads/[id]` | Built | B | No convert button, no delete — BUG-010 |
| Lead Create | `/leads/new` | Built | B+ | Good validation |
| Customers | `/customers` | Redirect | — | Redirects to /companies |
| Opportunities List | `/crm/opportunities` | Not Built | — | Wave 2 |
| Activities Calendar | `/crm/activities` | Not Built | — | Wave 2 |
| Territory Mgmt | `/crm/territories` | Not Built | — | Wave 2 |
| Lead Import | `/crm/leads/import` | Not Built | — | Wave 2 — CSV/Excel wizard |

---

## 4. API Endpoints

| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/crm/customers` | CrmController | Production | List paginated, filterable by status/manager |
| POST | `/api/v1/crm/customers` | CrmController | Production | Create customer |
| GET | `/api/v1/crm/customers/:id` | CrmController | Production | Detail with contacts, orders summary |
| PATCH | `/api/v1/crm/customers/:id` | CrmController | Production | Update |
| DELETE | `/api/v1/crm/customers/:id` | CrmController | Production | Soft delete |
| GET | `/api/v1/crm/contacts` | CrmController | Production | List with search, company, status filters |
| POST | `/api/v1/crm/contacts` | CrmController | Production | Create contact |
| GET | `/api/v1/crm/contacts/:id` | CrmController | Production | Detail |
| PATCH | `/api/v1/crm/contacts/:id` | CrmController | Production | Update |
| DELETE | `/api/v1/crm/contacts/:id` | CrmController | Production | **Exists — no UI button (BUG-009)** |
| GET | `/api/v1/crm/opportunities` | CrmController | Production | List by stage |
| POST | `/api/v1/crm/opportunities` | CrmController | Production | Create lead/opportunity |
| GET | `/api/v1/crm/opportunities/:id` | CrmController | Production | Detail |
| PATCH | `/api/v1/crm/opportunities/:id` | CrmController | Production | Update |
| DELETE | `/api/v1/crm/opportunities/:id` | CrmController | Production | **Exists — no UI button (BUG-009)** |
| GET | `/api/v1/crm/opportunities/pipeline` | CrmController | Production | Grouped by stage for Kanban |
| PATCH | `/api/v1/crm/opportunities/:id/stage` | CrmController | Production | Stage change (drag-drop) |
| POST | `/api/v1/crm/opportunities/:id/convert` | CrmController | Production | **Convert to customer — no UI button (BUG-010)** |
| GET | `/api/v1/crm/activities` | CrmController | Production | Activity list |
| POST | `/api/v1/crm/activities` | CrmController | Production | Log activity |

---

## 5. Components

| Component | Path | Status | Shared? |
|-----------|------|--------|---------|
| CustomerTable | `components/crm/customers/customer-table.tsx` | Good | No |
| CustomerForm | `components/crm/customers/customer-form.tsx` | Good | No |
| CustomerDetailCard | `components/crm/customers/customer-detail-card.tsx` | Good | No |
| CustomerFilters | `components/crm/customers/customer-filters.tsx` | Good | No |
| LeadsTable | `components/crm/leads/leads-table.tsx` | Needs-work | No — missing delete column |
| LeadsPipeline | `components/crm/leads/leads-pipeline.tsx` | Needs-work | No — no confirm on drag, console.error |
| LeadForm | `components/crm/leads/lead-form.tsx` | Good | No |
| LeadCard | `components/crm/leads/lead-card.tsx` | Good | No |
| LeadConvertDialog | `components/crm/leads/lead-convert-dialog.tsx` | Good | No — built but not wired to UI |
| ContactsTable | `components/crm/contacts/contacts-table.tsx` | Needs-work | No — no delete, no search |
| ContactForm | `components/crm/contacts/contact-form.tsx` | Good | No |
| ContactCard | `components/crm/contacts/contact-card.tsx` | Good | No |
| ActivityTimeline | `components/crm/activities/activity-timeline.tsx` | Good | Yes |
| ActivityForm | `components/crm/activities/activity-form.tsx` | Good | No |
| AddressForm | `components/crm/shared/address-form.tsx` | Good | Yes |
| PhoneInput | `components/crm/shared/phone-input.tsx` | Good | Yes |

---

## 6. Hooks

| Hook | Endpoints Used | Envelope Unwrapped? | Notes |
|------|---------------|---------------------|-------|
| `useCustomers` | `/crm/customers` | Yes | Paginated list |
| `useCustomer` | `/crm/customers/:id` | Yes | Single detail |
| `useCreateCustomer` | POST `/crm/customers` | Yes | Mutation |
| `useUpdateCustomer` | PATCH `/crm/customers/:id` | Yes | Mutation |
| `useDeleteCustomer` | DELETE `/crm/customers/:id` | Yes | Mutation |
| `useContacts` | `/crm/contacts` | Yes | Paginated list |
| `useDeleteContact` | DELETE `/crm/contacts/:id` | Yes | Exists — not wired to UI |
| `useLeads` | `/crm/opportunities` | Yes | Pipeline data |
| `useDeleteLead` | DELETE `/crm/opportunities/:id` | Yes | Exists — not wired to UI |
| `useConvertLead` | POST `/crm/opportunities/:id/convert` | Yes | Exists — not wired to UI |
| `useActivities` | `/crm/activities` | Yes | Activity log |

---

## 7. Business Rules

1. **Customer Credit Status Lifecycle:** A customer moves through: PENDING → APPROVED → HOLD/COD/PREPAID → APPROVED. Credit HOLD auto-triggers when `currentBalance > creditLimit` OR when 3+ invoices are overdue > 60 days. Manual hold requires admin reason. Release requires admin review.
2. **Order Blocking:** Customers with status PENDING, HOLD, DENIED, or COD cannot have orders created unless the COD/PREPAID condition is satisfied (payment collected first). The CRM module does not block orders directly — it provides credit status that TMS Core checks.
3. **Lead-to-Customer Conversion:** A Lead (Opportunity) converts to Customer via `POST /crm/opportunities/:id/convert`. This creates a Customer record from the Lead data, links all historical activities, and updates the Opportunity status to CONVERTED. The Lead record is preserved (soft-archived, not deleted).
4. **Soft Delete Mandatory:** All deletes set `deletedAt` timestamp. Hard deletes are forbidden. Deleted customers appear in a "deleted" filter only, not in default list views. 7-year retention before purge.
5. **Customer Code Format:** 2–20 characters, uppercase alphanumeric, unique per tenant. Auto-generated as `CUST-{NNN}` if not provided. Cannot be changed after creation (used as external reference).
6. **Contact Ownership:** Every Contact must belong to a Customer (company). Orphaned contacts (no company) are invalid. Contact type must be: PRIMARY, BILLING, OPERATIONS, EMERGENCY, or OTHER.
7. **Email Uniqueness:** Customer emails must be unique within a tenant. Contact emails must be unique within a customer. Duplicate email triggers a clear error message with the existing record ID.
8. **Pipeline Stage Order:** Leads flow through: NEW → QUALIFIED → PROPOSAL → NEGOTIATION → WON/LOST. Stage regression is allowed (can go back) but requires a reason note. WON auto-creates a customer conversion task.

---

## 8. Data Model

### Customer
```
Customer {
  id              String (UUID)
  customerCode    String (unique per tenant)
  companyName     String
  email           String
  phone           String?
  creditLimit     Decimal (default: 0)
  currentBalance  Decimal (default: 0)
  creditStatus    CreditStatus (PENDING, APPROVED, HOLD, COD, PREPAID, DENIED)
  paymentTerms    String (NET30, NET60, etc.)
  contacts        Contact[]
  opportunities   Opportunity[]
  orders          Order[]
  tenantId        String (FK → Tenant)
  createdAt       DateTime
  updatedAt       DateTime
  deletedAt       DateTime? (soft delete)
  external_id     String? (migration field)
  custom_fields   Json?
}
```

### Contact
```
Contact {
  id          String (UUID)
  firstName   String
  lastName    String
  email       String
  phone       String?
  title       String?
  type        ContactType (PRIMARY, BILLING, OPERATIONS, EMERGENCY, OTHER)
  customerId  String (FK → Customer)
  tenantId    String
  createdAt   DateTime
  updatedAt   DateTime
  deletedAt   DateTime?
}
```

### Opportunity (Lead)
```
Opportunity {
  id          String (UUID)
  title       String
  value       Decimal?
  stage       OpportunityStage (NEW, QUALIFIED, PROPOSAL, NEGOTIATION, WON, LOST, CONVERTED)
  probability Int? (0-100)
  closeDate   DateTime?
  customerId  String? (FK → Customer, set after conversion)
  ownerId     String (FK → User)
  tenantId    String
  createdAt   DateTime
  updatedAt   DateTime
  deletedAt   DateTime?
}
```

---

## 9. Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| `customerCode` | 2-20 chars, uppercase, unique per tenant | "Customer code must be 2-20 uppercase characters" |
| `email` | IsEmail, unique per tenant (customers) | "Invalid email / email already registered" |
| `creditLimit` | IsDecimal, min 0, max 10,000,000 | "Credit limit must be between 0 and 10M" |
| `contactType` | IsEnum(ContactType) | "Invalid contact type" |
| `stage` | IsEnum(OpportunityStage) | "Invalid pipeline stage" |
| `phone` | Optional, E.164 format if provided | "Invalid phone number format" |
| All deletes | Soft delete only (set deletedAt) | N/A — enforced server-side |

---

## 10. Status States

### Credit Status Machine
```
PENDING → APPROVED (admin review)
APPROVED → HOLD (auto: over limit or 3+ overdue; or manual)
APPROVED → COD (admin decision)
APPROVED → PREPAID (admin decision)
HOLD → APPROVED (admin release)
COD/PREPAID → APPROVED (admin change)
APPROVED → DENIED (admin, permanent — rare)
```

### Opportunity Stage Machine
```
NEW → QUALIFIED → PROPOSAL → NEGOTIATION → WON → CONVERTED
NEW/QUALIFIED/PROPOSAL/NEGOTIATION → LOST (with reason)
LOST → NEW (reopen)
```

---

## 11. Known Issues

| Issue | Severity | File | Status |
|-------|----------|------|--------|
| Delete buttons missing on Contacts table | P0 | `components/crm/contacts/contacts-table.tsx` | Open |
| Delete buttons missing on Leads table | P0 | `components/crm/leads/leads-table.tsx` | Open |
| No delete button on Contact/Lead detail pages | P0 | Detail page components | Open |
| Owner filter is text input (should be user dropdown) | P1 | `leads/page.tsx:93-98` | Open |
| No confirmation dialog on pipeline drag-drop stage change | P1 | `leads-pipeline.tsx:36-47` | Open |
| Convert-to-customer dialog not wired to Lead Detail | P1 | `leads/[id]/page.tsx` | Open |
| Contacts list has no search/filters (backend supports it) | P1 | `contacts/page.tsx` | Open |
| LeadsPipeline logs console.error on drag fail | P2 | `leads-pipeline.tsx` | Open |
| No Wave 2 screens built (Opportunities, Activities, Territories) | P2 | — | Deferred |
| Zero tests written | P1 | All CRM pages/components | Open |

---

## 12. Tasks

### Quality Sprint (Active)
| Task ID | Title | Effort | Status |
|---------|-------|--------|--------|
| BUG-009 | Add delete buttons (Contacts + Leads tables + detail pages) | M (2-3h) | Open |
| BUG-010 | Fix owner filter dropdown + stage confirm + convert button | M (3-4h) | Open |

### Backlog
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| CRM-101 | Add search/filters to Contacts list | S (2h) | P1 |
| CRM-102 | Write CRM component tests (CustomerTable, ContactsTable, LeadsTable) | M (4h) | P1 |
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
| Contacts with search | Contacts missing search | Regression |
| Full CRUD with delete | Delete UI not built | Bug |
| Lead conversion flow | Backend built, no UI | Wire-up gap |
| 13 screens planned | 9 built (some poor quality) | 4 not built |
| B+ grade target | B- achieved | Slightly below target |
| Tests required | 0 tests | Critical gap |

---

## 15. Dependencies

**Depends on:**
- Auth & Admin (JWT, roles, tenantId)
- Communication (email for lead notifications, activity reminders)

**Depended on by:**
- Sales & Quotes (customer selection for quote creation)
- TMS Core (shipper/consignee lookup from customer records, credit status check)
- Accounting (customer billing info, payment terms)
- Commission (customer revenue attribution)
