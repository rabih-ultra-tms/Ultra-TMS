# 03 - Credit Service API Implementation

> **Service:** Credit Management  
> **Priority:** P1 - High  
> **Endpoints:** 30  
> **Dependencies:** CRM ✅, Accounting ✅  
> **Doc Reference:** [42-service-credit.md](../../02-services/42-service-credit.md)

---

## 📋 Overview

The Credit Service manages customer credit applications, credit limits, credit holds, collections, and payment plans. It provides credit risk assessment and monitoring for customer accounts.

### Key Capabilities
- Credit application processing
- Credit limit management with tier system
- Automatic credit holds based on rules
- Collections workflow management
- Payment plan creation and tracking
- Credit utilization monitoring

---

## ✅ Pre-Implementation Checklist

- [ ] CRM service is working (Customer lookup)
- [ ] Accounting service is working (Invoice/Payment data)
- [ ] Database models exist in `schema.prisma`

---

## 🗄️ Database Models Reference

### CreditApplication Model
```prisma
model CreditApplication {
  id                String            @id @default(cuid())
  tenantId          String
  customerId        String
  
  applicationNumber String            // AUTO: CRA-YYYYMMDD-XXXX
  status            CreditAppStatus   @default(PENDING)
  
  requestedAmount   Decimal           @db.Decimal(12, 2)
  approvedAmount    Decimal?          @db.Decimal(12, 2)
  requestedTerms    PaymentTerms?
  approvedTerms     PaymentTerms?
  
  // Business Info
  yearsInBusiness   Int?
  annualRevenue     Decimal?          @db.Decimal(14, 2)
  numberOfEmployees Int?
  dunsBradstreet    String?
  
  // Bank References
  bankName          String?
  bankContactName   String?
  bankContactPhone  String?
  bankAccountType   String?
  
  // Trade References
  tradeReferences   Json?             // Array of { company, contact, phone, email }
  
  // Decision
  decisionDate      DateTime?
  decisionBy        String?
  decisionNotes     String?           @db.Text
  rejectionReason   String?
  
  // Risk Assessment
  riskScore         Decimal?          @db.Decimal(5, 2)
  riskFactors       Json?
  
  // Audit
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  submittedAt       DateTime?
  createdById       String
  updatedById       String
  
  // Relations
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  customer          Company           @relation(fields: [customerId], references: [id])
  
  @@unique([tenantId, applicationNumber])
  @@index([tenantId, status])
  @@index([tenantId, customerId])
}

enum CreditAppStatus {
  DRAFT
  PENDING
  UNDER_REVIEW
  APPROVED
  REJECTED
  EXPIRED
}
```

### CreditLimit Model
```prisma
model CreditLimit {
  id                String            @id @default(cuid())
  tenantId          String
  customerId        String            @unique
  
  creditTier        CreditTier        @default(STANDARD)
  approvedLimit     Decimal           @db.Decimal(12, 2)
  currentBalance    Decimal           @default(0) @db.Decimal(12, 2)
  availableCredit   Decimal           @db.Decimal(12, 2)
  
  paymentTerms      PaymentTerms      @default(NET_30)
  
  // Thresholds
  warningThreshold  Decimal           @default(80) @db.Decimal(5, 2)  // % utilization
  holdThreshold     Decimal           @default(100) @db.Decimal(5, 2)
  
  // Review
  lastReviewDate    DateTime?
  nextReviewDate    DateTime?
  reviewNotes       String?           @db.Text
  
  // Status
  isOnHold          Boolean           @default(false)
  holdReason        String?
  holdDate          DateTime?
  holdBy            String?
  
  // Audit
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  createdById       String
  updatedById       String
  
  // Relations
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  customer          Company           @relation(fields: [customerId], references: [id])
  holds             CreditHold[]
  
  @@index([tenantId, creditTier])
  @@index([tenantId, isOnHold])
}

enum CreditTier {
  PLATINUM    // $500K+ limit, Net 45
  GOLD        // $250K-$500K, Net 30
  SILVER      // $100K-$250K, Net 30
  BRONZE      // $50K-$100K, Net 21
  STANDARD    // Up to $50K, Net 15
  COD         // Cash on Delivery
}
```

### CreditHold Model
```prisma
model CreditHold {
  id                String            @id @default(cuid())
  tenantId          String
  customerId        String
  creditLimitId     String
  
  holdType          CreditHoldType
  reason            String
  notes             String?           @db.Text
  
  isAutoHold        Boolean           @default(false)
  triggerEvent      String?           // e.g., "INVOICE_60_DAYS_PAST_DUE"
  
  placedAt          DateTime          @default(now())
  placedById        String
  
  releasedAt        DateTime?
  releasedById      String?
  releaseNotes      String?
  
  // Conditions for auto-release
  autoReleaseCondition String?
  autoReleaseAmount Decimal?          @db.Decimal(12, 2)
  
  // Relations
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  customer          Company           @relation(fields: [customerId], references: [id])
  creditLimit       CreditLimit       @relation(fields: [creditLimitId], references: [id])
  
  @@index([tenantId, customerId])
  @@index([tenantId, releasedAt])
}

enum CreditHoldType {
  OVER_LIMIT
  PAST_DUE
  NSF_PAYMENT
  DISPUTED
  MANUAL
  BANKRUPTCY
  COLLECTION
}
```

### CollectionActivity Model
```prisma
model CollectionActivity {
  id                String            @id @default(cuid())
  tenantId          String
  customerId        String
  invoiceId         String?
  
  activityType      CollectionActivityType
  activityDate      DateTime          @default(now())
  
  contactMethod     String?           // PHONE, EMAIL, LETTER, VISIT
  contactedPerson   String?
  
  notes             String            @db.Text
  outcome           String?
  
  promisedAmount    Decimal?          @db.Decimal(12, 2)
  promisedDate      DateTime?
  
  nextActionType    String?
  nextActionDate    DateTime?
  
  // Audit
  createdAt         DateTime          @default(now())
  createdById       String
  
  // Relations
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  customer          Company           @relation(fields: [customerId], references: [id])
  invoice           Invoice?          @relation(fields: [invoiceId], references: [id])
  
  @@index([tenantId, customerId])
  @@index([tenantId, nextActionDate])
}

enum CollectionActivityType {
  INITIAL_CONTACT
  FOLLOW_UP
  PAYMENT_REMINDER
  DEMAND_LETTER
  PROMISE_TO_PAY
  BROKEN_PROMISE
  PAYMENT_RECEIVED
  DISPUTE_FILED
  DISPUTE_RESOLVED
  SENT_TO_AGENCY
  WRITE_OFF
  NOTE
}
```

### PaymentPlan Model
```prisma
model PaymentPlan {
  id                String            @id @default(cuid())
  tenantId          String
  customerId        String
  
  planNumber        String            // AUTO: PP-YYYYMMDD-XXXX
  status            PaymentPlanStatus @default(ACTIVE)
  
  totalAmount       Decimal           @db.Decimal(12, 2)
  downPayment       Decimal           @default(0) @db.Decimal(12, 2)
  remainingBalance  Decimal           @db.Decimal(12, 2)
  
  installmentAmount Decimal           @db.Decimal(12, 2)
  frequency         PaymentFrequency  @default(MONTHLY)
  totalInstallments Int
  completedInstallments Int           @default(0)
  
  startDate         DateTime
  nextDueDate       DateTime?
  endDate           DateTime?
  
  // Interest/Fees
  interestRate      Decimal?          @db.Decimal(5, 2)
  lateFee           Decimal?          @db.Decimal(10, 2)
  
  // Invoices included
  invoiceIds        String[]
  
  notes             String?           @db.Text
  
  // Audit
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  createdById       String
  approvedById      String?
  
  // Relations
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  customer          Company           @relation(fields: [customerId], references: [id])
  installments      PaymentPlanInstallment[]
  
  @@unique([tenantId, planNumber])
  @@index([tenantId, customerId])
  @@index([tenantId, status])
}

enum PaymentPlanStatus {
  PENDING
  ACTIVE
  COMPLETED
  DEFAULTED
  CANCELLED
}

enum PaymentFrequency {
  WEEKLY
  BI_WEEKLY
  MONTHLY
  QUARTERLY
}

model PaymentPlanInstallment {
  id                String            @id @default(cuid())
  paymentPlanId     String
  
  installmentNumber Int
  dueDate           DateTime
  amount            Decimal           @db.Decimal(12, 2)
  
  paidAmount        Decimal?          @db.Decimal(12, 2)
  paidDate          DateTime?
  paymentId         String?
  
  status            InstallmentStatus @default(PENDING)
  
  // Relations
  paymentPlan       PaymentPlan       @relation(fields: [paymentPlanId], references: [id])
  
  @@index([paymentPlanId, installmentNumber])
}

enum InstallmentStatus {
  PENDING
  PAID
  PARTIAL
  LATE
  MISSED
  WAIVED
}
```

---

## 🛠️ API Endpoints

### Credit Applications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/credit/applications` | List applications |
| GET | `/api/v1/credit/applications/:id` | Get application |
| POST | `/api/v1/credit/applications` | Create application |
| PUT | `/api/v1/credit/applications/:id` | Update application |
| DELETE | `/api/v1/credit/applications/:id` | Delete draft application |
| POST | `/api/v1/credit/applications/:id/submit` | Submit for review |
| POST | `/api/v1/credit/applications/:id/approve` | Approve application |
| POST | `/api/v1/credit/applications/:id/reject` | Reject application |

### Credit Limits

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/credit/limits` | List credit limits |
| GET | `/api/v1/credit/limits/:customerId` | Get customer limit |
| POST | `/api/v1/credit/limits` | Create/set credit limit |
| PUT | `/api/v1/credit/limits/:customerId` | Update credit limit |
| PATCH | `/api/v1/credit/limits/:customerId/increase` | Request limit increase |
| GET | `/api/v1/credit/limits/:customerId/utilization` | Get utilization |

### Credit Holds

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/credit/holds` | List credit holds |
| GET | `/api/v1/credit/holds/:id` | Get hold details |
| POST | `/api/v1/credit/holds` | Place credit hold |
| PATCH | `/api/v1/credit/holds/:id/release` | Release hold |
| GET | `/api/v1/credit/holds/customer/:customerId` | Customer holds |

### Collections

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/credit/collections` | Collections queue |
| GET | `/api/v1/credit/collections/customer/:customerId` | Customer history |
| POST | `/api/v1/credit/collections` | Log collection activity |
| PUT | `/api/v1/credit/collections/:id` | Update activity |
| GET | `/api/v1/credit/collections/aging` | Aging report |
| GET | `/api/v1/credit/collections/follow-ups` | Due follow-ups |

### Payment Plans

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/credit/payment-plans` | List payment plans |
| GET | `/api/v1/credit/payment-plans/:id` | Get plan details |
| POST | `/api/v1/credit/payment-plans` | Create payment plan |
| PUT | `/api/v1/credit/payment-plans/:id` | Update plan |
| POST | `/api/v1/credit/payment-plans/:id/record-payment` | Record installment |
| PATCH | `/api/v1/credit/payment-plans/:id/cancel` | Cancel plan |

### Dashboard & Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/credit/dashboard` | Credit dashboard |
| GET | `/api/v1/credit/customers/:id/summary` | Customer credit summary |
| GET | `/api/v1/credit/reports/aging` | AR aging report |
| GET | `/api/v1/credit/reports/risk` | Risk assessment report |

---

## 📝 DTO Specifications

### CreateCreditApplicationDto
```typescript
export class CreateCreditApplicationDto {
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsNumber()
  @Min(1000)
  requestedAmount: number;

  @IsOptional()
  @IsEnum(PaymentTerms)
  requestedTerms?: PaymentTerms;

  @IsOptional()
  @IsInt()
  yearsInBusiness?: number;

  @IsOptional()
  @IsNumber()
  annualRevenue?: number;

  @IsOptional()
  @IsInt()
  numberOfEmployees?: number;

  @IsOptional()
  @IsString()
  dunsBradstreet?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  bankContactName?: string;

  @IsOptional()
  @IsString()
  bankContactPhone?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TradeReferenceDto)
  tradeReferences?: TradeReferenceDto[];
}

export class TradeReferenceDto {
  @IsString()
  company: string;

  @IsString()
  contact: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
```

### ApproveCreditApplicationDto
```typescript
export class ApproveCreditApplicationDto {
  @IsNumber()
  @Min(0)
  approvedAmount: number;

  @IsEnum(PaymentTerms)
  approvedTerms: PaymentTerms;

  @IsOptional()
  @IsString()
  decisionNotes?: string;
}
```

### CreateCreditHoldDto
```typescript
export class CreateCreditHoldDto {
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsEnum(CreditHoldType)
  holdType: CreditHoldType;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
```

### CreatePaymentPlanDto
```typescript
export class CreatePaymentPlanDto {
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsArray()
  @IsString({ each: true })
  invoiceIds: string[];

  @IsNumber()
  @Min(0)
  downPayment: number;

  @IsNumber()
  @Min(1)
  totalInstallments: number;

  @IsEnum(PaymentFrequency)
  frequency: PaymentFrequency;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  interestRate?: number;

  @IsOptional()
  @IsNumber()
  lateFee?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
```

---

## 📋 Business Rules

### Credit Tier Criteria
```typescript
const creditTierLimits = {
  PLATINUM: { min: 500000, terms: 'NET_45' },
  GOLD: { min: 250000, max: 500000, terms: 'NET_30' },
  SILVER: { min: 100000, max: 250000, terms: 'NET_30' },
  BRONZE: { min: 50000, max: 100000, terms: 'NET_21' },
  STANDARD: { min: 0, max: 50000, terms: 'NET_15' },
  COD: { min: 0, max: 0, terms: 'COD' }
};
```

### Auto-Hold Triggers
```typescript
const autoHoldTriggers = [
  { event: 'BALANCE_OVER_LIMIT', threshold: 110 },  // 110% of limit
  { event: 'INVOICE_60_DAYS_PAST_DUE', days: 60 },
  { event: 'NSF_PAYMENT', count: 1 },
  { event: 'BANKRUPTCY_FILED', immediate: true }
];
```

### Credit Utilization Calculation
```typescript
utilization = (currentBalance / approvedLimit) * 100
availableCredit = approvedLimit - currentBalance
```

### Payment Plan Requirements
- Down payment: Minimum 20% of total
- Maximum term: 12 months
- Frequency: Weekly, Bi-weekly, Monthly, or Quarterly

---

## 📡 Events to Publish

| Event | Trigger | Payload |
|-------|---------|---------|
| `credit.application.submitted` | Submit application | `{ applicationId, customerId }` |
| `credit.application.approved` | Approve application | `{ applicationId, customerId, approvedAmount }` |
| `credit.application.rejected` | Reject application | `{ applicationId, customerId, reason }` |
| `credit.limit.created` | Create limit | `{ creditLimitId, customerId, limit }` |
| `credit.limit.changed` | Update limit | `{ creditLimitId, oldLimit, newLimit }` |
| `credit.hold.placed` | Place hold | `{ holdId, customerId, reason }` |
| `credit.hold.released` | Release hold | `{ holdId, customerId }` |
| `credit.warning.threshold` | 80% utilization | `{ customerId, utilization }` |
| `credit.over.limit` | Over limit | `{ customerId, balance, limit }` |
| `collection.activity.logged` | Log activity | `{ activityId, customerId }` |
| `payment.plan.created` | Create plan | `{ planId, customerId }` |
| `payment.plan.defaulted` | Missed payments | `{ planId, customerId }` |

---

## 🧪 Integration Test Requirements

```typescript
describe('Credit Service API', () => {
  describe('Credit Applications', () => {
    it('should create credit application');
    it('should submit application for review');
    it('should approve application with limit');
    it('should reject application with reason');
    it('should create credit limit on approval');
  });

  describe('Credit Limits', () => {
    it('should get customer credit limit');
    it('should update credit limit');
    it('should calculate utilization');
    it('should trigger warning at threshold');
    it('should auto-hold at over-limit');
  });

  describe('Credit Holds', () => {
    it('should place manual hold');
    it('should auto-hold on past due');
    it('should release hold');
    it('should block orders when on hold');
  });

  describe('Collections', () => {
    it('should log collection activity');
    it('should track promise to pay');
    it('should generate aging report');
    it('should list follow-up actions');
  });

  describe('Payment Plans', () => {
    it('should create payment plan');
    it('should calculate installments');
    it('should record payments');
    it('should mark defaulted on missed payments');
  });
});
```

---

## 📁 Module Structure

```
apps/api/src/modules/credit/
├── credit.module.ts
├── applications/
│   ├── credit-applications.controller.ts
│   ├── credit-applications.service.ts
│   └── dto/
├── limits/
│   ├── credit-limits.controller.ts
│   ├── credit-limits.service.ts
│   └── dto/
├── holds/
│   ├── credit-holds.controller.ts
│   ├── credit-holds.service.ts
│   └── dto/
├── collections/
│   ├── collections.controller.ts
│   ├── collections.service.ts
│   └── dto/
├── payment-plans/
│   ├── payment-plans.controller.ts
│   ├── payment-plans.service.ts
│   └── dto/
└── events/
```

---

## ✅ Completion Checklist

- [ ] All 30 endpoints implemented
- [ ] Credit application workflow complete
- [ ] Auto-hold rules implemented
- [ ] Collection tracking working
- [ ] Payment plan calculations correct
- [ ] All integration tests passing
- [ ] Tenant isolation verified

---

## 📊 Progress Tracker Update

### Update Service Row
```html
<tr>
    <td>16</td>
    <td>Credit</td>
    <td><span class="status"><span class="status-dot complete"></span> Complete</span></td>
    <td>30/30</td>
    <td>5/5</td>
    <td>100%</td>
    <td>Applications, Limits, Holds, Collections, Plans</td>
</tr>
```

### Add Changelog Entry
```html
<div class="log-entry">
    <div class="log-date">January XX, 2026 - Credit API Complete</div>
    <ul class="log-items">
        <li>Implemented 30 Credit API endpoints</li>
        <li>Credit application workflow with approval process</li>
        <li>Credit limit management with tier system</li>
        <li>Auto-hold triggers for risk management</li>
        <li>Collections activity tracking</li>
        <li>Payment plan creation and tracking</li>
        <li>Full integration test coverage</li>
    </ul>
</div>
```

---

## 🔜 Next Step

➡️ **[04-claims-api.md](./04-claims-api.md)** - Implement Claims Service API
