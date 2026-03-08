# Tribunal Research Brief 1: Competitor Feature Matrix

> Generated: 2026-03-07
> Purpose: Feed TRIBUNAL-04 (Competitive Positioning) and TRIBUNAL-10 (Missing Features)
> Sources: G2, Capterra, SelectHub, vendor websites, FreightWaves, press releases (2025-2026)

---

## Market Segmentation

| Segment | Players | Target Size | Pricing (Annual) |
|---------|---------|-------------|-------------------|
| Enterprise | MercuryGate/Infios, McLeod, TMW/Trimble | 500+ users | $50K-500K+/yr |
| Upper Mid-Market | Turvo, Tai TMS, Revenova | 50-500 users | $30K-200K/yr |
| Mid-Market | Rose Rocket/TMS.ai, Descartes Aljex | 10-200 users | $10K-80K/yr |
| SMB | AscendTMS (freemium), Tailwind | 1-10 users | $0-10K/yr |
| **Ultra TMS Target** | **Small-to-mid brokers** | **10-50 users** | **TBD (no pricing set)** |

### Notable M&A Since Last Analysis

- **MercuryGate** acquired by Korber (KKR joint venture), rebranded as **Infios** in 2025. Now part of a broader supply chain software suite (WMS, TMS, yard management).
- **Aljex** was acquired by **Descartes** (not Transflo as previously documented) for $32.4M. Now branded **Descartes Aljex** with MacroPoint integration.
- **Rose Rocket** rebranded as **TMS.ai** in February 2025, pivoting hard to AI-native positioning.
- **Turvo** powers **RyderShare** (Ryder's logistics platform), validating enterprise readiness.

---

## Feature Comparison Matrix

Legend for Ultra TMS column:
- **Built** = Code exists and functions (verified or high-confidence from STATUS.md)
- **Partial** = Some code exists, incomplete or unverified
- **Backend Only** = API exists, no frontend pages
- **Not Built** = No code exists

### Core Operations

| Feature | Ultra TMS (Actual State) | MercuryGate/Infios | Turvo | Tai TMS | Rose Rocket/TMS.ai | Descartes Aljex | McLeod |
|---------|-------------------------|-------------------|-------|---------|-------------------|----------------|--------|
| FTL Load Management | **Built** (12 TMS pages) | Yes (all modes) | Yes | Yes | Yes | Yes | Yes (industry-leading) |
| LTL Management | **Partial** (model exists, UI basic) | Yes (all modes) | Basic | Yes (AI-enabled) | Yes | Basic | Yes (dedicated module) |
| Intermodal | **Not Built** | Yes (ocean, air, rail) | Basic | No | No | No | Yes |
| Multi-Stop / Pool | **Partial** (stop model exists) | Yes | Basic | Basic | Basic | No | Yes (advanced) |
| Cross-Border (MX/CA) | **Not Built** | Yes (global) | Basic | No | Basic (Canadian HQ) | No | Yes |
| Dispatch Board UI | **Built** (7.4/10 quality) | Yes (web-based) | Yes (modern) | Yes (single-screen) | Yes (Kanban, gold-standard) | No (list view only) | Yes (v25.2 Carrier Sales Board) |
| Real-Time Tracking Map | **Partial** (WS broken, QS-001) | Yes | Yes (GPS + predictive) | Yes (MacroPoint) | Yes (with status halos) | Yes (MacroPoint) | Yes (Symphony Mobile) |
| Route Optimization | **Not Built** | Yes (advanced) | Basic | No | No | No | Yes (PC*MILER) |
| Geofencing | **Not Built** | Yes | Yes | No | Yes | No | Basic |
| Check Calls | **Built** (form + API) | Yes | Yes (auto from tracking) | Yes | Yes | Manual only | Yes (SMS auto-update in v25.2) |
| Rate Confirmation | **Built** (RateConfirmationService) | Yes | Yes | Yes | Yes | Yes | Yes |

### Carrier Management

| Feature | Ultra TMS (Actual State) | MercuryGate/Infios | Turvo | Tai TMS | Rose Rocket/TMS.ai | Descartes Aljex | McLeod |
|---------|-------------------------|-------------------|-------|---------|-------------------|----------------|--------|
| Carrier Onboarding | **Built** (6 pages, 17 components) | Yes | Yes (network-effect) | Yes | Yes | Yes (automated alerts) | Yes (Highway integration) |
| Compliance Tracking | **Partial** (model exists, no CSA endpoint QS-004) | Yes | Yes | Yes (auto-updates) | Basic | Yes (MacroPoint) | Yes (FMCSA + Highway) |
| Carrier Scorecard | **Built** (7 tabs on detail page) | Yes | Yes (lane performance) | Yes (transparent ranking) | Basic | No | Yes |
| Smart Carrier Match | **Partial** (AI in Load Planner) | Yes (automated selection) | Yes (network data) | Yes (ranked w/ score breakdown) | Yes (Rosie AI, 90% faster) | No | Yes (Digital Freight Matching) |
| Carrier Portal | **Backend Only** (54 endpoints, 0 pages) | Yes | Yes (best-in-class, mobile) | Basic | Yes (partner portal) | No | Basic (improved in v25.2) |
| Rate Management | **Built** (quotes + contracts model) | Yes | Yes | Yes (contract mgmt) | Yes | Yes | Yes (lane corridors) |
| Load Board Posting | **Built** (4 pages, 10 components) | Yes | Yes | Yes (DAT, Truckstop) | Yes | Yes (Truckstop, DAT) | Yes |
| Driver App / Mobile | **Not Built** | Basic | Yes (1M+ drivers) | No | Yes (driver app) | No | Yes (McLeod Anywhere app, v25.2) |

### Sales & CRM

| Feature | Ultra TMS (Actual State) | MercuryGate/Infios | Turvo | Tai TMS | Rose Rocket/TMS.ai | Descartes Aljex | McLeod |
|---------|-------------------------|-------------------|-------|---------|-------------------|----------------|--------|
| Built-in CRM | **Built** (15 pages) | No (requires integration) | Basic | Basic | No (requires integration) | No | No (requires integration) |
| Customer 360 View | **Partial** (pages exist, quality TBD) | No | Basic | Basic | No | No | No |
| Quote Management | **Built** (Load Planner 9/10) | Yes | Yes | Yes (fastest in industry) | Yes | Yes (lifecycle flow) | Yes |
| Sales Pipeline | **Partial** (model exists) | No | No | No | No | No | No |
| Customer Portal | **Backend Only** (40 endpoints, 0 pages) | Yes (shipper portal) | Yes (branded, white-label) | Basic | Yes (dedicated portal) | No | Basic |
| Win/Loss Tracking | **Not Built** | No | No | No | No | No | No |

### Financial & Accounting

| Feature | Ultra TMS (Actual State) | MercuryGate/Infios | Turvo | Tai TMS | Rose Rocket/TMS.ai | Descartes Aljex | McLeod |
|---------|-------------------------|-------------------|-------|---------|-------------------|----------------|--------|
| Invoicing | **Built** (10 accounting pages) | Yes (freight audit) | Basic | Yes | Yes (consolidated billing) | Yes | Yes (redesigned in v25.2) |
| AR/AP Management | **Built** (7.9/10) | Yes | No (requires QB) | Yes | No (requires QB/Xero) | Yes (praised by users) | Yes (advanced) |
| Factoring Integration | **Not Built** (P2 service) | Yes | No | Basic | No | No | Yes (15+ companies) |
| Commission/Settlement | **Built** (11 pages, 8.5/10) | Yes | No | Yes | No | Basic | Yes (Order Payables in v25.2) |
| Accounting Dashboard | **Not Built** (QS-003 blocked) | Yes | No | Basic | Yes (reporting) | Yes | Yes |
| AR Aging Reports | **Partial** (model exists) | Yes | No | Basic | No | Yes (best-in-class for SMB) | Yes |
| QuickBooks Integration | **Not Built** | No | Yes | Yes | Yes | Yes | No |

### Technology & Platform

| Feature | Ultra TMS (Actual State) | MercuryGate/Infios | Turvo | Tai TMS | Rose Rocket/TMS.ai | Descartes Aljex | McLeod |
|---------|-------------------------|-------------------|-------|---------|-------------------|----------------|--------|
| Modern UI/UX | **Partial** (Commission 8.5/10, others 5-7/10) | Moderate (enterprise) | Yes (React, clean) | Improving (inconsistent) | Yes (gold-standard) | Dated | Improving (v25.2 web) |
| Real-Time Updates (WS) | **Broken** (QS-001, infinite loop) | Yes | Yes (core architecture) | No (manual refresh) | Yes | No | Yes (Symphony) |
| Mobile App | **Not Built** | Basic | Yes (driver app, 1M+) | No (responsive only) | Yes (driver app) | No | Yes (McLeod Anywhere) |
| API Quality | **Built** (REST, Swagger, typed) | Yes (API + EDI) | Yes (open APIs, webhooks) | Yes (integrations) | Yes (open API + webhooks) | Yes (Descartes network) | Yes (DFM web service) |
| Keyboard Shortcuts | **Not Built** (planned Ctrl+K) | Basic | No | Basic | No | No | Yes (F-key, industry-best) |
| Multi-Tenant | **Built** (tenantId on all entities) | Yes | Yes | Yes | Yes | Yes | Yes (per-customer DB) |
| SSO/SAML | **Not Built** | Yes | Yes | No | Yes | No | Yes |
| AI Features | **Partial** (AI cargo in Load Planner) | Yes (predictive analytics) | Basic (carrier matching) | Yes (Email Assistant, 97% automation) | Yes (DataBot, Rosie, TED, Rocky) | No | Basic |
| Webhook Support | **Not Built** (planned) | Yes | Yes | Basic | Yes | No | Yes |
| EDI Support | **Not Built** | Yes (deep, all modes) | Yes | Basic | Yes | Yes (Kleinschmidt) | Yes (200+ partners) |

### Reporting & Analytics

| Feature | Ultra TMS (Actual State) | MercuryGate/Infios | Turvo | Tai TMS | Rose Rocket/TMS.ai | Descartes Aljex | McLeod |
|---------|-------------------------|-------------------|-------|---------|-------------------|----------------|--------|
| Operational Dashboards | **Partial** (shell, KPIs hardcoded) | Yes (interactive) | Yes | No (CSV exports) | Yes (real-time) | Yes (100+ templates) | Yes |
| Custom Report Builder | **Not Built** | Yes | Basic | No | Yes (Excel-like boards) | Yes (drag-and-drop) | Yes |
| Data Visualization | **Not Built** | Yes | Basic | No | Yes | Basic | Basic |
| Scheduled Reports | **Not Built** | Yes | Basic | No | No | No | Yes |
| Lane Analytics | **Not Built** | Yes | Basic | Basic | No | No | Yes (corridors) |
| Predictive Analytics | **Not Built** | Yes (AI-driven) | Basic | No | Yes (AI agents) | No | Basic |
| Export (PDF/Excel) | **Not Built** | Yes | Yes | Yes (CSV only) | Yes | Yes | Yes |

### Documents & Compliance

| Feature | Ultra TMS (Actual State) | MercuryGate/Infios | Turvo | Tai TMS | Rose Rocket/TMS.ai | Descartes Aljex | McLeod |
|---------|-------------------------|-------------------|-------|---------|-------------------|----------------|--------|
| Document Management | **Backend Only** (20 endpoints, 0 pages) | Yes | Yes | Basic | Yes (DataBot OCR) | Yes (Descartes scanning) | Yes (DocumentPower) |
| POD Capture (Mobile) | **Not Built** | Yes | Yes (camera-first) | Basic | Yes (DataBot) | Yes (Descartes) | Yes (McLeod Anywhere) |
| Claims Management | **Backend Only** (44 endpoints, 0 pages) | Yes | Basic | Basic | Basic | No | Yes |
| Compliance/Safety | **Backend Only** (safety module, 43 endpoints) | Yes | Yes | Yes (auto-updates) | Basic | Yes (MacroPoint) | Yes (FMCSA) |

---

## Key Differentiators by Competitor

### MercuryGate / Infios (Enterprise)
Now part of the Korber/Infios supply chain mega-suite, MercuryGate is the strongest multimodal TMS on the market. It handles ocean, air, rail, TL, LTL, parcel, and last-mile from a single platform. The Korber acquisition gives it WMS + yard management cross-sell. Its weakness for Ultra TMS's market: massively over-engineered and over-priced for a 20-person brokerage. Minimum $10K/year, typically $50K+ for meaningful deployments. Implementation takes months, not days.

### Turvo (Upper Mid-Market / Enterprise 3PL)
Turvo's defining strength is real-time collaboration -- every screen updates via WebSocket, with activity feeds, @mentions, and presence detection per shipment. It powers RyderShare, proving enterprise-grade scalability. Its driver app has 1M+ users, the largest in the TMS space. Weakness: pricing ($100-250/user/month) excludes small brokers, and its accounting is weak (requires QuickBooks/NetSuite). No built-in CRM.

### Tai TMS (Mid-Market Brokers)
Tai is the speed king for freight brokers. Its single-screen order entry and AI Email Assistant (97% automation rate, 30% more quotes per rep) are genuine competitive advantages no other TMS matches. The transparent carrier ranking with visible score breakdowns builds dispatcher trust. Weakness: UI is inconsistent across modules (modernized in order entry, legacy in accounting), no real-time WebSocket updates, no mobile app, and no carrier/customer portals worth mentioning. Reporting is CSV-only.

### Rose Rocket / TMS.ai (Mid-Market, AI-Native Pivot)
Rose Rocket made the boldest move in the TMS market by rebranding to TMS.ai in February 2025 and going all-in on AI agents. DataBot (OCR, 75% less data entry), Rosie (AI co-pilot, 90% faster load matching), TED (email-to-order), and Rocky (onboarding assistant) represent the most comprehensive AI agent suite in any TMS. Their no-code workflow builder and Excel-like configurable boards are strong. Weakness: no built-in accounting (requires QB/Xero), limited scalability past 200 users, and the AI-native pivot is new and unproven at scale. Pricing is custom (opaque).

### Descartes Aljex (SMB Brokers)
Correcting our earlier analysis: Aljex was acquired by **Descartes** (not Transflo) for $32.4M. The Descartes MacroPoint integration for real-time tracking is the biggest post-acquisition win -- this was Aljex's biggest gap. The quote-to-invoice lifecycle flow remains the simplest in the market. 100+ report templates and strong AR aging reports serve small brokerages well. Weakness: still dated UI (2010-era), no dispatch board, no carrier/customer portals, no AI features, and limited scalability past 50 loads/day.

### McLeod Software (Enterprise Legacy)
McLeod's v25.2 (August 2025) shows the company is not standing still. The new PowerBroker//web with Order Payables workspace, multi-select load planning, SMS-driven check call auto-updates, Carrier Sales Board, and Highway integration for one-click carrier onboarding are significant improvements. The McLeod Anywhere mobile app now covers core operations. Weakness: still primarily a desktop C#/WinForms application, v25.2 web features are additive modules not a full rewrite, and the cost ($150-350/user/month + infrastructure) remains prohibitive for small brokers. New-hire training still takes 2-4 weeks.

---

## Ultra TMS Competitive Gaps

These are features that MOST or ALL competitors have that Ultra TMS does NOT have in working condition today.

### Critical Gaps (Every Competitor Has This)

1. **Working real-time tracking** -- Ultra TMS's WebSocket layer is broken (infinite loop bug). Every competitor from Aljex (MacroPoint) to McLeod (Symphony) has functional shipment tracking. This is table-stakes for any TMS in 2026.

2. **Document management with mobile capture** -- POD upload via phone camera is standard. Ultra TMS has backend endpoints but zero frontend pages. Rose Rocket's DataBot, Turvo's camera-first portal, McLeod's Anywhere app, and even Aljex's Descartes scanning all handle this.

3. **Functional reporting / data export** -- Ultra TMS has no working dashboards (KPIs are hardcoded), no report builder, no PDF/Excel export. Even Aljex offers 100+ report templates. This is a dealbreaker for any brokerage that needs to report to management or customers.

4. **Mobile experience** -- No mobile app, no responsive optimization verified. McLeod (Anywhere), Turvo (1M+ driver app), and Rose Rocket (driver app) all have native mobile. Even Tai has responsive web.

5. **EDI support** -- Not built. Every enterprise and most mid-market shippers require EDI (204, 214, 210, 990). MercuryGate and McLeod support 200+ trading partners. Even Aljex has Kleinschmidt EDI.

### Significant Gaps (Most Competitors Have This)

6. **Customer portal** -- Backend exists (40 endpoints) but no frontend. Turvo, Rose Rocket, and MercuryGate all have branded customer-facing tracking portals. This is increasingly expected by shippers.

7. **Carrier portal** -- Backend exists (54 endpoints) but no frontend. Turvo's carrier portal is industry-best. Even McLeod improved theirs in v25.2.

8. **AI features beyond Load Planner** -- Ultra TMS has AI cargo extraction in the Load Planner (good). But Rose Rocket has 4 AI agents, Tai has an Email Assistant with 97% automation, and MercuryGate has predictive analytics. AI is no longer a differentiator -- it's a requirement.

9. **QuickBooks/accounting integration** -- Not built. Rose Rocket, Turvo, Tai, and Aljex all integrate with QuickBooks. Brokerages that don't use Ultra TMS's built-in accounting (most will want to keep their existing system initially) have no bridge.

10. **Factoring integration** -- Not built (P2 service). McLeod supports 15+ factoring companies. Many small brokerages depend on factoring for cash flow.

### Moderate Gaps

11. **SSO/SAML** -- Not built. Required for enterprise sales.
12. **Webhooks** -- Not built. Required for integration ecosystem.
13. **Route optimization** -- Not built. MercuryGate and McLeod have advanced optimization.
14. **Keyboard shortcuts** -- Not built. McLeod's F-key efficiency is a real competitive barrier.

---

## Ultra TMS Potential Advantages

### Genuine Advantages (Built and Working Today)

1. **Built-in CRM (15 pages)** -- No competitor in Ultra TMS's target market has a built-in CRM. Rose Rocket, Turvo, Tai, Aljex, and McLeod all require Salesforce or HubSpot integration. This eliminates $10K-200K/year in CRM licensing. This is Ultra TMS's single strongest differentiator IF the CRM quality holds up.

2. **Built-in accounting + commission** -- Commission module at 8.5/10 is genuinely strong. Accounting at 7.9/10 is competitive. Rose Rocket, Turvo, and MercuryGate all require external accounting software. McLeod's accounting is strong but costs 5-10x more. Combined CRM + TMS + Accounting in one platform is a value proposition no competitor matches.

3. **Modern tech stack** -- Next.js 16, React 19, NestJS, Prisma, PostgreSQL. This is objectively the most modern stack in the TMS market. Rose Rocket/TMS.ai runs React/Node but older versions. McLeod is WinForms/C#. This means faster feature velocity long-term.

4. **Multi-tenant from day one** -- Row-level security via Prisma middleware, tenantId on every entity. Competitors like McLeod bolted multi-tenancy onto single-tenant architectures. This is a genuine infrastructure advantage for SaaS economics.

5. **Migration-first schema** -- `external_id`, `source_system`, `custom_fields` on every entity. No competitor designs for easy inbound migration. This could make switching to Ultra TMS dramatically easier.

### Potential Advantages (Partially Built, Need Completion)

6. **AI cargo extraction in Load Planner** -- The 9/10 Load Planner with Google Maps and AI is strong. But Rose Rocket's TMS.ai pivot means Ultra TMS needs to move fast to maintain any AI lead.

7. **Load Planner quality** -- At 1,825 LOC and 9/10 quality, this is one specific screen that may rival Rose Rocket's dispatch board. But one great screen does not make a great product.

8. **Massive backend coverage** -- 35 active modules, 260 Prisma models, ~187 controllers. The backend is far more complete than the frontend. If Ultra TMS can build frontends for these backends, the feature depth would be competitive with mid-market players.

### Claimed But Unproven Advantages

9. **"Power user + modern UX" hybrid** -- This is the core pitch (McLeod speed + Rose Rocket beauty). Currently unproven: keyboard shortcuts not built, data density controls not built, split-pane views not built. The Commission module (8.5/10) shows it's achievable but it's one module out of 38.

10. **Real-time collaboration** -- Planned but WebSocket layer is broken. Until QS-001 is complete, this is vaporware.

---

## Honest Assessment: Where Ultra TMS Actually Stands

Ultra TMS's target segment (10-50 user small brokerages) currently has two main competitors:

| | Descartes Aljex | Rose Rocket/TMS.ai | **Ultra TMS** |
|---|---|---|---|
| Price | $290-350/mo flat | Custom (est. $100-200/user/mo) | **TBD** |
| Time to productive | Hours | 1-2 days | **Unknown (untested)** |
| Built-in CRM | No | No | **Yes (15 pages)** |
| Built-in Accounting | Yes (good) | No | **Yes (7.9/10)** |
| AI Features | None | 4 AI agents (DataBot, Rosie, TED, Rocky) | **1 (cargo extraction)** |
| Mobile | None | Driver app | **None** |
| Real-time | MacroPoint only | Yes (native) | **Broken** |
| Reporting | 100+ templates | Real-time dashboards | **Hardcoded shell** |
| Overall readiness | Production (20+ years) | Production (10 years, AI pivot 2025) | **Pre-production (QA phase)** |

The built-in CRM + Accounting combination is a genuinely unique selling point. But the product cannot ship until real-time tracking works, reporting exists, and at least basic document management is functional. The competitive window is narrowing as Rose Rocket's AI-native pivot raises the bar for the entire mid-market.

---

## Research Sources

- [MercuryGate/Infios TMS - TEC Reviews 2026](https://www3.technologyevaluation.com/solutions/16286/mercurygate-tms)
- [Korber rebrands as Infios](https://www.infios.com/en/knowledge-center/news/koerber-supply-chain-software-rebrands-as-infios)
- [Turvo Collaborative TMS](https://turvo.com/)
- [Turvo TMS Integrations 2025](https://turvo.com/articles/plug-and-play-logistics-making-tms-integrations-effortless-in-2025/)
- [Tai TMS - Capterra 2026](https://www.capterra.com/p/146697/Teknowlogi-TAI-TMS/)
- [Tai TMS Email Assistant](https://tai-software.com/components/email-integration/)
- [Rose Rocket launches TMS.ai - BusinessWire](https://www.businesswire.com/news/home/20250210026704/en/Rose-Rocket-Launches-TMS.ai-Ushering-in-the-AI-Native-Era-of-Transportation-Management)
- [Rose Rocket/TMS.ai Pricing](https://www.roserocket.com/pricing)
- [Descartes acquires Aljex - FreightWaves](https://www.freightwaves.com/news/descartes-snaps-up-aljex-software-in-32-4m-deal)
- [Descartes Aljex features](https://www.aljex.com/)
- [McLeod v25.2 release - PR Newswire](https://www.prnewswire.com/news-releases/mcleod-softwares-new-release-reimagines-the-user-experience-offering-flexibility-real-time-insights-streamlined-back-office-tools-302532232.html)
- [McLeod PowerBroker features](https://www.mcleodsoftware.com/powerbroker-logistics-brokerage-3pl/)
- [McLeod + Highway partnership](https://highway.com/press-releases/mcleod-software-and-highway-partner-to-bring-carrier-identity-management-to-powerbroker-customers)
- [G2 Reviews - MercuryGate](https://www.g2.com/products/mercurygate-tms/reviews)
- [G2 Reviews - Turvo](https://www.g2.com/products/turvo/reviews)
- [G2 Reviews - Descartes Aljex](https://www.g2.com/products/descartes-aljex/reviews)
- [G2 Reviews - Rose Rocket](https://www.g2.com/products/rose-rocket/reviews)
- [SelectHub - Aljex](https://www.selecthub.com/p/tms-software/aljex/)
- [SelectHub - McLeod](https://www.selecthub.com/p/tms-software/infios-tms/)
- [AI TMS Platforms 2025 Comparison - Ventus AI](https://www.ventus.ai/post/best-ai-driven-tms-platforms-for-freight-brokers-2025-review)
- [Best TMS for Brokers 2026 - Aljex](https://www.aljex.com/news/best-freight-broker-tms-software-2026/)
