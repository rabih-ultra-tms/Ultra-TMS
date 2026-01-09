# 28 - EDI Service

| Field            | Value                              |
| ---------------- | ---------------------------------- |
| **Service ID**   | 28                                 |
| **Service Name** | EDI                                |
| **Category**     | Extended                           |
| **Module Path**  | `@modules/edi`                     |
| **Phase**        | A (MVP)                            |
| **Weeks**        | 59-62                              |
| **Priority**     | P1                                 |
| **Dependencies** | Auth, TMS Core, Carrier, Documents |

---

## Purpose

Electronic Data Interchange (EDI) processing service for X12 transaction sets used in transportation and logistics. Handles inbound and outbound EDI messages for load tenders, status updates, invoicing, and acknowledgments enabling automated communication with large shippers and trading partners.

---

## Features

- **X12 204** - Motor carrier load tender (inbound)
- **X12 990** - Response to load tender (outbound)
- **X12 214** - Shipment status message (outbound)
- **X12 210** - Motor carrier freight invoice (outbound)
- **Trading Partners** - Partner profile management
- **Message Mapping** - Field mapping configuration
- **Validation Engine** - EDI syntax validation
- **Envelope Processing** - ISA/GS/ST parsing
- **Acknowledgments** - 997 functional acknowledgments
- **Error Handling** - Rejection and reprocessing
- **Batch Processing** - Scheduled file processing
- **FTP/AS2** - Secure transmission protocols
- **Message Archive** - Complete audit trail

---

## Database Schema

```sql
-- Trading Partners
CREATE TABLE edi_trading_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Partner Identification
    partner_code VARCHAR(50) NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    company_id UUID REFERENCES companies(id),

    -- EDI Identifiers
    isa_qualifier VARCHAR(2) NOT NULL,           -- ISA05/07 qualifier (01, 02, ZZ, etc.)
    isa_id VARCHAR(15) NOT NULL,                 -- ISA06/08 ID
    gs_id VARCHAR(15) NOT NULL,                  -- GS02/03 application ID

    -- Communication
    transmission_method VARCHAR(20) NOT NULL,    -- FTP, SFTP, AS2, VAN
    connection_config JSONB NOT NULL,            -- Host, port, credentials (encrypted)

    -- Settings
    production_mode BOOLEAN DEFAULT false,
    test_indicator VARCHAR(1) DEFAULT 'T',       -- ISA15: P=production, T=test

    -- Supported Transactions
    supported_transactions VARCHAR[] NOT NULL,   -- ['204', '214', '210', '990']

    -- Defaults
    default_segment_terminator VARCHAR(1) DEFAULT '~',
    default_element_separator VARCHAR(1) DEFAULT '*',
    default_sub_element_separator VARCHAR(1) DEFAULT ':',

    -- Status
    status VARCHAR(20) DEFAULT 'ACTIVE',         -- ACTIVE, INACTIVE, SUSPENDED
    last_activity_at TIMESTAMPTZ,

    -- Migration
    external_id VARCHAR(100),
    source_system VARCHAR(50),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),

    UNIQUE(tenant_id, partner_code),
    UNIQUE(tenant_id, isa_qualifier, isa_id)
);

-- EDI Message Logs (all inbound/outbound messages)
CREATE TABLE edi_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    trading_partner_id UUID NOT NULL REFERENCES edi_trading_partners(id),

    -- Message Identification
    message_number VARCHAR(50) NOT NULL,
    direction VARCHAR(10) NOT NULL,              -- INBOUND, OUTBOUND
    transaction_set VARCHAR(3) NOT NULL,         -- 204, 210, 214, 990, 997

    -- Envelope Info
    isa_control_number VARCHAR(9) NOT NULL,
    gs_control_number VARCHAR(9) NOT NULL,
    st_control_number VARCHAR(9) NOT NULL,

    -- Content
    raw_content TEXT NOT NULL,                   -- Original EDI content
    parsed_content JSONB,                        -- Parsed to JSON

    -- Related Entities
    order_id UUID,                               -- Linked order (if applicable)
    load_id UUID,                                -- Linked load (if applicable)
    invoice_id UUID,                             -- Linked invoice (for 210)

    -- Processing Status
    status VARCHAR(20) NOT NULL,                 -- RECEIVED, VALIDATED, PROCESSED, ERROR, REJECTED
    validation_errors JSONB,                     -- Array of validation errors
    processing_errors JSONB,                     -- Array of processing errors

    -- Acknowledgment
    ack_status VARCHAR(20),                      -- PENDING, ACCEPTED, REJECTED
    ack_message_id UUID,                         -- Reference to 997/999

    -- Timing
    received_at TIMESTAMPTZ,
    validated_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT edi_messages_direction_check CHECK (direction IN ('INBOUND', 'OUTBOUND'))
);

-- Create index for partitioning by month
CREATE INDEX idx_edi_messages_tenant_date ON edi_messages(tenant_id, created_at);
CREATE INDEX idx_edi_messages_partner ON edi_messages(trading_partner_id, created_at);
CREATE INDEX idx_edi_messages_order ON edi_messages(order_id) WHERE order_id IS NOT NULL;
CREATE INDEX idx_edi_messages_status ON edi_messages(tenant_id, status);
CREATE INDEX idx_edi_messages_control ON edi_messages(isa_control_number, gs_control_number, st_control_number);

-- EDI Transaction Mappings
CREATE TABLE edi_transaction_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    trading_partner_id UUID REFERENCES edi_trading_partners(id), -- NULL for tenant default

    -- Transaction Type
    transaction_set VARCHAR(3) NOT NULL,         -- 204, 210, 214, 990
    direction VARCHAR(10) NOT NULL,

    -- Mapping Configuration
    mapping_name VARCHAR(100) NOT NULL,
    mapping_config JSONB NOT NULL,               -- Field mappings

    -- Validation Rules
    validation_rules JSONB,                      -- Custom validation

    -- Transformation Rules
    transformation_rules JSONB,                  -- Data transformations

    -- Priority (for multiple mappings)
    priority INTEGER DEFAULT 0,

    status VARCHAR(20) DEFAULT 'ACTIVE',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- EDI Control Numbers (for generating unique control numbers)
CREATE TABLE edi_control_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    trading_partner_id UUID REFERENCES edi_trading_partners(id),

    -- Control Number Type
    control_type VARCHAR(10) NOT NULL,           -- ISA, GS, ST

    -- Current Value
    current_value INTEGER NOT NULL DEFAULT 0,
    max_value INTEGER NOT NULL DEFAULT 999999999,

    -- Last Used
    last_used_at TIMESTAMPTZ,

    UNIQUE(tenant_id, trading_partner_id, control_type)
);

-- EDI Batches (for batch file processing)
CREATE TABLE edi_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    trading_partner_id UUID NOT NULL REFERENCES edi_trading_partners(id),

    -- Batch Info
    batch_number VARCHAR(50) NOT NULL,
    direction VARCHAR(10) NOT NULL,

    -- File Info
    filename VARCHAR(255),
    file_size INTEGER,

    -- Contents
    message_count INTEGER DEFAULT 0,

    -- Processing
    status VARCHAR(20) NOT NULL,                 -- PENDING, PROCESSING, COMPLETED, PARTIAL, FAILED
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Results
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EDI Batch Messages (link batch to individual messages)
CREATE TABLE edi_batch_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES edi_batches(id),
    message_id UUID NOT NULL REFERENCES edi_messages(id),
    sequence_number INTEGER NOT NULL,

    UNIQUE(batch_id, message_id)
);

-- EDI Communication Logs (FTP/AS2 transmission logs)
CREATE TABLE edi_communication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    trading_partner_id UUID NOT NULL REFERENCES edi_trading_partners(id),

    -- Communication Details
    direction VARCHAR(10) NOT NULL,
    protocol VARCHAR(20) NOT NULL,               -- FTP, SFTP, AS2, HTTP

    -- Connection Info
    remote_host VARCHAR(255),
    remote_path VARCHAR(500),

    -- File Info
    filename VARCHAR(255),
    file_size INTEGER,

    -- Status
    status VARCHAR(20) NOT NULL,                 -- SUCCESS, FAILED, TIMEOUT
    error_message TEXT,

    -- Linked Content
    batch_id UUID REFERENCES edi_batches(id),
    message_id UUID REFERENCES edi_messages(id),

    -- Timing
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EDI Event Triggers (automated EDI generation rules)
CREATE TABLE edi_event_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    trading_partner_id UUID NOT NULL REFERENCES edi_trading_partners(id),

    -- Trigger Definition
    trigger_name VARCHAR(100) NOT NULL,
    transaction_set VARCHAR(3) NOT NULL,

    -- Event Source
    source_event VARCHAR(100) NOT NULL,          -- order.status_changed, load.delivered, etc.
    event_conditions JSONB,                      -- Additional conditions

    -- Mapping
    mapping_id UUID REFERENCES edi_transaction_mappings(id),

    -- Settings
    enabled BOOLEAN DEFAULT true,
    delay_minutes INTEGER DEFAULT 0,             -- Delay before sending

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- EDI Code Lists (for code translations)
CREATE TABLE edi_code_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    trading_partner_id UUID REFERENCES edi_trading_partners(id), -- NULL for tenant default

    -- Code List Info
    code_type VARCHAR(50) NOT NULL,              -- EQUIPMENT_TYPE, STATUS_CODE, CITY_CODE, etc.

    -- Mapping
    internal_code VARCHAR(50) NOT NULL,
    external_code VARCHAR(50) NOT NULL,
    description VARCHAR(200),

    -- Direction
    direction VARCHAR(10),                       -- INBOUND, OUTBOUND, BOTH

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, trading_partner_id, code_type, internal_code, direction)
);

-- EDI Schedules (for automated polling/sending)
CREATE TABLE edi_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    trading_partner_id UUID NOT NULL REFERENCES edi_trading_partners(id),

    -- Schedule Info
    schedule_name VARCHAR(100) NOT NULL,
    schedule_type VARCHAR(20) NOT NULL,          -- POLL_INBOUND, SEND_OUTBOUND

    -- Timing
    cron_expression VARCHAR(100) NOT NULL,
    timezone VARCHAR(50) DEFAULT 'America/Chicago',

    -- Settings
    enabled BOOLEAN DEFAULT true,

    -- Last Execution
    last_run_at TIMESTAMPTZ,
    last_status VARCHAR(20),
    next_run_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_edi_trading_partners_tenant ON edi_trading_partners(tenant_id);
CREATE INDEX idx_edi_trading_partners_status ON edi_trading_partners(tenant_id, status);
CREATE INDEX idx_edi_mappings_tenant ON edi_transaction_mappings(tenant_id);
CREATE INDEX idx_edi_mappings_partner ON edi_transaction_mappings(trading_partner_id);
CREATE INDEX idx_edi_batches_tenant ON edi_batches(tenant_id, created_at);
CREATE INDEX idx_edi_batches_status ON edi_batches(tenant_id, status);
CREATE INDEX idx_edi_comm_logs_tenant ON edi_communication_logs(tenant_id, created_at);
CREATE INDEX idx_edi_triggers_partner ON edi_event_triggers(trading_partner_id, enabled);
CREATE INDEX idx_edi_code_lists_lookup ON edi_code_lists(tenant_id, trading_partner_id, code_type);
CREATE INDEX idx_edi_schedules_next ON edi_schedules(next_run_at) WHERE enabled = true;
```

---

## X12 Transaction Sets

### 204 - Motor Carrier Load Tender (Inbound)

Load tender from shipper to carrier/broker.

```
ISA*00*          *00*          *ZZ*SHIPPER        *ZZ*BROKER         *230615*1430*U*00401*000000001*0*P*:~
GS*SM*SHIPPER*BROKER*20230615*1430*1*X*004010~
ST*204*0001~
B2**SHIPPER**123456789*PP~
B2A*00~
L11*PO123456*PO~
L11*REF789*CR~
G62*68*20230616~
G62*69*20230617~
MS3*CARRIER*B*J~
NTE**Special handling instructions~
N1*SH*SHIPPER WAREHOUSE~
N3*123 MAIN ST~
N4*CHICAGO*IL*60601*US~
N1*CN*CONSIGNEE LOCATION~
N3*456 OAK AVE~
N4*DALLAS*TX*75201*US~
S5*1*CL*15000*L*100*PCS~
L11*SKU123*SK~
AT8*G*L*15000*100~
SE*20*0001~
GE*1*1~
IEA*1*000000001~
```

**Mapped Fields:**

- B2: Standard carrier alpha code, reference number
- L11: Reference numbers (PO, customer ref)
- G62: Pickup/delivery dates
- N1/N3/N4: Origin and destination addresses
- S5: Stop details with weight and quantity
- AT8: Weight/quantity totals

### 990 - Response to Load Tender (Outbound)

Accept or decline load tender.

```
ISA*00*          *00*          *ZZ*BROKER         *ZZ*SHIPPER        *230615*1500*U*00401*000000002*0*P*:~
GS*GF*BROKER*SHIPPER*20230615*1500*2*X*004010~
ST*990*0001~
B1*CARRIER*123456789*20230615*A~
N9*BM*BOL123456~
SE*4*0001~
GE*1*2~
IEA*1*000000002~
```

**Response Codes:**

- A: Accepted
- D: Declined
- C: Conditional acceptance

### 214 - Shipment Status Message (Outbound)

Status updates throughout shipment lifecycle.

```
ISA*00*          *00*          *ZZ*BROKER         *ZZ*SHIPPER        *230616*0800*U*00401*000000003*0*P*:~
GS*QM*BROKER*SHIPPER*20230616*0800*3*X*004010~
ST*214*0001~
B10*123456789*BOL123456*CARRIER~
L11*PO123456*PO~
MS1*CHICAGO*IL*US~
MS2*CARRIER*J~
AT7*X6*NS***20230616*0745*LT~
SE*7*0001~
GE*1*3~
IEA*1*000000003~
```

**Status Codes (AT7):**

- X1: Arrived at pickup
- X3: Departed pickup
- X6: En route
- D1: Delivered
- AG: Arrived at delivery
- AF: Carrier departed with shipment

### 210 - Motor Carrier Freight Invoice (Outbound)

Invoice for freight services.

```
ISA*00*          *00*          *ZZ*BROKER         *ZZ*SHIPPER        *230618*1000*U*00401*000000004*0*P*:~
GS*IM*BROKER*SHIPPER*20230618*1000*4*X*004010~
ST*210*0001~
B3**INV123456**PP*20230617*1500.00*DY*20230618~
N9*BM*BOL123456~
N9*PO*PO123456~
N1*SH*SHIPPER WAREHOUSE~
N3*123 MAIN ST~
N4*CHICAGO*IL*60601~
N1*CN*CONSIGNEE LOCATION~
N3*456 OAK AVE~
N4*DALLAS*TX*75201~
L3*15000*G*1500.00**100.00*FR*1400.00~
SE*12*0001~
GE*1*4~
IEA*1*000000004~
```

### 997 - Functional Acknowledgment (Both Directions)

Acknowledge receipt of EDI transmission.

```
ISA*00*          *00*          *ZZ*BROKER         *ZZ*SHIPPER        *230615*1501*U*00401*000000005*0*P*:~
GS*FA*BROKER*SHIPPER*20230615*1501*5*X*004010~
ST*997*0001~
AK1*SM*1~
AK2*204*0001~
AK5*A~
AK9*A*1*1*1~
SE*6*0001~
GE*1*5~
IEA*1*000000005~
```

**Acknowledgment Codes:**

- A: Accepted
- E: Accepted with errors
- R: Rejected

---

## API Endpoints

| Method | Endpoint                                   | Description              |
| ------ | ------------------------------------------ | ------------------------ |
| GET    | `/api/v1/edi/partners`                     | List trading partners    |
| POST   | `/api/v1/edi/partners`                     | Create trading partner   |
| GET    | `/api/v1/edi/partners/:id`                 | Get partner details      |
| PUT    | `/api/v1/edi/partners/:id`                 | Update partner           |
| DELETE | `/api/v1/edi/partners/:id`                 | Deactivate partner       |
| POST   | `/api/v1/edi/partners/:id/test-connection` | Test connection          |
| GET    | `/api/v1/edi/messages`                     | List EDI messages        |
| GET    | `/api/v1/edi/messages/:id`                 | Get message details      |
| POST   | `/api/v1/edi/messages/:id/reprocess`       | Reprocess failed message |
| GET    | `/api/v1/edi/messages/:id/raw`             | Get raw EDI content      |
| POST   | `/api/v1/edi/parse`                        | Parse EDI content        |
| POST   | `/api/v1/edi/validate`                     | Validate EDI content     |
| POST   | `/api/v1/edi/generate/990`                 | Generate 990 response    |
| POST   | `/api/v1/edi/generate/214`                 | Generate 214 status      |
| POST   | `/api/v1/edi/generate/210`                 | Generate 210 invoice     |
| GET    | `/api/v1/edi/mappings`                     | List mappings            |
| POST   | `/api/v1/edi/mappings`                     | Create mapping           |
| PUT    | `/api/v1/edi/mappings/:id`                 | Update mapping           |
| DELETE | `/api/v1/edi/mappings/:id`                 | Delete mapping           |
| GET    | `/api/v1/edi/batches`                      | List batches             |
| GET    | `/api/v1/edi/batches/:id`                  | Get batch details        |
| POST   | `/api/v1/edi/batches/:id/retry`            | Retry failed batch       |
| GET    | `/api/v1/edi/code-lists`                   | List code mappings       |
| POST   | `/api/v1/edi/code-lists`                   | Create code mapping      |
| PUT    | `/api/v1/edi/code-lists/:id`               | Update code mapping      |
| DELETE | `/api/v1/edi/code-lists/:id`               | Delete code mapping      |
| POST   | `/api/v1/edi/code-lists/import`            | Bulk import codes        |
| GET    | `/api/v1/edi/triggers`                     | List event triggers      |
| POST   | `/api/v1/edi/triggers`                     | Create trigger           |
| PUT    | `/api/v1/edi/triggers/:id`                 | Update trigger           |
| DELETE | `/api/v1/edi/triggers/:id`                 | Delete trigger           |
| GET    | `/api/v1/edi/schedules`                    | List schedules           |
| POST   | `/api/v1/edi/schedules`                    | Create schedule          |
| PUT    | `/api/v1/edi/schedules/:id`                | Update schedule          |
| DELETE | `/api/v1/edi/schedules/:id`                | Delete schedule          |
| POST   | `/api/v1/edi/schedules/:id/run`            | Run schedule now         |
| GET    | `/api/v1/edi/communication-logs`           | List comm logs           |
| GET    | `/api/v1/edi/dashboard`                    | EDI dashboard stats      |

---

## Events

### Published Events

| Event                   | Trigger                        | Payload                                      |
| ----------------------- | ------------------------------ | -------------------------------------------- |
| `edi.message.received`  | Inbound message received       | `{ messageId, partnerId, transactionSet }`   |
| `edi.message.validated` | Message passes validation      | `{ messageId, transactionSet }`              |
| `edi.message.processed` | Message processed successfully | `{ messageId, orderId?, loadId? }`           |
| `edi.message.failed`    | Message processing failed      | `{ messageId, errors }`                      |
| `edi.message.sent`      | Outbound message sent          | `{ messageId, partnerId }`                   |
| `edi.204.received`      | Load tender received           | `{ messageId, orderData }`                   |
| `edi.990.sent`          | Tender response sent           | `{ messageId, orderId, accepted }`           |
| `edi.214.sent`          | Status update sent             | `{ messageId, loadId, statusCode }`          |
| `edi.210.sent`          | Invoice sent                   | `{ messageId, invoiceId }`                   |
| `edi.997.received`      | Acknowledgment received        | `{ messageId, originalMessageId, accepted }` |
| `edi.partner.created`   | Trading partner created        | `{ partnerId, partnerCode }`                 |
| `edi.batch.completed`   | Batch processing completed     | `{ batchId, successCount, errorCount }`      |
| `edi.connection.failed` | Partner connection failed      | `{ partnerId, error }`                       |

### Subscribed Events

| Event                  | Source     | Action                             |
| ---------------------- | ---------- | ---------------------------------- |
| `order.status_changed` | TMS Core   | Generate 214 if trigger configured |
| `order.created`        | TMS Core   | Auto-accept 204 if configured      |
| `load.picked_up`       | TMS Core   | Send 214 status X3                 |
| `load.delivered`       | TMS Core   | Send 214 status D1                 |
| `invoice.created`      | Accounting | Generate 210 if trigger configured |

---

## Business Rules

### Trading Partner Rules

1. Partner must have unique ISA qualifier/ID combination per tenant
2. Test connection before activating production mode
3. Credentials encrypted at rest using AES-256
4. Require all supported transaction sets to have mappings
5. Track last activity for inactive partner detection

### Message Processing Rules

1. Validate ISA/GS/ST envelope structure first
2. Verify sender/receiver IDs match trading partner
3. Check for duplicate control numbers (reject within 90 days)
4. Parse segments in order, validating mandatory segments
5. Apply partner-specific field mappings
6. Transform codes using code lists
7. Create/update related entities (orders, loads)
8. Generate 997 acknowledgment for inbound messages

### Control Number Rules

1. ISA control numbers: 9 digits, unique per partner
2. GS control numbers: 1-9 digits, unique within interchange
3. ST control numbers: 4-9 digits, unique within functional group
4. Roll over to 1 when max reached
5. Track last used to prevent gaps

### 204 Processing Rules

1. Extract shipper reference numbers for matching
2. Map origin/destination addresses to locations
3. Convert weight/quantity to system units
4. Create order or match to existing
5. Apply customer-specific pricing if available
6. Set order status to 'pending_acceptance'
7. Send 990 within configured SLA (default 1 hour)

### 214 Generation Rules

1. Map internal status to X12 status codes
2. Include current location if available
3. Required for: pickup, departure, arrival, delivery
4. Optional for: en route updates, delays, exceptions
5. Send within 15 minutes of status change
6. Include all relevant reference numbers

### 210 Generation Rules

1. Generate after order delivered and invoiced
2. Include all line items with codes
3. Map charge types to L1 segment codes
4. Include proper weight and quantity totals
5. Reference original 204 control numbers
6. Wait for 997 before marking invoice as submitted

### Error Handling Rules

1. Log all validation errors with segment/element position
2. Reject entire interchange on ISA/IEA mismatch
3. Reject functional group on GS/GE mismatch
4. Individual transaction errors don't affect others
5. Generate 997 with rejection codes for failures
6. Notify operations on critical failures
7. Auto-retry transmission failures (max 3 times)

---

## Screens

| Screen ID | Name                     | Description                          |
| --------- | ------------------------ | ------------------------------------ |
| EDI-001   | Trading Partner List     | View all trading partners            |
| EDI-002   | Trading Partner Detail   | Partner settings and configuration   |
| EDI-003   | Partner Connection Setup | FTP/AS2 configuration wizard         |
| EDI-004   | Message Queue            | Inbound/outbound message list        |
| EDI-005   | Message Detail           | View parsed message with raw content |
| EDI-006   | Message Reprocessing     | Reprocess failed messages            |
| EDI-007   | Mapping Configuration    | Field mapping editor                 |
| EDI-008   | Code List Management     | Code translation tables              |
| EDI-009   | Event Triggers           | Automated EDI rules                  |
| EDI-010   | Schedule Management      | Polling/sending schedules            |
| EDI-011   | Communication Logs       | FTP/AS2 transmission history         |
| EDI-012   | EDI Dashboard            | Overview with success rates          |
| EDI-013   | Batch History            | Batch processing history             |
| EDI-014   | EDI Testing              | Test message parsing/generation      |

---

## Configuration

### Environment Variables

```bash
# EDI Settings
EDI_INBOUND_DIRECTORY=/data/edi/inbound
EDI_OUTBOUND_DIRECTORY=/data/edi/outbound
EDI_ARCHIVE_DIRECTORY=/data/edi/archive
EDI_ERROR_DIRECTORY=/data/edi/error
EDI_ARCHIVE_RETENTION_DAYS=2555  # 7 years

# Control Numbers
EDI_ISA_ID=BROKER
EDI_ISA_QUALIFIER=ZZ
EDI_GS_ID=BROKER
EDI_DEFAULT_VERSION=004010

# Processing
EDI_DUPLICATE_CHECK_DAYS=90
EDI_997_AUTO_GENERATE=true
EDI_214_AUTO_SEND=true
EDI_214_DELAY_MINUTES=5

# Communication
EDI_FTP_TIMEOUT_SECONDS=60
EDI_AS2_MESSAGE_ID_DOMAIN=edi.broker.com
EDI_RETRY_ATTEMPTS=3
EDI_RETRY_DELAY_MINUTES=15
```

### Default Settings

```json
{
  "edi": {
    "defaultVersion": "004010",
    "defaultDelimiters": {
      "segment": "~",
      "element": "*",
      "subElement": ":"
    },
    "autoAcknowledge": true,
    "autoGenerate214": true,
    "statusUpdateDelay": 5,
    "tenderResponseSla": 60,
    "duplicateCheckDays": 90,
    "batchProcessingEnabled": true,
    "archiveEnabled": true
  }
}
```

---

## Testing Checklist

### Unit Tests

- [ ] X12 parser correctly parses all segment types
- [ ] Envelope validation catches ISA/GS/ST errors
- [ ] Control number generation is atomic and sequential
- [ ] Code list translation works bidirectionally
- [ ] Field mapping applies transformations correctly
- [ ] 997 generator creates valid acknowledgments
- [ ] Duplicate detection within configured window
- [ ] Date/time format conversions work correctly

### Integration Tests

- [ ] 204 inbound creates order with correct mappings
- [ ] 990 outbound generates valid response
- [ ] 214 triggers on status change events
- [ ] 210 generates from invoice data
- [ ] FTP connection test validates credentials
- [ ] AS2 message signing and encryption work
- [ ] Batch processing handles partial failures
- [ ] Archive files moved to correct directory

### E2E Tests

- [ ] Complete 204 â†’ 990 â†’ 214 â†’ 210 flow
- [ ] Partner onboarding with test transactions
- [ ] Error handling with rejection and retry
- [ ] Dashboard displays accurate statistics
- [ ] Schedule runs at configured times
- [ ] Large batch file processing performance
- [ ] Multi-partner concurrent processing
- [ ] 7-year archive retrieval

---

## Code Translation Examples

### Equipment Type Codes

| Internal  | EDI | Description     |
| --------- | --- | --------------- |
| DRY_VAN   | TL  | Truck Load      |
| REEFER    | TT  | Temp-controlled |
| FLATBED   | FF  | Flat Bed        |
| STEP_DECK | SD  | Step Deck       |
| TANKER    | TK  | Tanker          |

### Status Codes

| Internal    | EDI | Description         |
| ----------- | --- | ------------------- |
| AT_PICKUP   | X1  | Arrived at pickup   |
| PICKED_UP   | X3  | Departed pickup     |
| IN_TRANSIT  | X6  | En route            |
| AT_DELIVERY | AG  | Arrived at delivery |
| DELIVERED   | D1  | Completed delivery  |
| DELAYED     | P1  | Delayed             |
| EXCEPTION   | A9  | Delivery exception  |

---

## Navigation

- **Previous:** [27 - Feedback Service](../27-feedback/README.md)
- **Next:** [29 - Rate Intelligence Service](../29-rate-intelligence/README.md)
- **Index:** [Services Index](../README.md)
