# Carrier Management Service -- Overview

> Service: 05 - Carrier Management | Wave: 3 | Priority: P0
> Total Screens: 12 | Built: 2 (Carriers List, Preferred Carriers) | Remaining: 10
> Primary Personas: Sarah (Ops Manager), Maria (Dispatcher), Omar (Dispatcher), Admin
> Roles with Access: dispatcher, ops_manager, carrier_admin, admin, super_admin
> Last Updated: 2026-02-06

---

## 1. Service Summary

The Carrier Management service is the central hub for managing the entire lifecycle of motor carrier relationships within Ultra TMS. It encompasses carrier onboarding, compliance monitoring, insurance tracking, performance scoring, equipment management, lane preference configuration, and FMCSA regulatory compliance. This service is critical to freight brokerage operations because every load dispatched requires a qualified, compliant carrier -- making carrier data quality and compliance monitoring directly tied to revenue generation and regulatory risk.

The Carrier entity is one of the most data-rich in the system with **48 database fields** across the primary table, plus six supporting tables: Carrier Contacts, Drivers, Insurance Certificates, Carrier Documents, FMCSA Compliance Logs, and Performance History. The service supports five carrier statuses (PENDING, ACTIVE, INACTIVE, SUSPENDED, BLACKLISTED) and five performance tiers (PLATINUM, GOLD, SILVER, BRONZE, UNQUALIFIED) that directly influence carrier assignment priority and rate negotiation.

**Bilingual support** (English and Spanish) is a first-class requirement across all carrier-facing communications and forms, reflecting the demographics of the North American trucking industry.

---

## 2. Screen Catalog (12 Screens)

| # | Screen | Route | Type | Status | Design Doc | Primary Personas |
|---|--------|-------|------|--------|-----------|-----------------|
| 01 | Carrier Dashboard | `/(dashboard)/carriers/dashboard` | Dashboard | Not Started | `05-carrier/01-carrier-dashboard.md` | Sarah, Admin |
| 02 | Carriers List | `/(dashboard)/carriers` | List | Built | `05-carrier/02-carriers-list.md` | Omar, Maria |
| 03 | Carrier Detail | `/(dashboard)/carriers/[id]` | Detail | Not Started | `05-carrier/03-carrier-detail.md` | Omar, Sarah |
| 04 | Carrier Onboarding | `/(dashboard)/carriers/onboard` | Wizard | Not Started | `05-carrier/04-carrier-onboarding.md` | Omar, Admin |
| 05 | Compliance Center | `/(dashboard)/carriers/compliance` | Dashboard | Not Started | `05-carrier/05-compliance-center.md` | Admin, Sarah |
| 06 | Insurance Tracking | `/(dashboard)/carriers/insurance` | List/Detail | Not Started | `05-carrier/06-insurance-tracking.md` | Admin |
| 07 | Equipment List | `/(dashboard)/carriers/[id]/equipment` | List | Not Started | `05-carrier/07-equipment-list.md` | Omar |
| 08 | Carrier Scorecard | `/(dashboard)/carriers/[id]/scorecard` | Report | Not Started | `05-carrier/08-carrier-scorecard.md` | Omar, Admin |
| 09 | Lane Preferences | `/(dashboard)/carriers/[id]/lanes` | List | Not Started | `05-carrier/09-lane-preferences.md` | Omar |
| 10 | Carrier Contacts | `/(dashboard)/carriers/[id]/contacts` | List | Not Started | `05-carrier/10-carrier-contacts.md` | Omar |
| 11 | FMCSA Lookup | `/(dashboard)/carriers/fmcsa` | Board | Not Started | `05-carrier/11-fmcsa-lookup.md` | Omar |
| 12 | Preferred Carriers | `/(dashboard)/carriers/preferred` | List | Built | `05-carrier/12-preferred-carriers.md` | Omar |

---

## 3. Key Workflows

### 3.1 Carrier Onboarding (7-Step Flow)

The onboarding workflow is the primary entry point for new carrier relationships. It takes a carrier from initial MC/DOT lookup through full compliance verification:

1. **MC/DOT Lookup** -- Enter MC# or DOT# to auto-fill from FMCSA SAFER database. If out-of-service, block onboarding with error. Manual creation option available.
2. **Company Information** -- Legal name, DBA, address, phone, email, website. Auto-filled from FMCSA where possible. Tax ID and W-9 upload.
3. **Contacts** -- Add dispatch, primary, and after-hours contacts. Preferred language selection (English/Spanish).
4. **Equipment & Service** -- Equipment types, truck/trailer counts, service area (US states), preferred lanes.
5. **Insurance** -- Upload certificates for auto liability ($1M minimum), cargo ($100K minimum), plus optional general liability and workers compensation.
6. **Payment Setup** -- Payment terms (Quick Pay/NET15/NET30), banking information (encrypted), factoring company details.
7. **Review & Submit** -- Full summary, compliance checklist, submit for 24-48 hour review.

**Post-submission:** Carrier enters PENDING status. Compliance team reviews documents. On approval, carrier moves to ACTIVE and receives welcome email (bilingual). On rejection, carrier is notified with reasons and can resubmit.

### 3.2 Compliance Monitoring (Continuous)

Compliance monitoring runs continuously to protect the brokerage from regulatory and liability exposure:

- **Insurance Tracking:** All carrier insurance certificates are tracked with expiration dates. Automated email reminders are sent at 30, 14, and 7 days before expiration. If insurance expires without renewal, the carrier is auto-suspended (configurable).
- **FMCSA Weekly Check:** Every active carrier's authority status, safety rating, and out-of-service rates are verified against the FMCSA SAFER database weekly via batch job. Any authority revocation or out-of-service status triggers immediate auto-suspension.
- **Minimum Coverage Enforcement:** Cargo insurance must be at least $100,000. Auto liability must be at least $1,000,000. Carriers failing to meet these minimums cannot be assigned loads.
- **Compliance Score:** Each carrier has a calculated compliance score (0-100) based on insurance status, FMCSA standing, document completeness, and safety rating.

### 3.3 Performance Tracking & Tier Management

Carrier performance is measured across multiple dimensions and aggregated into a composite score that determines tier placement:

- **Metrics:** On-time pickup %, on-time delivery %, claims rate, load acceptance rate, average customer rating, responsiveness.
- **Tier Calculation:** Scores are mapped to tiers -- PLATINUM (90-100), GOLD (80-89), SILVER (70-79), BRONZE (60-69), UNQUALIFIED (<60).
- **Tier Impact:** Higher-tier carriers get priority in load matching algorithms, higher rate offers, and are shown first in carrier search results.
- **Performance History:** 6-month rolling performance data is maintained. Monthly trend analysis is displayed on the carrier scorecard.

### 3.4 Carrier Search & Assignment

When dispatchers need to assign a carrier to a load, the search workflow is:

1. Dispatcher opens carrier list or uses global search.
2. Filters by equipment type, service area, availability, and tier.
3. Reviews carrier scores, compliance status, and load history.
4. Selects carrier and initiates rate confirmation.
5. System validates carrier compliance before allowing assignment (cannot assign suspended/blacklisted/expired insurance).

---

## 4. Dependencies

### 4.1 Upstream Dependencies (Services This Service Consumes)

| Service | What's Consumed | Critical? |
|---------|----------------|-----------|
| Service 01 - Auth & Admin | User authentication, role/permission checking, tenant context | Yes |
| Service 04 - TMS Core | Load data for carrier assignment, load history per carrier | Yes |
| Service 10 - Documents | Document storage, PDF viewer, upload infrastructure | Yes |
| Service 11 - Communication | Email sending for onboarding, compliance reminders, notifications | Yes |
| Service 24 - Config | Equipment type reference data, business rules for compliance thresholds | Yes |
| Service 37 - Cache | Cached FMCSA data, carrier list caching for performance | No |

### 4.2 Downstream Dependencies (Services That Consume This Service)

| Service | What's Consumed | Critical? |
|---------|----------------|-----------|
| Service 04 - TMS Core | Carrier assignment to loads, carrier validation for dispatch | Yes |
| Service 06 - Accounting | Carrier payment information, payment terms, factoring details | Yes |
| Service 07 - Load Board Internal | Carrier matching for load board postings | Yes |
| Service 09 - Claims | Carrier claims history, insurance certificate data | Yes |
| Service 13 - Carrier Portal | Carrier self-service profile, document uploads, load acceptance | Yes |
| Service 14 - Contracts | Carrier contract management, agreement tracking | No |
| Service 30 - Safety | CSA scores, safety ratings, FMCSA compliance data | No |
| Service 33 - Load Board External | Carrier capacity for external load board postings | No |

### 4.3 External Integration Dependencies

| Integration | Purpose | Protocol | Frequency |
|-------------|---------|----------|-----------|
| FMCSA SAFER API | Carrier authority verification, safety data, insurance on file | REST API | Weekly batch + on-demand lookup |
| FMCSA SAFER Web Scraper | Fallback when API is unavailable | Web scraping | As needed |
| Email Service (SendGrid/SES) | Onboarding notifications, compliance reminders | REST API | Event-driven |
| Document Storage (S3) | Insurance certificates, W-9s, carrier agreements | S3 API | On upload |

---

## 5. Real-Time Requirements

| Feature | Update Method | Frequency | Priority |
|---------|--------------|-----------|----------|
| Carrier status changes | WebSocket push | Immediate | P0 |
| Insurance expiration alerts | WebSocket push | When threshold crossed | P0 |
| FMCSA compliance changes | WebSocket push | After batch check completes | P0 |
| Carrier score updates | WebSocket push | After load completion | P1 |
| New carrier onboarding progress | Polling (30s) | During onboarding review | P1 |
| Carrier list updates (new carriers) | WebSocket push | On carrier creation | P2 |
| Performance tier changes | WebSocket push | After recalculation | P2 |

### WebSocket Channels

| Channel | Events | Subscribers |
|---------|--------|-------------|
| `carriers:{tenantId}` | `carrier.created`, `carrier.statusChanged`, `carrier.tierChanged` | Carrier list, dashboard |
| `carriers:{carrierId}` | `carrier.updated`, `carrier.complianceChanged`, `carrier.insuranceExpiring` | Carrier detail |
| `compliance:{tenantId}` | `compliance.issueDetected`, `compliance.batchCheckComplete`, `compliance.autoSuspend` | Compliance center |
| `insurance:{tenantId}` | `insurance.expiring`, `insurance.expired`, `insurance.renewed` | Insurance tracking |

---

## 6. Component Requirements

### 6.1 Existing Components to Reuse

| Component | Location | Used By Screens |
|-----------|----------|----------------|
| StatusBadge | `src/components/ui/status-badge.tsx` | All 12 screens |
| DataTable | `src/components/ui/data-table.tsx` | Carriers List, Insurance Tracking, Contacts, Equipment |
| PageHeader | `src/components/layout/page-header.tsx` | All 12 screens |
| FilterBar | `src/components/ui/filter-bar.tsx` | Carriers List, Insurance Tracking, Compliance Center |
| FileUpload | `src/components/ui/file-upload.tsx` | Onboarding (Steps 2, 5), Documents tab |
| PDFViewer | `src/components/ui/pdf-viewer.tsx` | Insurance Tracking, Carrier Detail (Documents tab) |

### 6.2 New Components Needed

| Component | Description | Used By Screens | Complexity |
|-----------|-------------|----------------|------------|
| CarrierTierBadge | Color-coded tier badge (Platinum=indigo, Gold=amber, Silver=slate, Bronze=orange, Unqualified=gray) | All screens showing tier | Small |
| ComplianceScoreGauge | Circular gauge showing compliance score 0-100 with color gradient | Dashboard, Detail, Compliance Center | Medium |
| InsuranceExpiryIndicator | Date display with color coding: green=ok, yellow=30 days, red=expired | List, Detail, Insurance Tracking | Small |
| OnboardingWizardStepper | 7-step progress indicator with completion %, save/resume capability | Onboarding | Medium |
| CarrierCard | Card view component for carrier list card toggle | Carriers List | Medium |
| FMCSADataPanel | Panel displaying FMCSA authority, safety rating, OOS rates | Detail (Compliance tab), Onboarding (Step 1) | Medium |
| ExpirationTimeline | Visual timeline showing upcoming insurance/document expirations over 90 days | Compliance Center, Dashboard | High |
| PerformanceTrendChart | Line chart showing carrier performance metrics over 6 months | Detail (Performance tab), Scorecard | Medium |
| EquipmentTypeSelector | Multi-select with visual equipment type cards/icons | Onboarding (Step 4), Detail (Profile tab) | Medium |
| ServiceAreaMap | US map with state selection for service area | Onboarding (Step 4), Detail (Profile tab) | High |
| LanePreferenceEditor | Origin state to destination state pair editor | Onboarding (Step 4), Lane Preferences | Medium |
| BilingualToggle | English/Spanish language toggle for form labels and communications | Onboarding, Carrier Detail | Small |

### 6.3 shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|-----------|-------------|-------|
| Tabs | tabs | Carrier Detail tabbed layout |
| Progress | progress | Onboarding wizard progress bar |
| Calendar | calendar | Insurance expiry date picker |
| Popover | popover | Date pickers, filter popovers |
| Command | command | Carrier search command palette |
| Sheet | sheet | Quick-view carrier side panel |
| Accordion | accordion | Onboarding step sections, FAQ |
| Separator | separator | Section dividers in detail views |
| Switch | switch | Auto-suspend toggle, preferred carrier toggle |
| Tooltip | tooltip | Compliance score explanation, tier explanation |

---

## 7. Business Rules Summary

### 7.1 Carrier Status Rules

| Rule | Description | Enforcement |
|------|-------------|-------------|
| CR-001 | Only ACTIVE carriers can be assigned to loads | Hard block at dispatch |
| CR-002 | PENDING carriers must complete onboarding before activation | System-enforced workflow |
| CR-003 | SUSPENDED carriers retain data but cannot accept loads | Soft block with override for admin |
| CR-004 | BLACKLISTED carriers cannot be reactivated without admin approval | Hard block, requires confirmation + reason |
| CR-005 | Out-of-service FMCSA status triggers automatic SUSPENDED status | Automated via weekly FMCSA check |
| CR-006 | Expired insurance triggers automatic SUSPENDED status (configurable) | Automated, toggle in settings |
| CR-007 | Status change to BLACKLISTED requires written reason | Required field on status change modal |

### 7.2 Insurance Rules

| Rule | Description | Minimum |
|------|-------------|---------|
| INS-001 | Auto Liability insurance is required for all active carriers | $1,000,000 |
| INS-002 | Cargo insurance is required for all active carriers | $100,000 |
| INS-003 | General Liability insurance is optional but recommended | N/A |
| INS-004 | Workers Compensation is optional | N/A |
| INS-005 | Insurance expiration within 30 days triggers WARNING compliance status | 30 days |
| INS-006 | Insurance expiration within 7 days triggers EXPIRING_SOON compliance status | 7 days |
| INS-007 | Expired insurance triggers EXPIRED compliance status and potential auto-suspend | 0 days |

### 7.3 FMCSA Compliance Rules

| Rule | Description | Frequency |
|------|-------------|-----------|
| FMCSA-001 | Active carrier authority must be verified against FMCSA SAFER | Weekly batch |
| FMCSA-002 | Revoked authority triggers immediate auto-suspension | Immediate on detection |
| FMCSA-003 | Out-of-service status triggers immediate auto-suspension | Immediate on detection |
| FMCSA-004 | Safety rating downgrade triggers compliance WARNING | On detection |
| FMCSA-005 | New carrier onboarding must verify FMCSA status before approval | Onboarding Step 1 |

### 7.4 Tier Rules

| Tier | Score Range | Benefits |
|------|------------|---------|
| PLATINUM | 90-100 | First priority in load matching, premium rate offers, featured in preferred list |
| GOLD | 80-89 | Second priority in load matching, standard rate offers |
| SILVER | 70-79 | Standard priority, standard rates |
| BRONZE | 60-69 | Lower priority, may require manual approval for high-value loads |
| UNQUALIFIED | 0-59 | Lowest priority, flagged for review, may be restricted from certain lanes |

---

## 8. Database Entity Summary

### 8.1 Primary Table: Carriers (48 fields)

**Core Fields:** id, tenantId, legalName, dbaName, mcNumber, dotNumber, status, tier, complianceScore, taxId, w9OnFile

**Contact Fields:** primaryPhone, primaryEmail, website, billingPhone, billingEmail, afterHoursPhone, preferredLanguage

**Address Fields:** physicalAddress1, physicalAddress2, physicalCity, physicalState, physicalZip, mailingAddress1, mailingAddress2, mailingCity, mailingState, mailingZip

**Business Fields:** paymentTerms, bankName, bankRoutingNumber (encrypted), bankAccountNumber (encrypted), factoringCompanyId, factoringCompanyName, directDepositAuthorized

**Operations Fields:** truckCount, trailerCount, equipmentTypes (array), serviceAreaStates (array), preferredLanes (JSON), isPreferred, notes

**FMCSA Fields:** authorityStatus, safetyRating, oosRateDriver, oosRateVehicle, lastFmcsaCheck, fmcsaDataJson

**Performance Fields:** totalLoads, onTimePickupPct, onTimeDeliveryPct, claimsRate, acceptanceRate, avgRating

**Metadata Fields:** createdAt, updatedAt, createdBy, updatedBy

### 8.2 Supporting Tables

| Table | Key Fields | Relationship |
|-------|-----------|-------------|
| CarrierContacts | carrierId, name, title, email, phone, role (primary/dispatch/after-hours/billing), receivesRateConfirms, receivesPodRequests, receivesPayments, preferredLanguage | One-to-many |
| Drivers | carrierId, firstName, lastName, cdlNumber, cdlState, cdlExpiry, phone, email, status | One-to-many |
| InsuranceCertificates | carrierId, insuranceType, policyNumber, provider, coverageAmount, effectiveDate, expiryDate, certificateUrl, verified, verifiedBy, verifiedAt | One-to-many |
| CarrierDocuments | carrierId, documentType, fileName, fileUrl, status (pending/approved/rejected/expired), uploadedAt, reviewedBy, reviewedAt, notes | One-to-many |
| FmcsaComplianceLogs | carrierId, checkDate, authorityStatus, safetyRating, oosRateDriver, oosRateVehicle, alertsGenerated, rawDataJson | One-to-many (append-only) |
| PerformanceHistory | carrierId, periodStart, periodEnd, totalLoads, onTimePickupPct, onTimeDeliveryPct, claimsRate, acceptanceRate, avgRating, tier | One-to-many (monthly snapshots) |

---

## 9. API Endpoints Summary

| # | Method | Path | Purpose | Screen(s) |
|---|--------|------|---------|-----------|
| 1 | GET | `/api/carriers` | List carriers with filters, pagination, sorting | Carriers List, Dashboard |
| 2 | GET | `/api/carriers/:id` | Get single carrier with all related data | Carrier Detail |
| 3 | POST | `/api/carriers` | Create new carrier (from onboarding) | Carrier Onboarding |
| 4 | PATCH | `/api/carriers/:id` | Update carrier fields | Carrier Detail (edit) |
| 5 | PATCH | `/api/carriers/:id/status` | Change carrier status | Carrier Detail, Carriers List |
| 6 | GET | `/api/carriers/:id/contacts` | List carrier contacts | Carrier Detail (Contacts tab), Carrier Contacts |
| 7 | POST | `/api/carriers/:id/contacts` | Add carrier contact | Carrier Detail, Onboarding |
| 8 | GET | `/api/carriers/:id/insurance` | List carrier insurance certificates | Carrier Detail (Compliance tab), Insurance Tracking |
| 9 | POST | `/api/carriers/:id/insurance` | Upload insurance certificate | Onboarding, Carrier Detail |
| 10 | GET | `/api/carriers/:id/documents` | List carrier documents | Carrier Detail (Documents tab) |
| 11 | POST | `/api/carriers/:id/documents` | Upload carrier document | Onboarding, Carrier Detail |
| 12 | GET | `/api/carriers/:id/performance` | Get carrier performance data | Carrier Detail (Performance tab), Scorecard |
| 13 | GET | `/api/carriers/:id/loads` | Get carrier load history | Carrier Detail (History tab) |
| 14 | GET | `/api/carriers/compliance/issues` | List all compliance issues across carriers | Compliance Center |
| 15 | GET | `/api/carriers/insurance/expiring` | List expiring insurance certificates | Insurance Tracking, Dashboard |
| 16 | POST | `/api/carriers/fmcsa/lookup` | Lookup carrier by MC# or DOT# in FMCSA | Onboarding (Step 1), FMCSA Lookup |
| 17 | POST | `/api/carriers/fmcsa/batch-check` | Run batch FMCSA check for all active carriers | Compliance Center |
| 18 | GET | `/api/carriers/dashboard/stats` | Get dashboard KPI data | Carrier Dashboard |
| 19 | GET | `/api/carriers/preferred` | List preferred carriers | Preferred Carriers |
| 20 | PATCH | `/api/carriers/:id/preferred` | Toggle preferred carrier status | Carrier Detail, Carriers List |

---

## 10. Current Build Status

### Built Screens (2 of 12)

1. **Carriers List** (`/(dashboard)/carriers`) -- Basic carrier list with table, search, and status filtering. Partially built -- needs compliance column, tier badges, card view toggle, bulk actions, and advanced filtering.
2. **Preferred Carriers** (`/(dashboard)/carriers/preferred`) -- Filtered view of preferred carriers. Basic list implemented.

### Not Started (10 of 12)

All remaining screens (Dashboard, Detail, Onboarding, Compliance Center, Insurance Tracking, Equipment List, Scorecard, Lane Preferences, Carrier Contacts, FMCSA Lookup) are not started and have no existing page.tsx files.

### Known Issues with Built Screens

- Carriers List is missing compliance status column
- Carriers List does not show tier badges
- Carriers List has no card view toggle
- Carriers List bulk actions are not implemented
- Carriers List does not have color-coded rows for compliance status
- Preferred Carriers list needs to be integrated with carrier scoring system

---

## 11. Wave 3 Priorities

| Priority | Screen | Rationale |
|----------|--------|-----------|
| P0 | Carrier Detail | Core screen needed for all carrier management workflows |
| P0 | Carrier Onboarding | Required to add new carriers to the system |
| P0 | Carriers List (enhancements) | Already built but needs compliance and tier features |
| P0 | Compliance Center | Regulatory requirement -- must monitor carrier compliance |
| P1 | Carrier Dashboard | Command center for carrier relations team |
| P1 | Insurance Tracking | Part of compliance monitoring |
| P1 | FMCSA Lookup | Required for onboarding and compliance verification |
| P2 | Carrier Scorecard | Performance tracking for tier management |
| P2 | Carrier Contacts | Contact management per carrier |
| P2 | Equipment List | Equipment tracking per carrier |
| P2 | Lane Preferences | Lane management per carrier |
| P2 | Preferred Carriers (enhancements) | Already built but needs scoring integration |

---

_Last Updated: 2026-02-06_
