# LoadDetailHeader

**File:** `apps/web/components/tms/loads/load-detail-header.tsx`
**LOC:** 194

## Props Interface

```typescript
interface LoadDetailHeaderProps {
  load: Load;
}
```

## Behavior

Header bar for load detail pages with status badge, action dropdown, and email actions.

### Displayed Information

- Load number (title)
- `LoadStatusBadge` showing current status
- Action dropdown menu

### Action Dropdown

Context-sensitive actions based on load status:
- **Edit**: Link to `/operations/loads/{id}/edit`
- **Print**: Print action
- **Copy Load #**: Copy to clipboard
- **Email Actions** (status-dependent):
  - Rate Confirmation (available when dispatched+)
  - Load Tendered (available when tendered/accepted)
  - Pickup Reminder (available from tendered through dispatched)

### Email Integration

Uses `EmailPreviewDialog` (233 LOC) to compose and preview emails before sending. Determines recipient email:
- Carrier emails: `carrier.dispatchEmail` or `carrier.contactEmail`
- Customer emails: `customer.contactEmail` or `customer.email`

## Used By

- `/operations/loads/[id]` - Load detail page header

## Dependencies

- `@/components/tms/loads/load-status-badge`
- `@/components/tms/emails/email-preview-dialog`
- `@/components/ui/` (Button, DropdownMenu)
- `@/types/loads` (Load, LoadStatus)
- Lucide icons (ChevronDown, Edit, Printer, Copy, Mail, Send)
- `next/navigation` (useRouter)

## Known Issues

None. Well-structured header component.
