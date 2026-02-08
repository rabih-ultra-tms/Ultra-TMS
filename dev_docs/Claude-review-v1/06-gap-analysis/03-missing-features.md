# Missing Features Analysis

> **Document:** 06-gap-analysis / 03-missing-features
> **Date:** 2026-02-07
> **Methodology:** Cross-referenced Ultra TMS's 38-service / 362-screen plan and 17 proposed missing screens against competitive 3PL TMS platforms (McLeod PowerBroker, Rose Rocket, Tai TMS, Aljex, MercuryGate, Revenova, Convoy) and standard freight brokerage operational requirements.

---

## Summary

| Category | Count |
|---|---|
| **Completely Missing** | 11 |
| **Underspecified** | 9 |
| **Need Enhancement** | 8 |
| **Total Gaps** | **28** |

---

## Completely Missing Features

### MF-001: Rate Confirmation Automation (End-to-End)

| Field | Detail |
|---|---|
| **What** | Automated generation, carrier-specific delivery (email/fax/portal), e-signature capture, signed copy archival, and expiration/resend workflow for rate confirmations. |
| **Why It Matters** | Rate confirmations are the legal contract between broker and carrier. Without automation, dispatchers manually create PDFs, email them, chase signatures, and file signed copies -- 10-15 minutes per load. At 100 loads/day, that is 25 hours of labor daily. Unsigned rate cons expose the brokerage to disputes where carrier denies agreed rate. |
| **Competitive Status** | Every major TMS has this. McLeod auto-generates and tracks signatures. Rose Rocket integrates DocuSign. Tai sends via carrier portal with signature tracking. This is table stakes. |
| **Current Ultra TMS Coverage** | TMS Core has `rate_confirmation_sent` and `rate_confirmation_signed` boolean fields on the Load table, and a `POST /loads/:id/rate-confirmation` endpoint -- but there is no document template engine, no e-signature workflow, no tracking of when the carrier opened/signed, no automatic archival, and no resend/expiration logic. The fields exist but the feature does not. |
| **Priority** | **P0 -- Must have for launch** |
| **Estimated Effort** | 3-4 weeks (template engine + e-signature integration + tracking UI) |
| **Affected Modules** | TMS Core, Documents, Communication, Integration Hub (DocuSign/PandaDoc connector) |

---

### MF-002: BOL (Bill of Lading) Generation

| Field | Detail |
|---|---|
| **What** | Automated generation of VICS/standard BOL documents from order/load data, with customer-specific templates, multi-stop BOL support, and PDF/print output. |
| **Why It Matters** | The BOL is the most important shipping document -- it is the receipt of goods, the contract of carriage, and the document of title. Brokerages that cannot generate BOLs force customers to create their own, which introduces errors and makes the brokerage look unprofessional. Competitors provide BOL generation as a core feature. |
| **Competitive Status** | Standard in McLeod, Rose Rocket, MercuryGate, Aljex. Most offer VICS BOL templates with customization. |
| **Current Ultra TMS Coverage** | The `bol_number` field exists on the Order table, but there is no BOL document template, no generation endpoint, no multi-stop BOL logic, and no print/PDF output. The Documents service (10) handles generic document storage but has no BOL-specific functionality. |
| **Priority** | **P0 -- Must have for launch** |
| **Estimated Effort** | 2-3 weeks (BOL template + generation logic + PDF rendering) |
| **Affected Modules** | TMS Core, Documents, Sales (for customer template preferences) |

---

### MF-003: Detention Tracking & Billing (Real-Time)

| Field | Detail |
|---|---|
| **What** | Real-time tracking of truck dwell time at facilities with configurable free-time thresholds, automatic detention charge calculation, proactive dispatcher alerts, and automatic accessorial charge creation for both customer billing and carrier payment. |
| **Why It Matters** | Detention costs US trucking $1.1-1.3 billion annually. For a broker, detention is either revenue (billed to customer) or cost (paid to carrier). Most brokerages lose $2,000-10,000/month by not tracking detention -- they find out after the fact when the carrier sends a bill, by which time they cannot bill the customer. Real-time tracking turns detention from a cost center into a revenue line. |
| **Competitive Status** | McLeod has detention tracking. Rose Rocket has facility dwell time. project44 and FourKites provide automated geofence-based detention detection. Most modern TMS platforms treat this as essential. |
| **Current Ultra TMS Coverage** | Proposed as Screen 366 (Detention Tracker) in the missing screens document with a MUST-HAVE priority, but it has no service documentation, no database schema for detention rules/thresholds, no API endpoints, and no integration with the Stops or Tracking entities. The accessorial system exists in Sales but has no automatic trigger mechanism. |
| **Priority** | **P0 -- Must have for launch** |
| **Estimated Effort** | 4-5 weeks (detention rules engine + real-time tracking integration + billing automation + UI) |
| **Affected Modules** | TMS Core (Stops), Sales (accessorials), Accounting (invoicing), Carrier Portal, Customer Portal |

---

### MF-004: TONU (Truck Order Not Used) Management

| Field | Detail |
|---|---|
| **What** | Formal workflow for handling load cancellations after carrier dispatch: TONU detection, reason documentation, TONU charge calculation (based on contract/standard rates), carrier payment processing, customer billing decision, and TONU analytics. |
| **Why It Matters** | TONU events cost brokerages $150-400 per occurrence. Without a formal workflow, dispatchers handle TONU informally -- sometimes paying the carrier, sometimes not, rarely billing the customer, and never tracking patterns. A customer who cancels 15% of loads after dispatch is costing the brokerage thousands, but without tracking there is no data to negotiate with. |
| **Competitive Status** | McLeod, Aljex, and MercuryGate all have TONU tracking. Rose Rocket allows TONU as a load status with charge management. |
| **Current Ultra TMS Coverage** | TONU appears only as an accessorial type in the Sales service (`TONU` at $250 flat rate). There is no TONU-specific workflow, no load cancellation-after-dispatch status, no automatic TONU charge calculation, no TONU analytics, and no trigger mechanism that detects when a TONU occurs. The Load status workflow goes from ACCEPTED directly to AT_PICKUP with no cancellation-after-acceptance state. |
| **Priority** | **P1 -- Required within 3 months of launch** |
| **Estimated Effort** | 2-3 weeks (TONU status + charge workflow + analytics) |
| **Affected Modules** | TMS Core (Load status machine), Sales (accessorials), Accounting, Analytics |

---

### MF-005: Carrier Packet / Onboarding Document Collection

| Field | Detail |
|---|---|
| **What** | Configurable carrier onboarding packet with required document checklist (carrier agreement, W-9, insurance certificates, void check, authority letter, CARB compliance, etc.), document status tracking per carrier, reminder automation, and a progress dashboard showing onboarding completion percentage. |
| **Why It Matters** | Carrier onboarding is the second most time-consuming back-office task (after invoicing). Brokerages onboard 50-200 new carriers per month. Without a formal packet system, onboarding is managed via email chains and spreadsheets. Documents get lost, requirements are inconsistent, and compliance team spends hours chasing paperwork. |
| **Competitive Status** | RMIS (now part of Highway) built its entire business on carrier packets. Every enterprise TMS has this. Rose Rocket has a carrier onboarding wizard. Tai has document checklists. |
| **Current Ultra TMS Coverage** | The Carrier service has document upload endpoints and the carrier_documents table, but there is no configurable packet template, no document checklist per onboarding, no completion percentage tracking, no automated reminder system, and no onboarding progress dashboard. The Carrier Portal has basic registration but no guided document collection workflow. |
| **Priority** | **P1 -- Required within 3 months of launch** |
| **Estimated Effort** | 3-4 weeks (packet templates + checklist engine + progress tracking + reminders) |
| **Affected Modules** | Carrier, Carrier Portal, Documents, Communication, Workflow |

---

### MF-006: Facility / Location Database

| Field | Detail |
|---|---|
| **What** | Centralized database of shipping/receiving facilities with operating hours, dock information, facility requirements (appointment, lumper, TWIC, PPE), average dwell time, detention history, driver notes, contact directory, and proximity search. Auto-populated from historical load data. |
| **Why It Matters** | Dispatchers re-ask facility questions on every load -- hours, appointment requirements, lumper needs. This wastes 5-10 minutes per load. Institutional knowledge about facilities leaves when employees quit. A facility database captures and shares this knowledge permanently, reducing load setup time by 25-40%. |
| **Competitive Status** | McLeod has facility management. MercuryGate has location profiles. Descartes has a global location database. project44 provides facility intelligence. Rose Rocket tracks locations with notes. |
| **Current Ultra TMS Coverage** | Proposed as Screen 364 in missing screens with MUST-HAVE priority. The Stops table stores `facility_name` as a plain text field, but there is no dedicated Facility entity, no facility-level data model, no API endpoints, and no facility-specific UI. This is entirely missing from all 38 service definitions. |
| **Priority** | **P0 -- Must have for launch** |
| **Estimated Effort** | 4-5 weeks (data model + auto-population from stops + facility UI + search + driver notes) |
| **Affected Modules** | TMS Core (new Facility entity), CRM, Carrier Portal, Customer Portal, Analytics |

---

### MF-007: Automated Check Call System

| Field | Detail |
|---|---|
| **What** | Scheduled automated outreach to drivers/carriers for status updates via SMS, app push notification, or IVR phone call. Configurable intervals (every 2-4 hours). Auto-detects non-responsive drivers and escalates. Supports template messages in English and Spanish. Integrates with GPS tracking to auto-fill check calls when geofence events occur. |
| **Why It Matters** | Check calls are legally recommended (not mandated) and operationally critical -- they are how a broker knows where freight is. Dispatchers manually calling 30-50 drivers per day for check calls is the single biggest time sink in brokerage operations. Automating check calls via SMS/app reclaims 2-4 hours per dispatcher per day. |
| **Competitive Status** | MacroPoint (now project44), FourKites, and Trucker Tools all provide automated check calls. McLeod integrates with MacroPoint. Rose Rocket has built-in automated tracking. Most modern TMS platforms either build this or integrate with tracking providers. |
| **Current Ultra TMS Coverage** | The check_calls table and API exist in TMS Core. Check calls can be logged manually. The system records `source` (MANUAL, MACROPOINT, ELD, DRIVER_APP) which shows the intent to integrate with tracking providers. However, there is no automated outbound check call system, no SMS template engine for check calls, no non-responsive driver detection, no escalation workflow, and no auto-check-call from geofence. The Communication service has email/SMS capability but no scheduled check-call-specific automation. |
| **Priority** | **P1 -- Required within 3 months of launch** |
| **Estimated Effort** | 3-4 weeks (SMS templates + scheduler integration + non-responsive detection + escalation + Spanish support) |
| **Affected Modules** | TMS Core, Communication, Scheduler, Workflow, Integration Hub (Twilio) |

---

### MF-008: Customer Portal with Live Tracking

| Field | Detail |
|---|---|
| **What** | Customer-facing web portal providing real-time shipment visibility with map-based tracking, ETA display, document access (BOL, POD, invoices), order submission, quote requests, load history, and self-service reporting. Branded per customer with SSO support. |
| **Why It Matters** | Customers expect Amazon-level shipment visibility. A 3PL without a customer portal forces customers to call/email for every status update, creating 10-20 inbound calls per day that dispatchers must handle instead of dispatching. A customer portal reduces inbound status inquiries by 60-80% and is a competitive differentiator when selling to shippers. |
| **Competitive Status** | Every competitive TMS has a customer portal. Rose Rocket, Tai, and Revenova all provide branded customer portals with live tracking. This is expected by enterprise shippers and increasingly by SMB shippers. |
| **Current Ultra TMS Coverage** | Service 12 (Customer Portal) is planned with 10 screens, but the service documentation lacks critical details: there is no mention of live map-based tracking, no real-time WebSocket architecture for the portal, no SSO/branding configuration, no self-service reporting, and no mobile-responsive portal design. The service exists in the plan but is underspecified for competitive parity. |
| **Priority** | **P0 -- Must have for launch** (see also UF-001 below for enhancement details) |
| **Estimated Effort** | 6-8 weeks (live tracking map + WebSocket infrastructure + branding engine + self-service reports) |
| **Affected Modules** | Customer Portal, TMS Core (tracking data), Documents, Analytics, Auth (SSO) |

---

### MF-009: Appointment Scheduling System

| Field | Detail |
|---|---|
| **What** | Integrated appointment scheduling with facility-specific time slot management, automated appointment request submission (phone/email/web portal), confirmation tracking, appointment change management, and calendar views showing all pending/confirmed appointments. |
| **Why It Matters** | Appointment scheduling is one of the most tedious dispatcher tasks. Each load requires 1-2 appointments (pickup and delivery). Making appointments involves calling facilities, being on hold 10-30 minutes, documenting the appointment number, and monitoring for changes. An integrated system that tracks appointment status and provides calendar visibility saves 5-10 minutes per appointment. |
| **Competitive Status** | McLeod has appointment management. MercuryGate has built-in scheduling. Opendock and Relayr provide facility appointment systems that TMS platforms integrate with. |
| **Current Ultra TMS Coverage** | The Stops table has `appointment_required`, `appointment_date`, `appointment_time_start`, `appointment_time_end`, and `appointment_number` fields -- sufficient for recording appointments but not for managing the appointment lifecycle. There is no appointment request workflow, no confirmation tracking state machine, no integration with facility scheduling systems (Opendock), and no calendar view of upcoming appointments. |
| **Priority** | **P1 -- Required within 3 months of launch** |
| **Estimated Effort** | 3-4 weeks (appointment lifecycle + calendar view + facility system integration) |
| **Affected Modules** | TMS Core (Stops), Communication, Scheduler, Integration Hub |

---

### MF-010: Document OCR and Auto-Classification

| Field | Detail |
|---|---|
| **What** | Optical character recognition (OCR) for uploaded documents (PODs, BOLs, rate confirmations, insurance certificates) with automatic document type classification, data extraction (amounts, dates, reference numbers), and auto-population of system fields from extracted data. |
| **Why It Matters** | A mid-size brokerage processes 500-2,000 documents per week. Each document must be classified, filed, and often manually transcribed (e.g., reading a POD to enter delivery date, reading an insurance certificate to enter expiration date). OCR with auto-classification reduces document processing time by 60-70% and eliminates transcription errors. |
| **Competitive Status** | McLeod offers OCR through partners. MercuryGate has built-in document intelligence. Emerge (built by Convoy's team) and Turvo both feature AI document processing. This is increasingly a differentiator. |
| **Current Ultra TMS Coverage** | The Documents service (10) lists "OCR" in its feature bullet points, but there is no OCR implementation detail -- no mention of OCR provider (Google Vision, AWS Textract, Azure Form Recognizer), no document classification model, no extraction schema per document type, and no auto-population workflow. This is a feature bullet with no substance behind it. |
| **Priority** | **P2 -- Target for 6-month post-launch** |
| **Estimated Effort** | 4-6 weeks (OCR integration + classification model + extraction rules + auto-population) |
| **Affected Modules** | Documents, Integration Hub (OCR provider), TMS Core, Carrier (insurance extraction), Accounting (invoice extraction) |

---

### MF-011: Automated Carrier Matching / Smart Dispatch

| Field | Detail |
|---|---|
| **What** | Algorithm-based carrier recommendation engine that matches available loads to qualified carriers based on lane history, equipment, rate, performance score, availability, proximity, and compliance status. Ranks carriers by fit score and presents a prioritized list to dispatchers. |
| **Why It Matters** | Finding the right carrier is the most time-consuming dispatch task. Dispatchers call 10-20 carriers per load. An intelligent matching system reduces carrier search time from 30 minutes to 5 minutes by presenting the top 5-10 best-fit carriers immediately. This directly increases load volume per dispatcher. |
| **Competitive Status** | Convoy built its entire business on algorithmic carrier matching. Uber Freight, Rose Rocket, and Parade all offer AI-based carrier recommendations. This is the direction the industry is moving. |
| **Current Ultra TMS Coverage** | The Carrier service tracks performance scores, lane preferences, equipment, and compliance -- all the data needed for matching. But there is no matching algorithm, no recommendation engine, no carrier ranking system for a specific load, and no "suggested carriers" feature in the dispatch workflow. The data infrastructure is there but the intelligence layer is missing. |
| **Priority** | **P2 -- Target for 6-month post-launch** |
| **Estimated Effort** | 4-6 weeks (matching algorithm + scoring model + dispatch board integration + learning loop) |
| **Affected Modules** | TMS Core (Dispatch Board), Carrier, Analytics, Rate Intelligence |

---

## Underspecified Features

### UF-001: Customer Portal Live Tracking

| Field | Detail |
|---|---|
| **What** | Customer Portal (Service 12) mentions 10 screens but lacks detail on real-time map tracking, WebSocket-based status updates, ETA sharing, and exception notifications visible to customers. |
| **Gap** | No WebSocket architecture defined for the portal. No specification of which tracking data is exposed to customers. No mention of branded/white-label capability. No mobile-responsive design specs. |
| **Recommended Enhancement** | Define WebSocket events for customer portal, specify tracking data filtering (what customers can vs cannot see), add branding configuration schema, and create mobile-responsive wireframes. |
| **Priority** | **P0** |
| **Affected Modules** | Customer Portal, TMS Core |

### UF-002: EDI 204/210/214/990 Implementation Detail

| Field | Detail |
|---|---|
| **What** | The EDI service (29) lists X12 document types but has no detailed field mapping, no trading partner configuration schema, no EDI acknowledgment handling (997), and no error handling/rejection workflow. |
| **Gap** | EDI is critical for enterprise customers. Without detailed 204 (Motor Carrier Load Tender), 210 (Motor Carrier Freight Invoice), 214 (Transportation Carrier Shipment Status), and 990 (Response to Load Tender) specifications, the implementation will require significant rework. |
| **Recommended Enhancement** | Create detailed segment-level mapping for each X12 document type, define trading partner profiles, add 997 functional acknowledgment support, and specify EDI error handling. |
| **Priority** | **P1** |
| **Affected Modules** | EDI, TMS Core, Accounting, Integration Hub |

### UF-003: Accounting System Sync (QuickBooks/Xero)

| Field | Detail |
|---|---|
| **What** | The Accounting service mentions "QuickBooks sync" and has a `quickbooks_id` field on the chart of accounts, but lacks detailed sync architecture: which entities sync, which direction (one-way vs two-way), conflict resolution, sync frequency, error handling, and Xero support. |
| **Gap** | Accounting integration is the second most requested feature by brokerages (after tracking). Without detailed sync specs, the implementation will be fragile and incomplete. |
| **Recommended Enhancement** | Define entity-level sync mapping (invoices, payments, customers, vendors, chart of accounts), specify sync direction and frequency, add conflict resolution rules, and plan Xero connector in parallel with QuickBooks. |
| **Priority** | **P0** |
| **Affected Modules** | Accounting, Integration Hub |

### UF-004: Multi-Currency and International Support

| Field | Detail |
|---|---|
| **What** | The Cross-Border service (37) exists but the core financial entities (invoices, quotes, carrier payables) only default to USD. There is no currency conversion engine, no multi-currency invoice support, no exchange rate management, and no Canadian/Mexican tax handling. |
| **Gap** | Cross-border shipments represent 15-20% of US trucking volume. Without multi-currency support, the brokerage cannot properly invoice Canadian customers in CAD or pay Mexican carriers in MXN. |
| **Recommended Enhancement** | Add currency fields to all financial entities, build exchange rate service, support multi-currency invoicing, and add GST/HST/IVA tax calculation. |
| **Priority** | **P1** |
| **Affected Modules** | Accounting, Sales, TMS Core, Cross-Border |

### UF-005: Notification System Architecture

| Field | Detail |
|---|---|
| **What** | Multiple services reference notifications (insurance expiration, load status changes, compliance alerts, credit holds), but there is no centralized notification service, no notification preference management, no notification delivery channels specification (in-app, email, SMS, push), and no notification history/read-tracking. |
| **Gap** | Without a centralized notification architecture, each service will implement notifications differently, creating inconsistent UX and making it impossible for users to manage their notification preferences. |
| **Recommended Enhancement** | Create a dedicated Notification service (or extend Communication service) with: notification types registry, user preference management, delivery channel abstraction, notification inbox UI, and read/dismiss tracking. |
| **Priority** | **P0** |
| **Affected Modules** | Communication (extend), all services that publish notifications |

### UF-006: Reporting and Export Engine

| Field | Detail |
|---|---|
| **What** | The Analytics service (19) plans 10 screens and various reports, but there is no specification for a report builder/engine: no configurable report templates, no scheduled report generation, no export formats (Excel, PDF, CSV), no email distribution lists, and no report sharing/permissions. |
| **Gap** | Every brokerage user needs reports. Without a report engine, each report is a custom-coded screen -- making it impossible for users to create their own reports or modify existing ones. Competitors like McLeod and MercuryGate have report builders. |
| **Recommended Enhancement** | Design a report engine with configurable dimensions/measures, scheduling, multi-format export, email distribution, and role-based report access. |
| **Priority** | **P1** |
| **Affected Modules** | Analytics, all data services |

### UF-007: Bulk Operations Framework

| Field | Detail |
|---|---|
| **What** | The design documents mention bulk operations in several places (batch invoicing, batch carrier notifications, bulk load posting), but there is no consistent bulk operations framework: no batch job queue, no progress tracking, no partial failure handling, no undo capability. |
| **Gap** | Brokerages routinely process items in bulk -- invoice 50 loads at once, post 20 loads to load boards, send 100 carrier reminders. Without a bulk operations framework, each bulk action is implemented differently with inconsistent error handling. |
| **Recommended Enhancement** | Create a bulk operations service with job queue, progress WebSocket events, partial failure handling with per-item status, and batch result summary. |
| **Priority** | **P1** |
| **Affected Modules** | All services with list views |

### UF-008: Audit Trail and Change History

| Field | Detail |
|---|---|
| **What** | The Audit service (23) is planned with 6 screens, but the audit architecture lacks detail: which entities are audited, what level of change granularity (field-level vs entity-level), how audit data is stored (same DB vs separate), retention policy, and audit report generation. |
| **Gap** | Freight brokerages are subject to FMCSA regulation and customer audits. A weak audit trail means the brokerage cannot prove compliance, answer customer disputes, or investigate internal issues. |
| **Recommended Enhancement** | Define field-level audit for all financial and compliance entities, specify storage architecture (separate audit database for performance), add audit query API, and implement audit-focused UI with timeline visualization. |
| **Priority** | **P1** |
| **Affected Modules** | Audit, all entities with financial or compliance data |

### UF-009: Role-Based Dashboard Customization

| Field | Detail |
|---|---|
| **What** | The design docs define 11 user roles with different access levels, but all roles see the same dashboard. There is no dashboard widget system, no role-specific default layouts, no user customization (drag/drop widgets), and no saved dashboard configurations. |
| **Gap** | A dispatcher, sales rep, and CFO need completely different home screens. Without customizable dashboards, every role sees the same KPIs, making the dashboard irrelevant to most users. |
| **Recommended Enhancement** | Create a widget-based dashboard system with role-specific defaults, user customization, and saved layouts. Define KPI widgets per role. |
| **Priority** | **P2** |
| **Affected Modules** | Dashboard Shell, Analytics, Config |

---

## Features Needing Enhancement

### NE-001: Lane History Analytics

| Field | Detail |
|---|---|
| **Current State** | Proposed as Screen 365 (Lane Performance Analytics) in missing screens. The Rate Intelligence service (35) provides market rates. Historical load data exists across TMS Core and Accounting. |
| **Enhancement Needed** | The proposed screen is analytics-only. The gap is that lane history data is not surfaced at the point of decision -- during quoting and during carrier rate negotiation. Lane history should be embedded inline in the Quote Builder and Dispatch Board, not just available as a standalone report. |
| **Priority** | **P1** |

### NE-002: Accessorial Charge Management

| Field | Detail |
|---|---|
| **Current State** | The Sales service defines 10 default accessorial types with fixed rates. The Stops table has an `accessorials` JSONB field. |
| **Enhancement Needed** | Accessorials need: customer-contract-specific rates (not just tenant-wide defaults), automatic accessorial triggers (detention threshold crossed -> auto-add detention charge), carrier-side accessorial tracking (what the carrier charges vs what customer is billed), and accessorial approval workflow for charges above a threshold. |
| **Priority** | **P1** |

### NE-003: Fuel Surcharge Calculator

| Field | Detail |
|---|---|
| **Current State** | Proposed as Screen 379 in missing screens. The Sales service has `fuel_surcharge` fields and mentions DOE index calculation. |
| **Enhancement Needed** | The fuel surcharge needs a DOE EIA API integration, configurable fuel surcharge tables per customer contract, automatic weekly recalculation, and batch application to open loads. The current implementation is a single field with no calculation engine. |
| **Priority** | **P1** |

### NE-004: Customer Credit Check Integration

| Field | Detail |
|---|---|
| **Current State** | The Credit service (16) handles credit applications and credit limits internally. |
| **Enhancement Needed** | Missing external credit bureau integration (Dun & Bradstreet, Experian Business, Equifax Commercial) for automated credit scoring. The credit application workflow should pull external credit data automatically rather than relying on manual review of financial statements. Also missing: trade reference verification automation, credit insurance integration (Euler Hermes, Coface). |
| **Priority** | **P2** |

### NE-005: FMCSA Authority Verification (Depth)

| Field | Detail |
|---|---|
| **Current State** | Both the Carrier service and Safety service have FMCSA SAFER integration with authority checking, CSA scores, and insurance on file. |
| **Enhancement Needed** | Missing: real-time authority monitoring (not just periodic checks), instant FMCSA revocation alerts, integration with FMCSA's LICENSEE system for insurance cancellation notifications (FMCSA publishes insurance cancellation 30 days before effective), and double-brokering detection (verify carrier is not re-brokering loads). Also missing: integration with Highway (formerly RMIS) or Carrier411 for continuous monitoring. |
| **Priority** | **P1** |

### NE-006: Exception Dashboard Workflow

| Field | Detail |
|---|---|
| **Current State** | Proposed as Screen 363 in missing screens (MUST-HAVE priority) with excellent functional specification. |
| **Enhancement Needed** | The exception dashboard needs a backend exception detection engine -- the screen is designed but there are no services that detect exceptions automatically. Need: late detection rules (pickup/delivery time threshold exceeded), non-responsive driver detection (no check call in X hours), service failure detection (appointment missed), and compliance exception triggers (carrier insurance expired during transit). Each exception type needs a detection rule, severity calculation, and auto-escalation timer. |
| **Priority** | **P0** |

### NE-007: Claims Resolution Financial Integration

| Field | Detail |
|---|---|
| **Current State** | The Claims service (09) has a comprehensive workflow from intake through resolution with carrier accountability, subrogation, and settlement. |
| **Enhancement Needed** | Missing: automatic creation of AP credit memos when carrier is found liable, automatic creation of AR credit memos when customer is compensated, integration with the carrier scorecard for claims impact, insurance claim filing workflow (for claims exceeding the deductible), and claims reserve accounting (booking a reserve when claim is filed, releasing when settled). |
| **Priority** | **P1** |

### NE-008: Mobile Dispatch Experience

| Field | Detail |
|---|---|
| **Current State** | Service 34 (Mobile App) is planned for Phase B with 8 screens, focused on driver-facing functionality (driver app). |
| **Enhancement Needed** | Missing: dispatcher mobile experience. Dispatchers and operations managers need mobile access to the dispatch board, load status updates, exception alerts, and quick carrier communication. The current mobile plan is driver-only. A responsive web app or dedicated dispatcher mobile screens would address after-hours operations coverage. |
| **Priority** | **P2** |

---

## Priority Summary

### P0 -- Must Have for Launch (8 items)

| ID | Feature | Type | Effort |
|---|---|---|---|
| MF-001 | Rate Confirmation Automation | Missing | 3-4 weeks |
| MF-002 | BOL Generation | Missing | 2-3 weeks |
| MF-003 | Detention Tracking & Billing | Missing | 4-5 weeks |
| MF-006 | Facility / Location Database | Missing | 4-5 weeks |
| MF-008 | Customer Portal Live Tracking | Missing | 6-8 weeks |
| UF-001 | Customer Portal Spec Detail | Underspec | 1-2 weeks |
| UF-003 | Accounting System Sync Detail | Underspec | 2-3 weeks |
| UF-005 | Notification System Architecture | Underspec | 3-4 weeks |
| NE-006 | Exception Detection Engine | Enhancement | 3-4 weeks |

**Total P0 Effort: ~30-38 weeks (with parallelization, ~12-15 weeks with 3 developers)**

### P1 -- Required Within 3 Months (12 items)

| ID | Feature | Type | Effort |
|---|---|---|---|
| MF-004 | TONU Management | Missing | 2-3 weeks |
| MF-005 | Carrier Packet System | Missing | 3-4 weeks |
| MF-007 | Automated Check Calls | Missing | 3-4 weeks |
| MF-009 | Appointment Scheduling | Missing | 3-4 weeks |
| UF-002 | EDI Implementation Detail | Underspec | 2-3 weeks |
| UF-004 | Multi-Currency Support | Underspec | 3-4 weeks |
| UF-006 | Reporting Engine | Underspec | 4-5 weeks |
| UF-007 | Bulk Operations Framework | Underspec | 2-3 weeks |
| UF-008 | Audit Trail Detail | Underspec | 2-3 weeks |
| NE-001 | Lane History at Point of Decision | Enhancement | 1-2 weeks |
| NE-002 | Accessorial Charge Automation | Enhancement | 2-3 weeks |
| NE-003 | Fuel Surcharge Engine | Enhancement | 2-3 weeks |
| NE-005 | FMCSA Continuous Monitoring | Enhancement | 2-3 weeks |
| NE-007 | Claims Financial Integration | Enhancement | 2-3 weeks |

**Total P1 Effort: ~33-46 weeks**

### P2 -- Target 6 Months Post-Launch (5 items)

| ID | Feature | Type | Effort |
|---|---|---|---|
| MF-010 | Document OCR & Auto-Classification | Missing | 4-6 weeks |
| MF-011 | Automated Carrier Matching | Missing | 4-6 weeks |
| NE-004 | External Credit Bureau Integration | Enhancement | 3-4 weeks |
| NE-008 | Mobile Dispatch Experience | Enhancement | 4-6 weeks |
| UF-009 | Role-Based Dashboard Customization | Underspec | 3-4 weeks |

**Total P2 Effort: ~18-26 weeks**

---

## Competitive Position Assessment

| Feature Area | Ultra TMS | McLeod | Rose Rocket | Tai TMS | MercuryGate |
|---|---|---|---|---|---|
| Rate Confirmation Automation | Partial (fields only) | Full | Full + DocuSign | Full | Full |
| BOL Generation | Missing | Full | Full | Full | Full |
| Detention Tracking | Proposed only | Full | Partial | Partial | Full |
| TONU Management | Accessorial only | Full | Full | Partial | Full |
| Carrier Onboarding Packets | Basic uploads | Full | Full | Full | Full |
| Facility Database | Missing | Full | Partial | Missing | Full |
| Automated Check Calls | Manual only | Via MacroPoint | Built-in | Via partners | Via partners |
| Customer Portal + Live Tracking | Planned (underspec) | Full | Full | Full | Full |
| Appointment Management | Data fields only | Full | Partial | Partial | Full |
| Document OCR | Mentioned only | Via partners | Missing | Missing | Full |
| Carrier Matching AI | Missing | Partial | Partial | Missing | Partial |
| EDI (full implementation) | Planned (underspec) | Full | Partial | Partial | Full |
| Accounting Sync | Planned (underspec) | Full | QuickBooks | QuickBooks | Full |

---

*This analysis should be reviewed alongside [01-3pl-broker-expectations.md](./01-3pl-broker-expectations.md) for industry context and [04-missing-workflows.md](./04-missing-workflows.md) for process-level gaps.*

*Last Updated: February 7, 2026*
