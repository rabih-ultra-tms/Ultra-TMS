# CRM Service Overview

> Service: CRM (Service 02) | Category: Core Service | Wave: 1 (Screens 1-7 Enhancement) + Wave 2 (Screens 8-12 Net-New)
> Total Screens: 12 | Built: 7 | Not Built: 5 | Focus: Enhancement + Net-New Design
> Tech Stack: Next.js 16, React 19, Tailwind 4, shadcn/ui, React Query, react-hook-form, Zod
> Integration: HubSpot bi-directional sync (contacts, companies, deals)

---

## Service Summary

The CRM service is the customer relationship management hub of Ultra TMS, providing sales teams with a unified view of their pipeline, customer accounts, contacts, and opportunities. It serves as the primary workspace for sales agents managing freight brokerage relationships and the administrative backbone for operations managers overseeing customer accounts.

Seven screens (Dashboard, Leads List, Lead Detail, Companies List, Company Detail, Contacts List, Contact Detail) are **BUILT and LIVE** in Wave 1 -- this design pass focuses on enhancement and polish. Five screens (Opportunities List, Opportunity Detail, Activities Calendar, Territory Management, Lead Import Wizard) are **NOT BUILT** and require full net-new design in Wave 2.

**Core Capabilities:**
- Lead management with pipeline tracking (NEW > CONTACTED > QUALIFIED > CONVERTED)
- Company/account management with customer segmentation (Enterprise/Mid-Market/SMB)
- Contact management with role-based associations (Primary, Billing, Shipping, Operations, Executive)
- Opportunity/deal pipeline with stage tracking (Prospecting through Closed Won/Lost)
- Activity tracking across calls, emails, meetings, tasks, and notes
- HubSpot bi-directional sync for contacts, companies, and deals
- Territory-based sales assignment and management
- Bulk lead import with field mapping and validation
- Customer tiering (Platinum/Gold/Silver/Bronze) with credit limit tracking

**HubSpot Integration Notes:**
- Bi-directional sync runs every 15 minutes for contacts, companies, and deals
- Conflict resolution: last-write-wins with manual override option
- Fields synced: contact name, email, phone, company name, deal stage, deal amount
- HubSpot ID stored on Contact, Company, and Opportunity records for reference
- Sync status visible on detail screens with last-synced timestamp
- Manual "Sync Now" button available on individual records
- Sync errors logged and surfaceable via notification bell

---

## Screen Inventory

| # | Screen Name | Route | Type | Status | Wave | Priority | Design File |
|---|---|---|---|---|---|---|---|
| 1 | CRM Dashboard | `/crm` | Dashboard | **Built** | Wave 1 Enhancement | P0 | `01-crm-dashboard.md` |
| 2 | Leads List | `/crm/leads` | List / Kanban | **Built** | Wave 1 Enhancement | P0 | `02-leads-list.md` |
| 3 | Lead Detail | `/crm/leads/:id` | Detail / Form | **Built** | Wave 1 Enhancement | P0 | `03-lead-detail.md` |
| 4 | Companies List | `/crm/companies` | List / Table | **Built** | Wave 1 Enhancement | P0 | `04-companies-list.md` |
| 5 | Company Detail | `/crm/companies/:id` | Detail / Tabs | **Built** | Wave 1 Enhancement | P0 | `05-company-detail.md` |
| 6 | Contacts List | `/crm/contacts` | List / Table | **Built** | Wave 1 Enhancement | P1 | `06-contacts-list.md` |
| 7 | Contact Detail | `/crm/contacts/:id` | Detail / Form | **Built** | Wave 1 Enhancement | P1 | `07-contact-detail.md` |
| 8 | Opportunities List | `/crm/opportunities` | List / Kanban | **Not Built** | Wave 2 Net-New | P0 | `08-opportunities-list.md` |
| 9 | Opportunity Detail | `/crm/opportunities/:id` | Detail / Form | **Not Built** | Wave 2 Net-New | P0 | `09-opportunity-detail.md` |
| 10 | Activities Calendar | `/crm/activities` | Calendar | **Not Built** | Wave 2 Net-New | P1 | `10-activities-calendar.md` |
| 11 | Territory Management | `/crm/territories` | Config / Form | **Not Built** | Wave 2 Net-New | P1 | `11-territory-management.md` |
| 12 | Lead Import Wizard | `/crm/leads/import` | Wizard | **Not Built** | Wave 2 Net-New | P2 | `12-lead-import-wizard.md` |

---

## Existing Components

These components are already built and available in the codebase for Wave 1 screens:

| Component | Location | Current State |
|---|---|---|
| `crm-dashboard` | `src/components/crm/crm-dashboard.tsx` | Functional with basic pipeline stats |
| `leads-table` | `src/components/crm/leads-table.tsx` | Functional with pagination and filtering |
| `lead-form` | `src/components/crm/lead-form.tsx` | Functional CRUD form |
| `lead-kanban` | `src/components/crm/lead-kanban.tsx` | Basic kanban with drag-and-drop |
| `companies-table` | `src/components/crm/companies-table.tsx` | Functional with search and pagination |
| `company-form` | `src/components/crm/company-form.tsx` | Functional CRUD form |
| `company-detail-tabs` | `src/components/crm/company-detail-tabs.tsx` | Tabbed detail view |
| `contacts-table` | `src/components/crm/contacts-table.tsx` | Functional with company association |
| `contact-form` | `src/components/crm/contact-form.tsx` | Functional CRUD form |
| `activity-timeline` | `src/components/crm/activity-timeline.tsx` | Basic timeline display |
| `pipeline-chart` | `src/components/crm/pipeline-chart.tsx` | Static pipeline visualization |
| `hubspot-sync-badge` | `src/components/crm/hubspot-sync-badge.tsx` | Sync status indicator |

---

## Wave 1 Enhancement Themes (Screens 1-7)

### Theme 1: Pipeline Visibility (Dashboard, Leads)
- Enhanced pipeline funnel visualization with conversion rates
- Lead scoring indicators with color-coded priority
- Kanban board polish with drag-drop animations and swim lanes
- Quick-convert flow from lead to opportunity
- Activity feed with real-time updates

### Theme 2: Customer Intelligence (Companies, Company Detail)
- 360-degree customer view with all related entities in tabs
- Customer health score visualization
- Revenue history charts and trend analysis
- Credit limit and payment terms visibility
- Tier-based visual differentiation (Platinum/Gold/Silver/Bronze)

### Theme 3: Contact Management (Contacts, Contact Detail)
- Role-based contact cards with primary/billing/shipping indicators
- Communication history timeline (calls, emails, meetings)
- HubSpot sync status with last-synced timestamp
- Quick-action buttons for call, email, meeting scheduling
- Contact relationship mapping to multiple companies

### Theme 4: Data Quality & Integration
- HubSpot sync status indicators on all synced records
- Duplicate detection warnings on create/edit
- Data completeness scores per record
- Bulk field update capabilities
- Import/export enhancements

---

## Wave 2 Net-New Screens (Screens 8-12)

### Opportunities List & Detail (Screens 8-9)
Full sales pipeline management with kanban and list views, deal stages, probability tracking, weighted pipeline value, and win/loss analytics. Integrates with HubSpot deals for bi-directional sync.

### Activities Calendar (Screen 10)
Unified calendar view for all CRM activities (calls, emails, meetings, tasks, notes) with day/week/month views, drag-to-reschedule, and integration with company/contact/opportunity records.

### Territory Management (Screen 11)
Configuration screen for defining sales territories by geography, industry, or account size. Assign sales reps to territories, set territory-level quotas, and visualize territory coverage.

### Lead Import Wizard (Screen 12)
Multi-step wizard for bulk importing leads from CSV/Excel files with column mapping, data validation, duplicate detection, and import preview before execution.

---

## Design Files in This Folder

| File | Screen | Wave | Priority |
|---|---|---|---|
| `00-service-overview.md` | Service overview (this file) | -- | -- |
| `01-crm-dashboard.md` | CRM Dashboard | Wave 1 Enhancement | P0 |
| `02-leads-list.md` | Leads List | Wave 1 Enhancement | P0 |
| `03-lead-detail.md` | Lead Detail | Wave 1 Enhancement | P0 |
| `04-companies-list.md` | Companies List | Wave 1 Enhancement | P0 |
| `05-company-detail.md` | Company Detail | Wave 1 Enhancement | P0 |
| `06-contacts-list.md` | Contacts List | Wave 1 Enhancement | P1 |
| `07-contact-detail.md` | Contact Detail | Wave 1 Enhancement | P1 |
| `08-opportunities-list.md` | Opportunities List | Wave 2 Net-New | P0 |
| `09-opportunity-detail.md` | Opportunity Detail | Wave 2 Net-New | P0 |
| `10-activities-calendar.md` | Activities Calendar | Wave 2 Net-New | P1 |
| `11-territory-management.md` | Territory Management | Wave 2 Net-New | P1 |
| `12-lead-import-wizard.md` | Lead Import Wizard | Wave 2 Net-New | P2 |

---

## CRM Data Model Overview

```
+------------------+       +------------------+       +------------------+
|     Leads        |       |    Companies     |       |    Contacts      |
|------------------|       |------------------|       |------------------|
| id               |       | id               |       | id               |
| tenant_id        |       | tenant_id        |       | tenant_id        |
| source           |       | name             |       | company_id  -----+---> Companies
| status           |       | legal_name       |       | first_name       |
| first_name       |       | dba_name         |       | last_name        |
| last_name        |       | company_type     |       | title            |
| company_name     |       | status           |       | department       |
| email            |       | industry         |       | role_type        |
| phone            |       | segment          |       | email            |
| est_monthly_vol  |       | tier             |       | phone            |
| est_revenue      |       | credit_limit     |       | mobile           |
|                  |       | payment_terms    |       | status           |
|                  |       | assigned_sales_  |       | hubspot_id       |
|                  |       |   rep_id         |       +------------------+
|                  |       | assigned_ops_    |
|                  |       |   rep_id         |
+------------------+       +------------------+
                                    |
                                    v
+------------------+       +------------------+
|  Opportunities   |       |   Activities     |
|------------------|       |------------------|
| id               |       | id               |
| tenant_id        |       | tenant_id        |
| company_id ------+       | type (CALL/EMAIL |
| contact_id       |       |   /MEETING/TASK  |
| name             |       |   /NOTE)         |
| stage            |       | subject          |
| amount           |       | description      |
| probability      |       | due_date         |
| expected_close   |       | completed_at     |
+------------------+       +------------------+
```

---

## CRM Pipeline Flow

```
                     LEAD PIPELINE
+----------+    +----------+    +-----------+    +-------------+
|   NEW    |--->| CONTACTED|--->| QUALIFIED |--->|  CONVERTED  |
+----------+    +----------+    +-----------+    +------+------+
                     |                                  |
                     v                                  v
               +-------------+              Creates Company +
               | UNQUALIFIED |              Contact + Opportunity
               +-------------+

                 OPPORTUNITY PIPELINE
+-----------+   +-------------+   +----------+   +-------------+
|PROSPECTING|-->|QUALIFICATION|-->| PROPOSAL |-->| NEGOTIATION |
+-----------+   +-------------+   +----------+   +------+------+
                                                        |
                                          +-------------+-------------+
                                          |                           |
                                   +------v------+            +------v------+
                                   |  CLOSED_WON |            | CLOSED_LOST |
                                   +-------------+            +-------------+
```

---

## Persona Mapping

| Persona | Role | Primary Screens | Key Actions |
|---|---|---|---|
| **James Wilson** | Sales Agent | Dashboard, Leads, Opportunities, Activities | Manage leads, progress pipeline, log activities, close deals |
| **Sarah Chen** | Ops Manager (Admin) | Companies, Contacts, Territory Mgmt, All screens | Configure territories, manage accounts, oversee pipeline health |
| Sales Manager | Manager | Dashboard, Opportunities, Territory Mgmt | Review pipeline, assign territories, track team performance |
| Admin | System Admin | All screens | Full CRUD, import/export, HubSpot config |

---

## Access Control

| Screen | Sales Agent | Sales Manager | Ops Manager | Admin | All Users |
|---|---|---|---|---|---|
| CRM Dashboard | Full | Full | Full | Full | Read-only |
| Leads List | Own leads | All leads | All leads | All leads | -- |
| Lead Detail | Own leads | All leads | All leads | All leads | -- |
| Companies List | Assigned | All | All | All | Read-only |
| Company Detail | Assigned | All | All | All | Read-only |
| Contacts List | Assigned | All | All | All | Read-only |
| Contact Detail | Assigned | All | All | All | Read-only |
| Opportunities List | Own | All | All | All | -- |
| Opportunity Detail | Own | All | All | All | -- |
| Activities Calendar | Own | Team | All | All | -- |
| Territory Management | View only | View only | Full | Full | -- |
| Lead Import Wizard | -- | Import | Import | Full | -- |

---

## Cross-Cutting Concerns

### HubSpot Integration
- Bi-directional sync every 15 minutes via background job
- Sync scope: Contacts, Companies, Deals (maps to Opportunities)
- Conflict resolution: Last-write-wins with configurable priority (TMS or HubSpot)
- Each synced record stores `hubspot_id` for cross-reference
- Sync status badge on detail screens: "Synced", "Pending", "Error", "Not Linked"
- Manual "Sync Now" button triggers immediate sync for individual records
- Sync log accessible from Admin > Integrations for troubleshooting

### Multi-Tenant Isolation
- All CRM data scoped by `tenant_id` at database level
- Row-level security enforced on all queries
- Sales rep assignment scoped within tenant
- Territory definitions are tenant-specific
- HubSpot integration configured per-tenant (API key, sync settings)

### Data Validation
- Email uniqueness enforced per tenant
- Phone numbers validated and formatted consistently
- Company names checked for duplicates with fuzzy matching
- Required fields enforced at both form (Zod) and API level
- Credit limits must be positive numbers when set
- Opportunity amounts must be non-negative

---

*This document was created as part of the Wave 1 Enhancement + Wave 2 Net-New design process for Ultra TMS CRM Service (Service 02).*
