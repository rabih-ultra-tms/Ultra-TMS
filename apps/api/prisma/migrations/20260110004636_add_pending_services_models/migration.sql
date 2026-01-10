-- CreateEnum
CREATE TYPE "CapacityStatus" AS ENUM ('AVAILABLE', 'COMMITTED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "PortalUserRole" AS ENUM ('ADMIN', 'USER', 'VIEW_ONLY');

-- CreateEnum
CREATE TYPE "PortalUserStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "QuoteRequestStatus" AS ENUM ('SUBMITTED', 'REVIEWING', 'QUOTED', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PortalPaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "CarrierPortalUserRole" AS ENUM ('OWNER', 'ADMIN', 'DISPATCHER', 'DRIVER');

-- CreateEnum
CREATE TYPE "CarrierDocumentType" AS ENUM ('POD', 'LUMPER_RECEIPT', 'SCALE_TICKET', 'BOL_SIGNED', 'WEIGHT_TICKET', 'OTHER');

-- CreateEnum
CREATE TYPE "CarrierDocumentStatus" AS ENUM ('UPLOADED', 'REVIEWING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "QuickPayStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'PROCESSED');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('CUSTOMER_RATE', 'CARRIER_RATE', 'DEDICATED_CAPACITY', 'VOLUME_COMMITMENT', 'AGENT_AGREEMENT');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT_FOR_SIGNATURE', 'ACTIVE', 'EXPIRED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "RateType" AS ENUM ('FLAT', 'PER_MILE', 'PER_CWT', 'PER_PALLET', 'PERCENTAGE');

-- CreateEnum
CREATE TYPE "SLAType" AS ENUM ('ON_TIME_PICKUP', 'ON_TIME_DELIVERY', 'CLAIMS_RATIO', 'TENDER_ACCEPTANCE');

-- CreateEnum
CREATE TYPE "AgentType" AS ENUM ('REFERRING', 'SELLING', 'HYBRID');

-- CreateEnum
CREATE TYPE "AgentStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "AgentAssignmentType" AS ENUM ('PRIMARY', 'SECONDARY', 'SPLIT');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('SUBMITTED', 'REVIEWING', 'QUALIFIED', 'WORKING', 'CONVERTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AgentCommissionStatus" AS ENUM ('CALCULATED', 'APPROVED', 'PAID', 'ADJUSTED', 'VOIDED');

-- CreateEnum
CREATE TYPE "NOAStatus" AS ENUM ('PENDING', 'VERIFIED', 'ACTIVE', 'EXPIRED', 'RELEASED');

-- CreateEnum
CREATE TYPE "FactoringStatus" AS ENUM ('NONE', 'FACTORED', 'QUICK_PAY_ONLY');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'PARTIAL', 'DECLINED');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMP');

-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('ACTIVE', 'ON_LEAVE', 'TERMINATED');

-- CreateEnum
CREATE TYPE "TimeOffType" AS ENUM ('PTO', 'SICK', 'VACATION', 'PERSONAL', 'FLOATING_HOLIDAY');

-- CreateEnum
CREATE TYPE "TimeOffRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "KPICategory" AS ENUM ('FINANCIAL', 'OPERATIONAL', 'CARRIER', 'CUSTOMER', 'SALES');

-- CreateEnum
CREATE TYPE "AggregationType" AS ENUM ('SUM', 'AVG', 'COUNT', 'MIN', 'MAX', 'RATIO');

-- CreateEnum
CREATE TYPE "PeriodType" AS ENUM ('HOUR', 'DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('STANDARD', 'CUSTOM', 'AD_HOC');

-- CreateEnum
CREATE TYPE "OutputFormat" AS ENUM ('PDF', 'EXCEL', 'CSV', 'JSON');

-- CreateEnum
CREATE TYPE "TriggerType" AS ENUM ('EVENT', 'SCHEDULE', 'MANUAL', 'WEBHOOK');

-- CreateEnum
CREATE TYPE "StepType" AS ENUM ('ACTION', 'CONDITION', 'APPROVAL', 'WAIT', 'PARALLEL', 'LOOP');

-- CreateEnum
CREATE TYPE "WorkflowExecutionStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED', 'WAITING');

-- CreateEnum
CREATE TYPE "ApprovalType" AS ENUM ('SINGLE', 'ALL', 'ANY', 'SEQUENTIAL');

-- CreateEnum
CREATE TYPE "IntegrationCategory" AS ENUM ('LOAD_BOARD', 'ACCOUNTING', 'ELD', 'CRM', 'RATING', 'TMS', 'DOCUMENT', 'TRACKING');

-- CreateEnum
CREATE TYPE "AuthType" AS ENUM ('API_KEY', 'OAUTH2', 'BASIC', 'NONE');

-- CreateEnum
CREATE TYPE "SyncFrequency" AS ENUM ('REALTIME', 'HOURLY', 'DAILY', 'MANUAL');

-- CreateEnum
CREATE TYPE "WebhookStatus" AS ENUM ('PENDING', 'DELIVERED', 'FAILED', 'RETRYING');

-- CreateEnum
CREATE TYPE "CircuitBreakerState" AS ENUM ('CLOSED', 'OPEN', 'HALF_OPEN');

-- CreateEnum
CREATE TYPE "SearchEntityType" AS ENUM ('ORDERS', 'LOADS', 'COMPANIES', 'CARRIERS', 'CONTACTS', 'INVOICES', 'DOCUMENTS');

-- CreateEnum
CREATE TYPE "IndexStatus" AS ENUM ('ACTIVE', 'REBUILDING', 'ERROR');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT');

-- CreateEnum
CREATE TYPE "AuditActionCategory" AS ENUM ('DATA', 'AUTH', 'ADMIN', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AuditSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AuditEventType" AS ENUM ('LOGIN_SUCCESS', 'LOGIN_FAILED', 'PASSWORD_RESET', 'MFA_ENABLED', 'DATA_EXPORT', 'PERMISSION_CHANGE');

-- CreateEnum
CREATE TYPE "ConfigCategory" AS ENUM ('SECURITY', 'LIMITS', 'DEFAULTS', 'INTEGRATIONS', 'EMAIL', 'NOTIFICATIONS');

-- CreateEnum
CREATE TYPE "FeatureFlagStatus" AS ENUM ('ACTIVE', 'DEPRECATED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ConfigTemplateType" AS ENUM ('TENANT', 'USER');

-- CreateEnum
CREATE TYPE "ScheduleType" AS ENUM ('CRON', 'INTERVAL', 'ONCE', 'MANUAL');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('SYSTEM', 'TENANT', 'USER');

-- CreateEnum
CREATE TYPE "JobExecutionStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED', 'TIMEOUT');

-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('PENDING', 'SENT', 'SNOOZED', 'DISMISSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "CacheType" AS ENUM ('ENTITY', 'QUERY', 'SESSION', 'CONFIG');

-- CreateEnum
CREATE TYPE "InvalidationType" AS ENUM ('DELETE', 'REFRESH');

-- CreateEnum
CREATE TYPE "RateLimitScope" AS ENUM ('USER', 'TENANT', 'IP', 'GLOBAL');

-- CreateEnum
CREATE TYPE "TicketSource" AS ENUM ('EMAIL', 'PORTAL', 'PHONE', 'CHAT', 'INTERNAL');

-- CreateEnum
CREATE TYPE "TicketType" AS ENUM ('QUESTION', 'PROBLEM', 'INCIDENT', 'REQUEST');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('URGENT', 'HIGH', 'NORMAL', 'LOW');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('NEW', 'OPEN', 'PENDING', 'ON_HOLD', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ReplyType" AS ENUM ('PUBLIC', 'INTERNAL_NOTE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "NPSCategory" AS ENUM ('PROMOTER', 'PASSIVE', 'DETRACTOR');

-- CreateEnum
CREATE TYPE "SurveyType" AS ENUM ('NPS', 'CSAT', 'CUSTOM', 'EXIT', 'ONBOARDING');

-- CreateEnum
CREATE TYPE "FeatureRequestStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'DECLINED');

-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('BUG', 'SUGGESTION', 'COMPLAINT', 'PRAISE', 'OTHER');

-- CreateTable
CREATE TABLE "CarrierCapacity" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "carrierId" TEXT NOT NULL,
    "equipmentType" VARCHAR(50) NOT NULL,
    "availableUnits" INTEGER NOT NULL DEFAULT 0,
    "totalUnits" INTEGER NOT NULL,
    "city" VARCHAR(100),
    "state" VARCHAR(50),
    "zipCode" VARCHAR(20),
    "lat" DECIMAL(10,7),
    "lng" DECIMAL(10,7),
    "effectiveDate" DATE NOT NULL,
    "expiresAt" DATE,
    "status" "CapacityStatus" NOT NULL DEFAULT 'AVAILABLE',
    "notes" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "CarrierCapacity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalUser" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "role" "PortalUserRole" NOT NULL DEFAULT 'USER',
    "status" "PortalUserStatus" NOT NULL DEFAULT 'PENDING',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "verificationToken" VARCHAR(255),
    "lastLoginAt" TIMESTAMP(3),
    "language" VARCHAR(10) NOT NULL DEFAULT 'en',
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "PortalUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalSession" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshTokenHash" VARCHAR(255) NOT NULL,
    "userAgent" TEXT,
    "ipAddress" VARCHAR(45),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "PortalSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteRequest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestNumber" VARCHAR(50) NOT NULL,
    "subject" VARCHAR(255),
    "description" TEXT,
    "originCity" VARCHAR(100),
    "originState" VARCHAR(50),
    "originZip" VARCHAR(20),
    "destCity" VARCHAR(100),
    "destState" VARCHAR(50),
    "destZip" VARCHAR(20),
    "pickupDate" DATE,
    "deliveryDate" DATE,
    "equipmentType" VARCHAR(50),
    "commodity" VARCHAR(255),
    "weightLbs" DECIMAL(10,2),
    "palletCount" INTEGER,
    "isHazmat" BOOLEAN NOT NULL DEFAULT false,
    "isTemperatureControlled" BOOLEAN NOT NULL DEFAULT false,
    "tempRange" VARCHAR(50),
    "status" "QuoteRequestStatus" NOT NULL DEFAULT 'SUBMITTED',
    "quoteId" TEXT,
    "quotedAmount" DECIMAL(12,2),
    "quotedAt" TIMESTAMP(3),
    "quotedBy" TEXT,
    "quoteExpiresAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "declinedAt" TIMESTAMP(3),
    "declineReason" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "QuoteRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalActivityLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "entityType" VARCHAR(50),
    "entityId" TEXT,
    "description" TEXT,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,
    "companyId" TEXT,

    CONSTRAINT "PortalActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalPayment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "paymentNumber" VARCHAR(50) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "status" "PortalPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" VARCHAR(50) NOT NULL,
    "lastFourDigits" VARCHAR(4),
    "processorTransactionId" VARCHAR(255),
    "processorResponse" JSONB,
    "invoiceIds" TEXT[],
    "processedAt" TIMESTAMP(3),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "PortalPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarrierPortalUser" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "carrierId" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "role" "CarrierPortalUserRole" NOT NULL DEFAULT 'DISPATCHER',
    "status" "PortalUserStatus" NOT NULL DEFAULT 'PENDING',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "verificationToken" VARCHAR(255),
    "lastLoginAt" TIMESTAMP(3),
    "language" VARCHAR(10) NOT NULL DEFAULT 'en',
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "CarrierPortalUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarrierPortalSession" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshTokenHash" VARCHAR(255) NOT NULL,
    "userAgent" TEXT,
    "ipAddress" VARCHAR(45),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,
    "carrierId" TEXT,

    CONSTRAINT "CarrierPortalSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarrierPortalDocument" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "carrierId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loadId" TEXT,
    "documentType" "CarrierDocumentType" NOT NULL DEFAULT 'POD',
    "fileName" VARCHAR(255) NOT NULL,
    "filePath" VARCHAR(500) NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "status" "CarrierDocumentStatus" NOT NULL DEFAULT 'UPLOADED',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "rejectionNotes" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "CarrierPortalDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarrierInvoiceSubmission" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "carrierId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loadId" TEXT NOT NULL,
    "invoiceNumber" VARCHAR(50) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "invoiceDate" DATE NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "settlementId" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "CarrierInvoiceSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarrierQuickPayRequest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "carrierId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loadId" TEXT NOT NULL,
    "requestedAmount" DECIMAL(12,2) NOT NULL,
    "feePercent" DECIMAL(5,2) NOT NULL,
    "feeAmount" DECIMAL(12,2) NOT NULL,
    "netAmount" DECIMAL(12,2) NOT NULL,
    "status" "QuickPayStatus" NOT NULL DEFAULT 'REQUESTED',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "processedAt" TIMESTAMP(3),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "CarrierQuickPayRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarrierPortalActivityLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "entityType" VARCHAR(50),
    "entityId" TEXT,
    "description" TEXT,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,
    "carrierId" TEXT,

    CONSTRAINT "CarrierPortalActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "contractNumber" VARCHAR(50) NOT NULL,
    "contractType" "ContractType" NOT NULL,
    "customerId" TEXT,
    "carrierId" TEXT,
    "agentId" TEXT,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "effectiveDate" DATE NOT NULL,
    "expirationDate" DATE,
    "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "renewalTermDays" INTEGER,
    "noticeDays" INTEGER,
    "documentId" TEXT,
    "signedDocumentId" TEXT,
    "esignProvider" VARCHAR(50),
    "esignEnvelopeId" VARCHAR(255),
    "signedAt" TIMESTAMP(3),
    "signedBy" TEXT,
    "minimumRevenue" DECIMAL(12,2),
    "maximumRevenue" DECIMAL(12,2),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuelSurchargeTable" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "contractId" TEXT,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "basePrice" DECIMAL(5,3) NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "effectiveDate" DATE NOT NULL,
    "expirationDate" DATE,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "FuelSurchargeTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuelSurchargeTier" (
    "id" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "tierNumber" INTEGER NOT NULL,
    "priceMin" DECIMAL(5,3) NOT NULL,
    "priceMax" DECIMAL(5,3),
    "surchargePercent" DECIMAL(5,2) NOT NULL,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "FuelSurchargeTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractSLA" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "slaType" "SLAType" NOT NULL,
    "targetPercent" DECIMAL(5,2) NOT NULL,
    "measurementPeriod" VARCHAR(50) NOT NULL,
    "penaltyAmount" DECIMAL(12,2),
    "penaltyPercent" DECIMAL(5,2),
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "ContractSLA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolumeCommitment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "minimumLoads" INTEGER,
    "minimumRevenue" DECIMAL(14,2),
    "minimumWeight" DECIMAL(14,2),
    "actualLoads" INTEGER NOT NULL DEFAULT 0,
    "actualRevenue" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "actualWeight" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "shortfallFee" DECIMAL(12,2),
    "shortfallPercent" DECIMAL(5,2),
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "VolumeCommitment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "agentCode" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "agentType" "AgentType" NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "address" TEXT,
    "status" "AgentStatus" NOT NULL DEFAULT 'PENDING',
    "activeFrom" DATE,
    "activeTo" DATE,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentAgreement" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "agreementNumber" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "effectiveDate" DATE NOT NULL,
    "expirationDate" DATE,
    "commissionType" VARCHAR(50) NOT NULL,
    "commissionRate" DECIMAL(5,2),
    "flatAmount" DECIMAL(10,2),
    "calculationBasis" VARCHAR(50) NOT NULL,
    "protectionPeriodMonths" INTEGER NOT NULL DEFAULT 12,
    "hasSunset" BOOLEAN NOT NULL DEFAULT false,
    "sunsetStartMonth" INTEGER,
    "sunsetReductionPercent" DECIMAL(5,2),
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "AgentAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentCustomerAssignment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "assignmentType" "AgentAssignmentType" NOT NULL DEFAULT 'PRIMARY',
    "splitPercent" DECIMAL(5,2) NOT NULL DEFAULT 100,
    "assignedDate" DATE NOT NULL,
    "releaseDate" DATE,
    "protectionEndsAt" DATE,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "AgentCustomerAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentCommission" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "loadId" TEXT,
    "orderId" TEXT,
    "calculationBasis" VARCHAR(50) NOT NULL,
    "basisAmount" DECIMAL(12,2) NOT NULL,
    "commissionRate" DECIMAL(5,2) NOT NULL,
    "commissionAmount" DECIMAL(12,2) NOT NULL,
    "isSplit" BOOLEAN NOT NULL DEFAULT false,
    "splitPercent" DECIMAL(5,2) NOT NULL DEFAULT 100,
    "status" "AgentCommissionStatus" NOT NULL DEFAULT 'CALCULATED',
    "commissionPeriod" DATE NOT NULL,
    "paidAt" TIMESTAMP(3),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "AgentCommission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FactoringCompany" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyCode" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "fax" VARCHAR(20),
    "address" TEXT,
    "verificationMethod" VARCHAR(50) NOT NULL,
    "apiEndpoint" VARCHAR(500),
    "apiKey" VARCHAR(255),
    "verificationSLAHours" INTEGER NOT NULL DEFAULT 24,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "FactoringCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NOARecord" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "carrierId" TEXT NOT NULL,
    "factoringCompanyId" TEXT NOT NULL,
    "noaNumber" VARCHAR(50) NOT NULL,
    "noaDocument" VARCHAR(500),
    "receivedDate" DATE NOT NULL,
    "effectiveDate" DATE NOT NULL,
    "expirationDate" DATE,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "verifiedMethod" VARCHAR(50),
    "status" "NOAStatus" NOT NULL DEFAULT 'PENDING',
    "releasedBy" TEXT,
    "releasedAt" TIMESTAMP(3),
    "releaseReason" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "NOARecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarrierFactoringStatus" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "carrierId" TEXT NOT NULL,
    "factoringStatus" "FactoringStatus" NOT NULL DEFAULT 'NONE',
    "factoringCompanyId" TEXT,
    "activeNoaId" TEXT,
    "quickPayEnabled" BOOLEAN NOT NULL DEFAULT false,
    "quickPayFeePercent" DECIMAL(5,2),
    "notes" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "CarrierFactoringStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "employeeNumber" VARCHAR(50) NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "employmentType" "EmploymentType" NOT NULL,
    "employmentStatus" "EmploymentStatus" NOT NULL DEFAULT 'ACTIVE',
    "departmentId" TEXT,
    "positionId" TEXT,
    "managerId" TEXT,
    "hireDate" DATE NOT NULL,
    "terminationDate" DATE,
    "annualSalary" DECIMAL(12,2),
    "hourlyRate" DECIMAL(10,2),
    "ptoBalance" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "sickBalance" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "parentDepartmentId" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "minSalary" DECIMAL(12,2),
    "maxSalary" DECIMAL(12,2),
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeOffRequest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "requestType" "TimeOffType" NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "totalDays" DECIMAL(5,2) NOT NULL,
    "reason" TEXT,
    "status" "TimeOffRequestStatus" NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "deniedBy" TEXT,
    "deniedAt" TIMESTAMP(3),
    "denialReason" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "TimeOffRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KPIDefinition" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "category" "KPICategory" NOT NULL,
    "aggregationType" "AggregationType" NOT NULL,
    "sourceQuery" TEXT NOT NULL,
    "unit" VARCHAR(50),
    "format" VARCHAR(50),
    "targetValue" DECIMAL(14,4),
    "warningValue" DECIMAL(14,4),
    "criticalValue" DECIMAL(14,4),
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "KPIDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dashboard" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" TEXT,
    "layout" JSONB NOT NULL DEFAULT '{}',
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Dashboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "reportType" "ReportType" NOT NULL,
    "sourceQuery" TEXT NOT NULL,
    "parameters" JSONB NOT NULL DEFAULT '[]',
    "outputFormat" "OutputFormat" NOT NULL DEFAULT 'PDF',
    "isScheduled" BOOLEAN NOT NULL DEFAULT false,
    "scheduleExpression" VARCHAR(255),
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workflow" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "triggerType" "TriggerType" NOT NULL,
    "triggerEvent" VARCHAR(100),
    "triggerConditions" JSONB NOT NULL DEFAULT '{}',
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "version" INTEGER NOT NULL DEFAULT 1,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowExecution" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "triggerData" JSONB NOT NULL,
    "status" "WorkflowExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "result" JSONB,
    "errorMessage" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "WorkflowExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalRequest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "requestNumber" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "approvalType" "ApprovalType" NOT NULL,
    "entityType" VARCHAR(50) NOT NULL,
    "entityId" TEXT NOT NULL,
    "approverIds" TEXT[],
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "dueDate" DATE,
    "decidedBy" TEXT,
    "decidedAt" TIMESTAMP(3),
    "decision" VARCHAR(50),
    "comments" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "ApprovalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "category" "IntegrationCategory" NOT NULL,
    "provider" VARCHAR(100) NOT NULL,
    "authType" "AuthType" NOT NULL,
    "apiKey" VARCHAR(500),
    "apiSecret" VARCHAR(500),
    "oauthTokens" JSONB,
    "config" JSONB NOT NULL DEFAULT '{}',
    "syncFrequency" "SyncFrequency" NOT NULL,
    "lastSyncAt" TIMESTAMP(3),
    "nextSyncAt" TIMESTAMP(3),
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEndpoint" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "description" TEXT,
    "events" TEXT[],
    "secret" VARCHAR(255),
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "WebhookEndpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookDelivery" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "endpointId" TEXT,
    "integrationId" TEXT,
    "event" VARCHAR(100) NOT NULL,
    "payload" JSONB NOT NULL,
    "requestHeaders" JSONB,
    "requestBody" JSONB,
    "responseStatus" INTEGER,
    "responseHeaders" JSONB,
    "responseBody" TEXT,
    "status" "WebhookStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastAttempt" TIMESTAMP(3),
    "nextRetry" TIMESTAMP(3),
    "errorMessage" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "WebhookDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedSearch" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "entityType" "SearchEntityType" NOT NULL,
    "query" JSONB NOT NULL,
    "filters" JSONB NOT NULL DEFAULT '{}',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "SavedSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchHistory" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entityType" "SearchEntityType" NOT NULL,
    "searchTerm" VARCHAR(500) NOT NULL,
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "SearchHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "userId" TEXT,
    "action" "AuditAction" NOT NULL,
    "category" "AuditActionCategory" NOT NULL,
    "severity" "AuditSeverity" NOT NULL DEFAULT 'INFO',
    "entityType" VARCHAR(50),
    "entityId" TEXT,
    "description" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChangeHistory" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "entityType" VARCHAR(50) NOT NULL,
    "entityId" TEXT NOT NULL,
    "field" VARCHAR(100) NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "ChangeHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" TEXT NOT NULL,
    "category" "ConfigCategory" NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "dataType" VARCHAR(50) NOT NULL,
    "validationRules" JSONB,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureFlag" (
    "id" TEXT NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" "FeatureFlagStatus" NOT NULL DEFAULT 'ACTIVE',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "rolloutPercent" INTEGER NOT NULL DEFAULT 0,
    "tenantIds" TEXT[],
    "userIds" TEXT[],
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledJob" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "jobType" "JobType" NOT NULL,
    "scheduleType" "ScheduleType" NOT NULL,
    "cronExpression" VARCHAR(255),
    "intervalMinutes" INTEGER,
    "scheduledAt" TIMESTAMP(3),
    "handlerName" VARCHAR(255) NOT NULL,
    "parameters" JSONB NOT NULL DEFAULT '{}',
    "timeoutMinutes" INTEGER NOT NULL DEFAULT 30,
    "retryAttempts" INTEGER NOT NULL DEFAULT 3,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "lastRunAt" TIMESTAMP(3),
    "lastRunStatus" VARCHAR(50),
    "nextRunAt" TIMESTAMP(3),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "ScheduledJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobExecution" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "status" "JobExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "result" JSONB,
    "errorMessage" TEXT,
    "attempt" INTEGER NOT NULL DEFAULT 1,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "JobExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CacheConfig" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "cacheType" "CacheType" NOT NULL,
    "key" VARCHAR(255) NOT NULL,
    "ttlSeconds" INTEGER NOT NULL DEFAULT 3600,
    "tags" TEXT[],
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "CacheConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimit" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "scope" "RateLimitScope" NOT NULL,
    "identifier" VARCHAR(255) NOT NULL,
    "maxRequests" INTEGER NOT NULL,
    "windowSeconds" INTEGER NOT NULL,
    "currentRequests" INTEGER NOT NULL DEFAULT 0,
    "windowStartsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "ticketNumber" VARCHAR(50) NOT NULL,
    "subject" VARCHAR(500) NOT NULL,
    "description" TEXT NOT NULL,
    "source" "TicketSource" NOT NULL,
    "type" "TicketType" NOT NULL,
    "priority" "TicketPriority" NOT NULL DEFAULT 'NORMAL',
    "status" "TicketStatus" NOT NULL DEFAULT 'NEW',
    "requesterId" TEXT,
    "requesterName" VARCHAR(255),
    "requesterEmail" VARCHAR(255),
    "assignedToId" TEXT,
    "teamId" TEXT,
    "firstResponseDue" TIMESTAMP(3),
    "resolutionDue" TIMESTAMP(3),
    "firstRespondedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "resolutionNotes" TEXT,
    "satisfactionRating" INTEGER,
    "satisfactionComment" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketReply" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "replyType" "ReplyType" NOT NULL,
    "body" TEXT NOT NULL,
    "bodyHtml" TEXT,
    "authorId" TEXT,
    "authorName" VARCHAR(255),
    "attachments" JSONB,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "TicketReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KBArticle" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "content" TEXT NOT NULL,
    "summary" VARCHAR(1000),
    "categoryId" TEXT,
    "slug" VARCHAR(500) NOT NULL,
    "keywords" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "unhelpfulCount" INTEGER NOT NULL DEFAULT 0,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "KBArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NPSSurvey" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "surveyNumber" VARCHAR(50) NOT NULL,
    "question" TEXT NOT NULL,
    "followUpQuestion" TEXT,
    "targetType" VARCHAR(50) NOT NULL,
    "scheduledAt" DATE,
    "expiresAt" DATE,
    "status" VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    "responseCount" INTEGER NOT NULL DEFAULT 0,
    "npsScore" INTEGER,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "NPSSurvey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NPSResponse" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "respondentType" VARCHAR(50),
    "respondentId" TEXT,
    "respondentEmail" VARCHAR(255),
    "score" INTEGER NOT NULL,
    "category" "NPSCategory" NOT NULL,
    "feedback" TEXT,
    "followUpResponse" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "NPSResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureRequest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "description" TEXT NOT NULL,
    "submitterId" TEXT,
    "submitterName" VARCHAR(255),
    "submitterEmail" VARCHAR(255),
    "status" "FeatureRequestStatus" NOT NULL DEFAULT 'SUBMITTED',
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "implementedAt" TIMESTAMP(3),
    "releaseNotes" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "FeatureRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CarrierCapacity_tenantId_idx" ON "CarrierCapacity"("tenantId");

-- CreateIndex
CREATE INDEX "CarrierCapacity_carrierId_idx" ON "CarrierCapacity"("carrierId");

-- CreateIndex
CREATE INDEX "CarrierCapacity_equipmentType_idx" ON "CarrierCapacity"("equipmentType");

-- CreateIndex
CREATE INDEX "CarrierCapacity_state_idx" ON "CarrierCapacity"("state");

-- CreateIndex
CREATE INDEX "CarrierCapacity_effectiveDate_idx" ON "CarrierCapacity"("effectiveDate");

-- CreateIndex
CREATE INDEX "CarrierCapacity_status_idx" ON "CarrierCapacity"("status");

-- CreateIndex
CREATE INDEX "CarrierCapacity_externalId_sourceSystem_idx" ON "CarrierCapacity"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "PortalUser_verificationToken_key" ON "PortalUser"("verificationToken");

-- CreateIndex
CREATE INDEX "PortalUser_tenantId_idx" ON "PortalUser"("tenantId");

-- CreateIndex
CREATE INDEX "PortalUser_companyId_idx" ON "PortalUser"("companyId");

-- CreateIndex
CREATE INDEX "PortalUser_email_idx" ON "PortalUser"("email");

-- CreateIndex
CREATE INDEX "PortalUser_status_idx" ON "PortalUser"("status");

-- CreateIndex
CREATE INDEX "PortalUser_externalId_sourceSystem_idx" ON "PortalUser"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "PortalUser_tenantId_email_key" ON "PortalUser"("tenantId", "email");

-- CreateIndex
CREATE INDEX "PortalSession_tenantId_idx" ON "PortalSession"("tenantId");

-- CreateIndex
CREATE INDEX "PortalSession_userId_idx" ON "PortalSession"("userId");

-- CreateIndex
CREATE INDEX "PortalSession_expiresAt_idx" ON "PortalSession"("expiresAt");

-- CreateIndex
CREATE INDEX "PortalSession_refreshTokenHash_idx" ON "PortalSession"("refreshTokenHash");

-- CreateIndex
CREATE INDEX "PortalSession_externalId_sourceSystem_idx" ON "PortalSession"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "QuoteRequest_requestNumber_key" ON "QuoteRequest"("requestNumber");

-- CreateIndex
CREATE UNIQUE INDEX "QuoteRequest_quoteId_key" ON "QuoteRequest"("quoteId");

-- CreateIndex
CREATE INDEX "QuoteRequest_tenantId_idx" ON "QuoteRequest"("tenantId");

-- CreateIndex
CREATE INDEX "QuoteRequest_companyId_idx" ON "QuoteRequest"("companyId");

-- CreateIndex
CREATE INDEX "QuoteRequest_userId_idx" ON "QuoteRequest"("userId");

-- CreateIndex
CREATE INDEX "QuoteRequest_status_idx" ON "QuoteRequest"("status");

-- CreateIndex
CREATE INDEX "QuoteRequest_requestNumber_idx" ON "QuoteRequest"("requestNumber");

-- CreateIndex
CREATE INDEX "QuoteRequest_externalId_sourceSystem_idx" ON "QuoteRequest"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "PortalActivityLog_tenantId_idx" ON "PortalActivityLog"("tenantId");

-- CreateIndex
CREATE INDEX "PortalActivityLog_userId_idx" ON "PortalActivityLog"("userId");

-- CreateIndex
CREATE INDEX "PortalActivityLog_action_idx" ON "PortalActivityLog"("action");

-- CreateIndex
CREATE INDEX "PortalActivityLog_entityType_entityId_idx" ON "PortalActivityLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "PortalActivityLog_createdAt_idx" ON "PortalActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "PortalActivityLog_externalId_sourceSystem_idx" ON "PortalActivityLog"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "PortalPayment_paymentNumber_key" ON "PortalPayment"("paymentNumber");

-- CreateIndex
CREATE INDEX "PortalPayment_tenantId_idx" ON "PortalPayment"("tenantId");

-- CreateIndex
CREATE INDEX "PortalPayment_companyId_idx" ON "PortalPayment"("companyId");

-- CreateIndex
CREATE INDEX "PortalPayment_userId_idx" ON "PortalPayment"("userId");

-- CreateIndex
CREATE INDEX "PortalPayment_status_idx" ON "PortalPayment"("status");

-- CreateIndex
CREATE INDEX "PortalPayment_paymentNumber_idx" ON "PortalPayment"("paymentNumber");

-- CreateIndex
CREATE INDEX "PortalPayment_externalId_sourceSystem_idx" ON "PortalPayment"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "CarrierPortalUser_verificationToken_key" ON "CarrierPortalUser"("verificationToken");

-- CreateIndex
CREATE INDEX "CarrierPortalUser_tenantId_idx" ON "CarrierPortalUser"("tenantId");

-- CreateIndex
CREATE INDEX "CarrierPortalUser_carrierId_idx" ON "CarrierPortalUser"("carrierId");

-- CreateIndex
CREATE INDEX "CarrierPortalUser_email_idx" ON "CarrierPortalUser"("email");

-- CreateIndex
CREATE INDEX "CarrierPortalUser_status_idx" ON "CarrierPortalUser"("status");

-- CreateIndex
CREATE INDEX "CarrierPortalUser_externalId_sourceSystem_idx" ON "CarrierPortalUser"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "CarrierPortalUser_tenantId_email_key" ON "CarrierPortalUser"("tenantId", "email");

-- CreateIndex
CREATE INDEX "CarrierPortalSession_tenantId_idx" ON "CarrierPortalSession"("tenantId");

-- CreateIndex
CREATE INDEX "CarrierPortalSession_userId_idx" ON "CarrierPortalSession"("userId");

-- CreateIndex
CREATE INDEX "CarrierPortalSession_expiresAt_idx" ON "CarrierPortalSession"("expiresAt");

-- CreateIndex
CREATE INDEX "CarrierPortalSession_refreshTokenHash_idx" ON "CarrierPortalSession"("refreshTokenHash");

-- CreateIndex
CREATE INDEX "CarrierPortalSession_externalId_sourceSystem_idx" ON "CarrierPortalSession"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "CarrierPortalDocument_tenantId_idx" ON "CarrierPortalDocument"("tenantId");

-- CreateIndex
CREATE INDEX "CarrierPortalDocument_carrierId_idx" ON "CarrierPortalDocument"("carrierId");

-- CreateIndex
CREATE INDEX "CarrierPortalDocument_userId_idx" ON "CarrierPortalDocument"("userId");

-- CreateIndex
CREATE INDEX "CarrierPortalDocument_loadId_idx" ON "CarrierPortalDocument"("loadId");

-- CreateIndex
CREATE INDEX "CarrierPortalDocument_status_idx" ON "CarrierPortalDocument"("status");

-- CreateIndex
CREATE INDEX "CarrierPortalDocument_documentType_idx" ON "CarrierPortalDocument"("documentType");

-- CreateIndex
CREATE INDEX "CarrierPortalDocument_externalId_sourceSystem_idx" ON "CarrierPortalDocument"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "CarrierInvoiceSubmission_tenantId_idx" ON "CarrierInvoiceSubmission"("tenantId");

-- CreateIndex
CREATE INDEX "CarrierInvoiceSubmission_carrierId_idx" ON "CarrierInvoiceSubmission"("carrierId");

-- CreateIndex
CREATE INDEX "CarrierInvoiceSubmission_userId_idx" ON "CarrierInvoiceSubmission"("userId");

-- CreateIndex
CREATE INDEX "CarrierInvoiceSubmission_loadId_idx" ON "CarrierInvoiceSubmission"("loadId");

-- CreateIndex
CREATE INDEX "CarrierInvoiceSubmission_status_idx" ON "CarrierInvoiceSubmission"("status");

-- CreateIndex
CREATE INDEX "CarrierInvoiceSubmission_invoiceNumber_idx" ON "CarrierInvoiceSubmission"("invoiceNumber");

-- CreateIndex
CREATE INDEX "CarrierInvoiceSubmission_externalId_sourceSystem_idx" ON "CarrierInvoiceSubmission"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "CarrierQuickPayRequest_tenantId_idx" ON "CarrierQuickPayRequest"("tenantId");

-- CreateIndex
CREATE INDEX "CarrierQuickPayRequest_carrierId_idx" ON "CarrierQuickPayRequest"("carrierId");

-- CreateIndex
CREATE INDEX "CarrierQuickPayRequest_userId_idx" ON "CarrierQuickPayRequest"("userId");

-- CreateIndex
CREATE INDEX "CarrierQuickPayRequest_loadId_idx" ON "CarrierQuickPayRequest"("loadId");

-- CreateIndex
CREATE INDEX "CarrierQuickPayRequest_status_idx" ON "CarrierQuickPayRequest"("status");

-- CreateIndex
CREATE INDEX "CarrierQuickPayRequest_externalId_sourceSystem_idx" ON "CarrierQuickPayRequest"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "CarrierPortalActivityLog_tenantId_idx" ON "CarrierPortalActivityLog"("tenantId");

-- CreateIndex
CREATE INDEX "CarrierPortalActivityLog_userId_idx" ON "CarrierPortalActivityLog"("userId");

-- CreateIndex
CREATE INDEX "CarrierPortalActivityLog_action_idx" ON "CarrierPortalActivityLog"("action");

-- CreateIndex
CREATE INDEX "CarrierPortalActivityLog_entityType_entityId_idx" ON "CarrierPortalActivityLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "CarrierPortalActivityLog_createdAt_idx" ON "CarrierPortalActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "CarrierPortalActivityLog_externalId_sourceSystem_idx" ON "CarrierPortalActivityLog"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_contractNumber_key" ON "Contract"("contractNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_documentId_key" ON "Contract"("documentId");

-- CreateIndex
CREATE INDEX "Contract_tenantId_idx" ON "Contract"("tenantId");

-- CreateIndex
CREATE INDEX "Contract_contractNumber_idx" ON "Contract"("contractNumber");

-- CreateIndex
CREATE INDEX "Contract_contractType_idx" ON "Contract"("contractType");

-- CreateIndex
CREATE INDEX "Contract_customerId_idx" ON "Contract"("customerId");

-- CreateIndex
CREATE INDEX "Contract_carrierId_idx" ON "Contract"("carrierId");

-- CreateIndex
CREATE INDEX "Contract_status_idx" ON "Contract"("status");

-- CreateIndex
CREATE INDEX "Contract_effectiveDate_idx" ON "Contract"("effectiveDate");

-- CreateIndex
CREATE INDEX "Contract_expirationDate_idx" ON "Contract"("expirationDate");

-- CreateIndex
CREATE INDEX "Contract_externalId_sourceSystem_idx" ON "Contract"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "FuelSurchargeTable_tenantId_idx" ON "FuelSurchargeTable"("tenantId");

-- CreateIndex
CREATE INDEX "FuelSurchargeTable_contractId_idx" ON "FuelSurchargeTable"("contractId");

-- CreateIndex
CREATE INDEX "FuelSurchargeTable_status_idx" ON "FuelSurchargeTable"("status");

-- CreateIndex
CREATE INDEX "FuelSurchargeTable_effectiveDate_idx" ON "FuelSurchargeTable"("effectiveDate");

-- CreateIndex
CREATE INDEX "FuelSurchargeTable_externalId_sourceSystem_idx" ON "FuelSurchargeTable"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "FuelSurchargeTier_tableId_idx" ON "FuelSurchargeTier"("tableId");

-- CreateIndex
CREATE INDEX "FuelSurchargeTier_externalId_sourceSystem_idx" ON "FuelSurchargeTier"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "FuelSurchargeTier_tableId_tierNumber_key" ON "FuelSurchargeTier"("tableId", "tierNumber");

-- CreateIndex
CREATE INDEX "ContractSLA_tenantId_idx" ON "ContractSLA"("tenantId");

-- CreateIndex
CREATE INDEX "ContractSLA_contractId_idx" ON "ContractSLA"("contractId");

-- CreateIndex
CREATE INDEX "ContractSLA_slaType_idx" ON "ContractSLA"("slaType");

-- CreateIndex
CREATE INDEX "ContractSLA_externalId_sourceSystem_idx" ON "ContractSLA"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "VolumeCommitment_tenantId_idx" ON "VolumeCommitment"("tenantId");

-- CreateIndex
CREATE INDEX "VolumeCommitment_contractId_idx" ON "VolumeCommitment"("contractId");

-- CreateIndex
CREATE INDEX "VolumeCommitment_periodStart_idx" ON "VolumeCommitment"("periodStart");

-- CreateIndex
CREATE INDEX "VolumeCommitment_status_idx" ON "VolumeCommitment"("status");

-- CreateIndex
CREATE INDEX "VolumeCommitment_externalId_sourceSystem_idx" ON "VolumeCommitment"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_agentCode_key" ON "Agent"("agentCode");

-- CreateIndex
CREATE INDEX "Agent_tenantId_idx" ON "Agent"("tenantId");

-- CreateIndex
CREATE INDEX "Agent_agentCode_idx" ON "Agent"("agentCode");

-- CreateIndex
CREATE INDEX "Agent_status_idx" ON "Agent"("status");

-- CreateIndex
CREATE INDEX "Agent_agentType_idx" ON "Agent"("agentType");

-- CreateIndex
CREATE INDEX "Agent_externalId_sourceSystem_idx" ON "Agent"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "AgentAgreement_agreementNumber_key" ON "AgentAgreement"("agreementNumber");

-- CreateIndex
CREATE INDEX "AgentAgreement_tenantId_idx" ON "AgentAgreement"("tenantId");

-- CreateIndex
CREATE INDEX "AgentAgreement_agentId_idx" ON "AgentAgreement"("agentId");

-- CreateIndex
CREATE INDEX "AgentAgreement_status_idx" ON "AgentAgreement"("status");

-- CreateIndex
CREATE INDEX "AgentAgreement_effectiveDate_idx" ON "AgentAgreement"("effectiveDate");

-- CreateIndex
CREATE INDEX "AgentAgreement_externalId_sourceSystem_idx" ON "AgentAgreement"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "AgentCustomerAssignment_tenantId_idx" ON "AgentCustomerAssignment"("tenantId");

-- CreateIndex
CREATE INDEX "AgentCustomerAssignment_agentId_idx" ON "AgentCustomerAssignment"("agentId");

-- CreateIndex
CREATE INDEX "AgentCustomerAssignment_customerId_idx" ON "AgentCustomerAssignment"("customerId");

-- CreateIndex
CREATE INDEX "AgentCustomerAssignment_status_idx" ON "AgentCustomerAssignment"("status");

-- CreateIndex
CREATE INDEX "AgentCustomerAssignment_assignmentType_idx" ON "AgentCustomerAssignment"("assignmentType");

-- CreateIndex
CREATE INDEX "AgentCustomerAssignment_externalId_sourceSystem_idx" ON "AgentCustomerAssignment"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "AgentCommission_tenantId_idx" ON "AgentCommission"("tenantId");

-- CreateIndex
CREATE INDEX "AgentCommission_agentId_idx" ON "AgentCommission"("agentId");

-- CreateIndex
CREATE INDEX "AgentCommission_loadId_idx" ON "AgentCommission"("loadId");

-- CreateIndex
CREATE INDEX "AgentCommission_orderId_idx" ON "AgentCommission"("orderId");

-- CreateIndex
CREATE INDEX "AgentCommission_status_idx" ON "AgentCommission"("status");

-- CreateIndex
CREATE INDEX "AgentCommission_commissionPeriod_idx" ON "AgentCommission"("commissionPeriod");

-- CreateIndex
CREATE INDEX "AgentCommission_externalId_sourceSystem_idx" ON "AgentCommission"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "FactoringCompany_companyCode_key" ON "FactoringCompany"("companyCode");

-- CreateIndex
CREATE INDEX "FactoringCompany_tenantId_idx" ON "FactoringCompany"("tenantId");

-- CreateIndex
CREATE INDEX "FactoringCompany_companyCode_idx" ON "FactoringCompany"("companyCode");

-- CreateIndex
CREATE INDEX "FactoringCompany_status_idx" ON "FactoringCompany"("status");

-- CreateIndex
CREATE INDEX "FactoringCompany_externalId_sourceSystem_idx" ON "FactoringCompany"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "NOARecord_noaNumber_key" ON "NOARecord"("noaNumber");

-- CreateIndex
CREATE INDEX "NOARecord_tenantId_idx" ON "NOARecord"("tenantId");

-- CreateIndex
CREATE INDEX "NOARecord_carrierId_idx" ON "NOARecord"("carrierId");

-- CreateIndex
CREATE INDEX "NOARecord_factoringCompanyId_idx" ON "NOARecord"("factoringCompanyId");

-- CreateIndex
CREATE INDEX "NOARecord_noaNumber_idx" ON "NOARecord"("noaNumber");

-- CreateIndex
CREATE INDEX "NOARecord_status_idx" ON "NOARecord"("status");

-- CreateIndex
CREATE INDEX "NOARecord_effectiveDate_idx" ON "NOARecord"("effectiveDate");

-- CreateIndex
CREATE INDEX "NOARecord_externalId_sourceSystem_idx" ON "NOARecord"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "CarrierFactoringStatus_carrierId_key" ON "CarrierFactoringStatus"("carrierId");

-- CreateIndex
CREATE INDEX "CarrierFactoringStatus_tenantId_idx" ON "CarrierFactoringStatus"("tenantId");

-- CreateIndex
CREATE INDEX "CarrierFactoringStatus_carrierId_idx" ON "CarrierFactoringStatus"("carrierId");

-- CreateIndex
CREATE INDEX "CarrierFactoringStatus_factoringCompanyId_idx" ON "CarrierFactoringStatus"("factoringCompanyId");

-- CreateIndex
CREATE INDEX "CarrierFactoringStatus_factoringStatus_idx" ON "CarrierFactoringStatus"("factoringStatus");

-- CreateIndex
CREATE INDEX "CarrierFactoringStatus_externalId_sourceSystem_idx" ON "CarrierFactoringStatus"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_userId_key" ON "Employee"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employeeNumber_key" ON "Employee"("employeeNumber");

-- CreateIndex
CREATE INDEX "Employee_tenantId_idx" ON "Employee"("tenantId");

-- CreateIndex
CREATE INDEX "Employee_userId_idx" ON "Employee"("userId");

-- CreateIndex
CREATE INDEX "Employee_departmentId_idx" ON "Employee"("departmentId");

-- CreateIndex
CREATE INDEX "Employee_managerId_idx" ON "Employee"("managerId");

-- CreateIndex
CREATE INDEX "Employee_employmentStatus_idx" ON "Employee"("employmentStatus");

-- CreateIndex
CREATE INDEX "Employee_externalId_sourceSystem_idx" ON "Employee"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_tenantId_employeeNumber_key" ON "Employee"("tenantId", "employeeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");

-- CreateIndex
CREATE INDEX "Department_tenantId_idx" ON "Department"("tenantId");

-- CreateIndex
CREATE INDEX "Department_parentDepartmentId_idx" ON "Department"("parentDepartmentId");

-- CreateIndex
CREATE INDEX "Department_status_idx" ON "Department"("status");

-- CreateIndex
CREATE INDEX "Department_externalId_sourceSystem_idx" ON "Department"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "Department_tenantId_code_key" ON "Department"("tenantId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Position_code_key" ON "Position"("code");

-- CreateIndex
CREATE INDEX "Position_tenantId_idx" ON "Position"("tenantId");

-- CreateIndex
CREATE INDEX "Position_status_idx" ON "Position"("status");

-- CreateIndex
CREATE INDEX "Position_externalId_sourceSystem_idx" ON "Position"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "Position_tenantId_code_key" ON "Position"("tenantId", "code");

-- CreateIndex
CREATE INDEX "TimeOffRequest_tenantId_idx" ON "TimeOffRequest"("tenantId");

-- CreateIndex
CREATE INDEX "TimeOffRequest_employeeId_idx" ON "TimeOffRequest"("employeeId");

-- CreateIndex
CREATE INDEX "TimeOffRequest_status_idx" ON "TimeOffRequest"("status");

-- CreateIndex
CREATE INDEX "TimeOffRequest_startDate_idx" ON "TimeOffRequest"("startDate");

-- CreateIndex
CREATE INDEX "TimeOffRequest_externalId_sourceSystem_idx" ON "TimeOffRequest"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "KPIDefinition_code_key" ON "KPIDefinition"("code");

-- CreateIndex
CREATE INDEX "KPIDefinition_tenantId_idx" ON "KPIDefinition"("tenantId");

-- CreateIndex
CREATE INDEX "KPIDefinition_category_idx" ON "KPIDefinition"("category");

-- CreateIndex
CREATE INDEX "KPIDefinition_status_idx" ON "KPIDefinition"("status");

-- CreateIndex
CREATE INDEX "KPIDefinition_externalId_sourceSystem_idx" ON "KPIDefinition"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "KPIDefinition_tenantId_code_key" ON "KPIDefinition"("tenantId", "code");

-- CreateIndex
CREATE INDEX "Dashboard_tenantId_idx" ON "Dashboard"("tenantId");

-- CreateIndex
CREATE INDEX "Dashboard_ownerId_idx" ON "Dashboard"("ownerId");

-- CreateIndex
CREATE INDEX "Dashboard_status_idx" ON "Dashboard"("status");

-- CreateIndex
CREATE INDEX "Dashboard_externalId_sourceSystem_idx" ON "Dashboard"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "Report_tenantId_idx" ON "Report"("tenantId");

-- CreateIndex
CREATE INDEX "Report_reportType_idx" ON "Report"("reportType");

-- CreateIndex
CREATE INDEX "Report_ownerId_idx" ON "Report"("ownerId");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE INDEX "Report_externalId_sourceSystem_idx" ON "Report"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "Workflow_tenantId_idx" ON "Workflow"("tenantId");

-- CreateIndex
CREATE INDEX "Workflow_triggerType_idx" ON "Workflow"("triggerType");

-- CreateIndex
CREATE INDEX "Workflow_status_idx" ON "Workflow"("status");

-- CreateIndex
CREATE INDEX "Workflow_externalId_sourceSystem_idx" ON "Workflow"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "WorkflowExecution_tenantId_idx" ON "WorkflowExecution"("tenantId");

-- CreateIndex
CREATE INDEX "WorkflowExecution_workflowId_idx" ON "WorkflowExecution"("workflowId");

-- CreateIndex
CREATE INDEX "WorkflowExecution_status_idx" ON "WorkflowExecution"("status");

-- CreateIndex
CREATE INDEX "WorkflowExecution_createdAt_idx" ON "WorkflowExecution"("createdAt");

-- CreateIndex
CREATE INDEX "WorkflowExecution_externalId_sourceSystem_idx" ON "WorkflowExecution"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "ApprovalRequest_tenantId_idx" ON "ApprovalRequest"("tenantId");

-- CreateIndex
CREATE INDEX "ApprovalRequest_status_idx" ON "ApprovalRequest"("status");

-- CreateIndex
CREATE INDEX "ApprovalRequest_entityType_entityId_idx" ON "ApprovalRequest"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "ApprovalRequest_externalId_sourceSystem_idx" ON "ApprovalRequest"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalRequest_tenantId_requestNumber_key" ON "ApprovalRequest"("tenantId", "requestNumber");

-- CreateIndex
CREATE INDEX "Integration_tenantId_idx" ON "Integration"("tenantId");

-- CreateIndex
CREATE INDEX "Integration_category_idx" ON "Integration"("category");

-- CreateIndex
CREATE INDEX "Integration_provider_idx" ON "Integration"("provider");

-- CreateIndex
CREATE INDEX "Integration_status_idx" ON "Integration"("status");

-- CreateIndex
CREATE INDEX "Integration_externalId_sourceSystem_idx" ON "Integration"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "WebhookEndpoint_tenantId_idx" ON "WebhookEndpoint"("tenantId");

-- CreateIndex
CREATE INDEX "WebhookEndpoint_status_idx" ON "WebhookEndpoint"("status");

-- CreateIndex
CREATE INDEX "WebhookEndpoint_externalId_sourceSystem_idx" ON "WebhookEndpoint"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "WebhookDelivery_tenantId_idx" ON "WebhookDelivery"("tenantId");

-- CreateIndex
CREATE INDEX "WebhookDelivery_endpointId_idx" ON "WebhookDelivery"("endpointId");

-- CreateIndex
CREATE INDEX "WebhookDelivery_integrationId_idx" ON "WebhookDelivery"("integrationId");

-- CreateIndex
CREATE INDEX "WebhookDelivery_status_idx" ON "WebhookDelivery"("status");

-- CreateIndex
CREATE INDEX "WebhookDelivery_event_idx" ON "WebhookDelivery"("event");

-- CreateIndex
CREATE INDEX "WebhookDelivery_createdAt_idx" ON "WebhookDelivery"("createdAt");

-- CreateIndex
CREATE INDEX "WebhookDelivery_externalId_sourceSystem_idx" ON "WebhookDelivery"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "SavedSearch_tenantId_idx" ON "SavedSearch"("tenantId");

-- CreateIndex
CREATE INDEX "SavedSearch_userId_idx" ON "SavedSearch"("userId");

-- CreateIndex
CREATE INDEX "SavedSearch_entityType_idx" ON "SavedSearch"("entityType");

-- CreateIndex
CREATE INDEX "SavedSearch_externalId_sourceSystem_idx" ON "SavedSearch"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "SearchHistory_tenantId_idx" ON "SearchHistory"("tenantId");

-- CreateIndex
CREATE INDEX "SearchHistory_userId_idx" ON "SearchHistory"("userId");

-- CreateIndex
CREATE INDEX "SearchHistory_entityType_idx" ON "SearchHistory"("entityType");

-- CreateIndex
CREATE INDEX "SearchHistory_searchTerm_idx" ON "SearchHistory"("searchTerm");

-- CreateIndex
CREATE INDEX "SearchHistory_createdAt_idx" ON "SearchHistory"("createdAt");

-- CreateIndex
CREATE INDEX "SearchHistory_externalId_sourceSystem_idx" ON "SearchHistory"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_idx" ON "AuditLog"("tenantId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_category_idx" ON "AuditLog"("category");

-- CreateIndex
CREATE INDEX "AuditLog_severity_idx" ON "AuditLog"("severity");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_externalId_sourceSystem_idx" ON "AuditLog"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "ChangeHistory_tenantId_idx" ON "ChangeHistory"("tenantId");

-- CreateIndex
CREATE INDEX "ChangeHistory_userId_idx" ON "ChangeHistory"("userId");

-- CreateIndex
CREATE INDEX "ChangeHistory_entityType_entityId_idx" ON "ChangeHistory"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "ChangeHistory_field_idx" ON "ChangeHistory"("field");

-- CreateIndex
CREATE INDEX "ChangeHistory_createdAt_idx" ON "ChangeHistory"("createdAt");

-- CreateIndex
CREATE INDEX "ChangeHistory_externalId_sourceSystem_idx" ON "ChangeHistory"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "SystemConfig_key_key" ON "SystemConfig"("key");

-- CreateIndex
CREATE INDEX "SystemConfig_category_idx" ON "SystemConfig"("category");

-- CreateIndex
CREATE INDEX "SystemConfig_key_idx" ON "SystemConfig"("key");

-- CreateIndex
CREATE INDEX "SystemConfig_externalId_sourceSystem_idx" ON "SystemConfig"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureFlag_key_key" ON "FeatureFlag"("key");

-- CreateIndex
CREATE INDEX "FeatureFlag_key_idx" ON "FeatureFlag"("key");

-- CreateIndex
CREATE INDEX "FeatureFlag_status_idx" ON "FeatureFlag"("status");

-- CreateIndex
CREATE INDEX "FeatureFlag_enabled_idx" ON "FeatureFlag"("enabled");

-- CreateIndex
CREATE INDEX "FeatureFlag_externalId_sourceSystem_idx" ON "FeatureFlag"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "ScheduledJob_tenantId_idx" ON "ScheduledJob"("tenantId");

-- CreateIndex
CREATE INDEX "ScheduledJob_jobType_idx" ON "ScheduledJob"("jobType");

-- CreateIndex
CREATE INDEX "ScheduledJob_status_idx" ON "ScheduledJob"("status");

-- CreateIndex
CREATE INDEX "ScheduledJob_nextRunAt_idx" ON "ScheduledJob"("nextRunAt");

-- CreateIndex
CREATE INDEX "ScheduledJob_externalId_sourceSystem_idx" ON "ScheduledJob"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "JobExecution_jobId_idx" ON "JobExecution"("jobId");

-- CreateIndex
CREATE INDEX "JobExecution_status_idx" ON "JobExecution"("status");

-- CreateIndex
CREATE INDEX "JobExecution_startedAt_idx" ON "JobExecution"("startedAt");

-- CreateIndex
CREATE INDEX "JobExecution_externalId_sourceSystem_idx" ON "JobExecution"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "CacheConfig_tenantId_idx" ON "CacheConfig"("tenantId");

-- CreateIndex
CREATE INDEX "CacheConfig_cacheType_idx" ON "CacheConfig"("cacheType");

-- CreateIndex
CREATE INDEX "CacheConfig_externalId_sourceSystem_idx" ON "CacheConfig"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "CacheConfig_tenantId_cacheType_key_key" ON "CacheConfig"("tenantId", "cacheType", "key");

-- CreateIndex
CREATE INDEX "RateLimit_tenantId_idx" ON "RateLimit"("tenantId");

-- CreateIndex
CREATE INDEX "RateLimit_scope_idx" ON "RateLimit"("scope");

-- CreateIndex
CREATE INDEX "RateLimit_identifier_idx" ON "RateLimit"("identifier");

-- CreateIndex
CREATE INDEX "RateLimit_windowStartsAt_idx" ON "RateLimit"("windowStartsAt");

-- CreateIndex
CREATE INDEX "RateLimit_externalId_sourceSystem_idx" ON "RateLimit"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "RateLimit_scope_identifier_key" ON "RateLimit"("scope", "identifier");

-- CreateIndex
CREATE UNIQUE INDEX "SupportTicket_ticketNumber_key" ON "SupportTicket"("ticketNumber");

-- CreateIndex
CREATE INDEX "SupportTicket_tenantId_idx" ON "SupportTicket"("tenantId");

-- CreateIndex
CREATE INDEX "SupportTicket_ticketNumber_idx" ON "SupportTicket"("ticketNumber");

-- CreateIndex
CREATE INDEX "SupportTicket_status_idx" ON "SupportTicket"("status");

-- CreateIndex
CREATE INDEX "SupportTicket_priority_idx" ON "SupportTicket"("priority");

-- CreateIndex
CREATE INDEX "SupportTicket_assignedToId_idx" ON "SupportTicket"("assignedToId");

-- CreateIndex
CREATE INDEX "SupportTicket_createdAt_idx" ON "SupportTicket"("createdAt");

-- CreateIndex
CREATE INDEX "SupportTicket_externalId_sourceSystem_idx" ON "SupportTicket"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "TicketReply_tenantId_idx" ON "TicketReply"("tenantId");

-- CreateIndex
CREATE INDEX "TicketReply_ticketId_idx" ON "TicketReply"("ticketId");

-- CreateIndex
CREATE INDEX "TicketReply_replyType_idx" ON "TicketReply"("replyType");

-- CreateIndex
CREATE INDEX "TicketReply_createdAt_idx" ON "TicketReply"("createdAt");

-- CreateIndex
CREATE INDEX "TicketReply_externalId_sourceSystem_idx" ON "TicketReply"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "KBArticle_tenantId_idx" ON "KBArticle"("tenantId");

-- CreateIndex
CREATE INDEX "KBArticle_categoryId_idx" ON "KBArticle"("categoryId");

-- CreateIndex
CREATE INDEX "KBArticle_isPublished_idx" ON "KBArticle"("isPublished");

-- CreateIndex
CREATE INDEX "KBArticle_externalId_sourceSystem_idx" ON "KBArticle"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "KBArticle_tenantId_slug_key" ON "KBArticle"("tenantId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "NPSSurvey_surveyNumber_key" ON "NPSSurvey"("surveyNumber");

-- CreateIndex
CREATE INDEX "NPSSurvey_tenantId_idx" ON "NPSSurvey"("tenantId");

-- CreateIndex
CREATE INDEX "NPSSurvey_status_idx" ON "NPSSurvey"("status");

-- CreateIndex
CREATE INDEX "NPSSurvey_scheduledAt_idx" ON "NPSSurvey"("scheduledAt");

-- CreateIndex
CREATE INDEX "NPSSurvey_externalId_sourceSystem_idx" ON "NPSSurvey"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "NPSResponse_tenantId_idx" ON "NPSResponse"("tenantId");

-- CreateIndex
CREATE INDEX "NPSResponse_surveyId_idx" ON "NPSResponse"("surveyId");

-- CreateIndex
CREATE INDEX "NPSResponse_category_idx" ON "NPSResponse"("category");

-- CreateIndex
CREATE INDEX "NPSResponse_score_idx" ON "NPSResponse"("score");

-- CreateIndex
CREATE INDEX "NPSResponse_createdAt_idx" ON "NPSResponse"("createdAt");

-- CreateIndex
CREATE INDEX "NPSResponse_externalId_sourceSystem_idx" ON "NPSResponse"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "FeatureRequest_tenantId_idx" ON "FeatureRequest"("tenantId");

-- CreateIndex
CREATE INDEX "FeatureRequest_status_idx" ON "FeatureRequest"("status");

-- CreateIndex
CREATE INDEX "FeatureRequest_voteCount_idx" ON "FeatureRequest"("voteCount");

-- CreateIndex
CREATE INDEX "FeatureRequest_createdAt_idx" ON "FeatureRequest"("createdAt");

-- CreateIndex
CREATE INDEX "FeatureRequest_externalId_sourceSystem_idx" ON "FeatureRequest"("externalId", "sourceSystem");

-- AddForeignKey
ALTER TABLE "CarrierCapacity" ADD CONSTRAINT "CarrierCapacity_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierCapacity" ADD CONSTRAINT "CarrierCapacity_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalUser" ADD CONSTRAINT "PortalUser_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalUser" ADD CONSTRAINT "PortalUser_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalSession" ADD CONSTRAINT "PortalSession_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalSession" ADD CONSTRAINT "PortalSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "PortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteRequest" ADD CONSTRAINT "QuoteRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteRequest" ADD CONSTRAINT "QuoteRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteRequest" ADD CONSTRAINT "QuoteRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "PortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteRequest" ADD CONSTRAINT "QuoteRequest_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalActivityLog" ADD CONSTRAINT "PortalActivityLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalActivityLog" ADD CONSTRAINT "PortalActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "PortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalActivityLog" ADD CONSTRAINT "PortalActivityLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalPayment" ADD CONSTRAINT "PortalPayment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalPayment" ADD CONSTRAINT "PortalPayment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalPayment" ADD CONSTRAINT "PortalPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "PortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierPortalUser" ADD CONSTRAINT "CarrierPortalUser_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierPortalUser" ADD CONSTRAINT "CarrierPortalUser_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierPortalSession" ADD CONSTRAINT "CarrierPortalSession_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierPortalSession" ADD CONSTRAINT "CarrierPortalSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "CarrierPortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierPortalSession" ADD CONSTRAINT "CarrierPortalSession_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierPortalDocument" ADD CONSTRAINT "CarrierPortalDocument_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierPortalDocument" ADD CONSTRAINT "CarrierPortalDocument_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierPortalDocument" ADD CONSTRAINT "CarrierPortalDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "CarrierPortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierPortalDocument" ADD CONSTRAINT "CarrierPortalDocument_loadId_fkey" FOREIGN KEY ("loadId") REFERENCES "Load"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierInvoiceSubmission" ADD CONSTRAINT "CarrierInvoiceSubmission_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierInvoiceSubmission" ADD CONSTRAINT "CarrierInvoiceSubmission_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierInvoiceSubmission" ADD CONSTRAINT "CarrierInvoiceSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "CarrierPortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierInvoiceSubmission" ADD CONSTRAINT "CarrierInvoiceSubmission_loadId_fkey" FOREIGN KEY ("loadId") REFERENCES "Load"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierInvoiceSubmission" ADD CONSTRAINT "CarrierInvoiceSubmission_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "Settlement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierQuickPayRequest" ADD CONSTRAINT "CarrierQuickPayRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierQuickPayRequest" ADD CONSTRAINT "CarrierQuickPayRequest_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierQuickPayRequest" ADD CONSTRAINT "CarrierQuickPayRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "CarrierPortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierQuickPayRequest" ADD CONSTRAINT "CarrierQuickPayRequest_loadId_fkey" FOREIGN KEY ("loadId") REFERENCES "Load"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierPortalActivityLog" ADD CONSTRAINT "CarrierPortalActivityLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierPortalActivityLog" ADD CONSTRAINT "CarrierPortalActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "CarrierPortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierPortalActivityLog" ADD CONSTRAINT "CarrierPortalActivityLog_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelSurchargeTable" ADD CONSTRAINT "FuelSurchargeTable_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelSurchargeTable" ADD CONSTRAINT "FuelSurchargeTable_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelSurchargeTier" ADD CONSTRAINT "FuelSurchargeTier_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "FuelSurchargeTable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractSLA" ADD CONSTRAINT "ContractSLA_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractSLA" ADD CONSTRAINT "ContractSLA_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolumeCommitment" ADD CONSTRAINT "VolumeCommitment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolumeCommitment" ADD CONSTRAINT "VolumeCommitment_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentAgreement" ADD CONSTRAINT "AgentAgreement_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentAgreement" ADD CONSTRAINT "AgentAgreement_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentCustomerAssignment" ADD CONSTRAINT "AgentCustomerAssignment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentCustomerAssignment" ADD CONSTRAINT "AgentCustomerAssignment_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentCustomerAssignment" ADD CONSTRAINT "AgentCustomerAssignment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentCommission" ADD CONSTRAINT "AgentCommission_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentCommission" ADD CONSTRAINT "AgentCommission_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentCommission" ADD CONSTRAINT "AgentCommission_loadId_fkey" FOREIGN KEY ("loadId") REFERENCES "Load"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentCommission" ADD CONSTRAINT "AgentCommission_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactoringCompany" ADD CONSTRAINT "FactoringCompany_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NOARecord" ADD CONSTRAINT "NOARecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NOARecord" ADD CONSTRAINT "NOARecord_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NOARecord" ADD CONSTRAINT "NOARecord_factoringCompanyId_fkey" FOREIGN KEY ("factoringCompanyId") REFERENCES "FactoringCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierFactoringStatus" ADD CONSTRAINT "CarrierFactoringStatus_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierFactoringStatus" ADD CONSTRAINT "CarrierFactoringStatus_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierFactoringStatus" ADD CONSTRAINT "CarrierFactoringStatus_factoringCompanyId_fkey" FOREIGN KEY ("factoringCompanyId") REFERENCES "FactoringCompany"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_parentDepartmentId_fkey" FOREIGN KEY ("parentDepartmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeOffRequest" ADD CONSTRAINT "TimeOffRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeOffRequest" ADD CONSTRAINT "TimeOffRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KPIDefinition" ADD CONSTRAINT "KPIDefinition_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dashboard" ADD CONSTRAINT "Dashboard_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowExecution" ADD CONSTRAINT "WorkflowExecution_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowExecution" ADD CONSTRAINT "WorkflowExecution_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookEndpoint" ADD CONSTRAINT "WebhookEndpoint_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "WebhookEndpoint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedSearch" ADD CONSTRAINT "SavedSearch_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchHistory" ADD CONSTRAINT "SearchHistory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeHistory" ADD CONSTRAINT "ChangeHistory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledJob" ADD CONSTRAINT "ScheduledJob_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobExecution" ADD CONSTRAINT "JobExecution_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ScheduledJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CacheConfig" ADD CONSTRAINT "CacheConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RateLimit" ADD CONSTRAINT "RateLimit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketReply" ADD CONSTRAINT "TicketReply_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketReply" ADD CONSTRAINT "TicketReply_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KBArticle" ADD CONSTRAINT "KBArticle_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NPSSurvey" ADD CONSTRAINT "NPSSurvey_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NPSResponse" ADD CONSTRAINT "NPSResponse_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NPSResponse" ADD CONSTRAINT "NPSResponse_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "NPSSurvey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureRequest" ADD CONSTRAINT "FeatureRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
