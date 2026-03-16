/**
 * Credit module hooks - Complete implementation of all 13 credit operations
 * Handles applications, limits, holds, collections, payment plans, and DNB lookups
 */

// Applications
export {
  useCreditApplications,
  useCreditApplication,
  useCreateCreditApplication,
  useApproveCreditApplication,
  useRejectCreditApplication,
  creditApplicationKeys,
  type CreditApplication,
  type CreditApplicationListParams,
  type CreateCreditApplicationInput,
  type ApproveCreditApplicationInput,
  type RejectCreditApplicationInput,
} from './use-credit-applications';

// Limits
export {
  useCreditLimits,
  useCreditLimit,
  useCreditUtilization,
  useCreateCreditLimit,
  useUpdateCreditLimit,
  creditLimitKeys,
  type CreditLimit,
  type CreditUtilization,
  type CreditLimitListParams,
  type CreateCreditLimitInput,
  type UpdateCreditLimitInput,
} from './use-credit-limits';

// Holds
export {
  useCreditHolds,
  useCreateCreditHold,
  useReleaseCreditHold,
  creditHoldKeys,
  type CreditHold,
  type CreditHoldListParams,
  type CreateCreditHoldInput,
  type ReleaseCreditHoldInput,
} from './use-credit-holds';

// Collections & Aging
export {
  useCollectionsQueue,
  useAgingReport,
  collectionsKeys,
  type CollectionAccount,
  type AgingReport,
  type AgingBucket,
  type CollectionsQueueParams,
} from './use-collections-queue';

// Payment Plans
export {
  usePaymentPlans,
  usePaymentPlan,
  useCreatePaymentPlan,
  useUpdatePaymentPlan,
  useRecordPayment,
  paymentPlanKeys,
  type PaymentPlan,
  type PaymentPlanListParams,
  type CreatePaymentPlanInput,
  type UpdatePaymentPlanInput,
  type RecordPaymentInput,
} from './use-payment-plans';

// DNB Lookup
export {
  useDnbLookup,
  dnbLookupKeys,
  type DnbCompanyResult,
  type DnbLookupResponse,
  type DnbLookupParams,
} from './use-dnb-lookup';
