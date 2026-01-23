# Core CRM Implementation Checklist

- [x] Update CRM API controllers to support PATCH updates (companies, contacts, leads).
- [x] Add `leadId` support in activity DTOs and map to `opportunityId` in services.
- [x] Align web CRM hooks/types with API PATCH and activity fields (`dueDate`, `leadId`).
- [x] Add Contacts create and edit pages in the web app.
- [x] Add Lead detail inline summary sections (top 3 contacts, recent activities).
- [x] Add Lead contacts and Lead activities pages and wire “View all” links.
- [x] Wire Activity logging UI to create activities.
