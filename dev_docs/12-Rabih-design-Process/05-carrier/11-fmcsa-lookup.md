# FMCSA Lookup

> Service: Carrier Management | Wave: 3 | Priority: P0
> Route: /(dashboard)/carriers/fmcsa | Status: Not Started
> Primary Personas: Omar (Dispatcher/Operations), Sarah (Ops Manager), Admin
> Roles with Access: dispatcher, operations_manager, admin, compliance_officer

---

## 1. Purpose & Business Context

**What this screen does:**
Provides a lookup tool to query the FMCSA SAFER (Safety and Fitness Electronic Records) system using a carrier's MC Number or DOT Number. Returns comprehensive federal registration data including operating authority status, safety rating, insurance on file, inspection statistics, and crash data. From the results, users can onboard a new carrier into Ultra TMS or update an existing carrier's compliance records.

**Business problem it solves:**
Every freight broker in the United States is legally required to verify a carrier's operating authority and insurance before tendering loads. Without a built-in FMCSA lookup, dispatchers and compliance officers have to leave the TMS, navigate to the FMCSA SAFER website (which is slow, clunky, and often down), manually search for the carrier, visually inspect the results, then manually re-enter the data into the TMS. This process takes 10-15 minutes per carrier, is error-prone (typos in MC numbers, missed insurance expirations), and creates compliance risk if a load is given to a carrier with revoked authority or lapsed insurance. Double-brokering fraud -- a growing $500M+ problem in US freight -- often exploits carriers with stolen or inactive MC numbers. An integrated FMCSA lookup tool reduces verification time to under 30 seconds, eliminates manual data entry errors, and provides automated fraud detection by cross-referencing results with existing carrier records. Brokerages without this tool face $16,000+ FMCSA fines per incident of using an unauthorized carrier and expose themselves to catastrophic liability in accident scenarios.

**Key business rules:**
- MC Number format: 6-7 digits (e.g., 789456 or MC-789456). System strips "MC-" prefix and validates numeric.
- DOT Number format: 1-8 digits (e.g., 2345678 or DOT-2345678). System strips "DOT-" prefix and validates numeric.
- FMCSA data is fetched via the FMCSA WebAPI (requires API key registration).
- Operating authority must be AUTHORIZED (not REVOKED, NOT AUTHORIZED, or OUT OF SERVICE) to proceed with onboarding.
- If authority is REVOKED or OUT OF SERVICE, show a prominent red banner warning and block the "Add as Carrier" action.
- Insurance data shown is "on file with FMCSA" -- actual certificate of insurance must still be collected separately.
- All lookups are logged in an audit trail (who searched, what MC/DOT, when, what result).
- If the MC/DOT already matches an existing carrier in the system, show a "Duplicate Detected" warning with a link to the existing carrier.
- Batch lookup supports up to 50 MC/DOT numbers per batch.
- FMCSA data should be cached for 24 hours to reduce API calls for repeated lookups on the same carrier.

**Success metric:**
Carrier verification time drops from 12 minutes to under 30 seconds. Zero loads tendered to carriers with revoked authority or lapsed insurance. 100% of new carrier onboardings include FMCSA verification (enforced by workflow).

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Carrier Onboarding (Step 1) | "Verify FMCSA" step in onboarding wizard | MC# or DOT# entered in wizard |
| Carriers List | Click "FMCSA Lookup" action button or sidebar nav | None |
| Carrier Detail | Click "Verify FMCSA Data" or "Refresh FMCSA" button | MC# or DOT# from existing carrier |
| Compliance Center | Click "Run FMCSA Check" for a flagged carrier | MC# from flagged carrier |
| Direct URL | Bookmark / shared link | Optional ?mc= or ?dot= query param |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Carrier Onboarding | Click "Add as Carrier" button from results | All FMCSA data pre-filled into onboarding wizard |
| Carrier Detail | Click "Update Existing" button (if carrier exists) | carrierId, updated FMCSA data |
| Compliance Center | Click "Flag for Review" button | carrierId or FMCSA data, flag reason |
| Print/PDF | Click "Print Report" | FMCSA results formatted for print |

**Primary trigger:**
Omar the dispatcher receives a call from a carrier offering capacity on a hot lane. The carrier provides their MC number. Before doing anything, Omar runs a quick FMCSA lookup to verify the carrier's authority is active, insurance is on file, and safety rating is satisfactory. If clean, he clicks "Add as Carrier" to fast-track onboarding.

**Success criteria (user completes the screen when):**
- User has verified a carrier's FMCSA data (authority, insurance, safety).
- User has either onboarded the carrier (via "Add as Carrier"), updated an existing carrier record, or flagged the carrier for review.
- User has identified any red flags (revoked authority, out-of-service, high OOS rates) before assigning loads.

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------+
|  Top Bar: Breadcrumb (Carriers > FMCSA Lookup) / Page Title       |
|  "FMCSA Carrier Lookup"                                           |
+------------------------------------------------------------------+
|  Search Section (centered, prominent)                              |
|  +--------------------------------------------------------------+|
|  |                                                               ||
|  |  [MC Number or DOT Number input field, large]                 ||
|  |  Placeholder: "Enter MC# or DOT# (e.g., 789456)"            ||
|  |                                                               ||
|  |  [MC Number] [DOT Number] radio toggle                        ||
|  |                                                               ||
|  |  [Lookup] primary button    [Batch Lookup] secondary link     ||
|  |                                                               ||
|  +--------------------------------------------------------------+|
+------------------------------------------------------------------+
|  Results Section (appears after search)                            |
|  +--------------------------------------------------------------+|
|  |  RESULT HEADER                                                ||
|  |  Company: TransWest Logistics LLC                             ||
|  |  DBA: TransWest                                               ||
|  |  MC: 789456 | DOT: 2345678 | DUNS: 123456789                ||
|  |  Address: 1234 Commerce Dr, Dallas, TX 75201                  ||
|  |  Phone: (214) 555-0100                                        ||
|  |                                                               ||
|  |  [Add as Carrier] [Update Existing] [Print Report] [Flag]    ||
|  +--------------------------------------------------------------+|
|                                                                    |
|  +---------------------------+  +--------------------------------+|
|  | OPERATING AUTHORITY       |  | SAFETY RATING                   ||
|  | Status: AUTHORIZED [grn]  |  | Rating: SATISFACTORY [green]    ||
|  | Common: AUTHORIZED        |  | Rating Date: 03/15/2023         ||
|  | Contract: AUTHORIZED      |  | Review Date: 06/15/2024         ||
|  | Broker: NOT AUTHORIZED    |  | Out of Service: NO [green]      ||
|  +---------------------------+  +--------------------------------+|
|                                                                    |
|  +--------------------------------------------------------------+|
|  | INSURANCE ON FILE                                             ||
|  | Type        | Policy #    | Amount      | Eff Date | Exp Date||
|  | BIPD        | GLP-0012345 | $1,000,000  | 01/01/26 | 01/01/27||
|  | Cargo       | CRG-0006789 | $100,000    | 01/01/26 | 01/01/27||
|  | General     | GL-0098765  | $2,000,000  | 01/01/26 | 01/01/27||
|  +--------------------------------------------------------------+|
|                                                                    |
|  +---------------------------+  +--------------------------------+|
|  | INSPECTION DATA           |  | CRASH DATA                      ||
|  | Driver Inspections: 45    |  | Total Crashes: 3                ||
|  | Driver OOS Rate: 4.2%    |  | Fatal: 0                        ||
|  | Vehicle Inspections: 38   |  | Injury: 1                       ||
|  | Vehicle OOS Rate: 12.5%  |  | Tow-Away: 2                     ||
|  | (National avg: 5.5%/20%) |  | (Last 24 months)                ||
|  +---------------------------+  +--------------------------------+|
|                                                                    |
|  +--------------------------------------------------------------+|
|  | LOOKUP HISTORY (recent lookups by all users)                  ||
|  | Date       | MC#    | DOT#    | Company      | Looked Up By  ||
|  | 01/14/2026 | 789456 | 2345678 | TransWest    | Omar D.       ||
|  | 01/13/2026 | 654321 | 1234567 | QuickHaul    | Sarah M.      ||
|  | 01/12/2026 | 111222 | 3334444 | Apex Freight | Omar D.       ||
|  +--------------------------------------------------------------+|
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible, above fold) | Operating authority status (AUTHORIZED/REVOKED with prominent color), company name, MC/DOT numbers, out-of-service flag | These are the instant go/no-go decision points -- a revoked authority means STOP |
| **Secondary** (visible below fold) | Safety rating, insurance on file (types and amounts), inspection data (OOS rates) | Important for risk assessment and compliance, but secondary to authority status |
| **Tertiary** (visible on scroll) | Crash data, detailed address/phone, DUNS number, lookup history | Background information for deeper compliance review |
| **Hidden** (behind click) | Full FMCSA report PDF, historical data changes, cross-reference with existing carriers | Deep investigation and audit trail |

---

## 4. Data Fields & Display

### Visible Fields

| # | Field Label | Source (FMCSA API) | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Company Name | carrier.legalName | Text, large font (text-xl semibold) | Result header |
| 2 | DBA Name | carrier.dbaName | "DBA: [name]" in gray text below company name | Result header |
| 3 | MC Number | carrier.mcNumber | "MC: XXXXXX" monospace | Result header |
| 4 | DOT Number | carrier.dotNumber | "DOT: XXXXXXX" monospace | Result header |
| 5 | DUNS Number | carrier.dunsNumber | "DUNS: XXXXXXXXX" monospace | Result header |
| 6 | Address | carrier.phyStreet + phyCity + phyState + phyZipcode | Full address, single line | Result header |
| 7 | Phone | carrier.telephone | "(XXX) XXX-XXXX" formatted | Result header |
| 8 | Operating Authority Status | carrier.bipdInsuranceRequired / authority data | AUTHORIZED (green badge), NOT AUTHORIZED (gray badge), REVOKED (red badge), PENDING (amber badge) | Authority card, large prominent badge |
| 9 | Authority Types | carrier.commonAuthorityStatus, contractAuthorityStatus, brokerAuthorityStatus | Status for each: Common, Contract, Broker -- each with AUTHORIZED/NOT AUTHORIZED badge | Authority card |
| 10 | Safety Rating | carrier.safetyRating | SATISFACTORY (green), CONDITIONAL (amber), UNSATISFACTORY (red), NOT RATED (gray) | Safety card |
| 11 | Out of Service Flag | carrier.oosFlag | YES (large red banner) / NO (green "Clear" badge) | Safety card, top-right |
| 12 | Insurance Type | insurance.type | BIPD, Cargo, General, Bond, etc. | Insurance table |
| 13 | Insurance Amount | insurance.coverageAmount | "$X,XXX,XXX" formatted | Insurance table |
| 14 | Insurance Effective Date | insurance.effectiveDate | "MM/DD/YYYY" | Insurance table |
| 15 | Insurance Expiration Date | insurance.expirationDate | "MM/DD/YYYY"; red text if expired; amber if within 30 days | Insurance table |
| 16 | Driver Inspections | carrier.driverInsp | Integer | Inspection card |
| 17 | Driver OOS Rate | carrier.driverOosRate | "X.X%" with comparison to national average | Inspection card |
| 18 | Vehicle Inspections | carrier.vehicleInsp | Integer | Inspection card |
| 19 | Vehicle OOS Rate | carrier.vehicleOosRate | "X.X%" with comparison to national average; red if > 2x national avg | Inspection card |
| 20 | Total Crashes | carrier.crashTotal | Integer | Crash card |
| 21 | Fatal Crashes | carrier.fatalCrash | Integer; red bold if > 0 | Crash card |
| 22 | Injury Crashes | carrier.injCrash | Integer; amber if > 0 | Crash card |
| 23 | Tow-Away Crashes | carrier.towawayCrash | Integer | Crash card |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Authority Status Summary | Composite of all authority types -- if any common/contract authority is AUTHORIZED, show overall as AUTHORIZED | Overall green/red status |
| 2 | Insurance Expiration Warning | If any insurance expires within 30 days, flag carrier | Amber warning badge on insurance section |
| 3 | OOS Rate Comparison | Compare carrier's OOS rates to national averages (driver: 5.5%, vehicle: 20.7%) | "X.X% vs national X.X%" with above/below indicator |
| 4 | Existing Carrier Match | Cross-reference MC/DOT with carriers already in Ultra TMS | "Duplicate Detected" banner with link to existing carrier |
| 5 | Data Freshness | Timestamp of when FMCSA data was last fetched | "Data as of MM/DD/YYYY HH:MM" |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] MC Number or DOT Number search input with radio toggle
- [ ] "Lookup" button that queries FMCSA SAFER API
- [ ] Loading state while querying (spinner, "Checking FMCSA records...")
- [ ] Results card showing all FMCSA data (company info, authority, safety, insurance, inspections, crashes)
- [ ] Operating authority status with prominent color-coded badge (green/red/amber)
- [ ] Out-of-service flag with large red banner if YES
- [ ] Insurance on file table with expiration date warnings
- [ ] "Add as Carrier" button that opens onboarding wizard pre-filled with FMCSA data
- [ ] "Update Existing" button if carrier already exists in system
- [ ] "Print Report" button to generate PDF of FMCSA data
- [ ] "Flag for Review" button to flag concerning carriers
- [ ] Lookup history log (recent lookups by all users in the tenant)
- [ ] Duplicate detection: if MC/DOT already exists in system, show warning banner with link

### Advanced Features (Logistics Expert Recommendations)

- [ ] Batch lookup: paste up to 50 MC or DOT numbers (one per line or comma-separated), process all, show results table with pass/fail summary
- [ ] Compare multiple carriers side by side: select 2-3 lookup results and display comparison table
- [ ] FMCSA data change detection: if this carrier was looked up before, highlight fields that changed since the last check (e.g., "Insurance amount changed from $500K to $1M")
- [ ] Auto-cross-reference with existing carriers: on lookup, automatically check if MC/DOT or company name matches any existing carrier record (duplicate/fraud detection)
- [ ] Alert rules: configure automatic monitoring -- "Notify me if MC 789456's authority status changes" -- runs periodic checks and sends notifications
- [ ] Carrier411/RMIS cross-reference: if integrated, show external safety scores alongside FMCSA data
- [ ] FMCSA data quality score: computed based on inspection counts, age of safety rating, and insurance freshness -- "High Confidence" vs "Low Data" indicator
- [ ] Smart MC lookup: accept partial MC numbers and show suggestions (autocomplete from cached lookups)
- [ ] Export results to CSV or PDF for compliance file
- [ ] Integration with carrier onboarding: auto-fill onboarding form fields from FMCSA data (company name, address, phone, MC, DOT, insurance details)

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| FMCSA lookup (search) | any authenticated | carrier_view | Full page denied -- must have carrier module access |
| Add as Carrier | dispatcher, admin | carrier_create | "Add as Carrier" button hidden |
| Update Existing | dispatcher, admin | carrier_edit | "Update Existing" button hidden |
| Flag for Review | any authenticated | carrier_flag | "Flag" button hidden |
| Batch lookup | operations_manager, admin | carrier_manage | "Batch Lookup" link hidden |
| Configure alert rules | admin | carrier_manage + notification_manage | Alert configuration hidden |
| View lookup history | operations_manager, admin | audit_view | Lookup history section hidden |

---

## 6. Status & State Machine

### Status Transitions (Lookup Flow)

```
[Empty / Idle] ---(Enter MC/DOT, click Lookup)---> [Loading]
                                                        |
                                         (API returns data)
                                                        |
                                                        v
                                                  [Results Displayed]
                                                        |
                              +-------------------------+--------------------------+
                              |                         |                          |
                    (Authority OK)           (Authority REVOKED)          (No results)
                              |                         |                          |
                              v                         v                          v
                    [Ready to Add/Update]     [Blocked - Red Warning]     [Not Found]
                              |                         |
                    (Click Add as Carrier)     (Click Flag for Review)
                              |                         |
                              v                         v
                  [Navigate to Onboarding]   [Navigate to Compliance Center]
```

### Actions Available Per Result State

| Result State | Available Actions | Blocked Actions |
|---|---|---|
| Authority AUTHORIZED, no red flags | Add as Carrier, Update Existing, Print Report, Flag | None |
| Authority AUTHORIZED, insurance expired | Add as Carrier (with warning), Update Existing, Print Report, Flag | None (warning only) |
| Authority REVOKED | Flag for Review, Print Report | Add as Carrier (blocked with explanation) |
| Out of Service: YES | Flag for Review, Print Report | Add as Carrier (blocked with red banner) |
| Safety: UNSATISFACTORY | Add as Carrier (with amber warning), Print Report, Flag | None (warning only) |
| Not Found | Retry with different number | All result actions |
| Duplicate Detected | View Existing Carrier, Update Existing, Print Report | Add as Carrier (show duplicate warning instead) |

### Authority Status Badge Colors

| Authority Status | Background | Text | Tailwind |
|---|---|---|---|
| AUTHORIZED | green-100 (#D1FAE5) | green-800 (#065F46) | `bg-emerald-100 text-emerald-800` |
| NOT AUTHORIZED | gray-100 (#F3F4F6) | gray-700 (#374151) | `bg-gray-100 text-gray-700` |
| REVOKED | red-100 (#FEE2E2) | red-800 (#991B1B) | `bg-red-100 text-red-800` |
| PENDING | amber-100 (#FEF3C7) | amber-800 (#92400E) | `bg-amber-100 text-amber-800` |

### Safety Rating Badge Colors

| Rating | Background | Text | Tailwind |
|---|---|---|---|
| SATISFACTORY | green-100 (#D1FAE5) | green-800 (#065F46) | `bg-emerald-100 text-emerald-800` |
| CONDITIONAL | amber-100 (#FEF3C7) | amber-800 (#92400E) | `bg-amber-100 text-amber-800` |
| UNSATISFACTORY | red-100 (#FEE2E2) | red-800 (#991B1B) | `bg-red-100 text-red-800` |
| NOT RATED | gray-100 (#F3F4F6) | gray-700 (#374151) | `bg-gray-100 text-gray-700` |

---

## 7. Actions & Interactions

### Primary Action Buttons (In Results Section)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| Add as Carrier | Plus | Primary / Blue | Navigates to Carrier Onboarding wizard (step 1) with all FMCSA data pre-filled | No (but shows confirmation if carrier has warnings) |
| Update Existing | RefreshCw | Secondary / Outline | Updates the existing carrier's FMCSA data fields (authority, insurance, safety, inspections) | Yes -- "Update FMCSA data for [carrier name]?" |
| Print Report | Printer | Secondary / Outline | Opens print dialog or generates PDF of FMCSA results | No |
| Flag for Review | Flag | Destructive / Red Outline | Opens flag reason modal (select: Authority Concern, Insurance Issue, Safety Risk, Fraud Suspicion, Other + notes) | Yes -- confirms flag and reason |

### Search Actions

| Action | Target | Behavior |
|---|---|---|
| Click "Lookup" | Search button | Validates MC/DOT input, fires API request, shows loading state, renders results |
| Press Enter | In search input | Same as clicking "Lookup" |
| Click "Batch Lookup" | Secondary link below search | Opens batch lookup modal: textarea for multiple MC/DOT numbers, one per line |
| Click "Clear" | X icon in search input | Clears input and results, returns to idle state |
| Toggle MC/DOT | Radio buttons | Switches between MC Number and DOT Number search mode |

### Result Interaction Actions

| Action | Target | Behavior |
|---|---|---|
| Click company name | Result header | If carrier exists in system, navigates to Carrier Detail; otherwise no action |
| Click insurance row | Insurance table | Expands to show full policy details (insurer name, effective dates, coverage details) |
| Click crash count | Crash data card | Opens modal with crash detail table (dates, types, locations, if available) |
| Click "View Existing" | Duplicate detection banner | Navigates to the existing carrier's detail page |
| Hover OOS rate | Inspection data | Shows tooltip: "National average: X.X%. This carrier is [above/below] average." |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + L | Focus search input |
| Enter | Submit lookup |
| Escape | Close modal / clear results |
| Ctrl/Cmd + P | Print report |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| N/A | -- | No drag-drop on this screen |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| fmcsa.lookup.completed | { lookupId, mcNumber, dotNumber, resultSummary, performedBy } | Add entry to lookup history table at top (newest first) |
| carrier.fmcsa.alert | { carrierId, mcNumber, alertType, oldValue, newValue } | If user is viewing results for this MC/DOT, show banner: "FMCSA data has changed since your last check. [Refresh]" |

### Live Update Behavior

- **Update frequency:** No continuous real-time updates needed. Lookup is a request-response tool. Lookup history table updates via WebSocket push when any user performs a lookup.
- **Visual indicator:** New lookup history entries slide in at the top of the table with a blue highlight.
- **Conflict handling:** Not applicable -- lookups are read-only queries.

### Polling Fallback

- **When:** WebSocket connection drops
- **Interval:** No polling needed for FMCSA lookup (it is user-initiated)
- **Lookup history:** Refreshes on page visit

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Lookup submission | Immediately show loading state with spinner | Show error message if FMCSA API fails or times out |
| Flag for Review | Immediately show "Flagged" badge on result | Remove badge, show error toast |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| PageHeader | src/components/layout/page-header.tsx | title, breadcrumbs |
| StatusBadge | src/components/ui/status-badge.tsx | For authority status, safety rating badges |
| DataTable | src/components/ui/data-table.tsx | For insurance table, lookup history table |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| StatusBadge | Generic status display | Need specific variants for FMCSA authority statuses (AUTHORIZED, REVOKED) and safety ratings (SATISFACTORY, CONDITIONAL, UNSATISFACTORY) with appropriate colors |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| FMCSASearchBar | Prominent search component: large input field with MC/DOT radio toggle, "Lookup" primary button, "Batch Lookup" secondary link. Validates input format before submission. Shows loading spinner in button during API call. | Medium |
| FMCSAResultsCard | Container for all FMCSA results: header with company info, authority card, safety card, insurance table, inspection card, crash card. Collapsible sections. | High (composite of many sub-components) |
| AuthorityStatusCard | Card showing overall authority status with large badge, plus individual authority types (Common, Contract, Broker) each with their own status badge. Red warning banner if any authority is REVOKED. | Medium |
| SafetyRatingCard | Card showing safety rating badge, rating date, review date, and out-of-service flag. OOS flag shown as large red banner if YES, green "Clear" text if NO. | Small |
| InsuranceTable | Table displaying insurance policies on file: type, policy number, coverage amount, effective date, expiration date. Expiration dates color-coded (red if expired, amber if within 30 days). | Small |
| InspectionDataCard | Card showing driver inspections count, driver OOS rate, vehicle inspections count, vehicle OOS rate. Each rate compared to national average with above/below indicator. | Small |
| CrashDataCard | Card showing total crashes, fatal (red bold), injury (amber), tow-away. Crash count clickable for details. | Small |
| OOSBanner | Full-width red banner component: "OUT OF SERVICE -- This carrier is not authorized to operate. Do not tender loads." Used when OOS flag is YES. | Small |
| DuplicateDetectionBanner | Amber banner component: "This carrier already exists in Ultra TMS as [Carrier Name]. [View Existing Carrier] [Update FMCSA Data]" | Small |
| BatchLookupModal | Modal with textarea input for multiple MC/DOT numbers, processing progress bar, and results summary table (pass/fail for each). | High |
| ChangeDetectionHighlight | Inline highlight component that wraps a field value and adds a yellow background with tooltip "Changed from [old] to [new]" when FMCSA data differs from last lookup. | Small |
| LookupHistoryTable | Table component showing recent lookups: date, MC#, DOT#, company name, authority status badge, looked up by user. Paginated. | Small |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Radio Group | radio-group | MC/DOT search type toggle |
| Dialog | dialog | Batch lookup modal, flag reason modal, crash details modal |
| Alert | alert | OOS warning banner, duplicate detection banner, authority warnings |
| Table | table | Insurance table, inspection data, lookup history |
| Textarea | textarea | Batch lookup input |
| Progress | progress | Batch lookup processing progress bar |
| Tooltip | tooltip | OOS rate comparisons, data freshness timestamps |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | /api/fmcsa/lookup?mc=XXXXXX or ?dot=XXXXXXX | Fetch FMCSA data for a single MC or DOT number | useFMCSALookup(type, number) |
| 2 | POST | /api/fmcsa/batch-lookup | Batch lookup for multiple MC/DOT numbers | useFMCSABatchLookup() |
| 3 | GET | /api/fmcsa/history | Fetch recent lookup history for the tenant | useFMCSAHistory(page) |
| 4 | POST | /api/fmcsa/flag | Flag a carrier from FMCSA results for compliance review | useFlagCarrier() |
| 5 | GET | /api/carriers/match?mc=X&dot=X | Check if MC/DOT already exists in system (duplicate detection) | useCarrierMatch(mc, dot) |
| 6 | POST | /api/carriers/:id/fmcsa-update | Update existing carrier's FMCSA data from lookup results | useUpdateCarrierFMCSA() |
| 7 | POST | /api/fmcsa/alerts | Create an alert rule to monitor an MC/DOT for changes | useCreateFMCSAAlert() |
| 8 | GET | /api/fmcsa/alerts | Fetch existing alert rules | useFMCSAAlerts() |

### External API Integration

| External Service | Method | Endpoint | Purpose | Auth |
|---|---|---|---|---|
| FMCSA SAFER WebAPI | GET | https://mobile.fmcsa.dot.gov/qc/services/carriers/{dotNumber} | Fetch carrier registration, authority, insurance, inspection, crash data | API Key (registered with FMCSA) |

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| fmcsa:{tenantId} | fmcsa.lookup.completed | useFMCSAHistoryUpdates() -- adds to history table |
| fmcsa:{tenantId} | fmcsa.alert.triggered | useFMCSAAlertNotification() -- shows toast if user is viewing related carrier |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 500 |
|---|---|---|---|---|---|
| GET /api/fmcsa/lookup | Show "Invalid MC/DOT number format" inline error | Redirect to login | "Access Denied" page | Show "No carrier found for MC/DOT [number]. Verify the number and try again." | Show "FMCSA service is temporarily unavailable. Please try again in a few minutes." with retry |
| POST /api/fmcsa/batch-lookup | Show validation errors (too many numbers, invalid format) | Redirect to login | "Permission Denied" toast | Show per-number results with "Not Found" entries | Show "Batch lookup partially failed. [X] of [Y] processed." |
| POST /api/carriers/:id/fmcsa-update | Show conflict errors | Redirect to login | "Permission Denied" toast | "Carrier not found" toast | Error toast with retry |

---

## 11. States & Edge Cases

### Loading State

- **Search idle:** Search input centered and prominent. No results section shown. Lookup history table visible below.
- **Loading (after search):** "Lookup" button shows spinner with text "Checking FMCSA..." Search input disabled. Below the search, show a skeleton result card (gray bars for company name, badges, tables).
- **Duration threshold:** If FMCSA API exceeds 10 seconds, show "FMCSA is responding slowly. Please wait..." message. At 30 seconds, show timeout with retry button.

### Empty States

**No results found (MC/DOT not in FMCSA database):**
- **Illustration:** Magnifying glass with question mark
- **Headline:** "No FMCSA records found for [MC/DOT number]"
- **Description:** "This number may be incorrect or not yet registered with FMCSA. Double-check the number and try again."
- **CTA:** "Try Again" -- clears input and focuses search

**First visit (no lookup history):**
- **Display:** Search section shown normally. Lookup history section shows: "No recent lookups. Search for a carrier to get started."

**Batch lookup -- all not found:**
- **Display:** Results table with all rows showing red "Not Found" badges. Summary: "0 of [X] carriers found in FMCSA database."

### Error States

**FMCSA API down / timeout:**
- **Display:** Error banner below search: red background, alert icon, "FMCSA service is currently unavailable. This is a government system and may have scheduled downtime. Please try again later." + Retry button + "Check FMCSA system status" external link

**Invalid input:**
- **Display:** Inline red error text below search input: "MC Number must be 6-7 digits" or "DOT Number must be 1-8 digits"

**Network error:**
- **Display:** Error banner: "Network error. Please check your internet connection and try again."

### Permission Denied

- **Full page denied:** "You don't have permission to perform FMCSA lookups" with link to Carriers list.
- **Partial denied:** Search available but "Add as Carrier" and "Update Existing" buttons hidden for users without carrier_create/carrier_edit permissions.

### Offline / Degraded

- **Full offline:** Show banner: "You're offline. FMCSA lookup requires an internet connection. Lookup history from previous sessions is available below."
- **FMCSA API degraded:** If API returns partial data (e.g., authority data but no insurance), render available sections and show "Some FMCSA data is unavailable" notice on missing sections.

---

## 12. Filters, Search & Sort

### Filters

FMCSA Lookup is a search tool, not a list page. The primary interaction is the search input.

| # | Filter Label | Type | Options / Values | Default | URL Param |
|---|---|---|---|---|---|
| 1 | Search Type | Radio toggle | MC Number, DOT Number | MC Number | ?type=mc or ?type=dot |
| 2 | Search Value | Text input | Numeric MC or DOT number | Empty | ?mc=789456 or ?dot=2345678 |

### Search Behavior

- **Search field:** Large, prominent input centered in the search section
- **Validates:** MC Number (6-7 digits), DOT Number (1-8 digits). Strips non-numeric characters and prefixes (MC-, DOT-)
- **Behavior:** Immediate validation on blur. Submit on Enter or button click. No auto-search (explicit action required).
- **URL param:** ?mc= or ?dot= (supports deep linking to a specific lookup)

### Sort Options (Lookup History Table)

| Column / Field | Default Direction | Sort Type |
|---|---|---|
| Date | Descending (newest first) | Date |
| Company Name | Ascending (A-Z) | Alphabetic |
| Authority Status | Custom (REVOKED first, then NOT AUTHORIZED, then AUTHORIZED) | Custom enum |

**Default sort:** Date descending (most recent lookups first)

### Saved Filters / Presets

- Not applicable for search tool. Lookup history serves as a de facto "recent searches" feature.
- URL deep linking supports bookmarking specific lookups (e.g., ?mc=789456 auto-triggers lookup on page load).

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Search section: full width, same prominence
- Results cards: authority and safety cards stack vertically (single column) instead of side by side
- Insurance table: horizontal scroll if needed
- Inspection and crash cards: stack vertically
- Lookup history: simplified table, hide "Looked Up By" column

### Mobile (< 768px)

- Search section: full width, input takes 100% width, "Lookup" button below input (full width)
- MC/DOT radio toggle: horizontal pill buttons
- Results: all cards stack in single column, full width
- Insurance table: card-based view (one card per insurance type) instead of table
- Inspection/crash data: compact card with numbers in 2x2 grid
- Action buttons (Add as Carrier, Print, Flag): sticky bottom action bar
- Lookup history: hidden on initial view, accessible via "View History" expandable section
- OOS banner: full-width, impossible to miss

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full layout with 2-column result cards |
| Desktop | 1024px - 1439px | Same layout, slightly narrower |
| Tablet | 768px - 1023px | Single column result cards |
| Mobile | < 768px | Full single column, sticky actions |

---

## 14. Stitch Prompt

```
Design an FMCSA carrier lookup tool page for a modern freight/logistics TMS called "Ultra TMS." This is a search tool used to verify carrier authority and compliance via the federal FMCSA SAFER database.

Layout: Full-width page with dark slate-900 sidebar (240px) on left, white content area on right. Breadcrumb: "Carriers > FMCSA Lookup". Page title: "FMCSA Carrier Lookup".

Search Section (prominent, centered, top of page): A white card with rounded-lg border and 32px padding, centered in the content area (max-width 640px). Inside: a radio group toggle with two options: "MC Number" (selected, blue) and "DOT Number" (unselected, gray). Below that, a large text input (height 48px, rounded-md, slate-200 border) with placeholder "Enter MC# (e.g., 789456)". Below the input, a full-width primary blue "Lookup" button (height 44px) with a search icon. Below the button, a subtle text link "Batch Lookup (multiple carriers)" in gray-500.

Results Section (shown below search, as if a lookup has been completed):

Result Header Card: White card with rounded-lg border. Show: "TransWest Logistics LLC" in text-xl semibold. Below: "DBA: TransWest" in gray-500. Below: "MC: 789456 | DOT: 2345678 | DUNS: 123456789" in monospace text. Below: "1234 Commerce Dr, Dallas, TX 75201" and "(214) 555-0100". Right side of the header card: 4 action buttons in a row: primary blue "Add as Carrier" with plus icon, secondary outlined "Update Existing" with refresh icon, secondary outlined "Print Report" with printer icon, red outlined "Flag for Review" with flag icon.

Two-Column Grid Below Header:

Left Card - "Operating Authority": White card with section title. Show a large green badge: "AUTHORIZED" with a check-circle icon. Below, list three authority types as rows:
- "Common Authority: AUTHORIZED" (green badge)
- "Contract Authority: AUTHORIZED" (green badge)
- "Broker Authority: NOT AUTHORIZED" (gray badge)

Right Card - "Safety Rating": White card with section title. Show: "Rating: SATISFACTORY" in a green badge. "Rating Date: March 15, 2023". "Review Date: June 15, 2024". Bottom: green text "Out of Service: NO" with a green shield-check icon.

Full-Width Card - "Insurance on File": White card with a data table inside. Columns: Type, Policy #, Coverage Amount, Effective Date, Expiration Date. Show 3 rows:
- BIPD | GLP-0012345 | $1,000,000 | 01/01/2026 | 01/01/2027
- Cargo | CRG-0006789 | $100,000 | 01/01/2026 | 01/01/2027
- General Liability | GL-0098765 | $2,000,000 | 01/01/2026 | 01/01/2027

Two-Column Grid Below Insurance:

Left Card - "Inspection Data": White card showing:
- "Driver Inspections: 45" with a small bar chart icon
- "Driver OOS Rate: 4.2%" in green text with "(Nat. Avg: 5.5%)" in gray
- "Vehicle Inspections: 38"
- "Vehicle OOS Rate: 12.5%" in amber text with "(Nat. Avg: 20.7%)" in gray

Right Card - "Crash Data (Last 24 months)": White card showing:
- "Total Crashes: 3"
- "Fatal: 0" in green text
- "Injury: 1" in amber text
- "Tow-Away: 2"

Lookup History Section (below all results): White card with title "Recent Lookups". Data table with columns: Date, MC #, DOT #, Company, Authority Status, Looked Up By. Show 5 rows of realistic data with green/red authority badges.

Design Specifications:
- Font: Inter, 14px base, 20px page title
- Search input: large and prominent, 48px height, with focus ring blue-500
- Authority badges: large pill badges (green for AUTHORIZED, red for REVOKED, gray for NOT AUTHORIZED, amber for PENDING)
- Safety rating: green for SATISFACTORY, amber for CONDITIONAL, red for UNSATISFACTORY
- Insurance dates: normal text, but red if expired
- OOS rates: green if below national average, amber/red if above
- Cards: white background, rounded-lg, subtle border slate-200
- Content background: gray-50
- Modern SaaS aesthetic similar to Linear.app
- The search section should feel like a clean, focused tool -- not cluttered
- Results should be organized in a clear visual hierarchy: authority status is the most prominent element
```

---

## 15. Enhancement Opportunities

### Current State (Wave 3)

**What's built and working:**
- [ ] Nothing built yet -- screen is in design phase

**What needs polish / bug fixes:**
- N/A (not yet built)

**What to add this wave:**
- [ ] MC/DOT search input with validation
- [ ] FMCSA API integration (single lookup)
- [ ] Results display: authority, safety, insurance, inspections, crashes
- [ ] "Add as Carrier" button linking to onboarding wizard
- [ ] "Update Existing" for carriers already in system
- [ ] Duplicate detection (MC/DOT cross-reference)
- [ ] Print/PDF report generation
- [ ] Lookup history log

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Single MC/DOT lookup with FMCSA API | High | High | P0 |
| Results display (authority, insurance, safety) | High | Medium | P0 |
| "Add as Carrier" with pre-filled onboarding | High | Medium | P0 |
| Duplicate detection | High | Medium | P0 |
| Out-of-service blocking | High | Low | P0 |
| Print/PDF report | Medium | Medium | P1 |
| "Update Existing" carrier data refresh | Medium | Medium | P1 |
| Lookup history log | Medium | Low | P1 |
| Batch lookup (multiple MC/DOTs) | Medium | High | P1 |
| FMCSA data change detection | Medium | High | P2 |
| Alert rules (monitor MC for changes) | Medium | High | P2 |
| Side-by-side carrier comparison from results | Low | High | P2 |

### Future Wave Preview

- **Wave 4:** Batch lookup tool for onboarding multiple carriers at once, FMCSA change monitoring alerts (daily checks with email notifications), and integration with Carrier411/RMIS for enhanced safety scoring alongside FMCSA data.
- **Wave 5:** AI-powered fraud detection that cross-references FMCSA data with carrier behavior patterns (new MC numbers, address changes matching known fraud rings, insurance policy anomalies), automated compliance re-verification on a configurable schedule (weekly/monthly), and integration with the SaferWatch API for real-time authority change notifications.

---
