# TRIBUNAL-09: WebSocket Strategy

> **Filed:** 2026-03-07
> **Presiding:** Architecture Review Board
> **Respondent:** Ultra TMS Engineering (AI agents)
> **Related ADRs:** ADR-011 (Socket.io for Real-Time Communication), ADR-015 (Redis)
> **Evidence:** `00-evidence-pack.md`, `01-competitor-matrix.md`, `11-features/websockets.md`, QS-001 task file
> **Related Tribunal:** TRIBUNAL-03 (Tech Stack Validation -- Redis discussion)

---

## Charge

Ultra TMS's WebSocket strategy is currently broken. The frontend has 360 lines of socket infrastructure (`socket-provider.tsx` at 175 lines, `socket-config.ts` at 185 lines) connecting to four namespaces (`/dispatch`, `/tracking`, `/notifications`, `/dashboard`) that do not exist on the backend. There are zero `@WebSocketGateway` decorators anywhere in `apps/api/src/`. The existing `SocketProvider` has an infinite reconnection loop bug. QS-001, the task to build the backend gateways, is estimated at XL (14+ hours). For a pre-revenue product targeting small brokerages handling 20-50 loads per day, is Socket.io the right approach, or is this over-engineering a problem that polling solves?

---

## Prosecution (The Case Against)

### 1. Zero Backend Implementation After Months of Development

The most damning fact is the simplest: after months of development across 40 backend modules, 260 Prisma models, and ~187 controllers, not a single WebSocket gateway has been built. Zero. The backend has no `@WebSocketGateway` decorator, no `@SubscribeMessage` handler, no `WsJwtGuard`, no `WsThrottlerGuard`. The `websockets.md` feature spec describes a complete architecture -- JWT auth on handshake, tenant room isolation, Redis adapter, four namespaces -- that exists entirely on paper.

Meanwhile, the frontend team built 360 lines of typed socket infrastructure connecting to these nonexistent gateways. The `SocketProvider` eagerly connects to `/dispatch`, `/tracking`, `/notifications`, and `/dashboard` on every page load, producing an infinite reconnection loop when the server responds with connection failures. This is not a "partially implemented" feature. It is a frontend talking to a wall.

### 2. QS-001 Is XL Effort for Unproven Value

The QS-001 task estimates 14+ hours to implement four WebSocket gateways with JWT authentication, tenant room isolation, Redis adapter configuration, rate limiting, and typed event handlers. This is one of the largest single tasks in the quality sprint. For context:

- QS-003 (Accounting Dashboard Endpoint): M (4-6 hours)
- QS-007 (CORS Configuration): S (30 min)
- QS-009 (.bak Directory Cleanup): S (30 min)

The 14+ hours for QS-001 could instead fund the accounting dashboard endpoint, CORS fix, .bak cleanup, and still have 6+ hours left over for other quality work. The opportunity cost is enormous. And all of this is for a feature whose necessity has not been validated by a single real user.

### 3. SSE Would Be Simpler for the Primary Use Cases

Examine the four planned namespaces:

| Namespace | Direction | SSE Viable? |
|-----------|-----------|-------------|
| `/notifications` | Server-to-client only (status alerts, system messages) | Yes -- textbook SSE use case |
| `/tracking` | Server-to-client only (GPS updates, ETA changes) | Yes -- server pushes position updates |
| `/dashboard` | Server-to-client only (KPI metric refreshes) | Yes -- server pushes aggregated metrics |
| `/dispatch` | Bidirectional (load assignment, board refresh + user actions) | Partially -- subscribe is SSE, actions are REST POST |

Three of four namespaces are strictly server-to-client. SSE (Server-Sent Events) handles this natively over HTTP/2 with zero additional infrastructure -- no Redis adapter, no Socket.io library, no separate WebSocket port, no handshake authentication protocol. The dispatch namespace could use SSE for real-time board updates combined with standard REST calls for user actions (assign load, update status). This hybrid is simpler and uses existing infrastructure.

NestJS supports SSE natively via `@Sse()` decorators. The implementation is 10-20 lines per endpoint versus the 50-80 lines per gateway that Socket.io requires.

### 4. At 20-50 Loads Per Day, Polling Is Fine

Ultra TMS targets small-to-mid brokerages with 10-50 users. A 20-load-per-day brokerage generates perhaps 200 status updates per day -- roughly one every 2-3 minutes during business hours. React Query already polls on `refetchInterval`. A 30-second polling interval on the dispatch board would show updates within 30 seconds of occurrence. For a small brokerage where dispatchers are often on the phone with carriers anyway, 30-second latency is imperceptible.

The competitor matrix confirms this: **Tai TMS has no real-time WebSocket updates** and is considered competitive in the mid-market broker segment. Descartes Aljex has no real-time updates beyond MacroPoint integration. These products serve the exact same market Ultra TMS targets. The market has not punished them for lacking WebSocket.

### 5. Socket.io + Redis Adapter + JWT Auth + 4 Namespaces Is Enormous Complexity

The full planned architecture requires:

- Socket.io server library + client library (two dependencies)
- Redis adapter with pub/sub client pair (two additional Redis connections)
- `WsJwtGuard` (custom guard for WebSocket handshake authentication)
- `WsThrottlerGuard` (rate limiting for WebSocket messages)
- Per-namespace gateway classes (4 classes with lifecycle hooks)
- Room management logic (tenant rooms, user rooms, load rooms, dispatcher rooms)
- Typed event registry (20+ events defined in `socket-config.ts`)
- Reconnection logic with exponential backoff (already buggy in current frontend code)
- Graceful degradation to polling when WebSocket fails

This is a distributed real-time system layered on top of an application that has zero production users. It is engineering for scale that does not exist, solving a latency problem that has not been reported, using infrastructure (Redis adapter) that assumes horizontal scaling that is months or years away.

### 6. The Frontend Infinite Loop Bug Demonstrates the Complexity Cost

The existing `SocketProvider` has an infinite reconnection loop. This bug exists because Socket.io client-side connection management -- reconnection attempts, exponential backoff, auth token refresh on reconnect, namespace multiplexing -- is genuinely difficult to implement correctly. The bug was not caught by the 72 existing tests (none cover WebSocket). This is not an anomaly; it is a predictable consequence of adopting complex real-time infrastructure in a project with 8.7% test coverage.

---

## Defense (The Case For)

### 1. Real-Time Dispatch Is a Competitive Requirement

The competitor matrix is unambiguous: every serious TMS competitor has real-time capabilities. Turvo's entire architecture is built around real-time collaboration -- WebSocket-powered activity feeds, @mentions, and presence detection on every shipment. Rose Rocket/TMS.ai has real-time status halos on their dispatch board. McLeod's Symphony provides real-time updates in v25.2. The evidence pack lists "Working real-time tracking" as Critical Gap #1 -- something "every competitor from Aljex (MacroPoint) to McLeod (Symphony) has."

The prosecution cites Tai TMS and Aljex as evidence that polling is acceptable. But Tai TMS's lack of real-time is listed as a weakness in every review. Aljex's real-time came only after the Descartes acquisition added MacroPoint. The market tolerates the absence of real-time in legacy products -- it will not tolerate it in a product launching in 2026 that claims to be modern.

### 2. The Frontend Infrastructure Is Already Built

360 lines of typed socket infrastructure exist and function correctly (modulo the reconnection bug, which is a fixable implementation error, not an architectural flaw). The `socket-config.ts` file defines 20+ typed events with TypeScript interfaces. The `SocketProvider` handles namespace connections, authentication, and context propagation. This code represents 4-6 hours of completed work. Switching to SSE would discard this investment and require rebuilding the event type system, provider pattern, and hook interfaces from scratch.

### 3. NestJS Has First-Class WebSocket Support

NestJS's `@nestjs/websockets` + `@nestjs/platform-socket.io` packages provide decorators (`@WebSocketGateway`, `@SubscribeMessage`, `@WebSocketServer`) that integrate seamlessly with the existing guard, interceptor, and pipe infrastructure. The `WsJwtGuard` can reuse the existing `JwtAuthGuard` logic. The `TenantInterceptor` pattern for extracting tenantId from JWT applies identically to WebSocket connections. The NestJS ecosystem makes Socket.io implementation significantly less complex than building it from raw libraries.

The gateway pattern shown in `websockets.md` is 30 lines per namespace. Four namespaces is ~120 lines of gateway code plus shared guards and interceptors. The 14-hour QS-001 estimate includes testing, Redis adapter setup, and frontend bug fixes -- the gateway code itself is perhaps 4-5 hours.

### 4. ADR-011 Decided Socket.io -- It Is LOCKED

ADR-011 explicitly chose Socket.io over SSE, raw WebSockets, and third-party services (Ably, Pusher). The rationale addresses the prosecution's SSE argument directly: "SSE: rejected -- simpler but no bidirectional communication (dispatch needs two-way)." The decision also notes that the Redis adapter "enables horizontal scaling across multiple API instances" -- a real requirement when the product moves to production with multiple tenants.

Reopening ADR-011 requires a new ADR with evidence that the original rationale was wrong. The prosecution has not provided that evidence; they have argued that the feature is premature, not that the technology choice is wrong.

### 5. Without WebSocket, the Dispatch Board Uses Stale Data

The dispatch board is rated 7.4/10. It shows load assignments, statuses, and carrier information. Without real-time updates, a dispatcher looking at the board sees data that is 0-30 seconds stale (with polling). In a brokerage where two dispatchers work the same load board, one dispatcher assigns a carrier to a load and the other dispatcher does not see it for up to 30 seconds. This creates double-booking scenarios, confusion, and calls between dispatchers asking "did you take that load?"

Turvo solved this with real-time presence and instant updates. Rose Rocket solved it with status halos that change in real time. For Ultra TMS to claim "modern dispatch" without real-time board updates undermines the core product pitch.

### 6. Redis Adapter Is Straightforward

The Redis adapter setup is 8 lines of code (per `websockets.md`). Redis is already running for BullMQ queues (ADR-015). The adapter uses two additional connections (pub/sub pair) on the same Redis instance. There is no new infrastructure to provision, no new service to manage, no new monitoring to configure. The marginal complexity of adding the adapter to an already-running Redis instance is near zero.

---

## Cross-Examination

| Question | Finding |
|----------|---------|
| How many status updates per day does a 20-load brokerage generate? | ~200 (10 status changes per load average). One every 2-3 minutes during an 8-hour workday. |
| What is the reconnection loop bug's root cause? | Not fully diagnosed. Likely: `SocketProvider` creates new connections on re-render without properly cleaning up previous connections, or auth token refresh triggers reconnection which triggers re-render which triggers reconnection. |
| Does the dispatch board actually need bidirectional communication? | Weak case. Dispatchers perform actions (assign carrier, update status) via REST API calls. The "bidirectional" argument is that dispatchers subscribe to specific loads -- but SSE with query parameters achieves the same filtering. True bidirectional would be collaborative editing (e.g., two dispatchers typing in the same notes field simultaneously), which is not planned. |
| What percentage of TMS competitors in Ultra TMS's target segment have WebSocket? | 2 of 4 direct competitors: Rose Rocket (yes), Turvo (yes, but upper-market). Tai TMS (no), Aljex (no, MacroPoint only). Split market. |
| Could notifications use SSE while dispatch uses Socket.io? | Technically yes but architecturally messy. Two real-time transports means two sets of authentication, connection management, and error handling. Not recommended. |
| Is the 14-hour QS-001 estimate accurate? | Likely underestimated. It does not account for: writing tests (currently 0 WebSocket tests), fixing the frontend infinite loop bug, or integration testing across 4 namespaces with Redis adapter. Realistic estimate: 18-24 hours. |

---

## Evidence Exhibits

| ID | Evidence | Source | Relevance |
|----|----------|--------|-----------|
| E-01 | 0 `@WebSocketGateway` decorators in `apps/api/src/` | Code search | Backend is completely unbuilt |
| E-02 | `socket-provider.tsx`: 175 lines, `socket-config.ts`: 185 lines | `00-evidence-pack.md` | Frontend infrastructure exists but connects to nothing |
| E-03 | Infinite reconnection loop in SocketProvider | QS-001 task, evidence pack | Complexity cost already manifesting |
| E-04 | QS-001 estimated at XL (14+ hours) | `dev_docs_v3/03-tasks/sprint-quality/` | Largest single quality sprint task |
| E-05 | ADR-011 status: LOCKED, rejects SSE | `decision-log.md` | Technology choice is decided |
| E-06 | Critical Gap #1: "Working real-time tracking" | `01-competitor-matrix.md` | Every competitor has some form of real-time |
| E-07 | Tai TMS: no WebSocket, still competitive in mid-market | `01-competitor-matrix.md` | Market tolerates absence in target segment |
| E-08 | 4 namespaces planned: `/dispatch`, `/tracking`, `/notifications`, `/dashboard` | `11-features/websockets.md` | 3 of 4 are server-to-client only |
| E-09 | Redis adapter: 8 lines of code on already-running Redis | `11-features/websockets.md` | Marginal infrastructure cost is near zero |
| E-10 | 0 WebSocket tests in test suite (72 tests total) | `00-evidence-pack.md` | No safety net for complex real-time code |
| E-11 | 20+ typed events in `socket-config.ts` | Frontend code | Significant frontend investment to preserve |
| E-12 | Turvo: real-time collaboration is core architecture | `01-competitor-matrix.md` | Market leader uses WebSocket extensively |

---

## Verdict: MODIFY

**Keep Socket.io (ADR-011 stands). Reduce initial scope drastically.**

The prosecution is right that four fully-implemented WebSocket namespaces with Redis adapter, JWT auth, rate limiting, and room management is excessive for MVP. The defense is right that real-time capability is a competitive requirement and the frontend infrastructure should not be discarded. The resolution is scope reduction.

### Modified Implementation Plan

**Phase 1 -- MVP (replace QS-001 scope):**
- Implement **only `/notifications`** namespace. This is the simplest gateway (server-to-client, no room subscriptions beyond tenant), provides visible value on every page (bell icon updates), and validates the entire Socket.io pipeline end-to-end (JWT handshake, tenant room, Redis adapter, frontend provider).
- Fix the `SocketProvider` infinite reconnection loop. The provider should connect only to `/notifications` at MVP, not all four namespaces.
- Estimated effort: **6-8 hours** (down from 14+ for all four namespaces).

**Phase 2 -- Post-MVP (when dispatch board quality reaches 8+/10):**
- Implement `/dispatch` namespace for load assignment real-time updates.
- Use React Query polling (30-second interval) as the fallback and current default for the dispatch board. This is already how the board works today.

**Phase 3 -- When tracking features are built:**
- Implement `/tracking` namespace when GPS integration and load tracking map are functional.
- Implement `/dashboard` namespace when KPI dashboards have real data (not hardcoded).

### Why Not SSE

The prosecution makes a reasonable case for SSE on 3 of 4 namespaces. However:

1. ADR-011 is LOCKED and the bidirectional argument, while weak for dispatch today, becomes strong when collaborative features are built.
2. Mixing SSE and Socket.io creates two real-time transport layers with separate auth, connection management, and error handling -- more complexity, not less.
3. The frontend Socket.io infrastructure (360 lines) is already built. SSE would require a full rewrite of the provider, config, and hooks.
4. Socket.io falls back to HTTP long-polling automatically when WebSocket is unavailable, providing SSE-like behavior as a built-in degradation path.

The answer is not "use SSE instead of Socket.io." The answer is "use Socket.io on one namespace instead of four."

---

## Action Items

| # | Action | Priority | Effort | Owner |
|---|--------|----------|--------|-------|
| 1 | Rewrite QS-001 scope: `/notifications` only for MVP | P0 | 30 min | Immediate |
| 2 | Fix `SocketProvider` infinite reconnection loop | P0 | 2-3 hours | QS-001 revised |
| 3 | Implement `/notifications` gateway with `WsJwtGuard` + tenant room | P0 | 4-5 hours | QS-001 revised |
| 4 | Update `SocketProvider` to connect only to `/notifications` at MVP | P1 | 1 hour | QS-001 revised |
| 5 | Add React Query 30-second polling to dispatch board as explicit fallback | P1 | 1 hour | Backlog |
| 6 | Write at least 5 WebSocket integration tests (connect, auth, tenant isolation, event emit, disconnect) | P1 | 2-3 hours | QS-001 revised |
| 7 | Create QS-001b task: `/dispatch` namespace (post-MVP, gated on dispatch board 8+/10) | P2 | 15 min | Backlog |
| 8 | Create QS-001c task: `/tracking` + `/dashboard` namespaces (gated on feature readiness) | P3 | 15 min | Backlog |
