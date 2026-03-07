# MetadataCard

**File:** `apps/web/components/tms/shared/metadata-card.tsx`
**LOC:** 74

## Props Interface

```typescript
interface MetadataCardProps {
  createdAt: string;
  updatedAt: string;
  createdByName?: string;
  externalId?: string;
  sourceSystem?: string;
}
```

## Behavior

Card displaying entity metadata for audit/tracking purposes:

- **Created**: Calendar icon + "Created" label + formatted date (`date-fns format(date, 'PPp')`)
- **Last Updated**: Calendar icon + "Last Updated" label + formatted date
- **Created By** (optional): User icon + creator name
- **External ID** (optional): Hash icon + monospace ID (for migration tracking)
- **Source** (optional): Hash icon + source system name

## Used By

- Order detail pages (sidebar metadata)
- Load detail pages
- Any entity detail with migration-first fields (`external_id`, `source_system`)

## Dependencies

- `@/components/ui/` (Card)
- `date-fns` (format)
- Lucide icons (Calendar, User, Hash)

## Known Issues

None. Clean display component.
