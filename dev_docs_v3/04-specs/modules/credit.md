# Credit Module API Spec

**Module:** `apps/api/src/modules/credit/`
**Base path:** `/api/v1/`
**Controllers:** CreditApplicationsController, CollectionsController, CreditHoldsController, CreditLimitsController, PaymentPlansController

## Auth

All controllers use `@UseGuards(JwtAuthGuard)` with `@CurrentTenant()` and `@CurrentUser()`.

**Roles:** ADMIN, CREDIT_ANALYST, CREDIT_VIEWER (varies per endpoint)

---

## CreditApplicationsController

**Path prefix:** `credit/applications`
**Roles:** ADMIN, CREDIT_ANALYST (class-level)

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | `/credit/applications` | ADMIN, CREDIT_ANALYST | Create credit application |
| GET | `/credit/applications` | ADMIN, CREDIT_ANALYST, CREDIT_VIEWER | List applications |
| GET | `/credit/applications/:id` | ADMIN, CREDIT_ANALYST, CREDIT_VIEWER | Get application by ID |
| PUT | `/credit/applications/:id` | ADMIN, CREDIT_ANALYST | Update application |
| DELETE | `/credit/applications/:id` | ADMIN, CREDIT_ANALYST, @HttpCode(200) | Delete application |
| POST | `/credit/applications/:id/submit` | ADMIN, CREDIT_ANALYST, @HttpCode(200) | Submit application |
| POST | `/credit/applications/:id/approve` | ADMIN, @HttpCode(200) | Approve application |
| POST | `/credit/applications/:id/reject` | ADMIN, @HttpCode(200) | Reject application |

**Query params (GET list):** Via `CreditApplicationQueryDto`

---

## CollectionsController

**Path prefix:** `credit/collections`
**Roles:** ADMIN, CREDIT_ANALYST (class-level)

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/credit/collections` | ADMIN, CREDIT_ANALYST, CREDIT_VIEWER | Get collections queue |
| GET | `/credit/collections/customer/:companyId` | ADMIN, CREDIT_ANALYST, CREDIT_VIEWER | Collections history by customer |
| POST | `/credit/collections` | ADMIN, CREDIT_ANALYST | Create collection activity |
| PUT | `/credit/collections/:id` | ADMIN, CREDIT_ANALYST | Update collection activity |
| GET | `/credit/collections/aging` | ADMIN, CREDIT_ANALYST, CREDIT_VIEWER | Get aging report |
| GET | `/credit/collections/follow-ups` | ADMIN, CREDIT_ANALYST, CREDIT_VIEWER | Get follow-ups due |

**Query params (GET queue):** Via `PaginationDto`

---

## CreditHoldsController

**Path prefix:** `credit/holds`
**Roles:** ADMIN, CREDIT_ANALYST (class-level)

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/credit/holds` | ADMIN, CREDIT_ANALYST, CREDIT_VIEWER | List credit holds |
| GET | `/credit/holds/customer/:companyId` | ADMIN, CREDIT_ANALYST, CREDIT_VIEWER | Get holds by customer |
| GET | `/credit/holds/:id` | ADMIN, CREDIT_ANALYST, CREDIT_VIEWER | Get hold by ID |
| POST | `/credit/holds` | ADMIN | Create credit hold |
| PATCH | `/credit/holds/:id/release` | ADMIN, @HttpCode(200) | Release credit hold |

**Query params (GET list):** `reason` (CreditHoldReason enum), `isActive` (boolean), plus PaginationDto

---

## CreditLimitsController

**Path prefix:** `credit/limits`
**Roles:** ADMIN, CREDIT_ANALYST (class-level)

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/credit/limits` | ADMIN, CREDIT_ANALYST, CREDIT_VIEWER | List credit limits |
| POST | `/credit/limits` | ADMIN | Create credit limit |
| PUT | `/credit/limits/:companyId` | ADMIN | Update credit limit |
| PATCH | `/credit/limits/:companyId/increase` | ADMIN, @HttpCode(200) | Increase credit limit |
| GET | `/credit/limits/:companyId/utilization` | ADMIN, CREDIT_ANALYST, CREDIT_VIEWER | Get utilization |
| GET | `/credit/limits/:companyId` | ADMIN, CREDIT_ANALYST, CREDIT_VIEWER | Get credit limit by company |

**Query params (GET list):** Via `CreditLimitQueryDto`

---

## PaymentPlansController

**Path prefix:** `credit/payment-plans`
**Roles:** ADMIN, CREDIT_ANALYST (class-level)

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/credit/payment-plans` | ADMIN, CREDIT_ANALYST, CREDIT_VIEWER | List payment plans |
| GET | `/credit/payment-plans/:id` | ADMIN, CREDIT_ANALYST, CREDIT_VIEWER | Get plan by ID |
| POST | `/credit/payment-plans` | ADMIN, CREDIT_ANALYST | Create payment plan |
| PUT | `/credit/payment-plans/:id` | ADMIN, CREDIT_ANALYST | Update payment plan |
| POST | `/credit/payment-plans/:id/record-payment` | ADMIN, CREDIT_ANALYST, @HttpCode(200) | Record payment |
| PATCH | `/credit/payment-plans/:id/cancel` | ADMIN, CREDIT_ANALYST, @HttpCode(200) | Cancel payment plan |

**Query params (GET list):** `status` (PaymentPlanStatus enum), plus PaginationDto

---

## Known Issues

- Uses `@HttpCode(HttpStatus.OK)` on POST/PATCH endpoints instead of returning 201/204
- CreditLimitsController uses `:companyId` param (not `:id`) -- inconsistent with other modules
