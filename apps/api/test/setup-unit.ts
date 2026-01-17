// Mock common dependencies
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
  Prisma: {
    JsonNull: null,
    Decimal: class Decimal {
      constructor(public value: any) {}
    },
  },
  JobExecutionStatus: {
    PENDING: 'PENDING',
    RUNNING: 'RUNNING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
    CANCELLED: 'CANCELLED',
  },
  TaskStatus: {
    PENDING: 'PENDING',
    CANCELLED: 'CANCELLED',
  },
  RateLimitScope: {
    GLOBAL: 'GLOBAL',
  },
  ExecutionStatus: {
    RUNNING: 'RUNNING',
    COMPLETED: 'COMPLETED',
  },
  ScheduleType: {
    CRON: 'CRON',
    INTERVAL: 'INTERVAL',
    ONCE: 'ONCE',
    MANUAL: 'MANUAL',
  },
  JobType: {
    TENANT: 'TENANT',
    SYSTEM: 'SYSTEM',
  },
  ClaimStatus: {
    DRAFT: 'DRAFT',
    SUBMITTED: 'SUBMITTED',
    CLOSED: 'CLOSED',
    APPROVED: 'APPROVED',
    DENIED: 'DENIED',
    SETTLED: 'SETTLED',
  },
  SubrogationStatus: {
    PENDING: 'PENDING',
    CLOSED: 'CLOSED',
    RECOVERED: 'RECOVERED',
  },
  InsuranceType: {
    AUTO_LIABILITY: 'AUTO_LIABILITY',
    CARGO: 'CARGO',
    GENERAL_LIABILITY: 'GENERAL_LIABILITY',
    WORKERS_COMP: 'WORKERS_COMP',
    UMBRELLA: 'UMBRELLA',
    BOND: 'BOND',
  },
  ReplyType: {
    PUBLIC: 'PUBLIC',
    INTERNAL: 'INTERNAL',
  },
  TicketPriority: {
    LOW: 'LOW',
    NORMAL: 'NORMAL',
    HIGH: 'HIGH',
    URGENT: 'URGENT',
  },
  TicketStatus: {
    NEW: 'NEW',
    OPEN: 'OPEN',
    CLOSED: 'CLOSED',
  },
  TicketType: {
    QUESTION: 'QUESTION',
    INCIDENT: 'INCIDENT',
    PROBLEM: 'PROBLEM',
    TASK: 'TASK',
  },
  AgentStatus: {
    ACTIVE: 'ACTIVE',
    SUSPENDED: 'SUSPENDED',
    TERMINATED: 'TERMINATED',
  },
  AgreementStatus: {
    DRAFT: 'DRAFT',
    ACTIVE: 'ACTIVE',
    TERMINATED: 'TERMINATED',
    EXPIRED: 'EXPIRED',
  },
  AssignmentStatus: {
    ACTIVE: 'ACTIVE',
    TRANSFERRED: 'TRANSFERRED',
    SUNSET: 'SUNSET',
    TERMINATED: 'TERMINATED',
  },
  AssignmentType: {
    PRIMARY: 'PRIMARY',
    SECONDARY: 'SECONDARY',
  },
  LeadStatus: {
    SUBMITTED: 'SUBMITTED',
    QUALIFIED: 'QUALIFIED',
    CONVERTED: 'CONVERTED',
    REJECTED: 'REJECTED',
  },
  AgentCommissionStatus: {
    CALCULATED: 'CALCULATED',
    APPROVED: 'APPROVED',
    PAID: 'PAID',
  },
  AgentPayoutStatus: {
    PENDING: 'PENDING',
    PAID: 'PAID',
    FAILED: 'FAILED',
  },
  AuditAction: {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    READ: 'READ',
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
  },
  AuditActionCategory: {
    DATA: 'DATA',
    ACCESS: 'ACCESS',
    SECURITY: 'SECURITY',
    SYSTEM: 'SYSTEM',
  },
  AuditSeverity: {
    INFO: 'INFO',
    WARNING: 'WARNING',
    CRITICAL: 'CRITICAL',
  },
  AuditSeverityLevel: {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL',
  },
  LoginMethod: {
    PASSWORD: 'PASSWORD',
    SSO: 'SSO',
  },
  ResetFrequency: {
    NEVER: 'NEVER',
    DAILY: 'DAILY',
    MONTHLY: 'MONTHLY',
    YEARLY: 'YEARLY',
  },
  DayOfWeek: {
    SUNDAY: 'SUNDAY',
    MONDAY: 'MONDAY',
    TUESDAY: 'TUESDAY',
    WEDNESDAY: 'WEDNESDAY',
    THURSDAY: 'THURSDAY',
    FRIDAY: 'FRIDAY',
    SATURDAY: 'SATURDAY',
  },
  FeatureFlagStatus: {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
  },
  ConfigCategory: {
    GENERAL: 'GENERAL',
    OPERATIONS: 'OPERATIONS',
    BILLING: 'BILLING',
  },
  DataType: {
    STRING: 'STRING',
    NUMBER: 'NUMBER',
    BOOLEAN: 'BOOLEAN',
    JSON: 'JSON',
  },
  ContractStatus: {
    DRAFT: 'DRAFT',
    PENDING_APPROVAL: 'PENDING_APPROVAL',
    APPROVED: 'APPROVED',
    SENT_FOR_SIGNATURE: 'SENT_FOR_SIGNATURE',
    ACTIVE: 'ACTIVE',
    TERMINATED: 'TERMINATED',
  },
  PortalUserStatus: {
    ACTIVE: 'ACTIVE',
    SUSPENDED: 'SUSPENDED',
    DEACTIVATED: 'DEACTIVATED',
  },
  PortalUserRole: {
    ADMIN: 'ADMIN',
    USER: 'USER',
  },
  CarrierPortalUserRole: {
    ADMIN: 'ADMIN',
    USER: 'USER',
  },
  CarrierDocumentStatus: {
    APPROVED: 'APPROVED',
    REVIEWING: 'REVIEWING',
    REJECTED: 'REJECTED',
  },
  CarrierDocumentType: {
    POD: 'POD',
    BOL_SIGNED: 'BOL_SIGNED',
    WEIGHT_TICKET: 'WEIGHT_TICKET',
    SCALE_TICKET: 'SCALE_TICKET',
    LUMPER_RECEIPT: 'LUMPER_RECEIPT',
    INSURANCE: 'INSURANCE',
    OTHER: 'OTHER',
  },
  QuoteRequestStatus: {
    SUBMITTED: 'SUBMITTED',
    QUOTED: 'QUOTED',
    ACCEPTED: 'ACCEPTED',
    DECLINED: 'DECLINED',
    REVIEWING: 'REVIEWING',
  },
  PortalPaymentStatus: {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
  },
  PostLeadStatus: {
    NEW: 'NEW',
    CONTACTED: 'CONTACTED',
    QUOTED: 'QUOTED',
    ACCEPTED: 'ACCEPTED',
    DECLINED: 'DECLINED',
  },
  LoadPostStatus: {
    DRAFT: 'DRAFT',
    POSTED: 'POSTED',
    CANCELLED: 'CANCELLED',
    COVERED: 'COVERED',
    EXPIRED: 'EXPIRED',
  },
  PostingFrequency: {
    IMMEDIATE: 'IMMEDIATE',
    MANUAL: 'MANUAL',
  },
  PostingStatus: {
    ACTIVE: 'ACTIVE',
    EXPIRED: 'EXPIRED',
    DRAFT: 'DRAFT',
  },
  BidStatus: {
    PENDING: 'PENDING',
    COUNTERED: 'COUNTERED',
    ACCEPTED: 'ACCEPTED',
    REJECTED: 'REJECTED',
    WITHDRAWN: 'WITHDRAWN',
    EXPIRED: 'EXPIRED',
  },
  TenderType: {
    WATERFALL: 'WATERFALL',
    BROADCAST: 'BROADCAST',
  },
  EdiDirection: {
    INBOUND: 'INBOUND',
    OUTBOUND: 'OUTBOUND',
  },
  EdiMessageStatus: {
    PENDING: 'PENDING',
    DELIVERED: 'DELIVERED',
    ERROR: 'ERROR',
    ACKNOWLEDGED: 'ACKNOWLEDGED',
  },
  EdiTransactionType: {
    EDI_204: 'EDI_204',
    EDI_210: 'EDI_210',
    EDI_214: 'EDI_214',
    EDI_990: 'EDI_990',
  },
  EdiValidationStatus: {
    VALID: 'VALID',
    ERROR: 'ERROR',
  },
  RateProvider: {
    DAT: 'DAT',
    TRUCKSTOP: 'TRUCKSTOP',
    INTERNAL: 'INTERNAL',
  },
  AlertCondition: {
    ABOVE: 'ABOVE',
    BELOW: 'BELOW',
    CHANGE: 'CHANGE',
  },
  ReminderStatus: {
    PENDING: 'PENDING',
    SNOOZED: 'SNOOZED',
    DISMISSED: 'DISMISSED',
  },
  SearchEntityType: {
    ORDERS: 'ORDERS',
    LOADS: 'LOADS',
    COMPANIES: 'COMPANIES',
    CARRIERS: 'CARRIERS',
    CONTACTS: 'CONTACTS',
    INVOICES: 'INVOICES',
    DOCUMENTS: 'DOCUMENTS',
  },
  IndexOperation: {
    INDEX: 'INDEX',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    REINDEX: 'REINDEX',
  },
  CSABasicType: {
    UNSAFE_DRIVING: 'UNSAFE_DRIVING',
    HOS_COMPLIANCE: 'HOS_COMPLIANCE',
    DRIVER_FITNESS: 'DRIVER_FITNESS',
    CONTROLLED_SUBSTANCES: 'CONTROLLED_SUBSTANCES',
    VEHICLE_MAINTENANCE: 'VEHICLE_MAINTENANCE',
    HAZMAT_COMPLIANCE: 'HAZMAT_COMPLIANCE',
    CRASH_INDICATOR: 'CRASH_INDICATOR',
  },
  SaferDataStatus: {
    ACTIVE: 'ACTIVE',
    OUT_OF_SERVICE: 'OUT_OF_SERVICE',
    INACTIVE: 'INACTIVE',
  },
}));

// Global test utilities
(global as any).createMockTenantId = () => 'test-tenant-id';
(global as any).createMockUserId = () => 'test-user-id';
