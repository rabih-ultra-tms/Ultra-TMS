# API Envelope Patterns Guide

**Purpose:** Exhaustive guide to unwrapping API responses in Ultra TMS frontend code.

---

## The Standard Envelope

Every API response wraps data in a `{ data: T }` envelope:

```typescript
// Backend returns:
{ data: { id: 1, name: "Acme Corp" } }

// Frontend receives via axios:
const response = await api.get('/crm/companies/1');
// response.data = { data: { id: 1, name: "Acme Corp" } }
// response.data.data = { id: 1, name: "Acme Corp" }  ← THIS IS WHAT YOU WANT
```

---

## The #1 Anti-Pattern

```typescript
// WRONG — gets the envelope, not the data
const company = response.data;
// company = { data: { id: 1, name: "Acme Corp" } }

// RIGHT — unwraps the envelope
const company = response.data.data;
// company = { id: 1, name: "Acme Corp" }
```

---

## Pattern by Response Type

### Single Item

```typescript
// Hook pattern
const fetchCompany = async (id: string) => {
  const { data } = await api.get(`/crm/companies/${id}`);
  return data.data; // unwrap envelope
};

// React Query usage
const { data: company } = useQuery({
  queryKey: ['company', id],
  queryFn: () => fetchCompany(id),
});
// company = { id, name, ... }
```

### List with Pagination

```typescript
// Hook pattern
const fetchCompanies = async (params: ListParams) => {
  const { data } = await api.get('/crm/companies', { params });
  return {
    items: data.data,           // unwrap data array
    pagination: data.pagination  // pagination is at envelope level
  };
};

// Response shape:
// {
//   data: Company[],
//   pagination: { page: 1, limit: 20, total: 100, totalPages: 5 }
// }
```

### Mutation Response

```typescript
// Hook pattern
const createCompany = async (dto: CreateCompanyDto) => {
  const { data } = await api.post('/crm/companies', dto);
  return data.data; // unwrap envelope
};
```

### Error Response

```typescript
// Error shape (thrown by axios interceptor):
{
  error: "Company not found",
  code: "NOT_FOUND",
  details: { id: "invalid-uuid" }
}

// Catch pattern:
try {
  await createCompany(dto);
} catch (error) {
  if (axios.isAxiosError(error)) {
    const { error: message, code } = error.response?.data ?? {};
    toast.error(message ?? 'An error occurred');
  }
}
```

---

## Known Envelope Divergences

These endpoints do NOT follow the standard envelope:

| Endpoint | Actual Response | Expected |
|----------|----------------|----------|
| `GET /communication/notifications/unread-count` | `{ count: number }` | `{ data: { count: number } }` |
| `GET /health` | `{ status: "ok" }` | N/A (public endpoint) |
| `GET /ready` | `{ status: "ready", db: "ok" }` | N/A (public endpoint) |

---

## Carrier Module Pagination Divergence

Carrier module uses `skip/take` instead of `page/limit`:

```typescript
// Standard (most modules):
GET /crm/companies?page=1&limit=20

// Carrier (divergent):
GET /carriers?skip=0&take=20

// Both return:
{ data: T[], pagination: { page, limit, total, totalPages } }
```

---

## React Query Key Conventions

```typescript
// List queries
queryKey: ['companies', { page, limit, search, status }]

// Detail queries
queryKey: ['company', id]

// Dashboard queries
queryKey: ['accounting-dashboard']

// Mutation invalidation
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['companies'] });
}
```
