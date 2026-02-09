# Integration Gaps Analysis

**Application:** Ultra TMS - 3PL Logistics Platform
**Review Date:** 2026-02-07
**Scope:** Third-party integrations required for production-grade 3PL freight brokerage operations
**Schema Evidence:** Integration, IntegrationProviderConfig, SyncJob, WebhookEndpoint, CircuitBreakerStateRecord models exist

---

## Executive Summary

The Ultra TMS schema includes a robust integration infrastructure (Integration, IntegrationProviderConfig, SyncJob, WebhookEndpoint, CircuitBreakerStateRecord) and domain-specific models that anticipate external data (FmcsaCarrierRecord, CsaScore, HubspotSyncLog, QuickbooksSyncLog, EdiTradingPartner). However, no actual integration implementations exist -- the models are schema-only with no service code connecting to external APIs. This document catalogs the critical third-party integrations needed, organized by priority tier, with API details, implementation approaches, and effort estimates.

---

## Integration Infrastructure (Current State)

### Available Schema Support

| Model | Purpose | Status |
|-------|---------|--------|
| Integration | Integration configuration (type, credentials, status) | Schema only |
| IntegrationProviderConfig | Provider-specific config (API endpoints, auth) | Schema only |
| SyncJob | Data synchronization job tracking | Schema only |
| WebhookEndpoint | Inbound webhook configuration | Schema only |
| WebhookSubscription | Webhook event subscriptions | Schema only |
| WebhookDelivery | Outbound webhook delivery tracking | Schema only |
| CircuitBreakerStateRecord | Circuit breaker for fault tolerance | Schema only |
| APIRequestLog | API call logging (request/response) | Schema only |
| TransformationTemplate | Data transformation rules | Schema only |

**Assessment:** The infrastructure schema is well-designed for a multi-integration platform. Circuit breaker pattern, API logging, webhook management, and sync job tracking provide the foundation. What is missing is the actual NestJS service implementations connecting to external APIs.

---

## P0 -- Must-Have Before Launch

### INT-001: FMCSA SAFER/CSA Integration

**Business Need:** Carrier qualification and ongoing compliance monitoring. Every 3PL must verify carrier operating authority, safety ratings, and CSA scores before assigning loads. Regulatory requirement.

**Schema Coverage:**
- `FmcsaCarrierRecord` -- Full model with operating status, authority flags, address, power unit count
- `CsaScore` -- 7 BASIC score types with percentiles, thresholds, violation counts
- `FmcsaComplianceLog` -- Compliance check history
- `AuthorityChange` -- Authority status change tracking
- `CarrierWatchlist` -- Risk monitoring

**API Details:**
- **Provider:** FMCSA (Federal Motor Carrier Safety Administration)
- **SAFER System:** https://safer.fmcsa.dot.gov/
  - Web scraping approach (no official REST API for all data)
  - FMCSA provides a limited REST API via the FMCSA Web Services portal
  - Registration required at https://mobile.fmcsa.dot.gov/QCDevsite/
  - Endpoints: Carrier lookup by MC/DOT, safety data, authority status
  - Rate limit: Approximately 150 requests/minute
  - Authentication: API key (free registration)
- **SMS (Safety Measurement System):** https://ai.fmcsa.dot.gov/SMS/
  - CSA BASIC scores available via web scraping or data download
  - Monthly data snapshots available for bulk download
- **FMCSA Carrier Registration API:**
  - GET `/api/carrier/{dotNumber}` -- Basic carrier info
  - GET `/api/carrier/{dotNumber}/basics` -- CSA BASIC scores
  - GET `/api/carrier/{dotNumber}/inspections` -- Inspection history
  - Response format: JSON

**Implementation Approach:**
1. Create `FmcsaIntegrationService` in NestJS
2. Implement carrier lookup by MC/DOT number
3. Map FMCSA response to FmcsaCarrierRecord model
4. Parse CSA scores into CsaScore records
5. Schedule daily/weekly re-checks via Bull queue
6. Trigger SafetyAlert on authority revocation or CSA threshold breaches
7. Cache responses in Redis (TTL: 24 hours for carrier data, 7 days for CSA)

**Effort Estimate:** 3-4 weeks (1 developer)
- Week 1: API integration service, carrier lookup
- Week 2: CSA score parsing, authority monitoring
- Week 3: Scheduled compliance checks, alerting
- Week 4: Error handling, circuit breaker, testing

---

### INT-002: GPS/Real-Time Visibility Tracking

**Business Need:** Real-time load tracking is table-stakes for modern freight brokers. Customers expect live tracking links, and dispatchers need location data for check calls and exception management.

**Schema Coverage:**
- `CheckCall` -- Location data with lat/lng, city, state, status, ETA
- `Driver` -- currentLocationLat/Lng, locationUpdatedAt, eldProvider, eldDriverId
- `LoadHistory` -- Status change history

**API Details (Multiple Providers):**

**Option A: Macro Point (now Descartes MacroPoint)**
- Industry standard for freight visibility
- Driver tracking via smartphone app or ELD integration
- API: REST, authenticated via API key
- Endpoints: Start tracking, get location updates, stop tracking
- Webhook support for automated location updates
- Pricing: Per-load tracking fee ($1-5/load)
- Coverage: 95%+ of US carriers

**Option B: project44**
- Enterprise visibility platform
- REST API with webhook notifications
- Real-time ETAs via machine learning
- Multimodal tracking (truck, rail, ocean, air)
- API Documentation: https://developers.project44.com/

**Option C: FourKites**
- Real-time visibility with predictive ETAs
- ELD integrations, GPS tracking, geofencing
- REST API + webhooks
- Machine learning-based ETA predictions

**Option D: ELD Direct Integration**
- For carriers using specific ELD providers (KeepTruckin/Motive, Samsara, Omnitracs)
- Direct API connections to ELD platforms
- HOS (Hours of Service) data availability

**Implementation Approach:**
1. Create abstract `TrackingProviderInterface` in NestJS
2. Implement MacroPoint adapter as primary (highest carrier coverage)
3. Support webhook ingestion for real-time updates
4. Map tracking updates to CheckCall records
5. Push updates to frontend via WebSocket
6. Generate alerts for missed check calls or late ETAs
7. Create customer-facing tracking link page

**Effort Estimate:** 4-5 weeks (1-2 developers)
- Week 1: Provider interface, MacroPoint API integration
- Week 2: Webhook ingestion, CheckCall mapping
- Week 3: WebSocket real-time updates to frontend
- Week 4: Customer tracking page, alert engine
- Week 5: Testing, error handling, secondary provider

---

### INT-003: Load Board Integration (DAT, Truckstop.com/ITS)

**Business Need:** Post available loads to external load boards and search for available carriers/trucks. Essential for capacity procurement.

**Schema Coverage:**
- `LoadBoardProvider` -- Provider configs with API credentials
- `LoadBoardAccount` -- Account credentials per provider
- `LoadPost` -- Load posting records with external post IDs
- `LoadPosting` -- Posting details with views, clicks, leads
- `PostLead` -- Leads from postings
- `CapacitySearch` -- Capacity search queries
- `CapacityResult` -- Search results
- `BoardMetric` -- Posting performance metrics
- `PostingRule` -- Automated posting rules
- `PostingSchedule` -- Posting schedules

**API Details:**

**DAT Solutions (Industry Leader):**
- **DAT iQ / DAT API:** https://api.dat.com/
- REST API with OAuth 2.0 authentication
- Endpoints:
  - POST `/loads` -- Post a load
  - GET `/loads/{id}` -- Get load status
  - DELETE `/loads/{id}` -- Remove posting
  - GET `/trucks/search` -- Search available trucks
  - GET `/rates/lane` -- Lane rate data
  - GET `/rates/spot` -- Spot market rates
- Rate data: Spot rates, contract rates, fuel surcharges
- Webhook support for load matches and carrier interest
- Pricing: Subscription-based ($200-500/mo per user)

**Truckstop.com (now Truckstop, powered by ITS):**
- REST API with API key authentication
- Load posting and search
- Rate analysis tools
- Digital freight matching
- Book It Now functionality

**Implementation Approach:**
1. Create `LoadBoardService` with provider abstraction
2. Implement DAT adapter (highest market share)
3. Implement Truckstop adapter
4. Auto-post loads based on PostingRule/PostingSchedule
5. Ingest carrier interest and map to PostLead
6. Pull rate data for market rate benchmarking
7. Track posting performance in BoardMetric

**Effort Estimate:** 4-5 weeks (1-2 developers)
- Week 1: DAT API integration, load posting
- Week 2: Truck search, rate data ingestion
- Week 3: Truckstop integration, auto-posting rules
- Week 4: Lead management, performance tracking
- Week 5: Testing, error handling, dashboard

---

### INT-004: Accounting System Integration (QuickBooks)

**Business Need:** Sync invoices, payments, settlements, and chart of accounts with QuickBooks for bookkeeping and tax preparation. Most small-to-mid brokerages use QuickBooks.

**Schema Coverage:**
- `QuickbooksSyncLog` -- Sync history tracking
- `ChartOfAccount.quickbooksId` -- QB account mapping
- `Invoice` -- Customer invoices
- `PaymentReceived` -- AR payments
- `Settlement` -- Carrier settlements
- `PaymentMade` -- AP payments
- `JournalEntry` -- GL entries

**API Details:**

**QuickBooks Online API:**
- **Provider:** Intuit
- **API Docs:** https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities
- OAuth 2.0 authentication
- REST API with JSON payloads
- Key Endpoints:
  - POST `/v3/company/{companyId}/invoice` -- Create invoice
  - POST `/v3/company/{companyId}/payment` -- Record payment
  - POST `/v3/company/{companyId}/bill` -- Create bill (AP)
  - POST `/v3/company/{companyId}/billpayment` -- Pay bill
  - POST `/v3/company/{companyId}/journalentry` -- Create JE
  - GET `/v3/company/{companyId}/query?query=SELECT * FROM Account` -- Query entities
- Webhooks for real-time change notifications
- Rate limit: 500 requests/minute per realm
- Sandbox environment available

**Implementation Approach:**
1. Create `QuickBooksIntegrationService` with OAuth 2.0 flow
2. Map ChartOfAccount to QB accounts (bi-directional sync)
3. Push invoices to QB when status changes to SENT
4. Push payments when received
5. Push settlements as bills
6. Implement change tracking via QuickbooksSyncLog
7. Handle sync conflicts (QB as secondary system)

**Effort Estimate:** 3-4 weeks (1 developer)
- Week 1: OAuth flow, account mapping
- Week 2: Invoice and payment sync
- Week 3: Settlement/bill sync, journal entries
- Week 4: Conflict resolution, error handling, testing

---

## P1 -- Important (Build Within 3 Months)

### INT-005: Electronic Document Signing (DocuSign)

**Business Need:** Carrier rate confirmations, customer contracts, and broker-carrier agreements require legally binding signatures. DocuSign is the industry standard.

**Schema Coverage:**
- `Contract.esignProvider` -- E-sign provider identifier
- `Contract.esignEnvelopeId` -- DocuSign envelope ID
- `Contract.signedAt`, `Contract.signedBy` -- Signature tracking

**API Details:**
- **Provider:** DocuSign eSignature API
- **Docs:** https://developers.docusign.com/docs/esign-rest-api/
- OAuth 2.0 + JWT grant for server-to-server
- REST API
- Key Endpoints:
  - POST `/v2.1/accounts/{accountId}/envelopes` -- Create envelope
  - GET `/v2.1/accounts/{accountId}/envelopes/{envelopeId}` -- Get status
  - GET `/v2.1/accounts/{accountId}/envelopes/{envelopeId}/documents` -- Download signed docs
- Webhook: Connect webhooks for real-time status updates
- Pricing: $10-25/envelope depending on plan

**Implementation Approach:**
1. Create `DocuSignService` with JWT authentication
2. Generate rate confirmation PDF from template
3. Create envelope with signing fields
4. Track envelope status via webhook
5. Store signed document in Document model
6. Update Contract.signedAt on completion

**Effort Estimate:** 2-3 weeks (1 developer)

---

### INT-006: Carrier Compliance Monitoring (RMIS / Highway)

**Business Need:** Automated carrier onboarding verification and ongoing compliance monitoring. RMIS and Highway are the two main providers in the freight industry.

**Schema Coverage:**
- `CarrierInsurance` -- Insurance policies
- `InsuranceCertificate` -- Insurance certificates
- `ComplianceCheckpoint` -- Compliance verification steps
- `CarrierWatchlist` -- Risk monitoring

**API Details:**

**RMIS (Registry Monitoring Insurance Services):**
- Industry standard for carrier qualification
- Monitors insurance certificates, authority status
- Auto-certificates of insurance
- REST API available for enterprise customers
- Real-time compliance alerts

**Highway (formerly CarrierLists):**
- Carrier identity and compliance platform
- Insurance monitoring, authority verification
- Fraud detection
- REST API + webhooks
- Free tier for basic verification

**Implementation Approach:**
1. Create `ComplianceMonitoringService` with provider abstraction
2. Submit carrier for monitoring on onboarding
3. Receive insurance update notifications via webhook
4. Auto-update CarrierInsurance records
5. Trigger alerts on insurance lapses
6. Auto-restrict carriers with compliance failures

**Effort Estimate:** 3-4 weeks (1 developer)

---

### INT-007: Payment Processing (TriumphPay / Relay Payments)

**Business Need:** Carrier payment processing, quick pay, and factoring company payment routing. TriumphPay is the dominant payment network in freight.

**Schema Coverage:**
- `Settlement` -- Carrier settlements
- `PaymentMade` -- AP payments
- `CarrierQuickPayRequest` -- Quick pay requests
- `FactoredPayment` -- Factored payment tracking
- `NOARecord` -- Notice of Assignment

**API Details:**

**TriumphPay:**
- Freight payment network with 300,000+ carriers
- Automated NOA verification
- Quick pay processing
- Factoring company payment routing
- REST API with OAuth authentication
- Webhooks for payment status updates

**Relay Payments:**
- Instant carrier payments
- Integration with major TMS platforms
- Same-day ACH and real-time payments
- REST API

**Implementation Approach:**
1. Create `PaymentProcessingService` with TriumphPay integration
2. Submit settlements for payment processing
3. Route payments to factoring companies when NOA is active
4. Process quick pay requests with fee calculation
5. Receive payment confirmation via webhook
6. Update Settlement/PaymentMade status

**Effort Estimate:** 3-4 weeks (1 developer)

---

### INT-008: ELD Integration (Motive/KeepTruckin, Samsara)

**Business Need:** Direct ELD integration for HOS compliance verification, driver location tracking, and DVIR (Driver Vehicle Inspection Report) data.

**Schema Coverage:**
- `Driver.eldProvider`, `Driver.eldDriverId` -- ELD reference fields
- `DriverQualificationFile.clearinghouseStatus` -- Drug/alcohol clearinghouse

**API Details:**

**Motive (formerly KeepTruckin):**
- REST API: https://api.gomotive.com/
- OAuth 2.0 authentication
- Endpoints: Vehicle locations, driver HOS, DVIRs, IFTA data
- Webhooks for real-time location updates

**Samsara:**
- REST API: https://developers.samsara.com/
- API key authentication
- Endpoints: Vehicle locations, driver activity, HOS logs, alerts
- Webhook support

**Implementation Approach:**
1. Create abstract `ELDProviderInterface`
2. Implement Motive adapter
3. Implement Samsara adapter
4. Pull driver HOS data for compliance checks
5. Use location data as supplementary tracking source
6. Map DVIR data to safety records

**Effort Estimate:** 3 weeks (1 developer)

---

## P2 -- Nice to Have (Build Within 6 Months)

### INT-009: Credit Bureau / D&B Integration

**Business Need:** Customer credit scoring and risk assessment during credit application review.

**Schema Coverage:**
- `Company.dunsNumber` -- D&B DUNS number
- `CreditApplication.creditScore`, `creditCheckDate`, `creditReportUrl`

**API Details:**

**Dun & Bradstreet (D&B Direct+ API):**
- REST API with OAuth 2.0
- Company profile, credit scores, financial stress indicators
- Pricing: Enterprise (per-report fees)
- Docs: https://developer.dnb.com/

**Experian Business:**
- Business credit reports
- Payment history
- REST API

**Implementation Approach:**
1. Integrate D&B API for company credit reports
2. Pull reports during credit application review
3. Store credit score and report URL in CreditApplication
4. Schedule periodic re-checks for existing customers

**Effort Estimate:** 2 weeks (1 developer)

---

### INT-010: Team Communication (Slack / Microsoft Teams)

**Business Need:** Send operational notifications (load exceptions, carrier alerts, payment confirmations) to team communication channels.

**Schema Coverage:**
- `InAppNotification` -- Internal notifications
- `NotificationPreference` -- User preferences
- `WebhookEndpoint` -- Outbound webhook support

**API Details:**

**Slack API:**
- REST API + Incoming Webhooks
- OAuth 2.0 for app installation
- Endpoints: `chat.postMessage`, `conversations.create`
- Block Kit for rich message formatting
- Docs: https://api.slack.com/

**Microsoft Teams (Graph API):**
- REST API via Microsoft Graph
- OAuth 2.0 with Azure AD
- Channel messages, adaptive cards
- Docs: https://learn.microsoft.com/en-us/graph/teams-concept-overview

**Implementation Approach:**
1. Create `TeamNotificationService` with Slack/Teams adapters
2. Configure webhook URLs per tenant
3. Send notifications for key events (load exceptions, payment alerts, carrier compliance)
4. Allow per-user/per-channel configuration via NotificationPreference

**Effort Estimate:** 1-2 weeks (1 developer)

---

### INT-011: CRM Integration (HubSpot)

**Business Need:** Bi-directional sync of contacts, companies, and opportunities between Ultra TMS and HubSpot for marketing and sales pipeline management.

**Schema Coverage:**
- `Company.hubspotId` -- HubSpot company ID
- `Contact.hubspotId` -- HubSpot contact ID
- `Activity.hubspotEngagementId` -- HubSpot engagement ID
- `HubspotSyncLog` -- Sync history

**API Details:**

**HubSpot API:**
- REST API with OAuth 2.0 or private app token
- CRM API: Contacts, Companies, Deals, Engagements
- Webhooks for real-time change notifications
- Rate limit: 100 requests/10 seconds (OAuth), 200/10s (private)
- Docs: https://developers.hubspot.com/docs/api/crm

**Implementation Approach:**
1. Create `HubSpotIntegrationService`
2. Implement bi-directional Company sync
3. Implement bi-directional Contact sync
4. Sync Activities as HubSpot engagements
5. Map Opportunities to HubSpot deals
6. Use webhooks for real-time sync from HubSpot
7. Track all sync operations in HubspotSyncLog

**Effort Estimate:** 3 weeks (1 developer)

---

### INT-012: SMS/Voice Communication (Twilio)

**Business Need:** Two-way SMS for driver communication, check call automation, and appointment confirmations. Voice for customer service and driver dispatch.

**Schema Coverage:**
- `SmsConversation` -- SMS thread tracking
- `SmsMessage` -- Individual messages
- `CommunicationLog` -- Communication audit
- CLAUDE.md lists `TWILIO_ACCOUNT_SID` as optional env var

**API Details:**

**Twilio:**
- REST API: https://www.twilio.com/docs/sms/api
- Account SID + Auth Token authentication
- Programmable SMS: Send/receive messages
- Programmable Voice: IVR, call forwarding
- Webhooks for inbound messages/calls
- Pricing: $0.0075/SMS, $0.013/minute voice

**Implementation Approach:**
1. Create `TwilioService` wrapping Twilio SDK
2. Implement outbound SMS (check call requests, appointment reminders)
3. Implement inbound SMS webhook handler
4. Map conversations to SmsConversation/SmsMessage
5. Optional: IVR for driver check-in by phone

**Effort Estimate:** 2 weeks (1 developer)

---

## Architecture Recommendations

### 1. Integration Service Pattern

```
apps/api/src/modules/integrations/
  common/
    integration-base.service.ts      # Abstract base with circuit breaker, logging, retry
    integration-registry.service.ts  # Registration and lookup
    circuit-breaker.service.ts       # CircuitBreakerStateRecord management
    webhook-handler.service.ts       # Generic webhook ingestion
  fmcsa/
    fmcsa.service.ts                 # FMCSA API client
    fmcsa.mapper.ts                  # FMCSA response -> FmcsaCarrierRecord
    fmcsa.scheduler.ts               # Periodic compliance checks
  tracking/
    tracking-provider.interface.ts   # Abstract tracking interface
    macropoint.adapter.ts            # MacroPoint implementation
    project44.adapter.ts             # project44 implementation
  load-board/
    load-board-provider.interface.ts
    dat.adapter.ts
    truckstop.adapter.ts
  accounting/
    quickbooks.service.ts
    quickbooks.mapper.ts
  ...
```

### 2. Circuit Breaker Pattern (Already in Schema)

Leverage the existing `CircuitBreakerStateRecord` model:
```typescript
@Injectable()
export class CircuitBreakerService {
  async execute<T>(integrationId: string, fn: () => Promise<T>): Promise<T> {
    const state = await this.getState(integrationId);
    if (state === 'OPEN') throw new IntegrationUnavailableException();
    try {
      const result = await fn();
      await this.recordSuccess(integrationId);
      return result;
    } catch (error) {
      await this.recordFailure(integrationId);
      throw error;
    }
  }
}
```

### 3. Webhook Ingestion Pattern

Use the existing `WebhookEndpoint` and `WebhookDelivery` models:
```typescript
@Controller('webhooks')
export class WebhookController {
  @Post(':provider')
  async handleWebhook(@Param('provider') provider: string, @Body() payload: any) {
    // Verify webhook signature
    // Log to WebhookDelivery
    // Route to appropriate handler
    // Return 200 immediately, process async
  }
}
```

### 4. Sync Job Management

Use the existing `SyncJob` model with Bull queue:
```typescript
@Processor('sync')
export class SyncProcessor {
  @Process('quickbooks-invoice-sync')
  async syncInvoices(job: Job) {
    const syncJob = await this.createSyncJob('quickbooks', 'invoices');
    try {
      // Perform sync
      await this.updateSyncJob(syncJob.id, 'COMPLETED');
    } catch (error) {
      await this.updateSyncJob(syncJob.id, 'FAILED', error);
    }
  }
}
```

### 5. Rate Limiting for External APIs

Implement per-provider rate limiting using the existing `RateLimit` model and Redis:
```typescript
@Injectable()
export class ExternalApiRateLimiter {
  async acquire(provider: string, maxRequests: number, windowSeconds: number): Promise<boolean> {
    const key = `rate:${provider}`;
    const current = await this.redis.incr(key);
    if (current === 1) await this.redis.expire(key, windowSeconds);
    return current <= maxRequests;
  }
}
```

---

## Implementation Roadmap

| Phase | Integrations | Timeline | FTE |
|-------|-------------|----------|-----|
| Phase 1 (Launch) | INT-001 (FMCSA), INT-002 (GPS Tracking), INT-004 (QuickBooks) | Weeks 1-5 | 2 |
| Phase 2 (Growth) | INT-003 (Load Boards), INT-005 (DocuSign), INT-007 (TriumphPay) | Weeks 6-10 | 2 |
| Phase 3 (Scale) | INT-006 (RMIS/Highway), INT-008 (ELD), INT-012 (Twilio) | Weeks 11-15 | 1-2 |
| Phase 4 (Optimize) | INT-009 (D&B), INT-010 (Slack/Teams), INT-011 (HubSpot) | Weeks 16-20 | 1 |

**Total estimated effort:** 20 weeks with 2 developers average = ~40 person-weeks

---

## Risk Matrix

| Integration | Risk if Missing at Launch | Workaround Available |
|-------------|--------------------------|---------------------|
| FMCSA | HIGH - Regulatory compliance gap | Manual carrier checks via SAFER website |
| GPS Tracking | HIGH - Customer expects real-time visibility | Manual check calls via phone |
| Load Boards | MEDIUM - Reduces capacity procurement efficiency | Phone calls, email to carriers |
| QuickBooks | MEDIUM - Manual double-entry accounting | Export/import CSV files |
| DocuSign | LOW - Paper/email signatures acceptable | Email PDF attachments |
| RMIS/Highway | MEDIUM - Manual insurance monitoring | Manual certificate tracking |
| TriumphPay | LOW at launch - Manual payments acceptable | ACH/check payments |
| ELD | LOW - Supplementary data source | GPS tracking covers core need |
| D&B | LOW - Manual credit assessment | Bank/trade references |
| Slack/Teams | LOW - Nice to have | Email notifications |
| HubSpot | LOW - CRM in TMS covers basics | Separate CRM usage |
| Twilio | LOW - Optional channel | Email/portal communication |
