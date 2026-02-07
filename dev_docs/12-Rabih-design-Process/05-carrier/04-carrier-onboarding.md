# Carrier Onboarding Wizard

> Service: 05 - Carrier Management | Wave: 3 | Priority: P0
> Route: /(dashboard)/carriers/onboard | Status: Not Started
> Primary Personas: Omar (Dispatcher), Sarah (Ops Manager), Admin
> Roles with Access: ops_manager, carrier_admin, admin

---

## 1. Purpose & Business Context

**What this screen does:**
The Carrier Onboarding Wizard is a 7-step guided workflow that takes a new motor carrier from initial identification (MC/DOT lookup) through complete compliance verification and system enrollment. Each step collects specific information, validates it in real-time, and progressively builds the carrier profile. The wizard auto-fills data from FMCSA SAFER where possible, validates insurance minimums, supports bilingual form labels (English/Spanish), and produces a fully qualified carrier record ready for compliance review.

**Business problem it solves:**
Onboarding a new carrier used to take 3-5 business days using a manual process: phone calls to collect information, back-and-forth emails for documents, manual FMCSA checks on the government website, and data entry into multiple systems. This wizard reduces onboarding to under 30 minutes of active work by auto-filling FMCSA data, providing real-time validation, enabling drag-and-drop document uploads, and creating a structured checklist that ensures nothing is missed. The 24-48 hour compliance review after submission is the only remaining delay.

**Key business rules:**
- MC# or DOT# is required to start onboarding. The system first checks FMCSA SAFER for carrier data.
- If FMCSA shows the carrier as out-of-service or with revoked authority, onboarding is blocked with a clear error message explaining why.
- "Create Manually" option is available if the carrier is not found in FMCSA (e.g., new authority, data lag).
- Auto Liability insurance must be at least $1,000,000. Cargo insurance must be at least $100,000. These are hard validations.
- Progress can be saved at any step and resumed later (draft state).
- Banking information (routing#, account#) is encrypted before storage.
- Carrier agreement must be reviewed and e-signed before submission.
- On successful submission, carrier enters PENDING status. On compliance approval, carrier moves to ACTIVE.
- Welcome email is automatically sent in the carrier's preferred language (English or Spanish) upon approval.
- Each onboarding creates a complete audit trail of who entered what and when.

**Success metric:**
Carrier onboarding completion time drops from 3-5 business days to under 30 minutes of active work. Onboarding abandonment rate stays below 15%. First-time compliance pass rate exceeds 85%.

---

## 2. User Journey Context

**Comes from (entry points):**

| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Carriers List | Clicks "+ Add Carrier" button | None (or MC# from quick-add dialog) |
| Carrier Dashboard | Clicks "Onboard New Carrier" button | None |
| Sidebar Navigation | Clicks "Carriers" > "Onboard New" | None |
| MC Lookup Dialog | Enters MC# in quick-add, clicks "Start Onboarding" | `?mc={mcNumber}` (pre-fills Step 1) |
| Direct URL | Bookmark / shared link to resume draft | `?draftId={draftId}` to resume saved progress |

**Goes to (exit points):**

| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Carrier Detail | After successful submission, clicks "View Carrier" | `carrierId` (newly created) |
| Carriers List | Clicks "Back to Carriers" or "Save & Exit" | None (draft saved if in progress) |
| Carrier Onboarding (resume) | Returns later to complete saved draft | `draftId` |

**Primary trigger:**
Omar has a load that needs a carrier he hasn't worked with before. The carrier's dispatch gives him their MC#. Omar clicks "Add Carrier" from the carriers list, enters the MC#, and the onboarding wizard auto-fills the carrier's FMCSA data so he can complete onboarding quickly and get the carrier approved for dispatch.

**Success criteria (user completes the screen when):**
- All 7 steps are completed with valid data.
- All required documents are uploaded (W-9, insurance certificates).
- Insurance meets minimum coverage thresholds.
- Carrier agreement is e-signed.
- Submission for review is confirmed and carrier enters PENDING status.

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------+
|  Breadcrumb: Carriers > Onboard New Carrier                      |
+------------------------------------------------------------------+
|  Wizard Progress Bar                                              |
|  [1.MC/DOT] > [2.Company] > [3.Contacts] > [4.Equipment] >     |
|  [5.Insurance] > [6.Payment] > [7.Review]                       |
|  Progress: ============---------- 57% complete                    |
+------------------------------------------------------------------+
|  Step Title: "Step 3: Contacts"                                   |
|  Step Description: "Add dispatch and primary contacts..."         |
+------------------------------------------------------------------+
|  +------------------------------------------------------------+  |
|  |  Step Content Area                                          |  |
|  |                                                             |  |
|  |  [Form fields specific to current step]                     |  |
|  |                                                             |  |
|  |  Two-column layout for form fields where appropriate        |  |
|  |                                                             |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
|  Footer Actions:                                                  |
|  [Save & Exit]     [< Previous]     [Next Step >]                |
|                    [Language: English | Spanish toggle]            |
+------------------------------------------------------------------+
```

### Step-Specific Layouts

**Step 1: MC/DOT Lookup**
```
+------------------------------------------------------------+
|  "Enter the carrier's MC or DOT number"                     |
|                                                             |
|  [MC Number: ___________]  OR  [DOT Number: ___________]  |
|  [Look Up Carrier] button                                   |
|                                                             |
|  --- FMCSA Results Card (after lookup) ---                 |
|  Legal Name: Swift Logistics LLC                            |
|  Authority Status: ACTIVE (green badge)                     |
|  Safety Rating: SATISFACTORY                                |
|  Insurance on File: Yes                                     |
|  OOS Rate: 2.1% (Driver) / 1.8% (Vehicle)                 |
|  [Use This Carrier ->]  [Not the right carrier? Search again]|
|                                                             |
|  --- OR Error State ---                                     |
|  "Carrier MC-999999 is OUT OF SERVICE. Cannot onboard."    |
|  [red alert box]                                            |
|                                                             |
|  --- OR Not Found ---                                       |
|  "No carrier found for MC-111111 in FMCSA."               |
|  [Create Manually] link                                     |
+------------------------------------------------------------+
```

**Steps 2-6: Standard Form Layout**
```
+---------------------------+ +---------------------------+
|  Field Group A             | | Field Group B              |
|  [Label] [Input ______]  | | [Label] [Input ______]   |
|  [Label] [Input ______]  | | [Label] [Input ______]   |
|  [Label] [Input ______]  | | [Label] [Select v_____]  |
+---------------------------+ +---------------------------+
```

**Step 7: Review & Submit**
```
+------------------------------------------------------------+
|  Review Summary (accordion sections)                        |
|  [v] 1. MC/DOT: MC-123456 / DOT 1234567          [Edit]   |
|  [v] 2. Company: Swift Logistics LLC               [Edit]  |
|  [v] 3. Contacts: 3 contacts added                 [Edit]  |
|  [v] 4. Equipment: Dry Van, Reefer (45 trucks)    [Edit]  |
|  [v] 5. Insurance: Auto $1.5M, Cargo $250K        [Edit]  |
|  [v] 6. Payment: NET30, Direct Deposit             [Edit]  |
|  ---------------------------------------------------------  |
|  Compliance Checklist:                                      |
|  [x] FMCSA Authority: ACTIVE                               |
|  [x] Auto Liability: $1,500,000 (meets $1M min)           |
|  [x] Cargo Insurance: $250,000 (meets $100K min)          |
|  [x] W-9 Uploaded                                           |
|  [x] Carrier Agreement Signed                               |
|  [ ] Workers Compensation (optional)                        |
|  ---------------------------------------------------------  |
|  [Submit for Review]                                        |
|  Expected review: 24-48 hours                               |
+------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** | Step progress indicator, current step form fields, validation errors | User must know where they are and what is required |
| **Secondary** | FMCSA auto-filled data, step descriptions, field help text | Context and guidance to complete the form |
| **Tertiary** | Previous step summaries, optional fields, bilingual toggle | Helpful but not blocking |
| **Hidden** | Full FMCSA raw data, encryption details, audit trail | Technical details not needed during onboarding |

---

## 4. Data Fields & Display

### Step 1: MC/DOT Lookup

| # | Field Label | Source / Target | Format / Validation | Required? |
|---|---|---|---|---|
| 1 | MC Number | Input -> FMCSA API -> Carrier.mcNumber | Numeric, 1-8 digits. "MC-" prefix auto-added. | Yes (or DOT#) |
| 2 | DOT Number | Input -> FMCSA API -> Carrier.dotNumber | Numeric, 1-8 digits. | Yes (or MC#) |
| 3 | FMCSA Legal Name | FMCSA API response (read-only display) | Text | Auto-filled |
| 4 | Authority Status | FMCSA API response | Badge: ACTIVE (green), INACTIVE (gray), REVOKED (red), OUT_OF_SERVICE (red) | Auto-filled |
| 5 | Safety Rating | FMCSA API response | SATISFACTORY / CONDITIONAL / UNSATISFACTORY / NOT RATED | Auto-filled |
| 6 | Insurance on File | FMCSA API response | Yes/No | Auto-filled |
| 7 | OOS Rate (Driver) | FMCSA API response | Percentage | Auto-filled |
| 8 | OOS Rate (Vehicle) | FMCSA API response | Percentage | Auto-filled |

### Step 2: Company Info

| # | Field Label | Target (Entity.field) | Format / Validation | Required? |
|---|---|---|---|---|
| 9 | Legal Name | Carrier.legalName | Text, max 200 chars. Auto-filled from FMCSA. | Yes |
| 10 | DBA Name | Carrier.dbaName | Text, max 200 chars | No |
| 11 | Physical Address Line 1 | Carrier.physicalAddress1 | Text, max 100 chars | Yes |
| 12 | Physical Address Line 2 | Carrier.physicalAddress2 | Text, max 100 chars | No |
| 13 | City | Carrier.physicalCity | Text | Yes |
| 14 | State | Carrier.physicalState | US state select dropdown | Yes |
| 15 | ZIP Code | Carrier.physicalZip | 5-digit or ZIP+4 format | Yes |
| 16 | Primary Phone | Carrier.primaryPhone | (XXX) XXX-XXXX format, auto-format on input | Yes |
| 17 | Primary Email | Carrier.primaryEmail | Valid email format | Yes |
| 18 | Website | Carrier.website | URL format (https:// auto-prepended) | No |
| 19 | Tax ID (EIN) | Carrier.taxId | XX-XXXXXXX format | Yes |
| 20 | W-9 Upload | CarrierDocuments (type=W9) | PDF or image, max 10MB | Yes |

### Step 3: Contacts

| # | Field Label | Target | Format / Validation | Required? |
|---|---|---|---|---|
| 21 | Dispatch Contact Name | CarrierContacts.name (role=dispatch) | Text | Yes |
| 22 | Dispatch Contact Phone | CarrierContacts.phone | (XXX) XXX-XXXX | Yes |
| 23 | Dispatch Contact Email | CarrierContacts.email | Email format | Yes |
| 24 | Primary Contact Name | CarrierContacts.name (role=primary) | Text | Yes |
| 25 | Primary Contact Phone | CarrierContacts.phone | (XXX) XXX-XXXX | Yes |
| 26 | Primary Contact Email | CarrierContacts.email | Email format | Yes |
| 27 | After-Hours Contact Name | CarrierContacts.name (role=after_hours) | Text | No |
| 28 | After-Hours Contact Phone | CarrierContacts.phone | (XXX) XXX-XXXX | Required if name provided |
| 29 | After-Hours Contact Email | CarrierContacts.email | Email format | No |
| 30 | Preferred Language | Carrier.preferredLanguage | Select: English / Espanol | Yes (default: English) |

### Step 4: Equipment & Service

| # | Field Label | Target | Format / Validation | Required? |
|---|---|---|---|---|
| 31 | Equipment Types | Carrier.equipmentTypes | Multi-select visual cards with icons. At least 1 required. | Yes |
| 32 | Truck Count | Carrier.truckCount | Positive integer | Yes |
| 33 | Trailer Count | Carrier.trailerCount | Positive integer | No |
| 34 | Service Area States | Carrier.serviceAreaStates | US state multi-select with interactive map. At least 1 required. | Yes |
| 35 | Preferred Lanes | Carrier.preferredLanes | Origin state -> Destination state pairs. Add/remove rows. | No |

### Step 5: Insurance

| # | Field Label | Target | Format / Validation | Required? |
|---|---|---|---|---|
| 36 | Auto Liability Policy # | InsuranceCertificates.policyNumber (type=AUTO_LIABILITY) | Text | Yes |
| 37 | Auto Liability Provider | InsuranceCertificates.provider | Text | Yes |
| 38 | Auto Liability Coverage | InsuranceCertificates.coverageAmount | Currency, minimum $1,000,000. Red validation if below. | Yes |
| 39 | Auto Liability Effective | InsuranceCertificates.effectiveDate | Date picker, must be <= today | Yes |
| 40 | Auto Liability Expiry | InsuranceCertificates.expiryDate | Date picker, must be > today | Yes |
| 41 | Auto Liability Certificate | InsuranceCertificates.certificateUrl | PDF upload, max 10MB | Yes |
| 42 | Cargo Policy # | InsuranceCertificates.policyNumber (type=CARGO) | Text | Yes |
| 43 | Cargo Provider | InsuranceCertificates.provider | Text | Yes |
| 44 | Cargo Coverage | InsuranceCertificates.coverageAmount | Currency, minimum $100,000 | Yes |
| 45 | Cargo Effective | InsuranceCertificates.effectiveDate | Date | Yes |
| 46 | Cargo Expiry | InsuranceCertificates.expiryDate | Date, must be > today | Yes |
| 47 | Cargo Certificate | InsuranceCertificates.certificateUrl | PDF upload | Yes |
| 48 | General Liability | InsuranceCertificates (type=GENERAL_LIABILITY) | All fields optional | No |
| 49 | Workers Compensation | InsuranceCertificates (type=WORKERS_COMP) | All fields optional | No |

### Step 6: Payment Setup

| # | Field Label | Target | Format / Validation | Required? |
|---|---|---|---|---|
| 50 | Payment Terms | Carrier.paymentTerms | Select: Quick Pay / NET15 / NET30 | Yes |
| 51 | Bank Name | Carrier.bankName | Text | Yes (for direct deposit) |
| 52 | Routing Number | Carrier.bankRoutingNumber | 9-digit numeric, ABA validation | Yes |
| 53 | Account Number | Carrier.bankAccountNumber | Numeric, 4-17 digits | Yes |
| 54 | Factoring Company Name | Carrier.factoringCompanyName | Text | No |
| 55 | Direct Deposit Auth | Carrier.directDepositAuthorized | Checkbox | Yes |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Completion Percentage | (completed steps / total steps) * 100 | Progress bar percentage |
| 2 | Insurance Compliance | Auto Liability >= $1M AND Cargo >= $100K AND both not expired | Pass (green) / Fail (red) |
| 3 | FMCSA Compliance | Authority = ACTIVE AND not out-of-service | Pass (green) / Fail (red) / Block (red with error) |
| 4 | Overall Ready Status | All required fields filled AND all compliance checks pass | Ready to Submit (green) / Not Ready (gray) |

---

## 5. Features

### Core Features (Must-Have for MVP)

- [ ] 7-step wizard with progress indicator showing step names and completion %
- [ ] Step 1: MC/DOT lookup with FMCSA SAFER auto-fill
- [ ] Step 1: Out-of-service blocking (cannot proceed if FMCSA shows OOS/revoked)
- [ ] Step 1: "Create Manually" fallback when carrier not in FMCSA
- [ ] Step 2: Company information form with FMCSA auto-fill where possible
- [ ] Step 2: W-9 upload (drag-and-drop or file browse)
- [ ] Step 3: Dispatch, primary, and after-hours contact forms
- [ ] Step 3: Preferred language selector (English/Spanish)
- [ ] Step 4: Equipment type multi-select with visual cards/icons
- [ ] Step 4: Service area US state multi-select
- [ ] Step 4: Preferred lanes editor (origin -> destination pairs)
- [ ] Step 5: Insurance certificate forms with real-time minimum amount validation
- [ ] Step 5: Insurance certificate PDF upload (drag-and-drop)
- [ ] Step 6: Payment terms selection and banking information
- [ ] Step 6: Banking info encryption on submit
- [ ] Step 7: Full review summary with edit links per section
- [ ] Step 7: Compliance checklist showing pass/fail per requirement
- [ ] Step 7: "Submit for Review" with confirmation
- [ ] Save progress at any step (resume later from draft)
- [ ] Forward/backward navigation between steps
- [ ] Required vs optional field indicators (asterisk for required)
- [ ] Client-side validation with inline error messages

### Advanced Features (Logistics Expert Recommendations)

- [ ] Bilingual form labels toggle (English/Spanish) for all form fields and instructions
- [ ] OCR auto-fill from uploaded insurance certificates (future iteration -- extract policy#, provider, coverage, dates)
- [ ] Carrier agreement e-signature embedded in Step 7 (DocuSign or similar integration)
- [ ] Welcome email auto-sent in carrier's preferred language upon approval
- [ ] Drag-and-drop document upload zones with file type validation and preview
- [ ] Progress saved automatically every 30 seconds (auto-save)
- [ ] Step completion validation before advancing (cannot skip to Step 5 without completing 1-4)
- [ ] Truck count and equipment type suggestions based on FMCSA data
- [ ] Interactive US map for service area selection (click states to toggle)
- [ ] Lane suggestion engine: based on carrier's physical address and equipment, suggest common lanes
- [ ] Duplicate carrier detection: if MC# or DOT# already exists in system, warn user and link to existing carrier
- [ ] Resume onboarding from email link (saved drafts accessible via unique URL)
- [ ] Onboarding analytics: track step-by-step completion rates and abandonment points

### Conditional / Role-Based Features

| Feature | Required Role | Required Permission | Behavior if No Access |
|---|---|---|---|
| Access onboarding wizard | ops_manager, carrier_admin, admin | carrier_create | Full page access denied |
| Skip FMCSA check (manual create) | carrier_admin, admin | carrier_manual_create | "Create Manually" link hidden |
| Override insurance minimums | admin | compliance_override | Cannot submit below minimums |
| Access saved drafts | ops_manager, carrier_admin, admin | carrier_create | Cannot see or resume others' drafts |
| Approve onboarded carrier | carrier_admin, admin | carrier_approve | N/A (separate approval flow) |

---

## 6. Status & State Machine

### Onboarding Draft Status

```
[NOT_STARTED] ---(Enter MC#)---> [STEP_1_COMPLETE]
    |
    v
[STEP_1_COMPLETE] ---(Fill company info)---> [STEP_2_COMPLETE]
    |
    v
[STEP_2_COMPLETE] ---(Add contacts)---> [STEP_3_COMPLETE]
    |
    v
...continues through all 7 steps...
    |
    v
[STEP_7_REVIEW] ---(Submit for Review)---> [SUBMITTED]
    |
    v
[SUBMITTED] ---(Compliance Approval)---> Carrier.status = ACTIVE
[SUBMITTED] ---(Compliance Rejection)---> Carrier.status = INACTIVE + notification
```

### Draft Save States

| State | Description | Actions Available |
|---|---|---|
| DRAFT | In-progress, not all steps complete | Resume, Delete Draft |
| COMPLETE_PENDING_SUBMIT | All steps complete, not yet submitted | Resume (go to Step 7), Submit, Delete Draft |
| SUBMITTED | Submitted for compliance review | View Only (cannot edit), Cancel Submission |
| APPROVED | Compliance approved, carrier is ACTIVE | N/A (no longer in onboarding) |
| REJECTED | Compliance rejected | Edit and Resubmit, Delete |

### Carrier Status Post-Submission

| Event | Carrier Status | Next Action |
|---|---|---|
| Submission complete | PENDING | Compliance team reviews |
| Compliance approved | ACTIVE | Welcome email sent, carrier available for dispatch |
| Compliance rejected | INACTIVE | Rejection reason sent, carrier can be re-onboarded |

### Status Badge Colors (onboarding context)

| Status | Color | Tailwind |
|---|---|---|
| DRAFT | gray-100 / gray-700 | `bg-gray-100 text-gray-700` |
| SUBMITTED | blue-100 / blue-800 | `bg-blue-100 text-blue-800` |
| UNDER_REVIEW | purple-100 / purple-800 | `bg-violet-100 text-violet-800` |
| APPROVED | emerald-100 / emerald-800 | `bg-emerald-100 text-emerald-800` |
| REJECTED | red-100 / red-800 | `bg-red-100 text-red-800` |

---

## 7. Actions & Interactions

### Primary Action Buttons (Footer Bar)

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| Next Step | ArrowRight | Primary / Blue | Validate current step, save, advance to next | No (validates first) |
| Previous | ArrowLeft | Secondary / Outline | Save current step, go back to previous | No |
| Save & Exit | Save | Ghost / Text | Save current progress as draft, navigate to carriers list | No |
| Submit for Review | Send | Primary / Blue (Step 7 only) | Submit completed onboarding for compliance review | Yes -- "Submit [carrier name] for compliance review? Expected review: 24-48 hours." |

### Step-Specific Actions

**Step 1:**
| Action | Description | Condition |
|---|---|---|
| Look Up Carrier | Triggers FMCSA API call with entered MC# or DOT# | MC# or DOT# field has value |
| Use This Carrier | Accepts FMCSA result and advances to Step 2 | FMCSA result is not OOS/revoked |
| Create Manually | Skips FMCSA auto-fill, creates blank form | Carrier not found in FMCSA, admin permission |
| Search Again | Clears results, allows new MC#/DOT# entry | After a lookup |

**Step 2:**
| Action | Description | Condition |
|---|---|---|
| Upload W-9 | Opens file dialog or drag-drop zone | Always available |
| Preview W-9 | Opens uploaded PDF in viewer | W-9 uploaded |
| Remove W-9 | Removes uploaded file | W-9 uploaded |

**Step 4:**
| Action | Description | Condition |
|---|---|---|
| Toggle State (on map) | Click state on US map to add/remove from service area | Interactive map loaded |
| Add Lane | Add origin -> destination pair row | Always available |
| Remove Lane | Remove lane pair row | At least 1 lane exists |

**Step 5:**
| Action | Description | Condition |
|---|---|---|
| Upload Certificate | Drag-drop or browse for insurance PDF | Per insurance type |
| Preview Certificate | Opens uploaded PDF viewer | Certificate uploaded |
| Add Optional Insurance | Shows additional insurance form (General Liability or Workers Comp) | Clicking "+ Add Insurance" |

**Step 7:**
| Action | Description | Condition |
|---|---|---|
| Edit Section | Jump back to the corresponding step to edit | Click "Edit" next to any section |
| Sign Agreement | Opens e-signature dialog for carrier agreement | Carrier agreement not yet signed |
| Submit for Review | Final submission | All required checks pass |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl/Cmd + Enter | Advance to next step (same as "Next Step" button) |
| Ctrl/Cmd + S | Save current progress |
| Escape | Cancel and return to carriers list (with save prompt) |
| Alt + L | Toggle language (English/Spanish) |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| PDF/image file from desktop | W-9 upload zone (Step 2) | Upload as W-9 document |
| PDF file from desktop | Insurance certificate zone (Step 5) | Upload as insurance certificate |
| PDF/image from desktop | Any document upload zone | Upload with type auto-detection |

---

## 8. Real-Time Features

### WebSocket Events

| Event Name | Payload | UI Update |
|---|---|---|
| onboarding.draftSaved | { draftId, step, savedBy } | Show "Draft saved" confirmation toast (if auto-save) |
| carrier.fmcsaLookupComplete | { mcNumber, result } | Display FMCSA results card in Step 1 |
| carrier.onboardingSubmitted | { carrierId, submittedBy } | Show success screen with carrier ID and expected timeline |
| carrier.onboardingApproved | { carrierId } | If user is still on confirmation page, update status to APPROVED |
| carrier.onboardingRejected | { carrierId, reason } | If user is still on confirmation page, show rejection with reason |

### Live Update Behavior

- **Update frequency:** FMCSA lookup is synchronous (request/response). Draft auto-save every 30 seconds. All other updates are event-driven.
- **Visual indicator:** "Saving..." indicator in footer during auto-save. "Last saved: 2 minutes ago" timestamp.
- **Conflict handling:** If two users try to edit the same draft simultaneously, second user sees: "This onboarding is being edited by [name]. You can view it in read-only mode."

### Polling Fallback

- **When:** WebSocket connection drops
- **Interval:** Draft auto-save triggers POST every 30 seconds regardless of WebSocket status
- **Endpoint:** `POST /api/carriers/onboarding/draft`
- **Visual indicator:** "Auto-saving..." in footer

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Save step | Show "Saved" indicator immediately | Show "Save failed" error, data retained in form |
| Upload document | Show file in upload zone with progress bar | Remove file, show "Upload failed" toast |
| FMCSA lookup | Show loading spinner | Show "FMCSA lookup failed" error with retry |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| PageHeader | `src/components/layout/page-header.tsx` | title: "Onboard New Carrier", breadcrumbs |
| Input | `src/components/ui/input.tsx` | All text inputs |
| Select | `src/components/ui/select.tsx` | State, payment terms, language dropdowns |
| Button | `src/components/ui/button.tsx` | Navigation, submit, upload buttons |
| Card | `src/components/ui/card.tsx` | Step content containers, FMCSA results card |
| Badge | `src/components/ui/badge.tsx` | FMCSA status badges, compliance check badges |
| Dialog | `src/components/ui/dialog.tsx` | Submit confirmation, e-signature |
| FileUpload | `src/components/ui/file-upload.tsx` | W-9 upload, insurance certificate upload |
| Checkbox | `src/components/ui/checkbox.tsx` | Direct deposit authorization, agreement checkbox |
| Label | `src/components/ui/label.tsx` | Form field labels |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| FileUpload | Basic file selection | Add drag-and-drop zone with visual feedback, file type validation, upload progress, preview |
| Select | Single select only | Add multi-select variant with search for equipment types and states |
| Input | Basic text input | Add phone format auto-masking, currency format, EIN format |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| WizardStepper | 7-step horizontal progress bar with step names, icons, active/complete/upcoming states, completion percentage | Medium |
| WizardStepLayout | Container for each step with title, description, form content, and footer navigation | Medium |
| FMCSALookupPanel | MC/DOT input with lookup button, results card showing authority/safety/insurance/OOS data | Medium |
| FMCSABlockedAlert | Red alert banner when carrier is OOS or revoked, blocking onboarding | Small |
| EquipmentTypeCards | Visual card grid for equipment type multi-select: each card has icon, name, checkbox | Medium |
| ServiceAreaMapSelector | Interactive US state map with click-to-select, selected states highlighted | High |
| LanePreferenceEditor | Dynamic form rows: [Origin State v] -> [Dest State v] with add/remove | Medium |
| InsuranceCertificateForm | Form group per insurance type: policy#, provider, coverage (with min validation), dates, upload | Medium |
| CoverageAmountInput | Currency input with minimum threshold validation (shows red if below minimum) | Small |
| PaymentTermsSelector | Radio cards: Quick Pay, NET15, NET30 with descriptions | Small |
| OnboardingReviewSummary | Accordion/collapsible review of all 7 steps with edit links, compliance checklist | Medium |
| ComplianceChecklistReview | Checklist showing pass/fail for each compliance requirement with icons | Small |
| BilingualToggle | English/Spanish toggle that switches all form labels, help text, and instructions | Medium |
| DraftResumePrompt | Modal/banner prompting user to resume a saved draft when entering onboarding | Small |
| ESignatureEmbed | Embedded e-signature component for carrier agreement signing | High |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Progress | progress | Step completion progress bar |
| RadioGroup | radio-group | Payment terms selection |
| Accordion | accordion | Review step collapsible sections |
| Calendar | calendar | Insurance effective/expiry date pickers |
| Popover | popover | Date picker wrappers |
| Alert | alert | FMCSA blocked warnings, validation errors |
| Separator | separator | Form section dividers |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | POST | /api/carriers/fmcsa/lookup | Lookup carrier by MC# or DOT# | useFmcsaLookup() |
| 2 | POST | /api/carriers/onboarding/draft | Save onboarding draft (create or update) | useSaveOnboardingDraft() |
| 3 | GET | /api/carriers/onboarding/draft/:draftId | Load saved draft for resume | useOnboardingDraft(draftId) |
| 4 | GET | /api/carriers/onboarding/drafts | List user's saved drafts | useMyOnboardingDrafts() |
| 5 | DELETE | /api/carriers/onboarding/draft/:draftId | Delete saved draft | useDeleteOnboardingDraft() |
| 6 | POST | /api/carriers/onboarding/submit | Submit completed onboarding for review | useSubmitOnboarding() |
| 7 | POST | /api/carriers/onboarding/documents | Upload document during onboarding | useUploadOnboardingDocument() |
| 8 | GET | /api/carriers/check-duplicate | Check if MC# or DOT# already exists | useCheckDuplicateCarrier() |
| 9 | GET | /api/reference/equipment-types | Get equipment type reference data | useEquipmentTypes() |
| 10 | GET | /api/reference/us-states | Get US states list | useUSStates() |

### Request/Response Examples

**POST /api/carriers/fmcsa/lookup:**
```json
{ "mcNumber": "123456" }
// OR
{ "dotNumber": "1234567" }
```

**Response (success):**
```json
{
  "found": true,
  "data": {
    "legalName": "Swift Logistics LLC",
    "dbaName": "Swift Logistics",
    "mcNumber": "123456",
    "dotNumber": "1234567",
    "authorityStatus": "ACTIVE",
    "safetyRating": "SATISFACTORY",
    "insuranceOnFile": true,
    "oosRateDriver": 2.1,
    "oosRateVehicle": 1.8,
    "physicalAddress": { ... },
    "phone": "(555) 123-4567"
  }
}
```

**Response (out of service):**
```json
{
  "found": true,
  "blocked": true,
  "reason": "OUT_OF_SERVICE",
  "data": { ... }
}
```

### Real-Time Event Subscriptions

| Event Channel | Event Name | Handler / Hook |
|---|---|---|
| onboarding:{draftId} | draft.saved | useOnboardingUpdates() -- confirms save success |
| onboarding:{draftId} | draft.conflict | useOnboardingUpdates() -- alerts of concurrent edit |
| carriers:{tenantId} | carrier.onboardingApproved | useOnboardingResult() -- shows approval if on confirm page |
| carriers:{tenantId} | carrier.onboardingRejected | useOnboardingResult() -- shows rejection if on confirm page |

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 500 |
|---|---|---|---|---|---|
| POST /api/carriers/fmcsa/lookup | "Invalid MC/DOT number format" | Redirect to login | "Permission Denied" | "Carrier not found in FMCSA" (handled gracefully) | "FMCSA service unavailable. Try again later." |
| POST /api/carriers/onboarding/draft | "Validation errors" with field-level details | Redirect to login | "Permission Denied" | N/A | "Could not save draft. Your data is preserved in the form." |
| POST /api/carriers/onboarding/submit | "Missing required fields" with checklist | Redirect to login | "Permission Denied" | N/A | "Submission failed. Your data is saved as a draft." |

---

## 11. States & Edge Cases

### Loading State

- **Initial load:** Show wizard stepper skeleton (7 gray circles) and form skeleton for Step 1 (MC/DOT input fields).
- **FMCSA lookup:** Show loading spinner on the "Look Up Carrier" button and a "Searching FMCSA database..." message below the input. Takes 2-5 seconds.
- **Draft resume:** Show "Loading your saved progress..." with progress bar. Pre-fill all completed steps.
- **File upload:** Show upload progress bar within the drop zone. Show file name with checkmark when complete.

### Empty States

**First-time (no drafts):**
- Start fresh at Step 1 with empty MC/DOT input
- Helpful tooltip: "Enter the carrier's MC or DOT number to begin"

**FMCSA not found:**
- **Display:** Info box: "No carrier found for MC-[number] in the FMCSA database. This may be a new authority or the number may be incorrect."
- **Actions:** "Search Again" button + "Create Manually" link (if authorized)

**No optional contacts/lanes:**
- Show placeholder text: "No after-hours contact added. You can add one later from the carrier profile."
- Do not block progression for optional fields.

### Error States

**FMCSA blocked (out of service):**
- **Display:** Red alert banner: "This carrier (MC-[number]) has an OUT OF SERVICE status with the FMCSA. Onboarding cannot proceed until the carrier resolves their authority issues." Cannot advance past Step 1.

**Insurance below minimum:**
- **Display:** Red inline validation on the coverage amount field: "Auto Liability must be at least $1,000,000. Current: $500,000." Prevents advancing from Step 5.

**Duplicate carrier:**
- **Display:** Warning banner: "A carrier with MC# [number] already exists in your system: [carrier name] ([status]). [View Existing Carrier]" User can proceed only with admin override.

**Upload failure:**
- **Display:** Red text below upload zone: "Upload failed. Please try again." File is removed from the zone. Retry button available.

**Draft save failure:**
- **Display:** Toast: "Could not save your progress. Your data is preserved in the form. We'll retry in 30 seconds." Yellow warning indicator in footer.

**Submission failure:**
- **Display:** Toast: "Submission failed. Your data has been saved as a draft. Please try again." User remains on Step 7.

### Permission Denied

- **Full page denied:** "You don't have permission to onboard carriers" with link to carriers list
- **Manual create denied:** "Create Manually" link hidden for non-admin users
- **Override denied:** Insurance minimum override not available for non-admin users

### Offline / Degraded

- **Full offline:** Banner: "You're offline. Form data is saved locally and will be uploaded when reconnected. Some features (FMCSA lookup, document upload) require an internet connection."
- **FMCSA unavailable:** "FMCSA lookup service is currently unavailable. You can continue with manual entry or try again later."

---

## 12. Filters, Search & Sort

### Filters

N/A -- The onboarding wizard is a sequential form, not a list view. No filters apply.

### Search Behavior

**Step 1 -- MC/DOT Lookup:** The MC# or DOT# input functions as a search field that queries the FMCSA SAFER API. No debounce (explicit "Look Up" button click required).

**Step 4 -- Service Area State Selection:** The state multi-select supports search/typeahead to quickly find states by name or abbreviation.

**Step 4 -- Equipment Type:** Equipment cards can be filtered by typing (search within the card grid).

### Sort Options

N/A -- Form wizard has fixed step order. No user-configurable sorting.

### Saved Filters / Presets

N/A -- Saved drafts function as the wizard's "bookmark" mechanism. Drafts are listed in a resume dialog when entering the onboarding wizard with incomplete drafts.

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Wizard stepper: Horizontal but with abbreviated step names (e.g., "1.MC" instead of "1.MC/DOT Lookup")
- Form fields: Two-column layout becomes single column for narrower groups
- Equipment cards: 3 per row instead of 4
- Service area map: Slightly smaller but still interactive
- Footer actions: All three buttons visible (Save & Exit, Previous, Next)

### Mobile (< 768px)

- Wizard stepper: Replace horizontal stepper with a compact progress bar showing step number + name ("Step 3 of 7: Contacts") and numeric progress ("57% complete")
- Form fields: All single column, full width
- Equipment cards: 2 per row
- Service area map: Replace with searchable state dropdown (no map)
- Lane editor: Stack origin/destination dropdowns vertically
- Insurance forms: Collapsible sections per insurance type
- Upload zones: Full-width drag-drop areas
- Footer: Sticky bottom bar with Previous/Next, Save & Exit accessible from hamburger/more menu
- Bilingual toggle: In header area
- Step 7 Review: Accordion sections collapsed by default, tap to expand

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full horizontal stepper, 2-column forms, interactive map, 4-card equipment grid |
| Desktop | 1024px - 1439px | Full horizontal stepper, 2-column forms, smaller map |
| Tablet | 768px - 1023px | Abbreviated stepper, mixed 1-2 column forms |
| Mobile | < 768px | Progress bar only, 1-column everything, no map |

---

## 14. Stitch Prompt

```
Design a multi-step carrier onboarding wizard for a modern freight/logistics TMS (Transportation Management System) called "Ultra TMS."

Layout: Full-width page with a dark slate-900 sidebar on the left (240px, collapsed), white content area. Top has breadcrumb "Carriers > Onboard New Carrier".

Wizard Progress Bar: Below the header, a horizontal 7-step progress indicator showing:
- Step 1: "MC/DOT Lookup" (completed, green circle with checkmark)
- Step 2: "Company Info" (completed, green circle with checkmark)
- Step 3: "Contacts" (completed, green circle with checkmark)
- Step 4: "Equipment & Service" (completed, green circle with checkmark)
- Step 5: "Insurance" (current step, blue filled circle with "5")
- Step 6: "Payment" (upcoming, gray circle with "6")
- Step 7: "Review" (upcoming, gray circle with "7")
Connected by lines: green for completed segments, blue for current, gray for upcoming.
Below the stepper: "Progress: 71% complete" with a blue progress bar.

Step Content Area: Show Step 5 "Insurance" active. Title: "Step 5: Insurance Certificates" with description "Upload your insurance certificates. Auto Liability ($1M min) and Cargo ($100K min) are required."

Insurance Form: Two sections side by side in cards:

Left card - "Auto Liability Insurance (Required)":
- "Policy Number" text input filled with "AL-2026-0789"
- "Insurance Provider" text input filled with "Progressive Commercial"
- "Coverage Amount" currency input showing "$1,500,000" with green checkmark and helper text "Minimum: $1,000,000"
- "Effective Date" date picker showing "01/15/2026"
- "Expiry Date" date picker showing "01/15/2027"
- Upload zone: dashed border rectangle with upload cloud icon, text "Drag & drop certificate PDF here or click to browse", showing an uploaded file "auto_liability_cert.pdf (2.3 MB)" with green checkmark and "Remove" link

Right card - "Cargo Insurance (Required)":
- "Policy Number" text input filled with "CG-2026-0456"
- "Insurance Provider" text input filled with "National Interstate"
- "Coverage Amount" currency input showing "$250,000" with green checkmark and helper text "Minimum: $100,000"
- "Effective Date" date picker showing "02/01/2026"
- "Expiry Date" date picker showing "02/01/2027"
- Upload zone: similar to left, showing uploaded "cargo_cert.pdf (1.8 MB)"

Below the two cards: "+ Add General Liability Insurance" and "+ Add Workers Compensation" as blue text links with plus icons.

Footer Bar: Fixed at bottom of the content area with:
- Left: "Save & Exit" ghost/text button
- Center: Language toggle showing "EN | ES" segmented control
- Right: "< Previous" outline button and "Next Step >" primary blue button

Design Specifications:
- Font: Inter or system sans-serif, 14px base, step titles 18px bold
- Sidebar: slate-900 background, white text, blue-600 active indicator
- Content background: gray-50 for page, white for cards
- Primary color: blue-600 for buttons, active step, links
- Step circles: 32px diameter, green-500 for complete (with white checkmark), blue-600 for current (with white number), gray-300 for upcoming (with gray-500 number)
- Progress bar: blue-600 fill, gray-200 track, rounded-full
- Form inputs: border-gray-300, focus:border-blue-500, rounded-md, height 40px
- Upload zones: dashed border-2 border-gray-300, rounded-lg, hover:border-blue-400, bg-gray-50
- Required field indicators: red asterisk after label
- Validation: green checkmark for valid fields, red text for errors
- Cards: white background, rounded-lg, shadow-sm
- Footer: white background, border-t border-gray-200, sticky bottom
- Modern SaaS aesthetic similar to Linear.app or Stripe onboarding

Include: the progress percentage below the stepper, required field asterisks, inline validation indicators (green checks for valid amounts above minimum), drag-and-drop upload zones with uploaded file previews, and the bilingual toggle in the footer.
```

---

## 15. Enhancement Opportunities

### Current State (Wave 3)

**What's built and working:**
- [ ] Nothing -- onboarding wizard is not started

**What needs polish / bug fixes:**
- N/A (not built yet)

**What to add this wave:**
- [ ] 7-step wizard UI with progress stepper
- [ ] Step 1: FMCSA MC/DOT lookup with auto-fill
- [ ] Step 1: OOS blocking and "create manually" fallback
- [ ] Step 2: Company info form with validation
- [ ] Step 2: W-9 upload
- [ ] Step 3: Contact forms (dispatch, primary, after-hours)
- [ ] Step 3: Language selector
- [ ] Step 4: Equipment type visual selector
- [ ] Step 4: Service area state multi-select
- [ ] Step 4: Lane preference pairs
- [ ] Step 5: Insurance forms with minimum amount validation
- [ ] Step 5: Certificate upload (drag-and-drop)
- [ ] Step 6: Payment terms and banking info
- [ ] Step 7: Full review with compliance checklist
- [ ] Submit for review functionality
- [ ] Draft save and resume
- [ ] Client-side validation throughout

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| FMCSA lookup with auto-fill (Step 1) | High | Medium | P0 |
| Insurance validation with minimums (Step 5) | High | Medium | P0 |
| Draft save/resume | High | Medium | P0 |
| All form steps with validation (Steps 2-4, 6) | High | High | P0 |
| Review + submit (Step 7) | High | Medium | P0 |
| Document upload (drag-drop) | High | Medium | P0 |
| Equipment type visual cards | Medium | Medium | P1 |
| Interactive state map | Medium | High | P1 |
| Bilingual form labels | Medium | High | P1 |
| E-signature integration | Medium | High | P1 |
| Duplicate carrier detection | Medium | Low | P1 |
| OCR certificate auto-fill | Low | High | P2 |
| Lane suggestion engine | Low | Medium | P2 |
| Onboarding analytics | Low | Medium | P2 |

### Future Wave Preview

- **Wave 4:** Add OCR for insurance certificate auto-fill, carrier self-service onboarding via Carrier Portal (carrier fills their own data), integration with third-party compliance verification services (Highway, MyCarrierPackets).
- **Wave 5:** AI-powered carrier qualification scoring during onboarding, automated reference checks, predictive risk assessment for new carriers, bulk onboarding from CSV import.

---

_Last Updated: 2026-02-06_
