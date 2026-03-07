# Domain Rules — Ultra TMS (TMS Domain)

> These rules are NON-NEGOTIABLE. Every developer must understand them before modifying any service.
> Violating these rules causes data loss, billing errors, or compliance failures.

---

## Multi-Tenancy Rules

1. **Every entity belongs to exactly one tenant.** Every Prisma model has `tenantId: String`. No exceptions.
2. **Every query MUST filter by `tenantId`.** Queries without `tenantId` filter leak data across tenants. This is a critical security bug.
3. **Soft delete is mandatory.** Never hard-delete records. Set `deletedAt = now()` and filter `deletedAt: null` on all reads.
4. **Users cannot see other tenants' data.** Even ADMIN role is scoped to their tenant. Only SUPER_ADMIN sees cross-tenant data.
5. **Tenant creation is an admin-only operation.** Only SUPER_ADMIN can create new tenants.

---

## Load Lifecycle Rules

6. **A load must have exactly one origin and one destination.** A load with zero or two origins is invalid.
7. **Load status transitions are one-directional.** Loads move through: `DRAFT → QUOTED → BOOKED → DISPATCHED → IN_TRANSIT → DELIVERED → INVOICED → SETTLED`. You cannot revert to a previous status (except CANCELLED from any non-SETTLED state).
8. **A load cannot be dispatched without an assigned carrier.** The dispatch action requires `carrierId` to be set.
9. **A load cannot be invoiced until it is DELIVERED.** Financial operations only start after delivery confirmation.
10. **Load weight cannot be zero.** All loads must have a positive weight in lbs or kg.

---

## Carrier Management Rules

11. **A carrier must be qualified before being assigned to a load.** Qualification requires: valid MC number, active insurance, valid operating authority.
12. **Insurance expiry must be tracked.** Carriers with expired insurance cannot be assigned to new loads.
13. **CSA safety scores affect carrier eligibility.** Carriers with CSA violations above threshold are flagged.
14. **Carrier rates are load-type specific.** A carrier may have different rates for FTL, LTL, flatbed, refrigerated, hazmat.
15. **A carrier can be assigned to multiple simultaneous loads** (if their fleet capacity allows).

---

## Accounting Rules

16. **Invoices are generated per load.** One load = one invoice to the customer.
17. **Settlements are generated per load.** One load = one settlement to the carrier.
18. **An invoice cannot be paid before it is sent.** Invoice must progress: `DRAFT → SENT → PAID`.
19. **Settlements must match the agreed carrier rate.** Discrepancies require manual approval.
20. **Revenue = invoice amount. Cost = settlement amount. Margin = Revenue - Cost.** Never confuse these.
21. **Commission is calculated as a percentage of gross revenue.** Commission agents earn % of the invoice amount, not the margin.

---

## Quote / Sales Rules

22. **A quote must be accepted before becoming a load.** Quote status: `DRAFT → SENT → ACCEPTED → CONVERTED_TO_LOAD` or `REJECTED`.
23. **Quote rates have validity windows.** A rate quoted today may expire in 24-48 hours due to fuel surcharge changes.
24. **The Load Planner is the primary quote-to-load conversion tool.** It handles AI cargo extraction, route planning, and rate calculation. Do NOT rebuild or modify it.
25. **Accessorial charges are separate from base rate.** Fuel surcharge, detention, layover fees are line items, not bundled into base rate.

---

## CRM Rules

26. **Customers and carriers are separate entities.** A company can be both a customer and a carrier, but they have separate records linked by a `companyId`.
27. **Customer contacts belong to a customer.** A contact cannot exist without a parent customer.
28. **Customer credit limits must be checked before booking new loads.** If a customer exceeds their credit limit, new bookings require approval.

---

## Auth / Security Rules

29. **JWT tokens are stored in HttpOnly cookies.** Never store tokens in localStorage (XSS vulnerability).
30. **All endpoints require authentication** (via global JwtAuthGuard) unless explicitly marked `@Public()`.
31. **RBAC is mandatory on all write operations.** Read operations may be more permissive, but creates/updates/deletes require appropriate role.
32. **Passwords are never stored in plaintext.** bcrypt hashing is used (cost factor 12).
33. **The `/health` endpoint is the only truly public route** (for load balancer health checks).

---

## Data Integrity Rules

34. **Prisma migrations are the source of truth.** Never modify the database schema directly. Always generate a migration.
35. **`externalId` and `sourceSystem` fields are for ERP/migration integration.** Use them when importing data from other systems.
36. **`customFields` (JSON) allows extensibility without migrations.** Use for tenant-specific custom data, not for core business fields.
37. **Cascade deletes are forbidden.** When a parent is soft-deleted, children are NOT automatically deleted. Business logic determines child handling.

---

## Real-Time Rules

38. **Dispatch board requires WebSocket connection.** The dispatch board shows live load status updates. HTTP polling is not acceptable.
39. **Tracking updates must be idempotent.** If the same GPS ping arrives twice, it should not create duplicate tracking records.
40. **WebSocket connections are tenant-scoped.** A dispatcher can only receive updates for loads belonging to their tenant.
