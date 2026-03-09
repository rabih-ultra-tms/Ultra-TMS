# Prisma Model Catalog — Ultra TMS

> Last updated: 2026-03-07
> Source: `apps/api/prisma/schema.prisma`
> Total: 260 models, 114 enums
> Format: Quick-reference by service grouping

---

## Summary

| Service | Model Count | Key Models |
|---------|------------|------------|
| Auth & Admin | 12 | User, Role, Tenant, Session, AuditLog |
| CRM | 8 | Company, Contact, Opportunity, Activity |
| Sales & Quotes | 10 | Quote, QuoteStop, QuoteAccessorial, LoadPlannerQuote |
| TMS Core (Orders) | 6 | Order, OrderItem, StatusHistory |
| TMS Core (Loads) | 8 | Load, Stop, LoadHistory, LoadTender |
| TMS Core (Tracking) | 2 | Position, CheckCall |
| Carriers | 12 | Carrier, CarrierInsurance, TruckType, CsaScore, FmcsaCarrierRecord |
| Accounting | 14 | Invoice, InvoiceLineItem, Settlement, SettlementLineItem, PaymentMade, PaymentReceived, JournalEntry |
| Commission | 6 | CommissionPlan, CommissionPlanTier, CommissionEntry, CommissionPayout |
| Load Board | 6 | LoadPost, LoadPosting, LoadBid, LoadBoardAccount, LoadBoardProvider |
| Claims | 7 | Claim, ClaimAdjustment, ClaimDocument, ClaimItem, ClaimNote, ClaimTimeline |
| Documents | 4 | Document, DocumentFolder, DocumentShare, GeneratedDocument |
| Communication | 4 | CommunicationLog, CommunicationTemplate, SmsConversation, SmsMessage |
| Customer Portal | 8 | PortalUser, PortalSession, PortalPayment, PortalBranding |
| Carrier Portal | 8 | CarrierPortalUser, CarrierPortalSession, CarrierSavedLoad, CarrierPortalDocument |
| Contracts | 10 | Contract, ContractClause, ContractAmendment, ContractLaneRate, ContractRateTable |
| Credit | 4 | CreditApplication, CreditLimit, CreditHold, CollectionActivity |
| Factoring | 4 | FactoringCompany, FactoredPayment, FactoringVerification, NOARecord |
| Agents | 9 | Agent, AgentAgreement, AgentCommission, AgentPayout, AgentLead |
| Analytics | 5 | AnalyticsCache, KPIDefinition, KPISnapshot, KPIAlert, SavedAnalyticsView |
| Workflow | 5 | Workflow, WorkflowStep, WorkflowExecution, WorkflowTemplate, ScheduledWorkflowRun |
| Search | 5 | SearchIndex, SearchIndexQueue, SearchHistory, SearchSuggestion, SearchSynonym |
| Config | 5 | SystemConfig, ConfigHistory, ConfigTemplate, FeatureFlag, FeatureFlagOverride |
| Cache | 4 | CacheConfig, CacheStats, AnalyticsCache, CacheInvalidationRule |
| Scheduler | 7 | ScheduledJob, ScheduledTask, JobExecution, JobTemplate, JobLock, JobAlert, JobDependency |
| Integration Hub | 4 | Integration, IntegrationProviderConfig, SyncJob, TransformationTemplate |
| EDI | 10 | EdiMessage, EdiTradingPartner, EdiBatch, EdiAcknowledgment, EdiError |
| Safety | 6 | SafetyIncident, SafetyInspection, SafetyAlert, SafetyAuditTrail, ComplianceCheckpoint |
| HR | 8 | Employee, Department, TimeEntry, TimeOffRequest, EmploymentHistory |
| Help Desk | 7 | SupportTicket, TicketReply, KBArticle, SlaPolicy, SupportTeam, EscalationRule |
| Rate Intelligence | 8 | RateData, RateHistory, RateContract, RateAlert, RateQuery, LaneAnalytics |
| Audit | 5 | AuditLog, APIAuditLog, AccessLog, LoginAudit, AuditAlert |
| Feedback | 6 | NPSSurvey, NPSResponse, FeedbackWidget, FeatureRequest, Survey, SurveyResponse |
| Storage | 3 | WebhookEndpoint, WebhookDelivery, WebhookSubscription |
| Operations (misc) | 4 | OperationsCarrier, OperationsCarrierDriver, OperationsCarrierTruck, Driver |
| **Total** | **260** | |

---

## P0 MVP Models — Detailed

### Auth & Admin (12 models)

| Model | Key Fields | Relations | Notes |
|-------|-----------|-----------|-------|
| `User` | id, email, passwordHash, tenantId, roleId, mfaEnabled, deletedAt | Role, Tenant, AuditLog | Core auth entity |
| `Role` | id, name, tenantId, permissions | User[] | RBAC roles per tenant |
| `Tenant` | id, name, plan, status | User[], TenantConfig | Multi-tenant root |
| `TenantConfig` | id, tenantId, settings (JSON) | Tenant | Per-tenant config |
| `TenantService` | id, tenantId, serviceCode, enabled | Tenant | Feature flags per tenant |
| `Session` | id, userId, token, expiresAt | User | JWT session tracking |
| `PasswordResetToken` | id, userId, token, expiresAt | User | Forgot password flow |
| `UserPreference` | id, userId, preferences (JSON) | User | User settings |
| `AuditLog` | id, tenantId, userId, action, resource, resourceId, changes (JSON), timestamp | User, Tenant | Audit trail |
| `LoginAudit` | id, userId, ipAddress, success, timestamp | User | Login history |
| `APIAuditLog` | id, tenantId, method, path, userId, statusCode, duration | Tenant | API request audit |
| `AccessLog` | id, userId, resource, action, timestamp | User | Resource access log |

### CRM (8 models)

| Model | Key Fields | Relations | Notes |
|-------|-----------|-----------|-------|
| `Company` | id, name, code, tenantId, creditStatus, creditLimit, deletedAt | Contact[], Order[] | Customer company |
| `Contact` | id, companyId, tenantId, firstName, lastName, email, phone, isPrimary | Company | Company contact |
| `Opportunity` | id, companyId, tenantId, title, value, stage, probability, closedAt | Company, Activity[] | Sales lead |
| `Activity` | id, companyId, opportunityId, type, notes, userId, scheduledAt | Company, User | CRM activity log |
| `Location` | id, address, city, state, zip, lat, lng | Orders, Stops | Reused across TMS |
| `PostLead` | id, source, data (JSON), status | — | Inbound lead tracking |
| `SalesQuota` | id, userId, tenantId, period, targetAmount, achievedAmount | User | Sales rep quotas |
| `HubspotSyncLog` | id, tenantId, entity, externalId, syncedAt, status | Tenant | CRM sync log |

### Sales & Quotes (10 models)

| Model | Key Fields | Relations | Notes |
|-------|-----------|-----------|-------|
| `Quote` | id, tenantId, customerId, status, totalAmount, margin, expiresAt, deletedAt | Company, QuoteStop[], QuoteAccessorial[] | Main quote |
| `QuoteStop` | id, quoteId, sequence, locationType, address, scheduledAt | Quote | Quote pickup/delivery |
| `QuoteAccessorial` | id, quoteId, code, description, amount | Quote | Extra charges |
| `QuoteRequest` | id, quoteId, requestedBy, notes | Quote | Quote revision request |
| `LoadPlannerQuote` | id, tenantId, customerId, status, cargoItems (JSON) | Company | Full AI-powered quote |
| `LoadPlannerCargoItem` | id, quoteId, description, weight, dims, hazmat | LoadPlannerQuote | Cargo detail |
| `LoadPlannerTruck` | id, quoteId, truckTypeId, count | LoadPlannerQuote | Truck requirements |
| `LoadPlannerAccessorial` | id, quoteId, code, amount | LoadPlannerQuote | Accessorial charges |
| `LoadPlannerPermit` | id, quoteId, state, type, fee | LoadPlannerQuote | Permit requirements |
| `LoadPlannerServiceItem` | id, quoteId, code, description, rate | LoadPlannerQuote | Service line items |

### TMS Core — Orders (6 models)

| Model | Key Fields | Relations | Notes |
|-------|-----------|-----------|-------|
| `Order` | id, tenantId, customerId, status, orderNumber, totalAmount, deletedAt | Company, Load[], OrderItem[], Stop[] | Main order |
| `OrderItem` | id, orderId, description, weight, dims, quantity | Order | Cargo items |
| `StatusHistory` | id, entityType, entityId, fromStatus, toStatus, userId, timestamp, notes | — | Polymorphic status log |
| `NumberSequence` | id, tenantId, entityType, prefix, lastNumber | — | Auto-numbering |
| `Report` | id, tenantId, type, params (JSON), status | Tenant | Generated reports |
| `ReportExecution` | id, reportId, status, startedAt, completedAt, resultUrl | Report | Report runs |

### TMS Core — Loads (8 models)

| Model | Key Fields | Relations | Notes |
|-------|-----------|-----------|-------|
| `Load` | id, tenantId, orderId, carrierId, status, loadNumber, pickupDate, deliveryDate, rate | Order, Carrier, Stop[], CheckCall[] | Main load |
| `Stop` | id, loadId, sequence, type, locationId, status, scheduledAt, arrivedAt, departedAt | Load, Location | Load stop |
| `CheckCall` | id, loadId, carrierId, timestamp, location, status, notes, userId | Load, Carrier | Check call log |
| `LoadHistory` | id, carrierId, loadId, rate, completedAt | Carrier, Load | Completed load history |
| `LoadTender` | id, loadId, carrierId, status, sentAt, respondedAt, rate | Load, Carrier | Carrier tender |
| `TenderRecipient` | id, tenderId, carrierId, status | LoadTender, Carrier | Multi-carrier tender |
| `LoadBid` | id, loadId, carrierId, rate, notes, status | Load, Carrier | Carrier bids |
| `FuelSurchargeTable` | id, tenantId, effectiveDate, tiers (via relation) | Tenant | FSC tables |

### TMS Core — Tracking (2 models)

| Model | Key Fields | Relations | Notes |
|-------|-----------|-----------|-------|
| `Position` | id, loadId, lat, lng, speed, heading, timestamp | Load | GPS position |
| `InAppNotification` | id, userId, type, message, read, timestamp | User | WebSocket notification |

### Carriers (12 models)

| Model | Key Fields | Relations | Notes |
|-------|-----------|-----------|-------|
| `Carrier` | id, tenantId, name, dotNumber, mcNumber, status, insuranceExpiry, deletedAt | Load[], TruckType, CarrierInsurance | Main carrier |
| `TruckType` | id, name, maxWeight, maxLength, description | Carrier, Load | PROTECTED — gold standard |
| `CarrierInsurance` | id, carrierId, type, amount, expiresAt, documentUrl | Carrier | Insurance records |
| `CarrierDocument` | id, carrierId, type, url, uploadedAt | Carrier | Carrier documents |
| `CarrierContact` | id, carrierId, name, email, phone, isPrimary | Carrier | Carrier contacts |
| `CsaScore` | id, carrierId, category, score, updatedAt | Carrier | FMCSA CSA scores |
| `FmcsaCarrierRecord` | id, dotNumber, data (JSON), cachedAt | — | FMCSA cache |
| `FmcsaComplianceLog` | id, carrierId, checkType, result, timestamp | Carrier | Compliance checks |
| `CarrierCapacity` | id, carrierId, truckTypeId, availableDate, origin, destination | Carrier, TruckType | Posted capacity |
| `CarrierPerformanceHistory` | id, carrierId, period, onTimeRate, score, claims | Carrier | Performance metrics |
| `CarrierWatchlist` | id, tenantId, carrierId, reason, addedBy | Tenant, Carrier | Internal watchlist |
| `CarrierFactoringStatus` | id, carrierId, factoringCompanyId, status | Carrier | Factoring enrollment |

### Accounting (14 models)

| Model | Key Fields | Relations | Notes |
|-------|-----------|-----------|-------|
| `Invoice` | id, tenantId, loadId, customerId, amount, status, dueDate, deletedAt | Load, Company, InvoiceLineItem[] | Customer invoice |
| `InvoiceLineItem` | id, invoiceId, description, amount, quantity | Invoice | Invoice line items |
| `Settlement` | id, tenantId, loadId, carrierId, amount, status, payDate, deletedAt | Load, Carrier, SettlementLineItem[] | Carrier settlement |
| `SettlementLineItem` | id, settlementId, description, amount | Settlement | Settlement line items |
| `PaymentReceived` | id, tenantId, invoiceId, amount, method, receivedAt | Invoice | Customer payments |
| `PaymentMade` | id, tenantId, settlementId, amount, method, paidAt | Settlement | Carrier payments |
| `PaymentApplication` | id, paymentId, invoiceId, amount | PaymentReceived | Payment allocation |
| `PaymentPlan` | id, tenantId, customerId, installments (JSON), status | Company | Payment plans |
| `JournalEntry` | id, tenantId, description, date, type | Tenant, JournalEntryLine[] | Accounting entries |
| `JournalEntryLine` | id, journalId, accountId, debit, credit | JournalEntry | Double-entry lines |
| `ChartOfAccount` | id, tenantId, code, name, type, balance | Tenant | COA |
| `QuickbooksSyncLog` | id, tenantId, entity, qbId, syncedAt, status | Tenant | QB integration |
| `CollectionActivity` | id, tenantId, customerId, invoiceId, type, notes, timestamp | Company, Invoice | Collections log |
| `AccessorialRate` | id, tenantId, code, description, rate | Tenant | Standard accessorial rates |

### Commission (6 models)

| Model | Key Fields | Relations | Notes |
|-------|-----------|-----------|-------|
| `CommissionPlan` | id, tenantId, name, type, effectiveDate | Tenant, CommissionPlanTier[] | Commission structure |
| `CommissionPlanTier` | id, planId, minVolume, maxVolume, rate | CommissionPlan | Tiered rate |
| `CommissionEntry` | id, tenantId, userId, loadId, invoiceId, amount, status | User, Load, Invoice | Commission earned |
| `CommissionPayout` | id, tenantId, userId, period, amount, status, paidAt | User | Commission payment |
| `UserCommissionAssignment` | id, userId, planId, effectiveDate | User, CommissionPlan | Plan assignments |
| `CustomerCommissionOverride` | id, customerId, userId, rate | Company, User | Custom rates |

---

## Standard Patterns on All Models

```prisma
model AnyEntity {
  id          String    @id @default(cuid())
  tenantId    String    // Multi-tenant isolation (REQUIRED)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime? // Soft delete (REQUIRED on core entities)
  externalId  String?   // Integration source ID
  customFields Json?     // Extensibility

  tenant      Tenant    @relation(...)
}
```

**Multi-tenant rule:** ALL queries must include `where: { tenantId, deletedAt: null }`

---

## Key Enums (114 total — sample of most-used)

| Enum | Values | Used By |
|------|--------|---------|
| `OrderStatus` | PENDING, CONFIRMED, IN_TRANSIT, DELIVERED, CANCELLED | Order |
| `LoadStatus` | AVAILABLE, ASSIGNED, PICKED_UP, IN_TRANSIT, DELIVERED, CANCELLED | Load |
| `QuoteStatus` | DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED | Quote |
| `InvoiceStatus` | DRAFT, SENT, PARTIAL, PAID, OVERDUE, DISPUTED, CANCELLED | Invoice |
| `SettlementStatus` | PENDING, APPROVED, PAID, DISPUTED | Settlement |
| `CarrierStatus` | PENDING, ACTIVE, SUSPENDED, BLACKLISTED, INACTIVE | Carrier |
| `OpportunityStage` | LEAD, QUALIFIED, PROPOSAL, NEGOTIATION, CLOSED_WON, CLOSED_LOST | Opportunity |
| `CreditStatus` | GOOD, WATCH, HOLD, COLLECTIONS | Company |
| `ClaimStatus` | FILED, IN_REVIEW, APPROVED, DENIED, SETTLED | Claim |
| `CommissionStatus` | PENDING, APPROVED, PAID, DISPUTED | CommissionEntry |
| `StopType` | PICKUP, DELIVERY, CROSS_DOCK | Stop |
| `CheckCallStatus` | ON_TIME, DELAYED, EARLY, AT_STOP | CheckCall |
| `TruckCategory` | DRY_VAN, REEFER, FLATBED, STEP_DECK, LOWBOY, TANKER, HAZMAT | TruckType |
| `RoleEnum` | SUPER_ADMIN, ADMIN, MANAGER, DISPATCHER, SALES_REP, ACCOUNTING, VIEWER | Role |

Full enum list: `grep "^enum " apps/api/prisma/schema.prisma`
