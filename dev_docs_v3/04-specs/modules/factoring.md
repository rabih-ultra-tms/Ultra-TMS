# Factoring Module API Spec

**Module:** `apps/api/src/modules/factoring/`
**Base path:** `/api/v1/`
**Controllers:** FactoringCompaniesController, CarrierFactoringStatusController, NoaRecordsController, FactoredPaymentsController, FactoringVerificationsController, FactoringRoutingController
**Auth:** `JwtAuthGuard` + `RolesGuard`
**Scope:** P2 feature — not in P0 MVP. Backend implemented, no frontend screens.

---

## FactoringCompaniesController

**Route prefix:** `factoring/companies`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/factoring/companies` | Add factoring company |
| GET | `/factoring/companies` | List factoring companies |
| GET | `/factoring/companies/:id` | Get company |
| PATCH | `/factoring/companies/:id` | Update company |
| DELETE | `/factoring/companies/:id` | Remove company |

---

## CarrierFactoringStatusController

**Route prefix:** `factoring/carrier-status`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/factoring/carrier-status/:carrierId` | Get carrier factoring status |
| PUT | `/factoring/carrier-status/:carrierId` | Set carrier factoring assignment |

---

## NoaRecordsController (Notice of Assignment)

**Route prefix:** `factoring/noa`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/factoring/noa` | Create NOA record |
| GET | `/factoring/noa` | List NOA records |
| GET | `/factoring/noa/:id` | Get NOA |
| PATCH | `/factoring/noa/:id/acknowledge` | Acknowledge NOA received |

---

## FactoredPaymentsController

**Route prefix:** `factoring/payments`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/factoring/payments` | List factored payment records |
| POST | `/factoring/payments/remit` | Record factoring company remittance |
| GET | `/factoring/payments/:id` | Get payment record |

---

## FactoringVerificationsController

**Route prefix:** `factoring/verifications`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/factoring/verifications` | Create verification request |
| GET | `/factoring/verifications/:invoiceId` | Get verification for invoice |
| PATCH | `/factoring/verifications/:id/complete` | Mark verification complete |

---

## Business Logic

When a carrier uses factoring:
1. NOA filed — payments for that carrier go to factoring company instead of carrier
2. Settlement processing checks carrier's factoring status
3. Payment routing automatically directs funds based on NOA
4. Verification confirms load delivery before factoring company advances funds

---

## Integration

- Links: `Carrier` → `FactoringCompany` via NOA
- Settlement service checks factoring status during `APPROVED → PROCESSED` transition
- `routing/` subdir: auto-routes settlement payments based on NOA
