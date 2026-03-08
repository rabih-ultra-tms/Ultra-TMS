# TRIBUNAL-02: Priority Tiers -- Are We Building the Right Things First?

> **Filed:** 2026-03-07
> **Topic:** Are P0/P1/P2/P3 priority tiers correct? Are table-stakes features in the right tier?
> **Verdict:** MODIFY

---

## Charge

Ultra TMS assigns 38 services to four priority tiers: P0 (9 services, MVP), P1 (6 services, post-MVP), P2 (7 services, extended), P3 (16 services, future). The table-stakes audit found 6 CRITICAL and 9 HIGH gaps in features brokers require for the product to be credible. Several of those gaps map to services classified as P1 or not classified at all. The question is whether the tier assignments reflect market reality, or whether they reflect an engineer's build order that ignores what customers actually need to see on day one.

---

## Prosecution (The Case for Reassigning Tiers)

### Argument 1: Customer Portal (P1, #13) must be P0 -- the market demands it

The table-stakes audit rates Customer Portal as **CRITICAL** (gap #5): "40 backend endpoints built. Zero pages rendered. Customers have no self-service access. Every status inquiry becomes a phone call to your dispatchers."

The audit's "Minimum Viable Product for 3PL TMS Market Entry" section lists Customer Portal as item #12 under "Must Exist (Even if Basic)." Every competitor referenced -- BrokerWare, Tai, Aljex, Rose Rocket -- ships with a branded customer portal. The FreightWaves 2026 Buyer's Guide lists self-service tracking as expected, not differentiating.

The backend is already built: 40 endpoints, 8 models, 6 enums, with auth, dashboard, shipments, invoices, payments, quotes, and users sub-modules. The frontend is the only missing piece. Classifying this as P1 means the MVP ships without the ability for customers to track their own shipments. That is not a viable product in 2026. It is a backend demo.

### Argument 2: Carrier Portal (P1, #14) must be P0 -- carriers choose brokers by tool quality

The table-stakes audit rates Carrier Portal as **HIGH** (gap #9): "54 backend endpoints built. Zero pages rendered. Carriers cannot self-service."

The Vektor TMS Buying Guide and FreightWaves both emphasize that carrier experience is a competitive differentiator. Carriers prefer brokers whose TMS makes their life easier. Without a carrier portal, every load acceptance is a phone call. Every document request is an email. Every payment status inquiry is a voicemail. This is not how the industry works in 2026.

The backend is the most complete of any unbuilt service: 54 endpoints, 5 models, 5 enums, 7 sub-modules (auth, compliance, dashboard, documents, invoices, loads, users), plus 7 spec stubs and 1 e2e test. Promoting this to P0 leverages existing backend investment and closes a gap that brokers notice immediately.

### Argument 3: Rate Confirmation and BOL Generation are not in ANY tier

The table-stakes audit rates these as CRITICAL gaps #2 and #3:

- **Rate Confirmation:** "Boolean fields exist. No template engine, no PDF generation, no e-signature workflow. Dispatchers create rate cons manually for every load. At 100 loads/day that is 25 hours of labor daily."
- **BOL Generation:** "`bol_number` field exists on Order table. No BOL template, no generation endpoint, no PDF output. The most fundamental shipping document."

These are not classified as services, not assigned to any tier, and not in the Quality Sprint. They exist as scattered fields and DTOs in TMS Core but have no dedicated build plan. The table-stakes audit places both in the "Must Work Flawlessly in the Demo" category (items #4 and #11). They are more important than half the P0 services, yet they have no tier assignment at all.

### Argument 4: Claims (P1, #10) can wait -- demote to P2

Claims management handles freight damage, loss, and overcharge disputes. The backend is substantial (44 endpoints, 8 models, 20+ DTOs, 7 spec files). But claims are an edge case: they occur on maybe 2-5% of loads. Every startup TMS defers claims to post-launch. The table-stakes audit does not list claims anywhere in its 30-feature checklist. No broker has ever rejected a TMS in a demo because the claims module was not ready.

Demoting Claims to P2 frees a P1 slot and signals that the team should not spend time on claims before portals, rate cons, and BOL generation are complete.

### Argument 5: Contracts (P1, #15) can wait -- demote to P2

Contracts management (58 endpoints, 11 models, 6 enums) handles customer and carrier rate agreements. While contracts matter for enterprise customers, a pre-revenue startup operating at low volume does not need a formal contract management system. Brokers at the SMB level manage contracts in spreadsheets or their email inbox. The table-stakes audit does not list contract management as a required feature. It is a P2 efficiency feature, not a P1 launch requirement.

---

## Defense (The Case for Current Tier Assignments)

### Argument 1: Internal workflow must work before external portals

The P0 tier follows a strict logic: build the internal broker workflow first. CRM captures customers. Sales generates quotes. TMS Core creates orders and loads. Dispatch assigns carriers. Accounting invoices and settles. This is the revenue pipeline. If this pipeline does not work end-to-end, portals have nothing to display.

Customer Portal is a consumption layer -- it reads data that TMS Core, Accounting, and Documents produce. Carrier Portal is the same. Building portals before the core pipeline is stable means portals would display incomplete or incorrect data. The Quality Sprint (QS-001 through QS-010) is fixing the pipeline first. Portals come after the pipeline works.

### Argument 2: The tier assignments were set by a stakeholder with domain expertise

The service taxonomy and tier assignments were defined by Rabih (the project owner), who has domain expertise in 3PL brokerage. The tiers reflect a deliberate build order based on operational experience, not engineering convenience. Questioning the tiers is questioning the domain expert's judgment about what brokers need first. The prosecution is applying market research to override stakeholder direction.

### Argument 3: The Quality Sprint correctly focuses on making existing code work

The 10 QS tasks target real problems: WebSocket infrastructure (QS-001), soft delete consistency (QS-002), missing accounting endpoint (QS-003), runtime verification of all 98 routes (QS-008). These tasks make the P0 services production-worthy. Promoting portals to P0 before the existing P0 services pass runtime verification is premature optimization -- building new screens while existing screens may not even render.

### Argument 4: Rate con and BOL are features within TMS Core, not separate services

Rate confirmation and BOL generation are not missing from the taxonomy -- they are sub-features of TMS Core (P0, #05). The `rate-confirmation.dto.ts` exists. The `bol_number` field exists. They need implementation work (template engine, PDF generation), but this is a feature gap within an existing P0 service, not a tier misassignment. The prosecution conflates "feature not built" with "feature not prioritized."

### Argument 5: Claims and Contracts have substantial backend investment

Claims has 44 endpoints and 7 spec files. Contracts has 58 endpoints and 11 models. These are not speculative services -- they represent real engineering effort. Demoting them to P2 risks signaling that this work was wasted, and pushes completion further into the future. P1 means "build after MVP stabilizes." P2 means "build after P1 finishes." The difference could be 3-6 months of delay for services that are 70% built on the backend.

---

## Cross-Examination

### Question 1: What is the actual sequence a broker demo would follow?

A broker evaluating Ultra TMS in a demo would ask to see, in order: (1) create a load, (2) dispatch it to a carrier, (3) show the rate confirmation, (4) track the load, (5) generate the invoice, (6) show the customer portal. Items 1-2 are P0. Item 3 has no template engine. Item 4 has no real-time data. Item 5 works. Item 6 does not exist. The demo fails at step 3 or 4. This supports the prosecution: rate con automation is more urgent than the defense admits, and customer portal must at least exist in basic form.

### Question 2: How much frontend effort do portals actually require given the backend is built?

Customer Portal has 40 backend endpoints ready. Carrier Portal has 54. The table-stakes audit estimates 4-6 weeks each for frontend builds. But "basic" portals (login, dashboard, shipment list, document access) could be built in 2-3 weeks each using the existing shadcn/ui component library and the patterns established in the 98 existing routes. The defense overestimates the cost of portal promotion because it assumes full-featured portals. The prosecution only needs "must exist, even if basic" portals.

### Question 3: Does demoting Claims and Contracts actually free capacity?

Both services have zero frontend pages and are not in the Quality Sprint. No one is currently working on them. Demoting them from P1 to P2 changes a label in a documentation file but does not free any actual engineering capacity. The real capacity question is whether promoting portals and rate con/BOL to P0 adds to the Quality Sprint workload. It does -- and that is the honest trade-off the prosecution must acknowledge.

---

## Evidence Exhibits

| Exhibit | Source | Finding |
|---------|--------|---------|
| E1 | `02-table-stakes-audit.md` -- gap #5 | Customer Portal: CRITICAL, 40 endpoints built, 0 frontend pages |
| E2 | `02-table-stakes-audit.md` -- gap #9 | Carrier Portal: HIGH, 54 endpoints built, 0 frontend pages |
| E3 | `02-table-stakes-audit.md` -- gap #2 | Rate Confirmation: CRITICAL, boolean fields only, no template engine |
| E4 | `02-table-stakes-audit.md` -- gap #3 | BOL Generation: CRITICAL, `bol_number` field only, no generation |
| E5 | `02-table-stakes-audit.md` -- MVP checklist | Customer portal = #12, Carrier portal = #13 under "Must Exist" |
| E6 | `02-table-stakes-audit.md` -- MVP checklist | Rate con = #4, BOL = #11 under "Must Work Flawlessly" / "Must Exist" |
| E7 | `STATUS.md` -- P1 service table | Claims: 44 endpoints, 0 frontend. Contracts: 58 endpoints, 0 frontend |
| E8 | `STATUS.md` -- Quality Sprint | 10 QS tasks, all targeting P0 services, zero portal or document generation tasks |
| E9 | `00-evidence-pack.md` -- team | 2 AI agents (Claude Code + Codex/Gemini), no human developers |
| E10 | `02-table-stakes-audit.md` -- feature #12 | Rate con: "Every competitor auto-generates and tracks signatures" |

---

## Verdict

**MODIFY** -- The current tier assignments reflect a valid engineering build order (core pipeline first, consumption layers second) but underweight market reality. A TMS that cannot show a customer portal, generate a rate confirmation, or produce a BOL is not demonstrable to brokers, regardless of how solid the internal pipeline is.

### Specific Changes

**Promote to P0:**
- **Customer Portal** (#13): Move from P1 to P0. Scope: basic portal only (login, dashboard, shipment tracking, document access). Full portal (quotes, payments, user management) remains P1. Estimated effort for basic version: 2-3 weeks.
- **Rate Confirmation Automation**: Add as explicit P0 sub-feature of TMS Core. Scope: template engine + PDF generation + send-to-carrier workflow. E-signature can be P1. Estimated effort: 2-3 weeks.
- **BOL Generation**: Add as explicit P0 sub-feature of TMS Core or Documents. Scope: template-based PDF generation from load data. Estimated effort: 1-2 weeks.

**Keep at P1 (no change):**
- **Carrier Portal** (#14): The defense is correct that internal workflow must stabilize first, and carrier portal is less visible in early broker demos than customer portal. However, it should be the first P1 service built after MVP.

**Demote to P2:**
- **Claims** (#10): Move from P1 to P2. Edge case handling that no startup needs at launch. 44 backend endpoints are preserved; frontend build is deferred.
- **Contracts** (#15): Move from P1 to P2. Enterprise feature not needed for SMB launch. 58 backend endpoints are preserved; frontend build is deferred.

**Net result:** P0 grows from 9 services to 9 services + 3 explicit sub-features. P1 shrinks from 6 to 4 (Carrier Portal, Documents, Communication, + one freed slot). P2 grows from 7 to 9. The Quality Sprint remains the immediate priority, but post-QS work now has a clear path: basic customer portal, rate con automation, BOL generation.

---

## Action Items

| # | Action | Priority | Effort | Owner |
|---|--------|----------|--------|-------|
| 1 | Move Customer Portal hub to `p0-mvp/` with "P0-Basic" scope annotation (login, dashboard, tracking, docs) | P0 | 30min | Claude Code |
| 2 | Add "Rate Confirmation Automation" section to TMS Core hub with P0 scope (template + PDF + send) | P0 | 30min | Claude Code |
| 3 | Add "BOL Generation" section to TMS Core or Documents hub with P0 scope (template + PDF) | P0 | 30min | Claude Code |
| 4 | Move Claims hub to `p2-extended/`, update all index files | P1 | 15min | Codex/Gemini |
| 5 | Move Contracts hub to `p2-extended/`, update all index files | P1 | 15min | Codex/Gemini |
| 6 | Update STATUS.md service health table to reflect tier changes | P1 | 30min | Codex/Gemini |
| 7 | Create QS-011: Basic Customer Portal Frontend (post Quality Sprint) | P1 | 15min | Claude Code |
| 8 | Create QS-012: Rate Con Template Engine + PDF Generation | P0 | 15min | Claude Code |
| 9 | Create QS-013: BOL Template Engine + PDF Generation | P0 | 15min | Claude Code |
| 10 | Annotate Carrier Portal hub as "First P1 service to build after MVP" | P1 | 5min | Codex/Gemini |
