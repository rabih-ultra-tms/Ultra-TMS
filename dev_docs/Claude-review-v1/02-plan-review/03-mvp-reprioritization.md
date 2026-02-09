# MVP Reprioritization

**Project:** Ultra TMS - 3PL Logistics Platform
**Review Date:** 2026-02-07
**Reviewer:** Claude Opus 4.6
**Scope:** Screen-level and feature-level prioritization for Phase A MVP

---

## Table of Contents

1. [Priority Tier Definitions](#1-priority-tier-definitions)
2. [P0 -- Must Have for First Paying User](#2-p0)
3. [P1 -- Within 2 Weeks of First User](#3-p1)
4. [P2 -- Within 2 Months of First User](#4-p2)
5. [P3 -- Post-Launch / Phase B](#5-p3)
6. [Re-Sequenced Sprint Plan](#6-re-sequenced-sprint-plan)
7. [Screen-Level Build Order Within Each Tier](#7-screen-level-build-order)
8. [Impact Analysis: What Gets Cut](#8-impact-analysis)

---

## 1. Priority Tier Definitions

### Criteria for Each Tier

| Tier | Definition | Criteria | Timeline |
|------|-----------|----------|----------|
| **P0** | Must have for first paying user | System is literally unusable without this. A freight broker cannot book a single load. | Before first customer |
| **P1** | Within 2 weeks of first user | Users can work around the absence temporarily. Manual processes or external tools fill the gap. | Within 2 weeks of launch |
| **P2** | Within 2 months of first user | Nice-to-have features that improve efficiency but are not blocking daily operations. | Within 2 months of launch |
| **P3** | Post-launch / Phase B+ | Advanced features, additional verticals, nice-to-have integrations. Can wait 6+ months. | Phase B or later |

### The Test

For each screen/feature, ask: **"Can a freight broker complete a profitable load move without this?"**

- If NO -> P0
- If YES, but they'll need a workaround within 2 weeks -> P1
- If YES, and they can wait 2 months -> P2
- If YES, and they can wait 6+ months -> P3

---

## 2. P0 -- Must Have for First Paying User {#2-p0}

### 2.1 Auth & Admin (Service 01)

**Status:** Already built. 5 controllers, 6 services.

| Screen | Design Spec | Built? | Notes |
|--------|------------|--------|-------|
| Login | `01-auth-admin/01-login.md` | Yes | `apps/web/app/(auth)/login/page.tsx` |
| Register | `01-auth-admin/02-register.md` | Yes | `apps/web/app/(auth)/register/page.tsx` |
| Forgot Password | `01-auth-admin/03-forgot-password.md` | Yes | `apps/web/app/(auth)/forgot-password/page.tsx` |
| Reset Password | `01-auth-admin/04-reset-password.md` | Yes | `apps/web/app/(auth)/reset-password/page.tsx` |
| User Management | `01-auth-admin/07-user-management.md` | Yes | `apps/web/app/(dashboard)/admin/users/page.tsx` |
| Role Management | `01-auth-admin/08-role-management.md` | Yes | `apps/web/app/(dashboard)/admin/roles/page.tsx` |
| Profile | `01-auth-admin/06-profile.md` | Yes | `apps/web/app/(dashboard)/profile/page.tsx` |

**P0 Screen Count: 7 (all built)**

### 2.2 Dashboard Shell (Service 01.1)

| Screen | Design Spec | Built? | Notes |
|--------|------------|--------|-------|
| Main Dashboard | `01.1-dashboard-shell/01-main-dashboard.md` | Yes | `apps/web/app/(dashboard)/dashboard/page.tsx` |
| Sidebar Navigation | `01.1-dashboard-shell/02-sidebar.md` | Yes | Part of dashboard layout |

**P0 Screen Count: 2 (all built)**

### 2.3 CRM Basics (Service 02)

| Screen | Design Spec | Built? | Notes |
|--------|------------|--------|-------|
| Companies List | `02-crm/02-companies-list.md` | Yes | `apps/web/app/(dashboard)/companies/page.tsx` |
| Company Detail | `02-crm/03-company-detail.md` | Yes | `apps/web/app/(dashboard)/companies/[id]/page.tsx` |
| Company Create/Edit | `02-crm/04-company-form.md` | Yes | `apps/web/app/(dashboard)/companies/new/page.tsx` |
| Contacts List | `02-crm/05-contacts-list.md` | Yes | `apps/web/app/(dashboard)/contacts/page.tsx` |
| Contact Detail | `02-crm/06-contact-detail.md` | Yes | `apps/web/app/(dashboard)/contacts/[id]/page.tsx` |
| Contact Create/Edit | `02-crm/07-contact-form.md` | Yes | `apps/web/app/(dashboard)/contacts/new/page.tsx` |

**P0 Screen Count: 6 (all built)**

### 2.4 Sales -- Quoting (Service 03)

| Screen | Design Spec | Built? | Notes |
|--------|------------|--------|-------|
| Quotes List | `03-sales/02-quotes-list.md` | Partial | `apps/web/app/(dashboard)/quote-history/page.tsx` exists |
| Quote Detail | `03-sales/03-quote-detail.md` | No | Needs to show rate, stops, margin |
| Quote Builder | `03-sales/04-quote-builder.md` | No | Multi-stop quote creation form |
| Rate Tables | `03-sales/05-rate-tables.md` | No | Lane pricing reference |

**P0 Screen Count: 4 (1 partial, 3 not built)**

### 2.5 TMS Core -- Orders & Loads (Service 04)

| Screen | Design Spec | Built? | Notes |
|--------|------------|--------|-------|
| Orders List | `04-tms-core/02-orders-list.md` | No | Core screen -- filterable order table |
| Order Detail | `04-tms-core/03-order-detail.md` | No | Order information with stops, carrier, status |
| Order Entry | `04-tms-core/04-order-entry.md` | No | Create/edit order form |
| Loads List | `04-tms-core/05-loads-list.md` | No | Load management table |
| Load Detail | `04-tms-core/06-load-detail.md` | No | Load info with stops, driver, tracking |
| Load Builder | `04-tms-core/07-load-builder.md` | No | Create load from order, assign carrier |
| Dispatch Board | `04-tms-core/08-dispatch-board.md` | No | Kanban-style load assignment |
| Status Updates | `04-tms-core/11-status-updates.md` | No | Update load/order status |

**P0 Screen Count: 8 (none built)**

### 2.6 Carrier Management (Service 05)

| Screen | Design Spec | Built? | Notes |
|--------|------------|--------|-------|
| Carriers List | `05-carrier/02-carriers-list.md` | Partial | `apps/web/app/(dashboard)/carriers/page.tsx` exists |
| Carrier Detail | `05-carrier/03-carrier-detail.md` | No | Profile, insurance, compliance |
| Carrier Create/Edit | `05-carrier/04-carrier-form.md` | No | Onboarding form |

**P0 Screen Count: 3 (1 partial, 2 not built)**

### 2.7 Basic Invoicing (Service 06)

| Screen | Design Spec | Built? | Notes |
|--------|------------|--------|-------|
| Invoices List | `06-accounting/02-invoices-list.md` | No | AR invoice table |
| Invoice Detail | `06-accounting/03-invoice-detail.md` | No | Invoice with line items |
| Invoice Entry | `06-accounting/04-invoice-entry.md` | No | Create invoice from delivered load |

**P0 Screen Count: 3 (none built)**

### P0 Summary

| Service | P0 Screens | Built | Remaining |
|---------|-----------|-------|-----------|
| Auth & Admin | 7 | 7 | 0 |
| Dashboard Shell | 2 | 2 | 0 |
| CRM Basics | 6 | 6 | 0 |
| Sales (Quoting) | 4 | 1 partial | 3 |
| TMS Core | 8 | 0 | 8 |
| Carrier Management | 3 | 1 partial | 2 |
| Basic Invoicing | 3 | 0 | 3 |
| **Total P0** | **33** | **17** | **16** |

**P0 is approximately 52% complete by screen count.** The remaining 16 P0 screens are concentrated in TMS Core (8 screens), Sales (3), Invoicing (3), and Carrier (2).

---

## 3. P1 -- Within 2 Weeks of First User {#3-p1}

These features can be deferred for 1-2 weeks after the first customer starts using the system. Users can work around them with manual processes (phone calls, spreadsheets, email).

### 3.1 TMS Core -- Tracking & Check Calls

| Screen | Design Spec | Notes |
|--------|------------|-------|
| Tracking Map | `04-tms-core/10-tracking-map.md` | Live map with load positions. Manual position updates work as fallback. |
| Check Calls | `04-tms-core/13-check-calls.md` | Logging carrier check-in calls. Can use notes field on load initially. |
| Stop Management | `04-tms-core/09-stop-management.md` | Advanced multi-stop editing. Basic stops are part of P0 order entry. |

### 3.2 Carrier Management -- Compliance & Scoring

| Screen | Design Spec | Notes |
|--------|------------|-------|
| Carrier Compliance | `05-carrier/05-compliance-dashboard.md` | Insurance expiry alerts, FMCSA data. Can manually check SAFER for now. |
| Carrier Scorecard | `05-carrier/09-carrier-scorecard.md` | Performance metrics. Not needed until enough loads are moved. |
| Carrier Documents | `05-carrier/07-carrier-documents.md` | W-9, insurance certificates. Can store in shared drive initially. |

### 3.3 Sales -- Rate Confirmations & Rate Management

| Screen | Design Spec | Notes |
|--------|------------|-------|
| Rate Table Editor | `03-sales/06-rate-table-editor.md` | Detailed rate management. Basic rates can be entered on quotes. |
| Sales Dashboard | `03-sales/01-sales-dashboard.md` | Metrics and KPIs. Not critical for first 2 weeks. |

### 3.4 Accounting -- Carrier Pay & Settlements

| Screen | Design Spec | Notes |
|--------|------------|-------|
| Carrier Payables | `06-accounting/05-carrier-payables.md` | Must pay carriers. Can use spreadsheet for 1-2 weeks. |
| Payments Received | `06-accounting/07-payments-received.md` | Track customer payments. Manual tracking for short period. |

### 3.5 Operations Dashboard

| Screen | Design Spec | Notes |
|--------|------------|-------|
| Operations Dashboard | `04-tms-core/01-operations-dashboard.md` | Overview metrics. Main dashboard covers basics. |
| Load Timeline | `04-tms-core/12-load-timeline.md` | Visual load progress. Status field on load detail serves initially. |

### P1 Summary

| Service | P1 Screens |
|---------|-----------|
| TMS Core (tracking, checks, stops) | 4 |
| Carrier (compliance, scoring, docs) | 3 |
| Sales (rates, dashboard) | 2 |
| Accounting (carrier pay, payments) | 2 |
| Operations (dashboard, timeline) | 2 |
| **Total P1** | **13** |

---

## 4. P2 -- Within 2 Months of First User {#4-p2}

These features improve efficiency and scale but are not required for daily operations.

### 4.1 Reporting & Analytics (Service 19)

| Screen | Notes |
|--------|-------|
| Revenue Report | Standard financial reporting. Excel exports cover this initially. |
| Load Count Report | Basic operational metrics. Dashboard widgets are sufficient. |
| Margin Analysis | Profitability analysis. Invoicing data + spreadsheet works. |
| KPI Dashboard | Executive metrics. Build after enough data is in the system. |

### 4.2 Document Management (Service 10)

| Screen | Notes |
|--------|-------|
| Document List | File storage and retrieval. Shared drive or S3 + manual links works. |
| Document Upload | File upload with OCR. Manual upload to load/carrier is P0 (inline). |
| BOL Generation | Bill of lading PDF. Use templates in Word initially. |
| Rate Confirmation PDF | Auto-generated rate confirmations. Email-based process works. |

### 4.3 Customer Portal (Service 12)

| Screen | Notes |
|--------|-------|
| Customer Login | Separate auth for customers. Share tracking info via email initially. |
| Customer Tracking | Self-service shipment tracking. Phone/email updates work for a few weeks. |
| Customer Invoices | Self-service invoice access. Email PDFs initially. |
| Customer Quotes | Self-service quote requests. Phone/email quote requests work. |

### 4.4 Carrier Portal (Service 13)

| Screen | Notes |
|--------|-------|
| Carrier Login | Separate auth for carriers. |
| Carrier Load Board | Available loads for carriers. Email/phone for load offers. |
| Carrier POD Upload | Proof of delivery submission. Email works. |
| Carrier Profile Self-Service | Carrier self-manages profile. Internal team manages for now. |

### 4.5 Claims Management (Service 09)

| Screen | Notes |
|--------|-------|
| Claims List | Claim filing and tracking. Spreadsheet + email for first 2 months. |
| Claim Detail | Individual claim management. |
| Claim Filing Form | File new claims. |

### 4.6 Additional Accounting Screens

| Screen | Notes |
|--------|-------|
| AR Aging Report | `06-accounting/14-ar-aging-report.md`. Spreadsheet export initially. |
| Bank Reconciliation | `06-accounting/10-bank-reconciliation.md`. Manual reconciliation. |
| GL Transactions | `06-accounting/11-gl-transactions.md`. Not needed for basic invoicing. |
| Chart of Accounts | `06-accounting/12-chart-of-accounts.md`. QuickBooks handles this. |
| Financial Reports | `06-accounting/13-financial-reports.md`. QuickBooks handles this. |

### P2 Summary

| Service | P2 Screens |
|---------|-----------|
| Reporting & Analytics | 4 |
| Document Management | 4 |
| Customer Portal | 4 |
| Carrier Portal | 4 |
| Claims Management | 3 |
| Accounting (advanced) | 5 |
| **Total P2** | **24** |

---

## 5. P3 -- Post-Launch / Phase B {#5-p3}

These features are either advanced capabilities or entirely new domains that can wait until after the MVP is stable and generating revenue.

### 5.1 EDI Integration (Service 29)

| Screen | Notes |
|--------|-------|
| EDI Dashboard | EDI 204/214/210 processing. Only needed for enterprise customers. |
| EDI Transaction Log | Transaction monitoring. |
| EDI Partner Setup | Trading partner configuration. |
| EDI Mapping Editor | Field mapping for EDI documents. |

### 5.2 Safety & Compliance (Service 30)

| Screen | Notes |
|--------|-------|
| Safety Dashboard | CSA scores, violations. Manual FMCSA lookup works. |
| Driver Safety Scores | Individual driver safety records. |
| Incident Reports | Safety incident logging. |

### 5.3 Rate Intelligence (Service 35)

| Screen | Notes |
|--------|-------|
| Market Rate Dashboard | DAT/Truckstop rate data. External tools work. |
| Lane Rate Analysis | Historical lane pricing. |
| Rate Comparison | Compare offered vs. market rates. |

### 5.4 Load Board Integration (Service 33)

| Screen | Notes |
|--------|-------|
| Load Board Posting | Auto-post loads to DAT/Truckstop. Manual posting works. |
| Board Response Manager | Manage carrier responses from boards. |
| Load Board Settings | Configuration for auto-posting. |

### 5.5 Workflow Engine (Service 20)

| Screen | Notes |
|--------|-------|
| Workflow Builder | Visual automation builder. Manual processes work for MVP. |
| Workflow Templates | Pre-built automation workflows. |
| Workflow Execution Log | Monitor running automations. |
| Trigger Configuration | Event-based triggers. |

### 5.6 Commission Engine (Service 08)

| Screen | Notes |
|--------|-------|
| Commission Dashboard | Agent commission tracking. Spreadsheet for MVP. |
| Commission Plans | Commission rate configuration. |
| Commission Reports | Payout reporting. |
| Agent Settlements | Agent payment processing. |

### 5.7 Advanced Platform Services

| Screen | Notes |
|--------|-------|
| Audit Log Viewer | `audit` module scaffolded. Not critical for MVP. |
| System Configuration | `config` module scaffolded. Use .env for now. |
| Feature Flags | Feature toggle management. Not needed until SaaS launch. |
| Notification Center | Centralized notifications. Email notifications are sufficient. |
| Help Desk | Internal support ticketing. External tools (Intercom, Zendesk) work. |
| Feedback Collection | User feedback forms. Google Forms or Typeform work. |

### 5.8 QuickBooks Integration

| Screen | Notes |
|--------|-------|
| QB Sync Dashboard | Monitoring QuickBooks sync. Deferring QB entirely to P3. |
| QB Reconciliation | Matching QB entries to TMS invoices. |
| QB Settings | OAuth connection and field mapping. |

### 5.9 HubSpot Advanced Features

| Screen | Notes |
|--------|-------|
| HubSpot Sync Monitor | Detailed sync monitoring. Basic CRM works without HubSpot. |
| HubSpot Activity Sync | Activity/meeting sync. |
| HubSpot Deal Pipeline | Opportunity sync with HubSpot deals. |

### P3 Summary

| Service | P3 Screens |
|---------|-----------|
| EDI Integration | 4 |
| Safety & Compliance | 3 |
| Rate Intelligence | 3 |
| Load Board Integration | 3 |
| Workflow Engine | 4 |
| Commission Engine | 4 |
| Advanced Platform | 6 |
| QuickBooks Integration | 3 |
| HubSpot Advanced | 3 |
| **Total P3** | **33** |

---

## Priority Summary

| Tier | Screens | % of Total | Built | Remaining | Estimated Weeks |
|------|---------|-----------|-------|-----------|-----------------|
| P0 | 33 | 32% | 17 | 16 | 18-24 weeks |
| P1 | 13 | 13% | 0 | 13 | 8-10 weeks |
| P2 | 24 | 23% | 0 | 24 | 14-18 weeks |
| P3 | 33 | 32% | 0 | 33 | Phase B+ |
| **Total classified** | **103** | 100% | **17** | **86** | -- |

**Note:** The full 362-screen catalog includes screens for 10 verticals and Phase C-E features. The 103 screens classified here cover the core freight brokerage workflow (Phase A scope).

### Key Insight

**P0 + P1 = 46 screens. That is the shippable MVP.** If both P0 and P1 are completed, a freight broker can:

1. Log in and manage users
2. Manage customers and contacts
3. Create and send quotes
4. Convert quotes to orders
5. Build loads and assign carriers
6. Track load status through delivery
7. Generate invoices
8. Track carrier check calls
9. Monitor compliance
10. View basic reports

This covers the complete freight brokerage lifecycle.

---

## 6. Re-Sequenced Sprint Plan {#6-re-sequenced-sprint-plan}

### Current Plan vs. Recommended Plan

**Current plan** (`dev_docs/05-roadmap/53-roadmap-phase-a.md`): Build everything per service, in service order, across 78 weeks.

**Recommended plan:** Build P0 across all services first, then P1, then P2. This delivers a shippable product faster.

### Recommended Sprint Sequence

#### Phase A1: P0 Features (Weeks 9-42, ~34 weeks)

*Weeks 1-8 are already complete (Foundation + Auth + CRM basics)*

| Sprint | Weeks | Focus | Screens Built |
|--------|-------|-------|--------------|
| S1 | 9-10 | Sales Backend: Quote module, rate tables | Quote API, Rate Table API |
| S2 | 11-12 | Sales Frontend: Quote builder, quotes list | Quotes List, Quote Detail, Quote Builder |
| S3 | 13-14 | Sales Polish: Rate tables UI, quote workflow | Rate Tables screen |
| -- | 15-16 | **Buffer sprint** | Bug fixes, catch-up |
| S4 | 17-18 | TMS Backend: Order + Load models, services | Order CRUD API, Load CRUD API |
| S5 | 19-20 | TMS Frontend: Order list, detail, entry | Orders List, Order Detail, Order Entry |
| S6 | 21-22 | TMS Backend: Load builder, stop management | Load building logic, stop API |
| S7 | 23-24 | TMS Frontend: Load list, detail, builder | Loads List, Load Detail, Load Builder |
| S8 | 25-26 | TMS: Dispatch Board | Dispatch Board (2-week feature) |
| S9 | 27-28 | TMS: Status workflow + updates | Status Updates screen, state machine |
| -- | 29-30 | **Buffer sprint** | Integration testing, bug fixes |
| S10 | 31-32 | Carrier Backend: Profile, compliance | Carrier CRUD API, insurance API |
| S11 | 33-34 | Carrier Frontend: List, detail, form | Carrier Detail, Carrier Form |
| S12 | 35-36 | Accounting Backend: Invoice model, generation | Invoice API, auto-generation from loads |
| S13 | 37-38 | Accounting Frontend: Invoice list, detail, entry | Invoices List, Invoice Detail, Invoice Entry |
| -- | 39-40 | **Buffer sprint** | Integration testing, deployment prep |
| S14 | 41-42 | **Staging deployment + dogfooding** | Deploy, internal testing |

**P0 complete at week 42.** All 33 P0 screens built, tested, and deployed to staging.

#### Phase A2: P1 Features (Weeks 43-52, ~10 weeks)

| Sprint | Weeks | Focus | Screens Built |
|--------|-------|-------|--------------|
| S15 | 43-44 | Tracking: Map + check calls | Tracking Map, Check Calls |
| S16 | 45-46 | Carrier: Compliance dashboard, scorecard | Compliance Dashboard, Scorecard |
| S17 | 47-48 | Accounting: Carrier pay, payments received | Carrier Payables, Payments Received |
| S18 | 49-50 | TMS: Stop management, operations dashboard | Stop Management, Ops Dashboard |
| S19 | 51-52 | Sales: Rate editor, sales dashboard, load timeline | Rate Table Editor, Sales Dashboard, Load Timeline |

**P1 complete at week 52.** 46 screens (P0+P1) delivering a fully functional MVP.

#### Phase A3: P2 Features + Launch (Weeks 53-70, ~18 weeks)

| Sprint | Weeks | Focus |
|--------|-------|-------|
| S20-21 | 53-56 | Reporting & document management (4 weeks) |
| S22-23 | 57-60 | Customer portal + carrier portal (4 weeks) |
| S24-25 | 61-64 | Claims, advanced accounting (4 weeks) |
| S26 | 65-66 | Integration testing, performance testing |
| S27 | 67-68 | Soft launch: 1-2 pilot customers |
| S28 | 69-70 | Bug fixes, stabilization |

#### Phase A4: Remaining + Phase B Transition (Weeks 71-78, 8 weeks)

| Sprint | Weeks | Focus |
|--------|-------|-------|
| S29-30 | 71-74 | P3 features if time allows (EDI, load board) |
| S31-32 | 75-78 | Documentation, training, Phase B planning |

---

## 7. Screen-Level Build Order Within Each Tier {#7-screen-level-build-order}

### P0 Build Order (within each service, which screen first?)

The principle: **Build the data entry screen before the list/detail screen.** You need data in the system before you can display it.

#### TMS Core (8 screens) -- Recommended Build Order

| Order | Screen | Rationale |
|-------|--------|-----------|
| 1 | Order Entry | Create orders before you can list them |
| 2 | Orders List | View created orders |
| 3 | Order Detail | View individual order details |
| 4 | Load Builder | Create loads from orders |
| 5 | Loads List | View created loads |
| 6 | Load Detail | View individual load details |
| 7 | Dispatch Board | Assign carriers to loads (needs loads to exist) |
| 8 | Status Updates | Update load status (needs dispatched loads) |

#### Sales (4 screens) -- Recommended Build Order

| Order | Screen | Rationale |
|-------|--------|-----------|
| 1 | Rate Tables | Define pricing before creating quotes |
| 2 | Quote Builder | Create quotes using rate tables |
| 3 | Quotes List | View created quotes |
| 4 | Quote Detail | View individual quote details + convert to order |

#### Carrier Management (3 screens) -- Recommended Build Order

| Order | Screen | Rationale |
|-------|--------|-----------|
| 1 | Carrier Create/Edit | Onboard carriers before listing them |
| 2 | Carriers List | View carrier directory |
| 3 | Carrier Detail | View carrier profile with insurance + docs |

#### Basic Invoicing (3 screens) -- Recommended Build Order

| Order | Screen | Rationale |
|-------|--------|-----------|
| 1 | Invoice Entry | Create invoices (ideally auto from delivered load) |
| 2 | Invoices List | View invoice AR |
| 3 | Invoice Detail | View individual invoice with line items |

---

## 8. Impact Analysis: What Gets Cut {#8-impact-analysis}

### Features Deferred from Current Phase A to Phase B (P3)

| Feature | Current Week | Deferred To | Risk |
|---------|-------------|-------------|------|
| EDI 204/214/210 | 63-65 | Phase B | Low -- only enterprise customers need EDI |
| DAT Integration | 66 | Phase B | Low -- manual rate lookup works |
| Truckstop Integration | 67 | Phase B | Low -- manual board posting works |
| Load Board Posting | 68 | Phase B | Low -- manual posting works |
| Safety Module (CSA) | 69 | Phase B | Low -- manual FMCSA lookup works |
| QuickBooks Integration | 48 | Phase B | Medium -- manual QB entry is tedious but doable |
| Commission Engine | 51-52, 55-56 | Phase B | Medium -- spreadsheet calculation works |
| Workflow Engine | 65-68 | Phase B | Low -- manual processes work |
| Custom Report Builder | 74 | Phase B | Low -- canned reports + exports sufficient |
| Full GL Module | 49 | Phase B | Low -- QuickBooks handles GL |
| HubSpot Sync | 7-12 | P2/P3 | Medium -- CRM CRUD works standalone |

### Weeks Saved by Deferral

| Deferred Feature Block | Original Weeks | Weeks Saved |
|----------------------|----------------|-------------|
| EDI + Load Board + Safety | 63-70 (8 weeks) | 8 |
| QuickBooks Integration | 48 (2 weeks within accounting) | 2 |
| Commission + Agent | 51-56 (4 weeks within accounting/ops) | 4 |
| Workflow Engine | 65-68 (4 weeks within platform) | 4 |
| Report Builder | 74 (1 week within analytics) | 1 |
| Full GL | 49 (1 week within accounting) | 1 |
| HubSpot Sync | 7-12 (6 weeks) | 4 (keep basic CRM, defer sync) |
| **Total** | -- | **24 weeks saved** |

### Revised Phase A Duration

| Phase | Weeks |
|-------|-------|
| Current Phase A plan | 78 weeks |
| Weeks deferred to Phase B | -24 weeks |
| Buffer sprints added | +6 weeks |
| Staging + dogfooding time | +2 weeks |
| Integration testing time | +4 weeks |
| **Revised Phase A** | **66 weeks** |
| **Remaining for P2 features** | 12 weeks (within original 78) |

This means the core MVP (P0+P1) ships at **week 52**, with P2 features filling weeks 53-66, and weeks 67-78 available for Polish, soft launch, and Phase B preparation.

---

## Appendix: Complete Screen Classification

### By Service and Priority

| Service | P0 | P1 | P2 | P3 | Total |
|---------|----|----|----|----|-------|
| Auth & Admin | 7 | 0 | 3 | 3 | 13 |
| Dashboard Shell | 2 | 0 | 2 | 2 | 6 |
| CRM | 6 | 2 | 2 | 3 | 13 |
| Sales | 4 | 2 | 2 | 3 | 11 |
| TMS Core | 8 | 4 | 1 | 2 | 15 |
| Carrier | 3 | 3 | 3 | 4 | 13 |
| Accounting | 3 | 2 | 5 | 5 | 15 |
| Load Board | 0 | 0 | 0 | 4 | 4 |
| Commission | 0 | 0 | 0 | 4 | 4 |
| Claims | 0 | 0 | 3 | 0 | 3 |
| Documents | 0 | 0 | 4 | 0 | 4 |
| Communication | 0 | 0 | 2 | 2 | 4 |
| Customer Portal | 0 | 0 | 4 | 0 | 4 |
| Carrier Portal | 0 | 0 | 4 | 0 | 4 |
| **Subtotal (classified)** | **33** | **13** | **35** | **32** | **113** |

The remaining ~249 screens from the 362-screen catalog are for Phase C-E verticals and advanced features not relevant to Phase A.

---

*Document Version: 1.0.0*
*Review Date: 2026-02-07*
*Reviewer: Claude Opus 4.6*
