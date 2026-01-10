# Phase 0: Verify Existing Services

> **EXECUTE THIS PROMPT FIRST** before implementing any new services. This verification ensures all 8 completed services have proper integration tests, correct event publishing, and tenant isolation.

## 📋 Overview

| Metric | Value |
|--------|-------|
| **Services to Verify** | 8 |
| **Total Endpoints** | ~260 |
| **Priority** | P0 - Critical |
| **Objective** | Verify and test all existing service implementations |

---

## 🎯 Services to Verify

| # | Service | Doc Reference | Endpoints | Module Path |
|---|---------|---------------|-----------|-------------|
| 1 | Auth & Admin | [08-service-auth-admin.md](../../02-services/08-service-auth-admin.md) | 30 | `src/modules/auth/` |
| 2 | CRM | [09-service-crm.md](../../02-services/09-service-crm.md) | 35 | `src/modules/crm/` |
| 3 | Sales | [10-service-sales.md](../../02-services/10-service-sales.md) | 38 | `src/modules/sales/` |
| 4 | Accounting | [13-service-accounting.md](../../02-services/13-service-accounting.md) | 40 | `src/modules/accounting/` |
| 5 | Load Board (Internal) | [14-service-load-board.md](../../02-services/14-service-load-board.md) | 27 | `src/modules/load-board/` |
| 6 | Commission | [15-service-commission.md](../../02-services/15-service-commission.md) | 25 | `src/modules/commission/` |
| 7 | Documents | [17-service-documents.md](../../02-services/17-service-documents.md) | 35 | `src/modules/documents/` |
| 8 | Communication | [18-service-communication.md](../../02-services/18-service-communication.md) | 30 | `src/modules/communication/` |

---

## ✅ Pre-Verification Checklist

Before starting verification, ensure:

- [ ] Database is running and migrations are applied
- [ ] Redis is running (for session/cache)
- [ ] Test database is configured
- [ ] Environment variables are set correctly
- [ ] `pnpm install` has been run

---

## 1️⃣ Auth & Admin Service Verification

### Reference
- **Doc:** [08-service-auth-admin.md](../../02-services/08-service-auth-admin.md)
- **Module:** `apps/api/src/modules/auth/`

### Endpoints to Verify

| Method | Endpoint | Description | Test Status |
|--------|----------|-------------|-------------|
| POST | `/api/v1/auth/register` | User registration | ⬜ |
| POST | `/api/v1/auth/login` | User login | ⬜ |
| POST | `/api/v1/auth/logout` | User logout | ⬜ |
| POST | `/api/v1/auth/refresh` | Refresh token | ⬜ |
| POST | `/api/v1/auth/forgot-password` | Request password reset | ⬜ |
| POST | `/api/v1/auth/reset-password` | Reset password | ⬜ |
| GET | `/api/v1/auth/me` | Get current user | ⬜ |
| PUT | `/api/v1/auth/me` | Update current user | ⬜ |
| POST | `/api/v1/auth/mfa/enable` | Enable MFA | ⬜ |
| POST | `/api/v1/auth/mfa/verify` | Verify MFA | ⬜ |
| GET | `/api/v1/users` | List users | ⬜ |
| GET | `/api/v1/users/:id` | Get user | ⬜ |
| POST | `/api/v1/users` | Create user | ⬜ |
| PUT | `/api/v1/users/:id` | Update user | ⬜ |
| DELETE | `/api/v1/users/:id` | Deactivate user | ⬜ |
| PATCH | `/api/v1/users/:id/roles` | Assign roles | ⬜ |
| GET | `/api/v1/roles` | List roles | ⬜ |
| GET | `/api/v1/roles/:id` | Get role | ⬜ |
| POST | `/api/v1/roles` | Create role | ⬜ |
| PUT | `/api/v1/roles/:id` | Update role | ⬜ |
| DELETE | `/api/v1/roles/:id` | Delete role | ⬜ |
| GET | `/api/v1/permissions` | List permissions | ⬜ |
| GET | `/api/v1/tenants` | List tenants | ⬜ |
| GET | `/api/v1/tenants/:id` | Get tenant | ⬜ |
| POST | `/api/v1/tenants` | Create tenant | ⬜ |
| PUT | `/api/v1/tenants/:id` | Update tenant | ⬜ |
| GET | `/api/v1/sessions` | List user sessions | ⬜ |
| DELETE | `/api/v1/sessions/:id` | Revoke session | ⬜ |
| GET | `/api/v1/auth/audit` | Auth audit log | ⬜ |
| POST | `/api/v1/auth/impersonate/:userId` | Impersonate user | ⬜ |

### Integration Test Requirements

```typescript
// tests/auth.e2e-spec.ts

describe('Auth & Admin Service', () => {
  describe('Authentication', () => {
    it('should register new user with valid data');
    it('should reject registration with existing email');
    it('should login with valid credentials');
    it('should reject login with invalid password');
    it('should return JWT tokens on successful login');
    it('should refresh access token with valid refresh token');
    it('should logout and invalidate tokens');
    it('should handle forgot password flow');
    it('should reset password with valid token');
    it('should reject expired password reset tokens');
  });

  describe('MFA', () => {
    it('should generate MFA secret for user');
    it('should verify valid TOTP code');
    it('should reject invalid TOTP code');
    it('should require MFA on login when enabled');
  });

  describe('User Management', () => {
    it('should list users with pagination');
    it('should filter users by role');
    it('should filter users by status');
    it('should create user with roles');
    it('should update user profile');
    it('should deactivate user (soft delete)');
    it('should assign roles to user');
    it('should remove roles from user');
  });

  describe('Role Management', () => {
    it('should list all roles');
    it('should create custom role with permissions');
    it('should update role permissions');
    it('should prevent deletion of system roles');
    it('should cascade role changes to users');
  });

  describe('Tenant Isolation', () => {
    it('should isolate users by tenant');
    it('should isolate roles by tenant');
    it('should prevent cross-tenant access');
    it('should include tenantId in all queries');
  });

  describe('Session Management', () => {
    it('should list active sessions for user');
    it('should revoke specific session');
    it('should revoke all sessions on password change');
  });
});
```

### Events to Verify

| Event | Trigger | Verified |
|-------|---------|----------|
| `user.registered` | New user registration | ⬜ |
| `user.login` | Successful login | ⬜ |
| `user.logout` | User logout | ⬜ |
| `user.password.reset` | Password reset | ⬜ |
| `user.mfa.enabled` | MFA enabled | ⬜ |
| `user.role.changed` | Role assignment changed | ⬜ |
| `user.deactivated` | User deactivated | ⬜ |

### Verification Commands

```bash
# Run auth service tests
cd apps/api
pnpm test:e2e -- --grep "Auth"

# Check auth module structure
ls -la src/modules/auth/

# Verify endpoints are registered
pnpm start:dev &
curl http://localhost:3000/api/v1/auth/health
```

---

## 2️⃣ CRM Service Verification

### Reference
- **Doc:** [09-service-crm.md](../../02-services/09-service-crm.md)
- **Module:** `apps/api/src/modules/crm/`

### Endpoints to Verify

| Method | Endpoint | Description | Test Status |
|--------|----------|-------------|-------------|
| GET | `/api/v1/companies` | List companies | ⬜ |
| GET | `/api/v1/companies/:id` | Get company | ⬜ |
| POST | `/api/v1/companies` | Create company | ⬜ |
| PUT | `/api/v1/companies/:id` | Update company | ⬜ |
| DELETE | `/api/v1/companies/:id` | Delete company | ⬜ |
| POST | `/api/v1/companies/:id/merge` | Merge companies | ⬜ |
| GET | `/api/v1/companies/:id/contacts` | List company contacts | ⬜ |
| GET | `/api/v1/companies/:id/activities` | List company activities | ⬜ |
| GET | `/api/v1/companies/:id/opportunities` | List company opportunities | ⬜ |
| GET | `/api/v1/contacts` | List contacts | ⬜ |
| GET | `/api/v1/contacts/:id` | Get contact | ⬜ |
| POST | `/api/v1/contacts` | Create contact | ⬜ |
| PUT | `/api/v1/contacts/:id` | Update contact | ⬜ |
| DELETE | `/api/v1/contacts/:id` | Delete contact | ⬜ |
| POST | `/api/v1/contacts/:id/link-company` | Link to company | ⬜ |
| GET | `/api/v1/opportunities` | List opportunities | ⬜ |
| GET | `/api/v1/opportunities/:id` | Get opportunity | ⬜ |
| POST | `/api/v1/opportunities` | Create opportunity | ⬜ |
| PUT | `/api/v1/opportunities/:id` | Update opportunity | ⬜ |
| DELETE | `/api/v1/opportunities/:id` | Delete opportunity | ⬜ |
| PATCH | `/api/v1/opportunities/:id/stage` | Update stage | ⬜ |
| POST | `/api/v1/opportunities/:id/won` | Mark as won | ⬜ |
| POST | `/api/v1/opportunities/:id/lost` | Mark as lost | ⬜ |
| GET | `/api/v1/activities` | List activities | ⬜ |
| GET | `/api/v1/activities/:id` | Get activity | ⬜ |
| POST | `/api/v1/activities` | Create activity | ⬜ |
| PUT | `/api/v1/activities/:id` | Update activity | ⬜ |
| DELETE | `/api/v1/activities/:id` | Delete activity | ⬜ |
| PATCH | `/api/v1/activities/:id/complete` | Complete activity | ⬜ |
| GET | `/api/v1/crm/pipeline` | Pipeline overview | ⬜ |
| GET | `/api/v1/crm/dashboard` | CRM dashboard | ⬜ |
| POST | `/api/v1/crm/hubspot/sync` | Sync with HubSpot | ⬜ |
| GET | `/api/v1/crm/hubspot/status` | HubSpot sync status | ⬜ |
| GET | `/api/v1/interaction-history/:entityType/:entityId` | Interaction history | ⬜ |

### Integration Test Requirements

```typescript
// tests/crm.e2e-spec.ts

describe('CRM Service', () => {
  describe('Companies', () => {
    it('should list companies with pagination');
    it('should filter companies by type (CUSTOMER/PROSPECT/LEAD)');
    it('should filter companies by status');
    it('should search companies by name');
    it('should create company with required fields');
    it('should validate company data');
    it('should update company');
    it('should soft delete company');
    it('should merge duplicate companies');
    it('should list company contacts');
    it('should list company activities');
    it('should list company opportunities');
  });

  describe('Contacts', () => {
    it('should list contacts with pagination');
    it('should filter contacts by company');
    it('should filter contacts by role');
    it('should create contact linked to company');
    it('should create standalone contact');
    it('should update contact');
    it('should soft delete contact');
    it('should link contact to different company');
  });

  describe('Opportunities', () => {
    it('should list opportunities with pagination');
    it('should filter by stage');
    it('should filter by owner');
    it('should filter by date range');
    it('should create opportunity');
    it('should update opportunity');
    it('should move opportunity through stages');
    it('should mark opportunity as won');
    it('should mark opportunity as lost with reason');
    it('should calculate pipeline value');
  });

  describe('Activities', () => {
    it('should list activities with pagination');
    it('should filter by type (CALL/EMAIL/MEETING/TASK)');
    it('should filter by status');
    it('should create activity');
    it('should link activity to entity');
    it('should complete activity');
    it('should reschedule activity');
  });

  describe('Tenant Isolation', () => {
    it('should isolate all CRM data by tenant');
    it('should prevent cross-tenant access');
  });
});
```

### Events to Verify

| Event | Trigger | Verified |
|-------|---------|----------|
| `company.created` | Company created | ⬜ |
| `company.updated` | Company updated | ⬜ |
| `contact.created` | Contact created | ⬜ |
| `opportunity.created` | Opportunity created | ⬜ |
| `opportunity.stage.changed` | Stage changed | ⬜ |
| `opportunity.won` | Opportunity won | ⬜ |
| `opportunity.lost` | Opportunity lost | ⬜ |
| `activity.created` | Activity created | ⬜ |
| `activity.completed` | Activity completed | ⬜ |

---

## 3️⃣ Sales Service Verification

### Reference
- **Doc:** [10-service-sales.md](../../02-services/10-service-sales.md)
- **Module:** `apps/api/src/modules/sales/`

### Endpoints to Verify

| Method | Endpoint | Description | Test Status |
|--------|----------|-------------|-------------|
| GET | `/api/v1/quotes` | List quotes | ⬜ |
| GET | `/api/v1/quotes/:id` | Get quote | ⬜ |
| POST | `/api/v1/quotes` | Create quote | ⬜ |
| PUT | `/api/v1/quotes/:id` | Update quote | ⬜ |
| DELETE | `/api/v1/quotes/:id` | Delete quote | ⬜ |
| POST | `/api/v1/quotes/:id/duplicate` | Duplicate quote | ⬜ |
| POST | `/api/v1/quotes/:id/convert` | Convert to order | ⬜ |
| POST | `/api/v1/quotes/:id/send` | Send quote to customer | ⬜ |
| GET | `/api/v1/quotes/:id/stops` | Get quote stops | ⬜ |
| POST | `/api/v1/quotes/:id/stops` | Add stop | ⬜ |
| PUT | `/api/v1/quotes/:id/stops/:stopId` | Update stop | ⬜ |
| DELETE | `/api/v1/quotes/:id/stops/:stopId` | Remove stop | ⬜ |
| POST | `/api/v1/quotes/:id/calculate-rate` | Calculate rate | ⬜ |
| GET | `/api/v1/rate-contracts` | List rate contracts | ⬜ |
| GET | `/api/v1/rate-contracts/:id` | Get rate contract | ⬜ |
| POST | `/api/v1/rate-contracts` | Create rate contract | ⬜ |
| PUT | `/api/v1/rate-contracts/:id` | Update rate contract | ⬜ |
| DELETE | `/api/v1/rate-contracts/:id` | Delete rate contract | ⬜ |
| GET | `/api/v1/rate-contracts/:id/lanes` | Get contract lanes | ⬜ |
| POST | `/api/v1/rate-contracts/:id/lanes` | Add lane | ⬜ |
| PUT | `/api/v1/rate-contracts/:id/lanes/:laneId` | Update lane | ⬜ |
| DELETE | `/api/v1/rate-contracts/:id/lanes/:laneId` | Remove lane | ⬜ |
| POST | `/api/v1/rate-lookup` | Lookup rate for lane | ⬜ |
| GET | `/api/v1/sales-quotas` | List sales quotas | ⬜ |
| GET | `/api/v1/sales-quotas/:id` | Get quota | ⬜ |
| POST | `/api/v1/sales-quotas` | Create quota | ⬜ |
| PUT | `/api/v1/sales-quotas/:id` | Update quota | ⬜ |
| GET | `/api/v1/sales-quotas/:id/progress` | Get quota progress | ⬜ |
| GET | `/api/v1/sales/pipeline` | Sales pipeline | ⬜ |
| GET | `/api/v1/sales/leaderboard` | Sales leaderboard | ⬜ |
| GET | `/api/v1/sales/forecast` | Revenue forecast | ⬜ |
| GET | `/api/v1/sales/conversion-rate` | Conversion metrics | ⬜ |
| GET | `/api/v1/sales/activity-summary` | Activity summary | ⬜ |
| GET | `/api/v1/territories` | List territories | ⬜ |
| POST | `/api/v1/territories` | Create territory | ⬜ |
| PUT | `/api/v1/territories/:id` | Update territory | ⬜ |
| POST | `/api/v1/territories/:id/assign` | Assign rep to territory | ⬜ |

### Integration Test Requirements

```typescript
// tests/sales.e2e-spec.ts

describe('Sales Service', () => {
  describe('Quotes', () => {
    it('should list quotes with pagination');
    it('should filter quotes by status');
    it('should filter quotes by customer');
    it('should filter quotes by sales rep');
    it('should create quote with stops');
    it('should calculate multi-stop rates');
    it('should update quote');
    it('should duplicate quote');
    it('should convert quote to order');
    it('should track quote history');
    it('should send quote email');
  });

  describe('Rate Contracts', () => {
    it('should list rate contracts');
    it('should create rate contract with lanes');
    it('should update rate contract');
    it('should add/update/remove lanes');
    it('should lookup rate by lane');
    it('should respect contract date validity');
    it('should handle fuel surcharge');
  });

  describe('Sales Quotas', () => {
    it('should create quota for user/team');
    it('should track quota progress');
    it('should calculate quota attainment');
  });

  describe('Sales Analytics', () => {
    it('should return pipeline summary');
    it('should return leaderboard');
    it('should calculate conversion rate');
  });

  describe('Tenant Isolation', () => {
    it('should isolate all sales data by tenant');
  });
});
```

### Events to Verify

| Event | Trigger | Verified |
|-------|---------|----------|
| `quote.created` | Quote created | ⬜ |
| `quote.updated` | Quote updated | ⬜ |
| `quote.converted` | Quote converted to order | ⬜ |
| `quote.sent` | Quote sent to customer | ⬜ |
| `rate-contract.created` | Rate contract created | ⬜ |

---

## 4️⃣ Accounting Service Verification

### Reference
- **Doc:** [13-service-accounting.md](../../02-services/13-service-accounting.md)
- **Module:** `apps/api/src/modules/accounting/`

### Endpoints to Verify

| Method | Endpoint | Description | Test Status |
|--------|----------|-------------|-------------|
| GET | `/api/v1/invoices` | List invoices | ⬜ |
| GET | `/api/v1/invoices/:id` | Get invoice | ⬜ |
| POST | `/api/v1/invoices` | Create invoice | ⬜ |
| PUT | `/api/v1/invoices/:id` | Update invoice | ⬜ |
| DELETE | `/api/v1/invoices/:id` | Void invoice | ⬜ |
| POST | `/api/v1/invoices/:id/finalize` | Finalize invoice | ⬜ |
| POST | `/api/v1/invoices/:id/send` | Send invoice | ⬜ |
| GET | `/api/v1/invoices/:id/pdf` | Generate PDF | ⬜ |
| POST | `/api/v1/invoices/batch` | Batch create invoices | ⬜ |
| GET | `/api/v1/invoice-items/:invoiceId` | Get invoice items | ⬜ |
| POST | `/api/v1/invoice-items` | Add item | ⬜ |
| PUT | `/api/v1/invoice-items/:id` | Update item | ⬜ |
| DELETE | `/api/v1/invoice-items/:id` | Remove item | ⬜ |
| GET | `/api/v1/payments` | List payments | ⬜ |
| GET | `/api/v1/payments/:id` | Get payment | ⬜ |
| POST | `/api/v1/payments` | Record payment | ⬜ |
| POST | `/api/v1/payments/:id/apply` | Apply to invoices | ⬜ |
| POST | `/api/v1/payments/:id/void` | Void payment | ⬜ |
| GET | `/api/v1/settlements` | List settlements | ⬜ |
| GET | `/api/v1/settlements/:id` | Get settlement | ⬜ |
| POST | `/api/v1/settlements` | Create settlement | ⬜ |
| PUT | `/api/v1/settlements/:id` | Update settlement | ⬜ |
| POST | `/api/v1/settlements/:id/approve` | Approve settlement | ⬜ |
| POST | `/api/v1/settlements/:id/pay` | Process payment | ⬜ |
| GET | `/api/v1/settlements/:id/line-items` | Get line items | ⬜ |
| POST | `/api/v1/settlements/:id/line-items` | Add line item | ⬜ |
| GET | `/api/v1/journal-entries` | List journal entries | ⬜ |
| GET | `/api/v1/journal-entries/:id` | Get journal entry | ⬜ |
| POST | `/api/v1/journal-entries` | Create journal entry | ⬜ |
| POST | `/api/v1/journal-entries/:id/post` | Post entry | ⬜ |
| GET | `/api/v1/chart-of-accounts` | List accounts | ⬜ |
| POST | `/api/v1/chart-of-accounts` | Create account | ⬜ |
| GET | `/api/v1/accounting/ar-aging` | AR aging report | ⬜ |
| GET | `/api/v1/accounting/ap-aging` | AP aging report | ⬜ |
| GET | `/api/v1/accounting/trial-balance` | Trial balance | ⬜ |
| GET | `/api/v1/accounting/revenue-report` | Revenue report | ⬜ |
| POST | `/api/v1/quickbooks/sync` | Sync with QuickBooks | ⬜ |
| GET | `/api/v1/quickbooks/status` | QuickBooks sync status | ⬜ |

### Integration Test Requirements

```typescript
// tests/accounting.e2e-spec.ts

describe('Accounting Service', () => {
  describe('Invoices', () => {
    it('should list invoices with pagination');
    it('should filter by status (DRAFT/FINALIZED/SENT/PAID)');
    it('should filter by customer');
    it('should filter by date range');
    it('should create invoice from order');
    it('should add/update/remove line items');
    it('should calculate totals');
    it('should finalize invoice (lock)');
    it('should send invoice email');
    it('should generate PDF');
    it('should void invoice');
    it('should batch create invoices');
  });

  describe('Payments', () => {
    it('should record payment');
    it('should apply payment to invoices');
    it('should handle partial payments');
    it('should handle overpayments (credit)');
    it('should void payment');
    it('should update invoice status on payment');
  });

  describe('Settlements', () => {
    it('should list settlements');
    it('should create settlement for carrier');
    it('should add deductions/additions');
    it('should calculate net amount');
    it('should approve settlement');
    it('should process payment');
  });

  describe('Journal Entries', () => {
    it('should create balanced journal entry');
    it('should reject unbalanced entries');
    it('should post entry');
    it('should prevent editing posted entries');
  });

  describe('Reports', () => {
    it('should generate AR aging');
    it('should generate AP aging');
    it('should generate trial balance');
    it('should filter reports by date');
  });

  describe('Tenant Isolation', () => {
    it('should isolate all accounting data by tenant');
  });
});
```

### Events to Verify

| Event | Trigger | Verified |
|-------|---------|----------|
| `invoice.created` | Invoice created | ⬜ |
| `invoice.finalized` | Invoice finalized | ⬜ |
| `invoice.sent` | Invoice sent | ⬜ |
| `invoice.paid` | Invoice fully paid | ⬜ |
| `payment.received` | Payment recorded | ⬜ |
| `payment.applied` | Payment applied | ⬜ |
| `settlement.created` | Settlement created | ⬜ |
| `settlement.approved` | Settlement approved | ⬜ |
| `settlement.paid` | Settlement paid | ⬜ |

---

## 5️⃣ Load Board (Internal) Service Verification

### Reference
- **Doc:** [14-service-load-board.md](../../02-services/14-service-load-board.md)
- **Module:** `apps/api/src/modules/load-board/`

### Endpoints to Verify

| Method | Endpoint | Description | Test Status |
|--------|----------|-------------|-------------|
| GET | `/api/v1/load-board/postings` | List postings | ⬜ |
| GET | `/api/v1/load-board/postings/:id` | Get posting | ⬜ |
| POST | `/api/v1/load-board/postings` | Create posting | ⬜ |
| PUT | `/api/v1/load-board/postings/:id` | Update posting | ⬜ |
| DELETE | `/api/v1/load-board/postings/:id` | Remove posting | ⬜ |
| POST | `/api/v1/load-board/postings/:id/refresh` | Refresh posting | ⬜ |
| POST | `/api/v1/load-board/postings/:id/book` | Book load | ⬜ |
| GET | `/api/v1/load-board/search` | Search postings | ⬜ |
| POST | `/api/v1/load-board/match` | Match carriers | ⬜ |
| GET | `/api/v1/load-board/saved-searches` | Saved searches | ⬜ |
| POST | `/api/v1/load-board/saved-searches` | Save search | ⬜ |
| DELETE | `/api/v1/load-board/saved-searches/:id` | Delete search | ⬜ |
| GET | `/api/v1/load-board/alerts` | List alerts | ⬜ |
| POST | `/api/v1/load-board/alerts` | Create alert | ⬜ |
| PUT | `/api/v1/load-board/alerts/:id` | Update alert | ⬜ |
| DELETE | `/api/v1/load-board/alerts/:id` | Delete alert | ⬜ |
| GET | `/api/v1/load-board/carrier-matches/:loadId` | Get matches | ⬜ |
| POST | `/api/v1/load-board/carrier-matches/:loadId/notify` | Notify carriers | ⬜ |
| GET | `/api/v1/load-board/bookings` | List bookings | ⬜ |
| GET | `/api/v1/load-board/bookings/:id` | Get booking | ⬜ |
| POST | `/api/v1/load-board/bookings/:id/confirm` | Confirm booking | ⬜ |
| POST | `/api/v1/load-board/bookings/:id/cancel` | Cancel booking | ⬜ |
| GET | `/api/v1/load-board/capacity` | Carrier capacity | ⬜ |
| GET | `/api/v1/load-board/analytics` | Board analytics | ⬜ |
| GET | `/api/v1/load-board/heatmap` | Load density map | ⬜ |
| POST | `/api/v1/load-board/bulk-post` | Bulk post loads | ⬜ |
| POST | `/api/v1/load-board/auto-match` | Auto-match settings | ⬜ |

### Integration Test Requirements

```typescript
// tests/load-board.e2e-spec.ts

describe('Load Board Service', () => {
  describe('Postings', () => {
    it('should list postings with pagination');
    it('should filter by equipment type');
    it('should filter by origin/destination');
    it('should filter by date range');
    it('should create posting from load');
    it('should update posting');
    it('should refresh posting timestamp');
    it('should remove posting');
    it('should bulk post loads');
  });

  describe('Search & Matching', () => {
    it('should search postings by criteria');
    it('should match carriers to load');
    it('should rank matches by score');
    it('should save search criteria');
    it('should notify carriers of matches');
  });

  describe('Bookings', () => {
    it('should book load');
    it('should confirm booking');
    it('should cancel booking');
    it('should update load status on booking');
  });

  describe('Alerts', () => {
    it('should create load alert');
    it('should trigger alert on match');
  });

  describe('Tenant Isolation', () => {
    it('should isolate postings by tenant');
  });
});
```

### Events to Verify

| Event | Trigger | Verified |
|-------|---------|----------|
| `load-board.posted` | Load posted | ⬜ |
| `load-board.refreshed` | Posting refreshed | ⬜ |
| `load-board.removed` | Posting removed | ⬜ |
| `load-board.booked` | Load booked | ⬜ |
| `load-board.match.found` | Match found | ⬜ |
| `load-board.alert.triggered` | Alert triggered | ⬜ |

---

## 6️⃣ Commission Service Verification

### Reference
- **Doc:** [15-service-commission.md](../../02-services/15-service-commission.md)
- **Module:** `apps/api/src/modules/commission/`

### Endpoints to Verify

| Method | Endpoint | Description | Test Status |
|--------|----------|-------------|-------------|
| GET | `/api/v1/commission-rules` | List rules | ⬜ |
| GET | `/api/v1/commission-rules/:id` | Get rule | ⬜ |
| POST | `/api/v1/commission-rules` | Create rule | ⬜ |
| PUT | `/api/v1/commission-rules/:id` | Update rule | ⬜ |
| DELETE | `/api/v1/commission-rules/:id` | Delete rule | ⬜ |
| GET | `/api/v1/commissions` | List commissions | ⬜ |
| GET | `/api/v1/commissions/:id` | Get commission | ⬜ |
| POST | `/api/v1/commissions/calculate` | Calculate commission | ⬜ |
| POST | `/api/v1/commissions/:id/approve` | Approve commission | ⬜ |
| POST | `/api/v1/commissions/:id/reject` | Reject commission | ⬜ |
| GET | `/api/v1/commission-adjustments` | List adjustments | ⬜ |
| POST | `/api/v1/commission-adjustments` | Create adjustment | ⬜ |
| PUT | `/api/v1/commission-adjustments/:id` | Update adjustment | ⬜ |
| POST | `/api/v1/commission-adjustments/:id/approve` | Approve adjustment | ⬜ |
| GET | `/api/v1/commission-payouts` | List payouts | ⬜ |
| GET | `/api/v1/commission-payouts/:id` | Get payout | ⬜ |
| POST | `/api/v1/commission-payouts` | Create payout | ⬜ |
| POST | `/api/v1/commission-payouts/:id/process` | Process payout | ⬜ |
| GET | `/api/v1/commission-statements/:userId` | User statement | ⬜ |
| GET | `/api/v1/commission-statements/:userId/pdf` | Statement PDF | ⬜ |
| GET | `/api/v1/commission-tiers` | List tiers | ⬜ |
| POST | `/api/v1/commission-tiers` | Create tier | ⬜ |
| PUT | `/api/v1/commission-tiers/:id` | Update tier | ⬜ |
| GET | `/api/v1/commissions/summary` | Commission summary | ⬜ |
| GET | `/api/v1/commissions/leaderboard` | Commission leaderboard | ⬜ |

### Integration Test Requirements

```typescript
// tests/commission.e2e-spec.ts

describe('Commission Service', () => {
  describe('Commission Rules', () => {
    it('should list rules with pagination');
    it('should create rule with conditions');
    it('should update rule');
    it('should delete rule');
    it('should validate rule structure');
  });

  describe('Commission Calculation', () => {
    it('should calculate commission based on rules');
    it('should apply tiered rates');
    it('should handle split commissions');
    it('should apply minimum/maximum limits');
    it('should handle overrides');
  });

  describe('Approvals', () => {
    it('should approve commission');
    it('should reject commission with reason');
    it('should track approval history');
  });

  describe('Adjustments', () => {
    it('should create positive adjustment');
    it('should create negative adjustment (clawback)');
    it('should approve adjustment');
  });

  describe('Payouts', () => {
    it('should create payout batch');
    it('should process payout');
    it('should generate statement');
  });

  describe('Tenant Isolation', () => {
    it('should isolate commissions by tenant');
  });
});
```

### Events to Verify

| Event | Trigger | Verified |
|-------|---------|----------|
| `commission.calculated` | Commission calculated | ⬜ |
| `commission.approved` | Commission approved | ⬜ |
| `commission.rejected` | Commission rejected | ⬜ |
| `commission.adjustment.created` | Adjustment created | ⬜ |
| `commission.payout.processed` | Payout processed | ⬜ |

---

## 7️⃣ Documents Service Verification

### Reference
- **Doc:** [17-service-documents.md](../../02-services/17-service-documents.md)
- **Module:** `apps/api/src/modules/documents/`

### Endpoints to Verify

| Method | Endpoint | Description | Test Status |
|--------|----------|-------------|-------------|
| GET | `/api/v1/documents` | List documents | ⬜ |
| GET | `/api/v1/documents/:id` | Get document | ⬜ |
| POST | `/api/v1/documents` | Upload document | ⬜ |
| PUT | `/api/v1/documents/:id` | Update metadata | ⬜ |
| DELETE | `/api/v1/documents/:id` | Delete document | ⬜ |
| GET | `/api/v1/documents/:id/download` | Download document | ⬜ |
| GET | `/api/v1/documents/:id/preview` | Preview URL | ⬜ |
| POST | `/api/v1/documents/:id/copy` | Copy document | ⬜ |
| POST | `/api/v1/documents/:id/move` | Move document | ⬜ |
| GET | `/api/v1/documents/:id/versions` | Get versions | ⬜ |
| POST | `/api/v1/documents/:id/versions` | Upload new version | ⬜ |
| GET | `/api/v1/documents/:id/versions/:versionId` | Get version | ⬜ |
| POST | `/api/v1/documents/:id/restore/:versionId` | Restore version | ⬜ |
| GET | `/api/v1/documents/entity/:type/:id` | Documents for entity | ⬜ |
| POST | `/api/v1/documents/link` | Link to entity | ⬜ |
| DELETE | `/api/v1/documents/link` | Unlink from entity | ⬜ |
| GET | `/api/v1/document-folders` | List folders | ⬜ |
| POST | `/api/v1/document-folders` | Create folder | ⬜ |
| PUT | `/api/v1/document-folders/:id` | Update folder | ⬜ |
| DELETE | `/api/v1/document-folders/:id` | Delete folder | ⬜ |
| GET | `/api/v1/document-templates` | List templates | ⬜ |
| GET | `/api/v1/document-templates/:id` | Get template | ⬜ |
| POST | `/api/v1/document-templates` | Create template | ⬜ |
| PUT | `/api/v1/document-templates/:id` | Update template | ⬜ |
| DELETE | `/api/v1/document-templates/:id` | Delete template | ⬜ |
| POST | `/api/v1/document-templates/:id/generate` | Generate from template | ⬜ |
| GET | `/api/v1/documents/required/:entityType` | Required docs for entity | ⬜ |
| GET | `/api/v1/documents/missing/:entityType/:entityId` | Missing required docs | ⬜ |
| POST | `/api/v1/documents/bulk-upload` | Bulk upload | ⬜ |
| GET | `/api/v1/documents/expiring` | Expiring documents | ⬜ |
| POST | `/api/v1/documents/:id/share` | Generate share link | ⬜ |
| GET | `/api/v1/documents/shared/:token` | Access shared doc | ⬜ |
| GET | `/api/v1/documents/search` | Search documents | ⬜ |
| POST | `/api/v1/documents/:id/ocr` | Trigger OCR | ⬜ |

### Integration Test Requirements

```typescript
// tests/documents.e2e-spec.ts

describe('Documents Service', () => {
  describe('Document CRUD', () => {
    it('should upload document');
    it('should list documents with pagination');
    it('should filter by type');
    it('should filter by entity');
    it('should download document');
    it('should generate preview URL');
    it('should update metadata');
    it('should soft delete document');
  });

  describe('Versioning', () => {
    it('should upload new version');
    it('should list versions');
    it('should restore previous version');
    it('should track version history');
  });

  describe('Entity Linking', () => {
    it('should link document to entity');
    it('should unlink document');
    it('should get documents for entity');
    it('should track required documents');
    it('should identify missing documents');
  });

  describe('Templates', () => {
    it('should create template');
    it('should generate document from template');
    it('should merge data into template');
  });

  describe('Sharing', () => {
    it('should generate share link');
    it('should access shared document');
    it('should expire share links');
  });

  describe('Storage', () => {
    it('should handle large files');
    it('should validate file types');
    it('should enforce size limits');
  });

  describe('Tenant Isolation', () => {
    it('should isolate documents by tenant');
    it('should prevent cross-tenant access');
  });
});
```

### Events to Verify

| Event | Trigger | Verified |
|-------|---------|----------|
| `document.uploaded` | Document uploaded | ⬜ |
| `document.updated` | Document updated | ⬜ |
| `document.deleted` | Document deleted | ⬜ |
| `document.version.created` | New version | ⬜ |
| `document.linked` | Linked to entity | ⬜ |
| `document.expiring` | Expiration warning | ⬜ |
| `document.shared` | Share link created | ⬜ |

---

## 8️⃣ Communication Service Verification

### Reference
- **Doc:** [18-service-communication.md](../../02-services/18-service-communication.md)
- **Module:** `apps/api/src/modules/communication/`

### Endpoints to Verify

| Method | Endpoint | Description | Test Status |
|--------|----------|-------------|-------------|
| GET | `/api/v1/email-templates` | List templates | ⬜ |
| GET | `/api/v1/email-templates/:id` | Get template | ⬜ |
| POST | `/api/v1/email-templates` | Create template | ⬜ |
| PUT | `/api/v1/email-templates/:id` | Update template | ⬜ |
| DELETE | `/api/v1/email-templates/:id` | Delete template | ⬜ |
| POST | `/api/v1/email-templates/:id/preview` | Preview template | ⬜ |
| POST | `/api/v1/email/send` | Send email | ⬜ |
| POST | `/api/v1/email/send-template` | Send templated email | ⬜ |
| POST | `/api/v1/email/send-bulk` | Send bulk email | ⬜ |
| GET | `/api/v1/email/history` | Email history | ⬜ |
| GET | `/api/v1/email/history/:id` | Email details | ⬜ |
| POST | `/api/v1/sms/send` | Send SMS | ⬜ |
| POST | `/api/v1/sms/send-template` | Send templated SMS | ⬜ |
| GET | `/api/v1/sms/history` | SMS history | ⬜ |
| GET | `/api/v1/notifications` | List notifications | ⬜ |
| GET | `/api/v1/notifications/:id` | Get notification | ⬜ |
| POST | `/api/v1/notifications` | Create notification | ⬜ |
| PATCH | `/api/v1/notifications/:id/read` | Mark as read | ⬜ |
| PATCH | `/api/v1/notifications/read-all` | Mark all as read | ⬜ |
| DELETE | `/api/v1/notifications/:id` | Delete notification | ⬜ |
| GET | `/api/v1/notifications/unread-count` | Unread count | ⬜ |
| GET | `/api/v1/notification-preferences` | Get preferences | ⬜ |
| PUT | `/api/v1/notification-preferences` | Update preferences | ⬜ |
| POST | `/webhooks/sendgrid` | SendGrid webhook | ⬜ |
| POST | `/webhooks/twilio` | Twilio webhook | ⬜ |
| GET | `/api/v1/communication/channels` | List channels | ⬜ |
| POST | `/api/v1/communication/channels/:id/test` | Test channel | ⬜ |
| GET | `/api/v1/communication/logs` | Communication logs | ⬜ |
| GET | `/api/v1/communication/analytics` | Communication stats | ⬜ |

### Integration Test Requirements

```typescript
// tests/communication.e2e-spec.ts

describe('Communication Service', () => {
  describe('Email Templates', () => {
    it('should list templates');
    it('should create template with variables');
    it('should update template');
    it('should preview template with data');
    it('should validate template syntax');
  });

  describe('Email Sending', () => {
    it('should send plain email');
    it('should send templated email');
    it('should send bulk emails');
    it('should track email status');
    it('should handle SendGrid webhooks');
    it('should retry failed sends');
  });

  describe('SMS', () => {
    it('should send SMS');
    it('should send templated SMS');
    it('should track SMS status');
    it('should handle Twilio webhooks');
  });

  describe('Notifications', () => {
    it('should create notification');
    it('should list user notifications');
    it('should mark as read');
    it('should mark all as read');
    it('should delete notification');
    it('should return unread count');
  });

  describe('Preferences', () => {
    it('should get user preferences');
    it('should update preferences');
    it('should respect opt-out preferences');
  });

  describe('Tenant Isolation', () => {
    it('should isolate templates by tenant');
    it('should isolate notifications by tenant');
  });
});
```

### Events to Verify

| Event | Trigger | Verified |
|-------|---------|----------|
| `email.sent` | Email sent | ⬜ |
| `email.delivered` | Email delivered | ⬜ |
| `email.opened` | Email opened | ⬜ |
| `email.clicked` | Link clicked | ⬜ |
| `email.bounced` | Email bounced | ⬜ |
| `sms.sent` | SMS sent | ⬜ |
| `sms.delivered` | SMS delivered | ⬜ |
| `notification.created` | Notification created | ⬜ |
| `notification.read` | Notification read | ⬜ |

---

## 🔧 Verification Commands

### Run All Verification Tests

```bash
cd apps/api

# Run all e2e tests
pnpm test:e2e

# Run specific service tests
pnpm test:e2e -- --grep "Auth"
pnpm test:e2e -- --grep "CRM"
pnpm test:e2e -- --grep "Sales"
pnpm test:e2e -- --grep "Accounting"
pnpm test:e2e -- --grep "Load Board"
pnpm test:e2e -- --grep "Commission"
pnpm test:e2e -- --grep "Documents"
pnpm test:e2e -- --grep "Communication"

# Check test coverage
pnpm test:cov
```

### Verify Event Publishing

```bash
# Check event emitter is working
# Create a test file to verify events

# apps/api/test/event-verification.ts
import { EventEmitter2 } from '@nestjs/event-emitter';

// Listen for all events and log them
eventEmitter.onAny((event, payload) => {
  console.log(`Event: ${event}`, payload);
});
```

### Check Tenant Isolation

```bash
# Create test with multiple tenants
# Verify queries include tenantId
# Verify no cross-tenant data leakage
```

---

## ✅ Completion Checklist

Before proceeding to Prompt 01:

- [ ] All 8 services have passing integration tests
- [ ] All events are publishing correctly
- [ ] Tenant isolation verified on all endpoints
- [ ] No failing tests in the test suite
- [ ] Test coverage > 80% for existing modules
- [ ] API documentation is accurate (Swagger)

---

## 📝 Progress Tracker Update

After completing verification, update `progress-tracker.html`:

### Changelog Entry

```html
<div class="log-entry">
    <div class="log-date">January XX, 2026 - Existing Services Verified</div>
    <ul class="log-items">
        <li>Auth & Admin: All 30 endpoints verified with integration tests</li>
        <li>CRM: All 35 endpoints verified with integration tests</li>
        <li>Sales: All 38 endpoints verified with integration tests</li>
        <li>Accounting: All 40 endpoints verified with integration tests</li>
        <li>Load Board: All 27 endpoints verified with integration tests</li>
        <li>Commission: All 25 endpoints verified with integration tests</li>
        <li>Documents: All 35 endpoints verified with integration tests</li>
        <li>Communication: All 30 endpoints verified with integration tests</li>
        <li>Event publishing verified across all services</li>
        <li>Tenant isolation verified across all services</li>
    </ul>
</div>
```

---

## 🔜 Next Step

After all verifications pass, proceed to:

➡️ **[01-tms-core-api.md](./01-tms-core-api.md)** - Implement TMS Core Service API
