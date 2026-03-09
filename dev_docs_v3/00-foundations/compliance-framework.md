# Compliance Framework

> Regulatory and security compliance requirements for a multi-tenant 3PL platform
> **Created:** 2026-03-09 | **Sources:** PST-25 (Safety), PST-26 (EDI), PST-07 (Accounting), PST-30 (Audit), cross-cutting addendum

## FMCSA Compliance

| Requirement | Status | Implementation | Notes |
| --- | --- | --- | --- |
| MC Authority Verification | Stubbed | Safety service (`/safety/fmcsa/lookup`, 4 endpoints) + Carrier module (`/carriers/fmcsa/lookup`) | Both return mock data. `fmcsa-api.client.ts` never calls real SAFER Web API (PST-25, SAFE-017) |
| Insurance Minimums | Documented | Domain rules 47-48. Safety insurance service enforces per-type minimums (AUTO_LIABILITY $1M, CARGO $100K) | Enforced in Safety module only. Operations carrier module has no validation (PST-06) |
| CSA Score Monitoring | Stubbed | Safety CSA service (`/safety/csa/:carrierId`, 3 endpoints). 7 BASICs tracked with thresholds. | `seededPercentile()` returns fake data (PST-25, SAFE-018). Auto-alert on threshold breach. |
| Hours of Service (HOS) | Not Started | No module, no model, no endpoints | Future: ELD integration required for real-time HOS tracking |
| Broker Bond ($75K) | N/A for MVP | Business requirement, not software | Broker must maintain $75K surety bond per 49 CFR 387.307. Not tracked in system. |
| Driver Qualification Files | Built (backend) | Safety DQF service (`/safety/dqf`, 7 endpoints). 8 document types. Compliance check endpoint. | No frontend UI (PST-25, SAFE-006). Backend fully tested (63 tests). |
| Operating Authority Types | Built (backend) | `FmcsaCarrierRecord` model tracks commonAuthority, contractAuthority, brokerAuthority | Part of Safety module. Stubbed data source. |

## DOT Compliance

| Requirement | Status | Notes |
| --- | --- | --- |
| Bill of Lading (BOL) | Not Built | QS-013 task created. No backend endpoint, no frontend page. Table-stakes feature promoted to P0 per TRIBUNAL-10. |
| Rate Confirmation | Partial | Backend: `GET /loads/:id/rate-confirmation` EXISTS. Frontend: `/operations/loads/[id]/rate-con` (9/10). PDF generation partially built via `pdf.service.ts` (PDFKit). QS-012 task for full end-to-end. |
| Weight Verification | Not Started | Required for LTL shipments. `weightLbs` field exists on Order and Stop models but no verification workflow. |
| Hazmat Documentation | Partial | Order has `isHazmat` Boolean + `hazmatClass` String. Load form has conditional hazmat fields. No hazmat-specific document generation (placards, shipping papers). |
| DOT Inspection Records | Built (backend) | `SafetyInspection` model with violation tracking, OOS status, BASICs impact. No frontend (PST-25, SAFE-005). |
| Driver Medical Cards | Built (backend) | DQF `MEDICAL_CARD` document type with expiry tracking. No frontend (PST-25). |

## Financial Compliance

| Requirement | Status | Notes |
| --- | --- | --- |
| SOC2 Type II | Not Started | In scope: tenant data isolation, access controls, audit logging. Tenant isolation has gaps (cross-cutting #4, #34, #36). Audit logging exists via AuditLog service (PST-30). |
| PCI-DSS | N/A for MVP | No direct payment card handling. Invoicing only — no payment gateway integration. If added, use Stripe/payment processor to stay out of PCI scope. |
| Revenue Recognition | Partial | Invoice + Settlement models exist with full lifecycle (DRAFT->SENT->PAID). No GAAP compliance verification. No accrual vs cash basis distinction. Commission calculation exists but auto-trigger NOT WIRED (PST-08). |
| Audit Trail | Implemented | AuditLog service with SHA256 hash chain (PST-30). `SafetyAuditTrail` for safety-specific events. `StatusHistory` for order/load/stop status changes. `createdById`/`updatedById` on all models. **Concern:** AuditLog has `deletedAt` field despite immutability requirement (cross-cutting #3). |
| Tax Compliance (1099s) | Not Started | Carriers paid > $600/year need 1099-NEC. Settlement data exists but no 1099 generation or reporting. |
| Financial Data Integrity | Partial | All monetary values use `Decimal(10,2)` (not floating point). Integer cents used for some fields (e.g., `cargoInsuranceLimitCents`). Double-entry accounting structure exists in Accounting module (54 endpoints, PST-07). |

## Data Privacy

| Requirement | Status | Notes |
| --- | --- | --- |
| Tenant Data Isolation | Partial | `tenantId` on all 260 Prisma models. CRUD queries mostly filter by tenantId. **GAPS:** Update/delete mutations skip tenantId in Auth, CRM, Sales, Accounting (cross-cutting #4). Search ES queries skip tenantId (PST-22). Cache operations skip tenantId on 8/20 endpoints (PST-32, cross-cutting #36). Operations LoadHistory `getByCarrier()` + `getSimilarLoads()` skip tenantId (cross-cutting #34). |
| Data Retention Policy | Not Defined | No retention periods set for any entity type. Financial records should be 7 years per IRS requirements. Soft-deleted records are never hard-purged. |
| Right to Deletion | Not Implemented | Soft delete exists but no tenant data purge workflow. GDPR Article 17 requires ability to delete personal data on request. No mechanism to purge all data for a specific tenant or carrier/driver. |
| Encryption at Rest | DB-level | PostgreSQL encryption (if enabled on hosting provider). No application-level field encryption. **Violations:** `ftpPassword` plaintext in EdiTradingPartner (PST-26, EDI-015). Factoring `apiKey` plaintext (PST-18). |
| Encryption in Transit | Partial | HTTPS assumed in production but not enforced in dev. TLS termination not documented in deployment runbook. CORS configured for localhost:3000 and localhost:3002 only. |
| Password Security | Implemented | bcrypt with cost factor 12 for user passwords. JWT tokens with configurable secret. **Concern:** JWT secret inconsistency reported (PST-13). |

## Security Findings Summary

| Finding | Severity | Source | Status |
| --- | --- | --- | --- |
| localStorage token storage (XSS risk) | P0 | `apps/web/lib/api/client.ts` lines 59, 77 | Open — P0-001 |
| Cross-tenant mutations (update/delete skip tenantId) | P0 | Cross-cutting #4 (Auth, CRM, Sales, Accounting confirmed) | Open — needs QS-014 (Prisma Client Extension) |
| Cache cross-tenant operations (8/20 endpoints) | P0 | PST-32, cross-cutting #36 | Open |
| ES cross-tenant search | P0 | PST-22 | Open |
| RolesGuard missing on financial controllers | P1 | Accounting 6/10 controllers (PST-07), Safety 5/9 (PST-25), EDI 4/8 (PST-26) | Open |
| ftpPassword plaintext in EDI | P2 | PST-26, EDI-015 | Open |
| Factoring apiKey plaintext | P2 | PST-18 | Open |
| JWT secret inconsistency | P1 | PST-13 | Open |
| Webhook auth guard inheritance bug | P1 | Communication (Twilio), CRM (HubSpot) — cross-cutting #30 | Open |

## Compliance Roadmap

| Priority | Requirement | Effort | Sprint | Dependencies |
| --- | --- | --- | --- | --- |
| P0 | Fix tenant isolation gaps (mutations, search, cache) | 40-60h | S4 | QS-014 (Prisma Client Extension) |
| P0 | Rate Con PDF generation (DOT requirement) | 10-15h | S5 | QS-012 |
| P0 | BOL PDF generation (DOT requirement) | 10-15h | S5 | QS-013, depends on QS-012 shared PDF infra |
| P0 | Fix RolesGuard gaps (Accounting, Safety, EDI) | 4-8h | S4 | SAFE-015, SAFE-020, EDI-013 |
| P0 | Encrypt sensitive fields (ftpPassword, apiKey) | 2-4h | S4 | EDI-015, PST-18 fix |
| P1 | SOC2 preparation (access controls, audit logging review) | 80-120h | S7-S8 | Tenant isolation fixed first |
| P1 | Data retention policy definition | 4-8h | S5 | Business decision on retention periods |
| P2 | FMCSA real API integration | 40-60h | S6+ | SAFE-017, SAFE-018 |
| P2 | Carrier packet generation (COI + W-9 + agreement) | 8-12h | S6 | Document upload architecture fix (PST-11) |
| P3 | HOS/ELD integration | 80-120h | Future | External ELD provider partnership |
| P3 | 1099 generation | 20-30h | Future | Tax year reporting cycle |
| P3 | GDPR right-to-deletion workflow | 20-30h | Future | Data retention policy defined first |

## Cross-References

- Domain rules 46-49: Carrier qualification enforcement
- `dev_docs_v3/00-foundations/carrier-onboarding-workflow.md`: Step-by-step onboarding process
- `dev_docs_v3/05-audit/security-findings.md`: Full security findings with severity framework
- `dev_docs_v3/05-audit/tribunal/per-service/_CROSS-CUTTING-ADDENDUM.md`: 37 cross-cutting findings
- `dev_docs_v3/00-foundations/deployment-runbook.md`: Production deployment security steps
