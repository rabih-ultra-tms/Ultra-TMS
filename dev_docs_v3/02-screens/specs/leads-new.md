# Leads New

**Route:** `/leads/new`
**File:** `apps/web/app/(dashboard)/leads/new/page.tsx`
**LOC:** 38
**Status:** Complete

## Data Flow

- **Hooks:** `useCreateLead` (`lib/hooks/crm/use-leads`)
- **API calls:** `POST /api/v1/crm/leads`
- **Envelope:** `response.data.id` -- correct double-unwrap for redirect

## UI Components

- **Pattern:** FormPage (thin wrapper around LeadForm)
- **Key components:** PageHeader, LeadForm (`components/crm/leads/lead-form`), Button
- **Interactive elements:** Form fields, submit button, "Back" button. All wired.

## State Management

- **URL params:** None
- **React Query keys:** Via `useCreateLead` mutation

## Quality Assessment

- **Score:** 7/10
- **Bugs:** None
- **Anti-patterns:** None
- **Missing:** States delegated to LeadForm. Submit pending shown ("Saving..."). Redirects to `/leads/{id}`.
