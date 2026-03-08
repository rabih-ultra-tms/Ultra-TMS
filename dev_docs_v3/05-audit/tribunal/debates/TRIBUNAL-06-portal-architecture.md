# TRIBUNAL-06: Portal Architecture (Separate JWT Systems)

> **Filed:** 2026-03-07
> **Topic:** Is the separate JWT architecture for Customer and Carrier portals the right pattern?
> **Evidence:** `00-evidence-pack.md`, `decision-log.md` (ADR-006, ADR-012), codebase inspection
> **Presiding:** Architecture Tribunal

---

## The Charge

Ultra TMS implements three parallel authentication systems: one for the main application (broker users), one for the Customer Portal, and one for the Carrier Portal. Each uses a distinct JWT secret (`JWT_SECRET`, `CUSTOMER_PORTAL_JWT_SECRET`, `CARRIER_PORTAL_JWT_SECRET`). The Customer Portal has 7 controller sub-modules (auth, dashboard, shipments, invoices, payments, quotes, users) totaling approximately 40 endpoints. The Carrier Portal has 7 controller sub-modules (auth, compliance, dashboard, documents, invoices, loads, users) totaling approximately 54 endpoints. Both portals have zero frontend pages.

The Tribunal must determine whether this three-secret, three-guard, 14-sub-module architecture is the correct design decision, or whether it represents unnecessary complexity that should be collapsed into a single auth system with role-based access.

---

## Prosecution

The prosecution argues that three parallel authentication systems create unjustifiable maintenance burden, code duplication, and security surface area for a product that has zero portal users and zero portal frontend pages.

### 1. Three Auth Systems Means Three Attack Surfaces

Every JWT implementation is a potential vulnerability. Secret rotation, token expiration, refresh token handling, token revocation, CORS configuration, cookie policies -- each of these must be correctly implemented and maintained for all three systems independently. ADR-006 already documents that the main app's JWT implementation is violated (BUG-012: localStorage tokens at `lib/api/client.ts` lines 59, 77). That is one bug in one auth system. Three auth systems means three times the probability of a security misconfiguration.

The environment variables tell the story: `JWT_SECRET`, `CUSTOMER_PORTAL_JWT_SECRET`, `CARRIER_PORTAL_JWT_SECRET`. Three secrets to rotate. Three token formats to validate. Three guard implementations to audit. If the team struggles to secure one JWT system correctly (and the localStorage violation proves they do), tripling the auth surface is reckless.

### 2. Fourteen Portal Controllers Duplicate Existing Logic

The Customer Portal has controllers for shipments, invoices, payments, quotes, dashboard, users, and auth. The main API already has controllers for loads, invoices, payments, quotes, dashboards, users, and auth. The Carrier Portal has controllers for loads, documents, invoices, compliance, dashboard, users, and auth.

That is three invoice controllers, three user controllers, three auth controllers, three dashboard controllers, and two load controllers. The prosecution acknowledges that the portal controllers may be "thin wrappers" calling shared services. But thin wrappers are still code that must be maintained, tested, versioned, and debugged. Every shared service change must be verified against three controller layers. Every DTO change propagates to three validation pipelines.

At 14 sub-modules across two portals, plus the main API's existing modules, the controller count inflates significantly for functionality that serves zero users. This is speculative architecture -- building for a future that may never arrive.

### 3. A Single Auth System With Roles Would Be Simpler

The standard pattern for multi-audience applications is a single JWT with a `role` claim:

```
{ sub: "user-123", role: "CUSTOMER", tenantId: "tenant-456", scope: ["loads:read", "invoices:read"] }
{ sub: "user-789", role: "CARRIER", tenantId: "tenant-456", scope: ["loads:read", "loads:accept", "documents:upload"] }
{ sub: "user-012", role: "BROKER_ADMIN", tenantId: "tenant-456", scope: ["*"] }
```

One JWT secret. One guard with role-based filtering. One set of controllers with `@Roles(CUSTOMER, CARRIER, BROKER)` decorators. The authorization logic (what data each role can see) moves into service-level guards, which Ultra TMS already has patterns for (`RolesGuard`, `JwtAuthGuard` documented in `CLAUDE.md`).

This approach:
- Eliminates two JWT secrets and their rotation lifecycle
- Reduces controller count by 14 (portal controllers become role-filtered routes on existing controllers)
- Centralizes auth debugging to one system
- Uses the existing `RolesGuard` pattern documented in ADR conventions

### 4. Zero Frontend Pages Means Zero Validation

The most damaging fact: neither portal has a single frontend page. Zero. Not one login screen, not one dashboard, not one shipment list. The 94 backend endpoints have never been exercised by a real user flow. The auth guards have never been tested against a real browser session. The scope restrictions have never been validated against actual UI interactions.

This means the architecture is entirely theoretical. The prosecution does not argue that separate portals are always wrong. The prosecution argues that building 94 endpoints across 14 sub-modules with separate JWT systems before building a single frontend page is premature optimization of the most dangerous kind: security infrastructure that has never been tested under real conditions.

### 5. Maintenance Cost Is Already Visible

The project has 72 tests covering 8.7% of frontend code and approximately 15% of backend code. Zero of those tests cover portal endpoints. Zero. That is 94 untested endpoints with separate authentication logic. When (not if) a breaking change occurs in the shared services these portals depend on, there will be no test to catch the regression. The portals will break silently, and because they have no frontend, nobody will notice until a customer or carrier tries to use them -- at which point the damage to credibility is already done.

---

## Defense

The defense argues that separate portal authentication is the industry-standard architecture for freight TMS platforms, that the thin-controller pattern minimizes code duplication, and that the security benefits of token isolation outweigh the maintenance cost.

### 1. Separate Portals Are Industry Standard

Every major TMS with portal functionality uses separate authentication for customer and carrier access:

- **McLeod** operates separate PowerBroker (broker), PowerBroker//web (carrier portal), and customer-facing tracking as distinct applications with separate auth.
- **Rose Rocket/TMS.ai** has a dedicated partner portal with its own authentication, separate from the main dispatch interface.
- **Turvo** has distinct carrier and shipper interfaces, each with independent login flows. Their carrier portal (1M+ drivers) operates as a separate application.
- **MercuryGate/Infios** has a shipper portal separate from the main TMS with its own identity management.

This is not a coincidence. It reflects a fundamental reality: brokers, customers, and carriers are different organizations with different trust levels. A carrier is not an employee. A customer is not a user of your TMS. They are external parties who should never share an authentication boundary with internal users.

### 2. Token Isolation Prevents Lateral Movement

If a single JWT secret is shared across all three audiences, a compromised customer token could be modified to claim carrier or broker roles. The attacker only needs to crack one secret. With separate secrets:

- A compromised `CUSTOMER_PORTAL_JWT_SECRET` gives access to customer data only. It cannot generate valid carrier or broker tokens because those use different secrets.
- A compromised `CARRIER_PORTAL_JWT_SECRET` gives access to carrier-scoped data only. The main application's `JWT_SECRET` remains unaffected.
- Lateral movement between audiences is architecturally impossible, not just policy-enforced.

This is defense in depth. The prosecution's single-role-claim approach relies entirely on application-level role checking. If a single guard has a bug, the entire system is compromised. With separate secrets, even a complete bypass of one portal's guards cannot affect the other two systems.

### 3. The Thin-Controller Pattern Minimizes Duplication

The prosecution alleges 14 sub-modules of duplicated logic. This mischaracterizes the architecture. Examining the portal module structure:

- `customer-portal/shipments/` -- calls `LoadsService.findMany()` with a `customerId` filter derived from the portal JWT. The controller is approximately 30-50 lines. It does not reimplement load logic.
- `carrier-portal/loads/` -- calls `LoadsService.findMany()` with a `carrierId` filter. Same service, different authorization scope.
- `customer-portal/invoices/` -- calls `InvoicesService` with customer-scoped filters.
- `carrier-portal/documents/` -- calls `DocumentsService` with carrier-scoped filters.

The pattern is consistent: portal controllers are authorization adapters, not logic duplicators. They translate "who is this external user?" into "what subset of data should they see?" and delegate all business logic to shared services. This is the Facade pattern -- a thin interface layer that presents a restricted view of a larger system.

The guards reinforce this separation. `company-scope.guard.ts` ensures customer portal users can only access data belonging to their company. `carrier-scope.guard.ts` ensures carrier portal users can only access loads assigned to their carrier. These guards are specific to portal authentication and would not exist in a single-auth model -- meaning the single-auth model would need to implement equivalent filtering logic somewhere else, likely in more complex and error-prone ways.

### 4. Separate Deployments Enable Independent Scaling

While Ultra TMS currently runs as a modular monolith (ADR-002), the portal module boundaries are clean extraction points. When the carrier portal serves 10,000 carriers and the main TMS serves 50 broker users, the load profiles are dramatically different. Separate modules with separate auth can be extracted to separate deployments without refactoring authentication.

A single-auth model with role-based filtering binds all three audiences to one deployment. When carrier portal traffic spikes during peak freight season, it degrades the broker experience. The current architecture avoids this coupling by design.

### 5. Different Data Views Justify Separate Endpoints

A customer and a broker do not see the same invoice. A customer sees: amount due, due date, payment status, load reference, documents. A broker sees: cost breakdown, margin, carrier pay, customer credit terms, aging bucket, collection notes, factoring status.

Forcing both views through a single controller with role-based field filtering creates controllers that are responsible for too many concerns. The response shape changes based on the caller's role. The validation rules change. The pagination defaults change. The sort orders change. Separate endpoints with explicit DTOs for each audience are cleaner, more testable, and more maintainable than a single polymorphic endpoint.

---

## Cross-Examination

**Q: The prosecution's point about zero tests on portal endpoints -- how does the defense respond?**

A: The defense concedes this is a legitimate risk. The 94 portal endpoints should have test coverage before any frontend is built against them. However, the lack of tests is a process failure, not an architecture failure. The correct response is to write tests, not to flatten the architecture.

**Q: The defense claims token isolation prevents lateral movement. But ADR-006 is already violated (localStorage tokens). How confident can we be in the security argument?**

A: The localStorage violation (BUG-012) affects the main application's auth, not the portal auth systems. It must be fixed regardless of portal architecture. However, the prosecution's broader point is fair: the team's track record on auth implementation is imperfect, which makes simpler architectures more attractive. The defense maintains that three simple auth systems are safer than one complex role-based system, because each simple system has a smaller blast radius.

**Q: Fourteen sub-modules for zero users. Is this not textbook YAGNI (You Aren't Gonna Need It)?**

A: The sub-modules are already built. The YAGNI argument applies to decisions about whether to build something, not to decisions about whether to keep something that already exists and follows correct patterns. Tearing down 94 working endpoints to rebuild them as role-filtered routes on existing controllers would cost more engineering time than it saves, and would introduce regression risk for no user-facing benefit.

**Q: Could the portals have been built as role-filtered routes and then extracted later if needed?**

A: Yes, technically. But extraction from a monolithic auth system into separate auth systems is a high-risk migration that touches every endpoint, every guard, and every token validation path. Building separate from the start avoids this future migration entirely. The defense argues this is not premature optimization -- it is architecture that avoids a known, costly migration.

---

## Evidence Exhibits

| # | Exhibit | Source | Key Finding |
|---|---------|--------|-------------|
| E-1 | Portal JWT secrets | `docker-compose.yml`, `CLAUDE.md` env section | Three separate secrets: `JWT_SECRET`, `CUSTOMER_PORTAL_JWT_SECRET`, `CARRIER_PORTAL_JWT_SECRET` |
| E-2 | Customer portal structure | `00-evidence-pack.md` | 7 sub-modules: auth, dashboard, shipments, invoices, payments, quotes, users. ~40 endpoints. |
| E-3 | Carrier portal structure | `00-evidence-pack.md` | 7 sub-modules: auth, compliance, dashboard, documents, invoices, loads, users. ~54 endpoints. |
| E-4 | Frontend page count | `00-evidence-pack.md`, `01-competitor-matrix.md` | Zero frontend pages for either portal |
| E-5 | ADR-006 violation | `decision-log.md` ADR-006 | BUG-012: localStorage tokens at `lib/api/client.ts` lines 59, 77 -- main auth already has implementation bug |
| E-6 | Test coverage | `00-evidence-pack.md` | 72 tests, 0 covering portal endpoints, 8.7% FE / ~15% BE coverage |
| E-7 | Scope guards | Codebase | `company-scope.guard.ts` and `carrier-scope.guard.ts` enforce data boundaries per portal audience |
| E-8 | ADR-002 modular monolith | `decision-log.md` ADR-002 | Architecture explicitly designed for future module extraction to microservices |
| E-9 | Industry precedent | `01-competitor-matrix.md` | McLeod, Rose Rocket, Turvo, MercuryGate all use separate portal auth systems |
| E-10 | Shared services pattern | Codebase | Portal controllers call `LoadsService`, `InvoicesService`, `DocumentsService` -- no logic duplication in services |

---

## Verdict: AFFIRM

**The charge is dismissed.** The separate portal JWT architecture is the correct design decision.

The prosecution raises valid concerns about maintenance burden and the lack of testing, but these are execution problems, not architecture problems. The defense successfully establishes that:

1. **Separate portal authentication is the industry standard** for freight TMS platforms. Every major competitor uses this pattern. Deviating from it would be the decision that requires justification, not conforming to it.

2. **Token isolation provides genuine security benefit.** Defense in depth via separate secrets prevents lateral movement between audiences. A compromised customer token cannot become a carrier token or a broker token. This property is architecturally guaranteed, not policy-dependent.

3. **The thin-controller pattern is the correct implementation.** Portal controllers are authorization adapters (30-50 lines each) that delegate to shared services. The "14 sub-modules of duplication" characterization is inaccurate -- the business logic lives in shared services, and the portal controllers only handle scope filtering and DTO transformation.

4. **The extraction path to separate deployments is clean.** When portal traffic exceeds main application traffic (a near-certainty if the product succeeds), the current module boundaries allow extraction without auth refactoring.

**However, the Tribunal notes a critical caveat:** the architecture is untested in practice. Zero frontend pages means zero real user flows have exercised these 94 endpoints. The architecture is theoretically correct but empirically unvalidated. This gap must be closed before any customer or carrier is granted portal access.

### Binding Orders

1. **Write integration tests for portal auth before building portal frontends.** Minimum coverage: token generation, token validation, scope enforcement (customer cannot see other customer's data), cross-portal token rejection (customer token rejected by carrier endpoints and vice versa). Target: 80% coverage on all portal auth and scope guard code.

2. **Fix BUG-012 (localStorage tokens) immediately.** The main application's auth violation undermines confidence in the entire auth infrastructure. ADR-006 is LOCKED and must be enforced. This is not a portal-specific issue but it is the single most visible auth failure in the codebase.

3. **Do not collapse portal auth into a single-role system.** The architecture is correct. The prosecution's simplicity argument is appealing but sacrifices security properties (token isolation, blast radius containment) that are worth the maintenance cost.

4. **Document the portal auth flow in an ADR.** The decision log has 15 ADRs but none explicitly covering portal authentication. Add ADR-016 documenting: separate JWT secrets, scope guard pattern, thin-controller facade, and the security rationale for token isolation. This prevents a future developer from "simplifying" the architecture without understanding why it exists.

5. **Prioritize one portal frontend as a proof-of-concept.** The customer portal (40 endpoints) is the recommended first target. Build it, test the full auth flow end-to-end in a browser, and validate that scope guards actually prevent cross-tenant data access. Until this happens, the architecture is a blueprint, not a building.

---

*Tribunal adjourned. Next review: TRIBUNAL-07 (Testing Strategy).*
