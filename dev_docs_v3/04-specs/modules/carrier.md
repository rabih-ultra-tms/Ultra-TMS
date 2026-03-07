# Carrier Module API Spec

**Module:** `apps/api/src/modules/carrier/`
**Base path:** `/api/v1/`
**Controllers:** CarriersController, ContactsController, DocumentsController, DriversController, DriversGlobalController, InsurancesController

## Auth

All controllers use `@UseGuards(JwtAuthGuard, RolesGuard)` with `@CurrentTenant()`.

**Roles:** ADMIN, SUPER_ADMIN, CARRIER_MANAGER, DISPATCHER, OPERATIONS, ACCOUNTING (varies per endpoint)

---

## CarriersController

**Path prefix:** `carriers`
**Serialization:** Uses `CarrierResponseDto` with `plainToInstance` for response transformation.

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/carriers` | ADMIN, SUPER_ADMIN, CARRIER_MANAGER, DISPATCHER, OPERATIONS | List carriers |
| POST | `/carriers` | ADMIN, SUPER_ADMIN, CARRIER_MANAGER | Create carrier |
| GET | `/carriers/fmcsa/mc/:mcNumber` | ADMIN, SUPER_ADMIN, CARRIER_MANAGER | FMCSA lookup by MC number |
| GET | `/carriers/fmcsa/dot/:dotNumber` | ADMIN, SUPER_ADMIN, CARRIER_MANAGER | FMCSA lookup by DOT number |
| POST | `/carriers/onboard` | ADMIN, SUPER_ADMIN, CARRIER_MANAGER | Onboard carrier (FMCSA + create) |
| GET | `/carriers/:id` | ADMIN, SUPER_ADMIN, CARRIER_MANAGER, DISPATCHER, OPERATIONS | Get carrier by ID |
| PUT | `/carriers/:id` | ADMIN, SUPER_ADMIN, CARRIER_MANAGER | Update carrier |
| DELETE | `/carriers/:id` | ADMIN, SUPER_ADMIN | Delete carrier |
| GET | `/carriers/:id/performance` | (class-level roles) | Get carrier performance metrics |
| GET | `/carriers/:id/loads` | (class-level roles) | Get carrier load history |
| GET | `/carriers/:id/compliance` | (class-level roles) | Get carrier compliance status |
| GET | `/carriers/:id/scorecard` | (class-level roles) | Get carrier scorecard |
| PATCH | `/carriers/:id/status` | ADMIN, SUPER_ADMIN, CARRIER_MANAGER | Update carrier status |
| PATCH | `/carriers/:id/tier` | ADMIN, SUPER_ADMIN, CARRIER_MANAGER | Update carrier tier |
| POST | `/carriers/:id/approve` | ADMIN, SUPER_ADMIN, CARRIER_MANAGER | Approve carrier |
| POST | `/carriers/:id/fmcsa-check` | ADMIN, SUPER_ADMIN, CARRIER_MANAGER | Run FMCSA check |
| POST | `/carriers/:id/suspend` | ADMIN, SUPER_ADMIN, CARRIER_MANAGER | Suspend carrier |
| POST | `/carriers/:id/blacklist` | ADMIN, SUPER_ADMIN | Blacklist carrier |
| POST | `/carriers/:id/deactivate` | ADMIN, SUPER_ADMIN, CARRIER_MANAGER | Deactivate carrier |

**Query params (GET list):** `skip`, `take`, `search`, `status`, `tier`, `state`

**Note:** Uses `skip/take` pagination (NOT `page/limit`). Frontend hooks must adapt.

---

## ContactsController

**Path prefix:** `carriers/:carrierId/contacts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/carriers/:carrierId/contacts` | (class-level roles) | List carrier contacts |
| POST | `/carriers/:carrierId/contacts` | (class-level roles) | Create carrier contact |
| GET | `/carriers/:carrierId/contacts/:id` | (class-level roles) | Get contact by ID |
| PUT | `/carriers/:carrierId/contacts/:id` | (class-level roles) | Update contact |
| DELETE | `/carriers/:carrierId/contacts/:id` | (class-level roles) | Delete contact |

---

## DocumentsController

**Path prefix:** `carriers/:carrierId/documents`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/carriers/:carrierId/documents` | (class-level roles) | List carrier documents |
| POST | `/carriers/:carrierId/documents` | (class-level roles) | Upload carrier document |
| GET | `/carriers/:carrierId/documents/:id` | (class-level roles) | Get document by ID |
| PUT | `/carriers/:carrierId/documents/:id` | (class-level roles) | Update document |
| DELETE | `/carriers/:carrierId/documents/:id` | (class-level roles) | Delete document |
| POST | `/carriers/:carrierId/documents/:id/approve` | (class-level roles) | Approve document |
| POST | `/carriers/:carrierId/documents/:id/reject` | (class-level roles) | Reject document |

---

## DriversController

**Path prefix:** `carriers/:carrierId/drivers`
**Serialization:** Uses `DriverResponseDto` with `plainToInstance`.

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/carriers/:carrierId/drivers` | (class-level roles) | List carrier drivers |
| POST | `/carriers/:carrierId/drivers` | (class-level roles) | Create driver |
| GET | `/carriers/:carrierId/drivers/expiring-credentials` | (class-level roles) | List expiring credentials |
| GET | `/carriers/:carrierId/drivers/:id` | (class-level roles) | Get driver by ID |
| PUT | `/carriers/:carrierId/drivers/:id` | (class-level roles) | Update driver |
| DELETE | `/carriers/:carrierId/drivers/:id` | (class-level roles) | Delete driver |
| PATCH | `/carriers/:carrierId/drivers/:id/status` | (class-level roles) | Update driver status |

---

## DriversGlobalController

**Path prefix:** `drivers`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/drivers` | (class-level roles) | List all drivers (cross-carrier) |
| GET | `/drivers/:id` | (class-level roles) | Get driver by ID |
| GET | `/drivers/:id/loads` | (class-level roles) | Get driver load history |

---

## InsurancesController

**Path prefix:** `carriers/:carrierId/insurance`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/carriers/:carrierId/insurance` | (class-level roles) | List carrier insurance policies |
| POST | `/carriers/:carrierId/insurance` | (class-level roles) | Create insurance policy |
| GET | `/carriers/:carrierId/insurance/:id` | (class-level roles) | Get insurance policy by ID |
| PUT | `/carriers/:carrierId/insurance/:id` | (class-level roles) | Update insurance policy |
| DELETE | `/carriers/:carrierId/insurance/:id` | (class-level roles) | Delete insurance policy |
| POST | `/carriers/:carrierId/insurance/:id/verify` | (class-level roles) | Verify insurance |
| GET | `/carriers/:carrierId/insurance/check-expired` | (class-level roles) | Check for expired insurance |

---

## Known Issues

- Uses `skip/take` pagination instead of standard `page/limit`
- Response serialization with `plainToInstance` and `CarrierResponseDto`/`DriverResponseDto`
