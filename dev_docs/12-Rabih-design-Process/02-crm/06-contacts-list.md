# Contacts List

> Service: CRM (Service 02) | Wave: 1 (Enhancement Focus) | Priority: P1
> Route: /(dashboard)/crm/contacts | Status: Built
> Primary Personas: James Wilson (Sales Agent), Sarah Chen (Ops Manager)
> Roles with Access: All users (read-only), Sales Agent (assigned companies), Sales Manager (all), Ops Manager (all), Admin (all)

---

## 1. Purpose & Business Context

**What this screen does:**
Displays all contacts across all companies with comprehensive filtering by company, role type, status, and department. Contacts are the individual people within companies that Ultra TMS users interact with -- each contact has a specific role (Primary, Billing, Shipping, Operations, Executive) that determines their function in the business relationship.

**Business problem it solves:**
Without a centralized contacts list, team members cannot quickly find the right person to call at a customer's organization. Dispatchers need shipping contacts, accounting needs billing contacts, and sales needs primary/executive contacts. This screen enables role-based contact lookup across all companies, ensuring the right person is contacted for the right purpose.

**Key business rules:**
- All authenticated users can view contacts (read-only for non-CRM roles)
- Each company must have at least one PRIMARY role contact
- Email addresses must be unique within a tenant (across all companies)
- Contacts with a hubspot_id are synced with HubSpot bi-directionally
- Deactivated contacts retain data but are excluded from default views
- Contact role_type determines which workflows they are included in (e.g., BILLING contacts receive invoice emails)
- A contact can be associated with only one company at a time

**Success metric:**
Users can find the correct contact for their purpose (billing, shipping, operations) within 10 seconds. Contact data completeness (email + phone + role) exceeds 95%.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| CRM sidebar navigation | Click "Contacts" menu item | None |
| Company Detail | Click "View All Contacts" or Contacts tab | ?companyId={id} filter |
| Lead Detail | Click converted contact link | contactId (redirect to detail) |
| Opportunity Detail | Click contact name | contactId (redirect to detail) |
| Global search | Select contact from results | contactId (redirect to detail) |
| Direct URL | Bookmark / shared link | Query params for filters |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Contact Detail | Click contact row or name link | contactId |
| Company Detail | Click company name in table | companyId |
| Create Contact Modal | Click "+ New Contact" button | Optional pre-filled companyId |

**Primary trigger:**
James Wilson needs to call the shipping contact at a customer company to coordinate a pickup. He navigates to Contacts, filters by role "SHIPPING", and searches for the company name to find the right person.

**Success criteria (user completes the screen when):**
- User has found the contact they need and obtained their phone/email
- User has navigated to a contact's detail for more information
- User has created a new contact for a company that was missing one

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------+
|  Breadcrumb: CRM > Contacts              [Export] [+ New Contact] |
|  Page Title: "Contacts"                                           |
+------------------------------------------------------------------+
|  Stats Bar:                                                       |
|  [Total: 482] [Primary: 156] [Billing: 98] [Shipping: 112]       |
|  [Operations: 78] [Executive: 38]                                 |
+------------------------------------------------------------------+
|  Filters: [Search...] [Company ▼] [Role ▼] [Status ▼] [Dept ▼]  |
|           [HubSpot ▼] [Clear]                                     |
+------------------------------------------------------------------+
|  +------------------------------------------------------------+  |
|  | [ ] | Name         | Company      | Role      | Email     |  |
|  |     |              |              |           |           |  |
|  |-----|--------------|--------------|-----------|-----------|  |
|  | [ ] | John Smith   | Acme Logist. | PRIMARY   | john@acme |  |
|  |     | VP Sales     |              |           | 555-1234  |  |
|  | [ ] | Lisa Park    | Acme Logist. | BILLING   | lisa@acme |  |
|  |     | AP Manager   |              |           | 555-4567  |  |
|  | [ ] | Omar Ali     | Beta Freight | PRIMARY   | omar@beta |  |
|  |     | President    |              |           | 555-7890  |  |
|  | [ ] | Sarah Kim    | Gamma Trans. | SHIPPING  | sarah@gam |  |
|  |     | Logistics Mgr|              |           | 555-2345  |  |
|  | [ ] | Amy Chen     | Delta Corp   | EXECUTIVE | amy@delta |  |
|  |     | CEO          |              |           | 555-6789  |  |
|  +------------------------------------------------------------+  |
|  Showing 1-25 of 482 contacts   < 1 2 3 ... > [25 per page ▼]   |
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible) | Contact name, company association, role type badge, email | Users need name + role + company to identify the right person |
| **Secondary** (visible in table) | Title, phone, mobile, department, status | Contact details for reaching out |
| **Tertiary** (on hover/expand) | HubSpot sync status, last activity date, created date | Metadata for data quality and sync tracking |
| **Hidden** (behind click) | Full communication history, associated opportunities, activity timeline | Deep contact engagement data on detail page |

---

## 4. Data Fields & Display

### Visible Fields

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Checkbox | N/A (selection state) | Checkbox for bulk actions | Table column 1 |
| 2 | Contact Name | Contact.first_name + Contact.last_name | Full name, semibold, clickable link | Table column 2 |
| 3 | Title | Contact.title | Gray-500 text below name | Table column 2 (subtext) |
| 4 | Company | Contact.company_id (join Company.name) | Company name, clickable link to company detail | Table column 3 |
| 5 | Role Type | Contact.role_type | Colored badge: PRIMARY/BILLING/SHIPPING/OPERATIONS/EXECUTIVE | Table column 4 |
| 6 | Email | Contact.email | Clickable mailto: link | Table column 5 |
| 7 | Phone | Contact.phone | Formatted phone number, clickable tel: link | Table column 6 |
| 8 | Mobile | Contact.mobile | Formatted phone, clickable tel: link | Table column 7 |
| 9 | Department | Contact.department | Text label | Table column 8 |
| 10 | Status | Contact.status | StatusBadge: Active/Inactive | Table column 9 |
| 11 | HubSpot | Contact.hubspot_id (presence) | Small HS icon if synced | Table column 10 |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Role Counts (stats bar) | COUNT(Contact) GROUP BY role_type | Integer per role in stat cards |
| 2 | Last Activity | MAX(Activity.created_at) WHERE contact_id = this contact | Relative time |
| 3 | Data Completeness | Percentage of filled fields (email, phone, mobile, title, department) | Percentage or progress dots |

---

## 5. Features

### Core Features (Built -- Currently Live)

- [x] Paginated table view of all contacts with sorting
- [x] Search by contact name, email
- [x] Filter by company (searchable dropdown)
- [x] Filter by role type (multi-select)
- [x] Filter by status (Active/Inactive)
- [x] Click-through to Contact Detail page
- [x] Create new contact via modal form
- [x] Role type badge color coding
- [x] Company name as clickable link to Company Detail
- [x] Pagination with configurable page size

### Advanced Features (Wave 1 Enhancements)

- [ ] **Department filter** -- Filter contacts by department
- [ ] **HubSpot sync filter** -- Filter by synced/not-synced status
- [ ] **Quick-action buttons per row** -- Call, Email icons that open communication tool
- [ ] **Role count stat cards** -- Stats bar showing count by role type
- [ ] **Data completeness indicator** -- Visual indicator of how complete each contact's profile is
- [ ] **Bulk role update** -- Select multiple contacts and change role type in batch
- [ ] **Bulk company reassignment** -- Move contacts to a different company
- [ ] **Export contacts** -- Export current filtered view to CSV
- [ ] **Column visibility toggle** -- Show/hide columns
- [ ] **HubSpot sync status indicator** -- Small badge on synced contacts
- [ ] **Saved filter presets** -- Save named filter combinations
- [ ] **Merge duplicates** -- Detect and merge duplicate contacts

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| View contacts | All authenticated | contact_view | Always visible (read-only) |
| Create contact | sales_agent, manager, admin | contact_create | "+ New Contact" hidden |
| Edit contact | sales_agent (assigned co.), manager, admin | contact_edit | Edit actions hidden |
| Delete contact | admin | contact_delete | Delete action hidden |
| Bulk operations | manager, admin | contact_bulk_edit | Bulk actions hidden |
| Export | sales_agent, manager, admin | export_data | "Export" button hidden |
| View phone/mobile | sales_agent, manager, admin, ops | contact_view_phone | Phone columns show "---" |

---

## 6. Status & State Machine

### Status Transitions

```
[ACTIVE] <----> [INACTIVE]
```

### Actions Available Per Status

| Status | Available Actions | Restricted Actions |
|---|---|---|
| ACTIVE | Edit, Deactivate, Call, Email, Log Activity | Delete (admin only; not PRIMARY) |
| INACTIVE | Reactivate, View History | Edit, Call, Email, Log Activity, Delete |

### Status Badge Colors

| Status | Background | Text | Tailwind Classes |
|---|---|---|---|
| ACTIVE | green-100 | green-800 | `bg-green-100 text-green-800` |
| INACTIVE | gray-100 | gray-600 | `bg-gray-100 text-gray-600` |

### Role Type Badge Colors

| Role | Background | Text | Tailwind Classes |
|---|---|---|---|
| PRIMARY | blue-100 | blue-800 | `bg-blue-100 text-blue-800` |
| BILLING | green-100 | green-800 | `bg-green-100 text-green-800` |
| SHIPPING | orange-100 | orange-800 | `bg-orange-100 text-orange-800` |
| OPERATIONS | purple-100 | purple-800 | `bg-purple-100 text-purple-800` |
| EXECUTIVE | amber-100 | amber-800 | `bg-amber-100 text-amber-800` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Top-Right of Page)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| + New Contact | Plus | Primary / Blue | Opens create contact modal | No |
| Export | Download | Secondary / Outline | Downloads CSV of current filtered view | No |

### Row Actions (Dropdown / "More" Menu per Row)

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| View Details | Eye | Navigate to /crm/contacts/{id} | Always |
| Edit Contact | Pencil | Opens edit contact modal | Status is ACTIVE |
| Call | Phone | Opens dialer / logs call activity | Phone number exists; ACTIVE |
| Email | Mail | Opens email client / logs email activity | Email exists; ACTIVE |
| View Company | Building | Navigate to /crm/companies/{companyId} | Always |
| Deactivate | XCircle | Change status to INACTIVE | ACTIVE; not PRIMARY role |
| Reactivate | Play | Change status to ACTIVE | INACTIVE |
| Delete | Trash | Soft delete with confirmation | Admin only; not PRIMARY role |

### Bulk Actions (When Multiple Rows Selected)

| Action Label | Action | Confirmation |
|---|---|---|
| Update Role | Opens role selection dropdown | Yes -- "Change N contacts to [role]?" |
| Deactivate | Deactivate all selected | Yes -- "Deactivate N contacts?" |
| Export Selected | Downloads CSV of selected rows | No |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + K | Open global search |
| Ctrl/Cmd + N | Open create contact modal |
| Escape | Close modal / deselect all |
| Arrow Up/Down | Navigate table rows |
| Enter | Open selected row detail |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| N/A | -- | No drag-and-drop on contacts list |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| contact.created | { contactId, name, companyId, roleType } | Add row if within filters; update stat counts |
| contact.updated | { contactId, changes } | Update affected row; flash highlight |
| contact.status.changed | { contactId, newStatus } | Update status badge; update stat counts |
| contact.deleted | { contactId } | Remove row; update counts |
| hubspot.contact.synced | { contactId, syncStatus } | Update HubSpot indicator on row |

### Live Update Behavior

- **Update frequency:** WebSocket push for contact changes; stat bar re-polls every 120 seconds
- **Visual indicator:** Changed rows flash with blue highlight fading over 2 seconds
- **Conflict handling:** If editing while another user changes, show notification banner

### Polling Fallback

- **When:** WebSocket drops
- **Interval:** Every 60 seconds
- **Endpoint:** GET /api/v1/crm/contacts?updatedSince={timestamp}
- **Visual indicator:** "Live updates paused" banner

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Change status | Immediately update badge | Revert, show error toast |
| Change role | Immediately update role badge | Revert, show error toast |
| Delete | Fade out row | Re-insert, show error toast |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| contacts-table | src/components/crm/contacts-table.tsx | columns, data, pagination, sorting, selection |
| contact-form | src/components/crm/contact-form.tsx | mode, contactData, companyId |
| StatusBadge | src/components/ui/status-badge.tsx | status, size |
| DataTable | src/components/ui/data-table.tsx | columns, data, pagination, sorting |
| PageHeader | src/components/layout/page-header.tsx | title, breadcrumbs, actions |
| FilterBar | src/components/ui/filter-bar.tsx | filters: FilterConfig[] |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| contacts-table | Basic columns: name, company, role, email, status | Add phone, mobile, department, title, HubSpot indicator, quick-action call/email buttons, data completeness dots |
| contact-form | Basic fields | Add department, mobile, HubSpot ID (read-only), company search dropdown |
| FilterBar | Company and role filters | Add department, HubSpot sync status, data completeness filters |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| RoleTypeBadge | Colored badge for contact role types (PRIMARY/BILLING/etc.) | Small -- badge with role-specific colors |
| ContactQuickActions | Inline call/email icon buttons per row | Small -- icon buttons with tooltips |
| ContactStatCards | Row of role-count stat cards | Small -- clickable stat cards |
| DataCompletenessIndicator | 5-dot indicator showing field fill state | Small -- dot array |
| HubSpotSyncIndicator | Small HS icon with tooltip showing sync status | Small -- icon with tooltip |
| DuplicateDetectionDialog | Modal showing potential duplicates for merge | Medium -- comparison table with merge actions |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Dropdown Menu | dropdown-menu | Row actions |
| Dialog | dialog | Create/edit contact modal |
| Badge | badge | Role type, status badges |
| Tooltip | tooltip | Quick action icons, truncated text, sync status |
| Select | select | Filter dropdowns |
| Command | command | Company search in create form |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/v1/crm/contacts | Fetch paginated contact list with filters | useContacts(filters) |
| 2 | GET | /api/v1/crm/contacts/:id | Fetch single contact detail | useContact(id) |
| 3 | POST | /api/v1/crm/contacts | Create a new contact | useCreateContact() |
| 4 | PATCH | /api/v1/crm/contacts/:id | Update contact details | useUpdateContact() |
| 5 | PATCH | /api/v1/crm/contacts/:id/status | Change contact status | useUpdateContactStatus() |
| 6 | DELETE | /api/v1/crm/contacts/:id | Soft delete contact | useDeleteContact() |
| 7 | GET | /api/v1/crm/contacts/stats | Get contact count stats by role | useContactStats() |
| 8 | POST | /api/v1/crm/contacts/export | Export filtered contacts to CSV | useExportContacts() |
| 9 | POST | /api/v1/crm/contacts/bulk-update | Bulk update role/status | useBulkUpdateContacts() |
| 10 | GET | /api/v1/crm/contacts/check-duplicate | Check for duplicate email | useCheckContactDuplicate(email) |
| 11 | POST | /api/v1/crm/contacts/merge | Merge duplicate contacts | useMergeContacts() |
| 12 | GET | /api/v1/crm/companies?search= | Search companies for association | useCompanySearch(query) |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| crm:{tenantId}:contacts | contact.created | useContactListUpdates() |
| crm:{tenantId}:contacts | contact.updated | useContactListUpdates() |
| crm:{tenantId}:contacts | contact.status.changed | useContactListUpdates() |
| crm:{tenantId}:contacts | contact.deleted | useContactListUpdates() |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 409 | 500 |
|---|---|---|---|---|---|---|
| GET /api/v1/crm/contacts | Filter error toast | Redirect to login | "Access Denied" page | N/A | N/A | Error state with retry |
| POST /api/v1/crm/contacts | Validation errors inline | Redirect to login | "Permission Denied" | N/A | "Email exists" toast | Error toast |
| DELETE /api/v1/crm/contacts/:id | "Cannot delete PRIMARY contact" | Redirect to login | "Permission Denied" | "Not found" | N/A | Error toast |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Stat bar with 6 skeleton cards. 8 skeleton table rows matching column widths.
- **Progressive loading:** Header and filters immediate; skeleton for data.
- **Duration threshold:** 5s for "Loading..." message.

### Empty States

**First-time empty:**
- **Headline:** "No contacts yet"
- **Description:** "Add contacts to your companies to start managing relationships."
- **CTA:** "Add First Contact" (primary)

**Filtered empty:**
- **Headline:** "No contacts match your filters"
- **CTA:** "Clear All Filters" (secondary)

### Error States

**Full page error:** Error icon + "Unable to load contacts" + Retry
**Action error:** Toast with error message, auto-dismiss 8s

### Permission Denied

- **Full page denied:** N/A (all users can view)
- **Partial denied:** Create/Edit/Delete actions hidden

### Offline / Degraded

- **Full offline:** Banner with cached data timestamp
- **Degraded:** "Live updates paused"

---

## 12. Filters, Search & Sort

### Filters

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Search | Text input | name, email, phone | None | ?search= |
| 2 | Company | Searchable select | All companies | All | ?companyId= |
| 3 | Role Type | Multi-select | PRIMARY, BILLING, SHIPPING, OPERATIONS, EXECUTIVE | All | ?roleType= |
| 4 | Status | Select | Active, Inactive | Active | ?status= |
| 5 | Department | Searchable select | All departments from data | All | ?department= |
| 6 | HubSpot Synced | Toggle | Synced / Not Synced / All | All | ?hubspotSynced= |

### Search Behavior

- **Search field:** Single search input at left of filter bar
- **Searches across:** First name, last name, email, phone number
- **Behavior:** Debounced 300ms, min 2 characters, highlights matching text
- **URL param:** ?search=

### Sort Options

| Column / Field | Default Direction | Sort Type |
|---|---|---|
| Name | Ascending (A-Z) | Alphabetical |
| Company | Ascending (A-Z) | Alphabetical |
| Role Type | Custom (PRIMARY first) | Custom enum order |
| Email | Ascending (A-Z) | Alphabetical |
| Status | Custom (Active first) | Custom enum order |
| Created Date | Descending (newest) | Date |

**Default sort:** Name ascending (A-Z)

### Saved Filters / Presets

- **System presets:** "All Active", "Primary Contacts Only", "Billing Contacts", "Shipping Contacts", "HubSpot Synced", "My Company Contacts" (contacts at assigned companies)
- **User-created presets:** Save filter combinations with custom names
- **URL sync:** All filters reflected in URL

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Hide columns: Mobile, Department (keep Name, Company, Role, Email, Phone, Status)
- Stat cards: horizontal scroll
- Filters: collapse to slide-over

### Mobile (< 768px)

- Card-based list (one card per contact)
- Each card: Name + title, company name, role badge, email link, phone link
- Tap card for detail; tap phone/email for action
- Filters: full-screen modal
- Sticky bottom: "+ New Contact" button

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full layout |
| Desktop | 1024px - 1439px | May hide Department |
| Tablet | 768px - 1023px | See tablet notes |
| Mobile | < 768px | See mobile notes |

---

## 14. Stitch Prompt

```
Design a Contacts List screen for a modern SaaS TMS called "Ultra TMS."

Layout: Full-width page with dark slate-900 sidebar (240px) on the left with "CRM" > "Contacts" highlighted with blue-600 indicator. White/gray-50 content area. Top has breadcrumb "CRM > Contacts", title "Contacts", secondary "Export" button, primary blue "+ New Contact" button.

Stats Bar: 6 compact stat cards: "Total: 482" (slate), "Primary: 156" (blue dot), "Billing: 98" (green dot), "Shipping: 112" (orange dot), "Operations: 78" (purple dot), "Executive: 38" (amber dot).

Filter Bar: search input ("Search contacts..."), "Company" searchable dropdown, "Role" multi-select dropdown, "Status" dropdown, "Department" dropdown, "Clear Filters".

Data Table columns: checkbox, Contact Name (semibold with title in gray below), Company (clickable link), Role Type (colored badge -- blue PRIMARY, green BILLING, orange SHIPPING, purple OPERATIONS, amber EXECUTIVE), Email (blue link), Phone, Mobile, Department, Status (green Active / gray Inactive), small HubSpot icon (if synced), three-dot menu.

8 rows:
- John Smith / VP Sales | Acme Logistics | PRIMARY (blue) | john@acme.com | (555) 123-4567 | (555) 123-0001 | Sales | Active | HS icon
- Lisa Park / AP Manager | Acme Logistics | BILLING (green) | lisa@acme.com | (555) 456-7890 | -- | Finance | Active | HS icon
- Omar Ali / President | Beta Freight | PRIMARY (blue) | omar@beta.com | (555) 789-0123 | (555) 789-0002 | Executive | Active | HS icon
- Sarah Kim / Logistics Mgr | Gamma Transport | SHIPPING (orange) | sarah@gamma.com | (555) 234-5678 | (555) 234-0003 | Operations | Active
- Amy Chen / CEO | Delta Corp | EXECUTIVE (amber) | amy@delta.com | (555) 678-9012 | (555) 678-0004 | Executive | Active | HS icon
- Tom Lee / Dispatch Coord | Echo Carriers | OPERATIONS (purple) | tom@echo.com | (555) 345-6789 | -- | Operations | Active
- Mike Brown / Warehouse Mgr | Foxtrot Inc | SHIPPING (orange) | mike@fox.com | (555) 901-2345 | -- | Warehouse | Active
- Jane Doe / AR Clerk | Golf Express | BILLING (green) | jane@golf.com | (555) 567-8901 | -- | Finance | Inactive (gray)

Pagination: "Showing 1-25 of 482 contacts" with navigation.

Design Specifications:
- Font: Inter, 14px base
- Sidebar: slate-900, white text, blue-600 active
- Content: gray-50 page, white table/cards
- Primary: blue-600 for buttons/links
- Role badges: small rounded-full pills, colors as specified
- Company links: blue-600, hover underline
- Email/phone: blue-600 clickable links
- HubSpot icon: small orange HS logo, 16px, with tooltip "Synced with HubSpot"
- Table: white bg, border-b border-gray-100, hover bg-gray-50
- Modern SaaS aesthetic similar to HubSpot contacts or Salesforce contacts list
```

---

## 15. Enhancement Opportunities

### Current State (Wave 1 -- Enhancement Focus)

**What's built and working:**
- [x] Paginated table with name, company, role, email, status
- [x] Search by name and email
- [x] Filter by company
- [x] Filter by role type
- [x] Filter by status
- [x] Create contact via modal
- [x] Role type badge colors
- [x] Company name as clickable link
- [x] Pagination and sorting

**What needs polish / bug fixes:**
- [ ] Phone and mobile columns not displayed
- [ ] Title/department not shown in table
- [ ] No role count stats bar
- [ ] HubSpot sync status not visible
- [ ] Filter state lost on back navigation

**What to add this wave:**
- [ ] Phone, mobile, title, department columns
- [ ] Role count stat cards
- [ ] Department filter
- [ ] HubSpot sync filter and indicator
- [ ] Quick-action call/email buttons per row
- [ ] Data completeness indicator
- [ ] Bulk role update
- [ ] Export to CSV
- [ ] Column visibility toggle
- [ ] Saved filter presets
- [ ] Duplicate detection and merge

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Phone/mobile columns | High | Low | P0 |
| Title/department in table | Medium | Low | P0 |
| Role count stat cards | Medium | Low | P0 |
| Quick-action call/email | High | Low | P0 |
| Department filter | Medium | Low | P1 |
| HubSpot sync indicator | Medium | Low | P1 |
| Export to CSV | Medium | Low | P1 |
| Bulk role update | Medium | Medium | P1 |
| Data completeness indicator | Low | Low | P2 |
| Duplicate detection/merge | High | High | P2 |
| Saved filter presets | Medium | Medium | P2 |

### Future Wave Preview

- **Wave 2:** Contact relationship mapping (who reports to whom), communication preference tracking, email/call integration for automatic activity logging, contact scoring based on engagement
- **Wave 3:** AI-powered relationship insights, automated contact enrichment (LinkedIn, ZoomInfo), communication sentiment analysis, contact influence mapping

---
