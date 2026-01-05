# 87 - Business Rules Reference

**All validation rules, state machines, and business logic**

---

## Purpose

This document contains ALL business rules that must be enforced by the platform. Claude Code should reference this when:

- Building validation logic
- Implementing state transitions
- Calculating values (commissions, margins, etc.)
- Determining what actions are allowed

---

## 1. Carrier Rules

### 1.1 Carrier Status Rules

| Current Status | Allowed Transitions | Trigger                                 |
| -------------- | ------------------- | --------------------------------------- |
| PENDING        | â†’ ACTIVE          | Admin approval + all docs valid         |
| PENDING        | â†’ INACTIVE        | Admin rejection                         |
| ACTIVE         | â†’ INACTIVE        | Admin action or compliance failure      |
| ACTIVE         | â†’ BLACKLISTED     | Fraud/severe issue                      |
| INACTIVE       | â†’ ACTIVE          | Reactivation + docs valid               |
| INACTIVE       | â†’ BLACKLISTED     | Fraud discovered                        |
| BLACKLISTED    | (none)              | Permanent - requires new carrier record |

### 1.2 Carrier Compliance Rules

```typescript
// Carrier can be dispatched if:
function canDispatchToCarrier(carrier: Carrier): boolean {
  return (
    carrier.status === 'ACTIVE' &&
    carrier.complianceStatus === 'COMPLIANT' &&
    carrier.insuranceExpiry > today() &&
    carrier.insuranceAmount >= 750000 &&
    !carrier.blacklistedAt
  );
}

// Compliance status calculation:
function calculateComplianceStatus(carrier: Carrier): ComplianceStatus {
  if (!carrier.insuranceExpiry || carrier.insuranceExpiry < today()) {
    return 'EXPIRED';
  }
  if (carrier.insuranceExpiry < addDays(today(), 30)) {
    return 'WARNING'; // Expiring within 30 days
  }
  if (carrier.insuranceAmount < 750000) {
    return 'EXPIRED'; // Below minimum coverage
  }
  return 'COMPLIANT';
}
```

### 1.3 Carrier Validation Rules

| Field           | Rule                         | Error Message                                   |
| --------------- | ---------------------------- | ----------------------------------------------- |
| mcNumber        | Exactly 6 digits             | "MC Number must be 6 digits"                    |
| dotNumber       | 5-8 digits                   | "DOT Number must be 5-8 digits"                 |
| mcNumber        | Unique per tenant            | "Carrier with this MC# already exists"          |
| insuranceExpiry | Must be future date          | "Insurance must not be expired"                 |
| insuranceAmount | Minimum $750,000             | "Liability insurance must be at least $750,000" |
| cargoInsurance  | Minimum $100,000 if provided | "Cargo insurance must be at least $100,000"     |
| email           | Valid email format           | "Invalid email address"                         |
| phone           | Valid E.164 format           | "Invalid phone number"                          |

### 1.4 Carrier Rating Calculation

```typescript
function calculateCarrierRating(carrier: Carrier): number {
  const loads = getCarrierLoads(carrier.id, { delivered: true });
  if (loads.length < 5) return null; // Not enough data

  const metrics = {
    onTimeDelivery: calculateOnTimePercentage(loads), // 0-100
    claims: getClaimsCount(carrier.id), // Count
    serviceIssues: getServiceIssuesCount(carrier.id), // Count
    communicationScore: getCommScoreAvg(carrier.id), // 1-5
  };

  // Weighted score
  const score =
    ((metrics.onTimeDelivery / 100) * 0.4 +
      (1 - metrics.claims / loads.length) * 0.3 +
      (1 - metrics.serviceIssues / loads.length) * 0.1 +
      (metrics.communicationScore / 5) * 0.2) *
    5;

  return Math.round(score * 10) / 10; // Round to 1 decimal
}
```

---

## 2. Customer Rules

### 2.1 Credit Status Rules

| Current Status | Allowed Transitions | Trigger                |
| -------------- | ------------------- | ---------------------- |
| PENDING        | â†’ APPROVED        | Credit check passed    |
| PENDING        | â†’ DENIED          | Credit check failed    |
| PENDING        | â†’ COD             | Customer requests COD  |
| APPROVED       | â†’ HOLD            | Past due or over limit |
| APPROVED       | â†’ COD             | Customer requests      |
| HOLD           | â†’ APPROVED        | Balance cleared        |
| HOLD           | â†’ DENIED          | Extended non-payment   |
| COD            | â†’ APPROVED        | Credit review passed   |
| DENIED         | â†’ PENDING         | Re-apply for credit    |

### 2.2 Credit Rules

```typescript
// Can customer create a new load?
function canCreateLoad(customer: Customer, loadAmount: number): boolean {
  if (customer.status !== 'ACTIVE') {
    return false; // Inactive customer
  }

  switch (customer.creditStatus) {
    case 'APPROVED':
      const availableCredit = customer.creditLimit - customer.currentBalance;
      return loadAmount <= availableCredit;

    case 'COD':
    case 'PREPAID':
      return true; // Always allowed, payment handled separately

    case 'PENDING':
    case 'HOLD':
    case 'DENIED':
      return false;
  }
}

// Auto credit hold rules:
function shouldPlaceOnCreditHold(customer: Customer): boolean {
  // Rule 1: Over credit limit
  if (customer.currentBalance > customer.creditLimit) {
    return true;
  }

  // Rule 2: Invoice past due 60+ days
  const pastDue60 = getInvoices(customer.id, {
    status: 'PAST_DUE',
    daysOverdue: { gte: 60 },
  });
  if (pastDue60.length > 0) {
    return true;
  }

  // Rule 3: 3+ invoices past due 30+ days
  const pastDue30 = getInvoices(customer.id, {
    status: 'PAST_DUE',
    daysOverdue: { gte: 30 },
  });
  if (pastDue30.length >= 3) {
    return true;
  }

  return false;
}
```

### 2.3 Customer Validation Rules

| Field        | Rule                        | Error Message                                          |
| ------------ | --------------------------- | ------------------------------------------------------ |
| code         | 2-20 uppercase alphanumeric | "Customer code must be 2-20 uppercase letters/numbers" |
| code         | Unique per tenant           | "Customer code already exists"                         |
| email        | Valid email format          | "Invalid email address"                                |
| creditLimit  | Min 0                       | "Credit limit cannot be negative"                      |
| paymentTerms | 0-90 days                   | "Payment terms must be 0-90 days"                      |

---

## 3. Load Rules

### 3.1 Load Status State Machine

```typescript
const LOAD_STATUS_TRANSITIONS = {
  PENDING: ['COVERED', 'CANCELLED'],
  COVERED: ['DISPATCHED', 'PENDING', 'CANCELLED'], // Back to PENDING if carrier removed
  DISPATCHED: ['EN_ROUTE_PICKUP', 'COVERED', 'CANCELLED'],
  EN_ROUTE_PICKUP: ['AT_PICKUP', 'CANCELLED'],
  AT_PICKUP: ['LOADED', 'CANCELLED'],
  LOADED: ['EN_ROUTE_DELIVERY'],
  EN_ROUTE_DELIVERY: ['AT_DELIVERY'],
  AT_DELIVERY: ['DELIVERED'],
  DELIVERED: ['COMPLETED'],
  COMPLETED: [], // Terminal state
  CANCELLED: [], // Terminal state
};

function canTransitionTo(
  currentStatus: LoadStatus,
  newStatus: LoadStatus
): boolean {
  return LOAD_STATUS_TRANSITIONS[currentStatus]?.includes(newStatus) ?? false;
}
```

### 3.2 Load Dispatch Rules

```typescript
// Can this load be dispatched?
function canDispatchLoad(load: Load): { allowed: boolean; errors: string[] } {
  const errors: string[] = [];

  // Rule 1: Load must be in correct status
  if (load.status !== 'COVERED') {
    errors.push('Load must be in COVERED status to dispatch');
  }

  // Rule 2: Must have carrier assigned
  if (!load.carrierId) {
    errors.push('Carrier must be assigned');
  }

  // Rule 3: Carrier must be active and compliant
  if (load.carrier) {
    if (load.carrier.status !== 'ACTIVE') {
      errors.push('Carrier is not active');
    }
    if (load.carrier.complianceStatus === 'EXPIRED') {
      errors.push('Carrier compliance has expired');
    }
    if (load.carrier.insuranceExpiry < load.deliveryDate) {
      errors.push('Carrier insurance expires before delivery date');
    }
  }

  // Rule 4: Must have carrier rate
  if (!load.carrierRate || load.carrierRate <= 0) {
    errors.push('Carrier rate must be set');
  }

  // Rule 5: Customer must not be on credit hold (unless COD)
  if (load.customer && load.customer.creditStatus === 'HOLD') {
    errors.push('Customer is on credit hold');
  }

  // Rule 6: Pickup date must not be in the past
  if (load.pickupDate < startOfDay(new Date())) {
    errors.push('Pickup date is in the past');
  }

  return {
    allowed: errors.length === 0,
    errors,
  };
}
```

### 3.3 Load Validation Rules

| Field           | Rule                                  | Error Message                                   |
| --------------- | ------------------------------------- | ----------------------------------------------- |
| deliveryDate    | Must be >= pickupDate                 | "Delivery date must be on or after pickup date" |
| customerRate    | Must be > 0                           | "Customer rate must be greater than 0"          |
| carrierRate     | Must be < customerRate (usually)      | Warning: "Carrier rate exceeds customer rate"   |
| weight          | 1-80,000 lbs                          | "Weight must be between 1 and 80,000 lbs"       |
| pickupDate      | Cannot be more than 90 days in future | "Pickup date too far in future"                 |
| equipmentType   | Must be valid enum                    | "Invalid equipment type"                        |
| temperature.min | Must be < temperature.max             | "Min temp must be less than max temp"           |

### 3.4 Load Number Generation

```typescript
// Format: {PREFIX}-{YEAR}-{SEQUENCE}
// Example: FM-2025-0001

function generateLoadNumber(tenantId: string): string {
  const tenant = getTenant(tenantId);
  const prefix = tenant.settings?.loadPrefix || 'LD';
  const year = new Date().getFullYear();

  const lastLoad = getLastLoad(tenantId, year);
  const sequence = lastLoad
    ? parseInt(lastLoad.loadNumber.split('-')[2]) + 1
    : 1;

  return `${prefix}-${year}-${String(sequence).padStart(4, '0')}`;
}
```

### 3.5 Margin Calculation

```typescript
function calculateLoadMargin(load: Load): {
  margin: number;
  marginPercent: number;
} {
  if (!load.customerRate || !load.carrierRate) {
    return { margin: 0, marginPercent: 0 };
  }

  const totalRevenue =
    load.customerRate +
    (load.fuelSurcharge || 0) +
    sumAccessorials(load.accessorials, 'customer');

  const totalCost =
    load.carrierRate + sumAccessorials(load.accessorials, 'carrier');

  const margin = totalRevenue - totalCost;
  const marginPercent = (margin / totalRevenue) * 100;

  return {
    margin: round(margin, 2),
    marginPercent: round(marginPercent, 1),
  };
}
```

### 3.6 Load Cancellation Rules

```typescript
function canCancelLoad(load: Load): {
  allowed: boolean;
  fee: number;
  reason: string;
} {
  // Cannot cancel terminal states
  if (['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(load.status)) {
    return {
      allowed: false,
      fee: 0,
      reason: 'Load is already completed or cancelled',
    };
  }

  // Free cancellation if not yet dispatched
  if (['PENDING', 'COVERED'].includes(load.status)) {
    return { allowed: true, fee: 0, reason: '' };
  }

  // After dispatch - TONU may apply
  const hoursSinceDispatch = differenceInHours(new Date(), load.dispatchedAt);

  // Carrier TONU policy
  if (hoursSinceDispatch > 2 || load.status !== 'DISPATCHED') {
    const tonuFee = Math.min(load.carrierRate * 0.25, 500); // 25% up to $500
    return {
      allowed: true,
      fee: tonuFee,
      reason: `TONU fee of $${tonuFee} applies`,
    };
  }

  return { allowed: true, fee: 0, reason: '' };
}
```

---

## 4. Invoice Rules

### 4.1 Invoice Generation Rules

```typescript
// When can we invoice a load?
function canInvoiceLoad(load: Load): boolean {
  // Rule 1: Load must be delivered
  if (!['DELIVERED', 'COMPLETED'].includes(load.status)) {
    return false;
  }

  // Rule 2: Not already invoiced
  if (load.invoiceId) {
    return false;
  }

  // Rule 3: Check tenant settings
  const settings = getTenantSettings(load.tenantId);

  if (settings.requirePOD && !load.podReceived) {
    return false; // POD required before invoicing
  }

  return true;
}

// Invoice due date calculation
function calculateInvoiceDueDate(invoice: Invoice, customer: Customer): Date {
  const baseDate = invoice.createdAt;
  const terms = customer.paymentTerms || 30;

  return addDays(baseDate, terms);
}
```

### 4.2 Invoice Status Rules

| Status   | Meaning          | Next Actions               |
| -------- | ---------------- | -------------------------- |
| DRAFT    | Not yet sent     | Edit, Send, Delete         |
| SENT     | Sent to customer | Record Payment, Void       |
| PARTIAL  | Partially paid   | Record Payment             |
| PAID     | Fully paid       | None                       |
| OVERDUE  | Past due date    | Send Reminder, Credit Hold |
| VOID     | Cancelled        | None                       |
| DISPUTED | Customer dispute | Resolve, Adjust            |

### 4.3 Payment Terms

| Code    | Days | Description                     |
| ------- | ---- | ------------------------------- |
| NET15   | 15   | Due in 15 days                  |
| NET21   | 21   | Due in 21 days                  |
| NET30   | 30   | Due in 30 days (default)        |
| NET45   | 45   | Due in 45 days                  |
| COD     | 0    | Cash on delivery                |
| PREPAID | -1   | Payment required before service |

---

## 5. Commission Rules

### 5.1 Sales Commission Calculation

```typescript
// Calculate commission for a load
function calculateCommission(load: Load, salesRep: User): number {
  // Get commission plan
  const plan = getCommissionPlan(salesRep.id);

  if (!plan) {
    // Default: percentage of margin
    return load.margin * (salesRep.commissionRate || 0.1);
  }

  // Tiered commission based on margin percentage
  let rate = 0;

  if (load.marginPercent >= 25) {
    rate = plan.tier3Rate; // e.g., 15%
  } else if (load.marginPercent >= 18) {
    rate = plan.tier2Rate; // e.g., 12%
  } else if (load.marginPercent >= 12) {
    rate = plan.tier1Rate; // e.g., 10%
  } else {
    rate = plan.baseRate; // e.g., 8%
  }

  return load.margin * rate;
}

// Commission is earned when:
// 1. Load is DELIVERED (not just completed)
// 2. Invoice has been created
// Commission is payable when:
// 1. Customer payment received
// 2. (Optional) Carrier has been paid
```

### 5.2 Commission Plan Types

| Plan Type       | Basis                 | Example               |
| --------------- | --------------------- | --------------------- |
| MARGIN_PERCENT  | % of gross margin     | 10% of margin         |
| REVENUE_PERCENT | % of customer rate    | 3% of rate            |
| FLAT_PER_LOAD   | Fixed amount per load | $50 per load          |
| TIERED_MARGIN   | Varies by margin %    | 8-15% based on margin |

---

## 6. Accounting Rules

### 6.1 Carrier Payment Rules

```typescript
// When can we pay a carrier?
function canPayCarrier(load: Load): { allowed: boolean; reason: string } {
  // Must be delivered
  if (!['DELIVERED', 'COMPLETED'].includes(load.status)) {
    return { allowed: false, reason: 'Load not yet delivered' };
  }

  // Must have POD if required
  const settings = getTenantSettings(load.tenantId);
  if (settings.requirePODBeforePayment && !load.podReceived) {
    return { allowed: false, reason: 'POD required before payment' };
  }

  // Check carrier payment terms
  const carrier = getCarrier(load.carrierId);
  const daysSinceDelivery = differenceInDays(new Date(), load.deliveredAt);

  if (daysSinceDelivery < carrier.paymentTerms) {
    return {
      allowed: false,
      reason: `Payment not due until ${addDays(load.deliveredAt, carrier.paymentTerms).toLocaleDateString()}`,
    };
  }

  return { allowed: true, reason: '' };
}
```

### 6.2 Quick Pay Rules

```typescript
// Quick pay (early payment) calculation
function calculateQuickPay(load: Load, carrier: Carrier): number {
  const standardPayDate = addDays(load.deliveredAt, carrier.paymentTerms);
  const quickPayDate = addDays(load.deliveredAt, 2); // Pay in 2 days

  const daysEarly = differenceInDays(standardPayDate, quickPayDate);
  const quickPayFee = (daysEarly * 0.02 * load.carrierRate) / 30; // 2% per 30 days

  return round(quickPayFee, 2);
}
```

---

## 7. Accessorial Charges

### 7.1 Standard Accessorials

| Code      | Name                   | Default Rate | Billable To |
| --------- | ---------------------- | ------------ | ----------- |
| DETENTION | Detention (per hour)   | $75/hr       | Customer    |
| LAYOVER   | Layover (per day)      | $350/day     | Customer    |
| LUMPER    | Lumper fee             | Pass-through | Customer    |
| TONU      | Truck ordered not used | $250-500     | Customer    |
| REWEIGH   | Scale/reweigh          | $35          | Customer    |
| STOP_OFF  | Additional stop        | $150/stop    | Customer    |
| TARPING   | Flatbed tarping        | $75-150      | Customer    |
| HAZMAT    | Hazmat handling        | Varies       | Customer    |
| TEAM      | Team driver premium    | $0.20/mi     | Customer    |
| EXPEDITED | Expedited surcharge    | 20-50%       | Customer    |
| FUEL      | Fuel surcharge         | Varies       | Customer    |

### 7.2 Detention Calculation

```typescript
// Standard detention rules
const DETENTION_RULES = {
  freeTime: 2, // 2 hours free
  ratePerHour: 75, // $75/hour after free time
  maxHours: 8, // Cap at 8 hours
  startTrigger: 'arrival', // Clock starts at arrival
};

function calculateDetention(
  arrivedAt: Date,
  departedAt: Date,
  freeHours = 2,
  rate = 75
): number {
  const totalHours = differenceInHours(departedAt, arrivedAt);
  const billableHours = Math.max(0, totalHours - freeHours);
  const cappedHours = Math.min(billableHours, 8);

  return cappedHours * rate;
}
```

---

## 8. Date/Time Rules

### 8.1 Business Days Calculation

```typescript
// Holidays observed (US)
const HOLIDAYS = [
  "New Year's Day",
  'Memorial Day',
  'Independence Day',
  'Labor Day',
  'Thanksgiving',
  'Christmas Day',
];

function addBusinessDays(date: Date, days: number): Date {
  let result = date;
  let added = 0;

  while (added < days) {
    result = addDays(result, 1);
    if (isBusinessDay(result)) {
      added++;
    }
  }

  return result;
}

function isBusinessDay(date: Date): boolean {
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return false; // Weekend
  if (isHoliday(date)) return false;
  return true;
}
```

### 8.2 Time Zone Handling

```typescript
// All dates stored in UTC
// Display in user's timezone or tenant's default timezone

function toUserTimezone(date: Date, user: User, tenant: Tenant): Date {
  const timezone =
    user.timezone || tenant.settings?.timezone || 'America/Chicago';
  return utcToZonedTime(date, timezone);
}

// Appointment windows are in LOCAL time of the location
// Convert when storing and displaying
```

---

## 9. Notification Rules

### 9.1 Auto-Notification Triggers

| Event                      | Recipients           | Channels         |
| -------------------------- | -------------------- | ---------------- |
| Load dispatched            | Carrier, Driver      | Email, SMS, Push |
| Approaching pickup         | Dispatcher           | Email, In-app    |
| Load delivered             | Customer, Sales Rep  | Email            |
| POD received               | Customer             | Email            |
| Invoice created            | Customer             | Email            |
| Invoice overdue            | Customer, Accounting | Email            |
| Carrier insurance expiring | Carrier Rel, Carrier | Email            |
| Credit hold triggered      | Sales Rep, Customer  | Email            |

### 9.2 Escalation Rules

```typescript
// Load tracking escalation
const TRACKING_ESCALATION = [
  { hours: 2, action: 'reminder_to_driver' },
  { hours: 4, action: 'alert_dispatcher' },
  { hours: 8, action: 'alert_manager' },
  { hours: 24, action: 'critical_alert' },
];

// Invoice collection escalation
const COLLECTION_ESCALATION = [
  { days: 7, action: 'friendly_reminder' },
  { days: 14, action: 'second_notice' },
  { days: 30, action: 'final_notice' },
  { days: 45, action: 'credit_hold_warning' },
  { days: 60, action: 'credit_hold_apply' },
];
```

---

## 10. Quick Reference: Validation Summary

### Required Before Dispatch

- [ ] Carrier status = ACTIVE
- [ ] Carrier compliance = COMPLIANT
- [ ] Carrier insurance not expired
- [ ] Carrier insurance >= $750,000
- [ ] Customer not on credit hold (or COD)
- [ ] Carrier rate set
- [ ] Pickup date not past

### Required Before Invoice

- [ ] Load status = DELIVERED or COMPLETED
- [ ] POD received (if required by tenant settings)
- [ ] Load not already invoiced

### Required Before Carrier Payment

- [ ] Load delivered
- [ ] POD received (if required)
- [ ] Payment terms elapsed (or quick pay approved)

---

## Navigation

- **Previous:** [Entity Data Dictionary](./86-entity-data-dictionary.md)
- **Next:** [Documentation Index](./59-documentation-index.md)
