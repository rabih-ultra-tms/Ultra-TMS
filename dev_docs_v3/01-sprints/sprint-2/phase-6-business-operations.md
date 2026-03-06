# Sprint 2 — Phase 6: Business Operations (Weeks 23-24)
> 7 tasks | 37-54h estimated | Prereq: App deployed, services running

---

## BIZ-001: Legal Documents [P0]
**Effort:** L (8-12h) | Privacy, ToS, AUP

### Sub-tasks

#### BIZ-001a: Create legal page layout and routes
**Create:** `apps/web/app/(legal)/layout.tsx`
- Clean layout WITHOUT dashboard sidebar
- Header with Ultra TMS logo + "Back to app" link
- Footer with version + copyright

**Create:** `apps/web/app/(legal)/privacy/page.tsx`
**Create:** `apps/web/app/(legal)/terms/page.tsx`
**Create:** `apps/web/app/(legal)/acceptable-use/page.tsx`

#### BIZ-001b: Draft Privacy Policy
**Content must cover:**

1. **Information We Collect**
   - Account information (name, email, company, phone)
   - Usage data (page views, feature usage, IP address)
   - Cookies and tracking (analytics, session)
   - Third-party data (FMCSA carrier data, payment info via Stripe)
   - Document uploads (BOLs, PODs, contracts — user-provided)

2. **How We Use Information**
   - Provide and operate the TMS service
   - Process payments and billing
   - Send transactional emails (load updates, invoices)
   - Improve service quality (analytics)
   - Comply with legal obligations (FMCSA reporting)

3. **Data Sharing**
   - NO sale of personal data
   - Carriers/customers: shared as necessary for load execution
   - Third-party providers: SendGrid (email), Twilio (SMS), Stripe (payments), Google Maps (tracking)
   - Law enforcement: only with valid legal process

4. **Data Retention**
   - Active account data: retained while account active
   - Financial records: 7 years (tax/audit requirements)
   - Load history: 3 years minimum
   - Deleted account: data purged within 90 days (except legal holds)

5. **User Rights**
   - Access: request copy of your data
   - Correction: update inaccurate information
   - Deletion: request account deletion
   - Portability: export data in standard format
   - Opt-out: marketing communications

6. **Security**
   - Encryption at rest and in transit (TLS 1.2+)
   - Access controls and audit logging
   - Regular security assessments
   - Incident notification: within 72 hours of confirmed breach

7. **Contact Information**
   - Privacy inquiries email
   - Mailing address
   - Data protection officer (if applicable)

#### BIZ-001c: Draft Terms of Service
**Content must cover:**

1. **Account Terms**
   - Registration requirements (valid email, company info)
   - Account security (strong password, 2FA recommended)
   - One tenant per organization
   - Admin responsible for user access

2. **Service Description**
   - Transportation Management System features
   - Service availability target (99.5% uptime)
   - Maintenance windows (scheduled with 24h notice)

3. **Acceptable Use**
   - Must comply with all applicable laws (FMCSA, DOT)
   - No unauthorized data access
   - No automated scraping
   - No transmission of malware

4. **Payment Terms**
   - Subscription billing (monthly/annual)
   - Payment via credit card or ACH
   - Grace period: 7 days after due date
   - Suspension: 30 days past due

5. **Data Ownership**
   - Customer owns their data
   - Ultra TMS has license to process data for service delivery
   - Upon termination: 30-day data export period, then deletion

6. **Limitation of Liability**
   - Service provided "as-is"
   - No liability for indirect/consequential damages
   - Maximum liability: subscription fees paid in last 12 months
   - Force majeure clause

7. **Termination**
   - Customer may terminate anytime
   - Ultra TMS may terminate for violation with 30-day notice
   - Immediate termination for security breach or illegal activity

8. **Dispute Resolution**
   - Good faith negotiation first
   - Mediation second
   - Arbitration third (binding, per AAA rules)
   - Governing law: [State]

#### BIZ-001d: Draft Acceptable Use Policy
- Prohibited: harassment, fraud, data theft, unauthorized access
- Data accuracy: users responsible for accuracy of submitted data
- Compliance: FMCSA, DOT, HAZMAT where applicable
- Reporting: obligation to report suspected breaches

#### BIZ-001e: Add legal links throughout app
- Registration page: "By registering, you agree to our [Terms of Service] and [Privacy Policy]"
- Footer component: Privacy | Terms | Acceptable Use
- Settings page: link to legal documents

### Acceptance Criteria
- [ ] Privacy Policy accessible at `/privacy` (no auth required)
- [ ] Terms of Service accessible at `/terms` (no auth required)
- [ ] AUP accessible at `/acceptable-use` (no auth required)
- [ ] Legal links in app footer and registration flow
- [ ] Registration requires ToS acceptance checkbox
- [ ] All documents have "Last Updated" date

---

## BIZ-002: Billing Architecture Design [P1]
**Effort:** L (6-8h) | Stripe tiers, DESIGN ONLY — no implementation

### Sub-tasks

#### BIZ-002a: Design subscription tiers

| Feature | Starter ($99/mo) | Professional ($299/mo) | Enterprise ($599/mo) | Custom |
|---------|-------------------|----------------------|---------------------|--------|
| Loads/month | 50 | 500 | Unlimited | Negotiated |
| Users | 3 | 10 | Unlimited | Negotiated |
| CRM | Basic | Full | Full + API | Full + API |
| Accounting | Invoicing only | Full A/R + A/P | Full + Reports | Full |
| Commission | - | Basic | Full + Splits | Full |
| Documents | 1GB storage | 10GB | 100GB | Custom |
| Communication | Email only | Email + SMS | Email + SMS + Push | Full |
| Analytics | Basic dashboard | Full dashboards | Custom + Builder | Full |
| Credit | - | Basic limits | Full + Auto-holds | Full |
| Support | Email (48h) | Email + Chat (4h) | Priority (1h) + Phone | Dedicated |
| API Access | - | Read-only | Full CRUD | Full |
| SSO | - | - | SAML/OIDC | Yes |
| White-label | - | - | Custom domain | Full |

#### BIZ-002b: Design Stripe integration architecture

```
┌─────────────┐    ┌──────────────┐    ┌─────────────────┐
│ Ultra TMS    │───▶│ Stripe API   │───▶│ Stripe Dashboard│
│ Backend      │    │              │    │                 │
│              │◀───│ Webhooks     │    │                 │
└─────────────┘    └──────────────┘    └─────────────────┘

Stripe Objects:
- Customer = Tenant
- Subscription = Tier + billing cycle
- PaymentMethod = Card or ACH
- Invoice = Monthly billing
- UsageRecord = Load count, user count, storage

Webhook Events to Handle:
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed
- customer.subscription.trial_will_end
```

#### BIZ-002c: Document in dev_docs_v3
**Create:** `Ultra-TMS/dev_docs_v3/04-business/billing-architecture.md`

Include:
- Tier matrix
- Stripe integration diagram
- Usage metering strategy
- Dunning flow (failed payment → retry → email → suspend)
- Upgrade/downgrade logic
- Proration handling
- Implementation estimate for Sprint 6

### Acceptance Criteria
- [ ] Tier structure documented with pricing and feature matrix
- [ ] Stripe integration architecture documented with diagrams
- [ ] Usage metering strategy defined
- [ ] Dunning flow documented
- [ ] Implementation plan ready for Sprint 6 (SVC-SA + SAAS-002)

---

## BIZ-003: API Documentation (Swagger) [P1]
**Effort:** M (4-6h) | All endpoints

### Current State
- Swagger setup exists at `apps/api/src/swagger.ts`
- Many endpoints have `@ApiOperation` decorators
- Missing: consistent grouping, response examples, complete coverage

### Sub-tasks

#### BIZ-003a: Audit Swagger completeness
For every endpoint, verify:
- `@ApiOperation({ summary, description })` present
- `@ApiResponse({ status: 200, description, type })` for success
- `@ApiResponse({ status: 400/401/403/404 })` for errors
- `@ApiBody({ type: CreateDto })` with example payload
- `@ApiBearerAuth()` on all protected endpoints

#### BIZ-003b: Group endpoints by service
```typescript
@ApiTags('Auth')           // Login, register, token refresh
@ApiTags('Admin - Users')  // User CRUD
@ApiTags('Admin - Roles')  // Role CRUD
@ApiTags('CRM - Companies') // Company CRUD
@ApiTags('CRM - Contacts') // Contact CRUD
@ApiTags('CRM - Leads')    // Lead CRUD
@ApiTags('Sales - Quotes')  // Quote CRUD
@ApiTags('TMS - Loads')     // Load CRUD
@ApiTags('TMS - Orders')    // Order CRUD
@ApiTags('TMS - Dispatch')  // Dispatch operations
@ApiTags('TMS - Tracking')  // Tracking
@ApiTags('Carriers')        // Carrier CRUD
@ApiTags('Accounting - Invoices')  // Invoice CRUD
@ApiTags('Accounting - Payments')  // Payment CRUD
@ApiTags('Accounting - Settlements') // Settlement CRUD
@ApiTags('Commission')      // Commission CRUD
@ApiTags('Documents')       // Document CRUD
@ApiTags('Communication')   // Email, SMS, notifications
@ApiTags('Credit')          // Credit management
@ApiTags('Analytics')       // Analytics and reporting
```

#### BIZ-003c: Add request/response examples for top 20 endpoints
Priority endpoints:
1. POST `/auth/login` — login with email/password
2. GET `/loads` — list loads with pagination
3. POST `/loads` — create load
4. POST `/quotes` — create quote
5. GET `/carriers` — list carriers
6. POST `/invoices` — create invoice
7. POST `/documents/upload` — upload document
8. GET `/analytics/kpis` — get KPI values
9. GET `/credit/dashboard` — credit overview
10. POST `/communication/email/send` — send email
... and 10 more

#### BIZ-003d: Verify Swagger UI accessible
- Navigate to `http://localhost:3001/api/v1/swagger`
- Verify all endpoints grouped and documented
- Test "Try it out" on key endpoints

### Acceptance Criteria
- [ ] All endpoints documented in Swagger with descriptions
- [ ] Grouped by service area
- [ ] Request/response examples on top 20 endpoints
- [ ] Swagger UI accessible and navigable
- [ ] "Try it out" works with auth token

---

## BIZ-004: User Documentation (10 Articles) [P1]
**Effort:** L (8-12h)

### Sub-tasks

#### BIZ-004a: Create help center structure
**Option A (recommended):** In-app help pages
**Create:** `apps/web/app/(legal)/help/page.tsx` — help center landing
**Create:** `apps/web/app/(legal)/help/[slug]/page.tsx` — individual article

**Option B:** External tool (Notion public docs, GitBook, etc.)

#### BIZ-004b: Write 10 getting-started articles

| # | Title | Key Content |
|---|-------|-------------|
| 1 | Getting Started | First login, setup wizard, initial configuration |
| 2 | Creating Your First Load | Step-by-step with screenshots: shipper/consignee, dates, commodity, rate |
| 3 | Managing Carriers | Add carrier, FMCSA lookup, add trucks/drivers, activate |
| 4 | Dispatching Loads | Dispatch board overview, assign carrier, status updates |
| 5 | Invoicing & Payments | Create invoice, line items, send to customer, record payment |
| 6 | Tracking Shipments | Map view, status timeline, public tracking link |
| 7 | Commission Management | Create plan with tiers, assign reps, view payouts |
| 8 | Customer Management | Add company, contacts, leads, pipeline stages |
| 9 | User Management | Add users, assign roles, permissions overview |
| 10 | Settings & Configuration | Timezone, date format, company info, preferences |

Each article should include:
- Step-by-step instructions (numbered)
- Screenshots of each step
- Tips/notes boxes for important information
- "What's next?" link to related article

#### BIZ-004c: Add help links throughout app
- Dashboard: "Need help?" link → help center
- Each service area: contextual help link to relevant article
- Header: "?" icon → help center
- Empty states: "Learn how to..." with article link

### Acceptance Criteria
- [ ] 10 articles written and accessible
- [ ] Each article has step-by-step instructions
- [ ] Screenshots included for key steps
- [ ] Help center linked from dashboard and service areas
- [ ] Articles are searchable

---

## BIZ-005: Incident Response Framework [P1]
**Effort:** M (3-4h) | 4 runbooks

### Sub-tasks

#### BIZ-005a: Create severity definitions
**Create:** `Ultra-TMS/dev_docs_v3/04-business/incident-response.md`

| Severity | Description | Response Time | Resolution Time | Notification |
|---------|-------------|--------------|----------------|-------------|
| SEV1 | Complete outage, data loss risk | 15 minutes | 4 hours | All hands, customer comms |
| SEV2 | Major feature broken for all | 1 hour | 8 hours | On-call team, affected customers |
| SEV3 | Minor feature broken, workaround | 4 hours | 24 hours | On-call team |
| SEV4 | Cosmetic, low impact | 24 hours | Next sprint | Tracked in backlog |

#### BIZ-005b: Write 4 runbooks

**Runbook 1: Database Connection Failure**
1. Verify: Check PostgreSQL status (`pg_isready`)
2. Check: Connection pool utilization, max connections
3. Check: Disk space on database server
4. Fix: Restart connection pool / restart database
5. Fix: Increase max connections if needed
6. Verify: API health endpoint returns `database: connected`
7. Monitor: Watch for 30 minutes

**Runbook 2: API Server Crash**
1. Check: Docker container status (`docker ps`)
2. Check: Application logs for error/exception
3. Fix: Restart container (`docker compose restart api`)
4. If recurring: Check recent deployments, rollback if needed
5. Verify: Health endpoint returns 200
6. Monitor: Check Sentry for error pattern

**Runbook 3: Redis Connection Failure**
1. Check: Redis server status (`redis-cli ping`)
2. Check: Memory usage (`redis-cli info memory`)
3. Fix: Restart Redis (`docker compose restart redis`)
4. Check: Session data (users may need to re-login)
5. Verify: Health endpoint returns `redis: connected`

**Runbook 4: Deployment Rollback**
1. Identify: Which deployment caused the issue
2. Tag: Current (broken) state for analysis
3. Rollback: `git checkout <last-good-tag>`
4. Rebuild: `docker compose build && docker compose up -d`
5. Verify: Health endpoints, smoke test
6. Database: Check if migration rollback needed (`npx prisma migrate resolve`)
7. Communicate: Notify affected users

#### BIZ-005c: Document communication plan
- SEV1: Slack alert → team lead → customer email within 1h
- SEV2: Slack alert → team lead → customer email within 4h
- SEV3: Slack alert → track in GitHub issues
- SEV4: GitHub issue only

#### BIZ-005d: Create incident log template
```markdown
## Incident: [Title]
**Severity:** SEV[1-4]
**Detected:** YYYY-MM-DD HH:MM UTC
**Resolved:** YYYY-MM-DD HH:MM UTC
**Duration:** X hours

### Timeline
- HH:MM — Issue detected via [Sentry/uptime/user report]
- HH:MM — On-call notified
- HH:MM — Root cause identified: [description]
- HH:MM — Fix deployed
- HH:MM — Verified resolved

### Root Cause
[Description]

### Impact
- Users affected: [number/all]
- Features impacted: [list]
- Data impact: [none/description]

### Action Items
- [ ] [Preventive measure 1]
- [ ] [Preventive measure 2]
```

### Acceptance Criteria
- [ ] 4 severity levels defined with response SLAs
- [ ] 4 runbooks with step-by-step recovery procedures
- [ ] Communication plan documented
- [ ] Incident log template created
- [ ] Team knows where to find runbooks

---

## BIZ-006: Sprint 2 E2E Expansion [P1]
**Effort:** M (4-6h) | 4 new journeys (9 total with Sprint 1's 5)

### New E2E Journeys

#### Journey 6: Document Lifecycle
```typescript
test('Document: upload → view → share → download', async ({ page }) => {
  await loginAsAdmin(page);
  // Navigate to documents
  await page.goto('/documents');
  // Upload a file
  await page.setInputFiles('input[type="file"]', 'fixtures/test-document.pdf');
  await expect(page.getByText('test-document.pdf')).toBeVisible();
  // View document
  await page.getByText('test-document.pdf').click();
  await expect(page.getByText('Document Preview')).toBeVisible();
  // Share document
  await page.getByRole('button', { name: 'Share' }).click();
  const shareLink = await page.getByTestId('share-link').textContent();
  expect(shareLink).toContain('/documents/shared/');
  // Access via share link (no auth)
  await page.goto(shareLink!);
  await expect(page.getByText('test-document.pdf')).toBeVisible();
  // Download
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download' }).click(),
  ]);
  expect(download.suggestedFilename()).toBe('test-document.pdf');
});
```

#### Journey 7: Notification Flow
```typescript
test('Notification: trigger → appear → mark read', async ({ page }) => {
  await loginAsAdmin(page);
  // Check initial unread count
  const bell = page.getByTestId('notification-bell');
  const initialCount = await bell.getByTestId('unread-count').textContent();
  // Trigger a notification (create a load)
  await page.goto('/operations/loads/new');
  await fillLoadForm(page);
  await page.getByRole('button', { name: 'Create' }).click();
  // Verify notification appears
  await page.goto('/notifications');
  await expect(page.getByText('Load created')).toBeVisible();
  // Mark as read
  await page.getByText('Load created').click();
  // Verify count decreased
});
```

#### Journey 8: Credit Lifecycle
```typescript
test('Credit: apply → approve → hold → release', async ({ page }) => {
  await loginAsAdmin(page);
  // Submit credit application
  await page.goto('/credit/applications');
  await page.getByRole('button', { name: 'New Application' }).click();
  await page.fill('[name="companyId"]', 'test-company');
  await page.fill('[name="requestedAmount"]', '50000');
  await page.getByRole('button', { name: 'Submit' }).click();
  // Approve application
  await page.getByRole('button', { name: 'Review' }).click();
  await page.getByRole('button', { name: 'Approve' }).click();
  // Verify credit limit set
  await page.goto('/credit/limits');
  await expect(page.getByText('$50,000')).toBeVisible();
  // Verify hold appears when triggered
  // ... (trigger via overdue invoice)
  // Release hold
  await page.goto('/credit/holds');
  await page.getByRole('button', { name: 'Release' }).click();
});
```

#### Journey 9: Analytics
```typescript
test('Analytics: dashboard → drill-down → report → download', async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto('/analytics');
  // Verify dashboard loads with KPI cards
  await expect(page.getByTestId('kpi-total-revenue')).toBeVisible();
  // Drill down into a KPI
  await page.getByTestId('kpi-total-revenue').click();
  await expect(page.getByTestId('kpi-chart')).toBeVisible();
  // Run a report
  await page.goto('/analytics/reports');
  await page.getByText('Revenue Report').click();
  await page.getByRole('button', { name: 'Run Report' }).click();
  await expect(page.getByText('Completed')).toBeVisible({ timeout: 30000 });
  // Download CSV
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download CSV' }).click(),
  ]);
  expect(download.suggestedFilename()).toContain('.csv');
});
```

### Sub-tasks
1. Write 4 E2E journey files in `apps/web/e2e/`
2. Create test fixtures (test-document.pdf, etc.)
3. Run locally — fix any flaky tests
4. Add to CI pipeline

### Acceptance Criteria
- [ ] 4 new E2E journeys passing locally
- [ ] Total: 9 E2E journeys (5 Sprint 1 + 4 new)
- [ ] All pass in CI without flakiness
- [ ] Test fixtures committed

---

## BIZ-007: Financial Model [P2]
**Effort:** S (4-6h)

### Sub-tasks

#### BIZ-007a: Create financial model
**Create:** `Ultra-TMS/dev_docs_v3/04-business/financial-model.md`

**Revenue Projections (3 scenarios):**

| Metric | Conservative (Y1) | Moderate (Y1) | Aggressive (Y1) |
|--------|-------------------|---------------|-----------------|
| Starter customers | 10 | 25 | 50 |
| Professional customers | 5 | 15 | 30 |
| Enterprise customers | 1 | 3 | 8 |
| Starter MRR | $990 | $2,475 | $4,950 |
| Professional MRR | $1,495 | $4,485 | $8,970 |
| Enterprise MRR | $599 | $1,797 | $4,792 |
| **Total MRR** | **$3,084** | **$8,757** | **$18,712** |
| **Annual Revenue** | **$37,008** | **$105,084** | **$224,544** |

**Cost Structure (Monthly):**

| Category | Amount | Notes |
|---------|--------|-------|
| Hosting (API + Web + DB) | $200-500 | Railway/AWS, scales with customers |
| Redis | $50-100 | Managed instance |
| SendGrid | $50-200 | Based on email volume |
| Twilio | $50-200 | Based on SMS volume |
| Google Maps | $50-100 | Based on tracking usage |
| FMCSA API | $0-50 | Rate limited |
| Stripe fees | 2.9% + $0.30 | Per transaction |
| Domain + SSL | $20 | Annual |
| Sentry | $0-26 | Free tier initially |
| **Total Fixed** | **$420-1,176** | |

**Break-Even:**
- Conservative: ~5 months (at $3,084 MRR vs ~$700 costs)
- Moderate: ~2 months
- Aggressive: month 1

#### BIZ-007b: Pricing sensitivity analysis
- What if Starter is $79/mo? → higher volume, same break-even
- What if Professional is $399/mo? → lower volume, higher margin
- Enterprise custom pricing → negotiated based on load volume

#### BIZ-007c: Competitive pricing comparison
Research DAT, McLeod, TMW, MercuryGate pricing tiers for comparison.

### Acceptance Criteria
- [ ] Revenue model with 3 scenarios
- [ ] Cost structure documented with estimated ranges
- [ ] Break-even identified for each scenario
- [ ] Competitive landscape referenced

---

## Phase 6 Summary

| Task | Priority | Effort | Scope |
|------|----------|--------|-------|
| BIZ-001 | P0 | L (8-12h) | Privacy, ToS, AUP |
| BIZ-002 | P1 | L (6-8h) | Billing architecture (design only) |
| BIZ-003 | P1 | M (4-6h) | Swagger documentation |
| BIZ-004 | P1 | L (8-12h) | 10 help articles |
| BIZ-005 | P1 | M (3-4h) | 4 incident runbooks |
| BIZ-006 | P1 | M (4-6h) | 4 E2E journeys |
| BIZ-007 | P2 | S (4-6h) | Financial model |
| **TOTAL** | | **37-54h** | |

### Execution Order
1. BIZ-001 (legal docs — required for production)
2. BIZ-003 (Swagger — helps all future development)
3. BIZ-005 (incident response — needed for production stability)
4. BIZ-006 (E2E tests — validates Sprint 2 services)
5. BIZ-002 + BIZ-004 (parallel — billing design + help articles)
6. BIZ-007 (financial model — lowest priority)

### Parallelization (Claude + Codex/Gemini)
| Task | Claude | Codex/Gemini |
|------|--------|-------------|
| BIZ-001 | Legal drafting | Layout/route creation |
| BIZ-003 | Swagger audit + decorators | Response examples |
| BIZ-004 | Articles 1-5 | Articles 6-10 |
| BIZ-006 | E2E journeys 6-7 | E2E journeys 8-9 |
