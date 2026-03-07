# EDI Domain Models

> Auto-generated from `apps/api/prisma/schema.prisma` — 2026-03-07

## Models in this Domain

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| EdiMessage | EDI message records (204, 214, 990, etc.) | EdiTradingPartner, EdiAcknowledgment, EdiError |
| EdiTradingPartner | Trading partner configuration | EdiMessage, EdiTransactionMapping, EdiCommunicationLog |
| EdiTransactionMapping | Field mapping rules per partner | EdiTradingPartner |
| EdiAcknowledgment | Functional acknowledgments (997) | EdiMessage |
| EdiBatch | Batch processing groups | EdiBatchMessage |
| EdiError | Parsing/validation errors | EdiMessage |
| EdiCodeList | EDI code-to-internal code mappings | |
| EdiControlNumber | ISA/GS/ST control number tracking | |
| EdiCommunicationLog | FTP/AS2 transmission logs | EdiTradingPartner |
| EdiEventTrigger | Event-based EDI triggers | |

## EdiMessage

Individual EDI transaction records.

| Field | Type | Notes |
|-------|------|-------|
| tradingPartnerId | String | FK to EdiTradingPartner |
| messageId | String | @unique, VarChar(100) |
| transactionType | EdiTransactionType enum | EDI_204, EDI_214, EDI_210, EDI_990, EDI_997, etc. |
| direction | EdiDirection enum | INBOUND, OUTBOUND |
| status | EdiMessageStatus | @default(PENDING) — PENDING, PROCESSING, COMPLETED, FAILED |
| isaControlNumber | String | VarChar(9) |
| gsControlNumber | String | VarChar(9) |
| stControlNumber | String | VarChar(9) |
| entityType/entityId | String? | Related entity (Load, Order) |
| rawContent | String | Raw EDI text |
| parsedContent | Json? | Parsed structure |
| processedAt | DateTime? | |
| validationStatus | EdiValidationStatus? | VALID, INVALID, PARTIAL |
| validationErrors | Json? | |
| retryCount | Int | @default(0) |

**Relations:** EdiAcknowledgment[], EdiError[], EdiBatchMessage[]

## EdiTradingPartner

Trading partner configuration with communication settings.

| Field | Type | Notes |
|-------|------|-------|
| partnerName | String | VarChar(255) |
| partnerType | String | VarChar(50) — CARRIER, CUSTOMER, BROKER |
| isActive | Boolean | @default(true) |
| isaId | String | @unique, VarChar(15) — ISA qualifier |
| gsId | String? | VarChar(15) — GS identifier |
| protocol | EdiCommunicationProtocol enum | FTP, SFTP, AS2, VAN, API |
| ftpHost/Port/Username/Password | String? | FTP config |
| ftpInboundPath/OutboundPath | String? | |
| as2Url/as2Identifier | String? | AS2 config |
| vanMailbox | String? | VAN config |
| sendFunctionalAck | Boolean | @default(true) |
| requireFunctionalAck | Boolean | @default(true) |
| testMode | Boolean | @default(false) |
| fieldMappings | Json? | Custom field maps |

**Relations:** EdiMessage[], EdiTransactionMapping[], EdiCommunicationLog[]

## EdiTransactionMapping

Per-partner field mapping and transformation rules.

| Field | Type | Notes |
|-------|------|-------|
| tradingPartnerId | String | FK to EdiTradingPartner |
| transactionType | EdiTransactionType | |
| fieldMappings | Json | EDI-to-internal field map |
| defaultValues | Json? | |
| transformRules | Json? | Data transformation rules |
| validationRules | Json? | Custom validation |

**Unique:** `[tenantId, tradingPartnerId, transactionType]`

## EdiControlNumber

ISA/GS/ST control number sequence tracking to ensure uniqueness.

| Field | Type | Notes |
|-------|------|-------|
| controlType | String | VarChar(10) — ISA, GS, ST |
| currentNumber | Int | @default(0) |
| prefix/suffix | String? | |
| minValue/maxValue | Int | Sequence bounds |
| tradingPartnerId | String? | Per-partner optional |
| transactionType | EdiTransactionType? | |

**Unique:** `[tenantId, controlType, tradingPartnerId, transactionType]`
