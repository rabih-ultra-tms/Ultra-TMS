# QS-012: Rate Confirmation PDF Generation

**Priority:** P0
**Effort:** M (1-2 weeks)
**Status:** planned
**Assigned:** Claude Code
**Source:** Tribunal verdict TRIBUNAL-02, TRIBUNAL-04, TRIBUNAL-10

---

## Objective

Extend the existing PDFKit-based `pdf.service.ts` to generate Rate Confirmation PDFs from Load data. Wire up generate/send workflow end-to-end.

## Context

Rate confirmation is a table-stakes feature for any TMS. Every load assigned to a carrier must have a rate con document confirming the rate, terms, and shipment details. The frontend page already exists at `/operations/loads/[id]/rate-con` (9/10 quality) with Generate/Download/Email buttons.

## Files

- Modify: `apps/api/src/modules/accounting/services/pdf.service.ts` — add `generateRateConPdf(load)` method
- OR Create: `apps/api/src/modules/tms/services/document-generation.service.ts`
- Create: Rate confirmation PDF template
- Modify: `apps/api/src/modules/tms/loads.controller.ts` — add POST endpoints
- Test: `*.spec.ts` for PDF generation

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/v1/loads/:id/rate-confirmation/generate` | Generate rate con PDF |
| POST | `/api/v1/loads/:id/rate-confirmation/send` | Email rate con to carrier |

## Acceptance Criteria

- [ ] `generateRateConPdf(load)` returns valid PDF Buffer
- [ ] PDF includes: company header, load details, rates, pickup/delivery, terms, signature line
- [ ] Send endpoint emails PDF to carrier's primary contact
- [ ] Load model updated: `rateConfirmationSent` timestamp set on send
- [ ] Frontend Generate/Download/Email buttons work end-to-end
- [ ] Tests verify data mapping and PDF buffer output
