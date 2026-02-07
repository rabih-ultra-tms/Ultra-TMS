# Insurance Tracking

> Service: 05 - Carrier Management | Wave: 3 | Priority: P1
> Route: /(dashboard)/carriers/insurance | Status: Not Started
> Primary Personas: Sarah (Ops Manager), Admin
> Roles with Access: ops_manager, carrier_admin, compliance_officer, admin

---

## 1. Purpose & Business Context

**What this screen does:**
The Insurance Tracking screen is a comprehensive certificate management interface that allows the compliance team to view, filter, verify, and manage all insurance certificates across every carrier in the system. It presents a master table of all insurance policies with status indicators, coverage amounts, expiration dates, and verification workflows. When a row is clicked, a detail panel opens showing the full certificate information, a PDF preview, and verification controls. This screen is the operational tool for day-to-day insurance certificate management.

**Business problem it solves:**
Freight brokerages must ensure every active carrier has valid insurance certificates meeting minimum coverage thresholds before dispatching any loads. Managing hundreds of insurance certificates across a growing carrier fleet using spreadsheets or email folders leads to missed expirations, unverified certificates, and carriers operating with insufficient coverage. When a load is damaged and the carrier's insurance is expired, the brokerage bears the full financial liability. This screen provides the tools to eliminate these gaps by centralizing all insurance certificates with automated tracking, verification workflows, and proactive expiration management.

**Key business rules:**
- Every active carrier must have valid Auto Liability (minimum $1,000,000) and Cargo (minimum $100,000) insurance.
- Certificates are classified by type: AUTO_LIABILITY, CARGO, GENERAL_LIABILITY, WORKERS_COMP.
- Certificate status is automatically calculated: ACTIVE (expiry > 30 days from now), EXPIRING_SOON (expiry within 30 days), EXPIRED (past expiry date), CANCELLED (manually cancelled).
- "Verified" means a compliance team member has manually reviewed the uploaded certificate and confirmed it matches the entered data. Verification stamps the certificate with the verifier's name and timestamp.
- "Request Updated Certificate" sends a templated email to the carrier's primary contact or the contact flagged for `receivesRateConfirms` (which also handles insurance requests).
- Carriers missing required coverage types are flagged in the coverage gap analysis.
- Insurance cost tracking is optional and applies when the broker pays for carrier insurance (e.g., non-trucking liability or occupational accident).

**Success metric:**
100% of active carriers have verified, valid insurance certificates on file. Zero loads dispatched to carriers with expired required insurance. Insurance verification turnaround time under 24 hours from upload.

---

## 2. User Journey Context

**Comes from (entry points):**

| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Sidebar Navigation | Clicks "Carriers" > "Insurance" in sidebar | None |
| Compliance Center | Clicks insurance-related issue or "View All Insurance" | `?status=expiring` or `?carrier={carrierId}` |
| Carrier Dashboard | Clicks "Expiring Insurance" KPI card | `?status=expiring` |
| Carrier Detail | Clicks "View All Certificates" on Compliance tab | `?carrier={carrierId}` |
| Notification Center | Clicks insurance expiration notification | `?carrier={carrierId}&type=AUTO_LIABILITY` |
| Direct URL | Bookmark / shared link | Route params + query params |

**Goes to (exit points):**

| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Carrier Detail | Clicks carrier name in table or detail panel | `carrierId`, `?tab=compliance` |
| Compliance Center | Clicks "Back to Compliance" or breadcrumb | None |

**Primary trigger:**
Sarah receives a daily digest email listing carriers with insurance certificates expiring in the next 30 days. She opens the Insurance Tracking screen filtered to expiring certificates, reviews each one, sends renewal requests to carriers, and verifies newly uploaded certificates.

**Success criteria (user completes the screen when):**
- User has reviewed all certificates with upcoming expirations.
- User has verified newly uploaded certificates.
- User has sent renewal requests to carriers with expiring certificates.
- User has identified and addressed any coverage gaps (carriers missing required insurance types).

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------+
|  Breadcrumb: Carriers > Insurance Tracking                        |
|  Page Title: Insurance Tracking      [Batch Verify] [Export v]   |
+------------------------------------------------------------------+
|  Filter Bar:                                                      |
|  [Search carrier/policy#...] [Insurance Type v] [Status v]       |
|  [Carrier v] [Date Range: Expiring Between ___  and ___ ]       |
|  [Min Coverage $___]   [Clear Filters]                            |
+------------------------------------------------------------------+
|  +------------------------------------------------------------+  |
|  | Insurance Certificates Table                                 |  |
|  | Carrier | Type | Policy# | Provider | Coverage | Eff Date  |  |
|  | Exp Date| Days Left | Verified | Doc | Actions              |  |
|  |---------|------|---------|----------|----------|------------|  |
|  | Swift   | Auto | AL-001  | Progr    | $1.5M    | 01/15/26  |  |
|  | Logist  | Liab |         |          |          | 01/15/27  |  |
|  |         |      |         |          |          | 343d (grn)|  |
|  |---------|------|---------|----------|----------|------------|  |
|  | ABC     | Auto | AL-002  | Natl     | $1.0M    | 06/01/25  |  |
|  | Truck   | Liab |         | Inter    |          | 03/01/26  |  |
|  |         |      |         |          |          | 23d (amb) |  |
|  +------------------------------------------------------------+  |
|  Showing 1-25 of 687 certificates   [< 1 2 3 ... 28 >]          |
+------------------------------------------------------------------+

--- Detail Panel (opens on row click, right side panel) ---
+------------------------------------------------------------------+
|  Master Table (left, ~55%)  |  Detail Panel (right, ~45%)        |
|  [Table as above]           |  +------------------------------+  |
|                             |  | Certificate Details           |  |
|                             |  | Carrier: ABC Trucking [link] |  |
|                             |  | Type: Auto Liability          |  |
|                             |  | Policy#: AL-2025-002         |  |
|                             |  | Provider: National Interstate|  |
|                             |  | Coverage: $1,000,000         |  |
|                             |  | Effective: 06/01/2025        |  |
|                             |  | Expires: 03/01/2026          |  |
|                             |  | Days Remaining: 23           |  |
|                             |  |                              |  |
|                             |  | Document Preview:            |  |
|                             |  | [PDF Viewer - inline]        |  |
|                             |  |                              |  |
|                             |  | Verification:                |  |
|                             |  | Status: Unverified           |  |
|                             |  | [Verify Certificate] btn     |  |
|                             |  |                              |  |
|                             |  | Actions:                     |  |
|                             |  | [Request Updated Cert] btn   |  |
|                             |  | [View Carrier Profile] link  |  |
|                             |  +------------------------------+  |
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible) | Carrier name, insurance type, expiry date, days remaining (color-coded), verified status | Must see at-a-glance which certificates need attention |
| **Secondary** (visible in table) | Policy number, provider, coverage amount, effective date, document link | Supporting detail for certificate identification |
| **Tertiary** (in detail panel) | Full certificate details, PDF preview, verification controls, action buttons | Accessed when investigating or processing a specific certificate |
| **Hidden** (behind actions) | Email composition for certificate request, carrier full profile, batch verification results | Deeper workflow actions accessed less frequently |

---

## 4. Data Fields & Display

### Visible Fields -- Insurance Table

| # | Field Label | Source (Entity.field) | Format / Display | Location |
|---|---|---|---|---|
| 1 | Carrier Name | Carrier.legalName (via InsuranceCertificates.carrierId) | Blue clickable link. Shows DBA if different in smaller gray text. | Table column 1 |
| 2 | Insurance Type | InsuranceCertificates.insuranceType | Badge with icon: AUTO_LIABILITY (blue ShieldCheck), CARGO (cyan Package), GENERAL_LIABILITY (indigo Shield), WORKERS_COMP (amber HardHat) | Table column 2 |
| 3 | Policy # | InsuranceCertificates.policyNumber | Monospace text | Table column 3 |
| 4 | Provider | InsuranceCertificates.provider | Text | Table column 4 |
| 5 | Coverage Amount | InsuranceCertificates.coverageAmount | Currency format $X,XXX,XXX. Color: green if meets minimum, red if below minimum for required types. | Table column 5 |
| 6 | Effective Date | InsuranceCertificates.effectiveDate | MM/DD/YYYY | Table column 6 |
| 7 | Expiry Date | InsuranceCertificates.expiryDate | MM/DD/YYYY | Table column 7 |
| 8 | Days Remaining | DATEDIFF(InsuranceCertificates.expiryDate, NOW()) | Integer with color: green (>30d), amber (14-30d), orange (7-14d), red (<7d or expired, shows "-Nd"). | Table column 8 |
| 9 | Verified | InsuranceCertificates.verified | Badge: green "Verified" with check icon, or gray "Unverified" | Table column 9 |
| 10 | Document | InsuranceCertificates.certificateUrl | Small PDF icon link. If no document uploaded: gray "No doc" text. | Table column 10 |
| 11 | Actions | N/A | Row actions: "View", "Verify", "Request Update" | Table column 11 |

### Visible Fields -- Detail Panel

| # | Field Label | Source | Format / Display | Location |
|---|---|---|---|---|
| 12 | Carrier Name (linked) | Carrier.legalName | Blue link to carrier detail | Panel header |
| 13 | Carrier Status | Carrier.status | StatusBadge | Panel header |
| 14 | Carrier Tier | Carrier.tier | TierBadge | Panel header |
| 15 | Certificate Type | InsuranceCertificates.insuranceType | Full name: "Auto Liability Insurance" | Panel details |
| 16 | Policy Number | InsuranceCertificates.policyNumber | Monospace, copyable | Panel details |
| 17 | Provider | InsuranceCertificates.provider | Text | Panel details |
| 18 | Coverage Amount | InsuranceCertificates.coverageAmount | Currency with min threshold indicator | Panel details |
| 19 | Effective Date | InsuranceCertificates.effectiveDate | MM/DD/YYYY | Panel details |
| 20 | Expiry Date | InsuranceCertificates.expiryDate | MM/DD/YYYY with countdown badge | Panel details |
| 21 | Days Remaining | Calculated | Integer with urgency color | Panel details |
| 22 | Document Preview | InsuranceCertificates.certificateUrl | Inline PDF viewer (scrollable) | Panel document section |
| 23 | Verification Status | InsuranceCertificates.verified | "Verified by [name] on [date]" or "Not yet verified" | Panel verification |
| 24 | Verified By | InsuranceCertificates.verifiedBy -> User.name | Name text | Panel verification |
| 25 | Verified At | InsuranceCertificates.verifiedAt | MM/DD/YYYY HH:MM AM/PM | Panel verification |

### Calculated / Derived Fields

| # | Field Label | Calculation | Format |
|---|---|---|---|
| 1 | Days Remaining | DATEDIFF(expiryDate, NOW()) | Integer, negative = expired |
| 2 | Coverage Adequacy | coverageAmount >= minimum for type (Auto=$1M, Cargo=$100K) | Green check / red X badge |
| 3 | Insurance Status | Based on days: >30d = ACTIVE, 1-30d = EXPIRING_SOON, <=0 = EXPIRED | Badge per insurance status colors |
| 4 | Coverage Gap Flag | Carrier missing required insurance type entirely | Red "Missing" badge in carrier's row |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] Paginated table of all insurance certificates across all carriers
- [ ] Columns: carrier name, type, policy#, provider, coverage, effective date, expiry date, days remaining, verified badge, document link, actions
- [ ] Days remaining color coding: green (>30d), amber (14-30d), orange (7-14d), red (<7d or expired)
- [ ] Filter by insurance type (Auto Liability, Cargo, General Liability, Workers Comp)
- [ ] Filter by status (Active, Expiring Soon, Expired)
- [ ] Filter by carrier (searchable select)
- [ ] Filter by date range (expiring between dates)
- [ ] Filter by minimum coverage amount
- [ ] Sort by any column
- [ ] Click row to open detail panel
- [ ] Detail panel: full certificate information, PDF document preview, verification status
- [ ] "Verify Certificate" button in detail panel (stamps with user name + timestamp)
- [ ] "Request Updated Certificate" button (sends email to carrier contact)
- [ ] Link to carrier profile from detail panel

### Advanced Features (Logistics Expert Recommendations)

- [ ] Batch verify: select multiple certificates and mark all as verified at once
- [ ] Certificate reminder scheduler: configure automatic email reminders at custom intervals (e.g., 30d, 14d, 7d before expiry)
- [ ] Coverage gap analysis: dedicated view/section showing carriers missing required coverage types (no Auto Liability on file, no Cargo on file)
- [ ] Auto-extract data from uploaded certificates (OCR, future): parse PDF to fill policy#, provider, coverage, dates
- [ ] Compliance letter generator: generate formatted letter to carrier about expiring/expired insurance (PDF download or email)
- [ ] Insurance cost tracking: optional fields for tracking broker-paid insurance premiums and costs
- [ ] Certificate history per carrier: show timeline of all past certificates for a carrier (renewals, replacements)
- [ ] Duplicate certificate detection: flag if same policy# is uploaded for multiple carriers
- [ ] Certificate comparison: compare old vs new certificate for the same carrier+type when a renewal is uploaded
- [ ] Quick upload: upload new certificate from the table view (opens upload dialog with carrier and type pre-selected)
- [ ] Certificate status change notifications: notify relevant team members when certificates are verified, expire, or are renewed

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| View insurance tracking | ops_manager, carrier_admin, admin | insurance_view | Full page access denied |
| Verify certificate | carrier_admin, compliance_officer, admin | insurance_verify | "Verify" button hidden |
| Batch verify | carrier_admin, admin | insurance_verify | Batch verify button hidden |
| Request updated certificate | ops_manager, carrier_admin, admin | carrier_communicate | "Request Update" button hidden |
| Upload new certificate | ops_manager, carrier_admin, admin | insurance_upload | Upload option hidden |
| Export data | ops_manager, admin | export_data | Export button hidden |
| Configure reminders | admin | compliance_configure | Scheduler section hidden |
| Track insurance costs | admin, finance | finance_view | Cost columns hidden |

---

## 6. Status & State Machine

### Insurance Certificate Status Flow

```
[ACTIVE] ---(30 days before expiry)---> [EXPIRING_SOON]
[EXPIRING_SOON] ---(Certificate expires)---> [EXPIRED]
[EXPIRED] ---(New certificate uploaded + verified)---> [ACTIVE]

[ACTIVE] ---(Manual cancellation)---> [CANCELLED]
[CANCELLED] ---(New certificate uploaded)---> [ACTIVE]

Any status ---(New certificate uploaded for same type)---> Old becomes [SUPERSEDED], new is [ACTIVE]
```

### Verification States

| State | Description | Visual |
|---|---|---|
| Unverified | Certificate uploaded but not reviewed by compliance team | Gray "Unverified" badge |
| Verified | Compliance team confirmed certificate data matches document | Green "Verified" badge with check + verifier name + date |
| Verification Expired | Certificate was verified but has since expired | Red "Expired" badge (overrides verified) |

### Status Badge Colors

| Status | Background | Text | Icon | Tailwind |
|---|---|---|---|---|
| ACTIVE | #D1FAE5 | #065F46 | ShieldCheck | `bg-emerald-100 text-emerald-800` |
| EXPIRING_SOON | #FEF3C7 | #92400E | CalendarClock | `bg-amber-100 text-amber-800` |
| EXPIRED | #FEE2E2 | #991B1B | CalendarX | `bg-red-100 text-red-800` |
| CANCELLED | #F1F5F9 | #334155 | XCircle | `bg-slate-100 text-slate-700` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Top-Right of Page)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| Batch Verify | CheckCheck | Secondary / Outline | Opens batch verify mode (select multiple rows, then verify all) | Yes -- "Verify N selected certificates?" |
| Export | Download (ChevronDown) | Secondary / Outline | Dropdown: Export CSV, Export Excel, Export PDF (compliance report) | No |

### Row Actions (Table)

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| View | Eye | Open detail panel for this certificate | Always available |
| Verify | ShieldCheck | Mark certificate as verified (quick action without opening panel) | insurance_verify permission, certificate not already verified |
| Request Update | Mail | Send renewal request email to carrier | Certificate is EXPIRING_SOON or EXPIRED |
| Upload New | Upload | Open upload dialog to replace this certificate | insurance_upload permission |

### Detail Panel Actions

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| Verify Certificate | ShieldCheck | Mark as verified with user's name and current timestamp | Not yet verified, insurance_verify permission |
| Request Updated Certificate | Mail | Opens email compose with pre-filled template to carrier contact | Always available |
| Download Certificate | Download | Download the PDF document | Document exists |
| View Full Screen | Maximize | Open PDF in full-screen modal | Document exists |
| View Carrier Profile | ExternalLink | Navigate to carrier detail page (compliance tab) | Always available |
| Upload Replacement | Upload | Upload a new certificate to replace this one | insurance_upload permission |

### Bulk Actions (When Rows Selected)

| Action Label | Action | Confirmation |
|---|---|---|
| Verify Selected | Mark all selected certificates as verified | Yes -- "Verify N certificates?" |
| Request Updates | Send renewal emails for all selected expiring/expired certificates | Yes -- "Send renewal requests to N carriers?" |
| Export Selected | Download selected certificates as CSV | No |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + K | Open global search |
| / | Focus search input |
| Escape | Close detail panel / deselect all |
| Arrow Up/Down | Navigate table rows |
| Enter | Open detail panel for selected row |
| V | Verify selected certificate (when detail panel open) |

### Drag & Drop

N/A -- No drag-and-drop on this screen (document uploads are handled via file dialog).

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| insurance.uploaded | { carrierId, carrierName, insuranceType, policyNumber } | Add new row to table (if matches filters), show toast "New certificate uploaded for [carrier]" |
| insurance.verified | { certificateId, verifiedBy, verifiedAt } | Update verified badge on affected row, update detail panel if open |
| insurance.expiring | { carrierId, carrierName, insuranceType, daysRemaining } | Update days-remaining column and color on affected row |
| insurance.expired | { carrierId, carrierName, insuranceType } | Update status to EXPIRED on affected row, change to red coloring |
| insurance.renewed | { carrierId, carrierName, insuranceType, newExpiryDate, newCertificateId } | Update row with new dates, change color to green |
| insurance.reminderSent | { carrierId, insuranceType, sentBy } | Show subtle "Reminder sent" indicator on the row |

### Live Update Behavior

- **Update frequency:** WebSocket push for all insurance certificate changes.
- **Visual indicator:** Updated rows flash with a blue highlight for 2 seconds. New rows slide in. Expired certificates change to red background.
- **Conflict handling:** If user is viewing a certificate detail panel that gets updated, show inline banner: "This certificate was updated. [Refresh to see changes]."

### Polling Fallback

- **When:** WebSocket connection drops
- **Interval:** Every 30 seconds
- **Endpoint:** `GET /api/carriers/insurance?updatedSince={lastPollTimestamp}&{currentFilters}`
- **Visual indicator:** "Live updates paused -- reconnecting..." banner above table

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Verify certificate | Immediately show "Verified" badge with current user's name | Revert to "Unverified", show error toast |
| Request update | Show "Request sent" toast and indicator | Show "Failed to send" toast |
| Batch verify | Immediately update all selected rows to verified | Revert failed rows, show partial success toast |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| DataTable | `src/components/ui/data-table.tsx` | columns, data, pagination, sorting, selection |
| PageHeader | `src/components/layout/page-header.tsx` | title: "Insurance Tracking", breadcrumbs, actions |
| StatusBadge | `src/components/ui/status-badge.tsx` | status, entity: INSURANCE_STATUS |
| FilterBar | `src/components/ui/filter-bar.tsx` | filters: FilterConfig[] |
| Card | `src/components/ui/card.tsx` | Detail panel container |
| Badge | `src/components/ui/badge.tsx` | Insurance type badges, verified badges |
| Button | `src/components/ui/button.tsx` | Action buttons |
| DropdownMenu | `src/components/ui/dropdown-menu.tsx` | Export options, row actions |
| Sheet | `src/components/ui/sheet.tsx` | Detail panel (side sheet) |
| Checkbox | `src/components/ui/checkbox.tsx` | Row selection for batch operations |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| DataTable | Basic table | Add row click to open side panel, color-coded days column, batch selection with action bar |
| Sheet | Basic side panel | Add scrollable content with PDF viewer integration |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| InsuranceTypeIcon | Badge with insurance type icon: Auto Liability (blue shield), Cargo (cyan package), General (indigo shield), Workers Comp (amber hardhat) | Small |
| DaysRemainingCell | Table cell showing days with color: green >30, amber 14-30, orange 7-14, red <7 or negative | Small |
| VerifiedBadge | Badge showing "Verified by [name] on [date]" (green) or "Unverified" (gray) | Small |
| CoverageAmountCell | Currency cell with green check if meets minimum or red warning if below | Small |
| CertificateDetailPanel | Side panel with full cert details, PDF viewer, verification controls, action buttons | High |
| InlinePDFViewer | Embedded PDF viewer for certificate preview within the detail panel | Medium |
| CoverageGapAnalysis | Section/card showing carriers missing required insurance types | Medium |
| CertificateUploadDialog | Dialog for uploading a new/replacement certificate with carrier and type pre-selected | Medium |
| BatchVerifyBar | Action bar appearing when rows are selected: count + verify all + request updates | Small |
| ReminderSchedulerConfig | Configuration panel for setting automatic reminder intervals | Medium |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Sheet | sheet | Certificate detail side panel |
| Calendar | calendar | Date range filter for expiry dates |
| Popover | popover | Date picker popovers |
| Tooltip | tooltip | Coverage minimum explanations, verified details |
| ScrollArea | scroll-area | Detail panel scrollable content, PDF viewer |
| Separator | separator | Section dividers in detail panel |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/carriers/insurance | List all insurance certificates with filters and pagination | useInsuranceCertificates(filters, pagination, sort) |
| 2 | GET | /api/carriers/insurance/:certId | Get single certificate detail | useInsuranceCertificate(certId) |
| 3 | PATCH | /api/carriers/insurance/:certId/verify | Mark certificate as verified | useVerifyCertificate() |
| 4 | POST | /api/carriers/insurance/batch-verify | Batch verify multiple certificates | useBatchVerifyCertificates() |
| 5 | POST | /api/carriers/:carrierId/insurance | Upload new insurance certificate | useUploadCertificate() |
| 6 | POST | /api/carriers/insurance/:certId/request-update | Send renewal request email to carrier | useRequestCertificateUpdate() |
| 7 | POST | /api/carriers/insurance/bulk-request | Send bulk renewal requests | useBulkRequestUpdates() |
| 8 | GET | /api/carriers/insurance/coverage-gaps | Get carriers with missing required coverage | useCoverageGaps() |
| 9 | GET | /api/carriers/insurance/export | Export insurance data (CSV/Excel/PDF) | useExportInsurance() |
| 10 | GET | /api/carriers/insurance/filters/options | Get filter option values (types, carriers, providers) | useInsuranceFilterOptions() |
| 11 | GET | /api/carriers/insurance/reminder-config | Get reminder schedule configuration | useReminderConfig() |
| 12 | PATCH | /api/carriers/insurance/reminder-config | Update reminder schedule | useUpdateReminderConfig() |

### Request/Response Examples

**GET /api/carriers/insurance:**
```
Query params: ?type=AUTO_LIABILITY,CARGO&status=expiring&carrier=&expiryFrom=2026-02-01&expiryTo=2026-05-01&minCoverage=100000&page=1&pageSize=25&sortBy=expiryDate&sortDir=asc
```

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| insurance:{tenantId} | insurance.uploaded | useInsuranceLiveUpdates() -- adds row to table |
| insurance:{tenantId} | insurance.verified | useInsuranceLiveUpdates() -- updates verified badge |
| insurance:{tenantId} | insurance.expiring | useInsuranceLiveUpdates() -- updates days/color |
| insurance:{tenantId} | insurance.expired | useInsuranceLiveUpdates() -- updates status to expired |
| insurance:{tenantId} | insurance.renewed | useInsuranceLiveUpdates() -- updates with new cert data |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 500 |
|---|---|---|---|---|---|
| GET /api/carriers/insurance | Filter validation error toast | Redirect to login | "Access Denied" page | N/A | Error state with retry |
| PATCH /api/carriers/insurance/:certId/verify | "Cannot verify expired certificate" toast | Redirect to login | "Permission Denied" toast | "Certificate not found" toast | Error toast |
| POST /api/carriers/insurance/:certId/request-update | "Invalid carrier contact" toast | Redirect to login | "Permission Denied" toast | "Certificate not found" toast | "Email service unavailable" toast |

---

## 11. States & Edge Cases

### Loading State

- **Skeleton layout:** Page header and filter bar immediately. Table shows 10 skeleton rows with animated gray bars.
- **Detail panel loading:** Panel opens with skeleton placeholders for text fields and a gray rectangle for the PDF viewer area.
- **PDF loading:** Show loading spinner within the PDF viewer area while the document loads.

### Empty States

**No certificates in system:**
- **Headline:** "No insurance certificates tracked"
- **Description:** "Insurance certificates will appear here as carriers are onboarded. Start by onboarding your first carrier."
- **CTA:** "Go to Carrier Onboarding" button

**Filtered empty:**
- **Headline:** "No certificates match your filters"
- **Description:** "Try adjusting your filter criteria."
- **CTA:** "Clear All Filters" button

**No document uploaded for certificate:**
- **Detail panel:** Show "No document uploaded" message with upload button where PDF viewer would be.
- **Table:** Show gray "No doc" text in document column.

### Error States

**Full page error:**
- **Display:** Error icon + "Unable to load insurance certificates" + Retry button

**PDF viewer error:**
- **Detail panel:** "Could not load certificate document. The file may be corrupted or unavailable." with "Download Instead" link.

**Verification error:**
- **Toast:** "Failed to verify certificate. Please try again."

**Email send error:**
- **Toast:** "Failed to send renewal request to [carrier]. Email service may be temporarily unavailable."

### Permission Denied

- **Full page denied:** "You don't have permission to view insurance tracking" with link to carriers list
- **Verify denied:** "Verify Certificate" button hidden, tooltip "Contact admin for verification access"
- **Upload denied:** Upload options hidden

### Offline / Degraded

- **Full offline:** Banner: "You're offline. Showing cached insurance data from [timestamp]. Verification and email actions are unavailable."
- **PDF unavailable:** "Document preview unavailable offline. Download when connected."

---

## 12. Filters, Search & Sort

### Filters

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Search | Text input (debounced 300ms) | Carrier name, policy number, provider | Empty | `?search=` |
| 2 | Insurance Type | Multi-select dropdown | Auto Liability, Cargo, General Liability, Workers Comp | All | `?type=AUTO_LIABILITY,CARGO` |
| 3 | Status | Multi-select dropdown | Active, Expiring Soon, Expired, Cancelled | All except Cancelled | `?status=active,expiring` |
| 4 | Carrier | Searchable select | All carriers in system | All | `?carrier={carrierId}` |
| 5 | Expiry Date Range | Date range picker | Any start/end date | None (show all) | `?expiryFrom=&expiryTo=` |
| 6 | Min Coverage | Number input | Dollar amount | None (show all) | `?minCoverage=100000` |
| 7 | Verified | Select | All, Verified Only, Unverified Only | All | `?verified=true` |

### Search Behavior

- **Search field:** Single text input at start of filter bar
- **Searches across:** Carrier legal name, carrier DBA, policy number, provider name
- **Behavior:** Debounced 300ms, minimum 2 characters, case-insensitive
- **URL param:** `?search=progressive`

### Sort Options

| Column | Default Direction | Sort Type |
|---|---|---|
| Carrier Name | Ascending (A-Z) | Alphabetic |
| Insurance Type | Grouped (Auto Liability first) | Custom enum |
| Policy # | Ascending | Alphanumeric |
| Provider | Ascending (A-Z) | Alphabetic |
| Coverage Amount | Descending (highest first) | Numeric |
| Effective Date | Descending (newest first) | Date |
| Expiry Date | Ascending (soonest first) | Date |
| Days Remaining | Ascending (most urgent first) | Numeric |
| Verified | Custom (Unverified first) | Boolean |

**Default sort:** Expiry Date ascending (soonest expiration first)

### Saved Filters / Presets

- **System presets:**
  - "All Certificates" -- no filters
  - "Expiring Soon" -- status=EXPIRING_SOON
  - "Expired" -- status=EXPIRED
  - "Unverified" -- verified=false
  - "Required Only" -- type=AUTO_LIABILITY,CARGO
  - "Below Minimum" -- coverage below required minimum
- **URL sync:** All filter state reflected in URL query params

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Table columns: Show carrier, type, expiry date, days remaining, verified, actions. Hide policy#, provider, coverage, effective date.
- Detail panel: Opens as full-width overlay instead of side-by-side
- Filters: Collapse to "Filters" button with slide-over panel
- Batch verify bar: Full width below filters

### Mobile (< 768px)

- Table switches to card view: each certificate as a card showing carrier, type badge, expiry with countdown, verified badge
- Detail panel: Full-screen overlay
- PDF viewer: Simplified (download link instead of inline viewer)
- Filters: Full-screen filter modal
- Batch selection: Long-press card to select
- "Request Update" and "Verify" accessible via swipe actions on card

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full table + side panel (55/45 split) |
| Desktop | 1024px - 1439px | Full table, side panel overlay |
| Tablet | 768px - 1023px | Reduced columns, full-width detail overlay |
| Mobile | < 768px | Card view, full-screen detail, download instead of preview |

---

## 14. Stitch Prompt

```
Design an insurance certificate tracking page for a modern freight/logistics TMS (Transportation Management System) called "Ultra TMS."

Layout: Full-width page with a dark slate-900 sidebar on the left (240px, collapsed), white content area. Top has breadcrumb "Carriers > Insurance Tracking" and page title "Insurance Tracking" with two buttons: "Batch Verify" (secondary outline with double-check icon) and "Export" (secondary outline with download icon and chevron).

Filter Bar: Below the header, a horizontal filter bar with:
- Search input: "Search carrier, policy#, provider..."
- "Type" multi-select: Auto Liability, Cargo, General Liability, Workers Comp (each with small colored badge)
- "Status" multi-select: Active (green), Expiring (amber), Expired (red)
- "Carrier" searchable dropdown
- "Expiry Range" date range picker
- "Min Coverage" number input with $ prefix
- "Clear Filters" text link

Split View (55% left, 45% right):

Left - Data Table with columns:
- Checkbox for selection
- Carrier Name (blue link)
- Type (colored badge: blue "Auto Liability", cyan "Cargo", indigo "General", amber "Workers Comp")
- Policy # (monospace)
- Provider
- Coverage (currency, green if meets min, red if below)
- Effective Date
- Expiry Date
- Days Left (colored number: "343" green, "23" amber, "5" orange, "-3" red)
- Verified (green "Verified" badge with check, or gray "Unverified")
- Actions ([...] menu)

Show 8 rows of realistic data:
1. Swift Logistics | Blue "Auto Liability" | AL-2026-0789 | Progressive | $1,500,000 (green) | 01/15/26 | 01/15/27 | 343 (green) | Green "Verified" | [...]
2. Swift Logistics | Cyan "Cargo" | CG-2026-0456 | National Interstate | $250,000 (green) | 02/01/26 | 02/01/27 | 360 (green) | Green "Verified" | [...]
3. ABC Trucking | Blue "Auto Liability" | AL-2025-1234 | Zurich | $1,000,000 (green) | 06/01/25 | 03/01/26 | 23 (amber) | Gray "Unverified" | [...] -- row has amber left border
4. FastFreight Inc | Cyan "Cargo" | CG-2025-0987 | Old Republic | $100,000 (green) | 03/15/25 | 02/10/26 | 4 (orange) | Gray "Unverified" | [...] -- row has orange left border
5. JM Carrier | Blue "Auto Liability" | AL-2024-5678 | Hartford | $750,000 (RED, below $1M min) | 01/01/25 | 02/01/26 | -5 (red) | Gray "Unverified" | [...] -- row has red left border and red background tint
6-8: More realistic data with various statuses.

Pagination: "Showing 1-25 of 687 certificates" with page navigation.

Right - Detail Panel (showing row 3 selected):
Header: "ABC Trucking" (blue link) with green "Active" status badge and slate "Silver" tier badge
Separator line.
Certificate Details section:
- "Type: Auto Liability Insurance"
- "Policy #: AL-2025-1234" (monospace with copy icon)
- "Provider: Zurich Insurance"
- "Coverage: $1,000,000" with green "Meets minimum ($1M)" indicator
- "Effective: 06/01/2025"
- "Expires: 03/01/2026" with amber "23 days remaining" badge
Separator line.
"Document Preview" section with embedded PDF viewer showing a certificate of insurance document (use a gray rectangle with PDF icon as placeholder, about 200px tall).
Below: "Download" and "Full Screen" small buttons.
Separator line.
"Verification" section:
- "Status: Not yet verified" in gray
- Blue outline button: "Verify Certificate" with shield-check icon
Separator line.
"Actions" section:
- "Request Updated Certificate" amber outline button with mail icon
- "View Carrier Profile" text link with external-link icon

Design Specifications:
- Font: Inter or system sans-serif, 14px base, 13px for table cells
- Content background: gray-50 for page, white for table area and detail panel
- Primary color: blue-600 for links and primary actions
- Insurance type badges: Auto Liability (blue-100/blue-800), Cargo (cyan-100/cyan-800), General (indigo-100/indigo-800), Workers Comp (amber-100/amber-800)
- Days remaining: large bold number with color (emerald for safe, amber for warning, orange for urgent, red for expired)
- Verified badge: green-100 with green-800 text and checkmark, or gray-100 with gray-500 text
- Row left border (4px): colored by urgency matching the days remaining
- Coverage amount: green text if meets minimum, red text with warning icon if below
- Detail panel: white background, separated from table by a subtle border-l, shadow-sm
- PDF viewer area: gray-100 background with rounded corners, scrollable
- Modern SaaS aesthetic similar to Notion or Linear.app

Include: the split-view with table and detail panel, color-coded urgency indicators on table rows, inline PDF preview in the detail panel, the verification workflow section, and the coverage minimum compliance indicator.
```

---

## 15. Enhancement Opportunities

### Current State (Wave 3)

**What's built and working:**
- [ ] Nothing -- insurance tracking page is not started

**What needs polish / bug fixes:**
- N/A (not built yet)

**What to add this wave:**
- [ ] Insurance certificates table with all columns and color-coded urgency
- [ ] Filters by type, status, carrier, date range, coverage, verified
- [ ] Click row to open detail panel
- [ ] Detail panel with full certificate info and PDF preview
- [ ] Verify Certificate functionality
- [ ] Request Updated Certificate (email to carrier)
- [ ] Batch verify selected certificates
- [ ] Coverage amount minimum validation display
- [ ] Sort by all columns (default: expiry ascending)
- [ ] Pagination with configurable page size
- [ ] Export CSV/Excel
- [ ] WebSocket updates for certificate changes

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Certificates table with urgency coloring | High | Medium | P0 |
| Detail panel with PDF preview | High | High | P0 |
| Verify Certificate workflow | High | Low | P0 |
| Request Updated Certificate (email) | High | Medium | P0 |
| Filters (type, status, carrier, date) | High | Medium | P0 |
| Coverage minimum validation display | High | Low | P0 |
| Batch verify | Medium | Low | P1 |
| Coverage gap analysis | Medium | Medium | P1 |
| WebSocket real-time updates | Medium | Medium | P1 |
| Export CSV/Excel | Medium | Low | P1 |
| Certificate reminder scheduler | Medium | Medium | P1 |
| Insurance cost tracking | Low | Medium | P2 |
| Compliance letter generator | Low | Medium | P2 |
| OCR auto-extract from certificates | Low | High | P2 |
| Duplicate certificate detection | Low | Low | P2 |
| Certificate comparison (old vs new) | Low | Medium | P2 |

### Future Wave Preview

- **Wave 4:** OCR-based certificate auto-fill (extract data from uploaded PDFs), integration with RMIS for automated certificate pulls, bulk certificate import from carrier packets.
- **Wave 5:** AI-powered certificate validation (detect altered certificates), predictive renewal tracking (which carriers are likely to lapse), automated compliance letter campaigns, insurance market rate comparison.

---

_Last Updated: 2026-02-06_
