# TRIBUNAL-07: The 260-Model Question -- Is the Data Model Right?

> **Debate topic:** 260 Prisma models, 114 enums, 9,938 schema lines -- over-engineered for a pre-revenue startup, or justified investment?
> **Filed:** 2026-03-07
> **Evidence base:** `00-evidence-pack.md`, `03-multi-tenant-patterns.md`, `technical-debt.md`
> **Verdict:** MODIFY

---

## Opening Statement: Prosecution

Your Honor, the defense will tell you this schema is "comprehensive." I will tell you it is a liability.

Ultra TMS has 260 Prisma models. The product has zero paying customers. Zero revenue. Zero production traffic. Let me put that in perspective: McLeod Software, a 40-year-old enterprise TMS with thousands of active brokerages, handles the same domain. Ultra TMS has built a schema that rivals theirs in breadth -- before shipping a single invoice.

The schema is 9,938 lines long. That is not a schema; it is a novel. Prisma client generation scales with model count. Every developer who runs `prisma generate` pays a time tax. Every migration touches a schema so large that merge conflicts are near-certain when two developers work on different modules. With 31 migrations already landed and 40 backend modules in play, this will only worsen.

But the real indictment is not size -- it is timing. The Agent module alone has 9 models. The Agent module is P3. It will not be built for six months at minimum, possibly a year. The Compliance module, the Fleet module, the Warehousing module -- all have fully defined models for services that exist only as documentation. These are not "investments." They are speculative schema that must be maintained, migrated, and indexed despite serving zero queries.

Every one of these 260 models carries migration-first fields: `external_id`, `source_system`, `custom_fields`. That is three columns per model -- 780 additional columns across the schema -- for a migration scenario that may never occur. Not every broker migrating from Aljex needs custom fields on their `AgentCommissionTier` model. These fields are a bet placed on every table, regardless of whether anyone will ever migrate data into it.

Then there are the enums. 114 of them. Some are essential (LoadStatus, InvoiceStatus). But how many are actually referenced by application code today? Has anyone audited which enums are imported versus which sit dormant in the schema, contributing to generation time and cognitive load?

Finally, consider the soft delete tax. 248 of 260 models have `deletedAt`. Every query against these models must include `WHERE deletedAt IS NULL`. With FMCSA's 7-year retention requirement, tables like `loads`, `check_calls`, and `audit_logs` will accumulate millions of soft-deleted rows. The evidence pack documents this clearly: at an 80% soft-delete ratio, JOIN operations scan 25x more data than necessary. And Prisma does not support partial indexes natively -- the mitigation requires raw SQL migrations that nobody has written.

260 models is not a data model. It is a wish list cast in PostgreSQL.

---

## Opening Statement: Defense

Your Honor, the prosecution wants you to believe that having a complete data model is a sin. In reality, it is the single smartest decision this project made early.

Let me address the elephant: yes, 260 models for a pre-revenue product sounds large. But consider the domain. Ultra TMS is not a todo app. It is a multi-tenant 3PL brokerage platform spanning CRM, quoting, order management, load execution, carrier management, accounting (invoices, settlements, payments), commission tracking, document management, customer portals, carrier portals, compliance, and claims. That is not one application -- it is an ERP for freight brokerage.

The 260 models break down naturally:

- **Core transactional:** Orders, Loads, Stops, CheckCalls, RateConfirmations, BOLs -- these are the heartbeat of any TMS. Roughly 60-70 models.
- **Carrier management:** Carriers, Insurance, Trucks, Drivers, Contacts, Scorecard -- another 30-40 models. Required for FMCSA compliance.
- **Accounting:** Invoices, Settlements, Payments, LineItems, AgingReport -- 20-30 models. You cannot bill a broker without these.
- **CRM + Sales:** Customers, Contacts, Quotes, QuoteLineItems -- 20-25 models.
- **Multi-tenant + Auth:** Tenants, Users, Roles, Permissions, Sessions, AuditLogs -- 15-20 models.
- **P1-P3 modules:** The remainder. Yes, these are defined early. That is intentional.

The prosecution calls P2/P3 models "speculative." I call them migration-first architecture -- and that is not a buzzword, it is a business requirement. Ultra TMS targets brokers migrating from McLeod, Aljex, and Tai. Those systems have existing data. The `external_id` and `source_system` fields on every model exist because when a broker migrates 50,000 loads from McLeod, every record needs a traceable link back to the source system. The `custom_fields` JSON column exists because every brokerage has proprietary fields that no schema can anticipate. These are not speculative columns. They are contractual requirements for any migration deal.

As for the 114 enums -- they provide compile-time type safety. Every `LoadStatus` transition, every `InvoiceStatus` check, every `CarrierStatus` guard uses an enum rather than a magic string. The alternative is `status: string` with runtime validation that catches errors in production instead of at schema-definition time. The prosecution asks how many enums are "used." I ask: what is the cost of an unused enum? Zero runtime impact. Zero storage. The Prisma schema is a declaration, not an execution.

The schema is already built. It works. The 31 migrations all apply cleanly. The 72 tests all pass against this schema. Removing models now would require new migrations, risk breaking existing code that references those models (even if only in types), and gain nothing -- you cannot reclaim PostgreSQL catalog space by dropping empty tables, and Prisma generation time is measured in seconds, not minutes.

The defense rests on a simple principle: in a domain this complex, having the data model right from the start is cheaper than retrofitting it later.

---

## Cross-Examination

**PROSECUTION:** How many of the 260 models are actually queried by the 9 P0 MVP services?

**DEFENSE:** The P0 services (Auth, CRM, Sales, TMS Core, Carriers, Accounting, Load Board, Commission) collectively touch approximately 140-160 models. The remaining 100-120 are referenced by P1-P3 modules.

**PROSECUTION:** So roughly 40% of the schema serves modules that will not be built for months. Are there models that no service -- P0 through P3 -- actually references in application code today?

**DEFENSE:** Possibly. We have not run a full orphan scan. But "no code references it today" does not mean "no code will reference it." The models are defined in the service hub documents. They have a purpose.

**PROSECUTION:** What is the actual Prisma client generation time with 260 models?

**DEFENSE:** On the development machines, `prisma generate` completes in 8-15 seconds. It is not a bottleneck.

**PROSECUTION:** 8-15 seconds every time a developer modifies the schema. Across a team, across a day, that adds up. But let me move to the soft delete concern. The evidence pack documents that 248 models have `deletedAt`. Your team has zero partial indexes. The multi-tenant research brief explicitly states that without partial indexes, a table with 80% soft-deleted rows sees 5x index bloat. With 7-year retention and high-frequency tables like `check_calls` and `audit_logs`, when does this become a production emergency?

**DEFENSE:** Not for years. The product has no production traffic. When traffic arrives, we add partial indexes via raw SQL migrations. The archival strategy is documented in the multi-tenant brief. This is a known future task, not an emergency.

**PROSECUTION:** It is a known future task that will be dramatically harder to execute across 248 tables than across 50. Every model you add now is a table you must index, archive, and manage later. The schema's size is not just a present cost -- it is a compounding future liability.

**DEFENSE:** Agreed that indexing 248 tables is more work than 50. But the alternative -- deleting models now and re-creating them later -- costs more in migration churn and lost type safety than keeping them does in future indexing work.

---

## Verdict: MODIFY

The data model is architecturally sound but operationally premature in scope. The core transactional models (P0/P1) are necessary and well-designed. The migration-first fields (`external_id`, `source_system`, `custom_fields`) are justified by the target market. The enum strategy is correct.

However, 100+ models for services that will not be built for 6+ months carry real maintenance cost: migration conflicts, schema cognitive load, and a growing soft-delete indexing debt that nobody is addressing.

### Required Actions

| # | Action | Effort | Rationale |
|---|--------|--------|-----------|
| 1 | **Add `// @deferred(P2)` or `// @deferred(P3)` comments** above every model block belonging to a non-P0/P1 service | 2 hours | Makes it explicit which models are speculative. Enables automated scanning to separate "active" from "planned." |
| 2 | **Run an orphan model audit** -- identify any model that has zero references in `apps/api/src/` application code (not just the schema) | 2-3 hours | If a model is not referenced by any service, controller, or DTO, it is dead weight. Remove or explicitly document why it exists. |
| 3 | **Add compound partial indexes** on the 10 highest-traffic tables via raw SQL migration: `(tenant_id, ...) WHERE deleted_at IS NULL` | 4-8 hours | Addresses the soft-delete bloat risk before it becomes a production problem. The multi-tenant brief already specifies the exact SQL. |
| 4 | **Audit the 114 enums** for actual import usage in application code | 1-2 hours | Unused enums should be commented as `@deferred` like unused models. |
| 5 | **Do NOT delete P2/P3 models** -- the cost of removal exceeds the cost of retention | 0 hours | Removing models requires migrations, risks type breakage, and gains negligible performance. The models stay; they just get labeled. |

### Sentencing

The 260-model schema is not over-engineered -- it is over-deployed. The models are correct; their timing is not. Label the deferred models, index the active tables, audit for orphans, and move on. The schema is an asset, not a liability -- but only if the team treats P2/P3 models as documentation rather than active infrastructure.

**Final grade for data model: 7/10** -- Comprehensive and well-structured, docked for premature scope and missing indexing strategy.

---

*Tribunal-07 closed. Evidence preserved in `00-evidence-pack.md` and `03-multi-tenant-patterns.md`.*
