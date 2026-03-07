# Safety Module API Spec

**Module:** `apps/api/src/modules/safety/`
**Base path:** `/api/v1/`
**Controllers:** AlertsController, CsaController, DqfController, FmcsaController, IncidentsController, InsuranceController, SafetyReportsController, SafetyScoresController
**Auth:** `JwtAuthGuard` + `RolesGuard`
**Scope:** P1-P2 — Carrier compliance is relevant to MVP carrier management. CSA, DQF, FMCSA lookup partially active.

---

## FmcsaController (Safety module)

**Route prefix:** `safety/fmcsa`
**Note:** Different from `carrier/fmcsa` endpoint. This is for bulk compliance checking.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/safety/fmcsa/lookup` | FMCSA lookup by MC/DOT |
| POST | `/safety/fmcsa/batch-lookup` | Batch FMCSA lookup |
| GET | `/safety/fmcsa/watch-list` | Carriers on safety watch list |

---

## InsuranceController

**Route prefix:** `safety/insurance`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/safety/insurance` | Add insurance record |
| GET | `/safety/insurance` | List insurance records |
| GET | `/safety/insurance/:carrierId` | Get carrier insurance |
| PATCH | `/safety/insurance/:id` | Update insurance |
| GET | `/safety/insurance/expiring` | Carriers with expiring insurance |

---

## IncidentsController

**Route prefix:** `safety/incidents`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/safety/incidents` | Report incident |
| GET | `/safety/incidents` | List incidents |
| GET | `/safety/incidents/:id` | Get incident |
| PATCH | `/safety/incidents/:id` | Update incident |
| POST | `/safety/incidents/:id/close` | Close incident |

---

## CsaController (Compliance, Safety, Accountability)

**Route prefix:** `safety/csa`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/safety/csa/:carrierId` | Get carrier CSA scores |
| POST | `/safety/csa/refresh/:carrierId` | Refresh CSA from FMCSA |
| GET | `/safety/csa/alerts` | Carriers with CSA violations |

---

## DqfController (Driver Qualification File)

**Route prefix:** `safety/dqf`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/safety/dqf/:carrierId` | DQF compliance status |
| POST | `/safety/dqf/:carrierId/documents` | Upload DQF document |
| GET | `/safety/dqf/expiring` | Expiring qualifications |

---

## SafetyScoresController

**Route prefix:** `safety/scores`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/safety/scores` | List carrier safety scores |
| GET | `/safety/scores/:carrierId` | Individual carrier score |
| POST | `/safety/scores/:carrierId/recalculate` | Recalculate score |

---

## AlertsController (Safety)

**Route prefix:** `safety/alerts`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/safety/alerts` | List safety alerts |
| POST | `/safety/alerts/:id/acknowledge` | Acknowledge alert |
| POST | `/safety/alerts/:id/resolve` | Resolve alert |

---

## SafetyReportsController

**Route prefix:** `safety/reports`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/safety/reports/compliance` | Overall compliance report |
| GET | `/safety/reports/incidents` | Incident frequency report |
| GET | `/safety/reports/insurance-coverage` | Insurance coverage report |

---

## Integration with Carrier Module

- **Carrier scorecard** (`/carriers/:id/scorecard`) calls safety module endpoints
- **`useCarrierScorecard` hook** (`lib/hooks/carriers/use-carrier-scorecard.ts`) consumes safety data
- **FMCSA lookup** in carrier module (`GET /carriers/fmcsa/:mc`) is separate from safety/fmcsa batch lookup
