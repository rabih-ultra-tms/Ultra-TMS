# Carrier Detail

> Service: 05 - Carrier Management | Wave: 3 | Priority: P0
> Route: /(dashboard)/carriers/[id] | Status: Not Started
> Primary Personas: Omar (Dispatcher), Sarah (Ops Manager), Admin
> Roles with Access: dispatcher, ops_manager, carrier_admin, admin

---

## 1. Purpose & Business Context

**What this screen does:**
The Carrier Detail screen is the comprehensive 360-degree profile view for a single motor carrier. It displays all carrier information across six tabbed sections (Profile, Compliance, Documents, Performance, Contacts, History) and provides the primary interface for managing the carrier relationship -- editing information, verifying compliance, reviewing performance, managing contacts, and tracking all historical activity. This is the deepest level of carrier information in the system and serves as the single source of truth for any carrier-related question.

**Business problem it solves:**
Before this screen, carrier information was scattered across spreadsheets, email chains, file cabinets (for paper certificates), and the FMCSA website. When a problem arose with a carrier mid-transit -- an insurance question, a compliance concern, a performance complaint -- the team would spend 30+ minutes piecing together information from multiple sources. This screen consolidates everything into a single, always-current view, reducing investigation time from 30 minutes to under 2 minutes and enabling informed decisions about carrier relationships.

**Key business rules:**
- Only users with `carrier_edit` permission can modify carrier information. All others see read-only views.
- Status changes require appropriate permissions and follow the state machine: PENDING -> ACTIVE -> INACTIVE/SUSPENDED/BLACKLISTED with documented reasons for negative transitions.
- Blacklisting a carrier requires a typed reason and a confirmation dialog with the text "I understand this carrier will be permanently blocked."
- FMCSA verification can be triggered on-demand and updates the carrier's compliance data in real-time.
- Insurance certificates that fall below minimum thresholds ($100K cargo, $1M auto liability) are flagged with red warning badges.
- Banking information (routing#, account#) is masked by default (showing last 4 digits only) and requires `finance_view` permission to unmask.
- The carrier's preferred language (English/Spanish) determines the language of all system-generated communications to that carrier.
- Carrier score is recalculated after each completed load and tier is adjusted accordingly.

**Success metric:**
Time to resolve carrier-related inquiries drops from 30 minutes to under 2 minutes. Carrier data accuracy improves to 99%+ through centralized management.

---

## 2. User Journey Context

**Comes from (entry points):**

| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Carriers List | Clicks carrier name in table or card | `carrierId` via route param `/carriers/[id]` |
| Carrier Dashboard | Clicks carrier name in action items, top carriers chart, or activity feed | `carrierId` |
| Compliance Center | Clicks carrier name in compliance issues table | `carrierId`, `?tab=compliance` |
| Insurance Tracking | Clicks carrier name in insurance table | `carrierId`, `?tab=compliance` |
| Load Detail | Clicks assigned carrier name | `carrierId` |
| Dispatch Board | Clicks carrier name on dispatched load | `carrierId` |
| Global Search | Selects carrier from search results | `carrierId` |
| Direct URL | Bookmark / shared link | `carrierId` via route, optional `?tab=` |

**Goes to (exit points):**

| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Carriers List | Clicks "Back to Carriers" breadcrumb or browser back | Current filter state from URL |
| Load Detail | Clicks load number in history table | `loadId` |
| Carrier Onboarding | Clicks "Re-send Carrier Agreement" (opens new agreement flow) | `carrierId` |
| Carrier Scorecard | Clicks "View Full Scorecard" on Performance tab | `carrierId` |
| Another Carrier Detail | Clicks carrier name in "Similar Carriers" suggestions | `otherCarrierId` |
| Compliance Center | Clicks "View in Compliance Center" link | `?carrier={carrierId}` |

**Primary trigger:**
Omar clicks a carrier name from the Carriers List after searching for a carrier to assign to a load. He checks compliance status, insurance validity, and recent performance before making the assignment.

**Success criteria (user completes the screen when):**
- User has reviewed the carrier's profile information and confirmed it is accurate.
- User has verified the carrier's compliance status is acceptable for load assignment.
- User has reviewed recent performance metrics and decided whether to assign/continue using this carrier.
- User has completed any needed updates (edit info, upload documents, change status, add notes).

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------+
|  Breadcrumb: Carriers > Swift Logistics LLC                       |
+------------------------------------------------------------------+
|  Header Section                                                   |
|  +------------------------------------------------------------+  |
|  | [Logo/Avatar]  Swift Logistics LLC                          |  |
|  |                DBA: Swift Logistics                         |  |
|  |                MC-123456 | DOT# 1234567                    |  |
|  |                [ACTIVE badge] [GOLD tier badge]             |  |
|  |                [COMPLIANT compliance badge]                 |  |
|  |                                                             |  |
|  |  Actions: [Edit] [Verify FMCSA] [Change Status v] [Assign] |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
|  Tab Navigation:                                                  |
|  [Profile] [Compliance] [Documents] [Performance] [Contacts]     |
|  [History]                                                        |
+------------------------------------------------------------------+
|  Tab Content Area (varies by active tab)                          |
|  +------------------------------------------------------------+  |
|  |                                                             |  |
|  |  Content for the selected tab                               |  |
|  |  (See tab-specific layouts below)                           |  |
|  |                                                             |  |
|  |                                                             |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
|  Notes Section (always visible below tabs)                        |
|  +------------------------------------------------------------+  |
|  | Internal Notes                              [+ Add Note]    |  |
|  | - "Carrier prefers afternoon pickups" - Omar, 2 days ago   |  |
|  | - "Payment terms renegotiated to NET15" - Fatima, 1 week   |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

### Tab Layouts

**Profile Tab:**
```
+-----------------------------+ +-----------------------------+
| Company Information          | | Service Area                |
| Legal Name: ___              | | [US Map with highlighted    |
| DBA: ___                     | |  service area states]       |
| Address: ___                 | |                             |
| Phone: ___                   | | States: TX, CA, AZ, NM...  |
| Email: ___                   | +-----------------------------+
| Website: ___                 | | Preferred Lanes             |
+-----------------------------+ | TX -> CA (245 loads)        |
| Payment & Banking            | | CA -> AZ (89 loads)        |
| Payment Terms: NET30         | | AZ -> TX (67 loads)        |
| Bank: ****1234 (masked)     | +-----------------------------+
| Factoring: ABC Factoring     |
| Preferred Language: English  |
+-----------------------------+
```

**Compliance Tab:**
```
+-----------------------------+ +-----------------------------+
| Compliance Checklist         | | FMCSA Data                  |
| [x] Auto Liability >=1M    | | Authority: ACTIVE           |
| [x] Cargo Insurance >=100K  | | Safety Rating: SATISFACTORY |
| [x] W-9 on file             | | OOS Rate (Driver): 2.1%     |
| [x] Carrier Agreement       | | OOS Rate (Vehicle): 1.8%    |
| [ ] Workers Comp (optional) | | Last FMCSA Check: 2026-02-01|
+-----------------------------+ | [Verify FMCSA Now]          |
| Compliance Score             | +-----------------------------+
| [======== 92/100 gauge ====] | | Insurance Certificates      |
|                              | | Auto Liability: $1.5M       |
| Overall: COMPLIANT           | |   Expires: 08/15/2026       |
+-----------------------------+ | Cargo: $250K                |
                                | |   Expires: 08/15/2026       |
                                | | [View All Certificates]     |
                                | +-----------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible, header) | Carrier name, legal name, MC#, DOT#, status badge, tier badge, compliance badge, action buttons | Must be visible at all times for context and quick actions |
| **Secondary** (active tab content) | Tab-specific details: profile info, compliance data, documents, performance metrics, contacts, history | Detailed information organized by category |
| **Tertiary** (lower priority within tabs) | Service area map, preferred lanes, banking info (masked), factoring details | Supporting details used occasionally |
| **Hidden** (behind a click/modal) | Full insurance certificate PDF, bank account numbers (unmasked), blacklist confirmation, status change reason modal, side-by-side carrier comparison | Sensitive or deep-detail content accessed only when needed |

---

## 4. Data Fields & Display

### Visible Fields -- Header Section

| # | Field Label | Source (Entity.field) | Format / Display | Location |
|---|---|---|---|---|
| 1 | Carrier Name | Carrier.legalName | Large bold text, 24px | Header top-left |
| 2 | DBA Name | Carrier.dbaName | Gray-500 text below name (if different from legal) | Header below name |
| 3 | MC Number | Carrier.mcNumber | Monospace, "MC-" prefix, copyable | Header, below DBA |
| 4 | DOT Number | Carrier.dotNumber | Monospace, "DOT#" prefix, copyable | Header, next to MC# |
| 5 | Status | Carrier.status | StatusBadge: PENDING/ACTIVE/INACTIVE/SUSPENDED/BLACKLISTED per color system | Header badges row |
| 6 | Tier | Carrier.tier | TierBadge: PLATINUM/GOLD/SILVER/BRONZE/UNQUALIFIED with icons | Header badges row |
| 7 | Compliance Status | Derived (aggregate) | ComplianceBadge per compliance color system | Header badges row |

### Visible Fields -- Profile Tab

| # | Field Label | Source (Entity.field) | Format / Display | Location |
|---|---|---|---|---|
| 8 | Physical Address | Carrier.physicalAddress1 + city + state + zip | Standard address format, multi-line | Company Info section |
| 9 | Mailing Address | Carrier.mailingAddress1 + city + state + zip | Standard address format (if different from physical) | Company Info section |
| 10 | Primary Phone | Carrier.primaryPhone | (XXX) XXX-XXXX, clickable tel: link | Company Info section |
| 11 | Primary Email | Carrier.primaryEmail | Clickable mailto: link | Company Info section |
| 12 | Website | Carrier.website | Clickable external link with ExternalLink icon | Company Info section |
| 13 | Tax ID | Carrier.taxId | Masked: ***-**-1234 (last 4 visible) | Company Info section |
| 14 | Payment Terms | Carrier.paymentTerms | Badge: QUICK_PAY/NET15/NET30 per payment terms color system | Payment section |
| 15 | Bank Info | Carrier.bankName + bankAccountNumber | Bank name + masked account "****1234" | Payment section |
| 16 | Factoring Company | Carrier.factoringCompanyName | Text, or "None" in gray | Payment section |
| 17 | Preferred Language | Carrier.preferredLanguage | "English" or "Spanish" with flag icon | Company Info section |
| 18 | Service Area States | Carrier.serviceAreaStates | US map with highlighted states + comma-separated list | Service Area section |
| 19 | Preferred Lanes | Carrier.preferredLanes | Origin -> Destination pairs with load counts | Preferred Lanes section |
| 20 | Truck Count | Carrier.truckCount | Integer | Company Info section |
| 21 | Trailer Count | Carrier.trailerCount | Integer | Company Info section |
| 22 | Equipment Types | Carrier.equipmentTypes | Equipment type badges with icons | Company Info section |

### Visible Fields -- Compliance Tab

| # | Field Label | Source | Format / Display | Location |
|---|---|---|---|---|
| 23 | Compliance Score | Carrier.complianceScore | Gauge 0-100, color: green >= 85, yellow 70-84, red < 70 | Compliance Score section |
| 24 | Authority Status | Carrier.authorityStatus | Badge: ACTIVE (green), INACTIVE (gray), REVOKED (red) | FMCSA Data section |
| 25 | Safety Rating | Carrier.safetyRating | Text: SATISFACTORY / CONDITIONAL / UNSATISFACTORY with color | FMCSA Data section |
| 26 | OOS Rate (Driver) | Carrier.oosRateDriver | Percentage with color: green < 5%, yellow 5-10%, red > 10% | FMCSA Data section |
| 27 | OOS Rate (Vehicle) | Carrier.oosRateVehicle | Percentage with same coloring as driver OOS | FMCSA Data section |
| 28 | Last FMCSA Check | Carrier.lastFmcsaCheck | Relative date "3 days ago" + absolute date | FMCSA Data section |

### Visible Fields -- Performance Tab

| # | Field Label | Source | Format / Display | Location |
|---|---|---|---|---|
| 29 | Overall Score | Carrier.complianceScore (or derived performance score) | Large number with color indicator | Scorecard section |
| 30 | On-Time Pickup % | Carrier.onTimePickupPct | Percentage, colored: green >= 95%, yellow 85-94%, red < 85% | Scorecard metrics |
| 31 | On-Time Delivery % | Carrier.onTimeDeliveryPct | Percentage, same coloring | Scorecard metrics |
| 32 | Claims Rate | Carrier.claimsRate | Percentage, colored: green < 2%, yellow 2-5%, red > 5% | Scorecard metrics |
| 33 | Acceptance Rate | Carrier.acceptanceRate | Percentage, colored: green >= 80%, yellow 60-79%, red < 60% | Scorecard metrics |
| 34 | Avg Rating | Carrier.avgRating | Stars (1-5) with numeric value | Scorecard metrics |
| 35 | Total Loads | Carrier.totalLoads | Integer | Scorecard metrics |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Aggregate Compliance | Worst of: insurance status, FMCSA status, document status | Badge per compliance color system |
| 2 | Insurance Expiry (earliest required) | MIN(expiryDate) from required insurance types | Date with days remaining |
| 3 | Fleet Average Comparison | Carrier metric - fleet average metric | +/- delta, green if better, red if worse |
| 4 | Performance Trend | Direction of score over last 3 months | Up/down/flat arrow indicator |
| 5 | Days Since Last Load | NOW() - MAX(Load.completedDate WHERE carrierId = :id) | "3 days ago" or "No loads" |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] Header section with carrier name, MC#, DOT#, status, tier, compliance badges
- [ ] Six-tab navigation: Profile, Compliance, Documents, Performance, Contacts, History
- [ ] Profile tab: company info, payment/banking, service area, preferred lanes, equipment types
- [ ] Compliance tab: checklist, FMCSA data panel, insurance certificates table, compliance score gauge
- [ ] Documents tab: all uploaded documents with status, preview/download, upload new
- [ ] Performance tab: scorecard metrics, performance trend chart (6 months), load history table
- [ ] Contacts tab: list of carrier contacts with roles, communication preferences
- [ ] History tab: load history table, activity log (status changes, uploads, updates)
- [ ] Edit carrier information (inline or modal editing)
- [ ] Change carrier status with reason field
- [ ] On-demand FMCSA verification button
- [ ] Internal notes section

### Advanced Features (Logistics Expert Recommendations)

- [ ] Side-by-side comparison with another carrier -- opens split view to compare two carriers' metrics
- [ ] "Similar Carriers" suggestions -- carriers with matching equipment types and overlapping service areas
- [ ] Carrier agreement re-send -- one-click to regenerate and email carrier agreement for e-signature
- [ ] Blacklist with mandatory reason -- confirmation dialog requiring typed justification
- [ ] One-click to see all loads for this carrier -- quick link to Load History filtered by carrier
- [ ] FMCSA data auto-refresh button with loading spinner and last-check timestamp
- [ ] Insurance certificate verification -- "Mark as Verified" button with verifier name and timestamp
- [ ] Performance comparison to fleet average -- show delta for each metric vs. all-carrier average
- [ ] Preferred lanes visualization -- interactive map showing lane routes with load volume
- [ ] Document expiration alerts -- inline warnings for expiring documents on the Documents tab
- [ ] Carrier activity timeline -- visual timeline showing all carrier events chronologically
- [ ] Quick-assign to load -- "Assign to Load" button opens load selector modal

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| Edit carrier info | ops_manager, carrier_admin, admin | carrier_edit | All fields read-only, Edit button hidden |
| Change status | carrier_admin, admin | carrier_status_update | "Change Status" button hidden |
| Blacklist carrier | admin | carrier_blacklist | Blacklist option hidden from status dropdown |
| View banking info (unmasked) | admin, finance | finance_view | Banking fields show masked "****1234" |
| Upload documents | ops_manager, carrier_admin, admin | carrier_document_upload | Upload button hidden |
| Approve/reject documents | carrier_admin, admin | carrier_document_review | Approve/Reject buttons hidden |
| Verify FMCSA | ops_manager, carrier_admin, admin | compliance_manage | Verify button hidden |
| Mark insurance as verified | carrier_admin, admin | compliance_manage | Verify checkbox hidden |
| Add/edit notes | dispatcher, ops_manager, admin | carrier_note | Add Note button hidden |
| Delete carrier | admin | carrier_delete | Delete option not shown anywhere |
| Assign to load | dispatcher, ops_manager | load_dispatch | "Assign to Load" button hidden |

---

## 6. Status & State Machine

### Carrier Status Transitions

```
[PENDING] ---(Approve: compliance check pass)---> [ACTIVE]
[PENDING] ---(Reject: compliance check fail)----> [INACTIVE]

[ACTIVE] ---(Deactivate: manual)---> [INACTIVE]
[ACTIVE] ---(Suspend: manual or auto)---> [SUSPENDED]
    Auto-triggers: expired insurance, FMCSA out-of-service, authority revoked
[ACTIVE] ---(Blacklist: admin only)---> [BLACKLISTED]

[INACTIVE] ---(Reactivate: compliance check pass)---> [ACTIVE]
[INACTIVE] ---(Blacklist: admin only)---> [BLACKLISTED]

[SUSPENDED] ---(Reinstate: compliance issue resolved)---> [ACTIVE]
[SUSPENDED] ---(Blacklist: admin only)---> [BLACKLISTED]

[BLACKLISTED] ---(Admin Override: documented reason)---> [ACTIVE]
    Requires: admin role + written justification + confirmation
```

### Actions Available Per Status

| Status | Header Actions Available | Restricted Actions |
|---|---|---|
| PENDING | View, Edit, Approve, Reject, Verify FMCSA | Assign to Load, Suspend, Blacklist |
| ACTIVE | View, Edit, Verify FMCSA, Assign to Load, Deactivate, Suspend, Blacklist | Approve (already active) |
| INACTIVE | View, Edit, Reactivate, Blacklist | Assign to Load, Verify FMCSA, Suspend |
| SUSPENDED | View, Edit, Reinstate, Blacklist, Verify FMCSA | Assign to Load, Deactivate |
| BLACKLISTED | View, Admin Override Reactivate | All other modification actions |

### Status Badge Colors

| Status | Background | Text | Icon | Tailwind |
|---|---|---|---|---|
| PENDING | #F3F4F6 | #374151 | Clock | `bg-gray-100 text-gray-700` |
| ACTIVE | #D1FAE5 | #065F46 | CircleCheckBig | `bg-emerald-100 text-emerald-800` |
| INACTIVE | #F1F5F9 | #334155 | CircleOff | `bg-slate-100 text-slate-700` |
| SUSPENDED | #FEF3C7 | #92400E | ShieldAlert | `bg-amber-100 text-amber-800` |
| BLACKLISTED | #FEE2E2 | #991B1B | ShieldX | `bg-red-100 text-red-800` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Header Section)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| Edit | Pencil | Secondary / Outline | Enters edit mode (inline editing or modal) | No |
| Verify FMCSA | ShieldCheck | Secondary / Outline | Triggers real-time FMCSA SAFER API lookup | No (shows loading, then result) |
| Change Status | ArrowRightLeft (ChevronDown) | Secondary / Outline | Opens dropdown with available status transitions | Yes (for Suspend/Blacklist -- reason required) |
| Assign to Load | Truck | Primary / Blue | Opens load selector modal to assign this carrier | No (but validates compliance first) |

### Secondary Actions (Header "More" Menu)

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| Mark as Preferred | Star | Toggle isPreferred flag | carrier_edit permission |
| Re-send Carrier Agreement | FileSignature | Generates and emails new carrier agreement | carrier_admin, ACTIVE or PENDING status |
| Compare with Carrier | GitCompare | Opens carrier comparison modal (select second carrier) | Always available |
| View All Loads | History | Navigates to Load History filtered by this carrier | Always available |
| Print Carrier Profile | Printer | Opens print dialog with formatted carrier profile | Always available |
| Delete Carrier | Trash2 | Soft delete with confirmation | admin only, no associated loads |

### Tab-Specific Actions

**Documents Tab:**
| Action | Description | Permission |
|---|---|---|
| Upload Document | Opens file upload dialog (drag-drop or browse) | carrier_document_upload |
| Preview Document | Opens inline PDF/image viewer | carrier_view |
| Download Document | Downloads original file | carrier_view |
| Approve Document | Changes document status to APPROVED | carrier_document_review |
| Reject Document | Changes document status to REJECTED (reason required) | carrier_document_review |

**Compliance Tab:**
| Action | Description | Permission |
|---|---|---|
| Verify FMCSA Now | Triggers real-time FMCSA check | compliance_manage |
| Mark Insurance Verified | Stamps certificate as verified with user + timestamp | compliance_manage |
| Request Updated Certificate | Sends email to carrier requesting new insurance cert | carrier_communicate |

**Contacts Tab:**
| Action | Description | Permission |
|---|---|---|
| Add Contact | Opens add contact form | carrier_edit |
| Edit Contact | Inline edit or modal | carrier_edit |
| Delete Contact | Remove contact (confirm) | carrier_edit |
| Send Email | Opens email compose to contact | carrier_communicate |
| Call | Initiates tel: link | Always available |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + E | Toggle edit mode |
| Ctrl/Cmd + S | Save changes (when in edit mode) |
| Escape | Cancel edit mode / close modal |
| 1-6 | Switch to tab 1-6 (Profile through History) |
| Ctrl/Cmd + K | Open global search |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| Document file (from desktop) | Documents tab upload area | Upload document with type selection dialog |
| Insurance certificate PDF | Compliance tab insurance section | Upload and auto-classify as insurance certificate |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| carrier.updated | { carrierId, changedFields, updatedBy } | Update displayed fields in real-time, flash changed values |
| carrier.statusChanged | { carrierId, oldStatus, newStatus, updatedBy, reason } | Update status badge in header, show toast, disable/enable actions per new status |
| carrier.complianceChanged | { carrierId, oldCompliance, newCompliance, trigger } | Update compliance badge, refresh Compliance tab if active |
| carrier.tierChanged | { carrierId, oldTier, newTier } | Update tier badge, show toast |
| insurance.expiring | { carrierId, insuranceType, daysRemaining } | Update compliance tab, show warning banner |
| insurance.expired | { carrierId, insuranceType } | Update compliance tab, show alert banner, may trigger auto-suspend |
| insurance.renewed | { carrierId, insuranceType, newExpiryDate } | Update compliance tab, clear warning |
| document.uploaded | { carrierId, documentType, uploadedBy } | Refresh Documents tab if active |
| document.statusChanged | { carrierId, documentId, oldStatus, newStatus } | Update document row in Documents tab |
| load.completedForCarrier | { carrierId, loadId } | Refresh Performance tab metrics if active, update History tab |
| carrier.fmcsaCheckComplete | { carrierId, result } | Update FMCSA data panel on Compliance tab |
| carrier.noteAdded | { carrierId, noteId, author, preview } | Add note to notes section |

### Live Update Behavior

- **Update frequency:** WebSocket push for all carrier-specific changes on the `carriers:{carrierId}` channel.
- **Visual indicator:** Changed field values flash with a blue highlight for 2 seconds. Status badge changes animate (old badge fades out, new badge fades in).
- **Conflict handling:** If user is editing a field that changes remotely, show inline banner: "This carrier was updated by [name]. Save your changes or refresh to see updates."

### Polling Fallback

- **When:** WebSocket connection drops
- **Interval:** Every 30 seconds for the active tab's data
- **Endpoint:** `GET /api/carriers/:id?updatedSince={lastPollTimestamp}`
- **Visual indicator:** Show "Live updates paused" indicator in header area

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Edit field | Immediately show updated value | Revert to previous value, show error toast |
| Change status | Immediately update status badge and action buttons | Revert badge and actions, show error toast |
| Toggle preferred | Immediately toggle star icon | Revert, show error toast |
| Add note | Immediately append note to list | Remove note, show error toast |
| Upload document | Immediately show document in list with "Uploading..." indicator | Remove document row, show error toast |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| PageHeader | `src/components/layout/page-header.tsx` | title: carrier name, breadcrumbs, actions |
| StatusBadge | `src/components/ui/status-badge.tsx` | status, entity: CARRIER_STATUS |
| Tabs | `src/components/ui/tabs.tsx` | 6 tabs: Profile, Compliance, Documents, Performance, Contacts, History |
| DataTable | `src/components/ui/data-table.tsx` | Insurance certs table, load history table, contacts table |
| Card | `src/components/ui/card.tsx` | Section containers within tabs |
| Button | `src/components/ui/button.tsx` | All action buttons |
| Badge | `src/components/ui/badge.tsx` | Tier, compliance, payment terms badges |
| Dialog | `src/components/ui/dialog.tsx` | Status change, blacklist confirmation, comparison modal |
| DropdownMenu | `src/components/ui/dropdown-menu.tsx` | "More" menu, status change dropdown |
| Input / Textarea | `src/components/ui/input.tsx` | Edit mode form fields |
| FileUpload | `src/components/ui/file-upload.tsx` | Document upload area |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| Tabs | Basic horizontal tabs | Add icon per tab, badge count per tab (e.g., "Documents (7)"), URL hash sync |
| FileUpload | Basic file selection | Add drag-and-drop zone, auto-classify document type, progress indicator |
| DataTable | Basic table | Add inline edit support, row expand for preview, file download action |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| CarrierHeader | Composite header: avatar/logo, name, MC/DOT, status+tier+compliance badges, action buttons | Medium |
| ComplianceChecklist | Checklist of compliance items with pass/fail/missing indicators per item | Medium |
| FMCSADataPanel | Panel showing authority status, safety rating, OOS rates with color indicators and "Verify Now" button | Medium |
| ComplianceScoreGauge | Circular gauge showing score 0-100 with color gradient (green/yellow/red) | Medium |
| InsuranceCertificateRow | Table row for insurance cert: type, policy#, provider, coverage, dates, verified badge, actions | Small |
| PerformanceScorecard | Grid of performance metric cards: on-time%, claims rate, acceptance rate, rating, with fleet comparison | Medium |
| PerformanceTrendChart | Line chart showing 6-month trend for key metrics | Medium |
| ContactCard | Contact info card with name, title, email, phone, role badge, communication preference flags | Small |
| ActivityTimeline | Vertical timeline showing chronological carrier events with icons and descriptions | Medium |
| NotesList | Scrollable notes section with add note form, author attribution, timestamps | Small |
| ServiceAreaMap | Interactive US map highlighting selected service states | High |
| LaneVisualization | Lane pairs display: origin -> destination with load volume bars | Medium |
| CarrierComparison | Split-screen comparison of two carrier profiles with highlighted differences | High |
| SimilarCarriersSuggestion | Card row showing 3-5 carriers with matching equipment+lanes, click to navigate | Medium |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Tabs | tabs | Six-tab carrier detail layout |
| Separator | separator | Section dividers within tabs |
| Accordion | accordion | Collapsible sections on mobile |
| Progress | progress | Compliance score progress bar |
| Tooltip | tooltip | Masked field explanations, metric definitions |
| ScrollArea | scroll-area | Long content areas (notes, history) |
| AlertDialog | alert-dialog | Blacklist confirmation, delete confirmation |
| Sheet | sheet | Quick-view panels for documents, load details |
| Avatar | avatar | Carrier logo/avatar in header |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/carriers/:id | Fetch full carrier profile | useCarrier(id) |
| 2 | PATCH | /api/carriers/:id | Update carrier fields | useUpdateCarrier() |
| 3 | PATCH | /api/carriers/:id/status | Change carrier status | useUpdateCarrierStatus() |
| 4 | GET | /api/carriers/:id/contacts | List carrier contacts | useCarrierContacts(id) |
| 5 | POST | /api/carriers/:id/contacts | Add carrier contact | useAddCarrierContact() |
| 6 | PATCH | /api/carriers/:id/contacts/:contactId | Update carrier contact | useUpdateCarrierContact() |
| 7 | DELETE | /api/carriers/:id/contacts/:contactId | Delete carrier contact | useDeleteCarrierContact() |
| 8 | GET | /api/carriers/:id/insurance | List insurance certificates | useCarrierInsurance(id) |
| 9 | POST | /api/carriers/:id/insurance | Upload insurance certificate | useUploadInsurance() |
| 10 | PATCH | /api/carriers/:id/insurance/:certId/verify | Mark certificate as verified | useVerifyInsurance() |
| 11 | GET | /api/carriers/:id/documents | List carrier documents | useCarrierDocuments(id) |
| 12 | POST | /api/carriers/:id/documents | Upload document | useUploadDocument() |
| 13 | PATCH | /api/carriers/:id/documents/:docId/status | Approve/reject document | useUpdateDocumentStatus() |
| 14 | GET | /api/carriers/:id/performance | Get performance metrics + history | useCarrierPerformance(id) |
| 15 | GET | /api/carriers/:id/loads | Get load history for carrier | useCarrierLoads(id, pagination) |
| 16 | GET | /api/carriers/:id/activity | Get activity log | useCarrierActivity(id) |
| 17 | POST | /api/carriers/:id/notes | Add internal note | useAddCarrierNote() |
| 18 | GET | /api/carriers/:id/notes | Get internal notes | useCarrierNotes(id) |
| 19 | POST | /api/carriers/fmcsa/verify/:id | Trigger FMCSA verification | useFmcsaVerify(id) |
| 20 | GET | /api/carriers/:id/similar | Get similar carrier suggestions | useSimilarCarriers(id) |
| 21 | PATCH | /api/carriers/:id/preferred | Toggle preferred flag | useTogglePreferred() |
| 22 | POST | /api/carriers/:id/agreement/resend | Re-send carrier agreement | useResendAgreement() |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| carriers:{carrierId} | carrier.updated | useCarrierDetailUpdates(id) -- updates cached carrier data |
| carriers:{carrierId} | carrier.statusChanged | useCarrierDetailUpdates(id) -- updates status, recalculates available actions |
| carriers:{carrierId} | carrier.complianceChanged | useCarrierDetailUpdates(id) -- updates compliance badge and tab |
| carriers:{carrierId} | insurance.* | useCarrierInsuranceUpdates(id) -- invalidates insurance query |
| carriers:{carrierId} | document.* | useCarrierDocumentUpdates(id) -- invalidates documents query |
| carriers:{carrierId} | carrier.noteAdded | useCarrierNotesUpdates(id) -- appends note to notes list |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 500 |
|---|---|---|---|---|---|
| GET /api/carriers/:id | N/A | Redirect to login | "Access Denied" page | "Carrier not found" page with back link | Error state with retry |
| PATCH /api/carriers/:id | "Validation error" toast with field details | Redirect to login | "Permission Denied" toast | "Carrier not found" toast | Error toast with retry |
| PATCH /api/carriers/:id/status | "Invalid status transition" toast | Redirect to login | "Permission Denied" toast | "Carrier not found" toast | Error toast with retry |
| POST /api/carriers/fmcsa/verify/:id | "Invalid carrier" toast | Redirect to login | "Permission Denied" toast | "Carrier not found" toast | "FMCSA service unavailable" toast |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Show header section skeleton (avatar, name bar, badge placeholders). Show tab navigation immediately. Active tab content shows section-specific skeletons (form field placeholders for Profile, table skeleton for Documents, etc.).
- **Progressive loading:** Header data loads first (from cached list query). Tab content loads on tab selection (lazy load). Notes section loads independently.
- **Duration threshold:** If loading exceeds 5s, show "Loading carrier details..." message.

### Empty States

**Documents tab empty:**
- **Headline:** "No documents uploaded"
- **Description:** "Upload carrier documents like W-9, carrier agreement, and insurance certificates."
- **CTA:** "Upload Document" button

**Performance tab empty (new carrier with no loads):**
- **Headline:** "No performance data yet"
- **Description:** "Performance metrics will appear after this carrier completes their first load."
- **Display:** Show scorecard with "N/A" values and grayed-out chart area

**Contacts tab empty:**
- **Headline:** "No contacts added"
- **Description:** "Add dispatch, primary, and after-hours contacts for this carrier."
- **CTA:** "Add Contact" button

**History tab empty:**
- **Headline:** "No load history"
- **Description:** "Load history will appear once this carrier has been assigned to loads."

**Notes section empty:**
- **Display:** "No internal notes. Add a note to track important information about this carrier."
- **CTA:** "Add First Note" text button

### Error States

**Full page error (carrier fetch fails):**
- **Display:** Error icon + "Unable to load carrier details" + Retry button + "Back to Carriers List" link

**Tab content error (specific tab data fails):**
- **Display:** Tab header remains. Content area shows: "Could not load [tab name] data" with Retry link. Other tabs remain functional.

**FMCSA Verify error:**
- **Display:** Toast: "FMCSA verification failed for [carrier name]. The FMCSA SAFER system may be temporarily unavailable." + Retry in 5 minutes suggestion.

**Status change error:**
- **Display:** Toast: "Failed to change status to [new status]. [Error detail]." Status reverts to previous value.

### Permission Denied

- **Full page denied:** "You don't have permission to view this carrier" with back link
- **Tab-level denied:** If user lacks permission for a specific tab's actions, show data as read-only with tooltip explaining needed permission
- **Field-level denied:** Banking info masked for non-finance users. Edit button hidden for non-editors.

### Offline / Degraded

- **Full offline:** Banner: "You're offline. Showing cached carrier data. Changes cannot be saved until reconnected."
- **Degraded:** "Live updates paused" indicator. Edit actions show warning: "Changes will be saved when connection is restored."

---

## 12. Filters, Search & Sort

### Filters (within tabs)

**Performance Tab - Load History:**

| # | Filter Label | Type | Options | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Date Range | Date range picker | Last 30d, 90d, 6 months, 1 year, Custom | Last 6 months | `?historyRange=6m` |
| 2 | Load Status | Multi-select | COMPLETED, CANCELLED, IN_TRANSIT | All | `?loadStatus=` |

**Documents Tab:**

| # | Filter Label | Type | Options | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Document Type | Select | W-9, Carrier Agreement, Insurance Certificate, Authority Letter, Void Check, Other | All | `?docType=` |
| 2 | Document Status | Select | PENDING, APPROVED, REJECTED, EXPIRED | All | `?docStatus=` |

**History Tab - Activity Log:**

| # | Filter Label | Type | Options | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Activity Type | Multi-select | Status Change, Document Upload, Compliance Update, Note Added, Load Completed | All | `?activityType=` |
| 2 | Date Range | Date range picker | Last 7d, 30d, 90d, Custom | Last 30 days | `?activityRange=30d` |

### Search Behavior

No primary search on the detail page. Content is tab-navigated. The History tab load history table supports search by load number.

### Sort Options

**Contacts Tab:**
| Field | Default Direction | Sort Type |
|---|---|---|
| Role | Custom (Primary first, then Dispatch, After-Hours, Billing) | Custom enum |
| Name | Ascending | Alphabetic |

**Documents Tab:**
| Field | Default Direction | Sort Type |
|---|---|---|
| Upload Date | Descending (newest first) | Date |
| Document Type | Ascending | Alphabetic |
| Status | Custom (Pending first, then Expired, Rejected, Approved) | Custom enum |

**History Tab - Loads:**
| Field | Default Direction | Sort Type |
|---|---|---|
| Completion Date | Descending (most recent first) | Date |

### Saved Filters / Presets

N/A -- Detail page does not support saved filter presets. Tab selection is synced via URL hash (`#compliance`, `#documents`, etc.).

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Header: Stack carrier info vertically -- name/MC/DOT on one line, badges on next, actions below
- Tabs: Horizontal scrollable tab bar if all 6 tabs don't fit
- Tab content: 2-column layouts collapse to single column
- Service area map: smaller but still visible
- Document table: hide some columns (show type, status, date, actions)

### Mobile (< 768px)

- Header: Compact -- carrier name, key badges. Action buttons in "..." overflow menu or bottom sheet
- Tabs: Replace with dropdown selector or scrollable pill tabs
- All tab content: Single column, full width
- Tables: Switch to card-based layouts
- Service area map: Replace with state list (no map)
- Document preview: Full-screen overlay
- Notes: Collapsible section
- Edit mode: Full-screen form overlay instead of inline editing
- "Assign to Load" in sticky bottom action bar
- Swipe between tabs

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full 2-column tab layouts, inline editing, side panels |
| Desktop | 1024px - 1439px | 2-column tab layouts, modals instead of side panels |
| Tablet | 768px - 1023px | 1-column tab layouts, scrollable tab bar |
| Mobile | < 768px | Card layouts, dropdown tab selector, bottom sheet actions |

---

## 14. Stitch Prompt

```
Design a comprehensive carrier detail page for a modern freight/logistics TMS (Transportation Management System) called "Ultra TMS."

Layout: Full-width page with a dark slate-900 sidebar on the left (240px wide, collapsed to icons), white content area. Top of content area has a breadcrumb "Carriers > Swift Logistics LLC".

Header Section: A prominent header card with:
- Left side: Large carrier avatar/initials circle (blue-600 bg, white text "SL"), next to it:
  - "Swift Logistics LLC" in bold 24px text
  - "DBA: Swift Logistics" in gray-500 14px
  - "MC-123456 | DOT# 1234567" in monospace gray-600 with small copy icons
  - Three badges in a row: green "Active" badge with checkmark icon, amber "Gold" badge with award icon, green "Compliant" badge with shield-check icon
- Right side: Four action buttons:
  - "Edit" secondary outline button with pencil icon
  - "Verify FMCSA" secondary outline button with shield-check icon
  - "Change Status" secondary outline dropdown button with arrow icon
  - "Assign to Load" primary blue button with truck icon

Tab Navigation: Below the header, a horizontal tab bar with 6 tabs:
[Profile] [Compliance] [Documents (7)] [Performance] [Contacts (4)] [History]
The "Compliance" tab is currently active and highlighted with blue-600 underline.

Compliance Tab Content (active): Two-column layout:
- Left column:
  - "Compliance Checklist" card showing:
    - Green check: "Auto Liability Insurance >= $1,000,000" - PASS
    - Green check: "Cargo Insurance >= $100,000" - PASS
    - Green check: "W-9 on file" - PASS
    - Green check: "Carrier Agreement signed" - PASS
    - Gray dash: "Workers Compensation" - OPTIONAL
  - "Compliance Score" card showing a circular gauge at 92/100 in green with label "COMPLIANT"

- Right column:
  - "FMCSA Data" card showing:
    - "Authority Status: ACTIVE" with green badge
    - "Safety Rating: SATISFACTORY" with green text
    - "OOS Rate (Driver): 2.1%" with green text
    - "OOS Rate (Vehicle): 1.8%" with green text
    - "Last Checked: Feb 1, 2026 (5 days ago)"
    - Blue outline button "Verify FMCSA Now"
  - "Insurance Certificates" card with mini-table:
    - Row 1: "Auto Liability" | Policy: AL-2025-001 | $1,500,000 | Exp: 08/15/2026 | Green "Verified" badge
    - Row 2: "Cargo" | Policy: CG-2025-001 | $250,000 | Exp: 08/15/2026 | Green "Verified" badge
    - Row 3: "General Liability" | Policy: GL-2025-001 | $500,000 | Exp: 06/30/2026 | Amber "Unverified" badge
    - "View All Certificates" link

Below tabs: "Internal Notes" section with gray-50 background:
- "Carrier prefers afternoon pickups for Dallas loads" - by Omar, 2 days ago
- "Payment terms renegotiated from NET30 to NET15" - by Fatima, 1 week ago
- Blue "+ Add Note" button

Design Specifications:
- Font: Inter or system sans-serif, 14px base, 24px for carrier name
- Sidebar: slate-900 background, white text, blue-600 active indicator
- Content background: gray-50 for page, white for cards
- Primary color: blue-600 for buttons and links
- Cards: white background, rounded-lg border, shadow-sm
- Tab bar: gray-200 bottom border, active tab has blue-600 bottom border (2px)
- Compliance checklist: green checkmarks with emerald-500, gray dashes for optional
- Gauge: circular SVG with green fill (emerald-500) and gray track
- FMCSA data: clean key-value pairs with colored status indicators
- Insurance table: compact with status badges
- Notes section: gray-50 background, each note as a small card with avatar, text, and relative time
- Modern SaaS aesthetic similar to Linear.app or Notion

Include: hover states on all interactive elements, the header should feel like a prominent "hero" section for the carrier, tabs should clearly indicate which is active, and the overall feel should convey trust and professionalism for a compliance-heavy workflow.
```

---

## 15. Enhancement Opportunities

### Current State (Wave 3)

**What's built and working:**
- [ ] Nothing -- carrier detail page is not started (route exists but no page.tsx)

**What needs polish / bug fixes:**
- N/A (not built yet)

**What to add this wave:**
- [ ] Header section with carrier name, MC#, DOT#, status, tier, compliance badges
- [ ] 6-tab navigation with URL hash sync
- [ ] Profile tab with company info, payment, service area, lanes, equipment
- [ ] Compliance tab with checklist, FMCSA panel, insurance certs, score gauge
- [ ] Documents tab with upload, preview, approve/reject
- [ ] Performance tab with scorecard, trend chart, load history
- [ ] Contacts tab with CRUD operations
- [ ] History tab with activity timeline
- [ ] Edit mode for carrier information
- [ ] Status change with reason
- [ ] FMCSA on-demand verification
- [ ] Internal notes section
- [ ] Insurance certificate verification

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Header + status/tier/compliance badges | High | Medium | P0 |
| Compliance tab (checklist + FMCSA + insurance) | High | High | P0 |
| Profile tab (company info + payment) | High | Medium | P0 |
| Documents tab (upload + preview) | High | Medium | P0 |
| Edit mode | High | Medium | P0 |
| Status change functionality | High | Medium | P0 |
| Performance tab (scorecard) | Medium | Medium | P1 |
| Contacts tab (CRUD) | Medium | Medium | P1 |
| History tab (activity log + loads) | Medium | Medium | P1 |
| Internal notes | Medium | Low | P1 |
| FMCSA verification button | Medium | Medium | P1 |
| Side-by-side comparison | Low | High | P2 |
| Similar carriers suggestions | Low | Medium | P2 |
| Service area interactive map | Low | High | P2 |
| Lane visualization | Low | Medium | P2 |

### Future Wave Preview

- **Wave 4:** Add carrier portal integration (show carrier's self-service profile sync status), embedded communication log (emails/SMS exchanged with this carrier), contract management tab.
- **Wave 5:** AI-driven carrier risk assessment, predictive insurance lapse alerts, automated tier promotion/demotion recommendations, carrier financial health indicators.

---

_Last Updated: 2026-02-06_
