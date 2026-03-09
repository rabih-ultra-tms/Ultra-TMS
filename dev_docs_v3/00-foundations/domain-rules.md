# Domain Rules — Ultra TMS (TMS Domain)

> These rules are NON-NEGOTIABLE. Every developer must understand them before modifying any service.
> Violating these rules causes data loss, billing errors, or compliance failures.
> **Enforcement Legend:** `[DB]` = Database constraint | `[SVC]` = Service validation | `[FE]` = Frontend validation | `[NONE]` = Not yet enforced

---

## Multi-Tenancy Rules

1. **Every entity belongs to exactly one tenant.** Every Prisma model has `tenantId: String`. No exceptions. `[DB]` — column exists on all 260 models
2. **Every query MUST filter by `tenantId`.** Queries without `tenantId` filter leak data across tenants. This is a critical security bug. `[SVC]` — enforced in most CRUD queries, but **cross-cutting #4 confirms mutations in Auth, CRM, Sales, Accounting skip tenantId on update/delete**. Cross-cutting #34 confirms analytics/lookup queries in Search, Operations, Cache skip it too.
3. **Soft delete is mandatory.** Never hard-delete records. Set `deletedAt = now()` and filter `deletedAt: null` on all reads. `[SVC]` — partially enforced; cross-cutting #22 confirms 60% of Commission methods skip `deletedAt` filter. Cross-cutting #18 confirms Accounting has gaps.
4. **Users cannot see other tenants' data.** Even ADMIN role is scoped to their tenant. Only SUPER_ADMIN sees cross-tenant data. `[SVC]` — enforced via JWT tenantId extraction in JwtAuthGuard
5. **Tenant creation is an admin-only operation.** Only SUPER_ADMIN can create new tenants. `[SVC]` — enforced via RolesGuard on tenant endpoints

---

## Load Lifecycle Rules

6. **A load must have exactly one origin and one destination.** A load with zero or two origins is invalid. `[SVC]` — validated in LoadsService. Stops require min 1 PICKUP + 1 DELIVERY (DTO validation).
7. **Load status transitions are one-directional.** Loads move through: `DRAFT -> QUOTED -> BOOKED -> DISPATCHED -> IN_TRANSIT -> DELIVERED -> INVOICED -> SETTLED`. You cannot revert to a previous status (except CANCELLED from any non-SETTLED state). `[SVC]` — validated in DTO with transition matrix. **Note:** Actual load status machine in data-flow.md is more granular — see Rule 41.
8. **A load cannot be dispatched without an assigned carrier.** The dispatch action requires `carrierId` to be set. `[SVC]` — validated in LoadsService.dispatch()
9. **A load cannot be invoiced until it is DELIVERED.** Financial operations only start after delivery confirmation. `[SVC]` — validated in Accounting invoice creation
10. **Load weight cannot be zero.** All loads must have a positive weight in lbs or kg. `[SVC]` — validated in DTO. Weight is on Order model (`weightLbs` Decimal), not on Load. Load has weight limits 1-80,000 lbs.

---

## Extended Load Lifecycle Rules

41. **A load MUST transition through the full state machine:** PLANNING -> PENDING -> TENDERED -> ACCEPTED -> DISPATCHED -> AT_PICKUP -> PICKED_UP -> IN_TRANSIT -> AT_DELIVERY -> DELIVERED -> COMPLETED. No skip-ahead allowed. CANCELLED is reachable from TENDERED only (carrier rejects). This aligns with data-flow.md Section 2d. `[SVC]` — validated in DTO transition matrix. **Note:** Tender/accept/reject endpoints are NOT YET BUILT (TMS-018).

42. **TONU (Truck Ordered Not Used):** If a load is cancelled after a carrier is assigned (status >= TENDERED), a TONU fee applies. Default: $250 flat, configurable per carrier. Ranges $250-$500 depending on distance. Must create an accessorial charge record on the Load. Dispatcher must acknowledge the TONU before cancellation completes. `[SVC]` — business rule documented in TMS Core hub (Section 7, Rule 8). Implementation status: logic described but auto-creation of accessorial charge record NOT verified.

43. **Detention:** Free time at pickup/delivery is 2 hours. After 2 hours, detention charges accrue at $75/hour, max 8 hours per stop. Tracked via Stop `arrivedAt`/`departedAt` timestamps. Calculation: `detentionCharge = max(0, (actualTime - freeTime)) * hourlyRate`. Automatically calculated when a stop moves from ARRIVED to DEPARTED beyond free time. `[SVC]` — calculation logic documented in TMS Core hub (Section 7, Rule 7) and data-flow.md (Section 2e). **Note:** Stop model does NOT have `freeTimeHrs` or `detention` fields — detention is calculated at query time.

44. **Layover:** If a driver must wait overnight (>8 hours between stops), a layover fee of $350/day applies. Calculated from time between consecutive stop departures. `[NONE]` — not yet implemented. No layover detection logic exists in backend. Needs: scheduled job or post-delivery calculation to detect multi-stop gaps > 8 hours.

45. **Accessorial charges (detention, layover, lumper, TONU) MUST flow from the Load to the Invoice as line items automatically.** No manual re-entry. Load `accessorialCosts` (Decimal) aggregates all accessorial charges. Invoice should pull these as `InvoiceLineItem` records during auto-generation on DELIVERED status. `[NONE]` — auto-generation of invoice from delivered load creates a draft but accessorial line item flow is NOT verified to be automatic. PST-07 (Accounting tribunal) confirms invoice line items exist but auto-population from Load accessorials is undocumented.

---

## Carrier Qualification Rules

46. **A carrier MUST have active MC/DOT authority (FMCSA-verified) before being assigned any load.** FMCSA authority status must be AUTHORIZED. `[SVC]` — enforced in original `modules/carrier/` module (PENDING->ACTIVE requires FMCSA AUTHORIZED). **NOT enforced in Operations carriers module** (simple status string, no FMCSA check). PST-06 documents this dual-module gap.

47. **Minimum insurance requirements:** $1M auto liability, $100K cargo, $1M general liability. Verified via certificate of insurance (COI). `[SVC]` — enforced in Safety insurance service (`POST /safety/insurance` validates minimum coverage per type: AUTO_LIABILITY $1M, CARGO $100K per PST-25). **NOT enforced in Operations carriers module** (has `cargoInsuranceLimitCents` field but no validation logic).

48. **Insurance expiry monitoring:** Carrier status MUST change to SUSPENDED if any insurance policy expires. Auto-notification 30 days before expiry. `[SVC]` — partially implemented. Original carrier module has `checkExpiredInsurance()` method but **no cron trigger found** (PST-06, CARR-016). Safety module emits `safety.insurance.expiring` and `safety.insurance.expired` events (PST-25) but event consumers are NOT wired. Operations module has no insurance monitoring.

49. **CSA score threshold:** Carriers with BASICs scores above FMCSA intervention threshold in any category require manual review before load assignment. `[SVC]` — CSA scores stored and threshold flags set in Safety module (`isAboveThreshold` field on CsaScore model). Safety alerts auto-created for `CSA_THRESHOLD_EXCEEDED`. **BUT:** CSA data is currently STUBBED — `seededPercentile()` returns fake scores, not real FMCSA data (PST-25). Load assignment does NOT check CSA scores.

---

## Carrier Management Rules

11. **A carrier must be qualified before being assigned to a load.** Qualification requires: valid MC number, active insurance, valid operating authority. `[SVC]` — enforced in original carrier module. Operations module has qualificationTier field but no enforcement.
12. **Insurance expiry must be tracked.** Carriers with expired insurance cannot be assigned to new loads. `[SVC]` — see Rule 48 for implementation details.
13. **CSA safety scores affect carrier eligibility.** Carriers with CSA violations above threshold are flagged. `[SVC]` — see Rule 49 for implementation details.
14. **Carrier rates are load-type specific.** A carrier may have different rates for FTL, LTL, flatbed, refrigerated, hazmat. `[NONE]` — no rate-per-equipment-type model exists. Rates are per-load (`carrierRate` on Load model).
15. **A carrier can be assigned to multiple simultaneous loads** (if their fleet capacity allows). `[NONE]` — no fleet capacity tracking. Carrier assignment only checks status=ACTIVE + insurance not expired.

---

## Accounting Rules

16. **Invoices are generated per load.** One load = one invoice to the customer. `[SVC]` — Invoice model has `orderId` FK. Auto-generated on DELIVERED status.
17. **Settlements are generated per load.** One load = one settlement to the carrier. `[SVC]` — Settlement model has `loadId` FK via SettlementLineItem.
18. **An invoice cannot be paid before it is sent.** Invoice must progress: `DRAFT -> SENT -> PAID`. `[SVC]` — status transition validated in InvoiceService.
19. **Settlements must match the agreed carrier rate.** Discrepancies require manual approval. `[SVC]` — settlement amount comes from Load.carrierRate + accessorialCosts.
20. **Revenue = invoice amount. Cost = settlement amount. Margin = Revenue - Cost.** Never confuse these. `[SVC]` — calculated fields, not stored. Order has `customerRate` (revenue), Load has `carrierRate` (cost).
21. **Commission is calculated as a percentage of gross revenue.** Commission agents earn % of the invoice amount, not the margin. `[SVC]` — CommissionPlan defines rate. **BUT: auto-calculation trigger NOT WIRED** (PST-08: event listener needed for invoice PAID -> commission calculation).

---

## Quote / Sales Rules

22. **A quote must be accepted before becoming a load.** Quote status: `DRAFT -> SENT -> ACCEPTED -> CONVERTED_TO_LOAD` or `REJECTED`. `[SVC]` — validated in QuotesService.
23. **Quote rates have validity windows.** A rate quoted today may expire in 24-48 hours due to fuel surcharge changes. `[NONE]` — quote expiry cron does NOT exist (PST-04). EXPIRED status listed in state machine but no auto-expiry logic.
24. **The Load Planner is the primary quote-to-load conversion tool.** It handles AI cargo extraction, route planning, and rate calculation. Do NOT rebuild or modify it. `[FE]` — PROTECTED (9/10, 1,825 LOC).
25. **Accessorial charges are separate from base rate.** Fuel surcharge, detention, layover fees are line items, not bundled into base rate. `[SVC]` — Order has `accessorialCharges` and `fuelSurcharge` as separate Decimal fields.

---

## CRM Rules

26. **Customers and carriers are separate entities.** A company can be both a customer and a carrier, but they have separate records linked by a `companyId`. `[DB]` — separate Customer and Carrier models in Prisma.
27. **Customer contacts belong to a customer.** A contact cannot exist without a parent customer. `[DB]` — Contact has required `customerId` FK.
28. **Customer credit limits must be checked before booking new loads.** If a customer exceeds their credit limit, new bookings require approval. `[SVC]` — creditStatus field exists on Customer, checked during quote acceptance and order creation (data-flow.md Section 3, item 2).

---

## Auth / Security Rules

29. **JWT tokens are stored in HttpOnly cookies.** Never store tokens in localStorage (XSS vulnerability). `[NONE]` — **VIOLATED**: `apps/web/lib/api/client.ts` lines 59, 77 use localStorage (P0-001 bug). This is a known security finding.
30. **All endpoints require authentication** (via global JwtAuthGuard) unless explicitly marked `@Public()`. `[SVC]` — JwtAuthGuard applied globally in main.ts. Cross-cutting #30 found 2 webhook endpoints that inherit JwtAuth but need to be public for external callers (Twilio, HubSpot).
31. **RBAC is mandatory on all write operations.** Read operations may be more permissive, but creates/updates/deletes require appropriate role. `[SVC]` — partially enforced. Cross-cutting #17 confirms Accounting has 6/10 controllers without RolesGuard. PST-25 confirms Safety has 5/9 controllers missing RolesGuard. PST-26 confirms EDI has 4/8 controllers missing RolesGuard.
32. **Passwords are never stored in plaintext.** bcrypt hashing is used (cost factor 12). `[SVC]` — enforced in AuthService. **BUT:** PST-18 found factoring `apiKey` stored in plaintext. PST-26 found `ftpPassword` stored in plaintext in EdiTradingPartner.
33. **The `/health` endpoint is the only truly public route** (for load balancer health checks). `[SVC]` — enforced via `@Public()` decorator on HealthController.

---

## Data Integrity Rules

34. **Prisma migrations are the source of truth.** Never modify the database schema directly. Always generate a migration. `[DB]` — 31 migrations exist.
35. **`externalId` and `sourceSystem` fields are for ERP/migration integration.** Use them when importing data from other systems. `[DB]` — present on all models (migration-first architecture).
36. **`customFields` (JSON) allows extensibility without migrations.** Use for tenant-specific custom data, not for core business fields. `[DB]` — `Json @default("{}")` on all models.
37. **Cascade deletes are forbidden.** When a parent is soft-deleted, children are NOT automatically deleted. Business logic determines child handling. `[DB]` — no `onDelete: Cascade` in Prisma schema. Cross-cutting #9 found `AccessorialRate` uses hard delete (violation).

---

## Real-Time Rules

38. **Dispatch board requires WebSocket connection.** The dispatch board shows live load status updates. HTTP polling is not acceptable. `[NONE]` — WebSocket gateways NOT BUILT (QS-001). Dispatch board uses 30-second React Query polling as fallback (TMS Core hub Rule 11).
39. **Tracking updates must be idempotent.** If the same GPS ping arrives twice, it should not create duplicate tracking records. `[SVC]` — CheckCall creation uses standard POST with UUID generation. No idempotency key. **Note:** No TrackingEvent model exists — tracking stored on Load model + CheckCall records.
40. **WebSocket connections are tenant-scoped.** A dispatcher can only receive updates for loads belonging to their tenant. `[NONE]` — WebSocket gateways not built. When built, must extract tenantId from JWT cookie and filter rooms accordingly.

---

## Enforcement Status Summary

| Category | DB Constraint | Service Validation | Frontend Validation | Not Enforced |
|----------|--------------|-------------------|--------------------|--------------|
| Multi-Tenancy (1-5) | 1 | 3 | 0 | 1 (partial: mutation gaps) |
| Load Lifecycle (6-10, 41-45) | 0 | 6 | 0 | 4 (layover, accessorial flow, partial others) |
| Carrier Qualification (46-49) | 0 | 2 (partial) | 0 | 2 (partial: ops module gaps) |
| Carrier Management (11-15) | 0 | 2 | 0 | 3 |
| Accounting (16-21) | 0 | 5 | 0 | 1 (commission auto-calc) |
| Quote/Sales (22-25) | 0 | 2 | 1 | 1 (quote expiry) |
| CRM (26-28) | 2 | 1 | 0 | 0 |
| Auth/Security (29-33) | 0 | 3 | 0 | 2 (localStorage, RolesGuard gaps) |
| Data Integrity (34-37) | 3 | 0 | 0 | 1 (hard delete violation) |
| Real-Time (38-40) | 0 | 1 | 0 | 2 (WS not built) |
| **Total** | **6** | **25** | **1** | **17** |

> **35% of domain rules are not yet fully enforced.** Priority: Fix tenant isolation gaps (Rules 2, 46-49), then financial enforcement (Rules 21, 45), then real-time (Rules 38, 40).
