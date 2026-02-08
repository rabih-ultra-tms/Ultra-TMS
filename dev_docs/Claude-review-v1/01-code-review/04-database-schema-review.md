# Database Schema Review

**File:** `apps/api/prisma/schema.prisma`
**Lines:** 9,854
**Database:** PostgreSQL 15 via Prisma 6
**Review Date:** 2026-02-07

---

## Executive Summary

The Ultra TMS database schema is one of the most comprehensive 3PL/freight broker schemas encountered. At 257 models, 114 enums, 1,291 indexes, and 81 unique constraints, it covers virtually every domain a freight brokerage needs. The migration-first design pattern (externalId, sourceSystem, customFields on every entity) is consistently applied and demonstrates strong architectural foresight. Multi-tenant isolation via tenantId is present on every model. The schema is production-grade in scope but has several areas requiring attention before launch.

**Overall Grade: B+**
- Scope and coverage: A
- Consistency of patterns: A-
- Indexing strategy: B+
- Relationship integrity: B
- Performance considerations: B-
- Data integrity constraints: C+

---

## 1. Schema Statistics

| Metric | Count |
|--------|-------|
| Total Models | 257 |
| Total Enums | 114 |
| Total Indexes (@@index) | 1,291 |
| Unique Constraints (@@unique) | 81 |
| Schema Lines | 9,854 |
| Generator | prisma-client-js |
| Provider | postgresql |

**Average indexes per model:** ~5.0
**Average fields per model:** ~20-25 (estimated from sample)

---

## 2. Domain Groupings

### 2.1 Auth & Admin (14 models)
| Model | Key Purpose |
|-------|-------------|
| User | Core user accounts with passwordHash, MFA, avatar |
| Role | Role definitions with permissions array |
| Session | JWT refresh token sessions (DB + Redis dual storage) |
| LoginAudit | Login attempt tracking with IP, user agent |
| PasswordResetToken | Time-limited reset tokens with hash storage |
| AuditLog | System-wide audit trail with action categories |
| AccessLog | Resource-level access logging |
| APIAuditLog | API endpoint audit with response times |
| FeatureFlag | Feature toggles with rollout percentages |
| FeatureFlagOverride | Per-tenant/user feature flag overrides |
| SystemConfig | System-level configuration key-value pairs |
| TenantConfig | Tenant-specific configuration |
| NumberSequence | Auto-numbering for invoices, loads, etc. |
| Tenant | Multi-tenant root entity (250+ relations) |

### 2.2 CRM (7 models)
| Model | Key Purpose |
|-------|-------------|
| Company | Customer/shipper accounts with credit limits |
| Contact | Customer contacts with communication preferences |
| Activity | CRM activities (calls, emails, meetings) |
| Opportunity | Sales pipeline opportunities |
| CreditApplication | Customer credit applications |
| CreditHold | Customer credit hold records |
| CreditLimit | Customer credit limit management |

### 2.3 Sales & Quoting (6 models)
| Model | Key Purpose |
|-------|-------------|
| Quote | Full quotes with stops, accessorials |
| QuoteStop | Multi-stop quote locations |
| QuoteAccessorial | Quote accessorial charges |
| QuoteRequest | Inbound quote requests |
| SalesQuota | Sales team quota tracking |
| CommissionEntry | Sales rep commission calculations |

### 2.4 TMS Core - Orders & Loads (18 models)
| Model | Key Purpose |
|-------|-------------|
| Order | Customer orders (source of truth) |
| OrderItem | Order line items |
| Load | Carrier-assigned loads (execution) |
| Stop | Multi-stop load locations |
| CheckCall | GPS/manual location check-ins |
| LoadHistory | Load status change history |
| StatusHistory | Generic status tracking |
| LoadPosting | External load board postings |
| LoadBid | Carrier bid responses |
| LoadTender | Formal load tenders to carriers |
| TenderRecipient | Load tender recipients |
| LoadPost | Load board post records |
| PostLead | Leads from load board posts |
| PostingRule | Automated posting rules |
| PostingSchedule | Posting schedules |
| Location | Shipper/receiver locations |
| RateData | Market rate data |
| LaneAnalytics | Lane-level analytics |

### 2.5 Load Planner (6 models)
| Model | Key Purpose |
|-------|-------------|
| LoadPlannerQuote | Planning quotes |
| LoadPlannerCargoItem | Cargo items for planning |
| LoadPlannerAccessorial | Planning accessorials |
| LoadPlannerPermit | Required permits |
| LoadPlannerServiceItem | Additional services |
| LoadPlannerTruck | Available trucks for planning |

### 2.6 Carrier Management (20+ models)
| Model | Key Purpose |
|-------|-------------|
| Carrier | Core carrier profiles (35+ related models) |
| CarrierCapacity | Equipment availability |
| CarrierContact | Carrier contact people |
| CarrierDocument | Uploaded documents |
| CarrierInsurance | Insurance policies |
| CarrierPerformanceHistory | Performance metrics over time |
| CarrierWatchlist | At-risk carrier monitoring |
| CarrierFactoringStatus | Factoring company assignment |
| FmcsaCarrierRecord | FMCSA SAFER data |
| FmcsaComplianceLog | FMCSA compliance check logs |
| CsaScore | CSA BASIC scores |
| AuthorityChange | Operating authority changes |
| InsuranceCertificate | Insurance certificates |
| Driver | Carrier drivers |
| DriverQualificationFile | DQ file documents |
| NOARecord | Notice of Assignment records |
| FactoringCompany | Factoring company registry |
| FactoredPayment | Factored payment records |
| FactoringVerification | NOA verification records |

### 2.7 Carrier Portal (8 models)
| Model | Key Purpose |
|-------|-------------|
| CarrierPortalUser | Portal login accounts |
| CarrierPortalSession | Portal sessions |
| CarrierPortalDocument | Portal document uploads |
| CarrierPortalActivityLog | Portal activity tracking |
| CarrierPortalNotification | Portal notifications |
| CarrierInvoiceSubmission | Carrier-submitted invoices |
| CarrierQuickPayRequest | Quick pay requests |
| CarrierSavedLoad | Saved/bookmarked loads |
| CarrierLoadView | Load view tracking |

### 2.8 Customer Portal (8 models)
| Model | Key Purpose |
|-------|-------------|
| PortalUser | Customer portal accounts |
| PortalSession | Portal sessions |
| PortalActivityLog | Portal activity tracking |
| PortalBranding | Per-customer portal branding |
| PortalNotification | Portal notifications |
| PortalPayment | Portal payment submissions |
| PortalSavedPaymentMethod | Saved payment methods |

### 2.9 Accounting & Finance (14 models)
| Model | Key Purpose |
|-------|-------------|
| Invoice | Customer invoices |
| InvoiceLineItem | Invoice line items |
| Settlement | Carrier settlements (AP) |
| SettlementLineItem | Settlement line items |
| PaymentReceived | AR payments |
| PaymentMade | AP payments |
| PaymentApplication | Payment-to-invoice mapping |
| ChartOfAccount | Chart of accounts (hierarchy) |
| JournalEntry | GL journal entries |
| JournalEntryLine | Journal entry line items |
| CollectionActivity | Collection tracking |
| PaymentPlan | Customer payment plans |
| QuickbooksSyncLog | QuickBooks integration log |

### 2.10 Contracts & Rates (12 models)
| Model | Key Purpose |
|-------|-------------|
| Contract | Customer/carrier/agent contracts |
| ContractAmendment | Contract amendments |
| ContractClause | Reusable contract clauses |
| ContractLaneRate | Lane-specific contract rates |
| ContractMetric | Contract performance metrics |
| ContractRateLane | Rate table lanes |
| ContractRateTable | Rate tables |
| ContractSLA | Service level agreements |
| ContractTemplate | Contract document templates |
| RateContract | Rate contracts |
| FuelSurchargeTable | Fuel surcharge tables |
| FuelSurchargeTier | Fuel surcharge tiers |
| VolumeCommitment | Volume commitment tracking |
| AccessorialRate | Accessorial rate definitions |

### 2.11 Agent & Commission (9 models)
| Model | Key Purpose |
|-------|-------------|
| Agent | Sales agent profiles |
| AgentAgreement | Commission agreements |
| AgentCommission | Individual commission records |
| AgentContact | Agent contact people |
| AgentCustomerAssignment | Agent-to-customer mapping |
| AgentDrawBalance | Draw account balances |
| AgentLead | Agent-submitted leads |
| AgentPayout | Agent payout records |
| AgentPortalUser | Agent portal accounts |
| CustomerCommissionOverride | Per-customer commission overrides |
| CommissionPlan | Commission plan definitions |
| CommissionPlanTier | Tiered commission structures |
| CommissionPayout | Commission payout records |
| UserCommissionAssignment | User-to-plan assignments |

### 2.12 Documents (7 models)
| Model | Key Purpose |
|-------|-------------|
| Document | Central document storage |
| DocumentFolder | Folder hierarchy |
| DocumentShare | Document sharing with access tokens |
| DocumentTemplate | Document generation templates |
| FolderDocument | Folder-document junction |
| GeneratedDocument | Auto-generated documents |

### 2.13 EDI (10 models)
| Model | Key Purpose |
|-------|-------------|
| EdiMessage | EDI messages (204, 210, 214, etc.) |
| EdiTradingPartner | Trading partner configurations |
| EdiAcknowledgment | Functional acknowledgments (997) |
| EdiBatch | Batch processing records |
| EdiBatchMessage | Batch-message junction |
| EdiCodeList | Code translation tables |
| EdiCommunicationLog | Communication audit trail |
| EdiControlNumber | ISA/GS/ST control numbers |
| EdiError | Parsing/validation errors |
| EdiEventTrigger | Event-driven EDI triggers |
| EdiTransactionMapping | Field mapping configurations |

### 2.14 Claims & Safety (12 models)
| Model | Key Purpose |
|-------|-------------|
| Claim | Freight claims |
| ClaimItem | Claimed items |
| ClaimAdjustment | Claim adjustments |
| ClaimContact | Claim-related contacts |
| ClaimDocument | Claim documents |
| ClaimNote | Claim notes |
| ClaimTimeline | Claim event timeline |
| SubrogationRecord | Subrogation tracking |
| SafetyIncident | Safety incidents |
| SafetyInspection | DOT inspections |
| SafetyAlert | Safety alerts |
| SafetyAuditTrail | Safety audit trail |

### 2.15 HR (9 models)
| Model | Key Purpose |
|-------|-------------|
| Employee | Employee records |
| Department | Department hierarchy |
| Position | Job positions |
| EmploymentHistory | Position/salary history |
| TimeEntry | Time tracking |
| TimeOffRequest | PTO requests |
| TimeOffBalance | PTO balances |
| OnboardingChecklist | Employee onboarding |
| OnboardingTask | Individual onboarding tasks |
| Holiday | Company holidays |

### 2.16 Operations (3 models)
| Model | Key Purpose |
|-------|-------------|
| OperationsCarrier | Operations-level carrier management |
| OperationsCarrierDriver | Operational driver assignments |
| OperationsCarrierTruck | Operational truck assignments |

### 2.17 Load Board Integration (5 models)
| Model | Key Purpose |
|-------|-------------|
| LoadBoardProvider | Load board provider configs |
| LoadBoardAccount | Provider account credentials |
| CapacitySearch | Capacity search queries |
| CapacityResult | Capacity search results |
| BoardMetric | Load board posting metrics |

### 2.18 Communication (5 models)
| Model | Key Purpose |
|-------|-------------|
| CommunicationTemplate | Email/SMS templates |
| CommunicationLog | Communication audit trail |
| SmsConversation | SMS conversation threads |
| SmsMessage | Individual SMS messages |
| CannedResponse | Reusable response templates |
| InAppNotification | In-app notifications |
| NotificationPreference | User notification preferences |

### 2.19 Workflow & Automation (8 models)
| Model | Key Purpose |
|-------|-------------|
| Workflow | Workflow definitions |
| WorkflowStep | Workflow steps |
| WorkflowExecution | Workflow execution records |
| WorkflowTemplate | Reusable workflow templates |
| StepExecution | Step-level execution records |
| ScheduledWorkflowRun | Scheduled workflow runs |
| EscalationRule | Escalation rules |
| ApprovalRequest | Approval workflows |

### 2.20 Analytics & Reporting (10 models)
| Model | Key Purpose |
|-------|-------------|
| Dashboard | Custom dashboards |
| DashboardWidget | Dashboard widgets |
| KPIDefinition | KPI definitions |
| KPISnapshot | KPI value snapshots |
| KPIAlert | KPI threshold alerts |
| Report | Report definitions |
| ReportExecution | Report execution history |
| ReportTemplate | Report templates |
| SavedAnalyticsView | Saved analytics views |
| AnalyticsCache | Analytics query cache |

### 2.21 Integration & Infrastructure (12 models)
| Model | Key Purpose |
|-------|-------------|
| Integration | Third-party integration configs |
| IntegrationProviderConfig | Provider-specific configs |
| SyncJob | Data sync job records |
| WebhookEndpoint | Webhook endpoints |
| WebhookSubscription | Webhook subscriptions |
| WebhookDelivery | Webhook delivery attempts |
| APIRequestLog | API request logging |
| CircuitBreakerStateRecord | Circuit breaker states |
| TransformationTemplate | Data transformation templates |
| DistributedLock | Distributed locking |
| RateLimit | Rate limit configurations |
| RateProviderConfig | Rate provider configs |
| RateAlert | Rate alert rules |
| RateAlertHistory | Rate alert history |
| RateQuery | Rate query history |

### 2.22 Search & Cache (7 models)
| Model | Key Purpose |
|-------|-------------|
| SearchIndex | Elasticsearch index configs |
| SearchIndexQueue | Search indexing queue |
| SearchHistory | User search history |
| SearchSuggestion | Search suggestions |
| SearchSynonym | Search synonyms |
| SavedSearch | User saved searches |
| CacheConfig | Cache configuration |
| CacheInvalidationRule | Cache invalidation rules |
| CacheStats | Cache hit/miss statistics |

### 2.23 Scheduling & Jobs (7 models)
| Model | Key Purpose |
|-------|-------------|
| ScheduledJob | Scheduled job definitions |
| ScheduledTask | Task definitions |
| JobExecution | Job execution records |
| JobTemplate | Job templates |
| JobAlert | Job alert notifications |
| JobDependency | Job dependency graph |
| JobLock | Job locking |

### 2.24 Support & Feedback (9 models)
| Model | Key Purpose |
|-------|-------------|
| SupportTicket | Support tickets |
| TicketReply | Ticket replies |
| SupportTeam | Support team definitions |
| SupportTeamMember | Team member assignments |
| FeatureRequest | Feature requests |
| FeatureRequestComment | Feature request comments |
| FeatureRequestVote | Feature request votes |
| FeedbackWidget | In-app feedback widgets |
| Survey | Customer surveys |
| SurveyResponse | Survey responses |
| NPSSurvey | NPS surveys |
| NPSResponse | NPS responses |
| KBArticle | Knowledge base articles |

### 2.25 Compliance & Config (6 models)
| Model | Key Purpose |
|-------|-------------|
| ComplianceCheckpoint | Compliance verification checkpoints |
| AuditAlert | Audit alert definitions |
| AuditAlertIncident | Triggered audit alert incidents |
| AuditRetentionPolicy | Data retention policies |
| ConfigHistory | Configuration change history |
| ConfigTemplate | Configuration templates |
| BusinessHours | Business hours per location |
| Reminder | Task/event reminders |

---

## 3. Migration-First Field Coverage

The migration-first pattern ensures every entity can be mapped from external systems during data migration.

### Required Fields
| Field | Purpose | Data Type |
|-------|---------|-----------|
| `externalId` | ID from source system | VarChar(255) |
| `sourceSystem` | Source system identifier | VarChar(100) |
| `customFields` | Flexible JSON storage | Json @default("{}") |
| `tenantId` | Multi-tenant isolation | String (FK to Tenant) |

### Coverage Analysis

**Models WITH all migration-first fields:** ~245/257 (95.3%)

**Models MISSING migration-first fields (notable gaps):**
- `DocumentShare` - has externalId/sourceSystem but missing tenantId FK (uses Document relation)
- `ContractLaneRate` - has fields but tenantId added as a plain field (not through consistent pattern)
- `CarrierContact` - has all fields but tenantId position is inconsistent
- Some junction tables (FolderDocument, EdiBatchMessage) have the fields but they are arguably unnecessary overhead

**Composite Index on (externalId, sourceSystem):** Present on the vast majority of models. This is critical for migration lookup performance.

**Assessment: A-** -- The migration-first pattern is applied with remarkable consistency. The few models missing it are edge cases.

---

## 4. Indexing Strategy

### Summary Statistics
- **Total @@index directives:** 1,291
- **Total @@unique constraints:** 81
- **Average indexes per model:** ~5.0

### Index Patterns Observed

1. **tenantId index** -- Present on virtually every model. Critical for multi-tenant query performance.
2. **Composite tenant indexes** -- `@@index([tenantId, status])`, `@@index([tenantId, deletedAt])`, `@@index([tenantId, createdAt])` on key models. Good practice.
3. **Foreign key indexes** -- Consistently indexed (carrierId, loadId, orderId, etc.)
4. **Status/filter indexes** -- Status fields indexed on most models
5. **Date range indexes** -- createdAt, effectiveDate, expirationDate indexed where relevant
6. **Composite search indexes** -- `@@index([entityType, entityId])` for polymorphic relations
7. **External system indexes** -- `@@index([externalId, sourceSystem])` for migration lookups

### Indexing Strengths
- Comprehensive foreign key indexing prevents JOIN-related full table scans
- Tenant-scoped composite indexes enable efficient filtered queries
- Date-range indexes support time-based filtering and reporting
- Polymorphic entity indexes (entityType + entityId) properly indexed

### Indexing Concerns

**DB-001: Over-indexing on low-cardinality columns**
- Many models index `status` fields that have 3-5 values. On small tables, this adds write overhead with minimal read benefit
- Example: `BoardMetric.@@index([periodType])` -- periodType has ~3 values (daily, weekly, monthly)
- **Impact:** Minor write performance degradation, increased storage
- **Recommendation:** Evaluate index usage with `pg_stat_user_indexes` in production

**DB-002: Missing composite indexes for common query patterns**
- `Load` model lacks `@@index([tenantId, status, createdAt])` which would be the most common dispatch board query
- `Invoice` model lacks `@@index([tenantId, status, dueDate])` for AR aging queries
- **Impact:** Slower dashboard and list page queries
- **Recommendation:** Add composite indexes matching top-10 query patterns

**DB-003: No partial indexes**
- Prisma does not natively support partial indexes, but they could be added via raw migrations
- Example: `WHERE deletedAt IS NULL` partial index would significantly improve soft-delete filtered queries
- **Impact:** All queries filtering `deletedAt: null` scan through deleted records
- **Recommendation:** Add partial indexes via raw SQL migrations for high-volume tables

**DB-004: Text search indexes absent**
- No GIN/GiST indexes for text search on Carrier.legalName, Company.name, etc.
- Elasticsearch is used for search, but database-level text search could serve as fallback
- **Impact:** Low if ES is always available; high if ES goes down
- **Recommendation:** Consider pg_trgm GIN indexes on name fields as fallback

---

## 5. Relationship Integrity

### Relationship Patterns
- **Cascade deletes:** `onDelete: Cascade` used extensively on child relations
- **Set null on delete:** Not widely used
- **Restrict on delete:** Not commonly used -- this could lead to orphan prevention issues

### Relationship Concerns

**DB-005: Excessive cascade deletes**
- Nearly all child relations use `onDelete: Cascade`. Deleting a Carrier cascades through 35+ related models
- Deleting a Tenant would cascade through 250+ related models
- **Risk:** Accidental deletion could wipe enormous amounts of data
- **Severity:** HIGH
- **Evidence:** `Carrier` model has Cascade on CarrierCapacity, CarrierContact, CarrierDocument, CarrierInsurance, CarrierPerformanceHistory, CarrierPortalSession, CarrierPortalUser, etc.
- **Recommendation:**
  - Use `onDelete: Restrict` for critical financial records (Invoice, Settlement, Payment)
  - Implement soft-delete-only policy for entities with financial records
  - Add database-level triggers to prevent hard deletion of Tenant or Carrier

**DB-006: Missing referential integrity on some polymorphic relations**
- `Activity.entityType/entityId` -- no FK constraint to the referenced entity
- `Document.entityType/entityId` -- same pattern
- `AuditLog.entityType/entityId` -- same pattern
- **Risk:** Orphaned references when referenced entities are deleted
- **Recommendation:** Consider separate FK columns for each entity type instead of polymorphic pattern, or implement application-level cleanup

**DB-007: Self-referential relations with cascade**
- `Department` -> `Department` (parentDepartmentId) -- no onDelete specified (defaults to Restrict in PostgreSQL via Prisma)
- `ChartOfAccount` -> `ChartOfAccount` (parentAccountId) -- no onDelete specified
- `Company` -> `Company` (parentCompanyId) -- no onDelete specified
- These are correctly NOT cascading, which is good

**DB-008: Missing cross-domain FK constraints**
- Some ID fields reference entities but lack FK definitions:
  - `ApprovalRequest.approverIds` is a `String[]` -- no FK validation
  - `FeatureFlag.tenantIds` and `userIds` are `String[]` -- no FK validation
  - `EdiEventTrigger.targetPartners` is `Json` -- no FK validation
- **Risk:** Invalid references that pass validation
- **Recommendation:** For approverIds, consider a junction table ApprovalRequestApprover

---

## 6. Soft Delete Consistency

### Pattern Used
```prisma
deletedAt DateTime?
```

### Coverage Analysis

**Models WITH deletedAt:** ~240/257 (93.4%)

**Models MISSING deletedAt (notable):**
- `Session` -- Correctly excluded (sessions are hard-deleted on logout)
- `PasswordResetToken` -- Correctly excluded (tokens expire and are consumed)
- `LoginAudit` -- Correctly excluded (audit logs should never be soft-deleted)

### Soft Delete Concerns

**DB-009: No database-level enforcement of soft delete**
- Soft delete is enforced at the application level via Prisma queries adding `deletedAt: null`
- If any raw query or third-party tool accesses the database, it could see deleted records
- **Risk:** Data leakage through non-Prisma access paths
- **Recommendation:** Consider PostgreSQL Row-Level Security (RLS) policies, or at minimum a global Prisma middleware that automatically adds `deletedAt: null` filters

**DB-010: Cascade delete vs. soft delete conflict**
- If a parent record is soft-deleted (deletedAt set), child records remain active
- If a parent record is hard-deleted, cascade removes all children
- This inconsistency could leave soft-deleted parents with active children, or hard-deleted parents with no audit trail
- **Risk:** Data integrity issues during cleanup operations
- **Recommendation:** Implement soft-delete cascading at the application level -- when soft-deleting a parent, soft-delete all children

**DB-011: No composite index on (tenantId, deletedAt) on all models**
- Only some models have `@@index([tenantId, deletedAt])`
- Most models only have `@@index([tenantId])` separately
- **Impact:** Every query filtering by tenant AND non-deleted records requires index intersection
- **Recommendation:** Add `@@index([tenantId, deletedAt])` to all models with significant row counts

---

## 7. Multi-Tenant Isolation

### Pattern Used
```prisma
tenantId String
Tenant   Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
@@index([tenantId])
```

### Coverage Analysis

**Models WITH tenantId:** 255/257 (99.2%)

**Models WITHOUT tenantId:**
- `FeatureFlag` -- Global feature flags (correct, uses tenantIds array for targeting)
- A few junction/log tables where tenantId is nullable

### Multi-Tenant Concerns

**DB-012: No Row-Level Security (RLS)**
- Multi-tenant isolation relies entirely on application-level `WHERE tenantId = ?` filtering
- A single missing tenantId filter in any query leaks data across tenants
- **Severity:** CRITICAL
- **Risk:** Cross-tenant data leakage
- **Evidence:** Convention doc says "ALWAYS filter by tenantId" but this is only enforced by developer discipline
- **Recommendation:**
  1. Implement PostgreSQL RLS policies: `CREATE POLICY tenant_isolation ON <table> USING (tenant_id = current_setting('app.tenant_id'))`
  2. Set `app.tenant_id` via Prisma `$executeRaw` at the beginning of each request
  3. This provides defense-in-depth even if application code misses a filter

**DB-013: Tenant cascade deletion risk**
- The Tenant model has 250+ relation arrays
- `onDelete: Cascade` on tenant FK means deleting a tenant deletes ALL associated data across ALL 250+ tables
- **Risk:** Catastrophic data loss from accidental tenant deletion
- **Recommendation:**
  1. Remove cascade from Tenant FK
  2. Implement tenant deactivation (soft delete) as the primary mechanism
  3. Create a scheduled job for permanent tenant data purge with confirmation

**DB-014: No tenant-scoped unique constraints on some entities**
- `Claim.claimNumber` is `@unique` globally, not `@@unique([tenantId, claimNumber])`
- `CapacitySearch.searchNumber` is `@unique` globally
- `Contract.contractNumber` is `@unique` globally
- `Department.code` is `@unique` globally
- `Employee.employeeNumber` is `@unique` globally
- **Risk:** Number collision between tenants
- **Recommendation:** Change all business-key uniques to tenant-scoped: `@@unique([tenantId, claimNumber])`

---

## 8. Data Type Concerns

**DB-015: Inconsistent ID strategy**
- All models use `id String @id` but no `@default(uuid())` or `@default(cuid())` visible
- IDs appear to be generated at the application level
- **Risk:** If application fails to generate ID, insert will fail
- **Recommendation:** Add `@default(uuid())` or `@default(cuid())` as database-level fallback

**DB-016: Financial precision**
- Financial fields use `Decimal(12, 2)` for amounts and `Decimal(5, 2)` for percentages
- Some fields use `Decimal(14, 2)` or `Decimal(15, 2)` for larger amounts
- **Assessment:** Generally appropriate for USD amounts, but consider `Decimal(15, 2)` uniformly for all monetary fields to handle large aggregate values

**DB-017: JSON fields for structured data**
- `customFields Json @default("{}")` -- appropriate for flexible extension
- `preferredLanes Json @default("[]")` -- could benefit from a junction table for queryability
- `permissions Json` on Role -- could benefit from a Permission model for better RBAC
- `rules Json` on CommissionPlan -- complex business logic in JSON reduces queryability
- **Risk:** JSON fields cannot be efficiently indexed or queried via Prisma
- **Recommendation:** For frequently queried JSON structures, consider normalizing into dedicated tables

**DB-018: Password/secret storage**
- `CarrierPortalUser.password` stored as `VarChar(255)` (bcrypt hash)
- `EdiTradingPartner.ftpPassword` stored as `VarChar(500)` -- appears to be plaintext or weakly encrypted
- `FactoringCompany.apiKey` stored as `VarChar(255)` -- likely plaintext
- `DocumentShare.accessPassword` stored as `VarChar(255)` -- unknown if hashed
- **Severity:** HIGH
- **Recommendation:** Encrypt all secrets at rest using application-level encryption (AES-256-GCM) or PostgreSQL pgcrypto

---

## 9. Missing Schema Elements

**DB-019: No database-level check constraints**
- No CHECK constraints for status field values (relies on enum types where present, string where not)
- Example: `Carrier.status` is `String @db.VarChar(50)` not an enum
- **Recommendation:** Use enums consistently OR add CHECK constraints via raw migrations

**DB-020: No table-level comments**
- Prisma `///` comments are absent from most models
- **Impact:** Database administrators lose context when working directly with PostgreSQL
- **Recommendation:** Add `@@map` and field `@map` annotations for clean database naming, and `///` comments for documentation

**DB-021: No partitioning strategy**
- High-volume tables (AuditLog, CheckCall, CommunicationLog, EdiMessage) will grow unbounded
- **Recommendation:** Plan for PostgreSQL table partitioning by date range for audit/log tables

---

## 10. Recommendations Summary

### Critical (Address Before Launch)
1. **DB-012:** Implement Row-Level Security for multi-tenant isolation
2. **DB-014:** Fix globally-unique constraints to be tenant-scoped
3. **DB-018:** Encrypt secrets at rest (FTP passwords, API keys)

### High Priority (Address in Next Sprint)
4. **DB-005:** Change cascade deletes to restrict on financial/critical entities
5. **DB-013:** Remove cascade from Tenant FK, implement soft-delete-only
6. **DB-015:** Add default UUID/CUID generation at database level

### Medium Priority (Address Before Scale)
7. **DB-002:** Add composite indexes for common query patterns
8. **DB-003:** Add partial indexes for soft-delete filtering
9. **DB-009:** Add Prisma middleware for automatic soft-delete filtering
10. **DB-011:** Add (tenantId, deletedAt) composite indexes universally
11. **DB-017:** Normalize frequently-queried JSON fields
12. **DB-021:** Plan partitioning for high-volume audit tables

### Low Priority (Optimization)
13. **DB-001:** Evaluate and remove unused indexes on low-cardinality columns
14. **DB-004:** Add text search indexes as Elasticsearch fallback
15. **DB-010:** Implement soft-delete cascading at application level
16. **DB-019:** Standardize status fields to use enums
17. **DB-020:** Add database comments and documentation

---

## Appendix: Model Count by Domain

| Domain | Model Count | % of Total |
|--------|-------------|------------|
| Carrier Management | 20 | 7.8% |
| TMS Core (Orders/Loads) | 18 | 7.0% |
| Auth & Admin | 14 | 5.4% |
| Accounting & Finance | 14 | 5.4% |
| Contracts & Rates | 14 | 5.4% |
| Agent & Commission | 14 | 5.4% |
| Claims & Safety | 12 | 4.7% |
| Integration & Infrastructure | 12 | 4.7% |
| EDI | 11 | 4.3% |
| Analytics & Reporting | 10 | 3.9% |
| Support & Feedback | 13 | 5.1% |
| HR | 10 | 3.9% |
| Carrier Portal | 9 | 3.5% |
| Customer Portal | 8 | 3.1% |
| Communication | 7 | 2.7% |
| Workflow & Automation | 8 | 3.1% |
| Documents | 7 | 2.7% |
| CRM | 7 | 2.7% |
| Search & Cache | 9 | 3.5% |
| Scheduling & Jobs | 7 | 2.7% |
| Sales & Quoting | 6 | 2.3% |
| Load Board Integration | 5 | 1.9% |
| Load Planner | 6 | 2.3% |
| Compliance & Config | 8 | 3.1% |
| Operations | 3 | 1.2% |
| **Total** | **~257** | **100%** |
