# Test 3: Prisma Schema as Source of Truth

**Date:** 2026-03-09
**Scope:** All 38 hub files vs `apps/api/prisma/schema.prisma` (260 models, 114 enums)
**Methodology:** For each hub's Section 8 (Data Model), verify every claimed model exists in the schema (case-sensitive), compare field counts, and reverse-check backend module code for undocumented model usage.

---

## Summary Verdict

| Metric | Value |
|--------|-------|
| Total model claims across all hubs | ~270 (including cross-hub duplicates) |
| Unique models claimed | ~210 of 260 schema models |
| **Model existence accuracy** | **99.3%** (268/270 confirmed) |
| **Field count accuracy** | **26%** (56/217 countable within +/-2) |
| Phantom models (hub claims, schema lacks) | **2** |
| Name mismatches (wrong case or old name) | **1** |
| Missing from hub (code uses, hub omits) | **16** |
| Orphan models (in schema, zero code refs) | **18+** |

**Bottom line:** Hub authors got model *names* right 99% of the time, but field *counts* are systematically undercounted (74% of models are 3+ fields off). The root cause is that hubs omit the ~6 standard scaffold fields (`externalId`, `sourceSystem`, `customFields`, `createdById`, `updatedById`, `deletedAt`) present on nearly every model.

---

## Per-Hub Results

### Hub 01: Auth & Admin

| Model | In Hub? | In Prisma? | Hub Fields | Prisma Fields | Match? |
|-------|---------|------------|------------|---------------|--------|
| User | Yes | Yes | 27 | 26 | MATCH |
| Role | Yes | Yes | 10 | 14 | PARTIAL (-4) |
| Tenant | Yes | Yes | 14 | 19 | PARTIAL (-5) |
| AuditLog | Yes | Yes | 15 | 20 | PARTIAL (-5) |
| Session | No | Yes | -- | 13 | MISSING FROM HUB |
| PasswordResetToken | No | Yes | -- | 11 | MISSING FROM HUB |

**Field accuracy: 1/4 (25%). 0 phantoms. 2 missing from hub.**

---

### Hub 02: Dashboard Shell

| Model | In Hub? | In Prisma? | Hub Fields | Prisma Fields | Match? |
|-------|---------|------------|------------|---------------|--------|
| Dashboard | Yes | Yes | -- | 16 | EXISTS (no count claimed) |
| DashboardWidget | Yes | Yes | -- | 19 | EXISTS (no count claimed) |

**Existence: 2/2 (100%). No field counts to verify.**

---

### Hub 03: CRM / Customers

| Model | In Hub? | In Prisma? | Hub Fields | Prisma Fields | Match? |
|-------|---------|------------|------------|---------------|--------|
| Company | Yes | Yes | 42 | 39 | PARTIAL (+3) |
| Contact | Yes | Yes | 24 | 28 | PARTIAL (-4) |
| Opportunity | Yes | Yes | 26 | 28 | MATCH |
| Activity | Yes | Yes | 17 | 26 | PARTIAL (-9) |
| HubspotSyncLog | Yes | Yes | 13 | 15 | MATCH |

**Field accuracy: 2/5 (40%). 0 phantoms. 0 missing.**

---

### Hub 04: Sales & Quotes

| Model | In Hub? | In Prisma? | Hub Fields | Prisma Fields | Match? |
|-------|---------|------------|------------|---------------|--------|
| Quote | Yes | Yes | 50+ | 58 | PARTIAL (-8) |
| QuoteStop | Yes | Yes | 25+ | 27 | MATCH |
| RateContract | Yes | Yes | 20+ | 22 | MATCH |
| ContractLaneRate | Yes | Yes | 25+ | 31 | PARTIAL (-6) |
| AccessorialRate | Yes | Yes | 15+ | 18 | PARTIAL (-3) |
| SalesQuota | No | Yes | -- | -- | MISSING FROM HUB |

**Field accuracy: 2/5 (40%). 0 phantoms. 1 missing from hub.**

---

### Hub 05: TMS Core

| Model | In Hub? | In Prisma? | Hub Fields | Prisma Fields | Match? |
|-------|---------|------------|------------|---------------|--------|
| Order | Yes | Yes | many | 40 | EXISTS |
| Load | Yes | Yes | many | 35 | EXISTS |
| Stop | Yes | Yes | many | 33 | EXISTS |
| CheckCall | Yes | Yes | 22 | 21 | MATCH |
| TrackingEvent | Yes | **No** | -- | -- | **PHANTOM** |
| StatusHistory | No | Yes | -- | -- | MISSING FROM HUB |
| OrderItem | No | Yes | -- | -- | MISSING FROM HUB |

**Field accuracy: 1/1 countable (100%). 1 PHANTOM. 2 missing from hub.**

---

### Hub 06: Carrier Management

| Model | In Hub? | In Prisma? | Hub Fields | Prisma Fields | Match? |
|-------|---------|------------|------------|---------------|--------|
| OperationsCarrier | Yes | Yes | ~45 | 53 | PARTIAL (-8) |
| OperationsCarrierDriver | Yes | Yes | 25 | 30 | PARTIAL (-5) |
| OperationsCarrierTruck | Yes | Yes | 33 | 36 | PARTIAL (-3) |
| OperationsCarrierDocument | Yes | Yes | 16 | 18 | MATCH |
| Carrier | Yes | Yes | 70 | 103 | PARTIAL (-33) |
| CarrierContact | Yes | Yes | 21 | 26 | PARTIAL (-5) |
| CarrierDriver | Yes | **No** | 14 | -- | **PHANTOM** (actual: `Driver`) |
| CarrierInsurance | Yes | Yes* | 13 | 27 | **NAME MISMATCH** (schema: `InsuranceCertificate`) |
| Driver | No | Yes | -- | 36 | MISSING FROM HUB |
| InsuranceCertificate | No | Yes | -- | 30 | MISSING FROM HUB |
| FmcsaComplianceLog | No | Yes | -- | 30 | MISSING FROM HUB |

**Field accuracy: 1/7 (14%). 1 PHANTOM. 1 NAME MISMATCH. 3 missing from hub.**

---

### Hub 07: Accounting

| Model | In Hub? | In Prisma? | Hub Fields | Prisma Fields | Match? |
|-------|---------|------------|------------|---------------|--------|
| Invoice | Yes | Yes | many | 47 | EXISTS |
| InvoiceLineItem | Yes | Yes | 17 | 25 | PARTIAL (-8) |
| Settlement | Yes | Yes | many | 44 | EXISTS |
| SettlementLineItem | Yes | Yes | 12 | 23 | PARTIAL (-11) |
| PaymentReceived | Yes | Yes | many | 26 | EXISTS |
| PaymentMade | Yes | Yes | many | 25 | EXISTS |
| PaymentApplication | Yes | Yes | 11 | 16 | PARTIAL (-5) |
| ChartOfAccount | Yes | Yes | many | 29 | EXISTS |
| JournalEntry | Yes | Yes | many | 20 | EXISTS |
| JournalEntryLine | Yes | Yes | 15 | 22 | PARTIAL (-7) |
| PaymentPlan | Yes | Yes | 14 | 35 | PARTIAL (-21) |

**Field accuracy: 0/5 countable (0%). PaymentPlan worst delta (-21).**

---

### Hub 08: Commission

| Model | In Hub? | In Prisma? | Hub Fields | Prisma Fields | Match? |
|-------|---------|------------|------------|---------------|--------|
| CommissionEntry | Yes | Yes | 31 | 38 | PARTIAL (-7) |
| CommissionPlan | Yes | Yes | 22 | 26 | PARTIAL (-4) |
| CommissionPlanTier | Yes | Yes | 16 | 19 | PARTIAL (-3) |
| UserCommissionAssignment | Yes | Yes | 17 | 22 | PARTIAL (-5) |
| CommissionPayout | Yes | Yes | 23 | 30 | PARTIAL (-7) |
| AgentCommission | Yes | Yes | 22 | 32 | PARTIAL (-10) |
| AgentPayout | Yes | Yes | 23 | 24 | MATCH |

**Field accuracy: 1/7 (14%). 0 phantoms.**

---

### Hub 09: Load Board

| Model | In Hub? | In Prisma? | Hub Fields | Prisma Fields | Match? |
|-------|---------|------------|------------|---------------|--------|
| LoadPosting | Yes | Yes | ~43 | 48 | PARTIAL (-5) |
| LoadBid | Yes | Yes | 25 | 33 | PARTIAL (-8) |
| LoadTender | Yes | Yes | 17 | 23 | PARTIAL (-6) |
| LoadBoardAccount | Yes | Yes | 16 | 24 | PARTIAL (-8) |
| LoadBoardProvider | Yes | Yes | 17 | 25 | PARTIAL (-8) |
| TenderRecipient | Yes | Yes | -- | 23 | EXISTS |
| CapacityResult | No | Yes | -- | 30 | MISSING FROM HUB |
| CapacitySearch | No | Yes | -- | 26 | MISSING FROM HUB |
| CarrierCapacity | No | Yes | -- | 25 | MISSING FROM HUB |
| PostLead | No | Yes | -- | 32 | MISSING FROM HUB |
| PostingRule | No | Yes | -- | 21 | MISSING FROM HUB |

**Field accuracy: 0/5 countable (0%). 0 phantoms. 5 missing from hub (most of any hub).**

---

### Hub 10: Claims

| Model | In Hub? | In Prisma? | Hub Fields | Prisma Fields | Match? |
|-------|---------|------------|------------|---------------|--------|
| Claim | Yes | Yes | 36 | 36 | MATCH |
| ClaimItem | Yes | Yes | 17 | 17 | MATCH |
| ClaimDocument | Yes | Yes | 14 | 14 | MATCH |
| ClaimNote | Yes | Yes | 14 | 14 | MATCH |
| ClaimTimeline | Yes | Yes | 15 | 16 | MATCH |
| ClaimAdjustment | Yes | Yes | 16 | 16 | MATCH |
| ClaimContact | Yes | Yes | 19 | 19 | MATCH |
| SubrogationRecord | Yes | Yes | 23 | 24 | MATCH |

**Field accuracy: 8/8 (100%). 0 phantoms. 0 missing. BEST HUB.**

---

### Hub 11: Documents

| Model | In Hub? | In Prisma? | Hub Fields | Prisma Fields | Match? |
|-------|---------|------------|------------|---------------|--------|
| Document | Yes | Yes | ~37 | 40 | PARTIAL (-3) |
| DocumentFolder | Yes | Yes | ~14 | 17 | PARTIAL (-3) |
| FolderDocument | Yes | Yes | ~10 | 11 | MATCH |
| DocumentTemplate | Yes | Yes | ~22 | 26 | PARTIAL (-4) |
| DocumentShare | Yes | Yes | 18 | 23 | PARTIAL (-5) |
| GeneratedDocument | Yes | Yes | 15 | 19 | PARTIAL (-4) |

**Field accuracy: 1/6 (17%). 0 phantoms. 0 missing.**

---

### Hub 12: Communication

| Model | In Hub? | In Prisma? | Hub Fields | Prisma Fields | Match? |
|-------|---------|------------|------------|---------------|--------|
| CommunicationTemplate | Yes | Yes | 24 | 24 | MATCH |
| InAppNotification | Yes | Yes | 21 | 21 | MATCH |
| CommunicationLog | Yes | Yes | 29 | 37 | PARTIAL (-8) |
| NotificationPreference | Yes | Yes | 20 | 26 | PARTIAL (-6) |
| SmsConversation | Yes | Yes | 16 | 19 | PARTIAL (-3) |
| SmsMessage | Yes | Yes | 17 | 20 | PARTIAL (-3) |

**Field accuracy: 2/6 (33%). 0 phantoms. 0 missing.**

---

### Hub 13: Customer Portal

| Model | In Hub? | In Prisma? | Hub Fields | Prisma Fields | Match? |
|-------|---------|------------|------------|---------------|--------|
| PortalUser | Yes | Yes | 23 | 23 | MATCH |
| PortalSession | Yes | Yes | 12 | 16 | PARTIAL (-4) |
| PortalPayment | Yes | Yes | 17 | 22 | PARTIAL (-5) |
| PortalSavedPaymentMethod | Yes | Yes | 17 | 24 | PARTIAL (-7) |
| PortalActivityLog | Yes | Yes | 13 | 18 | PARTIAL (-5) |
| PortalNotification | Yes | Yes | 14 | 19 | PARTIAL (-5) |
| PortalBranding | Yes | Yes | 15 | 22 | PARTIAL (-7) |
| QuoteRequest | Yes | Yes | 27 | 39 | PARTIAL (-12) |

**Field accuracy: 1/8 (13%). 0 phantoms. PortalBranding has 0 code refs.**

---

### Hub 14: Carrier Portal

| Model | In Hub? | In Prisma? | Hub Fields | Prisma Fields | Match? |
|-------|---------|------------|------------|---------------|--------|
| CarrierPortalUser | Yes | Yes | 23 | 23 | MATCH |
| CarrierPortalSession | Yes | Yes | 16 | 17 | MATCH |
| CarrierPortalDocument | Yes | Yes | 22 | 23 | MATCH |
| CarrierPortalNotification | Yes | Yes | 18 | 19 | MATCH |
| CarrierPortalActivityLog | Yes | Yes | 19 | 18 | MATCH |
| CarrierSavedLoad | Yes | Yes | 16 | 16 | MATCH |
| CarrierInvoiceSubmission | Yes | Yes | 17 | 21 | PARTIAL (-4) |
| CarrierQuickPayRequest | Yes | Yes | 21 | 23 | MATCH |

**Field accuracy: 7/8 (88%). 0 phantoms. 0 missing.**

---

### Hub 15: Contracts

| Model | In Hub? | In Prisma? | Hub Fields | Prisma Fields | Match? |
|-------|---------|------------|------------|---------------|--------|
| Contract | Yes | Yes | ~27 | 41 | PARTIAL (-14) |
| ContractAmendment | Yes | Yes | ~10 | 24 | PARTIAL (-14) |
| ContractRateTable | Yes | Yes | 13 | 18 | PARTIAL (-5) |
| ContractRateLane | Yes | Yes | ~9 | 25 | PARTIAL (-16) |
| ContractSLA | Yes | Yes | ~11 | 19 | PARTIAL (-8) |
| ContractClause | Yes | Yes | 16 | 17 | MATCH |
| VolumeCommitment | Yes | Yes | 14 | 24 | PARTIAL (-10) |
| FuelSurchargeTable | Yes | Yes | 15 | 22 | PARTIAL (-7) |
| FuelSurchargeTier | Yes | Yes | 7 | 15 | PARTIAL (-8). Confirmed: NO tenantId |
| ContractTemplate | Yes | Yes | 13 | 17 | PARTIAL (-4) |
| ContractMetric | Yes | Yes | ~20 | 22 | MATCH |
| ContractLaneRate | Yes | Yes | 35 | 36 | MATCH |
| RateContract | Yes | Yes | 23 | 27 | PARTIAL (-4) |

**Field accuracy: 3/13 (23%). 0 phantoms. FuelSurchargeTier missing tenantId (P0 bug confirmed).**

---

### Hub 16: Agents

| Model | In Hub? | In Prisma? | Hub Fields | Prisma Fields | Match? |
|-------|---------|------------|------------|---------------|--------|
| Agent | Yes | Yes | 43 | 54 | PARTIAL (-11) |
| AgentAgreement | Yes | Yes | 25 | 29 | PARTIAL (-4) |
| AgentCommission | Yes | Yes | 23 | 32 | PARTIAL (-9) |
| AgentCustomerAssignment | Yes | Yes | 24 | 28 | PARTIAL (-4) |
| AgentLead | Yes | Yes | 31 | 35 | PARTIAL (-4) |
| AgentPayout | Yes | Yes | 20 | 24 | PARTIAL (-4) |
| AgentContact | Yes | Yes | 14 | 17 | PARTIAL (-3) |
| AgentDrawBalance | Yes | Yes | 14 | 14 | MATCH |
| AgentPortalUser | Yes | Yes | 15 | 19 | PARTIAL (-4) |

**Field accuracy: 1/9 (11%). 0 phantoms. AgentDrawBalance is orphan (zero code refs anywhere).**

---

### Hub 17: Credit

| Model | In Hub? | In Prisma? | Hub Fields | Prisma Fields | Match? |
|-------|---------|------------|------------|---------------|--------|
| CreditApplication | Yes | Yes | 22 | 42 | PARTIAL (-20) |
| CreditLimit | Yes | Yes | 18 | 28 | PARTIAL (-10) |
| CreditHold | Yes | Yes | 12 | 21 | PARTIAL (-9) |
| CollectionActivity | Yes | Yes | 8 | 28 | PARTIAL (-20) |
| PaymentPlan | Yes | Yes | 13 | 35 | PARTIAL (-22) |

**Field accuracy: 0/5 (0%). Hub's own "noted actual" corrections were also wrong. WORST FIELD ACCURACY.**

---

### Hub 18: Factoring Internal

| Model | In Hub? | In Prisma? | Hub Fields | Prisma Fields | Match? |
|-------|---------|------------|------------|---------------|--------|
| FactoringCompany | Yes | Yes | 21 | 25 | PARTIAL (-4) |
| CarrierFactoringStatus | Yes | Yes | 17 | 20 | PARTIAL (-3) |
| NOARecord | Yes | Yes | 23 | 28 | PARTIAL (-5) |
| FactoredPayment | Yes | Yes | 17 | 20 | PARTIAL (-3) |
| FactoringVerification | Yes | Yes | 19 | 21 | MATCH |

**Field accuracy: 1/5 (20%). 0 phantoms.**

---

### Hub 19: Analytics

| Model | In Hub? | In Prisma? | Hub Fields | Prisma Fields | Match? |
|-------|---------|------------|------------|---------------|--------|
| KPIDefinition | Yes | Yes | 17 | 26 | PARTIAL (-9) |
| KPISnapshot | Yes | Yes | 11 | 18 | PARTIAL (-7) |
| KPIAlert | Yes | Yes | 13 | 19 | PARTIAL (-6) |
| Dashboard | Yes | Yes | 11 | 18 | PARTIAL (-7) |
| DashboardWidget | Yes | Yes | 14 | 22 | PARTIAL (-8) |
| Report | Yes | Yes | 16 | 23 | PARTIAL (-7) |
| ReportExecution | Yes | Yes | 13 | 22 | PARTIAL (-9) |
| ReportTemplate | Yes | Yes | 12 | 19 | PARTIAL (-7) |
| SavedAnalyticsView | Yes | Yes | 12 | 19 | PARTIAL (-7) |
| AnalyticsCache | Yes | Yes | 10 | 10 | MATCH |
| LaneAnalytics | Yes | Yes | 17 | 25 | PARTIAL (-8) |

**Field accuracy: 1/11 (9%). 0 phantoms. LaneAnalytics orphan in analytics (used by rate-intelligence).**

---

### Hub 20: Workflow

| Model | In Hub? | In Prisma? | Hub Fields | Prisma Fields | Match? |
|-------|---------|------------|------------|---------------|--------|
| Workflow | Yes | Yes | 13 | 21 | PARTIAL (-8) |
| WorkflowTemplate | Yes | Yes | 12 | 18 | PARTIAL (-6) |
| WorkflowStep | Yes | Yes | 11 | 21 | PARTIAL (-10) |
| WorkflowExecution | Yes | Yes | 12 | 20 | PARTIAL (-8) |
| StepExecution | Yes | Yes | 16 | 22 | PARTIAL (-6) |
| ApprovalRequest | Yes | Yes | 20 | 24 | PARTIAL (-4) |
| ScheduledWorkflowRun | Yes | Yes | 8 | 17 | PARTIAL (-9) |

**Field accuracy: 0/7 (0%). 0 phantoms.**

---

### Hub 21: Integration Hub

| Model | In Hub? | In Prisma? | Hub Fields | Prisma Fields | Match? |
|-------|---------|------------|------------|---------------|--------|
| Integration | Yes | Yes | 23 | 28 | PARTIAL (-5) |
| SyncJob | Yes | Yes | 19 | 21 | MATCH |
| TransformationTemplate | Yes | Yes | 12 | 16 | PARTIAL (-4) |
| WebhookEndpoint | Yes | Yes | 15 | 19 | PARTIAL (-4) |
| WebhookSubscription | Yes | Yes | 11 | 16 | PARTIAL (-5) |
| APIRequestLog | Yes | Yes | 11 | 13 | MATCH |
| CircuitBreakerStateRecord | Yes | Yes | 10 | 18 | PARTIAL (-8) |
| IntegrationProviderConfig | Yes | Yes | 12 | 18 | PARTIAL (-6) |
| WebhookDelivery | Yes | Yes | 14 | 27 | PARTIAL (-13) |

**Field accuracy: 2/9 (22%). 0 phantoms. CircuitBreakerStateRecord has 0 code refs.**

---

### Hub 22: Search

| Model | In Hub? | In Prisma? | Hub Fields | Prisma Fields | Match? |
|-------|---------|------------|------------|---------------|--------|
| SavedSearch | Yes | Yes | 14 | 18 | PARTIAL (-4) |
| SearchHistory | Yes | Yes | 13 | 15 | MATCH |
| SearchIndex | Yes | Yes | 13 | 17 | PARTIAL (-4) |
| SearchIndexQueue | Yes | Yes | 13 | 18 | PARTIAL (-5) |
| SearchSuggestion | Yes | Yes | 11 | 16 | PARTIAL (-5) |
| SearchSynonym | Yes | Yes | 11 | 15 | PARTIAL (-4) |

**Field accuracy: 1/6 (17%). 0 phantoms.**

---

### Hub 23: HR

| Model | In Hub? | In Prisma? | Hub Fields | Prisma Fields | Match? |
|-------|---------|------------|------------|---------------|--------|
| Employee | Yes | Yes | 29 | 40 | PARTIAL (-11) |
| Department | Yes | Yes | 15 | 20 | PARTIAL (-5) |
| Position | Yes | Yes | 15 | 20 | PARTIAL (-5) |
| Location | Yes | Yes | 18 | 24 | PARTIAL (-6) |
| TimeEntry | Yes | Yes | 17 | 21 | PARTIAL (-4) |
| TimeOffRequest | Yes | Yes | 17 | 24 | PARTIAL (-7) |
| TimeOffBalance | Yes | Yes | 13 | 18 | PARTIAL (-5) |
| EmploymentHistory | Yes | Yes | 14 | 22 | PARTIAL (-8) |
| OnboardingChecklist | Yes | Yes | 13 | 17 | PARTIAL (-4) |
| OnboardingTask | Yes | Yes | 14 | 21 | PARTIAL (-7) |

**Field accuracy: 0/10 (0%). 0 phantoms. OnboardingChecklist + OnboardingTask have 0 code refs.**

---

### Hub 24: Scheduler

| Model | In Hub? | In Prisma? | Hub Fields | Prisma Fields | Match? |
|-------|---------|------------|------------|---------------|--------|
| ScheduledJob | Yes | Yes | 28 | 47 | PARTIAL (-19) |
| JobExecution | Yes | Yes | 19 | 28 | PARTIAL (-9) |
| JobLock | Yes | Yes | 7 | 8 | MATCH |
| JobTemplate | Yes | Yes | 11 | 11 | MATCH |
| ScheduledTask | Yes | Yes | 17 | 29 | PARTIAL (-12) |
| Reminder | Yes | Yes | 23 | 34 | PARTIAL (-11) |
| JobAlert | Yes | Yes | 11 | 9 | MATCH |
| JobDependency | Yes | Yes | 5 | 7 | MATCH |

**Field accuracy: 4/8 (50%). 0 phantoms. ScheduledJob has worst delta (-19).**

---

### Hub 25: Safety

| Model | In Hub? | In Prisma? | Hub Fields | Prisma Fields | Match? |
|-------|---------|------------|------------|---------------|--------|
| SafetyAlert | Yes | Yes | 21 | 24 | PARTIAL (-3) |
| SafetyIncident | Yes | Yes | 24 | 32 | PARTIAL (-8) |
| SafetyInspection | Yes | Yes | 22 | 27 | PARTIAL (-5) |
| SafetyAuditTrail | Yes | Yes | 12 | 17 | PARTIAL (-5) |
| CsaScore | Yes | Yes | 19 | 26 | PARTIAL (-7) |
| DriverQualificationFile | Yes | Yes | 20 | 24 | PARTIAL (-4) |
| FmcsaCarrierRecord | Yes | Yes | 30 | 36 | PARTIAL (-6) |
| CarrierInsurance | Yes | Yes | 20 | 27 | PARTIAL (-7) |
| CarrierWatchlist | Yes | Yes | 17 | 23 | PARTIAL (-6) |

**Field accuracy: 0/9 (0%). 0 phantoms. SafetyInspection has 0 code refs.**

---

### Hub 26: EDI

| Model | In Hub? | In Prisma? | Hub Fields | Prisma Fields | Match? |
|-------|---------|------------|------------|---------------|--------|
| EdiTradingPartner | Yes | Yes | 30+ | 35 | PARTIAL (-5) |
| EdiMessage | Yes | Yes | 22 | 33 | PARTIAL (-11) |
| EdiControlNumber | Yes | Yes | 12 | 19 | PARTIAL (-7) |
| EdiTransactionMapping | Yes | Yes | 12 | 19 | PARTIAL (-7) |
| EdiAcknowledgment | Yes | Yes | 16 | 17 | MATCH |
| EdiBatch | Yes | Yes | 15 | 20 | PARTIAL (-5) |
| EdiBatchMessage | Yes | Yes | 11 | 15 | PARTIAL (-4) |
| EdiCodeList | Yes | Yes | 16 | 18 | MATCH |
| EdiCommunicationLog | Yes | Yes | 18 | 25 | PARTIAL (-7) |
| EdiEventTrigger | Yes | Yes | 14 | 18 | PARTIAL (-4) |

**Field accuracy: 2/10 (20%). 0 phantoms. EdiBatch, EdiBatchMessage, EdiCodeList, EdiEventTrigger have 0 code refs.**

---

### Hub 27: Help Desk

| Model | In Hub? | In Prisma? | Hub Fields | Prisma Fields | Match? |
|-------|---------|------------|------------|---------------|--------|
| SupportTicket | Yes | Yes | 30+ | 31 | MATCH |
| TicketReply | Yes | Yes | 12+ | 19 | PARTIAL (-7) |
| SupportTeam | Yes | Yes | 13 | 18 | PARTIAL (-5) |
| SupportTeamMember | Yes | Yes | 10 | 16 | PARTIAL (-6) |
| SlaPolicy | Yes | Yes | 13 | 19 | PARTIAL (-6) |
| CannedResponse | Yes | Yes | 12 | 18 | PARTIAL (-6) |
| KBArticle | Yes | Yes | 15 | 22 | PARTIAL (-7) |
| EscalationRule | Yes | Yes | 14 | 19 | PARTIAL (-5) |

**Field accuracy: 1/8 (13%). 0 phantoms. EscalationRule has 0 code refs.**

---

### Hub 28: Feedback

| Model | In Hub? | In Prisma? | Hub Fields | Prisma Fields | Match? |
|-------|---------|------------|------------|---------------|--------|
| FeatureRequest | Yes | Yes | ~55% acc | 20 | EXISTS |
| FeatureRequestVote | Yes | Yes | ~70% acc | 14 | EXISTS |
| FeatureRequestComment | Yes | Yes | 10+ | 16 | PARTIAL (-6) |
| NPSResponse | Yes | Yes | ~45% acc | 20 | EXISTS |
| NPSSurvey | Yes | Yes | 19 | 20 | MATCH |
| Survey | Yes | Yes | ~40% acc | 27 | EXISTS |
| SurveyResponse | Yes | Yes | ~50% acc | 20 | EXISTS |
| FeedbackWidget | Yes | Yes | ~30% acc | 21 | EXISTS |

**Existence: 8/8 (100%). 1/1 countable field match. Most listed with % accuracy only.**

---

### Hub 29: Rate Intelligence

| Model | In Hub? | In Prisma? | Hub Fields | Prisma Fields | Match? |
|-------|---------|------------|------------|---------------|--------|
| RateQuery | Yes | Yes | 20 | 28 | PARTIAL (-8) |
| RateAlert | Yes | Yes | 16 | 24 | PARTIAL (-8) |
| RateAlertHistory | Yes | Yes | ~20 | 19 | MATCH |
| RateHistory | Yes | Yes | ~24 | 24 | MATCH |
| RateProviderConfig | Yes | Yes | 16 | 22 | PARTIAL (-6) |
| LaneAnalytics | Yes | Yes | 19 | 25 | PARTIAL (-6) |
| RateContract | Yes | Yes | ~25 | 27 | MATCH |
| ContractLaneRate | Yes | Yes | 21 | 36 | PARTIAL (-15) |
| AccessorialRate | Yes | Yes | 11 | 23 | PARTIAL (-12) |

**Field accuracy: 3/9 (33%). 0 phantoms. RateContract/ContractLaneRate/AccessorialRate have 0 code refs in rate-intelligence module.**

---

### Hub 30: Audit

| Model | In Hub? | In Prisma? | Hub Fields | Prisma Fields | Match? |
|-------|---------|------------|------------|---------------|--------|
| AuditLog | Yes | Yes | 21 | 20 | MATCH |
| APIAuditLog | Yes | Yes | 11 | 12 | MATCH |
| LoginAudit | Yes | Yes | 12 | 13 | MATCH |
| AccessLog | Yes | Yes | 12 | 12 | MATCH |
| ChangeHistory | Yes | Yes | 16 | 17 | MATCH |
| ComplianceCheckpoint | Yes | Yes | 17 | 19 | MATCH |
| AuditAlert | Yes | Yes | 15 | 16 | MATCH |
| AuditAlertIncident | Yes | Yes | 17 | 20 | PARTIAL (-3) |
| AuditRetentionPolicy | Yes | Yes | 15 | 16 | MATCH |

**Field accuracy: 8/9 (89%). 0 phantoms. 0 missing. SECOND BEST HUB.**

---

### Hub 31: Config

| Model | In Hub? | In Prisma? | Hub Fields | Prisma Fields | Match? |
|-------|---------|------------|------------|---------------|--------|
| SystemConfig | Yes | Yes | 12 | 15 | PARTIAL (-3) |
| FeatureFlag | Yes | Yes | 14 | 17 | PARTIAL (-3) |
| FeatureFlagOverride | Yes | Yes | 13 | 16 | PARTIAL (-3) |
| NumberSequence | Yes | Yes | 14 | 18 | PARTIAL (-4) |
| CommunicationTemplate | Yes | Yes | 18 | 25 | PARTIAL (-7) |
| ConfigHistory | Yes | Yes | 9 | 12 | PARTIAL (-3) |
| TenantConfig | Yes | Yes | 12 | 15 | PARTIAL (-3) |
| TenantService | Yes | Yes | 12 | 14 | MATCH |
| BusinessHours | Yes | Yes | 15 | 18 | PARTIAL (-3) |
| Holiday | Yes | Yes | 12 | 15 | PARTIAL (-3) |
| CacheConfig | Yes | Yes | 12 | 15 | PARTIAL (-3) |
| CacheInvalidationRule | Yes | Yes | 12 | 15 | PARTIAL (-3) |
| ConfigTemplate | Yes | Yes | 13 | 16 | PARTIAL (-3) |
| DocumentTemplate | Yes | Yes | 18 | 28 | PARTIAL (-10) |
| UserPreference | Yes | Yes | 13 | 16 | PARTIAL (-3) |

**Field accuracy: 1/15 (7%). 0 phantoms. Most exactly 3 fields short (scaffold fields).**

---

### Hub 32: Cache

| Model | In Hub? | In Prisma? | Hub Fields | Prisma Fields | Match? |
|-------|---------|------------|------------|---------------|--------|
| CacheConfig | Yes | Yes | -- | 15 | EXISTS |
| CacheInvalidationRule | Yes | Yes | -- | 15 | EXISTS |
| CacheStats | Yes | Yes | -- | 20 | EXISTS |
| DistributedLock | Yes | Yes | -- | 16 | EXISTS |
| RateLimit | Yes | Yes | -- | 16 | EXISTS |

**Existence: 5/5 (100%). No field counts to verify.**

---

### Hub 33: Super Admin

| Model | In Hub? | In Prisma? | Match? |
|-------|---------|------------|--------|
| User | Yes (ref) | Yes | EXISTS |
| Role | Yes (ref) | Yes | EXISTS |
| Tenant | Yes (ref) | Yes | EXISTS |
| Session | Yes (ref) | Yes | EXISTS |
| PasswordResetToken | Yes (ref) | Yes | EXISTS |

**Existence: 5/5 (100%). No dedicated models (references Auth). No super-admin module dir exists.**

---

### Hubs 34, 35, 36, 37: Email, Storage, Redis, Health

**No Prisma models claimed. Correct -- infrastructure/stateless services.**

---

### Hub 38: Operations

| Model | In Hub? | In Prisma? | Hub Fields | Prisma Fields | Match? |
|-------|---------|------------|------------|---------------|--------|
| OperationsCarrier | Yes | Yes | -- | 52 | EXISTS |
| OperationsCarrierDriver | Yes | Yes | -- | 29 | EXISTS |
| OperationsCarrierTruck | Yes | Yes | -- | 35 | EXISTS |
| OperationsCarrierDocument | Yes | Yes | -- | 18 | EXISTS |
| LoadPlannerQuote | Yes | Yes | -- | 45 | EXISTS |
| LoadPlannerCargoItem | Yes | Yes | -- | 36 | EXISTS |
| LoadPlannerTruck | Yes | Yes | -- | 22 | EXISTS |
| LoadPlannerServiceItem | Yes | Yes | -- | 13 | EXISTS |
| LoadPlannerAccessorial | Yes | Yes | -- | 13 | EXISTS |
| LoadPlannerPermit | Yes | Yes | -- | 20 | EXISTS |
| TruckType | Yes | Yes | -- | 24 | EXISTS |
| InlandServiceType | Yes | Yes | -- | 12 | EXISTS |
| LoadHistory | Yes | Yes | -- | 54 | EXISTS |
| Load | No | Yes | -- | -- | MISSING FROM HUB |
| Order | No | Yes | -- | -- | MISSING FROM HUB |
| StatusHistory | No | Yes | -- | -- | MISSING FROM HUB |

**Existence: 13/13 claimed (100%). 3 MISSING FROM HUB (used in operations dashboard service).**

---

## Rankings

### Best Hubs (Field Accuracy)

| Rank | Hub | Accuracy | Notes |
|------|-----|----------|-------|
| 1 | Hub 10: Claims | 100% (8/8) | Perfect match, gold standard |
| 2 | Hub 30: Audit | 89% (8/9) | Only AuditAlertIncident off by 3 |
| 3 | Hub 14: Carrier Portal | 88% (7/8) | Only CarrierInvoiceSubmission off by 4 |
| 4 | Hub 24: Scheduler | 50% (4/8) | Small models accurate, large ones undercounted |
| 5 | Hub 03: CRM | 40% (2/5) | Activity worst (-9) |
| 5 | Hub 04: Sales | 40% (2/5) | Quote worst (-8) |

### Worst Hubs (Field Accuracy)

| Rank | Hub | Accuracy | Notes |
|------|-----|----------|-------|
| 1 | Hub 17: Credit | 0% (0/5) | Deltas of -9 to -22. Own corrections also wrong |
| 2 | Hub 07: Accounting | 0% (0/5) | PaymentPlan off by -21 |
| 2 | Hub 09: Load Board | 0% (0/5) | Also 5 models missing from hub |
| 2 | Hub 20: Workflow | 0% (0/7) | WorkflowStep worst (-10) |
| 2 | Hub 23: HR | 0% (0/10) | Employee worst (-11) |
| 2 | Hub 25: Safety | 0% (0/9) | SafetyIncident worst (-8) |
| 7 | Hub 31: Config | 7% (1/15) | Most exactly 3 short (scaffold fields) |

---

## Phantom Models (2 total)

| Model | Hub | What Actually Exists |
|-------|-----|---------------------|
| TrackingEvent | Hub 05 (TMS Core) | No equivalent. Tracking data stored on Load model. Hub already flagged this. |
| CarrierDriver | Hub 06 (Carriers) | Actual model is `Driver` (36 fields). Different name, different schema. |

## Name Mismatches (1 total)

| Hub Claims | Schema Has | Hub |
|------------|-----------|-----|
| CarrierInsurance | InsuranceCertificate | Hub 06 |

## Models Missing from Hub (16 total)

| Model | Hub | Used In Code? |
|-------|-----|---------------|
| Session | Hub 01 (Auth) | Yes -- auth module |
| PasswordResetToken | Hub 01 (Auth) | Yes -- auth module |
| SalesQuota | Hub 04 (Sales) | Yes -- sales-performance.service.ts |
| StatusHistory | Hub 05 (TMS Core) | Yes -- orders + loads services |
| OrderItem | Hub 05 (TMS Core) | Yes -- orders.service.ts |
| Driver | Hub 06 (Carriers) | Yes -- carriers module |
| InsuranceCertificate | Hub 06 (Carriers) | Yes -- carriers module |
| FmcsaComplianceLog | Hub 06 (Carriers) | Yes -- carriers module |
| CapacityResult | Hub 09 (Load Board) | Yes -- load-board module |
| CapacitySearch | Hub 09 (Load Board) | Yes -- load-board module |
| CarrierCapacity | Hub 09 (Load Board) | Yes -- load-board module |
| PostLead | Hub 09 (Load Board) | Yes -- load-board module |
| PostingRule | Hub 09 (Load Board) | Yes -- load-board module |
| Load | Hub 38 (Operations) | Yes -- dashboard.service.ts |
| Order | Hub 38 (Operations) | Yes -- dashboard.service.ts |
| StatusHistory | Hub 38 (Operations) | Yes -- dashboard.service.ts |

## Orphan Models (18+ models in schema with zero code references)

| Model | Claimed By Hub | Notes |
|-------|---------------|-------|
| AgentDrawBalance | Hub 16 | Zero code refs anywhere in codebase |
| AnalyticsCache | Hub 19 | Zero code refs |
| CircuitBreakerStateRecord | Hub 21 | Zero code refs |
| ContractClause | Hub 15 | May be accessed via relations only |
| ContractMetric | Hub 15 | May be accessed via relations only |
| EdiBatch | Hub 26 | Zero code refs |
| EdiBatchMessage | Hub 26 | Zero code refs |
| EdiCodeList | Hub 26 | Zero code refs |
| EdiEventTrigger | Hub 26 | Zero code refs |
| EscalationRule | Hub 27 | Zero code refs in help-desk module |
| JobAlert | Hub 24 | May be accessed via relations |
| JobDependency | Hub 24 | May be accessed via relations |
| LaneAnalytics | Hub 19 | Orphan in analytics; actually used by rate-intelligence |
| OnboardingChecklist | Hub 23 | Zero code refs |
| OnboardingTask | Hub 23 | Zero code refs |
| PortalBranding | Hub 13 | Zero code refs in customer-portal |
| ReportTemplate | Hub 19 | Only in analytics.bak/ (backup code) |
| SafetyInspection | Hub 25 | Zero code refs |
| ScheduledWorkflowRun | Hub 20 | Zero code refs |
| WorkflowStep | Hub 20 | May be accessed via relations |

## Cross-Hub Model Sharing (3 groups)

| Models | Shared Between |
|--------|---------------|
| RateContract, ContractLaneRate, AccessorialRate | Hub 04 (Sales) + Hub 15 (Contracts) + Hub 29 (Rate Intelligence) |
| Dashboard, DashboardWidget | Hub 02 (Dashboard) + Hub 19 (Analytics) |
| CommunicationTemplate | Hub 12 (Communication) + Hub 31 (Config) |

---

## Recommendations

### P0 -- Fix Immediately

1. **Remove 2 phantom models from hub files:**
   - Hub 05: Delete `TrackingEvent` from data model section (already flagged)
   - Hub 06: Rename `CarrierDriver` to `Driver` with correct field count (36)

2. **Fix name mismatch:**
   - Hub 06: Rename `CarrierInsurance` to `InsuranceCertificate` and update field count (27)

3. **Add 16 missing models to their respective hubs** -- these are actively used in code but undocumented in the data model sections

4. **FuelSurchargeTier missing tenantId** (Hub 15) -- confirm this is intentional (relies on parent relation for tenant isolation) or add to Prisma schema

### P1 -- Fix Before Next Sprint

5. **Update field counts across all hubs** -- the systematic undercount (74% of models) is caused by omitting scaffold fields. Two options:
   - **Option A (recommended):** Add a note to each hub: "Field counts exclude standard scaffold fields (externalId, sourceSystem, customFields, createdById, updatedById, deletedAt)" and keep current counts as "business field" counts
   - **Option B:** Update all field counts to match Prisma exactly (217 models to update)

6. **Designate model ownership** for shared models (RateContract, Dashboard, CommunicationTemplate) -- mark one hub as "owner" and others as "consumer"

### P2 -- Cleanup

7. **Audit 18+ orphan models** -- decide whether to:
   - Keep (future feature, accessed via relations)
   - Remove from schema (dead code)
   - Document as "reserved" in hub files

8. **Hub 09 (Load Board) needs major data model rewrite** -- 5 undocumented models (CapacityResult, CapacitySearch, CarrierCapacity, PostLead, PostingRule) suggest the load board was significantly expanded after the hub was written

9. **Hub 17 (Credit) needs complete field count rewrite** -- 0% accuracy, and the hub's own "noted actual" corrections from the tribunal were also wrong (undercounted by 3-9 additional fields each)

## Resolution: Accepted as-is (2026-03-09)

18+ models exist in schema.prisma with zero code references. These are either planned features or dead code from earlier development. Add to technical debt backlog for schema cleanup sprint.
