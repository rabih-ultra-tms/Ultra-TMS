# Contact Data Dictionary

> AI Dev Guide | Source: Prisma schema + `dev_docs_v3/01-services/p0-mvp/03-crm.md`

---

## Contact Entity

| Field | Type | Required | Validation | Default | Description |
|-------|------|----------|------------|---------|-------------|
| id | String (UUID) | Auto | - | Generated | Primary key |
| firstName | String | Yes | 1-100 chars | - | First name |
| lastName | String | Yes | 1-100 chars | - | Last name |
| email | String | Yes | Valid email, unique within customer | - | Contact email |
| phone | String | No | E.164 format | null | Phone number |
| title | String | No | - | null | Job title |
| type | ContactType | Yes | Enum | OTHER | PRIMARY, BILLING, OPERATIONS, EMERGENCY, OTHER |
| customerId | String | Yes | FK -> Customer | - | Parent company |
| tenantId | String | Yes | FK -> Tenant | - | Tenant isolation |
| createdAt | DateTime | Auto | - | now() | Created |
| updatedAt | DateTime | Auto | - | auto | Updated |
| deletedAt | DateTime | No | - | null | Soft delete |

## Contact Types

| Type | Purpose |
|------|---------|
| PRIMARY | Main point of contact for the company |
| BILLING | Receives invoices and payment communications |
| OPERATIONS | Handles shipping/receiving logistics |
| EMERGENCY | After-hours or urgent contact |
| OTHER | General or unclassified |

## Ownership Rules

1. Every Contact MUST belong to a Customer (company). Orphaned contacts are invalid.
2. A company can have multiple contacts of the same type.
3. Contact emails must be unique within a customer (not globally).

## Deduplication Rules

- Duplicate detection is based on email within the same customer.
- Duplicate email triggers error: "Email already registered for this customer" with the existing record ID.
- Cross-customer duplicate emails are allowed (same person may be contact at multiple companies).
- No automated merge -- manual resolution required.

## Company-Contact Relationship

```
Customer (Company)
  |-- Contact[] (1:many, minimum 0)
      |-- type: PRIMARY (recommended to have at least 1)
      |-- type: BILLING (used for invoice emails)
      |-- type: OPERATIONS (used for shipping notifications)
```

## Contact in Other Contexts

### Carrier Contacts

Carrier contacts are stored separately in `CarrierContact` entity (different table, different schema). They share similar fields but are NOT the same entity as CRM contacts.

### Quote Contacts

Quotes can reference a specific contact via `contactId` (FK -> Contact). This determines who receives the quote email.

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| `email` | IsEmail, unique within customer | "Email already registered for this customer" |
| `phone` | Optional, E.164 if provided | "Invalid phone number format" |
| `type` | IsEnum(ContactType) | "Invalid contact type" |
| `customerId` | Must exist in tenant | "Customer not found" |
| Delete | Soft delete only | N/A -- enforced server-side |

## API Endpoints

| Method | Path | Status |
|--------|------|--------|
| GET | `/api/v1/crm/contacts` | Production -- list with search, company, status filters |
| POST | `/api/v1/crm/contacts` | Production -- create contact |
| GET | `/api/v1/crm/contacts/:id` | Production -- detail |
| PATCH | `/api/v1/crm/contacts/:id` | Production -- update |
| DELETE | `/api/v1/crm/contacts/:id` | Production -- soft delete (no UI button: BUG-009) |

## Known Issues

- Delete button missing from Contacts table and detail page (BUG-009)
- Contacts list has no search/filters despite backend support (CRM-101)
- `useDeleteContact` hook exists but is not wired to UI
