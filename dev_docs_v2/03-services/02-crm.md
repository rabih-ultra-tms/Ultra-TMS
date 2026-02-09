# Service 02: CRM

> **Grade:** B- (7.1/10) | **Priority:** Enhance | **Phase:** 0 (bugs) + future
> **Web Prompt:** `dev_docs/11-ai-dev/web-dev-prompts/02-crm-ui.md`
> **Design Specs:** `dev_docs/12-Rabih-design-Process/02-crm/` (13 files)

---

## Status Summary

Core CRUD operations work with B+ grades on form validation and API integration. Backend endpoints exist for all operations. Frontend has 5 critical gaps: Delete UI missing on Contacts and Leads, no "Convert-to-Customer" button, Owner filter uses text input instead of dropdown, Contacts missing search/filters, and stage change confirmations absent. Wave 1 (7 screens) built but needs enhancement; Wave 2 (5 screens) requires net-new builds.

---

## Screens

| Screen | Route | Status | Quality | Task ID | Notes |
|--------|-------|--------|---------|---------|-------|
| Companies List | `/companies` | Built | B+ | — | Good search/pagination |
| Company Detail | `/companies/[id]` | Built | B | — | Tabbed view works |
| Contacts List | `/contacts` | Built | C | BUG-009 | No search, no delete button |
| Contact Detail | `/contacts/[id]` | Built | B | BUG-009 | No delete button |
| Contact Create | `/contacts/new` | Built | B+ | — | Zod validation works |
| Leads List | `/leads` | Built | B- | BUG-009, BUG-010 | Table + pipeline, no delete, owner filter text input |
| Lead Detail | `/leads/[id]` | Built | B | BUG-010 | No convert button, no delete |
| Lead Create | `/leads/new` | Built | B+ | — | Good validation |
| Customers | `/customers` | Redirect | — | — | Redirects to /companies |
| Opportunities List | `/crm/opportunities` | Not Built | — | — | Wave 2 |
| Activities Calendar | `/crm/activities` | Not Built | — | — | Wave 2 |
| Territory Mgmt | `/crm/territories` | Not Built | — | — | Wave 2 |
| Lead Import | `/crm/leads/import` | Not Built | — | — | Wave 2 |

---

## Backend API

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/crm/customers` | GET/POST | Production | List + Create |
| `/crm/customers/:id` | GET/PATCH/DELETE | Production | Detail + Update + Soft delete |
| `/crm/contacts` | GET/POST | Production | List (supports search, company, status filters) + Create |
| `/crm/contacts/:id` | GET/PATCH/DELETE | Production | Detail + Update + **Delete exists, no UI** |
| `/crm/opportunities` | GET/POST | Production | List + Create |
| `/crm/opportunities/:id` | GET/PATCH/DELETE | Production | **Delete exists, no UI** |
| `/crm/opportunities/pipeline` | GET | Production | Leads by stage (Kanban) |
| `/crm/opportunities/:id/stage` | PATCH | Production | Stage change (drag-drop) |
| `/crm/opportunities/:id/convert` | POST | Production | **Convert exists, no UI button** |
| `/crm/activities` | GET/POST | Production | List + Create |

---

## Frontend Components

| Component | Path | Quality | Notes |
|-----------|------|---------|-------|
| CustomerTable | `crm/customers/customer-table.tsx` | Good | Expandable rows, pagination |
| CustomerForm | `crm/customers/customer-form.tsx` | Good | Zod, address autocomplete |
| CustomerDetailCard | `crm/customers/customer-detail-card.tsx` | Good | Summary card |
| CustomerFilters | `crm/customers/customer-filters.tsx` | Good | Status + manager filters |
| LeadsTable | `crm/leads/leads-table.tsx` | Good | **Missing delete column** |
| LeadsPipeline | `crm/leads/leads-pipeline.tsx` | Needs-work | **No confirm on drag, console.error** |
| LeadForm | `crm/leads/lead-form.tsx` | Good | Validation works |
| LeadCard | `crm/leads/lead-card.tsx` | Good | Pipeline card |
| LeadConvertDialog | `crm/leads/lead-convert-dialog.tsx` | Good | Built but **not wired to UI** |
| ContactsTable | `crm/contacts/contacts-table.tsx` | Needs-work | **No delete, no search** |
| ContactForm | `crm/contacts/contact-form.tsx` | Good | Good validation |
| ContactCard | `crm/contacts/contact-card.tsx` | Good | Status fallback |
| ActivityTimeline | `crm/activities/activity-timeline.tsx` | Good | Vertical timeline |
| ActivityForm | `crm/activities/activity-form.tsx` | Good | Call/email/meeting/note |
| AddressForm | `crm/shared/address-form.tsx` | Good | Reusable |
| PhoneInput | `crm/shared/phone-input.tsx` | Good | libphonenumber |

---

## Design Specs

| Screen | Spec File | Content Level |
|--------|-----------|---------------|
| Service Overview | `00-service-overview.md` | Overview |
| CRM Dashboard | `01-crm-dashboard.md` | Full 15-section |
| Leads List | `02-leads-list.md` | Full 15-section |
| Lead Detail | `03-lead-detail.md` | Full 15-section |
| Companies List | `04-companies-list.md` | Full 15-section |
| Company Detail | `05-company-detail.md` | Full 15-section |
| Contacts List | `06-contacts-list.md` | Full 15-section |
| Contact Detail | `07-contact-detail.md` | Full 15-section |
| Opportunities List | `08-opportunities-list.md` | Full 15-section |
| Opportunity Detail | `09-opportunity-detail.md` | Full 15-section |
| Activities Calendar | `10-activities-calendar.md` | Full 15-section |
| Territory Mgmt | `11-territory-management.md` | Full 15-section |
| Lead Import | `12-lead-import-wizard.md` | Full 15-section |

---

## Open Bugs

| Bug ID | Title | Severity | File |
|--------|-------|----------|------|
| BUG-009 | Delete buttons missing (Contacts + Leads) | P0 | contacts-table, leads-table, detail pages |
| BUG-010 | Owner filter text input (should be dropdown) | P1 | `leads/page.tsx:93-98` |
| BUG-010 | No confirmation on pipeline drag-drop | P1 | `leads-pipeline.tsx:36-47` |
| BUG-010 | Convert-to-customer not wired | P1 | `leads/[id]/page.tsx` |

---

## Tasks

| Task ID | Title | Phase | Status | Effort |
|---------|-------|-------|--------|--------|
| BUG-009 | Add delete buttons (Contacts + Leads) | 0 | NOT STARTED | M (2-3h) |
| BUG-010 | Fix owner filter + stage confirm + convert button | 0 | NOT STARTED | M (3-4h) |

---

## Key Business Rules

### Customer Credit Status
| Status | Meaning | Effect |
|--------|---------|--------|
| PENDING | New customer, not reviewed | Cannot create orders |
| APPROVED | Credit verified | Normal operations |
| HOLD | Over credit limit or past due | Orders blocked until resolved |
| COD | Cash on delivery only | Must collect before dispatch |
| PREPAID | Payment required upfront | Must collect before dispatch |
| DENIED | Credit denied | Cannot create orders |

### Credit Hold Triggers
| Trigger | Detail |
|---------|--------|
| **Over Limit** | `currentBalance > creditLimit` → auto HOLD |
| **Past Due** | 3+ invoices overdue > 60 days → auto HOLD |
| **Manual** | Admin can set HOLD with reason |
| **Release** | Admin reviews and changes back to APPROVED |

### Data Validation Rules
| Rule | Detail |
|------|--------|
| **Customer Code** | 2-20 chars, uppercase, unique per tenant |
| **Email** | Valid format, unique per tenant |
| **Phone** | E.164 format recommended |
| **Soft Delete** | All deletes set `deletedAt`, never hard delete |
| **Lead → Customer** | Convert via status change, preserves all data |

## Key References

| Document | Path | What It Contains |
|----------|------|------------------|
| Data Dictionary | `dev_docs/11-ai-dev/91-data-dictionary.md` | Customer, Contact, Lead schemas |
| Business Rules | `dev_docs/11-ai-dev/92-business-rules-reference.md` | Credit status, hold triggers |
| CRM Audit | `dev_docs_v2/04-audit/crm.md` | Delete UI missing, no contact search |

---

## Dependencies

- **Depends on:** Auth (role-based access), Companies/Contacts data
- **Depended on by:** Sales (customer selection for quotes), TMS Core (shipper/consignee from CRM)

---

## What to Build Next (Ordered)

1. **Add delete buttons** (BUG-009) — Wire useDeleteContact/useDeleteLead with ConfirmDialog. 2-3h.
2. **Fix 3 CRM issues** (BUG-010) — Owner dropdown, stage confirmation, convert button. 3-4h.
3. **Add search/filters to Contacts** — Backend supports, UI doesn't expose. 2-3h.
4. **Build Opportunities list + Kanban** — Wave 2, full sales pipeline. 8-10h.
5. **Build Activities Calendar** — Wave 2, day/week/month views. 10-12h.
