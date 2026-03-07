# CRM Components

**Path:** `apps/web/components/crm/`

## Files

| Component | File | LOC | Description |
|-----------|------|-----|-------------|
| ActivityForm | `activity-form.tsx` | 139 | Log a new activity (call, email, meeting, note) |
| ActivityItem | `activity-item.tsx` | 28 | Single activity entry in timeline |
| ActivityTimeline | `activity-timeline.tsx` | 16 | Wrapper rendering a list of ActivityItems |
| ActivityTypeIcon | `activity-type-icon.tsx` | 22 | Icon mapper for activity types (Phone, Mail, Calendar, etc.) |
| ContactCard | `contact-card.tsx` | 28 | Contact display card with phone, email, role |
| ContactForm | `contact-form.tsx` | 211 | Create/edit contact form (linked to customer) |
| ContactSelect | `contact-select.tsx` | 31 | Combobox for selecting a contact from a customer |
| ContactsTable | `contacts-table.tsx` | 120 | Data table of contacts with search |
| CustomerColumns | `customer-columns.tsx` | 15 | Column definitions for customer table |
| CustomerDetailCard | `customer-detail-card.tsx` | 41 | Customer detail display card |
| CustomerFilters | `customer-filters.tsx` | 67 | Filter bar for customer list (status, type, search) |
| CustomerForm | `customer-form.tsx` | 446 | Full customer create/edit form with address, billing, contacts |
| CustomerStatusBadge | `customer-status-badge.tsx` | 11 | Status badge for customer states |
| CustomerTable | `customer-table.tsx` | 168 | Data table for customers list |
| CustomerTable (test) | `customer-table.test.tsx` | 41 | Unit tests for CustomerTable |
| CustomerTabs | `customer-tabs.tsx` | 38 | Tab navigation for customer detail (Overview, Contacts, Activity, Loads) |
| LeadCard | `lead-card.tsx` | 52 | Lead display card for pipeline view |
| LeadConvertDialog | `lead-convert-dialog.tsx` | 65 | Dialog for converting a lead to a customer |
| LeadForm | `lead-form.tsx` | 266 | Create/edit lead form |
| LeadStageBadge | `lead-stage-badge.tsx` | 11 | Stage badge for leads (New, Contacted, Qualified, etc.) |
| LeadsPipeline | `leads-pipeline.tsx` | 127 | Kanban-style pipeline view for leads by stage |
| LeadsTable | `leads-table.tsx` | 121 | Data table for leads list |
| LeadsTable (test) | `leads-table.test.tsx` | 38 | Unit tests for LeadsTable |
| AddressForm | `address-form.tsx` | 127 | Reusable address sub-form (street, city, state, zip) |
| PhoneInput | `phone-input.tsx` | 15 | Phone number input with formatting |

**Total:** 25 files (~23 components + 2 tests), ~2,243 LOC

## Usage Patterns

Used in `(dashboard)/crm/` route group:
- `/crm/customers` - `CustomerTable` + `CustomerFilters`
- `/crm/customers/new` - `CustomerForm`
- `/crm/customers/[id]` - `CustomerDetailCard` + `CustomerTabs` + `ContactsTable` + `ActivityTimeline`
- `/crm/customers/[id]/edit` - `CustomerForm` (edit)
- `/crm/contacts` - `ContactsTable`
- `/crm/contacts/new` - `ContactForm`
- `/crm/leads` - `LeadsTable` or `LeadsPipeline` (toggle view)
- `/crm/leads/new` - `LeadForm`
- `/crm/leads/[id]` - `LeadCard` + `ActivityTimeline`
- `AddressForm` and `PhoneInput` are reusable sub-forms shared across CRM forms

## Dependencies

- `@/components/ui/` (shadcn primitives)
- `@/components/patterns/` (ListPage, FormPage, DetailPage)
- `@/lib/hooks/crm/` (useCustomers, useLeads, useContacts, useActivities)
- `@/lib/validations/crm` (Zod schemas)
- React Hook Form + Zod
- `AddressForm` used by both CustomerForm and ContactForm
