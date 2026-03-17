# Credit Components - API Mapping Guide

This document maps the component props to the actual hook signatures from Phase 1 implementation.

## Type Mapping Issues & Fixes

### 1. CreditDashboardCards

**Current Issue:** Component expects `tenantId` parameter but hooks need pagination params
**Fix Required:**

- Remove `tenantId` prop
- Use hook with default pagination params: `{ page: 1, limit: 100 }`

### 2. CreditApplicationForm

**Current Issue:** Form expects different field names than API
**API Schema (CreateCreditApplicationInput):**

```typescript
{
  companyId: string;
  requestedAmount: number; // Not requestedLimit
}
```

**Fix Required:**

- Rename form field `requestedLimit` → `requestedAmount`
- Remove extra fields (industry, revenue, creditScore, contactInfo) - these aren't in API
- Either simplify form or add separate company profile creation

### 3. CreditApplicationDetail

**Current Issue:** Hook needs applicationId as first param, not in options object
**Fix Required:**

```typescript
// WRONG:
useCreditApplication({ applicationId });
// RIGHT:
useCreditApplication(applicationId);
```

### 4. CreditApplicationList

**Current Issue:** Properties don't match actual CreditApplication type
**Correct Property Names:**

- `requestedAmount` (not `requestedLimit`)
- `appliedAt` (not `createdAt` - though both exist)
- `companyId` exists but not `companyName` - need to fetch separately or remove

### 5. CreditLimitCard

**Current Issue:** Multiple type mismatches
**Fix Required:**

- Rename `creditLimit` → `creditAmount`
- Rename `utilized` → `amountUsed`
- Use `CreditUtilization` interface for utilization data
- Remove non-existent properties

### 6. CreditUtilizationBar

**Fix Required:**

- Component is pure (no hooks) - no API issues
- Props should use cents notation consistently

### 7. CreditHoldBanner

**Current Issue:** Hook params mismatch
**Fix Required:**

```typescript
// WRONG:
useCreditHolds({ companyId, status: 'ACTIVE' });
// RIGHT:
useCreditHolds({ status: 'ACTIVE' }); // tenantId may be needed
```

### 8. CollectionActivityLog

**Current Issue:** Hook accepts different params
**Fix Required:**

```typescript
// WRONG:
useCollectionsQueue({ companyId });
// RIGHT:
useCollectionsQueue({
  /* check params */
});
```

### 9. AgingBucketChart

**Current Issue:** AgingBucket type doesn't have `label` property
**Fix Required:**

- Check actual AgingBucket interface
- Use correct properties from API response

### 10. PaymentPlanTimeline

**Current Issue:** Hook expects different param structure
**Fix Required:**

- Verify `usePaymentPlan(planId)` signature
- Check installment object structure in PaymentPlan type

## Next Steps

1. Verify each hook's actual signature by reading hook files
2. Update component props interfaces to match
3. Update component implementations to use correct property names
4. Re-run type checker: `pnpm check-types`
5. Fix any remaining runtime issues

## Quick Reference: Actual Hook Signatures

From inspection:

```typescript
// CreditLimits
useCreditLimits(params: CreditLimitListParams)
useCreditLimit(id: string) // Single limit
useCreditUtilization(companyId: string)

// CreditApplications
useCreditApplications(params: CreditApplicationListParams)
useCreditApplication(id: string) // Single application
useCreateCreditApplication() // Mutation
useApproveCreditApplication() // Mutation - needs creditLimit
useRejectCreditApplication() // Mutation - needs rejectionReason

// CreditHolds
useCreditHolds(params: CreditHoldListParams)
useCreateCreditHold() // Mutation
useReleaseCreditHold() // Mutation

// Collections & Aging
useCollectionsQueue(params: CollectionsQueueParams)
useAgingReport(tenantId: string)

// PaymentPlans
usePaymentPlans(params: PaymentPlanListParams)
usePaymentPlan(id: string) // Single plan
useCreatePaymentPlan() // Mutation
useUpdatePaymentPlan() // Mutation
useRecordPayment() // Mutation
```
