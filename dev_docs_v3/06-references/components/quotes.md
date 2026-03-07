# Quotes Components

**Path:** `apps/web/components/quotes/`

## Files

| Component | File | LOC | Description |
|-----------|------|-----|-------------|
| CustomerForm | `customer-form.tsx` | 516 | Quote-specific customer info form (differs from CRM customer form) |
| EmailSignatureDialog | `email-signature-dialog.tsx` | 191 | Dialog for composing and sending quote emails with signature |

**Total:** 2 files, ~707 LOC

## Notes

This is a small directory. The main sales/quote components live in `apps/web/components/sales/` which has `QuoteFormV2`, `QuoteActionsBar`, `QuoteDetailOverview`, `QuoteRateSection`, `QuoteStopsBuilder`, etc.

## Usage Patterns

- `CustomerForm` - Used in the quote creation flow for entering customer details
- `EmailSignatureDialog` - Used from quote detail pages to email quotes to customers

## Dependencies

- `@/components/ui/` (shadcn primitives)
- React Hook Form + Zod
- Email template rendering for `EmailSignatureDialog`
