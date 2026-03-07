# UX-015: Print-Friendly Views for Invoices and Rate Confirmations

**Priority:** P1
**Service:** Accounting / Sales
**Scope:** Print-optimized layouts for invoices and rate confirmation documents

## Current State
No print styles exist. Printing an invoice or rate confirmation would include sidebar, navigation, and other UI chrome.

## Requirements
- Print CSS that hides sidebar, header, and navigation
- Invoice print layout with company logo, line items, totals
- Rate confirmation print layout with load details, carrier info, terms
- PDF export option (generate from print view)
- Proper page breaks for multi-page documents

## Acceptance Criteria
- [ ] Invoice print view shows only invoice content
- [ ] Rate confirmation print view shows only document content
- [ ] Company logo and branding included
- [ ] Proper page breaks
- [ ] PDF export button
- [ ] Print from browser (Cmd/Ctrl+P) works correctly

## Dependencies
- Invoice page must be built (P1S accounting tasks)

## Estimated Effort
M
