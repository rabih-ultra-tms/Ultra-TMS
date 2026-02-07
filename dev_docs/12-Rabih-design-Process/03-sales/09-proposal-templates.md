# Proposal Templates -- Quote Proposal Templates

> Service: Sales (03) | Wave: 1 | Priority: P2
> Route: /sales/templates | Status: Not Started
> Primary Personas: James Wilson (Sales Agent), Sales Manager
> Roles with Access: super_admin, admin, sales_manager, sales_agent (can use templates; create/edit requires template_manage)

---

## 1. Purpose & Business Context

**What this screen does:**
The Proposal Templates screen is the library of reusable document templates that transform raw quote data into professional, branded proposals that can be sent to customers. It displays a list of all proposal templates organized by service type (FTL, LTL, Drayage) with previews, and provides a template editor for building proposal sections: cover letter, pricing table, terms and conditions, and company information. Templates use merge fields/variables (e.g., `{{customer_name}}`, `{{total_rate}}`, `{{origin_city}}`) that are automatically populated with quote data when a proposal is generated.

**Business problem it solves:**
Without standardized proposal templates, every sales agent formats quotes differently. Some send plain emails with rate numbers, others cobble together Word documents with inconsistent branding, and a few use the company letterhead but format it poorly. This inconsistency undermines the professional image of the brokerage and makes it harder for customers to compare and approve quotes. Worse, agents spend 5-15 minutes per proposal formatting documents instead of selling. The Proposal Templates screen eliminates formatting work entirely -- agents select a template, the system generates a branded PDF with all quote data populated, and the customer receives a professional proposal in seconds.

**Key business rules:**
- Each template is associated with one or more service types (FTL, LTL, Partial, Drayage) or marked as "Universal" (all types).
- Templates have a status: ACTIVE (available for use in quotes), DRAFT (being built, not available), ARCHIVED (retired but preserved).
- Only one template can be marked as the "Default" for each service type. The default template is automatically selected in the Quote Builder when generating proposals.
- Templates consist of ordered sections: Cover Letter, Pricing Table, Terms & Conditions, Company Information, Custom Sections.
- Each section supports rich text editing with merge fields.
- Merge fields are validated against the quote data model. Invalid merge fields show errors in the editor.
- Template previews are generated using sample data so the user can see how the final proposal will look.
- Templates can include the company logo, header/footer, and custom colors.
- Sending a proposal (from Quote Builder or Quote Detail) generates a PDF from the selected template populated with actual quote data.
- Sales agents can use any active template but cannot create or edit templates unless they have `template_manage` permission.

**Success metric:**
Proposal generation time drops from 5-15 minutes (manual formatting) to under 10 seconds (template selection + auto-generation). Brand consistency across proposals increases from ~40% compliance to 100%. Customer quote-to-acceptance conversion rate improves by 10-15% due to professional presentation.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Sidebar Navigation | Clicks "Proposal Templates" under Sales section | None |
| Quote Builder | Clicks "Select Template" when generating a proposal | None (opens as a selector modal OR navigates here) |
| Quote Detail | Clicks "View Proposal" or "Generate Proposal" link | ?templateId=TPL-XXX (optional) |
| Service Overview | Navigates from documentation | None |
| Direct URL | Bookmark / shared link | Filter params in URL |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Template Editor (inline/modal) | Clicks "Edit" on a template or "+ New Template" | templateId or none |
| Quote Builder | Returns from template selection | selectedTemplateId |
| Template Preview | Clicks "Preview" on a template | templateId with sample data |

**Primary trigger:**
The Sales Manager wants to create a new proposal template for LTL shipments. The current FTL template does not include weight/class columns in the pricing table. She opens Proposal Templates, clicks "+ New Template", selects "LTL" as the service type, builds sections for a cover letter with merge fields (`Dear {{contact_name}}...`), an LTL-specific pricing table (with weight, class, and per-CWT columns), standard terms, and company info. She previews it with sample data, saves, and marks it as the default for LTL quotes. Alternatively, James opens the template list to preview the standard FTL template before sending a quote, ensuring the customer will see a professional document.

**Success criteria (user completes the screen when):**
- User has reviewed available templates and understands which are active and which are defaults.
- User has created or edited a template (manager) or selected a template for use in a quote (agent).
- User has previewed the template to verify it looks correct with sample data.

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------------+
|  Top Bar: [Sales] > Proposal Templates                                  |
|                                         [+ New Template] (primary)      |
+------------------------------------------------------------------------+
|                                                                        |
|  +----------+  +----------+  +-----------+  +----------+              |
|  | Total    |  | Active   |  | Draft     |  | Default  |              |
|  | Templates|  | Templates|  | Templates |  | Set      |              |
|  |    8     |  |    5     |  |     2     |  |   3/4    |              |
|  +----------+  +----------+  +-----------+  +----------+              |
|                                                                        |
|  +------------------------------------------------------------------+  |
|  | View: [Grid] [List]  | Filter: [Service Type v] [Status v]       |  |
|  |                       | [Search templates.................]       |  |
|  +------------------------------------------------------------------+  |
|                                                                        |
|  +------------------------------------------------------------------+  |
|  |  GRID VIEW (3 columns)                                           |  |
|  |                                                                   |  |
|  |  +------------------+  +------------------+  +------------------+ |  |
|  |  | [PDF Preview]    |  | [PDF Preview]    |  | [PDF Preview]    | |  |
|  |  | thumbnail        |  | thumbnail        |  | thumbnail        | |  |
|  |  |                  |  |                  |  |                  | |  |
|  |  |                  |  |                  |  |                  | |  |
|  |  |                  |  |                  |  |                  | |  |
|  |  |                  |  |                  |  |                  | |  |
|  |  |                  |  |                  |  |                  | |  |
|  |  |                  |  |                  |  |                  | |  |
|  |  +------------------+  +------------------+  +------------------+ |  |
|  |  | Standard FTL     |  | LTL Pricing      |  | Drayage          | |  |
|  |  | Proposal         |  | Proposal         |  | Proposal         | |  |
|  |  | [ACTIVE][DEFAULT] |  | [ACTIVE][DEFAULT]|  | [ACTIVE][DEFAULT]| |  |
|  |  | FTL | 4 sections  |  | LTL | 4 sections|  | Dray | 3 sects  | |  |
|  |  | Modified Feb 03  |  | Modified Jan 28  |  | Modified Jan 15  | |  |
|  |  | [Preview][Edit][.]|  | [Preview][Edit][.]|  | [Preview][Edit][.]| |  |
|  |  +------------------+  +------------------+  +------------------+ |  |
|  |                                                                   |  |
|  |  +------------------+  +------------------+  +------------------+ |  |
|  |  | [PDF Preview]    |  | [PDF Preview]    |  | [No Preview]     | |  |
|  |  | thumbnail        |  | thumbnail        |  | DRAFT            | |  |
|  |  |                  |  |                  |  |                  | |  |
|  |  +------------------+  +------------------+  +------------------+ |  |
|  |  | Premium FTL      |  | Multi-Stop       |  | Reefer Special   | |  |
|  |  | Proposal         |  | Proposal         |  | (Work in Progress)| |  |
|  |  | [ACTIVE]         |  | [ACTIVE]         |  | [DRAFT]          | |  |
|  |  | FTL | 5 sections  |  | FTL | 6 sections|  | FTL,RF | 0 sects| |  |
|  |  | Modified Feb 01  |  | Modified Jan 20  |  | Modified Feb 05  | |  |
|  |  | [Preview][Edit][.]|  | [Preview][Edit][.]|  | [Edit][.]        | |  |
|  |  +------------------+  +------------------+  +------------------+ |  |
|  +------------------------------------------------------------------+  |
+------------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible, above the fold) | Template name, status badge, default indicator, PDF thumbnail preview, service type | Users need to identify templates and their purpose at a glance |
| **Secondary** (visible but less prominent) | Section count, last modified date, service type tags | Context for evaluating template completeness and currency |
| **Tertiary** (available on click) | Template editor with sections, merge fields, rich text, preview | Editing interface accessed on demand |
| **Hidden** (behind preview/modal) | Full-size PDF preview, merge field reference, template version history | Deep reference and editing tools |

---

## 4. Data Fields & Display

### Visible Fields

**Template Card (Grid View)**

| # | Field Label | Source (Entity.field) | Format / Display | Location on Card |
|---|---|---|---|---|
| 1 | Thumbnail | Generated preview | PDF first-page thumbnail, 200x260px, border | Card top (image area) |
| 2 | Name | ProposalTemplate.name | Text, max 30 chars, font-medium | Card body, title |
| 3 | Status | ProposalTemplate.status | Badge: ACTIVE (green), DRAFT (gray), ARCHIVED (amber) | Below name |
| 4 | Default Flag | ProposalTemplate.isDefault | "DEFAULT" blue badge (shown if true) | Next to status badge |
| 5 | Service Types | ProposalTemplate.serviceTypes | Badges: FTL, LTL, DRAY, ALL | Below status |
| 6 | Section Count | Calculated | "X sections" gray text | Below service types |
| 7 | Last Modified | ProposalTemplate.updatedAt | "Modified MMM DD" gray text | Card footer, left |
| 8 | Actions | N/A | Preview button, Edit button, three-dot menu | Card footer, right |

**Template Row (List View)**

| # | Field Label | Source (Entity.field) | Format / Display | Location on Row |
|---|---|---|---|---|
| 1 | Name | ProposalTemplate.name | Text, clickable link | Row column 1 |
| 2 | Status | ProposalTemplate.status | Badge | Row column 2 |
| 3 | Default | ProposalTemplate.isDefault | Star icon (filled if default) | Row column 3 |
| 4 | Service Types | ProposalTemplate.serviceTypes | Comma-separated badges | Row column 4 |
| 5 | Sections | COUNT(sections) | Integer | Row column 5 |
| 6 | Last Modified | ProposalTemplate.updatedAt | "MMM DD, YYYY" | Row column 6 |
| 7 | Modified By | User.name | "First L." | Row column 7 |
| 8 | Actions | N/A | Three-dot menu | Row column 8 |

**Template Editor (opened on edit)**

| # | Field Label | Source (Entity.field) | Format / Display | Required |
|---|---|---|---|---|
| 9 | Template Name | ProposalTemplate.name | Text input, max 100 chars | Yes |
| 10 | Service Types | ProposalTemplate.serviceTypes | Multi-select: FTL, LTL, PARTIAL, DRAYAGE | Yes |
| 11 | Description | ProposalTemplate.description | Textarea, max 500 chars | No |
| 12 | Company Logo | ProposalTemplate.logoUrl | Image upload, max 2MB, PNG/JPG | No |
| 13 | Header Color | ProposalTemplate.headerColor | Color picker, default blue-600 | No |
| 14 | Sections | ProposalTemplateSection[] | Ordered list of editable sections | Yes (min 1) |
| 15 | Section Title | Section.title | Text input per section | Yes |
| 16 | Section Content | Section.content | Rich text editor with merge field support | Yes |
| 17 | Section Order | Section.order | Drag-to-reorder handle | Auto |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Section Count | COUNT(sections) for this template | Integer |
| 2 | Default Coverage | COUNT(service types with a default template) / total service types | "X/4" or "All Covered" |
| 3 | Merge Field Count | COUNT(unique merge fields across all sections) | Integer |
| 4 | Has Invalid Fields | Any merge field not in approved list | Boolean -- shows warning icon |
| 5 | Usage Count | COUNT(proposals generated with this template) | "Used X times" |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] Grid view of templates with PDF thumbnail previews
- [ ] List view alternative with sortable columns
- [ ] Grid/List view toggle
- [ ] Status badges (Active, Draft, Archived) per template
- [ ] Default template indicator per service type
- [ ] Service type tags per template (FTL, LTL, Drayage, etc.)
- [ ] "+ New Template" button to create a new template
- [ ] Template editor with sections: Cover Letter, Pricing Table, Terms & Conditions, Company Info
- [ ] Rich text editor per section with basic formatting (bold, italic, lists, links)
- [ ] Merge field insertion (insert button showing available variables)
- [ ] Merge field preview (variables highlighted in the editor)
- [ ] Template preview with sample data (generates sample PDF)
- [ ] Set as Default for service type
- [ ] Activate / Deactivate / Archive templates
- [ ] Duplicate template (clone to create a new version)
- [ ] Delete draft templates
- [ ] 4 summary stat cards (total, active, draft, default coverage)
- [ ] Filter by service type and status
- [ ] Search by template name

### Advanced Features (Logistics Expert Recommendations)

- [ ] Section drag-to-reorder
- [ ] Custom section types (add new sections beyond the 4 standard ones)
- [ ] Company logo and header color customization
- [ ] PDF download of preview
- [ ] Template version history (track changes over time)
- [ ] "Send Test" -- send a sample proposal to your own email for review
- [ ] Conditional sections (e.g., show hazmat terms only if quote has hazmat accessorial)
- [ ] Multi-language support for international customers
- [ ] Template import/export (share templates between tenants)
- [ ] Merge field validation (highlight invalid fields in red with error message)
- [ ] Template analytics (which templates have highest conversion rates)
- [ ] Customer-specific template assignment (default template per customer)
- [ ] Signature block with e-sign integration placeholder

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| View templates | any authenticated | template_view | Screen not accessible |
| Create template | sales_manager, admin | template_manage | "+ New" button hidden |
| Edit template | sales_manager, admin | template_manage | Edit action hidden |
| Delete template | admin | template_delete | Delete action hidden |
| Set default | sales_manager, admin | template_manage | "Set Default" action hidden |
| Preview template | any authenticated | template_view | Always visible |
| Duplicate template | sales_manager, admin | template_manage | Duplicate action hidden |

---

## 6. Status & State Machine

### Status Transitions

```
[NEW] ---(Save as Draft)----> [DRAFT]
                                |
                          (Activate)
                                |
                                v
                             [ACTIVE] <----(Reactivate)------ [ARCHIVED]
                                |                                ^
                                |---(Archive)-------------------->|
                                |
                          (Set as Default)
                                |
                                v
                          [ACTIVE + DEFAULT]
```

### Actions Available Per Status

| Status | Available Actions | Restricted Actions |
|---|---|---|
| DRAFT | Edit, Activate, Duplicate, Delete, Preview | Set Default (must be active first) |
| ACTIVE | Edit, Set Default, Archive, Duplicate, Preview | Delete (must archive first) |
| ACTIVE + DEFAULT | Edit, Remove Default, Archive, Duplicate, Preview | Delete |
| ARCHIVED | Reactivate, Duplicate, Preview, Delete | Edit, Set Default |

### Status Badge Colors

| Status | Background | Text | Tailwind Classes |
|---|---|---|---|
| DRAFT | gray-100 | gray-700 | `bg-gray-100 text-gray-700` |
| ACTIVE | green-100 | green-800 | `bg-green-100 text-green-800` |
| ARCHIVED | amber-100 | amber-800 | `bg-amber-100 text-amber-800` |
| DEFAULT | blue-100 | blue-800 | `bg-blue-100 text-blue-800` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Top-Right of Page)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| + New Template | Plus | Primary / Blue | Opens template editor for new template (full-page or large modal) | No |

### Secondary Actions (Per-Template Card/Row)

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| Preview | Eye | Opens full-page preview with sample data | Any status |
| Edit | Pencil | Opens template editor | DRAFT or ACTIVE status |
| Set Default | Star | Sets this template as default for its service type(s) | ACTIVE status, not already default |
| Remove Default | StarOff | Removes default flag | Currently default |
| Duplicate | Copy | Creates a new DRAFT template cloned from this one | Any status |
| Activate | ToggleRight | Sets status to ACTIVE | DRAFT status |
| Archive | Archive | Sets status to ARCHIVED | ACTIVE status (removes default if was default) |
| Reactivate | ToggleRight | Sets status back to ACTIVE | ARCHIVED status |
| Delete | Trash | Permanently deletes template | DRAFT or ARCHIVED status only |
| Send Test | Mail | Sends sample proposal to current user's email | ACTIVE status |

### Template Editor Actions

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| Add Section | Plus | Adds a new section to the template | Always |
| Remove Section | Trash | Removes a section (with confirmation) | More than 1 section exists |
| Insert Merge Field | Code | Opens merge field picker to insert variable at cursor | Text editor focused |
| Preview | Eye | Generates preview with sample data in side panel | At least 1 section has content |
| Save Draft | Save | Saves template as DRAFT | Always |
| Save & Activate | ToggleRight | Saves and sets to ACTIVE | Form valid |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + N | Create new template |
| Ctrl/Cmd + S | Save current template (in editor) |
| Ctrl/Cmd + P | Preview current template (in editor) |
| Ctrl/Cmd + K | Open global search |
| G then L | Switch to list view |
| G then G | Switch to grid view |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| Template section (in editor) | Another section position | Reorders sections, updates order numbers |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| N/A | N/A | Proposal Templates is a static configuration screen. No real-time push updates needed. |

### Live Update Behavior

- **Update frequency:** Data loads on page navigation. Templates change infrequently.
- **Preview generation:** On-demand, triggered by user clicking "Preview." May take 1-3 seconds to generate PDF.
- **Concurrent edit handling:** On save, API checks for concurrent modifications. Warning dialog if another user edited the same template.

### Polling Fallback

- **When:** N/A -- static screen
- **Interval:** N/A
- **Endpoint:** N/A

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Set Default | Immediately show DEFAULT badge, remove from previous default | Revert badges, show error toast |
| Archive | Immediately fade card/move to archived section | Restore, show error toast |
| Delete | Immediately remove card | Restore card, show error toast |
| Save template | Show "Saving..." then "Saved" indicator | Show error toast with validation details |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| PageHeader | src/components/layout/page-header.tsx | title: "Proposal Templates", breadcrumbs, actions |
| StatsCard | src/components/ui/stats-card.tsx | value, label |
| StatusBadge | src/components/ui/status-badge.tsx | status |
| Badge | src/components/ui/badge.tsx | Service type badges, default badge |
| Button | src/components/ui/button.tsx | All action buttons |
| Card | src/components/ui/card.tsx | Template cards in grid view |
| Dialog | src/components/ui/dialog.tsx | Confirmation dialogs |
| AlertDialog | src/components/ui/alert-dialog.tsx | Delete confirmation |
| Input | src/components/ui/input.tsx | Template name, section title |
| Select | src/components/ui/select.tsx | Service type select |
| Textarea | src/components/ui/textarea.tsx | Description, section fallback |
| Tooltip | src/components/ui/tooltip.tsx | Merge field explanations |
| Skeleton | src/components/ui/skeleton.tsx | Loading states |
| DropdownMenu | src/components/ui/dropdown-menu.tsx | Card action menus |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| Card | Basic container | Add image/thumbnail slot at top for PDF preview, action footer with buttons |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| TemplateCard | Grid card with PDF thumbnail, name, status badges, service type tags, action buttons | Medium |
| TemplateEditor | Full-page or large modal editor with section list, rich text editing, merge fields, preview | High |
| SectionEditor | Single section component with title input, rich text editor, merge field insertion, drag handle, delete button | High |
| RichTextEditor | Rich text editor with basic formatting toolbar and merge field highlighting | High |
| MergeFieldPicker | Dropdown or modal listing available merge fields with descriptions, click-to-insert | Medium |
| MergeFieldChip | Inline styled chip for merge fields in the editor (e.g., `{{customer_name}}` shown as a blue pill) | Small |
| TemplatePreviewPanel | Side panel or modal showing PDF preview with sample data, zoom controls | High |
| PDFThumbnail | Component that renders a miniature PDF preview (first page) for grid cards | Medium |
| ViewToggle | Toggle button group for switching between Grid and List views | Small |
| ColorPicker | Simple color picker for header/accent color selection | Small |
| LogoUpload | Image upload component with preview, crop, and size validation | Medium |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| ToggleGroup | toggle-group | Grid/List view toggle |
| Sheet | sheet | Template preview side panel |
| Tabs | tabs | Template editor section navigation |
| Collapsible | collapsible | Section collapse/expand in editor |
| Popover | popover | Merge field picker, color picker |
| Separator | separator | Section dividers |
| ScrollArea | scroll-area | Template editor scrollable content |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/v1/proposal-templates | List all templates with pagination and filters | useProposalTemplates(filters) |
| 2 | GET | /api/v1/proposal-templates/:id | Get single template with all sections | useProposalTemplate(templateId) |
| 3 | POST | /api/v1/proposal-templates | Create new template | useCreateProposalTemplate() |
| 4 | PUT | /api/v1/proposal-templates/:id | Update template (name, sections, settings) | useUpdateProposalTemplate() |
| 5 | DELETE | /api/v1/proposal-templates/:id | Delete template (draft/archived only) | useDeleteProposalTemplate() |
| 6 | PATCH | /api/v1/proposal-templates/:id/activate | Activate template | useActivateTemplate() |
| 7 | PATCH | /api/v1/proposal-templates/:id/archive | Archive template | useArchiveTemplate() |
| 8 | PATCH | /api/v1/proposal-templates/:id/set-default | Set as default for service type | useSetDefaultTemplate() |
| 9 | POST | /api/v1/proposal-templates/:id/preview | Generate preview PDF with sample data | usePreviewTemplate() |
| 10 | POST | /api/v1/proposal-templates/:id/duplicate | Duplicate template as new draft | useDuplicateTemplate() |
| 11 | POST | /api/v1/proposal-templates/:id/send-test | Send test proposal to current user's email | useSendTestProposal() |
| 12 | GET | /api/v1/proposal-templates/merge-fields | Get list of available merge fields with descriptions | useMergeFields() |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| N/A | N/A | No real-time subscriptions -- static configuration screen |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 409 | 422 | 500 |
|---|---|---|---|---|---|---|---|
| POST /proposal-templates | Show validation errors in editor | Redirect to login | Show "Permission Denied" toast | N/A | Show "Duplicate name" error | Show field-level errors | Show error toast |
| PUT /proposal-templates/:id | Show validation errors | Redirect to login | Show "Permission Denied" toast | Show "Template not found" | Show concurrent edit dialog | Show field-level errors | Show error toast |
| POST /preview | Show "Cannot generate preview" toast | Redirect to login | N/A | Show "Template not found" toast | N/A | Show "Invalid template" with details | Show "Preview generation failed" toast |

---

## 11. States & Edge Cases

### Loading State

- **Grid view:** Show 6 skeleton cards (gray rectangles with shimmer for thumbnail area, text placeholders below).
- **List view:** Show 8 skeleton rows.
- **Template editor:** Show skeleton for section list and editor area.
- **Preview generation:** Show "Generating preview..." with spinning indicator in the preview panel. Should take 1-3 seconds.

### Empty States

**First-time empty (no templates):**
- **Illustration:** Document/template illustration
- **Headline:** "No proposal templates yet"
- **Description:** "Create your first proposal template to start sending professional, branded quotes to customers. Templates automatically populate with quote data using merge fields."
- **CTA Buttons:** "Create First Template" (primary), "Start with Standard Template" (secondary -- creates a pre-built FTL template)

**Filtered empty:**
- **Headline:** "No templates match your filters"
- **CTA Button:** "Clear Filters" -- secondary outline button

**No sections in template (editor):**
- **Display:** "This template has no sections yet. Add your first section to start building the proposal layout."
- **CTA:** "+ Add Section" button

### Error States

**Full page error:**
- **Display:** Error icon + "Unable to load proposal templates" + Retry button

**Preview generation error:**
- **Display:** In preview panel: "Could not generate preview. Check that all merge fields are valid and try again." with Retry button.

**Save error:**
- **Display:** Validation errors highlighted in the editor. Red badges on invalid sections. Error summary banner at top of editor.

**Invalid merge fields:**
- **Display:** Invalid merge fields highlighted in red in the editor text. Tooltip: "Unknown merge field: {{invalid_field}}. Available fields are listed in the merge field picker."

### Permission Denied

- **Full page denied:** Show "You don't have permission to view proposal templates" with link to Sales Dashboard
- **Read-only for agents:** Grid/list displays normally. Edit, create, and delete actions hidden. "Preview" is available.

### Offline / Degraded

- **Full offline:** Banner: "You're offline. Showing cached template list. Editing and preview are unavailable."
- **Preview API down:** "Preview generation is temporarily unavailable. You can still edit and save templates."

---

## 12. Filters, Search & Sort

### Filters

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Service Type | Multi-select | FTL, LTL, PARTIAL, DRAYAGE, UNIVERSAL | All | ?serviceType= |
| 2 | Status | Select | ACTIVE, DRAFT, ARCHIVED, All | ACTIVE | ?status=active |
| 3 | View Mode | Toggle | Grid, List | Grid | ?view=grid |

### Search Behavior

- **Search field:** Single search input in the filter bar
- **Searches across:** Template name, description
- **Behavior:** Debounced 300ms, minimum 2 characters
- **URL param:** ?search=

### Sort Options

| Column / Field | Default Direction | Sort Type |
|---|---|---|
| Name | Ascending (A-Z) | Alphabetic |
| Status | Custom order: ACTIVE, DRAFT, ARCHIVED | Custom enum |
| Service Type | Alphabetic | Alphabetic |
| Last Modified | Descending (newest first) | Date |
| Section Count | Descending | Numeric |

**Default sort:** Status (ACTIVE + DEFAULT first, then ACTIVE, then DRAFT, then ARCHIVED), then name alphabetical.

### Saved Filters / Presets

- **System presets:** "Active Templates" (status=ACTIVE), "FTL Templates" (serviceType=FTL), "Drafts" (status=DRAFT)
- **URL sync:** All filter state and view mode reflected in URL.

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Grid view: 2 columns instead of 3
- Stat cards: 2 per row (2 rows of 2)
- Template editor: Full-width, preview panel below editor instead of beside it
- Filter bar: collapse to "Filters" dropdown
- Sidebar collapses to icon-only mode

### Mobile (< 768px)

- Grid view: single column (cards stack vertically) or switch to compact list
- Stat cards: 2 per row, compact
- Template editor: Full-screen view, sections as accordion
- Preview: Full-screen modal
- "+ New Template" in sticky bottom bar
- Filter: Full-screen filter modal
- Rich text editor: simplified toolbar
- Merge field picker: full-screen bottom sheet

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | 3-column grid, full template editor with side preview |
| Desktop | 1024px - 1439px | 3-column grid, editor preview below |
| Tablet | 768px - 1023px | 2-column grid, stacked editor/preview |
| Mobile | < 768px | Single column, full-screen editor, accordion sections |

---

## 14. Stitch Prompt

```
Design a proposal templates management page for a modern freight/logistics TMS (Transportation Management System) called "Ultra TMS."

Layout: Full-width page with dark slate-900 sidebar (240px). White content area. Page header with breadcrumb "Sales > Proposal Templates", title "Proposal Templates" in semibold 24px. Subtitle: "Manage branded proposal documents for customer quotes" in gray-500 text-sm. Right side: view toggle buttons (grid icon selected in blue-600, list icon in gray-400) and a blue-600 "+ New Template" button.

Stats Row: 4 stat cards:
- Card 1: "Total Templates" value "8" with document icon
- Card 2: "Active" value "5" with green-500 dot
- Card 3: "Draft" value "2" with gray-400 pencil icon
- Card 4: "Defaults Set" value "3/4" with a blue progress indicator (3 of 4 service types have defaults)

Filter Bar: Compact filter row:
- Service Type multi-select showing "All Types"
- Status select showing "Active"
- Search input with placeholder "Search templates..."

Grid View: 6 template cards in 3x2 grid. Each card is a white rounded-lg container with subtle border:

Card 1 (top-left):
- PDF thumbnail showing a professional proposal document preview with company logo, "Acme Manufacturing" header, pricing table
- Title: "Standard FTL Proposal" in font-medium
- Badges below: green "ACTIVE" badge, blue "DEFAULT" badge, "FTL" gray tag
- "4 sections | Modified Feb 03" in gray text-sm
- Footer: "Preview" ghost button, "Edit" ghost button, three-dot menu

Card 2 (top-center):
- PDF thumbnail with LTL-specific layout (weight/class columns visible in pricing table)
- Title: "LTL Pricing Proposal"
- Badges: green "ACTIVE", blue "DEFAULT", "LTL" tag
- "4 sections | Modified Jan 28"

Card 3 (top-right):
- PDF thumbnail with drayage-specific layout
- Title: "Drayage Proposal"
- Badges: green "ACTIVE", blue "DEFAULT", "DRAY" tag
- "3 sections | Modified Jan 15"

Card 4 (bottom-left):
- PDF thumbnail with premium design (more graphics, testimonial section)
- Title: "Premium FTL Proposal"
- Badges: green "ACTIVE", "FTL" tag (no default badge)
- "5 sections | Modified Feb 01"

Card 5 (bottom-center):
- PDF thumbnail showing multi-stop route map in proposal
- Title: "Multi-Stop Proposal"
- Badges: green "ACTIVE", "FTL" tag
- "6 sections | Modified Jan 20"

Card 6 (bottom-right):
- Dashed border card with gray placeholder instead of thumbnail, indicating draft
- Title: "Reefer Specialization"
- Badges: gray "DRAFT", "FTL" tag, "RF" tag
- "0 sections | Modified Feb 05"
- Footer: "Edit" button only (no preview for empty draft)

Card thumbnails are 200px tall with object-fit cover and a subtle shadow. Cards have hover:shadow-md transition.

Design Specifications:
- Font: Inter, 14px base, 24px title
- Sidebar: slate-900, "Proposal Templates" active with blue-600 indicator
- Content bg: slate-50, cards white with border-slate-200
- Primary: blue-600 for buttons, selected toggle, default badge
- Card thumbnails: rounded-t-lg, border-b, subtle inner shadow at bottom for depth
- Status badges: green-100/green-800 (Active), gray-100/gray-700 (Draft), amber-100/amber-800 (Archived)
- Default badge: blue-100/blue-800 with star icon
- Service type tags: gray-100/gray-600, text-xs, rounded-full
- Card footer: gray-50 bg, rounded-b-lg, flex with ghost buttons
- Grid gap: 24px
- Card hover: shadow-md transition, slight translateY(-1px)
- Draft cards: dashed border-slate-300 instead of solid, placeholder illustration instead of thumbnail
- Modern SaaS aesthetic similar to Canva template library or Notion template gallery
```

---

## 15. Enhancement Opportunities

### Current State (Wave 1)

**What's built and working:**
- Nothing -- screen is Not Started.

**What needs polish / bug fixes:**
- N/A (not yet built)

**What to add this wave:**
- [ ] Grid view with template cards and PDF thumbnails
- [ ] List view alternative
- [ ] Template status management (Active, Draft, Archived)
- [ ] Set default template per service type
- [ ] Template editor with sections (Cover Letter, Pricing Table, Terms, Company Info)
- [ ] Rich text editor per section
- [ ] Merge field insertion and highlighting
- [ ] Template preview with sample data
- [ ] Duplicate template
- [ ] Delete draft/archived templates
- [ ] 4 summary stat cards
- [ ] Filter by service type and status
- [ ] Search by name

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Template list with grid/card view | High | Medium | P0 |
| Template editor with sections | High | High | P0 |
| Merge field insertion | High | Medium | P0 |
| Template preview with sample data | High | High | P0 |
| Rich text editor per section | High | High | P0 |
| Status management (Active/Draft/Archive) | Medium | Low | P0 |
| Set default per service type | Medium | Low | P1 |
| Duplicate template | Medium | Low | P1 |
| PDF thumbnail generation | Medium | Medium | P1 |
| Filter and search | Medium | Low | P1 |
| Stat cards | Low | Low | P1 |
| Company logo/color customization | Medium | Medium | P2 |
| Section drag-to-reorder | Low | Medium | P2 |
| Conditional sections | Low | High | P2 |
| Send test email | Low | Medium | P2 |
| Template analytics | Low | Medium | P3 |
| E-sign integration | Low | High | P3 |

### Future Wave Preview

- **Wave 2:** AI-powered template suggestions ("Based on this customer's industry, we recommend the Premium FTL template with manufacturing-specific terms"). Auto-generated cover letters from quote context. Template A/B testing (track which templates have higher conversion rates).
- **Wave 3:** Interactive proposal builder (customer can view online, ask questions, and accept directly). E-signature integration for contract-level proposals. Multi-language template variants for international customers. Dynamic pricing table that adjusts layout based on quote complexity.

---

<!--
DESIGN NOTES:
1. Proposal Templates is a medium-complexity screen used primarily by managers. Agents use templates passively through the Quote Builder.
2. The grid view with PDF thumbnails is the most visually distinctive feature. It helps users quickly identify templates by their appearance.
3. The rich text editor is the highest-risk component. Consider using Tiptap or Slate.js for the editor, with custom merge field node support.
4. Merge fields must be robust -- invalid fields should be clearly visible in the editor, and the preview should show "[MISSING: field_name]" for undefined fields.
5. PDF generation is server-side. The preview triggers a server request and returns a rendered PDF. Consider caching previews for unchanged templates.
6. The "Standard Template" bootstrap option is important for first-time users. It creates a professional FTL template with all standard sections pre-filled.
-->
