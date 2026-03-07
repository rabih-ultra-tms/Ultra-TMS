# Order Data Dictionary

> AI Dev Guide | Source: Prisma schema + `dev_docs_v3/01-services/p0-mvp/05-tms-core.md`

---

## Order Entity

| Field | Type | Required | Validation | Default | Description |
|-------|------|----------|------------|---------|-------------|
| id | String (UUID) | Auto | - | Generated | Primary key |
| orderNumber | String | Auto | Unique per tenant | Generated | `ORD-{YYYYMM}-{NNN}` |
| status | OrderStatus | Yes | Enum | PENDING | See status machine |
| customerId | String | Yes | FK -> Customer | - | Shipper/customer |
| quoteId | String | No | FK -> Quote | null | If created from quote |
| revenue | Decimal | Yes | Min 0 | - | Total billed to customer |
| cost | Decimal | No | Min 0 | 0 | Total carrier cost |
| margin | Decimal | Computed | - | - | revenue - cost |
| tenantId | String | Yes | FK -> Tenant | - | Tenant isolation |
| createdBy | String | Yes | FK -> User | - | Who created |
| external_id | String | No | - | null | Migration field |
| custom_fields | Json | No | - | null | Custom attributes |
| createdAt | DateTime | Auto | - | now() | Created |
| updatedAt | DateTime | Auto | - | auto | Updated |
| deletedAt | DateTime | No | - | null | Soft delete |

## Order Status Machine

```
PENDING -> QUOTED (quote created)
QUOTED -> BOOKED (quote accepted)
BOOKED -> DISPATCHED (load dispatched)
DISPATCHED -> IN_TRANSIT
IN_TRANSIT -> DELIVERED
DELIVERED -> INVOICED
INVOICED -> COMPLETED
PENDING/QUOTED/BOOKED/DISPATCHED/IN_TRANSIT -> CANCELLED
```

- No skip-ahead transitions allowed -- validated server-side.
- Cancellation only from PENDING through IN_TRANSIT.
- DELIVERED triggers auto-invoice creation.

## Order-to-Load Mapping

```
Order (1) --> Load (many)
```

- A single order can spawn multiple loads (multi-leg shipments, partial loads).
- Each load independently tracks its own status, carrier, and stops.
- Order status is derived from the aggregate status of its loads:
  - DISPATCHED when any load is dispatched
  - IN_TRANSIT when any load is in transit
  - DELIVERED when ALL loads are delivered

## Order from Quote

- Quote acceptance (`POST /quotes/:id/accept`) auto-creates an Order via `POST /orders/from-quote/:quoteId`.
- Quote data pre-fills: customer, commodity, stops, rate.
- Cannot create order if customer has credit HOLD status.

## Relationships

```
Order
  |-- Customer (many:1, via customerId)
  |-- Quote (many:1, optional, via quoteId)
  |-- Load[] (1:many)
  |-- Stop[] (1:many)
  |-- Note[] (1:many)
  |-- Invoice (1:1, created on delivery)
```

## Validation Rules

| Field | Rule | Error |
|-------|------|-------|
| `customerId` | Must exist in tenant | "Customer not found" |
| `status` transitions | Only allowed transitions | "Invalid status transition from X to Y" |
| Revenue | Must be positive | "Revenue must be positive" |
| Customer credit | Must not be HOLD/DENIED | "Customer on credit hold" |

## API Endpoints (18, all Production)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/orders` | List (paginated, filtered) |
| POST | `/api/v1/orders` | Create order |
| GET | `/api/v1/orders/:id` | Detail with loads, stops |
| PUT/PATCH | `/api/v1/orders/:id` | Update |
| DELETE | `/api/v1/orders/:id` | Soft delete |
| PATCH | `/api/v1/orders/:id/status` | Status transition |
| POST | `/api/v1/orders/:id/clone` | Duplicate |
| GET | `/api/v1/orders/:id/loads` | Associated loads |
| GET | `/api/v1/orders/:id/documents` | Documents |
| GET | `/api/v1/orders/:id/timeline` | Activity timeline |
| GET/POST | `/api/v1/orders/:id/notes` | Notes CRUD |
| GET | `/api/v1/orders/stats` | Dashboard stats |
| POST | `/api/v1/orders/bulk-status` | Bulk status change |
| POST | `/api/v1/orders/export` | Export |
| GET | `/api/v1/orders/:id/audit` | Audit trail |
| POST | `/api/v1/orders/from-quote/:quoteId` | Create from quote |
