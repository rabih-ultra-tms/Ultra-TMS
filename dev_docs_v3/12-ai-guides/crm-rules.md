# CRM Domain Rules

> AI Dev Guide | Source: `dev_docs_v3/01-services/p0-mvp/03-crm.md`

---

## Entity Relationships

```
Customer (Company)
  |-- Contact[] (1:many, must belong to customer)
  |-- Opportunity[] (Lead, 1:many)
  |-- Order[] (from TMS Core)
  |-- Activity[] (activity log)
```

## Customer Credit Status Lifecycle

```
PENDING -> APPROVED (admin review)
APPROVED -> HOLD (auto: over limit or 3+ overdue 60d; or manual)
APPROVED -> COD (admin decision)
APPROVED -> PREPAID (admin decision)
HOLD -> APPROVED (admin release)
COD/PREPAID -> APPROVED (admin change)
APPROVED -> DENIED (admin, permanent -- rare)
```

- Credit HOLD auto-triggers when `currentBalance > creditLimit` OR when 3+ invoices are overdue > 60 days.
- Manual hold requires admin reason. Release requires admin review.
- CRM does not block orders directly -- it provides credit status that TMS Core checks.

## Lead Pipeline Stages

```
NEW -> QUALIFIED -> PROPOSAL -> NEGOTIATION -> WON -> CONVERTED
NEW/QUALIFIED/PROPOSAL/NEGOTIATION -> LOST (with reason)
LOST -> NEW (reopen)
```

- Stage regression is allowed but requires a reason note.
- WON auto-creates a customer conversion task.

## Lead-to-Customer Conversion

- `POST /crm/opportunities/:id/convert` creates a Customer from Lead data.
- Links all historical activities. Updates Opportunity status to CONVERTED.
- Lead record is preserved (soft-archived, not deleted).

## Contact Ownership Rules

- Every Contact MUST belong to a Customer (company). Orphaned contacts are invalid.
- Contact type must be: PRIMARY, BILLING, OPERATIONS, EMERGENCY, or OTHER.
- Contact emails must be unique within a customer.

## Customer Code Format

- 2-20 characters, uppercase alphanumeric, unique per tenant.
- Auto-generated as `CUST-{NNN}` if not provided.
- Cannot be changed after creation (used as external reference).

## Soft Delete

- All deletes set `deletedAt` timestamp. Hard deletes forbidden.
- Deleted customers appear in "deleted" filter only. 7-year retention before purge.

## API Endpoints (20 total)

| Method | Path | Notes |
|--------|------|-------|
| GET/POST | `/api/v1/crm/customers` | List + Create |
| GET/PATCH/DELETE | `/api/v1/crm/customers/:id` | Detail + Update + Soft delete |
| GET/POST | `/api/v1/crm/contacts` | List + Create |
| GET/PATCH/DELETE | `/api/v1/crm/contacts/:id` | Detail + Update + Soft delete |
| GET/POST | `/api/v1/crm/opportunities` | List + Create |
| GET/PATCH/DELETE | `/api/v1/crm/opportunities/:id` | Detail + Update + Soft delete |
| GET | `/api/v1/crm/opportunities/pipeline` | Grouped by stage for Kanban |
| PATCH | `/api/v1/crm/opportunities/:id/stage` | Stage change (drag-drop) |
| POST | `/api/v1/crm/opportunities/:id/convert` | Convert to customer |
| GET/POST | `/api/v1/crm/activities` | Activity list + Log activity |

## Known Issues

- Delete buttons missing on Contacts and Leads tables (BUG-009)
- Owner filter is text input instead of user dropdown (BUG-010)
- Convert-to-customer dialog not wired to Lead Detail (BUG-010)
- Zero tests written -- highest priority gap
