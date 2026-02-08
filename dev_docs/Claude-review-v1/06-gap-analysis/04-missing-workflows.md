# Missing Workflows Analysis

**Application:** Ultra TMS - 3PL Logistics Platform
**Review Date:** 2026-02-07
**Scope:** 8 critical end-to-end business workflows for a 3PL freight broker
**Source Materials:** Prisma schema (257 models), user journey documentation (6 personas, 5 cross-screen flows)

---

## Executive Summary

The Ultra TMS schema and design documentation cover the data structures for most 3PL operations, but several critical end-to-end workflows have gaps in either data modeling, automation, or cross-domain integration. The user journey documentation defines 5 cross-screen flows (Order-to-Delivery, Quote-to-Order, Carrier Onboarding, Invoice-and-Payment, Exception Handling) but lacks detail on financial reconciliation, compliance automation, and new employee/broker onboarding. This analysis examines 8 critical workflows and identifies where the current system has coverage gaps.

---

## Workflow 1: Quote-to-Cash (Full Lifecycle)

### Description
The complete revenue cycle from initial customer quote through load delivery, invoicing, payment collection, and revenue recognition.

### All Steps

| Step | Description | System(s) Involved |
|------|-------------|-------------------|
| 1 | Customer submits RFQ (email, portal, phone, EDI) | CRM, Customer Portal, EDI |
| 2 | Sales rep creates quote with stops, rates, accessorials | Sales/Quoting Module |
| 3 | Rate lookup from rate contracts, market data, fuel surcharge | Rates Module, External Rate APIs |
| 4 | Margin calculation and approval (if below threshold) | Sales Module, Approval Workflow |
| 5 | Quote sent to customer (email, portal, DocuSign) | Communication, Customer Portal |
| 6 | Customer accepts quote | Customer Portal, Sales Module |
| 7 | Quote converts to Order | Sales -> TMS Core |
| 8 | Order validated (credit check, compliance, capacity) | CRM (Credit), Compliance |
| 9 | Order converts to Load | TMS Core |
| 10 | Load assigned to carrier (tender, spot, board posting) | Carrier Module, Load Board |
| 11 | Carrier accepts/confirms | Carrier Portal, EDI |
| 12 | Rate confirmation generated and signed | Documents, E-Sign |
| 13 | Load executed (pickup, transit, check calls, delivery) | TMS Core, GPS Tracking |
| 14 | POD captured and verified | Documents, Carrier Portal |
| 15 | Invoice generated from Order/Load data | Accounting Module |
| 16 | Invoice sent to customer (email, portal, EDI 210) | Communication, EDI |
| 17 | Customer reviews and pays | Customer Portal, AR |
| 18 | Payment received and applied to invoice | AR Module |
| 19 | Revenue recognized in GL | Accounting, Journal Entries |
| 20 | Commission calculated for sales rep and agent | Commission Module |
| 21 | Agent payout processed | Agent Module |
| 22 | Carrier settlement created | AP Module |
| 23 | Carrier settlement paid | AP Module, Payment Processing |
| 24 | Margin and P&L reported | Analytics, Reporting |

### Current Coverage

| Step | Data Model | UI Screen | Automation | Gap Level |
|------|-----------|-----------|------------|-----------|
| 1 | QuoteRequest | Designed | None | Partial |
| 2 | Quote, QuoteStop, QuoteAccessorial | Designed | None | Covered |
| 3 | RateContract, RateData, FuelSurchargeTable | Designed | None | Partial |
| 4 | ApprovalRequest | Designed | None | Partial |
| 5 | CommunicationLog | Designed | None | Gap |
| 6 | Quote.status update | Designed | None | Covered |
| 7 | Quote -> Order conversion | Designed | None | Partial |
| 8 | CreditLimit, CreditHold, ComplianceCheckpoint | Designed | None | Gap |
| 9 | Order -> Load conversion | Designed | None | Partial |
| 10 | LoadTender, LoadPosting, LoadBid | Designed | None | Partial |
| 11 | TenderRecipient, LoadBid | Designed | None | Covered |
| 12 | Contract, Document | Designed | None | Gap |
| 13 | Load, Stop, CheckCall | Designed | None | Covered |
| 14 | Document, CarrierPortalDocument | Designed | None | Partial |
| 15 | Invoice, InvoiceLineItem | Designed | None | Partial |
| 16 | CommunicationLog, EdiMessage | Designed | None | Gap |
| 17 | PortalPayment | Designed | None | Partial |
| 18 | PaymentReceived, PaymentApplication | Designed | None | Partial |
| 19 | JournalEntry, JournalEntryLine | Designed | None | Gap |
| 20 | CommissionEntry, AgentCommission | Designed | None | Gap |
| 21 | AgentPayout | Designed | None | Gap |
| 22 | Settlement, SettlementLineItem | Designed | None | Partial |
| 23 | PaymentMade | Designed | None | Gap |
| 24 | Dashboard, KPISnapshot | Designed | None | Gap |

### Key Gaps

1. **No automated quote-to-order conversion workflow** -- The data models exist (Quote, Order) but no workflow engine connects them. The conversion requires manual steps with no validation pipeline.

2. **No automated credit check on order creation** -- CreditLimit and CreditHold models exist but no workflow triggers a credit check when an order is placed. Missing: automatic hold placement when credit limit exceeded.

3. **No automated invoice generation** -- Invoice model exists but no workflow to auto-generate invoices when POD is confirmed. This is a core 3PL automation requirement.

4. **No automated commission calculation** -- CommissionEntry and CommissionPlan models exist but no engine to automatically calculate commissions when a load is delivered and invoiced.

5. **No GL journal entry automation** -- JournalEntry exists but no workflow to create revenue/expense entries when invoices are sent or settlements are approved.

6. **No rate confirmation document generation** -- DocumentTemplate and GeneratedDocument models exist but no automation to generate and send rate confirmations upon carrier acceptance.

---

## Workflow 2: Carrier Onboarding

### Description
The complete lifecycle of bringing a new carrier into the system, from initial application through qualification, insurance verification, and first load assignment.

### All Steps

| Step | Description | System(s) Involved |
|------|-------------|-------------------|
| 1 | Carrier applies (portal registration, email, referral) | Carrier Portal, CRM |
| 2 | Basic information collected (MC/DOT, legal name, contacts) | Carrier Module |
| 3 | FMCSA SAFER data auto-pulled | FMCSA Integration |
| 4 | Operating authority verified (Common, Contract, Broker) | FMCSA Integration |
| 5 | CSA BASIC scores checked | FMCSA Integration |
| 6 | Safety rating verified | FMCSA Integration |
| 7 | Insurance certificates requested | Communication, Carrier Portal |
| 8 | Insurance uploaded and verified | Documents, Insurance Verification |
| 9 | Insurance coverage validated against requirements | Compliance Module |
| 10 | W-9 collected and verified | Documents, Compliance |
| 11 | Carrier agreement generated and sent for signature | Contracts, E-Sign |
| 12 | Agreement signed and stored | Documents, Contracts |
| 13 | Factoring/NOA status checked | Factoring Module |
| 14 | Payment setup (bank details, payment terms) | Carrier Module |
| 15 | Qualification tier assigned based on scores | Carrier Module |
| 16 | Internal carrier packet review | Approval Workflow |
| 17 | Carrier activated | Carrier Module |
| 18 | Welcome communication sent | Communication Module |
| 19 | First load offered | TMS Core, Load Matching |
| 20 | Ongoing compliance monitoring started | Safety Module, Scheduled Jobs |

### Current Coverage

| Step | Data Model | Automation | Gap Level |
|------|-----------|------------|-----------|
| 1 | CarrierPortalUser, Carrier (status=PENDING) | None | Partial |
| 2 | Carrier (35+ fields) | None | Covered |
| 3 | FmcsaCarrierRecord | None | Gap |
| 4 | FmcsaCarrierRecord (authority fields) | None | Gap |
| 5 | CsaScore (7 BASIC types) | None | Gap |
| 6 | Carrier.fmcsaSafetyRating | None | Gap |
| 7 | CommunicationLog | None | Gap |
| 8 | CarrierDocument, InsuranceCertificate | None | Partial |
| 9 | CarrierInsurance (coverage amounts) | None | Gap |
| 10 | Carrier.w9OnFile, CarrierDocument | None | Partial |
| 11 | Contract, ContractTemplate | None | Gap |
| 12 | Contract.signedAt, Document | None | Gap |
| 13 | CarrierFactoringStatus, NOARecord | None | Partial |
| 14 | Carrier (bank fields) | None | Covered |
| 15 | Carrier.qualificationTier | None | Gap |
| 16 | ApprovalRequest | None | Gap |
| 17 | Carrier.status = ACTIVE | None | Partial |
| 18 | CommunicationLog | None | Gap |
| 19 | LoadTender | None | Gap |
| 20 | FmcsaComplianceLog, SafetyAlert | None | Gap |

### Key Gaps

1. **No FMCSA API integration** -- FmcsaCarrierRecord model is comprehensive (authority, safety, scores) but no integration fetches data from FMCSA SAFER/CSA APIs. Manual entry required for all FMCSA data.

2. **No automated insurance expiration monitoring** -- CarrierInsurance has expirationDate but no scheduled job checks for approaching expirations. No automated notification to carrier when insurance is about to expire.

3. **No qualification scoring engine** -- qualificationTier field exists but no automated calculation based on FMCSA data, insurance status, performance history, and CSA scores.

4. **No carrier onboarding checklist workflow** -- OnboardingChecklist/OnboardingTask models exist for employees but not for carrier onboarding. No state machine tracking which steps are complete.

5. **No automated compliance monitoring** -- FmcsaComplianceLog and SafetyAlert models exist but no scheduled job re-checks FMCSA data or insurance expirations on a recurring basis.

---

## Workflow 3: Claims Resolution

### Description
End-to-end freight claims management from incident detection through investigation, settlement, subrogation, and financial reconciliation.

### All Steps

| Step | Description | System(s) Involved |
|------|-------------|-------------------|
| 1 | Incident detected (customer complaint, driver report, check call anomaly) | TMS Core, Customer Portal |
| 2 | Claim filed with initial details | Claims Module |
| 3 | Claim number generated | Claims Module |
| 4 | Supporting documents collected (photos, BOL, POD) | Documents, Claims |
| 5 | Carrier notified of claim | Communication, Carrier Portal |
| 6 | Investigation initiated | Claims Module |
| 7 | Liability determination | Claims Module |
| 8 | Claim items and values assessed | ClaimItem |
| 9 | Adjustments applied if needed | ClaimAdjustment |
| 10 | Settlement offer prepared | Claims Module |
| 11 | Approval workflow for claim amounts | Approval Workflow |
| 12 | Settlement communicated to claimant | Communication |
| 13 | Payment processed (to customer or from carrier) | AP/AR, Payment Processing |
| 14 | Subrogation initiated against carrier (if applicable) | SubrogationRecord |
| 15 | Carrier deducted from future settlements | Settlement Module |
| 16 | GL entries for claim expense/recovery | Accounting, Journal Entries |
| 17 | Carrier scorecard updated | Carrier Performance |
| 18 | Claim closed | Claims Module |
| 19 | Root cause analysis documented | Claims Module |
| 20 | Prevention measures tracked | Safety Module |

### Current Coverage

| Step | Data Model | Automation | Gap Level |
|------|-----------|------------|-----------|
| 1 | Load, CheckCall, PortalNotification | None | Gap |
| 2 | Claim (comprehensive fields) | None | Covered |
| 3 | Claim.claimNumber | None | Covered |
| 4 | ClaimDocument | None | Covered |
| 5 | CommunicationLog, CarrierPortalNotification | None | Gap |
| 6 | Claim.status = INVESTIGATING | None | Covered |
| 7 | Claim.disposition | None | Covered |
| 8 | ClaimItem (qty, unitPrice, damageType) | None | Covered |
| 9 | ClaimAdjustment | None | Covered |
| 10 | Claim.approvedAmount | None | Partial |
| 11 | ApprovalRequest | None | Gap |
| 12 | CommunicationLog | None | Gap |
| 13 | PaymentMade / PaymentReceived | None | Gap |
| 14 | SubrogationRecord | None | Partial |
| 15 | Settlement deductions | None | Gap |
| 16 | JournalEntry | None | Gap |
| 17 | CarrierPerformanceHistory | None | Gap |
| 18 | Claim.status = CLOSED, closedDate | None | Covered |
| 19 | Claim.rootCause, preventionNotes | None | Covered |
| 20 | SafetyIncident linkage | None | Gap |

### Key Gaps

1. **No automated claim-to-settlement deduction** -- SubrogationRecord exists but no workflow automatically deducts claim amounts from future carrier settlements.

2. **No automated carrier performance impact** -- Claims should automatically update carrier performance scores and potentially trigger watchlist placement. No automation connects Claims to CarrierPerformanceHistory or CarrierWatchlist.

3. **No claim escalation rules** -- EscalationRule model exists generically but no claim-specific escalation (e.g., auto-escalate claims > $10,000 or claims older than 30 days).

4. **No financial reconciliation workflow** -- Claims create financial obligations but no automated GL entry creation for claim expenses, reserves, or recoveries.

---

## Workflow 4: Customer Credit Management

### Description
Ongoing credit risk management including credit applications, limit setting, monitoring, holds, and collections.

### All Steps

| Step | Description | System(s) Involved |
|------|-------------|-------------------|
| 1 | Customer requests credit terms | CRM, Customer Portal |
| 2 | Credit application submitted | CRM, Credit Module |
| 3 | D&B/credit bureau report pulled | External Integration |
| 4 | Trade references contacted | Credit Module |
| 5 | Financial statements reviewed | Documents |
| 6 | Credit score calculated | Credit Module |
| 7 | Credit limit recommended | Credit Module |
| 8 | Approval workflow for limit | Approval Workflow |
| 9 | Credit limit set and communicated | CRM, Communication |
| 10 | Real-time credit utilization tracking | AR Module |
| 11 | Credit limit warning at 80% | Notification Module |
| 12 | Auto-hold at 100% utilization | Credit Module, TMS Core |
| 13 | Aging report monitoring | AR Module, Reporting |
| 14 | Collection activities initiated (30/60/90 day) | Collection Module |
| 15 | Credit limit review triggered | Credit Module, Scheduled Jobs |
| 16 | Credit adjustment based on payment history | Credit Module |
| 17 | Credit hold/release based on payment | Credit Module |
| 18 | Write-off workflow for uncollectible | Accounting, Approval |

### Current Coverage

| Step | Data Model | Automation | Gap Level |
|------|-----------|------------|-----------|
| 1 | Company.creditLimit, Company.paymentTerms | None | Partial |
| 2 | CreditApplication (comprehensive) | None | Covered |
| 3 | Company.dunsNumber | None | Gap |
| 4 | CreditApplication.tradeReferences (Json) | None | Partial |
| 5 | Document | None | Partial |
| 6 | CreditApplication.creditScore | None | Partial |
| 7 | CreditApplication.approvedLimit | None | Covered |
| 8 | ApprovalRequest | None | Gap |
| 9 | CreditLimit (comprehensive) | None | Covered |
| 10 | CreditLimit.usedCredit, availableCredit | None | Gap |
| 11 | KPIAlert, InAppNotification | None | Gap |
| 12 | CreditHold (reason, isActive) | None | Gap |
| 13 | Invoice aging (calculated) | None | Gap |
| 14 | CollectionActivity (comprehensive) | None | Partial |
| 15 | CreditLimit.nextReviewDate | None | Gap |
| 16 | CreditLimit adjustments | None | Gap |
| 17 | CreditHold release | None | Partial |
| 18 | JournalEntry for write-off | None | Gap |

### Key Gaps

1. **No real-time credit utilization tracking** -- CreditLimit has usedCredit/availableCredit fields but no mechanism to automatically update them when orders are created or invoices are paid.

2. **No automated credit hold enforcement** -- CreditHold model exists but no integration with order/load creation to prevent orders when credit is exceeded.

3. **No D&B/credit bureau integration** -- Company.dunsNumber field exists but no API integration to pull credit reports.

4. **No automated collection escalation** -- CollectionActivity model is comprehensive but no scheduled workflow triggers collection activities based on aging thresholds.

5. **No credit review scheduling** -- CreditLimit.nextReviewDate exists but no scheduled job triggers credit reviews.

---

## Workflow 5: Load Exception Handling

### Description
Managing exceptions during load execution including late pickups/deliveries, refused loads, breakdowns, weather delays, and cargo damage.

### All Steps

| Step | Description | System(s) Involved |
|------|-------------|-------------------|
| 1 | Exception detected (missed check call, late GPS, driver report) | TMS Core, GPS Tracking |
| 2 | Exception categorized and severity assessed | TMS Core, Rules Engine |
| 3 | Affected parties notified (dispatcher, customer, carrier) | Communication, Notifications |
| 4 | Status updated on load | TMS Core |
| 5 | Customer notified with updated ETA | Customer Portal, Communication |
| 6 | Escalation triggered if unresolved | Escalation Rules |
| 7 | Resolution actions taken (re-route, re-assign, etc.) | TMS Core, Dispatch |
| 8 | Resolution documented | TMS Core, StatusHistory |
| 9 | Financial impact assessed (detention, layover, accessorial) | Accounting |
| 10 | Accessorial charges applied | Invoice/Settlement |
| 11 | Carrier scorecard updated | Carrier Performance |
| 12 | Customer satisfaction follow-up | CRM, Communication |
| 13 | Root cause analysis | Analytics |

### Current Coverage

| Step | Data Model | Automation | Gap Level |
|------|-----------|------------|-----------|
| 1 | CheckCall, Load.status | None | Gap |
| 2 | StatusHistory | None | Gap |
| 3 | InAppNotification, CommunicationLog | None | Gap |
| 4 | Load.status, LoadHistory | None | Covered |
| 5 | PortalNotification | None | Gap |
| 6 | EscalationRule | None | Gap |
| 7 | Load reassignment | None | Partial |
| 8 | LoadHistory, StatusHistory | None | Covered |
| 9 | InvoiceLineItem (accessorial) | None | Gap |
| 10 | InvoiceLineItem, SettlementLineItem | None | Gap |
| 11 | CarrierPerformanceHistory | None | Gap |
| 12 | Activity, CommunicationLog | None | Gap |
| 13 | LaneAnalytics | None | Gap |

### Key Gaps

1. **No automated exception detection** -- No rules engine monitors check call frequency, GPS position vs. expected position, or ETA variance. All exceptions are manually identified.

2. **No escalation engine** -- EscalationRule model exists with triggerType, conditions, and actionConfig but no execution engine processes these rules.

3. **No automated customer notification** -- When a load is delayed, there is no automated mechanism to notify the customer with updated ETA. The user journey doc describes this as manual.

4. **No detention/layover auto-calculation** -- No automation to detect detention time (truck waiting at facility) and auto-generate accessorial charges.

---

## Workflow 6: End-of-Day Reconciliation

### Description
Daily operational and financial reconciliation ensuring all loads, invoices, settlements, and cash positions are accounted for.

### All Steps

| Step | Description | System(s) Involved |
|------|-------------|-------------------|
| 1 | All active loads status verified | TMS Core, GPS |
| 2 | Check calls reviewed for completeness | TMS Core |
| 3 | Delivered loads matched to PODs | Documents |
| 4 | Invoices generated for delivered loads | Accounting |
| 5 | Uninvoiced delivered loads flagged | Reporting |
| 6 | Settlements created for delivered loads | AP Module |
| 7 | Unsettled delivered loads flagged | Reporting |
| 8 | Cash receipts applied to invoices | AR Module |
| 9 | Unapplied cash identified | AR Module |
| 10 | Bank reconciliation | Accounting |
| 11 | Commission calculations run | Commission Module |
| 12 | Exception report generated | Reporting |
| 13 | Dashboard updated with daily metrics | Analytics |
| 14 | Manager notification of open items | Communication |

### Current Coverage

| Step | Data Model | Automation | Gap Level |
|------|-----------|------------|-----------|
| 1 | Load.status, CheckCall | None | Gap |
| 2 | CheckCall timestamps | None | Gap |
| 3 | Document (POD), Load.status | None | Gap |
| 4 | Invoice, InvoiceLineItem | None | Gap |
| 5 | Report, ReportExecution | None | Gap |
| 6 | Settlement, SettlementLineItem | None | Gap |
| 7 | Report | None | Gap |
| 8 | PaymentReceived, PaymentApplication | None | Gap |
| 9 | PaymentReceived (unapplied) | None | Gap |
| 10 | JournalEntry | None | Gap |
| 11 | CommissionEntry | None | Gap |
| 12 | Report, ReportExecution | None | Gap |
| 13 | Dashboard, KPISnapshot | None | Gap |
| 14 | InAppNotification | None | Gap |

### Key Gaps

**This entire workflow is a gap.** The data models exist across multiple domains, but there is no orchestration layer that:
- Identifies delivered-but-uninvoiced loads
- Auto-generates invoices from delivered loads
- Auto-creates settlements from delivered loads
- Runs daily reconciliation reports
- Flags discrepancies

This is one of the most critical workflows for a brokerage's financial health. Without it, revenue leakage and payment delays are inevitable.

---

## Workflow 7: Month-End Accounting Close

### Description
Monthly financial close process including GL reconciliation, accruals, revenue recognition, and financial reporting.

### All Steps

| Step | Description | System(s) Involved |
|------|-------------|-------------------|
| 1 | Period cutoff established | Accounting |
| 2 | All open invoices reviewed | AR Module |
| 3 | Revenue accruals for delivered-but-uninvoiced loads | Accounting |
| 4 | Expense accruals for unsettled loads | Accounting |
| 5 | Commission accruals calculated | Commission Module |
| 6 | Bad debt reserve adjusted | AR, Accounting |
| 7 | Intercompany eliminations | Accounting |
| 8 | Trial balance generated | Accounting |
| 9 | Variance analysis vs. prior period/budget | Reporting |
| 10 | Manager review and approval | Approval Workflow |
| 11 | Period closed (no further entries) | Accounting |
| 12 | Financial statements generated (P&L, BS, CF) | Reporting |
| 13 | QuickBooks sync | Integration |
| 14 | Tax reporting data prepared | Accounting |

### Current Coverage

| Step | Data Model | Automation | Gap Level |
|------|-----------|------------|-----------|
| 1 | No period model | None | Gap |
| 2 | Invoice list with filters | None | Partial |
| 3 | JournalEntry (manual) | None | Gap |
| 4 | JournalEntry (manual) | None | Gap |
| 5 | CommissionEntry (manual) | None | Gap |
| 6 | CollectionActivity (no reserve model) | None | Gap |
| 7 | No intercompany model | None | Gap |
| 8 | ChartOfAccount.balance | None | Gap |
| 9 | Report, KPISnapshot | None | Gap |
| 10 | ApprovalRequest | None | Gap |
| 11 | No period close mechanism | None | Gap |
| 12 | Report, ReportTemplate | None | Gap |
| 13 | QuickbooksSyncLog | None | Partial |
| 14 | No tax reporting model | None | Gap |

### Key Gaps

1. **No accounting period model** -- No model to define fiscal periods, track which are open/closed, or prevent entries in closed periods.

2. **No automated accrual process** -- Revenue and expense accruals for in-transit loads at month-end are critical for GAAP compliance. No automation exists.

3. **No trial balance generation** -- ChartOfAccount has a balance field but no mechanism to generate or validate a trial balance.

4. **No period close enforcement** -- No mechanism to prevent journal entries or invoice modifications in closed periods.

5. **No financial statement generation** -- ReportTemplate exists but no financial-statement-specific templates or generation logic.

---

## Workflow 8: New Broker Onboarding

### Description
Onboarding a new brokerage company (tenant) onto the platform, including company setup, user creation, configuration, and data migration.

### All Steps

| Step | Description | System(s) Involved |
|------|-------------|-------------------|
| 1 | Tenant created | Admin Module |
| 2 | Company profile configured | Admin Module |
| 3 | Admin user created | Auth Module |
| 4 | Roles and permissions configured | Auth Module |
| 5 | System configuration (numbering, defaults) | Config Module |
| 6 | Locations/offices set up | Location Module |
| 7 | Chart of accounts initialized | Accounting |
| 8 | Communication templates configured | Communication Module |
| 9 | Document templates configured | Document Module |
| 10 | Integration credentials configured | Integration Module |
| 11 | EDI trading partners set up | EDI Module |
| 12 | Rate contracts imported | Rate Module |
| 13 | Customer data migrated | CRM Module |
| 14 | Carrier data migrated | Carrier Module |
| 15 | Historical load data migrated | TMS Core |
| 16 | Users created and trained | Auth, HR Module |
| 17 | Branding configured | Portal Branding |
| 18 | Go-live checklist verified | Compliance |
| 19 | Monitoring and alerts configured | Analytics, Alerts |

### Current Coverage

| Step | Data Model | Automation | Gap Level |
|------|-----------|------------|-----------|
| 1 | Tenant model (250+ relations) | None | Covered |
| 2 | Tenant fields | None | Covered |
| 3 | User model | None | Covered |
| 4 | Role model (permissions Json) | None | Partial |
| 5 | SystemConfig, NumberSequence | None | Partial |
| 6 | Location model | None | Covered |
| 7 | ChartOfAccount model | None | Gap |
| 8 | CommunicationTemplate | None | Partial |
| 9 | DocumentTemplate | None | Partial |
| 10 | Integration, IntegrationProviderConfig | None | Partial |
| 11 | EdiTradingPartner | None | Partial |
| 12 | RateContract, ContractLaneRate | None | Partial |
| 13 | Company, Contact (externalId/sourceSystem) | None | Partial |
| 14 | Carrier (externalId/sourceSystem) | None | Partial |
| 15 | Load, Order (externalId/sourceSystem) | None | Partial |
| 16 | User, Employee | None | Partial |
| 17 | PortalBranding | None | Covered |
| 18 | ComplianceCheckpoint | None | Gap |
| 19 | KPIAlert, AuditAlert | None | Gap |

### Key Gaps

1. **No tenant setup wizard** -- No guided workflow for configuring a new tenant. Admins must manually configure each component.

2. **No default chart of accounts** -- No seed data or template to initialize the chart of accounts for a new brokerage tenant.

3. **No data migration tooling** -- Migration-first fields (externalId, sourceSystem) are present on all models but no import pipeline, CSV upload, or API bulk-import exists.

4. **No go-live checklist** -- ComplianceCheckpoint exists generically but no brokerage-specific checklist validates that all critical configurations are in place before going live.

5. **No default role templates** -- Role permissions are stored as Json but no predefined role templates (Dispatcher, Sales Rep, Accounting, etc.) are seeded for new tenants.

---

## Cross-Workflow Gap Summary

### Missing Automation Engine
The most significant cross-cutting gap is the absence of a workflow execution engine. The `Workflow`, `WorkflowStep`, `WorkflowExecution`, and `StepExecution` models exist in the schema, but there is no evidence of an engine that:
- Evaluates workflow triggers
- Executes step actions
- Handles branching and conditions
- Manages retries and error handling
- Provides visibility into running workflows

### Missing Scheduled Job Infrastructure
`ScheduledJob`, `ScheduledTask`, and `JobExecution` models exist but no scheduler implementation is evident. Critical scheduled jobs needed:
- Insurance expiration monitoring (daily)
- Credit limit utilization updates (real-time or hourly)
- FMCSA compliance re-checks (weekly)
- Aging report generation (daily)
- Commission calculations (per-period)
- Check call frequency monitoring (every 2 hours)
- Invoice auto-generation for delivered loads (daily)

### Missing Event-Driven Architecture
Many workflows require event-driven triggers (e.g., "when load status changes to DELIVERED, generate invoice"). No event bus, pub/sub, or CQRS pattern is implemented. The schema has `WebhookEndpoint` and `WebhookSubscription` for external events, but internal event handling is absent.

---

## Recommendations

### Priority 1: Build Workflow Engine (Weeks 1-4)
Implement an internal event bus using NestJS EventEmitter or Bull/BullMQ and connect the existing Workflow/WorkflowStep models to actual execution logic.

### Priority 2: Implement Scheduled Jobs (Weeks 2-4)
Use Bull/BullMQ with Redis to implement critical scheduled jobs. Start with insurance monitoring, aging reports, and daily reconciliation.

### Priority 3: Automate Quote-to-Cash (Weeks 3-8)
Implement the core revenue cycle automation: Quote -> Order -> Load -> Invoice -> Payment -> GL.

### Priority 4: Build Carrier Onboarding Wizard (Weeks 4-6)
Create a step-by-step onboarding flow with FMCSA integration, insurance verification, and qualification scoring.

### Priority 5: Add Accounting Period Management (Weeks 5-8)
Add an AccountingPeriod model and enforce period-based entry restrictions.

### Priority 6: Implement Credit Management Automation (Weeks 6-8)
Connect credit limits to order creation, automate hold enforcement, and build collection escalation workflows.
