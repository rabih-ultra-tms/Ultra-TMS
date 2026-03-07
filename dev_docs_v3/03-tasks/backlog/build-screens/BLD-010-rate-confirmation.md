# BLD-010: Rate Confirmation

**Priority:** P0
**Service:** TMS Core
**Route:** `/operations/loads/[id]/rate-con`
**Page file:** `apps/web/app/(dashboard)/operations/loads/[id]/rate-con/page.tsx`

## Current State
Fully built (232 LOC). Two-panel layout: left sidebar with PDF options (include accessorials checkbox, include terms checkbox, custom message textarea) and load summary card; right panel with PDF preview. Actions: Generate, Download, Email to Carrier. Uses `useRateConfirmation` hook for PDF generation/download/email. Blob URL cleanup on unmount via `useEffect`.

## Requirements
- Verify `useRateConfirmation` hook connects to backend PDF generation endpoint
- Email-to-carrier needs email service integration (BACK-015)
- PDF preview component needs to render generated PDF
- Rate con template must include all required legal/operational information

## Acceptance Criteria
- [ ] All interactive elements work (buttons, forms, links)
- [ ] API calls succeed with proper error handling
- [ ] Loading, error, and empty states handled
- [ ] Responsive layout
- [ ] TypeScript strict -- no `any` types
- [ ] PDF generates with correct load/carrier/rate data
- [ ] Download produces valid PDF file
- [ ] Email sends to carrier contact

## Dependencies
- Backend: `POST /loads/:id/rate-con`, `POST /loads/:id/rate-con/email`, RateConfirmationService in TMS module
- Hook: `apps/web/lib/hooks/tms/use-rate-confirmation.ts`
- Components: `RateConPreview`, `DocumentActions`

## Estimated Effort
M
