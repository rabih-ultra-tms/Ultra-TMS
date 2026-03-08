# Tribunal Research Brief 2: Table-Stakes Audit

> Generated: 2026-03-07
> Purpose: Feed TRIBUNAL-10 (Missing Features) and TRIBUNAL-02 (Priority Tiers)
> Sources: FreightWaves 2026 TMS Buyer's Guide, G2/Capterra reviews, Aljex/Tai/PCS buyer guides, industry RFP templates, 3PL Systems BrokerWare docs, Vektor TMS broker buying guide, Denim blog, QuantumByte buyer guide, existing Ultra TMS gap analysis (dev_docs/Claude-review-v1/06-gap-analysis/)

---

## What "Table Stakes" Means

Features that cause IMMEDIATE rejection in an RFP or demo if missing. Not "nice to have" -- these are "deal breakers." If a freight broker evaluates your TMS and any of these are absent, the demo ends and you are disqualified. This is not about competitive advantage -- this is about basic credibility as a TMS vendor in 2026.

The bar has risen sharply since 2023. AI-powered automation (email parsing, automated quoting, carrier matching) is moving from "differentiator" to "expected." Real-time visibility is no longer impressive -- it is assumed. Load board integration is not a feature -- it is plumbing. If you do not have it, you are not a TMS.

---

## Table-Stakes Feature Checklist

| # | Feature | Ultra TMS Status | Industry Expectation | Gap Severity |
|---|---------|-----------------|---------------------|-------------|
| **CORE OPERATIONS** | | | | |
| 1 | Load creation, editing, lifecycle management | **Built** -- 12 TMS Core pages, orders/loads services, full status machine | Every TMS has this. It is the product. | None |
| 2 | Dispatch board with drag-drop or quick-assign | **Partial** -- Dispatch page exists but no WebSocket real-time updates (QS-001 planned). No drag-drop. | Real-time dispatch board is the #1 screen brokers live in. Must update instantly. | **HIGH** -- dispatch without real-time is a toy |
| 3 | Real-time shipment tracking with map | **Partial** -- `tracking.service.ts` and `public-tracking.controller.ts` exist. Frontend tracking page built. No live GPS/ELD integration, no WebSocket push. | Every competitor has live map tracking. project44/MacroPoint/FourKites integration is standard. | **HIGH** -- tracking without live data is useless |
| 4 | Check calls (manual + automated) | **Partial** -- Manual check call logging exists (DTO, service, controller). No automated SMS/IVR outreach, no non-responsive driver detection. | Manual logging is 2015. Automated check calls via SMS are standard in 2026. | **MEDIUM** -- manual works for launch but automated needed within 90 days |
| 5 | Exception/alert dashboard | **Not Built** -- No exception detection engine, no alert rules, no exception dashboard page. Proposed in design docs only. | Every TMS surfaces late loads, missed check calls, insurance expirations on login. This is the "morning recon" screen. | **CRITICAL** -- brokers cannot operate without this |
| 6 | Multi-stop / LTL load support | **Partial** -- Stops table supports multiple stops per load. No LTL-specific workflows (freight class, NMFC, consolidation). | LTL is 20%+ of broker volume. Multi-stop is common for dedicated/milk-run lanes. | **MEDIUM** -- FTL-only is viable for launch but limits market |
| **FINANCIAL** | | | | |
| 7 | Invoice generation and management | **Built** -- Accounting module with 10 pages, invoices service, invoice list/detail/create. | Standard. | None |
| 8 | Carrier settlements / pay | **Built** -- Settlements service, settlement pages in accounting module. | Standard. | None |
| 9 | Aging reports (AR and AP) | **Partial** -- Accounting module exists but dashboard endpoint missing (QS-003). No dedicated aging report confirmed. | Aging reports are the CFO's daily tool. AR aging drives collections. AP aging drives cash flow. | **HIGH** -- cannot manage cash without aging |
| 10 | Factoring integration | **Built** -- Full factoring module with payments, routing, verification services. | Required for 60%+ of small/mid brokerages who factor receivables. | Low -- backend exists, frontend not built |
| 11 | QuickBooks / Xero sync | **Partial** -- Integration hub module exists with sync service. `quickbooks_id` field on chart of accounts. No confirmed working sync. | 90%+ of brokerages use QuickBooks or Xero. If they cannot sync, they will not buy. | **HIGH** -- integration hub exists but sync is unverified |
| 12 | Rate confirmation generation + e-signature | **Partial** -- `rate-confirmation.dto.ts` exists, boolean fields on Load table. No document template engine, no e-signature workflow. | Legal contract between broker and carrier. Every competitor auto-generates and tracks signatures. | **CRITICAL** -- without this, every load requires manual PDF creation |
| **DOCUMENTS** | | | | |
| 13 | BOL (Bill of Lading) generation | **Not Built** -- `bol_number` field exists on Order table. No BOL template, no generation endpoint, no PDF output. | The most important shipping document. Every competitor generates BOLs. | **CRITICAL** -- forces customers to create their own BOLs |
| 14 | POD (Proof of Delivery) capture and storage | **Partial** -- Documents module exists with upload/storage. Carrier portal has document upload. No OCR, no auto-classification. | Basic upload is minimum. OCR/auto-classification is becoming standard. | **LOW** -- basic upload works for launch |
| 15 | Document management (upload, classify, retrieve) | **Partial** -- Documents module with 20 endpoints on backend. 4 hooks and components on frontend, 0 dedicated pages. | Must store and retrieve BOLs, PODs, rate cons, insurance certs, carrier packets per load. | **MEDIUM** -- backend solid, frontend needs pages |
| **COMPLIANCE** | | | | |
| 16 | FMCSA carrier lookup / authority verification | **Built** -- Safety module with `fmcsa.service.ts`, `fmcsa-api.client.ts`, `fmcsa.controller.ts`, scoring engine. | Table stakes. Cannot dispatch a carrier without verifying authority. | None |
| 17 | Insurance certificate tracking + expiration alerts | **Partial** -- Carrier document storage exists. Insurance fields on carrier. No automated expiration monitoring, no alerts. | Dispatching a load to a carrier with expired insurance is an E&O nightmare. Alerts are mandatory. | **HIGH** -- must have automated alerts |
| 18 | Carrier onboarding packet / document checklist | **Partial** -- Carrier portal has registration and document upload. No configurable packet template, no checklist, no completion tracking. | RMIS/Highway built a business on this. Every enterprise TMS has it. | **MEDIUM** -- basic onboarding works, formal packets needed within 6 months |
| 19 | Double-brokering prevention / carrier vetting | **Partial** -- FMCSA lookup exists. No real-time authority monitoring, no Highway/Carrier411 integration, no double-broker detection logic. | FreightWaves 2026: "carrier vetting and fraud prevention to verify carrier legitimacy in real time" is now expected. | **HIGH** -- double-brokering is the #1 industry fraud concern in 2025-2026 |
| **CUSTOMER EXPERIENCE** | | | | |
| 20 | Customer portal (tracking, documents, history) | **Backend Built / Frontend Not Built** -- Customer portal module: 40 endpoints, 8 models, 6 enums. Auth, dashboard, shipments, invoices, payments, quotes, users subdirs. Zero frontend pages. | Every competitor has a branded customer portal. Customers expect self-service tracking. Reduces inbound calls 60-80%. | **CRITICAL** -- backend is ready but customers cannot use it |
| 21 | Self-service tracking link (no login required) | **Partial** -- `public-tracking.controller.ts` exists. Unknown if functional or has a working frontend. | Standard. Customers share tracking links with their customers. | **MEDIUM** -- controller exists, needs verification |
| **CARRIER EXPERIENCE** | | | | |
| 22 | Carrier portal (load acceptance, docs, payment status) | **Backend Built / Frontend Not Built** -- Carrier portal module: 54 endpoints, 5 models, 5 enums. Auth, compliance, dashboard, documents, invoices, loads, users subdirs. Zero frontend pages. | Carrier experience is a competitive differentiator. Carriers prefer brokers whose TMS makes their life easier. | **HIGH** -- backend ready, no carrier-facing UI |
| **REPORTING** | | | | |
| 23 | Standard reports (load volume, revenue, margin, carrier performance) | **Backend Partial / Frontend Not Built** -- Analytics module with dashboards, KPIs, reports, alerts services. Zero frontend pages. Dashboard KPIs are hardcoded on frontend. | Brokers need daily/weekly/monthly reports. Leadership needs P&L by customer, lane, rep. | **HIGH** -- analytics backend exists but no UI to access it |
| 24 | Export to CSV/Excel/PDF | **Not Confirmed** -- No evidence of export functionality in frontend code. | Every list view must export. Non-negotiable for accounting and operations. | **HIGH** -- basic operational need |
| **INTEGRATIONS** | | | | |
| 25 | Load board posting (DAT, Truckstop) | **Not Built** -- Load Board module has 4 frontend pages and 10 components (internal load board). No DAT/Truckstop API integration confirmed. | "If you cannot post to DAT, you are not a TMS" -- this is the single most common integration requirement. | **CRITICAL** -- internal load board is not the same as DAT/Truckstop integration |
| 26 | ELD/GPS tracking provider integration | **Not Built** -- Tracking service exists but no integration with any ELD/GPS provider (Samsara, KeepTruckin/Motive, project44, MacroPoint). | Real-time tracking comes from ELD/GPS data. Without this, tracking is manual check calls only. | **CRITICAL** -- no live tracking without this |
| 27 | EDI (204/210/214/990) for enterprise customers | **Backend Built** -- Full EDI module with parsing, generation, mappings, trading partners, queue, transport, control numbers. No frontend. | Required for enterprise customers (Walmart, Amazon, Target shippers). Not needed for SMB. | **LOW** for launch (SMB focus), **HIGH** if targeting enterprise |
| **SECURITY** | | | | |
| 28 | Role-based access control (RBAC) | **Built** -- Auth module with roles service, JWT guards, RolesGuard decorator. 11 defined roles. | Standard. | None |
| 29 | Audit logs | **Built** -- Full audit module with change history, audit interceptor, audit hash, audit logs controller. | Required for compliance and dispute resolution. | None |
| 30 | MFA / Two-Factor Authentication | **Not Built** -- No MFA implementation found in auth module. | Increasingly required in RFPs, especially for enterprise customers. SOC 2 compliance requires it. | **HIGH** -- security deal-breaker for enterprise buyers |

---

## Summary Counts

| Status | Count |
|--------|-------|
| Built (no gap) | 7 |
| Partial (gap exists but foundation is there) | 14 |
| Backend Built / Frontend Not Built | 3 |
| Not Built | 6 |
| **Total with gaps** | **23 of 30** |

---

## Top 5 Reasons Brokers Switch TMS Providers

Based on research from FreightWaves, Vektor TMS, Tai Software, Super Dispatch, and G2/Capterra reviews:

### 1. The TMS Cannot Scale With Their Growth
Brokers outgrow their TMS. What worked at 50 loads/day breaks at 200 loads/day. On-premise systems are the worst offenders, but cloud systems with poor architecture also hit walls. Symptoms: slow page loads, inability to handle concurrent users, no bulk operations, manual processes that worked at low volume become impossible.

### 2. Poor Integrations (Load Boards, Accounting, Tracking)
The #1 operational complaint. If the TMS cannot post to DAT/Truckstop, sync with QuickBooks, or pull live tracking from ELD providers, dispatchers maintain parallel systems. Every parallel system is a data entry error and a wasted hour. Brokers switch when they realize they are paying for a TMS but still using spreadsheets for half their work.

### 3. Terrible User Experience / Slow Workflows
TMS platforms designed by developers rather than brokers. Too many clicks to create a load. No keyboard shortcuts. No quick-search. Dated UI that looks like 2010 enterprise software. Brokers who see a modern TMS like Rose Rocket or Tai immediately want to switch from legacy systems. The "time to complete one load lifecycle" is the key metric -- if it takes 15 minutes in System A and 5 minutes in System B, System B wins.

### 4. Lack of Automation for Repetitive Tasks
Manual rate confirmation generation. Manual check calls. Manual invoice creation. Manual load board posting. Manual carrier compliance checking. Each of these is 5-15 minutes per load. At 100+ loads/day, the labor cost of manual processes exceeds the TMS subscription cost. Brokers switch to systems that automate the grunt work.

### 5. Inability to Get Actionable Data Out of the System
The TMS captures data but cannot surface it usefully. No margin-by-lane reports. No carrier performance scorecards. No customer profitability analysis. No exception trends. Brokers end up exporting to Excel and building their own reports, which defeats the purpose of having a TMS. They switch when a competitor shows them a dashboard that answers their questions in real time.

---

## Minimum Viable Product for 3PL TMS Market Entry

The absolute minimum to be **credible** (not competitive, just credible) in a broker demo in 2026:

### Must Work Flawlessly in the Demo

1. **Load lifecycle** -- Create order, build load, assign carrier, track, deliver, invoice, settle. End to end in under 10 minutes.
2. **Dispatch board** -- See all loads by status, assign carriers, see today's pickups/deliveries at a glance.
3. **Real-time(ish) tracking** -- At minimum, check call logging with map pins. Ideally, live GPS via ELD integration.
4. **Rate confirmation** -- Generate PDF, send to carrier, track signature status.
5. **Invoice generation** -- Create invoice from delivered load, send to customer, track payment.
6. **Carrier management** -- Onboard carrier, verify FMCSA authority, store documents, track insurance.
7. **Customer management** -- CRM with contacts, credit terms, load history, communication log.
8. **Basic reporting** -- Revenue dashboard, load volume, margin by customer/lane.
9. **Load board posting** -- Post to DAT/Truckstop from within the TMS. This is non-negotiable.
10. **QuickBooks sync** -- Or at minimum, invoice export in a format QuickBooks can import.

### Must Exist (Even if Basic)

11. **BOL generation** -- Template-based PDF generation from load data.
12. **Customer portal** -- Basic tracking and document access for customers.
13. **Carrier portal** -- Load acceptance and document upload for carriers.
14. **RBAC** -- At minimum: Admin, Dispatcher, Sales Rep, Accounting roles with different access.
15. **Audit trail** -- Who changed what, when.

### Can Be Missing at Launch (but Must Be on Roadmap)

16. EDI support (only needed for enterprise customers)
17. Automated check calls via SMS
18. Document OCR
19. AI carrier matching
20. Multi-currency support

---

## Critical Gaps in Ultra TMS

Ordered by severity -- these are table-stakes features that are missing or non-functional:

### Severity: CRITICAL (Demo Killers)

| # | Gap | Current State | Impact |
|---|-----|---------------|--------|
| 1 | **No load board integration (DAT/Truckstop)** | Internal load board only (4 pages). No external API integration. | Brokers post 50-200 loads/day to load boards. Without this, they use a separate browser tab for DAT -- which means your TMS is not their primary tool. This alone disqualifies you in most evaluations. |
| 2 | **No rate confirmation automation** | Boolean fields exist. No template engine, no PDF generation, no e-signature workflow. | Dispatchers create rate cons manually for every load. At 100 loads/day that is 25 hours of labor daily. Every competitor automates this. |
| 3 | **No BOL generation** | `bol_number` field only. No template, no generation, no PDF. | The most fundamental shipping document. Forcing customers to create their own BOLs is unprofessional. |
| 4 | **No exception/alert dashboard** | No detection engine, no alert rules, no UI. | Brokers cannot start their day without knowing what is on fire. No exception dashboard = no operational awareness. |
| 5 | **Customer portal has no frontend** | 40 backend endpoints built. Zero pages rendered. | Customers have no self-service access. Every status inquiry becomes a phone call to your dispatchers. |
| 6 | **No ELD/GPS tracking integration** | Tracking service exists with manual check calls only. No provider connections. | "Real-time tracking" without actual real-time data is a lie. Brokers will ask "which tracking providers do you integrate with?" and the answer is "none." |

### Severity: HIGH (Post-Demo Dealbreakers)

| # | Gap | Current State | Impact |
|---|-----|---------------|--------|
| 7 | **Dispatch board has no real-time updates** | Page exists but WebSocket infrastructure is broken (infinite loop bug). QS-001 planned. | Dispatchers refresh the page manually to see updates. This is 2005-era behavior. |
| 8 | **No QuickBooks/Xero working sync** | Integration hub module exists, sync service exists. No confirmed working integration. | 90%+ of target market uses QB. Without sync, accounting is double-entry. |
| 9 | **Carrier portal has no frontend** | 54 backend endpoints built. Zero pages rendered. | Carriers cannot self-service. Every document request, load acceptance, and payment inquiry is a phone call. |
| 10 | **No insurance expiration alerts** | Insurance fields stored. No monitoring service, no alerts. | Dispatching to an uninsured carrier is a lawsuit. Manual checking does not scale. |
| 11 | **No MFA** | Not implemented. | Enterprise buyers require MFA for SOC 2 compliance. Increasingly a standard RFP checkbox. |
| 12 | **Analytics/reporting has no frontend** | Full backend (dashboards, KPIs, reports, alerts services). Zero pages. | Data goes in but cannot come out in any useful form. |
| 13 | **No double-brokering prevention** | FMCSA lookup exists. No continuous monitoring, no fraud detection. | Double-brokering cost the industry $500M+ in 2024. Brokers and shippers are demanding real-time carrier verification. |
| 14 | **No CSV/Excel export** | Not confirmed in frontend code. | Every list view must export. Accounting, operations, and management all need this daily. |
| 15 | **No aging reports** | Accounting module exists, dashboard endpoint missing (QS-003). | CFO cannot manage cash flow without AR/AP aging. |

### Severity: MEDIUM (Must Address Within 6 Months)

| # | Gap | Current State | Impact |
|---|-----|---------------|--------|
| 16 | Automated check calls (SMS/IVR) | Manual logging only | Labor savings of 2-4 hours/dispatcher/day |
| 17 | Carrier onboarding packets | Basic document upload | Professional onboarding reduces time-to-first-load |
| 18 | Detention tracking | Proposed only | Revenue leakage of $2,000-10,000/month |
| 19 | TONU management | Accessorial type only | Revenue leakage from untracked cancellations |
| 20 | Facility database | Not built | Institutional knowledge loss, 5-10 min wasted per load |
| 21 | Document management frontend | Backend built, 0 pages | Cannot access document storage from UI |
| 22 | LTL-specific workflows | Basic multi-stop only | Limits addressable market by ~20% |
| 23 | Appointment scheduling | Data fields only | Tedious manual process, no calendar visibility |

---

## Verdict: Is Ultra TMS Table-Stakes Ready?

### NO.

Ultra TMS is **not table-stakes ready** for the 3PL freight brokerage market in 2026. It has impressive backend infrastructure (35 active modules, 260 Prisma models, substantial endpoint coverage) but critical user-facing functionality is either missing or has no frontend.

**The core problem:** Ultra TMS has been built inside-out. The database and API layers are extensive, but the features that a broker touches every day -- rate confirmation automation, load board posting, exception dashboard, customer portal, real-time tracking -- are either stubs, backend-only, or entirely absent.

**Specific verdict by category:**

| Category | Ready? | Notes |
|----------|--------|-------|
| Core Operations | Almost | Load lifecycle works. Dispatch board needs WebSocket. Exception dashboard is missing. |
| Financial | Partial | Invoicing and settlements work. Rate cons, aging reports, QB sync do not. |
| Documents | No | No BOL generation. No rate con automation. Basic upload only. |
| Compliance | Partial | FMCSA lookup works. Insurance alerts and continuous monitoring do not. |
| Customer Experience | No | 40 backend endpoints, zero frontend pages. |
| Carrier Experience | No | 54 backend endpoints, zero frontend pages. |
| Reporting | No | Full backend analytics module, zero frontend pages. |
| Integrations | No | No DAT/Truckstop, no ELD/GPS, no working QB sync. Zero external integrations confirmed working. |
| Security | Partial | RBAC and audit logs work. No MFA. localStorage token storage is an active vulnerability. |

**What would it take to reach table-stakes?**

The 6 CRITICAL gaps and 9 HIGH gaps must be closed. Rough estimate:

| Gap Category | Estimated Effort |
|-------------|-----------------|
| Rate con + BOL generation (template engine + PDF) | 4-6 weeks |
| DAT/Truckstop load board integration | 3-4 weeks |
| Exception dashboard (detection engine + UI) | 3-4 weeks |
| Customer portal frontend | 4-6 weeks |
| Carrier portal frontend | 4-6 weeks |
| ELD/GPS tracking integration (1 provider minimum) | 3-4 weeks |
| WebSocket fix for dispatch board | 2-3 weeks (QS-001) |
| QuickBooks sync verification/completion | 2-3 weeks |
| Analytics/reporting frontend | 3-4 weeks |
| Insurance alerts + double-broker prevention | 2-3 weeks |
| MFA implementation | 1-2 weeks |
| Export functionality (CSV/Excel) | 1-2 weeks |
| Aging reports | 1 week |
| **Total** | **33-48 weeks** |

With 3 developers working in parallel: **11-16 weeks to table-stakes readiness.**

**Bottom line:** Ultra TMS has built an impressive chassis (backend) but has not put on the body panels, wheels, or steering wheel (frontend, integrations, automation). A broker evaluating this product today would see a login screen, some list views, and a load management flow -- but would immediately ask "where is DAT integration?" and "can I see the customer portal?" and "how do rate cons work?" and would receive unsatisfactory answers to all three.

The good news: the backend foundation is genuinely strong. The bad news: backend endpoints do not move freight. Brokers never see your API -- they see your screens, your integrations, and your automation. That is where Ultra TMS fails the table-stakes test.

---

## Research Sources

- [FreightWaves 2026 TMS Buyer's Guide](https://www.freightwaves.com/news/white-paper-2026-tms-buyers-guide)
- [FreightWaves: How freight brokers can succeed in 2026](https://www.freightwaves.com/news/how-freight-brokers-can-succeed-in-2026-a-strategic-guide-to-resilience)
- [FreightWaves: Best TMS freight broker software](https://ratings.freightwaves.com/best-tms-freight-broker-software/)
- [FreightWaves: How to choose the best TMS for brokers](https://ratings.freightwaves.com/how-to-choose-the-best-tms-software-for-brokers/)
- [Aljex: TMS Software in 2026 Best Options for Freight Brokers](https://www.aljex.com/news/best-freight-broker-tms-software-2026/)
- [Aljex: Best Freight Broker Software of 2025](https://www.aljex.com/news/best-freight-broker-software/)
- [Denim: 12 Best TMS for brokers 2025](https://www.denim.com/blog/best-tms-software-for-brokers)
- [PCS Software: TMS RFP Key Steps](https://pcssoft.com/blog/transportation-management-system-rfp/)
- [PCS Software: Best TMS Software Buyer Guide](https://pcssoft.com/blog/best-tms-software/)
- [Vektor TMS: Broker TMS Buying Guide](https://vektortms.com/blog/broker-tms-buying-guide)
- [QuantumByte: TMS Software for Freight Brokers 2026 Buyer Guide](https://quantumbyte.ai/articles/tms-software-for-freight-brokers)
- [3PL Systems BrokerWare Features](https://3plsystems.com/brokerware/features)
- [Tai Software: Best TMS for domestic freight broker](https://tai-software.com/what-is-the-best-tms-software-for-a-domestic-freight-broker/)
- [Tai Software: What to avoid when implementing new TMS](https://tai-software.com/what-freight-brokers-need-to-avoid-when-implementing-a-new-tms-system/)
- [BrokerPro: Ultimate Guide to TMS Software](https://www.brokerpro.com/resources/ultimate-guide-tms-software-for-freight-brokers/)
- [Transport Topics: TMS for freight brokerages](https://www.ttnews.com/articles/tms-freight-brokerages)
- [Super Dispatch: 5 Broker Pain Points](https://superdispatch.com/blog/5-broker-pain-points/)
- [AscendTMS: What to avoid choosing new TMS](https://www.thefreetms.com/insights/what-to-avoid-when-choosing-your-new-tms)
- [GoFreight: Best TMS Software 2026 Top 10](https://gofreight.com/blog/best-tms-software)
- [InTek Logistics: Best TMS Software Packages 2026](https://www.inteklogistics.com/blog/best-transportation-management-software-tms)
- [Revenova: What is a TMS in Logistics](https://revenova.com/what-is-a-transportation-management-software/)
- [Capterra: Tai TMS Reviews](https://www.capterra.com/p/146697/Teknowlogi-TAI-TMS/)
- [Capterra: Alvys TMS Reviews](https://www.capterra.com/p/249961/Alvys-TMS/)
- [G2: Freightview Reviews](https://www.g2.com/products/freightview/reviews)
- [DAT Load Board](https://www.dat.com/load-boards)
- [Truckstop Load Board for Brokers](https://truckstop.com/product/load-board/broker/)
- [FreightWaves: Best Load Boards for Brokers 2026](https://www.freightwaves.com/checkpoint/load-boards-freight-brokers/)
