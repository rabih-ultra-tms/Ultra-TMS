# EDI Module API Spec

**Module:** `apps/api/src/modules/edi/`
**Base path:** `/api/v1/`
**Controllers:** EdiDocumentsController, EdiGenerationController, EdiMappingsController, EdiQueueController, TradingPartnersController
**Auth:** `JwtAuthGuard` + `RolesGuard`
**Scope:** P2 feature — Enterprise tier. No frontend screens. Backend fully implemented.

---

## TradingPartnersController

**Route prefix:** `edi/trading-partners`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/edi/trading-partners` | Create trading partner |
| GET | `/edi/trading-partners` | List trading partners |
| GET | `/edi/trading-partners/:id` | Get partner |
| PATCH | `/edi/trading-partners/:id` | Update partner |
| DELETE | `/edi/trading-partners/:id` | Delete partner |
| POST | `/edi/trading-partners/:id/test` | Test connection |

---

## EdiDocumentsController

**Route prefix:** `edi/documents`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/edi/documents` | List EDI documents (inbound + outbound) |
| GET | `/edi/documents/:id` | Get document |
| GET | `/edi/documents/:id/raw` | Get raw EDI content |
| POST | `/edi/documents/:id/reprocess` | Reprocess failed document |
| POST | `/edi/documents/inbound` | Receive inbound EDI (webhook endpoint) |

---

## EdiGenerationController

**Route prefix:** `edi/generate`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/edi/generate/214` | Generate 214 (Shipment Status) |
| POST | `/edi/generate/210` | Generate 210 (Motor Carrier Freight Invoice) |
| POST | `/edi/generate/997` | Generate 997 (Functional Acknowledgment) |
| POST | `/edi/generate/204` | Generate 204 (Motor Carrier Load Tender) |

---

## EdiMappingsController

**Route prefix:** `edi/mappings`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/edi/mappings` | List field mappings per partner |
| POST | `/edi/mappings` | Create mapping |
| PUT | `/edi/mappings/:id` | Update mapping |
| DELETE | `/edi/mappings/:id` | Delete mapping |

---

## EdiQueueController

**Route prefix:** `edi/queue`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/edi/queue` | List queued EDI jobs |
| GET | `/edi/queue/:id` | Get job status |
| DELETE | `/edi/queue/:id` | Cancel queued job |
| POST | `/edi/queue/retry` | Retry failed jobs |

---

## Supported Transaction Sets

| Code | Name | Direction |
|------|------|-----------|
| 204 | Motor Carrier Load Tender | Outbound |
| 210 | Motor Carrier Freight Invoice | Outbound |
| 214 | Shipment Status | Outbound |
| 997 | Functional Acknowledgment | Both |
| 850 | Purchase Order | Inbound |
| 856 | Advance Ship Notice | Outbound |

---

## Integration Notes

- `control-number.service.ts` manages ISA/GS control number sequences (must be unique per trading partner)
- EDI documents auto-trigger from load status changes (via event listeners)
- `transport/` subdir handles SFTP, AS2, and HTTP transport protocols
