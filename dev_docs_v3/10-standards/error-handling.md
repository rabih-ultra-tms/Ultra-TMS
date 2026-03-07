# Error Handling Standards

> Source: `dev_docs/08-standards/` (consolidated)
> Covers: Backend exceptions, frontend error boundaries, user feedback

## Backend Error Handling

### NestJS Exceptions

```typescript
// Use built-in exceptions — never throw raw errors
throw new NotFoundException('Carrier not found');
throw new BadRequestException('Invalid status transition');
throw new ForbiddenException('Insufficient permissions');
throw new ConflictException('Duplicate invoice number');
throw new UnauthorizedException('Invalid credentials');
throw new UnprocessableEntityException('Validation failed');
```

### Global Exception Filter

The global exception filter in `main.ts` catches all exceptions and returns the standard error format:

```json
{
  "error": "Human-readable message",
  "code": "NOT_FOUND",
  "details": { "entity": "Carrier", "id": "abc-123" }
}
```

### Service Layer Pattern

```typescript
async findOne(id: string, tenantId: string): Promise<Carrier> {
  const carrier = await this.prisma.carrier.findFirst({
    where: { id, tenantId, deletedAt: null },
  });
  if (!carrier) {
    throw new NotFoundException(`Carrier ${id} not found`);
  }
  return carrier;
}
```

### Validation Errors

DTO validation via `class-validator` automatically returns 400 with field-level errors:

```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "legalName": ["legalName must be a string"],
    "mcNumber": ["mcNumber must be shorter than 20 characters"]
  }
}
```

## Frontend Error Handling

### Error Boundaries

```tsx
// Wrap page content in error boundary
<ErrorBoundary fallback={<ErrorState message="Something went wrong" />}>
  <PageContent />
</ErrorBoundary>
```

### React Query Error Handling

```tsx
const { data, error, isLoading } = useQuery({
  queryKey: ['carriers'],
  queryFn: carrierApi.list,
  retry: 2,  // Retry failed requests twice
});

if (error) {
  return <ErrorState message={error.message} onRetry={() => refetch()} />;
}
```

### Mutation Error Handling

```tsx
const mutation = useMutation({
  mutationFn: carrierApi.create,
  onError: (error: AxiosError<ErrorResponse>) => {
    const message = error.response?.data?.error ?? 'Failed to create carrier';
    toast.error(message);
  },
});
```

### Form Validation Errors

```tsx
// Zod schema validates before submission
const schema = z.object({
  legalName: z.string().min(1, 'Legal name is required'),
  mcNumber: z.string().max(20).optional(),
});

// Server errors mapped to form fields
const onSubmit = async (data: FormData) => {
  try {
    await mutation.mutateAsync(data);
  } catch (error) {
    if (isValidationError(error)) {
      Object.entries(error.details).forEach(([field, messages]) => {
        form.setError(field, { message: messages[0] });
      });
    }
  }
};
```

## User Feedback

| Action | Feedback |
|--------|----------|
| API loading | Skeleton or spinner (never bare "Loading...") |
| Success | Toast notification (green) |
| Error | Toast notification (red) + keep form data |
| Empty results | EmptyState component with illustration |
| Network error | Error banner with retry button |
| 401 Unauthorized | Redirect to login |
| 403 Forbidden | "Access denied" page |
