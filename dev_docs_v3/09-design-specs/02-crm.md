# CRM Design Spec Integration

**Source:** `dev_docs/12-Rabih-design-Process/02-crm/` (13 files)
**MVP Tier:** P0
**Frontend routes:** `(dashboard)/customers/*`, `(dashboard)/companies/*`, `(dashboard)/contacts/*`, `(dashboard)/leads/*`
**Backend module:** `apps/api/src/modules/crm/`

---

## Screen-to-Route Mapping

| # | Design Spec | Frontend Route | Page File | Status |
|---|------------|----------------|-----------|--------|
| 00 | `00-service-overview.md` | — | — | Reference only |
| 01 | `01-crm-dashboard.md` | `/dashboard` (CRM widgets) | Part of main dashboard | Partial |
| 02 | `02-leads-list.md` | `/leads` | `(dashboard)/leads/page.tsx` | Exists |
| 03 | `03-lead-detail.md` | `/leads/[id]` | `(dashboard)/leads/[id]/page.tsx` | Exists |
| 04 | `04-companies-list.md` | `/companies` | `(dashboard)/companies/page.tsx` | Exists |
| 05 | `05-company-detail.md` | `/companies/[id]` | `(dashboard)/companies/[id]/page.tsx` | Exists |
| 06 | `06-contacts-list.md` | `/contacts` | `(dashboard)/contacts/page.tsx` | Exists |
| 07 | `07-contact-detail.md` | `/contacts/[id]` | `(dashboard)/contacts/[id]/page.tsx` | Exists |
| 08 | `08-opportunities-list.md` | — | Not built | No route exists — P2 |
| 09 | `09-opportunity-detail.md` | — | Not built | No route exists — P2 |
| 10 | `10-activities-calendar.md` | `/activities` | `(dashboard)/activities/page.tsx` | Exists |
| 11 | `11-territory-management.md` | — | Not built | No route — P2 |
| 12 | `12-lead-import-wizard.md` | — | Not built | No route — P2 |

---

## Backend Endpoints

| Screen | Endpoint(s) | Hook |
|--------|-------------|------|
| Leads | `GET/POST /crm/leads` | `use-leads.ts` |
| Lead Detail | `GET/PATCH/DELETE /crm/leads/:id` | `use-leads.ts` |
| Companies | `GET/POST /crm/companies` | `use-companies.ts` |
| Company Detail | `GET/PATCH/DELETE /crm/companies/:id` | `use-companies.ts` |
| Contacts | `GET/POST /crm/contacts` | `use-contacts.ts` |
| Contact Detail | `GET/PATCH/DELETE /crm/contacts/:id` | `use-contacts.ts` |
| Customers | `GET/POST /crm/customers` | `use-customers.ts` |
| Activities | `GET/POST /crm/activities` | `use-activities.ts` |

---

## Implementation Notes

- CRM has 5 hooks in `lib/hooks/crm/`: activities, companies, contacts, customers, leads
- Opportunities and territories are NOT in MVP scope (no routes exist)
- Lead import wizard is P2 — no backend support yet
- Companies have sub-routes: `/companies/[id]/contacts`, `/companies/[id]/activities`
- Customers are a separate entity from companies (customer = company with active shipping account)
