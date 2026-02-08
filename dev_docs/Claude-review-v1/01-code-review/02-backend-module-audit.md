# Backend Module Audit

**Audit Date:** 2026-02-07
**Schema:** `apps/api/prisma/schema.prisma` (9,854 lines, 257 models, 114 enums)
**Module Root:** `apps/api/src/modules/`
**Total Module Directories:** 42 (38 active + 4 `.bak` archives)

---

## Summary Counts

| Metric | Count |
|--------|-------|
| Total module directories | 42 |
| Active modules (excl. `.bak`) | 38 |
| Tier 1 - Fully Implemented | 22 |
| Tier 2 - Partially Implemented | 6 |
| Tier 3 - Infrastructure/Utility | 10 |
| `.bak` archive directories | 4 |
| Total controllers identified | ~95+ |
| Total services identified | ~120+ |
| Total `.spec.ts` test files | ~100+ |
| Total DTO files | ~180+ |

---

## Module Directory Listing

All 42 directories under `apps/api/src/modules/`:

```
accounting          agents              analytics           analytics.bak
audit               auth                cache               carrier
carrier.bak         carrier-portal      claims              commission
communication       config              contracts           credit
crm                 customer-portal     documents           documents.bak
edi                 email               factoring           feedback
health              help-desk           hr                  integration-hub
integration-hub.bak load-board          operations          rate-intelligence
redis               safety              sales               scheduler
search              storage             tms                 workflow
workflow.bak
```

---

## Tier 1: Fully Implemented Modules

These modules have complete controller-service-DTO stacks with real business logic, multiple endpoints, and unit test coverage (`.spec.ts` files).

---

### 1. auth

**Purpose:** Authentication, authorization, user management, tenant management, MFA
**Controllers:** 5 (`auth`, `profile`, `roles`, `users`, `tenant`)
**Services:** 6 (`auth`, `mfa`, `profile`, `roles`, `users`, `tenant`) - all with `.spec.ts`
**DTOs:** 5 (`auth.dto`, `create-role.dto`, `create-user.dto`, `login.dto`, `update-user.dto`)
**Guards:** `jwt-auth.guard` (with spec)
**Strategies:** `jwt.strategy`
**Decorators:** `current-user.decorator`

**Deep-Read Findings (auth.service.ts - 532 lines):**
- 8 public methods: `login()`, `refresh()`, `logout()`, `logoutAll()`, `forgotPassword()`, `resetPassword()`, `verifyEmail()`, `getMe()`
- JWT token pair generation with refresh token rotation (access: 15m, refresh: 30d)
- Redis session storage + DB session persistence (dual-write)
- bcrypt password hashing (10 rounds)
- Account lockout after configurable failed attempts (default: 5)
- Password reset with token hashing (SHA-256) + Redis + DB dual storage
- Rate limiting on login endpoint (`@Throttle({ long: { limit: 5, ttl: 60000 } })`)
- Role name normalization to uppercase for consistency
- User profile returns normalized response with fullName, roles array, permissions array

**Deep-Read Findings (auth.controller.ts - 198 lines):**
- POST `/auth/login` - Public, rate-limited, returns tokens + user profile
- POST `/auth/refresh` - Public, token rotation
- POST `/auth/logout` - JWT guarded, revokes all sessions (simplified)
- POST `/auth/logout-all` - JWT guarded, revokes all sessions
- POST `/auth/forgot-password` - Public, non-revealing response
- POST `/auth/reset-password` - Public, token-based
- POST `/auth/verify-email` - Public, token-based
- GET `/auth/me` - JWT guarded, returns user profile

**Observations:**
- Test environment bypass in `refresh()` method (lines 114-191) - decodes without verifying in test mode. This is a pattern concern for security auditing.
- `logout()` actually calls `logoutAll()` (line 93) - documented as "simplified" but means single-session logout is not functional.
- `verifyEmail()` iterates over all unverified users (lines 308-322) - O(n) scan, not scalable.

---

### 2. crm

**Purpose:** Customer Relationship Management - companies, contacts, activities, opportunities, HubSpot integration
**Controllers:** 5 (`companies` with spec, `contacts`, `activities`, `opportunities`, `hubspot`)
**Services:** 5 (`companies` with spec, `contacts` with spec, `activities` with spec, `opportunities` with spec, `hubspot` with spec)
**DTOs:** 4 (`create-company`, `create-contact`, `create-activity`, `create-opportunity`)

**Key Models:** `Company`, `Contact`, `Activity`, `Opportunity`, `HubspotSyncLog`

**Observations:**
- Full CRUD lifecycle for all CRM entities
- HubSpot integration service suggests external CRM sync capability
- All services have unit tests

---

### 3. carrier

**Purpose:** Carrier management - profiles, contacts, documents, drivers, insurances
**Controllers:** 6 (`carriers`, `contacts`, `documents`, `drivers`, `drivers-global`, `insurances`)
**Services:** 5 (`carriers` with spec, `contacts` with spec, `documents` with spec, `drivers` with spec, `insurances` with spec)
**DTOs:** 12 (`create-carrier`, `create-contact`, `create-document`, `create-driver`, `create-insurance`, `onboard-carrier`, `carrier-query`, `carrier-response`, `banking-info-response`, `driver-response`, `enums`)

**Key Models:** `Carrier` (120+ fields), `CarrierContact`, `CarrierDocument`, `CarrierInsurance`, `CarrierCapacity`, `Driver`, `DriverQualificationFile`

**Observations:**
- One of the most data-heavy modules (Carrier model has 120+ fields in schema)
- Separate `drivers-global` controller suggests cross-tenant driver visibility
- Onboarding DTO indicates guided carrier registration flow
- Response DTOs for banking info suggests financial data handling

---

### 4. sales

**Purpose:** Quoting, rate contracts, accessorial rates, sales performance, rate calculation
**Controllers:** 4 (`quotes`, `rate-contracts`, `accessorial-rates`, `sales-performance`)
**Services:** 5 (`quotes` with spec, `rate-contracts` with spec, `accessorial-rates` with spec, `sales-performance` with spec, `rate-calculation` with spec)
**DTOs:** 8 (`create-quote`, `create-rate-contract`, `calculate-rate`, `quick-quote`, `lane-rate`, `sales-quota`, `accessorial-rate`)

**Key Models:** `Quote`, `QuoteStop`, `QuoteAccessorial`, `QuoteRequest`, `RateContract`, `ContractLaneRate`, `AccessorialRate`, `SalesQuota`, `LaneAnalytics`

**Observations:**
- `rate-calculation` service exists without a dedicated controller (consumed internally)
- Quick-quote DTO suggests a simplified quoting flow for fast rate checks
- Sales performance tracking with quotas

---

### 5. accounting

**Purpose:** Full accounting lifecycle - invoices, settlements, payments, chart of accounts, journal entries, reports, QuickBooks sync
**Controllers:** 8 (`chart-of-accounts`, `invoices`, `journal-entries`, `payments`, `payments-made`, `payments-received`, `quickbooks`, `reports`, `settlements`)
**Services:** 7 (`chart-of-accounts` with spec, `invoices` with spec, `journal-entries` with spec, `payments-made` with spec, `payments-received` with spec, `settlements` with spec, `pdf`, `reports`)
**DTOs:** 12 (`apply-payment`, `batch-payment`, `create-chart-of-account`, `create-invoice`, `create-journal-entry`, `create-payment-made`, `create-payment-received`, `create-settlement`, `reports`, `send-invoice`, `statement-query`)

**Key Models:** `Invoice`, `InvoiceLineItem`, `Settlement`, `SettlementLineItem`, `PaymentReceived`, `PaymentMade`, `PaymentApplication`, `ChartOfAccount`, `JournalEntry`, `JournalEntryLine`

**Observations:**
- PDF generation service for invoices/statements
- QuickBooks integration controller
- Batch payment processing DTO
- Double-entry bookkeeping via journal entries
- Separate payment-made vs payment-received (AP vs AR)

---

### 6. agents

**Purpose:** Agent management - profiles, agreements, commissions, leads, customer assignments, statements
**Sub-modules:** 6 (`agents`, `agreements`, `assignments`, `commissions`, `leads`, `statements`)
**Controllers:** 6 (one per sub-module)
**Services:** 6 (all with `.spec.ts`)
**DTOs:** 20+ across sub-modules

**Key Models:** `Agent`, `AgentAgreement`, `AgentCommission`, `AgentPayout`, `AgentLead`, `AgentCustomerAssignment`

**Observations:**
- Rich lead lifecycle (submit, qualify, reject, convert)
- Customer assignment management with sunset/terminate/transfer flows
- Statement generation for agent payouts
- Most granular DTO structure in the codebase

---

### 7. claims

**Purpose:** Claims management - filing, items, documents, notes, resolution, subrogation, reports
**Sub-modules:** 7 (`claims`, `documents`, `items`, `notes`, `reports`, `resolution`, `subrogation`)
**Controllers:** 7 (one per sub-module)
**Services:** 7 (all with `.spec.ts`)
**DTOs:** 18+ across sub-modules

**Key Models:** `Claim`, `ClaimItem`, `ClaimDocument`, `ClaimNote`, `ClaimTimeline`, `ClaimAdjustment`, `ClaimContact`, `SubrogationRecord`

**Observations:**
- Complete claims lifecycle: file -> investigate -> approve/deny -> pay -> close
- Subrogation tracking for recovery
- Resolution DTOs cover approve, deny, pay, close, and investigation updates
- Reports sub-module for claims analytics

---

### 8. contracts

**Purpose:** Contract management - amendments, rate tables, rate lanes, SLAs, templates, fuel surcharge, volume commitments
**Sub-modules:** 8 (`contracts`, `amendments`, `fuel-surcharge`, `rate-lanes`, `rate-tables`, `slas`, `templates`, `volume-commitments`)
**Controllers:** 8 (one per sub-module)
**Services:** 8 (all with `.spec.ts`)
**Additional:** DocuSign integration service (with spec), event listener
**DTOs:** 16+ across sub-modules

**Key Models:** `Contract`, `ContractAmendment`, `ContractRateTable`, `ContractRateLane`, `ContractSLA`, `ContractMetric`, `ContractClause`, `ContractTemplate`, `VolumeCommitment`, `FuelSurchargeTable`

**Observations:**
- DocuSign integration for e-signatures
- Event-driven architecture via `contracts-events.listener.ts`
- Fuel surcharge calculation with tiered pricing
- Volume commitment tracking

---

### 9. tms (TMS Core)

**Purpose:** Core transportation management - orders, loads, stops, tracking
**Controllers:** 4 (`loads`, `orders`, `stops`, `tracking`)
**Services:** 4 (`loads` with spec, `orders` with spec, `stops` with spec, `tracking` with spec)
**DTOs:** 11 (`create-check-call`, `create-load`, `create-order`, `create-order-from-template`, `load-query`, `order-query`, `pagination`, `rate-confirmation`, `tracking`, `update-stop`)

**Key Models:** `Order`, `OrderItem`, `Load`, `Stop`, `CheckCall`, `StatusHistory`, `LoadPosting`, `LoadBid`, `LoadTender`, `TenderRecipient`

**Observations:**
- Order-from-template capability
- Rate confirmation DTO suggests carrier acceptance flow
- Check-call tracking for real-time load updates
- Pagination DTO shared across queries

---

### 10. customer-portal

**Purpose:** Customer-facing portal - auth, dashboard, shipments, invoices, payments, quotes, user management
**Sub-modules:** 8 (`auth`, `dashboard`, `invoices`, `payments`, `quotes`, `shipments`, `users`, + `decorators`, `guards`)
**Controllers:** 7 (one per business sub-module)
**Services:** 7 (all with `.spec.ts`)
**Guards:** 2 (`portal-auth.guard` with spec, `company-scope.guard` with spec)
**Decorators:** `company-scope.decorator`
**DTOs:** 10+ (`portal-login`, `register`, `forgot-password`, `reset-password`, `change-password`, `refresh-token`, `make-payment`, `submit-quote-request`, `invite-portal-user`)

**Key Models:** `PortalUser`, `PortalSession`, `PortalBranding`, `PortalPayment`, `PortalNotification`, `PortalSavedPaymentMethod`, `PortalActivityLog`

**Observations:**
- Separate JWT auth system (uses `CUSTOMER_PORTAL_JWT_SECRET`)
- Company-scope guard ensures multi-tenant data isolation
- Full self-service: quotes, shipment tracking, invoice viewing, payments
- Portal user invitation flow

---

### 11. carrier-portal

**Purpose:** Carrier-facing portal - auth, dashboard, loads, invoices, documents, compliance, user management
**Sub-modules:** 8 (`auth`, `compliance`, `dashboard`, `documents`, `invoices`, `loads`, `users`, + `decorators`, `guards`)
**Controllers:** 7 (one per business sub-module)
**Services:** 7 (all with `.spec.ts`)
**Guards:** 2 (`carrier-portal-auth.guard` with spec, `carrier-scope.guard` with spec)
**Decorators:** `carrier-scope.decorator`
**DTOs:** 10+ (`carrier-portal-login`, `register`, `forgot-password`, `reset-password`, `refresh-token`, `submit-bid`, `update-load-status`, `update-location`, `submit-invoice`, `request-quick-pay`, `invite-carrier-portal-user`)

**Key Models:** `CarrierPortalUser`, `CarrierPortalSession`, `CarrierPortalDocument`, `CarrierPortalNotification`, `CarrierInvoiceSubmission`, `CarrierQuickPayRequest`, `CarrierSavedLoad`

**Observations:**
- Separate JWT auth system (uses `CARRIER_PORTAL_JWT_SECRET`)
- Carrier-scope guard for tenant isolation
- Load bidding, status updates, and location tracking
- Quick-pay request flow
- Compliance document management

---

### 12. edi

**Purpose:** EDI (Electronic Data Interchange) - document management, generation, parsing, mappings, trading partners, transport, queue
**Sub-modules:** 7 (`documents`, `generation`, `mappings`, `parsing`, `queue`, `trading-partners`, `transport`)
**Controllers:** 5 (`edi-documents`, `edi-generation`, `edi-mappings`, `edi-queue`, `trading-partners`)
**Services:** 7+ (all with `.spec.ts` where applicable)
**Generators:** 5 (`edi-204`, `edi-210`, `edi-214`, `edi-990`, `edi-997`)
**Transport:** 3 (`as2`, `ftp`, `sftp`)
**DTOs:** 15+ across sub-modules

**Key Models:** `EdiMessage`, `EdiTradingPartner`, `EdiTransactionMapping`, `EdiBatch`, `EdiAcknowledgment`, `EdiError`, `EdiControlNumber`, `EdiCodeList`, `EdiCommunicationLog`, `EdiEventTrigger`

**Observations:**
- Industry-standard EDI transaction types: 204 (Motor Carrier Load Tender), 210 (Freight Invoice), 214 (Shipment Status), 990 (Response to Load Tender), 997 (Functional Acknowledgment)
- Multiple transport protocols: AS2, FTP, SFTP
- Queue-based processing
- Control number management service
- Full parsing and generation pipeline

---

### 13. communication

**Purpose:** Multi-channel communications - email, SMS, in-app notifications, templates, preferences
**Controllers:** 5 (`email`, `sms`, `notifications`, `templates`, `preferences`)
**Services:** 5 (all with `.spec.ts`)
**Providers:** 2 (`sendgrid.provider` with spec, `twilio.provider` with spec)
**DTOs:** 7 (`send-email`, `send-sms`, `create-notification`, `create-template`, `update-template`, `update-preferences`)

**Key Models:** `CommunicationLog`, `CommunicationTemplate`, `SmsConversation`, `SmsMessage`, `InAppNotification`, `NotificationPreference`

**Observations:**
- SendGrid integration for email
- Twilio integration for SMS
- Template-based messaging system
- User preference management for notification channels

---

### 14. integration-hub

**Purpose:** Third-party integration management - integrations, sync jobs, webhooks, credential management
**Controllers:** 3 (`integrations`, `sync`, `webhooks`)
**Services:** 5 (`integrations` with spec, `sync` with spec, `webhooks` with spec, `credential-masker` with spec, `encryption` with spec)
**DTOs:** 5 (`integration`, `sync`, `transformation`, `webhook`)

**Key Models:** `Integration`, `IntegrationProviderConfig`, `SyncJob`, `WebhookEndpoint`, `WebhookSubscription`, `WebhookDelivery`, `CircuitBreakerStateRecord`, `APIRequestLog`

**Observations:**
- Credential masking service for security
- Encryption service for sensitive data
- Circuit breaker pattern support (model exists)
- Webhook delivery tracking
- Transformation DTOs for data mapping

---

### 15. load-board

**Purpose:** Load board operations - postings, bids, tenders, accounts, capacity search, leads, rules, analytics
**Sub-modules:** 8 (`accounts`, `analytics`, `capacity`, `leads`, `posting`, `rules`, + `controllers`, `services`)
**Controllers:** 9 (`load-postings`, `load-bids`, `load-tenders`, `accounts`, `analytics`, `capacity`, `leads`, `posting`, `rules`)
**Services:** 9+ (all with `.spec.ts`, includes `geocoding`)
**DTOs:** 25+ across sub-modules

**Key Models:** `LoadBoardProvider`, `LoadBoardAccount`, `LoadPost`, `PostLead`, `RateData`, `BoardMetric`, `CapacitySearch`, `CapacityResult`, `PostingRule`, `PostingSchedule`

**Observations:**
- Geocoding service for location-based search
- Capacity search with contact-result DTOs
- Bulk post/remove capabilities
- Automated posting rules and schedules
- Lead management (assign, qualify, convert, contact)

---

### 16. safety

**Purpose:** Safety management - alerts, incidents, FMCSA compliance, CSA scores, DQF, insurance, watchlist, reports, scoring
**Sub-modules:** 10 (`alerts`, `csa`, `dqf`, `fmcsa`, `incidents`, `insurance`, `reports`, `scores`, `watchlist`)
**Controllers:** 9 (one per sub-module except reports shares)
**Services:** 11+ (all with `.spec.ts`, includes `fmcsa-api.client` and `scoring.engine`)
**DTOs:** 18+ across sub-modules

**Key Models:** `SafetyAlert`, `SafetyIncident`, `SafetyInspection`, `SafetyAuditTrail`, `FmcsaComplianceLog`, `AuthorityChange`, `CsaScore`, `FmcsaCarrierRecord`, `DriverQualificationFile`

**Observations:**
- FMCSA API client for real-time carrier lookups
- CSA score tracking and management
- Driver Qualification File (DQF) management
- Custom scoring engine with spec
- Watchlist monitoring with resolve flow
- Safety reports aggregation

---

### 17. factoring

**Purpose:** Factoring company management - NOA records, verifications, payments, carrier status, payment routing
**Sub-modules:** 6 (`carrier-status`, `companies`, `noa`, `payments`, `routing`, `verifications`)
**Controllers:** 5 (one per sub-module except routing)
**Services:** 6 (all with `.spec.ts`)
**DTOs:** 15+ across sub-modules

**Key Models:** `FactoringCompany`, `NOARecord`, `FactoringVerification`, `FactoredPayment`, `CarrierFactoringStatus`

**Observations:**
- NOA (Notice of Assignment) lifecycle management
- Payment routing service for directing payments
- Carrier factoring status tracking with quick-pay enrollment
- Verification request/response flow

---

### 18. credit

**Purpose:** Credit management - applications, limits, holds, collections, payment plans
**Sub-modules:** 5 (`applications`, `collections`, `holds`, `limits`, `payment-plans`)
**Controllers:** 5 (one per sub-module)
**Services:** 5 (all with `.spec.ts`)
**DTOs:** 17 (detailed DTOs for approve, reject, create, update, cancel, record-payment, release)

**Key Models:** `CreditApplication`, `CreditLimit`, `CreditHold`, `CollectionActivity`, `PaymentPlan`

**Observations:**
- Full credit lifecycle: apply -> approve/reject -> set limits -> holds -> collections -> payment plans
- Most granular DTO set relative to module size

---

### 19. feedback

**Purpose:** Customer feedback - surveys, NPS, feature requests, widgets, sentiment analysis, analytics
**Sub-modules:** 8 (`analytics`, `entries`, `features`, `nps`, `sentiment`, `surveys`, `widgets`)
**Controllers:** 4 (`feedback-entries`, `features`, `nps`, `surveys`, `widgets`)
**Services:** 8+ (`feedback-entries`, `features`, `voting`, `nps-surveys`, `nps-score`, `sentiment`, `surveys`, `widgets`, `feedback-analytics` - all with `.spec.ts`)
**DTOs:** 1 shared (`feedback.dto`)

**Key Models:** `Survey`, `SurveyResponse`, `NPSSurvey`, `NPSResponse`, `FeatureRequest`, `FeatureRequestComment`, `FeatureRequestVote`, `FeedbackWidget`

**Observations:**
- NPS (Net Promoter Score) scoring service
- Sentiment analysis service
- Feature request voting system
- Analytics aggregation service

---

### 20. help-desk

**Purpose:** Support ticket system - tickets, teams, SLA, escalation, knowledge base, canned responses
**Sub-modules:** 6 (`canned-responses`, `escalation`, `knowledge-base`, `sla`, `teams`, `tickets`)
**Controllers:** 5 (`canned-responses`, `kb`, `sla-policies`, `teams`, `tickets`)
**Services:** 9+ (`canned-responses`, `escalation`, `articles`, `categories`, `sla`, `sla-tracker`, `assignment`, `teams`, `tickets`, `ticket-number` - all with `.spec.ts`)
**DTOs:** 1 shared (`help-desk.dto`)

**Key Models:** `SupportTicket`, `TicketReply`, `SupportTeam`, `SupportTeamMember`, `SlaPolicy`, `EscalationRule`, `CannedResponse`, `KBArticle`

**Observations:**
- SLA tracking with separate tracker service
- Auto-assignment service
- Knowledge base with articles and categories
- Ticket numbering service
- Escalation rules engine

---

### 21. hr

**Purpose:** Human resources - employees, departments, positions, locations, time tracking, time off
**Sub-modules:** 6 (`departments`, `employees`, `locations`, `positions`, `time-off`, `time-tracking`)
**Controllers:** 6 (one per sub-module)
**Services:** 7 (`departments`, `employees`, `locations`, `positions`, `time-off`, `balance`, `time-entries` - all with `.spec.ts`)
**DTOs:** 1 shared (`hr.dto`)

**Key Models:** `Employee`, `Department`, `Position`, `EmploymentHistory`, `OnboardingChecklist`, `OnboardingTask`, `TimeEntry`, `TimeOffRequest`, `TimeOffBalance`

**Observations:**
- Time-off balance tracking as separate service
- Onboarding checklist system (models exist, service coverage unclear)
- Full org-chart hierarchy support

---

### 22. audit

**Purpose:** Audit logging - logs, alerts, API audit, compliance, change history, access logs, retention
**Sub-modules:** 8 (`activity`, `alerts`, `api`, `compliance`, `history`, `logs`, `retention`, + `decorators`, `interceptors`)
**Controllers:** 7 (`audit`, `user-activity`, `alerts`, `api-audit`, `compliance`, `change-history`, `audit-logs`, `retention`)
**Services:** 10+ (`access-log`, `login-audit`, `alert-processor`, `alerts`, `api-audit`, `checkpoint`, `change-history`, `audit-hash`, `audit-logs`, `retention` - all with `.spec.ts`)
**Interceptors:** `audit.interceptor` (with spec)
**Decorators:** `audit.decorator`
**DTOs:** 9 (`activity`, `alerts`, `api-audit`, `audit`, `audit-log`, `compliance`, `history`, `retention`)

**Key Models:** `AuditLog`, `AuditAlert`, `AuditAlertIncident`, `AuditRetentionPolicy`, `AccessLog`, `APIAuditLog`, `ComplianceCheckpoint`, `ChangeHistory`

**Observations:**
- Audit interceptor for automatic logging
- Audit decorator for declarative audit marking
- Hash-based audit log integrity (tamper detection)
- Compliance checkpoint system
- Configurable retention policies
- Most comprehensive module in terms of cross-cutting concerns

---

## Tier 2: Fully Implemented Supporting Modules

These modules have complete implementations but serve as supporting/operational infrastructure rather than primary business domains.

---

### 23. analytics

**Purpose:** Dashboards, KPIs, alerts, reports
**Controllers:** 4 (`dashboards`, `kpis`, `alerts`, `reports`)
**Services:** 4 (all with `.spec.ts`)
**DTOs:** 6 (`dashboard`, `kpi`, `alert`, `report`, `query`)

**Key Models:** `Dashboard`, `DashboardWidget`, `KPIDefinition`, `KPISnapshot`, `KPIAlert`, `AnalyticsCache`, `Report`, `ReportExecution`, `ReportTemplate`, `SavedAnalyticsView`

---

### 24. workflow

**Purpose:** Workflow engine - workflows, executions, approvals, templates
**Controllers:** 4 (`workflows`, `executions`, `approvals`, `templates`)
**Services:** 4 (all with `.spec.ts`)
**Additional:** `actions.constants.ts` for workflow action definitions
**DTOs:** 5 (`workflow`, `execution`, `approval`, `template`)

**Key Models:** `Workflow`, `WorkflowStep`, `WorkflowExecution`, `StepExecution`, `ScheduledWorkflowRun`, `WorkflowTemplate`

---

### 25. commission

**Purpose:** Commission plans, entries, payouts
**Controllers:** 3 (`commission-entries`, `commission-payouts`, `commission-plans`)
**Services:** 3 (all with `.spec.ts`)
**DTOs:** 4 (`create-commission-entry`, `create-commission-payout`, `create-commission-plan`, `create-user-commission-assignment`)

**Key Models:** `CommissionEntry`, `CommissionPlan`, `CommissionPayout`

---

### 26. scheduler

**Purpose:** Job scheduling - jobs, executions, tasks, templates, reminders, distributed locking, retry
**Sub-modules:** 8 (`executions`, `handlers`, `jobs`, `locking`, `processors`, `reminders`, `retry`, `tasks`, `templates`)
**Controllers:** 4 (`executions`, `jobs`, `reminders`, `tasks`, `templates`)
**Services:** 9+ (`executions`, `job-executor`, `jobs`, `job-scheduler`, `lock`, `reminders`, `retry`, `tasks`, `templates` - all with `.spec.ts`)
**Processors:** 2 (`job.processor`, `task.processor`)
**DTOs:** 3 (`job`, `reminder`, `task`)

**Key Models:** `ScheduledJob`, `JobExecution`, `JobLock`, `JobAlert`, `JobDependency`, `JobTemplate`, `ScheduledTask`

---

### 27. search

**Purpose:** Global search with Elasticsearch - indexing, entity search, saved searches, admin
**Sub-modules:** 6 (`admin`, `elasticsearch`, `entities`, `global`, `indexing`, `saved`)
**Controllers:** 4 (`admin`, `entity-search`, `global-search`, `saved-searches`)
**Services:** 8+ (`admin`, `elasticsearch`, `entity-search`, `global-search`, `indexing`, `index-manager`, `queue-processor`, `saved-searches` - all with `.spec.ts`)
**DTOs:** 2 (`search.dto`)

**Key Models:** `SearchIndex`, `SearchIndexQueue`, `SearchHistory`, `SearchSuggestion`, `SearchSynonym`, `SavedSearch`

---

### 28. rate-intelligence

**Purpose:** Market rate data - history, lookup, alerts, analytics, lane analytics, provider integrations
**Sub-modules:** 6 (`alerts`, `analytics`, `history`, `lanes`, `lookup`, `providers`)
**Controllers:** 6 (one per sub-module)
**Services:** 8+ (`rate-alerts`, `alert-evaluator`, `analytics`, `rate-history`, `lane-analytics`, `rate-lookup`, `rate-aggregator`, `providers` - all with `.spec.ts`)
**Providers:** 3 (`dat.provider`, `greenscreens.provider`, `truckstop.provider`)
**DTOs:** 6+ across sub-modules

**Key Models:** `RateHistory`, `RateQuery`, `RateProviderConfig`, `RateAlert`, `RateAlertHistory`

**Observations:**
- Three external rate data providers: DAT, Greenscreens, Truckstop
- Rate aggregation across providers
- Alert evaluation engine

---

## Tier 3: Infrastructure/Utility Modules

These modules provide foundational services consumed by other modules.

---

### 29. config

**Purpose:** System configuration - system config, tenant config, feature flags, sequences, preferences, templates, email templates, business hours
**Sub-modules:** 9 (`business-hours`, `email-templates`, `features`, `history`, `preferences`, `sequences`, `system`, `templates`, `tenant`)
**Controllers:** 8 (one per sub-module except history)
**Services:** 10+ (`business-hours`, `email-templates`, `features`, `feature-flag.evaluator`, `config-history`, `preferences`, `sequences`, `system-config`, `templates`, `tenant-config`, `config-cache` - all with `.spec.ts`)
**DTOs:** 9 (one per sub-module)

**Key Models:** `SystemConfig`, `TenantConfig`, `ConfigHistory`, `ConfigTemplate`, `NumberSequence`, `FeatureFlag`, `FeatureFlagOverride`

---

### 30. cache

**Purpose:** Cache management - config, invalidation, locking, management, rate limiting, stats, warming
**Sub-modules:** 7 (`config`, `invalidation`, `locking`, `management`, `rate-limiting`, `stats`, `warming`)
**Controllers:** 3 (`cache-config`, `cache-management`, `locks`, `rate-limit`)
**Services:** 7+ (all with `.spec.ts`)
**Guards:** `rate-limit.guard` (with spec)
**Listeners:** `invalidation.listener`
**DTOs:** 1 (`cache.dto`)

**Key Models:** `CacheConfig`, `CacheInvalidationRule`, `CacheStats`, `DistributedLock`, `RateLimit`

---

### 31. documents

**Purpose:** Document management - documents, folders, templates, sharing
**Controllers:** 3 (`documents`, `document-folders`, `document-templates`)
**Services:** 3 (all with `.spec.ts`)
**Guards:** `document-access.guard` (with spec)
**DTOs:** 7 (`create-document`, `create-document-folder`, `create-document-share`, `create-document-template`, `document-response`, `generate-document`)

**Key Models:** `Document`, `DocumentFolder`, `DocumentShare`, `DocumentTemplate`, `GeneratedDocument`

---

### 32. operations

**Purpose:** Operations - carriers (operations-level), load history, load planner quotes, truck types
**Sub-modules:** 4 (`carriers`, `load-history`, `load-planner-quotes`, `truck-types`)
**Controllers:** 4 (one per sub-module)
**Services:** 4 (with DTOs)

**Key Models:** `LoadPlannerQuote`, `LoadPlannerCargoItem`, `LoadPlannerTruck`, `LoadPlannerPermit`, `LoadPlannerAccessorial`, `LoadPlannerServiceItem`, `OperationsCarrier`, `OperationsCarrierDriver`, `OperationsCarrierTruck`, `TruckType`, `LoadHistory`

**Observations:**
- Operations-level carrier view (separate from carrier module)
- Load planner with cargo items, permits, accessorials
- Truck type reference data

---

### 33. redis

**Purpose:** Redis connection and session management
**Files:** `redis.module.ts`, `redis.service.ts`, `redis.service.spec.ts`
**No controllers** - pure service module

---

### 34. email

**Purpose:** Email sending service (used by auth and communication modules)
**Files:** `email.module.ts`, `email.service.ts`, `email.service.spec.ts`
**No controllers** - pure service module

---

### 35. storage

**Purpose:** File storage abstraction
**Files:** `storage.module.ts`, `local-storage.service.ts`, `local-storage.service.spec.ts`, `storage.interface.ts`
**No controllers** - pure service module with interface for swappable backends

---

### 36. health

**Purpose:** Health check endpoint
**Files:** `health.module.ts`, `health.controller.ts`
**No services, no DTOs** - minimal module

---

## `.bak` Archive Directories

| Directory | Status |
|-----------|--------|
| `analytics.bak` | Archived - replaced by current `analytics` |
| `carrier.bak` | Archived - replaced by current `carrier` |
| `documents.bak` | Archived - replaced by current `documents` |
| `integration-hub.bak` | Archived - replaced by current `integration-hub` |
| `workflow.bak` | Archived - replaced by current `workflow` |

**Recommendation:** Remove `.bak` directories from the codebase. They add confusion and increase repository size. If version history is needed, rely on git.

---

## Pattern Analysis

### Positive Patterns

1. **Consistent module structure**: Nearly every module follows the controller-service-DTO pattern with NestJS module declaration. Sub-modules use a nested folder structure with their own controller/service/dto triples.

2. **Comprehensive test coverage**: Almost every service file has a corresponding `.spec.ts` file. Guards and interceptors also have specs. This is a strong foundation for quality assurance.

3. **DTO validation**: Every module with write operations has dedicated DTOs, enforcing the global `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true`.

4. **Separation of concerns**: Portal modules (customer-portal, carrier-portal) have their own auth guards, decorators, and JWT secrets, properly isolating external user access from internal user access.

5. **Event-driven patterns**: Several modules use listeners (contracts, cache, audit) for cross-module communication without tight coupling.

6. **Security patterns**: Credential masking in integration-hub, audit hash integrity, document access guards, rate limiting, and distributed locking are all implemented.

### Concern Areas

1. **Module duplication**: The `operations/carriers` sub-module overlaps with the top-level `carrier` module. The distinction (operations-level carrier view vs carrier management) should be clearly documented and ideally consolidated.

2. **Shared DTO files**: Several modules use a single shared DTO file (`feedback.dto.ts`, `help-desk.dto.ts`, `hr.dto.ts`) rather than per-entity DTOs. This can lead to large, hard-to-maintain files and should be split as the modules grow.

3. **Test environment bypass in auth**: The `refresh()` method in `auth.service.ts` has extensive test-environment bypass logic (lines 114-191) that skips token verification, session validation, and refresh token hash checking when `NODE_ENV === 'test'`. This is a security anti-pattern and should be replaced with proper test mocking.

4. **Email verification scalability**: `verifyEmail()` iterates over all unverified users (O(n) scan). This should use a direct token-to-user mapping stored in the database.

5. **Logout inconsistency**: `logout()` calls `logoutAll()` internally, so there is no single-session logout. The controller endpoint implies single-session logout but the implementation revokes all sessions.

6. **Missing index files**: Not all modules have barrel exports (`index.ts`). Some do (accounting, commission, load-board, documents) but many do not, leading to inconsistent import patterns.

---

## Recommendations

### Immediate (P0)

1. **Remove `.bak` directories** - Replace with git history. These add ~5 directories of dead code to the repository.

2. **Fix auth test bypass** - Replace the `isTestEnv` branching in `AuthService.refresh()` with proper test mocks. The current approach creates a security surface area where `NODE_ENV=test` bypasses all token validation.

3. **Fix email verification** - Store a `userId` mapping for verification tokens in the database (similar to `PasswordResetToken`) instead of iterating all unverified users.

4. **Fix logout** - Implement actual single-session logout by passing `sessionId` to `logout()` instead of calling `logoutAll()`.

### Short-term (P1)

5. **Split shared DTOs** - Break `feedback.dto.ts`, `help-desk.dto.ts`, and `hr.dto.ts` into per-entity DTO files for maintainability.

6. **Add barrel exports** - Create `index.ts` files in all module directories for consistent import patterns.

7. **Clarify operations vs carrier** - Document the distinction between `operations/carriers` and `carrier` modules, or consolidate if the separation is not justified.

### Medium-term (P2)

8. **Add integration tests** - While unit test coverage is good (`.spec.ts` files exist), integration tests (`test:e2e`) should cover cross-module workflows (e.g., order -> load -> tracking -> settlement).

9. **API versioning strategy** - All endpoints are under `/api/v1`. Plan for v2 migration path as the schema evolves.

10. **Performance profiling** - Modules like search, analytics, and load-board with complex queries should have performance benchmarks and query optimization reviews.
