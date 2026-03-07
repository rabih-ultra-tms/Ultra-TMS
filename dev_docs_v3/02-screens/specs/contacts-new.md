# Contacts New

**Route:** `/contacts/new`
**File:** `apps/web/app/(dashboard)/contacts/new/page.tsx`
**LOC:** 45
**Status:** Complete

## Data Flow

- **Hooks:** `useCreateContact` (`lib/hooks/crm/use-contacts`)
- **API calls:** `POST /api/v1/crm/contacts`
- **Envelope:** `response.data.id` -- correct double-unwrap

## UI Components

- **Pattern:** FormPage (thin wrapper around ContactForm)
- **Key components:** PageHeader, ContactForm, Button
- **Interactive elements:** Form fields, submit button, "Back" button. All wired.

## State Management

- **URL params:** `?companyId` read via `useSearchParams` -- pre-populates company field. Redirects to `/companies/{companyId}/contacts` if companyId present, else `/contacts/{id}`.
- **React Query keys:** Via `useCreateContact` mutation

## Quality Assessment

- **Score:** 7/10
- **Bugs:** None
- **Anti-patterns:** `useSearchParams` not wrapped in Suspense boundary
- **Missing:** States delegated to ContactForm.
