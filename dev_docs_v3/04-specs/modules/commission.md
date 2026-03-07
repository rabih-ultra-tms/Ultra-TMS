# Commission Module API Spec

**Module:** `apps/api/src/modules/commission/`
**Base path:** `/api/v1/`
**Controllers:** CommissionPlansController, CommissionEntriesController, CommissionPayoutsController, CommissionsDashboardController

## Auth

Plans, Entries, and Payouts controllers use `@UseGuards(JwtAuthGuard, RolesGuard)` with `@Request() req` pattern. Dashboard uses `@CurrentTenant()`.

**Roles:** ADMIN, ACCOUNTING, COMMISSION_MANAGER, MANAGER (varies per endpoint)

---

## CommissionPlansController

**Path prefix:** `commission/plans`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/commission/plans` | ADMIN, ACCOUNTING, COMMISSION_MANAGER | List commission plans |
| POST | `/commission/plans` | ADMIN, COMMISSION_MANAGER | Create commission plan |
| GET | `/commission/plans/active` | ADMIN, ACCOUNTING, COMMISSION_MANAGER | List active plans |
| GET | `/commission/plans/:id` | ADMIN, ACCOUNTING, COMMISSION_MANAGER | Get plan by ID |
| PUT | `/commission/plans/:id` | ADMIN, COMMISSION_MANAGER | Update plan |
| DELETE | `/commission/plans/:id` | ADMIN | Delete plan |

**Query params (GET list):** `page`, `limit`, `sortBy`, `sortOrder`

---

## CommissionEntriesController

**Path prefix:** `commission/entries`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/commission/entries` | ADMIN, ACCOUNTING, COMMISSION_MANAGER | List commission entries |
| POST | `/commission/entries` | ADMIN, COMMISSION_MANAGER | Create commission entry |
| GET | `/commission/entries/:id` | ADMIN, ACCOUNTING, COMMISSION_MANAGER | Get entry by ID |
| PUT | `/commission/entries/:id` | ADMIN, COMMISSION_MANAGER | Update entry |
| DELETE | `/commission/entries/:id` | ADMIN | Delete entry |
| POST | `/commission/entries/:id/approve` | ADMIN, COMMISSION_MANAGER | Approve entry |
| POST | `/commission/entries/:id/reverse` | ADMIN | Reverse entry |
| POST | `/commission/entries/calculate/:loadId` | ADMIN, COMMISSION_MANAGER | Calculate commission for load |
| GET | `/commission/entries/user/:userId/earnings` | ADMIN, ACCOUNTING, COMMISSION_MANAGER | Get user earnings |

**Query params (GET list):** `page`, `limit`, `sortBy`, `sortOrder`

---

## CommissionPayoutsController

**Path prefix:** `commission/payouts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/commission/payouts` | ADMIN, ACCOUNTING, COMMISSION_MANAGER | List payouts |
| POST | `/commission/payouts` | ADMIN, COMMISSION_MANAGER | Create payout |
| GET | `/commission/payouts/:id` | ADMIN, ACCOUNTING, COMMISSION_MANAGER | Get payout by ID |
| PUT | `/commission/payouts/:id` | ADMIN, COMMISSION_MANAGER | Update payout |
| DELETE | `/commission/payouts/:id` | ADMIN | Delete payout |
| POST | `/commission/payouts/:id/approve` | ADMIN | Approve payout |
| POST | `/commission/payouts/:id/process` | ADMIN | Process payout |
| POST | `/commission/payouts/:id/void` | ADMIN | Void payout |

**Query params (GET list):** `page`, `limit`, `sortBy`, `sortOrder`

---

## CommissionsDashboardController

**Path prefix:** `commissions`
**Auth:** Uses `@CurrentTenant()` pattern (different from other controllers in this module)

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/commissions/dashboard` | (class-level roles) | Commission dashboard |
| GET | `/commissions/reports` | (class-level roles) | Commission reports |
| GET | `/commissions/reps` | (class-level roles) | List commission reps |
| GET | `/commissions/transactions` | (class-level roles) | List transactions |
| POST | `/commissions/transactions/:id/approve` | (class-level roles) | Approve transaction |
| POST | `/commissions/transactions/:id/void` | (class-level roles) | Void transaction |

---

## Known Issues

- Mixed auth patterns: Plans/Entries/Payouts use `@Request() req`, Dashboard uses `@CurrentTenant()`
- Dashboard controller uses path `commissions` (plural) while others use `commission` (singular)
