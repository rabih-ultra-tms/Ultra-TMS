# QS-013: BOL (Bill of Lading) PDF Generation

**Priority:** P0
**Effort:** M (1 week)
**Status:** planned
**Assigned:** Claude Code
**Source:** Tribunal verdict TRIBUNAL-02, TRIBUNAL-04, TRIBUNAL-10

---

## Objective

Generate Bill of Lading PDFs from Order/Load/Stops data using the shared PDF engine from QS-012.

## Context

BOL is a legally required shipping document. Every load must have a BOL before pickup. Currently not built. Shares PDFKit engine with rate con (QS-012).

## Files

- Modify: PDF service from QS-012 — add `generateBolPdf(order, load, stops)` method
- Create: BOL template
- Modify: Loads controller — add POST endpoint
- Create: Frontend button on Load Detail page

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/v1/loads/:id/bol` | Generate BOL PDF |

## Acceptance Criteria

- [ ] `generateBolPdf()` returns valid PDF Buffer
- [ ] BOL includes: shipper/consignee, commodity, weight, piece count, special instructions, hazmat (if applicable)
- [ ] Standard BOL format recognizable by carriers
- [ ] Frontend button on Load Detail generates/downloads BOL
- [ ] Tests verify data mapping and PDF output

## Dependencies

- QS-012 (shared PDF engine must exist first)
