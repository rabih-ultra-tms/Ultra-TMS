# Frontend Architecture Standards

> Source: `dev_docs/08-standards/68-frontend-architecture-standards.md`
> Stack: Next.js 16 (App Router), React 19, Tailwind 4

## Folder Structure

```
apps/web/
  app/
    (auth)/         → Public pages (login, register)
    (dashboard)/    → Protected pages (all TMS screens)
  components/
    ui/             → shadcn/ui base components
    tms/            → TMS-specific components (31 approved)
    shared/         → Cross-module shared components
  lib/
    api/            → API client, axios instance
    hooks/          → Custom React hooks (51 total)
    utils/          → Utility functions
  types/            → TypeScript type definitions
```

## Path Aliases

- `@/*` → web app root
- `@repo/ui` → shared UI package

## State Management

- **Server state:** React Query (TanStack Query) — ALL API data
- **Client state:** Zustand — UI-only state (sidebar open, selected tab)
- **Form state:** React Hook Form + Zod validation

```typescript
// React Query pattern
const { data, isLoading, error } = useQuery({
  queryKey: ['carriers', { page, search }],
  queryFn: () => carrierApi.list({ page, search }),
});

// Mutation pattern
const mutation = useMutation({
  mutationFn: carrierApi.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['carriers'] });
    toast.success('Carrier created');
  },
});
```

## Page Template (REQUIRED)

Every page MUST handle 4 states:

```tsx
export default function CarriersPage() {
  const { data, isLoading, error } = useCarriers();

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorState message={error.message} />;
  if (!data?.length) return <EmptyState title="No carriers" />;

  return <DataTable data={data} columns={columns} />;
}
```

## API Client Pattern

```typescript
// Use the proxy — NEVER call :3001 directly from client
const response = await apiClient.get('/api/v1/carriers');
const carriers = response.data.data; // Axios .data + API envelope .data
```

## Form Pattern

```tsx
const form = useForm<CreateCarrierDto>({
  resolver: zodResolver(createCarrierSchema),
  defaultValues: { legalName: '', status: 'PENDING' },
});

const onSubmit = form.handleSubmit(async (data) => {
  await mutation.mutateAsync(data);
});
```

## Component Rules

1. **No `any` types** — always type props and state
2. **No inline styles** — use Tailwind classes
3. **No browser `confirm()`** — use `<ConfirmDialog />`
4. **No `console.log`** — remove before commit
5. **Every button needs onClick** — no empty handlers
6. **Every link needs href** — no dead links
7. **Loading states required** — skeleton or spinner
8. **Error states required** — error boundary or inline error
9. **Empty states required** — illustration + CTA
