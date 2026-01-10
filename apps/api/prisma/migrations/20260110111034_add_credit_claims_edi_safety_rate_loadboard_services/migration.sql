-- CreateEnum
CREATE TYPE "CreditApplicationStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'CONDITIONAL_APPROVAL', 'DENIED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CreditLimitStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'EXPIRED', 'EXCEEDED');

-- CreateEnum
CREATE TYPE "CreditHoldReason" AS ENUM ('PAYMENT_OVERDUE', 'CREDIT_LIMIT_EXCEEDED', 'FRAUD_SUSPECTED', 'INSUFFICIENT_INSURANCE', 'CARRIER_OOS', 'MANUAL_HOLD');

-- CreateEnum
CREATE TYPE "CollectionActivityType" AS ENUM ('CALL', 'EMAIL', 'LETTER', 'LEGAL_NOTICE', 'COLLECTIONS_AGENCY');

-- CreateEnum
CREATE TYPE "PaymentPlanStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'DEFAULTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ClaimType" AS ENUM ('CARGO_DAMAGE', 'CARGO_LOSS', 'SHORTAGE', 'LATE_DELIVERY', 'OVERCHARGE', 'OTHER');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_INVESTIGATION', 'PENDING_DOCUMENTATION', 'APPROVED', 'DENIED', 'SETTLED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ClaimDisposition" AS ENUM ('CARRIER_LIABILITY', 'SHIPPER_LIABILITY', 'RECEIVER_LIABILITY', 'SHARED_LIABILITY', 'NO_LIABILITY');

-- CreateEnum
CREATE TYPE "SubrogationStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'RECOVERED', 'UNRECOVERABLE', 'CLOSED');

-- CreateEnum
CREATE TYPE "EdiTransactionType" AS ENUM ('EDI_204', 'EDI_214', 'EDI_210', 'EDI_211', 'EDI_990', 'EDI_997', 'EDI_315', 'EDI_322');

-- CreateEnum
CREATE TYPE "EdiDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "EdiMessageStatus" AS ENUM ('PENDING', 'QUEUED', 'SENT', 'DELIVERED', 'ACKNOWLEDGED', 'ERROR', 'REJECTED');

-- CreateEnum
CREATE TYPE "EdiCommunicationProtocol" AS ENUM ('FTP', 'SFTP', 'FTPS', 'AS2', 'HTTPS', 'VAN');

-- CreateEnum
CREATE TYPE "EdiValidationStatus" AS ENUM ('VALID', 'WARNING', 'ERROR');

-- CreateEnum
CREATE TYPE "SaferDataStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'OUT_OF_SERVICE');

-- CreateEnum
CREATE TYPE "CSABasicType" AS ENUM ('UNSAFE_DRIVING', 'HOS_COMPLIANCE', 'DRIVER_FITNESS', 'CONTROLLED_SUBSTANCES', 'VEHICLE_MAINTENANCE', 'HAZMAT_COMPLIANCE', 'CRASH_INDICATOR');

-- CreateEnum
CREATE TYPE "InsuranceType" AS ENUM ('AUTO_LIABILITY', 'CARGO', 'GENERAL_LIABILITY', 'WORKERS_COMP', 'UMBRELLA', 'BOND');

-- CreateEnum
CREATE TYPE "DQFDocumentType" AS ENUM ('APPLICATION', 'MVR', 'PSP', 'MEDICAL_CARD', 'DRUG_TEST', 'ROAD_TEST', 'CLEARINGHOUSE', 'EMPLOYMENT_VERIFICATION');

-- CreateEnum
CREATE TYPE "SafetyIncidentType" AS ENUM ('ACCIDENT', 'CITATION', 'INSPECTION_VIOLATION', 'DOT_AUDIT_FINDING', 'INSURANCE_CLAIM');

-- CreateEnum
CREATE TYPE "SafetyAlertType" AS ENUM ('INSURANCE_EXPIRING', 'AUTHORITY_EXPIRING', 'CSA_THRESHOLD_EXCEEDED', 'OUT_OF_SERVICE', 'VIOLATION_PATTERN');

-- CreateEnum
CREATE TYPE "RateProvider" AS ENUM ('DAT', 'TRUCKSTOP', 'INTERNAL');

-- CreateEnum
CREATE TYPE "AlertCondition" AS ENUM ('RATE_INCREASE', 'RATE_DECREASE', 'RATE_THRESHOLD');

-- CreateEnum
CREATE TYPE "LoadBoardProviderType" AS ENUM ('DAT', 'TRUCKSTOP', 'SYLECTUS', 'TRUCKER_TOOLS', 'LOAD_BOARD');

-- CreateEnum
CREATE TYPE "LoadPostStatus" AS ENUM ('DRAFT', 'POSTED', 'RESPONDED', 'COVERED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PostLeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUOTED', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "PostingFrequency" AS ENUM ('IMMEDIATE', 'HOURLY', 'DAILY', 'MANUAL');

-- CreateTable
CREATE TABLE "CreditApplication" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "customerId" TEXT,
    "applicationNumber" VARCHAR(50) NOT NULL,
    "status" "CreditApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "requestedLimit" DECIMAL(12,2) NOT NULL,
    "approvedLimit" DECIMAL(12,2),
    "businessName" VARCHAR(255) NOT NULL,
    "dbaName" VARCHAR(255),
    "federalTaxId" VARCHAR(20),
    "dunsNumber" VARCHAR(20),
    "yearsInBusiness" INTEGER,
    "businessType" VARCHAR(100),
    "annualRevenue" DECIMAL(15,2),
    "bankName" VARCHAR(255),
    "bankAccountNumber" VARCHAR(100),
    "bankContactName" VARCHAR(255),
    "bankContactPhone" VARCHAR(20),
    "tradeReferences" JSONB,
    "ownerName" VARCHAR(255),
    "ownerSSN" VARCHAR(20),
    "ownerAddress" TEXT,
    "creditScore" INTEGER,
    "creditCheckDate" TIMESTAMP(3),
    "creditReportUrl" VARCHAR(500),
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "denialReason" TEXT,
    "conditions" TEXT,
    "approvedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "CreditApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditLimit" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "customerId" TEXT,
    "creditLimit" DECIMAL(12,2) NOT NULL,
    "availableCredit" DECIMAL(12,2) NOT NULL,
    "usedCredit" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" "CreditLimitStatus" NOT NULL DEFAULT 'ACTIVE',
    "paymentTerms" VARCHAR(100),
    "gracePeriodDays" INTEGER NOT NULL DEFAULT 0,
    "singleLoadLimit" DECIMAL(12,2),
    "monthlyLimit" DECIMAL(12,2),
    "lastReviewDate" TIMESTAMP(3),
    "nextReviewDate" TIMESTAMP(3),
    "reviewFrequencyDays" INTEGER NOT NULL DEFAULT 90,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "CreditLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditHold" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "customerId" TEXT,
    "reason" "CreditHoldReason" NOT NULL,
    "description" TEXT,
    "amountHeld" DECIMAL(12,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolutionNotes" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "CreditHold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectionActivity" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "customerId" TEXT,
    "invoiceId" TEXT,
    "activityType" "CollectionActivityType" NOT NULL,
    "subject" VARCHAR(500),
    "description" TEXT,
    "outcome" TEXT,
    "contactedName" VARCHAR(255),
    "contactedTitle" VARCHAR(100),
    "contactedPhone" VARCHAR(20),
    "contactedEmail" VARCHAR(255),
    "followUpDate" TIMESTAMP(3),
    "followUpNotes" TEXT,
    "promisedPaymentDate" TIMESTAMP(3),
    "promisedAmount" DECIMAL(12,2),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "CollectionActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentPlan" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "customerId" TEXT,
    "planNumber" VARCHAR(50) NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "amountPaid" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "remainingBalance" DECIMAL(12,2) NOT NULL,
    "installmentAmount" DECIMAL(12,2) NOT NULL,
    "installmentCount" INTEGER NOT NULL,
    "installmentsPaid" INTEGER NOT NULL DEFAULT 0,
    "status" "PaymentPlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "firstPaymentDate" DATE NOT NULL,
    "frequency" VARCHAR(50) NOT NULL,
    "nextPaymentDate" DATE,
    "interestRate" DECIMAL(5,2),
    "lateFeePct" DECIMAL(5,2),
    "lateFeeFixed" DECIMAL(10,2),
    "invoiceIds" JSONB,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "defaultedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "PaymentPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "loadId" TEXT,
    "orderId" TEXT,
    "carrierId" TEXT,
    "companyId" TEXT,
    "claimNumber" VARCHAR(50) NOT NULL,
    "claimType" "ClaimType" NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'DRAFT',
    "disposition" "ClaimDisposition",
    "claimedAmount" DECIMAL(12,2) NOT NULL,
    "approvedAmount" DECIMAL(12,2),
    "paidAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "incidentDate" DATE NOT NULL,
    "incidentLocation" VARCHAR(500),
    "description" TEXT NOT NULL,
    "claimantName" VARCHAR(255) NOT NULL,
    "claimantCompany" VARCHAR(255),
    "claimantEmail" VARCHAR(255),
    "claimantPhone" VARCHAR(20),
    "filedDate" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receivedDate" DATE,
    "dueDate" DATE,
    "closedDate" DATE,
    "assignedToId" TEXT,
    "investigationNotes" TEXT,
    "rootCause" TEXT,
    "preventionNotes" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimItem" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalValue" DECIMAL(12,2) NOT NULL,
    "damageType" VARCHAR(100),
    "damageExtent" VARCHAR(100),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "ClaimItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimDocument" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "documentType" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "ClaimDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimNote" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "noteType" VARCHAR(50),
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "ClaimNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimTimeline" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "eventType" VARCHAR(100) NOT NULL,
    "eventData" JSONB,
    "description" VARCHAR(500),
    "oldValue" VARCHAR(500),
    "newValue" VARCHAR(500),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "ClaimTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimAdjustment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "adjustmentType" VARCHAR(100) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "ClaimAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubrogationRecord" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "targetParty" VARCHAR(255) NOT NULL,
    "targetPartyType" VARCHAR(100) NOT NULL,
    "amountSought" DECIMAL(12,2) NOT NULL,
    "amountRecovered" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" "SubrogationStatus" NOT NULL DEFAULT 'PENDING',
    "attorneyName" VARCHAR(255),
    "attorneyFirm" VARCHAR(255),
    "caseNumber" VARCHAR(100),
    "filingDate" DATE,
    "settlementDate" DATE,
    "settlementAmount" DECIMAL(12,2),
    "closedDate" DATE,
    "closureReason" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "SubrogationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimContact" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "contactType" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "company" VARCHAR(255),
    "title" VARCHAR(100),
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "address" TEXT,
    "notes" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "ClaimContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EdiTradingPartner" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "partnerName" VARCHAR(255) NOT NULL,
    "partnerType" VARCHAR(50) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isaId" VARCHAR(15) NOT NULL,
    "gsId" VARCHAR(15),
    "duns" VARCHAR(9),
    "scac" VARCHAR(4),
    "protocol" "EdiCommunicationProtocol" NOT NULL,
    "ftpHost" VARCHAR(255),
    "ftpPort" INTEGER,
    "ftpUsername" VARCHAR(100),
    "ftpPassword" VARCHAR(500),
    "ftpInboundPath" VARCHAR(500),
    "ftpOutboundPath" VARCHAR(500),
    "as2Url" VARCHAR(500),
    "as2Identifier" VARCHAR(255),
    "vanMailbox" VARCHAR(100),
    "sendFunctionalAck" BOOLEAN NOT NULL DEFAULT true,
    "requireFunctionalAck" BOOLEAN NOT NULL DEFAULT true,
    "testMode" BOOLEAN NOT NULL DEFAULT false,
    "fieldMappings" JSONB,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "EdiTradingPartner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EdiMessage" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "tradingPartnerId" TEXT NOT NULL,
    "messageId" VARCHAR(100) NOT NULL,
    "transactionType" "EdiTransactionType" NOT NULL,
    "direction" "EdiDirection" NOT NULL,
    "status" "EdiMessageStatus" NOT NULL DEFAULT 'PENDING',
    "isaControlNumber" VARCHAR(9) NOT NULL,
    "gsControlNumber" VARCHAR(9) NOT NULL,
    "stControlNumber" VARCHAR(9) NOT NULL,
    "entityType" VARCHAR(50),
    "entityId" TEXT,
    "rawContent" TEXT NOT NULL,
    "parsedContent" JSONB,
    "processedAt" TIMESTAMP(3),
    "validationStatus" "EdiValidationStatus",
    "validationErrors" JSONB,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "lastRetryAt" TIMESTAMP(3),
    "functionalAckId" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "EdiMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EdiTransactionMapping" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "tradingPartnerId" TEXT NOT NULL,
    "transactionType" "EdiTransactionType" NOT NULL,
    "fieldMappings" JSONB NOT NULL,
    "defaultValues" JSONB,
    "transformRules" JSONB,
    "validationRules" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "EdiTransactionMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EdiControlNumber" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "controlType" VARCHAR(10) NOT NULL,
    "currentNumber" INTEGER NOT NULL DEFAULT 0,
    "prefix" VARCHAR(10),
    "suffix" VARCHAR(10),
    "minValue" INTEGER NOT NULL DEFAULT 1,
    "maxValue" INTEGER NOT NULL DEFAULT 999999999,
    "tradingPartnerId" TEXT,
    "transactionType" "EdiTransactionType",
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "EdiControlNumber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EdiBatch" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "batchNumber" VARCHAR(50) NOT NULL,
    "batchType" VARCHAR(50) NOT NULL,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "processedCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "status" VARCHAR(50) NOT NULL,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "EdiBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EdiBatchMessage" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "EdiBatchMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EdiCommunicationLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "tradingPartnerId" TEXT NOT NULL,
    "direction" "EdiDirection" NOT NULL,
    "protocol" "EdiCommunicationProtocol" NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "fileName" VARCHAR(500),
    "fileSize" INTEGER,
    "messageCount" INTEGER,
    "responseCode" VARCHAR(50),
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "EdiCommunicationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EdiEventTrigger" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "triggerName" VARCHAR(255) NOT NULL,
    "eventType" VARCHAR(100) NOT NULL,
    "transactionType" "EdiTransactionType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "conditions" JSONB,
    "targetPartners" JSONB,
    "messageTemplate" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "EdiEventTrigger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EdiCodeList" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "listName" VARCHAR(100) NOT NULL,
    "ediCode" VARCHAR(50) NOT NULL,
    "internalCode" VARCHAR(50) NOT NULL,
    "description" VARCHAR(500),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tradingPartnerId" TEXT,
    "transactionType" "EdiTransactionType",
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "EdiCodeList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EdiAcknowledgment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "originalMessageId" TEXT NOT NULL,
    "ackControlNumber" VARCHAR(9) NOT NULL,
    "ackStatus" VARCHAR(50) NOT NULL,
    "errorCodes" JSONB,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "EdiAcknowledgment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EdiError" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "errorType" VARCHAR(100) NOT NULL,
    "errorCode" VARCHAR(50),
    "errorMessage" TEXT NOT NULL,
    "segment" VARCHAR(10),
    "elementPath" VARCHAR(255),
    "severity" VARCHAR(20) NOT NULL,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "EdiError_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FmcsaCarrierRecord" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "carrierId" TEXT NOT NULL,
    "dotNumber" VARCHAR(20),
    "mcNumber" VARCHAR(20),
    "legalName" VARCHAR(255),
    "dbaName" VARCHAR(255),
    "operatingStatus" "SaferDataStatus",
    "outOfServiceDate" TIMESTAMP(3),
    "commonAuthority" BOOLEAN NOT NULL DEFAULT false,
    "contractAuthority" BOOLEAN NOT NULL DEFAULT false,
    "brokerAuthority" BOOLEAN NOT NULL DEFAULT false,
    "physicalAddress" TEXT,
    "physicalCity" VARCHAR(100),
    "physicalState" VARCHAR(2),
    "physicalZip" VARCHAR(10),
    "mailingAddress" TEXT,
    "mailingCity" VARCHAR(100),
    "mailingState" VARCHAR(2),
    "mailingZip" VARCHAR(10),
    "phone" VARCHAR(20),
    "powerUnitCount" INTEGER,
    "driverCount" INTEGER,
    "saferDataJson" JSONB,
    "lastSyncedAt" TIMESTAMP(3),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "FmcsaCarrierRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CsaScore" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "carrierId" TEXT NOT NULL,
    "fmcsaRecordId" TEXT,
    "basicType" "CSABasicType" NOT NULL,
    "score" DECIMAL(5,2),
    "percentile" INTEGER,
    "threshold" INTEGER,
    "isAboveThreshold" BOOLEAN NOT NULL DEFAULT false,
    "isAlert" BOOLEAN NOT NULL DEFAULT false,
    "inspectionCount" INTEGER NOT NULL DEFAULT 0,
    "violationCount" INTEGER NOT NULL DEFAULT 0,
    "oosViolationCount" INTEGER NOT NULL DEFAULT 0,
    "measurementPeriod" VARCHAR(50),
    "asOfDate" DATE NOT NULL,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "CsaScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarrierInsurance" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "carrierId" TEXT NOT NULL,
    "insuranceType" "InsuranceType" NOT NULL,
    "policyNumber" VARCHAR(100) NOT NULL,
    "carrierName" VARCHAR(255) NOT NULL,
    "coverageAmount" DECIMAL(15,2) NOT NULL,
    "effectiveDate" DATE NOT NULL,
    "expirationDate" DATE NOT NULL,
    "isExpired" BOOLEAN NOT NULL DEFAULT false,
    "agentName" VARCHAR(255),
    "agentPhone" VARCHAR(20),
    "agentEmail" VARCHAR(255),
    "certificateUrl" VARCHAR(500),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verifiedById" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "CarrierInsurance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverQualificationFile" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "documentType" "DQFDocumentType" NOT NULL,
    "documentNumber" VARCHAR(100),
    "documentUrl" VARCHAR(500),
    "issueDate" DATE,
    "expirationDate" DATE,
    "isExpired" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verifiedById" TEXT,
    "clearinghouseStatus" VARCHAR(50),
    "lastQueryDate" TIMESTAMP(3),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "DriverQualificationFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyIncident" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "carrierId" TEXT,
    "driverId" TEXT,
    "loadId" TEXT,
    "incidentType" "SafetyIncidentType" NOT NULL,
    "incidentDate" DATE NOT NULL,
    "location" VARCHAR(500),
    "description" TEXT NOT NULL,
    "severity" VARCHAR(50),
    "injuriesCount" INTEGER NOT NULL DEFAULT 0,
    "fatalitiesCount" INTEGER NOT NULL DEFAULT 0,
    "wasOutOfService" BOOLEAN NOT NULL DEFAULT false,
    "oosReason" TEXT,
    "citationNumber" VARCHAR(100),
    "violationCodes" JSONB,
    "fineAmount" DECIMAL(10,2),
    "investigationNotes" TEXT,
    "reportUrl" VARCHAR(500),
    "csaPoints" DECIMAL(5,2),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "SafetyIncident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyInspection" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "carrierId" TEXT,
    "driverId" TEXT,
    "inspectionNumber" VARCHAR(100) NOT NULL,
    "inspectionDate" DATE NOT NULL,
    "inspectionLevel" INTEGER,
    "inspectionState" VARCHAR(2),
    "inspectionLocation" VARCHAR(500),
    "totalViolations" INTEGER NOT NULL DEFAULT 0,
    "oosViolations" INTEGER NOT NULL DEFAULT 0,
    "wasOutOfService" BOOLEAN NOT NULL DEFAULT false,
    "violations" JSONB,
    "basicsAffected" JSONB,
    "reportNumber" VARCHAR(100),
    "reportUrl" VARCHAR(500),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "SafetyInspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyAlert" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "carrierId" TEXT,
    "alertType" "SafetyAlertType" NOT NULL,
    "alertMessage" TEXT NOT NULL,
    "severity" VARCHAR(50) NOT NULL,
    "relatedEntityType" VARCHAR(50),
    "relatedEntityId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "acknowledgedAt" TIMESTAMP(3),
    "acknowledgedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,
    "resolutionNotes" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "SafetyAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthorityChange" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "carrierId" TEXT NOT NULL,
    "changeType" VARCHAR(100) NOT NULL,
    "changeDate" DATE NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "description" TEXT,
    "sourceAgency" VARCHAR(100),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "AuthorityChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarrierWatchlist" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "carrierId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "riskLevel" VARCHAR(50) NOT NULL,
    "isRestricted" BOOLEAN NOT NULL DEFAULT false,
    "restrictions" TEXT,
    "nextReviewDate" DATE,
    "reviewFrequencyDays" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,
    "resolutionNotes" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "CarrierWatchlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyAuditTrail" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "carrierId" TEXT,
    "eventType" VARCHAR(100) NOT NULL,
    "eventDescription" TEXT NOT NULL,
    "eventData" JSONB,
    "performedById" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "SafetyAuditTrail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateQuery" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "originCity" VARCHAR(100) NOT NULL,
    "originState" VARCHAR(2) NOT NULL,
    "originZip" VARCHAR(10),
    "destCity" VARCHAR(100) NOT NULL,
    "destState" VARCHAR(2) NOT NULL,
    "destZip" VARCHAR(10),
    "equipmentType" VARCHAR(50) NOT NULL,
    "provider" "RateProvider" NOT NULL,
    "lowRate" DECIMAL(10,2),
    "highRate" DECIMAL(10,2),
    "avgRate" DECIMAL(10,2),
    "confidence" VARCHAR(50),
    "loadVolume" INTEGER,
    "truckVolume" INTEGER,
    "marketTrend" VARCHAR(50),
    "queryHash" VARCHAR(64) NOT NULL,
    "cachedUntil" TIMESTAMP(3) NOT NULL,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "RateQuery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateHistory" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "originCity" VARCHAR(100) NOT NULL,
    "originState" VARCHAR(2) NOT NULL,
    "destCity" VARCHAR(100) NOT NULL,
    "destState" VARCHAR(2) NOT NULL,
    "equipmentType" VARCHAR(50) NOT NULL,
    "provider" "RateProvider" NOT NULL,
    "avgRate" DECIMAL(10,2) NOT NULL,
    "lowRate" DECIMAL(10,2) NOT NULL,
    "highRate" DECIMAL(10,2) NOT NULL,
    "loadVolume" INTEGER,
    "truckVolume" INTEGER,
    "loadToTruckRatio" DECIMAL(5,2),
    "weekStartDate" DATE NOT NULL,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "RateHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateAlert" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "laneDescription" VARCHAR(500) NOT NULL,
    "originCity" VARCHAR(100),
    "originState" VARCHAR(2) NOT NULL,
    "destCity" VARCHAR(100),
    "destState" VARCHAR(2) NOT NULL,
    "equipmentType" VARCHAR(50) NOT NULL,
    "condition" "AlertCondition" NOT NULL,
    "thresholdValue" DECIMAL(10,2) NOT NULL,
    "comparisonPeriod" VARCHAR(50) NOT NULL,
    "notifyUserIds" JSONB,
    "notifyEmails" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastTriggeredAt" TIMESTAMP(3),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "RateAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateAlertHistory" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "triggeredAt" TIMESTAMP(3) NOT NULL,
    "oldRate" DECIMAL(10,2) NOT NULL,
    "newRate" DECIMAL(10,2) NOT NULL,
    "changePercent" DECIMAL(5,2) NOT NULL,
    "notificationSent" BOOLEAN NOT NULL DEFAULT false,
    "notifiedUserIds" JSONB,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "RateAlertHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaneAnalytics" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "originState" VARCHAR(2) NOT NULL,
    "destState" VARCHAR(2) NOT NULL,
    "equipmentType" VARCHAR(50) NOT NULL,
    "totalLoads" INTEGER NOT NULL DEFAULT 0,
    "avgRate" DECIMAL(10,2) NOT NULL,
    "avgMargin" DECIMAL(5,2) NOT NULL,
    "avgTransitDays" DECIMAL(4,1) NOT NULL,
    "onTimePercent" DECIMAL(5,2) NOT NULL,
    "datAvgRate" DECIMAL(10,2),
    "truckstopAvgRate" DECIMAL(10,2),
    "vsMarketPercent" DECIMAL(5,2),
    "periodType" VARCHAR(20) NOT NULL,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "LaneAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateProviderConfig" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "provider" "RateProvider" NOT NULL,
    "apiKey" VARCHAR(500),
    "apiSecret" VARCHAR(500),
    "apiEndpoint" VARCHAR(500),
    "username" VARCHAR(255),
    "password" VARCHAR(500),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "rateLimitPerHour" INTEGER,
    "cacheDurationMins" INTEGER NOT NULL DEFAULT 60,
    "queriesThisMonth" INTEGER NOT NULL DEFAULT 0,
    "lastQueryAt" TIMESTAMP(3),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "RateProviderConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoadBoardProvider" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "providerType" "LoadBoardProviderType" NOT NULL,
    "apiKey" VARCHAR(500),
    "apiSecret" VARCHAR(500),
    "apiEndpoint" VARCHAR(500),
    "username" VARCHAR(255),
    "password" VARCHAR(500),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "autoPost" BOOLEAN NOT NULL DEFAULT false,
    "postingRules" JSONB,
    "postsPerDay" INTEGER,
    "postsThisMonth" INTEGER NOT NULL DEFAULT 0,
    "lastPostAt" TIMESTAMP(3),
    "totalPosts" INTEGER NOT NULL DEFAULT 0,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "LoadBoardProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoadBoardAccount" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accountName" VARCHAR(255) NOT NULL,
    "accountNumber" VARCHAR(100),
    "accountUsername" VARCHAR(255),
    "accountPassword" VARCHAR(500),
    "accountApiKey" VARCHAR(500),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastVerifiedAt" TIMESTAMP(3),
    "postsThisMonth" INTEGER NOT NULL DEFAULT 0,
    "totalPosts" INTEGER NOT NULL DEFAULT 0,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "LoadBoardAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoadPost" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "loadId" TEXT,
    "orderId" TEXT,
    "postNumber" VARCHAR(50) NOT NULL,
    "externalPostId" VARCHAR(100),
    "status" "LoadPostStatus" NOT NULL DEFAULT 'DRAFT',
    "originCity" VARCHAR(100) NOT NULL,
    "originState" VARCHAR(2) NOT NULL,
    "originZip" VARCHAR(10),
    "destCity" VARCHAR(100) NOT NULL,
    "destState" VARCHAR(2) NOT NULL,
    "destZip" VARCHAR(10),
    "pickupDate" DATE NOT NULL,
    "deliveryDate" DATE,
    "equipmentType" VARCHAR(50) NOT NULL,
    "length" INTEGER,
    "weight" INTEGER,
    "commodity" VARCHAR(255),
    "postedRate" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "contactName" VARCHAR(255),
    "contactPhone" VARCHAR(20),
    "contactEmail" VARCHAR(255),
    "postedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "removedAt" TIMESTAMP(3),
    "views" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "leadCount" INTEGER NOT NULL DEFAULT 0,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "LoadPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostLead" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "carrierId" TEXT,
    "carrierName" VARCHAR(255) NOT NULL,
    "carrierMC" VARCHAR(20),
    "carrierDOT" VARCHAR(20),
    "contactName" VARCHAR(255) NOT NULL,
    "contactPhone" VARCHAR(20) NOT NULL,
    "contactEmail" VARCHAR(255),
    "quotedRate" DECIMAL(10,2),
    "availableDate" DATE,
    "equipmentInfo" TEXT,
    "notes" TEXT,
    "status" "PostLeadStatus" NOT NULL DEFAULT 'NEW',
    "contactedAt" TIMESTAMP(3),
    "lastContactedAt" TIMESTAMP(3),
    "nextFollowUpAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "declinedAt" TIMESTAMP(3),
    "declinedReason" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "PostLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CapacitySearch" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "accountId" TEXT,
    "searchNumber" VARCHAR(50) NOT NULL,
    "originCity" VARCHAR(100),
    "originState" VARCHAR(2) NOT NULL,
    "originRadius" INTEGER,
    "destCity" VARCHAR(100),
    "destState" VARCHAR(2) NOT NULL,
    "destRadius" INTEGER,
    "equipmentType" VARCHAR(50) NOT NULL,
    "availableDate" DATE NOT NULL,
    "minLength" INTEGER,
    "minWeight" INTEGER,
    "maxAge" VARCHAR(50),
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "CapacitySearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CapacityResult" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "searchId" TEXT NOT NULL,
    "carrierName" VARCHAR(255) NOT NULL,
    "carrierMC" VARCHAR(20),
    "carrierDOT" VARCHAR(20),
    "contactName" VARCHAR(255),
    "contactPhone" VARCHAR(20),
    "truckLocation" VARCHAR(500) NOT NULL,
    "truckCity" VARCHAR(100),
    "truckState" VARCHAR(2),
    "truckZip" VARCHAR(10),
    "equipmentType" VARCHAR(50) NOT NULL,
    "availableDate" DATE NOT NULL,
    "length" INTEGER,
    "comments" TEXT,
    "contacted" BOOLEAN NOT NULL DEFAULT false,
    "contactedAt" TIMESTAMP(3),
    "interested" BOOLEAN,
    "notes" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "CapacityResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostingRule" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "accountId" TEXT,
    "ruleName" VARCHAR(255) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "conditions" JSONB NOT NULL,
    "frequency" "PostingFrequency" NOT NULL,
    "scheduleTime" VARCHAR(10),
    "expirationHours" INTEGER,
    "rulesMatched" INTEGER NOT NULL DEFAULT 0,
    "postsCreated" INTEGER NOT NULL DEFAULT 0,
    "lastTriggeredAt" TIMESTAMP(3),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "PostingRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostingSchedule" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "postId" TEXT,
    "ruleId" TEXT,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "executedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "PostingSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateData" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "marketLowRate" DECIMAL(10,2),
    "marketHighRate" DECIMAL(10,2),
    "marketAvgRate" DECIMAL(10,2),
    "similarLoadCount" INTEGER,
    "dataSource" VARCHAR(50),
    "asOfDate" DATE NOT NULL,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "RateData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoardMetric" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "accountId" TEXT,
    "periodType" VARCHAR(20) NOT NULL,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "postsCreated" INTEGER NOT NULL DEFAULT 0,
    "postsActive" INTEGER NOT NULL DEFAULT 0,
    "postsExpired" INTEGER NOT NULL DEFAULT 0,
    "postsCovered" INTEGER NOT NULL DEFAULT 0,
    "totalViews" INTEGER NOT NULL DEFAULT 0,
    "totalClicks" INTEGER NOT NULL DEFAULT 0,
    "totalLeads" INTEGER NOT NULL DEFAULT 0,
    "leadsContacted" INTEGER NOT NULL DEFAULT 0,
    "leadsConverted" INTEGER NOT NULL DEFAULT 0,
    "avgClickRate" DECIMAL(5,2),
    "avgConversionRate" DECIMAL(5,2),
    "avgPostedRate" DECIMAL(10,2),
    "avgAcceptedRate" DECIMAL(10,2),
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "BoardMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CreditApplication_applicationNumber_key" ON "CreditApplication"("applicationNumber");

-- CreateIndex
CREATE INDEX "CreditApplication_tenantId_idx" ON "CreditApplication"("tenantId");

-- CreateIndex
CREATE INDEX "CreditApplication_companyId_idx" ON "CreditApplication"("companyId");

-- CreateIndex
CREATE INDEX "CreditApplication_status_idx" ON "CreditApplication"("status");

-- CreateIndex
CREATE INDEX "CreditApplication_applicationNumber_idx" ON "CreditApplication"("applicationNumber");

-- CreateIndex
CREATE INDEX "CreditApplication_createdAt_idx" ON "CreditApplication"("createdAt");

-- CreateIndex
CREATE INDEX "CreditApplication_externalId_sourceSystem_idx" ON "CreditApplication"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "CreditLimit_tenantId_idx" ON "CreditLimit"("tenantId");

-- CreateIndex
CREATE INDEX "CreditLimit_companyId_idx" ON "CreditLimit"("companyId");

-- CreateIndex
CREATE INDEX "CreditLimit_status_idx" ON "CreditLimit"("status");

-- CreateIndex
CREATE INDEX "CreditLimit_externalId_sourceSystem_idx" ON "CreditLimit"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "CreditLimit_tenantId_companyId_key" ON "CreditLimit"("tenantId", "companyId");

-- CreateIndex
CREATE INDEX "CreditHold_tenantId_idx" ON "CreditHold"("tenantId");

-- CreateIndex
CREATE INDEX "CreditHold_companyId_idx" ON "CreditHold"("companyId");

-- CreateIndex
CREATE INDEX "CreditHold_reason_idx" ON "CreditHold"("reason");

-- CreateIndex
CREATE INDEX "CreditHold_isActive_idx" ON "CreditHold"("isActive");

-- CreateIndex
CREATE INDEX "CreditHold_createdAt_idx" ON "CreditHold"("createdAt");

-- CreateIndex
CREATE INDEX "CreditHold_externalId_sourceSystem_idx" ON "CreditHold"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "CollectionActivity_tenantId_idx" ON "CollectionActivity"("tenantId");

-- CreateIndex
CREATE INDEX "CollectionActivity_companyId_idx" ON "CollectionActivity"("companyId");

-- CreateIndex
CREATE INDEX "CollectionActivity_invoiceId_idx" ON "CollectionActivity"("invoiceId");

-- CreateIndex
CREATE INDEX "CollectionActivity_activityType_idx" ON "CollectionActivity"("activityType");

-- CreateIndex
CREATE INDEX "CollectionActivity_followUpDate_idx" ON "CollectionActivity"("followUpDate");

-- CreateIndex
CREATE INDEX "CollectionActivity_createdAt_idx" ON "CollectionActivity"("createdAt");

-- CreateIndex
CREATE INDEX "CollectionActivity_externalId_sourceSystem_idx" ON "CollectionActivity"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentPlan_planNumber_key" ON "PaymentPlan"("planNumber");

-- CreateIndex
CREATE INDEX "PaymentPlan_tenantId_idx" ON "PaymentPlan"("tenantId");

-- CreateIndex
CREATE INDEX "PaymentPlan_companyId_idx" ON "PaymentPlan"("companyId");

-- CreateIndex
CREATE INDEX "PaymentPlan_status_idx" ON "PaymentPlan"("status");

-- CreateIndex
CREATE INDEX "PaymentPlan_planNumber_idx" ON "PaymentPlan"("planNumber");

-- CreateIndex
CREATE INDEX "PaymentPlan_nextPaymentDate_idx" ON "PaymentPlan"("nextPaymentDate");

-- CreateIndex
CREATE INDEX "PaymentPlan_externalId_sourceSystem_idx" ON "PaymentPlan"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "Claim_claimNumber_key" ON "Claim"("claimNumber");

-- CreateIndex
CREATE INDEX "Claim_tenantId_idx" ON "Claim"("tenantId");

-- CreateIndex
CREATE INDEX "Claim_loadId_idx" ON "Claim"("loadId");

-- CreateIndex
CREATE INDEX "Claim_orderId_idx" ON "Claim"("orderId");

-- CreateIndex
CREATE INDEX "Claim_carrierId_idx" ON "Claim"("carrierId");

-- CreateIndex
CREATE INDEX "Claim_companyId_idx" ON "Claim"("companyId");

-- CreateIndex
CREATE INDEX "Claim_claimNumber_idx" ON "Claim"("claimNumber");

-- CreateIndex
CREATE INDEX "Claim_status_idx" ON "Claim"("status");

-- CreateIndex
CREATE INDEX "Claim_claimType_idx" ON "Claim"("claimType");

-- CreateIndex
CREATE INDEX "Claim_incidentDate_idx" ON "Claim"("incidentDate");

-- CreateIndex
CREATE INDEX "Claim_externalId_sourceSystem_idx" ON "Claim"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "ClaimItem_tenantId_idx" ON "ClaimItem"("tenantId");

-- CreateIndex
CREATE INDEX "ClaimItem_claimId_idx" ON "ClaimItem"("claimId");

-- CreateIndex
CREATE INDEX "ClaimItem_externalId_sourceSystem_idx" ON "ClaimItem"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "ClaimDocument_tenantId_idx" ON "ClaimDocument"("tenantId");

-- CreateIndex
CREATE INDEX "ClaimDocument_claimId_idx" ON "ClaimDocument"("claimId");

-- CreateIndex
CREATE INDEX "ClaimDocument_documentId_idx" ON "ClaimDocument"("documentId");

-- CreateIndex
CREATE INDEX "ClaimDocument_externalId_sourceSystem_idx" ON "ClaimDocument"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "ClaimNote_tenantId_idx" ON "ClaimNote"("tenantId");

-- CreateIndex
CREATE INDEX "ClaimNote_claimId_idx" ON "ClaimNote"("claimId");

-- CreateIndex
CREATE INDEX "ClaimNote_createdAt_idx" ON "ClaimNote"("createdAt");

-- CreateIndex
CREATE INDEX "ClaimNote_externalId_sourceSystem_idx" ON "ClaimNote"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "ClaimTimeline_tenantId_idx" ON "ClaimTimeline"("tenantId");

-- CreateIndex
CREATE INDEX "ClaimTimeline_claimId_idx" ON "ClaimTimeline"("claimId");

-- CreateIndex
CREATE INDEX "ClaimTimeline_eventType_idx" ON "ClaimTimeline"("eventType");

-- CreateIndex
CREATE INDEX "ClaimTimeline_createdAt_idx" ON "ClaimTimeline"("createdAt");

-- CreateIndex
CREATE INDEX "ClaimTimeline_externalId_sourceSystem_idx" ON "ClaimTimeline"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "ClaimAdjustment_tenantId_idx" ON "ClaimAdjustment"("tenantId");

-- CreateIndex
CREATE INDEX "ClaimAdjustment_claimId_idx" ON "ClaimAdjustment"("claimId");

-- CreateIndex
CREATE INDEX "ClaimAdjustment_adjustmentType_idx" ON "ClaimAdjustment"("adjustmentType");

-- CreateIndex
CREATE INDEX "ClaimAdjustment_externalId_sourceSystem_idx" ON "ClaimAdjustment"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "SubrogationRecord_tenantId_idx" ON "SubrogationRecord"("tenantId");

-- CreateIndex
CREATE INDEX "SubrogationRecord_claimId_idx" ON "SubrogationRecord"("claimId");

-- CreateIndex
CREATE INDEX "SubrogationRecord_status_idx" ON "SubrogationRecord"("status");

-- CreateIndex
CREATE INDEX "SubrogationRecord_targetPartyType_idx" ON "SubrogationRecord"("targetPartyType");

-- CreateIndex
CREATE INDEX "SubrogationRecord_externalId_sourceSystem_idx" ON "SubrogationRecord"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "ClaimContact_tenantId_idx" ON "ClaimContact"("tenantId");

-- CreateIndex
CREATE INDEX "ClaimContact_claimId_idx" ON "ClaimContact"("claimId");

-- CreateIndex
CREATE INDEX "ClaimContact_contactType_idx" ON "ClaimContact"("contactType");

-- CreateIndex
CREATE INDEX "ClaimContact_externalId_sourceSystem_idx" ON "ClaimContact"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "EdiTradingPartner_isaId_key" ON "EdiTradingPartner"("isaId");

-- CreateIndex
CREATE INDEX "EdiTradingPartner_tenantId_idx" ON "EdiTradingPartner"("tenantId");

-- CreateIndex
CREATE INDEX "EdiTradingPartner_isaId_idx" ON "EdiTradingPartner"("isaId");

-- CreateIndex
CREATE INDEX "EdiTradingPartner_partnerType_idx" ON "EdiTradingPartner"("partnerType");

-- CreateIndex
CREATE INDEX "EdiTradingPartner_isActive_idx" ON "EdiTradingPartner"("isActive");

-- CreateIndex
CREATE INDEX "EdiTradingPartner_externalId_sourceSystem_idx" ON "EdiTradingPartner"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "EdiMessage_messageId_key" ON "EdiMessage"("messageId");

-- CreateIndex
CREATE INDEX "EdiMessage_tenantId_idx" ON "EdiMessage"("tenantId");

-- CreateIndex
CREATE INDEX "EdiMessage_tradingPartnerId_idx" ON "EdiMessage"("tradingPartnerId");

-- CreateIndex
CREATE INDEX "EdiMessage_transactionType_idx" ON "EdiMessage"("transactionType");

-- CreateIndex
CREATE INDEX "EdiMessage_direction_idx" ON "EdiMessage"("direction");

-- CreateIndex
CREATE INDEX "EdiMessage_status_idx" ON "EdiMessage"("status");

-- CreateIndex
CREATE INDEX "EdiMessage_entityType_entityId_idx" ON "EdiMessage"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "EdiMessage_createdAt_idx" ON "EdiMessage"("createdAt");

-- CreateIndex
CREATE INDEX "EdiMessage_externalId_sourceSystem_idx" ON "EdiMessage"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "EdiTransactionMapping_tenantId_idx" ON "EdiTransactionMapping"("tenantId");

-- CreateIndex
CREATE INDEX "EdiTransactionMapping_tradingPartnerId_idx" ON "EdiTransactionMapping"("tradingPartnerId");

-- CreateIndex
CREATE INDEX "EdiTransactionMapping_transactionType_idx" ON "EdiTransactionMapping"("transactionType");

-- CreateIndex
CREATE INDEX "EdiTransactionMapping_isActive_idx" ON "EdiTransactionMapping"("isActive");

-- CreateIndex
CREATE INDEX "EdiTransactionMapping_externalId_sourceSystem_idx" ON "EdiTransactionMapping"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "EdiTransactionMapping_tenantId_tradingPartnerId_transaction_key" ON "EdiTransactionMapping"("tenantId", "tradingPartnerId", "transactionType");

-- CreateIndex
CREATE INDEX "EdiControlNumber_tenantId_idx" ON "EdiControlNumber"("tenantId");

-- CreateIndex
CREATE INDEX "EdiControlNumber_controlType_idx" ON "EdiControlNumber"("controlType");

-- CreateIndex
CREATE INDEX "EdiControlNumber_externalId_sourceSystem_idx" ON "EdiControlNumber"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "EdiControlNumber_tenantId_controlType_tradingPartnerId_tran_key" ON "EdiControlNumber"("tenantId", "controlType", "tradingPartnerId", "transactionType");

-- CreateIndex
CREATE UNIQUE INDEX "EdiBatch_batchNumber_key" ON "EdiBatch"("batchNumber");

-- CreateIndex
CREATE INDEX "EdiBatch_tenantId_idx" ON "EdiBatch"("tenantId");

-- CreateIndex
CREATE INDEX "EdiBatch_batchNumber_idx" ON "EdiBatch"("batchNumber");

-- CreateIndex
CREATE INDEX "EdiBatch_status_idx" ON "EdiBatch"("status");

-- CreateIndex
CREATE INDEX "EdiBatch_createdAt_idx" ON "EdiBatch"("createdAt");

-- CreateIndex
CREATE INDEX "EdiBatch_externalId_sourceSystem_idx" ON "EdiBatch"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "EdiBatchMessage_tenantId_idx" ON "EdiBatchMessage"("tenantId");

-- CreateIndex
CREATE INDEX "EdiBatchMessage_batchId_idx" ON "EdiBatchMessage"("batchId");

-- CreateIndex
CREATE INDEX "EdiBatchMessage_messageId_idx" ON "EdiBatchMessage"("messageId");

-- CreateIndex
CREATE INDEX "EdiBatchMessage_externalId_sourceSystem_idx" ON "EdiBatchMessage"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "EdiBatchMessage_batchId_messageId_key" ON "EdiBatchMessage"("batchId", "messageId");

-- CreateIndex
CREATE INDEX "EdiCommunicationLog_tenantId_idx" ON "EdiCommunicationLog"("tenantId");

-- CreateIndex
CREATE INDEX "EdiCommunicationLog_tradingPartnerId_idx" ON "EdiCommunicationLog"("tradingPartnerId");

-- CreateIndex
CREATE INDEX "EdiCommunicationLog_direction_idx" ON "EdiCommunicationLog"("direction");

-- CreateIndex
CREATE INDEX "EdiCommunicationLog_status_idx" ON "EdiCommunicationLog"("status");

-- CreateIndex
CREATE INDEX "EdiCommunicationLog_startedAt_idx" ON "EdiCommunicationLog"("startedAt");

-- CreateIndex
CREATE INDEX "EdiCommunicationLog_externalId_sourceSystem_idx" ON "EdiCommunicationLog"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "EdiEventTrigger_tenantId_idx" ON "EdiEventTrigger"("tenantId");

-- CreateIndex
CREATE INDEX "EdiEventTrigger_eventType_idx" ON "EdiEventTrigger"("eventType");

-- CreateIndex
CREATE INDEX "EdiEventTrigger_transactionType_idx" ON "EdiEventTrigger"("transactionType");

-- CreateIndex
CREATE INDEX "EdiEventTrigger_isActive_idx" ON "EdiEventTrigger"("isActive");

-- CreateIndex
CREATE INDEX "EdiEventTrigger_externalId_sourceSystem_idx" ON "EdiEventTrigger"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "EdiCodeList_tenantId_idx" ON "EdiCodeList"("tenantId");

-- CreateIndex
CREATE INDEX "EdiCodeList_listName_idx" ON "EdiCodeList"("listName");

-- CreateIndex
CREATE INDEX "EdiCodeList_ediCode_idx" ON "EdiCodeList"("ediCode");

-- CreateIndex
CREATE INDEX "EdiCodeList_internalCode_idx" ON "EdiCodeList"("internalCode");

-- CreateIndex
CREATE INDEX "EdiCodeList_isActive_idx" ON "EdiCodeList"("isActive");

-- CreateIndex
CREATE INDEX "EdiCodeList_externalId_sourceSystem_idx" ON "EdiCodeList"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "EdiCodeList_tenantId_listName_ediCode_tradingPartnerId_key" ON "EdiCodeList"("tenantId", "listName", "ediCode", "tradingPartnerId");

-- CreateIndex
CREATE INDEX "EdiAcknowledgment_tenantId_idx" ON "EdiAcknowledgment"("tenantId");

-- CreateIndex
CREATE INDEX "EdiAcknowledgment_originalMessageId_idx" ON "EdiAcknowledgment"("originalMessageId");

-- CreateIndex
CREATE INDEX "EdiAcknowledgment_ackStatus_idx" ON "EdiAcknowledgment"("ackStatus");

-- CreateIndex
CREATE INDEX "EdiAcknowledgment_receivedAt_idx" ON "EdiAcknowledgment"("receivedAt");

-- CreateIndex
CREATE INDEX "EdiAcknowledgment_externalId_sourceSystem_idx" ON "EdiAcknowledgment"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "EdiAcknowledgment_tenantId_ackControlNumber_key" ON "EdiAcknowledgment"("tenantId", "ackControlNumber");

-- CreateIndex
CREATE INDEX "EdiError_tenantId_idx" ON "EdiError"("tenantId");

-- CreateIndex
CREATE INDEX "EdiError_messageId_idx" ON "EdiError"("messageId");

-- CreateIndex
CREATE INDEX "EdiError_errorType_idx" ON "EdiError"("errorType");

-- CreateIndex
CREATE INDEX "EdiError_severity_idx" ON "EdiError"("severity");

-- CreateIndex
CREATE INDEX "EdiError_createdAt_idx" ON "EdiError"("createdAt");

-- CreateIndex
CREATE INDEX "EdiError_externalId_sourceSystem_idx" ON "EdiError"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "FmcsaCarrierRecord_carrierId_key" ON "FmcsaCarrierRecord"("carrierId");

-- CreateIndex
CREATE INDEX "FmcsaCarrierRecord_tenantId_idx" ON "FmcsaCarrierRecord"("tenantId");

-- CreateIndex
CREATE INDEX "FmcsaCarrierRecord_carrierId_idx" ON "FmcsaCarrierRecord"("carrierId");

-- CreateIndex
CREATE INDEX "FmcsaCarrierRecord_dotNumber_idx" ON "FmcsaCarrierRecord"("dotNumber");

-- CreateIndex
CREATE INDEX "FmcsaCarrierRecord_mcNumber_idx" ON "FmcsaCarrierRecord"("mcNumber");

-- CreateIndex
CREATE INDEX "FmcsaCarrierRecord_operatingStatus_idx" ON "FmcsaCarrierRecord"("operatingStatus");

-- CreateIndex
CREATE INDEX "FmcsaCarrierRecord_externalId_sourceSystem_idx" ON "FmcsaCarrierRecord"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "CsaScore_tenantId_idx" ON "CsaScore"("tenantId");

-- CreateIndex
CREATE INDEX "CsaScore_carrierId_idx" ON "CsaScore"("carrierId");

-- CreateIndex
CREATE INDEX "CsaScore_basicType_idx" ON "CsaScore"("basicType");

-- CreateIndex
CREATE INDEX "CsaScore_isAlert_idx" ON "CsaScore"("isAlert");

-- CreateIndex
CREATE INDEX "CsaScore_asOfDate_idx" ON "CsaScore"("asOfDate");

-- CreateIndex
CREATE INDEX "CsaScore_externalId_sourceSystem_idx" ON "CsaScore"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "CsaScore_tenantId_carrierId_basicType_asOfDate_key" ON "CsaScore"("tenantId", "carrierId", "basicType", "asOfDate");

-- CreateIndex
CREATE INDEX "CarrierInsurance_tenantId_idx" ON "CarrierInsurance"("tenantId");

-- CreateIndex
CREATE INDEX "CarrierInsurance_carrierId_idx" ON "CarrierInsurance"("carrierId");

-- CreateIndex
CREATE INDEX "CarrierInsurance_insuranceType_idx" ON "CarrierInsurance"("insuranceType");

-- CreateIndex
CREATE INDEX "CarrierInsurance_expirationDate_idx" ON "CarrierInsurance"("expirationDate");

-- CreateIndex
CREATE INDEX "CarrierInsurance_isExpired_idx" ON "CarrierInsurance"("isExpired");

-- CreateIndex
CREATE INDEX "CarrierInsurance_externalId_sourceSystem_idx" ON "CarrierInsurance"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "DriverQualificationFile_tenantId_idx" ON "DriverQualificationFile"("tenantId");

-- CreateIndex
CREATE INDEX "DriverQualificationFile_driverId_idx" ON "DriverQualificationFile"("driverId");

-- CreateIndex
CREATE INDEX "DriverQualificationFile_documentType_idx" ON "DriverQualificationFile"("documentType");

-- CreateIndex
CREATE INDEX "DriverQualificationFile_expirationDate_idx" ON "DriverQualificationFile"("expirationDate");

-- CreateIndex
CREATE INDEX "DriverQualificationFile_isExpired_idx" ON "DriverQualificationFile"("isExpired");

-- CreateIndex
CREATE INDEX "DriverQualificationFile_externalId_sourceSystem_idx" ON "DriverQualificationFile"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "SafetyIncident_tenantId_idx" ON "SafetyIncident"("tenantId");

-- CreateIndex
CREATE INDEX "SafetyIncident_carrierId_idx" ON "SafetyIncident"("carrierId");

-- CreateIndex
CREATE INDEX "SafetyIncident_driverId_idx" ON "SafetyIncident"("driverId");

-- CreateIndex
CREATE INDEX "SafetyIncident_loadId_idx" ON "SafetyIncident"("loadId");

-- CreateIndex
CREATE INDEX "SafetyIncident_incidentType_idx" ON "SafetyIncident"("incidentType");

-- CreateIndex
CREATE INDEX "SafetyIncident_incidentDate_idx" ON "SafetyIncident"("incidentDate");

-- CreateIndex
CREATE INDEX "SafetyIncident_severity_idx" ON "SafetyIncident"("severity");

-- CreateIndex
CREATE INDEX "SafetyIncident_externalId_sourceSystem_idx" ON "SafetyIncident"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "SafetyInspection_tenantId_idx" ON "SafetyInspection"("tenantId");

-- CreateIndex
CREATE INDEX "SafetyInspection_carrierId_idx" ON "SafetyInspection"("carrierId");

-- CreateIndex
CREATE INDEX "SafetyInspection_driverId_idx" ON "SafetyInspection"("driverId");

-- CreateIndex
CREATE INDEX "SafetyInspection_inspectionDate_idx" ON "SafetyInspection"("inspectionDate");

-- CreateIndex
CREATE INDEX "SafetyInspection_wasOutOfService_idx" ON "SafetyInspection"("wasOutOfService");

-- CreateIndex
CREATE INDEX "SafetyInspection_externalId_sourceSystem_idx" ON "SafetyInspection"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "SafetyInspection_tenantId_inspectionNumber_key" ON "SafetyInspection"("tenantId", "inspectionNumber");

-- CreateIndex
CREATE INDEX "SafetyAlert_tenantId_idx" ON "SafetyAlert"("tenantId");

-- CreateIndex
CREATE INDEX "SafetyAlert_carrierId_idx" ON "SafetyAlert"("carrierId");

-- CreateIndex
CREATE INDEX "SafetyAlert_alertType_idx" ON "SafetyAlert"("alertType");

-- CreateIndex
CREATE INDEX "SafetyAlert_severity_idx" ON "SafetyAlert"("severity");

-- CreateIndex
CREATE INDEX "SafetyAlert_isActive_idx" ON "SafetyAlert"("isActive");

-- CreateIndex
CREATE INDEX "SafetyAlert_createdAt_idx" ON "SafetyAlert"("createdAt");

-- CreateIndex
CREATE INDEX "SafetyAlert_externalId_sourceSystem_idx" ON "SafetyAlert"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "AuthorityChange_tenantId_idx" ON "AuthorityChange"("tenantId");

-- CreateIndex
CREATE INDEX "AuthorityChange_carrierId_idx" ON "AuthorityChange"("carrierId");

-- CreateIndex
CREATE INDEX "AuthorityChange_changeType_idx" ON "AuthorityChange"("changeType");

-- CreateIndex
CREATE INDEX "AuthorityChange_changeDate_idx" ON "AuthorityChange"("changeDate");

-- CreateIndex
CREATE INDEX "AuthorityChange_externalId_sourceSystem_idx" ON "AuthorityChange"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "CarrierWatchlist_tenantId_idx" ON "CarrierWatchlist"("tenantId");

-- CreateIndex
CREATE INDEX "CarrierWatchlist_carrierId_idx" ON "CarrierWatchlist"("carrierId");

-- CreateIndex
CREATE INDEX "CarrierWatchlist_riskLevel_idx" ON "CarrierWatchlist"("riskLevel");

-- CreateIndex
CREATE INDEX "CarrierWatchlist_isActive_idx" ON "CarrierWatchlist"("isActive");

-- CreateIndex
CREATE INDEX "CarrierWatchlist_nextReviewDate_idx" ON "CarrierWatchlist"("nextReviewDate");

-- CreateIndex
CREATE INDEX "CarrierWatchlist_externalId_sourceSystem_idx" ON "CarrierWatchlist"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "SafetyAuditTrail_tenantId_idx" ON "SafetyAuditTrail"("tenantId");

-- CreateIndex
CREATE INDEX "SafetyAuditTrail_carrierId_idx" ON "SafetyAuditTrail"("carrierId");

-- CreateIndex
CREATE INDEX "SafetyAuditTrail_eventType_idx" ON "SafetyAuditTrail"("eventType");

-- CreateIndex
CREATE INDEX "SafetyAuditTrail_createdAt_idx" ON "SafetyAuditTrail"("createdAt");

-- CreateIndex
CREATE INDEX "SafetyAuditTrail_externalId_sourceSystem_idx" ON "SafetyAuditTrail"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "RateQuery_tenantId_idx" ON "RateQuery"("tenantId");

-- CreateIndex
CREATE INDEX "RateQuery_originState_idx" ON "RateQuery"("originState");

-- CreateIndex
CREATE INDEX "RateQuery_destState_idx" ON "RateQuery"("destState");

-- CreateIndex
CREATE INDEX "RateQuery_equipmentType_idx" ON "RateQuery"("equipmentType");

-- CreateIndex
CREATE INDEX "RateQuery_provider_idx" ON "RateQuery"("provider");

-- CreateIndex
CREATE INDEX "RateQuery_cachedUntil_idx" ON "RateQuery"("cachedUntil");

-- CreateIndex
CREATE INDEX "RateQuery_createdAt_idx" ON "RateQuery"("createdAt");

-- CreateIndex
CREATE INDEX "RateQuery_externalId_sourceSystem_idx" ON "RateQuery"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "RateQuery_tenantId_queryHash_key" ON "RateQuery"("tenantId", "queryHash");

-- CreateIndex
CREATE INDEX "RateHistory_tenantId_idx" ON "RateHistory"("tenantId");

-- CreateIndex
CREATE INDEX "RateHistory_originState_idx" ON "RateHistory"("originState");

-- CreateIndex
CREATE INDEX "RateHistory_destState_idx" ON "RateHistory"("destState");

-- CreateIndex
CREATE INDEX "RateHistory_equipmentType_idx" ON "RateHistory"("equipmentType");

-- CreateIndex
CREATE INDEX "RateHistory_weekStartDate_idx" ON "RateHistory"("weekStartDate");

-- CreateIndex
CREATE INDEX "RateHistory_provider_idx" ON "RateHistory"("provider");

-- CreateIndex
CREATE INDEX "RateHistory_externalId_sourceSystem_idx" ON "RateHistory"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "RateHistory_tenantId_originState_destState_equipmentType_we_key" ON "RateHistory"("tenantId", "originState", "destState", "equipmentType", "weekStartDate", "provider");

-- CreateIndex
CREATE INDEX "RateAlert_tenantId_idx" ON "RateAlert"("tenantId");

-- CreateIndex
CREATE INDEX "RateAlert_originState_idx" ON "RateAlert"("originState");

-- CreateIndex
CREATE INDEX "RateAlert_destState_idx" ON "RateAlert"("destState");

-- CreateIndex
CREATE INDEX "RateAlert_equipmentType_idx" ON "RateAlert"("equipmentType");

-- CreateIndex
CREATE INDEX "RateAlert_isActive_idx" ON "RateAlert"("isActive");

-- CreateIndex
CREATE INDEX "RateAlert_externalId_sourceSystem_idx" ON "RateAlert"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "RateAlertHistory_tenantId_idx" ON "RateAlertHistory"("tenantId");

-- CreateIndex
CREATE INDEX "RateAlertHistory_alertId_idx" ON "RateAlertHistory"("alertId");

-- CreateIndex
CREATE INDEX "RateAlertHistory_triggeredAt_idx" ON "RateAlertHistory"("triggeredAt");

-- CreateIndex
CREATE INDEX "RateAlertHistory_externalId_sourceSystem_idx" ON "RateAlertHistory"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "LaneAnalytics_tenantId_idx" ON "LaneAnalytics"("tenantId");

-- CreateIndex
CREATE INDEX "LaneAnalytics_originState_idx" ON "LaneAnalytics"("originState");

-- CreateIndex
CREATE INDEX "LaneAnalytics_destState_idx" ON "LaneAnalytics"("destState");

-- CreateIndex
CREATE INDEX "LaneAnalytics_equipmentType_idx" ON "LaneAnalytics"("equipmentType");

-- CreateIndex
CREATE INDEX "LaneAnalytics_periodType_idx" ON "LaneAnalytics"("periodType");

-- CreateIndex
CREATE INDEX "LaneAnalytics_periodStart_idx" ON "LaneAnalytics"("periodStart");

-- CreateIndex
CREATE INDEX "LaneAnalytics_externalId_sourceSystem_idx" ON "LaneAnalytics"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "LaneAnalytics_tenantId_originState_destState_equipmentType__key" ON "LaneAnalytics"("tenantId", "originState", "destState", "equipmentType", "periodType", "periodStart");

-- CreateIndex
CREATE INDEX "RateProviderConfig_tenantId_idx" ON "RateProviderConfig"("tenantId");

-- CreateIndex
CREATE INDEX "RateProviderConfig_provider_idx" ON "RateProviderConfig"("provider");

-- CreateIndex
CREATE INDEX "RateProviderConfig_isActive_idx" ON "RateProviderConfig"("isActive");

-- CreateIndex
CREATE INDEX "RateProviderConfig_externalId_sourceSystem_idx" ON "RateProviderConfig"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "RateProviderConfig_tenantId_provider_key" ON "RateProviderConfig"("tenantId", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "LoadBoardProvider_providerType_key" ON "LoadBoardProvider"("providerType");

-- CreateIndex
CREATE INDEX "LoadBoardProvider_tenantId_idx" ON "LoadBoardProvider"("tenantId");

-- CreateIndex
CREATE INDEX "LoadBoardProvider_providerType_idx" ON "LoadBoardProvider"("providerType");

-- CreateIndex
CREATE INDEX "LoadBoardProvider_isActive_idx" ON "LoadBoardProvider"("isActive");

-- CreateIndex
CREATE INDEX "LoadBoardProvider_externalId_sourceSystem_idx" ON "LoadBoardProvider"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "LoadBoardAccount_tenantId_idx" ON "LoadBoardAccount"("tenantId");

-- CreateIndex
CREATE INDEX "LoadBoardAccount_providerId_idx" ON "LoadBoardAccount"("providerId");

-- CreateIndex
CREATE INDEX "LoadBoardAccount_isActive_idx" ON "LoadBoardAccount"("isActive");

-- CreateIndex
CREATE INDEX "LoadBoardAccount_externalId_sourceSystem_idx" ON "LoadBoardAccount"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "LoadPost_postNumber_key" ON "LoadPost"("postNumber");

-- CreateIndex
CREATE INDEX "LoadPost_tenantId_idx" ON "LoadPost"("tenantId");

-- CreateIndex
CREATE INDEX "LoadPost_accountId_idx" ON "LoadPost"("accountId");

-- CreateIndex
CREATE INDEX "LoadPost_loadId_idx" ON "LoadPost"("loadId");

-- CreateIndex
CREATE INDEX "LoadPost_orderId_idx" ON "LoadPost"("orderId");

-- CreateIndex
CREATE INDEX "LoadPost_postNumber_idx" ON "LoadPost"("postNumber");

-- CreateIndex
CREATE INDEX "LoadPost_status_idx" ON "LoadPost"("status");

-- CreateIndex
CREATE INDEX "LoadPost_originState_idx" ON "LoadPost"("originState");

-- CreateIndex
CREATE INDEX "LoadPost_destState_idx" ON "LoadPost"("destState");

-- CreateIndex
CREATE INDEX "LoadPost_pickupDate_idx" ON "LoadPost"("pickupDate");

-- CreateIndex
CREATE INDEX "LoadPost_postedAt_idx" ON "LoadPost"("postedAt");

-- CreateIndex
CREATE INDEX "LoadPost_externalId_sourceSystem_idx" ON "LoadPost"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "PostLead_tenantId_idx" ON "PostLead"("tenantId");

-- CreateIndex
CREATE INDEX "PostLead_postId_idx" ON "PostLead"("postId");

-- CreateIndex
CREATE INDEX "PostLead_carrierId_idx" ON "PostLead"("carrierId");

-- CreateIndex
CREATE INDEX "PostLead_status_idx" ON "PostLead"("status");

-- CreateIndex
CREATE INDEX "PostLead_createdAt_idx" ON "PostLead"("createdAt");

-- CreateIndex
CREATE INDEX "PostLead_nextFollowUpAt_idx" ON "PostLead"("nextFollowUpAt");

-- CreateIndex
CREATE INDEX "PostLead_externalId_sourceSystem_idx" ON "PostLead"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "CapacitySearch_searchNumber_key" ON "CapacitySearch"("searchNumber");

-- CreateIndex
CREATE INDEX "CapacitySearch_tenantId_idx" ON "CapacitySearch"("tenantId");

-- CreateIndex
CREATE INDEX "CapacitySearch_searchNumber_idx" ON "CapacitySearch"("searchNumber");

-- CreateIndex
CREATE INDEX "CapacitySearch_originState_idx" ON "CapacitySearch"("originState");

-- CreateIndex
CREATE INDEX "CapacitySearch_destState_idx" ON "CapacitySearch"("destState");

-- CreateIndex
CREATE INDEX "CapacitySearch_equipmentType_idx" ON "CapacitySearch"("equipmentType");

-- CreateIndex
CREATE INDEX "CapacitySearch_availableDate_idx" ON "CapacitySearch"("availableDate");

-- CreateIndex
CREATE INDEX "CapacitySearch_createdAt_idx" ON "CapacitySearch"("createdAt");

-- CreateIndex
CREATE INDEX "CapacitySearch_externalId_sourceSystem_idx" ON "CapacitySearch"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "CapacityResult_tenantId_idx" ON "CapacityResult"("tenantId");

-- CreateIndex
CREATE INDEX "CapacityResult_searchId_idx" ON "CapacityResult"("searchId");

-- CreateIndex
CREATE INDEX "CapacityResult_truckState_idx" ON "CapacityResult"("truckState");

-- CreateIndex
CREATE INDEX "CapacityResult_equipmentType_idx" ON "CapacityResult"("equipmentType");

-- CreateIndex
CREATE INDEX "CapacityResult_availableDate_idx" ON "CapacityResult"("availableDate");

-- CreateIndex
CREATE INDEX "CapacityResult_contacted_idx" ON "CapacityResult"("contacted");

-- CreateIndex
CREATE INDEX "CapacityResult_externalId_sourceSystem_idx" ON "CapacityResult"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "PostingRule_tenantId_idx" ON "PostingRule"("tenantId");

-- CreateIndex
CREATE INDEX "PostingRule_accountId_idx" ON "PostingRule"("accountId");

-- CreateIndex
CREATE INDEX "PostingRule_isActive_idx" ON "PostingRule"("isActive");

-- CreateIndex
CREATE INDEX "PostingRule_frequency_idx" ON "PostingRule"("frequency");

-- CreateIndex
CREATE INDEX "PostingRule_externalId_sourceSystem_idx" ON "PostingRule"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "PostingSchedule_tenantId_idx" ON "PostingSchedule"("tenantId");

-- CreateIndex
CREATE INDEX "PostingSchedule_postId_idx" ON "PostingSchedule"("postId");

-- CreateIndex
CREATE INDEX "PostingSchedule_ruleId_idx" ON "PostingSchedule"("ruleId");

-- CreateIndex
CREATE INDEX "PostingSchedule_scheduledFor_idx" ON "PostingSchedule"("scheduledFor");

-- CreateIndex
CREATE INDEX "PostingSchedule_status_idx" ON "PostingSchedule"("status");

-- CreateIndex
CREATE INDEX "PostingSchedule_externalId_sourceSystem_idx" ON "PostingSchedule"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "RateData_tenantId_idx" ON "RateData"("tenantId");

-- CreateIndex
CREATE INDEX "RateData_postId_idx" ON "RateData"("postId");

-- CreateIndex
CREATE INDEX "RateData_asOfDate_idx" ON "RateData"("asOfDate");

-- CreateIndex
CREATE INDEX "RateData_externalId_sourceSystem_idx" ON "RateData"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "BoardMetric_tenantId_idx" ON "BoardMetric"("tenantId");

-- CreateIndex
CREATE INDEX "BoardMetric_accountId_idx" ON "BoardMetric"("accountId");

-- CreateIndex
CREATE INDEX "BoardMetric_periodType_idx" ON "BoardMetric"("periodType");

-- CreateIndex
CREATE INDEX "BoardMetric_periodStart_idx" ON "BoardMetric"("periodStart");

-- CreateIndex
CREATE INDEX "BoardMetric_externalId_sourceSystem_idx" ON "BoardMetric"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "BoardMetric_tenantId_accountId_periodType_periodStart_key" ON "BoardMetric"("tenantId", "accountId", "periodType", "periodStart");

-- AddForeignKey
ALTER TABLE "CreditApplication" ADD CONSTRAINT "CreditApplication_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditApplication" ADD CONSTRAINT "CreditApplication_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditLimit" ADD CONSTRAINT "CreditLimit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditLimit" ADD CONSTRAINT "CreditLimit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditHold" ADD CONSTRAINT "CreditHold_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditHold" ADD CONSTRAINT "CreditHold_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionActivity" ADD CONSTRAINT "CollectionActivity_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionActivity" ADD CONSTRAINT "CollectionActivity_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionActivity" ADD CONSTRAINT "CollectionActivity_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentPlan" ADD CONSTRAINT "PaymentPlan_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentPlan" ADD CONSTRAINT "PaymentPlan_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_loadId_fkey" FOREIGN KEY ("loadId") REFERENCES "Load"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimItem" ADD CONSTRAINT "ClaimItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimItem" ADD CONSTRAINT "ClaimItem_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimDocument" ADD CONSTRAINT "ClaimDocument_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimDocument" ADD CONSTRAINT "ClaimDocument_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimDocument" ADD CONSTRAINT "ClaimDocument_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimNote" ADD CONSTRAINT "ClaimNote_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimNote" ADD CONSTRAINT "ClaimNote_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimTimeline" ADD CONSTRAINT "ClaimTimeline_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimTimeline" ADD CONSTRAINT "ClaimTimeline_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimAdjustment" ADD CONSTRAINT "ClaimAdjustment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimAdjustment" ADD CONSTRAINT "ClaimAdjustment_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubrogationRecord" ADD CONSTRAINT "SubrogationRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubrogationRecord" ADD CONSTRAINT "SubrogationRecord_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimContact" ADD CONSTRAINT "ClaimContact_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimContact" ADD CONSTRAINT "ClaimContact_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EdiTradingPartner" ADD CONSTRAINT "EdiTradingPartner_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EdiMessage" ADD CONSTRAINT "EdiMessage_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EdiMessage" ADD CONSTRAINT "EdiMessage_tradingPartnerId_fkey" FOREIGN KEY ("tradingPartnerId") REFERENCES "EdiTradingPartner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EdiTransactionMapping" ADD CONSTRAINT "EdiTransactionMapping_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EdiTransactionMapping" ADD CONSTRAINT "EdiTransactionMapping_tradingPartnerId_fkey" FOREIGN KEY ("tradingPartnerId") REFERENCES "EdiTradingPartner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EdiControlNumber" ADD CONSTRAINT "EdiControlNumber_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EdiBatch" ADD CONSTRAINT "EdiBatch_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EdiBatchMessage" ADD CONSTRAINT "EdiBatchMessage_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EdiBatchMessage" ADD CONSTRAINT "EdiBatchMessage_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "EdiBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EdiBatchMessage" ADD CONSTRAINT "EdiBatchMessage_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "EdiMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EdiCommunicationLog" ADD CONSTRAINT "EdiCommunicationLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EdiCommunicationLog" ADD CONSTRAINT "EdiCommunicationLog_tradingPartnerId_fkey" FOREIGN KEY ("tradingPartnerId") REFERENCES "EdiTradingPartner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EdiEventTrigger" ADD CONSTRAINT "EdiEventTrigger_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EdiCodeList" ADD CONSTRAINT "EdiCodeList_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EdiAcknowledgment" ADD CONSTRAINT "EdiAcknowledgment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EdiAcknowledgment" ADD CONSTRAINT "EdiAcknowledgment_originalMessageId_fkey" FOREIGN KEY ("originalMessageId") REFERENCES "EdiMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EdiError" ADD CONSTRAINT "EdiError_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EdiError" ADD CONSTRAINT "EdiError_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "EdiMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FmcsaCarrierRecord" ADD CONSTRAINT "FmcsaCarrierRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FmcsaCarrierRecord" ADD CONSTRAINT "FmcsaCarrierRecord_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CsaScore" ADD CONSTRAINT "CsaScore_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CsaScore" ADD CONSTRAINT "CsaScore_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CsaScore" ADD CONSTRAINT "CsaScore_fmcsaRecordId_fkey" FOREIGN KEY ("fmcsaRecordId") REFERENCES "FmcsaCarrierRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierInsurance" ADD CONSTRAINT "CarrierInsurance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierInsurance" ADD CONSTRAINT "CarrierInsurance_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverQualificationFile" ADD CONSTRAINT "DriverQualificationFile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverQualificationFile" ADD CONSTRAINT "DriverQualificationFile_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyIncident" ADD CONSTRAINT "SafetyIncident_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyIncident" ADD CONSTRAINT "SafetyIncident_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyIncident" ADD CONSTRAINT "SafetyIncident_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyIncident" ADD CONSTRAINT "SafetyIncident_loadId_fkey" FOREIGN KEY ("loadId") REFERENCES "Load"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyInspection" ADD CONSTRAINT "SafetyInspection_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyInspection" ADD CONSTRAINT "SafetyInspection_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyInspection" ADD CONSTRAINT "SafetyInspection_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyAlert" ADD CONSTRAINT "SafetyAlert_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyAlert" ADD CONSTRAINT "SafetyAlert_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthorityChange" ADD CONSTRAINT "AuthorityChange_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthorityChange" ADD CONSTRAINT "AuthorityChange_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierWatchlist" ADD CONSTRAINT "CarrierWatchlist_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierWatchlist" ADD CONSTRAINT "CarrierWatchlist_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyAuditTrail" ADD CONSTRAINT "SafetyAuditTrail_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyAuditTrail" ADD CONSTRAINT "SafetyAuditTrail_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RateQuery" ADD CONSTRAINT "RateQuery_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RateHistory" ADD CONSTRAINT "RateHistory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RateAlert" ADD CONSTRAINT "RateAlert_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RateAlertHistory" ADD CONSTRAINT "RateAlertHistory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RateAlertHistory" ADD CONSTRAINT "RateAlertHistory_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "RateAlert"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaneAnalytics" ADD CONSTRAINT "LaneAnalytics_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RateProviderConfig" ADD CONSTRAINT "RateProviderConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoadBoardProvider" ADD CONSTRAINT "LoadBoardProvider_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoadBoardAccount" ADD CONSTRAINT "LoadBoardAccount_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoadBoardAccount" ADD CONSTRAINT "LoadBoardAccount_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "LoadBoardProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoadPost" ADD CONSTRAINT "LoadPost_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoadPost" ADD CONSTRAINT "LoadPost_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "LoadBoardAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoadPost" ADD CONSTRAINT "LoadPost_loadId_fkey" FOREIGN KEY ("loadId") REFERENCES "Load"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoadPost" ADD CONSTRAINT "LoadPost_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLead" ADD CONSTRAINT "PostLead_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLead" ADD CONSTRAINT "PostLead_postId_fkey" FOREIGN KEY ("postId") REFERENCES "LoadPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLead" ADD CONSTRAINT "PostLead_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapacitySearch" ADD CONSTRAINT "CapacitySearch_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapacityResult" ADD CONSTRAINT "CapacityResult_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapacityResult" ADD CONSTRAINT "CapacityResult_searchId_fkey" FOREIGN KEY ("searchId") REFERENCES "CapacitySearch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostingRule" ADD CONSTRAINT "PostingRule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostingSchedule" ADD CONSTRAINT "PostingSchedule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RateData" ADD CONSTRAINT "RateData_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RateData" ADD CONSTRAINT "RateData_postId_fkey" FOREIGN KEY ("postId") REFERENCES "LoadPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardMetric" ADD CONSTRAINT "BoardMetric_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
