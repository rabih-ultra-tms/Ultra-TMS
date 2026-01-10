# 10 - EDI Service API Implementation

> **Service:** EDI (Electronic Data Interchange)  
> **Priority:** P2 - Medium  
> **Endpoints:** 35  
> **Dependencies:** TMS Core ✅ (01), Carrier ✅ (02), Accounting ✅  
> **Doc Reference:** [35-service-edi.md](../../02-services/35-service-edi.md)

---

## 📋 Overview

Handle EDI document exchange (204, 210, 214, 990, 997) with trading partners for automated load tendering, status updates, and invoicing. Provides seamless integration with major EDI networks and direct customer connections.

### Key Capabilities
- Trading partner configuration and management
- EDI document parsing and generation (X12 format)
- Load tender (204) processing
- Shipment status (214) automation
- Invoice (210) generation
- Functional acknowledgments (997)
- Error handling and reprocessing

---

## ✅ Pre-Implementation Checklist

- [ ] TMS Core service is working (Orders/Loads)
- [ ] Carrier service is working (Carrier lookup)
- [ ] Accounting service is working (Invoices)
- [ ] Database models exist in `schema.prisma`

---

## 🗄️ Database Models Reference

### EdiTradingPartner Model
```prisma
model EdiTradingPartner {
  id                String            @id @default(cuid())
  tenantId          String
  
  name              String
  partnerId         String            // ISA ID
  partnerQualifier  String            // ISA ID Qualifier
  
  partnerType       EdiPartnerType
  
  companyId         String?           // Link to customer
  carrierId         String?           // Link to carrier
  
  // Connection Settings
  connectionType    EdiConnectionType
  ftpHost           String?
  ftpPort           Int?
  ftpUsername       String?
  ftpPasswordEncrypted String?
  ftpDirectory      String?
  
  asHost            String?           // AS2
  asIdentifier      String?
  
  apiEndpoint       String?
  apiKeyEncrypted   String?
  
  // Our Identifiers
  interchangeId     String
  interchangeQualifier String
  
  // Supported Documents
  supportedDocuments String[]         // ['204', '210', '214', '990', '997']
  
  // Status
  isActive          Boolean           @default(true)
  lastActivityAt    DateTime?
  
  // Settings
  autoAcknowledge   Boolean           @default(true)
  autoTender        Boolean           @default(false)
  autoInvoice       Boolean           @default(false)
  
  notes             String?           @db.Text
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  company           Company?          @relation(fields: [companyId], references: [id])
  carrier           Carrier?          @relation(fields: [carrierId], references: [id])
  
  documents         EdiDocument[]
  
  @@unique([tenantId, partnerId, partnerQualifier])
  @@index([tenantId, isActive])
}

enum EdiPartnerType {
  CUSTOMER
  CARRIER
  THIRD_PARTY
}

enum EdiConnectionType {
  FTP
  SFTP
  AS2
  API
  VAN
}
```

### EdiDocument Model
```prisma
model EdiDocument {
  id                String            @id @default(cuid())
  tenantId          String
  tradingPartnerId  String
  
  documentType      EdiDocumentType
  direction         EdiDirection
  
  controlNumber     String            // ISA Control Number
  groupControlNumber String?          // GS Control Number
  transactionSetNumber String?        // ST Control Number
  
  // Related Entities
  orderId           String?
  loadId            String?
  invoiceId         String?
  
  // Document Content
  rawContent        String            @db.Text
  parsedContent     Json?
  
  // Status
  status            EdiDocumentStatus @default(RECEIVED)
  
  // Processing
  processedAt       DateTime?
  processingNotes   String?           @db.Text
  
  // Acknowledgment
  acknowledged      Boolean           @default(false)
  acknowledgmentId  String?           // Link to 997
  
  // Errors
  errorCount        Int               @default(0)
  errors            Json?
  
  // Timestamps
  receivedAt        DateTime?
  sentAt            DateTime?
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  tradingPartner    EdiTradingPartner @relation(fields: [tradingPartnerId], references: [id])
  order             Order?            @relation(fields: [orderId], references: [id])
  load              Load?             @relation(fields: [loadId], references: [id])
  invoice           Invoice?          @relation(fields: [invoiceId], references: [id])
  
  @@unique([tenantId, controlNumber, direction])
  @@index([tenantId, documentType])
  @@index([tenantId, status])
  @@index([tenantId, tradingPartnerId])
}

enum EdiDocumentType {
  EDI_204    // Load Tender
  EDI_210    // Freight Invoice
  EDI_214    // Shipment Status
  EDI_990    // Response to Load Tender
  EDI_997    // Functional Acknowledgment
  EDI_820    // Payment Order/Remittance
}

enum EdiDirection {
  INBOUND
  OUTBOUND
}

enum EdiDocumentStatus {
  RECEIVED
  VALIDATED
  PROCESSING
  PROCESSED
  ERROR
  ACKNOWLEDGED
  REJECTED
}
```

### EdiMapping Model
```prisma
model EdiMapping {
  id                String            @id @default(cuid())
  tenantId          String
  tradingPartnerId  String?           // Null = default mapping
  
  documentType      EdiDocumentType
  direction         EdiDirection
  
  name              String
  description       String?
  
  // Field Mappings
  mappings          Json              // [{ediPath, systemField, transform}]
  
  // Validation Rules
  validationRules   Json?
  
  isActive          Boolean           @default(true)
  isDefault         Boolean           @default(false)
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  tradingPartner    EdiTradingPartner? @relation(fields: [tradingPartnerId], references: [id])
  
  @@index([tenantId, documentType])
}
```

### EdiQueue Model
```prisma
model EdiQueue {
  id                String            @id @default(cuid())
  tenantId          String
  
  documentId        String?
  tradingPartnerId  String
  
  direction         EdiDirection
  documentType      EdiDocumentType
  
  content           String            @db.Text
  
  status            EdiQueueStatus    @default(PENDING)
  priority          Int               @default(5)
  
  attempts          Int               @default(0)
  maxAttempts       Int               @default(3)
  lastAttemptAt     DateTime?
  nextAttemptAt     DateTime?
  
  error             String?           @db.Text
  
  createdAt         DateTime          @default(now())
  processedAt       DateTime?
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  document          EdiDocument?      @relation(fields: [documentId], references: [id])
  tradingPartner    EdiTradingPartner @relation(fields: [tradingPartnerId], references: [id])
  
  @@index([tenantId, status, priority])
  @@index([nextAttemptAt])
}

enum EdiQueueStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  CANCELLED
}
```

---

## 🛠️ API Endpoints

### Trading Partners (8 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/edi/trading-partners` | List partners |
| POST | `/api/v1/edi/trading-partners` | Create partner |
| GET | `/api/v1/edi/trading-partners/:id` | Get partner |
| PUT | `/api/v1/edi/trading-partners/:id` | Update partner |
| DELETE | `/api/v1/edi/trading-partners/:id` | Delete partner |
| POST | `/api/v1/edi/trading-partners/:id/test` | Test connection |
| PATCH | `/api/v1/edi/trading-partners/:id/status` | Toggle active |
| GET | `/api/v1/edi/trading-partners/:id/activity` | Activity log |

### Documents (10 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/edi/documents` | List documents |
| GET | `/api/v1/edi/documents/:id` | Get document |
| GET | `/api/v1/edi/documents/:id/raw` | Get raw content |
| GET | `/api/v1/edi/documents/:id/parsed` | Get parsed content |
| POST | `/api/v1/edi/documents/:id/reprocess` | Reprocess document |
| POST | `/api/v1/edi/documents/:id/acknowledge` | Send acknowledgment |
| GET | `/api/v1/orders/:id/edi-documents` | Order EDI docs |
| GET | `/api/v1/loads/:id/edi-documents` | Load EDI docs |
| GET | `/api/v1/edi/documents/errors` | Documents with errors |
| POST | `/api/v1/edi/documents/import` | Manual import |

### Document Generation (6 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/edi/generate/204` | Generate load tender |
| POST | `/api/v1/edi/generate/210` | Generate invoice |
| POST | `/api/v1/edi/generate/214` | Generate status update |
| POST | `/api/v1/edi/generate/990` | Generate tender response |
| POST | `/api/v1/edi/generate/997` | Generate acknowledgment |
| POST | `/api/v1/edi/send/:documentId` | Send document |

### Mappings (5 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/edi/mappings` | List mappings |
| POST | `/api/v1/edi/mappings` | Create mapping |
| GET | `/api/v1/edi/mappings/:id` | Get mapping |
| PUT | `/api/v1/edi/mappings/:id` | Update mapping |
| DELETE | `/api/v1/edi/mappings/:id` | Delete mapping |

### Queue Management (6 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/edi/queue` | List queue items |
| GET | `/api/v1/edi/queue/:id` | Get queue item |
| POST | `/api/v1/edi/queue/:id/retry` | Retry item |
| POST | `/api/v1/edi/queue/:id/cancel` | Cancel item |
| POST | `/api/v1/edi/queue/process` | Process queue |
| GET | `/api/v1/edi/queue/stats` | Queue statistics |

---

## 📝 DTO Specifications

### CreateTradingPartnerDto
```typescript
export class CreateTradingPartnerDto {
  @IsString()
  name: string;

  @IsString()
  partnerId: string;

  @IsString()
  partnerQualifier: string;

  @IsEnum(EdiPartnerType)
  partnerType: EdiPartnerType;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsString()
  carrierId?: string;

  @IsEnum(EdiConnectionType)
  connectionType: EdiConnectionType;

  @IsString()
  interchangeId: string;

  @IsString()
  interchangeQualifier: string;

  @IsArray()
  @IsString({ each: true })
  supportedDocuments: string[];

  // Connection-specific fields
  @IsOptional()
  @IsString()
  ftpHost?: string;

  @IsOptional()
  @IsInt()
  ftpPort?: number;

  @IsOptional()
  @IsString()
  ftpUsername?: string;

  @IsOptional()
  @IsString()
  ftpPassword?: string;
}
```

### Generate204Dto
```typescript
export class Generate204Dto {
  @IsString()
  tradingPartnerId: string;

  @IsString()
  loadId: string;

  @IsOptional()
  @IsString()
  carrierId?: string;

  @IsOptional()
  @IsBoolean()
  sendImmediately?: boolean;
}
```

### Generate214Dto
```typescript
export class Generate214Dto {
  @IsString()
  tradingPartnerId: string;

  @IsString()
  loadId: string;

  @IsString()
  statusCode: string;  // X1, X3, D1, etc.

  @IsOptional()
  @IsString()
  locationCode?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
```

---

## 📋 Business Rules

### EDI Document Types
```typescript
const ediDocumentTypes = {
  '204': 'Load Tender',       // Customer → Broker
  '210': 'Freight Invoice',   // Broker → Customer
  '214': 'Shipment Status',   // Broker → Customer
  '990': 'Tender Response',   // Carrier → Broker
  '997': 'Acknowledgment'     // Bi-directional
};
```

### Status Codes (214)
```typescript
const statusCodes = {
  'X1': 'Arrived at Pickup',
  'X3': 'Arrived at Delivery',
  'AF': 'Loaded',
  'X6': 'En Route',
  'D1': 'Delivered',
  'AG': 'Departed'
};
```

### Processing Flow
```
Inbound 204 → Validate → Parse → Create Load → Send 997
Load Status Change → Generate 214 → Queue → Send
Invoice Created → Generate 210 → Queue → Send
```

### Error Handling
- Auto-retry failed transmissions (max 3 attempts)
- Exponential backoff: 5min, 30min, 2hr
- Alert on persistent failures

---

## 📡 Events to Publish

| Event | Trigger | Payload |
|-------|---------|---------|
| `edi.document.received` | Receive doc | `{ documentId, type }` |
| `edi.document.processed` | Process doc | `{ documentId, orderId }` |
| `edi.document.error` | Process error | `{ documentId, error }` |
| `edi.204.received` | Receive tender | `{ documentId, loadId }` |
| `edi.210.sent` | Send invoice | `{ documentId, invoiceId }` |
| `edi.214.sent` | Send status | `{ documentId, loadId, status }` |
| `edi.997.sent` | Send ack | `{ documentId, originalDocId }` |
| `edi.partner.connected` | Test success | `{ partnerId }` |
| `edi.partner.error` | Connection fail | `{ partnerId, error }` |

---

## 🔔 Events to Subscribe

| Event | Source | Action |
|-------|--------|--------|
| `load.status_changed` | TMS Core | Generate 214 |
| `invoice.created` | Accounting | Generate 210 |
| `load.carrier_assigned` | TMS Core | Generate 204 to carrier |

---

## 🧪 Integration Test Requirements

```typescript
describe('EDI Service API', () => {
  describe('Trading Partners', () => {
    it('should create trading partner');
    it('should test FTP connection');
    it('should toggle active status');
  });

  describe('Document Processing', () => {
    it('should receive and parse 204');
    it('should create load from 204');
    it('should generate 997 acknowledgment');
    it('should handle parsing errors');
  });

  describe('Document Generation', () => {
    it('should generate 210 invoice');
    it('should generate 214 status');
    it('should queue for transmission');
  });

  describe('Queue Management', () => {
    it('should process queue items');
    it('should retry failed items');
    it('should cancel items');
  });
});
```

---

## 📁 Module Structure

```
apps/api/src/modules/edi/
├── edi.module.ts
├── trading-partners/
│   ├── trading-partners.controller.ts
│   ├── trading-partners.service.ts
│   └── dto/
├── documents/
│   ├── edi-documents.controller.ts
│   ├── edi-documents.service.ts
│   └── dto/
├── generation/
│   ├── edi-generation.controller.ts
│   ├── edi-generation.service.ts
│   └── generators/
│       ├── edi-204.generator.ts
│       ├── edi-210.generator.ts
│       ├── edi-214.generator.ts
│       └── edi-997.generator.ts
├── parsing/
│   ├── edi-parser.service.ts
│   └── parsers/
├── mappings/
│   ├── edi-mappings.controller.ts
│   └── edi-mappings.service.ts
├── queue/
│   ├── edi-queue.controller.ts
│   ├── edi-queue.service.ts
│   └── edi-queue.processor.ts
└── transport/
    ├── ftp.transport.ts
    ├── sftp.transport.ts
    └── as2.transport.ts
```

---

## ✅ Completion Checklist

- [ ] All 35 endpoints implemented
- [ ] Trading partner management
- [ ] 204 parsing and load creation
- [ ] 210 generation from invoices
- [ ] 214 status automation
- [ ] 997 acknowledgment handling
- [ ] Queue processing with retries
- [ ] FTP/SFTP connectivity
- [ ] All integration tests passing
- [ ] Tenant isolation verified

---

## 📊 Progress Tracker Update

### Update Service Row
```html
<tr>
    <td>23</td>
    <td>EDI</td>
    <td><span class="status"><span class="status-dot complete"></span> Complete</span></td>
    <td>35/35</td>
    <td>5/5</td>
    <td>100%</td>
    <td>Partners, Documents, Generation, Mappings, Queue</td>
</tr>
```

---

## 🔜 Next Step

➡️ **[11-safety-api.md](./11-safety-api.md)** - Implement Safety Service API
