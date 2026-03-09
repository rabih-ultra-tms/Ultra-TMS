# Consolidated Per-Service Tribunal Verdicts

> Summary of all 38 per-service tribunal outcomes.
> Each row links to the full PST file for details.

## Verdict Summary

| # | Service | Tier | Verdict | Hub Score | Verified Score | Delta | Critical Actions | PST File |
| --- | ------- | ---- | ------- | --------- | -------------- | ----- | ---------------- | -------- |
| 01 | Auth & Admin | P0-MVP | MODIFY | 6.5/10 | 7.5/10 | +1.0 | Rewrite data model docs (10 errors), add integration tests, fix audit log immutability | `batch-1-p0/PST-01-auth-admin.md` |
| 03 | CRM / Customers | P0-MVP | MODIFY | 7.1/10 | 7.5/10 | +0.4 | Rewrite data model docs (15+ errors), fix tenant isolation in mutations, document HubSpot integration, update stale bug statuses | `batch-1-p0/PST-03-crm.md` |
| 02 | Dashboard | P0-MVP | MODIFY | 5.0/10 | 8.5/10 | **+3.5** | 20+ hub errors (all 5 known issues already fixed), soft-delete gaps in 4/6 dashboard controllers, 0% test coverage on 4,225 LOC, hub claims "hardcoded zeros" but all hooks call real APIs | `batch-1-p0/PST-02-dashboard.md` |
| 04 | Sales & Quotes | P0-MVP | MODIFY | 6.0/10 | 8.0/10 | **+2.0** | Wire margin enforcement (dead code), create quote expiry cron job, fix tenant isolation, rewrite data model (12+ errors + phantom QuoteItem), update all screen quality ratings (+4-5 pts each) | `batch-1-p0/PST-04-sales-quotes.md` |
| 05 | TMS Core | P0-MVP | MODIFY | 8.0/10 | 7.8/10 | -0.2 | Data model ~30% accurate (phantom TrackingEvent, 4 models 60-80% field errors), 51 endpoints not 65, CheckCalls architecture wrong (nested not standalone), Stops routing wrong, 16 tests exist (hub claims 0), orders delete no-op, 3 envelope patterns in hooks | `batch-1-p0/PST-05-tms-core.md` |
| 06 | Carrier Management | P0-MVP | MODIFY | 6.5/10 | 8.0/10 | **+1.5** | **BIGGEST FINDING: dual backend modules** — hub documents `/carriers/` (52 endpoints, Carrier model) but frontend uses `/operations/carriers/` (22 endpoints, OperationsCarrier model). Hub data model ~15% accurate (wrong model family). 34 hooks exist (hub claims 9). 3/6 known issues are false (window.confirm fixed, 594 LOC not 858, E2E tests exist). Missing 2 Prisma models in docs. Insurance architecture completely different between modules. | `batch-1-p0/PST-06-carrier-management.md` |
| 07 | Accounting | P0-MVP | MODIFY | 7.0/10 | 8.2/10 | **+1.2** | Hub documents toy invoicing (3 models, 17 endpoints); reality is **full double-entry accounting** (11 models, 54 endpoints) with ChartOfAccounts, JournalEntries, PaymentApplications, PDF generation. Dashboard endpoint EXISTS (hub's #1 P0 "QS-003" is false — endpoint built). Hub "Payment" model phantom (split into PaymentReceived + PaymentMade). 4 cross-tenant bugs in payment application transactions. 6/10 controllers missing role guards. Soft delete on 7 models but only 1 service filters it. 3/8 known issues false. Frontend has best envelope consistency of all P0 services. | `batch-1-p0/PST-07-accounting.md` |
| 08 | Commission | P0-MVP | MODIFY | 8.0/10 | 8.5/10 | +0.5 | **Smallest delta — hub frontend sections ~90% accurate** (best of all P0 hubs). Backend sections ~25%: hub documents 3 models/9 endpoints, reality is 7 models/31 endpoints. Model names wrong (Commission→CommissionEntry, CommissionPayment→CommissionPayout). 4 missing models (PlanTier, UserAssignment, AgentCommission, AgentPayout). **Agent commission system entirely undocumented.** Security "Unknown" is FALSE — 100% guard coverage on all 31 endpoints. 63 tests total (hub claims 14 — misses all 42 BE tests). Soft-delete 60% (entries/payouts/agents don't filter). Best envelope consistency (tied w/ Accounting). Cleanest P0 service overall. | `batch-1-p0/PST-08-commission.md` |
| 09 | Load Board | P0-MVP | MODIFY | 6.0/10 | 8.0/10 | **+2.0** | Hub says "partial stub" (7 endpoints, 2 models) — **FALSE**: reality is 62 endpoints across 9 controllers, 5 Prisma models (200+ fields). **Worst endpoint ratio: 8.9x**. Entire subsystems undocumented: tender management (waterfall/broadcast), capacity search, lead pipeline, analytics, accounts, rules. Dual API generation (v1 legacy + new) — similar to PST-06 carrier dual-module. 6/9 controllers missing RolesGuard (AccountsController + RulesController HIGH risk). 65+ tests (hub claims ~13). Wrong model names (LoadBoardPosting→LoadPosting, LoadBoardOffer→LoadBid). Frontend quality confirmed — envelope correct, hub screen ratings accurate (first P0 service). | `batch-1-p0/PST-09-load-board.md` |
| 13 | Customer Portal | P0-MVP | MODIFY | 2.5/10 | 5.5/10 | **+3.0** | **WORST HUB INTERNAL CONTRADICTION**: Section 8 says "No Prisma models exist" while Section 2 says "8 models" — reality is all 8 exist with full fields. Hub claims "0 tests" — FALSE, 63 tests across 9 spec files (tied 3rd highest of all P0). **JWT secret inconsistency bug**: module signs with PORTAL_JWT_SECRET, guard verifies with CUSTOMER_PORTAL_JWT_SECRET. Public tracking endpoint `/portal/track/:code` is PHANTOM (documented but not built — blocks P0 scope). ~30% of endpoint paths wrong (8 phantom, 8 undocumented). Rate limiting EXISTS on login (hub says none). Frontend correctly confirmed as 0 pages. Security architecture excellent (100% guard + CompanyScopeGuard for company isolation). | `PST-13-customer-portal.md` |
| 11 | Documents | P1-PostMVP | MODIFY | 4.5/10 | 7.0/10 | **+2.5** | **2 MISSING PRISMA MODELS**: DocumentShare (18 fields, full sharing system) and GeneratedDocument (15 fields, template generation) completely absent from hub. Hub data model accuracy: Document ~80%, DocumentFolder ~50%, DocumentTemplate ~30%. **UPLOAD BUG**: Frontend sends FormData but backend uses @Body() DTO — no FileInterceptor/Multer. 3 phantom frontend components (DocumentUploadDialog, DocumentCard, DocumentViewer) — actual components are DocumentList, UploadZone, PermitList, RateConPreview, DocumentActions. .bak module has 2,243 LOC of sharing + generation features (abandoned). Active endpoint count matches hub (20=20, first service!). Security excellent: 100% guard + custom DocumentAccessGuard with document-type-aware access control. 77 tests across 4 spec files (hub claims 7 files). | `PST-11-documents.md` |
| 12 | Communication | P1-PostMVP | MODIFY | 3.0/10 | 7.5/10 | **+4.5** | **2nd LARGEST SCORE JUMP.** Hub "Notification" model wrong name — actual is `InAppNotification` with different schema. 2 missing Prisma models (SmsConversation, SmsMessage). **BUG: SMS webhook non-functional** — inherits JwtAuthGuard from class, Twilio can't auth. No Twilio signature validation. 68 tests across 8 spec files (hub claims 0). Hub self-contradicts: Section 1 says "3 hooks exist", Section 6 says all "Not Built". `useAutoEmail` (258 LOC) implements all 5 automated email triggers. Endpoint count 100% accurate (30=30, 2nd perfect match). Rate limiting verified (@Throttle exists, hub says unverified). NotificationPreference architecture different (flat event booleans + quiet hours vs per-type rows). Known issues 4/9 accurate. | `PST-12-communication.md` |
| 14 | Carrier Portal | P1-PostMVP | MODIFY | 2.5/10 | 7.5/10 | **+5.0** | **NEW LARGEST SCORE JUMP (+5.0). BATCH 2 COMPLETE.** Hub endpoint paths only 52% accurate — **9 phantom loads endpoints** (stops, checkcalls, rate-con, timeline, stats) copied from design specs, never built. 10 real endpoints undocumented (save, bid, matching, status, location, eta, message). 3 missing models (CarrierSavedLoad misclassified as "Shared", CarrierInvoiceSubmission, CarrierQuickPayRequest — entire quick pay workflow undocumented). Quick pay: 2% fee, $100 min, acceptTerms required. 69 real tests / 911 LOC (hub: "7 stubs + 1 e2e 80 LOC" — 8th false stubs claim). Soft-delete CRITICAL: 5/7 services skip `deletedAt: null` filter — portal users could see deleted loads/invoices/documents. Login tenant isolation gap (email-only query without tenantId — cross-tenant auth bypass for shared emails). Dual guard excellent (CarrierPortalAuthGuard + CarrierScopeGuard, 100% on 50 protected endpoints). Frontend "Not Built" correctly documented. 12 DTOs with proper validation. | `PST-14-carrier-portal.md` |

## Verdict Distribution

| Verdict | Count | Services |
| ------- | ----- | -------- |
| AFFIRM | 0 | |
| MODIFY | 13 | Auth & Admin, Dashboard, CRM / Customers, Sales & Quotes, TMS Core, Carrier Management, Accounting, Commission, Load Board, Customer Portal, Documents, Communication, Carrier Portal |
| REVERSE | 0 | |
| DEFER | 0 | |

## Top Action Items (Across All Services)

| # | Action | Source PST | Priority | Effort | Owner |
| --- | ------ | --------- | -------- | ------ | ----- |
| 1 | Rewrite hub Section 8 (Data Model) — 10 factual errors | PST-01 | P0 | 1-2h | Claude Code |
| 2 | Update hub Sections 3-6 with actual counts/statuses | PST-01 | P0 | 2h | Claude Code |
| 3 | Add tenant isolation integration tests | PST-01 | P0 | 3-4h | Claude Code |
| 4 | Add password reset flow integration tests | PST-01 | P1 | 2-3h | Claude Code |
| 5 | Build useAuditLogs hook + wire audit-logs page | PST-01 | P1 | 3-4h | Any |
| 6 | Fix AuditLog immutability (remove deletedAt or add before/after) | PST-01 | P1 | 2h | Claude Code |
| 7 | Fix tenant isolation in all CRM mutations (update/delete need tenantId in WHERE) | PST-03 | P0 | 2h | Claude Code |
| 8 | Rewrite CRM hub Section 8 (Data Model) — 15+ factual errors | PST-03 | P0 | 2h | Claude Code |
| 9 | Update CRM hub Sections 1-6, 11, 12, 15 with verified data | PST-03 | P0 | 2h | Claude Code |
| 10 | Disable or authenticate HubSpot webhook endpoint | PST-03 | P1 | 1h | Claude Code |
| 11 | Wire `enforceMinimumMargin()` into quote create/update flow | PST-04 | P0 | 2h | Claude Code |
| 12 | Create quote expiry cron job (check validUntil, mark EXPIRED) | PST-04 | P0 | 1h | Claude Code |
| 13 | Fix tenant isolation in Sales mutations (Quotes, RateContracts, AccessorialRates) | PST-04 | P0 | 2h | Claude Code |
| 14 | Rewrite Sales hub data model — 12+ errors, delete phantom QuoteItem, add 3 missing models | PST-04 | P0 | 3h | Claude Code |
| 15 | Update Sales hub screen ratings (4 screens off by 4-5 points) and known issues (4/7 stale) | PST-04 | P0 | 2h | Claude Code |
| 16 | Rewrite Dashboard hub — 20+ factual errors, score 5→8.5, add 4 missing pages, update all sections | PST-02 | P0 | 2h | Claude Code |
| 17 | Close all 5 Dashboard known issues (all already fixed in code) and update task statuses | PST-02 | P0 | 15min | Claude Code |
| 18 | Add `deletedAt: null` to accounting, commission, carrier-portal, customer-portal dashboard queries | PST-02 | P1 | 3-4h | Claude Code |
| 19 | Add unit tests for operations DashboardService (594 LOC, complex aggregation) | PST-02 | P1 | 3-4h | Claude Code |
| 20 | Rewrite TMS Core hub Section 8 (Data Model) — all 5 models 60-80% wrong, phantom TrackingEvent | PST-05 | P0 | 3-4h | Claude Code |
| 21 | Rewrite TMS Core hub Section 4 (API Endpoints) — 51 actual vs 65 claimed, wrong routing for Stops/CheckCalls | PST-05 | P0 | 2-3h | Claude Code |
| 22 | Update TMS Core known issues — close #9 (tests exist), update #5 (dispatch/tracking not thin), update #8 | PST-05 | P0 | 30min | Claude Code |
| 23 | Wire Orders delete handler (currently no-op toast) | PST-05 | P1 | 1-2h | Any |
| 24 | Fix Orders status change type assertions (`as any` on formData and status) | PST-05 | P1 | 1h | Any |
| 25 | Implement Load tender/accept/reject endpoints (carrier workflow) | PST-05 | P1 | 4-6h | Claude Code |
| 26 | Refactor use-checkcalls.ts — 11 fragile field name fallback chains | PST-05 | P1 | 1h | Any |
| 27 | Rewrite Carrier hub Sections 4/8/6 for Operations module (wrong API prefix, wrong models, 25 missing hooks) | PST-06 | P0 | 4h | Claude Code |
| 28 | Architectural decision: carrier dual-module consolidation strategy | PST-06 | P1 | 2h | Team |
| 29 | Update Carrier hub known issues — close 3 false issues, update screen scores | PST-06 | P0 | 30min | Claude Code |
| 30 | Evaluate FMCSA/compliance/insurance features for Operations carrier module | PST-06 | P1 | 1h | Team |
| 31 | Verify or implement insurance expiry cron job | PST-06 | P1 | 1-2h | Any |
| 32 | Rewrite Accounting hub Section 8 (Data Model) — add 8 missing models, fix 3 documented (Invoice 50% wrong, Settlement 40% wrong, Payment phantom → PaymentReceived + PaymentMade) | PST-07 | P0 | 3-4h | Claude Code |
| 33 | Rewrite Accounting hub Section 4 (API Endpoints) — 54 actual vs 17 documented, add 6 missing controllers | PST-07 | P0 | 2-3h | Claude Code |
| 34 | Close/reclassify QS-003 — dashboard endpoint EXISTS, reclassify to "Verify at runtime" under QS-008 | PST-07 | P0 | 15min | Claude Code |
| 35 | Fix 4 cross-tenant bugs in payments-received.service.ts (applyToInvoice, markBounced, processBatch) | PST-07 | P0 | 1-2h | Claude Code |
| 36 | Add RolesGuard to 6 accounting controllers (chart-of-accounts, settlements, payments-received/made, journal-entries, payments batch) | PST-07 | P0 | 1h | Claude Code |
| 37 | Update Accounting hub known issues — close 3 false issues (#1 dashboard, #4 aging, partially #5 soft delete) | PST-07 | P0 | 30min | Claude Code |
| 38 | Add deletedAt: null filters to all accounting services querying models with deletedAt field | PST-07 | P1 | 2h | Claude Code |
| 39 | Build Invoice Edit page (/accounting/invoices/[id]/edit) | PST-07 | P1 | 3h | Any |
| 40 | Add frontend accounting tests (0 tests for 5,244 LOC) | PST-07 | P2 | 4-6h | Any |
| 41 | Rewrite Commission hub Section 8 (Data Model) — fix model names, add 4 missing models (PlanTier, UserAssignment, AgentCommission, AgentPayout), fix tiers from JSON to separate table | PST-08 | P0 | 2h | Claude Code |
| 42 | Rewrite Commission hub Section 4 (API Endpoints) — 31 actual vs 9 documented, add Dashboard (9) and Agent (3) controllers | PST-08 | P0 | 1-2h | Claude Code |
| 43 | Update Commission hub Section 6 (Hooks) — 18 hook functions not 5 | PST-08 | P0 | 30min | Claude Code |
| 44 | Close Commission known issue #3 (security guards "Unknown") — FALSE, 100% guard coverage | PST-08 | P0 | 5min | Claude Code |
| 45 | Update Commission hub test count: 14→63, add backend test inventory (4 spec files, 42 tests) | PST-08 | P0 | 15min | Claude Code |
| 46 | Add `deletedAt: null` filters to CommissionEntry (7 methods), CommissionPayout (6 methods), AgentCommission (3 methods) | PST-08 | P1 | 2-3h | Claude Code |
| 47 | Wrap Commission `createPayout` and `processPayout` in Prisma `$transaction` blocks | PST-08 | P1 | 1h | Claude Code |
| 48 | Reclassify COMM-107 from "Verify" to "Wire auto-calculation trigger" — event listener needed | PST-08 | P1 | 3-4h | Claude Code |
| 49 | Add Agent commission system to Commission hub business rules + dependencies sections | PST-08 | P1 | 30min | Claude Code |
| 50 | Rewrite Load Board hub Section 8 (Data Model) — wrong model names (LoadBoardPosting→LoadPosting, LoadBoardOffer→LoadBid), add 3 missing models (LoadTender, LoadBoardAccount, LoadBoardProvider), fix all field lists | PST-09 | P0 | 2-3h | Claude Code |
| 51 | Rewrite Load Board hub Section 4 (API Endpoints) — 62 actual vs 7 documented, add 8 missing controllers (Tenders, Accounts, Analytics, Capacity, Leads, Rules, legacy Posting) | PST-09 | P0 | 2-3h | Claude Code |
| 52 | Close Load Board hub known issue #1 ("Backend endpoints are stubs") — FALSE, 62 real endpoints with 10 spec files | PST-09 | P0 | 5min | Claude Code |
| 53 | Update Load Board hub Section 1 (Status Box) — 6/10→8.0/10, "Partial stub"→"Built (62 endpoints)", hooks 1→3 files | PST-09 | P0 | 15min | Claude Code |
| 54 | Add RolesGuard to AccountsController (6 endpoints — ADMIN only) and RulesController (5 endpoints — ADMIN, DISPATCHER) | PST-09 | P0 | 1h | Claude Code |
| 55 | Add RolesGuard to LeadsController (7 endpoints) and PostingController (9 endpoints) | PST-09 | P1 | 1h | Claude Code |
| 56 | Architectural decision: consolidate dual Load Board API (LoadPosting vs LoadPost models, v1 vs new controllers) | PST-09 | P1 | 2h | Team |
| 57 | Deprecate `lib/hooks/tms/use-load-board.ts` legacy hook — redirect to `lib/hooks/load-board/` | PST-09 | P1 | 30min | Any |
| 58 | Update Load Board hub Section 12 — reclassify LB-106 "Build backend endpoints" as DONE | PST-09 | P0 | 15min | Claude Code |
| 59 | Verify `deletedAt: null` filtering in all 9 Load Board service files | PST-09 | P1 | 1-2h | Claude Code |
| 60 | **[CRITICAL]** Fix JWT secret inconsistency: module uses PORTAL_JWT_SECRET, guard uses CUSTOMER_PORTAL_JWT_SECRET — align to single env var | PST-13 | P0 | 30min | Claude Code |
| 61 | Rewrite Customer Portal hub Section 8 entirely — document all 8 actual Prisma models with real fields (Section 8 contradicts Section 2) | PST-13 | P0 | 2h | Claude Code |
| 62 | Fix Customer Portal hub Section 4 endpoint paths — replace 8 phantom paths, add 8 missing paths | PST-13 | P0 | 1-2h | Claude Code |
| 63 | Update Customer Portal known issues — mark #2 (no Prisma models) and #3 (untested) as FALSE, add JWT secret bug, update #7 (rate limiting partially exists) | PST-13 | P0 | 30min | Claude Code |
| 64 | Fix Customer Portal hub Section 10 status states — PENDING not INVITED, DECLINED not REJECTED, remove phantom DRAFT | PST-13 | P0 | 15min | Claude Code |
| 65 | Build public tracking endpoint `GET /portal/track/:code` — P0 scope per Tribunal verdict, currently phantom | PST-13 | P0 | 4h | Claude Code |
| 66 | Add rate limiting to remaining portal auth endpoints (register, forgot-password, reset-password) | PST-13 | P1 | 1h | Claude Code |
| 67 | Fix Documents hub Section 8 (Data Model) — add 2 missing models (DocumentShare, GeneratedDocument), fix DocumentFolder (~50%), fix DocumentTemplate (~30%), rename join table | PST-11 | P0 | 30min | Claude Code |
| 68 | Fix Documents hub Section 5 (Components) — remove 3 phantom components, add 4 real ones + LoadDocumentsTab + DocumentUpload | PST-11 | P0 | 15min | Claude Code |
| 69 | **[BUG]** Fix document upload architecture mismatch — frontend sends FormData, backend expects JSON DTO with filePath (no FileInterceptor) | PST-11 | P0 | 2-3h | Claude Code |
| 70 | Fix Documents hub known issue #9 — mark as STILL OPEN (data model still has 2 missing models) | PST-11 | P0 | 5min | Claude Code |
| 71 | Decision: migrate .bak sharing/generation features (2,243 LOC) to active module or delete | PST-11 | P1 | 30min decision | Team |
| 72 | Clean up orphaned DTOs in active documents module (CreateDocumentShareDto, GenerateDocumentDto) | PST-11 | P1 | 10min | Claude Code |
| 73 | Implement POD-to-invoice auto-creation trigger (currently only sends email, not invoice) | PST-11 | P1 | 2-3h | Claude Code |
| 74 | Fix entityType optional vs required contradiction (Prisma nullable, hub says required) | PST-11 | P1 | 15min | Claude Code |
| 75 | Implement version chain management in DocumentsService (create new version, update parent isLatestVersion) | PST-11 | P2 | 2h | Any |
| 76 | Add public access token generation logic (isPublic set on create but no token generated) | PST-11 | P2 | 1h | Any |
| 77 | Update Documents hub test count: 4 spec files not 7, ~77 test blocks | PST-11 | P2 | 5min | Claude Code |
| 78 | Fix Communication hub Section 8 (Data Model) — rename Notification→InAppNotification, add SmsConversation + SmsMessage models, fix CommunicationLog (15 missing fields), rewrite NotificationPreference (flat booleans + quiet hours) | PST-12 | P0 | 30min | Claude Code |
| 79 | Fix Communication hub known issues — remove "No tests" (68 exist), update "No notification bell" (exists as stub), update "5 triggers not wired" (frontend hooks exist), mark rate limiting as verified | PST-12 | P0 | 15min | Claude Code |
| 80 | Fix Communication hub Section 6 (Hooks) — resolve self-contradiction with Section 1, mark useSendEmail/useEmailLogs/useAutoEmail as Built | PST-12 | P0 | 10min | Claude Code |
| 81 | **[BUG]** Extract SMS webhook to separate controller or add @Public() decorator — currently non-functional behind JwtAuthGuard. Add Twilio request signature validation | PST-12 | P1 | 2h | Claude Code |
| 82 | Add SendGrid webhook endpoint for bounce/unsubscribe/delivery status events | PST-12 | P2 | 2-3h | Claude Code |
| 83 | Connect notification bell in app-header.tsx to backend unread-count API | PST-12 | P1 | 1h | Any |
| 84 | Fix InAppNotification inconsistency: delete() uses soft-delete, deleteExpired() uses hard-delete (deleteMany) | PST-12 | P2 | 15min | Claude Code |
| 85 | Wire deleteExpired() to cron job or scheduled task | PST-12 | P2 | 30min | Any |
| 86 | Connect admin notification-settings.tsx to backend preferences API | PST-12 | P2 | 1h | Any |
| 87 | **[CRITICAL]** Fix soft-delete filtering — add `deletedAt: null` to ALL findMany/findFirst in dashboard, compliance, documents, invoices, loads services (5/7 services missing) | PST-14 | P0 | 2-3h | Claude Code |
| 88 | **[CRITICAL]** Fix login tenant isolation — add tenantId to login query (currently email-only, cross-tenant auth bypass) | PST-14 | P0 | 30min | Claude Code |
| 89 | Add @Throttle to register, forgotPassword, resetPassword auth endpoints | PST-14 | P0 | 15min | Claude Code |
| 90 | Rewrite Carrier Portal hub Section 4 (Endpoints) — 48% of paths wrong, 9 phantom loads endpoints, 10 real endpoints undocumented | PST-14 | P0 | 2-3h | Claude Code |
| 91 | Document CarrierQuickPayRequest model + quick pay business rules (2% fee, $100 min, acceptTerms) in hub Section 8 | PST-14 | P0 | 30min | Claude Code |
| 92 | Reclassify CarrierSavedLoad from "Shared TMS Models" to portal-specific model in hub Section 8 | PST-14 | P0 | 10min | Claude Code |
| 93 | Add CarrierInvoiceSubmission model to hub Section 8 (portal-linked, not shared) | PST-14 | P0 | 15min | Claude Code |
| 94 | Update hub test counts: 10 files / 69 tests / 911 LOC / all real (not "7 stubs + 1 e2e 80 LOC") | PST-14 | P0 | 10min | Claude Code |
| 95 | Fix hub known issue #8 ("JWT flow not tested e2e") — FALSE, 179 LOC e2e exists | PST-14 | P0 | 5min | Claude Code |
| 96 | Fix hub known issue #12 ("No rate limiting") — partially false, login HAS @Throttle | PST-14 | P0 | 5min | Claude Code |
| 97 | Add role-based @Roles() decorator guards for admin-only endpoints (inviteUser, updateUser, deactivateUser) | PST-14 | P1 | 1h | Claude Code |
| 98 | Add document download endpoint (hub documents GET /documents/:id/download but doesn't exist) | PST-14 | P1 | 1h | Any |
| 99 | Decision: add check call endpoints to portal (hub documents from spec, code doesn't have them) | PST-14 | P1 | 30min decision | Team |
