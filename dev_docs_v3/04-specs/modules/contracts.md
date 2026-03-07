# Contracts Module API Spec

**Module:** `apps/api/src/modules/contracts/`
**Base path:** `/api/v1/`
**Controllers:** ContractsController, AmendmentsController, FuelSurchargeController, RateLanesController, RateTablesController, SlasController, ContractTemplatesController, VolumeCommitmentsController

## Auth

All controllers use `@UseGuards(JwtAuthGuard)` (some add `RolesGuard`). Uses `@CurrentUser()` returning `CurrentUserData` (tenantId + userId). Role-based access varies significantly by controller.

---

## ContractsController

**Path prefix:** `contracts`
**Auth:** JwtAuthGuard + RolesGuard
**Roles:** ADMIN, SALES_MANAGER, SALES_REP, OPERATIONS_MANAGER, ACCOUNTING

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/contracts` | ADMIN, SALES_MANAGER, SALES_REP, OPERATIONS_MANAGER, ACCOUNTING | List contracts |
| POST | `/contracts` | ADMIN, SALES_MANAGER, OPERATIONS_MANAGER | Create contract |
| GET | `/contracts/:id` | ADMIN, SALES_MANAGER, SALES_REP, OPERATIONS_MANAGER, ACCOUNTING | Get contract by ID |
| PUT | `/contracts/:id` | ADMIN, SALES_MANAGER, OPERATIONS_MANAGER | Update contract |
| DELETE | `/contracts/:id` | ADMIN, SALES_MANAGER, OPERATIONS_MANAGER | Delete contract |
| POST | `/contracts/:id/submit` | ADMIN, SALES_MANAGER, OPERATIONS_MANAGER | Submit for approval |
| POST | `/contracts/:id/approve` | ADMIN, SALES_MANAGER, OPERATIONS_MANAGER | Approve contract |
| POST | `/contracts/:id/reject` | ADMIN, SALES_MANAGER, OPERATIONS_MANAGER | Reject contract |
| POST | `/contracts/:id/send-for-signature` | ADMIN, SALES_MANAGER, OPERATIONS_MANAGER | Send for signature |
| POST | `/contracts/:id/activate` | ADMIN, SALES_MANAGER, OPERATIONS_MANAGER | Activate contract |
| POST | `/contracts/:id/terminate` | ADMIN, SALES_MANAGER, OPERATIONS_MANAGER | Terminate contract |
| POST | `/contracts/:id/renew` | ADMIN, SALES_MANAGER, OPERATIONS_MANAGER | Renew contract |
| GET | `/contracts/:id/history` | ADMIN, SALES_MANAGER, SALES_REP, OPERATIONS_MANAGER, ACCOUNTING | Get contract history |

**State machine:** DRAFT -> SUBMITTED -> APPROVED -> SENT_FOR_SIGNATURE -> ACTIVE -> TERMINATED (also REJECTED from SUBMITTED)

---

## AmendmentsController

**Path prefix:** (mixed routes)
**Auth:** JwtAuthGuard
**Roles:** ADMIN, CONTRACTS_MANAGER, CONTRACTS_VIEWER

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/contracts/:contractId/amendments` | ADMIN, CONTRACTS_MANAGER, CONTRACTS_VIEWER | List amendments |
| POST | `/contracts/:contractId/amendments` | ADMIN, CONTRACTS_MANAGER | Create amendment |
| GET | `/amendments/:id` | ADMIN, CONTRACTS_MANAGER, CONTRACTS_VIEWER | Get amendment by ID |
| PUT | `/amendments/:id` | ADMIN, CONTRACTS_MANAGER | Update amendment |
| POST | `/amendments/:id/approve` | ADMIN, CONTRACTS_MANAGER | Approve amendment |
| POST | `/amendments/:id/apply` | ADMIN, CONTRACTS_MANAGER | Apply amendment |

---

## FuelSurchargeController

**Path prefix:** (mixed routes)
**Auth:** JwtAuthGuard
**Roles:** USER, MANAGER, ADMIN (class), VIEWER on read endpoints

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/fuel-tables` | VIEWER, USER, MANAGER, ADMIN | List fuel tables |
| POST | `/fuel-tables` | ADMIN | Create fuel table |
| GET | `/fuel-tables/:id` | VIEWER, USER, MANAGER, ADMIN | Get fuel table by ID |
| PUT | `/fuel-tables/:id` | USER, MANAGER, ADMIN | Update fuel table |
| DELETE | `/fuel-tables/:id` | ADMIN | Delete fuel table |
| GET | `/fuel-tables/:id/tiers` | VIEWER, USER, MANAGER, ADMIN | List fuel tiers |
| POST | `/fuel-tables/:id/tiers` | USER, MANAGER, ADMIN | Add fuel tier |
| PUT | `/fuel-tiers/:tierId` | USER, MANAGER, ADMIN | Update fuel tier |
| GET | `/fuel-surcharge/calculate` | VIEWER, USER, MANAGER, ADMIN | Calculate fuel surcharge |

---

## RateLanesController

**Path prefix:** `rate-tables/:rateTableId/lanes`
**Auth:** JwtAuthGuard
**Roles:** USER, MANAGER, ADMIN (class), VIEWER on read endpoints

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/rate-tables/:rateTableId/lanes` | VIEWER, USER, MANAGER, ADMIN | List rate lanes |
| POST | `/rate-tables/:rateTableId/lanes` | USER, MANAGER, ADMIN | Create rate lane |
| GET | `/rate-tables/:rateTableId/lanes/:id` | VIEWER, USER, MANAGER, ADMIN | Get rate lane by ID |
| PUT | `/rate-tables/:rateTableId/lanes/:id` | USER, MANAGER, ADMIN | Update rate lane |
| DELETE | `/rate-tables/:rateTableId/lanes/:id` | MANAGER, ADMIN | Delete rate lane |

---

## RateTablesController

**Path prefix:** (mixed routes)
**Auth:** JwtAuthGuard + RolesGuard
**Roles:** ADMIN, SALES_MANAGER, OPERATIONS_MANAGER, ACCOUNTING

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/contracts/:contractId/rate-tables` | ADMIN, SALES_MANAGER, OPERATIONS_MANAGER, ACCOUNTING | List rate tables |
| POST | `/contracts/:contractId/rate-tables` | ADMIN, SALES_MANAGER | Create rate table |
| GET | `/rate-tables/:id` | ADMIN, SALES_MANAGER, OPERATIONS_MANAGER, ACCOUNTING | Get rate table by ID |
| PUT | `/rate-tables/:id` | ADMIN, SALES_MANAGER | Update rate table |
| DELETE | `/rate-tables/:id` | ADMIN, SALES_MANAGER | Delete rate table |
| POST | `/rate-tables/:id/import` | ADMIN | Import rate table rows |
| GET | `/rate-tables/:id/export` | ADMIN, SALES_MANAGER, OPERATIONS_MANAGER, ACCOUNTING | Export rate table |

**Query params (GET export):** `format` (csv or xlsx)

---

## SlasController

**Path prefix:** (mixed routes)
**Auth:** JwtAuthGuard
**Roles:** USER, MANAGER, ADMIN (class), VIEWER on read endpoints

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/contracts/:contractId/slas` | VIEWER, USER, MANAGER, ADMIN | List contract SLAs |
| POST | `/contracts/:contractId/slas` | USER, MANAGER, ADMIN | Create SLA |
| GET | `/slas/:id` | VIEWER, USER, MANAGER, ADMIN | Get SLA by ID |
| PUT | `/slas/:id` | USER, MANAGER, ADMIN | Update SLA |
| DELETE | `/slas/:id` | MANAGER, ADMIN | Delete SLA |
| GET | `/slas/:id/performance` | VIEWER, USER, MANAGER, ADMIN | Get SLA performance |

**Query params (GET performance):** `actual` (optional actual value override)

---

## ContractTemplatesController

**Path prefix:** `contract-templates`
**Auth:** JwtAuthGuard
**Roles:** ADMIN, CONTRACTS_MANAGER, CONTRACTS_VIEWER

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/contract-templates` | ADMIN, CONTRACTS_MANAGER, CONTRACTS_VIEWER | List templates |
| POST | `/contract-templates` | ADMIN, CONTRACTS_MANAGER | Create template |
| GET | `/contract-templates/:id` | ADMIN, CONTRACTS_MANAGER, CONTRACTS_VIEWER | Get template by ID |
| PUT | `/contract-templates/:id` | ADMIN, CONTRACTS_MANAGER | Update template |
| DELETE | `/contract-templates/:id` | ADMIN, CONTRACTS_MANAGER | Delete template |
| POST | `/contract-templates/:id/clone` | ADMIN, CONTRACTS_MANAGER | Clone template |

---

## VolumeCommitmentsController

**Path prefix:** (mixed routes)
**Auth:** JwtAuthGuard
**Roles:** USER, MANAGER, ADMIN (class), VIEWER on read endpoints

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/contracts/:contractId/volume-commitments` | VIEWER, USER, MANAGER, ADMIN | List volume commitments |
| POST | `/contracts/:contractId/volume-commitments` | USER, MANAGER, ADMIN | Create volume commitment |
| GET | `/volume-commitments/:id` | VIEWER, USER, MANAGER, ADMIN | Get by ID |
| PUT | `/volume-commitments/:id` | USER, MANAGER, ADMIN | Update |
| DELETE | `/volume-commitments/:id` | MANAGER, ADMIN | Delete |
| GET | `/volume-commitments/:id/performance` | VIEWER, USER, MANAGER, ADMIN | Get performance |

---

## Known Issues

- Inconsistent role naming (CONTRACTS_MANAGER vs SALES_MANAGER vs MANAGER)
- Mixed route patterns (some nested under contracts, some top-level)
- Uses generic role names (USER, VIEWER, MANAGER) that differ from other modules
