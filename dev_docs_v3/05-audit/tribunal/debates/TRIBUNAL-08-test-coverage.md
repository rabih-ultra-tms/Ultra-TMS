# TRIBUNAL-08: 8.7% Test Coverage -- What Is the Real Risk?

> **Debate topic:** 72 tests, 8.7% frontend coverage, 0 E2E tests -- is this acceptable for a multi-tenant financial system?
> **Filed:** 2026-03-07
> **Evidence base:** `00-evidence-pack.md`, `testing-standards.md`, `technical-debt.md`
> **Verdict:** MODIFY

---

## Opening Statement: Prosecution

Your Honor, I want to be precise about what 8.7% test coverage means for Ultra TMS.

This is a multi-tenant platform that handles freight invoices, settlement payments, and commission calculations. Real money. Real brokers. Real liability. And 91.3% of the frontend code has never been executed by a test. The backend is slightly better at roughly 15%, which still means 85% of server-side logic -- including the code that calculates how much a carrier gets paid -- runs on faith alone.

Let me present the distribution of the 72 existing tests:

- **45 tests** cover the Carrier module. One module. That is 62.5% of all tests concentrated on a single service out of nine P0 services.
- **14 tests** cover Commission frontend components.
- **13 suites** cover Load Board.
- **0 tests** cover Accounting. Zero. The module responsible for invoices, settlements, and payments -- the module that will move real dollars between real companies -- has never had a single assertion run against it.
- **0 tests** cover the Dashboard.
- **0 tests** cover Sales/Quotes.
- **0 tests** cover TMS Core frontend (the 12 pages for orders, loads, and dispatch).
- **0 E2E tests.** Playwright is configured. The test files are empty. Nobody has verified that the 98 frontend routes even render without crashing.

The prosecution's core argument is not that 8.7% is low. Every startup has low test coverage early. The argument is that 8.7% coverage on a **financial, multi-tenant system** is a category of risk that transcends normal startup tradeoffs.

Consider what is untested:

1. **Invoice total calculation.** Line items, taxes, discounts, currency handling. If the calculation is wrong by one cent on every invoice, a brokerage processing 500 loads per month accumulates a $60/year discrepancy per client. Multiply by tenants. Now it is an audit finding.

2. **Commission split logic.** Percentage-based, flat-rate, and tiered commission structures exist in the schema. The Commission module has 14 frontend tests but zero backend tests. The actual split calculation -- the part that determines how much a sales rep earns -- is untested server-side.

3. **Settlement reconciliation.** The process that reconciles carrier pay against billed amounts. A bug here means a carrier gets overpaid or underpaid. Underpay a carrier and they stop hauling your loads. Overpay and you eat the margin. Neither outcome is acceptable. Neither outcome is tested.

4. **Tenant isolation.** The multi-tenant research brief documents 801 `tenantId` references across the schema. Every query must include a tenant filter. Zero systematic tests verify that an endpoint cannot return Tenant B's data when called by Tenant A. The evidence pack documents real-world tenant data leaks at Adobe Analytics, Microsoft Azure, and AWS AppSync -- all caused by missing isolation at a single layer. Ultra TMS has one layer of isolation (application-level WHERE clauses) and zero tests verifying it works.

The technical debt registry categorizes "Missing tests" as covering approximately 90% of the code. The testing standards document defines a financial module mandate: Accounting, Commission, and Settlement must reach 20% coverage before any production deployment. That mandate exists because the team acknowledges the risk. But the mandate is a document, not a test. It has not been enforced.

Finally, QS-008 -- the Playwright runtime verification task that would determine how many of the 98 routes actually render -- has not been executed. It is listed as P0 in the Quality Sprint. It remains in "planned" status. Every day it remains unrun is a day the team does not know whether their own application works.

A competitor demo that crashes on a financial screen is worse than no demo at all. Ultra TMS is one bad invoice calculation away from losing its first client before acquiring them.

---

## Opening Statement: Defense

Your Honor, the prosecution presents 8.7% as a verdict. I present it as a starting point with a documented plan to improve.

First, context. Ultra TMS is pre-launch. There are no paying customers. There is no production deployment. The financial calculations the prosecution dramatizes are not processing real money today -- they are processing test data in a development environment. The risk of a calculation bug is not "a carrier gets underpaid." The risk is "the development team finds the bug during QA before launch." That is a fundamentally different risk profile.

Second, the 72 tests that exist all pass. There are no red tests, no skipped suites, no flaky assertions. The test infrastructure works: Jest 29 on the backend with Supertest, Jest 30 on the frontend with Testing Library and MSW, SWC alias resolution configured, Playwright installed and configured. The pipeline is ready. The tests simply have not been written yet for most modules -- which is a prioritization decision, not a technical failure.

Third, the Carrier module's 45 tests prove the team can write thorough tests when they choose to. The carrier module has approximately 70% coverage. It was prioritized because it was the first module built to production quality. The same discipline will be applied to other modules during the Quality Sprint.

Fourth, the Sonnet audit serves as a de facto coverage mechanism. 62 bugs were found across the codebase. 57 were fixed. That audit exercised code paths that no unit test covers. It is not a substitute for automated tests, but it is not nothing either. The codebase has been reviewed by multiple AI models (Claude, Gemini, Sonnet) and a human developer. The probability of a catastrophic financial bug surviving all those reviews is low.

Fifth, the testing standards document is not aspirational -- it is a binding contract for the Quality Sprint. The coverage milestones are specific:

| Milestone | Target | Key Gate |
|-----------|--------|----------|
| Quality Sprint end (+2 weeks) | 15% FE, 25% BE | 120+ tests |
| Pre-Production gate (+6 weeks) | 25% FE, 40% BE | All P0 services >= 20% |
| v1.0 launch (+12 weeks) | 40% FE, 50% BE | All P0 services >= 40% |

The financial module mandate explicitly blocks production deployment until Accounting, Commission, and Settlement reach 20%. That is not a suggestion -- it is a gate. The team cannot ship without it.

Sixth, the architecture supports testability. NestJS provides dependency injection. Every service can have its Prisma dependency mocked. DTOs use class-validator decorators that can be tested in isolation. Guards and interceptors are composable and testable. The codebase was designed for testing even if testing has not yet been prioritized. This is a critical distinction: writing tests against a well-structured codebase is a matter of hours per module. Writing tests against spaghetti code is a matter of weeks.

The defense does not claim 8.7% is acceptable for production. The defense claims it is acceptable for the current development phase, with a credible plan to reach production-ready coverage before any money moves through the system.

---

## Cross-Examination

**PROSECUTION:** What specific financial calculations exist in the codebase today? Name the service methods. Are any of them tested?

**DEFENSE:** The `InvoiceService` has `calculateTotal` logic. The `CommissionService` has `calculateCommission` with support for percentage, flat-rate, and tiered structures. The `SettlementService` has reconciliation logic. None of these specific methods have unit tests today.

**PROSECUTION:** So you are confirming that the three most financially sensitive methods in the entire application have zero test coverage. And your defense is "we will write them later."

**DEFENSE:** Correct. They will be written during the Quality Sprint. The financial mandate prevents production deployment without them.

**PROSECUTION:** The Quality Sprint has been the "current phase" since it was defined. QS-008 is listed as P0. It has not been executed. QS-001 through QS-010 are all in "planned" status. At what point does a plan become an excuse?

**DEFENSE:** The sprint was formally defined on 2026-03-07. Work begins immediately. The plan is days old, not months old.

**PROSECUTION:** How many of the 98 frontend routes crash on load? Right now, today -- do you know?

**DEFENSE:** We do not have a systematic answer. Individual routes have been tested manually during development. QS-008 will provide the definitive answer.

**PROSECUTION:** So the team has built 98 routes and cannot confirm how many of them render. Let me ask about tenant isolation. How many endpoints have been tested for cross-tenant data leakage?

**DEFENSE:** No systematic cross-tenant tests exist. The `TenantInterceptor` and `JwtAuthGuard` are global -- they apply to every endpoint automatically. The architecture enforces isolation by default.

**PROSECUTION:** The multi-tenant research brief documents that "one missed WHERE clause = data leak" and that Ultra TMS has 801 tenantId references with "no database-level fallback." Your global guard sets the context, but every individual Prisma query must still include the filter manually. You have 40 modules, approximately 225 NestJS services, and zero tests verifying that any of them correctly filter by tenant. Architecture is not enforcement. Tests are enforcement.

**DEFENSE:** We acknowledge the gap. Tenant isolation tests are on the roadmap.

**PROSECUTION:** Everything is on the roadmap. Nothing is in the test suite.

---

## Verdict: MODIFY

The risk is real, immediate, and concentrated in the financial and multi-tenant layers. The defense is correct that the project is pre-launch and that the architecture supports rapid test development. But the prosecution is correct that "we will write tests later" has been the plan since inception, and later has not arrived.

8.7% coverage is not inherently disqualifying for a pre-launch product. 0% coverage on financial calculations IS disqualifying for any product that will handle real transactions. The gap between "plan" and "execution" is the core issue.

### Required Actions -- Ordered by Priority

| # | Action | Effort | Deadline | Rationale |
|---|--------|--------|----------|-----------|
| 1 | **Execute QS-008: Playwright route verification** -- confirm which of the 98 routes render without crashing | 4-6 hours | Before ANY new feature work | You cannot improve what you cannot measure. If 30 routes crash on load, every other priority changes. This is the foundation. |
| 2 | **Write 10 financial calculation tests** covering: invoice total (with line items, tax, discount), commission split (percentage, flat, tiered), settlement reconciliation (carrier pay vs billed), and decimal/currency handling (integer cents, no floats) | 6-8 hours | End of Week 1 of Quality Sprint | These are the highest-liability untested code paths in the system. One wrong calculation in production destroys client trust permanently. |
| 3 | **Write 5 tenant isolation tests** -- for each of the 5 highest-traffic endpoints (loads list, carriers list, invoices list, orders list, customers list), verify that Tenant A's auth token returns zero records belonging to Tenant B | 4-6 hours | End of Week 1 of Quality Sprint | The multi-tenant brief documents real-world leaks at Adobe, Azure, and AWS. Zero systematic isolation tests is indefensible for a multi-tenant SaaS. |
| 4 | **Reach 15% overall frontend coverage** (from 8.7%) by adding tests to Accounting, TMS Core, and Dashboard modules | 12-16 hours | End of Quality Sprint (+2 weeks) | Distributes test coverage beyond the Carrier module monopoly. The current 62.5% concentration in one module creates a false sense of security. |
| 5 | **Enforce the financial mandate as a CI gate** -- add a coverage threshold check that fails the build if Accounting + Commission + Settlement modules are below 20% | 2 hours | End of Quality Sprint | A mandate without enforcement is a suggestion. Make the pipeline reject deployments that violate the financial coverage floor. |

### What This Achieves

After these 5 actions (~30-38 hours of work), Ultra TMS moves from:

- **72 tests, 8.7% FE coverage, 0 financial tests, 0 tenant tests, 0 E2E tests**

To approximately:

- **120+ tests, ~15% FE coverage, 10 financial tests, 5 tenant isolation tests, 98-route render verification**

This does not make the test suite comprehensive. It makes it defensible. The difference matters: a client who discovers a bug during onboarding will forgive you. A client who discovers their invoice was calculated wrong will not.

### Sentencing

The prosecution is right that 8.7% on a financial system is professional liability. The defense is right that the architecture supports rapid remediation. The verdict threads the needle: stop building new features until the financial and tenant isolation layers have basic test coverage. The Quality Sprint must deliver tests, not just plan them.

**Final grade for test coverage: 4/10** -- Infrastructure is solid, execution is absent. Grade improves to 6/10 upon completing actions 1-3 above, and 7/10 upon completing all five.

---

*Tribunal-08 closed. Evidence preserved in `00-evidence-pack.md`, `testing-standards.md`, and `technical-debt.md`.*
