# Tribunal ADR Amendments -- Ultra TMS

> These amendments result from Tribunal verdicts and should be formalized in decision-log.md.
> Date: 2026-03-07

## Proposed New ADRs

### ADR-016: Portal Authentication Architecture

**Source:** TRIBUNAL-06 (Portal Architecture) -- AFFIRM verdict
**Status:** Proposed
**Priority:** P1

The Tribunal affirmed the separate JWT architecture for Customer and Carrier portals but found it undocumented in the ADR log. This decision must be formalized to prevent future developers from "simplifying" the architecture without understanding the security rationale.

**Must document:**
- Separate JWT secrets per portal audience (`JWT_SECRET`, `CUSTOMER_PORTAL_JWT_SECRET`, `CARRIER_PORTAL_JWT_SECRET`)
- Token isolation rationale: compromised customer token cannot generate valid carrier or broker tokens
- Thin-controller facade pattern: portal controllers are authorization adapters (~30-50 lines each) that delegate to shared services
- Scope guard pattern: `company-scope.guard.ts` and `carrier-scope.guard.ts` enforce data boundaries
- Blast radius containment: each portal's auth system is independently compromisable without affecting others
- Industry precedent: McLeod, Rose Rocket, Turvo, MercuryGate all use separate portal auth
- Extraction path: portal modules are clean extraction points for independent deployment when traffic warrants it
- Decision: LOCKED once written. Do not collapse into single-role JWT system.

### ADR-017: Service Taxonomy (Infrastructure vs Services)

**Source:** TRIBUNAL-01 (Service Scope) -- MODIFY verdict
**Status:** Proposed
**Priority:** P2

The Tribunal found that 6 of the 38 "services" are infrastructure components (Email, Storage, Redis, Health, Operations, Super Admin) that should not share a tier with actual TMS features. A new classification is needed.

**Must document:**
- Definition of "service" vs "infrastructure component" in Ultra TMS context
- Infrastructure tier (`p-infra/`): modules with 0-1 controllers that provide cross-cutting capabilities
- Abbreviated hub format (5 sections: purpose, dependencies, config, API surface, owner) for infrastructure
- Full hub format (15 sections) reserved for actual services
- Final count: 32 services across P0/P1/P2/P3 + 6 infrastructure components
- Decision: new modules must be classified at creation time as "service" or "infrastructure"

### ADR-018: Tenant Isolation Automation Strategy

**Source:** TRIBUNAL-05 (Multi-Tenant Architecture) -- MODIFY verdict
**Status:** Proposed
**Priority:** P0

The Tribunal found that manual tenantId WHERE clauses across 801 references with zero automation is not production-ready. ADR-012 acknowledged "Add Prisma middleware for automatic tenantId injection when scale demands it" but did not set a deadline. The Tribunal sets the deadline: before any production deployment.

**Must document:**
- Prisma Client Extension as primary enforcement mechanism (auto-inject tenantId + deletedAt IS NULL)
- CI lint rule as secondary enforcement (flag any direct `prisma.*` access bypassing the extension)
- Tenant isolation test suite as verification layer (Tenant A cannot see Tenant B data)
- Raw query audit requirement: all `$queryRaw` and `$executeRaw` must be manually reviewed for tenantId
- RLS on 10 most sensitive tables as defense-in-depth (P2, after extension is proven)
- SUPER_ADMIN bypass surface: document which code paths grant cross-tenant access and how they are tested
- Decision: LOCKED. No production deployment without Prisma Client Extension + tenant isolation tests.

### ADR-019: WebSocket Phased Rollout

**Source:** TRIBUNAL-09 (WebSocket Strategy) -- MODIFY verdict
**Status:** Proposed
**Priority:** P1

ADR-011 chose Socket.io and is LOCKED. The Tribunal does not reverse that decision. However, the original scope (4 namespaces simultaneously) is modified to a phased rollout.

**Must document:**
- Phase 1 (MVP): `/notifications` only -- validates entire Socket.io pipeline (JWT handshake, tenant room, Redis adapter)
- Phase 2 (post-MVP, gated on dispatch board 8+/10): `/dispatch` namespace
- Phase 3 (when features are ready): `/tracking` and `/dashboard` namespaces
- React Query polling (30-second interval) as explicit fallback for dispatch board at MVP
- SocketProvider must connect only to active namespaces (not all 4 at once)
- Decision: LOCKED. Do not implement all 4 namespaces until each gate is met.

### ADR-020: Demo-Ready Feature Gate

**Source:** TRIBUNAL-04 (Competitive Position), TRIBUNAL-10 (Missing Features) -- MODIFY verdicts
**Status:** Proposed
**Priority:** P0

The Tribunal identified that the product cannot survive a 30-minute broker demo. A formal feature gate is needed.

**Must document:**
- Demo-ready feature list: load lifecycle end-to-end, rate con PDF, BOL generation, CRM-to-load flow, basic customer portal page, basic reporting
- Each feature must pass a "demo scenario" test (scripted walkthrough that covers the entire flow)
- No external positioning, sales outreach, or demo scheduling until all demo-ready features pass
- Rate confirmation PDF and BOL generation share a common PDF template engine (build once)
- Decision: ACTIVE until demo-ready gate is passed, then archived.

## Proposed ADR Modifications

### ADR-002: NestJS Modular Monolith -- Add Note

**Source:** TRIBUNAL-01 (Service Scope)
**Modification:** Add a note distinguishing "service modules" (have controllers, serve business logic) from "infrastructure modules" (provide cross-cutting capabilities like email, storage, caching). The 40-module count should be reported as "34 service modules + 6 infrastructure modules" in future references.

### ADR-003: PostgreSQL + Prisma -- Add Note

**Source:** TRIBUNAL-07 (Data Model), TRIBUNAL-03 (Tech Stack)
**Modification:** Add notes:
1. Prisma Client Extension for auto tenantId injection is a mandatory P0 requirement (per ADR-018).
2. Prisma generate time must be benchmarked and logged. If it exceeds 10 seconds, investigate `--no-engine` flag or schema splitting.
3. P2/P3 models should be labeled with `// @deferred(tier)` comments for visibility.
4. Partial indexes on high-traffic tables (`(tenantId) WHERE deletedAt IS NULL`) are a P2 requirement.

### ADR-006: JWT Authentication -- Add Note

**Source:** TRIBUNAL-06 (Portal Architecture)
**Modification:** Add note that BUG-012 (localStorage tokens at `lib/api/client.ts` lines 59, 77) is a P0 violation of this ADR that must be fixed before any external user accesses the system. The localStorage pattern contradicts the ADR's cookie-based token policy and creates XSS exposure.

### ADR-011: Socket.io for Real-Time Communication -- Add Note

**Source:** TRIBUNAL-09 (WebSocket Strategy)
**Modification:** Add note that the implementation scope is phased per ADR-019. The original ADR chose Socket.io correctly; the amendment addresses rollout sequence, not technology choice. The infinite reconnection loop in `SocketProvider` must be fixed as part of Phase 1 implementation.

### ADR-012: Multi-Tenant Row-Level Isolation -- Add Note

**Source:** TRIBUNAL-05 (Multi-Tenant Architecture)
**Modification:** Upgrade the existing note "Add Prisma middleware for automatic tenantId injection when scale demands it" from a future consideration to a **mandatory P0 requirement**. The Tribunal found that the "when scale demands it" qualifier is incorrect -- the risk is not scale-dependent, it is present at any scale where multiple tenants exist. Replace with: "Prisma Client Extension for auto tenantId injection must be implemented before production deployment (see ADR-018)."

### ADR-015: Redis -- Add Note

**Source:** TRIBUNAL-03 (Tech Stack)
**Modification:** Add note that 2 of 3 documented Redis roles (application cache, Socket.io adapter) are currently unimplemented. Only BullMQ job queues are active. These roles should not be cited as justification for Redis until they are implemented. The Socket.io adapter becomes active when ADR-019 Phase 1 is implemented.

## ADRs Affirmed (No Changes)

### ADR-004: Next.js App Router -- AFFIRMED

**Source:** TRIBUNAL-03 (Tech Stack)
**Challenge:** Prosecution argued App Router adds complexity with zero SEO benefit for an auth-gated dashboard.
**Finding:** The nested layout system, API proxy, and file-based routing provide genuine architectural advantages. The RSC/SSR overhead is a concern but not sufficient to justify migration. The ADR is LOCKED and the cost of switching (rewriting 98 routes, layout system, API proxy) exceeds the cost of the current overhead.
**Caveat:** Run `next/bundle-analyzer` and count `"use client"` directives to quantify the actual overhead. If >80% of components are client-rendered, the RSC complexity should be documented as a known cost.

### ADR-002: NestJS Modular Monolith -- AFFIRMED (with note above)

**Source:** TRIBUNAL-03 (Tech Stack)
**Challenge:** Prosecution argued NestJS decorator overhead is heavy for AI-built code.
**Finding:** The modular structure supports future microservice extraction, dependency injection enables testability, and the module/provider system ensures explicit dependencies. The 40-module structure is appropriate for the domain complexity. ADR is LOCKED.

### ADR-003: PostgreSQL + Prisma -- AFFIRMED (with notes above)

**Source:** TRIBUNAL-03 (Tech Stack), TRIBUNAL-07 (Data Model)
**Challenge:** Prosecution argued Drizzle ORM would eliminate generation overhead.
**Finding:** Type safety across 260 models and 801 tenantId references is a survival mechanism, not a convenience. Migration to Drizzle would require rewriting ~225 service classes. ADR is LOCKED. Notes added for operational improvements.

### ADR-011: Socket.io -- AFFIRMED (with notes above)

**Source:** TRIBUNAL-09 (WebSocket Strategy)
**Challenge:** Prosecution argued SSE would be simpler for 3 of 4 namespaces.
**Finding:** ADR-011 correctly chose Socket.io. Mixing SSE and Socket.io would create two real-time transport layers with separate auth and error handling -- more complexity, not less. Socket.io's automatic HTTP long-polling fallback provides SSE-like degradation. The 360 lines of existing frontend infrastructure should not be discarded. ADR is LOCKED; scope is phased (ADR-019).

### ADR-012: Multi-Tenant Row-Level Isolation -- AFFIRMED (with notes above)

**Source:** TRIBUNAL-05 (Multi-Tenant Architecture)
**Challenge:** Prosecution argued PostgreSQL RLS should replace application-level filtering.
**Finding:** Row-level tenantId is the correct pattern for <1,000 tenants. RLS introduces its own risks (query planner opacity, CVE history, Prisma compatibility issues). The architecture is correct; the implementation needs automation (Prisma Client Extension) and verification (tenant isolation tests). ADR is LOCKED; automation is mandated via ADR-018.
