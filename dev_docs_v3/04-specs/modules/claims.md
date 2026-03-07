# Claims Module API Spec

**Module:** `apps/api/src/modules/claims/`
**Base path:** `/api/v1/`
**Controllers:** ClaimsController, ClaimDocumentsController, ClaimItemsController, ClaimNotesController, ReportsController, ResolutionController, SubrogationController

## Auth

All controllers use `@UseGuards(JwtAuthGuard)` with `@CurrentTenant()` and `@CurrentUser('id')`.

---

## ClaimsController

**Path prefix:** `claims`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/claims` | JWT only | List claims |
| POST | `/claims` | JWT only | Create claim |
| GET | `/claims/:id` | JWT only | Get claim by ID |
| PUT | `/claims/:id` | JWT only | Update claim |
| DELETE | `/claims/:id` | JWT only | Delete claim |
| POST | `/claims/:id/file` | JWT only | File claim |
| POST | `/claims/:id/assign` | JWT only | Assign claim handler |
| PATCH | `/claims/:id/status` | JWT only | Update claim status |

---

## ClaimDocumentsController

**Path prefix:** `claims/:claimId/documents`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/claims/:claimId/documents` | JWT only | List claim documents |
| POST | `/claims/:claimId/documents` | JWT only | Add document to claim |
| DELETE | `/claims/:claimId/documents/:documentId` | JWT only | Remove document from claim |

---

## ClaimItemsController

**Path prefix:** `claims/:claimId/items`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/claims/:claimId/items` | JWT only | List claim items |
| POST | `/claims/:claimId/items` | JWT only | Add claim item |
| GET | `/claims/:claimId/items/:id` | JWT only | Get claim item by ID |
| PUT | `/claims/:claimId/items/:id` | JWT only | Update claim item |
| DELETE | `/claims/:claimId/items/:id` | JWT only | Delete claim item |

---

## ClaimNotesController

**Path prefix:** `claims/:claimId/notes`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/claims/:claimId/notes` | JWT only | List claim notes |
| POST | `/claims/:claimId/notes` | JWT only | Add claim note |
| PUT | `/claims/:claimId/notes/:id` | JWT only | Update note |
| DELETE | `/claims/:claimId/notes/:id` | JWT only | Delete note |

---

## ReportsController (Claims)

**Path prefix:** `claims/reports`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/claims/reports/status` | JWT only | Claims by status report |
| GET | `/claims/reports/types` | JWT only | Claims by type report |
| GET | `/claims/reports/financials` | JWT only | Claims financial report |
| GET | `/claims/reports/overdue` | JWT only | Overdue claims report |

---

## ResolutionController

**Path prefix:** `claims/:claimId/resolution`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | `/claims/:claimId/resolution/approve` | JWT only | Approve claim resolution |
| POST | `/claims/:claimId/resolution/deny` | JWT only | Deny claim |
| POST | `/claims/:claimId/resolution/pay` | JWT only | Process claim payment |
| POST | `/claims/:claimId/resolution/close` | JWT only | Close claim |
| POST | `/claims/:claimId/resolution/investigation` | JWT only | Start investigation |
| GET | `/claims/:claimId/resolution/adjustments` | JWT only | List adjustments |
| POST | `/claims/:claimId/resolution/adjustments` | JWT only | Create adjustment |
| PUT | `/claims/:claimId/resolution/adjustments/:id` | JWT only | Update adjustment |
| DELETE | `/claims/:claimId/resolution/adjustments/:id` | JWT only | Delete adjustment |

**Special:** Uses `@Audit()` decorator on critical operations (approve, deny, pay).

---

## SubrogationController

**Path prefix:** `claims/:claimId/subrogation`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/claims/:claimId/subrogation` | JWT only | List subrogation records |
| POST | `/claims/:claimId/subrogation` | JWT only | Create subrogation record |
| GET | `/claims/:claimId/subrogation/:id` | JWT only | Get subrogation by ID |
| PUT | `/claims/:claimId/subrogation/:id` | JWT only | Update subrogation |
| DELETE | `/claims/:claimId/subrogation/:id` | JWT only | Delete subrogation |
| POST | `/claims/:claimId/subrogation/:id/recover` | JWT only | Record recovery |

---

## Known Issues

- No RolesGuard on any controller -- all claim operations accessible to any authenticated user
- Uses `@Audit()` decorator only on resolution -- should be on all state transitions
