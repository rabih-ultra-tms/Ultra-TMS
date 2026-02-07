# Lead Detail

> Service: CRM (Service 02) | Wave: 1 (Enhancement Focus) | Priority: P0
> Route: /(dashboard)/crm/leads/:id | Status: Built
> Primary Personas: James Wilson (Sales Agent), Sarah Chen (Ops Manager)
> Roles with Access: Sales Agent (own leads), Sales Manager (all), Ops Manager (all), Admin (all)

---

## 1. Purpose & Business Context

**What this screen does:**
Displays the complete profile of a single lead, including all contact information, estimated revenue details, activity history, and the conversion flow. Sales agents use this screen to review lead details, log interactions, progress the lead through the pipeline, and ultimately convert qualified leads into opportunities.

**Business problem it solves:**
Without a centralized lead profile, sales agents would need to rely on notes, spreadsheets, or memory to track lead interactions and qualification status. This screen provides a single source of truth for every lead, ensuring consistent follow-up and preventing leads from falling through the cracks during the qualification process.

**Key business rules:**
- Only the assigned sales agent or users with `crm_view_all` can view this lead
- Lead conversion requires QUALIFIED status and creates a Company + Contact + Opportunity simultaneously
- All activities (calls, emails, meetings, notes) are logged with timestamps and linked to the lead
- Status changes are tracked in an audit trail visible on the activity timeline
- Editing is restricted for CONVERTED leads (read-only except for notes)
- HubSpot-synced leads show sync status and last-synced timestamp
- Estimated revenue and volume cannot be negative

**Success metric:**
Sales agents can view all relevant lead information, log an activity, and decide on next steps within 60 seconds. Lead qualification decisions are made within 3 business days of creation.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Leads List | Click lead row or lead name link | leadId |
| CRM Dashboard | Click lead in "Recent Leads" widget | leadId |
| Notification bell | Click lead-related notification | leadId |
| Global search | Select lead from search results | leadId |
| Activity detail | Click linked lead name | leadId |
| Direct URL | Bookmark / shared link | leadId in route |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Leads List | Click "Back to Leads" breadcrumb | Previous filter state |
| Company Detail | Click company link (after conversion) | companyId |
| Contact Detail | Click contact link (after conversion) | contactId |
| Opportunity Detail | Click opportunity link (after conversion) | opportunityId |
| Edit Lead Modal | Click "Edit" button | leadId, prefilled data |

**Primary trigger:**
James Wilson clicks a lead name from the Leads List to review the lead's details, log a call he just completed, and decide whether to qualify or mark the lead as unqualified.

**Success criteria (user completes the screen when):**
- User has reviewed the lead's complete profile and activity history
- User has logged their latest interaction (call, email, meeting, note)
- User has updated the lead's status based on qualification criteria
- User has scheduled a follow-up activity if needed

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------+
|  Breadcrumb: CRM > Leads > John Smith                            |
|  [← Back to Leads]              [Edit] [Convert ▼] [More ▼]     |
+------------------------------------------------------------------+
|  +---------------------+  +------------------------------------+ |
|  | Lead Profile Card   |  | Activity Timeline                  | |
|  |                     |  |                                    | |
|  | ● John Smith        |  | + Log Activity [Call|Email|Meeting]| |
|  |   Acme Logistics    |  | ---------------------------------- | |
|  |   john@acme.com     |  | ● Call - Discussed freight needs   | |
|  |   (555) 123-4567    |  |   Jan 15, 2026 at 2:30 PM         | |
|  |                     |  |   by James Wilson                  | |
|  | Status: [QUALIFIED] |  |   "Interested in 20 loads/month    | |
|  | Source: Web Form    |  |    from Chicago to Dallas..."      | |
|  | Assigned: James W.  |  |                                    | |
|  |                     |  | ● Email - Sent rate sheet          | |
|  +---------------------+  |   Jan 14, 2026 at 10:15 AM        | |
|  +---------------------+  |   by James Wilson                  | |
|  | Revenue Details     |  |                                    | |
|  |                     |  | ● Status changed NEW → CONTACTED  | |
|  | Est. Revenue:       |  |   Jan 13, 2026 at 3:00 PM         | |
|  |   $15,000/month     |  |                                    | |
|  | Est. Volume:        |  | ● Lead created (via Web Form)      | |
|  |   20 loads/month    |  |   Jan 12, 2026 at 9:00 AM         | |
|  | Annual Value:       |  |                                    | |
|  |   $180,000          |  | [Load More Activities]             | |
|  +---------------------+  +------------------------------------+ |
|  +---------------------+                                         |
|  | HubSpot Sync        |                                         |
|  | ● Synced            |                                         |
|  | Last: 15 min ago    |                                         |
|  | [Sync Now]          |                                         |
|  +---------------------+                                         |
|  +---------------------+                                         |
|  | Conversion Info     |                                         |
|  | (only if CONVERTED) |                                         |
|  | Company: Acme Corp  |                                         |
|  | Contact: John Smith |                                         |
|  | Opportunity: Acme.. |                                         |
|  +---------------------+                                         |
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible, top of page) | Lead name, company, status badge, contact info (email, phone) | Agent needs identity and status at a glance for immediate action |
| **Secondary** (left sidebar cards) | Revenue estimates, source, assigned rep, HubSpot sync status | Context for qualification decisions and pipeline value |
| **Tertiary** (right panel, scrollable) | Activity timeline with all logged interactions | History of engagement -- critical for follow-up but requires scroll |
| **Hidden** (behind click/modal) | Edit form fields, conversion wizard, full activity details | Deep actions taken deliberately, not at-a-glance |

---

## 4. Data Fields & Display

### Visible Fields

| # | Field Label | Source (Entity.field) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Lead Name | Lead.first_name + Lead.last_name | Large semibold text (20px), with avatar initials | Profile Card header |
| 2 | Company Name | Lead.company_name | Gray-600 text below name | Profile Card |
| 3 | Email | Lead.email | Clickable mailto: link, blue-600 | Profile Card |
| 4 | Phone | Lead.phone | Formatted phone, clickable tel: link | Profile Card |
| 5 | Status | Lead.status | Large colored badge | Profile Card |
| 6 | Source | Lead.source | Text with source icon | Profile Card |
| 7 | Assigned To | Lead.assigned_to (join to User) | Avatar + name, clickable | Profile Card |
| 8 | Created Date | Lead.created_at | Full date "January 12, 2026 at 9:00 AM" | Profile Card |
| 9 | Est. Monthly Revenue | Lead.estimated_revenue | Currency $XX,XXX/month | Revenue Card |
| 10 | Est. Monthly Volume | Lead.estimated_monthly_volume | Number with "loads/month" | Revenue Card |
| 11 | Activity Type | Activity.type | Icon + label (Call/Email/Meeting/Task/Note) | Timeline |
| 12 | Activity Subject | Activity.subject | Semibold text | Timeline entry |
| 13 | Activity Description | Activity.description | Body text, expandable | Timeline entry |
| 14 | Activity Date | Activity.created_at | Full date + time | Timeline entry |
| 15 | Activity Author | Activity.created_by (join to User) | "by [User Name]" text | Timeline entry |
| 16 | HubSpot ID | Lead.hubspot_id (if exists) | "HS-XXXXXX" with external link | HubSpot Card |
| 17 | Sync Status | Derived from hubspot sync log | Badge: Synced/Pending/Error/Not Linked | HubSpot Card |
| 18 | Last Synced | hubspot_sync_log.last_synced_at | Relative time "15 min ago" | HubSpot Card |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Annual Value | Lead.estimated_revenue * 12 | Currency $XXX,XXX/year |
| 2 | Days Since Creation | now() - Lead.created_at | "X days" with aging color if NEW > 48h |
| 3 | Days in Current Status | now() - last status change timestamp | "X days" |
| 4 | Activity Count | COUNT(Activity) WHERE lead_id = this lead | Integer "X activities" |
| 5 | Last Activity Date | MAX(Activity.created_at) WHERE lead_id = this lead | Relative time "2 hours ago" |

---

## 5. Features

### Core Features (Built -- Currently Live)

- [x] Lead profile card with name, company, email, phone, status, source
- [x] Activity timeline showing all logged activities in chronological order
- [x] Log new activity (call, email, meeting, task, note) via inline form
- [x] Status badge with color coding
- [x] Edit lead details via modal form
- [x] Status change buttons (Contact, Qualify, Mark Unqualified)
- [x] Back to Leads List navigation with breadcrumb
- [x] Revenue details card with estimated revenue and volume

### Advanced Features (Wave 1 Enhancements)

- [ ] **Lead conversion wizard** -- Multi-step flow: confirm lead data > pre-populate company form > pre-populate contact form > create opportunity with pipeline stage
- [ ] **Quick-action buttons** -- Call, Email, Schedule Meeting buttons that both log the activity and open the communication tool
- [ ] **HubSpot sync card** -- Show sync status, last synced time, HubSpot ID with link, manual "Sync Now" button
- [ ] **Conversion info card** -- After conversion, show links to the created Company, Contact, and Opportunity
- [ ] **Activity filtering** -- Filter timeline by activity type (show only calls, only emails, etc.)
- [ ] **Activity pinning** -- Pin important activities to top of timeline
- [ ] **Rich text notes** -- Support markdown/rich text in activity descriptions
- [ ] **File attachments** -- Attach files (proposals, rate sheets) to activities
- [ ] **Follow-up scheduling** -- When logging an activity, option to schedule a follow-up task
- [ ] **Lead scoring display** -- Show computed lead score with breakdown of factors
- [ ] **Duplicate warning** -- Banner if similar leads or contacts exist in the system

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| View lead detail | sales_agent (own), manager, admin | lead_view | "Access Denied" page |
| Edit lead | sales_agent (own), manager, admin | lead_edit | "Edit" button hidden |
| Delete lead | admin | lead_delete | "Delete" in More menu hidden |
| Convert lead | sales_agent (own), manager, admin | lead_convert | "Convert" button hidden |
| Change assignment | manager, admin | lead_assign | Assignment is read-only |
| Log activity | sales_agent (own), manager, admin | activity_create | "Log Activity" form hidden |
| Sync with HubSpot | admin | integration_manage | "Sync Now" button hidden |

---

## 6. Status & State Machine

### Status Transitions (from this screen)

```
Current: NEW
  ├── [Contact] --> CONTACTED
  └── [Mark Unqualified] --> UNQUALIFIED (with reason)

Current: CONTACTED
  ├── [Qualify] --> QUALIFIED
  └── [Mark Unqualified] --> UNQUALIFIED (with reason)

Current: QUALIFIED
  ├── [Convert to Opportunity] --> CONVERTED
  │     └── Creates: Company + Contact + Opportunity
  └── [Mark Unqualified] --> UNQUALIFIED (with reason)

Current: UNQUALIFIED
  └── [Re-open] --> NEW

Current: CONVERTED
  └── (Read-only -- no status changes available)
      └── Links to: Company Detail, Contact Detail, Opportunity Detail
```

### Actions Available Per Status

| Status | Available Actions (Buttons) | Restricted Actions |
|---|---|---|
| NEW | Edit, Contact (→CONTACTED), Mark Unqualified, Log Activity, Assign, Delete | Convert, Qualify |
| CONTACTED | Edit, Qualify (→QUALIFIED), Mark Unqualified, Log Activity, Reassign, Delete | Convert |
| QUALIFIED | Edit, Convert (→CONVERTED), Mark Unqualified, Log Activity, Reassign | Delete |
| UNQUALIFIED | Re-open (→NEW), View History, Add Note | Edit fields, Convert, Assign |
| CONVERTED | View Only, Add Note, Navigate to created entities | All edit/status actions |

### Status Badge Colors

| Status | Background | Text | Border | Tailwind Classes |
|---|---|---|---|---|
| NEW | blue-100 | blue-800 | blue-300 | `bg-blue-100 text-blue-800 border-blue-300` |
| CONTACTED | yellow-100 | yellow-800 | yellow-300 | `bg-yellow-100 text-yellow-800 border-yellow-300` |
| QUALIFIED | green-100 | green-800 | green-300 | `bg-green-100 text-green-800 border-green-300` |
| UNQUALIFIED | gray-100 | gray-600 | gray-300 | `bg-gray-100 text-gray-600 border-gray-300` |
| CONVERTED | purple-100 | purple-800 | purple-300 | `bg-purple-100 text-purple-800 border-purple-300` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Top-Right of Page)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| Edit | Pencil | Secondary / Outline | Opens edit lead modal with all fields | No |
| Convert | ArrowRight | Primary / Blue | Opens conversion wizard (only if QUALIFIED) | Yes -- multi-step wizard |
| More | ChevronDown | Secondary / Outline | Dropdown: Assign, Delete, Print, HubSpot Sync | Varies |

### Status Action Buttons (In Profile Card)

| Button Label | Icon | Variant | Condition | Action |
|---|---|---|---|---|
| Mark as Contacted | Phone | Outline / Blue | Status is NEW | Change status to CONTACTED + log activity |
| Qualify Lead | CheckCircle | Outline / Green | Status is CONTACTED | Change status to QUALIFIED |
| Mark Unqualified | XCircle | Outline / Red | Status is NEW, CONTACTED, or QUALIFIED | Opens reason dialog, changes to UNQUALIFIED |
| Re-open Lead | RefreshCw | Outline / Blue | Status is UNQUALIFIED | Change status back to NEW |

### Activity Timeline Actions

| Action | Trigger | Result |
|---|---|---|
| Log Call | Click "Call" tab in Log Activity form | Creates CALL activity with subject, notes, duration |
| Log Email | Click "Email" tab | Creates EMAIL activity with subject, body |
| Log Meeting | Click "Meeting" tab | Creates MEETING activity with subject, attendees, notes |
| Add Task | Click "Task" tab | Creates TASK activity with subject, due date, assignee |
| Add Note | Click "Note" tab | Creates NOTE activity with subject, body |
| Expand activity | Click activity entry | Expands to show full description |
| Pin activity | Click pin icon on activity | Pins activity to top of timeline |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + E | Open edit lead modal |
| Ctrl/Cmd + L | Focus log activity form |
| Ctrl/Cmd + Enter | Submit current form (activity or edit) |
| Escape | Close modal / cancel edit |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| N/A | -- | No drag-and-drop on lead detail |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| lead.updated | { leadId, changes, updatedBy } | Update displayed fields; show toast if updated by another user |
| lead.status.changed | { leadId, oldStatus, newStatus, changedBy } | Update status badge and available actions |
| lead.activity.created | { leadId, activityId, type, subject, createdBy } | Add activity to timeline with slide-in animation |
| lead.assigned | { leadId, newAssignee } | Update assigned rep display |
| lead.converted | { leadId, companyId, contactId, opportunityId } | Update to CONVERTED state; show conversion info card |
| hubspot.record.synced | { entityType: 'lead', entityId, syncStatus } | Update HubSpot sync badge |

### Live Update Behavior

- **Update frequency:** WebSocket push for all lead-specific changes
- **Visual indicator:** Changed fields flash with blue highlight fading over 2 seconds; new activities slide in from top of timeline
- **Conflict handling:** If user is editing while another user makes changes, show banner: "This lead was updated by [name]. Your edits may overwrite their changes. Refresh to see latest."

### Polling Fallback

- **When:** WebSocket connection drops
- **Interval:** Every 30 seconds
- **Endpoint:** GET /api/v1/crm/leads/{id}?include=activities&updatedSince={timestamp}
- **Visual indicator:** Show "Live updates paused" indicator in page header

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Change status | Immediately update badge and available actions | Revert badge and actions, show error toast |
| Log activity | Immediately add to timeline with loading indicator | Remove activity entry, show error toast with form data preserved |
| Edit lead fields | Immediately show updated values | Revert to previous values, show error toast |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| lead-form | src/components/crm/lead-form.tsx | mode: 'edit', leadData |
| activity-timeline | src/components/crm/activity-timeline.tsx | activities, leadId, onActivityCreate |
| StatusBadge | src/components/ui/status-badge.tsx | status, size: 'lg' |
| PageHeader | src/components/layout/page-header.tsx | title, breadcrumbs, actions |
| hubspot-sync-badge | src/components/crm/hubspot-sync-badge.tsx | syncStatus, lastSyncAt |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| activity-timeline | Basic list with type, subject, date | Add expandable descriptions, pin functionality, type filtering tabs, file attachments, rich text rendering |
| lead-form | Basic CRUD fields | Add duplicate detection warning, auto-population from email lookup, validation improvements |
| hubspot-sync-badge | Small text indicator | Add card layout with sync history, manual sync button, error details |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| LeadProfileCard | Left sidebar card showing all lead info with status actions | Medium -- card with multiple sections, conditional action buttons |
| RevenueDetailsCard | Card showing estimated revenue, volume, annual value | Small -- formatted numbers with labels |
| ConversionInfoCard | Card showing linked Company, Contact, Opportunity after conversion | Small -- links to related entities |
| LeadConversionWizard | Multi-step form: confirm data > create company > create contact > create opportunity | Large -- 4-step wizard with validation, pre-population, and creation |
| ActivityLogForm | Tabbed form for logging different activity types with type-specific fields | Medium -- tabbed form with conditional fields per activity type |
| ActivityFilterTabs | Tab bar for filtering timeline by activity type | Small -- tab/button group |
| LeadScoreCard | Visual display of lead score with factor breakdown | Medium -- score display with breakdown chart |
| HubSpotSyncCard | Card showing sync status, ID, timestamp, sync button, error info | Small -- card with status badge and action button |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Tabs | tabs | Activity type tabs in log form and timeline filter |
| Dialog | dialog | Edit lead modal, conversion wizard |
| Avatar | avatar | Lead initials avatar, assigned rep avatar |
| Card | card | Profile card, revenue card, sync card |
| Textarea | textarea | Activity description input |
| Alert | alert | Duplicate warning, aging alert |
| Separator | separator | Dividers in profile card |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/v1/crm/leads/:id | Fetch lead detail with all fields | useLead(id) |
| 2 | PATCH | /api/v1/crm/leads/:id | Update lead details | useUpdateLead() |
| 3 | PATCH | /api/v1/crm/leads/:id/status | Change lead status | useUpdateLeadStatus() |
| 4 | PATCH | /api/v1/crm/leads/:id/assign | Reassign lead to different rep | useAssignLead() |
| 5 | DELETE | /api/v1/crm/leads/:id | Soft delete lead | useDeleteLead() |
| 6 | POST | /api/v1/crm/leads/:id/convert | Convert lead to Company+Contact+Opportunity | useConvertLead() |
| 7 | GET | /api/v1/crm/leads/:id/activities | Fetch activities for this lead (paginated) | useLeadActivities(leadId) |
| 8 | POST | /api/v1/crm/leads/:id/activities | Create a new activity on this lead | useCreateActivity() |
| 9 | PATCH | /api/v1/crm/activities/:id | Update an activity (edit, pin) | useUpdateActivity() |
| 10 | DELETE | /api/v1/crm/activities/:id | Delete an activity | useDeleteActivity() |
| 11 | POST | /api/v1/crm/leads/:id/sync-hubspot | Trigger manual HubSpot sync for this lead | useSyncLeadHubSpot() |
| 12 | GET | /api/v1/crm/leads/:id/hubspot-status | Get HubSpot sync status for this lead | useLeadHubSpotStatus(id) |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| crm:lead:{leadId} | lead.updated | useLeadDetailUpdates(leadId) -- invalidates lead query |
| crm:lead:{leadId} | lead.status.changed | useLeadDetailUpdates(leadId) -- updates status and actions |
| crm:lead:{leadId} | activity.created | useLeadDetailUpdates(leadId) -- adds to timeline |
| crm:lead:{leadId} | hubspot.synced | useLeadDetailUpdates(leadId) -- updates sync badge |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 409 | 500 |
|---|---|---|---|---|---|---|
| GET /api/v1/crm/leads/:id | N/A | Redirect to login | "Access Denied" page | "Lead not found" page | N/A | Error state with retry |
| PATCH /api/v1/crm/leads/:id/status | "Invalid transition" toast | Redirect to login | "Permission Denied" toast | "Lead not found" | "Status already changed" | Error toast |
| POST /api/v1/crm/leads/:id/convert | "Lead must be QUALIFIED" toast | Redirect to login | "Permission Denied" toast | "Lead not found" | "Already converted" | Error toast |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Left column shows skeleton card with avatar circle, text bars for name/email/phone, badge placeholder. Right column shows skeleton timeline with 5 entries (icon circle + text bars).
- **Progressive loading:** Profile card loads first (fast, single record). Activity timeline loads separately (may take longer with many activities).
- **Duration threshold:** If loading exceeds 5s, show "Loading lead details..." message.

### Empty States

**No activities on lead:**
- **Illustration:** Chat bubble illustration
- **Headline:** "No activities yet"
- **Description:** "Log your first interaction with this lead to start tracking the conversation."
- **CTA:** Focus on the Log Activity form

**Lead not found (invalid ID):**
- **Display:** "Lead not found. It may have been deleted or you may not have access."
- **CTA:** "Back to Leads List" button

### Error States

**Full page error (lead detail API fails):**
- **Display:** Error icon + "Unable to load lead details" + "Please try again or contact support." + Retry button

**Activity timeline error (activities API fails):**
- **Display:** Profile card displays normally. Timeline section shows: "Could not load activities" + Retry link.

**Action error:**
- **Display:** Toast notification with specific error message. Auto-dismiss after 8 seconds.

### Permission Denied

- **Full page denied:** "You don't have permission to view this lead" with link back to Leads List
- **Partial denied:** Edit/Delete/Convert buttons hidden; lead is read-only; Log Activity form hidden

### Offline / Degraded

- **Full offline:** Show banner: "You're offline. Showing cached lead data from [timestamp]. Activities cannot be logged."
- **Degraded:** "Live updates paused" indicator. Data loads on manual refresh.

---

## 12. Filters, Search & Sort

### Filters (Activity Timeline)

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Activity Type | Tab / toggle group | All, Calls, Emails, Meetings, Tasks, Notes | All | ?activityType= |

### Search Behavior

- **Search field:** No search on this screen (single lead context). Use global search to navigate to a different lead.
- **Searches across:** N/A
- **Behavior:** N/A
- **URL param:** N/A

### Sort Options

| Content | Default Sort | Sort Type |
|---|---|---|
| Activity Timeline | Newest first (created_at descending) | Date |
| Pinned Activities | Pinned items always at top, then by date | Custom (pinned first, then date) |

**Default sort:** Activities sorted newest first, with pinned items at top.

### Saved Filters / Presets

- **System presets:** N/A for detail screen
- **User-created presets:** N/A for detail screen
- **URL sync:** Activity type filter reflected in URL: /crm/leads/:id?activityType=CALL

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Left sidebar profile card and right activity timeline stack vertically
- Profile card becomes full-width at top
- Activity timeline becomes full-width below
- Action buttons remain in header area
- Revenue details card moves inline below profile card

### Mobile (< 768px)

- Full vertical stack layout
- Profile card at top with compact layout (name, status, key contact info)
- Quick-action buttons (Call, Email) as icon buttons in a row below profile
- Activity timeline below as full-width scrollable list
- Log Activity form accessible via floating action button (FAB)
- Status change actions in a bottom sheet triggered by status badge tap
- Edit via full-screen form (not modal)
- Swipe between activities for quick review

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full 2-column layout as designed in Section 3 |
| Desktop | 1024px - 1439px | Same layout, slightly narrower sidebar |
| Tablet | 768px - 1023px | See tablet notes above |
| Mobile | < 768px | See mobile notes above |

---

## 14. Stitch Prompt

```
Design a Lead Detail screen for a modern SaaS TMS (Transportation Management System) called "Ultra TMS."

Layout: Full-width page with dark slate-900 sidebar (240px) on the left with "CRM" > "Leads" highlighted. White/gray-50 content area on the right. Top has a breadcrumb "CRM > Leads > John Smith", a "Back to Leads" link with left arrow, and action buttons on the right: secondary "Edit" with pencil icon, primary blue "Convert to Opportunity" with arrow-right icon, secondary "More" dropdown.

Two-Column Layout Below Header:

Left Column (320px, sticky): A profile card with white background, rounded-lg, shadow-sm. At the top, show a large circular avatar with initials "JS" on a blue background, the name "John Smith" in 20px semibold, company "Acme Logistics" in gray-500, and a green QUALIFIED status badge. Below, show contact info: email "john@acmelogistics.com" as a blue link, phone "(555) 123-4567" as a link, and a small "Source: Web Form" label. Below that, "Assigned to: James Wilson" with a small avatar.

Below the profile card, show a "Revenue Details" card with: "Est. Monthly Revenue: $15,000", "Est. Monthly Volume: 20 loads", "Annual Value: $180,000" in green.

Below that, a "HubSpot Sync" card showing: a green dot with "Synced", "Last sync: 15 min ago", HubSpot ID "HS-4829301" as a link, and a small "Sync Now" button.

Right Column (remaining width): An "Activity Timeline" section. At the top, a "Log Activity" bar with 5 tab-style buttons: Call (phone icon), Email (mail icon), Meeting (users icon), Task (check-square icon), Note (file-text icon). The Call tab is selected, showing a compact form with "Subject" text input, "Notes" textarea, and a blue "Log Call" button.

Below the log form, show the timeline. Each entry has a colored icon on the left (green phone for calls, blue mail for emails, purple users for meetings), connected by a vertical line. Show 5 timeline entries:
1. Phone icon (green) | "Discussed freight needs and rate expectations" | "January 15, 2026 at 2:30 PM by James Wilson" | Expanded text: "John is interested in 20 loads/month from Chicago to Dallas. Looking for competitive rates under $2,500 per load. Decision expected by end of month."
2. Mail icon (blue) | "Sent rate sheet and service overview" | "January 14, 2026 at 10:15 AM by James Wilson"
3. Status change icon (gray arrow) | "Status changed: NEW to CONTACTED" | "January 13, 2026 at 3:00 PM"
4. Phone icon (green) | "Initial discovery call - left voicemail" | "January 13, 2026 at 11:00 AM by James Wilson"
5. Plus icon (gray) | "Lead created via Web Form" | "January 12, 2026 at 9:00 AM"

Include a "Load More" link at the bottom of the timeline.

Design Specifications:
- Font: Inter or system sans-serif, 14px base size
- Sidebar: slate-900 background, white text, blue-600 active indicator
- Content background: gray-50 for page, white for cards
- Primary color: blue-600 for buttons and links
- Profile card: white background, rounded-lg, shadow-sm, 16px padding
- Timeline: vertical line in gray-200, icon circles 32px, entries with 12px gap
- Status badge: green-100 bg with green-800 text for QUALIFIED
- Activity type icons: colored circles -- green for calls, blue for emails, purple for meetings
- Modern SaaS aesthetic similar to HubSpot contact detail or Salesforce record page
- Include hover states on timeline entries (subtle gray-50 background)
```

---

## 15. Enhancement Opportunities

### Current State (Wave 1 -- Enhancement Focus)

**What's built and working:**
- [x] Lead profile card with name, company, email, phone, status
- [x] Activity timeline showing logged activities
- [x] Log new activity (call, email, meeting, task, note) form
- [x] Status change buttons (Contact, Qualify, Unqualify)
- [x] Edit lead via modal form
- [x] Revenue details display (estimated revenue and volume)
- [x] Breadcrumb navigation back to Leads List
- [x] Status badge with color coding

**What needs polish / bug fixes:**
- [ ] Activity timeline does not support expanding/collapsing long descriptions
- [ ] No loading state for activity submission -- button does not show spinner
- [ ] Status change does not show confirmation for destructive actions (Mark Unqualified)
- [ ] Profile card does not show days-in-status or aging indicator
- [ ] Mobile layout stacks poorly -- profile card takes too much vertical space

**What to add this wave:**
- [ ] Lead conversion wizard (multi-step: confirm > company > contact > opportunity)
- [ ] Quick-action buttons (Call, Email, Meeting) that log activity and open tool
- [ ] HubSpot sync card with status, ID, manual sync
- [ ] Conversion info card (links to created entities after conversion)
- [ ] Activity filtering by type (tabs)
- [ ] Activity pinning
- [ ] Rich text in activity descriptions
- [ ] File attachments on activities
- [ ] Follow-up scheduling from activity log
- [ ] Lead score display with factor breakdown
- [ ] Duplicate warning banner

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Lead conversion wizard | High | High | P0 |
| Quick-action buttons | High | Low | P0 |
| Activity filtering by type | Medium | Low | P0 |
| HubSpot sync card | Medium | Medium | P1 |
| Conversion info card | Medium | Low | P1 |
| Activity pinning | Low | Low | P1 |
| Follow-up scheduling | Medium | Medium | P1 |
| Rich text descriptions | Low | Medium | P2 |
| File attachments | Medium | High | P2 |
| Lead score display | Medium | Medium | P2 |
| Duplicate warning | Medium | Medium | P2 |

### Future Wave Preview

- **Wave 2:** Automated lead scoring based on engagement history, email integration (send/receive emails directly from lead detail), call recording playback, AI-generated meeting summaries
- **Wave 3:** Predictive next-best-action recommendations, automated nurture sequence triggers, competitive intelligence widgets, social media profile enrichment

---
