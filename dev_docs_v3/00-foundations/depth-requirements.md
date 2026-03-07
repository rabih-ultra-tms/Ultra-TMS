# Depth Requirements — Ultra TMS

> **Source:** Master-Starter-Kit/10-generators/DEPTH-REQUIREMENTS.md adapted for Ultra TMS
> **Last Updated:** 2026-03-07
> These thresholds enforce minimum content quality. Shallow docs = shallow development.

---

## Why This Exists

Without enforced depth thresholds, service hubs look complete but contain 2-sentence business rules,
1-endpoint API tables, and generic edge cases. This produces plans that require 6-7 rounds of revision.

---

## Service Hub Depth Requirements

**Minimum total words:** 800

### Required Section Minimums

| Section | Minimum | What Counts |
|---|---|---|
| Business Rules | >=5 rules | Each rule must be a specific constraint, not a restatement of the feature description |
| Data Model Entities | >=3 entities | Each entity must include key fields (>=4 per entity) and relations |
| API Endpoints | >=4 endpoints | Full CRUD minimum. Each must specify method, path, auth, request DTO, response shape |
| Validation Rules | >=5 rules | Field-level validations with specific constraints |
| Error Scenarios | >=3 scenarios | Each must specify trigger condition, error code/message, and recovery action |
| Edge Cases | >=5 cases | Specific scenarios that deviate from the happy path |
| Auth/Permission Matrix | Required | Which roles can perform which operations |
| Dependencies | Required | Explicit list of other services this service depends on |

### Scoring Algorithm (out of 10)

```
# Section completeness (max 5 points)
if business_rules >= 5: score += 1
if data_model_entities >= 3: score += 1
if api_endpoints >= 4: score += 1
if validation_rules >= 5: score += 0.5
if error_scenarios >= 3: score += 0.5
if edge_cases >= 5: score += 0.5
if auth_matrix_exists: score += 0.25
if dependencies_listed: score += 0.25

# Content quality (max 3 points)
if total_words >= 800: score += 1
if total_words >= 1200: score += 0.5
if business_rules_are_specific: score += 0.5
if edge_cases_reference_real_entities: score += 0.5
if api_endpoints_have_full_dtos: score += 0.5

# Cross-referencing (max 2 points)
if entities_match_prisma_schema: score += 0.5
if endpoints_cover_all_crud: score += 0.5
if screen_references_match_routes: score += 0.5
if dependencies_reference_real_services: score += 0.5
```

**Threshold: >=8/10 to pass (P0 service hubs)**

If a hub scores <8/10:
1. Identify which sections are shallow
2. Re-generate ONLY the shallow sections
3. Re-score after expansion
4. Do NOT proceed to writing tasks until hub passes

---

## Screen Spec Depth Requirements

**Minimum total words:** 400

### Required Section Minimums

| Section | Minimum | What Counts |
|---|---|---|
| States | >=4 states | Must include: loading, error, empty, populated |
| Interactions | >=3 interactions | User actions with system responses described |
| Edge Cases | >=3 cases | Screen-specific edge cases |
| Accessibility | >=3 items | ARIA labels, keyboard navigation, focus management |
| Component Tree | >=3 components | Named components that compose the screen |
| Responsive Breakpoints | >=2 breakpoints | Mobile (375px), tablet (768px), desktop (1440px) |
| Data Requirements | Required | Which endpoints, how loading/error states handled |
| Field Specifications | Required (forms) | Every field with label, type, validation, error messages |

**Threshold: >=7/10 to pass**

---

## Task File Depth Requirements

**Minimum total words:** 200

### Required Sections

| Section | Requirement | What Counts |
|---|---|---|
| Context Header | 3-6 specific file paths | Real paths, not generic descriptions |
| Objective | 1-3 sentences | Specific and verifiable |
| File Plan | Specific paths | Every file with exact path |
| Acceptance Criteria | >=3 criteria | Independently testable, observable outcomes |
| Dependencies | Required | Task IDs or "None" |
| Effort Estimate | Required | S/M/L/XL |

### Task Layer Coverage

Every feature must have tasks covering at least **6 of 8 layers**:

| Layer | Description |
|---|---|
| 1. Validator | Input validation, DTO definitions |
| 2. Tests | Unit tests for business logic |
| 3. DB Procedure | Database model, migration, seed |
| 4. Procedure Tests | Integration tests for DB operations |
| 5. Component | UI component implementation |
| 6. Page | Full page/screen assembly |
| 7. E2E | End-to-end test scenario |
| 8. Docs | User documentation |

**Threshold: >=6/8 layers per feature**

---

## Anti-Patterns (Fail Immediately)

### Service Hub Anti-Patterns

| Pattern | Why It Fails | Fix |
|---|---|---|
| "The system manages loads" as a business rule | Restates the feature description | Write: "A load cannot be dispatched without an assigned carrier with valid insurance" |
| Single-entity data model | Most services involve 3+ entities | Document related entities even from other services |
| Only 4 CRUD endpoints | Real services need search, filter, bulk, status-change endpoints | Walk through each user workflow and identify every API call |
| "Validate all required fields" | Not specific | Write: "pickupDate must be a future date; weight must be positive number in lbs" |
| "Handle errors gracefully" | Not actionable | Write: "If carrier not found, return 404 with code CARRIER_NOT_FOUND" |
| "Consider edge cases" | Not specific | Write: "What if two dispatchers assign the same carrier to different loads simultaneously?" |

### Task File Anti-Patterns

| Pattern | Why It Fails | Fix |
|---|---|---|
| "Read the relevant files" | Not specific | List exact paths: "Read apps/api/src/modules/loads/loads.service.ts" |
| "Implement the feature" | Not verifiable | "Implement the Load List page with server-side pagination, status filtering, CSV export" |
| "It works correctly" | Not testable | "Submitting the form with empty pickupDate shows 'Pickup date is required' error" |
| "Create the component" in file plan | Not actionable | "Create apps/web/components/tms/loads/LoadStatusBadge.tsx" |
